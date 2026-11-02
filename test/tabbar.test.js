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
