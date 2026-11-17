"use client";
import { AlertTriangle, BadgeCheck, CircleDashed, Factory, ShieldAlert, Store } from "lucide-react";
import * as React from "react";
import { Tooltip } from "@/components/ui/overlay";
import { Badge } from "@/components/ui/primitives";

/* ----------------------------------------------------------------------------
 * Supplier status. These labels mirror the backend's STATUS_LABEL. The green
 * success tone is used ONLY for official_brand_owner and
 * verified_authorised_distributor, the two statuses the backend assigns from
 * brand evidence. Nothing in the UI may imply authorisation otherwise.
 * -------------------------------------------------------------------------- */
export type StatusTone = "success" | "primary" | "cyan" | "neutral" | "danger" | "warning";

export const SUPPLIER_STATUS: Record<string, { label: string; tone: StatusTone; help: string }> = {
  official_brand_owner: {
    label: "Official brand owner", tone: "success",
    help: "Recorded as the brand owner, with a public-register match and brand confirmation or registry evidence on file.",
  },
  verified_authorised_distributor: {
    label: "Verified authorised distributor", tone: "success",
    help: "Brand evidence on file: either listed on the brand's own distributor page or written confirmation from the brand.",
  },
  manufacturer: {
    label: "Manufacturer", tone: "cyan",
    help: "Recorded as a manufacturer, with registry, trade-record or document evidence. This is not brand authorisation.",
  },
  established_wholesaler: {
    label: "Established wholesaler", tone: "primary",
    help: "Active on a public register, trading for 2+ years, and no failed VAT check. This is not brand authorisation.",
  },
  unverified: {
    label: "Unverified", tone: "neutral",
    help: "Not enough evidence yet. Verify against a public register and record evidence on the profile.",
  },
  high_risk: {
    label: "High risk", tone: "danger",
    help: "Risk signals were found, such as an inactive registration, failed VAT check, insolvency history or a high-risk invoice.",
  },
};

export const TONE_DOT: Record<StatusTone, string> = { success: "bg-success", primary: "bg-primary", cyan: "bg-cyan", neutral: "bg-subtle", danger: "bg-danger", warning: "bg-warning" };

export const STATUS_ORDER = ["official_brand_owner", "verified_authorised_distributor", "manufacturer", "established_wholesaler", "unverified", "high_risk"] as const;

const STATUS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  official_brand_owner: BadgeCheck, verified_authorised_distributor: BadgeCheck, manufacturer: Factory, established_wholesaler: Store, unverified: CircleDashed, high_risk: ShieldAlert,
};

export function supplierStatus(status?: string | null) {
  return SUPPLIER_STATUS[status ?? ""] ?? SUPPLIER_STATUS.unverified;
}

export function SupplierStatusBadge({ status, size = "md", withTip = true, className }: { status?: string | null; size?: "sm" | "md"; withTip?: boolean; className?: string }) {
  const st = supplierStatus(status);
  const Icon = STATUS_ICON[status ?? ""] ?? CircleDashed;
  const badge = <Badge tone={st.tone} size={size} className={className}><Icon className={size === "sm" ? "size-3" : "size-3.5"} />{st.label}</Badge>;
  if (!withTip) return badge;
  return <Tooltip content={<div className="space-y-1"><div className="font-semibold">{st.label}</div><div className="text-muted">{st.help}</div></div>}><span className="inline-flex cursor-help">{badge}</span></Tooltip>;
}

/* ---------------------------------------------------------------- Supplier types */
export const SUPPLIER_TYPES: { value: string; label: string }[] = [
  { value: "brand_owner", label: "Brand owner" },
  { value: "manufacturer", label: "Manufacturer" },
  { value: "authorised_distributor", label: "Distributor (claimed)" },
  { value: "wholesaler", label: "Wholesaler" },
  { value: "importer", label: "Importer" },
  { value: "trade_supplier", label: "Trade supplier" },
  { value: "private_label_manufacturer", label: "Private-label manufacturer" },
  { value: "oem", label: "OEM" },
  { value: "odm", label: "ODM" },
  { value: "retailer", label: "Retailer" },
];
export const typeLabel = (t?: string | null) => SUPPLIER_TYPES.find((x) => x.value === t)?.label ?? (t ? t.replace(/_/g, " ") : "—");

