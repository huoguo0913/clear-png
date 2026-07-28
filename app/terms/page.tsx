import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteUrl, socialImage, supportEmail } from "@/lib/pages";

const termsUrl = `${siteUrl}/terms`;

export const metadata: Metadata = {
  title: "Terms of Service | ClearPNG",
  description:
    "ClearPNG terms of service, acceptable use rules, payment terms, and support contact information.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: termsUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Terms of Service | ClearPNG",
    description:
      "ClearPNG terms covering background removal, acceptable use, payments, and customer support.",
    url: termsUrl,
    siteName: "ClearPNG",
    locale: "en_US",
    type: "website",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | ClearPNG",
    description:
      "ClearPNG terms covering background removal, acceptable use, payments, and customer support.",
    images: [socialImage.url],
  },
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <section className="hero-band">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="eyebrow">Terms</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              These terms apply when you use ClearPNG to remove image
              backgrounds and download transparent PNG files.
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Last updated: July 28, 2026
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-9 text-sm leading-7 text-slate-700">
            <TermsSection title="Use of ClearPNG">
              <p>
                ClearPNG provides online image background removal for logos,
                signatures, product photos, and everyday images. You are
                responsible for the images you upload and for making sure you
                have the right to process them.
              </p>
            </TermsSection>

            <TermsSection title="Acceptable Use">
              <p>
                You may not use ClearPNG to upload, process, distribute, or
                create adult content, pornography, sexually explicit content,
                sexually suggestive content, nudity, non-consensual intimate
                imagery, sexual exploitation or abuse material, or any content
                that is not suitable for workplace viewing.
              </p>
              <p>
                You may also not use ClearPNG for illegal content, hateful or
                harassing content, content that infringes another person&apos;s
                rights, malware, spam, or attempts to abuse or disrupt the
                service.
              </p>
              <p>
                ClearPNG may refuse processing, remove access, suspend accounts,
                or revoke credits if these rules are violated.
              </p>
            </TermsSection>

            <TermsSection title="Images and Results">
              <p>
                Images are processed for the current request. ClearPNG does not
                store uploaded images or processed results after the request is
                completed. Results depend on source image quality and third-party
                processing availability.
              </p>
            </TermsSection>

            <TermsSection title="Plans, Credits, and Payments">
              <p>
                Paid plans provide image credits for background removal. Each
                successful background removal uses one image credit. Payment
                processing is handled by third-party providers such as Creem and
                PayPal.
              </p>
              <p>
                If a payment or credit issue occurs, contact support and include
                the email address used for your ClearPNG account.
              </p>
            </TermsSection>

            <TermsSection title="Customer Support">
              <p>
                For billing, account, policy, or product support, contact{" "}
                <a
                  href={`mailto:${supportEmail}`}
                  className="font-semibold text-ink underline underline-offset-4"
                >
                  {supportEmail}
                </a>
                .
              </p>
              <p>
                You can also read the{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-ink underline underline-offset-4"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </TermsSection>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function TermsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
