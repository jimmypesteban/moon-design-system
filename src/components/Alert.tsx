import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from '../icons';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  /** Shows a close (×) button and calls this when clicked */
  onClose?: () => void;
  className?: string;
}

const ICONS: Record<AlertVariant, React.ComponentType<{ size?: number; className?: string }>> = {
  success: CheckCircle2,
  danger: XCircle,
  warning: AlertTriangle,
  info: Info,
};

// Same semantic variant naming as Toast/Badge, but a persistent inline
// banner reads differently than a transient floating card — soft tinted
// fill + a matching border, not a white card with a colored icon only.
const CONTAINER_CLASSES: Record<AlertVariant, string> = {
  success: 'border-mo-green-3 bg-mo-green-1',
  danger: 'border-mo-red-3 bg-mo-red-1',
  warning: 'border-mo-yellow-3 bg-mo-yellow-1',
  info: 'border-mo-blue-3 bg-mo-blue-1',
};

const ICON_CLASSES: Record<AlertVariant, string> = {
  success: 'text-mo-green-8',
  danger: 'text-mo-red-8',
  warning: 'text-mo-yellow-8',
  info: 'text-mo-blue-8',
};

/**
 * Alert — persistent inline banner for page/section-level info, warnings,
 * or errors (e.g. "This class has no students yet", "Grading is paused").
 * Unlike `Toast` (transient, floating, caller-managed stacking), an Alert
 * sits directly in the page flow and stays until its content's underlying
 * condition changes or the user dismisses it.
 *
 * @example
 * ```tsx
 * <Alert variant="warning" title="No students enrolled">
 *   Add students to this class before assigning work.
 * </Alert>
 * <Alert variant="danger" onClose={dismiss}>
 *   Failed to save. Check your connection and try again.
 * </Alert>
 * ```
 */
export function Alert({ variant = 'info', title, children, onClose, className = '' }: AlertProps) {
  const Icon = ICONS[variant];

  return (
    <div
      role="alert"
      className={[
        'flex w-full items-start gap-3 rounded-mo-sm border p-4 font-body',
        CONTAINER_CLASSES[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon size={20} className={['mt-0.5 shrink-0', ICON_CLASSES[variant]].join(' ')} />
      <div className="min-w-0 flex-1">
        {title && <p className="font-bold text-mo-black">{title}</p>}
        <p className="text-sm text-mo-black">{children}</p>
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
