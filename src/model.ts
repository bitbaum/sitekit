/**
 * Pure helpers over a validated site. No React, no framework — a Node script
 * generating sites can use everything in this file.
 */

import { isAllowedHref } from './links.js';
import {
  siteSpecSchema,
  type SiteNavItem,
  type SiteNavLink,
  type SitePage,
  type SiteSpec,
} from './schema.js';

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
    errors: result.error.issues.map(
      (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
    ),
  };
}

/** Nav entries in page order. Pages without a `navLabel` are omitted. */
export function siteNavItems(pages: SitePage[]): SiteNavItem[] {
  return pages
    .filter((page): page is SitePage & { navLabel: string } => Boolean(page.navLabel))
    .map((page) => ({ path: page.path, label: page.navLabel }));
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
  return pages.find((page) => page.path === normalised) ?? null;
}

/** Options for {@link href}. */
export interface HrefOptions {
  /**
   * End in-site paths with a slash ('/work/'), for a static site that serves
   * each page as a directory index. Default false: '/work'. The slash goes on
   * the path part, before a '?query' or '#fragment' ('/a/#b'); a last segment
   * with a file extension ('/feed.xml') gets none unless the path already
   * ended in one ('/a/b.c/' stays); the root is '/'.
   */
  trailingSlash?: boolean;
}

/**
 * An in-site link. Root is '/', everything else '/segment'. The argument is
 * always an in-site path, whatever characters it holds ('notes:2026' gives
 * '/notes:2026'); a link to another site is a nav item's `href`, not a path.
 */
export function href(path = '', options: HrefOptions = {}): string {
  if (!options.trailingSlash) {
    const clean = path.replace(/^\/+|\/+$/g, '');
    return clean ? `/${clean}` : '/';
  }
  const cut = path.search(/[?#]/);
  const rest = cut === -1 ? '' : path.slice(cut);
  const pathPart = cut === -1 ? path : path.slice(0, cut);
  const clean = pathPart.replace(/^\/+|\/+$/g, '');
  if (!clean) return `/${rest}`;
  const last = clean.slice(clean.lastIndexOf('/') + 1);
  // A slash the caller wrote is kept, even after a name that looks like a file.
  const slash = !hasFileExtension(last) || pathPart.endsWith('/');
  return slash ? `/${clean}/${rest}` : `/${clean}${rest}`;
}

/** 'feed.xml', 'a.html', 'jquery.min.js'; not '.well-known', not 'v1.2'. */
function hasFileExtension(segment: string): boolean {
  return /^[^.].*\.(?=[a-z0-9]*[a-z])[a-z0-9]+$/i.test(segment);
}

/**
 * Where a nav item points: its in-site `path` through {@link href}, or its
 * `href` verbatim. An `href` the schema refuses (see `isAllowedHref`) gives
 * null, and the renderers leave that item out.
 */
export function navItemHref(item: SiteNavLink, options: HrefOptions = {}): string | null {
  if (item.href !== undefined) return isAllowedHref(item.href) ? item.href : null;
  return href(item.path, options);
}

/**
 * True when a nav item is the page at `currentPath`. Without `trailingSlash`
 * this is exact equality of `path` and `currentPath`, as it always was. With
 * it, slashes at either end do not matter ('work', '/work' and '/work/' are
 * one page). An item given by `href` is never current.
 */
export function isCurrentNavItem(
  item: SiteNavLink,
  currentPath: string,
  options: HrefOptions = {},
): boolean {
  // An item given by href is never current, and that holds for untyped input
  // that carries both fields: the renderer uses its href.
  if (item.href !== undefined || item.path === undefined) return false;
  if (!options.trailingSlash) return item.path === currentPath;
  return trimSlashes(item.path) === trimSlashes(currentPath);
}

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}
