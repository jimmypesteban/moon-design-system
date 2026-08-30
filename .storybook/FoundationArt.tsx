import React from 'react';
import { borderRadius, boxShadow, breakpoints, colors, fontFamily, spacing } from '../tokens.mjs';
import { Calendar, Check, Search, Star } from '../src/icons';
import { DocsIndexCard } from './DocsIndexCard';

/**
 * Tile artwork for the Foundations index.
 *
 * Foundations pages are MDX with no story to render, so unlike the component
 * cards there is nothing live to put in the tile. These are illustrations —
 * which is the one thing in this design system that a person has to maintain,
 * and worth being honest about.
 *
 * What keeps that cost down: each illustration is drawn *from the tokens it
 * depicts*, not from numbers typed in here. The radius tile applies the real
 * radius scale, the shadow tile the real shadows, the spacing tile the real
 * steps, the breakpoint tile the real widths. Change a token and its picture
 * changes with it. Only the composition is hand-made.
 *
 * The shapes follow the brand's own graphic language (see the moon-brand
 * skill, references/layout-and-graphics.md): circles, semicircles, quarter
 * circles, pills and arcs, derived from the Moon face circle. Rounded and
 * organic throughout — no sharp corners, no geometric polygons.
 *
 * Colour follows the brand's pairing rule, so each tile stays inside one
 * approved pair (Yellow↔Orange, Pink↔Purple, Green↔Forest, Blue↔Ocean) rather
 * than mixing across them. Colors is the exception, because showing the palette
 * is the point — it keeps each pair as its own cluster instead of blending them.
 */

const C = (name: string) => (colors as Record<string, { DEFAULT: string }>)[name].DEFAULT;

/** Every tile draws into the same box, centred by the card. */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 252,
        height: 134,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
      }}
    >
      {children}
    </div>
  );
}

/** A circle in one brand colour — the shape everything else is derived from. */
function Circle({ size, color, style }: { size: number; color: string; style?: React.CSSProperties }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: color, flex: 'none', ...style }} />;
}

/** Colors — the palette, one overlapping pair per approved combination. */
function ColorsArt() {
  const pairs: [string, string][] = [
    ['mo-yellow', 'mo-orange'],
    ['mo-pink', 'mo-purple'],
    ['mo-green', 'mo-forest'],
    ['mo-blue', 'mo-ocean'],
  ];
  return (
    <Frame>
      <div style={{ display: 'flex', gap: 12 }}>
        {pairs.map(([a, b]) => (
          <div key={a} style={{ display: 'flex' }}>
            <Circle size={34} color={C(a)} />
            <Circle size={34} color={C(b)} style={{ marginLeft: -12 }} />
          </div>
        ))}
      </div>
    </Frame>
  );
}

/** Typography — the two real families, set in themselves. */
function TypographyArt() {
  return (
    <Frame>
      <span
        style={{
          fontFamily: fontFamily.heading.join(', '),
          fontSize: 56,
          fontWeight: 700,
          color: C('mo-ocean'),
          lineHeight: 1,
        }}
      >
        Aa
      </span>
      <span
        style={{
          fontFamily: fontFamily.body.join(', '),
          fontSize: 30,
          fontWeight: 400,
          color: C('mo-blue'),
          lineHeight: 1,
        }}
      >
        Aa
      </span>
    </Frame>
  );
}

/** Spacing — the real steps as pills, so the ratios are the ratios. */
function SpacingArt() {
  const steps = ['mo-xs', 'mo-sm', 'mo-md', 'mo-lg', 'mo-xl'] as const;
  const px = (k: string) => parseInt((spacing as Record<string, string>)[k], 10);
  const widest = px('mo-xl');
  return (
    <Frame>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        {steps.map((k, i) => (
          <span
            key={k}
            style={{
              // Width is the real value, scaled to fit — the tile shows the
              // actual proportions of the scale rather than a decorative ramp.
              width: (px(k) / widest) * 150,
              height: 10,
              borderRadius: borderRadius['mo-full'],
              background: i % 2 ? C('mo-forest') : C('mo-green'),
            }}
          />
        ))}
      </div>
    </Frame>
  );
}

