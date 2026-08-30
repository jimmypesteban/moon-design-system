import React from 'react';
import { colors, fontFamily } from '../tokens.mjs';

/**
 * The card shape the Introduction's indexes are built from: a preview tile, a
 * name, and a plain-language line about what the thing is for.
 *
 * Shared by both indexes on purpose. Components fill the tile with a live
 * iframe of the real component; Foundations fill it with an illustration, since
 * those pages have no story to render. Everything around the tile — the size,
 * the border, the type scale, the hover — is decided once here, so the two
 * indexes cannot drift into looking like two different systems.
 */

/** Tile geometry. Components size their iframe against this, so it is exported. */
export const TILE_WIDTH = 252;
export const TILE_HEIGHT = 134;

/**
 * The blurb occupies exactly this many lines, whatever it says. Three fits the
 * large majority of the descriptions at the widths this grid actually renders
 * at, while keeping the card compact enough that a one-line blurb does not sit
 * over a pool of empty space.
 */
const BLURB_LINES = 3;
const BLURB_FONT_SIZE = 13;
const BLURB_LINE_HEIGHT = 1.5;

export function DocsIndexCard({
  href,
  name,
  blurb,
  children,
}: {
  href: string;
  name: string;
  blurb?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_top"
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${colors['mo-grey'][3]}`,
        borderRadius: 10,
        overflow: 'hidden',
        background: colors['mo-grey'][1],
        color: colors['mo-black'],
        textDecoration: 'none',
        fontFamily: fontFamily.body.join(', '),
      }}
    >
      <div
        style={{
          height: TILE_HEIGHT,
          borderBottom: `1px solid ${colors['mo-grey'][3]}`,
          background: colors['mo-white'],
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // Anything wider than the tile crops evenly from the centre rather
          // than losing its right-hand side.
          position: 'relative',
        }}
      >
        {children}
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>
          {name}
        </span>
        {/* Fixed to BLURB_LINES, which is what makes every card the same height.
            Grid items stretch within a row, so a row was already uniform — but
            rows differed from each other, and the index was six different card
            heights ranging 176px to 317px. Reserving the space rather than
            fitting it is the only way a grid of variable text comes out even.

            Longer blurbs clip with an ellipsis rather than pushing the card
            taller. That is a fair trade for an index: the full sentence is on
            the component's own page, which is one click away and where someone
            reading it in detail already is. It is also on the title attribute. */}
        {/* Rendered even when there is no blurb: the reserved space is what
            keeps the card the same height as its neighbours, and two components
            without a description were the only cards left at 176px against
            everything else's 239px. */}
        <span
            title={blurb}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: BLURB_LINES,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              height: BLURB_LINES * BLURB_FONT_SIZE * BLURB_LINE_HEIGHT,
              marginTop: 4,
              fontSize: BLURB_FONT_SIZE,
              fontWeight: 400,
              lineHeight: BLURB_LINE_HEIGHT,
              color: colors['mo-grey'].DEFAULT,
            }}
          >
            {blurb}
          </span>
      </div>
    </a>
  );
}

/** The grid these sit in — exported so no page picks a different one. */
export const DOCS_INDEX_GRID: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, minmax(${TILE_WIDTH}px, 1fr))`,
  gap: 12,
};
