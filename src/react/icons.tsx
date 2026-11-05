/**
 * One small icon set for the shell: the tab bar and the account actions.
 *
 * Products used to pass unicode glyphs (◎ ✎ ⌕ ⇄ ★) as tab icons, which
 * render differently on every phone and never look like an interface. These
 * are 24-unit stroke outlines on `currentColor`, so a tab's icon and label
 * take the same colour and the active state is one rule. Decorative only:
 * every one is `aria-hidden`, the label beside it is what is read out.
 */
import type { ReactNode, SVGProps } from 'react';

export type SiteIconName =
  | 'home'
  | 'write'
  | 'search'
  | 'compass'
  | 'star'
  | 'user'
  | 'chat'
  | 'bell'
  | 'settings'
  | 'list'
  | 'globe'
  | 'book'
  | 'heart'
  | 'plus'
  | 'menu'
  | 'calendar'
  | 'wallet'
  | 'chart';

const PATHS: Record<SiteIconName, ReactNode> = {
  home: (
    <>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V20h13v-9.5" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  write: (
    <>
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17z" />
      <path d="M13.5 8.5 16.5 11.5" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.5-4.5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
  star: <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8z" />,
  user: (
    <>
      <circle cx="12" cy="8.5" r="4" />
      <path d="M4.5 20.5c.8-4 4-6 7.5-6s6.7 2 7.5 6" />
    </>
  ),
  chat: <path d="M4 5.5h16v10H9.5L5.5 19v-3.5H4z" />,
  bell: (
    <>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
    </>
  ),
  list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 18A2.5 2.5 0 0 1 6.5 15.5H20" />
    </>
  ),
  heart: (
    <path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.7 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </>
  ),
  wallet: (
    <>
      <path d="M3 7.5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M3 7.5V6a2 2 0 0 1 2-2h11" />
      <circle cx="16.5" cy="14" r="1.2" />
    </>
  ),
  chart: <path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3M20 16V6" />,
};

export interface SiteIconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: SiteIconName;
  /** Rendered size in CSS pixels; the tab bar sets its own. */
  size?: number | string;
}

/** A shell icon on `currentColor`. Decorative: hidden from assistive tech. */
export function SiteIcon({ name, size, className, ...rest }: SiteIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className ? `sk-icon ${className}` : 'sk-icon'}
      data-icon={name}
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

export const SITE_ICON_NAMES = Object.keys(PATHS) as SiteIconName[];
