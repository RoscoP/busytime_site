// BusyTime configurator v1.0.9
export function mountShell() {
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
}
mountShell();
