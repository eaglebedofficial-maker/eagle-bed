"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, ChartCandlestick, ChevronLeft, Copy, ExternalLink, GitCompareArrows, MoreHorizontal, PackageX, PencilLine, RefreshCw, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { amazonUrl, CompetitionBadge, ProductThumb } from "@/components/app/product";
import { BuyBoxTab, HistoryTab, OverviewTab, SalesTab, ScoreTab } from "@/components/products/detail-tabs";
import { CompetitorsTab, EligibilityTab, KeywordsTab, ProfitTab, SuppliersTab } from "@/components/products/detail-tabs-2";
import type { ProductDetail } from "@/components/products/types";
import { EmptyState, ErrorState, ScoreRing, SourceBadge } from "@/components/ui/data";
import { ConfirmDialog, Dialog, Menu, TabPanel, Tabs, Tooltip } from "@/components/ui/overlay";
import { Badge, Button, Card, Field, Input, Skeleton } from "@/components/ui/primitives";
import { ApiError, del, errorMessage, get, patch, post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { ago, currencySymbol, money, num } from "@/lib/utils";

const TABS = [
  { value: "overview", label: "Overview" }, { value: "sales", label: "Sales & demand" }, { value: "history", label: "Price & rank history" },
  { value: "buybox", label: "Buy box & offers" }, { value: "score", label: "Opportunity score" }, { value: "profit", label: "Profitability" },
  { value: "keywords", label: "Keywords" }, { value: "competitors", label: "Competitors" }, { value: "suppliers", label: "Suppliers" }, { value: "eligibility", label: "Eligibility" },
];

type RefreshReport = { report: { ok: string[]; failed: { provider: string; error: string }[]; skipped: string[] } };

function CostDialog({ p, open, onOpenChange }: { p: ProductDetail; open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ unit_cost: "", weight_g: "", length_cm: "", width_cm: "", height_cm: "" });
  useEffect(() => {
    if (open) setF({ unit_cost: p.unit_cost?.toString() ?? "", weight_g: p.weight_g?.toString() ?? "", length_cm: p.length_cm?.toString() ?? "", width_cm: p.width_cm?.toString() ?? "", height_cm: p.height_cm?.toString() ?? "" });
  }, [open, p]);
  const save = useMutation({
    mutationFn: () => {
      const body: Record<string, number | null> = {};
      for (const [k, v] of Object.entries(f)) {
        const cur = (p as unknown as Record<string, number | null>)[k];
        const next = v.trim() === "" ? null : Number(v);
        if (next !== cur && (next === null || Number.isFinite(next))) body[k] = next;
      }
      return patch(`/products/${p.id}`, body);
    },
    onSuccess: () => { toast.success("Saved. Fees, profit and score recalculated."); qc.invalidateQueries({ queryKey: ["product", p.id] }); qc.invalidateQueries({ queryKey: ["product-profit", p.id] }); qc.invalidateQueries({ queryKey: ["products"] }); onOpenChange(false); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const sym = currencySymbol(p.currency).trim();
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Unit cost, size & weight" description="Your unit cost replaces the assumed 25%-of-price placeholder. Size and weight let Kestrel calculate FBA fees. Leave a field blank to clear it."
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button loading={save.isPending} onClick={() => save.mutate()}>Save & recalculate</Button></>}>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <Field label="Unit cost (ex VAT)" htmlFor="uc" className="sm:col-span-2" hint={p.cost_assumed ? "Currently assumed. Enter your supplier price per unit." : "Your supplier price per unit."}>
          <Input id="uc" type="number" step="0.01" min="0" prefix={sym} value={f.unit_cost} onChange={set("unit_cost")} placeholder="e.g. 4.20" autoFocus />
        </Field>
        <Field label="Package weight" htmlFor="wg"><Input id="wg" type="number" min="0" suffix="g" value={f.weight_g} onChange={set("weight_g")} /></Field>
        <Field label="Length" htmlFor="ln"><Input id="ln" type="number" step="0.1" min="0" suffix="cm" value={f.length_cm} onChange={set("length_cm")} /></Field>
        <Field label="Width" htmlFor="wd"><Input id="wd" type="number" step="0.1" min="0" suffix="cm" value={f.width_cm} onChange={set("width_cm")} /></Field>
        <Field label="Height" htmlFor="ht"><Input id="ht" type="number" step="0.1" min="0" suffix="cm" value={f.height_cm} onChange={set("height_cm")} /></Field>
        <button type="submit" className="hidden" />
      </form>
    </Dialog>
  );
}

function HeaderSkeleton() {
  return <Card className="flex gap-5 p-5"><Skeleton className="size-28 rounded-xl" /><div className="flex-1 space-y-3"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/3" /><Skeleton className="h-10 w-full" /></div></Card>;
}

function DetailInner() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const sp = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const { can } = useSession();
  const tab = TABS.some((t) => t.value === sp.get("tab")) ? sp.get("tab")! : "overview";
  const goTab = (t: string) => router.replace(`/products/${id}?tab=${t}`, { scroll: false });
  const [costOpen, setCostOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const q = useQuery({ queryKey: ["product", id], queryFn: () => get<ProductDetail>(`/products/${id}`), enabled: Number.isFinite(id) });
  const p = q.data;
  const invalidate = () => { qc.invalidateQueries({ queryKey: ["product", id] }); qc.invalidateQueries({ queryKey: ["products"] }); qc.invalidateQueries({ queryKey: ["tracker"] }); qc.invalidateQueries({ queryKey: ["history", id] }); };

  const track = useMutation({ mutationFn: () => post<{ added: number }>("/tracker", { product_ids: [id] }), onSuccess: () => { toast.success("Tracking started. A snapshot is taken each refresh."); invalidate(); }, onError: (e) => toast.error(errorMessage(e)) });
  const untrack = useMutation({ mutationFn: () => del(`/tracker/${id}`), onSuccess: () => { toast.success("Stopped tracking"); invalidate(); }, onError: (e) => toast.error(errorMessage(e)) });
  const refresh = useMutation({
    mutationFn: () => post<RefreshReport>(`/products/${id}/refresh`),
    onSuccess: ({ report }) => {
      invalidate();
      if (report.ok.length) toast.success(`Refreshed from ${report.ok.map((s) => s.replace("_", "-").toUpperCase()).join(" and ")}`);
      report.failed.forEach((f) => toast.error(`${f.provider.replace("_", "-").toUpperCase()}: ${f.error}`));
      if (!report.ok.length && !report.failed.length) toast.message("No live data source is connected, so estimates were recalculated from stored data only.", { action: { label: "Connect", onClick: () => router.push("/settings?tab=integrations") } });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const remove = useMutation({ mutationFn: () => del(`/products/${id}`), onSuccess: () => { toast.success("Product deleted"); qc.invalidateQueries({ queryKey: ["products"] }); router.push("/products"); }, onError: (e) => toast.error(errorMessage(e)) });

  if (q.error) {
    const nf = q.error instanceof ApiError && q.error.status === 404;
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild><Link href="/products"><ChevronLeft />Product Database</Link></Button>
        <Card>{nf ? <EmptyState icon={PackageX} title="Product not found" description="It may have been deleted, or it belongs to another organisation." action={<Button asChild><Link href="/products">Back to Product Database</Link></Button>} /> : <ErrorState error={q.error} onRetry={() => q.refetch()} />}</Card>
      </div>
    );
  }
  const analyst = can("analyst");
  const viewerTip = !analyst ? "Viewers can't change data" : undefined;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" asChild><Link href="/products"><ChevronLeft />Product Database</Link></Button>
      {!p ? <HeaderSkeleton /> : (
        <Card className="p-5">
          <div className="flex flex-col gap-5 lg:flex-row">
            <a href={amazonUrl(p)} target="_blank" rel="noreferrer" className="shrink-0 self-start"><ProductThumb src={p.image_url} size={112} className="rounded-xl" /></a>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <Badge size="sm">Amazon {p.marketplace}</Badge>
                <button className="inline-flex items-center gap-1 font-mono hover:text-fg" onClick={() => { navigator.clipboard?.writeText(p.asin).then(() => toast.success("ASIN copied"), () => toast.error("Couldn't copy")); }}>{p.asin}<Copy className="size-3" /></button>
                {p.brand && <><span className="text-subtle">·</span><span>{p.brand}</span></>}
                {p.category && <><span className="text-subtle">·</span><span className="truncate">{p.category}</span></>}
                {p.tracked && <Badge tone="primary" size="sm"><Activity className="size-3" />Tracked</Badge>}
                <SourceBadge source={{ provider: p.source, classification: p.classification, retrieved_at: p.last_refreshed_at }} />
                <span className="text-subtle">Updated {ago(p.last_refreshed_at)}</span>
              </div>
              <h1 className="text-lg font-semibold leading-snug md:text-xl">{p.title || p.asin}</h1>
              <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-3">
                <div><div className="text-xs text-muted">Price</div><div className="text-xl font-semibold num">{money(p.price, p.currency)}</div></div>
                <div><div className="text-xs text-muted">BSR</div><div className="text-xl font-semibold num">{p.bsr ? `#${num(p.bsr)}` : "—"}</div>{p.bsr_category && <div className="max-w-[180px] truncate text-2xs text-subtle">{p.bsr_category}</div>}</div>
                <div><div className="text-xs text-muted">Est. units / mo</div><div className="text-xl font-semibold num">{num(p.units)}</div>{p.units != null && <div className="text-2xs text-subtle num">{num(p.units_low)}–{num(p.units_high)} · estimate</div>}</div>
                <div><div className="text-xs text-muted">Reviews</div><div className="flex items-center gap-1.5 text-xl font-semibold num">{num(p.reviews)}{p.rating ? <span className="inline-flex items-center gap-0.5 text-sm font-medium text-muted">{p.rating.toFixed(1)}<Star className="size-3.5 fill-warning text-warning" /></span> : null}</div></div>
                <div><div className="text-xs text-muted">Est. profit / unit</div><div className="text-xl font-semibold num">{money(p.profit, p.currency)}</div><div className="text-2xs text-subtle">{p.cost_assumed ? "assumed unit cost" : `cost ${money(p.unit_cost, p.currency)}`}</div></div>
                <div><div className="text-xs text-muted">Competition</div><div className="mt-1"><CompetitionBadge level={p.competition} /></div></div>
              </div>
            </div>
            <div className="flex shrink-0 flex-row items-center gap-4 lg:flex-col lg:items-end">
              <button onClick={() => goTab("score")} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2 transition-colors hover:border-line-strong" aria-label="Open opportunity score breakdown">
                <ScoreRing score={p.score} size={56} stroke={5} label="Opportunity score" />
                <div className="text-left"><div className="text-xs text-muted">Opportunity</div><div className="text-[13px] font-medium">score</div></div>
              </button>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Tooltip content={viewerTip}><span>
                  {p.tracked ? <Button variant="secondary" size="sm" disabled={!analyst} loading={untrack.isPending} onClick={() => untrack.mutate()}><Activity />Untrack</Button>
                    : <Button size="sm" disabled={!analyst} loading={track.isPending} onClick={() => track.mutate()}><Activity />Track</Button>}
                </span></Tooltip>
                <Tooltip content={viewerTip ?? "Pull fresh data from Keepa and SP-API (whichever are connected)"}><span><Button variant="secondary" size="sm" disabled={!analyst} loading={refresh.isPending} onClick={() => refresh.mutate()}><RefreshCw />Refresh</Button></span></Tooltip>
                <Tooltip content={viewerTip}><span><Button variant="secondary" size="sm" disabled={!analyst} onClick={() => setCostOpen(true)}><PencilLine />{p.cost_assumed ? "Set unit cost" : "Edit cost"}</Button></span></Tooltip>
                <Button variant="secondary" size="sm" asChild><Link href={`/compare?ids=${p.id}`}><GitCompareArrows />Compare</Link></Button>
                <Button variant="ghost" size="sm" asChild><a href={amazonUrl(p)} target="_blank" rel="noreferrer">Amazon<ExternalLink /></a></Button>
                <Menu trigger={<Button variant="ghost" size="icon-sm" aria-label="More actions"><MoreHorizontal /></Button>} items={[
                  { label: "Open in Keepa Intelligence", icon: <ChartCandlestick />, onSelect: () => router.push(`/history?id=${p.id}`) },
                  "sep",
                  { label: "Delete product", icon: <Trash2 />, danger: true, disabled: !analyst, onSelect: () => setConfirmDel(true) },
                ]} />
              </div>
            </div>
          </div>
        </Card>
      )}

      <Tabs value={tab} onValueChange={goTab} tabs={TABS} sticky>
        {!p ? <div className="space-y-4 pt-5"><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div><Skeleton className="h-64 w-full rounded-xl" /></div> : (
          <>
            <TabPanel value="overview"><OverviewTab p={p} goTab={goTab} /></TabPanel>
            <TabPanel value="sales"><SalesTab p={p} goTab={goTab} /></TabPanel>
            <TabPanel value="history"><HistoryTab p={p} goTab={goTab} /></TabPanel>
            <TabPanel value="buybox"><BuyBoxTab p={p} goTab={goTab} /></TabPanel>
            <TabPanel value="score"><ScoreTab p={p} goTab={goTab} /></TabPanel>
            <TabPanel value="profit"><ProfitTab p={p} goTab={goTab} openCost={() => setCostOpen(true)} /></TabPanel>
            <TabPanel value="keywords"><KeywordsTab p={p} goTab={goTab} /></TabPanel>
            <TabPanel value="competitors"><CompetitorsTab p={p} goTab={goTab} /></TabPanel>
            <TabPanel value="suppliers"><SuppliersTab p={p} goTab={goTab} /></TabPanel>
            <TabPanel value="eligibility"><EligibilityTab p={p} goTab={goTab} /></TabPanel>
          </>
        )}
      </Tabs>

      {p && <CostDialog p={p} open={costOpen} onOpenChange={setCostOpen} />}
      <ConfirmDialog open={confirmDel} onOpenChange={setConfirmDel} title="Delete this product?" confirmLabel="Delete" loading={remove.isPending} onConfirm={() => remove.mutate()}
        description="This removes the product with its history, snapshots, tracking and eligibility records from your workspace." />
    </div>
  );
}

export default function ProductDetailPage() {
  return <Suspense><DetailInner /></Suspense>;
}
