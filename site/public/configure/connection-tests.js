// BusyTime configurator v1.0.8
import { DISPLAY_TYPES } from './config.js?v=1.0.8';
import { configuredDisplayTypes } from './helpers.js?v=1.0.8';
import { fetchJsonWithTimeout, rerenderProviderUi } from './oauth.js?v=1.0.8';
import { renderMain, renderSidebar } from './sidebar.js?v=1.0.8';
import { currentStepId, sessionEpoch, settings } from './state.js?v=1.0.8';
import { el } from './validation.js?v=1.0.8';
export { displayStatus, displayDetail, displayPending, displayStatusEls, displayFieldsFilled, describeFetchError, statusDetailEls, renderStatusDetailEl, setStatusDetailText, statusTitle, isMixedContentBlocked, testDisplayConnection, runDisplayTest, testableDisplayTypes, testAllDisplays, rerenderDisplayUi, ensureDisplayStatusChecked, DISPLAY_STATE_META, fillDisplayStatusEl, renderDisplayStatusEl, renderDisplayDetailEl, renderDisplayRetestButton, PROVIDER_TYPES, credStatus, credDetail, credPending, credStatusEls, credFieldsFilled, credRootUrl, testCredAuth, runCredTest, ensureCredStatusChecked, CRED_STATE_META, fillCredStatusEl, renderCredStatusEl, renderCredDetailEl, renderCredRetestButton, retestButtonEl, passwordFieldEl, icsUrlStatus, icsUrlDetail, icsUrlPending, icsUrlStatusEls, resetConnectionTestState, testIcsUrl, runIcsUrlTest, ensureIcsUrlChecked, ICS_STATE_META, fillIcsUrlStatusEl, renderIcsStatusList, icsAggregateStatus, };
function connDisplayMeta(type) {
    return DISPLAY_TYPES[type];
}
const displayStatus = {};
const displayDetail = {};
const displayPending = {};
const displayStatusEls = {};
function displayFieldsFilled(type) {
    const target = settings.displays[type];
    const cfg = connDisplayMeta(type);
    return !!(target && (cfg.testRequiredFields || cfg.requiredFields).every((key) => target[key]));
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
async function testDisplayConnection(type) {
    const cfg = connDisplayMeta(type);
    const { url, options } = cfg.buildTestRequest(settings.displays[type]);
    if (isMixedContentBlocked(url)) {
        displayDetail[type] = 'This page is served over https, so the browser blocks requests to http:// devices. Open the editor from a local file or http:// to test, or ignore this - the BusyTime device itself is not affected.';
        return 'unverifiable';
    }
    try {
        const { response } = await fetchJsonWithTimeout(url, options, 10000);
        if (response.ok) {
            displayDetail[type] = '';
            return 'valid';
        }
        displayDetail[type] = `HTTP ${response.status}`;
        return 'invalid';
    }
    catch (e) {
        let reason = describeFetchError(e);
        if (cfg.noCorsFallback) {
            try {
                await fetchJsonWithTimeout(url, Object.assign({}, options, { mode: 'no-cors' }), 10000);
                displayDetail[type] = "The device answered, but the browser can't read its status code (no CORS headers).";
                return 'reachable';
            }
            catch (e2) {
                reason = describeFetchError(e2);
            }
        }
        displayDetail[type] = `Couldn't reach the device from the browser - likely a CORS restriction, a wrong URL, or a network issue. The BusyTime device itself may still be able to reach it even if this check can't confirm it. Browser reported: ${reason}`;
        return 'unreachable';
    }
}
async function runDisplayTest(type) {
    const epoch = sessionEpoch;
    displayPending[type] = true;
    displayStatus[type] = 'checking';
    displayDetail[type] = '';
    fillDisplayStatusEl(type);
    const result = await testDisplayConnection(type);
    if (epoch !== sessionEpoch)
        return;
    displayStatus[type] = result;
    displayPending[type] = false;
    rerenderDisplayUi(type);
}
function testableDisplayTypes() {
    return configuredDisplayTypes().filter((type) => connDisplayMeta(type) && connDisplayMeta(type).testable);
}
function testAllDisplays() {
    testableDisplayTypes().filter((type) => displayFieldsFilled(type) && !displayPending[type]).forEach(runDisplayTest);
    renderMain();
}
function rerenderDisplayUi(type) {
    if (!settings)
        return;
    if (currentStepId === 'displays:' + type || currentStepId === 'displays')
        renderMain();
    renderSidebar();
}
function ensureDisplayStatusChecked(type) {
    if (!displayFieldsFilled(type)) {
        displayStatus[type] = 'unknown';
        return;
    }
    if (displayStatus[type] && displayStatus[type] !== 'unknown')
        return;
    runDisplayTest(type);
}
const DISPLAY_STATE_META = {
    unknown: { cls: 'unknown', icon: 'radio_button_unchecked', text: 'Not yet tested' },
    checking: { cls: 'checking', icon: 'sync', text: 'Checking\u2026' },
    valid: { cls: 'valid', icon: 'check_circle', text: 'Connected, 200 OK' },
    reachable: { cls: 'valid', icon: 'check_circle', text: 'Device responded (status unreadable from browser)' },
    invalid: { cls: 'invalid', icon: 'error', text: 'Responded but not OK' },
    unreachable: { cls: 'unreachable', icon: 'warning', text: "Couldn't verify (network/CORS issue)" },
    unverifiable: { cls: 'unreachable', icon: 'info', text: "Can't be checked from this page" },
};
function fillDisplayStatusEl(type) {
    const wrap = displayStatusEls[type];
    if (!wrap)
        return;
    const meta = DISPLAY_STATE_META[displayStatus[type]] || DISPLAY_STATE_META.unknown;
    wrap.className = 'material-symbols-outlined status-icon status-icon--' + meta.cls + (meta.cls === 'checking' ? ' spin' : '');
    wrap.textContent = meta.icon;
    wrap.title = statusTitle(meta, displayDetail[type]);
    wrap.setAttribute('aria-label', wrap.title);
    setStatusDetailText('display:' + type, displayStatus[type], displayDetail[type]);
}
function renderDisplayStatusEl(type) {
    const wrap = el('span', { role: 'status', 'aria-live': 'polite' });
    displayStatusEls[type] = wrap;
    fillDisplayStatusEl(type);
    return wrap;
}
function renderDisplayDetailEl(type) {
    const p = renderStatusDetailEl('display:' + type);
    setStatusDetailText('display:' + type, displayStatus[type], displayDetail[type]);
    return p;
}
function renderDisplayRetestButton(type) {
    return retestButtonEl(displayPending[type], displayFieldsFilled(type), () => runDisplayTest(type));
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
        corsNote: "iCloud's CalDAV service often blocks this check in a browser (CORS). If it reports unreachable, credentials are still saved as entered - the BusyTime device validates them directly when it connects.",
    },
    yahoo: {
        label: 'Yahoo', creds: ['username', 'password'], testable: true, fixedUrl: 'https://caldav.calendar.yahoo.com',
        credHint: { text: 'Use an app-specific password from your Yahoo account security settings, not your regular password.' },
        corsNote: "Yahoo's CalDAV service often blocks this check in a browser (CORS). If it reports unreachable, credentials are still saved as entered - the BusyTime device validates them directly when it connects.",
    },
    caldav: { label: 'Generic CalDAV', creds: ['username', 'password', 'url'], testable: true },
    ics: { label: 'ICS Feed URLs', icsOnly: true },
};
const credStatus = { apple: 'unknown', yahoo: 'unknown', caldav: 'unknown' };
const credDetail = { apple: '', yahoo: '', caldav: '' };
const credPending = { apple: false, yahoo: false, caldav: false };
const credStatusEls = {};
function credFieldsFilled(type) {
    const auth = settings.calendars[type] && settings.calendars[type].auth;
    const cfg = PROVIDER_TYPES[type];
    return !!(auth && cfg.creds.every((key) => auth[key]));
}
function credRootUrl(type) {
    const auth = settings.calendars[type] && settings.calendars[type].auth;
    return (auth && auth.url) || PROVIDER_TYPES[type].fixedUrl;
}
async function testCredAuth(type, rootUrl) {
    const auth = settings.calendars[type].auth;
    try {
        const basic = btoa(unescape(encodeURIComponent(`${auth.username}:${auth.password}`)));
        const { response } = await fetchJsonWithTimeout(rootUrl, {
            method: 'PROPFIND',
            headers: { Authorization: `Basic ${basic}`, Depth: '0', 'Content-Type': 'application/xml' },
            body: '<?xml version="1.0"?><D:propfind xmlns:D="DAV:"><D:prop><D:current-user-principal/></D:prop></D:propfind>',
        }, 10000);
        if (response.status === 401 || response.status === 403) {
            credDetail[type] = `HTTP ${response.status} - check the username/password.`;
            return 'invalid';
        }
        if (response.ok || response.status === 207) {
            credDetail[type] = '';
            return 'valid';
        }
        credDetail[type] = `HTTP ${response.status}`;
        return 'unreachable';
    }
    catch (e) {
        credDetail[type] = `Couldn't reach the server from the browser - likely a CORS restriction on this server (common for CalDAV servers not built for browser access), a wrong URL, or a network issue. The device may still be able to connect directly even if this check can't confirm it. Browser reported: ${describeFetchError(e)}`;
        return 'unreachable';
    }
}
async function runCredTest(type, rootUrl) {
    const epoch = sessionEpoch;
    credPending[type] = true;
    credStatus[type] = 'checking';
    credDetail[type] = '';
    fillCredStatusEl(type);
    const result = await testCredAuth(type, rootUrl);
    if (epoch !== sessionEpoch)
        return;
    credStatus[type] = result;
    credPending[type] = false;
    rerenderProviderUi(type);
}
function ensureCredStatusChecked(type) {
    if (!credFieldsFilled(type)) {
        credStatus[type] = 'unknown';
        return;
    }
    if (credStatus[type] !== 'unknown')
        return;
    runCredTest(type, credRootUrl(type));
}
const CRED_STATE_META = {
    unknown: { cls: 'unknown', icon: 'radio_button_unchecked', text: 'Not yet tested' },
    checking: { cls: 'checking', icon: 'sync', text: 'Checking\u2026' },
    valid: { cls: 'valid', icon: 'check_circle', text: 'Connected, credentials valid' },
    invalid: { cls: 'invalid', icon: 'error', text: 'Invalid username or password' },
    unreachable: { cls: 'unreachable', icon: 'warning', text: "Couldn't verify (network/CORS issue)" },
};
function fillCredStatusEl(type) {
    const wrap = credStatusEls[type];
    if (!wrap)
        return;
    const meta = CRED_STATE_META[credStatus[type]] || CRED_STATE_META.unknown;
    wrap.className = 'material-symbols-outlined status-icon status-icon--' + meta.cls + (meta.cls === 'checking' ? ' spin' : '');
    wrap.textContent = meta.icon;
    wrap.title = statusTitle(meta, credDetail[type]);
    wrap.setAttribute('aria-label', wrap.title);
    setStatusDetailText('cred:' + type, credStatus[type], credDetail[type]);
}
function renderCredStatusEl(type) {
    const wrap = el('span', { role: 'status', 'aria-live': 'polite' });
    credStatusEls[type] = wrap;
    fillCredStatusEl(type);
    return wrap;
}
function renderCredDetailEl(type) {
    const p = renderStatusDetailEl('cred:' + type);
    setStatusDetailText('cred:' + type, credStatus[type], credDetail[type]);
    return p;
}
function renderCredRetestButton(type) {
    return retestButtonEl(credPending[type], credFieldsFilled(type), () => runCredTest(type, credRootUrl(type)));
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
    Object.keys(credStatus).forEach((type) => { credStatus[type] = 'unknown'; credDetail[type] = ''; credPending[type] = false; });
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
        icsUrlDetail[url] = `Couldn't reach the URL from the browser - likely a CORS restriction, a wrong URL, or a network issue. The device may still be able to fetch it directly even if this check can't confirm it. Browser reported: ${describeFetchError(e)}`;
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
    unreachable: { cls: 'unreachable', icon: 'warning', text: "Couldn't verify (network/CORS issue)" },
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
