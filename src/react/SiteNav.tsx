/**
 * The masthead's section nav.
 *
 * A server component, deliberately: the injected `Link` is a component
 * function, and functions cannot cross into a 'use client' boundary. The one
 * client behaviour — scrolling the active item into view — lives in
 * `NavAutoScroll`, which takes only a string.
 */

import type { ReactNode } from 'react';
import { isExternalHref } from '../links.js';
import { isCurrentNavItem, navItemHref } from '../model.js';
import type { SiteNavItem, SiteNavLink } from '../schema.js';
import { DefaultLink, type LinkLike } from './link.js';
import { MenuDismiss } from './MenuDismiss.js';
import { NavAutoScroll } from './NavAutoScroll.js';

/** A group of in-site destinations; the type hosts already configure. */
export interface SiteNavGroup {
  label: string;
  items: Array<SiteNavItem & { description?: string }>;
}

/**
 * What the grouped menu renders: a {@link SiteNavGroup}, whose items may also
 * be links elsewhere (`href`). Every `SiteNavGroup` is one.
 */
export interface SiteNavLinkGroup {
  label: string;
  items: Array<SiteNavLink & { description?: string }>;
}

interface Props {
  /**
   * Deliberately NOT `SitePage[]`. Everything the nav receives ends up in the
   * payload of every page it renders on.
   */
  items: SiteNavLink[];
  currentPath: string;
  /** Opt-in grouped application menu. Flat items remain unchanged when omitted. */
  groups?: SiteNavLinkGroup[];
  /** Framework link component (e.g. next/link). Defaults to a plain anchor. */
  Link?: LinkLike;
  appearance?: 'application';
  label?: string;
  menuLabel?: string;
  /**
   * The masthead's account actions, repeated at the foot of the mobile menu.
   * On the narrowest phones the row has no room for them beside the brand and
   * the menu button, so styles.css shows them here instead (one tap away).
   */
  menuActions?: ReactNode;
  /**
   * End in-site links with a slash ('/work/'), for a static site that serves
   * each page as a directory. Default false. Items given by `href` are
   * used verbatim; with it, `aria-current` also ignores slashes at either end.
   */
  trailingSlash?: boolean;
}

/**
 * The links to render, with the props every nav link shares: where it goes,
 * whether it is here, rel. An item whose `href` is refused (see
 * `isAllowedHref`) is left out, never rendered.
 */
function navLinks<T extends SiteNavLink>(items: T[], currentPath: string, trailingSlash: boolean) {
  return items.flatMap((item) => {
    const target = navItemHref(item, { trailingSlash });
    if (target === null) return [];
    const current = isCurrentNavItem(item, currentPath, { trailingSlash });
    return [
      {
        item,
        key: item.href ?? item.path,
        props: {
          href: target,
          rel: isExternalHref(target) ? 'noopener' : undefined,
          'aria-current': current ? ('page' as const) : undefined,
        },
      },
    ];
  });
}

/** The items that render: an item whose `href` is refused is left out. */
function renderable<T extends SiteNavLink>(items: T[]): T[] {
  return items.filter((item) => navItemHref(item) !== null);
}

export function SiteNav({
  items: givenItems,
  groups,
  currentPath,
  Link = DefaultLink,
  appearance,
  label = 'Sections',
  menuLabel = 'Menu',
  menuActions,
  trailingSlash = false,
}: Props) {
  // A refused href is dropped before anything is counted, so a nav or group
  // whose every item is refused renders as one that was given none.
  const items = renderable(givenItems);
  if (appearance === 'application') {
    const populatedGroups = groups
      ?.map((group) => ({ ...group, items: renderable(group.items) }))
      .filter((group) => group.items.length > 0);
    if (populatedGroups?.length) {
      return (
        <>
          <details className="sk-grouped-menu" data-sitekit-menu>
            <summary>
              {menuLabel}
              <span aria-hidden="true">☰</span>
            </summary>
            <nav className="sk-grouped-panel" aria-label={label}>
              <div className="sk-nav-groups">
                {populatedGroups.map((group) => (
                  <section className="sk-nav-group" key={group.label} aria-label={group.label}>
                    <h2>{group.label}</h2>
                    {navLinks(group.items, currentPath, trailingSlash).map(
                      ({ item, key, props }) => (
                        <Link key={key} {...props}>
                          <span className="sk-nav-link-label">{item.label}</span>
                          {item.description && (
                            <span className="sk-nav-description">{item.description}</span>
                          )}
                        </Link>
                      ),
                    )}
                  </section>
                ))}
              </div>
              {menuActions && <div className="sk-grouped-actions">{menuActions}</div>}
            </nav>
          </details>
          <MenuDismiss currentPath={currentPath} />
        </>
      );
    }
    if (items.length === 0) return null;
    const links = () =>
      navLinks(items, currentPath, trailingSlash).map(({ item, key, props }) => (
        <Link key={key} {...props}>
          {item.label}
        </Link>
      ));
    return (
      <>
        <nav className="sk-desktop-nav" aria-label={label} data-sitekit-nav>
          {links()}
        </nav>
        <details className="sk-mobile-menu" data-sitekit-menu>
          <summary>
            {menuLabel}
            <span aria-hidden="true">☰</span>
          </summary>
          <nav aria-label={label}>
            {links()}
            {menuActions && <div className="sk-menu-actions">{menuActions}</div>}
          </nav>
        </details>
        <MenuDismiss currentPath={currentPath} />
      </>
    );
  }
  return (
    <nav
      data-sitekit-nav
      aria-label={label}
      className="scrollbar-hide -mx-1 flex max-w-full flex-nowrap items-center gap-x-1 overflow-x-auto"
    >
      {navLinks(items, currentPath, trailingSlash).map(({ item, key, props }) => {
        const isCurrent = props['aria-current'] === 'page';
        return (
          <Link
            key={key || 'home'}
            {...props}
            className={[
              // min-h-11 is the 44px touch floor. `px-2 py-1` on text-xs came out
              // around 28px, which is a fiddly target on a phone and below the
              // floor the rest of the fleet holds. The masthead row drops from
              // py-4 to py-2 to pay for it, so the sticky header does NOT get
              // taller — see the comment in SiteChrome.
              'inline-flex min-h-11 shrink-0 items-center rounded px-2 font-mono text-xs uppercase tracking-caps transition-colors',
              // A consumer's CSS reset can remove the UA focus ring, and this
              // package shipped nothing to replace it — so keyboard users had no
              // visible position in the nav on every site that installs it.
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
              isCurrent
                ? 'text-fg-primary underline decoration-accent decoration-2 underline-offset-8'
                : 'text-fg-tertiary hover:text-fg-primary',
            ].join(' ')}
          >
            {item.label}
          </Link>
        );
      })}
      <NavAutoScroll currentPath={currentPath} />
    </nav>
  );
}
