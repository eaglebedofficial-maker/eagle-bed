"use client";
/* Product filter system shared by Product Research and the Product Database.
   Keys match api/app/routers/products.py → apply_filters exactly. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, BookmarkPlus, Filter, LayoutTemplate, RotateCcw, Trash2, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import type { ProductBrief } from "@/components/app/product";
import { EmptyState } from "@/components/ui/data";
import { Dialog, Popover, Sheet, Tooltip } from "@/components/ui/overlay";
import { Badge, Button, Field, Input, Skeleton, Switch } from "@/components/ui/primitives";
import { del, errorMessage, get, post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { cn, currencySymbol, dateShort } from "@/lib/utils";
import type { Facets, Filters, SavedSearch } from "./types";

export type RangeDef = { key: string; label: string; money?: boolean; suffix?: string; step?: number; hint?: string; brief?: keyof ProductBrief };
export const RANGE_GROUPS: { title: string; items: RangeDef[] }[] = [
  { title: "Demand & revenue", items: [
    { key: "price", label: "Price", money: true, step: 0.01, brief: "price" },
    { key: "units", label: "Est. monthly units", brief: "units" },
    { key: "revenue", label: "Est. monthly revenue", money: true, brief: "revenue" },
    { key: "bsr", label: "Best Sellers Rank", brief: "bsr" },
  ] },
  { title: "Competition", items: [
    { key: "reviews", label: "Reviews", brief: "reviews" },
    { key: "rating", label: "Rating", step: 0.1, suffix: "★", brief: "rating" },
    { key: "offers", label: "Offers (sellers)", brief: "offers" },
    { key: "variations", label: "Variations" },
    { key: "listing_quality", label: "Listing quality", suffix: "/100" },
  ] },
  { title: "Profitability (estimates)", items: [
    { key: "profit", label: "Est. profit / unit", money: true, step: 0.01, brief: "profit" },
    { key: "margin", label: "Est. margin", suffix: "%", brief: "margin" },
    { key: "roi", label: "Est. ROI", suffix: "%", brief: "roi" },
    { key: "fba_fee", label: "FBA fee", money: true, step: 0.01, brief: "fba_fee" },
  ] },
  { title: "Size & logistics", items: [
    { key: "weight", label: "Weight", suffix: "kg", step: 0.1 },
  ] },
  { title: "Stability & score", items: [
    { key: "score", label: "Opportunity score", suffix: "/100", brief: "score" },
    { key: "price_stability", label: "Price stability", step: 0.05, hint: "0 to 1, from price history" },
    { key: "sales_consistency", label: "Sales consistency", step: 0.05, hint: "0 to 1, from rank history" },
    { key: "seasonality", label: "Seasonality", step: 0.05, hint: "0 (even) to 1 (strongly seasonal)" },
  ] },
];
export const ALL_RANGES = RANGE_GROUPS.flatMap((g) => g.items);

export const COMPETITION = [{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }];
export const FULFILMENT = [{ value: "FBA", label: "FBA" }, { value: "FBM", label: "FBM" }, { value: "AMZ", label: "Amazon" }];
const TOGGLES = [
  { key: "exclude_amazon", label: "Exclude listings Amazon sells", description: "Hide products where Amazon is a seller on the listing." },
  { key: "tracked", label: "Tracked products only", description: "Only products in your Product Tracker." },
  { key: "has_supplier", label: "Has a linked supplier", description: "At least one supplier product is linked." },
];
const LIST_KEYS = ["category", "brand", "size_tier", "competition", "fulfilment"] as const;

/** Filters the server understands but a ProductBrief can't be checked against (used to grey them out on in-memory results). */
export const SERVER_ONLY = new Set<string>([
  ...ALL_RANGES.filter((r) => !r.brief).map((r) => r.key), "age", "has_supplier", "size_tier",
]);

