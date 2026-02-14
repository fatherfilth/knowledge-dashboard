# Domain Pitfalls

**Domain:** Next.js Markdown Knowledge Dashboard
**Researched:** 2026-02-14
**Confidence:** MEDIUM (based on training data and established patterns)

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: GitHub API Rate Limit Cascade Failure
**What goes wrong:** Build fails silently or partially when hitting GitHub API rate limits (60/hour unauthenticated, 5000/hour authenticated). Vercel deployments fail unpredictably, especially with incremental builds or preview deployments.

**Why it happens:**
- Fetching files individually instead of using Git Trees API
- Not caching responses between builds
- Vercel preview deployments trigger fresh builds for every PR commit
- Unauthenticated requests from build environment

**Consequences:**
- Deployment failures in production
- Stale content when builds partially succeed
- Impossible to redeploy without waiting for rate limit reset
- No clear error messages (API returns 200 with empty data after limit)

**Prevention:**
1. Use authenticated requests with GITHUB_TOKEN environment variable
2. Use Git Trees API (`GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=1`) for one request instead of N file requests
3. Implement build-time caching with Vercel's `fetch()` cache or file-based cache
4. Add rate limit monitoring with response headers (`X-RateLimit-Remaining`)
5. Implement exponential backoff and retry logic
6. Consider ISR (Incremental Static Regeneration) instead of full rebuilds

**Detection:**
- Build logs show "Fetching..." messages that succeed partially
- Builds work locally but fail in CI
- Content appears outdated despite recent changes
- Response headers show low `X-RateLimit-Remaining` values

**Phase mapping:** Phase 1 (Data Layer) must address this before implementing any build process.

---

### Pitfall 2: MDX Serialization Memory Explosion
**What goes wrong:** next-mdx-remote serialization causes out-of-memory errors or slow builds when processing many large markdown files. Build times exceed Vercel's 45-minute limit or Lambda function memory limits.

**Why it happens:**
- Serializing all MDX content at build time loads everything into memory simultaneously
- Complex MDX transformations (syntax highlighting, rehype plugins) are CPU/memory intensive
- Large code blocks or embedded content multiply memory usage
- Default Next.js build doesn't stream processing

**Consequences:**
- Build failures on Vercel: "Function invocation exceeded memory limit"
- 10+ minute build times for <100 articles
- Cannot scale beyond ~200-300 documents
- Development server crashes during file changes

**Prevention:**
1. Process files in batches (10-20 at a time) instead of Promise.all()
2. Use streaming serialization if available in next-mdx-remote version
3. Serialize only excerpt/preview at build time, lazy-load full content
4. Disable expensive rehype/remark plugins during development
5. Use SWC-based MDX compiler (built into Next.js 13+) instead of Babel
6. Consider on-demand ISR for individual articles instead of build-time generation
7. Implement memory monitoring in build script

**Detection:**
- Build output shows memory warnings
- Build time increases non-linearly with content size
- "JavaScript heap out of memory" errors
- Vercel build logs show high memory usage graphs

**Phase mapping:** Phase 2 (Content Processing) must implement batch processing from the start.

---

### Pitfall 3: YAML Frontmatter Type Inconsistency Hell
**What goes wrong:** Frontmatter parsing produces inconsistent types across files. Tags are sometimes strings, sometimes arrays. Dates are strings, not Date objects. Boolean fields parse as "true" strings. TypeScript types don't match runtime data.

**Why it happens:**
- gray-matter parses YAML liberally (single tag becomes string, not array)
- Authors write frontmatter inconsistently (copy-paste errors)
- No validation at content authoring time
- Type assertions in code assume consistent structure

**Consequences:**
- Runtime errors: `tags.map is not a function` when tags is a string
- Search indexing breaks on malformed frontmatter
- Sorting by date fails when dates are unparseable strings
- Silent data corruption (status "in progress" vs "in-progress" vs "inProgress")

**Prevention:**
1. Implement Zod schema validation for frontmatter immediately after gray-matter parsing
2. Create content authoring CLI that validates before commit (husky pre-commit hook)
3. Normalize data after parsing (always convert single tag to array)
4. Use TypeScript strict mode with proper type guards
5. Generate TypeScript types from Zod schema (zod-to-ts)
6. Add content linting in CI (GitHub Action to validate all .md files)
7. Provide VSCode snippet/template for new articles

**Detection:**
- Console errors about missing methods on unexpected types
- Search returns inconsistent results
- Filtering by category/status returns partial results
- Type errors in development but runtime failures in production

**Phase mapping:** Phase 1 (Data Layer) must include validation. Phase 3 (Content Management) should add authoring tools.

---

### Pitfall 4: Client-Side Search Index Bundle Bloat
**What goes wrong:** Fuse.js search index grows to 500KB+ and is shipped to every page load. Initial page load is slow, especially on mobile. Hydration takes 2-3 seconds.

