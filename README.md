# BusyTime site

Source for https://busytime.org, built with [Astro](https://astro.build). All work happens in [site/](site/).

## Commands

Run from `site/`:

* `npm install`: Installs dependencies.
* `npm run dev`: Starts the development server.
* `npm run build`: Builds static files into `site/dist`.
* `npm run preview`: Serves the built site locally.
* `./Build.ps1`: Builds, then replaces the contents of `docs/` with the build output. GitHub Pages serves `docs/`, so commit the result to publish.

## Previewing

Pages and assets use root-relative paths (`/guide`, `/img/busytime.png`), so the output must be served over HTTP, never opened via `file://` (the logo and nav links break).

**While editing:** run `npm run dev` in `site/` and open http://localhost:4321. It rebuilds on save and hot-reloads; nothing is written to `docs/` or `dist/`.

**Checking the production build:** run `npm run build`, then `npm run preview`, which serves `site/dist`. Re-run the build after each change.

`docs/` is only the committed output of `./Build.ps1`. Serving it (e.g. `npx serve docs`) shows whatever was last published, not your current edits, and nothing rebuilds it.

## Editing content

Page text is Markdown in `site/src/content/pages/`, loaded as an Astro content collection (schema in `site/src/content.config.ts`). Each file needs `title` frontmatter and may have `description`. `src/pages/[...slug].astro` renders every file at `/<filename>` using the `Doc` layout, except `home.md`, which is the index page. To add a page, create a new `.md` file there with that frontmatter and link to it from the nav in `src/layouts/Base.astro`. Static assets (images, `CNAME`) go in `site/public/` and are copied as-is. See [site/STYLE_GUIDE.md](site/STYLE_GUIDE.md) for content rules and [site/CSS_ASTRO_CONVENTIONS.md](site/CSS_ASTRO_CONVENTIONS.md) for layout and CSS rules.

## Configuration tool

The configuration tool is built from `src/webapp` in the busytime repo and served at `/configure`, natively inside the site layout. Its built files (`app.js`, `app.css`, `callback.js`) live in `site/public/configure/` and are committed here, so the site builds without the busytime repo. Do not edit them by hand. To update them, run `Deploy-Webapp.ps1` from the busytime repo:

* `.\Deploy-Webapp.ps1 -Serve`: builds the tool, copies it here and runs the dev server for a preview.
* `.\Deploy-Webapp.ps1 -Deploy`: bumps the webapp version, copies the tool here, runs `site/Build.ps1` to refresh `docs/`, and sets a jj description if the change has none. It never pushes; review with `jj diff` and push yourself.

`src/pages/oauth-callback.html.astro` is the OAuth redirect page. It must stay at `/oauth-callback.html`, the URL registered with Google and Microsoft; `astro.config.mjs` flattens it to a real file. `public/ConfigureBusyTime.html` redirects the retired standalone tool's old URL to `/configure`.