/**
 * Radius — the real scale, applied.
 *
 * Rectangles rather than squares, and this is the whole reason the tile works:
 * on a 46px square, a 24px radius is half the side, so mo-lg and mo-full both
 * render as circles and three of the four steps look identical. A shape wider
 * than twice its largest radius is the only way the scale is legible at all.
 */
function RadiusArt() {
  const steps = ['mo-sm', 'mo-md', 'mo-lg', 'mo-full'] as const;
  return (
    <Frame>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {steps.map((k, i) => (
          <span
            key={k}
            style={{
              width: 108,
              height: 52,
              borderRadius: borderRadius[k],
              background: i % 2 ? C('mo-orange') : C('mo-yellow'),
            }}
          />
        ))}
      </div>
    </Frame>
  );
}

/** Shadow — the real elevations, stepped so the difference is visible. */
function ShadowArt() {
  const steps = ['mo-sm', 'mo-md', 'mo-xl'] as const;
  return (
    <Frame>
      {steps.map((k, i) => (
        <span
          key={k}
          style={{
            width: 52,
            height: 52 + i * 10,
            borderRadius: borderRadius['mo-sm'],
            background: colors['mo-grey'][1],
            boxShadow: (boxShadow as Record<string, string>)[k],
          }}
        />
      ))}
    </Frame>
  );
}

/**
 * Breakpoints — four screens side by side, at the real widths.
 *
 * The first version nested them concentrically, which is a true picture of the
 * numbers and the wrong picture of the idea: it read as boxes inside boxes
 * rather than as a layout changing at a width. Screens on a shared baseline say
 * "these are different widths" immediately, which is what a breakpoint is.
 *
 * Same height throughout on purpose. A breakpoint is a width threshold and
 * nothing else, so varying the height would add a dimension the tokens do not
 * have.
 */
function BreakpointsArt() {
  const order = ['sm', 'md', 'lg', 'xl'] as const;
  const px = (k: string) => parseInt((breakpoints as Record<string, string>)[k], 10);
  const total = order.reduce((sum, k) => sum + px(k), 0);
  const AVAILABLE = 186;
  return (
    <Frame>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        {order.map((k, i) => {
          const colour = i % 2 ? C('mo-purple') : C('mo-pink');
          return (
            <span
              key={k}
              style={{
                // Width is the token's share of the four, so the steps between
                // the screens are the real steps between the breakpoints.
                width: (px(k) / total) * AVAILABLE,
                height: 62,
                borderRadius: 5,
                border: `2px solid ${colour}`,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span style={{ height: 8, background: colour, opacity: 0.35, flex: 'none' }} />
            </span>
          );
        })}
      </div>
    </Frame>
  );
}

/** Grid — the brand's four columns. */
function GridArt() {
  return (
    <Frame>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          style={{
            width: 26,
            height: 92,
            borderRadius: borderRadius['mo-full'],
            background: i % 2 ? C('mo-ocean') : C('mo-blue'),
          }}
        />
      ))}
    </Frame>
  );
}

/** Page Structure — the page's own regions, as a small diagram. */
function PageStructureArt() {
  const block = (color: string, style: React.CSSProperties) => (
    <span style={{ borderRadius: 6, background: color, ...style }} />
  );
  return (
    <Frame>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 150 }}>
        {block(C('mo-forest'), { height: 16 })}
        <div style={{ display: 'flex', gap: 6, height: 56 }}>
          {block(C('mo-green'), { width: 42 })}
          {block(C('mo-green'), { flex: 1, opacity: 0.55 })}
        </div>
        {block(C('mo-forest'), { height: 12, opacity: 0.6 })}
      </div>
    </Frame>
  );
}

/** Icons — actual icons from the curated set, not drawings of icons. */
function IconsArt() {
  const items = [Search, Star, Calendar, Check];
  return (
    <Frame>
      {items.map((Icon, i) => (
        <span
          key={i}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: i % 2 ? C('mo-purple') : C('mo-pink'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors['mo-white'],
          }}
        >
          <Icon size={22} />
        </span>
      ))}
    </Frame>
  );
}

/**
 * Tokens — a stack of tags, one per kind of token.
 *
 * The tag is the shape a token has everywhere else in this system: a name
 * carrying a value. Four kinds rather than four colours, so the tile says what
 * the page is about — a colour, a spacing step, an elevation and a text size,
 * each drawn with its own real value.
 *
 * Radius is deliberately absent. At tag height a 12px radius is more than half
 * the shape and clamps to a stadium, so the swatch would be indistinguishable
 * from the tag around it — a picture that cannot be honest is worse than one
 * fewer example, and Radius has its own tile a row below.
 */
