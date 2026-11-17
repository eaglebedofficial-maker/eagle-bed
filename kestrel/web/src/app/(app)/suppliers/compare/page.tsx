"use client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Crown, GitCompareArrows, Info, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
import { EmptyState, PageHeader, ScoreRing, SourceBadge } from "@/components/ui/data";
import { Select } from "@/components/ui/overlay";
import { Badge, Button, Card, Field, Input, Skeleton } from "@/components/ui/primitives";
import { SupplierPicker, useDebounced } from "@/components/suppliers/pickers";
import { AsyncError } from "@/components/suppliers/states";
import { countryName, RiskBadge, SupplierStatusBadge, typeLabel, VatBadge, type SupplierDetail } from "@/components/suppliers/status";
import { get } from "@/lib/api";
import { ago, cn, money, num } from "@/lib/utils";

type Comparison = {
  unit_cost: number | null; unit_cost_original: number | null; original_currency: string; shipping_total: number | null; landed_unit_estimate: number | null;
  moq: number | null; lead_time_days: number | null; quote_id: number | null; fx_rate: number | null; fx_date: string | null;
};
type Row = SupplierDetail & { comparison: Comparison; matched_products?: number; has_authorisation_evidence?: boolean; documentation?: string };
type CompareRes = { currency: string; quantity: number; suppliers: Row[]; fx_source: { provider: string; date: string | null }; note: string };

const CURRENCIES = ["GBP", "EUR", "USD"].map((c) => ({ value: c, label: c }));

function CompareInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const ids = (sp.get("ids") || "").split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 10);
  const [qty, setQty] = useState(sp.get("quantity") || "500");
  const [currency, setCurrency] = useState(sp.get("currency") || "GBP");
  const dqty = useDebounced(qty, 400);
  const quantity = Math.max(1, Math.round(Number(dqty) || 500));
  const setIds = (next: number[]) => router.replace(next.length ? `/suppliers/compare?ids=${next.join(",")}` : "/suppliers/compare", { scroll: false });
  const r = useQuery({
    queryKey: ["suppliers", "compare", ids, quantity, currency], enabled: ids.length > 0, placeholderData: keepPreviousData,
    queryFn: () => get<CompareRes>("/suppliers/compare/data", { ids, quantity, currency }),
  });
  const rows = r.data?.suppliers ?? [];
  const landed = rows.map((s) => s.comparison.landed_unit_estimate).filter((x): x is number => x != null);
  const best = landed.length > 1 ? Math.min(...landed) : null;
  const bestScore = rows.length > 1 ? Math.max(...rows.map((s) => s.score ?? -1)) : null;

  const metrics: { label: string; hint?: string; render: (s: Row) => ReactNode }[] = [
    { label: "Status", render: (s) => <SupplierStatusBadge status={s.status} size="sm" /> },
    { label: "Score", hint: "Evidence summary, not authorisation", render: (s) => <div className="flex items-center gap-2"><ScoreRing score={s.score} size={38} stroke={3.5} />{bestScore != null && s.score === bestScore && s.score != null && <Badge size="sm" tone="primary">Highest</Badge>}</div> },
    { label: "Risk", render: (s) => <RiskBadge level={s.risk_level} size="sm" /> },
    {
      label: `Landed unit estimate (${currency})`, hint: `Unit price + quoted shipping spread over ${num(quantity)} units`,
      render: (s) => {
        const c = s.comparison;
        if (c.landed_unit_estimate == null) return <span className="text-xs text-subtle">{c.unit_cost_original != null ? `No ${c.original_currency}→${currency} rate` : "No price on file"}</span>;
        return <span className={cn("inline-flex items-center gap-1.5 text-[15px] font-semibold num", best != null && c.landed_unit_estimate === best && "text-primary")}>{money(c.landed_unit_estimate, currency)}{best != null && c.landed_unit_estimate === best && <Crown className="size-3.5" />}</span>;
      },
    },
    {
      label: "Unit price", render: (s) => {
        const c = s.comparison;
        if (c.unit_cost_original == null) return "—";
        return <div className="num"><div>{money(c.unit_cost, currency)}</div>{c.original_currency !== currency && <div className="text-xs text-subtle">{money(c.unit_cost_original, c.original_currency)} at {c.fx_rate ? c.fx_rate.toFixed(4) : "—"}</div>}<div className="text-2xs text-subtle">{c.quote_id ? `From quotation #${c.quote_id}` : "From supplier record"}</div></div>;
      },
    },
    { label: "Shipping (total)", render: (s) => <span className="num">{s.comparison.shipping_total != null ? money(s.comparison.shipping_total, currency) : "—"}</span> },
    { label: `Order value at ${num(quantity)} units`, render: (s) => <span className="num">{s.comparison.landed_unit_estimate != null ? money(s.comparison.landed_unit_estimate * quantity, currency) : "—"}</span> },
    {
      label: "MOQ", render: (s) => s.comparison.moq == null ? "—" : <span className="inline-flex items-center gap-2 num">{num(s.comparison.moq)}{s.comparison.moq > quantity && <Badge size="sm" tone="warning">Above your quantity</Badge>}</span>,
    },
    { label: "Lead time", render: (s) => <span className="num">{s.comparison.lead_time_days != null ? `${s.comparison.lead_time_days} days` : "—"}</span> },
    { label: "Country", render: (s) => countryName(s.country) },
    { label: "Type", render: (s) => typeLabel(s.supplier_type) },
    { label: "Registry", render: (s) => s.registry_checked_at ? <span className="text-[13px]">{s.registry_data?.status ? <span className="capitalize">{s.registry_data.status}</span> : "Checked"} · {ago(s.registry_checked_at)}</span> : <span className="text-subtle">Not checked</span> },
    { label: "VAT", render: (s) => <VatBadge valid={s.vat_valid} size="sm" /> },
    { label: "Years trading", render: (s) => <span className="num">{s.years_trading ?? "—"}</span> },
    { label: "Brand evidence", render: (s) => s.has_authorisation_evidence ? <Badge size="sm" tone="primary">On file</Badge> : <span className="text-subtle">None</span> },
    { label: "Invoice assessment", render: (s) => !s.documentation || s.documentation === "none" ? <span className="text-subtle">Not assessed</span> : <span className="capitalize">{s.documentation} risk</span> },
    { label: "Samples", render: (s) => s.sample_available == null ? <span className="text-subtle">Unknown</span> : s.sample_available ? "Available" : "No" },
    { label: "Certifications", render: (s) => (s.certifications ?? []).join(", ") || <span className="text-subtle">None recorded</span> },
  ];

  return (
    <>
      <PageHeader eyebrow={<Link href="/suppliers" className="inline-flex items-center gap-1 hover:text-fg"><ArrowLeft className="size-3" />Supplier intelligence</Link>} title="Supplier Comparison"
        description="Compare up to 10 suppliers side by side on estimated landed cost, MOQ, lead time, score and risk. Prices come from the latest quotation, or the supplier record if there isn't one." />
      <div className="space-y-6">
        <Card className="flex flex-wrap items-end gap-3 p-4">
          <Field label="Add a supplier" className="w-full sm:w-80"><SupplierPicker value={null} exclude={ids} placeholder={ids.length >= 10 ? "Maximum of 10 reached" : "Search your suppliers"} onChange={(p) => p && ids.length < 10 && setIds([...ids, p.id])} /></Field>
          <Field label="Order quantity" className="w-36"><Input inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/[^\d]/g, ""))} suffix="units" /></Field>
          <Field label="Currency" className="w-28"><Select value={currency} onChange={setCurrency} options={CURRENCIES} /></Field>
          {ids.length > 0 && <Button variant="ghost" onClick={() => setIds([])}>Clear all</Button>}
          <div className="ml-auto flex items-center gap-2 text-xs text-muted"><SourceBadge classification="estimated" source={{ provider: "Kestrel", classification: "estimated", note: "Landed cost is an estimate from your quotations and records." }} />{r.data?.fx_source.date && <span>FX: {r.data.fx_source.provider}, {r.data.fx_source.date}</span>}</div>
        </Card>

        {ids.length === 0 ? (
          <Card><EmptyState icon={GitCompareArrows} title="Pick suppliers to compare" description="Add suppliers above, or select several in the Supplier Finder table and choose Compare." action={<Button variant="secondary" asChild><Link href="/suppliers">Open Supplier Finder</Link></Button>} /></Card>
        ) : r.isLoading ? (
          <Card className="space-y-2 p-4">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</Card>
        ) : r.error ? (
          <Card><AsyncError error={r.error} onRetry={() => r.refetch()} /></Card>
        ) : rows.length === 0 ? (
          <Card><EmptyState title="No suppliers to compare" description="These suppliers could not be found." action={<Button variant="secondary" onClick={() => setIds([])}>Start again</Button>} /></Card>
        ) : (
          <>
            <Card className={cn("overflow-hidden", r.isFetching && "opacity-80")}>
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0 text-[13px]">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 min-w-[170px] border-b border-r border-line bg-surface-2 px-4 py-3 text-left text-2xs font-semibold uppercase tracking-wider text-subtle">Supplier</th>
                      {rows.map((s) => (
                        <th key={s.id} className="min-w-[210px] border-b border-line bg-surface-2 px-4 py-3 text-left align-top font-normal">
                          <div className="flex items-start gap-2">
                            <Link href={`/suppliers/${s.id}`} className="min-w-0 flex-1 text-sm font-semibold hover:text-primary"><span className="line-clamp-2">{s.name}</span></Link>
                            <Button variant="ghost" size="icon-sm" aria-label={`Remove ${s.name}`} onClick={() => setIds(ids.filter((i) => i !== s.id))}><X /></Button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((m) => (
                      <tr key={m.label} className="hover:bg-surface-2/50">
                        <th scope="row" className="sticky left-0 z-10 border-b border-r border-line bg-surface px-4 py-3 text-left align-top text-xs font-medium text-muted">
                          {m.label}{m.hint && <div className="mt-0.5 text-2xs font-normal text-subtle">{m.hint}</div>}
                        </th>
                        {rows.map((s) => <td key={s.id} className="border-b border-line px-4 py-3 align-top">{m.render(s)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <p className="flex gap-2 text-xs text-muted"><Info className="mt-0.5 size-3.5 shrink-0" />{r.data!.note}</p>
          </>
        )}
      </div>
    </>
  );
}

export default function SupplierComparePage() {
  return <Suspense><CompareInner /></Suspense>;
}
