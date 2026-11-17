"use client";
/* FBA fee calculator: dimensions + weight → size tier, fulfilment fee, storage and referral fee (/fba/calculate). */
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, Box, Calculator, Database, ExternalLink, Ruler, Scale } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { EmptyState, ErrorState, PageHeader, SourceBadge } from "@/components/ui/data";
import { InfoTip, Select } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Field, Segmented, Skeleton } from "@/components/ui/primitives";
import { get, post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { cn, currencySymbol, dateShort, money, num } from "@/lib/utils";
import { Notice, NumInput, Row, toNum } from "./shared";

type FbaResp = {
  currency: string; fba_fee: number | null; size_tier: string; shipping_weight_g: number; dimensional_weight_g: number; unit_weight_g: number | null;
  storage_month_now: number; storage_month_offpeak: number; storage_month_peak: number; referral_fee: number; referral_rule: string;
  source_url: string; note: string; classification: string; basis: string;
};
type FeeRow = { id: number; fee_type: string; size_tier: string; effective_from: string; effective_to: string | null; source_url: string; is_custom: boolean; season: string };
type FeesResp = { fees: FeeRow[]; referral: { category: string; effective_from: string; effective_to: string | null; is_custom: boolean; source_url: string }[] };

const NOTE: Record<string, string> = {
  missing_dimensions: "Add the unit weight or all three dimensions to find a size tier.",
  no_schedule: "Your fee database has no FBA rows for this marketplace yet. Add them in Settings → Fee database.",
  no_tier: "These measurements fall outside the tiers in your fee database. Check Amazon's rate card and add the tier in Settings → Fee database.",
};
const today = () => new Date().toISOString().slice(0, 10);
const active = (r: { effective_from: string; effective_to: string | null }) => r.effective_from <= today() && (!r.effective_to || r.effective_to >= today());

export function FbaCalculator() {
  const { marketplace, marketplaces } = useSession();
  const [mk, setMk] = React.useState(marketplace);
  React.useEffect(() => setMk(marketplace), [marketplace]);
  const [dims, setDims] = React.useState({ l: "", w: "", h: "", weight: "", price: "" });
  const [wUnit, setWUnit] = React.useState<"g" | "kg">("g");
  const [dUnit, setDUnit] = React.useState<"cm" | "in">("cm");
  const [category, setCategory] = React.useState("Default");
  const [submitted, setSubmitted] = React.useState<Record<string, unknown> | null>(null);
  const currency = marketplaces.find((m) => m.code === mk)?.currency ?? "GBP";

  const feesQ = useQuery({ queryKey: ["fees", mk], queryFn: () => get<FeesResp>("/fees", { marketplace: mk }), staleTime: 300_000 });
  const cats = React.useMemo(() => [...new Set(["Default", ...(feesQ.data?.referral ?? []).map((r) => r.category)])].sort((a, b) => (a === "Default" ? -1 : b === "Default" ? 1 : a.localeCompare(b))), [feesQ.data]);

  const toCm = (v: string) => { const n = toNum(v); return n === undefined ? undefined : dUnit === "in" ? n * 2.54 : n; };
  const toG = (v: string) => { const n = toNum(v); return n === undefined ? undefined : wUnit === "kg" ? n * 1000 : n; };
  const payload = { marketplace: mk, length_cm: toCm(dims.l), width_cm: toCm(dims.w), height_cm: toCm(dims.h), weight_g: toG(dims.weight), price: toNum(dims.price), category };
  const canCalc = !!payload.weight_g || !!(payload.length_cm && payload.width_cm && payload.height_cm);

  const q = useQuery({ queryKey: ["fba-calc", submitted], queryFn: () => post<FbaResp>("/fba/calculate", submitted), enabled: !!submitted });
  const run = (e?: React.FormEvent) => { e?.preventDefault(); if (canCalc) setSubmitted({ ...payload }); };

  const r = q.data;
  const tierRows = (feesQ.data?.fees ?? []).filter((f) => f.fee_type === "fba" && r && f.size_tier === r.size_tier && active(f));
  const custom = tierRows.some((f) => f.is_custom);
  const effective = tierRows.filter((f) => !custom || f.is_custom).map((f) => f.effective_from).sort().pop();
  const refRow = (feesQ.data?.referral ?? []).find((x) => x.category === (submitted?.category as string) && active(x));
  const sym = currencySymbol(currency);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Financial tools" title="FBA Fee Calculator"
        description="Find the size tier and per-unit Fulfilment by Amazon fees from your effective-dated fee database."
        actions={<><Button variant="secondary" asChild><Link href="/settings?tab=fees"><Database />Fee database</Link></Button><Button asChild><Link href="/profit">Full profit calculation<ArrowRight /></Link></Button></>} />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <Card>
          <CardHeader title="Package" description="Packaged dimensions and weight, as Amazon measures them." />
          <CardBody>
            <form onSubmit={run} className="space-y-4">
              <Field label="Marketplace"><Select value={mk} onChange={setMk} options={marketplaces.map((m) => ({ value: m.code, label: `${m.name} · ${m.currency}` }))} aria-label="Marketplace" /></Field>
              <Field label="Dimensions" aside={<Segmented size="sm" value={dUnit} onChange={setDUnit} options={[{ value: "cm", label: "cm" }, { value: "in", label: "in" }]} />}>
                <div className="grid grid-cols-3 gap-2">
                  <NumInput value={dims.l} onChange={(v) => setDims({ ...dims, l: v })} prefix="L" suffix={dUnit} aria-label="Length" />
                  <NumInput value={dims.w} onChange={(v) => setDims({ ...dims, w: v })} prefix="W" suffix={dUnit} aria-label="Width" />
                  <NumInput value={dims.h} onChange={(v) => setDims({ ...dims, h: v })} prefix="H" suffix={dUnit} aria-label="Height" />
                </div>
              </Field>
              <Field label="Unit weight" aside={<Segmented size="sm" value={wUnit} onChange={setWUnit} options={[{ value: "g", label: "g" }, { value: "kg", label: "kg" }]} />}>
                <NumInput value={dims.weight} onChange={(v) => setDims({ ...dims, weight: v })} suffix={wUnit} aria-label="Weight" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Selling price" hint="Optional — for the referral fee"><NumInput value={dims.price} onChange={(v) => setDims({ ...dims, price: v })} prefix={sym} aria-label="Selling price" /></Field>
                <Field label="Referral category"><Select value={category} onChange={setCategory} options={cats.map((c) => ({ value: c, label: c }))} aria-label="Referral category" /></Field>
              </div>
              <Button type="submit" className="w-full" disabled={!canCalc} loading={q.isFetching}><Calculator />Calculate fees</Button>
              {!canCalc && <p className="text-center text-xs text-subtle">Enter the weight or all three dimensions.</p>}
            </form>
          </CardBody>
        </Card>

        <div className="min-w-0 space-y-4">
          {!submitted ? (
            <Card><EmptyState icon={Box} title="Enter a package to see its fees" description="Kestrel works out the dimensional weight, picks the size tier and applies the fulfilment, storage and referral rates in force today." /></Card>
          ) : q.isLoading ? (
            <Card className="space-y-4 p-5"><Skeleton className="h-6 w-48" /><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div><Skeleton className="h-32 w-full" /></Card>
          ) : q.error ? (
            <Card><ErrorState error={q.error} onRetry={() => q.refetch()} /></Card>
          ) : r && (
            <>
              <Card>
                <CardHeader eyebrow="Size tier" title={<span className="flex flex-wrap items-center gap-2">{r.size_tier}{custom && <Badge tone="violet" size="sm">Your override</Badge>}</span>}
                  action={<SourceBadge classification={r.classification} />} />
                <CardBody className="space-y-4">
                  {r.fba_fee == null && <Notice tone="warning" icon={AlertTriangle}>{NOTE[r.note] ?? "No FBA fee could be found for this package."}</Notice>}
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Tile label="Fulfilment fee" value={r.fba_fee == null ? "—" : money(r.fba_fee, r.currency)} strong />
                    <Tile label="Referral fee" value={submitted.price ? money(r.referral_fee, r.currency) : "—"} sub={submitted.price ? undefined : "Add a price"} />
                    <Tile label="Storage / month" value={money(r.storage_month_now, r.currency, { decimals: 3 })} sub={new Date().getMonth() >= 9 ? "Peak season (Oct–Dec)" : "Off-peak (Jan–Sep)"} />
                    <Tile label="Fees / unit" value={r.fba_fee == null ? "—" : money(r.fba_fee + (submitted.price ? r.referral_fee : 0), r.currency)} sub="Fulfilment + referral" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-line p-4">
                      <div className="mb-1 flex items-center gap-2 text-[13px] font-medium"><Scale className="size-4 text-subtle" />Weight used</div>
                      <div className="divide-y divide-line">
                        <Row label="Unit weight" value={r.unit_weight_g != null ? `${num(r.unit_weight_g)} g` : "—"} />
                        <Row label={<span className="inline-flex items-center gap-1">Dimensional weight<InfoTip content="L × W × H (cm) ÷ 5,000, in kg. Envelope and small standard tiers use unit weight only." /></span>} value={r.dimensional_weight_g ? `${num(r.dimensional_weight_g)} g` : "—"} />
                        <Row label="Shipping weight" value={`${num(r.shipping_weight_g)} g`} strong />
                      </div>
                    </div>
                    <div className="rounded-lg border border-line p-4">
                      <div className="mb-1 flex items-center gap-2 text-[13px] font-medium"><Ruler className="size-4 text-subtle" />Monthly storage per unit</div>
                      <div className="divide-y divide-line">
                        <Row label="Off-peak (Jan–Sep)" value={money(r.storage_month_offpeak, r.currency, { decimals: 3 })} />
                        <Row label="Peak (Oct–Dec)" value={money(r.storage_month_peak, r.currency, { decimals: 3 })} />
                        <Row label="Referral rule" value={<span className="text-[13px]">{r.referral_rule || "—"}</span>} />
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Fee source" description={r.basis} />
                <CardBody className="space-y-3">
                  <div className="divide-y divide-line">
                    <Row label="Fee database" value={custom ? "Your organisation's override" : "Kestrel platform rates"} />
                    <Row label="Fulfilment rate effective from" value={feesQ.isLoading ? <Skeleton className="h-4 w-24" /> : effective ? dateShort(effective) : "—"} />
                    {refRow && <Row label="Referral rule effective from" value={dateShort(refRow.effective_from)} />}
                    <Row label="Calculated for" value={dateShort(new Date().toISOString())} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {r.source_url && <Button variant="secondary" size="sm" asChild><a href={r.source_url} target="_blank" rel="noreferrer">Amazon rate card<ExternalLink /></a></Button>}
                    <Button variant="ghost" size="sm" asChild><Link href="/settings?tab=fees">Review or override rates in Settings → Fee database<ArrowRight /></Link></Button>
                  </div>
                </CardBody>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Tile({ label, value, sub, strong }: { label: string; value: React.ReactNode; sub?: React.ReactNode; strong?: boolean }) {
  return (
    <div className={cn("rounded-lg border border-line p-3", strong && "bg-primary-soft/40")}>
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-xl font-semibold num">{value}</div>
      {sub && <div className="mt-0.5 text-2xs text-subtle">{sub}</div>}
    </div>
  );
}
