# ClearPNG Product Requirements Document

Version: 1.1  
Date: 2026-09-05  
Project: ClearPNG  
Stage: Live MVP (with sign-in, credits, and payments)

## 1. Overview

ClearPNG is an online image background removal tool. It focuses on the core `image background remover` use case and prioritizes high-intent long-tail scenarios: making logo backgrounds transparent, turning signatures into transparent PNGs, removing white backgrounds, and cleaning up product photos.

The current version uses a lightweight architecture deployed entirely on Cloudflare:

- The frontend is built with Next.js (App Router) + React + TypeScript + Tailwind CSS, statically exported to `out/` via `output: "export"` and hosted on Cloudflare Pages.
- The backend runs on Cloudflare Pages Functions (the `functions/` directory) and acts as a secure API proxy to the remove.bg API.
- User images are not stored. Each image is processed for the current request only, and the resulting transparent PNG is streamed straight back to the browser for download.
- A Cloudflare D1 database (binding name `CLEARPNG_DB`) stores users, sessions, image credits, orders, and payment webhook records.
- Google sign-in is supported. Signed-in users receive free monthly credits and can buy paid credits through PayPal or Creem.

## 2. Product Positioning

### 2.1 Product Name

ClearPNG

### 2.2 One-Line Positioning

Free image background remover and transparent PNG maker for logos, signatures, and product photos.

### 2.3 Core Value

- Users can remove image backgrounds and export transparent PNGs without installing Photoshop.
- The product provides a direct upload, preview, and download experience for logos, signatures, product photos, and white-background images.
- User images are not stored, reducing privacy concerns.
- Signed-in users get free monthly credits; paid credits are purchased via PayPal / Creem to control API cost.
- SEO-focused landing pages use a real working tool to capture organic search demand.

## 3. Goals

### 3.1 Business Goals

- Run a usable background removal tool deployed on Cloudflare.
- Validate whether `image background remover` and related long-tail keywords generate organic traffic.
- Validate whether users complete the upload, process, preview, and download loop.
- Validate willingness to pay and cover remove.bg API cost through free credits plus paid plans.

### 3.2 User Goals

- Signed-in users can process images with their monthly free credits.
- Users can download a transparent PNG directly.
- Users can preview results on checkerboard, white, and black backgrounds to judge fit for logos, signatures, and product photos.
- When free credits run out, users can buy more on the pricing page via PayPal or Creem.

### 3.3 Non-Goals

The current version does not include:

- Image history.
- Cloud storage of uploaded images.
- Batch processing.
- Advanced online editing.
- A custom AI model.
- A multilingual website.
- Sign-in providers other than Google.

## 4. Target Users and Use Cases

### 4.1 Target Users

- Small merchants and ecommerce operators who need white-background or transparent product images.
- Beginner designers and content creators who need quick logo, sticker, or cover assets.
- Office users who need signatures, stamps, or logos for Word, PDF, and PowerPoint documents.
- Independent website owners who need transparent logos or website assets.

### 4.2 Typical Use Cases

- Remove a white background from a logo and export a transparent PNG.
- Convert a photographed or scanned handwritten signature into a transparent PNG.
- Remove a product photo background for ecommerce pages.
- Cut out a person, object, avatar, or item from its background.
- Remove white, light-colored, or solid-color backgrounds from images.

## 5. Keyword and Page Strategy

### 5.1 Primary Keywords

- image background remover
- background remover
- remove background from image
- transparent PNG maker

### 5.2 Priority Long-Tail Keywords

- remove white background from logo
- make logo background transparent
- remove background from signature
- make signature transparent PNG
- remove white background from image
- product photo background remover
- remove background from PNG
- remove background from JPG

### 5.3 Page Plan

| Page | URL | Target Keywords |
| --- | --- | --- |
| Home / main tool page | `/` | image background remover, transparent PNG maker |
| Logo page | `/remove-white-background-from-logo` | remove white background from logo |
| Signature page | `/signature-background-remover` | remove background from signature |
| Product photo page | `/product-photo-background-remover` | product photo background remover |
| White background page | `/remove-white-background` | remove white background from image |
| Pricing page | `/pricing` | ClearPNG pricing, background remover plans |
| Privacy policy | `/privacy` | — |
| Terms of service | `/terms` | — |

Every tool page embeds the same real, working upload component — pages are not article-only or purely promotional. `robots.txt` and `sitemap.xml` are generated in code.

## 6. Core User Flow

### 6.1 Upload and Processing Flow

