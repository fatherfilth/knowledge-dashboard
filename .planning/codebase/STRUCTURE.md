# Codebase Structure

**Analysis Date:** 2026-02-15

## Directory Layout

```
knowledge-dashboard/
├── .planning/              # GSD documentation and phase plans
├── .next/                  # Next.js build output (generated, not committed)
├── designs/                # Design assets and variants
├── node_modules/           # Dependencies (generated, not committed)
├── public/                 # Static assets (fonts, images, favicons)
├── scripts/                # Build/verification scripts
├── src/                    # Primary source code
│   ├── app/                # Next.js App Router pages and layouts
│   │   ├── api/
│   │   │   └── verify/
│   │   ├── [category]/
│   │   │   └── [slug]/
│   │   ├── search/
│   │   ├── tags/
│   │   │   └── [tag]/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── not-found.tsx
│   ├── components/         # React UI components
│   │   ├── search/         # Search-specific components
│   │   └── ui/             # Reusable UI components
│   ├── lib/                # Core utilities and business logic
│   │   ├── schemas/
│   │   ├── content.ts
│   │   ├── github.ts
│   │   ├── tags.ts
│   │   └── toc.ts
│   ├── types/              # Shared type definitions
│   │   └── content.ts
│   └── app/
│       └── globals.css
├── .env.local              # Local environment variables (not committed)
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── prettier.config.js
├── README.md
└── tsconfig.json
```

## Directory Purposes

**src/:**
- Purpose: All application source code
- Contains: App Router routes, components, utilities, types, styles
- Key files: Entry point for development

**src/app/:**
- Purpose: Next.js App Router directory (file-based routing)
- Contains: Page components, layouts, API routes, error boundaries
- Key files:
  - `page.tsx` - homepage
  - `layout.tsx` - root layout with header and navigation
  - `not-found.tsx` - global 404 fallback
  - `[category]/page.tsx` - category listing
  - `[category]/[slug]/page.tsx` - article detail page
  - `search/page.tsx` - search results page
  - `tags/[tag]/page.tsx` - tag articles page
  - `api/verify/route.ts` - content verification endpoint

**src/components/:**
- Purpose: Modular React components (Server and Client)
- Contains: Articles cards, search UI, metadata displays, status indicators
- Structure: `/ui` for reusable components, `/search` for search-specific

**src/components/ui/:**
- Purpose: Reusable presentational components
- Key files:
  - `ArticleCard.tsx` - Article list card with metadata
  - `ArticleSidebar.tsx` - Article detail sidebar (TOC, metadata, tags)
  - `ArticleMetadata.tsx` - Metadata display helper
  - `RelatedArticles.tsx` - Related articles section
  - `StatusBadge.tsx` - Status indicator component

**src/components/search/:**
- Purpose: Search-specific functionality
- Key files:
  - `SearchBar.tsx` - Input field with debounce (client component)
  - `SearchResults.tsx` - Fuzzy search results rendering (client component)

**src/lib/:**
- Purpose: Core business logic, utilities, API clients
- Contains: Content fetching, data transformation, schema validation
- Key files:
  - `content.ts` - Primary data layer (fetch articles by category)
  - `github.ts` - GitHub API client and repository config
  - `tags.ts` - Tag utility functions (slug conversion, related articles)
  - `toc.ts` - Table of contents extraction from markdown

**src/lib/schemas/:**
- Purpose: Zod validation schemas for data structures
- Key files:
  - `article.ts` - Frontmatter schema validation

**src/types/:**
- Purpose: Shared TypeScript type definitions
- Key files:
  - `content.ts` - Article, Category, and content-related types

**public/:**
- Purpose: Static assets served as-is by Next.js
- Contains: Fonts, images, favicons, robots.txt

**scripts/:**
- Purpose: Build-time and development scripts
- Key files:
  - `verify-content.ts` - Content validation script (run via npm)

**.planning/:**
- Purpose: GSD documentation (phases, research, codebase analysis)
- Contains: Phase plans, implementation guides, architecture docs
- Not part of build output

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Homepage with categories and recent articles
- `src/app/layout.tsx`: Root layout (persistent header, nav, CSS)
- `src/app/[category]/page.tsx`: Category listing page
- `src/app/[category]/[slug]/page.tsx`: Article detail page
- `src/app/search/page.tsx`: Search results page
- `src/app/tags/[tag]/page.tsx`: Tag articles page

**Configuration:**
- `tsconfig.json`: TypeScript compiler options (includes path alias `@/*` → `src/*`)
- `next.config.ts`: Next.js configuration
- `eslint.config.mjs`: ESLint rules
- `prettier.config.js`: Code formatter config
- `postcss.config.mjs`: PostCSS plugins (Tailwind)

**Core Logic:**
- `src/lib/content.ts`: Content fetching and validation
- `src/lib/github.ts`: GitHub API configuration
- `src/lib/tags.ts`: Tag normalization and article discovery
- `src/lib/toc.ts`: Markdown heading extraction
- `src/lib/schemas/article.ts`: Zod frontmatter schema

