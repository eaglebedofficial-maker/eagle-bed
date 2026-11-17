"use client";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button, Field, Input } from "@/components/ui/primitives";
import { errorMessage, post } from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await post("/auth/login", { email, password });
      await qc.invalidateQueries({ queryKey: ["me"] });
      router.replace(sp.get("next") || "/dashboard");
    } catch (err) { setError(errorMessage(err)); setBusy(false); }
  }
  async function demo() {
    setBusy(true); setError("");
    try {
      await post("/auth/demo");
      await qc.invalidateQueries({ queryKey: ["me"] });
      router.replace("/dashboard");
    } catch (err) { setError(errorMessage(err)); setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1.5 text-sm text-muted">Welcome back to your intelligence workspace.</p>
      </div>
      <Field label="Work email" htmlFor="email"><Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.co.uk" /></Field>
      <Field label="Password" htmlFor="password"><Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
      {error && <div role="alert" className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-[13px] text-danger">{error}</div>}
      <Button type="submit" size="lg" className="w-full" loading={busy}>Sign in</Button>
      <div className="flex items-center gap-3 text-2xs uppercase tracking-wider text-subtle"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
      <Button type="button" variant="secondary" size="lg" className="w-full" disabled={busy} onClick={demo}>Explore the demo workspace</Button>
      <p className="-mt-2 text-center text-2xs text-subtle">Fictional, clearly labelled sample data. No real products or suppliers.</p>
      <p className="text-center text-[13px] text-muted">New to Kestrel? <Link href="/register" className="font-medium text-primary hover:underline">Create an account</Link></p>
    </form>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
