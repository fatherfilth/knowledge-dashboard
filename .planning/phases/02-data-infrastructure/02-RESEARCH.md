# Phase 2: Data Infrastructure - Research

**Researched:** 2026-02-14
**Domain:** GitHub API data fetching, frontmatter parsing, schema validation for static site generation
**Confidence:** HIGH

## Summary

Phase 2 requires fetching markdown files from a GitHub repository at build time, parsing their frontmatter, and validating the data against a schema. The standard approach combines Octokit (GitHub's official SDK) for API access, gray-matter for frontmatter parsing, and Zod for type-safe schema validation. These integrate seamlessly with Next.js 16's App Router Server Components pattern.

The technical challenge is straightforward: authenticated GitHub API requests prevent rate limiting (5,000 requests/hour vs 60 for unauthenticated), gray-matter handles complex YAML frontmatter reliably, and Zod provides both runtime validation and TypeScript type inference from a single schema definition. Next.js Server Components allow direct async/await data fetching at build time without additional APIs.

Build-time data fetching in Next.js occurs during `next build`, making all content available as static pages. Using environment variables for the GitHub token ensures secure authentication on Vercel without exposing secrets to the client bundle.

**Primary recommendation:** Use Octokit's `repos.getContent` with pagination for fetching, gray-matter for parsing, Zod for validation, and Next.js Server Components with async/await for build-time data loading.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| octokit | Latest (5.x+) | GitHub API SDK for Node.js | Official GitHub SDK, handles auth/rate limiting/pagination automatically |
| gray-matter | 4.0.3+ | YAML frontmatter parser | Battle-tested by Gatsby, Astro, VitePress - handles edge cases other parsers fail |
| zod | 3.x+ | TypeScript-first schema validation | Type inference from schemas, runtime validation, industry standard for TypeScript validation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @octokit/plugin-paginate-rest | Included in octokit | Pagination helper | Automatically included with main octokit package for iterating large result sets |
| @octokit/plugin-throttling | Optional | Rate limit handling | Optional enhancement for production-level rate limit management |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Octokit | Direct fetch to GitHub API | Manual auth/pagination/rate-limiting - significantly more code, error-prone |
| gray-matter | front-matter package | Less robust - fails on edge cases like code blocks containing frontmatter examples |
| Zod | Yup, io-ts, Valibot | Zod has best TypeScript integration and inference, largest ecosystem in 2026 |

**Installation:**
```bash
npm install octokit gray-matter zod
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/                    # Next.js App Router pages
├── lib/
│   ├── github.ts          # GitHub API client and fetch functions
│   ├── content.ts         # Content fetching and parsing logic
│   └── schemas/
│       └── article.ts     # Zod schemas for content validation
└── types/
    └── content.ts         # TypeScript types (inferred from Zod schemas)
```

### Pattern 1: GitHub API Client Initialization
**What:** Create a singleton Octokit instance with authentication
**When to use:** At the top of your GitHub integration module
**Example:**
```typescript
// Source: https://docs.github.com/en/rest/guides/scripting-with-the-rest-api-and-javascript
import { Octokit } from "octokit";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Configuration for the target repository
export const REPO_CONFIG = {
  owner: 'fatherfilth',
  repo: 'AI-Documentation-Library',
  path: 'docs',
} as const;
```

### Pattern 2: Fetching Repository Contents with Pagination
**What:** Use Octokit's pagination helpers to fetch all files from a directory
**When to use:** When fetching content from GitHub at build time
**Example:**
```typescript
// Source: https://michaelheap.com/octokit-pagination/
import { octokit, REPO_CONFIG } from './github';

export async function fetchAllMarkdownFiles(categoryPath: string) {
  const files: Array<{ path: string; content: string }> = [];

  // Fetch directory contents
  const { data } = await octokit.rest.repos.getContent({
    owner: REPO_CONFIG.owner,
    repo: REPO_CONFIG.repo,
    path: `${REPO_CONFIG.path}/${categoryPath}`,
  });

  // Filter for markdown files only
  const mdFiles = Array.isArray(data)
    ? data.filter(file => file.type === 'file' && file.name.endsWith('.md'))
    : [];

  // Fetch content for each file
  for (const file of mdFiles) {
    const { data: fileData } = await octokit.rest.repos.getContent({
      owner: REPO_CONFIG.owner,
      repo: REPO_CONFIG.repo,
      path: file.path,
    });

    if ('content' in fileData) {
      // Decode base64 content
      const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
      files.push({ path: file.path, content });
    }
  }

  return files;
}
```

### Pattern 3: Frontmatter Parsing with gray-matter
**What:** Parse YAML frontmatter and markdown content from files
**When to use:** After fetching raw markdown content from GitHub
**Example:**
```typescript
// Source: https://www.npmjs.com/package/gray-matter
import matter from 'gray-matter';

export function parseMarkdownFile(fileContent: string) {
  const { data, content } = matter(fileContent);

  return {
    frontmatter: data,
    content: content.trim(),
  };
}
```

### Pattern 4: Zod Schema Definition and Validation
**What:** Define schema for frontmatter, validate data, and infer TypeScript types
**When to use:** To ensure all content has required fields and correct types
**Example:**
```typescript
// Source: https://zod.dev/basics
import { z } from 'zod';

// Define schema
export const ArticleFrontmatterSchema = z.object({
  title: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  category: z.enum(['models', 'tools', 'skills', 'repos', 'agents', 'projects']),
  slug: z.string(),
  created: z.string(), // ISO date string
  updated: z.string(), // ISO date string
  author: z.string(),
  tags: z.array(z.string()),
});

// Infer TypeScript type from schema
export type ArticleFrontmatter = z.infer<typeof ArticleFrontmatterSchema>;

// Validate frontmatter
export function validateFrontmatter(data: unknown): ArticleFrontmatter {
  // Use safeParse for better error handling
  const result = ArticleFrontmatterSchema.safeParse(data);

  if (!result.success) {
    console.error('Frontmatter validation failed:', result.error.issues);
    throw new Error(`Invalid frontmatter: ${result.error.issues.map(i => i.message).join(', ')}`);
  }

  return result.data;
}
```

### Pattern 5: Next.js Server Component Data Fetching
**What:** Fetch and process data at build time in async Server Components
**When to use:** For pages that need to render static content from GitHub
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/getting-started/fetching-data
// In src/app/[category]/page.tsx

import { fetchAllMarkdownFiles } from '@/lib/content';
import { parseMarkdownFile, validateFrontmatter } from '@/lib/content';

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  // Fetch data at build time
  const files = await fetchAllMarkdownFiles(params.category);

  // Parse and validate
  const articles = files.map(file => {
    const { frontmatter, content } = parseMarkdownFile(file.content);
    const validatedFrontmatter = validateFrontmatter(frontmatter);

    return {
      ...validatedFrontmatter,
      content,
    };
  });

  return (
    <div>
      <h1>{params.category}</h1>
      {articles.map(article => (
        <article key={article.slug}>
          <h2>{article.title}</h2>
          <p>Status: {article.status}</p>
        </article>
      ))}
    </div>
  );
}

