// BusyTime configurator v1.0.10
import { DISPLAY_TYPES } from './config.js?v=1.0.10';
import { configuredDisplayKeys, getDisplayConfig, parseDisplayKey } from './helpers.js?v=1.0.10';
import { fetchJsonWithTimeout, rerenderProviderUi } from './oauth.js?v=1.0.10';
import { renderMain, renderSidebar } from './sidebar.js?v=1.0.10';
import { currentStepId, sessionEpoch, settings } from './state.js?v=1.0.10';
import { el } from './validation.js?v=1.0.10';
export { displayStatus, displayDetail, displayPending, displayStatusEls, displayFieldsFilled, describeFetchError, statusDetailEls, renderStatusDetailEl, setStatusDetailText, statusTitle, isMixedContentBlocked, testDisplayConnection, runDisplayTest, testableDisplayKeys, testAllDisplays, rerenderDisplayUi, ensureDisplayStatusChecked, DISPLAY_STATE_META, fillDisplayStatusEl, renderDisplayStatusEl, renderDisplayDetailEl, renderDisplayRetestButton, forgetDisplayStatuses, PROVIDER_TYPES, credStatusEls, credFieldsFilled, credMissingFields, credHasCalendars, credState, CRED_VERIFY_NOTE, CRED_STATE_META, fillCredStatusEl, renderCredStatusEl, retestButtonEl, passwordFieldEl, icsUrlStatus, icsUrlDetail, icsUrlPending, icsUrlStatusEls, resetConnectionTestState, testIcsUrl, runIcsUrlTest, ensureIcsUrlChecked, ICS_STATE_META, fillIcsUrlStatusEl, renderIcsStatusList, icsAggregateStatus, };
function connDisplayMeta(key) {
    return DISPLAY_TYPES[parseDisplayKey(key).type];
}
const displayStatus = {};
const displayDetail = {};
const displayPending = {};
const displayStatusEls = {};
function forgetDisplayStatuses(type) {
    [displayStatus, displayDetail, displayPending, displayStatusEls].forEach((map) => {
        Object.keys(map).filter((key) => parseDisplayKey(key).type === type).forEach((key) => { delete map[key]; });
    });
}
function displayFieldsFilled(key) {
    const target = getDisplayConfig(key);
    const cfg = connDisplayMeta(key);
    return !!(target && (cfg.testRequiredFields || cfg.requiredFields).every((field) => target[field]));
}
function describeFetchError(e) {
    if (e && e.name === 'AbortError')
        return 'Timed out waiting for a response.';
    return `${(e && e.name) || 'Error'}: ${(e && e.message) || 'request failed'}`;
}
const statusDetailEls = {};
function renderStatusDetailEl(key) {
    const p = el('p', { class: 'field-help status-detail' });
    p.hidden = true;
    statusDetailEls[key] = p;
    return p;
}
function setStatusDetailText(key, status, detail) {
    const p = statusDetailEls[key];
    if (!p)
        return;
    const show = !!detail && ['invalid', 'unreachable', 'unverifiable', 'reachable'].includes(status);
    p.textContent = show ? detail : '';
    p.hidden = !show;
}
function statusTitle(meta, detail) {
    return meta.text + (detail ? ' - ' + detail : '');
}
function isMixedContentBlocked(url) {
    try {
        const parsed = new URL(url);
        const local = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '[::1]';
        return window.location.protocol === 'https:' && parsed.protocol === 'http:' && !local;
    }
    catch (e) {
        return false;
    }
}
async function testDisplayConnection(key) {
    const cfg = connDisplayMeta(key);
    const { url, options } = cfg.buildTestRequest(getDisplayConfig(key) || {});
    if (isMixedContentBlocked(url)) {
        displayDetail[key] = 'This page is served over https, so the browser blocks requests to http:// devices. Open the editor from a local file or http:// to test, or ignore this - the BusyTime device itself is not affected.';
        return 'unverifiable';
    }
    try {
        const { response } = await fetchJsonWithTimeout(url, options, 10000);
        if (response.ok) {
            displayDetail[key] = '';
            return 'valid';
        }
        displayDetail[key] = `HTTP ${response.status}`;
        return 'invalid';
    }
    catch (e) {
        let reason = describeFetchError(e);
        if (cfg.noCorsFallback) {
            try {
                await fetchJsonWithTimeout(url, Object.assign({}, options, { mode: 'no-cors' }), 10000);
                displayDetail[key] = "The device answered, but the browser won't show its status.";
                return 'reachable';
            }
            catch (e2) {
                reason = describeFetchError(e2);
            }
        }
        displayDetail[key] = `Your browser couldn't reach this address. It may be a wrong URL, a network issue, or something the browser won't allow. BusyTime will try it from the device. (${reason})`;
        return 'unreachable';
    }
}
async function runDisplayTest(key) {
    const epoch = sessionEpoch;
    const target = getDisplayConfig(key);
    displayPending[key] = true;
    displayStatus[key] = 'checking';
    displayDetail[key] = '';
    fillDisplayStatusEl(key);
    const result = await testDisplayConnection(key);
    if (epoch !== sessionEpoch)
        return;
    if (getDisplayConfig(key) !== target) {
        delete displayDetail[key];
        return;
    }
    displayStatus[key] = result;
    displayPending[key] = false;
    rerenderDisplayUi(key);
}
function testableDisplayKeys() {
    return configuredDisplayKeys().filter((key) => connDisplayMeta(key) && connDisplayMeta(key).testable);
}
function testAllDisplays() {
    testableDisplayKeys().filter((key) => displayFieldsFilled(key) && !displayPending[key]).forEach(runDisplayTest);
    renderMain();
}
function rerenderDisplayUi(key) {
    if (!settings)
        return;
    if (currentStepId === 'displays:' + key || currentStepId === 'displays')
        renderMain();
    renderSidebar();
}
function ensureDisplayStatusChecked(key) {
    if (!displayFieldsFilled(key)) {
        displayStatus[key] = 'unknown';
        return;
    }
    if (displayStatus[key] && displayStatus[key] !== 'unknown')
        return;
    runDisplayTest(key);
}
const DISPLAY_STATE_META = {
    unknown: { cls: 'unknown', icon: 'radio_button_unchecked', text: 'Not yet tested' },
    checking: { cls: 'checking', icon: 'sync', text: 'Checking\u2026' },
    valid: { cls: 'valid', icon: 'check_circle', text: 'Connected, 200 OK' },
    reachable: { cls: 'valid', icon: 'check_circle', text: 'Device responded (status unreadable from browser)' },
    invalid: { cls: 'invalid', icon: 'error', text: 'Responded but not OK' },
    unreachable: { cls: 'unreachable', icon: 'warning', text: "Couldn't verify from the browser" },
    unverifiable: { cls: 'unreachable', icon: 'info', text: "Can't be checked from this page" },
};
function fillDisplayStatusEl(key) {
    const wrap = displayStatusEls[key];
    if (!wrap)
        return;
    const meta = DISPLAY_STATE_META[displayStatus[key]] || DISPLAY_STATE_META.unknown;
    wrap.className = 'material-symbols-outlined status-icon status-icon--' + meta.cls + (meta.cls === 'checking' ? ' spin' : '');
    wrap.textContent = meta.icon;
    wrap.title = statusTitle(meta, displayDetail[key]);
    wrap.setAttribute('aria-label', wrap.title);
    setStatusDetailText('display:' + key, displayStatus[key], displayDetail[key]);
}
function renderDisplayStatusEl(key) {
    const wrap = el('span', { role: 'status', 'aria-live': 'polite' });
    displayStatusEls[key] = wrap;
    fillDisplayStatusEl(key);
    return wrap;
}
function renderDisplayDetailEl(key) {
    const p = renderStatusDetailEl('display:' + key);
    setStatusDetailText('display:' + key, displayStatus[key], displayDetail[key]);
    return p;
}
function renderDisplayRetestButton(key) {
    return retestButtonEl(displayPending[key], displayFieldsFilled(key), () => runDisplayTest(key));
}
const PROVIDER_TYPES = {
    google: { label: 'Google Calendar', oauth: true },
    outlook: { label: 'Outlook Calendar', oauth: true },
    apple: {
        label: 'Apple iCloud', creds: ['username', 'password'], testable: true, fixedUrl: 'https://caldav.icloud.com',
        credHint: {
            text: 'Use an App-Specific Password, not your regular iCloud password.',
            linkText: 'Learn how', linkHref: 'https://support.apple.com/en-us/102654',
        },
    },
    yahoo: {
        label: 'Yahoo', creds: ['username', 'password'], testable: true, fixedUrl: 'https://caldav.calendar.yahoo.com',
        credHint: { text: 'Use an app-specific password from your Yahoo account security settings, not your regular password.' },
    },
    caldav: { label: 'Generic CalDAV', creds: ['username', 'password', 'url'], testable: true },
    ics: { label: 'ICS Feed URLs', icsOnly: true },
};
const CRED_VERIFY_NOTE = "Your browser can't check these sign-in details for this service, so they're accepted as entered. BusyTime will try them from the device when it connects.";
const credStatusEls = {};
function credMissingFields(type) {
    const auth = settings.calendars[type] && settings.calendars[type].auth;
    return PROVIDER_TYPES[type].creds.filter((key) => !(auth && auth[key]));
}
function credHasCalendars(type) {
    const names = settings.calendars[type] && settings.calendars[type].calendars;
    return !!(names && names.length);
}
function credFieldsFilled(type) {
    return credMissingFields(type).length === 0 && credHasCalendars(type);
}
function credState(type) {
    return credFieldsFilled(type) ? 'valid' : 'incomplete';
}
const CRED_STATE_META = {
    valid: { cls: 'valid', icon: 'check_circle', text: 'All details entered - BusyTime will verify them when it connects' },
    incomplete: { cls: 'unreachable', icon: 'warning', text: 'Enter all details and a calendar name so BusyTime can connect' },
};
function fillCredStatusEl(type) {
    const wrap = credStatusEls[type];
    if (!wrap)
        return;
    const meta = CRED_STATE_META[credState(type)];
    wrap.className = 'material-symbols-outlined status-icon status-icon--' + meta.cls;
    wrap.textContent = meta.icon;
    wrap.title = meta.text;
    wrap.setAttribute('aria-label', meta.text);
}
function renderCredStatusEl(type) {
    const wrap = el('span', { role: 'status', 'aria-live': 'polite' });
    credStatusEls[type] = wrap;
    fillCredStatusEl(type);
    return wrap;
}
function retestButtonEl(pending, filled, onClick, readyTitle) {
    const label = pending ? 'Testing connection' : (filled ? (readyTitle || 'Test connection') : 'Fill in all fields before testing');
    const btn = el('button', { class: 'icon-only btn-secondary', type: 'button', 'aria-label': label, title: label }, [
        el('span', { class: 'material-symbols-outlined' + (pending ? ' spin' : ''), 'aria-hidden': 'true' }, ['refresh']),
    ]);
    btn.disabled = pending || !filled;
    btn.addEventListener('click', onClick);
    return btn;
}
function passwordFieldEl(initialValue, onInput) {
    const wrap = el('div', { class: 'password-row' });
    const input = el('input', { type: 'password', value: initialValue });
    input.addEventListener('input', () => onInput(input.value));
    const icon = el('span', { class: 'material-symbols-outlined', 'aria-hidden': 'true' }, ['visibility']);
    const toggle = el('button', { class: 'icon-only btn-secondary', type: 'button', 'aria-label': 'Show password', title: 'Show password' }, [icon]);
    toggle.addEventListener('click', () => {
        input.type = input.type === 'password' ? 'text' : 'password';
        icon.textContent = input.type === 'password' ? 'visibility' : 'visibility_off';
        const label = input.type === 'password' ? 'Show password' : 'Hide password';
        toggle.setAttribute('aria-label', label);
        toggle.title = label;
    });
    wrap.appendChild(input);
    wrap.appendChild(toggle);
    return wrap;
}
const icsUrlStatus = {};
const icsUrlDetail = {};
const icsUrlPending = {};
const icsUrlStatusEls = {};
function resetConnectionTestState() {
    [displayStatus, displayDetail, displayPending, displayStatusEls, statusDetailEls, credStatusEls,
        icsUrlStatus, icsUrlDetail, icsUrlPending, icsUrlStatusEls].forEach((map) => {
        Object.keys(map).forEach((key) => delete map[key]);
    });
}
async function testIcsUrl(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
        const response = await fetch(url, { method: 'GET', signal: controller.signal, cache: 'no-store' });
        if (!response.ok) {
            icsUrlDetail[url] = `HTTP ${response.status} - not found or access denied.`;
            return 'invalid';
        }
        const text = await response.text();
        if (text.includes('BEGIN:VCALENDAR')) {
            icsUrlDetail[url] = '';
            return 'valid';
        }
        icsUrlDetail[url] = 'Responded OK but the body is not a valid .ics feed.';
        return 'invalid';
    }
    catch (e) {
        icsUrlDetail[url] = `Your browser couldn't read this URL. It may be a wrong URL, a network issue, or something the browser won't allow. BusyTime will try it from the device. (${describeFetchError(e)})`;
        return 'unreachable';
    }
    finally {
        clearTimeout(timer);
    }
}
async function runIcsUrlTest(url, onDone) {
    const epoch = sessionEpoch;
    icsUrlPending[url] = true;
    icsUrlStatus[url] = 'checking';
    icsUrlDetail[url] = '';
    fillIcsUrlStatusEl(url);
    const result = await testIcsUrl(url);
    if (epoch !== sessionEpoch)
        return;
    icsUrlStatus[url] = result;
    icsUrlPending[url] = false;
    rerenderProviderUi('ics');
    if (onDone)
        onDone();
}
function ensureIcsUrlChecked(url) {
    if (icsUrlStatus[url] && icsUrlStatus[url] !== 'unknown')
        return;
    runIcsUrlTest(url);
}
const ICS_STATE_META = {
    unknown: { cls: 'unknown', icon: 'radio_button_unchecked', text: 'Not yet tested' },
    checking: { cls: 'checking', icon: 'sync', text: 'Checking\u2026' },
    valid: { cls: 'valid', icon: 'check_circle', text: 'Feed reachable and valid' },
    invalid: { cls: 'invalid', icon: 'error', text: 'Not a valid .ics feed' },
    unreachable: { cls: 'unreachable', icon: 'warning', text: "Couldn't verify from the browser" },
};
function fillIcsUrlStatusEl(url) {
    const wrap = icsUrlStatusEls[url];
    if (!wrap)
        return;
    const meta = ICS_STATE_META[icsUrlStatus[url]] || ICS_STATE_META.unknown;
    wrap.className = 'material-symbols-outlined status-icon status-icon--' + meta.cls + (meta.cls === 'checking' ? ' spin' : '');
    wrap.textContent = meta.icon;
    wrap.title = statusTitle(meta, icsUrlDetail[url]);
    wrap.setAttribute('aria-label', wrap.title);
    setStatusDetailText('ics:' + url, icsUrlStatus[url], icsUrlDetail[url]);
}
function renderIcsStatusList(urls) {
    const urlSet = new Set(urls);
    Object.keys(icsUrlStatus).forEach((u) => { if (!urlSet.has(u)) {
        delete icsUrlStatus[u];
        delete icsUrlDetail[u];
        delete icsUrlPending[u];
        delete icsUrlStatusEls[u];
    } });
    const wrap = el('div', {});
    urls.forEach((url) => {
        ensureIcsUrlChecked(url);
        const row = el('div', { class: 'add-row' });
        row.appendChild(el('span', { class: 'field-help', title: url }, [url.length > 50 ? url.slice(0, 47) + '\u2026' : url]));
        const statusEl = el('span', { role: 'status', 'aria-live': 'polite' });
        icsUrlStatusEls[url] = statusEl;
        fillIcsUrlStatusEl(url);
        row.appendChild(statusEl);
        row.appendChild(retestButtonEl(!!icsUrlPending[url], true, () => runIcsUrlTest(url, () => { }), 'Test this URL'));
        const detailEl = renderStatusDetailEl('ics:' + url);
        setStatusDetailText('ics:' + url, icsUrlStatus[url], icsUrlDetail[url]);
        row.appendChild(detailEl);
        wrap.appendChild(row);
    });
    return wrap;
}
function icsAggregateStatus(urls) {
    if (!urls.length)
        return 'unknown';
    const statuses = urls.map((u) => icsUrlStatus[u] || 'unknown');
    if (statuses.some((s) => s === 'invalid'))
        return 'invalid';
    if (statuses.some((s) => s === 'unreachable'))
        return 'unreachable';
    if (statuses.some((s) => s === 'checking'))
        return 'checking';
    if (statuses.every((s) => s === 'valid'))
        return 'valid';
    return 'unknown';
}