1. The user lands on a page.
2. The user clicks the upload area or drags an image into it.
3. The frontend validates file type (JPG/JPEG/PNG/WebP) and size (≤5MB).
4. The frontend shows an original preview using `URL.createObjectURL()`.
5. The user clicks `Remove Background`.
6. The frontend sends the image as `multipart/form-data` to `/api/remove-bg`.
7. The backend validates the session and remaining credits, then proxies to the remove.bg API.
8. The backend consumes one credit and returns a transparent PNG (`image/png`).
9. The frontend displays the result with switchable checkerboard/white/black backgrounds.
10. The user downloads `clearpng-result.png` via a Blob URL.

Anonymous users who try to process an image receive a 401 and are guided to Google sign-in; users with no credits receive a 402 and are guided to `/pricing`.

### 6.2 Payment Flow

PayPal:

1. A signed-in user picks a plan on `/pricing` and clicks `Pay with PayPal`.
2. The frontend calls `POST /api/paypal/create-order`; the backend creates a PayPal order and returns an `approvalUrl`.
3. After the buyer approves payment, PayPal redirects back to `/api/paypal/capture-order`.
4. The backend captures the order, updates its status, grants credits, and redirects to `/?checkout=success#tool`.
5. The PayPal webhook (`/api/paypal/webhook`) acts as a fallback; after signature verification it handles `CHECKOUT.ORDER.APPROVED` and `PAYMENT.CAPTURE.*` events.

Creem:

1. A signed-in user clicks `Pay with Creem`.
2. The frontend calls `POST /api/creem/create-checkout`; the backend creates a Creem checkout and returns a `checkoutUrl`.
3. After payment the user is redirected to `/api/creem/success`; the backend verifies the redirect signature and grants credits.
4. The Creem webhook (`/api/creem/webhook`) verifies the `creem-signature` HMAC and handles the `checkout.completed` event as a fallback.

### 6.3 Error Flow

- Unsupported format: ask the user to upload JPG, PNG, or WebP.
- File too large: ask for an image under 5MB.
- Not signed in (401): guide the user through Google sign-in.
- Out of credits (402): guide the user to the pricing page.
- remove.bg quota/rate limit (402/429): show a temporary service-busy message.
- remove.bg processing failure: ask the user to retry or choose another image.
- Payment not configured / verification failed: show a checkout-failed or not-configured message.
- Network failure: ask the user to check the connection and retry.

## 7. Functional Requirements

### 7.1 Upload Component

Required:

- Click-to-upload and drag-and-drop upload.
- Support for JPG, JPEG, PNG, and WebP.
- File size limited to 5MB on both frontend and backend.
- Original image preview after upload, with the ability to select another image.
- A loading state during processing and clear error messages.

Out of scope:

- Multiple image upload.
- Import from URL or third-party cloud storage.

### 7.2 Background Removal

- Endpoint: `POST /api/remove-bg`, `multipart/form-data`, image field name `image_file`.
- Sign-in and at least one available credit are required.
- The backend sends `image_file` plus `size=auto` to remove.bg with the key in the `X-Api-Key` header.
- Success responses use `Content-Type: image/png` and `Cache-Control: no-store`.
- A credit is consumed and a `usage_events` row is written only after remove.bg returns successfully.

### 7.3 Result Preview

- Original image and processed transparent PNG shown side by side.
- A checkerboard background identifies transparent areas.
- Three preview backgrounds: checkerboard (Grid), white, and black.
- The download filename is fixed to `clearpng-result.png`, using a browser Blob URL with no cloud storage dependency.

### 7.4 Accounts and Sign-In

- Google OAuth only (scope: `openid email profile`).
- Start: `GET /api/auth/google/start`; callback: `GET /api/auth/google/callback`.
- Session cookie (`clearpng_session`) is HttpOnly and SameSite=Lax, with Secure over HTTPS.
- Only the SHA-256 hash of the session token is stored; sessions last 30 days and can be revoked via `POST /api/auth/logout`.
- `GET /api/auth/me` returns the current user and remaining credits for the header avatar and credit badge.

### 7.5 Credit System

- Free credits: 3 images per month for every signed-in user, auto-granted per UTC calendar month and expiring at month end.
- Paid plans:

| Plan | Price | Credits | Validity |
| --- | --- | --- | --- |
| Free | $0 | 3 images / month | Current month |
| Starter | $6.99 | 20 images | 30 days after purchase |
| Pro | $19.99 | 100 images | 30 days after purchase |

