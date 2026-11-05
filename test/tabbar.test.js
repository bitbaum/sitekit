import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { SiteTabBar } from '@bitbaum/sitekit/react';

test('tab bar marks the current section, including nested paths', () => {
  const html = renderToStaticMarkup(
    h(SiteTabBar, {
      currentPath: 'investigations/demo',
      items: [
        { path: '', label: 'Today', icon: '◎' },
        { path: 'investigations', label: 'Investigate', icon: '⌕' },
        { path: 'desk', label: 'My desk', icon: '★' },
      ],
    }),
  );
  assert.match(html, /aria-label="Main"/);
  assert.match(html, /href="\/investigations" aria-current="page"/);
  assert.doesNotMatch(html, /href="\/" aria-current/);
  assert.equal((html.match(/sk-tab"/g) || []).length, 3);
});

test('SiteIcon draws every named icon on currentColor and hides it from assistive tech', async () => {
  const { SiteIcon, SITE_ICON_NAMES } = await import('@bitbaum/sitekit/react');
  assert.ok(SITE_ICON_NAMES.includes('write'));
  for (const name of SITE_ICON_NAMES) {
    const html = renderToStaticMarkup(h(SiteIcon, { name }));
    assert.match(html, /aria-hidden="true"/, name);
    assert.match(html, /stroke="currentColor"/, name);
    assert.match(html, /<path|<circle|<rect/, name + ' has no drawing');
  }
});

test('a masthead that shares the page with a tab bar says so in its class', async () => {
  const { SiteMasthead } = await import('@bitbaum/sitekit/react');
  const props = {
    appearance: 'application',
    chrome: { name: 'Site', tagline: '', footerNote: '' },
    navItems: [{ path: '', label: 'Home' }],
    currentPath: '',
  };
  assert.match(
    renderToStaticMarkup(h(SiteMasthead, { ...props, tabBar: true })),
    /sk-masthead sk-masthead--tabbar/,
  );
  assert.doesNotMatch(renderToStaticMarkup(h(SiteMasthead, props)), /sk-masthead--tabbar/);
});
