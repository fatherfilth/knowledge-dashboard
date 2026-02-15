# Coding Conventions

**Analysis Date:** 2026-02-15

## Naming Patterns

**Files:**
- PascalCase for React components: `ArticleCard.tsx`, `SearchBar.tsx`, `StatusBadge.tsx`
- camelCase for utility functions and libraries: `content.ts`, `github.ts`, `tags.ts`, `toc.ts`
- camelCase for schemas: `article.ts` in `src/lib/schemas/`
- camelCase for type files: `content.ts` in `src/types/`
- kebab-case for directories: `src/components/ui`, `src/components/search`, `src/lib/schemas`

**Functions:**
- camelCase for all functions: `fetchCategoryArticles()`, `tagToSlug()`, `extractToc()`, `calculateTagOverlap()`
- Async functions use camelCase with descriptive action verbs: `fetchAllArticles()`, `getRelatedArticles()`, `getArticlesByTag()`
- Component functions use PascalCase and arrow functions: `export function ArticleCard({ article }: ArticleCardProps)`
- Exported handler functions: `export async function GET()` (API routes)

**Variables:**
- camelCase for local variables: `categoryColors`, `searchableArticles`, `markdownFiles`, `invalidArticles`
- CONSTANT_CASE for runtime constants: `REPO_CONFIG` (exported), `CATEGORIES` (exported)
- Const objects that map values: `categoryColors: Record<string, string> = { ... }`, `statusConfig: Record<Status, { ... }>`
- Destructured parameters preserve their casing: `const { category, slug } = await params`

**Types and Interfaces:**
- PascalCase for interface names: `ArticleCardProps`, `SearchResultsProps`, `StatusBadgeProps`
- PascalCase for type aliases: `Category`, `Status`, `Article`, `ArticleFrontmatter`
- Props interfaces always end with `Props`: `interface SearchPageProps`
- Type imports use `import type`: `import type { Article } from "@/types/content"`
- Exported types derived from Zod schemas use inference: `export type ArticleFrontmatter = z.infer<typeof ArticleFrontmatterSchema>`

## Code Style

**Formatting:**
- Tool: Prettier 3.8.1
- Semi-colons: enabled (`semi: true`)
- Quotes: single quotes (`singleQuote: true`)
- Tab width: 2 spaces (`tabWidth: 2`)
- Trailing commas: all (`trailingComma: 'all'`)
- Print width: 80 characters (`printWidth: 80`)
- Arrow functions: parentheses avoided when possible (`arrowParens: 'avoid'`)

**Linting:**
- Tool: ESLint 9 with flat config (`.eslintrc.mjs` is ESM)
- Extends: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Integrates: `eslint-config-prettier` for zero conflicts with Prettier
- Ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`

**Line Length:**
- Maximum 80 characters enforced by Prettier
- Long JSX attributes wrap to new lines
- Long import lists wrap (see imports in `src/app/[category]/[slug]/page.tsx`)

## Import Organization

**Order:**
1. Framework imports (React, Next.js): `import { Suspense } from 'react'`, `import Link from 'next/link'`, `import type { Metadata } from 'next'`
2. External library imports: `import matter from "gray-matter"`, `import { z } from "zod"`, `import { Octokit } from "octokit"`
3. Internal imports with @ alias: `import { fetchCategoryArticles } from "@/lib/content"`, `import type { Article } from "@/types/content"`
4. Relative imports: `./<file>` (rarely used; @ alias is preferred)
5. CSS imports: `import './globals.css'` (at end of imports)
6. Type imports separate with `import type`: `import type Fuse from "fuse.js"`

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Always use `@/` for imports within the project
- Examples: `@/lib/content`, `@/components/ui`, `@/types/content`, `@/lib/schemas/article`

## Error Handling

**Patterns:**

1. **Try-catch with specific error handling:** (`src/lib/content.ts`)
   ```typescript
   try {
     // Operation
   } catch (error: any) {
     if (error.status === 404) {
       console.warn(`[functionName] Message`);
       return [];
     }
     throw error; // Re-throw non-404 errors
   }
   ```

2. **Console logging with context prefixes:**
   - Format: `console.warn('[functionName] message')` or `console.error('[functionName] message', error)`
   - Includes function name in square brackets for debugging
   - See: `fetchCategoryArticles()`, `getContent()` patterns

3. **Graceful degradation:**
   - Invalid frontmatter: logs warning, skips file, continues with rest (`fetchCategoryArticles()`)
   - Missing files: returns empty array instead of throwing
   - Type narrowing before operations: `if (!("content" in fileResponse.data))`

4. **Zod validation:**
   - Use `safeParse()` not `parse()` to avoid throwing
   - Check `result.success` before using `result.data`
   - Log validation errors to console: `console.warn(..., result.error.issues)`
   - Example: `src/lib/schemas/article.ts`

5. **API route errors:** (`src/app/api/verify/route.ts`)
   ```typescript
   try {
     // Operation
     return NextResponse.json({ success: true, ... });
   } catch (error: any) {
     return NextResponse.json(
       { success: false, error: error.message, stack: error.stack },
       { status: 500 }
     );
   }
   ```

## Logging

**Framework:** `console` (built-in)

**Patterns:**
- `console.warn()` for non-critical issues (API not found, validation failures, missing tokens)
- `console.error()` for errors with context (would use if implemented)
- Include function name prefix: `console.warn('[fetchCategoryArticles] ...')`
- Log at operation boundaries (file fetch, validation, API calls)
- Context initialization: `if (!process.env.GITHUB_TOKEN) { console.warn('[GitHub API] ...') }`

**Examples:**
- `console.warn('[fetchCategoryArticles] Validation failed for ${file.path}:', result.error.issues)`
- `console.warn('[GitHub API] No GITHUB_TOKEN found - using unauthenticated mode')`
- `console.warn('[fetchCategoryArticles] Failed to fetch ${file.path}:', error)`

## Comments

**When to Comment:**
- Complex algorithms: `calculateTagOverlap()` in `src/lib/tags.ts`
- Business logic that isn't obvious: article filtering in `fetchCategoryArticles()`
- Workarounds or explanations of why something is done: "Clone before sorting to avoid mutating cache"
- Configuration decisions: Zod coerce comment explaining gray-matter behavior

**Inline Comments:**
- Use `//` for single-line explanations
- Place above the code it describes
- Explain WHY not WHAT (code shows what)
- Example: `// Clone articles to avoid mutating cached data`

