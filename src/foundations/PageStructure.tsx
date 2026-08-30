import React, { useState } from "react";
import { borderRadius, colors } from "../../tokens.mjs";

/**
 * A page-structure map for Moon, not a generic HTML lesson.
 *
 * Every landmark below names the design-system component that renders it, because
 * the useful question here is not "what does <nav> mean" — it is "do I get one
 * already, or do I have to write it". Four components render a <nav> and one
 * renders the <main>, so most of this page is already decided for you the
 * moment you use AppLayout and TopNav.
 *
 * Hovering or clicking any part links the three views: the wireframe region,
 * its description, and its line in the markup. They are the same information
 * at three levels of abstraction, and the point is that they are one thing.
 */

type Landmark = {
  tag: string;
  /** Step 6 — the brand hex. Used for the tint and border only. */
  hue: string;
  /**
   * Where the white-on-colour label sits. NOT always step 6: white text needs
   * 4.5:1, and step 6 only clears it for the dark hues. Orange gives 2.87,
   * green 2.18 and blue 3.10 — all failures, and all of them the pairing the
   * brand doc forbids anyway ("Red/Black bg → White only"). Each hue therefore
   * uses the LIGHTEST step of its own ramp where white passes, which keeps the
   * hue identity while making the label readable. This is the "use the ramp"
   * advice from the Colors page, applied to the page next to it.
   */
  label: string;
  what: string;
  /** Which design-system component gives you this element, if any. */
  from: string | null;
  /** How many times it appears across apps/ today. */
  uses: number;
};

const LANDMARKS: Landmark[] = [
  {
    tag: "header",
    hue: colors["mo-orange"][6],
    label: colors["mo-orange"][8],
    what: "Branding and page-level intro",
    from: null,
    uses: 69,
  },
  {
    tag: "nav",
    hue: colors["mo-green"][6],
    label: colors["mo-green"][9],
    what: "A set of navigation links",
    from: "TopNav, Breadcrumb, Pagination, StepperNav",
    uses: 43,
  },
  {
    tag: "main",
    hue: colors["mo-blue"][6],
    label: colors["mo-blue"][8],
    what: "The one primary content area",
    from: "AppLayout",
    uses: 61,
  },
  {
    tag: "section",
    hue: colors["mo-purple"][6],
    label: colors["mo-purple"][6],
    what: "A themed group, needs a heading",
    from: null,
    uses: 419,
  },
  {
    tag: "article",
    hue: colors["mo-red"][6],
    label: colors["mo-red"][6],
    what: "Content that stands on its own",
    from: null,
    uses: 21,
  },
  {
    tag: "aside",
    hue: colors["mo-forest"][6],
    label: colors["mo-forest"][6],
    what: "Tangential or supporting content",
    from: null,
    uses: 31,
  },
  {
    tag: "footer",
    hue: colors["mo-ocean"][6],
    label: colors["mo-ocean"][6],
    what: "Closing info for its section",
    from: null,
    uses: 10,
  },
  {
    tag: "form",
    hue: colors["mo-grey"][7],
    label: colors["mo-grey"][9],
    what: "A form — a landmark only when named",
    from: null,
    uses: 49,
  },
];

/**
 * Not every one of these is a landmark, which is the trap.
 *
 * `header`, `nav`, `main`, `aside` and `footer` always are. `section` and
 * `form` are exposed as landmarks ONLY when they carry an accessible name
 * (aria-label / aria-labelledby) — without one they are generic containers, no
 * different to a `<div>` as far as assistive tech is concerned. And `article`
 * is role=article, which is not a landmark at all.
 *
 * That distinction is not pedantic here: of 419 `<section>` and 49 `<form>`
 * elements in apps/, twenty carry a name. So 448 elements that look like
 * landmarks in a grep are not landmarks, and counting tags overstates our real
 * coverage by roughly a factor of three.
 */
const NEEDS_NAME = ["section", "form"];

const ROOT_CLASS = "mo-pagestructure";
const SPLIT_CLASS = "mo-pagestructure-split";
const FRAME_CLASS = "mo-pagestructure-frame";
const GROW_CLASS = "mo-pagestructure-grow";

