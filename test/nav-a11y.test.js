/**
 * The chrome must not ship defects its consumers cannot fix.
 *
 * A shared renderer is the one place where a mistake is not one bug in one repo
 * but the same bug on every site that installs it — and unfixable downstream,
 * because a consumer cannot patch markup it does not own. Two such defects
 * shipped: nav links were `px-2 py-1` on `text-xs` (roughly a 28px target, below
 * the 44px floor the rest of the fleet holds), and nothing in the package
 * defined a focus style, so a consumer's CSS reset could remove the UA ring and
 * leave keyboard users with no visible position in the nav.
 *
 * These assert the rendered markup, not the source, and import by package name
 * so a broken `exports`/`files` map fails here rather than in a consumer.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { SiteMasthead } from '@bitbaum/sitekit/react';

const CHROME = { name: 'Café Beispiel', tagline: 'Kaffee', footerNote: 'Run by its owners.' };
const NAV = [
  { path: '', label: 'Home' },
  { path: 'menu', label: 'Menu' },
];

const masthead = (currentPath = 'menu') =>
  renderToStaticMarkup(h(SiteMasthead, { chrome: CHROME, navItems: NAV, currentPath }));

test('nav links meet the 44px touch floor', () => {
  const html = masthead();
  assert.ok(html.includes('min-h-11'), 'nav links must carry the 44px minimum height');
  assert.ok(
    !/class="[^"]*\bpx-2 py-1\b[^"]*font-mono text-xs uppercase/.test(html),
    'the old sub-floor px-2 py-1 target must be gone',
  );
});

test('nav links carry a visible focus style of their own', () => {
  const html = masthead();
  assert.ok(
    html.includes('focus-visible:outline-2'),
    'a consumer reset can remove the UA ring, so the package must ship one',
  );
  assert.ok(html.includes('focus-visible:outline-offset-2'));
});

test('the wordmark is focusable with a visible ring and a real target', () => {
  const html = masthead();
  // The home link sits before the nav; check the first anchor specifically.
  const firstAnchor = html.slice(html.indexOf('<a'), html.indexOf('</a>'));
  assert.ok(firstAnchor.includes('focus-visible:outline-2'), 'wordmark needs a focus ring');
  assert.ok(firstAnchor.includes('min-h-11'), 'wordmark needs a 44px target');
});

test('the masthead does not grow to pay for the bigger targets', () => {
  // The sticky masthead's own comment warns against eating a phone screen. The
  // row gives up padding (py-4 -> py-2) so 44px items cost no extra height.
  const html = masthead();
  assert.ok(html.includes('py-2'), 'row padding should be py-2');
  assert.ok(
    !/justify-between gap-6 py-4/.test(html),
    'the row must not still be py-4, or the header got taller',
  );
});

test('the active item is still announced', () => {
  // Guard against a refactor of these classes dropping what already worked.
  assert.ok(masthead('menu').includes('aria-current="page"'));
});
