import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { SiteMasthead, SiteFooter } from '@bitbaum/sitekit/react';
const chrome = { name: 'Example', tagline: 'Investigate', footerNote: 'Source evidence.' };

test('application shell composes brand/account slots, skip target and accessible mobile navigation', () => {
  const html = renderToStaticMarkup(
    h(SiteMasthead, {
      chrome,
      appearance: 'application',
      mainId: 'content',
      currentPath: 'analyze',
      navItems: [
        { path: 'analyze', label: 'Examine' },
        { path: 'roadmap', label: 'Roadmap' },
      ],
      brand: h('span', null, 'Example brand'),
      actions: h('a', { href: '/account' }, 'Account'),
    }),
  );
  assert.ok(html.includes('href="#content"'));
  assert.ok(html.includes('Example brand'));
  assert.ok(html.includes('href="/account"'));
  assert.ok(html.includes('<details'));
  assert.ok(html.includes('<summary>Menu'));
  assert.equal((html.match(/aria-current="page"/g) || []).length, 2);
  assert.ok(html.includes('aria-label="Main navigation"'));
});
test('empty navigation has no dead menu control', () => {
  const html = renderToStaticMarkup(
    h(SiteMasthead, { chrome, appearance: 'application', currentPath: '', navItems: [] }),
  );
  assert.ok(!html.includes('<summary>'));
});
test('shared footer includes configured navigation and supplied additional content', () => {
  const html = renderToStaticMarkup(
    h(SiteFooter, {
      chrome,
      appearance: 'application',
      links: [
        { href: '/roadmap', label: 'Roadmap' },
        { href: '/blog', label: 'Journal' },
      ],
      extra: 'Beta',
    }),
  );
  assert.ok(html.includes('href="/roadmap"'));
  assert.ok(html.includes('Journal'));
  assert.ok(html.includes('Beta'));
  assert.ok(html.includes(String(new Date().getFullYear())));
});
test('standalone styles ship through the public package and define touch and keyboard floors', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.exports['./styles.css'], './styles.css');
  assert.ok(pkg.files.includes('styles.css'));
  assert.match(css, /min-height:\s*44px/);
  assert.ok(css.includes(':focus-visible'));
  assert.match(css, /@media\s*\(max-width:\s*1100px\)/);
});

test('footer groups have semantic labels and retain the legacy flat link contract', () => {
  const html = renderToStaticMarkup(
    h(SiteFooter, {
      chrome,
      appearance: 'application',
      groups: [
        { label: 'Product', links: [{ href: '/analyze', label: 'Examine text' }] },
        { label: 'Resources', links: [{ href: '/method', label: 'Our method' }] },
      ],
    }),
  );
  assert.ok(html.includes('<h2>Product</h2>'));
  assert.ok(html.includes('<h2>Resources</h2>'));
  assert.ok(html.includes('--sk-footer-columns:2'));
  assert.ok(html.includes('href="/analyze"'));
  assert.ok(html.includes('aria-label="Footer navigation"'));
});
