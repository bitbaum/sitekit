# Changelog

This retrospective record was added on 2026-10-27 from the immutable sources
linked below. Git commit dates are source dates, not inferred npm publication
dates. A GitHub release does not itself establish npm publication.
Application adoption and deployment evidence are tracked separately.

## Unreleased

- `SiteIcon` and `SITE_ICON_NAMES`: one stroke icon set on `currentColor` (home, write, search, compass, star, user, chat, bell, settings, list, globe, book, heart, plus, menu, calendar, wallet, chart) for tab bars and account actions, so products stop passing unicode glyphs that render differently on every phone.
- `SiteTabBar` look: equal cells in a grid, a 24px icon box (SVG or glyph), 11px/600 labels, the current tab marked by a short rule above its icon and full text colour instead of a fill, 56px cells with the safe-area inset outside them.
- `SiteMasthead` `tabBar` prop: when the page also renders a `SiteTabBar`, the masthead drops its menu button below 48rem — the tab bar is the navigation there — and keeps the account actions in the row.
- `SiteTabBar`: a mobile bottom tab bar (3–5 items, icon + label, nested-path current state, safe-area aware), hidden from 48rem up. First consumer: BiasLens.

## 0.4.2

- [Tagged source `v0.4.2`](https://github.com/bitbaum/sitekit/tree/835396d498ded73b86bb7a20eecdd5a0e581660e)
- [Source commit](https://github.com/bitbaum/sitekit/commit/835396d498ded73b86bb7a20eecdd5a0e581660e), dated 2026-10-24.

No authored release notes were found for this tag when this record was made.
The links identify the verified source; missing feature history is not invented.
