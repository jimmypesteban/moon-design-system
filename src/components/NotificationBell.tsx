'use client';

import React, { useMemo, useState } from 'react';
import { Popover } from './Popover';
import { Bell, Check, CheckCheck, Loader2, X } from '../icons';

export interface NotificationBellItem {
  id: string;
  title: string;
  body?: string;
  /** Pre-formatted display string (e.g. "2h ago") — this component does no date math itself */
  timestamp?: string;
  read?: boolean;
  actionUrl?: string;
  /** Optional accent icon shown in a colored chip to the left of the row (kind-specific — the caller owns the mapping) */
  icon?: React.ReactNode;
  /** Tailwind classes for the icon chip's background + icon color, e.g. "bg-mo-blue-1 text-mo-blue" */
  accentClassName?: string;
}

export interface NotificationBellProps {
  items: NotificationBellItem[];
  /** Defaults to counting unread items — pass explicitly if the caller tracks it separately (e.g. paginated) */
  unreadCount?: number;
  isLoading?: boolean;
  errorMessage?: string | null;
  emptyLabel?: string;
  title?: string;
  onSelect?: (item: NotificationBellItem) => void;
  onMarkRead?: (id: string) => void;
  onMarkUnread?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onMarkAllRead?: () => void;
  isMarkingAllRead?: boolean;
  /** "View all" / "Settings" links etc. — the caller owns real hrefs and i18n, this is just a slot */
  footer?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  ariaLabel?: string;
  className?: string;
}

type NotificationFilter = 'all' | 'unread';

/**
 * NotificationBell — a bell trigger with an unread-count badge that opens a
 * popover notification list, for the pattern several apps had already
 * built independently (see the consumer app's `NotificationsInboxButton.tsx` +
 * `NotificationsPanel.tsx`). Deliberately presentational only: it takes
 * already-fetched `items` and fires callbacks for read/unread/dismiss/mark-all
 * — polling, the API calls, kind-specific icon mapping, and i18n all stay
 * with the caller, the same split `Dropdown`/`Popover` use. Built on
 * `Popover` for the trigger + floating-panel plumbing rather than
 * reimplementing outside-click/positioning by hand.
 *
 * @example
 * ```tsx
 * <NotificationBell
 *   items={notifications}
 *   unreadCount={unreadCount}
 *   onSelect={handleSelect}
 *   onMarkRead={handleMarkRead}
 *   onDismiss={handleDismiss}
 *   onMarkAllRead={handleMarkAllRead}
 *   footer={
 *     <>
 *       <Link href="/notifications">View all</Link>
 *       <Link href="/settings/notifications">Settings</Link>
 *     </>
 *   }
 * />
 * ```
 */
export function NotificationBell({
  items,
  unreadCount,
  isLoading = false,
  errorMessage = null,
  emptyLabel = 'No notifications',
  title = 'Notifications',
  onSelect,
  onMarkRead,
  onMarkUnread,
  onDismiss,
  onMarkAllRead,
  isMarkingAllRead = false,
  footer,
  open,
  onOpenChange,
  ariaLabel = 'Notifications',
  className = '',
}: NotificationBellProps) {
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const resolvedUnreadCount = unreadCount ?? items.filter((item) => !item.read).length;
  const visibleItems = useMemo(
    () => (filter === 'unread' ? items.filter((item) => !item.read) : items),
    [filter, items],
  );

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      align="end"
      className="w-[calc(100vw-2rem)] max-w-96 overflow-hidden rounded-mo-lg border border-mo-grey-3 bg-mo-white shadow-mo-lg"
      trigger={
        <button
          type="button"
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          className={
            className ||
            'relative inline-flex h-10 w-10 items-center justify-center rounded-mo-sm text-mo-grey-8 transition-colors hover:bg-mo-grey-2'
          }
        >
          <Bell size={20} />
          {resolvedUnreadCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-mo-red px-1.5 py-0.5 text-mo-annotation font-semibold leading-none text-mo-white"
            >
              {resolvedUnreadCount > 99 ? '99+' : resolvedUnreadCount}
            </span>
          )}
        </button>
      }
    >
      <div role="dialog" aria-label={title} className="flex max-h-112 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-mo-grey-3 px-4 py-3">
          <h2 className="font-body text-sm font-semibold text-mo-black">{title}</h2>
          {onMarkAllRead && (
            <button
              type="button"
              onClick={onMarkAllRead}
              disabled={isMarkingAllRead || resolvedUnreadCount === 0}
              className="inline-flex items-center gap-1.5 rounded-mo-sm px-2 py-1 text-mo-annotation font-medium text-mo-grey-8 transition-colors hover:bg-mo-red-1 hover:text-mo-red disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isMarkingAllRead ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
              Mark all read
            </button>
          )}
        </header>

        <div role="tablist" aria-label={title} className="flex items-center gap-1 border-b border-mo-grey-3 px-4 py-2">
          <FilterTab isActive={filter === 'all'} label="All" onClick={() => setFilter('all')} />
          <FilterTab
            isActive={filter === 'unread'}
            label={resolvedUnreadCount > 0 ? `Unread (${resolvedUnreadCount > 99 ? '99+' : resolvedUnreadCount})` : 'Unread'}
            onClick={() => setFilter('unread')}
          />
        </div>

        {errorMessage && (
          <div role="status" aria-live="polite" className="border-b border-mo-grey-3 bg-mo-red-1 px-4 py-2 text-mo-annotation text-mo-red">
            {errorMessage}
          </div>
        )}

        <div role="list" className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8" aria-hidden="true">
              <Loader2 size={20} className="animate-spin text-mo-grey-6" />
            </div>
          ) : visibleItems.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-mo-grey-7">{emptyLabel}</p>
          ) : (
            visibleItems.map((item) => (
              <NotificationRow
                key={item.id}
                item={item}
                onSelect={onSelect}
                onMarkRead={onMarkRead}
                onMarkUnread={onMarkUnread}
                onDismiss={onDismiss}
              />
            ))
          )}
        </div>

        {footer && <footer className="flex items-center justify-between gap-2 border-t border-mo-grey-3 px-4 py-2 text-mo-annotation">{footer}</footer>}
      </div>
    </Popover>
  );
}

