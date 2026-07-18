const PAYPAL_APIS = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com",
};

export function paypalBaseUrl(env) {
  return PAYPAL_APIS[env.PAYPAL_ENV === "live" ? "live" : "sandbox"];
}

export function paypalConfigured(env) {
  return Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET);
}

export async function getPayPalAccessToken(env) {
  const credentials = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);
  const response = await fetch(`${paypalBaseUrl(env)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("PayPal authentication failed.");
  }

  const data = await response.json();
  return data.access_token;
}

export async function createPayPalOrder(env, order) {
  const accessToken = await getPayPalAccessToken(env);
  const response = await fetch(`${paypalBaseUrl(env)}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    throw new Error("PayPal order creation failed.");
  }

  return response.json();
}

export async function capturePayPalOrder(env, orderId) {
  const accessToken = await getPayPalAccessToken(env);
  const response = await fetch(
    `${paypalBaseUrl(env)}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("PayPal order capture failed.");
  }

  return response.json();
}

export async function verifyPayPalWebhook(env, request, webhookEvent) {
  if (!env.PAYPAL_WEBHOOK_ID) {
    throw new Error("PayPal webhook ID is not configured.");
  }

  const accessToken = await getPayPalAccessToken(env);
  const response = await fetch(
    `${paypalBaseUrl(env)}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: request.headers.get("PAYPAL-AUTH-ALGO"),
        cert_url: request.headers.get("PAYPAL-CERT-URL"),
        transmission_id: request.headers.get("PAYPAL-TRANSMISSION-ID"),
        transmission_sig: request.headers.get("PAYPAL-TRANSMISSION-SIG"),
        transmission_time: request.headers.get("PAYPAL-TRANSMISSION-TIME"),
        webhook_id: env.PAYPAL_WEBHOOK_ID,
        webhook_event: webhookEvent,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("PayPal webhook verification failed.");
  }

  const data = await response.json();
  return data.verification_status === "SUCCESS";
}
