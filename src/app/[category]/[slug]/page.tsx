import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchAllArticles, fetchCategoryArticles } from "@/lib/content";

export const dynamicParams = false;

export async function generateStaticParams() {
  const articles = await fetchAllArticles();
  return articles.map((article) => ({
    category: article.category,
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const articles = await fetchCategoryArticles(category);
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return {
      title: "Not Found | Ryder.AI",
    };
  }

  // Extract first 155 characters of content for description (SEO best practice: under 160 chars)
  const description = article.content.slice(0, 155).trim();

  return {
    title: `${article.title} | Ryder.AI`,
    description,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const articles = await fetchCategoryArticles(category);
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const capitalizedCategory =
    category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <Link
          href={`/${category}`}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to {capitalizedCategory}
        </Link>
      </div>

      <article className="prose prose-gray max-w-none">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900">
          {article.title}
        </h1>

        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
            {article.status}
          </span>
          <span>Category: {category}</span>
          <span>Created: {article.created.toLocaleDateString()}</span>
          {article.updated && (
            <span>Updated: {article.updated.toLocaleDateString()}</span>
          )}
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="mb-8">
            <span className="text-sm text-gray-600">Tags: </span>
            <span className="text-sm text-gray-900">
              {article.tags.join(", ")}
            </span>
          </div>
        )}

        <div className="rounded-lg bg-gray-50 p-6">
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
            {article.content}
          </pre>
        </div>
      </article>
    </div>
  );
}
