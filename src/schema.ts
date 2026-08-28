/**
 * The content model: a site is pages, a page is sections, and sections come
 * from a small CLOSED set of shapes.
 *
 * The closed set is the design, not a limitation. A generator emitting data
 * against this schema is a task with a machine-checkable result; a generator
 * emitting components is not. Per-site quality becomes a property of the
 * renderers — fixing one renderer improves every site ever generated.
 *
 * Zod is the single source of truth here: every TypeScript type is inferred
 * from its schema, never written twice. Extracted from substrata's
 * `config/site-content.ts` (2026-08-26), which remains the reference consumer.
 */

import { z } from 'zod';
import { provenanceSchema } from './provenance.js';

// =====================================================================
// SECTION PARTS
// =====================================================================

/** A stat worth putting at the top of a page. */
export const siteStatSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  note: z.string().optional(),
});
export type SiteStat = z.infer<typeof siteStatSchema>;

export const siteCardSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  /** Short trailing line — a price, a status, a jurisdiction. */
  meta: z.string().optional(),
});
export type SiteCard = z.infer<typeof siteCardSchema>;

export const siteDefinitionSchema = z.object({
  term: z.string().min(1),
  detail: z.string().min(1),
});
export type SiteDefinition = z.infer<typeof siteDefinitionSchema>;

export const siteIndexEntrySchema = z.object({
  label: z.string().min(1),
  /** Small trailing figure — a count, a desk name. Rendered in mono. */
  meta: z.string().optional(),
  /** Fragment this entry jumps to; must match a section's `anchor` on the same page. */
  anchor: z.string().min(1),
});
export type SiteIndexEntry = z.infer<typeof siteIndexEntrySchema>;

// =====================================================================
// SECTIONS
// =====================================================================

/**
 * Opens a page in place of the standard title block. An eyebrow, one display
 * statement, and the lead. Only ever the FIRST section of a page — the page
 * schema enforces it, and the shell suppresses its own header when present so
 * the two cannot both render.
 */
export const heroSectionSchema = z.object({
  kind: z.literal('hero'),
  eyebrow: z.string().optional(),
  statement: z.string().min(1),
  lead: z.array(z.string().min(1)),
});

export const proseSectionSchema = z.object({
  kind: z.literal('prose'),
  heading: z.string().optional(),
  paragraphs: z.array(z.string().min(1)).min(1),
});

export const statsSectionSchema = z.object({
  kind: z.literal('stats'),
  heading: z.string().optional(),
  stats: z.array(siteStatSchema).min(1),
});

/**
 * One number that deserves a picture. The gap between `value` and `of` IS the
 * message — an empty bar is the honest rendering of "nothing sourced yet",
 * and it should look empty.
 */
export const meterSectionSchema = z.object({
  kind: z.literal('meter'),
  heading: z.string().optional(),
  label: z.string().min(1),
  value: z.number().nonnegative(),
  of: z.number().nonnegative(),
  caption: z.string().optional(),
});

export const cardsSectionSchema = z.object({
  kind: z.literal('cards'),
  heading: z.string().optional(),
  blurb: z.string().optional(),
  columns: z.union([z.literal(2), z.literal(3)]).optional(),
  cards: z.array(siteCardSchema).min(1),
});

export const definitionsSectionSchema = z.object({
  kind: z.literal('definitions'),
  heading: z.string().optional(),
  blurb: z.string().optional(),
  items: z.array(siteDefinitionSchema).min(1),
});

/** Jump list for a long page. Without one, fifteen tables is a scroll, not a document. */
export const indexSectionSchema = z.object({
  kind: z.literal('index'),
  heading: z.string().optional(),
  blurb: z.string().optional(),
  entries: z.array(siteIndexEntrySchema).min(1),
});

