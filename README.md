# ClearPNG

ClearPNG is an online image background remover deployed on Cloudflare Pages. The Next.js frontend is statically exported, Cloudflare Pages Functions act as a secure backend proxy, and the actual cutout is performed by the [remove.bg](https://www.remove.bg/) API. Sign-in (Google OAuth) and paid image credits are supported through both PayPal and Creem checkout.

## Features

- Upload JPG, JPEG, PNG, or WebP images up to 5MB (click or drag-and-drop).
- Preview the original image and the transparent PNG result.
- Switch result preview backgrounds between checkerboard, white, and black.
- Download the processed image as `clearpng-result.png` directly from the browser.
- SEO landing pages for the logo, signature, product photo, and white-background use cases, plus a pricing page.
- Pages Function that proxies requests to remove.bg without exposing the API key to the frontend.
- Google sign-in backed by a Cloudflare D1 database (users and sessions).
- Monthly image credits: 3 free images per month for signed-in users.
- Paid credit plans (Starter / Pro) with both PayPal and Creem checkout, verified by redirect signatures and webhooks.
- Privacy first: uploaded images and processed results are never stored by ClearPNG.

## Pages

| Page | URL |
| --- | --- |
| Home / main tool | `/` |
| Logo use case | `/remove-white-background-from-logo` |
| Signature use case | `/signature-background-remover` |
| Product photo use case | `/product-photo-background-remover` |
| White background use case | `/remove-white-background` |
| Pricing | `/pricing` |
| Privacy policy | `/privacy` |
| Terms of service | `/terms` |

Every tool page embeds the same working upload component. `robots.txt` and `sitemap.xml` are generated automatically.

## Architecture

- **Frontend**: Next.js (App Router) + React + TypeScript + Tailwind CSS, built with `output: "export"` to static files in `out/`.
- **Backend**: Cloudflare Pages Functions in `functions/` (file-based routing under `/api/*`).
- **Cutout**: remove.bg REST API, called server-side with `X-Api-Key`.
- **Database**: Cloudflare D1 (`CLEARPNG_DB`) for users, sessions, credit grants, usage events, orders, and webhook events.
- **Payments**: PayPal Orders v2 (sandbox/live) and Creem Checkout (test/live).
- **Storage of images**: none. Images are streamed to remove.bg and the resulting PNG is streamed back with `Cache-Control: no-store`.

### API endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/remove-bg` | POST | Accepts `multipart/form-data` (`image_file`), requires sign-in and an available credit, proxies to remove.bg, returns `image/png`. |
| `/api/auth/google/start` | GET | Starts Google OAuth, sets state/return-to cookies, redirects to Google. |
| `/api/auth/google/callback` | GET | Exchanges the OAuth code, creates/updates the user and session. |
| `/api/auth/me` | GET | Returns the current user and remaining credits. |
| `/api/auth/logout` | POST | Revokes the current session. |
| `/api/paypal/create-order` | POST | Creates a PayPal order for a plan. |
| `/api/paypal/capture-order` | GET | PayPal return URL; captures the order and grants credits. |
| `/api/paypal/webhook` | POST | Verified PayPal webhook; captures approved orders / records capture events. |
| `/api/creem/create-checkout` | POST | Creates a Creem checkout session for a plan. |
| `/api/creem/success` | GET | Creem success redirect; verifies the signature and grants credits. |
| `/api/creem/webhook` | POST | Verified Creem webhook (`creem-signature` HMAC); grants credits on `checkout.completed`. |

## Credits and pricing

Credits are tracked in the D1 `credit_grants` table. Each successful background removal consumes one credit and writes a `usage_events` row.

- Free: 3 images per month (auto-granted to every signed-in user).
- Starter: $6.99 / month for 20 images.
- Pro: $19.99 / month for 100 images.

Paid credits are valid for 30 days after purchase. Paid grants are idempotent per order/checkout ID, so webhook retries do not double-grant.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The Pages Functions in `functions/` run locally through Cloudflare's Next.js adapter when using the Cloudflare Pages dev tooling (`npx wrangler pages dev`). With plain `npm run dev` the UI loads and validates uploads, but API calls require a Functions runtime with D1 and environment variables.

## Environment

Create `.env.local` (or configure the variables in the Cloudflare Pages project settings):

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

- `REMOVE_BG_API_KEY`: remove.bg API key. Without it the UI loads but background removal returns a configuration error.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Google OAuth credentials. Background removal requires a signed-in user.
- `PAYPAL_ENV`: `sandbox` or `live`. `PAYPAL_WEBHOOK_ID` is used to verify incoming webhook signatures.
- `CREEM_ENV`: `test` or `live`. `CREEM_WEBHOOK_SECRET` verifies webhook payloads; the API key verifies the success-redirect signature.
- `APP_ORIGIN`: canonical site origin used for OAuth redirects and payment return URLs.

Secrets must only live in Cloudflare environment variables and must never be exposed in frontend code, build output, or logs.

## Database

Bind a D1 database as `CLEARPNG_DB` and apply the migrations in order:

```bash
npx wrangler d1 execute CLEARPNG_DB --file=migrations/0001_auth.sql
npx wrangler d1 execute CLEARPNG_DB --file=migrations/0002_paypal_credits.sql
npx wrangler d1 execute CLEARPNG_DB --file=migrations/0003_paypal_webhooks.sql
npx wrangler d1 execute CLEARPNG_DB --file=migrations/0004_creem_checkout.sql
```

- `0001_auth.sql`: `users`, `sessions`, `login_events`.
- `0002_paypal_credits.sql`: `credit_grants`, `usage_events`, `paypal_orders`.
- `0003_paypal_webhooks.sql`: `paypal_webhook_events` and a unique credit-grant index for PayPal orders.
- `0004_creem_checkout.sql`: `creem_orders`, `creem_webhook_events`, and a unique credit-grant index for Creem checkouts.

## Payment provider setup

- **PayPal**: create a REST app, configure the sandbox/live credentials, and register a webhook pointing at `/api/paypal/webhook` (subscribe to `CHECKOUT.ORDER.APPROVED` and `PAYMENT.CAPTURE.*`). The return URL after buyer approval is `/api/paypal/capture-order`.
- **Creem**: create Starter/Pro products, set the product IDs, and register the webhook `/api/creem/webhook`. The success URL after checkout is `/api/creem/success`.

## Build

```bash
npm run build
```

The production build exports the frontend to `out/`. Cloudflare Pages serves that static output and runs the APIs from `functions/api/*`.
