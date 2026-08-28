/**
 * Where every generated field came from — the check behind "we fabricate no
 * facts".
 *
 * A closed schema invites completion: a model handed a `stats` section wants
 * numbers in it, and a plausible-but-wrong street number is the one detail
 * that actively damages the business a pitch is meant to win. So provenance
 * makes absence first-class and typed:
 *
 *   - `scraped`   — read from the subject's own public web, with the URL
 *   - `operator`  — a human typed it and answers for it
 *   - `inferred`  — a model filled it in. NEVER deliverable in a real pitch.
 *   - `not-found` — we looked and could not find it. Unknown is not empty:
 *                   this is the record that the looking happened, and it is
 *                   what makes "here is what we could not find out about you"
 *                   an honest sentence instead of an excuse.
 *
 * The map is a sidecar keyed by JSON path (e.g. `pages.0.sections.2.cards.1.body`)
 * rather than annotations woven through the content, so the renderers stay
 * ignorant of it and the check stays one function.
 */

import { z } from 'zod';

export const provenanceEntrySchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('scraped'), url: z.url() }),
  z.object({ kind: z.literal('operator') }),
  z.object({ kind: z.literal('inferred') }),
  z.object({ kind: z.literal('not-found') }),
]);
export type ProvenanceEntry = z.infer<typeof provenanceEntrySchema>;

/** JSON path → where that field came from. */
export const provenanceSchema = z.record(z.string(), provenanceEntrySchema);
export type Provenance = z.infer<typeof provenanceSchema>;

function pathsOf(provenance: Provenance, kind: ProvenanceEntry['kind']): string[] {
  return Object.entries(provenance)
    .filter(([, entry]) => entry.kind === kind)
    .map(([path]) => path)
    .sort();
}

/** Fields a model invented. A deliverable site has none. */
export function inferredPaths(provenance: Provenance): string[] {
  return pathsOf(provenance, 'inferred');
}

/**
 * Fields we looked for and could not find. These are not defects — shown
 * honestly, they are the pitch: what we could not learn about you in five
 * minutes is what your customers also cannot.
 */
export function notFoundPaths(provenance: Provenance): string[] {
  return pathsOf(provenance, 'not-found');
}

/**
 * Throws unless every field is scraped, operator-entered, or honestly absent.
 * Call this before anything generated is shown to, or handed to, a real
 * business. The error names every offending path so the fix is a lookup, not
 * a hunt.
 */
export function assertDeliverable(provenance: Provenance): void {
  const inferred = inferredPaths(provenance);
  if (inferred.length > 0) {
    throw new Error(
      `site is not deliverable: ${inferred.length} field(s) were inferred rather than ` +
        `sourced or left honestly absent:\n  ${inferred.join('\n  ')}`,
    );
  }
}
