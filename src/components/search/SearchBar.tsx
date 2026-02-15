"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useRef } from "react";

export function SearchBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);

    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }

    if (pathname === "/search") {
      // On search page, update URL in-place
      router.replace(`/search?${params.toString()}`);
    } else {
      // On any other page, navigate to search page
      router.replace(`/search?${params.toString()}`);
    }
  }, 300);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (inputRef.current) {
        inputRef.current.value = "";
        handleSearch("");
      }
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-4 w-4 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        ref={inputRef}
        type="search"
        className="block w-full rounded-lg border border-white/[0.08] bg-glass py-2 pl-10 pr-3 text-sm text-primary backdrop-blur-sm placeholder:text-muted focus:border-teal/50 focus:outline-none focus:ring-1 focus:ring-teal/50"
        placeholder="Search articles..."
        aria-label="Search articles"
        defaultValue={searchParams.get("q")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
