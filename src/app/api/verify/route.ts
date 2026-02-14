/**
 * Verification API route for data infrastructure
 *
 * Tests all data fetching functionality and returns validation results.
 * Access at: http://localhost:3000/api/verify
 */

import { NextResponse } from "next/server";
import { fetchAllArticles, fetchCategoryArticles, fetchCategories } from "@/lib/content";
import { REPO_CONFIG } from "@/lib/github";

export async function GET() {
  try {
    const startTime = Date.now();

    // Check authentication
    const isAuthenticated = !!process.env.GITHUB_TOKEN;

    // Fetch all data
    const [allArticles, categories] = await Promise.all([
      fetchAllArticles(),
      fetchCategories(),
    ]);

    const duration = Date.now() - startTime;

    // Verify all 6 categories are present
    const expectedCategories = [...REPO_CONFIG.categories];
    const fetchedCategories = categories.map((c) => c.name);
    const missingCategories = expectedCategories.filter(
      (cat) => !fetchedCategories.includes(cat)
    );

    // Check for excluded paths
    const excludedArticles = allArticles.filter((article) =>
      REPO_CONFIG.excludePaths.some((path) => article.path.startsWith(path))
    );

    // Check for invalid frontmatter
    const invalidArticles = allArticles.filter(
      (article) =>
        !article.title ||
        !article.status ||
        !article.category ||
        !article.slug
    );

    // Check status values
    const validStatuses = ["in-progress", "stable", "complete"];
    const invalidStatuses = allArticles.filter(
      (article) => !validStatuses.includes(article.status)
    );

    // Determine overall status
    const allChecks = {
      authentication: { passed: isAuthenticated, message: isAuthenticated ? "Authenticated" : "Unauthenticated (limited rate)" },
      allCategoriesPresent: { passed: missingCategories.length === 0, missing: missingCategories },
      noExcludedPaths: { passed: excludedArticles.length === 0, count: excludedArticles.length },
      validFrontmatter: { passed: invalidArticles.length === 0, count: invalidArticles.length },
      validStatuses: { passed: invalidStatuses.length === 0, count: invalidStatuses.length },
    };

    const allPassed = Object.values(allChecks).every((check) => check.passed);

    return NextResponse.json({
      success: allPassed,
      duration: `${duration}ms`,
      stats: {
        totalArticles: allArticles.length,
        categories: categories.map((c) => ({ name: c.name, count: c.count })),
        authenticated: isAuthenticated,
      },
      checks: allChecks,
      samples: categories
        .filter((c) => c.count > 0)
        .map((cat) => {
          const articles = allArticles.filter((a) => a.category === cat.name);
          return {
            category: cat.name,
            count: cat.count,
            sampleTitles: articles.slice(0, 3).map((a) => a.title),
          };
        }),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
