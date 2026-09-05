/**
 * The schema is the product: a generator's output is valid or it is rejected
 * with a path a model can act on. Every case imports the package by NAME so a
 * broken exports map fails here, not at the first consumer.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { validateSite, siteSectionSchema } from '@bitbaum/sitekit';

/** A minimal spec that exercises every section kind once. */
function fullSpec() {
  return {
    chrome: {
      name: 'Café Beispiel',
      tagline: 'Kaffee am Idaplatz',
      footerNote: 'Run by its owners.',
    },
    pages: [
      {
        path: '',
        navLabel: 'Home',
        title: 'Café Beispiel',
        sections: [
          {
            kind: 'hero',
            eyebrow: 'Zürich',
            statement: 'Coffee, done properly.',
            lead: ['Since 2011.'],
          },
          { kind: 'prose', heading: 'About', paragraphs: ['A neighbourhood café.'] },
          { kind: 'stats', heading: 'In numbers', stats: [{ label: 'Seats', value: '24' }] },
          { kind: 'meter', label: 'Sourced', value: 3, of: 12 },
          {
            kind: 'cards',
            heading: 'Offers',
            cards: [{ title: 'Espresso', body: 'The house shot.', meta: 'CHF 4.50' }],
          },
          {
            kind: 'definitions',
            heading: 'Terms',
            items: [{ term: 'Cortado', detail: 'Espresso cut with milk.' }],
          },
          {
            kind: 'feature',
            heading: 'The baker',
            paragraphs: ['Learned in Lyon.'],
            quote: 'Every croissant tells.',
            cta: { label: 'More', href: 'about' },
            image: { src: '/founder.jpg', alt: 'The founder at the oven' },
          },
          {
            kind: 'contact',
            heading: 'Find us',
            anchor: 'standorte',
            locations: [
              {
                name: 'Café',
                note: 'Open Sundays',
                address: 'Limmatquai 42, 8001 Zürich',
                phone: '+41 44 000 12 34',
                hours: ['Mo–Fr: 06:30–18:00'],
              },
            ],
          },
          {
            kind: 'faq',
            heading: 'Good to know',
            items: [{ question: 'Can I order ahead?', answer: 'Yes, until 05:00.' }],
          },
          {
            kind: 'index',
            heading: 'Contents',
            entries: [{ label: 'Opening hours', anchor: 'hours' }],
          },
          {
            kind: 'table',
            anchor: 'hours',
            columns: ['Day', 'Hours'],
            rows: [['Mon–Fri', '07–18']],
          },
        ],
      },
    ],
  };
}

test('a spec exercising every section kind validates', () => {
  const result = validateSite(fullSpec());
  assert.equal(result.success, true);
  assert.equal(result.data.pages[0].sections.length, 11);
});

test('an unknown section kind is rejected — the union is closed', () => {
  const spec = fullSpec();
  spec.pages[0].sections.push({ kind: 'carousel', images: [] });
  const result = validateSite(spec);
  assert.equal(result.success, false);
  assert.ok(result.errors.some((e) => e.includes('sections')));
});

test('a hero anywhere but first is rejected', () => {
  const spec = fullSpec();
  spec.pages[0].sections.push({ kind: 'hero', statement: 'Second hero', lead: [] });
  const result = validateSite(spec);
  assert.equal(result.success, false);
  assert.ok(
    result.errors.some((e) => e.includes('first section')),
    result.errors.join('\n'),
  );
});

test('an index entry pointing at a missing anchor is rejected', () => {
  const spec = fullSpec();
  spec.pages[0].sections[9].entries.push({ label: 'Nowhere', anchor: 'missing' });
  const result = validateSite(spec);
  assert.equal(result.success, false);
  assert.ok(
    result.errors.some((e) => e.includes("'#missing'")),
    result.errors.join('\n'),
  );
});

test('duplicate page paths are rejected', () => {
  const spec = fullSpec();
  spec.pages.push({ ...fullSpec().pages[0] });
  const result = validateSite(spec);
  assert.equal(result.success, false);
  assert.ok(result.errors.some((e) => e.includes('duplicate page path')));
});

test('a multi-segment path is rejected — pages are one segment deep', () => {
  const spec = fullSpec();
  spec.pages[0].path = 'a/b';
  const result = validateSite(spec);
  assert.equal(result.success, false);
});

test('errors carry actionable paths, not just messages', () => {
  const result = validateSite({ chrome: { name: '' }, pages: [] });
  assert.equal(result.success, false);
  assert.ok(
    result.errors.some((e) => e.startsWith('chrome.')),
    result.errors.join('\n'),
  );
});

test('a bare section validates against the section schema directly', () => {
  const parsed = siteSectionSchema.safeParse({ kind: 'prose', paragraphs: ['One.'] });
  assert.equal(parsed.success, true);
});

test('a hero action pointing at a missing fragment is rejected', () => {
  const spec = fullSpec();
  spec.pages[0].sections[0].actions = [{ label: 'Nowhere', href: '#missing' }];
  const result = validateSite(spec);
  assert.equal(result.success, false);
  assert.ok(
    result.errors.some((e) => e.includes("'#missing'")),
    result.errors.join('\n'),
  );
});

test('a hero action pointing at a real anchor validates', () => {
  const spec = fullSpec();
  spec.pages[0].sections[0].actions = [{ label: 'Find us', href: '#standorte' }];
  assert.equal(validateSite(spec).success, true);
});
