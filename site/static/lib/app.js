"use strict";
// Main application logic for BusyTime web configuration
// Handles form generation, file operations, and OAuth flow
// Configuration state
let currentConfig = null;
// Calendar colors from Google Calendar API
let calendarColors = null;
// Available display types (defines all possible displays)
const availableDisplays = {
    'onboard': 'Onboard LED',
    'bigstoplight': 'Big Stoplight',
    'console': 'Console Output',
    'homeassistant': 'Home Assistant',
    'wled': 'WLED Display'
};
// Default colors for display states
const defaultStateColors = {
    'NONE': [0, 0, 0], // Black
    'TESTING': [0, 255, 255], // Cyan
    'SETUP': [0, 0, 255], // Blue
    'WAITING': [210, 105, 30], // Chocolate
    'ERROR': [255, 255, 255], // White
    'IDLE': [0, 0, 0], // Black
    'FREE': [0, 255, 0], // Green
    'POSSIBLE': [238, 130, 238], // Violet
    'PENDING': [255, 255, 0], // Yellow
    'BUSYPENDING': [255, 120, 0], // Orange
    'BUSY': [255, 0, 0] // Red
};
// Default colors for event time colors
const defaultEventTimeColors = {
    '1': [222, 0, 222], // Magenta
    '2': [0, 222, 222], // Cyan
    '3': [222, 222, 222], // Light gray
    '4': [222, 222, 0] // Yellow
};
// Helper function to convert RGB array to hex string
function rgbToHex(rgb) {
    return '#' + rgb.map(c => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('');
}
// Helper function to convert hex string to RGB array
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [0, 0, 0];
}
// Helper function to create a color picker input
function createColorPicker(rgb, onChange) {
    const container = document.createElement('div');
    container.className = 'color-picker-container';
    const hiddenColorInput = document.createElement('input');
    hiddenColorInput.type = 'color';
    hiddenColorInput.value = rgbToHex(rgb);
    hiddenColorInput.style.display = 'none';
    const colorSquare = document.createElement('div');
    colorSquare.className = 'color-square clickable';
    colorSquare.style.backgroundColor = rgbToHex(rgb);
    colorSquare.title = 'Click to choose color';
    const hexDisplay = document.createElement('div');
    hexDisplay.className = 'hex-color-display';
    hexDisplay.textContent = rgbToHex(rgb);
    const updateDisplay = (newRgb) => {
        const hex = rgbToHex(newRgb);
        colorSquare.style.backgroundColor = hex;
        hexDisplay.textContent = hex;
        hiddenColorInput.value = hex;
        onChange(newRgb);
    };
    colorSquare.addEventListener('click', () => hiddenColorInput.click());
    hiddenColorInput.addEventListener('change', () => {
        const newRgb = hexToRgb(hiddenColorInput.value);
        updateDisplay(newRgb);
    });
    container.appendChild(hiddenColorInput);
    container.appendChild(colorSquare);
    container.appendChild(hexDisplay);
    return container;
}
// Helper function to create color state management UI
function createColorStateManager(displayKey, displayData, isEventTimeColor = false) {
    const container = document.createElement('div');
    container.className = `color-manager ${isEventTimeColor ? 'event-time-colors' : 'state-colors'}`;
    const title = document.createElement('h4');
    title.textContent = isEventTimeColor ? 'Event Time Colors' : 'State Colors';
    container.appendChild(title);
    // Ensure display data exists in currentConfig
    if (!currentConfig.displays[displayKey]) {
        currentConfig.displays[displayKey] = {};
    }
    const colorsList = document.createElement('div');
    colorsList.className = 'colors-list';
    // Check if this is the default display for special event time color behavior
    const isDefaultEventTimeColor = isEventTimeColor && displayKey === 'default';
    const updateColorsList = () => {
        colorsList.innerHTML = '';
        const currentColors = isEventTimeColor
            ? (currentConfig.displays[displayKey]?.event_time_color || {})
            : (currentConfig.displays[displayKey]?.colors || {});
        let keysToProcess;
        if (isEventTimeColor) {
            // For event time colors, only show keys that actually exist (have been added)
            keysToProcess = Object.keys(currentColors);
        }
        else {
            // For state colors, only show configured ones
            keysToProcess = Object.keys(currentColors);
        }
        keysToProcess.forEach((key) => {
            const colorData = currentColors[key];
            const colorItem = document.createElement('div');
            colorItem.className = 'color-item';
            const label = document.createElement('label');
            if (isDefaultEventTimeColor) {
                label.textContent = `Minute ending in ${key}:`;
                // For default display event time colors, create more complex UI
                const configContainer = document.createElement('div');
                configContainer.className = 'event-time-config';
                // State override dropdown
                const stateContainer = document.createElement('div');
                stateContainer.className = 'state-override-container';
                const stateSelect = document.createElement('select');
                stateSelect.className = 'state-override-select';
                // Add default option for no override
                const defaultStateOption = document.createElement('option');
                defaultStateOption.value = '';
                defaultStateOption.textContent = 'Default';
                stateSelect.appendChild(defaultStateOption);
                // Add state options
                const stateOptions = ['NONE', 'TESTING', 'SETUP', 'WAITING', 'ERROR', 'IDLE', 'FREE', 'POSSIBLE', 'PENDING', 'BUSYPENDING', 'BUSY'];
                stateOptions.forEach(state => {
                    const option = document.createElement('option');
                    option.value = state;
                    option.textContent = state;
                    stateSelect.appendChild(option);
                });
                // Set current value
                const currentState = (typeof colorData === 'object' && colorData.state) ? colorData.state : null;
                stateSelect.value = currentState || '';
                stateSelect.addEventListener('change', (e) => {
                    const newState = e.target.value || null;
                    if (!currentConfig.displays[displayKey].event_time_color) {
                        currentConfig.displays[displayKey].event_time_color = {};
                    }
                    if (typeof currentConfig.displays[displayKey].event_time_color[key] !== 'object') {
                        currentConfig.displays[displayKey].event_time_color[key] = { state: null, color: null };
                    }
                    // Set the state
                    currentConfig.displays[displayKey].event_time_color[key].state = newState;
                    // Ensure color property exists
                    if (!currentConfig.displays[displayKey].event_time_color[key].hasOwnProperty('color')) {
                        currentConfig.displays[displayKey].event_time_color[key].color = null;
                    }
                    // If both state and color are null, remove the entire configuration
                    if (currentConfig.displays[displayKey].event_time_color[key].state === null &&
                        currentConfig.displays[displayKey].event_time_color[key].color === null) {
                        delete currentConfig.displays[displayKey].event_time_color[key];
                        if (Object.keys(currentConfig.displays[displayKey].event_time_color).length === 0) {
                            delete currentConfig.displays[displayKey].event_time_color;
                        }
                        updateColorsList();
                    }
                    enableSaveAsLink();
                });
                stateContainer.appendChild(stateSelect);
                // Color override section
                const colorContainer = document.createElement('div');
                colorContainer.className = 'color-override-container';
                const hasColorOverride = typeof colorData === 'object' && colorData.color;
                let colorPicker = null;
                const toggleColorOverride = (show) => {
                    if (show && !colorPicker) {
                        const currentColor = (typeof colorData === 'object' && colorData.color)
                            ? colorData.color
                            : defaultEventTimeColors[key] || [222, 0, 222];
                        colorPicker = createColorPicker(currentColor, (newRgb) => {
                            if (!currentConfig.displays[displayKey].event_time_color) {
                                currentConfig.displays[displayKey].event_time_color = {};
                            }
                            if (typeof currentConfig.displays[displayKey].event_time_color[key] !== 'object') {
                                currentConfig.displays[displayKey].event_time_color[key] = { state: null, color: null };
                            }
                            // Ensure both state and color are always present
                            currentConfig.displays[displayKey].event_time_color[key].color = newRgb;
                            if (!currentConfig.displays[displayKey].event_time_color[key].hasOwnProperty('state')) {
                                currentConfig.displays[displayKey].event_time_color[key].state = null;
                            }
                            enableSaveAsLink();
                        });
                        colorContainer.appendChild(colorPicker);
                        overrideText.style.display = 'none';
                    }
                    else if (!show && colorPicker) {
                        colorPicker.remove();
                        colorPicker = null;
                        overrideText.style.display = 'inline';
                        // Set color override to null
                        if (typeof currentConfig.displays[displayKey].event_time_color[key] === 'object') {
                            currentConfig.displays[displayKey].event_time_color[key].color = null;
                            // Ensure state is also present
                            if (!currentConfig.displays[displayKey].event_time_color[key].hasOwnProperty('state')) {
                                currentConfig.displays[displayKey].event_time_color[key].state = null;
                            }
                            // If both state and color are null, remove the entire configuration
                            if (currentConfig.displays[displayKey].event_time_color[key].state === null &&
                                currentConfig.displays[displayKey].event_time_color[key].color === null) {
                                delete currentConfig.displays[displayKey].event_time_color[key];
                                if (Object.keys(currentConfig.displays[displayKey].event_time_color).length === 0) {
                                    delete currentConfig.displays[displayKey].event_time_color;
                                }
                                updateColorsList();
                            }
                        }
                        enableSaveAsLink();
                    }
                };
                const overrideText = document.createElement('span');
                overrideText.textContent = 'add color';
                overrideText.className = 'override-color-text';
                overrideText.style.cursor = 'pointer';
                overrideText.style.textDecoration = 'underline';
                overrideText.addEventListener('click', () => {
                    toggleColorOverride(true);
                });
                colorContainer.appendChild(overrideText);
                // Initialize color override if it exists
                if (hasColorOverride) {
                    toggleColorOverride(true);
                }
                configContainer.appendChild(stateContainer);
                configContainer.appendChild(colorContainer);
                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '<span class="material-symbols-outlined">delete</span>';
                removeBtn.className = 'remove-color-btn';
                removeBtn.title = 'Remove';
                removeBtn.setAttribute('aria-label', 'Remove event time color configuration');
                removeBtn.addEventListener('click', () => {
                    // Delete the event time color configuration completely
                    delete currentConfig.displays[displayKey].event_time_color[key];
                    if (Object.keys(currentConfig.displays[displayKey].event_time_color).length === 0) {
                        delete currentConfig.displays[displayKey].event_time_color;
                    }
                    updateColorsList();
                    enableSaveAsLink();
                });
                colorItem.appendChild(label);
                colorItem.appendChild(configContainer);
                colorItem.appendChild(removeBtn);
            }
            else {
                // For non-default displays or state colors, use simple color picker
                label.textContent = isEventTimeColor ? `Minute ending in ${key}:` : `${key}:`;
                label.className = 'color-label';
                // Handle backward compatibility - colorData might be array or object
                const rgb = Array.isArray(colorData) ? colorData : (colorData?.color || [222, 0, 222]);
                const colorPicker = createColorPicker(rgb, (newRgb) => {
                    if (isEventTimeColor) {
                        if (!currentConfig.displays[displayKey].event_time_color)
                            currentConfig.displays[displayKey].event_time_color = {};
                        currentConfig.displays[displayKey].event_time_color[key] = newRgb;
                    }
                    else {
                        if (!currentConfig.displays[displayKey].colors)
                            currentConfig.displays[displayKey].colors = {};
                        currentConfig.displays[displayKey].colors[key] = newRgb;
                    }
                    enableSaveAsLink();
                });
                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '<span class="material-symbols-outlined">delete</span>Remove';
                removeBtn.className = 'remove-color-btn';
                removeBtn.addEventListener('click', () => {
                    if (isEventTimeColor) {
                        // Delete the event time color configuration completely
                        delete currentConfig.displays[displayKey].event_time_color[key];
                        if (Object.keys(currentConfig.displays[displayKey].event_time_color).length === 0) {
                            delete currentConfig.displays[displayKey].event_time_color;
                        }
                    }
                    else {
                        delete currentConfig.displays[displayKey].colors[key];
                        if (Object.keys(currentConfig.displays[displayKey].colors).length === 0) {
                            delete currentConfig.displays[displayKey].colors;
                        }
                    }
                    updateColorsList();
                    enableSaveAsLink();
                });
                colorItem.appendChild(label);
                colorItem.appendChild(colorPicker);
                colorItem.appendChild(removeBtn);
            }
            colorsList.appendChild(colorItem);
        });
    };
    const addButton = document.createElement('button');
    addButton.textContent = 'add';
    addButton.className = 'add-color-btn';
    addButton.addEventListener('click', () => {
        let availableOptions;
        let optionLabels;
        if (isEventTimeColor) {
            // For event time colors (both default and other displays), only allow minute endings
            availableOptions = ['1', '2', '3', '4'];
            optionLabels = {
                '1': 'Minute ending in 1',
                '2': 'Minute ending in 2',
                '3': 'Minute ending in 3',
                '4': 'Minute ending in 4'
            };
        }
        else {
            availableOptions = ['NONE', 'TESTING', 'SETUP', 'WAITING', 'ERROR', 'IDLE', 'FREE', 'POSSIBLE', 'PENDING', 'BUSYPENDING', 'BUSY'];
            optionLabels = {
                'NONE': 'None',
                'TESTING': 'Testing',
                'SETUP': 'Setup',
                'WAITING': 'Waiting',
                'ERROR': 'Error',
                'IDLE': 'Idle',
                'FREE': 'Free',
                'POSSIBLE': 'Possible',
                'PENDING': 'Pending',
                'BUSYPENDING': 'Busy Pending',
                'BUSY': 'Busy'
            };
        }
        const currentColors = isEventTimeColor
            ? (currentConfig.displays[displayKey]?.event_time_color || {})
            : (currentConfig.displays[displayKey]?.colors || {});
        const available = availableOptions.filter(key => !currentColors[key]);
        if (available.length === 0) {
            alert(isEventTimeColor ? 'All event time colors are already configured.' : 'All state colors are already configured.');
            return;
        }
        // Create dropdown for selection
        const dialog = document.createElement('div');
        dialog.className = 'color-selection-dialog';
        const select = document.createElement('select');
        select.className = 'color-state-select';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = `Select ${isEventTimeColor ? 'event time' : 'state'} to configure...`;
        select.appendChild(defaultOption);
        available.forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = optionLabels[key] || key;
            select.appendChild(option);
        });
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'dialog-buttons';
        const addBtn = document.createElement('button');
        addBtn.textContent = 'Add';
        addBtn.addEventListener('click', () => {
            const selectedKey = select.value;
            if (selectedKey) {
                if (isEventTimeColor) {
                    if (!currentConfig.displays[displayKey].event_time_color) {
                        currentConfig.displays[displayKey].event_time_color = {};
                    }
                    if (isDefaultEventTimeColor) {
                        // For default display, create object structure with both state and color always present
                        currentConfig.displays[displayKey].event_time_color[selectedKey] = {
                            state: null,
                            color: null
                        };
                    }
                    else {
                        // For other displays, use simple color array
                        currentConfig.displays[displayKey].event_time_color[selectedKey] = defaultEventTimeColors[selectedKey] || [222, 0, 222];
                    }
                }
                else {
                    if (!currentConfig.displays[displayKey].colors) {
                        currentConfig.displays[displayKey].colors = {};
                    }
                    currentConfig.displays[displayKey].colors[selectedKey] = defaultStateColors[selectedKey] || [255, 255, 255];
                }
                updateColorsList();
                enableSaveAsLink();
                dialog.remove();
            }
        });
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => dialog.remove());
        buttonContainer.appendChild(addBtn);
        buttonContainer.appendChild(cancelBtn);
        dialog.appendChild(select);
        dialog.appendChild(buttonContainer);
        container.appendChild(dialog);
        select.focus();
    });
    container.appendChild(addButton);
    container.appendChild(colorsList);
    updateColorsList();
    return container;
}
// Helper function to create tooltip
function createTooltip(text) {
    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip';
    tooltip.textContent = '?';
    tooltip.title = text;
    return tooltip;
}
// Helper function to create tooltip with clickable link
function createTooltipWithLink(text, url) {
    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip tooltip-clickable';
    tooltip.textContent = '?';
    tooltip.title = `${text} - Click to open documentation`;
    tooltip.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(url, '_blank');
    });
    return tooltip;
}
// Helper function to create brightness slider
function createBrightnessSlider(displayKey, settingKey, currentValue) {
    const container = document.createElement('div');
    container.className = 'brightness-slider-container';
    // Convert from 0.0-1.0 to 0-100 for display
    const displayValue = Math.round(currentValue * 100);
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'brightness-slider';
    slider.min = '0';
    slider.max = '100';
    slider.step = '1';
    slider.value = displayValue.toString();
    // Create value display
    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'brightness-value-display';
    valueDisplay.textContent = `${displayValue}%`;
    // Create tick marks container
    const ticksContainer = document.createElement('div');
    ticksContainer.className = 'brightness-ticks';
    // Add notable tick marks at 25%, 50%, 75%
    [25, 50, 75].forEach(tick => {
        const tickMark = document.createElement('div');
        tickMark.className = 'brightness-tick';
        tickMark.style.left = `${tick}%`;
        tickMark.setAttribute('data-value', `${tick}%`);
        ticksContainer.appendChild(tickMark);
    });
    const updateDisplay = (value) => {
        valueDisplay.textContent = `${value}%`;
        // Update tick mark visibility based on slider position
        const ticks = ticksContainer.querySelectorAll('.brightness-tick');
        ticks.forEach((tick) => {
            const tickElement = tick;
            const tickValue = parseInt(tickElement.getAttribute('data-value') || '0');
            if (Math.abs(value - tickValue) < 3) {
                tickElement.classList.add('highlight');
            }
            else {
                tickElement.classList.remove('highlight');
            }
        });
    };
    slider.addEventListener('input', (e) => {
        const sliderValue = parseInt(e.target.value);
        updateDisplay(sliderValue);
        // Convert back to 0.0-1.0 for storage, ensuring it's always a float with proper precision
        const configValue = parseFloat((sliderValue / 100).toFixed(2));
        if (!currentConfig.displays[displayKey])
            currentConfig.displays[displayKey] = {};
        currentConfig.displays[displayKey][settingKey] = configValue;
        enableSaveAsLink();
    });
    slider.addEventListener('change', (e) => {
        // Final change event for any cleanup
        const sliderValue = parseInt(e.target.value);
        const configValue = parseFloat((sliderValue / 100).toFixed(2));
        if (!currentConfig.displays[displayKey])
            currentConfig.displays[displayKey] = {};
        currentConfig.displays[displayKey][settingKey] = configValue;
        enableSaveAsLink();
    });
    // Initialize tick mark highlighting
    updateDisplay(displayValue);
    container.appendChild(slider);
    container.appendChild(valueDisplay);
    container.appendChild(ticksContainer);
    return container;
}
// Helper function to create time select dropdown
function createTimeSelect(key, data, prop) {
    const select = document.createElement('select');
    select.className = 'time-select inline-time-select';
    // Generate options for each hour in 12-hour format
    for (let i = 0; i <= 23; i++) {
        const option = document.createElement('option');
        option.value = i.toString();
        // Convert to 12-hour format
        const hour12 = i === 0 ? 12 : (i > 12 ? i - 12 : i);
        const ampm = i < 12 ? 'AM' : 'PM';
        option.textContent = `${hour12}:00 ${ampm}`;
        // For calendar_hour_end, allow 24 (12 AM next day)
        if (key === 'calendar_hour_end' && i === 0) {
            option.textContent = '12:00 AM (next day)';
        }
        select.appendChild(option);
    }
    // Add extra option for calendar_hour_end to allow 24
    if (key === 'calendar_hour_end') {
        const option = document.createElement('option');
        option.value = '24';
        option.textContent = '12:00 AM (next day)';
        select.appendChild(option);
    }
    const value = data[key] !== undefined ? data[key] : (prop?.default !== undefined ? prop.default : '');
    select.value = value.toString();
    select.addEventListener('change', (e) => {
        currentConfig[key] = Number(e.target.value);
        enableSaveAsLink();
    });
    return select;
}
// Helper function to render display settings
function renderDisplaySettings(container, displayKey, displayData, isDefault = false) {
    const displaySchema = schema.properties.displays.properties[displayKey];
    if (!displaySchema || !displaySchema.properties)
        return;
    const displaySection = document.createElement('div');
    displaySection.className = 'display-section';
    const header = document.createElement('div');
    header.className = 'display-header';
    const titleContainer = document.createElement('div');
    titleContainer.className = 'display-title-container';
    const title = document.createElement('h3');
    title.textContent = isDefault ? 'Default Display Settings' : (availableDisplays[displayKey] || displayKey);
    titleContainer.appendChild(title);
    // Add specific tooltips for certain display types
    if (!isDefault) {
        if (displayKey === 'homeassistant') {
            const tooltip = createTooltipWithLink('Home Assistant is an open source home automation platform. Configure entity control via REST API.', 'https://www.home-assistant.io/');
            titleContainer.appendChild(tooltip);
        }
        else if (displayKey === 'wled') {
            const tooltip = createTooltipWithLink('WLED is a fast and feature-rich implementation of an ESP8266/ESP32 webserver to control NeoPixel (WS2812B, WS2811, SK6812) LEDs.', 'https://kno.wled.ge/');
            titleContainer.appendChild(tooltip);
        }
    }
    header.appendChild(titleContainer);
    if (displaySchema.description) {
        const description = document.createElement('p');
        description.className = 'display-description';
        description.textContent = displaySchema.description;
        header.appendChild(description);
    }
    // Add remove button for non-default displays
    if (!isDefault) {
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove Display';
        removeBtn.className = 'remove-display-btn';
        removeBtn.addEventListener('click', () => {
            delete currentConfig.displays[displayKey];
            renderDisplaysSection();
            // Update the save link with the new configuration
            enableSaveAsLink();
        });
        header.appendChild(removeBtn);
    }
    displaySection.appendChild(header);
    const settingsContainer = document.createElement('div');
    settingsContainer.className = 'display-settings';
    // Render each setting for this display
    Object.entries(displaySchema.properties).forEach(([settingKey, settingProp]) => {
        // Skip colors and event_time_color - they'll be handled separately
        if (settingKey === 'colors' || settingKey === 'event_time_color') {
            return;
        }
        const settingWrapper = document.createElement('div');
        settingWrapper.className = 'form-group';
        const labelContainer = document.createElement('div');
        labelContainer.className = 'label-container';
        const label = document.createElement('label');
        label.textContent = settingKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        labelContainer.appendChild(label);
        // Add tooltip next to the label if there's a description OR special handling for token
        if (displayKey === 'homeassistant' && settingKey === 'token') {
            // For Home Assistant token, use the clickable tooltip with documentation link
            const tokenTooltip = createTooltipWithLink('Home Assistant Long-Lived Access Token for API authentication', 'https://developers.home-assistant.io/docs/auth_api/#long-lived-access-token');
            labelContainer.appendChild(tokenTooltip);
        }
        else if (settingProp.description) {
            const tooltip = createTooltip(settingProp.description);
            labelContainer.appendChild(tooltip);
        }
        settingWrapper.appendChild(labelContainer);
        let input;
        const currentValue = displayData?.[settingKey];
        // Special handling for brightness fields - use slider
        if (settingKey === 'brightness') {
            const brightnessValue = currentValue !== undefined ? currentValue : (settingProp.default !== undefined ? settingProp.default : 1.0);
            input = createBrightnessSlider(displayKey, settingKey, brightnessValue);
        }
        else {
            switch (settingProp.type) {
                case 'boolean':
                    settingWrapper.className = 'form-group checkbox-group';
                    input = document.createElement('input');
                    input.setAttribute('type', 'checkbox');
                    input.setAttribute('id', `checkbox-${displayKey}-${settingKey}`);
                    input.checked = currentValue !== undefined ? currentValue : (settingProp.default || false);
                    label.setAttribute('for', `checkbox-${displayKey}-${settingKey}`);
                    input.addEventListener('change', (e) => {
                        if (!currentConfig.displays[displayKey])
                            currentConfig.displays[displayKey] = {};
                        currentConfig.displays[displayKey][settingKey] = e.target.checked;
                        enableSaveAsLink();
                    });
                    break;
                case 'number':
                    input = document.createElement('input');
                    input.setAttribute('type', 'number');
                    input.setAttribute('step', '0.1');
                    if (settingProp.minimum !== undefined)
                        input.setAttribute('min', settingProp.minimum.toString());
                    if (settingProp.maximum !== undefined)
                        input.setAttribute('max', settingProp.maximum.toString());
                    input.value = currentValue !== undefined ? currentValue.toString() : (settingProp.default?.toString() || '');
                    input.addEventListener('change', (e) => {
                        if (!currentConfig.displays[displayKey])
                            currentConfig.displays[displayKey] = {};
                        let value = Number(e.target.value);
                        // Ensure brightness is always saved as a float (e.g., 1.0 instead of 1)
                        if (settingKey === 'brightness' && Number.isInteger(value)) {
                            value = parseFloat(value.toFixed(1));
                        }
                        currentConfig.displays[displayKey][settingKey] = value;
                        enableSaveAsLink();
                    });
                    break;
                case 'integer':
                    input = document.createElement('input');
                    input.setAttribute('type', 'number');
                    input.setAttribute('step', '1');
                    if (settingProp.minimum !== undefined)
                        input.setAttribute('min', settingProp.minimum.toString());
                    if (settingProp.maximum !== undefined)
                        input.setAttribute('max', settingProp.maximum.toString());
                    input.value = currentValue !== undefined ? currentValue.toString() : (settingProp.default?.toString() || '');
                    input.addEventListener('change', (e) => {
                        if (!currentConfig.displays[displayKey])
                            currentConfig.displays[displayKey] = {};
                        currentConfig.displays[displayKey][settingKey] = Number(e.target.value);
                        enableSaveAsLink();
                    });
                    break;
                default:
                    input = document.createElement('input');
                    input.setAttribute('type', 'text');
                    input.value = currentValue !== undefined ? currentValue.toString() : (settingProp.default?.toString() || '');
                    input.addEventListener('change', (e) => {
                        if (!currentConfig.displays[displayKey])
                            currentConfig.displays[displayKey] = {};
                        currentConfig.displays[displayKey][settingKey] = e.target.value;
                        enableSaveAsLink();
                    });
            }
        }
        settingWrapper.appendChild(input);
        settingsContainer.appendChild(settingWrapper);
    }); // Create bottom row container for color managers
    const bottomRowContainer = document.createElement('div');
    bottomRowContainer.className = 'color-managers-bottom-row';
    // Add color management UI as bottom row if the schema supports it
    if (displaySchema.properties.colors) {
        const stateColorsManager = createColorStateManager(displayKey, currentConfig.displays[displayKey] || {}, false);
        bottomRowContainer.appendChild(stateColorsManager);
    }
    if (displaySchema.properties.event_time_color) {
        const eventTimeColorsManager = createColorStateManager(displayKey, currentConfig.displays[displayKey] || {}, true);
        bottomRowContainer.appendChild(eventTimeColorsManager);
    }
    // Only add the bottom row container if it has color managers
    if (bottomRowContainer.children.length > 0) {
        settingsContainer.appendChild(bottomRowContainer);
    }
    displaySection.appendChild(settingsContainer);
    container.appendChild(displaySection);
}
// Helper function to check if WiFi is configured
function hasWiFiConfigured() {
    return currentConfig && currentConfig.wifis && Object.keys(currentConfig.wifis).length > 0;
}
// Helper function to check and show next sections after WiFi changes
async function checkAndShowNextSections() {
    // OAuth section should always remain visible once shown
    // Only control the main settings based on WiFi configuration
    const mainSettings = document.getElementById('main-settings');
    if (hasWiFiConfigured()) {
        // Check if we have any calendar auth to show main settings
        const hasGoogleAuth = currentConfig?.calendars?.google?.auth?.access_token && currentConfig?.calendars?.google?.auth?.refresh_token;
        const hasAppleAuth = currentConfig?.calendars?.apple?.auth?.username && currentConfig?.calendars?.apple?.auth?.password;
        if (hasGoogleAuth || hasAppleAuth) {
            // Re-render the form to show the full configuration now that WiFi is configured
            const formElement = document.getElementById('config-form');
            if (formElement) {
                renderForm(formElement, currentConfig);
            }
            // Update auth status to properly show main settings
            await updateAuthStatus();
            // Fetch calendars to ensure they're displayed
            if (hasGoogleAuth) {
                await fetchGoogleCalendars();
            }
            if (hasAppleAuth) {
                await fetchAppleCalendars();
            }
            const hasOutlookAuth = currentConfig?.calendars?.outlook?.auth?.access_token && currentConfig?.calendars?.outlook?.auth?.refresh_token;
            if (hasOutlookAuth) {
                await fetchOutlookCalendars();
            }
        }
    }
    else {
        // When no WiFi configured, still show main settings but only with WiFi section
        const hasGoogleAuth = currentConfig?.calendars?.google?.auth?.access_token && currentConfig?.calendars?.google?.auth?.refresh_token;
        const hasAppleAuth = currentConfig?.calendars?.apple?.auth?.username && currentConfig?.calendars?.apple?.auth?.password;
        const hasOutlookAuth = currentConfig?.calendars?.outlook?.auth?.access_token && currentConfig?.calendars?.outlook?.auth?.refresh_token;
        if (hasGoogleAuth || hasAppleAuth || hasOutlookAuth) {
            // Keep main settings visible but re-render form to show only WiFi section
            if (mainSettings) {
                mainSettings.style.display = 'block';
            }
            const formElement = document.getElementById('config-form');
            if (formElement) {
                renderForm(formElement, currentConfig); // This will show WiFi + "add WiFi to continue" message
            }
            // Update auth status
            await updateAuthStatus();
            // Fetch calendars to ensure they're displayed
            if (hasGoogleAuth) {
                await fetchGoogleCalendars();
            }
            if (hasAppleAuth) {
                await fetchAppleCalendars();
            }
            if (hasOutlookAuth) {
                await fetchOutlookCalendars();
            }
        }
        else {
            // Hide main settings if no calendar auth at all
            if (mainSettings) {
                mainSettings.style.display = 'none';
            }
        }
    }
}
// Function to render the WiFi section
function renderWiFiSection() {
    const existingSection = document.querySelector('.wifi-section');
    if (existingSection) {
        existingSection.remove();
    }
    const formContainer = document.getElementById('config-form');
    if (!formContainer)
        return;
    const wifiSection = document.createElement('section');
    wifiSection.className = 'wifi-section';
    const sectionTitle = document.createElement('h2');
    sectionTitle.textContent = 'Wifis';
    wifiSection.appendChild(sectionTitle);
    const wifiContainer = document.createElement('div');
    wifiContainer.className = 'wifi-container';
    // Ensure wifis object exists
    if (!currentConfig.wifis) {
        currentConfig.wifis = {};
    }
    // Add WiFi button
    const addWifiBtn = document.createElement('button');
    addWifiBtn.textContent = 'Add WiFi Network';
    addWifiBtn.className = 'add-wifi-btn';
    addWifiBtn.addEventListener('click', () => {
        const wifiDialog = document.createElement('div');
        wifiDialog.className = 'wifi-dialog';
        const apInput = document.createElement('input');
        apInput.setAttribute('type', 'text');
        apInput.setAttribute('placeholder', 'WiFi Network Name (SSID)');
        apInput.className = 'wifi-input';
        // Create container for password input and toggle button
        const pwContainer = document.createElement('div');
        pwContainer.className = 'wifi-password-container';
        const pwInput = document.createElement('input');
        pwInput.setAttribute('type', 'text'); // Visible by default when adding
        pwInput.setAttribute('placeholder', 'Password');
        pwInput.className = 'wifi-input wifi-password';
        // Show/hide password toggle for new WiFi dialog
        const pwToggleBtn = document.createElement('button');
        pwToggleBtn.innerHTML = '<span class="material-symbols-outlined">visibility_off</span>';
        pwToggleBtn.className = 'toggle-password';
        pwToggleBtn.title = 'Hide password';
        pwToggleBtn.setAttribute('aria-label', 'Hide password');
        pwToggleBtn.type = 'button'; // Prevent form submission
        pwToggleBtn.addEventListener('click', () => {
            const isVisible = pwInput.type === 'text';
            pwInput.type = isVisible ? 'password' : 'text';
            if (isVisible) {
                pwToggleBtn.innerHTML = '<span class="material-symbols-outlined">visibility</span>';
                pwToggleBtn.title = 'Show password';
                pwToggleBtn.setAttribute('aria-label', 'Show password');
            }
            else {
                pwToggleBtn.innerHTML = '<span class="material-symbols-outlined">visibility_off</span>';
                pwToggleBtn.title = 'Hide password';
                pwToggleBtn.setAttribute('aria-label', 'Hide password');
            }
        });
        pwContainer.appendChild(pwInput);
        pwContainer.appendChild(pwToggleBtn);
        const btnContainer = document.createElement('div');
        btnContainer.className = 'wifi-dialog-buttons';
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.addEventListener('click', () => {
            if (apInput.value) {
                currentConfig.wifis[apInput.value] = pwInput.value;
                wifiDialog.remove();
                renderWiFiSection(); // Re-render just the WiFi section
                // Check if this is the first WiFi and show OAuth section if needed
                void checkAndShowNextSections();
                enableSaveAsLink();
            }
        });
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => wifiDialog.remove());
        btnContainer.appendChild(saveBtn);
        btnContainer.appendChild(cancelBtn);
        wifiDialog.appendChild(apInput);
        wifiDialog.appendChild(pwContainer);
        wifiDialog.appendChild(btnContainer);
        wifiContainer.appendChild(wifiDialog);
        apInput.focus();
    });
    wifiContainer.appendChild(addWifiBtn);
    // Render existing WiFi networks
    Object.entries(currentConfig.wifis || {}).forEach(([ssid, password]) => {
        const wifiEntry = document.createElement('div');
        wifiEntry.className = 'wifi-entry';
        // SSID display
        const ssidLabel = document.createElement('div');
        ssidLabel.textContent = 'Network Name (SSID):';
        ssidLabel.className = 'wifi-label';
        const ssidDisplay = document.createElement('input');
        ssidDisplay.setAttribute('type', 'text');
        ssidDisplay.value = ssid;
        ssidDisplay.readOnly = true;
        ssidDisplay.className = 'wifi-ssid';
        // Password input
        const passwordLabel = document.createElement('div');
        passwordLabel.textContent = 'Password:';
        passwordLabel.className = 'wifi-label';
        // Create container for password input and toggle button
        const passwordContainer = document.createElement('div');
        passwordContainer.className = 'wifi-password-container';
        const passwordInput = document.createElement('input');
        passwordInput.setAttribute('type', 'password');
        passwordInput.value = password;
        passwordInput.className = 'wifi-password';
        passwordInput.addEventListener('change', (e) => {
            currentConfig.wifis[ssid] = e.target.value;
            enableSaveAsLink();
        });
        // Show/hide password toggle
        const toggleBtn = document.createElement('button');
        toggleBtn.innerHTML = '<span class="material-symbols-outlined">visibility</span>';
        toggleBtn.className = 'toggle-password';
        toggleBtn.title = 'Show password';
        toggleBtn.setAttribute('aria-label', 'Show password');
        toggleBtn.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            if (isPassword) {
                toggleBtn.innerHTML = '<span class="material-symbols-outlined">visibility_off</span>';
                toggleBtn.title = 'Hide password';
                toggleBtn.setAttribute('aria-label', 'Hide password');
            }
            else {
                toggleBtn.innerHTML = '<span class="material-symbols-outlined">visibility</span>';
                toggleBtn.title = 'Show password';
                toggleBtn.setAttribute('aria-label', 'Show password');
            }
        });
        passwordContainer.appendChild(passwordInput);
        passwordContainer.appendChild(toggleBtn);
        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove Network';
        removeBtn.className = 'remove-btn';
        removeBtn.addEventListener('click', () => {
            delete currentConfig.wifis[ssid];
            renderWiFiSection(); // Re-render just the WiFi section
            // Check if we should hide sections when no WiFi is left
            void checkAndShowNextSections();
            enableSaveAsLink();
        });
        wifiEntry.appendChild(ssidLabel);
        wifiEntry.appendChild(ssidDisplay);
        wifiEntry.appendChild(passwordLabel);
        wifiEntry.appendChild(passwordContainer);
        wifiEntry.appendChild(removeBtn);
        wifiContainer.appendChild(wifiEntry);
    });
    wifiSection.appendChild(wifiContainer);
    // Insert WiFi section at the top of the form container
    if (formContainer.firstChild) {
        formContainer.insertBefore(wifiSection, formContainer.firstChild);
    }
    else {
        formContainer.appendChild(wifiSection);
    }
}
// Function to render the displays section
function renderDisplaysSection() {
    const existingSection = document.querySelector('.displays-section');
    if (existingSection) {
        existingSection.remove();
    }
    const formContainer = document.getElementById('config-form');
    if (!formContainer)
        return;
    const displaysSection = document.createElement('section');
    displaysSection.className = 'displays-section';
    const sectionTitle = document.createElement('h2');
    sectionTitle.textContent = 'Displays';
    displaysSection.appendChild(sectionTitle);
    const displaysContainer = document.createElement('div');
    displaysContainer.className = 'displays-container';
    // Ensure displays object exists
    if (!currentConfig.displays) {
        currentConfig.displays = {};
    }
    // Ensure default display settings exist
    if (!currentConfig.displays.default) {
        currentConfig.displays.default = {
            brightness: 1.0,
            use_calendar_colors: false
        };
    }
    // Always render default display first
    renderDisplaySettings(displaysContainer, 'default', currentConfig.displays.default, true);
    // Render configured displays (except default)
    Object.keys(currentConfig.displays).forEach(displayKey => {
        if (displayKey !== 'default') {
            renderDisplaySettings(displaysContainer, displayKey, currentConfig.displays[displayKey], false);
        }
    });
    // Add "Add Display" dropdown
    const addDisplayContainer = document.createElement('div');
    addDisplayContainer.className = 'add-display-container';
    const addDisplayLabel = document.createElement('label');
    addDisplayLabel.textContent = 'Add New Display:';
    addDisplayContainer.appendChild(addDisplayLabel);
    const addDisplaySelect = document.createElement('select');
    addDisplaySelect.className = 'add-display-select';
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a display to add...';
    addDisplaySelect.appendChild(defaultOption);
    // Add available displays that aren't already configured
    Object.entries(availableDisplays).forEach(([key, name]) => {
        if (!currentConfig.displays[key]) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = name;
            addDisplaySelect.appendChild(option);
        }
    });
    addDisplaySelect.addEventListener('change', (e) => {
        const selectedDisplay = e.target.value;
        if (selectedDisplay) {
            // Add the display with empty configuration
            currentConfig.displays[selectedDisplay] = {};
            // Re-render the displays section
            renderDisplaysSection();
            // Update the save link with the new configuration
            enableSaveAsLink();
        }
    });
    addDisplayContainer.appendChild(addDisplaySelect);
    displaysContainer.appendChild(addDisplayContainer);
    displaysSection.appendChild(displaysContainer);
    formContainer.appendChild(displaysSection);
}
// Helper function to create compact settings group
function createCompactSettingsGroup(data) {
    const compactSettingsGroup = document.createElement('div');
    compactSettingsGroup.className = 'compact-settings-group';
    // Time range container
    const timeRangeContainer = document.createElement('div');
    timeRangeContainer.className = 'time-range-container';
    const timeRangeLabel = document.createElement('label');
    timeRangeLabel.textContent = 'Calendar Hours';
    timeRangeContainer.appendChild(timeRangeLabel);
    const timeInputsContainer = document.createElement('div');
    timeInputsContainer.className = 'time-inputs-container';
    // Calendar hour start
    const startSelect = createTimeSelect('calendar_hour_start', data, schema.properties.calendar_hour_start);
    const startLabel = document.createElement('span');
    startLabel.textContent = 'Start:';
    startLabel.className = 'inline-label';
    // Calendar hour end
    const endSelect = createTimeSelect('calendar_hour_end', data, schema.properties.calendar_hour_end);
    const endLabel = document.createElement('span');
    endLabel.textContent = 'End:';
    endLabel.className = 'inline-label';
    timeInputsContainer.appendChild(startLabel);
    timeInputsContainer.appendChild(startSelect);
    timeInputsContainer.appendChild(endLabel);
    timeInputsContainer.appendChild(endSelect);
    timeRangeContainer.appendChild(timeInputsContainer);
    compactSettingsGroup.appendChild(timeRangeContainer);
    // Inline settings container for yellow time and test mode
    const inlineSettingsContainer = document.createElement('div');
    inlineSettingsContainer.className = 'inline-settings-container';
    // Yellow time inline
    const yellowTimeContainer = document.createElement('div');
    yellowTimeContainer.className = 'inline-setting';
    const yellowLabel = document.createElement('label');
    yellowLabel.textContent = 'Yellow Time (min):';
    yellowLabel.className = 'inline-label';
    const yellowInput = document.createElement('input');
    yellowInput.setAttribute('type', 'number');
    yellowInput.setAttribute('min', '1');
    yellowInput.setAttribute('max', '60');
    yellowInput.className = 'inline-input';
    const yellowValue = data['pending_time'] !== undefined ? data['pending_time'] : (schema.properties.pending_time?.default !== undefined ? schema.properties.pending_time.default : '');
    yellowInput.value = yellowValue.toString();
    yellowInput.addEventListener('change', (e) => {
        currentConfig['pending_time'] = Number(e.target.value);
        enableSaveAsLink();
    });
    if (schema.properties.pending_time?.description) {
        const yellowTooltip = createTooltip(schema.properties.pending_time.description);
        yellowLabel.appendChild(yellowTooltip);
    }
    yellowTimeContainer.appendChild(yellowLabel);
    yellowTimeContainer.appendChild(yellowInput);
    // Test mode inline
    const testModeContainer = document.createElement('div');
    testModeContainer.className = 'inline-setting';
    const testLabel = document.createElement('label');
    testLabel.textContent = 'Test Mode:';
    testLabel.className = 'inline-label';
    const testSelect = document.createElement('select');
    testSelect.className = 'time-select inline-time-select';
    // Create options for test_mode
    const testOptions = [
        { value: '', text: 'None', actualValue: null },
        { value: 'lights', text: 'Lights', actualValue: 'lights' },
        { value: 'calendar', text: 'Calendar', actualValue: 'calendar' }
    ];
    testOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        testSelect.appendChild(optionElement);
    });
    // Set initial value
    const testValue = data['test_mode'];
    if (testValue === null || testValue === undefined) {
        testSelect.value = '';
    }
    else {
        testSelect.value = testValue;
    }
    testSelect.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        currentConfig['test_mode'] = selectedValue === '' ? null : selectedValue;
        enableSaveAsLink();
    });
    if (schema.properties.test_mode?.description) {
        const testTooltip = createTooltip(schema.properties.test_mode.description);
        testLabel.appendChild(testTooltip);
    }
    testModeContainer.appendChild(testLabel);
    testModeContainer.appendChild(testSelect);
    inlineSettingsContainer.appendChild(yellowTimeContainer);
    inlineSettingsContainer.appendChild(testModeContainer);
    compactSettingsGroup.appendChild(inlineSettingsContainer);
    // Calendar days in compact two-row layout
    const calendarDaysContainer = document.createElement('div');
    calendarDaysContainer.className = 'compact-calendar-days';
    const daysLabel = document.createElement('label');
    daysLabel.textContent = 'Work Days';
    if (schema.properties.calendar_days?.description) {
        const daysTooltip = createTooltip(schema.properties.calendar_days.description);
        daysLabel.appendChild(daysTooltip);
    }
    calendarDaysContainer.appendChild(daysLabel);
    const daysGrid = document.createElement('div');
    daysGrid.className = 'days-grid';
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const values = data['calendar_days'] !== undefined ? data['calendar_days'] : (schema.properties.calendar_days?.default !== undefined ? schema.properties.calendar_days.default : []);
    days.forEach((day, index) => {
        const dayItem = document.createElement('div');
        dayItem.className = 'compact-day-item';
        const checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.id = `day-${index}`;
        checkbox.checked = values.includes(index);
        const label = document.createElement('label');
        label.htmlFor = `day-${index}`;
        label.textContent = day.substring(0, 3); // Show abbreviated day names for compactness
        checkbox.addEventListener('change', () => {
            if (!currentConfig['calendar_days'])
                currentConfig['calendar_days'] = [];
            if (checkbox.checked && !currentConfig['calendar_days'].includes(index)) {
                currentConfig['calendar_days'].push(index);
                currentConfig['calendar_days'].sort((a, b) => a - b);
            }
            else if (!checkbox.checked) {
                currentConfig['calendar_days'] = currentConfig['calendar_days'].filter((v) => v !== index);
            }
            enableSaveAsLink();
        });
        dayItem.appendChild(checkbox);
        dayItem.appendChild(label);
        daysGrid.appendChild(dayItem);
    });
    calendarDaysContainer.appendChild(daysGrid);
    compactSettingsGroup.appendChild(calendarDaysContainer);
    return compactSettingsGroup;
}
// Updated form generation function
function renderForm(container, data) {
    container.innerHTML = '';
    // Preserve existing Apple calendar selections before updating
    const existingAppleCalendars = currentConfig?.calendars?.apple?.calendars || [];
    currentConfig = { ...data };
    // Restore Apple calendar selections if they existed
    if (existingAppleCalendars.length > 0) {
        if (!currentConfig.calendars)
            currentConfig.calendars = {};
        if (!currentConfig.calendars.apple)
            currentConfig.calendars.apple = {};
        currentConfig.calendars.apple.calendars = [...existingAppleCalendars];
    }
    // Always render WiFi section first
    renderWiFiSection();
    // Only render other configuration sections if WiFi is configured
    if (!hasWiFiConfigured()) {
        // Add a message explaining what's needed
        const wifiRequiredMessage = document.createElement('div');
        wifiRequiredMessage.className = 'wifi-required-message';
        wifiRequiredMessage.innerHTML = '<p>Please add at least one WiFi network to continue with the rest of the configuration.</p>';
        container.appendChild(wifiRequiredMessage);
        return;
    }
    // Create compact settings group
    container.appendChild(createCompactSettingsGroup(data));
    // Create form elements for remaining properties  
    Object.entries(schema.properties).forEach(([key, prop]) => {
        // Skip displays, wifis, calendars and properties we handled above
        if (key === 'displays' || key === 'wifis' || key === 'calendars' ||
            key === 'calendar_hour_start' || key === 'calendar_hour_end' || key === 'pending_time' || key === 'test_mode' || key === 'calendar_days') {
            return;
        }
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';
        const labelContainer = document.createElement('div');
        labelContainer.className = 'label-container';
        const label = document.createElement('label');
        label.textContent = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        labelContainer.appendChild(label);
        // Add tooltip next to the label if there's a description
        if (prop.description) {
            const tooltip = createTooltip(prop.description);
            labelContainer.appendChild(tooltip);
        }
        wrapper.appendChild(labelContainer);
        let input;
        switch (prop.type) {
            case 'boolean':
                // For boolean inputs, use horizontal layout
                wrapper.className = 'form-group checkbox-group';
                input = document.createElement('input');
                input.setAttribute('type', 'checkbox');
                input.checked = data[key] || false;
                input.id = `checkbox-${key}`;
                label.setAttribute('for', `checkbox-${key}`);
                input.addEventListener('change', (e) => {
                    currentConfig[key] = e.target.checked;
                });
                break;
            case 'integer':
            case 'number':
                // Regular number input for non-time integers
                input = document.createElement('input');
                input.setAttribute('type', 'number');
                if (prop.minimum !== undefined)
                    input.setAttribute('min', prop.minimum.toString());
                if (prop.maximum !== undefined)
                    input.setAttribute('max', prop.maximum.toString());
                const value = data[key] !== undefined ? data[key] : (prop.default !== undefined ? prop.default : '');
                input.value = value.toString();
                input.addEventListener('change', (e) => {
                    currentConfig[key] = Number(e.target.value);
                });
                break;
            case 'array':
                input = document.createElement('div');
                input.className = 'array-input';
                // Default array handling for other arrays (calendar_days is handled in compact section)
                const items = data[key] || [];
                const itemList = document.createElement('div');
                items.forEach((item, index) => {
                    const itemRow = document.createElement('div');
                    itemRow.className = 'array-item';
                    const itemInput = document.createElement('input');
                    itemInput.setAttribute('type', 'text');
                    itemInput.value = item;
                    itemInput.addEventListener('change', (e) => {
                        currentConfig[key][index] = e.target.value;
                    });
                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = 'Remove';
                    removeBtn.addEventListener('click', () => {
                        currentConfig[key].splice(index, 1);
                        renderForm(container, currentConfig);
                    });
                    itemRow.appendChild(itemInput);
                    itemRow.appendChild(removeBtn);
                    itemList.appendChild(itemRow);
                });
                const addBtn = document.createElement('button');
                addBtn.textContent = 'Add Item';
                addBtn.addEventListener('click', () => {
                    if (!currentConfig[key])
                        currentConfig[key] = [];
                    currentConfig[key].push('');
                    renderForm(container, currentConfig);
                });
                input.appendChild(itemList);
                input.appendChild(addBtn);
                break;
            case 'object':
                input = document.createElement('div');
                input.className = 'object-input';
                if (!currentConfig[key])
                    currentConfig[key] = {};
                if (prop.properties) {
                    Object.entries(prop.properties).forEach(([subKey, subProp]) => {
                        const subWrapper = document.createElement('div');
                        subWrapper.className = 'form-group';
                        const subLabel = document.createElement('label');
                        subLabel.textContent = subKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        const subInput = document.createElement('input');
                        subInput.setAttribute('type', subProp.type === 'number' ? 'number' : 'text');
                        subInput.value = currentConfig[key][subKey] || '';
                        subInput.addEventListener('change', (e) => {
                            currentConfig[key][subKey] = e.target.value;
                        });
                        subWrapper.appendChild(subLabel);
                        subWrapper.appendChild(subInput);
                        input.appendChild(subWrapper);
                    });
                }
                else {
                    // Handle other objects with arbitrary properties
                    const addPropertyBtn = document.createElement('button');
                    addPropertyBtn.textContent = 'Add Property';
                    addPropertyBtn.addEventListener('click', () => {
                        const propertyKey = prompt('Enter property name:');
                        if (propertyKey) {
                            currentConfig[key][propertyKey] = '';
                            renderForm(container, currentConfig);
                        }
                    });
                    input.appendChild(addPropertyBtn);
                    Object.entries(currentConfig[key] || {}).forEach(([propKey, propValue]) => {
                        const propWrapper = document.createElement('div');
                        propWrapper.className = 'form-group';
                        const propLabel = document.createElement('label');
                        propLabel.textContent = propKey;
                        const propInput = document.createElement('input');
                        propInput.setAttribute('type', 'text');
                        propInput.value = propValue;
                        propWrapper.appendChild(propLabel);
                        propWrapper.appendChild(propInput);
                        propInput.addEventListener('change', (e) => {
                            currentConfig[key][propKey] = e.target.value;
                        });
                        const removeBtn = document.createElement('button');
                        removeBtn.textContent = 'Remove';
                        removeBtn.className = 'remove-btn';
                        removeBtn.addEventListener('click', () => {
                            delete currentConfig[key][propKey];
                            renderForm(container, currentConfig);
                        });
                        propWrapper.appendChild(removeBtn);
                        input.appendChild(propWrapper);
                    });
                }
                break;
            default:
                input = document.createElement('input');
                input.setAttribute('type', 'text');
                input.value = data[key] || '';
                input.addEventListener('change', (e) => {
                    currentConfig[key] = e.target.value;
                });
        }
        wrapper.appendChild(input);
        container.appendChild(wrapper);
    });
    // Render displays section after other form elements (only if WiFi is configured)
    renderDisplaysSection();
    // Enable right-click "Save link as" functionality
    setTimeout(() => enableSaveAsLink(), 100);
}
// Google OAuth configuration
const googleConfig = {
    clientId: ENV_CONFIG.googleClientId,
    clientTerces: ENV_CONFIG.googleClientTerces,
    get clientSecret() {
        return ENV_CONFIG.decodeValue(this.clientTerces);
    },
    scope: 'https://www.googleapis.com/auth/calendar.readonly'
};
const authState = {
    deviceCode: null,
    pollInterval: 5,
    pollTimeout: 120
};
// Outlook OAuth configuration
const outlookConfig = {
    clientId: ENV_CONFIG.outlookClientId,
    clientTerces: ENV_CONFIG.outlookClientTerces,
    get clientSecret() {
        return ENV_CONFIG.decodeValue(this.clientTerces);
    },
    scope: 'https://graph.microsoft.com/Calendars.Read offline_access',
    authEndpoint: 'https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize',
    tokenEndpoint: 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token'
};
const outlookAuthState = {
    codeVerifier: null,
    pollTimeout: 120
};
// Initialize the application
// Using a combination of DOMContentLoaded and a ready check to avoid race conditions
let isInitialized = false;
function initializeApp() {
    // Prevent double initialization
    if (isInitialized) {
        return;
    }
    // Check if critical elements exist before initializing
    const newConfigButton = document.getElementById('new-config');
    const loadExistingButton = document.getElementById('load-existing');
    if (!newConfigButton || !loadExistingButton) {
        // Elements not ready yet, retry after a short delay
        console.log('BusyTime: Buttons not ready, retrying initialization...');
        setTimeout(initializeApp, 50);
        return;
    }
    isInitialized = true;
    console.log('BusyTime: Initializing application...');
    setupUI();
    setupOAuthHandlers();
    setupInitialChoiceHandlers();
    // Check for OAuth callback (this will handle the redirect from Google if using redirect flow)
    void checkForOAuthCallback();
    // Note: Outlook now uses popup window like Google, so no need to check for redirect callback
    // Setup save button handlers with universal right-click support
    const saveButton = document.getElementById('save-config');
    if (saveButton) {
        saveButton.addEventListener('click', (event) => {
            event.preventDefault();
            saveConfiguration(currentConfig);
        });
    }
    console.log('BusyTime: Application initialized successfully');
}
// Initialize when DOM is ready - use multiple strategies for compatibility
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
}
else {
    // DOM is already ready, initialize immediately
    initializeApp();
}
// Also try with window.load as a fallback for some environments
window.addEventListener('load', () => {
    if (!isInitialized) {
        console.log('BusyTime: Initializing via window load event');
        initializeApp();
    }
});
// UI Setup
function setupUI() {
    // Hide main settings and OAuth initially - only show after choice is made
    const mainSettings = document.getElementById('main-settings');
    const oauthSection = document.querySelector('.oauth-setup');
    if (mainSettings)
        mainSettings.style.display = 'none';
    if (oauthSection)
        oauthSection.style.display = 'none';
}
// Setup handlers for initial choice buttons
function setupInitialChoiceHandlers() {
    const newConfigButton = document.getElementById('new-config');
    const loadExistingButton = document.getElementById('load-existing');
    const restartButton = document.getElementById('restart-button');
    const hiddenFileInput = document.getElementById('load-config');
    console.log('BusyTime: Setting up initial choice handlers', {
        newConfigButton: !!newConfigButton,
        loadExistingButton: !!loadExistingButton,
        restartButton: !!restartButton,
        hiddenFileInput: !!hiddenFileInput
    });
    if (newConfigButton) {
        newConfigButton.addEventListener('click', handleNewConfigChoice);
    }
    if (loadExistingButton) {
        loadExistingButton.addEventListener('click', () => {
            if (hiddenFileInput) {
                hiddenFileInput.click();
            }
        });
    }
    if (restartButton) {
        restartButton.addEventListener('click', restartApplication);
    }
    if (hiddenFileInput) {
        hiddenFileInput.addEventListener('change', handleFileLoadChoice);
    }
    // Add event delegation as backup for Docusaurus or other dynamic environments
    // This ensures clicks work even if direct handlers fail to attach
    document.addEventListener('click', (e) => {
        const target = e.target;
        // Handle new-config button click via delegation
        if (target.id === 'new-config' || target.closest('#new-config')) {
            console.log('BusyTime: New config clicked via delegation');
            e.preventDefault();
            handleNewConfigChoice();
            return;
        }
        // Handle load-existing button click via delegation
        if (target.id === 'load-existing' || target.closest('#load-existing')) {
            console.log('BusyTime: Load existing clicked via delegation');
            e.preventDefault();
            const fileInput = document.getElementById('load-config');
            if (fileInput) {
                fileInput.click();
            }
            return;
        }
        // Handle restart button click via delegation
        if (target.id === 'restart-button' || target.closest('#restart-button')) {
            console.log('BusyTime: Restart clicked via delegation');
            e.preventDefault();
            restartApplication();
            return;
        }
    }, { capture: true }); // Use capture phase to ensure we get the event first
}
function handleNewConfigChoice() {
    // Create new configuration with defaults
    currentConfig = {
        calendar_hour_start: 8,
        calendar_hour_end: 18,
        calendar_days: [0, 1, 2, 3, 4],
        pending_time: 10,
        wifis: {},
        displays: {
            default: {
                brightness: 1.0,
                use_calendar_colors: false
            },
            onboard: {}
        }
        // Note: Don't create empty calendar provider structures - they will be created when actually configured
    };
    // Show the configuration flow
    showConfigurationFlow();
    // Update form with new config (no tokens to verify - both providers start as not verified and invalid)
    updateForm(currentConfig, false, false, false, false);
}
async function handleFileLoadChoice(event) {
    const input = event.target;
    if (!input.files?.length)
        return;
    const file = input.files[0];
    try {
        const text = await file.text();
        currentConfig = JSON.parse(text);
        // Migrate old calendar configuration format if needed
        if (currentConfig?.google_access_token || currentConfig?.google_refresh_token || Array.isArray(currentConfig?.calendars)) {
            const oldAccessToken = currentConfig.google_access_token;
            const oldRefreshToken = currentConfig.google_refresh_token;
            const oldCalendars = Array.isArray(currentConfig.calendars) ? currentConfig.calendars : [];
            // Create new calendar structure
            if (!currentConfig.calendars || Array.isArray(currentConfig.calendars)) {
                currentConfig.calendars = {};
            }
            if (oldAccessToken || oldRefreshToken || oldCalendars.length > 0) {
                currentConfig.calendars.google = {
                    auth: {
                        access_token: oldAccessToken || '',
                        refresh_token: oldRefreshToken || ''
                    },
                    calendars: oldCalendars
                };
            }
            // Remove old format properties
            delete currentConfig.google_access_token;
            delete currentConfig.google_refresh_token;
            if (Array.isArray(currentConfig.calendars)) {
                delete currentConfig.calendars;
                currentConfig.calendars = { google: { auth: { access_token: '', refresh_token: '' }, calendars: oldCalendars } };
            }
        }
        // Ensure both Google and Apple calendar structures exist
        if (!currentConfig.calendars) {
            currentConfig.calendars = {};
        }
        if (!currentConfig.calendars.google) {
            currentConfig.calendars.google = {
                auth: {
                    access_token: '',
                    refresh_token: ''
                },
                calendars: []
            };
        }
        if (!currentConfig.calendars.apple) {
            currentConfig.calendars.apple = {
                auth: {
                    username: '',
                    password: ''
                },
                calendars: []
            };
        }
        // Show the configuration flow
        showConfigurationFlow();
        // Verify tokens for each provider separately
        let googleTokensVerified = false;
        let googleTokensValid = false;
        let outlookTokensVerified = false;
        let outlookTokensValid = false;
        // Verify Google tokens if present
        if (currentConfig?.calendars?.google?.auth?.access_token && currentConfig?.calendars?.google?.auth?.refresh_token) {
            googleTokensValid = await verifyGoogleToken();
            googleTokensVerified = true;
        }
        // Verify Outlook tokens if present
        if (currentConfig?.calendars?.outlook?.auth?.access_token && currentConfig?.calendars?.outlook?.auth?.refresh_token) {
            outlookTokensValid = await verifyOutlookToken();
            outlookTokensVerified = true;
        }
        await updateForm(currentConfig, googleTokensVerified, googleTokensValid, outlookTokensVerified, outlookTokensValid);
    }
    catch (error) {
        console.error('Error loading configuration:', error);
        alert('Error loading configuration file. Please check the file format and try again.');
    }
    finally {
        // Reset the file input
        input.value = '';
    }
}
function showConfigurationFlow() {
    // Hide initial choice section
    const initialChoiceSection = document.getElementById('initial-choice-section');
    const restartSection = document.getElementById('restart-section');
    const oauthSection = document.querySelector('.oauth-setup');
    if (initialChoiceSection) {
        initialChoiceSection.style.display = 'none';
    }
    if (restartSection) {
        restartSection.style.display = 'block';
    }
    // Always show OAuth section (Google OAuth and Apple auth) immediately
    if (oauthSection) {
        oauthSection.style.display = 'block';
    }
    // Initialize form with WiFi section first
    const formElement = document.getElementById('config-form');
    if (formElement && currentConfig) {
        // Clear form and render WiFi section immediately
        formElement.innerHTML = '';
        renderWiFiSection();
    }
    // Don't call updateAuthStatus here to avoid duplicate token verification
    // The calling function (handleFileLoadChoice or handleNewConfigChoice) will call updateForm
    // which will properly handle auth status
}
function restartApplication() {
    // Hide all sections except initial choice
    const initialChoiceSection = document.getElementById('initial-choice-section');
    const restartSection = document.getElementById('restart-section');
    const oauthSection = document.querySelector('.oauth-setup');
    const mainSettings = document.getElementById('main-settings');
    // Remove all dynamic calendar sections
    const googleCalendarSection = document.querySelector('.google-calendar-section');
    const appleCalendarSection = document.querySelector('.apple-calendar-section');
    const legacyCalendarSection = document.querySelector('.calendar-section');
    if (initialChoiceSection) {
        initialChoiceSection.style.display = 'block';
    }
    if (restartSection) {
        restartSection.style.display = 'none';
    }
    if (oauthSection) {
        oauthSection.style.display = 'none';
    }
    if (mainSettings) {
        mainSettings.style.display = 'none';
    }
    // Remove all calendar sections
    if (googleCalendarSection) {
        googleCalendarSection.remove();
    }
    if (appleCalendarSection) {
        appleCalendarSection.remove();
    }
    if (legacyCalendarSection) {
        legacyCalendarSection.remove();
    }
    // Clear the form
    const formElement = document.getElementById('config-form');
    if (formElement) {
        formElement.innerHTML = '';
    }
    // Reset auth status displays to initial state
    const googleStatusDiv = document.getElementById('google-auth-status');
    const appleStatusDiv = document.getElementById('apple-auth-status');
    const outlookStatusDiv = document.getElementById('outlook-auth-status');
    const googleCodeDisplay = document.getElementById('google-auth-code-display');
    const appleAuthForm = document.getElementById('apple-auth-form');
    const authorizeGoogleButton = document.getElementById('authorize-google');
    const configureAppleButton = document.getElementById('configure-apple');
    const authorizeOutlookButton = document.getElementById('authorize-outlook');
    if (googleStatusDiv) {
        googleStatusDiv.className = 'auth-status unauthorized';
        googleStatusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">error</span>Not connected to Google Calendar</div>';
    }
    if (appleStatusDiv) {
        appleStatusDiv.className = 'auth-status';
        appleStatusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">sync</span>Ready to configure Apple Calendar...</div>';
    }
    if (outlookStatusDiv) {
        outlookStatusDiv.className = 'auth-status unauthorized';
        outlookStatusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">error</span>Not connected to Outlook Calendar</div>';
    }
    if (googleCodeDisplay) {
        googleCodeDisplay.style.display = 'none';
    }
    if (appleAuthForm) {
        appleAuthForm.style.display = 'none';
    }
    if (authorizeGoogleButton) {
        authorizeGoogleButton.textContent = 'Authorize Google Calendar';
        authorizeGoogleButton.style.display = 'block';
    }
    if (configureAppleButton) {
        configureAppleButton.textContent = 'Configure Apple Calendar';
        configureAppleButton.style.display = 'block';
    }
    if (authorizeOutlookButton) {
        authorizeOutlookButton.textContent = 'Authorize Outlook Calendar';
        authorizeOutlookButton.style.display = 'block';
    }
    // Clear Apple auth form inputs
    const appleUsernameInput = document.getElementById('apple-username');
    const applePasswordInput = document.getElementById('apple-password');
    if (appleUsernameInput) {
        appleUsernameInput.value = '';
    }
    if (applePasswordInput) {
        applePasswordInput.value = '';
    }
    // Reset current config and calendar data
    currentConfig = null;
    calendarColors = null;
    authState.deviceCode = null;
}
// Helper function to clean configuration before saving
// Removes provider entries that haven't been properly set up
function cleanConfigurationForSave(data) {
    // Create a deep copy to avoid modifying the original config
    const cleanedConfig = JSON.parse(JSON.stringify(data));
    if (cleanedConfig.calendars) {
        // Check Google provider - remove if no proper auth
        if (cleanedConfig.calendars.google) {
            const googleAuth = cleanedConfig.calendars.google.auth;
            const hasValidGoogleAuth = googleAuth &&
                googleAuth.access_token &&
                googleAuth.access_token.trim() !== '' &&
                googleAuth.refresh_token &&
                googleAuth.refresh_token.trim() !== '';
            if (!hasValidGoogleAuth) {
                delete cleanedConfig.calendars.google;
            }
        }
        // Check Apple provider - remove if no proper auth
        if (cleanedConfig.calendars.apple) {
            const appleAuth = cleanedConfig.calendars.apple.auth;
            const hasValidAppleAuth = appleAuth &&
                appleAuth.username &&
                appleAuth.username.trim() !== '' &&
                appleAuth.password &&
                appleAuth.password.trim() !== '';
            if (!hasValidAppleAuth) {
                delete cleanedConfig.calendars.apple;
            }
        }
        // If no providers remain, remove the entire calendars object
        if (Object.keys(cleanedConfig.calendars).length === 0) {
            delete cleanedConfig.calendars;
        }
    }
    return cleanedConfig;
}
function saveConfiguration(data) {
    // Clean the configuration before saving
    const cleanedData = cleanConfigurationForSave(data);
    const blob = new Blob([JSON.stringify(cleanedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Add a unique timestamp to help users identify the file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    a.download = `settings-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSaveFeedback(`Configuration downloaded as ${a.download}. Check your Downloads folder.`, true);
}
// Convert save button to downloadable link for universal right-click support
function enableSaveAsLink() {
    if (!currentConfig)
        return;
    const saveButton = document.getElementById('save-config');
    if (!saveButton)
        return;
    // Clean the configuration before creating the download
    const cleanedConfig = cleanConfigurationForSave(currentConfig);
    // Create download blob
    const configJson = JSON.stringify(cleanedConfig, null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    // If it's still a button, convert it to an anchor
    if (saveButton.tagName === 'BUTTON') {
        const link = document.createElement('a');
        link.id = 'save-config';
        link.href = url;
        link.download = 'settings.json';
        link.innerHTML = saveButton.innerHTML;
        link.className = saveButton.className;
        link.setAttribute('role', 'button');
        // Add click handler for feedback
        link.addEventListener('click', (e) => {
            // Let the browser handle the download
            showSaveFeedback('Configuration downloaded as settings.json', true);
        });
        // Replace button with link
        saveButton.parentNode?.replaceChild(link, saveButton);
    }
    else if (saveButton.tagName === 'A') {
        // Update existing link
        const link = saveButton;
        if (link.href && link.href.startsWith('blob:')) {
            URL.revokeObjectURL(link.href);
        }
        link.href = url;
        link.download = 'settings.json';
    }
}
// Show feedback message for save operations
function showSaveFeedback(message, isSuccess) {
    const saveButton = document.getElementById('save-config');
    if (!saveButton)
        return;
    const feedback = document.createElement('div');
    feedback.className = `save-feedback ${isSuccess ? 'success' : 'warning'}`;
    feedback.textContent = message;
    const actionsSection = saveButton.closest('.actions');
    if (actionsSection) {
        actionsSection.appendChild(feedback);
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 3000);
    }
}
// OAuth Handling
function setupOAuthHandlers() {
    // Google OAuth handlers
    const authorizeGoogleButton = document.getElementById('authorize-google');
    if (authorizeGoogleButton) {
        authorizeGoogleButton.onclick = () => void startGoogleAuth();
    }
    // Listen for OAuth messages from popup window
    window.addEventListener('message', (event) => {
        // Verify the message is from our origin
        if (event.origin !== window.location.origin) {
            console.warn('Received message from unauthorized origin:', event.origin);
            return;
        }
        // Handle Google OAuth success from popup
        if (event.data && event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
            void handleOAuthSuccess(event.data.tokens);
        }
        // Handle Google OAuth error from popup
        if (event.data && event.data.type === 'GOOGLE_OAUTH_ERROR') {
            console.error('Google OAuth error from popup:', event.data.error);
            const statusDiv = document.getElementById('google-auth-status');
            if (statusDiv) {
                statusDiv.className = 'auth-status unauthorized';
                statusDiv.innerHTML = `<div class="status-message"><span class="material-symbols-outlined">error</span>⚠ Authorization failed: ${event.data.error}</div>`;
            }
        }
        // Handle Outlook OAuth success from popup
        if (event.data && event.data.type === 'OUTLOOK_OAUTH_SUCCESS') {
            void handleOutlookOAuthSuccess(event.data.tokens);
        }
        // Handle Outlook OAuth error from popup
        if (event.data && event.data.type === 'OUTLOOK_OAUTH_ERROR') {
            console.error('Outlook OAuth error from popup:', event.data.error);
            const statusDiv = document.getElementById('outlook-auth-status');
            if (statusDiv) {
                statusDiv.className = 'auth-status unauthorized';
                statusDiv.innerHTML = `<div class="status-message"><span class="material-symbols-outlined">error</span>⚠ Authorization failed: ${event.data.error}</div>`;
            }
        }
    });
    // Apple Calendar handlers
    const configureAppleButton = document.getElementById('configure-apple');
    const testAppleAuthButton = document.getElementById('test-apple-auth');
    const cancelAppleAuthButton = document.getElementById('cancel-apple-auth');
    const toggleApplePasswordButton = document.getElementById('toggle-apple-password');
    if (configureAppleButton) {
        configureAppleButton.onclick = () => void showAppleAuthForm();
    }
    if (testAppleAuthButton) {
        testAppleAuthButton.onclick = () => void testAppleAuth();
    }
    if (cancelAppleAuthButton) {
        cancelAppleAuthButton.onclick = () => void hideAppleAuthForm();
    }
    if (toggleApplePasswordButton) {
        toggleApplePasswordButton.onclick = () => toggleApplePasswordVisibility();
    }
    // Outlook OAuth handlers
    const authorizeOutlookButton = document.getElementById('authorize-outlook');
    if (authorizeOutlookButton) {
        authorizeOutlookButton.onclick = () => void startOutlookAuth();
    }
}
async function updateAuthStatus(googleTokensVerified = false, googleTokensValid = false, outlookTokensVerified = false, outlookTokensValid = false) {
    // Update Google auth status
    const googleStatusDiv = document.getElementById('google-auth-status');
    const authorizeGoogleButton = document.getElementById('authorize-google');
    const googleCodeDisplay = document.getElementById('google-auth-code-display');
    if (googleStatusDiv && authorizeGoogleButton) {
        const hasTokens = !!(currentConfig?.calendars?.google?.auth?.access_token && currentConfig?.calendars?.google?.auth?.refresh_token);
        if (hasTokens) {
            // Check if token is still valid - skip verification if already done
            const isValid = googleTokensVerified ? googleTokensValid : await verifyGoogleToken();
            if (isValid) {
                googleStatusDiv.className = 'auth-status authorized';
                googleStatusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">check_circle</span>✓ Connected to Google Calendar</div>';
                authorizeGoogleButton.textContent = 'Reauthorize Google Calendar';
            }
            else {
                googleStatusDiv.className = 'auth-status unauthorized';
                googleStatusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">error</span>Not connected to Google Calendar</div>';
                authorizeGoogleButton.textContent = 'Authorize Google Calendar';
            }
        }
        else {
            googleStatusDiv.className = 'auth-status unauthorized';
            googleStatusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">error</span>Not connected to Google Calendar</div>';
            authorizeGoogleButton.textContent = 'Authorize Google Calendar';
        }
        if (googleCodeDisplay) {
            googleCodeDisplay.style.display = 'none';
        }
    }
    // Update Apple auth status
    const appleStatusDiv = document.getElementById('apple-auth-status');
    const configureAppleButton = document.getElementById('configure-apple');
    if (appleStatusDiv && configureAppleButton) {
        if (currentConfig?.calendars?.apple?.auth?.username && currentConfig?.calendars?.apple?.auth?.password) {
            appleStatusDiv.className = 'auth-status authorized';
            appleStatusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">check_circle</span>✓ Apple Calendar configured</div>';
            configureAppleButton.textContent = 'Reconfigure Apple Calendar';
            // Ensure Apple calendar list is rendered if credentials exist
            showAppleCalendarManager();
        }
        else {
            appleStatusDiv.className = 'auth-status unauthorized';
            appleStatusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">info</span>Apple Calendar configuration available. Click below to connect.</div>';
            configureAppleButton.textContent = 'Configure Apple Calendar';
        }
    }
    // Update Outlook auth status
    await updateOutlookAuthUI();
    // Show main settings if any calendar provider is configured
    const mainSettings = document.getElementById('main-settings');
    if (mainSettings) {
        const hasGoogleAuth = currentConfig?.calendars?.google?.auth?.access_token && currentConfig?.calendars?.google?.auth?.refresh_token;
        const hasAppleAuth = currentConfig?.calendars?.apple?.auth?.username && currentConfig?.calendars?.apple?.auth?.password;
        const hasOutlookAuth = currentConfig?.calendars?.outlook?.auth?.access_token && currentConfig?.calendars?.outlook?.auth?.refresh_token;
        const googleValid = hasGoogleAuth ? (googleTokensVerified ? googleTokensValid : await verifyGoogleToken()) : false;
        const outlookValid = hasOutlookAuth ? (outlookTokensVerified ? outlookTokensValid : await verifyOutlookToken()) : false;
        // Show main settings if at least one calendar provider is set up
        if (googleValid || hasAppleAuth || outlookValid) {
            mainSettings.style.display = 'block';
        }
        else {
            mainSettings.style.display = 'none';
        }
    }
}
async function startGoogleAuth() {
    const statusDiv = document.getElementById('google-auth-status');
    if (!statusDiv)
        return;
    try {
        // Always use redirect flow - it works for both localhost and production
        // as long as the redirect URIs are properly configured in Google Cloud Console
        await startGoogleAuthRedirect();
    }
    catch (error) {
        console.error('Error starting Google auth:', error);
        statusDiv.className = 'auth-status unauthorized';
        statusDiv.innerHTML = `<div class="status-message"><span class="material-symbols-outlined">error</span>⚠ Failed to start authorization: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
    }
}
// Redirect flow using popup window to preserve app state
async function startGoogleAuthRedirect() {
    const statusDiv = document.getElementById('google-auth-status');
    if (!statusDiv)
        return;
    statusDiv.className = 'auth-status';
    statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">sync</span>Opening authorization window...</div>';
    // Generate CSRF protection state
    const state = generateStateParameter();
    sessionStorage.setItem('oauth_state', state);
    // Store current config state before opening popup
    sessionStorage.setItem('pre_oauth_config', JSON.stringify(currentConfig));
    // Build OAuth authorization URL - use a dedicated OAuth handler page
    const redirectUri = window.location.origin + '/oauth-callback.html';
    const params = new URLSearchParams({
        client_id: googleConfig.clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: googleConfig.scope,
        access_type: 'offline', // Critical: This ensures we get a refresh token
        prompt: 'consent', // Force consent to ensure refresh token is issued
        state: state
    });
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    // Open OAuth flow in popup window
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(authUrl, 'GoogleOAuthPopup', `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`);
    if (!popup) {
        statusDiv.className = 'auth-status unauthorized';
        statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">error</span>⚠ Popup blocked. Please allow popups for this site and try again.</div>';
        return;
    }
    statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">hourglass_empty</span>Waiting for authorization in popup window...</div>';
}
// Device code flow for localhost/development
async function startGoogleAuthDeviceCode() {
    const statusDiv = document.getElementById('google-auth-status');
    const codeDisplay = document.getElementById('google-auth-code-display');
    const verificationUrlEl = document.getElementById('google-verification-url');
    const userCodeElement = document.getElementById('google-user-code');
    if (!statusDiv)
        return;
    statusDiv.className = 'auth-status';
    statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">sync</span>Initializing authorization...</div>';
    const deviceCodeResponse = await fetch('https://oauth2.googleapis.com/device/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: googleConfig.clientId,
            scope: googleConfig.scope
        })
    });
    const deviceData = await deviceCodeResponse.json();
    if (deviceData.error) {
        throw new Error(`Failed to get device code: ${deviceData.error}`);
    }
    authState.deviceCode = deviceData.device_code;
    authState.pollInterval = deviceData.interval || 5;
    if (codeDisplay && verificationUrlEl && userCodeElement) {
        verificationUrlEl.href = deviceData.verification_url;
        userCodeElement.textContent = deviceData.user_code;
        codeDisplay.style.display = 'block';
    }
    statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">hourglass_empty</span>Waiting for authorization...</div>';
    pollForToken();
}
// Poll for token in device code flow
async function pollForToken() {
    const startTime = Date.now();
    const authorizeButton = document.getElementById('authorize-google');
    const statusDiv = document.getElementById('google-auth-status');
    const codeDisplay = document.getElementById('google-auth-code-display');
    if (!statusDiv || !authorizeButton)
        return;
    authorizeButton.disabled = true;
    while (Date.now() - startTime < authState.pollTimeout * 1000) {
        try {
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: googleConfig.clientId,
                    client_secret: googleConfig.clientSecret,
                    device_code: authState.deviceCode,
                    grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
                })
            });
            const tokenData = await tokenResponse.json();
            if (tokenData.error) {
                if (tokenData.error === 'authorization_pending' || tokenData.error === 'slow_down') {
                    await new Promise(resolve => setTimeout(resolve, authState.pollInterval * 1000));
                    continue;
                }
                throw new Error(tokenData.error);
            }
            // Store tokens in config
            if (!currentConfig)
                currentConfig = {};
            if (!currentConfig.calendars)
                currentConfig.calendars = {};
            if (!currentConfig.calendars.google)
                currentConfig.calendars.google = {};
            if (!currentConfig.calendars.google.auth)
                currentConfig.calendars.google.auth = {};
            if (!currentConfig.calendars.google.calendars)
                currentConfig.calendars.google.calendars = [];
            currentConfig.calendars.google.auth.access_token = tokenData.access_token;
            currentConfig.calendars.google.auth.refresh_token = tokenData.refresh_token;
            // Update UI
            statusDiv.className = 'auth-status authorized';
            statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">check_circle</span>✓ Successfully authorized with Google Calendar</div>';
            if (codeDisplay)
                codeDisplay.style.display = 'none';
            // Get calendars and update form
            await fetchGoogleCalendars();
            await updateForm(currentConfig, true, true, false, false); // Google tokens verified and valid
            break;
        }
        catch (error) {
            console.error('Error polling for token:', error);
            statusDiv.className = 'auth-status unauthorized';
            statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">error</span>⚠ Authorization failed. Please try again.</div>';
            break;
        }
    }
    if (Date.now() - startTime >= authState.pollTimeout * 1000) {
        statusDiv.className = 'auth-status unauthorized';
        statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">schedule</span>⚠ Authorization timeout. Please try again.</div>';
    }
    authorizeButton.disabled = false;
    authState.deviceCode = null;
}
// Generate a random state parameter for CSRF protection
function generateStateParameter() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
// Handle OAuth success from popup window
async function handleOAuthSuccess(tokens) {
    const statusDiv = document.getElementById('google-auth-status');
    if (!statusDiv)
        return;
    try {
        statusDiv.className = 'auth-status';
        statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">sync</span>Processing authorization...</div>';
        // Restore config from before OAuth if it exists
        const preOAuthConfig = sessionStorage.getItem('pre_oauth_config');
        if (preOAuthConfig) {
            currentConfig = JSON.parse(preOAuthConfig);
            sessionStorage.removeItem('pre_oauth_config');
        }
        // Store tokens in config
        if (!currentConfig)
            currentConfig = {};
        if (!currentConfig.calendars)
            currentConfig.calendars = {};
        if (!currentConfig.calendars.google)
            currentConfig.calendars.google = {};
        if (!currentConfig.calendars.google.auth)
            currentConfig.calendars.google.auth = {};
        if (!currentConfig.calendars.google.calendars)
            currentConfig.calendars.google.calendars = [];
        currentConfig.calendars.google.auth.access_token = tokens.access_token;
        currentConfig.calendars.google.auth.refresh_token = tokens.refresh_token;
        // Update UI
        statusDiv.className = 'auth-status authorized';
        statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">check_circle</span>✓ Successfully authorized with Google Calendar</div>';
        // Get calendars and update form
        await fetchGoogleCalendars();
        await updateForm(currentConfig, true, true, false, false); // Google tokens verified and valid
    }
    catch (error) {
        console.error('Error handling OAuth success:', error);
        statusDiv.className = 'auth-status unauthorized';
        statusDiv.innerHTML = `<div class="status-message"><span class="material-symbols-outlined">error</span>⚠ Authorization failed: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
    }
}
// Handle Outlook OAuth success from popup window
async function handleOutlookOAuthSuccess(tokens) {
    const statusDiv = document.getElementById('outlook-auth-status');
    if (!statusDiv)
        return;
    try {
        statusDiv.className = 'auth-status';
        statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">sync</span>Processing authorization...</div>';
        // Restore config from before OAuth if it exists
        const preOAuthConfig = sessionStorage.getItem('pre_oauth_config');
        if (preOAuthConfig) {
            currentConfig = JSON.parse(preOAuthConfig);
            sessionStorage.removeItem('pre_oauth_config');
        }
        // Store tokens in config
        if (!currentConfig)
            currentConfig = {};
        if (!currentConfig.calendars)
            currentConfig.calendars = {};
        if (!currentConfig.calendars.outlook)
            currentConfig.calendars.outlook = {};
        if (!currentConfig.calendars.outlook.auth)
            currentConfig.calendars.outlook.auth = {};
        if (!currentConfig.calendars.outlook.calendars)
            currentConfig.calendars.outlook.calendars = [];
        currentConfig.calendars.outlook.auth.access_token = tokens.access_token;
        currentConfig.calendars.outlook.auth.refresh_token = tokens.refresh_token;
        // Clean up session storage
        sessionStorage.removeItem('outlook_code_verifier');
        sessionStorage.removeItem('outlook_oauth_state');
        // Update UI
        statusDiv.className = 'auth-status authorized';
        statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">check_circle</span>✓ Successfully authorized with Outlook Calendar</div>';
        // Get calendars and update form
        await fetchOutlookCalendars();
        await updateForm(currentConfig, false, false, true, true); // Outlook tokens verified and valid
    }
    catch (error) {
        console.error('Error handling Outlook OAuth success:', error);
        statusDiv.className = 'auth-status unauthorized';
        statusDiv.innerHTML = `<div class="status-message"><span class="material-symbols-outlined">error</span>⚠ Authorization failed: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
    }
}
// Handle the authorization code from OAuth redirect and exchange for tokens
async function handleAuthorizationCode(code) {
    const statusDiv = document.getElementById('google-auth-status');
    if (!statusDiv)
        return;
    try {
        statusDiv.className = 'auth-status';
        statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">sync</span>Exchanging authorization code for tokens...</div>';
        // Exchange authorization code for tokens
        const redirectUri = window.location.origin + window.location.pathname;
        const params = new URLSearchParams({
            code: code,
            client_id: googleConfig.clientId,
            client_secret: googleConfig.clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        });
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error_description || data.error || 'Token exchange failed');
        }
        // Store tokens in config
        if (!currentConfig)
            currentConfig = {};
        if (!currentConfig.calendars)
            currentConfig.calendars = {};
        if (!currentConfig.calendars.google)
            currentConfig.calendars.google = {};
        if (!currentConfig.calendars.google.auth)
            currentConfig.calendars.google.auth = {};
        if (!currentConfig.calendars.google.calendars)
            currentConfig.calendars.google.calendars = [];
        currentConfig.calendars.google.auth.access_token = data.access_token;
        currentConfig.calendars.google.auth.refresh_token = data.refresh_token;
        // Update UI
        statusDiv.className = 'auth-status authorized';
        statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">check_circle</span>✓ Successfully authorized with Google Calendar</div>';
        // Get calendars and update form
        await fetchGoogleCalendars();
        await updateForm(currentConfig, true, true, false, false); // Google tokens verified and valid
        // Clean up URL (remove OAuth parameters)
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    catch (error) {
        console.error('Error exchanging authorization code:', error);
        statusDiv.className = 'auth-status unauthorized';
        statusDiv.innerHTML = `<div class="status-message"><span class="material-symbols-outlined">error</span>⚠ Authorization failed: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
        // Clean up URL even on error
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}
// Check for OAuth callback on page load
async function checkForOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');
    if (error) {
        const statusDiv = document.getElementById('google-auth-status');
        if (statusDiv) {
            statusDiv.className = 'auth-status unauthorized';
            statusDiv.innerHTML = `<div class="status-message"><span class="material-symbols-outlined">error</span>⚠ Authorization failed: ${error}</div>`;
        }
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }
    if (code) {
        // Verify state to prevent CSRF attacks
        const savedState = sessionStorage.getItem('oauth_state');
        if (state && state === savedState) {
            sessionStorage.removeItem('oauth_state');
            await handleAuthorizationCode(code);
        }
        else {
            const statusDiv = document.getElementById('google-auth-status');
            if (statusDiv) {
                statusDiv.className = 'auth-status unauthorized';
                statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">error</span>⚠ Invalid state parameter. Possible CSRF attack detected.</div>';
            }
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}
async function verifyGoogleToken() {
    try {
        const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1', {
            headers: {
                'Authorization': `Bearer ${currentConfig?.calendars?.google?.auth?.access_token}`
            }
        });
        const data = await response.json();
        if (data.error) {
            if (data.error.status === 'UNAUTHENTICATED' && currentConfig?.calendars?.google?.auth?.refresh_token) {
                // Token expired - this is expected, try to refresh
                return refreshGoogleToken();
            }
            // Log unexpected authentication errors (not token expiration)
            if (data.error.status !== 'UNAUTHENTICATED') {
                console.error('Unexpected authentication error:', data.error);
            }
            return false;
        }
        return true;
    }
    catch (error) {
        // Only log network errors or other unexpected issues
        console.error('Network error verifying token:', error);
        return false;
    }
}
async function refreshGoogleToken() {
    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: googleConfig.clientId,
                client_secret: googleConfig.clientSecret,
                refresh_token: currentConfig?.calendars?.google?.auth?.refresh_token || '',
                grant_type: 'refresh_token'
            })
        });
        const data = await response.json();
        if (data.error) {
            // Only log refresh token errors if they're unexpected (not invalid_grant)
            if (data.error !== 'invalid_grant') {
                console.error('Unexpected refresh token error:', data.error);
            }
            // invalid_grant typically means refresh token has expired/revoked - this is expected
            return false;
        }
        if (!currentConfig.calendars)
            currentConfig.calendars = {};
        if (!currentConfig.calendars.google)
            currentConfig.calendars.google = {};
        if (!currentConfig.calendars.google.auth)
            currentConfig.calendars.google.auth = {};
        if (!currentConfig.calendars.google.calendars)
            currentConfig.calendars.google.calendars = [];
        currentConfig.calendars.google.auth.access_token = data.access_token;
        return true;
    }
    catch (error) {
        // Only log network errors or other unexpected issues
        console.error('Network error refreshing token:', error);
        return false;
    }
}
// Apple Calendar Handling
function showAppleAuthForm() {
    const appleAuthForm = document.getElementById('apple-auth-form');
    const configureAppleButton = document.getElementById('configure-apple');
    if (appleAuthForm && configureAppleButton) {
        appleAuthForm.style.display = 'block';
        configureAppleButton.style.display = 'none';
        // Pre-fill existing credentials if they exist
        const usernameInput = document.getElementById('apple-username');
        const passwordInput = document.getElementById('apple-password');
        if (usernameInput && currentConfig?.calendars?.apple?.auth?.username) {
            usernameInput.value = currentConfig.calendars.apple.auth.username;
        }
        if (passwordInput && currentConfig?.calendars?.apple?.auth?.password) {
            passwordInput.value = currentConfig.calendars.apple.auth.password;
        }
    }
}
function hideAppleAuthForm() {
    const appleAuthForm = document.getElementById('apple-auth-form');
    const configureAppleButton = document.getElementById('configure-apple');
    if (appleAuthForm && configureAppleButton) {
        appleAuthForm.style.display = 'none';
        configureAppleButton.style.display = 'block';
    }
}
function toggleApplePasswordVisibility() {
    const passwordInput = document.getElementById('apple-password');
    const toggleButton = document.getElementById('toggle-apple-password');
    if (passwordInput && toggleButton) {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        const icon = toggleButton.querySelector('.material-symbols-outlined');
        if (icon) {
            icon.textContent = isPassword ? 'visibility_off' : 'visibility';
        }
        toggleButton.title = isPassword ? 'Hide password' : 'Show password';
    }
}
async function testAppleAuth() {
    const usernameInput = document.getElementById('apple-username');
    const passwordInput = document.getElementById('apple-password');
    const testButton = document.getElementById('test-apple-auth');
    const appleStatusDiv = document.getElementById('apple-auth-status');
    if (!usernameInput || !passwordInput || !testButton || !appleStatusDiv)
        return;
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    if (!username || !password) {
        alert('Please enter both username and app-specific password');
        return;
    }
    // Disable the button and show loading state
    testButton.disabled = true;
    const originalText = testButton.innerHTML;
    testButton.innerHTML = '<span class="material-symbols-outlined">sync</span>Saving...';
    try {
        // Store credentials
        if (!currentConfig)
            currentConfig = {};
        if (!currentConfig.calendars)
            currentConfig.calendars = {};
        if (!currentConfig.calendars.apple)
            currentConfig.calendars.apple = {};
        if (!currentConfig.calendars.apple.auth)
            currentConfig.calendars.apple.auth = {};
        if (!currentConfig.calendars.apple.calendars)
            currentConfig.calendars.apple.calendars = [];
        currentConfig.calendars.apple.auth.username = username;
        currentConfig.calendars.apple.auth.password = password;
        // Configuration saved successfully
        appleStatusDiv.className = 'auth-status authorized';
        appleStatusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">check_circle</span>✓ Apple Calendar configured successfully</div>';
        // Hide the form and update the button
        hideAppleAuthForm();
        updateAuthStatus();
        // Show the manual calendar entry interface
        showAppleCalendarManager();
        // Update the form to show calendar selection (no OAuth tokens to verify for Apple)
        await updateForm(currentConfig, false, false, false, false);
    }
    catch (error) {
        console.error('Apple Calendar configuration failed:', error);
        appleStatusDiv.className = 'auth-status unauthorized';
        appleStatusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">error</span>⚠ Configuration failed. Please try again.</div>';
    }
    finally {
        // Re-enable the button
        testButton.disabled = false;
        testButton.innerHTML = originalText;
    }
}
// Apple calendar management - simple manual entry
function showAppleCalendarManager() {
    // Show the manual calendar entry interface
    updateAppleCalendarList();
}
// Apple calendar list management with manual entry
async function fetchAppleCalendars() {
    // No actual fetching needed - calendars are manually entered
    // Just ensure the UI is updated
    updateAppleCalendarList();
    return true;
}
function updateAppleCalendarList() {
    // Find or create the Apple calendar section
    let appleCalendarSection = document.querySelector('.apple-calendar-section');
    if (!appleCalendarSection) {
        appleCalendarSection = document.createElement('section');
        appleCalendarSection.className = 'apple-calendar-section';
        // Insert after the existing calendar section or OAuth section
        const existingCalendarSection = document.querySelector('.calendar-section');
        const oauthSection = document.querySelector('.oauth-setup');
        if (existingCalendarSection) {
            existingCalendarSection.parentNode?.insertBefore(appleCalendarSection, existingCalendarSection.nextSibling);
        }
        else if (oauthSection) {
            oauthSection.parentNode?.insertBefore(appleCalendarSection, oauthSection.nextSibling);
        }
    }
    // Clear the section and rebuild it
    appleCalendarSection.innerHTML = '';
    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Apple Calendar Names';
    appleCalendarSection.appendChild(title);
    // Add description
    const description = document.createElement('p');
    description.className = 'apple-calendar-description';
    description.textContent = 'Enter the names of Apple Calendar calendars you want to monitor. These names must match exactly with your calendar names in the Apple Calendar app.';
    appleCalendarSection.appendChild(description);
    // Create container for calendar list and add button
    const calendarContainer = document.createElement('div');
    calendarContainer.className = 'apple-calendar-container';
    // Ensure calendar structure exists
    if (!currentConfig.calendars)
        currentConfig.calendars = {};
    if (!currentConfig.calendars.apple)
        currentConfig.calendars.apple = {};
    if (!currentConfig.calendars.apple.calendars)
        currentConfig.calendars.apple.calendars = [];
    // Create list of current calendars
    const calendarList = document.createElement('div');
    calendarList.className = 'apple-calendar-list';
    // Function to re-render the calendar list
    const renderCalendarList = () => {
        calendarList.innerHTML = '';
        if (currentConfig.calendars.apple.calendars.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'apple-calendar-empty';
            emptyMessage.textContent = 'No calendars added yet. Click "Add Calendar" to add your first calendar.';
            calendarList.appendChild(emptyMessage);
        }
        else {
            currentConfig.calendars.apple.calendars.forEach((calendarName, index) => {
                const calendarItem = document.createElement('div');
                calendarItem.className = 'apple-calendar-item';
                // Calendar name input (editable)
                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.value = calendarName;
                nameInput.className = 'apple-calendar-name-input';
                nameInput.placeholder = 'Calendar name (must match exactly)';
                nameInput.addEventListener('change', (e) => {
                    const newName = e.target.value.trim();
                    if (newName && newName !== calendarName) {
                        currentConfig.calendars.apple.calendars[index] = newName;
                        enableSaveAsLink();
                    }
                });
                // Remove button
                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '<span class="material-symbols-outlined">delete</span>';
                removeBtn.className = 'remove-calendar-btn';
                removeBtn.title = 'Remove calendar';
                removeBtn.setAttribute('aria-label', 'Remove calendar');
                removeBtn.addEventListener('click', () => {
                    currentConfig.calendars.apple.calendars.splice(index, 1);
                    renderCalendarList();
                    enableSaveAsLink();
                });
                calendarItem.appendChild(nameInput);
                calendarItem.appendChild(removeBtn);
                calendarList.appendChild(calendarItem);
            });
        }
    };
    // Add calendar button
    const addCalendarBtn = document.createElement('button');
    addCalendarBtn.textContent = 'add';
    addCalendarBtn.className = 'add-color-btn';
    addCalendarBtn.addEventListener('click', () => {
        // Add a new empty calendar name
        currentConfig.calendars.apple.calendars.push('');
        renderCalendarList();
        enableSaveAsLink();
        // Focus on the new input
        const newInputs = calendarList.querySelectorAll('.apple-calendar-name-input');
        const lastInput = newInputs[newInputs.length - 1];
        if (lastInput) {
            lastInput.focus();
        }
    });
    // Initial render of calendar list
    renderCalendarList();
    // Add elements to container
    calendarContainer.appendChild(addCalendarBtn);
    calendarContainer.appendChild(calendarList);
    appleCalendarSection.appendChild(calendarContainer);
}
// Helper function to update form with new data
async function updateForm(data, googleTokensVerified = false, googleTokensValid = false, outlookTokensVerified = false, outlookTokensValid = false) {
    // Preserve existing Apple calendar selections before updating
    const existingAppleCalendars = currentConfig?.calendars?.apple?.calendars || [];
    currentConfig = data;
    // Restore Apple calendar selections if they existed
    if (existingAppleCalendars.length > 0) {
        if (!currentConfig.calendars)
            currentConfig.calendars = {};
        if (!currentConfig.calendars.apple)
            currentConfig.calendars.apple = {};
        if (!currentConfig.calendars.apple.calendars)
            currentConfig.calendars.apple.calendars = [];
        currentConfig.calendars.apple.calendars = [...existingAppleCalendars];
    }
    const formElement = document.getElementById('config-form');
    const mainSettings = document.getElementById('main-settings');
    if (!formElement || !mainSettings)
        return;
    // Check if we have valid Google tokens - skip verification if already done
    const hasGoogleTokens = data?.calendars?.google?.auth?.access_token && data?.calendars?.google?.auth?.refresh_token;
    const googleValid = hasGoogleTokens ? (googleTokensVerified ? googleTokensValid : await verifyGoogleToken()) : false;
    // Check if we have Apple credentials
    const hasAppleAuth = data?.calendars?.apple?.auth?.username && data?.calendars?.apple?.auth?.password;
    // Check if we have valid Outlook tokens - skip verification if already done
    const hasOutlookTokens = data?.calendars?.outlook?.auth?.access_token && data?.calendars?.outlook?.auth?.refresh_token;
    const outlookValid = hasOutlookTokens ? (outlookTokensVerified ? outlookTokensValid : await verifyOutlookToken()) : false;
    // Update auth status first with separate verification results for each provider
    await updateAuthStatus(googleTokensVerified, googleValid, outlookTokensVerified, outlookValid);
    // Clear existing content
    formElement.innerHTML = '';
    mainSettings.style.display = 'none';
    // Show settings and calendar lists if we have any valid calendar provider
    if (googleValid || hasAppleAuth || outlookValid) {
        mainSettings.style.display = 'block';
        renderForm(formElement, currentConfig); // Use currentConfig instead of data to preserve Apple selections
        // Fetch calendars for all providers
        if (googleValid) {
            await fetchGoogleCalendars(); // This will update the Google calendar list UI
        }
        if (hasAppleAuth) {
            await fetchAppleCalendars(); // This will update the Apple calendar list UI
        }
        if (outlookValid) {
            await fetchOutlookCalendars(); // This will update the Outlook calendar list UI
        }
    }
}
async function fetchGoogleCalendars() {
    try {
        const [calendarResponse, colorsResponse] = await Promise.all([
            fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=freeBusyReader&maxResults=250', {
                headers: { 'Authorization': `Bearer ${currentConfig?.calendars?.google?.auth?.access_token}` }
            }),
            fetch('https://www.googleapis.com/calendar/v3/colors', {
                headers: { 'Authorization': `Bearer ${currentConfig?.calendars?.google?.auth?.access_token}` }
            })
        ]);
        const calendarData = await calendarResponse.json();
        if (calendarData.error) {
            if (calendarData.error.status === 'UNAUTHENTICATED' && currentConfig?.calendars?.google?.auth?.refresh_token) {
                const refreshed = await refreshGoogleToken();
                if (refreshed)
                    return fetchGoogleCalendars();
            }
            else if (calendarData.error.status !== 'UNAUTHENTICATED') {
                // Log unexpected errors (not token expiration)
                console.error('Unexpected calendar fetch error:', calendarData.error);
            }
            throw new Error(calendarData.error.message);
        }
        // Fetch colors (non-blocking if it fails)
        try {
            const colorsData = await colorsResponse.json();
            if (!colorsData.error) {
                calendarColors = colorsData;
            }
            else if (colorsData.error.status !== 'UNAUTHENTICATED') {
                // Only warn about non-authentication color fetch issues
                console.warn('Failed to fetch calendar colors:', colorsData.error);
            }
        }
        catch (error) {
            console.warn('Failed to fetch calendar colors:', error);
            calendarColors = null;
        }
        if (calendarData.items) {
            // Filter out any calendars that are no longer available (for loaded configs)
            if (Array.isArray(currentConfig.calendars?.google?.calendars)) {
                const availableCalendarIds = calendarData.items.map((cal) => cal.id);
                currentConfig.calendars.google.calendars = currentConfig.calendars.google.calendars.filter((calId) => availableCalendarIds.includes(calId));
            }
            updateGoogleCalendarList(calendarData.items);
        }
        return true;
    }
    catch (error) {
        // Only log if the error wasn't already logged above or is a network error
        if (!(error instanceof Error) || !error.message.includes('UNAUTHENTICATED')) {
            console.error('Error fetching calendars:', error);
        }
        return false;
    }
}
// Helper function to get calendar color
function getCalendarColor(calendar) {
    if (!calendarColors)
        return null;
    const colorId = calendar.colorId || '1';
    const calendarColor = calendarColors.calendar?.[colorId];
    return calendarColor?.background || null;
}
function updateGoogleCalendarList(calendars) {
    // Find or create the Google calendar section
    let googleCalendarSection = document.querySelector('.google-calendar-section');
    if (!googleCalendarSection) {
        googleCalendarSection = document.createElement('section');
        googleCalendarSection.className = 'google-calendar-section';
        googleCalendarSection.innerHTML = '<h2>Select Google Calendars</h2>';
        // Insert after OAuth section
        const oauthSection = document.querySelector('.oauth-setup');
        if (oauthSection) {
            oauthSection.parentNode?.insertBefore(googleCalendarSection, oauthSection.nextSibling);
        }
    }
    // Create calendar list
    const calendarList = document.createElement('div');
    calendarList.className = 'calendar-list';
    // Sort calendars: primary first, then alphabetically by summary
    const sortedCalendars = calendars.sort((a, b) => {
        if (a.primary && !b.primary)
            return -1;
        if (!a.primary && b.primary)
            return 1;
        return (a.summary || '').localeCompare(b.summary || '');
    });
    sortedCalendars.forEach(cal => {
        const calendarItem = document.createElement('div');
        calendarItem.className = 'calendar-item';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `google-cal-${cal.id}`;
        checkbox.checked = currentConfig.calendars?.google?.calendars?.includes(cal.id) || false;
        const label = document.createElement('label');
        label.htmlFor = `google-cal-${cal.id}`;
        label.textContent = cal.summary || cal.id;
        if (cal.primary) {
            label.textContent += ' (Primary Calendar)';
        }
        // Create color indicator
        const colorIndicator = document.createElement('div');
        colorIndicator.className = 'calendar-color-indicator';
        const calendarColor = getCalendarColor(cal);
        if (calendarColor) {
            colorIndicator.style.backgroundColor = calendarColor;
            colorIndicator.title = `Default calendar color: ${calendarColor.toUpperCase()} - Click to copy color to clipboard`;
            colorIndicator.style.cursor = 'pointer';
            // Add click to copy functionality
            colorIndicator.addEventListener('click', async (e) => {
                e.stopPropagation();
                try {
                    await navigator.clipboard.writeText(calendarColor.toUpperCase());
                    // Visual feedback
                    const originalTitle = colorIndicator.title;
                    colorIndicator.title = 'Color copied to clipboard!';
                    colorIndicator.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        colorIndicator.title = originalTitle;
                        colorIndicator.style.transform = '';
                    }, 2000);
                }
                catch (err) {
                    console.error('Failed to copy color to clipboard:', err);
                    // Fallback feedback
                    const originalTitle = colorIndicator.title;
                    colorIndicator.title = 'Failed to copy color';
                    setTimeout(() => {
                        colorIndicator.title = originalTitle;
                    }, 2000);
                }
            });
        }
        else {
            colorIndicator.style.backgroundColor = '#ccc';
            colorIndicator.title = 'Calendar color not available';
            colorIndicator.style.cursor = 'default';
        }
        checkbox.addEventListener('change', () => {
            if (!currentConfig.calendars)
                currentConfig.calendars = {};
            if (!currentConfig.calendars.google)
                currentConfig.calendars.google = {};
            if (!Array.isArray(currentConfig.calendars.google.calendars)) {
                currentConfig.calendars.google.calendars = [];
            }
            if (checkbox.checked) {
                if (!currentConfig.calendars.google.calendars.includes(cal.id)) {
                    currentConfig.calendars.google.calendars.push(cal.id);
                }
            }
            else {
                currentConfig.calendars.google.calendars = currentConfig.calendars.google.calendars.filter((id) => id !== cal.id);
            }
            // Update the save link with the new config
            enableSaveAsLink();
        });
        calendarItem.appendChild(checkbox);
        calendarItem.appendChild(label);
        calendarItem.appendChild(colorIndicator);
        calendarList.appendChild(calendarItem);
    });
    // Clear and update Google calendar section
    googleCalendarSection.innerHTML = '<h2>Select Google Calendars</h2>';
    googleCalendarSection.appendChild(calendarList);
}
// Outlook OAuth Functions (based on oauth-token-helper-outlook.html)
// Uses Authorization Code Flow with PKCE for SPA
// PKCE helper functions
function generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return base64URLEncode(array);
}
async function generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return base64URLEncode(new Uint8Array(hash));
}
function base64URLEncode(buffer) {
    let binary = '';
    for (let i = 0; i < buffer.byteLength; i++) {
        binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}
// Start Outlook OAuth flow using popup window to preserve app state
async function startOutlookAuth() {
    const statusDiv = document.getElementById('outlook-auth-status');
    if (!statusDiv)
        return;
    statusDiv.className = 'auth-status';
    statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">sync</span>Opening authorization window...</div>';
    try {
        // Generate PKCE parameters
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        const state = generateStateParameter();
        // Store PKCE verifier and state in session storage
        sessionStorage.setItem('outlook_code_verifier', codeVerifier);
        sessionStorage.setItem('outlook_oauth_state', state);
        // Store current config state before opening popup
        sessionStorage.setItem('pre_oauth_config', JSON.stringify(currentConfig));
        // Build authorization URL - use the shared OAuth callback page
        const redirectUri = window.location.origin + '/oauth-callback.html';
        const params = new URLSearchParams({
            client_id: outlookConfig.clientId,
            response_type: 'code',
            redirect_uri: redirectUri,
            response_mode: 'query',
            scope: outlookConfig.scope,
            state: state,
            prompt: 'consent', // Force consent to ensure refresh token
            code_challenge: codeChallenge,
            code_challenge_method: 'S256'
        });
        const authUrl = `${outlookConfig.authEndpoint}?${params.toString()}`;
        // Open OAuth flow in popup window
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const popup = window.open(authUrl, 'OutlookOAuthPopup', `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`);
        if (!popup) {
            statusDiv.className = 'auth-status unauthorized';
            statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">error</span>⚠ Popup blocked. Please allow popups for this site and try again.</div>';
            return;
        }
        statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">hourglass_empty</span>Waiting for authorization in popup window...</div>';
    }
    catch (error) {
        console.error('Error starting Outlook auth:', error);
        statusDiv.className = 'auth-status unauthorized';
        statusDiv.innerHTML = `<div class="status-message"><span class="material-symbols-outlined">error</span>⚠ Failed to start authorization: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
    }
}
// Handle the authorization code from Outlook OAuth redirect and exchange for tokens
async function handleOutlookAuthorizationCode(code) {
    const statusDiv = document.getElementById('outlook-auth-status');
    if (!statusDiv)
        return;
    try {
        statusDiv.className = 'auth-status';
        statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">sync</span>Exchanging authorization code for tokens...</div>';
        // Get the code verifier from session storage (PKCE)
        const codeVerifier = sessionStorage.getItem('outlook_code_verifier');
        if (!codeVerifier) {
            throw new Error('Code verifier not found. Please try authorizing again.');
        }
        // Exchange authorization code for tokens
        const redirectUri = window.location.origin + window.location.pathname;
        const params = new URLSearchParams({
            code: code,
            client_id: outlookConfig.clientId,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
            code_verifier: codeVerifier // PKCE parameter
        });
        // Note: SPA apps don't use client_secret with PKCE
        const response = await fetch(outlookConfig.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error_description || data.error || 'Token exchange failed');
        }
        // Store tokens in config
        if (!currentConfig)
            currentConfig = {};
        if (!currentConfig.calendars)
            currentConfig.calendars = {};
        if (!currentConfig.calendars.outlook)
            currentConfig.calendars.outlook = {};
        if (!currentConfig.calendars.outlook.auth)
            currentConfig.calendars.outlook.auth = {};
        if (!currentConfig.calendars.outlook.calendars)
            currentConfig.calendars.outlook.calendars = [];
        currentConfig.calendars.outlook.auth.access_token = data.access_token;
        currentConfig.calendars.outlook.auth.refresh_token = data.refresh_token;
        // Update UI
        statusDiv.className = 'auth-status authorized';
        statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">check_circle</span>✓ Successfully authorized with Outlook Calendar</div>';
        // Clean up session storage
        sessionStorage.removeItem('outlook_code_verifier');
        sessionStorage.removeItem('outlook_oauth_state');
        // Get calendars and update form
        await fetchOutlookCalendars();
        await updateForm(currentConfig, false, false, true, true); // Outlook tokens verified and valid
        // Clean up URL (remove OAuth parameters)
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    catch (error) {
        console.error('Error exchanging authorization code:', error);
        statusDiv.className = 'auth-status unauthorized';
        statusDiv.innerHTML = `<div class="status-message"><span class="material-symbols-outlined">error</span>⚠ Authorization failed: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
        // Clean up session storage and URL even on error
        sessionStorage.removeItem('outlook_code_verifier');
        sessionStorage.removeItem('outlook_oauth_state');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}
// Verify Outlook token
async function verifyOutlookToken() {
    try {
        const response = await fetch('https://graph.microsoft.com/v1.0/me/calendars?$top=1', {
            headers: {
                'Authorization': `Bearer ${currentConfig?.calendars?.outlook?.auth?.access_token}`
            }
        });
        const data = await response.json();
        if (data.error) {
            if (data.error.code === 'InvalidAuthenticationToken' && currentConfig?.calendars?.outlook?.auth?.refresh_token) {
                // Token expired - try to refresh
                return refreshOutlookToken();
            }
            // Log unexpected authentication errors
            if (data.error.code !== 'InvalidAuthenticationToken') {
                console.error('Unexpected authentication error:', data.error);
            }
            return false;
        }
        return true;
    }
    catch (error) {
        console.error('Network error verifying token:', error);
        return false;
    }
}
// Refresh Outlook token
async function refreshOutlookToken() {
    try {
        const response = await fetch(outlookConfig.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: outlookConfig.clientId,
                refresh_token: currentConfig?.calendars?.outlook?.auth?.refresh_token || '',
                grant_type: 'refresh_token',
                scope: outlookConfig.scope
            })
        });
        const data = await response.json();
        if (data.error) {
            // Log refresh token errors if they're unexpected
            if (data.error !== 'invalid_grant') {
                console.error('Unexpected refresh token error:', data.error);
            }
            return false;
        }
        if (!currentConfig.calendars)
            currentConfig.calendars = {};
        if (!currentConfig.calendars.outlook)
            currentConfig.calendars.outlook = {};
        if (!currentConfig.calendars.outlook.auth)
            currentConfig.calendars.outlook.auth = {};
        if (!currentConfig.calendars.outlook.calendars)
            currentConfig.calendars.outlook.calendars = [];
        currentConfig.calendars.outlook.auth.access_token = data.access_token;
        // Refresh token might be rotated
        if (data.refresh_token) {
            currentConfig.calendars.outlook.auth.refresh_token = data.refresh_token;
        }
        return true;
    }
    catch (error) {
        console.error('Network error refreshing token:', error);
        return false;
    }
}
// Fetch Outlook calendars
async function fetchOutlookCalendars() {
    try {
        const response = await fetch('https://graph.microsoft.com/v1.0/me/calendars', {
            headers: {
                'Authorization': `Bearer ${currentConfig?.calendars?.outlook?.auth?.access_token}`
            }
        });
        const data = await response.json();
        if (data.error) {
            if (data.error.code === 'InvalidAuthenticationToken' && currentConfig?.calendars?.outlook?.auth?.refresh_token) {
                const refreshed = await refreshOutlookToken();
                if (refreshed)
                    return fetchOutlookCalendars();
            }
            else if (data.error.code !== 'InvalidAuthenticationToken') {
                console.error('Unexpected calendar fetch error:', data.error);
            }
            throw new Error(data.error.message);
        }
        if (data.value) {
            // Filter out any calendars that are no longer available (for loaded configs)
            if (Array.isArray(currentConfig.calendars?.outlook?.calendars)) {
                const availableCalendarIds = data.value.map((cal) => cal.id);
                currentConfig.calendars.outlook.calendars = currentConfig.calendars.outlook.calendars.filter((calId) => availableCalendarIds.includes(calId));
            }
            updateOutlookCalendarList(data.value);
        }
        return true;
    }
    catch (error) {
        if (!(error instanceof Error) || !error.message.includes('InvalidAuthenticationToken')) {
            console.error('Error fetching Outlook calendars:', error);
        }
        return false;
    }
}
// Update Outlook calendar list UI
function updateOutlookCalendarList(calendars) {
    // Find or create the Outlook calendar section
    let outlookCalendarSection = document.querySelector('.outlook-calendar-section');
    if (!outlookCalendarSection) {
        outlookCalendarSection = document.createElement('section');
        outlookCalendarSection.className = 'outlook-calendar-section';
        outlookCalendarSection.innerHTML = '<h2>Select Outlook Calendars</h2>';
        // Insert after OAuth section or Google calendar section
        const googleCalendarSection = document.querySelector('.google-calendar-section');
        const oauthSection = document.querySelector('.oauth-setup');
        if (googleCalendarSection) {
            googleCalendarSection.parentNode?.insertBefore(outlookCalendarSection, googleCalendarSection.nextSibling);
        }
        else if (oauthSection) {
            oauthSection.parentNode?.insertBefore(outlookCalendarSection, oauthSection.nextSibling);
        }
    }
    // Create calendar list
    const calendarList = document.createElement('div');
    calendarList.className = 'calendar-list';
    // Sort calendars: default/primary first, then alphabetically by name
    const sortedCalendars = calendars.sort((a, b) => {
        if (a.isDefaultCalendar && !b.isDefaultCalendar)
            return -1;
        if (!a.isDefaultCalendar && b.isDefaultCalendar)
            return 1;
        return (a.name || '').localeCompare(b.name || '');
    });
    sortedCalendars.forEach(cal => {
        const calendarItem = document.createElement('div');
        calendarItem.className = 'calendar-item';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `outlook-cal-${cal.id}`;
        checkbox.checked = currentConfig.calendars?.outlook?.calendars?.includes(cal.id) || false;
        const label = document.createElement('label');
        label.htmlFor = `outlook-cal-${cal.id}`;
        label.textContent = cal.name || cal.id;
        if (cal.isDefaultCalendar) {
            label.textContent += ' (Default Calendar)';
        }
        // Outlook calendars have color property
        const colorIndicator = document.createElement('div');
        colorIndicator.className = 'calendar-color-indicator';
        if (cal.hexColor) {
            colorIndicator.style.backgroundColor = cal.hexColor;
            colorIndicator.title = `Calendar color: ${cal.hexColor.toUpperCase()} - Click to copy color to clipboard`;
            colorIndicator.style.cursor = 'pointer';
            // Add click to copy functionality
            colorIndicator.addEventListener('click', async (e) => {
                e.stopPropagation();
                try {
                    await navigator.clipboard.writeText(cal.hexColor.toUpperCase());
                    // Visual feedback
                    const originalTitle = colorIndicator.title;
                    colorIndicator.title = 'Color copied to clipboard!';
                    colorIndicator.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        colorIndicator.title = originalTitle;
                        colorIndicator.style.transform = '';
                    }, 2000);
                }
                catch (err) {
                    console.error('Failed to copy color to clipboard:', err);
                    // Fallback feedback
                    const originalTitle = colorIndicator.title;
                    colorIndicator.title = 'Failed to copy color';
                    setTimeout(() => {
                        colorIndicator.title = originalTitle;
                    }, 2000);
                }
            });
        }
        else {
            colorIndicator.style.backgroundColor = '#ccc';
            colorIndicator.title = 'Calendar color not available';
            colorIndicator.style.cursor = 'default';
        }
        checkbox.addEventListener('change', () => {
            if (!currentConfig.calendars)
                currentConfig.calendars = {};
            if (!currentConfig.calendars.outlook)
                currentConfig.calendars.outlook = {};
            if (!Array.isArray(currentConfig.calendars.outlook.calendars)) {
                currentConfig.calendars.outlook.calendars = [];
            }
            if (checkbox.checked) {
                if (!currentConfig.calendars.outlook.calendars.includes(cal.id)) {
                    currentConfig.calendars.outlook.calendars.push(cal.id);
                }
            }
            else {
                currentConfig.calendars.outlook.calendars = currentConfig.calendars.outlook.calendars.filter((id) => id !== cal.id);
            }
            // Update the save link with the new config
            enableSaveAsLink();
        });
        calendarItem.appendChild(checkbox);
        calendarItem.appendChild(label);
        calendarItem.appendChild(colorIndicator);
        calendarList.appendChild(calendarItem);
    });
    // Clear and update Outlook calendar section
    outlookCalendarSection.innerHTML = '<h2>Select Outlook Calendars</h2>';
    outlookCalendarSection.appendChild(calendarList);
}
// Check for Outlook OAuth callback on page load
async function checkForOutlookOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    const state = urlParams.get('state');
    // Check if this is an Outlook callback by checking the saved state
    const savedOutlookState = sessionStorage.getItem('outlook_oauth_state');
    if (error && savedOutlookState) {
        const statusDiv = document.getElementById('outlook-auth-status');
        if (statusDiv) {
            statusDiv.className = 'auth-status unauthorized';
            statusDiv.innerHTML = `<div class="status-message"><span class="material-symbols-outlined">error</span>⚠ Authorization failed: ${error}<br>${errorDescription || ''}</div>`;
        }
        // Clean up
        sessionStorage.removeItem('outlook_code_verifier');
        sessionStorage.removeItem('outlook_oauth_state');
        window.history.replaceState({}, document.title, window.location.pathname);
        return true;
    }
    if (code && savedOutlookState) {
        // Verify state to prevent CSRF attacks
        if (state && state === savedOutlookState) {
            await handleOutlookAuthorizationCode(code);
            return true;
        }
        else {
            const statusDiv = document.getElementById('outlook-auth-status');
            if (statusDiv) {
                statusDiv.className = 'auth-status unauthorized';
                statusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">error</span>⚠ Invalid state parameter. Possible CSRF attack detected.</div>';
            }
            // Clean up
            sessionStorage.removeItem('outlook_code_verifier');
            sessionStorage.removeItem('outlook_oauth_state');
            window.history.replaceState({}, document.title, window.location.pathname);
            return true;
        }
    }
    return false;
}
// Update Outlook auth UI status
async function updateOutlookAuthUI() {
    const googleStatusDiv = document.getElementById('outlook-auth-status');
    const authorizeOutlookButton = document.getElementById('authorize-outlook');
    if (googleStatusDiv && authorizeOutlookButton) {
        if (currentConfig?.calendars?.outlook?.auth?.access_token) {
            // Check if token is still valid
            const isValid = await verifyOutlookToken();
            if (isValid) {
                googleStatusDiv.className = 'auth-status authorized';
                googleStatusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">check_circle</span>✓ Connected to Outlook Calendar</div>';
                authorizeOutlookButton.textContent = 'Reauthorize Outlook Calendar';
            }
            else {
                googleStatusDiv.className = 'auth-status unauthorized';
                googleStatusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">error</span>Not connected to Outlook Calendar</div>';
                authorizeOutlookButton.textContent = 'Authorize Outlook Calendar';
            }
        }
        else {
            googleStatusDiv.className = 'auth-status unauthorized';
            googleStatusDiv.innerHTML = '<div class="status-message"><span class="material-symbols-outlined">error</span>Not connected to Outlook Calendar</div>';
            authorizeOutlookButton.textContent = 'Authorize Outlook Calendar';
        }
    }
}
//# sourceMappingURL=app.js.map