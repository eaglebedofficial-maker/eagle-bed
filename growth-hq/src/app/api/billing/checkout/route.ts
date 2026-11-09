import { billingEnabled, PLANS, stripe, type PlanId } from "@/lib/billing";
import { handle, HttpError, requireWorkspace } from "@/lib/session";

export const POST = handle(async (req: Request) => {
  const { user, ws } = await requireWorkspace();
  if (!billingEnabled()) throw new HttpError(501, "Payments aren't switched on for this server yet (STRIPE_SECRET_KEY).");
  const { plan } = (await req.json()) as { plan?: PlanId };
  const p = plan && PLANS[plan];
  if (!p) throw new HttpError(400, "Choose monthly or yearly.");
  const base = process.env.APP_URL || new URL(req.url).origin;
  const s = await stripe<{ url: string }>("checkout/sessions", {
    mode: "subscription",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "gbp",
    "line_items[0][price_data][unit_amount]": String(p.pence),
    "line_items[0][price_data][recurring][interval]": p.interval,
    "line_items[0][price_data][product_data][name]": `Growth HQ Business plan (${p.label.toLowerCase()})`,
    client_reference_id: ws.id,
    "metadata[ws]": ws.id,
    "metadata[plan]": plan!,
    "subscription_data[metadata][ws]": ws.id,
    "subscription_data[metadata][plan]": plan!,
    ...(ws.billing?.customerId ? { customer: ws.billing.customerId } : { customer_email: user.email }),
    allow_promotion_codes: "true",
    success_url: `${base}/app/billing?paid=1`,
    cancel_url: `${base}/app/billing`,
  });
  return Response.json({ url: s.url });
});
