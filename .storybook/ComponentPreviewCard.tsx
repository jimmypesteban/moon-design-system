import React, { useCallback, useEffect, useRef, useState } from 'react';
import { colors } from '../tokens.mjs';
import { COMPONENT_BLURBS } from './component-blurbs';
import { DocsIndexCard, TILE_HEIGHT, TILE_WIDTH } from './DocsIndexCard';

/**
 * A component card for the Introduction's index: a live preview of the real
 * component, its name, and its plain-language blurb.
 *
 * The preview is the component itself in an iframe, scaled down — not a drawing
 * of it and not a screenshot. Both alternatives were considered and both need
 * someone to maintain them: an abstract tile drifts from the component with
 * nothing able to detect it, and a captured PNG is stale from the moment the
 * component changes until somebody remembers to regenerate it. This design
 * system is being handed over, so the version that stays true on its own is the
 * one worth having. A component added next year gets a preview for free.
 *
 * The cost is 48 iframes on one page, which is why nothing loads until it is
 * near the viewport, and why the resolved story index is shared rather than
 * fetched per card.
 */

/**
 * The frame is deliberately larger than the tile: wide components need room to
 * lay out naturally, and the scale below brings them back down. Content is
 * centred by the thumbnail decorator, so anything still wider than the tile
 * crops evenly instead of losing one side.
 */
const FRAME_WIDTH = 900;
const FRAME_HEIGHT = 500;

/** Breathing room between the component and the edge of the tile. */
const TILE_PADDING = 16;

/**
 * Used until the real content is measured, and if measuring ever fails.
 * Small enough that a large component does not flash oversized on first paint.
 */
const FALLBACK_SCALE = 0.42;

/**
 * How much a component may be enlarged. Storybook renders at real size, so 1
 * means "actual size" — the right ceiling for a preview, since a button blown up
 * to 180% would misrepresent it.
 */
const MAX_SCALE = 1;
const MIN_SCALE = 0.2;

/**
 * For components that report no width because they exist to fill a container.
 * Chosen so the tile reads as that container rather than as empty space.
 */
const FULL_WIDTH_SCALE = 0.55;

type StoryIndex = Record<string, string>;

/**
 * Where a component's *first* story is a poor thumbnail, the one to show
 * instead. Keyed by the component's id prefix.
 *
 * "First story wins" is a good default and wrong in a few places: Badge and Tag
 * both open on a single small pill and were indistinguishable side by side,
 * and Divider's and ProgressBar's first stories are a bare line, which reads as
 * an empty tile rather than as a component.
 */
const PREVIEW_STORY: Record<string, string> = {
  // The real button at threshold={0}: its default story is a 2000px scroll
  // demo where the button exists only past 500px, so the card used to carry a
  // "cannot preview this" placeholder instead of the component.
  'components-actions-backtotopbutton': 'static',
  'components-display-badge': 'all-variants',
  'components-display-tag': 'all-colors-fill',
  'components-feedback-progressbar': 'with-right-label',
  // Divider is a line. `with-label` puts "OR" in the middle of it, which reads
  // as a control rather than a rule.
  'components-display-divider': 'plain',
  // Kbd in a sentence, which is where a key cap makes sense — on its own it is
  // a small rounded box indistinguishable from a button.
  'components-display-kbd': 'inline-hint',
  // Overlays whose panel a story can render: the default story shows only the
  // trigger, so the card was a picture of a button.
  'components-overlays-modal': 'open-with-long-content',
  'components-overlays-popover': 'open',
  'components-overlays-tooltip': 'open',
  'components-navigation-dropdown': 'open',
  // The first page, which is the state a reader pictures: Prev disabled, page 1
  // current. `few-pages` showed "2 / 4" mid-sequence.
  'components-navigation-pagination': 'first-page',
  // A Card doing the job Card exists for, rather than a title over one line.
  'components-display-card': 'rich-content',
};

/**
 * Components no still image can represent, with the reason shown in the tile.
 *
 * BackToTopButton renders only once `window.scrollY` passes 500 and is fixed to
 * the viewport, so a frame that does not scroll can never contain it. Saying so
 * is better than an empty tile that reads as a broken preview.
 */
/**
 * Components whose story shrink-wraps around a child that wants to fill a
 * container, so the child collapses to nothing without a width to fill.
 * The value is the width the preview lays out at, in pixels.
 */