/**
 * Two rules that cannot be inline styles.
 *
 * The wireframe was 334px against a 433px list, so the column ended 99px short
 * and the card looked truncated rather than deliberate. `align-items: stretch`
 * makes both columns the height of the row, and the extra space goes to the
 * <main> region alone — not spread across all of them — because main IS the
 * flexible content area on a real page, so growing it keeps the diagram
 * honest while header, nav and footer stay their natural size.
 *
 * That only makes sense while there ARE two columns. The grid previously never
 * collapsed: at any width it stayed 1.35fr/1fr and simply squeezed, so a narrow
 * pane got two cramped columns instead of one readable one. Below 620px it is
 * a single column, and stretching is switched back off, since matching heights
 * between stacked blocks means nothing.
 *
 * GROW_CLASS is reused on main's children — the section/aside row and the
 * article — so main's extra height reaches them instead of pooling as blank
 * space at the bottom of main. Grid items stretch by default, so section and
 * aside fill their row without needing anything of their own. All of it
 * switches off in the single-column case along with the rest.
 *
 * A CONTAINER query because this sits in a docs pane whose width is unrelated
 * to the viewport's — the same reason the contrast checker uses one.
 */
const STRUCTURE_CSS = `
.${ROOT_CLASS} { container-type: inline-size; container-name: mo-pagestructure; }
/* Storybook's docs CSS sets font-size on plain divs and spans inside .sbdocs,
   and ANY matching rule beats inheritance — so an element nested in a 12px
   parent silently rendered at 16px. It hit every line of the markup pane and
   every trailing comment in the code sample. Restoring inheritance fixes the
   whole set at once and cannot clobber a deliberate size: inline styles
   outrank a stylesheet, so the explicit fontSize values still win. */
.${ROOT_CLASS} :is(div, span):not([style*="font-size"]) { font-size: inherit; }
.${SPLIT_CLASS} {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;
}
.${FRAME_CLASS} { height: 100%; }
.${GROW_CLASS} { flex: 1; }
@container mo-pagestructure (max-width: 620px) {
  .${SPLIT_CLASS} { grid-template-columns: minmax(0, 1fr); align-items: start; }
  .${FRAME_CLASS} { height: auto; }
  .${GROW_CLASS} { flex: 0 1 auto; }
}
`;

function StructureStyle() {
  return (
    <style href="mo-pagestructure" precedence="medium">
      {STRUCTURE_CSS}
    </style>
  );
}

/**
 * Measured across apps/ on 24 Aug 2026 — a snapshot, not a live figure.
 *
 * The first version charted landmarks against <div> count, which is not a real
 * ratio: a page needs roughly six landmarks whether it holds 40 divs or 4,000,
 * and the bar length was that ratio times an arbitrary 800 to make it visible.
 * It looked quantitative and said nothing, so it is a table now, one column per
 * thing that decides whether a screen-reader user can skip to the content.
 *
 * `main` separates an app's own <main> from one AppLayout supplies, because a
 * source grep alone reports FOUR apps as having none when the component gives
 * it to them. Only analytics and assistant genuinely lack one.
 */
const AUDIT = [
  { app: "consumer", main: "own", nav: 39, other: 99, unnamed: 409 },
  { app: "grader", main: "AppLayout", nav: 2, other: 4, unnamed: 9 },
  { app: "analytics", main: "none", nav: 0, other: 5, unnamed: 19 },
  { app: "users", main: "own", nav: 1, other: 0, unnamed: 2 },
  { app: "calibration", main: "AppLayout", nav: 0, other: 0, unnamed: 2 },
  { app: "rubrics", main: "AppLayout", nav: 0, other: 0, unnamed: 5 },
  { app: "assistant", main: "none", nav: 1, other: 1, unnamed: 1 },
  { app: "dashboard", main: "AppLayout", nav: 0, other: 1, unnamed: 1 },
];

const INK = colors["mo-black"];
const MUTED = colors["mo-grey"].DEFAULT;
const LINE = colors["mo-grey"][3];
const R = {
  card: borderRadius["mo-md"],
  inner: borderRadius["mo-sm"],
  pill: borderRadius["mo-full"],
};

const byTag = (t: string) => LANDMARKS.find((l) => l.tag === t)!;

