# Architecture Patterns

**Domain:** Next.js Markdown-Based Knowledge Dashboard
**Researched:** 2026-02-14
**Confidence:** HIGH (based on Next.js documentation patterns and MDX remote ecosystem)

## Recommended Architecture

This architecture follows the **Content-as-Data** pattern where markdown files are treated as a data source, fetched at build time, parsed into structured data, and rendered through reusable components.

```
┌─────────────────────────────────────────────────────────────┐
│                     External Data Source                     │
│          GitHub API (fatherfilth/AI-Documentation-Library)   │
│                    docs/<category>/<slug>.md                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Build Time Fetch
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Fetching Layer                        │
│  - lib/github.ts: GitHub API client                         │
│  - lib/content.ts: Content aggregation & parsing            │
│  - Uses: gray-matter (frontmatter), next-mdx-remote (MDX)   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Static Props / Params
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                      Routing Layer                           │
│  - app/page.tsx: Homepage (all categories)                  │
│  - app/[category]/page.tsx: Category listings               │
│  - app/[category]/[slug]/page.tsx: Article reader           │
│  - app/search/page.tsx: Search results (optional)           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Props
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  - components/ArticleCard.tsx: Listing cards                │
│  - components/ArticleReader.tsx: Full article view          │
│  - components/CategoryNav.tsx: Navigation                   │
│  - components/SearchBar.tsx: Search interface               │
│  - components/MDXComponents.tsx: Custom MDX components      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ User Interaction
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   Client-Side Features                       │
│  - lib/search.ts: Fuse.js search implementation             │
│  - hooks/useSearch.ts: Search state management              │
│  - Client components: Interactive filtering, search         │
└─────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With | Type |
|-----------|---------------|-------------------|------|
| **GitHub API Client** | Fetch raw markdown files from external repo | GitHub API, Content Parser | Server-only |
| **Content Parser** | Parse frontmatter, validate schema, aggregate content | GitHub Client, Route Handlers | Server-only |
| **Route Handlers (App Router)** | Generate static pages, provide props | Content Parser, React Components | Server-first |
| **Article Card** | Display article metadata in listings | Category Page, Search Results | React Component |
| **Article Reader** | Render full MDX content with styling | Article Page, MDX Components | React Component |
| **Category Navigation** | Filter/navigate between categories | All pages | React Component |
| **Search System** | Client-side fuzzy search across content | Search Bar, Search Results | Client Component |
| **MDX Components** | Custom rendering for markdown elements | Article Reader, MDX Remote | React Component |

### Data Flow

**Build Time (Static Generation):**

```
1. GitHub API → Fetch all markdown files
   ├─ GET /repos/fatherfilth/AI-Documentation-Library/contents/docs/{category}
   └─ For each file: GET raw content

2. Content Parser → Transform raw markdown
   ├─ gray-matter.parse() → Extract frontmatter + content
   ├─ Validate schema (title, status, category, slug, etc.)
   ├─ Aggregate by category
   └─ Generate metadata index

3. Static Generation → Pre-render pages
   ├─ generateStaticParams() → Create all routes
   ├─ Pass parsed data as props
   └─ next-mdx-remote/rsc → Serialize MDX

4. Build Output → Static HTML + JSON
   ├─ HTML for each page
   ├─ Search index (JSON) for client-side search
   └─ Incremental Static Regeneration cache (optional)
```

**Runtime (User Navigation):**

```
User Request → Next.js Router → Static HTML/JSON → Hydration
                                                    │
                                                    ▼
                                Client-side Features
                                ├─ Search (Fuse.js)
                                ├─ Filtering
                                └─ Navigation
```

**Search Data Flow:**

```
Build Time:
  Content Parser → Generate search index
                   ├─ Extract: title, tags, category, content excerpt
                   └─ Output: public/search-index.json

Runtime:
  SearchBar (client) → Load search-index.json
                       ├─ Initialize Fuse.js
                       ├─ User types → fuzzy search
                       └─ Return ranked results