**Why it happens:**
- Including full article content in search index (not just titles/excerpts)
- Shipping index as inline JSON in _app.js bundle
- Not code-splitting search functionality
- Indexing metadata that users never search (created dates, author, raw frontmatter)

**Consequences:**
- Poor Core Web Vitals (LCP, TBT)
- Search ranking penalties from Google
- Poor mobile experience
- Wasted bandwidth for users who never search

**Prevention:**
1. Index only searchable fields (title, tags, excerpt - NOT full content)
2. Lazy-load search index only when search is activated
3. Use dynamic import for Fuse.js library
4. Compress search index with gzip/brotli (serve as .json file)
5. Consider server-side search API route for large datasets (>200 articles)
6. Implement search index pagination/chunking by category
7. Pre-compute search index at build time, don't generate client-side

**Detection:**
- Lighthouse shows large JavaScript bundles
- Network tab shows large JSON payloads on initial load
- Time to Interactive >3 seconds
- Search feels slow despite being client-side

**Phase mapping:** Phase 4 (Search) must implement lazy loading. Phase 5 (Performance) should measure bundle size.

---

### Pitfall 5: Incremental Builds Break Content Relationships
**What goes wrong:** Next.js ISR or incremental builds update individual pages but not related pages. Tag pages show stale article lists. "Related articles" sections show outdated links. Category counts are wrong.

**Why it happens:**
- ISR regenerates individual article pages independently
- Relationship data (tags, categories, backlinks) computed at build time
- No cache invalidation for dependent pages
- getStaticPaths returns cached list of pages

**Consequences:**
- Deleting an article leaves broken links on tag pages
- Adding a new article doesn't appear in category listings until full rebuild
- Cross-references between articles become stale
- Search index doesn't include new content

**Prevention:**
1. Use on-demand ISR revalidation (revalidatePath) for all dependent pages when content changes
2. Implement build-time dependency graph (which pages reference which content)
3. Use Vercel Webhook + GitHub Actions to trigger full rebuild on content repo changes
4. Generate static relationship data (tag-to-articles map) and version it
5. Consider fully static builds (no ISR) if content changes infrequently
6. Implement cache versioning with content hash

**Detection:**
- New articles appear in search but not in category pages
- Tag pages missing recent articles
- Related articles sections show deleted content
- Inconsistent article counts across UI

**Phase mapping:** Phase 2 (Content Processing) should build dependency graph. Phase 6 (Content Updates) handles invalidation.

---

## Moderate Pitfalls

### Pitfall 6: MDX Component Import Chaos
**What goes wrong:** Custom MDX components (callouts, code blocks, diagrams) are imported inconsistently. Some files use JSX syntax, some use HTML. Components break when MDX version updates.

**Prevention:**
1. Provide all custom components via MDXProvider, not per-file imports
2. Document allowed components in content authoring guide
3. Version-lock next-mdx-remote and test before upgrades
4. Lint MDX files for invalid component usage

---

### Pitfall 7: Code Block Syntax Highlighting Build Performance
**What goes wrong:** Prism.js or Shiki syntax highlighting adds 10+ seconds to build time per 100 code blocks.

**Prevention:**
1. Use lighter syntax highlighter (highlight.js with limited languages)
2. Lazy-load language grammars
3. Pre-process code highlighting in content repo, not at Next.js build time
4. Use CSS-only highlighting for common languages

---

### Pitfall 8: Stale Metadata in Static Paths
**What goes wrong:** getStaticPaths caches article list, new articles require full rebuild to appear.

**Prevention:**
1. Use `fallback: 'blocking'` or `fallback: true` in getStaticPaths
2. Implement webhook-triggered rebuilds for content changes
3. Use ISR with short revalidation period (60 seconds) if acceptable

---

### Pitfall 9: Image Optimization Skipped for External Markdown Images
**What goes wrong:** Images in markdown files are served unoptimized, slow page loads.

**Prevention:**
1. Use remark-images plugin to transform markdown images to Next.js Image component
2. Download and optimize images at build time
3. Store images in public/ directory with content, not external links
4. Implement lazy loading for images below fold

---

### Pitfall 10: Broken Internal Links After Slug Changes
**What goes wrong:** Changing an article's slug breaks all internal markdown links to it.

**Prevention:**
1. Implement redirect system in next.config.js for old slugs
2. Validate internal links at build time (fail build on broken links)
3. Use stable IDs instead of slugs for internal references
4. Generate link suggestions during content authoring

---

## Minor Pitfalls

### Pitfall 11: No Graceful Degradation for Search
**What goes wrong:** Users with JavaScript disabled see search box but it doesn't work.

**Prevention:**
1. Add `<noscript>` message explaining search requires JavaScript
2. Consider server-side search fallback
3. Hide search UI when JavaScript unavailable

---

### Pitfall 12: Frontmatter Date Timezone Inconsistencies
**What goes wrong:** Dates display differently based on server/client timezone, hydration mismatches.

