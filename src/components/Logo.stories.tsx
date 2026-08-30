import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Logo } from "./Logo";
import {
  moonLogo,
  moonMark,
  moonLogoSvg,
  moonMarkSvg,
  moonLogoWhite,
  moonMarkWhite,
  moonLogoWhiteSvg,
  moonMarkWhiteSvg,
  moonLogoBlack,
  moonMarkBlack,
  moonLogoBlackSvg,
  moonMarkBlackSvg,
  moonLogoYellow,
  moonMarkYellow,
  moonLogoYellowSvg,
  moonMarkYellowSvg,
  moonLogoOrange,
  moonMarkOrange,
  moonLogoOrangeSvg,
  moonMarkOrangeSvg,
  moonLogoPink,
  moonMarkPink,
  moonLogoPinkSvg,
  moonMarkPinkSvg,
  moonLogoPurple,
  moonMarkPurple,
  moonLogoPurpleSvg,
  moonMarkPurpleSvg,
  moonLogoGreen,
  moonMarkGreen,
  moonLogoGreenSvg,
  moonMarkGreenSvg,
  moonLogoForest,
  moonMarkForest,
  moonLogoForestSvg,
  moonMarkForestSvg,
  moonLogoBlue,
  moonMarkBlue,
  moonLogoBlueSvg,
  moonMarkBlueSvg,
  moonLogoOcean,
  moonMarkOcean,
  moonLogoOceanSvg,
  moonMarkOceanSvg,
} from "../logos";
import { borderRadius, colors, fontFamily } from "../../tokens.mjs";
import { downloadSvg, downloadPng, SCALE_PRESETS } from "../../.storybook/svgDownload";

const BODY_FONT = fontFamily.body.join(", ");

// The real Moon wordmark/mark in all 11 color-variant lockups (Red/
// White/Black/Yellow/Orange/Pink/Purple/Green/Forest/Blue/Ocean), from
// src/logos.ts — not placeholders. Real apps should still pass their own
// /public asset paths (see the component doc comment for why), but these
// give the Storybook demo the actual brand assets.

// Downloads are generated from the real SVG source at whatever scale is
// picked (1x/2x/4x/custom) — the SVG's own viewBox is the "1x" size. SVG
// export just resizes the vector; PNG rasterizes it via canvas at that
// resolution, so both formats always match the chosen size exactly instead
// of being locked to one pre-baked PNG file.

// Download helpers live in .storybook/svgDownload.ts — the Shapes page needs
// the same rasterising, and two copies of it would have drifted.

/** Shared 1x/2x/4x + custom-multiplier control for the logo download galleries below. */
function useLogoScale() {
  const [preset, setPreset] = useState<number>(1);
  const [custom, setCustom] = useState("");
  const scale = custom ? Number(custom) || 1 : preset;

  const control = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
        fontFamily: BODY_FONT,
      }}
    >
      <span style={{ fontSize: 12, color: "#6B6A66" }}>Size:</span>
      {SCALE_PRESETS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => {
            setPreset(p);
            setCustom("");
          }}
          style={{
            fontSize: 12,
            padding: "4px 10px",
            borderRadius: 6,
            border:
              !custom && preset === p
                ? "1px solid #B82431"
                : "1px solid #D8CFC6",
            background: !custom && preset === p ? "#FCEFF3" : "#fff",
            color: !custom && preset === p ? "#B82431" : "#313030",
            cursor: "pointer",
          }}
        >
          {p}x
        </button>
      ))}
      <input
        type="number"
        min={1}
        placeholder="Custom, e.g. 3"
        value={custom}
        onChange={(e) => setCustom(e.target.value)}
        style={{
          width: 90,
          fontSize: 12,
          padding: "4px 8px",
          borderRadius: 6,
          border: "1px solid #D8CFC6",
        }}
      />
    </div>
  );

  return { scale, control };
}

