#!/usr/bin/env node
/**
 * Three things that can be wrong with a docs page, measured in a real browser.
 *
 * 1. Text renders at a size nobody asked for.
 * 2. The markup is invalid — a `div` inside a `p`, an `a` inside an `a`.
 * 3. The page logs an error, or throws.
 *
 * They share this file because they share the expensive part: serving the built
 * Storybook and loading all 60 docs pages. Splitting them would triple that
 * cost to add two checks that are a few lines each.
 *
 * ## Check 1 — font size
 *
 * Why this exists as a separate sweep from width-sweep.mjs: that one loads
 * `viewMode=story`, where Storybook's docs stylesheet is not present at all. The
 * bug this catches only exists on docs pages, so the width sweep could never
 * have seen it — 195 stories passed clean across three widths while all 59 docs
 * pages carried 316 wrongly-sized elements between them.
 *
 * The defect: Storybook's docs CSS sets font-size DIRECTLY on span, p, a,
 * strong, em, code, div, li and table cells. A rule that matches always beats an
 * inherited value, so any element inside a custom docs block that does not
 * restate its size renders at sbdocs' instead of its parent's. It is silent, it
 * only happens on docs pages, and it looks like a design mistake rather than a
 * cascade one — which is why it was reported three separate times as "why is
 * this text so big" before the cause was found.
 *
 * The fix lives in .storybook/preview.css. This exists so it cannot be undone by
 * accident, and so the next custom docs block inherits the protection instead of
 * rediscovering the trap.
 *
 * What counts as a finding: an element that declares no font-size of its own,
 * sits inside a subtree that does declare one, and renders at a different size
 * than that subtree. Both directions count — a 22px specimen collapsing to 16px
 * is as wrong as a 12.5px row inflating to 16px.
 *
 * Deliberately not a finding: ordinary MDX prose. It declares nothing, sits in
 * no sized subtree, and should take Storybook's typography. The walk therefore
 * starts only at elements carrying an inline font-size.
 *
 * ## Check 2 — invalid nesting
 *
 * Added after five `<p style={...}>` wrappers on two pages each rendered a `<p>`
 * inside a `<p>`: MDX parses multiline JSX children as markdown flow content and
 * wraps them in a paragraph of its own. It rendered correctly and shipped, and
 * nothing here could have seen it — the other checks measure geometry, colour
 * and size, and markup that is invalid but looks right passes all of them.
 *
 * The rule set was chosen by measuring first: the wide net below was run across
 * all 60 pages before being turned into a gate, and it found exactly one
 * violation, on Components/Forms/Rating. That one was real and visible — an
 * inline code span wrapped across two lines of a JSDoc comment, which markdown
 * reads as a code *block*, so an 80px scroll panel with a Copy button appeared
 * in the middle of a sentence. Storybook's own chrome produced nothing. So this
 * runs with no allow-list and no tolerated baseline, which is the only kind of
 * gate worth having.
 *
 * The likeliest cause of a future failure here is that same JSDoc trap. The
 * error message says so, because a gate that only says "no" gets deleted.
 *
 * ## Check 3 — dead internal links
 *
 * Every `/?path=/docs/...` link on a page must point at a docs id that exists
 * in index.json. Added after a commit landed with the CustomIcon page deleted
 * while the Introduction still linked to it — a broken link on the front door,
 * and nothing failed, because writing is not code. The card indexes derive from
 * index.json and self-heal; hand-written MDX links are what this catches.
 *
 * ## Check 4 — console errors and uncaught exceptions
 *
 * Zero errors and zero warnings across all 60 pages when this was written, so
 * failing on an error needs no allow-list either.
 *
 * Two honest limits. **This would not have caught the nesting bug above**: the
 * sweep loads a production build, and production React does not emit the
 * "cannot be a descendant" warning that a dev server shows. Check 2 is what
 * catches that class, structurally, in any build. And warnings are collected
 * but do **not** fail the run — a Storybook upgrade emitting a deprecation
 * would turn the gate red for a reason nobody here can fix, and a gate that
 * goes red for unfixable reasons gets switched off. Errors are almost always
 * ours; warnings drift. They are printed either way, so they stay visible.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'storybook-static');
const WIDTH = 1024;

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

/**
 * Serves the built Storybook. Closed in a `finally` below without exception:
 * a listening socket left open on the error path is why an earlier version of
 * the width sweep held a CI job for 44 minutes after its real work had failed.
 */
