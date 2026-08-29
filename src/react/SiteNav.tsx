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
