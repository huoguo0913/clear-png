import { pageOrder, pages, siteUrl } from "@/lib/pages";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...pageOrder.map((slug) => ({
      url: `${siteUrl}${pages[slug].path === "/" ? "" : pages[slug].path}`,
      lastModified: new Date("2026-07-13"),
      changeFrequency: "weekly" as const,
      priority: slug === "home" ? 1 : 0.8,
    })),
    {
      url: `${siteUrl}/pricing`,
      lastModified: new Date("2026-07-16"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ];
}
