"use client";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle, ArrowRight, Building2, CheckCircle2, ExternalLink, Filter, GitCompareArrows, LayoutGrid, Link2, Mail, Phone, Plus, Quote, Radar, Rows3, Search, ShieldCheck, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState, PageHeader, SourceBadge } from "@/components/ui/data";
import { Popover, Select, Tooltip } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Checkbox, Field, Input, SearchInput, Segmented, Skeleton } from "@/components/ui/primitives";
import { ProductPicker, useDebounced, type PickedProduct } from "@/components/suppliers/pickers";
import { AsyncError } from "@/components/suppliers/states";
import { SupplierCard, supplierColumns } from "@/components/suppliers/supplier-card";
import { SupplierFormDialog } from "@/components/suppliers/supplier-form";
import { countryName, hostOf, hrefOf, STATUS_ORDER, SUPPLIER_STATUS, SUPPLIER_TYPES, TONE_DOT, typeLabel, type SupplierList } from "@/components/suppliers/status";
import { errorMessage, get, post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { cn, num } from "@/lib/utils";

/* ============================================================== My suppliers */
const REGIONS = [{ value: "all", label: "All regions" }, { value: "UK", label: "United Kingdom" }, { value: "EU", label: "European Union" }, { value: "INTL", label: "Rest of world" }];
const SAVED = [{ value: "all", label: "All suppliers" }, { value: "true", label: "Saved only" }, { value: "false", label: "Not saved" }];
const SORTS = [{ value: "score", label: "Highest score" }, { value: "name", label: "Name A–Z" }, { value: "recent", label: "Recently added" }, { value: "moq", label: "Lowest MOQ" }];

function MySuppliers({ onAdd, onDiscover }: { onAdd: () => void; onDiscover: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 300);
  const [types, setTypes] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [region, setRegion] = useState("all");
  const [saved, setSaved] = useState("all");
  const [sort, setSort] = useState("score");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [selected, setSelected] = useState<number[]>([]);
  const params = { q: dq, types, statuses, region: region === "all" ? "" : region, saved: saved === "all" ? undefined : saved, sort, page, page_size: pageSize };
  const r = useQuery({ queryKey: ["suppliers", "list", params], queryFn: () => get<SupplierList>("/suppliers", params), placeholderData: keepPreviousData });
  const cols = useMemo(() => supplierColumns(), []);
  const counts = r.data?.status_counts ?? {};
  const totalAll = Object.values(counts).reduce((a, b) => a + b, 0);
  const filtered = !!(dq || types.length || statuses.length || region !== "all" || saved !== "all");
  const reset = () => { setQ(""); setTypes([]); setStatuses([]); setRegion("all"); setSaved("all"); setPage(1); };
  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const empty = filtered
    ? <EmptyState icon={Filter} title="No suppliers match these filters" description="Clear the filters or search for a different name, website or product." action={<Button variant="secondary" onClick={reset}>Clear filters</Button>} />
    : <EmptyState icon={Building2} title="No suppliers yet" description="Discover manufacturers and distributors from public web and registry sources, or add a supplier you already work with."
        action={<><Button onClick={onDiscover}><Radar />Discover suppliers</Button><Button variant="secondary" onClick={onAdd}><Plus />Add supplier</Button></>} />;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        <button onClick={() => { setStatuses([]); setPage(1); }}
          className={cn("flex h-8 shrink-0 items-center gap-2 rounded-lg border px-3 text-[13px] transition-colors", statuses.length === 0 ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface text-muted hover:text-fg")}>
          All <span className="num text-2xs">{r.isLoading ? "…" : num(totalAll)}</span>
        </button>
        {STATUS_ORDER.map((s) => (
          <button key={s} onClick={() => { setStatuses(toggle(statuses, s)); setPage(1); }} aria-pressed={statuses.includes(s)}
            className={cn("flex h-8 shrink-0 items-center gap-2 rounded-lg border px-3 text-[13px] transition-colors", statuses.includes(s) ? "border-primary bg-primary-soft text-fg" : "border-line bg-surface text-muted hover:text-fg")}>
            <span className={cn("size-1.5 rounded-full", TONE_DOT[SUPPLIER_STATUS[s].tone])} />
            {SUPPLIER_STATUS[s].label}<span className="num text-2xs text-subtle">{num(counts[s] ?? 0)}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search name, website, notes or product" className="w-full sm:w-80" />
        <Popover align="start" className="w-64 p-2" trigger={<Button variant="secondary" size="md"><Filter />Type{types.length ? <Badge size="sm" tone="primary">{types.length}</Badge> : null}</Button>}>
          <div className="px-1.5 pb-1.5 text-2xs font-semibold uppercase tracking-wider text-subtle">Supplier type</div>
          <div className="max-h-72 space-y-0.5 overflow-y-auto">
            {SUPPLIER_TYPES.map((t) => <Checkbox key={t.value} className="rounded-md px-1.5 py-1.5 hover:bg-surface-2" checked={types.includes(t.value)} onCheckedChange={() => { setTypes(toggle(types, t.value)); setPage(1); }} label={t.label} />)}
          </div>
          {types.length > 0 && <div className="mt-1 border-t border-line pt-1.5"><Button size="xs" variant="ghost" onClick={() => setTypes([])}>Clear types</Button></div>}
        </Popover>
        <div className="w-40"><Select value={region} onChange={(v) => { setRegion(v); setPage(1); }} options={REGIONS} aria-label="Region" /></div>
        <div className="w-36"><Select value={saved} onChange={(v) => { setSaved(v); setPage(1); }} options={SAVED} aria-label="Saved" /></div>
        <div className="w-40"><Select value={sort} onChange={(v) => { setSort(v); setPage(1); }} options={SORTS} aria-label="Sort" /></div>
        {filtered && <Button variant="ghost" onClick={reset}>Reset</Button>}
        <div className="ml-auto flex items-center gap-2">
          {view === "table" && selected.length >= 2 && (
            <Button variant="secondary" onClick={() => router.push(`/suppliers/compare?ids=${selected.slice(0, 10).join(",")}`)}><GitCompareArrows />Compare {Math.min(selected.length, 10)}</Button>
          )}
          <Segmented value={view} onChange={setView} options={[{ value: "grid", label: <span className="flex items-center gap-1.5"><LayoutGrid className="size-3.5" />Cards</span> }, { value: "table", label: <span className="flex items-center gap-1.5"><Rows3 className="size-3.5" />Table</span> }]} />
        </div>
      </div>

      {r.error ? <Card><AsyncError error={r.error} onRetry={() => r.refetch()} /></Card>
        : view === "table" ? (
          <DataTable columns={cols} data={r.data?.items ?? []} loading={r.isLoading} getRowId={(s) => String(s.id)} selectable storageKey="suppliers"
            onSelectionChange={(rows) => setSelected(rows.map((x) => x.id))} onRowClick={(s) => router.push(`/suppliers/${s.id}`)} empty={empty}
            toolbar={<span className="text-xs text-muted">Select 2–10 suppliers to compare landed cost, MOQ and risk.</span>}
            paging={{ page, pageSize, total: r.data?.total ?? 0, onPage: setPage, onPageSize: (n) => { setPageSize(n); setPage(1); } }} />
        ) : r.isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[214px] rounded-xl" />)}</div>
        ) : (r.data?.items ?? []).length === 0 ? <Card>{empty}</Card> : (
          <>
            <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4", r.isFetching && "opacity-70 transition-opacity")}>
              {r.data!.items.map((s) => <SupplierCard key={s.id} s={s} />)}
            </div>
            {(r.data?.total ?? 0) > pageSize && (
              <div className="flex items-center justify-between text-xs text-muted">
                <span className="num">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, r.data!.total)} of {num(r.data!.total)}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                  <Button size="sm" variant="secondary" disabled={page * pageSize >= r.data!.total} onClick={() => setPage(page + 1)}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
    </div>
  );
}

/* ============================================================== Discover */
type Candidate = {
  name: string; website: string; supplier_type: string; country: string; summary: string; source_ids: string[]; source_urls: string[]; claims_authorised: boolean; claim_quote: string;
  is_brand_official_site: boolean; listed_on_brand_site: boolean; emails: string[]; phones: string[]; products: string[]; moq: string; certifications: string[]; existing_id: number | null;
};
type DiscoverRes = {
  candidates: Candidate[]; brand_owner: { company: string; website: string; distributor_locator_url: string; reseller_policy_url: string; source_urls: string[] };
  notes: string[]; searched: number; pages_read: number; source: { provider: string; classification: string; retrieved_at: string }; warning: string; brand_id?: number;
};

function SourcingModes() {
  return (
    <Card>
      <CardHeader eyebrow="How discovery works" title="Branded vs unbranded sourcing" description="Choose the mode that matches what you'll sell. Results come from public web pages and are cited so you can check every claim." />
      <CardBody className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-line bg-surface-2 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="size-4 text-primary" />Branded (resale)</div>
          <p className="mt-1.5 text-[13px] text-muted">You resell an existing brand. Kestrel looks for the brand's official site, its distributor or stockist locator, reseller policy and trade-account pages.</p>
          <ul className="mt-3 space-y-1.5 text-[13px] text-muted">
            <li className="flex gap-2"><span className="text-subtle">•</span>Buy from the brand or a distributor the brand itself lists or confirms in writing.</li>
            <li className="flex gap-2"><span className="text-subtle">•</span>A supplier saying it's “authorised” is not proof. Record brand evidence on the profile.</li>
            <li className="flex gap-2"><span className="text-subtle">•</span>Check eligibility for the brand in Seller Central before you buy.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-line bg-surface-2 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold"><Building2 className="size-4 text-cyan" />Unbranded (private label)</div>
          <p className="mt-1.5 text-[13px] text-muted">You sell under your own brand. Kestrel looks for manufacturers, OEM/ODM factories, private-label makers and wholesale suppliers.</p>
          <ul className="mt-3 space-y-1.5 text-[13px] text-muted">
            <li className="flex gap-2"><span className="text-subtle">•</span>Verify the company on its national register and check the VAT number.</li>
            <li className="flex gap-2"><span className="text-subtle">•</span>Ask for certifications, samples and a full commercial invoice.</li>
            <li className="flex gap-2"><span className="text-subtle">•</span>Compare landed cost, MOQ and lead time across quotations.</li>
          </ul>
        </div>
      </CardBody>
    </Card>
  );
}

function CandidateCard({ c, brand, product, onSaved }: { c: Candidate; brand: string; product: PickedProduct | null; onSaved: (id: number) => void }) {
  const { can } = useSession();
  const qc = useQueryClient();
  const [savedId, setSavedId] = useState<number | null>(c.existing_id);
  const save = useMutation({
    mutationFn: () => post<{ id: number }>("/suppliers/discover/save", { candidate: c, brand, product_id: product?.id ?? null }),
    onSuccess: (r) => { setSavedId(r.id); onSaved(r.id); qc.invalidateQueries({ queryKey: ["suppliers"] }); toast.success(`${c.name} added to your suppliers`, { description: "Status starts as unverified. Verify it on the profile." }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Card className="flex flex-col p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">{c.name}</span>{c.is_brand_official_site && <Badge size="sm" tone="cyan">Brand's own site</Badge>}</div>
          <div className="mt-0.5 text-xs text-muted">{typeLabel(c.supplier_type)}{c.country ? ` · ${countryName(c.country)}` : ""}{c.website ? <> · <a className="text-primary hover:underline" href={hrefOf(c.website)} target="_blank" rel="noreferrer">{hostOf(c.website)}</a></> : null}</div>
        </div>
        {savedId ? (
          <Button size="sm" variant="secondary" asChild><Link href={`/suppliers/${savedId}`}>{c.existing_id ? "In your suppliers" : "Open profile"}<ArrowRight /></Link></Button>
        ) : (
          <Tooltip content={can("analyst") ? null : "Analyst role or above"}><span className="inline-flex"><Button size="sm" disabled={!can("analyst")} loading={save.isPending} onClick={() => save.mutate()}><Plus />Save</Button></span></Tooltip>
        )}
      </div>
      {c.summary && <p className="mt-3 text-[13px] text-muted">{c.summary}</p>}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {c.listed_on_brand_site && <Tooltip content="The AI found this company listed on a page of the brand's own domain. Open the cited source and record it as brand-locator evidence on the profile."><span className="inline-flex"><Badge size="sm" tone="primary">Possibly listed on brand site · check source</Badge></span></Tooltip>}
        {c.claims_authorised && <Tooltip content={c.claim_quote ? `“${c.claim_quote}”` : "The company's own text claims it is authorised."}><span className="inline-flex"><Badge size="sm" tone="warning"><AlertTriangle className="size-3" />Claims to be authorised · not proof</Badge></span></Tooltip>}
        {c.moq && <Badge size="sm">MOQ {c.moq}</Badge>}
        {c.certifications.map((x) => <Badge key={x} size="sm">{x}</Badge>)}
      </div>
      {c.products.length > 0 && <div className="mt-3 text-xs text-muted"><span className="text-subtle">Products: </span>{c.products.slice(0, 6).join(", ")}</div>}
      {(c.emails.length > 0 || c.phones.length > 0) && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          {c.emails.map((e) => <span key={e} className="inline-flex items-center gap-1"><Mail className="size-3.5 text-subtle" />{e}</span>)}
          {c.phones.map((p) => <span key={p} className="inline-flex items-center gap-1"><Phone className="size-3.5 text-subtle" />{p}</span>)}
        </div>
      )}
      <div className="mt-auto pt-3">
        <div className="mb-1.5 mt-1 border-t border-line pt-3 text-2xs font-semibold uppercase tracking-wider text-subtle">Evidence ({c.source_urls.length})</div>
        {c.source_urls.length ? (
          <ul className="space-y-1">
            {c.source_urls.map((u) => <li key={u} className="truncate"><a href={u} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1.5 text-xs text-primary hover:underline"><Link2 className="size-3 shrink-0" /><span className="truncate">{u}</span></a></li>)}
          </ul>
        ) : <p className="text-xs text-subtle">No source cited. Treat with caution.</p>}
      </div>
    </Card>
  );
}

function Discover() {
  const { can } = useSession();
  const [mode, setMode] = useState<"unbranded" | "branded">("unbranded");
  const [product, setProduct] = useState("");
  const [brand, setBrand] = useState("");
  const [region, setRegion] = useState("UK");
  const [linked, setLinked] = useState<PickedProduct | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const run = useMutation({
    mutationFn: () => post<DiscoverRes>("/suppliers/discover", { product: product.trim(), brand: mode === "branded" ? brand.trim() : "", region, mode }),
    onSuccess: (d) => { setSavedCount(0); toast.success(`${d.candidates.length} candidate${d.candidates.length === 1 ? "" : "s"} found`); },
  });
  const invalid = product.trim().length < 2 || (mode === "branded" && !brand.trim());
  const d = run.data;
  const bo = d?.brand_owner;
  const hasBo = !!bo && !!(bo.company || bo.website || bo.distributor_locator_url || bo.reseller_policy_url);
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader eyebrow="Web & registry discovery" title="Find suppliers for a product or brand" description="Searches the public web, reads the most relevant pages and extracts companies with citations. Uses Brave Search and Claude." />
        <CardBody>
          <form className="grid gap-4 md:grid-cols-12" onSubmit={(e) => { e.preventDefault(); if (!invalid) run.mutate(); }}>
            <Field label="Mode" className="md:col-span-12">
              <Segmented value={mode} onChange={setMode} options={[{ value: "unbranded", label: "Unbranded / private label" }, { value: "branded", label: "Branded resale" }]} />
            </Field>
            <Field label="Product" className={mode === "branded" ? "md:col-span-4" : "md:col-span-7"}><Input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="e.g. bamboo cutting board" maxLength={200} /></Field>
            {mode === "branded" && <Field label="Brand" className="md:col-span-3"><Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Joseph Joseph" /></Field>}
            <Field label="Region" className="md:col-span-2"><Select value={region} onChange={setRegion} options={[{ value: "UK", label: "UK" }, { value: "EU", label: "EU" }, { value: "US", label: "US" }, { value: "INTL", label: "International" }]} /></Field>
            <div className="flex items-end md:col-span-3">
              <Tooltip content={can("analyst") ? null : "Analyst role or above"}><span className="inline-flex w-full"><Button type="submit" className="w-full" disabled={invalid || !can("analyst")} loading={run.isPending}><Search />Discover</Button></span></Tooltip>
            </div>
            <Field label="Link saved suppliers to a product" className="md:col-span-12" hint="Optional. Suppliers you save from these results are linked to this product."><ProductPicker value={linked} onChange={setLinked} /></Field>
          </form>
        </CardBody>
      </Card>

      {run.isPending ? (
        <Card className="p-5">
          <div className="flex items-center gap-3 text-sm text-muted"><Sparkles className="size-4 animate-pulse text-violet" />Searching the web and reading supplier pages. This usually takes 20–60 seconds.</div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
        </Card>
      ) : run.error ? (
        <Card><AsyncError error={run.error} onRetry={() => run.mutate()} /></Card>
      ) : d ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-[13px] text-warning">
            <AlertTriangle className="size-4 shrink-0" /><span className="min-w-0 flex-1">{d.warning}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <SourceBadge source={{ provider: d.source.provider, classification: d.source.classification, retrieved_at: d.source.retrieved_at, note: `${d.searched} search results, ${d.pages_read} pages read` }} />
            <span className="num">{d.searched} results searched · {d.pages_read} pages read · {d.candidates.length} candidates</span>
            {savedCount > 0 && <Badge tone="primary" size="sm"><CheckCircle2 className="size-3" />{savedCount} saved</Badge>}
          </div>
          {mode === "branded" && hasBo && (
            <Card>
              <CardHeader eyebrow="Brand owner research" title={bo!.company || brand} description="What the sources say about the brand owner. Saved to Brand Verification."
                action={d.brand_id ? <Button size="sm" variant="secondary" asChild><Link href={`/brands?id=${d.brand_id}`}>Open brand<ArrowRight /></Link></Button> : undefined} />
              <CardBody className="grid gap-3 text-[13px] sm:grid-cols-3">
                {[["Official website", bo!.website], ["Distributor locator", bo!.distributor_locator_url], ["Reseller policy", bo!.reseller_policy_url]].map(([l, u]) => (
                  <div key={l} className="rounded-lg border border-line p-3"><div className="text-xs text-muted">{l}</div>
                    {u ? <a href={hrefOf(u)} target="_blank" rel="noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1 text-primary hover:underline"><span className="truncate">{hostOf(u)}</span><ExternalLink className="size-3 shrink-0" /></a> : <div className="mt-1 text-subtle">Not found in sources</div>}
                  </div>
                ))}
                {bo!.source_urls.length > 0 && <div className="sm:col-span-3 text-xs text-muted">Sources: {bo!.source_urls.map((u, i) => <a key={u} href={u} target="_blank" rel="noreferrer" className="mr-2 text-primary hover:underline">[{i + 1}] {hostOf(u)}</a>)}</div>}
              </CardBody>
            </Card>
          )}
          {d.notes.length > 0 && (
            <Card className="p-4"><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted"><Quote className="size-3.5" />Research notes<SourceBadge classification="ai" /></div>
              <ul className="space-y-1 text-[13px] text-muted">{d.notes.map((n, i) => <li key={i}>• {n}</li>)}</ul></Card>
          )}
          {d.candidates.length === 0 ? (
            <Card><EmptyState icon={Search} title="No supplier candidates in the sources" description="Try a broader product term, a different region or the other sourcing mode." /></Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {d.candidates.map((c, i) => <CandidateCard key={`${c.name}-${i}`} c={c} brand={mode === "branded" ? brand.trim() : ""} product={linked} onSaved={() => setSavedCount((n) => n + 1)} />)}
            </div>
          )}
        </div>
      ) : (
        <>
          <Card><EmptyState icon={Radar} title="Run a discovery search" description="Enter a product (and a brand for branded resale). Each candidate comes with the web pages it was found on, so you can check before saving." /></Card>
          <SourcingModes />
        </>
      )}
    </div>
  );
}

/* ============================================================== Page */
function SuppliersInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const { can } = useSession();
  const mode = sp.get("mode") === "discover" ? "discover" : "mine";
  const [adding, setAdding] = useState(false);
  const setMode = (m: string) => router.replace(m === "discover" ? "/suppliers?mode=discover" : "/suppliers");
  return (
    <>
      <PageHeader eyebrow="Supplier intelligence" title="Supplier Finder"
        description="Find, verify and compare manufacturers and distributors. Status is evidence-based: Kestrel never marks a supplier authorised without brand evidence."
        actions={<>
          <Button variant="secondary" asChild><Link href="/suppliers/compare"><GitCompareArrows />Compare</Link></Button>
          <Tooltip content={can("analyst") ? null : "Analyst role or above"}><span className="inline-flex"><Button disabled={!can("analyst")} onClick={() => setAdding(true)}><Plus />Add supplier</Button></span></Tooltip>
        </>}>
        <Segmented value={mode} onChange={setMode} options={[{ value: "mine", label: "My suppliers" }, { value: "discover", label: <span className="flex items-center gap-1.5"><Radar className="size-3.5" />Discover</span> }]} className="self-start" />
      </PageHeader>
      <div className="space-y-6">
        {mode === "mine" ? <MySuppliers onAdd={() => setAdding(true)} onDiscover={() => setMode("discover")} /> : <Discover />}
      </div>
      <SupplierFormDialog open={adding} onOpenChange={setAdding} onSaved={(s) => router.push(`/suppliers/${s.id}`)} />
    </>
  );
}

export default function SuppliersPage() {
  return <Suspense><SuppliersInner /></Suspense>;
}
