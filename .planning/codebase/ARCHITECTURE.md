# Architecture

**Analysis Date:** 2026-02-15

## Pattern Overview

**Overall:** Server-driven Next.js App Router with static generation

**Key Characteristics:**
- Static site generation (SSG) with dynamic route params via `generateStaticParams`
- Server components by default with selective client-side interactivity
- GitHub-based content sourcing with Octokit API client
- Markdown processing with unified, remark, and rehype pipeline
- Type-safe data validation with Zod schemas
- Tailwind CSS for styling with custom design tokens

## Layers

**Page Layer (Routing):**
- Purpose: Handle request routing and server-side rendering
- Location: `src/app/` (Next.js App Router)
- Contains: Route handlers, page components, layout wrappers, error boundaries
- Depends on: Components, content library, type system
- Used by: Next.js runtime

**Data Access Layer (Content Library):**
- Purpose: Fetch and validate markdown content from GitHub API
- Location: `src/lib/content.ts`
- Contains: `fetchCategoryArticles()`, `fetchAllArticles()`, `fetchCategories()`
- Depends on: GitHub API client (`src/lib/github.ts`), Zod schemas, file system operations
- Used by: All page components that need article data

**Schema & Type Layer:**
- Purpose: Define and validate data structures
- Location: `src/lib/schemas/article.ts`, `src/types/content.ts`
- Contains: Zod schemas for frontmatter, TypeScript interfaces for Article/Category
- Depends on: Zod validation library
- Used by: Content library for validation, page components for type safety

**Utility/Domain Layer:**
- Purpose: Business logic for tags, table of contents, markdown rendering
- Location: `src/lib/tags.ts`, `src/lib/toc.ts`
- Contains: Tag slug normalization, related article discovery, heading extraction
- Depends on: Content library, markdown parsing libraries
- Used by: Page components and search functionality

**Component Layer (UI):**
- Purpose: Render interactive and presentational UI
- Location: `src/components/` (split into `/ui` and `/search`)
- Contains: React components (Server and Client)
- Depends on: Types, utilities, article data
- Used by: Page components

**Integration Layer (GitHub):**
- Purpose: Encapsulate GitHub API configuration
- Location: `src/lib/github.ts`
- Contains: Octokit singleton, repository config constants
- Depends on: Octokit library, environment variables
- Used by: Content library

## Data Flow

**Homepage Load Flow:**

1. `src/app/page.tsx` (server component) receives request
2. Calls `fetchCategories()` and `fetchAllArticles()` from `src/lib/content.ts`
3. Content library calls GitHub API via Octokit
4. Fetches category folder listings → filters .md files
5. For each file: decodes base64 → parses frontmatter with gray-matter
6. Validates frontmatter with `ArticleFrontmatterSchema` (Zod)
7. Returns typed `Article[]` objects
8. Page component renders `<ArticleCard>` components for each article
9. Cards use `ArticleCard` component from `src/components/ui/ArticleCard.tsx`

**Article Detail Page Flow:**

1. `src/app/[category]/[slug]/page.tsx` receives dynamic params
2. `generateStaticParams()` returns array of all `{category, slug}` pairs
3. Next.js pre-renders all article pages at build time
4. Page component fetches articles for category via `fetchCategoryArticles()`
5. Finds article matching slug
6. Calls `getRelatedArticles()` to find tag-similar content
7. Calls `extractToc()` to build table of contents headings
8. Renders markdown with unified pipeline (remark → rehype)
9. Applies syntax highlighting via rehype-pretty-code
10. Renders two-column layout with sidebar + content + related articles

**Search Flow:**

1. User types in `<SearchBar>` component (`src/components/search/SearchBar.tsx`)
2. Debounced input (300ms) updates URL search params via router.replace()
3. Navigates to `/search?q=<term>`
4. `src/app/search/page.tsx` receives searchParams
5. Fetches all articles via `fetchAllArticles()`
6. Passes to `<SearchResults>` client component
7. Component dynamically imports Fuse.js on client
8. Builds fuzzy search index with weighted keys: title (2), tags (1.5), content (1)
9. Returns results mapped through `<ArticleCard>` components

**Tag Discovery Flow:**

1. User clicks tag link in article or card
2. Navigates to `/tags/[tag]`
3. `src/app/tags/[tag]/page.tsx` calls `getArticlesByTag(slug)`
4. Converts slug to normalized tag format
5. Filters all articles by matching tags
6. Sorts by updated date (newest first)
7. Renders as list of `<ArticleCard>` components

## State Management

**No client-side state library used.** State patterns:

- **Server state:** Fetched via Octokit → cached by Next.js
- **URL state:** Search query, tag filters stored in URL search params
- **Component state:** Minimal - only SearchResults uses useState for loading/results
- **Form state:** None (search is URL-driven)

## Key Abstractions

**Article Entity:**
- Purpose: Type-safe representation of markdown document + metadata
- File: `src/types/content.ts` (`interface Article`)
- Definition: Extends `ArticleFrontmatter` with `content` (markdown body) + `path` (GitHub path)
- Validation: Frontmatter validated with `ArticleFrontmatterSchema` (Zod)

