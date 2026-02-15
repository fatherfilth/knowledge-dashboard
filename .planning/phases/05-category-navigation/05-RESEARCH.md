# Phase 5: Category Navigation - Research

**Researched:** 2026-02-15
**Domain:** Card-Based Navigation, Content Preview, and Responsive Grid Layouts in Next.js App Router
**Confidence:** HIGH

## Summary

Phase 5 builds card-based navigation for browsing categories and articles. The homepage already displays category cards with article counts (from Phase 3), and the category page shows basic article links. This phase enhances the category page with rich article cards that display title, status badge, metadata, tags, and a content preview—creating a browsable catalog interface.

The technical domain centers on three key areas: (1) responsive grid layouts using Tailwind CSS's built-in grid utilities with mobile-first breakpoints, (2) accessible clickable card patterns using CSS pseudo-elements to expand hit areas without wrapping entire cards in links, and (3) content preview generation using character-based truncation or CSS line-clamp utilities for multi-line text.

Next.js Link components support standard HTML attributes like className, making them compatible with Tailwind's card styling patterns. The existing data layer already provides all required article metadata (title, status, dates, tags, content). Sorting by updated date uses JavaScript's built-in array sort with Date comparison—no library needed. StatusBadge and ArticleMetadata components from Phase 4 can be reused directly in card layouts.

**Primary recommendation:** Use Tailwind's grid utilities (grid-cols-1 md:grid-cols-2) for responsive card layouts, implement accessible clickable cards with Link components and ::after pseudo-element expansion, and use line-clamp-3 for content previews with automatic ellipsis.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router, Link component, static generation | Already in use; Link component provides prefetching and client-side navigation |
| Tailwind CSS | 4.x | Grid layouts, card styling, responsive design | Already in use; built-in grid and line-clamp utilities eliminate need for additional libraries |
| TypeScript | 5.x | Type safety for sorting and card props | Already in use; prevents runtime errors in data mapping |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None required | - | All functionality uses existing stack | - |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind grid utilities | CSS Grid directly | Tailwind provides mobile-first responsive patterns with breakpoint prefixes; raw CSS requires more boilerplate |
| Character-based truncation | Strip markdown to plaintext first | Markdown stripping adds complexity; character-based truncation with line-clamp handles formatting naturally |
| JavaScript sort | lodash sortBy | Built-in Array.sort with Date comparison is sufficient; no dependency needed |
| CSS pseudo-element clickable area | Wrapping entire card in Link | Full-wrap breaks accessibility (screen readers read entire card as link text); pseudo-element preserves semantic structure |

**Installation:**
```bash
# No new dependencies required - all functionality uses existing Next.js + Tailwind stack
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── page.tsx                           # Homepage (already exists - category grid)
│   └── [category]/
│       ├── page.tsx                       # Category page - UPDATE with article cards
│       └── [slug]/
│           └── page.tsx                   # Article page (already exists)
├── components/
│   └── ui/
│       ├── StatusBadge.tsx                # Status badge (already exists)
│       ├── ArticleMetadata.tsx            # Metadata display (already exists)
│       └── ArticleCard.tsx                # NEW - Card component for article listings
└── lib/
    └── content.ts                         # Data fetching (already exists)
```

### Pattern 1: Responsive Card Grid Layout
**What:** Mobile-first grid that scales from 1 column on mobile to 2+ columns on larger screens using Tailwind's grid utilities.
**When to use:** Category page article listings, any card-based content display.
**Example:**
```typescript
// Source: https://tailwindcss.com/docs/grid-template-columns
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {articles.map((article) => (
    <ArticleCard key={article.slug} article={article} />
  ))}
</div>
```

**Alternative layouts:**
```typescript
// 3-column on large screens
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Equal-width columns with minimum size (auto-fit pattern)
<div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
```

### Pattern 2: Accessible Clickable Card with Pseudo-Element
**What:** Make entire card area clickable while preserving semantic HTML structure and accessibility using CSS ::after pseudo-element expansion.
**When to use:** Article cards, category cards, any clickable card component.
**Example:**
```typescript
// Source: https://kittygiraudel.com/2022/04/02/accessible-cards/
export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="relative rounded-lg border border-gray-200 p-6 transition hover:border-gray-300 hover:bg-gray-50">
      <h2 className="mb-2 text-xl font-semibold">
        <Link
          href={`/${article.category}/${article.slug}`}
          className="after:absolute after:inset-0"
        >
          {article.title}
        </Link>
      </h2>

      <div className="mb-3 flex items-center gap-2">
        <StatusBadge status={article.status} />
        <time className="text-sm text-gray-600">
          {article.updated.toLocaleDateString()}
        </time>
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {article.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="line-clamp-3 text-sm text-gray-600">
        {article.content.slice(0, 200)}
      </p>
    </article>
  );
}
```

