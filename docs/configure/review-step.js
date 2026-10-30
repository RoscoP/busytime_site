// BusyTime configurator v1.0.11
import { DAY_LABELS, TOP_LEVEL_ORDER } from './config.js?v=1.0.11';
import { PROVIDER_TYPES } from './connection-tests.js?v=1.0.11';
import { activeDisplayKeys, configuredDisplayKeys, displayLabel, ensureDefaults, formatOffset, getDisplayConfig, hasHardErrors } from './helpers.js?v=1.0.11';
import { hourLabel } from './schedule-step.js?v=1.0.11';
import { gotoStep } from './sidebar.js?v=1.0.11';
import { markClean, settings } from './state.js?v=1.0.11';
import { el, getValidationBuckets, sortedBucketKeys, stepLabel } from './validation.js?v=1.0.11';
export { renderReviewSummary, renderReviewStep, downloadSettings, saveAsSettings };
let saveStatusEl = null;
function renderReviewSummary() {
    const summary = el('section', { class: 'review-summary', 'aria-labelledby': 'review-summary-title' });
    summary.appendChild(el('h3', { id: 'review-summary-title' }, ['Configuration summary']));
    const wifiNames = Object.keys(settings.wifis);
    const dayNames = settings.calendar_days.slice().sort().map((day) => DAY_LABELS[day]).join(', ') || 'None';
    const displays = activeDisplayKeys().map(displayLabel);
    const providers = Object.keys(settings.calendars).map((type) => (PROVIDER_TYPES[type] || {}).label || type);
    const rows = [
        ['WiFi networks', wifiNames.length ? wifiNames.join(', ') : 'None'],
        ['Operating mode', settings.test_mode ? `${settings.test_mode} test` : 'Normal operation'],
        ['Timezone', `${settings.calendar_timezone_name} (UTC${formatOffset(settings.calendar_timezone_offset)})`],
        ['Checking schedule', `${hourLabel(settings.calendar_hour_start)} to ${hourLabel(settings.calendar_hour_end)} on ${dayNames}`],
        ['Meeting warning', settings.pending_time ? `${settings.pending_time} minute${settings.pending_time === 1 ? '' : 's'} before a meeting starts` : 'Off'],
        ['Active displays', displays.length ? displays.join(', ') : 'None'],
        ['Calendar providers', providers.length ? providers.join(', ') : 'None'],
    ];
    const list = el('dl', { class: 'summary-list' });
    rows.forEach(([term, value]) => {
        list.appendChild(el('dt', {}, [term]));
        list.appendChild(el('dd', {}, [value]));
    });
    summary.appendChild(list);
    const configured = configuredDisplayKeys();
    if (configured.length) {
        summary.appendChild(el('h4', {}, ['Display overrides']));
        const overrides = el('ul', { class: 'override-summary' });
        configured.forEach((key) => {
            const target = getDisplayConfig(key) || {};
            const fields = Object.keys(target).filter((field) => !['url', 'token', 'entity_id', 'preset', 'led_count', 'name'].includes(field));
            overrides.appendChild(el('li', {}, [`${displayLabel(key)}: ${fields.length ? fields.join(', ') : 'uses Default Display Settings'}`]));
        });
        summary.appendChild(overrides);
    }
    return summary;
}
function renderReviewStep(main) {
    ensureDefaults();
    main.appendChild(el('h2', { class: 'step-title' }, ['Review & Save']));
    const buckets = getValidationBuckets();
    const hardErrors = hasHardErrors(buckets);
    const issuesBox = el('div', {});
    main.appendChild(issuesBox);
    if (buckets.size === 0) {
        issuesBox.appendChild(el('p', { class: 'validation-ok' }, ['\u2713 No issues found - passes JSON-Schema validation (ajv2020) and the built-in sanity checks.']));
    }
    else {
        issuesBox.appendChild(el('p', { class: 'validation-errors' }, ['Issues to review, grouped by step:']));
        sortedBucketKeys(buckets).forEach((stepId) => {
            const group = el('div', { class: 'issue-group' });
            const clickable = TOP_LEVEL_ORDER.includes(stepId.split(':')[0]) && stepId !== 'review';
            group.appendChild(clickable
                ? el('a', { href: '#', class: 'issue-group-heading', onclick: (e) => { e.preventDefault(); gotoStep(stepId); } }, [stepLabel(stepId)])
                : el('div', { class: 'issue-group-heading' }, [stepLabel(stepId)]));
            const list = el('ul', { class: 'validation-errors' });
            buckets.get(stepId).forEach((entry) => list.appendChild(el('li', { class: entry.kind === 'warning' ? 'issue-warning' : 'issue-error' }, [entry.message])));
            group.appendChild(list);
            issuesBox.appendChild(group);
        });
    }
    main.appendChild(renderReviewSummary());
    const jsonDetails = el('details', { class: 'json-details' }, [
        el('summary', {}, ['Advanced: generated settings.json']),
        el('pre', { class: 'json-preview' }, [JSON.stringify(settings, null, 2)]),
    ]);
    main.appendChild(jsonDetails);
    const actions = el('div', { class: 'step-actions' });
    const downloadBtn = el('button', { class: 'btn' }, [el('span', { class: 'material-symbols-outlined' }, ['download']), 'Download settings.json']);
    downloadBtn.disabled = hardErrors;
    if (hardErrors)
        downloadBtn.title = 'Resolve the errors above before saving.';
    downloadBtn.addEventListener('click', downloadSettings);
    actions.appendChild(downloadBtn);
    if (window.showSaveFilePicker) {
        const saveAsBtn = el('button', { class: 'btn-secondary' }, [el('span', { class: 'material-symbols-outlined' }, ['save']), 'Save As...']);
        saveAsBtn.disabled = hardErrors;
        if (hardErrors)
            saveAsBtn.title = 'Resolve the errors above before saving.';
        saveAsBtn.addEventListener('click', saveAsSettings);
        actions.appendChild(saveAsBtn);
    }
    main.appendChild(actions);
    if (hardErrors)
        main.appendChild(el('p', { class: 'save-blocked-note' }, ['Saving is unavailable until the errors above are resolved. Warnings do not block saving.']));
    saveStatusEl = el('p', { class: 'save-status', role: 'status', 'aria-live': 'polite' }, []);
    main.appendChild(saveStatusEl);
}
function downloadSettings() {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'settings.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    markClean();
    if (saveStatusEl)
        saveStatusEl.textContent = 'Downloaded settings.json successfully.';
}
async function saveAsSettings() {
    try {
        const handle = await window.showSaveFilePicker({
            suggestedName: 'settings.json',
            types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(settings, null, 2));
        await writable.close();
        markClean();
        if (saveStatusEl)
            saveStatusEl.textContent = 'Saved settings.json successfully.';
    }
    catch (e) {
        if (e.name !== 'AbortError') {
            console.error(e);
            if (saveStatusEl)
                saveStatusEl.textContent = `Could not save the file: ${e.message}`;
        }
    }
}
