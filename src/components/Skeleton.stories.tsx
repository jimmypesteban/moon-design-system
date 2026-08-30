import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useRef } from "react";
import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Feedback/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "radio", options: ["text", "circular", "rectangular"] },
    animation: { control: "radio", options: ["pulse", "shimmer", "wave"] },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Text: Story = {
  args: { variant: "text", width: 240 },
};

export const MultiLineText: Story = {
  name: "Text — Multiple Lines",
  args: { variant: "text", lines: 3, width: 240 },
};

export const Circular: Story = {
  args: { variant: "circular", width: 40, height: 40 },
};

export const Rectangular: Story = {
  args: { variant: "rectangular", width: 240, height: 140 },
};

export const Shimmer: Story = {
  args: {
    variant: "rectangular",
    width: 240,
    height: 140,
    animation: "shimmer",
  },
};

/** `wave` staggers each text line by 120ms, so the sweep travels down the block. */
export const Wave: Story = {
  name: "Wave — Staggered Lines",
  args: { variant: "text", lines: 4, width: 240, animation: "wave" },
};

/**
 * A realistic composition — an avatar circle, a name + subtitle text
 * block, and a card image — the way Skeleton pieces actually get combined
 * to placeholder a real layout while it loads.
 */
export const CardPlaceholder: Story = {
  render: () => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 16, width: 280 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Skeleton
          variant="circular"
          width={40}
          height={40}
          animation="shimmer"
        />
        <div style={{ flex: 1 }}>
          <Skeleton
            variant="text"
            width={120}
            height={12}
            animation="shimmer"
          />
          <div style={{ marginTop: 6 }}>
            <Skeleton
              variant="text"
              width={80}
              height={10}
              animation="shimmer"
            />
          </div>
        </div>
      </div>
      <Skeleton variant="rectangular" height={140} animation="shimmer" />
      <Skeleton variant="text" lines={2} animation="wave" />
    </div>
  ),
};

/* ────────────────────────────────────────────────────────────────────────
 * Effect Gallery — nine skeleton-loading patterns as an interactive
 * reference, on brand tokens. Click a card to play its effect; the label
 * under the title names the CSS mechanism.
 *
 * Reference ONLY, deliberately not component API: shimmer, gradient, pulse
 * and cascade are true loading loops, but staggered, typewriter, layered,
 * elastic and outline are one-shot ENTRANCE choreographies — they cannot
 * hold an indefinite loading state, so they do not belong on <Skeleton>.
 * The loop-able ones the product should use are the `animation` prop above.
 * ──────────────────────────────────────────────────────────────────────── */

const BASE = "var(--color-mo-grey-3, #DEDCD8)";
const SHINE = "var(--color-mo-grey-2, #F5F4F0)";

const GALLERY_CSS = `
@keyframes skelgal-shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
@keyframes skelgal-gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes skelgal-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
.skelgal-cell { transition: border-color 0.3s ease, box-shadow 0.3s ease; }
.skelgal-cell:hover { border-color: rgba(187, 16, 78, 0.35); }
.skelgal-cell[data-animating='true'] { border-color: rgba(187, 16, 78, 0.55); }
`;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Effect = (parts: HTMLElement[], cell: HTMLElement) => Promise<void>;

const EFFECTS: Record<
  string,
  { desc: string; mechanism: string; run: Effect }