function FilterTab({ isActive, label, onClick }: { isActive: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={
        'rounded-mo-sm px-2.5 py-1 text-mo-annotation font-medium transition-colors ' +
        (isActive ? 'bg-mo-red-1 text-mo-red' : 'text-mo-grey-8 hover:bg-mo-grey-2')
      }
    >
      {label}
    </button>
  );
}

function NotificationRow({
  item,
  onSelect,
  onMarkRead,
  onMarkUnread,
  onDismiss,
}: {
  item: NotificationBellItem;
  onSelect?: (item: NotificationBellItem) => void;
  onMarkRead?: (id: string) => void;
  onMarkUnread?: (id: string) => void;
  onDismiss?: (id: string) => void;
}) {
  const isUnread = !item.read;

  return (
    <div
      role="listitem"
      tabIndex={0}
      onClick={() => onSelect?.(item)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect?.(item);
        }
      }}
      className={
        'group/item flex cursor-pointer items-start gap-3 border-b border-mo-grey-2 px-4 py-3 transition-colors last:border-b-0 hover:bg-mo-grey-2/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-mo-red ' +
        (isUnread ? 'bg-mo-red-1/40' : '')
      }
    >
      <div className="flex w-3 flex-shrink-0 items-center justify-center pt-1.5" aria-hidden="true">
        {isUnread && <span className="block h-2 w-2 rounded-full bg-mo-red" />}
      </div>

      {item.icon && (
        <div className={'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-mo-sm ' + (item.accentClassName ?? 'bg-mo-grey-2 text-mo-grey-8')}>
          {item.icon}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-body text-sm font-semibold text-mo-black">{item.title}</p>
        {item.body && <p className="mt-0.5 line-clamp-2 text-mo-annotation text-mo-grey-8">{item.body}</p>}
        {item.timestamp && <p className="mt-1 text-mo-annotation text-mo-grey-6">{item.timestamp}</p>}
      </div>

      <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover/item:opacity-100 group-focus-within/item:opacity-100">
        {isUnread && onMarkRead ? (
          <button
            type="button"
            aria-label="Mark as read"
            onClick={(event) => {
              event.stopPropagation();
              onMarkRead(item.id);
            }}
            className="inline-flex h-6 w-6 items-center justify-center rounded-mo-sm text-mo-grey-7 hover:bg-mo-grey-3"
          >
            <Check size={13} />
          </button>
        ) : null}
        {!isUnread && onMarkUnread ? (
          <button
            type="button"
            aria-label="Mark as unread"
            onClick={(event) => {
              event.stopPropagation();
              onMarkUnread(item.id);
            }}
            className="inline-flex h-6 w-6 items-center justify-center rounded-mo-sm text-mo-grey-7 hover:bg-mo-grey-3"
          >
            <span className="block h-2 w-2 rounded-full border border-current" />
          </button>
        ) : null}
        {onDismiss && (
          <button
            type="button"
            aria-label="Dismiss"
            onClick={(event) => {
              event.stopPropagation();
              onDismiss(item.id);
            }}
            className="inline-flex h-6 w-6 items-center justify-center rounded-mo-sm text-mo-grey-7 hover:bg-mo-grey-3"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
