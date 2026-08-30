'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, X } from '../icons';
import { useDismissFloating, useFloatingPosition } from '../internal/useFloatingPosition';

export type DateTimeFieldAudience = 'student' | 'admin';

export interface DateTimeFieldProps {
  /** Selected date+time, or `null`/`undefined` for no selection */
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  audience?: DateTimeFieldAudience;
  containerClassName?: string;
}

const SHAPE_CLASSES: Record<DateTimeFieldAudience, string> = {
  student: 'rounded-mo-md',
  admin: 'rounded-mo-sm',
};

const TWO = (n: number) => String(n).padStart(2, '0');
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Small local calendar-grid helper, deliberately not shared with
// DatePicker.tsx's own private version — same size/shape of duplication
// that already exists between DatePicker and TimePicker rather than a new
// abstraction introduced under time pressure. Worth extracting into
// ../internal/ if a third consumer shows up.
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildMonthGrid(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    return { date, inMonth: date.getMonth() === month };
  });
}

function formatDisplay(date: Date | null): string {
  if (!date) return '';
  const month = MONTH_LABELS[date.getMonth()].slice(0, 3);
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const ampm = hours24 < 12 ? 'AM' : 'PM';
  return `${month} ${date.getDate()}, ${date.getFullYear()}, ${hours12}:${TWO(date.getMinutes())} ${ampm}`;
}

/**
 * DateTimeField — a single field for picking a date AND a time together
 * (a typeable text input, plus a calendar + native time-input popover),
 * rather than composing separate `DatePicker` + `TimePicker` fields.
 * Several apps had already reinvented this exact combined pattern
 * independently — see e.g. the consumer app's own `DateTimeField.tsx` — because
 * neither `DatePicker` nor `TimePicker` alone covers "pick a deadline" in
 * one control. Typed text is parsed with the browser's native `Date`
 * parser (works for common formats like "Jun 3, 2026, 9:00 AM"); anything
 * unparseable reverts to the last valid value's display rather than
 * silently clearing it. Built on the same `useFloatingPosition`/
 * `useDismissFloating` hooks `DatePicker`/`TimePicker`/`Popover` share.
 *
 * @example
 * ```tsx
 * <DateTimeField
 *   label="Due date"
 *   value={dueAt}
 *   onChange={setDueAt}
 * />
 * ```
 */
