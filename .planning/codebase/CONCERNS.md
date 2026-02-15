# Codebase Concerns

**Analysis Date:** 2026-02-15

## Tech Debt

### Missing Cache Headers & Revalidation Strategy

**Issue:** No Next.js revalidation strategy defined. All data fetches (articles, categories, tags) happen on every request without caching.

**Files:**
- `src/lib/content.ts` - `fetchCategoryArticles()`, `fetchAllArticles()`, `fetchCategories()`
- `src/lib/tags.ts` - `getAllTags()`, `getRelatedArticles()`
- `src/app/[category]/[slug]/page.tsx` - `generateStaticParams()`, `generateMetadata()`
- `src/app/page.tsx` - calls `fetchCategories()` and `fetchAllArticles()` without cache
- `src/app/search/page.tsx` - calls `fetchAllArticles()` on every search request
- `next.config.ts` - Empty config, no optimization settings

**Impact:**
- Every page load triggers multiple GitHub API calls (3-7+ per request depending on page)
- GitHub API rate limit: 60 req/hr unauthenticated, 5000 req/hr authenticated
- Search page fetches all articles for every query (wasteful client-side)
- Slower page load times, especially on category/search pages
- Risk of hitting rate limits during traffic spikes

**Fix approach:**
1. Add ISR (Incremental Static Regeneration) with `revalidate` to pages: `export const revalidate = 3600` (1 hour)
2. Use `next/cache` `unstable_cache()` for library functions with TTL
3. Move `fetchAllArticles()` call in search page to server component with caching
4. Consider on-demand revalidation via webhook from GitHub
5. Add response caching headers in Next.js config

---

### Loose Type Handling with `any`

**Issue:** Multiple files use `any` type annotations and type assertions that bypass TypeScript safety.

**Files:**
- `src/lib/content.ts` line 98: `catch (error: any)`
- `src/app/api/verify/route.ts` line 85: `catch (error: any)`
- `src/lib/toc.ts` line 19: `visit(tree, "heading", (node: any) =>`
- `src/lib/toc.ts` line 23: `.map((child: any) =>`

**Impact:**
- Type safety is reduced at error boundaries
- AST node properties accessed without type checking
- Potential null/undefined errors at runtime
- Harder to refactor with confidence

**Fix approach:**
1. Create proper error types for catch blocks: `catch (error: unknown)`
2. Use type guards: `if (error instanceof Error) { ... }`
3. Create AST node type interfaces instead of `any` in `toc.ts`
4. Enable TypeScript `strict: true` enforcement in lint rules

---

### No Input Validation in URL Parameters

**Issue:** URL parameters (`category`, `slug`, `tag`) are used directly without validation against expected values.

**Files:**
- `src/app/[category]/page.tsx` - uses `category` parameter directly
- `src/app/[category]/[slug]/page.tsx` - uses `slug` parameter directly
- `src/app/tags/[tag]/page.tsx` - uses `tag` parameter directly

**Impact:**
- Dynamic routes accept any string without checking category enum
- Could fail silently if routing assumptions change
- Harder to debug mismatched categories
- No protection against future schema changes

**Fix approach:**
1. Validate category against `REPO_CONFIG.categories` in each route
2. Validate slug against actual articles returned from `fetchCategoryArticles()`
3. Create middleware or utility to validate route params against schema
4. Use Zod for parameter validation: `const categorySchema = z.enum([...REPO_CONFIG.categories])`

---

## Known Bugs

### XSS Risk with `dangerouslySetInnerHTML`

**Issue:** Article content is rendered with `dangerouslySetInnerHTML` without clear XSS protection strategy.

**Files:**
- `src/app/[category]/[slug]/page.tsx` line 138: `dangerouslySetInnerHTML={{ __html: htmlContent }}`

**Symptoms:**
- If markdown content contains malicious HTML/JavaScript, it could execute in browser
- Depends entirely on `rehype-pretty-code` and markdown pipeline not letting dangerous content through