function Region({
  tag,
  active,
  onPick,
  style,
  className,
  children,
}: {
  tag: string;
  active: string | null;
  onPick: (t: string | null) => void;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
}) {
  const l = byTag(tag);
  const isOn = active === tag;
  const dimmed = active !== null && !isOn;
  return (
    <div
      role="button"
      tabIndex={0}
      className={className}
      aria-pressed={isOn}
      aria-label={`<${tag}> — ${l.what}`}
      onMouseEnter={() => onPick(tag)}
      onFocus={() => onPick(tag)}
      onClick={(e) => {
        e.stopPropagation();
        onPick(isOn ? null : tag);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPick(isOn ? null : tag);
        }
      }}
      style={{
        position: "relative",
        border: `1.5px ${isOn ? "solid" : "dashed"} ${l.hue}${isOn ? "" : "66"}`,
        borderRadius: R.inner,
        padding: "16px 8px 8px",
        background: `${l.hue}0F`,
        opacity: dimmed ? 0.35 : 1,
        transition: "opacity 160ms ease, border-color 160ms ease",
        cursor: "pointer",
        minWidth: 0,
        ...style,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: -8,
          left: 8,
          background: l.label,
          color: "#fff",
          fontFamily: "ui-monospace, monospace",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.08em",
          padding: "2px 6px",
          borderRadius: R.pill,
          lineHeight: 1,
        }}
      >
        {tag.toUpperCase()}
      </span>
      {children}
    </div>
  );
}

/** Grey filler bars, so the wireframe reads as layout rather than as content. */
function Bar({ w = "100%", h = 6 }: { w?: string | number; h?: number }) {
  return (
    <div
      style={{ width: w, height: h, borderRadius: 3, background: `${INK}1A` }}
    />
  );
}

