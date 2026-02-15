# Phase 6: Search Implementation - Research

**Researched:** 2026-02-15
**Domain:** Client-side fuzzy search with Next.js App Router
**Confidence:** HIGH

## Summary

Phase 6 implements a global search feature across all articles using Fuse.js 7.1.0 for client-side fuzzy matching. The implementation follows Next.js App Router patterns with URL-based state management (searchParams), debouncing for performance, and lazy loading to avoid bundle bloat. The search will match against article title, content, and tags, displaying results using the existing ArticleCard component.

The research confirms that Fuse.js is the appropriate choice for this use case: it's lightweight (no backend needed), supports fuzzy matching out-of-the-box, and integrates well with Next.js through dynamic imports. The standard pattern is a client component search input that updates URL parameters, triggering server-side re-renders with filtered data.

**Primary recommendation:** Use `useDebouncedCallback` from `use-debounce` (300ms delay) with Next.js `useSearchParams` and dynamic `import()` for Fuse.js to create a responsive search experience without bundle bloat. Store search state in URL parameters for shareability and bookmarkability.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| fuse.js | 7.1.0 | Fuzzy search engine | Lightweight (~10KB gzipped), zero dependencies, built-in fuzzy matching, official TypeScript support |
| use-debounce | latest | Debouncing search input | Official Next.js tutorial recommendation, prevents excessive re-renders and computations |
| Next.js built-ins | 16.1.6 | `useSearchParams`, `usePathname`, `useRouter` from `next/navigation` | Standard App Router hooks for URL state management |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @next/bundle-analyzer | latest | Bundle size monitoring | Development only - verify lazy loading is working |
| React Suspense | Built-in | Loading states during search | Wrap search results to show skeleton while filtering |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Fuse.js | ElasticSearch/Algolia | Overkill for static site - adds backend complexity, cost, and latency |
| URL state | React useState | Loses shareability, bookmarkability, and SSR benefits |
| use-debounce | Custom debounce | Reinventing the wheel - use-debounce is battle-tested and recommended by Next.js docs |
| Client-side only | Server-side search API | Unnecessary for static content - adds API route overhead |

**Installation:**
```bash
npm install fuse.js use-debounce
# Optional for development
npm install --save-dev @next/bundle-analyzer
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── search/              # Search results page (NEW)
│   │   └── page.tsx         # Server component consuming searchParams
│   └── layout.tsx           # Add global search bar component
├── components/
│   ├── search/              # Search-specific components (NEW)
│   │   ├── SearchBar.tsx    # Client component with input, debouncing
│   │   └── SearchResults.tsx # Client component with Fuse.js lazy loading
│   └── ui/
│       └── ArticleCard.tsx  # Reuse existing component for results
└── lib/
    ├── content.ts           # Already has fetchAllArticles()
    └── search.ts            # (NEW) Search index types, Fuse config
```

### Pattern 1: URL-Based Search State
**What:** Search query stored in URL parameters (`/search?q=keyword`) instead of React state
**When to use:** All search implementations in Next.js App Router (official recommendation)
**Why:** Shareability, bookmarkability, browser history integration, SSR-compatible

**Example:**
```typescript
// Source: https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export function SearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);

    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <input
      type="search"
      onChange={(e) => handleSearch(e.target.value)}
      defaultValue={searchParams.get('q')?.toString()}
      placeholder="Search articles..."
    />
  );
}
```

**Key details:**
- Use `defaultValue` (not `value`) - URL is source of truth, not React state
- `useDebouncedCallback` wraps the handler, not the input value
- 300ms delay is standard (balance between responsiveness and performance)
- `replace()` instead of `push()` to avoid polluting browser history

### Pattern 2: Lazy-Loaded Fuse.js
**What:** Dynamic import of Fuse.js only when search is used
**When to use:** Always - prevents adding ~10KB to initial bundle for unused functionality
**Why:** Users who never search don't pay the bundle cost

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading
'use client';

import { useState, useEffect } from 'react';
import type Fuse from 'fuse.js';