const isSet = (v: unknown) => v !== undefined && v !== null && v !== "" && v !== false && !(Array.isArray(v) && v.length === 0);
export const clean = (f: Filters): Filters => Object.fromEntries(Object.entries(f).filter(([, v]) => isSet(v)));
export const countActive = (f: Filters) => {
  const keys = new Set<string>();
  Object.entries(clean(f)).forEach(([k]) => { if (k !== "marketplace") keys.add(k.replace(/_(min|max)$/, "").replace(/^age_(min|max)_days$/, "age")); });
  return keys.size;
};

/** Apply the same filter vocabulary to in-memory results (research results are not paged server-side). */
export function matchesClient(p: ProductBrief & { tracked?: boolean }, f: Filters): boolean {
  const c = clean(f);
  if (c.q) {
    const q = String(c.q).toLowerCase();
    if (![p.title, p.asin, p.brand].some((x) => (x || "").toLowerCase().includes(q))) return false;
  }
  if (Array.isArray(c.category) && c.category.length && !c.category.includes(p.category)) return false;
  if (Array.isArray(c.brand) && c.brand.length && !c.brand.some((b) => (p.brand || "").toLowerCase().includes(b.toLowerCase()))) return false;
  if (Array.isArray(c.competition) && c.competition.length && !c.competition.includes(p.competition)) return false;
  if (Array.isArray(c.fulfilment) && c.fulfilment.length && !c.fulfilment.includes(p.fulfilment)) return false;
  if (c.exclude_amazon && p.amazon_sells === true) return false;
  if (c.tracked && !p.tracked) return false;
  for (const r of ALL_RANGES) {
    if (!r.brief) continue;
    const v = p[r.brief] as number | null;
    const lo = c[`${r.key}_min`], hi = c[`${r.key}_max`];
    if (isSet(lo) && (v == null || v < Number(lo))) return false;
    if (isSet(hi) && (v == null || v > Number(hi))) return false;
  }
  return true;
}

/* ---------------------------------------------------------------- facet chips */
function ChipSelect({ options, value, onChange, searchable, emptyText }: { options: { value: string; label?: string; count?: number }[]; value: string[]; onChange: (v: string[]) => void; searchable?: boolean; emptyText?: string }) {
  const [q, setQ] = React.useState("");
  const shown = options.filter((o) => !q || o.value.toLowerCase().includes(q.toLowerCase())).slice(0, 40);
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <div className="space-y-2">
      {searchable && options.length > 8 && <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-8 text-[13px]" />}
      {options.length === 0 ? <p className="text-xs text-subtle">{emptyText || "No values yet."}</p> : (
        <div className="flex flex-wrap gap-1.5">
          {shown.map((o) => {
            const on = value.includes(o.value);
            return (
              <button key={o.value} type="button" onClick={() => toggle(o.value)} aria-pressed={on}
                className={cn("inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border px-2.5 text-xs transition-colors", on ? "border-primary bg-primary-soft text-primary" : "border-line text-muted hover:border-line-strong hover:text-fg")}>
                <span className="truncate">{o.label ?? o.value}</span>{o.count != null && <span className="text-2xs opacity-70 num">{o.count}</span>}
              </button>
            );
          })}
          {value.filter((v) => !options.some((o) => o.value === v)).map((v) => (
            <button key={v} type="button" onClick={() => toggle(v)} className="inline-flex h-7 items-center gap-1 rounded-full border border-primary bg-primary-soft px-2.5 text-xs text-primary">{v}<X className="size-3" /></button>
          ))}
        </div>
      )}
    </div>
  );
}

