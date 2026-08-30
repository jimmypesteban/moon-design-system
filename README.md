# Mosaic Design System

A production-grade design system for an edtech platform — tokens, a Tailwind
preset, 40+ React components, and a fully documented Storybook with its own
accessibility and layout test harness.

**Live Storybook:** [jimmypesteban.github.io/mosaic-design-system](https://jimmypesteban.github.io/mosaic-design-system/) —
every foundation and component below, running in the browser. Deployed from
`main` on every push by [GitHub Actions](.github/workflows/deploy-pages.yml).

**Provenance:** I designed and built this system as the design-system owner at
an edtech company (work shown under NDA in my portfolio). This repository is a
genericized release of that work: the architecture, components, documentation
system, and test tooling are the real thing, while the brand identity —
palette values, logo and shape artwork, product iconography, fonts story, and
company-specific docs pages — has been replaced with an original "Mosaic"
identity created for this repo. The replacement palette preserves the
original's per-step perceptual lightness, so every documented contrast
relationship still holds.

## What's inside

- **`tokens.mjs`** — the single source of truth: 11 color families as 10-step
  ramps on one shared lightness ladder, a semantic type scale, spacing,
  radius, shadows, breakpoints, and container rules. Storybook's Foundations
  pages render *from* this file, so docs and code cannot drift apart.
- **`tailwind-preset.mjs` / `.cjs`** — the brand layer as a Tailwind preset;
  consuming apps extend it rather than copying values.
- **`src/components/`** — Button, Card, Modal, Tabs, TopNav, AppLayout,
  Avatar (with tiered level frames), AudioPlayer, CommandPalette, DatePicker,
  FileDropzone, and ~30 more, each with stories.
- **`src/foundations/`** — living docs: Colors (with a WCAG contrast
  checker), Typography, Spacing, Radius, Shapes, Shadow, Breakpoints, Grid,
  Icons (searchable gallery), Page Structure.
- **`scripts/width-sweep.mjs`** — renders every story at 375/768/1024 and
  fails on horizontal overflow, text overlapping text, overlays escaping the
  viewport, and anything painting over an `aria-modal` backdrop. It also
  measures contrast and hit-target size from the rendered page against a
  recorded baseline (`width-sweep-baseline.json`) — known findings are
  tolerated, anything new fails, and shrinking the baseline is the
  accessibility roadmap.
- **`scripts/docs-sweep.mjs`** — fails the docs build on dead links, broken
  markup, and console errors.

## Running it

```bash
npm install
npm run storybook        # dev server on :6006
npm run build-storybook  # static site in storybook-static/
npm run test:docs        # docs sweep (build first)
npm run test:width-sweep # needs: npx playwright install chromium
```

## Design decisions worth stealing

- **Semantic names over sizes.** `text-mo-body-sm`, `text-mo-subhead`, and
  `text-mo-cta` all render 14px on purpose — the name records the *role*, so
  a later size change touches one token, not every call site.
- **Every value is a Tailwind step underneath.** `text-mo-body` and
  `text-base` render identically, so the brand vocabulary and the stock
  vocabulary can never disagree.
- **Docs that cannot lie.** Foundations pages import `tokens.mjs`; the docs
  footer's change log derives from `git log`; the icon gallery renders the
  actual exported set. Hand-typed lists drift — generated ones don't.
- **A check that has never been red is not evidence.** Every sweep in
  `scripts/` was validated against a known-bad input before being trusted.
