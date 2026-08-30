"use client";

import { Select } from './Select';
import { ChevronLeft, ChevronRight } from "../icons";

export const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 25;

/** Build a compact page list with ellipses, e.g. [1, '…', 4, 5, 6, '…', 20]. */
export function buildPageItems(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("ellipsis");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push("ellipsis");
  items.push(total);
  return items;
}

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /**
   * Total item count. Omit to render Prev/numbered/Next controls only; pass
   * it (with `pageSize`) to also render a "Showing X–Y of N" summary and,
   * with `onPageSizeChange`, a page-size selector — matching the pattern
   * used across the admin Submissions, Activity Submissions, and Curriculum
   * Enrollments lists.
   */
  total?: number;
  pageSize?: number;
  /** Index range shown for the current page; derived from page/pageSize/total if omitted. */
  rangeStart?: number;
  rangeEnd?: number;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  /** Noun for the summary label, e.g. "students". Defaults to "results". */
  itemLabel?: string;
  className?: string;
}

/**
 * Pagination — page-number navigation for a chunked dataset, used across
 * the admin and consumer apps (submission lists, rosters, class lists,
 * etc.). Reconciled against the pattern that shipped first on the admin
 * classes list and was hand-copied into three other admin pages before
 * landing here as the canonical version — brand `mo-red` active state and
 * `mo-sm` radius, not the ad-hoc hex/`rounded-lg` each copy had drifted to.
 *
 * @example
 * ```tsx
 * <Pagination page={page} totalPages={10} onPageChange={setPage} />
 *
 * // With summary + page-size selector:
 * <Pagination
 *   page={page}
 *   totalPages={totalPages}
 *   total={total}
 *   pageSize={pageSize}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}
 *   itemLabel="students"
 * />
 * ```
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  total,
  pageSize,
  rangeStart,
  rangeEnd,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  itemLabel = "results",
  className = "",
}: PaginationProps) {
  const showSummary = total != null && pageSize != null;
  const start =
    rangeStart ??
    (showSummary ? (total === 0 ? 0 : (page - 1) * pageSize + 1) : undefined);
  const end =
    rangeEnd ?? (showSummary ? Math.min(page * pageSize, total) : undefined);

  return (
    <nav
      aria-label="Pagination"
      // @container, not a viewport breakpoint: this control is dropped into
      // sidebars and cards, so its own width is what decides whether the page
      // numbers fit. A viewport query would keep showing all nine controls in a
      // 340px column on a wide screen — the mistake the audio player made.
      className={[
        "@container flex flex-wrap items-center justify-between gap-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showSummary ? (
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-900">
              {start}–{end}
            </span>{" "}
            of <span className="font-medium text-gray-900">{total}</span>{" "}
            {itemLabel}
          </p>
          {onPageSizeChange && (
            <label className="flex items-center gap-1.5 text-sm text-gray-500">
              {/* A container query, like the page numbers below. This was
                  `hidden sm:inline` — a viewport breakpoint — so the label vanished
                  whenever the page it sat on was under 640px wide, even with room to
                  spare in the control itself: in a 543px docs pane this component had
                  511px and still hid it. The same mistake the page numbers had, one
                  line further up. */}
              <span className="hidden @min-[420px]:inline">Per page</span>
              {/* The library's own Select, not a hand-rolled native one. This
                  was a bare <select> with symmetric `px-2`, so the browser's
                  chevron sat on top of the value with nothing reserved for it.
                  Select already solves that — appearance-none, pl-3 pr-8, and
                  its own positioned chevron — and it is the same fix that was
                  applied to the Colors page, which never reached here. */}
              <Select
                size="sm"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                options={pageSizeOptions.map((opt) => ({ value: String(opt), label: String(opt) }))}
                aria-label="Rows per page"
              />
            </label>
          )}
        </div>
      ) : (
        <span />
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className="inline-flex items-center gap-1 rounded-mo-sm border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          {/* The full row of numbers needs ~420px. Below that the numbers are
              replaced by a position indicator and Prev/Next carry navigation,
              which is the conventional narrow-width pagination and keeps every
              page reachable rather than clipping buttons off the edge. */}
          <span className="px-2 text-sm text-gray-700 @min-[440px]:hidden">
            {page} / {totalPages}
          </span>
          {buildPageItems(page, totalPages).map((item, idx) =>
            item === "ellipsis" ? (
              <span
                key={`e-${idx}`}
                className="hidden select-none px-2 text-sm text-gray-400 @min-[440px]:inline"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? "page" : undefined}
                className={`hidden min-w-9 rounded-mo-sm border px-3 py-1.5 text-sm transition-colors @min-[440px]:inline-block ${
                  item === page
                    ? "border-mo-red bg-mo-red text-mo-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
            className="inline-flex items-center gap-1 rounded-mo-sm border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </nav>
  );
}
