// One plan with everything: £100 a month, or £1,080 a year (10% off).
// Payments go through Stripe Checkout; Stripe's webhook keeps the workspace status in sync.
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Workspace } from "./types";

export const PLANS = {
  monthly: { label: "Monthly", pence: 100_00, interval: "month" as const },
  yearly: { label: "Yearly", pence: 1_080_00, interval: "year" as const }, // 12 × £100 − 10%
};
export type PlanId = keyof typeof PLANS;

export const billingEnabled = () => !!process.env.STRIPE_SECRET_KEY;
export const trialDays = () => Number(process.env.TRIAL_DAYS ?? 7);

export function trialEndsAt(ws: Workspace): Date {
  return new Date(new Date(ws.createdAt).getTime() + trialDays() * 86_400_000);
}

/** Can this workspace run agents? */
export function access(ws: Workspace): { ok: boolean; why: string } {
  if (!billingEnabled()) return { ok: true, why: "Billing is off on this server." };
  const st = ws.billing?.status;
  if (st === "active" || st === "trialing") return { ok: true, why: "Subscribed." };
  if (st === "past_due") return { ok: true, why: "Payment failed — update your card in Plan & billing." };
  if (Date.now() < trialEndsAt(ws).getTime()) return { ok: true, why: "Free trial." };
  return { ok: false, why: "Your free trial has ended. Choose a plan in Plan & billing (£100 a month, or £1,080 a year — save 10%)." };
}

export const isOwnerEmail = (email: string) =>
  (process.env.OWNER_EMAILS || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());

export async function stripe<T = Record<string, unknown>>(path: string, params?: Record<string, string>, method = params ? "POST" : "GET"): Promise<T> {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: { authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, "content-type": "application/x-www-form-urlencoded" },
    body: params ? new URLSearchParams(params) : undefined,
  });
  const j = (await r.json()) as T & { error?: { message?: string } };
  if (!r.ok) throw new Error(`Stripe: ${j.error?.message || r.status}`);
  return j;
}

/** Verify a Stripe webhook signature (header "t=…,v1=…"). */
export function verifyStripe(body: string, header: string | null): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !header) return false;
  const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=") as [string, string]));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > 300) return false;
  const expect = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
  return header.split(",").filter((kv) => kv.startsWith("v1=")).some((kv) => {
    const a = Buffer.from(kv.slice(3)), b = Buffer.from(expect);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}
