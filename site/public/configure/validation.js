// BusyTime configurator v1.0.9
import { CALENDAR_OPTIONAL_TEST_MODES, DISPLAY_TYPES, FIELD_UI_META, isHttpUrl, isValidTimeZone, STEP_META, TOP_LEVEL_ORDER, urlHasPath } from './config.js?v=1.0.9';
import { displayDetail, displayStatus, icsUrlDetail, icsUrlStatus, PROVIDER_TYPES } from './connection-tests.js?v=1.0.9';
import { activeDisplayTypes, configuredDisplayTypes } from './helpers.js?v=1.0.9';
import { computeOauthDisplayState, oauthDetail } from './oauth.js?v=1.0.9';
import { getSchema } from './schema.js?v=1.0.9';
import { settings } from './state.js?v=1.0.9';
import { shouldWarnWifiEmpty } from './wifi-step.js?v=1.0.9';
export { stepIdForInstancePath, friendlyAjvMessage, prettifyInstancePath, stepLabel, getValidationBuckets, stepOrDescendantHasIssue, sortedBucketKeys, rgbToHex, hexToRgb, el, helpLinkEl, fieldRow, renderSubStepTitle, };
let cachedAjvValidate = null;
function getAjvValidate() {
    if (!window.ajv2020)
        return null;
    if (!cachedAjvValidate) {
        const ajv = new window.ajv2020({ allErrors: true, strict: false });
        ajv.addFormat('uri', { type: 'string', validate: isHttpUrl });
        cachedAjvValidate = ajv.compile(getSchema());
    }
    return cachedAjvValidate;
}
function stepIdForInstancePath(path) {
    const parts = (path || '').split('/').filter(Boolean);
    if (!parts.length)
        return null;
    const [top, sub] = parts;
    if (top === 'wifis')
        return 'wifi';
    if (['test_mode', 'calendar_timezone_name', 'calendar_timezone_offset', 'calendar_hour_start', 'calendar_hour_end', 'calendar_days', 'pending_time'].includes(top))
        return 'schedule';
    if (top === 'displays')
        return sub ? 'displays:' + sub : 'displays';
    if (top === 'calendars')
        return sub ? 'calendars:' + sub : 'calendars';
    return null;
}
function friendlyAjvMessage(err) {
    const parts = (err.instancePath || '').split('/').filter(Boolean);
    const [top, sub] = parts;
    if (err.keyword === 'required' && top === 'calendars' && sub) {
        const missing = err.params && err.params.missingProperty;
        const label = (PROVIDER_TYPES[sub] || {}).label || sub;
        if ((sub === 'google' || sub === 'outlook') && missing === 'auth') {
            return `${label} needs OAuth sign-in - use the Sign in button on its Calendar Providers step.`;
        }
        if (['username', 'password', 'url'].includes(missing)) {
            return `${label} is missing its ${missing}.`;
        }
    }
    if (err.keyword === 'minItems' && top === 'calendars' && sub === 'ics') {
        return 'Add at least one .ics URL.';
    }
    if (err.keyword === 'format' && err.params && err.params.format === 'uri') {
        return `${prettifyInstancePath(parts)} needs a valid HTTP or HTTPS URL.`;
    }
    const prettyPath = prettifyInstancePath(parts);
    return (prettyPath ? prettyPath + ': ' : '') + err.message;
}
function prettifyInstancePath(parts) {
    if (!parts.length)
        return '';
    return parts.map((p, i) => {
        if (i === 0)
            return (STEP_META[p] || {}).label || p;
        if (parts[0] === 'displays' && i === 1)
            return p === 'default' ? 'Default Display Settings' : ((DISPLAY_TYPES[p] || {}).label || p);
        if (parts[0] === 'calendars' && i === 1)
            return (PROVIDER_TYPES[p] || {}).label || p;
        return p;
    }).join(' \u2192 ');
}
function stepLabel(stepId) {
    if (stepId === 'general')
        return 'General';
    const [top, sub] = stepId.split(':');
    if (!sub)
        return (STEP_META[top] || {}).label || top;
    if (top === 'displays')
        return sub === 'default' ? 'Default Display Settings' : ((DISPLAY_TYPES[sub] || {}).label || sub);
    if (top === 'calendars')
        return (PROVIDER_TYPES[sub] || {}).label || sub;
    return stepId;
}
function getValidationBuckets() {
    const buckets = new Map();
    const push = (stepId, kind, message) => {
        const id = stepId || 'general';
        if (!buckets.has(id))
            buckets.set(id, []);
        buckets.get(id).push({ kind, message });
    };
    try {
        const validate = getAjvValidate();
        if (!validate) {
            push('general', 'warning', 'JSON-Schema validation is unavailable because the Ajv library could not be loaded (check your network connection and reload the page). Only the built-in checks below were run.');
        }
        else if (!validate(settings)) {
            (validate.errors || []).forEach((err) => push(stepIdForInstancePath(err.instancePath), 'error', friendlyAjvMessage(err)));
        }
    }
    catch (e) {
        push('general', 'error', 'Could not run schema validation: ' + e.message);
    }
    if (shouldWarnWifiEmpty()) {
        push('wifi', 'warning', 'No WiFi networks configured - the device will retry connecting forever without WiFi (or a network-disabling test mode).');
    }
    if (settings.calendar_hour_start >= settings.calendar_hour_end) {
        push('schedule', 'warning', 'Start hour is not before end hour - calendar checking will silently never run.');
    }
    if (!settings.calendar_days.length) {
        push('schedule', 'warning', 'No days selected - calendar checking will never run.');
    }
    if (!isValidTimeZone(settings.calendar_timezone_name)) {
        push('schedule', 'warning', `"${settings.calendar_timezone_name}" is not a recognized IANA timezone name - pick one from the list.`);
    }
    if (!activeDisplayTypes().length) {
        push('displays', 'error', 'No active display is configured. Add at least one display so BusyTime has somewhere to show its status.');
    }
    configuredDisplayTypes().forEach((type) => {
        const cfg = DISPLAY_TYPES[type];
        if (!cfg || !cfg.requiredFields)
            return;
        const target = settings.displays[type] || {};
        if ((type === 'wled' || type === 'homeassistant') && target.url && urlHasPath(target.url)) {
            push('displays:' + type, 'warning', `Enter just the address (e.g. ${type === 'wled' ? 'http://wled.local' : 'http://homeassistant.local:8123'}), with no path or trailing "/" - BusyTime adds the API path itself.`);
        }
        cfg.requiredFields.forEach((field) => {
            if (!target[field])
                push('displays:' + type, 'error', `${cfg.label} is missing ${FIELD_UI_META[type]?.[field]?.label || field}.`);
        });
    });
    if (!Object.keys(settings.calendars).length && !CALENDAR_OPTIONAL_TEST_MODES.includes(settings.test_mode)) {
        push('calendars', 'warning', 'No calendar provider is configured, so normal operation cannot show meeting activity.');
    }
    Object.keys(settings.calendars).forEach((type) => {
        const cfg = PROVIDER_TYPES[type] || {};
        const label = cfg.label || type;
        const stepId = 'calendars:' + type;
        if (cfg.oauth) {
            const state = computeOauthDisplayState(type);
            if (state === 'invalid')
                push(stepId, 'error', `${label}: token invalid - reauthorize.`);
            else if (state === 'unreachable')
                push(stepId, 'warning', `${label}: couldn't verify the connection - ${oauthDetail[type] || 'check the network.'}`);
        }
        else if (cfg.icsOnly) {
            (settings.calendars[type].calendars || []).forEach((url, idx) => {
                const st = icsUrlStatus[url];
                if (st === 'invalid')
                    push(stepId, 'error', `ICS URL #${idx + 1} (${url}) is not reachable or not a valid .ics feed.`);
                else if (st === 'unreachable')
                    push(stepId, 'warning', `ICS URL #${idx + 1} (${url}) couldn't be verified - ${icsUrlDetail[url] || 'check the URL/network.'}`);
            });
        }
    });
    Object.keys(settings.displays).filter((k) => k !== 'default').forEach((type) => {
        const cfg = DISPLAY_TYPES[type] || {};
        if (!cfg.testable)
            return;
        const label = cfg.label || type;
        const stepId = 'displays:' + type;
        if (displayStatus[type] === 'invalid')
            push(stepId, 'error', `${label}: responded but not with a 200-level status.`);
        else if (displayStatus[type] === 'unreachable')
            push(stepId, 'warning', `${label}: couldn't verify the connection - ${displayDetail[type] || 'check the URL/network.'}`);
    });
    return buckets;
}
function stepOrDescendantHasIssue(buckets, topId) {
    if (buckets.has(topId))
        return true;
    for (const key of buckets.keys()) {
        if (key.startsWith(topId + ':'))
            return true;
    }
    return false;
}
function sortedBucketKeys(buckets) {
    return Array.from(buckets.keys()).sort((a, b) => {
        const rank = (k) => (k === 'general' ? 999 : (TOP_LEVEL_ORDER.indexOf(k.split(':')[0]) === -1 ? 998 : TOP_LEVEL_ORDER.indexOf(k.split(':')[0])));
        return rank(a) - rank(b) || a.localeCompare(b);
    });
}
function rgbToHex(rgb) {
    return '#' + rgb.map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('');
}
function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0];
}
function el(tag, attrs, children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
        if (k === 'class')
            node.className = v;
        else if (k.startsWith('on') && typeof v === 'function')
            node.addEventListener(k.slice(2), v);
        else if (v !== undefined && v !== null)
            node.setAttribute(k, v);
    }
    if (typeof attrs?.class === 'string' && attrs.class.split(' ').includes('material-symbols-outlined')) {
        if (attrs['aria-label'] !== undefined && attrs.role === undefined)
            node.setAttribute('role', 'img');
        else if (attrs['aria-label'] === undefined && attrs.role === undefined && attrs['aria-hidden'] === undefined)
            node.setAttribute('aria-hidden', 'true');
    }
    (children || []).forEach((c) => node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return node;
}
function helpLinkEl(text, href, linkText) {
    return el('p', { class: 'field-help' }, [text + ' ', el('a', { href, target: '_blank', rel: 'noopener' }, [linkText || 'Learn more'])]);
}
let controlIdCounter = 0;
function fieldRow(labelText, helpText, controlEl) {
    const row = el('div', { class: 'field-row' });
    const group = controlEl.matches('[role="group"]') ? controlEl : controlEl.querySelector('[role="group"]');
    const control = group ? null : (controlEl.matches('input, select, textarea, button')
        ? controlEl
        : controlEl.querySelector('input, select, textarea, button'));
    const controlId = control && (control.id || `field-${++controlIdCounter}`);
    if (control && !control.id)
        control.id = controlId;
    const labelAttrs = { class: 'field-label', title: helpText || '' };
    if (controlId)
        labelAttrs.for = controlId;
    if (group)
        labelAttrs.id = `field-label-${++controlIdCounter}`;
    row.appendChild(el('label', labelAttrs, [labelText]));
    if (group)
        group.setAttribute('aria-labelledby', labelAttrs.id);
    row.appendChild(controlEl);
    if (helpText) {
        const helpId = `field-help-${++controlIdCounter}`;
        row.appendChild(el('span', { class: 'field-help', id: helpId }, [helpText]));
        if (control)
            control.setAttribute('aria-describedby', helpId);
        else if (group)
            group.setAttribute('aria-describedby', helpId);
    }
    return row;
}
function renderSubStepTitle(titleText, onBack) {
    const back = el('a', { href: '#', class: 'back-arrow', 'aria-label': 'Back', onclick: (e) => { e.preventDefault(); onBack(); } }, [
        el('span', { class: 'material-symbols-outlined' }, ['arrow_back']),
    ]);
    return el('h2', { class: 'step-title' }, [back, titleText]);
}
