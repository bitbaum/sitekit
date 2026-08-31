import { test } from 'node:test';
import assert from 'node:assert/strict';

import { siteNavItems, pageRendersOwnHeader, sitePageAt, href } from 'sitekit';

const PAGES = [
  {
    path: '',
    navLabel: 'Home',
    title: 'Home',
    sections: [{ kind: 'hero', statement: 'Hi', lead: [] }],
  },
  {
    path: 'menu',
    navLabel: 'Menu',
    title: 'Menu',
    sections: [{ kind: 'prose', paragraphs: ['x'] }],
  },
  { path: 'imprint', title: 'Imprint', sections: [{ kind: 'prose', paragraphs: ['x'] }] },
];

test('nav omits pages without a navLabel', () => {
  assert.deepEqual(siteNavItems(PAGES), [
    { path: '', label: 'Home' },
    { path: 'menu', label: 'Menu' },
  ]);
});

test('a page opening with a hero renders its own header', () => {
  assert.equal(pageRendersOwnHeader(PAGES[0]), true);
  assert.equal(pageRendersOwnHeader(PAGES[1]), false);
});

test('sitePageAt normalises slashes and misses cleanly', () => {
  assert.equal(sitePageAt(PAGES, '/menu/'), PAGES[1]);
  assert.equal(sitePageAt(PAGES, ''), PAGES[0]);
  assert.equal(sitePageAt(PAGES, 'nope'), null);
});

test('href: root is /, everything else /segment', () => {
  assert.equal(href(), '/');
  assert.equal(href('menu'), '/menu');
  assert.equal(href('/menu/'), '/menu');
});
