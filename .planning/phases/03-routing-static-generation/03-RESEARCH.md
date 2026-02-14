# Phase 3: Routing & Static Generation - Research

**Researched:** 2026-02-15
**Domain:** Next.js App Router Static Site Generation (SSG) with Dynamic Routes
**Confidence:** HIGH

## Summary

Next.js 16 App Router provides built-in static site generation (SSG) through the `generateStaticParams` function, which pre-renders dynamic routes at build time. This phase requires implementing three route patterns: homepage (`/`), category pages (`/[category]`), and article pages (`/[category]/[slug]`).

The critical insight is that `params` in Next.js 16 is now a **Promise** that must be awaited—this is a breaking change from Next.js 14. The build process statically generates HTML files for all routes returned by `generateStaticParams`, ensuring fast page loads without runtime API calls to GitHub.

Key architectural decisions: use nested dynamic segments (`[category]/[slug]`), implement `generateStaticParams` at both route levels, add `notFound()` handling for invalid slugs, and leverage existing content fetching infrastructure from Phase 2.

**Primary recommendation:** Implement `generateStaticParams` with full param lists (not partial/empty arrays) and use `dynamicParams = false` to ensure only valid routes exist.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router SSG framework | Built-in static generation, file-based routing, official React framework |
| React | 19.2.3 | Server Components | Required by Next.js 16, Server Components are default |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| gray-matter | ^4.0.3 | Frontmatter parsing | Already used in Phase 2 content pipeline |
| zod | ^4.3.6 | Schema validation | Already used in Phase 2 for frontmatter validation |
| Octokit | ^5.0.5 | GitHub API client | Already used in Phase 2 for content fetching |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| App Router | Pages Router | Pages Router is legacy; App Router is Next.js future |
| Static Generation | ISR/SSR | Static is fastest; no runtime API calls needed for docs |
| `generateStaticParams` | `getStaticPaths` | `getStaticPaths` is Pages Router only |

**Installation:**
No new packages required—all dependencies already installed in Phase 2.

## Architecture Patterns

### Recommended Project Structure
```
src/app/
├── layout.tsx                    # Root layout (already exists)
├── page.tsx                      # Homepage (already exists)
├── not-found.tsx                 # Global 404 page
├── [category]/
│   ├── page.tsx                  # Category listing page
│   ├── not-found.tsx             # Category-specific 404
│   └── [slug]/
│       ├── page.tsx              # Article detail page
│       └── not-found.tsx         # Article-specific 404
```

### Pattern 1: Nested Dynamic Segments with generateStaticParams
**What:** Pre-render all category and article routes at build time using `generateStaticParams` at each dynamic segment level.
**When to use:** When all routes can be known at build time (like documentation sites).
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
// app/[category]/page.tsx
export async function generateStaticParams() {
  // Return all 6 categories
  return [
    { category: 'models' },
    { category: 'tools' },
    { category: 'skills' },
    { category: 'repos' },
    { category: 'agents' },
    { category: 'projects' },
  ]
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params  // CRITICAL: params is now a Promise in Next.js 16
  // Fetch articles for this category
}
```

```typescript
// app/[category]/[slug]/page.tsx
export async function generateStaticParams() {
  // Fetch all articles from all categories
  const allArticles = await fetchAllArticles()

  return allArticles.map((article) => ({
    category: article.category,
    slug: article.slug,
  }))
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const { category, slug } = await params  // CRITICAL: must await
  // Fetch and render article
}
```

### Pattern 2: Using Existing Content Pipeline
**What:** Leverage `fetchAllArticles()` and `fetchCategoryArticles()` from Phase 2 instead of re-implementing data fetching.
**When to use:** In `generateStaticParams` and page components.
**Example:**
```typescript
// Source: Verified in existing codebase src/lib/content.ts
import { fetchAllArticles, fetchCategoryArticles } from "@/lib/content"

export async function generateStaticParams() {
  const articles = await fetchAllArticles()
  return articles.map((article) => ({
    category: article.category,
    slug: article.slug,
  }))
}
```

### Pattern 3: 404 Handling with notFound()
**What:** Use Next.js `notFound()` function to return 404 when content doesn't exist.
**When to use:** When validating dynamic route params against actual data.
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/not-found
import { notFound } from "next/navigation"
import { fetchCategoryArticles } from "@/lib/content"

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const { category, slug } = await params

  const articles = await fetchCategoryArticles(category)
  const article = articles.find((a) => a.slug === slug)

  if (!article) {
    notFound()  // Triggers not-found.tsx rendering
  }

  return <article>{article.content}</article>
}
```

