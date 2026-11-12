import type { CSSProperties, ReactNode } from 'react';
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

import { isDangerousHref, isExternalHref } from '../links.js';
import { href } from '../model.js';
import type { SiteChrome as SiteChromeSpec, SiteNavLink } from '../schema.js';
import { DefaultLink, type LinkLike } from './link.js';
import { SiteNav, type SiteNavLinkGroup } from './SiteNav.js';

interface Props {
  chrome: SiteChromeSpec;
  /** In-site `path` items, or links elsewhere by `href` (see SiteNavLink). */
  navItems: SiteNavLink[];
  /** Descriptive application navigation; product-owned group configuration. */
  navGroups?: SiteNavLinkGroup[];
  currentPath: string;
  /** Framework link component (e.g. next/link). Defaults to a plain anchor. */
  Link?: LinkLike;
  /** Opt-in application shell, styled by @bitbaum/sitekit/styles.css. */
  appearance?: 'application';
  brand?: ReactNode;
  actions?: ReactNode;
  mainId?: string;
  skipLabel?: string;
  navLabel?: string;
  menuLabel?: string;
  /**
   * The page also renders a `SiteTabBar` with these destinations. On phones
   * the tab bar is then the navigation, and the masthead's menu button is
   * dropped below the tab bar breakpoint instead of repeating it — one way to
   * each place, not two. The account actions stay in the masthead.
   */
  tabBar?: boolean;
  /**
   * End in-site nav links with a slash ('/work/'), for a static site that
   * serves each page as a directory. Default false ('/work'). When set,
   * `aria-current` also ignores slashes at either end of `currentPath`.
   */
  trailingSlash?: boolean;
}

export function SiteMasthead({
  chrome,
  navItems,
  navGroups,
  currentPath,
  Link = DefaultLink,
  appearance,
  brand,
  actions,
  mainId,
  skipLabel = 'Skip to content',
  navLabel = 'Main navigation',
  menuLabel = 'Menu',
  tabBar = false,
  trailingSlash = false,
}: Props) {
  if (appearance === 'application')
    return (
      <>
        {mainId && (
          <a className="sk-skip" href={'#' + mainId}>
            {skipLabel}
          </a>
        )}
        <header className={tabBar ? 'sk-masthead sk-masthead--tabbar' : 'sk-masthead'}>
          <div className="sk-shell-frame sk-masthead-row">
            <Link href="/" className="sk-brand">
              {brand ?? chrome.name}
            </Link>
            <SiteNav
              items={navItems}
              groups={navGroups}
              currentPath={currentPath}
              Link={Link}
              appearance="application"
              label={navLabel}
              menuLabel={menuLabel}
              menuActions={actions}
              trailingSlash={trailingSlash}
            />
            {actions && <div className="sk-account-actions">{actions}</div>}
          </div>
        </header>
      </>
    );
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

          <SiteNav
            items={navItems}
            currentPath={currentPath}
            Link={Link}
            trailingSlash={trailingSlash}
          />
        </div>
      </div>
    </header>
  );
}

type FooterLink = { href: string; label: string };

/**
 * Footer links as rendered: a javascript:, vbscript: or data: link is dropped,
 * another origin gets rel; every other link renders as given.
 */
function footerLinks(Link: LinkLike, links: FooterLink[]) {
  return links
    .filter((item) => !isDangerousHref(item.href))
    .map((item) => (
      <Link
        key={item.href}
        href={item.href}
        rel={isExternalHref(item.href) ? 'noopener' : undefined}
      >
        {item.label}
      </Link>
    ));
}

/**
 * The copyright year: an integer from 1 to 9999, or null for none. Anything
 * else (an untyped caller's string, false, NaN, 0, 1e21) counts as omitted,
 * and the clock is read.
 */
function copyrightYear(year: unknown): number | null {
  if (year === null) return null;
  if (typeof year === 'number' && Number.isInteger(year) && year >= 1 && year <= 9999) return year;
  return new Date().getFullYear();
}

export function SiteFooter({
  chrome,
  appearance,
  links = [],
  groups,
  Link = DefaultLink,
  label = 'Footer navigation',
  extra,
  year,
}: {
  chrome: SiteChromeSpec;
  appearance?: 'application';
  links?: FooterLink[];
  /** Optional semantic link groups; flat links remain supported. */
  groups?: Array<{ label: string; links: FooterLink[] }>;
  Link?: LinkLike;
  label?: string;
  extra?: ReactNode;
  /**
   * The year in the copyright line of the application footer. An integer
   * from 1 to 9999 is printed as given; `null` prints no year. Omitted (or any
   * other value), the footer reads the clock at render time, so a statically
   * generated page should pass the year it means, or its output changes on
   * 1 January. The document footer prints no year and never reads the clock.
   */
  year?: number | null;
}) {
  if (appearance === 'application') {
    const shownYear = copyrightYear(year);
    // A group whose every link is dropped is left out with its heading; a
    // group given no links renders as in 0.7.0.
    const shownGroups = groups?.filter(
      (group) =>
        group.links.length === 0 || group.links.some((item) => !isDangerousHref(item.href)),
    );
    return (
      <footer className="sk-footer">
        <div className="sk-shell-frame">
          <div className="sk-footer-top">
            <div>
              <Link href="/" className="sk-footer-brand">
                {chrome.name}
              </Link>
              <p>{chrome.footerNote}</p>
            </div>
            {shownGroups ? (
              <nav
                aria-label={label}
                className="sk-footer-groups"
                style={{ '--sk-footer-columns': shownGroups.length } as CSSProperties}
              >
                {shownGroups.map((group) => (
                  <div className="sk-footer-group" key={group.label}>
                    <h2>{group.label}</h2>
                    {footerLinks(Link, group.links)}
                  </div>
                ))}
              </nav>
            ) : (
              <nav aria-label={label}>{footerLinks(Link, links)}</nav>
            )}
          </div>
          <div className="sk-footer-bottom">
            <span>
              {shownYear === null ? (
                <>© {chrome.name}</>
              ) : (
                <>
                  © {shownYear} {chrome.name}
                </>
              )}
            </span>
            {extra}
          </div>
        </div>
      </footer>
    );
  }
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
