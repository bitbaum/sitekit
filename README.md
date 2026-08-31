# sitekit

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
npm i github:bitbaum/sitekit#v0.3.0
```

ESM-only. `react >= 18` is a peer dependency of `sitekit/react`; the root
export is framework-free (a Node generator or CI check can use it without React).

## Use

```ts
import { validateSite, siteNavItems, sitePageAt, pageRendersOwnHeader } from 'sitekit';

const result = validateSite(generatorOutput);
if (!result.success) throw new Error(result.errors.join('\n'));
const site = result.data; // fully typed SiteSpec from here on
```

```tsx
import Link from 'next/link';
import { SiteMasthead, SiteFooter, SiteSections } from 'sitekit/react';

<SiteMasthead chrome={site.chrome} navItems={siteNavItems(site.pages)} currentPath={path} Link={Link} />
<SiteSections sections={page.sections} />
<SiteFooter chrome={site.chrome} />
```

`Link` is the one framework seam: it defaults to a plain `<a>`, which is
correct everywhere; a Next.js app passes `next/link` to get client-side
navigation back.

## Provenance — the check behind "fabricate no facts"

A closed schema invites completion: a model handed a `stats` section wants
numbers in it. So absence is first-class and typed. The generator emits a
sidecar keyed by JSON path:

```ts
import { assertDeliverable, notFoundPaths } from 'sitekit';

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
@source '../node_modules/sitekit/dist';
```

Substrata's `app/globals.css` is the reference implementation of the contract.

## Not in this package

- **No design tokens.** See above — that is the point.
- **No scraper.** `siteFromUrl()` (extraction from a live site, with
  provenance) is the planned next module; the schema is its target.
- **No HTTP, no framework.** Same rule as every package in this fleet.

## Verify

```bash
npm run verify   # lint + typecheck + build + test — same command CI runs
```

Tests import the package by **name** (`sitekit`, `sitekit/react`), so a broken
`exports` map fails in CI, not at the first consumer.
