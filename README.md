# ClearPNG

ClearPNG is a Next.js + Tailwind CSS MVP for removing image backgrounds and downloading transparent PNG files.

## Features

- Upload JPG, JPEG, PNG, or WebP images up to 5MB.
- Preview the original image and transparent PNG result.
- Switch result preview backgrounds between checkerboard, white, and black.
- Download the processed image as `clearpng-result.png`.
- SEO landing pages for logo, signature, product photo, and white-background use cases.
- Edge API route that proxies requests to remove.bg without exposing the API key to the frontend.

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
```

Without this key, the UI still loads and validates uploads, but background removal requests return a configuration error.

## Build

```bash
npm run build
```
