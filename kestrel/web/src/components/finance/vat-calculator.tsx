"use client";
/* VAT calculator: inclusive / exclusive amounts (/vat/calculate), standard or Flat Rate Scheme, marketplace rates. */
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ArrowRight, Copy, Percent } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, PageHeader } from "@/components/ui/data";
import { InfoTip } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Field, Segmented, Skeleton, Switch } from "@/components/ui/primitives";
import { post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { cn, currencySymbol, money, pct } from "@/lib/utils";
import { Notice, NumInput, Row, toNum, useDebounced } from "./shared";

type VatResp = { gross: number; net: number; vat: number; rate: number };

export function VatCalculator() {
  const { marketplace, marketplaces } = useSession();
  const [mk, setMk] = React.useState(marketplace);
  React.useEffect(() => setMk(marketplace), [marketplace]);
  const m = marketplaces.find((x) => x.code === mk);
  const currency = m?.currency ?? "GBP";
  const [amount, setAmount] = React.useState("");
  const [mode, setMode] = React.useState<"inclusive" | "exclusive">("inclusive");
  const [rateMode, setRateMode] = React.useState<"marketplace" | "custom">("marketplace");
  const [custom, setCustom] = React.useState("");
  const [scheme, setScheme] = React.useState<"standard" | "flat">("standard");
  const [flat, setFlat] = React.useState("");
  const [firstYear, setFirstYear] = React.useState(false);

  const rate = rateMode === "custom" ? toNum(custom) : m?.vat_rate;
  const amt = toNum(amount);
  const body = useDebounced({ amount: amt, rate, mode }, 250);
  const q = useQuery({
    queryKey: ["vat-calc", body], queryFn: () => post<VatResp>("/vat/calculate", body),
    enabled: body.amount !== undefined && body.amount >= 0 && body.rate !== undefined && body.rate >= 0, placeholderData: keepPreviousData,
  });
  const r = q.data;
  const flatPct = toNum(flat);
  const effFlat = flatPct !== undefined ? Math.max(0, flatPct - (firstYear ? 1 : 0)) : undefined;
  const flatPayable = r && effFlat !== undefined ? Math.round(r.gross * effFlat) / 100 : undefined;
  const copy = (v: number) => { navigator.clipboard.writeText(v.toFixed(2)).then(() => toast.success("Copied"), () => toast.error("Couldn't copy")); };
  const sym = currencySymbol(currency);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Financial tools" title="VAT Calculator" description="Add or remove VAT at any marketplace rate, and work out what you'd pay under the Flat Rate Scheme."
        actions={<Button variant="secondary" asChild><Link href="/profit">Profit calculator<ArrowRight /></Link></Button>} />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader title="Amount" />
          <CardBody className="space-y-5">
            <Field label="Amount" aside={<Segmented size="sm" value={mode} onChange={setMode} options={[{ value: "inclusive", label: "Includes VAT" }, { value: "exclusive", label: "Excludes VAT" }]} />}>
              <NumInput value={amount} onChange={setAmount} prefix={sym} placeholder="0.00" className="h-11 text-base" invalid={amount !== "" && amt === undefined} aria-label="Amount" />
            </Field>
            <Field label="VAT rate" aside={<Segmented size="sm" value={rateMode} onChange={setRateMode} options={[{ value: "marketplace", label: "Marketplace" }, { value: "custom", label: "Custom" }]} />}>
              {rateMode === "marketplace" ? (
                <div className="flex flex-wrap gap-1.5">
                  {marketplaces.map((x) => (
                    <button key={x.code} type="button" onClick={() => setMk(x.code)} aria-pressed={x.code === mk}
                      className={cn("inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] transition-colors", x.code === mk ? "border-primary bg-primary-soft text-primary" : "border-line text-muted hover:border-line-strong hover:text-fg")}>
                      <span className="font-medium">{x.code}</span><span className="num">{pct(x.vat_rate, x.vat_rate % 1 ? 1 : 0)}</span>
                    </button>
                  ))}
                  {!marketplaces.length && <Skeleton className="h-8 w-full" />}
                </div>
              ) : (
                <NumInput value={custom} onChange={setCustom} suffix="%" placeholder="e.g. 5" aria-label="Custom VAT rate" invalid={custom !== "" && toNum(custom) === undefined} />
              )}
            </Field>
            <div className="space-y-3 rounded-lg border border-line p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[13px] font-medium">VAT scheme</div>
                <Segmented size="sm" value={scheme} onChange={setScheme} options={[{ value: "standard", label: "Standard" }, { value: "flat", label: "Flat Rate Scheme" }]} />
              </div>
              {scheme === "flat" ? (
                <>
                  <Field label={<span className="inline-flex items-center gap-1.5">Your flat rate<InfoTip content="The percentage HMRC set for your business sector. Limited cost traders use 16.5%." /></span>}>
                    <NumInput value={flat} onChange={setFlat} suffix="%" placeholder="e.g. 7.5" aria-label="Flat rate" invalid={flat !== "" && flatPct === undefined} />
                  </Field>
                  <Switch checked={firstYear} onCheckedChange={setFirstYear} label="First year of VAT registration" description="HMRC gives a 1 percentage point discount in your first year." />
                </>
              ) : <p className="text-xs text-muted">Charge VAT on sales and reclaim VAT on purchases. The figures on the right show the VAT inside this amount.</p>}
            </div>
          </CardBody>
        </Card>

        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader title="Result" description={rate !== undefined ? `${m && rateMode === "marketplace" ? `${m.name} · ` : ""}${pct(rate, rate % 1 ? 1 : 0)} VAT` : undefined}
              action={q.isFetching ? <Badge size="sm">Calculating…</Badge> : undefined} />
            <CardBody>
              {amt === undefined || rate === undefined ? (
                <EmptyState compact icon={Percent} title={rate === undefined ? "Enter a VAT rate" : "Enter an amount"} description="Results update as you type." />
              ) : q.error && !r ? <ErrorState error={q.error} onRetry={() => q.refetch()} /> : !r ? <Skeleton className="h-36 w-full" /> : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {([["Net (ex. VAT)", r.net], ["VAT", r.vat], ["Gross (inc. VAT)", r.gross]] as const).map(([l, v], i) => (
                      <div key={l} className={cn("group rounded-lg border border-line p-3", i === 1 && "bg-primary-soft/40")}>
                        <div className="flex items-center justify-between text-xs text-muted">{l}<button type="button" aria-label={`Copy ${l}`} onClick={() => copy(v)} className="text-subtle opacity-0 transition-opacity hover:text-fg group-hover:opacity-100 focus:opacity-100"><Copy className="size-3.5" /></button></div>
                        <div className="mt-1 text-xl font-semibold num">{money(v, currency)}</div>
                      </div>
                    ))}
                  </div>
                  {scheme === "flat" && (
                    effFlat === undefined ? <Notice>Enter your flat rate to see what you'd pay HMRC.</Notice> : (
                      <div className="rounded-lg border border-line p-4">
                        <div className="mb-1 text-[13px] font-medium">Flat Rate Scheme</div>
                        <div className="divide-y divide-line">
                          <Row label="VAT-inclusive turnover" value={money(r.gross, currency)} />
                          <Row label={`Flat rate applied${firstYear ? " (incl. first-year discount)" : ""}`} value={pct(effFlat, 1)} />
                          <Row label="VAT payable to HMRC" value={money(flatPayable, currency)} strong />
                          <Row label="VAT charged to the customer" value={money(r.vat, currency)} />
                          <Row label="Difference you keep" value={money(r.vat - (flatPayable ?? 0), currency)} strong tone={r.vat - (flatPayable ?? 0) < 0 ? "danger" : "success"} />
                        </div>
                        <p className="mt-2 text-xs text-subtle">Flat-rate VAT = VAT-inclusive turnover × your flat rate. Input VAT isn't reclaimable under the scheme, except on single capital purchases over £2,000.</p>
                      </div>
                    )
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader title="Marketplace standard rates" description="Used by default across Kestrel's profit calculations. Reduced rates for some product types aren't applied automatically." />
            {!marketplaces.length ? <CardBody><Skeleton className="h-32 w-full" /></CardBody> : (
              <div className="overflow-x-auto border-t border-line">
                <table className="w-full text-[13px]">
                  <thead><tr className="bg-surface-2 text-2xs font-semibold uppercase tracking-[0.06em] text-subtle"><th className="h-9 px-4 text-left">Marketplace</th><th className="h-9 px-4 text-left">Currency</th><th className="h-9 px-4 text-right">Standard VAT / tax</th><th className="h-9 px-4" /></tr></thead>
                  <tbody>
                    {marketplaces.map((x) => (
                      <tr key={x.code} className={cn("border-t border-line", x.code === mk && rateMode === "marketplace" && "bg-primary-soft/30")}>
                        <td className="h-10 px-4"><span className="font-medium">{x.name}</span> <span className="text-subtle">· {x.domain}</span></td>
                        <td className="h-10 px-4 text-muted">{x.currency}</td>
                        <td className="h-10 px-4 text-right num">{x.vat_rate ? pct(x.vat_rate, x.vat_rate % 1 ? 1 : 0) : <span className="text-subtle">0% · no VAT set</span>}</td>
                        <td className="h-10 px-4 text-right"><Button variant="ghost" size="xs" onClick={() => { setRateMode("marketplace"); setMk(x.code); }}>Use</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
