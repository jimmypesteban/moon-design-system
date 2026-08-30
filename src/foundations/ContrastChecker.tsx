import React, { useMemo, useState } from 'react';
import { borderRadius, colors } from '../../tokens.mjs';
import { Select } from '../components/Select';
import { SWATCH_RADIUS, contrastRatio } from './ColorSwatch';

interface TokenOption {
  /** Tailwind-facing name, e.g. `mo-red-8` or `mo-black`. */
  name: string;
  hex: string;
  /** Hue family, so a failing pair can be offered a fix from its own ramp. */
  hue: string;
  /** Ramp position, absent for the flat neutrals. */
  step?: number;
}

/** Every brand colour, flattened once into the shape the pickers need. */
const OPTIONS: TokenOption[] = (() => {
  const out: TokenOption[] = [];
  for (const [hue, value] of Object.entries(colors as Record<string, unknown>)) {
    if (typeof value === 'string') {
      out.push({ name: hue, hex: value, hue });
      continue;
    }
    for (const [step, hex] of Object.entries(value as Record<string, string>)) {
      if (step === 'DEFAULT') continue;
      out.push({ name: `${hue}-${step}`, hex, hue, step: Number(step) });
    }
  }
  return out;
})();

const byName = (n: string) => OPTIONS.find((o) => o.name === n) ?? OPTIONS[0];

/** WCAG 2.1 minimums. Large is 18pt+, or 14pt+ bold. */
const BARS = [
  { id: 'aa-normal', label: 'AA · normal text', min: 4.5 },
  { id: 'aa-large', label: 'AA · large text & UI', min: 3 },
  { id: 'aaa-normal', label: 'AAA · normal text', min: 7 },
  { id: 'aaa-large', label: 'AAA · large text', min: 4.5 },
];

const GREEN = '#1B4B35';
const RED = '#B82431';
const INK = '#313030';
const MUTED = '#6B6A66';
const LINE = '#DEDCD8';

/**
 * Radii come from the brand scale, not from whatever looked right while
 * typing. The first draft of this component shipped 4px, 6px, 10px and 99px
 * inline next to the Select's own 12px — six different corners in one card, on
 * the page that documents the radius scale.
 *
 * Nesting rule: the card takes the larger step so inner elements sit visually
 * inside it, everything within shares one step, and pills take the full round.
 */
const R = {
  card: borderRadius['mo-md'],
  inner: borderRadius['mo-sm'],
  pill: borderRadius['mo-full'],
  /* The one non-token: see SWATCH_RADIUS. A 26px chip has no step to sit on. */
  step: SWATCH_RADIUS,
};

const CARD_CLASS = 'mo-contrast-card';
const CONTROLS_CLASS = 'mo-contrast-controls';

/**
 * The one rule that inline styles cannot express: how the controls lay out
 * when there is no room for a row.
 *
 * Wrapping alone put the Swap button beside BACKGROUND and pushed TEXT to the
 * next line, so the control that swaps two things sat inside one of them. In a
 * column the DOM order already reads BACKGROUND / Swap / TEXT, so the button
 * lands between the two groups it acts on — which is what it means.
 *
 * A CONTAINER query, not a media query: this card is embedded in a docs pane
 * whose width has little to do with the viewport's, so "is there room for two
 * pickers side by side" is a question about the card, and only the card can
 * answer it. 560px is where two 212px pickers, the button and two 16px gaps
 * stop fitting.
 *
 * Delivered as a React 19 hoisted stylesheet, deduped by `href`, same as the
 * Skeleton shimmer.
 */
const CONTROLS_CSS = `
.${CARD_CLASS} { container-type: inline-size; container-name: mo-contrast; }
.${CONTROLS_CLASS} {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}
@container mo-contrast (max-width: 560px) {
  .${CONTROLS_CLASS} { flex-direction: column; align-items: stretch; }
}
`;

function ControlsStyle() {
  return (
    <style href="mo-contrast-controls" precedence="medium">
      {CONTROLS_CSS}
    </style>
  );
}

/** Hue families, in palette order, for the short dropdown. */
const HUES = [...new Set(OPTIONS.map((o) => o.hue))];

/** The steps a hue offers — empty for the flat neutrals, which have no ramp. */
const stepsOf = (hue: string) => OPTIONS.filter((o) => o.hue === hue && o.step !== undefined);

/**
 * Hue first, then step — because 102 options in one list is the wrong control
 * for a palette that is really 12 families of 10.
 *
 * The first version put every token in a single native <select>: correct, and
 * miserable to actually use. This splits the one long scroll into two short
 * decisions, and makes the second one visual — you click the colour you can
 * see rather than choosing "9" and hoping. It also mirrors the ramp rows
 * further up this page, so the control matches the thing it is picking from.
 *
 * The hue list stays on the system's own Select. The steps are swatch buttons
 * rather than a second Select on purpose: their whole value is showing the
 * colour, which a dropdown of numbers cannot do.
 */
