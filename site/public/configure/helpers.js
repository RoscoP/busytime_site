// BusyTime configurator v1.0.10
import { DIRECT_DISPLAY_TYPES, DISPLAY_TYPES, isMultiDisplayType } from './config.js?v=1.0.10';
import { settings } from './state.js?v=1.0.10';
export { computeOffsetSeconds, formatOffset, setOffsetDisplay, ensureDefaults, configuredDisplayTypes, activeDisplayTypes, displayKey, parseDisplayKey, displayInstances, getDisplayConfig, configuredDisplayKeys, displayLabel, addDisplayInstance, removeDisplayInstance, normalizeDisplays, activeDisplayKeys, hasHardErrors, };
export function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function computeOffsetSeconds(tz) {
    try {
        const dtf = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' });
        const part = dtf.formatToParts(new Date()).find((p) => p.type === 'timeZoneName');
        const m = /GMT([+-]\d+)(?::(\d+))?/.exec(part ? part.value : '');
        if (!m)
            return 0;
        const hours = parseInt(m[1], 10);
        const mins = m[2] ? parseInt(m[2], 10) : 0;
        return hours * 3600 + (hours < 0 ? -1 : 1) * mins * 60;
    }
    catch (e) {
        return 0;
    }
}
function formatOffset(seconds) {
    const sign = seconds < 0 ? '-' : '+';
    const abs = Math.abs(seconds);
    const hh = String(Math.floor(abs / 3600)).padStart(2, '0');
    const mm = String(Math.floor((abs % 3600) / 60)).padStart(2, '0');
    return `${sign}${hh}:${mm}`;
}
function setOffsetDisplay(offsetDisplay, seconds) {
    offsetDisplay.textContent = `UTC offset: ${formatOffset(seconds)}`;
    offsetDisplay.title = `${seconds} seconds`;
}
function ensureDefaults() {
    if (!isPlainObject(settings.wifis))
        settings.wifis = {};
    if (settings.test_mode === undefined)
        settings.test_mode = null;
    if (!settings.calendar_timezone_name) {
        settings.calendar_timezone_name = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    if (settings.calendar_timezone_offset === undefined || settings.calendar_timezone_offset === null) {
        settings.calendar_timezone_offset = computeOffsetSeconds(settings.calendar_timezone_name);
    }
    if (settings.calendar_hour_start === undefined)
        settings.calendar_hour_start = 8;
    if (settings.calendar_hour_end === undefined)
        settings.calendar_hour_end = 18;
    if (!settings.calendar_days)
        settings.calendar_days = [0, 1, 2, 3, 4];
    if (settings.pending_time === undefined)
        settings.pending_time = 10;
    if (!isPlainObject(settings.displays))
        settings.displays = {};
    if (!settings.displays.default)
        settings.displays.default = {};
    normalizeDisplays();
    if (!isPlainObject(settings.calendars))
        settings.calendars = {};
}
function configuredDisplayTypes() {
    return Object.keys(settings.displays || {}).filter((key) => key !== 'default' && key !== 'all');
}
function displayKey(type, index) {
    return index === 0 ? type : `${type}:${index}`;
}
function parseDisplayKey(key) {
    const [type, index] = key.split(':');
    return { type, index: index === undefined ? 0 : parseInt(index, 10) || 0 };
}
function displayInstances(type) {
    const value = settings.displays ? settings.displays[type] : undefined;
    if (Array.isArray(value))
        return value;
    return isPlainObject(value) ? [value] : [];
}
function getDisplayConfig(key) {
    const { type, index } = parseDisplayKey(key);
    const instance = displayInstances(type)[index];
    return isPlainObject(instance) ? instance : undefined;
}
function configuredDisplayKeys() {
    return configuredDisplayTypes().flatMap((type) => displayInstances(type).map((_, index) => displayKey(type, index)));
}
function displayLabel(key) {
    const { type, index } = parseDisplayKey(key);
    const label = (DISPLAY_TYPES[type] || {}).label || type;
    return isMultiDisplayType(type) && displayInstances(type).length > 1 ? `${label} #${index + 1}` : label;
}
function addDisplayInstance(type) {
    const existing = displayInstances(type);
    if (!existing.length) {
        settings.displays[type] = {};
        return displayKey(type, 0);
    }
    if (!isMultiDisplayType(type))
        return displayKey(type, 0);
    const instances = Array.isArray(settings.displays[type]) ? settings.displays[type] : existing;
    instances.push({});
    settings.displays[type] = instances;
    return displayKey(type, instances.length - 1);
}
function removeDisplayInstance(key) {
    const { type, index } = parseDisplayKey(key);
    const value = settings.displays[type];
    if (!Array.isArray(value)) {
        delete settings.displays[type];
        return;
    }
    value.splice(index, 1);
    normalizeDisplays();
}
function normalizeDisplays() {
    configuredDisplayTypes().filter(isMultiDisplayType).forEach((type) => {
        const value = settings.displays[type];
        if (!Array.isArray(value))
            return;
        if (!value.length)
            delete settings.displays[type];
        else if (value.length === 1 && isPlainObject(value[0]))
            settings.displays[type] = value[0];
    });
}
function activeDisplayKeys() {
    return configuredDisplayKeys().filter((key) => {
        const { type } = parseDisplayKey(key);
        if (DIRECT_DISPLAY_TYPES.includes(type))
            return true;
        if (isMultiDisplayType(type))
            return !!(getDisplayConfig(key) || {}).url;
        return false;
    });
}
function activeDisplayTypes() {
    return Array.from(new Set(activeDisplayKeys().map((key) => parseDisplayKey(key).type)));
}
function hasHardErrors(buckets) {
    for (const entries of buckets.values()) {
        if (entries.some((entry) => entry.kind === 'error'))
            return true;
    }
    return false;
}
