import matter from "gray-matter";
import { octokit, REPO_CONFIG } from "./github";
import { ArticleFrontmatterSchema } from "./schemas/article";
import type { Article } from "@/types/content";

/**
 * Fetches all articles from a specific category folder
 *
 * @param category - Category name (models, tools, skills, repos, agents, projects)
 * @returns Array of validated Article objects
 *
 * Behavior:
 * - Returns empty array if category directory doesn't exist (404)
 * - Filters to .md files only, excludes README.md and .gitkeep
 * - Excludes files in _templates and _index directories
 * - Validates frontmatter with Zod schema
 * - Skips files with invalid frontmatter (logs warning)
 * - Handles individual file fetch errors gracefully
 */
export async function fetchCategoryArticles(category: string): Promise<Article[]> {
  try {
    const path = `${REPO_CONFIG.basePath}/${category}`;

    // Fetch directory listing
    const response = await octokit.rest.repos.getContent({
      owner: REPO_CONFIG.owner,
      repo: REPO_CONFIG.repo,
      path,
    });

    // Handle non-directory responses
    if (!Array.isArray(response.data)) {
      console.warn(`[fetchCategoryArticles] ${path} is not a directory`);
      return [];
    }

    // Filter to markdown files only, exclude README.md and .gitkeep
    const markdownFiles = response.data.filter((entry) => {
      if (entry.type !== "file") return false;
      if (!entry.name.endsWith(".md")) return false;
      if (entry.name === "README.md" || entry.name === ".gitkeep") return false;

      // Exclude files in _templates or _index directories
      const isExcluded = REPO_CONFIG.excludePaths.some((excludePath) =>
        entry.path.startsWith(excludePath)
      );
      return !isExcluded;
    });

    // Fetch and parse each file
    const articles: Article[] = [];

    for (const file of markdownFiles) {
      try {
        // Fetch file content
        const fileResponse = await octokit.rest.repos.getContent({
          owner: REPO_CONFIG.owner,
          repo: REPO_CONFIG.repo,
          path: file.path,
        });

        // Type-narrow to file data
        if (!("content" in fileResponse.data)) {
          console.warn(`[fetchCategoryArticles] ${file.path} has no content field`);
          continue;
        }

        // Decode base64 content
        const rawContent = Buffer.from(fileResponse.data.content, "base64").toString("utf-8");

        // Parse frontmatter and content
        const { data: frontmatter, content } = matter(rawContent);

        // Validate frontmatter with Zod
        const result = ArticleFrontmatterSchema.safeParse(frontmatter);

        if (!result.success) {
          console.warn(
            `[fetchCategoryArticles] Validation failed for ${file.path}:`,
            result.error.issues
          );
          continue;
        }

        // Add validated article to results
        articles.push({
          ...result.data,
          content: content.trim(),
          path: file.path,
        });
      } catch (error) {
        console.warn(`[fetchCategoryArticles] Failed to fetch ${file.path}:`, error);
        continue;
      }
    }

    return articles;
  } catch (error: any) {
    // Category directory doesn't exist - return empty array
    if (error.status === 404) {
      console.warn(`[fetchCategoryArticles] Category ${category} not found (404)`);
      return [];
    }

    // Rate limit or other API errors - let them propagate
    throw error;
  }
}

/**
 * Fetches all articles from all categories
 *
 * @returns Array of all validated Article objects across all categories
 */
export async function fetchAllArticles(): Promise<Article[]> {
  const articlesByCategory = await Promise.all(
    REPO_CONFIG.categories.map((cat) => fetchCategoryArticles(cat))
  );

  return articlesByCategory.flat();
}

/**
 * Fetches category metadata with article counts
 *
 * @returns Array of { name, count } objects for each category
 *
 * Useful for Phase 5 category navigation
 */
export async function fetchCategories(): Promise<{ name: string; count: number }[]> {
  const categoryCounts = await Promise.all(
    REPO_CONFIG.categories.map(async (category) => {
      const articles = await fetchCategoryArticles(category);
      return {
        name: category,
        count: articles.length,
      };
    })
  );

  return categoryCounts;
}
