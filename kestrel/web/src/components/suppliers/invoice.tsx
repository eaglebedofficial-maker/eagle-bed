"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle, ArrowLeft, Building2, CheckCircle2, CircleAlert, ExternalLink, FileSearch, FileText, Fingerprint, Info, Package, RefreshCw, Save, ScrollText, UserRound, XCircle,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { EmptyState, KeyValue, SourceBadge } from "@/components/ui/data";
import { Dialog, Select } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Field, Input, Skeleton, Switch, Textarea } from "@/components/ui/primitives";
import { errorMessage, get, post, put } from "@/lib/api";
import { useSession } from "@/lib/session";
import { cn, dateShort, money, num } from "@/lib/utils";
import { openDocument } from "./documents";
import { ProductPicker, SupplierPicker, type PickedProduct, type PickedSupplier } from "./pickers";
import { AsyncError, GatedButton } from "./states";
import { SupplierStatusBadge } from "./status";

/* ---------------------------------------------------------------- Types */
export type Check = { id: string; label: string; status: "pass" | "warn" | "fail"; detail: string; group: string };
export type LineItem = { description?: string; quantity?: number | null; unit_price?: number | null; line_total?: number | null; brand?: string; identifiers?: string };
export type Assessment = {
  id: number; risk_level: "low" | "medium" | "high"; summary: string; checks: Check[]; extracted: Record<string, any>; extraction_method: string;
  counts: { pass: number; warn: number; fail: number } | null; created_at?: string;
  policy: { version: string; url: string | null; reviewed_at: string | null; summary?: string };
  document: { id: number; filename: string; mime: string; pages: number }; supplier: { id: number; name: string; status: string } | null; disclaimer: string; note?: string;
};
export type Policy = { url: string; reviewed_at: string | null; max_age_days: number; min_units: number; summary: string; checklist_version: string; legal_name: string; stale: boolean };
export type DocRow = {
  id: number; filename: string; kind: string; pages: number; size_bytes: number; uploaded_at: string; supplier: { id: number; name: string } | null;
  assessment: { id: number; risk_level: string; created_at: string; counts: { pass: number; warn: number; fail: number } | null } | null;
};

/** Upload metadata held for this browser session (the API returns it only at upload time). */
export const uploadMeta = new Map<number, Record<string, string | number>>();

/* ---------------------------------------------------------------- Display helpers */
export const RISK_META: Record<string, { label: string; tone: "primary" | "warning" | "danger"; Icon: typeof CheckCircle2 }> = {
  low: { label: "Low documentation risk", tone: "primary", Icon: CheckCircle2 },
  medium: { label: "Medium documentation risk", tone: "warning", Icon: CircleAlert },
  high: { label: "High documentation risk", tone: "danger", Icon: XCircle },
};
const STATUS_META = {
  pass: { label: "Pass", tone: "primary" as const, Icon: CheckCircle2, cls: "text-primary" },
  warn: { label: "Check", tone: "warning" as const, Icon: CircleAlert, cls: "text-warning" },
  fail: { label: "Issue", tone: "danger" as const, Icon: XCircle, cls: "text-danger" },
};

/* Six review categories. Backend groups (Document, Supplier, Buyer, Products, Integrity) are split so supplier identity on the
   document is shown separately from verification against your supplier record. Unknown check ids fall back to their backend group. */
const CATEGORIES: { key: string; label: string; description: string; icon: typeof FileText; ids: string[]; group?: string }[] = [
  { key: "document", label: "Document type & date", description: "Is it a dated, numbered invoice (not a pro-forma, quote or receipt)?", icon: FileText, ids: ["doc_type", "date", "number"], group: "Document" },
  { key: "supplier_doc", label: "Supplier details on invoice", description: "Supplier name, address and contact details printed on the document.", icon: Building2, ids: ["seller_name", "seller_address", "seller_contact"] },
  { key: "supplier_verify", label: "Supplier verification", description: "Matches your supplier record, public register and VAT number; brand relationship.", icon: FileSearch, ids: ["seller_match", "registry", "vat_match", "vat_valid", "retail_source", "brand_relation", "supplier_link"], group: "Supplier" },
  { key: "buyer", label: "Buyer details", description: "Your business name and address as the buyer, matching Seller Central.", icon: UserRound, ids: ["buyer_name", "buyer_address", "buyer_setting"], group: "Buyer" },
  { key: "products", label: "Products & quantities", description: "Product descriptions, brand and quantity against the listing you'll sell.", icon: Package, ids: ["items", "quantity", "brand_named", "matches_listing"], group: "Products" },
  { key: "integrity", label: "Document integrity", description: "Totals, editing indicators in the file and duplicate uploads.", icon: Fingerprint, ids: ["arithmetic", "integrity", "duplicate"], group: "Integrity" },
];