```

### File Structure

```
knowledge-dashboard/
├─ app/                              # Next.js App Router
│  ├─ layout.tsx                     # Root layout (nav, fonts, metadata)
│  ├─ page.tsx                       # Homepage (category grid)
│  ├─ [category]/
│  │  ├─ page.tsx                    # Category listing page
│  │  └─ [slug]/
│  │     └─ page.tsx                 # Article reader page
│  └─ search/
│     └─ page.tsx                    # Search results (optional dedicated page)
│
├─ components/                       # React components
│  ├─ ArticleCard.tsx                # Card display for listings
│  ├─ ArticleReader.tsx              # Full article renderer
│  ├─ CategoryNav.tsx                # Category navigation
│  ├─ SearchBar.tsx                  # Search input (client component)
│  ├─ SearchResults.tsx              # Search results display
│  ├─ MDXComponents.tsx              # Custom MDX component overrides
│  ├─ StatusBadge.tsx                # Status indicator (in-progress/complete/stable)
│  └─ TagList.tsx                    # Tag display component
│
├─ lib/                              # Core logic
│  ├─ github.ts                      # GitHub API client
│  ├─ content.ts                     # Content fetching & parsing
│  ├─ search.ts                      # Search index generation & Fuse.js wrapper
│  └─ types.ts                       # TypeScript types
│
├─ hooks/                            # React hooks
│  └─ useSearch.ts                   # Search state management
│
├─ public/                           # Static assets
│  └─ search-index.json              # Generated search index (build output)
│
├─ styles/                           # Tailwind & globals
│  └─ globals.css                    # Tailwind imports, custom styles
│
└─ next.config.js                    # Next.js configuration
```

## Patterns to Follow

### Pattern 1: Server-First Data Fetching

**What:** Fetch and parse all content at build time, not runtime.

**When:** Always for static content from external GitHub repo.

**Why:**
- No runtime API calls → faster page loads
- No rate limiting concerns at user request time
- Better SEO with fully rendered HTML
- Cheaper (no serverless function invocations per request)

**Implementation:**

```typescript
// lib/content.ts
import matter from 'gray-matter';

export async function getAllArticles(category?: string) {
  const files = await fetchFromGitHub(category);

  return files.map(file => {
    const { data, content } = matter(file.content);

    return {
      frontmatter: data as Frontmatter,
      content,
      slug: file.name.replace('.md', '')
    };
  });
}

// app/[category]/page.tsx
export async function generateStaticParams() {
  const categories = ['models', 'tools', 'skills', 'repos', 'agents', 'projects'];
  return categories.map(category => ({ category }));
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const articles = await getAllArticles(params.category);

  return <ArticleGrid articles={articles} />;
}
```

### Pattern 2: Separation of Data & Presentation

**What:** Keep data fetching logic separate from UI components.

**When:** Always.

**Why:**
- Components stay testable
- Data layer can be swapped (GitHub → CMS → local files)
- Easier to add caching, validation, transformation

**Implementation:**

```typescript
// lib/content.ts — Data layer
export async function getArticleBySlug(category: string, slug: string) {
  const file = await fetchFileFromGitHub(`docs/${category}/${slug}.md`);
  const { data, content } = matter(file);
  return { frontmatter: data, content };
}

// app/[category]/[slug]/page.tsx — Route layer
export default async function ArticlePage({ params }) {
  const article = await getArticleBySlug(params.category, params.slug);
  return <ArticleReader article={article} />;
}

// components/ArticleReader.tsx — Presentation layer
export function ArticleReader({ article }) {
  return (
    <article>
      <h1>{article.frontmatter.title}</h1>
      <MDXRemote source={article.content} />
    </article>
  );
}
```

### Pattern 3: Client-Server Boundary for Search

**What:** Generate search index at build time, search on client.

**When:** For fuzzy search across all content.

**Why:**
- No backend search infrastructure needed
- Instant results (no network latency)
- Works offline after page load
- Scales to thousands of articles

**Implementation:**

```typescript
// lib/search.ts — Build time index generation
export async function generateSearchIndex() {
  const allArticles = await getAllArticles();

  const searchIndex = allArticles.map(article => ({
    title: article.frontmatter.title,
    category: article.frontmatter.category,
    tags: article.frontmatter.tags,
    excerpt: article.content.slice(0, 200),
    slug: article.slug,
  }));

  // Write to public/search-index.json
  await fs.writeFile(
    path.join(process.cwd(), 'public/search-index.json'),
    JSON.stringify(searchIndex)
  );
}

