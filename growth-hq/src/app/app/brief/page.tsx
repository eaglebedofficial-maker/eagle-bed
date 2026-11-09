"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, useApp } from "@/components/state";
import { CATEGORIES } from "@/catalog/categories";
import type { BusinessBrief } from "@/lib/types";

const EMPTY: BusinessBrief = {
  name: "", domain: "", category: "ecommerce", products: "", product: "", city: "", country: "United Kingdom", language: "British English",
  currency: "£", timezone: "Europe/London", phone: "", hours: "", delivery: "", returns: "", warranty: "", payments: "", facts: "",
  never: "Invented reviews or ratings\n\"Best\", \"leading\" or award claims\nMedical or safety claims\nFake discounts or countdowns", adCapPerDay: 20,
  postSlots: ["09:00", "13:00", "18:00"], competitors: "", goals: "",
};

export default function Brief() {
  const { s, refresh, toast } = useApp();
  const router = useRouter();
  const [b, setB] = useState<BusinessBrief>(EMPTY);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (s?.brief) setB({ ...EMPTY, ...s.brief }); }, [s?.brief]);
  const set = (k: keyof BusinessBrief) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setB({ ...b, [k]: e.target.value });
  const F = (k: keyof BusinessBrief, label: string, ph = "") => <label className="f">{label}<input type="text" value={String(b[k] ?? "")} onChange={set(k)} placeholder={ph} /></label>;
  const save = async () => {
    setBusy(true);
    try { await api("/api/brief", b); await refresh(); toast("Saved. Every agent now uses this brief."); if (!s?.brief) router.push("/app/connect"); }
    catch (e) { toast((e as Error).message); }
    setBusy(false);
  };
  return (
    <>
      <div className="head"><div><h1>Business brief</h1><p className="muted">Your facts override everything. Agents only say what is written here, and never what is on the &quot;never say&quot; list.</p></div></div>
      <div className="stack">
        <div className="card grid g2">
          {F("name", "Business name", "Eagle Bed")}
          {F("domain", "Website", "www.example.com")}
          <label className="f">Category<select value={b.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label} — {c.hint}</option>)}</select></label>
          {F("products", "What you sell (plural)", "beds, wedding cakes, boiler repairs")}
          {F("city", "Town / city", "Dewsbury")}
          {F("country", "Country")}
          {F("language", "Language and spelling")}
          {F("currency", "Currency symbol")}
          {F("timezone", "Time zone")}
        </div>
        <div className="card grid g2">
          {F("phone", "Phone")}
          {F("hours", "Opening hours")}
          {F("delivery", "Delivery / service area")}
          {F("returns", "Returns / cancellations")}
          {F("warranty", "Warranty / guarantee")}
          {F("payments", "Payment options")}
        </div>
        <div className="card grid g2">
          <label className="f">Facts agents may state (one per line)<textarea rows={6} value={b.facts} onChange={set("facts")} placeholder={"Handmade to order\nFree delivery in mainland area X\nFamily-run since 2015"} /></label>
          <label className="f">Never say or claim (one per line)<textarea rows={6} value={b.never} onChange={set("never")} /></label>
          {F("competitors", "Main competitors (optional)")}
          {F("goals", "Your goals (optional)", "More online orders in my city")}
          <label className="f">Max ad spend per day (total)<input type="number" min={0} value={b.adCapPerDay} onChange={(e) => setB({ ...b, adCapPerDay: Number(e.target.value) })} /></label>
          <label className="f">Posting times (comma separated)<input type="text" value={b.postSlots.join(", ")} onChange={(e) => setB({ ...b, postSlots: e.target.value.split(",").map((x) => x.trim()) })} /></label>
        </div>
        <div className="row"><button className="btn" disabled={busy} onClick={save}>{busy ? <span className="spin" /> : "Save brief"}</button></div>
      </div>
    </>
  );
}
