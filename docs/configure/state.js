// BusyTime configurator v1.0.9
export let settings = null;
export let currentStepId = 'wifi';
export const unlocked = new Set();
export let dirty = false;
let cleanSnapshot = '';
export let sessionEpoch = 0;
export function setSettings(value) {
    settings = value;
}
export function setCurrentStepId(id) {
    currentStepId = id;
}
export function bumpSessionEpoch() {
    sessionEpoch++;
}
export function settingsSnapshot() {
    return settings ? JSON.stringify(settings) : '';
}
export function markClean() {
    cleanSnapshot = settingsSnapshot();
    dirty = false;
}
export function markDirty() {
    dirty = true;
}
export function updateDirty() {
    dirty = settingsSnapshot() !== cleanSnapshot;
}
