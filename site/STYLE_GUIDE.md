# BusyTime Site Style Guide (Astro)

Audience: agents and contributors adding or editing pages. Follow this so new content matches the reference design in `src/layouts/Base.astro` and `src/pages/index.astro`.

For code structure (CSS placement, Astro file conventions, tokens, verification), see `CSS_ASTRO_CONVENTIONS.md`.

Tone of the design: formal, direct, restrained. Reads like product documentation. No decoration for its own sake.

## 1. Architecture

| Concern | Where it lives | Who edits it |
|---|---|---|
| Design tokens, header, footer, page chrome | `src/layouts/Base.astro` (global `<style>`) | Design changes only |
| Long-form page styling (`.prose`) | `src/layouts/Doc.astro` (wraps `Base`) | Design changes only |
| Page copy | `src/content/pages/*.md` (frontmatter + Markdown) | Anyone |
| Home page structure | `src/pages/index.astro` | Developers |
| Static assets | `public/` (`/img/...`, `configure/` configurator files) | Anyone |

Content is Markdown. Styling is applied by element selectors, so authors never add classes or inline styles in Markdown.

## 2. Rules for Markdown content

Frontmatter (required):

```md
---
title: Setup Guide
description: One-sentence summary used for the page meta description.
---
```

- Do not write an `# H1` in the body. `Doc.astro` renders the frontmatter `title` as the single H1.
- Start sections at `##`. Use `###` for subsections. Never skip levels.
- Headings are sentence case ("Connect to a work calendar"), no trailing punctuation, no emoji.
- Use numbered lists for sequential steps and bullet lists for unordered facts. Keep list items to one or two sentences.
- Use tables for enumerations with attributes (for example, status colors). Always include a header row.
- Bold only for UI labels the user must click (`**Settings**`). Do not use bold for emphasis. Do not use italics for decoration.
- Links: descriptive text, never "click here". Internal links use root-relative paths (`/guide`), not `./guide.md`.
- Images: Markdown syntax `![Alt text describing the screen](/img/CalendarSettings.png)`, on its own line. Alt text is required. Images live in `public/img/`. Do not use `<img>` tags, width attributes or inline styles; `.prose img` handles sizing.
- No raw HTML, inline SVG, `<br/>` or inline `style` in Markdown. Use Markdown constructs only.
- Write in plain, factual sentences. Avoid marketing language ("seamless", "powerful", "effortless"), exclamation marks, rhetorical questions and second-person flourishes. Prefer "Select a calendar." to "Simply pick your favourite calendar!".
- Use American spelling and the product names exactly: BusyTime, Google Calendar, USB-C, WiFi.

## 3. Design tokens (defined in `Base.astro`)

Use the CSS variables. Do not hard-code colors elsewhere.

| Token | Value | Use |
|---|---|---|
| `--text` | `#1c2430` | Body text and headings |
| `--muted` | `#5b6573` | Secondary text, table headers, footer |
| `--line` | `#d9dee5` | Borders and rules |
| `--bg` | `#ffffff` | Page background |
| `--alt` | `#f5f7f9` | Table header background |
| `--link` | `#14508c` | Links and the primary button |

Status colors (the only saturated colors on the site) are used only for status swatches and the top bar:
`#00ff00` free, `#00a0a0` free/scheduled, `#ffff00` upcoming, `#ff8800` busy with more to follow, `#ff0000` busy, `#000000` off.

Typography: system font stack, 17px base, line-height 1.65. H1 2.4rem, H2 1.3rem with a 1px bottom rule. Body line length capped at about 60-70ch.

Layout: single column, max width 960px, 24px side padding. Section spacing 48px.

## 4. Component rules

- Header: logo, wordmark, text nav. Nav items are plain text links; no buttons, no icons. Add a nav entry by editing the `nav` array in `Base.astro`.
- Top bar: 5px four-segment status bar. Do not repeat it elsewhere.
- Button: at most one primary button per page (`.btn`, solid `--link`, white text, 3px radius). Secondary actions are ordinary text links.
- Table: full width, header row on `--alt`, 1px row rules, no zebra striping, no rounded corners.
- Status swatch: 36x18px rectangle with a thin dark border, `class="sw"`.
- Images: 1px `--line` border, no shadows, no rounded corners.
- Footer: copyright left, Privacy | Terms right.

## 5. Prohibited

- Gradients (except the top bar), glows, drop shadows, blur or translucency effects.
- Animation, parallax, scroll effects, auto-playing media.
- Emoji, decorative icons, icon fonts.
- Dark theme (not currently supported; do not add partial dark styles).
- Card grids, hero banners, badges, pill-shaped buttons.
- Additional fonts, web-font downloads or third-party CSS frameworks.
- Inline styles or per-page color overrides.
- JavaScript on content pages. The site ships no client JS except the configurator.

## 6. Adding a new page

1. Create `src/content/pages/<slug>.md` with the required frontmatter.
2. Write content following section 2.
3. Ensure a route renders it with `Doc.astro` (the shared dynamic route `src/pages/[...slug].astro` does this for all pages in the `pages` collection, except `home`, which is rendered by `index.astro`).
4. Add the page to the `nav` array in `Base.astro` if it should appear in the header.
5. Run `npm run build` and check the page at desktop width and at about 400px width.

## 7. Do not touch

- `public/configure/**`: the configurator (`app.js`, `app.css`, `callback.js`), built in the busytime repo (`src/webapp`) and copied here by `Deploy-Webapp.ps1`. Change it there, never by hand. Its page is `src/pages/configure.astro`; the OAuth redirect page is `src/pages/oauth-callback.html.astro`, which must keep producing exactly `/oauth-callback.html`.
- `public/ConfigureBusyTime.html`: redirect stub for the retired standalone configurator. Leave in place.
- `public/CNAME`, `.nojekyll` and `.well-known/`: required for hosting and OAuth.

## 8. Checklist before finishing

- [ ] Frontmatter present; no H1 in the body; heading levels in order.
- [ ] No raw HTML, inline styles, emoji or marketing language.
- [ ] All images have alt text and live in `public/img/`.
- [ ] Internal links are root-relative and resolve after build.
- [ ] No new colors, fonts, effects or components introduced.
- [ ] `npm run build` completes without warnings.
