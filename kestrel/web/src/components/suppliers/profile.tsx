"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownLeft, ArrowRight, ArrowUpRight, BadgeCheck, Building2, ClipboardList, ExternalLink, FileCheck2, FileText, Link2, Mail, MessageSquare, Package, Phone, Plus, ShieldCheck,
  StickyNote, Trash2, Upload, UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState, KeyValue, SourceBadge } from "@/components/ui/data";
import { ConfirmDialog, Dialog, Select } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Field, Input, Progress, Switch, Textarea } from "@/components/ui/primitives";
import { del, errorMessage, post } from "@/lib/api";
import { ago, dateShort, money, num } from "@/lib/utils";
import { ACCEPTED_DOCS, openDocument, uploadDocument } from "./documents";
import { ProductPicker, type PickedProduct } from "./pickers";
import { GatedButton } from "./states";
import { AuthStatusBadge, countryName, hostOf, RiskBadge, VatBadge, type SupplierDetail } from "./status";

/* ---------------------------------------------------------------- Types */
export type Evidence = { id: number; kind: string; summary: string; source_url: string; source_name: string; classification: string; confidence: string; supports_authorisation: boolean; retrieved_at: string };
export type Contact = { id: number; name: string; role: string; email: string; phone: string; source: string };
export type SupProduct = { id: number; description: string; sku: string; ean: string; unit_price: number | null; currency: string; moq: number | null; sample_available: boolean | null; product_id: number | null };
export type Authorisation = { id: number; brand: string; brand_id: number; evidence_type: string; status: string; statement: string; source_url: string; verified_at: string | null };
export type Quote = { id: number; product_desc: string; status: string; quantity: number | null; quoted_price: number | null; negotiated_price: number | null; currency: string; moq: number | null; lead_time_days: number | null; shipping_cost: number | null; shipping_terms: string | null; sample_status: string | null; updated_at: string };
export type SupDoc = { id: number; kind: string; filename: string; uploaded_at: string; pages: number; assessment: { id: number; risk_level: string; created_at: string } | null };
export type Comm = { id: number; direction: string; channel: string; subject: string; body: string; at: string };
export type SupPO = { id: number; reference: string; status: string; total: number | null; currency: string; ordered_at: string | null };
export type Profile = SupplierDetail & {
  contacts: Contact[]; evidence: Evidence[]; products: SupProduct[]; authorisations: Authorisation[]; quotations: Quote[]; documents: SupDoc[]; communications: Comm[];
  purchase_orders: SupPO[]; score_disclaimer: string;
};

export const EVIDENCE_KINDS: { value: string; label: string; brand: boolean; help: string }[] = [
  { value: "brand_locator", label: "Brand distributor listing", brand: true, help: "The brand's own website lists this supplier as a distributor or stockist. Needs the URL of the brand's page." },
  { value: "brand_confirmation", label: "Written brand confirmation", brand: true, help: "An email or letter from the brand confirming this supplier is authorised. Describe who confirmed it and when." },
  { value: "website_claim", label: "Supplier website claim", brand: false, help: "Something the supplier says about itself. Useful context, never proof of authorisation." },
  { value: "registry", label: "Company register", brand: false, help: "A company-register record you checked yourself (for countries without an integration)." },
  { value: "vat", label: "VAT register", brand: false, help: "A VAT-register check you made yourself." },
  { value: "trade_record", label: "Trade record", brand: false, help: "Trade fair listing, import record or trade reference." },
  { value: "document", label: "Document", brand: false, help: "Certificate, licence or other document you reviewed." },
  { value: "user_note", label: "Team note", brand: false, help: "An observation from your team." },
];
export const evidenceLabel = (k: string) => EVIDENCE_KINDS.find((e) => e.value === k)?.label ?? k.replace(/_/g, " ");

