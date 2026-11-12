/* global document, window, getComputedStyle */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement as h, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { chromium } from 'playwright';
import { SiteMasthead, SiteFooter, SiteTabBar } from '@bitbaum/sitekit/react';

// The application CSS is "standalone": it must measure the same on a host
// page that has no `box-sizing: border-box` reset as on one that has. Without
// its own box model the masthead row came out 422px wide at 390 and the
// controls 65px tall (found 2026-11-12, rendering the chrome at build time).

const chrome = { name: 'Example', tagline: '', footerNote: 'A note.' };
const actions = h(Fragment, null, h('a', { href: '/#start' }, 'Start a project'));
const shells = {
  flat: renderToStaticMarkup(
    h(SiteMasthead, {
      appearance: 'application',
      chrome,
      mainId: 'main',
      currentPath: 'work',
      navItems: [
        { path: 'work', label: 'The work' },
        { path: 'builders', label: 'Builders' },
        { href: 'https://github.com/bitbaum', label: 'Source' },
      ],
      actions,
    }),
  ),
  grouped: renderToStaticMarkup(
    h(SiteMasthead, {
      appearance: 'application',
      chrome,
      currentPath: 'work',
      navItems: [],
      navGroups: [{ label: 'Studio', items: [{ path: 'work', label: 'The work' }] }],
      actions,
    }),
  ),
};
const footer = renderToStaticMarkup(
  h(SiteFooter, {
    appearance: 'application',
    chrome,
    year: 2026,
    groups: [{ label: 'More', links: [{ href: '/hire', label: 'Hire' }] }],
  }),
);
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

const launch = () =>
  chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    args: ['--no-sandbox'],
  });

test('the application chrome keeps its own box model, with and without a host reset', async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    for (const reset of [false, true]) {
      for (const [shape, masthead] of Object.entries(shells)) {
        for (const width of [320, 390]) {
          const where = `${shape} at ${width}, ${reset ? 'with' : 'without'} a host reset`;
          await page.setViewportSize({ width, height: 800 });
          await page.setContent(
            `<style>body { margin: 0 }${reset ? ' *, *::before, *::after { box-sizing: border-box }' : ''}</style>` +
              `<style>${css}</style>${masthead}<main id="main"><p>Body</p></main>${footer}`,
          );
          const scroll = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
          }));
          assert.equal(scroll.scrollWidth, scroll.innerWidth, `no sideways scroll: ${where}`);
          const row = await page.locator('.sk-masthead-row').boundingBox();
          assert.ok(row.x >= 0 && row.x + row.width <= width, `row fits the screen: ${where}`);
          const controls = await page
            .locator('.sk-masthead summary:visible, .sk-account-actions > a:visible')
            .all();
          assert.ok(controls.length > 0, `a control is visible: ${where}`);
          for (const control of controls) {
            const box = await control.boundingBox();
            assert.ok(box.height >= 44, `control keeps the 44px floor: ${where}`);
            assert.ok(box.height <= 48, `control ${box.height}px is no taller than 48px: ${where}`);
            assert.ok(box.x + box.width <= width, `control stays on screen: ${where}`);
          }
        }
      }
    }
  } finally {
    await browser.close();
  }
});

// Host content in sitekit's slots keeps the host's box model: a host element
// that relies on the default content-box measures what it measured in 0.7.0
// (and what it measures outside the chrome). Only sitekit's own elements are
// border-box. (A `*` rule once reached them and a 100px host link in
// `actions` measured 100px wide instead of 134px.)
const sized = {
  display: 'inline-block',
  flexShrink: 0,
  width: '100px',
  padding: '10px',
  border: '2px solid',
};
const slotted = renderToStaticMarkup(
  h(
    Fragment,
    null,
    h(SiteMasthead, {
      appearance: 'application',
      chrome,
      currentPath: 'work',
      navItems: [{ path: 'work', label: 'The work' }],
      brand: h('span', { className: 'host host-brand', style: sized }, 'B'),
      actions: h(
        Fragment,
        null,
        h('a', { href: '/start', className: 'host-direct', style: { width: '100px' } }, 'Start'),
        h('span', { className: 'host host-chip', style: sized }, 'C'),
        h('div', { className: 'host-widget' }, h('a', { className: 'host', style: sized }, 'W')),
      ),
    }),
    h(SiteFooter, {
      appearance: 'application',
      chrome,
      year: 2026,
      extra: h('a', { href: '/x', className: 'host host-extra', style: sized }, 'E'),
    }),
    h(SiteTabBar, {
      currentPath: 'work',
      items: [
        { path: 'work', label: 'Work', icon: h('span', { className: 'host', style: sized }) },
      ],
    }),
    h('p', null, h('span', { id: 'outside', style: sized }, 'O')),
  ),
);

test('host content in a slot keeps the host box model; sitekit’s own elements are border-box', async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 390, height: 900 });
    await page.setContent(`<style>body { margin: 0 }</style><style>${css}</style>${slotted}`);
    const measured = await page.evaluate(() => {
      const box = (el) => ({
        boxSizing: getComputedStyle(el).boxSizing,
        width: el.getBoundingClientRect().width,
      });
      return {
        outside: box(document.getElementById('outside')),
        hosts: [...document.querySelectorAll('.host')].map((el) => ({
          where: el.closest('[class^="sk-"]').className,
          shown: el.getClientRects().length > 0,
          ...box(el),
        })),
        direct: box(document.querySelector('.sk-account-actions > .host-direct')),
        own: [
          '.sk-masthead',
          '.sk-masthead-row',
          '.sk-brand',
          '.sk-desktop-nav a',
          '.sk-mobile-menu summary',
          '.sk-account-actions',
          '.sk-footer-bottom > span',
          '.sk-tabbar',
          '.sk-tab',
          '.sk-tab-icon',
        ].map((selector) => [
          selector,
          getComputedStyle(document.querySelector(selector)).boxSizing,
        ]),
      };
    });
    assert.deepEqual(measured.outside, { boxSizing: 'content-box', width: 124 });
    // brand, two actions in the row and again in the (closed) menu, extra, tab icon
    assert.equal(measured.hosts.length, 7);
    assert.equal(measured.hosts.filter((host) => host.shown).length, 5);
    for (const host of measured.hosts) {
      assert.equal(host.boxSizing, 'content-box', `host element in ${host.where}`);
      if (host.shown) assert.equal(host.width, 124, `host element in ${host.where}`);
    }
    // A link straight in `actions` is styled by sitekit (0.75rem inline padding
    // below 600px, 1px border) and still sized content-box: 100 + 24 + 2.
    assert.deepEqual(measured.direct, { boxSizing: 'content-box', width: 126 });
    for (const [selector, boxSizing] of measured.own) {
      assert.equal(boxSizing, 'border-box', selector);
    }
  } finally {
    await browser.close();
  }
});
