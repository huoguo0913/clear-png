import {
  blogPosts,
  getBlogPost,
  metadataForBlogPost,
  blogArticleJsonLd,
} from "@/lib/blog";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export function generateMetadata({ params }: Props) {
  const post = getBlogPost(params.slug);
  if (!post) return {};
  return metadataForBlogPost(post);
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to Blog
        </Link>

        <article>
          <header className="mb-8 border-b border-slate-200 pb-8">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                {post.category}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" aria-hidden />
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden />
                {post.readingTime}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {post.title}
            </h1>

            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              {post.description}
            </p>
          </header>

          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:text-2xl prose-h3:mt-8 prose-h3:text-xl prose-p:leading-relaxed prose-a:font-semibold prose-a:text-ink prose-a:underline prose-a:decoration-2 prose-a:underline-offset-2 hover:prose-a:text-slate-700 prose-strong:font-semibold prose-strong:text-ink prose-code:rounded prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-ul:my-6 prose-li:my-2 prose-table:border-collapse prose-th:border prose-th:border-slate-300 prose-th:bg-slate-100 prose-th:p-3 prose-th:text-left prose-td:border prose-td:border-slate-300 prose-td:p-3">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>

        <footer className="mt-12 border-t border-slate-200 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to all posts
          </Link>
        </footer>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogArticleJsonLd(post)),
        }}
      />
    </>
  );
}
