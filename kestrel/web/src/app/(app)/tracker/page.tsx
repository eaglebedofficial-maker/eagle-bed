"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, ArrowDownRight, ArrowUpRight, FolderPlus, GitCompareArrows, MoreHorizontal, Plus, RefreshCw, Search, Star, Tag, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";
import { ProductCell } from "@/components/app/product";
import { NO_ROWS } from "@/components/products/explorer";
import { ProductPicker } from "@/components/products/product-picker";
import { GROUP_TONES, groupTone, type TrackedItem, type TrackerResponse, type TrackingGroup } from "@/components/products/types";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState, ErrorState, MetricCard, PageHeader, SourceBadge, Sparkline } from "@/components/ui/data";
import { ConfirmDialog, Dialog, Menu, Tooltip } from "@/components/ui/overlay";
import { Badge, Button, Field, Input } from "@/components/ui/primitives";
import { del, errorMessage, get, post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { ago, cn, dateShort, money, num } from "@/lib/utils";

function Delta({ v, format, goodWhen }: { v: number | null; format: (n: number) => string; goodWhen: "up" | "down" | "neutral" }) {
  if (v == null || v === 0) return <span className="text-2xs text-subtle">{v === 0 ? "no change" : "—"}</span>;
  const good = goodWhen === "neutral" ? null : goodWhen === "up" ? v > 0 : v < 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-2xs font-medium num", good == null ? "text-muted" : good ? "text-success" : "text-danger")}>
      {v > 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{format(Math.abs(v))}
    </span>
  );
}

const Dot = ({ colour }: { colour: string }) => <span className="size-2 shrink-0 rounded-full" style={{ background: `rgb(var(--${groupTone(colour)}))` }} />;

function TrackerInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const { can } = useSession();
  const analyst = can("analyst");
  const gid = Number(sp.get("group")) || null;
  const setGroup = (g: number | null) => router.replace(g ? `/tracker?group=${g}` : "/tracker");
  const q = useQuery({ queryKey: ["tracker", gid], queryFn: () => get<TrackerResponse>("/tracker", { group_id: gid ?? undefined }) });
  const allQ = useQuery({ queryKey: ["tracker", null], queryFn: () => get<TrackerResponse>("/tracker"), enabled: gid != null });
  const groups = q.data?.groups ?? [];
  const items = q.data?.items ?? NO_ROWS;
  const [selected, setSelected] = useState<TrackedItem[]>([]);
  const [picker, setPicker] = useState(false);
  const [newGroup, setNewGroup] = useState(false);
  const [gName, setGName] = useState("");
  const [gTone, setGTone] = useState<string>("primary");
  const [delGroup, setDelGroup] = useState<TrackingGroup | null>(null);
  const [untrackRows, setUntrackRows] = useState<TrackedItem[] | null>(null);
  const [refreshing, setRefreshing] = useState<Set<number>>(new Set());
  const inv = () => { qc.invalidateQueries({ queryKey: ["tracker"] }); qc.invalidateQueries({ queryKey: ["products"] }); };

  const add = useMutation({
    mutationFn: ({ ids, group }: { ids: number[]; group: number | null }) => post<{ added: number }>("/tracker", { product_ids: ids, group_id: group }),
    onSuccess: (r, v) => { toast.success(r.added ? `${v.group ? "Added" : "Tracking"} ${r.added} product${r.added === 1 ? "" : "s"}${v.group ? ` to ${groups.find((g) => g.id === v.group)?.name ?? "group"}` : ""}` : "Already tracked there"); setPicker(false); inv(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const untrack = useMutation({
    mutationFn: async (rows: TrackedItem[]) => { for (const r of rows) await del(`/tracker/${r.id}`); },
    onSuccess: (_, rows) => { toast.success(`Stopped tracking ${rows.length} product${rows.length === 1 ? "" : "s"}`); setUntrackRows(null); inv(); },
    onError: (e) => { toast.error(errorMessage(e)); inv(); },
  });
  const createGroup = useMutation({
    mutationFn: () => post<{ id: number; name: string }>("/tracker/groups", { name: gName.trim(), colour: gTone, kind: "tracker" }),
    onSuccess: (g) => { toast.success(`Group “${g.name}” created`); setNewGroup(false); setGName(""); inv(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const removeGroup = useMutation({
    mutationFn: (g: TrackingGroup) => del(`/tracker/groups/${g.id}`),
    onSuccess: (_, g) => { toast.success(`Group “${g.name}” deleted`); setDelGroup(null); if (gid === g.id) setGroup(null); inv(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const refreshRows = async (rows: TrackedItem[]) => {
    setRefreshing(new Set(rows.map((r) => r.id)));
    let ok = 0;
    for (const r of rows) {
      try { await post(`/products/${r.id}/refresh`); ok++; } catch (e) { toast.error(`${r.asin}: ${errorMessage(e)}`); }
    }
    setRefreshing(new Set());
    if (ok) toast.success(`Refreshed ${ok} product${ok === 1 ? "" : "s"} and recorded a snapshot`);
    inv();
  };

  const columns = useMemo<ColumnDef<TrackedItem, any>[]>(() => [
    { id: "title", header: "Product", accessorKey: "title", enableHiding: false, cell: ({ row }) => <ProductCell p={row.original} /> },
    { id: "price", header: "Price", accessorKey: "price", meta: { align: "right" }, cell: ({ row: { original: p } }) => (
      <div className="flex flex-col items-end"><span>{money(p.price, p.currency)}</span><Delta v={p.price_change} format={(n) => money(n, p.currency)} goodWhen="neutral" /></div>
    ) },
    { id: "spark_price", header: "Price trend", enableSorting: false, cell: ({ row: { original: p } }) => <div className="w-24">{p.spark_price.filter((x) => x != null).length > 1 ? <Sparkline values={p.spark_price} tone="primary" height={26} /> : <span className="text-2xs text-subtle">Needs 2+ snapshots</span>}</div> },
    { id: "bsr", header: "BSR", accessorKey: "bsr", meta: { align: "right" }, cell: ({ row: { original: p } }) => (
      <div className="flex flex-col items-end"><span>{p.bsr ? `#${num(p.bsr)}` : "—"}</span><Delta v={p.bsr_change} format={(n) => num(n)} goodWhen="down" /></div>
    ) },
    { id: "spark_bsr", header: "BSR trend", enableSorting: false, cell: ({ row: { original: p } }) => <div className="w-24">{p.spark_bsr.filter((x) => x != null).length > 1 ? <Sparkline values={p.spark_bsr.map((v) => (v == null ? null : -v))} tone="success" height={26} /> : <span className="text-2xs text-subtle">—</span>}</div> },
    { id: "units", header: "Est. units", accessorKey: "units", meta: { align: "right" }, cell: ({ row: { original: p } }) => (
      <div className="flex items-center justify-end gap-2">{p.spark_units.filter((x) => x != null).length > 1 && <div className="w-14"><Sparkline values={p.spark_units} tone="cyan" height={22} fill={false} /></div>}<span>{num(p.units)}</span></div>
    ) },
    { id: "reviews", header: "Reviews", accessorKey: "reviews", meta: { align: "right" }, cell: ({ row: { original: p } }) => (
      <div className="flex flex-col items-end"><span>{num(p.reviews)}</span><Delta v={p.reviews_change} format={(n) => `${num(n)}`} goodWhen="neutral" /></div>
    ) },
    { id: "target", header: "Target price", accessorKey: "target_price", meta: { align: "right" }, cell: ({ row: { original: p } }) => p.target_price == null ? <span className="text-subtle">—</span> : (
      <div className="flex flex-col items-end"><span>{money(p.target_price, p.currency)}</span>{p.price != null && p.price <= p.target_price && <Badge tone="success" size="sm">At or below</Badge>}</div>
    ) },
    { id: "group", header: "Group", accessorKey: "group_id", cell: ({ row: { original: p } }) => { const g = groups.find((x) => x.id === p.group_id); return g ? <span className="inline-flex items-center gap-1.5 text-muted"><Dot colour={g.colour} />{g.name}</span> : <span className="text-subtle">—</span>; } },
    { id: "since", header: "Tracking since", accessorKey: "tracked_since", cell: ({ row: { original: p } }) => <div className="whitespace-nowrap text-xs"><div>{dateShort(p.tracked_since)}</div><div className="text-subtle num">{p.snapshots} snapshot{p.snapshots === 1 ? "" : "s"}</div></div> },
    { id: "updated", header: "Updated", accessorKey: "last_refreshed_at", cell: ({ row: { original: p } }) => <span className="whitespace-nowrap text-xs text-muted">{ago(p.last_refreshed_at)}</span> },
    { id: "actions", header: "", enableSorting: false, enableHiding: false, cell: ({ row: { original: p } }) => (
      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <Menu trigger={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${p.asin}`}><MoreHorizontal /></Button>} items={[
          { label: refreshing.has(p.id) ? "Refreshing…" : "Refresh & snapshot", icon: <RefreshCw />, disabled: !analyst || refreshing.has(p.id), onSelect: () => refreshRows([p]) },
          ...groups.filter((g) => g.id !== p.group_id).map((g) => ({ label: `Add to ${g.name}`, icon: <Tag />, disabled: !analyst, onSelect: () => add.mutate({ ids: [p.id], group: g.id }) })),
          "sep" as const,
          { label: "Stop tracking", icon: <Trash2 />, danger: true, disabled: !analyst, onSelect: () => setUntrackRows([p]) },
        ]} />
      </div>
    ) },
  ], [groups, refreshing, analyst]); // eslint-disable-line

  const priceDrops = items.filter((i) => (i.price_change ?? 0) < 0).length;
  const rankUp = items.filter((i) => (i.bsr_change ?? 0) < 0).length;
  const newReviews = items.reduce((s, i) => s + Math.max(0, i.reviews_change ?? 0), 0);
  const allCount = gid == null ? items.length : allQ.data?.items.length;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Product intelligence" title="Product Tracker"
        description="Snapshots of price, rank, reviews and offers for products you follow. Each refresh records a snapshot; changes are measured from when tracking started."
        actions={<>
          <Tooltip content={!analyst ? "Viewers can't create groups" : undefined}><span><Button variant="secondary" disabled={!analyst} onClick={() => setNewGroup(true)}><FolderPlus />New group</Button></span></Tooltip>
          <Tooltip content={!analyst ? "Viewers can't track products" : undefined}><span><Button disabled={!analyst} onClick={() => setPicker(true)}><Plus />Track products</Button></span></Tooltip>
        </>} />

      {q.error ? <ErrorState error={q.error} onRetry={() => q.refetch()} /> : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <MetricCard loading={q.isLoading} label="Tracked products" icon={Activity} value={num(items.length)} sub={gid ? <span>in this group</span> : undefined} />
            <MetricCard loading={q.isLoading} label="Price down since tracking" icon={TrendingDown} tone="cyan" value={num(priceDrops)} />
            <MetricCard loading={q.isLoading} label="Rank improved" icon={TrendingUp} tone="success" value={num(rankUp)} tooltip="Best Sellers Rank lower (better) than when tracking started." />
            <MetricCard loading={q.isLoading} label="New reviews" icon={Star} tone="warning" value={num(newReviews)} tooltip="Reviews gained across tracked products since tracking started." />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button onClick={() => setGroup(null)} className={cn("inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[13px] transition-colors", gid == null ? "border-primary bg-primary-soft text-primary" : "border-line text-muted hover:text-fg")}>
              All tracked{allCount != null && <span className="text-2xs opacity-70 num">{allCount}</span>}
            </button>
            {groups.map((g) => (
              <span key={g.id} className={cn("inline-flex h-8 items-center rounded-full border pl-3 pr-1 text-[13px] transition-colors", gid === g.id ? "border-primary bg-primary-soft text-primary" : "border-line text-muted hover:text-fg")}>
                <button onClick={() => setGroup(g.id)} className="inline-flex items-center gap-2"><Dot colour={g.colour} />{g.name}<span className="text-2xs opacity-70 num">{g.count}</span></button>
                <Menu trigger={<button aria-label={`Group options for ${g.name}`} className="ml-1 grid size-6 place-items-center rounded-full hover:bg-surface-2"><MoreHorizontal className="size-3.5" /></button>}
                  items={[{ label: "Delete group", icon: <Trash2 />, danger: true, disabled: !analyst, onSelect: () => setDelGroup(g) }]} />
              </span>
            ))}
          </div>

          <DataTable<TrackedItem> storageKey="tracker" columns={columns} data={items} loading={q.isLoading} selectable onSelectionChange={setSelected}
            getRowId={(p) => String(p.id)} onRowClick={(p) => router.push(`/products/${p.id}`)} dense
            toolbar={<>
              <span className="text-sm font-semibold">{gid ? groups.find((g) => g.id === gid)?.name ?? "Group" : "All tracked products"}</span>
              <SourceBadge classification="user" source={{ note: "Snapshots taken by Kestrel each time a tracked product is refreshed." }} />
              {selected.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-primary-soft/50 px-2 py-1">
                  <span className="px-1 text-xs font-medium text-primary num">{selected.length} selected</span>
                  <Button size="xs" variant="ghost" disabled={!analyst || refreshing.size > 0} loading={refreshing.size > 0} onClick={() => refreshRows(selected)}><RefreshCw />Refresh</Button>
                  {groups.length > 0 && <Menu trigger={<Button size="xs" variant="ghost" disabled={!analyst}><Tag />Add to group</Button>} items={groups.map((g) => ({ label: g.name, icon: <Dot colour={g.colour} />, onSelect: () => add.mutate({ ids: selected.map((s) => s.id), group: g.id }) }))} />}
                  <Tooltip content={selected.length > 10 || selected.length < 2 ? "Select 2–10 products to compare" : undefined}><span><Button size="xs" variant="ghost" disabled={selected.length > 10 || selected.length < 2} onClick={() => router.push(`/compare?ids=${selected.map((s) => s.id).join(",")}`)}><GitCompareArrows />Compare</Button></span></Tooltip>
                  <Button size="xs" variant="ghost" className="text-danger" disabled={!analyst} onClick={() => setUntrackRows(selected)}><Trash2 />Stop tracking</Button>
                </div>
              )}
            </>}
            empty={<EmptyState compact icon={Activity} title={gid ? "No products in this group" : "You're not tracking anything yet"}
              description={gid ? "Add tracked products to this group from the row menu, or track new products straight into it." : "Track products to record price, rank, review and offer snapshots over time and get change alerts."}
              action={<><Button disabled={!analyst} onClick={() => setPicker(true)}><Plus />Track products</Button><Button variant="secondary" asChild><Link href="/research"><Search />Research products</Link></Button></>} />} />
          <p className="text-xs text-subtle">Snapshots are taken when tracking starts and whenever a product is refreshed. For daily history without manual refreshes, connect Keepa and fetch history from Keepa Intelligence.</p>
        </>
      )}

      <ProductPicker open={picker} onOpenChange={setPicker} title={gid ? `Track products in ${groups.find((g) => g.id === gid)?.name ?? "this group"}` : "Track products"}
        description="Tracking takes a snapshot now and every time the product is refreshed." exclude={gid == null ? items.map((i) => i.id) : []} confirmLabel="Track" loading={add.isPending}
        onConfirm={(rows) => add.mutate({ ids: rows.map((r) => r.id), group: gid })} />

      <Dialog open={newGroup} onOpenChange={setNewGroup} title="New tracking group" size="sm" description="Group tracked products by niche, supplier or launch."
        footer={<><Button variant="secondary" onClick={() => setNewGroup(false)}>Cancel</Button><Button disabled={!gName.trim()} loading={createGroup.isPending} onClick={() => createGroup.mutate()}>Create group</Button></>}>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (gName.trim()) createGroup.mutate(); }}>
          <Field label="Name" htmlFor="g-name"><Input id="g-name" autoFocus value={gName} onChange={(e) => setGName(e.target.value)} placeholder="e.g. Kitchen launch Q1" maxLength={120} /></Field>
          <Field label="Colour">
            <div className="flex gap-2">{GROUP_TONES.map((t) => (
              <button key={t} type="button" aria-label={t} aria-pressed={gTone === t} onClick={() => setGTone(t)} className={cn("grid size-8 place-items-center rounded-full border-2 transition-colors", gTone === t ? "border-fg" : "border-transparent")}>
                <span className="size-5 rounded-full" style={{ background: `rgb(var(--${t}))` }} />
              </button>
            ))}</div>
          </Field>
        </form>
      </Dialog>
      <ConfirmDialog open={!!delGroup} onOpenChange={(v) => !v && setDelGroup(null)} title="Delete group?" confirmLabel="Delete group" loading={removeGroup.isPending} onConfirm={() => delGroup && removeGroup.mutate(delGroup)}
        description={<>Delete <b>{delGroup?.name}</b>? Its products stay tracked, without a group.</>} />
      <ConfirmDialog open={!!untrackRows} onOpenChange={(v) => !v && setUntrackRows(null)} title="Stop tracking?" confirmLabel="Stop tracking" loading={untrack.isPending} onConfirm={() => untrackRows && untrack.mutate(untrackRows)}
        description={`Stop tracking ${untrackRows?.length ?? 0} product${untrackRows?.length === 1 ? "" : "s"} in every group. Existing snapshots are kept on the product.`} />
    </div>
  );
}

export default function TrackerPage() {
  return <Suspense><TrackerInner /></Suspense>;
}
