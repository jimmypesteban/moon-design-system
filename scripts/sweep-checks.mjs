/**
 * What the browser sweeps assert, described for people who do not read the code.
 *
 * Read by the Guardrails page in the docs, and by nothing else today — the
 * sweeps carry their own failure messages, which are written for whoever is
 * fixing the failure rather than for a reader. Keeping the descriptions here
 * rather than in the page means adding a check and describing it are the same
 * edit, so the page cannot list a check that no longer exists. Same reason the
 * token list and the change log are generated rather than typed.
 *
 * The wording is deliberately non-technical: this page is read by people
 * deciding whether to trust the system, not only by the people maintaining it.
 *
 * `alsoOnAppPages` marks a check that runs a second time against the real
 * product, in the consumer app's own e2e app-width spec, on five routes chosen for
 * their chrome rather than their features. Those three predicates are copied
 * from the component sweep rather than reinvented, because two implementations
 * would disagree about what counts as a defect. It is a separate run in a
 * separate app, so it is a flag on the check rather than three more rows: the
 * same question, asked somewhere else.
 *
 * Pure data on purpose — no imports, nothing to execute. The sweeps are CLI
 * scripts with top-level await and a Playwright import, so the docs build
 * cannot import them directly.
 */

/** @typedef {{ id: string, sweep: 'width' | 'docs', title: string, catches: string, learnedFrom?: string, alsoOnAppPages?: boolean }} SweepCheck */

/** @type {SweepCheck[]} */
export const SWEEP_CHECKS = [
  {
    id: 'horizontal-overflow',
    alsoOnAppPages: true,
    sweep: 'width',
    title: 'Nothing is wider than the space it has',
    catches:
      'Something too wide for the space it has, so the page scrolls sideways or the component gets cut off. Checked on a phone, a tablet and a laptop.',
    learnedFrom:
      'The audio player pushed its timer and volume control outside its card in a narrow column, after months of looking fine in a wide one.',
  },
  {
    id: 'text-collision',
    alsoOnAppPages: true,
    sweep: 'width',
    title: 'Text does not land on other text',
    catches: 'Words landing on top of other words once things get narrow.',
    learnedFrom:
      'A fix that stopped one component overflowing passed the check above while its labels sat on top of the next step’s number.',
  },
  {
    id: 'overlay-containment',
    alsoOnAppPages: true,
    sweep: 'width',
    title: 'Pop-ups stay on screen, and on top',
    catches:
      'A pop-up half off the edge of the screen, or something drawn on top of an open dialog.',
    learnedFrom:
      'The admin top bar drew itself over an open dialog, which a developer noticed and reported.',
  },
  {
    id: 'contrast',
    sweep: 'width',
    title: 'Text is dark enough to read',
    catches:
      'Text too faint against what is behind it. Measured against the international accessibility standard, so it is not a matter of opinion.',
    learnedFrom:
      'Three earlier attempts at measuring colour returned confident nonsense before one of them was checked against a known answer.',
  },
  {
    id: 'hit-target',
    sweep: 'width',
    title: 'Buttons are big enough to tap',
    catches:
      'A control under 24 pixels across — small enough that people miss it on a phone. That is the accessibility minimum, not a preference.',
  },
  {
    id: 'invisible-surface',
    sweep: 'width',
    title: 'A panel is not the same colour as the page',
    catches:
      'A panel the same colour as the page behind it, so all that shows is its thin outline.',
    learnedFrom:
      'Two of our colour names both mean the same cream, so six components were the colour of the page they sat on. Reading the code could not tell those from the cases where cream is correct — only looking at the screen could.',
  },
  {
    id: 'invalid-nesting',
    sweep: 'docs',
    title: 'The markup is put together legally',
    catches:
      'Something sitting where HTML does not allow it — a box inside a paragraph, a link inside a link. The page usually looks right; the structure underneath is not the one the source describes.',
    learnedFrom:
      'Five places on two of these pages put a paragraph inside a paragraph. It looked correct and it shipped, and nothing else here could see it — every other check measures size, position or colour, and markup that is invalid but looks right passes all of them. Its first real run found a code block sitting in the middle of a sentence on another page.',
  },
  {
    id: 'dead-doc-links',
    sweep: 'docs',
    title: 'Every link between these pages goes somewhere',
    catches:
      'A link pointing at a page that was renamed or deleted. The card grids rebuild themselves from the live page list and cannot break this way — this catches the links people write by hand.',
    learnedFrom:
      'A page was deleted and the Introduction kept linking to it. Nothing failed, because writing is not code — a reader found the broken link on the front door of the design system.',
  },
  {
    id: 'console-errors',
    sweep: 'docs',
    title: 'No page reports an error to itself',
    catches:
      'A page that logs an error, or breaks outright, while it loads. Warnings are listed but do not stop a change — they are usually someone else\'s to fix.',
  },
  {
    id: 'font-size-leak',
    sweep: 'docs',
    title: 'Text on these pages is the size it was set to',
    catches:
      'Text on these documentation pages coming out bigger or smaller than intended.',
    learnedFrom:
      "316 pieces of text across every page here were the wrong size, and three separate reports of 'why is this text so big' all turned out to be this.",
  },
];

/** Checks belonging to one sweep, in declaration order. */
export function checksFor(sweep) {
  return SWEEP_CHECKS.filter((check) => check.sweep === sweep);
}
