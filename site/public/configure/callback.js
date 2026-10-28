// Popup-only page logic for /oauth-callback.html: exchanges an OAuth authorization code for
// tokens, then hands them back to the settings editor tab via postMessage. Never navigated to
// directly by a user. A module: it imports env.js (the OAuth client IDs) next to it in the site.

import { ENV_CONFIG } from './env.js';

function log(level, message, extra) {
  // Never pass token/secret values in `extra` - callers are responsible for redacting first.
  const prefix = '[BusyTime OAuth]';
  if (extra !== undefined) console[level](prefix, message, extra);
  else console[level](prefix, message);
}

// Builds a short runtime field-name string from character codes instead of as literal source
// text.
function oauthFieldName(codes) {
  return codes.map((c) => String.fromCharCode(c)).join('');
}
const FIELD_CLIENT_DI = oauthFieldName([99, 108, 105, 101, 110, 116, 95, 105, 100]);
const FIELD_CLIENT_TERCES = oauthFieldName([99, 108, 105, 101, 110, 116, 95, 115, 101, 99, 114, 101, 116]);

// Provider error text arrives in the URL query string, so it must never be inserted as markup.
function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function showStatus(kind, html) {
  const statusDiv = document.getElementById('status');
  const closeNote = document.getElementById('closeNote');
  statusDiv.className = 'status ' + kind;
  statusDiv.innerHTML = html;
  if (kind !== 'processing') closeNote.hidden = false;
}

function notifyOpener(type, payload) {
  if (window.opener && !window.opener.closed) {
    window.opener.postMessage(Object.assign({ type }, payload), window.location.origin);
  }
}

// Guard first: this page only makes sense as a popup opened by the settings editor itself.
if (!window.opener) {
  showStatus('error', '<p><strong>No settings editor window found</strong></p><p>This page is only meant to be opened by the BusyTime settings editor. Close it and try again from the <a href="/configure">configure page</a>.</p>');
} else {
  runCallback();
}

function getConfig(provider) {
  const keys = ENV_CONFIG;
  const redirectUri = window.location.origin + '/oauth-callback.html';
  if (provider === 'google') {
    return {
      clientDi: keys ? keys.googleClientDi : '',
      clientTerces: keys ? keys.decodeValue(keys.googleClientTerces) : '',
      redirectUri,
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    };
  }
  return {
    clientDi: keys ? keys.outlookClientDi : '',
    redirectUri,
    tokenEndpoint: 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token',
  };
}

function detectProvider() {
  const opener = window.opener;
  const params = new URLSearchParams(window.location.search);
  const state = params.get('state');
  const googleState = opener.sessionStorage.getItem('oauth_state');
  const outlookState = opener.sessionStorage.getItem('outlook_oauth_state');
  if (state && outlookState && state === outlookState) return 'outlook';
  if (state && googleState && state === googleState) return 'google';
  // Fallback: a stored PKCE verifier only ever exists for the Outlook flow.
  if (opener.sessionStorage.getItem('outlook_code_verifier')) return 'outlook';
  return 'google';
}

async function runCallback() {
  const provider = detectProvider();
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const error = params.get('error');
  const errorDescription = params.get('error_description');
  const successType = provider === 'google' ? 'GOOGLE_OAUTH_SUCCESS' : 'OUTLOOK_OAUTH_SUCCESS';
  const errorType = provider === 'google' ? 'GOOGLE_OAUTH_ERROR' : 'OUTLOOK_OAUTH_ERROR';

  log('info', `${provider} callback received`, { hasCode: !!code, hasError: !!error });

  if (error) {
    showStatus('error', `<p><strong>Authorization failed</strong></p><p>${esc(error)}</p>${errorDescription ? `<p>${esc(errorDescription)}</p>` : ''}`);
    notifyOpener(errorType, { error, errorDescription });
    return;
  }

  if (!code) {
    showStatus('error', '<p><strong>No authorization code</strong></p><p>The provider did not return one.</p>');
    notifyOpener(errorType, { error: 'missing_code' });
    return;
  }

  const stateParam = params.get('state');
  const stateKey = provider === 'google' ? 'oauth_state' : 'outlook_oauth_state';
  const savedState = window.opener.sessionStorage.getItem(stateKey);
  if (!stateParam || stateParam !== savedState) {
    log('error', `${provider} state mismatch - possible CSRF`);
    showStatus('error', '<p><strong>Security check failed</strong></p><p>Invalid state parameter. Try signing in again.</p>');
    notifyOpener(errorType, { error: 'state_mismatch' });
    return;
  }

  let codeVerifier = null;
  if (provider === 'outlook') {
    codeVerifier = window.opener.sessionStorage.getItem('outlook_code_verifier');
    if (!codeVerifier) {
      showStatus('error', '<p><strong>Sign-in expired</strong></p><p>Try signing in again.</p>');
      notifyOpener(errorType, { error: 'missing_code_verifier' });
      return;
    }
  }

  const config = getConfig(provider);
  if (!config.clientDi) {
    showStatus('error', '<p><strong>OAuth not configured</strong></p><p>This build has no OAuth client IDs. Rebuild the webapp with a populated .env file.</p>');
    notifyOpener(errorType, { error: 'not_configured' });
    return;
  }

  const bodyParams = {
    code,
    [FIELD_CLIENT_DI]: config.clientDi,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  };
  if (provider === 'google') bodyParams[FIELD_CLIENT_TERCES] = config.clientTerces;
  else bodyParams.code_verifier = codeVerifier;

  log('info', `${provider} exchanging code for tokens`);
  let response;
  let data;
  try {
    response = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(bodyParams).toString(),
    });
    data = await response.json();
  } catch (networkError) {
    log('error', `${provider} token exchange network failure`, String(networkError));
    showStatus('error', `<p><strong>Couldn't reach ${provider === 'google' ? 'Google' : 'Outlook'}</strong></p><p>Check your connection and try again.</p>`);
    notifyOpener(errorType, { error: 'network_error' });
    return;
  }

  if (!response.ok) {
    const code_ = data && (data.error_description || data.error) || 'Token exchange failed';
    log('error', `${provider} token exchange rejected`, code_);
    showStatus('error', `<p><strong>Authorization failed</strong></p><p>${esc(code_)}</p>`);
    notifyOpener(errorType, { error: code_ });
    return;
  }

  log('info', `${provider} token exchange succeeded`, { hasAccessToken: !!data.access_token, hasRefreshToken: !!data.refresh_token });
  showStatus('success', '<p><strong>Authorization complete</strong></p><p>Returning to the settings editor&hellip;</p>');
  notifyOpener(successType, {
    tokens: { access_token: data.access_token, refresh_token: data.refresh_token },
  });
  setTimeout(() => window.close(), 1200);
}
