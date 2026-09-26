/**
 * Masthead and footer.
 *
 * The masthead is a rule, not a bar. It sticks so the nav stays reachable on
 * a long page, but it carries no shadow, no fill beyond the page's own
 * surface, and no logo — a hairline and a wordmark are enough, and anything
 * heavier competes with the document.
 *
 * There is deliberately no "hosted on" or "built by" line. A generated site
 * belongs to its subject; its footer has no business advertising anyone else.
 */

import { href } from '../model.js';
import type { SiteChrome as SiteChromeSpec, SiteNavItem } from '../schema.js';
import { DefaultLink, type LinkLike } from './link.js';
import { SiteNav } from './SiteNav.js';

interface Props {
  chrome: SiteChromeSpec;
  navItems: SiteNavItem[];
  currentPath: string;
  /** Framework link component (e.g. next/link). Defaults to a plain anchor. */
  Link?: LinkLike;
}

export function SiteMasthead({ chrome, navItems, currentPath, Link = DefaultLink }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-subtle bg-surface-page/85 backdrop-blur">
      <div className="mx-auto max-w-shell px-4 sm:px-6 lg:px-8">
        {/* One row while the nav fits beside the wordmark. When it does not,
            the nav drops to a row of its own - exactly one, never more: the
            nav itself never wraps, so a long one still scrolls sideways there
            instead of stacking into a masthead that eats a phone screen.
            Sharing the row with the wordmark on a phone left the nav ~290px,
            and camille's third section painted as a lone "Ü" at 390px (fleet
            render sweep, nav rule 7) - a label nobody reads as a link. */}
        {/* py-2, not py-4: the nav's items are 44px tall (the touch floor),
            and the row pays for that out of its own padding so the masthead
            keeps the same height it always had on one row. */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 py-2">
          <Link
            href={href()}
            className="inline-flex min-h-11 shrink-0 items-center rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span className="font-heading text-lg font-semibold tracking-display text-fg-primary">
              {chrome.name}
            </span>
          </Link>

          <SiteNav items={navItems} currentPath={currentPath} Link={Link} />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ chrome }: { chrome: SiteChromeSpec }) {
  return (
    <footer className="mt-24 border-t border-subtle">
      <div className="mx-auto max-w-shell px-4 py-12 sm:px-6 lg:px-8">
        <p className="max-w-prose text-sm leading-relaxed text-fg-secondary">{chrome.footerNote}</p>
        <div className="mt-8 flex flex-col gap-2 border-t border-subtle pt-6 font-mono text-xs uppercase tracking-caps text-fg-muted sm:flex-row sm:items-center sm:justify-between">
          {chrome.host && <span>{chrome.host}</span>}
          <span className="normal-case tracking-normal">© {chrome.name}</span>
        </div>
      </div>
    </footer>
  );
}
