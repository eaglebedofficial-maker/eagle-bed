"use client";
import { useState } from "react";
import { ACTIONS, ACTION_GROUPS } from "@/catalog/actions";
import { ActionCard, useRun } from "@/components/action-card";

export default function Actions() {
  const [group, setGroup] = useState<string>("All");
  const [q, setQ] = useState("");
  const [order, setOrder] = useState("");
  const run = useRun();
  const list = ACTIONS.filter((a) => (group === "All" || a.group === group) && (a.title + a.prompt).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="head"><div><h1>Actions</h1><p className="muted">{ACTIONS.length} one-tap jobs: everything the Eagle Bed HQ team did, ready for your business.</p></div></div>
      <div className="card" style={{ marginBottom: 14 }}>
        <h3>Give the Manager an order</h3>
        <textarea rows={2} value={order} onChange={(e) => setOrder(e.target.value)} placeholder="e.g. Get my wedding cakes onto page 1 of Google in Leeds" />
        <div className="row" style={{ marginTop: 8 }}><button className="btn" disabled={!order.trim()} onClick={() => { void run({ order }); setOrder(""); }}>Send order</button></div>
      </div>
      <input type="search" placeholder="Search actions" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search actions" />
      <div className="chips" style={{ margin: "10px 0 14px" }} role="group" aria-label="Filter">
        {["All", ...ACTION_GROUPS].map((g) => <button key={g} className="chip" aria-pressed={group === g} onClick={() => setGroup(g)}>{g}</button>)}
      </div>
      {ACTION_GROUPS.filter((g) => group === "All" || g === group).map((g) => {
        const items = list.filter((a) => a.group === g);
        if (!items.length) return null;
        return (
          <section key={g}>
            <h2 className="section">{g}</h2>
            <div className="grid g3">{items.map((a) => <ActionCard key={a.id} a={a} />)}</div>
          </section>
        );
      })}
      {!list.length && <p className="empty">No action matches.</p>}
    </>
  );
}
