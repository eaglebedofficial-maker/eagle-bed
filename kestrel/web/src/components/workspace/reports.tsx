"use client";
/* Reports: generate, store, download and delete CSV / XLSX / PDF exports (/reports). */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Download, FileSpreadsheet, FileText, FileType2, Plus, Trash2, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import type { ProductBrief } from "@/components/app/product";
import { ProductPicker } from "@/components/finance/product-picker";
import { filenameFrom, Notice, RoleGate } from "@/components/finance/shared";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState, ErrorState, PageHeader } from "@/components/ui/data";
import { ConfirmDialog, Dialog, Select, Tooltip } from "@/components/ui/overlay";
import { Badge, Button, Card, Checkbox, Field, Input, SearchInput, Segmented, Skeleton } from "@/components/ui/primitives";
import { api, del, errorMessage, get, post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { ago, dateShort, download } from "@/lib/utils";

type Kind = { kind: string; label: string };
type Report = { id: number; kind: string; kind_label: string; title: string; format: "csv" | "xlsx" | "pdf"; size_bytes: number; created_at: string; params: Record<string, any> };
type SupplierRow = { id: number; name: string; country: string; status_label: string };
type KwList = { id: number; name: string; marketplace: string; count: number };

const DESCRIPTION: Record<string, string> = {
  product_research: "Products in your workspace with estimates, fees, profit and score — filtered by marketplace or search.",
  product_comparison: "Side-by-side rows for the products you choose.",
  competitor_research: "Competitor products matching your filters.",
  market_research: "Market-level product export for a marketplace or search.",
  supplier_comparison: "Supplier scores, risk, registry, MOQ, lead time and evidence.",
  supplier_verification: "Verification evidence on file for each supplier, with sources.",
  profit_calculations: "Every saved profit calculation with inputs and results.",
  price_history: "Retrieved price, rank and offer history for one product, exactly as stored.",
  keyword_research: "Keywords with search volume, difficulty and CPC.",
};
const FORMAT_ICON = { csv: FileText, xlsx: FileSpreadsheet, pdf: FileType2 } as const;
const size = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const PRODUCT_KINDS = ["product_research", "competitor_research", "market_research", "product_comparison"];
const SUPPLIER_KINDS = ["supplier_comparison", "supplier_verification"];

async function downloadReport(r: Pick<Report, "id" | "title" | "format">) {
  const res = await api<Response>(`/reports/${r.id}/download`, { raw: true });
  const blob = await res.blob();
  download(filenameFrom(res, `${r.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${r.format}`), blob);
}

export function Reports() {
  const qc = useQueryClient();
  const { can } = useSession();
  const kinds = useQuery({ queryKey: ["report-kinds"], queryFn: () => get<Kind[]>("/reports/kinds"), staleTime: Infinity });
  const list = useQuery({ queryKey: ["reports"], queryFn: () => get<Report[]>("/reports") });
  const [createOpen, setCreateOpen] = React.useState(false);
  const [preset, setPreset] = React.useState<string | null>(null);
  const [removing, setRemoving] = React.useState<Report | null>(null);
  const [busy, setBusy] = React.useState<number | null>(null);
  const [search, setSearch] = React.useState("");

  const dl = async (r: Report) => {
    setBusy(r.id);
    try { await downloadReport(r); } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(null); }
  };
  const remove = useMutation({
    mutationFn: (id: number) => del(`/reports/${id}`),
    onSuccess: () => { toast.success("Report deleted"); setRemoving(null); qc.invalidateQueries({ queryKey: ["reports"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const rows = (list.data ?? []).filter((r) => !search || `${r.title} ${r.kind_label}`.toLowerCase().includes(search.toLowerCase()));
  const cols = React.useMemo<ColumnDef<Report>[]>(() => [
    { header: "Report", accessorKey: "title", cell: ({ row: { original: r } }) => { const I = FORMAT_ICON[r.format]; return <div className="flex min-w-[240px] items-center gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted"><I className="size-4" /></div><div className="min-w-0"><div className="truncate font-medium">{r.title}</div><div className="text-2xs text-subtle">{r.kind_label}</div></div></div>; } },
    { header: "Format", accessorKey: "format", cell: ({ getValue }) => <Badge size="sm" className="uppercase">{getValue() as string}</Badge> },
    { header: "Size", accessorKey: "size_bytes", meta: { align: "right" }, cell: ({ getValue }) => <span className="text-muted">{size(getValue() as number)}</span> },
    { header: "Created", accessorKey: "created_at", cell: ({ getValue }) => <Tooltip content={dateShort(getValue() as string)}><span className="text-muted">{ago(getValue() as string)}</span></Tooltip> },
    {
      id: "actions", header: "", enableSorting: false, cell: ({ row: { original: r } }) => (
        <div className="flex justify-end gap-1">
          <Button variant="secondary" size="sm" loading={busy === r.id} onClick={() => dl(r)}><Download />Download</Button>
          {can("analyst") ? <Button variant="ghost" size="icon-sm" aria-label="Delete report" onClick={() => setRemoving(r)}><Trash2 /></Button>
            : <Tooltip content="Analyst role or higher required"><span><Button variant="ghost" size="icon-sm" aria-label="Delete report" disabled><Trash2 /></Button></span></Tooltip>}
        </div>
      ),
    },
  ], [busy, can]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Workspace" title="Reports" description="Export any module to CSV, Excel or PDF. Every file carries a provenance note, and estimates are labelled as estimates."
        actions={<RoleGate>{(ok) => <Button disabled={!ok} onClick={() => { setPreset(null); setCreateOpen(true); }}><Plus />New report</Button>}</RoleGate>} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {kinds.isLoading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[92px]" />) : kinds.error ? <Card className="sm:col-span-2 xl:col-span-3"><ErrorState error={kinds.error} onRetry={() => kinds.refetch()} /></Card> : (kinds.data ?? []).map((k) => (
          <RoleGate key={k.kind}>{(ok) => (
            <button type="button" disabled={!ok} onClick={() => { setPreset(k.kind); setCreateOpen(true); }}
              className="flex w-full items-start gap-3 rounded-xl border border-line bg-surface p-4 text-left shadow-card transition-colors hover:border-line-strong disabled:opacity-60">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><BarChart3 className="size-4" /></div>
              <div className="min-w-0"><div className="text-[13px] font-semibold">{k.label}</div><div className="mt-0.5 line-clamp-2 text-xs text-muted">{DESCRIPTION[k.kind] ?? "Export from Kestrel."}</div></div>
            </button>
          )}</RoleGate>
        ))}
      </div>

      {list.error ? <Card><ErrorState error={list.error} onRetry={() => list.refetch()} /></Card> : (
        <DataTable columns={cols} data={rows} loading={list.isLoading} getRowId={(r) => String(r.id)}
          toolbar={<><span className="text-sm font-semibold">Generated reports</span><SearchInput value={search} onChange={setSearch} placeholder="Search reports" className="ml-auto w-full sm:w-60" /></>}
          empty={(list.data ?? []).length === 0 ? <EmptyState icon={BarChart3} title="No reports yet" description="Pick a report type above. Files are stored here so your team can download them again."
            action={can("analyst") ? <Button onClick={() => { setPreset(null); setCreateOpen(true); }}><Plus />New report</Button> : undefined} />
            : <EmptyState compact title="No reports match" action={<Button variant="secondary" onClick={() => setSearch("")}>Clear search</Button>} />} />
      )}

      {createOpen && <CreateReport open={createOpen} onOpenChange={setCreateOpen} kinds={kinds.data ?? []} preset={preset} />}
      <ConfirmDialog open={!!removing} onOpenChange={(v) => !v && setRemoving(null)} title="Delete report?" description={<>Delete <b>{removing?.title}</b> and its stored file? This can't be undone.</>}
        confirmLabel="Delete" loading={remove.isPending} onConfirm={() => removing && remove.mutate(removing.id)} />
    </div>
  );
}

function CreateReport({ open, onOpenChange, kinds, preset }: { open: boolean; onOpenChange: (v: boolean) => void; kinds: Kind[]; preset: string | null }) {
  const qc = useQueryClient();
  const { marketplace, marketplaces } = useSession();
  const [kind, setKind] = React.useState(preset ?? kinds[0]?.kind ?? "product_research");
  const [format, setFormat] = React.useState<"xlsx" | "csv" | "pdf">("xlsx");
  const [title, setTitle] = React.useState("");
  const [mk, setMk] = React.useState(marketplace);
  const [q, setQ] = React.useState("");
  const [tracked, setTracked] = React.useState(false);
  const [products, setProducts] = React.useState<ProductBrief[]>([]);
  const [pickOpen, setPickOpen] = React.useState(false);
  const [supplierIds, setSupplierIds] = React.useState<number[]>([]);
  const [supSearch, setSupSearch] = React.useState("");
  const [listId, setListId] = React.useState("");

  const isProduct = PRODUCT_KINDS.includes(kind), isSupplier = SUPPLIER_KINDS.includes(kind);
  const suppliers = useQuery({ queryKey: ["suppliers", "report-picker"], queryFn: () => get<{ items: SupplierRow[] }>("/suppliers", { page_size: 200, sort: "name" }), enabled: open && isSupplier });
  const lists = useQuery({ queryKey: ["keyword-lists"], queryFn: () => get<KwList[]>("/keywords/lists"), enabled: open && kind === "keyword_research" });

  const params = (): Record<string, unknown> => {
    if (isProduct) return products.length ? { ids: products.map((p) => p.id) } : { filters: { marketplace: mk, q: q.trim() || undefined, tracked: tracked || undefined } };
    if (isSupplier) return supplierIds.length ? { ids: supplierIds } : {};
    if (kind === "price_history") return { product_id: products[0]?.id };
    if (kind === "keyword_research") return listId ? { list_id: Number(listId) } : { marketplace: mk };
    return {};
  };
  const invalid = kind === "price_history" && !products.length ? "Choose a product" : kind === "product_comparison" && products.length < 2 ? "Choose at least two products" : null;
  const create = useMutation({
    mutationFn: () => post<{ id: number; rows: number }>("/reports", { kind, format, title: title.trim(), params: params() }),
    onSuccess: (r) => {
      const label = title.trim() || kinds.find((k) => k.kind === kind)?.label || "Report";
      toast.success(`${label} ready`, { description: `${r.rows.toLocaleString()} rows`, action: { label: "Download", onClick: () => downloadReport({ id: r.id, title: label, format }).catch((e) => toast.error(errorMessage(e))) } });
      qc.invalidateQueries({ queryKey: ["reports"] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const singleProduct = kind === "price_history";
  const supRows = (suppliers.data?.items ?? []).filter((s) => !supSearch || s.name.toLowerCase().includes(supSearch.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="lg" title="New report" description={DESCRIPTION[kind]}
      footer={<><span className="mr-auto text-xs text-danger">{invalid}</span><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button loading={create.isPending} disabled={!!invalid} onClick={() => create.mutate()}>Generate</Button></>}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Report type"><Select value={kind} onChange={(v) => { setKind(v); setProducts([]); }} options={kinds.map((k) => ({ value: k.kind, label: k.label }))} aria-label="Report type" /></Field>
          <Field label="Format"><Segmented value={format} onChange={setFormat} options={[{ value: "xlsx", label: "Excel" }, { value: "csv", label: "CSV" }, { value: "pdf", label: "PDF" }]} /></Field>
        </div>
        <Field label="Title" hint="Optional — defaults to the report type."><Input value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} placeholder={kinds.find((k) => k.kind === kind)?.label} /></Field>

        {(isProduct || singleProduct) && (
          <div className="space-y-3 rounded-lg border border-line p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[13px] font-medium">{singleProduct ? "Product" : "Products"}</div>
              <Button variant="secondary" size="sm" onClick={() => setPickOpen(true)}><Plus />{singleProduct && products.length ? "Change product" : "Choose product"}</Button>
            </div>
            {products.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">{products.map((p) => <Badge key={p.id} className="max-w-full"><span className="truncate">{p.asin} · {p.title.slice(0, 40)}</span><button aria-label="Remove" onClick={() => setProducts(products.filter((x) => x.id !== p.id))}><X className="size-3" /></button></Badge>)}</div>
            ) : isProduct && kind !== "product_comparison" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Marketplace"><Select value={mk} onChange={setMk} options={marketplaces.map((m) => ({ value: m.code, label: m.name }))} aria-label="Marketplace" /></Field>
                <Field label="Search filter"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, ASIN or brand (optional)" /></Field>
                <Checkbox className="sm:col-span-2" checked={tracked} onCheckedChange={setTracked} label="Tracked products only" />
              </div>
            ) : <p className="text-xs text-subtle">{singleProduct ? "Choose the product whose retrieved history to export." : "Add the products to compare."}</p>}
          </div>
        )}

        {isSupplier && (
          <div className="space-y-3 rounded-lg border border-line p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><div className="text-[13px] font-medium">Suppliers</div><span className="text-xs text-muted">{supplierIds.length ? `${supplierIds.length} selected` : "All suppliers"}</span></div>
            <SearchInput value={supSearch} onChange={setSupSearch} placeholder="Filter suppliers" />
            {suppliers.isLoading ? <Skeleton className="h-28 w-full" /> : suppliers.error ? <ErrorState error={suppliers.error} onRetry={() => suppliers.refetch()} /> : !supRows.length ? (
              <p className="py-3 text-center text-xs text-subtle">{suppliers.data?.items.length ? "No suppliers match." : "No suppliers in your workspace yet — the report will be empty."}</p>
            ) : (
              <div className="max-h-56 space-y-0.5 overflow-y-auto">
                {supRows.map((s) => <Checkbox key={s.id} className="rounded-md px-1.5 py-1.5 hover:bg-surface-2" checked={supplierIds.includes(s.id)}
                  onCheckedChange={(v) => setSupplierIds(v ? [...supplierIds, s.id] : supplierIds.filter((x) => x !== s.id))} label={<span>{s.name} <span className="text-xs text-subtle">· {s.country} · {s.status_label}</span></span>} />)}
              </div>
            )}
          </div>
        )}

        {kind === "keyword_research" && (
          <div className="grid gap-3 rounded-lg border border-line p-4 sm:grid-cols-2">
            <Field label="Keyword list" hint="Blank exports the top keywords for the marketplace.">
              {lists.isLoading ? <Skeleton className="h-9 w-full" /> : <Select value={listId || "all"} onChange={(v) => setListId(v === "all" ? "" : v)} options={[{ value: "all", label: "All keywords (by marketplace)" }, ...(lists.data ?? []).map((l) => ({ value: String(l.id), label: `${l.name} (${l.count})` }))]} aria-label="Keyword list" />}
            </Field>
            {!listId && <Field label="Marketplace"><Select value={mk} onChange={setMk} options={marketplaces.map((m) => ({ value: m.code, label: m.name }))} aria-label="Marketplace" /></Field>}
          </div>
        )}

        <Notice>Estimated values (sales, revenue, profit, scores) are labelled as estimates in the file, and each row lists its data source.</Notice>
      </div>
      <ProductPicker open={pickOpen} onOpenChange={setPickOpen} allMarketplaces title={singleProduct ? "Choose a product" : "Add a product"}
        onPick={(p) => setProducts(singleProduct ? [p] : products.some((x) => x.id === p.id) ? products : [...products, p])} />
    </Dialog>
  );
}
