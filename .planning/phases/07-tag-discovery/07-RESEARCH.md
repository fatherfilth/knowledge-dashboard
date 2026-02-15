# Phase 7: Tag Discovery - Research

**Researched:** 2026-02-15
**Domain:** Tag-based navigation and content recommendation with Next.js App Router
**Confidence:** HIGH

## Summary

Phase 7 implements tag-based browsing and related article discovery. Users can click a tag to see all articles with that tag across categories, and article pages display related articles based on tag overlap. The implementation follows Next.js App Router patterns with `generateStaticParams` for static tag pages and simple JavaScript Set operations for tag-based filtering and similarity scoring.

The research confirms that tag discovery requires two features: (1) tag pages showing all articles with a specific tag, implemented as a dynamic route `/tags/[tag]/page.tsx` with static generation, and (2) related articles on article pages, calculated by measuring tag overlap using Set intersection. Both features use existing data structures and components, requiring no external libraries.

**Primary recommendation:** Create `/tags/[tag]/page.tsx` dynamic route with `generateStaticParams` extracting all unique tags from articles. Use Set intersection to calculate tag overlap for related articles, sorted by overlap count (most shared tags first). Normalize tag slugs with lowercase and hyphen replacement to ensure URL-safe routing.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js built-ins | 16.1.6 | `generateStaticParams`, dynamic routes `[tag]` | Standard App Router pattern for static generation of dynamic routes |
| JavaScript Set | Native | Tag extraction, intersection, unique values | Built-in, zero dependencies, O(1) lookup performance |
| Existing components | Current | `ArticleCard`, `fetchAllArticles` | Reuse established patterns from Phase 5-6 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| TypeScript utility types | Built-in | Type inference for tag arrays, article filtering | All type-safe operations |
| Array methods | Native | `filter()`, `map()`, `sort()`, `slice()` | Data transformation and sorting |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Set intersection | Array.filter() + includes() | Set is O(1) lookup vs O(n), more readable for set operations |
| Tag similarity scoring | Jaccard similarity, TF-IDF, cosine similarity | Overkill for small dataset - simple overlap count is more interpretable and sufficient |
| Client-side filtering | Server-side tag index with API | Unnecessary for static site - all data available at build time |
| External library | lodash.intersection, ramda | Native Set has identical functionality, zero bundle cost |

**Installation:**
```bash
# No new dependencies required - uses native JavaScript and existing Next.js
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── [category]/
│   │   └── [slug]/
│   │       └── page.tsx         # Add RelatedArticles component (MODIFY)
│   ├── tags/                    # Tag browsing (NEW)
│   │   └── [tag]/
│   │       └── page.tsx         # Dynamic tag page with generateStaticParams
│   └── layout.tsx               # Already has SearchBar in header
├── components/
│   ├── ui/
│   │   ├── ArticleCard.tsx      # Existing - make tags clickable (MODIFY)
│   │   └── RelatedArticles.tsx  # New component for article pages
│   └── search/
│       └── ...                  # Existing search components
└── lib/
    ├── content.ts               # Already has fetchAllArticles()
    └── tags.ts                  # NEW - tag extraction, similarity utilities
```

### Pattern 1: Tag Slug Normalization
**What:** Convert tag display text to URL-safe slug format
**When to use:** All tag URLs, tag routing, tag comparison
**Why:** Tags may contain spaces, special characters, or mixed case - URLs require consistent, safe encoding

**Example:**
```typescript
// src/lib/tags.ts
/**
 * Normalize tag to URL-safe slug
 * - Lowercase for case-insensitive matching
 * - Replace spaces with hyphens
 * - Remove special characters except hyphens
 */
export function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // spaces to hyphens
    .replace(/[^\w\-]/g, '')        // remove non-word chars except hyphens
    .replace(/\-\-+/g, '-')         // collapse multiple hyphens
    .replace(/^-+/, '')             // trim leading hyphens
    .replace(/-+$/, '');            // trim trailing hyphens
}

/**
 * Reverse: slug to display tag (lowercase with spaces)
 */
export function slugToTag(slug: string): string {
  return slug.replace(/-/g, ' ');
}
```