// hooks/useSearch.ts — Client-side search
'use client';
import Fuse from 'fuse.js';

export function useSearch() {
  const [index, setIndex] = useState<SearchIndex[]>([]);
  const [fuse, setFuse] = useState<Fuse<SearchIndex>>();

  useEffect(() => {
    fetch('/search-index.json')
      .then(res => res.json())
      .then(data => {
        setIndex(data);
        setFuse(new Fuse(data, {
          keys: ['title', 'tags', 'excerpt'],
          threshold: 0.3,
        }));
      });
  }, []);

  const search = (query: string) => {
    if (!fuse) return [];
    return fuse.search(query).map(result => result.item);
  };

  return { search, index };
}
```

### Pattern 4: Incremental Static Regeneration (ISR)

**What:** Optionally revalidate static pages after N seconds.

**When:** If content updates frequently but full rebuild is too slow.

**Why:**
- Keep fast static generation benefits
- Content stays reasonably fresh
- No need for manual rebuilds

**Implementation:**

```typescript
// app/[category]/[slug]/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function ArticlePage({ params }) {
  const article = await getArticleBySlug(params.category, params.slug);
  return <ArticleReader article={article} />;
}
```

**Trade-off:** Complexity vs freshness. For personal knowledge base updated manually, probably unnecessary. For frequently updated docs, very useful.

### Pattern 5: MDX Component Customization

**What:** Override default markdown rendering with custom components.

**When:** Need branded styling, special behavior (e.g., code blocks with copy button).

**Why:**
- Consistent design system
- Enhanced functionality beyond basic markdown
- Better accessibility

**Implementation:**

```typescript
// components/MDXComponents.tsx
import { MDXComponents } from 'mdx/types';

export const mdxComponents: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="text-4xl font-bold mb-4 text-gray-900">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-3xl font-semibold mb-3 mt-8 text-gray-800">{children}</h2>
  ),
  code: ({ children, className }) => {
    const language = className?.replace('language-', '');
    return <CodeBlock code={children} language={language} />;
  },
  a: ({ href, children }) => (
    <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener">
      {children}
    </a>
  ),
};

// app/[category]/[slug]/page.tsx
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/MDXComponents';

export default async function ArticlePage({ params }) {
  const article = await getArticleBySlug(params.category, params.slug);

  return (
    <article>
      <MDXRemote source={article.content} components={mdxComponents} />
    </article>
  );
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Runtime GitHub API Calls

**What:** Fetching markdown from GitHub on every page request.

**Why bad:**
- Slow page loads (network latency + GitHub API)
- GitHub API rate limits (60 req/hour unauthenticated, 5000/hour authenticated)
- Unnecessary serverless function costs
- Poor SEO (content not in initial HTML)

**Instead:** Use build-time static generation with `generateStaticParams()` and async Server Components.

**Detection:** If you see `fetch()` calls in page components or `useEffect()` for content fetching, you're doing it wrong.

### Anti-Pattern 2: Client-Side Markdown Parsing

**What:** Sending raw markdown to browser and parsing with gray-matter/MDX client-side.

**Why bad:**
- Larger bundle size (gray-matter + MDX parser ~100KB+)
- Slower initial render (parsing on main thread)
- Content not in HTML (bad for SEO)

**Instead:** Parse at build time, send only serialized MDX result.

**Detection:** If `gray-matter` or MDX parsing appears in client components, refactor to server.

### Anti-Pattern 3: Prop Drilling for Global Data

**What:** Passing categories list, navigation data through every component.

**Why bad:**
- Verbose, hard to maintain
- Couples components to parent structure

**Instead:** Use React Context for global app data (categories, site config) or fetch in layout components.

```typescript
// app/layout.tsx
export default async function RootLayout({ children }) {
  const categories = await getCategories();

  return (
    <html>
      <body>
        <CategoryNav categories={categories} />
        {children}
      </body>
    </html>
  );
}
```

### Anti-Pattern 4: Mixing Server and Client State

**What:** Trying to use client-side state (useState, useContext) in async Server Components.

**Why bad:**
- Won't work (React Server Components don't support client hooks)
- Confusion about where code runs