export function DateTimeField({
  value = null,
  onChange,
  label,
  helperText,
  error,
  placeholder = 'e.g. Jun 3, 2026, 9:00 AM',
  disabled = false,
  required = false,
  audience = 'admin',
  containerClassName = '',
}: DateTimeFieldProps) {
  const autoId = useId();
  const fieldId = autoId;
  const [text, setText] = useState(() => formatDisplay(value));
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value ?? new Date());

  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const position = useFloatingPosition(open, triggerRef, panelRef, 'start');
  useDismissFloating(open, () => setOpen(false), triggerRef, panelRef);

  useEffect(() => {
    setText(formatDisplay(value));
  }, [value]);

  useEffect(() => {
    if (open && value) setViewDate(value);
  }, [open, value]);

  const grid = useMemo(() => buildMonthGrid(viewDate), [viewDate]);
  const today = new Date();
  const timeInputValue = value ? `${TWO(value.getHours())}:${TWO(value.getMinutes())}` : '09:00';

  function commitTypedText() {
    const trimmed = text.trim();
    if (trimmed === '') {
      if (value !== null) onChange?.(null);
      return;
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      onChange?.(parsed);
    } else {
      setText(formatDisplay(value));
    }
  }

  function withDate(day: Date) {
    const base = value ?? new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 0);
    return new Date(day.getFullYear(), day.getMonth(), day.getDate(), base.getHours(), base.getMinutes());
  }

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block font-body text-sm font-medium text-mo-black">
          {label}
          {required && <span className="text-mo-red"> *</span>}
        </label>
      )}
      <div ref={triggerRef} className="relative">
        <div
          className={[
            'flex items-center gap-1 border bg-mo-grey-1 px-3 transition-colors focus-within:ring-2',
            SHAPE_CLASSES[audience],
            error ? 'border-mo-red focus-within:border-mo-red focus-within:ring-mo-red/20' : 'border-mo-grey-3 focus-within:border-mo-blue focus-within:ring-mo-blue/20',
            disabled ? 'opacity-60' : '',
          ].join(' ')}
        >
          <input
            id={fieldId}
            type="text"
            inputMode="text"
            autoComplete="off"
            aria-invalid={Boolean(error) || undefined}
            disabled={disabled}
            value={text}
            placeholder={placeholder}
            onChange={(e) => setText(e.target.value)}
            onBlur={commitTypedText}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitTypedText();
              }
            }}
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-mo-black placeholder:text-mo-grey-6 focus:outline-none"
          />
          {value && !disabled && (
            <button
              type="button"
              aria-label="Clear"
              onClick={() => {
                onChange?.(null);
                setText('');
              }}
              className="flex size-6 items-center justify-center rounded-mo-sm text-mo-grey-7 hover:bg-mo-grey-2 hover:text-mo-black"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            aria-label="Open calendar"
            aria-haspopup="dialog"
            aria-expanded={open}
            disabled={disabled}
            onClick={() => setOpen((o) => !o)}
            className="rounded-mo-sm p-1 text-mo-grey-7 hover:bg-mo-grey-2 hover:text-mo-black"
          >
            <Calendar size={16} />
          </button>
        </div>

        {open &&
          position &&
          createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label="Choose date and time"
              style={{ position: 'fixed', top: position.top, left: position.left }}
              className="z-[60] w-72 rounded-mo-md border border-mo-grey-3 bg-mo-white p-3 shadow-mo-lg"
            >
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                  className="rounded-mo-sm p-1 text-mo-grey-7 hover:bg-mo-grey-2"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-body text-sm font-semibold text-mo-black">
                  {MONTH_LABELS[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                  className="rounded-mo-sm p-1 text-mo-grey-7 hover:bg-mo-grey-2"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-mo-annotation font-medium text-mo-grey-6">
                {WEEKDAY_LABELS.map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {grid.map(({ date, inMonth }) => {
                  const isSelected = value ? isSameDay(date, value) : false;
                  const isToday = isSameDay(date, today);
                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => onChange?.(withDate(date))}
                      className={[
                        'flex h-8 items-center justify-center rounded-mo-sm text-sm transition-colors',
                        inMonth ? 'text-mo-black' : 'text-mo-grey-5',
                        isSelected ? 'bg-mo-blue font-semibold text-mo-white hover:bg-mo-blue' : 'hover:bg-mo-grey-2',
                        !isSelected && isToday ? 'ring-1 ring-inset ring-mo-blue/40' : '',
                      ].join(' ')}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center gap-2 border-t border-mo-grey-3 pt-3">
                <label htmlFor={`${fieldId}-time`} className="text-mo-annotation font-medium text-mo-grey-7">
                  Time
                </label>
                <input
                  id={`${fieldId}-time`}
                  type="time"
                  value={timeInputValue}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':');
                    if (h === undefined || m === undefined || e.target.value === '') return;
                    const base = value ?? viewDate;
                    onChange?.(new Date(base.getFullYear(), base.getMonth(), base.getDate(), Number(h), Number(m)));
                  }}
                  className="flex-1 rounded-mo-sm border border-mo-grey-3 bg-mo-grey-1 px-2 py-1.5 text-sm text-mo-black focus:border-mo-blue focus:outline-none focus:ring-2 focus:ring-mo-blue/20"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onChange?.(new Date())}
                  className="rounded-mo-sm bg-mo-blue-1 px-3 py-1 text-mo-annotation font-medium text-mo-blue hover:bg-mo-blue-1/70"
                >
                  Now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange?.(null);
                    setText('');
                  }}
                  className="rounded-mo-sm px-3 py-1 text-mo-annotation font-medium text-mo-grey-7 hover:bg-mo-grey-2 hover:text-mo-black"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="ml-auto rounded-mo-sm bg-mo-blue px-3 py-1 text-mo-annotation font-medium text-mo-white hover:bg-mo-blue-7"
                >
                  Done
                </button>
              </div>
            </div>,
            document.body,
          )}
      </div>
      {(error || helperText) && (
        <p className={'mt-1.5 text-mo-annotation ' + (error ? 'text-mo-red' : 'text-mo-grey-7')}>{error || helperText}</p>
      )}
    </div>
  );
}