**Why this pattern:**
- `relative` on card establishes positioning context
- `after:absolute after:inset-0` on Link creates pseudo-element covering entire card
- Link text remains semantic for screen readers ("Article Title" not entire card content)
- Hover/focus states work naturally on the expanded hit area
- Other interactive elements (if added) can use `relative z-10` to sit above pseudo-element

### Pattern 3: Content Preview with line-clamp
**What:** Display multi-line text preview with automatic ellipsis using Tailwind's built-in line-clamp utility.
**When to use:** Article card descriptions, any truncated text display.
**Example:**
```typescript
// Source: https://tailwindcss.com/docs/line-clamp
// 3-line preview with ellipsis
<p className="line-clamp-3 text-sm text-gray-600">
  {article.content.slice(0, 250)}
</p>

// Responsive: 2 lines on mobile, 3 on desktop
<p className="line-clamp-2 md:line-clamp-3 text-sm text-gray-600">
  {article.content.slice(0, 250)}
</p>

// No clamp on large screens (show full preview)
<p className="line-clamp-3 lg:line-clamp-none text-sm text-gray-600">
  {article.content.slice(0, 250)}
</p>
```

**CSS output:**
```css
.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
```

### Pattern 4: Sorting Articles by Date
**What:** Sort array of articles by updated date in descending order (most recent first) using JavaScript's built-in Array.sort.
**When to use:** Category pages, search results, any date-sorted lists.
**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
// app/[category]/page.tsx
export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const articles = await fetchCategoryArticles(category);

  // Sort by updated date, most recent first
  const sortedArticles = articles.sort((a, b) =>
    b.updated.getTime() - a.updated.getTime()
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sortedArticles.map((article) => (
        <ArticleCard key={article.slug} article={article} />
      ))}
    </div>
  );
}
```

**Performance note:** For better performance with Date objects, use `.getTime()` method to compare timestamps directly rather than subtracting Date objects. This avoids object coercion overhead in the sort comparator.

### Pattern 5: Reusing Existing Components in Cards
**What:** Compose article cards from existing StatusBadge and metadata display patterns from Phase 4.
**When to use:** Article cards that need status and date information.
**Example:**
```typescript
// Reuse StatusBadge from Phase 4
import { StatusBadge } from '@/components/ui/StatusBadge';

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="relative rounded-lg border border-gray-200 p-6">
      <h2 className="mb-2 text-xl font-semibold">
        <Link href={`/${article.category}/${article.slug}`} className="after:absolute after:inset-0">
          {article.title}
        </Link>
      </h2>

      {/* Reuse existing StatusBadge component */}
      <div className="mb-3 flex items-center gap-2">
        <StatusBadge status={article.status} />
        <time className="text-sm text-gray-600" dateTime={article.updated.toISOString()}>
          {article.updated.toLocaleDateString()}
        </time>
      </div>

      {/* Preview content */}
      <p className="line-clamp-3 text-sm text-gray-600">
        {article.content.slice(0, 200)}
      </p>
    </article>
  );
}
```

### Anti-Patterns to Avoid
- **Wrapping entire card in Link:** Breaks accessibility—screen readers announce entire card content as link text instead of just the title.
- **Using onClick on card container:** Prevents right-click to open in new tab, breaks keyboard navigation, and adds unnecessary JavaScript.
- **Not sorting arrays in place:** Creating new arrays with `.slice().sort()` adds memory overhead; sort mutates in place safely in server components.
- **Hardcoding grid columns:** Use responsive utilities (md:grid-cols-2) instead of fixed columns; mobile-first design requires 1 column on small screens.
- **Truncating content without ellipsis indicator:** Users need visual feedback that content is truncated; line-clamp provides this automatically.
- **Not using semantic HTML:** Cards should use `<article>` elements, dates should use `<time>` with `dateTime` attribute.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-line text truncation | JavaScript character counting with manual ellipsis | Tailwind line-clamp utility | Handles line height variations, font sizing, and automatically adds ellipsis; CSS-based solution is more performant |
| Responsive grid breakpoints | Custom media queries and grid template columns | Tailwind grid-cols with breakpoint prefixes | Mobile-first pattern built-in; handles all breakpoints consistently; easier to maintain |
| Clickable card area expansion | JavaScript click handlers on card containers | CSS ::after pseudo-element with absolute positioning | Preserves native link behavior (right-click, keyboard nav); better accessibility; zero JavaScript |
| Date formatting and sorting | Custom date comparison logic | Built-in Date.getTime() and Array.sort | Handles timezone conversion, DST changes, and cross-browser compatibility automatically |
| Content preview generation | Markdown-to-plaintext parser | Character-based slicing with line-clamp | MDX content may have nested components; character slicing is simpler and line-clamp handles display |

**Key insight:** Card-based layouts are a solved problem in modern CSS. Tailwind's grid utilities provide responsive patterns out of the box, line-clamp handles text truncation, and CSS pseudo-elements solve clickable area expansion without accessibility compromises. Adding libraries or custom code adds complexity without benefit.

## Common Pitfalls

### Pitfall 1: Not Limiting Tag Display Count
**What goes wrong:** Cards display all tags, causing layout inconsistency when some articles have many tags.
**Why it happens:** Articles may have 10+ tags in frontmatter; displaying all breaks card grid alignment.
**How to avoid:** Slice tags array to show maximum 3-4 tags in card preview:
```typescript
{article.tags && article.tags.length > 0 && (
  <div className="mb-3 flex flex-wrap gap-2">
    {article.tags.slice(0, 3).map((tag) => (
      <span key={tag} className="text-xs">{tag}</span>
    ))}
    {article.tags.length > 3 && (
      <span className="text-xs text-gray-500">+{article.tags.length - 3}</span>
    )}
  </div>
)}
```
**Warning signs:** Cards with different heights in grid, horizontal scrolling on mobile from long tag lists.

### Pitfall 2: Mutating Fetched Data with In-Place Sort
**What goes wrong:** Sorting articles with `.sort()` mutates the original array, potentially causing issues if data is cached.
**Why it happens:** Array.sort modifies the array in place; Next.js may cache fetch results between requests.
**How to avoid:** Clone array before sorting, or sort directly in component without worrying about mutation (server components re-fetch each time):
```typescript
// SAFE in Server Components (data re-fetched each render)
const sortedArticles = articles.sort((a, b) => b.updated.getTime() - a.updated.getTime());