**Key details:**
- "Machine Learning" → "machine-learning"
- "GPT-4" → "gpt-4"
- "TypeScript" → "typescript"
- Normalization ensures "Machine Learning" and "machine learning" resolve to same page
- Articles store tags as-is in frontmatter; normalization only for URLs

### Pattern 2: Extract All Unique Tags
**What:** Build array of all unique tags from all articles for `generateStaticParams`
**When to use:** Static generation of tag pages at build time
**Why:** Next.js needs exhaustive list of tag slugs to pre-render all `/tags/[tag]` pages

**Example:**
```typescript
// Source: https://bionicjulia.com/blog/creating-dynamic-tag-page-nextjs-nested-routes
import { fetchAllArticles } from './content';

/**
 * Extract all unique tags across all articles
 * Returns array of normalized tag slugs for static generation
 */
export async function getAllTags(): Promise<string[]> {
  const articles = await fetchAllArticles();

  // Use Set to collect unique tags (case-sensitive from frontmatter)
  const tagSet = new Set<string>();

  for (const article of articles) {
    if (article.tags && article.tags.length > 0) {
      for (const tag of article.tags) {
        tagSet.add(tag);
      }
    }
  }

  // Convert to array and return
  return Array.from(tagSet);
}

/**
 * Get all unique tag slugs for generateStaticParams
 */
export async function getAllTagSlugs(): Promise<string[]> {
  const tags = await getAllTags();

  // Normalize to URL-safe slugs and deduplicate
  const slugSet = new Set(tags.map(tagToSlug));

  return Array.from(slugSet);
}
```

**Key details:**
- Set automatically handles duplicates (case-sensitive)
- `tagToSlug()` normalization may collapse multiple tags to same slug
- Use second Set to deduplicate after normalization
- Empty tags array is safe - filter will simply skip

### Pattern 3: Filter Articles by Tag
**What:** Find all articles containing a specific tag (normalized comparison)
**When to use:** Tag page displays all matching articles
**Why:** Articles store original case tags; need normalized matching for URL slug

**Example:**
```typescript
/**
 * Find all articles with a specific tag (normalized matching)
 * @param slug - URL slug (e.g., "machine-learning")
 * @returns Articles containing tag, sorted by updated date (newest first)
 */
export async function getArticlesByTag(slug: string): Promise<Article[]> {
  const articles = await fetchAllArticles();

  // Filter articles that have a tag matching the slug
  const matching = articles.filter((article) => {
    if (!article.tags || article.tags.length === 0) return false;

    // Check if any of article's tags match the slug (normalized)
    return article.tags.some((tag) => tagToSlug(tag) === slug);
  });

  // Sort by updated date (newest first) - clone before sorting!
  const sorted = [...matching].sort((a, b) => {
    return b.updated.getTime() - a.updated.getTime();
  });

  return sorted;
}

/**
 * Get display name for tag from slug
 * Uses first matching tag found in articles (preserves original case)
 */
export async function getTagDisplayName(slug: string): Promise<string | null> {
  const articles = await fetchAllArticles();

  for (const article of articles) {
    if (article.tags) {
      for (const tag of article.tags) {
        if (tagToSlug(tag) === slug) {
          return tag; // Return original casing
        }
      }
    }
  }

  return null; // Tag not found
}
```

**Key details:**
- Always clone before sorting (`[...matching].sort()`) to avoid mutating Next.js cache
- `some()` checks if any tag matches (article can have multiple tags)
- Normalized comparison: user's original "Machine Learning" matches URL "machine-learning"
- `getTagDisplayName()` preserves original casing for page title

### Pattern 4: Related Articles by Tag Overlap
**What:** Find articles with most shared tags, sorted by overlap count
**When to use:** "Related Articles" section on article detail pages
**Why:** Content with similar tags is likely conceptually related

