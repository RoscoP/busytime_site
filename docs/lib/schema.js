"use strict";
// Schema definition for BusyTime configuration
// Uses JSON Schema specification for validation and form generation
// Custom form rendering implemented in app.ts
const schema = {
    type: 'object',
    properties: {
        wifis: {
            type: 'object',
            additionalProperties: {
                type: 'string',
                description: 'WiFi password'
            },
            description: 'WiFi access point configurations',
            default: {}
        },
        test_mode: {
            type: ['string', 'null'],
            enum: [null, 'lights', 'calendar'],
            enumNames: ['None', 'Lights', 'Calendar'],
            description: 'Test mode configuration',
            default: null
        },
        calendar_hour_start: {
            type: 'integer',
            minimum: 0,
            maximum: 23,
            description: 'Start hour for calendar monitoring',
            format: 'time',
            default: 8
        },
        calendar_hour_end: {
            type: 'integer',
            minimum: 1,
            maximum: 24,
            description: 'End hour for calendar monitoring',
            format: 'time',
            default: 18
        },
        calendar_days: {
            type: 'array',
            items: {
                type: 'integer',
                enum: [0, 1, 2, 3, 4, 5, 6],
                enumNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            },
            description: 'Days of the week to monitor',
            default: [0, 1, 2, 3, 4]
        },
        pending_time: {
            type: 'integer',
            minimum: 0,
            description: 'Yellow warning time in minutes',
            default: 10
        },
        displays: {
            type: 'object',
            properties: {
                default: {
                    type: 'object',
                    properties: {
                        brightness: {
                            type: 'number',
                            minimum: 0,
                            maximum: 1,
                            description: 'Default brightness level (0.0 - 1.0)',
                            default: 1.0
                        },
                        use_calendar_colors: {
                            type: 'boolean',
                            description: 'Use colors from the calendar for the busy color',
                            default: false
                        },
                        colors: {
                            type: 'object',
                            properties: {
                                NONE: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for NONE state'
                                },
                                TESTING: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for TESTING state'
                                },
                                SETUP: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for SETUP state'
                                },
                                WAITING: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for WAITING state'
                                },
                                ERROR: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for ERROR state'
                                },
                                IDLE: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for IDLE state'
                                },
                                FREE: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for FREE state'
                                },
                                POSSIBLE: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for POSSIBLE state'
                                },
                                PENDING: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for PENDING state'
                                },
                                BUSYPENDING: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for BUSYPENDING state'
                                },
                                BUSY: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for BUSY state'
                                }
                            },
                            additionalProperties: false,
                            description: 'Optional color overrides for display states'
                        },
                        event_time_color: {
                            type: 'object',
                            properties: {
                                '1': {
                                    type: 'object',
                                    properties: {
                                        state: {
                                            type: ['string', 'null'],
                                            enum: [null, 'NONE', 'TESTING', 'SETUP', 'WAITING', 'ERROR', 'IDLE', 'FREE', 'POSSIBLE', 'PENDING', 'BUSYPENDING', 'BUSY'],
                                            description: 'State override for events whose minute ends with 1 (null = use natural event state)',
                                            default: null
                                        },
                                        color: {
                                            type: ['array', 'null'],
                                            items: { type: 'integer', minimum: 0, maximum: 255 },
                                            minItems: 3,
                                            maxItems: 3,
                                            description: 'Color override for events whose minute ends with 1 (null = use default event time color)',
                                            default: null
                                        }
                                    },
                                    additionalProperties: false,
                                    description: 'Configuration for events whose minute ends with 1'
                                },
                                '2': {
                                    type: 'object',
                                    properties: {
                                        state: {
                                            type: ['string', 'null'],
                                            enum: [null, 'NONE', 'TESTING', 'SETUP', 'WAITING', 'ERROR', 'IDLE', 'FREE', 'POSSIBLE', 'PENDING', 'BUSYPENDING', 'BUSY'],
                                            description: 'State override for events whose minute ends with 2 (null = use natural event state)',
                                            default: null
                                        },
                                        color: {
                                            type: ['array', 'null'],
                                            items: { type: 'integer', minimum: 0, maximum: 255 },
                                            minItems: 3,
                                            maxItems: 3,
                                            description: 'Color override for events whose minute ends with 2 (null = use default event time color)',
                                            default: null
                                        }
                                    },
                                    additionalProperties: false,
                                    description: 'Configuration for events whose minute ends with 2'
                                },
                                '3': {
                                    type: 'object',
                                    properties: {
                                        state: {
                                            type: ['string', 'null'],
                                            enum: [null, 'NONE', 'TESTING', 'SETUP', 'WAITING', 'ERROR', 'IDLE', 'FREE', 'POSSIBLE', 'PENDING', 'BUSYPENDING', 'BUSY'],
                                            description: 'State override for events whose minute ends with 3 (null = use natural event state)',
                                            default: null
                                        },
                                        color: {
                                            type: ['array', 'null'],
                                            items: { type: 'integer', minimum: 0, maximum: 255 },
                                            minItems: 3,
                                            maxItems: 3,
                                            description: 'Color override for events whose minute ends with 3 (null = use default event time color)',
                                            default: null
                                        }
                                    },
                                    additionalProperties: false,
                                    description: 'Configuration for events whose minute ends with 3'
                                },
                                '4': {
                                    type: 'object',
                                    properties: {
                                        state: {
                                            type: ['string', 'null'],
                                            enum: [null, 'NONE', 'TESTING', 'SETUP', 'WAITING', 'ERROR', 'IDLE', 'FREE', 'POSSIBLE', 'PENDING', 'BUSYPENDING', 'BUSY'],
                                            description: 'State override for events whose minute ends with 4 (null = use natural event state)',
                                            default: null
                                        },
                                        color: {
                                            type: ['array', 'null'],
                                            items: { type: 'integer', minimum: 0, maximum: 255 },
                                            minItems: 3,
                                            maxItems: 3,
                                            description: 'Color override for events whose minute ends with 4 (null = use default event time color)',
                                            default: null
                                        }
                                    },
                                    additionalProperties: false,
                                    description: 'Configuration for events whose minute ends with 4'
                                }
                            },
                            additionalProperties: false,
                            description: 'Event time color and state overrides based on minute ending. Properties only exist when explicitly configured'
                        }
                    },
                    description: 'Default settings that apply to all displays unless overridden',
                    default: {
                        brightness: 1.0,
                        use_calendar_colors: false
                    }
                },
                bigstoplight: {
                    type: 'object',
                    properties: {
                        brightness: {
                            type: 'number',
                            minimum: 0,
                            maximum: 1,
                            description: 'Brightness level override (0.0 - 1.0)'
                        },
                        url: {
                            type: 'string',
                            format: 'uri',
                            description: 'URL for big stoplight API'
                        }
                    },
                    description: 'Big physical stoplight controlled with Raspberry Pi Pico 2w'
                },
                console: {
                    type: 'object',
                    properties: {
                        colors: {
                            type: 'object',
                            properties: {
                                NONE: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for NONE state'
                                },
                                TESTING: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for TESTING state'
                                },
                                SETUP: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for SETUP state'
                                },
                                WAITING: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for WAITING state'
                                },
                                ERROR: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for ERROR state'
                                },
                                IDLE: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for IDLE state'
                                },
                                FREE: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for FREE state'
                                },
                                POSSIBLE: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for POSSIBLE state'
                                },
                                PENDING: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for PENDING state'
                                },
                                BUSYPENDING: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for BUSYPENDING state'
                                },
                                BUSY: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for BUSY state'
                                }
                            },
                            additionalProperties: false,
                            description: 'Optional color overrides for display states'
                        },
                        event_time_color: {
                            type: 'object',
                            properties: {
                                '1': {
                                    type: ['array', 'null'],
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for events whose minute ends with 1 (null = use default)',
                                    default: null
                                },
                                '2': {
                                    type: ['array', 'null'],
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for events whose minute ends with 2 (null = use default)',
                                    default: null
                                },
                                '3': {
                                    type: ['array', 'null'],
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for events whose minute ends with 3 (null = use default)',
                                    default: null
                                },
                                '4': {
                                    type: ['array', 'null'],
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for events whose minute ends with 4 (null = use default)',
                                    default: null
                                }
                            },
                            additionalProperties: false,
                            description: 'Event time color overrides based on minute ending. Properties only exist when explicitly configured'
                        }
                    },
                    description: 'Serial output display'
                },
                homeassistant: {
                    type: 'object',
                    properties: {
                        brightness: {
                            type: 'number',
                            minimum: 0,
                            maximum: 1,
                            description: 'Brightness level override (0.0 - 1.0)'
                        },
                        entity_id: {
                            type: 'string',
                            description: 'Home Assistant device identifier'
                        },
                        token: {
                            type: 'string',
                            description: 'Authentication token for Home Assistant server'
                        },
                        url: {
                            type: 'string',
                            format: 'uri',
                            description: 'Home Assistant server URL'
                        },
                        colors: {
                            type: 'object',
                            properties: {
                                NONE: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for NONE state'
                                },
                                TESTING: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for TESTING state'
                                },
                                SETUP: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for SETUP state'
                                },
                                WAITING: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for WAITING state'
                                },
                                ERROR: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for ERROR state'
                                },
                                IDLE: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for IDLE state'
                                },
                                FREE: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for FREE state'
                                },
                                POSSIBLE: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for POSSIBLE state'
                                },
                                PENDING: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for PENDING state'
                                },
                                BUSYPENDING: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for BUSYPENDING state'
                                },
                                BUSY: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for BUSY state'
                                }
                            },
                            additionalProperties: false,
                            description: 'Optional color overrides for display states'
                        },
                        event_time_color: {
                            type: 'object',
                            properties: {
                                '1': {
                                    type: ['array', 'null'],
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for events whose minute ends with 1 (null = use default)',
                                    default: null
                                },
                                '2': {
                                    type: ['array', 'null'],
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for events whose minute ends with 2 (null = use default)',
                                    default: null
                                },
                                '3': {
                                    type: ['array', 'null'],
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for events whose minute ends with 3 (null = use default)',
                                    default: null
                                },
                                '4': {
                                    type: ['array', 'null'],
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for events whose minute ends with 4 (null = use default)',
                                    default: null
                                }
                            },
                            additionalProperties: false,
                            description: 'Event time color overrides based on minute ending. Properties only exist when explicitly configured'
                        }
                    },
                    description: 'Control Home Assistant device color'
                },
                onboard: {
                    type: 'object',
                    properties: {
                        brightness: {
                            type: 'number',
                            minimum: 0,
                            maximum: 1,
                            description: 'Brightness level override (0.0 - 1.0)'
                        },
                        colors: {
                            type: 'object',
                            properties: {
                                NONE: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for NONE state'
                                },
                                TESTING: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for TESTING state'
                                },
                                SETUP: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for SETUP state'
                                },
                                WAITING: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for WAITING state'
                                },
                                ERROR: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for ERROR state'
                                },
                                IDLE: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for IDLE state'
                                },
                                FREE: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for FREE state'
                                },
                                POSSIBLE: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for POSSIBLE state'
                                },
                                PENDING: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for PENDING state'
                                },
                                BUSYPENDING: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for BUSYPENDING state'
                                },
                                BUSY: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for BUSY state'
                                }
                            },
                            additionalProperties: false,
                            description: 'Optional color overrides for display states'
                        },
                        event_time_color: {
                            type: 'object',
                            properties: {
                                '1': {
                                    type: ['array', 'null'],
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for events whose minute ends with 1 (null = use default)',
                                    default: null
                                },
                                '2': {
                                    type: ['array', 'null'],
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for events whose minute ends with 2 (null = use default)',
                                    default: null
                                },
                                '3': {
                                    type: ['array', 'null'],
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for events whose minute ends with 3 (null = use default)',
                                    default: null
                                },
                                '4': {
                                    type: ['array', 'null'],
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for events whose minute ends with 4 (null = use default)',
                                    default: null
                                }
                            },
                            additionalProperties: false,
                            description: 'Event time color overrides based on minute ending. Properties only exist when explicitly configured'
                        }
                    },
                    description: 'Onboard LED display'
                },
                wled: {
                    type: 'object',
                    properties: {
                        brightness: {
                            type: 'number',
                            minimum: 0,
                            maximum: 1,
                            description: 'Brightness level override (0.0 - 1.0)'
                        },
                        url: {
                            type: 'string',
                            format: 'uri',
                            description: 'Address for the WLED server JSON endpoint'
                        },
                        preset: {
                            type: 'integer',
                            minimum: 0,
                            description: 'WLED preset to use when free instead of color'
                        },
                        led_count: {
                            type: 'integer',
                            minimum: 1,
                            description: 'Number of LEDs to use with WLED'
                        },
                        show_dividers: {
                            type: 'boolean',
                            description: 'Show minute dividers as white LEDs'
                        },
                        colors: {
                            type: 'object',
                            properties: {
                                NONE: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for NONE state'
                                },
                                TESTING: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for TESTING state'
                                },
                                SETUP: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for SETUP state'
                                },
                                WAITING: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for WAITING state'
                                },
                                ERROR: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for ERROR state'
                                },
                                IDLE: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for IDLE state'
                                },
                                FREE: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for FREE state'
                                },
                                POSSIBLE: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for POSSIBLE state'
                                },
                                PENDING: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for PENDING state'
                                },
                                BUSYPENDING: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for BUSYPENDING state'
                                },
                                BUSY: {
                                    type: 'array',
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for BUSY state'
                                }
                            },
                            additionalProperties: false,
                            description: 'Optional color overrides for display states'
                        },
                        event_time_color: {
                            type: 'object',
                            properties: {
                                '1': {
                                    type: ['array', 'null'],
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for events whose minute ends with 1 (null = use default)',
                                    default: null
                                },
                                '2': {
                                    type: ['array', 'null'],
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for events whose minute ends with 2 (null = use default)',
                                    default: null
                                },
                                '3': {
                                    type: ['array', 'null'],
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for events whose minute ends with 3 (null = use default)',
                                    default: null
                                },
                                '4': {
                                    type: ['array', 'null'],
                                    items: { type: 'integer', minimum: 0, maximum: 255 },
                                    minItems: 3,
                                    maxItems: 3,
                                    description: 'RGB color for events whose minute ends with 4 (null = use default)',
                                    default: null
                                }
                            },
                            additionalProperties: false,
                            description: 'Event time color overrides based on minute ending. Properties only exist when explicitly configured'
                        }
                    },
                    description: 'WLED server display'
                },
                website: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Optional name for the website/server'
                        }
                    },
                    description: 'Website display - optional server name only'
                }
            }
        },
        calendars: {
            type: 'object',
            properties: {
                google: {
                    type: 'object',
                    properties: {
                        auth: {
                            type: 'object',
                            properties: {
                                access_token: {
                                    type: 'string',
                                    description: 'Google OAuth access token'
                                },
                                refresh_token: {
                                    type: 'string',
                                    description: 'Google OAuth refresh token'
                                }
                            },
                            description: 'Google OAuth authentication tokens'
                        },
                        calendars: {
                            type: 'array',
                            items: {
                                type: 'string',
                                format: 'email'
                            },
                            description: 'List of Google Calendar IDs to monitor',
                            default: []
                        }
                    },
                    description: 'Google Calendar configuration'
                },
                apple: {
                    type: 'object',
                    properties: {
                        auth: {
                            type: 'object',
                            properties: {
                                username: {
                                    type: 'string',
                                    description: 'Apple iCloud username/email'
                                },
                                password: {
                                    type: 'string',
                                    description: 'Apple iCloud App-Specific Password'
                                }
                            },
                            description: 'Apple Calendar CalDAV authentication credentials'
                        },
                        calendars: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'List of Apple Calendar names to monitor',
                            default: []
                        }
                    },
                    description: 'Apple Calendar configuration'
                },
                outlook: {
                    type: 'object',
                    properties: {
                        auth: {
                            type: 'object',
                            properties: {
                                access_token: {
                                    type: 'string',
                                    description: 'Outlook OAuth access token'
                                },
                                refresh_token: {
                                    type: 'string',
                                    description: 'Outlook OAuth refresh token'
                                }
                            },
                            description: 'Outlook OAuth authentication tokens'
                        },
                        calendars: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'List of Outlook Calendar IDs to monitor',
                            default: []
                        }
                    },
                    description: 'Outlook Calendar configuration'
                }
            },
            description: 'Calendar provider configurations',
            default: {}
        }
    },
    required: ['calendar_hour_start', 'calendar_hour_end', 'calendar_days', 'pending_time']
};
//# sourceMappingURL=schema.js.map