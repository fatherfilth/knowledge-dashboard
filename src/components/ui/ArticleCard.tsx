import Link from "next/link";
import type { Article } from "@/types/content";
import { StatusBadge } from "./StatusBadge";
import { tagToSlug } from "@/lib/tags";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="relative rounded-lg border border-gray-200 p-6 transition hover:border-gray-300 hover:bg-gray-50">
      <h2 className="mb-2 text-lg font-semibold text-gray-900">
        <Link
          href={`/${article.category}/${article.slug}`}
          className="after:absolute after:inset-0"
        >
          {article.title}
        </Link>
      </h2>

      <div className="mb-3 flex items-center gap-3">
        <StatusBadge status={article.status} />
        <time
          dateTime={article.updated.toISOString()}
          className="text-sm text-gray-500"
        >
          {article.updated.toLocaleDateString()}
        </time>
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {article.tags.slice(0, 3).map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tagToSlug(tag)}`}
              className="relative z-10 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {tag}
            </Link>
          ))}
          {article.tags.length > 3 && (
            <span className="text-xs text-gray-400">
              +{article.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      <p className="line-clamp-2 text-sm text-gray-600">
        {article.content?.trim()
          ? article.content.slice(0, 300)
          : "No preview available"}
      </p>
    </article>
  );
}
