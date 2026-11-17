"use client";
/* Shared building blocks for the financial and operations tools (profit, FBA, VAT, inventory, PPC, sales, reimbursements). */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileSpreadsheet, Info, RefreshCw, Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { NotConfigured } from "@/components/ui/data";
import { Dialog, Tooltip } from "@/components/ui/overlay";
import { Button, Input, type ButtonProps } from "@/components/ui/primitives";
import { api, ApiError, errorMessage } from "@/lib/api";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

/** Parse a user-entered number. Empty or invalid input returns undefined (never a guessed value). */
export function toNum(s: string | number | null | undefined): number | undefined {
  if (s === null || s === undefined) return undefined;
  if (typeof s === "number") return Number.isFinite(s) ? s : undefined;
  const t = s.replace(/,/g, "").trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

export function useDebounced<T>(value: T, ms = 350): T {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/** Numeric input bound to a string so partially typed values ("1.") survive. */
export function NumInput({ value, onChange, prefix, suffix, placeholder, id, min, step = "any", invalid, disabled, className, "aria-label": ariaLabel }: {
  value: string; onChange: (v: string) => void; prefix?: React.ReactNode; suffix?: React.ReactNode; placeholder?: string; id?: string; min?: number; step?: string;
  invalid?: boolean; disabled?: boolean; className?: string; "aria-label"?: string;
}) {
  return (
    <Input id={id} type="number" inputMode="decimal" step={step} min={min} value={value} placeholder={placeholder} prefix={prefix} suffix={suffix} invalid={invalid}
      disabled={disabled} aria-label={ariaLabel} className={className} onChange={(e) => onChange(e.target.value)} onWheel={(e) => (e.target as HTMLInputElement).blur()} />
  );
}

/** Quiet inline notice used for methodology, caveats and provenance notes. */
export function Notice({ children, tone = "neutral", icon: Icon = Info, className }: { children: React.ReactNode; tone?: "neutral" | "warning" | "danger" | "primary"; icon?: React.ComponentType<{ className?: string }>; className?: string }) {
  const tones = { neutral: "border-line bg-surface-2 text-muted", warning: "border-warning/30 bg-warning-soft text-warning", danger: "border-danger/30 bg-danger-soft text-danger", primary: "border-primary/25 bg-primary-soft text-primary" };
  return (
    <div className={cn("flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-[13px] leading-relaxed", tones[tone], className)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** Data-source string from the backend → SourceBadge classification. */
export function classifyOpsSource(source?: string | null): "official_api" | "user" {
  return source && source.startsWith("sp_api") ? "official_api" : "user";
}
export const SOURCE_LABEL: Record<string, string> = {
  report_upload: "Report upload", sp_api: "SP-API", sp_api_metrics: "SP-API order metrics", all_orders_report: "All Orders report",
  business_report: "Business Report", settlement_report: "Settlement report", manual: "Entered manually", user: "Entered manually",
};

/** File picker styled as a drop zone. */
export function FilePick({ file, onFile, accept = ".csv,.tsv,.txt,.xlsx", label = "Choose a file", hint }: { file: File | null; onFile: (f: File | null) => void; accept?: string; label?: string; hint?: React.ReactNode }) {
  const ref = React.useRef<HTMLInputElement>(null);
  const [over, setOver] = React.useState(false);
  return (
    <div>
      <input ref={ref} type="file" accept={accept} className="sr-only" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      {file ? (
        <div className="flex items-center gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2.5">
          <FileSpreadsheet className="size-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1"><div className="truncate text-[13px] font-medium">{file.name}</div><div className="text-2xs text-subtle num">{(file.size / 1024).toFixed(1)} KB</div></div>
          <Button variant="ghost" size="icon-sm" aria-label="Remove file" onClick={() => { onFile(null); if (ref.current) ref.current.value = ""; }}><X /></Button>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
          className={cn("flex w-full flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-7 text-center transition-colors", over ? "border-primary bg-primary-soft" : "border-line-strong bg-surface-2 hover:border-primary")}>
          <Upload className="size-5 text-muted" />
          <span className="text-[13px] font-medium">{label}</span>
          <span className="text-xs text-subtle">{hint ?? "CSV, TSV or XLSX — drag and drop or click to browse"}</span>
        </button>
      )}
    </div>
  );
}

/** POST multipart form data through the shared API client. */
export const postForm = <T = any,>(path: string, form: FormData) => api<T>(path, { method: "POST", form });

/**
 * Sync button for SP-API-backed endpoints. A 424 (provider not configured) opens a dialog with the
 * standard NotConfigured state instead of a toast so the user gets a route to Settings → Integrations.
 */
export function SyncButton({ path, params, label = "Sync from SP-API", invalidate, onDone, variant = "secondary", size }: {
  path: string; params?: Record<string, unknown>; label?: string; invalidate: unknown[][]; onDone?: (r: any) => string; variant?: ButtonProps["variant"]; size?: ButtonProps["size"];
}) {
  const qc = useQueryClient();
  const { can } = useSession();
  const [nc, setNc] = React.useState<ApiError | null>(null);
  const m = useMutation({
    mutationFn: () => api(path, { method: "POST", body: {}, params }),
    onSuccess: (r) => { toast.success(onDone ? onDone(r) : "Sync complete"); invalidate.forEach((k) => qc.invalidateQueries({ queryKey: k })); },
    onError: (e) => { if (e instanceof ApiError && e.notConfigured) setNc(e); else toast.error(errorMessage(e)); },
  });
  const btn = <Button variant={variant} size={size} loading={m.isPending} disabled={!can("analyst")} onClick={() => m.mutate()}><RefreshCw />{label}</Button>;
  return (
    <>
      {can("analyst") ? btn : <Tooltip content="Analyst role or higher required"><span>{btn}</span></Tooltip>}
      <Dialog open={!!nc} onOpenChange={(v) => !v && setNc(null)} title="Amazon Selling Partner API not connected" size="md">
        <NotConfigured provider={nc?.body.provider || "Amazon SP-API"} message={nc?.message} className="py-6" />
      </Dialog>
    </>
  );
}

/** Wrap a control that needs a role, so the disabled state always explains itself. */
export function RoleGate({ role = "analyst", children }: { role?: "analyst" | "admin"; children: (allowed: boolean) => React.ReactElement }) {
  const { can } = useSession();
  const ok = can(role);
  if (ok) return children(true);
  return <Tooltip content={role === "admin" ? "Admin only" : "Analyst role or higher required"}><span className="inline-flex">{children(false)}</span></Tooltip>;
}

/** Compact definition row used in result panels. */
export function Row({ label, value, sub, strong, tone, className }: { label: React.ReactNode; value: React.ReactNode; sub?: React.ReactNode; strong?: boolean; tone?: "danger" | "success" | "muted"; className?: string }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 py-2 text-[13px]", className)}>
      <div className="min-w-0"><div className={cn(strong ? "font-medium text-fg" : "text-muted")}>{label}</div>{sub && <div className="mt-0.5 text-2xs text-subtle">{sub}</div>}</div>
      <div className={cn("shrink-0 text-right num", strong && "font-semibold", tone === "danger" && "text-danger", tone === "success" && "text-success", tone === "muted" && "text-subtle")}>{value}</div>
    </div>
  );
}

/** Filename from a Content-Disposition header. */
export function filenameFrom(res: Response, fallback: string) {
  const cd = res.headers.get("content-disposition") || "";
  const m = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
  return m ? decodeURIComponent(m[1]) : fallback;
}
