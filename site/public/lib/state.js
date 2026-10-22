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
//# sourceMappingURL=state.js.map