// SAFER if concerned about caching
const sortedArticles = [...articles].sort((a, b) => b.updated.getTime() - a.updated.getTime());
```
**Warning signs:** Inconsistent sort order across page refreshes, data appearing in different orders.

### Pitfall 3: Forgetting Semantic HTML for SEO
**What goes wrong:** Using `<div>` for cards instead of `<article>`, missing `dateTime` on `<time>` elements.
**Why it happens:** Generic div soup is common in React; semantic HTML gets overlooked.
**How to avoid:** Use proper semantic elements:
```typescript
// ❌ WRONG
<div className="card">
  <h3>{article.title}</h3>
  <span>{article.updated.toLocaleDateString()}</span>
</div>

// ✅ CORRECT
<article className="card">
  <h2>{article.title}</h2>
  <time dateTime={article.updated.toISOString()}>
    {article.updated.toLocaleDateString()}
  </time>
</article>
```
**Warning signs:** Poor SEO performance, accessibility audit failures, screen reader navigation issues.

### Pitfall 4: Grid Gap Causing Horizontal Scroll on Mobile
**What goes wrong:** Using large gap values (gap-8, gap-12) causes horizontal overflow on small screens with tight padding.
**Why it happens:** Container padding + gap + border widths exceed viewport width.
**How to avoid:** Use smaller gaps on mobile, increase on larger screens:
```typescript
// ❌ WRONG (may overflow mobile)
<div className="grid grid-cols-1 gap-8 px-6">

// ✅ CORRECT (mobile-friendly)
<div className="grid grid-cols-1 gap-4 md:gap-6 px-4 md:px-6">
```
**Warning signs:** Horizontal scrollbar on mobile, cards extending beyond viewport edge.

### Pitfall 5: Not Handling Empty Content Gracefully
**What goes wrong:** Content preview shows empty string or error when article.content is missing/empty.
**Why it happens:** External GitHub repo may have articles with missing content or frontmatter-only files.
**How to avoid:** Add fallback for empty content:
```typescript
<p className="line-clamp-3 text-sm text-gray-600">
  {article.content && article.content.trim()
    ? article.content.slice(0, 200)
    : 'No preview available'}
