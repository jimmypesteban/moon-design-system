'use client';

import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';

export type FloatingAlign = 'start' | 'end';

export interface FloatingPosition {
  top: number;
  left?: number;
  right?: number;
}

/**
 * Shared positioning logic for portal-rendered floating panels (Dropdown menus,
 * DatePicker/TimePicker popovers) anchored to a trigger element. Computes a
 * `position: fixed` position from the trigger's `getBoundingClientRect()`,
 * clamps it back inside the viewport on both axes once the panel has actually
 * rendered (neither its real width nor its real height is known before then),
 * and recomputes on open/scroll/resize.
 */
export function useFloatingPosition(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  align: FloatingAlign = 'start'
) {
  const [position, setPosition] = useState<FloatingPosition | null>(null);

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

  useLayoutEffect(() => {
    if (!open || !position) return;
    const panelEl = panelRef.current;
    const triggerRect = triggerRef.current?.getBoundingClientRect();
    if (!panelEl || !triggerRect) return;
    const margin = 8;
    const rect = panelEl.getBoundingClientRect();

    let left = rect.left;
    if (rect.right > window.innerWidth - margin) left = window.innerWidth - margin - rect.width;
    if (left < margin) left = margin;

    // Vertical clamp mirrors the horizontal one above, but a plain clamp isn't
    // enough on its own: sliding a panel up to fit can tuck it behind its own
    // trigger. Flip above the trigger instead when that's actually where the
    // room is; only fall back to a plain clamp when neither side fully fits
    // (the panel is taller than the viewport has room for either way).
    let top = position.top;
    if (rect.bottom > window.innerHeight - margin) {
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      top =
        spaceAbove > spaceBelow && spaceAbove >= rect.height + margin
          ? triggerRect.top - rect.height - 4
          : Math.max(margin, window.innerHeight - rect.height - margin);
    }

    // Both guards are needed, on each axis. `left !== rect.left` (`top !==
    // rect.top`) is the useful one — nothing to clamp, nothing to write.
    // `!== position.left` (`.top`) is the termination guard: this effect
    // re-runs on its own `setPosition`, and it converges only because the
    // browser then reports the panel at the position we just wrote. Where a
    // measurement never reflects the applied style (jsdom returns a zero rect
    // for every element), the first guard stays true forever and the panel
    // re-renders until React aborts with "Maximum update depth exceeded".
    const leftChanged = left !== rect.left && left !== position.left;
    const topChanged = top !== rect.top && top !== position.top;
    if (leftChanged || topChanged) {
      setPosition({ top, left });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, position]);

  useEffect(() => {
    if (!open) return;
    const handleReposition = () => updatePosition();
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return position;
}

/** Shared outside-click + Escape handling for open floating panels. */
export function useDismissFloating(
  open: boolean,
  onDismiss: () => void,
  triggerRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      onDismiss();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}
