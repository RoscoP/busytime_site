// BusyTime configurator v1.0.11
import './shell.js?v=1.0.11';
import { loadFromFile, markDirtyAndRefreshSidebar, showGateError, startNew } from './editor.js?v=1.0.11';
import { loadSchema } from './schema.js?v=1.0.11';
import { dirty } from './state.js?v=1.0.11';
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
loadSchema().catch((e) => {
    showGateError('Could not load the settings schema (' + e.message + '). Reload the page to try again.');
});
const wizardEl = document.getElementById('wizard');
wizardEl.addEventListener('input', markDirtyAndRefreshSidebar);
wizardEl.addEventListener('click', markDirtyAndRefreshSidebar);
window.addEventListener('beforeunload', (e) => {
    if (dirty) {
        e.preventDefault();
        e.returnValue = '';
    }
});
