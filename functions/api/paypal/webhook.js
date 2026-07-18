import { getPaidPlan, grantPaidCredits } from "../../_shared/credits.js";
import {
  capturePayPalOrder,
  paypalConfigured,
  verifyPayPalWebhook,
} from "../../_shared/paypal.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  const db = env.CLEARPNG_DB;

  if (!db || !paypalConfigured(env)) {
    return json({ error: "PayPal webhook is not configured." }, 503);
  }

  const event = await request.json().catch(() => null);

  if (!event?.id || !event?.event_type) {
    return json({ error: "Invalid webhook event." }, 400);
  }

  const verified = await verifyPayPalWebhook(env, request, event).catch(() => false);

  if (!verified) {
    return json({ error: "Webhook signature verification failed." }, 400);
  }

  const inserted = await db
    .prepare(
      `INSERT OR IGNORE INTO paypal_webhook_events (
        id, event_type, resource_id, created_at, payload
      ) VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(
      event.id,
      event.event_type,
      event.resource?.id || null,
      new Date().toISOString(),
      JSON.stringify(event),
    )
    .run();

  if (inserted.meta?.changes === 0) {
    return json({ received: true, duplicate: true });
  }

  if (event.event_type === "CHECKOUT.ORDER.APPROVED") {
    await handleApprovedOrder(db, env, event.resource?.id);
  }

  if (event.event_type.startsWith("PAYMENT.CAPTURE.")) {
    await handleCaptureEvent(db, event);
  }

  return json({ received: true });
}

export function onRequest() {
  return json({ error: "Method not allowed." }, 405);
}

async function handleApprovedOrder(db, env, orderId) {
  if (!orderId) return;

  const order = await findOrder(db, orderId);
  if (!order || order.status === "COMPLETED") return;

  try {
    const captured = await capturePayPalOrder(env, orderId);
    await markOrderFromCapture(db, order, captured);
  } catch {
    await db
      .prepare("UPDATE paypal_orders SET status = ? WHERE order_id = ?")
      .bind("APPROVED", orderId)
      .run();
  }
}

async function handleCaptureEvent(db, event) {
  const orderId = relatedOrderId(event);
  if (!orderId) return;

  const order = await findOrder(db, orderId);
  if (!order) return;

  const status = event.resource?.status || event.event_type.replace("PAYMENT.CAPTURE.", "");

  if (status !== "COMPLETED") {
    await db
      .prepare("UPDATE paypal_orders SET status = ? WHERE order_id = ?")
      .bind(status, orderId)
      .run();
    return;
  }

  await markOrderFromCapture(db, order, {
    status: "COMPLETED",
    payer: {
      email_address: event.resource?.payee?.email_address || null,
    },
  });
}

async function markOrderFromCapture(db, order, captured) {
  const plan = getPaidPlan(order.plan);
  if (!plan) return;

  const now = new Date();
  const payerEmail = captured.payer?.email_address || null;

  await db
    .prepare(
      `UPDATE paypal_orders
       SET status = ?, captured_at = COALESCE(captured_at, ?), payer_email = COALESCE(payer_email, ?)
       WHERE order_id = ?`,
    )
    .bind(captured.status || "COMPLETED", now.toISOString(), payerEmail, order.order_id)
    .run();

  await grantPaidCredits(db, order, plan, now);
}

async function findOrder(db, orderId) {
  return db
    .prepare("SELECT * FROM paypal_orders WHERE order_id = ?")
    .bind(orderId)
    .first();
}

function relatedOrderId(event) {
  return event.resource?.supplementary_data?.related_ids?.order_id || null;
}

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
