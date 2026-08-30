'use client';

import React, { forwardRef, useId } from 'react';

export type TextareaAudience = 'student' | 'admin';
export type TextareaSize = 'sm' | 'md';

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Visible label rendered above the textarea */
  label?: string;
  /** Helper text rendered below the textarea (hidden when `error` is set) */
  helperText?: string;
  /** Error message — when set, the textarea renders in an error state and this replaces `helperText` */
  error?: string;
  /**
   * Which surface this textarea renders on.
   * - "student": softer, more rounded corners (`rounded-mo-md`)
   * - "admin": compact corners (`rounded-mo-sm`, the brand's `radius-sm`) — default
   */
  audience?: TextareaAudience;
  size?: TextareaSize;
  /** className applied to the outer wrapper, not the <textarea> itself */
  containerClassName?: string;
}

const SHAPE_CLASSES: Record<TextareaAudience, string> = {
  student: 'rounded-mo-md',
  admin: 'rounded-mo-sm',
};

const SIZE_CLASSES: Record<TextareaSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-mo-body',
};

/**
 * Textarea — labeled multi-line text input with error/helper text, used
 * across the admin and consumer apps. Vertically resizable by default,
 * matching the reference spec's resize handle.
 *
 * @example
 * ```tsx
 * <Textarea label="Feedback" placeholder="Please type your answer" rows={4} />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
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
    rows = 3,
    ...textareaProps
  },
  ref
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const helperId = `${textareaId}-helper`;
  const hasError = Boolean(error);

  const textareaClasses = [
    'w-full resize-y border bg-mo-grey-1 text-mo-black outline-none transition-colors',
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
        <label htmlFor={textareaId} className="text-sm font-medium text-mo-black">
          {label}
          {required && <span className="text-mo-red"> *</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        required={required}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={helperText || error ? helperId : undefined}
        className={textareaClasses}
        {...textareaProps}
      />
      {(error || helperText) && (
        <p id={helperId} className={hasError ? 'text-sm text-mo-red' : 'text-sm text-mo-black/60'}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});