> = {
  Shimmer: {
    desc: "Gradient sweep left→right",
    mechanism: "background-position sweep",
    run: async (parts) => {
      for (const p of parts) {
        p.style.backgroundImage = `linear-gradient(90deg, ${BASE} 25%, ${SHINE} 50%, ${BASE} 75%)`;
        p.style.backgroundSize = "200% 100%";
        p.style.animation = "skelgal-shimmer 1.8s ease-in-out infinite";
      }
      await wait(4000);
    },
  },
  Gradient: {
    desc: "Multi-color gradient shift",
    mechanism: "background-size: 200%",
    run: async (parts) => {
      for (const p of parts) {
        p.style.backgroundImage = `linear-gradient(135deg, ${BASE}, rgba(187,16,78,0.10), rgba(255,199,0,0.14), ${BASE})`;
        p.style.backgroundSize = "300% 300%";
        p.style.animation = "skelgal-gradient 2.5s ease infinite";
      }
      await wait(5000);
    },
  },
  Staggered: {
    desc: "Sequential reveal top→down",
    mechanism: "delay: i × 150ms",
    run: async (_parts, cell) => {
      const rows = Array.from(
        cell.querySelectorAll<HTMLElement>("[data-gal-row]"),
      );
      for (const r of rows) {
        r.style.opacity = "0";
        r.style.transform = "translateX(-10px)";
        r.style.transition = "none";
      }
      await wait(30);
      for (const r of rows) {
        r.style.transition =
          "opacity 0.4s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)";
        r.style.opacity = "1";
        r.style.transform = "translateX(0)";
        await wait(150);
      }
      await wait(1200);
    },
  },
  Typewriter: {
    desc: "Line-by-line clip reveal",
    mechanism: "clip-path: inset()",
    run: async (parts) => {
      for (const p of parts) {
        p.style.clipPath = "inset(0 100% 0 0)";
        p.style.transition = "none";
      }
      await wait(30);
      for (const p of parts) {
        p.style.transition = "clip-path 0.3s ease-out";
        p.style.clipPath = "inset(0 0% 0 0)";
        await wait(120);
      }
      await wait(1200);
    },
  },
  Layered: {
    desc: "Depth layers fade in",
    mechanism: "translateY + blur → 0",
    run: async (_parts, cell) => {
      const layers = Array.from(
        cell.querySelectorAll<HTMLElement>("[data-gal-row]"),
      );
      const bars = Array.from(
        cell.querySelectorAll<HTMLElement>("[data-gal-bar]"),
      );
      layers.forEach((l) => {
        // Set properties individually — assigning cssText REPLACES the whole
        // inline style, and these nodes carry their layout and fill there
        // (the header row's display:flex, the stat lines' backgrounds), so a
        // cssText assignment plays the entire animation on wrecked mocks.
        l.style.transition = "none";
        l.style.opacity = "0";
        l.style.transform = "translateY(10px)";
        l.style.filter = "blur(2px)";
      });
      bars.forEach((b) => {
        b.style.transition = "none";
        b.style.transform = "scaleY(0)";
        b.style.transformOrigin = "bottom";
      });
      await wait(30);
      for (const l of layers) {
        l.style.transition = "all 0.45s cubic-bezier(0, 0, 0.2, 1)";
        l.style.opacity = "1";
        l.style.transform = "translateY(0)";
        l.style.filter = "blur(0px)";
        await wait(140);
      }
      for (const b of bars) {
        b.style.transition = "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)";
        b.style.transform = "scaleY(1)";
        await wait(60);
      }
      await wait(1200);
    },
  },
  Elastic: {
    desc: "Spring-in bounce reveal",
    mechanism: "cubic-bezier(.34,1.56,.64,1)",
    run: async (parts) => {
      parts.forEach((p) => {
        p.style.opacity = "0";
        p.style.transform = "scale(0.3)";
        p.style.transition = "none";
      });
      await wait(30);
      for (const p of parts) {
        p.style.transition =
          "opacity 0.5s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)";
        p.style.opacity = "1";
        p.style.transform = "scale(1)";
        await wait(90);
      }
      await wait(1200);
    },
  },
  Pulse: {
    desc: "Opacity fade in/out",
    mechanism: "animation: pulse 1.5s",
    run: async (parts) => {
      parts.forEach(
        (p) => (p.style.animation = "skelgal-pulse 1.5s ease-in-out infinite"),
      );
      await wait(3500);
    },
  },
  Cascade: {
    desc: "Per-element highlight wave",
    mechanism: "staggered background wave",
    run: async (parts) => {
      for (let cycle = 0; cycle < 2; cycle++) {
        for (const p of parts) {
          p.style.transition = "background-color 0.3s ease-in";
          p.style.backgroundColor = SHINE;
          setTimeout(() => {
            p.style.transition = "background-color 0.5s ease-out";
            p.style.backgroundColor = "";
          }, 450);
          await wait(90);
        }
        await wait(700);
      }
    },
  },
  Outline: {
    desc: "Wireframe → fill reveal",
    mechanism: "border → background fill",
    run: async (parts) => {
      parts.forEach((p) => {
        p.style.transition = "none";
        p.style.backgroundColor = "transparent";
        p.style.boxShadow = `inset 0 0 0 1.5px ${BASE}`;
      });
      await wait(400);
      for (const p of parts) {
        p.style.transition = "background-color 0.5s ease, box-shadow 0.5s ease";
        p.style.backgroundColor = BASE;
        p.style.boxShadow = "inset 0 0 0 1.5px transparent";
        await wait(70);
      }
      await wait(1000);
    },
  },
};

/* Small primitives for the miniature mocks. Every visual part carries
 * data-gal-part so the effect functions can sweep them in DOM order. */