// Generate static paths for all categories
export function generateStaticParams() {
  return [
    { category: 'models' },
    { category: 'tools' },
    { category: 'skills' },
    { category: 'repos' },
    { category: 'agents' },
    { category: 'projects' },
  ];
}
```

### Pattern 6: Environment Variable Configuration
**What:** Securely store GitHub token for build-time access
**When to use:** Always - never hardcode tokens
**Example:**
```bash
# .env.local (local development)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx

# Vercel Project Settings > Environment Variables
# Add GITHUB_TOKEN for Production, Preview, and Development
# DO NOT use NEXT_PUBLIC_ prefix - this exposes to client
```

### Anti-Patterns to Avoid
- **Client-side GitHub fetching:** Never expose GitHub token to client - always fetch server-side
- **Unauthenticated requests:** Rate limit is 60/hour vs 5,000/hour authenticated
- **Using fetch() directly:** Octokit handles auth, pagination, rate limits, retry logic
- **Manual base64 decoding errors:** Always use Buffer.from(content, 'base64').toString('utf-8')
- **Parsing frontmatter with regex:** Fails on edge cases - use gray-matter
- **Runtime-only validation:** Use Zod schemas to infer types AND validate at build time
- **Exposing secrets with NEXT_PUBLIC_:** Only use for truly public env vars

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GitHub API client | Custom fetch wrapper with auth/retry/pagination | Octokit | Handles rate limiting, auto-retry, pagination, types, auth flows |
| Frontmatter parser | Regex-based YAML extraction | gray-matter | Handles edge cases (code blocks with frontmatter, custom delimiters, TOML/JSON) |
| Data validation | Manual type checking and assertions | Zod | Type inference, detailed errors, async validation, composable schemas |
| Pagination | Manual "next page" loop | Octokit's paginate.iterator() | Memory efficient, handles GitHub's link headers, automatic termination |
| Base64 decoding | Custom decoder or atob() | Buffer.from(content, 'base64') | Node.js built-in, handles encoding properly |
| Rate limit handling | Sleep timers and counters | Octokit with throttling plugin | Respects X-RateLimit headers, implements exponential backoff |

**Key insight:** GitHub API integration has many edge cases (pagination cursors, rate limit windows, base64 encoding, retry logic). Octokit encapsulates 10+ years of community knowledge. Frontmatter parsing seems simple but fails on nested structures, code examples, and format variations. These libraries prevent days of debugging edge cases.

## Common Pitfalls

### Pitfall 1: Unauthenticated API Requests Hitting Rate Limits
**What goes wrong:** Build fails with "API rate limit exceeded" error after ~60 requests
**Why it happens:** GitHub limits unauthenticated requests to 60/hour, but authenticated requests get 5,000/hour
**How to avoid:** Always provide GITHUB_TOKEN environment variable and initialize Octokit with auth
**Warning signs:** Build succeeds locally but fails in CI/Vercel, error message mentions rate limiting

### Pitfall 2: GitHub API Returns Base64-Encoded Content
**What goes wrong:** Markdown content appears as garbled base64 string instead of readable text
**Why it happens:** GitHub API's repos.getContent returns file content as base64-encoded string in the `content` field
**How to avoid:** Always decode with `Buffer.from(fileData.content, 'base64').toString('utf-8')`
**Warning signs:** Content looks like "IyMgVGl0bGUKClRoaXMgaXMgY29udGVudC4=" instead of markdown

### Pitfall 3: Type Narrowing for repos.getContent Response
**What goes wrong:** TypeScript errors saying `content` property doesn't exist on response
**Why it happens:** repos.getContent can return file OR directory, TypeScript union type doesn't guarantee `content` field
**How to avoid:** Check `'content' in fileData` before accessing, or filter by `type === 'file'` first
**Warning signs:** TypeScript error "Property 'content' does not exist on type..."

### Pitfall 4: Not Excluding Template/Index Directories
**What goes wrong:** Build attempts to parse non-content files from docs/_templates/ or docs/_index/, causing validation errors
**Why it happens:** Fetching all files from /docs/ includes directories meant for documentation structure, not content
**How to avoid:** Filter paths to exclude files starting with `docs/_templates/` or `docs/_index/`
**Warning signs:** Validation errors on files that aren't actual articles, unexpected file count

### Pitfall 5: Frontmatter Validation Fails Silently
**What goes wrong:** Invalid frontmatter data passes through, causing runtime errors later
**Why it happens:** Using Zod's `.parse()` throws errors that may be caught and ignored, or using unsafe parsing without checking results
**How to avoid:** Use `.safeParse()` and explicitly check `result.success`, log detailed error info from `result.error.issues`
**Warning signs:** Missing or mistyped data in rendered pages, TypeScript showing correct types but runtime having wrong values

### Pitfall 6: Environment Variables Not Available at Build Time
**What goes wrong:** GitHub API requests fail with authentication errors or missing token
**Why it happens:** Vercel environment variables need to be exposed to build step, not just runtime
**How to avoid:** In Vercel project settings, ensure GITHUB_TOKEN is checked for "Production", "Preview", and "Development" environments
**Warning signs:** Local build works but Vercel deployment fails, error logs show "Bad credentials" or undefined token

### Pitfall 7: Fetching Large Directories Without Pagination
**What goes wrong:** Only first 30 items returned, missing content files
**Why it happens:** GitHub API paginates results, default page size is 30 items
**How to avoid:** Use `octokit.paginate.iterator()` or `octokit.paginate()` for directories with many files, or set `per_page: 100`
**Warning signs:** Inconsistent number of articles, missing recent files, exactly 30 items returned

### Pitfall 8: NEXT_PUBLIC_ Prefix Exposing Secrets
**What goes wrong:** GitHub token exposed in client-side JavaScript bundle, security risk
**Why it happens:** Environment variables with NEXT_PUBLIC_ prefix are inlined into client bundle at build time
**How to avoid:** Never use NEXT_PUBLIC_GITHUB_TOKEN - tokens should only be accessed server-side
**Warning signs:** Token visible in browser DevTools Network tab or page source

### Pitfall 9: Hardcoding Repository Structure Assumptions
**What goes wrong:** Code breaks when repository structure changes (new category added, renamed folder)
**Why it happens:** Category names hardcoded in multiple places instead of fetched dynamically or centralized
**How to avoid:** Fetch category list dynamically from GitHub, or centralize in a config constant that's reused
**Warning signs:** Need to update code in multiple files when content structure changes

### Pitfall 10: Zod Schema Mismatch with Actual Frontmatter
**What goes wrong:** Build-time validation errors on valid content files
**Why it happens:** Schema defines required fields that content doesn't have, or wrong types
**How to avoid:** Review actual frontmatter from repository first, use `.optional()` for non-critical fields, match exact field names
**Warning signs:** Validation errors on otherwise correct-looking frontmatter, "Required" errors on fields that seem optional

## Code Examples

Verified patterns from official sources:

### Complete Content Fetching Flow
```typescript
// lib/github.ts
import { Octokit } from "octokit";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export const REPO_CONFIG = {
  owner: 'fatherfilth',
  repo: 'AI-Documentation-Library',
  basePath: 'docs',
  excludePaths: ['docs/_templates', 'docs/_index'],
  categories: ['models', 'tools', 'skills', 'repos', 'agents', 'projects'] as const,
} as const;

