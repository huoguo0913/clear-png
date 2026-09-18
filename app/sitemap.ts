import { pageOrder, pages, siteUrl } from "@/lib/pages";
import { blogPosts } from "@/lib/blog";
import type { MetadataRoute } from "next";
export const dynamic = "force-static";
const lastModified = new Date("2026-07-23");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...pageOrder.map((slug) => ({
      url: `${siteUrl}${pages[slug].path === "/" ? "" : pages[slug].path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: slug === "home" ? 1 : 0.8,
    })),
    {
      url: `${siteUrl}/pricing`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...blogPosts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    {
      url: `${siteUrl}/terms`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
  ];
}
