import type { Meta, StoryObj } from "@storybook/react-vite";
import { colors } from "../../tokens.mjs";
import { useState } from "react";
import { FloatingActionButton } from "./FloatingActionButton";
import {
  fabIconConfetti,
  fabIconDoubleXp,
  fabIconGames,
  fabIconGoals,
  fabIconHelp,
  fabIconStar,
  fabIconStreak,
  fabIconWorldQuiz,
} from "../fabIcons";

const meta: Meta<typeof FloatingActionButton> = {
  title: "Components/Actions/FloatingActionButton",
  component: FloatingActionButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FloatingActionButton>;

export const Default: Story = {
  args: { "aria-label": "Create new" },
};

export const WithLabel: Story = {
  args: { label: "New class" },
};

export const CustomIconWithLabel: Story = {
  render: () => (
    <FloatingActionButton
      label="Message"
      icon={
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      }
    />
  ),
};

// Illustrated icons for specific gamification features/events, reconciled
// from the reference design file's Floating Action Buttons page. Unlike
// the generic FloatingActionButton (an icon inset inside a brand-color
// circle), each of these is already a self-contained button face — its own
// background, border, and shadow (where present) are baked into the image.
// Render them directly at a fixed size; don't nest them inside
// FloatingActionButton's `icon` prop, which would draw a second circle
// behind them and shrink the artwork.
//
// To use one of these in an app, import it from `mosaic-design-system` and
// render it as a plain <img> — no extra download step, the bundler resolves
// it to a real static asset URL at build time, same as the Logo PNGs:
//
//   import { fabIconGoals } from 'mosaic-design-system';
//   <img src={fabIconGoals} alt="" />
//
// Available names: fabIconDoubleXp, fabIconWorldQuiz, fabIconGames,
// fabIconStreak, fabIconGoals, fabIconHelp, fabIconStar, fabIconConfetti.
const ILLUSTRATED_ICONS = [
  { name: "Double XP", slug: "double-xp", src: fabIconDoubleXp },
  { name: "World Quiz", slug: "world-quiz", src: fabIconWorldQuiz },
  { name: "Games", slug: "games", src: fabIconGames },
  { name: "Streak", slug: "streak", src: fabIconStreak },
  { name: "My Goals", slug: "my-goals", src: fabIconGoals },
  { name: "Help", slug: "help", src: fabIconHelp },
  { name: "Star", slug: "star", src: fabIconStar },
  { name: "Confetti", slug: "confetti", src: fabIconConfetti },
];

function saveBlob(blob: Blob, filename: string) {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(blobUrl);
}

// These icons are self-colored SVG badges (see fabIcons.ts). Downloads
// rasterize them through a canvas at the chosen scale — the vector source
// keeps every size crisp.
//
// `size` is either a multiplier of the icon's native pixel size (1x/2x/4x
// presets) or an explicit target width in px (the "Custom" field) — each
// icon's own naturalWidth/naturalHeight is read at draw time, so a px
// target scales every icon to that same output width regardless of their
// individual native sizes.
function downloadIconPngAtSize(
  src: string,
  filenameBase: string,
  size: { kind: "multiplier"; value: number } | { kind: "px"; value: number },
) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const scale =
      size.kind === "multiplier" ? size.value : size.value / img.naturalWidth;
    const targetWidth = Math.round(img.naturalWidth * scale);
    const targetHeight = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    const suffix =
      size.kind === "multiplier" ? `@${size.value}x` : `-${targetWidth}px`;
    canvas.toBlob((blob) => {
      if (blob) saveBlob(blob, `${filenameBase}${suffix}.png`);
    }, "image/png");
  };
  img.src = src;
}

function useIconScale() {
  const [preset, setPreset] = useState<1 | 2 | 4 | "custom">(1);
  const [customPx, setCustomPx] = useState(256);
  const size:
    { kind: "multiplier"; value: number } | { kind: "px"; value: number } =
    preset === "custom"
      ? { kind: "px", value: customPx }
      : { kind: "multiplier", value: preset };
  const label = preset === "custom" ? `${customPx}px` : `${preset}x`;
  return { preset, setPreset, customPx, setCustomPx, size, label };
}

export const GamificationIcons: Story = {
  render: () => {
    const { preset, setPreset, customPx, setCustomPx, size, label } =
      useIconScale();

    return (
      <div>
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            marginBottom: 16,
            fontFamily: "system-ui",
          }}
        >
          <span style={{ fontSize: 12, color: "#6B6A66", marginRight: 4 }}>
            Download size:
          </span>
          {([1, 2, 4] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPreset(p)}
              style={{
                fontSize: 11,
                padding: "4px 8px",
                borderRadius: 4,
                border:
                  preset === p ? "1px solid #B82431" : "1px solid #D8CFC6",
                background: preset === p ? "#B82431" : "#fff",
                color: preset === p ? "#fff" : "#313030",
                cursor: "pointer",
              }}
            >
              {p}x
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPreset("custom")}
            style={{
              fontSize: 11,
              padding: "4px 8px",
              borderRadius: 4,
              border:
                preset === "custom" ? "1px solid #B82431" : "1px solid #D8CFC6",
              background: preset === "custom" ? "#B82431" : "#fff",
              color: preset === "custom" ? "#fff" : "#313030",
              cursor: "pointer",
            }}
          >
            Custom
          </button>
          {preset === "custom" && (
            <>
              <input
                type="number"
                min={1}
                step={16}
                value={customPx}
                onChange={(e) => setCustomPx(Number(e.target.value) || 1)}
                style={{
                  width: 64,
                  fontSize: 11,
                  padding: "3px 6px",
                  borderRadius: 4,
                  border: "1px solid #D8CFC6",
                }}
              />
              <span style={{ fontSize: 11, color: "#6B6A66" }}>px wide</span>
            </>
          )}
          {(preset === 4 || (preset === "custom" && customPx > 228)) && (
            <span style={{ fontSize: 11, color: "#ACABA7" }}>
              (source is native at ~2x; larger sizes are upscaled and may look
              soft)
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {ILLUSTRATED_ICONS.map(({ name, slug, src }) => (
            <div
              key={name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <button
                type="button"
                aria-label={name}
                style={{
                  width: 56,
                  height: 56,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <img
                  src={src}
                  alt=""
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </button>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "system-ui",
                  color: "#6B6A66",
                }}
              >
                {name}
              </span>
              <button
                type="button"
                onClick={() =>
                  downloadIconPngAtSize(src, `fab-icon-${slug}`, size)
                }
                style={{
                  fontSize: 11,
                  // Same fix as the Logo gallery chips: a 24px floor on the
                  // design system's own download buttons.
                  minHeight: 24,
                  padding: "4px 9px",
                  borderRadius: 4,
                  border: `1px solid ${colors["mo-grey"][3]}`,
                  background: colors["mo-grey"][1],
                  cursor: "pointer",
                }}
              >
                PNG ({label})
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  },
};
