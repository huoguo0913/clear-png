import { getPaidPlan, grantPaidCredits } from "../../_shared/credits.js";
import { verifyCreemWebhook } from "../../_shared/creem.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  const db = env.CLEARPNG_DB;

  if (!db || !env.CREEM_WEBHOOK_SECRET) {
    return json({ error: "Creem webhook is not configured." }, 503);
  }

  const rawBody = await request.text();
  const signature = request.headers.get("creem-signature") || "";
  const verified = await verifyCreemWebhook(env, rawBody, signature);

  if (!verified) {
    return json({ error: "Webhook signature verification failed." }, 400);
  }

  const event = JSON.parse(rawBody);

  if (!event?.id || !event?.eventType) {
    return json({ error: "Invalid webhook event." }, 400);
  }

  const inserted = await db
    .prepare(
      `INSERT OR IGNORE INTO creem_webhook_events (
        id, event_type, resource_id, created_at, payload
      ) VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(
      event.id,
      event.eventType,
      event.object?.id || null,
      new Date().toISOString(),
      rawBody,
    )
    .run();

  if (inserted.meta?.changes === 0) {
    return json({ received: true, duplicate: true });
  }

  if (event.eventType === "checkout.completed") {
    await handleCheckoutCompleted(db, event.object);
  }

  return json({ received: true });
}

export function onRequest() {
  return json({ error: "Method not allowed." }, 405);
}

async function handleCheckoutCompleted(db, checkout) {
  if (!checkout?.id) return;

  const order = await db
    .prepare("SELECT * FROM creem_orders WHERE checkout_id = ? OR request_id = ?")
    .bind(checkout.id, checkout.request_id || "")
    .first();

  if (!order) return;

  const plan = getPaidPlan(order.plan);
  if (!plan) return;

  const now = new Date();
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
      checkout.status || "completed",
      now.toISOString(),
      checkout.order?.id || null,
      checkout.customer?.id || checkout.order?.customer || null,
      checkout.product?.id || checkout.order?.product || null,
      order.checkout_id,
    )
    .run();

  await grantPaidCredits(
    db,
    {
      source: "creem",
      user_id: order.user_id,
      order_id: order.checkout_id,
      plan: order.plan,
    },
    plan,
    now,
  );
}

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
