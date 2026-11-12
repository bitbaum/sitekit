/**
 * A deterministic footer (found 2026-11-12): SiteFooter printed
 * `new Date().getFullYear()` during render, so a statically generated page
 * changed on 1 January and a build check comparing output flipped.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { SiteFooter } from '@bitbaum/sitekit/react';

const chrome = { name: 'Example', tagline: '', footerNote: 'A note.' };
const render = (props) =>
  renderToStaticMarkup(h(SiteFooter, { chrome, appearance: 'application', ...props }));

/** Run `fn` with the clock stopped at `iso` (the no-argument Date and Date.now). */
function at(iso, fn) {
  const RealDate = globalThis.Date;
  const fixed = new RealDate(iso).getTime();
  globalThis.Date = class extends RealDate {
    constructor(...args) {
      super(...(args.length ? args : [fixed]));
    }
    static now() {
      return fixed;
    }
  };
  try {
    return fn();
  } finally {
    globalThis.Date = RealDate;
  }
}

test('a given year renders the same markup either side of New Year', () => {
  const before = at('2026-12-31T23:59:00', () => render({ year: 2026 }));
  const after = at('2027-01-01T00:01:00', () => render({ year: 2026 }));
  assert.equal(before, after);
  assert.ok(before.includes('© 2026 Example'));
  assert.ok(!before.includes('2027'));
});

test('a given year never reads the clock', () => {
  const OriginalDate = globalThis.Date;
  globalThis.Date = function () {
    throw new Error('the footer read the clock');
  };
  try {
    assert.ok(render({ year: 2030 }).includes('© 2030 Example'));
    assert.ok(render({ year: null }).includes('© Example'));
  } finally {
    globalThis.Date = OriginalDate;
  }
});

test('year={null} prints no year', () => {
  const html = at('2026-12-31T12:00:00', () => render({ year: null }));
  assert.ok(html.includes('<span>© Example</span>'));
  assert.doesNotMatch(html, /\d{4}/);
});

test('without the prop the footer keeps today’s behaviour and prints the current year', () => {
  assert.ok(at('2026-12-31T12:00:00', () => render({})).includes('© 2026 Example'));
  assert.ok(at('2027-01-01T12:00:00', () => render({})).includes('© 2027 Example'));
});

test('a year that is not an integer from 1 to 9999 counts as omitted', () => {
  for (const year of [0, -1, 1.5, Number.NaN, Infinity, 1e21, 10000, '2026', false, true, {}]) {
    const html = at('2026-06-01T12:00:00', () => render({ year }));
    assert.ok(html.includes('<span>© 2026 Example</span>'), `${String(year)}: ${html}`);
  }
  assert.ok(render({ year: 1 }).includes('© 1 Example'));
  assert.ok(render({ year: 9999 }).includes('© 9999 Example'));
});

test('the document footer prints no year and never reads the clock', () => {
  const OriginalDate = globalThis.Date;
  globalThis.Date = function () {
    throw new Error('the footer read the clock');
  };
  try {
    const html = renderToStaticMarkup(h(SiteFooter, { chrome }));
    assert.ok(html.includes('© Example'));
  } finally {
    globalThis.Date = OriginalDate;
  }
});
