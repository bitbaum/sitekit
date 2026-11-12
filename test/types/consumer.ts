/**
 * Compiled by `pnpm run typecheck`: what an existing consumer wrote against
 * 0.7.0 must still type-check. Adding `href` items made `SiteNavItem` a union
 * once, and `item.path` turned into `string | undefined` for every consumer
 * (substrata's test/site-content.test.ts did `paths.has(item.path)`).
 */
import type { ComponentProps } from 'react';

import {
  siteNavItems,
  siteNavItemSchema,
  siteNavLinkSchema,
  type SiteNavItem,
  type SiteNavLink,
  type SitePage,
} from '../../src/index.js';
import {
  SiteMasthead,
  SiteNav,
  type SiteNavGroup,
  type SiteNavLinkGroup,
} from '../../src/react/index.js';

declare const pages: SitePage[];

// Path-only types keep a required `path: string`.
export const lengths: number[] = siteNavItems(pages).map((i) => i.path.length);
export const paths = new Set(pages.map((page) => page.path));
export const known: boolean[] = siteNavItems(pages).map((item) => paths.has(item.path));
export const parsedPath: string = siteNavItemSchema.parse({ path: 'a', label: 'A' }).path;
declare const group: SiteNavGroup;
export const groupPath: string | undefined = group.items[0]?.path.toUpperCase();

// What is rendered takes either; every path-only value is one.
const work: SiteNavItem = { path: 'work', label: 'Work' };
export const links: SiteNavLink[] = [work, { href: 'https://github.com/bitbaum', label: 'Source' }];
export const groups: SiteNavLinkGroup[] = [group];
export const mastheadItems: ComponentProps<typeof SiteMasthead>['navItems'] = siteNavItems(pages);
export const mastheadGroups: ComponentProps<typeof SiteMasthead>['navGroups'] = [group];
export const navItems: ComponentProps<typeof SiteNav>['items'] = links;
// Validate, then render: what the schema outputs is what the renderers take.
export const parsedLink: SiteNavLink = siteNavLinkSchema.parse({ href: '#top', label: 'Top' });
export const parsedPathLink: SiteNavLink = siteNavLinkSchema.parse({ path: 'work', label: 'Work' });
export const rendered = SiteNav({
  items: [siteNavLinkSchema.parse({ href: '#top', label: 'Top' }), parsedPathLink],
  currentPath: 'work',
});
export const renderedMasthead = SiteMasthead({
  chrome: { name: 'Ex', tagline: 'T', footerNote: 'F' },
  navItems: siteNavLinkSchema.array().parse([{ href: 'https://x.ch', label: 'X' }]),
  currentPath: '',
});

// Exactly one of path and href.
// @ts-expect-error both path and href
export const both: SiteNavLink = { path: 'a', href: 'https://x.y', label: 'Both' };
// @ts-expect-error neither path nor href
export const neither: SiteNavLink = { label: 'Nowhere' };
