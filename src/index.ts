/**
 * sitekit — a website as data.
 *
 * This root export is framework-free: schemas, inferred types, validation and
 * provenance. The React renderers live behind `sitekit/react` so a generator
 * or a CI check can depend on the model without pulling in React.
 */

export {
  // schemas (Zod is the SSOT; every type below is inferred from one of these)
  siteSpecSchema,
  sitePageSchema,
  siteChromeSchema,
  siteSectionSchema,
  siteNavItemSchema,
  heroSectionSchema,
  proseSectionSchema,
  statsSectionSchema,
  meterSectionSchema,
  cardsSectionSchema,
  definitionsSectionSchema,
  indexSectionSchema,
  tableSectionSchema,
  siteStatSchema,
  siteCardSchema,
  siteDefinitionSchema,
  siteIndexEntrySchema,
  // types
  type SiteSpec,
  type SitePage,
  type SiteChrome,
  type SiteSection,
  type SiteSectionKind,
  type SiteNavItem,
  type SiteStat,
  type SiteCard,
  type SiteDefinition,
  type SiteIndexEntry,
} from './schema.js';

export {
  provenanceSchema,
  provenanceEntrySchema,
  type Provenance,
  type ProvenanceEntry,
  inferredPaths,
  notFoundPaths,
  assertDeliverable,
} from './provenance.js';

export { validateSite, siteNavItems, pageRendersOwnHeader, sitePageAt, href } from './model.js';
