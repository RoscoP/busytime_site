"use strict";
// Environment variables will be injected here during build
// This will be available as a global variable in the browser
// Decoding utility for obfuscated values (base64 + XOR)
function decodeValue(encoded) {
    if (!encoded)
        return '';
    try {
        const xorKey = 42; // Simple XOR key for obfuscation
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
// For browsers without module support, set global variable
// Client IDs and terces (secrets) are encoded during build for obfuscation
window.ENV_CONFIG = {
    get googleClientId() {
        return decodeValue('EhIZGRwdEhIYGR4YBxxYTBMeElxERh0ZGBlPW00ZQkJYRUESW0wfG0xcSU9LBEtaWlkETUVFTUZPX1lPWElFRF5PRF4ESUVH');
    },
    googleClientTerces: 'bWVpeXpyB3toYXoacGtaHWhjfWhvekJCTklGTXB9QnIfE18=',
    get outlookClientId() {
        return decodeValue('HElPG0wfGEkHTExMTgceSEscBxIZThgHT0waSxkaHxwcSBkS');
    },
    outlookClientTerces: '',
    decodeValue: decodeValue
};
//# sourceMappingURL=env.js.map