'use client';

import React, { forwardRef, useId } from 'react';

export type RadioSize = 'sm' | 'md';

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Visible label rendered next to the radio */
  label?: React.ReactNode;
  size?: RadioSize;
  containerClassName?: string;
}

const CIRCLE_SIZE_CLASSES: Record<RadioSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
};

const DOT_SIZE_CLASSES: Record<RadioSize, string> = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
};

/**
 * Radio — single custom-styled radio input with label. For a set of mutually
 * exclusive options, use `RadioGroup` instead.
 *
 * @example
 * ```tsx
 * <Radio name="cohort" value="school" label="School" />
 * ```
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, size = 'md', containerClassName = '', className = '', id, disabled, ...inputProps },
  ref
) {
  const generatedId = useId();
  const radioId = id ?? generatedId;

  return (
    <label
      htmlFor={radioId}
      className={[
        'flex items-center gap-2 font-body',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        containerClassName,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="relative inline-flex shrink-0">
        <input
          ref={ref}
          id={radioId}
          type="radio"
          disabled={disabled}
          className={['peer sr-only', className].filter(Boolean).join(' ')}
          {...inputProps}
        />
        <span
          className={[
            'flex items-center justify-center rounded-full border border-mo-black/30 bg-mo-grey-1 transition-colors',
            CIRCLE_SIZE_CLASSES[size],
            'peer-checked:border-mo-blue peer-checked:[&>span]:opacity-100',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-mo-blue/30',
          ].join(' ')}
        >
          <span className={`rounded-full bg-mo-blue opacity-0 transition-opacity ${DOT_SIZE_CLASSES[size]}`} />
        </span>
      </span>
      {label && <span className="text-sm text-mo-black">{label}</span>}
    </label>
  );
});
