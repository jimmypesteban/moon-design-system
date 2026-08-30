'use client';

import React, { cloneElement, isValidElement, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface DropdownItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** Renders in mo-red — for destructive actions (e.g. "Delete class") */
  danger?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

export type DropdownAlign = 'start' | 'end';

export interface DropdownProps {
  items: DropdownItem[];
  /** The trigger element — receives an onClick that toggles the menu, plus aria attributes */
  children: React.ReactElement;
  /** Which edge of the trigger the menu's own edge aligns to (default: "start") */
  align?: DropdownAlign;
  className?: string;
  /**
   * Render the menu already open.
   *
   * The menu opens on click, which a still image cannot do — so there was no way
   * to document what the menu looks like, and the component index showed only
   * the trigger. Uncontrolled: this is the initial state, and clicking away
   * still closes it.
   */
  defaultOpen?: boolean;
}

interface TriggerProps {
  onClick?: (e: React.MouseEvent) => void;
  'aria-haspopup'?: React.AriaAttributes['aria-haspopup'];
  'aria-expanded'?: boolean;
}

interface MenuPosition {
  top: number;
  left?: number;
  right?: number;
}

/**
 * Dropdown — a trigger that opens a floating menu of actions, used across
 * the admin and consumer apps. Not to be confused with `Select`, which is
 * a native `<select>` for choosing a single value from a list.
 *
 * The menu portals to `document.body` and is positioned from the trigger's
 * real screen coordinates (like `Modal`) instead of `position: absolute`
 * inside the trigger's own wrapper — an ordinary absolutely-positioned menu
 * gets silently clipped by the first `overflow: hidden`/`auto` ancestor
 * (e.g. a scrollable table row, a card, or Storybook's own docs canvas).
 *
 * Closes on outside click, Escape, or selecting an item.
 *
 * @example
 * ```tsx
 * <Dropdown items={[
 *   { key: 'rename', label: 'Rename', onSelect: rename },
 *   { key: 'delete', label: 'Delete', danger: true, onSelect: remove },
 * ]}>
 *   <Button variant="tertiary" size="sm">Actions</Button>
 * </Dropdown>
 * ```
 */
export function Dropdown({
  items,
  children,
  align = 'start',
  className = '',
  defaultOpen = false,
}: DropdownProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition(
      align === 'end'
        ? { top: rect.bottom + 4, right: window.innerWidth - rect.right }
        : { top: rect.bottom + 4, left: rect.left }
    );
  };

  useLayoutEffect(() => {
    if (open) updatePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, align]);

  // Clamp against the viewport once the menu has actually rendered (and
  // therefore has a real width) — a trigger near the left/right edge would
  // otherwise push the menu partly or fully off-screen.
  useLayoutEffect(() => {
    if (!open || !position) return;
    const menuEl = menuRef.current;
    if (!menuEl) return;
    const margin = 8;
    const rect = menuEl.getBoundingClientRect();
    let left = rect.left;
    if (rect.right > window.innerWidth - margin) left = window.innerWidth - margin - rect.width;
    if (left < margin) left = margin;
    if (left !== rect.left) {
      setPosition({ top: position.top, left });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, position]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const handleReposition = () => updatePosition();

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const trigger = isValidElement<TriggerProps>(children)
    ? cloneElement(children, {
        ref: triggerRef,
        onClick: (e: React.MouseEvent) => {
          children.props.onClick?.(e);
          setOpen((prev) => !prev);
        },
        'aria-haspopup': 'menu',
        'aria-expanded': open,
      } as Partial<TriggerProps> & { ref: React.Ref<HTMLElement> })
    : children;

  return (
    <span className={['inline-block font-body', className].filter(Boolean).join(' ')}>
      {trigger}
      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: 'fixed', top: position.top, left: position.left, right: position.right }}
            className="z-50 min-w-45 overflow-hidden rounded-mo-sm border border-mo-black/10 bg-white py-1 shadow-md"
          >
            {items.map((item) => (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onSelect?.();
                  setOpen(false);
                }}
                className={[
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                  'disabled:opacity-40 disabled:pointer-events-none',
                  item.danger ? 'text-mo-red hover:bg-mo-red/10' : 'text-mo-black hover:bg-mo-white',
                ].join(' ')}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </span>
  );
}
