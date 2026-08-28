/**
 * Provenance is what turns "we fabricate no facts" from a promise into a
 * check. The one behaviour that matters: an `inferred` field blocks delivery,
 * and the error says exactly where it is.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  provenanceSchema,
  inferredPaths,
  notFoundPaths,
  assertDeliverable,
} from 'sitekit';

const PROV = {
  'chrome.name': { kind: 'scraped', url: 'https://cafe-beispiel.ch/' },
  'pages.0.sections.1.paragraphs.0': { kind: 'operator' },
  'pages.0.sections.4.cards.0.meta': { kind: 'inferred' },
  'pages.0.sections.7.rows.0.1': { kind: 'not-found' },
};

test('the sidecar validates against its schema', () => {
  assert.equal(provenanceSchema.safeParse(PROV).success, true);
});

test('a scraped entry requires a URL', () => {
  const bad = { 'chrome.name': { kind: 'scraped' } };
  assert.equal(provenanceSchema.safeParse(bad).success, false);
});

test('inferredPaths finds exactly the invented fields', () => {
  assert.deepEqual(inferredPaths(PROV), ['pages.0.sections.4.cards.0.meta']);
});

test('notFoundPaths records that the looking happened', () => {
  assert.deepEqual(notFoundPaths(PROV), ['pages.0.sections.7.rows.0.1']);
});

test('assertDeliverable throws, naming every inferred path', () => {
  assert.throws(() => assertDeliverable(PROV), /pages\.0\.sections\.4\.cards\.0\.meta/);
});

test('assertDeliverable passes once nothing is inferred', () => {
  const clean = { ...PROV };
  delete clean['pages.0.sections.4.cards.0.meta'];
  assert.doesNotThrow(() => assertDeliverable(clean));
});
