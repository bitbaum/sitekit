# @bitbaum/sitekit

A website as data.

A site is pages; a page is sections; sections come from a **closed** union of
shapes validated by Zod at runtime. One set of React renderers draws every
site. A provenance sidecar records where every generated field came from — so
"we fabricated nothing" is an assertion, not a promise.

Extracted from [substrata](https://github.com/bitbaum/substrata)'s hosted-site
model (2026-08). Decided in orangecat's ADR-0003 (the Site Factory).

## Why a closed union

A generator emitting **data against this schema** is a task with a
machine-checkable result; a generator emitting components is not. Per-site
quality becomes a property of the renderers — fixing the `cards` renderer
improves every site ever generated. And the schema is where review happens:
`validateSite()` returns `path: message` errors a model can act on directly.

The current kinds: `hero` (with optional CTAs), `prose`, `stats`, `meter`,
`cards`, `definitions`, `feature` (a figure beside a story), `contact`
(locations, address, hours — the fields provenance exists to protect), `faq`,
`index`, `table`. Most kinds take an optional `anchor`, and the schema rejects
any index entry or hero action that points at a fragment nothing carries. Extending the union is a deliberate act in THIS repo — a new
kind lands with its schema, its renderer, and its tests in one commit, and
every consumer gets it on the next version bump.

## Install

```bash
pnpm add @bitbaum/sitekit
```

ESM-only. `react >= 18` is a peer dependency of `@bitbaum/sitekit/react`; the root
export is framework-free (a Node generator or CI check can use it without React).

## Use

```ts
import { validateSite, siteNavItems, sitePageAt, pageRendersOwnHeader } from '@bitbaum/sitekit';

const result = validateSite(generatorOutput);
if (!result.success) throw new Error(result.errors.join('\n'));
const site = result.data; // fully typed SiteSpec from here on
```

```tsx
import Link from 'next/link';
import { SiteMasthead, SiteFooter, SiteSections } from '@bitbaum/sitekit/react';

<SiteMasthead chrome={site.chrome} navItems={siteNavItems(site.pages)} currentPath={path} Link={Link} />
<SiteSections sections={page.sections} />
<SiteFooter chrome={site.chrome} />
```

`Link` is the one framework seam: it defaults to a plain `<a>`, which is
correct everywhere; a Next.js app passes `next/link` to get client-side
navigation back.

## Application shell

Product apps use the same masthead, navigation and footer with the application
appearance. Import `@bitbaum/sitekit/styles.css` once. No Tailwind setup is
required for this appearance; `--sk-*` variables map it to the product's shared
design tokens. Existing document sites keep their utility-class appearance.

```tsx
<SiteMasthead appearance="application" chrome={chrome} navItems={nav}
  currentPath="analyze" mainId="main-content" Link={Link}
  brand={<Brand />} actions={<AccountControl />} />
<SiteFooter appearance="application" chrome={chrome} Link={Link}
  links={[{ href: '/roadmap', label: 'Roadmap' }]} extra="Beta" />
```

`styles.css` gives the chrome's own elements `box-sizing: border-box` at zero
specificity, so it measures the same with or without a host reset. A host rule
with any type, class or id selector still wins; a host rule on `*` alone has
the same zero specificity, so if it loads before `styles.css` it loses (the
usual `*, *::before, *::after { box-sizing: border-box }` reset agrees anyway). What a host passes into a slot (`brand`, `actions`, a footer's
`extra`, a tab `icon`) keeps the host's own box model.

Rendered nav items (`navItems`, `navGroups` items, `SiteNav` `items`) take a
`SiteNavLink`: either `path`, an in-site path always rendered through `href()`
(`'work'` → `/work`, `'notes:2026'` → `/notes:2026`), or `href`, used verbatim,
never both. An `href` must start with `http:`, `https:`, `mailto:`, `tel:`,
`//`, `#` or `?` (`isAllowedHref`); `siteNavLinkSchema` refuses anything else
(`bitcoin:` and `lightning:` included) with a message on the `href` field, and
the renderers leave such an item out. Its output is a `SiteNavLink`, so a
parsed item goes straight to the renderers. A nav or group left with no items
renders as one given none: the application nav and a group are not rendered,
the document nav renders an empty `<nav>`, as it does for `items={[]}`.
`siteNavItems()`, `SiteNavItem`, `siteNavItemSchema` and `SiteNavGroup` stay
path-only. A link to another origin, as a browser resolves it (`https://…`,
`//…`, `/\host`), gets `rel="noopener"`, in the nav and in the footer. The
footer renders every link as given except `javascript:`, `vbscript:` and
`data:` ones, which it drops, along with a group whose every link was dropped.
Tab bar items are always in-site paths.

A static site renders the same shell once, at build time, with
`renderToStaticMarkup` from `react-dom/server`. Pass `year` so the footer does
not read the clock (the page would otherwise change on 1 January;
`year={null}` prints none; a value that is not an integer from 1 to 9999
counts as omitted). Pass `trailingSlash` when the host serves each page as a directory:
`/work/`, the slash before any `?query` or `#fragment` (`/a/#b`), none after a
file name (`/feed.xml`) unless the path already ends in one (`/a/b.c/`), and `aria-current` then matches `currentPath` with or
without slashes at either end. Without `trailingSlash`, `aria-current` is set
only when `path` equals `currentPath` exactly, as before. Without hydration
the native menu still opens and closes; Escape and outside-click dismissal need
the React client.

```tsx
const html = renderToStaticMarkup(<>
  <SiteMasthead appearance="application" chrome={chrome} currentPath="work"
    trailingSlash navItems={[{ path: 'work', label: 'The work' },
      { href: 'https://github.com/bitbaum', label: 'Source' }]} />
  <SiteFooter appearance="application" chrome={chrome} year={2026}
    links={[{ href: 'https://github.com/bitbaum', label: 'Source' }]} />
</>);
```

For a grouped application menu, pass `navGroups` alongside `navItems`. Each
group has a `label` and `items` containing `path` (or `href`), `label` and an
optional `description`. Import `SiteNavGroup` (path-only items) or
`SiteNavLinkGroup` (items may be `href` links) from `@bitbaum/sitekit/react` for
typed configuration. Nonempty groups replace the flat application navigation with
one native disclosure and a responsive panel; omitted or empty groups retain
the flat API. Group labels, destinations and descriptions belong to the host.

```tsx
navGroups={[{ label: 'Create', items: [
  { path: 'write', label: 'Write', description: 'Start an article.' }
] }]}
```

Run `pnpm exec playwright install --with-deps chromium` before `pnpm run verify`.
An existing Chromium can be selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
The browser regression uses the public renderer and stylesheet at four widths.

The package owns the responsive menu, its native no-JavaScript fallback,
Escape/outside/route dismissal, skip link, active states, touch targets and
footer layout. Products supply labels, navigation data, identity and account
slots. Fix shared chrome here, then release and update consumers through their
normal dependency checks and deployment pipeline.

## Provenance — the check behind "fabricate no facts"

A closed schema invites completion: a model handed a `stats` section wants
numbers in it. So absence is first-class and typed. The generator emits a
sidecar keyed by JSON path:

```ts
import { assertDeliverable, notFoundPaths } from '@bitbaum/sitekit';

const provenance = {
  'chrome.name':                    { kind: 'scraped', url: 'https://cafe-beispiel.ch/' },
  'pages.0.sections.1.paragraphs.0':{ kind: 'operator' },   // a human typed it
  'pages.0.sections.4.cards.0.meta':{ kind: 'inferred' },   // a model invented it
  'pages.0.sections.7.rows.0.1':    { kind: 'not-found' },  // we looked; it isn't public
};

assertDeliverable(provenance); // throws: names the inferred path
notFoundPaths(provenance);     // the honest gaps — in a pitch, these ARE the pitch
```

`not-found` is the difference between *unknown* and *empty*: it records that
the looking happened, which is what makes "here is what we could not find out
about you" an honest sentence instead of an excuse.

## The styling contract

The renderers emit **semantic utility classes and nothing else** — no colours,
faces, or radii ship in this package. Each consumer defines the tokens, which
is how fifty sites share one renderer without looking like one company.
(Uniform everywhere except aesthetics. Do NOT point consumers at
`@fleet/design-tokens` values — those make things look like the fleet;
inherit the *shape*, choose your own values.)

Classes the renderers use, to be defined by the consumer's Tailwind theme:

| Group | Classes |
|---|---|
| Text | `text-fg-primary` `text-fg-secondary` `text-fg-tertiary` `text-fg-muted` |
| Surfaces | `bg-surface-page` `bg-surface-raised` |
| Borders | `border-subtle` `border-strong` `divide-subtle` |
| Accent & status | `bg-accent` `decoration-accent` `bg-status-positive` `bg-status-warning` `bg-status-negative` |
| Type | `font-heading` `font-mono` `tracking-caps` `tracking-display` |
| Layout | `max-w-shell` `max-w-prose` `scrollbar-hide` |

With Tailwind 4, define them as `@theme` variables (`--color-fg-primary`,
`--font-heading`, …) and add the package to content scanning:

```css
@import 'tailwindcss';
@source '../node_modules/@bitbaum/sitekit/dist';
```

Substrata's `app/globals.css` is the reference implementation of the contract.

## Not in this package

- **No design tokens.** See above — that is the point.
- **No scraper.** `siteFromUrl()` (extraction from a live site, with
  provenance) is the planned next module; the schema is its target.
- **No HTTP, no framework.** Same rule as every package in this fleet.

## Verify

```bash
pnpm run verify  # lint + typecheck + build + test — same command CI runs
```

Tests import the package by **name** (`@bitbaum/sitekit`, `@bitbaum/sitekit/react`), so a broken
`exports` map fails in CI, not at the first consumer.

---

Part of **[bitbaum](https://bitbaum.orangecat.ch)** — AI-native products on open
infrastructure, built in Zürich. Every package here lists the apps that use it:
**[which apps use sitekit](https://bitbaum.orangecat.ch/packages/#sitekit)**.

Application footers can pass `groups: [{ label, links: [{ href, label }] }]` for
semantic navigation groups. Existing flat `links` remain supported. Consumers
can configure `--sk-header-height`, `--sk-mobile-header-height`,
`--sk-display-weight`, `--sk-display-leading`, `--sk-display-tracking` and
`--sk-footer-gap` through their theme adapter, without replacing shared markup.

## Mobile tab bar

`SiteTabBar` renders a fixed bottom navigation for small screens (hidden from
48rem up, where the masthead nav takes over). Pass 3–5 `{ path, label, icon }`
items and the current path; it renders its own spacer so content is not hidden.
A tab's `path` is always an in-site path; `trailingSlash` works as on the
masthead.

Use `SiteIcon` for the icons — `{ icon: <SiteIcon name="write" /> }` — not a
unicode glyph: the set is drawn on `currentColor`, so icon and label take one
colour and the current tab is one rule. Names: `SITE_ICON_NAMES`. Pass
`tabBar` to `SiteMasthead` on the same page so the masthead drops its menu
button on phones instead of repeating the tab bar's destinations:

```tsx
<SiteMasthead appearance="application" tabBar navItems={nav} … />
<SiteTabBar items={nav.map((n) => ({ ...n, icon: <SiteIcon name={n.icon} /> }))} … />
```
