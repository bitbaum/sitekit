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

test('on the narrowest phones the account action moves into the menu, never off the screen', () => {
  const html = renderToStaticMarkup(
    h(SiteMasthead, {
      chrome,
      appearance: 'application',
      currentPath: '',
      navItems: [{ path: 'blog', label: 'Blog' }],
      actions: h('a', { href: '/login' }, 'Sign in'),
    }),
  );
  const menu = html.slice(html.indexOf('sk-mobile-menu'), html.indexOf('</details>'));
  assert.ok(menu.includes('sk-menu-actions'), 'the menu carries the actions');
  assert.ok(menu.includes('href="/login"'), 'the same action, one tap away');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  assert.match(
    css,
    /@media \(max-width: 380px\)[\s\S]*\.sk-masthead-row:has\(\.sk-mobile-menu\) > \.sk-account-actions \{\s*display: none;/,
    'the row drops its action only where a menu holds it',
  );
  // Without nav items there is no menu, and the action stays in the row.
  const bare = renderToStaticMarkup(
    h(SiteMasthead, {
      chrome,
      appearance: 'application',
      currentPath: '',
      navItems: [],
      actions: h('a', { href: '/login' }, 'Sign in'),
    }),
  );
  assert.ok(!bare.includes('sk-menu-actions') && bare.includes('sk-account-actions'));
});

test('grouped navigation renders one descriptive link tree with active route and account access', () => {
  const html = renderToStaticMarkup(
    h(SiteMasthead, {
      chrome,
      appearance: 'application',
      currentPath: 'write',
      navItems: [{ path: 'legacy', label: 'Legacy' }],
      navGroups: [
        { label: 'Empty', items: [] },
        {
          label: 'Create',
          items: [{ path: 'write', label: 'Write', description: 'Start your article.' }],
        },
        { label: 'Read', items: [{ path: '', label: 'Today', description: 'Follow the news.' }] },
      ],
      actions: h('a', { href: '/account' }, 'Account'),
    }),
  );
  assert.equal((html.match(/<details/g) || []).length, 1);
  assert.equal((html.match(/href="\/write"/g) || []).length, 1);
  assert.equal((html.match(/aria-current="page"/g) || []).length, 1);
  assert.ok(html.includes('<h2>Create</h2>'));
  assert.ok(html.includes('Start your article.'));
  assert.ok(html.includes('aria-label="Read"'));
  assert.ok(html.includes('href="/"'));
  assert.ok(html.includes('sk-grouped-actions'));
  assert.ok(!html.includes('Legacy') && !html.includes('<h2>Empty</h2>'));
});

test('empty groups retain flat navigation and descriptions are escaped as text', () => {
  const props = {
    chrome,
    appearance: 'application',
    currentPath: '',
    navItems: [{ path: '', label: 'Home' }],
  };
  const fallback = renderToStaticMarkup(
    h(SiteMasthead, { ...props, navGroups: [{ label: 'Empty', items: [] }] }),
  );
  assert.ok(fallback.includes('sk-mobile-menu'));
  assert.ok(fallback.includes('Home'));
  const grouped = renderToStaticMarkup(
    h(SiteMasthead, {
      ...props,
      navGroups: [
        {
          label: 'Read',
          items: [{ path: '', label: 'Home', description: '<script>unsafe</script>' }],
        },
      ],
    }),
  );
  assert.ok(!grouped.includes('<script>unsafe</script>'));
  assert.ok(grouped.includes('&lt;script&gt;unsafe&lt;/script&gt;'));
});
