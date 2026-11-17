"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, BookOpenCheck, ExternalLink, Link2, Plus, Save, ShieldCheck, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState, KeyValue, PageHeader, SourceBadge } from "@/components/ui/data";
import { Dialog, Select, Sheet } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Field, Input, SearchInput, Skeleton, Textarea } from "@/components/ui/primitives";
import { AsyncError, GatedButton } from "@/components/suppliers/states";
import { AuthStatusBadge, hostOf, hrefOf } from "@/components/suppliers/status";
import { errorMessage, get, patch, post } from "@/lib/api";
import { ago, dateShort, num } from "@/lib/utils";

type BrandRow = {
  id: number; name: string; owner_company: string | null; official_website: string | null; distributor_locator_url: string | null; reseller_policy_url: string | null;
  products: number; confirmed_distributors: number; claimed_distributors: number; updated_at: string | null;
};
type BrandDetail = {
  id: number; name: string; owner_company: string | null; official_website: string | null; distributor_locator_url: string | null; reseller_policy_url: string | null;
  trademark_info: Record<string, unknown> | null; restrictions: Record<string, unknown> | null; notes: string | null;
  distributors: { id: number; supplier_id: number; supplier: string; status: string; evidence_type: string; statement: string; source_url: string; verified_at: string | null }[];
  products: { id: number; asin: string; title: string; marketplace: string }[];
  eligibility: { result: string; source: string; checked_at: string; reasons: string[] | null; product_id: number | null }[];
  research_links: { label: string; url: string }[]; note: string;
};

const ELIG: Record<string, { label: string; tone: "primary" | "warning" | "danger" }> = {
  eligible: { label: "Eligible to list", tone: "primary" }, approval_required: { label: "Approval required", tone: "warning" }, restricted: { label: "Restricted", tone: "danger" },
};
const SOURCE_LABEL: Record<string, string> = { seller_central_manual: "Recorded from Seller Central", sp_api: "Amazon SP-API" };

function Url({ url }: { url?: string | null }) {
  if (!url) return <span className="text-subtle">—</span>;
  return <a href={hrefOf(url)} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1 text-primary hover:underline"><span className="truncate">{hostOf(url)}</span><ExternalLink className="size-3 shrink-0" /></a>;
}

function BrandForm({ value, onChange }: { value: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  const f = (k: string, label: string, hint?: string, ph?: string) => (
    <Field label={label} hint={hint}><Input value={value[k] ?? ""} placeholder={ph} onChange={(e) => onChange({ ...value, [k]: e.target.value })} /></Field>
  );
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {f("owner_company", "Brand owner company", "The legal entity that owns the brand or trade mark.")}
      {f("official_website", "Official website", undefined, "brand.co.uk")}
      {f("distributor_locator_url", "Distributor / stockist locator", "The brand's own page listing authorised distributors.", "https://")}
      {f("reseller_policy_url", "Reseller or MAP policy", undefined, "https://")}
      <Field label="Research notes" className="sm:col-span-2"><Textarea value={value.notes ?? ""} onChange={(e) => onChange({ ...value, notes: e.target.value })} /></Field>
    </div>
  );
}