function TokensArt() {
  const tag: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '3px 11px 3px 5px',
    borderRadius: borderRadius['mo-full'],
    background: (colors['mo-grey'] as Record<string, string>)[2],
    border: `1px solid ${(colors['mo-grey'] as Record<string, string>)[3]}`,
  };
  const swatch: React.CSSProperties = {
    width: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 'none',
  };
  const name: React.CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 11,
    // Stated, not inherited: at the default the four tags totalled 134px in a
    // 133px tile and clipped the first and last.
    lineHeight: 1,
    color: colors['mo-black'] as string,
  };
  const row = (label: string, art: React.ReactNode) => (
    <span key={label} style={tag}>
      <span style={swatch}>{art}</span>
      <span style={name}>{label}</span>
    </span>
  );
  const px = (v: string) => parseInt(v, 10);
  return (
    <Frame>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {row('mo-blue', <span style={{ width: 16, height: 16, borderRadius: '50%', background: C('mo-blue') }} />)}
        {row(
          'mo-md',
          // A bar whose width is the value, the same way the Spacing tile draws
          // its scale. Two thin uprights with the gap between them was the first
          // attempt and read as a broken glyph — "||" — rather than as a measure.
          <span
            style={{
              width: px((spacing as Record<string, string>)['mo-md']),
              height: 9,
              borderRadius: 2,
              background: C('mo-ocean'),
            }}
          />
        )}
        {row(
          'mo-lg',
          <span
            style={{
              width: 18,
              height: 12,
              borderRadius: 3,
              background: (colors['mo-grey'] as Record<string, string>)[1],
              boxShadow: (boxShadow as Record<string, string>)['mo-lg'],
            }}
          />
        )}
        {row(
          'mo-body',
          <span style={{ fontFamily: fontFamily.body.join(', '), fontSize: 14, lineHeight: 1, color: C('mo-ocean') }}>
            Aa
          </span>
        )}
      </div>
    </Frame>
  );
}

/**
 * Shapes — four forms that are genuinely on guidelines page 36.
 *
 * An earlier version of this tile drew an "arch" and a "leaf", neither of which
 * is in the brand's vocabulary; they were invented while writing the page that
 * documents it. These four — circle, semicircle, quarter circle, pill — are the
 * ones that both appear on that page and are expressible as a border-radius.
 */
function ShapesArt() {
  const forms: [string, number, number, string][] = [
    ['50%', 50, 50, 'mo-pink'],
    ['50px 50px 0 0', 50, 26, 'mo-purple'],
    ['46px 0 0 0', 46, 46, 'mo-pink'],
    ['9999px', 58, 26, 'mo-purple'],
  ];
  return (
    <Frame>
      {forms.map(([radius, w, h, colour], i) => (
        <span
          key={i}
          style={{ width: w, height: h, borderRadius: radius, background: C(colour), flex: 'none' }}
        />
      ))}
    </Frame>
  );
}

/**
 * Keyed by the name used in the Introduction's FOUNDATIONS list. A foundation
 * with no entry falls back to no artwork rather than a broken tile, so adding a
 * page never breaks this index — it just arrives without a picture.
 */
export const FOUNDATION_ART: Record<string, () => React.JSX.Element> = {
  Tokens: TokensArt,
  Colors: ColorsArt,
  Typography: TypographyArt,
  Spacing: SpacingArt,
  Radius: RadiusArt,
  Shapes: ShapesArt,
  Shadow: ShadowArt,
  Breakpoints: BreakpointsArt,
  Grid: GridArt,
  'Page Structure': PageStructureArt,
  Icons: IconsArt,
};

/** A Foundations index card: illustration, name, blurb. */
export function FoundationCard({
  name,
  docsId,
  blurb,
}: {
  name: string;
  docsId: string;
  blurb?: string;
}) {
  const Art = FOUNDATION_ART[name];
  return (
    <DocsIndexCard href={`/?path=/docs/${docsId}`} name={name} blurb={blurb}>
      {Art ? <Art /> : null}
    </DocsIndexCard>
  );
}
