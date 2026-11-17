"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import { Dialog, Select } from "@/components/ui/overlay";
import { Button, Field, Input, Switch } from "@/components/ui/primitives";
import { errorMessage, post } from "@/lib/api";
import { ProductPicker, SupplierPicker, type PickedProduct, type PickedSupplier } from "./pickers";

export type Rfq = {
  id: number; supplier_id: number; supplier: string; supplier_country: string; supplier_status: string; product_id: number | null; product_desc: string;
  quantity: number | null; target_price: number | null; status: string; email_subject: string; email_body: string; sent_at: string | null; responded_at: string | null;
  quoted_price: number | null; negotiated_price: number | null; currency: string; moq: number | null; lead_time_days: number | null; shipping_cost: number | null;
  shipping_terms: string | null; sample_status: string | null; response_notes: string | null; created_at: string; updated_at: string;
};

const CURRENCIES = ["GBP", "EUR", "USD", "CNY"].map((c) => ({ value: c, label: c }));

/** Create a quotation request (POST /rfq). The backend drafts the email; nothing is sent until the user sends it. */
export function RfqDialog({ open, onOpenChange, supplier, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; supplier?: PickedSupplier | null; onCreated?: (r: Rfq) => void }) {
  const qc = useQueryClient();
  const [sup, setSup] = React.useState<PickedSupplier | null>(supplier ?? null);
  const [prod, setProd] = React.useState<PickedProduct | null>(null);
  const [f, setF] = React.useState({ product_desc: "", quantity: "", target_price: "", currency: "GBP", branded: false, brand: "" });
  React.useEffect(() => {
    if (open) { setSup(supplier ?? null); setProd(null); setF({ product_desc: "", quantity: "", target_price: "", currency: "GBP", branded: false, brand: "" }); }
  }, [open, supplier]);
  const create = useMutation({
    mutationFn: () => post<Rfq>("/rfq", {
      supplier_id: sup!.id, product_desc: f.product_desc.trim(), product_id: prod?.id ?? null, quantity: f.quantity ? Math.round(Number(f.quantity)) : null,
      target_price: f.target_price ? Number(f.target_price) : null, currency: f.currency, branded: f.branded, brand: f.branded ? f.brand.trim() : "",
    }),
    onSuccess: (r) => {
      toast.success("Quotation request drafted", { description: "Review the email in RFQ Manager, then send it." });
      qc.invalidateQueries({ queryKey: ["rfq"] });
      qc.invalidateQueries({ queryKey: ["supplier", r.supplier_id] });
      onOpenChange(false);
      onCreated?.(r);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const invalid = !sup || f.product_desc.trim().length < 2 || (f.branded && !f.brand.trim());
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Request a quotation" description="Kestrel drafts the email with the questions Amazon-ready sourcing needs answered. You review it before anything is sent."
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={invalid} loading={create.isPending} onClick={() => create.mutate()}>Draft request</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Supplier" className="sm:col-span-2">{supplier ? <Input value={supplier.name} disabled /> : <SupplierPicker value={sup} onChange={setSup} />}</Field>
        <Field label="Product" className="sm:col-span-2" hint="Describe it as you'd want it on the invoice.">
          <Input value={f.product_desc} onChange={(e) => setF({ ...f, product_desc: e.target.value })} placeholder="e.g. Stainless steel insulated bottle, 750 ml" />
        </Field>
        <Field label="Linked product" className="sm:col-span-2"><ProductPicker value={prod} onChange={(p) => { setProd(p); if (p && !f.product_desc) setF({ ...f, product_desc: p.title.slice(0, 300), brand: p.brand || f.brand }); }} /></Field>
        <Field label="Quantity" hint="Leave blank to ask for price breaks."><Input inputMode="numeric" value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} suffix="units" /></Field>
        <div className="grid grid-cols-[1fr_96px] gap-2">
          <Field label="Target unit price"><Input inputMode="decimal" value={f.target_price} onChange={(e) => setF({ ...f, target_price: e.target.value })} /></Field>
          <Field label="Currency"><Select value={f.currency} onChange={(v) => setF({ ...f, currency: v })} options={CURRENCIES} /></Field>
        </div>
        <div className="sm:col-span-2 rounded-lg border border-line p-3">
          <Switch checked={f.branded} onCheckedChange={(v) => setF({ ...f, branded: v })} label="Branded product"
            description="Adds a request for the supplier's relationship with the brand, and whether the brand can confirm them as an authorised supplier." />
          {f.branded && <div className="mt-3"><Field label="Brand"><Input value={f.brand} onChange={(e) => setF({ ...f, brand: e.target.value })} /></Field></div>}
        </div>
      </div>
    </Dialog>
  );
}
