import React, { useMemo, useState } from 'react';
import * as tokens from '../tokens.mjs';

/**
 * Every token in the system, in one searchable list.
 *
 * Generated from tokens.mjs rather than written out, which is the only reason
 * it is worth having: a hand-maintained list of 200-odd values would be wrong
 * within a month and wrong silently. Add a token and it appears here; delete
 * one and it disappears. Nobody has to remember this page exists.
 *
 * It does not replace the individual Foundations pages. Those explain *when* to
 * reach for a value and show it in context; this answers "what is the token
 * called" and "what does it actually equal", which is the question you have
 * when you are reading someone else's code.
 */

const { borderRadius, boxShadow, breakpoints, colors, container, fontFamily, fontSize, spacing } =
  tokens as Record<string, Record<string, unknown>>;

type Row = {
  /** The token name as written in code. */
  name: string;
  group: string;
  /** The resolved value. */
  value: string;
  /** How you actually reach for it in a class name, where one exists. */
  usage: string | null;
  kind: 'color' | 'radius' | 'shadow' | 'space' | 'text' | 'font' | 'plain';
};

/**
 * Colour tokens are two shapes at once: flat (`mo-black`) and ramped
 * (`mo-red` with DEFAULT plus steps 1-10). Both are flattened to the names you
 * would actually type, so `mo-red` and `mo-red-3` are separate rows.
 */
function colorRows(): Row[] {
  const rows: Row[] = [];
  for (const [name, value] of Object.entries(colors)) {
    if (typeof value === 'string') {
      rows.push({ name, group: 'Color', value, usage: `bg-${name} · text-${name}`, kind: 'color' });
      continue;
    }
    for (const [step, hex] of Object.entries(value as Record<string, string>)) {
      const full = step === 'DEFAULT' ? name : `${name}-${step}`;
      rows.push({ name: full, group: 'Color', value: hex, usage: `bg-${full} · text-${full}`, kind: 'color' });
    }
  }
  return rows;
}

function flatRows(
  source: Record<string, unknown>,
  group: string,
  kind: Row['kind'],
  usage: (name: string) => string | null
): Row[] {
  return Object.entries(source).map(([name, value]) => ({
    name,
    group,
    // fontSize entries are [size, { lineHeight }] tuples; the rest are strings.
    value: Array.isArray(value) ? String(value[0]) : String(value),
    usage: usage(name),
    kind,
  }));
}

function allRows(): Row[] {
  return [
    ...colorRows(),
    ...flatRows(spacing, 'Spacing', 'space', (n) => `p-${n} · gap-${n} · m-${n}`),
    ...flatRows(borderRadius, 'Radius', 'radius', (n) => `rounded-${n}`),
    ...flatRows(boxShadow, 'Shadow', 'shadow', (n) => `shadow-${n}`),
    ...flatRows(fontSize, 'Text size', 'text', (n) => `text-${n}`),
    ...flatRows(fontFamily, 'Font', 'font', (n) => `font-${n}`),
    ...flatRows(breakpoints, 'Breakpoint', 'plain', (n) => `${n}:`),
    ...flatRows(container ?? {}, 'Container', 'plain', () => null),
  ];
}

/** A small visual of the value itself, so the number is not the only signal. */
function Swatch({ row }: { row: Row }) {
  const base: React.CSSProperties = { display: 'inline-block', flex: 'none' };
  switch (row.kind) {
    case 'color':
      return (
        <span
          style={{
            ...base,
            width: 34,
            height: 20,
            borderRadius: 4,
            background: row.value,
            border: `1px solid ${colors['mo-black'] as string}22`,
          }}
        />
      );
    case 'radius':
      return (
        <span
          style={{
            ...base,
            // Wider than twice the largest radius, or the top of the scale
            // collapses into a circle and every step looks the same.
            width: 44,
            height: 20,
            borderRadius: row.value,
            background: (colors['mo-grey'] as Record<string, string>)[4],
          }}
        />
      );
    case 'shadow':
      return (
        <span
          style={{
            ...base,
            width: 34,
            height: 20,
            borderRadius: 4,
            background: (colors['mo-grey'] as Record<string, string>)[1],
            boxShadow: row.value,
          }}
        />
      );
    case 'space':
      return (
        <span
          style={{
            ...base,
            width: Math.min(parseInt(row.value, 10) || 2, 44),
            height: 12,
            borderRadius: 2,
            background: (colors['mo-blue'] as Record<string, string>).DEFAULT,
          }}
        />
      );
    case 'text':
      return (
        <span style={{ ...base, fontSize: Math.min(parseFloat(row.value) || 12, 22), lineHeight: 1 }}>Aa</span>
      );
    case 'font':
      return <span style={{ ...base, fontFamily: row.value, fontSize: 15, lineHeight: 1 }}>Aa</span>;
    default:
      return <span style={{ ...base, width: 34 }} />;
  }
}