export function SearchResults({ query, articles }: Props) {
  const [results, setResults] = useState<Article[]>([]);

  useEffect(() => {
    if (!query) {
      setResults(articles); // Show all when no query
      return;
    }

    // Lazy load Fuse.js only when needed
    import('fuse.js').then(({ default: Fuse }) => {
      const fuse = new Fuse(articles, {
        keys: ['title', 'content', 'tags'],
        threshold: 0.3,
        ignoreLocation: true,
      });

      const searchResults = fuse.search(query);
      setResults(searchResults.map((r) => r.item));
    });
  }, [query, articles]);

  return (
    <div>
      {results.map((article) => (
        <ArticleCard key={article.slug} article={article} />
      ))}
    </div>
  );
}
```

**Key details:**
- Import happens inside `useEffect` after component mounts
- Empty query shows all articles (common pattern from GitHub issues)
- Results are `{ item, refIndex, score }` - extract `.item` for Article data
- TypeScript: `import type Fuse` at top for types, `default: Fuse` in dynamic import

### Pattern 3: Fuse.js Configuration
**What:** Optimal settings for article search across title, content, tags
**When to use:** Initialize Fuse instance with these options
**Why:** Default threshold (0.6) is too loose; ignoreLocation prevents position-based penalties

**Example:**
```typescript
// Source: https://www.fusejs.io/api/options.html
const fuseOptions = {
  keys: [
    { name: 'title', weight: 2 },      // Title matches rank higher
    { name: 'tags', weight: 1.5 },     // Tags are important
    { name: 'content', weight: 1 },    // Content has baseline weight
  ],
  threshold: 0.3,           // 0.0 = perfect match, 1.0 = match anything (0.3 = tight fuzzy)
  ignoreLocation: true,     // Match anywhere in string (not just start)
  minMatchCharLength: 2,    // Ignore single-character matches
  shouldSort: true,         // Sort by relevance score
  includeScore: false,      // Don't need scores in UI
};
```

**Key details:**
- `threshold: 0.3` is tighter than default 0.6 (more relevant results)
- `ignoreLocation: true` removes positional bias (important for long content)
- Weighted keys: title > tags > content (title matches feel more relevant)
- `keys` accepts nested paths with dot notation: `'author.firstName'`

### Pattern 4: Search Results with Empty State
**What:** Handle three states - loading, no query, no results
**When to use:** All search result displays
**Why:** Good UX requires feedback for every state

**Example:**
```typescript
export function SearchResults({ query, results, isLoading }: Props) {
  if (isLoading) {
    return <div>Searching...</div>; // Or skeleton loader
  }

  if (!query) {
    return (
      <div>
        <p className="text-gray-500">Enter a search term to find articles</p>
        {/* Optionally show all articles or recent articles */}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div>
        <p className="text-gray-600">No articles found for "{query}"</p>
        <p className="text-sm text-gray-500">Try different keywords or check spelling</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {results.map((article) => (
        <ArticleCard key={article.slug} article={article} />
      ))}
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Initializing Fuse in every render:** Create instance once, memoize with `useMemo`
- **Using `value` with URL state:** Use `defaultValue` - URL is source of truth
- **No debouncing:** Every keystroke triggers search - destroys performance
- **Searching before lazy load completes:** Check if Fuse is loaded before calling
- **Not handling empty query:** Show all items or placeholder, never broken empty UI

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fuzzy string matching | Custom Levenshtein distance algorithm | Fuse.js | Edge cases: diacritics, case sensitivity, partial matches, weighted keys, scoring, location bias - all solved |
| Debouncing | Custom setTimeout/clearTimeout wrapper | `use-debounce` library | Race conditions, memory leaks, cleanup on unmount - all handled |
| Search input component | Custom input with state management | Native `<input type="search">` + URL params | Built-in clear button (×), accessibility, browser autofill, standards compliance |
| URL parameter parsing | Manual `window.location.search` parsing | Next.js `useSearchParams` hook | Type-safe, reactive to changes, handles encoding/decoding, SSR-compatible |
| Bundle size analysis | Manual webpack config | `@next/bundle-analyzer` | Visualizations, tree-shaking detection, dependency graphs, official Next.js plugin |

**Key insight:** Search is a solved problem. Fuse.js handles fuzzy matching complexity, Next.js provides URL state primitives, and use-debounce handles timing. Custom implementations introduce bugs that libraries already fixed.

## Common Pitfalls

### Pitfall 1: Bundle Bloat from Fuse.js
**What goes wrong:** Adding Fuse.js increases initial bundle by ~10KB gzipped, slowing page load for users who never search
**Why it happens:** Direct imports (`import Fuse from 'fuse.js'`) are included in main bundle by default
**How to avoid:** Use dynamic `import()` inside event handler or useEffect
**Warning signs:** @next/bundle-analyzer shows fuse.js in main chunk instead of separate async chunk

**Prevention code:**
```typescript
// ❌ BAD: Imported in every page load
import Fuse from 'fuse.js';

// ✅ GOOD: Loaded only when needed
const { default: Fuse } = await import('fuse.js');
```

### Pitfall 2: Performance Issues with Large Datasets
**What goes wrong:** Search takes >1 second on 4,000+ items, UI freezes while typing
**Why it happens:** Fuse.js runs synchronously on main thread; large datasets block rendering
**How to avoid:** (1) Debounce input to reduce search frequency, (2) Use `useMemo` to cache Fuse instance, (3) For >10,000 items, consider Web Workers (see `fuse.js-worker` library)
**Warning signs:** Typing feels laggy, React DevTools shows long render times, CPU profiler shows Fuse.search() blocking

**Prevention pattern:**
```typescript
// Memoize Fuse instance - only recreate when articles change
const fuse = useMemo(() => {
  return new Fuse(articles, fuseOptions);
}, [articles]);

// Debounce prevents searching on every keystroke
const handleSearch = useDebouncedCallback((term: string) => {
  if (fuse) {
    const results = fuse.search(term);
    setResults(results.map(r => r.item));
  }
}, 300);
```

### Pitfall 3: Threshold Misconfiguration
**What goes wrong:** Search returns irrelevant results (threshold too high) or misses typos (threshold too low)
**Why it happens:** Default threshold is 0.6, which is very permissive; documentation doesn't explain appropriate values for different use cases
**How to avoid:** Start with 0.3 for strict matching, 0.4 for moderate typos, 0.6 for loose/exploratory search; test with real user queries
**Warning signs:** Users report "irrelevant results" or "can't find article I know exists"

**Threshold guide:**
- `0.0` - Perfect match only (exact string)
- `0.1-0.2` - Minor typos (1-2 characters)
- `0.3-0.4` - **Recommended for article search** (handles typos, abbreviations)
- `0.5-0.6` - Very fuzzy (matches loosely related terms)
- `1.0` - Matches everything (useless)

### Pitfall 4: Controlled Input with URL State
**What goes wrong:** Using `value` prop causes input to not update when URL changes externally (back button, direct link)
**Why it happens:** `value` makes React control the input, but URL is the source of truth, creating a conflict
**How to avoid:** Use `defaultValue` with URL params - React reads initial value from URL, then URL updates drive re-renders
**Warning signs:** Input doesn't update when clicking browser back/forward, or when sharing search URL

```typescript
// ❌ BAD: Controlled input fights with URL
const [query, setQuery] = useState('');
<input value={query} onChange={(e) => setQuery(e.target.value)} />

// ✅ GOOD: Uncontrolled input synced to URL
const searchParams = useSearchParams();
<input defaultValue={searchParams.get('q')?.toString()} />
```

### Pitfall 5: Missing Suspense Boundary
**What goes wrong:** Static rendering breaks, or page shows stale data during search transitions
**Why it happens:** `useSearchParams` triggers dynamic rendering; without Suspense, entire page becomes client-rendered
**How to avoid:** Wrap search component in `<Suspense>` boundary to isolate dynamic parts
**Warning signs:** Build warning "useSearchParams should be wrapped in Suspense", or flash of unstyled content

```typescript
// ❌ BAD: No Suspense boundary
export default function Layout({ children }) {
  return (
    <div>
      <SearchBar />
      {children}
    </div>
  );
}

// ✅ GOOD: Suspense isolates client component
import { Suspense } from 'react';

export default function Layout({ children }) {
  return (
    <div>
      <Suspense fallback={<div>Loading search...</div>}>
        <SearchBar />
      </Suspense>
      {children}
    </div>
  );
}
```

### Pitfall 6: Incorrect TypeScript Import
**What goes wrong:** Type errors when using Fuse.js with TypeScript, especially with dynamic imports
**Why it happens:** Package has both CommonJS (.d.ts) and ESM (.d.cts) types; dynamic imports need special syntax
**How to avoid:** Use `import type Fuse` for types at top, `{ default: Fuse }` for dynamic import
**Warning signs:** "Cannot find module 'fuse.js'" or "Fuse is not a constructor" TypeScript errors

```typescript
// ✅ CORRECT: Type import at top, runtime import dynamic
import type Fuse from 'fuse.js';

// Later in component
const { default: FuseClass } = await import('fuse.js');
const fuse: Fuse<Article> = new FuseClass(articles, options);
```

### Pitfall 7: Searching with Mutated Cache
**What goes wrong:** Search breaks or returns stale results after sorting/filtering articles
**Why it happens:** Fuse.js holds reference to original array; Next.js caches responses; sorting mutates cache
**How to avoid:** Clone array before passing to Fuse (spread operator or Array.from())
**Warning signs:** "Clone before sort" pattern exists in project; search shows outdated article order

```typescript
// ✅ GOOD: Clone before creating Fuse instance
const fuse = new Fuse([...articles], fuseOptions);
```

## Code Examples

Verified patterns from official sources:

### Basic Search Input with Debouncing
```typescript
// Source: https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
'use client';

import { useDebouncedCallback } from 'use-debounce';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export function SearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // Reset pagination on new search

    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative">
      <input
        type="search"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('q')?.toString()}
        placeholder="Search articles..."
        className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
```

### Lazy-Loaded Fuse Search with TypeScript
```typescript
// Source: https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading
'use client';

import { useState, useEffect, useMemo } from 'react';
import type Fuse from 'fuse.js';
import type { Article } from '@/types/content';

interface SearchResultsProps {
  query: string;
  articles: Article[];
}

export function SearchResults({ query, articles }: SearchResultsProps) {
  const [results, setResults] = useState<Article[]>(articles);
  const [isLoading, setIsLoading] = useState(false);

  // Memoize Fuse options to prevent recreating on every render
  const fuseOptions = useMemo(() => ({
    keys: [
      { name: 'title', weight: 2 },
      { name: 'tags', weight: 1.5 },
      { name: 'content', weight: 1 },
    ],
    threshold: 0.3,
    ignoreLocation: true,
    minMatchCharLength: 2,
  }), []);

  useEffect(() => {
    if (!query) {
      setResults(articles);
      return;
    }

    setIsLoading(true);

    // Lazy load Fuse.js
    import('fuse.js').then(({ default: FuseClass }) => {
      const fuse: Fuse<Article> = new FuseClass([...articles], fuseOptions);
      const searchResults = fuse.search(query);
      setResults(searchResults.map((r) => r.item));
      setIsLoading(false);
    });
  }, [query, articles, fuseOptions]);

  if (isLoading) {
    return <div className="text-gray-500">Searching...</div>;
  }

  if (query && results.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-gray-600">No articles found for "{query}"</p>
        <p className="text-sm text-gray-500">Try different keywords or check spelling</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {results.map((article) => (
        <ArticleCard key={article.slug} article={article} />
      ))}
    </div>
  );
}
```

### Server Component Reading Search Params
```typescript
// Source: https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
import { Suspense } from 'react';
import { fetchAllArticles } from '@/lib/content';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';

interface SearchPageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params?.q || '';

  // Fetch all articles at build time (static generation)
  const articles = await fetchAllArticles();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Search Articles</h1>

      <Suspense fallback={<div>Loading search...</div>}>
        <SearchBar />
      </Suspense>

      <div className="mt-8">
        <SearchResults query={query} articles={articles} />
      </div>
    </div>
  );
}
```

### Keyboard Accessibility Pattern
```typescript
// Source: https://webaim.org/techniques/keyboard/
export function SearchBar() {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Clear search on Escape
    if (e.key === 'Escape') {
      e.currentTarget.value = '';
      handleSearch('');
      e.currentTarget.blur(); // Return focus to body
    }
  };

  return (
    <input
      type="search"
      onKeyDown={handleKeyDown}
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Search articles... (Press Esc to clear)"
      aria-label="Search articles"
    />
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client state (useState) | URL searchParams | Next.js 13+ App Router (2022) | Shareability, bookmarkability, SSR support, browser history |
| Manual debounce with setTimeout | `use-debounce` library | Recommended in Next.js Learn (2024) | Cleaner code, fewer bugs, official endorsement |
| Synchronous imports | Dynamic imports for optimization | Next.js 14+ guidance (2024) | Better bundle splitting, faster initial loads |
| `useTransition` for search | Debouncing only | React 18+ (2022) | useTransition doesn't help with synchronous work like Fuse.js |
| Controlled inputs (`value` prop) | Uncontrolled with URL (`defaultValue`) | App Router pattern (2023+) | Fixes back button and shared URL handling |

**Deprecated/outdated:**
- **`@types/fuse`**: No longer needed - Fuse.js 7.x includes built-in TypeScript types
- **Pages Router search patterns**: Use App Router hooks (`useSearchParams` from `next/navigation`, not `next/router`)
- **Extended search syntax**: Complex feature (`useExtendedSearch`), but rarely needed for article search - adds bundle size

## Open Questions

1. **Should search be global header or dedicated page?**
   - What we know: Official Next.js pattern shows dedicated `/search` page; global header adds complexity
   - What's unclear: User preference for always-visible search vs dedicated page
   - Recommendation: Start with dedicated `/search` page, add global header in future iteration if needed

2. **Should we search content preview or full markdown?**
   - What we know: Article has `content` field with full markdown; ArticleCard shows 300-char preview
   - What's unclear: Whether searching full content provides better UX or just noise
   - Recommendation: Search full `content` field (already fetched at build time), but consider lower weight than title/tags

3. **How many articles before performance becomes an issue?**
   - What we know: GitHub issues mention slowness at 4,000+ items; current site has <100 articles
   - What's unclear: Exact threshold where Web Workers become necessary
   - Recommendation: Implement standard debounce + memoization; monitor with bundle analyzer; defer Web Workers until performance degrades

## Sources

### Primary (HIGH confidence)
- [Fuse.js Official Documentation](https://www.fusejs.io/) - Core library features and configuration
- [Fuse.js API Options](https://www.fusejs.io/api/options.html) - Configuration reference (threshold, keys, etc.)
- [Fuse.js Examples](https://www.fusejs.io/examples.html) - Code patterns
- [Fuse.js GitHub Repository](https://github.com/krisk/Fuse) - Version 7.1.0, TypeScript support, bundle info
- [Next.js Official Tutorial: Search and Pagination](https://nextjs.org/learn/dashboard-app/adding-search-and-pagination) - useSearchParams, debouncing pattern, URL state
- [Next.js: Lazy Loading](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading) - Dynamic imports for bundle optimization
- [Next.js: useSearchParams API](https://nextjs.org/docs/app/api-reference/functions/use-search-params) - Official hook documentation

### Secondary (MEDIUM confidence)
- [Implementing Free, Fast, Local Search Using Fuse.js with Next.js SSR | Konfig](https://konfigthis.com/blog/how-to-implement-free-fast-local-search-with-fuse-js-with-next-js-ssr/) - Integration patterns
- [Building Lightning-Fast Live Search with Debounce & URL Sync | Medium](https://medium.com/@divyanshsharma0631/the-next-js-search-sorcery-building-lightning-fast-live-search-with-debounce-url-sync-beyond-c759578eb6a4) - Modern patterns (2024+)
- [Understanding Debounce by building an awesome search filter in NEXT JS | Medium](https://medium.com/@codewithmarish/understanding-debounce-by-building-an-awesome-search-filter-in-next-js-8f5480452748) - Debouncing explanation
- [BundlePhobia: fuse.js](https://bundlephobia.com/package/fuse.js) - Bundle size verification
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/) - Accessibility standards
- [Search Accessibility Tests | USWDS](https://designsystem.digital.gov/components/search/accessibility-tests/) - Government accessibility guidelines

### Tertiary (LOW confidence - community reports, needs validation)
- [Fuse.js Performance Issues #282](https://github.com/krisk/Fuse/issues/282) - Community reports of slowness at 4,000+ items
- [Fuse.js TypeScript Import Issue #780](https://github.com/krisk/Fuse/issues/780) - CommonJS/ESM type definition challenges
- [fuse.js-worker](https://github.com/kamilmielnik/fuse.js-worker) - Web Worker wrapper (not officially maintained)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Fuse.js 7.1.0 verified from GitHub, Next.js patterns from official docs
- Architecture: HIGH - Patterns verified from Next.js Learn tutorial and official API reference
- Pitfalls: MEDIUM - Performance issues confirmed in GitHub issues, patterns verified from docs, but specific thresholds based on community experience
- Bundle optimization: HIGH - Dynamic import pattern directly from Next.js official lazy loading docs
- TypeScript integration: MEDIUM - Built-in types confirmed, but import issues reported in GitHub suggest ongoing edge cases

**Research date:** 2026-02-15
**Valid until:** ~30 days (stable libraries, but Next.js ecosystem evolves quickly - re-verify if Next.js 17 releases)
