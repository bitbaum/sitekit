/**
 * Renderer smoke tests: every section kind renders to markup containing its
 * content, and the Link seam actually injects — the two things a consumer
 * discovers first if they break.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { SiteSections, SiteMasthead, SiteFooter } from 'sitekit/react';

const SECTIONS = [
  { kind: 'hero', eyebrow: 'Zürich', statement: 'Coffee, done properly.', lead: ['Since 2011.'] },
  { kind: 'prose', heading: 'About', paragraphs: ['A neighbourhood café.'] },
  { kind: 'stats', heading: 'In numbers', stats: [{ label: 'Seats', value: '24', note: 'inside' }] },
  { kind: 'meter', label: 'Sourced', value: 3, of: 12, caption: 'so far' },
  { kind: 'cards', heading: 'Offers', columns: 3, cards: [{ title: 'Espresso', body: 'The house shot.', meta: 'CHF 4.50' }] },
  { kind: 'definitions', heading: 'Terms', items: [{ term: 'Cortado', detail: 'Espresso cut with milk.' }] },
  { kind: 'index', heading: 'Contents', entries: [{ label: 'Opening hours', anchor: 'hours', meta: '7d' }] },
  {
    kind: 'table', anchor: 'hours', heading: 'Hours', columns: ['Day', 'Hours', 'Status'],
    rows: [['Mon–Fri', '07–18', 'done']], monoColumns: [1], statusColumn: 2, note: 'Holidays differ.',
  },
];

test('every section kind renders its content', () => {
  const html = renderToStaticMarkup(h(SiteSections, { sections: SECTIONS }));
  for (const needle of [
    'Coffee, done properly.', 'A neighbourhood café.', 'Seats', '25%', 'Espresso',
    'CHF 4.50', 'Cortado', '#hours', 'id="hours"', 'Mon–Fri', 'Holidays differ.',
  ]) {
    assert.ok(html.includes(needle), `expected rendered html to contain ${JSON.stringify(needle)}`);
  }
});

test('numbering counts only headed sections, hero and table take none', () => {
  const html = renderToStaticMarkup(h(SiteSections, { sections: SECTIONS }));
  // Headed sections number 01–05: prose, stats, cards, definitions, index.
  // Hero and table never number; the meter here has no heading so it skips too.
  assert.ok(html.includes('>01<'));
  assert.ok(html.includes('>05<'));
  assert.ok(!html.includes('>06<'), 'only headed, numberable sections take a number');
});

const CHROME = { name: 'Café Beispiel', tagline: 'Kaffee', footerNote: 'Run by its owners.', host: 'beispiel.ch' };
const NAV = [{ path: '', label: 'Home' }, { path: 'menu', label: 'Menu' }];

test('masthead defaults to plain anchors', () => {
  const html = renderToStaticMarkup(h(SiteMasthead, { chrome: CHROME, navItems: NAV, currentPath: 'menu' }));
  assert.ok(html.includes('<a href="/menu"'));
  assert.ok(html.includes('aria-current="page"'));
});

test('the Link seam injects a framework component', () => {
  const FakeLink = props => h('a', { ...props, 'data-framework': 'yes' });
  const html = renderToStaticMarkup(
    h(SiteMasthead, { chrome: CHROME, navItems: NAV, currentPath: '', Link: FakeLink }),
  );
  assert.ok(html.includes('data-framework="yes"'));
});

test('footer shows host only when given', () => {
  const withHost = renderToStaticMarkup(h(SiteFooter, { chrome: CHROME }));
  assert.ok(withHost.includes('beispiel.ch'));
  const rest = { ...CHROME };
  delete rest.host;
  const withoutHost = renderToStaticMarkup(h(SiteFooter, { chrome: rest }));
  assert.ok(!withoutHost.includes('beispiel.ch'));
});