function DownloadButtons({
  svgUrl,
  filenameBase,
  scale,
}: {
  svgUrl: string;
  filenameBase: string;
  scale: number;
}) {
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
      <button
        type="button"
        onClick={() => downloadSvg(svgUrl, filenameBase, scale)}
        style={{
          fontSize: 11,
          // 24px minimum height and a surface that reads against a white
          // tile: these chips were 2 of the baseline's invisible-surface
          // findings and 4 of its under-24px hit targets — on the design
          // system's own gallery, which is the last place to tolerate them.
          minHeight: 24,
          padding: "4px 9px",
          borderRadius: 4,
          // mo-grey[3], because these chips sit on BOTH tile colours: a white
          // chip vanished on the white tile (the original finding), and a
          // cream one vanished on the cream tiles (the finding my first fix
          // introduced — mo-grey[2] IS the cream). The border grey is the one
          // step distinct from both.
          border: `1px solid ${colors["mo-grey"][3]}`,
          background: colors["mo-grey"][3],
          color: colors["mo-black"],
          cursor: "pointer",
        }}
      >
        SVG
      </button>
      <button
        type="button"
        onClick={() => downloadPng(svgUrl, filenameBase, scale)}
        style={{
          fontSize: 11,
          // 24px minimum height and a surface that reads against a white
          // tile: these chips were 2 of the baseline's invisible-surface
          // findings and 4 of its under-24px hit targets — on the design
          // system's own gallery, which is the last place to tolerate them.
          minHeight: 24,
          padding: "4px 9px",
          borderRadius: 4,
          // mo-grey[3], because these chips sit on BOTH tile colours: a white
          // chip vanished on the white tile (the original finding), and a
          // cream one vanished on the cream tiles (the finding my first fix
          // introduced — mo-grey[2] IS the cream). The border grey is the one
          // step distinct from both.
          border: `1px solid ${colors["mo-grey"][3]}`,
          background: colors["mo-grey"][3],
          color: colors["mo-black"],
          cursor: "pointer",
        }}
      >
        PNG
      </button>
    </div>
  );
}

const meta: Meta<typeof Logo> = {
  title: "Foundations/Logo",
  component: Logo,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const Default: Story = {
  args: { src: moonLogo, width: 200, height: 46 },
};

export const MarkOnly: Story = {
  args: { src: moonMark, width: 48, height: 48 },
};

export const ResponsiveMark: Story = {
  args: {
    src: moonLogo,
    markSrc: moonMark,
    width: 200,
    height: 46,
    markSize: 40,
    responsiveMark: true,
  },
};

export const ColorVariants: Story = {
  render: () => {
    const { scale, control } = useLogoScale();
    return (
      <div>
        {control}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ padding: 16, background: colors["mo-white"], borderRadius: borderRadius["mo-sm"], border: `1px solid ${colors["mo-grey"][3]}` }}>
            <Logo src={moonLogo} width={172} height={40} />
            <p
              style={{
                fontSize: 12,
                color: "#6B6A66",
                marginTop: 8,
                fontFamily: BODY_FONT,
              }}
            >
              Red — default, on light background
            </p>
            <DownloadButtons
              svgUrl={moonLogoSvg}
              filenameBase="moon-logo"
              scale={scale}
            />
          </div>
          <div style={{ padding: 16, background: colors["mo-black"], borderRadius: borderRadius["mo-sm"] }}>
            <Logo src={moonLogoWhite} width={172} height={40} />
            <p
              style={{
                fontSize: 12,
                color: "#ACABA7",
                marginTop: 8,
                fontFamily: BODY_FONT,
              }}
            >
              White — on dark backgrounds
            </p>
            <DownloadButtons
              svgUrl={moonLogoWhiteSvg}
              filenameBase="moon-logo-white"
              scale={scale}
            />
          </div>
          <div
            style={{
              padding: 16,
              background: "#FFFFFF",
              border: "1px solid #DEDCD8",
              borderRadius: borderRadius["mo-sm"],
            }}
          >
            <Logo src={moonLogoBlack} width={172} height={40} />
            <p
              style={{
                fontSize: 12,
                color: "#6B6A66",
                marginTop: 8,
                fontFamily: BODY_FONT,
              }}
            >
              Black — monochrome, on light backgrounds
            </p>
            <DownloadButtons
              svgUrl={moonLogoBlackSvg}
              filenameBase="moon-logo-black"
              scale={scale}
            />
          </div>
        </div>
      </div>
    );
  },
};

export const MarkColorVariants: Story = {
  // A gallery: every colour variant side by side is the point, so it is wider
  // than a phone on purpose. Exempt from the width sweep rather than reshaped.
  tags: ["no-width-sweep"],
  render: () => {
    const { scale, control } = useLogoScale();
    return (
      <div>
        {control}
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ padding: 16, background: colors["mo-white"], borderRadius: borderRadius["mo-sm"], border: `1px solid ${colors["mo-grey"][3]}` }}>
            <Logo src={moonMark} width={40} height={40} />
            <DownloadButtons
              svgUrl={moonMarkSvg}
              filenameBase="moon-mark"
              scale={scale}
            />
          </div>
          <div style={{ padding: 16, background: colors["mo-black"], borderRadius: borderRadius["mo-sm"] }}>
            <Logo src={moonMarkWhite} width={40} height={40} />
            <DownloadButtons
              svgUrl={moonMarkWhiteSvg}
              filenameBase="moon-mark-white"
              scale={scale}
            />
          </div>
          <div
            style={{
              padding: 16,
              background: "#FFFFFF",
              border: "1px solid #DEDCD8",
              borderRadius: borderRadius["mo-sm"],
            }}
          >
            <Logo src={moonMarkBlack} width={40} height={40} />
            <DownloadButtons
              svgUrl={moonMarkBlackSvg}
              filenameBase="moon-mark-black"
              scale={scale}
            />
          </div>
        </div>
      </div>
    );
  },
};

