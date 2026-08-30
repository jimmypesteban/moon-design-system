import { fileURLToPath } from 'node:url';
import { lastUpdatedPlugin } from './lastUpdatedPlugin';

import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  // Serves ../assets as-is at a stable, unhashed /brand-assets/* URL (in both
  // dev and the built static site), unlike Vite's normal content-hashed
  // asset pipeline used for imports in stories/mdx. This is what lets the
  // manager-head.html help-chat widget (a plain script outside the Vite
  // module graph) link straight to a real logo/mark file for direct
  // download, instead of only linking to the Logo page. Points at the same
  // assets/ folder logos.ts already imports from, so there's no separate
  // copy to keep in sync.
  staticDirs: [
    { from: '../assets', to: '/brand-assets' },
    // TopNav.tsx hardcodes `/moon-logo-black.svg` as a root-relative
    // public-path asset each consuming app is expected to supply from its
    // own /public folder — real, deliberate, not something to change here.
    // But that meant its own Storybook demo showed a broken-image icon,
    // which is exactly the kind of thing that reads as "this is broken"
    // to a non-technical visitor. `.storybook/public/` holds a copy of the
    // wordmark SVG so the demo shows the actual logo instead.
    { from: '../.storybook/public', to: '/' },
  ],
  core: {
    disableWhatsNewNotifications: true,
  },
  features: {
    sidebarOnboardingChecklist: false,
    menuOnboardingChecklist: false,
  },
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(viteConfig) {
    viteConfig.plugins = viteConfig.plugins ?? [];
    // Exposes the package's last commit as `virtual:mo-last-updated`, so the
    // docs footer never carries a date somebody has to remember to edit.
    viteConfig.plugins.push(
        react(),
        tailwindcss(),
        lastUpdatedPlugin(fileURLToPath(new URL('..', import.meta.url)))
      );
    return viteConfig;
  },
};

export default config;
