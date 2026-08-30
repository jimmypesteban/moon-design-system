import React from 'react';

export type ProgressBarSize = 'md' | 'lg';
export type ProgressBarLabelPosition = 'none' | 'right' | 'floating';

export interface ProgressBarProps {
  /** 0-100 */
  value: number;
  size?: ProgressBarSize;
  labelPosition?: ProgressBarLabelPosition;
  className?: string;
}

const TRACK_SIZE_CLASSES: Record<ProgressBarSize, string> = {
  md: 'h-2',
  lg: 'h-3',
};

/**
 * ProgressBar — single-segment linear progress indicator, used across
 * the admin and consumer apps (e.g. curriculum completion, upload
 * progress). Multi-section progress (several colored segments in one
 * track) exists in the source design system but isn't built here yet —
 * add it if a component actually needs it.
 *
 * @example
 * ```tsx
 * <ProgressBar value={62} labelPosition="right" />
 * ```
 */
export function ProgressBar({ value, size = 'md', labelPosition = 'none', className = '' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={['flex items-center gap-3 font-body', className].filter(Boolean).join(' ')}>
      <div className="relative flex-1">
        <div className={`w-full overflow-hidden rounded-mo-full bg-mo-grey-3 ${TRACK_SIZE_CLASSES[size]}`}>
          <div
            className="h-full rounded-mo-full bg-mo-blue transition-all"
            style={{ width: `${clamped}%` }}
            role="progressbar"
            aria-valuenow={clamped}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        {labelPosition === 'floating' && (
          <span
            className="absolute -top-6 -translate-x-1/2 text-mo-annotation text-mo-black/60"
            style={{ left: `${clamped}%` }}
          >
            {clamped}%
          </span>
        )}
      </div>
      {labelPosition === 'right' && <span className="text-sm text-mo-black/60 shrink-0">{clamped}%</span>}
    </div>
  );
}