export function TokenTable() {
  const rows = useMemo(allRows, []);
  const groups = useMemo(() => ['All', ...new Set(rows.map((r) => r.group))], [rows]);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('All');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Group and usage are searchable too, not just name and value. Searching
    // "shadow" returned nothing before, because no shadow token has the word in
    // its name (`mo-sm`) or its value (`0 1px 2px …`) — only in its group and
    // its class. The placeholder invited exactly that search and it came back
    // empty, which reads as "we have no shadows".
    return rows.filter(
      (r) =>
        (group === 'All' || r.group === group) &&
        (!q ||
          r.name.toLowerCase().includes(q) ||
          r.value.toLowerCase().includes(q) ||
          r.group.toLowerCase().includes(q) ||
          (r.usage ?? '').toLowerCase().includes(q))
    );
  }, [rows, query, group]);

  const line = (colors['mo-grey'] as Record<string, string>)[3];
  const muted = (colors['mo-grey'] as Record<string, string>).DEFAULT;
  const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace';

  return (
    <div style={{ fontFamily: (fontFamily.body as string[]).join(', '), marginTop: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or value — try “red”, “16px”, “shadow”"
          aria-label="Search tokens"
          style={{
            flex: '1 1 260px',
            minWidth: 0,
            padding: '8px 12px',
            fontSize: 13,
            fontFamily: 'inherit',
            color: colors['mo-black'] as string,
            border: `1px solid ${line}`,
            borderRadius: (borderRadius['mo-sm'] as string) ?? '12px',
            background: (colors['mo-grey'] as Record<string, string>)[1],
          }}
        />
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          aria-label="Filter by group"
          style={{
            padding: '8px 12px',
            fontSize: 13,
            fontFamily: 'inherit',
            color: colors['mo-black'] as string,
            border: `1px solid ${line}`,
            borderRadius: (borderRadius['mo-sm'] as string) ?? '12px',
            background: (colors['mo-grey'] as Record<string, string>)[1],
          }}
        >
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <span style={{ fontSize: 13, color: muted, whiteSpace: 'nowrap' }}>
          {shown.length} of {rows.length}
        </span>
      </div>

      {/* Wide content scrolls in its own box so the page never scrolls sideways.
          `sb-unstyled` because Storybook's docs CSS restyles every table on a
          docs page — its own borders, cell padding and row rules — and those are
          not font-size, so the global inherit rule in preview.css does not reach
          them. Measured before: rows came out 109px tall against the 6px padding
          set here. This is the one place the per-element opt-out is the right
          tool rather than a shortcut: it exempts the whole table so the styles
          below are the only ones in play. */}
      <div
        className="sb-unstyled"
        style={{ border: `1px solid ${line}`, borderRadius: 10, overflowX: 'auto' }}
      >
        {/* Sized to its content, not to the container. With `width: 100%` the
            auto layout handed the surplus to the value column (581px for a
            7-character hex) and squeezed "how to use it" to 99px, where it
            wrapped and every row came out 88px tall. Content width plus a floor,
            scrolling inside the box above, keeps every row on one line. */}
        <table style={{ borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
          <thead>
            <tr style={{ background: (colors['mo-grey'] as Record<string, string>)[2] }}>
              {['', 'Token', 'Value', 'How to use it'].map((h, i) => (
                <th
                  key={h || i}
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: muted,
                    borderBottom: `1px solid ${line}`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={`${r.group}:${r.name}`} style={{ borderBottom: `1px solid ${line}` }}>
                <td style={{ padding: '6px 12px', width: 52 }}>
                  <Swatch row={r} />
                </td>
                <td style={{ padding: '6px 12px', fontFamily: mono, fontSize: 12.5, whiteSpace: 'nowrap' }}>
                  {r.name}
                </td>
                {/* Capped and clipped rather than wrapped. Shadow values are
                    long CSS strings: left to `nowrap` they sized the whole
                    column to 581px for content that is usually a 7-character
                    hex, pushing "how to use it" off the edge — and wrapping
                    them broke `#313030` across three lines, which was worse.
                    The full value is on the title attribute. */}
                <td
                  title={r.value}
                  style={{
                    padding: '6px 12px',
                    fontFamily: mono,
                    fontSize: 12.5,
                    color: muted,
                    maxWidth: 230,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {r.value}
                </td>
                <td
                  style={{
                    padding: '6px 12px',
                    fontFamily: mono,
                    fontSize: 12.5,
                    color: muted,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {r.usage ?? '—'}
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '18px 12px', fontSize: 13, color: muted }}>
                  Nothing matches “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
