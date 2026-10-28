// BusyTime configurator v1.0.8
import { DAY_LABELS, isValidTimeZone } from './config.js?v=1.0.8';
import { computeOffsetSeconds, setOffsetDisplay } from './helpers.js?v=1.0.8';
import { renderMain, renderSidebar, stepActions } from './sidebar.js?v=1.0.8';
import { settings } from './state.js?v=1.0.8';
import { el, fieldRow } from './validation.js?v=1.0.8';
export { renderScheduleStep, renderHoursRange, hourFormatter, hourLabel, hourTickLabel };
function renderScheduleStep(main) {
    main.appendChild(el('h2', { class: 'step-title' }, ['General & Schedule']));
    main.appendChild(el('p', { class: 'step-desc' }, ['Test mode, timezone, and the hours/days BusyTime checks your calendar.']));
    const testSelect = el('select', {});
    [['', 'Off (normal operation)'], ['lights', 'Lights test'], ['lightskey', 'Lights test (press a key per state)'], ['rainbow', 'Rainbow test'], ['calendar', 'Calendar test']].forEach(([val, label]) => {
        const opt = el('option', { value: val }, [label]);
        if ((settings.test_mode || '') === val)
            opt.setAttribute('selected', 'selected');
        testSelect.appendChild(opt);
    });
    testSelect.addEventListener('change', () => { settings.test_mode = testSelect.value || null; renderMain(); });
    main.appendChild(fieldRow('Test mode', "Lights/Rainbow also disable WiFi requirements since the device won't connect to the network.", testSelect));
    const tzList = document.createElement('datalist');
    tzList.id = 'tz-list';
    (Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [settings.calendar_timezone_name]).forEach((tz) => {
        tzList.appendChild(el('option', { value: tz }));
    });
    main.appendChild(tzList);
    const tzInput = el('input', { type: 'text', list: 'tz-list', value: settings.calendar_timezone_name });
    const offsetDisplay = el('span', { class: 'field-help' }, []);
    setOffsetDisplay(offsetDisplay, settings.calendar_timezone_offset);
    const tzWarning = el('p', { class: 'warning-text' }, []);
    tzWarning.hidden = isValidTimeZone(settings.calendar_timezone_name);
    tzWarning.textContent = `"${settings.calendar_timezone_name}" is not a recognized IANA timezone name - pick one from the list.`;
    tzInput.addEventListener('focus', () => { tzInput.select(); });
    tzInput.addEventListener('blur', () => {
        if (tzInput.value === '')
            tzInput.value = settings.calendar_timezone_name;
    });
    tzInput.addEventListener('change', () => {
        const value = tzInput.value;
        if (value === '') {
            tzInput.value = settings.calendar_timezone_name;
            return;
        }
        if (isValidTimeZone(value)) {
            settings.calendar_timezone_name = value;
            settings.calendar_timezone_offset = computeOffsetSeconds(value);
            setOffsetDisplay(offsetDisplay, settings.calendar_timezone_offset);
            tzWarning.hidden = true;
        }
        else {
            tzWarning.textContent = `"${value}" is not a recognized IANA timezone name - pick one from the list. Keeping "${settings.calendar_timezone_name}".`;
            tzWarning.hidden = false;
        }
        renderSidebar();
    });
    const tzWrap = el('div', {}, [tzInput, offsetDisplay, tzWarning]);
    main.appendChild(fieldRow('Timezone', 'IANA timezone name, sourced from your browser. The numeric offset is computed automatically (a snapshot at save time - the device cannot compute DST itself).', tzWrap));
    const hourWarning = el('p', { class: 'warning-text' }, []);
    hourWarning.hidden = true;
    const hoursRange = renderHoursRange(() => checkHourWarning());
    main.appendChild(fieldRow('Hours to check', 'Drag the two handles, or focus one and use the arrow keys. BusyTime only checks your calendar between these hours.', hoursRange));
    main.appendChild(hourWarning);
    function checkHourWarning() {
        hourWarning.hidden = settings.calendar_hour_start < settings.calendar_hour_end;
        hourWarning.textContent = 'Start hour must be before end hour, or calendar checking will silently never run.';
    }
    checkHourWarning();
    const dayWarning = el('p', { class: 'warning-text' }, ['No days selected - calendar checking will never run.']);
    const dayToggles = el('div', { class: 'day-toggles', role: 'group', 'aria-label': 'Days to check' });
    const dayButtons = DAY_LABELS.map((label, idx) => {
        const btn = el('button', { type: 'button', class: 'day-toggle', 'aria-pressed': 'false' }, [label]);
        btn.addEventListener('click', () => {
            const i = settings.calendar_days.indexOf(idx);
            if (i >= 0)
                settings.calendar_days.splice(i, 1);
            else
                settings.calendar_days.push(idx);
            settings.calendar_days.sort((a, b) => a - b);
            syncDayButtons();
        });
        dayToggles.appendChild(btn);
        return btn;
    });
    function syncDayButtons() {
        dayButtons.forEach((btn, idx) => {
            const selected = settings.calendar_days.includes(idx);
            btn.classList.toggle('selected', selected);
            btn.setAttribute('aria-pressed', String(selected));
        });
        dayWarning.hidden = settings.calendar_days.length > 0;
    }
    const shortcutRow = el('div', { class: 'day-shortcuts' });
    const dayShortcuts = [['Weekdays', [0, 1, 2, 3, 4]], ['Every day', [0, 1, 2, 3, 4, 5, 6]]];
    dayShortcuts.forEach(([text, days]) => {
        const btn = el('button', { type: 'button', class: 'btn-secondary' }, [text]);
        btn.addEventListener('click', () => { settings.calendar_days = days.slice(); syncDayButtons(); });
        shortcutRow.appendChild(btn);
    });
    syncDayButtons();
    main.appendChild(fieldRow('Days to check', 'The days of the week BusyTime checks your calendar.', el('div', {}, [dayToggles, shortcutRow, dayWarning])));
    const pendingInput = el('input', { type: 'number', min: '0', value: settings.pending_time });
    pendingInput.addEventListener('input', () => { settings.pending_time = Math.max(0, parseInt(pendingInput.value, 10) || 0); });
    main.appendChild(fieldRow('Warn me before a meeting (minutes)', "How many minutes before a meeting starts the light switches to the PENDING warning (to BUSYPENDING if the next meeting starts right after one you're already in). 0 turns the warning off.", pendingInput));
    stepActions(main, 'schedule');
}
function renderHoursRange(onChange) {
    const wrap = el('div', { class: 'dual-range-wrap' });
    const range = el('div', { class: 'dual-range', role: 'group', 'aria-label': 'Hours to check' });
    const fill = el('div', { class: 'dual-range-fill' });
    range.appendChild(el('div', { class: 'dual-range-track' }, [fill]));
    const startInput = el('input', { type: 'range', min: '0', max: '24', step: '1', 'aria-label': 'Start checking at' });
    const endInput = el('input', { type: 'range', min: '0', max: '24', step: '1', 'aria-label': 'Stop checking at' });
    const summary = el('p', { class: 'hours-summary', role: 'status', 'aria-live': 'polite' }, []);
    function sync() {
        const start = settings.calendar_hour_start;
        const end = settings.calendar_hour_end;
        startInput.value = String(start);
        endInput.value = String(end);
        range.style.setProperty('--start', String(Math.min(start, end)));
        range.style.setProperty('--end', String(Math.max(start, end)));
        startInput.setAttribute('aria-valuetext', hourLabel(start));
        endInput.setAttribute('aria-valuetext', hourLabel(end));
        summary.textContent = `${hourLabel(start)} to ${hourLabel(end)}`;
        startInput.style.zIndex = start >= 12 ? '2' : '1';
    }
    startInput.addEventListener('input', () => {
        const limit = Math.min(Math.max(settings.calendar_hour_end - 1, 0), 23);
        settings.calendar_hour_start = Math.min(parseInt(startInput.value, 10), limit);
        sync();
        onChange();
    });
    endInput.addEventListener('input', () => {
        const limit = Math.max(Math.min(settings.calendar_hour_start + 1, 24), 1);
        settings.calendar_hour_end = Math.max(parseInt(endInput.value, 10), limit);
        sync();
        onChange();
    });
    range.appendChild(startInput);
    range.appendChild(endInput);
    const ticks = el('div', { class: 'dual-range-ticks', 'aria-hidden': 'true' });
    [0, 6, 12, 18, 24].forEach((h) => ticks.appendChild(el('span', {}, [hourTickLabel(h)])));
    wrap.appendChild(range);
    wrap.appendChild(ticks);
    wrap.appendChild(summary);
    sync();
    return wrap;
}
const HOUR_FORMAT_OPTIONS = { timeZone: 'UTC' };
const hourFormatter = new Intl.DateTimeFormat(undefined, { ...HOUR_FORMAT_OPTIONS, hour: 'numeric', minute: '2-digit' });
const hourOnlyFormatter = new Intl.DateTimeFormat(undefined, { ...HOUR_FORMAT_OPTIONS, hour: 'numeric' });
const USES_24_HOUR_CLOCK = (() => {
    const o = hourOnlyFormatter.resolvedOptions();
    return o.hour12 === false || o.hourCycle === 'h23' || o.hourCycle === 'h24';
})();
function hourDate(h) { return new Date(Date.UTC(2000, 0, 1, h % 24)); }
function hourLabel(h) {
    if (h === 24)
        return USES_24_HOUR_CLOCK ? '24:00' : `${hourFormatter.format(hourDate(0))} (midnight)`;
    return hourFormatter.format(hourDate(h));
}
function hourTickLabel(h) {
    return hourOnlyFormatter.format(hourDate(h));
}
