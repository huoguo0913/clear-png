const MONTHLY_FREE_CREDITS = 3;

export const paidPlans = {
  starter: {
    name: "Starter",
    credits: 20,
    amount: "6.99",
    currency: "USD",
  },
  pro: {
    name: "Pro",
    credits: 100,
    amount: "19.99",
    currency: "USD",
  },
};

export function getPaidPlan(planId) {
  return paidPlans[planId] || null;
}

export function monthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

export function monthEnd(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
}

export async function ensureFreeGrant(db, userId, now = new Date()) {
  const key = monthKey(now);
  const grantId = `free:${userId}:${key}`;
  const createdAt = now.toISOString();
  const startsAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString();
  const expiresAt = monthEnd(now).toISOString();

  await db
    .prepare(
      `INSERT OR IGNORE INTO credit_grants (
        id, user_id, source, source_id, plan, credits_total, credits_used,
        starts_at, expires_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    )
    .bind(
      grantId,
      userId,
      "free",
      key,
      "free",
      MONTHLY_FREE_CREDITS,
      startsAt,
      expiresAt,
      createdAt,
    )
    .run();
}

export async function getCreditSummary(db, userId, now = new Date()) {
  await ensureFreeGrant(db, userId, now);

  const rows = await db
    .prepare(
      `SELECT plan, credits_total, credits_used, expires_at
       FROM credit_grants
       WHERE user_id = ?
         AND starts_at <= ?
         AND expires_at > ?
       ORDER BY expires_at ASC, created_at ASC`,
    )
    .bind(userId, now.toISOString(), now.toISOString())
    .all();

  const grants = rows.results || [];
  const total = grants.reduce((sum, grant) => sum + Number(grant.credits_total), 0);
  const used = grants.reduce((sum, grant) => sum + Number(grant.credits_used), 0);

  return {
    total,
    used,
    remaining: Math.max(total - used, 0),
    grants,
  };
}

export async function consumeCredit(db, userId, request, now = new Date()) {
  await ensureFreeGrant(db, userId, now);

  const grant = await db
    .prepare(
      `SELECT id, plan
       FROM credit_grants
       WHERE user_id = ?
         AND starts_at <= ?
         AND expires_at > ?
         AND credits_used < credits_total
       ORDER BY expires_at ASC, created_at ASC
       LIMIT 1`,
    )
    .bind(userId, now.toISOString(), now.toISOString())
    .first();

  if (!grant) {
    return { ok: false };
  }

  await db
    .prepare(
      `UPDATE credit_grants
       SET credits_used = credits_used + 1
       WHERE id = ? AND credits_used < credits_total`,
    )
    .bind(grant.id)
    .run();

  await db
    .prepare(
      `INSERT INTO usage_events (
        id, user_id, credit_grant_id, event_type, created_at, user_agent, ip
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      userId,
      grant.id,
      "remove_bg",
      now.toISOString(),
      request.headers.get("User-Agent") || null,
      request.headers.get("CF-Connecting-IP") || null,
    )
    .run();

  return { ok: true, grant };
}

export async function grantPaidCredits(db, order, plan, now = new Date()) {
  const nowIso = now.toISOString();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    .toISOString();
  const result = await db
    .prepare(
      `INSERT OR IGNORE INTO credit_grants (
        id, user_id, source, source_id, plan, credits_total, credits_used,
        starts_at, expires_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      order.user_id,
      "paypal",
      order.order_id,
      order.plan,
      plan.credits,
      nowIso,
      expiresAt,
      nowIso,
    )
    .run();

  return {
    granted: result.meta?.changes ? result.meta.changes > 0 : false,
    expiresAt,
  };
}