**Example:**
```typescript
// Source: Set intersection pattern from MDN and tag-based recommendation research
/**
 * Calculate tag overlap between two articles using Set intersection
 * @returns Number of shared tags
 */
function calculateTagOverlap(article1: Article, article2: Article): number {
  if (!article1.tags || !article2.tags) return 0;

  const tags1 = new Set(article1.tags.map(tagToSlug));
  const tags2 = new Set(article2.tags.map(tagToSlug));

  // Set intersection: count tags present in both sets
  const intersection = [...tags1].filter(tag => tags2.has(tag));

  return intersection.length;
}

/**
 * Find related articles based on tag similarity
 * @param currentArticle - The article to find related content for
 * @param limit - Maximum number of related articles to return (default: 3)
 * @returns Articles sorted by tag overlap (most similar first), excluding current article
 */
export async function getRelatedArticles(
  currentArticle: Article,
  limit: number = 3
): Promise<Article[]> {
  const allArticles = await fetchAllArticles();

  // Exclude current article and articles with no tags
  const candidates = allArticles.filter(
    (article) =>
      article.slug !== currentArticle.slug &&
      article.tags &&
      article.tags.length > 0
  );

  // Calculate overlap score for each candidate
  const scored = candidates.map((article) => ({
    article,
    overlap: calculateTagOverlap(currentArticle, article),
  }));

  // Filter to articles with at least 1 shared tag, sort by overlap (desc)
  const related = scored
    .filter((item) => item.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map((item) => item.article);

  return related;
}
```

**Key details:**
- Set.has() is O(1) lookup - efficient for tag comparison
- Normalize tags for comparison (case-insensitive, consistent format)
- Filter `overlap > 0` ensures only related content appears
- Sort descending: highest overlap first (most similar)
- `limit` parameter controls UI density (3-5 typical)
- If no shared tags, returns empty array (no forced recommendations)

### Pattern 5: Dynamic Tag Page with Static Generation
**What:** `/tags/[tag]/page.tsx` with `generateStaticParams` for all unique tags
**When to use:** Tag browsing route
**Why:** Pre-render all tag pages at build time for instant loading

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
// app/tags/[tag]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllTagSlugs, getArticlesByTag, getTagDisplayName } from '@/lib/tags';
import { ArticleCard } from '@/components/ui/ArticleCard';

export const dynamicParams = false; // 404 for tags not in generateStaticParams

