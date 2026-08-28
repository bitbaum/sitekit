/**
 * Pure helpers over a validated site. No React, no framework — a Node script
 * generating sites can use everything in this file.
 */

import { siteSpecSchema, type SiteNavItem, type SitePage, type SiteSpec } from './schema.js';

/**
 * Validate anything claiming to be a site — typically a generator's raw
 * output. Structured result in the house shape; `errors` are `path: message`
 * lines a model (or a person) can act on directly.
 */
export function validateSite(
  input: unknown,
): { success: true; data: SiteSpec } | { success: false; errors: string[] } {
  const result = siteSpecSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };
  return {
    success: false,
    errors: result.error.issues.map(issue => `${issue.path.join('.') || '(root)'}: ${issue.message}`),
  };
}

/** Nav entries in page order. Pages without a `navLabel` are omitted. */
export function siteNavItems(pages: SitePage[]): SiteNavItem[] {
  return pages
    .filter((page): page is SitePage & { navLabel: string } => Boolean(page.navLabel))
    .map(page => ({ path: page.path, label: page.navLabel }));
}

/**
 * True when the page opens with its own hero, in which case the shell must not
 * also print a title block. One rule, checked in one place.
 */
export function pageRendersOwnHeader(page: SitePage): boolean {
  return page.sections[0]?.kind === 'hero';
}

/** @returns the page at this path, or null. */
export function sitePageAt(pages: SitePage[], path: string): SitePage | null {
  const normalised = path.replace(/^\/+|\/+$/g, '');
  return pages.find(page => page.path === normalised) ?? null;
}

/** An in-site link. Root is '/', everything else '/segment'. */
export function href(path = ''): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return clean ? `/${clean}` : '/';
}
