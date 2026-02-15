import type { Article } from "@/types/content";
import { fetchAllArticles } from "./content";

/**
 * Normalize tag to URL-safe slug
 * - Lowercase for case-insensitive matching
 * - Replace spaces with hyphens
 * - Remove special characters except hyphens
 */
export function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * Convert slug back to display format (spaces, lowercase)
 */
export function slugToTag(slug: string): string {
  return slug.replace(/-/g, " ");
}

/**
 * Extract all unique tags across all articles
 */
export async function getAllTags(): Promise<string[]> {
  const articles = await fetchAllArticles();
  const tagSet = new Set<string>();

  for (const article of articles) {
    if (article.tags && article.tags.length > 0) {
      for (const tag of article.tags) {
        tagSet.add(tag);
      }
    }
  }

  return Array.from(tagSet);
}

/**
 * Get all unique tag slugs for generateStaticParams
 */
export async function getAllTagSlugs(): Promise<string[]> {
  const tags = await getAllTags();
  const slugSet = new Set(tags.map(tagToSlug));
  return Array.from(slugSet);
}

/**
 * Get display name for tag from slug (preserves original casing)
 */
export async function getTagDisplayName(
  slug: string
): Promise<string | null> {
  const articles = await fetchAllArticles();

  for (const article of articles) {
    if (article.tags) {
      for (const tag of article.tags) {
        if (tagToSlug(tag) === slug) {
          return tag;
        }
      }
    }
  }

  return null;
}

/**
 * Find all articles with a specific tag (normalized matching)
 * @param slug - URL slug (e.g., "machine-learning")
 * @returns Articles containing tag, sorted by updated date (newest first)
 */
export async function getArticlesByTag(slug: string): Promise<Article[]> {
  const articles = await fetchAllArticles();

  const matching = articles.filter((article) => {
    if (!article.tags || article.tags.length === 0) return false;
    return article.tags.some((tag) => tagToSlug(tag) === slug);
  });

  // Clone before sorting to avoid mutating cache
  const sorted = [...matching].sort(
    (a, b) => b.updated.getTime() - a.updated.getTime()
  );

  return sorted;
}

/**
 * Calculate tag overlap between two articles using Set intersection
 */
function calculateTagOverlap(article1: Article, article2: Article): number {
  if (!article1.tags || !article2.tags) return 0;

  const tags1 = new Set(article1.tags.map(tagToSlug));
  const tags2 = new Set(article2.tags.map(tagToSlug));

  const intersection = [...tags1].filter((tag) => tags2.has(tag));
  return intersection.length;
}

/**
 * Find related articles based on tag similarity
 * @param currentArticle - The article to find related content for
 * @param limit - Maximum number of related articles to return (default: 3)
 * @returns Articles sorted by tag overlap (most similar first), excluding current article
 */
export async function getRelatedArticles(
  currentArticle: Article,
  limit: number = 3
): Promise<Article[]> {
  const allArticles = await fetchAllArticles();

  const candidates = allArticles.filter(
    (article) =>
      article.slug !== currentArticle.slug &&
      article.tags &&
      article.tags.length > 0
  );

  const scored = candidates.map((article) => ({
    article,
    overlap: calculateTagOverlap(currentArticle, article),
  }));

  const related = scored
    .filter((item) => item.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map((item) => item.article);

  return related;
}