### Pattern 4: Dynamic Metadata Generation
**What:** Generate SEO metadata dynamically based on route params and fetched content.
**When to use:** For all dynamic pages to improve SEO.
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}): Promise<Metadata> {
  const { category, slug } = await params

  const articles = await fetchCategoryArticles(category)
  const article = articles.find((a) => a.slug === slug)

  if (!article) {
    return {
      title: "Not Found",
    }
  }

  return {
    title: `${article.title} | Ryder.AI`,
    description: article.content.slice(0, 160),  // SEO: 50-160 chars recommended
  }
}
```

### Anti-Patterns to Avoid
- **Empty generateStaticParams arrays:** Build fails with Cache Components enabled; always return at least one param
- **Synchronous params access:** `const { slug } = params` fails in Next.js 16—must `await params`
- **Missing notFound() calls:** Pages render blank/error instead of proper 404 when content doesn't exist
- **Returning partial params:** If route has `[category]/[slug]`, generateStaticParams must return BOTH properties
- **Using getStaticPaths:** This is Pages Router API; App Router uses `generateStaticParams`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Route parameter validation | Custom URL parsing logic | `generateStaticParams` + `dynamicParams = false` | Next.js handles validation, returns 404 for invalid routes |
| 404 page rendering | Custom error components | `not-found.tsx` + `notFound()` function | Next.js provides proper HTTP status codes (404 for non-streamed) |
| Metadata management | Manual `<head>` manipulation | `generateMetadata` function | Automatic optimization, deduplication, streaming support |
| Static route generation | Custom build scripts | `generateStaticParams` | Integrated with Next.js build, automatic memoization |

**Key insight:** Next.js App Router's file-based conventions (page.tsx, not-found.tsx, generateStaticParams) eliminate the need for custom routing/SSG infrastructure. Custom solutions miss Next.js optimizations like automatic request memoization and layout deduplication.

## Common Pitfalls

### Pitfall 1: Forgetting params is a Promise (Next.js 16 Breaking Change)
**What goes wrong:** TypeScript errors or runtime crashes when accessing params synchronously.
**Why it happens:** Next.js 15 allowed synchronous access (backwards compatibility), but Next.js 16 removes this completely.
**How to avoid:** Always `const { slug } = await params` in ALL pages, layouts, route handlers, and generateMetadata.
**Warning signs:** TypeScript error "Property 'slug' does not exist on type 'Promise<...>'" or build failures with async param access.

**Migration pattern:**
```typescript
// ❌ WRONG (Next.js 14/15 style)
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params
}

