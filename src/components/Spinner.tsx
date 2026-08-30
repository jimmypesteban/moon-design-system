import React from 'react';
import { Loader2 } from '../icons';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  /** CSS color — defaults to the current text color so it inherits from a parent (e.g. a colored button) */
  className?: string;
  /** Accessible label for screen readers, since the spinner itself carries no text */
  label?: string;
}

const SIZE_PX: Record<SpinnerSize, number> = {
  sm: 16,
  md: 24,
  lg: 32,
};

/**
 * Spinner — inline loading indicator, for a button's pending state, an
 * in-progress section of a page, or anywhere a `Skeleton` placeholder
 * doesn't fit (a small icon-sized area, not a whole content block). No
 * drawn source exists for this in the design system file — spinners are a
 * generic pattern — built from the existing `Loader2` icon plus Tailwind's
 * stock `animate-spin`, not a custom asset.
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size="sm" className="text-white" label="Saving…" />
 * ```
 */
export function Spinner({ size = 'md', className = '', label = 'Loading' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className="inline-flex">
      <Loader2 size={SIZE_PX[size]} className={['animate-spin', className].filter(Boolean).join(' ')} />
    </span>
  );
}
