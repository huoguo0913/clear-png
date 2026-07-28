import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteUrl, socialImage, supportEmail } from "@/lib/pages";

const privacyUrl = `${siteUrl}/privacy`;

export const metadata: Metadata = {
  title: "Privacy Policy | ClearPNG",
  description:
    "ClearPNG privacy policy for image background removal, account data, payment data, analytics, and customer support.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: privacyUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Privacy Policy | ClearPNG",
    description:
      "How ClearPNG handles uploaded images, account data, payments, analytics, and support requests.",
    url: privacyUrl,
    siteName: "ClearPNG",
    locale: "en_US",
    type: "website",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | ClearPNG",
    description:
      "How ClearPNG handles uploaded images, account data, payments, analytics, and support requests.",
    images: [socialImage.url],
  },
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <section className="hero-band">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="eyebrow">Policy</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              ClearPNG is built to remove image backgrounds with a lightweight,
              request-based workflow.
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Last updated: July 28, 2026
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-9 text-sm leading-7 text-slate-700">
            <PolicySection title="Information We Process">
              <p>
                When you use ClearPNG, we may process uploaded images, account
                information from Google sign-in, payment status, usage credits,
                basic analytics, and support messages you send to us.
              </p>
            </PolicySection>

            <PolicySection title="Uploaded Images">
              <p>
                Uploaded images are processed for the current background removal
                request. ClearPNG does not store uploaded images or processed
                results after the request is completed.
              </p>
              <p>
                To remove backgrounds, uploaded images are sent to a third-party
                processing provider. Do not upload images that you are not
                allowed to process or share with that provider.
              </p>
            </PolicySection>

            <PolicySection title="Accounts and Payments">
              <p>
                If you sign in with Google, we store the account details needed
                to identify your ClearPNG account, such as your Google account
                ID, name, email address, avatar URL, and sign-in timestamps.
              </p>
              <p>
                Payments are handled by third-party payment providers such as
                Creem and PayPal. ClearPNG does not store full card numbers or
                bank account details.
              </p>
            </PolicySection>

            <PolicySection title="Analytics and Cookies">
              <p>
                ClearPNG may use analytics tools to understand page visits,
                product usage, and errors. These tools may use cookies or
                similar technologies depending on your browser settings.
              </p>
            </PolicySection>

            <PolicySection title="Prohibited Content">
              <p>
                ClearPNG must not be used to upload or process adult content,
                pornography, sexually explicit content, sexually suggestive
                content, nudity, non-consensual intimate imagery, sexual
                exploitation or abuse material, or content that is not suitable
                for workplace viewing.
              </p>
            </PolicySection>

            <PolicySection title="Contact">
              <p>
                For privacy questions or customer support, contact{" "}
                <a
                  href={`mailto:${supportEmail}`}
                  className="font-semibold text-ink underline underline-offset-4"
                >
                  {supportEmail}
                </a>
                .
              </p>
              <p>
                Please also review the{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-ink underline underline-offset-4"
                >
                  Terms of Service
                </Link>
                .
              </p>
            </PolicySection>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function PolicySection({
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
