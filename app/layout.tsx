import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { metadataForPage, pages, siteJsonLd } from "@/lib/pages";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = metadataForPage(pages.home);

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()) }}
        />
      </body>
    </html>
  );
}
