import type { BusinessBrief, Workspace } from "./types";
import { MASTER_AUDIT_SECTIONS, NEW_PRODUCT_RULES } from "@/catalog/rules";

export function fill(text: string, b: BusinessBrief | null, extra: Record<string, string> = {}): string {
  const v: Record<string, string> = {
    name: b?.name || "the business",
    domain: b?.domain || "the website",
    city: b?.city || "the local area",
    country: b?.country || "the market",
    language: b?.language || "plain English",
    products: b?.products || "products",
    Products: cap(b?.products || "products"),
    product: b?.product || "product",
    phone: b?.phone || "the business phone number",
    warranty: b?.warranty || "the warranty in the brief",
    adCap: b ? `${b.currency} ${b.adCapPerDay}` : "the daily ad cap",
    slots: (b?.postSlots || []).join(", ") || "the posting times",
    weeks: "2",
    focus: "none given — choose the most valuable",
    auditSections: MASTER_AUDIT_SECTIONS.join("; "),
    newProductRules: NEW_PRODUCT_RULES,
    ...extra,
  };
  return text.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in v ? v[k] : m));
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function briefText(ws: Workspace): string {
  const b = ws.brief;
  if (!b) return "BUSINESS BRIEF: not filled in yet. Ask the owner for the facts you need; state nothing as fact.";
  const lines = [
    `BUSINESS BRIEF (owner facts override everything)`,
    `Name: ${b.name} · Website: ${b.domain} · Category: ${b.category} · Sells: ${b.products}`,
    `Location: ${b.city}, ${b.country} · Language: ${b.language} · Currency: ${b.currency} · Time zone: ${b.timezone}`,
    b.phone && `Phone: ${b.phone}${b.hours ? ` (${b.hours})` : ""}`,
    b.delivery && `Delivery: ${b.delivery}`,
    b.returns && `Returns: ${b.returns}`,
    b.warranty && `Warranty/guarantee: ${b.warranty}`,
    b.payments && `Payment options: ${b.payments}`,
    `Ads: never more than ${b.currency} ${b.adCapPerDay} a day in total; budget changes need the owner's approval.`,
    `Posting times: ${b.postSlots.join(", ")} (${b.timezone}).`,
    b.competitors && `Known competitors: ${b.competitors}`,
    b.goals && `Owner's goals: ${b.goals}`,
    b.facts && `FACTS YOU MAY STATE:\n${b.facts}`,
    b.never && `NEVER SAY OR CLAIM:\n${b.never}`,
  ];
  return lines.filter(Boolean).join("\n");
}

export function memoryText(ws: Workspace): string {
  const f = ws.memory.facts.slice(-60).map((x) => `- ${x.text}`);
  const l = ws.memory.lessons.slice(-30).map((x) => `- (${x.agent}) ${x.text}`);
  return [f.length ? `REMEMBERED FACTS:\n${f.join("\n")}` : "", l.length ? `LESSONS LEARNED (follow them):\n${l.join("\n")}` : ""]
    .filter(Boolean)
    .join("\n\n");
}
