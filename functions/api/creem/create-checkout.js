import { getCurrentUser, json } from "../../_shared/auth.js";
import { getPaidPlan } from "../../_shared/credits.js";
import {
  createCreemCheckout,
  creemConfigured,
  creemProductId,
} from "../../_shared/creem.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  const db = env.CLEARPNG_DB;

  if (!db || !creemConfigured(env)) {
    return json({ error: "Creem checkout is not configured yet." }, 503);
  }

  const user = await getCurrentUser(request, db);

  if (!user) {
    return json({ error: "Please sign in before checkout." }, 401);
  }

  const body = await request.json().catch(() => ({}));
  const planId = typeof body.plan === "string" ? body.plan : "";
  const plan = getPaidPlan(planId);
  const productId = creemProductId(env, planId);

  if (!plan || !productId) {
    return json({ error: "Unknown Creem pricing plan." }, 400);
  }

  const requestUrl = new URL(request.url);
  const origin = env.APP_ORIGIN || requestUrl.origin;
  const requestId = `creem:${crypto.randomUUID()}`;
  let checkout;

  try {
    checkout = await createCreemCheckout(env, {
      product_id: productId,
      request_id: requestId,
      units: 1,
      success_url: `${origin}/api/creem/success`,
      customer: {
        email: user.email,
      },
      metadata: {
        userId: user.id,
        plan: planId,
        provider: "creem",
      },
    });
  } catch (error) {
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Creem checkout creation failed.",
      },
      502,
    );
  }

  if (!checkout.id || !checkout.checkout_url) {
    return json({ error: "Creem did not return a checkout URL." }, 502);
  }

  await db
    .prepare(
      `INSERT INTO creem_orders (
        id, user_id, checkout_id, request_id, plan, product_id, amount,
        currency, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      user.id,
      checkout.id,
      requestId,
      planId,
      productId,
      plan.amount,
      plan.currency,
      checkout.status || "pending",
      new Date().toISOString(),
    )
    .run();

  return json({ checkoutId: checkout.id, checkoutUrl: checkout.checkout_url });
}

export function onRequest() {
  return json({ error: "Method not allowed." }, 405);
}
