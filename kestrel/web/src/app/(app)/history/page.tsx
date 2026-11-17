"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChartCandlestick, Coins, Crown, FolderSearch, ListOrdered, PackageSearch, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { ProductThumb, type ProductBrief } from "@/components/app/product";
import { ClientProductTable } from "@/components/products/explorer";
import { AveragesTable, BuyBoxShareList, HistoryCharts, SignalTiles, useHistory } from "@/components/products/history-chart";
import { ProductPicker } from "@/components/products/product-picker";
import type { ResearchResponse } from "@/components/products/types";
import { EmptyState, ErrorState, NotConfigured, PageHeader, ScoreRing, SourceBadge } from "@/components/ui/data";
import { TabPanel, Tabs, Tooltip } from "@/components/ui/overlay";
import { Badge, Button, Card, CardBody, CardHeader, Field, Input, SearchInput, Skeleton, Switch } from "@/components/ui/primitives";
import { ApiError, errorMessage, get, post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { currencySymbol, money, num } from "@/lib/utils";

type Category = { id: string; name: string; products: number | null };
type FinderResponse = { total_matches: number | null; imported: number; items: ProductBrief[]; tokens_left: number | null; selection: Record<string, unknown> };

/* ---------------------------------------------------------------- ASIN lookup */
const isIdentifier = (s: string) => /\/(dp|gp\/product|gp\/aw\/d|product-reviews)\/[A-Z0-9]{10}/i.test(s) || /^B0[A-Z0-9]{8}$/i.test(s) || /^(\d{12,13}|\d{9}[\dX])$/i.test(s.replace(/[\s-]/g, ""));

function Lookup() {
  const sp = useSearchParams();
  const router = useRouter();
  const { marketplace, can } = useSession();
  const id = Number(sp.get("id")) || null;
  const [q, setQ] = useState("");
  const [picker, setPicker] = useState(false);
  const setId = (n: number) => router.replace(`/history?id=${n}`);
  const look = useMutation({
    mutationFn: (text: string) => post<ResearchResponse>("/research", { q: text, marketplace }),
    onSuccess: (r) => {
      r.notes.forEach((n) => toast.message(n.error));
      if (r.results[0]) setId(r.results[0].id); else toast.error("No product found for that identifier.");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const h = useHistory(id ?? 0, 365, !!id);
  const p = h.data?.product;
  const a = h.data?.analytics;
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <form className="flex flex-col gap-2 md:flex-row" onSubmit={(e) => { e.preventDefault(); const t = q.trim(); if (!t) return; if (!isIdentifier(t)) { toast.error("Enter an ASIN, EAN/UPC/ISBN or Amazon product URL. For keywords, use Product Research or the Product Finder."); return; } look.mutate(t); }}>
          <SearchInput value={q} onChange={setQ} placeholder="ASIN, EAN/UPC or Amazon product URL" className="flex-1" />
          <div className="flex gap-2">
            <Tooltip content={!can("analyst") ? "Viewers can't look up new products" : undefined}><span><Button type="submit" disabled={!q.trim() || !can("analyst")} loading={look.isPending}><Search />Look up</Button></span></Tooltip>
            <Button type="button" variant="secondary" onClick={() => setPicker(true)}><PackageSearch />From workspace</Button>
          </div>
        </form>
        <p className="mt-2 text-xs text-subtle">Looking up an ASIN saves it to your workspace and refreshes it from your connected sources (Keepa history uses tokens).</p>
      </Card>

      {!id ? (
        <Card><EmptyState icon={ChartCandlestick} title="Look up a product to see its history" description="Price (Amazon, new, used, buy box, FBA, FBM), sales rank, offer counts, rating, reviews and monthly-bought history, with 30/90/180/365-day averages."
          action={<Button variant="secondary" onClick={() => setPicker(true)}><PackageSearch />Pick from your products</Button>} /></Card>
      ) : h.error && !h.data ? <Card><ErrorState error={h.error} onRetry={() => h.refetch()} /></Card> : (
        <>
          {!p ? <Skeleton className="h-20 w-full rounded-xl" /> : (
            <Card className="flex flex-wrap items-center gap-4 p-4">
              <ProductThumb src={p.image_url} size={56} />
              <div className="min-w-0 flex-1">
                <Link href={`/products/${p.id}`} className="line-clamp-1 text-sm font-semibold hover:text-primary">{p.title || p.asin}</Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted"><span className="font-mono">{p.asin}</span>{p.brand && <span>· {p.brand}</span>}<span>· {money(p.price, p.currency)}</span>{p.bsr && <span className="num">· BSR #{num(p.bsr)}</span>}</div>
              </div>
              <ScoreRing score={p.score} size={44} />
              <Button variant="secondary" size="sm" asChild><Link href={`/products/${p.id}?tab=history`}>Open product</Link></Button>
            </Card>
          )}
          <HistoryCharts productId={id} />
          {a && (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <Card>
                <CardHeader eyebrow="Analytics" title="Averages & volatility" action={a.available ? <SourceBadge source={{ provider: a.source ?? undefined, classification: a.source === "keepa" ? "licensed" : "user", period_from: a.period_from, period_to: a.period_to }} /> : undefined} />
                <CardBody className="space-y-5"><AveragesTable a={a} currency={h.data?.currency ?? "GBP"} />{a.available && <SignalTiles a={a} />}</CardBody>
              </Card>
              <Card>
                <CardHeader eyebrow="Buy box" title="Seller share, last 90 days" description={a.buybox ? `${a.buybox.changes_90d} changes · Amazon held ${Math.round(a.buybox.amazon_share * 100)}%` : undefined} />
                <CardBody><BuyBoxShareList a={a} /></CardBody>
              </Card>
            </div>
          )}
        </>
      )}
      <ProductPicker open={picker} onOpenChange={setPicker} title="Pick a product" max={1} confirmLabel="Show history" onConfirm={(rows) => { setPicker(false); if (rows[0]) setId(rows[0].id); }} />
    </div>
  );
}

/* ---------------------------------------------------------------- category search (shared) */
function CategorySearch({ onPick, picked }: { onPick: (c: Category) => void; picked?: Category | null }) {
  const { marketplace } = useSession();
  const [term, setTerm] = useState("");
  const [applied, setApplied] = useState("");
  const q = useQuery({ queryKey: ["keepa-categories", marketplace, applied], queryFn: () => get<Category[]>("/history/categories/search", { term: applied, marketplace }), enabled: applied.length > 1 });
  return (
    <div className="space-y-2">
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setApplied(term.trim()); }}>
        <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search Keepa categories, e.g. kitchen" />
        <Button type="submit" variant="secondary" disabled={term.trim().length < 2} loading={q.isFetching}><FolderSearch />Find</Button>
      </form>
      {picked && <div className="text-xs text-muted">Selected: <b className="text-fg">{picked.name}</b> <span className="font-mono">({picked.id})</span></div>}
      {q.error ? (q.error instanceof ApiError && q.error.notConfigured ? <NotConfigured provider="Keepa" message={q.error.message} className="py-6" /> : <p className="text-xs text-danger">{errorMessage(q.error)}</p>)
        : q.data && (q.data.length === 0 ? <p className="text-xs text-subtle">No categories matched “{applied}”.</p> : (
          <ul className="max-h-52 divide-y divide-line overflow-y-auto rounded-lg border border-line">
            {q.data.map((c) => (
              <li key={c.id}><button type="button" onClick={() => onPick(c)} className="flex w-full items-center gap-3 px-3 py-2 text-left text-[13px] hover:bg-surface-2">
                <span className="min-w-0 flex-1 truncate">{c.name}</span><span className="font-mono text-2xs text-subtle">{c.id}</span>{c.products != null && <span className="text-2xs text-subtle num">{num(c.products, { compact: true })} products</span>}
              </button></li>
            ))}
          </ul>
        ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Product Finder */
const FINDER_RANGES: { key: string; label: string; money?: boolean; step?: number }[] = [
  { key: "price", label: "Buy box price", money: true, step: 0.01 }, { key: "avg90_price", label: "90-day avg price", money: true, step: 0.01 },
  { key: "bsr", label: "Sales rank" }, { key: "sold", label: "Bought in past month" }, { key: "reviews", label: "Reviews" },
  { key: "rating", label: "Rating", step: 0.1 }, { key: "offers", label: "New offers" },
];

function Finder() {
  const { marketplace, currency, can } = useSession();
  const [f, setF] = useState<Record<string, string | boolean>>({});
  const [cat, setCat] = useState<Category | null>(null);
  const [limit, setLimit] = useState("50");
  const run = useMutation({
    mutationFn: () => post<FinderResponse>("/history/finder", { marketplace, filters: { ...Object.fromEntries(Object.entries(f).filter(([, v]) => v !== "" && v !== false)), ...(cat ? { category_id: cat.id } : {}) }, import_limit: Math.min(100, Math.max(1, Number(limit) || 50)) }),
    onSuccess: (r) => toast.success(`Imported ${r.imported} of ${r.total_matches != null ? num(r.total_matches) : "?"} matches${r.tokens_left != null ? ` · ${num(r.tokens_left)} Keepa tokens left` : ""}`),
    onError: (e) => { if (!(e instanceof ApiError && e.notConfigured)) toast.error(errorMessage(e)); },
  });
  const set = (k: string, v: string | boolean) => setF((x) => ({ ...x, [k]: v }));
  const sym = currencySymbol(currency).trim();
  const nc = run.error instanceof ApiError && run.error.notConfigured ? run.error : null;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader eyebrow="Keepa Product Finder" title="Find products by their numbers" description="Query Keepa's full catalogue, then import the top matches (sorted by sales rank) with 180 days of history." />
          <CardBody className="space-y-4">
            <div className="grid gap-x-4 gap-y-3 md:grid-cols-2">
              {FINDER_RANGES.map((r) => (
                <div key={r.key} className="grid grid-cols-[minmax(0,1fr)_80px_80px] items-center gap-2">
                  <span className="truncate text-[13px]">{r.label}</span>
                  <Input aria-label={`${r.label} minimum`} type="number" step={r.step ?? 1} placeholder="Min" prefix={r.money ? sym : undefined} className="h-8 text-[13px]" value={String(f[`${r.key}_min`] ?? "")} onChange={(e) => set(`${r.key}_min`, e.target.value)} />
                  <Input aria-label={`${r.label} maximum`} type="number" step={r.step ?? 1} placeholder="Max" prefix={r.money ? sym : undefined} className="h-8 text-[13px]" value={String(f[`${r.key}_max`] ?? "")} onChange={(e) => set(`${r.key}_max`, e.target.value)} />
                </div>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Title contains"><Input value={String(f.title ?? "")} onChange={(e) => set("title", e.target.value)} placeholder="e.g. bamboo" /></Field>
              <Field label="Brand (exact)"><Input value={String(f.brand ?? "")} onChange={(e) => set("brand", e.target.value)} placeholder="e.g. Joseph Joseph" /></Field>
            </div>
            <Switch id="amz-off" checked={!!f.amazon_not_selling} onCheckedChange={(v) => set("amazon_not_selling", v)} label="Amazon not selling" description="Only listings where Amazon isn't currently an in-stock seller." />
          </CardBody>
        </Card>
        <Card>
          <CardHeader eyebrow="Scope" title="Root category & import size" />
          <CardBody className="space-y-4">
            <CategorySearch onPick={setCat} picked={cat} />
            {cat && <Button variant="ghost" size="xs" onClick={() => setCat(null)}>Clear category</Button>}
            <Field label="Import up to" hint="Max 100. Each imported product costs Keepa tokens."><Input type="number" min={1} max={100} value={limit} onChange={(e) => setLimit(e.target.value)} suffix="products" /></Field>
            <div className="flex items-start gap-2 rounded-lg border border-line bg-surface-2 p-3 text-xs text-muted"><Coins className="mt-0.5 size-4 shrink-0 text-warning" />Finder queries and product imports use Keepa tokens from your own Keepa subscription.</div>
            <Tooltip content={!can("analyst") ? "Viewers can't run the Product Finder" : undefined}>
              <span className="block"><Button className="w-full" disabled={!can("analyst")} loading={run.isPending} onClick={() => run.mutate()}><SlidersHorizontal />Run Product Finder</Button></span>
            </Tooltip>
          </CardBody>
        </Card>
      </div>
      {nc ? <Card><NotConfigured provider="Keepa" message={nc.message} /></Card>
        : run.error ? <Card><ErrorState error={run.error} onRetry={() => run.mutate()} /></Card>
        : run.isPending ? <Card className="p-5 text-sm text-muted">Querying Keepa and importing matches… this can take a minute for large imports.</Card>
        : run.data && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-[13px]"><b className="num">{run.data.imported}</b> imported<span className="text-muted">of {run.data.total_matches != null ? num(run.data.total_matches) : "an unknown number of"} matches</span><SourceBadge classification="licensed" source={{ provider: "keepa" }} /></div>
            <ClientProductTable items={run.data.items} storageKey="keepa-finder" empty={<EmptyState compact icon={Search} title="No matches" description="Loosen the ranges or remove the category." />} />
          </div>
        )}
    </div>
  );
}

/* ---------------------------------------------------------------- Best sellers */
function BestSellers() {
  const { marketplace, can } = useSession();
  const [cat, setCat] = useState<Category | null>(null);
  const [manual, setManual] = useState("");
  const [limit, setLimit] = useState("30");
  const catId = cat?.id || manual.trim();
  const run = useMutation({
    mutationFn: () => post<{ imported: number; items: ProductBrief[] }>("/history/bestsellers", { marketplace, category_id: catId, import_limit: Math.min(100, Math.max(1, Number(limit) || 30)) }),
    onSuccess: (r) => toast.success(`Imported ${r.imported} best sellers`),
    onError: (e) => { if (!(e instanceof ApiError && e.notConfigured)) toast.error(errorMessage(e)); },
  });
  const nc = run.error instanceof ApiError && run.error.notConfigured ? run.error : null;
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader eyebrow="Best sellers" title="Import a category's best-seller list" description="Keepa's best-seller list for a category, imported with 180 days of history so you can score and filter it." />
        <CardBody className="grid gap-5 lg:grid-cols-2">
          <CategorySearch onPick={(c) => { setCat(c); setManual(""); }} picked={cat} />
          <div className="space-y-4">
            <Field label="…or enter a category ID" hint="Amazon browse-node / Keepa category ID."><Input value={manual} onChange={(e) => { setManual(e.target.value); setCat(null); }} placeholder="e.g. 11052681" prefix="#" /></Field>
            <Field label="Import up to" hint="Max 100."><Input type="number" min={1} max={100} value={limit} onChange={(e) => setLimit(e.target.value)} suffix="products" /></Field>
            <Tooltip content={!can("analyst") ? "Viewers can't import" : !catId ? "Choose a category first" : undefined}>
              <span className="block"><Button className="w-full" disabled={!can("analyst") || !catId} loading={run.isPending} onClick={() => run.mutate()}><ListOrdered />Import best sellers</Button></span>
            </Tooltip>
          </div>
        </CardBody>
      </Card>
      {nc ? <Card><NotConfigured provider="Keepa" message={nc.message} /></Card>
        : run.error ? <Card><ErrorState error={run.error} onRetry={() => run.mutate()} /></Card>
        : run.isPending ? <Card className="p-5 text-sm text-muted">Fetching the best-seller list and importing products…</Card>
        : run.data ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-[13px]"><Crown className="size-4 text-warning" /><b className="num">{run.data.imported}</b> best sellers imported{cat && <Badge size="sm">{cat.name}</Badge>}<SourceBadge classification="licensed" source={{ provider: "keepa" }} /></div>
            <ClientProductTable items={run.data.items} storageKey="keepa-bestsellers" empty={<EmptyState compact icon={Crown} title="Keepa returned no best sellers" description="Try a different (more specific) category." />} />
          </div>
        ) : null}
    </div>
  );
}

function HistoryInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const tab = ["lookup", "finder", "bestsellers"].includes(sp.get("tab") || "") ? sp.get("tab")! : "lookup";
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Product intelligence" title="Keepa Intelligence"
        description="Historical price, sales rank, buy box and offer data from your Keepa subscription, plus Keepa's Product Finder and best-seller lists."
        actions={<Button variant="secondary" asChild><Link href="/settings?tab=integrations">Keepa connection</Link></Button>} />
      <Tabs value={tab} onValueChange={(v) => { const id = sp.get("id"); router.replace(`/history?tab=${v}${id ? `&id=${id}` : ""}`); }}
        tabs={[{ value: "lookup", label: "ASIN history" }, { value: "finder", label: "Product Finder" }, { value: "bestsellers", label: "Best sellers" }]}>
        <TabPanel value="lookup"><Lookup /></TabPanel>
        <TabPanel value="finder"><Finder /></TabPanel>
        <TabPanel value="bestsellers"><BestSellers /></TabPanel>
      </Tabs>
    </div>
  );
}

export default function HistoryPage() {
  return <Suspense><HistoryInner /></Suspense>;
}
