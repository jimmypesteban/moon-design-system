'use client';

import React, { useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from '../icons';
import { useDismissFloating, useFloatingPosition } from '../internal/useFloatingPosition';

export type DatePickerAudience = 'student' | 'admin';
export type DatePickerSize = 'sm' | 'md';

export interface DatePickerProps {
  /** Selected date, or `null`/`undefined` for no selection */
  value?: Date | null;
  onChange?: (date: Date) => void;
  /** Visible label rendered above the field */
  label?: string;
  /** Helper text rendered below the field (hidden when `error` is set) */
  helperText?: string;
  /** Error message — when set, the field renders in an error state and this replaces `helperText` */
  error?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  required?: boolean;
  /**
   * Which surface this field renders on.
   * - "student": softer, more rounded corners (`rounded-mo-md`)
   * - "admin": compact corners (`rounded-mo-sm`, the brand's `radius-sm`) — default
   */
  audience?: DatePickerAudience;
  size?: DatePickerSize;
  /** className applied to the outer wrapper */
  containerClassName?: string;
}

const SHAPE_CLASSES: Record<DatePickerAudience, string> = {
  student: 'rounded-mo-md',
  admin: 'rounded-mo-sm',
};

const SIZE_CLASSES: Record<DatePickerSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-mo-body',
};

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isBeforeDay(a: Date, b: Date) {
  return new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime() < new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
}

function isAfterDay(a: Date, b: Date) {
  return new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime() > new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function buildMonthGrid(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    return d;
  });
}

/**
 * DatePicker — text field that opens a calendar popover for choosing a single
 * date. Portals the popover to `document.body` and clamps it inside the
 * viewport, same positioning approach as `Dropdown`.
 *
 * @example
 * ```tsx
 * <DatePicker label="Due date" value={dueDate} onChange={setDueDate} minDate={new Date()} />
 * ```
 */
export function DatePicker({
  value,
  onChange,
  label,
  helperText,
  error,
  placeholder = 'Select date',
  minDate,
  maxDate,
  disabled,
  required,
  audience = 'admin',
  size = 'md',
  containerClassName = '',
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => value ?? new Date());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const fieldId = `${generatedId}-field`;
  const helperId = `${generatedId}-helper`;
  const hasError = Boolean(error);

  const position = useFloatingPosition(open, triggerRef, panelRef, 'start');
  useDismissFloating(open, () => setOpen(false), triggerRef, panelRef);

  const openPicker = () => {
    if (disabled) return;
    setViewMonth(value ?? new Date());
    setOpen((prev) => !prev);
  };

  const selectDay = (day: Date) => {
    if (minDate && isBeforeDay(day, minDate)) return;
    if (maxDate && isAfterDay(day, maxDate)) return;
    onChange?.(day);
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

  const days = buildMonthGrid(viewMonth);
  const today = new Date();

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
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={hasError || undefined}
        aria-describedby={helperText || error ? helperId : undefined}
        onClick={openPicker}
        className={triggerClasses}
      >
        <span className={value ? '' : 'text-mo-black/40'}>{value ? formatDate(value) : placeholder}</span>
        <Calendar size={16} className="shrink-0 text-mo-black/50" />
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
            role="dialog"
            style={{ position: 'fixed', top: position.top, left: position.left, right: position.right }}
            className="z-50 w-70 rounded-mo-sm border border-mo-black/10 bg-white p-3 shadow-md"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                className="rounded-mo-sm p-1 text-mo-black/60 hover:bg-mo-white hover:text-mo-black"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-mo-black">
                {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                className="rounded-mo-sm p-1 text-mo-black/60 hover:bg-mo-white hover:text-mo-black"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {WEEKDAY_LABELS.map((wd, i) => (
                <div key={i} className="flex h-7 items-center justify-center text-mo-annotation font-medium text-mo-black/40">
                  {wd}
                </div>
              ))}
              {days.map((day) => {
                const inMonth = day.getMonth() === viewMonth.getMonth();
                const isSelected = value ? isSameDay(day, value) : false;
                const isToday = isSameDay(day, today);
                const isDisabled = (minDate && isBeforeDay(day, minDate)) || (maxDate && isAfterDay(day, maxDate));
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={Boolean(isDisabled)}
                    onClick={() => selectDay(day)}
                    className={[
                      'flex h-7 items-center justify-center rounded-mo-sm text-sm transition-colors',
                      isSelected
                        ? 'bg-mo-red text-mo-white'
                        : isToday
                          ? 'ring-1 ring-inset ring-mo-blue text-mo-black hover:bg-mo-white'
                          : 'text-mo-black hover:bg-mo-white',
                      !inMonth ? 'text-mo-black/30' : '',
                      isDisabled ? 'cursor-not-allowed opacity-30 hover:bg-transparent' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
