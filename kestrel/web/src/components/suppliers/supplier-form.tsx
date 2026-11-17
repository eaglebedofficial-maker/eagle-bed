"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Dialog, Select } from "@/components/ui/overlay";
import { Button, Field, Input, Switch, Textarea } from "@/components/ui/primitives";
import { errorMessage, patch, post } from "@/lib/api";
import { SUPPLIER_TYPES, type SupplierDetail } from "./status";

type Form = {
  legal_name: string; trading_name: string; supplier_type: string; country: string; city: string; address: string; website: string; registration_number: string;
  vat_number: string; categories: string; brands_supplied: string; certifications: string; countries_served: string; shipping_options: string; moq: string; price_min: string;
  price_max: string; currency: string; lead_time_days: string; sample_available: boolean; communication_rating: string; quality_rating: string; notes: string;
};

const EMPTY: Form = {
  legal_name: "", trading_name: "", supplier_type: "wholesaler", country: "GB", city: "", address: "", website: "", registration_number: "", vat_number: "",
  categories: "", brands_supplied: "", certifications: "", countries_served: "", shipping_options: "", moq: "", price_min: "", price_max: "", currency: "GBP",
  lead_time_days: "", sample_available: false, communication_rating: "", quality_rating: "", notes: "",
};

const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const numOrNull = (s: string) => (s.trim() === "" || !Number.isFinite(Number(s)) ? null : Number(s));
const intOrNull = (s: string) => { const n = numOrNull(s); return n == null ? null : Math.round(n); };

function fromSupplier(s: SupplierDetail): Form {
  return {
    legal_name: s.legal_name, trading_name: s.trading_name ?? "", supplier_type: s.supplier_type, country: s.country, city: s.city ?? "", address: s.address ?? "",
    website: s.website ?? "", registration_number: s.registration_number ?? "", vat_number: s.vat_number ?? "", categories: (s.categories ?? []).join(", "),
    brands_supplied: (s.brands_supplied ?? []).join(", "), certifications: (s.certifications ?? []).join(", "), countries_served: (s.countries_served ?? []).join(", "),
    shipping_options: (s.shipping_options ?? []).join(", "), moq: s.moq?.toString() ?? "", price_min: s.price_min?.toString() ?? "", price_max: s.price_max?.toString() ?? "",
    currency: s.currency || "GBP", lead_time_days: s.lead_time_days?.toString() ?? "", sample_available: !!s.sample_available,
    communication_rating: s.communication_rating?.toString() ?? "", quality_rating: s.quality_rating?.toString() ?? "", notes: s.notes ?? "",
  };
}

