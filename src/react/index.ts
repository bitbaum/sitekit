/**
 * sitekit/react — the one set of renderers every generated site shares.
 *
 * Emits SEMANTIC utility classes only (`text-fg-primary`, `bg-surface-page`,
 * `font-heading`, …) and ships no colours, faces or radii: each consumer
 * defines those tokens in its own stylesheet. Uniform system, divergent
 * aesthetics — the class contract is in the README.
 */

export { SiteSections } from './SiteSections.js';
export { SiteMasthead, SiteFooter } from './SiteChrome.js';
export { SiteNav } from './SiteNav.js';
export { NavAutoScroll } from './NavAutoScroll.js';
export { DefaultLink, type LinkLike, type LinkProps } from './link.js';
export { SectionHeading, Blurb, SectionBody } from './sections/Primitives.js';
export { HeroSection } from './sections/HeroSection.js';
export { ProseSection, CardsSection, DefinitionsSection } from './sections/ProseSections.js';
export { StatsSection, MeterSection } from './sections/FigureSections.js';
export { IndexSection, TableSection } from './sections/DataSections.js';
export { FeatureSection, ContactSection, FaqSection } from './sections/BusinessSections.js';