**JSDoc/TSDoc:**
- Used extensively for exported functions, especially async operations
- Format: multi-line comment blocks above function
- Includes: `@param`, `@returns`, behavior notes, error handling notes
- Examples: `src/lib/content.ts`, `src/lib/tags.ts`

**JSDoc Example Pattern:**
```typescript
/**
 * Function description
 *
 * @param param1 - Description
 * @returns Description of return value
 *
 * Behavior:
 * - Detail 1
 * - Detail 2
 */
```

## Function Design

**Size:**
- Utility functions: 10-40 lines typical (see `tagToSlug()`, `slugToTag()`)
- Complex operations broken into named steps (see `fetchCategoryArticles()` with filter, fetch, validate steps)
- Component render functions: logic extracted to above component or sibling files

**Parameters:**
- Props objects for React components: `{ article }: ArticleCardProps`
- Named parameters for functions with multiple arguments
- Use object destructuring: `const { category, slug } = await params`
- Limit to 3-4 parameters; use objects for more

**Return Values:**
- Explicit return types: `Promise<Article[]>`, `Promise<string | null>`, `TocHeading[]`
- Consistent types: All branches return same type
- Async functions always return Promise: `async function fetchAll(): Promise<Article[]>`
- Null handling: `getTagDisplayName()` returns `Promise<string | null>` with explicit null check

**Arrow Functions vs Declarations:**
- Named exports use `export function Name()` (not arrow)
- Inline/callback functions use arrows: `articles.map((article) => ({ ... }))`
- Event handlers use arrows: `onChange={(e) => handleSearch(e.target.value)}`

## Module Design

**Exports:**
- Named exports for utility functions: `export function fetchCategoryArticles()`, `export function tagToSlug()`
- Named exports for components: `export function ArticleCard()`, `export function SearchBar()`
- Default exports for page components: `export default async function Home()`
- Type exports: `export type Category = ...`, `export const CATEGORIES = [...] as const`

**Organization:**
- One component per file (PascalCase file name)
- Utility functions grouped by domain: `lib/content.ts`, `lib/tags.ts`, `lib/github.ts`
- Schemas in dedicated directory: `src/lib/schemas/article.ts`
- Types in dedicated directory: `src/types/content.ts`

**Barrel Files:**
- Not used in this codebase (no `index.ts` exports)
- Import directly from files: `import { ArticleCard } from "@/components/ui/ArticleCard"`

## TypeScript

**Strict Mode:**
- Enabled: `"strict": true` in `tsconfig.json`
- All implicit `any` caught
- Null/undefined checks enforced

**Type Annotations:**
- Always annotate function parameters and return types
- React component props use interfaces: `interface ArticleCardProps { ... }`
- Avoid `any` except in error handling: `catch (error: any)`

**Type Inference:**
- Let TypeScript infer types for constants when obvious: `const categoryColors = { ... }`
- Explicit return type on functions with complex logic
- Use `z.infer<typeof Schema>` for Zod-derived types

## Async/Await

**Pattern:**
- Async functions always declared: `export async function fetchAll()`
- Await promises at point of use
- Parallel operations with `Promise.all()`: `const [allArticles, categories] = await Promise.all([...])`
- No mixing callback-based and promise-based async (all promise-based)

**Error Handling:**
- Wrap in try-catch blocks
- Re-throw errors after logging if appropriate
- Return empty array/null on expected errors (404, missing data)

## React Patterns

**Components:**
- Function declarations: `export function ArticleCard(props)`
- Props interface defined in file: `interface ArticleCardProps { ... }`
- Use `"use client"` directive for client components: `SearchBar.tsx`, `SearchResults.tsx`
- Server components (default) in `app/` directory pages

**Rendering:**
- Array rendering with explicit keys: `.map(item => <Component key={uniqueId} ... />)`
- Key format: logical identifier or index when unmutable: `key={`${article.category}-${article.slug}`}`
- JSX attributes on multiple lines when line exceeds 80 chars

**Hooks:**
- `useState()` for component state in client components
- `useRef()` for DOM references: `SearchBar.tsx` uses `inputRef`
- `useEffect()` with dependency arrays: `SearchResults.tsx` monitors `[query, articles]`
- Custom hooks: `useDebouncedCallback()` from `use-debounce` library

---

*Convention analysis: 2026-02-15*
