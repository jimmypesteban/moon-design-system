import React from 'react';
import { Plus } from '../icons';

export interface FloatingActionButtonProps {
  icon?: React.ReactNode;
  /** Optional label shown next to the icon (renders as a pill instead of a plain circle) */
  label?: string;
  onClick?: () => void;
  'aria-label'?: string;
  className?: string;
}

/**
 * FloatingActionButton — fixed-position circular (or pill, with a label)
 * primary action button, e.g. "add" in a bottom corner. Positioning is left
 * to the caller (className) since placement varies by layout.
 *
 * @example
 * ```tsx
 * <FloatingActionButton className="fixed bottom-6 right-6" onClick={createNew} aria-label="Create new" />
 * <FloatingActionButton label="New class" onClick={createClass} />
 * ```
 */
export function FloatingActionButton({ icon, label, onClick, className = '', ...rest }: FloatingActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rest['aria-label'] ?? label}
      className={[
        'flex items-center gap-2 bg-mo-red text-mo-white shadow-mo-lg transition-transform hover:scale-105',
        label ? 'rounded-mo-full px-5 py-3 font-body font-bold' : 'size-12 items-center justify-center rounded-full',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon ?? <Plus size={24} />}
      {label && <span>{label}</span>}
    </button>
  );
}