// lib/schemas/article.ts
import { z } from 'zod';

export const ArticleFrontmatterSchema = z.object({
  title: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  category: z.enum(['models', 'tools', 'skills', 'repos', 'agents', 'projects']),
  slug: z.string(),
  created: z.string(),
  updated: z.string(),
  author: z.string(),
  tags: z.array(z.string()),
});

export type ArticleFrontmatter = z.infer<typeof ArticleFrontmatterSchema>;

// lib/content.ts
import matter from 'gray-matter';
import { octokit, REPO_CONFIG } from './github';
import { ArticleFrontmatterSchema, type ArticleFrontmatter } from './schemas/article';

export async function fetchCategoryArticles(category: string) {
  const articles: Array<ArticleFrontmatter & { content: string }> = [];

  // Fetch directory contents
  const { data } = await octokit.rest.repos.getContent({
    owner: REPO_CONFIG.owner,
    repo: REPO_CONFIG.repo,
    path: `${REPO_CONFIG.basePath}/${category}`,
  });

  if (!Array.isArray(data)) {
    throw new Error(`Expected directory, got file: ${category}`);
  }

  // Filter markdown files, exclude templates
  const mdFiles = data.filter(file => {
    if (file.type !== 'file' || !file.name.endsWith('.md')) return false;
    return !REPO_CONFIG.excludePaths.some(exclude => file.path.startsWith(exclude));
  });

  // Fetch and parse each file
  for (const file of mdFiles) {
    const { data: fileData } = await octokit.rest.repos.getContent({
      owner: REPO_CONFIG.owner,
      repo: REPO_CONFIG.repo,
      path: file.path,
    });

    // Type guard for file content
    if (!('content' in fileData)) continue;

    // Decode base64 content
    const rawContent = Buffer.from(fileData.content, 'base64').toString('utf-8');

    // Parse frontmatter
    const { data: frontmatter, content } = matter(rawContent);

    // Validate with Zod
    const result = ArticleFrontmatterSchema.safeParse(frontmatter);

    if (!result.success) {
      console.error(`Validation failed for ${file.path}:`, result.error.issues);
      continue; // Skip invalid files
    }

    articles.push({
      ...result.data,
      content: content.trim(),
    });
  }

  return articles;
}