- Credits are consumed from the earliest-expiring grant first.
- Each successful processing writes a `usage_events` row (with User-Agent and CF-Connecting-IP).
- Paid grants are idempotent per order/checkout ID, so webhook retries never double-grant.

### 7.6 Payments

- Each paid plan offers both PayPal and Creem checkout.
- PayPal: Orders v2 with `intent=CAPTURE`, supporting sandbox / live via `PAYPAL_ENV`.
- Creem: Checkout API, supporting test / live via `CREEM_ENV`, with separate product IDs for Starter and Pro.
- Successful payments are recorded in `paypal_orders` / `creem_orders` and credits are granted through `credit_grants` (source `paypal` / `creem`).
- Raw webhook payloads are stored in `paypal_webhook_events` / `creem_webhook_events` and de-duplicated by event ID.

### 7.7 Use Case Modes

The UI exposes General Image, Logo, Signature, and Product Photo modes, all reusing the same remove.bg processing logic. Differences appear in page copy, examples, FAQ content, preview hints, and expectation-setting.

## 8. Page Requirements

### 8.1 Home Page

- H1: Free Image Background Remover.
- The upload tool (`#tool`) is visible in the first viewport and not hidden behind marketing content.
- Modules: upload tool, result preview, use case entries (Logo / Signature / Product Photo / White Background), feature highlights, three-step workflow, FAQ.

### 8.2 Logo Page (`/remove-white-background-from-logo`)

- H1: Remove White Background from Logo.
- Emphasizes transparent PNGs for websites, slides, stores, and social profiles.

### 8.3 Signature Page (`/signature-background-remover`)

- H1: Signature Background Remover.
- Emphasizes scanned/photographed signatures for Word, PDF, invoices, forms, and contracts.

### 8.4 Product Photo Page (`/product-photo-background-remover`)

- H1: Product Photo Background Remover.
- Emphasizes Shopify, Amazon, Etsy, and social media product images.

### 8.5 White Background Page (`/remove-white-background`)

- H1: Remove White Background from Image.
- Targets white/light/solid backgrounds converted to transparency.

### 8.6 Pricing Page (`/pricing`)

- Shows Free / Starter / Pro plan cards.
- Paid cards offer `Pay with Creem` and `Pay with PayPal` buttons; anonymous clicks are redirected to Google sign-in first.
- Payment outcomes are shown via a `?checkout=success|cancelled|failed` notice.
- Includes pricing FAQ, Product structured data, and links to Terms and Privacy.

## 9. API Requirements

### 9.1 Endpoint List

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/remove-bg` | POST | Proxies to remove.bg, returns `image/png` |
| `/api/auth/google/start` | GET | Starts Google OAuth |
| `/api/auth/google/callback` | GET | OAuth callback, establishes the session |
| `/api/auth/me` | GET | Current user and remaining credits |
| `/api/auth/logout` | POST | Revokes the current session |
| `/api/paypal/create-order` | POST | Creates a PayPal order |
| `/api/paypal/capture-order` | GET | PayPal return URL; captures and grants credits |
| `/api/paypal/webhook` | POST | PayPal webhook (signature verified) |
| `/api/creem/create-checkout` | POST | Creates a Creem checkout |
| `/api/creem/success` | GET | Creem return URL (signature verified, grants credits) |
| `/api/creem/webhook` | POST | Creem webhook (HMAC verified) |

### 9.2 Remove-Background Request and Response

Request: `multipart/form-data` with field `image_file` (File, required).

Success:

```text
Content-Type: image/png
Cache-Control: no-store
```

Failure:

```json
{
  "error": "Image is too large. Please upload an image under 5MB."
}
```

### 9.3 remove.bg Proxy Logic

1. Validate that the request method is POST.
2. Check that `REMOVE_BG_API_KEY` and the D1 binding exist.
3. Resolve the current user from the session cookie; return 401 if anonymous.
4. Summarize active credits; return 402 if fewer than one remains.
5. Parse `multipart/form-data` and validate that `image_file` exists, is ≤5MB, and is JPEG/PNG/WebP.
6. Build a new `FormData` (`image_file` + `size=auto`) and call `https://api.remove.bg/v1.0/removebg`.
7. Send the key in the `X-Api-Key` header; map 402/429 to a service-busy message and other failures to 502.
8. On success, consume a credit and write a usage event.
9. Set `Cache-Control: no-store` and stream the image back to the frontend.

### 9.4 Environment Variables

