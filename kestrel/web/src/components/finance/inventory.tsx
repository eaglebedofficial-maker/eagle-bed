"use client";
/* Inventory Manager: stock on hand, days of cover, reorder points and restock suggestions (/inventory). */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Boxes, CalendarClock, Coins, PackagePlus, Pencil, ShoppingCart, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { TrendArea } from "@/components/ui/charts";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState, ErrorState, KeyValue, MetricCard, PageHeader, SourceBadge } from "@/components/ui/data";
import { ConfirmDialog, Dialog, InfoTip, Sheet, Tooltip } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Field, Input, SearchInput, Segmented } from "@/components/ui/primitives";
import { del, errorMessage, get, post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { currencySymbol, dateShort, money, num } from "@/lib/utils";
import { classifyOpsSource, FilePick, Notice, NumInput, postForm, RoleGate, SOURCE_LABEL, SyncButton, toNum } from "./shared";

type Item = {
  id: number; sku: string; title: string; asin: string; on_hand: number; inbound: number; reserved: number; unit_cost: number | null; value: number | null;
  lead_time_days: number; safety_days: number; daily_velocity: number; days_of_cover: number | null; reorder_point: number; reorder_now: boolean;
  suggested_order_qty: number; stockout_risk: "none" | "low" | "medium" | "high"; projected_stockout: string | null; forecast_90d: { day: number; units: number }[]; source: string;
};
type Resp = { items: Item[]; summary: { skus: number; units: number; value: number; reorder_now: number; high_risk: number }; velocity_basis: string };

const RISK: Record<Item["stockout_risk"], { label: string; tone: "danger" | "warning" | "neutral" | "primary" }> = {
  high: { label: "High", tone: "danger" }, medium: { label: "Medium", tone: "warning" }, low: { label: "Low", tone: "primary" }, none: { label: "No recent sales", tone: "neutral" },
};
type EditForm = { sku: string; title: string; asin: string; on_hand: string; inbound: string; reserved: string; unit_cost: string; lead_time_days: string; safety_days: string };
const emptyEdit: EditForm = { sku: "", title: "", asin: "", on_hand: "0", inbound: "0", reserved: "0", unit_cost: "", lead_time_days: "30", safety_days: "14" };

export function InventoryManager() {
  const qc = useQueryClient();
  const { currency, marketplace, can } = useSession();
  const q = useQuery({ queryKey: ["inventory"], queryFn: () => get<Resp>("/inventory") });
  const [filter, setFilter] = React.useState<"all" | "reorder" | "risk">("all");
  const [search, setSearch] = React.useState("");
  const [detail, setDetail] = React.useState<Item | null>(null);
  const [edit, setEdit] = React.useState<{ mode: "new" | "edit"; f: EditForm } | null>(null);
  const [removing, setRemoving] = React.useState<Item | null>(null);
  const [importOpen, setImportOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);

  const inval = () => qc.invalidateQueries({ queryKey: ["inventory"] });
  const save = useMutation({
    mutationFn: (f: EditForm) => post<Item>("/inventory", {
      sku: f.sku.trim(), title: f.title.trim(), asin: f.asin.trim().toUpperCase(), on_hand: Math.round(toNum(f.on_hand) ?? 0), inbound: Math.round(toNum(f.inbound) ?? 0),
      reserved: Math.round(toNum(f.reserved) ?? 0), unit_cost: toNum(f.unit_cost) ?? null, lead_time_days: Math.round(toNum(f.lead_time_days) ?? 30), safety_days: Math.round(toNum(f.safety_days) ?? 14),
    }),
    onSuccess: (it) => { toast.success(`${it.sku} saved`); setEdit(null); setDetail((d) => (d && d.id === it.id ? it : d)); inval(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: (id: number) => del(`/inventory/${id}`),
    onSuccess: () => { toast.success("SKU removed"); setRemoving(null); setDetail(null); inval(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const imp = useMutation({
    mutationFn: () => { const fd = new FormData(); fd.append("file", file!); return postForm<{ imported: number }>("/inventory/import", fd); },
    onSuccess: (r) => { toast.success(`Imported ${num(r.imported)} SKU${r.imported === 1 ? "" : "s"}`); setImportOpen(false); setFile(null); inval(); },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const d = q.data;
  const items = (d?.items ?? []).filter((i) => (filter === "reorder" ? i.reorder_now : filter === "risk" ? i.stockout_risk === "high" || i.stockout_risk === "medium" : true))
    .filter((i) => !search || `${i.sku} ${i.title} ${i.asin}`.toLowerCase().includes(search.toLowerCase()));
  const restock = (d?.items ?? []).filter((i) => i.reorder_now && i.suggested_order_qty > 0).sort((a, b) => (a.days_of_cover ?? 1e9) - (b.days_of_cover ?? 1e9));
  const openEdit = (i?: Item) => setEdit(i ? { mode: "edit", f: { sku: i.sku, title: i.title, asin: i.asin, on_hand: String(i.on_hand), inbound: String(i.inbound), reserved: String(i.reserved), unit_cost: i.unit_cost != null ? String(i.unit_cost) : "", lead_time_days: String(i.lead_time_days), safety_days: String(i.safety_days) } } : { mode: "new", f: emptyEdit });

  const cols = React.useMemo<ColumnDef<Item>[]>(() => [
    { header: "SKU", accessorKey: "sku", cell: ({ row: { original: i } }) => <div className="min-w-[200px] max-w-[320px]"><div className="truncate font-medium">{i.title || i.sku}</div><div className="flex items-center gap-1.5 text-2xs text-subtle"><span className="font-mono">{i.sku}</span>{i.asin && <><span>·</span><span className="font-mono">{i.asin}</span></>}</div></div> },
    { header: "On hand", accessorKey: "on_hand", meta: { align: "right" }, cell: ({ getValue }) => num(getValue() as number) },
    { header: "Inbound", accessorKey: "inbound", meta: { align: "right" }, cell: ({ getValue }) => <span className="text-muted">{num(getValue() as number)}</span> },
    { header: "Units / day", accessorKey: "daily_velocity", meta: { align: "right" }, cell: ({ getValue }) => num(getValue() as number, { decimals: 1 }) },
    { header: "Days of cover", accessorKey: "days_of_cover", meta: { align: "right" }, sortingFn: (a, b) => (a.original.days_of_cover ?? 1e9) - (b.original.days_of_cover ?? 1e9), cell: ({ row: { original: i } }) => i.days_of_cover == null ? <span className="text-subtle">—</span> : <span className={i.days_of_cover < i.lead_time_days ? "font-medium text-danger" : i.days_of_cover < i.lead_time_days + i.safety_days ? "text-warning" : ""}>{num(i.days_of_cover, { decimals: 0 })}</span> },
    { header: "Reorder point", accessorKey: "reorder_point", meta: { align: "right" }, cell: ({ getValue }) => num(getValue() as number) },
    { header: "Suggested order", accessorKey: "suggested_order_qty", meta: { align: "right" }, cell: ({ row: { original: i } }) => i.suggested_order_qty ? <span className="font-medium">{num(i.suggested_order_qty)}</span> : <span className="text-subtle">—</span> },
    { header: "Stockout risk", accessorKey: "stockout_risk", cell: ({ row: { original: i } }) => <Badge tone={RISK[i.stockout_risk].tone} size="sm" dot>{RISK[i.stockout_risk].label}</Badge> },
    { header: "Projected stockout", accessorKey: "projected_stockout", cell: ({ getValue }) => <span className="text-muted">{getValue() ? dateShort(getValue() as string) : "—"}</span> },
    { header: "Value", accessorKey: "value", meta: { align: "right" }, cell: ({ getValue }) => money(getValue() as number | null, currency, { compact: true }) },
    { header: "Source", accessorKey: "source", cell: ({ row: { original: i } }) => <Tooltip content={SOURCE_LABEL[i.source] ?? i.source}><span><SourceBadge classification={classifyOpsSource(i.source)} /></span></Tooltip> },
  ], [currency]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Financial tools" title="Inventory Manager"
        description="Days of cover, reorder points and restock quantities from your stock levels and the last 30 days of your own sales."
        actions={<>
          <RoleGate>{(ok) => <Button variant="secondary" disabled={!ok} onClick={() => setImportOpen(true)}><Upload />Import CSV</Button>}</RoleGate>
          <SyncButton path="/inventory/sync" params={{ marketplace }} invalidate={[["inventory"]]} onDone={(r) => `Synced ${num(r.synced)} SKUs from SP-API`} />
          <RoleGate>{(ok) => <Button disabled={!ok} onClick={() => openEdit()}><PackagePlus />Add SKU</Button>}</RoleGate>
        </>} />

      {q.error ? <Card><ErrorState error={q.error} onRetry={() => q.refetch()} /></Card> : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <MetricCard loading={!d} label="SKUs" icon={Boxes} value={num(d?.summary.skus)} />
            <MetricCard loading={!d} label="Units on hand" icon={Boxes} tone="cyan" value={num(d?.summary.units)} />
            <MetricCard loading={!d} label="Stock value" icon={Coins} tone="violet" value={money(d?.summary.value, currency, { compact: true })} tooltip="On-hand units × the unit cost you entered. SKUs without a cost are excluded." source={{ classification: "user" }} />
            <MetricCard loading={!d} label="Reorder now" icon={ShoppingCart} tone="warning" value={num(d?.summary.reorder_now)} tooltip="Available stock (on hand + inbound) is at or below the reorder point." />
            <MetricCard loading={!d} label="High stockout risk" icon={AlertTriangle} tone="danger" value={num(d?.summary.high_risk)} tooltip="Days of cover is shorter than the supplier lead time." />
          </div>

          {d && d.items.length > 0 && <Notice>Velocity basis: {d.velocity_basis}. Reorder point = units/day × (lead time + safety days). Suggested order covers lead time, safety stock and 30 days of sales, minus stock on hand and inbound.</Notice>}

          {d && restock.length > 0 && (
            <Card>
              <CardHeader eyebrow="Restock suggestions" title={`${restock.length} SKU${restock.length === 1 ? "" : "s"} to reorder`} description="Sorted by days of cover remaining." action={<Button variant="ghost" size="sm" asChild><Link href="/rfq">RFQ Manager</Link></Button>} />
              <CardBody>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {restock.slice(0, 6).map((i) => (
                    <button key={i.id} type="button" onClick={() => setDetail(i)} className="rounded-lg border border-line p-3.5 text-left transition-colors hover:border-line-strong hover:bg-surface-2">
                      <div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="truncate text-[13px] font-medium">{i.title || i.sku}</div><div className="font-mono text-2xs text-subtle">{i.sku}</div></div><Badge tone={RISK[i.stockout_risk].tone} size="sm">{RISK[i.stockout_risk].label}</Badge></div>
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <div><div className="text-2xs text-subtle">Order</div><div className="text-lg font-semibold num">{num(i.suggested_order_qty)} units</div></div>
                        <div className="text-right text-xs text-muted"><div className="num">{i.days_of_cover != null ? `${num(i.days_of_cover)} days cover` : "—"}</div><div>{i.projected_stockout ? `Out ~${dateShort(i.projected_stockout)}` : ""}</div></div>
                      </div>
                    </button>
                  ))}
                </div>
                {restock.length > 6 && <Button variant="ghost" size="sm" className="mt-3" onClick={() => setFilter("reorder")}>Show all {restock.length} in the table</Button>}
              </CardBody>
            </Card>
          )}

          <DataTable columns={cols} data={items} loading={q.isLoading} getRowId={(i) => String(i.id)} onRowClick={setDetail} storageKey="inventory"
            toolbar={<>
              <SearchInput value={search} onChange={setSearch} placeholder="Search SKU, title or ASIN" className="w-full sm:w-64" />
              <Segmented size="sm" value={filter} onChange={setFilter} options={[{ value: "all", label: `All${d ? ` · ${d.items.length}` : ""}` }, { value: "reorder", label: "Reorder now" }, { value: "risk", label: "At risk" }]} />
            </>}
            empty={d && d.items.length === 0 ? (
              <EmptyState icon={Boxes} title="No inventory yet" description="Import your FBA Manage Inventory report (or any CSV with SKU and quantity columns), sync from SP-API, or add SKUs by hand. Then import sales so velocity and days of cover can be calculated."
                action={<>{can("analyst") && <Button onClick={() => setImportOpen(true)}><Upload />Import CSV</Button>}<Button variant="secondary" asChild><Link href="/sales">Import sales</Link></Button></>} />
            ) : <EmptyState compact title="No SKUs match" description="Clear the search or filter." action={<Button variant="secondary" onClick={() => { setSearch(""); setFilter("all"); }}>Clear filters</Button>} />} />
        </>
      )}

      <Sheet open={!!detail} onOpenChange={(v) => !v && setDetail(null)} width={520} title={detail?.title || detail?.sku || ""} description={detail ? <span className="font-mono">{detail.sku}{detail.asin ? ` · ${detail.asin}` : ""}</span> : undefined}
        footer={detail && <RoleGate>{(ok) => <><Button variant="ghost" className="mr-auto text-danger" disabled={!ok} onClick={() => setRemoving(detail)}><Trash2 />Remove</Button><Button variant="secondary" disabled={!ok} onClick={() => openEdit(detail)}><Pencil />Edit</Button></>}</RoleGate>}>
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2"><Badge tone={RISK[detail.stockout_risk].tone} dot>{RISK[detail.stockout_risk].label} stockout risk</Badge>{detail.reorder_now && <Badge tone="warning">Reorder now</Badge>}<SourceBadge classification={classifyOpsSource(detail.source)} /></div>
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-[13px] font-medium">90-day stock projection<InfoTip content="On-hand units minus current daily velocity. Ignores inbound stock and future orders." /></div>
              {detail.daily_velocity > 0 ? <TrendArea data={detail.forecast_90d} x="day" y="units" height={180} tone={detail.stockout_risk === "high" ? "danger" : "primary"} xFormat={(v) => `Day ${v}`} valueFormat={(v) => num(v)} />
                : <EmptyState compact icon={CalendarClock} title="No sales velocity" description="Import sales for this SKU to project stock levels." action={<Button variant="secondary" size="sm" asChild><Link href="/sales">Import sales</Link></Button>} />}
            </div>
            <KeyValue rows={[
              ["On hand", num(detail.on_hand)], ["Inbound", num(detail.inbound)], ["Reserved", num(detail.reserved)],
              ["Units / day (30d)", num(detail.daily_velocity, { decimals: 2 })], ["Days of cover", detail.days_of_cover != null ? num(detail.days_of_cover, { decimals: 1 }) : "—"],
              ["Lead time", `${detail.lead_time_days} days`], ["Safety stock", `${detail.safety_days} days`], ["Reorder point", `${num(detail.reorder_point)} units`],
              ["Suggested order", `${num(detail.suggested_order_qty)} units`], ["Projected stockout", detail.projected_stockout ? dateShort(detail.projected_stockout) : "—"],
              ["Unit cost", money(detail.unit_cost, currency)], ["Stock value", money(detail.value, currency)], ["Source", SOURCE_LABEL[detail.source] ?? detail.source],
            ]} />
          </div>
        )}
      </Sheet>

      <Dialog open={!!edit} onOpenChange={(v) => !v && setEdit(null)} title={edit?.mode === "new" ? "Add SKU" : `Edit ${edit?.f.sku}`} size="lg"
        description="Lead time and safety days drive the reorder point. Unit cost feeds stock value and COGS in Sales Analytics."
        footer={<><Button variant="secondary" onClick={() => setEdit(null)}>Cancel</Button><Button loading={save.isPending} disabled={!edit?.f.sku.trim()} onClick={() => edit && save.mutate(edit.f)}>Save</Button></>}>
        {edit && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SKU" aside="Required"><Input value={edit.f.sku} disabled={edit.mode === "edit"} maxLength={80} onChange={(e) => setEdit({ ...edit, f: { ...edit.f, sku: e.target.value } })} /></Field>
            <Field label="ASIN"><Input value={edit.f.asin} maxLength={10} onChange={(e) => setEdit({ ...edit, f: { ...edit.f, asin: e.target.value } })} /></Field>
            <Field label="Title" className="sm:col-span-2"><Input value={edit.f.title} maxLength={300} onChange={(e) => setEdit({ ...edit, f: { ...edit.f, title: e.target.value } })} /></Field>
            {(["on_hand", "inbound", "reserved"] as const).map((k) => <Field key={k} label={{ on_hand: "On hand", inbound: "Inbound", reserved: "Reserved" }[k]}><NumInput value={edit.f[k]} min={0} step="1" onChange={(v) => setEdit({ ...edit, f: { ...edit.f, [k]: v } })} /></Field>)}
            <Field label="Unit cost"><NumInput value={edit.f.unit_cost} onChange={(v) => setEdit({ ...edit, f: { ...edit.f, unit_cost: v } })} prefix={currencySymbol(currency)} placeholder="Optional" /></Field>
            <Field label="Lead time"><NumInput value={edit.f.lead_time_days} step="1" onChange={(v) => setEdit({ ...edit, f: { ...edit.f, lead_time_days: v } })} suffix="days" /></Field>
            <Field label="Safety stock"><NumInput value={edit.f.safety_days} step="1" onChange={(v) => setEdit({ ...edit, f: { ...edit.f, safety_days: v } })} suffix="days" /></Field>
          </div>
        )}
      </Dialog>

      <Dialog open={importOpen} onOpenChange={(v) => { setImportOpen(v); if (!v) setFile(null); }} title="Import inventory"
        description="Upload Seller Central's FBA Manage Inventory report, or any CSV/XLSX with SKU and quantity columns. Existing SKUs are updated; nothing is deleted."
        footer={<><Button variant="secondary" onClick={() => setImportOpen(false)}>Cancel</Button><Button disabled={!file} loading={imp.isPending} onClick={() => imp.mutate()}><Upload />Import</Button></>}>
        <div className="space-y-3">
          <FilePick file={file} onFile={setFile} />
          <p className="text-xs text-subtle">Recognised columns: sku / seller-sku, product-name, asin, afn-fulfillable-quantity (or available / quantity), afn-inbound-* (or inbound), afn-reserved-quantity, unit cost.</p>
        </div>
      </Dialog>

      <ConfirmDialog open={!!removing} onOpenChange={(v) => !v && setRemoving(null)} title="Remove SKU?" description={<>Remove <b>{removing?.sku}</b> from the Inventory Manager? Imported sales are kept.</>}
        confirmLabel="Remove" loading={remove.isPending} onConfirm={() => removing && remove.mutate(removing.id)} />
    </div>
  );
}
