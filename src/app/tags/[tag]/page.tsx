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
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Home
        </Link>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          {displayName}
        </h1>
        <p className="text-sm text-gray-600">
          {articles.length} {articles.length === 1 ? "article" : "articles"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  );
}
