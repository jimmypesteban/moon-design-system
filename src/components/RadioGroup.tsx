'use client';

import React, { useId } from 'react';
import { Radio } from './Radio';
import type { RadioSize } from './Radio';

export interface RadioGroupOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioGroupOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Visible label rendered above the group */
  label?: string;
  /** Helper text rendered below the group (hidden when `error` is set) */
  helperText?: string;
  /** Error message — when set, this replaces `helperText` */
  error?: string;
  size?: RadioSize;
  orientation?: 'horizontal' | 'vertical';
  name?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * RadioGroup — a set of mutually exclusive radio options with a shared label
 * and error/helper text, used across the admin and consumer apps.
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   label="Cohort"
 *   options={[{ value: 'school', label: 'School' }, { value: 'university', label: 'University' }]}
 *   value={cohort}
 *   onChange={setCohort}
 * />
 * ```
 */
export function RadioGroup({
  options,
  value,
  defaultValue,
  onChange,
  label,
  helperText,
  error,
  size = 'md',
  orientation = 'vertical',
  name,
  disabled,
  className = '',
}: RadioGroupProps) {
  const generatedName = useId();
  const groupName = name ?? generatedName;
  const hasError = Boolean(error);

  return (
    <div role="radiogroup" aria-label={label} className={['font-body', className].filter(Boolean).join(' ')}>
      {label && <p className="mb-1.5 text-sm font-medium text-mo-black">{label}</p>}
      <div className={orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'flex flex-col gap-2'}>
        {options.map((opt) => (
          <Radio
            key={opt.value}
            name={groupName}
            value={opt.value}
            label={opt.label}
            size={size}
            disabled={disabled || opt.disabled}
            checked={value !== undefined ? value === opt.value : undefined}
            defaultChecked={value === undefined ? defaultValue === opt.value : undefined}
            onChange={() => onChange?.(opt.value)}
          />
        ))}
      </div>
      {(error || helperText) && (
        <p className={`mt-1.5 text-sm ${hasError ? 'text-mo-red' : 'text-mo-black/60'}`}>{error || helperText}</p>
      )}
    </div>
  );
}
