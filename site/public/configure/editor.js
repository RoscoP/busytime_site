// BusyTime configurator v1.0.8
import { TOP_LEVEL_ORDER } from './config.js?v=1.0.8';
import { resetConnectionTestState } from './connection-tests.js?v=1.0.8';
import { ensureDefaults, isPlainObject } from './helpers.js?v=1.0.8';
import { resetOauthState } from './oauth.js?v=1.0.8';
import { isSchemaLoaded } from './schema.js?v=1.0.8';
import { disarmRestart, renderMain, renderSidebar, resetRenderedStep } from './sidebar.js?v=1.0.8';
import { bumpSessionEpoch, markClean, setCurrentStepId, setSettings, settings, unlocked, updateDirty } from './state.js?v=1.0.8';
function enterWizard(isLoaded) {
    ensureDefaults();
    document.getElementById('gate').hidden = true;
    document.getElementById('wizard').hidden = false;
    markClean();
    if (isLoaded) {
        TOP_LEVEL_ORDER.forEach((id) => unlocked.add(id));
    }
    else {
        unlocked.add('wifi');
    }
    setCurrentStepId('wifi');
    renderSidebar();
    renderMain();
}
export function startNew() {
    if (!requireSchema())
        return;
    setSettings({ displays: { onboard: {} } });
    ensureDefaults();
    enterWizard(false);
}
export function restartEditor() {
    bumpSessionEpoch();
    resetConnectionTestState();
    resetOauthState();
    setSettings(null);
    setCurrentStepId('wifi');
    unlocked.clear();
    resetRenderedStep();
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
export function showGateError(message) {
    const err = document.getElementById('gate-error');
    err.hidden = false;
    err.textContent = message;
}
function requireSchema() {
    if (isSchemaLoaded())
        return true;
    showGateError('The settings schema is not loaded yet. Wait a moment, or reload the page if this persists.');
    return false;
}
export function loadFromFile(file) {
    if (!requireSchema())
        return;
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
        setSettings(parsed);
        document.getElementById('gate-error').hidden = true;
        enterWizard(true);
    };
    reader.readAsText(file);
}
export function markDirtyAndRefreshSidebar() {
    updateDirty();
    if (settings)
        renderSidebar();
}