**Instead:** Clear separation:
- Server Components: Data fetching, static rendering
- Client Components: Interactivity (search, filters, modals)

**Detection:** "You're importing a component that needs X. It only works in a Client Component..." errors.

### Anti-Pattern 5: Overfetching Content

**What:** Loading full article content for listing pages.

**Why bad:**
- Slower builds
- Unnecessary data transfer
- Memory issues with large content repos

**Instead:** Create optimized queries for different views.

```typescript
// lib/content.ts
export async function getAllArticlesMetadata(category?: string) {
  const files = await fetchFromGitHub(category);

  return files.map(file => {
    const { data } = matter(file.content); // Parse frontmatter only
    return {
      frontmatter: data,
      slug: file.name.replace('.md', '')
      // Don't include content for listings
    };
  });
}

export async function getArticleBySlug(category: string, slug: string) {
  const file = await fetchFileFromGitHub(`docs/${category}/${slug}.md`);
  const { data, content } = matter(file); // Include content for reader
  return { frontmatter: data, content };
}
```

## Suggested Build Order

Building in this order minimizes rework and allows early validation:

### Phase 1: Data Foundation (No UI yet)

**Why first:** Everything depends on data layer. Validate GitHub access, parsing, schema.

1. **GitHub API client** (`lib/github.ts`)
   - Fetch files from external repo
   - Handle authentication (personal access token)
   - Error handling, rate limiting

2. **Content parser** (`lib/content.ts`)
   - gray-matter integration
   - Frontmatter schema validation
   - Type definitions (`lib/types.ts`)

3. **Test data fetching** (console log results)
   - Verify all categories accessible
   - Check frontmatter parses correctly
   - Validate schema matches expectations

**Validation:** Can you fetch and parse all markdown files?

### Phase 2: Basic Routing & Static Generation

**Why second:** Proves Next.js can generate pages from your data.

4. **Minimal page structure**
   - `app/page.tsx` (homepage - just list categories)
   - `app/[category]/page.tsx` (list articles as JSON for now)
   - `app/[category]/[slug]/page.tsx` (show raw markdown)

5. **Static params generation**
   - `generateStaticParams()` for categories
   - `generateStaticParams()` for category + slug combinations
   - Test: `npm run build` — does it generate all pages?

**Validation:** Does `npm run build` succeed? Can you navigate to `/models`, `/models/gpt-4`?

### Phase 3: Article Reader (Core Feature)

**Why third:** The most important feature. Validates MDX rendering.

6. **MDX Remote integration**
   - `next-mdx-remote/rsc` setup
   - Basic MDX components (`components/MDXComponents.tsx`)
   - Article reader layout (`components/ArticleReader.tsx`)

7. **Article page styling**
   - Typography (headings, paragraphs, lists)
   - Code blocks
   - Links, images

**Validation:** Articles render correctly with proper formatting?

### Phase 4: Listings & Navigation

**Why fourth:** Now that articles work, make them discoverable.

8. **Article card component**
   - Display title, status, tags, dates
   - Link to article page
   - Status badge component

9. **Category page**
   - Grid of article cards
   - Filter by status (optional)

10. **Navigation**
    - Category nav component
    - Homepage category grid
    - Breadcrumbs

**Validation:** Can you browse from homepage → category → article → back?

### Phase 5: Search

**Why fifth:** Enhancement, not core functionality. Requires full content index.

11. **Search index generation**
    - Build-time script
    - Generate `public/search-index.json`
    - Integrate into build process

12. **Client-side search**
    - Fuse.js integration
    - `useSearch` hook
    - SearchBar component (client)
    - Search results display

**Validation:** Can you search and find articles?

### Phase 6: Polish & Optimization

**Why last:** Now that everything works, make it better.