function Picker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const current = byName(value);
  const steps = stepsOf(current.hue);
  const hueOptions = useMemo(() => HUES.map((h) => ({ value: h, label: h })), []);

  /** Keep the step when switching hue, so comparing the same step across hues is one click. */
  const changeHue = (hue: string) => {
    const next = stepsOf(hue);
    if (next.length === 0) return onChange(hue);
    const sameStep = next.find((o) => o.step === current.step);
    onChange((sameStep ?? next[Math.floor(next.length / 2)]).name);
  };

  return (
    <div style={{ flex: 1, minWidth: 212, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Select
        label={label}
        size="sm"
        audience="admin"
        options={hueOptions}
        value={current.hue}
        onChange={(e) => changeHue(e.target.value)}
      />
      {steps.length > 0 && (
        <div style={{ display: 'flex', gap: 4 }} role="group" aria-label={`${label} step`}>
          {steps.map((o) => {
            const active = o.name === value;
            return (
              <button
                key={o.name}
                type="button"
                onClick={() => onChange(o.name)}
                title={`${o.name} — ${o.hex}`}
                aria-label={`${o.name}, ${o.hex}`}
                aria-pressed={active}
                style={{
                  flex: 1,
                  height: 28,
                  padding: 0,
                  background: o.hex,
                  border: active ? `2px solid ${INK}` : `1px solid ${LINE}`,
                  borderRadius: R.step,
                  cursor: 'pointer',
                  fontSize: 9,
                  lineHeight: 1,
                  color: 'transparent',
                }}
              >
                {o.step}
              </button>
            );
          })}
        </div>
      )}
      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, color: MUTED }}>
        {current.name} — {current.hex}
      </span>
    </div>
  );
}

