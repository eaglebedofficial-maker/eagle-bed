"use client";
/* Product tables with filters, sorting, server paging, column visibility, bulk actions and exports.
   Used by Product Research (search results + workspace) and the Product Database. */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";
import { Activity, Download, FileSpreadsheet, GitCompareArrows, PackageSearch, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { productColumns, useTrack, type ProductBrief } from "@/components/app/product";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState, ErrorState, SourceBadge, Stat } from "@/components/ui/data";
import { ConfirmDialog, Menu, Tooltip } from "@/components/ui/overlay";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { api, del, errorMessage, post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { ago, download, money, num, pct } from "@/lib/utils";
import { ActiveFilters, FilterButton, FilterSheet, SavedFiltersMenu, SERVER_ONLY, clean, matchesClient } from "./filters";
import type { Filters, QueryResponse } from "./types";

/** Stable empty array: DataTable resets its selection whenever `data` changes identity. */
export const NO_ROWS: never[] = [];
const SERVER_SORTABLE = new Set(["score", "price", "units", "revenue", "bsr", "reviews", "rating", "profit", "roi", "margin", "offers", "title", "updated"]);

/** Full column set: the shared product columns plus the extra metrics researchers ask for. */
export function researchColumns(server: boolean): ColumnDef<ProductBrief, any>[] {
  const base = productColumns();
  const extra: ColumnDef<ProductBrief, any>[] = [
    { id: "offers", header: "Offers", accessorKey: "offers", meta: { align: "right" }, cell: ({ getValue }) => num(getValue()) },
    { id: "margin", header: "Margin", accessorKey: "margin", meta: { align: "right" }, cell: ({ getValue }) => pct(getValue()) },
    { id: "fba_fee", header: "FBA fee", accessorKey: "fba_fee", meta: { align: "right" }, cell: ({ row: { original: p } }) => money(p.fba_fee, p.currency) },
    { id: "size_tier", header: "Size tier", accessorKey: "size_tier", cell: ({ getValue }) => <span className="block max-w-[140px] truncate text-muted">{getValue() || "—"}</span> },
    { id: "fulfilment", header: "Fulfilment", accessorKey: "fulfilment", cell: ({ row: { original: p } }) => p.fulfilment ? <Badge size="sm">{p.fulfilment === "AMZ" ? "Amazon" : p.fulfilment}</Badge> : <span className="text-subtle">—</span> },
    { id: "amazon_sells", header: "Amazon sells", accessorKey: "amazon_sells", cell: ({ getValue }) => getValue() == null ? <span className="text-subtle">—</span> : getValue() ? <Badge tone="warning" size="sm">Yes</Badge> : <span className="text-muted">No</span> },
    { id: "updated", header: "Updated", accessorKey: "last_refreshed_at", cell: ({ getValue }) => <span className="whitespace-nowrap text-muted">{ago(getValue())}</span> },
  ];
  const sourceIdx = base.findIndex((c) => c.id === "source");
  const all = [...base.slice(0, sourceIdx), ...extra, ...base.slice(sourceIdx)];
  return all.map((c) => ({ ...c, enableSorting: !server || SERVER_SORTABLE.has(String(c.id)) }));
}

const CSV_COLS: [string, keyof ProductBrief][] = [["ASIN", "asin"], ["Marketplace", "marketplace"], ["Title", "title"], ["Brand", "brand"], ["Category", "category"], ["Price", "price"], ["Currency", "currency"],
  ["Est. monthly units", "units"], ["Units low", "units_low"], ["Units high", "units_high"], ["Est. monthly revenue", "revenue"], ["BSR", "bsr"], ["Reviews", "reviews"], ["Rating", "rating"],
  ["Offers", "offers"], ["FBA fee", "fba_fee"], ["Size tier", "size_tier"], ["Est. profit/unit", "profit"], ["Margin %", "margin"], ["ROI %", "roi"], ["Unit cost assumed", "cost_assumed"],
  ["Competition", "competition"], ["Opportunity score", "score"], ["Data source", "source"], ["Last refreshed", "last_refreshed_at"]];

/** Export the rows in hand (e.g. a selection) with the same columns and provenance note as the server export. */
export function exportRowsCsv(rows: ProductBrief[], name = "products-selection") {
  const esc = (v: unknown) => { const s = v == null ? "" : typeof v === "boolean" ? (v ? "yes" : "no") : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const lines = [CSV_COLS.map((c) => c[0]).join(","), ...rows.map((r) => CSV_COLS.map(([, k]) => esc(r[k])).join(",")), "",
    "# Sales, revenue, profit and score are estimates. Profit uses your unit cost where entered, otherwise an assumed 25% of price (flagged).",
    `# Exported ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC from Kestrel`];
  download(`${name}-${new Date().toISOString().slice(0, 10)}.csv`, new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" }));
}

export async function exportFiltered(filters: Filters, format: "csv" | "xlsx") {
  const r = await api<Response>("/products/export", { params: { format, filters: JSON.stringify(clean(filters)) }, raw: true });
  const blob = await r.blob();
  const cd = r.headers.get("content-disposition") || "";
  const m = /filename="([^"]+)"/.exec(cd);
  download(m?.[1] || `product-research.${format}`, blob);
}

export function ExportMenu({ filters, label = "Export" }: { filters: Filters; label?: string }) {
  const [busy, setBusy] = React.useState(false);
  const run = async (format: "csv" | "xlsx") => {
    setBusy(true);
    try { await exportFiltered(filters, format); toast.success("Export downloaded"); } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
  };
  return (
    <Menu label="All matching products (max 10,000)" trigger={<Button variant="secondary" size="sm" loading={busy}><Download />{label}</Button>}
      items={[{ label: "CSV", icon: <Download />, onSelect: () => run("csv") }, { label: "Excel (.xlsx)", icon: <FileSpreadsheet />, onSelect: () => run("xlsx") }]} />
  );
}

/* ---------------------------------------------------------------- bulk actions */
export function BulkActions({ rows, allowDelete, onDeleted }: { rows: ProductBrief[]; allowDelete?: boolean; onDeleted?: () => void }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { can } = useSession();
  const track = useTrack();
  const [confirm, setConfirm] = React.useState(false);
  const remove = useMutation({
    mutationFn: async () => { for (const r of rows) await del(`/products/${r.id}`); },
    onSuccess: () => { toast.success(`Deleted ${rows.length} product${rows.length === 1 ? "" : "s"}`); setConfirm(false); qc.invalidateQueries({ queryKey: ["products"] }); onDeleted?.(); },
    onError: (e) => { toast.error(errorMessage(e)); qc.invalidateQueries({ queryKey: ["products"] }); },
  });
  if (!rows.length) return null;
  const analyst = can("analyst");
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-primary-soft/50 px-2 py-1">
      <span className="px-1 text-xs font-medium text-primary num">{rows.length} selected</span>
      <Tooltip content={!analyst ? "Viewers can't track products" : undefined}><span><Button size="xs" variant="ghost" disabled={!analyst} loading={track.isPending} onClick={() => track.mutate(rows.map((r) => r.id))}><Activity />Track</Button></span></Tooltip>
      <Tooltip content={rows.length > 10 ? "Compare up to 10 products at a time" : rows.length < 2 ? "Select at least two products" : undefined}>
        <span><Button size="xs" variant="ghost" disabled={rows.length > 10 || rows.length < 2} onClick={() => router.push(`/compare?ids=${rows.map((r) => r.id).join(",")}`)}><GitCompareArrows />Compare</Button></span>
      </Tooltip>
      <Button size="xs" variant="ghost" onClick={() => exportRowsCsv(rows)}><Download />Export CSV</Button>
      {allowDelete && (
        <Tooltip content={!analyst ? "Viewers can't delete products" : undefined}><span><Button size="xs" variant="ghost" className="text-danger" disabled={!analyst} onClick={() => setConfirm(true)}><Trash2 />Delete</Button></span></Tooltip>
      )}
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} title={`Delete ${rows.length} product${rows.length === 1 ? "" : "s"}?`} confirmLabel="Delete" loading={remove.isPending} onConfirm={() => remove.mutate()}
        description="This removes the products, their history, snapshots and tracking from your workspace. You can research or import them again later." />
    </div>
  );
}

