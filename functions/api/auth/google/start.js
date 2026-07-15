import {
  RETURN_COOKIE,
  STATE_COOKIE,
  STATE_MAX_AGE,
  cookie,
  isSecureRequest,
  randomToken,
  sanitizeReturnTo,
} from "../../../_shared/auth.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const clientId = env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return Response.json(
      { error: "Google login is not configured yet." },
      { status: 503 },
    );
  }

  const requestUrl = new URL(request.url);
  const origin = env.APP_ORIGIN || requestUrl.origin;
  const state = await randomToken();
  const returnTo = sanitizeReturnTo(requestUrl.searchParams.get("return_to"));
  const redirectUri = `${origin}/api/auth/google/callback`;
  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  googleUrl.searchParams.set("client_id", clientId);
  googleUrl.searchParams.set("redirect_uri", redirectUri);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email profile");
  googleUrl.searchParams.set("state", state);
  googleUrl.searchParams.set("prompt", "select_account");

  const headers = new Headers({
    Location: googleUrl.toString(),
    "Cache-Control": "no-store",
  });
  const secure = isSecureRequest(request);
  headers.append(
    "Set-Cookie",
    cookie(STATE_COOKIE, state, { secure, maxAge: STATE_MAX_AGE }),
  );
  headers.append(
    "Set-Cookie",
    cookie(RETURN_COOKIE, returnTo, { secure, maxAge: STATE_MAX_AGE }),
  );

  return new Response(null, { status: 302, headers });
}

export function onRequest() {
  return Response.json({ error: "Method not allowed." }, { status: 405 });
}
