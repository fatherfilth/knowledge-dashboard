import { z } from "zod";

/**
 * Zod schema for article frontmatter validation
 *
 * CRITICAL: Status enum uses actual repository values: "in-progress", "stable", "complete"
 * (NOT "draft", "published", "archived")
 */
export const ArticleFrontmatterSchema = z.object({
  title: z.string(),
  status: z.enum(["in-progress", "stable", "complete"]),
  category: z.enum(["models", "tools", "skills", "repos", "agents", "projects"]),
  slug: z.string(),
  created: z.coerce.date(), // gray-matter parses YAML dates into Date objects, coerce handles both
  updated: z.coerce.date(),
  author: z.string(),
  tags: z.array(z.string()).default([]), // default([]) prevents validation failure on missing tags
});

export type ArticleFrontmatter = z.infer<typeof ArticleFrontmatterSchema>;