const part = (style: React.CSSProperties): React.CSSProperties => ({
  background: BASE,
  borderRadius: 4,
  ...style,
});
function P({ style, row }: { style: React.CSSProperties; row?: boolean }) {
  return (
    <div
      data-gal-part
      style={part(style)}
      data-gal-row={row ? "" : undefined}
    />
  );
}
function Row({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      data-gal-row
      style={{ display: "flex", alignItems: "center", gap: 6, ...style }}
    >
      {children}
    </div>
  );
}

const MOCKS: Record<string, React.ReactNode> = {
  Shimmer: (
    <>
      <Row>
        <P
          style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0 }}
        />
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}
        >
          <P style={{ height: 7, width: "60%" }} />
          <P style={{ height: 7, width: "30%" }} />
        </div>
      </Row>
      <P style={{ height: 40, borderRadius: 6 }} />
      <P style={{ height: 7, width: "100%" }} />
      <P style={{ height: 7, width: "70%" }} />
    </>
  ),
  Gradient: (
    <>
      <P style={{ height: 48, borderRadius: 6 }} />
      <P style={{ height: 9, width: "70%" }} />
      <P style={{ height: 7, width: "55%" }} />
      <Row style={{ justifyContent: "space-between" }}>
        <P style={{ width: 32, height: 9, borderRadius: 99 }} />
        <div style={{ display: "flex", gap: 3 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <P key={i} style={{ width: 7, height: 7, borderRadius: 2 }} />
          ))}
        </div>
      </Row>
    </>
  ),
  Staggered: (
    <>
      {["80%", "65%", "90%", "55%"].map((w, i) => (
        <Row key={i}>
          <P
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              flexShrink: 0,
            }}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <P style={{ height: 6, width: w }} />
            <P style={{ height: 6, width: "45%" }} />
          </div>
          <P
            style={{ width: 16, height: 6, borderRadius: 99, flexShrink: 0 }}
          />
        </Row>
      ))}
    </>
  ),
  Typewriter: (
    <div style={{ background: BASE, borderRadius: 6, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "5px 7px",
          borderBottom: `1px solid ${SHINE}`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <P
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: SHINE,
            }}
          />
        ))}
      </div>
      <div
        style={{ display: "flex", flexDirection: "column", gap: 5, padding: 8 }}
      >
        {[
          ["35%", 0],
          ["75%", 10],
          ["55%", 10],
          ["90%", 10],
          ["30%", 0],
        ].map(([w, ml], i) => (
          <P
            key={i}
            style={{
              height: 5,
              width: w as string,
              marginLeft: ml as number,
              background: SHINE,
            }}
          />
        ))}
      </div>
    </div>
  ),
  Layered: (
    <>
      <Row style={{ justifyContent: "space-between" }}>
        <P style={{ height: 7, width: "40%" }} />
        <P style={{ width: 18, height: 7, borderRadius: 99 }} />
      </Row>
      <P style={{ height: 14, width: "50%" }} row />
      <P style={{ height: 6, width: "30%" }} row />
      <div
        style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 48 }}
      >
        {[35, 55, 45, 80, 65, 50, 90, 70].map((h, i) => (
          <div
            key={i}
            data-gal-part
            data-gal-bar
            style={{
              flex: 1,
              height: `${h}%`,
              background: BASE,
              borderRadius: "3px 3px 0 0",
            }}
          />
        ))}
      </div>
    </>
  ),
  Elastic: (
    <>
      <P style={{ height: 18, borderRadius: 6 }} />
      <P
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          margin: "-12px auto 0",
          position: "relative",
          border: "2px solid white",
        }}
      />
      <P style={{ height: 7, width: "55%", margin: "0 auto" }} />
      <P style={{ height: 6, width: "35%", margin: "0 auto" }} />
      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
        <P style={{ width: "45%", height: 11, borderRadius: 99 }} />
        <P
          style={{
            width: "28%",
            height: 11,
            borderRadius: 99,
            background: "transparent",
            boxShadow: `inset 0 0 0 1.5px ${BASE}`,
          }}
        />
      </div>
    </>
  ),
  Pulse: (
    <>
      {["75%", "60%", "90%", "50%"].map((w, i) => (
        <Row key={i}>
          <P
            style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0 }}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <P style={{ height: 6, width: w }} />
            <P style={{ height: 6, width: "50%" }} />
          </div>
        </Row>
      ))}
    </>
  ),
  Cascade: (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 4,
        }}
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <P key={i} style={{ aspectRatio: "1", borderRadius: 4 }} />
        ))}
      </div>
      <P style={{ height: 7, width: "60%" }} />
      <P style={{ height: 6, width: "40%" }} />
    </>
  ),
  Outline: (
    <>
      <P style={{ height: 44, borderRadius: 6 }} />
      <P style={{ height: 9, width: "75%" }} />
      <P style={{ height: 6, width: "100%" }} />
      <P style={{ height: 6, width: "60%" }} />
      <Row style={{ justifyContent: "space-between", marginTop: 2 }}>
        <Row style={{ gap: 5 }}>
          <P style={{ width: 14, height: 14, borderRadius: "50%" }} />
          <P style={{ width: 40, height: 6 }} />
        </Row>
        <P style={{ width: 24, height: 7, borderRadius: 99 }} />
      </Row>
    </>
  ),
};