const THUMB_WIDTH: Record<string, number> = {
  'components-feedback-progressbar': 360,
  'components-forms-slider': 360,
  // A rule with no width to span is not a line at all.
  'components-display-divider': 300,
  // These lay out wider than the tile and were cropped mid-control — "5 / 12"
  // stacked into three lines with "Next" sliced off the edge.
  'components-navigation-pagination': 420,
  'components-navigation-steps': 460,
  // Its drop area fills its container, so an unbounded one rendered small.
  'components-forms-filedropzone': 380,
  // A full-page shell. Bounded so it measures reliably rather than falling
  // through to the fallback scale, which is what left it slightly small.
  'layouts-applayout': 520,
};

// Empty today, and that is the goal state: every card shows the real thing.
// The last two residents left when Dropdown gained a controllable open state
// and BackToTopButton gained a threshold prop — the escape hatch stays because
// the honest fallback for a genuinely unpreviewable component is saying so,
// not a broken tile.
const NO_STATIC_PREVIEW: Record<string, string> = {};

let indexPromise: Promise<StoryIndex> | null = null;

/**
 * Maps a component's id prefix to its first story.
 *
 * Read from Storybook's own index rather than assuming every component has a
 * story called "Default" — several do not, and a guessed id renders a "story not
 * found" panel inside the tile, which looks like a broken component rather than
 * a broken link. Resolved once per page and shared by every card.
 *
 * `./index.json` is relative to `iframe.html`, so this holds if Storybook is
 * ever served from a subpath.
 */
function loadStoryIndex(): Promise<StoryIndex> {
  indexPromise ??= fetch(new URL('./index.json', window.location.href).href)
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
    .then((body: { entries?: Record<string, { id: string; type: string }> }) => {
      const map: StoryIndex = {};
      for (const entry of Object.values(body.entries ?? {})) {
        if (entry.type !== 'story') continue;
        const prefix = entry.id.split('--')[0];
        // First story wins: Storybook lists them in file order, so this is the
        // component's own first export, which is the representative one.
        map[prefix] ??= entry.id;
      }
      return map;
    })
    .catch(() => ({}));
  return indexPromise;
}

