/**
 * The opening of a page that has one.
 *
 * An eyebrow, one display statement, and the lead — the shape a serious
 * publication uses, and deliberately not a marketing hero: no gradient, no
 * illustration, no button. The claim is the design.
 */

import type { SiteSection } from '../../schema.js';

export function HeroSection({ section }: { section: Extract<SiteSection, { kind: 'hero' }> }) {
  return (
    <section className="border-b border-subtle pb-12">
      {section.eyebrow && (
        <p className="font-mono text-xs uppercase tracking-caps text-fg-tertiary">
          {section.eyebrow}
        </p>
      )}
      <h1 className="mt-5 max-w-4xl font-heading text-4xl font-semibold leading-tight tracking-display text-fg-primary sm:text-5xl lg:text-6xl">
        {section.statement}
      </h1>
      <div className="mt-7 max-w-prose space-y-4">
        {section.lead.map((paragraph, index) => (
          <p key={index} className="text-lg leading-relaxed text-fg-secondary">
            {paragraph}
          </p>
        ))}
      </div>
      {section.actions && section.actions.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-3">
          {section.actions.map((action, i) => (
            <a
              key={action.href}
              href={action.href}
              className={[
                'inline-flex min-h-11 items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium transition-colors',
                i === 0
                  ? 'bg-accent text-surface-page hover:opacity-90'
                  : 'border-2 border-strong text-fg-primary hover:border-accent hover:text-accent',
              ].join(' ')}
            >
              {action.label}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
