// BusyTime configurator v1.0.9
let settingsSchema = null;
export async function loadSchema() {
    if (settingsSchema)
        return;
    const url = new URL('settings.schema.json', import.meta.url);
    url.search = new URL(import.meta.url).search;
    const response = await fetch(url);
    if (!response.ok)
        throw new Error(`HTTP ${response.status}`);
    settingsSchema = (await response.json());
}
export function isSchemaLoaded() {
    return settingsSchema !== null;
}
export function getSchema() {
    if (!settingsSchema)
        throw new Error('The settings schema has not been loaded.');
    return settingsSchema;
}
