import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchAllArticles, fetchCategoryArticles } from "@/lib/content";
import { getRelatedArticles } from "@/lib/tags";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { ArticleMetadata } from "@/components/ui/ArticleMetadata";
import { RelatedArticles } from "@/components/ui/RelatedArticles";

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

  const relatedArticles = await getRelatedArticles(article, 3);

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

      <article>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900">
          {article.title}
        </h1>

        <ArticleMetadata article={article} />

        <div
          className="prose prose-gray prose-sm md:prose-base lg:prose-lg max-w-none"
          dangerouslySetInnerHTML={{
            __html: String(
              await unified()
                .use(remarkParse)
                .use(remarkGfm)
                .use(remarkRehype, { allowDangerousHtml: true })
                .use(rehypePrettyCode, {
                  theme: "github-dark-dimmed",
                  keepBackground: true,
                })
                .use(rehypeStringify, { allowDangerousHtml: true })
                .process(article.content)
            ),
          }}
        />
      </article>

      <RelatedArticles articles={relatedArticles} />
    </div>
  );
}