function EligibilityDialog({ open, onOpenChange, brand }: { open: boolean; onOpenChange: (v: boolean) => void; brand: BrandDetail }) {
  const qc = useQueryClient();
  const [result, setResult] = useState("eligible");
  const [notes, setNotes] = useState("");
  useEffect(() => { if (open) { setResult("eligible"); setNotes(""); } }, [open]);
  const m = useMutation({
    mutationFn: () => post(`/brands/${brand.id}/eligibility`, { result, notes }),
    onSuccess: () => { toast.success("Eligibility recorded"); qc.invalidateQueries({ queryKey: ["brand", brand.id] }); onOpenChange(false); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={`Record eligibility for ${brand.name}`} description="In Seller Central, go to Catalogue → Add products, search for one of the brand's products and record what Amazon shows for your account."
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button loading={m.isPending} onClick={() => m.mutate()}>Record</Button></>}>
      <div className="space-y-4">
        <Field label="What Seller Central shows"><Select value={result} onChange={setResult} options={Object.entries(ELIG).map(([value, v]) => ({ value, label: v.label }))} /></Field>
        <Field label="Notes" hint="e.g. which ASIN you checked, the category, any approval steps listed."><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
        <a href="https://sellercentral.amazon.co.uk/product-search" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[13px] text-primary hover:underline">Open Seller Central product search<ExternalLink className="size-3" /></a>
      </div>
    </Dialog>
  );
}

function BrandSheet({ id, onClose }: { id: number; onClose: () => void }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["brand", id], queryFn: () => get<BrandDetail>(`/brands/${id}`) });
  const [form, setForm] = useState<Record<string, string> | null>(null);
  const [elig, setElig] = useState(false);
  useEffect(() => {
    if (q.data) setForm({ owner_company: q.data.owner_company ?? "", official_website: q.data.official_website ?? "", distributor_locator_url: q.data.distributor_locator_url ?? "", reseller_policy_url: q.data.reseller_policy_url ?? "", notes: q.data.notes ?? "" });
  }, [q.data]);
  const save = useMutation({
    mutationFn: () => patch(`/brands/${id}`, form),
    onSuccess: () => { toast.success("Brand research saved"); qc.invalidateQueries({ queryKey: ["brand", id] }); qc.invalidateQueries({ queryKey: ["brands"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const b = q.data;
  const dirty = !!(b && form && (["owner_company", "official_website", "distributor_locator_url", "reseller_policy_url", "notes"] as const).some((k) => (form[k] ?? "") !== ((b[k] as string | null) ?? "")));
  const extra = (o: Record<string, unknown> | null) => Object.entries(o ?? {}).filter(([, v]) => v !== null && v !== "" && !(Array.isArray(v) && !v.length));
  return (
    <Sheet open onOpenChange={(v) => !v && onClose()} width={720} title={b?.name ?? "Brand"} description="Brand-owner research, distributor evidence and your Seller Central eligibility checks."
      footer={b ? <><Button variant="secondary" onClick={onClose}>Close</Button><GatedButton disabled={!dirty} loading={save.isPending} onClick={() => save.mutate()}><Save />Save research</GatedButton></> : undefined}>
      {q.isLoading ? <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        : q.error ? <AsyncError error={q.error} onRetry={() => q.refetch()} />
        : b && form ? (
          <div className="space-y-6">
            <p className="rounded-lg border border-line bg-surface-2 p-3 text-xs text-muted">{b.note}</p>
            <section>
              <h3 className="mb-3 text-2xs font-semibold uppercase tracking-wider text-subtle">Brand owner</h3>
              <BrandForm value={form} onChange={setForm} />
              {(extra(b.trademark_info).length > 0 || extra(b.restrictions).length > 0) && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {extra(b.trademark_info).length > 0 && <div><div className="mb-1 text-xs font-medium text-muted">Trade mark</div><KeyValue rows={extra(b.trademark_info).map(([k, v]) => [k.replace(/_/g, " "), String(v)])} /></div>}
                  {extra(b.restrictions).length > 0 && <div><div className="mb-1 text-xs font-medium text-muted">Restrictions</div><KeyValue rows={extra(b.restrictions).map(([k, v]) => [k.replace(/_/g, " "), String(v)])} /></div>}
                </div>
              )}
            </section>

            <section>
              <h3 className="mb-2 text-2xs font-semibold uppercase tracking-wider text-subtle">Research links</h3>
              <div className="flex flex-wrap gap-2">
                {b.research_links.map((l) => <Button key={l.url} size="sm" variant="secondary" asChild><a href={l.url} target="_blank" rel="noreferrer">{l.label}<ExternalLink /></a></Button>)}
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-2xs font-semibold uppercase tracking-wider text-subtle">Seller Central eligibility</h3>
                <GatedButton size="sm" variant="secondary" onClick={() => setElig(true)}><Plus />Record check</GatedButton>
              </div>
              {b.eligibility.length === 0 ? <p className="rounded-lg border border-dashed border-line p-4 text-[13px] text-muted">No eligibility checks recorded. Check in Seller Central before buying stock, then record the result here.</p> : (
                <ul className="divide-y divide-line rounded-lg border border-line">
                  {b.eligibility.map((e, i) => (
                    <li key={i} className="flex flex-wrap items-start gap-3 p-3 text-[13px]">
                      <Badge size="sm" tone={ELIG[e.result]?.tone ?? "neutral"}>{ELIG[e.result]?.label ?? e.result}</Badge>
                      <div className="min-w-0 flex-1">
                        {(e.reasons ?? []).length > 0 && <div className="text-muted">{(e.reasons ?? []).join(" · ")}</div>}
                        <div className="text-xs text-subtle">{SOURCE_LABEL[e.source] ?? e.source} · {dateShort(e.checked_at)}{e.product_id ? <> · <Link href={`/products/${e.product_id}`} className="hover:underline">product #{e.product_id}</Link></> : null}</div>
                      </div>
                      <SourceBadge classification={e.source === "sp_api" ? "official_api" : "user"} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="mb-2 text-2xs font-semibold uppercase tracking-wider text-subtle">Distributor records ({b.distributors.length})</h3>
              {b.distributors.length === 0 ? <p className="rounded-lg border border-dashed border-line p-4 text-[13px] text-muted">No distributor records. Add brand evidence on a supplier's profile and name this brand.</p> : (
                <ul className="divide-y divide-line rounded-lg border border-line">
                  {b.distributors.map((d) => (
                    <li key={d.id} className="p-3 text-[13px]">
                      <div className="flex flex-wrap items-center gap-2"><Link href={`/suppliers/${d.supplier_id}`} className="font-medium hover:text-primary">{d.supplier}</Link><AuthStatusBadge status={d.status} size="sm" /></div>
                      {d.statement && <p className="mt-1 text-muted">“{d.statement}”</p>}
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-subtle">
                        {d.source_url ? <a href={d.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline"><Link2 className="size-3" />{hostOf(d.source_url)}</a> : <span>No source URL</span>}
                        {d.verified_at && <span>Recorded {dateShort(d.verified_at)}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="mb-2 text-2xs font-semibold uppercase tracking-wider text-subtle">Products in your database ({b.products.length})</h3>
              {b.products.length === 0 ? <p className="text-[13px] text-muted">No researched products carry this brand name.</p> : (
                <ul className="divide-y divide-line rounded-lg border border-line">
                  {b.products.map((p) => <li key={p.id}><Link href={`/products/${p.id}`} className="flex items-center gap-3 p-2.5 text-[13px] hover:bg-surface-2"><span className="font-mono text-xs text-muted">{p.asin}</span><span className="min-w-0 flex-1 truncate">{p.title}</span><span className="text-2xs text-subtle">{p.marketplace}</span></Link></li>)}
                </ul>
              )}
            </section>
            <EligibilityDialog open={elig} onOpenChange={setElig} brand={b} />
          </div>
        ) : null}
    </Sheet>
  );
}

function BrandsInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const openId = Number(sp.get("id")) || null;
  const setOpen = (id: number | null) => router.replace(id ? `/brands?id=${id}` : "/brands", { scroll: false });
  const q = useQuery({ queryKey: ["brands"], queryFn: () => get<BrandRow[]>("/brands") });
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [nf, setNf] = useState<Record<string, string>>({});
  const create = useMutation({
    mutationFn: () => post<{ id: number }>("/brands", { name: name.trim(), ...nf }),
    onSuccess: (r) => { toast.success("Brand added"); setCreating(false); setName(""); setNf({}); qc.invalidateQueries({ queryKey: ["brands"] }); setOpen(r.id); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const rows = (q.data ?? []).filter((b) => !search || `${b.name} ${b.owner_company ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const totals = (q.data ?? []).reduce((a, b) => ({ withLocator: a.withLocator + (b.distributor_locator_url ? 1 : 0), confirmed: a.confirmed + b.confirmed_distributors, claimed: a.claimed + b.claimed_distributors }), { withLocator: 0, confirmed: 0, claimed: 0 });
  const cols = useMemo<ColumnDef<BrandRow>[]>(() => [
    { header: "Brand", accessorKey: "name", cell: ({ row: { original: b } }) => <div className="min-w-[160px]"><div className="font-medium">{b.name}</div><div className="text-xs text-muted">{b.owner_company || "Owner not recorded"}</div></div> },
    { header: "Official site", accessorKey: "official_website", cell: ({ row: { original: b } }) => <span onClick={(e) => e.stopPropagation()}><Url url={b.official_website} /></span> },
    { header: "Distributor locator", accessorKey: "distributor_locator_url", cell: ({ row: { original: b } }) => <span onClick={(e) => e.stopPropagation()}><Url url={b.distributor_locator_url} /></span> },
    { header: "Brand-evidenced distributors", accessorKey: "confirmed_distributors", meta: { align: "right" }, cell: ({ row: { original: b } }) => num(b.confirmed_distributors) },
    { header: "Claims only", accessorKey: "claimed_distributors", meta: { align: "right" }, cell: ({ row: { original: b } }) => b.claimed_distributors ? <span className="text-warning">{num(b.claimed_distributors)}</span> : "0" },
    { header: "Products", accessorKey: "products", meta: { align: "right" }, cell: ({ row: { original: b } }) => num(b.products) },
    { header: "Updated", accessorKey: "updated_at", cell: ({ row: { original: b } }) => <span className="text-xs text-muted">{ago(b.updated_at)}</span> },
  ], []);

  return (
    <>
      <PageHeader eyebrow="Supplier intelligence" title="Brand Verification"
        description="Research who owns each brand, where it lists its authorised distributors, and whether your account can sell it. Third-party data never proves you're authorised."
        actions={<GatedButton onClick={() => setCreating(true)}><Plus />Add brand</GatedButton>} />
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[["Brands researched", q.data?.length ?? 0, Tag], ["With a distributor locator", totals.withLocator, BookOpenCheck], ["Brand-evidenced distributor records", totals.confirmed, ShieldCheck]].map(([l, v, I]) => {
            const Icon = I as typeof Tag;
            return <Card key={l as string} className="flex items-center gap-3 p-4"><span className="grid size-9 place-items-center rounded-lg bg-primary-soft text-primary"><Icon className="size-4" /></span><div><div className="text-xs text-muted">{l as string}</div>{q.isLoading ? <Skeleton className="mt-1 h-6 w-10" /> : <div className="text-xl font-semibold num">{num(v as number)}</div>}</div></Card>;
          })}
        </div>
        {q.error ? <Card><AsyncError error={q.error} onRetry={() => q.refetch()} /></Card> : (
          <DataTable columns={cols} data={rows} loading={q.isLoading} getRowId={(b) => String(b.id)} onRowClick={(b) => setOpen(b.id)} storageKey="brands"
            toolbar={<SearchInput value={search} onChange={setSearch} placeholder="Search brands or owners" className="w-full sm:w-72" />}
            empty={search ? <EmptyState compact title="No brands match" action={<Button variant="secondary" onClick={() => setSearch("")}>Clear search</Button>} />
              : <EmptyState icon={ShieldCheck} title="No brands researched yet" description="Add a brand to record its owner, distributor locator and your eligibility checks. Branded discovery in Supplier Finder adds brands automatically."
                  action={<><GatedButton onClick={() => setCreating(true)}><Plus />Add brand</GatedButton><Button variant="secondary" asChild><Link href="/suppliers?mode=discover">Branded discovery<ArrowRight /></Link></Button></>} />} />
        )}
        <Card>
          <CardHeader eyebrow="Method" title="What counts as brand evidence" />
          <CardBody className="grid gap-4 text-[13px] text-muted md:grid-cols-3">
            <div><div className="font-medium text-fg">1. Identify the owner</div>Use the trade mark registers (IPO, EUIPO, USPTO) and the brand's official site to find the company that owns the brand.</div>
            <div><div className="font-medium text-fg">2. Find the brand's own list</div>A distributor or stockist locator on the brand's own domain, or written confirmation from the brand, is the evidence that supports “authorised”.</div>
            <div><div className="font-medium text-fg">3. Check your eligibility</div>Search the brand in Seller Central and record whether your account can list it. Amazon decides; Kestrel records what it showed you.</div>
          </CardBody>
        </Card>
      </div>
      {openId && <BrandSheet id={openId} onClose={() => setOpen(null)} />}
      <Dialog open={creating} onOpenChange={setCreating} size="lg" title="Add a brand" description="If the brand already exists, this updates it with any fields you fill in."
        footer={<><Button variant="secondary" onClick={() => setCreating(false)}>Cancel</Button><Button disabled={!name.trim()} loading={create.isPending} onClick={() => create.mutate()}>Add brand</Button></>}>
        <div className="space-y-4">
          <Field label="Brand name" aside="Required"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <BrandForm value={nf} onChange={setNf} />
        </div>
      </Dialog>
    </>
  );
}

export default function BrandsPage() {
  return <Suspense><BrandsInner /></Suspense>;
}
