import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

const VIRTUAL_ID = 'virtual:mo-last-updated';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

export interface Change {
  /** ISO date of the commit. */
  date: string;
  /** First name only — this is a log, not a byline. */
  who: string;
  /** One segment per kind of change, so each can be coloured on its own. */
  parts: { kind: 'added' | 'removed' | 'updated'; label: string }[];
  /** One sentence on why, from the commit subject with its prefix stripped. */
  why: string;
  /** The pull request that introduced it, or null when there wasn't one. */
  pr: string | null;
}

export interface LastUpdated {
  /** ISO date of the most recent commit touching this package, or null. */
  date: string | null;
  /** Who made it, or null. */
  author: string | null;
  /** Recent changes to components and tokens, newest first. */
  changes: Change[];
}

/**
 * Exposes the package's last commit as a virtual module, so the docs footer can
 * say when this was last touched without anyone remembering to edit a date.
 *
 * Read once, when the dev server starts or the static build runs, rather than
 * per request — the value cannot change mid-build, and shelling out per module
 * would be a needless cost on a package with sixty docs pages.
 *
 * Returns nulls rather than guessing when git cannot answer. That is not
 * defensive padding: the CI job that builds Storybook checks out with
 * `fetch-depth: 1` (see .github/workflows/agent-gate.yml — only the Inngest
 * task asks for full history), so in that build `git log` genuinely has nothing
 * to report. Nobody reads *that* build's output — it exists to fail the gate,
 * not to be served.
 *
 * The published site is a separate build: the `mosaic-ui-storybook` static
 * service in render.yaml, deployed from `main` on any change under
 * this repo, and served as a static Storybook build with no
 * access gate. If the footer's date is missing there, that clone is shallow too
 * — a footer that invents a date would be worse than one that omits it, and a
 * build that dies over a footer would be worse still.
 */
/**
 * The commit subject as a readable sentence: conventional-commit prefix removed
 * and the first letter capitalised.
 *
 * The classification above says *which* files moved, which is what a consumer
 * needs; this says *why*, which is the part only the author knew. "Tokens
 * updated" three times running tells you nothing — "Retire the light/dark
 * tokens that cost nothing to retire" tells you everything.
 *
 * The prefix is stripped rather than shown because `fix(consumer):` on a commit
 * that changed a shared component is actively misleading, and the scope is
 * already implied by the list being scoped to this package.
 */