```text
REMOVE_BG_API_KEY=remove.bg API key
GOOGLE_CLIENT_ID=Google OAuth client ID
GOOGLE_CLIENT_SECRET=Google OAuth client secret
PAYPAL_CLIENT_ID=PayPal client ID
PAYPAL_CLIENT_SECRET=PayPal client secret
PAYPAL_ENV=sandbox|live
PAYPAL_WEBHOOK_ID=PayPal webhook ID
CREEM_API_KEY=Creem API key
CREEM_ENV=test|live
CREEM_STARTER_PRODUCT_ID=Creem Starter product ID
CREEM_PRO_PRODUCT_ID=Creem Pro product ID
CREEM_WEBHOOK_SECRET=Creem webhook secret
APP_ORIGIN=canonical site origin (used for OAuth and payment redirects)
```

Secrets must only be stored in Cloudflare environment variables and must never be exposed in frontend code, build output, or logs.

## 10. Technical Approach

### 10.1 Frontend

- Next.js (App Router) + React + TypeScript + Tailwind CSS.
- `next.config.mjs` uses `output: "export"` to produce static files in `out/`, deployed to Cloudflare Pages.
- Image previews use browser-local `URL.createObjectURL()`; downloads use Blob URLs.
- Icons use lucide-react.

### 10.2 Backend

- Cloudflare Pages Functions (the `functions/` directory, file-based routing).
- Shared logic lives in `functions/_shared/`: `auth.js` (session/cookie/OAuth helpers), `credits.js` (credits and plans), `paypal.js`, and `creem.js`.
- User images are never stored; the backend only acts as a secure remove.bg proxy and handles sign-in, credits, and payments.
- Persistence uses Cloudflare D1 (binding `CLEARPNG_DB`); no object storage is used.

### 10.3 Database Migrations

Apply in order:

- `migrations/0001_auth.sql`: `users`, `sessions`, `login_events`.
- `migrations/0002_paypal_credits.sql`: `credit_grants`, `usage_events`, `paypal_orders`.
- `migrations/0003_paypal_webhooks.sql`: `paypal_webhook_events` and a unique grant index for PayPal orders.
- `migrations/0004_creem_checkout.sql`: `creem_orders`, `creem_webhook_events`, and a unique grant index for Creem checkouts.

### 10.4 Deployment

- The static export and Pages Functions deploy together to Cloudflare Pages.
- Configure the environment variables above in the Pages project settings and bind the D1 database as `CLEARPNG_DB`.
- HTTPS is provided automatically by Cloudflare.
- Configure the PayPal webhook to point at `/api/paypal/webhook` and the Creem webhook at `/api/creem/webhook`.

## 11. Security, Limits, and Privacy

### 11.1 File Limits

- Maximum file size: 5MB.
- Supported formats: JPG, JPEG, PNG, WebP.
- Unsupported formats: SVG, GIF, PSD, PDF.

### 11.2 Abuse and Cost Protection

- File size and type are validated on both frontend and backend.
- The remove-background endpoint requires sign-in and is limited by per-account monthly credits.
- Error responses never expose remove.bg / PayPal / Creem secrets.
- All API responses set `Cache-Control: no-store`.
- Payment webhooks require signature verification (PayPal verify-webhook-signature; Creem HMAC-SHA256), events are de-duplicated by ID, and credit grants are idempotent per order.
- OAuth uses a state parameter for CSRF protection and validates return URLs against same-origin paths.

Future additions: Cloudflare Turnstile, IP-based rate limiting.

### 11.3 Privacy Statement

The site (including `/privacy`) clearly states:

- ClearPNG does not store uploaded images or processed results; images are used only for the current background removal request.
- Results are returned directly to the browser and no image history is provided.
- Account data (Google email, name, picture) and payment records are used only for sign-in, credits, and order management.

## 12. Data and Analytics

- Google Analytics 4 is integrated (Measurement ID `G-BCN2YV00E6`) for page traffic.
- The frontend dispatches `clearpng:analytics` custom events during the upload/processing flow: `upload_started`, `upload_validated`, `upload_failed_validation`, `remove_bg_clicked`, `remove_bg_success`, `remove_bg_failed`, and `download_clicked`.
- The backend records every successful removal in the `usage_events` table (user, grant, User-Agent, IP).
- Core metrics: page views, upload rate, processing success rate, download rate, remove.bg call cost, payment conversion rate, and source keyword / landing page performance.

## 13. SEO Requirements

### 13.1 Basic SEO

