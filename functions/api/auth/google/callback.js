import {
  RETURN_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  STATE_COOKIE,
  clearCookie,
  cookie,
  hashToken,
  isSecureRequest,
  parseCookies,
  randomToken,
  sanitizeReturnTo,
} from "../../../_shared/auth.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const db = env.CLEARPNG_DB;
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;

  if (!db || !clientId || !clientSecret) {
    return Response.json(
      { error: "Google login is not configured yet." },
      { status: 503 },
    );
  }

  const requestUrl = new URL(request.url);
  const origin = env.APP_ORIGIN || requestUrl.origin;
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const cookies = parseCookies(request);
  const secure = isSecureRequest(request);
  const returnTo = sanitizeReturnTo(cookies[RETURN_COOKIE]);

  if (!code || !state || state !== cookies[STATE_COOKIE]) {
    return redirectWithClearedCookies(`${origin}/?auth=failed`, secure);
  }

  const redirectUri = `${origin}/api/auth/google/callback`;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    return redirectWithClearedCookies(`${origin}/?auth=failed`, secure);
  }

  const tokenData = await tokenResponse.json();
  const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  if (!userResponse.ok) {
    return redirectWithClearedCookies(`${origin}/?auth=failed`, secure);
  }

  const profile = await userResponse.json();
  const now = new Date().toISOString();
  let user = await db
    .prepare("SELECT id FROM users WHERE google_sub = ?")
    .bind(profile.sub)
    .first();

  if (!user) {
    user = { id: crypto.randomUUID() };
    await db
      .prepare(
        `INSERT INTO users (
          id, google_sub, email, name, picture_url, email_verified,
          created_at, updated_at, last_login_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        user.id,
        profile.sub,
        profile.email || null,
        profile.name || null,
        profile.picture || null,
        profile.email_verified ? 1 : 0,
        now,
        now,
        now,
      )
      .run();
  } else {
    await db
      .prepare(
        `UPDATE users
         SET email = ?, name = ?, picture_url = ?, email_verified = ?,
             updated_at = ?, last_login_at = ?
         WHERE id = ?`,
      )
      .bind(
        profile.email || null,
        profile.name || null,
        profile.picture || null,
        profile.email_verified ? 1 : 0,
        now,
        now,
        user.id,
      )
      .run();
  }

  const sessionToken = await randomToken();
  const sessionHash = await hashToken(sessionToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();

  await db
    .prepare(
      `INSERT INTO sessions (
        id, user_id, session_hash, created_at, expires_at, user_agent, ip
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      user.id,
      sessionHash,
      now,
      expiresAt,
      request.headers.get("User-Agent") || null,
      request.headers.get("CF-Connecting-IP") || null,
    )
    .run();

  await db
    .prepare(
      `INSERT INTO login_events (
        id, user_id, provider, created_at, user_agent, ip
      ) VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      user.id,
      "google",
      now,
      request.headers.get("User-Agent") || null,
      request.headers.get("CF-Connecting-IP") || null,
    )
    .run();

  const headers = new Headers({
    Location: `${origin}${returnTo}`,
    "Cache-Control": "no-store",
  });
  headers.append(
    "Set-Cookie",
    cookie(SESSION_COOKIE, sessionToken, {
      secure,
      maxAge: SESSION_MAX_AGE,
    }),
  );
  headers.append("Set-Cookie", clearCookie(STATE_COOKIE, secure));
  headers.append("Set-Cookie", clearCookie(RETURN_COOKIE, secure));

  return new Response(null, { status: 302, headers });
}

function redirectWithClearedCookies(location, secure) {
  const headers = new Headers({
    Location: location,
    "Cache-Control": "no-store",
  });
  headers.append("Set-Cookie", clearCookie(STATE_COOKIE, secure));
  headers.append("Set-Cookie", clearCookie(RETURN_COOKIE, secure));
  return new Response(null, { status: 302, headers });
}

export function onRequest() {
  return Response.json({ error: "Method not allowed." }, { status: 405 });
}
