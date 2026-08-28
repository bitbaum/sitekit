/**
 * Shared type primitives for site sections.
 *
 * The whole visual system of a generated site lives in these components plus
 * the section files beside them. They emit SEMANTIC utility classes only —
 * `text-fg-primary`, `bg-surface-page`, `font-heading` — and ship no colours,
 * no faces, no radii. Each consumer defines those tokens in its own
 * stylesheet, which is how fifty sites share one renderer without looking
 * like one company. The full class contract is in the README.
 */

import type { ReactNode } from 'react';

/**
 * A numbered section heading. Numbering makes a long page navigable and
 * signals that the document has a structure rather than being a stack of
 * blocks.
 */
export function SectionHeading({ index, children }: { index?: number; children: ReactNode }) {
  return (
    <div className="flex items-baseline gap-4">
      {index !== undefined && (
        <span aria-hidden className="font-mono text-xs tabular-nums text-fg-muted">
          {String(index).padStart(2, '0')}
        </span>
      )}
      <h2 className="font-heading text-2xl font-semibold tracking-display text-fg-primary sm:text-3xl">
        {children}
      </h2>
    </div>
  );
}

/** Standfirst under a heading. Kept at measure — it is prose, not layout. */
export function Blurb({ children }: { children: ReactNode }) {
  return <p className="mt-3 max-w-prose text-base leading-relaxed text-fg-secondary">{children}</p>;
}

/**
 * Indents a section's body to sit under the heading text rather than under its
 * number. Small thing; it is what makes the numbering read as a margin note
 * instead of a bullet.
 */
export function SectionBody({ children }: { children: ReactNode }) {
  return <div className="mt-6 sm:pl-10">{children}</div>;
}