export function PageStructure() {
  const [active, setActive] = useState<string | null>(null);
  const clear = () => setActive(null);

  return (
    /*
     * onMouseLeave clears, because hover sets the highlight and without it the
     * last thing pointed at stays lit after the pointer has gone — which reads
     * as a stuck selection rather than a hover. onClick still clears too, so a
     * click anywhere in the whitespace resets, and clicking an already-active
     * part toggles it off.
     */
    <div
      onClick={clear}
      onMouseLeave={clear}
      /* marginBottom matches the Colors page's pairing groups: without it the
         next MDX heading sits flush against the audit card and reads as part
         of it rather than as the section after it. */
      className={ROOT_CLASS}
      style={{
        marginTop: 16,
        marginBottom: 40,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <StructureStyle />
      <div className={SPLIT_CLASS}>
        {/* ── wireframe ── */}
        <div
          className={FRAME_CLASS}
          style={{
            border: `1px solid ${LINE}`,
            borderRadius: R.card,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            background: "#fff",
          }}
        >
          <Region tag="header" active={active} onPick={setActive}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: R.pill,
                  background: `${INK}1A`,
                }}
              />
              <Bar w={70} />
              <div style={{ flex: 1 }} />
              <Bar w={28} />
              <Bar w={28} />
            </div>
          </Region>

          <Region tag="nav" active={active} onPick={setActive}>
            <div style={{ display: "flex", gap: 6 }}>
              <Bar w={40} h={8} />
              <Bar w={40} h={8} />
              <Bar w={40} h={8} />
            </div>
          </Region>

          <Region
            tag="main"
            active={active}
            onPick={setActive}
            className={GROW_CLASS}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                height: "100%",
              }}
            >
              <div
                className={GROW_CLASS}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                  gap: 12,
                }}
              >
                <Region tag="section" active={active} onPick={setActive}>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <Bar w="60%" h={8} />
                    <Bar />
                    <Bar w="80%" />
                  </div>
                </Region>
                <Region tag="aside" active={active} onPick={setActive}>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <Bar w="50%" h={8} />
                    <Bar w="70%" />
                    <Bar w="60%" />
                  </div>
                </Region>
              </div>
              <Region
                tag="article"
                active={active}
                onPick={setActive}
                className={GROW_CLASS}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div
                    style={{
                      width: 40,
                      height: 28,
                      borderRadius: 4,
                      background: `${INK}1A`,
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <Bar w="80%" h={8} />
                    <Bar w="50%" />
                  </div>
                </div>
              </Region>
            </div>
          </Region>

          <Region tag="footer" active={active} onPick={setActive}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Bar w={50} />
              <div style={{ flex: 1 }} />
              <Bar w={24} />
              <Bar w={24} />
            </div>
          </Region>
        </div>

        {/* ── the list, and what gives you each one ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {LANDMARKS.map((l) => {
            const isOn = active === l.tag;
            return (
              <div
                key={l.tag}
                role="button"
                tabIndex={0}
                aria-pressed={isOn}
                onMouseEnter={() => setActive(l.tag)}
                onFocus={() => setActive(l.tag)}
                onClick={(e) => {
                  e.stopPropagation();
                  setActive(isOn ? null : l.tag);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActive(isOn ? null : l.tag);
                  }
                }}
                style={{
                  border: `1.5px solid ${isOn ? l.hue : LINE}`,
                  background: isOn ? `${l.hue}12` : "#fff",
                  borderRadius: R.inner,
                  padding: "8px 12px",
                  cursor: "pointer",
                  opacity: active !== null && !isOn ? 0.4 : 1,
                  transition:
                    "opacity 160ms ease, border-color 160ms ease, background 160ms ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <code
                    style={{
                      fontFamily: "ui-monospace, monospace",
                      fontSize: 12,
                      fontWeight: 700,
                      color: l.label,
                    }}
                  >
                    &lt;{l.tag}&gt;
                  </code>
                  <span style={{ fontSize: 12, color: INK }}>{l.what}</span>
                  {NEEDS_NAME.includes(l.tag) && (
                    <span
                      title="Only exposed as a landmark when it carries aria-label or aria-labelledby"
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        color: colors["mo-red"][8],
                        background: colors["mo-red"][1],
                        borderRadius: R.pill,
                        padding: "2px 6px",
                      }}
                    >
                      NEEDS A NAME
                    </span>
                  )}
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 10.5,
                      color: MUTED,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {l.uses} in apps/
                  </span>
                </div>
                {l.from && (
                  <div style={{ fontSize: 10.5, color: MUTED, marginTop: 4 }}>
                    You get this from{" "}
                    <strong style={{ color: INK }}>{l.from}</strong>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── the same thing as markup ── */}
      <div
        style={{
          border: `1px solid ${LINE}`,
          borderRadius: R.card,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <div
          style={{
            padding: "8px 12px",
            borderBottom: `1px solid ${LINE}`,
            fontSize: 11,
            color: MUTED,
          }}
        >
          The same page, as markup
        </div>
        <pre
          style={{
            margin: 0,
            padding: 12,
            fontFamily: "ui-monospace, monospace",
            fontSize: 12,
            lineHeight: 1.7,
            overflowX: "auto",
          }}
        >
          {[
            { t: null, code: "<body>" },
            { t: "header", code: "  <header> … </header>" },
            { t: "nav", code: '  <nav aria-label="Main"> … </nav>' },
            { t: "main", code: '  <main id="main-content">' },
            { t: "section", code: "    <section> … </section>" },
            { t: "aside", code: "    <aside> … </aside>" },
            { t: "article", code: "    <article> … </article>" },
            { t: "main", code: "  </main>" },
            { t: "footer", code: "  <footer> … </footer>" },
            { t: null, code: "</body>" },
          ].map((line, i) => {
            const isOn = line.t !== null && active === line.t;
            return (
              <div
                key={i}
                onMouseEnter={() => line.t && setActive(line.t)}
                onClick={(e) => {
                  if (!line.t) return;
                  e.stopPropagation();
                  setActive(active === line.t ? null : line.t);
                }}
                style={{
                  background: isOn ? `${byTag(line.t!).hue}1A` : "transparent",
                  color: line.t ? byTag(line.t).label : MUTED,
                  borderRadius: 4,
                  padding: "0 4px",
                  cursor: line.t ? "pointer" : "default",
                  opacity:
                    active !== null && !isOn && line.t !== null ? 0.4 : 1,
                  transition: "background 160ms ease, opacity 160ms ease",
                  whiteSpace: "pre",
                }}
              >
                {line.code}
              </div>
            );
          })}
        </pre>
      </div>

      {/* ── where Moon actually stands ── */}
      <div
        style={{
          border: `1px solid ${LINE}`,
          borderRadius: R.card,
          padding: 16,
          background: "#fff",
        }}
      >
        <div style={{ fontSize: 12, color: INK, marginBottom: 12 }}>
          <strong>Can a screen-reader user skip to the content?</strong> One row
          per app, measured 24 Aug 2026. <code>&lt;main&gt;</code> is the
          landmark that matters most — it is what a skip-to-content jump lands
          on, and there should be exactly one per page. <strong>Unnamed</strong>{" "}
          counts <code>&lt;section&gt;</code>/<code>&lt;form&gt;</code> with no
          accessible name — structure in the source, invisible to assistive
          tech, and the cheapest thing here to fix. What &ldquo;name&rdquo;
          means is below the table.
        </div>
        {/* The fixed column widths below add up to ~424px, so in a narrow docs
            pane the table cannot shrink to fit and used to push the whole page
            sideways. It scrolls inside this wrapper instead. */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 11.5,
              minWidth: 424,
            }}
          >
            <thead>
              <tr
                style={{
                  textAlign: "left",
                  borderBottom: `1px solid ${LINE}`,
                  color: MUTED,
                }}
              >
                <th style={{ padding: "6px 8px", fontWeight: 500 }}>App</th>
                <th style={{ padding: "6px 8px", fontWeight: 500, width: 124 }}>
                  &lt;main&gt;
                </th>
                <th style={{ padding: "6px 8px", fontWeight: 500, width: 64 }}>
                  &lt;nav&gt;
                </th>
                <th style={{ padding: "6px 8px", fontWeight: 500, width: 140 }}>
                  header/aside/footer
                </th>
                <th style={{ padding: "6px 8px", fontWeight: 500, width: 96 }}>
                  unnamed
                </th>
              </tr>
            </thead>
            <tbody>
              {AUDIT.map((a) => {
                const noMain = a.main === "none";
                return (
                  <tr
                    key={a.app}
                    style={{
                      borderBottom: `1px solid ${colors["mo-grey"][2]}`,
                    }}
                  >
                    <td style={{ padding: "7px 8px", color: INK }}>{a.app}</td>
                    <td style={{ padding: "7px 8px" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: R.pill,
                          color: noMain
                            ? colors["mo-red"][8]
                            : colors["mo-forest"][6],
                          background: noMain
                            ? colors["mo-red"][1]
                            : colors["mo-green"][1],
                        }}
                      >
                        {noMain
                          ? "MISSING"
                          : a.main === "own"
                            ? "yes"
                            : "via AppLayout"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "7px 8px",
                        color: a.nav ? MUTED : colors["mo-red"][8],
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {a.nav}
                    </td>
                    <td
                      style={{
                        padding: "7px 8px",
                        color: MUTED,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {a.other}
                    </td>
                    <td
                      style={{
                        padding: "7px 8px",
                        color: a.unnamed ? colors["mo-red"][8] : MUTED,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {a.unnamed}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* What "name" means. The caption used to say "no accessible name" and
            stop there, which reliably produced the question "named what?" — so
            both answers are here, with real call sites rather than invented
            ones. The counts above are measured by the same rule: an opening
            <section>/<form> tag carrying aria-label or aria-labelledby. */}
        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: `1px solid ${LINE}`,
            fontSize: 12,
            color: MUTED,
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: INK }}>Named how, and named what?</strong> A
          name is the words a screen reader speaks next to the role — not an
          attribute called <code>name</code>. An unnamed{" "}
          <code>&lt;section&gt;</code> is not announced as an unnamed region; it
          is <em>absent from the landmark menu entirely</em>, which is why those
          448 are not badly-labelled landmarks so much as not landmarks.
          <div
            style={{
              marginTop: 10,
              padding: "10px 12px",
              // grey[2], not grey[1] — grey[1] is pure #FFF and would be
              // invisible against this card's white background.
              background: colors["mo-grey"][2],
              borderRadius: R.inner,
              fontFamily: "ui-monospace, monospace",
              fontSize: 11,
              lineHeight: 1.9,
              color: INK,
              overflowX: "auto",
            }}
          >
            <div>
              &lt;h3 id=&quot;skills-heading&quot;&gt;Skills&lt;/h3&gt;{" "}
              <span style={{ color: MUTED }}>{"// already on screen"}</span>
            </div>
            <div>
              &lt;section aria-labelledby=&quot;skills-heading&quot;&gt;{" "}
              <span style={{ color: colors["mo-forest"][6] }}>
                {'// → "Skills, region"'}
              </span>
            </div>
            <div style={{ marginTop: 6 }}>
              &lt;section aria-label=&quot;Proposal queue&quot;&gt;{" "}
              <span style={{ color: colors["mo-forest"][6] }}>
                {'// → "Proposal queue, region"'}
              </span>
            </div>
            <div>
              &lt;section&gt;{" "}
              <span style={{ color: colors["mo-red"][8] }}>
                {"// → announced as nothing at all"}
              </span>
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 12 }}>
            So the name is not something you invent: every one of these sections
            already has a heading a sighted reader uses, and nothing connects
            the two. Prefer <code>aria-labelledby</code> pointing at that
            heading — the name then <em>is</em> the visible text, so it cannot
            drift out of sync the way a hand-typed string does. 18 of our 20
            named regions do it that way.
          </div>
        </div>
      </div>
    </div>
  );
}
