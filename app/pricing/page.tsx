import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, Check, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { CheckoutNotice } from "@/components/CheckoutNotice";
import { PricingCheckoutButton } from "@/components/PricingCheckoutButton";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteUrl, socialImage, supportEmail } from "@/lib/pages";

const pricingUrl = `${siteUrl}/pricing`;

type PaidPlanId = "starter" | "pro";

type PricingPlan = {
  name: string;
  price: string;
  cadence: string;
  credits: string;
  description: string;
  cta: string;
  href: string | null;
  planId: PaidPlanId | null;
  featured: boolean;
  features: string[];
};

export const metadata: Metadata = {
  title: "ClearPNG Pricing - Simple Background Removal Plans",
  description:
    "Choose a ClearPNG plan for transparent PNG background removal. Start free, upgrade for monthly credits, and process logos, signatures, and product photos.",
  keywords: [
    "ClearPNG pricing",
    "background remover pricing",
    "transparent PNG credits",
    "image background remover plans",
  ],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: pricingUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "ClearPNG Pricing - Simple Background Removal Plans",
    description:
      "Simple plans for removing image backgrounds and downloading transparent PNG files.",
    url: pricingUrl,
    siteName: "ClearPNG",
    locale: "en_US",
    type: "website",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClearPNG Pricing - Simple Background Removal Plans",
    description:
      "Start free, then upgrade when you need more transparent PNG exports.",
    images: [socialImage.url],
  },
};

const plans: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "",
    credits: "3 images / month",
    description: "Try ClearPNG with a few real files before choosing a plan.",
    cta: "Start free",
    href: "/#tool",
    planId: null,
    featured: false,
    features: [
      "Remove backgrounds from JPG, PNG, and WebP",
      "Preview on white, black, and transparent backgrounds",
      "Download transparent PNG results",
      "Best for quick testing",
    ],
  },
  {
    name: "Starter",
    price: "$1",
    cadence: "/ month",
    credits: "20 images / month",
    description: "A light monthly plan for occasional logos, signatures, and assets.",
    cta: "Choose Starter",
    href: null,
    planId: "starter",
    featured: false,
    features: [
      "20 background removals each month",
      "Works for logos, signatures, and simple graphics",
      "No image storage by ClearPNG",
      "Good for office and personal use",
    ],
  },
  {
    name: "Pro",
    price: "$2",
    cadence: "/ month",
    credits: "100 images / month",
    description: "For creators, small stores, and teams that process images every week.",
    cta: "Choose Pro",
    href: null,
    planId: "pro",
    featured: true,
    features: [
      "100 background removals each month",
      "Best for product photos and content workflows",
      "Transparent PNG exports for websites and stores",
      "Lowest per-image price in the current plans",
    ],
  },
];

const faqs = [
  {
    question: "What counts as one image?",
    answer:
      "Each successful background removal uses one image credit. Uploading a file without processing it does not count.",
  },
  {
    question: "Do unused monthly credits roll over?",
    answer:
      "No. Monthly credits refresh each billing period and are designed for regular lightweight use.",
  },
  {
    question: "Can I keep using ClearPNG for free?",
    answer:
      "Yes. The Free plan is meant for occasional use and testing. Upgrade only when you need more monthly images.",
  },
  {
    question: "Are images stored after processing?",
    answer:
      "No. ClearPNG does not store uploaded images or processed results. Files are processed for the current request and returned to your browser.",
  },
];

