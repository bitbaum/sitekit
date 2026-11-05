/* global document, window, innerWidth, getComputedStyle */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';
import { chromium } from 'playwright';

test('grouped menu fits four widths and retains keyboard, focus and dismissal behavior', async () => {
  const bundle = await build({
    stdin: {
      contents: `import React from 'react';
import { createRoot } from 'react-dom/client';
import { SiteMasthead } from '@bitbaum/sitekit/react';
const root = createRoot(document.getElementById('root'));
window.navigate = (currentPath = 'write') => root.render(React.createElement(SiteMasthead, {
  appearance: 'application', chrome: { name: 'Example', tagline: '', footerNote: '' },
  navItems: [], currentPath,
  navGroups: [
    { label: 'Create', items: [{ path: 'write', label: 'Write', description: 'Start an article.' }] },
    { label: 'Discover', items: [{ path: '', label: 'Today', description: 'Read the news.' }, { path: 'analyze', label: 'Examine', description: 'Inspect a source. ' + 'longword'.repeat(40) }] }
  ],
  actions: React.createElement(React.Fragment, null,
    React.createElement('a', { href: '/account' }, 'Account'),
    React.createElement('div', { className: 'host-widget' }, React.createElement('a', { href: '/settings' }, 'Settings'))
  )
}));
window.navigate();`,
      resolveDir: process.cwd(),
      loader: 'jsx',
    },
    bundle: true,
    write: false,
    format: 'iife',
    define: { 'process.env.NODE_ENV': '"production"' },
  });
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    args: ['--no-sandbox'],
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const width of [320, 390, 834, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.setContent(
        '<style>body { margin: 0 } * { box-sizing: border-box } .host-widget a { display: flex; flex-direction: row; min-height: 44px }</style><div id="root"></div><button id="outside" style="position:fixed;bottom:0;left:0">Outside</button>',
      );
      await page.addStyleTag({
        content: readFileSync(new URL('../styles.css', import.meta.url), 'utf8'),
      });
      await page.addScriptTag({ content: bundle.outputFiles[0].text });
      const summary = page.locator('.sk-grouped-menu summary');
      const menu = page.locator('.sk-grouped-menu');
      await summary.focus();
      await page.keyboard.press('Enter');
      await page.locator('.sk-grouped-panel').waitFor({ state: 'visible' });
      assert.equal(await menu.getAttribute('open'), '');
      assert.equal(
        await menu.locator('.host-widget a').evaluate((el) => getComputedStyle(el).flexDirection),
        'row',
        'the host widget retains its own link layout',
      );
      const bounds = await page.locator('.sk-grouped-panel').boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width, `panel fits ${width}`);
      assert.ok(bounds.y + bounds.height <= 900, `panel height fits ${width}`);
      const frame = await page.locator('.sk-masthead-row').boundingBox();
      assert.ok(
        bounds.x >= frame.x && bounds.x + bounds.width <= frame.x + frame.width,
        `panel aligns with its header frame at ${width}`,
      );
      assert.equal(
        await page.locator('[aria-current="page"]').textContent(),
        'WriteStart an article.',
      );
      for (const target of await page
        .locator('.sk-grouped-panel a:visible, .sk-grouped-menu summary')
        .all()) {
        assert.ok((await target.boundingBox()).height >= 44, `44px target at ${width}`);
      }
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
      await page.keyboard.press('Tab');
      assert.equal(
        await page.evaluate(() => document.activeElement.getAttribute('href')),
        '/write',
      );
      await page.keyboard.press('Escape');
      assert.equal(await menu.getAttribute('open'), null);
      assert.equal(await summary.evaluate((el) => el === document.activeElement), true);
      await page.keyboard.press('Space');
      await page.locator('.sk-grouped-panel').waitFor({ state: 'visible' });
      await page.locator('#outside').click();
      assert.equal(await menu.getAttribute('open'), null);
      await summary.click();
      await page.evaluate(() => window.navigate('analyze'));
      await page.waitForFunction(() => !document.querySelector('[data-sitekit-menu]').open);
      assert.equal(await page.locator('[aria-current="page"]').getAttribute('href'), '/analyze');
      await summary.click();
      // Prevent document navigation; the shared click handler still dismisses the menu.
      await page.evaluate(() =>
        document.addEventListener('click', (e) => e.preventDefault(), { once: true }),
      );
      await page.locator('.sk-grouped-panel a').first().click();
      assert.equal(await menu.getAttribute('open'), null);
      await summary.click();
      await page.screenshot({ path: `/tmp/sitekit-grouped-${width}.png` });
    }
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});