export async function fetchAllArticles() {
  const allArticles = await Promise.all(
    REPO_CONFIG.categories.map(category => fetchCategoryArticles(category))
  );

  return allArticles.flat();
}
```

### Parallel Data Fetching in Server Component
```typescript
// Source: https://nextjs.org/docs/app/getting-started/fetching-data
// app/page.tsx

import { fetchAllArticles } from '@/lib/content';
import { REPO_CONFIG } from '@/lib/github';

export default async function HomePage() {
  // Fetch all categories in parallel
  const [models, tools, skills, repos, agents, projects] = await Promise.all([
    fetchCategoryArticles('models'),
    fetchCategoryArticles('tools'),
    fetchCategoryArticles('skills'),
    fetchCategoryArticles('repos'),
    fetchCategoryArticles('agents'),
    fetchCategoryArticles('projects'),
  ]);

  return (
    <main>
      <h1>Knowledge Dashboard</h1>
      <section>
        <h2>Models ({models.length})</h2>
        {/* Render articles */}
      </section>
      {/* More sections */}
    </main>
  );
}
```

### Error Handling with Zod
```typescript
// Source: https://zod.dev/basics
import { ArticleFrontmatterSchema } from './schemas/article';

function validateWithDetailedErrors(frontmatter: unknown, filepath: string) {
  const result = ArticleFrontmatterSchema.safeParse(frontmatter);

  if (!result.success) {
    // Format errors for logging
    const errors = result.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));

    console.error(`Frontmatter validation failed for ${filepath}:`);
    console.table(errors);

    throw new Error(`Invalid frontmatter in ${filepath}`);
  }

  return result.data;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| getStaticProps/getStaticPaths | Async Server Components + generateStaticParams | Next.js 13 (2022) | Simpler syntax, better co-location, automatic fetch deduplication |