/* ---------------------------------------------------------------- Risk */
export function RiskBadge({ level, size = "md" }: { level?: string | null; size?: "sm" | "md" }) {
  if (!level) return <Badge size={size}>Risk not assessed</Badge>;
  const tone = level === "low" ? "primary" : level === "medium" ? "warning" : level === "high" ? "danger" : "neutral";
  return <Badge tone={tone} size={size} dot>{level.charAt(0).toUpperCase() + level.slice(1)} risk</Badge>;
}

export function VatBadge({ valid, size = "md" }: { valid: boolean | null | undefined; size?: "sm" | "md" }) {
  if (valid === true) return <Badge tone="primary" size={size}>VAT valid</Badge>;
  if (valid === false) return <Badge tone="danger" size={size}><AlertTriangle className="size-3" />VAT invalid</Badge>;
  return <Badge size={size}>VAT not checked</Badge>;
}

/* ---------------------------------------------------------------- Brand authorisation records (evidence, not a supplier status) */
export const AUTH_STATUS: Record<string, { label: string; tone: StatusTone; help: string }> = {
  listed_by_brand: { label: "Listed by brand", tone: "primary", help: "A page on the brand's own website lists this supplier. Check the cited URL." },
  confirmed_by_brand: { label: "Confirmed by brand", tone: "primary", help: "Your team recorded written confirmation from the brand." },
  claimed: { label: "Supplier claim only", tone: "warning", help: "The supplier says it's authorised. A supplier's own claim is not proof." },
  unverified: { label: "Unverified", tone: "neutral", help: "Recorded, but no brand evidence supports it." },
};
export function AuthStatusBadge({ status, size = "md" }: { status: string; size?: "sm" | "md" }) {
  const m = AUTH_STATUS[status] ?? { label: status.replace(/_/g, " "), tone: "neutral" as const, help: "" };
  return <Tooltip content={m.help || null}><span className="inline-flex cursor-help"><Badge tone={m.tone} size={size}>{m.label}</Badge></span></Tooltip>;
}

/* ---------------------------------------------------------------- Shared types */
export type SupplierBrief = {
  id: number; legal_name: string; trading_name: string; name: string; supplier_type: string; status: string; status_label: string; country: string; city: string;
  website: string; logo_url: string | null; categories: string[] | null; brands_supplied: string[] | null; moq: number | null; price_min: number | null; price_max: number | null;
  currency: string; lead_time_days: number | null; sample_available: boolean | null; score: number | null; risk_level: string | null; saved: boolean;
  registry_checked_at: string | null; vat_valid: boolean | null; years_trading: number | null; source: string; created_at: string;
  has_contact?: boolean; matched_products?: number; has_authorisation_evidence?: boolean; documentation?: string;
};

export type ScoreComponent = { label: string; score: number; max: number; note: string };

export type SupplierDetail = SupplierBrief & {
  address: string; registration_number: string; registry: string | null; registry_data: Record<string, any> | null; vat_number: string; vat_data: Record<string, any> | null;
  vat_checked_at: string | null; countries_served: string[] | null; certifications: string[] | null; shipping_options: string[] | null; communication_rating: number | null;
  quality_rating: number | null; score_components: Record<string, ScoreComponent> | null; risk_reasons: string[] | null; notes: string;
};

export type SupplierList = { total: number; items: SupplierBrief[]; status_counts: Record<string, number> };

export function initials(name: string) {
  return name.replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
}

const REGION_NAMES = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en-GB"], { type: "region" }) : null;
export function countryName(code?: string | null) {
  if (!code) return "—";
  try { return REGION_NAMES?.of(code.toUpperCase()) ?? code; } catch { return code; }
}

export function hostOf(url?: string | null) {
  if (!url) return "";
  try { return new URL(url.includes("://") ? url : `https://${url}`).hostname.replace(/^www\./, ""); } catch { return url; }
}
export function hrefOf(url: string) {
  return url.includes("://") ? url : `https://${url}`;
}