function categorise(checks: Check[]) {
  const known = new Set(CATEGORIES.flatMap((c) => c.ids));
  return CATEGORIES.map((c) => {
    const items = checks.filter((x) => c.ids.includes(x.id) || (!known.has(x.id) && c.group === x.group));
    const status: Check["status"] | null = items.length === 0 ? null : items.some((x) => x.status === "fail") ? "fail" : items.some((x) => x.status === "warn") ? "warn" : "pass";
    return { ...c, items, status };
  });
}

function integrityIndicators(checks: Check[], meta?: Record<string, string | number>) {
  const integ = checks.find((c) => c.id === "integrity");
  const detail = integ?.detail ?? "";
  const inc = detail.match(/(\d+) incremental save/);
  const tool = detail.match(/produced or edited with ([^;.]+)/);
  const modified = /modified after it was created/.test(detail);
  const alterations = [...detail.matchAll(/visible alteration: ([^;]+?)(?=;|\. These|$)/g)].map((m) => m[1]);
  const dup = checks.find((c) => c.id === "duplicate");
  const arith = checks.find((c) => c.id === "arithmetic");
  const producer = meta ? [meta.Producer, meta.Creator].filter(Boolean).join(" · ") : "";
  return [
    { label: "Incremental saves", flagged: !!inc, value: inc ? `${inc[1]} save(s) after creation` : integ ? "None found" : "Not checked", help: "Each incremental save appends changes to the PDF after it was first created." },
    { label: "Editor / producer", flagged: !!tool, value: tool ? `Edited with ${tool[1]}` : producer || (integ ? "No editing tool detected" : "Not checked"), help: "The software recorded in the PDF metadata as having produced or edited it." },
    { label: "Modification date", flagged: modified, value: modified ? "Modified after creation" : meta?.ModDate ? `Matches creation (${String(meta.ModDate).slice(2, 10)})` : integ ? "No later modification recorded" : "Not checked", help: "Compares the PDF CreationDate and ModDate metadata." },
    { label: "Duplicate file hash", flagged: !!dup, value: dup ? dup.detail : "Not previously uploaded", help: "SHA-256 of the file compared with every document your organisation has uploaded." },
    { label: "Visible alterations", flagged: alterations.length > 0, value: alterations.length ? alterations.join("; ") : "None reported", help: "Crossed-out, covered or overwritten areas reported by AI extraction (PDF with Claude connected)." },
    { label: "Arithmetic", flagged: arith ? arith.status !== "pass" : false, value: arith ? arith.detail : "No line totals to check", help: "Line totals versus subtotal, and quantity × unit price per line." },
  ];
}

/* ---------------------------------------------------------------- Policy reference banner */
export function PolicyReference({ policy, compact }: { policy: { url?: string | null; reviewed_at?: string | null; version?: string; checklist_version?: string; stale?: boolean }; compact?: boolean }) {
  const version = policy.version ?? policy.checklist_version;
  const stale = policy.stale ?? (policy.reviewed_at ? (Date.now() - new Date(policy.reviewed_at).getTime()) / 86_400_000 > 90 : true);
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs", compact ? "" : "rounded-lg border border-line bg-surface-2 px-3 py-2.5")}>
      <span className="inline-flex items-center gap-1.5 text-muted"><ScrollText className="size-3.5 text-subtle" />{version || "Checklist"}</span>
      {policy.url ? <a href={policy.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">Amazon policy reference<ExternalLink className="size-3" /></a>
        : <span className="text-warning">No Amazon policy URL recorded</span>}
      <span className={stale ? "text-warning" : "text-muted"}>{policy.reviewed_at ? `Policy reviewed ${dateShort(policy.reviewed_at)}${stale ? " · review due" : ""}` : "Policy review date not set"}</span>
    </div>
  );
}

