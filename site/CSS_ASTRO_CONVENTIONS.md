# BusyTime Site: CSS and Astro Conventions

Audience: agents and developers writing or modifying `.astro` and CSS files. For authoring Markdown content, see `STYLE_GUIDE.md`. This document covers how the code is structured. Where this document and the demo code differ, this document is normative; the differences are listed in section 11.

## 1. Stack and constraints

- Astro 5, static output (`output: 'static'`, the default). No SSR, no adapters.
- Plain CSS only, written in Astro `<style>` blocks. No Tailwind, Sass, CSS-in-JS or UI frameworks.
- No client-side JavaScript on site pages. Do not add `<script>` tags or framework islands (React, Vue, etc.).
- No runtime dependencies beyond `astro` and `@astrojs/sitemap`. Do not add npm packages for styling or layout.
- The pre-built configurator in `public/` is out of scope and must not be modified.

## 2. Project layout

```
src/
  content.config.ts        collection schema (Zod)
  content/pages/*.md       page copy; frontmatter: title, description
  layouts/
    Base.astro             html shell, tokens, header, footer (global CSS)
    Doc.astro              wraps Base; renders title as H1 and body in .prose
  pages/
    index.astro            home page (structured, not pure Markdown)
    [...slug].astro        renders every other `pages` entry with Doc.astro
public/                    served as-is: img/, configurator, CNAME, .well-known
```

Rules:
- One layout per concern. Do not create a layout for a single page; put that page's structure in the page file.
- Components (if needed later) go in `src/components/` as `PascalCase.astro`. Add a component only when the same markup is used on two or more pages.

## 3. Where CSS goes

| Kind of rule | Location |
|---|---|
| Design tokens (`:root` variables), element resets, header, footer, `.inner`, `.bar` | `Base.astro`, in `<style is:global>` |
| Long-form content styling (`.prose` and its descendants) | `Doc.astro`, in `<style is:global>` scoped under `.prose` |
| Styling for markup in one page or component | That file's own `<style>` (scoped, the default) |

Rules:
- Default to scoped `<style>`. Use `is:global` only in `Base.astro` and `Doc.astro`.
- Do not create `.css` files or import stylesheets. If the global block in `Base.astro` grows beyond roughly 150 lines, extract it to `src/styles/global.css` and import it once in `Base.astro`; do not otherwise split it.
- Rendered Markdown (the `<Content />` output) has no Astro scope attribute. Style it only through `.prose` rules in `Doc.astro`, or with `:global()` inside a scoped parent, for example `.body :global(p) { ... }`. Never use a bare global selector for this.
- No inline `style=""` attributes, with one exception: passing a data-driven value as a CSS custom property or a background color from an array (for example the status swatch `style={`background:${s.color}`}`).
- No `!important`.

## 4. Tokens

All colors and shared measurements are CSS custom properties on `:root` in `Base.astro`. Components reference them with `var(--name)`.

Required tokens:

| Token | Value |
|---|---|
| `--text` | `#1c2430` |
| `--muted` | `#5b6573` |
| `--line` | `#d9dee5` |
| `--bg` | `#ffffff` |
| `--alt` | `#f5f7f9` |
| `--link` | `#14508c` |
| `--link-hover` | `#0e3d6c` |
| `--status-free` | `#00ff00` |
| `--status-free-scheduled` | `#00a0a0` |
| `--status-upcoming` | `#ffff00` |
| `--status-busy-next` | `#ff8800` |
| `--status-busy` | `#ff0000` |
| `--status-off` | `#000000` |
| `--status-error` | `#0000ff` |
| `--measure` | `60ch` (maximum paragraph width) |
| `--page-width` | `960px` |

Rules:
- No hex, `rgb()` or named colors in component or page CSS. Add a token first if a new color is truly needed, and justify it in the PR or commit message.
- Exception: the top status bar gradient in `Base.astro` may use the status tokens directly.
- Spacing uses this scale only: `4, 8, 12, 16, 24, 32, 48, 72` px. Do not use arbitrary values such as 13px or 37px.
- Font sizes: body `1.0625rem` (17px), small `0.9rem`, table header `0.85rem`, H2 `1.3rem`, H3 `1.1rem`, H1 `2.4rem`. Do not introduce others.
- Border radius: `0` everywhere except the primary button (`3px`).
- Borders are `1px solid var(--line)`.

## 5. Selectors and naming

- Prefer element selectors scoped by Astro (`h1`, `table`, `th`). Use a class only to distinguish variants or when no element expresses the role.
- Class names are lowercase, short, hyphenated nouns describing the role, not the appearance: `.intro`, `.btn`, `.sw`, `.links`. Avoid `.blue`, `.big`, `.left`.
- No IDs for styling. No BEM, no utility classes.
- Maximum selector depth of three. No qualified element-class selectors like `div.card`.
- A page-level wrapper uses `<main>` with a max width from `--page-width`. Do not nest `<main>`.

