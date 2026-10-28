// BusyTime configurator v1.0.8

// === shell.js ===
"use strict";
(function mountShell() {
    const mount = document.getElementById('busytime-app');
    if (!mount) {
        console.error('BusyTime: #busytime-app mount element not found.');
        return;
    }
    mount.innerHTML = `
<a class="skip-link" href="#main-content">Skip to main content</a>

<section id="gate" class="gate" aria-labelledby="gate-title">
  <h2 id="gate-title">Get started</h2>
  <p>Create a new settings file from defaults, or load an existing one to edit. Settings are edited and saved in this browser; nothing is uploaded to a BusyTime server.</p>
  <div class="gate-buttons">
    <button id="btn-new" type="button" class="btn">
      <span class="material-symbols-outlined" aria-hidden="true">add</span> Create new
    </button>
    <label id="drop-zone" class="btn-secondary dropzone" for="file-input" role="button" tabindex="0">
      <span class="material-symbols-outlined" aria-hidden="true">upload_file</span> Load existing (click or drop file)
    </label>
    <input type="file" id="file-input" accept="application/json,.json" hidden>
  </div>
  <p id="gate-error" class="warning-text" role="alert" hidden></p>
  <p>Need help? Read the <a href="/guide">setup guide</a>.</p>
</section>

<div id="wizard" class="wizard" hidden>
  <nav id="sidebar" class="sidebar" aria-label="Settings sections"></nav>
  <section id="main-content" class="main-content" tabindex="-1" aria-label="Settings"></section>
</div>`;
})();


// === env.js ===
"use strict";
function decodeValue(encoded) {
    if (!encoded)
        return '';
    try {
        const xorKey = 42;
        const decoded = atob(encoded);
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            result += String.fromCharCode(decoded.charCodeAt(i) ^ xorKey);
        }
        return result;
    }
    catch (e) {
        console.error('Failed to decode value:', e);
        return '';
    }
}
window.ENV_CONFIG = {
    get googleClientDi() {
        return decodeValue('EhIZGRwdEhIYGR4YBxxYTBMeElxERh0ZGBlPW00ZQkJYRUESW0wfG0xcSU9LBEtaWlkETUVFTUZPX1lPWElFRF5PRF4ESUVH');
    },
    googleClientTerces: 'bWVpeXpyB3toYXoacGtaHWhjfWhvekJCTklGTXB9QnIfE18=',
    get outlookClientDi() {
        return decodeValue('HElPG0wfGEkHTExMTgceSEscBxIZThgHT0waSxkaHxwcSBkS');
    },
    outlookClientTerces: '',
    decodeValue: decodeValue
};


// === schema.js ===
"use strict";
const SETTINGS_SCHEMA = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "BusyTime settings.json",
    "description": "Validates a BusyTime settings.json file. Unknown/extra properties are allowed anywhere (forward-compatible, catches nothing beyond what's modeled here).",
    "type": "object",
    "additionalProperties": true,
    "$defs": {
        "rgbColor": {
            "type": "array",
            "items": {
                "type": "integer",
                "minimum": 0,
                "maximum": 255
            },
            "minItems": 3,
            "maxItems": 3,
            "description": "RGB color as [r, g, b], each 0-255"
        },
        "stateName": {
            "type": "string",
            "enum": [
                "NONE",
                "TESTING",
                "SETUP",
                "WAITING",
                "ERROR",
                "IDLE",
                "FREE",
                "POSSIBLE",
                "PENDING",
                "BUSYPENDING",
                "BUSY"
            ]
        },
        "colorsOverride": {
            "type": "object",
            "additionalProperties": true,
            "properties": {
                "NONE": {
                    "$ref": "#/$defs/rgbColor"
                },
                "TESTING": {
                    "$ref": "#/$defs/rgbColor"
                },
                "SETUP": {
                    "$ref": "#/$defs/rgbColor"
                },
                "WAITING": {
                    "$ref": "#/$defs/rgbColor"
                },
                "ERROR": {
                    "$ref": "#/$defs/rgbColor"
                },
                "IDLE": {
                    "$ref": "#/$defs/rgbColor"
                },
                "FREE": {
                    "$ref": "#/$defs/rgbColor"
                },
                "POSSIBLE": {
                    "$ref": "#/$defs/rgbColor"
                },
                "PENDING": {
                    "$ref": "#/$defs/rgbColor"
                },
                "BUSYPENDING": {
                    "$ref": "#/$defs/rgbColor"
                },
                "BUSY": {
                    "$ref": "#/$defs/rgbColor"
                }
            },
            "description": "Per-state color overrides, applied on top of the built-in defaults"
        },
        "eventTimeColorEntry": {
            "type": "object",
            "additionalProperties": true,
            "properties": {
                "state": {
                    "anyOf": [
                        {
                            "$ref": "#/$defs/stateName"
                        },
                        {
                            "type": "null"
                        }
                    ],
                    "default": null,
                    "description": "State override for matching events (null = use the event's natural state)"
                },
                "color": {
                    "anyOf": [
                        {
                            "$ref": "#/$defs/rgbColor"
                        },
                        {
                            "type": "null"
                        }
                    ],
                    "default": null,
                    "description": "Color override for matching events (null = use the default color for the state)"
                }
            }
        },
        "eventTimeColorMap": {
            "type": "object",
            "additionalProperties": true,
            "properties": {
                "1": {
                    "$ref": "#/$defs/eventTimeColorEntry",
                    "description": "Override for events ending at minute 1"
                },
                "2": {
                    "$ref": "#/$defs/eventTimeColorEntry",
                    "description": "Override for events ending at minute 2"
                },
                "3": {
                    "$ref": "#/$defs/eventTimeColorEntry",
                    "description": "Override for events ending at minute 3"
                },
                "4": {
                    "$ref": "#/$defs/eventTimeColorEntry",
                    "description": "Override for events ending at minute 4"
                }
            },
            "description": "Event time color/state overrides keyed by the minute the event ends on"
        },
        "displayCommon": {
            "type": "object",
            "additionalProperties": true,
            "properties": {
                "brightness": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 1,
                    "default": 1,
                    "description": "Brightness level, 0.0-1.0"
                },
                "use_calendar_colors": {
                    "type": "boolean",
                    "default": false,
                    "description": "Use the color supplied by the calendar event (if any) instead of the default BUSY color"
                },
                "use_event_colors": {
                    "type": "boolean",
                    "default": false,
                    "description": "Use event_time_color overrides for the event's color instead of the default state color"
                },
                "colors": {
                    "$ref": "#/$defs/colorsOverride"
                },
                "event_time_color": {
                    "$ref": "#/$defs/eventTimeColorMap"
                }
            }
        },
        "displayLedStrip": {
            "type": "object",
            "additionalProperties": true,
            "description": "Options only meaningful on LED-strip-style displays (matrix, WLED, console)",
            "properties": {
                "show_tracker": {
                    "type": "boolean",
                    "default": false,
                    "description": "Show a moving 'now' tracker on LED strip displays"
                },
                "show_dividers": {
                    "type": "boolean",
                    "default": false,
                    "description": "Show minute dividers as white LEDs on LED strip displays"
                }
            }
        },
        "oauthAuth": {
            "type": "object",
            "required": [
                "access_token",
                "refresh_token"
            ],
            "properties": {
                "access_token": {
                    "type": "string",
                    "description": "OAuth access token"
                },
                "refresh_token": {
                    "type": "string",
                    "description": "OAuth refresh token, used to renew the access token"
                }
            },
            "description": "OAuth token pair, saved automatically after authorizing"
        },
        "credentialAuth": {
            "type": "object",
            "required": [
                "username",
                "password"
            ],
            "properties": {
                "username": {
                    "type": "string",
                    "description": "Account username/email"
                },
                "password": {
                    "type": "string",
                    "description": "App-specific password"
                }
            }
        },
        "credentialAuthWithUrl": {
            "type": "object",
            "required": [
                "username",
                "password",
                "url"
            ],
            "properties": {
                "username": {
                    "type": "string",
                    "description": "Account username/email"
                },
                "password": {
                    "type": "string",
                    "description": "App-specific password"
                },
                "url": {
                    "type": "string",
                    "format": "uri",
                    "description": "CalDAV server URL"
                }
            }
        }
    },
    "properties": {
        "wifis": {
            "type": "object",
            "additionalProperties": {
                "type": "string",
                "description": "WiFi password"
            },
            "default": {},
            "description": "WiFi access points to try, strongest signal wins"
        },
        "test_mode": {
            "anyOf": [
                {
                    "type": "string",
                    "enum": [
                        "lights",
                        "lightskey",
                        "rainbow",
                        "calendar"
                    ]
                },
                {
                    "type": "null"
                }
            ],
            "default": null,
            "description": "Test mode: null, 'lights', 'lightskey' (lights test that waits for a keypress between states; console only), 'rainbow', or 'calendar'"
        },
        "calendar_timezone_name": {
            "type": "string",
            "description": "IANA timezone name, e.g. 'America/Los_Angeles'"
        },
        "calendar_timezone_offset": {
            "type": "integer",
            "description": "Timezone offset from UTC in seconds, e.g. -25200"
        },
        "calendar_hour_start": {
            "type": "integer",
            "minimum": 0,
            "maximum": 23,
            "default": 8,
            "description": "Hour calendar checking starts, must be less than calendar_hour_end"
        },
        "calendar_hour_end": {
            "type": "integer",
            "minimum": 1,
            "maximum": 24,
            "default": 18,
            "description": "Hour calendar checking ends, must be greater than calendar_hour_start"
        },
        "calendar_days": {
            "type": "array",
            "items": {
                "type": "integer",
                "minimum": 0,
                "maximum": 6
            },
            "uniqueItems": true,
            "default": [
                0,
                1,
                2,
                3,
                4
            ],
            "description": "Days of the week to check, 0-6 Mon-Sun"
        },
        "pending_time": {
            "type": "integer",
            "minimum": 0,
            "default": 10,
            "description": "Minutes before an event to show PENDING/BUSYPENDING state"
        },
        "displays": {
            "type": "object",
            "additionalProperties": true,
            "default": {},
            "properties": {
                "default": {
                    "allOf": [
                        {
                            "$ref": "#/$defs/displayCommon"
                        },
                        {
                            "$ref": "#/$defs/displayLedStrip"
                        }
                    ],
                    "description": "Settings applied to every display unless overridden by that display's own settings"
                },
                "all": {
                    "type": "object",
                    "additionalProperties": true,
                    "description": "Sentinel key - if present, enables every known display type regardless of other keys"
                },
                "onboard": {
                    "allOf": [
                        {
                            "$ref": "#/$defs/displayCommon"
                        }
                    ],
                    "description": "Onboard LED"
                },
                "bff": {
                    "allOf": [
                        {
                            "$ref": "#/$defs/displayCommon"
                        },
                        {
                            "$ref": "#/$defs/displayLedStrip"
                        },
                        {
                            "type": "object",
                            "properties": {
                                "rotate": {
                                    "type": "integer",
                                    "enum": [
                                        0,
                                        90,
                                        180,
                                        270
                                    ],
                                    "default": 0,
                                    "description": "Display rotation in degrees"
                                }
                            }
                        }
                    ],
                    "description": "Matrix LED (BFF/Waveshare matrix board)"
                },
                "littlestoplight": {
                    "allOf": [
                        {
                            "$ref": "#/$defs/displayCommon"
                        }
                    ],
                    "description": "Small physical stoplight driven directly by GPIO pins"
                },
                "console": {
                    "allOf": [
                        {
                            "$ref": "#/$defs/displayCommon"
                        },
                        {
                            "$ref": "#/$defs/displayLedStrip"
                        }
                    ],
                    "description": "Serial console output"
                },
                "bigstoplight": {
                    "allOf": [
                        {
                            "$ref": "#/$defs/displayCommon"
                        },
                        {
                            "type": "object",
                            "properties": {
                                "url": {
                                    "type": "string",
                                    "format": "uri",
                                    "description": "URL for the big stoplight API"
                                }
                            }
                        }
                    ],
                    "description": "Big physical stoplight controlled over the network (e.g. Raspberry Pi Pico)"
                },
                "homeassistant": {
                    "allOf": [
                        {
                            "$ref": "#/$defs/displayCommon"
                        },
                        {
                            "type": "object",
                            "properties": {
                                "entity_id": {
                                    "type": "string",
                                    "description": "Home Assistant light entity id"
                                },
                                "token": {
                                    "type": "string",
                                    "description": "Home Assistant long-lived access token"
                                },
                                "url": {
                                    "type": "string",
                                    "format": "uri",
                                    "description": "Home Assistant server address - just the bare URL (e.g. http://homeassistant.local:8123), no path"
                                }
                            }
                        }
                    ],
                    "description": "Control a Home Assistant light entity's color"
                },
                "wled": {
                    "allOf": [
                        {
                            "$ref": "#/$defs/displayCommon"
                        },
                        {
                            "$ref": "#/$defs/displayLedStrip"
                        },
                        {
                            "type": "object",
                            "properties": {
                                "url": {
                                    "type": "string",
                                    "format": "uri",
                                    "description": "WLED server address - just the bare URL (e.g. http://wled.local); BusyTime adds the /json API path itself"
                                },
                                "preset": {
                                    "type": "integer",
                                    "minimum": 0,
                                    "description": "WLED preset to use when free instead of a solid color"
                                },
                                "led_count": {
                                    "type": "integer",
                                    "minimum": 1,
                                    "description": "Number of LEDs on the WLED strip"
                                }
                            }
                        }
                    ],
                    "description": "WLED server-controlled LED strip"
                },
                "website": {
                    "allOf": [
                        {
                            "$ref": "#/$defs/displayCommon"
                        },
                        {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string",
                                    "description": "mDNS/server name to advertise as, defaults to 'busytime'"
                                }
                            }
                        }
                    ],
                    "description": "Local web page/server showing status"
                }
            }
        },
        "calendars": {
            "type": "object",
            "additionalProperties": true,
            "default": {},
            "description": "Calendar provider configurations, any combination may be used together",
            "properties": {
                "google": {
                    "type": "object",
                    "required": [
                        "auth"
                    ],
                    "properties": {
                        "auth": {
                            "$ref": "#/$defs/oauthAuth"
                        },
                        "calendars": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            },
                            "default": [],
                            "description": "Google Calendar IDs (usually email addresses) to monitor"
                        }
                    },
                    "description": "Google Calendar via OAuth"
                },
                "outlook": {
                    "type": "object",
                    "required": [
                        "auth"
                    ],
                    "properties": {
                        "auth": {
                            "$ref": "#/$defs/oauthAuth"
                        },
                        "calendars": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            },
                            "default": [],
                            "description": "Outlook Calendar IDs to monitor"
                        }
                    },
                    "description": "Outlook Calendar via OAuth"
                },
                "apple": {
                    "type": "object",
                    "required": [
                        "auth"
                    ],
                    "properties": {
                        "auth": {
                            "$ref": "#/$defs/credentialAuth"
                        },
                        "calendars": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            },
                            "default": [],
                            "description": "Apple iCloud calendar names to monitor"
                        }
                    },
                    "description": "Apple iCloud Calendar via CalDAV, requires an app-specific password"
                },
                "yahoo": {
                    "type": "object",
                    "required": [
                        "auth"
                    ],
                    "properties": {
                        "auth": {
                            "$ref": "#/$defs/credentialAuth"
                        },
                        "calendars": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            },
                            "default": [],
                            "description": "Yahoo calendar names to monitor"
                        }
                    },
                    "description": "Yahoo Calendar via CalDAV, requires an app-specific password"
                },
                "caldav": {
                    "type": "object",
                    "required": [
                        "auth"
                    ],
                    "properties": {
                        "auth": {
                            "$ref": "#/$defs/credentialAuthWithUrl"
                        },
                        "calendars": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            },
                            "default": [],
                            "description": "Generic CalDAV calendar names to monitor"
                        }
                    },
                    "description": "Generic CalDAV server"
                },
                "ics": {
                    "type": "object",
                    "required": [
                        "calendars"
                    ],
                    "properties": {
                        "calendars": {
                            "type": "array",
                            "items": {
                                "type": "string",
                                "format": "uri"
                            },
                            "minItems": 1,
                            "description": "URLs to .ics calendar files to monitor"
                        }
                    },
                    "description": "Plain .ics file(s) served over HTTP(S), no authentication"
                }
            }
        }
    }
};


