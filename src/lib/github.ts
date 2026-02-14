import { Octokit } from "octokit";

/**
 * GitHub API client singleton
 *
 * Authenticates with GITHUB_TOKEN from environment if available.
 * Falls back to unauthenticated mode (60 req/hr) if token is missing.
 * Authenticated mode provides 5000 req/hr rate limit.
 */
export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Log warning if running unauthenticated
if (!process.env.GITHUB_TOKEN) {
  console.warn(
    "[GitHub API] No GITHUB_TOKEN found - using unauthenticated mode (60 req/hr). Set GITHUB_TOKEN in .env.local for production builds."
  );
}

/**
 * Repository configuration for AI Documentation Library
 */
export const REPO_CONFIG = {
  owner: "fatherfilth",
  repo: "AI-Documentation-Library",
  basePath: "docs",
  excludePaths: ["docs/_templates", "docs/_index"],
  categories: ["models", "tools", "skills", "repos", "agents", "projects"] as const,
} as const;
