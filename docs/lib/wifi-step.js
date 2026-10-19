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
        const toggle = el('button', { class: 'icon-only md-button-outlined', type: 'button' }, [visibilityIcon]);
        const removeBtn = el('button', { class: 'icon-only md-button-outlined', type: 'button', onclick: () => { delete settings.wifis[name]; renderMain(); } }, [
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
    const pwToggle = el('button', { class: 'icon-only md-button-outlined', type: 'button', 'aria-label': 'Show password', title: 'Show password' }, [visibilityIcon]);
    pwToggle.addEventListener('click', () => {
        pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
        const label = pwInput.type === 'password' ? 'Show password' : 'Hide password';
        visibilityIcon.textContent = pwInput.type === 'password' ? 'visibility' : 'visibility_off';
        pwToggle.setAttribute('aria-label', label);
        pwToggle.title = label;
    });
    pwWrap.appendChild(pwInput);
    pwWrap.appendChild(pwToggle);
    const addBtn = el('button', { class: 'md-button-tonal', type: 'button' }, [el('span', { class: 'material-symbols-outlined' }, ['add']), 'Add Network']);
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
//# sourceMappingURL=wifi-step.js.map