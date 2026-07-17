import { getCurrentUser, json } from "../../_shared/auth.js";
import { getPaidPlan } from "../../_shared/credits.js";
import { createPayPalOrder, paypalConfigured } from "../../_shared/paypal.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  const db = env.CLEARPNG_DB;

  if (!db || !paypalConfigured(env)) {
    return json({ error: "PayPal checkout is not configured yet." }, 503);
  }

  const user = await getCurrentUser(request, db);

  if (!user) {
    return json({ error: "Please sign in before checkout." }, 401);
  }

  const body = await request.json().catch(() => ({}));
  const planId = typeof body.plan === "string" ? body.plan : "";
  const plan = getPaidPlan(planId);

  if (!plan) {
    return json({ error: "Unknown pricing plan." }, 400);
  }

  const requestUrl = new URL(request.url);
  const origin = env.APP_ORIGIN || requestUrl.origin;
  const order = await createPayPalOrder(env, {
    intent: "CAPTURE",
    purchase_units: [
      {
        custom_id: `${user.id}:${planId}`,
        description: `ClearPNG ${plan.name} monthly image credits`,
        amount: {
          currency_code: plan.currency,
          value: plan.amount,
        },
      },
    ],
    application_context: {
      brand_name: "ClearPNG",
      landing_page: "LOGIN",
      user_action: "PAY_NOW",
      return_url: `${origin}/api/paypal/capture-order`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
    },
  });

  const approvalUrl = order.links?.find((link) => link.rel === "approve")?.href;

  if (!order.id || !approvalUrl) {
    return json({ error: "PayPal did not return an approval link." }, 502);
  }

  await db
    .prepare(
      `INSERT INTO paypal_orders (
        id, user_id, order_id, plan, amount, currency, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      user.id,
      order.id,
      planId,
      plan.amount,
      plan.currency,
      order.status || "CREATED",
      new Date().toISOString(),
    )
    .run();

  return json({ orderId: order.id, approvalUrl });
}

export function onRequest() {
  return json({ error: "Method not allowed." }, 405);
}
