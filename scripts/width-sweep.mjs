#!/usr/bin/env node
/**
 * Width sweep — renders every story at several widths and fails if
 * anything overflows horizontally.
 *
 * Why this exists: nothing else in CI renders a component at more than one
 * width. The audio player shipped for months and broke only inside a 340px
 * sidebar; `Pagination` overflowed by 84px at iPhone width. Both were found by
 * hand, which does not scale and does not survive an owner leaving.
 *
 * Why a real browser: jsdom computes no layout, so `scrollWidth` is always 0
 * there and every assertion would pass vacuously. This drives the same
 * `storybook-static` build the CI Storybook job already produces.
 *
 * Opt-out, not opt-in. A gallery story that lays twenty variants in a row is
 * *supposed* to be wider than a phone, so it carries the `no-width-sweep` tag:
 *
 *   export const AllVariants: Story = { tags: ['no-width-sweep'], ... };
 *
 * The direction matters. With opt-in, a new component nobody tagged gets no
 * coverage at all, and the check quietly decays to nothing — which is the one
 * outcome this is meant to prevent. Opt-out means new work is covered by
 * default and exemptions are visible in review.
 *
 * Usage:
 *   node scripts/width-sweep.mjs            # build + sweep
 *   node scripts/width-sweep.mjs --url URL  # sweep a running instance
 *   node scripts/width-sweep.mjs --widths 320,768
 */

import { createServer } from 'node:http';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const SHARED_UI = resolve(HERE, '..');
const STATIC_DIR = join(SHARED_UI, 'storybook-static');

const EXEMPT_TAG = 'no-width-sweep';
// Stories that render an overlay already open. They get two extra assertions,
// because the in-flow one is meaningless for them: a fixed, portalled panel
// does not extend the page's scrollWidth, it just sits partly off-screen.
const OVERLAY_TAG = 'overlay-open';
// The widths the design system itself declares it supports: the Storybook
// viewport presets in .storybook/preview.ts, which track the brand breakpoint
// scale (sm/md/lg = 375/768/1024). Checking anything else would be a number I
// picked rather than a number the system promises.
//
// 320px is deliberately NOT a default. It is narrower than the declared floor,
// and at 320 a tail of navigation chrome overflows by 18-32px (Steps, Tabs,
// TopNav). That is real but out of contract, and it is listed in
// docs/design-system-handoff.md rather than hidden. Run it explicitly when you
// want the stricter answer:  --widths 320,375,768,1024
const DEFAULT_WIDTHS = [375, 768, 1024];
// A story is allowed to exceed its viewport by this much before failing.
// Sub-pixel layout rounding shows up as 1px fairly often and is not a bug.
const TOLERANCE_PX = 1;
// A short settle after render: transitions and any layout effect that runs on
// mount can move things one frame later.
const SETTLE_MS = 120;
// Design and accessibility checks measured from the rendered page. Both carry a
// real existing baseline, so they are recorded in width-sweep-baseline.json
// rather than blocking: known failures are reported and tolerated, anything new
// fails. Regenerate deliberately with --update-baseline, never casually.
const BASELINE_PATH = join(SHARED_UI, 'width-sweep-baseline.json');
// WCAG 2.5.8 (AA, WCAG 2.2). 44px is 2.5.5, which is AAA and would flag a lot of
// deliberate 32px controls.
const MIN_TARGET_PX = 24;
// The brand faces come from Google Fonts via .storybook/preview.css.
const FONT_HOSTS = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];
const BRAND_FONT = 'Source Sans 3';

const argv = process.argv.slice(2);
const argOf = (flag) => {
  const i = argv.indexOf(flag);
  return i === -1 ? null : argv[i + 1];
};
const widths = (argOf('--widths') ?? '').trim()
  ? argOf('--widths').split(',').map((w) => Number(w.trim()))
  : DEFAULT_WIDTHS;
const externalUrl = argOf('--url');
const updateBaseline = argv.includes('--update-baseline');

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.ttf': 'font/ttf', '.map': 'application/json',
};

