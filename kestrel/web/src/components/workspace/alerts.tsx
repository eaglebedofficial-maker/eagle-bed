"use client";
/* Alerts: rule builder, rule list and the event feed (/alerts/*). */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellRing, CheckCheck, Mail, PackageSearch, Play, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import type { ProductBrief } from "@/components/app/product";
import { ProductPicker } from "@/components/finance/product-picker";
import { NumInput, RoleGate, toNum } from "@/components/finance/shared";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState, ErrorState, LoadingRows, PageHeader } from "@/components/ui/data";
import { ConfirmDialog, Dialog, Select, TabPanel, Tabs, Tooltip } from "@/components/ui/overlay";
import { Badge, Button, Card, Checkbox, Field, Input, Segmented, Skeleton, Switch } from "@/components/ui/primitives";
import { del, errorMessage, get, patch, post } from "@/lib/api";
import { useSession } from "@/lib/session";
import { ago, cn } from "@/lib/utils";

type EntityType = "product" | "keyword_rank" | "supplier" | "rfq";
type Meta = { metrics: Record<EntityType, [string, string][]>; ops: string[] };
type Rule = {
  id: number; name: string; entity_type: EntityType; entity_id: number; entity_name: string | null; condition: { metric: string; op: string; value: unknown; pct: number | null };
  channels: string[]; active: boolean; last_value: { v: unknown; hit: boolean; at: string } | null; events: number; created_at: string;
};
type Event = { id: number; kind: string; title: string; body: string; payload: { value?: unknown; previous?: unknown } | null; triggered_at: string; read_at: string | null };
type Events = { unread: number; items: Event[] };

const ENTITY: Record<EntityType, { label: string; href: (id: number) => string }> = {
  product: { label: "Product", href: (id) => `/products/${id}` }, keyword_rank: { label: "Keyword rank", href: () => "/keyword-tracker" },
  supplier: { label: "Supplier", href: (id) => `/suppliers/${id}` }, rfq: { label: "Quotation", href: () => "/rfq" },
};
const OP_LABEL: Record<string, string> = { below: "falls below", above: "rises above", change_pct: "moves by at least", changes: "changes", becomes: "becomes" };
const NUMERIC = new Set(["price", "bsr", "offers", "reviews", "rating", "profit", "margin", "organic_pos", "score"]);
const BOOLEAN = new Set(["amazon_sells", "available"]);
const CHOICES: Record<string, { value: string; label: string }[]> = {
  status: [
    { value: "official_brand_owner", label: "Official brand owner" }, { value: "verified_authorised_distributor", label: "Verified authorised distributor" },
    { value: "manufacturer", label: "Manufacturer" }, { value: "established_wholesaler", label: "Established wholesaler" }, { value: "unverified", label: "Unverified" }, { value: "high_risk", label: "High risk" },
  ],
  risk_level: ["low", "medium", "high", "unknown"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) })),
  rfq_status: ["draft", "sent", "quoted", "negotiating", "accepted", "declined"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) })),
};
const choiceKey = (t: EntityType, m: string) => (t === "rfq" ? "rfq_status" : m);
function opsFor(t: EntityType, m: string, all: string[]) {
  const allowed = NUMERIC.has(m) ? ["below", "above", "change_pct", "changes"] : ["changes", "becomes"];
  if (m === "buybox_seller") return ["changes"];
  return all.filter((o) => allowed.includes(o));
}
const fmtVal = (v: unknown) => (v === true ? "yes" : v === false ? "no" : v == null || v === "" ? "—" : typeof v === "number" ? v.toLocaleString("en-GB", { maximumFractionDigits: 2 }) : String(v).replace(/_/g, " "));