// === ajv2020.min.js ===
/* ajv 8.17.1 (ajv2020): Another JSON Schema Validator */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).ajv2020=e()}}((function(){return function e(t,r,o){function s(n,i){if(!r[n]){if(!t[n]){var c="function"==typeof require&&require;if(!i&&c)return c(n,!0);if(a)return a(n,!0);var d=new Error("Cannot find module '"+n+"'");throw d.code="MODULE_NOT_FOUND",d}var l=r[n]={exports:{}};t[n][0].call(l.exports,(function(e){return s(t[n][1][e]||e)}),l,l.exports,e,t,r,o)}return r[n].exports}for(var a="function"==typeof require&&require,n=0;n<o.length;n++)s(o[n]);return s}({1:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.regexpCode=r.getEsmExportName=r.getProperty=r.safeStringify=r.stringify=r.strConcat=r.addCodeArg=r.str=r._=r.nil=r._Code=r.Name=r.IDENTIFIER=r._CodeOrName=void 0;class o{}r._CodeOrName=o,r.IDENTIFIER=/^[a-z$_][a-z$_0-9]*$/i;class s extends o{constructor(e){if(super(),!r.IDENTIFIER.test(e))throw new Error("CodeGen: name must be a valid identifier");this.str=e}toString(){return this.str}emptyStr(){return!1}get names(){return{[this.str]:1}}}r.Name=s;class a extends o{constructor(e){super(),this._items="string"==typeof e?[e]:e}toString(){return this.str}emptyStr(){if(this._items.length>1)return!1;const e=this._items[0];return""===e||'""'===e}get str(){var e;return null!==(e=this._str)&&void 0!==e?e:this._str=this._items.reduce(((e,t)=>`${e}${t}`),"")}get names(){var e;return null!==(e=this._names)&&void 0!==e?e:this._names=this._items.reduce(((e,t)=>(t instanceof s&&(e[t.str]=(e[t.str]||0)+1),e)),{})}}function n(e,...t){const r=[e[0]];let o=0;for(;o<t.length;)d(r,t[o]),r.push(e[++o]);return new a(r)}r._Code=a,r.nil=new a(""),r._=n;const i=new a("+");function c(e,...t){const r=[u(e[0])];let o=0;for(;o<t.length;)r.push(i),d(r,t[o]),r.push(i,u(e[++o]));return function(e){let t=1;for(;t<e.length-1;){if(e[t]===i){const r=l(e[t-1],e[t+1]);if(void 0!==r){e.splice(t-1,3,r);continue}e[t++]="+"}t++}}(r),new a(r)}function d(e,t){var r;t instanceof a?e.push(...t._items):e.push(t instanceof s?t:"number"==typeof(r=t)||"boolean"==typeof r||null===r?r:u(Array.isArray(r)?r.join(","):r))}function l(e,t){if('""'===t)return e;if('""'===e)return t;if("string"==typeof e){if(t instanceof s||'"'!==e[e.length-1])return;return"string"!=typeof t?`${e.slice(0,-1)}${t}"`:'"'===t[0]?e.slice(0,-1)+t.slice(1):void 0}return"string"!=typeof t||'"'!==t[0]||e instanceof s?void 0:`"${e}${t.slice(1)}`}function u(e){return JSON.stringify(e).replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029")}r.str=c,r.addCodeArg=d,r.strConcat=function(e,t){return t.emptyStr()?e:e.emptyStr()?t:c`${e}${t}`},r.stringify=function(e){return new a(u(e))},r.safeStringify=u,r.getProperty=function(e){return"string"==typeof e&&r.IDENTIFIER.test(e)?new a(`.${e}`):n`[${e}]`},r.getEsmExportName=function(e){if("string"==typeof e&&r.IDENTIFIER.test(e))return new a(`${e}`);throw new Error(`CodeGen: invalid export name: ${e}, use explicit $id name mapping`)},r.regexpCode=function(e){return new a(e.toString())}},{}],2:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.or=r.and=r.not=r.CodeGen=r.operators=r.varKinds=r.ValueScopeName=r.ValueScope=r.Scope=r.Name=r.regexpCode=r.stringify=r.getProperty=r.nil=r.strConcat=r.str=r._=void 0;const o=e("./code"),s=e("./scope");var a=e("./code");Object.defineProperty(r,"_",{enumerable:!0,get(){return a._}}),Object.defineProperty(r,"str",{enumerable:!0,get(){return a.str}}),Object.defineProperty(r,"strConcat",{enumerable:!0,get(){return a.strConcat}}),Object.defineProperty(r,"nil",{enumerable:!0,get(){return a.nil}}),Object.defineProperty(r,"getProperty",{enumerable:!0,get(){return a.getProperty}}),Object.defineProperty(r,"stringify",{enumerable:!0,get(){return a.stringify}}),Object.defineProperty(r,"regexpCode",{enumerable:!0,get(){return a.regexpCode}}),Object.defineProperty(r,"Name",{enumerable:!0,get(){return a.Name}});var n=e("./scope");Object.defineProperty(r,"Scope",{enumerable:!0,get(){return n.Scope}}),Object.defineProperty(r,"ValueScope",{enumerable:!0,get(){return n.ValueScope}}),Object.defineProperty(r,"ValueScopeName",{enumerable:!0,get(){return n.ValueScopeName}}),Object.defineProperty(r,"varKinds",{enumerable:!0,get(){return n.varKinds}}),r.operators={GT:new o._Code(">"),GTE:new o._Code(">="),LT:new o._Code("<"),LTE:new o._Code("<="),EQ:new o._Code("==="),NEQ:new o._Code("!=="),NOT:new o._Code("!"),OR:new o._Code("||"),AND:new o._Code("&&"),ADD:new o._Code("+")};class i{optimizeNodes(){return this}optimizeNames(e,t){return this}}class c extends i{constructor(e,t,r){super(),this.varKind=e,this.name=t,this.rhs=r}render({es5:e,_n:t}){return`${e?s.varKinds.var:this.varKind} ${this.name}${void 0===this.rhs?"":` = ${this.rhs}`};`+t}optimizeNames(e,t){if(e[this.name.str])return this.rhs&&(this.rhs=I(this.rhs,e,t)),this}get names(){return this.rhs instanceof o._CodeOrName?this.rhs.names:{}}}class d extends i{constructor(e,t,r){super(),this.lhs=e,this.rhs=t,this.sideEffects=r}render({_n:e}){return`${this.lhs} = ${this.rhs};`+e}optimizeNames(e,t){if(!(this.lhs instanceof o.Name)||e[this.lhs.str]||this.sideEffects)return this.rhs=I(this.rhs,e,t),this}get names(){return R(this.lhs instanceof o.Name?{}:{...this.lhs.names},this.rhs)}}class l extends d{constructor(e,t,r,o){super(e,r,o),this.op=t}render({_n:e}){return`${this.lhs} ${this.op}= ${this.rhs};`+e}}class u extends i{constructor(e){super(),this.label=e,this.names={}}render({_n:e}){return`${this.label}:`+e}}class m extends i{constructor(e){super(),this.label=e,this.names={}}render({_n:e}){return`break${this.label?` ${this.label}`:""};`+e}}class f extends i{constructor(e){super(),this.error=e}render({_n:e}){return`throw ${this.error};`+e}get names(){return this.error.names}}class p extends i{constructor(e){super(),this.code=e}render({_n:e}){return`${this.code};`+e}optimizeNodes(){return`${this.code}`?this:void 0}optimizeNames(e,t){return this.code=I(this.code,e,t),this}get names(){return this.code instanceof o._CodeOrName?this.code.names:{}}}class h extends i{constructor(e=[]){super(),this.nodes=e}render(e){return this.nodes.reduce(((t,r)=>t+r.render(e)),"")}optimizeNodes(){const{nodes:e}=this;let t=e.length;for(;t--;){const r=e[t].optimizeNodes();Array.isArray(r)?e.splice(t,1,...r):r?e[t]=r:e.splice(t,1)}return e.length>0?this:void 0}optimizeNames(e,t){const{nodes:r}=this;let o=r.length;for(;o--;){const s=r[o];s.optimizeNames(e,t)||(x(e,s.names),r.splice(o,1))}return r.length>0?this:void 0}get names(){return this.nodes.reduce(((e,t)=>O(e,t.names)),{})}}class y extends h{render(e){return"{"+e._n+super.render(e)+"}"+e._n}}class v extends h{}class g extends y{}g.kind="else";class $ extends y{constructor(e,t){super(t),this.condition=e}render(e){let t=`if(${this.condition})`+super.render(e);return this.else&&(t+="else "+this.else.render(e)),t}optimizeNodes(){super.optimizeNodes();const e=this.condition;if(!0===e)return this.nodes;let t=this.else;if(t){const e=t.optimizeNodes();t=this.else=Array.isArray(e)?new g(e):e}return t?!1===e?t instanceof $?t:t.nodes:this.nodes.length?this:new $(C(e),t instanceof $?[t]:t.nodes):!1!==e&&this.nodes.length?this:void 0}optimizeNames(e,t){var r;if(this.else=null===(r=this.else)||void 0===r?void 0:r.optimizeNames(e,t),super.optimizeNames(e,t)||this.else)return this.condition=I(this.condition,e,t),this}get names(){const e=super.names;return R(e,this.condition),this.else&&O(e,this.else.names),e}}$.kind="if";class _ extends y{}_.kind="for";class b extends _{constructor(e){super(),this.iteration=e}render(e){return`for(${this.iteration})`+super.render(e)}optimizeNames(e,t){if(super.optimizeNames(e,t))return this.iteration=I(this.iteration,e,t),this}get names(){return O(super.names,this.iteration.names)}}class w extends _{constructor(e,t,r,o){super(),this.varKind=e,this.name=t,this.from=r,this.to=o}render(e){const t=e.es5?s.varKinds.var:this.varKind,{name:r,from:o,to:a}=this;return`for(${t} ${r}=${o}; ${r}<${a}; ${r}++)`+super.render(e)}get names(){const e=R(super.names,this.from);return R(e,this.to)}}class P extends _{constructor(e,t,r,o){super(),this.loop=e,this.varKind=t,this.name=r,this.iterable=o}render(e){return`for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})`+super.render(e)}optimizeNames(e,t){if(super.optimizeNames(e,t))return this.iterable=I(this.iterable,e,t),this}get names(){return O(super.names,this.iterable.names)}}class E extends y{constructor(e,t,r){super(),this.name=e,this.args=t,this.async=r}render(e){return`${this.async?"async ":""}function ${this.name}(${this.args})`+super.render(e)}}E.kind="func";class S extends h{render(e){return"return "+super.render(e)}}S.kind="return";class j extends y{render(e){let t="try"+super.render(e);return this.catch&&(t+=this.catch.render(e)),this.finally&&(t+=this.finally.render(e)),t}optimizeNodes(){var e,t;return super.optimizeNodes(),null===(e=this.catch)||void 0===e||e.optimizeNodes(),null===(t=this.finally)||void 0===t||t.optimizeNodes(),this}optimizeNames(e,t){var r,o;return super.optimizeNames(e,t),null===(r=this.catch)||void 0===r||r.optimizeNames(e,t),null===(o=this.finally)||void 0===o||o.optimizeNames(e,t),this}get names(){const e=super.names;return this.catch&&O(e,this.catch.names),this.finally&&O(e,this.finally.names),e}}class k extends y{constructor(e){super(),this.error=e}render(e){return`catch(${this.error})`+super.render(e)}}k.kind="catch";class N extends y{render(e){return"finally"+super.render(e)}}N.kind="finally";function O(e,t){for(const r in t)e[r]=(e[r]||0)+(t[r]||0);return e}function R(e,t){return t instanceof o._CodeOrName?O(e,t.names):e}function I(e,t,r){return e instanceof o.Name?a(e):(s=e)instanceof o._Code&&s._items.some((e=>e instanceof o.Name&&1===t[e.str]&&void 0!==r[e.str]))?new o._Code(e._items.reduce(((e,t)=>(t instanceof o.Name&&(t=a(t)),t instanceof o._Code?e.push(...t._items):e.push(t),e)),[])):e;var s;function a(e){const o=r[e.str];return void 0===o||1!==t[e.str]?e:(delete t[e.str],o)}}function x(e,t){for(const r in t)e[r]=(e[r]||0)-(t[r]||0)}function C(e){return"boolean"==typeof e||"number"==typeof e||null===e?!e:o._`!${D(e)}`}r.CodeGen=class{constructor(e,t={}){this._values={},this._blockStarts=[],this._constants={},this.opts={...t,_n:t.lines?"\n":""},this._extScope=e,this._scope=new s.Scope({parent:e}),this._nodes=[new v]}toString(){return this._root.render(this.opts)}name(e){return this._scope.name(e)}scopeName(e){return this._extScope.name(e)}scopeValue(e,t){const r=this._extScope.value(e,t);return(this._values[r.prefix]||(this._values[r.prefix]=new Set)).add(r),r}getScopeValue(e,t){return this._extScope.getValue(e,t)}scopeRefs(e){return this._extScope.scopeRefs(e,this._values)}scopeCode(){return this._extScope.scopeCode(this._values)}_def(e,t,r,o){const s=this._scope.toName(t);return void 0!==r&&o&&(this._constants[s.str]=r),this._leafNode(new c(e,s,r)),s}const(e,t,r){return this._def(s.varKinds.const,e,t,r)}let(e,t,r){return this._def(s.varKinds.let,e,t,r)}var(e,t,r){return this._def(s.varKinds.var,e,t,r)}assign(e,t,r){return this._leafNode(new d(e,t,r))}add(e,t){return this._leafNode(new l(e,r.operators.ADD,t))}code(e){return"function"==typeof e?e():e!==o.nil&&this._leafNode(new p(e)),this}object(...e){const t=["{"];for(const[r,s]of e)t.length>1&&t.push(","),t.push(r),(r!==s||this.opts.es5)&&(t.push(":"),(0,o.addCodeArg)(t,s));return t.push("}"),new o._Code(t)}if(e,t,r){if(this._blockNode(new $(e)),t&&r)this.code(t).else().code(r).endIf();else if(t)this.code(t).endIf();else if(r)throw new Error('CodeGen: "else" body without "then" body');return this}elseIf(e){return this._elseNode(new $(e))}else(){return this._elseNode(new g)}endIf(){return this._endBlockNode($,g)}_for(e,t){return this._blockNode(e),t&&this.code(t).endFor(),this}for(e,t){return this._for(new b(e),t)}forRange(e,t,r,o,a=(this.opts.es5?s.varKinds.var:s.varKinds.let)){const n=this._scope.toName(e);return this._for(new w(a,n,t,r),(()=>o(n)))}forOf(e,t,r,a=s.varKinds.const){const n=this._scope.toName(e);if(this.opts.es5){const e=t instanceof o.Name?t:this.var("_arr",t);return this.forRange("_i",0,o._`${e}.length`,(t=>{this.var(n,o._`${e}[${t}]`),r(n)}))}return this._for(new P("of",a,n,t),(()=>r(n)))}forIn(e,t,r,a=(this.opts.es5?s.varKinds.var:s.varKinds.const)){if(this.opts.ownProperties)return this.forOf(e,o._`Object.keys(${t})`,r);const n=this._scope.toName(e);return this._for(new P("in",a,n,t),(()=>r(n)))}endFor(){return this._endBlockNode(_)}label(e){return this._leafNode(new u(e))}break(e){return this._leafNode(new m(e))}return(e){const t=new S;if(this._blockNode(t),this.code(e),1!==t.nodes.length)throw new Error('CodeGen: "return" should have one node');return this._endBlockNode(S)}try(e,t,r){if(!t&&!r)throw new Error('CodeGen: "try" without "catch" and "finally"');const o=new j;if(this._blockNode(o),this.code(e),t){const e=this.name("e");this._currNode=o.catch=new k(e),t(e)}return r&&(this._currNode=o.finally=new N,this.code(r)),this._endBlockNode(k,N)}throw(e){return this._leafNode(new f(e))}block(e,t){return this._blockStarts.push(this._nodes.length),e&&this.code(e).endBlock(t),this}endBlock(e){const t=this._blockStarts.pop();if(void 0===t)throw new Error("CodeGen: not in self-balancing block");const r=this._nodes.length-t;if(r<0||void 0!==e&&r!==e)throw new Error(`CodeGen: wrong number of nodes: ${r} vs ${e} expected`);return this._nodes.length=t,this}func(e,t=o.nil,r,s){return this._blockNode(new E(e,t,r)),s&&this.code(s).endFunc(),this}endFunc(){return this._endBlockNode(E)}optimize(e=1){for(;e-- >0;)this._root.optimizeNodes(),this._root.optimizeNames(this._root.names,this._constants)}_leafNode(e){return this._currNode.nodes.push(e),this}_blockNode(e){this._currNode.nodes.push(e),this._nodes.push(e)}_endBlockNode(e,t){const r=this._currNode;if(r instanceof e||t&&r instanceof t)return this._nodes.pop(),this;throw new Error(`CodeGen: not in block "${t?`${e.kind}/${t.kind}`:e.kind}"`)}_elseNode(e){const t=this._currNode;if(!(t instanceof $))throw new Error('CodeGen: "else" without "if"');return this._currNode=t.else=e,this}get _root(){return this._nodes[0]}get _currNode(){const e=this._nodes;return e[e.length-1]}set _currNode(e){const t=this._nodes;t[t.length-1]=e}},r.not=C;const T=M(r.operators.AND);r.and=function(...e){return e.reduce(T)};const A=M(r.operators.OR);function M(e){return(t,r)=>t===o.nil?r:r===o.nil?t:o._`${D(t)} ${e} ${D(r)}`}function D(e){return e instanceof o.Name?e:o._`(${e})`}r.or=function(...e){return e.reduce(A)}},{"./code":1,"./scope":3}],3:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.ValueScope=r.ValueScopeName=r.Scope=r.varKinds=r.UsedValueState=void 0;const o=e("./code");class s extends Error{constructor(e){super(`CodeGen: "code" for ${e} not defined`),this.value=e.value}}var a;!function(e){e[e.Started=0]="Started",e[e.Completed=1]="Completed"}(a||(r.UsedValueState=a={})),r.varKinds={const:new o.Name("const"),let:new o.Name("let"),var:new o.Name("var")};class n{constructor({prefixes:e,parent:t}={}){this._names={},this._prefixes=e,this._parent=t}toName(e){return e instanceof o.Name?e:this.name(e)}name(e){return new o.Name(this._newName(e))}_newName(e){return`${e}${(this._names[e]||this._nameGroup(e)).index++}`}_nameGroup(e){var t,r;if((null===(r=null===(t=this._parent)||void 0===t?void 0:t._prefixes)||void 0===r?void 0:r.has(e))||this._prefixes&&!this._prefixes.has(e))throw new Error(`CodeGen: prefix "${e}" is not allowed in this scope`);return this._names[e]={prefix:e,index:0}}}r.Scope=n;class i extends o.Name{constructor(e,t){super(t),this.prefix=e}setValue(e,{property:t,itemIndex:r}){this.value=e,this.scopePath=o._`.${new o.Name(t)}[${r}]`}}r.ValueScopeName=i;const c=o._`\n`;r.ValueScope=class extends n{constructor(e){super(e),this._values={},this._scope=e.scope,this.opts={...e,_n:e.lines?c:o.nil}}get(){return this._scope}name(e){return new i(e,this._newName(e))}value(e,t){var r;if(void 0===t.ref)throw new Error("CodeGen: ref must be passed in value");const o=this.toName(e),{prefix:s}=o,a=null!==(r=t.key)&&void 0!==r?r:t.ref;let n=this._values[s];if(n){const e=n.get(a);if(e)return e}else n=this._values[s]=new Map;n.set(a,o);const i=this._scope[s]||(this._scope[s]=[]),c=i.length;return i[c]=t.ref,o.setValue(t,{property:s,itemIndex:c}),o}getValue(e,t){const r=this._values[e];if(r)return r.get(t)}scopeRefs(e,t=this._values){return this._reduceValues(t,(t=>{if(void 0===t.scopePath)throw new Error(`CodeGen: name "${t}" has no value`);return o._`${e}${t.scopePath}`}))}scopeCode(e=this._values,t,r){return this._reduceValues(e,(e=>{if(void 0===e.value)throw new Error(`CodeGen: name "${e}" has no value`);return e.value.code}),t,r)}_reduceValues(e,t,n={},i){let c=o.nil;for(const d in e){const l=e[d];if(!l)continue;const u=n[d]=n[d]||new Map;l.forEach((e=>{if(u.has(e))return;u.set(e,a.Started);let n=t(e);if(n){c=o._`${c}${this.opts.es5?r.varKinds.var:r.varKinds.const} ${e} = ${n};${this.opts._n}`}else{if(!(n=null==i?void 0:i(e)))throw new s(e);c=o._`${c}${n}${this.opts._n}`}u.set(e,a.Completed)}))}return c}}},{"./code":1}],4:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.extendErrors=r.resetErrorsCount=r.reportExtraError=r.reportError=r.keyword$DataError=r.keywordError=void 0;const o=e("./codegen"),s=e("./util"),a=e("./names");function n(e,t){const r=e.const("err",t);e.if(o._`${a.default.vErrors} === null`,(()=>e.assign(a.default.vErrors,o._`[${r}]`)),o._`${a.default.vErrors}.push(${r})`),e.code(o._`${a.default.errors}++`)}function i(e,t){const{gen:r,validateName:s,schemaEnv:a}=e;a.$async?r.throw(o._`new ${e.ValidationError}(${t})`):(r.assign(o._`${s}.errors`,t),r.return(!1))}r.keywordError={message({keyword:e}){return o.str`must pass "${e}" keyword validation`}},r.keyword$DataError={message({keyword:e,schemaType:t}){return t?o.str`"${e}" keyword must be ${t} ($data)`:o.str`"${e}" keyword is invalid ($data)`}},r.reportError=function(e,t=r.keywordError,s,a){const{it:c}=e,{gen:l,compositeRule:u,allErrors:m}=c,f=d(e,t,s);(null!=a?a:u||m)?n(l,f):i(c,o._`[${f}]`)},r.reportExtraError=function(e,t=r.keywordError,o){const{it:s}=e,{gen:c,compositeRule:l,allErrors:u}=s;n(c,d(e,t,o)),l||u||i(s,a.default.vErrors)},r.resetErrorsCount=function(e,t){e.assign(a.default.errors,t),e.if(o._`${a.default.vErrors} !== null`,(()=>e.if(t,(()=>e.assign(o._`${a.default.vErrors}.length`,t)),(()=>e.assign(a.default.vErrors,null)))))},r.extendErrors=function({gen:e,keyword:t,schemaValue:r,data:s,errsCount:n,it:i}){if(void 0===n)throw new Error("ajv implementation error");const c=e.name("err");e.forRange("i",n,a.default.errors,(n=>{e.const(c,o._`${a.default.vErrors}[${n}]`),e.if(o._`${c}.instancePath === undefined`,(()=>e.assign(o._`${c}.instancePath`,(0,o.strConcat)(a.default.instancePath,i.errorPath)))),e.assign(o._`${c}.schemaPath`,o.str`${i.errSchemaPath}/${t}`),i.opts.verbose&&(e.assign(o._`${c}.schema`,r),e.assign(o._`${c}.data`,s))}))};const c={keyword:new o.Name("keyword"),schemaPath:new o.Name("schemaPath"),params:new o.Name("params"),propertyName:new o.Name("propertyName"),message:new o.Name("message"),schema:new o.Name("schema"),parentSchema:new o.Name("parentSchema")};function d(e,t,r){const{createErrors:s}=e.it;return!1===s?o._`{}`:function(e,t,r={}){const{gen:s,it:n}=e,i=[l(n,r),u(e,r)];return function(e,{params:t,message:r},s){const{keyword:n,data:i,schemaValue:d,it:l}=e,{opts:u,propertyName:m,topSchemaRef:f,schemaPath:p}=l;s.push([c.keyword,n],[c.params,"function"==typeof t?t(e):t||o._`{}`]),u.messages&&s.push([c.message,"function"==typeof r?r(e):r]);u.verbose&&s.push([c.schema,d],[c.parentSchema,o._`${f}${p}`],[a.default.data,i]);m&&s.push([c.propertyName,m])}(e,t,i),s.object(...i)}(e,t,r)}function l({errorPath:e},{instancePath:t}){const r=t?o.str`${e}${(0,s.getErrorPath)(t,s.Type.Str)}`:e;return[a.default.instancePath,(0,o.strConcat)(a.default.instancePath,r)]}function u({keyword:e,it:{errSchemaPath:t}},{schemaPath:r,parentSchema:a}){let n=a?t:o.str`${t}/${e}`;return r&&(n=o.str`${n}${(0,s.getErrorPath)(r,s.Type.Str)}`),[c.schemaPath,n]}},{"./codegen":2,"./names":6,"./util":10}],5:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.resolveSchema=r.getCompilingSchema=r.resolveRef=r.compileSchema=r.SchemaEnv=void 0;const o=e("./codegen"),s=e("../runtime/validation_error"),a=e("./names"),n=e("./resolve"),i=e("./util"),c=e("./validate");class d{constructor(e){var t;let r;this.refs={},this.dynamicAnchors={},"object"==typeof e.schema&&(r=e.schema),this.schema=e.schema,this.schemaId=e.schemaId,this.root=e.root||this,this.baseId=null!==(t=e.baseId)&&void 0!==t?t:(0,n.normalizeId)(null==r?void 0:r[e.schemaId||"$id"]),this.schemaPath=e.schemaPath,this.localRefs=e.localRefs,this.meta=e.meta,this.$async=null==r?void 0:r.$async,this.refs={}}}function l(e){const t=m.call(this,e);if(t)return t;const r=(0,n.getFullPath)(this.opts.uriResolver,e.root.baseId),{es5:i,lines:d}=this.opts.code,{ownProperties:l}=this.opts,u=new o.CodeGen(this.scope,{es5:i,lines:d,ownProperties:l});let f;e.$async&&(f=u.scopeValue("Error",{ref:s.default,code:o._`require("ajv/dist/runtime/validation_error").default`}));const p=u.scopeName("validate");e.validateName=p;const h={gen:u,allErrors:this.opts.allErrors,data:a.default.data,parentData:a.default.parentData,parentDataProperty:a.default.parentDataProperty,dataNames:[a.default.data],dataPathArr:[o.nil],dataLevel:0,dataTypes:[],definedProperties:new Set,topSchemaRef:u.scopeValue("schema",!0===this.opts.code.source?{ref:e.schema,code:(0,o.stringify)(e.schema)}:{ref:e.schema}),validateName:p,ValidationError:f,schema:e.schema,schemaEnv:e,rootId:r,baseId:e.baseId||r,schemaPath:o.nil,errSchemaPath:e.schemaPath||(this.opts.jtd?"":"#"),errorPath:o._`""`,opts:this.opts,self:this};let y;try{this._compilations.add(e),(0,c.validateFunctionCode)(h),u.optimize(this.opts.code.optimize);const t=u.toString();y=`${u.scopeRefs(a.default.scope)}return ${t}`,this.opts.code.process&&(y=this.opts.code.process(y,e));const r=new Function(`${a.default.self}`,`${a.default.scope}`,y)(this,this.scope.get());if(this.scope.value(p,{ref:r}),r.errors=null,r.schema=e.schema,r.schemaEnv=e,e.$async&&(r.$async=!0),!0===this.opts.code.source&&(r.source={validateName:p,validateCode:t,scopeValues:u._values}),this.opts.unevaluated){const{props:e,items:t}=h;r.evaluated={props:e instanceof o.Name?void 0:e,items:t instanceof o.Name?void 0:t,dynamicProps:e instanceof o.Name,dynamicItems:t instanceof o.Name},r.source&&(r.source.evaluated=(0,o.stringify)(r.evaluated))}return e.validate=r,e}catch(t){throw delete e.validate,delete e.validateName,y&&this.logger.error("Error compiling schema, function code:",y),t}finally{this._compilations.delete(e)}}function u(e){return(0,n.inlineRef)(e.schema,this.opts.inlineRefs)?e.schema:e.validate?e:l.call(this,e)}function m(e){for(const o of this._compilations)if((t=o).schema===(r=e).schema&&t.root===r.root&&t.baseId===r.baseId)return o;var t,r}function f(e,t){let r;for(;"string"==typeof(r=this.refs[t]);)t=r;return r||this.schemas[t]||p.call(this,e,t)}function p(e,t){const r=this.opts.uriResolver.parse(t),o=(0,n._getFullPath)(this.opts.uriResolver,r);let s=(0,n.getFullPath)(this.opts.uriResolver,e.baseId,void 0);if(Object.keys(e.schema).length>0&&o===s)return y.call(this,r,e);const a=(0,n.normalizeId)(o),i=this.refs[a]||this.schemas[a];if("string"==typeof i){const t=p.call(this,e,i);if("object"!=typeof(null==t?void 0:t.schema))return;return y.call(this,r,t)}if("object"==typeof(null==i?void 0:i.schema)){if(i.validate||l.call(this,i),a===(0,n.normalizeId)(t)){const{schema:t}=i,{schemaId:r}=this.opts,o=t[r];return o&&(s=(0,n.resolveUrl)(this.opts.uriResolver,s,o)),new d({schema:t,schemaId:r,root:e,baseId:s})}return y.call(this,r,i)}}r.SchemaEnv=d,r.compileSchema=l,r.resolveRef=function(e,t,r){var o;r=(0,n.resolveUrl)(this.opts.uriResolver,t,r);const s=e.refs[r];if(s)return s;let a=f.call(this,e,r);if(void 0===a){const s=null===(o=e.localRefs)||void 0===o?void 0:o[r],{schemaId:n}=this.opts;s&&(a=new d({schema:s,schemaId:n,root:e,baseId:t}))}return void 0!==a?e.refs[r]=u.call(this,a):void 0},r.getCompilingSchema=m,r.resolveSchema=p;const h=new Set(["properties","patternProperties","enum","dependencies","definitions"]);function y(e,{baseId:t,schema:r,root:o}){var s;if("/"!==(null===(s=e.fragment)||void 0===s?void 0:s[0]))return;for(const o of e.fragment.slice(1).split("/")){if("boolean"==typeof r)return;const e=r[(0,i.unescapeFragment)(o)];if(void 0===e)return;const s="object"==typeof(r=e)&&r[this.opts.schemaId];!h.has(o)&&s&&(t=(0,n.resolveUrl)(this.opts.uriResolver,t,s))}let a;if("boolean"!=typeof r&&r.$ref&&!(0,i.schemaHasRulesButRef)(r,this.RULES)){const e=(0,n.resolveUrl)(this.opts.uriResolver,t,r.$ref);a=p.call(this,o,e)}const{schemaId:c}=this.opts;return a=a||new d({schema:r,schemaId:c,root:o,baseId:t}),a.schema!==a.root.schema?a:void 0}},{"../runtime/validation_error":32,"./codegen":2,"./names":6,"./resolve":8,"./util":10,"./validate":15}],6:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("./codegen"),s={data:new o.Name("data"),valCxt:new o.Name("valCxt"),instancePath:new o.Name("instancePath"),parentData:new o.Name("parentData"),parentDataProperty:new o.Name("parentDataProperty"),rootData:new o.Name("rootData"),dynamicAnchors:new o.Name("dynamicAnchors"),vErrors:new o.Name("vErrors"),errors:new o.Name("errors"),this:new o.Name("this"),self:new o.Name("self"),scope:new o.Name("scope"),json:new o.Name("json"),jsonPos:new o.Name("jsonPos"),jsonLen:new o.Name("jsonLen"),jsonPart:new o.Name("jsonPart")};r.default=s},{"./codegen":2}],7:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("./resolve");class s extends Error{constructor(e,t,r,s){super(s||`can't resolve reference ${r} from id ${t}`),this.missingRef=(0,o.resolveUrl)(e,t,r),this.missingSchema=(0,o.normalizeId)((0,o.getFullPath)(e,this.missingRef))}}r.default=s},{"./resolve":8}],8:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.getSchemaRefs=r.resolveUrl=r.normalizeId=r._getFullPath=r.getFullPath=r.inlineRef=void 0;const o=e("./util"),s=e("fast-deep-equal"),a=e("json-schema-traverse"),n=new Set(["type","format","pattern","maxLength","minLength","maxProperties","minProperties","maxItems","minItems","maximum","minimum","uniqueItems","multipleOf","required","enum","const"]);r.inlineRef=function(e,t=!0){return"boolean"==typeof e||(!0===t?!c(e):!!t&&d(e)<=t)};const i=new Set(["$ref","$recursiveRef","$recursiveAnchor","$dynamicRef","$dynamicAnchor"]);function c(e){for(const t in e){if(i.has(t))return!0;const r=e[t];if(Array.isArray(r)&&r.some(c))return!0;if("object"==typeof r&&c(r))return!0}return!1}function d(e){let t=0;for(const r in e){if("$ref"===r)return Infinity;if(t++,!n.has(r)&&("object"==typeof e[r]&&(0,o.eachItem)(e[r],(e=>t+=d(e))),Infinity===t))return Infinity}return t}function l(e,t="",r){!1!==r&&(t=f(t));const o=e.parse(t);return u(e,o)}function u(e,t){return e.serialize(t).split("#")[0]+"#"}r.getFullPath=l,r._getFullPath=u;const m=/#\/?$/;function f(e){return e?e.replace(m,""):""}r.normalizeId=f,r.resolveUrl=function(e,t,r){return r=f(r),e.resolve(t,r)};const p=/^[a-z_][-a-z0-9._]*$/i;r.getSchemaRefs=function(e,t){if("boolean"==typeof e)return{};const{schemaId:r,uriResolver:o}=this.opts,n=f(e[r]||t),i={"":n},c=l(o,n,!1),d={},u=new Set;return a(e,{allKeys:!0},((e,t,o,s)=>{if(void 0===s)return;const a=c+t;let n=i[s];function l(t){if(t=f(n?(0,this.opts.uriResolver.resolve)(n,t):t),u.has(t))throw h(t);u.add(t);let r=this.refs[t];return"string"==typeof r&&(r=this.refs[r]),"object"==typeof r?m(e,r.schema,t):t!==f(a)&&("#"===t[0]?(m(e,d[t],t),d[t]=e):this.refs[t]=a),t}function y(e){if("string"==typeof e){if(!p.test(e))throw new Error(`invalid anchor "${e}"`);l.call(this,`#${e}`)}}"string"==typeof e[r]&&(n=l.call(this,e[r])),y.call(this,e.$anchor),y.call(this,e.$dynamicAnchor),i[t]=n})),d;function m(e,t,r){if(void 0!==t&&!s(e,t))throw h(r)}function h(e){return new Error(`reference "${e}" resolves to more than one schema`)}}},{"./util":10,"fast-deep-equal":83,"json-schema-traverse":88}],9:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.getRules=r.isJSONType=void 0;const o=new Set(["string","number","integer","boolean","null","object","array"]);r.isJSONType=function(e){return"string"==typeof e&&o.has(e)},r.getRules=function(){const e={number:{type:"number",rules:[]},string:{type:"string",rules:[]},array:{type:"array",rules:[]},object:{type:"object",rules:[]}};return{types:{...e,integer:!0,boolean:!0,null:!0},rules:[{rules:[]},e.number,e.string,e.array,e.object],post:{rules:[]},all:{},keywords:{}}}},{}],10:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.checkStrictMode=r.getErrorPath=r.Type=r.useFunc=r.setEvaluated=r.evaluatedPropsToName=r.mergeEvaluated=r.eachItem=r.unescapeJsonPointer=r.escapeJsonPointer=r.escapeFragment=r.unescapeFragment=r.schemaRefOrVal=r.schemaHasRulesButRef=r.schemaHasRules=r.checkUnknownRules=r.alwaysValidSchema=r.toHash=void 0;const o=e("./codegen"),s=e("./codegen/code");function a(e,t=e.schema){const{opts:r,self:o}=e;if(!r.strictSchema)return;if("boolean"==typeof t)return;const s=o.RULES.keywords;for(const r in t)s[r]||p(e,`unknown keyword: "${r}"`)}function n(e,t){if("boolean"==typeof e)return!e;for(const r in e)if(t[r])return!0;return!1}function i(e){return"number"==typeof e?`${e}`:e.replace(/~/g,"~0").replace(/\//g,"~1")}function c(e){return e.replace(/~1/g,"/").replace(/~0/g,"~")}function d({mergeNames:e,mergeToName:t,mergeValues:r,resultToName:s}){return(a,n,i,c)=>{const d=void 0===i?n:i instanceof o.Name?(n instanceof o.Name?e(a,n,i):t(a,n,i),i):n instanceof o.Name?(t(a,i,n),n):r(n,i);return c!==o.Name||d instanceof o.Name?d:s(a,d)}}function l(e,t){if(!0===t)return e.var("props",!0);const r=e.var("props",o._`{}`);return void 0!==t&&u(e,r,t),r}function u(e,t,r){Object.keys(r).forEach((r=>e.assign(o._`${t}${(0,o.getProperty)(r)}`,!0)))}r.toHash=function(e){const t={};for(const r of e)t[r]=!0;return t},r.alwaysValidSchema=function(e,t){return"boolean"==typeof t?t:0===Object.keys(t).length||(a(e,t),!n(t,e.self.RULES.all))},r.checkUnknownRules=a,r.schemaHasRules=n,r.schemaHasRulesButRef=function(e,t){if("boolean"==typeof e)return!e;for(const r in e)if("$ref"!==r&&t.all[r])return!0;return!1},r.schemaRefOrVal=function({topSchemaRef:e,schemaPath:t},r,s,a){if(!a){if("number"==typeof r||"boolean"==typeof r)return r;if("string"==typeof r)return o._`${r}`}return o._`${e}${t}${(0,o.getProperty)(s)}`},r.unescapeFragment=function(e){return c(decodeURIComponent(e))},r.escapeFragment=function(e){return encodeURIComponent(i(e))},r.escapeJsonPointer=i,r.unescapeJsonPointer=c,r.eachItem=function(e,t){if(Array.isArray(e))for(const r of e)t(r);else t(e)},r.mergeEvaluated={props:d({mergeNames(e,t,r){return e.if(o._`${r} !== true && ${t} !== undefined`,(()=>{e.if(o._`${t} === true`,(()=>e.assign(r,!0)),(()=>e.assign(r,o._`${r} || {}`).code(o._`Object.assign(${r}, ${t})`)))}))},mergeToName(e,t,r){return e.if(o._`${r} !== true`,(()=>{!0===t?e.assign(r,!0):(e.assign(r,o._`${r} || {}`),u(e,r,t))}))},mergeValues(e,t){return!0===e||{...e,...t}},resultToName:l}),items:d({mergeNames(e,t,r){return e.if(o._`${r} !== true && ${t} !== undefined`,(()=>e.assign(r,o._`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)))},mergeToName(e,t,r){return e.if(o._`${r} !== true`,(()=>e.assign(r,!0===t||o._`${r} > ${t} ? ${r} : ${t}`)))},mergeValues(e,t){return!0===e||Math.max(e,t)},resultToName(e,t){return e.var("items",t)}})},r.evaluatedPropsToName=l,r.setEvaluated=u;const m={};var f;function p(e,t,r=e.opts.strictSchema){if(r){if(t=`strict mode: ${t}`,!0===r)throw new Error(t);e.self.logger.warn(t)}}r.useFunc=function(e,t){return e.scopeValue("func",{ref:t,code:m[t.code]||(m[t.code]=new s._Code(t.code))})},function(e){e[e.Num=0]="Num",e[e.Str=1]="Str"}(f||(r.Type=f={})),r.getErrorPath=function(e,t,r){if(e instanceof o.Name){const s=t===f.Num;return r?s?o._`"[" + ${e} + "]"`:o._`"['" + ${e} + "']"`:s?o._`"/" + ${e}`:o._`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`}return r?(0,o.getProperty)(e).toString():"/"+i(e)},r.checkStrictMode=p},{"./codegen":2,"./codegen/code":1}],11:[function(e,t,r){"use strict";function o(e,t){return t.rules.some((t=>s(e,t)))}function s(e,t){var r;return void 0!==e[t.keyword]||(null===(r=t.definition.implements)||void 0===r?void 0:r.some((t=>void 0!==e[t])))}Object.defineProperty(r,"__esModule",{value:!0}),r.shouldUseRule=r.shouldUseGroup=r.schemaHasRulesForType=void 0,r.schemaHasRulesForType=function({schema:e,self:t},r){const s=t.RULES.types[r];return s&&!0!==s&&o(e,s)},r.shouldUseGroup=o,r.shouldUseRule=s},{}],12:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.boolOrEmptySchema=r.topBoolOrEmptySchema=void 0;const o=e("../errors"),s=e("../codegen"),a=e("../names"),n={message:"boolean schema is false"};function i(e,t){const{gen:r,data:s}=e;(0,o.reportError)({gen:r,keyword:"false schema",data:s,schema:!1,schemaCode:!1,schemaValue:!1,params:{},it:e},n,void 0,t)}r.topBoolOrEmptySchema=function(e){const{gen:t,schema:r,validateName:o}=e;!1===r?i(e,!1):"object"==typeof r&&!0===r.$async?t.return(a.default.data):(t.assign(s._`${o}.errors`,null),t.return(!0))},r.boolOrEmptySchema=function(e,t){const{gen:r,schema:o}=e;!1===o?(r.var(t,!1),i(e)):r.var(t,!0)}},{"../codegen":2,"../errors":4,"../names":6}],13:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.reportTypeError=r.checkDataTypes=r.checkDataType=r.coerceAndCheckDataType=r.getJSONTypes=r.getSchemaTypes=r.DataType=void 0;const o=e("../rules"),s=e("./applicability"),a=e("../errors"),n=e("../codegen"),i=e("../util");var c;function d(e){const t=Array.isArray(e)?e:e?[e]:[];if(t.every(o.isJSONType))return t;throw new Error("type must be JSONType or JSONType[]: "+t.join(","))}!function(e){e[e.Correct=0]="Correct",e[e.Wrong=1]="Wrong"}(c||(r.DataType=c={})),r.getSchemaTypes=function(e){const t=d(e.type);if(t.includes("null")){if(!1===e.nullable)throw new Error("type: null contradicts nullable: false")}else{if(!t.length&&void 0!==e.nullable)throw new Error('"nullable" cannot be used without "type"');!0===e.nullable&&t.push("null")}return t},r.getJSONTypes=d,r.coerceAndCheckDataType=function(e,t){const{gen:r,data:o,opts:a}=e,i=function(e,t){return t?e.filter((e=>l.has(e)||"array"===t&&"array"===e)):[]}(t,a.coerceTypes),d=t.length>0&&!(0===i.length&&1===t.length&&(0,s.schemaHasRulesForType)(e,t[0]));if(d){const s=m(t,o,a.strictNumbers,c.Wrong);r.if(s,(()=>{i.length?function(e,t,r){const{gen:o,data:s,opts:a}=e,i=o.let("dataType",n._`typeof ${s}`),c=o.let("coerced",n._`undefined`);"array"===a.coerceTypes&&o.if(n._`${i} == 'object' && Array.isArray(${s}) && ${s}.length == 1`,(()=>o.assign(s,n._`${s}[0]`).assign(i,n._`typeof ${s}`).if(m(t,s,a.strictNumbers),(()=>o.assign(c,s)))));o.if(n._`${c} !== undefined`);for(const e of r)(l.has(e)||"array"===e&&"array"===a.coerceTypes)&&d(e);function d(e){switch(e){case"string":return void o.elseIf(n._`${i} == "number" || ${i} == "boolean"`).assign(c,n._`"" + ${s}`).elseIf(n._`${s} === null`).assign(c,n._`""`);case"number":return void o.elseIf(n._`${i} == "boolean" || ${s} === null
              || (${i} == "string" && ${s} && ${s} == +${s})`).assign(c,n._`+${s}`);case"integer":return void o.elseIf(n._`${i} === "boolean" || ${s} === null
              || (${i} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(c,n._`+${s}`);case"boolean":return void o.elseIf(n._`${s} === "false" || ${s} === 0 || ${s} === null`).assign(c,!1).elseIf(n._`${s} === "true" || ${s} === 1`).assign(c,!0);case"null":return o.elseIf(n._`${s} === "" || ${s} === 0 || ${s} === false`),void o.assign(c,null);case"array":o.elseIf(n._`${i} === "string" || ${i} === "number"
              || ${i} === "boolean" || ${s} === null`).assign(c,n._`[${s}]`)}}o.else(),p(e),o.endIf(),o.if(n._`${c} !== undefined`,(()=>{o.assign(s,c),function({gen:e,parentData:t,parentDataProperty:r},o){e.if(n._`${t} !== undefined`,(()=>e.assign(n._`${t}[${r}]`,o)))}(e,c)}))}(e,t,i):p(e)}))}return d};const l=new Set(["string","number","integer","boolean","null"]);function u(e,t,r,o=c.Correct){const s=o===c.Correct?n.operators.EQ:n.operators.NEQ;let a;switch(e){case"null":return n._`${t} ${s} null`;case"array":a=n._`Array.isArray(${t})`;break;case"object":a=n._`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;break;case"integer":a=i(n._`!(${t} % 1) && !isNaN(${t})`);break;case"number":a=i();break;default:return n._`typeof ${t} ${s} ${e}`}return o===c.Correct?a:(0,n.not)(a);function i(e=n.nil){return(0,n.and)(n._`typeof ${t} == "number"`,e,r?n._`isFinite(${t})`:n.nil)}}function m(e,t,r,o){if(1===e.length)return u(e[0],t,r,o);let s;const a=(0,i.toHash)(e);if(a.array&&a.object){const e=n._`typeof ${t} != "object"`;s=a.null?e:n._`!${t} || ${e}`,delete a.null,delete a.array,delete a.object}else s=n.nil;a.number&&delete a.integer;for(const e in a)s=(0,n.and)(s,u(e,t,r,o));return s}r.checkDataType=u,r.checkDataTypes=m;const f={message({schema:e}){return`must be ${e}`},params({schema:e,schemaValue:t}){return"string"==typeof e?n._`{type: ${e}}`:n._`{type: ${t}}`}};function p(e){const t=function(e){const{gen:t,data:r,schema:o}=e,s=(0,i.schemaRefOrVal)(e,o,"type");return{gen:t,keyword:"type",data:r,schema:o.type,schemaCode:s,schemaValue:s,parentSchema:o,params:{},it:e}}(e);(0,a.reportError)(t,f)}r.reportTypeError=p},{"../codegen":2,"../errors":4,"../rules":9,"../util":10,"./applicability":11}],14:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.assignDefaults=void 0;const o=e("../codegen"),s=e("../util");function a(e,t,r){const{gen:a,compositeRule:n,data:i,opts:c}=e;if(void 0===r)return;const d=o._`${i}${(0,o.getProperty)(t)}`;if(n)return void(0,s.checkStrictMode)(e,`default is ignored for: ${d}`);let l=o._`${d} === undefined`;"empty"===c.useDefaults&&(l=o._`${l} || ${d} === null || ${d} === ""`),a.if(l,o._`${d} = ${(0,o.stringify)(r)}`)}r.assignDefaults=function(e,t){const{properties:r,items:o}=e.schema;if("object"===t&&r)for(const t in r)a(e,t,r[t].default);else"array"===t&&Array.isArray(o)&&o.forEach(((t,r)=>a(e,r,t.default)))}},{"../codegen":2,"../util":10}],15:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.getData=r.KeywordCxt=r.validateFunctionCode=void 0;const o=e("./boolSchema"),s=e("./dataType"),a=e("./applicability"),n=e("./dataType"),i=e("./defaults"),c=e("./keyword"),d=e("./subschema"),l=e("../codegen"),u=e("../names"),m=e("../resolve"),f=e("../util"),p=e("../errors");function h({gen:e,validateName:t,schema:r,schemaEnv:o,opts:s},a){s.code.es5?e.func(t,l._`${u.default.data}, ${u.default.valCxt}`,o.$async,(()=>{e.code(l._`"use strict"; ${y(r,s)}`),function(e,t){e.if(u.default.valCxt,(()=>{e.var(u.default.instancePath,l._`${u.default.valCxt}.${u.default.instancePath}`),e.var(u.default.parentData,l._`${u.default.valCxt}.${u.default.parentData}`),e.var(u.default.parentDataProperty,l._`${u.default.valCxt}.${u.default.parentDataProperty}`),e.var(u.default.rootData,l._`${u.default.valCxt}.${u.default.rootData}`),t.dynamicRef&&e.var(u.default.dynamicAnchors,l._`${u.default.valCxt}.${u.default.dynamicAnchors}`)}),(()=>{e.var(u.default.instancePath,l._`""`),e.var(u.default.parentData,l._`undefined`),e.var(u.default.parentDataProperty,l._`undefined`),e.var(u.default.rootData,u.default.data),t.dynamicRef&&e.var(u.default.dynamicAnchors,l._`{}`)}))}(e,s),e.code(a)})):e.func(t,l._`${u.default.data}, ${function(e){return l._`{${u.default.instancePath}="", ${u.default.parentData}, ${u.default.parentDataProperty}, ${u.default.rootData}=${u.default.data}${e.dynamicRef?l._`, ${u.default.dynamicAnchors}={}`:l.nil}}={}`}(s)}`,o.$async,(()=>e.code(y(r,s)).code(a)))}function y(e,t){const r="object"==typeof e&&e[t.schemaId];return r&&(t.code.source||t.code.process)?l._`/*# sourceURL=${r} */`:l.nil}function v(e,t){$(e)&&(_(e),g(e))?function(e,t){const{schema:r,gen:o,opts:s}=e;s.$comment&&r.$comment&&w(e);(function(e){const t=e.schema[e.opts.schemaId];t&&(e.baseId=(0,m.resolveUrl)(e.opts.uriResolver,e.baseId,t))})(e),function(e){if(e.schema.$async&&!e.schemaEnv.$async)throw new Error("async schema in sync schema")}(e);const a=o.const("_errs",u.default.errors);b(e,a),o.var(t,l._`${a} === ${u.default.errors}`)}(e,t):(0,o.boolOrEmptySchema)(e,t)}function g({schema:e,self:t}){if("boolean"==typeof e)return!e;for(const r in e)if(t.RULES.all[r])return!0;return!1}function $(e){return"boolean"!=typeof e.schema}function _(e){(0,f.checkUnknownRules)(e),function(e){const{schema:t,errSchemaPath:r,opts:o,self:s}=e;t.$ref&&o.ignoreKeywordsWithRef&&(0,f.schemaHasRulesButRef)(t,s.RULES)&&s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`)}(e)}function b(e,t){if(e.opts.jtd)return P(e,[],!1,t);const r=(0,s.getSchemaTypes)(e.schema);P(e,r,!(0,s.coerceAndCheckDataType)(e,r),t)}function w({gen:e,schemaEnv:t,schema:r,errSchemaPath:o,opts:s}){const a=r.$comment;if(!0===s.$comment)e.code(l._`${u.default.self}.logger.log(${a})`);else if("function"==typeof s.$comment){const r=l.str`${o}/$comment`,s=e.scopeValue("root",{ref:t.root});e.code(l._`${u.default.self}.opts.$comment(${a}, ${r}, ${s}.schema)`)}}function P(e,t,r,o){const{gen:s,schema:i,data:c,allErrors:d,opts:m,self:p}=e,{RULES:h}=p;function y(f){(0,a.shouldUseGroup)(i,f)&&(f.type?(s.if((0,n.checkDataType)(f.type,c,m.strictNumbers)),E(e,f),1===t.length&&t[0]===f.type&&r&&(s.else(),(0,n.reportTypeError)(e)),s.endIf()):E(e,f),d||s.if(l._`${u.default.errors} === ${o||0}`))}!i.$ref||!m.ignoreKeywordsWithRef&&(0,f.schemaHasRulesButRef)(i,h)?(m.jtd||function(e,t){if(e.schemaEnv.meta||!e.opts.strictTypes)return;(function(e,t){if(!t.length)return;if(!e.dataTypes.length)return void(e.dataTypes=t);t.forEach((t=>{j(e.dataTypes,t)||k(e,`type "${t}" not allowed by context "${e.dataTypes.join(",")}"`)})),function(e,t){const r=[];for(const o of e.dataTypes)j(t,o)?r.push(o):t.includes("integer")&&"number"===o&&r.push("integer");e.dataTypes=r}(e,t)})(e,t),e.opts.allowUnionTypes||function(e,t){t.length>1&&(2!==t.length||!t.includes("null"))&&k(e,"use allowUnionTypes to allow union type keyword")}(e,t);!function(e,t){const r=e.self.RULES.all;for(const o in r){const s=r[o];if("object"==typeof s&&(0,a.shouldUseRule)(e.schema,s)){const{type:r}=s.definition;r.length&&!r.some((e=>S(t,e)))&&k(e,`missing type "${r.join(",")}" for keyword "${o}"`)}}}(e,e.dataTypes)}(e,t),s.block((()=>{for(const e of h.rules)y(e);y(h.post)}))):s.block((()=>O(e,"$ref",h.all.$ref.definition)))}function E(e,t){const{gen:r,schema:o,opts:{useDefaults:s}}=e;s&&(0,i.assignDefaults)(e,t.type),r.block((()=>{for(const r of t.rules)(0,a.shouldUseRule)(o,r)&&O(e,r.keyword,r.definition,t.type)}))}function S(e,t){return e.includes(t)||"number"===t&&e.includes("integer")}function j(e,t){return e.includes(t)||"integer"===t&&e.includes("number")}function k(e,t){(0,f.checkStrictMode)(e,t+=` at "${e.schemaEnv.baseId+e.errSchemaPath}" (strictTypes)`,e.opts.strictTypes)}r.validateFunctionCode=function(e){$(e)&&(_(e),g(e))?function(e){const{schema:t,opts:r,gen:o}=e;h(e,(()=>{r.$comment&&t.$comment&&w(e),function(e){const{schema:t,opts:r}=e;void 0!==t.default&&r.useDefaults&&r.strictSchema&&(0,f.checkStrictMode)(e,"default is ignored in the schema root")}(e),o.let(u.default.vErrors,null),o.let(u.default.errors,0),r.unevaluated&&function(e){const{gen:t,validateName:r}=e;e.evaluated=t.const("evaluated",l._`${r}.evaluated`),t.if(l._`${e.evaluated}.dynamicProps`,(()=>t.assign(l._`${e.evaluated}.props`,l._`undefined`))),t.if(l._`${e.evaluated}.dynamicItems`,(()=>t.assign(l._`${e.evaluated}.items`,l._`undefined`)))}(e),b(e),function(e){const{gen:t,schemaEnv:r,validateName:o,ValidationError:s,opts:a}=e;r.$async?t.if(l._`${u.default.errors} === 0`,(()=>t.return(u.default.data)),(()=>t.throw(l._`new ${s}(${u.default.vErrors})`))):(t.assign(l._`${o}.errors`,u.default.vErrors),a.unevaluated&&function({gen:e,evaluated:t,props:r,items:o}){r instanceof l.Name&&e.assign(l._`${t}.props`,r);o instanceof l.Name&&e.assign(l._`${t}.items`,o)}(e),t.return(l._`${u.default.errors} === 0`))}(e)}))}(e):h(e,(()=>(0,o.topBoolOrEmptySchema)(e)))};class N{constructor(e,t,r){if((0,c.validateKeywordUsage)(e,t,r),this.gen=e.gen,this.allErrors=e.allErrors,this.keyword=r,this.data=e.data,this.schema=e.schema[r],this.$data=t.$data&&e.opts.$data&&this.schema&&this.schema.$data,this.schemaValue=(0,f.schemaRefOrVal)(e,this.schema,r,this.$data),this.schemaType=t.schemaType,this.parentSchema=e.schema,this.params={},this.it=e,this.def=t,this.$data)this.schemaCode=e.gen.const("vSchema",x(this.$data,e));else if(this.schemaCode=this.schemaValue,!(0,c.validSchemaType)(this.schema,t.schemaType,t.allowUndefined))throw new Error(`${r} value must be ${JSON.stringify(t.schemaType)}`);("code"in t?t.trackErrors:!1!==t.errors)&&(this.errsCount=e.gen.const("_errs",u.default.errors))}result(e,t,r){this.failResult((0,l.not)(e),t,r)}failResult(e,t,r){this.gen.if(e),r?r():this.error(),t?(this.gen.else(),t(),this.allErrors&&this.gen.endIf()):this.allErrors?this.gen.endIf():this.gen.else()}pass(e,t){this.failResult((0,l.not)(e),void 0,t)}fail(e){if(void 0===e)return this.error(),void(this.allErrors||this.gen.if(!1));this.gen.if(e),this.error(),this.allErrors?this.gen.endIf():this.gen.else()}fail$data(e){if(!this.$data)return this.fail(e);const{schemaCode:t}=this;this.fail(l._`${t} !== undefined && (${(0,l.or)(this.invalid$data(),e)})`)}error(e,t,r){if(t)return this.setParams(t),this._error(e,r),void this.setParams({});this._error(e,r)}_error(e,t){(e?p.reportExtraError:p.reportError)(this,this.def.error,t)}$dataError(){(0,p.reportError)(this,this.def.$dataError||p.keyword$DataError)}reset(){if(void 0===this.errsCount)throw new Error('add "trackErrors" to keyword definition');(0,p.resetErrorsCount)(this.gen,this.errsCount)}ok(e){this.allErrors||this.gen.if(e)}setParams(e,t){t?Object.assign(this.params,e):this.params=e}block$data(e,t,r=l.nil){this.gen.block((()=>{this.check$data(e,r),t()}))}check$data(e=l.nil,t=l.nil){if(!this.$data)return;const{gen:r,schemaCode:o,schemaType:s,def:a}=this;r.if((0,l.or)(l._`${o} === undefined`,t)),e!==l.nil&&r.assign(e,!0),(s.length||a.validateSchema)&&(r.elseIf(this.invalid$data()),this.$dataError(),e!==l.nil&&r.assign(e,!1)),r.else()}invalid$data(){const{gen:e,schemaCode:t,schemaType:r,def:o,it:s}=this;return(0,l.or)(function(){if(r.length){if(!(t instanceof l.Name))throw new Error("ajv implementation error");const e=Array.isArray(r)?r:[r];return l._`${(0,n.checkDataTypes)(e,t,s.opts.strictNumbers,n.DataType.Wrong)}`}return l.nil}(),function(){if(o.validateSchema){const r=e.scopeValue("validate$data",{ref:o.validateSchema});return l._`!${r}(${t})`}return l.nil}())}subschema(e,t){const r=(0,d.getSubschema)(this.it,e);(0,d.extendSubschemaData)(r,this.it,e),(0,d.extendSubschemaMode)(r,e);const o={...this.it,...r,items:void 0,props:void 0};return v(o,t),o}mergeEvaluated(e,t){const{it:r,gen:o}=this;r.opts.unevaluated&&(!0!==r.props&&void 0!==e.props&&(r.props=f.mergeEvaluated.props(o,e.props,r.props,t)),!0!==r.items&&void 0!==e.items&&(r.items=f.mergeEvaluated.items(o,e.items,r.items,t)))}mergeValidEvaluated(e,t){const{it:r,gen:o}=this;if(r.opts.unevaluated&&(!0!==r.props||!0!==r.items))return o.if(t,(()=>this.mergeEvaluated(e,l.Name))),!0}}function O(e,t,r,o){const s=new N(e,r,t);"code"in r?r.code(s,o):s.$data&&r.validate?(0,c.funcKeywordCode)(s,r):"macro"in r?(0,c.macroKeywordCode)(s,r):(r.compile||r.validate)&&(0,c.funcKeywordCode)(s,r)}r.KeywordCxt=N;const R=/^\/(?:[^~]|~0|~1)*$/,I=/^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;function x(e,{dataLevel:t,dataNames:r,dataPathArr:o}){let s,a;if(""===e)return u.default.rootData;if("/"===e[0]){if(!R.test(e))throw new Error(`Invalid JSON-pointer: ${e}`);s=e,a=u.default.rootData}else{const n=I.exec(e);if(!n)throw new Error(`Invalid JSON-pointer: ${e}`);const i=+n[1];if(s=n[2],"#"===s){if(i>=t)throw new Error(c("property/index",i));return o[t-i]}if(i>t)throw new Error(c("data",i));if(a=r[t-i],!s)return a}let n=a;const i=s.split("/");for(const e of i)e&&(a=l._`${a}${(0,l.getProperty)((0,f.unescapeJsonPointer)(e))}`,n=l._`${n} && ${a}`);return n;function c(e,r){return`Cannot access ${e} ${r} levels up, current level is ${t}`}}r.getData=x},{"../codegen":2,"../errors":4,"../names":6,"../resolve":8,"../util":10,"./applicability":11,"./boolSchema":12,"./dataType":13,"./defaults":14,"./keyword":16,"./subschema":17}],16:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.validateKeywordUsage=r.validSchemaType=r.funcKeywordCode=r.macroKeywordCode=void 0;const o=e("../codegen"),s=e("../names"),a=e("../../vocabularies/code"),n=e("../errors");function i(e){const{gen:t,data:r,it:s}=e;t.if(s.parentData,(()=>t.assign(r,o._`${s.parentData}[${s.parentDataProperty}]`)))}function c(e,t,r){if(void 0===r)throw new Error(`keyword "${t}" failed to compile`);return e.scopeValue("keyword","function"==typeof r?{ref:r}:{ref:r,code:(0,o.stringify)(r)})}r.macroKeywordCode=function(e,t){const{gen:r,keyword:s,schema:a,parentSchema:n,it:i}=e,d=t.macro.call(i.self,a,n,i),l=c(r,s,d);!1!==i.opts.validateSchema&&i.self.validateSchema(d,!0);const u=r.name("valid");e.subschema({schema:d,schemaPath:o.nil,errSchemaPath:`${i.errSchemaPath}/${s}`,topSchemaRef:l,compositeRule:!0},u),e.pass(u,(()=>e.error(!0)))},r.funcKeywordCode=function(e,t){var r;const{gen:d,keyword:l,schema:u,parentSchema:m,$data:f,it:p}=e;!function({schemaEnv:e},t){if(t.async&&!e.$async)throw new Error("async keyword in sync schema")}(p,t);const h=!f&&t.compile?t.compile.call(p.self,u,m,p):t.validate,y=c(d,l,h),v=d.let("valid");function g(r=(t.async?o._`await `:o.nil)){d.assign(v,o._`${r}${(0,a.callValidateCode)(e,y,p.opts.passContext?s.default.this:s.default.self,!("compile"in t&&!f||!1===t.schema))}`,t.modifying)}function $(e){var r;d.if((0,o.not)(null!==(r=t.valid)&&void 0!==r?r:v),e)}e.block$data(v,(function(){if(!1===t.errors)g(),t.modifying&&i(e),$((()=>e.error()));else{const r=t.async?function(){const e=d.let("ruleErrs",null);return d.try((()=>g(o._`await `)),(t=>d.assign(v,!1).if(o._`${t} instanceof ${p.ValidationError}`,(()=>d.assign(e,o._`${t}.errors`)),(()=>d.throw(t))))),e}():function(){const e=o._`${y}.errors`;return d.assign(e,null),g(o.nil),e}();t.modifying&&i(e),$((()=>function(e,t){const{gen:r}=e;r.if(o._`Array.isArray(${t})`,(()=>{r.assign(s.default.vErrors,o._`${s.default.vErrors} === null ? ${t} : ${s.default.vErrors}.concat(${t})`).assign(s.default.errors,o._`${s.default.vErrors}.length`),(0,n.extendErrors)(e)}),(()=>e.error()))}(e,r)))}})),e.ok(null!==(r=t.valid)&&void 0!==r?r:v)},r.validSchemaType=function(e,t,r=!1){return!t.length||t.some((t=>"array"===t?Array.isArray(e):"object"===t?e&&"object"==typeof e&&!Array.isArray(e):typeof e==t||r&&void 0===e))},r.validateKeywordUsage=function({schema:e,opts:t,self:r,errSchemaPath:o},s,a){if(Array.isArray(s.keyword)?!s.keyword.includes(a):s.keyword!==a)throw new Error("ajv implementation error");const n=s.dependencies;if(null==n?void 0:n.some((t=>!Object.prototype.hasOwnProperty.call(e,t))))throw new Error(`parent schema must have dependencies of ${a}: ${n.join(",")}`);if(s.validateSchema){if(!s.validateSchema(e[a])){const e=`keyword "${a}" value is invalid at path "${o}": `+r.errorsText(s.validateSchema.errors);if("log"!==t.validateSchema)throw new Error(e);r.logger.error(e)}}}},{"../../vocabularies/code":51,"../codegen":2,"../errors":4,"../names":6}],17:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.extendSubschemaMode=r.extendSubschemaData=r.getSubschema=void 0;const o=e("../codegen"),s=e("../util");r.getSubschema=function(e,{keyword:t,schemaProp:r,schema:a,schemaPath:n,errSchemaPath:i,topSchemaRef:c}){if(void 0!==t&&void 0!==a)throw new Error('both "keyword" and "schema" passed, only one allowed');if(void 0!==t){const a=e.schema[t];return void 0===r?{schema:a,schemaPath:o._`${e.schemaPath}${(0,o.getProperty)(t)}`,errSchemaPath:`${e.errSchemaPath}/${t}`}:{schema:a[r],schemaPath:o._`${e.schemaPath}${(0,o.getProperty)(t)}${(0,o.getProperty)(r)}`,errSchemaPath:`${e.errSchemaPath}/${t}/${(0,s.escapeFragment)(r)}`}}if(void 0!==a){if(void 0===n||void 0===i||void 0===c)throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');return{schema:a,schemaPath:n,topSchemaRef:c,errSchemaPath:i}}throw new Error('either "keyword" or "schema" must be passed')},r.extendSubschemaData=function(e,t,{dataProp:r,dataPropType:a,data:n,dataTypes:i,propertyName:c}){if(void 0!==n&&void 0!==r)throw new Error('both "data" and "dataProp" passed, only one allowed');const{gen:d}=t;if(void 0!==r){const{errorPath:n,dataPathArr:i,opts:c}=t;l(d.let("data",o._`${t.data}${(0,o.getProperty)(r)}`,!0)),e.errorPath=o.str`${n}${(0,s.getErrorPath)(r,a,c.jsPropertySyntax)}`,e.parentDataProperty=o._`${r}`,e.dataPathArr=[...i,e.parentDataProperty]}if(void 0!==n){l(n instanceof o.Name?n:d.let("data",n,!0)),void 0!==c&&(e.propertyName=c)}function l(r){e.data=r,e.dataLevel=t.dataLevel+1,e.dataTypes=[],t.definedProperties=new Set,e.parentData=t.data,e.dataNames=[...t.dataNames,r]}i&&(e.dataTypes=i)},r.extendSubschemaMode=function(e,{jtdDiscriminator:t,jtdMetadata:r,compositeRule:o,createErrors:s,allErrors:a}){void 0!==o&&(e.compositeRule=o),void 0!==s&&(e.createErrors=s),void 0!==a&&(e.allErrors=a),e.jtdDiscriminator=t,e.jtdMetadata=r}},{"../codegen":2,"../util":10}],18:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.CodeGen=r.Name=r.nil=r.stringify=r.str=r._=r.KeywordCxt=void 0;var o=e("./compile/validate");Object.defineProperty(r,"KeywordCxt",{enumerable:!0,get(){return o.KeywordCxt}});var s=e("./compile/codegen");Object.defineProperty(r,"_",{enumerable:!0,get(){return s._}}),Object.defineProperty(r,"str",{enumerable:!0,get(){return s.str}}),Object.defineProperty(r,"stringify",{enumerable:!0,get(){return s.stringify}}),Object.defineProperty(r,"nil",{enumerable:!0,get(){return s.nil}}),Object.defineProperty(r,"Name",{enumerable:!0,get(){return s.Name}}),Object.defineProperty(r,"CodeGen",{enumerable:!0,get(){return s.CodeGen}});const a=e("./runtime/validation_error"),n=e("./compile/ref_error"),i=e("./compile/rules"),c=e("./compile"),d=e("./compile/codegen"),l=e("./compile/resolve"),u=e("./compile/validate/dataType"),m=e("./compile/util"),f=e("./refs/data.json"),p=e("./runtime/uri"),h=(e,t)=>new RegExp(e,t);h.code="new RegExp";const y=["removeAdditional","useDefaults","coerceTypes"],v=new Set(["validate","serialize","parse","wrapper","root","schema","keyword","pattern","formats","validate$data","func","obj","Error"]),g={errorDataPath:"",format:"`validateFormats: false` can be used instead.",nullable:'"nullable" keyword is supported by default.',jsonPointers:"Deprecated jsPropertySyntax can be used instead.",extendRefs:"Deprecated ignoreKeywordsWithRef can be used instead.",missingRefs:"Pass empty schema with $id that should be ignored to ajv.addSchema.",processCode:"Use option `code: {process: (code, schemaEnv: object) => string}`",sourceCode:"Use option `code: {source: true}`",strictDefaults:"It is default now, see option `strict`.",strictKeywords:"It is default now, see option `strict`.",uniqueItems:'"uniqueItems" keyword is always validated.',unknownFormats:"Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",cache:"Map is used as cache, schema object as key.",serialize:"Map is used as cache, schema object as key.",ajvErrors:"It is default now."},$={ignoreKeywordsWithRef:"",jsPropertySyntax:"",unicode:'"minLength"/"maxLength" account for unicode characters by default.'};function _(e){var t,r,o,s,a,n,i,c,d,l,u,m,f,y,v,g,$,_,b,w,P,E,S,j,k;const N=e.strict,O=null===(t=e.code)||void 0===t?void 0:t.optimize,R=!0===O||void 0===O?1:O||0,I=null!==(o=null===(r=e.code)||void 0===r?void 0:r.regExp)&&void 0!==o?o:h,x=null!==(s=e.uriResolver)&&void 0!==s?s:p.default;return{strictSchema:null===(n=null!==(a=e.strictSchema)&&void 0!==a?a:N)||void 0===n||n,strictNumbers:null===(c=null!==(i=e.strictNumbers)&&void 0!==i?i:N)||void 0===c||c,strictTypes:null!==(l=null!==(d=e.strictTypes)&&void 0!==d?d:N)&&void 0!==l?l:"log",strictTuples:null!==(m=null!==(u=e.strictTuples)&&void 0!==u?u:N)&&void 0!==m?m:"log",strictRequired:null!==(y=null!==(f=e.strictRequired)&&void 0!==f?f:N)&&void 0!==y&&y,code:e.code?{...e.code,optimize:R,regExp:I}:{optimize:R,regExp:I},loopRequired:null!==(v=e.loopRequired)&&void 0!==v?v:200,loopEnum:null!==(g=e.loopEnum)&&void 0!==g?g:200,meta:null===($=e.meta)||void 0===$||$,messages:null===(_=e.messages)||void 0===_||_,inlineRefs:null===(b=e.inlineRefs)||void 0===b||b,schemaId:null!==(w=e.schemaId)&&void 0!==w?w:"$id",addUsedSchema:null===(P=e.addUsedSchema)||void 0===P||P,validateSchema:null===(E=e.validateSchema)||void 0===E||E,validateFormats:null===(S=e.validateFormats)||void 0===S||S,unicodeRegExp:null===(j=e.unicodeRegExp)||void 0===j||j,int32range:null===(k=e.int32range)||void 0===k||k,uriResolver:x}}class b{constructor(e={}){this.schemas={},this.refs={},this.formats={},this._compilations=new Set,this._loading={},this._cache=new Map,e=this.opts={...e,..._(e)};const{es5:t,lines:r}=this.opts.code;this.scope=new d.ValueScope({scope:{},prefixes:v,es5:t,lines:r}),this.logger=function(e){if(!1===e)return N;if(void 0===e)return console;if(e.log&&e.warn&&e.error)return e;throw new Error("logger must implement log, warn and error methods")}(e.logger);const o=e.validateFormats;e.validateFormats=!1,this.RULES=(0,i.getRules)(),w.call(this,g,e,"NOT SUPPORTED"),w.call(this,$,e,"DEPRECATED","warn"),this._metaOpts=k.call(this),e.formats&&S.call(this),this._addVocabularies(),this._addDefaultMetaSchema(),e.keywords&&j.call(this,e.keywords),"object"==typeof e.meta&&this.addMetaSchema(e.meta),E.call(this),e.validateFormats=o}_addVocabularies(){this.addKeyword("$async")}_addDefaultMetaSchema(){const{$data:e,meta:t,schemaId:r}=this.opts;let o=f;"id"===r&&(o={...f},o.id=o.$id,delete o.$id),t&&e&&this.addMetaSchema(o,o[r],!1)}defaultMeta(){const{meta:e,schemaId:t}=this.opts;return this.opts.defaultMeta="object"==typeof e?e[t]||e:void 0}validate(e,t){let r;if("string"==typeof e){if(r=this.getSchema(e),!r)throw new Error(`no schema with key or ref "${e}"`)}else r=this.compile(e);const o=r(t);return"$async"in r||(this.errors=r.errors),o}compile(e,t){const r=this._addSchema(e,t);return r.validate||this._compileSchemaEnv(r)}compileAsync(e,t){if("function"!=typeof this.opts.loadSchema)throw new Error("options.loadSchema should be a function");const{loadSchema:r}=this.opts;return o.call(this,e,t);async function o(e,t){await s.call(this,e.$schema);const r=this._addSchema(e,t);return r.validate||a.call(this,r)}async function s(e){e&&!this.getSchema(e)&&await o.call(this,{$ref:e},!0)}async function a(e){try{return this._compileSchemaEnv(e)}catch(t){if(!(t instanceof n.default))throw t;return i.call(this,t),await c.call(this,t.missingSchema),a.call(this,e)}}function i({missingSchema:e,missingRef:t}){if(this.refs[e])throw new Error(`AnySchema ${e} is loaded but ${t} cannot be resolved`)}async function c(e){const r=await d.call(this,e);this.refs[e]||await s.call(this,r.$schema),this.refs[e]||this.addSchema(r,e,t)}async function d(e){const t=this._loading[e];if(t)return t;try{return await(this._loading[e]=r(e))}finally{delete this._loading[e]}}}addSchema(e,t,r,o=this.opts.validateSchema){if(Array.isArray(e)){for(const t of e)this.addSchema(t,void 0,r,o);return this}let s;if("object"==typeof e){const{schemaId:t}=this.opts;if(s=e[t],void 0!==s&&"string"!=typeof s)throw new Error(`schema ${t} must be string`)}return t=(0,l.normalizeId)(t||s),this._checkUnique(t),this.schemas[t]=this._addSchema(e,r,t,o,!0),this}addMetaSchema(e,t,r=this.opts.validateSchema){return this.addSchema(e,t,!0,r),this}validateSchema(e,t){if("boolean"==typeof e)return!0;let r;if(r=e.$schema,void 0!==r&&"string"!=typeof r)throw new Error("$schema must be a string");if(r=r||this.opts.defaultMeta||this.defaultMeta(),!r)return this.logger.warn("meta-schema not available"),this.errors=null,!0;const o=this.validate(r,e);if(!o&&t){const e="schema is invalid: "+this.errorsText();if("log"!==this.opts.validateSchema)throw new Error(e);this.logger.error(e)}return o}getSchema(e){let t;for(;"string"==typeof(t=P.call(this,e));)e=t;if(void 0===t){const{schemaId:r}=this.opts,o=new c.SchemaEnv({schema:{},schemaId:r});if(t=c.resolveSchema.call(this,o,e),!t)return;this.refs[e]=t}return t.validate||this._compileSchemaEnv(t)}removeSchema(e){if(e instanceof RegExp)return this._removeAllSchemas(this.schemas,e),this._removeAllSchemas(this.refs,e),this;switch(typeof e){case"undefined":return this._removeAllSchemas(this.schemas),this._removeAllSchemas(this.refs),this._cache.clear(),this;case"string":{const t=P.call(this,e);return"object"==typeof t&&this._cache.delete(t.schema),delete this.schemas[e],delete this.refs[e],this}case"object":{this._cache.delete(e);let t=e[this.opts.schemaId];return t&&(t=(0,l.normalizeId)(t),delete this.schemas[t],delete this.refs[t]),this}default:throw new Error("ajv.removeSchema: invalid parameter")}}addVocabulary(e){for(const t of e)this.addKeyword(t);return this}addKeyword(e,t){let r;if("string"==typeof e)r=e,"object"==typeof t&&(this.logger.warn("these parameters are deprecated, see docs for addKeyword"),t.keyword=r);else{if("object"!=typeof e||void 0!==t)throw new Error("invalid addKeywords parameters");if(r=(t=e).keyword,Array.isArray(r)&&!r.length)throw new Error("addKeywords: keyword must be string or non-empty array")}if(R.call(this,r,t),!t)return(0,m.eachItem)(r,(e=>I.call(this,e))),this;C.call(this,t);const o={...t,type:(0,u.getJSONTypes)(t.type),schemaType:(0,u.getJSONTypes)(t.schemaType)};return(0,m.eachItem)(r,0===o.type.length?e=>I.call(this,e,o):e=>o.type.forEach((t=>I.call(this,e,o,t)))),this}getKeyword(e){const t=this.RULES.all[e];return"object"==typeof t?t.definition:!!t}removeKeyword(e){const{RULES:t}=this;delete t.keywords[e],delete t.all[e];for(const r of t.rules){const t=r.rules.findIndex((t=>t.keyword===e));t>=0&&r.rules.splice(t,1)}return this}addFormat(e,t){return"string"==typeof t&&(t=new RegExp(t)),this.formats[e]=t,this}errorsText(e=this.errors,{separator:t=", ",dataVar:r="data"}={}){return e&&0!==e.length?e.map((e=>`${r}${e.instancePath} ${e.message}`)).reduce(((e,r)=>e+t+r)):"No errors"}$dataMetaSchema(e,t){const r=this.RULES.all;e=JSON.parse(JSON.stringify(e));for(const o of t){const t=o.split("/").slice(1);let s=e;for(const e of t)s=s[e];for(const e in r){const t=r[e];if("object"!=typeof t)continue;const{$data:o}=t.definition,a=s[e];o&&a&&(s[e]=A(a))}}return e}_removeAllSchemas(e,t){for(const r in e){const o=e[r];t&&!t.test(r)||("string"==typeof o?delete e[r]:o&&!o.meta&&(this._cache.delete(o.schema),delete e[r]))}}_addSchema(e,t,r,o=this.opts.validateSchema,s=this.opts.addUsedSchema){let a;const{schemaId:n}=this.opts;if("object"==typeof e)a=e[n];else{if(this.opts.jtd)throw new Error("schema must be object");if("boolean"!=typeof e)throw new Error("schema must be object or boolean")}let i=this._cache.get(e);if(void 0!==i)return i;r=(0,l.normalizeId)(a||r);const d=l.getSchemaRefs.call(this,e,r);return i=new c.SchemaEnv({schema:e,schemaId:n,meta:t,baseId:r,localRefs:d}),this._cache.set(i.schema,i),s&&!r.startsWith("#")&&(r&&this._checkUnique(r),this.refs[r]=i),o&&this.validateSchema(e,!0),i}_checkUnique(e){if(this.schemas[e]||this.refs[e])throw new Error(`schema with key or id "${e}" already exists`)}_compileSchemaEnv(e){if(e.meta?this._compileMetaSchema(e):c.compileSchema.call(this,e),!e.validate)throw new Error("ajv implementation error");return e.validate}_compileMetaSchema(e){const t=this.opts;this.opts=this._metaOpts;try{c.compileSchema.call(this,e)}finally{this.opts=t}}}function w(e,t,r,o="error"){for(const s in e){s in t&&this.logger[o](`${r}: option ${s}. ${e[s]}`)}}function P(e){return e=(0,l.normalizeId)(e),this.schemas[e]||this.refs[e]}function E(){const e=this.opts.schemas;if(e)if(Array.isArray(e))this.addSchema(e);else for(const t in e)this.addSchema(e[t],t)}function S(){for(const e in this.opts.formats){const t=this.opts.formats[e];t&&this.addFormat(e,t)}}function j(e){if(Array.isArray(e))this.addVocabulary(e);else{this.logger.warn("keywords option as map is deprecated, pass array");for(const t in e){const r=e[t];r.keyword||(r.keyword=t),this.addKeyword(r)}}}function k(){const e={...this.opts};for(const t of y)delete e[t];return e}b.ValidationError=a.default,b.MissingRefError=n.default,r.default=b;const N={log(){},warn(){},error(){}};const O=/^[a-z_$][a-z0-9_$:-]*$/i;function R(e,t){const{RULES:r}=this;if((0,m.eachItem)(e,(e=>{if(r.keywords[e])throw new Error(`Keyword ${e} is already defined`);if(!O.test(e))throw new Error(`Keyword ${e} has invalid name`)})),t&&t.$data&&!("code"in t)&&!("validate"in t))throw new Error('$data keyword must have "code" or "validate" function')}function I(e,t,r){var o;const s=null==t?void 0:t.post;if(r&&s)throw new Error('keyword with "post" flag cannot have "type"');const{RULES:a}=this;let n=s?a.post:a.rules.find((({type:e})=>e===r));if(n||(n={type:r,rules:[]},a.rules.push(n)),a.keywords[e]=!0,!t)return;const i={keyword:e,definition:{...t,type:(0,u.getJSONTypes)(t.type),schemaType:(0,u.getJSONTypes)(t.schemaType)}};t.before?x.call(this,n,i,t.before):n.rules.push(i),a.all[e]=i,null===(o=t.implements)||void 0===o||o.forEach((e=>this.addKeyword(e)))}function x(e,t,r){const o=e.rules.findIndex((e=>e.keyword===r));o>=0?e.rules.splice(o,0,t):(e.rules.push(t),this.logger.warn(`rule ${r} is not defined`))}function C(e){let{metaSchema:t}=e;void 0!==t&&(e.$data&&this.opts.$data&&(t=A(t)),e.validateSchema=this.compile(t,!0))}const T={$ref:"https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"};function A(e){return{anyOf:[e,T]}}},{"./compile":5,"./compile/codegen":2,"./compile/ref_error":7,"./compile/resolve":8,"./compile/rules":9,"./compile/util":10,"./compile/validate":15,"./compile/validate/dataType":13,"./refs/data.json":19,"./runtime/uri":31,"./runtime/validation_error":32}],19:[function(e,t,r){t.exports={$id:"https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#",description:"Meta-schema for $data reference (JSON AnySchema extension proposal)",type:"object",required:["$data"],properties:{$data:{type:"string",anyOf:[{format:"relative-json-pointer"},{format:"json-pointer"}]}},additionalProperties:!1}},{}],20:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("./schema.json"),s=e("./meta/applicator.json"),a=e("./meta/unevaluated.json"),n=e("./meta/content.json"),i=e("./meta/core.json"),c=e("./meta/format-annotation.json"),d=e("./meta/meta-data.json"),l=e("./meta/validation.json"),u=["/properties"];r.default=function(e){return[o,s,a,n,i,t(this,c),d,t(this,l)].forEach((e=>this.addMetaSchema(e,void 0,!1))),this;function t(t,r){return e?t.$dataMetaSchema(r,u):r}}},{"./meta/applicator.json":21,"./meta/content.json":22,"./meta/core.json":23,"./meta/format-annotation.json":24,"./meta/meta-data.json":25,"./meta/unevaluated.json":26,"./meta/validation.json":27,"./schema.json":28}],21:[function(e,t,r){t.exports={$schema:"https://json-schema.org/draft/2020-12/schema",$id:"https://json-schema.org/draft/2020-12/meta/applicator",$vocabulary:{"https://json-schema.org/draft/2020-12/vocab/applicator":!0},$dynamicAnchor:"meta",title:"Applicator vocabulary meta-schema",type:["object","boolean"],properties:{prefixItems:{$ref:"#/$defs/schemaArray"},items:{$dynamicRef:"#meta"},contains:{$dynamicRef:"#meta"},additionalProperties:{$dynamicRef:"#meta"},properties:{type:"object",additionalProperties:{$dynamicRef:"#meta"},default:{}},patternProperties:{type:"object",additionalProperties:{$dynamicRef:"#meta"},propertyNames:{format:"regex"},default:{}},dependentSchemas:{type:"object",additionalProperties:{$dynamicRef:"#meta"},default:{}},propertyNames:{$dynamicRef:"#meta"},if:{$dynamicRef:"#meta"},then:{$dynamicRef:"#meta"},else:{$dynamicRef:"#meta"},allOf:{$ref:"#/$defs/schemaArray"},anyOf:{$ref:"#/$defs/schemaArray"},oneOf:{$ref:"#/$defs/schemaArray"},not:{$dynamicRef:"#meta"}},$defs:{schemaArray:{type:"array",minItems:1,items:{$dynamicRef:"#meta"}}}}},{}],22:[function(e,t,r){t.exports={$schema:"https://json-schema.org/draft/2020-12/schema",$id:"https://json-schema.org/draft/2020-12/meta/content",$vocabulary:{"https://json-schema.org/draft/2020-12/vocab/content":!0},$dynamicAnchor:"meta",title:"Content vocabulary meta-schema",type:["object","boolean"],properties:{contentEncoding:{type:"string"},contentMediaType:{type:"string"},contentSchema:{$dynamicRef:"#meta"}}}},{}],23:[function(e,t,r){t.exports={$schema:"https://json-schema.org/draft/2020-12/schema",$id:"https://json-schema.org/draft/2020-12/meta/core",$vocabulary:{"https://json-schema.org/draft/2020-12/vocab/core":!0},$dynamicAnchor:"meta",title:"Core vocabulary meta-schema",type:["object","boolean"],properties:{$id:{$ref:"#/$defs/uriReferenceString",$comment:"Non-empty fragments not allowed.",pattern:"^[^#]*#?$"},$schema:{$ref:"#/$defs/uriString"},$ref:{$ref:"#/$defs/uriReferenceString"},$anchor:{$ref:"#/$defs/anchorString"},$dynamicRef:{$ref:"#/$defs/uriReferenceString"},$dynamicAnchor:{$ref:"#/$defs/anchorString"},$vocabulary:{type:"object",propertyNames:{$ref:"#/$defs/uriString"},additionalProperties:{type:"boolean"}},$comment:{type:"string"},$defs:{type:"object",additionalProperties:{$dynamicRef:"#meta"}}},$defs:{anchorString:{type:"string",pattern:"^[A-Za-z_][-A-Za-z0-9._]*$"},uriString:{type:"string",format:"uri"},uriReferenceString:{type:"string",format:"uri-reference"}}}},{}],24:[function(e,t,r){t.exports={$schema:"https://json-schema.org/draft/2020-12/schema",$id:"https://json-schema.org/draft/2020-12/meta/format-annotation",$vocabulary:{"https://json-schema.org/draft/2020-12/vocab/format-annotation":!0},$dynamicAnchor:"meta",title:"Format vocabulary meta-schema for annotation results",type:["object","boolean"],properties:{format:{type:"string"}}}},{}],25:[function(e,t,r){t.exports={$schema:"https://json-schema.org/draft/2020-12/schema",$id:"https://json-schema.org/draft/2020-12/meta/meta-data",$vocabulary:{"https://json-schema.org/draft/2020-12/vocab/meta-data":!0},$dynamicAnchor:"meta",title:"Meta-data vocabulary meta-schema",type:["object","boolean"],properties:{title:{type:"string"},description:{type:"string"},default:!0,deprecated:{type:"boolean",default:!1},readOnly:{type:"boolean",default:!1},writeOnly:{type:"boolean",default:!1},examples:{type:"array",items:!0}}}},{}],26:[function(e,t,r){t.exports={$schema:"https://json-schema.org/draft/2020-12/schema",$id:"https://json-schema.org/draft/2020-12/meta/unevaluated",$vocabulary:{"https://json-schema.org/draft/2020-12/vocab/unevaluated":!0},$dynamicAnchor:"meta",title:"Unevaluated applicator vocabulary meta-schema",type:["object","boolean"],properties:{unevaluatedItems:{$dynamicRef:"#meta"},unevaluatedProperties:{$dynamicRef:"#meta"}}}},{}],27:[function(e,t,r){t.exports={$schema:"https://json-schema.org/draft/2020-12/schema",$id:"https://json-schema.org/draft/2020-12/meta/validation",$vocabulary:{"https://json-schema.org/draft/2020-12/vocab/validation":!0},$dynamicAnchor:"meta",title:"Validation vocabulary meta-schema",type:["object","boolean"],properties:{type:{anyOf:[{$ref:"#/$defs/simpleTypes"},{type:"array",items:{$ref:"#/$defs/simpleTypes"},minItems:1,uniqueItems:!0}]},const:!0,enum:{type:"array",items:!0},multipleOf:{type:"number",exclusiveMinimum:0},maximum:{type:"number"},exclusiveMaximum:{type:"number"},minimum:{type:"number"},exclusiveMinimum:{type:"number"},maxLength:{$ref:"#/$defs/nonNegativeInteger"},minLength:{$ref:"#/$defs/nonNegativeIntegerDefault0"},pattern:{type:"string",format:"regex"},maxItems:{$ref:"#/$defs/nonNegativeInteger"},minItems:{$ref:"#/$defs/nonNegativeIntegerDefault0"},uniqueItems:{type:"boolean",default:!1},maxContains:{$ref:"#/$defs/nonNegativeInteger"},minContains:{$ref:"#/$defs/nonNegativeInteger",default:1},maxProperties:{$ref:"#/$defs/nonNegativeInteger"},minProperties:{$ref:"#/$defs/nonNegativeIntegerDefault0"},required:{$ref:"#/$defs/stringArray"},dependentRequired:{type:"object",additionalProperties:{$ref:"#/$defs/stringArray"}}},$defs:{nonNegativeInteger:{type:"integer",minimum:0},nonNegativeIntegerDefault0:{$ref:"#/$defs/nonNegativeInteger",default:0},simpleTypes:{enum:["array","boolean","integer","null","number","object","string"]},stringArray:{type:"array",items:{type:"string"},uniqueItems:!0,default:[]}}}},{}],28:[function(e,t,r){t.exports={$schema:"https://json-schema.org/draft/2020-12/schema",$id:"https://json-schema.org/draft/2020-12/schema",$vocabulary:{"https://json-schema.org/draft/2020-12/vocab/core":!0,"https://json-schema.org/draft/2020-12/vocab/applicator":!0,"https://json-schema.org/draft/2020-12/vocab/unevaluated":!0,"https://json-schema.org/draft/2020-12/vocab/validation":!0,"https://json-schema.org/draft/2020-12/vocab/meta-data":!0,"https://json-schema.org/draft/2020-12/vocab/format-annotation":!0,"https://json-schema.org/draft/2020-12/vocab/content":!0},$dynamicAnchor:"meta",title:"Core and Validation specifications meta-schema",allOf:[{$ref:"meta/core"},{$ref:"meta/applicator"},{$ref:"meta/unevaluated"},{$ref:"meta/validation"},{$ref:"meta/meta-data"},{$ref:"meta/format-annotation"},{$ref:"meta/content"}],type:["object","boolean"],$comment:"This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.",properties:{definitions:{$comment:'"definitions" has been replaced by "$defs".',type:"object",additionalProperties:{$dynamicRef:"#meta"},deprecated:!0,default:{}},dependencies:{$comment:'"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.',type:"object",additionalProperties:{anyOf:[{$dynamicRef:"#meta"},{$ref:"meta/validation#/$defs/stringArray"}]},deprecated:!0,default:{}},$recursiveAnchor:{$comment:'"$recursiveAnchor" has been replaced by "$dynamicAnchor".',$ref:"meta/core#/$defs/anchorString",deprecated:!0},$recursiveRef:{$comment:'"$recursiveRef" has been replaced by "$dynamicRef".',$ref:"meta/core#/$defs/uriReferenceString",deprecated:!0}}}},{}],29:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("fast-deep-equal");o.code='require("ajv/dist/runtime/equal").default',r.default=o},{"fast-deep-equal":83}],30:[function(e,t,r){"use strict";function o(e){const t=e.length;let r,o=0,s=0;for(;s<t;)o++,r=e.charCodeAt(s++),r>=55296&&r<=56319&&s<t&&(r=e.charCodeAt(s),56320==(64512&r)&&s++);return o}Object.defineProperty(r,"__esModule",{value:!0}),r.default=o,o.code='require("ajv/dist/runtime/ucs2length").default'},{}],31:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("fast-uri");o.code='require("ajv/dist/runtime/uri").default',r.default=o},{"fast-uri":84}],32:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});class o extends Error{constructor(e){super("validation failed"),this.errors=e,this.ajv=this.validation=!0}}r.default=o},{}],33:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.validateAdditionalItems=void 0;const o=e("../../compile/codegen"),s=e("../../compile/util"),a={keyword:"additionalItems",type:"array",schemaType:["boolean","object"],before:"uniqueItems",error:{message({params:{len:e}}){return o.str`must NOT have more than ${e} items`},params({params:{len:e}}){return o._`{limit: ${e}}`}},code(e){const{parentSchema:t,it:r}=e,{items:o}=t;Array.isArray(o)?n(e,o):(0,s.checkStrictMode)(r,'"additionalItems" is ignored when "items" is not an array of schemas')}};function n(e,t){const{gen:r,schema:a,data:n,keyword:i,it:c}=e;c.items=!0;const d=r.const("len",o._`${n}.length`);if(!1===a)e.setParams({len:t.length}),e.pass(o._`${d} <= ${t.length}`);else if("object"==typeof a&&!(0,s.alwaysValidSchema)(c,a)){const a=r.var("valid",o._`${d} <= ${t.length}`);r.if((0,o.not)(a),(()=>function(a){r.forRange("i",t.length,d,(t=>{e.subschema({keyword:i,dataProp:t,dataPropType:s.Type.Num},a),c.allErrors||r.if((0,o.not)(a),(()=>r.break()))}))}(a))),e.ok(a)}}r.validateAdditionalItems=n,r.default=a},{"../../compile/codegen":2,"../../compile/util":10}],34:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../code"),s=e("../../compile/codegen"),a=e("../../compile/names"),n=e("../../compile/util");r.default={keyword:"additionalProperties",type:["object"],schemaType:["boolean","object"],allowUndefined:!0,trackErrors:!0,error:{message:"must NOT have additional properties",params({params:e}){return s._`{additionalProperty: ${e.additionalProperty}}`}},code(e){const{gen:t,schema:r,parentSchema:i,data:c,errsCount:d,it:l}=e;if(!d)throw new Error("ajv implementation error");const{allErrors:u,opts:m}=l;if(l.props=!0,"all"!==m.removeAdditional&&(0,n.alwaysValidSchema)(l,r))return;const f=(0,o.allSchemaProperties)(i.properties),p=(0,o.allSchemaProperties)(i.patternProperties);function h(e){t.code(s._`delete ${c}[${e}]`)}function y(o){if("all"===m.removeAdditional||m.removeAdditional&&!1===r)h(o);else{if(!1===r)return e.setParams({additionalProperty:o}),e.error(),void(u||t.break());if("object"==typeof r&&!(0,n.alwaysValidSchema)(l,r)){const r=t.name("valid");"failing"===m.removeAdditional?(v(o,r,!1),t.if((0,s.not)(r),(()=>{e.reset(),h(o)}))):(v(o,r),u||t.if((0,s.not)(r),(()=>t.break())))}}}function v(t,r,o){const s={keyword:"additionalProperties",dataProp:t,dataPropType:n.Type.Str};!1===o&&Object.assign(s,{compositeRule:!0,createErrors:!1,allErrors:!1}),e.subschema(s,r)}t.forIn("key",c,(r=>{f.length||p.length?t.if(function(r){let a;if(f.length>8){const e=(0,n.schemaRefOrVal)(l,i.properties,"properties");a=(0,o.isOwnProperty)(t,e,r)}else a=f.length?(0,s.or)(...f.map((e=>s._`${r} === ${e}`))):s.nil;return p.length&&(a=(0,s.or)(a,...p.map((t=>s._`${(0,o.usePattern)(e,t)}.test(${r})`)))),(0,s.not)(a)}(r),(()=>y(r))):y(r)})),e.ok(s._`${d} === ${a.default.errors}`)}}},{"../../compile/codegen":2,"../../compile/names":6,"../../compile/util":10,"../code":51}],35:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/util");r.default={keyword:"allOf",schemaType:"array",code(e){const{gen:t,schema:r,it:s}=e;if(!Array.isArray(r))throw new Error("ajv implementation error");const a=t.name("valid");r.forEach(((t,r)=>{if((0,o.alwaysValidSchema)(s,t))return;const n=e.subschema({keyword:"allOf",schemaProp:r},a);e.ok(a),e.mergeEvaluated(n)}))}}},{"../../compile/util":10}],36:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../code");r.default={keyword:"anyOf",schemaType:"array",trackErrors:!0,code:o.validateUnion,error:{message:"must match a schema in anyOf"}}},{"../code":51}],37:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/codegen"),s=e("../../compile/util");r.default={keyword:"contains",type:"array",schemaType:["object","boolean"],before:"uniqueItems",trackErrors:!0,error:{message({params:{min:e,max:t}}){return void 0===t?o.str`must contain at least ${e} valid item(s)`:o.str`must contain at least ${e} and no more than ${t} valid item(s)`},params({params:{min:e,max:t}}){return void 0===t?o._`{minContains: ${e}}`:o._`{minContains: ${e}, maxContains: ${t}}`}},code(e){const{gen:t,schema:r,parentSchema:a,data:n,it:i}=e;let c,d;const{minContains:l,maxContains:u}=a;i.opts.next?(c=void 0===l?1:l,d=u):c=1;const m=t.const("len",o._`${n}.length`);if(e.setParams({min:c,max:d}),void 0===d&&0===c)return void(0,s.checkStrictMode)(i,'"minContains" == 0 without "maxContains": "contains" keyword ignored');if(void 0!==d&&c>d)return(0,s.checkStrictMode)(i,'"minContains" > "maxContains" is always invalid'),void e.fail();if((0,s.alwaysValidSchema)(i,r)){let t=o._`${m} >= ${c}`;return void 0!==d&&(t=o._`${t} && ${m} <= ${d}`),void e.pass(t)}i.items=!0;const f=t.name("valid");function p(){const e=t.name("_valid"),r=t.let("count",0);h(e,(()=>t.if(e,(()=>function(e){t.code(o._`${e}++`),void 0===d?t.if(o._`${e} >= ${c}`,(()=>t.assign(f,!0).break())):(t.if(o._`${e} > ${d}`,(()=>t.assign(f,!1).break())),1===c?t.assign(f,!0):t.if(o._`${e} >= ${c}`,(()=>t.assign(f,!0))))}(r)))))}function h(r,o){t.forRange("i",0,m,(t=>{e.subschema({keyword:"contains",dataProp:t,dataPropType:s.Type.Num,compositeRule:!0},r),o()}))}void 0===d&&1===c?h(f,(()=>t.if(f,(()=>t.break())))):0===c?(t.let(f,!0),void 0!==d&&t.if(o._`${n}.length > 0`,p)):(t.let(f,!1),p()),e.result(f,(()=>e.reset()))}}},{"../../compile/codegen":2,"../../compile/util":10}],38:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.validateSchemaDeps=r.validatePropertyDeps=r.error=void 0;const o=e("../../compile/codegen"),s=e("../../compile/util"),a=e("../code");r.error={message({params:{property:e,depsCount:t,deps:r}}){return o.str`must have ${1===t?"property":"properties"} ${r} when property ${e} is present`},params({params:{property:e,depsCount:t,deps:r,missingProperty:s}}){return o._`{property: ${e},
    missingProperty: ${s},
    depsCount: ${t},
    deps: ${r}}`}};const n={keyword:"dependencies",type:"object",schemaType:"object",error:r.error,code(e){const[t,r]=function({schema:e}){const t={},r={};for(const o in e){if("__proto__"===o)continue;(Array.isArray(e[o])?t:r)[o]=e[o]}return[t,r]}(e);i(e,t),c(e,r)}};function i(e,t=e.schema){const{gen:r,data:s,it:n}=e;if(0===Object.keys(t).length)return;const i=r.let("missing");for(const c in t){const d=t[c];if(0===d.length)continue;const l=(0,a.propertyInData)(r,s,c,n.opts.ownProperties);e.setParams({property:c,depsCount:d.length,deps:d.join(", ")}),n.allErrors?r.if(l,(()=>{for(const t of d)(0,a.checkReportMissingProp)(e,t)})):(r.if(o._`${l} && (${(0,a.checkMissingProp)(e,d,i)})`),(0,a.reportMissingProp)(e,i),r.else())}}function c(e,t=e.schema){const{gen:r,data:o,keyword:n,it:i}=e,c=r.name("valid");for(const d in t)(0,s.alwaysValidSchema)(i,t[d])||(r.if((0,a.propertyInData)(r,o,d,i.opts.ownProperties),(()=>{const t=e.subschema({keyword:n,schemaProp:d},c);e.mergeValidEvaluated(t,c)}),(()=>r.var(c,!0))),e.ok(c))}r.validatePropertyDeps=i,r.validateSchemaDeps=c,r.default=n},{"../../compile/codegen":2,"../../compile/util":10,"../code":51}],39:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("./dependencies");r.default={keyword:"dependentSchemas",type:"object",schemaType:"object",code(e){return(0,o.validateSchemaDeps)(e)}}},{"./dependencies":38}],40:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/codegen"),s=e("../../compile/util");function a(e,t){const r=e.schema[t];return void 0!==r&&!(0,s.alwaysValidSchema)(e,r)}r.default={keyword:"if",schemaType:["object","boolean"],trackErrors:!0,error:{message({params:e}){return o.str`must match "${e.ifClause}" schema`},params({params:e}){return o._`{failingKeyword: ${e.ifClause}}`}},code(e){const{gen:t,parentSchema:r,it:n}=e;void 0===r.then&&void 0===r.else&&(0,s.checkStrictMode)(n,'"if" without "then" and "else" is ignored');const i=a(n,"then"),c=a(n,"else");if(!i&&!c)return;const d=t.let("valid",!0),l=t.name("_valid");if(function(){const t=e.subschema({keyword:"if",compositeRule:!0,createErrors:!1,allErrors:!1},l);e.mergeEvaluated(t)}(),e.reset(),i&&c){const r=t.let("ifClause");e.setParams({ifClause:r}),t.if(l,u("then",r),u("else",r))}else i?t.if(l,u("then")):t.if((0,o.not)(l),u("else"));function u(r,s){return()=>{const a=e.subschema({keyword:r},l);t.assign(d,l),e.mergeValidEvaluated(a,d),s?t.assign(s,o._`${r}`):e.setParams({ifClause:r})}}e.pass(d,(()=>e.error(!0)))}}},{"../../compile/codegen":2,"../../compile/util":10}],41:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("./additionalItems"),s=e("./prefixItems"),a=e("./items"),n=e("./items2020"),i=e("./contains"),c=e("./dependencies"),d=e("./propertyNames"),l=e("./additionalProperties"),u=e("./properties"),m=e("./patternProperties"),f=e("./not"),p=e("./anyOf"),h=e("./oneOf"),y=e("./allOf"),v=e("./if"),g=e("./thenElse");r.default=function(e=!1){const t=[f.default,p.default,h.default,y.default,v.default,g.default,d.default,l.default,c.default,u.default,m.default];return e?t.push(s.default,n.default):t.push(o.default,a.default),t.push(i.default),t}},{"./additionalItems":33,"./additionalProperties":34,"./allOf":35,"./anyOf":36,"./contains":37,"./dependencies":38,"./if":40,"./items":42,"./items2020":43,"./not":44,"./oneOf":45,"./patternProperties":46,"./prefixItems":47,"./properties":48,"./propertyNames":49,"./thenElse":50}],42:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.validateTuple=void 0;const o=e("../../compile/codegen"),s=e("../../compile/util"),a=e("../code"),n={keyword:"items",type:"array",schemaType:["object","array","boolean"],before:"uniqueItems",code(e){const{schema:t,it:r}=e;if(Array.isArray(t))return i(e,"additionalItems",t);r.items=!0,(0,s.alwaysValidSchema)(r,t)||e.ok((0,a.validateArray)(e))}};function i(e,t,r=e.schema){const{gen:a,parentSchema:n,data:i,keyword:c,it:d}=e;!function(e){const{opts:o,errSchemaPath:a}=d,n=r.length,i=n===e.minItems&&(n===e.maxItems||!1===e[t]);if(o.strictTuples&&!i){(0,s.checkStrictMode)(d,`"${c}" is ${n}-tuple, but minItems or maxItems/${t} are not specified or different at path "${a}"`,o.strictTuples)}}(n),d.opts.unevaluated&&r.length&&!0!==d.items&&(d.items=s.mergeEvaluated.items(a,r.length,d.items));const l=a.name("valid"),u=a.const("len",o._`${i}.length`);r.forEach(((t,r)=>{(0,s.alwaysValidSchema)(d,t)||(a.if(o._`${u} > ${r}`,(()=>e.subschema({keyword:c,schemaProp:r,dataProp:r},l))),e.ok(l))}))}r.validateTuple=i,r.default=n},{"../../compile/codegen":2,"../../compile/util":10,"../code":51}],43:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/codegen"),s=e("../../compile/util"),a=e("../code"),n=e("./additionalItems");r.default={keyword:"items",type:"array",schemaType:["object","boolean"],before:"uniqueItems",error:{message({params:{len:e}}){return o.str`must NOT have more than ${e} items`},params({params:{len:e}}){return o._`{limit: ${e}}`}},code(e){const{schema:t,parentSchema:r,it:o}=e,{prefixItems:i}=r;o.items=!0,(0,s.alwaysValidSchema)(o,t)||(i?(0,n.validateAdditionalItems)(e,i):e.ok((0,a.validateArray)(e)))}}},{"../../compile/codegen":2,"../../compile/util":10,"../code":51,"./additionalItems":33}],44:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/util");r.default={keyword:"not",schemaType:["object","boolean"],trackErrors:!0,code(e){const{gen:t,schema:r,it:s}=e;if((0,o.alwaysValidSchema)(s,r))return void e.fail();const a=t.name("valid");e.subschema({keyword:"not",compositeRule:!0,createErrors:!1,allErrors:!1},a),e.failResult(a,(()=>e.reset()),(()=>e.error()))},error:{message:"must NOT be valid"}}},{"../../compile/util":10}],45:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/codegen"),s=e("../../compile/util");r.default={keyword:"oneOf",schemaType:"array",trackErrors:!0,error:{message:"must match exactly one schema in oneOf",params({params:e}){return o._`{passingSchemas: ${e.passing}}`}},code(e){const{gen:t,schema:r,parentSchema:a,it:n}=e;if(!Array.isArray(r))throw new Error("ajv implementation error");if(n.opts.discriminator&&a.discriminator)return;const i=r,c=t.let("valid",!1),d=t.let("passing",null),l=t.name("_valid");e.setParams({passing:d}),t.block((function(){i.forEach(((r,a)=>{let i;(0,s.alwaysValidSchema)(n,r)?t.var(l,!0):i=e.subschema({keyword:"oneOf",schemaProp:a,compositeRule:!0},l),a>0&&t.if(o._`${l} && ${c}`).assign(c,!1).assign(d,o._`[${d}, ${a}]`).else(),t.if(l,(()=>{t.assign(c,!0),t.assign(d,a),i&&e.mergeEvaluated(i,o.Name)}))}))})),e.result(c,(()=>e.reset()),(()=>e.error(!0)))}}},{"../../compile/codegen":2,"../../compile/util":10}],46:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../code"),s=e("../../compile/codegen"),a=e("../../compile/util"),n=e("../../compile/util");r.default={keyword:"patternProperties",type:"object",schemaType:"object",code(e){const{gen:t,schema:r,data:i,parentSchema:c,it:d}=e,{opts:l}=d,u=(0,o.allSchemaProperties)(r),m=u.filter((e=>(0,a.alwaysValidSchema)(d,r[e])));if(0===u.length||m.length===u.length&&(!d.opts.unevaluated||!0===d.props))return;const f=l.strictSchema&&!l.allowMatchingProperties&&c.properties,p=t.name("valid");!0===d.props||d.props instanceof s.Name||(d.props=(0,n.evaluatedPropsToName)(t,d.props));const{props:h}=d;function y(e){for(const t in f)new RegExp(e).test(t)&&(0,a.checkStrictMode)(d,`property ${t} matches pattern ${e} (use allowMatchingProperties)`)}function v(r){t.forIn("key",i,(a=>{t.if(s._`${(0,o.usePattern)(e,r)}.test(${a})`,(()=>{const o=m.includes(r);o||e.subschema({keyword:"patternProperties",schemaProp:r,dataProp:a,dataPropType:n.Type.Str},p),d.opts.unevaluated&&!0!==h?t.assign(s._`${h}[${a}]`,!0):o||d.allErrors||t.if((0,s.not)(p),(()=>t.break()))}))}))}!function(){for(const e of u)f&&y(e),d.allErrors?v(e):(t.var(p,!0),v(e),t.if(p))}()}}},{"../../compile/codegen":2,"../../compile/util":10,"../code":51}],47:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("./items");r.default={keyword:"prefixItems",type:"array",schemaType:["array"],before:"uniqueItems",code(e){return(0,o.validateTuple)(e,"items")}}},{"./items":42}],48:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/validate"),s=e("../code"),a=e("../../compile/util"),n=e("./additionalProperties");r.default={keyword:"properties",type:"object",schemaType:"object",code(e){const{gen:t,schema:r,parentSchema:i,data:c,it:d}=e;"all"===d.opts.removeAdditional&&void 0===i.additionalProperties&&n.default.code(new o.KeywordCxt(d,n.default,"additionalProperties"));const l=(0,s.allSchemaProperties)(r);for(const e of l)d.definedProperties.add(e);d.opts.unevaluated&&l.length&&!0!==d.props&&(d.props=a.mergeEvaluated.props(t,(0,a.toHash)(l),d.props));const u=l.filter((e=>!(0,a.alwaysValidSchema)(d,r[e])));if(0===u.length)return;const m=t.name("valid");for(const r of u)f(r)?p(r):(t.if((0,s.propertyInData)(t,c,r,d.opts.ownProperties)),p(r),d.allErrors||t.else().var(m,!0),t.endIf()),e.it.definedProperties.add(r),e.ok(m);function f(e){return d.opts.useDefaults&&!d.compositeRule&&void 0!==r[e].default}function p(t){e.subschema({keyword:"properties",schemaProp:t,dataProp:t},m)}}}},{"../../compile/util":10,"../../compile/validate":15,"../code":51,"./additionalProperties":34}],49:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/codegen"),s=e("../../compile/util");r.default={keyword:"propertyNames",type:"object",schemaType:["object","boolean"],error:{message:"property name must be valid",params({params:e}){return o._`{propertyName: ${e.propertyName}}`}},code(e){const{gen:t,schema:r,data:a,it:n}=e;if((0,s.alwaysValidSchema)(n,r))return;const i=t.name("valid");t.forIn("key",a,(r=>{e.setParams({propertyName:r}),e.subschema({keyword:"propertyNames",data:r,dataTypes:["string"],propertyName:r,compositeRule:!0},i),t.if((0,o.not)(i),(()=>{e.error(!0),n.allErrors||t.break()}))})),e.ok(i)}}},{"../../compile/codegen":2,"../../compile/util":10}],50:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/util");r.default={keyword:["then","else"],schemaType:["object","boolean"],code({keyword:e,parentSchema:t,it:r}){void 0===t.if&&(0,o.checkStrictMode)(r,`"${e}" without "if" is ignored`)}}},{"../../compile/util":10}],51:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.validateUnion=r.validateArray=r.usePattern=r.callValidateCode=r.schemaProperties=r.allSchemaProperties=r.noPropertyInData=r.propertyInData=r.isOwnProperty=r.hasPropFunc=r.reportMissingProp=r.checkMissingProp=r.checkReportMissingProp=void 0;const o=e("../compile/codegen"),s=e("../compile/util"),a=e("../compile/names"),n=e("../compile/util");function i(e){return e.scopeValue("func",{ref:Object.prototype.hasOwnProperty,code:o._`Object.prototype.hasOwnProperty`})}function c(e,t,r){return o._`${i(e)}.call(${t}, ${r})`}function d(e,t,r,s){const a=o._`${t}${(0,o.getProperty)(r)} === undefined`;return s?(0,o.or)(a,(0,o.not)(c(e,t,r))):a}function l(e){return e?Object.keys(e).filter((e=>"__proto__"!==e)):[]}r.checkReportMissingProp=function(e,t){const{gen:r,data:s,it:a}=e;r.if(d(r,s,t,a.opts.ownProperties),(()=>{e.setParams({missingProperty:o._`${t}`},!0),e.error()}))},r.checkMissingProp=function({gen:e,data:t,it:{opts:r}},s,a){return(0,o.or)(...s.map((s=>(0,o.and)(d(e,t,s,r.ownProperties),o._`${a} = ${s}`))))},r.reportMissingProp=function(e,t){e.setParams({missingProperty:t},!0),e.error()},r.hasPropFunc=i,r.isOwnProperty=c,r.propertyInData=function(e,t,r,s){const a=o._`${t}${(0,o.getProperty)(r)} !== undefined`;return s?o._`${a} && ${c(e,t,r)}`:a},r.noPropertyInData=d,r.allSchemaProperties=l,r.schemaProperties=function(e,t){return l(t).filter((r=>!(0,s.alwaysValidSchema)(e,t[r])))},r.callValidateCode=function({schemaCode:e,data:t,it:{gen:r,topSchemaRef:s,schemaPath:n,errorPath:i},it:c},d,l,u){const m=u?o._`${e}, ${t}, ${s}${n}`:t,f=[[a.default.instancePath,(0,o.strConcat)(a.default.instancePath,i)],[a.default.parentData,c.parentData],[a.default.parentDataProperty,c.parentDataProperty],[a.default.rootData,a.default.rootData]];c.opts.dynamicRef&&f.push([a.default.dynamicAnchors,a.default.dynamicAnchors]);const p=o._`${m}, ${r.object(...f)}`;return l!==o.nil?o._`${d}.call(${l}, ${p})`:o._`${d}(${p})`};const u=o._`new RegExp`;r.usePattern=function({gen:e,it:{opts:t}},r){const s=t.unicodeRegExp?"u":"",{regExp:a}=t.code,i=a(r,s);return e.scopeValue("pattern",{key:i.toString(),ref:i,code:o._`${"new RegExp"===a.code?u:(0,n.useFunc)(e,a)}(${r}, ${s})`})},r.validateArray=function(e){const{gen:t,data:r,keyword:a,it:n}=e,i=t.name("valid");if(n.allErrors){const e=t.let("valid",!0);return c((()=>t.assign(e,!1))),e}return t.var(i,!0),c((()=>t.break())),i;function c(n){const c=t.const("len",o._`${r}.length`);t.forRange("i",0,c,(r=>{e.subschema({keyword:a,dataProp:r,dataPropType:s.Type.Num},i),t.if((0,o.not)(i),n)}))}},r.validateUnion=function(e){const{gen:t,schema:r,keyword:a,it:n}=e;if(!Array.isArray(r))throw new Error("ajv implementation error");if(r.some((e=>(0,s.alwaysValidSchema)(n,e)))&&!n.opts.unevaluated)return;const i=t.let("valid",!1),c=t.name("_valid");t.block((()=>r.forEach(((r,s)=>{const n=e.subschema({keyword:a,schemaProp:s,compositeRule:!0},c);t.assign(i,o._`${i} || ${c}`);e.mergeValidEvaluated(n,c)||t.if((0,o.not)(i))})))),e.result(i,(()=>e.reset()),(()=>e.error(!0)))}},{"../compile/codegen":2,"../compile/names":6,"../compile/util":10}],52:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});r.default={keyword:"id",code(){throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID')}}},{}],53:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("./id"),s=e("./ref");r.default=["$schema","$id","$defs","$vocabulary",{keyword:"$comment"},"definitions",o.default,s.default]},{"./id":52,"./ref":54}],54:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.callRef=r.getValidate=void 0;const o=e("../../compile/ref_error"),s=e("../code"),a=e("../../compile/codegen"),n=e("../../compile/names"),i=e("../../compile"),c=e("../../compile/util"),d={keyword:"$ref",schemaType:"string",code(e){const{gen:t,schema:r,it:s}=e,{baseId:n,schemaEnv:c,validateName:d,opts:m,self:f}=s,{root:p}=c;if(("#"===r||"#/"===r)&&n===p.baseId)return function(){if(c===p)return u(e,d,c,c.$async);const r=t.scopeValue("root",{ref:p});return u(e,a._`${r}.validate`,p,p.$async)}();const h=i.resolveRef.call(f,p,n,r);if(void 0===h)throw new o.default(s.opts.uriResolver,n,r);return h instanceof i.SchemaEnv?function(t){const r=l(e,t);u(e,r,t,t.$async)}(h):function(o){const s=t.scopeValue("schema",!0===m.code.source?{ref:o,code:(0,a.stringify)(o)}:{ref:o}),n=t.name("valid"),i=e.subschema({schema:o,dataTypes:[],schemaPath:a.nil,topSchemaRef:s,errSchemaPath:r},n);e.mergeEvaluated(i),e.ok(n)}(h)}};function l(e,t){const{gen:r}=e;return t.validate?r.scopeValue("validate",{ref:t.validate}):a._`${r.scopeValue("wrapper",{ref:t})}.validate`}function u(e,t,r,o){const{gen:i,it:d}=e,{allErrors:l,schemaEnv:u,opts:m}=d,f=m.passContext?n.default.this:a.nil;function p(e){const t=a._`${e}.errors`;i.assign(n.default.vErrors,a._`${n.default.vErrors} === null ? ${t} : ${n.default.vErrors}.concat(${t})`),i.assign(n.default.errors,a._`${n.default.vErrors}.length`)}function h(e){var t;if(!d.opts.unevaluated)return;const o=null===(t=null==r?void 0:r.validate)||void 0===t?void 0:t.evaluated;if(!0!==d.props)if(o&&!o.dynamicProps)void 0!==o.props&&(d.props=c.mergeEvaluated.props(i,o.props,d.props));else{const t=i.var("props",a._`${e}.evaluated.props`);d.props=c.mergeEvaluated.props(i,t,d.props,a.Name)}if(!0!==d.items)if(o&&!o.dynamicItems)void 0!==o.items&&(d.items=c.mergeEvaluated.items(i,o.items,d.items));else{const t=i.var("items",a._`${e}.evaluated.items`);d.items=c.mergeEvaluated.items(i,t,d.items,a.Name)}}o?function(){if(!u.$async)throw new Error("async schema referenced by sync schema");const r=i.let("valid");i.try((()=>{i.code(a._`await ${(0,s.callValidateCode)(e,t,f)}`),h(t),l||i.assign(r,!0)}),(e=>{i.if(a._`!(${e} instanceof ${d.ValidationError})`,(()=>i.throw(e))),p(e),l||i.assign(r,!1)})),e.ok(r)}():e.result((0,s.callValidateCode)(e,t,f),(()=>h(t)),(()=>p(t)))}r.getValidate=l,r.callRef=u,r.default=d},{"../../compile":5,"../../compile/codegen":2,"../../compile/names":6,"../../compile/ref_error":7,"../../compile/util":10,"../code":51}],55:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/codegen"),s=e("../discriminator/types"),a=e("../../compile"),n=e("../../compile/ref_error"),i=e("../../compile/util");r.default={keyword:"discriminator",type:"object",schemaType:"object",error:{message({params:{discrError:e,tagName:t}}){return e===s.DiscrError.Tag?`tag "${t}" must be string`:`value of tag "${t}" must be in oneOf`},params({params:{discrError:e,tag:t,tagName:r}}){return o._`{error: ${e}, tag: ${r}, tagValue: ${t}}`}},code(e){const{gen:t,data:r,schema:c,parentSchema:d,it:l}=e,{oneOf:u}=d;if(!l.opts.discriminator)throw new Error("discriminator: requires discriminator option");const m=c.propertyName;if("string"!=typeof m)throw new Error("discriminator: requires propertyName");if(c.mapping)throw new Error("discriminator: mapping is not supported");if(!u)throw new Error("discriminator: requires oneOf keyword");const f=t.let("valid",!1),p=t.const("tag",o._`${r}${(0,o.getProperty)(m)}`);function h(r){const s=t.name("valid"),a=e.subschema({keyword:"oneOf",schemaProp:r},s);return e.mergeEvaluated(a,o.Name),s}t.if(o._`typeof ${p} == "string"`,(()=>function(){const r=function(){var e;const t={},r=s(d);let o=!0;for(let t=0;t<u.length;t++){let d=u[t];if((null==d?void 0:d.$ref)&&!(0,i.schemaHasRulesButRef)(d,l.self.RULES)){const e=d.$ref;if(d=a.resolveRef.call(l.self,l.schemaEnv.root,l.baseId,e),d instanceof a.SchemaEnv&&(d=d.schema),void 0===d)throw new n.default(l.opts.uriResolver,l.baseId,e)}const f=null===(e=null==d?void 0:d.properties)||void 0===e?void 0:e[m];if("object"!=typeof f)throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${m}"`);o=o&&(r||s(d)),c(f,t)}if(!o)throw new Error(`discriminator: "${m}" must be required`);return t;function s({required:e}){return Array.isArray(e)&&e.includes(m)}function c(e,t){if(e.const)f(e.const,t);else{if(!e.enum)throw new Error(`discriminator: "properties/${m}" must have "const" or "enum"`);for(const r of e.enum)f(r,t)}}function f(e,r){if("string"!=typeof e||e in t)throw new Error(`discriminator: "${m}" values must be unique strings`);t[e]=r}}();t.if(!1);for(const e in r)t.elseIf(o._`${p} === ${e}`),t.assign(f,h(r[e]));t.else(),e.error(!1,{discrError:s.DiscrError.Mapping,tag:p,tagName:m}),t.endIf()}()),(()=>e.error(!1,{discrError:s.DiscrError.Tag,tag:p,tagName:m}))),e.ok(f)}}},{"../../compile":5,"../../compile/codegen":2,"../../compile/ref_error":7,"../../compile/util":10,"../discriminator/types":56}],56:[function(e,t,r){"use strict";var o;Object.defineProperty(r,"__esModule",{value:!0}),r.DiscrError=void 0,function(e){e.Tag="tag",e.Mapping="mapping"}(o||(r.DiscrError=o={}))},{}],57:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("./core"),s=e("./validation"),a=e("./applicator"),n=e("./dynamic"),i=e("./next"),c=e("./unevaluated"),d=e("./format"),l=e("./metadata"),u=[n.default,o.default,s.default,(0,a.default)(!0),d.default,l.metadataVocabulary,l.contentVocabulary,i.default,c.default];r.default=u},{"./applicator":41,"./core":53,"./dynamic":60,"./format":64,"./metadata":65,"./next":66,"./unevaluated":67,"./validation":73}],58:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.dynamicAnchor=void 0;const o=e("../../compile/codegen"),s=e("../../compile/names"),a=e("../../compile"),n=e("../core/ref"),i={keyword:"$dynamicAnchor",schemaType:"string",code(e){return c(e,e.schema)}};function c(e,t){const{gen:r,it:i}=e;i.schemaEnv.root.dynamicAnchors[t]=!0;const c=o._`${s.default.dynamicAnchors}${(0,o.getProperty)(t)}`,d="#"===i.errSchemaPath?i.validateName:function(e){const{schemaEnv:t,schema:r,self:o}=e.it,{root:s,baseId:i,localRefs:c,meta:d}=t.root,{schemaId:l}=o.opts,u=new a.SchemaEnv({schema:r,schemaId:l,root:s,baseId:i,localRefs:c,meta:d});return a.compileSchema.call(o,u),(0,n.getValidate)(e,u)}(e);r.if(o._`!${c}`,(()=>r.assign(c,d)))}r.dynamicAnchor=c,r.default=i},{"../../compile":5,"../../compile/codegen":2,"../../compile/names":6,"../core/ref":54}],59:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.dynamicRef=void 0;const o=e("../../compile/codegen"),s=e("../../compile/names"),a=e("../core/ref"),n={keyword:"$dynamicRef",schemaType:"string",code(e){return i(e,e.schema)}};function i(e,t){const{gen:r,keyword:n,it:i}=e;if("#"!==t[0])throw new Error(`"${n}" only supports hash fragment reference`);const c=t.slice(1);if(i.allErrors)d();else{const t=r.let("valid",!1);d(t),e.ok(t)}function d(e){if(i.schemaEnv.root.dynamicAnchors[c]){const t=r.let("_v",o._`${s.default.dynamicAnchors}${(0,o.getProperty)(c)}`);r.if(t,l(t,e),l(i.validateName,e))}else l(i.validateName,e)()}function l(t,o){return o?()=>r.block((()=>{(0,a.callRef)(e,t),r.let(o,!0)})):()=>(0,a.callRef)(e,t)}}r.dynamicRef=i,r.default=n},{"../../compile/codegen":2,"../../compile/names":6,"../core/ref":54}],60:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("./dynamicAnchor"),s=e("./dynamicRef"),a=e("./recursiveAnchor"),n=e("./recursiveRef");r.default=[o.default,s.default,a.default,n.default]},{"./dynamicAnchor":58,"./dynamicRef":59,"./recursiveAnchor":61,"./recursiveRef":62}],61:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("./dynamicAnchor"),s=e("../../compile/util");r.default={keyword:"$recursiveAnchor",schemaType:"boolean",code(e){e.schema?(0,o.dynamicAnchor)(e,""):(0,s.checkStrictMode)(e.it,"$recursiveAnchor: false is ignored")}}},{"../../compile/util":10,"./dynamicAnchor":58}],62:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("./dynamicRef");r.default={keyword:"$recursiveRef",schemaType:"string",code(e){return(0,o.dynamicRef)(e,e.schema)}}},{"./dynamicRef":59}],63:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/codegen");r.default={keyword:"format",type:["number","string"],schemaType:"string",$data:!0,error:{message({schemaCode:e}){return o.str`must match format "${e}"`},params({schemaCode:e}){return o._`{format: ${e}}`}},code(e,t){const{gen:r,data:s,$data:a,schema:n,schemaCode:i,it:c}=e,{opts:d,errSchemaPath:l,schemaEnv:u,self:m}=c;d.validateFormats&&(a?function(){const a=r.scopeValue("formats",{ref:m.formats,code:d.code.formats}),n=r.const("fDef",o._`${a}[${i}]`),c=r.let("fType"),l=r.let("format");r.if(o._`typeof ${n} == "object" && !(${n} instanceof RegExp)`,(()=>r.assign(c,o._`${n}.type || "string"`).assign(l,o._`${n}.validate`)),(()=>r.assign(c,o._`"string"`).assign(l,n))),e.fail$data((0,o.or)(!1===d.strictSchema?o.nil:o._`${i} && !${l}`,function(){const e=u.$async?o._`(${n}.async ? await ${l}(${s}) : ${l}(${s}))`:o._`${l}(${s})`,r=o._`(typeof ${l} == "function" ? ${e} : ${l}.test(${s}))`;return o._`${l} && ${l} !== true && ${c} === ${t} && !${r}`}()))}():function(){const a=m.formats[n];if(!a)return void function(){if(!1===d.strictSchema)return void m.logger.warn(e());throw new Error(e());function e(){return`unknown format "${n}" ignored in schema at path "${l}"`}}();if(!0===a)return;const[i,c,f]=function(e){const t=e instanceof RegExp?(0,o.regexpCode)(e):d.code.formats?o._`${d.code.formats}${(0,o.getProperty)(n)}`:void 0,s=r.scopeValue("formats",{key:n,ref:e,code:t});if("object"==typeof e&&!(e instanceof RegExp))return[e.type||"string",e.validate,o._`${s}.validate`];return["string",e,s]}(a);i===t&&e.pass(function(){if("object"==typeof a&&!(a instanceof RegExp)&&a.async){if(!u.$async)throw new Error("async format in sync schema");return o._`await ${f}(${s})`}return"function"==typeof c?o._`${f}(${s})`:o._`${f}.test(${s})`}())}())}}},{"../../compile/codegen":2}],64:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("./format");r.default=[o.default]},{"./format":63}],65:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.contentVocabulary=r.metadataVocabulary=void 0,r.metadataVocabulary=["title","description","default","deprecated","readOnly","writeOnly","examples"],r.contentVocabulary=["contentMediaType","contentEncoding","contentSchema"]},{}],66:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("./validation/dependentRequired"),s=e("./applicator/dependentSchemas"),a=e("./validation/limitContains");r.default=[o.default,s.default,a.default]},{"./applicator/dependentSchemas":39,"./validation/dependentRequired":71,"./validation/limitContains":74}],67:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("./unevaluatedProperties"),s=e("./unevaluatedItems");r.default=[o.default,s.default]},{"./unevaluatedItems":68,"./unevaluatedProperties":69}],68:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/codegen"),s=e("../../compile/util");r.default={keyword:"unevaluatedItems",type:"array",schemaType:["boolean","object"],error:{message({params:{len:e}}){return o.str`must NOT have more than ${e} items`},params({params:{len:e}}){return o._`{limit: ${e}}`}},code(e){const{gen:t,schema:r,data:a,it:n}=e,i=n.items||0;if(!0===i)return;const c=t.const("len",o._`${a}.length`);if(!1===r)e.setParams({len:i}),e.fail(o._`${c} > ${i}`);else if("object"==typeof r&&!(0,s.alwaysValidSchema)(n,r)){const r=t.var("valid",o._`${c} <= ${i}`);t.if((0,o.not)(r),(()=>function(r,a){t.forRange("i",a,c,(a=>{e.subschema({keyword:"unevaluatedItems",dataProp:a,dataPropType:s.Type.Num},r),n.allErrors||t.if((0,o.not)(r),(()=>t.break()))}))}(r,i))),e.ok(r)}n.items=!0}}},{"../../compile/codegen":2,"../../compile/util":10}],69:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/codegen"),s=e("../../compile/util"),a=e("../../compile/names");r.default={keyword:"unevaluatedProperties",type:"object",schemaType:["boolean","object"],trackErrors:!0,error:{message:"must NOT have unevaluated properties",params({params:e}){return o._`{unevaluatedProperty: ${e.unevaluatedProperty}}`}},code(e){const{gen:t,schema:r,data:n,errsCount:i,it:c}=e;if(!i)throw new Error("ajv implementation error");const{allErrors:d,props:l}=c;function u(a){if(!1===r)return e.setParams({unevaluatedProperty:a}),e.error(),void(d||t.break());if(!(0,s.alwaysValidSchema)(c,r)){const r=t.name("valid");e.subschema({keyword:"unevaluatedProperties",dataProp:a,dataPropType:s.Type.Str},r),d||t.if((0,o.not)(r),(()=>t.break()))}}l instanceof o.Name?t.if(o._`${l} !== true`,(()=>t.forIn("key",n,(e=>t.if(function(e,t){return o._`!${e} || !${e}[${t}]`}(l,e),(()=>u(e))))))):!0!==l&&t.forIn("key",n,(e=>void 0===l?u(e):t.if(function(e,t){const r=[];for(const s in e)!0===e[s]&&r.push(o._`${t} !== ${s}`);return(0,o.and)(...r)}(l,e),(()=>u(e))))),c.props=!0,e.ok(o._`${i} === ${a.default.errors}`)}}},{"../../compile/codegen":2,"../../compile/names":6,"../../compile/util":10}],70:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/codegen"),s=e("../../compile/util"),a=e("../../runtime/equal");r.default={keyword:"const",$data:!0,error:{message:"must be equal to constant",params({schemaCode:e}){return o._`{allowedValue: ${e}}`}},code(e){const{gen:t,data:r,$data:n,schemaCode:i,schema:c}=e;n||c&&"object"==typeof c?e.fail$data(o._`!${(0,s.useFunc)(t,a.default)}(${r}, ${i})`):e.fail(o._`${c} !== ${r}`)}}},{"../../compile/codegen":2,"../../compile/util":10,"../../runtime/equal":29}],71:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../applicator/dependencies");r.default={keyword:"dependentRequired",type:"object",schemaType:"object",error:o.error,code(e){return(0,o.validatePropertyDeps)(e)}}},{"../applicator/dependencies":38}],72:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/codegen"),s=e("../../compile/util"),a=e("../../runtime/equal");r.default={keyword:"enum",schemaType:"array",$data:!0,error:{message:"must be equal to one of the allowed values",params({schemaCode:e}){return o._`{allowedValues: ${e}}`}},code(e){const{gen:t,data:r,$data:n,schema:i,schemaCode:c,it:d}=e;if(!n&&0===i.length)throw new Error("enum must have non-empty array");let l;const u=()=>null!=l?l:l=(0,s.useFunc)(t,a.default);let m;if(i.length>=d.opts.loopEnum||n)m=t.let("valid"),e.block$data(m,(function(){t.assign(m,!1),t.forOf("v",c,(e=>t.if(o._`${u()}(${r}, ${e})`,(()=>t.assign(m,!0).break()))))}));else{if(!Array.isArray(i))throw new Error("ajv implementation error");const e=t.const("vSchema",c);m=(0,o.or)(...i.map(((t,s)=>function(e,t){const s=i[t];return"object"==typeof s&&null!==s?o._`${u()}(${r}, ${e}[${t}])`:o._`${r} === ${s}`}(e,s))))}e.pass(m)}}},{"../../compile/codegen":2,"../../compile/util":10,"../../runtime/equal":29}],73:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("./limitNumber"),s=e("./multipleOf"),a=e("./limitLength"),n=e("./pattern"),i=e("./limitProperties"),c=e("./required"),d=e("./limitItems"),l=e("./uniqueItems"),u=e("./const"),m=e("./enum");r.default=[o.default,s.default,a.default,n.default,i.default,c.default,d.default,l.default,{keyword:"type",schemaType:["string","array"]},{keyword:"nullable",schemaType:"boolean"},u.default,m.default]},{"./const":70,"./enum":72,"./limitItems":75,"./limitLength":76,"./limitNumber":77,"./limitProperties":78,"./multipleOf":79,"./pattern":80,"./required":81,"./uniqueItems":82}],74:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/util");r.default={keyword:["maxContains","minContains"],type:"array",schemaType:"number",code({keyword:e,parentSchema:t,it:r}){void 0===t.contains&&(0,o.checkStrictMode)(r,`"${e}" without "contains" is ignored`)}}},{"../../compile/util":10}],75:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/codegen");r.default={keyword:["maxItems","minItems"],type:"array",schemaType:"number",$data:!0,error:{message:({keyword:e,schemaCode:t})=>o.str`must NOT have ${"maxItems"===e?"more":"fewer"} than ${t} items`,params({schemaCode:e}){return o._`{limit: ${e}}`}},code(e){const{keyword:t,data:r,schemaCode:s}=e;e.fail$data(o._`${r}.length ${"maxItems"===t?o.operators.GT:o.operators.LT} ${s}`)}}},{"../../compile/codegen":2}],76:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/codegen"),s=e("../../compile/util"),a=e("../../runtime/ucs2length");r.default={keyword:["maxLength","minLength"],type:"string",schemaType:"number",$data:!0,error:{message:({keyword:e,schemaCode:t})=>o.str`must NOT have ${"maxLength"===e?"more":"fewer"} than ${t} characters`,params({schemaCode:e}){return o._`{limit: ${e}}`}},code(e){const{keyword:t,data:r,schemaCode:n,it:i}=e,c="maxLength"===t?o.operators.GT:o.operators.LT,d=!1===i.opts.unicode?o._`${r}.length`:o._`${(0,s.useFunc)(e.gen,a.default)}(${r})`;e.fail$data(o._`${d} ${c} ${n}`)}}},{"../../compile/codegen":2,"../../compile/util":10,"../../runtime/ucs2length":30}],77:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/codegen"),s=o.operators,a={maximum:{okStr:"<=",ok:s.LTE,fail:s.GT},minimum:{okStr:">=",ok:s.GTE,fail:s.LT},exclusiveMaximum:{okStr:"<",ok:s.LT,fail:s.GTE},exclusiveMinimum:{okStr:">",ok:s.GT,fail:s.LTE}},n={message({keyword:e,schemaCode:t}){return o.str`must be ${a[e].okStr} ${t}`},params({keyword:e,schemaCode:t}){return o._`{comparison: ${a[e].okStr}, limit: ${t}}`}},i={keyword:Object.keys(a),type:"number",schemaType:"number",$data:!0,error:n,code(e){const{keyword:t,data:r,schemaCode:s}=e;e.fail$data(o._`${r} ${a[t].fail} ${s} || isNaN(${r})`)}};r.default=i},{"../../compile/codegen":2}],78:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/codegen");r.default={keyword:["maxProperties","minProperties"],type:"object",schemaType:"number",$data:!0,error:{message:({keyword:e,schemaCode:t})=>o.str`must NOT have ${"maxProperties"===e?"more":"fewer"} than ${t} properties`,params({schemaCode:e}){return o._`{limit: ${e}}`}},code(e){const{keyword:t,data:r,schemaCode:s}=e;e.fail$data(o._`Object.keys(${r}).length ${"maxProperties"===t?o.operators.GT:o.operators.LT} ${s}`)}}},{"../../compile/codegen":2}],79:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/codegen");r.default={keyword:"multipleOf",type:"number",schemaType:"number",$data:!0,error:{message({schemaCode:e}){return o.str`must be multiple of ${e}`},params({schemaCode:e}){return o._`{multipleOf: ${e}}`}},code(e){const{gen:t,data:r,schemaCode:s,it:a}=e,n=a.opts.multipleOfPrecision,i=t.let("res"),c=n?o._`Math.abs(Math.round(${i}) - ${i}) > 1e-${n}`:o._`${i} !== parseInt(${i})`;e.fail$data(o._`(${s} === 0 || (${i} = ${r}/${s}, ${c}))`)}}},{"../../compile/codegen":2}],80:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../code"),s=e("../../compile/codegen");r.default={keyword:"pattern",type:"string",schemaType:"string",$data:!0,error:{message({schemaCode:e}){return s.str`must match pattern "${e}"`},params({schemaCode:e}){return s._`{pattern: ${e}}`}},code(e){const{data:t,$data:r,schema:a,schemaCode:n,it:i}=e,c=r?s._`(new RegExp(${n}, ${i.opts.unicodeRegExp?"u":""}))`:(0,o.usePattern)(e,a);e.fail$data(s._`!${c}.test(${t})`)}}},{"../../compile/codegen":2,"../code":51}],81:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../code"),s=e("../../compile/codegen"),a=e("../../compile/util");r.default={keyword:"required",type:"object",schemaType:"array",$data:!0,error:{message({params:{missingProperty:e}}){return s.str`must have required property '${e}'`},params({params:{missingProperty:e}}){return s._`{missingProperty: ${e}}`}},code(e){const{gen:t,schema:r,schemaCode:n,data:i,$data:c,it:d}=e,{opts:l}=d;if(!c&&0===r.length)return;const u=r.length>=l.loopRequired;if(d.allErrors?function(){if(u||c)e.block$data(s.nil,m);else for(const t of r)(0,o.checkReportMissingProp)(e,t)}():function(){const a=t.let("missing");if(u||c){const r=t.let("valid",!0);e.block$data(r,(()=>function(r,a){e.setParams({missingProperty:r}),t.forOf(r,n,(()=>{t.assign(a,(0,o.propertyInData)(t,i,r,l.ownProperties)),t.if((0,s.not)(a),(()=>{e.error(),t.break()}))}),s.nil)}(a,r))),e.ok(r)}else t.if((0,o.checkMissingProp)(e,r,a)),(0,o.reportMissingProp)(e,a),t.else()}(),l.strictRequired){const t=e.parentSchema.properties,{definedProperties:o}=e.it;for(const e of r)if(void 0===(null==t?void 0:t[e])&&!o.has(e)){(0,a.checkStrictMode)(d,`required property "${e}" is not defined at "${d.schemaEnv.baseId+d.errSchemaPath}" (strictRequired)`,d.opts.strictRequired)}}function m(){t.forOf("prop",n,(r=>{e.setParams({missingProperty:r}),t.if((0,o.noPropertyInData)(t,i,r,l.ownProperties),(()=>e.error()))}))}}}},{"../../compile/codegen":2,"../../compile/util":10,"../code":51}],82:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const o=e("../../compile/validate/dataType"),s=e("../../compile/codegen"),a=e("../../compile/util"),n=e("../../runtime/equal");r.default={keyword:"uniqueItems",type:"array",schemaType:"boolean",$data:!0,error:{message({params:{i:e,j:t}}){return s.str`must NOT have duplicate items (items ## ${t} and ${e} are identical)`},params({params:{i:e,j:t}}){return s._`{i: ${e}, j: ${t}}`}},code(e){const{gen:t,data:r,$data:i,schema:c,parentSchema:d,schemaCode:l,it:u}=e;if(!i&&!c)return;const m=t.let("valid"),f=d.items?(0,o.getSchemaTypes)(d.items):[];function p(a,n){const i=t.name("item"),c=(0,o.checkDataTypes)(f,i,u.opts.strictNumbers,o.DataType.Wrong),d=t.const("indices",s._`{}`);t.for(s._`;${a}--;`,(()=>{t.let(i,s._`${r}[${a}]`),t.if(c,s._`continue`),f.length>1&&t.if(s._`typeof ${i} == "string"`,s._`${i} += "_"`),t.if(s._`typeof ${d}[${i}] == "number"`,(()=>{t.assign(n,s._`${d}[${i}]`),e.error(),t.assign(m,!1).break()})).code(s._`${d}[${i}] = ${a}`)}))}function h(o,i){const c=(0,a.useFunc)(t,n.default),d=t.name("outer");t.label(d).for(s._`;${o}--;`,(()=>t.for(s._`${i} = ${o}; ${i}--;`,(()=>t.if(s._`${c}(${r}[${o}], ${r}[${i}])`,(()=>{e.error(),t.assign(m,!1).break(d)}))))))}e.block$data(m,(function(){const o=t.let("i",s._`${r}.length`),a=t.let("j");e.setParams({i:o,j:a}),t.assign(m,!0),t.if(s._`${o} > 1`,(()=>(f.length>0&&!f.some((e=>"object"===e||"array"===e))?p:h)(o,a)))}),s._`${l} === false`),e.ok(m)}}},{"../../compile/codegen":2,"../../compile/util":10,"../../compile/validate/dataType":13,"../../runtime/equal":29}],83:[function(e,t,r){"use strict";t.exports=function e(t,r){if(t===r)return!0;if(t&&r&&"object"==typeof t&&"object"==typeof r){if(t.constructor!==r.constructor)return!1;var o,s,a;if(Array.isArray(t)){if((o=t.length)!=r.length)return!1;for(s=o;0!=s--;)if(!e(t[s],r[s]))return!1;return!0}if(t.constructor===RegExp)return t.source===r.source&&t.flags===r.flags;if(t.valueOf!==Object.prototype.valueOf)return t.valueOf()===r.valueOf();if(t.toString!==Object.prototype.toString)return t.toString()===r.toString();if((o=(a=Object.keys(t)).length)!==Object.keys(r).length)return!1;for(s=o;0!=s--;)if(!Object.prototype.hasOwnProperty.call(r,a[s]))return!1;for(s=o;0!=s--;){var n=a[s];if(!e(t[n],r[n]))return!1}return!0}return t!=t&&r!=r}},{}],84:[function(e,t,r){"use strict";const{normalizeIPv6:o,normalizeIPv4:s,removeDotSegments:a,recomposeAuthority:n,normalizeComponentEncoding:i}=e("./lib/utils"),c=e("./lib/schemes");function d(e,t,r,o){const s={};return o||(e=f(l(e,r),r),t=f(l(t,r),r)),!(r=r||{}).tolerant&&t.scheme?(s.scheme=t.scheme,s.userinfo=t.userinfo,s.host=t.host,s.port=t.port,s.path=a(t.path||""),s.query=t.query):(void 0!==t.userinfo||void 0!==t.host||void 0!==t.port?(s.userinfo=t.userinfo,s.host=t.host,s.port=t.port,s.path=a(t.path||""),s.query=t.query):(t.path?("/"===t.path.charAt(0)?s.path=a(t.path):(s.path=void 0===e.userinfo&&void 0===e.host&&void 0===e.port||e.path?e.path?e.path.slice(0,e.path.lastIndexOf("/")+1)+t.path:t.path:"/"+t.path,s.path=a(s.path)),s.query=t.query):(s.path=e.path,s.query=void 0!==t.query?t.query:e.query),s.userinfo=e.userinfo,s.host=e.host,s.port=e.port),s.scheme=e.scheme),s.fragment=t.fragment,s}function l(e,t){const r={host:e.host,scheme:e.scheme,userinfo:e.userinfo,port:e.port,path:e.path,query:e.query,nid:e.nid,nss:e.nss,uuid:e.uuid,fragment:e.fragment,reference:e.reference,resourceName:e.resourceName,secure:e.secure,error:""},o=Object.assign({},t),s=[],i=c[(o.scheme||r.scheme||"").toLowerCase()];i&&i.serialize&&i.serialize(r,o),void 0!==r.path&&(o.skipEscape?r.path=unescape(r.path):(r.path=escape(r.path),void 0!==r.scheme&&(r.path=r.path.split("%3A").join(":")))),"suffix"!==o.reference&&r.scheme&&(s.push(r.scheme),s.push(":"));const d=n(r,o);if(void 0!==d&&("suffix"!==o.reference&&s.push("//"),s.push(d),r.path&&"/"!==r.path.charAt(0)&&s.push("/")),void 0!==r.path){let e=r.path;o.absolutePath||i&&i.absolutePath||(e=a(e)),void 0===d&&(e=e.replace(/^\/\//u,"/%2F")),s.push(e)}return void 0!==r.query&&(s.push("?"),s.push(r.query)),void 0!==r.fragment&&(s.push("#"),s.push(r.fragment)),s.join("")}const u=Array.from({length:127},((e,t)=>/[^!"$&'()*+,\-.;=_`a-z{}~]/u.test(String.fromCharCode(t))));const m=/^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;function f(e,t){const r=Object.assign({},t),a={scheme:void 0,userinfo:void 0,host:"",port:void 0,path:"",query:void 0,fragment:void 0},n=-1!==e.indexOf("%");let i=!1;"suffix"===r.reference&&(e=(r.scheme?r.scheme+":":"")+"//"+e);const d=e.match(m);if(d){if(a.scheme=d[1],a.userinfo=d[3],a.host=d[4],a.port=parseInt(d[5],10),a.path=d[6]||"",a.query=d[7],a.fragment=d[8],isNaN(a.port)&&(a.port=d[5]),a.host){const e=s(a.host);if(!1===e.isIPV4){const t=o(e.host,{isIPV4:!1});a.host=t.host.toLowerCase(),i=t.isIPV6}else a.host=e.host,i=!0}a.reference=void 0!==a.scheme||void 0!==a.userinfo||void 0!==a.host||void 0!==a.port||a.path||void 0!==a.query?void 0===a.scheme?"relative":void 0===a.fragment?"absolute":"uri":"same-document",r.reference&&"suffix"!==r.reference&&r.reference!==a.reference&&(a.error=a.error||"URI is not a "+r.reference+" reference.");const e=c[(r.scheme||a.scheme||"").toLowerCase()];if(!(r.unicodeSupport||e&&e.unicodeSupport)&&a.host&&(r.domainHost||e&&e.domainHost)&&!1===i&&function(e){let t=0;for(let r=0,o=e.length;r<o;++r)if(t=e.charCodeAt(r),t>126||u[t])return!0;return!1}(a.host))try{a.host=URL.domainToASCII(a.host.toLowerCase())}catch(e){a.error=a.error||"Host's domain name can not be converted to ASCII: "+e}(!e||e&&!e.skipNormalize)&&(n&&void 0!==a.scheme&&(a.scheme=unescape(a.scheme)),n&&void 0!==a.userinfo&&(a.userinfo=unescape(a.userinfo)),n&&void 0!==a.host&&(a.host=unescape(a.host)),void 0!==a.path&&a.path.length&&(a.path=escape(unescape(a.path))),void 0!==a.fragment&&a.fragment.length&&(a.fragment=encodeURI(decodeURIComponent(a.fragment)))),e&&e.parse&&e.parse(a,r)}else a.error=a.error||"URI can not be parsed.";return a}const p={SCHEMES:c,normalize(e,t){return"string"==typeof e?e=l(f(e,t),t):"object"==typeof e&&(e=f(l(e,t),t)),e},resolve(e,t,r){const o=Object.assign({scheme:"null"},r);return l(d(f(e,o),f(t,o),o,!0),{...o,skipEscape:!0})},resolveComponents:d,equal(e,t,r){return"string"==typeof e?(e=unescape(e),e=l(i(f(e,r),!0),{...r,skipEscape:!0})):"object"==typeof e&&(e=l(i(e,!0),{...r,skipEscape:!0})),"string"==typeof t?(t=unescape(t),t=l(i(f(t,r),!0),{...r,skipEscape:!0})):"object"==typeof t&&(t=l(i(t,!0),{...r,skipEscape:!0})),e.toLowerCase()===t.toLowerCase()},serialize:l,parse:f};t.exports=p,t.exports.default=p,t.exports.fastUri=p},{"./lib/schemes":85,"./lib/utils":87}],85:[function(e,t,r){"use strict";const o=/^[\da-f]{8}\b-[\da-f]{4}\b-[\da-f]{4}\b-[\da-f]{4}\b-[\da-f]{12}$/iu,s=/([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;function a(e){return"boolean"==typeof e.secure?e.secure:"wss"===String(e.scheme).toLowerCase()}function n(e){return e.host||(e.error=e.error||"HTTP URIs must have a host."),e}function i(e){const t="https"===String(e.scheme).toLowerCase();return e.port!==(t?443:80)&&""!==e.port||(e.port=void 0),e.path||(e.path="/"),e}const c={scheme:"http",domainHost:!0,parse:n,serialize:i},d={scheme:"https",domainHost:c.domainHost,parse:n,serialize:i},l={scheme:"ws",domainHost:!0,parse(e){return e.secure=a(e),e.resourceName=(e.path||"/")+(e.query?"?"+e.query:""),e.path=void 0,e.query=void 0,e},serialize(e){if(e.port!==(a(e)?443:80)&&""!==e.port||(e.port=void 0),"boolean"==typeof e.secure&&(e.scheme=e.secure?"wss":"ws",e.secure=void 0),e.resourceName){const[t,r]=e.resourceName.split("?");e.path=t&&"/"!==t?t:void 0,e.query=r,e.resourceName=void 0}return e.fragment=void 0,e}},u={http:c,https:d,ws:l,wss:{scheme:"wss",domainHost:l.domainHost,parse:l.parse,serialize:l.serialize},urn:{scheme:"urn",parse(e,t){if(!e.path)return e.error="URN can not be parsed",e;const r=e.path.match(s);if(r){const o=t.scheme||e.scheme||"urn";e.nid=r[1].toLowerCase(),e.nss=r[2];const s=u[`${o}:${t.nid||e.nid}`];e.path=void 0,s&&(e=s.parse(e,t))}else e.error=e.error||"URN can not be parsed.";return e},serialize(e,t){const r=t.scheme||e.scheme||"urn",o=e.nid.toLowerCase(),s=u[`${r}:${t.nid||o}`];s&&(e=s.serialize(e,t));const a=e;return a.path=`${o||t.nid}:${e.nss}`,t.skipEscape=!0,a},skipNormalize:!0},"urn:uuid":{scheme:"urn:uuid",parse(e,t){const r=e;return r.uuid=r.nss,r.nss=void 0,t.tolerant||r.uuid&&o.test(r.uuid)||(r.error=r.error||"UUID is not valid."),r},serialize(e){const t=e;return t.nss=(e.uuid||"").toLowerCase(),t},skipNormalize:!0}};t.exports=u},{}],86:[function(e,t,r){"use strict";t.exports={HEX:{0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,a:10,A:10,b:11,B:11,c:12,C:12,d:13,D:13,e:14,E:14,f:15,F:15}}},{}],87:[function(e,t,r){"use strict";const{HEX:o}=e("./scopedChars");function s(e){if(c(e,".")<3)return{host:e,isIPV4:!1};const t=e.match(/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/u)||[],[r]=t;return r?{host:i(r,"."),isIPV4:!0}:{host:e,isIPV4:!1}}function a(e,t=!1){let r="",s=!0;for(const t of e){if(void 0===o[t])return;"0"!==t&&!0===s&&(s=!1),s||(r+=t)}return t&&0===r.length&&(r="0"),r}function n(e,t={}){if(c(e,":")<2)return{host:e,isIPV6:!1};const r=function(e){let t=0;const r={error:!1,address:"",zone:""},o=[],s=[];let n=!1,i=!1,c=!1;function d(){if(s.length){if(!1===n){const e=a(s);if(void 0===e)return r.error=!0,!1;o.push(e)}s.length=0}return!0}for(let a=0;a<e.length;a++){const l=e[a];if("["!==l&&"]"!==l)if(":"!==l)if("%"===l){if(!d())break;n=!0}else s.push(l);else{if(!0===i&&(c=!0),!d())break;if(t++,o.push(":"),t>7){r.error=!0;break}a-1>=0&&":"===e[a-1]&&(i=!0)}}return s.length&&(n?r.zone=s.join(""):o.push(c?s.join(""):a(s))),r.address=o.join(""),r}(e);if(r.error)return{host:e,isIPV6:!1};{let e=r.address,t=r.address;return r.zone&&(e+="%"+r.zone,t+="%25"+r.zone),{host:e,escapedHost:t,isIPV6:!0}}}function i(e,t){let r="",o=!0;const s=e.length;for(let a=0;a<s;a++){const n=e[a];"0"===n&&o?(a+1<=s&&e[a+1]===t||a+1===s)&&(r+=n,o=!1):(o=n===t,r+=n)}return r}function c(e,t){let r=0;for(let o=0;o<e.length;o++)e[o]===t&&r++;return r}const d=/^\.\.?\//u,l=/^\/\.(?:\/|$)/u,u=/^\/\.\.(?:\/|$)/u,m=/^\/?(?:.|\n)*?(?=\/|$)/u;t.exports={recomposeAuthority(e,t){const r=[];if(void 0!==e.userinfo&&(r.push(e.userinfo),r.push("@")),void 0!==e.host){let t=unescape(e.host);const o=s(t);if(o.isIPV4)t=o.host;else{const r=n(o.host,{isIPV4:!1});t=!0===r.isIPV6?`[${r.escapedHost}]`:e.host}r.push(t)}return"number"!=typeof e.port&&"string"!=typeof e.port||(r.push(":"),r.push(String(e.port))),r.length?r.join(""):void 0},normalizeComponentEncoding(e,t){const r=!0!==t?escape:unescape;return void 0!==e.scheme&&(e.scheme=r(e.scheme)),void 0!==e.userinfo&&(e.userinfo=r(e.userinfo)),void 0!==e.host&&(e.host=r(e.host)),void 0!==e.path&&(e.path=r(e.path)),void 0!==e.query&&(e.query=r(e.query)),void 0!==e.fragment&&(e.fragment=r(e.fragment)),e},removeDotSegments(e){const t=[];for(;e.length;)if(e.match(d))e=e.replace(d,"");else if(e.match(l))e=e.replace(l,"/");else if(e.match(u))e=e.replace(u,"/"),t.pop();else if("."===e||".."===e)e="";else{const r=e.match(m);if(!r)throw new Error("Unexpected dot segment condition");{const o=r[0];e=e.slice(o.length),t.push(o)}}return t.join("")},normalizeIPv4:s,normalizeIPv6:n,stringArrayToHexStripped:a}},{"./scopedChars":86}],88:[function(e,t,r){"use strict";var o=t.exports=function(e,t,r){"function"==typeof t&&(r=t,t={}),s(t,"function"==typeof(r=t.cb||r)?r:r.pre||function(){},r.post||function(){},e,"",e)};function s(e,t,r,a,n,i,c,d,l,u){if(a&&"object"==typeof a&&!Array.isArray(a)){for(var m in t(a,n,i,c,d,l,u),a){var f=a[m];if(Array.isArray(f)){if(m in o.arrayKeywords)for(var p=0;p<f.length;p++)s(e,t,r,f[p],n+"/"+m+"/"+p,i,n,m,a,p)}else if(m in o.propsKeywords){if(f&&"object"==typeof f)for(var h in f)s(e,t,r,f[h],n+"/"+m+"/"+h.replace(/~/g,"~0").replace(/\//g,"~1"),i,n,m,a,h)}else(m in o.keywords||e.allKeys&&!(m in o.skipKeywords))&&s(e,t,r,f,n+"/"+m,i,n,m,a)}r(a,n,i,c,d,l,u)}}o.keywords={additionalItems:!0,items:!0,contains:!0,additionalProperties:!0,propertyNames:!0,not:!0,if:!0,then:!0,else:!0},o.arrayKeywords={items:!0,allOf:!0,anyOf:!0,oneOf:!0},o.propsKeywords={$defs:!0,definitions:!0,properties:!0,patternProperties:!0,dependencies:!0},o.skipKeywords={default:!0,enum:!0,const:!0,required:!0,maximum:!0,minimum:!0,exclusiveMaximum:!0,exclusiveMinimum:!0,multipleOf:!0,maxLength:!0,minLength:!0,pattern:!0,format:!0,maxItems:!0,minItems:!0,uniqueItems:!0,maxProperties:!0,minProperties:!0}},{}],2020:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.MissingRefError=r.ValidationError=r.CodeGen=r.Name=r.nil=r.stringify=r.str=r._=r.KeywordCxt=r.Ajv2020=void 0;const o=e("./core"),s=e("./vocabularies/draft2020"),a=e("./vocabularies/discriminator"),n=e("./refs/json-schema-2020-12"),i="https://json-schema.org/draft/2020-12/schema";class c extends o.default{constructor(e={}){super({...e,dynamicRef:!0,next:!0,unevaluated:!0})}_addVocabularies(){super._addVocabularies(),s.default.forEach((e=>this.addVocabulary(e))),this.opts.discriminator&&this.addKeyword(a.default)}_addDefaultMetaSchema(){super._addDefaultMetaSchema();const{$data:e,meta:t}=this.opts;t&&(n.default.call(this,e),this.refs["http://json-schema.org/schema"]=i)}defaultMeta(){return this.opts.defaultMeta=super.defaultMeta()||(this.getSchema(i)?i:void 0)}}r.Ajv2020=c,t.exports=r=c,t.exports.Ajv2020=c,Object.defineProperty(r,"__esModule",{value:!0}),r.default=c;var d=e("./compile/validate");Object.defineProperty(r,"KeywordCxt",{enumerable:!0,get(){return d.KeywordCxt}});var l=e("./compile/codegen");Object.defineProperty(r,"_",{enumerable:!0,get(){return l._}}),Object.defineProperty(r,"str",{enumerable:!0,get(){return l.str}}),Object.defineProperty(r,"stringify",{enumerable:!0,get(){return l.stringify}}),Object.defineProperty(r,"nil",{enumerable:!0,get(){return l.nil}}),Object.defineProperty(r,"Name",{enumerable:!0,get(){return l.Name}}),Object.defineProperty(r,"CodeGen",{enumerable:!0,get(){return l.CodeGen}});var u=e("./runtime/validation_error");Object.defineProperty(r,"ValidationError",{enumerable:!0,get(){return u.default}});var m=e("./compile/ref_error");Object.defineProperty(r,"MissingRefError",{enumerable:!0,get(){return m.default}})},{"./compile/codegen":2,"./compile/ref_error":7,"./compile/validate":15,"./core":18,"./refs/json-schema-2020-12":20,"./runtime/validation_error":32,"./vocabularies/discriminator":55,"./vocabularies/draft2020":57}]},{},[])("2020")}));


// === config.js ===
"use strict";
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
function schemaExtraProperties(type) {
    const node = SETTINGS_SCHEMA.properties.displays.properties[type];
    const fragment = node && node.allOf && node.allOf.find((f) => f && f.properties && !f['$ref']);
    return (fragment && fragment.properties) || {};
}
function displaySupportsLedStrip(type) {
    const node = SETTINGS_SCHEMA.properties.displays.properties[type];
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


// === state.js ===
"use strict";
let settings = null;
let currentStepId = 'wifi';
const unlocked = new Set();
let dirty = false;
let cleanSnapshot = '';
let sessionEpoch = 0;
function settingsSnapshot() {
    return settings ? JSON.stringify(settings) : '';
}
function markClean() {
    cleanSnapshot = settingsSnapshot();
    dirty = false;
}


// === connection-tests.js ===
"use strict";
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


// === oauth.js ===
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
const OAUTH_NEEDS_HTTP_MESSAGE = 'Sign-in needs this page served over http(s), not opened as a file. Open it from https://busytime.org/configure.';
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
    const signInBtn = el('button', { class: 'btn', type: 'button' }, [pending ? 'Waiting for authorization\u2026' : label]);
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
        const refreshBtn = el('button', { class: 'btn-secondary', type: 'button' }, [el('span', { class: 'material-symbols-outlined' }, ['refresh']), 'Refresh']);
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


// === helpers.js ===
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


// === validation.js ===
"use strict";
let cachedAjvValidate = null;
function getAjvValidate() {
    if (!window.ajv2020)
        return null;
    if (!cachedAjvValidate) {
        const ajv = new window.ajv2020({ allErrors: true, strict: false });
        ajv.addFormat('uri', { type: 'string', validate: isHttpUrl });
        cachedAjvValidate = ajv.compile(SETTINGS_SCHEMA);
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
            push('general', 'warning', 'JSON-Schema validation is unavailable because the bundled ajv library failed to load (reload the page). Only the built-in checks below were run.');
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
        if (cfg.testable) {
            if (credStatus[type] === 'invalid')
                push(stepId, 'error', `${label}: invalid username or password.`);
            else if (credStatus[type] === 'unreachable')
                push(stepId, 'warning', `${label}: couldn't verify the connection - ${credDetail[type] || 'check the URL/network.'}`);
        }
        else if (cfg.oauth) {
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


// === sidebar.js ===
"use strict";
function isStepLocked(id) {
    return !unlocked.has(id);
}
function gotoStep(id) {
    if (isStepLocked(id.split(':')[0]) && !unlocked.has(id))
        return;
    disarmRestart();
    currentStepId = id;
    renderSidebar();
    renderMain();
    const heading = document.querySelector('#main-content h2');
    if (heading) {
        heading.tabIndex = -1;
        heading.focus();
    }
}
function unlockThrough(topId) {
    const idx = TOP_LEVEL_ORDER.indexOf(topId);
    for (let i = 0; i <= idx; i++)
        unlocked.add(TOP_LEVEL_ORDER[i]);
}
function goNext(fromTop) {
    const idx = TOP_LEVEL_ORDER.indexOf(fromTop);
    const next = TOP_LEVEL_ORDER[idx + 1];
    if (next) {
        unlocked.add(next);
        gotoStep(next);
    }
}
function goBack(fromTop) {
    const idx = TOP_LEVEL_ORDER.indexOf(fromTop);
    const prev = TOP_LEVEL_ORDER[idx - 1];
    if (prev)
        gotoStep(prev);
}
function renderSidebar() {
    const nav = document.getElementById('sidebar');
    const restoreRestartFocus = document.activeElement instanceof HTMLElement && document.activeElement.classList.contains('nav-restart');
    nav.innerHTML = '';
    const buckets = getValidationBuckets();
    const mobileLabel = el('label', { class: 'mobile-nav-label', for: 'mobile-step-nav' }, ['Current section']);
    const mobileSelect = el('select', { id: 'mobile-step-nav', class: 'mobile-step-select', 'aria-label': 'Current settings section' });
    nav.appendChild(mobileLabel);
    nav.appendChild(mobileSelect);
    TOP_LEVEL_ORDER.forEach((id) => {
        const meta = STEP_META[id];
        const locked = isStepLocked(id);
        const isActive = currentStepId === id;
        const item = el('button', {
            type: 'button',
            class: 'nav-item' + (currentStepId.split(':')[0] === id ? ' active' : '') + (locked ? ' locked' : ''),
            'aria-disabled': locked ? 'true' : null,
            'aria-label': locked ? `${meta.label} (locked - complete the earlier steps first)` : null,
            title: locked ? 'Complete the earlier steps to unlock this section' : null,
            'aria-current': isActive ? 'step' : null,
            onclick: () => !locked && gotoStep(id),
        }, [el('span', { class: 'material-symbols-outlined' }, [meta.icon]), el('span', {}, [meta.label])]);
        if (locked)
            item.appendChild(el('span', { class: 'material-symbols-outlined lock-icon' }, ['lock']));
        if (id !== 'review' && stepOrDescendantHasIssue(buckets, id))
            appendIssueIcon(item, buckets, id);
        else if (!locked && id !== 'review' && currentStepId.split(':')[0] !== id)
            appendCompleteIcon(item);
        nav.appendChild(item);
        mobileSelect.appendChild(el('option', { value: id, disabled: locked ? 'disabled' : null, selected: isActive ? 'selected' : null }, [meta.label + (stepOrDescendantHasIssue(buckets, id) ? ' - issues' : '')]));
        if (id === 'displays' && !locked) {
            const subIds = ['default', ...Object.keys(settings.displays).filter((k) => k !== 'default' && k !== 'all')];
            subIds.forEach((sub) => {
                const cfg = DISPLAY_TYPES[sub];
                if (cfg && cfg.testable)
                    ensureDisplayStatusChecked(sub);
            });
            subIds.forEach((sub) => addSubNavItem(nav, mobileSelect, 'displays:' + sub, sub === 'default' ? 'Default Display Settings' : DISPLAY_TYPES[sub]?.label || sub, buckets));
        }
        if (id === 'calendars' && !locked) {
            Object.keys(settings.calendars).forEach((type) => {
                const cfg = PROVIDER_TYPES[type];
                if (!cfg)
                    return;
                if (cfg.oauth)
                    ensureOauthStatusChecked(type);
                else if (cfg.testable)
                    ensureCredStatusChecked(type);
                else if (cfg.icsOnly)
                    (settings.calendars[type].calendars || []).forEach((url) => ensureIcsUrlChecked(url));
            });
            Object.keys(settings.calendars).forEach((sub) => addSubNavItem(nav, mobileSelect, 'calendars:' + sub, PROVIDER_TYPES[sub]?.label || sub, buckets));
        }
    });
    mobileSelect.value = currentStepId;
    mobileSelect.addEventListener('change', () => gotoStep(mobileSelect.value));
    const restartBtn = renderRestartButton();
    nav.appendChild(restartBtn);
    if (restoreRestartFocus)
        restartBtn.focus();
}
const RESTART_ARM_MS = 5000;
let restartArmed = false;
let restartTimer;
function disarmRestart() {
    restartArmed = false;
    clearTimeout(restartTimer);
}
function onRestartClick() {
    if (!dirty || restartArmed) {
        restartEditor();
        return;
    }
    restartArmed = true;
    clearTimeout(restartTimer);
    restartTimer = window.setTimeout(() => { restartArmed = false; if (settings)
        renderSidebar(); }, RESTART_ARM_MS);
    renderSidebar();
}
function renderRestartButton() {
    const label = restartArmed ? 'Click again to discard all settings' : 'Start over';
    return el('button', {
        type: 'button',
        class: 'nav-restart' + (restartArmed ? ' armed' : ''),
        title: restartArmed ? label : 'Start over (discard all settings)',
        'aria-label': restartArmed ? label : 'Start over, discard all settings',
        onclick: onRestartClick,
    }, [
        el('span', { class: 'material-symbols-outlined', 'aria-hidden': 'true' }, ['restart_alt']),
        ...(restartArmed ? [el('span', {}, [label])] : []),
    ]);
}
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && restartArmed) {
        disarmRestart();
        if (settings)
            renderSidebar();
    }
});
function addSubNavItem(nav, mobileSelect, fullId, label, buckets) {
    const active = currentStepId === fullId;
    const item = el('button', { type: 'button', class: 'nav-item sub' + (active ? ' active' : ''), 'aria-current': active ? 'step' : null, onclick: () => gotoStep(fullId) }, [label]);
    if (buckets.has(fullId))
        appendIssueIcon(item, buckets, fullId);
    nav.appendChild(item);
    mobileSelect.appendChild(el('option', { value: fullId, selected: active ? 'selected' : null }, [`  ${label}${buckets.has(fullId) ? ' - issues' : ''}`]));
}
function appendIssueIcon(item, buckets, id) {
    const issues = [...(buckets.get(id) || [])];
    if (id === 'displays' || id === 'calendars') {
        Array.from(buckets.keys()).filter((key) => key.startsWith(id + ':')).forEach((key) => issues.push(...buckets.get(key)));
    }
    const kind = issues.some((entry) => entry.kind === 'error') ? 'error' : 'warning';
    const count = issues.length;
    const text = `${count} ${kind}${count === 1 ? '' : 's'} to review`;
    item.appendChild(el('span', { class: `material-symbols-outlined issue-icon issue-icon--${kind}`, title: text, 'aria-label': text }, [kind === 'error' ? 'error' : 'warning']));
}
function appendCompleteIcon(item) {
    item.appendChild(el('span', { class: 'material-symbols-outlined complete-icon', title: 'Section reviewed', 'aria-label': 'Section reviewed' }, ['check_circle']));
}
let lastRenderedStepId = null;
function focusKeyFor(node, main) {
    const key = focusKeyBase(node);
    const same = Array.from(main.querySelectorAll(node.tagName)).filter((n) => focusKeyBase(n) === key);
    return { key, index: same.indexOf(node) };
}
function focusKeyBase(n) {
    const control = n;
    const label = n.getAttribute('aria-label') || (control.labels && control.labels[0] && control.labels[0].textContent.trim()) || n.getAttribute('placeholder') || n.textContent.trim().slice(0, 40);
    return `${n.tagName}|${control.type || ''}|${label}`;
}
function renderMain() {
    const main = document.getElementById('main-content');
    let restore = null;
    const active = document.activeElement;
    if (lastRenderedStepId === currentStepId && active && active !== main && main.contains(active) && /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(active.tagName)) {
        const input = active;
        restore = Object.assign(focusKeyFor(active, main), {
            tag: active.tagName,
            selection: typeof input.selectionStart === 'number' ? [input.selectionStart, input.selectionEnd] : null,
        });
    }
    main.innerHTML = '';
    lastRenderedStepId = currentStepId;
    const [top, sub] = currentStepId.split(':');
    if (top === 'wifi')
        renderWifiStep(main);
    else if (top === 'schedule')
        renderScheduleStep(main);
    else if (top === 'displays')
        (sub ? renderDisplaySubStep(main, sub) : renderDisplaysOverview(main));
    else if (top === 'calendars')
        (sub ? renderProviderSubStep(main, sub) : renderCalendarsOverview(main));
    else if (top === 'review')
        renderReviewStep(main);
    if (restore && restore.index >= 0) {
        const twin = Array.from(main.querySelectorAll(restore.tag)).filter((n) => focusKeyBase(n) === restore.key)[restore.index];
        if (twin && !twin.disabled) {
            twin.focus();
            try {
                if (restore.selection)
                    twin.setSelectionRange(restore.selection[0], restore.selection[1]);
            }
            catch (e) { }
        }
    }
}
function appendStepIssues(main, stepId) {
    const entries = getValidationBuckets().get(stepId) || [];
    if (!entries.length)
        return;
    const panel = el('div', { class: 'step-issues', role: 'status' });
    entries.forEach((entry) => panel.appendChild(el('div', { class: `step-issue step-issue--${entry.kind}` }, [
        el('span', { class: 'material-symbols-outlined', 'aria-hidden': 'true' }, [entry.kind === 'error' ? 'error' : 'warning']),
        el('span', {}, [entry.message]),
    ])));
    main.appendChild(panel);
}
function stepActions(main, topId, { hideNext } = {}) {
    const bar = el('div', { class: 'step-actions' });
    const backIdx = TOP_LEVEL_ORDER.indexOf(topId) - 1;
    if (backIdx >= 0)
        bar.appendChild(el('button', { class: 'btn-secondary', onclick: () => goBack(topId) }, ['Back']));
    if (!hideNext)
        bar.appendChild(el('button', { class: 'btn', onclick: () => goNext(topId) }, ['Next']));
    main.appendChild(bar);
}
function renderSubStepActions(main, parentId) {
    const bar = el('div', { class: 'step-actions' });
    bar.appendChild(el('button', { class: 'btn', onclick: () => gotoStep(parentId) }, ['OK']));
    main.appendChild(bar);
}


// === wifi-step.js ===
"use strict";
function renderWifiStep(main) {
    main.appendChild(el('h2', { class: 'step-title' }, ['WiFi']));
    main.appendChild(el('p', { class: 'step-desc' }, ['Access points BusyTime will try to join. It connects to whichever configured network has the strongest signal.']));
    if (shouldWarnWifiEmpty()) {
        main.appendChild(el('div', { class: 'warning-banner' }, [
            el('span', { class: 'material-symbols-outlined' }, ['warning']),
            el('span', {}, ['No WiFi networks configured. Without WiFi (or a network-disabling test mode), the device will retry connecting forever and never start.']),
        ]));
    }
    const list = el('div', {});
    Object.keys(settings.wifis).forEach((ssid) => {
        let name = ssid;
        const row = el('div', { class: 'wifi-entry' });
        const ssidInput = el('input', { type: 'text', value: ssid, 'aria-label': 'SSID' });
        const ssidError = el('p', { class: 'warning-text' }, []);
        ssidError.hidden = true;
        ssidInput.addEventListener('change', () => {
            const next = ssidInput.value.trim();
            if (next === name) {
                ssidInput.value = name;
                ssidError.hidden = true;
                return;
            }
            if (!next) {
                ssidError.textContent = 'SSID cannot be blank.';
            }
            else if (Object.prototype.hasOwnProperty.call(settings.wifis, next)) {
                ssidError.textContent = `A network named "${next}" is already in the list.`;
            }
            else {
                const renamed = {};
                Object.keys(settings.wifis).forEach((key) => { renamed[key === name ? next : key] = settings.wifis[key]; });
                settings.wifis = renamed;
                name = next;
                ssidInput.value = next;
                setRowLabels();
                markDirtyAndRefreshSidebar();
                return;
            }
            ssidError.hidden = false;
            ssidInput.value = name;
            ssidInput.setAttribute('aria-invalid', 'true');
        });
        ssidInput.addEventListener('input', () => { ssidError.hidden = true; ssidInput.removeAttribute('aria-invalid'); });
        row.appendChild(fieldRow('SSID', '', el('div', {}, [ssidInput, ssidError])));
        const pwWrap = el('div', { class: 'password-row' });
        const pwInput = el('input', { type: 'password', value: settings.wifis[ssid], 'aria-label': `Password for ${ssid}` });
        pwInput.addEventListener('input', () => { settings.wifis[name] = pwInput.value; });
        const visibilityIcon = el('span', { class: 'material-symbols-outlined', 'aria-hidden': 'true' }, ['visibility']);
        const toggle = el('button', { class: 'icon-only btn-secondary', type: 'button' }, [visibilityIcon]);
        const removeBtn = el('button', { class: 'icon-only btn-secondary', type: 'button', onclick: () => { delete settings.wifis[name]; renderMain(); } }, [
            el('span', { class: 'material-symbols-outlined', 'aria-hidden': 'true' }, ['delete']),
        ]);
        const setRowLabels = () => {
            const toggleLabel = `${pwInput.type === 'password' ? 'Show' : 'Hide'} password for ${name}`;
            toggle.setAttribute('aria-label', toggleLabel);
            toggle.title = toggleLabel;
            pwInput.setAttribute('aria-label', `Password for ${name}`);
            removeBtn.setAttribute('aria-label', `Remove WiFi network ${name}`);
            removeBtn.title = `Remove WiFi network ${name}`;
        };
        setRowLabels();
        toggle.addEventListener('click', () => {
            pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
            visibilityIcon.textContent = pwInput.type === 'password' ? 'visibility' : 'visibility_off';
            setRowLabels();
        });
        pwWrap.appendChild(pwInput);
        pwWrap.appendChild(toggle);
        row.appendChild(fieldRow('Password', '', pwWrap));
        row.appendChild(removeBtn);
        list.appendChild(row);
    });
    main.appendChild(list);
    const addRow = el('div', { class: 'add-row' });
    const ssidInput = el('input', { type: 'text', placeholder: 'New SSID', 'aria-label': 'New SSID' });
    const addError = el('p', { class: 'warning-text' }, []);
    addError.hidden = true;
    const pwWrap = el('div', { class: 'password-row' });
    const pwInput = el('input', { type: 'password', placeholder: 'Password', 'aria-label': 'New network password' });
    const visibilityIcon = el('span', { class: 'material-symbols-outlined', 'aria-hidden': 'true' }, ['visibility']);
    const pwToggle = el('button', { class: 'icon-only btn-secondary', type: 'button', 'aria-label': 'Show password', title: 'Show password' }, [visibilityIcon]);
    pwToggle.addEventListener('click', () => {
        pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
        const label = pwInput.type === 'password' ? 'Show password' : 'Hide password';
        visibilityIcon.textContent = pwInput.type === 'password' ? 'visibility' : 'visibility_off';
        pwToggle.setAttribute('aria-label', label);
        pwToggle.title = label;
    });
    pwWrap.appendChild(pwInput);
    pwWrap.appendChild(pwToggle);
    const addBtn = el('button', { class: 'btn-secondary', type: 'button' }, [el('span', { class: 'material-symbols-outlined' }, ['add']), 'Add Network']);
    addBtn.addEventListener('click', () => {
        const ssid = ssidInput.value.trim();
        if (!ssid) {
            addError.textContent = 'Enter a network name (SSID) to add.';
        }
        else if (Object.prototype.hasOwnProperty.call(settings.wifis, ssid)) {
            addError.textContent = `A network named "${ssid}" is already in the list.`;
        }
        else {
            settings.wifis[ssid] = pwInput.value;
            renderMain();
            return;
        }
        addError.hidden = false;
        ssidInput.setAttribute('aria-invalid', 'true');
    });
    ssidInput.addEventListener('input', () => { addError.hidden = true; ssidInput.removeAttribute('aria-invalid'); });
    ssidInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addBtn.click();
        }
    });
    pwInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addBtn.click();
        }
    });
    addRow.appendChild(ssidInput);
    addRow.appendChild(pwWrap);
    addRow.appendChild(addBtn);
    main.appendChild(addRow);
    main.appendChild(addError);
    stepActions(main, 'wifi');
}
function shouldWarnWifiEmpty() {
    return Object.keys(settings.wifis).length === 0 && !NETWORK_DISABLING_TEST_MODES.includes(settings.test_mode);
}


// === schedule-step.js ===
"use strict";
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


// === displays-step.js ===
"use strict";
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
    Object.keys(settings.displays).filter((k) => k !== 'default' && k !== 'all').forEach((type) => {
        const cfg = DISPLAY_TYPES[type] || {};
        const label = el('button', { class: 'type-card-link', type: 'button', onclick: () => gotoStep('displays:' + type) }, [cfg.label || type]);
        const controls = el('div', { class: 'type-card-controls' });
        if (cfg.testable) {
            ensureDisplayStatusChecked(type);
            const meta = displayStateMeta[displayStatuses[type]] || displayStateMeta.unknown;
            const title = statusTitle(meta, displayDetails[type]);
            controls.appendChild(el('span', { class: 'material-symbols-outlined status-icon status-icon--' + meta.cls + (meta.cls === 'checking' ? ' spin' : ''), title, 'aria-label': title }, [meta.icon]));
        }
        const card = el('div', { class: 'type-card' }, [label, controls]);
        const removeBtn = el('button', { class: 'icon-only btn-secondary', type: 'button', 'aria-label': `Remove ${cfg.label || type}`, title: `Remove ${cfg.label || type}` }, [el('span', { class: 'material-symbols-outlined', 'aria-hidden': 'true' }, ['delete'])]);
        removeBtn.addEventListener('click', (e) => { e.stopPropagation(); delete settings.displays[type]; renderSidebar(); renderMain(); });
        controls.appendChild(removeBtn);
        list.appendChild(card);
    });
    main.appendChild(list);
    const testable = testableDisplayTypes();
    if (testable.length) {
        const anyPending = testable.some((t) => displayPendings[t]);
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
    const remaining = Object.keys(DISPLAY_TYPES).filter((t) => !(t in settings.displays));
    if (remaining.length) {
        const addRow = el('div', { class: 'add-row' });
        const select = el('select', { 'aria-label': 'Display to add' });
        remaining.forEach((t) => select.appendChild(el('option', { value: t }, [DISPLAY_TYPES[t].label])));
        const addBtn = el('button', { class: 'btn-secondary', type: 'button' }, [el('span', { class: 'material-symbols-outlined' }, ['add']), 'Add Display']);
        addBtn.addEventListener('click', () => { settings.displays[select.value] = {}; renderSidebar(); gotoStep('displays:' + select.value); });
        addRow.appendChild(select);
        addRow.appendChild(addBtn);
        main.appendChild(addRow);
    }
    stepActions(main, 'displays');
}
function renderDisplaySubStep(main, type) {
    const displayStatuses = displayStatus;
    const isDefault = type === 'default';
    const target = settings.displays[type];
    main.appendChild(renderSubStepTitle(isDefault ? 'Default Display Settings' : (DISPLAY_TYPES[type] || {}).label || type, () => gotoStep('displays')));
    appendStepIssues(main, 'displays:' + type);
    if (!isDefault && DISPLAY_HELP[type])
        main.appendChild(helpLinkEl(DISPLAY_HELP[type].text, DISPLAY_HELP[type].href));
    renderCommonDisplayFields(main, target, isDefault, type);
    if (!isDefault) {
        const cfg = DISPLAY_TYPES[type];
        if (cfg.testable)
            ensureDisplayStatusChecked(type);
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
                    displayStatuses[type] = 'unknown';
                    fillDisplayStatusEl(type);
                }
                if (f.enumValues) {
                    renderSidebar();
                    renderMain();
                }
            });
            const control = (cfg.testable && f.key === 'url')
                ? el('div', { class: 'input-with-status' }, [input, renderDisplayStatusEl(type), renderDisplayRetestButton(type), renderDisplayDetailEl(type)])
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


