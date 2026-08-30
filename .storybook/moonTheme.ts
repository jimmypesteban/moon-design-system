import { create } from 'storybook/theming';
// Storybook's sidebar header renders brandImage OR brandTitle, never both —
// so the logomark + "Moon Design" wordmark are combined into one SVG here
// rather than the plain brand-mark asset from ../assets/moon-mark.svg.
import brandLogo from './brand-logo.svg';

export default create({
  base: 'light',
  brandTitle: 'Moon Design',
  brandImage: brandLogo,
  // Back to the Introduction, not out to moon.com. The mark is the only
  // thing in the sidebar that looks like a way home, and sending someone to
  // the marketing site loses the design system entirely — a browser Back away,
  // but a browser Back is not what a logo in a top-left corner promises.
  brandUrl: './?path=/docs/introduction--docs',
  brandTarget: '_self',

  colorPrimary: '#B82431',
  colorSecondary: '#B82431',

  appBg: '#F5F4F0',
  appContentBg: '#FFFFFF',
  appBorderColor: 'rgba(50, 47, 44, 0.12)',
  // The brand radius scale is 12/16/24 (tokens.mjs borderRadius); 8 was a
  // Storybook default left in place, so the chrome rounded its corners to a
  // value the design system does not have.
  appBorderRadius: 12,

  fontBase: '"Source Sans 3", system-ui, sans-serif',

  textColor: '#313030',
  textInverseColor: '#F5F4F0',

  barTextColor: '#6B6A66',
  barSelectedColor: '#B82431',
  barBg: '#FFFFFF',

  inputBg: '#FFFFFF',
  inputBorder: 'rgba(50, 47, 44, 0.2)',
  inputTextColor: '#313030',
  inputBorderRadius: 12,
});
