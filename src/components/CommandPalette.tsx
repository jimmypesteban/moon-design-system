'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Command, useCommandState } from 'cmdk';
import { Search, X } from '../icons';
import { Kbd } from './Kbd';
import { getHighlightRuns } from './command-palette-highlight';

export interface CommandPaletteItem {
  /** Stable unique id — used as the cmdk match value, does not need to be human-readable */
  id: string;
  /** Text shown to the user. The portion matching the current search text renders bolder than the rest. */
  label: string;
  /**
   * Groups this item under a visible section heading (e.g. "Pages",
   * "Organizations") — items sharing a `group` render together under one
   * heading, in first-seen order. Omit for an item that should render bare,
   * outside any section.
   */
  group?: string;
  /** Optional leading icon (any lucide-react icon works). Reserves the same gutter width whether or not an item sets one, so mixed icon / no-icon lists still align. */
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  /** Optional right-aligned hint (e.g. an email, an org name, or a `<Kbd>` shortcut hint) */
  subtitle?: React.ReactNode;
  /** Optional extra terms matched against the search query but not shown */
  keywords?: string[];
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandPaletteItem[];
  /** Called with the chosen item. The palette closes itself first. */
  onSelect: (item: CommandPaletteItem) => void;
  placeholder?: string;
  emptyMessage?: string;
  /** Accessible name for the dialog. Not shown visibly. */
  label?: string;
  /**
   * Called on every keystroke in the search input. Pass `query` alongside
   * this to make the input controlled — needed if the caller ever needs to
   * reset the text itself (e.g. clearing the query when entering or leaving
   * a drill-down scope). Omit `query` to leave the input uncontrolled
   * (managed entirely by `cmdk`), with this as a pure observer.
   */
  onQueryChange?: (query: string) => void;
  /** Controlled query text. Only meaningful alongside `onQueryChange` — see above. */
  query?: string;
  /** Shows a loading row (cmdk's own `Command.Loading` slot) — for a caller still waiting on an async source. */
  loading?: boolean;
  /** Shows a quiet inline row instead of silently dropping a failed async search. Non-blocking — items still work. */
  errorMessage?: string;
  /**
   * Forwarded to the underlying `cmdk` root. Lets a caller intercept keys
   * cmdk doesn't own itself — e.g. `cmdk`'s own documented "nested pages"
   * recipe (Backspace-when-empty pops a drill-down scope) — without this
   * component needing to know anything about pages/scopes itself.
   */
  onKeyDown?: (event: React.KeyboardEvent) => void;
  /**
   * Called with the id of whichever item is currently keyboard-highlighted
   * (including the initial auto-highlighted item, and on every arrow-key
   * move). Lets a caller resolve "what does ArrowRight/ArrowLeft do right
   * now" inside its own `onKeyDown` without this component knowing anything
   * about what that means — e.g. drilling into a scoped sub-search for
   * whichever entity type the highlighted row represents.
   */
  onHighlightChange?: (id: string) => void;
  /**
   * Renders a small dismissible chip before the search input showing the
   * current drill-down scope (e.g. "Classes", or the name of one entity) — a
   * fixed-position header element rather than a selectable row, so it's never
   * sorted, filtered, or scrolled out of view the way a "‹ Back" row would be.
   * Bounded and truncated, since an entity name at full width would squeeze the
   * search input out of the row. Pair with `onClearScope`.
   */
  scopeLabel?: string;
  /** Called when the scope chip is clicked. Only meaningful alongside `scopeLabel`. */
  onClearScope?: () => void;
  /**
   * What `→` would do on the currently highlighted row (e.g. "Actions",
   * "Search classes"). Renders twice: as a `→` marker on that row, and as a
   * named hint in the footer. This component stays unaware of what drilling in
   * means — it only knows that the caller has given the key a meaning here.
   * Omit when the highlighted row has nothing below it, which is also what
   * takes the marker off the list entirely.
   *
   * Deliberately per-highlighted-row rather than per-item: a standing marker on
   * every drillable row repeats itself once per row while only ever being
   * actionable on one of them, and an item's `subtitle` slot is usually already
   * spoken for by real matchable metadata. Raycast and VS Code's Quick Open
   * both put this affordance on the active row and name it in the footer.
   *
   * While this is set, every row reserves the marker's width and only the
   * highlighted one fills it, so arrowing through a list of drillable rows
   * doesn't reflow the subtitle and re-truncate the label on each keypress.
   * The footer hint is also what the highlighted row is `aria-describedby` —
   * the marker itself is decorative, and a footer that changes silently would
   * leave a screen-reader user no way to learn the key does anything here.
   */
  drillHint?: string;
  /**
   * Whether the current list holds any drillable row at all. Reserves the `→`
   * marker's column on every row while true — the marker itself still only
   * appears on the highlighted one.
   *
   * Separate from `drillHint` because that one names *the highlighted row's*
   * target and is therefore momentarily absent whenever the highlight is
   * between rows (a query change clears it and `cmdk` picks the next one on
   * the following render). Reserving off `drillHint` would collapse and
   * restore the column on every keystroke, which is the reflow the reservation
   * exists to prevent; reserving off the list as a whole is stable, and is
   * correctly false somewhere like an action panel where nothing drills.
   */
  hasDrillTargets?: boolean;
  /**
   * Quiet text pinned to the right of a section heading, keyed by `group` — for
   * a caller whose list is capped and wants to say so ("5 of 37"). A heading
   * is the only place it can go: it belongs to the section rather than to any
   * row in it, and a row of its own would be sorted and filtered like a result.
   * Groups with no entry here render their heading unchanged.
   */
  groupHints?: Record<string, React.ReactNode>;
}