export function ComponentPreviewCard({ name, docsId }: { name: string; docsId: string }) {
  const [storyId, setStoryId] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);
  const [scale, setScale] = useState(FALLBACK_SCALE);
  const prefix = docsId.split('--')[0];
  const cannotPreview = NO_STATIC_PREVIEW[prefix];

  // Deferral is the browser's job, via `loading="lazy"` on the iframe below.
  // An IntersectionObserver gate used to stand in front of this, and it was the
  // wrong tool: when it failed to fire the card had no preview at all and
  // nothing said why. A native lazy iframe cannot fail to open.
  useEffect(() => {
    if (cannotPreview) return;
    let active = true;
    void loadStoryIndex().then((index) => {
      if (!active) return;
      const override = PREVIEW_STORY[prefix];
      setStoryId(override ? `${prefix}--${override}` : (index[prefix] ?? null));
      setResolved(true);
    });
    return () => {
      active = false;
    };
  }, [prefix, cannotPreview]);

  const blurb = COMPONENT_BLURBS[name];

  /**
   * Fit the component to the tile rather than scaling everything by the same
   * factor. One fixed scale cannot serve both a Select and an AppLayout: at 42%
   * the small controls were a fraction of an otherwise empty tile, and at a
   * scale that suited them the large layouts were unreadable crops.
   *
   * Measuring the story's own content — not the frame, which is fixed — gives
   * each component the largest scale that still fits, capped at actual size so
   * nothing is shown bigger than it really is.
   *
   * The iframe is same-origin, so this is a plain DOM read rather than a trick.
   * On any failure the fallback scale stands and the preview is merely
   * mis-sized, never missing.
   */
  const fitToTile = useCallback((frame: HTMLIFrameElement | null) => {
    if (!frame) return;
    // #storybook-root > the thumbnail decorator's centring wrapper > the story.
    const contentNode = (f: HTMLIFrameElement): HTMLElement | null => {
      try {
        const root = f.contentDocument?.querySelector('#storybook-root');
        return (root?.firstElementChild?.firstElementChild ?? root?.firstElementChild ?? null) as
          | HTMLElement
          | null;
      } catch {
        return null;
      }
    };
    const measure = () => {
      try {
        const content = contentNode(frame);
        if (!content) return false;
        // Portalled overlays are not inside #storybook-root — Modal, Popover and
        // Tooltip render their panel into document.body — so the story box comes
        // back 0x0 and the card fell through to a guessed scale. Include the
        // portalled nodes, skipping anything that covers almost the whole frame:
        // a Modal's backdrop is `fixed inset-0`, and measuring that would size
        // the preview to the frame and shrink the panel to nothing.
        const doc = frame.contentDocument;
        const portals: DOMRect[] = [];
        if (doc) {
          const frameArea = doc.documentElement.clientWidth * doc.documentElement.clientHeight;
          for (const node of Array.from(doc.body.children)) {
            if (node.id === 'storybook-root' || node.contains(content)) continue;
            if (/^(SCRIPT|STYLE|LINK)$/.test(node.tagName)) continue;
            for (const el of [node, ...Array.from(node.querySelectorAll('*'))]) {
              const box = el.getBoundingClientRect();
              if (!box.width || !box.height) continue;
              if (box.width * box.height > frameArea * 0.85) continue;
              portals.push(box);
            }
          }
        }
        const rect = content.getBoundingClientRect();
        // A component with no intrinsic width — Pagination, ProgressBar,
        // Divider — measures 0 as a centred flex item, because it wants to fill
        // a container rather than size itself. scrollWidth recovers the ones
        // whose children still lay out; a Divider is a line with no content at
        // all and recovers nothing.
        let width = Math.max(rect.width, content.scrollWidth);
        let height = Math.max(rect.height, content.scrollHeight);
        if (portals.length) {
          // The panel, not the trigger: an open overlay's own box is what the
          // card should be sized to.
          width = Math.max(width, ...portals.map((b) => b.width));
          height = Math.max(height, ...portals.map((b) => b.height));
        }

        if (!width) {
          // Nothing to fit to, so choose rather than guess: a full-width
          // component is shown at a size where the tile reads as its container.
          setScale(FULL_WIDTH_SCALE);
          return true;
        }
        if (!height) return false;

        const byWidth = (TILE_WIDTH - TILE_PADDING) / width;
        const byHeight = (TILE_HEIGHT - TILE_PADDING) / height;

        // Stories that demonstrate scrolling are the exception to fitting the
        // whole thing in. BackToTopButton's is 2000px tall; fitting its height
        // put the button at 0.12, past the floor and invisible. Where content
        // is far taller than the tile, fit the width and let it crop — the
        // frame already shows only the top of it, which is where the component
        // is. Threshold is three times the tile's own aspect, so an ordinary
        // tall-ish component still fits whole.
        const tooTall = height / width > (TILE_HEIGHT / TILE_WIDTH) * 3;
        const next = tooTall ? Math.min(MAX_SCALE, byWidth) : Math.min(MAX_SCALE, byWidth, byHeight);
        setScale(Math.max(MIN_SCALE, next));
        return true;
      } catch {
        return false;
      }
    };
    // Storybook renders after `load`, and web fonts land after that, so one read
    // measures either nothing or a pre-font layout. A ResizeObserver on the
    // content handles every later change; the interval only exists to find the
    // content in the first place, and stops as soon as it does.
    //
    // The previous version was an interval alone, capped at two seconds. With
    // 48 iframes loading together that window expired before some of them had
    // rendered, and those cards kept the fallback scale for good — Pagination
    // sat at 0.42 while its content would have fitted at 1:1.
    let observer: ResizeObserver | null = null;
    const watch = () => {
      const content = contentNode(frame);
      if (!content || typeof ResizeObserver === 'undefined') return false;
      observer = new ResizeObserver(() => measure());
      observer.observe(content);
      return true;
    };

    let tries = 0;
    const timer = setInterval(() => {
      const found = measure();
      if (found) watch();
      if (found || ++tries > 100) clearInterval(timer);
    }, 100);
    measure();
    watch();

    return () => {
      clearInterval(timer);
      observer?.disconnect();
    };
  }, []);

  return (
    <DocsIndexCard href={`/?path=/docs/${docsId}`} name={name} blurb={blurb}>
      {cannotPreview ? (
        // Said out loud rather than left blank. An empty tile reads as a
        // preview that failed; this reads as a component that cannot have one.
        <span
          style={{
            fontSize: 12,
            lineHeight: 1.5,
            color: colors['mo-grey'][6],
            textAlign: 'center',
            padding: '0 20px',
          }}
        >
          {cannotPreview}
        </span>
      ) : storyId ? (
        <iframe
          src={`iframe.html?id=${storyId}&viewMode=story&globals=${
            THUMB_WIDTH[prefix] ? `thumb:on;thumbWidth:${THUMB_WIDTH[prefix]}` : 'thumb:on'
          }`}
          title={`${name} preview`}
          loading="lazy"
          tabIndex={-1}
          scrolling="no"
          ref={fitToTile}
          onLoad={(e) => fitToTile(e.currentTarget)}
          style={{
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT,
            border: 0,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            flex: 'none',
            // The card is the click target; the preview is not interactive.
            pointerEvents: 'none',
          }}
        />
      ) : resolved ? (
        <span style={{ fontSize: 12, color: colors['mo-grey'][6] }}>{name}</span>
      ) : null}
    </DocsIndexCard>
  );
}