function RangeRow({ def, f, set, currency, disabled }: { def: RangeDef; f: Filters; set: (k: string, v: string) => void; currency: string; disabled?: boolean }) {
  const prefix = def.money ? currencySymbol(currency).trim() : undefined;
  const row = (
    <div className={cn("grid grid-cols-[minmax(0,1fr)_88px_88px] items-center gap-2", disabled && "opacity-45")}>
      <div className="min-w-0"><div className="truncate text-[13px]">{def.label}</div>{def.hint && <div className="truncate text-2xs text-subtle">{def.hint}</div>}</div>
      <Input aria-label={`${def.label} minimum`} disabled={disabled} type="number" inputMode="decimal" step={def.step ?? 1} placeholder="Min" prefix={prefix} suffix={def.suffix} className="h-8 text-[13px]"
        value={String(f[`${def.key}_min`] ?? "")} onChange={(e) => set(`${def.key}_min`, e.target.value)} />
      <Input aria-label={`${def.label} maximum`} disabled={disabled} type="number" inputMode="decimal" step={def.step ?? 1} placeholder="Max" prefix={prefix} suffix={def.suffix} className="h-8 text-[13px]"
        value={String(f[`${def.key}_max`] ?? "")} onChange={(e) => set(`${def.key}_max`, e.target.value)} />
    </div>
  );
  return disabled ? <Tooltip content="Needs the full product record. Switch to “All researched products” to use this filter."><div>{row}</div></Tooltip> : row;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-3 border-b border-line pb-5 last:border-0"><h4 className="text-2xs font-semibold uppercase tracking-[0.08em] text-subtle">{title}</h4>{children}</section>;
}

/* ---------------------------------------------------------------- filter sheet */
export function FilterSheet({ open, onOpenChange, filters, onApply, unsupported }: { open: boolean; onOpenChange: (v: boolean) => void; filters: Filters; onApply: (f: Filters) => void; unsupported?: Set<string> }) {
  const { marketplace, currency } = useSession();
  const [draft, setDraft] = React.useState<Filters>(filters);
  React.useEffect(() => { if (open) setDraft(filters); }, [open, filters]);
  const facetsQ = useQuery({ queryKey: ["product-facets", marketplace], queryFn: () => get<Facets>("/products/facets", { marketplace }), enabled: open });
  const set = (k: string, v: unknown) => setDraft((d) => ({ ...d, [k]: v as Filters[string] }));
  const list = (k: (typeof LIST_KEYS)[number]) => (Array.isArray(draft[k]) ? draft[k] : []) as string[];
  const off = (k: string) => !!unsupported?.has(k);
  const n = countActive(draft);
  return (
    <Sheet open={open} onOpenChange={onOpenChange} width={520} title="Filters" description="Every filter runs on stored product data. Estimates (units, revenue, profit, score) are Kestrel models, not Amazon figures."
      footer={<><Button variant="ghost" className="mr-auto" onClick={() => setDraft({})}><RotateCcw />Reset</Button><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={() => { onApply(clean(draft)); onOpenChange(false); }}>Apply{n ? ` ${n} filter${n > 1 ? "s" : ""}` : ""}</Button></>}>
      <div className="space-y-5">
        <Section title="Text">
          <Field label="Title, ASIN, brand, EAN or UPC contains" htmlFor="f-q"><Input id="f-q" value={String(draft.q ?? "")} onChange={(e) => set("q", e.target.value)} placeholder="e.g. bamboo, B0…" /></Field>
        </Section>
        <Section title="Category & brand">
          <Field label="Category">{facetsQ.isLoading ? <Skeleton className="h-16 w-full" /> : <ChipSelect searchable options={facetsQ.data?.categories ?? []} value={list("category")} onChange={(v) => set("category", v)} emptyText="Categories appear once products are in your workspace." />}</Field>
          <Field label="Brand" hint="Matches brand names that contain any selected value.">{facetsQ.isLoading ? <Skeleton className="h-16 w-full" /> : <ChipSelect searchable options={facetsQ.data?.brands ?? []} value={list("brand")} onChange={(v) => set("brand", v)} emptyText="Brands appear once products are in your workspace." />}</Field>
        </Section>
        <Section title="Listing">
          <Field label="Competition level"><ChipSelect options={COMPETITION} value={list("competition")} onChange={(v) => set("competition", v)} /></Field>
          <Field label="Fulfilment" hint="As reported by the extension import (FBA, FBM or Amazon)."><ChipSelect options={FULFILMENT} value={list("fulfilment")} onChange={(v) => set("fulfilment", v)} /></Field>
          <div className={cn(off("size_tier") && "pointer-events-none opacity-45")}>
            <Field label="Size tier">{facetsQ.isLoading ? <Skeleton className="h-8 w-full" /> : <ChipSelect options={facetsQ.data?.size_tiers ?? []} value={list("size_tier")} onChange={(v) => set("size_tier", v)} emptyText="Size tiers appear once products have weight and dimensions." />}</Field>
          </div>
          <div className={cn("grid grid-cols-[minmax(0,1fr)_88px_88px] items-center gap-2", off("age") && "opacity-45")}>
            <div className="text-[13px]">Listing age<div className="text-2xs text-subtle">Days since first listed</div></div>
            <Input aria-label="Minimum listing age in days" disabled={off("age")} type="number" placeholder="Min" suffix="d" className="h-8 text-[13px]" value={String(draft.age_min_days ?? "")} onChange={(e) => set("age_min_days", e.target.value)} />
            <Input aria-label="Maximum listing age in days" disabled={off("age")} type="number" placeholder="Max" suffix="d" className="h-8 text-[13px]" value={String(draft.age_max_days ?? "")} onChange={(e) => set("age_max_days", e.target.value)} />
          </div>
          <div className="space-y-3 pt-1">
            {TOGGLES.map((t) => <Switch key={t.key} id={`f-${t.key}`} checked={!!draft[t.key]} onCheckedChange={(v) => !off(t.key) && set(t.key, v)} label={<span className={cn(off(t.key) && "opacity-45")}>{t.label}</span>} description={t.description} />)}
          </div>
        </Section>
        {RANGE_GROUPS.map((g) => (
          <Section key={g.title} title={g.title}>
            {g.items.map((d) => <RangeRow key={d.key} def={d} f={draft} set={set} currency={currency} disabled={off(d.key)} />)}
          </Section>
        ))}
      </div>
    </Sheet>
  );
}