async function serveStatic(dir) {
  const server = createServer(async (req, res) => {
    try {
      const clean = decodeURIComponent((req.url ?? '/').split('?')[0]);
      let filePath = join(dir, clean === '/' ? 'index.html' : clean);
      const info = await stat(filePath).catch(() => null);
      if (info?.isDirectory()) filePath = join(filePath, 'index.html');
      const body = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const { port } = server.address();
  return { url: `http://127.0.0.1:${port}`, close: () => new Promise((r) => server.close(r)) };
}

function run(cmd, args, cwd) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
    p.on('exit', (code) => (code === 0 ? res() : rej(new Error(`${cmd} exited ${code}`))));
  });
}

async function main() {
  let host = externalUrl;
  let stop = async () => {};

  if (!host) {
    if (!(await stat(STATIC_DIR).catch(() => null))) {
      console.log('Building Storybook…');
      await run('npm', ['run', 'build-storybook'], SHARED_UI);
    }
    const served = await serveStatic(STATIC_DIR);
    host = served.url;
    stop = served.close;
  }

  try {
    await sweep(host);
  } finally {
    // Whatever happened, stop listening. A throw after serveStatic() otherwise
    // leaves this socket holding Node's event loop open, and the process never
    // exits: a one-second launch failure sat in CI for 44 minutes before the
    // job was cancelled, which is what made it look like a slow check rather
    // than a broken one.
    await stop();
  }
}

