/**
 * Sections a small business needs that a research publication does not:
 * the founder story, where the shop actually is, and the questions every
 * customer asks. Added for the Camille rebuild (the first real site the
 * union was tested against), which is exactly how the union is meant to
 * grow — a kind lands here with its schema and tests when a real site
 * cannot be expressed without it.
 */

import { Blurb, SectionBody, SectionHeading } from './Primitives.js';
import type { SiteSection } from '../../schema.js';

/**
 * A figure beside a story. The one section on a small-business site that is
 * allowed to be personal.
 */
export function FeatureSection({
  section,
  index,
}: {
  section: Extract<SiteSection, { kind: 'feature' }>;
  index?: number;
}) {
  return (
    <section id={section.anchor} className="scroll-mt-24">
      {section.heading && <SectionHeading index={index}>{section.heading}</SectionHeading>}
      <SectionBody>
        <div className={section.image ? 'grid items-center gap-10 lg:grid-cols-2' : 'max-w-prose'}>
          {section.image && (
            // Plain <img>: the package cannot depend on a framework's image
            // component, and a generated site's images are already sized by
            // the generator.
            <img
              src={section.image.src}
              alt={section.image.alt}
              className="w-full rounded-2xl border border-subtle object-cover"
            />
          )}
          <div>
            <div className="max-w-prose space-y-4">
              {section.paragraphs.map((paragraph, i) => (
                <p key={i} className="text-base leading-relaxed text-fg-secondary">
                  {paragraph}
                </p>
              ))}
            </div>
            {section.quote && (
              <blockquote className="mt-6 border-l-4 border-accent pl-4 italic text-fg-secondary">
                «{section.quote}»
              </blockquote>
            )}
            {section.cta && (
              <a
                href={section.cta.href}
                className="mt-6 inline-block font-medium text-accent hover:underline"
              >
                {section.cta.label} →
              </a>
            )}
          </div>
        </div>
      </SectionBody>
    </section>
  );
}

/**
 * Where the business actually is. Address, phone and hours are the fields
 * the provenance rules exist to protect — this renderer shows exactly what
 * the data says and nothing more, including simply omitting hours that were
 * never found.
 */
export function ContactSection({
  section,
  index,
}: {
  section: Extract<SiteSection, { kind: 'contact' }>;
  index?: number;
}) {
  return (
    <section id={section.anchor} className="scroll-mt-24">
      {section.heading && <SectionHeading index={index}>{section.heading}</SectionHeading>}
      {section.blurb && <div className="sm:pl-10">{<Blurb>{section.blurb}</Blurb>}</div>}
      <SectionBody>
        <div className="grid gap-6 md:grid-cols-2">
          {section.locations.map((location) => (
            <div
              key={location.name}
              className="rounded-2xl border border-subtle bg-surface-raised p-6 sm:p-8"
            >
              {location.note && (
                <p className="mb-1 font-mono text-xs uppercase tracking-caps text-fg-tertiary">
                  {location.note}
                </p>
              )}
              <h3 className="font-heading text-2xl font-semibold text-fg-primary">
                {location.name}
              </h3>
              <address className="mt-3 not-italic leading-relaxed text-fg-secondary">
                {location.address}
              </address>
              {location.phone && (
                <p className="text-fg-secondary">
                  <a
                    href={`tel:${location.phone.replace(/\s+/g, '')}`}
                    className="hover:text-accent"
                  >
                    {location.phone}
                  </a>
                </p>
              )}
              {location.hours && location.hours.length > 0 && (
                <ul className="mt-4 space-y-1 text-sm text-fg-muted">
                  {location.hours.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </SectionBody>
    </section>
  );
}

/**
 * Native <details> disclosure — works with JavaScript disabled, which a
 * generated site for a small business should.
 */
export function FaqSection({
  section,
  index,
}: {
  section: Extract<SiteSection, { kind: 'faq' }>;
  index?: number;
}) {
  return (
    <section id={section.anchor} className="scroll-mt-24">
      {section.heading && <SectionHeading index={index}>{section.heading}</SectionHeading>}
      <SectionBody>
        <div className="max-w-prose space-y-4">
          {section.items.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl border border-subtle bg-surface-raised open:border-accent"
            >
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-fg-primary">
                {item.question}
                <span
                  aria-hidden
                  className="text-xl text-accent transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="px-5 pb-4 text-sm leading-relaxed text-fg-secondary">{item.answer}</p>
            </details>
          ))}
        </div>
      </SectionBody>
    </section>
  );
}
