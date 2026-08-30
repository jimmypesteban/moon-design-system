'use client';

import React from 'react';
import { Loader2 } from '../icons';

export type ButtonVariant = 'primary' | 'highlight' | 'secondary' | 'tertiary' | 'danger' | 'ghost' | 'link' | 'outline' | 'soft' | 'info' | 'accent';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Corner radius, named for the shared radius tokens rather than for a visual
 * adjective, so a call site can say which step of the scale it wants:
 *
 * | value       | token            | px   |
 * |-------------|------------------|------|
 * | `default`   | `rounded-mo-sm`  | 12   |
 * | `md`        | `rounded-mo-md`  | 16   |
 * | `lg`        | `rounded-mo-lg`  | 24   |
 * | `pill`      | `rounded-mo-full`| full |
 *
 * `default` is what every admin and teacher surface uses. `pill` is reserved
 * for student-facing UI, where the pill is the established shape. `md`/`lg`
 * exist because consuming apps legitimately use the larger steps — the consumer
 * app renders modal and hero CTAs at 24px — and before this they had no way to
 * reach them through Button, so those buttons had to stay hand-rolled.
 *
 * These are props rather than something a call site overrides with
 * `className="rounded-xl"`, because Button composes its classes by joining
 * strings and this package has no tailwind-merge: a conflicting radius utility
 * from `className` would not reliably win — both radii get emitted and the
 * winner depends on Tailwind's own CSS ordering, not the order they were
 * written. A named value also records WHICH step was intended, which a bare
 * utility repeated across call sites does not.
 *
 * Note the deliberate overlap with `size`: `size` controls padding and text,
 * `shape` controls corners only. They are independent.
 */
export type ButtonShape = 'default' | 'md' | 'lg' | 'pill';

const SHAPE_CLASSES: Record<ButtonShape, string> = {
  default: 'rounded-mo-sm',
  md: 'rounded-mo-md',
  lg: 'rounded-mo-lg',
  pill: 'rounded-mo-full',
};

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  /** Icon rendered before the label */
  leftIcon?: React.ReactNode;
  /** Icon rendered after the label */
  rightIcon?: React.ReactNode;
  /** Shows a spinner and disables the button */
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  /**
   * Render Button's classes onto its child element instead of a `<button>`
   * — for a navigational CTA that must stay a real `<a>`/`next/link`
   * `Link` (client-side routing, prefetch) rather than a `<button>` with
   * an `onClick={() => router.push(...)}` workaround. The single child
   * keeps its own `href`/props; Button only merges its computed
   * className and wraps `leftIcon`/`rightIcon` around the child's
   * existing children.
   *
   * @example
   * ```tsx
   * <Button asChild variant="danger" leftIcon={<Plus size={18} />}>
   *   <Link href="/admin/activities/create">Create Activity</Link>
   * </Button>
   * ```
   */
  asChild?: boolean;
}

// Filled variants follow the source design system's state pattern: default
// = ramp step 6, hover = step 5 (lighter), active/pressed = step 7 (darker).
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // Brand yellow. Named for the colour's brand role ("backgrounds,
  // highlights") rather than for rank: it was called `primary` and was not
  // the primary action anywhere — 0 uses on /admin, where the red `danger`
  // fill is the main CTA 44 times. `primary` is freed here so it can mean
  // the brand's actual primary action; every existing call site is converted
  // in the same change, so nothing shifts colour.
  // Brand red — the primary action on every product surface. Visually
  // identical to `danger` because the brand has one red; they are kept
  // apart because they mean different things, and a destructive action
  // should not have to be spelled `primary`. Prefer `primary` for the main
  // CTA and reserve `danger` for destructive ones.
  primary: 'bg-mo-red hover:bg-mo-red-5 active:bg-mo-red-7 text-mo-white',
  highlight: 'bg-mo-yellow hover:bg-mo-yellow-5 active:bg-mo-yellow-7 text-mo-black',
  secondary: 'bg-mo-blue hover:bg-mo-blue-5 active:bg-mo-blue-7 text-mo-white',
  tertiary: 'bg-mo-grey-7 hover:bg-mo-grey-6 active:bg-mo-grey-8 text-mo-white',
  danger: 'bg-mo-red hover:bg-mo-red-5 active:bg-mo-red-7 text-mo-white',
  ghost: 'bg-transparent border border-mo-red text-mo-red hover:bg-mo-red/10 active:bg-mo-red/20',
  link: 'bg-transparent text-mo-red hover:underline p-0!',
  // Neutral action that isn't the primary CTA and isn't destructive/red —
  // e.g. "Import from Google Classroom" next to a red "Create Class".
  //
  // The background is transparent rather than a fixed colour, because there
  // is no single right one: both /admin and /teacher are cream pages
  // (#F5F4F0) carrying white cards, so `bg-white` is correct on a card and
  // visibly off on the page, and `bg-mo-white` is the reverse. Inheriting
  // the surface is right on both, and drops a pure #FFF the brand guide
  // does not allow. (For the record: mo-grey-1 IS pure white — the earlier
  // note here that no such token exists was wrong.)
  //
  // The border is the brand's neutral hairline, not gray-300 — measured
  // usage across the apps ran hundreds of brand-neutral borders against a
  // handful of cool gray, so gray-300 was the outlier rather than the
  // standard.
  outline: 'border border-mo-grey-3 bg-transparent text-mo-black hover:bg-mo-black/5 active:bg-mo-black/10',
  // Tinted/filled-light version of `ghost` — a secondary action that still
  // reads as "red" (e.g. an upload/import tied to a destructive-adjacent
  // flow) without the visual weight of a fully solid `danger` button.
  // Same story: found already hand-rolled (light pink fill + red border)
  // on an admin page with no equivalent variant to use instead.
  soft: 'border border-mo-red/30 bg-mo-red-1 text-mo-red hover:bg-mo-red-2 active:bg-mo-red-2/80',
  // Tinted informational/preview action — not brand-red, not a status
  // color. Found hand-rolled identically across 4 real usages (admin
  // "Enter Student Mode", "Regenerate summaries", tutor "Classroom" links)
  // with no shared variant to reach for. Was plain Tailwind violet on the
  // grounds that the brand has no violet; it has mo-purple (#4C1C75), and
  // being on-brand beats matching a Tailwind default, so this is that ramp
  // now. Visibly a different hue, not a tweak.
  info: 'bg-mo-purple-1 hover:bg-mo-purple-2 text-mo-purple-7',
  // Solid violet — the established primary-action color for the
  // one-on-one/tutoring and calibration product areas specifically, not a
  // brand-red substitute. Found hand-rolled identically (bg-violet-600) as
  // the main CTA across one-on-one, tutors, and calibration pages, each
  // with no shared variant to reach for. `info` is this same hue as a
  // light tint, not a solid fill — parallel to how `soft` is to `danger`.
  accent: 'bg-mo-purple hover:bg-mo-purple-5 active:bg-mo-purple-7 text-mo-white',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  // Dense row actions — table Save/Cancel, roster row controls. Added for
  // the teacher surface, where 74 buttons sit at px-2.5 py-1 / px-3 py-1,
  // below what `sm` (px-3 py-1.5) can express.
  xs: 'px-2.5 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-mo-body gap-2',
  lg: 'px-5 py-2.5 text-mo-body gap-2',
  xl: 'px-6 py-3 text-mo-body-lg gap-2.5',
};