// `:not(:first-child)` puts a divider between sections without special-casing
// the first one. Minor known imperfection: if an earlier group is entirely
// filtered out (not literally removed from the DOM, cmdk just hides it), the
// next visible group can still pick up a stray top border/margin, since a
// hidden node still occupies its sibling slot for CSS purposes.
const GROUP_CLASSNAME =
  '[&:not(:first-child)]:mt-2 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-mo-black/10 [&:not(:first-child)]:pt-2 ' +
  '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-mo-annotation [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-mo-black/40 ' +
  // A row rather than a line of text, so a `groupHints` entry can sit against
  // the right edge. Harmless for a heading that is only its own title: one
  // child in a flex row lays out exactly as it did before.
  '[&_[cmdk-group-heading]]:flex [&_[cmdk-group-heading]]:items-baseline [&_[cmdk-group-heading]]:justify-between [&_[cmdk-group-heading]]:gap-3';

const INDETERMINATE_BAR_ANIMATION_NAME = 'mo-command-palette-indeterminate';
/** Travels from just off the left edge to just past the right one, so the track is never static. */
const INDETERMINATE_BAR_KEYFRAMES = `@keyframes ${INDETERMINATE_BAR_ANIMATION_NAME} {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}`;

/**
 * Puts the list back at the top whenever the search text changes.
 *
 * `cmdk` never resets the scroll offset itself: it scrolls the *selected* row
 * into view and leaves the rest alone. So a list the admin has scrolled — or
 * one left scrolled by a previous, longer query — stays where it was while its
 * contents are replaced underneath, which reads as the palette scrolling itself
 * down as you type: the rows that answer the query are above the viewport, and
 * the first thing you see is whatever happens to sit at the old offset.
 *
 * It has to be a child of the `cmdk` root and subscribe to the store's own
 * `search`: `cmdk` filters in a pass *after* the render that carried the new
 * text, so an effect in the parent keyed on the query runs while the DOM still
 * holds the previous query's rows (verified — it reports the old row count and
 * the old first row).
 */
function ScrollResetOnSearch({ listRef }: { listRef: React.RefObject<HTMLDivElement | null> }) {
  const search = useCommandState((state) => state.search as string);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [search, listRef]);

  return null;
}

