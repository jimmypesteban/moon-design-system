'use client';

import React, { forwardRef, useId } from 'react';
import { ChevronDown } from '../icons';

export type SelectAudience = 'student' | 'admin';
export type SelectSize = 'sm' | 'md';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  /** Visible label rendered above the select */
  label?: string;
  /** Helper text rendered below the select (hidden when `error` is set) */
  helperText?: string;
  /** Error message — when set, the select renders in an error state and this replaces `helperText` */
  error?: string;
  /** Placeholder shown as a disabled first option when no value is selected */
  placeholder?: string;
  /**
   * Which surface this select renders on.
   * - "student": softer, more rounded corners (`rounded-mo-md`)
   * - "admin": compact corners (`rounded-mo-sm`, the brand's `radius-sm`) — default
   */
  audience?: SelectAudience;
  size?: SelectSize;
  /** className applied to the outer wrapper, not the <select> itself */
  containerClassName?: string;
}

const SHAPE_CLASSES: Record<SelectAudience, string> = {
  student: 'rounded-mo-md',
  admin: 'rounded-mo-sm',
};

const SIZE_CLASSES: Record<SelectSize, string> = {
  sm: 'py-1.5 pl-3 pr-8 text-sm',
  md: 'py-2.5 pl-4 pr-9 text-mo-body',
};

/**
 * Select — labeled dropdown with error/helper text, used across the admin and consumer apps.
 *
 * @example
 * ```tsx
 * <Select label="Cohort" options={[{ value: 'school', label: 'School' }, { value: 'university', label: 'University' }]} />
 * ```
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    options,
    label,
    helperText,
    error,
    placeholder,
    audience = 'admin',
    size = 'md',
    containerClassName = '',
    className = '',
    id,
    required,
    disabled,
    ...selectProps
  },
  ref
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const helperId = `${selectId}-helper`;
  const hasError = Boolean(error);

  const selectClasses = [
    'w-full appearance-none border bg-mo-grey-1 text-mo-black outline-none transition-colors',
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
        <label htmlFor={selectId} className="text-sm font-medium text-mo-black">
          {label}
          {required && <span className="text-mo-red"> *</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={helperText || error ? helperId : undefined}
          className={selectClasses}
          defaultValue={selectProps.defaultValue ?? (placeholder ? '' : undefined)}
          {...selectProps}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-mo-black/50"
        />
      </div>
      {(error || helperText) && (
        <p id={helperId} className={hasError ? 'text-sm text-mo-red' : 'text-sm text-mo-black/60'}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});