/* ---------------------------------------------------------------- Assess dialog */
export function AssessDialog({ doc, open, onOpenChange, onDone, corrections, defaults }: {
  doc: { id: number; filename: string; supplier: PickedSupplier | null } | null; open: boolean; onOpenChange: (v: boolean) => void; onDone: (a: Assessment) => void;
  corrections?: Record<string, unknown>; defaults?: { brand?: string };
}) {
  const qc = useQueryClient();
  const [sup, setSup] = React.useState<PickedSupplier | null>(null);
  const [brand, setBrand] = React.useState("");
  const [prod, setProd] = React.useState<PickedProduct | null>(null);
  const [useAi, setUseAi] = React.useState(true);
  // Reset only when the dialog opens for a document; `doc` is often a fresh object on every render.
  React.useEffect(() => { if (open && doc) { setSup(doc.supplier); setBrand(defaults?.brand ?? ""); setProd(null); setUseAi(true); } }, [open, doc?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const m = useMutation({
    mutationFn: () => post<Assessment>(`/documents/${doc!.id}/assess`, { supplier_id: sup?.id ?? null, brand: brand.trim(), product_id: prod?.id ?? null, use_ai: useAi, corrections: corrections ?? {} }),
    onSuccess: (a) => {
      qc.setQueryData(["assessment", a.id], a);
      qc.invalidateQueries({ queryKey: ["documents"] });
      if (sup) { qc.invalidateQueries({ queryKey: ["supplier", sup.id] }); qc.invalidateQueries({ queryKey: ["suppliers"] }); }
      toast.success("Documentation assessment complete");
      onOpenChange(false);
      onDone(a);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Run documentation assessment" description={doc ? doc.filename : undefined}
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><GatedButton loading={m.isPending} onClick={() => m.mutate()}><FileSearch />Assess document</GatedButton></>}>
      <div className="space-y-4">
        <Field label="Supplier" hint="Linking a supplier adds identity checks against its registry and VAT record. The supplier's score is updated with the result.">
          <SupplierPicker value={sup} onChange={setSup} placeholder="Link a supplier (recommended)" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand" hint="Checks the brand appears on the invoice."><Input value={brand} onChange={(e) => setBrand(e.target.value)} /></Field>
          <Field label="Product you'll sell" hint="Checks the lines match the listing."><ProductPicker value={prod} onChange={(p) => { setProd(p); if (p?.brand && !brand) setBrand(p.brand); }} placeholder="Optional" /></Field>
        </div>
        <Switch checked={useAi} onCheckedChange={setUseAi} label="Read the PDF with Claude" description="More accurate extraction and reports visible alterations. Falls back to rule-based extraction if Claude isn't connected. Images without text need Claude." />
        {corrections && Object.keys(corrections).length > 0 && <p className="rounded-lg border border-line bg-surface-2 p-3 text-xs text-muted">{Object.keys(corrections).length} corrected field(s) will override the extraction.</p>}
      </div>
    </Dialog>
  );
}

/* ---------------------------------------------------------------- Corrections */
const CORRECTABLE: { key: string; label: string; type?: "date" | "number" | "doctype" | "long" }[] = [
  { key: "document_type", label: "Document type", type: "doctype" }, { key: "invoice_number", label: "Invoice number" }, { key: "invoice_date", label: "Invoice date", type: "date" },
  { key: "seller_name", label: "Supplier name" }, { key: "seller_address", label: "Supplier address", type: "long" }, { key: "seller_vat", label: "Supplier VAT number" },
  { key: "seller_company_number", label: "Supplier company number" }, { key: "buyer_name", label: "Buyer name" }, { key: "buyer_address", label: "Buyer address", type: "long" },
  { key: "total_quantity", label: "Total quantity", type: "number" },
];
const DOC_TYPES = ["invoice", "proforma", "quote", "receipt", "order_confirmation", "credit_note", "unknown"].map((v) => ({ value: v, label: v.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()) }));

function CorrectionsDialog({ a, open, onOpenChange, onSubmit }: { a: Assessment; open: boolean; onOpenChange: (v: boolean) => void; onSubmit: (c: Record<string, unknown>) => void }) {
  const [v, setV] = React.useState<Record<string, string>>({});
  React.useEffect(() => { if (open) setV(Object.fromEntries(CORRECTABLE.map((c) => [c.key, a.extracted[c.key] == null ? "" : String(a.extracted[c.key])]))); }, [open, a]);
  const changed = () => Object.fromEntries(CORRECTABLE.filter((c) => (v[c.key] ?? "") !== (a.extracted[c.key] == null ? "" : String(a.extracted[c.key])))
    .map((c) => [c.key, c.type === "number" ? (v[c.key] ? Number(v[c.key]) : null) : v[c.key]]));
  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="lg" title="Correct extracted fields" description="Fix anything read incorrectly from the document, then re-run the assessment. Corrections are recorded as your input."
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={Object.keys(changed()).length === 0} onClick={() => onSubmit(changed())}>Continue</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        {CORRECTABLE.map((c) => (
          <Field key={c.key} label={c.label} className={c.type === "long" ? "sm:col-span-2" : undefined}>
            {c.type === "doctype" ? <Select value={v[c.key] || "unknown"} onChange={(x) => setV({ ...v, [c.key]: x })} options={DOC_TYPES} />
              : c.type === "long" ? <Textarea className="min-h-[60px]" value={v[c.key] ?? ""} onChange={(e) => setV({ ...v, [c.key]: e.target.value })} />
              : <Input type={c.type === "date" ? "date" : "text"} inputMode={c.type === "number" ? "numeric" : undefined} value={v[c.key] ?? ""} onChange={(e) => setV({ ...v, [c.key]: e.target.value })} />}
          </Field>
        ))}
      </div>
    </Dialog>
  );
}

/* ---------------------------------------------------------------- Assessment view */
export function AssessmentView({ id, onBack, onReassessed }: { id: number; onBack: () => void; onReassessed: (a: Assessment) => void }) {
  const q = useQuery({ queryKey: ["assessment", id], queryFn: () => get<Assessment>(`/assessments/${id}`) });
  const [correcting, setCorrecting] = React.useState(false);
  const [rerun, setRerun] = React.useState<Record<string, unknown> | null>(null);
  if (q.isLoading) return <div className="space-y-4"><Skeleton className="h-36 rounded-xl" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div></div>;
  if (q.error) return <Card><AsyncError error={q.error} onRetry={() => q.refetch()} /></Card>;
  const a = q.data!;
  const risk = RISK_META[a.risk_level] ?? RISK_META.medium;
  const cats = categorise(a.checks);
  const counts = a.counts ?? { pass: a.checks.filter((c) => c.status === "pass").length, warn: a.checks.filter((c) => c.status === "warn").length, fail: a.checks.filter((c) => c.status === "fail").length };
  const indicators = integrityIndicators(a.checks, uploadMeta.get(a.document.id));
  const ex = a.extracted ?? {};
  const items: LineItem[] = Array.isArray(ex.line_items) ? ex.line_items : [];
  const cur = ex.currency || "GBP";
  const aiUsed = a.extraction_method.startsWith("ai");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft />All documents</Button>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => openDocument(a.document.id).catch((e) => toast.error(errorMessage(e)))}><FileText />Open document</Button>
          <GatedButton variant="secondary" size="sm" onClick={() => setCorrecting(true)}>Correct fields</GatedButton>
          <GatedButton size="sm" onClick={() => setRerun({})}><RefreshCw />Re-run</GatedButton>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-5 p-5 md:flex-row md:items-start">
          <div className={cn("grid size-14 shrink-0 place-items-center rounded-2xl", risk.tone === "primary" ? "bg-primary-soft text-primary" : risk.tone === "warning" ? "bg-warning-soft text-warning" : "bg-danger-soft text-danger")}><risk.Icon className="size-7" /></div>
          <div className="min-w-0 flex-1">
            <div className="text-2xs font-semibold uppercase tracking-[0.08em] text-subtle">Documentation assessment</div>
            <h2 className="mt-1 text-xl font-semibold">{risk.label}</h2>
            <p className="mt-1 text-[13px] text-muted">{a.summary}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <Badge tone="primary" size="sm" className="num">{counts.pass} passed</Badge><Badge tone="warning" size="sm" className="num">{counts.warn} to check</Badge><Badge tone="danger" size="sm" className="num">{counts.fail} issues</Badge>
              <span className="text-muted">{a.document.filename} · {a.document.pages} page{a.document.pages === 1 ? "" : "s"}{a.created_at ? ` · assessed ${dateShort(a.created_at)}` : ""}</span>
            </div>
          </div>
          <div className="w-full shrink-0 space-y-2 rounded-lg border border-line p-3 text-[13px] md:w-64">
            <div className="text-xs text-muted">Supplier</div>
            {a.supplier ? <><Link href={`/suppliers/${a.supplier.id}`} className="block truncate font-medium hover:text-primary">{a.supplier.name}</Link><SupplierStatusBadge status={a.supplier.status} size="sm" /></>
              : <p className="text-xs text-subtle">Not linked. Re-run with a supplier to add identity checks.</p>}
          </div>
        </div>
        <div className="space-y-2 border-t border-line bg-surface-2/60 px-5 py-3">
          <PolicyReference policy={a.policy} compact />
          {a.policy.summary && <p className="text-xs text-muted">{a.policy.summary}</p>}
          <p className="flex gap-1.5 text-xs text-muted"><Info className="mt-0.5 size-3.5 shrink-0 text-subtle" />{a.disclaimer}</p>
          {a.note && <p className="flex gap-1.5 text-xs text-warning"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" />{a.note}</p>}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cats.map((c) => {
          const sm = c.status ? STATUS_META[c.status] : null;
          return (
            <Card key={c.key} className="flex flex-col">
              <div className="flex items-start gap-3 px-4 pt-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted"><c.icon className="size-4" /></span>
                <div className="min-w-0 flex-1"><div className="text-[13px] font-semibold">{c.label}</div><div className="mt-0.5 text-xs text-muted">{c.description}</div></div>
                {sm ? <Badge size="sm" tone={sm.tone}>{sm.label}</Badge> : <Badge size="sm">Not checked</Badge>}
              </div>
              <ul className="mt-3 flex-1 divide-y divide-line border-t border-line">
                {c.items.length === 0 ? <li className="px-4 py-3 text-xs text-subtle">No checks in this category for this document.</li> : c.items.map((x) => {
                  const m = STATUS_META[x.status];
                  return (
                    <li key={x.id} className="flex gap-2.5 px-4 py-2.5">
                      <m.Icon className={cn("mt-0.5 size-4 shrink-0", m.cls)} />
                      <div className="min-w-0"><div className="text-[13px] font-medium">{x.label}</div><div className="mt-0.5 break-words text-xs text-muted">{x.detail}</div></div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader eyebrow="Integrity indicators" title="File and content signals" description="Indicators to discuss with the supplier. None of them is proof of tampering on its own." />
          <CardBody>
            <ul className="divide-y divide-line">
              {indicators.map((i) => (
                <li key={i.label} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                  {i.flagged ? <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-subtle" />}
                  <div className="min-w-0 flex-1"><div className="text-[13px] font-medium">{i.label}</div><div className="break-words text-xs text-muted">{i.value}</div><div className="mt-0.5 text-2xs text-subtle">{i.help}</div></div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
        <Card>
          <CardHeader eyebrow="Extracted from the document" title="Invoice fields" description={`Extraction: ${aiUsed ? "Claude (AI)" : "rule-based"}${a.extraction_method.includes("+user") ? " with your corrections" : ""}`}
            action={<SourceBadge classification={aiUsed ? "ai" : "user"} source={{ provider: aiUsed ? "Claude" : "Kestrel rule-based extraction", classification: aiUsed ? "ai" : "user", note: "Read from the uploaded document. Check against the original." }} />} />
          <CardBody>
            <KeyValue rows={[
              ["Document type", ex.document_type ? String(ex.document_type).replace(/_/g, " ") : null], ["Invoice number", ex.invoice_number], ["Invoice date", ex.invoice_date ? dateShort(ex.invoice_date) : null],
              ["Supplier", ex.seller_name], ["Supplier address", ex.seller_address], ["Supplier VAT", ex.seller_vat], ["Company number", ex.seller_company_number],
              ["Supplier contact", [ex.seller_email, ex.seller_phone, ex.seller_website].filter(Boolean).join(" · ")], ["Buyer", ex.buyer_name], ["Buyer address", ex.buyer_address],
              ["Total quantity", ex.total_quantity != null ? num(ex.total_quantity) : null], ["Subtotal", ex.subtotal != null ? money(ex.subtotal, cur) : null],
              ["VAT", ex.vat_amount != null ? money(ex.vat_amount, cur) : null], ["Total", ex.total != null ? money(ex.total, cur) : null],
            ]} />
            {!Object.values(ex).some((v) => v !== "" && v != null && !(Array.isArray(v) && !v.length)) && <EmptyState compact icon={FileSearch} title="Nothing could be read" description="The file may be a scan without a text layer. Connect Claude, or correct the fields by hand." />}
          </CardBody>
        </Card>
      </div>

      {items.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader eyebrow="Line items" title={`${items.length} line${items.length === 1 ? "" : "s"}`} />
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead><tr className="border-y border-line bg-surface-2 text-left text-2xs uppercase tracking-wider text-subtle"><th className="px-4 py-2 font-semibold">Description</th><th className="px-4 py-2 font-semibold">Brand / IDs</th><th className="px-4 py-2 text-right font-semibold">Qty</th><th className="px-4 py-2 text-right font-semibold">Unit</th><th className="px-4 py-2 text-right font-semibold">Total</th></tr></thead>
              <tbody>
                {items.map((li, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    <td className="min-w-[220px] px-4 py-2.5">{li.description || "—"}</td>
                    <td className="px-4 py-2.5 text-xs text-muted">{[li.brand, li.identifiers].filter(Boolean).join(" · ") || "—"}</td>
                    <td className="px-4 py-2.5 text-right num">{num(li.quantity)}</td>
                    <td className="px-4 py-2.5 text-right num">{money(li.unit_price, cur)}</td>
                    <td className="px-4 py-2.5 text-right num">{money(li.line_total, cur)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <CorrectionsDialog a={a} open={correcting} onOpenChange={setCorrecting} onSubmit={(c) => { setCorrecting(false); setRerun(c); }} />
      <AssessDialog open={rerun !== null} onOpenChange={(v) => !v && setRerun(null)} corrections={rerun ?? undefined}
        doc={{ id: a.document.id, filename: a.document.filename, supplier: a.supplier ? { id: a.supplier.id, name: a.supplier.name, status: a.supplier.status } : null }}
        onDone={(n) => { setRerun(null); onReassessed(n); }} />
    </div>
  );
}

/* ---------------------------------------------------------------- Policy settings */
export function PolicySettings() {
  const qc = useQueryClient();
  const { can } = useSession();
  const q = useQuery({ queryKey: ["compliance-policy"], queryFn: () => get<Policy>("/compliance/policy") });
  const [f, setF] = React.useState<{ url: string; reviewed_at: string; max_age_days: string; min_units: string; summary: string; legal_name: string } | null>(null);
  React.useEffect(() => {
    if (q.data) setF({ url: q.data.url ?? "", reviewed_at: q.data.reviewed_at ?? "", max_age_days: String(q.data.max_age_days ?? 365), min_units: String(q.data.min_units ?? 10), summary: q.data.summary ?? "", legal_name: q.data.legal_name ?? "" });
  }, [q.data]);
  const save = useMutation({
    mutationFn: () => put<Policy>("/compliance/policy", { url: f!.url.trim(), reviewed_at: f!.reviewed_at, max_age_days: Number(f!.max_age_days) || 365, min_units: Number(f!.min_units) || 10, summary: f!.summary, legal_name: f!.legal_name.trim() }),
    onSuccess: (p) => { qc.setQueryData(["compliance-policy"], p); toast.success("Compliance policy saved", { description: "New assessments will cite this reference." }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  if (q.isLoading || (!f && !q.error)) return <Card className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</Card>;
  if (q.error) return <Card><AsyncError error={q.error} onRetry={() => q.refetch()} /></Card>;
  const p = q.data!;
  const admin = can("admin");
  const invalid = !f!.url.trim() || !f!.reviewed_at;
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card>
        <CardHeader eyebrow="Compliance policy" title="Policy reference used in every assessment"
          description="Amazon changes its invoice requirements. Record the Seller Central help page you checked and when, so every documentation assessment cites the version it was run against."
          action={!admin ? <Badge size="sm">Admin only</Badge> : undefined} />
        <CardBody className="space-y-4">
          {p.stale && <div className="flex gap-2 rounded-lg border border-warning/30 bg-warning-soft p-3 text-[13px] text-warning"><AlertTriangle className="mt-0.5 size-4 shrink-0" />{p.reviewed_at ? `Last reviewed ${dateShort(p.reviewed_at)}, more than 90 days ago. Re-check Amazon's current requirements.` : "No review date recorded yet. Check Amazon's current invoice requirements and record them here."}</div>}
          <Field label="Amazon policy URL" aside="Required" hint="The Seller Central help page for invoice requirements you checked."><Input disabled={!admin} value={f!.url} onChange={(e) => setF({ ...f!, url: e.target.value })} placeholder="https://sellercentral.amazon.co.uk/help/hub/reference/…" /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Reviewed on" aside="Required"><Input disabled={!admin} type="date" value={f!.reviewed_at} onChange={(e) => setF({ ...f!, reviewed_at: e.target.value })} /></Field>
            <Field label="Maximum invoice age"><Input disabled={!admin} inputMode="numeric" value={f!.max_age_days} onChange={(e) => setF({ ...f!, max_age_days: e.target.value.replace(/\D/g, "") })} suffix="days" /></Field>
            <Field label="Minimum units"><Input disabled={!admin} inputMode="numeric" value={f!.min_units} onChange={(e) => setF({ ...f!, min_units: e.target.value.replace(/\D/g, "") })} suffix="units" /></Field>
          </div>
          <Field label="Requirements summary" hint="Shown with assessments. Leave blank to keep the default summary."><Textarea disabled={!admin} className="min-h-[120px]" value={f!.summary} onChange={(e) => setF({ ...f!, summary: e.target.value })} /></Field>
          <Field label="Your legal business name" hint="Exactly as in Seller Central. Used to match the buyer on invoices."><Input disabled={!admin} value={f!.legal_name} onChange={(e) => setF({ ...f!, legal_name: e.target.value })} /></Field>
          <div className="flex justify-end"><GatedButton need="admin" disabled={invalid} reason="Add the policy URL and review date" loading={save.isPending} onClick={() => save.mutate()}><Save />Save policy</GatedButton></div>
        </CardBody>
      </Card>
      <Card className="h-fit">
        <CardHeader eyebrow="Currently in use" title={p.checklist_version} />
        <CardBody className="space-y-3">
          <PolicyReference policy={p} />
          <KeyValue rows={[["Maximum age", `${p.max_age_days} days`], ["Minimum units", `${p.min_units} units`], ["Buyer legal name", p.legal_name || <span key="n" className="text-warning">Not set</span>]]} />
          <p className="text-xs text-muted">The checklist reflects commonly published Amazon invoice requirements. Amazon decides what it accepts based on its current requirements, the category and your account.</p>
        </CardBody>
      </Card>
    </div>
  );
}
