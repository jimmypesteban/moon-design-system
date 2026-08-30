import React from 'react';

export type BadgeAudience = 'student' | 'admin';
export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  children: React.ReactNode;
  /**
   * Which surface this badge renders on.
   * - "student": pill shape (rounded-full), per the consumer-surface convention
   * - "admin": compact rounded-rect shape, for teacher/admin surfaces (default)
   */
  audience?: BadgeAudience;
  /** Semantic color variant */
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-mo-black/10 text-mo-black',
  success: 'bg-mo-green/10 text-mo-forest',
  warning: 'bg-mo-orange/10 text-mo-orange-8',
  danger: 'bg-mo-red/10 text-mo-red',
  info: 'bg-mo-blue/10 text-mo-blue-8',
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-mo-annotation',
  md: 'px-2.5 py-1 text-sm',
};

/**
 * Badge — small status/label chip used across the admin and consumer apps.
 *
 * Shape follows audience convention: student surfaces use a pill (`rounded-full`),
 * teacher/admin surfaces use a compact rounded-rect (`rounded-mo-sm`, the brand's
 * `radius-sm` token) — never mix the two within the same audience.
 *
 * @example
 * ```tsx
 * <Badge variant="success" audience="student">Completed</Badge>
 * <Badge variant="warning">Pending Review</Badge>
 * ```
 */
export function Badge({
  children,
  audience = 'admin',
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  const shapeClass = audience === 'student' ? 'rounded-full' : 'rounded-mo-sm';

  const classes = [
    'inline-flex items-center justify-center font-body font-medium leading-none whitespace-nowrap',
    shapeClass,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
}