**Trigger:**
- Attacker commits markdown with embedded `<img src=x onerror="alert('xss')">` or script tags to GitHub repo
- Content renders and executes

**Mitigation in place:**
- Content comes from GitHub repo (internal, trusted source)
- `remark-rehype` is used but with `allowDangerousHtml: true` (line 84)
- `rehypeStringify` also has `allowDangerousHtml: true` (line 90)
- No HTML sanitization library (like `DOMPurify` or `sanitize-html`)

**Recommendation:**
1. If articles are ever user-generated or third-party: add `sanitize-html` npm package
2. Remove `allowDangerousHtml` flags if not needed
3. Document that content source is trusted (GitHub repo)
4. Add CSP header: `Content-Security-Policy: script-src 'self'`

---

### Tab Key Closing SearchBar Escape Handler

**Issue:** SearchBar escape handler only clears input on `inputRef`, doesn't handle Tab navigation properly.

**Files:**
- `src/components/search/SearchBar.tsx` line 31-38: `handleKeyDown()` only handles `Escape`

**Symptoms:**
- Tabbing out of search input doesn't clear it visually if user types then tabs away
- User might assume their search is still active when focus moved

**Trigger:**
- User types in search bar, presses Tab to navigate to next element
- Search text remains but focus left

**Workaround:**
- Not critical; search state is URL-driven, so behavior is correct functionally
- Visual inconsistency only

**Fix approach:**
- Add `onBlur` handler in addition to `onKeyDown` to handle all exit cases
- Or remove visual text clearing and rely purely on URL state

---

## Security Considerations

### GITHUB_TOKEN Exposure in Error Messages

**Risk:** Error responses in `/api/verify` route include full error stack traces.

**Files:**
- `src/app/api/verify/route.ts` line 85-93: `catch` block returns `error.stack`

**Current mitigation:**
- Token is in environment variable, not in stack trace
- Response only visible to developer who can access `/api/verify` endpoint

**Recommendation:**
1. In production: Never expose `error.stack` in API responses
2. Log stack traces server-side only, return generic error message to client
3. Check for sensitive patterns in error messages before returning
4. Create error serialization utility:
```typescript
function serializeError(error: unknown, isDev: boolean) {
  if (!isDev) return { message: 'Internal server error' };
  if (error instanceof Error) return { message: error.message };
  return { message: String(error) };
}
```

---

### No Rate Limit Handling for GitHub API

**Risk:** If rate limit is hit, application fails without fallback or user-friendly message.

**Files:**
- `src/lib/content.ts` - catches 404 but not rate limit errors (429)
- `src/lib/github.ts` - Creates octokit client with optional token, no rate limit monitoring

**Current impact:**
- Rate limit error propagates as 500 error to user
- No indication of why service is unavailable
- With 60 req/hr unauthenticated limit, easy to hit on staging with multiple developers

**Recommendation:**
1. Add rate limit detection in `content.ts`:
```typescript
if (error.status === 429) {
  console.error('GitHub API rate limit exceeded');
  // Return cached data or show maintenance message
}
```
2. Create monitoring for rate limit headers (`x-ratelimit-remaining`)
3. Document requirement for `GITHUB_TOKEN` in production
4. Add rate limit status to `/api/verify` endpoint

---

## Performance Bottlenecks

### N+1 Query Pattern in Tag Functions

**Problem:** `getRelatedArticles()` fetches all articles, then scores them client-side. Multiple tag functions each call `fetchAllArticles()` independently.

**Files:**
- `src/lib/tags.ts` line 31: `getAllTags()` calls `fetchAllArticles()` once
- `src/lib/tags.ts` line 58-73: `getTagDisplayName()` calls `fetchAllArticles()` in loop
- `src/lib/tags.ts` line 81-94: `getArticlesByTag()` calls `fetchAllArticles()` again
- `src/lib/tags.ts` line 116-141: `getRelatedArticles()` calls `fetchAllArticles()` again
- Each article page calls `getRelatedArticles()` which fetches all articles again

