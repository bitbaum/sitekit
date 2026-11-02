/**
 * The mobile bottom tab bar: three to five destinations within thumb reach.
 *
 * A server component like SiteNav (the injected Link is a function). It is
 * hidden from the desktop breakpoint up by styles.css (`--sk-tabbar-hide`,
 * default 48rem) so the masthead nav stays the one desktop navigation.
 * Consumers add `padding-bottom: var(--sk-tabbar-height)` to their page body
 * on small screens, or use the `.sk-tabbar-spacer` the component renders.
 */
import type { ReactNode } from 'react';

import { href } from '../model.js';
import { DefaultLink, type LinkLike } from './link.js';

export interface SiteTabItem {
  path: string;
  label: string;
  /** Decorative glyph or SVG; hidden from assistive tech. */
  icon: ReactNode;
}

interface Props {
  items: SiteTabItem[];
  currentPath: string;
  Link?: LinkLike;
  label?: string;
}

const isCurrent = (path: string, current: string) => {
  const a = href(path);
  const b = href(current);
  return a === '/' ? b === '/' : b === a || b.startsWith(a + '/');
};

export function SiteTabBar({ items, currentPath, Link = DefaultLink, label = 'Main' }: Props) {
  if (items.length === 0) return null;
  return (
    <>
      <div className="sk-tabbar-spacer" aria-hidden="true" />
      <nav className="sk-tabbar" aria-label={label}>
        {items.slice(0, 5).map((item) => {
          const current = isCurrent(item.path, currentPath);
          return (
            <Link
              key={item.path}
              href={href(item.path)}
              aria-current={current ? 'page' : undefined}
              className="sk-tab"
            >
              <span className="sk-tab-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="sk-tab-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
