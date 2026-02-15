import Link from "next/link";
import type { Article } from "@/types/content";
import { StatusBadge } from "./StatusBadge";
import { tagToSlug } from "@/lib/tags";

interface ArticleMetadataProps {
  article: Article;
}

export function ArticleMetadata({ article }: ArticleMetadataProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
        <StatusBadge status={article.status} />

        <time dateTime={article.created.toISOString()}>
          Created {article.created.toLocaleDateString()}
        </time>

        {article.updated && (
          <time dateTime={article.updated.toISOString()}>
            Updated {article.updated.toLocaleDateString()}
          </time>
        )}

        {article.author && (
          <span>By {article.author}</span>
        )}
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {article.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tagToSlug(tag)}`}
              className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
