/// <reference path="./vite-env.d.ts" />
// The reference above isn't for this file's own imports — it's so that any
// consuming app's tsconfig (which won't otherwise include this ambient
// declaration file) still resolves the *.png/*.svg/*.svg?raw imports in
// logos.ts and customIcons.ts once it transitively type-checks them via
// this barrel.

export * from './components';
export * from './utils';
export * from './icons';
export * from './logos';
export * from './fabIcons';
export * from './levelFrames';
export type { CustomIconName } from './customIcons';
export { CUSTOM_ICON_NAMES } from './customIcons';
// Promoted from internal/ for apps building their own floating panel rather
// than using Popover/DatePicker/TimePicker directly — same viewport-clamped
// positioning and dismiss handling, without recreating either.
export { useFloatingPosition, useDismissFloating } from './internal/useFloatingPosition';
export type { FloatingAlign, FloatingPosition } from './internal/useFloatingPosition';
