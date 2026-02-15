import yaml from "js-yaml";
import { octokit, REPO_CONFIG } from "./github";
import { LeaderboardEntrySchema } from "./schemas/leaderboard";
import type { LeaderboardEntry } from "./schemas/leaderboard";

/**
 * Fetches and parses the leaderboard data.yaml from GitHub
 *
 * Returns validated entries sorted by type → subcategory → rank.
 * Returns empty array if file doesn't exist or has no entries.
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const response = await octokit.rest.repos.getContent({
      owner: REPO_CONFIG.owner,
      repo: REPO_CONFIG.repo,
      path: "docs/_leaderboard/data.yaml",
    });

    if (!("content" in response.data)) {
      console.warn("[fetchLeaderboard] data.yaml has no content field");
      return [];
    }

    const rawContent = Buffer.from(response.data.content, "base64").toString(
      "utf-8"
    );
    const parsed = yaml.load(rawContent) as { entries?: unknown[] };

    if (!parsed?.entries || !Array.isArray(parsed.entries) || parsed.entries.length === 0) {
      return [];
    }

    const entries: LeaderboardEntry[] = [];

    for (const raw of parsed.entries) {
      const result = LeaderboardEntrySchema.safeParse(raw);
      if (result.success) {
        entries.push(result.data);
      } else {
        console.warn(
          "[fetchLeaderboard] Validation failed for entry:",
          raw,
          result.error.issues
        );
      }
    }

    return entries;
  } catch (error: any) {
    if (error.status === 404) {
      console.warn("[fetchLeaderboard] data.yaml not found (404)");
      return [];
    }
    throw error;
  }
}

/** Type display order and icons */
export const TYPE_CONFIG = {
  tool: { label: "Tools", icon: "🔧", order: 0 },
  skill: { label: "Skills", icon: "🧠", order: 1 },
  model: { label: "Models", icon: "🤖", order: 2 },
  application: { label: "Applications", icon: "📱", order: 3 },
  workflow: { label: "Workflows", icon: "🔄", order: 4 },
} as const;

/** Subcategory display labels */
export const SUBCATEGORY_LABELS: Record<string, string> = {
  coding: "Coding",
  design: "Design",
  "ui-ux": "UI/UX",
  "video-gen": "Video Generation",
  "prompt-engineering": "Prompt Engineering",
  "project-building": "Project Building",
  research: "Research",
  productivity: "Productivity",
  devops: "DevOps",
  data: "Data",
  audio: "Audio",
  writing: "Writing",
  other: "Other",
};

/**
 * Resolves a doc_link relative path to a dashboard route.
 *
 * doc_link paths are relative to docs/_leaderboard/data.yaml,
 * e.g. "../tools/cursor.md" → "/tools/cursor"
 */
export function resolveDocLink(docLink: string): string | null {
  // Strip leading ../
  const normalized = docLink.replace(/^\.\.\//, "");
  // Remove .md extension
  const withoutExt = normalized.replace(/\.md$/, "");
  // Should be "category/slug"
  const parts = withoutExt.split("/");
  if (parts.length === 2) {
    return `/${parts[0]}/${parts[1]}`;
  }
  return null;
}

export type GroupedLeaderboard = {
  type: LeaderboardEntry["type"];
  label: string;
  icon: string;
  subcategories: {
    subcategory: string;
    label: string;
    entries: LeaderboardEntry[];
  }[];
}[];

/**
 * Groups entries by type → subcategory, sorted by rank within each group.
 */
export function groupLeaderboard(entries: LeaderboardEntry[]): GroupedLeaderboard {
  const typeOrder = Object.entries(TYPE_CONFIG)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key]) => key as LeaderboardEntry["type"]);

  const byType = new Map<string, Map<string, LeaderboardEntry[]>>();

  for (const entry of entries) {
    if (!byType.has(entry.type)) {
      byType.set(entry.type, new Map());
    }
    const subcats = byType.get(entry.type)!;
    if (!subcats.has(entry.subcategory)) {
      subcats.set(entry.subcategory, []);
    }
    subcats.get(entry.subcategory)!.push(entry);
  }

  return typeOrder
    .filter((type) => byType.has(type))
    .map((type) => {
      const config = TYPE_CONFIG[type];
      const subcats = byType.get(type)!;

      const subcategories = [...subcats.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([subcategory, entries]) => ({
          subcategory,
          label: SUBCATEGORY_LABELS[subcategory] || subcategory,
          entries: [...entries].sort((a, b) => a.rank - b.rank),
        }));

      return {
        type,
        label: config.label,
        icon: config.icon,
        subcategories,
      };
    });
}