**Impact:**
- Every article page load makes 2-4 separate `fetchAllArticles()` calls
- Scales poorly; with 500+ articles, computing tag overlap on every request is expensive
- Search page also loads all articles separately

**Cause:** No caching between related functions; each function independently fetches and processes full dataset

**Improvement path:**
1. Cache `fetchAllArticles()` result in memory or request cache
2. Restructure to pass articles through function chain instead of re-fetching
3. Pre-compute related articles during build if content is static
4. Use `unstable_cache()` from `next/cache` to share data across functions:
```typescript
const getCachedArticles = unstable_cache(
  async () => fetchAllArticles(),
  ['all-articles'],
  { revalidate: 3600 }
);
```

---

### Search Loads All Articles Every Request

**Problem:** Search page calls `fetchAllArticles()` on every request, even when no query.

**Files:**
- `src/app/search/page.tsx` line 20: Always calls `fetchAllArticles()`
- `src/components/search/SearchResults.tsx` line 44: Client-side Fuse.js search happens on every `query` change

**Impact:**
- Wasteful: fetches and sends full article data to client for every search page load
- Client then re-parses and re-indexes with Fuse.js on every keystroke
- Inefficient for large datasets (100+ articles)

**Improvement path:**
1. Consider server-side search if articles exceed 100-200 items
2. Or memoize Fuse index creation on client: `useMemo(() => new Fuse(...), [])`
3. Defer article fetch until user types:
```typescript
// In search page: only fetch if query exists
const articles = query ? await fetchAllArticles() : [];
```
4. Use server action for search instead of client-side Fuse

---

## Fragile Areas

### Dynamic Route Generation Assumes Consistent Data

**Issue:** `generateStaticParams()` must be accurate or pre-rendered pages will be wrong.

**Files:**
- `src/app/[category]/[slug]/page.tsx` line 27-32: `generateStaticParams()`
- `src/app/tags/[tag]/page.tsx`: Similar pattern (file not fully read)

**Why fragile:**
- If article is deleted from GitHub repo, pre-rendered page becomes stale
- If slug changes, old route doesn't redirect, returns 404
- No versioning or tracking of what was generated

**Safe modification:**
1. Keep `dynamicParams = false` as is (fallback to 404 instead of generating new routes at runtime)
2. Document deployment process: must re-run `next build` when articles change
3. Add validation in `generateStaticParams()` that fails loudly if any article is missing required fields
4. Monitor 404 rates on article routes to detect deleted content

**Test coverage:** No tests for `generateStaticParams()` logic or frontmatter validation

---

### Category Color/Icon Mappings Hard-Coded in Multiple Places

**Issue:** Category display data (colors, icons) is duplicated across files.

**Files:**
- `src/app/page.tsx` line 5-21: `categoryColors` and `categoryIcons` objects
- `src/app/[category]/[slug]/page.tsx` line 18-25: `categoryColors` again
- `src/components/ui/ArticleSidebar.tsx` line 12-19: `categoryColors` again

**Why fragile:**
- If color scheme changes, must update in 3 places
- Easy to miss one location and create visual inconsistency
- No single source of truth

**Safe modification:**
1. Move to shared constant file: `src/lib/constants.ts`:
```typescript
export const CATEGORY_DISPLAY = {
  models: { color: '#8B5CF6', icon: '🧠' },
  tools: { color: '#00E5CC', icon: '🔧' },
  // ...
} as const;
```
2. Import everywhere instead of redefining
3. Add Zod validation to ensure all 6 categories have entries

---

## Scaling Limits

### GitHub API Rate Limit Reached with Growth

**Current capacity:**
- Authenticated: 5000 requests/hr = ~83 requests/min
- Per-page cost: 3-7 API calls (fetch categories, all articles, related articles)
- Estimated max: ~10-25 concurrent users at full capacity

**Limit:**
- As articles grow (500+), `fetchAllArticles()` could timeout
- Each client-side search recomputes tag overlap for all articles (O(n²) complexity)

**Scaling path:**
1. Short-term: Ensure `GITHUB_TOKEN` is set in production
2. Medium-term: Implement incremental static regeneration with cache
3. Long-term: Migrate to database instead of GitHub as source
4. Consider pagination/lazy loading for tag pages if tag list grows large

