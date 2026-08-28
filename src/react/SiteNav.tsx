'use client';

/**
 * The masthead's section nav.
 *
 * A client component for one reason: with eight sections the nav scrolls
 * sideways on a phone, and the active item is frequently off-screen at rest —
 * so a visitor arriving on a deep page sees a row of links with no indication
 * that any of them is the page they are on. Scrolling it into view on mount
 * fixes that, and there is no CSS-only way to do it.
 *
 * Everything else about the masthead stays server-rendered.
 */

import { useEffect, useRef } from 'react';
import { href } from '../model.js';
import type { SiteNavItem } from '../schema.js';
import { DefaultLink, type LinkLike } from './link.js';

interface Props {
  /**
   * Deliberately NOT `SitePage[]`. Everything passed to a client component is
   * serialised into the payload of every page it renders on.
   */
  items: SiteNavItem[];
  currentPath: string;
  /** Framework link component (e.g. next/link). Defaults to a plain anchor. */
  Link?: LinkLike;
}

export function SiteNav({ items, currentPath, Link = DefaultLink }: Props) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const active = navRef.current?.querySelector('[aria-current="page"]');
    // `nearest` keeps the page itself still — `center` would scroll the whole
    // document to the top of the masthead on every navigation.
    active?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }, [currentPath]);

  return (
    <nav
      ref={navRef}
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
    </nav>
  );
}