13. **Metadata & SEO**
    - Dynamic Open Graph images
    - Sitemap generation
    - robots.txt

14. **Performance optimization**
    - Image optimization
    - Font optimization
    - Bundle analysis

15. **Error handling**
    - 404 pages
    - Error boundaries
    - Loading states

**Validation:** Lighthouse score, Vercel deployment success.

## Scalability Considerations

| Concern | At 100 Articles | At 1,000 Articles | At 10,000 Articles |
|---------|----------------|-------------------|-------------------|
| **Build Time** | <1 min (all static) | 2-5 min (consider ISR for some pages) | 10-30 min (definitely use ISR, or switch to on-demand generation for rarely viewed pages) |
| **Search** | Client-side Fuse.js (< 100KB index) | Client-side Fuse.js (< 1MB index, still fine) | Consider server-side search (Algolia, Meilisearch) or lazy-load search index |
| **GitHub API** | Single build fetch OK | May hit rate limits on frequent builds, use caching | Need local cache/mirror of content repo |
| **Memory** | No issues | No issues | May need streaming/chunked processing during build |
| **Bundle Size** | No issues | Watch for MDX component tree-shaking | Critical |

**Recommendation for this project (starting small):**

- **Phase 1-2:** Pure static generation, no ISR
- **Phase 3:** Add ISR if rebuild times become annoying (>5 min)
- **Future:** If search index >2MB, lazy-load it or move to server search

## Caching Strategy

### Build-Time Caching

```typescript
// lib/github.ts
const cache = new Map<string, any>();

export async function fetchWithCache(url: string) {
  if (cache.has(url)) {
    return cache.get(url);
  }

  const response = await fetch(url);
  const data = await response.json();
  cache.set(url, data);

  return data;
}
```

**When:** During local development to avoid redundant GitHub API calls.

**Not needed:** In production builds (only runs once per deploy).

### Runtime Caching

Next.js automatically caches:
- Static pages (served from CDN)
- `fetch()` results in Server Components (automatic request memoization)

You don't need to manually cache unless doing client-side data fetching (which you shouldn't be).

## Error Handling Strategy

### Build-Time Errors (Critical)

```typescript
// lib/content.ts
export async function getAllArticles(category: string) {
  try {
    const files = await fetchFromGitHub(category);
    return files.map(file => parseArticle(file));
  } catch (error) {
    console.error(`Failed to fetch ${category}:`, error);

    // Fail build — don't deploy broken site
    throw new Error(`Content fetch failed for category: ${category}`);
  }
}
```

**Philosophy:** If content doesn't load, build should fail. Don't deploy a broken site.

### Runtime Errors (Graceful)

```typescript
// app/[category]/[slug]/page.tsx
export default async function ArticlePage({ params }) {
  const article = await getArticleBySlug(params.category, params.slug);

  if (!article) {
    notFound(); // Next.js built-in 404
  }

  return <ArticleReader article={article} />;
}

// app/not-found.tsx
export default function NotFound() {
  return <div>Article not found</div>;
}
```

### Search Errors (Silent Fallback)

```typescript
// hooks/useSearch.ts
useEffect(() => {
  fetch('/search-index.json')
    .then(res => res.json())
    .then(data => setIndex(data))
    .catch(error => {
      console.error('Search index failed to load:', error);
      // Silently degrade — search just won't work
      // Could show message: "Search unavailable"
    });
}, []);
```

**Philosophy:** Search is enhancement. If it fails, site should still work.

## Deployment Considerations

### Vercel (Recommended for Next.js)

**Why:**
- Zero-config Next.js deployment
- Automatic HTTPS, CDN
- ISR support built-in
- Preview deployments for branches

**Configuration:**

```javascript
// next.config.js
module.exports = {
  output: 'standalone', // Optimized for Vercel

  env: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN, // Set in Vercel dashboard
    GITHUB_REPO: 'fatherfilth/AI-Documentation-Library',
  },
};
```

**Environment Variables (Vercel Dashboard):**
- `GITHUB_TOKEN`: Personal access token for API (increases rate limit to 5000/hour)

### Build Triggers

