import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllTagSlugs,
  getArticlesByTag,
  getTagDisplayName,
} from "@/lib/tags";
import { ArticleCard } from "@/components/ui/ArticleCard";

export const dynamicParams = false;

export async function generateStaticParams() {
  const tags = await getAllTagSlugs();
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const displayName = await getTagDisplayName(tag);

  if (!displayName) {
    return {
      title: "Tag Not Found | Ryder.AI",
    };
  }

  return {
    title: `${displayName} Articles | Ryder.AI`,
    description: `Browse all articles tagged with ${displayName}`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const articles = await getArticlesByTag(tag);
  const displayName = await getTagDisplayName(tag);

  if (!displayName || articles.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 rounded-pill border border-white/[0.08] bg-glass px-4 py-2 text-sm font-medium text-teal backdrop-blur-sm transition-colors hover:border-teal/50 hover:bg-teal/10"
      >
        <span aria-hidden="true">←</span>
        Back to Home
      </Link>

      <h1 className="mb-2 font-display text-3xl font-bold tracking-tight text-primary">
        {displayName}
      </h1>
      <p className="mb-8 text-sm text-muted">
        {articles.length} {articles.length === 1 ? "article" : "articles"}
      </p>

      <div className="space-y-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  );
}
