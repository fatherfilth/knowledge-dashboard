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
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Home
        </Link>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Search Articles
        </h1>
        {query && (
          <p className="text-sm text-gray-600">
            Searching for &apos;{query}&apos;
          </p>
        )}
      </div>

      <div className="mb-8">
        <Suspense fallback={<div className="h-10" />}>
          <SearchBar />
        </Suspense>
      </div>

      <SearchResults query={query} articles={articles} />
    </div>
  );
}
