"use client";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input } from "@/components/ui/primitives";
import { errorMessage, post } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [f, setF] = useState({ name: "", email: "", organisation: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (f.password.length < 10) { setError("Use at least 10 characters for your password."); return; }
    setBusy(true); setError("");
    try {
      await post("/auth/register", f);
      await qc.invalidateQueries({ queryKey: ["me"] });
      router.replace("/dashboard");
    } catch (err) { setError(errorMessage(err)); setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create your workspace</h1>
        <p className="mt-1.5 text-sm text-muted">You'll be the owner. Invite your team once you're in.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Your name" htmlFor="name"><Input id="name" autoComplete="name" value={f.name} onChange={set("name")} /></Field>
        <Field label="Company" htmlFor="org"><Input id="org" required value={f.organisation} onChange={set("organisation")} placeholder="Eagle Bed Ltd" /></Field>
      </div>
      <Field label="Work email" htmlFor="email"><Input id="email" type="email" autoComplete="email" required value={f.email} onChange={set("email")} /></Field>
      <Field label="Password" htmlFor="password" hint="At least 10 characters."><Input id="password" type="password" autoComplete="new-password" required value={f.password} onChange={set("password")} /></Field>
      {error && <div role="alert" className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-[13px] text-danger">{error}</div>}
      <Button type="submit" size="lg" className="w-full" loading={busy}>Create workspace</Button>
      <p className="text-center text-[13px] text-muted">Already have an account? <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link></p>
    </form>
  );
}