/* ---------------------------------------------------------------- active chips */
export function chipLabel(k: string, v: unknown, currency: string): string {
  const r = ALL_RANGES.find((d) => `${d.key}_min` === k || `${d.key}_max` === k);
  if (r) {
    const val = r.money ? `${currencySymbol(currency).trim()}${v}` : `${v}${r.suffix && r.suffix !== "/100" ? r.suffix : ""}`;
    return `${r.label} ${k.endsWith("_min") ? "≥" : "≤"} ${val}`;
  }
  if (k === "age_min_days") return `Listed ≥ ${v} days`;
  if (k === "age_max_days") return `Listed ≤ ${v} days`;
  if (k === "q") return `“${v}”`;
  const t = TOGGLES.find((x) => x.key === k);
  if (t) return t.label;
  if (Array.isArray(v)) return `${k.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase())}: ${v.join(", ")}`;
  return `${k}: ${String(v)}`;
}

export function ActiveFilters({ filters, onChange, className }: { filters: Filters; onChange: (f: Filters) => void; className?: string }) {
  const { currency } = useSession();
  const entries = Object.entries(clean(filters)).filter(([k]) => k !== "marketplace");
  if (!entries.length) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {entries.map(([k, v]) => (
        <button key={k} onClick={() => { const n = { ...filters }; delete n[k]; onChange(n); }} className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 text-xs text-fg transition-colors hover:border-line-strong">
          <span className="truncate">{chipLabel(k, v, currency)}</span><X className="size-3 shrink-0 text-subtle" />
        </button>
      ))}
      <Button variant="ghost" size="xs" onClick={() => onChange({})}>Clear all</Button>
    </div>
  );
}

export function FilterButton({ filters, onClick }: { filters: Filters; onClick: () => void }) {
  const n = countActive(filters);
  return <Button variant={n ? "outline" : "secondary"} size="sm" onClick={onClick}><Filter />Filters{n > 0 && <Badge tone="primary" size="sm" className="num">{n}</Badge>}</Button>;
}

/* ---------------------------------------------------------------- saved filters & templates */
export const SAVED_MODULE = "products";

