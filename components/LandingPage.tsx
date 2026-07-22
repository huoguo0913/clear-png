import Link from "next/link";
import type { ReactNode } from "react";
import { BackgroundRemover } from "@/components/BackgroundRemover";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  pageOrder,
  pages,
  softwareApplicationJsonLd,
  type PageConfig,
} from "@/lib/pages";
import { ArrowRight, LockKeyhole, MousePointerClick, Sparkles } from "lucide-react";

export function LandingPage({ page }: { page: PageConfig }) {
  const relatedPages = pageOrder
    .map((slug) => pages[slug])
    .filter((item) => item.slug !== page.slug);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero-band">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-12">
            <div className="flex flex-col justify-center">
              <p className="eyebrow">{page.kicker}</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-ink sm:text-5xl">
                {page.h1}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                {page.intro}
              </p>
              <div className="mt-6 grid gap-3">
                {page.bullets.map((bullet) => (
                  <div key={bullet} className="flex gap-3 text-sm text-slate-700">
                    <span className="mt-1 h-2 w-2 flex-none rounded-full bg-mint" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="#tool"
                  className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800"
                >
                  Start with an image
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="#faq"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-slate-50"
                >
                  FAQ
                </Link>
              </div>
            </div>
            <BackgroundRemover mode={page.mode} previewHint={page.previewHint} />
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">
            <Feature
              icon={<MousePointerClick className="h-5 w-5" aria-hidden />}
              title="Fast workflow"
              text="Upload, remove, preview, and download without an editor."
            />
            <Feature
              icon={<Sparkles className="h-5 w-5" aria-hidden />}
              title="Transparent previews"
              text="Check the result on grid, white, and black backgrounds."
            />
            <Feature
              icon={<LockKeyhole className="h-5 w-5" aria-hidden />}
              title="No storage"
              text="Images are not saved by ClearPNG after processing."
            />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="eyebrow">Use cases</p>
              <h2 className="mt-3 text-3xl font-bold text-ink">
                Built around transparent PNG jobs
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                ClearPNG focuses on practical background removal tasks where
                users need a clean file immediately.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {page.useCases.map((item) => (
                <div key={item} className="info-card">
                  {item}
                </div>
              ))}
              {relatedPages.slice(0, 3).map((item) => (
                <Link key={item.slug} href={item.path} className="info-card group">
                  <span>{item.h1}</span>
                  <ArrowRight
                    className="mt-3 h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-ocean"
                    aria-hidden
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
            <div>
              <p className="eyebrow">Workflow</p>
              <h2 className="mt-3 text-3xl font-bold text-ink">
                {page.h1} in three steps
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Each page is focused on one clear search intent, so you can
                start with the right background removal workflow.
              </p>
            </div>
            <ol className="grid gap-4 md:grid-cols-3">
              {page.steps.map((step, index) => (
                <li
                  key={step}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="mt-4 text-sm font-semibold leading-6 text-ink">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="faq" className="bg-slate-50">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="eyebrow text-center">FAQ</p>
            <h2 className="mt-3 text-center text-3xl font-bold text-ink">
              Common questions
            </h2>
            <div className="mt-8 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {page.faqs.map((faq) => (
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(page)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(page)) }}
      />
      {page.slug === "home" ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareApplicationJsonLd()),
          }}
        />
      ) : null}
    </>
  );
}

function Feature({
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
      <div className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-mint/10 text-mint">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}
