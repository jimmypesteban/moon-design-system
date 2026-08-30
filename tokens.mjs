// Single source of truth for Moon UI's base design tokens. Consumed by
// tailwind.config.js (theme extension) and the Storybook Foundations docs
// pages, so the two can never drift apart.
//
// This is deliberately the guaranteed-everywhere base layer only — consuming
// apps may define richer app-specific token layers on top of it, but they
// import this preset rather than copying values out of it.

// Full 10-step ramps per hue. DEFAULT = step 6, the brand's primary hex for
// that hue. The neutral ramp's DEFAULT is the one exception: it sits between
// steps 7 and 8, a mid-grey tuned for secondary text rather than a ramp step.
//
// The ramps share one construction rule: each step holds a fixed perceptual
// lightness (OKLab L), so a given step number carries the same contrast
// behavior in every family — if step 6 passes 4.5:1 against white in one hue,
// it does in all of them or misses by the same amount. Pick steps by role,
// not by eye.
export const colors = {
  'mo-black': '#313030',
  'mo-white': '#F5F4F0',
  // Neutral ramp — "stone": a barely-warm grey, so large canvas areas read
  // as paper rather than as screen-grey. Step 2 doubles as the page canvas
  // and equals mo-white; step 10 equals mo-black.
  'mo-grey': {
    DEFAULT: '#6B6A66',
    1: '#FFFFFF',
    2: '#F5F4F0',
    3: '#DEDCD8',
    4: '#C5C4C0',
    5: '#ACABA7',
    6: '#93928F',
    7: '#7A7977',
    8: '#61605E',
    9: '#484746',
    10: '#313030',
  },
  'mo-red': {
    DEFAULT: '#B82431',
    1: '#F8E7EA',
    2: '#EAB6BE',
    3: '#E0939F',
    4: '#D16473',
    5: '#C84759',
    6: '#B82431',
    7: '#A7212D',
    8: '#831822',
    9: '#66121B',
    10: '#4E0D15',
  },
  'mo-yellow': {
    DEFAULT: '#FDC734',
    1: '#FFF9E7',
    2: '#FFEEB5',
    3: '#FEE592',
    4: '#FED963',
    5: '#FDD24A',
    6: '#FDC734',
    7: '#E6B52E',
    8: '#B48D22',
    9: '#8B6D18',
    10: '#6A5410',
  },
  'mo-orange': {
    DEFAULT: '#F57134',
    1: '#FFF1E7',
    2: '#FDD2B4',
    3: '#FCBD91',
    4: '#FA9F62',
    5: '#F88D49',
    6: '#F57134',
    7: '#DF672F',
    8: '#AE5022',
    9: '#873E18',
    10: '#672F0F',
  },
  'mo-pink': {
    DEFAULT: '#E354A4',
    1: '#FBEDF5',
    2: '#F3C6E2',
    3: '#EEACD5',
    4: '#E887C2',
    5: '#E672B7',
    6: '#E354A4',
    7: '#CF4C95',
    8: '#A13B74',
    9: '#7C2E5A',
    10: '#5F2245',
  },
  'mo-purple': {
    DEFAULT: '#4C1C75',
    1: '#EBE8F2',
    2: '#C0B8D7',
    3: '#A395C4',
    4: '#7C65A7',
    5: '#684895',
    6: '#4C1C75',
    7: '#45196A',
    8: '#351353',
    9: '#280F41',
    10: '#1E0A33',
  },
  'mo-green': {
    DEFAULT: '#54C47A',
    1: '#ECF9F2',
    2: '#C3ECD5',
    3: '#A7E3C1',
    4: '#82D6A5',
    5: '#6ECF94',
    6: '#54C47A',
    7: '#4CB26F',
    8: '#3B8B57',
    9: '#2D6B43',
    10: '#225233',
  },
  'mo-forest': {
    DEFAULT: '#1B4B35',
    1: '#E8EDEA',
    2: '#B5C6BE',
    3: '#91AB9E',
    4: '#608573',
    5: '#426E59',
    6: '#1B4B35',
    7: '#184530',
    8: '#123625',
    9: '#0C291C',
    10: '#082015',
  },
  'mo-blue': {
    DEFAULT: '#528CFF',
    1: '#EBF4FF',
    2: '#C0DCFF',
    3: '#A4CBFF',
    4: '#7EB3FF',
    5: '#6AA4FF',
    6: '#528CFF',
    7: '#487FEC',
    8: '#3764B7',
    9: '#294E8E',
    10: '#1F3B6E',
  },
  'mo-ocean': {
    DEFAULT: '#182E42',
    1: '#E8EAEC',
    2: '#B7BDC4',
    3: '#959DA7',
    4: '#647180',
    5: '#465667',
    6: '#182E42',
    7: '#16293C',
    8: '#11202F',
    9: '#0E1924',
    10: '#0A131B',
  },
};

