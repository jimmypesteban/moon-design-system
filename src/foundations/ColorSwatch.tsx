import { useEffect, useState } from 'react';
import { Modal } from '../components/Modal';
import { Check } from '../icons';

// Same sRGB relative-luminance contrast formula used to fix Avatar's level
// ribbon colors (caught by the a11y addon) — reused here so clicking any
// swatch shows real, computed contrast numbers instead of guesses.
function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * WCAG 2.1 relative-luminance contrast ratio, 1:1 to 21:1. Exported so the
 * Colors page's pairing guidance computes from the same function the swatch
 * modals do — two implementations of this formula would eventually disagree,
 * and the whole point of the numbers is that they are measured, not asserted.
 */
/**
 * Corner radius for a colour chip.
 *
 * NOT a brand token, deliberately: the brand radius scale starts at
 * `mo-sm` (12px), which on a ~26px chip reads as a lozenge rather than a
 * square of colour. The scale has no small step — consumer apps have one at 4px,
 * the brand scale does not — so this is the gap, named rather than papered over.
 * Exported so the swatches here and the step pickers in ContrastChecker
 * cannot drift apart while that stays true.
 */
export const SWATCH_RADIUS = 4;

export function contrastRatio(hexA: string, hexB: string) {
  const lA = relativeLuminance(hexToRgb(hexA));
  const lB = relativeLuminance(hexToRgb(hexB));
  const [lighter, darker] = lA > lB ? [lA, lB] : [lB, lA];
  return (lighter + 0.05) / (darker + 0.05);
}

function rgbString(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * A value (hex, Tailwind class, etc.) that copies itself to the clipboard on
 * click, with a "Click to copy" tooltip on hover and a "Copied" + checkmark
 * confirmation after — modeled after Radix Colors' own copyable value chips.
 */
function CopyableValue({ value, display }: { value: string; display?: string }) {
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <span className="relative inline-block">
      {(hovered || copied) && (
        <span
          className="absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-mo-sm bg-mo-black px-2 py-1 text-mo-annotation font-medium text-mo-white shadow-mo-sm"
          role="status"
        >
          {copied ? (
            <span className="inline-flex items-center gap-1">
              <Check size={12} /> Copied
            </span>
          ) : (
            'Click to copy'
          )}
        </span>
      )}
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(value);
          setCopied(true);
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="cursor-pointer rounded-mo-sm border-0 bg-transparent p-0 font-mono text-mo-black underline decoration-mo-grey-4 decoration-dotted underline-offset-2 hover:text-mo-red"
      >
        {display ?? value}
      </button>
    </span>
  );
}

function ContrastRow({ label, hex, against }: { label: string; hex: string; against: string }) {
  const ratio = contrastRatio(hex, against);
  const passesAA = ratio >= 4.5;
  return (
    <>
      <dt className="text-mo-grey-7">{label}</dt>
      <dd className="font-mono">
        {ratio.toFixed(2)}:1 {passesAA ? '✅ AA' : '❌ fails AA'}
      </dd>
    </>
  );
}

export interface ColorSwatchProps {
  /** Full Tailwind token, e.g. "mo-red-6" or "mo-black" */
  token: string;
  hex: string;
  /** Ramp step label shown under the swatch, e.g. "6". Omit for flat neutrals. */
  step?: string;
  isDefault?: boolean;
  size?: number;
  /** "card" shows name+hex under a large swatch (neutrals); "step" shows just the step number under a small one (ramps) */
  layout?: 'card' | 'step';
  /** "step" swatches stretch to fill their row's width instead of sitting at a fixed `size`, for ramp rows that should span the full container */
  fill?: boolean;
}

/**
 * A clickable color swatch — click to open a modal with the real hex, the
 * Tailwind class name, and computed WCAG contrast ratios against both white
 * and mo-black text, modeled after Radix Colors' own swatch-detail modal
 * (radix-ui.com/colors).
 */
export function ColorSwatch({ token, hex, step, isDefault, size = 56, layout = 'step', fill = false }: ColorSwatchProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`cursor-pointer border-0 bg-transparent p-0 text-left font-body ${fill ? 'flex-1' : ''}`}
        style={{ width: layout === 'card' ? 150 : fill ? undefined : size }}
      >
        {layout === 'card' ? (
          <div className="overflow-hidden rounded-mo-sm border border-mo-grey-3">
            <div style={{ background: hex, height: 64 }} />
            <div className="px-2.5 py-2">
              <div className="text-sm font-semibold text-mo-black">{token}</div>
              <div className="text-mo-annotation text-mo-grey-7">{hex}</div>
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                width: fill ? '100%' : size,
                height: size,
                background: hex,
                border: isDefault ? '2px solid #313030' : '1px solid #E8DDD5',
                borderRadius: SWATCH_RADIUS,
              }}
            />
            {step && <div className="mt-1 text-center text-mo-annotation text-mo-grey-7">{step}</div>}
          </>
        )}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={token} size="sm">
        <div className="flex flex-col gap-4">
          <div className="h-24 w-full rounded-mo-sm border border-mo-grey-3" style={{ background: hex }} />
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-mo-grey-7">Hex</dt>
            <dd>
              <CopyableValue value={hex} />
            </dd>
            <dt className="text-mo-grey-7">RGB</dt>
            <dd>
              <CopyableValue value={rgbString(hex)} />
            </dd>
            <dt className="text-mo-grey-7">Tailwind</dt>
            <dd>
              <CopyableValue value={`bg-${token}`} />
            </dd>
            {isDefault && (
              <>
                <dt className="text-mo-grey-7">Role</dt>
                <dd>DEFAULT (the hue's primary/brand shade)</dd>
              </>
            )}
            <ContrastRow label="Contrast vs. white text" hex={hex} against="#FFFFFF" />
            <ContrastRow label="Contrast vs. mo-black text" hex={hex} against="#313030" />
          </dl>
          <p className="text-mo-annotation text-mo-grey-7">
            Contrast ratios are WCAG 2.1 relative-luminance ratios, from 1:1 (no contrast) to 21:1
            (black on white). <strong>AA</strong> — the standard accessibility bar — needs 4.5:1 for
            normal text (3:1 for large/bold text or UI elements); <strong>AAA</strong> needs 7:1. See{' '}
            <a
              href="#contrast-ratios"
              target="_self"
              onClick={() => setOpen(false)}
              className="text-mo-red underline"
            >
              Contrast ratios
            </a>{' '}
            below.
          </p>
        </div>
      </Modal>
    </>
  );
}
