// BusyTime configurator v1.0.10
import { DISPLAY_HELP, DISPLAY_TYPES, displaySupportsLedStrip, EVENT_TIME_DEFAULT_COLORS, getExtraFields, HOMEASSISTANT_TOKEN_DOCS_URL, isMultiDisplayType, STATE_DEFAULT_COLORS, STATE_DESCRIPTIONS, STATE_NAMES, stateOptionLabel, } from './config.js?v=1.0.10';
import { DISPLAY_STATE_META, displayDetail, displayFieldsFilled, displayPending, displayStatus, ensureDisplayStatusChecked, fillDisplayStatusEl, forgetDisplayStatuses, renderDisplayDetailEl, renderDisplayRetestButton, renderDisplayStatusEl, statusTitle, testableDisplayKeys, testAllDisplays, } from './connection-tests.js?v=1.0.10';
import { addDisplayInstance, configuredDisplayKeys, displayInstances, displayLabel, getDisplayConfig, parseDisplayKey, removeDisplayInstance, } from './helpers.js?v=1.0.10';
import { appendStepIssues, gotoStep, renderMain, renderSidebar, renderSubStepActions, stepActions } from './sidebar.js?v=1.0.10';
import { settings } from './state.js?v=1.0.10';
import { el, fieldRow, helpLinkEl, hexToRgb, renderSubStepTitle, rgbToHex } from './validation.js?v=1.0.10';
export { renderDisplaysOverview, renderDisplaySubStep, renderBrightnessRow, renderCommonDisplayFields, booleanSettingRow, renderColorsSection, colorPickerEl };
function renderDisplaysOverview(main) {
    const displayStateMeta = DISPLAY_STATE_META;
    const displayStatuses = displayStatus;
    const displayDetails = displayDetail;
    const displayPendings = displayPending;
    main.appendChild(el('h2', { class: 'step-title' }, ['Displays']));
    main.appendChild(el('p', { class: 'step-desc' }, ['Default Display Settings apply to every display unless that display overrides them. Add specific displays below.']));
    appendStepIssues(main, 'displays');
    const list = el('div', { class: 'type-list' });
    list.appendChild(el('button', { class: 'type-card type-card-button', type: 'button', onclick: () => gotoStep('displays:default') }, [
        el('span', {}, ['Default Display Settings']),
        el('span', { class: 'material-symbols-outlined', 'aria-hidden': 'true' }, ['chevron_right']),
    ]));
    configuredDisplayKeys().forEach((key) => {
        const { type } = parseDisplayKey(key);
        const cfg = DISPLAY_TYPES[type] || {};
        const name = displayLabel(key);
        const label = el('button', { class: 'type-card-link', type: 'button', onclick: () => gotoStep('displays:' + key) }, [name]);
        const controls = el('div', { class: 'type-card-controls' });
        if (cfg.testable) {
            ensureDisplayStatusChecked(key);
            const meta = displayStateMeta[displayStatuses[key]] || displayStateMeta.unknown;
            const title = statusTitle(meta, displayDetails[key]);
            controls.appendChild(el('span', { class: 'material-symbols-outlined status-icon status-icon--' + meta.cls + (meta.cls === 'checking' ? ' spin' : ''), title, 'aria-label': title }, [meta.icon]));
        }
        const card = el('div', { class: 'type-card' }, [label, controls]);
        const removeBtn = el('button', { class: 'icon-only btn-secondary', type: 'button', 'aria-label': `Remove ${name}`, title: `Remove ${name}` }, [el('span', { class: 'material-symbols-outlined', 'aria-hidden': 'true' }, ['delete'])]);
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeDisplayInstance(key);
            forgetDisplayStatuses(type);
            renderSidebar();
            renderMain();
        });
        controls.appendChild(removeBtn);
        list.appendChild(card);
    });
    main.appendChild(list);
    const testable = testableDisplayKeys();
    if (testable.length) {
        const anyPending = testable.some((k) => displayPendings[k]);
        const ready = testable.filter(displayFieldsFilled);
        const testAllBtn = el('button', { class: 'btn-secondary', type: 'button' }, [
            el('span', { class: 'material-symbols-outlined' + (anyPending ? ' spin' : '') }, ['refresh']),
            anyPending ? 'Testing\u2026' : 'Test all connections',
        ]);
        testAllBtn.disabled = anyPending || !ready.length;
        if (!ready.length)
            testAllBtn.title = 'Fill in the URL (and any other required fields) of at least one display first.';
        testAllBtn.addEventListener('click', testAllDisplays);
        main.appendChild(el('div', { class: 'add-row' }, [testAllBtn]));
    }
    const addable = Object.keys(DISPLAY_TYPES).filter((t) => isMultiDisplayType(t) || !(t in settings.displays));
    if (addable.length) {
        const addRow = el('div', { class: 'add-row' });
        const select = el('select', { 'aria-label': 'Display to add' });
        addable.forEach((t) => select.appendChild(el('option', { value: t }, [displayInstances(t).length ? `${DISPLAY_TYPES[t].label} (add another)` : DISPLAY_TYPES[t].label])));
        const addBtn = el('button', { class: 'btn-secondary', type: 'button' }, [el('span', { class: 'material-symbols-outlined' }, ['add']), 'Add Display']);
        addBtn.addEventListener('click', () => { const key = addDisplayInstance(select.value); renderSidebar(); gotoStep('displays:' + key); });
        addRow.appendChild(select);
        addRow.appendChild(addBtn);
        main.appendChild(addRow);
    }
    stepActions(main, 'displays');
}
function renderDisplaySubStep(main, key) {
    const displayStatuses = displayStatus;
    const isDefault = key === 'default';
    const { type } = parseDisplayKey(key);
    const target = getDisplayConfig(key);
    if (!target) {
        renderDisplaysOverview(main);
        return;
    }
    main.appendChild(renderSubStepTitle(isDefault ? 'Default Display Settings' : displayLabel(key), () => gotoStep('displays')));
    appendStepIssues(main, 'displays:' + key);
    if (!isDefault && DISPLAY_HELP[type])
        main.appendChild(helpLinkEl(DISPLAY_HELP[type].text, DISPLAY_HELP[type].href));
    renderCommonDisplayFields(main, target, isDefault, type);
    if (!isDefault) {
        const cfg = DISPLAY_TYPES[type];
        if (cfg.testable)
            ensureDisplayStatusChecked(key);
        getExtraFields(type).forEach((f) => {
            const required = !!(cfg.requiredFields || []).includes(f.key);
            const hasStoredValue = Object.prototype.hasOwnProperty.call(target, f.key);
            const initialValue = hasStoredValue ? target[f.key] : (f.defaultValue ?? '');
            let input;
            if (f.enumValues) {
                const options = f.enumValues.map((value) => {
                    const valueLabel = `${value}${f.optionSuffix}`;
                    const label = value === f.defaultValue ? `Use default (${valueLabel})` : valueLabel;
                    return el('option', { value: String(value), selected: value === initialValue ? 'selected' : null }, [label]);
                });
                if (hasStoredValue && !f.enumValues.includes(initialValue)) {
                    options.unshift(el('option', { value: String(initialValue), selected: 'selected' }, [`${initialValue}${f.optionSuffix} (invalid)`]));
                }
                input = el('select', { required: required ? 'required' : null }, options);
            }
            else {
                input = el('input', { type: f.type, value: initialValue, placeholder: f.placeholder || '', required: required ? 'required' : null });
            }
            input.addEventListener('input', () => {
                if (input.value === '') {
                    delete target[f.key];
                    return;
                }
                const value = f.type === 'number' ? (parseInt(input.value, 10) || 0) : input.value;
                if (!required && f.defaultValue !== undefined && value === f.defaultValue)
                    delete target[f.key];
                else
                    target[f.key] = value;
                if (cfg.testable) {
                    displayStatuses[key] = 'unknown';
                    fillDisplayStatusEl(key);
                }
                if (f.enumValues) {
                    renderSidebar();
                    renderMain();
                }
            });
            const control = (cfg.testable && f.key === 'url')
                ? el('div', { class: 'input-with-status' }, [input, renderDisplayStatusEl(key), renderDisplayRetestButton(key), renderDisplayDetailEl(key)])
                : input;
            const help = required ? `Required for BusyTime to activate this display. ${f.description}`.trim() : f.description;
            const row = fieldRow(f.label, help, control);
            if (type === 'homeassistant' && f.key === 'token') {
                const helpSpan = row.querySelector('.field-help');
                if (helpSpan) {
                    helpSpan.appendChild(document.createTextNode(' '));
                    helpSpan.appendChild(el('a', { href: HOMEASSISTANT_TOKEN_DOCS_URL, target: '_blank', rel: 'noopener' }, ['Learn more']));
                }
            }
            main.appendChild(row);
        });
    }
    renderSubStepActions(main, 'displays');
}
function renderBrightnessRow(target, isDefault) {
    const clampPct = (n) => Math.min(100, Math.max(0, n));
    const defaultTarget = settings.displays.default || {};
    const inheritedValue = defaultTarget.brightness !== undefined ? defaultTarget.brightness : 1.0;
    const hasOverride = isDefault || Object.prototype.hasOwnProperty.call(target, 'brightness');
    const initialPct = Math.round((hasOverride ? (target.brightness ?? 1.0) : inheritedValue) * 100);
    const percentInput = el('input', { type: 'number', min: '0', max: '100', step: '1', class: 'brightness-percent-input', value: String(initialPct), 'aria-label': 'Brightness percent' });
    const slider = el('input', { type: 'range', min: '0', max: '100', step: '1', class: 'brightness-range', value: String(initialPct), 'aria-label': 'Brightness slider' });
    const commit = (pct) => { target.brightness = parseFloat((pct / 100).toFixed(2)); };
    percentInput.addEventListener('input', () => {
        const pct = clampPct(parseInt(percentInput.value, 10) || 0);
        slider.value = String(pct);
        commit(pct);
    });
    slider.addEventListener('input', () => {
        const pct = parseInt(slider.value, 10);
        percentInput.value = String(pct);
        commit(pct);
    });
    const row = el('div', { class: 'field-row' });
    let modeSelect = null;
    if (!isDefault) {
        modeSelect = el('select', { class: 'override-mode', 'aria-label': 'Brightness source' }, [
            el('option', { value: 'inherit', selected: hasOverride ? null : 'selected' }, [`Use default (${Math.round(inheritedValue * 100)}%)`]),
            el('option', { value: 'override', selected: hasOverride ? 'selected' : null }, ['Override for this display']),
        ]);
        const setEnabled = (enabled) => {
            percentInput.disabled = !enabled;
            slider.disabled = !enabled;
        };
        setEnabled(hasOverride);
        modeSelect.addEventListener('change', () => {
            if (modeSelect.value === 'inherit') {
                delete target.brightness;
                const pct = Math.round(inheritedValue * 100);
                percentInput.value = String(pct);
                slider.value = String(pct);
                setEnabled(false);
            }
            else {
                const pct = Math.round(inheritedValue * 100);
                commit(pct);
                percentInput.value = String(pct);
                slider.value = String(pct);
                setEnabled(true);
                percentInput.focus();
            }
        });
        row.appendChild(modeSelect);
    }
    row.appendChild(el('label', { class: 'field-label brightness-label' }, ['Brightness', percentInput, '%']));
    row.appendChild(slider);
    if (!isDefault)
        row.appendChild(el('span', { class: 'field-help' }, ['Inherited values stay linked to Default Display Settings until you choose an override.']));
    return row;
}
function renderCommonDisplayFields(main, target, isDefault, type) {
    if (!isDefault)
        main.appendChild(el('p', { class: 'inheritance-note' }, ['Each setting uses Default Display Settings unless you explicitly override it here.']));
    main.appendChild(renderBrightnessRow(target, isDefault));
    main.appendChild(booleanSettingRow(target, 'use_calendar_colors', 'Use calendar event colors', "Use the color supplied by the calendar event (if any) instead of the default BUSY color", isDefault));
    main.appendChild(booleanSettingRow(target, 'use_event_colors', 'Use event-time color overrides', 'Use event_time_color overrides for the color instead of the default state color', isDefault));
    if (isDefault || displaySupportsLedStrip(type)) {
        main.appendChild(booleanSettingRow(target, 'show_tracker', "Show 'now' tracker", "Show a moving 'now' tracker on LED strip displays", isDefault));
        main.appendChild(booleanSettingRow(target, 'show_dividers', 'Show minute dividers', 'Show minute dividers as white LEDs on LED strip displays', isDefault));
        if (isDefault) {
            main.appendChild(el('p', { class: 'field-help' }, ['Only takes effect on Matrix LED, WLED, and Console displays.']));
        }
    }
    main.appendChild(renderColorsSection(target, isDefault));
}
function booleanSettingRow(target, key, label, help, isDefault) {
    if (!isDefault) {
        const defaultValue = !!(settings.displays.default || {})[key];
        const current = Object.prototype.hasOwnProperty.call(target, key) ? String(!!target[key]) : 'inherit';
        const select = el('select', { 'aria-label': label }, [
            el('option', { value: 'inherit', selected: current === 'inherit' ? 'selected' : null }, [`Use default (${defaultValue ? 'On' : 'Off'})`]),
            el('option', { value: 'true', selected: current === 'true' ? 'selected' : null }, ['On for this display']),
            el('option', { value: 'false', selected: current === 'false' ? 'selected' : null }, ['Off for this display']),
        ]);
        select.addEventListener('change', () => {
            if (select.value === 'inherit')
                delete target[key];
            else
                target[key] = select.value === 'true';
        });
        return fieldRow(label, help, select);
    }
    const input = el('input', { type: 'checkbox' });
    input.checked = !!target[key];
    input.addEventListener('change', () => { target[key] = input.checked; });
    const row = el('div', { class: 'field-row' });
    row.appendChild(el('label', { class: 'field-label' }, [input, ' ' + label]));
    if (help)
        row.appendChild(el('span', { class: 'field-help' }, [help]));
    return row;
}
function renderColorsSection(target, isDefault) {
    const wrap = el('div', { class: 'field-row' });
    wrap.appendChild(el('div', { class: 'field-label' }, ['State color overrides']));
    wrap.appendChild(el('p', { class: 'field-help' }, ['Change the light color for a specific situation, such as "In a meeting" or "A meeting starts soon".']));
    const inheritedColors = (settings.displays.default && settings.displays.default.colors) || {};
    const content = el('div', {});
    let modeSelect = null;
    const inheritedNote = el('p', { class: 'field-help' }, ['Using the state colors from Default Display Settings.']);
    if (!isDefault) {
        const customized = Object.prototype.hasOwnProperty.call(target, 'colors');
        modeSelect = el('select', { class: 'override-mode', 'aria-label': 'State color source' }, [
            el('option', { value: 'inherit', selected: customized ? null : 'selected' }, ['Use default state colors']),
            el('option', { value: 'custom', selected: customized ? 'selected' : null }, ['Customize for this display']),
        ]);
        wrap.appendChild(modeSelect);
        wrap.appendChild(inheritedNote);
        content.hidden = !customized;
        inheritedNote.hidden = customized;
        modeSelect.addEventListener('change', () => {
            if (modeSelect.value === 'inherit') {
                delete target.colors;
                content.hidden = true;
                inheritedNote.hidden = false;
            }
            else {
                target.colors = JSON.parse(JSON.stringify(inheritedColors));
                content.hidden = false;
                inheritedNote.hidden = true;
                redrawColors();
            }
        });
    }
    const colorsList = el('div', {});
    content.appendChild(colorsList);
    function redrawColors() {
        colorsList.innerHTML = '';
        const colors = target.colors || {};
        Object.keys(colors).forEach((state) => {
            const row = el('div', { class: 'color-row' });
            row.appendChild(el('span', { class: 'color-state-name' }, [state, el('small', { class: 'field-help' }, [STATE_DESCRIPTIONS[state] || ''])]));
            const hex = el('code', { class: 'color-value' }, [rgbToHex(colors[state])]);
            row.appendChild(colorPickerEl(colors[state], (rgb) => { target.colors[state] = rgb; hex.textContent = rgbToHex(rgb); }, `${state} color`));
            row.appendChild(hex);
            const rm = el('button', { class: 'icon-only btn-secondary', type: 'button', 'aria-label': `Remove ${state} color override`, title: `Remove ${state} color override` }, [el('span', { class: 'material-symbols-outlined', 'aria-hidden': 'true' }, ['delete'])]);
            rm.addEventListener('click', () => {
                delete target.colors[state];
                if (!Object.keys(target.colors).length) {
                    delete target.colors;
                    if (modeSelect) {
                        modeSelect.value = 'inherit';
                        content.hidden = true;
                        inheritedNote.hidden = false;
                    }
                }
                redrawColors();
            });
            row.appendChild(rm);
            colorsList.appendChild(row);
        });
        refreshStateOptions();
    }
    const addRow = el('div', { class: 'add-row color-add-row' });
    const stateSelect = el('select', { 'aria-label': 'State to customize' });
    const addBtn = el('button', { class: 'btn-secondary', type: 'button' }, ['Add State Color']);
    function refreshStateOptions() {
        const previous = stateSelect.value;
        stateSelect.innerHTML = '';
        const remaining = STATE_NAMES.filter((state) => !(state in (target.colors || {})));
        remaining.forEach((state) => stateSelect.appendChild(el('option', { value: state }, [stateOptionLabel(state)])));
        if (remaining.includes(previous))
            stateSelect.value = previous;
        addBtn.disabled = !remaining.length;
    }
    addBtn.addEventListener('click', () => {
        const state = stateSelect.value;
        if (!state)
            return;
        if (!target.colors)
            target.colors = isDefault ? {} : JSON.parse(JSON.stringify(inheritedColors));
        target.colors[state] = STATE_DEFAULT_COLORS[state].slice();
        redrawColors();
    });
    addRow.appendChild(stateSelect);
    addRow.appendChild(addBtn);
    content.appendChild(addRow);
    wrap.appendChild(content);
    redrawColors();
    if (isDefault) {
        const eventTimeDefaultColors = EVENT_TIME_DEFAULT_COLORS;
        wrap.appendChild(el('div', { class: 'field-label section-label' }, ['Event time color overrides']));
        wrap.appendChild(el('p', { class: 'field-help' }, ['Tag a calendar event by starting it at minute 1-4 of the hour (e.g. 9:01). BusyTime rounds it down to the 5-minute mark and applies the color and/or state chosen here.']));
        const etcList = el('div', {});
        wrap.appendChild(etcList);
        const minuteSelect = el('select', { 'aria-label': 'Event start minute (1-4) to customize' });
        const addEtcBtn = el('button', { class: 'btn-secondary', type: 'button' }, ['Add Event Time Color']);
        const etcAddRow = el('div', { class: 'add-row color-add-row' }, [minuteSelect, addEtcBtn]);
        function redrawEtc() {
            etcList.innerHTML = '';
            const eventColors = target.event_time_color || {};
            Object.keys(eventColors).forEach((minute) => {
                const entry = target.event_time_color[minute];
                const color = Array.isArray(entry) ? entry : (entry.color || eventTimeDefaultColors[minute]);
                const row = el('div', { class: 'color-row' });
                row.appendChild(el('span', {}, [`Minute ${minute}`]));
                const stateSelect = el('select', { 'aria-label': `State for events starting at minute ${minute}` }, [
                    el('option', { value: '' }, ['Natural event state']),
                    ...STATE_NAMES.map((state) => el('option', { value: state }, [stateOptionLabel(state)])),
                ]);
                stateSelect.value = Array.isArray(entry) ? '' : (entry.state || '');
                stateSelect.addEventListener('change', () => {
                    target.event_time_color[minute] = { state: stateSelect.value || null, color: (Array.isArray(entry) ? entry : entry.color) || color };
                });
                row.appendChild(stateSelect);
                const hex = el('code', { class: 'color-value' }, [rgbToHex(color)]);
                row.appendChild(colorPickerEl(color, (rgb) => {
                    const current = target.event_time_color[minute];
                    target.event_time_color[minute] = { state: Array.isArray(current) ? null : (current.state || null), color: rgb };
                    hex.textContent = rgbToHex(rgb);
                }, `Color for events starting at minute ${minute}`));
                row.appendChild(hex);
                const rm = el('button', { class: 'icon-only btn-secondary', type: 'button', 'aria-label': `Remove minute ${minute} override`, title: `Remove minute ${minute} override` }, [el('span', { class: 'material-symbols-outlined', 'aria-hidden': 'true' }, ['delete'])]);
                rm.addEventListener('click', () => {
                    delete target.event_time_color[minute];
                    if (!Object.keys(target.event_time_color).length)
                        delete target.event_time_color;
                    redrawEtc();
                });
                row.appendChild(rm);
                etcList.appendChild(row);
            });
            const previous = minuteSelect.value;
            minuteSelect.innerHTML = '';
            const remaining = ['1', '2', '3', '4'].filter((minute) => !(minute in eventColors));
            remaining.forEach((minute) => minuteSelect.appendChild(el('option', { value: minute }, [`Minute ${minute}`])));
            if (remaining.includes(previous))
                minuteSelect.value = previous;
            addEtcBtn.disabled = !remaining.length;
        }
        addEtcBtn.addEventListener('click', () => {
            const m = minuteSelect.value;
            if (!m)
                return;
            if (!target.event_time_color)
                target.event_time_color = {};
            target.event_time_color[m] = { state: null, color: eventTimeDefaultColors[m].slice() };
            redrawEtc();
        });
        wrap.appendChild(etcAddRow);
        redrawEtc();
    }
    return wrap;
}
function colorPickerEl(rgb, onChange, label = 'Choose color') {
    const input = el('input', { type: 'color', class: 'color-square', 'aria-label': label, title: label });
    input.value = rgbToHex(rgb);
    input.addEventListener('input', () => onChange(hexToRgb(input.value)));
    return input;
}
