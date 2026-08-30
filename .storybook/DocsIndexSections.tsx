import React, { useEffect, useState } from 'react';
import { colors, fontFamily } from '../tokens.mjs';
import { ComponentPreviewCard } from './ComponentPreviewCard';
import { FoundationCard, FOUNDATION_ART } from './FoundationArt';
import { DOCS_INDEX_GRID } from './DocsIndexCard';

/**
 * The Introduction's two indexes, built from Storybook's own story index.
 *
 * They used to be hand-written arrays grouped by purpose — Layout, Forms &
 * Inputs, Brand — while the sidebar groups by story title. Both listed all 56
 * entries, so nothing was missing, but the same component sat under different
 * headings in the two places and in a different order: Card was "Layout" here
 * and "Display" there, Container and Logo were filed as components here and as
 * Foundations there. Someone reading the index and then looking for the thing
 * in the sidebar had to translate.
 *
 * Reading the index removes the translation and the drift together. A component
 * added tomorrow appears in both, under the same heading, without anyone
 * editing this file. The cost is that the grouping is now Storybook's rather
 * than a curated one — which is the right trade, because the curated one was
 * only visible on one of the two surfaces that use it.
 */

type Entry = { id: string; title: string; type: string; name?: string };

let indexPromise: Promise<Entry[]> | null = null;

function loadDocsEntries(): Promise<Entry[]> {
  indexPromise ??= fetch(new URL('./index.json', window.location.href).href)
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
    .then((body: { entries?: Record<string, Entry> }) =>
      Object.values(body.entries ?? {}).filter((e) => e.type === 'docs')
    )
    .catch(() => []);
  return indexPromise;
}

/** One-line description per sidebar group. Keyed by the group's own name. */
const GROUP_BLURBS: Record<string, string> = {
  Display: 'Showing information — cards, tags, avatars, dividers',
  Forms: 'Anything someone types into or picks from',
  Actions: 'Buttons and clickable things that make something happen',
  Feedback: 'Ways to tell someone what is happening',
  Navigation: 'Moving around — tabs, breadcrumbs, pagination, menus',
  Overlays: 'Things that open on top of the page',
  Layouts: 'The overall page skeleton',
};

function useDocsEntries(): { entries: Entry[]; loaded: boolean } {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    void loadDocsEntries().then((found) => {
      if (!active) return;
      setEntries(found);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);
  return { entries, loaded };
}

function GroupHeading({ name, blurb }: { name: string; blurb?: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <span
        style={{
          fontFamily: fontFamily.body.join(', '),
          fontSize: 15,
          fontWeight: 600,
          color: colors['mo-black'],
        }}
      >
        {name}
      </span>
      {blurb && (
        <span style={{ fontFamily: fontFamily.body.join(', '), fontSize: 13, color: colors['mo-grey'].DEFAULT }}>
          {` — ${blurb}`}
        </span>
      )}
    </div>
  );
}

/** Foundations, in sidebar order. */
export function FoundationsIndex({ blurbs }: { blurbs: Record<string, string> }) {
  const { entries, loaded } = useDocsEntries();
  if (!loaded) return null;
  const items = entries.filter((e) => e.title.startsWith('Foundations/'));
  return (
    <div style={{ ...DOCS_INDEX_GRID, marginTop: 12, marginBottom: 32 }}>
      {items.map((e) => {
        const name = e.title.split('/').pop() as string;
        // Most Foundations pages are prose with nothing to render, so they get
        // an illustration. Container and Logo are real components filed under
        // Foundations, and drawing them would be silly when the thing itself can
        // be shown — they arrived in this list when it started deriving from the
        // sidebar, and without this branch they were two blank tiles.
        return FOUNDATION_ART[name] ? (
          <FoundationCard key={e.id} name={name} docsId={e.id} blurb={blurbs[name]} />
        ) : (
          <ComponentPreviewCard key={e.id} name={name} docsId={e.id} />
        );
      })}
    </div>
  );
}

/** Components and Layouts, grouped and ordered exactly as the sidebar has them. */
export function ComponentsIndex() {
  const { entries, loaded } = useDocsEntries();
  if (!loaded) return null;

  // Insertion order follows the index, which follows the configured storySort —
  // so the sections come out in the order the sidebar shows them.
  const groups = new Map<string, Entry[]>();
  for (const entry of entries) {
    const parts = entry.title.split('/');
    if (parts[0] !== 'Components' && parts[0] !== 'Layouts') continue;
    // "Components/Forms/Select" groups under Forms; "Layouts/AppLayout" under Layouts.
    const group = parts[0] === 'Layouts' ? 'Layouts' : parts[1];
    if (!group) continue;
    const list = groups.get(group) ?? [];
    list.push(entry);
    groups.set(group, list);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 12 }}>
      {[...groups].map(([group, items]) => (
        <div key={group}>
          <GroupHeading name={group} blurb={GROUP_BLURBS[group]} />
          <div style={DOCS_INDEX_GRID}>
            {items.map((e) => (
              <ComponentPreviewCard key={e.id} name={e.title.split('/').pop() as string} docsId={e.id} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
