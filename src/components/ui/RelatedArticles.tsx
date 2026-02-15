import Link from "next/link";
import type { Article } from "@/types/content";

interface RelatedArticlesProps {
  articles: Article[];
  category?: string;
}

const categoryColors: Record<string, string> = {
  models: "#8B5CF6",
  tools: "#00E5CC",
  skills: "#FFB347",
  repos: "#F472B6",
  agents: "#38BDF8",
  projects: "#34D399",
};

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-white/[0.08] pt-12">
      <h2 className="mb-8 font-display text-2xl font-bold tracking-tight text-primary">
        Related Articles
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => {
          const color = categoryColors[article.category] || "#94A3B8";
          const capitalizedCategory =
            article.category.charAt(0).toUpperCase() + article.category.slice(1);

          return (
            <Link
              key={`${article.category}-${article.slug}`}
              href={`/${article.category}/${article.slug}`}
              className="group rounded-xl border border-white/[0.08] bg-glass p-5 transition-all duration-200 hover:border-white/[0.16] hover:shadow-md"
            >
              {/* Colored top border */}
              <div
                className="mb-4 h-0.5 w-12 rounded-full"
                style={{ backgroundColor: color }}
              />

              <span className="mb-1 block text-xs font-semibold" style={{ color }}>
                {capitalizedCategory}
              </span>
              <h3 className="mb-2 font-display text-base font-bold leading-tight tracking-tight text-primary transition-colors group-hover:text-teal">
                {article.title}
              </h3>
              <time
                dateTime={article.updated.toISOString()}
                className="text-xs text-muted"
              >
                {article.updated.toLocaleDateString()}
              </time>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