// Source Serif 4 (headings) and Source Sans 3 (body) — a two-font system,
// both open (SIL OFL) and served from Google Fonts, so nothing here depends
// on a paid license. The CJK fallbacks pair Noto Serif TC with the heading
// stack and Noto Sans TC with body, landing on the device-native Traditional
// Chinese faces before the generic keyword.
//
// Order is load-bearing: the primary Latin font comes FIRST and the CJK
// fallback after it. Noto's Latin glyph coverage is complete, so listing a
// Noto face first would render Latin text in Noto too, and the intended
// production font would never be reached — only CJK glyphs should fall
// through.
//
// Kept as arrays (font stacks) — Typography.mdx calls fontFamily.heading
// .join(', ') to render the stack for docs. tailwind.config.js is
// responsible for joining these into strings before handing them to
// Tailwind's theme.extend.fontFamily — see the comment there for why.
//
// Every multi-word name is double-quoted INSIDE its own string (e.g.
// '"Source Serif 4"', not 'Source Serif 4'). This is load-bearing, not
// cosmetic: CSS custom-idents can't contain a bare number token, so an
// UNQUOTED "Source Serif 4"/"Source Sans 3" is invalid CSS — and for a
// multi-value property like font-family, one invalid token invalidates the
// WHOLE declaration, which the browser then silently drops entirely (no
// console warning, nothing — computed style just falls back to whatever
// cascades from elsewhere). The Noto/PingFang/Songti/JhengHei names have
// no trailing digit so they happen to work unquoted, which is what makes
// this failure so hard to trace — only digit-suffixed fonts ever break.
export const fontFamily = {
  heading: ['"Source Serif 4"', '"Noto Serif TC"', '"PingFang TC"', '"Songti TC"', 'Georgia', 'serif'],
  body: ['"Source Sans 3"', '"Noto Sans TC"', '"PingFang TC"', '"Microsoft JhengHei"', 'system-ui', 'sans-serif'],
};

// Sizes + line-heights.
//
// Semantic names are the interface; every value is a Tailwind step underneath, so
// `text-mo-body` and `text-base` render identically and the two vocabularies can
// never drift. Pick a name by ROLE, not by size — that is the whole point of this
// layer, and it is why several names deliberately share a size.
//
// mo-h6 (24/32) and mo-h7 (20/28) are the anchors of the heading scale; h1–h5
// fill Tailwind's exactly five steps above 24 (30/36/48/60/72). Line-heights
// are Tailwind's, which are all multiples of 4px, keeping every pairing on
// the 4px grid.
export const fontSize = {
  'mo-h1': ['4.5rem', { lineHeight: '1' }], // 72px/72px = text-7xl
  'mo-h2': ['3.75rem', { lineHeight: '1' }], // 60px/60px = text-6xl
  'mo-h3': ['3rem', { lineHeight: '1' }], // 48px/48px = text-5xl
  'mo-h4': ['2.25rem', { lineHeight: '2.5rem' }], // 36px/40px = text-4xl
  'mo-h5': ['1.875rem', { lineHeight: '2.25rem' }], // 30px/36px = text-3xl
  'mo-h6': ['1.5rem', { lineHeight: '2rem' }], // 24px/32px = text-2xl
  'mo-h7': ['1.25rem', { lineHeight: '1.75rem' }], // 20px/28px = text-xl
  'mo-body-lg': ['1.125rem', { lineHeight: '1.75rem' }], // 18px/28px = text-lg
  'mo-body': ['1rem', { lineHeight: '1.5rem' }], // 16px/24px = text-base
  'mo-body-sm': ['0.875rem', { lineHeight: '1.25rem' }], // 14px/20px = text-sm
  'mo-subhead': ['0.875rem', { lineHeight: '1.25rem' }], // 14px/20px = text-sm
  'mo-cta': ['0.875rem', { lineHeight: '1.25rem' }], // 14px/20px = text-sm
  'mo-annotation': ['0.75rem', { lineHeight: '1rem' }], // 12px/16px = text-xs
};

