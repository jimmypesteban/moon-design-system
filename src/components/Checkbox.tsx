'use client';

import React, { forwardRef, useEffect, useId, useRef } from 'react';
import { Check, Minus } from '../icons';

export type CheckboxSize = 'sm' | 'md';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Visible label rendered next to the checkbox */
  label?: React.ReactNode;
  /** Helper text rendered below the checkbox (hidden when `error` is set) */
  helperText?: string;
  /** Error message — when set, the checkbox renders in an error state and this replaces `helperText` */
  error?: string;
  /** Renders a dash instead of a checkmark — for "some but not all" selection states */
  indeterminate?: boolean;
  size?: CheckboxSize;
  containerClassName?: string;
}

const BOX_SIZE_CLASSES: Record<CheckboxSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
};

const ICON_SIZE: Record<CheckboxSize, number> = {
  sm: 12,
  md: 14,
};

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref && typeof ref === 'object') (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

/**
 * Checkbox — custom-styled checkbox with label, indeterminate state, and
 * error/helper text, used across the admin and consumer apps.
 *
 * @example
 * ```tsx
 * <Checkbox label="I accept the terms" />
 * <Checkbox label="Select all" indeterminate={someSelected && !allSelected} checked={allSelected} />
 * ```
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    helperText,
    error,
    indeterminate = false,
    size = 'md',
    containerClassName = '',
    className = '',
    id,
    disabled,
    checked,
    ...inputProps
  },
  ref
) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
  const helperId = `${checkboxId}-helper`;
  const hasError = Boolean(error);
  const internalRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (internalRef.current) internalRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div className={['font-body', containerClassName].filter(Boolean).join(' ')}>
      <label htmlFor={checkboxId} className={`flex items-start gap-2 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
        <span className="relative mt-0.5 inline-flex shrink-0">
          <input
            ref={mergeRefs(ref, internalRef)}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={helperText || error ? helperId : undefined}
            className={['peer sr-only', className].filter(Boolean).join(' ')}
            {...inputProps}
          />
          <span
            className={[
              'flex items-center justify-center rounded-[4px] border transition-colors',
              BOX_SIZE_CLASSES[size],
              hasError ? 'border-mo-red' : 'border-mo-black/30',
              'bg-mo-grey-1 peer-checked:border-mo-blue peer-checked:bg-mo-blue peer-checked:[&>svg]:opacity-100',
              indeterminate ? 'border-mo-blue bg-mo-blue [&>svg]:opacity-100' : '',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-mo-blue/30',
            ].join(' ')}
          >
            {indeterminate ? (
              <Minus size={ICON_SIZE[size]} className="text-mo-white" strokeWidth={3} />
            ) : (
              <Check size={ICON_SIZE[size]} className="text-mo-white opacity-0 transition-opacity" strokeWidth={3} />
            )}
          </span>
        </span>
        {label && <span className="text-sm text-mo-black">{label}</span>}
      </label>
      {(error || helperText) && (
        <p id={helperId} className={`mt-1 pl-7 text-sm ${hasError ? 'text-mo-red' : 'text-mo-black/60'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});