**Styling:**
- `src/app/globals.css`: Global CSS and Tailwind directives

## Naming Conventions

**Files:**
- Page components: `page.tsx` (Next.js convention)
- Layout components: `layout.tsx` (Next.js convention)
- Error boundaries: `not-found.tsx`, `error.tsx` (Next.js convention)
- API routes: `route.ts` (Next.js convention, in `api/` directories)
- Components: PascalCase, e.g., `ArticleCard.tsx`, `SearchBar.tsx`
- Utilities: camelCase, e.g., `content.ts`, `tags.ts`, `github.ts`
- Types: Separate `content.ts` in `src/types/`
- Schemas: Separate `article.ts` in `src/lib/schemas/`

**Directories:**
- App routes: kebab-case with brackets for dynamic segments, e.g., `[category]`, `[slug]`
- Component folders: kebab-case or PascalCase, e.g., `ui/`, `search/`
- Utilities: lowercase, e.g., `lib/`, `types/`, `schemas/`

**Functions:**
- Content fetching: `fetchXXX()` pattern, e.g., `fetchCategoryArticles()`, `fetchAllArticles()`
- Data transformation: `getXXX()` pattern, e.g., `getRelatedArticles()`, `getArticlesByTag()`
- Slug conversion: `tagToSlug()`, `slugToTag()`
- Extraction: `extractXXX()` pattern, e.g., `extractToc()`

**Variables:**
- camelCase for local variables
- UPPERCASE_CONST for module-level constants, e.g., `REPO_CONFIG`, `CATEGORIES`
- Type-prefixed names for Record objects, e.g., `categoryColors`, `statusConfig`

**Types:**
- PascalCase for interfaces and types, e.g., `Article`, `Category`, `TocHeading`
- Type suffixes: `ArticleFrontmatter`, `ArticleCardProps`

## Where to Add New Code

**New Feature (e.g., Comments):**
- Primary code: `src/lib/comments.ts` (data fetching), `src/lib/schemas/comment.ts` (validation)
- Type definitions: `src/types/content.ts` (add CommentType interface)
- Components: `src/components/ui/CommentList.tsx`, `src/components/ui/CommentForm.tsx`
- Page integration: Modify `src/app/[category]/[slug]/page.tsx` to fetch and render comments

**New Component/Module:**
- Isolated feature: Create subdirectory in `src/components/`, e.g., `src/components/comments/`
  - Contains: `CommentForm.tsx`, `CommentThread.tsx`, etc.
  - Keep components in same folder with utilities
- Shared UI: Place in `src/components/ui/` (ArticleCard, StatusBadge pattern)
- Feature-specific state/hooks: Place with component, not in `src/lib/`

**Utilities/Helpers:**
- Single-concern utilities: `src/lib/` (one function per file if large)
- Closely related functions: Same file, e.g., `tags.ts` has 5 tag functions
- Type/interface utilities: `src/types/`
- Validation schemas: `src/lib/schemas/`

**API Routes:**
- RESTful endpoints: `src/app/api/[resource]/route.ts`
- Example pattern: `src/app/api/articles/route.ts` (GET all), `src/app/api/articles/[id]/route.ts` (GET one)

**Styling:**
- Component-scoped styles: Use Tailwind className prop (no CSS-in-JS library)
- Global styles: `src/app/globals.css`
- Design tokens: Defined in `tailwind.config.ts` (currently minimal, extend as needed)
- Reusable classes: Use with config constants, e.g., `categoryColors` record

**Tests:**
- Unit tests: Co-located with tested file, e.g., `src/lib/tags.test.ts`
- Integration tests: In dedicated `src/__tests__/` directory
- No test framework currently configured (TODO: Consider vitest or jest)

## Special Directories

**src/app/:**
- Purpose: Next.js App Router directory (file-based routing system)
- Generated: No (source files)
- Committed: Yes
- Note: Filenames like `page.tsx`, `layout.tsx`, `route.ts` are Next.js conventions

**.next/:**
- Purpose: Next.js build output
- Generated: Yes (during `npm run build`)
- Committed: No (.gitignore)
- Note: Contains compiled JS, server components, static pages, etc.

**node_modules/:**
- Purpose: NPM dependencies
- Generated: Yes (via `npm install`)
- Committed: No (.gitignore)
- Note: Lockfile (`package-lock.json`) is committed

**.planning/:**
- Purpose: GSD documentation (not part of application)
- Generated: No (manually created/updated)
- Committed: Yes
- Note: Contains phase guides, research, and codebase analysis docs

**public/:**
- Purpose: Static assets served by Next.js at `/` path
- Generated: No (source files)
- Committed: Yes
- Note: Fonts, images, icons, etc. referenced in `src/app/layout.tsx`

**designs/:**
- Purpose: Design files and variants (figma exports, mockups)
- Generated: No (source files)
- Committed: Yes
- Note: Used for visual reference during implementation

---

*Structure analysis: 2026-02-15*
