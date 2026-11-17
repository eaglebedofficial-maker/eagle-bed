"use client";
/* Chart kit on Recharts: one look across the app. Colours come from theme tokens so both themes work. */
import * as React from "react";
import {
  Area, AreaChart, Bar, BarChart, Brush, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

export const PALETTE = ["primary", "cyan", "violet", "warning", "success", "danger"] as const;
export const tokenColor = (t: string) => `rgb(var(--${t}))`;
const AXIS = { stroke: "rgb(var(--line))", tick: { fill: "rgb(var(--subtle))", fontSize: 11 }, tickLine: false, axisLine: false } as const;

function TooltipBox({ active, payload, label, labelFormat, valueFormat }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[180px] rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
      <div className="mb-1.5 font-medium text-muted">{labelFormat ? labelFormat(label) : label}</div>
      <div className="space-y-1">
        {payload.filter((p: any) => p.value != null).map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted"><span className="size-2 rounded-full" style={{ background: p.color }} />{p.name}</span>
            <span className="font-medium text-fg num">{valueFormat ? valueFormat(p.value, p.dataKey) : p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export type SeriesDef = { key: string; label: string; tone?: string; type?: "line" | "area" | "step" | "bar"; axis?: "left" | "right"; dashed?: boolean; hidden?: boolean };

/** Time-series chart for numeric x (ms timestamps). Supports two axes, step lines, brush zoom, crosshair tooltip. */
export function TimeChart({ data, series, height = 320, leftFormat, rightFormat, valueFormat, rightInverted, brush = false, className, reference }: {
  data: Record<string, number | null>[]; series: SeriesDef[]; height?: number; leftFormat?: (v: number) => string; rightFormat?: (v: number) => string;
  valueFormat?: (v: number, key: string) => string; rightInverted?: boolean; brush?: boolean; className?: string; reference?: { y: number; label: string; axis?: "left" | "right" };
}) {
  const visible = series.filter((s) => !s.hidden);
  const hasRight = visible.some((s) => s.axis === "right");
  const fmtDate = (t: number) => new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: hasRight ? 4 : 12, bottom: 0, left: 4 }}>
          <defs>{visible.map((s) => (
            <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={tokenColor(s.tone || "primary")} stopOpacity={0.22} /><stop offset="100%" stopColor={tokenColor(s.tone || "primary")} stopOpacity={0} /></linearGradient>
          ))}</defs>
          <CartesianGrid stroke="rgb(var(--line))" strokeOpacity={0.6} vertical={false} />
          <XAxis dataKey="t" type="number" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={fmtDate} minTickGap={48} {...AXIS} />
          <YAxis yAxisId="left" width={58} tickFormatter={leftFormat} {...AXIS} domain={["auto", "auto"]} />
          {hasRight && <YAxis yAxisId="right" orientation="right" width={58} tickFormatter={rightFormat} reversed={rightInverted} {...AXIS} domain={["auto", "auto"]} />}
          <RTooltip content={<TooltipBox labelFormat={(t: number) => new Date(t).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} valueFormat={valueFormat} />}
            cursor={{ stroke: "rgb(var(--line-strong))", strokeDasharray: "3 3" }} isAnimationActive={false} />
          {reference && <ReferenceLine yAxisId={reference.axis || "left"} y={reference.y} stroke="rgb(var(--warning))" strokeDasharray="4 4" label={{ value: reference.label, fill: "rgb(var(--warning))", fontSize: 11, position: "insideTopRight" }} />}
          {visible.map((s) => {
            const color = tokenColor(s.tone || "primary");
            const common = { key: s.key, dataKey: s.key, name: s.label, yAxisId: s.axis || "left", isAnimationActive: false, connectNulls: true } as const;
            if (s.type === "bar") return <Bar {...common} fill={color} fillOpacity={0.75} radius={[3, 3, 0, 0]} />;
            if (s.type === "area") return <Area {...common} type="monotone" stroke={color} strokeWidth={1.8} fill={`url(#g-${s.key})`} dot={false} />;
            return <Line {...common} type={s.type === "step" ? "stepAfter" : "monotone"} stroke={color} strokeWidth={1.8} strokeDasharray={s.dashed ? "4 3" : undefined} dot={false} activeDot={{ r: 3.5 }} />;
          })}
          {brush && <Brush dataKey="t" height={26} travellerWidth={8} stroke="rgb(var(--line-strong))" fill="rgb(var(--surface-2))" tickFormatter={fmtDate} />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Category chart (string x). */
export function CategoryChart({ data, x, series, height = 260, valueFormat, horizontal, stacked, className }: {
  data: Record<string, any>[]; x: string; series: SeriesDef[]; height?: number; valueFormat?: (v: number, key: string) => string; horizontal?: boolean; stacked?: boolean; className?: string;
}) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 8, right: 12, bottom: 0, left: horizontal ? 8 : 4 }} barCategoryGap="22%">
          <CartesianGrid stroke="rgb(var(--line))" strokeOpacity={0.6} vertical={!!horizontal} horizontal={!horizontal} />
          {/* Recharts 2 does not look inside fragments, so each axis is a direct child. */}
          {horizontal ? <XAxis type="number" tickFormatter={(v) => valueFormat ? valueFormat(v, series[0].key) : v} {...AXIS} />
            : <XAxis dataKey={x} {...AXIS} interval={0} tick={{ ...AXIS.tick, fontSize: 10 }} />}
          {horizontal ? <YAxis type="category" dataKey={x} width={140} {...AXIS} />
            : <YAxis width={56} tickFormatter={(v) => valueFormat ? valueFormat(v, series[0].key) : v} {...AXIS} />}
          <RTooltip content={<TooltipBox valueFormat={valueFormat} />} cursor={{ fill: "rgb(var(--surface-2))" }} isAnimationActive={false} />
          {series.length > 1 && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "rgb(var(--muted))" }} />}
          {series.map((s) => <Bar key={s.key} dataKey={s.key} name={s.label} stackId={stacked ? "a" : undefined} fill={tokenColor(s.tone || "primary")} radius={stacked ? 0 : horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} isAnimationActive={false} />)}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendArea({ data, x, y, tone = "primary", height = 200, valueFormat, xFormat }: { data: Record<string, any>[]; x: string; y: string; tone?: string; height?: number; valueFormat?: (v: number) => string; xFormat?: (v: any) => string }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
          <defs><linearGradient id={`ta-${y}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={tokenColor(tone)} stopOpacity={0.25} /><stop offset="100%" stopColor={tokenColor(tone)} stopOpacity={0} /></linearGradient></defs>
          <CartesianGrid stroke="rgb(var(--line))" strokeOpacity={0.6} vertical={false} />
          <XAxis dataKey={x} tickFormatter={xFormat} minTickGap={32} {...AXIS} />
          <YAxis width={52} tickFormatter={valueFormat} {...AXIS} />
          <RTooltip content={<TooltipBox valueFormat={valueFormat ? (v: number) => valueFormat(v) : undefined} labelFormat={xFormat} />} cursor={{ stroke: "rgb(var(--line-strong))", strokeDasharray: "3 3" }} isAnimationActive={false} />
          <Area type="monotone" dataKey={y} stroke={tokenColor(tone)} strokeWidth={2} fill={`url(#ta-${y})`} isAnimationActive={false} connectNulls />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Donut({ data, height = 200, valueFormat, center }: { data: { name: string; value: number; tone?: string }[]; height?: number; valueFormat?: (v: number) => string; center?: React.ReactNode }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="relative shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="68%" outerRadius="100%" paddingAngle={data.length > 1 ? 2 : 0} stroke="none" isAnimationActive={false}>
              {data.map((d, i) => <Cell key={i} fill={tokenColor(d.tone || PALETTE[i % PALETTE.length])} />)}
            </Pie>
            <RTooltip content={<TooltipBox valueFormat={valueFormat ? (v: number) => valueFormat(v) : undefined} />} isAnimationActive={false} />
          </PieChart>
        </ResponsiveContainer>
        {center && <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">{center}</div>}
      </div>
      <ul className="min-w-[140px] flex-1 space-y-2 text-[13px]">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2"><span className="size-2.5 shrink-0 rounded-full" style={{ background: tokenColor(d.tone || PALETTE[i % PALETTE.length]) }} /><span className="truncate text-muted">{d.name}</span></span>
            <span className="font-medium num">{valueFormat ? valueFormat(d.value) : d.value}<span className="ml-1.5 text-xs text-subtle">{total ? Math.round((d.value / total) * 100) : 0}%</span></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Profit waterfall: price → each cost → net. */
export function Waterfall({ steps, height = 280, valueFormat }: { steps: { label: string; value: number; kind?: "total" | "cost" | "result" }[]; height?: number; valueFormat: (v: number) => string }) {
  let run = 0;
  const data = steps.map((s) => {
    if (s.kind === "total") { run = s.value; return { label: s.label, base: 0, value: s.value, tone: "primary", raw: s.value }; }
    if (s.kind === "result") return { label: s.label, base: Math.min(0, s.value), value: Math.abs(s.value), tone: s.value >= 0 ? "success" : "danger", raw: s.value };
    const start = run;
    run -= s.value;
    return { label: s.label, base: Math.min(start, run), value: Math.abs(s.value), tone: "danger", raw: -s.value };
  });
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 4 }} barCategoryGap="18%">
          <CartesianGrid stroke="rgb(var(--line))" strokeOpacity={0.6} vertical={false} />
          <XAxis dataKey="label" {...AXIS} interval={0} tick={{ ...AXIS.tick, fontSize: 10 }} />
          <YAxis width={56} tickFormatter={valueFormat} {...AXIS} />
          <ReferenceLine y={0} stroke="rgb(var(--line-strong))" />
          <RTooltip cursor={{ fill: "rgb(var(--surface-2))" }} isAnimationActive={false}
            content={({ active, payload }: any) => active && payload?.length ? <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop"><div className="text-muted">{payload[0].payload.label}</div><div className="font-semibold num">{valueFormat(payload[0].payload.raw)}</div></div> : null} />
          <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="value" stackId="w" radius={[3, 3, 3, 3]} isAnimationActive={false}>{data.map((d, i) => <Cell key={i} fill={tokenColor(d.tone)} />)}</Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RangeButtons<T extends string | number>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5">
      {options.map((o) => (
        <button key={String(o.value)} onClick={() => onChange(o.value)} className={cn("h-7 rounded-md px-2.5 text-xs font-medium transition-colors", value === o.value ? "bg-surface text-fg shadow-card" : "text-muted hover:text-fg")}>{o.label}</button>
      ))}
    </div>
  );
}

export function SeriesToggle({ series, onToggle }: { series: SeriesDef[]; onToggle: (key: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {series.map((s) => (
        <button key={s.key} onClick={() => onToggle(s.key)} aria-pressed={!s.hidden}
          className={cn("inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors", s.hidden ? "border-line text-subtle" : "border-line-strong bg-surface-2 text-fg")}>
          <span className="size-2 rounded-full" style={{ background: s.hidden ? "rgb(var(--line-strong))" : tokenColor(s.tone || "primary") }} />{s.label}
        </button>
      ))}
    </div>
  );
}