export function Alerts() {
  const qc = useQueryClient();
  const { can } = useSession();
  const meta = useQuery({ queryKey: ["alerts-meta"], queryFn: () => get<Meta>("/alerts/meta"), staleTime: Infinity });
  const rules = useQuery({ queryKey: ["alert-rules"], queryFn: () => get<Rule[]>("/alerts/rules") });
  const events = useQuery({ queryKey: ["alert-events"], queryFn: () => get<Events>("/alerts/events", { limit: 200 }) });
  const [tab, setTab] = React.useState("events");
  const [evFilter, setEvFilter] = React.useState<"all" | "unread">("all");
  const [builder, setBuilder] = React.useState(false);
  const [removing, setRemoving] = React.useState<Rule | null>(null);
  const inval = () => { qc.invalidateQueries({ queryKey: ["alert-rules"] }); qc.invalidateQueries({ queryKey: ["alert-events"] }); };

  const evaluate = useMutation({ mutationFn: () => post<{ fired: number }>("/alerts/evaluate"), onSuccess: (r) => { toast.success(r.fired ? `${r.fired} alert${r.fired === 1 ? "" : "s"} fired` : "Checked — no rules triggered"); inval(); }, onError: (e) => toast.error(errorMessage(e)) });
  const readAll = useMutation({ mutationFn: () => post("/alerts/events/read-all"), onSuccess: () => { toast.success("All alerts marked as read"); qc.invalidateQueries({ queryKey: ["alert-events"] }); }, onError: (e) => toast.error(errorMessage(e)) });
  const toggle = useMutation({ mutationFn: (r: { id: number; active: boolean }) => patch(`/alerts/rules/${r.id}`, { active: r.active }), onSuccess: (_, r) => { toast.success(r.active ? "Rule resumed" : "Rule paused"); inval(); }, onError: (e) => toast.error(errorMessage(e)) });
  const remove = useMutation({ mutationFn: (id: number) => del(`/alerts/rules/${id}`), onSuccess: () => { toast.success("Rule deleted"); setRemoving(null); inval(); }, onError: (e) => toast.error(errorMessage(e)) });

  const metricLabel = (t: EntityType, m: string) => meta.data?.metrics[t]?.find(([k]) => k === m)?.[1] ?? m;
  const sentence = (r: Rule) => {
    const c = r.condition;
    const choice = CHOICES[choiceKey(r.entity_type, c.metric)]?.find((x) => x.value === c.value)?.label;
    const tail = c.op === "change_pct" ? `${c.pct}%` : c.op === "changes" ? "" : choice ?? fmtVal(c.value);
    return `${metricLabel(r.entity_type, c.metric)} ${OP_LABEL[c.op] ?? c.op} ${tail}`.trim();
  };
  const cols = React.useMemo<ColumnDef<Rule>[]>(() => [
    { header: "Rule", accessorKey: "name", cell: ({ row: { original: r } }) => <div className="min-w-[220px]"><div className="font-medium">{r.name}</div><div className="text-xs text-muted">{sentence(r)}</div></div> },
    { header: "Watching", accessorKey: "entity_name", cell: ({ row: { original: r } }) => <div className="min-w-[180px] max-w-[300px]"><Badge size="sm" className="mb-0.5">{ENTITY[r.entity_type].label}</Badge>{r.entity_name ? <Link href={ENTITY[r.entity_type].href(r.entity_id)} className="block truncate text-[13px] hover:text-primary" onClick={(e) => e.stopPropagation()}>{r.entity_name}</Link> : <div className="text-xs text-danger">Item no longer exists</div>}</div> },
    { header: "Last value", id: "last", accessorFn: (r) => r.last_value?.at, cell: ({ row: { original: r } }) => r.last_value ? <div><div className="num">{fmtVal(r.last_value.v)}</div><div className="text-2xs text-subtle">checked {ago(r.last_value.at)}</div></div> : <span className="text-subtle">—</span> },
    { header: "Channels", accessorKey: "channels", cell: ({ row: { original: r } }) => <div className="flex gap-1">{r.channels.map((c) => <Badge key={c} size="sm">{c === "in_app" ? "In-app" : c === "email" ? "Email" : c}</Badge>)}</div> },
    { header: "Fired", accessorKey: "events", meta: { align: "right" } },
    { header: "Active", accessorKey: "active", cell: ({ row: { original: r } }) => can("analyst") ? <Switch checked={r.active} onCheckedChange={(v) => toggle.mutate({ id: r.id, active: v })} /> : <Tooltip content="Analyst role or higher required"><span><Badge size="sm" tone={r.active ? "primary" : "neutral"}>{r.active ? "Active" : "Paused"}</Badge></span></Tooltip> },
    { id: "x", header: "", enableSorting: false, cell: ({ row: { original: r } }) => can("analyst") ? <Button variant="ghost" size="icon-sm" aria-label="Delete rule" onClick={() => setRemoving(r)}><Trash2 /></Button> : null },
  ], [meta.data, can]); // eslint-disable-line react-hooks/exhaustive-deps

  const evs = (events.data?.items ?? []).filter((e) => evFilter === "all" || !e.read_at);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Workspace" title="Alerts" description="Get notified when prices, ranks, sellers, profit or supplier status change. Rules are checked every 15 minutes."
        actions={<>
          <RoleGate>{(ok) => <Button variant="secondary" disabled={!ok} loading={evaluate.isPending} onClick={() => evaluate.mutate()}><Play />Check now</Button>}</RoleGate>
          <RoleGate>{(ok) => <Button disabled={!ok} onClick={() => setBuilder(true)}><Plus />New rule</Button>}</RoleGate>
        </>} />

      <Tabs value={tab} onValueChange={setTab} tabs={[{ value: "events", label: "Notifications", count: events.data?.unread || undefined }, { value: "rules", label: "Rules", count: rules.data?.length }]}>
        <TabPanel value="events">
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
              <Segmented size="sm" value={evFilter} onChange={setEvFilter} options={[{ value: "all", label: "All" }, { value: "unread", label: `Unread${events.data ? ` · ${events.data.unread}` : ""}` }]} />
              <Button variant="ghost" size="sm" className="ml-auto" disabled={!events.data?.unread} loading={readAll.isPending} onClick={() => readAll.mutate()}><CheckCheck />Mark all read</Button>
            </div>
            {events.isLoading ? <LoadingRows rows={5} /> : events.error ? <ErrorState error={events.error} onRetry={() => events.refetch()} /> : !evs.length ? (
              evFilter === "unread" && events.data?.items.length ? <EmptyState compact icon={CheckCheck} title="All caught up" description="No unread alerts." action={<Button variant="secondary" onClick={() => setEvFilter("all")}>Show all</Button>} />
                : <EmptyState icon={Bell} title="No alerts yet" description={rules.data?.length ? "Your rules haven't triggered yet. They're checked every 15 minutes, or run a check now." : "Create a rule to watch a product's price, rank, sellers or profit, a keyword position, or a supplier's status."}
                  action={rules.data?.length ? (can("analyst") ? <Button variant="secondary" loading={evaluate.isPending} onClick={() => evaluate.mutate()}><Play />Check now</Button> : undefined) : (can("analyst") ? <Button onClick={() => setBuilder(true)}><Plus />New rule</Button> : undefined)} />
            ) : (
              <ol className="divide-y divide-line">
                {evs.map((e) => (
                  <li key={e.id} className={cn("flex gap-3 px-4 py-3.5", !e.read_at && "bg-primary-soft/25")}>
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", e.read_at ? "bg-transparent" : "bg-primary")} aria-label={e.read_at ? undefined : "Unread"} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1"><span className="text-[13px] font-medium">{e.title}</span><Badge size="sm">{ENTITY[e.kind as EntityType]?.label ?? e.kind}</Badge></div>
                      <p className="mt-0.5 text-[13px] text-muted">{e.body}</p>
                      {e.payload && (e.payload.previous !== undefined || e.payload.value !== undefined) && <p className="mt-1 text-2xs text-subtle num">Previous {fmtVal(e.payload.previous)} → now {fmtVal(e.payload.value)}</p>}
                    </div>
                    <Tooltip content={new Date(e.triggered_at).toLocaleString("en-GB")}><span className="shrink-0 text-2xs text-subtle">{ago(e.triggered_at)}</span></Tooltip>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </TabPanel>
        <TabPanel value="rules">
          {rules.error ? <Card><ErrorState error={rules.error} onRetry={() => rules.refetch()} /></Card> : (
            <DataTable columns={cols} data={rules.data ?? []} loading={rules.isLoading || meta.isLoading} getRowId={(r) => String(r.id)}
              empty={<EmptyState icon={BellRing} title="No rules yet" description="Rules watch one item each — a product, keyword rank, supplier or quotation — and notify you in-app or by email."
                action={can("analyst") ? <Button onClick={() => setBuilder(true)}><Plus />New rule</Button> : undefined} />} />
          )}
        </TabPanel>
      </Tabs>

      {builder && meta.data && <RuleBuilder open={builder} onOpenChange={setBuilder} meta={meta.data} onCreated={() => { inval(); setTab("rules"); }} />}
      {builder && meta.error && <Dialog open onOpenChange={setBuilder} title="New rule"><ErrorState error={meta.error} onRetry={() => meta.refetch()} /></Dialog>}
      <ConfirmDialog open={!!removing} onOpenChange={(v) => !v && setRemoving(null)} title="Delete rule?" description={<>Delete <b>{removing?.name}</b> and its notification history?</>}
        confirmLabel="Delete" loading={remove.isPending} onConfirm={() => removing && remove.mutate(removing.id)} />
    </div>
  );
}

/* ---------------------------------------------------------------- condition builder */
type Option = { id: number; label: string; sub?: string };
function useEntityOptions(t: EntityType, enabled: boolean) {
  return useQuery({
    queryKey: ["alert-entities", t], enabled: enabled && t !== "product",
    queryFn: async (): Promise<Option[]> => {
      if (t === "supplier") return (await get<{ items: { id: number; name: string; country: string; status_label: string }[] }>("/suppliers", { page_size: 200, sort: "name" })).items.map((s) => ({ id: s.id, label: s.name, sub: `${s.country} · ${s.status_label}` }));
      if (t === "keyword_rank") return (await get<{ id: number; keyword: string; asin: string }[]>("/keywords/tracks", { days: 1 })).map((k) => ({ id: k.id, label: `“${k.keyword}”`, sub: k.asin }));
      return (await get<{ items: { id: number; product_desc: string; supplier: string; status: string }[] }>("/rfq")).items.map((q) => ({ id: q.id, label: q.product_desc, sub: `${q.supplier} · ${q.status}` }));
    },
  });
}

function RuleBuilder({ open, onOpenChange, meta, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; meta: Meta; onCreated: () => void }) {
  const [t, setT] = React.useState<EntityType>("product");
  const [entity, setEntity] = React.useState<{ id: number; label: string } | null>(null);
  const [metric, setMetric] = React.useState(meta.metrics.product?.[0]?.[0] ?? "price");
  const [op, setOp] = React.useState("below");
  const [value, setValue] = React.useState("");
  const [pctV, setPctV] = React.useState("10");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState(false);
  const [pickOpen, setPickOpen] = React.useState(false);
  const opts = useEntityOptions(t, open);
  const ops = opsFor(t, metric, meta.ops);
  React.useEffect(() => { if (!ops.includes(op)) setOp(ops[0]); setValue(""); }, [t, metric]); // eslint-disable-line react-hooks/exhaustive-deps
  const metrics = meta.metrics[t] ?? [];
  const metricLabel = metrics.find(([k]) => k === metric)?.[1] ?? metric;
  const choices = CHOICES[choiceKey(t, metric)];

  const parsedValue = (): unknown => {
    if (op === "changes" || op === "change_pct") return null;
    if (BOOLEAN.has(metric)) return value === "true";
    if (NUMERIC.has(metric)) return toNum(value) ?? null;
    return value || null;
  };
  const missing = !entity ? "Choose what to watch" : (op === "below" || op === "above") && toNum(value) === undefined ? "Enter a threshold" : op === "change_pct" && !toNum(pctV) ? "Enter a percentage" : op === "becomes" && !value ? "Choose a value" : null;
  const autoName = entity ? `${metricLabel} ${OP_LABEL[op]}${op === "change_pct" ? ` ${pctV}%` : op === "changes" ? "" : ` ${choices?.find((c) => c.value === value)?.label ?? (BOOLEAN.has(metric) ? (value === "true" ? "yes" : value ? "no" : "") : value)}`}`.trim() : "";

  const create = useMutation({
    mutationFn: () => post<{ id: number }>("/alerts/rules", {
      name: (name.trim() || autoName).slice(0, 160), entity_type: t, entity_id: entity!.id, metric, op, value: parsedValue(), pct: op === "change_pct" ? toNum(pctV) : null,
      channels: email ? ["in_app", "email"] : ["in_app"],
    }),
    onSuccess: () => { toast.success("Rule created", { description: "It's checked every 15 minutes." }); onCreated(); onOpenChange(false); },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="lg" title="New alert rule" description="Watch one item and get notified when a condition is met."
      footer={<><span className="mr-auto text-xs text-subtle">{missing}</span><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={!!missing} loading={create.isPending} onClick={() => create.mutate()}>Create rule</Button></>}>
      <div className="space-y-5">
        <Field label="Watch">
          <Segmented value={t} onChange={(v) => { setT(v); setEntity(null); setMetric(meta.metrics[v]?.[0]?.[0] ?? ""); }} className="flex-wrap"
            options={(Object.keys(ENTITY) as EntityType[]).filter((k) => meta.metrics[k]).map((k) => ({ value: k, label: ENTITY[k].label }))} />
        </Field>
        <Field label={ENTITY[t].label}>
          {t === "product" ? (
            <div className="flex flex-wrap items-center gap-2">
              {entity && <div className="min-w-0 flex-1 truncate rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px]">{entity.label}</div>}
              <Button variant="secondary" onClick={() => setPickOpen(true)}><PackageSearch />{entity ? "Change" : "Choose product"}</Button>
            </div>
          ) : opts.isLoading ? <Skeleton className="h-9 w-full" /> : opts.error ? <ErrorState error={opts.error} onRetry={() => opts.refetch()} className="py-4" /> : !opts.data?.length ? (
            <p className="rounded-lg border border-dashed border-line px-3 py-3 text-[13px] text-muted">
              {t === "supplier" ? <>No suppliers yet. <Link className="text-primary hover:underline" href="/suppliers">Find suppliers</Link></> : t === "keyword_rank" ? <>No tracked keywords yet. <Link className="text-primary hover:underline" href="/keyword-tracker">Track a keyword</Link></> : <>No quotations yet. <Link className="text-primary hover:underline" href="/rfq">Open RFQ Manager</Link></>}
            </p>
          ) : (
            <Select value={entity ? String(entity.id) : ""} placeholder={`Choose a ${ENTITY[t].label.toLowerCase()}`} aria-label={ENTITY[t].label}
              onChange={(v) => { const o = opts.data!.find((x) => String(x.id) === v); if (o) setEntity({ id: o.id, label: o.label }); }}
              options={opts.data.map((o) => ({ value: String(o.id), label: <span>{o.label}{o.sub && <span className="ml-1.5 text-subtle">· {o.sub}</span>}</span> }))} />
          )}
        </Field>

        <div className="rounded-xl border border-line bg-surface-2/60 p-4">
          <div className="mb-3 text-2xs font-semibold uppercase tracking-[0.08em] text-subtle">Condition</div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <Select value={metric} onChange={setMetric} options={metrics.map(([k, l]) => ({ value: k, label: l }))} aria-label="Metric" />
            <Select value={op} onChange={setOp} options={ops.map((o) => ({ value: o, label: OP_LABEL[o] ?? o }))} aria-label="Condition" />
            {op === "change_pct" ? <NumInput value={pctV} onChange={setPctV} suffix="%" aria-label="Percentage change" />
              : op === "changes" ? <div className="flex h-9 items-center text-[13px] text-subtle">any change</div>
              : BOOLEAN.has(metric) ? <Select value={value} onChange={setValue} placeholder="Choose" options={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]} aria-label="Value" />
              : choices ? <Select value={value} onChange={setValue} placeholder="Choose" options={choices} aria-label="Value" />
              : NUMERIC.has(metric) ? <NumInput value={value} onChange={setValue} placeholder="Threshold" aria-label="Threshold" />
              : <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" />}
          </div>
          {entity && <p className="mt-3 text-[13px] text-muted">Notify me when <b className="text-fg">{metricLabel.toLowerCase()}</b> of <b className="text-fg">{entity.label}</b> {OP_LABEL[op]}{op === "change_pct" ? ` ${pctV || "—"}%` : op === "changes" ? "" : ` ${autoName.split(OP_LABEL[op])[1]?.trim() || "…"}`}.</p>}
          {(op === "below" || op === "above") && <p className="mt-1 text-xs text-subtle">Fires once when the value crosses the threshold, then again only after it crosses back.</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Rule name" hint="Optional"><Input value={name} maxLength={160} onChange={(e) => setName(e.target.value)} placeholder={autoName || "e.g. Price drop"} /></Field>
          <Field label="Notify via">
            <div className="flex h-9 flex-wrap items-center gap-4">
              <Badge tone="primary"><Bell className="size-3" />In-app · always on</Badge>
              <Checkbox checked={email} onCheckedChange={setEmail} label={<span className="inline-flex items-center gap-1"><Mail className="size-3.5" />Email</span>} />
            </div>
          </Field>
        </div>
        {email && <p className="text-xs text-subtle">Emails go to the organisation's owners, admins and analysts, if outgoing email is configured for this Kestrel instance.</p>}
      </div>
      <ProductPicker open={pickOpen} onOpenChange={setPickOpen} allMarketplaces title="Choose a product to watch" onPick={(p: ProductBrief) => setEntity({ id: p.id, label: `${p.asin} · ${p.title.slice(0, 60)}` })} />
    </Dialog>
  );
}

