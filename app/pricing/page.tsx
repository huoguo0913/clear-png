import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, Check, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { siteUrl } from "@/lib/pages";

const pricingUrl = `${siteUrl}/pricing`;

export const metadata: Metadata = {
  title: "ClearPNG Pricing - Simple Background Removal Plans",
  description:
    "Choose a ClearPNG plan for transparent PNG background removal. Start free, upgrade for monthly credits, and process logos, signatures, and product photos.",
  alternates: {
    canonical: pricingUrl,
  },
  openGraph: {
    title: "ClearPNG Pricing - Simple Background Removal Plans",
    description:
      "Simple plans for removing image backgrounds and downloading transparent PNG files.",
    url: pricingUrl,
    siteName: "ClearPNG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClearPNG Pricing - Simple Background Removal Plans",
    description:
      "Start free, then upgrade when you need more transparent PNG exports.",
  },
};

const plans = [
  {
    name: "Free",
    price: "$0",
    cadence: "",
    credits: "3 images / month",
    description: "Try ClearPNG with a few real files before choosing a plan.",
    cta: "Start free",
    href: "/#tool",
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
    price: "$6.99",
    cadence: "/ month",
    credits: "20 images / month",
    description: "A light monthly plan for occasional logos, signatures, and assets.",
    cta: "Choose Starter",
    href: "/#tool",
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
    price: "$19.99",
    cadence: "/ month",
    credits: "100 images / month",
    description: "For creators, small stores, and teams that process images every week.",
    cta: "Choose Pro",
    href: "/#tool",
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

                  <Link
                    href={plan.href}
                    className={`mt-auto inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition ${
                      plan.featured
                        ? "bg-ink text-white shadow-sm hover:bg-slate-800"
                        : "border border-slate-300 bg-white text-ink hover:bg-slate-50"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
              Need a small top-up later? A simple one-time pack can be offered
              after launch: <strong className="text-ink">$2.99 for 5 images</strong>.
              Keep the public pricing page focused on the three main plans.
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
    </>
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
