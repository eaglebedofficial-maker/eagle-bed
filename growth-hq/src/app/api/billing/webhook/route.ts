import { stripe, verifyStripe } from "@/lib/billing";
import { updateWorkspace } from "@/lib/store";
import type { Billing } from "@/lib/types";

interface Sub {
  id: string; status: string; customer: string; metadata?: Record<string, string>;
  current_period_end?: number; items?: { data?: { current_period_end?: number }[] };
}

const MAP: Record<string, Billing["status"]> = { active: "active", trialing: "trialing", past_due: "past_due", unpaid: "past_due", canceled: "canceled", incomplete_expired: "canceled", incomplete: "none" };

async function sync(sub: Sub) {
  const ws = sub.metadata?.ws;
  if (!ws) return;
  const end = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end;
  await updateWorkspace(ws, (w) => {
    w.billing = {
      status: MAP[sub.status] || "none",
      plan: (sub.metadata?.plan as Billing["plan"]) || w.billing?.plan,
      customerId: sub.customer,
      subscriptionId: sub.id,
      currentPeriodEnd: end ? new Date(end * 1000).toISOString() : undefined,
    };
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  if (!verifyStripe(body, req.headers.get("stripe-signature"))) return new Response("bad signature", { status: 400 });
  const ev = JSON.parse(body) as { type: string; data: { object: Record<string, unknown> } };
  const o = ev.data.object;
  if (ev.type === "checkout.session.completed" && o.subscription) await sync(await stripe<Sub>(`subscriptions/${o.subscription}`));
  if (ev.type.startsWith("customer.subscription.")) await sync(o as unknown as Sub);
  return Response.json({ received: true });
}