| Manual fetch caching | Built-in fetch cache with revalidate | Next.js 13 (2022) | Explicit cache control, ISR support |
| @octokit/rest | octokit (unified package) | 2021+ | Single package includes REST, GraphQL, App, all plugins |
| fetch() defaults to cache | fetch() defaults to no-cache | Next.js 15 (2024) | More predictable, explicit caching required |
| Sync dynamic APIs | Async dynamic APIs (params, searchParams) | Next.js 15 (2024) | More consistent async model |

**Deprecated/outdated:**
- **getStaticProps/getStaticPaths:** Still works in Pages Router, but App Router uses async components and generateStaticParams
- **@octokit/rest package:** Replaced by unified `octokit` package that includes all functionality
- **API routes for data fetching:** Not needed with Server Components - fetch directly in components
- **SWR/React Query for build data:** Build-time fetching doesn't need client-side data libraries

## Open Questions

1. **Incremental Static Regeneration (ISR) for content updates**
   - What we know: Next.js supports ISR with revalidate option, allows updating static pages without rebuild
   - What's unclear: Whether user wants ISR (auto-updates) or manual redeployment (full control)
   - Recommendation: Start without ISR (fully static), can add `revalidate: 3600` (1 hour) later if needed

2. **GraphQL vs REST API for GitHub**
   - What we know: GitHub supports both REST and GraphQL, Octokit includes both clients
   - What's unclear: Whether fetching many small files benefits from GraphQL's batching
   - Recommendation: Use REST API (repos.getContent) - simpler, well-documented, sufficient for this use case

3. **Caching strategy for development**
   - What we know: Fetching all files on every dev server restart is slow
   - What's unclear: Whether to implement local caching during development
   - Recommendation: Accept slower dev builds initially, can add filesystem cache if it becomes painful

4. **Handling malformed or missing frontmatter**
   - What we know: Zod validation will catch errors
   - What's unclear: Should build fail on any validation error, or skip invalid files?
   - Recommendation: Log errors but continue build, skip invalid files - prevents one bad file breaking entire site

## Sources

### Primary (HIGH confidence)
- [GitHub Docs: Scripting with REST API and JavaScript](https://docs.github.com/en/rest/guides/scripting-with-the-rest-api-and-javascript) - Octokit authentication and usage
- [GitHub Docs: Rate Limits for REST API](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) - Rate limiting details and best practices
- [Next.js Docs: Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data) - Server Components async data fetching
- [Next.js Docs: Incremental Static Regeneration](https://nextjs.org/docs/app/guides/incremental-static-regeneration) - ISR and revalidation strategies
- [Zod Docs: Basic Usage](https://zod.dev/basics) - Schema definition, validation, type inference
- [npm: gray-matter](https://www.npmjs.com/package/gray-matter) - Frontmatter parsing library

### Secondary (MEDIUM confidence)
- [Octokit Pagination Guide](https://michaelheap.com/octokit-pagination/) - Practical pagination patterns
- [GitHub: octokit/octokit.js](https://github.com/octokit/octokit.js/) - Official repository and examples
- [OneUpTime: Zod Validation in TypeScript](https://oneuptime.com/blog/post/2026-01-25-zod-validation-typescript/view) - 2026 Zod best practices
- [Next.js 15 Advanced Patterns 2026](https://johal.in/next-js-15-advanced-patterns-app-router-server-actions-and-caching-strategies-for-2026/) - Current App Router patterns
- [GitHub Discussions: Best Practices for Rate Limits](https://github.com/orgs/community/discussions/151675) - Community rate limit strategies

### Tertiary (LOW confidence)
- [zod-matter library](https://github.com/HiDeoo/zod-matter) - Specialized library combining Zod + gray-matter (not needed but shows pattern)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) - Similar pattern in different framework (validates approach)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Octokit is official GitHub SDK, gray-matter is industry standard (used by Gatsby, Astro, VitePress), Zod is current TypeScript validation leader
- Architecture: HIGH - Next.js 15/16 Server Components documented, verified with official docs
- Pitfalls: MEDIUM-HIGH - Rate limiting, base64 encoding, type narrowing verified from official docs; template exclusion and environment variables based on common patterns
- Code examples: HIGH - All examples based on official documentation patterns, adapted for specific use case

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (30 days) - Stable ecosystem, Next.js and libraries have predictable release cycles