export function SavedFiltersMenu({ filters, onLoad }: { filters: Filters; onLoad: (f: Filters, name: string) => void }) {
  const qc = useQueryClient();
  const { can, currency } = useSession();
  const q = useQuery({ queryKey: ["saved-searches", SAVED_MODULE], queryFn: () => get<SavedSearch[]>("/saved-searches", { module: SAVED_MODULE }) });
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [tpl, setTpl] = React.useState(false);
  const save = useMutation({
    mutationFn: () => post("/saved-searches", { module: SAVED_MODULE, name: name.trim(), filters: clean(filters), is_template: tpl }),
    onSuccess: () => { toast.success(tpl ? "Template saved" : "Search saved"); setOpen(false); setName(""); qc.invalidateQueries({ queryKey: ["saved-searches"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const rm = useMutation({ mutationFn: (id: number) => del(`/saved-searches/${id}`), onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["saved-searches"] }); }, onError: (e) => toast.error(errorMessage(e)) });
  const rows = q.data ?? [];
  const canSave = can("analyst");
  return (
    <>
      <Popover align="end" className="w-80 p-2" trigger={<Button variant="secondary" size="sm"><Bookmark />Saved</Button>}>
        <div className="flex items-center justify-between px-1.5 pb-2 pt-1">
          <span className="text-2xs font-semibold uppercase tracking-wider text-subtle">Saved searches & templates</span>
          <Tooltip content={!canSave ? "Viewers can't save searches" : countActive(filters) === 0 ? "Set some filters first" : undefined}>
            <span><Button size="xs" variant="ghost" disabled={!canSave || countActive(filters) === 0} onClick={() => setOpen(true)}><BookmarkPlus />Save current</Button></span>
          </Tooltip>
        </div>
        {q.isLoading ? <div className="space-y-1.5 p-1.5"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
          : q.error ? <p className="px-2 py-3 text-xs text-danger">{errorMessage(q.error)}</p>
          : rows.length === 0 ? <EmptyState compact icon={Bookmark} title="Nothing saved yet" description="Set filters, then save them as a search or a team template." />
          : (
            <ul className="max-h-80 space-y-0.5 overflow-y-auto">
              {rows.map((s) => (
                <li key={s.id} className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2">
                  <button className="min-w-0 flex-1 text-left" onClick={() => onLoad(s.filters, s.name)}>
                    <div className="flex items-center gap-1.5 truncate text-[13px] font-medium">{s.is_template && <LayoutTemplate className="size-3.5 shrink-0 text-violet" />}<span className="truncate">{s.name}</span></div>
                    <div className="text-2xs text-subtle">{countActive(s.filters)} filter{countActive(s.filters) === 1 ? "" : "s"} · {dateShort(s.created_at)}</div>
                  </button>
                  {canSave && <Button variant="ghost" size="icon-sm" aria-label={`Delete ${s.name}`} className="opacity-60 group-hover:opacity-100" onClick={() => rm.mutate(s.id)}><Trash2 /></Button>}
                </li>
              ))}
            </ul>
          )}
      </Popover>
      <Dialog open={open} onOpenChange={setOpen} title="Save these filters" size="sm" description="Saved searches and templates are shared with everyone in your organisation."
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={!name.trim()} loading={save.isPending} onClick={() => save.mutate()}>Save</Button></>}>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (name.trim()) save.mutate(); }}>
          <Field label="Name" htmlFor="saved-name"><Input id="saved-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. UK kitchen, under 300 reviews" /></Field>
          <Switch id="saved-tpl" checked={tpl} onCheckedChange={setTpl} label="Save as a template" description="Templates are pinned to the top of the list for the whole team." />
          <div className="flex flex-wrap gap-1.5">{Object.entries(clean(filters)).filter(([k]) => k !== "marketplace").map(([k, v]) => <Badge key={k} size="sm">{chipLabel(k, v, currency)}</Badge>)}</div>
        </form>
      </Dialog>
    </>
  );
}
