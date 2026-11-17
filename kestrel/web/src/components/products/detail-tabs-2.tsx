"use client";
/* Product detail tabs: profitability, keywords, competitors, suppliers, eligibility. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Building2, Calculator, ClipboardCheck, ExternalLink, FileText, GitCompareArrows, Hash, ScanSearch, Search, ShieldCheck, Target, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { SUPPLIER_STATUS } from "@/components/app/supplier";
import { productColumns, type ProductBrief } from "@/components/app/product";
import { Waterfall } from "@/components/ui/charts";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState, ErrorState, KeyValue, NotConfigured, SourceBadge } from "@/components/ui/data";
import { Tooltip } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Field, Input, Segmented, Skeleton, Textarea } from "@/components/ui/primitives";
import { ApiError, errorMessage, get, post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { ago, cn, dateShort, money, num, pct } from "@/lib/utils";
import { NO_ROWS } from "./explorer";
import type { TabProps } from "./detail-tabs";
import type { EligibilityReason, QueryResponse } from "./types";

/* ---------------------------------------------------------------- Profitability */
type ProfitOut = {
  currency: string; gross_revenue: number; output_vat: number; net_revenue: number; referral_fee: number; referral_rule: string; fba_fee: number | null; size_tier: string;
  storage_fee: number; removal_cost: number; fee_vat: number; total_amazon_fees: number; landed_cost: number; advertising: number; returns_cost: number; other_costs: number;
  net_profit: number; margin_pct: number; roi_pct: number; break_even_price: number | null; break_even_acos_pct: number | null; max_unit_cost: number | null;
  monthly_profit: number | null; monthly_revenue: number | null; warnings: string[]; fee_sources: { fee: string; rule?: string; tier?: string; source_url?: string }[];
};