**Option 1: Manual rebuilds**
- Push to main branch → Vercel auto-deploys
- Update docs repo → manually trigger rebuild in Vercel

**Option 2: Webhook automation**
- GitHub Action in docs repo
- On push to main → POST to Vercel deploy hook
- Automatic rebuilds when content changes

```yaml
# In fatherfilth/AI-Documentation-Library/.github/workflows/deploy.yml
name: Trigger Dashboard Rebuild
on:
  push:
    branches: [main]
    paths: ['docs/**']

jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Vercel Deploy
        run: |
          curl -X POST ${{ secrets.VERCEL_DEPLOY_HOOK }}
```

## Monitoring & Observability

### Build Health

- Vercel build logs — check for GitHub API failures
- Build time trends — watch for slowdowns as content grows

### Runtime Health

- Vercel Analytics — page views, performance
- Error tracking (optional: Sentry) — catch client-side errors

### Content Health

- Frontmatter validation during build
- Missing fields → build warning or error
- Broken links detection (future enhancement)

## Dependencies Overview

| Library | Purpose | Alternatives Considered | Why This One |
|---------|---------|------------------------|--------------|
| `gray-matter` | Parse YAML frontmatter | `front-matter`, manual regex | Industry standard, robust, 8M+ weekly downloads |
| `next-mdx-remote` | Render MDX in Next.js | `@next/mdx`, `mdx-bundler` | Built for Next.js App Router, RSC support, official recommendation |
| `fuse.js` | Client-side fuzzy search | `flexsearch`, `lunr.js` | Best balance of features/size, typo tolerance |
| `tailwindcss` | Styling | CSS modules, styled-components | Utility-first, fast, great for dashboards |
| `octokit` (optional) | GitHub API client | `fetch` directly | Type-safe, handles auth/pagination, but adds bundle size — consider trade-off |

**Recommendation:** Start with `fetch` for GitHub API. Add `octokit` if you need pagination, advanced queries, or better error handling.

## Type Safety

```typescript
// lib/types.ts
export interface Frontmatter {
  title: string;
  status: 'in-progress' | 'complete' | 'stable';
  category: 'models' | 'tools' | 'skills' | 'repos' | 'agents' | 'projects';
  slug: string;
  created: string; // ISO date
  updated: string; // ISO date
  author: string;
  tags: string[];
}

export interface Article {
  frontmatter: Frontmatter;
  content: string;
  slug: string;
}

export interface SearchIndexEntry {
  title: string;
  category: string;
  tags: string[];
  excerpt: string;
  slug: string;
  url: string;
}
```

**Validation at build time:**

```typescript
// lib/content.ts
import { z } from 'zod';

const FrontmatterSchema = z.object({
  title: z.string(),
  status: z.enum(['in-progress', 'complete', 'stable']),
  category: z.enum(['models', 'tools', 'skills', 'repos', 'agents', 'projects']),
  slug: z.string(),
  created: z.string(),
  updated: z.string(),
  author: z.string(),
  tags: z.array(z.string()),
});

export function parseArticle(file: string): Article {
  const { data, content } = matter(file);

  // Validate schema — throws if invalid
  const frontmatter = FrontmatterSchema.parse(data);

  return {
    frontmatter,
    content,
    slug: frontmatter.slug,
  };
}
```

**Why:** Catch schema errors at build time, not runtime. Bad frontmatter = build fails = don't deploy broken site.

## Sources

**HIGH Confidence** — Based on official Next.js documentation and established ecosystem patterns:

- Next.js App Router documentation (official): https://nextjs.org/docs/app
- next-mdx-remote documentation (official): https://github.com/hashicorp/next-mdx-remote
- gray-matter documentation (official): https://github.com/jonschlinkert/gray-matter
- Fuse.js documentation (official): https://fusejs.io/
- Vercel deployment guides (official): https://vercel.com/docs

**Note:** This architecture is derived from well-established patterns for markdown-based documentation sites (similar to Next.js docs itself, Vercel docs, Tailwind docs, etc.). The specific combination for a knowledge dashboard with external GitHub content source follows the same principles with adaptations for the external data source requirement.
