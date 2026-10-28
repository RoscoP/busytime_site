# BusyTime site

Source for https://busytime.org, built with [Astro](https://astro.build). All work happens in [site/](site/).

## Commands

Run from `site/`:

* `npm install`: Installs dependencies.
* `npm run dev`: Starts the development server.
* `npm run build`: Builds static files into `site/dist`.
* `npm run preview`: Serves the built site locally.
* `./Build.ps1`: Builds, then replaces the contents of `docs/` with the build output. GitHub Pages serves `docs/`, so commit the result to publish.

## Previewing a build

Pages and assets use root-relative paths (`/guide`, `/img/busytime.png`), so
`docs/index.html` (or `site/dist/index.html`) must be opened through a local
web server, never by double-clicking the file. Opening it directly via
`file://` breaks the logo and every nav link, because those paths resolve
against the filesystem root instead of the site folder. This isn't new to
Astro — the previous Docusaurus build had the same requirement.

To preview correctly, use one of:

* `cd site; npm run preview` — serves the `dist/` build output.
* `npx serve docs` — serves the committed `docs/` folder.
* `python -m http.server` run from inside `docs/`.

## Editing content

Page text is Markdown in `site/src/content/pages/`. See [site/STYLE_GUIDE.md](site/STYLE_GUIDE.md) for content rules and [site/CSS_ASTRO_CONVENTIONS.md](site/CSS_ASTRO_CONVENTIONS.md) for layout and CSS rules.

## Configuration tool

The configuration tool is built from `src/webapp` in the busytime repo and served at `/configure`, natively inside the site layout. Its built files (`app.js`, `app.css`, `callback.js`) live in `site/public/configure/` and are committed here, so the site builds without the busytime repo. Do not edit them by hand. To update them, run `Deploy-Webapp.ps1` from the busytime repo:

* `.\Deploy-Webapp.ps1 -Serve`: builds the tool, copies it here and runs the dev server for a preview.
* `.\Deploy-Webapp.ps1 -Deploy`: bumps the webapp version, copies the tool here, runs `site/Build.ps1` to refresh `docs/`, and sets a jj description if the change has none. It never pushes; review with `jj diff` and push yourself.

`src/pages/oauth-callback.html.astro` is the OAuth redirect page. It must stay at `/oauth-callback.html`, the URL registered with Google and Microsoft; `astro.config.mjs` flattens it to a real file. `public/ConfigureBusyTime.html` redirects the retired standalone tool's old URL to `/configure`.
