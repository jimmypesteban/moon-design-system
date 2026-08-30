import { colors, fontSize, spacing, borderRadius, boxShadow, breakpoints } from './tokens.mjs';

/**
 * The Moon brand layer as a Tailwind preset.
 *
 * Exists because every consuming app used to hand-copy a subset of
 * `tokens.mjs` into its own config, and a subset silently drifts. lessons
 * copied the base colours and the light/dark companions but none of the
 * numeric ramps, so 47 of the 49 `mo-*` colour classes the system's own
 * components use resolved to nothing there — `soft` buttons rendered with no
 * fill, and `primary`/`danger` had no hover or active state, on shipped pages.
 * A preset cannot be partially copied.
 *
 * Everything lands under `theme.extend`, so Tailwind's stock scales survive and
 * an app can still override any of it in its own `theme`.
 *
 * `fontFamily` is deliberately absent. Tailwind v4's JS-config compat layer
 * only generates `--font-*` variables for the three built-in keys
 * (sans/serif/mono) and silently drops custom ones like heading/body — no
 * variable, no utility, no error. The package's own config documents this at
 * length; a preset would spread the same trap to every app, so font stacks stay
 * app-local until v4 compat handles them.
 *
 * @example
 * import brandPreset from 'moon-design-system/tailwind-preset';
 * export default { presets: [brandPreset], content: [...], theme: { extend: {} } };
 */
const preset = {
  theme: {
    extend: {
      colors,
      fontSize,
      spacing,
      borderRadius,
      boxShadow,
      screens: breakpoints,
    },
  },
};

export default preset;