**Prevention:**
1. Store dates in ISO 8601 format with timezone
2. Display dates in UTC or normalize to user's timezone client-side
3. Suppress hydration warnings for date fields

---

### Pitfall 13: Build Cache Poisoning from Bad Content
**What goes wrong:** Malformed markdown file causes build to fail, cache prevents fixing.

**Prevention:**
1. Validate all markdown before processing
2. Clear Next.js cache on build failures
3. Implement file-level error boundaries (skip bad files, log errors)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Data Layer (Phase 1) | GitHub API rate limits | Implement authenticated requests + caching from start |
| Data Layer (Phase 1) | Frontmatter validation | Add Zod schema validation immediately |
| Content Processing (Phase 2) | MDX memory explosion | Batch processing, measure memory usage |
| Content Processing (Phase 2) | Slow syntax highlighting | Evaluate performance early, choose lighter option |
| Content Display (Phase 3) | Unoptimized images | Transform markdown images to Next.js Image |
| Search (Phase 4) | Bundle bloat | Lazy-load search, index only searchable fields |
| Search (Phase 4) | Poor mobile search UX | Test on mobile devices early |
| Performance (Phase 5) | Large initial bundles | Audit bundle size with @next/bundle-analyzer |
| Content Updates (Phase 6) | Stale tag/category pages | Implement invalidation strategy |
| Content Updates (Phase 6) | Broken internal links | Build-time link validation |

---

## Domain-Specific Antipatterns

### Antipattern 1: Fetching Content Client-Side
**What:** Using useEffect to fetch markdown from GitHub API in browser
**Why bad:** Rate limits hit by users, slow page loads, SEO suffers
**Instead:** Always fetch at build time or server-side (getStaticProps/getServerSideProps)

### Antipattern 2: Parsing Frontmatter Client-Side
**What:** Shipping gray-matter to browser, parsing frontmatter on each page load
**Why bad:** Unnecessary bundle size, parsing is slow, data should be static
**Instead:** Parse at build time, ship only processed data

### Antipattern 3: Full-Text Search Without Stemming
**What:** Using Fuse.js default settings without stemmer/tokenizer customization
**Why bad:** Poor search results ("running" doesn't match "run")
**Instead:** Configure Fuse.js with proper tokenization and stemming

### Antipattern 4: Rebuilding Entire Site on Content Change
**What:** Triggering full Next.js build for single article update
**Why bad:** Wastes build minutes, slow feedback loop
**Instead:** Use on-demand ISR or incremental builds with smart invalidation

---

## Confidence Assessment

**Overall confidence: MEDIUM**

**Rationale:**
- Pitfalls 1-5 (Critical): Based on well-documented Next.js + GitHub API + MDX patterns. These issues appear consistently in documentation sites, open-source projects (Nextra, Docusaurus migrations), and community discussions.
- Pitfalls 6-10 (Moderate): Common issues with established solutions, but project-specific severity varies.
- Pitfalls 11-13 (Minor): Edge cases that may or may not affect this specific project.

**What would increase confidence:**
- Official Next.js documentation review for 2026 best practices
- Vercel build logs analysis from similar projects
- next-mdx-remote GitHub issues review for current version
- Fuse.js performance benchmarks for various index sizes

**Sources:**
- Training data on Next.js build patterns (knowledge cutoff January 2025)
- Established GitHub API rate limiting behavior
- MDX serialization memory characteristics
- Client-side search performance patterns

**Note:** Unable to verify with live sources (Context7, WebSearch, official docs) due to tool restrictions. Recommendations are based on established patterns but should be validated against current 2026 documentation before implementation.

---

## Quick Reference: Prevention Checklist

Use this during phase planning:

**Phase 1 (Data Layer):**
- [ ] Implement GitHub API authentication
- [ ] Use Git Trees API, not individual file requests
- [ ] Add Zod schema validation for frontmatter
- [ ] Monitor rate limit headers

**Phase 2 (Content Processing):**
- [ ] Process MDX files in batches
- [ ] Measure memory usage during builds
- [ ] Benchmark syntax highlighting performance
- [ ] Implement build-time dependency graph

**Phase 3 (Content Display):**
- [ ] Transform markdown images to Next.js Image
- [ ] Test MDX component rendering edge cases
- [ ] Validate internal links at build time

**Phase 4 (Search):**
- [ ] Lazy-load search index and Fuse.js
- [ ] Index only title/tags/excerpt (not full content)
- [ ] Measure bundle size impact
- [ ] Configure Fuse.js tokenization

**Phase 5 (Performance):**
- [ ] Audit bundle size with @next/bundle-analyzer
- [ ] Measure Core Web Vitals
- [ ] Test on mobile devices
- [ ] Profile build time

**Phase 6 (Content Updates):**
- [ ] Implement on-demand ISR revalidation
- [ ] Handle dependent page invalidation
- [ ] Set up webhook for content repo changes
- [ ] Test incremental builds