function Verdict({ ratio }: { ratio: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
      {BARS.map((b) => {
        const pass = ratio >= b.min;
        return (
          <div
            key={b.id}
            style={{
              border: `1px solid ${pass ? GREEN : LINE}`,
              background: pass ? '#ECF9F2' : '#fff',
              borderRadius: R.inner,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 11.5, color: pass ? GREEN : MUTED }}>{b.label}</span>
            <strong style={{ fontSize: 11.5, color: pass ? GREEN : RED }}>
              {pass ? 'PASS' : 'FAIL'}
            </strong>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Interactive contrast checker — pick any two brand colours and see the WCAG
 * ratio, the four pass bars, and the pairing rendered as real text.
 *
 * The part worth having is the suggestion: when a pair fails AA, it walks the
 * foreground's OWN ramp for the nearest step that passes, so the answer keeps
 * the hue you chose instead of sending you to a different colour. That is the
 * fix people actually need — most failures here are "right hue, wrong step",
 * which is exactly what the ramps exist to solve.
 *
 * Ratios come from `contrastRatio` in ColorSwatch, the same function the
 * swatch modals and the pairing guidance use, so nothing on this page can
 * disagree with anything else on it.
 */
export function ContrastChecker() {
  const [bgName, setBgName] = useState('mo-yellow-1');
  const [fgName, setFgName] = useState('mo-yellow-6');

  const bg = byName(bgName);
  const fg = byName(fgName);
  const ratio = contrastRatio(bg.hex, fg.hex);

  /**
   * Nearest step in `hue`'s own ramp that clears AA against `against`, measured
   * outward from `from` so the answer stays as close to the chosen colour as
   * the ramp allows. Falls back to the best neutral, because a mid-tone can
   * defeat its entire ramp — nothing in mo-blue clears 4.5:1 on mo-blue-5 — and
   * showing nothing there is a dead end at the moment help is needed.
   */
  const nearestPassing = (against: string, hue: string, from?: number) => {
    if (from !== undefined) {
      const sameHue = OPTIONS.filter((o) => o.hue === hue && o.step !== undefined)
        .map((o) => ({ ...o, r: contrastRatio(against, o.hex) }))
        .filter((o) => o.r >= 4.5)
        .sort((a, b) => Math.abs(a.step! - from) - Math.abs(b.step! - from));
      if (sameHue[0]) return { ...sameHue[0], sameHue: true };
    }
    const neutral = OPTIONS.filter(
      (o) => o.hue === 'mo-black' || o.hue === 'mo-white' || o.hue === 'mo-grey'
    )
      .map((o) => ({ ...o, r: contrastRatio(against, o.hex) }))
      .filter((o) => o.r >= 4.5)
      .sort((a, b) => b.r - a.r);
    return neutral[0] ? { ...neutral[0], sameHue: false } : null;
  };

  /**
   * Both ways out of a failing pair, not one.
   *
   * The first version only ever moved the TEXT, which quietly assumed the
   * foreground is the thing you are willing to change. Often it is not — for a
   * tinted panel you usually want to keep the text and lighten the surface
   * behind it — and a tool that offers a single route makes that decision for
   * you without saying so.
   */
  const fixes = useMemo(() => {
    if (ratio >= 4.5) return [];
    const out: { role: 'text' | 'background'; option: ReturnType<typeof nearestPassing>; apply: () => void }[] = [];
    const textFix = nearestPassing(bg.hex, fg.hue, fg.step);
    if (textFix) out.push({ role: 'text', option: textFix, apply: () => setFgName(textFix.name) });
    const bgFix = nearestPassing(fg.hex, bg.hue, bg.step);
    if (bgFix) out.push({ role: 'background', option: bgFix, apply: () => setBgName(bgFix.name) });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bg.hex, bg.hue, bg.step, fg.hex, fg.hue, fg.step, ratio]);

  const swap = () => {
    setBgName(fgName);
    setFgName(bgName);
  };

  return (
    <div
      className={CARD_CLASS}
      style={{ border: `1px solid ${LINE}`, borderRadius: R.card, overflow: 'hidden', marginTop: 16 }}
    >
      <ControlsStyle />
      <div style={{ background: bg.hex, padding: '28px 24px' }}>
        <div style={{ color: fg.hex, fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>
          Large heading text
        </div>
        <div style={{ color: fg.hex, fontSize: 15, marginTop: 8, lineHeight: 1.5, maxWidth: '60ch' }}>
          Normal body copy at 15px — the size most interface text actually sits at, and the
          one the 4.5:1 bar is written for.
        </div>
        <div style={{ color: fg.hex, fontSize: 11.5, marginTop: 8, opacity: 0.95 }}>
          Small supporting text at 11.5px
        </div>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, background: '#fff' }}>
        {/* Centre, not flex-end: the button swaps two whole pickers, and each
            picker is now three elements tall (Select, step row, readout), so
            aligning to the bottom parked it beside the readout line instead
            of between the two controls it acts on.
            Narrow layout lives in ControlsStyle — see the note there. */}
        <div className={CONTROLS_CLASS}>
          <Picker label="BACKGROUND" value={bgName} onChange={setBgName} />
          <button
            type="button"
            onClick={swap}
            aria-label="Swap background and text colours"
            style={{
              border: `1px solid ${LINE}`,
              background: '#fff',
              borderRadius: R.inner,
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: 13,
              color: INK,
              whiteSpace: 'nowrap',
              alignSelf: 'center',
            }}
          >
            ⇄ Swap
          </button>
          <Picker label="TEXT" value={fgName} onChange={setFgName} />
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <strong
            style={{
              fontSize: 30,
              fontVariantNumeric: 'tabular-nums',
              color: ratio >= 4.5 ? GREEN : RED,
              lineHeight: 1,
            }}
          >
            {ratio.toFixed(2)}:1
          </strong>
          <span style={{ fontSize: 12, color: MUTED }}>
            WCAG 2.1 contrast ratio · 1:1 is no contrast, 21:1 is the maximum
          </span>
        </div>

        <Verdict ratio={ratio} />

        {fixes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 11.5, color: MUTED }}>
              Two ways to clear 4.5:1 — change either side:
            </span>
            {fixes.map(({ role, option, apply }) => (
              <div
                key={role}
                style={{
                  border: `1px solid ${LINE}`,
                  borderLeft: `3px solid ${GREEN}`,
                  borderRadius: R.inner,
                  padding: '8px 12px',
                  fontSize: 12.5,
                  color: INK,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: R.pill,
                    background: option!.hex,
                    border: `1px solid ${LINE}`,
                    flexShrink: 0,
                  }}
                />
                <span>
                  {role === 'text' ? 'Change the text to ' : 'Change the background to '}
                  <code style={{ fontFamily: 'ui-monospace, monospace' }}>{option!.name}</code> for{' '}
                  <strong style={{ color: GREEN }}>{option!.r.toFixed(2)}:1</strong>
                  {!option!.sameHue && (
                    <span style={{ color: MUTED }}> — nothing in that ramp reaches 4.5:1 here</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={apply}
                  /* Names the effect: it updates the preview above, it does not
                     write anything anywhere. "Use it" read like it applied the
                     colour to your project. */
                  style={{
                    marginLeft: 'auto',
                    border: `1px solid ${GREEN}`,
                    background: '#ECF9F2',
                    color: GREEN,
                    borderRadius: R.pill,
                    padding: '4px 12px',
                    fontSize: 11.5,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Preview this
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, color: MUTED }}>
          bg-{bg.name} / text-{fg.name}
        </div>
      </div>
    </div>
  );
}
