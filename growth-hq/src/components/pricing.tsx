"use client";
const FEATURES = [
  "All 60 AI agents in 8 departments",
  "All 68 one-tap jobs: SEO, social, ads, sales, operations",
  "Every connection: store, Google, Meta, TikTok, YouTube, Canva, Zapier…",
  "Approval Board with one-tap undo",
  "Daily 24/7 autopilot and weekly CEO review",
  "Reports, memory and lessons learned",
];

export function Pricing({ onPick, busy, current }: { onPick?: (plan: "monthly" | "yearly") => void; busy?: string | null; current?: string }) {
  const card = (plan: "monthly" | "yearly") => {
    const yearly = plan === "yearly";
    return (
      <div className={`card price ${yearly ? "best" : ""}`}>
        {yearly && <span className="ribbon">Save 10% · £120 off</span>}
        <h3>{yearly ? "Yearly" : "Monthly"}</h3>
        <div className="amt">{yearly ? "£1,080" : "£100"}<small> / {yearly ? "year" : "month"}</small></div>
        <p className="muted small" style={{ margin: 0 }}>{yearly ? "Works out at £90 a month, billed once a year." : "Billed monthly. Cancel any time."}</p>
        <ul>{FEATURES.map((f) => <li key={f}>{f}</li>)}</ul>
        {onPick && (
          <button className={`btn ${yearly ? "" : "ghost"}`} disabled={!!busy || current === plan} onClick={() => onPick(plan)}>
            {busy === plan ? <span className="spin" /> : current === plan ? "Your plan" : `Choose ${yearly ? "yearly" : "monthly"}`}
          </button>
        )}
      </div>
    );
  };
  return (
    <div className="stack">
      <div className="prices">{card("monthly")}{card("yearly")}</div>
      <p className="muted small" style={{ margin: 0 }}>Prices in GBP. AI usage runs on your own Claude account (console.anthropic.com), billed by Anthropic.</p>
    </div>
  );
}
