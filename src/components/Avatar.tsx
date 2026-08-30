import React from 'react';
import { User } from '../icons';
import { levelFrameTier1, levelFrameTier2, levelFrameTier3, levelFrameTier4, levelFrameTier5 } from '../levelFrames';

export type AvatarShape = 'circle' | 'square';
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  /** Image URL — takes priority over `initials`, which takes priority over the fallback icon */
  src?: string;
  alt?: string;
  /** Shown when no `src` is given, e.g. "SN" */
  initials?: string;
  shape?: AvatarShape;
  size?: AvatarSize;
  /** Shows a small dot in the corner indicating online/offline status. Ignored when `level` is set. */
  online?: boolean;
  /**
   * 1-50 — wraps the avatar in the brand's tiered level frame (bronze/purple/
   * gold/teal/pink+wings across levels 1-50) with a level-number ribbon,
   * instead of the plain circle/square. `shape` and `online` are ignored in
   * this mode, since the frame dictates the outer shape.
   */
  level?: number;
  className?: string;
}

const SHAPE_CLASSES: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-mo-sm',
};

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'size-6 text-mo-annotation',
  sm: 'size-8 text-sm',
  md: 'size-10 text-mo-body',
  lg: 'size-12 text-mo-body-lg',
  xl: 'size-16 text-mo-h6',
};

const ICON_SIZE: Record<AvatarSize, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

const INDICATOR_SIZE: Record<AvatarSize, string> = {
  xs: 'size-1.5',
  sm: 'size-2',
  md: 'size-2.5',
  lg: 'size-3',
  xl: 'size-3.5',
};

// Level-frame mode: sizing, tier artwork, and ribbon color are unrelated to
// the plain circle/square styling above.
const FRAME_SIZE_PX: Record<AvatarSize, number> = {
  xs: 56,
  sm: 64,
  md: 80,
  lg: 96,
  xl: 128,
};

const TIER_FRAMES: ImageSource[] = [levelFrameTier1, levelFrameTier2, levelFrameTier3, levelFrameTier4, levelFrameTier5];

// Approximate per-tier accent colors for the level ribbon — the frame
// artwork has no ribbon/banner layer (see levelFrames.ts), so these are
// picked to match each tier frame's dominant hue. Darkened
// just enough from the original picks to clear WCAG AA contrast (4.5:1)
// against the ribbon's white text — caught by Storybook's a11y addon.
const TIER_RIBBON_COLOR = ['#A56438', '#5B3A8E', '#A46922', '#2F7A8C', '#C84475'];

// Frame image aspect ratio (height / width), from the frame artwork.
const FRAME_ASPECT_RATIO = 305 / 400;

function tierForLevel(level: number) {
  return Math.min(5, Math.max(1, Math.ceil(level / 10)));
}

// Bundler-agnostic image import: Vite/Storybook resolve image imports to a
// plain string (per vite-env.d.ts), but Next.js's own ambient image types
// resolve the same import to a `StaticImageData` object (`{ src, width,
// height }`) once this file is type-checked as part of a Next.js app's
// build — whichever wins depends on the consuming program, not this file.
// Normalizing here (rather than requiring every consumer to know to reach
// into `.src`) keeps `<img src>` usage working under both.
type ImageSource = string | { src: string };
function resolveImageSrc(image: ImageSource): string {
  return typeof image === 'string' ? image : image.src;
}

/**
 * Avatar — user profile image, initials, or fallback icon, in a circle or
 * square shape across the brand's size scale. Pass `level` (1-50) to wrap it
 * in the brand's tiered level frame instead (see the `level` prop doc).
 * The frame artwork in `levelFrames.ts` (tier1–5) has a transparent center,
 * so the real avatar shows through this file's own clip-path geometry
 * below. The artwork has no ribbon/banner layer, so the ribbon is built in
 * CSS.
 *
 * @example
 * ```tsx
 * <Avatar src={user.photoUrl} alt={user.name} />
 * <Avatar initials="SN" shape="square" online />
 * <Avatar level={49} src={user.photoUrl} alt={user.name} />
 * ```
 */
export function Avatar({
  src,
  alt = '',
  initials,
  shape = 'circle',
  size = 'md',
  online,
  level,
  className = '',
}: AvatarProps) {
  if (level !== undefined) {
    const clampedLevel = Math.min(50, Math.max(1, Math.round(level)));
    const tier = tierForLevel(clampedLevel);
    const frameSrc = TIER_FRAMES[tier - 1];
    const ribbonColor = TIER_RIBBON_COLOR[tier - 1];
    const width = FRAME_SIZE_PX[size];
    const height = Math.round(width * FRAME_ASPECT_RATIO);

    return (
      <div className={['inline-flex flex-col items-center font-body', className].filter(Boolean).join(' ')} style={{ width }}>
        <div className="relative" style={{ width, height }}>
          {(src || initials) && (
            <div
              className="absolute flex items-center justify-center overflow-hidden bg-mo-yellow font-bold text-mo-black"
              style={{
                // Matches the frame artwork's real inner-shield pixel bounds
                // (measured directly off the source PNGs: x 137-262, y 82-218
                // of the 400x305 canvas, identical across all 5 tiers), with a
                // ~1pp inward margin. The previous values (21.12%/20%/21.65%)
                // extended well past the shield into the border-ring area —
                // harmless while that area was still opaque, but once the
                // frame's own outer-silhouette antialiasing (a pre-existing
                // soft edge in the source art, ~90px in) was exposed against
                // this div's fill color, it showed as a visible color fringe.
                top: '28%',
                left: '35.5%',
                right: '35.5%',
                bottom: '29.5%',
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 73%, 50% 100%, 0% 73%)',
              }}
            >
              {src ? (
                <img src={src} alt={alt} className="size-full object-cover" />
              ) : (
                // The shield's visible area is a rectangle-plus-point, not a
                // rectangle — flex-centering text against the full bounding
                // box (which includes the pointed bottom 27%) reads as too
                // low against the shield's actual visual weight. Nudge up
                // rather than re-centering against the box. (A photo doesn't
                // need this — object-cover already fills the whole shield.)
                <span style={{ fontSize: width * 0.18, paddingBottom: width * 0.1 }}>{initials}</span>
              )}
            </div>
          )}
          <img src={resolveImageSrc(frameSrc)} alt="" className="relative z-10 pointer-events-none size-full object-contain" />
        </div>
        <span
          className="relative z-20 -mt-2 whitespace-nowrap rounded-full px-3 py-0.5 text-mo-annotation font-bold text-white"
          style={{ background: ribbonColor }}
        >
          LVL {clampedLevel}
        </span>
      </div>
    );
  }

  return (
    <span className={['relative inline-flex shrink-0', SIZE_CLASSES[size], className].filter(Boolean).join(' ')}>
      <span
        className={[
          'flex size-full items-center justify-center overflow-hidden bg-mo-yellow font-body font-bold text-mo-black',
          SHAPE_CLASSES[shape],
        ].join(' ')}
      >
        {src ? (
          <img src={src} alt={alt} className="size-full object-cover" />
        ) : initials ? (
          <span>{initials}</span>
        ) : (
          <User size={ICON_SIZE[size]} />
        )}
      </span>
      {online !== undefined && (
        <span
          aria-hidden="true"
          className={[
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white',
            INDICATOR_SIZE[size],
            online ? 'bg-mo-green' : 'bg-mo-grey-5',
          ].join(' ')}
        />
      )}
    </span>
  );
}