function sentence(subject: string): string {
  const bare = subject
    .replace(/^[a-z]+(\([^)]*\))?!?:\s*/i, '')
    // A trailing `(#1656)` is a squash-merge artefact, not part of the sentence.
    // It is read separately by subjectPr and rendered as a link instead.
    .replace(/\s*\(#\d+\)$/, '')
    .trim();
  if (!bare) return '';
  return bare.charAt(0).toUpperCase() + bare.slice(1);
}

/**
 * The PR number a squash-merge left in the subject, or null.
 *
 * The repo has used two merge styles. Merge commits — the current queue — record
 * the number in `Merge pull request #2087 from …`, which prFor walks to. Older
 * squash-merges instead appended `(#1656)` to the subject and left no merge
 * commit at all, so those commits sit on main's first-parent chain and prFor
 * correctly finds nothing. Reading it here covers that era for free.
 */
function subjectPr(subject: string): string | null {
  return /\(#(\d+)\)\s*$/.exec(subject)?.[1] ?? null;
}

/** "A", "A and B", "A, B and C" — and a count once a list stops being readable. */
function list(names: string[]): string {
  const seen = [...new Set(names)];
  if (seen.length <= 2) return seen.join(' and ');
  if (seen.length === 3) return `${seen[0]}, ${seen[1]} and ${seen[2]}`;
  return `${seen[0]}, ${seen[1]} and ${seen.length - 2} more`;
}

export function lastUpdatedPlugin(packageDir: string): Plugin {
  let payload: LastUpdated | null = null;

  const git = (args: string[]) =>
    execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], cwd: packageDir });

  /**
   * The pull request a commit arrived in, or null.
   *
   * Not read from the commit subject: the merge queue preserves branch subjects
   * rather than appending `(#1234)`, so only 7 of the last 70 commits here carry
   * a number that way. The reliable record is the merge commit — `Merge pull
   * request #2087 from …` — so this walks forward from the commit to the nearest
   * one of those.
   *
   * `--ancestry-path` restricts the walk to merges that actually descend from
   * this commit, and the oldest such merge is the one that introduced it; a
   * branch that was merged into itself several times shows up as intermediate
   * `Merge branch 'main' into …` commits, which name no PR and are stepped over.
   *
   * The `--is-ancestor` check is what keeps this honest. A commit pushed
   * straight to main never had a pull request, but it still has later PR merges
   * descending from it, and without the check every such commit would be
   * credited to whichever unrelated PR merged next.
   *
   * The check is against the merge's *first* parent, and that detail is the
   * whole thing. Asking whether the commit is on the branch side (`^2`) looks
   * like the natural test and is worthless: a branch carries all of main's
   * history up to the point it was cut, so every older commit is an ancestor of
   * every later branch tip. Measured on this repo, a commit from #2077 answers
   * yes for #2087's branch. Asking whether it is *absent* from the main side
   * (`^1`) is the discriminating question, and it is sufficient on its own —
   * `--ancestry-path` already guarantees the commit is reachable from the
   * merge, so if it is not reachable through the first parent it can only have
   * arrived through another one.
   *
   * One cheap git call per row, ~20ms, for the sixty rows this returns. Once per
   * build, so it costs about a second of a thirty-second build.
   */
  const prFor = (sha: string): string | null => {
    try {
      const merges = git(['log', '--ancestry-path', '--merges', '--format=%H\t%s', `${sha}..HEAD`])
        .split('\n')
        .map((line) => {
          const gap = line.indexOf('\t');
          if (gap === -1) return null;
          const m = /^Merge pull request #(\d+)/.exec(line.slice(gap + 1));
          return m ? { merge: line.slice(0, gap), pr: m[1] } : null;
        })
        .filter((x): x is { merge: string; pr: string } => x !== null);
      // Oldest first from here: the introducing merge is the earliest one.
      for (const { merge, pr } of merges.reverse()) {
        try {
          git(['merge-base', '--is-ancestor', sha, `${merge}^1`]);
          // Already on main before this merge, so the merge did not bring it in.
        } catch {
          return pr;
        }
      }
      return null;
    } catch {
      return null;
    }
  };


  /**
   * Recent changes, described by what they did rather than by their commit
   * subject. A raw subject list is the wrong thing to show here: at the time of
   * writing, the last twelve commits touching this package were all about its
   * own footer, and one entry in the component history reads "fix(consumer): cap
   * modal height" because subjects describe a pull request's intent, not the
   * file's. Classifying from the changed paths gives "Modal updated", which is
   * the thing a consumer of Modal actually wants to know.
   *
   * Scoped to components and tokens, excluding stories, so documentation work —
   * including all of this — stays out of it.
   */
  const readChanges = (): Change[] => {
    const label = (path: string): string | null => {
      const file = path.split('/').pop() ?? '';
      if (file === 'tokens.mjs') return 'Tokens';
      if (file === 'icons.ts') return 'Icons';
      const m = /^([A-Z][A-Za-z0-9]*)\.tsx$/.exec(file);
      return m ? m[1] : null;
    };

    try {
      const raw = git([
        'log', '-500', '--no-merges', '--format=C\t%aI\t%an\t%H\t%s', '--name-status',
        '--', 'src/components', 'tokens.mjs', 'src/icons.ts',
        ':(exclude)src/components/*.stories.tsx',
      ]);

      // Carries the sha through the parse so the PR lookup below has something
      // to ask about; `pr` is attached at the end, once the list is cut down.
      type Row = Omit<Change, 'pr'> & { sha: string; subjectPr: string | null };
      const out: Row[] = [];
      let head: { date: string; who: string; why: string; sha: string; subjectPr: string | null } | null = null;
      let added: string[] = [];
      let removed: string[] = [];
      let touched: string[] = [];

      const flush = () => {
        if (!head) return;
        // One segment per kind rather than a single sentence, so the page can
        // colour each independently — removals are the thing you most want to
        // spot, and a joined string cannot say which half is which.
        const parts: Row['parts'] = [];
        if (removed.length) parts.push({ kind: 'removed', label: list(removed) });
        if (added.length) parts.push({ kind: 'added', label: list(added) });
        if (touched.length) parts.push({ kind: 'updated', label: list(touched) });
        if (parts.length) {
          const { sha, subjectPr: fromSubject, ...rest } = head;
          out.push({ ...rest, parts, sha, subjectPr: fromSubject });
        }
        added = [];
        removed = [];
        touched = [];
      };

      for (const line of raw.split('\n')) {
        if (line.startsWith('C\t')) {
          flush();
          const [, date, who, sha, subject] = line.split('\t');
          head = {
            date,
            who: (who ?? '').split(' ')[0],
            why: sentence(subject ?? ''),
            sha,
            subjectPr: subjectPr(subject ?? ''),
          };
          continue;
        }
        const m = /^([AMD])\t(.+)$/.exec(line);
        if (!m || !head) continue;
        const name = label(m[2]);
        if (!name) continue;
        if (m[1] === 'A') added.push(name);
        else if (m[1] === 'D') removed.push(name);
        else if (!touched.includes(name)) touched.push(name);
      }
      flush();
      // Enough to page through, not so much that the virtual module gets fat.
      // The PR lookup runs only over what survives the slice, since it is the
      // expensive part and nothing below the cut is ever rendered.
      // The merge walk first: it is the authoritative record and the subject can
      // be edited by hand. The subject is the fallback for the squash-merge era.
      return out
        // Capped at 60 while the list had no pagination. Once it had some, that
        // cap silently hid the oldest entries — a change log that stops partway
        // through is worse than none, because nothing says it stopped. What is
        // left is a runaway guard, not an editorial choice.
        .slice(0, 250)
        .map(({ sha, subjectPr: fromSubject, ...c }) => ({ ...c, pr: prFor(sha) ?? fromSubject }));
    } catch {
      return [];
    }
  };

  const read = () => {
    try {
      const raw = execFileSync(
        'git',
        ['log', '-1', '--format=%aI\t%an', '--', resolve(packageDir)],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], cwd: packageDir }
      ).trim();
      if (!raw) return { date: null, author: null, changes: readChanges() };
      // Tab-delimited, and split on the first tab only. A space delimiter
      // turned "Jimmy Posadas Esteban" into "Jimmy", because the author name
      // very often contains spaces.
      const gap = raw.indexOf('\t');
      if (gap === -1) return { date: raw, author: null };
      return {
        date: raw.slice(0, gap),
        author: raw.slice(gap + 1) || null,
        changes: readChanges(),
      };
    } catch (err) {
      // No git, not a repo, or a shallow clone with nothing to report. Say so
      // once: a silent null here shows up as a footer with its date quietly
      // missing, which is indistinguishable from "nobody wrote one".
      console.warn(
        `[mo-last-updated] git could not report a last commit, so the docs footer ` +
          `will omit its date: ${String(err).split('\n')[0]}`
      );
      return { date: null, author: null, changes: [] };
    }
  };

  return {
    name: 'mo-last-updated',
    // Read on first load, not in buildStart. Relying on buildStart having run
    // first is an ordering assumption, and when it did not hold the module
    // resolved to nulls and the footer quietly dropped its date — no error,
    // just a missing line. Memoised below, so it still shells out once.
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },
    load(id) {
      if (id !== RESOLVED_ID) return null;
      payload = payload ?? read();
      return `export const lastUpdated = ${JSON.stringify(payload)};`;
    },
  };
}
