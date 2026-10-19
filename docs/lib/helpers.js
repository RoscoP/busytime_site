"use strict";
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
    if (!isPlainObject(settings.calendars))
        settings.calendars = {};
}
function configuredDisplayTypes() {
    return Object.keys(settings.displays || {}).filter((key) => key !== 'default' && key !== 'all');
}
function activeDisplayTypes() {
    if (settings.displays && 'all' in settings.displays)
        return ['all'];
    return configuredDisplayTypes().filter((type) => {
        if (DIRECT_DISPLAY_TYPES.includes(type))
            return true;
        if (['bigstoplight', 'wled', 'homeassistant'].includes(type))
            return !!settings.displays[type].url;
        return false;
    });
}
function hasHardErrors(buckets) {
    for (const entries of buckets.values()) {
        if (entries.some((entry) => entry.kind === 'error'))
            return true;
    }
    return false;
}
//# sourceMappingURL=helpers.js.map