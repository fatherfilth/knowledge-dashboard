"use client";

import { useState, useEffect } from "react";
import type Fuse from "fuse.js";
import type { Article } from "@/types/content";
import { ArticleCard } from "@/components/ui/ArticleCard";

interface SearchResultsProps {
  query: string;
  articles: Article[];
}

export function SearchResults({ query, articles }: SearchResultsProps) {
  const [results, setResults] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If no query, show prompt message
    if (!query) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    // Dynamically import Fuse.js
    import("fuse.js").then(({ default: FuseClass }) => {
      // Clone articles to avoid mutating cached data
      const searchableArticles = [...articles];

      // Configure Fuse.js with weighted keys
      const fuseOptions = {
        keys: [
          { name: "title", weight: 2 },
          { name: "tags", weight: 1.5 },
          { name: "content", weight: 1 },
        ],
        threshold: 0.3,
        ignoreLocation: true,
        minMatchCharLength: 2,
      };

      const fuse = new FuseClass(searchableArticles, fuseOptions);
      const searchResults = fuse.search(query).map((r) => r.item);

      setResults(searchResults);
      setIsLoading(false);
    });
  }, [query, articles]);

  // Loading state
  if (isLoading) {
    return <p className="text-muted">Searching...</p>;
  }

  // No query - show prompt
  if (!query) {
    return (
      <p className="text-muted">Enter a search term to find articles</p>
    );
  }

  // No results found
  if (results.length === 0) {
    return (
      <div className="text-muted">
        <p className="mb-2">No articles found for &apos;{query}&apos;</p>
        <p className="text-sm">Try different keywords or check your spelling</p>
      </div>
    );
  }

  // Render results list
  return (
    <div className="space-y-3">
      {results.map((article) => (
        <ArticleCard key={article.slug} article={article} />
      ))}
    </div>
  );
}
