import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The OAuth redirect URI registered with Google and Microsoft is exactly /oauth-callback.html, but
// directory-format output nests the page as oauth-callback.html/index.html. Move it up to a real file.
const flattenOauthCallback = {
  name: 'flatten-oauth-callback',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const root = fileURLToPath(dir);
      const folder = path.join(root, 'oauth-callback.html');
      const temp = path.join(root, 'oauth-callback.tmp');
      fs.renameSync(path.join(folder, 'index.html'), temp);
      fs.rmdirSync(folder);
      fs.renameSync(temp, folder);
    },
  },
};

export default defineConfig({
  site: 'https://busytime.org',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (page) => !page.includes('oauth-callback') }), flattenOauthCallback],
});