function GalleryCell({ name }: { name: keyof typeof EFFECTS }) {
  const ref = useRef<HTMLDivElement>(null);
  const effect = EFFECTS[name];

  const run = async () => {
    const cell = ref.current;
    if (!cell || cell.dataset.animating === "true") return;
    cell.dataset.animating = "true";
    const parts = Array.from(
      cell.querySelectorAll<HTMLElement>("[data-gal-part]"),
    );
    // Everything an effect may touch, deduped (bars carry two data attributes).
    // The mocks are styled through React inline styles, so cleanup must RESTORE
    // each node's original style attribute, not wipe it — cssText = '' erases
    // the very styles that make the mock visible, and React never re-applies
    // them because the DOM changed underneath it, not the props.
    const touched = Array.from(
      new Set(
        Array.from(
          cell.querySelectorAll<HTMLElement>(
            "[data-gal-part], [data-gal-row], [data-gal-bar]",
          ),
        ),
      ),
    );
    const before = touched.map((el) => el.getAttribute("style"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      await wait(600);
    } else {
      await effect.run(parts, cell);
    }
    touched.forEach((el, i) => {
      const prev = before[i];
      if (prev === null) el.removeAttribute("style");
      else el.setAttribute("style", prev);
    });
    cell.dataset.animating = "false";
  };

  return (
    <div
      ref={ref}
      className="skelgal-cell"
      role="button"
      tabIndex={0}
      onClick={run}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void run();
        }
      }}
      style={{
        background: "white",
        border: "1px solid rgba(50, 47, 44, 0.1)",
        borderRadius: 12,
        padding: "16px 16px 14px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: 14,
          color: "var(--color-mo-black, #313030)",
        }}
      >
        {name}
      </div>
      <div style={{ fontSize: 11, color: "var(--color-mo-grey, #6B6A66)" }}>
        {effect.desc}
      </div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: "var(--color-mo-red, #B82431)",
          minHeight: 13,
        }}
      >
        {effect.mechanism}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          paddingTop: 4,
        }}
      >
        {MOCKS[name]}
      </div>
    </div>
  );
}

/**
 * Nine skeleton-loading patterns as reference cards — click a card to play
 * its effect. The loop-able ones (Shimmer, Gradient, Pulse, Cascade) are what
 * `animation` exposes; the rest are one-shot entrance effects shown for
 * reference only.
 */
export const EffectGallery: Story = {
  // A gallery: every variant side by side is the point, so it is wider than a
  // phone on purpose. Exempt from the width sweep rather than reshaped.
  tags: ["no-width-sweep"],
  name: "Effect Gallery (reference)",
  parameters: {
    docs: {
      source: {
        // Storybook prints a story's `render`, not the module around it —
        // which here is a wrapper referencing GALLERY_CSS, EFFECTS and
        // GalleryCell and shipping none of them, so Copy code handed over
        // three undefined identifiers. This is the reference gallery, and
        // what a reader wants from it is the prop, not the demo harness.
        language: "tsx",
        code: `// The gallery above is a reference for picking an effect — its cards are
// demo scaffolding, not code to copy. What you actually want is the prop:

<Skeleton animation="shimmer" variant="rectangular" width={240} height={140} />

// Shimmer, Gradient, Pulse and Cascade are true loading loops; \`animation\`
// exposes the two worth having as API:
//   pulse    opacity fade (default) — unchanged from before this prop existed
//   shimmer  gradient sweep, the pattern most products use
//   wave     shimmer + 120ms per line, so it travels down a text block

<Skeleton animation="wave" variant="text" lines={4} />

// Staggered, Typewriter, Layered, Elastic and Outline are one-shot ENTRANCE
// choreographies. They cannot hold an indefinite loading state, so they are
// shown here for reference and are deliberately not props.`,
      },
    },
  },
  render: () => (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "8px 0" }}>
      <style>{GALLERY_CSS}</style>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 24,
        }}
      >
        {(Object.keys(EFFECTS) as (keyof typeof EFFECTS)[]).map((name) => (
          <GalleryCell key={name} name={name} />
        ))}
      </div>
    </div>
  ),
};
