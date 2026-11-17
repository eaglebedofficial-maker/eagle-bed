"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardCopy, ClipboardList, FilePlus2, PackagePlus, Plus, Save, Send, ShoppingCart, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState, PageHeader, SourceBadge } from "@/components/ui/data";
import { ConfirmDialog, Dialog, Select, Sheet, TabPanel, Tabs } from "@/components/ui/overlay";
import { Badge, Button, Card, Field, Input, Skeleton, Textarea } from "@/components/ui/primitives";
import { SupplierPicker, type PickedSupplier } from "@/components/suppliers/pickers";
import { RfqDialog, type Rfq } from "@/components/suppliers/rfq-dialog";
import { AsyncError, GatedButton } from "@/components/suppliers/states";
import { SupplierStatusBadge } from "@/components/suppliers/status";
import { del, errorMessage, get, patch, post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { ago, cn, dateShort, money, num } from "@/lib/utils";

const STATUSES = ["draft", "sent", "quoted", "negotiating", "accepted", "declined"] as const;
const STATUS_TONE: Record<string, "neutral" | "primary" | "cyan" | "warning" | "danger" | "violet"> = { draft: "neutral", sent: "violet", quoted: "cyan", negotiating: "warning", accepted: "primary", declined: "danger" };
const cap = (s: string) => s.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
const SAMPLE = ["not_requested", "requested", "sent", "received", "approved", "rejected"].map((v) => ({ value: v, label: cap(v) }));
const CURRENCIES = ["GBP", "EUR", "USD", "CNY"].map((c) => ({ value: c, label: c }));
const PO_STATUSES = ["draft", "placed", "in_production", "shipped", "received", "cancelled"];
const PO_TONE: Record<string, "neutral" | "primary" | "cyan" | "warning" | "danger" | "violet"> = { draft: "neutral", placed: "violet", in_production: "warning", shipped: "cyan", received: "primary", cancelled: "danger" };

type RfqList = { items: Rfq[]; counts: Record<string, number> };
type PoItem = { description: string; qty: number; unit_price: number };
type PO = { id: number; reference: string; supplier_id: number; supplier: string; status: string; items: PoItem[]; currency: string; total: number | null; ordered_at: string | null; expected_at: string | null; received_at: string | null; created_at: string };

/* ============================================================== RFQ detail */
const numOrNull = (v: string) => (v.trim() === "" || !Number.isFinite(Number(v)) ? null : Number(v));

function RfqSheet({ r, onClose, onPo }: { r: Rfq; onClose: () => void; onPo: () => void }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState({ subject: r.email_subject, body: r.email_body });
  const [resp, setResp] = useState<Record<string, string>>({});
  const [confirmDel, setConfirmDel] = useState(false);
  const [expected, setExpected] = useState("");
  useEffect(() => {
    setEmail({ subject: r.email_subject, body: r.email_body });
    setResp({
      quoted_price: r.quoted_price?.toString() ?? "", negotiated_price: r.negotiated_price?.toString() ?? "", currency: r.currency || "GBP", moq: r.moq?.toString() ?? "",
      lead_time_days: r.lead_time_days?.toString() ?? "", shipping_cost: r.shipping_cost?.toString() ?? "", shipping_terms: r.shipping_terms ?? "", sample_status: r.sample_status || "not_requested",
      response_notes: r.response_notes ?? "", quantity: r.quantity?.toString() ?? "",
    });
  }, [r.id, r.updated_at]); // eslint-disable-line react-hooks/exhaustive-deps
  const inv = () => { qc.invalidateQueries({ queryKey: ["rfq"] }); qc.invalidateQueries({ queryKey: ["supplier", r.supplier_id] }); qc.invalidateQueries({ queryKey: ["suppliers"] }); };
  const upd = useMutation({ mutationFn: (body: Record<string, unknown>) => patch<Rfq>(`/rfq/${r.id}`, body), onSuccess: () => { toast.success("Saved"); inv(); }, onError: (e) => toast.error(errorMessage(e)) });
  const send = useMutation({
    mutationFn: async () => {
      if (email.subject !== r.email_subject || email.body !== r.email_body) await patch(`/rfq/${r.id}`, { email_subject: email.subject, email_body: email.body });
      return post<{ ok: boolean; emailed: boolean; to: string | null; message: string }>(`/rfq/${r.id}/send`);
    },
    onSuccess: (x) => { x.emailed ? toast.success(`Sent to ${x.to}`) : toast.message(x.message); inv(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const rm = useMutation({ mutationFn: () => del(`/rfq/${r.id}`), onSuccess: () => { toast.success("Quotation request deleted"); inv(); onClose(); }, onError: (e) => toast.error(errorMessage(e)) });
  const po = useMutation({
    mutationFn: () => post<{ id: number; reference: string }>("/purchase-orders", { supplier_id: r.supplier_id, quotation_id: r.id, items: [], currency: r.currency || "GBP", expected_at: expected || null }),
    onSuccess: (x) => { toast.success(`${x.reference} created`, { description: "The quotation is marked accepted." }); inv(); qc.invalidateQueries({ queryKey: ["purchase-orders"] }); onPo(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const copy = async () => { try { await navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`); toast.success("Email copied"); } catch { toast.error("Couldn't copy. Select the text and copy it manually."); } };
  const emailDirty = email.subject !== r.email_subject || email.body !== r.email_body;
  const saveResp = () => upd.mutate({
    quoted_price: numOrNull(resp.quoted_price), negotiated_price: numOrNull(resp.negotiated_price), currency: resp.currency, moq: numOrNull(resp.moq), lead_time_days: numOrNull(resp.lead_time_days),
    shipping_cost: numOrNull(resp.shipping_cost), shipping_terms: resp.shipping_terms, sample_status: resp.sample_status, response_notes: resp.response_notes, quantity: numOrNull(resp.quantity),
  });
  const unit = r.negotiated_price ?? r.quoted_price;
  const canPo = unit != null && r.status !== "declined";
  return (
    <Sheet open onOpenChange={(v) => !v && onClose()} width={680} title={r.product_desc}
      description={<span className="flex flex-wrap items-center gap-2"><Link href={`/suppliers/${r.supplier_id}`} className="text-primary hover:underline">{r.supplier}</Link><SupplierStatusBadge status={r.supplier_status} size="sm" /><span>RFQ #{r.id} · created {dateShort(r.created_at)}</span></span>}
      footer={<><GatedButton variant="ghost" className="mr-auto text-danger hover:text-danger" onClick={() => setConfirmDel(true)}><Trash2 />Delete</GatedButton><Button variant="secondary" onClick={onClose}>Close</Button></>}>
      <div className="space-y-6">
        <section className="flex flex-wrap items-end gap-3">
          <Field label="Status" className="w-48"><Select value={r.status} onChange={(v) => upd.mutate({ status: v })} options={STATUSES.map((s) => ({ value: s, label: cap(s) }))} /></Field>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pb-2 text-xs text-muted">
            <span>Sent: {r.sent_at ? dateShort(r.sent_at) : "not yet"}</span><span>Response: {r.responded_at ? dateShort(r.responded_at) : "none yet"}</span>
            {r.target_price != null && <span>Target {money(r.target_price, r.currency)}</span>}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2"><h3 className="text-2xs font-semibold uppercase tracking-wider text-subtle">Request email</h3><div className="flex gap-2"><Button size="xs" variant="ghost" onClick={copy}><ClipboardCopy />Copy</Button>{emailDirty && <GatedButton size="xs" variant="secondary" loading={upd.isPending} onClick={() => upd.mutate({ email_subject: email.subject, email_body: email.body })}><Save />Save draft</GatedButton>}</div></div>
          <Input value={email.subject} onChange={(e) => setEmail({ ...email, subject: e.target.value })} aria-label="Subject" />
          <Textarea className="min-h-[260px] font-mono text-[12.5px] leading-relaxed" value={email.body} onChange={(e) => setEmail({ ...email, body: e.target.value })} aria-label="Email body" />
          <div className="flex flex-wrap items-center gap-3">
            <GatedButton loading={send.isPending} onClick={() => send.mutate()}><Send />{r.sent_at ? "Send again" : "Send request"}</GatedButton>
            <p className="min-w-0 flex-1 text-xs text-muted">Emailed to the supplier's first contact with an email address when your workspace has an email server; otherwise it's marked as sent for you to send from your own mail client. Logged in the supplier's communications.</p>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-2xs font-semibold uppercase tracking-wider text-subtle">Supplier's quotation</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Quoted unit price"><Input inputMode="decimal" value={resp.quoted_price ?? ""} onChange={(e) => setResp({ ...resp, quoted_price: e.target.value })} /></Field>
            <Field label="Negotiated price"><Input inputMode="decimal" value={resp.negotiated_price ?? ""} onChange={(e) => setResp({ ...resp, negotiated_price: e.target.value })} /></Field>
            <Field label="Currency"><Select value={resp.currency || "GBP"} onChange={(v) => setResp({ ...resp, currency: v })} options={CURRENCIES} /></Field>
            <Field label="Quantity"><Input inputMode="numeric" value={resp.quantity ?? ""} onChange={(e) => setResp({ ...resp, quantity: e.target.value })} suffix="units" /></Field>
            <Field label="MOQ"><Input inputMode="numeric" value={resp.moq ?? ""} onChange={(e) => setResp({ ...resp, moq: e.target.value })} suffix="units" /></Field>
            <Field label="Lead time"><Input inputMode="numeric" value={resp.lead_time_days ?? ""} onChange={(e) => setResp({ ...resp, lead_time_days: e.target.value })} suffix="days" /></Field>
            <Field label="Shipping cost (total)"><Input inputMode="decimal" value={resp.shipping_cost ?? ""} onChange={(e) => setResp({ ...resp, shipping_cost: e.target.value })} /></Field>
            <Field label="Shipping terms"><Input value={resp.shipping_terms ?? ""} placeholder="EXW, FOB, DDP…" onChange={(e) => setResp({ ...resp, shipping_terms: e.target.value })} /></Field>
            <Field label="Samples"><Select value={resp.sample_status || "not_requested"} onChange={(v) => setResp({ ...resp, sample_status: v })} options={SAMPLE} /></Field>
            <Field label="Notes" className="sm:col-span-3"><Textarea className="min-h-[70px]" value={resp.response_notes ?? ""} onChange={(e) => setResp({ ...resp, response_notes: e.target.value })} /></Field>
          </div>
          <div className="flex justify-end"><GatedButton loading={upd.isPending} onClick={saveResp}><Save />Save quotation</GatedButton></div>
          <p className="text-xs text-muted">Entering a quoted price moves a draft or sent request to “Quoted”. The latest quotation feeds Supplier Comparison and fills in the supplier's price, MOQ and lead time if they're empty.</p>
        </section>

        <section className="space-y-3 rounded-lg border border-line p-4">
          <h3 className="text-2xs font-semibold uppercase tracking-wider text-subtle">Purchase order</h3>
          {canPo ? (
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-0 flex-1 text-[13px] text-muted">One line: {num(r.quantity ?? r.moq ?? 0)} × {money(unit, r.currency)} = <b className="text-fg num">{money((r.quantity ?? r.moq ?? 0) * (unit ?? 0), r.currency)}</b>. Creating it marks this quotation accepted.</div>
              <Field label="Expected delivery" className="w-44"><Input type="date" value={expected} onChange={(e) => setExpected(e.target.value)} /></Field>
              <GatedButton loading={po.isPending} disabled={!(r.quantity ?? r.moq)} reason="Add a quantity or MOQ first" onClick={() => po.mutate()}><ShoppingCart />Create PO</GatedButton>
            </div>
          ) : <p className="text-[13px] text-muted">{r.status === "declined" ? "This quotation was declined." : "Record a quoted price first, then create a purchase order from it."}</p>}
        </section>
      </div>
      <ConfirmDialog open={confirmDel} onOpenChange={setConfirmDel} title="Delete quotation request?" confirmLabel="Delete" loading={rm.isPending} onConfirm={() => rm.mutate()} description="The request and its quotation details are removed. Communications already logged stay on the supplier." />
    </Sheet>
  );
}

/* ============================================================== Quotations tab */
function Quotations({ openId, setOpenId, supplierFilter, setSupplierFilter, onPo }: { openId: number | null; setOpenId: (id: number | null) => void; supplierFilter: PickedSupplier | null; setSupplierFilter: (s: PickedSupplier | null) => void; onPo: () => void }) {
  const [status, setStatus] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const q = useQuery({ queryKey: ["rfq", status, supplierFilter?.id ?? null], queryFn: () => get<RfqList>("/rfq", { status: status || undefined, supplier_id: supplierFilter?.id }) });
  const items = q.data?.items ?? [];
  const open = openId ? items.find((x) => x.id === openId) : undefined;
  const cols = useMemo<ColumnDef<Rfq>[]>(() => [
    { header: "Product", accessorKey: "product_desc", cell: ({ row: { original: r } }) => <div className="min-w-[200px]"><div className="line-clamp-1 font-medium">{r.product_desc}</div><div className="text-xs text-muted">RFQ #{r.id}{r.quantity != null ? ` · ${num(r.quantity)} units` : ""}</div></div> },
    { header: "Supplier", accessorKey: "supplier", cell: ({ row: { original: r } }) => <div className="min-w-[160px]"><Link href={`/suppliers/${r.supplier_id}`} onClick={(e) => e.stopPropagation()} className="hover:text-primary">{r.supplier}</Link><div className="mt-0.5"><SupplierStatusBadge status={r.supplier_status} size="sm" withTip={false} /></div></div> },
    { header: "Status", accessorKey: "status", cell: ({ row: { original: r } }) => <Badge size="sm" tone={STATUS_TONE[r.status] ?? "neutral"}>{cap(r.status)}</Badge> },
    { header: "Target", accessorKey: "target_price", meta: { align: "right" }, cell: ({ row: { original: r } }) => money(r.target_price, r.currency) },
    { header: "Quoted", accessorKey: "quoted_price", meta: { align: "right" }, cell: ({ row: { original: r } }) => r.negotiated_price != null ? <span><span className="text-subtle line-through">{money(r.quoted_price, r.currency)}</span> {money(r.negotiated_price, r.currency)}</span> : money(r.quoted_price, r.currency) },
    { header: "MOQ", accessorKey: "moq", meta: { align: "right" }, cell: ({ row: { original: r } }) => num(r.moq) },
    { header: "Lead time", accessorKey: "lead_time_days", meta: { align: "right" }, cell: ({ row: { original: r } }) => r.lead_time_days != null ? `${r.lead_time_days} d` : "—" },
    { header: "Samples", accessorKey: "sample_status", cell: ({ row: { original: r } }) => <span className="text-xs text-muted">{r.sample_status ? cap(r.sample_status) : "—"}</span> },
    { header: "Updated", accessorKey: "updated_at", cell: ({ row: { original: r } }) => <span className="text-xs text-muted">{ago(r.updated_at)}</span> },
  ], []);
  const total = Object.values(q.data?.counts ?? {}).reduce((a, b) => a + b, 0);
  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {[{ v: "", l: "All", n: total }, ...STATUSES.map((s) => ({ v: s, l: cap(s), n: q.data?.counts[s] ?? 0 }))].map((x) => (
          <button key={x.v || "all"} onClick={() => setStatus(x.v)} className={cn("flex h-8 shrink-0 items-center gap-2 rounded-lg border px-3 text-[13px] transition-colors", status === x.v ? "border-primary bg-primary-soft text-fg" : "border-line bg-surface text-muted hover:text-fg")}>
            {x.l}<span className="num text-2xs text-subtle">{q.isLoading ? "…" : num(x.n)}</span>
          </button>
        ))}
      </div>
      {q.error ? <Card><AsyncError error={q.error} onRetry={() => q.refetch()} /></Card> : (
        <DataTable columns={cols} data={items} loading={q.isLoading} getRowId={(r) => String(r.id)} onRowClick={(r) => setOpenId(r.id)} storageKey="rfq"
          toolbar={<><div className="w-full sm:w-72"><SupplierPicker value={supplierFilter} onChange={setSupplierFilter} placeholder="All suppliers" /></div><GatedButton size="sm" className="ml-auto" onClick={() => setCreating(true)}><Plus />New request</GatedButton></>}
          empty={status || supplierFilter
            ? <EmptyState compact title="No requests match" action={<Button variant="secondary" onClick={() => { setStatus(""); setSupplierFilter(null); }}>Clear filters</Button>} />
            : <EmptyState icon={ClipboardList} title="No quotation requests yet" description="Request quotes from your suppliers. Kestrel drafts the email with the price, MOQ, lead-time and invoice questions you need answered." action={<GatedButton onClick={() => setCreating(true)}><Plus />New request</GatedButton>} />} />
      )}
      {open && <RfqSheet r={open} onClose={() => setOpenId(null)} onPo={() => { setOpenId(null); onPo(); }} />}
      {openId && !open && q.isSuccess && !status && !supplierFilter && <Card className="flex items-center gap-3 p-4 text-[13px] text-muted">That quotation request wasn't found.<Button size="sm" variant="ghost" onClick={() => setOpenId(null)}>Dismiss</Button></Card>}
      <RfqDialog open={creating} onOpenChange={setCreating} supplier={supplierFilter} onCreated={(r) => setOpenId(r.id)} />
    </div>
  );
}

/* ============================================================== Purchase orders */
type EditItem = { description: string; qty: string; unit_price: string };
const toEdit = (i: Partial<PoItem>): EditItem => ({ description: i.description ?? "", qty: i.qty ? String(i.qty) : "", unit_price: i.unit_price ? String(i.unit_price) : "" });
const fromEdit = (items: EditItem[]): PoItem[] => items.filter((i) => i.description.trim()).map((i) => ({ description: i.description.trim(), qty: Number(i.qty) || 0, unit_price: Number(i.unit_price) || 0 }));
const BLANK: EditItem = { description: "", qty: "", unit_price: "" };

function ItemsEditor({ items, onChange, currency }: { items: EditItem[]; onChange: (i: EditItem[]) => void; currency: string }) {
  const total = items.reduce((a, i) => a + (Number(i.qty) || 0) * (Number(i.unit_price) || 0), 0);
  const set = (idx: number, k: keyof EditItem, v: string) => onChange(items.map((x, i) => (i === idx ? { ...x, [k]: v } : x)));
  return (
    <div className="space-y-2">
      {items.length > 0 && <div className="grid grid-cols-[minmax(0,1fr)_80px_96px_32px] gap-2 text-2xs font-semibold uppercase tracking-wider text-subtle"><span>Description</span><span>Qty</span><span>Unit price</span><span /></div>}
      {items.map((it, idx) => (
        <div key={idx} className="grid grid-cols-[minmax(0,1fr)_80px_96px_32px] items-center gap-2">
          <Input aria-label="Description" value={it.description} onChange={(e) => set(idx, "description", e.target.value)} />
          <Input aria-label="Quantity" inputMode="numeric" value={it.qty} onChange={(e) => set(idx, "qty", e.target.value.replace(/\D/g, ""))} />
          <Input aria-label="Unit price" inputMode="decimal" value={it.unit_price} onChange={(e) => set(idx, "unit_price", e.target.value.replace(/[^\d.]/g, ""))} />
          <Button variant="ghost" size="icon-sm" aria-label="Remove line" onClick={() => onChange(items.filter((_, i) => i !== idx))}><X /></Button>
        </div>
      ))}
      <div className="flex items-center justify-between gap-2">
        <Button size="sm" variant="ghost" onClick={() => onChange([...items, { ...BLANK }])}><Plus />Add line</Button>
        <span className="text-[13px] text-muted">Total <b className="text-fg num">{money(total, currency)}</b></span>
      </div>
    </div>
  );
}

function PurchaseOrders() {
  const qc = useQueryClient();
  const { can } = useSession();
  const q = useQuery({ queryKey: ["purchase-orders"], queryFn: () => get<PO[]>("/purchase-orders") });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PO | null>(null);
  const [nf, setNf] = useState<{ supplier: PickedSupplier | null; currency: string; expected_at: string; items: EditItem[] }>({ supplier: null, currency: "GBP", expected_at: "", items: [{ ...BLANK }] });
  const [ef, setEf] = useState<{ items: EditItem[]; expected_at: string }>({ items: [], expected_at: "" });
  useEffect(() => { if (editing) setEf({ items: (editing.items ?? []).map(toEdit), expected_at: editing.expected_at ?? "" }); }, [editing]);
  const inv = () => qc.invalidateQueries({ queryKey: ["purchase-orders"] });
  const create = useMutation({
    mutationFn: () => post<{ id: number; reference: string }>("/purchase-orders", { supplier_id: nf.supplier!.id, items: fromEdit(nf.items), currency: nf.currency, expected_at: nf.expected_at || null }),
    onSuccess: (r) => { toast.success(`${r.reference} created`); setCreating(false); setNf({ supplier: null, currency: "GBP", expected_at: "", items: [{ ...BLANK }] }); inv(); qc.invalidateQueries({ queryKey: ["supplier"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const upd = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) => patch(`/purchase-orders/${id}`, body),
    onSuccess: () => { toast.success("Purchase order updated"); inv(); qc.invalidateQueries({ queryKey: ["supplier"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const cols = useMemo<ColumnDef<PO>[]>(() => [
    { header: "Reference", accessorKey: "reference", cell: ({ row: { original: p } }) => <span className="font-mono text-xs font-medium">{p.reference}</span> },
    { header: "Supplier", accessorKey: "supplier", cell: ({ row: { original: p } }) => <Link href={`/suppliers/${p.supplier_id}`} onClick={(e) => e.stopPropagation()} className="hover:text-primary">{p.supplier}</Link> },
    {
      header: "Status", accessorKey: "status",
      cell: ({ row: { original: p } }) => can("analyst")
        ? <div className="w-40" onClick={(e) => e.stopPropagation()}><Select size="sm" value={p.status} onChange={(v) => upd.mutate({ id: p.id, body: { status: v } })} options={PO_STATUSES.map((s) => ({ value: s, label: cap(s) }))} aria-label="PO status" /></div>
        : <Badge size="sm" tone={PO_TONE[p.status] ?? "neutral"}>{cap(p.status)}</Badge>,
    },
    { header: "Lines", id: "lines", meta: { align: "right" }, accessorFn: (p) => (p.items ?? []).length, cell: ({ getValue }) => num(getValue() as number) },
    { header: "Total", accessorKey: "total", meta: { align: "right" }, cell: ({ row: { original: p } }) => money(p.total, p.currency) },
    { header: "Ordered", accessorKey: "ordered_at", cell: ({ row: { original: p } }) => <span className="text-xs text-muted">{p.ordered_at ? dateShort(p.ordered_at) : "—"}</span> },
    { header: "Expected", accessorKey: "expected_at", cell: ({ row: { original: p } }) => <span className="text-xs text-muted">{p.expected_at ? dateShort(p.expected_at) : "—"}</span> },
    { header: "Received", accessorKey: "received_at", cell: ({ row: { original: p } }) => <span className="text-xs text-muted">{p.received_at ? dateShort(p.received_at) : "—"}</span> },
  ], [can]); // eslint-disable-line react-hooks/exhaustive-deps
  const totals = (q.data ?? []).filter((p) => !["received", "cancelled"].includes(p.status));
  return (
    <div className="space-y-4">
      {q.error ? <Card><AsyncError error={q.error} onRetry={() => q.refetch()} /></Card> : (
        <DataTable columns={cols} data={q.data ?? []} loading={q.isLoading} getRowId={(p) => String(p.id)} onRowClick={setEditing} storageKey="purchase-orders"
          toolbar={<><span className="text-xs text-muted"><b className="text-fg num">{totals.length}</b> open order{totals.length === 1 ? "" : "s"}</span><GatedButton size="sm" className="ml-auto" onClick={() => setCreating(true)}><PackagePlus />New purchase order</GatedButton></>}
          empty={<EmptyState icon={ShoppingCart} title="No purchase orders" description="Create one from an accepted quotation (open the request and choose Create PO), or start a blank order." action={<GatedButton onClick={() => setCreating(true)}><PackagePlus />New purchase order</GatedButton>} />} />
      )}
      <Dialog open={creating} onOpenChange={setCreating} size="lg" title="New purchase order" description="Kestrel numbers the order and tracks it from draft to received."
        footer={<><Button variant="secondary" onClick={() => setCreating(false)}>Cancel</Button><Button disabled={!nf.supplier || !nf.items.some((i) => i.description.trim())} loading={create.isPending} onClick={() => create.mutate()}>Create order</Button></>}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Supplier" className="sm:col-span-3"><SupplierPicker value={nf.supplier} onChange={(s) => setNf({ ...nf, supplier: s })} /></Field>
            <Field label="Currency"><Select value={nf.currency} onChange={(v) => setNf({ ...nf, currency: v })} options={CURRENCIES} /></Field>
            <Field label="Expected delivery" className="sm:col-span-2"><Input type="date" value={nf.expected_at} onChange={(e) => setNf({ ...nf, expected_at: e.target.value })} /></Field>
          </div>
          <Field label="Lines"><ItemsEditor items={nf.items} currency={nf.currency} onChange={(items) => setNf({ ...nf, items })} /></Field>
        </div>
      </Dialog>
      <Sheet open={!!editing} onOpenChange={(v) => !v && setEditing(null)} width={620} title={editing?.reference ?? ""} description={editing ? `${editing.supplier} · created ${dateShort(editing.created_at)}` : undefined}
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Close</Button><GatedButton loading={upd.isPending} onClick={() => editing && upd.mutate({ id: editing.id, body: { items: fromEdit(ef.items), expected_at: ef.expected_at || null } }, { onSuccess: () => setEditing(null) })}><Save />Save order</GatedButton></>}>
        {editing && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2"><Badge tone={PO_TONE[editing.status] ?? "neutral"}>{cap(editing.status)}</Badge><span className="text-xs text-muted">{editing.ordered_at ? `Ordered ${dateShort(editing.ordered_at)}` : "Not placed yet"}{editing.received_at ? ` · received ${dateShort(editing.received_at)}` : ""}</span><SourceBadge classification="user" /></div>
            <Field label="Expected delivery" className="w-48"><Input type="date" value={ef.expected_at} onChange={(e) => setEf({ ...ef, expected_at: e.target.value })} /></Field>
            <Field label="Lines"><ItemsEditor key={editing.id} items={ef.items} currency={editing.currency} onChange={(items) => setEf({ ...ef, items })} /></Field>
            <p className="text-xs text-muted">Change the status from the table. “Placed” records the order date; “Received” records the delivery date.</p>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ============================================================== Page */
function RfqInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const tab = sp.get("tab") === "orders" ? "orders" : "quotes";
  const openId = Number(sp.get("rfq")) || null;
  const supId = Number(sp.get("supplier")) || null;
  const supQ = useQuery({ queryKey: ["supplier", supId], queryFn: () => get<{ id: number; name: string; status: string; country: string }>(`/suppliers/${supId}`), enabled: !!supId });
  const supplierFilter: PickedSupplier | null = supId ? (supQ.data ? { id: supQ.data.id, name: supQ.data.name, status: supQ.data.status, country: supQ.data.country } : { id: supId, name: "Loading…" }) : null;
  const build = (o: { tab?: string; rfq?: number | null; supplier?: number | null }) => {
    const p = new URLSearchParams();
    const t = o.tab ?? tab; if (t === "orders") p.set("tab", "orders");
    const r = o.rfq === undefined ? openId : o.rfq; if (r && t !== "orders") p.set("rfq", String(r));
    const s = o.supplier === undefined ? supId : o.supplier; if (s && t !== "orders") p.set("supplier", String(s));
    router.replace(`/rfq${p.toString() ? `?${p}` : ""}`, { scroll: false });
  };
  return (
    <>
      <PageHeader eyebrow="Supplier intelligence" title="RFQ Manager" description="Request quotations, record what suppliers quote, track samples, and turn accepted quotes into purchase orders."
        actions={<Button variant="secondary" asChild><Link href="/suppliers/compare"><FilePlus2 />Compare quotes</Link></Button>} />
      <Tabs value={tab} onValueChange={(v) => build({ tab: v, rfq: null })} tabs={[{ value: "quotes", label: "Quotation requests" }, { value: "orders", label: "Purchase orders" }]}>
        <TabPanel value="quotes">
          {supId && supQ.isLoading ? <Skeleton className="h-64 rounded-xl" /> : (
            <Quotations openId={openId} setOpenId={(id) => build({ rfq: id })} supplierFilter={supplierFilter} setSupplierFilter={(s) => build({ supplier: s?.id ?? null, rfq: null })} onPo={() => build({ tab: "orders" })} />
          )}
        </TabPanel>
        <TabPanel value="orders"><PurchaseOrders /></TabPanel>
      </Tabs>
    </>
  );
}

export default function RfqPage() {
  return <Suspense><RfqInner /></Suspense>;
}