const ICON_SIZE: Record<ButtonSize, number> = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 20,
};

/**
 * Button — the primary action control, used across the admin and consumer apps.
 *
 * Variant colors follow the source design system's state pattern (default =
 * ramp step 6, hover = step 5, active = step 7). `ghost` and `link` are
 * simplified from the source system's separate ghost-color/ghost-gray/
 * ghost-gray-2 and link-color/link-gray/link-danger variants — expand if a
 * distinct one is actually needed. `outline` and `soft` were added later,
 * reconciled against real hand-rolled buttons found across admin pages
 * rather than against the reference design file (not consulted for this pass) — treat their
 * exact hex/opacity values as a considered best-effort, not a confirmed
 * source-of-truth match.
 *
 * Font weight is `font-medium`, not bold — every real button across the
 * codebase (dozens of hand-rolled ones, audited directly) already used
 * `font-medium`; this component originally shipped `font-bold` and was
 * the outlier, not them.
 *
 * @example
 * ```tsx
 * <Button variant="primary">Save changes</Button>
 * <Button variant="danger" size="sm" loading={isDeleting}>Delete</Button>
 * <Button variant="outline" leftIcon={<Download size={18} />}>Import</Button>
 * <Button asChild variant="danger" leftIcon={<Plus size={18} />}>
 *   <Link href="/admin/activities/create">Create Activity</Link>
 * </Button>
 * ```
 */
export function Button({
  variant = 'primary',
  size = 'md',
  shape = 'default',
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  asChild = false,
  ...buttonProps
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const classes = [
    // whitespace-nowrap: a flex-item Button is allowed to shrink below its
    // label's full-phrase width by default (down to its longest single word,
    // since text can wrap at spaces) — a squeezed sibling row would rather
    // wrap the label across 2-3 lines than let the row reflow. This forces
    // the label to stay one line, so a squeeze shows as overflow/reflow at
    // the container level (visible, obviously fixable) instead of silently
    // inflating one button's height relative to its siblings.
    'inline-flex items-center justify-center whitespace-nowrap font-body font-medium transition-colors',
    SHAPE_CLASSES[shape],
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mo-blue/40',
    // Plain conditional classes, not `disabled:*` pseudo-classes — `isDisabled`
    // is already known here in JS, and `disabled:*` would never match on an
    // asChild-rendered anchor anyway (an <a> has no `disabled` attribute).
    isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
    fullWidth ? 'w-full' : '',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const icon = loading ? <Loader2 size={ICON_SIZE[size]} className="animate-spin" /> : leftIcon;

  if (asChild) {
    // aria-disabled + tabIndex, not the `disabled` attribute — an anchor
    // has no such attribute, and `isDisabled` already drove the plain
    // (non-pseudo-class) opacity/cursor classes above.
    const child = React.Children.only(children) as React.ReactElement<{
      className?: string;
      children?: React.ReactNode;
    }>;
    return React.cloneElement(child, {
      ...buttonProps,
      className: [classes, child.props.className].filter(Boolean).join(' '),
      ...(isDisabled ? { 'aria-disabled': true, tabIndex: -1 } : {}),
      children: (
        <>
          {icon}
          {child.props.children}
          {!loading && rightIcon}
        </>
      ),
    } as React.Attributes);
  }

  return (
    <button className={classes} disabled={isDisabled} {...buttonProps}>
      {icon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
