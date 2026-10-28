// BusyTime configurator v1.0.9
import { isHttpUrl } from './config.js?v=1.0.9';
import { CRED_STATE_META, CRED_VERIFY_NOTE, credState, ensureIcsUrlChecked, fillCredStatusEl, ICS_STATE_META, icsAggregateStatus, passwordFieldEl, PROVIDER_TYPES, renderCredStatusEl, renderIcsStatusList, } from './connection-tests.js?v=1.0.9';
import { computeOauthDisplayState, ensureOauthStatusChecked, hasTokens, OAUTH_STATE_META, renderCalendarPicker, renderOauthActions, renderOauthStatusEl, } from './oauth.js?v=1.0.9';
import { appendStepIssues, gotoStep, renderMain, renderSidebar, renderSubStepActions, stepActions } from './sidebar.js?v=1.0.9';
import { settings } from './state.js?v=1.0.9';
import { el, fieldRow, renderSubStepTitle } from './validation.js?v=1.0.9';
export { renderCalendarsOverview, renderProviderSubStep, chipListEl };
function renderCalendarsOverview(main) {
    const providerTypes = PROVIDER_TYPES;
    const oauthStateMeta = OAUTH_STATE_META;
    const credStateMeta = CRED_STATE_META;
    main.appendChild(el('h2', { class: 'step-title' }, ['Calendar Providers']));
    main.appendChild(el('p', { class: 'step-desc' }, ['Add the calendar providers to monitor. Google and Outlook use OAuth sign-in; the others take plain credentials.']));
    appendStepIssues(main, 'calendars');
    const list = el('div', { class: 'type-list' });
    Object.keys(settings.calendars).forEach((type) => {
        const cfg = providerTypes[type] || {};
        const label = el('button', { class: 'type-card-link', type: 'button', onclick: () => gotoStep('calendars:' + type) }, [cfg.label || type]);
        if (cfg.oauth) {
            const oauthType = type;
            ensureOauthStatusChecked(oauthType);
            const meta = oauthStateMeta[computeOauthDisplayState(oauthType)];
            label.appendChild(el('span', { class: 'oauth-dot oauth-dot--' + meta.cls, title: meta.text, 'aria-label': meta.text }, []));
        }
        else if (cfg.testable) {
            const meta = credStateMeta[credState(type)];
            label.appendChild(el('span', { class: 'oauth-dot oauth-dot--' + meta.cls, title: meta.text, 'aria-label': meta.text }, []));
        }
        else if (cfg.icsOnly) {
            const urls = settings.calendars[type].calendars || [];
            urls.forEach((url) => ensureIcsUrlChecked(url));
            const meta = ICS_STATE_META[icsAggregateStatus(urls)];
            label.appendChild(el('span', { class: 'oauth-dot oauth-dot--' + meta.cls, title: meta.text, 'aria-label': meta.text }, []));
        }
        const card = el('div', { class: 'type-card' }, [label]);
        const removeBtn = el('button', { class: 'icon-only btn-secondary', type: 'button', 'aria-label': `Remove ${cfg.label || type}`, title: `Remove ${cfg.label || type}` }, [el('span', { class: 'material-symbols-outlined', 'aria-hidden': 'true' }, ['delete'])]);
        removeBtn.addEventListener('click', (e) => { e.stopPropagation(); delete settings.calendars[type]; renderSidebar(); renderMain(); });
        card.appendChild(removeBtn);
        list.appendChild(card);
    });
    main.appendChild(list);
    const remaining = Object.keys(providerTypes).filter((t) => !(t in settings.calendars));
    if (remaining.length) {
        const addRow = el('div', { class: 'add-row' });
        const select = el('select', { 'aria-label': 'Calendar provider to add' });
        remaining.forEach((t) => select.appendChild(el('option', { value: t }, [providerTypes[t].label])));
        const addBtn = el('button', { class: 'btn-secondary', type: 'button' }, [el('span', { class: 'material-symbols-outlined' }, ['add']), 'Add Provider']);
        addBtn.addEventListener('click', () => {
            const type = select.value;
            settings.calendars[type] = { calendars: [] };
            renderSidebar();
            gotoStep('calendars:' + type);
        });
        addRow.appendChild(select);
        addRow.appendChild(addBtn);
        main.appendChild(addRow);
    }
    stepActions(main, 'calendars');
}
function renderProviderSubStep(main, type) {
    const cfg = PROVIDER_TYPES[type] || {};
    const target = settings.calendars[type];
    if (!target.calendars)
        target.calendars = [];
    const calendarNames = target.calendars;
    main.appendChild(renderSubStepTitle(cfg.label || type, () => gotoStep('calendars')));
    appendStepIssues(main, 'calendars:' + type);
    if (cfg.oauth) {
        const oauthType = type;
        ensureOauthStatusChecked(oauthType);
        main.appendChild(renderOauthStatusEl(oauthType));
        main.appendChild(renderOauthActions(oauthType));
        if (hasTokens(oauthType)) {
            main.appendChild(el('label', { class: 'field-label section-label' }, ['Calendars in this account']));
            main.appendChild(renderCalendarPicker(oauthType, target));
        }
    }
    if (cfg.creds) {
        if (!target.auth)
            target.auth = {};
        const auth = target.auth;
        if (cfg.credHint) {
            const hint = el('p', { class: 'field-help' }, [cfg.credHint.text]);
            if (cfg.credHint.linkHref) {
                hint.appendChild(document.createTextNode(' '));
                hint.appendChild(el('a', { href: cfg.credHint.linkHref, target: '_blank', rel: 'noopener' }, [cfg.credHint.linkText || 'Learn more']));
            }
            main.appendChild(hint);
        }
        cfg.creds.forEach((key) => {
            const resetCredStatus = () => { if (cfg.testable)
                fillCredStatusEl(type); };
            let control;
            if (key === 'password') {
                control = passwordFieldEl(auth[key] || '', (val) => { auth[key] = val; resetCredStatus(); });
            }
            else {
                const input = el('input', { type: 'text', value: auth[key] || '' });
                input.addEventListener('input', () => { auth[key] = input.value; resetCredStatus(); });
                control = input;
            }
            if (cfg.testable && key === 'url')
                control = el('div', { class: 'input-with-status' }, [control, renderCredStatusEl(type)]);
            main.appendChild(fieldRow(key === 'url' ? 'Server URL' : (key.charAt(0).toUpperCase() + key.slice(1)), '', control));
        });
        if (cfg.testable && cfg.fixedUrl && !cfg.creds.includes('url')) {
            main.appendChild(fieldRow('Server', '', el('div', { class: 'input-with-status' }, [
                el('span', { class: 'field-help' }, [cfg.fixedUrl]),
                renderCredStatusEl(type),
            ])));
        }
        if (cfg.testable) {
            main.appendChild(el('div', { class: 'oauth-status' }, [
                el('span', { class: 'material-symbols-outlined' }, ['info']),
                el('span', {}, [CRED_VERIFY_NOTE]),
            ]));
        }
    }
    if (!cfg.oauth) {
        const icsStatusWrap = cfg.icsOnly ? el('div', {}) : null;
        const redrawIcsStatus = cfg.icsOnly ? () => { icsStatusWrap.innerHTML = ''; icsStatusWrap.appendChild(renderIcsStatusList(calendarNames)); } : null;
        const chipWrap = chipListEl(calendarNames, cfg.icsOnly ? 'https://example.com/calendar.ics' : 'Calendar name', redrawIcsStatus, cfg.icsOnly ? {
            inputType: 'url',
            validate: isHttpUrl,
            invalidMessage: 'Enter a complete HTTP or HTTPS URL.',
        } : {});
        main.appendChild(fieldRow(cfg.icsOnly ? 'ICS feed URLs' : 'Calendar names to monitor', '', chipWrap));
        if (cfg.icsOnly) {
            redrawIcsStatus();
            main.appendChild(icsStatusWrap);
        }
    }
    renderSubStepActions(main, 'calendars');
}
function chipListEl(arrayRef, placeholder, onChange, options = {}) {
    const wrap = el('div', {});
    const chips = el('div', { class: 'chip-list' });
    function redraw() {
        chips.innerHTML = '';
        arrayRef.forEach((val, idx) => {
            const rm = el('button', { type: 'button', 'aria-label': `Remove ${val}`, title: `Remove ${val}` }, [el('span', { class: 'material-symbols-outlined', 'aria-hidden': 'true' }, ['close'])]);
            rm.addEventListener('click', () => { arrayRef.splice(idx, 1); redraw(); if (onChange)
                onChange(); });
            chips.appendChild(el('span', { class: 'chip' }, [val, rm]));
        });
    }
    redraw();
    const input = el('input', { type: options.inputType || 'text', placeholder });
    const error = el('p', { class: 'warning-text', role: 'alert' }, []);
    error.hidden = true;
    const addBtn = el('button', { type: 'button', class: 'btn-secondary' }, ['Add']);
    function addValue() {
        const val = input.value.trim();
        if (!val)
            return;
        if (options.validate && !options.validate(val)) {
            error.textContent = options.invalidMessage || 'Enter a valid value.';
            error.hidden = false;
            input.setAttribute('aria-invalid', 'true');
            return;
        }
        if (arrayRef.includes(val)) {
            error.textContent = 'That value has already been added.';
            error.hidden = false;
            input.setAttribute('aria-invalid', 'true');
            return;
        }
        arrayRef.push(val);
        input.value = '';
        input.removeAttribute('aria-invalid');
        error.hidden = true;
        redraw();
        if (onChange)
            onChange();
    }
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addValue();
        }
    });
    input.addEventListener('input', () => { error.hidden = true; input.removeAttribute('aria-invalid'); });
    addBtn.addEventListener('click', addValue);
    wrap.appendChild(chips);
    wrap.appendChild(el('div', { class: 'add-row' }, [input, addBtn]));
    wrap.appendChild(el('span', { class: 'field-help' }, ['Press Enter or choose Add to include this value.']));
    wrap.appendChild(error);
    return wrap;
}
