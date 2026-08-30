'use client';

import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDismissFloating, useFloatingPosition, type FloatingAlign } from '../internal/useFloatingPosition';

export interface PopoverProps {
  /** The trigger element — receives no props, just wrap whatever should open the popover */
  trigger: React.ReactNode;
  /** Popover body content */
  children: React.ReactNode;
  /** Controlled open state. Omit to let Popover manage its own state via the trigger click. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: FloatingAlign;
  className?: string;
}

/**
 * Popover — generic floating panel anchored to a trigger, for richer
 * content than `Tooltip` handles (a form, a list of actions, a settings
 * panel) — not just a text hint. Shares the same portal + viewport-clamped
 * positioning as `DatePicker`/`TimePicker` via `useFloatingPosition`.
 * Usable controlled (pass `open`/`onOpenChange`) or uncontrolled (omit
 * both — the trigger's own click toggles it).
 *
 * @example
 * ```tsx
 * <Popover trigger={<Button>Actions</Button>}>
 *   <div className="flex flex-col gap-2 p-3">
 *     <button onClick={rename}>Rename</button>
 *     <button onClick={remove}>Delete</button>
 *   </div>
 * </Popover>
 * ```
 */
export function Popover({ trigger, children, open: openProp, onOpenChange, align = 'start', className = '' }: PopoverProps) {
  const [openState, setOpenState] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : openState;

  const setOpen = (next: boolean) => {
    if (!isControlled) setOpenState(next);
    onOpenChange?.(next);
  };

  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const position = useFloatingPosition(open, triggerRef, panelRef, align);
  useDismissFloating(open, () => setOpen(false), triggerRef, panelRef);

  return (
    <>
      <div ref={triggerRef} onClick={() => setOpen(!open)} className="inline-block">
        {trigger}
      </div>
      {open &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            style={{ position: 'fixed', top: position.top, left: position.left, right: position.right }}
            className={['z-50 min-w-40 rounded-mo-sm border border-mo-black/10 bg-white font-body shadow-mo-popup', className]
              .filter(Boolean)
              .join(' ')}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
}
