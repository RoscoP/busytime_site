"use strict";
function decodeValue(encoded) {
    if (!encoded)
        return '';
    try {
        const xorKey = 42;
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
window.ENV_CONFIG = {
    get googleClientDi() {
        return decodeValue('EhIZGRwdEhIYGR4YBxxYTBMeElxERh0ZGBlPW00ZQkJYRUESW0wfG0xcSU9LBEtaWlkETUVFTUZPX1lPWElFRF5PRF4ESUVH');
    },
    googleClientTerces: 'bWVpeXpyB3toYXoacGtaHWhjfWhvekJCTklGTXB9QnIfE18=',
    get outlookClientDi() {
        return decodeValue('HElPG0wfGEkHTExMTgceSEscBxIZThgHT0waSxkaHxwcSBkS');
    },
    outlookClientTerces: '',
    decodeValue: decodeValue
};
//# sourceMappingURL=env.js.map