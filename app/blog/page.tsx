import { blogPosts, metadataForBlogIndex } from "@/lib/blog";
import { siteUrl } from "@/lib/pages";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";

export const metadata = metadataForBlogIndex();

export default function BlogPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Blog
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Background removal tips, tutorials, and design best practices
          </p>
        </header>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-lg"
            >
              <Link
                href={`/blog/${post.slug}`}
                className="flex flex-1 flex-col p-6"
              >
                <div className="mb-3 flex items-center gap-3 text-sm text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {post.readingTime}
                  </span>
                </div>

                <h2 className="mb-3 text-xl font-semibold leading-tight text-ink">
                  {post.title}
                </h2>

                <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600">
                  {post.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5" aria-hidden />
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