**Repository Configuration:**
- Purpose: Centralize GitHub API settings
- File: `src/lib/github.ts` (`REPO_CONFIG` const)
- Contains: owner, repo, basePath, excludePaths, categories array
- Usage: All content fetch functions reference REPO_CONFIG

**Tag Slug Transformation:**
- Purpose: Bidirectional conversion between display format and URL format
- Functions: `tagToSlug()` (case-insensitive, space→dash), `slugToTag()` (dash→space)
- File: `src/lib/tags.ts`
- Usage: ArticleCard tags, sidebar tags, tag page routes

**Status Badge Configuration:**
- Purpose: Encapsulate status display logic (color, icon, label)
- File: `src/components/ui/StatusBadge.tsx` (`statusConfig` object)
- Maps status enum to classes/colors: "in-progress" (amber), "stable" (teal), "complete" (green)
- Reused in ArticleCard and ArticleSidebar

**Category Color Palette:**
- Purpose: Consistent visual mapping across components
- Defined in: `src/app/page.tsx`, `src/app/[category]/[slug]/page.tsx`, `src/components/ui/ArticleCard.tsx`
- Mapping: models (purple), tools (teal), skills (orange), repos (pink), agents (blue), projects (green)
- Future refactor: Move to design tokens/theme config

## Entry Points

**Homepage:**
- Location: `src/app/page.tsx`
- Triggers: `GET /`
- Responsibilities: Fetch all categories and recent articles, render hero section + grid + list

**Category Page:**
- Location: `src/app/[category]/page.tsx`
- Triggers: `GET /:category`
- Responsibilities: Fetch articles for category, render filtered list, display category metadata

**Article Detail:**
- Location: `src/app/[category]/[slug]/page.tsx`
- Triggers: `GET /:category/:slug`
- Responsibilities: Fetch single article, render markdown, build TOC, find related content

**Search Page:**
- Location: `src/app/search/page.tsx`
- Triggers: `GET /search?q=<term>`
- Responsibilities: Render search UI, pass articles to client-side search component

**Tag Discovery:**
- Location: `src/app/tags/[tag]/page.tsx`
- Triggers: `GET /tags/:tag`
- Responsibilities: Find articles by tag, render list, show tag name

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: All routes
- Responsibilities: Render persistent header/nav, SearchBar, metadata, CSS imports

**Search Bar Component:**
- Location: `src/components/search/SearchBar.tsx`
- Type: Client component ("use client")
- Responsibilities: Handle user input, debounce, update URL params

## Error Handling

**Strategy:** Fail gracefully at multiple levels

**Content Library (`src/lib/content.ts`):**
- 404 errors (missing category): Return empty array, log warning
- Validation errors (bad frontmatter): Skip file, log warning, continue
- Individual file fetch errors: Try/catch, skip, continue
- Rate limit errors: Propagate to caller (build fails loudly)

**Page Components:**
- Missing article: Call `notFound()` from `next/navigation` → renders 404 page
- Missing category: Renders empty state or category with 0 articles

**Search Results:**
- Invalid query: Show "Enter a search term" prompt
- No results: Show "No articles found" message
- Loading state: Show "Searching..." while Fuse.js initializes

**Global Error:**
- Location: `src/app/not-found.tsx`
- Fallback: Renders generic 404 page with link back to home

## Cross-Cutting Concerns

**Logging:**
- Method: `console.warn()` for non-critical issues
- Usage: API errors, validation failures, configuration warnings
- No centralized logger - leverages Next.js build output

**Validation:**
- Tool: Zod schemas
- Pattern: `safeParse()` for non-blocking validation, logs on failure
- Schema location: `src/lib/schemas/article.ts`

**Authentication:**
- GitHub API auth via `GITHUB_TOKEN` environment variable
- Falls back to unauthenticated (60 req/hr) if missing
- Rate limit: 5000 req/hr authenticated, 60 req/hr unauthenticated

**Markdown Rendering:**
- Pipeline: remark (parse) → remark-gfm (tables/strikethrough) → rehype (convert) → rehype-slug (ids) → rehype-pretty-code (syntax highlighting) → rehype-stringify (HTML)
- Syntax theme: github-dark-dimmed
- Security: `allowDangerousHtml: true` on rehype (safe because content from controlled GitHub repo)

**Search Indexing:**
- Runtime client-side fuzzy search via Fuse.js
- Weighted keys: title (2.0), tags (1.5), content (1.0)
- Threshold: 0.3 (allows typos)
- Minimum match length: 2 characters
- Built on demand when user navigates to search

**Performance:**
- Static generation: All article pages pre-rendered at build time
- Content caching: GitHub API responses cached by Next.js (ISR possible but not configured)
- Client-side search: Fuse.js dynamically imported (lazy load)
- Debouncing: Search input debounced 300ms to prevent excessive route replacements

---

*Architecture analysis: 2026-02-15*
