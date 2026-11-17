import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SYMBOL: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", CAD: "C$", AUD: "A$", CNY: "¥", JPY: "¥", INR: "₹" };
export const currencySymbol = (c = "GBP") => SYMBOL[c] ?? `${c} `;

export function money(v: number | null | undefined, currency = "GBP", opts: { compact?: boolean; decimals?: number } = {}) {
  if (v == null || !Number.isFinite(v)) return "—";
  const s = currencySymbol(currency);
  const a = Math.abs(v);
  const sign = v < 0 ? "−" : "";
  if (opts.compact && a >= 1000) {
    if (a >= 1e6) return `${sign}${s}${(a / 1e6).toFixed(a >= 1e7 ? 1 : 2)}M`;
    return `${sign}${s}${(a / 1e3).toFixed(a >= 1e4 ? 0 : 1)}k`;
  }
  return `${sign}${s}${a.toLocaleString("en-GB", { minimumFractionDigits: opts.decimals ?? 2, maximumFractionDigits: opts.decimals ?? 2 })}`;
}

export function num(v: number | null | undefined, opts: { compact?: boolean; decimals?: number } = {}) {
  if (v == null || !Number.isFinite(v)) return "—";
  const a = Math.abs(v);
  if (opts.compact && a >= 1000) {
    if (a >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
    return `${(v / 1e3).toFixed(a >= 1e4 ? 0 : 1)}k`;
  }
  return v.toLocaleString("en-GB", { maximumFractionDigits: opts.decimals ?? 0, minimumFractionDigits: opts.decimals && opts.decimals > 0 ? opts.decimals : 0 });
}

export const pct = (v: number | null | undefined, decimals = 0) => (v == null || !Number.isFinite(v) ? "—" : `${v.toFixed(decimals)}%`);

export function dateShort(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function ago(v?: string | null) {
  if (!v) return "never";
  const s = (Date.now() - new Date(v).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return dateShort(v);
}

export function scoreTone(s?: number | null): "success" | "warning" | "danger" | "neutral" {
  if (s == null) return "neutral";
  return s >= 70 ? "success" : s >= 45 ? "warning" : "danger";
}

export function download(filename: string, blob: Blob) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
