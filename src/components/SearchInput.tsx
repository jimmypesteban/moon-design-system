'use client';

import React, { forwardRef, useId, useState } from 'react';
import { Search, Mic, X } from '../icons';

export type SearchInputSize = 'sm' | 'md' | 'lg';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: string;
  size?: SearchInputSize;
  /** Called when the search button is clicked or Enter is pressed */
  onSearch?: (value: string) => void;
  /** Renders "Search" text instead of just the icon on the action button */
  showButtonLabel?: boolean;
  /** Adds a secondary mic button for voice search */
  onMicClick?: () => void;
  containerClassName?: string;
}

const SIZE_CLASSES: Record<SearchInputSize, string> = {
  sm: 'py-1.5 pl-3 pr-2 text-sm',
  md: 'py-2.5 pl-4 pr-3 text-mo-body',
  lg: 'py-3 pl-4 pr-3 text-mo-body',
};

const BUTTON_SIZE_CLASSES: Record<SearchInputSize, string> = {
  sm: 'px-2.5 text-sm',
  md: 'px-3 text-mo-body',
  lg: 'px-4 text-mo-body',
};

/**
 * SearchInput — text input with a trailing search action button, used
 * across the admin and consumer apps for list/roster filtering.
 *
 * @example
 * ```tsx
 * <SearchInput placeholder="Search students..." onSearch={(q) => setQuery(q)} />
 * ```
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  {
    label,
    size = 'md',
    onSearch,
    showButtonLabel = false,
    onMicClick,
    containerClassName = '',
    className = '',
    id,
    disabled,
    defaultValue,
    value,
    onChange,
    ...inputProps
  },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const internalRef = React.useRef<HTMLInputElement>(null);
  const isControlled = value !== undefined;
  // Mirrors an uncontrolled input's live value so the clear button knows
  // whether to render without needing to read the DOM on every keystroke.
  const [uncontrolledValue, setUncontrolledValue] = useState(String(defaultValue ?? ''));
  const currentValue = isControlled ? String(value ?? '') : uncontrolledValue;

  const triggerSearch = () => {
    if (internalRef.current) onSearch?.(internalRef.current.value);
  };

  // Custom clear affordance instead of type="search"'s native clear icon,
  // which renders inconsistently (a plain browser-chrome "x") across
  // browsers rather than matching the rest of this component's design.
  // Clearing a CONTROLLED input can't just set `.value` — React would
  // immediately re-render it back — so this uses the native value setter
  // then dispatches a real "input" event, which is what makes React's
  // onChange fire as if the user had cleared it themselves.
  const clearInput = () => {
    const node = internalRef.current;
    if (!node) return;
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    nativeSetter?.call(node, '');
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.focus();
    if (!isControlled) setUncontrolledValue('');
  };

  return (
    <div className={['flex flex-col gap-1.5 font-body', containerClassName].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-mo-black">
          {label}
        </label>
      )}
      <div
        className={[
          'flex items-center overflow-hidden rounded-mo-sm border border-mo-black/20 bg-mo-grey-1 transition-colors',
          'focus-within:border-mo-red focus-within:ring-2 focus-within:ring-mo-red/20',
          disabled ? 'cursor-not-allowed opacity-50' : '',
        ].join(' ')}
      >
        <input
          ref={(node) => {
            (internalRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
          }}
          id={inputId}
          type="text"
          disabled={disabled}
          defaultValue={defaultValue}
          value={value}
          onChange={(e) => {
            if (!isControlled) setUncontrolledValue(e.target.value);
            onChange?.(e);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') triggerSearch();
          }}
          className={['flex-1 bg-transparent outline-none placeholder:text-mo-black/40 text-mo-black', SIZE_CLASSES[size], className]
            .filter(Boolean)
            .join(' ')}
          {...inputProps}
        />
        {currentValue.length > 0 && (
          <button
            type="button"
            onClick={clearInput}
            disabled={disabled}
            aria-label="Clear search"
            className="flex min-h-6 min-w-6 items-center justify-center px-2 text-mo-black/40 hover:text-mo-black"
          >
            <X size={16} />
          </button>
        )}
        {onMicClick && (
          <button
            type="button"
            onClick={onMicClick}
            disabled={disabled}
            aria-label="Search by voice"
            className="flex min-h-6 min-w-6 items-center justify-center px-3 text-mo-black/50 hover:text-mo-black"
          >
            <Mic size={18} />
          </button>
        )}
        <button
          type="button"
          onClick={triggerSearch}
          disabled={disabled}
          aria-label="Search"
          className={`flex items-center justify-center gap-1.5 self-stretch bg-mo-black font-bold text-mo-white hover:bg-mo-grey-9 ${BUTTON_SIZE_CLASSES[size]}`}
        >
          <Search size={18} />
          {showButtonLabel && 'Search'}
        </button>
      </div>
    </div>
  );
});
