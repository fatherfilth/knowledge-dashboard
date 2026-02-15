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
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Home
        </Link>
      </div>

      <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900">
        {capitalizedCategory}
      </h1>

      <p className="mb-8 text-lg text-gray-600">
        {sortedArticles.length === 0
          ? "No articles in this category yet"
          : `${sortedArticles.length} ${sortedArticles.length === 1 ? "article" : "articles"}`}
      </p>

      {sortedArticles.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {sortedArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