</p>
```
**Warning signs:** Empty card sections, layout shift when some cards have no preview.

### Pitfall 6: Character Slice Breaking on Multi-Byte Characters
**What goes wrong:** Slicing content at fixed character count (e.g., 200) may cut through multi-byte Unicode characters (emoji, non-Latin scripts).
**Why it happens:** String.slice counts code units, not grapheme clusters; emoji and some scripts use multiple code units.
**How to avoid:** Use conservative slice length and let line-clamp handle visual truncation:
```typescript
// ❌ RISKY (may break emoji/Unicode)
<p className="line-clamp-3">{article.content.slice(0, 100)}</p>

// ✅ SAFER (larger buffer, line-clamp handles display)
<p className="line-clamp-3">{article.content.slice(0, 300)}</p>
```
**Warning signs:** Broken emoji in previews, mojibake (garbled text) on card previews.

## Code Examples

Verified patterns from official sources:

### Complete Article Card Component
```typescript
// Source: Composite pattern from Tailwind CSS grid docs + accessible card pattern
// components/ui/ArticleCard.tsx
import Link from 'next/link';
import { StatusBadge } from './StatusBadge';
import type { Article } from '@/types/content';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="relative rounded-lg border border-gray-200 p-6 transition hover:border-gray-300 hover:bg-gray-50">
      {/* Title with expanded clickable area */}
      <h2 className="mb-2 text-xl font-semibold text-gray-900">
        <Link
          href={`/${article.category}/${article.slug}`}
          className="after:absolute after:inset-0"
        >
          {article.title}
        </Link>
      </h2>

      {/* Status badge and date */}
      <div className="mb-3 flex items-center gap-3">
        <StatusBadge status={article.status} />
        <time
          className="text-sm text-gray-600"
          dateTime={article.updated.toISOString()}
        >
          {article.updated.toLocaleDateString()}
        </time>
      </div>

      {/* Tags (limited to 3) */}
      {article.tags && article.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {article.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
            >
              {tag}
            </span>
          ))}
          {article.tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{article.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Content preview with line clamp */}
      <p className="line-clamp-3 text-sm text-gray-600">
        {article.content?.trim() || 'No preview available'}
      </p>
    </article>
  );
}
```

### Updated Category Page with Card Grid
```typescript
// Source: Next.js App Router patterns + Tailwind grid utilities
// app/[category]/page.tsx
import Link from 'next/link';
import { CATEGORIES } from '@/types/content';
import { fetchCategoryArticles } from '@/lib/content';
import { ArticleCard } from '@/components/ui/ArticleCard';

