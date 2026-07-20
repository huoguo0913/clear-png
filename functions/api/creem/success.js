import { getPaidPlan, grantPaidCredits } from "../../_shared/credits.js";
import { verifyCreemRedirect } from "../../_shared/creem.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const db = env.CLEARPNG_DB;
  const requestUrl = new URL(request.url);
  const origin = env.APP_ORIGIN || requestUrl.origin;

  if (!db || !env.CREEM_API_KEY) {
    return redirect(`${origin}/pricing?checkout=failed`);
  }

  const checkoutId = requestUrl.searchParams.get("checkout_id");
  const requestId = requestUrl.searchParams.get("request_id");
  const verified = await verifyCreemRedirect(env, requestUrl.searchParams);
  const existing = await findCreemOrder(db, checkoutId, requestId);

  if (!verified) {
    if (existing && (await hasCompletedCreemPayment(db, existing))) {
      return redirect(`${origin}/?checkout=success#tool`);
    }

    return redirect(`${origin}/pricing?checkout=failed`);
  }

  const orderId = requestUrl.searchParams.get("order_id");
  const customerId = requestUrl.searchParams.get("customer_id");
  const productId = requestUrl.searchParams.get("product_id");

  if (!existing) {
    return redirect(`${origin}/pricing?checkout=failed`);
  }

  const plan = getPaidPlan(existing.plan);

  if (!plan) {
    return redirect(`${origin}/pricing?checkout=failed`);
  }

  const now = new Date();
  await markCreemOrderCompleted(db, existing, {
    orderId,
    customerId,
    productId,
    completedAt: now.toISOString(),
  });

  await grantPaidCredits(
    db,
    {
      source: "creem",
      user_id: existing.user_id,
      order_id: existing.checkout_id,
      plan: existing.plan,
    },
    plan,
    now,
  );

  return redirect(`${origin}/?checkout=success#tool`);
}

export function onRequest() {
  return new Response("Method not allowed.", { status: 405 });
}

async function findCreemOrder(db, checkoutId, requestId) {
  if (checkoutId) {
    const order = await db
      .prepare("SELECT * FROM creem_orders WHERE checkout_id = ?")
      .bind(checkoutId)
      .first();
    if (order) return order;
  }

  if (requestId) {
    return db
      .prepare("SELECT * FROM creem_orders WHERE request_id = ?")
      .bind(requestId)
      .first();
  }

  return null;
}

async function markCreemOrderCompleted(db, order, data) {
  await db
    .prepare(
      `UPDATE creem_orders
       SET status = ?, completed_at = COALESCE(completed_at, ?),
           creem_order_id = COALESCE(creem_order_id, ?),
           customer_id = COALESCE(customer_id, ?),
           product_id = COALESCE(?, product_id)
       WHERE checkout_id = ?`,
    )
    .bind(
      "completed",
      data.completedAt,
      data.orderId || null,
      data.customerId || null,
      data.productId || null,
      order.checkout_id,
    )
    .run();
}

async function hasCompletedCreemPayment(db, order) {
  if (order.status === "completed") return true;

  const grant = await db
    .prepare(
      `SELECT id
       FROM credit_grants
       WHERE source = ? AND source_id = ?
       LIMIT 1`,
    )
    .bind("creem", order.checkout_id)
    .first();

  return Boolean(grant);
}

function redirect(location) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      "Cache-Control": "no-store",
    },
  });
}
