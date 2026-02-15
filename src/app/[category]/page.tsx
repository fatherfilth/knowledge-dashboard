import Link from "next/link";
import { CATEGORIES } from "@/types/content";
import { fetchCategoryArticles } from "@/lib/content";
import { ArticleCard } from "@/components/ui/ArticleCard";

export const dynamicParams = false;

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const capitalizedCategory =
    category.charAt(0).toUpperCase() + category.slice(1);

  return {
    title: `${capitalizedCategory} | Ryder.AI`,
    description: `Browse ${category} articles on Ryder.AI`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const articles = await fetchCategoryArticles(category);

  const sortedArticles = [...articles].sort(
    (a, b) => b.updated.getTime() - a.updated.getTime()
  );

  const capitalizedCategory =
    category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 rounded-pill border border-white/[0.08] bg-glass px-4 py-2 text-sm font-medium text-teal backdrop-blur-sm transition-colors hover:border-teal/50 hover:bg-teal/10"
      >
        <span aria-hidden="true">←</span>
        Back to Home
      </Link>

      <h1 className="mb-4 font-display text-4xl font-bold tracking-tight text-primary">
        {capitalizedCategory}
      </h1>

      <p className="mb-8 text-lg text-muted">
        {sortedArticles.length === 0
          ? "No articles in this category yet"
          : `${sortedArticles.length} ${sortedArticles.length === 1 ? "article" : "articles"}`}
      </p>

      {sortedArticles.length > 0 && (
        <div className="space-y-3">
          {sortedArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
