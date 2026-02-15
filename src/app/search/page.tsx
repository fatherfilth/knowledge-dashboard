import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { fetchAllArticles } from "@/lib/content";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";

export const metadata: Metadata = {
  title: "Search | Ryder.AI",
  description: "Search across all AI documentation articles",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params?.q || "";
  const articles = await fetchAllArticles();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 rounded-pill border border-white/[0.08] bg-glass px-4 py-2 text-sm font-medium text-teal backdrop-blur-sm transition-colors hover:border-teal/50 hover:bg-teal/10"
      >
        <span aria-hidden="true">←</span>
        Back to Home
      </Link>

      <h1 className="mb-2 font-display text-3xl font-bold tracking-tight text-primary">
        Search Articles
      </h1>
      {query && (
        <p className="mb-8 text-sm text-muted">
          Searching for &apos;{query}&apos;
        </p>
      )}

      <div className="mb-8 max-w-xl">
        <Suspense fallback={<div className="h-10" />}>
          <SearchBar />
        </Suspense>
      </div>

      <SearchResults query={query} articles={articles} />
    </div>
  );
}
