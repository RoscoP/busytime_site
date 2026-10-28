// BusyTime configurator v1.0.9
export { isStepLocked, gotoStep, unlockThrough, goNext, goBack, renderSidebar, disarmRestart, renderMain, appendStepIssues, stepActions, renderSubStepActions, resetRenderedStep };
import { renderCalendarsOverview, renderProviderSubStep } from './calendars-step.js?v=1.0.9';
import { STEP_META, TOP_LEVEL_ORDER, DISPLAY_TYPES } from './config.js?v=1.0.9';
import { ensureCredStatusChecked, ensureDisplayStatusChecked, ensureIcsUrlChecked, PROVIDER_TYPES, } from './connection-tests.js?v=1.0.9';
import { renderDisplaysOverview, renderDisplaySubStep } from './displays-step.js?v=1.0.9';
import { restartEditor } from './editor.js?v=1.0.9';
import { ensureOauthStatusChecked } from './oauth.js?v=1.0.9';
import { renderReviewStep } from './review-step.js?v=1.0.9';
import { renderScheduleStep } from './schedule-step.js?v=1.0.9';
import { currentStepId, dirty, setCurrentStepId, settings, unlocked } from './state.js?v=1.0.9';
import { el, getValidationBuckets, stepOrDescendantHasIssue } from './validation.js?v=1.0.9';
import { renderWifiStep } from './wifi-step.js?v=1.0.9';
function isStepLocked(id) {
    return !unlocked.has(id);
}
function gotoStep(id) {
    if (isStepLocked(id.split(':')[0]) && !unlocked.has(id))
        return;
    disarmRestart();
    setCurrentStepId(id);
    renderSidebar();
    renderMain();
    const heading = document.querySelector('#main-content h2');
    if (heading) {
        heading.tabIndex = -1;
        heading.focus();
    }
}
function unlockThrough(topId) {
    const idx = TOP_LEVEL_ORDER.indexOf(topId);
    for (let i = 0; i <= idx; i++)
        unlocked.add(TOP_LEVEL_ORDER[i]);
}
function goNext(fromTop) {
    const idx = TOP_LEVEL_ORDER.indexOf(fromTop);
    const next = TOP_LEVEL_ORDER[idx + 1];
    if (next) {
        unlocked.add(next);
        gotoStep(next);
    }
}
function goBack(fromTop) {
    const idx = TOP_LEVEL_ORDER.indexOf(fromTop);
    const prev = TOP_LEVEL_ORDER[idx - 1];
    if (prev)
        gotoStep(prev);
}
function renderSidebar() {
    const nav = document.getElementById('sidebar');
    const restoreRestartFocus = document.activeElement instanceof HTMLElement && document.activeElement.classList.contains('nav-restart');
    nav.innerHTML = '';
    const buckets = getValidationBuckets();
    const mobileLabel = el('label', { class: 'mobile-nav-label', for: 'mobile-step-nav' }, ['Current section']);
    const mobileSelect = el('select', { id: 'mobile-step-nav', class: 'mobile-step-select', 'aria-label': 'Current settings section' });
    nav.appendChild(mobileLabel);
    nav.appendChild(mobileSelect);
    TOP_LEVEL_ORDER.forEach((id) => {
        const meta = STEP_META[id];
        const locked = isStepLocked(id);
        const isActive = currentStepId === id;
        const item = el('button', {
            type: 'button',
            class: 'nav-item' + (currentStepId.split(':')[0] === id ? ' active' : '') + (locked ? ' locked' : ''),
            'aria-disabled': locked ? 'true' : null,
            'aria-label': locked ? `${meta.label} (locked - complete the earlier steps first)` : null,
            title: locked ? 'Complete the earlier steps to unlock this section' : null,
            'aria-current': isActive ? 'step' : null,
            onclick: () => !locked && gotoStep(id),
        }, [el('span', { class: 'material-symbols-outlined' }, [meta.icon]), el('span', {}, [meta.label])]);
        if (locked)
            item.appendChild(el('span', { class: 'material-symbols-outlined lock-icon' }, ['lock']));
        if (id !== 'review' && stepOrDescendantHasIssue(buckets, id))
            appendIssueIcon(item, buckets, id);
        else if (!locked && id !== 'review' && currentStepId.split(':')[0] !== id)
            appendCompleteIcon(item);
        nav.appendChild(item);
        mobileSelect.appendChild(el('option', { value: id, disabled: locked ? 'disabled' : null, selected: isActive ? 'selected' : null }, [meta.label + (stepOrDescendantHasIssue(buckets, id) ? ' - issues' : '')]));
        if (id === 'displays' && !locked) {
            const subIds = ['default', ...Object.keys(settings.displays).filter((k) => k !== 'default' && k !== 'all')];
            subIds.forEach((sub) => {
                const cfg = DISPLAY_TYPES[sub];
                if (cfg && cfg.testable)
                    ensureDisplayStatusChecked(sub);
            });
            subIds.forEach((sub) => addSubNavItem(nav, mobileSelect, 'displays:' + sub, sub === 'default' ? 'Default Display Settings' : DISPLAY_TYPES[sub]?.label || sub, buckets));
        }
        if (id === 'calendars' && !locked) {
            Object.keys(settings.calendars).forEach((type) => {
                const cfg = PROVIDER_TYPES[type];
                if (!cfg)
                    return;
                if (cfg.oauth)
                    ensureOauthStatusChecked(type);
                else if (cfg.testable)
                    ensureCredStatusChecked(type);
                else if (cfg.icsOnly)
                    (settings.calendars[type].calendars || []).forEach((url) => ensureIcsUrlChecked(url));
            });
            Object.keys(settings.calendars).forEach((sub) => addSubNavItem(nav, mobileSelect, 'calendars:' + sub, PROVIDER_TYPES[sub]?.label || sub, buckets));
        }
    });
    mobileSelect.value = currentStepId;
    mobileSelect.addEventListener('change', () => gotoStep(mobileSelect.value));
    const restartBtn = renderRestartButton();
    nav.appendChild(restartBtn);
    if (restoreRestartFocus)
        restartBtn.focus();
}
const RESTART_ARM_MS = 5000;
let restartArmed = false;
let restartTimer;
function disarmRestart() {
    restartArmed = false;
    clearTimeout(restartTimer);
}
function onRestartClick() {
    if (!dirty || restartArmed) {
        restartEditor();
        return;
    }
    restartArmed = true;
    clearTimeout(restartTimer);
    restartTimer = window.setTimeout(() => { restartArmed = false; if (settings)
        renderSidebar(); }, RESTART_ARM_MS);
    renderSidebar();
}
function renderRestartButton() {
    const label = restartArmed ? 'Click again to discard all settings' : 'Start over';
    return el('button', {
        type: 'button',
        class: 'nav-restart' + (restartArmed ? ' armed' : ''),
        title: restartArmed ? label : 'Start over (discard all settings)',
        'aria-label': restartArmed ? label : 'Start over, discard all settings',
        onclick: onRestartClick,
    }, [
        el('span', { class: 'material-symbols-outlined', 'aria-hidden': 'true' }, ['restart_alt']),
        ...(restartArmed ? [el('span', {}, [label])] : []),
    ]);
}
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && restartArmed) {
        disarmRestart();
        if (settings)
            renderSidebar();
    }
});
function addSubNavItem(nav, mobileSelect, fullId, label, buckets) {
    const active = currentStepId === fullId;
    const item = el('button', { type: 'button', class: 'nav-item sub' + (active ? ' active' : ''), 'aria-current': active ? 'step' : null, onclick: () => gotoStep(fullId) }, [label]);
    if (buckets.has(fullId))
        appendIssueIcon(item, buckets, fullId);
    nav.appendChild(item);
    mobileSelect.appendChild(el('option', { value: fullId, selected: active ? 'selected' : null }, [`  ${label}${buckets.has(fullId) ? ' - issues' : ''}`]));
}
function appendIssueIcon(item, buckets, id) {
    const issues = [...(buckets.get(id) || [])];
    if (id === 'displays' || id === 'calendars') {
        Array.from(buckets.keys()).filter((key) => key.startsWith(id + ':')).forEach((key) => issues.push(...buckets.get(key)));
    }
    const kind = issues.some((entry) => entry.kind === 'error') ? 'error' : 'warning';
    const count = issues.length;
    const text = `${count} ${kind}${count === 1 ? '' : 's'} to review`;
    item.appendChild(el('span', { class: `material-symbols-outlined issue-icon issue-icon--${kind}`, title: text, 'aria-label': text }, [kind === 'error' ? 'error' : 'warning']));
}
function appendCompleteIcon(item) {
    item.appendChild(el('span', { class: 'material-symbols-outlined complete-icon', title: 'Section reviewed', 'aria-label': 'Section reviewed' }, ['check_circle']));
}
let lastRenderedStepId = null;
function resetRenderedStep() {
    lastRenderedStepId = null;
}
function focusKeyFor(node, main) {
    const key = focusKeyBase(node);
    const same = Array.from(main.querySelectorAll(node.tagName)).filter((n) => focusKeyBase(n) === key);
    return { key, index: same.indexOf(node) };
}
function focusKeyBase(n) {
    const control = n;
    const label = n.getAttribute('aria-label') || (control.labels && control.labels[0] && control.labels[0].textContent.trim()) || n.getAttribute('placeholder') || n.textContent.trim().slice(0, 40);
    return `${n.tagName}|${control.type || ''}|${label}`;
}
function renderMain() {
    const main = document.getElementById('main-content');
    let restore = null;
    const active = document.activeElement;
    if (lastRenderedStepId === currentStepId && active && active !== main && main.contains(active) && /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(active.tagName)) {
        const input = active;
        restore = Object.assign(focusKeyFor(active, main), {
            tag: active.tagName,
            selection: typeof input.selectionStart === 'number' ? [input.selectionStart, input.selectionEnd] : null,
        });
    }
    main.innerHTML = '';
    lastRenderedStepId = currentStepId;
    const [top, sub] = currentStepId.split(':');
    if (top === 'wifi')
        renderWifiStep(main);
    else if (top === 'schedule')
        renderScheduleStep(main);
    else if (top === 'displays')
        (sub ? renderDisplaySubStep(main, sub) : renderDisplaysOverview(main));
    else if (top === 'calendars')
        (sub ? renderProviderSubStep(main, sub) : renderCalendarsOverview(main));
    else if (top === 'review')
        renderReviewStep(main);
    if (restore && restore.index >= 0) {
        const twin = Array.from(main.querySelectorAll(restore.tag)).filter((n) => focusKeyBase(n) === restore.key)[restore.index];
        if (twin && !twin.disabled) {
            twin.focus();
            try {
                if (restore.selection)
                    twin.setSelectionRange(restore.selection[0], restore.selection[1]);
            }
            catch (e) { }
        }
    }
}
function appendStepIssues(main, stepId) {
    const entries = getValidationBuckets().get(stepId) || [];
    if (!entries.length)
        return;
    const panel = el('div', { class: 'step-issues', role: 'status' });
    entries.forEach((entry) => panel.appendChild(el('div', { class: `step-issue step-issue--${entry.kind}` }, [
        el('span', { class: 'material-symbols-outlined', 'aria-hidden': 'true' }, [entry.kind === 'error' ? 'error' : 'warning']),
        el('span', {}, [entry.message]),
    ])));
    main.appendChild(panel);
}
function stepActions(main, topId, { hideNext } = {}) {
    const bar = el('div', { class: 'step-actions' });
    const backIdx = TOP_LEVEL_ORDER.indexOf(topId) - 1;
    if (backIdx >= 0)
        bar.appendChild(el('button', { class: 'btn-secondary', onclick: () => goBack(topId) }, ['Back']));
    if (!hideNext)
        bar.appendChild(el('button', { class: 'btn', onclick: () => goNext(topId) }, ['Next']));
    main.appendChild(bar);
}
function renderSubStepActions(main, parentId) {
    const bar = el('div', { class: 'step-actions' });
    bar.appendChild(el('button', { class: 'btn', onclick: () => gotoStep(parentId) }, ['OK']));
    main.appendChild(bar);
}