export function ProfitTab({ p, openCost }: TabProps & { openCost: () => void }) {
  const assumedCost = p.price ? Math.round((p.price * 0.25 / (p.marketplace !== "US" ? 1.2 : 1)) * 100) / 100 : null;
  const cost = p.unit_cost ?? assumedCost;
  const inputs = {
    marketplace: p.marketplace, category: p.category || "Default", selling_price: p.price ?? 0, unit_cost: cost ?? 0, weight_g: p.weight_g, length_cm: p.length_cm, width_cm: p.width_cm,
    height_cm: p.height_cm, ad_spend_pct: 10, returns_pct: 3, vat_registered: true, monthly_units: p.units ?? 0,
  };
  const q = useQuery({ queryKey: ["product-profit", p.id, inputs], queryFn: () => post<ProfitOut>("/profit/calculate", inputs), enabled: !!p.price });
  const o = q.data;
  const c = o?.currency ?? p.currency;
  const calcHref = `/profit?product_id=${p.id}&asin=${p.asin}&price=${p.price ?? ""}&unit_cost=${cost ?? ""}`;
  if (!p.price) return <Card><EmptyState icon={Calculator} title="No price to calculate from" description="Refresh the product from a data source or set a price to estimate fees and profit." action={<Button variant="secondary" asChild><Link href="/profit"><Calculator />Open Profit Calculator</Link></Button>} /></Card>;
  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center gap-4 p-4">
        <div className="min-w-0 flex-1 text-[13px]">
          <div className="flex flex-wrap items-center gap-2 font-medium">Estimated profit per unit <SourceBadge classification="estimated" />{p.unit_cost == null && <Badge tone="warning" size="sm">Assumed unit cost</Badge>}</div>
          <p className="mt-1 text-muted">Assumes {money(cost, p.currency)} unit cost{p.unit_cost == null ? " (25% of price ex VAT, a placeholder)" : " (yours)"}, VAT-registered seller, 10% ad spend, 3% returns, current price and catalogue size/weight. Not a guarantee of profit.</p>
        </div>
        <div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={openCost}>Set unit cost & size</Button><Button asChild><Link href={calcHref}><Calculator />Full Profit Calculator</Link></Button></div>
      </Card>
      {q.error ? <Card><ErrorState error={q.error} onRetry={() => q.refetch()} /></Card> : !o ? <Skeleton className="h-80 w-full rounded-xl" /> : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[["Net profit / unit", money(o.net_profit, c), o.net_profit < 0], ["Margin", pct(o.margin_pct, 1), o.margin_pct < 0], ["ROI", pct(o.roi_pct, 1), o.roi_pct < 0], ["Est. monthly profit", money(o.monthly_profit, c, { compact: true }), (o.monthly_profit ?? 0) < 0]].map(([l, v, neg]) => (
              <Card key={String(l)} className="p-4"><div className="text-xs text-muted">{l}</div><div className={cn("mt-1 text-2xl font-semibold num", neg && "text-danger")}>{v}</div></Card>
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader eyebrow="Per unit" title="Price to net profit" />
              <CardBody>
                <Waterfall valueFormat={(v) => money(v, c, { decimals: 2 })} steps={[
                  { label: "Price", value: o.gross_revenue, kind: "total" }, { label: "VAT", value: o.output_vat, kind: "cost" }, { label: "Referral", value: o.referral_fee, kind: "cost" },
                  { label: "FBA", value: o.fba_fee ?? 0, kind: "cost" }, { label: "Storage", value: o.storage_fee, kind: "cost" }, { label: "Landed", value: o.landed_cost, kind: "cost" },
                  { label: "Ads", value: o.advertising, kind: "cost" }, { label: "Returns", value: o.returns_cost, kind: "cost" },
                  { label: "Other", value: o.fee_vat + o.removal_cost + o.other_costs, kind: "cost" }, { label: "Net", value: o.net_profit, kind: "result" },
                ]} />
              </CardBody>
            </Card>
            <Card>
              <CardHeader eyebrow="Fees" title="Fee breakdown" />
              <CardBody>
                <KeyValue rows={[
                  ["Selling price", money(o.gross_revenue, c)], ["Output VAT", money(o.output_vat, c)],
                  ["Referral fee", <span key="r">{money(o.referral_fee, c)}<span className="block text-2xs text-subtle">{o.referral_rule}</span></span>],
                  ["FBA fulfilment fee", o.fba_fee == null ? <span key="f" className="text-warning">Unknown — add size & weight</span> : <span key="f">{money(o.fba_fee, c)}<span className="block text-2xs text-subtle">{o.size_tier}</span></span>],
                  ["Storage (1.5 months)", money(o.storage_fee, c)], ["VAT on fees", money(o.fee_vat, c)], ["Total Amazon fees", <b key="t">{money(o.total_amazon_fees, c)}</b>],
                  ["Landed cost", money(o.landed_cost, c)], ["Advertising (10%)", money(o.advertising, c)], ["Returns (3%)", money(o.returns_cost, c)],
                  ["Break-even price", money(o.break_even_price, c)], ["Break-even ACoS", pct(o.break_even_acos_pct, 1)], ["Max unit cost to break even", money(o.max_unit_cost, c)],
                ]} />
                {o.fee_sources.some((s) => s.source_url) && <div className="mt-3 flex flex-wrap gap-2">{o.fee_sources.filter((s) => s.source_url).map((s) => <a key={s.fee} href={s.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">{s.fee.toUpperCase()} fee source<ExternalLink className="size-3" /></a>)}</div>}
              </CardBody>
            </Card>
          </div>
          {o.warnings.length > 0 && <Card className="p-4"><ul className="space-y-1 text-[13px] text-muted">{o.warnings.map((w) => <li key={w}>• {w}</li>)}</ul></Card>}
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Keywords */
export function KeywordsTab({ p }: TabProps) {
  const seed = (p.title || "").split(/[\s,–\-|]+/).filter((w) => w.length > 2).slice(0, 4).join(" ");
  const links = [
    { href: `/reverse-asin?asin=${p.asin}&marketplace=${p.marketplace}`, icon: ScanSearch, title: `Reverse ASIN for ${p.asin}`, body: "Organic and sponsored keywords this listing ranks for, with search volume and position (needs a keyword data source)." },
    { href: `/keywords?q=${encodeURIComponent(seed)}`, icon: Hash, title: "Keyword research", body: `Search volume, related terms and difficulty around “${seed || p.asin}”.` },
    { href: `/ranks?asin=${p.asin}`, icon: Target, title: "Rank tracker", body: "Track this ASIN's organic and sponsored position for chosen keywords over time." },
    { href: `/listing?asin=${p.asin}`, icon: FileText, title: "Listing optimizer", body: "Score this listing's title, bullets and backend terms against the keywords that matter." },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="group">
          <Card className="flex h-full items-start gap-4 p-5 transition-colors group-hover:border-line-strong">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><l.icon className="size-5" /></div>
            <div className="min-w-0 flex-1"><div className="flex items-center gap-2 text-sm font-semibold">{l.title}<ArrowRight className="size-4 text-subtle transition-transform group-hover:translate-x-0.5" /></div><p className="mt-1 text-[13px] text-muted">{l.body}</p></div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Competitors */
export function CompetitorsTab({ p }: TabProps) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<ProductBrief[]>([]);
  const filters = p.category ? { marketplace: p.marketplace, category: [p.category] } : { marketplace: p.marketplace, q: p.brand || p.title.split(" ").slice(0, 2).join(" ") };
  const q = useQuery({ queryKey: ["products", p.marketplace, "competitors", p.id, filters], queryFn: () => post<QueryResponse>("/products/query", { filters, sort: "revenue", dir: "desc", page: 1, page_size: 25 }) });
  const rows = React.useMemo(() => (q.data?.items ?? NO_ROWS).filter((x) => x.id !== p.id), [q.data, p.id]);
  const top = rows.slice(0, 4).map((r) => r.id);
  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <Users className="size-4 text-primary" />
        <p className="min-w-0 flex-1 text-[13px] text-muted">{p.category ? <>Products in <b className="text-fg">{p.category}</b> already in your workspace, by estimated revenue.</> : "Similar products in your workspace (no category on this product yet)."} Research more of the category to widen the set.</p>
        <Button variant="secondary" size="sm" disabled={!top.length} onClick={() => router.push(`/compare?ids=${[p.id, ...top].join(",")}`)}><GitCompareArrows />Compare with top {top.length || ""}</Button>
        <Button variant="ghost" size="sm" asChild><Link href="/competitors">Competitor Analysis<ArrowRight /></Link></Button>
      </Card>
      {q.error ? <Card><ErrorState error={q.error} onRetry={() => q.refetch()} /></Card> : (
        <DataTable<ProductBrief> storageKey="product-competitors" columns={productColumns({ compact: true })} data={rows} loading={q.isLoading} selectable onSelectionChange={setSelected}
          getRowId={(r) => String(r.id)} onRowClick={(r) => router.push(`/products/${r.id}`)}
          toolbar={<>
            <span className="text-sm font-semibold">Competing products</span>
            {selected.length > 0 && (
              <Tooltip content={selected.length > 9 ? "Compare up to 10 products including this one" : undefined}>
                <span><Button size="xs" variant="ghost" disabled={selected.length > 9} onClick={() => router.push(`/compare?ids=${[p.id, ...selected.map((s) => s.id)].join(",")}`)}><GitCompareArrows />Compare {selected.length} with this</Button></span>
              </Tooltip>
            )}
          </>}
          empty={<EmptyState compact icon={Search} title="No competitors in your workspace yet" description="Search the category or main keyword in Product Research to pull competing listings in."
            action={<Button variant="secondary" asChild><Link href={`/research?q=${encodeURIComponent(p.category || p.title.split(" ").slice(0, 3).join(" "))}`}><Search />Research competitors</Link></Button>} />} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Suppliers */
type SupplierRow = { id: number; name: string; status: string; status_label: string; supplier_type: string; country: string; city: string; website: string; moq: number | null;
  price_min: number | null; price_max: number | null; currency: string; lead_time_days: number | null; score: number | null; matched_products: number; has_authorisation_evidence: boolean; documentation: string };

export function SuppliersTab({ p }: TabProps) {
  const initial = p.brand || (p.title || "").split(" ").slice(0, 3).join(" ");
  const [term, setTerm] = React.useState(initial);
  const [applied, setApplied] = React.useState(initial);
  const q = useQuery({ queryKey: ["suppliers", "for-product", p.id, applied], queryFn: () => get<{ total: number; items: SupplierRow[] }>("/suppliers", { q: applied, page_size: 20 }), enabled: !!applied });
  const items = q.data?.items ?? [];
  const discoverHref = `/suppliers?mode=discover&product=${encodeURIComponent(p.title.slice(0, 120))}${p.brand ? `&brand=${encodeURIComponent(p.brand)}` : ""}`;
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <form className="flex flex-col gap-3 md:flex-row md:items-end" onSubmit={(e) => { e.preventDefault(); setApplied(term.trim()); }}>
          <Field label="Match suppliers in your workspace by" hint="Searches supplier names, websites, notes and the product lines you've recorded for them." className="flex-1">
            <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Brand or product keyword" />
          </Field>
          <div className="flex gap-2"><Button type="submit" variant="secondary" disabled={!term.trim()}><Search />Search</Button><Button asChild><Link href={discoverHref}><Building2 />Discover new suppliers</Link></Button></div>
        </form>
      </Card>
      <Card className="overflow-hidden">
        <CardHeader eyebrow="Supplier matches" title={applied ? `Suppliers matching “${applied}”` : "Supplier matches"} description="Status reflects the evidence on file. Only “Official brand owner” and “Verified authorised distributor” indicate confirmed authorisation." />
        {!applied ? <EmptyState compact icon={Building2} title="Enter a brand or keyword" description="We'll match it against suppliers saved in your workspace." />
          : q.error ? <ErrorState error={q.error} onRetry={() => q.refetch()} />
          : q.isLoading ? <CardBody><Skeleton className="h-32 w-full" /></CardBody>
          : items.length === 0 ? <EmptyState compact icon={Building2} title="No matching suppliers yet" description="Discover manufacturers, wholesalers and distributors for this product, then verify them against public registers." action={<Button asChild><Link href={discoverHref}><Building2 />Discover suppliers</Link></Button>} />
          : (
            <ul className="divide-y divide-line border-t border-line">
              {items.map((s) => {
                const st = SUPPLIER_STATUS[s.status] ?? SUPPLIER_STATUS.unverified;
                return (
                  <li key={s.id}>
                    <Link href={`/suppliers/${s.id}`} className="flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2">
                      <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-xs font-semibold text-muted">{s.name.slice(0, 2).toUpperCase()}</div>
                      <div className="min-w-0 flex-1"><div className="truncate text-[13px] font-medium">{s.name}</div><div className="text-2xs text-subtle">{[s.country, s.city, s.supplier_type.replace(/_/g, " ")].filter(Boolean).join(" · ")}</div></div>
                      <div className="hidden text-right text-xs text-muted sm:block">
                        <div className="num">{s.moq ? `MOQ ${num(s.moq)}` : "MOQ —"}{s.lead_time_days ? ` · ${s.lead_time_days}d lead` : ""}</div>
                        <div className="num">{s.price_min != null ? `${money(s.price_min, s.currency)}${s.price_max != null ? `–${money(s.price_max, s.currency)}` : ""}` : "No price on file"}</div>
                      </div>
                      <Badge tone={st.tone} size="sm">{st.label}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------- Eligibility */
const ELIG: Record<string, { label: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
  eligible: { label: "Eligible to list", tone: "success" }, approval_required: { label: "Approval required", tone: "warning" }, restricted: { label: "Restricted", tone: "danger" },
};
const SOURCE_LABEL: Record<string, string> = { sp_api: "SP-API listing restrictions", seller_central_manual: "Recorded from Seller Central" };

function Reason({ r }: { r: EligibilityReason }) {
  if (typeof r === "string") return <li className="text-[13px] text-muted">{r}</li>;
  return (
    <li className="text-[13px] text-muted">
      {r.code && <Badge size="sm" className="mr-2 font-mono">{r.code}</Badge>}{r.message}
      {r.links?.filter(Boolean).map((l) => <a key={l} href={l} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">Seller Central<ExternalLink className="size-3" /></a>)}
    </li>
  );
}

export function EligibilityTab({ p }: TabProps) {
  const qc = useQueryClient();
  const { can } = useSession();
  const [nc, setNc] = React.useState<ApiError | null>(null);
  const [result, setResult] = React.useState<"eligible" | "approval_required" | "restricted">("eligible");
  const [notes, setNotes] = React.useState("");
  const done = () => { qc.invalidateQueries({ queryKey: ["product", p.id] }); qc.invalidateQueries({ queryKey: ["products"] }); };
  const check = useMutation({
    mutationFn: () => post<{ result: string; reasons: EligibilityReason[] }>(`/products/${p.id}/eligibility/check`),
    onSuccess: (r) => { setNc(null); toast.success(`SP-API: ${ELIG[r.result]?.label ?? r.result}`); done(); },
    onError: (e) => { if (e instanceof ApiError && e.notConfigured) setNc(e); else toast.error(errorMessage(e)); },
  });
  const record = useMutation({
    mutationFn: () => post(`/products/${p.id}/eligibility`, { result, notes }),
    onSuccess: () => { toast.success("Eligibility recorded"); setNotes(""); done(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const latest = p.eligibility[0];
  const analyst = can("analyst");
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader eyebrow="Eligibility" title={latest ? ELIG[latest.result]?.label ?? latest.result : "Not checked yet"}
            description={latest ? `${SOURCE_LABEL[latest.source] ?? latest.source} · ${dateShort(latest.checked_at)} (${ago(latest.checked_at)})` : "Check whether your seller account can list this ASIN in new condition."}
            action={latest ? <Badge tone={ELIG[latest.result]?.tone ?? "neutral"} dot>{ELIG[latest.result]?.label ?? latest.result}</Badge> : undefined} />
          <CardBody className="space-y-4">
            {nc ? <NotConfigured provider="Amazon SP-API" message={nc.message} className="py-6" /> : (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface-2 p-3">
                <ShieldCheck className="size-5 text-primary" />
                <div className="min-w-0 flex-1 text-[13px] text-muted">Runs Amazon's Listing Restrictions API for your seller account. Results reflect your account today and can change.</div>
                <Tooltip content={!analyst ? "Viewers can't run checks" : undefined}><span><Button disabled={!analyst} loading={check.isPending} onClick={() => check.mutate()}><ClipboardCheck />Check with SP-API</Button></span></Tooltip>
              </div>
            )}
            {p.eligibility.length ? (
              <ol className="relative space-y-4 border-l border-line pl-4">
                {p.eligibility.map((e, i) => (
                  <li key={i} className="relative">
                    <span className={cn("absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-surface", e.result === "eligible" ? "bg-success" : e.result === "restricted" ? "bg-danger" : "bg-warning")} />
                    <div className="flex flex-wrap items-center gap-2 text-[13px]"><span className="font-medium">{ELIG[e.result]?.label ?? e.result}</span><SourceBadge classification={e.source === "sp_api" ? "official_api" : "user"} /><span className="text-xs text-subtle">{dateShort(e.checked_at)}</span></div>
                    {e.reasons.length > 0 && <ul className="mt-1.5 space-y-1">{e.reasons.map((r, j) => <Reason key={j} r={r} />)}</ul>}
                  </li>
                ))}
              </ol>
            ) : <EmptyState compact icon={ShieldCheck} title="No checks recorded" description="Run an SP-API check, or record what Seller Central shows when you search this ASIN under Add a Product." />}
          </CardBody>
        </Card>
        <Card>
          <CardHeader eyebrow="Manual record" title="Record from Seller Central" description="Seller Central → Catalogue → Add a Product → search the ASIN, then record what it shows." />
          <CardBody>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); record.mutate(); }}>
              <Field label="Result"><Segmented value={result} onChange={setResult} options={[{ value: "eligible", label: "Eligible" }, { value: "approval_required", label: "Approval required" }, { value: "restricted", label: "Restricted" }]} /></Field>
              <Field label="Notes" hint="Optional: what Seller Central said, documents requested, etc."><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Brand requires an invoice from an authorised distributor" /></Field>
              <Tooltip content={!analyst ? "Viewers can't record eligibility" : undefined}><span><Button type="submit" disabled={!analyst} loading={record.isPending}>Save record</Button></span></Tooltip>
            </form>
          </CardBody>
        </Card>
      </div>
      <p className="text-xs text-subtle">Eligibility feeds the “Restrictions & compliance” factor of the opportunity score. It describes your account's ability to list, not whether a supplier's goods will be accepted.</p>
    </div>
  );
}
