"use client";
import { useEffect, useState } from "react";
import { api, useApp } from "@/components/state";
import { Pricing } from "@/components/pricing";

export default function Billing() {
  const { s, toast, refresh } = useApp();
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => { if (location.search.includes("paid=1")) { toast("Thank you! Your plan is active."); void refresh(); } }, [toast, refresh]);
  if (!s) return <p className="muted">Loading…</p>;
  const b = s.billing;
  const subscribed = ["active", "trialing", "past_due"].includes(b.status);
  const go = async (plan: "monthly" | "yearly") => {
    setBusy(plan);
    try { const { url } = await api<{ url: string }>("/api/billing/checkout", { plan }); location.href = url; }
    catch (e) { toast((e as Error).message); setBusy(null); }
  };
  const portal = async () => {
    setBusy("portal");
    try { const { url } = await api<{ url: string }>("/api/billing/portal", {}); location.href = url; }
    catch (e) { toast((e as Error).message); setBusy(null); }
  };
  return (
    <>
      <div className="head"><div><h1>Plan & billing</h1><p className="muted">One plan with everything. Pay monthly, or yearly and save 10%.</p></div></div>
      <div className="card row sp" style={{ marginBottom: 16 }}>
        <div>
          <h3>{subscribed ? `Business plan · ${b.plan === "yearly" ? "Yearly" : "Monthly"}` : b.access.ok ? "Free trial" : "No active plan"}</h3>
          <p className="muted small" style={{ margin: 0 }}>
            {subscribed && b.currentPeriodEnd ? `Renews ${new Date(b.currentPeriodEnd).toLocaleDateString()}.` : !subscribed && b.access.ok ? `Trial ends ${new Date(b.trialEndsAt).toLocaleDateString()}.` : b.access.why}
            {b.status === "past_due" && " Your last payment failed — update your card."}
          </p>
        </div>
        {subscribed && <button className="btn ghost" disabled={!!busy} onClick={portal}>{busy === "portal" ? <span className="spin" /> : "Manage, switch or cancel"}</button>}
      </div>
      {!b.enabled && <p className="banner">Payments are switched off on this server (no STRIPE_SECRET_KEY), so everything is free here.</p>}
      <Pricing onPick={b.enabled && !subscribed ? go : undefined} busy={busy} current={subscribed ? b.plan : undefined} />
    </>
  );
}
