import { getPaidPlan, grantPaidCredits } from "../../_shared/credits.js";
import { capturePayPalOrder, paypalConfigured } from "../../_shared/paypal.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const db = env.CLEARPNG_DB;
  const requestUrl = new URL(request.url);
  const origin = env.APP_ORIGIN || requestUrl.origin;
  const orderId = requestUrl.searchParams.get("token");

  if (!db || !paypalConfigured(env) || !orderId) {
    return redirect(`${origin}/pricing?checkout=failed`);
  }

  const existing = await db
    .prepare("SELECT * FROM paypal_orders WHERE order_id = ?")
    .bind(orderId)
    .first();

  if (!existing) {
    return redirect(`${origin}/pricing?checkout=failed`);
  }

  if (existing.status === "COMPLETED") {
    return redirect(`${origin}/pricing?checkout=success`);
  }

  const plan = getPaidPlan(existing.plan);

  if (!plan) {
    return redirect(`${origin}/pricing?checkout=failed`);
  }

  try {
    const captured = await capturePayPalOrder(env, orderId);
    const now = new Date();
    const nowIso = now.toISOString();
    const payerEmail = captured.payer?.email_address || null;

    if (captured.status !== "COMPLETED") {
      await db
        .prepare("UPDATE paypal_orders SET status = ? WHERE order_id = ?")
        .bind(captured.status || "FAILED", orderId)
        .run();
      return redirect(`${origin}/pricing?checkout=failed`);
    }

    await db
      .prepare(
        `UPDATE paypal_orders
         SET status = ?, captured_at = ?, payer_email = ?
         WHERE order_id = ?`,
      )
      .bind("COMPLETED", nowIso, payerEmail, orderId)
      .run();

    await grantPaidCredits(db, existing, plan, now);

    return redirect(`${origin}/pricing?checkout=success`);
  } catch {
    return redirect(`${origin}/pricing?checkout=failed`);
  }
}

export function onRequest() {
  return new Response("Method not allowed.", { status: 405 });
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
