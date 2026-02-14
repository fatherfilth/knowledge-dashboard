import Link from "next/link";
import { CATEGORIES } from "@/types/content";
import { fetchCategoryArticles } from "@/lib/content";

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

  const capitalizedCategory =
    category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
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
        {articles.length === 0
          ? "No articles in this category yet"
          : `${articles.length} ${articles.length === 1 ? "article" : "articles"}`}
      </p>

      {articles.length > 0 && (
        <div className="space-y-4">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/${category}/${article.slug}`}
              className="block rounded-lg border border-gray-200 p-4 transition hover:border-gray-300 hover:bg-gray-50"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                {article.title}
              </h2>
              <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                  {article.status}
                </span>
                {article.tags && article.tags.length > 0 && (
                  <span>{article.tags.join(", ")}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
