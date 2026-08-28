/**
 * The masthead's section nav.
 *
 * A server component, deliberately: the injected `Link` is a component
 * function, and functions cannot cross into a 'use client' boundary. The one
 * client behaviour — scrolling the active item into view — lives in
 * `NavAutoScroll`, which takes only a string.
 */

import { href } from '../model.js';
import type { SiteNavItem } from '../schema.js';
import { DefaultLink, type LinkLike } from './link.js';
import { NavAutoScroll } from './NavAutoScroll.js';

interface Props {
  /**
   * Deliberately NOT `SitePage[]`. Everything the nav receives ends up in the
   * payload of every page it renders on.
   */
  items: SiteNavItem[];
  currentPath: string;
  /** Framework link component (e.g. next/link). Defaults to a plain anchor. */
  Link?: LinkLike;
}

export function SiteNav({ items, currentPath, Link = DefaultLink }: Props) {
  return (
    <nav
      data-sitekit-nav
      aria-label="Sections"
      className="scrollbar-hide -mx-1 flex flex-nowrap items-center gap-x-1 overflow-x-auto"
    >
      {items.map(item => {
        const isCurrent = item.path === currentPath;
        return (
          <Link
            key={item.path || 'home'}
            href={href(item.path)}
            aria-current={isCurrent ? 'page' : undefined}
            className={[
              'shrink-0 rounded px-2 py-1 font-mono text-xs uppercase tracking-caps transition-colors',
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
