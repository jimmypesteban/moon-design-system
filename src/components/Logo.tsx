import React from 'react';

export interface LogoProps {
  /** Path to the full wordmark logo image, from the consuming app's own /public folder */
  src: string;
  /** Path to the circular brand-mark-only image, for the responsive mobile variant */
  markSrc?: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  /** Below the `sm` breakpoint, show just the circular brand mark instead of the full wordmark (requires markSrc) */
  responsiveMark?: boolean;
  /** Size of the mobile mark in px. Defaults to `height` if omitted. */
  markSize?: number;
  alt?: string;
}

/**
 * Logo — the Mosaic wordmark/brand-mark. Takes `src`/`markSrc` as props
 * instead of hardcoding an asset path — asset files live in each
 * consuming app's own `/public` folder (Next.js doesn't share static assets
 * across apps via node_modules), so this component only owns the shared
 * responsive-mark *behavior*, not the asset itself.
 *
 * @example
 * ```tsx
 * <Logo src="/mosaic-logo.svg" markSrc="/mosaic-mark.svg" width={140} height={32} responsiveMark />
 * ```
 */
export function Logo({
  src,
  markSrc,
  width,
  height,
  className,
  priority = false,
  responsiveMark = false,
  markSize,
  alt = 'Mosaic',
}: LogoProps) {
  if (!responsiveMark || !markSrc) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
      />
    );
  }

  return (
    <>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`hidden sm:block ${className ?? ''}`}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
      />
      <img
        src={markSrc}
        alt={alt}
        width={markSize ?? height}
        height={markSize ?? height}
        className={`sm:hidden ${className ?? ''}`}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
      />
    </>
  );
}
