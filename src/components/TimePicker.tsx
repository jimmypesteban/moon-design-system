'use client';

import React, { useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock } from '../icons';
import { useDismissFloating, useFloatingPosition } from '../internal/useFloatingPosition';

export type TimePickerAudience = 'student' | 'admin';
export type TimePickerSize = 'sm' | 'md';

export interface TimePickerProps {
  /** Selected time-of-day in minutes since midnight (0-1439), or `null`/`undefined` for no selection */
  value?: number | null;
  onChange?: (minutesSinceMidnight: number) => void;
  /** Visible label rendered above the field */
  label?: string;
  /** Helper text rendered below the field (hidden when `error` is set) */
  helperText?: string;
  /** Error message — when set, the field renders in an error state and this replaces `helperText` */
  error?: string;
  placeholder?: string;
  /** Interval between selectable times, in minutes (default: 30) */
  stepMinutes?: number;
  disabled?: boolean;
  required?: boolean;
  /**
   * Which surface this field renders on.
   * - "student": softer, more rounded corners (`rounded-mo-md`)
   * - "admin": compact corners (`rounded-mo-sm`, the brand's `radius-sm`) — default
   */
  audience?: TimePickerAudience;
  size?: TimePickerSize;
  /** className applied to the outer wrapper */
  containerClassName?: string;
}

const SHAPE_CLASSES: Record<TimePickerAudience, string> = {
  student: 'rounded-mo-md',
  admin: 'rounded-mo-sm',
};

const SIZE_CLASSES: Record<TimePickerSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-mo-body',
};

function formatMinutes(minutes: number) {
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const period = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

/**
 * TimePicker — text field that opens a scrollable list popover for choosing a
 * time of day. Portals the popover to `document.body` and clamps it inside
 * the viewport, same positioning approach as `Dropdown`/`DatePicker`.
 *
 * @example
 * ```tsx
 * <TimePicker label="Start time" value={startMinutes} onChange={setStartMinutes} stepMinutes={15} />
 * ```
 */
export function TimePicker({
  value,
  onChange,
  label,
  helperText,
  error,
  placeholder = 'Select time',
  stepMinutes = 30,
  disabled,
  required,
  audience = 'admin',
  size = 'md',
  containerClassName = '',
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const fieldId = `${generatedId}-field`;
  const helperId = `${generatedId}-helper`;
  const hasError = Boolean(error);

  const position = useFloatingPosition(open, triggerRef, panelRef, 'start');
  useDismissFloating(open, () => setOpen(false), triggerRef, panelRef);

  const options = useMemo(() => {
    const count = Math.floor((24 * 60) / stepMinutes);
    return Array.from({ length: count }, (_, i) => i * stepMinutes);
  }, [stepMinutes]);

  const selectTime = (minutes: number) => {
    onChange?.(minutes);
    setOpen(false);
  };

  const triggerClasses = [
    'flex w-full items-center justify-between gap-2 border bg-mo-grey-1 text-left text-mo-black outline-none transition-colors',
    'focus:ring-2',
    SHAPE_CLASSES[audience],
    SIZE_CLASSES[size],
    hasError
      ? 'border-mo-red focus:border-mo-red focus:ring-mo-red/20'
      : 'border-mo-black/20 focus:border-mo-blue focus:ring-mo-blue/20',
    disabled ? 'cursor-not-allowed opacity-50' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={['flex flex-col gap-1.5 font-body', containerClassName].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-mo-black">
          {label}
          {required && <span className="text-mo-red"> *</span>}
        </label>
      )}
      <button
        ref={triggerRef}
        id={fieldId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={hasError || undefined}
        aria-describedby={helperText || error ? helperId : undefined}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={triggerClasses}
      >
        <span className={value != null ? '' : 'text-mo-black/40'}>
          {value != null ? formatMinutes(value) : placeholder}
        </span>
        <Clock size={16} className="shrink-0 text-mo-black/50" />
      </button>
      {(error || helperText) && (
        <p id={helperId} className={hasError ? 'text-sm text-mo-red' : 'text-sm text-mo-black/60'}>
          {error || helperText}
        </p>
      )}
      {open &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            role="listbox"
            style={{ position: 'fixed', top: position.top, left: position.left, right: position.right }}
            className="z-50 max-h-56 w-40 overflow-y-auto rounded-mo-sm border border-mo-black/10 bg-white py-1 shadow-md"
          >
            {options.map((minutes) => (
              <button
                key={minutes}
                type="button"
                role="option"
                aria-selected={value === minutes}
                onClick={() => selectTime(minutes)}
                className={[
                  'flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors',
                  value === minutes ? 'bg-mo-red text-mo-white' : 'text-mo-black hover:bg-mo-white',
                ].join(' ')}
              >
                {formatMinutes(minutes)}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