/* ---------------------------------------------------------------- server-paged explorer */
const toSort = (s: SortingState) => ({ sort: s[0]?.id ?? "score", dir: s[0] ? (s[0].desc ? "desc" : "asc") : "desc" });

export function ProductExplorer({ storageKey, filters, onFilters, empty, toolbarExtra, allowDelete, title }: {
  storageKey: string; filters: Filters; onFilters: (f: Filters) => void; empty?: React.ReactNode; toolbarExtra?: React.ReactNode; allowDelete?: boolean; title?: React.ReactNode;
}) {
  const router = useRouter();
  const { marketplace, currency } = useSession();
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "score", desc: true }]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(50);
  const [sheet, setSheet] = React.useState(false);
  const [selected, setSelected] = React.useState<ProductBrief[]>([]);
  const full = React.useMemo(() => ({ ...clean(filters), marketplace }), [filters, marketplace]);
  React.useEffect(() => setPage(1), [full, pageSize]);
  const { sort, dir } = toSort(sorting);
  const q = useQuery({
    queryKey: ["products", marketplace, full, sort, dir, page, pageSize],
    queryFn: () => post<QueryResponse>("/products/query", { filters: full, sort, dir, page, page_size: pageSize }),
    placeholderData: keepPreviousData,
  });
  const columns = React.useMemo(() => researchColumns(true), []);
  const s = q.data?.summary;
  const hasFilters = Object.keys(clean(filters)).length > 0;

  if (q.error && !q.data) return <Card><ErrorState error={q.error} onRetry={() => q.refetch()} /></Card>;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-card sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Matching products" value={q.data ? num(s?.count) : "…"} />
        <Stat label="Avg opportunity score" value={q.data ? (s?.avg_score ?? "—") : "…"} />
        <Stat label={<span className="inline-flex items-center gap-1.5">Est. monthly revenue <SourceBadge classification="estimated" /></span>} value={q.data ? money(s?.total_revenue, currency, { compact: true }) : "…"} />
        <Stat label="Avg price" value={q.data ? money(s?.avg_price, currency) : "…"} />
        <Stat label="Avg reviews" value={q.data ? num(s?.avg_reviews) : "…"} />
      </div>
      <ActiveFilters filters={filters} onChange={onFilters} />
      <DataTable<ProductBrief>
        storageKey={storageKey} columns={columns} data={q.data?.items ?? NO_ROWS} loading={q.isLoading} selectable onSelectionChange={setSelected}
        getRowId={(p) => String(p.id)} onRowClick={(p) => router.push(`/products/${p.id}`)}
        serverSort={{ sort: sorting, onSort: (s) => setSorting(s.length ? s : [{ id: "score", desc: true }]) }}
        paging={{ page, pageSize, total: q.data?.total ?? 0, onPage: setPage, onPageSize: setPageSize }}
        toolbar={<>
          {title}
          <FilterButton filters={filters} onClick={() => setSheet(true)} />
          <SavedFiltersMenu filters={filters} onLoad={(f, name) => { onFilters(f); toast.success(`Loaded “${name}”`); }} />
          <ExportMenu filters={full} />
          {toolbarExtra}
          <BulkActions rows={selected} allowDelete={allowDelete} />
          {q.isFetching && !q.isLoading && <span className="text-2xs text-subtle">Updating…</span>}
        </>}
        empty={hasFilters
          ? <EmptyState compact icon={PackageSearch} title="No products match these filters" description="Loosen a range or remove a filter chip above." action={<Button variant="secondary" onClick={() => onFilters({})}>Clear filters</Button>} />
          : empty ?? <EmptyState compact icon={PackageSearch} title="No products yet" description="Research products or import a CSV to fill your database." />}
      />
      <FilterSheet open={sheet} onOpenChange={setSheet} filters={filters} onApply={onFilters} />
    </div>
  );
}

