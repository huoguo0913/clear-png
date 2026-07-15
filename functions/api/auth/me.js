import { SESSION_COOKIE, hashToken, json, parseCookies } from "../../_shared/auth.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const db = env.CLEARPNG_DB;

  if (!db) {
    return json({ authenticated: false, user: null });
  }

  const sessionToken = parseCookies(request)[SESSION_COOKIE];
  if (!sessionToken) {
    return json({ authenticated: false, user: null });
  }

  const sessionHash = await hashToken(sessionToken);
  const now = new Date().toISOString();
  const row = await db
    .prepare(
      `SELECT users.id, users.email, users.name, users.picture_url
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.session_hash = ?
         AND sessions.revoked_at IS NULL
         AND sessions.expires_at > ?
       LIMIT 1`,
    )
    .bind(sessionHash, now)
    .first();

  if (!row) {
    return json({ authenticated: false, user: null });
  }

  return json({
    authenticated: true,
    user: {
      id: row.id,
      email: row.email,
      name: row.name,
      pictureUrl: row.picture_url,
    },
  });
}

export function onRequest() {
  return json({ error: "Method not allowed." }, 405);
}