Each page has a unique title, meta description, H1, canonical URL, Open Graph/Twitter tags, structured data, and a real tool visible in the first viewport.

Structured data implemented:

- Site-wide Organization / WebSite (`app/layout.tsx`).
- FAQPage and BreadcrumbList on each tool page.
- Product + Offer on the pricing page.

### 13.2 Example Titles

- Home: `Free Background Remover & PNG Maker | ClearPNG`
- Logo page: `Remove White Background from Logo Online | ClearPNG`
- Signature page: `Signature Background Remover - Make Signature Transparent | ClearPNG`
- Product photo page: `Product Photo Background Remover Online | ClearPNG`
- White background page: `Remove White Background from Image Online | ClearPNG`
- Pricing page: `ClearPNG Pricing - Simple Background Removal Plans`

## 14. Design Requirements

- Simple, tool-focused, and trustworthy; the first viewport emphasizes the upload action.
- Key components: top navigation (logo, Logo/Signature/Product Photo/White Background/Pricing links, auth state with credits, Upload button), upload card, processing state, result preview area, background switcher, download button, and error/checkout notices.
- Mobile users must be able to upload comfortably, see clear processing state, and find the download button easily.

## 15. Acceptance Criteria

### 15.1 Functional Acceptance

- Anonymous users are guided to sign in when processing; Google sign-in returns them to the original page.
- Signed-in users automatically receive 3 free credits per month, and the header shows remaining credits.
- Users can upload JPG/PNG/WebP, remove the background, preview the transparent PNG, and download `clearpng-result.png`.
- Files over 5MB or unsupported formats are rejected on both ends with clear messages.
- Running out of credits returns 402 and guides users to the pricing page.
- PayPal sandbox and Creem test checkout complete successfully, credits are granted after payment, and replayed/refreshed webhooks do not double-grant.
- No historical image appears after refresh; no API secrets are exposed in the frontend or build output.

### 15.2 Deployment Acceptance

- The site is accessible through Cloudflare Pages with working HTTPS.
- `/api/*` is accessible through Pages Functions.
- All environment variables are configured and D1 (`CLEARPNG_DB`) is bound with all four migrations applied.
- Main pages return 200 and `/robots.txt` and `/sitemap.xml` are accessible.
- PayPal and Creem webhooks are configured and pass signature verification.

### 15.3 SEO Acceptance

- The home, use case, and pricing pages have unique title, description, and H1 values.
- The first viewport includes the real upload tool.
- Use case pages carry scenario-specific copy rather than duplicates.
- The site has been submitted to Google Search Console.

## 16. Milestones

- Milestone 1 (done): home page, remove.bg proxy, transparent PNG download, basic error messages.
- Milestone 2 (done): logo, signature, product photo, and white-background pages plus FAQ and structured data.
- Milestone 3 (done): Google sign-in, D1, free credits, PayPal and Creem payments, pricing page.
- Milestone 4 (partially done): checkerboard/white/black previews shipped; before/after comparison slider, automatic transparent-edge trimming, and local background-color export remain.
- Milestone 5 (planned): Turnstile, rate limiting, batch processing, one-time credit top-ups, Pro features.

## 17. Risks and Mitigations

### 17.1 API Cost Risk

remove.bg charges per use. Mitigations: 5MB file limit, sign-in with monthly per-account credits, only 3 free images per month, paid plans covering cost, idempotent webhook grants, and Turnstile later.

### 17.2 Payment and Reconciliation Risk

Mitigations: both PayPal and Creem use verified redirects plus verified webhooks as a double safety net; orders and webhook events are persisted; credit grants are idempotent per order.

### 17.3 SEO Competition Risk

Primary keywords are competitive. Mitigations: prioritize logo, signature, white-background, and product photo pages, each with a real tool.

### 17.4 Processing Quality Risk

Thin logo lines and signatures may be mishandled. Mitigations: set expectations in copy, offer retry and multiple preview backgrounds, and consider a local white-to-transparent algorithm later.

## 18. Future Expansion

- Batch background removal.
- Before/after comparison slider, automatic transparent-edge trimming, custom background color export.
- One-time credit top-ups (e.g. $2.99 for 5 images).
- Logo size templates: favicon, social avatar, website header.
- Signature enhancement: darken strokes and remove paper shadows.
- Product photo templates: white background, square image, social image.
- Cloudflare Turnstile and finer rate limiting.
- Image history (requires explicit opt-in and clear privacy messaging).
- API service and subscription plans.
