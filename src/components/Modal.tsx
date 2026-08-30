'use client';

import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from '../icons';
import { Button } from './Button';
import type { ButtonVariant } from './Button';

export type ModalAudience = 'student' | 'admin';
export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Title displayed in the header, in the brand heading font */
  title?: string;
  children: React.ReactNode;
  /** Optional footer content (usually actions/buttons) */
  footer?: React.ReactNode;
  /**
   * Which surface this modal renders on.
   * - "student": softer, more rounded corners (`rounded-mo-md`)
   * - "admin": compact corners (`rounded-mo-sm`, the brand's `radius-sm`) — default
   */
  audience?: ModalAudience;
  size?: ModalSize;
  /** Close when clicking the overlay (default: true) */
  closeOnOverlayClick?: boolean;
  /**
   * Drops the header's ✕ while keeping the title (and the `aria-labelledby`
   * that comes with it).
   *
   * For a dialog whose footer already carries an explicit dismissal. The ✕ is
   * the first focusable node inside the panel, so opening puts the focus ring
   * on it — which makes the loudest thing in the header the one control nobody
   * came for, and hands `Enter` to a third way of doing what Cancel does.
   * Escape and the overlay still close.
   */
  hideCloseButton?: boolean;
}

const SHAPE_CLASSES: Record<ModalAudience, string> = {
  student: 'rounded-mo-md',
  admin: 'rounded-mo-sm',
};

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Modal — dialog overlay with a title, body, and optional footer actions, used
 * across the admin and consumer apps. Closes on Escape or an overlay click.
 *
 * @example
 * ```tsx
 * <Modal open={isOpen} onClose={close} title="Delete class?" footer={<Button variant="danger">Delete</Button>}>
 *   This can't be undone.
 * </Modal>
 * ```
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  audience = 'admin',
  size = 'md',
  closeOnOverlayClick = true,
  hideCloseButton = false,
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    // Hand focus back to whatever opened the dialog. Without this, closing drops
    // focus to <body> and a keyboard user restarts their tab journey from the top
    // of the page.
    const returnTo =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusables = () => {
      const root = dialogRef.current;
      if (!root) return [] as HTMLElement[];
      return Array.from(
        root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // `aria-modal` is a promise that focus cannot leave the dialog; a trap is
      // what makes the promise true.
      if (e.key !== 'Tab') return;
      const root = dialogRef.current;
      if (!root) return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        root.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!root.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Land on the first real control rather than the panel, so the first Tab
    // moves forward instead of re-entering the dialog from the top.
    //
    // Deferred by one macrotask, not called inline: when this Modal opens in
    // the same commit that unmounts a Radix dialog — a `cmdk` command palette
    // handing over to a confirmation, say — Radix's `FocusScope` cleanup
    // restores focus to whatever was focused before *it* opened, and it does
    // that inside its own `setTimeout(…, 0)`. Focusing inline here runs first
    // and is then silently undone, leaving the dialog open with focus on
    // `document.body`: Enter does nothing and the first Tab walks the page
    // behind the overlay. Scheduling after Radix's timer wins the exchange.
    const focusTimer = setTimeout(() => {
      (focusables()[0] ?? dialogRef.current)?.focus();
    }, 0);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      const active = document.activeElement;
      if (!active || active === document.body || dialogRef.current?.contains(active)) {
        returnTo?.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-mo-black/50 p-4"
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={[
          // Capped and flexed so the header and footer stay put and only the
          // body scrolls — otherwise a tall body pushes the footer's actions
          // past the edge of the screen with no way to reach them.
          'flex max-h-[85vh] w-full flex-col overflow-hidden bg-white font-body shadow-lg outline-none',
          SHAPE_CLASSES[audience],
          SIZE_CLASSES[size],
        ].join(' ')}
      >
        {title && (
          <div className="flex shrink-0 items-center justify-between border-b border-mo-black/10 px-5 py-4">
            <h2 id={titleId} className="font-heading text-mo-body-lg font-bold text-mo-black">
              {title}
            </h2>
            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-full p-1 text-mo-black/50 hover:bg-mo-white hover:text-mo-black"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4 text-mo-black">{children}</div>
        {footer && <div className="flex shrink-0 justify-end gap-2 border-t border-mo-black/10 bg-mo-white px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** Called when the dialog is dismissed WITHOUT confirming — the Cancel button, Escape, or an overlay click. `onClose` still fires either way. */
  onCancel?: () => void;
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  /** Any Button variant works, but 'primary' or 'danger' are the two that make sense for a confirmation */
  confirmVariant?: ButtonVariant;
  confirmDisabled?: boolean;
  audience?: ModalAudience;
}

/**
 * ConfirmDialog — the "are you sure?" preset built on `Modal`, for the
 * pattern several apps had already reinvented independently on top of
 * their own local Modal (e.g. the consumer app's `ConfirmModal`, used across
 * 14+ files as its de facto confirm pattern).
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={isOpen}
 *   onClose={close}
 *   onConfirm={handleDelete}
 *   title="Delete class?"
 *   message="This can't be undone."
 *   confirmText="Delete"
 *   confirmVariant="danger"
 * />
 * ```
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  onCancel,
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  confirmDisabled = false,
  audience,
}: ConfirmDialogProps) {
  function handleConfirm() {
    onConfirm();
    onClose();
  }

  function handleCancel() {
    onCancel?.();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      title={title}
      size="sm"
      audience={audience}
      footer={
        <>
          <Button variant="secondary" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} disabled={confirmDisabled} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </>
      }
    >
      {message}
    </Modal>
  );
}

export interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: React.ReactNode;
  closeText?: string;
  audience?: ModalAudience;
}

/**
 * AlertDialog — a single-button acknowledgement preset built on `Modal`,
 * for a message that just needs an "OK" rather than a confirm/cancel
 * choice (see the consumer app's `AlertModal` for the same pattern built on
 * its own local Modal).
 *
 * @example
 * ```tsx
 * <AlertDialog open={isOpen} onClose={close} title="Upload failed" message="That file is too large." />
 * ```
 */
export function AlertDialog({ open, onClose, title = 'Error', message, closeText = 'OK', audience }: AlertDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" audience={audience} footer={<Button onClick={onClose}>{closeText}</Button>}>
      {message}
    </Modal>
  );
}