export default function PricingPage() {
  const pricingJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "ClearPNG image background remover",
    description:
      "Monthly image credits for removing backgrounds and downloading transparent PNG files.",
    image: socialImage.url,
    brand: {
      "@type": "Brand",
      name: "ClearPNG",
    },
    offers: plans
      .filter((plan) => plan.planId)
      .map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        price: plan.price.replace("$", ""),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: pricingUrl,
      })),
  };

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero-band">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="max-w-3xl">
              <p className="eyebrow">Pricing</p>
              <h1 className="mt-3 text-4xl font-bold leading-tight text-ink sm:text-5xl">
                Simple plans for transparent PNG work
              </h1>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Start free, then upgrade when background removal becomes part of
                your regular workflow.
              </p>
            </div>
            <div className="mt-8 grid gap-4 border-y border-slate-200 py-5 sm:grid-cols-3">
              <ValuePoint
                icon={<Sparkles className="h-5 w-5" aria-hidden />}
                title="Made for useful images"
                text="Logos, signatures, product photos, and white-background files."
              />
              <ValuePoint
                icon={<CreditCard className="h-5 w-5" aria-hidden />}
                title="Monthly credits"
                text="Each processed image uses one credit. Credits refresh monthly."
              />
              <ValuePoint
                icon={<ShieldCheck className="h-5 w-5" aria-hidden />}
                title="Private by default"
                text="ClearPNG does not store your uploaded or processed images."
              />
            </div>
            <CheckoutNotice />
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-5 lg:grid-cols-3">
              {plans.map((plan) => (
                <article
                  key={plan.name}
                  className={`relative flex min-h-[34rem] flex-col rounded-lg border bg-white p-6 shadow-sm ${
                    plan.featured
                      ? "border-ocean shadow-soft"
                      : "border-slate-200"
                  }`}
                >
                  {plan.featured ? (
                    <div className="absolute right-5 top-5 rounded-full bg-ocean px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                      Popular
                    </div>
                  ) : null}
                  <div>
                    <h2 className="text-2xl font-bold text-ink">{plan.name}</h2>
                    <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
                      {plan.description}
                    </p>
                    <div className="mt-6 flex items-end gap-2">
                      <span className="text-4xl font-bold text-ink">
                        {plan.price}
                      </span>
                      {plan.cadence ? (
                        <span className="pb-1 text-sm font-semibold text-slate-500">
                          {plan.cadence}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 inline-flex rounded-full bg-mint/10 px-3 py-1 text-sm font-bold text-mint">
                      {plan.credits}
                    </p>
                  </div>

                  <ul className="mt-7 grid gap-3 text-sm leading-6 text-slate-700">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-3">
                        <Check
                          className="mt-0.5 h-4 w-4 flex-none text-mint"
                          aria-hidden
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.planId ? (
                    <div className="mt-auto grid gap-2">
                      <PricingCheckoutButton
                        plan={plan.planId}
                        provider="creem"
                        featured={plan.featured}
                      >
                        Pay now
                      </PricingCheckoutButton>
                      <PaymentMethods />
                    </div>
                  ) : (
                    <Link
                      href={plan.href || "/#tool"}
                      className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-slate-50"
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  )}
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600">
              Questions about plans, payments, or account access? Contact{" "}
              <a
                href={`mailto:${supportEmail}`}
                className="font-semibold text-ink underline underline-offset-4"
              >
                {supportEmail}
              </a>
              . By using ClearPNG, you agree to the{" "}
              <Link
                href="/terms"
                className="font-semibold text-ink underline underline-offset-4"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-semibold text-ink underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </section>

        <section className="bg-slate-50">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="eyebrow text-center">FAQ</p>
            <h2 className="mt-3 text-center text-3xl font-bold text-ink">
              Pricing questions
            </h2>
            <div className="mt-8 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {faqs.map((faq) => (
                <details key={faq.question} className="group p-5">
                  <summary className="cursor-pointer list-none text-base font-semibold text-ink">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
    </>
  );
}

function PaymentMethods() {
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
      <span className="inline-flex items-center gap-1.5">
        <GooglePayMark className="h-4 w-4" />
        Google Pay
      </span>
      <span className="inline-flex items-center gap-1.5">
        <ApplePayMark className="h-3.5 w-3.5 text-slate-700" />
        Apple Pay
      </span>
      <span className="inline-flex items-center gap-1.5">
        <CreditCard className="h-4 w-4" aria-hidden />
        Card
      </span>
      <span className="inline-flex items-center gap-1.5">
        <AlipayMark className="h-4 w-4" />
        Alipay
      </span>
    </p>
  );
}

function GooglePayMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C41.38 35.18 44 30 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

function ApplePayMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 384 512" className={className} fill="currentColor" aria-hidden>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function AlipayMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect width="24" height="24" rx="5" fill="#1677FF" />
      <text
        x="12"
        y="12.5"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="13"
        fontWeight="700"
        fill="#fff"
      >
        支
      </text>
    </svg>
  );
}

function ValuePoint({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-white text-mint shadow-sm">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-bold text-ink">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}
