import React from 'react';
import type { Preview } from '@storybook/react-vite';
import mosaicTheme from './mosaicTheme';
import { AutoDocsPage } from './AutoDocsPage';
import './preview.css';

// Background swatches for the surfaces components actually ship on —
// picked from the real brand palette (tokens.mjs), not arbitrary colors.
// Useful for catching a component that reads fine on cream but is
// invisible/wrong-contrast on dark (e.g. Logo's white variant, Toast,
// Tag's fill-reverse style).
const MOSAIC_BACKGROUNDS = {
  options: {
    bone: { name: 'Bone (mo-white)', value: '#F5F4F0' },
    white: { name: 'White', value: '#FFFFFF' },
    dark: { name: 'Dark (mo-black)', value: '#313030' },
  },
};

// Viewport presets matching the brand's own breakpoint scale (see
// Foundations → Breakpoints: sm/md/lg/xl = 640/768/1024/1280, confirmed
// against Tailwind's defaults) rather than generic device presets, so
// switching viewports here means the same thing as the app's own
// responsive breakpoints.
const MOSAIC_VIEWPORTS = {
  mobile: {
    name: 'Mobile (sm, 375px)',
    styles: { width: '375px', height: '812px' },
    type: 'mobile' as const,
  },
  tablet: {
    name: 'Tablet (md, 768px)',
    styles: { width: '768px', height: '1024px' },
    type: 'tablet' as const,
  },
  desktop: {
    name: 'Desktop (lg, 1024px)',
    styles: { width: '1024px', height: '800px' },
    type: 'desktop' as const,
  },
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: mosaicTheme,
      page: AutoDocsPage,
    },
    options: {
      storySort: {
        order: [
          'Introduction',
          'Foundations',
          ['Tokens', 'Colors', 'Typography', 'Spacing', 'Radius', 'Shapes', 'Shadow', 'Breakpoints', 'Grid', 'Icons'],
          'Components',
        ],
      },
    },
    viewport: {
      options: MOSAIC_VIEWPORTS,
    },
    backgrounds: MOSAIC_BACKGROUNDS,
    // a11y addon: flag violations in the UI but don't fail CI builds on
    // them yet — this surfaces issues for review rather than blocking
    // every story until the whole library is audited.
    a11y: {
      test: 'todo',
    },
  },
  // `thumb` is set only by the Introduction's component cards, which load each
  // story in a small iframe as its own preview. Storybook has no URL parameter
  // for layout, and the alternative — reaching into the same-origin iframe and
  // injecting a stylesheet — is the kind of trick that outlives the person who
  // understands it. A global is the supported lever, it is visible in the URL,
  // and it costs normal story viewing nothing.
  initialGlobals: { thumb: 'off', thumbWidth: '' },
  decorators: [
    // Every story renders inside the same padded, max-width frame instead of
    // each story file needing its own wrapper <div>. Width is generous (1200px)
    // so existing grid-heavy stories (Icons gallery, "Level — All 50", FAB
    // gallery) aren't clipped — narrow it if you want a tighter frame.
    //
    // In thumbnail mode the frame centres instead. Storybook's default layout
    // is top-left with padding, which is right for reading a story and wrong for
    // a 250px tile: scaled down, the component became a speck in the corner with
    // the rest of the tile empty. Centring is the whole difference between a
    // preview that reads and one that looks broken.
    (Story, context) =>
      context.globals.thumb === 'on'
        ? React.createElement(
            'div',
            {
              // Side padding in percent, not pixels, so it holds whatever
              // width the card gives the frame.
              style: {
                position: 'fixed' as const,
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 19%',
                boxSizing: 'border-box' as const,
              },
            },
            // An inner box that shrink-wraps by default, and takes a definite
            // width when the card asks for one. Components that size themselves
            // to their container need that: ProgressBar's story is a flex row of
            // a `flex-1` bar and a label, so with nothing to fill it the bar
            // collapsed to zero and the tile showed a stray "40%" and no bar.
            // Always present, so the card's measurement finds the content at the
            // same depth either way.
            React.createElement(
              'div',
              {
                style: context.globals.thumbWidth
                  ? { width: Number(context.globals.thumbWidth) }
                  : undefined,
              },
              React.createElement(Story)
            )
          )
        : React.createElement(
            'div',
            { style: { maxWidth: 1200, margin: '0 auto', padding: 24 } },
            React.createElement(Story)
          ),
  ],
};

export default preview;
