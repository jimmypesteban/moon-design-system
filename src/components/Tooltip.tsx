'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** Tooltip content shown on hover/focus */
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: TooltipPlacement;
  disabled?: boolean;
  /** Allow multi-line content (capped width) instead of the one-line default. */
  wrap?: boolean;
  /** Extra classes on the floating label. */
  className?: string;
  /** Extra classes on the inline wrapper around `children` (e.g. `shrink-0`). */
  wrapperClassName?: string;
  /**
   * Render the label already showing.
   *
   * The label opens on hover or focus, neither of which a still image can do —
   * so without this there was no way to document what a Tooltip looks like, and
   * the component index showed its trigger with no label attached. Uncontrolled:
   * this is the initial state, and hovering away still dismisses it.
   */
  defaultOpen?: boolean;
}

/** Hover-intent delay before the label appears. */
const SHOW_DELAY_MS = 150;

/**
 * The label anchors to one edge of the trigger and shifts itself by its own
 * size via transform, so it never has to be measured before positioning.
 */
const PLACEMENT_TRANSFORM: Record<TooltipPlacement, string> = {
  top: 'translate(-50%, -100%)',
  bottom: 'translate(-50%, 0)',
  left: 'translate(-100%, -50%)',
  right: 'translate(0, -50%)',
};

function anchorPoint(rect: DOMRect, placement: TooltipPlacement) {
  const gap = 8;
  switch (placement) {
    case 'top':
      return { top: rect.top - gap, left: rect.left + rect.width / 2 };
    case 'bottom':
      return { top: rect.bottom + gap, left: rect.left + rect.width / 2 };
    case 'left':
      return { top: rect.top + rect.height / 2, left: rect.left - gap };
    case 'right':
      return { top: rect.top + rect.height / 2, left: rect.right + gap };
  }
}

/**
 * Tooltip — hover/focus-triggered label, used across the admin and
 * consumer apps for icon-only buttons and truncated text.
 *
 * The label is rendered through a portal with `position: fixed`, so it
 * escapes `overflow` clipping and sticky-cell stacking contexts — the two
 * environments (scrollable tables, sticky headers) where the previous
 * CSS-only absolute-positioned version was clipped or painted underneath
 * its neighbours. It mounts only while shown, appears after a short
 * hover-intent delay, and hides on any scroll or resize rather than trying
 * to track its anchor.
 *
 * @example
 * ```tsx
 * <Tooltip content="Delete class">
 *   <button><Trash2 size={18} /></button>
 * </Tooltip>
 * ```
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  disabled = false,
  wrap = false,
  className = '',
  wrapperClassName = '',
  defaultOpen = false,
}: TooltipProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [point, setPoint] = useState<{ top: number; left: number } | null>(null);
  const [clampedLeft, setClampedLeft] = useState<number | null>(null);

  const clearTimer = () => {
    if (showTimer.current) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
  };
  const hide = () => {
    clearTimer();
    setPoint(null);
    setClampedLeft(null);
  };
  const showSoon = () => {
    clearTimer();
    showTimer.current = setTimeout(() => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (rect) setPoint(anchorPoint(rect, placement));
    }, SHOW_DELAY_MS);
  };

  useEffect(() => clearTimer, []);

  // Anchored on mount rather than on an event, since there is no event to wait
  // for. useLayoutEffect so the label is positioned before first paint instead
  // of appearing at the naive centred spot and jumping.
  useLayoutEffect(() => {
    if (!defaultOpen) return;
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) setPoint(anchorPoint(rect, placement));
  }, [defaultOpen, placement]);

  // Viewport clamping for top/bottom placements: the label centres itself on
  // the trigger, so near a viewport edge half of it would hang off-screen.
  // First paint is invisible at the naive centred spot; this measures the real
  // width and pins an explicit `left` inside the viewport. Runs once per show
  // (deps are the anchor snapshot), so a zero-size rect (jsdom) cannot loop.
  const horizontal = placement === 'top' || placement === 'bottom';
  useLayoutEffect(() => {
    if (!point || !horizontal) return;
    const width = panelRef.current?.getBoundingClientRect().width ?? 0;
    const margin = 8;
    const max = window.innerWidth - margin - width;
    setClampedLeft(Math.max(margin, Math.min(point.left - width / 2, max)));
  }, [point, horizontal]);

  // A fixed-position label is anchored to a snapshot of the trigger's rect;
  // any scroll or resize invalidates it, so hide instead of chasing it.
  useEffect(() => {
    if (!point) return;
    const dismiss = () => setPoint(null);
    window.addEventListener('scroll', dismiss, true);
    window.addEventListener('resize', dismiss);
    return () => {
      window.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('resize', dismiss);
    };
  }, [point]);

  if (disabled) return children;

  return (
    <span
      ref={wrapperRef}
      className={['inline-block', wrapperClassName].filter(Boolean).join(' ')}
      onMouseEnter={showSoon}
      onMouseLeave={hide}
      onFocus={showSoon}
      onBlur={hide}
    >
      {children}
      {point &&
        createPortal(
          <span
            ref={panelRef}
            role="tooltip"
            style={{
              position: 'fixed',
              top: point.top,
              left: horizontal ? (clampedLeft ?? point.left) : point.left,
              transform:
                horizontal && clampedLeft !== null
                  ? placement === 'top'
                    ? 'translateY(-100%)'
                    : undefined
                  : PLACEMENT_TRANSFORM[placement],
              visibility: horizontal && clampedLeft === null ? 'hidden' : undefined,
            }}
            className={[
              'pointer-events-none z-50 rounded-mo-sm bg-mo-black px-2.5 py-1.5 text-mo-annotation font-body text-mo-white shadow-mo-md',
              wrap ? 'w-max max-w-70 whitespace-normal text-left' : 'whitespace-nowrap',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {content}
          </span>,
          document.body
        )}
    </span>
  );
}
