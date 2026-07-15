import {
  SESSION_COOKIE,
  clearCookie,
  hashToken,
  isSecureRequest,
  json,
  parseCookies,
} from "../../_shared/auth.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  const db = env.CLEARPNG_DB;
  const sessionToken = parseCookies(request)[SESSION_COOKIE];

  if (db && sessionToken) {
    await db
      .prepare("UPDATE sessions SET revoked_at = ? WHERE session_hash = ?")
      .bind(new Date().toISOString(), await hashToken(sessionToken))
      .run();
  }

  return json(
    { ok: true },
    200,
    {
      "Set-Cookie": clearCookie(SESSION_COOKIE, isSecureRequest(request)),
    },
  );
}

export function onRequest() {
  return json({ error: "Method not allowed." }, 405);
}
