"use client";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Barcode, Globe, Hash, History, Info, Link2, PlugZap, Search, Tag, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ClientProductTable, ProductExplorer } from "@/components/products/explorer";
import { ImportDialog } from "@/components/products/import-dialog";
import type { Filters, ResearchResponse } from "@/components/products/types";
import { EmptyState, ErrorState, PageHeader } from "@/components/ui/data";
import { Badge, Button, Card, Segmented } from "@/components/ui/primitives";
import { ApiError, errorMessage, post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

/** Mirrors api/app/services/products.py → parse_query, so the user sees how their input will be read. */
function detect(q: string): { type: string; label: string; icon: typeof Search } | null {
  const s = q.trim();
  if (!s) return null;
  if (/\/(dp|gp\/product|gp\/aw\/d|product-reviews)\/[A-Z0-9]{10}/i.test(s)) return { type: "url", label: "Amazon URL", icon: Link2 };
  if (/^B0[A-Z0-9]{8}$/i.test(s)) return { type: "asin", label: "ASIN", icon: Hash };
  const d = s.replace(/[\s-]/g, "");
  if (/^\d{13}$/.test(d)) return d.startsWith("978") || d.startsWith("979") ? { type: "isbn", label: "ISBN-13", icon: Barcode } : { type: "ean", label: "EAN", icon: Barcode };
  if (/^\d{12}$/.test(d)) return { type: "upc", label: "UPC", icon: Barcode };
  if (/^\d{9}[\dX]$/i.test(d)) return { type: "isbn", label: "ISBN-10", icon: Barcode };
  return { type: "keyword", label: "Keyword or brand", icon: Tag };
}

const EXAMPLES = ["bamboo cutting board", "B0CX23V2ZK", "5011423171238", "Joseph Joseph", "https://www.amazon.co.uk/dp/B0CX23V2ZK"];
const RECENT_KEY = "k:research:recent";

function readRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}

