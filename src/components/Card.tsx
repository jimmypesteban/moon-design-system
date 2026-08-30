import React from 'react';

export type CardAudience = 'student' | 'admin';

export interface CardProps {
  /** Card title displayed at the top, in the brand heading font */
  title?: string;
  /** Optional footer content (usually actions/buttons) */
  footer?: React.ReactNode;
  /** Main card content */
  children: React.ReactNode;
  /**
   * Which surface this card renders on.
   * - "student": softer, more rounded corners (`rounded-mo-md`)
   * - "admin": compact corners (`rounded-mo-sm`, the brand's `radius-sm`) — default
   */
  audience?: CardAudience;
  /**
   * Drop shadow. Default false: the brand guide's product-UI section says
   * default surfaces get no drop shadow and to separate areas with spacing,
   * borders or background contrast, reserving shadows for true elevation
   * (modals, popovers, dragged items). When true this is now shadow-mo-sm,
   * the brand's own smallest step, rather than Tailwind's shadow-md.
   */
  shadow?: boolean;
  className?: string;
}

const SHAPE_CLASSES: Record<CardAudience, string> = {
  student: 'rounded-mo-md',
  admin: 'rounded-mo-sm',
};

/**
 * Card — content container with an optional title and footer, used across the admin and consumer apps.
 *
 * @example
 * ```tsx
 * <Card title="Class roster" footer={<Button>Add student</Button>}>
 *   <p>24 students enrolled</p>
 * </Card>
 * ```
 */
export function Card({
  title,
  footer,
  children,
  audience = 'admin',
  shadow = false,
  className = '',
}: CardProps) {
  const classes = [
    'overflow-hidden border border-mo-black/10 bg-white font-body',
    SHAPE_CLASSES[audience],
    shadow ? 'shadow-mo-sm' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {title && (
        <div className="border-b border-mo-black/10 px-5 py-4">
          <h3 className="font-heading text-mo-body-lg font-bold text-mo-black">{title}</h3>
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
      {footer && <div className="flex gap-2 border-t border-mo-black/10 bg-mo-white px-5 py-3">{footer}</div>}
    </div>
  );
}
