import React from 'react';
import mosaicMark from '../assets/mosaic-mark.svg';
import { lastUpdated } from 'virtual:mo-last-updated';
import { colors } from '../tokens.mjs';

/**
 * The footer every docs page ends with.
 *
 * Two jobs, and they are kept on separate lines on purpose. `Built by` is
 * attribution and belongs to a person; `Last updated` is the state of the
 * system and belongs to whoever reads this next. Anyone is free to remove the
 * credit — it is one line in a file and nothing here tries to prevent that —
 * but the date should survive that edit, because losing it costs the reader
 * rather than the author.
 *
 * The date comes from the package's last commit (see lastUpdatedPlugin), not a
 * literal, so it cannot rot. When git has nothing to say — a shallow CI clone —
 * the line is omitted rather than invented.
 *
 * `variant="full"` is for the Introduction, which is where the system gets
 * introduced and where the credit reads as authorship. Every other page gets
 * `compact`: the same orientation for somebody who arrived on a deep link, with
 * the credit said once rather than sixty times, which would read as a watermark
 * instead of information.
 */
export function DocsFooter({ variant = 'compact' }: { variant?: 'full' | 'compact' }) {
  const when = lastUpdated.date
    ? new Date(lastUpdated.date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  // First name only. The plugin deliberately keeps the whole name — that is the
  // data — and shortening it is a presentation choice made here, so nobody has
  // to guess which layer owns it. Note this splits on a space on purpose, unlike
  // the plugin, where splitting on spaces was the bug: there it was parsing git
  // output, here it is trimming a display string.
  const who = lastUpdated.author?.split(' ')[0] ?? null;

  const meta = colors['mo-grey'].DEFAULT;
  const link = { color: colors['mo-red'].DEFAULT, fontWeight: 600 } as const;

  return (
    <footer
      style={{
        marginTop: variant === 'full' ? 48 : 40,
        paddingTop: 20,
        borderTop: `1px solid ${colors['mo-grey'][3]}`,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 20,
        fontSize: 13,
        lineHeight: 1.7,
        color: meta,
      }}
    >
      {/* A link, like the sidebar mark: the two are the only marks on the page
          and they should do the same thing. It was decorative before. */}
      <a
        href="/?path=/docs/introduction--docs"
        target="_top"
        style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, textDecoration: 'none' }}
      >
        <img src={mosaicMark} alt="" width={variant === 'full' ? 28 : 22} height={variant === 'full' ? 28 : 22} style={{ flex: 'none' }} />
        <span style={{ fontWeight: 600, color: colors['mo-black'], fontSize: variant === 'full' ? 14 : 13 }}>Mosaic Design System</span>
      </a>
      <div style={{ minWidth: 0, textAlign: 'right', flex: '1 1 260px' }}>
        {variant === 'full' && <p style={{ margin: 0 }}>Built by Jimmy Esteban</p>}
        {when && (
          <p style={{ margin: variant === 'full' ? '2px 0 0' : 0 }}>
            Last updated: {when}
            {who ? ` by ${who}` : ''}
          </p>
        )}
      </div>
    </footer>
  );
}
