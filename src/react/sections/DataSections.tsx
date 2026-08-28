/**
 * Sections that present data itself: the jump index and the tables.
 *
 * Codes, counts and statuses are set in mono so a reader can scan a column;
 * the status cell carries a dot because a status keyword is the one word on a
 * page a reader must never skim past.
 */

import { Blurb, SectionBody, SectionHeading } from './Primitives.js';
import type { SiteSection } from '../../schema.js';

/** Status keyword → dot colour. Anything unrecognised stays neutral. */
const STATUS_DOT: Record<string, string> = {
  sourced: 'bg-status-positive',
  'unverified lead': 'bg-status-warning',
  taken: 'bg-fg-muted',
  done: 'bg-status-positive',
  'in progress': 'bg-status-warning',
  'not started': 'bg-fg-muted',
  // Scarcity grades. Red reads as "constrained", green as "no constraint here".
  chokepoint: 'bg-status-negative',
  concentrated: 'bg-status-warning',
  competitive: 'bg-status-positive',
};

export function IndexSection({
  section,
  index,
}: {
  section: Extract<SiteSection, { kind: 'index' }>;
  index?: number;
}) {
  return (
    <section>
      {section.heading && <SectionHeading index={index}>{section.heading}</SectionHeading>}
      {section.blurb && <div className="sm:pl-10">{<Blurb>{section.blurb}</Blurb>}</div>}
      <SectionBody>
        <ol className="divide-y divide-subtle border-y border-subtle">
          {section.entries.map((entry, i) => (
            <li key={entry.anchor}>
              <a
                href={`#${entry.anchor}`}
                className="group flex items-baseline gap-4 py-2.5 transition-colors hover:text-fg-primary"
              >
                <span className="font-mono text-xs tabular-nums text-fg-muted">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 text-sm text-fg-secondary group-hover:text-fg-primary">
                  {entry.label}
                </span>
                {entry.meta && (
                  <span className="font-mono text-xs tabular-nums text-fg-muted">{entry.meta}</span>
                )}
              </a>
            </li>
          ))}
        </ol>
      </SectionBody>
    </section>
  );
}

export function TableSection({ section }: { section: Extract<SiteSection, { kind: 'table' }> }) {
  const mono = new Set(section.monoColumns ?? []);

  // Fixed layout with declared widths, because a page can stack fifteen tables
  // with the same columns. Auto layout sizes each to its own longest cell, so
  // one long name shifts every column out of line with the table above it.
  // Aligned columns are what make the set read as one instrument.
  const restWidth = section.columns.length > 1 ? 66 / (section.columns.length - 1) : 100;

  return (
    <section id={section.anchor} className="scroll-mt-24">
      {section.heading && (
        <h3 className="font-heading text-lg font-semibold text-fg-primary">{section.heading}</h3>
      )}
      {section.blurb && <Blurb>{section.blurb}</Blurb>}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-left" style={{ minWidth: '560px' }}>
          <colgroup>
            {section.columns.map((_, i) => (
              <col key={i} style={{ width: i === 0 ? '34%' : `${restWidth}%` }} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-strong">
              {section.columns.map(column => (
                <th
                  key={column}
                  scope="col"
                  className="py-2.5 pr-4 font-mono text-xs font-medium uppercase tracking-caps text-fg-tertiary"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-subtle">
            {section.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => {
                  const isStatus = section.statusColumn === cellIndex;
                  const dot = isStatus ? STATUS_DOT[cell.trim().toLowerCase()] : undefined;
                  return (
                    <td
                      key={cellIndex}
                      className={[
                        'py-2.5 pr-4 align-top text-sm leading-relaxed',
                        mono.has(cellIndex)
                          ? 'font-mono text-xs tabular-nums text-fg-secondary'
                          : cellIndex === 0
                            ? 'text-fg-primary'
                            : 'text-fg-secondary',
                      ].join(' ')}
                    >
                      {isStatus ? (
                        <span className="inline-flex items-baseline gap-2">
                          <span
                            aria-hidden
                            className={`inline-block h-1.5 w-1.5 shrink-0 self-center rounded-full ${dot ?? 'bg-fg-muted'}`}
                          />
                          {cell}
                        </span>
                      ) : (
                        cell
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {section.note && (
        <p className="mt-3 max-w-prose text-xs leading-relaxed text-fg-muted">{section.note}</p>
      )}
    </section>
  );
}