## 6. Layout conventions

- Single column, centered, `max-width: var(--page-width)`, 24px horizontal padding.
- Use CSS Grid for two-column page sections and Flexbox for single-row alignment (header, footer, button rows). No floats or absolute positioning for layout.
- Vertical rhythm: sections separated by 48px (`section { margin-top: 48px }`); footer by 72px.
- Responsive: one breakpoint, `@media (max-width: 700px)`, collapsing multi-column grids to one column. No other breakpoints. Use `min`/`max` widths and `%`/`ch` units instead of adding breakpoints.
- Tables need no horizontal-scroll wrapper at current content widths. If a table overflows, shorten the content rather than adding JS or wrappers.

## 7. Astro file conventions

Order inside a `.astro` file: frontmatter script, markup, `<style>`.

Frontmatter:
- Imports first, then constants and data, then derived values.
- Comment only non-obvious intent (for example, where the copy is edited).
- Type props with `interface Props { ... }` and `const { x } = Astro.props;` when a layout or component takes more than one prop. A single optional `title` may stay untyped.
- Static data (nav items, status table) is a `const` array in frontmatter, rendered with `.map()`. Each mapped item needs no `key`.

Markup:
- Semantic elements: `header`, `nav`, `main`, `section`, `footer`, `table` with `thead`/`tbody`, `ol`/`ul`.
- One `<h1>` per page. Heading levels do not skip.
- Decorative elements get `aria-hidden="true"`. Informative images get meaningful `alt`; decorative images use `alt=""`.
- Links to internal pages are root-relative (`/guide`). Do not hard-code `https://busytime.org`; `site` in `astro.config.mjs` provides it.
- Assets are referenced from `public/` by absolute path (`/img/busytime.png`). Do not import images into components.

Pages and routing:
- Markdown content comes from the `pages` collection via `getEntry` / `getCollection` and `render`. Do not read files with `fs` or use `import.meta.glob` for page copy.
- `[...slug].astro` must implement `getStaticPaths()` over `getCollection('pages')`, excluding the `home` entry, and pass `entry` as a prop.
- Every page sets a `<title>` through the layout `title` prop. Format: `Page title – BusyTime`; the home page uses `BusyTime – Lights for Busy Times`.

Content schema (`content.config.ts`): `title` required string, `description` optional string. Add a field only when a layout reads it.

## 8. Accessibility baseline

- Body text contrast at least 4.5:1 against `--bg`. Do not use `--muted` for text smaller than 0.9rem.
- Links are underlined in running text and `.prose`. Nav links may be underlined on hover only.
- Focus states: do not remove the default outline. If customized, use a 2px solid `--link` outline with 2px offset.
- Color is never the only carrier of meaning. Each status swatch has a text label in an adjacent cell.
- No motion. If animation is ever approved, it must be wrapped in `@media (prefers-reduced-motion: no-preference)`.

## 9. Performance and output

- No web fonts, no external requests, no third-party scripts (other than analytics when explicitly added to `Base.astro`).
- Images in `public/` should be PNG or WebP and under 150 KB each.
- The build output (`dist/`) must be self-contained static files suitable for copying into the GitHub Pages folder.

## 10. Verification

Run after any change:

1. `npm run build` completes with no errors or warnings.
2. Open the built page (`npm run preview`) at about 1280px and 400px width; nothing overflows horizontally. Always use `npm run preview` or another local server for this — never open a built HTML file directly via `file://`, since root-relative paths (section 6 links, image `src`s) only resolve correctly when served from an origin root.
3. Search for violations:
   - Hard-coded colors outside `Base.astro`: grep `#[0-9a-fA-F]{3,8}` in `src/pages` and `src/layouts/Doc.astro`; matches should be limited to data arrays being migrated to tokens.
   - `style=` attributes: allowed only per section 3.
   - `<script` in `src/`: none allowed.
   - `!important`: none allowed.
4. Confirm heading order and that the page has exactly one `<h1>`.

## 11. Approved exceptions

- `@astrojs/sitemap` is the only integration beyond `astro` (generates `sitemap-index.xml`; `Build.ps1` also copies it to `sitemap.xml`).
- Google Analytics (`G-TGQCDHSP9R`) is loaded from `Base.astro`, and only when `location.hostname === 'busytime.org'`.
- `--status-error` (`#0000ff`) represents the pulsing blue/red error state as a static swatch.
- H3 in `.prose` is `1.1rem`.
- `Doc.astro` does not append " – BusyTime" to a title that already contains "BusyTime".
- Element widths (the 160px home logo column, the 96px mobile logo, swatch sizes, `min(100%, 640px)` prose images) are not spacing and are exempt from the scale.
- `/configure` embeds the pre-built `/ConfigureBusyTime.html` in an iframe. Restyling that app to match this guide is future work.
