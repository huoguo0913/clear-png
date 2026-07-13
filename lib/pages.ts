import type { Metadata } from "next";

export type PageSlug =
  | "home"
  | "logo"
  | "signature"
  | "product"
  | "white-background";

export type PageConfig = {
  slug: PageSlug;
  path: string;
  mode: "General Image" | "Logo" | "Signature" | "Product Photo";
  title: string;
  description: string;
  h1: string;
  kicker: string;
  intro: string;
  bullets: string[];
  useCases: string[];
  faqs: Array<{ question: string; answer: string }>;
  previewHint: string;
};

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://clearpng.app";

export const pages: Record<PageSlug, PageConfig> = {
  home: {
    slug: "home",
    path: "/",
    mode: "General Image",
    title: "Free Image Background Remover & Transparent PNG Maker | ClearPNG",
    description:
      "Remove backgrounds from JPG, PNG, and WebP images online. Preview the transparent result and download a clean PNG in seconds.",
    h1: "Free Image Background Remover",
    kicker: "Transparent PNG maker",
    intro:
      "Remove backgrounds from JPG, PNG, and WebP images. Download a transparent PNG in seconds.",
    bullets: [
      "Works for logos, signatures, product photos, and objects.",
      "Preview transparency on checkerboard, white, and black backgrounds.",
      "No image storage. Your file is processed for this request only.",
    ],
    useCases: [
      "Make logos transparent for websites and slides.",
      "Turn photographed signatures into reusable PNG files.",
      "Create clean product cutouts for online stores.",
    ],
    faqs: [
      {
        question: "Is ClearPNG free to use?",
        answer:
          "The MVP is designed as a free tool. Usage may be limited later to control API cost and prevent abuse.",
      },
      {
        question: "What image formats are supported?",
        answer: "ClearPNG supports JPG, JPEG, PNG, and WebP images up to 5MB.",
      },
      {
        question: "Will my image be stored?",
        answer:
          "No. ClearPNG does not store uploaded images or processed results. The image is sent for the current background removal request and returned to your browser.",
      },
      {
        question: "Can I download a transparent PNG?",
        answer:
          "Yes. Successful results are returned as PNG files with transparency preserved.",
      },
    ],
    previewHint: "Best for general photos, objects, and everyday image cutouts.",
  },
  logo: {
    slug: "logo",
    path: "/remove-white-background-from-logo",
    mode: "Logo",
    title: "Remove White Background from Logo Online | ClearPNG",
    description:
      "Make your logo background transparent online. Upload a logo, preview it on white, black, or checkerboard backgrounds, and download a clean PNG.",
    h1: "Remove White Background from Logo",
    kicker: "Logo transparency tool",
    intro:
      "Make your logo background transparent and export a clean PNG for websites, slides, stores, and social media.",
    bullets: [
      "Upload PNG, JPG, JPEG, or WebP logos up to 5MB.",
      "Check logo edges against white, black, and transparent previews.",
      "Download a ready-to-use transparent PNG.",
    ],
    useCases: [
      "Website headers and navigation logos.",
      "Pitch decks, invoices, and presentation slides.",
      "Marketplace, social profile, and store branding.",
    ],
    faqs: [
      {
        question: "How do I make my logo background transparent?",
        answer:
          "Upload your logo, click Remove Background, preview the result, and download the transparent PNG.",
      },
      {
        question: "Can I remove a white background from a PNG logo?",
        answer:
          "Yes. PNG logos are supported as long as the file is under 5MB.",
      },
      {
        question: "Will the logo edges stay clean?",
        answer:
          "Most logos work well. Very thin lines or low-contrast edges may need a retry or future manual cleanup tools.",
      },
    ],
    previewHint: "Preview logos on dark and light backgrounds before download.",
  },
  signature: {
    slug: "signature",
    path: "/signature-background-remover",
    mode: "Signature",
    title:
      "Signature Background Remover - Make Signature Transparent | ClearPNG",
    description:
      "Turn a scanned or photographed signature into a transparent PNG for Word, PDF, invoices, forms, and contracts.",
    h1: "Signature Background Remover",
    kicker: "Transparent signature maker",
    intro:
      "Turn a scanned or photographed signature into a transparent PNG for Word, PDF, invoices, forms, and contracts.",
    bullets: [
      "Upload a signature photo or scan up to 5MB.",
      "Remove paper backgrounds and preview the transparent result.",
      "Download a PNG that can sit over documents cleanly.",
    ],
    useCases: [
      "Add a transparent signature to PDF forms.",
      "Place signatures inside Word documents and invoices.",
      "Prepare reusable signature assets for office workflows.",
    ],
    faqs: [
      {
        question: "How do I make a signature transparent?",
        answer:
          "Upload a clear signature image, remove the background, and download the transparent PNG result.",
      },
      {
        question: "Can I use the transparent signature in Word or PDF?",
        answer:
          "Yes. PNG transparency works well in Word, PDF editors, invoices, and forms.",
      },
      {
        question: "Does ClearPNG store my signature image?",
        answer:
          "No. Signature images are processed for the current request only and are not stored by ClearPNG.",
      },
    ],
    previewHint: "Best with dark ink on a light, even background.",
  },
  product: {
    slug: "product",
    path: "/product-photo-background-remover",
    mode: "Product Photo",
    title: "Product Photo Background Remover Online | ClearPNG",
    description:
      "Remove product photo backgrounds online and download clean transparent PNG cutouts for Shopify, Amazon, Etsy, and social media.",
    h1: "Product Photo Background Remover",
    kicker: "Ecommerce image cutouts",
    intro:
      "Remove product photo backgrounds for online stores and create clean cutouts for Shopify, Amazon, Etsy, and social media.",
    bullets: [
      "Create product cutouts from JPG, PNG, or WebP images.",
      "Check transparent results before using them in store pages.",
      "Download a PNG without waiting for cloud storage or history.",
    ],
    useCases: [
      "Prepare main product images for ecommerce listings.",
      "Create product assets for ads and social posts.",
      "Cut out objects for marketplaces and storefronts.",
    ],
    faqs: [
      {
        question: "Can ClearPNG remove product photo backgrounds?",
        answer:
          "Yes. Upload a product image, remove the background, and download the transparent PNG cutout.",
      },
      {
        question: "Can I use the result for Shopify, Amazon, or Etsy?",
        answer:
          "Yes. The transparent PNG can be used in store pages, ads, and social media images.",
      },
      {
        question: "Does the MVP support batch product photos?",
        answer:
          "Not yet. The MVP processes one image at a time; batch processing is planned as a future feature.",
      },
    ],
    previewHint: "Best with a product that is clearly separated from the background.",
  },
  "white-background": {
    slug: "white-background",
    path: "/remove-white-background",
    mode: "General Image",
    title: "Remove White Background from Image Online | ClearPNG",
    description:
      "Remove white or light backgrounds from images online. Upload JPG, PNG, or WebP and download a transparent PNG.",
    h1: "Remove White Background from Image",
    kicker: "White background to transparent PNG",
    intro:
      "Remove white, light, or solid-color backgrounds from images and download a transparent PNG.",
    bullets: [
      "Useful for logos, icons, signatures, objects, and simple graphics.",
      "Preview the transparent result on multiple backgrounds.",
      "No account, storage, or image history in the MVP.",
    ],
    useCases: [
      "Remove a white box around a logo.",
      "Clean up simple product and object images.",
      "Prepare transparent graphics for documents and websites.",
    ],
    faqs: [
      {
        question: "Can I remove a white background from an image?",
        answer:
          "Yes. Upload a JPG, PNG, or WebP image and ClearPNG will return a transparent PNG when processing succeeds.",
      },
      {
        question: "Does it only work on white backgrounds?",
        answer:
          "No. The remove.bg API can handle many background types, but this page is optimized for white-background use cases.",
      },
      {
        question: "Can I download the result without creating an account?",
        answer: "Yes. The MVP does not require an account.",
      },
    ],
    previewHint: "Great for white, light, and simple solid backgrounds.",
  },
};

export const pageOrder: PageSlug[] = [
  "home",
  "logo",
  "signature",
  "product",
  "white-background",
];

export function metadataForPage(page: PageConfig): Metadata {
  const url = `${siteUrl}${page.path === "/" ? "" : page.path}`;

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      siteName: "ClearPNG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
    },
  };
}

export function faqJsonLd(page: PageConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
