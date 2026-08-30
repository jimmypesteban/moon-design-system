import React from 'react';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';
export type SkeletonAnimation = 'pulse' | 'shimmer' | 'wave';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  /**
   * How the placeholder moves while it waits.
   * - `pulse` (default): opacity fade via Tailwind's stock `animate-pulse` —
   *   exactly the behaviour this component has always had.
   * - `shimmer`: a left-to-right gradient sweep, the pattern most large
   *   products use because it reads as *progress* rather than *blinking*.
   * - `wave`: shimmer, but multi-line text staggers each line by 120ms so the
   *   sweep travels down the block. On a single shape it is just shimmer.
   */
  animation?: SkeletonAnimation;
  /** CSS width, e.g. "100%" or 120. Defaults to "100%" for text/rectangular, matches height for circular. */
  width?: number | string;
  /** CSS height, e.g. 16 for a text line, 40 for an avatar circle. */
  height?: number | string;
  /** Number of lines to render — only meaningful for variant="text" */
  lines?: number;
  className?: string;
}

const VARIANT_CLASSES: Record<SkeletonVariant, string> = {
  text: 'rounded-mo-sm',
  circular: 'rounded-full',
  rectangular: 'rounded-mo-md',
};

const DEFAULT_HEIGHT: Record<SkeletonVariant, number | string> = {
  text: 14,
  circular: 40,
  rectangular: 120,
};

/**
 * The shimmer's keyframes and class, delivered as a React 19 hoisted
 * stylesheet (`<style href precedence>`): React dedupes it by `href`, so a
 * page of fifty skeletons injects it once.
 *
 * Deliberately NOT shipped through the Tailwind preset. Custom keyframes
 * would ride the same v4 JS-config compat layer that silently drops custom
 * `fontFamily` keys (see the preset's own comment and
 * `docs/design-system-handoff.md` trap 4) — an animation that quietly
 * compiles to nothing in some app is this component failing at its one job.
 * A hoisted style needs no build config at all, so it cannot be partially
 * adopted by a consumer.
 *
 * Colours read the Tailwind-emitted theme variables with the same hex as a
 * literal fallback, so the sweep renders identically whether or not the
 * consuming app's build emits `--color-mo-*`.
 */
const SHIMMER_CSS = `
@keyframes mo-skel-shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
.mo-skel-shimmer {
  background-color: var(--color-mo-grey-3, #DEDCD8);
  background-image: linear-gradient(
    90deg,
    var(--color-mo-grey-3, #DEDCD8) 25%,
    var(--color-mo-grey-2, #F5F4F0) 50%,
    var(--color-mo-grey-3, #DEDCD8) 75%
  );
  background-size: 200% 100%;
  /* backwards: a wave-delayed line shows the animation's first frame (solid
     base at the gradient's edge) while it waits, not a frozen mid-sweep. */
  animation: mo-skel-shimmer 1.8s ease-in-out infinite backwards;
}
@media (prefers-reduced-motion: reduce) {
  .mo-skel-shimmer { animation: none; background-image: none; }
}
`;

function ShimmerStyle() {
  return (
    <style href="mo-skeleton-shimmer" precedence="medium">
      {SHIMMER_CSS}
    </style>
  );
}

/**
 * Skeleton — placeholder shape shown while real content loads (a row of
 * text, an avatar circle, a card/image block). No drawn source exists for
 * this in the design system file — skeleton loaders are a generic,
 * content-agnostic pattern — so this is built directly from the existing
 * brand tokens (`mo-grey-3` fill, `mo-sm`/`mo-md`/`full` radius) rather than
 * sourced from a specific layer.
 *
 * Three animations: `pulse` (stock `animate-pulse`, the default), `shimmer`
 * and `wave` — see `SkeletonProps.animation`. Only the looping subset of the
 * skeleton-pattern family is API here on purpose: entrance choreographies
 * (staggered reveals, spring-ins, typewriter fills) are one-shot effects that
 * cannot hold an indefinite loading state, so they live in the Storybook
 * effect gallery as reference, not as props.
 *
 * @example
 * ```tsx
 * <Skeleton variant="circular" width={40} height={40} />
 * <Skeleton variant="text" lines={3} animation="wave" />
 * <Skeleton variant="rectangular" height={160} animation="shimmer" />
 * ```
 */
export function Skeleton({
  variant = 'text',
  animation = 'pulse',
  width,
  height,
  lines = 1,
  className = '',
}: SkeletonProps) {
  const resolvedHeight = height ?? DEFAULT_HEIGHT[variant];
  const resolvedWidth = width ?? (variant === 'circular' ? resolvedHeight : '100%');
  const shimmering = animation === 'shimmer' || animation === 'wave';
  const fillClasses = shimmering ? 'mo-skel-shimmer' : 'animate-pulse bg-mo-grey-3';

  if (variant === 'text' && lines > 1) {
    return (
      <div
        role="status"
        aria-label="Loading"
        className={['flex flex-col gap-2', className].filter(Boolean).join(' ')}
      >
        {shimmering && <ShimmerStyle />}
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`${fillClasses} rounded-mo-sm`}
            style={{
              width: i === lines - 1 ? '70%' : resolvedWidth,
              height: resolvedHeight,
              ...(animation === 'wave' ? { animationDelay: `${i * 120}ms` } : undefined),
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      {shimmering && <ShimmerStyle />}
      <div
        role="status"
        aria-label="Loading"
        className={[fillClasses, VARIANT_CLASSES[variant], className].filter(Boolean).join(' ')}
        style={{ width: resolvedWidth, height: resolvedHeight }}
      />
    </>
  );
}
