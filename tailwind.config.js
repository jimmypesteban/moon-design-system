/** @type {import('tailwindcss').Config} */
import { colors, fontSize, spacing, borderRadius, boxShadow } from './tokens.mjs';

// Base Mosaic brand tokens only (skills/mosaic-brand/references/design-tokens.md,
// single source of truth in ./tokens.mjs). This is the guaranteed-everywhere
// token set the components are built against — deliberately NOT the
// richer app-specific token layers,
// since those aren't available in every consuming app.
const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './.storybook/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors,
      // fontFamily is deliberately NOT extended here. Tailwind v4's
      // JS-config compat layer (@config in preview.css) only auto-generates
      // `--font-*` CSS variables (and their `font-*` utilities) for
      // fontFamily's 3 built-in keys (sans/serif/mono); custom keys like
      // heading/body are silently dropped — no CSS variable, no utility, no
      // error. Verified directly: `.font-heading { }` (empty) in the
      // generated stylesheet, and `--font-heading` absent from :root while
      // Tailwind's own `--font-sans` was present. A v3-style plugin
      // (addUtilities) doesn't help either — @config compat doesn't run JS
      // config `plugins` at all. Real consuming apps (e.g. apps/lessons)
      // are unaffected — they run their own separate Tailwind build off
      // their own config, which resolves fontFamily correctly — so
      // font-heading/font-body are defined as plain CSS directly in
      // preview.css instead, Storybook-preview-only, sidestepping this gap
      // entirely rather than fighting it further.
      fontSize,
      spacing,
      borderRadius,
      boxShadow,
    },
  },
  plugins: [],
};

export default config;