export async function generateStaticParams() {
  const tags = await getAllTagSlugs();

  return tags.map((tag) => ({
    tag: tag,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const displayName = await getTagDisplayName(tag);

  if (!displayName) {
    return {
      title: 'Tag Not Found | Ryder.AI',
    };
  }

  return {
    title: `${displayName} Articles | Ryder.AI`,
    description: `Browse all articles tagged with ${displayName}`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const articles = await getArticlesByTag(tag);
  const displayName = await getTagDisplayName(tag);

  if (!displayName || articles.length === 0) {
    notFound();
  }

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
          {displayName}
        </h1>
        <p className="text-sm text-gray-600">
          {articles.length} {articles.length === 1 ? 'article' : 'articles'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  );
}
```

**Key details:**
- `dynamicParams = false` ensures only pre-generated tags work (404 for invalid)
- `generateStaticParams` runs at build time, returns all tag slugs
- Async params in Next.js 16+ require `await params` pattern
- `getTagDisplayName()` preserves original casing for title
- `notFound()` handles edge case of tag with zero articles
- Reuses `ArticleCard` component from Phase 5

### Pattern 6: Clickable Tags on Article Cards
**What:** Make tag badges on ArticleCard clickable links to tag pages
**When to use:** Modify existing ArticleCard component
**Why:** Users expect tags to be navigation elements, not decorative

**Example:**
```typescript
// components/ui/ArticleCard.tsx (MODIFICATION)
import Link from "next/link";
import { tagToSlug } from "@/lib/tags";

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="relative rounded-lg border border-gray-200 p-6 transition hover:border-gray-300 hover:bg-gray-50">
      {/* ... existing title and metadata ... */}

      {article.tags && article.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {article.tags.slice(0, 3).map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tagToSlug(tag)}`}
              className="relative z-10 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
              onClick={(e) => e.stopPropagation()} // Prevent card click
            >
              {tag}
            </Link>
          ))}
          {/* ... overflow indicator ... */}
        </div>
      )}

      {/* ... existing content preview ... */}
    </article>
  );
}
```

**Key details:**
- `z-10` and `relative` ensure tag link is above card's pseudo-element
- `e.stopPropagation()` prevents tag click from triggering card click
- `tagToSlug()` normalizes tag for URL routing
- `hover:bg-gray-200` provides visual feedback
- Keep display text as original tag (preserve casing)

### Pattern 7: Related Articles Component
**What:** Display related articles on article detail page based on tag similarity
**When to use:** Article reader page (`[category]/[slug]/page.tsx`)
**Why:** Encourages exploration of similar content

**Example:**
```typescript
// components/ui/RelatedArticles.tsx (NEW)
import type { Article } from '@/types/content';
import { ArticleCard } from './ArticleCard';

interface RelatedArticlesProps {
  articles: Article[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) {
    return null; // Don't show section if no related articles
  }

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Related Articles
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
```

**Usage in article page:**
```typescript
// app/[category]/[slug]/page.tsx (ADD)
import { getRelatedArticles } from '@/lib/tags';
import { RelatedArticles } from '@/components/ui/RelatedArticles';

export default async function ArticlePage({ params }) {
  const { category, slug } = await params;
  const articles = await fetchCategoryArticles(category);
  const article = articles.find((a) => a.slug === slug);

  if (!article) notFound();

  // Calculate related articles
  const relatedArticles = await getRelatedArticles(article, 3);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* ... existing article content ... */}

      <RelatedArticles articles={relatedArticles} />
    </div>
  );
}
```

**Key details:**
- Return `null` if no related articles (conditional rendering)
- Limit to 3 articles to avoid overwhelming user
- Reuse `ArticleCard` for consistent UI
- Related articles calculate based on current article's tags
- Place after article content, separated by visual divider

### Anti-Patterns to Avoid
- **Not normalizing tags for comparison:** "Machine Learning" ≠ "machine-learning" breaks routing
- **Mutating sorted arrays:** Next.js cache corruption - always clone first
- **Complex similarity algorithms:** Jaccard, cosine, TF-IDF are overkill for simple tag overlap
- **Client-side tag filtering:** All data available at build time - use static generation
- **Forcing related articles:** Show `null` if no tag overlap - empty sections look broken

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Set intersection | Custom nested loops to find overlaps | JavaScript Set with `[...set1].filter(x => set2.has(x))` | Native Set is O(1) lookup; custom loops are O(n²), error-prone |
| Tag normalization | One-off string replacements per use case | Centralized `tagToSlug()` utility | Consistency across routing, filtering, comparison; single source of truth |
| Unique tag extraction | Loops with manual duplicate checking | JavaScript Set for deduplication | Set automatically handles uniqueness; manual checking is verbose and bug-prone |
| URL slug encoding | Manual regex, `encodeURIComponent()` | Slug normalization function (lowercase + hyphens) | URL encoding creates ugly %20 characters; slug pattern is semantic and readable |

**Key insight:** Native JavaScript Set operations (intersection, union, deduplication) handle all tag-based use cases efficiently. Recommendation algorithms for small datasets (<1000 articles) should prioritize simplicity and interpretability over sophisticated ML approaches.

## Common Pitfalls

### Pitfall 1: Case-Sensitive Tag Matching
**What goes wrong:** Tags "TypeScript" and "typescript" create separate tag pages; users can't find all related content
**Why it happens:** String comparison is case-sensitive by default; different article authors use different casing
**How to avoid:** Normalize all tags to lowercase during slug conversion; preserve original casing for display
**Warning signs:** Duplicate tag pages with same name, incomplete article lists on tag pages

**Prevention pattern:**
```typescript
// ✅ GOOD: Normalize for comparison, preserve for display
const slug = tagToSlug(tag); // Always lowercase
const displayName = getTagDisplayName(slug); // Original casing from first match

// ❌ BAD: Direct comparison without normalization
if (article.tags.includes(searchTag)) // Breaks if casing differs
```

### Pitfall 2: Non-URL-Safe Tag Characters
**What goes wrong:** Tags with spaces, slashes, or special characters break routing or create ugly encoded URLs
**Why it happens:** Markdown frontmatter allows any string; URLs have character restrictions
**How to avoid:** Normalize tags to hyphens, remove special characters, validate slug format
**Warning signs:** URLs with `%20` or `%2F`, 404 errors on valid tag names, routing mismatches

**Prevention code:**
```typescript
// ✅ GOOD: URL-safe slug normalization
"Machine Learning" → "machine-learning"
"GPT-4/Claude" → "gpt-4-claude"
"C++" → "c"

// ❌ BAD: Direct use of tag in URL
href={`/tags/${tag}`} // Breaks with spaces or special chars
```

### Pitfall 3: Empty Related Articles Section
**What goes wrong:** "Related Articles" heading appears with no articles below it
**Why it happens:** Article has no tags or unique tags with zero overlap
**How to avoid:** Conditionally render section only if `relatedArticles.length > 0`; return `null` from component
**Warning signs:** Empty UI sections, visual layout gaps, heading without content

**Prevention pattern:**
```typescript
// ✅ GOOD: Conditional rendering
export function RelatedArticles({ articles }: Props) {
  if (articles.length === 0) return null;

  return <section>...</section>;
}

// ❌ BAD: Always showing heading
return (
  <div>
    <h2>Related Articles</h2>
    {articles.length === 0 ? <p>None found</p> : ...} // Broken UX
  </div>
);
```

### Pitfall 4: Tag Click Triggers Card Click
**What goes wrong:** Clicking a tag on ArticleCard navigates to article instead of tag page
**Why it happens:** Card uses CSS pseudo-element (`after:absolute after:inset-0`) for entire card clickability; tag is underneath
**How to avoid:** Add `z-10 relative` to tag Link, call `e.stopPropagation()` in onClick
**Warning signs:** Tags not navigating correctly, always going to article instead of tag page

**Prevention code:**
```typescript
// ✅ GOOD: Tag link above pseudo-element with propagation stop
<Link
  href={`/tags/${tagToSlug(tag)}`}
  className="relative z-10 rounded-full bg-gray-100 px-2 py-1"
  onClick={(e) => e.stopPropagation()}
>
  {tag}
</Link>

// ❌ BAD: Tag link underneath card's pseudo-element
<Link href={`/tags/${tag}`}>{tag}</Link> // Card click intercepts
```

### Pitfall 5: Mutating Sorted Articles Array
**What goes wrong:** Tag page shows stale or incorrect article order after sorting
**Why it happens:** `Array.sort()` mutates in place; Next.js caches response from `fetchAllArticles()` across requests
**How to avoid:** Always clone array before sorting: `[...articles].sort()`
**Warning signs:** "Clone before sort" pattern exists in codebase, inconsistent sort order, stale data across builds

**Prevention pattern:**
```typescript
// ✅ GOOD: Clone before sorting
const sorted = [...articles].sort((a, b) =>
  b.updated.getTime() - a.updated.getTime()
);

// ❌ BAD: Mutating cached array
articles.sort((a, b) => ...); // Corrupts Next.js cache
```

### Pitfall 6: Generating Invalid Tag Slugs
**What goes wrong:** Tag page builds successfully but returns 404 at runtime; `dynamicParams = false` rejects slug
**Why it happens:** `generateStaticParams` returns slugs that don't pass validation or normalization changes slug format
**How to avoid:** Use identical normalization in both `generateStaticParams` and page logic; test with edge-case tags
**Warning signs:** Build succeeds but runtime 404s, tags with special characters fail, inconsistent slug format

**Prevention verification:**
```typescript
// Ensure both use same normalization
export async function generateStaticParams() {
  const tags = await getAllTagSlugs(); // Uses tagToSlug()
  return tags.map((tag) => ({ tag }));
}

export default async function TagPage({ params }) {
  const { tag } = await params;
  const articles = await getArticlesByTag(tag); // Also uses tagToSlug()
  // Both paths MUST use identical normalization
}
```

### Pitfall 7: Zero Articles for Valid Tag
**What goes wrong:** Tag exists in `generateStaticParams` but page shows no articles
**Why it happens:** Tag normalization creates collisions; multiple source tags map to same slug but one has zero articles after filtering
**How to avoid:** Filter out tags with zero articles before returning from `generateStaticParams`, or handle gracefully with 404
**Warning signs:** Empty tag pages, "0 articles" message, tags that should have content show nothing

**Prevention pattern:**
```typescript
// ✅ GOOD: Validate tag has articles before generating
export async function generateStaticParams() {
  const tags = await getAllTagSlugs();

  // Filter to tags with at least 1 article
  const validTags: string[] = [];

  for (const tag of tags) {
    const articles = await getArticlesByTag(tag);
    if (articles.length > 0) {
      validTags.push(tag);
    }
  }

  return validTags.map((tag) => ({ tag }));
}

// Alternative: Handle in page with notFound()
if (articles.length === 0) {
  notFound();
}
```

## Code Examples

Verified patterns from official sources and established project conventions:

### Complete Tag Utilities Library
```typescript
// src/lib/tags.ts
import type { Article } from '@/types/content';
import { fetchAllArticles } from './content';

/**
 * Normalize tag to URL-safe slug
 * Source: URL slug best practices (lowercase, hyphens, no special chars)
 */
export function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Convert slug back to display format (spaces, lowercase)
 */
export function slugToTag(slug: string): string {
  return slug.replace(/-/g, ' ');
}

/**
 * Extract all unique tags across all articles
 */
export async function getAllTags(): Promise<string[]> {
  const articles = await fetchAllArticles();
  const tagSet = new Set<string>();

  for (const article of articles) {
    if (article.tags && article.tags.length > 0) {
      for (const tag of article.tags) {
        tagSet.add(tag);
      }
    }
  }

  return Array.from(tagSet);
}

/**
 * Get all unique tag slugs for generateStaticParams
 */
export async function getAllTagSlugs(): Promise<string[]> {
  const tags = await getAllTags();
  const slugSet = new Set(tags.map(tagToSlug));
  return Array.from(slugSet);
}

/**
 * Get display name for tag from slug (preserves original casing)
 */
export async function getTagDisplayName(slug: string): Promise<string | null> {
  const articles = await fetchAllArticles();

  for (const article of articles) {
    if (article.tags) {
      for (const tag of article.tags) {
        if (tagToSlug(tag) === slug) {
          return tag;
        }
      }
    }
  }

  return null;
}

/**
 * Find all articles with a specific tag (normalized matching)
 */
export async function getArticlesByTag(slug: string): Promise<Article[]> {
  const articles = await fetchAllArticles();

  const matching = articles.filter((article) => {
    if (!article.tags || article.tags.length === 0) return false;
    return article.tags.some((tag) => tagToSlug(tag) === slug);
  });

  // Clone before sorting to avoid mutating cache
  const sorted = [...matching].sort((a, b) =>
    b.updated.getTime() - a.updated.getTime()
  );

  return sorted;
}

/**
 * Calculate tag overlap between two articles using Set intersection
 * Source: MDN Set.prototype.has() for O(1) lookup
 */
function calculateTagOverlap(article1: Article, article2: Article): number {
  if (!article1.tags || !article2.tags) return 0;

  const tags1 = new Set(article1.tags.map(tagToSlug));
  const tags2 = new Set(article2.tags.map(tagToSlug));

  const intersection = [...tags1].filter(tag => tags2.has(tag));
  return intersection.length;
}

/**
 * Find related articles based on tag similarity
 * Source: Tag-based recommendation pattern (simple overlap scoring)
 */
export async function getRelatedArticles(
  currentArticle: Article,
  limit: number = 3
): Promise<Article[]> {
  const allArticles = await fetchAllArticles();

  const candidates = allArticles.filter(
    (article) =>
      article.slug !== currentArticle.slug &&
      article.tags &&
      article.tags.length > 0
  );

  const scored = candidates.map((article) => ({
    article,
    overlap: calculateTagOverlap(currentArticle, article),
  }));

  const related = scored
    .filter((item) => item.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map((item) => item.article);

  return related;
}
```

### Dynamic Tag Page with Static Generation
```typescript
// app/tags/[tag]/page.tsx
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllTagSlugs, getArticlesByTag, getTagDisplayName } from '@/lib/tags';
import { ArticleCard } from '@/components/ui/ArticleCard';

export const dynamicParams = false;

export async function generateStaticParams() {
  const tags = await getAllTagSlugs();
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const displayName = await getTagDisplayName(tag);

  if (!displayName) {
    return { title: 'Tag Not Found | Ryder.AI' };
  }

  return {
    title: `${displayName} Articles | Ryder.AI`,
    description: `Browse all articles tagged with ${displayName}`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const articles = await getArticlesByTag(tag);
  const displayName = await getTagDisplayName(tag);

  if (!displayName || articles.length === 0) {
    notFound();
  }

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
          {displayName}
        </h1>
        <p className="text-sm text-gray-600">
          {articles.length} {articles.length === 1 ? 'article' : 'articles'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  );
}
```

### Related Articles Component
```typescript
// components/ui/RelatedArticles.tsx
import type { Article } from '@/types/content';
import { ArticleCard } from './ArticleCard';

interface RelatedArticlesProps {
  articles: Article[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Related Articles
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
```

### Modified ArticleCard with Clickable Tags
```typescript
// components/ui/ArticleCard.tsx (MODIFICATION)
import Link from "next/link";
import type { Article } from "@/types/content";
import { StatusBadge } from "./StatusBadge";
import { tagToSlug } from "@/lib/tags";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="relative rounded-lg border border-gray-200 p-6 transition hover:border-gray-300 hover:bg-gray-50">
      <h2 className="mb-2 text-lg font-semibold text-gray-900">
        <Link
          href={`/${article.category}/${article.slug}`}
          className="after:absolute after:inset-0"
        >
          {article.title}
        </Link>
      </h2>

      <div className="mb-3 flex items-center gap-3">
        <StatusBadge status={article.status} />
        <time
          dateTime={article.updated.toISOString()}
          className="text-sm text-gray-500"
        >
          {article.updated.toLocaleDateString()}
        </time>
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {article.tags.slice(0, 3).map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tagToSlug(tag)}`}
              className="relative z-10 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {tag}
            </Link>
          ))}
          {article.tags.length > 3 && (
            <span className="text-xs text-gray-400">
              +{article.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      <p className="line-clamp-2 text-sm text-gray-600">
        {article.content?.trim()
          ? article.content.slice(0, 300)
          : "No preview available"}
      </p>
    </article>
  );
}
```

### Article Page with Related Articles
```typescript
// app/[category]/[slug]/page.tsx (ADD RelatedArticles)
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchAllArticles, fetchCategoryArticles } from "@/lib/content";
import { getRelatedArticles } from "@/lib/tags";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { ArticleMetadata } from "@/components/ui/ArticleMetadata";
import { RelatedArticles } from "@/components/ui/RelatedArticles";

export const dynamicParams = false;

export async function generateStaticParams() {
  const articles = await fetchAllArticles();
  return articles.map((article) => ({
    category: article.category,
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const articles = await fetchCategoryArticles(category);
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return { title: "Not Found | Ryder.AI" };
  }

  const description = article.content.slice(0, 155).trim();

  return {
    title: `${article.title} | Ryder.AI`,
    description,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const articles = await fetchCategoryArticles(category);
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const capitalizedCategory =
    category.charAt(0).toUpperCase() + category.slice(1);

  // Calculate related articles based on tag overlap
  const relatedArticles = await getRelatedArticles(article, 3);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <Link
          href={`/${category}`}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to {capitalizedCategory}
        </Link>
      </div>

      <article>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900">
          {article.title}
        </h1>

        <ArticleMetadata article={article} />

        <div className="prose prose-gray prose-sm md:prose-base lg:prose-lg max-w-none">
          <MDXRemote
            source={article.content}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  [
                    rehypePrettyCode,
                    { theme: "github-dark-dimmed", keepBackground: true },
                  ],
                ],
              },
            }}
          />
        </div>
      </article>

      {/* Add related articles section */}
      <RelatedArticles articles={relatedArticles} />
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Array loops for uniqueness | JavaScript Set for deduplication | ES6 (2015) | O(1) add/lookup vs O(n), cleaner syntax |
| Nested loops for intersection | Set with `.filter(x => set.has(x))` | ES6 Set methods (2015) | O(n) vs O(n²), readable set theory syntax |
| encodeURIComponent for slugs | Lowercase + hyphen normalization | URL best practices (ongoing) | Readable URLs, no %20 encoding, SEO-friendly |
| Complex ML for recommendations | Simple tag overlap scoring | Simplicity preference (current) | Interpretable results, zero dependencies, fast builds |
| Manual URL parameter parsing | Next.js dynamic routes `[tag]` | Next.js App Router (2022) | Type-safe, automatic routing, static generation |

**Deprecated/outdated:**
- **Lodash/Underscore for set operations**: Native Set has identical functionality, zero bundle cost
- **Complex similarity algorithms for small datasets**: Jaccard, cosine, TF-IDF overkill for <1000 articles
- **Client-side tag filtering**: All data available at build time, use static generation instead
- **Pages Router dynamic routes**: Use App Router `[tag]` pattern with `generateStaticParams`

## Open Questions

1. **Should we show tag counts on tag badges?**
   - What we know: ArticleCard shows tags as badges; tag pages show article counts
   - What's unclear: Whether showing "(12)" next to each tag improves UX or clutters UI
   - Recommendation: Start without counts on badges (cleaner UI), consider adding to dedicated tag index page in future

2. **Should we create a tag index/directory page?**
   - What we know: Pattern exists at `/tags/[tag]` for individual tags
   - What's unclear: Whether users benefit from `/tags` index showing all tags with counts
   - Recommendation: Defer to Phase 8 (Design Polish) - not required for MVP, but good enhancement

3. **How many related articles should we show?**
   - What we know: Standard patterns use 3-5 related items; too many overwhelms, too few limits discovery
   - What's unclear: Optimal number for article-length content
   - Recommendation: Default to 3, make configurable via parameter, monitor user engagement in analytics

4. **Should we show related articles if overlap is low (1 shared tag)?**
   - What we know: Filter includes `overlap > 0`, so 1 shared tag qualifies
   - What's unclear: Whether 1 shared tag provides meaningful relationship or is too loose
   - Recommendation: Start with `overlap > 0`, consider increasing to `overlap >= 2` if results feel unrelated

## Sources

### Primary (HIGH confidence)
- [Next.js: generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) - Dynamic route static generation pattern
- [Next.js: Dynamic Routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) - `[tag]` syntax and behavior
- [Next.js: Route Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config) - `dynamicParams` configuration
- [MDN: Set.prototype.has()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/has) - O(1) lookup for intersection
- [MDN: Set.prototype.intersection()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/intersection) - Native set intersection (ES2024+)
- [Google Search Central: URL Structure Best Practices](https://developers.google.com/search/docs/crawling-indexing/url-structure) - Slug normalization guidance

### Secondary (MEDIUM confidence)
- [Creating Dynamic Tag Pages With NextJS Nested Routes](https://bionicjulia.com/blog/creating-dynamic-tag-page-nextjs-nested-routes) - Tag extraction pattern with Set
- [URL Slug Best Practices (Netpeak)](https://netpeak.us/blog/what-is-a-url-slug-and-how-do-you-make-it-seo-friendly/) - Lowercase, hyphens, no special chars
- [What is Jaccard Similarity? (IBM)](https://www.ibm.com/think/topics/jaccard-similarity) - Set-based similarity measure for tags
- [Personalized Recommendation System Based on Social Tags](https://www.degruyterbrill.com/document/doi/10.1515/jisys-2022-0053/html?lang=en) - Tag-based recommendation algorithms
- [Building a Recommendation Engine (Toptal)](https://www.toptal.com/developers/algorithms/predicting-likes-inside-a-simple-recommendation-engine) - Simple overlap scoring approach
- [Set Operations in JavaScript (30 seconds of code)](https://www.30secondsofcode.org/js/s/array-set-operations/) - Native set operation patterns

### Tertiary (LOW confidence - community patterns, needs validation)
- [Next.js Optional Catch-All Routes (GeeksforGeeks)](https://www.geeksforgeeks.org/nextjs/next-js-optional-catch-all-routes/) - `[[...tag]]` pattern (not needed for this phase)
- Various WebSearch results on tag-based filtering - general concepts, not specific implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Native JavaScript Set, Next.js patterns verified from official docs
- Architecture: HIGH - Patterns verified from Next.js API reference and established project conventions
- Tag normalization: HIGH - URL slug best practices from Google, SEO guides, verified community patterns
- Related articles algorithm: MEDIUM - Simple overlap scoring is established pattern, but optimal threshold is heuristic
- Edge cases: MEDIUM - Case sensitivity, special characters, empty states identified from common pitfall analysis

**Research date:** 2026-02-15
**Valid until:** ~30 days (stable patterns, but Next.js ecosystem evolves - re-verify if Next.js 17 releases)