/* ---------------------------------------------------------------- in-memory results (research) */
export function ClientProductTable({ items, storageKey, toolbarExtra, empty }: { items: ProductBrief[]; storageKey: string; toolbarExtra?: React.ReactNode; empty?: React.ReactNode }) {
  const router = useRouter();
  const [filters, setFilters] = React.useState<Filters>({});
  const [sheet, setSheet] = React.useState(false);
  const [selected, setSelected] = React.useState<ProductBrief[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(50);
  const filtered = React.useMemo(() => items.filter((p) => matchesClient(p, filters)), [items, filters]);
  React.useEffect(() => setPage(1), [filtered, pageSize]);
  const pageRows = React.useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);
  const columns = React.useMemo(() => researchColumns(false), []);
  const hidden = items.length - filtered.length;
  return (
    <div className="space-y-3">
      <ActiveFilters filters={filters} onChange={setFilters} />
      <DataTable<ProductBrief>
        storageKey={storageKey} columns={columns} data={pageRows} selectable onSelectionChange={setSelected}
        getRowId={(p) => String(p.id)} onRowClick={(p) => router.push(`/products/${p.id}`)}
        paging={{ page, pageSize, total: filtered.length, onPage: setPage, onPageSize: setPageSize }}
        toolbar={<>
          <FilterButton filters={filters} onClick={() => setSheet(true)} />
          <SavedFiltersMenu filters={filters} onLoad={(f, name) => { setFilters(f); toast.success(`Loaded “${name}”`); }} />
          {toolbarExtra}
          <BulkActions rows={selected} />
          {hidden > 0 && <span className="text-2xs text-subtle num">{hidden} hidden by filters</span>}
        </>}
        empty={items.length && !filtered.length
          ? <EmptyState compact icon={Star} title="No results match these filters" action={<Button variant="secondary" onClick={() => setFilters({})}>Clear filters</Button>} />
          : empty}
      />
      <FilterSheet open={sheet} onOpenChange={setSheet} filters={filters} onApply={setFilters} unsupported={SERVER_ONLY} />
    </div>
  );
}