export const tableSectionSchema = z.object({
  kind: z.literal('table'),
  heading: z.string().optional(),
  blurb: z.string().optional(),
  /** Fragment id, so an `index` entry can link straight here. */
  anchor: z.string().optional(),
  columns: z.array(z.string()).min(1),
  rows: z.array(z.array(z.string())),
  /** Column indices rendered in mono — codes, figures, statuses. */
  monoColumns: z.array(z.number().int().nonnegative()).optional(),
  /** Column index whose cell text is also a status keyword to dot-colour. */
  statusColumn: z.number().int().nonnegative().optional(),
  note: z.string().optional(),
});

export const siteSectionSchema = z.discriminatedUnion('kind', [
  heroSectionSchema,
  proseSectionSchema,
  statsSectionSchema,
  meterSectionSchema,
  cardsSectionSchema,
  definitionsSectionSchema,
  indexSectionSchema,
  tableSectionSchema,
]);
export type SiteSection = z.infer<typeof siteSectionSchema>;
export type SiteSectionKind = SiteSection['kind'];

// =====================================================================
// PAGES AND CHROME
// =====================================================================

export const sitePageSchema = z
  .object({
    /** '' is the home page; otherwise a single path segment, e.g. 'map'. */
    path: z.string().regex(/^[a-z0-9-]*$/, 'a single lowercase path segment, or "" for home'),
    /** Label in the site's own navigation. Omit to keep a page out of the nav. */
    navLabel: z.string().optional(),
    /** <title> and the page's h1. */
    title: z.string().min(1),
    /** One line under the h1. */
    intro: z.string().optional(),
    sections: z.array(siteSectionSchema).min(1),
  })
  .superRefine((page, ctx) => {
    page.sections.forEach((section, i) => {
      if (section.kind === 'hero' && i > 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['sections', i],
          message: 'a hero opens a page; it can only be the first section',
        });
      }
    });
  });
export type SitePage = z.infer<typeof sitePageSchema>;

/** Everything the site chrome needs: the masthead, the nav, the footer. */
export const siteChromeSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  /** Line in the footer — who runs this and under what rules. */
  footerNote: z.string().min(1),
  /** Canonical host shown in the footer, e.g. 'substrata.orangecat.ch'. */
  host: z.string().optional(),
});
export type SiteChrome = z.infer<typeof siteChromeSchema>;

/**
 * One object a generator emits: the whole site, plus (optionally) where every
 * field of it came from. This is the machine-checkable boundary between "a
 * model wrote something" and "a site we can stand behind".
 */
export const siteSpecSchema = z
  .object({
    chrome: siteChromeSchema,
    pages: z.array(sitePageSchema).min(1),
    provenance: provenanceSchema.optional(),
  })
  .superRefine((spec, ctx) => {
    const seen = new Set<string>();
    spec.pages.forEach((page, i) => {
      if (seen.has(page.path)) {
        ctx.addIssue({
          code: 'custom',
          path: ['pages', i, 'path'],
          message: `duplicate page path '${page.path || '(home)'}'`,
        });
      }
      seen.add(page.path);

      // An index entry that points at nothing is a dead link the reader will
      // actually click — checked per page, where the fragments live.
      const anchors = new Set(
        page.sections.flatMap(s => (s.kind === 'table' && s.anchor ? [s.anchor] : [])),
      );
      page.sections.forEach((section, j) => {
        if (section.kind !== 'index') return;
        section.entries.forEach((entry, k) => {
          if (!anchors.has(entry.anchor)) {
            ctx.addIssue({
              code: 'custom',
              path: ['pages', i, 'sections', j, 'entries', k, 'anchor'],
              message: `index entry points at '#${entry.anchor}', but no section on this page carries that anchor`,
            });
          }
        });
      });
    });
  });
export type SiteSpec = z.infer<typeof siteSpecSchema>;

/** Nav entry: a label and where it goes, nothing more. */
export const siteNavItemSchema = z.object({
  path: z.string(),
  label: z.string().min(1),
});
export type SiteNavItem = z.infer<typeof siteNavItemSchema>;
