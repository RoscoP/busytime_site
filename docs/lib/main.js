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
//# sourceMappingURL=main.js.map