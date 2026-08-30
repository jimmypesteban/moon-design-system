import React from 'react';
import { ChevronRight } from '../icons';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  /** Items in order, including the current page as the last item */
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb — hierarchical page-location trail, used across the admin
 * and consumer apps. The last item is always rendered as the current page
 * (muted, non-interactive) regardless of whether it has an `href`.
 *
 * @example
 * ```tsx
 * <Breadcrumb items={[{ label: 'Classes', href: '/classes' }, { label: 'Period 3 English' }]} />
 * ```
 */
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={['font-body text-sm', className].filter(Boolean).join(' ')}>
      <ol className="flex items-center gap-1.5">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight size={14} className="text-mo-black/40" aria-hidden="true" />}
              {isCurrent ? (
                <span aria-current="page" className="flex items-center gap-1 text-mo-black/50">
                  {item.icon}
                  {item.label}
                </span>
              ) : item.href ? (
                <a href={item.href} className="flex items-center gap-1 text-mo-black font-medium hover:text-mo-blue">
                  {item.icon}
                  {item.label}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="flex items-center gap-1 text-mo-black font-medium hover:text-mo-blue"
                >
                  {item.icon}
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