// === calendars-step.js ===
"use strict";
function renderCalendarsOverview(main) {
    const providerTypes = PROVIDER_TYPES;
    const oauthStateMeta = OAUTH_STATE_META;
    const credStateMeta = CRED_STATE_META;
    const credStatuses = credStatus;
    main.appendChild(el('h2', { class: 'step-title' }, ['Calendar Providers']));
    main.appendChild(el('p', { class: 'step-desc' }, ['Add the calendar providers to monitor. Google and Outlook use OAuth sign-in; the others take plain credentials.']));
    appendStepIssues(main, 'calendars');
    const list = el('div', { class: 'type-list' });
    Object.keys(settings.calendars).forEach((type) => {
        const cfg = providerTypes[type] || {};
        const label = el('button', { class: 'type-card-link', type: 'button', onclick: () => gotoStep('calendars:' + type) }, [cfg.label || type]);
        if (cfg.oauth) {
            const oauthType = type;
            ensureOauthStatusChecked(oauthType);
            const meta = oauthStateMeta[computeOauthDisplayState(oauthType)];
            label.appendChild(el('span', { class: 'oauth-dot oauth-dot--' + meta.cls, title: meta.text, 'aria-label': meta.text }, []));
        }
        else if (cfg.testable) {
            ensureCredStatusChecked(type);
            const meta = credStateMeta[credStatuses[type]] || credStateMeta.unknown;
            label.appendChild(el('span', { class: 'oauth-dot oauth-dot--' + meta.cls, title: meta.text, 'aria-label': meta.text }, []));
        }
        else if (cfg.icsOnly) {
            const urls = settings.calendars[type].calendars || [];
            urls.forEach((url) => ensureIcsUrlChecked(url));
            const meta = ICS_STATE_META[icsAggregateStatus(urls)];
            label.appendChild(el('span', { class: 'oauth-dot oauth-dot--' + meta.cls, title: meta.text, 'aria-label': meta.text }, []));
        }
        const card = el('div', { class: 'type-card' }, [label]);
        const removeBtn = el('button', { class: 'icon-only btn-secondary', type: 'button', 'aria-label': `Remove ${cfg.label || type}`, title: `Remove ${cfg.label || type}` }, [el('span', { class: 'material-symbols-outlined', 'aria-hidden': 'true' }, ['delete'])]);
        removeBtn.addEventListener('click', (e) => { e.stopPropagation(); delete settings.calendars[type]; renderSidebar(); renderMain(); });
        card.appendChild(removeBtn);
        list.appendChild(card);
    });
    main.appendChild(list);
    const remaining = Object.keys(providerTypes).filter((t) => !(t in settings.calendars));
    if (remaining.length) {
        const addRow = el('div', { class: 'add-row' });
        const select = el('select', { 'aria-label': 'Calendar provider to add' });
        remaining.forEach((t) => select.appendChild(el('option', { value: t }, [providerTypes[t].label])));
        const addBtn = el('button', { class: 'btn-secondary', type: 'button' }, [el('span', { class: 'material-symbols-outlined' }, ['add']), 'Add Provider']);
        addBtn.addEventListener('click', () => {
            const type = select.value;
            settings.calendars[type] = { calendars: [] };
            renderSidebar();
            gotoStep('calendars:' + type);
        });
        addRow.appendChild(select);
        addRow.appendChild(addBtn);
        main.appendChild(addRow);
    }
    stepActions(main, 'calendars');
}
function renderProviderSubStep(main, type) {
    const cfg = PROVIDER_TYPES[type] || {};
    const credStatuses = credStatus;
    const target = settings.calendars[type];
    if (!target.calendars)
        target.calendars = [];
    const calendarNames = target.calendars;
    main.appendChild(renderSubStepTitle(cfg.label || type, () => gotoStep('calendars')));
    appendStepIssues(main, 'calendars:' + type);
    if (cfg.oauth) {
        const oauthType = type;
        ensureOauthStatusChecked(oauthType);
        main.appendChild(renderOauthStatusEl(oauthType));
        main.appendChild(renderOauthActions(oauthType));
        if (hasTokens(oauthType)) {
            main.appendChild(el('label', { class: 'field-label section-label' }, ['Calendars in this account']));
            main.appendChild(renderCalendarPicker(oauthType, target));
        }
    }
    if (cfg.creds) {
        if (!target.auth)
            target.auth = {};
        const auth = target.auth;
        if (cfg.credHint) {
            const hint = el('p', { class: 'field-help' }, [cfg.credHint.text]);
            if (cfg.credHint.linkHref) {
                hint.appendChild(document.createTextNode(' '));
                hint.appendChild(el('a', { href: cfg.credHint.linkHref, target: '_blank', rel: 'noopener' }, [cfg.credHint.linkText || 'Learn more']));
            }
            main.appendChild(hint);
        }
        if (cfg.testable)
            ensureCredStatusChecked(type);
        cfg.creds.forEach((key) => {
            const resetCredStatus = () => { if (cfg.testable) {
                credStatuses[type] = 'unknown';
                fillCredStatusEl(type);
            } };
            let control;
            if (key === 'password') {
                control = passwordFieldEl(auth[key] || '', (val) => { auth[key] = val; resetCredStatus(); });
            }
            else {
                const input = el('input', { type: 'text', value: auth[key] || '' });
                input.addEventListener('input', () => { auth[key] = input.value; resetCredStatus(); });
                control = input;
            }
            if (cfg.testable && key === 'url')
                control = el('div', { class: 'input-with-status' }, [control, renderCredStatusEl(type), renderCredRetestButton(type), renderCredDetailEl(type)]);
            main.appendChild(fieldRow(key === 'url' ? 'Server URL' : (key.charAt(0).toUpperCase() + key.slice(1)), '', control));
        });
        if (cfg.testable && cfg.fixedUrl && !cfg.creds.includes('url')) {
            main.appendChild(fieldRow('Server', '', el('div', { class: 'input-with-status' }, [
                el('span', { class: 'field-help' }, [cfg.fixedUrl]),
                renderCredStatusEl(type),
                renderCredRetestButton(type),
                renderCredDetailEl(type),
            ])));
        }
        if (cfg.corsNote && !(cfg.testable && (credStatuses[type] === 'valid' || credStatuses[type] === 'invalid'))) {
            main.appendChild(el('div', { class: 'oauth-status' }, [
                el('span', { class: 'material-symbols-outlined' }, ['info']),
                el('span', {}, [cfg.corsNote]),
            ]));
        }
    }
    if (!cfg.oauth) {
        const icsStatusWrap = cfg.icsOnly ? el('div', {}) : null;
        const redrawIcsStatus = cfg.icsOnly ? () => { icsStatusWrap.innerHTML = ''; icsStatusWrap.appendChild(renderIcsStatusList(calendarNames)); } : null;
        const chipWrap = chipListEl(calendarNames, cfg.icsOnly ? 'https://example.com/calendar.ics' : 'Calendar name', redrawIcsStatus, cfg.icsOnly ? {
            inputType: 'url',
            validate: isHttpUrl,
            invalidMessage: 'Enter a complete HTTP or HTTPS URL.',
        } : {});
        main.appendChild(fieldRow(cfg.icsOnly ? 'ICS feed URLs' : 'Calendar names to monitor', '', chipWrap));
        if (cfg.icsOnly) {
            redrawIcsStatus();
            main.appendChild(icsStatusWrap);
        }
    }
    renderSubStepActions(main, 'calendars');
}
function chipListEl(arrayRef, placeholder, onChange, options = {}) {
    const wrap = el('div', {});
    const chips = el('div', { class: 'chip-list' });
    function redraw() {
        chips.innerHTML = '';
        arrayRef.forEach((val, idx) => {
            const rm = el('button', { type: 'button', 'aria-label': `Remove ${val}`, title: `Remove ${val}` }, [el('span', { class: 'material-symbols-outlined', 'aria-hidden': 'true' }, ['close'])]);
            rm.addEventListener('click', () => { arrayRef.splice(idx, 1); redraw(); if (onChange)
                onChange(); });
            chips.appendChild(el('span', { class: 'chip' }, [val, rm]));
        });
    }
    redraw();
    const input = el('input', { type: options.inputType || 'text', placeholder });
    const error = el('p', { class: 'warning-text', role: 'alert' }, []);
    error.hidden = true;
    const addBtn = el('button', { type: 'button', class: 'btn-secondary' }, ['Add']);
    function addValue() {
        const val = input.value.trim();
        if (!val)
            return;
        if (options.validate && !options.validate(val)) {
            error.textContent = options.invalidMessage || 'Enter a valid value.';
            error.hidden = false;
            input.setAttribute('aria-invalid', 'true');
            return;
        }
        if (arrayRef.includes(val)) {
            error.textContent = 'That value has already been added.';
            error.hidden = false;
            input.setAttribute('aria-invalid', 'true');
            return;
        }
        arrayRef.push(val);
        input.value = '';
        input.removeAttribute('aria-invalid');
        error.hidden = true;
        redraw();
        if (onChange)
            onChange();
    }
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addValue();
        }
    });
    input.addEventListener('input', () => { error.hidden = true; input.removeAttribute('aria-invalid'); });
    addBtn.addEventListener('click', addValue);
    wrap.appendChild(chips);
    wrap.appendChild(el('div', { class: 'add-row' }, [input, addBtn]));
    wrap.appendChild(el('span', { class: 'field-help' }, ['Press Enter or choose Add to include this value.']));
    wrap.appendChild(error);
    return wrap;
}


