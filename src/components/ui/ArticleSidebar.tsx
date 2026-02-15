import Link from "next/link";
import type { Article } from "@/types/content";
import type { TocHeading } from "@/lib/toc";
import { StatusBadge } from "./StatusBadge";
import { tagToSlug } from "@/lib/tags";

interface ArticleSidebarProps {
  article: Article;
  headings: TocHeading[];
}

const categoryColors: Record<string, string> = {
  models: "#8B5CF6",
  tools: "#00E5CC",
  skills: "#FFB347",
  repos: "#F472B6",
  agents: "#38BDF8",
  projects: "#34D399",
};

export function ArticleSidebar({ article, headings }: ArticleSidebarProps) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
      {/* Status badge */}
      <StatusBadge status={article.status} />

      {/* Metadata */}
      <div className="space-y-3 text-sm">
        {article.author && (
          <div>
            <span className="text-muted">Author</span>
            <p className="font-medium text-primary">{article.author}</p>
          </div>
        )}
        <div>
          <span className="text-muted">Created</span>
          <p className="font-medium text-primary">
            <time dateTime={article.created.toISOString()}>
              {article.created.toLocaleDateString()}
            </time>
          </p>
        </div>
        {article.updated && (
          <div>
            <span className="text-muted">Updated</span>
            <p className="font-medium text-primary">
              <time dateTime={article.updated.toISOString()}>
                {article.updated.toLocaleDateString()}
              </time>
            </p>
          </div>
        )}
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${tagToSlug(tag)}`}
                className="rounded-pill border border-white/[0.08] bg-glass px-3 py-1 text-xs text-muted transition-colors hover:border-white/[0.16] hover:text-primary"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Table of contents */}
      {headings.length > 0 && (
        <nav aria-label="Table of contents">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
            On this page
          </h4>
          <ul className="space-y-1">
            {headings.map((heading) => (
              <li key={heading.slug}>
                <a
                  href={`#${heading.slug}`}
                  className={`block py-1 text-sm transition-colors hover:text-teal ${
                    heading.depth === 3
                      ? "pl-4 text-muted"
                      : "font-medium text-primary"
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </aside>
  );
}