const ALL_SECONDARY_COLORS = [
  {
    name: "Yellow",
    logo: moonLogoYellow,
    logoSvg: moonLogoYellowSvg,
    mark: moonMarkYellow,
    markSvg: moonMarkYellowSvg,
  },
  {
    name: "Orange",
    logo: moonLogoOrange,
    logoSvg: moonLogoOrangeSvg,
    mark: moonMarkOrange,
    markSvg: moonMarkOrangeSvg,
  },
  {
    name: "Pink",
    logo: moonLogoPink,
    logoSvg: moonLogoPinkSvg,
    mark: moonMarkPink,
    markSvg: moonMarkPinkSvg,
  },
  {
    name: "Purple",
    logo: moonLogoPurple,
    logoSvg: moonLogoPurpleSvg,
    mark: moonMarkPurple,
    markSvg: moonMarkPurpleSvg,
  },
  {
    name: "Green",
    logo: moonLogoGreen,
    logoSvg: moonLogoGreenSvg,
    mark: moonMarkGreen,
    markSvg: moonMarkGreenSvg,
  },
  {
    name: "Forest",
    logo: moonLogoForest,
    logoSvg: moonLogoForestSvg,
    mark: moonMarkForest,
    markSvg: moonMarkForestSvg,
  },
  {
    name: "Blue",
    logo: moonLogoBlue,
    logoSvg: moonLogoBlueSvg,
    mark: moonMarkBlue,
    markSvg: moonMarkBlueSvg,
  },
  {
    name: "Ocean",
    logo: moonLogoOcean,
    logoSvg: moonLogoOceanSvg,
    mark: moonMarkOcean,
    markSvg: moonMarkOceanSvg,
  },
];

export const AllBrandColors: Story = {
  name: "All 11 Brand Colors",
  render: () => {
    const { scale, control } = useLogoScale();
    return (
      <div>
        {control}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          {[
            {
              name: "Red (default)",
              logo: moonLogo,
              logoSvg: moonLogoSvg,
              mark: moonMark,
              markSvg: moonMarkSvg,
            },
            {
              name: "White",
              logo: moonLogoWhite,
              logoSvg: moonLogoWhiteSvg,
              mark: moonMarkWhite,
              markSvg: moonMarkWhiteSvg,
            },
            {
              name: "Black",
              logo: moonLogoBlack,
              logoSvg: moonLogoBlackSvg,
              mark: moonMarkBlack,
              markSvg: moonMarkBlackSvg,
            },
            ...ALL_SECONDARY_COLORS,
          ].map(({ name, logo, logoSvg, mark, markSvg }) => {
            const slug = name
              .toLowerCase()
              .replace(/\s*\(default\)/, "")
              .trim()
              .replace(/\s+/g, "-");
            return (
              <div
                key={name}
                style={{
                  padding: 16,
                  background: name === "White" ? "#313030" : "#F5F4F0",
                  borderRadius: borderRadius["mo-sm"],
                  border: name === "Black" ? "1px solid #DEDCD8" : "none",
                }}
              >
                <Logo src={logo} width={140} height={32} />
                <p
                  style={{
                    fontSize: 11,
                    color: name === "White" ? "#ACABA7" : "#6B6A66",
                    marginTop: 8,
                    fontFamily: BODY_FONT,
                  }}
                >
                  {name}
                </p>
                <DownloadButtons
                  svgUrl={logoSvg}
                  filenameBase={
                    slug === "red" ? "moon-logo" : `moon-logo-${slug}`
                  }
                  scale={scale}
                />
                {/* The mark on its own. Every colour already carried its mark assets
                    here; only the wordmark was offered, so anyone who wanted the face
                    — an avatar, a favicon, a tight corner — had to find it elsewhere. */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: `1px solid ${name === "White" ? "#484746" : "#DEDCD8"}`,
                  }}
                >
                  <img alt="" src={mark} width={20} height={20} />
                  <span
                    style={{
                      fontSize: 11,
                      color: name === "White" ? "#ACABA7" : "#6B6A66",
                      fontFamily: BODY_FONT,
                    }}
                  >
                    Mark
                  </span>
                  <span style={{ marginLeft: "auto" }}>
                    <DownloadButtons
                      svgUrl={markSvg}
                      filenameBase={slug === "red" ? "moon-mark" : `moon-mark-${slug}`}
                      scale={scale}
                    />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
