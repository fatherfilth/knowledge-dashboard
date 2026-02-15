import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchAllArticles, fetchCategoryArticles } from "@/lib/content";
import { getRelatedArticles } from "@/lib/tags";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { extractToc } from "@/lib/toc";
import { ArticleSidebar } from "@/components/ui/ArticleSidebar";
import { RelatedArticles } from "@/components/ui/RelatedArticles";

export const dynamicParams = false;

const categoryColors: Record<string, string> = {
  models: "#8B5CF6",
  tools: "#00E5CC",
  skills: "#FFB347",
  repos: "#F472B6",
  agents: "#38BDF8",
  projects: "#34D399",
};

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
  const headings = extractToc(article.content);
  const categoryColor = categoryColors[category] || "#94A3B8";

  // Render markdown
  const htmlContent = String(
    await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeSlug)
      .use(rehypePrettyCode, {
        theme: "github-dark-dimmed",
        keepBackground: true,
      })
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(article.content)
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Back link as pill button */}
      <Link
        href={`/${category}`}
        className="mb-8 inline-flex items-center gap-2 rounded-pill border border-white/[0.08] bg-glass px-4 py-2 text-sm font-medium text-teal backdrop-blur-sm transition-colors hover:border-teal/50 hover:bg-teal/10"
      >
        <span aria-hidden="true">←</span>
        Back to {capitalizedCategory}
      </Link>

      {/* Article header */}
      <header className="mb-12">
        <Link
          href={`/${category}`}
          className="mb-3 inline-block text-sm font-semibold"
          style={{ color: categoryColor }}
        >
          {capitalizedCategory}
        </Link>
        <h1
          className="mb-4 font-display text-3xl font-extrabold tracking-tight text-primary md:text-4xl lg:text-5xl"
          style={{ fontSize: "clamp(1.75rem, calc(1.25rem + 2.5vw), 2.5rem)" }}
        >
          {article.title}
        </h1>
        {/* Accent bar */}
        <div
          className="h-1 w-16 rounded-full"
          style={{ backgroundColor: categoryColor }}
        />
      </header>

      {/* Two-column layout */}
      <div className="grid gap-12 lg:grid-cols-[260px_1fr]">
        {/* Sidebar — metadata grid on tablet, sticky on desktop */}
        <div className="grid grid-cols-1 gap-6 xs:grid-cols-2 lg:block">
          <ArticleSidebar article={article} headings={headings} />
        </div>

        {/* Article content */}
        <article className="min-w-0">
          <div
            className="prose prose-invert max-w-[75ch] prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-a:text-teal prose-a:underline prose-blockquote:border-purple prose-blockquote:bg-purple/[0.08] prose-blockquote:rounded-r-lg prose-code:text-teal prose-code:bg-code-bg prose-code:rounded prose-code:border prose-code:border-white/[0.08] prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-[''] prose-code:after:content-['']"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </article>
      </div>

      {/* Related articles */}
      <RelatedArticles articles={relatedArticles} category={category} />
    </div>
  );
}
