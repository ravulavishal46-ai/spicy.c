"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, Inbox, Search } from "lucide-react";
import { useHydrated } from "@/lib/store/create-store";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  /** Hide on small screens. */
  hideOnMobile?: boolean;
  align?: "left" | "right";
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  searchText?: (row: T) => string;
  searchPlaceholder?: string;
  toolbar?: React.ReactNode;
  onRowClick?: (row: T) => void;
  rowLabel?: (row: T) => string;
  pageSize?: number;
  emptyTitle?: string;
  emptyBody?: string;
  initialSort?: { key: string; dir: "asc" | "desc" };
  caption: string;
}

/** Sortable, searchable, paginated table for the admin prototype. */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  searchText,
  searchPlaceholder = "Search…",
  toolbar,
  onRowClick,
  rowLabel,
  pageSize = 10,
  emptyTitle = "Nothing here",
  emptyBody = "Try a different search or filter.",
  initialSort,
  caption,
}: DataTableProps<T>) {
  const hydrated = useHydrated();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(initialSort ?? null);
  const [page, setPage] = useState(0);

  const term = query.trim().toLowerCase();
  let filtered = term && searchText ? rows.filter((r) => searchText(r).toLowerCase().includes(term)) : rows;
  const sortCol = sort ? columns.find((c) => c.key === sort.key) : null;
  if (sort && sortCol?.sortValue) {
    const get = sortCol.sortValue;
    filtered = [...filtered].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * pageSize, current * pageSize + pageSize);

  function toggleSort(key: string) {
    setSort((s) => (s?.key === key ? (s.dir === "asc" ? { key, dir: "desc" } : null) : { key, dir: "asc" }));
  }

  return (
    <div className="overflow-hidden rounded-[1.25rem] bg-white shadow-[var(--shadow-soft)] ring-1 ring-charcoal/[0.04]">
      <div className="flex flex-wrap items-center gap-3 border-b border-charcoal/[0.06] p-3 sm:p-4">
        {searchText && (
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ash" aria-hidden />
            <label className="sr-only" htmlFor={`search-${caption}`}>
              Search {caption}
            </label>
            <input
              id={`search-${caption}`}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder={searchPlaceholder}
              className="h-10 w-full rounded-full border-[1.5px] border-cream-300 bg-cream/50 pl-9 pr-3 text-sm focus:border-charcoal focus:outline-none"
            />
          </div>
        )}
        {toolbar}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-charcoal/[0.06] text-xs uppercase tracking-wider text-ash">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={sort?.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                  className={cn("whitespace-nowrap px-4 py-3 font-semibold", c.align === "right" && "text-right", c.hideOnMobile && "hidden md:table-cell", c.className)}
                >
                  {c.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className={cn("inline-flex cursor-pointer items-center gap-1 uppercase tracking-wider hover:text-charcoal", sort?.key === c.key && "text-charcoal")}
                    >
                      {c.header}
                      {sort?.key === c.key ? (
                        sort.dir === "asc" ? <ArrowUp className="h-3.5 w-3.5" aria-hidden /> : <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" aria-hidden />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!hydrated
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-charcoal/[0.04]">
                    {columns.map((c) => (
                      <td key={c.key} className={cn("px-4 py-4", c.hideOnMobile && "hidden md:table-cell")}>
                        <div className="skeleton h-4 w-full max-w-32" />
                      </td>
                    ))}
                  </tr>
                ))
              : visible.map((row) => (
                  <tr
                    key={rowKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    onKeyDown={
                      onRowClick
                        ? (e) => {
                            if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                              e.preventDefault();
                              onRowClick(row);
                            }
                          }
                        : undefined
                    }
                    tabIndex={onRowClick ? 0 : undefined}
                    aria-label={onRowClick && rowLabel ? rowLabel(row) : undefined}
                    className={cn(
                      "border-b border-charcoal/[0.04] transition-colors last:border-0",
                      onRowClick && "cursor-pointer hover:bg-cream/70 focus-visible:bg-cream focus-visible:outline-none",
                    )}
                  >
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={cn("px-4 py-3.5 align-middle", c.align === "right" && "text-right", c.hideOnMobile && "hidden md:table-cell", c.className)}
                      >
                        {c.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
        {hydrated && filtered.length === 0 && (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <Inbox className="h-10 w-10 text-cream-300" aria-hidden />
            <p className="mt-3 font-semibold">{emptyTitle}</p>
            <p className="text-sm text-ash">{emptyBody}</p>
          </div>
        )}
      </div>

      {hydrated && filtered.length > pageSize && (
        <div className="flex items-center justify-between gap-3 border-t border-charcoal/[0.06] px-4 py-3 text-sm">
          <p className="text-ash">
            {current * pageSize + 1}–{Math.min(filtered.length, (current + 1) * pageSize)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(current - 1)}
              disabled={current === 0}
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-full hover:bg-cream disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-mono text-xs">
              {current + 1}/{pages}
            </span>
            <button
              type="button"
              onClick={() => setPage(current + 1)}
              disabled={current >= pages - 1}
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-full hover:bg-cream disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
