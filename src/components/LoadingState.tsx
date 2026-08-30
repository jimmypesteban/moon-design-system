import React from 'react';

export type LoadingStateSize = 'xs' | 'sm' | 'md' | 'lg';

export interface LoadingScreenProps {
  /** Accessible label announced to screen readers via aria-live */
  message?: string;
  className?: string;
}

export interface LoadingPanelProps {
  message?: string;
  className?: string;
  size?: Exclude<LoadingStateSize, 'xs'>;
}

export interface LoadingInlineProps {
  message?: string;
  className?: string;
  size?: LoadingStateSize;
  /** Visible label — falls back to `message` if omitted; pass nothing for icon-only */
  children?: React.ReactNode;
}

export interface LoadingButtonLabelProps {
  className?: string;
  size?: Exclude<LoadingStateSize, 'lg'>;
  children?: React.ReactNode;
}

const DEFAULT_MESSAGE = 'Loading…';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

// The Moon crescent, redrawn inline as loader artwork (same geometry as
// logos.ts' mark assets) so the loader needs no asset request.

const BLOCK_SIZE_PX: Record<LoadingStateSize, number> = { xs: 12, sm: 14, md: 18, lg: 24 };
const BLOCK_HEIGHT_SCALE: Record<'red' | 'yellow' | 'orange', number> = { red: 0.65, yellow: 1.15, orange: 0.9 };
const BLOCK_WIDTH_SCALE: Record<'red' | 'yellow' | 'orange', number> = { red: 1.7, yellow: 0.85, orange: 1.1 };
const BLOCK_COLOR_CLASS: Record<'red' | 'yellow' | 'orange', string> = {
  red: 'bg-mo-red',
  yellow: 'bg-mo-yellow',
  orange: 'bg-mo-orange',
};
const BLOCK_ORDER: Array<'red' | 'yellow' | 'orange' | 'yellow'> = ['red', 'yellow', 'orange', 'yellow'];
const BLOCK_DELAY_MS = [0, 80, 180, 260];

function LoadingBlocks({ size }: { size: LoadingStateSize }) {
  const unit = BLOCK_SIZE_PX[size];
  return (
    <div className="flex items-end justify-center gap-1" aria-hidden="true">
      {BLOCK_ORDER.map((color, i) => (
        <span
          key={i}
          className={cx('animate-bounce rounded-full', BLOCK_COLOR_CLASS[color])}
          style={{
            width: unit * BLOCK_WIDTH_SCALE[color],
            height: unit * BLOCK_HEIGHT_SCALE[color],
            animationDelay: `${BLOCK_DELAY_MS[i]}ms`,
          }}
        />
      ))}
    </div>
  );
}

function LoadingFace({ widthPx }: { widthPx: number }) {
  return (
    <svg viewBox="0 0 48 48" width={widthPx} height={widthPx} className="animate-pulse text-mo-red" aria-hidden="true">
      <path
        d="M29.5 5.05A20 20 0 1 0 29.5 42.95A24.6 24.6 0 0 1 20.5 24A24.6 24.6 0 0 1 29.5 5.05Z"
        fill="currentColor"
      />
      <circle cx="35" cy="13" r="3.2" fill="currentColor" />
    </svg>
  );
}

/**
 * LoadingState — the branded Moon loading family, in four contexts: a
 * fullscreen route loader, a panel-sized in-content loader, a compact
 * inline loader (e.g. next to a heading while a section refreshes), and an
 * in-button label. Reconciles the pattern several apps had already
 * standardized independently (see e.g. the consumer app's
 * `MoonLoadingScreen.tsx`) into one shared component, using the same real
 * mascot face artwork as `Logo`'s mark, animated with Tailwind's stock
 * `animate-bounce`/`animate-pulse` rather than a custom keyframe set (same
 * convention as `Spinner`/`Skeleton`).
 *
 * @example
 * ```tsx
 * <LoadingScreen />
 * <LoadingPanel size="sm" message="Fetching your classes…" />
 * <LoadingInline size="sm">Saving…</LoadingInline>
 * <Button disabled><LoadingButtonLabel>Submitting…</LoadingButtonLabel></Button>
 * ```
 */
export function LoadingScreen({ message = DEFAULT_MESSAGE, className = '' }: LoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={cx(
        'relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-mo-white p-8',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          // Plain rgba over the two brand hexes (mo-yellow/mo-orange DEFAULT
          // from tokens.mjs) rather than a generated Tailwind CSS variable —
          // this package's own Tailwind v4 @config compat layer is known to
          // silently drop some custom theme keys (see tailwind.config.js),
          // so a literal value here is the safe bet.
          background:
            'radial-gradient(circle at 15% 20%, rgba(255, 199, 0, 0.16), transparent 30%), radial-gradient(circle at 85% 80%, rgba(243, 116, 0, 0.18), transparent 35%)',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 grid place-content-center justify-items-center gap-4 text-center">
        <LoadingFace widthPx={72} />
        <LoadingBlocks size="lg" />
      </div>
    </div>
  );
}

export function LoadingPanel({ message = DEFAULT_MESSAGE, className = '', size = 'md' }: LoadingPanelProps) {
  const facePx = { sm: 40, md: 56, lg: 72 }[size];
  const padding = { sm: 'py-7', md: 'py-10', lg: 'py-12' }[size];
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={cx('grid w-full place-content-center justify-items-center gap-4 text-center', padding, className)}
    >
      <LoadingFace widthPx={facePx} />
      <LoadingBlocks size={size} />
    </div>
  );
}

export function LoadingInline({ message = DEFAULT_MESSAGE, className = '', size = 'sm', children }: LoadingInlineProps) {
  const facePx = { xs: 16, sm: 18, md: 22, lg: 26 }[size];
  const label = children ?? null;
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={message}
      className={cx('inline-flex items-center gap-2 align-middle leading-none', className)}
    >
      <LoadingFace widthPx={facePx} />
      {label ? <span className="text-sm font-semibold leading-tight">{label}</span> : null}
    </span>
  );
}

export function LoadingButtonLabel({ className = '', size = 'sm', children }: LoadingButtonLabelProps) {
  const facePx = { xs: 12, sm: 16, md: 18 }[size];
  return (
    <span className={cx('inline-flex items-center justify-center gap-1.5 leading-none', className)}>
      <LoadingFace widthPx={facePx} />
      {children ? <span className="leading-tight">{children}</span> : null}
    </span>
  );
}
