export interface KbdProps {
  children: React.ReactNode;
}

/**
 * Kbd — a small bordered chip representing a single keyboard key (`⌘`, `↵`,
 * `Tab`), for keyboard-shortcut hints inline in UI copy (footers, tooltips,
 * result subtitles). Not a native `<kbd>` styling reset — an explicit chip,
 * since a bare `<kbd>` renders as unstyled italic text in most browsers.
 *
 * @example
 * ```tsx
 * <span>Select <Kbd>↵</Kbd></span>
 * ```
 */
export function Kbd({ children }: KbdProps) {
  return (
    <kbd className="rounded border border-mo-black/15 bg-mo-grey-1 px-1.5 py-0.5 font-mono text-mo-annotation text-mo-black/60">
      {children}
    </kbd>
  );
}
