import Link from "next/link";
import { pageOrder, pages, supportEmail } from "@/lib/pages";

export function SiteFooter() {
  const tools = pageOrder.map((slug) => pages[slug]);

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 font-semibold text-ink">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-sm font-bold text-white">
              CP
            </span>
            <span className="text-lg">ClearPNG</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
            Remove image backgrounds and download transparent PNG files for
            logos, signatures, product photos, and white-background images.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-ink">Background remover tools</h2>
          <div className="mt-4 grid gap-2">
            {tools.map((item) => (
              <Link
                key={item.slug}
                href={item.path}
                className="text-sm text-slate-600 transition hover:text-ink"
              >
                {item.h1}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-ink">Site</h2>
          <div className="mt-4 grid gap-2">
            <Link
              href="/pricing"
              className="text-sm text-slate-600 transition hover:text-ink"
            >
              Pricing
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-slate-600 transition hover:text-ink"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-slate-600 transition hover:text-ink"
            >
              Terms of Service
            </Link>
            <a
              href={`mailto:${supportEmail}`}
              className="text-sm text-slate-600 transition hover:text-ink"
            >
              {supportEmail}
            </a>
            <Link
              href="/sitemap.xml"
              className="text-sm text-slate-600 transition hover:text-ink"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