export const dynamicParams = false;

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);

  return {
    title: `${capitalizedCategory} | Ryder.AI`,
    description: `Browse ${category} articles on Ryder.AI`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const articles = await fetchCategoryArticles(category);

  // Sort by updated date, most recent first
  const sortedArticles = articles.sort((a, b) =>
    b.updated.getTime() - a.updated.getTime()
  );

  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Category header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900">
          {capitalizedCategory}
        </h1>
        <p className="text-lg text-gray-600">
          {sortedArticles.length === 0
            ? 'No articles in this category yet'
            : `${sortedArticles.length} ${sortedArticles.length === 1 ? 'article' : 'articles'}`}
        </p>
      </div>

      {/* Article cards grid */}
      {sortedArticles.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {sortedArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Alternative: Homepage Category Grid Enhancement
```typescript
// Source: Existing homepage pattern extended with better styling
// app/page.tsx (optional enhancement)
import Link from "next/link";
import { fetchCategories } from "@/lib/content";

export default async function Home() {
  const categories = await fetchCategories();

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <main className="flex w-full max-w-5xl flex-col items-center space-y-12 py-24 text-center">
        <div className="space-y-6">
          <h1 className="text-7xl font-bold tracking-tight text-gray-900">
            Ryder.AI
          </h1>
          <p className="max-w-2xl text-2xl text-gray-600">
            Curated AI documentation and resources for focused learning
          </p>
        </div>

        <div className="h-px w-full max-w-md bg-gray-200" />

        {/* Responsive grid: 2 cols on mobile/tablet, 3 on large screens */}
        <div className="grid w-full max-w-4xl grid-cols-2 gap-4 lg:grid-cols-3">
          {categories.map((category) => {
            const capitalizedName =
              category.name.charAt(0).toUpperCase() + category.name.slice(1);

            return (
              <Link
                key={category.name}
                href={`/${category.name}`}
                className="group relative rounded-lg border border-gray-200 p-6 transition hover:border-gray-300 hover:bg-gray-50"
              >
                <h2 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-gray-700">
                  {capitalizedName}
                </h2>
                <p className="text-sm text-gray-600">
                  {category.count} {category.count === 1 ? "article" : "articles"}
                </p>
              </Link>
            );
          })}
        </div>

        <footer className="text-sm text-gray-500">
          Building knowledge foundations, one article at a time
        </footer>
      </main>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @tailwindcss/line-clamp plugin | Built-in line-clamp utility | Tailwind CSS v3.3 (2023) | No plugin installation needed; cleaner dependency tree |
| Custom grid with media queries | Tailwind grid-cols with breakpoint prefixes | Tailwind CSS v2+ | Mobile-first responsive grids with minimal code |
| JavaScript click handlers on cards | CSS ::after pseudo-element expansion | 2020+ (Inclusive Components pattern) | Better accessibility, native link behavior, zero JavaScript |
| CSS Grid polyfills | Native CSS Grid support | 2017+ (98%+ browser support) | No polyfills needed; Grid is standard |
| Server-side date formatting | Client-side toLocaleDateString() | Next.js 13+ RSC | Simpler code; browser handles locale automatically |

**Deprecated/outdated:**
- **@tailwindcss/line-clamp plugin:** Built into Tailwind CSS 4.x; remove from dependencies if present
- **onClick handlers on card wrappers:** Use CSS pseudo-element pattern for accessibility
- **JavaScript-based text truncation:** Use CSS line-clamp utility instead
- **Fixed grid columns without responsive breakpoints:** Always use mobile-first grid-cols-1 as base

## Open Questions

1. **Should cards show author information in preview?**
   - What we know: Article schema includes author field; ArticleMetadata component displays it
   - What's unclear: Whether author is important for discovery vs. full article view
   - Recommendation: Include if author exists and space permits; can omit if design feels cluttered

2. **Do we need pagination for categories with many articles?**
   - What we know: All data is fetched at build time; static generation handles entire list
   - What's unclear: Whether any category will have 50+ articles making long pages unwieldy
   - Recommendation: Defer to Phase 6 (Polish); static sites commonly display full lists without pagination

3. **Should we add a search/filter feature?**
   - What we know: Not in Phase 5 requirements; would require client-side state or search index
   - What's unclear: Whether users need search beyond browsing categories
   - Recommendation: Defer to future phase; Phase 5 focuses on browsable navigation

4. **Do we need a "Load more" pattern for long lists?**
   - What we know: Static generation renders full page; "load more" would require client-side JavaScript
   - What's unclear: Whether performance degrades with 30+ cards on a page
   - Recommendation: Start with full list display; monitor performance and add progressive loading only if needed

## Sources

### Primary (HIGH confidence)
- [Next.js Link Component Documentation](https://nextjs.org/docs/app/api-reference/components/link) - Official Next.js 16.1.6 docs for Link component (last updated 2026-02-11)
- [Tailwind CSS Grid Template Columns](https://tailwindcss.com/docs/grid-template-columns) - Official Tailwind CSS grid utilities documentation
- [Tailwind CSS Line Clamp](https://tailwindcss.com/docs/line-clamp) - Official Tailwind CSS line-clamp utility documentation
- [MDN Array.prototype.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) - Standard JavaScript array sorting

### Secondary (MEDIUM confidence)
- [Accessible Cards by Kitty Giraudel](https://kittygiraudel.com/2022/04/02/accessible-cards/) - Accessibility best practices for clickable card components
- [Accessible Card Component with Pseudo-Content Trick](https://www.damianwajer.com/blog/accessible-card-component/) - CSS pseudo-element pattern for expandable hit areas
- [How to Build Accessible Cards – Block Links](https://www.nomensa.com/blog/how-build-accessible-cards-block-links/) - Accessibility patterns for card navigation
- [Tailwind CSS Responsive Grid Layouts](https://thelinuxcode.com/tailwind-css-grid-template-columns-practical-patterns-for-2026-layouts/) - Practical responsive grid patterns
- [CSS -webkit-line-clamp Practical Patterns](https://thelinuxcode.com/css-webkit-line-clamp-practical-multiline-truncation-patterns-for-2026/) - Multi-line text truncation patterns

### Tertiary (LOW confidence - verified patterns)
- [Sort Array by Date in TypeScript](https://pipinghot.dev/sort-an-array-by-date-in-typescript/) - Date sorting performance comparison
- [JavaScript Sort Dates Efficiently](https://www.freecodecamp.org/news/how-to-sort-dates-efficiently-in-javascript/) - Best practices for date comparison

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All functionality uses existing Next.js + Tailwind stack; official docs verified
- Architecture: HIGH - Official Next.js and Tailwind docs provide clear patterns; accessible card pattern verified from multiple authoritative sources
- Pitfalls: HIGH - Based on official documentation, common responsive design issues, and verified accessibility patterns

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days - stable patterns, mature ecosystem)
