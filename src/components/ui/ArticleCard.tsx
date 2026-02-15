import Link from "next/link";
import type { Article } from "@/types/content";
import { StatusBadge } from "./StatusBadge";
import { tagToSlug } from "@/lib/tags";

interface ArticleCardProps {
  article: Article;
}

const categoryColors: Record<string, string> = {
  models: "#8B5CF6",
  tools: "#00E5CC",
  skills: "#FFB347",
  repos: "#F472B6",
  agents: "#38BDF8",
  projects: "#34D399",
};

export function ArticleCard({ article }: ArticleCardProps) {
  const color = categoryColors[article.category] || "#94A3B8";
  const capitalizedCategory = article.category.charAt(0).toUpperCase() + article.category.slice(1);

  return (
    <article className="group relative grid grid-cols-[4px_1fr] gap-4 rounded-xl border border-white/[0.08] bg-glass p-4 backdrop-blur-sm transition-all duration-200 hover:border-white/[0.16] hover:shadow-md md:grid-cols-[4px_1fr_auto]">
      {/* Colored accent bar */}
      <div className="rounded-full" style={{ backgroundColor: color }} />

      {/* Content area */}
      <div className="min-w-0 space-y-2">
        {/* Category + date row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold" style={{ color }}>
            {capitalizedCategory}
          </span>
          <span className="text-muted">·</span>
          <time dateTime={article.updated.toISOString()} className="text-muted">
            {article.updated.toLocaleDateString()}
          </time>
        </div>

        {/* Title (with full-card link overlay) */}
        <h3 className="font-display text-lg font-bold leading-tight tracking-tight text-primary transition-colors group-hover:text-teal">
          <Link href={`/${article.category}/${article.slug}`} className="after:absolute after:inset-0">
            {article.title}
          </Link>
        </h3>

        {/* Tags as pills */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {article.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/tags/${tagToSlug(tag)}`}
                className="relative z-10 rounded-pill border border-white/[0.08] bg-elevated px-2 py-0.5 text-xs text-muted transition-colors hover:border-white/[0.16] hover:text-primary"
              >
                {tag}
              </Link>
            ))}
            {article.tags.length > 3 && (
              <span className="px-1 text-xs text-muted">
                +{article.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Status badge (wraps below on mobile, stays right on desktop) */}
      <div className="col-start-2 md:col-start-auto md:self-start">
        <StatusBadge status={article.status} />
      </div>
    </article>
  );
}
