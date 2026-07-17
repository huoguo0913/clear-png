import { getCurrentUser, json } from "../../_shared/auth.js";
import { getCreditSummary } from "../../_shared/credits.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const db = env.CLEARPNG_DB;

  if (!db) {
    return json({ authenticated: false, user: null });
  }

  const user = await getCurrentUser(request, db);

  if (!user) {
    return json({ authenticated: false, user: null });
  }

  const credits = await getCreditSummary(db, user.id);

  return json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      pictureUrl: user.picture_url,
    },
    credits,
  });
}

export function onRequest() {
  return json({ error: "Method not allowed." }, 405);
}