// ✅ CORRECT (Next.js 16 style)
export default async function Page({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
}
```

### Pitfall 2: Mismatched Property Names in generateStaticParams
**What goes wrong:** Routes don't generate, build fails, or runtime 404s for valid routes.
**Why it happens:** Returned object keys must exactly match folder names in brackets.
**How to avoid:** If route is `[category]/[slug]`, return `{ category: "...", slug: "..." }`—not `{ name: "...", id: "..." }`.
**Warning signs:** Next.js build warnings about unused generateStaticParams, all routes returning 404.

### Pitfall 3: Empty generateStaticParams with Cache Components
**What goes wrong:** Build error: "generateStaticParams must return at least one param when using Cache Components."
**Why it happens:** Next.js cannot validate that routes won't access runtime APIs (cookies, headers) without sample params.
**How to avoid:** Always return full list of params, or use placeholder like `[{ slug: '__placeholder__' }]` (not recommended).
**Warning signs:** Build fails with error message referencing empty-generate-static-params.

**Reference:** https://nextjs.org/docs/messages/empty-generate-static-params

### Pitfall 4: Not Calling notFound() for Invalid Params
**What goes wrong:** Pages render blank, throw errors, or show incorrect content when article doesn't exist.
**Why it happens:** Developers forget to validate fetched data before rendering.
**How to avoid:** After fetching data, check if it exists. If not, call `notFound()` before rendering.
**Warning signs:** Console errors about undefined properties, users seeing blank pages for invalid URLs.

### Pitfall 5: Duplicate Static Paths
**What goes wrong:** Build error: "The provided export path doesn't match the page."
**Why it happens:** Multiple `generateStaticParams` functions return overlapping routes (e.g., both parent and child return full paths).
**How to avoid:** Parent route generates parent params only; child route generates child params only (or bottom-up approach: child returns both).
**Warning signs:** Build fails with route conflict errors.

## Code Examples

Verified patterns from official sources:

### Generating All Category Routes
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
// app/[category]/page.tsx
import { CATEGORIES } from "@/types/content"

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    category,
  }))
}

export const dynamicParams = false  // Only allow these 6 categories, 404 for others
```

### Generating All Article Routes (Bottom-Up Approach)
```typescript
// app/[category]/[slug]/page.tsx
import { fetchAllArticles } from "@/lib/content"

export async function generateStaticParams() {
  const articles = await fetchAllArticles()

  return articles.map((article) => ({
    category: article.category,  // Both params returned together
    slug: article.slug,
  }))
}

export const dynamicParams = false  // 404 for any non-generated routes
```

### Article Page with Validation and Metadata
```typescript
// app/[category]/[slug]/page.tsx
import { notFound } from "next/navigation"
import { fetchCategoryArticles } from "@/lib/content"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}): Promise<Metadata> {
  const { category, slug } = await params

  const articles = await fetchCategoryArticles(category)
  const article = articles.find((a) => a.slug === slug)

  return {
    title: article ? `${article.title} | Ryder.AI` : "Not Found",
    description: article?.content.slice(0, 160),
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const { category, slug } = await params

  const articles = await fetchCategoryArticles(category)
  const article = articles.find((a) => a.slug === slug)

  if (!article) {
    notFound()
  }

  return (
    <article>
      <h1>{article.title}</h1>
      <div>{article.content}</div>
    </article>
  )
}
```

### Basic not-found.tsx Implementation
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/not-found
// app/[category]/[slug]/not-found.tsx
import Link from "next/link"

export default function NotFound() {
  return (
    <div>
      <h2>Article Not Found</h2>
      <p>Could not find the requested article.</p>
      <Link href="/">Return Home</Link>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router `getStaticPaths` | App Router `generateStaticParams` | Next.js 13.0 (stable in 13.4) | Simpler API, better TypeScript support, integrated with layouts |
| Synchronous `params` prop | Async `params` Promise | Next.js 16.0 | Must await params in all route files |
| `getStaticProps` for data | Server Components by default | Next.js 13.0 | Fetch directly in components, no separate functions |
| Manual `<head>` in `_document` | `generateMetadata` function | Next.js 13.2 | Automatic streaming, deduplication, type-safe |
| Optional `default.js` for parallel routes | Required `default.js` | Next.js 16.0 | Explicit error handling, prevents undefined route states |

**Deprecated/outdated:**
- **getStaticPaths / getStaticProps:** Pages Router APIs, replaced by `generateStaticParams` in App Router
- **Synchronous params access:** Temporarily allowed in Next.js 15 for backwards compatibility, fully removed in Next.js 16
- **`middleware.ts` filename:** Deprecated in Next.js 16, renamed to `proxy.ts` (not relevant for this phase)

## Open Questions

1. **Should we pre-render all articles or use subset approach?**
   - What we know: `generateStaticParams` can return full list or partial list
   - What's unclear: Performance impact of generating all routes vs on-demand for less popular articles
   - Recommendation: Generate ALL articles—documentation sites are static by nature, total count likely <100 articles, build time acceptable

2. **How to handle article slug changes in content repo?**
   - What we know: Slugs come from frontmatter, users might change them
   - What's unclear: Should we track old slugs for redirects?
   - Recommendation: Phase 3 doesn't handle redirects—just use current slugs. Redirects can be added in future phase if needed

3. **Should we implement category validation in generateStaticParams?**
   - What we know: CATEGORIES array exists in types/content.ts with 6 valid categories
   - What's unclear: Does Next.js need runtime validation beyond `dynamicParams = false`?
   - Recommendation: Use `dynamicParams = false` to enforce valid routes; additional validation unnecessary

## Sources

### Primary (HIGH confidence)
- Next.js 16.1.6 official docs: generateStaticParams - https://nextjs.org/docs/app/api-reference/functions/generate-static-params (verified 2026-02-11)
- Next.js 16.1.6 official docs: Dynamic Routes - https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes (verified 2026-02-11)
- Next.js 16.1.6 official docs: not-found.js - https://nextjs.org/docs/app/api-reference/file-conventions/not-found (verified 2026-02-11)
- Next.js 16.1.6 official docs: generateMetadata - https://nextjs.org/docs/app/api-reference/functions/generate-metadata (verified 2026-02-11)
- Next.js 16 Upgrade Guide - https://nextjs.org/docs/app/guides/upgrading/version-16 (verified 2026-02-11)
- Next.js empty generateStaticParams error docs - https://nextjs.org/docs/messages/empty-generate-static-params

### Secondary (MEDIUM confidence)
- [Next.js Dynamic Route Segments in the App Router (2026 Guide)](https://thelinuxcode.com/nextjs-dynamic-route-segments-in-the-app-router-2026-guide/)
- [How to Fix "generateStaticParams" Errors in Next.js](https://oneuptime.com/blog/post/2026-01-24-nextjs-generatestaticparams-errors/view)
- [Next.js 16 App Router Project Structure: The Definitive Guide](https://makerkit.dev/blog/tutorials/nextjs-app-router-project-structure)
- [Handling Breaking Changes in Next.js 15: Async Params](https://medium.com/@matijazib/handling-breaking-changes-in-next-js-15-async-params-and-search-params-96075e04f7b6)

### Tertiary (LOW confidence)
- None - all claims verified with official documentation or multiple credible sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Next.js 16 official docs, version confirmed in package.json
- Architecture: HIGH - Patterns verified in official Next.js documentation and examples
- Pitfalls: HIGH - Breaking changes documented in official upgrade guide, common errors from official error docs

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days - Next.js is stable, App Router patterns unlikely to change)