function ResearchInner() {
  const { marketplace, marketplaces, can } = useSession();
  const sp = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [view, setView] = useState<"results" | "workspace">("workspace");
  const [filters, setFilters] = useState<Filters>({});
  const [importOpen, setImportOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => setRecent(readRecent()), []);

  const search = useMutation({
    mutationFn: (text: string) => post<ResearchResponse>("/research", { q: text, marketplace }),
    onSuccess: (r, text) => {
      setView("results");
      const next = [text, ...recent.filter((x) => x !== text)].slice(0, 8);
      setRecent(next);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* per-viewer convenience only */ }
      if (!r.results.length && !r.notes.length) toast.message("No products found for that search");
    },
    onError: (e) => { if (!(e instanceof ApiError && e.notConfigured)) toast.error(errorMessage(e)); },
  });
  const run = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setQ(t);
    router.replace(`/research?q=${encodeURIComponent(t)}`);
    search.mutate(t);
  };
  useEffect(() => { const initial = sp.get("q"); if (initial && can("analyst")) search.mutate(initial); /* run once on load */ }, []); // eslint-disable-line

  const kind = detect(q);
  const res = search.data;
  const notConnected = res?.notes.some((n) => n.provider === null) ?? false;
  const providerErrors = res?.notes.filter((n) => n.provider !== null) ?? [];
  const mName = marketplaces.find((m) => m.code === (res?.marketplace ?? marketplace))?.name ?? `Amazon ${res?.marketplace ?? marketplace}`;
  const results = useMemo(() => res?.results ?? [], [res]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Product intelligence" title="Product Research"
        description="Search Amazon by keyword, brand, ASIN, UPC, EAN, ISBN or product URL. Results are saved to your Product Database with live data from your connected sources."
        actions={<><Button variant="secondary" onClick={() => setImportOpen(true)}><Upload />Import CSV</Button><Button variant="secondary" asChild><Link href="/opportunities">Opportunity Finder<ArrowRight /></Link></Button></>} />

      <Card className="relative overflow-hidden p-5 md:p-6">
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(600px 200px at 0% 0%, rgb(var(--primary) / 0.08), transparent 70%)" }} />
        <form className="relative space-y-3" onSubmit={(e) => { e.preventDefault(); run(q); }}>
          <div className="flex flex-col gap-2 md:flex-row">
            <div className="relative min-w-0 flex-1">
              <div className="flex h-12 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
                <Search className="size-5 shrink-0 text-subtle" />
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search Amazon products"
                  placeholder="Keyword, brand, ASIN, UPC, EAN, ISBN or amazon URL…" className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-fg placeholder:text-subtle focus:outline-none" />
                {kind && <Badge tone="primary" size="sm" className="hidden shrink-0 sm:inline-flex"><kind.icon className="size-3" />{kind.label}</Badge>}
                {q && <button type="button" aria-label="Clear search" onClick={() => setQ("")} className="text-subtle hover:text-fg"><X className="size-4" /></button>}
              </div>
            </div>
            <Button type="submit" size="lg" disabled={!q.trim() || !can("analyst")} loading={search.isPending} className="md:w-36"><Search />Search</Button>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5"><Globe className="size-3.5" />Searching {mName}{kind?.type === "url" ? " (or the marketplace in the URL)" : ""}</span>
            {!can("analyst") && <span className="text-warning">Viewers can browse results but can't run new searches.</span>}
            <span className="hidden text-subtle md:inline">·</span>
            <div className="flex flex-wrap gap-1.5">
              {(recent.length ? recent : EXAMPLES).slice(0, 5).map((x) => (
                <button key={x} type="button" onClick={() => run(x)} disabled={!can("analyst")} className="inline-flex max-w-[220px] items-center gap-1 truncate rounded-full border border-line bg-surface-2 px-2.5 py-1 text-xs text-muted transition-colors hover:border-line-strong hover:text-fg disabled:opacity-50">
                  {recent.length > 0 && <History className="size-3 shrink-0" />}<span className="truncate">{x}</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </Card>

      {search.error && (search.error instanceof ApiError && search.error.notConfigured ? (
        <Card><ConnectCallout message={search.error.message} onImport={() => setImportOpen(true)} /></Card>
      ) : <Card><ErrorState error={search.error} onRetry={() => run(q)} /></Card>)}

      {res && notConnected && <Card><ConnectCallout message={res.notes.find((n) => n.provider === null)?.error} onImport={() => setImportOpen(true)} /></Card>}
      {res && providerErrors.length > 0 && (
        <Card className="flex items-start gap-3 border-warning/40 p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-warning" />
          <div className="space-y-1 text-[13px]">
            <div className="font-medium">Some sources didn't respond</div>
            {providerErrors.map((n, i) => <div key={i} className="text-muted"><b className="uppercase">{n.provider?.replace("_", "-")}</b>: {n.error}</div>)}
            <div className="text-subtle">Results below come from the sources that did respond and from your saved products.</div>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented value={view} onChange={setView} options={[
          { value: "results", label: <span className="inline-flex items-center gap-1.5">Search results{res && <span className="text-2xs text-subtle num">{results.length}</span>}</span> },
          { value: "workspace", label: "All researched products" },
        ]} />
        {res && view === "results" && (
          <p className="text-xs text-muted">Read as <b className="text-fg">{res.query.type}</b> “{res.query.value}” on {mName}{res.query.type === "keyword" ? " · includes matching products already in your workspace" : ""}</p>
        )}
      </div>

      {view === "results" ? (
        search.isPending ? <Card className="p-5"><div className="flex items-center gap-3 text-sm text-muted"><Search className="size-4 animate-pulse text-primary" />Searching your connected sources… Keepa and SP-API lookups can take a few seconds.</div></Card>
          : !res ? (
            <Card><EmptyState icon={Search} title="Run a search to see results here" description="Results are fetched from Keepa, SP-API or PA-API (whichever you've connected) and saved to your workspace so you can filter, track and compare them."
              action={<Button variant="secondary" onClick={() => setView("workspace")}>Browse researched products</Button>} /></Card>
          ) : (
            <ClientProductTable items={results} storageKey="research-results"
              empty={<EmptyState compact icon={Search} title="No products found" description={notConnected ? "No Amazon data source is connected. Connect one, or import products from a CSV or the extension." : "Try a broader keyword, a brand name, or an exact ASIN."}
                action={<><Button variant="secondary" onClick={() => setImportOpen(true)}><Upload />Import CSV</Button><Button variant="ghost" asChild><Link href="/settings?tab=integrations">Integrations</Link></Button></>} />} />
          )
      ) : (
        <ProductExplorer storageKey="research-workspace" filters={filters} onFilters={setFilters}
          empty={<EmptyState compact icon={Search} title="Your product database is empty" description="Search above to pull products in, or import a CSV or the Product Pilot extension export."
            action={<Button variant="secondary" onClick={() => setImportOpen(true)}><Upload />Import CSV</Button>} />} />
      )}

      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}

function ConnectCallout({ message, onImport }: { message?: string; onImport: () => void }) {
  return (
    <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-warning-soft text-warning"><PlugZap className="size-5" /></div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="text-sm font-semibold">Live Amazon search needs a connected data source</div>
        <p className="text-[13px] text-muted">{message || "No product data source is connected."}</p>
        <ul className="grid gap-1 text-xs text-muted sm:grid-cols-3">
          <li className={cn("rounded-lg border border-line px-2.5 py-1.5")}><b className="text-fg">Keepa</b> · history, rank, offers, keyword finder</li>
          <li className="rounded-lg border border-line px-2.5 py-1.5"><b className="text-fg">SP-API</b> · catalogue, EAN/UPC lookup, offers, eligibility</li>
          <li className="rounded-lg border border-line px-2.5 py-1.5"><b className="text-fg">PA-API</b> · keyword search and product details</li>
        </ul>
        <p className="text-xs text-subtle">You can still import products from a CSV or the Product Pilot extension; Kestrel estimates and scores them from what you import.</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button variant="secondary" onClick={onImport}><Upload />Import CSV</Button>
        <Button asChild><Link href="/settings?tab=integrations">Connect a source</Link></Button>
      </div>
    </div>
  );
}

export default function ResearchPage() {
  return <Suspense><ResearchInner /></Suspense>;
}
