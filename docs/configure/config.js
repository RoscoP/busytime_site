// BusyTime configurator v1.0.10
import { getSchema } from './schema.js?v=1.0.10';
export { TOP_LEVEL_ORDER, STEP_META, NETWORK_DISABLING_TEST_MODES, CALENDAR_OPTIONAL_TEST_MODES, DIRECT_DISPLAY_TYPES, MULTI_DISPLAY_TYPES, isMultiDisplayType, DAY_LABELS, STATE_NAMES, STATE_DESCRIPTIONS, stateOptionLabel, STATE_DEFAULT_COLORS, EVENT_TIME_DEFAULT_COLORS, SUPPORTED_TIMEZONES, isValidTimeZone, DISPLAY_TYPES, DISPLAY_HELP, HOMEASSISTANT_TOKEN_DOCS_URL, FIELD_UI_META, schemaExtraProperties, displaySupportsLedStrip, getExtraFields, isHttpUrl, urlHasPath, appendPathIfBare, };
const TOP_LEVEL_ORDER = ['wifi', 'schedule', 'displays', 'calendars', 'review'];
const STEP_META = {
    wifi: { label: 'WiFi', icon: 'wifi' },
    schedule: { label: 'General & Schedule', icon: 'event' },
    displays: { label: 'Displays', icon: 'monitor' },
    calendars: { label: 'Calendar Providers', icon: 'calendar_month' },
    review: { label: 'Review & Save', icon: 'fact_check' },
};
const NETWORK_DISABLING_TEST_MODES = ['lights', 'lightskey', 'rainbow'];
const CALENDAR_OPTIONAL_TEST_MODES = ['lights', 'lightskey', 'rainbow', 'calendar'];
const DIRECT_DISPLAY_TYPES = ['onboard', 'bff', 'littlestoplight', 'console', 'website'];
const MULTI_DISPLAY_TYPES = ['bigstoplight', 'homeassistant', 'wled'];
function isMultiDisplayType(type) {
    return MULTI_DISPLAY_TYPES.includes(type);
}
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const STATE_NAMES = ['NONE', 'TESTING', 'SETUP', 'WAITING', 'ERROR', 'IDLE', 'FREE', 'POSSIBLE', 'PENDING', 'BUSYPENDING', 'BUSY'];
const STATE_DESCRIPTIONS = {
    NONE: 'Light off / no state',
    TESTING: 'Test mode is running',
    SETUP: 'Device is starting up',
    WAITING: 'Waiting for the network or calendar data',
    ERROR: 'Something went wrong',
    IDLE: 'Outside your checking hours, or no more meetings today',
    FREE: 'No meeting right now',
    POSSIBLE: 'All-day event, so you might be busy',
    PENDING: 'A meeting starts soon',
    BUSYPENDING: 'Back-to-back: your next meeting starts soon',
    BUSY: 'In a meeting',
};
const stateOptionLabel = (state) => `${state} - ${STATE_DESCRIPTIONS[state]}`;
const STATE_DEFAULT_COLORS = {
    NONE: [0, 0, 0], TESTING: [0, 255, 255], SETUP: [0, 0, 255], WAITING: [210, 105, 30],
    ERROR: [255, 255, 255], IDLE: [0, 0, 0], FREE: [0, 255, 0], POSSIBLE: [238, 130, 238],
    PENDING: [255, 255, 0], BUSYPENDING: [255, 120, 0], BUSY: [255, 0, 0],
};
const EVENT_TIME_DEFAULT_COLORS = { 1: [222, 0, 222], 2: [0, 222, 222], 3: [200, 200, 200], 4: [222, 222, 0] };
const SUPPORTED_TIMEZONES = Intl.supportedValuesOf ? new Set(Intl.supportedValuesOf('timeZone')) : null;
function isValidTimeZone(tz) {
    if (!tz)
        return false;
    if (SUPPORTED_TIMEZONES)
        return SUPPORTED_TIMEZONES.has(tz);
    try {
        new Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
    }
    catch (e) {
        return false;
    }
}
const DISPLAY_TYPES = {
    onboard: { label: 'Onboard LED' },
    bff: { label: 'Matrix LED (BFF)' },
    littlestoplight: { label: 'Little Stoplight' },
    console: { label: 'Console' },
    bigstoplight: {
        label: 'Big Stoplight',
        testable: true, noCorsFallback: true, requiredFields: ['url'], buildTestRequest: (target) => ({ url: target.url, options: { method: 'GET' } }),
    },
    homeassistant: {
        label: 'Home Assistant',
        testable: true, noCorsFallback: true, testRequiredFields: ['url'], requiredFields: ['url', 'token', 'entity_id'],
        buildTestRequest: (target) => ({ url: target.url, options: { method: 'GET' } }),
    },
    wled: {
        label: 'WLED',
        testable: true, noCorsFallback: true, requiredFields: ['url'],
        buildTestRequest: (target) => ({ url: appendPathIfBare(target.url, '/json'), options: { method: 'GET' } }),
    },
    website: { label: 'Website' },
};
const DISPLAY_HELP = {
    homeassistant: {
        text: 'Home Assistant is an open source home automation platform. Configure entity control via REST API.',
        href: 'https://www.home-assistant.io/',
    },
    wled: {
        text: 'WLED is a fast and feature-rich implementation of an ESP8266/ESP32 webserver to control NeoPixel (WS2812B, WS2811, SK6812) LEDs.',
        href: 'https://kno.wled.ge/',
    },
};
const HOMEASSISTANT_TOKEN_DOCS_URL = 'https://developers.home-assistant.io/docs/auth_api/#long-lived-access-token';
const FIELD_UI_META = {
    bff: { rotate: { label: 'Rotation', optionSuffix: '\u00b0' } },
    bigstoplight: { url: { label: 'API URL' } },
    homeassistant: {
        entity_id: { label: 'Entity ID' },
        token: { label: 'Access Token', inputType: 'password' },
        url: { label: 'Server URL', placeholder: 'http://homeassistant.local:8123' },
    },
    wled: {
        url: { label: 'WLED URL', placeholder: 'http://wled.local' },
        preset: { label: 'Preset (optional)' },
        led_count: { label: 'LED Count' },
    },
    website: { name: { label: 'mDNS Name', placeholder: 'busytime' } },
};
function displayTypeSchema(type) {
    const schema = getSchema();
    const node = schema.properties.displays.properties[type];
    const instanceRef = node && node.oneOf && node.oneOf.find((branch) => branch && branch['$ref']);
    if (!instanceRef)
        return node;
    return schema.$defs[String(instanceRef['$ref']).replace('#/$defs/', '')];
}
function schemaExtraProperties(type) {
    const node = displayTypeSchema(type);
    const fragment = node && node.allOf && node.allOf.find((f) => f && f.properties && !f['$ref']);
    return (fragment && fragment.properties) || {};
}
function displaySupportsLedStrip(type) {
    const node = displayTypeSchema(type);
    return !!(node && node.allOf && node.allOf.some((f) => f && f['$ref'] === '#/$defs/displayLedStrip'));
}
function getExtraFields(type) {
    const props = schemaExtraProperties(type);
    const meta = FIELD_UI_META[type] || {};
    return Object.keys(props).map((key) => {
        const schemaProp = props[key];
        const override = meta[key] || {};
        return {
            key,
            label: override.label || schemaProp.description || key,
            description: schemaProp.description || '',
            type: override.inputType || (schemaProp.type === 'integer' ? 'number' : (schemaProp.format === 'uri' ? 'url' : 'text')),
            placeholder: override.placeholder || '',
            enumValues: Array.isArray(schemaProp.enum) ? schemaProp.enum : null,
            defaultValue: schemaProp.default,
            optionSuffix: override.optionSuffix || '',
        };
    });
}
function isHttpUrl(value) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    }
    catch (e) {
        return false;
    }
}
function urlHasPath(url) {
    return (url.split('://')[1] || '').includes('/');
}
function appendPathIfBare(url, path) {
    const afterScheme = url.split('://')[1] || '';
    return afterScheme.includes('/') ? url : url + path;
}