/**
 * CommandPalette — a `Cmd/Ctrl+K`-style modal quick-search. Built on `cmdk`
 * (the same primitive behind Linear/Vercel/GitHub-style command menus):
 * fuzzy filtering, keyboard navigation, and focus trapping all come from the
 * library — this wrapper only supplies the Moon visual language and the
 * item layout. The caller owns `open` state, the item list, and what a
 * selection does; the palette closes itself before calling `onSelect`.
 *
 * Items sharing a `group` render together under one visible heading (like
 * GitHub's own Cmd+K "Owners" / "Repositories" / "Suggestions"); an item
 * with no `group` renders bare, outside any section.
 *
 * @example
 * ```tsx
 * <CommandPalette
 *   open={open}
 *   onOpenChange={setOpen}
 *   items={[{ id: '/admin/classes', label: 'Classes', group: 'Pages', icon: LayoutGrid }]}
 *   onSelect={(item) => router.push(item.id)}
 * />
 * ```
 */
export function CommandPalette({
  open,
  onOpenChange,
  items,
  onSelect,
  placeholder = 'Search...',
  emptyMessage = 'No results found.',
  label = 'Command menu',
  onQueryChange,
  query,
  loading = false,
  errorMessage,
  onKeyDown,
  onHighlightChange,
  scopeLabel,
  onClearScope,
  drillHint,
  hasDrillTargets = false,
  groupHints,
}: CommandPaletteProps) {
  const showIconGutter = useMemo(() => items.some((item) => item.icon), [items]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Names the footer hint so the highlighted row can point at it. Not derived
  // from `label` or the group: two palettes on one page would collide.
  const drillHintId = useId();

  const handleClearScope = () => {
    onClearScope?.();
    // The chip lives outside cmdk's item list, so clicking it moves DOM
    // focus off the input — reclaim it for keyboard nav to keep working.
    inputRef.current?.focus();
  };

  // Controlled entirely internally (the caller never sets this) purely so
  // `onHighlightChange` has something to read — `cmdk`'s root only fires its
  // own `onValueChange` when `value` is controlled at all.
  const [highlightedId, setHighlightedId] = useState('');

  const handleHighlightChange = (id: string) => {
    setHighlightedId(id);
    onHighlightChange?.(id);
  };

  // Closing drops the highlight, so the next open starts on its first row.
  //
  // `cmdk` auto-selects the first item only while its value is empty
  // (`store.value || selectFirstItem()`), and this component stays mounted
  // across opens — only the dialog's contents unmount — so without this the
  // value from the previous open survives into the next one. When the row it
  // names is still there it steals the highlight from the top of the list;
  // when it is gone (a drill-down row whose level closed with it) **nothing**
  // is highlighted, and `Enter` does nothing until the user types or arrows.
  // The consumer resyncs from the next `onValueChange` on reopen.
  useEffect(() => {
    if (!open) setHighlightedId('');
  }, [open]);

  // Highlighting needs the live query text regardless of whether this
  // instance is controlled. When the caller controls `query`, that prop is
  // the single source of truth — an internal copy would go stale the moment
  // the caller resets it externally (e.g. clearing the text when entering a
  // drill-down scope) without a matching keystroke to update it through.
  // Only uncontrolled callers (no `query` prop) fall back to internal state.
  const [uncontrolledQuery, setUncontrolledQuery] = useState('');
  const liveQuery = query ?? uncontrolledQuery;
  const handleQueryChange = (value: string) => {
    if (query === undefined) {
      setUncontrolledQuery(value);
    }
    onQueryChange?.(value);
  };


  const handleSelect = (item: CommandPaletteItem) => {
    onOpenChange(false);
    onSelect(item);
  };

  // Bucketed by `group`, preserving first-seen order. `undefined` is its own
  // bucket, rendered bare (no `Command.Group` wrapper) rather than under a
  // blank heading.
  const groups = useMemo(() => {
    const byGroup = new Map<string | undefined, CommandPaletteItem[]>();
    for (const item of items) {
      const bucket = byGroup.get(item.group);
      if (bucket) {
        bucket.push(item);
      } else {
        byGroup.set(item.group, [item]);
      }
    }
    return Array.from(byGroup.entries());
  }, [items]);

  function renderItem(item: CommandPaletteItem) {
    const Icon = item.icon;
    const isHighlighted = item.id === highlightedId;
    return (
      <Command.Item
        key={item.id}
        value={item.id}
        keywords={[item.label, ...(item.group ? [item.group] : []), ...(item.keywords ?? [])]}
        onSelect={() => handleSelect(item)}
        // cmdk keeps DOM focus on the input and marks the active row with
        // `aria-activedescendant`, so a description on the row is announced
        // when the highlight lands on it — which is how the footer's wording
        // reaches a screen reader at all.
        aria-describedby={drillHint && isHighlighted ? drillHintId : undefined}
        // `hover:` rather than `data-[selected]`, since the pointer no longer
        // moves the selection — this is what a mouse user gets instead.
        className="flex cursor-pointer items-center gap-3 rounded-mo-sm px-2 py-2 text-sm text-mo-black hover:bg-mo-black/5 data-[selected=true]:bg-mo-red/10 data-[selected=true]:text-mo-red"
      >
        {showIconGutter && (
          <span className="flex w-4 shrink-0 items-center justify-center">
            {Icon && <Icon size={16} className="text-mo-black/40" />}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate">
          {getHighlightRuns(item.label, liveQuery).map((run, index) => (
            <span key={index} className={run.matched ? 'font-bold' : 'font-medium'}>
              {run.text}
            </span>
          ))}
        </span>
        {item.subtitle && <span className="shrink-0 text-mo-annotation text-mo-black/40">{item.subtitle}</span>}
        {/* Visible only on the highlighted row, but present on every row while
            anything is drillable, so the highlight moving doesn't resize its
            neighbours — see `drillHint`. `aria-hidden` because the row is
            already described by the footer hint that names the same
            affordance in words. */}
        {hasDrillTargets && (
          <span className={`shrink-0 ${drillHint && isHighlighted ? '' : 'invisible'}`} aria-hidden="true">
            <Kbd>→</Kbd>
          </span>
        )}
      </Command.Item>
    );
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      onKeyDown={onKeyDown}
      value={highlightedId}
      onValueChange={handleHighlightChange}
      // `cmdk` moves the highlight on `pointermove` over a row by default,
      // which fights its own scroll-the-selection-into-view behaviour: a
      // keystroke re-selects the top row and scrolls up to it, the content
      // moves under a *stationary* cursor, the browser emits a mousemove for
      // that move, the row now under the cursor takes the highlight, and the
      // list scrolls down to it — so the list creeps downwards on every
      // keystroke and the highlight ends up on whatever the mouse happens to
      // be resting over. The highlight stays keyboard-owned here; hover still
      // gets its own background, and clicking a row still selects it.
      disablePointerSelection
      label={label}
      overlayClassName="fixed inset-0 z-50 bg-mo-black/50"
      contentClassName="fixed left-1/2 top-32 z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-mo-md border border-mo-black/10 bg-white font-body shadow-mo-popup"
    >
      <div className="flex items-center gap-2 border-b border-mo-black/10 px-4">
        <Search size={16} className="shrink-0 text-mo-black/40" aria-hidden="true" />
        {scopeLabel && (
          <button
            type="button"
            onClick={handleClearScope}
            // Out of the tab order on purpose. It's the only other tabbable
            // node in the dialog, so Radix's focus scope moves focus here on
            // Tab — leaving Enter to dismiss the scope instead of running the
            // highlighted row. A consumer cannot prevent that from its own
            // `onKeyDown`, which is bubble-phase and runs after Radix's
            // capture-phase listener. Nothing is lost: this is a pointer
            // affordance, and every keyboard path out of a scope (Escape,
            // Shift+Tab, ArrowLeft/Backspace on an empty query) is the
            // consumer's own.
            tabIndex={-1}
            className="flex max-w-[45%] shrink-0 items-center gap-1 rounded-mo-sm bg-mo-black/5 px-2 py-1 text-mo-annotation font-medium text-mo-black/70 hover:bg-mo-black/10"
          >
            <span className="truncate">{scopeLabel}</span>
            <X size={12} className="shrink-0" />
          </button>
        )}
        <Command.Input
          ref={inputRef}
          placeholder={placeholder}
          value={query}
          onValueChange={handleQueryChange}
          className="w-full bg-transparent py-3 text-sm text-mo-black placeholder:text-mo-black/40 focus:outline-none"
        />
      </div>
      {/* An indeterminate progress bar under the input rather than a row in the
          result area, and the rows already on screen stay put behind it.

          A "Searching…" row inside the list is a row: it takes a slot at the
          top of the answer, pushes everything down as it appears and up again
          as it goes, and does that on every keystroke that outruns the
          request. Both palettes that document this put the indicator under the
          search field and leave the results alone — Raycast's `isLoading`
          renders a loading bar below its search bar, and VS Code moved
          `QuickPick.busy`'s progress bar below the text input for exactly this
          reason (microsoft/vscode#169039, after the indicator proved
          invisible where it was). The results themselves are deliberately
          *not* cleared while a newer search is in flight: the caller keeps the
          previous page until the next one lands, so the list holds its shape
          and the reader keeps their place.

          A segment travelling across a visible track, not a fade. The first
          version used `animate-pulse`, which is an opacity fade: on a 2px line
          it reads as blinking rather than as work in progress, and at the low
          point there is nothing on screen at all. The track is what makes the
          bar present even while the segment is off its left edge.

          The strip keeps its height whether or not anything is loading, so the
          list below it never moves.

          `Command.Loading` still carries the announcement, so the progressbar
          role and its accessible name come from `cmdk` rather than a
          hand-rolled `aria-live` region — visually empty, since the bar beside
          it is the visible half and is `aria-hidden`.

          The keyframes are local rather than a Tailwind `animation` utility:
          custom keys under a preset's `theme.extend` are silently dropped by
          Tailwind v4's JS-config compat layer (that is how `fontFamily`
          vanished — see `docs/design-system-handoff.md`), and a dropped
          keyframe is a dead class with no error. This cannot silently fail in
          a consumer app. */}
      <style>{INDETERMINATE_BAR_KEYFRAMES}</style>
      <div className="h-0.5 w-full overflow-hidden">
        {loading && (
          <>
            <Command.Loading label="Searching" className="sr-only" />
            <div className="h-full w-full overflow-hidden bg-mo-black/10" aria-hidden="true">
              <div
                className="h-full w-1/3 rounded-full bg-mo-red"
                style={{ animation: `${INDETERMINATE_BAR_ANIMATION_NAME} 1.1s linear infinite` }}
              />
            </div>
          </>
        )}
      </div>
      <ScrollResetOnSearch listRef={listRef} />
      <Command.List ref={listRef} className="max-h-96 overflow-y-auto p-2">
        {/* cmdk shows this purely on item count, with no notion of `loading` —
            without the guard, a still-in-flight search with no items yet
            claims there is nothing to find while the answer is in flight.
            Raycast documents the same rule for its own empty view. */}
        {!loading && <Command.Empty className="py-6 text-center text-sm text-mo-black/50">{emptyMessage}</Command.Empty>}
        {errorMessage && <div className="px-4 py-3 text-center text-mo-annotation text-mo-black/40">{errorMessage}</div>}
        {groups.map(([group, groupItems]) =>
          group ? (
            <Command.Group
              key={group}
              // A hint rides in the heading as a second child, pushed right by
              // the heading's own `justify-between` — see `GROUP_CLASSNAME`.
              heading={
                groupHints?.[group] ? (
                  <>
                    <span>{group}</span>
                    {/* `tabular-nums` so a count changing as you type doesn't
                        shift the digits around it. */}
                    <span className="font-normal tabular-nums text-mo-black/30">{groupHints[group]}</span>
                  </>
                ) : (
                  group
                )
              }
              value={group}
              className={GROUP_CLASSNAME}
            >
              {groupItems.map(renderItem)}
            </Command.Group>
          ) : (
            groupItems.map(renderItem)
          ),
        )}
      </Command.List>
      <div className="flex items-center justify-end gap-3 border-t border-mo-black/10 px-4 py-2 text-mo-annotation text-mo-black/50">
        <span className="flex items-center gap-1">
          Navigate <Kbd>↑</Kbd> <Kbd>↓</Kbd>
        </span>
        <span className="flex items-center gap-1">
          Select <Kbd>↵</Kbd>
        </span>
        {drillHint && (
          <span id={drillHintId} className="flex items-center gap-1">
            {drillHint} <Kbd>→</Kbd>
          </span>
        )}
        <span className="flex items-center gap-1">
          Close <Kbd>esc</Kbd>
        </span>
      </div>
    </Command.Dialog>
  );
}
