import React from 'react';

export interface EmptyStateProps {
  /** Icon rendered inside a colored disc — pass a sized icon element, e.g. `<Inbox size={24} />` */
  icon?: React.ReactNode;
  /** Tailwind classes for the icon disc's background + icon color, defaults to the brand red tint */
  iconClassName?: string;
  title: string;
  description?: string;
  /** CTA slot — render a `Button` or `Link` here */
  action?: React.ReactNode;
  className?: string;
}

/**
 * EmptyState — the "nothing here yet" screen: an icon, a title, an
 * optional description, and an optional call-to-action. No drawn source
 * exists for this in the design system file — it's a generic pattern —
 * but it's one several apps had already reinvented independently rather
 * than sharing (e.g. the consumer app has at least half a dozen bespoke
 * versions of this same shell across its dashboard, class list, and
 * materials pages).
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<Mail size={24} />}
 *   title="No submissions yet"
 *   description="Once a student submits this activity, it will show up here."
 *   action={<Button variant="secondary">Invite students</Button>}
 * />
 * ```
 */
export function EmptyState({
  icon,
  iconClassName = 'bg-mo-red-1 text-mo-red',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={['rounded-mo-lg border border-mo-grey-3 bg-mo-grey-1 px-6 py-12 text-center', className].filter(Boolean).join(' ')}>
      {icon && (
        <div className={['mx-auto flex h-12 w-12 items-center justify-center rounded-full', iconClassName].filter(Boolean).join(' ')}>
          {icon}
        </div>
      )}
      <p className={['font-heading text-mo-body-lg font-semibold text-mo-black', icon ? 'mt-4' : ''].filter(Boolean).join(' ')}>{title}</p>
      {description && <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-mo-grey-8">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