// === review-step.js ===
"use strict";
let saveStatusEl = null;
function renderReviewSummary() {
    const summary = el('section', { class: 'review-summary', 'aria-labelledby': 'review-summary-title' });
    summary.appendChild(el('h3', { id: 'review-summary-title' }, ['Configuration summary']));
    const wifiNames = Object.keys(settings.wifis);
    const dayNames = settings.calendar_days.slice().sort().map((day) => DAY_LABELS[day]).join(', ') || 'None';
    const displays = activeDisplayTypes().map((type) => type === 'all' ? 'All built-in displays' : ((DISPLAY_TYPES[type] || {}).label || type));
    const providers = Object.keys(settings.calendars).map((type) => (PROVIDER_TYPES[type] || {}).label || type);
    const rows = [
        ['WiFi networks', wifiNames.length ? wifiNames.join(', ') : 'None'],
        ['Operating mode', settings.test_mode ? `${settings.test_mode} test` : 'Normal operation'],
        ['Timezone', `${settings.calendar_timezone_name} (UTC${formatOffset(settings.calendar_timezone_offset)})`],
        ['Checking schedule', `${hourLabel(settings.calendar_hour_start)} to ${hourLabel(settings.calendar_hour_end)} on ${dayNames}`],
        ['Meeting warning', settings.pending_time ? `${settings.pending_time} minute${settings.pending_time === 1 ? '' : 's'} before a meeting starts` : 'Off'],
        ['Active displays', displays.length ? displays.join(', ') : 'None'],
        ['Calendar providers', providers.length ? providers.join(', ') : 'None'],
    ];
    const list = el('dl', { class: 'summary-list' });
    rows.forEach(([term, value]) => {
        list.appendChild(el('dt', {}, [term]));
        list.appendChild(el('dd', {}, [value]));
    });
    summary.appendChild(list);
    const configured = configuredDisplayTypes();
    if (configured.length) {
        summary.appendChild(el('h4', {}, ['Display overrides']));
        const overrides = el('ul', { class: 'override-summary' });
        configured.forEach((type) => {
            const target = settings.displays[type] || {};
            const keys = Object.keys(target).filter((key) => !['url', 'token', 'entity_id', 'preset', 'led_count', 'name'].includes(key));
            overrides.appendChild(el('li', {}, [`${(DISPLAY_TYPES[type] || {}).label || type}: ${keys.length ? keys.join(', ') : 'uses Default Display Settings'}`]));
        });
        summary.appendChild(overrides);
    }
    return summary;
}
function renderReviewStep(main) {
    ensureDefaults();
    main.appendChild(el('h2', { class: 'step-title' }, ['Review & Save']));
    const buckets = getValidationBuckets();
    const hardErrors = hasHardErrors(buckets);
    const issuesBox = el('div', {});
    main.appendChild(issuesBox);
    if (buckets.size === 0) {
        issuesBox.appendChild(el('p', { class: 'validation-ok' }, ['\u2713 No issues found - passes JSON-Schema validation (ajv2020) and the built-in sanity checks.']));
    }
    else {
        issuesBox.appendChild(el('p', { class: 'validation-errors' }, ['Issues to review, grouped by step:']));
        sortedBucketKeys(buckets).forEach((stepId) => {
            const group = el('div', { class: 'issue-group' });
            const clickable = TOP_LEVEL_ORDER.includes(stepId.split(':')[0]) && stepId !== 'review';
            group.appendChild(clickable
                ? el('a', { href: '#', class: 'issue-group-heading', onclick: (e) => { e.preventDefault(); gotoStep(stepId); } }, [stepLabel(stepId)])
                : el('div', { class: 'issue-group-heading' }, [stepLabel(stepId)]));
            const list = el('ul', { class: 'validation-errors' });
            buckets.get(stepId).forEach((entry) => list.appendChild(el('li', { class: entry.kind === 'warning' ? 'issue-warning' : 'issue-error' }, [entry.message])));
            group.appendChild(list);
            issuesBox.appendChild(group);
        });
    }
    main.appendChild(renderReviewSummary());
    const jsonDetails = el('details', { class: 'json-details' }, [
        el('summary', {}, ['Advanced: generated settings.json']),
        el('pre', { class: 'json-preview' }, [JSON.stringify(settings, null, 2)]),
    ]);
    main.appendChild(jsonDetails);
    const actions = el('div', { class: 'step-actions' });
    const downloadBtn = el('button', { class: 'btn' }, [el('span', { class: 'material-symbols-outlined' }, ['download']), 'Download settings.json']);
    downloadBtn.disabled = hardErrors;
    if (hardErrors)
        downloadBtn.title = 'Resolve the errors above before saving.';
    downloadBtn.addEventListener('click', downloadSettings);
    actions.appendChild(downloadBtn);
    if (window.showSaveFilePicker) {
        const saveAsBtn = el('button', { class: 'btn-secondary' }, [el('span', { class: 'material-symbols-outlined' }, ['save']), 'Save As...']);
        saveAsBtn.disabled = hardErrors;
        if (hardErrors)
            saveAsBtn.title = 'Resolve the errors above before saving.';
        saveAsBtn.addEventListener('click', saveAsSettings);
        actions.appendChild(saveAsBtn);
    }
    main.appendChild(actions);
    if (hardErrors)
        main.appendChild(el('p', { class: 'save-blocked-note' }, ['Saving is unavailable until the errors above are resolved. Warnings do not block saving.']));
    saveStatusEl = el('p', { class: 'save-status', role: 'status', 'aria-live': 'polite' }, []);
    main.appendChild(saveStatusEl);
}
function downloadSettings() {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'settings.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    markClean();
    if (saveStatusEl)
        saveStatusEl.textContent = 'Downloaded settings.json successfully.';
}
async function saveAsSettings() {
    try {
        const handle = await window.showSaveFilePicker({
            suggestedName: 'settings.json',
            types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(settings, null, 2));
        await writable.close();
        markClean();
        if (saveStatusEl)
            saveStatusEl.textContent = 'Saved settings.json successfully.';
    }
    catch (e) {
        if (e.name !== 'AbortError') {
            console.error(e);
            if (saveStatusEl)
                saveStatusEl.textContent = `Could not save the file: ${e.message}`;
        }
    }
}


// === main.js ===
"use strict";
function enterWizard(isLoaded) {
    ensureDefaults();
    document.getElementById('gate').hidden = true;
    document.getElementById('wizard').hidden = false;
    markClean();
    if (isLoaded) {
        TOP_LEVEL_ORDER.forEach((id) => unlocked.add(id));
        currentStepId = 'wifi';
    }
    else {
        unlocked.add('wifi');
        currentStepId = 'wifi';
    }
    renderSidebar();
    renderMain();
}
function startNew() {
    settings = { displays: { onboard: {} } };
    ensureDefaults();
    enterWizard(false);
}
function restartEditor() {
    sessionEpoch++;
    resetConnectionTestState();
    resetOauthState();
    settings = null;
    currentStepId = 'wifi';
    unlocked.clear();
    lastRenderedStepId = null;
    markClean();
    disarmRestart();
    document.getElementById('sidebar').innerHTML = '';
    document.getElementById('main-content').innerHTML = '';
    document.getElementById('wizard').hidden = true;
    document.getElementById('gate').hidden = false;
    document.getElementById('gate-error').hidden = true;
    document.getElementById('file-input').value = '';
    document.getElementById('btn-new').focus();
}
function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function describeUnusableSettings(parsed) {
    if (!isPlainObject(parsed))
        return 'The file must contain a JSON object ({ ... }) at the top level.';
    for (const key of ['wifis', 'displays', 'calendars']) {
        if (key in parsed && parsed[key] !== null && !isPlainObject(parsed[key]))
            return `"${key}" must be a JSON object.`;
    }
    for (const key of ['displays', 'calendars']) {
        for (const [name, value] of Object.entries(parsed[key] || {})) {
            if (!isPlainObject(value))
                return `"${key}.${name}" must be a JSON object.`;
        }
    }
    if ('calendar_days' in parsed && !Array.isArray(parsed.calendar_days))
        return '"calendar_days" must be an array.';
    return null;
}
function showGateError(message) {
    const err = document.getElementById('gate-error');
    err.hidden = false;
    err.textContent = message;
}
function loadFromFile(file) {
    const reader = new FileReader();
    reader.onerror = () => showGateError('Could not read that file.');
    reader.onload = () => {
        let parsed;
        try {
            parsed = JSON.parse(reader.result);
        }
        catch (e) {
            showGateError('Could not parse that file as JSON: ' + e.message);
            return;
        }
        const problem = describeUnusableSettings(parsed);
        if (problem) {
            showGateError(problem);
            return;
        }
        settings = parsed;
        document.getElementById('gate-error').hidden = true;
        enterWizard(true);
    };
    reader.readAsText(file);
}
document.getElementById('btn-new').addEventListener('click', startNew);
document.getElementById('file-input').addEventListener('change', (e) => {
    const files = e.target.files;
    if (files[0])
        loadFromFile(files[0]);
});
const dropZone = document.getElementById('drop-zone');
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files[0])
        loadFromFile(e.dataTransfer.files[0]);
});
dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        document.getElementById('file-input').click();
    }
});
const wizardEl = document.getElementById('wizard');
function markDirtyAndRefreshSidebar() {
    dirty = settingsSnapshot() !== cleanSnapshot;
    if (settings)
        renderSidebar();
}
wizardEl.addEventListener('input', markDirtyAndRefreshSidebar);
wizardEl.addEventListener('click', markDirtyAndRefreshSidebar);
window.addEventListener('beforeunload', (e) => {
    if (dirty) {
        e.preventDefault();
        e.returnValue = '';
    }
});