/* ---------------------------------------------------------------- Overview */
export function Overview({ s, onVerify, verifying }: { s: Profile; onVerify: () => void; verifying: boolean }) {
  const reg = s.registry_data;
  const vat = s.vat_data;
  const comps = Object.entries(s.score_components ?? {});
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader eyebrow="Company register" title={reg ? reg.name : "Not verified yet"}
          description={reg ? `Checked ${ago(s.registry_checked_at)} · ${s.registry === "companies_house" ? "Companies House" : s.registry ?? "Register"}` : s.country === "GB" ? "Verify against Companies House to confirm the legal entity, status and filing history." : `No registry integration for ${countryName(s.country)}. Check the national register and record it as evidence.`}
          action={reg ? <SourceBadge source={{ provider: "Companies House", classification: s.source === "demo" ? "demo" : "public_registry", retrieved_at: s.registry_checked_at }} /> : undefined} />
        <CardBody>
          {reg ? (
            <>
              <KeyValue rows={[
                ["Company number", reg.url ? <a key="n" href={reg.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">{reg.number}<ExternalLink className="size-3" /></a> : reg.number],
                ["Status", <Badge key="st" tone={(reg.status || "").toLowerCase() === "active" ? "primary" : "danger"} size="sm" className="capitalize">{reg.status || "Unknown"}</Badge>],
                ["Company type", reg.type?.replace(/-/g, " ")],
                ["Incorporated", reg.created ? `${dateShort(reg.created)}${s.years_trading != null ? ` · ${s.years_trading} years` : ""}` : null],
                ["Dissolved", reg.ceased ? dateShort(reg.ceased) : null],
                ["Registered office", reg.address],
                ["SIC codes", (reg.sic_codes ?? []).join(", ")],
                ["Accounts overdue", reg.accounts_overdue == null ? null : reg.accounts_overdue ? <span key="a" className="text-danger">Yes</span> : "No"],
                ["Confirmation overdue", reg.confirmation_overdue == null ? null : reg.confirmation_overdue ? <span key="c" className="text-danger">Yes</span> : "No"],
                ["Insolvency history", reg.has_insolvency_history == null ? null : reg.has_insolvency_history ? <span key="i" className="text-danger">Yes</span> : "No"],
                ["Charges registered", reg.has_charges == null ? null : reg.has_charges ? "Yes" : "No"],
              ]} />
              {(reg.officers ?? []).length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 text-2xs font-semibold uppercase tracking-wider text-subtle">Officers</div>
                  <ul className="divide-y divide-line rounded-lg border border-line">
                    {(reg.officers as { name: string; role: string; appointed: string | null; resigned: string | null }[]).slice(0, 8).map((o, i) => (
                      <li key={i} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-[13px]">
                        <span>{o.name}<span className="ml-2 text-xs capitalize text-muted">{o.role?.replace(/-/g, " ")}</span></span>
                        <span className="text-xs text-subtle">{o.resigned ? `Resigned ${dateShort(o.resigned)}` : o.appointed ? `Appointed ${dateShort(o.appointed)}` : ""}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <EmptyState compact icon={Building2} title="No registry record on file" description="Verification looks the company up by number, or by legal name if no number is recorded."
              action={<GatedButton loading={verifying} onClick={onVerify}><ShieldCheck />Verify now</GatedButton>} />
          )}
        </CardBody>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader eyebrow="VAT registration" title={s.vat_number || "No VAT number recorded"}
            description={s.vat_checked_at ? `Checked ${ago(s.vat_checked_at)} against ${s.country === "GB" || s.vat_number?.toUpperCase().startsWith("GB") ? "HMRC" : "EU VIES"}` : s.vat_number ? "Not checked yet. Verify to validate it." : "Add the VAT number (Edit) so it can be validated with HMRC or VIES."}
            action={<div className="flex items-center gap-2"><VatBadge valid={s.vat_valid} size="sm" />{s.vat_checked_at && <SourceBadge source={{ provider: s.country === "GB" ? "HMRC VAT register" : "EU VIES", classification: s.source === "demo" ? "demo" : "public_registry", retrieved_at: s.vat_checked_at }} />}</div>} />
          {vat && Object.keys(vat).length > 0 && (
            <CardBody>
              <KeyValue rows={[["Registered name", vat.name], ["Registered address", vat.address], ["Number", vat.vrn || vat.number], ["Result", vat.valid ? "Valid" : <span key="v" className="text-danger">Not valid</span>]]} />
            </CardBody>
          )}
        </Card>

        <Card>
          <CardHeader eyebrow="Supplier score" title={<span className="num">{s.score ?? "—"} / 100</span>} description={s.score_disclaimer} action={<RiskBadge level={s.risk_level} size="sm" />} />
          <CardBody className="space-y-3">
            {comps.length === 0 ? <p className="text-[13px] text-muted">No score yet. Verify the supplier or add evidence to calculate it.</p> : comps.map(([k, c]) => (
              <div key={k}>
                <div className="flex items-baseline justify-between gap-3 text-[13px]"><span className="font-medium">{c.label}</span><span className="num text-muted">{c.score} / {c.max}</span></div>
                <Progress className="mt-1.5" value={(c.score / c.max) * 100} tone={c.score >= c.max * 0.7 ? "primary" : c.score > 0 ? "warning" : "danger"} />
                <div className="mt-1 text-xs text-subtle">{c.note}</div>
              </div>
            ))}
            {(s.risk_reasons ?? []).length > 0 && (
              <div className="rounded-lg border border-danger/30 bg-danger-soft p-3">
                <div className="text-xs font-semibold text-danger">Risk signals</div>
                <ul className="mt-1 space-y-0.5 text-[13px] text-danger">{s.risk_reasons!.map((r) => <li key={r}>• {r}</li>)}</ul>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader eyebrow="Commercial" title="Terms and capabilities" description="From your records, quotations and saved discovery results." action={<SourceBadge classification={s.source === "discovery" ? "ai" : "user"} />} />
        <CardBody>
          <KeyValue rows={[
            ["MOQ", s.moq != null ? `${num(s.moq)} units` : "—"],
            ["Price range", s.price_min != null ? `${money(s.price_min, s.currency)}${s.price_max != null ? ` – ${money(s.price_max, s.currency)}` : ""}` : "—"],
            ["Lead time", s.lead_time_days != null ? `${s.lead_time_days} days` : "—"],
            ["Samples", s.sample_available == null ? "Unknown" : s.sample_available ? "Available" : "Not available"],
            ["Categories", (s.categories ?? []).join(", ") || "—"],
            ["Brands supplied", (s.brands_supplied ?? []).join(", ") || "—"],
            ["Certifications", (s.certifications ?? []).join(", ") || "—"],
            ["Countries served", (s.countries_served ?? []).join(", ") || "—"],
            ["Shipping", (s.shipping_options ?? []).join(", ") || "—"],
            ["Communication", s.communication_rating ? `${s.communication_rating} / 5` : "Not rated"],
            ["Quality", s.quality_rating ? `${s.quality_rating} / 5` : "Not rated"],
            ["Notes", s.notes || null],
          ]} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader eyebrow="Brand relationships" title="Brand authorisation records" description="Each record cites its evidence. A supplier claim on its own never changes the status to authorised." />
        <CardBody>
          {s.authorisations.length === 0 ? (
            <EmptyState compact icon={BadgeCheck} title="No brand records" description="Add brand evidence (a brand distributor listing or written confirmation) on the Evidence tab and name the brand." />
          ) : (
            <ul className="divide-y divide-line">
              {s.authorisations.map((a) => (
                <li key={a.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2"><Link href={`/brands?id=${a.brand_id}`} className="text-[13px] font-medium hover:text-primary">{a.brand}</Link><AuthStatusBadge status={a.status} size="sm" /><span className="text-xs text-subtle">{evidenceLabel(a.evidence_type)}</span></div>
                  {a.statement && <p className="mt-1 text-[13px] text-muted">“{a.statement}”</p>}
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-subtle">
                    {a.source_url && <a href={a.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline"><Link2 className="size-3" />{hostOf(a.source_url)}</a>}
                    {a.verified_at && <span>Recorded {dateShort(a.verified_at)}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------- Evidence */
export function AddEvidenceDialog({ open, onOpenChange, supplierId, defaultBrand = "" }: { open: boolean; onOpenChange: (v: boolean) => void; supplierId: number; defaultBrand?: string }) {
  const qc = useQueryClient();
  const [f, setF] = React.useState({ kind: "brand_locator", summary: "", source_url: "", source_name: "", confidence: "medium", brand: defaultBrand });
  React.useEffect(() => { if (open) setF({ kind: "brand_locator", summary: "", source_url: "", source_name: "", confidence: "medium", brand: defaultBrand }); }, [open, defaultBrand]);
  const kind = EVIDENCE_KINDS.find((k) => k.value === f.kind)!;
  const m = useMutation({
    mutationFn: () => post<{ ok: boolean; status: string; score: number }>(`/suppliers/${supplierId}/evidence`, { ...f, summary: f.summary.trim(), source_url: f.source_url.trim(), brand: f.brand.trim() }),
    onSuccess: (r) => {
      toast.success("Evidence added", { description: `Status now: ${(r.status || "").replace(/_/g, " ")} · score ${r.score}/100` });
      qc.invalidateQueries({ queryKey: ["supplier", supplierId] }); qc.invalidateQueries({ queryKey: ["suppliers"] }); qc.invalidateQueries({ queryKey: ["distributors"] }); qc.invalidateQueries({ queryKey: ["brands"] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const invalid = f.summary.trim().length < 3 || (f.kind === "brand_locator" && !f.source_url.trim());
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Add evidence" description="Evidence is kept with its source so anyone on your team can check it later."
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={invalid} loading={m.isPending} onClick={() => m.mutate()}>Add evidence</Button></>}>
      <div className="space-y-4">
        <Field label="Evidence type" hint={kind.help}><Select value={f.kind} onChange={(v) => setF({ ...f, kind: v })} options={EVIDENCE_KINDS.map((k) => ({ value: k.value, label: k.brand ? `${k.label} · brand evidence` : k.label }))} /></Field>
        <div className={kind.brand ? "rounded-lg border border-primary/30 bg-primary-soft p-3 text-xs text-fg" : "rounded-lg border border-line bg-surface-2 p-3 text-xs text-muted"}>
          {kind.brand ? "Brand evidence can change this supplier's status to “Verified authorised distributor”. Make sure it comes from the brand itself." : "This type documents identity or context. It cannot make a supplier “authorised”: only a brand distributor listing or written brand confirmation can."}
        </div>
        <Field label="Summary" aside="Required"><Textarea value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} placeholder={f.kind === "brand_confirmation" ? "e.g. Email from Jane Smith, UK trade manager at Brand Ltd, 3 Nov 2026, confirming Acme is an authorised UK distributor." : "What does this show?"} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Source URL" aside={f.kind === "brand_locator" ? "Required" : "Optional"}><Input value={f.source_url} onChange={(e) => setF({ ...f, source_url: e.target.value })} placeholder="https://" /></Field>
          <Field label="Source name"><Input value={f.source_name} onChange={(e) => setF({ ...f, source_name: e.target.value })} placeholder="e.g. Brand website" /></Field>
          <Field label="Confidence"><Select value={f.confidence} onChange={(v) => setF({ ...f, confidence: v })} options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }]} /></Field>
          <Field label="Brand" hint="Name the brand to create a brand relationship record."><Input value={f.brand} onChange={(e) => setF({ ...f, brand: e.target.value })} /></Field>
        </div>
      </div>
    </Dialog>
  );
}

export function EvidenceTab({ s, onAdd }: { s: Profile; onAdd: () => void }) {
  const qc = useQueryClient();
  const [removing, setRemoving] = React.useState<Evidence | null>(null);
  const rm = useMutation({
    mutationFn: (id: number) => del(`/suppliers/${s.id}/evidence/${id}`),
    onSuccess: () => { toast.success("Evidence removed; status and score recalculated"); setRemoving(null); qc.invalidateQueries({ queryKey: ["supplier", s.id] }); qc.invalidateQueries({ queryKey: ["suppliers"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-start gap-4 p-4">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><ShieldCheck className="size-4" /></div>
        <div className="min-w-0 flex-1 text-[13px]">
          <div className="font-semibold">Only brand evidence can lead to authorised status</div>
          <p className="mt-1 text-muted">A <b className="text-fg">brand distributor listing</b> (the brand's own site lists this supplier) or <b className="text-fg">written brand confirmation</b> can move a supplier to “Verified authorised distributor”. Registry and VAT records confirm the company exists; website claims, trade records and notes add context. None of those prove authorisation.</p>
        </div>
        <GatedButton onClick={onAdd}><Plus />Add evidence</GatedButton>
      </Card>
      {s.evidence.length === 0 ? (
        <Card><EmptyState icon={FileText} title="No evidence yet" description="Verify the supplier to record registry and VAT evidence automatically, or add evidence you've collected." action={<GatedButton onClick={onAdd}><Plus />Add evidence</GatedButton>} /></Card>
      ) : (
        <Card className="divide-y divide-line">
          {s.evidence.map((e) => (
            <div key={e.id} className="flex flex-wrap items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-medium">{evidenceLabel(e.kind)}</span>
                  {e.supports_authorisation && <Badge size="sm" tone="primary"><BadgeCheck className="size-3" />Brand evidence</Badge>}
                  <SourceBadge source={{ provider: e.source_name, classification: e.classification, retrieved_at: e.retrieved_at }} />
                  <Badge size="sm" className="capitalize">{e.confidence} confidence</Badge>
                </div>
                <p className="mt-1.5 text-[13px] text-muted">{e.summary}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-subtle">
                  {e.source_url && <a href={e.source_url} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1 text-primary hover:underline"><Link2 className="size-3 shrink-0" /><span className="truncate">{e.source_url}</span></a>}
                  {e.source_name && <span>{e.source_name}</span>}
                  <span>{dateShort(e.retrieved_at)}</span>
                </div>
              </div>
              <GatedButton variant="ghost" size="icon-sm" aria-label="Remove evidence" onClick={() => setRemoving(e)}><Trash2 /></GatedButton>
            </div>
          ))}
        </Card>
      )}
      <ConfirmDialog open={!!removing} onOpenChange={(v) => !v && setRemoving(null)} title="Remove evidence?" confirmLabel="Remove" loading={rm.isPending} onConfirm={() => removing && rm.mutate(removing.id)}
        description="The supplier's status and score are recalculated without it. Brand relationship records stay until you change them." />
    </div>
  );
}

/* ---------------------------------------------------------------- Products */
export function ProductsTab({ s }: { s: Profile }) {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [prod, setProd] = React.useState<PickedProduct | null>(null);
  const [f, setF] = React.useState({ description: "", sku: "", ean: "", unit_price: "", currency: s.currency || "GBP", moq: "", sample_available: false });
  const [removing, setRemoving] = React.useState<SupProduct | null>(null);
  const reset = () => { setProd(null); setF({ description: "", sku: "", ean: "", unit_price: "", currency: s.currency || "GBP", moq: "", sample_available: false }); };
  const add = useMutation({
    mutationFn: () => post(`/suppliers/${s.id}/products`, {
      description: f.description.trim(), product_id: prod?.id ?? null, sku: f.sku.trim(), ean: f.ean.trim(), unit_price: f.unit_price ? Number(f.unit_price) : null,
      currency: f.currency, moq: f.moq ? Math.round(Number(f.moq)) : null, sample_available: f.sample_available,
    }),
    onSuccess: () => { toast.success("Product linked"); setOpen(false); reset(); qc.invalidateQueries({ queryKey: ["supplier", s.id] }); qc.invalidateQueries({ queryKey: ["suppliers"] }); if (prod) qc.invalidateQueries({ queryKey: ["product", prod.id] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const rm = useMutation({
    mutationFn: (id: number) => del(`/suppliers/${s.id}/products/${id}`),
    onSuccess: () => { toast.success("Product removed"); setRemoving(null); qc.invalidateQueries({ queryKey: ["supplier", s.id] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const cols = React.useMemo<ColumnDef<SupProduct>[]>(() => [
    { header: "Product", accessorKey: "description", cell: ({ row: { original: p } }) => <div className="min-w-[200px]"><div className="font-medium">{p.description}</div>{p.product_id && <Link href={`/products/${p.product_id}`} className="text-xs text-primary hover:underline">Linked research product</Link>}</div> },
    { header: "SKU", accessorKey: "sku", cell: ({ getValue }) => <span className="font-mono text-xs">{(getValue() as string) || "—"}</span> },
    { header: "EAN", accessorKey: "ean", cell: ({ getValue }) => <span className="font-mono text-xs">{(getValue() as string) || "—"}</span> },
    { header: "Unit price", accessorKey: "unit_price", meta: { align: "right" }, cell: ({ row: { original: p } }) => money(p.unit_price, p.currency) },
    { header: "MOQ", accessorKey: "moq", meta: { align: "right" }, cell: ({ row: { original: p } }) => num(p.moq) },
    { header: "Samples", accessorKey: "sample_available", cell: ({ row: { original: p } }) => p.sample_available == null ? <span className="text-subtle">Unknown</span> : p.sample_available ? "Yes" : "No" },
    { id: "x", header: "", enableSorting: false, enableHiding: false, size: 48, cell: ({ row: { original: p } }) => <GatedButton variant="ghost" size="icon-sm" aria-label="Remove product" onClick={() => setRemoving(p)}><Trash2 /></GatedButton> },
  ], []);
  return (
    <div className="space-y-4">
      <DataTable columns={cols} data={s.products} getRowId={(p) => String(p.id)}
        toolbar={<div className="flex w-full flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold">Products and pricing</span><GatedButton size="sm" onClick={() => setOpen(true)}><Plus />Link product</GatedButton></div>}
        empty={<EmptyState compact icon={Package} title="No products linked" description="Link the products this supplier offers, with unit price and MOQ, so they feed comparisons and profit calculations." action={<GatedButton variant="secondary" onClick={() => setOpen(true)}><Plus />Link product</GatedButton>} />} />
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }} title="Link a product" description="Record what this supplier offers. Linking a researched product updates its cost assumptions."
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={f.description.trim().length < 2} loading={add.isPending} onClick={() => add.mutate()}>Link product</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Research product" className="sm:col-span-2"><ProductPicker value={prod} onChange={(p) => { setProd(p); if (p && !f.description) setF({ ...f, description: p.title.slice(0, 200) }); }} /></Field>
          <Field label="Description" aside="Required" className="sm:col-span-2"><Input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <Field label="Supplier SKU"><Input value={f.sku} onChange={(e) => setF({ ...f, sku: e.target.value })} /></Field>
          <Field label="EAN / barcode"><Input value={f.ean} onChange={(e) => setF({ ...f, ean: e.target.value })} /></Field>
          <div className="grid grid-cols-[1fr_96px] gap-2">
            <Field label="Unit price"><Input inputMode="decimal" value={f.unit_price} onChange={(e) => setF({ ...f, unit_price: e.target.value })} /></Field>
            <Field label="Currency"><Select value={f.currency} onChange={(v) => setF({ ...f, currency: v })} options={["GBP", "EUR", "USD", "CNY"].map((c) => ({ value: c, label: c }))} /></Field>
          </div>
          <Field label="MOQ"><Input inputMode="numeric" value={f.moq} onChange={(e) => setF({ ...f, moq: e.target.value })} suffix="units" /></Field>
          <div className="sm:col-span-2"><Switch checked={f.sample_available} onCheckedChange={(v) => setF({ ...f, sample_available: v })} label="Samples available" /></div>
        </div>
      </Dialog>
      <ConfirmDialog open={!!removing} onOpenChange={(v) => !v && setRemoving(null)} title="Remove product?" confirmLabel="Remove" loading={rm.isPending} onConfirm={() => removing && rm.mutate(removing.id)}
        description={<>Remove <b>{removing?.description}</b> from this supplier?</>} />
    </div>
  );
}

/* ---------------------------------------------------------------- Contacts */
export function AddContactDialog({ open, onOpenChange, supplierId }: { open: boolean; onOpenChange: (v: boolean) => void; supplierId: number }) {
  const qc = useQueryClient();
  const [f, setF] = React.useState({ name: "", role: "", email: "", phone: "" });
  React.useEffect(() => { if (open) setF({ name: "", role: "", email: "", phone: "" }); }, [open]);
  const m = useMutation({
    mutationFn: () => post(`/suppliers/${supplierId}/contacts`, { ...f, source: "user" }),
    onSuccess: () => { toast.success("Contact added"); qc.invalidateQueries({ queryKey: ["supplier", supplierId] }); qc.invalidateQueries({ queryKey: ["suppliers"] }); onOpenChange(false); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const invalid = !f.name.trim() && !f.email.trim() && !f.phone.trim();
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Add a contact" description="RFQs are emailed to the first contact with an email address."
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={invalid} loading={m.isPending} onClick={() => m.mutate()}>Add contact</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Role"><Input value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} placeholder="e.g. Sales manager" /></Field>
        <Field label="Email"><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Phone"><Input type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
      </div>
    </Dialog>
  );
}

export function ContactsTab({ s, onAdd }: { s: Profile; onAdd: () => void }) {
  const qc = useQueryClient();
  const [removing, setRemoving] = React.useState<Contact | null>(null);
  const rm = useMutation({
    mutationFn: (id: number) => del(`/suppliers/${s.id}/contacts/${id}`),
    onSuccess: () => { toast.success("Contact removed"); setRemoving(null); qc.invalidateQueries({ queryKey: ["supplier", s.id] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  if (s.contacts.length === 0) return <Card><EmptyState icon={UserRound} title="No contacts" description="Add the people you deal with. RFQs are emailed to the first contact with an email address." action={<GatedButton onClick={onAdd}><Plus />Add contact</GatedButton>} /></Card>;
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><GatedButton size="sm" onClick={onAdd}><Plus />Add contact</GatedButton></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {s.contacts.map((c) => (
          <Card key={c.id} className="flex items-start gap-3 p-4">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-muted"><UserRound className="size-4" /></div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="truncate text-[13px] font-medium">{c.name || c.email || c.phone}</div>
              {c.role && <div className="text-xs text-muted">{c.role}</div>}
              {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 truncate text-xs text-primary hover:underline"><Mail className="size-3.5 shrink-0" />{c.email}</a>}
              {c.phone && <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 text-xs text-primary hover:underline"><Phone className="size-3.5 shrink-0" />{c.phone}</a>}
              <div className="pt-1 text-2xs text-subtle">{c.source === "user" ? "Added by your team" : c.source?.startsWith("http") ? <>Found on <a href={c.source} target="_blank" rel="noreferrer" className="hover:underline">{hostOf(c.source)}</a></> : c.source}</div>
            </div>
            <GatedButton variant="ghost" size="icon-sm" aria-label="Remove contact" onClick={() => setRemoving(c)}><Trash2 /></GatedButton>
          </Card>
        ))}
      </div>
      <ConfirmDialog open={!!removing} onOpenChange={(v) => !v && setRemoving(null)} title="Remove contact?" confirmLabel="Remove" loading={rm.isPending} onConfirm={() => removing && rm.mutate(removing.id)} description={<>Remove <b>{removing?.name || removing?.email}</b>?</>} />
    </div>
  );
}

/* ---------------------------------------------------------------- Communications */
const DIR_ICON: Record<string, React.ComponentType<{ className?: string }>> = { outbound: ArrowUpRight, inbound: ArrowDownLeft, note: StickyNote };
export function CommsTab({ s }: { s: Profile }) {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [f, setF] = React.useState({ direction: "note", channel: "email", subject: "", body: "" });
  const [expanded, setExpanded] = React.useState<number | null>(null);
  const m = useMutation({
    mutationFn: () => post(`/suppliers/${s.id}/communications`, f),
    onSuccess: () => { toast.success("Logged"); setOpen(false); setF({ direction: "note", channel: "email", subject: "", body: "" }); qc.invalidateQueries({ queryKey: ["supplier", s.id] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[13px] text-muted">Emails, calls, notes and RFQ status changes for this supplier, newest first.</p><GatedButton size="sm" onClick={() => setOpen(true)}><Plus />Log communication</GatedButton></div>
      {s.communications.length === 0 ? (
        <Card><EmptyState icon={MessageSquare} title="Nothing logged yet" description="Log calls, emails and meetings. Sending an RFQ logs it here automatically." action={<GatedButton variant="secondary" onClick={() => setOpen(true)}><Plus />Log communication</GatedButton>} /></Card>
      ) : (
        <Card className="p-2">
          <ol className="relative">
            {s.communications.map((c) => {
              const Icon = DIR_ICON[c.direction] ?? StickyNote;
              const long = (c.body || "").length > 240;
              return (
                <li key={c.id} className="flex gap-3 rounded-lg p-3 hover:bg-surface-2/60">
                  <div className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-surface-2 text-muted"><Icon className="size-4" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><span className="text-[13px] font-medium">{c.subject || (c.direction === "note" ? "Note" : c.direction === "inbound" ? "Received" : "Sent")}</span><Badge size="sm" className="capitalize">{c.channel}</Badge><span className="text-xs text-subtle">{ago(c.at)}</span></div>
                    {c.body && <p className="mt-1 whitespace-pre-wrap text-[13px] text-muted">{long && expanded !== c.id ? `${c.body.slice(0, 240)}…` : c.body}</p>}
                    {long && <button className="mt-1 text-xs text-primary hover:underline" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>{expanded === c.id ? "Show less" : "Show more"}</button>}
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      )}
      <Dialog open={open} onOpenChange={setOpen} title="Log communication"
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={!f.subject.trim() && !f.body.trim()} loading={m.isPending} onClick={() => m.mutate()}>Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type"><Select value={f.direction} onChange={(v) => setF({ ...f, direction: v })} options={[{ value: "outbound", label: "Outbound (you contacted them)" }, { value: "inbound", label: "Inbound (they contacted you)" }, { value: "note", label: "Internal note" }]} /></Field>
          <Field label="Channel"><Select value={f.channel} onChange={(v) => setF({ ...f, channel: v })} options={["email", "phone", "meeting", "video", "whatsapp", "trade_show", "other"].map((c) => ({ value: c, label: c.replace("_", " ").replace(/^./, (x) => x.toUpperCase()) }))} /></Field>
          <Field label="Subject" className="sm:col-span-2"><Input value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></Field>
          <Field label="Details" className="sm:col-span-2"><Textarea value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
        </div>
      </Dialog>
    </div>
  );
}

/* ---------------------------------------------------------------- Documents */
export function riskTone(r?: string | null) {
  return r === "low" ? "primary" : r === "medium" ? "warning" : r === "high" ? "danger" : "neutral";
}

export function DocumentsTab({ s }: { s: Profile }) {
  const qc = useQueryClient();
  const router = useRouter();
  const input = React.useRef<HTMLInputElement>(null);
  const up = useMutation({
    mutationFn: (file: File) => uploadDocument(file, { supplierId: s.id }),
    onSuccess: (r) => { toast.success("Uploaded", { description: "Run the documentation assessment next." }); qc.invalidateQueries({ queryKey: ["supplier", s.id] }); qc.invalidateQueries({ queryKey: ["documents"] }); router.push(`/invoices?doc=${r.id}`); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const open = (id: number) => openDocument(id).catch((e) => toast.error(errorMessage(e)));
  return (
    <div className="space-y-4">
      <input ref={input} type="file" accept={ACCEPTED_DOCS} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) up.mutate(f); e.target.value = ""; }} />
      <Card className="flex flex-wrap items-center gap-4 p-4">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><FileCheck2 className="size-4" /></div>
        <div className="min-w-0 flex-1 text-[13px]"><div className="font-semibold">Invoice documentation assessment</div><p className="mt-0.5 text-muted">Upload a supplier invoice to check it against commonly published Amazon invoice requirements and this supplier's registry details. It's an assessment of the document, not a prediction of Amazon's decision.</p></div>
        <GatedButton loading={up.isPending} onClick={() => input.current?.click()}><Upload />Upload invoice</GatedButton>
      </Card>
      {s.documents.length === 0 ? (
        <Card><EmptyState icon={FileText} title="No documents for this supplier" description="Upload a PDF, PNG or JPEG invoice, then run the documentation assessment." /></Card>
      ) : (
        <Card className="divide-y divide-line">
          {s.documents.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center gap-3 p-4">
              <FileText className="size-5 shrink-0 text-subtle" />
              <div className="min-w-0 flex-1">
                <button onClick={() => open(d.id)} className="block max-w-full truncate text-left text-[13px] font-medium hover:text-primary">{d.filename}</button>
                <div className="text-xs text-subtle"><span className="capitalize">{d.kind}</span> · {d.pages} page{d.pages === 1 ? "" : "s"} · uploaded {ago(d.uploaded_at)}</div>
              </div>
              {d.assessment ? (
                <>
                  <Badge tone={riskTone(d.assessment.risk_level)} size="sm" dot className="capitalize">{d.assessment.risk_level} documentation risk</Badge>
                  <Button size="sm" variant="secondary" asChild><Link href={`/invoices?assessment=${d.assessment.id}`}>View assessment<ArrowRight /></Link></Button>
                </>
              ) : (
                <Button size="sm" asChild><Link href={`/invoices?doc=${d.id}`}>Assess<ArrowRight /></Link></Button>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Quotes & purchase orders */
export function QuotesTab({ s, onRfq }: { s: Profile; onRfq: () => void }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader eyebrow="Quotations" title={`${s.quotations.length} request${s.quotations.length === 1 ? "" : "s"}`} action={<><GatedButton size="sm" variant="secondary" onClick={onRfq}><Plus />Request quote</GatedButton><Button size="sm" variant="ghost" asChild><Link href={`/rfq?supplier=${s.id}`}>RFQ Manager<ArrowRight /></Link></Button></>} />
        <CardBody>
          {s.quotations.length === 0 ? <EmptyState compact icon={ClipboardList} title="No quotation requests" description="Request a quote to get unit prices, MOQ, lead time and invoice terms in writing." /> : (
            <ul className="divide-y divide-line">
              {s.quotations.map((q) => (
                <li key={q.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2"><span className="min-w-0 flex-1 truncate text-[13px] font-medium">{q.product_desc}</span><Badge size="sm" tone={q.status === "accepted" ? "primary" : q.status === "declined" ? "danger" : q.status === "quoted" || q.status === "negotiating" ? "cyan" : "neutral"} className="capitalize">{q.status}</Badge></div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted num">
                    {q.quantity != null && <span>Qty {num(q.quantity)}</span>}
                    {q.quoted_price != null && <span>Quoted {money(q.quoted_price, q.currency)}</span>}
                    {q.negotiated_price != null && <span>Negotiated {money(q.negotiated_price, q.currency)}</span>}
                    {q.moq != null && <span>MOQ {num(q.moq)}</span>}
                    {q.lead_time_days != null && <span>{q.lead_time_days} days</span>}
                    {q.shipping_cost != null && <span>Shipping {money(q.shipping_cost, q.currency)}{q.shipping_terms ? ` ${q.shipping_terms}` : ""}</span>}
                    <span className="text-subtle">Updated {ago(q.updated_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
      <Card>
        <CardHeader eyebrow="Purchase orders" title={`${s.purchase_orders.length} order${s.purchase_orders.length === 1 ? "" : "s"}`} action={<Button size="sm" variant="ghost" asChild><Link href="/rfq?tab=orders">All orders<ArrowRight /></Link></Button>} />
        <CardBody>
          {s.purchase_orders.length === 0 ? <EmptyState compact icon={Package} title="No purchase orders" description="Create a purchase order from an accepted quotation in RFQ Manager." /> : (
            <ul className="divide-y divide-line">
              {s.purchase_orders.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="font-mono text-xs">{p.reference}</span>
                  <Badge size="sm" className="capitalize">{p.status.replace(/_/g, " ")}</Badge>
                  <span className="ml-auto text-[13px] font-medium num">{money(p.total, p.currency)}</span>
                  <span className="w-full text-xs text-subtle">{p.ordered_at ? `Ordered ${dateShort(p.ordered_at)}` : "Not placed yet"}</span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