async function sweep(host) {
  const { chromium } = await import('playwright');
  let browser;
  try {
    browser = await chromium.launch();
  } catch (err) {
    // The runner's Playwright cache can hold a different browser revision than
    // the `playwright` package here resolves to, and the message Playwright
    // prints does not say which job is missing it. Say so plainly.
    throw new Error(
      `Could not launch Chromium for the width sweep.\n` +
        `  Install it in whatever job runs this: npx playwright install chromium\n` +
        `  Original: ${String(err).split('\n')[0]}`
    );
  }
  const page = await browser.newPage();

  const index = await page.evaluate(
    async (u) => (await fetch(`${u}/index.json`)).json(),
    host
  ).catch(async () => {
    // A blank page cannot fetch cross-origin; land on the host first.
    await page.goto(`${host}/iframe.html`, { waitUntil: 'domcontentloaded' });
    return page.evaluate(async (u) => (await fetch(`${u}/index.json`)).json(), host);
  });

  const stories = Object.values(index.entries).filter((e) => e.type === 'story');
  const swept = stories.filter((s) => !(s.tags ?? []).includes(EXEMPT_TAG));
  const exempt = stories.length - swept.length;

  console.log(
    `Sweeping ${swept.length} stories at ${widths.join(', ')}px` +
      (exempt ? ` (${exempt} exempt via ${EXEMPT_TAG})` : '')
  );

  // Concurrency, because this is 3 page loads per story and doing them one at a
  // time took 189s locally and roughly five times that on a cold CI runner.
  //
  // The tempting optimisation is one load per story with a resize between
  // widths — a third of the navigations. Not done on purpose: a component that
  // measures itself on mount and keeps the result in state would not re-render
  // on resize, so it would be measured at the wrong width and pass. That is the
  // same false-green shape as the empty-root bug above, and speed is not worth
  // reintroducing it. Parallel loads keep every measurement a real first paint.
  // Decide once whether the brand faces are reachable. .storybook/preview.css
  // imports them from Google Fonts, so on a runner without egress every page
  // load otherwise waits on a request that will never arrive — which is what
  // left this job sitting for 17 minutes while all 35 other jobs had passed.
  // One 3s probe replaces 579 slow discoveries.
  const fontsReachable = await page
    .evaluate(
      (hosts) =>
        Promise.race([
          fetch(`${hosts[0]}/css2?family=Source+Sans+3:wght@400&display=swap`, { mode: 'no-cors' })
            .then(() => true)
            .catch(() => false),
          new Promise((r) => setTimeout(() => r(false), 3000)),
        ]),
      FONT_HOSTS
    )
    .catch(() => false);

  // Known contrast and hit-target findings. Anything not in here is new and
  // fails; anything in here is reported as debt and tolerated. Recording the
  // debt beats a check nobody can turn on.
  let baseline = {};
  try {
    baseline = JSON.parse(await readFile(BASELINE_PATH, 'utf8'));
  } catch {
    baseline = {};
  }

  const failures = [];
  const knownIssues = [];
  let fontFallbackSeen = !fontsReachable;
  const queue = [];
  for (const story of swept) for (const width of widths) queue.push({ story, width });

  const WORKERS = Number(process.env.WIDTH_SWEEP_WORKERS ?? 4);

  // Navigation attempts per story, and how long each one waits.
  //
  // Both timeouts used to be single-shot, and twice in two days a CI run died
  // on `page.goto: Timeout 20000ms exceeded` — every worker at once, on a
  // runner busy with a full-suite escalation. Nothing was wrong with the
  // stories: a plain re-run went green both times. That is the definition of a
  // check nobody can trust, and it blocked a merge each time.
  //
  // Retrying rather than simply raising the timeout, because the two failures
  // are different animals. A stall under contention clears in seconds; a story
  // that genuinely cannot render never will, and waiting 60s to learn that
  // makes every real failure slower to find. So: start where the old timeout
  // was, give a stalled attempt more room the second and third time, and fail
  // for real once the attempts are gone.
  const NAV_ATTEMPT_TIMEOUTS = [20_000, 35_000, 50_000];
  const RENDER_ATTEMPT_TIMEOUTS = [10_000, 20_000, 30_000];
  let navRetries = 0;

  const isTimeout = (error) =>
    error && (error.name === 'TimeoutError' || /Timeout .*exceeded/.test(String(error.message)));

  /**
   * Open a story and wait for it to actually render, retrying a stall.
   *
   * Navigation and first paint are one unit here: a `goto` that resolves into a
   * page whose root never fills is exactly as useless as one that never
   * resolves, and the first version of this script reported 201 clean stories
   * for precisely that reason. Retrying only the goto would keep that hole.
   *
   * Only timeouts are retried. A page error, a bad URL or a crashed browser is
   * a real failure and is rethrown on the first attempt, so this cannot turn a
   * broken sweep into a slow green one.
   */
  const openStory = async (page, story, width) => {
    const url = `${host}/iframe.html?id=${story.id}&viewMode=story`;
    for (let attempt = 0; attempt < NAV_ATTEMPT_TIMEOUTS.length; attempt += 1) {
      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: NAV_ATTEMPT_TIMEOUTS[attempt],
        });
        // Storybook boots its preview runtime and renders the story *after*
        // load, so measuring on `load` measures an empty root: scrollWidth
        // equals clientWidth and every story passes. That is a false green,
        // which is worse than no check at all.
        await page.waitForFunction(
          () => {
            const root = document.getElementById('storybook-root');
            return !!root && root.children.length > 0 && root.getBoundingClientRect().height > 0;
          },
          { timeout: RENDER_ATTEMPT_TIMEOUTS[attempt] }
        );
        if (attempt > 0) navRetries += 1;
        return;
      } catch (error) {
        const lastAttempt = attempt === NAV_ATTEMPT_TIMEOUTS.length - 1;
        if (!isTimeout(error) || lastAttempt) {
          // Name the story. "page.goto: Timeout" alone sent someone reading the
          // whole sweep to work out which of 193 stories it meant.
          error.message =
            `${story.id} at ${width}px did not render after ` +
            `${attempt + 1} attempt(s): ${error.message}`;
          throw error;
        }
        // Loud, not silent. A story that always needs a second go is flaky, and
        // a retry that prints nothing turns flaky into merely slow — which is
        // how the original 20s timeout hid a contention problem for weeks.
        console.warn(
          `  retrying ${story.id} at ${width}px (attempt ${attempt + 2}/${NAV_ATTEMPT_TIMEOUTS.length}): ` +
            String(error.message).split('\n')[0]
        );
      }
    }
  };

  let cursor = 0;

  const worker = async (page) => {
    // Hermetic. Some stories reference real third-party assets (an mp3, two
    // avatar CDNs), and `waitUntil: 'load'` waits for every subresource — so on
    // a runner without egress each of those loads stalls until the navigation
    // timeout. A layout check has no business depending on picsum.photos being
    // up, so anything not served by the local static server is aborted.
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.startsWith(host) || url.startsWith('data:') || url.startsWith('blob:')) {
        return route.continue();
      }
      // Fonts are the one exception, and it is not optional: .storybook/
      // preview.css imports the brand faces from Google Fonts, and a fallback
      // face has different metrics. Blocking them made text measurably wider —
      // TopNav went from 18px over to 39px at 320 — which is the same size as
      // the real failures this is meant to find. Measuring with the wrong font
      // is measuring a different page.
      if (fontsReachable && FONT_HOSTS.some((h) => url.startsWith(h))) return route.continue();
      return route.abort();
    });

    for (;;) {
      const job = queue[cursor++];
      if (!job) return;
      const { story, width } = job;
      await page.setViewportSize({ width, height: 720 });
      await openStory(page, story, width);
      // fonts.ready, then a cheap confirmation that the brand face actually
      // arrived. Not a blocking wait per story: an 8s waitForFunction for the
      // face pushed the run from 80s to 211s, worse than the serial version it
      // replaced, because Storybook does not register the face on every story.
      // The race that leaves is small and one-directional — a fallback face is
      // wider, so it can only over-report, never hide an overflow.
      // Bounded: fonts.ready waits on any pending face, and a face that will
      // never arrive would otherwise stall every measurement. Whether the brand
      // font is available at all is decided once by the probe above — asking
      // per story raced the face's registration and cried fallback on runs
      // where the font was demonstrably loading.
      await page.evaluate(() =>
        Promise.race([
          document.fonts?.ready ?? Promise.resolve(),
          new Promise((r) => setTimeout(r, 2000)),
        ])
      );
      await page.waitForTimeout(SETTLE_MS);
      const over = await page.evaluate(() => {
        const root = document.getElementById('storybook-root') ?? document.body;
        return Math.max(
          0,
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
          root.scrollWidth - root.clientWidth
        );
      });
      if (over > TOLERANCE_PX) failures.push({ id: story.id, title: story.title, width, over });

      // Contrast and hit-target size, measured rather than inferred. Static
      // analysis cannot know which token lands on which background; a rendered
      // page can just read it.
      const design = await page.evaluate((minTarget) => {
        const root = document.getElementById('storybook-root');
        if (!root) return [];
        const cv = document.createElement('canvas');
        cv.width = cv.height = 1;
        const ctx = cv.getContext('2d', { willReadFrequently: true });
        // Paint the colour and read the pixel back. Tailwind v4 emits oklch(),
        // which a regex mis-parses and canvas fillStyle readback does not
        // convert — both produce confidently wrong ratios. Painting is the
        // browser's own conversion, so it handles any colour syntax.
        const rgba = (css) => {
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = css;
          ctx.fillRect(0, 0, 1, 1);
          const d = ctx.getImageData(0, 0, 1, 1).data;
          return [d[0], d[1], d[2], d[3] / 255];
        };
        const lum = ([r, g, b]) => {
          const f = [r, g, b].map((v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
        };
        const flatten = (fg, bg) => [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3]));
        const behind = (el) => {
          for (let n = el; n; n = n.parentElement) {
            const c = rgba(getComputedStyle(n).backgroundColor);
            if (c[3] > 0.99) return c;
          }
          return [255, 255, 255, 1];
        };
        // What is painted *behind* this element, ignoring its own fill.
        const under = (el) => (el.parentElement ? behind(el.parentElement) : [255, 255, 255, 1]);
        const sameColour = (a, b) => [0, 1, 2].every((i) => Math.abs(a[i] - b[i]) <= 1);
        const hex = (c) =>
          '#' + [0, 1, 2].map((i) => Math.round(c[i]).toString(16).padStart(2, '0')).join('').toUpperCase();
        const ratio = (a, b) => {
          const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
          return (hi + 0.05) / (lo + 0.05);
        };

        const out = [];
        for (const el of root.querySelectorAll('*')) {
          if (/^(STYLE|SCRIPT|SVG|PATH|TITLE|DEFS)$/.test(el.tagName)) continue;
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          if (cs.visibility === 'hidden' || Number(cs.opacity) <= 0.5) continue;

          const ownsText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
          if (ownsText && r.width > 2) {
            const bg = behind(el);
            const px = parseFloat(cs.fontSize);
            // WCAG large text: 24px, or 18.66px when bold.
            const large = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
            const need = large ? 3 : 4.5;
            const got = ratio(flatten(rgba(cs.color), bg), bg);
            if (got < need) {
              // key is what failed; detail carries the numbers. The two are
              // separate because measurements are not stable across machines:
              // keying the baseline on "54x23" meant CI's 49x23 — same element,
              // different font metrics — never matched and the check failed on
              // debt it was supposed to be tolerating.
              out.push({
                key: `contrast below ${need}:1 — "${el.textContent.trim().slice(0, 24)}"`,
                detail: `contrast ${got.toFixed(2)}:1 needs ${need}:1 — "${el.textContent.trim().slice(0, 24)}" at ${px}px`,
              });
            }
          }

          // A panel filled with the same colour as whatever is behind it. This
        // cannot be caught by reading the source, which is why it lives here:
        // `bg-mo-white` is correct on a Card footer, which sits on a white
        // card, and wrong on EmptyState, which sits on the cream page — and
        // `mo-white` and `mo-grey-2` both resolve to #F5F4F0, so the name gives
        // no clue either way. Only the browser knows what is actually behind a
        // given element.
        //
        // Found three real cases the first time it ran: EmptyState, the
        // FileDropzone drop area and Accordion, each a panel the same colour as
        // the page, held together by nothing but its border.
        //
        // "Presents as a panel" is the discriminator — a radius or a border. A
        // plain div sharing its parent's colour is just layout, not a surface
        // that failed to read.
        const own = rgba(cs.backgroundColor);
        const radius = parseFloat(cs.borderTopLeftRadius) || 0;
        const borderWidth = parseFloat(cs.borderTopWidth) || 0;
        const looksLikePanel = radius > 0 || borderWidth > 0;
        if (
          own[3] > 0.99 &&
          looksLikePanel &&
          r.width >= 24 &&
          r.height >= 16 &&
          sameColour(own, under(el))
        ) {
          out.push({
            key: `surface same colour as what is behind it — ${el.tagName.toLowerCase()} ${hex(own)}`,
            detail:
              `${el.tagName.toLowerCase()} filled ${hex(own)} on ${hex(under(el))} at ` +
              `${Math.round(r.width)}x${Math.round(r.height)} — the panel does not read as a panel`,
          });
        }

        const interactive = el.tagName === 'BUTTON' || el.getAttribute('role') === 'button';
          if (interactive && r.width > 0 && (r.width < minTarget || r.height < minTarget)) {
            const label = (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 20);
            out.push({
              key: `hit target under ${minTarget}px — "${label}"`,
              detail:
                `hit target ${Math.round(r.width)}x${Math.round(r.height)} under ${minTarget}px — "${label}"`,
            });
          }
        }
        // dedupe on the stable key, not the measurement
        const seen = new Set();
        return out.filter((o) => (seen.has(o.key) ? false : seen.add(o.key)));
      }, MIN_TARGET_PX);
      for (const finding of design) {
        const known = (baseline[story.id] ?? []).includes(finding.key);
        (known ? knownIssues : failures).push({
          id: story.id,
          title: story.title,
          width,
          over: 0,
          key: finding.key,
          detail: finding.detail,
        });
      }

      // Overflow and overlap are different failures, and this check only saw
      // the first. A Steps fix that let its columns shrink stopped the page
      // overflowing and made the titles collide with the next step's badge —
      // "Finis[2]In Pr[3]ss" — and passed cleanly. Text landing on top of other
      // text is the other half of "does this layout survive being narrow".
      const collisions = await page.evaluate(() => {
        const root = document.getElementById('storybook-root');
        if (!root) return [];

        // Only elements that own visible text, and only ones laid out in flow:
        // absolute/fixed/sticky things are deliberately stacked, and badges over
        // avatars are a design, not a defect.
        const inFlow = (el) => {
          for (let n = el; n && n !== root; n = n.parentElement) {
            const cs = getComputedStyle(n);
            if (cs.position !== 'static' && cs.position !== 'relative') return false;
            if (cs.pointerEvents === 'none' || cs.visibility === 'hidden') return false;
            if (n.getAttribute('aria-hidden') === 'true') return false;
          }
          return true;
        };

        const texts = [...root.querySelectorAll('*')].filter((el) => {
          if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return false;
          const r = el.getBoundingClientRect();
          return r.width > 2 && r.height > 2 && inFlow(el);
        });

        const out = [];
        for (let i = 0; i < texts.length && out.length < 1; i += 1) {
          for (let j = i + 1; j < texts.length; j += 1) {
            const a = texts[i], b = texts[j];
            if (a.contains(b) || b.contains(a)) continue;
            const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
            const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
            const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
            if (w <= 1 || h <= 1) continue;
            // Require real overlap, not a shared edge or a stray pixel.
            const share = (w * h) / Math.min(ra.width * ra.height, rb.width * rb.height);
            if (share < 0.25) continue;
            out.push(
              `text overlaps text (${Math.round(share * 100)}% of the smaller box): ` +
                `"${a.textContent.trim().slice(0, 22)}" and "${b.textContent.trim().slice(0, 22)}"`
            );
            break;
          }
        }
        return out;
      });
      for (const detail of collisions) {
        failures.push({ id: story.id, title: story.title, width, over: 0, detail });
      }

      if ((story.tags ?? []).includes(OVERLAY_TAG)) {
        // Wait for the overlay to EXIST before measuring it. Several tagged
        // stories open their panel in a play function — focus, then the panel
        // mounts a beat later — and on a starved merge-group runner that beat
        // came after the measurement: open-near-edge failed with "tagged
        // overlay-open but nothing is open" and silently evicted a PR whose
        // diff had nothing to do with tooltips. Existence is an
        // eventually-condition, so polling for it is the right shape; the
        // geometry checks below still measure once, settled. A story whose
        // overlay never appears still fails with the same honest message.
        await page
          .waitForSelector('[role="dialog"], [role="tooltip"], [role="listbox"], [role="menu"]', {
            timeout: 3_000,
          })
          .catch(() => {});
        const problems = await page.evaluate(() => {
          const panel =
            document.querySelector('[role="dialog"]') ??
            document.querySelector('[role="tooltip"]') ??
            document.querySelector('[role="listbox"], [role="menu"]');
          if (!panel) return ['the story is tagged overlay-open but nothing is open'];

          const out = [];
          const r = panel.getBoundingClientRect();
          // 1. Containment. scrollWidth says nothing about a fixed element; the
          //    only question is whether it is inside the viewport.
          const escapes = [
            r.left < -1 && 'left',
            r.top < -1 && 'top',
            r.right > innerWidth + 1 && 'right',
            r.bottom > innerHeight + 1 && 'bottom',
          ].filter(Boolean);
          if (escapes.length) {
            out.push(
              `panel escapes the viewport (${escapes.join(', ')}): ` +
                `rect ${Math.round(r.left)},${Math.round(r.top)} → ` +
                `${Math.round(r.right)},${Math.round(r.bottom)} in ${innerWidth}x${innerHeight}`
            );
          }

          // 2. Occlusion, for modals only. A modal claims to block the page
          //    behind it, so anything painting above its backdrop is a bug —
          //    usually the overlay trapped in an ancestor stacking context,
          //    which measures perfectly fine and still renders underneath the
          //    app's chrome. A tooltip or a menu makes no such claim: points
          //    outside it are supposed to hit the page, and asserting otherwise
          //    reported <body> as an occluder on the very first run.
          if (panel.getAttribute('aria-modal') !== 'true') return out;

          const probes = [
            [Math.round(innerWidth / 2), 8],
            [8, Math.round(innerHeight / 2)],
            [innerWidth - 8, Math.round(innerHeight / 2)],
            [Math.round(innerWidth / 2), innerHeight - 8],
          ];
          for (const [x, y] of probes) {
            if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) continue;
            const hit = document.elementFromPoint(x, y);
            if (!hit) continue;
            if (hit === panel || panel.contains(hit)) continue;
            const onTop = hit.closest('[role="dialog"], [role="tooltip"], [aria-hidden="true"]');
            const isBackdrop = /fixed/.test(getComputedStyle(hit).position);
            if (!onTop && !isBackdrop) {
              out.push(
                `something paints over the overlay at ${x},${y}: ` +
                  `<${hit.tagName.toLowerCase()}${hit.id ? '#' + hit.id : ''}>. ` +
                  `Usually the overlay is trapped in an ancestor stacking context — portal it.`
              );
              break;
            }
          }
          return out;
        });
        for (const detail of problems) {
          failures.push({ id: story.id, title: story.title, width, over: 0, detail });
        }
      }
    }
  };

  const guarded = async (page) => {
    try {
      await worker(page);
    } catch (err) {
      // Surface it rather than letting one story take the run down silently.
      console.error(`  sweep worker stopped: ${String(err).split('\n')[0]}`);
      throw err;
    }
  };

  const pool = [page];
  for (let i = 1; i < WORKERS; i += 1) pool.push(await browser.newPage());

  // allSettled, not all — and close in a `finally`.
  //
  // `Promise.all` rejects the moment the first worker throws, which skipped
  // `browser.close()` entirely and left chrome-headless-shell holding Node's
  // event loop open. The process then never exited. The static server had its
  // own `finally` and closed correctly, which is why this looked fixed: the
  // socket was not the only thing keeping the loop alive.
  //
  // Seen for real on 27 Aug 2026, on a runner starved by a full-suite
  // escalation: every worker died of `page.goto` timeouts between 16:39 and
  // 16:40, then the job printed nothing at all until it was cancelled on its
  // 45-minute timeout at 17:22. Forty-two minutes of silence, for a check that
  // normally takes five, and it reads as a slow check rather than a broken one.
  //
  // allSettled lets the other workers finish rather than abandoning them
  // mid-navigation, the browser always closes, and the first failure is still
  // rethrown so the run fails.
  let outcomes;
  try {
    outcomes = await Promise.allSettled(pool.map((pg) => guarded(pg)));
  } finally {
    await browser.close();
  }

  const firstFailure = outcomes.find((outcome) => outcome.status === 'rejected');
  if (firstFailure) {
    throw firstFailure.reason;
  }

  if (fontFallbackSeen) {
    console.warn(
      `\n! ${BRAND_FONT} did not load, so these widths were measured with a fallback\n` +
        `  face. Fallback metrics are wider — enough to move a result by ~20px — so\n` +
        `  treat this run as indicative, not authoritative. The lasting fix is to\n` +
        `  self-host the brand faces instead of importing them from Google Fonts in\n` +
        `  .storybook/preview.css, which would also make Storybook work offline.`
    );
  }

  if (updateBaseline) {
    const next = {};
    for (const f of [...failures, ...knownIssues]) {
      if (!f.key) continue;
      (next[f.id] ??= []).push(f.key);
    }
    for (const k of Object.keys(next)) next[k] = [...new Set(next[k])].sort();
    await writeFile(BASELINE_PATH, `${JSON.stringify(next, null, 2)}\n`);
    console.log(
      `\nBaseline rewritten: ${Object.keys(next).length} stories, ` +
        `${Object.values(next).flat().length} finding(s). Commit it with the reason.`
    );
    return;
  }

  if (knownIssues.length) {
    const stories = new Set(knownIssues.map((k) => k.id));
    console.log(
      `\n${knownIssues.length} known contrast/hit-target finding(s) across ${stories.size} ` +
        `stor${stories.size === 1 ? 'y' : 'ies'}, tolerated via width-sweep-baseline.json. ` +
        `Shrinking that file is real accessibility work, not cleanup.`
    );
  }

  if (!failures.length) {
    console.log(
      `\n✓ no horizontal overflow in ${swept.length} stories × ${widths.length} widths` +
        (navRetries ? ` (${navRetries} navigation retr${navRetries === 1 ? 'y' : 'ies'})` : '')
    );
    // A retry means a page stalled and recovered. Harmless once; a number that
    // climbs run over run is contention worth fixing rather than absorbing, and
    // it is invisible unless the passing path prints it too.
    return;
  }

  // Group by story: one component broken at four widths is one problem.
  const byStory = new Map();
  for (const f of failures) {
    if (!byStory.has(f.id)) byStory.set(f.id, []);
    byStory.get(f.id).push(f);
  }
  console.error(`\n✖ ${byStory.size} story(ies) overflow horizontally:\n`);
  for (const [id, list] of [...byStory].sort((a, b) => b[1].length - a[1].length)) {
    const sized = list.filter((f) => !f.detail);
    if (sized.length) {
      console.error(`  ${id}\n      ${sized.map((f) => `${f.width}px→+${f.over}`).join('  ')}`);
    }
    for (const f of list.filter((x) => x.detail)) {
      console.error(`  ${id}\n      ${f.width}px: ${f.detail}`);
    }
  }
  console.error(
    `\nEither the component cannot shrink — check for a flex item without min-w-0, a\n` +
      `fixed width, or a row of items that neither wraps nor scrolls — or the story is\n` +
      `a deliberate gallery, in which case tag it:  tags: ['${EXEMPT_TAG}']\n`
  );
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
