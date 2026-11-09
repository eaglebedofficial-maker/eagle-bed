import { stripe } from "@/lib/billing";
import { handle, HttpError, requireWorkspace } from "@/lib/session";

// Stripe's customer portal: change card, switch monthly/yearly, cancel, download invoices.
export const POST = handle(async (req: Request) => {
  const { ws } = await requireWorkspace();
  if (!ws.billing?.customerId) throw new HttpError(400, "No subscription yet.");
  const base = process.env.APP_URL || new URL(req.url).origin;
  const s = await stripe<{ url: string }>("billing_portal/sessions", { customer: ws.billing.customerId, return_url: `${base}/app/billing` });
  return Response.json({ url: s.url });
});
