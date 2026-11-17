"use client";
/* Advanced Profit Calculator: inputs on the left, live results (via /profit/calculate) on the right. */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowDown, Calculator, ExternalLink, FolderOpen, Landmark, PackageSearch, RotateCcw, Save, Trash2, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import type { ProductBrief } from "@/components/app/product";
import { Waterfall } from "@/components/ui/charts";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState, ErrorState, PageHeader, SourceBadge, type Source } from "@/components/ui/data";
import { ConfirmDialog, Dialog, InfoTip, Select, Tooltip } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Field, Input, Segmented, Separator, Skeleton, Switch } from "@/components/ui/primitives";
import { del, errorMessage, get, post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { cn, currencySymbol, dateShort, money, num, pct } from "@/lib/utils";
import { ProductPicker } from "./product-picker";
import { Notice, NumInput, RoleGate, Row, toNum, useDebounced } from "./shared";
import { TariffLookup } from "./tariff-lookup";

/* ---------------------------------------------------------------- types */
type FeeSource = { fee: string; rule?: string; tier?: string; source_url?: string; shipping_weight_g?: number; dim_weight_g?: number };
export type ProfitOut = {
  currency: string; gross_revenue: number; output_vat: number; net_revenue: number; referral_fee: number; referral_rule: string; fba_fee: number | null; size_tier: string;
  storage_fee: number; removal_cost: number; fee_vat: number; total_amazon_fees: number; landed_cost: number; landed_breakdown: Record<string, number>;
  advertising: number; returns_cost: number; other_costs: number; net_profit: number; margin_pct: number; roi_pct: number; break_even_price: number | null;
  break_even_acos_pct: number | null; max_unit_cost: number | null; monthly_profit: number | null; monthly_revenue: number | null; cash_required: number | null;
  months_to_recoup: number | null; warnings: string[]; fee_sources: FeeSource[];
};
type Scenarios = { conservative: ProfitOut; expected: ProfitOut; best: ProfitOut; assumptions: { conservative: string; best: string } };
type CalcResp = ProfitOut & { input: Record<string, unknown>; scenarios?: Scenarios };
type Saved = { id: number; name: string; product_id: number | null; inputs: Record<string, any>; net_profit: number | null; margin_pct: number | null; roi_pct: number | null; currency: string | null; created_at: string };
type FeesResp = { referral: { category: string; rate: number; is_custom: boolean }[] };
type FxResp = { base: string; date: string; rates: Record<string, number>; source: Source };
type ProductDetail = ProductBrief & { weight_g: number | null; length_cm: number | null; width_cm: number | null; height_cm: number | null };

type Form = {
  marketplace: string; category: string; price: string; priceMode: "inc" | "ex"; costCurrency: string;
  unit_cost: string; supplier_shipping: string; freight: string; duty_rate: string; import_vat_rate: string;
  prep: string; labelling: string; packaging: string; inbound_to_amazon: string; other_costs: string;
  fulfilment: "FBA" | "FBM"; fbm_shipping: string; feeMode: "dims" | "manual";
  weight_g: string; length_cm: string; width_cm: string; height_cm: string; fba_fee_override: string; referral_fee_override: string;
  storage_months: string; removal_rate: string; removal_fee: string;
  adMode: "pct" | "unit"; ad_value: string; returns_pct: string; returns_recoverable_pct: string;
  vat_registered: boolean; vat_rate: string; fees_vatable: boolean; monthly_units: string; order_quantity: string;
};

const blank = (marketplace: string, vatRegistered: boolean, currency: string): Form => ({
  marketplace, category: "Default", price: "", priceMode: "inc", costCurrency: currency,
  unit_cost: "", supplier_shipping: "", freight: "", duty_rate: "", import_vat_rate: "",
  prep: "", labelling: "", packaging: "", inbound_to_amazon: "", other_costs: "",
  fulfilment: "FBA", fbm_shipping: "", feeMode: "dims",
  weight_g: "", length_cm: "", width_cm: "", height_cm: "", fba_fee_override: "", referral_fee_override: "",
  storage_months: "1.5", removal_rate: "", removal_fee: "",
  adMode: "pct", ad_value: "", returns_pct: "", returns_recoverable_pct: "50",
  vat_registered: vatRegistered, vat_rate: "", fees_vatable: true, monthly_units: "", order_quantity: "",
});
const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const COST_CURRENCIES = ["GBP", "EUR", "USD", "CNY", "CAD", "AUD", "JPY", "INR"];
const LANDED_LABEL: Record<string, string> = {
  unit_cost: "Unit cost", supplier_shipping: "Supplier shipping", freight: "International freight", duty: "Import duty", import_vat_unrecovered: "Import VAT (not reclaimable)",
  prep: "Prep", labelling: "Labelling", packaging: "Packaging", inbound_to_amazon: "Inbound to Amazon",
};

/* ---------------------------------------------------------------- small layout helpers */
function Section({ title, description, action, children }: { title: string; description?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader title={title} description={description} action={action} />
      <CardBody className="grid gap-4 sm:grid-cols-2">{children}</CardBody>
    </Card>
  );
}
function NF({ label, value, onChange, prefix, suffix, hint, aside, placeholder, className, tip }: {
  label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: React.ReactNode; hint?: React.ReactNode; aside?: React.ReactNode; placeholder?: string; className?: string; tip?: React.ReactNode;
}) {
  const id = React.useId();
  return (
    <Field label={<span className="inline-flex items-center gap-1.5">{label}{tip && <InfoTip content={tip} />}</span>} htmlFor={id} hint={hint} aside={aside} className={className}>
      <NumInput id={id} value={value} onChange={onChange} prefix={prefix} suffix={suffix} placeholder={placeholder ?? "0"} invalid={value !== "" && toNum(value) === undefined} />
    </Field>
  );
}

/* ---------------------------------------------------------------- main */
export function ProfitCalculator() {
  const { marketplace, marketplaces, me, can } = useSession();
  const qc = useQueryClient();
  const orgVat = me?.active_org?.vat_registered ?? true;
  const mktCurrency = (code: string) => marketplaces.find((m) => m.code === code)?.currency ?? "GBP";
  const [f, setF] = React.useState<Form>(() => blank(marketplace, orgVat, mktCurrency(marketplace)));
  const [product, setProduct] = React.useState<{ id: number; title: string; asin: string; marketplace: string } | null>(null);
  const [touched, setTouched] = React.useState(false);
  const set = <K extends keyof Form>(k: K) => (v: Form[K]) => { setTouched(true); setF((p) => ({ ...p, [k]: v })); };

  // follow the global marketplace until the user starts editing
  React.useEffect(() => { if (!touched) setF(blank(marketplace, orgVat, mktCurrency(marketplace))); /* eslint-disable-next-line */ }, [marketplace, orgVat, marketplaces.length]);

  const mkt = marketplaces.find((m) => m.code === f.marketplace);
  const currency = mkt?.currency ?? "GBP";
  const sym = currencySymbol(currency);
  const costSym = currencySymbol(f.costCurrency);
  const vatRate = toNum(f.vat_rate) ?? mkt?.vat_rate ?? 0;

  const fees = useQuery({ queryKey: ["fees", f.marketplace], queryFn: () => get<FeesResp>("/fees", { marketplace: f.marketplace }), staleTime: 300_000 });
  const categories = React.useMemo(() => {
    const set = new Set((fees.data?.referral ?? []).map((r) => r.category));
    set.add("Default");
    if (f.category) set.add(f.category);
    return [...set].sort((a, b) => (a === "Default" ? -1 : b === "Default" ? 1 : a.localeCompare(b)));
  }, [fees.data, f.category]);

  const needFx = f.costCurrency !== currency;
  const fx = useQuery({ queryKey: ["fx", currency], queryFn: () => get<FxResp>("/fx", { base: currency }), enabled: needFx, staleTime: 3600_000 });
  const fxRate = needFx ? fx.data?.rates?.[f.costCurrency] : 1;

  /* ---- build the engine payload from the form (all conversions are explicit and listed as assumptions) */
  const built = React.useMemo(() => {
    const priceRaw = toNum(f.price);
    const price = priceRaw === undefined ? undefined : f.priceMode === "ex" ? priceRaw * (1 + vatRate / 100) : priceRaw;
    const conv = (v: string) => { const n = toNum(v); return n === undefined ? undefined : fxRate ? n / fxRate : undefined; };
    const adRaw = toNum(f.ad_value) ?? 0;
    const adPct = f.adMode === "pct" ? adRaw : price ? (adRaw / price) * 100 : 0;
    const p: Record<string, unknown> = {
      marketplace: f.marketplace, category: f.category || "Default", selling_price: price ?? 0,
      unit_cost: conv(f.unit_cost) ?? 0, supplier_shipping: conv(f.supplier_shipping) ?? 0, freight: conv(f.freight) ?? 0,
      duty_rate: toNum(f.duty_rate) ?? 0, import_vat_rate: toNum(f.import_vat_rate),
      prep: toNum(f.prep) ?? 0, labelling: toNum(f.labelling) ?? 0, packaging: toNum(f.packaging) ?? 0, inbound_to_amazon: toNum(f.inbound_to_amazon) ?? 0, other_costs: toNum(f.other_costs) ?? 0,
      fulfilment: f.fulfilment, fbm_shipping: f.fulfilment === "FBM" ? toNum(f.fbm_shipping) ?? 0 : 0,
      weight_g: toNum(f.weight_g), length_cm: toNum(f.length_cm), width_cm: toNum(f.width_cm), height_cm: toNum(f.height_cm),
      fba_fee_override: f.fulfilment === "FBA" && f.feeMode === "manual" ? toNum(f.fba_fee_override) ?? 0 : undefined,
      referral_fee_override: toNum(f.referral_fee_override),
      storage_months: toNum(f.storage_months) ?? 0, removal_rate: toNum(f.removal_rate) ?? 0, removal_fee: toNum(f.removal_fee) ?? 0,
      ad_spend_pct: Math.round(adPct * 10000) / 10000, returns_pct: toNum(f.returns_pct) ?? 0, returns_recoverable_pct: toNum(f.returns_recoverable_pct) ?? 50,
      vat_registered: f.vat_registered, vat_rate: toNum(f.vat_rate), fees_vatable: f.fees_vatable,
      monthly_units: toNum(f.monthly_units) ?? 0, order_quantity: toNum(f.order_quantity) ?? 0,
    };
    Object.keys(p).forEach((k) => p[k] === undefined && delete p[k]);
    return { payload: p, price, adPct, ready: !!price && price > 0 && (!needFx || !!fxRate) };
  }, [f, vatRate, fxRate, needFx]);

  const debounced = useDebounced(built, 350);
  const calc = useQuery({
    queryKey: ["profit-calc", debounced.payload],
    queryFn: () => post<CalcResp>("/profit/calculate", { ...debounced.payload, with_scenarios: true }),
    enabled: debounced.ready, placeholderData: keepPreviousData, staleTime: 60_000,
  });

  /* ---- saved calculations */
  const saved = useQuery({ queryKey: ["profit-saved"], queryFn: () => get<Saved[]>("/profit/saved") });
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [saveName, setSaveName] = React.useState("");
  const save = useMutation({
    mutationFn: () => post<{ id: number }>("/profit/saved", { name: saveName.trim(), product_id: product?.id ?? null, inputs: built.payload }),
    onSuccess: () => { toast.success("Calculation saved"); setSaveOpen(false); qc.invalidateQueries({ queryKey: ["profit-saved"] }); if (product) qc.invalidateQueries({ queryKey: ["products"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const [removing, setRemoving] = React.useState<Saved | null>(null);
  const remove = useMutation({
    mutationFn: (id: number) => del(`/profit/saved/${id}`),
    onSuccess: () => { toast.success("Calculation deleted"); setRemoving(null); qc.invalidateQueries({ queryKey: ["profit-saved"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const load = (c: Saved) => {
    const i = c.inputs || {};
    setTouched(true);
    setF({
      ...blank(s(i.marketplace) || marketplace, i.vat_registered ?? orgVat, mktCurrency(s(i.marketplace) || marketplace)),
      category: s(i.category) || "Default", price: s(i.selling_price), unit_cost: s(i.unit_cost), supplier_shipping: s(i.supplier_shipping), freight: s(i.freight),
      duty_rate: s(i.duty_rate), import_vat_rate: s(i.import_vat_rate), prep: s(i.prep), labelling: s(i.labelling), packaging: s(i.packaging),
      inbound_to_amazon: s(i.inbound_to_amazon), other_costs: s(i.other_costs), fulfilment: i.fulfilment === "FBM" ? "FBM" : "FBA", fbm_shipping: s(i.fbm_shipping),
      feeMode: i.fba_fee_override != null ? "manual" : "dims", fba_fee_override: s(i.fba_fee_override), referral_fee_override: s(i.referral_fee_override),
      weight_g: s(i.weight_g), length_cm: s(i.length_cm), width_cm: s(i.width_cm), height_cm: s(i.height_cm),
      storage_months: s(i.storage_months), removal_rate: s(i.removal_rate), removal_fee: s(i.removal_fee), adMode: "pct", ad_value: s(i.ad_spend_pct),
      returns_pct: s(i.returns_pct), returns_recoverable_pct: s(i.returns_recoverable_pct), vat_rate: s(i.vat_rate), fees_vatable: i.fees_vatable ?? true,
      monthly_units: s(i.monthly_units), order_quantity: s(i.order_quantity),
    });
    setProduct(c.product_id ? { id: c.product_id, title: c.name, asin: "", marketplace: s(i.marketplace) } : null);
    toast.success(`Loaded “${c.name}”`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---- product prefill */
  const [pickOpen, setPickOpen] = React.useState(false);
  const [tariffOpen, setTariffOpen] = React.useState(false);
  const [tariffInfo, setTariffInfo] = React.useState<{ code: string; description: string } | null>(null);
  const pick = async (p: ProductBrief) => {
    try {
      const d = await get<ProductDetail>(`/products/${p.id}`);
      setTouched(true);
      setProduct({ id: d.id, title: d.title || d.asin, asin: d.asin, marketplace: d.marketplace });
      setF((prev) => ({
        ...prev, marketplace: d.marketplace, costCurrency: prev.costCurrency === mktCurrency(prev.marketplace) ? mktCurrency(d.marketplace) : prev.costCurrency,
        category: d.category || prev.category, price: d.price != null ? String(d.price) : prev.price, priceMode: "inc",
        weight_g: s(d.weight_g) || prev.weight_g, length_cm: s(d.length_cm) || prev.length_cm, width_cm: s(d.width_cm) || prev.width_cm, height_cm: s(d.height_cm) || prev.height_cm,
        unit_cost: !d.cost_assumed && d.unit_cost != null ? String(d.unit_cost) : prev.unit_cost, feeMode: "dims",
      }));
      toast.success("Prefilled from product", { description: d.cost_assumed || d.unit_cost == null ? "No confirmed unit cost on file — enter your supplier price." : undefined });
    } catch (e) { toast.error(errorMessage(e)); }
  };

  const r = calc.data;
  const resultsRef = React.useRef<HTMLDivElement>(null);
  const priceInvalid = f.price !== "" && toNum(f.price) === undefined;
  const isSaveable = built.ready;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <PageHeader eyebrow="Financial tools" title="Profit Calculator"
        description="Landed cost, Amazon fees from your effective-dated fee database, VAT, advertising and returns to an estimated net profit — with break-evens and scenarios."
        actions={<>
          <Button variant="secondary" onClick={() => setPickOpen(true)}><PackageSearch />Prefill from product</Button>
          <Button variant="ghost" onClick={() => { setTouched(false); setProduct(null); setTariffInfo(null); setF(blank(marketplace, orgVat, mktCurrency(marketplace))); }}><RotateCcw />Reset</Button>
          <RoleGate>{(ok) => <Button disabled={!ok || !isSaveable} onClick={() => { setSaveName(product?.title?.slice(0, 120) || `Calculation ${dateShort(new Date().toISOString())}`); setSaveOpen(true); }}><Save />Save calculation</Button>}</RoleGate>
        </>} />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_440px]">
        {/* ---------------------------------------------------------- inputs */}
        <div className="min-w-0 space-y-4">
          {product && (
            <Card className="flex flex-wrap items-center gap-3 p-4">
              <div className="grid size-9 place-items-center rounded-lg bg-primary-soft text-primary"><PackageSearch className="size-4" /></div>
              <div className="min-w-0 flex-1">
                <div className="text-2xs font-semibold uppercase tracking-[0.08em] text-subtle">Linked product</div>
                <Link href={`/products/${product.id}`} className="block truncate text-[13px] font-medium hover:text-primary">{product.title}</Link>
                {product.asin && <div className="font-mono text-2xs text-subtle">{product.asin} · {product.marketplace}</div>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setProduct(null)}><X />Unlink</Button>
            </Card>
          )}

          <Section title="Product & price" description="Amazon shows VAT-inclusive prices in the UK and EU.">
            <Field label="Marketplace">
              <Select value={f.marketplace} onChange={(v) => { set("marketplace")(v); setF((p) => ({ ...p, marketplace: v, costCurrency: p.costCurrency === mktCurrency(p.marketplace) ? mktCurrency(v) : p.costCurrency })); }}
                options={marketplaces.map((m) => ({ value: m.code, label: `${m.name} · ${m.currency}` }))} aria-label="Marketplace" />
            </Field>
            <Field label={<span className="inline-flex items-center gap-1.5">Referral category<InfoTip content="Matches a referral-fee rule in your fee database (Settings → Fee database). Unmatched categories use the Default rule." /></span>}>
              <Select value={f.category} onChange={set("category")} options={categories.map((c) => ({ value: c, label: c }))} aria-label="Referral category" />
            </Field>
            <Field label="Selling price" className="sm:col-span-2" aside={f.priceMode === "ex" && built.price ? <span className="num">Sent as {money(built.price, currency)} inc. VAT</span> : undefined}>
              <div className="flex flex-wrap gap-2">
                <NumInput value={f.price} onChange={set("price")} prefix={sym} placeholder="0.00" className="min-w-[160px] flex-1" invalid={priceInvalid} aria-label="Selling price" />
                <Segmented value={f.priceMode} onChange={set("priceMode")} options={[{ value: "inc", label: "Inc. VAT" }, { value: "ex", label: "Ex. VAT" }]} />
              </div>
            </Field>
          </Section>

          <Section title="Product cost & landed cost" description="Enter costs net of VAT. Supplier costs can be in another currency."
            action={<div className="w-[110px]"><Select size="sm" value={f.costCurrency} onChange={set("costCurrency")} aria-label="Supplier cost currency"
              options={[...new Set([currency, ...COST_CURRENCIES])].map((c) => ({ value: c, label: c }))} /></div>}>
            {needFx && (
              <div className="sm:col-span-2">
                {fx.isLoading ? <Skeleton className="h-10 w-full" /> : fx.error ? <ErrorState className="py-4" error={fx.error} onRetry={() => fx.refetch()} /> : fxRate ? (
                  <Notice tone="primary">
                    <span className="num">1 {currency} = {fxRate.toFixed(4)} {f.costCurrency}</span> · ECB reference rate {dateShort(fx.data?.date)}. Unit cost, supplier shipping and freight are converted to {currency}.
                    <SourceBadge source={fx.data?.source} className="ml-2 align-middle" />
                  </Notice>
                ) : <Notice tone="warning">No {f.costCurrency} rate was returned — choose another currency or convert manually.</Notice>}
              </div>
            )}
            <NF label="Unit cost" value={f.unit_cost} onChange={set("unit_cost")} prefix={costSym} placeholder="0.00" hint={!f.unit_cost ? "Required for a meaningful result" : undefined} />
            <NF label="Supplier shipping / unit" value={f.supplier_shipping} onChange={set("supplier_shipping")} prefix={costSym} />
            <NF label="International freight / unit" value={f.freight} onChange={set("freight")} prefix={costSym} />
            <Field label={<span className="inline-flex items-center gap-1.5">Import duty<InfoTip content="Percentage of customs value (unit cost + shipping + freight)." /></span>}
              hint={tariffInfo ? <span>From commodity <span className="font-mono">{tariffInfo.code}</span> (third-country rate)</span> : undefined}>
              <div className="flex gap-2">
                <NumInput value={f.duty_rate} onChange={(v) => { set("duty_rate")(v); setTariffInfo(null); }} suffix="%" placeholder="0" className="min-w-0 flex-1" aria-label="Import duty rate" />
                <Button variant="secondary" onClick={() => setTariffOpen(true)}><Landmark />Look up</Button>
              </div>
            </Field>
            <NF label="Prep / unit" value={f.prep} onChange={set("prep")} prefix={sym} />
            <NF label="Labelling / unit" value={f.labelling} onChange={set("labelling")} prefix={sym} />
            <NF label="Packaging / unit" value={f.packaging} onChange={set("packaging")} prefix={sym} />
            <NF label="Inbound to Amazon / unit" value={f.inbound_to_amazon} onChange={set("inbound_to_amazon")} prefix={sym} />
            <NF label="Other costs / unit" value={f.other_costs} onChange={set("other_costs")} prefix={sym} />
            <NF label="Import VAT rate" value={f.import_vat_rate} onChange={set("import_vat_rate")} suffix="%" placeholder={String(mkt?.vat_rate ?? 0)} hint="Blank uses the marketplace rate" />
          </Section>

          <Section title="Amazon fees" description={<>From your fee database. <Link href="/settings?tab=fees" className="text-primary hover:underline">Review fee rates</Link></>}
            action={<Segmented size="sm" value={f.fulfilment} onChange={set("fulfilment")} options={[{ value: "FBA", label: "FBA" }, { value: "FBM", label: "FBM" }]} />}>
            {f.fulfilment === "FBA" ? (
              <>
                <div className="sm:col-span-2">
                  <Segmented value={f.feeMode} onChange={set("feeMode")} options={[{ value: "dims", label: "From size & weight" }, { value: "manual", label: "Enter FBA fee" }]} />
                </div>
                {f.feeMode === "dims" ? (
                  <>
                    <NF label="Weight" value={f.weight_g} onChange={set("weight_g")} suffix="g" />
                    <div className="grid grid-cols-3 gap-2">
                      <NF label="L" value={f.length_cm} onChange={set("length_cm")} suffix="cm" />
                      <NF label="W" value={f.width_cm} onChange={set("width_cm")} suffix="cm" />
                      <NF label="H" value={f.height_cm} onChange={set("height_cm")} suffix="cm" />
                    </div>
                  </>
                ) : (
                  <NF label="FBA fulfilment fee / unit" value={f.fba_fee_override} onChange={set("fba_fee_override")} prefix={sym} className="sm:col-span-2"
                    hint="Use the figure from Seller Central's Revenue Calculator for this ASIN. Storage still needs dimensions." />
                )}
                <NF label="Storage months" value={f.storage_months} onChange={set("storage_months")} suffix="mo" tip="Average months a unit sits in a fulfilment centre. Uses the current season's monthly rate." />
                <NF label="Removal rate" value={f.removal_rate} onChange={set("removal_rate")} suffix="%" tip="Share of units you expect to remove or dispose of." />
                <NF label="Removal fee / removed unit" value={f.removal_fee} onChange={set("removal_fee")} prefix={sym} />
              </>
            ) : (
              <NF label="Your shipping cost / order" value={f.fbm_shipping} onChange={set("fbm_shipping")} prefix={sym} className="sm:col-span-2" />
            )}
            <NF label="Referral fee override" value={f.referral_fee_override} onChange={set("referral_fee_override")} prefix={sym} placeholder="Auto" hint="Blank uses the category rule" />
          </Section>

          <Section title="Advertising & returns">
            <Field label="Advertising (PPC)" className="sm:col-span-2" hint={f.adMode === "unit" && built.price ? <span className="num">= {pct(built.adPct, 1)} of price (TACoS)</span> : "Ad spend across all sales (TACoS), not ACoS on ad-attributed sales"}>
              <div className="flex flex-wrap gap-2">
                <NumInput value={f.ad_value} onChange={set("ad_value")} prefix={f.adMode === "unit" ? sym : undefined} suffix={f.adMode === "pct" ? "%" : undefined} className="min-w-[140px] flex-1" aria-label="Advertising" />
                <Segmented value={f.adMode} onChange={set("adMode")} options={[{ value: "pct", label: "% of price" }, { value: "unit", label: "Per unit" }]} />
              </div>
            </Field>
            <NF label="Returns rate" value={f.returns_pct} onChange={set("returns_pct")} suffix="%" />
            <NF label="Returned units resaleable" value={f.returns_recoverable_pct} onChange={set("returns_recoverable_pct")} suffix="%" tip="Each return also costs Amazon's refund administration fee (20% of the referral fee)." />
          </Section>

          <Section title="VAT">
            <div className="sm:col-span-2 space-y-4">
              <Switch checked={f.vat_registered} onCheckedChange={set("vat_registered")} label="VAT registered (standard accounting)"
                description="Registered: output VAT is removed from the price and input/import VAT is reclaimed. Not registered: nothing is removed from the price and VAT on costs and fees is a cost." />
              {!f.vat_registered && <Switch checked={f.fees_vatable} onCheckedChange={set("fees_vatable")} label="Amazon charges VAT on fees" description="UK and EU fees carry VAT that unregistered sellers can't reclaim." />}
            </div>
            <NF label="VAT rate" value={f.vat_rate} onChange={set("vat_rate")} suffix="%" placeholder={String(mkt?.vat_rate ?? 0)} hint={`Blank uses ${mkt?.name ?? "the marketplace"} standard rate (${mkt?.vat_rate ?? 0}%)`} />
            <Notice className="sm:col-span-2">The Flat Rate Scheme isn't modelled by the profit engine. Use the <Link href="/vat" className="text-primary hover:underline">VAT calculator</Link> to work out flat-rate VAT payable.</Notice>
          </Section>

          <Section title="Volume & cash" description="Optional — unlocks monthly profit, cash required and payback.">
            <NF label="Expected units / month" value={f.monthly_units} onChange={set("monthly_units")} />
            <NF label="Order quantity" value={f.order_quantity} onChange={set("order_quantity")} hint="Blank assumes 3 months of stock" />
          </Section>
        </div>

        {/* ---------------------------------------------------------- results */}
        <div ref={resultsRef} className="min-w-0 space-y-4 lg:sticky lg:top-[76px] lg:max-h-[calc(100vh-92px)] lg:overflow-y-auto lg:pb-2 [scrollbar-width:thin]">
          <Results r={r} loading={calc.isFetching} error={calc.error} onRetry={() => calc.refetch()} ready={built.ready} currency={currency} fulfilment={f.fulfilment}
            needsFx={needFx && !fxRate} form={f} vatRate={vatRate} fxRate={needFx ? fxRate : undefined} fxDate={fx.data?.date} adPct={built.adPct} />
        </div>
      </div>

      {/* scenarios & saved list span full width */}
      {built.ready && r?.scenarios && <ScenarioCard sc={r.scenarios} currency={currency} hasUnits={!!toNum(f.monthly_units)} />}

      <Card className="overflow-hidden">
        <CardHeader eyebrow="Saved" title="Saved calculations" description="Load one to edit it, or export them all from Reports → Profit calculations."
          action={<Button variant="ghost" size="sm" asChild><Link href="/reports">Reports</Link></Button>} />
        {saved.error ? <ErrorState error={saved.error} onRetry={() => saved.refetch()} /> : (
          <DataTable className="rounded-none border-x-0 border-b-0 shadow-none" dense loading={saved.isLoading} data={saved.data ?? []} getRowId={(c) => String(c.id)} columns={savedColumns(load, setRemoving, can("analyst"))}
            empty={<EmptyState compact icon={Calculator} title="No saved calculations yet" description="Run a calculation, then save it to compare products or build a report." />} />
        )}
      </Card>

      {/* mobile result bar */}
      {r && built.ready && (
        <button type="button" onClick={() => resultsRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-between gap-3 rounded-xl border border-line bg-surface/95 px-4 py-3 shadow-pop backdrop-blur lg:hidden">
          <span className="text-xs text-muted">Est. net profit / unit</span>
          <span className="flex items-center gap-3"><span className={cn("text-lg font-semibold num", r.net_profit < 0 ? "text-danger" : "text-fg")}>{money(r.net_profit, r.currency)}</span><span className="text-xs text-muted num">{pct(r.margin_pct, 1)} margin</span><ArrowDown className="size-4 text-subtle" /></span>
        </button>
      )}

      <ProductPicker open={pickOpen} onOpenChange={setPickOpen} onPick={pick} allMarketplaces title="Prefill from a product" description="Price, category and dimensions are copied from the product; your confirmed unit cost too, if set." />
      <TariffLookup open={tariffOpen} onOpenChange={setTariffOpen} onApply={(p, code, description) => { set("duty_rate")(String(p)); setTariffInfo({ code, description }); toast.success(`Duty set to ${p}%`, { description: `Commodity ${code}` }); }} />
      <Dialog open={saveOpen} onOpenChange={setSaveOpen} title="Save calculation" description="Saved with today's fee database version so you can compare later."
        footer={<><Button variant="secondary" onClick={() => setSaveOpen(false)}>Cancel</Button><Button loading={save.isPending} disabled={!saveName.trim()} onClick={() => save.mutate()}>Save</Button></>}>
        <div className="space-y-4">
          <Field label="Name"><Input autoFocus value={saveName} maxLength={200} onChange={(e) => setSaveName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && saveName.trim()) save.mutate(); }} /></Field>
          {product && <Notice>Linked to <b>{product.title}</b>. Saving also sets this product's unit cost to <b className="num">{money(built.payload.unit_cost as number, currency)}</b> and recalculates its estimated profit.</Notice>}
        </div>
      </Dialog>
      <ConfirmDialog open={!!removing} onOpenChange={(v) => !v && setRemoving(null)} title="Delete calculation?" description={<>Delete <b>{removing?.name}</b>? This can't be undone.</>}
        confirmLabel="Delete" loading={remove.isPending} onConfirm={() => removing && remove.mutate(removing.id)} />
    </div>
  );
}

function savedColumns(load: (c: Saved) => void, setRemoving: (c: Saved) => void, canEdit: boolean): ColumnDef<Saved>[] {
  return [
    { header: "Name", accessorKey: "name", cell: ({ row: { original: c } }) => <div className="min-w-[200px]"><div className="font-medium">{c.name}</div><div className="text-2xs text-subtle">{s(c.inputs?.marketplace)} · {c.inputs?.fulfilment ?? "FBA"}{c.product_id ? " · linked product" : ""}</div></div> },
    { header: "Price", id: "price", accessorFn: (c) => c.inputs?.selling_price, meta: { align: "right" }, cell: ({ row: { original: c } }) => money(c.inputs?.selling_price, c.currency ?? "GBP") },
    { header: "Est. net / unit", accessorKey: "net_profit", meta: { align: "right" }, cell: ({ row: { original: c } }) => <span className={cn("font-medium", (c.net_profit ?? 0) < 0 && "text-danger")}>{money(c.net_profit, c.currency ?? "GBP")}</span> },
    { header: "Margin", accessorKey: "margin_pct", meta: { align: "right" }, cell: ({ getValue }) => pct(getValue() as number, 1) },
    { header: "ROI", accessorKey: "roi_pct", meta: { align: "right" }, cell: ({ getValue }) => pct(getValue() as number, 0) },
    { header: "Saved", accessorKey: "created_at", cell: ({ getValue }) => <span className="text-muted">{dateShort(getValue() as string)}</span> },
    {
      id: "actions", header: "", enableSorting: false, cell: ({ row: { original: c } }) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => load(c)}><FolderOpen />Load</Button>
          {canEdit ? <Button variant="ghost" size="icon-sm" aria-label="Delete calculation" onClick={() => setRemoving(c)}><Trash2 /></Button>
            : <Tooltip content="Analyst role or higher required"><span><Button variant="ghost" size="icon-sm" aria-label="Delete calculation" disabled><Trash2 /></Button></span></Tooltip>}
        </div>
      ),
    },
  ];
}

/* ---------------------------------------------------------------- results panel */
function Results({ r, loading, error, onRetry, ready, currency, fulfilment, needsFx, form, vatRate, fxRate, fxDate, adPct }: {
  r?: CalcResp; loading: boolean; error: unknown; onRetry: () => void; ready: boolean; currency: string; fulfilment: "FBA" | "FBM"; needsFx: boolean;
  form: Form; vatRate: number; fxRate?: number; fxDate?: string; adPct: number;
}) {
  if (!ready) {
    return (
      <Card>
        <EmptyState icon={Calculator} title={needsFx ? "Waiting for an exchange rate" : "Enter a selling price to start"}
          description={needsFx ? "Supplier costs are in another currency. Once the rate loads, results appear here." : "Results update as you type: net profit, margin, ROI, break-evens, a cost waterfall and three scenarios."} />
      </Card>
    );
  }
  if (error && !r) return <Card><ErrorState error={error} onRetry={onRetry} /></Card>;
  if (!r) return <Card className="space-y-4 p-5"><Skeleton className="h-6 w-40" /><Skeleton className="h-12 w-48" /><Skeleton className="h-40 w-full" /><Skeleton className="h-28 w-full" /></Card>;

  const c = r.currency || currency;
  const m = (v: number | null | undefined) => money(v, c);
  const fulfil = Math.max(0, r.total_amazon_fees - r.referral_fee - r.storage_fee - r.removal_cost - r.fee_vat);
  const steps = [
    { label: "Price", value: r.gross_revenue, kind: "total" as const },
    { label: "VAT", value: r.output_vat }, { label: "Referral", value: r.referral_fee }, { label: fulfilment === "FBA" ? "FBA" : "Shipping", value: fulfil },
    { label: "Storage", value: r.storage_fee }, { label: "Removal", value: r.removal_cost }, { label: "Fee VAT", value: r.fee_vat },
    { label: "Landed", value: r.landed_cost }, { label: "Ads", value: r.advertising }, { label: "Returns", value: r.returns_cost }, { label: "Other", value: r.other_costs },
  ].filter((x) => x.kind === "total" || x.value > 0.004);
  const fbaSrc = r.fee_sources.find((x) => x.fee === "fba");
  const neg = r.net_profit < 0;
  const tierUnknown = fulfilment === "FBA" && r.fba_fee == null;

  const assumptions: string[] = [
    form.vat_registered ? `VAT registered: ${vatRate}% output VAT removed from the price; import VAT reclaimed.` : `Not VAT registered: price kept whole; import VAT${form.fees_vatable ? " and VAT on Amazon fees" : ""} treated as a cost.`,
    ...(form.priceMode === "ex" ? [`Price entered ex. VAT and grossed up at ${vatRate}%.`] : []),
    ...(fxRate ? [`Supplier costs converted from ${form.costCurrency} at ${fxRate.toFixed(4)} per ${currency} (ECB, ${dateShort(fxDate)}).`] : []),
    `Advertising at ${pct(adPct, 1)} of every sale (TACoS)${form.adMode === "unit" ? " — converted from your per-unit figure" : ""}.`,
    `Returns ${toNum(form.returns_pct) ?? 0}% with ${toNum(form.returns_recoverable_pct) ?? 50}% resaleable, plus Amazon's refund administration fee.`,
    ...(fulfilment === "FBA" ? [`Storage for ${toNum(form.storage_months) ?? 0} month(s) at this season's monthly rate.`] : []),
    form.feeMode === "manual" && fulfilment === "FBA" ? "FBA fee entered manually." : "Amazon fees from your fee database on today's date — not Amazon's per-ASIN quote.",
    ...(!toNum(form.unit_cost) ? ["No unit cost entered — profit excludes product cost."] : []),
    ...r.warnings.filter((w) => !w.startsWith("Assumes VAT registration")),
  ];

  return (
    <>
      <Card className={cn("relative overflow-hidden transition-opacity", loading && "opacity-80")}>
        <CardHeader eyebrow="Estimated result per unit" title={<span className="inline-flex items-center gap-2">Net profit<SourceBadge classification="estimated" /></span>}
          action={loading ? <Badge size="sm">Updating…</Badge> : undefined} />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <div className={cn("text-[34px] font-semibold leading-none tracking-tight num", neg ? "text-danger" : "text-fg")}>{m(r.net_profit)}</div>
            <div className="text-sm text-muted num">{pct(r.margin_pct, 1)} margin · {pct(r.roi_pct, 0)} ROI</div>
          </div>
          {neg && <Notice tone="danger" icon={AlertTriangle}>At these inputs each unit loses money. {r.break_even_price != null ? <>Break-even price is <b className="num">{m(r.break_even_price)}</b>.</> : "No break-even price was found within range."}</Notice>}
          {tierUnknown && <Notice tone="warning" icon={AlertTriangle}>FBA fee unknown — {r.size_tier}. Add weight and dimensions or enter the fee manually.</Notice>}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4">
            <Mini label="Break-even price" value={m(r.break_even_price)} tip="Lowest price (inc. VAT) at which net profit reaches zero, with all other inputs held." />
            <Mini label="Break-even ACoS" value={pct(r.break_even_acos_pct, 1)} tip="Ad spend as % of price at which profit reaches zero." />
            <Mini label="Max unit cost" value={m(r.max_unit_cost)} tip="Highest supplier unit cost that still breaks even at this price." />
            <Mini label="Landed cost" value={m(r.landed_cost)} />
            {r.monthly_profit != null && <Mini label="Monthly profit" value={m(r.monthly_profit)} sub={r.monthly_revenue != null ? `on ${m(r.monthly_revenue)} revenue` : undefined} />}
            {r.cash_required != null && <Mini label="Cash for stock" value={m(r.cash_required)} sub={r.months_to_recoup != null ? `recouped in ~${num(r.months_to_recoup, { decimals: 1 })} mo` : undefined} />}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Where the price goes" description="Price → VAT → Amazon fees → costs → net profit." />
        <CardBody><Waterfall steps={[...steps, { label: "Net", value: r.net_profit, kind: "result" }]} height={240} valueFormat={(v) => money(v, c, { decimals: Math.abs(v) >= 100 ? 0 : 2 })} /></CardBody>
      </Card>

      <Card>
        <CardHeader title="Fee & cost breakdown" action={<Button variant="ghost" size="sm" asChild><Link href="/settings?tab=fees">Fee database</Link></Button>} />
        <CardBody className="pt-0">
          <div className="divide-y divide-line">
            <Row label="Selling price" value={m(r.gross_revenue)} strong />
            {r.output_vat > 0 && <Row label="Output VAT" value={`−${m(r.output_vat)}`} />}
            <Row label="Net revenue" value={m(r.net_revenue)} strong />
            <Row label="Referral fee" sub={r.referral_rule || undefined} value={`−${m(r.referral_fee)}`} />
            <Row label={fulfilment === "FBA" ? "FBA fulfilment fee" : "Your shipping"} value={fulfilment === "FBA" && r.fba_fee == null ? "Unknown" : `−${m(fulfil)}`} tone={fulfilment === "FBA" && r.fba_fee == null ? "danger" : undefined}
              sub={fulfilment === "FBA" ? <span>{r.size_tier}{fbaSrc?.shipping_weight_g ? ` · ship weight ${num(fbaSrc.shipping_weight_g)} g` : ""}{fbaSrc?.source_url && <> · <a href={fbaSrc.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-primary hover:underline">rate card<ExternalLink className="size-3" /></a></>}</span> : undefined} />
            {r.storage_fee > 0 && <Row label="Storage" value={`−${m(r.storage_fee)}`} />}
            {r.removal_cost > 0 && <Row label="Removals" value={`−${m(r.removal_cost)}`} />}
            {r.fee_vat > 0 && <Row label="VAT on fees" sub="Not reclaimable when unregistered" value={`−${m(r.fee_vat)}`} />}
            <Row label="Total Amazon fees" value={`−${m(r.total_amazon_fees)}`} strong />
          </div>
          <Separator className="my-2" />
          <div className="divide-y divide-line">
            {Object.entries(r.landed_breakdown).filter(([k, v]) => k !== "import_vat_paid" && v > 0).map(([k, v]) => <Row key={k} label={LANDED_LABEL[k] ?? k.replace(/_/g, " ")} value={`−${m(v)}`} />)}
            {form.vat_registered && (r.landed_breakdown.import_vat_paid ?? 0) > 0 && <Row label="Import VAT paid" sub="Reclaimed — cash-flow only" value={m(r.landed_breakdown.import_vat_paid)} tone="muted" />}
            <Row label="Landed cost" value={`−${m(r.landed_cost)}`} strong />
            {r.advertising > 0 && <Row label="Advertising" value={`−${m(r.advertising)}`} />}
            {r.returns_cost > 0 && <Row label="Returns" value={`−${m(r.returns_cost)}`} />}
            {r.other_costs > 0 && <Row label="Other costs" value={`−${m(r.other_costs)}`} />}
            <Row label="Estimated net profit" value={m(r.net_profit)} strong tone={neg ? "danger" : undefined} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Assumptions" description="Estimates only. Actual results depend on Amazon's live fees, your real costs and demand." />
        <CardBody>
          <ul className="space-y-2 text-[13px] text-muted">
            {assumptions.map((a, i) => <li key={i} className="flex gap-2"><span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-line-strong" /><span>{a}</span></li>)}
          </ul>
        </CardBody>
      </Card>
    </>
  );
}

function Mini({ label, value, sub, tip }: { label: string; value: React.ReactNode; sub?: React.ReactNode; tip?: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 text-xs text-muted">{label}{tip && <InfoTip content={tip} />}</div>
      <div className="mt-0.5 truncate text-[15px] font-semibold num">{value}</div>
      {sub && <div className="truncate text-2xs text-subtle">{sub}</div>}
    </div>
  );
}

function ScenarioCard({ sc, currency, hasUnits }: { sc: Scenarios; currency: string; hasUnits: boolean }) {
  const cols = [["conservative", "Conservative"], ["expected", "Expected"], ["best", "Best case"]] as const;
  const c = sc.expected.currency || currency;
  const rows: [string, (o: ProfitOut) => React.ReactNode][] = [
    ["Selling price", (o) => money(o.gross_revenue, c)],
    ["Est. net profit / unit", (o) => <span className={cn("font-semibold", o.net_profit < 0 && "text-danger")}>{money(o.net_profit, c)}</span>],
    ["Margin", (o) => pct(o.margin_pct, 1)],
    ["ROI", (o) => pct(o.roi_pct, 0)],
    ["Advertising / unit", (o) => money(o.advertising, c)],
    ["Break-even price", (o) => money(o.break_even_price, c)],
    ...(hasUnits ? [["Monthly profit", (o: ProfitOut) => money(o.monthly_profit, c)] as [string, (o: ProfitOut) => React.ReactNode]] : []),
  ];
  return (
    <Card className="overflow-hidden">
      <CardHeader eyebrow="Sensitivity" title="Scenarios" description="How the estimate moves if price, cost, advertising, returns and volume shift." action={<SourceBadge classification="estimated" />} />
      <div className="overflow-x-auto border-t border-line">
        <table className="w-full min-w-[560px] text-[13px]">
          <thead><tr className="bg-surface-2">
            <th className="h-9 px-4 text-left text-2xs font-semibold uppercase tracking-[0.06em] text-subtle">Metric</th>
            {cols.map(([k, l]) => <th key={k} className={cn("h-9 px-4 text-right text-2xs font-semibold uppercase tracking-[0.06em]", k === "expected" ? "text-fg" : "text-subtle")}>{l}</th>)}
          </tr></thead>
          <tbody>
            {rows.map(([label, fn]) => (
              <tr key={label} className="border-t border-line">
                <td className="h-10 px-4 text-muted">{label}</td>
                {cols.map(([k]) => <td key={k} className={cn("h-10 px-4 text-right num", k === "expected" && "bg-primary-soft/30")}>{fn(sc[k])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-2 border-t border-line px-5 py-3 text-xs text-muted sm:grid-cols-3">
        <div><b className="text-fg">Conservative:</b> {sc.assumptions.conservative}</div>
        <div><b className="text-fg">Expected:</b> your inputs as entered</div>
        <div><b className="text-fg">Best case:</b> {sc.assumptions.best}</div>
      </div>
    </Card>
  );
}