function serveStatic() {
  const server = createServer(async (req, res) => {
    try {
      const rel = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
      const path = join(ROOT, rel);
      const body = await readFile(path.endsWith('/') ? join(path, 'index.html') : path);
      res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((ok, fail) => {
    server.once('error', fail);
    server.listen(0, '127.0.0.1', () => ok({ server, port: server.address().port }));
  });
}

/** Runs in the page. Returns one entry per wrongly-sized element. */
function collectLeaks() {
  const out = [];
  const walk = (el, inherited) => {
    const declared = el.style?.fontSize ? parseFloat(el.style.fontSize) : null;
    const computed = parseFloat(getComputedStyle(el).fontSize);
    const expected = declared ?? inherited;
    // Only text this element renders itself. A wrapper whose text lives entirely
    // in sized children displays nothing at the wrong size, so its own
    // font-size is inert and reporting it would be noise.
    const own = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(' ')
      .trim();
    if (declared === null && expected !== null && own && Math.abs(computed - expected) > 0.4) {
      out.push({
        tag: el.tagName.toLowerCase(),
        expected,
        computed,
        text: own.slice(0, 48),
      });
    }
    for (const child of el.children) walk(child, declared ?? inherited);
  };
  for (const el of document.querySelectorAll('[style*="font-size"]')) walk(el, null);
  return out;
}

/**
 * Runs in the page. Returns one entry per element sitting somewhere HTML does
 * not allow it.
 *
 * Each pair is `[selector, why]`. A browser silently reparents some of these
 * and React refuses to hydrate others, so the visible symptom varies — what
 * they have in common is that the DOM is not the tree the source describes,
 * which makes every other measurement here untrustworthy.
 */
function collectNesting() {
  // `p` accepts phrasing content only. These are the flow elements that
  // actually turn up in MDX and in JSDoc rendered as markdown.
  const IN_P = ['p', 'div', 'ul', 'ol', 'li', 'table', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'blockquote', 'pre', 'figure', 'hr', 'form', 'section', 'article', 'address'];
  const RULES = [
    ...IN_P.map((t) => [`p ${t}`, `<${t}> inside <p> — p accepts phrasing content only`]),
    ['a a', 'nested links — the inner one is unreachable'],
    ['button button', 'nested buttons — the inner one may not receive clicks'],
    ['button a', 'a link inside a button — two conflicting activation behaviours'],
    ['a button', 'a button inside a link — two conflicting activation behaviours'],
    ['form form', 'nested forms — the inner one never submits'],
    ['label label', 'nested labels — the association is ambiguous'],
    ['ul > *:not(li):not(script):not(template)', 'non-<li> child of <ul>'],
    ['ol > *:not(li):not(script):not(template)', 'non-<li> child of <ol>'],
  ];
  const out = [];
  for (const [selector, why] of RULES) {
    for (const el of document.querySelectorAll(selector)) {
      out.push({
        selector,
        why,
        // Whether it is inside our own docs content or Storybook's chrome —
        // the first is fixable here, the second is worth knowing before anyone
        // spends an afternoon looking for it in this repo.
        ours: !!el.closest('.sbdocs'),
        text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 44),
        parent: (el.parentElement?.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
      });
    }
  }
  return out;
}

/** Runs in the page. Returns every internal docs-link href, for validation outside. */
function collectDocLinks() {
  const out = [];
  for (const a of document.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href') ?? '';
    const match = /[?&]path=\/docs\/([a-z0-9-]+)/.exec(href);
    if (match) out.push({ id: match[1], href, text: (a.textContent || '').trim().slice(0, 40) });
  }
  return out;
}

async function main() {
  let index;
  try {
    index = JSON.parse(await readFile(join(ROOT, 'index.json'), 'utf8'));
  } catch {
    console.error(
      `No built Storybook at ${ROOT}. Run \`npm run build-storybook --workspace moon-design-system\` first.`
    );
    process.exit(1);
  }

  const docs = Object.values(index.entries ?? {}).filter((e) => e.type === 'docs');
  if (!docs.length) {
    // An empty page set would report a clean sweep while checking nothing, which
    // is the failure mode this project has been bitten by three times.
    console.error('index.json lists no docs pages — refusing to report a clean sweep.');
    process.exit(1);
  }

  const validDocIds = new Set(docs.map((entry) => entry.id));
  const deadLinks = [];

  const { server, port } = await serveStatic();
  const base = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch();
  const findings = [];
  const nestingFindings = [];
  const consoleErrors = [];
  const consoleWarnings = [];

  try {
    const page = await browser.newPage({ viewport: { width: WIDTH, height: 900 } });

    // Attached once, outside the loop, and tagged with whichever page is
    // current. Re-attaching per page would drop anything logged during
    // navigation, which is exactly when a page is most likely to throw.
    let current = '';
    page.on('console', (msg) => {
      const type = msg.type();
      if (type !== 'error' && type !== 'warning') return;
      const text = msg.text().replace(/\s+/g, ' ').slice(0, 300);
      (type === 'error' ? consoleErrors : consoleWarnings).push({ page: current, text });
    });
    page.on('pageerror', (err) => {
      consoleErrors.push({ page: current, text: `uncaught: ${String(err.message).replace(/\s+/g, ' ').slice(0, 300)}` });
    });

    for (const entry of docs) {
      current = entry.title || entry.id;
      await page.goto(`${base}/iframe.html?id=${entry.id}&viewMode=docs`, { waitUntil: 'load' });
      // Storybook renders after `load`, so measuring on it measures an empty
      // root. Wait for real content instead of a timer.
      await page.waitForFunction(
        () => (document.querySelector('#storybook-docs, .sbdocs')?.textContent?.length ?? 0) > 200,
        { timeout: 20000 }
      );
      const leaks = await page.evaluate(collectLeaks);
      if (leaks.length) findings.push({ title: current, leaks });
      const nested = await page.evaluate(collectNesting);
      if (nested.length) nestingFindings.push({ title: current, nested });
      for (const link of await page.evaluate(collectDocLinks)) {
        if (!validDocIds.has(link.id)) {
          deadLinks.push({ page: current, ...link });
        }
      }
    }
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }

  // Warnings never fail the run, but they are always shown — see the header.
  if (consoleWarnings.length) {
    const seen = new Set();
    console.log(`note: ${consoleWarnings.length} console warning(s) (not a failure):`);
    for (const w of consoleWarnings) {
      const key = w.text.slice(0, 90);
      if (seen.has(key)) continue;
      seen.add(key);
      console.log(`  ${w.page}: ${w.text}`);
    }
    console.log('');
  }

  const total = findings.reduce((n, f) => n + f.leaks.length, 0);
  const nestingTotal = nestingFindings.reduce((n, f) => n + f.nested.length, 0);

  if (!total && !nestingTotal && !consoleErrors.length && !deadLinks.length) {
    console.log(
      `✓ ${docs.length} docs pages: no font-size leaks, no invalid nesting, no dead links, no console errors`
    );
    return;
  }

  if (deadLinks.length) {
    console.error(`${deadLinks.length} link(s) point at a docs page that does not exist:\n`);
    for (const link of deadLinks) {
      console.error(`  ${link.page}\n     "${link.text}" -> ${link.href}`);
    }
    console.error(
      `\nEither the target was renamed or deleted, or the link has a typo. The card\n` +
        `indexes derive from index.json and cannot break this way — this is a\n` +
        `hand-written link in an MDX file.\n`
    );
  }

  if (nestingTotal) {
    console.error(`${nestingTotal} element(s) nested where HTML does not allow it, across ${nestingFindings.length} of ${docs.length} docs pages:\n`);
    for (const { title, nested } of nestingFindings) {
      console.error(`  ${title}`);
      for (const v of nested) {
        console.error(`     ${v.why}`);
        console.error(`       ${v.ours ? 'in our docs content' : "in Storybook's own chrome"}   near: "${v.parent || v.text}"`);
      }
    }
    console.error(
      `\nTwo causes account for every instance seen so far, both in source we control:\n` +
        `  • An MDX wrapper written as <p style={...}> with children on their own lines. MDX\n` +
        `    parses those as markdown and wraps them in a paragraph, so the wrapper must be a <div>.\n` +
        `  • An inline code span broken across two lines of a JSDoc comment. Markdown reads that\n` +
        `    as a code *block*, which renders a scroll panel with a Copy button mid-sentence.\n` +
        `    Keep the whole \`span\` on one line.\n`
    );
  }

  if (consoleErrors.length) {
    const seen = new Set();
    console.error(`${consoleErrors.length} console error(s):\n`);
    for (const e of consoleErrors) {
      const key = `${e.page}|${e.text.slice(0, 90)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      console.error(`  ${e.page}\n     ${e.text}`);
    }
    console.error('');
  }

  if (!total && (nestingTotal || consoleErrors.length || deadLinks.length)) process.exit(1);
  if (!total) return;

  console.error(`${total} element(s) render at a size nothing declared, across ${findings.length} of ${docs.length} docs pages:\n`);
  for (const { title, leaks } of findings) {
    console.error(`  ${title}  (${leaks.length})`);
    const seen = new Set();
    for (const l of leaks) {
      const key = `${l.tag}|${l.expected}|${l.computed}`;
      if (seen.has(key)) continue;
      seen.add(key);
      console.error(
        `     ${l.tag.padEnd(7)} nearest declared ${String(l.expected).padStart(5)}px, renders ${String(l.computed).padStart(5)}px   "${l.text}"`
      );
    }
  }
  console.error(
    `\nThe element declares no font-size, so Storybook's docs CSS is setting it directly and beating inheritance.\n` +
      `Either give the element its own size, or check that the .sbdocs [style*="font-size"] rule in\n` +
      `.storybook/preview.css still covers its tag.`
  );
  process.exit(1);
}

await main();