const RATING = [{ value: "none", label: "Not rated" }, ...[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} / 5` }))];
const CURRENCIES = ["GBP", "EUR", "USD", "CNY"].map((c) => ({ value: c, label: c }));

/** Create (POST /suppliers) or edit (PATCH /suppliers/{id}) a supplier. */
export function SupplierFormDialog({ open, onOpenChange, supplier, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; supplier?: SupplierDetail | null; onSaved?: (s: SupplierDetail) => void }) {
  const qc = useQueryClient();
  const [f, setF] = React.useState<Form>(EMPTY);
  React.useEffect(() => { if (open) setF(supplier ? fromSupplier(supplier) : EMPTY); }, [open, supplier]);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  const body = () => ({
    legal_name: f.legal_name.trim(), trading_name: f.trading_name.trim(), supplier_type: f.supplier_type, country: f.country.trim().toUpperCase(), city: f.city.trim(),
    address: f.address.trim(), website: f.website.trim(), registration_number: f.registration_number.trim(), vat_number: f.vat_number.trim(),
    categories: list(f.categories), brands_supplied: list(f.brands_supplied), certifications: list(f.certifications), countries_served: list(f.countries_served),
    shipping_options: list(f.shipping_options), moq: intOrNull(f.moq), price_min: numOrNull(f.price_min), price_max: numOrNull(f.price_max), currency: f.currency,
    lead_time_days: intOrNull(f.lead_time_days), sample_available: f.sample_available, communication_rating: intOrNull(f.communication_rating),
    quality_rating: intOrNull(f.quality_rating), notes: f.notes,
  });
  const save = useMutation({
    mutationFn: () => (supplier ? patch<SupplierDetail>(`/suppliers/${supplier.id}`, body()) : post<SupplierDetail>("/suppliers", body())),
    onSuccess: (s) => {
      toast.success(supplier ? "Supplier updated" : `${s.name} added`, { description: `Status: ${s.status_label}. Score ${s.score ?? "—"}/100.` });
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      qc.invalidateQueries({ queryKey: ["supplier", s.id] });
      onOpenChange(false);
      onSaved?.(s);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const invalid = f.legal_name.trim().length < 2 || f.country.trim().length !== 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="lg" title={supplier ? `Edit ${supplier.name}` : "Add a supplier"}
      description="Use the registered legal name so Kestrel can match it against Companies House and VAT registers."
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button loading={save.isPending} disabled={invalid} onClick={() => save.mutate()}>{supplier ? "Save changes" : "Add supplier"}</Button></>}>
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="Legal name" aside="Required" className="sm:col-span-2" hint="As shown on the company register, e.g. “Acme Trading Ltd”."><Input value={f.legal_name} onChange={(e) => set("legal_name", e.target.value)} /></Field>
          <Field label="Trading name"><Input value={f.trading_name} onChange={(e) => set("trading_name", e.target.value)} /></Field>
          <Field label="Supplier type"><Select value={f.supplier_type} onChange={(v) => set("supplier_type", v)} options={SUPPLIER_TYPES} /></Field>
          <Field label="Country" aside="ISO code" hint="GB, DE, CN…"><Input maxLength={2} value={f.country} onChange={(e) => set("country", e.target.value.toUpperCase())} /></Field>
          <Field label="City"><Input value={f.city} onChange={(e) => set("city", e.target.value)} /></Field>
          <Field label="Address" className="sm:col-span-2"><Input value={f.address} onChange={(e) => set("address", e.target.value)} /></Field>
          <Field label="Website"><Input value={f.website} placeholder="example.co.uk" onChange={(e) => set("website", e.target.value)} /></Field>
          <Field label="Company number" hint="Companies House number for UK companies."><Input value={f.registration_number} onChange={(e) => set("registration_number", e.target.value)} /></Field>
          <Field label="VAT number" className="sm:col-span-2" hint="Validated against HMRC (UK) or VIES (EU) when you verify."><Input value={f.vat_number} onChange={(e) => set("vat_number", e.target.value)} /></Field>
        </section>
        {f.supplier_type === "authorised_distributor" || f.supplier_type === "brand_owner" ? (
          <div className="flex gap-2 rounded-lg border border-line bg-surface-2 p-3 text-xs text-muted">
            <Info className="mt-0.5 size-4 shrink-0 text-subtle" />
            <span>The supplier type is what the supplier says it is. Kestrel only shows “Verified authorised distributor” or “Official brand owner” once brand evidence (a brand distributor listing or written brand confirmation) and registry checks are on file.</span>
          </div>
        ) : null}
        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="Categories" hint="Comma-separated."><Input value={f.categories} onChange={(e) => set("categories", e.target.value)} /></Field>
          <Field label="Brands supplied" hint="Comma-separated."><Input value={f.brands_supplied} onChange={(e) => set("brands_supplied", e.target.value)} /></Field>
          <Field label="Certifications" hint="e.g. ISO 9001, BSCI."><Input value={f.certifications} onChange={(e) => set("certifications", e.target.value)} /></Field>
          <Field label="Countries served" hint="Comma-separated codes."><Input value={f.countries_served} onChange={(e) => set("countries_served", e.target.value)} /></Field>
          <Field label="Shipping options" className="sm:col-span-2" hint="e.g. EXW, FOB, DDP UK."><Input value={f.shipping_options} onChange={(e) => set("shipping_options", e.target.value)} /></Field>
        </section>
        <section className="grid gap-4 sm:grid-cols-4">
          <Field label="MOQ"><Input inputMode="numeric" value={f.moq} onChange={(e) => set("moq", e.target.value)} suffix="units" /></Field>
          <Field label="Price from"><Input inputMode="decimal" value={f.price_min} onChange={(e) => set("price_min", e.target.value)} /></Field>
          <Field label="Price to"><Input inputMode="decimal" value={f.price_max} onChange={(e) => set("price_max", e.target.value)} /></Field>
          <Field label="Currency"><Select value={f.currency} onChange={(v) => set("currency", v)} options={CURRENCIES} /></Field>
          <Field label="Lead time"><Input inputMode="numeric" value={f.lead_time_days} onChange={(e) => set("lead_time_days", e.target.value)} suffix="days" /></Field>
          <Field label="Communication"><Select value={f.communication_rating || "none"} onChange={(v) => set("communication_rating", v === "none" ? "" : v)} options={RATING} /></Field>
          <Field label="Quality"><Select value={f.quality_rating || "none"} onChange={(v) => set("quality_rating", v === "none" ? "" : v)} options={RATING} /></Field>
          <div className="flex items-end pb-1.5"><Switch checked={f.sample_available} onCheckedChange={(v) => set("sample_available", v)} label="Samples available" /></div>
        </section>
        <Field label="Notes"><Textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
      </div>
    </Dialog>
  );
}
