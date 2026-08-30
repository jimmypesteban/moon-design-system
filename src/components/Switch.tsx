'use client';

import React, { forwardRef, useId } from 'react';

export type SwitchSize = 'sm' | 'md' | 'lg';

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Visible label rendered next to the switch */
  label?: React.ReactNode;
  /** Helper text rendered below the label (e.g. "Save my login details for next time") */
  description?: string;
  size?: SwitchSize;
  containerClassName?: string;
}

// Track/thumb dimensions and thumb travel distance, precomputed so the
// travel distance lands exactly on Tailwind's 4px-grid translate utilities
// (track - thumb - 2*padding == a clean step).
const TRACK_CLASSES: Record<SwitchSize, string> = {
  sm: 'h-4 w-8',
  md: 'h-5 w-10',
  lg: 'h-6 w-12',
};

const THUMB_CLASSES: Record<SwitchSize, string> = {
  sm: 'h-3 w-3 peer-checked:translate-x-4',
  md: 'h-4 w-4 peer-checked:translate-x-5',
  lg: 'h-5 w-5 peer-checked:translate-x-6',
};

/**
 * Switch — on/off toggle control, used across the admin and consumer apps
 * for settings-style boolean options.
 *
 * @example
 * ```tsx
 * <Switch label="Remember me" description="Save my login details for next time" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
 * ```
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, description, size = 'md', containerClassName = '', className = '', id, disabled, ...inputProps },
  ref
) {
  const generatedId = useId();
  const switchId = id ?? generatedId;

  return (
    <label
      htmlFor={switchId}
      className={[
        'flex items-start gap-2 font-body',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        containerClassName,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          ref={ref}
          id={switchId}
          type="checkbox"
          role="switch"
          disabled={disabled}
          className={['peer sr-only', className].filter(Boolean).join(' ')}
          {...inputProps}
        />
        <span
          className={[
            'flex items-center rounded-full bg-mo-grey-4 p-0.5 transition-colors',
            'peer-checked:bg-mo-blue peer-focus-visible:ring-2 peer-focus-visible:ring-mo-blue/30',
            TRACK_CLASSES[size],
          ].join(' ')}
        >
          <span className={`rounded-full bg-mo-white transition-transform ${THUMB_CLASSES[size]}`} />
        </span>
      </span>
      {(label || description) && (
        <span className="flex flex-col">
          {label && <span className="text-sm text-mo-black">{label}</span>}
          {description && <span className="text-sm text-mo-black/60">{description}</span>}
        </span>
      )}
    </label>
  );
});
