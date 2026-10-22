"use strict";
function oauthLog(level, message, extra) {
    if (extra !== undefined)
        console[level]('[BusyTime OAuth]', message, extra);
    else
        console[level]('[BusyTime OAuth]', message);
}
function oauthKeysAvailable() {
    return !!ENV_CONFIG.googleClientDi;
}
function oauthOriginSupported() {
    return window.location.protocol === 'http:' || window.location.protocol === 'https:';
}
const OAUTH_NEEDS_HTTP_MESSAGE = 'Sign-in needs this page served over http(s), not opened as a file. Run a local server (e.g. "python -m http.server" in this folder) and open http://localhost:<port>/index.html.';
function oauthFieldName(codes) {
    return codes.map((c) => String.fromCharCode(c)).join('');
}
const FIELD_CLIENT_DI = oauthFieldName([99, 108, 105, 101, 110, 116, 95, 105, 100]);
const FIELD_CLIENT_TERCES = oauthFieldName([99, 108, 105, 101, 110, 116, 95, 115, 101, 99, 114, 101, 116]);
const GOOGLE_OAUTH = {
    get clientDi() { return ENV_CONFIG.googleClientDi; },
    get clientSecret() { return ENV_CONFIG.decodeValue(ENV_CONFIG.googleClientTerces); },
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
};
const OUTLOOK_OAUTH = {
    get clientDi() { return ENV_CONFIG.outlookClientDi; },
    scope: 'https://graph.microsoft.com/Calendars.Read offline_access',
    authEndpoint: 'https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize',
    tokenEndpoint: 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token',
};
const OUTLOOK_COLOR_HEX = {
    lightBlue: '#a6cbf0', lightGreen: '#a6e2ad', lightOrange: '#f8c497', lightGray: '#cccccc',
    lightYellow: '#f7e79a', lightTeal: '#a6d9d9', lightPink: '#f4a6c0', lightBrown: '#c8b8a6',
    lightRed: '#f0a6a6', maxColor: '#a6a6f0', auto: '#9e9e9e',
};
function outlookColorToHex(name) { return OUTLOOK_COLOR_HEX[name] || OUTLOOK_COLOR_HEX.auto; }
function base64URLEncode(buffer) {
    let binary = '';
    for (let i = 0; i < buffer.byteLength; i++)
        binary += String.fromCharCode(buffer[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function generateStateParameter() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return base64URLEncode(array);
}
function generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return base64URLEncode(array);
}
async function generateCodeChallenge(verifier) {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    return base64URLEncode(new Uint8Array(hash));
}
function openCenteredPopup(url, name) {
    const width = 600, height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    return window.open(url, name, `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`);
}
async function fetchJsonWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs || 15000);
    try {
        const response = await fetch(url, Object.assign({}, options, { signal: controller.signal }));
        let data = null;
        try {
            data = await response.json();
        }
        catch (e) { }
        return { response, data };
    }
    finally {
        clearTimeout(timer);
    }
}
const oauthStatus = { google: 'unknown', outlook: 'unknown' };
const oauthDetail = { google: '', outlook: '' };
const oauthAttemptError = { google: null, outlook: null };
const oauthPending = { google: false, outlook: false };
const calendarListCache = { google: null, outlook: null };
const calendarListError = { google: null, outlook: null };
let oauthPopupWatcher = null;
let oauthPopup = null;
function resetOauthState() {
    clearPopupWatcher();
    try {
        if (oauthPopup && !oauthPopup.closed)
            oauthPopup.close();
    }
    catch (e) { }
    oauthPopup = null;
    ['google', 'outlook'].forEach((p) => {
        oauthStatus[p] = 'unknown';
        oauthDetail[p] = '';
        oauthAttemptError[p] = null;
        oauthPending[p] = false;
        calendarListCache[p] = null;
        calendarListError[p] = null;
    });
    ['oauth_state', 'outlook_code_verifier', 'outlook_oauth_state'].forEach((k) => sessionStorage.removeItem(k));
}
function hasTokens(type) {
    const auth = settings && settings.calendars[type] && settings.calendars[type].auth;
    return !!(auth && auth.access_token && auth.refresh_token);
}
function rerenderProviderUi(type) {
    if (!settings)
        return;
    if (currentStepId === 'calendars:' + type || currentStepId === 'calendars')
        renderMain();
    renderSidebar();
}
function clearPopupWatcher() {
    if (oauthPopupWatcher) {
        clearInterval(oauthPopupWatcher.interval);
        clearTimeout(oauthPopupWatcher.timeout);
        oauthPopupWatcher = null;
    }
}
function handlePopupCancelled(type, message) {
    oauthPending[type] = false;
    oauthAttemptError[type] = message;
    oauthLog('warn', `${type} sign-in not completed: ${message}`);
    rerenderProviderUi(type);
}
function watchPopup(popup, type) {
    clearPopupWatcher();
    oauthPopup = popup;
    const interval = setInterval(() => {
        let closed = false;
        try {
            closed = popup.closed;
        }
        catch (e) {
            return;
        }
        if (closed) {
            clearPopupWatcher();
            handlePopupCancelled(type, 'Sign-in cancelled.');
        }
    }, 500);
    const timeout = setTimeout(() => {
        try {
            if (!popup.closed)
                popup.close();
        }
        catch (e) { }
        clearPopupWatcher();
        handlePopupCancelled(type, 'Timed out waiting for authorization - please try again.');
    }, 5 * 60 * 1000);
    oauthPopupWatcher = { interval, timeout };
}
function startGoogleAuth() {
    if (!oauthOriginSupported() || !oauthKeysAvailable() || oauthPending.google)
        return;
    oauthPending.google = true;
    oauthAttemptError.google = null;
    rerenderProviderUi('google');
    const state = generateStateParameter();
    sessionStorage.setItem('oauth_state', state);
    const params = new URLSearchParams({
        [FIELD_CLIENT_DI]: GOOGLE_OAUTH.clientDi,
        redirect_uri: window.location.origin + '/oauth-callback.html',
        response_type: 'code',
        scope: GOOGLE_OAUTH.scope,
        access_type: 'offline',
        prompt: 'consent',
        state,
    });
    const popup = openCenteredPopup(`${GOOGLE_OAUTH.authEndpoint}?${params.toString()}`, 'BusyTimeGoogleOAuth');
    if (!popup) {
        handlePopupCancelled('google', 'Popup blocked - allow popups for this site and try again.');
        return;
    }
    oauthLog('info', 'google sign-in started');
    watchPopup(popup, 'google');
}
function startOutlookAuth() {
    if (!oauthOriginSupported() || !oauthKeysAvailable() || oauthPending.outlook)
        return;
    oauthPending.outlook = true;
    oauthAttemptError.outlook = null;
    rerenderProviderUi('outlook');
    (async () => {
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        const state = generateStateParameter();
        sessionStorage.setItem('outlook_code_verifier', codeVerifier);
        sessionStorage.setItem('outlook_oauth_state', state);
        const params = new URLSearchParams({
            [FIELD_CLIENT_DI]: OUTLOOK_OAUTH.clientDi,
            response_type: 'code',
            redirect_uri: window.location.origin + '/oauth-callback.html',
            response_mode: 'query',
            scope: OUTLOOK_OAUTH.scope,
            state,
            prompt: 'consent',
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        });
        const popup = openCenteredPopup(`${OUTLOOK_OAUTH.authEndpoint}?${params.toString()}`, 'BusyTimeOutlookOAuth');
        if (!popup) {
            handlePopupCancelled('outlook', 'Popup blocked - allow popups for this site and try again.');
            return;
        }
        oauthLog('info', 'outlook sign-in started');
        watchPopup(popup, 'outlook');
    })();
}
async function verifyGoogleToken() {
    const auth = settings.calendars.google.auth;
    try {
        const { response, data } = await fetchJsonWithTimeout('https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1', {
            headers: { Authorization: `Bearer ${auth.access_token}` },
        });
        if (response.ok) {
            oauthDetail.google = '';
            oauthLog('info', 'google token verified');
            return 'valid';
        }
        const status = data && data.error && data.error.status;
        if (response.status === 401 || status === 'UNAUTHENTICATED') {
            oauthLog('warn', 'google token expired, attempting refresh');
            return refreshGoogleToken();
        }
        oauthDetail.google = `HTTP ${response.status}${status ? ' (' + status + ')' : ''}`;
        oauthLog('warn', 'google verify unexpected response', oauthDetail.google);
        return 'unreachable';
    }
    catch (e) {
        oauthDetail.google = e.name === 'AbortError' ? 'Request timed out' : 'Network error';
        oauthLog('warn', 'google verify failed', oauthDetail.google);
        return 'unreachable';
    }
}
async function refreshGoogleToken() {
    const epoch = sessionEpoch;
    try {
        const { response, data } = await fetchJsonWithTimeout(GOOGLE_OAUTH.tokenEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                [FIELD_CLIENT_DI]: GOOGLE_OAUTH.clientDi,
                [FIELD_CLIENT_TERCES]: GOOGLE_OAUTH.clientSecret,
                refresh_token: settings.calendars.google.auth.refresh_token,
                grant_type: 'refresh_token',
            }).toString(),
        });
        if (epoch !== sessionEpoch)
            return 'unknown';
        if (!response.ok || (data && data.error)) {
            const code = data && data.error;
            if (code === 'invalid_grant') {
                oauthDetail.google = 'invalid_grant - refresh token revoked or expired';
                oauthLog('warn', 'google refresh token invalid/revoked');
                return 'invalid';
            }
            oauthDetail.google = code || `HTTP ${response.status}`;
            oauthLog('error', 'google refresh unexpected error', oauthDetail.google);
            return 'unreachable';
        }
        settings.calendars.google.auth.access_token = data.access_token;
        oauthDetail.google = '';
        dirty = true;
        oauthLog('info', 'google token refreshed');
        return 'valid';
    }
    catch (e) {
        oauthDetail.google = e.name === 'AbortError' ? 'Request timed out' : 'Network error';
        oauthLog('warn', 'google refresh failed', oauthDetail.google);
        return 'unreachable';
    }
}
async function verifyOutlookToken() {
    const auth = settings.calendars.outlook.auth;
    try {
        const { response, data } = await fetchJsonWithTimeout('https://graph.microsoft.com/v1.0/me/calendars?$top=1', {
            headers: { Authorization: `Bearer ${auth.access_token}` },
        });
        if (response.ok) {
            oauthDetail.outlook = '';
            oauthLog('info', 'outlook token verified');
            return 'valid';
        }
        const code = data && data.error && data.error.code;
        if (response.status === 401 || code === 'InvalidAuthenticationToken') {
            oauthLog('warn', 'outlook token expired, attempting refresh');
            return refreshOutlookToken();
        }
        oauthDetail.outlook = `HTTP ${response.status}${code ? ' (' + code + ')' : ''}`;
        oauthLog('warn', 'outlook verify unexpected response', oauthDetail.outlook);
        return 'unreachable';
    }
    catch (e) {
        oauthDetail.outlook = e.name === 'AbortError' ? 'Request timed out' : 'Network error';
        oauthLog('warn', 'outlook verify failed', oauthDetail.outlook);
        return 'unreachable';
    }
}
async function refreshOutlookToken() {
    const epoch = sessionEpoch;
    try {
        const { response, data } = await fetchJsonWithTimeout(OUTLOOK_OAUTH.tokenEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                [FIELD_CLIENT_DI]: OUTLOOK_OAUTH.clientDi,
                refresh_token: settings.calendars.outlook.auth.refresh_token,
                grant_type: 'refresh_token',
                scope: OUTLOOK_OAUTH.scope,
            }).toString(),
        });
        if (epoch !== sessionEpoch)
            return 'unknown';
        if (!response.ok || (data && data.error)) {
            const code = data && data.error;
            if (code === 'invalid_grant') {
                oauthDetail.outlook = 'invalid_grant - refresh token revoked or expired';
                oauthLog('warn', 'outlook refresh token invalid/revoked');
                return 'invalid';
            }
            oauthDetail.outlook = code || `HTTP ${response.status}`;
            oauthLog('error', 'outlook refresh unexpected error', oauthDetail.outlook);
            return 'unreachable';
        }
        settings.calendars.outlook.auth.access_token = data.access_token;
        if (data.refresh_token)
            settings.calendars.outlook.auth.refresh_token = data.refresh_token;
        oauthDetail.outlook = '';
        dirty = true;
        oauthLog('info', 'outlook token refreshed');
        return 'valid';
    }
    catch (e) {
        oauthDetail.outlook = e.name === 'AbortError' ? 'Request timed out' : 'Network error';
        oauthLog('warn', 'outlook refresh failed', oauthDetail.outlook);
        return 'unreachable';
    }
}
async function fetchCalendarList(type) {
    calendarListError[type] = null;
    try {
        if (type === 'google') {
            const { response, data } = await fetchJsonWithTimeout('https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=250', {
                headers: { Authorization: `Bearer ${settings.calendars.google.auth.access_token}` },
            });
            if (!response.ok)
                throw new Error('HTTP ' + response.status);
            calendarListCache.google = (data.items || []).map((c) => ({ id: c.id, name: c.summary || c.id, color: c.backgroundColor || null }));
        }
        else {
            const { response, data } = await fetchJsonWithTimeout('https://graph.microsoft.com/v1.0/me/calendars', {
                headers: { Authorization: `Bearer ${settings.calendars.outlook.auth.access_token}` },
            });
            if (!response.ok)
                throw new Error('HTTP ' + response.status);
            calendarListCache.outlook = (data.value || []).map((c) => ({ id: c.id, name: c.name || c.id, color: outlookColorToHex(c.color) }));
        }
        oauthLog('info', `${type} calendar list fetched`, { count: calendarListCache[type].length });
    }
    catch (e) {
        oauthLog('warn', `${type} calendar list fetch failed`, String(e));
        calendarListError[type] = "Couldn't load the calendar list - try Refresh.";
    }
}
function ensureOauthStatusChecked(type) {
    if (!hasTokens(type)) {
        oauthStatus[type] = 'unknown';
        return;
    }
    if (oauthStatus[type] !== 'unknown')
        return;
    oauthStatus[type] = 'checking';
    const verify = type === 'google' ? verifyGoogleToken : verifyOutlookToken;
    const epoch = sessionEpoch;
    verify().then((result) => {
        if (epoch !== sessionEpoch)
            return;
        oauthStatus[type] = result;
        if (result === 'valid' && !calendarListCache[type]) {
            fetchCalendarList(type).finally(() => { if (epoch === sessionEpoch)
                rerenderProviderUi(type); });
        }
        else {
            rerenderProviderUi(type);
        }
    });
}
async function refreshProviderConnection(type) {
    if (oauthStatus[type] === 'checking')
        return;
    oauthStatus[type] = 'checking';
    calendarListError[type] = null;
    rerenderProviderUi(type);
    const verify = type === 'google' ? verifyGoogleToken : verifyOutlookToken;
    const epoch = sessionEpoch;
    const result = await verify();
    if (epoch !== sessionEpoch)
        return;
    oauthStatus[type] = result;
    if (result === 'valid')
        await fetchCalendarList(type);
    if (epoch !== sessionEpoch)
        return;
    rerenderProviderUi(type);
}
function computeOauthDisplayState(type) {
    if (!oauthOriginSupported() && !hasTokens(type))
        return 'needs_http';
    if (!oauthKeysAvailable())
        return 'not_configured';
    if (oauthPending[type])
        return 'pending';
    if (!hasTokens(type))
        return 'signed_out';
    return oauthStatus[type];
}
const OAUTH_STATE_META = {
    needs_http: { cls: 'not-configured', icon: 'link_off', text: 'Sign-in unavailable from a local file' },
    not_configured: { cls: 'not-configured', icon: 'settings_off', text: 'OAuth not configured' },
    pending: { cls: 'checking', icon: 'sync', text: 'Waiting for authorization in the popup window\u2026' },
    signed_out: { cls: 'unknown', icon: 'radio_button_unchecked', text: 'Not signed in' },
    checking: { cls: 'checking', icon: 'sync', text: 'Checking\u2026' },
    valid: { cls: 'valid', icon: 'check_circle', text: 'Connected, token valid' },
    invalid: { cls: 'invalid', icon: 'error', text: 'Invalid, please reauthorize' },
    unreachable: { cls: 'unreachable', icon: 'warning', text: "Couldn't verify (network issue)" },
};
function renderOauthStatusEl(type) {
    const state = computeOauthDisplayState(type);
    const meta = OAUTH_STATE_META[state];
    const wrap = el('div', { class: 'oauth-status oauth-status--' + meta.cls, role: 'status', 'aria-live': 'polite' });
    wrap.appendChild(el('span', { class: 'material-symbols-outlined' + (state === 'checking' || state === 'pending' ? ' spin' : '') }, [meta.icon]));
    wrap.appendChild(el('span', {}, [meta.text]));
    if ((state === 'invalid' || state === 'unreachable') && oauthDetail[type]) {
        const details = document.createElement('details');
        details.className = 'oauth-status-details';
        const summary = document.createElement('summary');
        summary.textContent = 'Details';
        details.appendChild(summary);
        details.appendChild(document.createTextNode(oauthDetail[type]));
        wrap.appendChild(details);
    }
    if (state === 'not_configured') {
        wrap.appendChild(el('span', { class: 'field-help' }, [' - set OUTLOOK_CLIENT_ID in .env and rebuild, see .env.example']));
    }
    return wrap;
}
function renderOauthActions(type) {
    const wrap = el('div', {});
    const buttonRow = el('div', { class: 'add-row' });
    const pending = oauthPending[type];
    const configured = oauthKeysAvailable() && oauthOriginSupported();
    const label = hasTokens(type) ? 'Reauthorize' : `Sign in with ${(PROVIDER_TYPES[type] || {}).label || type}`;
    const signInBtn = el('button', { class: 'md-button-filled', type: 'button' }, [pending ? 'Waiting for authorization\u2026' : label]);
    signInBtn.disabled = pending || !configured;
    if (!oauthOriginSupported())
        signInBtn.title = OAUTH_NEEDS_HTTP_MESSAGE;
    else if (!configured)
        signInBtn.title = 'Set the OAuth client IDs in .env and rebuild to enable sign-in (see .env.example)';
    signInBtn.addEventListener('click', () => { if (type === 'google')
        startGoogleAuth();
    else
        startOutlookAuth(); });
    buttonRow.appendChild(signInBtn);
    if (hasTokens(type)) {
        const refreshBtn = el('button', { class: 'md-button-outlined', type: 'button' }, [el('span', { class: 'material-symbols-outlined' }, ['refresh']), 'Refresh']);
        refreshBtn.disabled = pending || oauthStatus[type] === 'checking';
        refreshBtn.addEventListener('click', () => { refreshProviderConnection(type); });
        buttonRow.appendChild(refreshBtn);
    }
    wrap.appendChild(buttonRow);
    if (!oauthOriginSupported())
        wrap.appendChild(el('p', { class: 'warning-text' }, [OAUTH_NEEDS_HTTP_MESSAGE]));
    if (oauthAttemptError[type])
        wrap.appendChild(el('p', { class: 'warning-text' }, [oauthAttemptError[type]]));
    return wrap;
}
function renderCalendarPicker(type, target) {
    const wrap = el('div', {});
    const list = calendarListCache[type];
    if (calendarListError[type])
        wrap.appendChild(el('p', { class: 'warning-text' }, [calendarListError[type]]));
    if (!list) {
        if (!calendarListError[type])
            wrap.appendChild(el('p', { class: 'field-help' }, ['Calendar list not loaded yet.']));
        return wrap;
    }
    const known = new Map(list.map((c) => [c.id, c]));
    const rows = list.slice();
    target.calendars.forEach((id) => { if (!known.has(id))
        rows.push({ id, name: id, color: null, notFound: true }); });
    if (!rows.length)
        wrap.appendChild(el('p', { class: 'field-help' }, ['No calendars found in this account.']));
    rows.forEach((cal) => {
        const row = el('div', { class: 'calendar-picker-row', title: cal.id });
        const checkbox = el('input', { type: 'checkbox', 'aria-label': `Monitor ${cal.name}` });
        checkbox.checked = target.calendars.includes(cal.id);
        checkbox.addEventListener('change', () => {
            const idx = target.calendars.indexOf(cal.id);
            if (checkbox.checked && idx === -1)
                target.calendars.push(cal.id);
            else if (!checkbox.checked && idx !== -1)
                target.calendars.splice(idx, 1);
        });
        row.appendChild(checkbox);
        row.appendChild(el('span', { class: 'color-square', style: `background:${cal.color || '#9e9e9e'};` }));
        row.appendChild(el('span', { class: 'calendar-picker-name' }, [cal.name]));
        if (cal.notFound)
            row.appendChild(el('span', { class: 'warning-text' }, ['not found in this account']));
        wrap.appendChild(row);
    });
    return wrap;
}
window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin)
        return;
    const msg = event.data;
    if (!msg || typeof msg.type !== 'string')
        return;
    const provider = msg.type.startsWith('GOOGLE_') ? 'google' : (msg.type.startsWith('OUTLOOK_') ? 'outlook' : null);
    if (!provider)
        return;
    clearPopupWatcher();
    oauthPending[provider] = false;
    if (msg.type.endsWith('_SUCCESS')) {
        if (!settings)
            return;
        if (!settings.calendars[provider])
            settings.calendars[provider] = { calendars: [] };
        if (!settings.calendars[provider].calendars)
            settings.calendars[provider].calendars = [];
        settings.calendars[provider].auth = { access_token: msg.tokens.access_token, refresh_token: msg.tokens.refresh_token };
        oauthAttemptError[provider] = null;
        oauthStatus[provider] = 'valid';
        oauthDetail[provider] = '';
        calendarListCache[provider] = null;
        calendarListError[provider] = null;
        dirty = true;
        oauthLog('info', `${provider} sign-in success`, { hasAccessToken: !!msg.tokens.access_token, hasRefreshToken: !!msg.tokens.refresh_token });
        fetchCalendarList(provider).finally(() => rerenderProviderUi(provider));
        rerenderProviderUi(provider);
    }
    else if (msg.type.endsWith('_ERROR')) {
        oauthAttemptError[provider] = msg.errorDescription || msg.error || 'Authorization failed';
        oauthLog('error', `${provider} sign-in error`, msg.error);
        rerenderProviderUi(provider);
    }
});
//# sourceMappingURL=oauth.js.map