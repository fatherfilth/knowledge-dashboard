import type { ArticleFrontmatter } from "@/lib/schemas/article";

/**
 * Article type combining frontmatter + content + metadata
 */
export interface Article extends ArticleFrontmatter {
  content: string; // markdown body
  path: string; // GitHub file path for debugging
}

/**
 * Category type matching the 6 content folders
 */
export type Category = "models" | "tools" | "skills" | "repos" | "agents" | "projects";

/**
 * Available categories as const array
 */
export const CATEGORIES = ["models", "tools", "skills", "repos", "agents", "projects"] as const;
