"use client";
import {
  type ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, type RowSelectionState, type SortingState, useReactTable, type VisibilityState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, Columns3 } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { EmptyState, LoadingRows } from "./data";
import { Popover } from "./overlay";
import { Button, Checkbox } from "./primitives";

export type { ColumnDef };

type ServerPaging = { page: number; pageSize: number; total: number; onPage: (p: number) => void; onPageSize?: (n: number) => void };
type ServerSort = { sort: SortingState; onSort: (s: SortingState) => void };

export function DataTable<T>({
  columns, data, loading, empty, getRowId, onRowClick, selectable, onSelectionChange, paging, serverSort, storageKey, toolbar, dense, className, maxHeight,
}: {
  columns: ColumnDef<T, any>[]; data: T[]; loading?: boolean; empty?: React.ReactNode; getRowId?: (r: T) => string; onRowClick?: (r: T) => void;
  selectable?: boolean; onSelectionChange?: (rows: T[]) => void; paging?: ServerPaging; serverSort?: ServerSort; storageKey?: string;
  toolbar?: React.ReactNode; dense?: boolean; className?: string; maxHeight?: string;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selection, setSelection] = React.useState<RowSelectionState>({});
  const [visibility, setVisibility] = React.useState<VisibilityState>(() => {
    if (!storageKey || typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem(`cols:${storageKey}`) || "{}"); } catch { return {}; }
  });
  React.useEffect(() => { if (storageKey) try { localStorage.setItem(`cols:${storageKey}`, JSON.stringify(visibility)); } catch { /* ignore */ } }, [visibility, storageKey]);

  const allColumns = React.useMemo<ColumnDef<T, any>[]>(() => !selectable ? columns : [{
    id: "_select", enableSorting: false, enableHiding: false, size: 36,
    header: ({ table }) => <Checkbox aria-label="Select all" checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected()} onCheckedChange={(v) => table.toggleAllPageRowsSelected(v)} />,
    cell: ({ row }) => <span onClick={(e) => e.stopPropagation()}><Checkbox aria-label="Select row" checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(v)} /></span>,
  }, ...columns], [columns, selectable]);

  const table = useReactTable({
    data, columns: allColumns, getRowId,
    state: { sorting: serverSort ? serverSort.sort : sorting, rowSelection: selection, columnVisibility: visibility },
    onSortingChange: (u) => { const next = typeof u === "function" ? u(serverSort ? serverSort.sort : sorting) : u; serverSort ? serverSort.onSort(next) : setSorting(next); },
    onRowSelectionChange: setSelection, onColumnVisibilityChange: setVisibility,
    manualSorting: !!serverSort, getCoreRowModel: getCoreRowModel(), getSortedRowModel: serverSort ? undefined : getSortedRowModel(),
    enableRowSelection: !!selectable, sortDescFirst: true,
  });
  React.useEffect(() => { onSelectionChange?.(table.getSelectedRowModel().rows.map((r) => r.original)); /* eslint-disable-next-line */ }, [selection]);
  React.useEffect(() => { setSelection({}); }, [data]);

  const hideable = table.getAllLeafColumns().filter((c) => c.getCanHide() && typeof c.columnDef.header === "string");
  const pageCount = paging ? Math.max(1, Math.ceil(paging.total / paging.pageSize)) : 1;
  const selectedCount = Object.keys(selection).length;

  return (
    <div className={cn("overflow-hidden rounded-xl border border-line bg-surface shadow-card", className)}>
      {(toolbar || hideable.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2.5">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{toolbar}{selectedCount > 0 && <span className="text-xs text-muted num">{selectedCount} selected</span>}</div>
          {hideable.length > 0 && (
            <Popover trigger={<Button variant="ghost" size="sm"><Columns3 />Columns</Button>} className="w-56 p-2">
              <div className="px-1.5 pb-1.5 text-2xs font-semibold uppercase tracking-wider text-subtle">Show columns</div>
              <div className="max-h-72 space-y-0.5 overflow-y-auto">
                {hideable.map((c) => <Checkbox key={c.id} className="rounded-md px-1.5 py-1.5 hover:bg-surface-2" checked={c.getIsVisible()} onCheckedChange={(v) => c.toggleVisibility(v)} label={c.columnDef.header as string} />)}
              </div>
            </Popover>
          )}
        </div>
      )}
      <div className="overflow-auto" style={{ maxHeight }}>
        <table className="w-full border-separate border-spacing-0 text-[13px]">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const can = h.column.getCanSort(), dir = h.column.getIsSorted();
                  const right = (h.column.columnDef.meta as any)?.align === "right";
                  return (
                    <th key={h.id} style={{ width: h.getSize() !== 150 ? h.getSize() : undefined }}
                      className={cn("sticky top-0 z-10 whitespace-nowrap border-b border-line bg-surface-2/95 px-3 text-2xs font-semibold uppercase tracking-[0.06em] text-subtle backdrop-blur", dense ? "h-8" : "h-9", right ? "text-right" : "text-left")}>
                      {h.isPlaceholder ? null : can ? (
                        <button onClick={h.column.getToggleSortingHandler()} className={cn("inline-flex items-center gap-1 hover:text-fg", right && "flex-row-reverse", dir && "text-fg")}>
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {dir === "asc" ? <ArrowUp className="size-3" /> : dir === "desc" ? <ArrowDown className="size-3" /> : <ChevronsUpDown className="size-3 opacity-40" />}
                        </button>
                      ) : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {!loading && table.getRowModel().rows.map((row) => (
              <tr key={row.id} onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={cn("group transition-colors", onRowClick && "cursor-pointer", row.getIsSelected() ? "bg-primary-soft/40" : "hover:bg-surface-2/70")}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={cn("border-b border-line px-3 align-middle", dense ? "h-10" : "h-[52px]", (cell.column.columnDef.meta as any)?.align === "right" && "text-right num")}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <LoadingRows rows={8} />}
        {!loading && data.length === 0 && (empty ?? <EmptyState compact title="Nothing here yet" />)}
      </div>
      {paging && paging.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-3 py-2.5 text-xs text-muted">
          <span className="num">{((paging.page - 1) * paging.pageSize + 1).toLocaleString()}–{Math.min(paging.page * paging.pageSize, paging.total).toLocaleString()} of {paging.total.toLocaleString()}</span>
          <div className="flex items-center gap-2">
            {paging.onPageSize && (
              <select aria-label="Rows per page" value={paging.pageSize} onChange={(e) => paging.onPageSize!(Number(e.target.value))} className="h-8 rounded-lg border border-line bg-surface px-2 text-xs text-fg">
                {[25, 50, 100, 200].map((n) => <option key={n} value={n}>{n} / page</option>)}
              </select>
            )}
            <Button variant="secondary" size="icon-sm" aria-label="Previous page" disabled={paging.page <= 1} onClick={() => paging.onPage(paging.page - 1)}><ChevronLeft /></Button>
            <span className="num">Page {paging.page} of {pageCount}</span>
            <Button variant="secondary" size="icon-sm" aria-label="Next page" disabled={paging.page >= pageCount} onClick={() => paging.onPage(paging.page + 1)}><ChevronRight /></Button>
          </div>
        </div>
      )}
    </div>
  );
}
