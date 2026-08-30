'use client';

import React, { forwardRef, useId } from 'react';

export type InputAudience = 'student' | 'admin';
export type InputSize = 'sm' | 'md';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label rendered above the input */
  label?: string;
  /** Helper text rendered below the input (hidden when `error` is set) */
  helperText?: string;
  /** Error message — when set, the input renders in an error state and this replaces `helperText` */
  error?: string;
  /**
   * Which surface this input renders on.
   * - "student": softer, more rounded corners (`rounded-mo-md`)
   * - "admin": compact corners (`rounded-mo-sm`, the brand's `radius-sm`) — default
   */
  audience?: InputAudience;
  size?: InputSize;
  /** className applied to the outer wrapper, not the <input> itself */
  containerClassName?: string;
}

const SHAPE_CLASSES: Record<InputAudience, string> = {
  student: 'rounded-mo-md',
  admin: 'rounded-mo-sm',
};

const SIZE_CLASSES: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-mo-body',
};

/**
 * Input — labeled text input with error/helper text, used across the admin and consumer apps.
 *
 * @example
 * ```tsx
 * <Input label="Class name" placeholder="e.g. Period 3 English" />
 * <Input label="Email" error="Enter a valid email address" audience="student" />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    helperText,
    error,
    audience = 'admin',
    size = 'md',
    containerClassName = '',
    className = '',
    id,
    required,
    disabled,
    ...inputProps
  },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const hasError = Boolean(error);

  const inputClasses = [
    'w-full border bg-mo-grey-1 text-mo-black outline-none transition-colors',
    'placeholder:text-mo-black/40',
    'focus:ring-2',
    SHAPE_CLASSES[audience],
    SIZE_CLASSES[size],
    hasError
      ? 'border-mo-red focus:border-mo-red focus:ring-mo-red/20'
      : 'border-mo-black/20 focus:border-mo-blue focus:ring-mo-blue/20',
    disabled ? 'cursor-not-allowed opacity-50' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={['flex flex-col gap-1.5 font-body', containerClassName].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-mo-black">
          {label}
          {required && <span className="text-mo-red"> *</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        required={required}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={helperText || error ? helperId : undefined}
        className={inputClasses}
        {...inputProps}
      />
      {(error || helperText) && (
        <p id={helperId} className={hasError ? 'text-sm text-mo-red' : 'text-sm text-mo-black/60'}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});
