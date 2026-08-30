import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from '../icons';

export type ToastVariant = 'success' | 'warning' | 'danger' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  variant?: ToastVariant;
  title?: string;
  children: React.ReactNode;
  /** Shows a close (×) button and calls this when clicked */
  onClose?: () => void;
  /** Optional secondary action rendered next to the close button (e.g. "Undo", "Retry") */
  action?: ToastAction;
  className?: string;
}

const ICONS: Record<ToastVariant, React.ComponentType<{ size?: number; className?: string }>> = {
  success: CheckCircle2,
  danger: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const BORDER_CLASSES: Record<ToastVariant, string> = {
  success: 'border-mo-green-7',
  danger: 'border-mo-red-7',
  warning: 'border-mo-yellow-7',
  info: 'border-mo-blue-7',
};

const ICON_CLASSES: Record<ToastVariant, string> = {
  success: 'text-mo-green-7',
  danger: 'text-mo-red-7',
  warning: 'text-mo-yellow-7',
  info: 'text-mo-blue-7',
};

/**
 * Toast — dismissible status card for ephemeral feedback (e.g. after a save,
 * a background job finishing, an error). Presentational only — the caller
 * owns the open/stacking state, same as `Modal`.
 *
 * @example
 * ```tsx
 * <Toast variant="success" title="Saved" onClose={dismiss}>
 *   Your changes have been saved.
 * </Toast>
 * <Toast variant="danger" action={{ label: 'Retry', onClick: retry }} onClose={dismiss}>
 *   Something went wrong.
 * </Toast>
 * ```
 */
export function Toast({ variant = 'info', title, children, onClose, action, className = '' }: ToastProps) {
  const Icon = ICONS[variant];

  return (
    <div
      role="status"
      className={[
        'flex w-full max-w-sm items-start gap-3 rounded-mo-sm border bg-white p-4 font-body shadow-mo-popup',
        BORDER_CLASSES[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon size={20} className={['mt-0.5 shrink-0', ICON_CLASSES[variant]].join(' ')} />
      <div className="min-w-0 flex-1">
        {title && <p className="font-bold text-mo-black">{title}</p>}
        <p className="text-sm text-mo-black">{children}</p>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-2 inline-flex min-h-6 items-center text-sm font-bold text-mo-black underline underline-offset-2 hover:opacity-70"
          >
            {action.label}
          </button>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          // 24px tap target around the same 16px glyph (WCAG 2.5.8); the ruling is
          // icons stay 16-20px and the padded area does the reaching.
          className="-m-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-mo-black/50 hover:bg-mo-white hover:text-mo-black"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