---

## Dependencies at Risk

### Markdown Processing Pipeline with Multiple Parts

**Risk:** Markdown rendering depends on 6 interdependent libraries (`remark-*`, `rehype-*`).

**Files:**
- `src/app/[category]/[slug]/page.tsx` line 80-92: Unified.js pipeline

**Impact if one breaks:**
- If `rehype-pretty-code` stops maintaining syntax highlighting, code blocks fail
- If `remark-rehype` breaks HTML conversion, entire article display breaks
- Test coverage: None; no tests of markdown pipeline

**Migration plan:**
1. Add unit tests for markdown-to-HTML conversion with sample articles
2. Lock versions explicitly; avoid `^` semver in production
3. Monitor `next/image`, `next/link` - these are part of `next` which is pinned
4. Consider `MDX` as alternative if template syntax needed in future

---

## Missing Critical Features

### No Analytics or Monitoring

**Problem:** No way to know which articles are read, what searches fail, or if API calls are timing out.

**Impact:**
- Can't identify unpopular content that needs improvement
- Can't see if rate limits are being hit
- Can't detect slow page loads

**Blocks:**
- Evidence-based content strategy improvements
- Performance optimization prioritization

---

### No Fallback When GitHub API Is Down

**Problem:** Entire site is unavailable if GitHub API fails.

**Files:**
- All data fetching depends on GitHub API

**Blocks:**
- Cannot serve content offline or from cache
- Site is completely down if GitHub experiences outages

**Recommendation:** Add simple cache layer (Redis, or file-based) for emergency fallback

---

## Test Coverage Gaps

### No Tests for Data Fetching Functions

**Untested:**
- `src/lib/content.ts` - `fetchCategoryArticles()`, `fetchAllArticles()`, `fetchCategories()`
- `src/lib/tags.ts` - Tag manipulation and scoring logic
- `src/lib/toc.ts` - TOC extraction from markdown
- `src/lib/schemas/article.ts` - Zod schema validation

**Files:**
- No `.test.ts` or `.spec.ts` files found in `src/`

**Risk:**
- Refactoring is risky
- Frontmatter validation errors discovered in production
- Tag slug generation bugs not caught during development
- TOC extraction fails silently for edge cases (inline code in headings, etc.)

**Priority:** High - Data fetching and validation are critical paths

**Approach:**
1. Add Jest or Vitest config
2. Write tests for:
   - Zod schema with valid/invalid frontmatter
   - Tag slug generation with special characters
   - TOC extraction with various heading formats
   - `calculateTagOverlap()` edge cases
   - Error handling in API route

---

### No E2E Tests for User Journeys

**Untested flows:**
- Browse category → open article → click related article
- Search for term → click result → navigate tags
- Tag page → click articles

**Risk:** UI changes could break navigation or routing without detection

---

### No Tests for Server Actions/API Routes

**Files:**
- `src/app/api/verify/route.ts` - GET endpoint with complex validation logic

**Risk:**
- Verification checks don't catch real issues
- Error handling code is untested

**Approach:** Add integration test:
```typescript
// api/verify.test.ts
describe('GET /api/verify', () => {
  it('should validate all categories present', async () => {
    const res = await fetch('/api/verify');
    const json = await res.json();
    expect(json.checks.allCategoriesPresent.passed).toBe(true);
  });
});
```

---

## Summary of Priorities

**Critical (do first):**
1. Add caching/revalidation to prevent rate limit issues
2. Add tests for data fetching layer
3. Fix `any` type assertions for type safety

**High (do soon):**
4. Add rate limit error handling
5. Consolidate hard-coded constants (colors, icons)
6. Add error boundary for markdown rendering
7. Validate URL parameters

**Medium (consider):**
8. Monitoring/analytics
9. Fallback cache layer
10. Performance optimization (tag overlap computation)
11. Server-side search if dataset grows

---

*Concerns audit: 2026-02-15*