// Moon UI uses Tailwind's default breakpoint scale as-is. Kept here anyway
// as a documented constant so JS code (e.g. a matchMedia hook) and the
// Foundations docs page share one value instead of hardcoding pixel numbers
// independently.
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Container max-widths + side margins. At a 1440px viewport the container is
// 1280px wide (80px margin each side); at 1600px it's 1440px (still 80px).
// Tablet (768px) and mobile (375px) go full-bleed — no container margin,
// just inner padding. sm/md/lg interpolate between those endpoints.
export const container = {
  margin: {
    DEFAULT: '16px', // mobile inner padding
    sm: '24px',
    md: '32px',
    lg: '48px',
    xl: '80px',
    '2xl': '80px',
  },
  maxWidth: {
    xl: '1280px',
    '2xl': '1440px',
  },
};

// Spacing scale — the layout grid is 4/8/12/16/20/24/32/40/48/64/80/96/128/
// 160/192/224/256px, which is exactly Tailwind's own default numeric spacing
// scale (each step is n * 4px), so prefer Tailwind's plain numeric utilities
// (p-4, gap-6, m-12) for general spacing. The mo-* tokens below are named
// checkpoints on that same grid, not a separate scale. `mo-margin` is the
// brand's minimum outer page margin — a much larger value than the rest, for
// page gutters, not component-internal spacing.
export const spacing = {
  'mo-xs': '4px',
  'mo-sm': '8px',
  'mo-md': '16px',
  'mo-lg': '24px',
  'mo-xl': '48px',
  'mo-margin': '100px',
};

// Border radius scale. This is the actual source of the admin/consumer shape
// convention used throughout the components: admin surfaces use `mo-sm`
// (compact rounded-rect), consumer surfaces use `mo-md` (softer) or
// `mo-full` (pill). `mo-sm` is 12px so every admin Button/Input/Select/
// Textarea/SearchInput corner matches in one lever — the single shared
// radius those components all reach for.
export const borderRadius = {
  'mo-sm': '12px',
  'mo-md': '16px',
  'mo-lg': '24px',
  'mo-full': '9999px',
};

// Shadow scale. Base color is a neutral #101828 at varying opacity (hex8),
// not mo-black — shadows read as neutral depth cues rather than brand color.
export const boxShadow = {
  'mo-xs': '0 1px 2px 0 #1018280D',
  'mo-sm': '0 1px 2px 0 #1018280F, 0 1px 3px 0 #1018281A',
  'mo-md': '0 2px 4px -2px #1018280F, 0 4px 8px -2px #1018281A',
  'mo-lg': '0 4px 6px -2px #10182808, 0 12px 16px -4px #10182814',
  'mo-xl': '0 8px 8px -4px #10182808, 0 20px 24px -4px #10182814',
  'mo-2xl': '0 24px 48px -12px #1018282E',
  'mo-3xl': '0 32px 64px -12px #10182824',
  // Component-specific shadows.
  'mo-button': '0 4px 8px 0 #0000001A',
  'mo-popup': '0 9px 28px 8px #0000000D, 0 6px 16px 0 #00000014, 0 3px 6px -4px #0000001F',
};
