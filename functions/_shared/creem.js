const CREEM_APIS = {
  test: "https://test-api.creem.io",
  live: "https://api.creem.io",
};

const encoder = new TextEncoder();

export function creemBaseUrl(env) {
  return CREEM_APIS[env.CREEM_ENV === "live" ? "live" : "test"];
}

export function creemConfigured(env) {
  return Boolean(env.CREEM_API_KEY);
}

export function creemProductId(env, planId) {
  if (planId === "starter") return env.CREEM_STARTER_PRODUCT_ID;
  if (planId === "pro") return env.CREEM_PRO_PRODUCT_ID;
  return null;
}

export async function createCreemCheckout(env, checkout) {
  const response = await fetch(`${creemBaseUrl(env)}/v1/checkouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.CREEM_API_KEY,
    },
    body: JSON.stringify(checkout),
  });

  if (!response.ok) {
    throw new Error("Creem checkout creation failed.");
  }

  return response.json();
}

export async function verifyCreemWebhook(env, rawBody, signature) {
  if (!env.CREEM_WEBHOOK_SECRET || !signature) return false;

  const expected = await hmacHex(env.CREEM_WEBHOOK_SECRET, rawBody);
  return safeEqual(expected, signature);
}

export async function verifyCreemRedirect(env, searchParams) {
  const signature = searchParams.get("signature") || "";
  if (!env.CREEM_API_KEY || !signature) return false;

  const pairs = [];
  for (const [key, value] of searchParams.entries()) {
    if (key === "signature") continue;
    if (!value || value === "null") continue;
    pairs.push([key, value]);
  }

  pairs.sort(([left], [right]) => left.localeCompare(right));
  const payload = pairs.map(([key, value]) => `${key}=${value}`).join("&");
  const expected = await hmacHex(env.CREEM_API_KEY, payload);

  return safeEqual(expected, signature);
}

async function hmacHex(secret, payload) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(left, right) {
  if (left.length !== right.length) return false;

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}
