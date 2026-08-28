'use client';

/**
 * The one client-side behaviour in the chrome, isolated so everything else
 * stays server-renderable.
 *
 * With eight sections the nav scrolls sideways on a phone, and the active
 * item is frequently off-screen at rest — a visitor arriving on a deep page
 * would see a row of links with no indication that any of them is the page
 * they are on. Scrolling it into view on mount fixes that; there is no
 * CSS-only way to do it.
 *
 * Deliberately takes ONLY serialisable props. The nav itself (with its
 * injected Link component) must stay a server component — a component
 * function cannot cross the server→client boundary, which is exactly the
 * build error this split prevents.
 */

import { useEffect } from 'react';

export function NavAutoScroll({ currentPath }: { currentPath: string }) {
  useEffect(() => {
    const active = document.querySelector('[data-sitekit-nav] [aria-current="page"]');
    // `nearest` keeps the page itself still — `center` would scroll the whole
    // document to the top of the masthead on every navigation.
    active?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }, [currentPath]);

  return null;
}
