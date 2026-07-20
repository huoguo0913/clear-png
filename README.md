# ClearPNG

ClearPNG is a Next.js + Tailwind CSS MVP for removing image backgrounds and downloading transparent PNG files.

## Features

- Upload JPG, JPEG, PNG, or WebP images up to 5MB.
- Preview the original image and transparent PNG result.
- Switch result preview backgrounds between checkerboard, white, and black.
- Download the processed image as `clearpng-result.png`.
- SEO landing pages for logo, signature, product photo, and white-background use cases.
- Cloudflare Pages Function that proxies requests to remove.bg without exposing the API key to the frontend.
- Google sign-in backed by Cloudflare D1 user and session tables.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Create `.env.local` and set:

```bash
REMOVE_BG_API_KEY=your_remove_bg_api_key_here
GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret_here
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_ENV=sandbox
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id_here
CREEM_API_KEY=your_creem_api_key_here
CREEM_ENV=test
CREEM_STARTER_PRODUCT_ID=your_creem_starter_product_id_here
CREEM_PRO_PRODUCT_ID=your_creem_pro_product_id_here
CREEM_WEBHOOK_SECRET=your_creem_webhook_secret_here
APP_ORIGIN=http://localhost:3000
```

Without this key, the UI still loads and validates uploads, but background removal requests return a configuration error.

For Cloudflare Pages, set the same variables in the project environment variables. Bind a D1 database as `CLEARPNG_DB` and run the SQL in `migrations/0001_auth.sql`.

PayPal checkout uses one-time sandbox orders for monthly image credits. Run the SQL in `migrations/0002_paypal_credits.sql` and `migrations/0003_paypal_webhooks.sql` before enabling checkout.

Creem checkout uses one-time test or live orders for the same credit system. Run `migrations/0004_creem_checkout.sql`, configure the product IDs, and add the webhook endpoint `/api/creem/webhook` in the Creem dashboard.

## Build

```bash
npm run build
```

The production build exports the frontend to `out/`. Cloudflare Pages serves that static output and runs the remove.bg proxy from `functions/api/remove-bg.js`.
