# Phase 4: Article Reader - Research

**Researched:** 2026-02-15
**Domain:** MDX Rendering, Syntax Highlighting, and Article Display in Next.js App Router
**Confidence:** MEDIUM

## Summary

Phase 4 transforms raw markdown content (currently displayed in a `<pre>` block) into properly rendered MDX with syntax highlighting, typography, and metadata display. The current implementation already fetches content from GitHub and parses frontmatter with gray-matter—this phase adds the rendering layer.

Next.js 16 App Router supports two primary approaches for MDX rendering: (1) `@next/mdx` for local files in the `/app` directory, and (2) `next-mdx-remote` for rendering remote content fetched at build time. Since content comes from an external GitHub repository and is fetched via Octokit, `next-mdx-remote/rsc` is the appropriate choice.

For syntax highlighting, the ecosystem standard is `rehype-pretty-code` powered by Shiki, which provides VSCode-quality highlighting at build time without runtime JavaScript. Tailwind's `@tailwindcss/typography` plugin handles prose styling with the `prose` classes, offering responsive typography and semantic HTML styling. Status badges use simple Tailwind utility classes with color mapping (yellow = in-progress, green = complete, blue = stable).

**Primary recommendation:** Use `next-mdx-remote/rsc` with `rehype-pretty-code` for syntax highlighting and `@tailwindcss/typography` for article styling, rendering MDX in server components to maintain static generation benefits.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-mdx-remote | ^5.0.0 | Remote MDX rendering in RSC | Designed for content from external sources, supports App Router server components, separates content from codebase |
| @next/mdx | ^15.1.6 | MDX configuration and plugins | Provides plugin infrastructure for rehype/remark, handles MDX compilation, required for plugin integration even with next-mdx-remote |
| @mdx-js/loader | ^3.1.0 | MDX loader for Next.js | Required dependency for @next/mdx |
| @mdx-js/react | ^3.1.0 | MDX component provider | Required dependency for @next/mdx |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| rehype-pretty-code | ^0.14.0 | Syntax highlighting | All code blocks in MDX content |
| shiki | ^1.21.0 | Syntax highlighter engine | Required peer dependency for rehype-pretty-code |
| @tailwindcss/typography | ^0.5.15 | Prose styling | Style all markdown content (headings, paragraphs, lists, etc.) |
| remark-gfm | ^4.0.0 | GitHub Flavored Markdown | Support tables, strikethrough, task lists in markdown |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-mdx-remote/rsc | @next/mdx only | @next/mdx requires MDX files in /app directory—can't render content fetched from GitHub API |
| rehype-pretty-code | rehype-highlight | rehype-highlight has limited themes and less accurate highlighting; rehype-pretty-code uses Shiki (VSCode's highlighter) |
| rehype-pretty-code | Prism.js | Prism v2 development stalled since 2022; Shiki is actively maintained and more accurate |
| Server-side rendering | Client-side with react-markdown | Would add runtime bundle size and lose static generation benefits; markdown should be rendered at build time |

**Installation:**
```bash
npm install next-mdx-remote @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
npm install rehype-pretty-code shiki
npm install remark-gfm
npm install @tailwindcss/typography
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── [category]/
│       └── [slug]/
│           └── page.tsx              # Article page (modify existing)
├── components/
│   ├── mdx/
│   │   ├── MDXContent.tsx            # MDX rendering component
│   │   └── CodeBlock.tsx             # Custom code block component (optional)
│   └── ui/
│       ├── StatusBadge.tsx           # Status badge component
│       └── ArticleMetadata.tsx       # Metadata display component
└── lib/
    └── mdx-components.tsx            # Custom MDX component mappings
```

### Pattern 1: Server Component MDX Rendering with next-mdx-remote/rsc
**What:** Render MDX content from external source (GitHub) in a React Server Component using the async `MDXRemote` component.
**When to use:** When content is fetched at build time from external source and needs to be statically generated.
**Example:**
```typescript
// Source: https://github.com/hashicorp/next-mdx-remote
// app/[category]/[slug]/page.tsx
import { MDXRemote } from 'next-mdx-remote/rsc';
import { fetchCategoryArticles } from '@/lib/content';

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

  return (
    <article className="prose prose-gray max-w-none">
      <h1>{article.title}</h1>
      {/* Metadata display */}
      <MDXRemote source={article.content} />
    </article>
  );
}
```

### Pattern 2: Syntax Highlighting with rehype-pretty-code
**What:** Configure rehype-pretty-code in next.config.mjs to apply syntax highlighting at build time.
**When to use:** All MDX content with code blocks.
**Example:**
```javascript
// Source: https://rehype-pretty.pages.dev/
// next.config.mjs
import createMDX from '@next/mdx';
import rehypePrettyCode from 'rehype-pretty-code';

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm'],
    rehypePlugins: [
      [
        'rehype-pretty-code',
        {
          theme: 'github-dark-dimmed',
          keepBackground: true,
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
```

**IMPORTANT:** With Turbopack (Next.js 16 default), specify plugins as strings, not imports. Use `'remark-gfm'` not `remarkGfm`.

### Pattern 3: Prose Styling with Tailwind Typography
**What:** Wrap MDX content in a container with `prose` classes to apply consistent typographic styling.
**When to use:** All rendered markdown content.
**Example:**
```tsx
// Source: https://nextjs.org/docs/app/guides/mdx
// app/[category]/[slug]/page.tsx
<article className="prose prose-gray max-w-4xl mx-auto px-6 py-12">
  <MDXRemote source={article.content} />
</article>
```

**Responsive sizing:**
```tsx
<article className="prose prose-sm md:prose-base lg:prose-lg xl:prose-xl max-w-none">
  <MDXRemote source={article.content} />
</article>
```

**Dark mode support (if needed later):**
```tsx
<article className="prose prose-gray dark:prose-invert max-w-4xl">
  <MDXRemote source={article.content} />
</article>
```

### Pattern 4: Status Badge Component
**What:** Map status values to color variants using Tailwind utility classes.
**When to use:** Display article status in metadata section.
**Example:**
```tsx
// components/ui/StatusBadge.tsx
const STATUS_COLORS = {
  'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'complete': 'bg-green-100 text-green-800 border-green-200',
  'stable': 'bg-blue-100 text-blue-800 border-blue-200',
} as const;

export function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status as keyof typeof STATUS_COLORS]
    || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${colors}`}>
      {status}
    </span>
  );
}
```

### Pattern 5: Article Metadata Display
**What:** Format and display frontmatter metadata (dates, author, tags) in a structured layout.
**When to use:** Above article content, below title.
**Example:**
```tsx
// components/ui/ArticleMetadata.tsx
export function ArticleMetadata({ article }: { article: Article }) {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-gray-600">
      <StatusBadge status={article.status} />
      <time dateTime={article.created.toISOString()}>
        Created: {article.created.toLocaleDateString()}
      </time>
      {article.updated && (
        <time dateTime={article.updated.toISOString()}>
          Updated: {article.updated.toLocaleDateString()}
        </time>
      )}
      {article.author && <span>By {article.author}</span>}
    </div>
  );
}

{article.tags && article.tags.length > 0 && (
  <div className="mb-8">
    <span className="text-sm text-gray-600">Tags: </span>
    {article.tags.map((tag) => (
      <span key={tag} className="mr-2 inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
        {tag}
      </span>
    ))}
  </div>
)}
```

### Anti-Patterns to Avoid
- **Using client-side markdown rendering:** MDX should be compiled server-side at build time to maintain static generation benefits and reduce bundle size.
- **Importing MDX files directly in App Router:** Files from external repos can't use `import Content from './article.mdx'`—use `next-mdx-remote` instead.
- **Running syntax highlighting at runtime:** Use rehype plugins at build time, not client-side libraries like highlight.js with useEffect.
- **Not using semantic HTML:** Dates should use `<time>` elements with `dateTime` attribute for accessibility and SEO.
- **Hardcoding status colors in templates:** Use a mapping object for maintainability and consistency.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| MDX parsing and compilation | Custom markdown parser with React component injection | next-mdx-remote/rsc | Handles AST transformation, component mapping, error handling, security (XSS prevention), and App Router integration |
| Syntax highlighting | Manual code tokenization with regex | rehype-pretty-code + Shiki | VSCode-quality highlighting with 100+ languages and themes, handles edge cases (nested strings, regex literals, etc.) |
| Prose typography | Custom CSS for headings, lists, blockquotes, etc. | @tailwindcss/typography | 15+ years of typographic best practices, responsive scaling, dark mode support, consistent vertical rhythm |
| Date formatting | Custom date formatting logic | Built-in `toLocaleDateString()` | Handles internationalization, timezone conversion, and locale-specific formats automatically |

**Key insight:** MDX rendering involves complex AST transformations (markdown → HTML → React), security considerations (sanitizing untrusted content), and plugin orchestration (remark for markdown, rehype for HTML). The remark/rehype ecosystem has hundreds of plugins solving common problems—use them rather than reinventing.

## Common Pitfalls

### Pitfall 1: Plugin Configuration with Turbopack
**What goes wrong:** Importing rehype/remark plugins as JavaScript functions causes errors with Turbopack (Next.js 16 default bundler).
**Why it happens:** Turbopack can't serialize JavaScript functions to pass to Rust-based bundler; requires string-based plugin names.
**How to avoid:** Use string-based plugin configuration in next.config.mjs:
```javascript
// ❌ WRONG (breaks with Turbopack)
import remarkGfm from 'remark-gfm';
const withMDX = createMDX({
  options: { remarkPlugins: [remarkGfm] }
});

// ✅ CORRECT (works with Turbopack)
const withMDX = createMDX({
  options: { remarkPlugins: ['remark-gfm'] }
});
```
**Warning signs:** Build errors mentioning "serializable options" or "can't pass functions to Rust."

### Pitfall 2: Missing mdx-components.tsx File
**What goes wrong:** App Router requires `mdx-components.tsx` in project root when using @next/mdx, even if you don't customize components.
**Why it happens:** @next/mdx looks for this file to configure component mappings; missing file causes runtime errors.
**How to avoid:** Create `mdx-components.tsx` at root (same level as `/app`):
```typescript
import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return components;
}
```
**Warning signs:** "mdx-components.tsx not found" error during build or runtime.

### Pitfall 3: Treating next-mdx-remote/rsc as Synchronous
**What goes wrong:** Using `<MDXRemote />` without async/await causes TypeScript errors and runtime failures.
**Why it happens:** RSC version is async to support server-side data fetching; client version was synchronous.
**How to avoid:** Always use in async Server Components:
```typescript
// ❌ WRONG
export default function Page() {
  return <MDXRemote source={content} />;
}

// ✅ CORRECT
export default async function Page() {
  const content = await fetchContent();
  return <MDXRemote source={content} />;
}
```
**Warning signs:** TypeScript error "Type 'Promise' is not assignable to type 'ReactElement'."

### Pitfall 4: Prose Max-Width Breaking Mobile Layout
**What goes wrong:** Using fixed `prose` sizes (prose-lg, prose-xl) without responsive variants causes horizontal scroll on mobile.
**Why it happens:** Default `prose` includes max-width that may be wider than small viewports; needs responsive sizing.
**How to avoid:** Use responsive size modifiers with mobile-first approach:
```tsx
// ❌ WRONG (fixed size, may overflow mobile)
<article className="prose prose-lg">

// ✅ CORRECT (responsive, mobile-friendly)
<article className="prose prose-sm md:prose-base lg:prose-lg max-w-full px-4 md:px-6">
```
**Warning signs:** Horizontal scrolling on mobile devices, content cut off at viewport edge.

### Pitfall 5: Not Configuring Shiki Theme
**What goes wrong:** Code blocks render without background color or with theme that doesn't match site design.
**Why it happens:** rehype-pretty-code defaults to a light theme; needs explicit theme configuration.
**How to avoid:** Configure theme in next.config.mjs:
```javascript
rehypePlugins: [
  [
    'rehype-pretty-code',
    {
      theme: 'github-dark-dimmed', // or 'github-light', 'one-dark-pro', etc.
      keepBackground: true, // preserve theme background color
    },
  ],
]
```
**Warning signs:** Code blocks with no background, illegible light text on light background.

### Pitfall 6: Status Badge Type Safety
**What goes wrong:** Passing invalid status values causes badge to display with wrong colors or crash.
**Why it happens:** Status values come from external repo; frontmatter could have typos or unexpected values.
**How to avoid:** Add fallback in badge component and validate in schema:
```typescript
// In ArticleFrontmatterSchema (existing)
status: z.enum(['in-progress', 'stable', 'complete']),

// In StatusBadge component (with fallback)
const colors = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
```
**Warning signs:** Console warnings about invalid status values, gray badges for valid statuses.

## Code Examples

Verified patterns from official sources:

### Complete Article Page with MDX Rendering
```typescript
// Source: https://nextjs.org/docs/app/guides/mdx + https://github.com/hashicorp/next-mdx-remote
// app/[category]/[slug]/page.tsx
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchCategoryArticles, fetchAllArticles } from '@/lib/content';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ArticleMetadata } from '@/components/ui/ArticleMetadata';

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
    return { title: 'Not Found | Ryder.AI' };
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link
          href={`/${category}`}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to {capitalizedCategory}
        </Link>
      </div>

      <article>
        {/* Title */}
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {article.title}
        </h1>

        {/* Metadata */}
        <ArticleMetadata article={article} />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-8">
            <span className="text-sm text-gray-600">Tags: </span>
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="mr-2 inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* MDX Content */}
        <div className="prose prose-gray prose-sm md:prose-base lg:prose-lg max-w-none">
          <MDXRemote source={article.content} />
        </div>
      </article>
    </div>
  );
}
```

### Next.js Configuration with MDX Plugins
```javascript
// Source: https://nextjs.org/docs/app/guides/mdx
// next.config.mjs
import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // other config...
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      'remark-gfm', // GitHub Flavored Markdown
    ],
    rehypePlugins: [
      [
        'rehype-pretty-code',
        {
          theme: 'github-dark-dimmed',
          keepBackground: true,
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
```

### MDX Components Configuration (Required)
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/mdx-components
// mdx-components.tsx (in project root)
import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Can customize built-in components here if needed
    // h1: ({ children }) => <h1 className="custom-h1">{children}</h1>,
    ...components,
  };
}
```

### Tailwind Typography Plugin Configuration
```javascript
// Source: https://tailwindcss.com/docs/plugins#typography
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| next-mdx-remote with serialize() | next-mdx-remote/rsc with direct source | Next.js 13+ (RSC) | Eliminates separate serialize/render steps; simpler API for server components |
| @next/mdx only | @next/mdx for plugins + next-mdx-remote for rendering | Next.js 13+ | Separates plugin config from rendering; supports remote content |
| Prism.js for highlighting | Shiki via rehype-pretty-code | 2023-2024 | VSCode-quality highlighting; Prism v2 development stalled |
| rehype-highlight | rehype-pretty-code | 2023 | More themes, better accuracy, transformers for advanced features |
| prose-lg (fixed size) | prose-sm md:prose-base lg:prose-lg (responsive) | Tailwind v3+ | Mobile-first responsive typography |
| Client-side markdown rendering | Build-time MDX compilation | Next.js App Router | Smaller bundle, faster page loads, better SEO |

**Deprecated/outdated:**
- **next-mdx-remote/serialize:** Use next-mdx-remote/rsc with direct source prop in RSC
- **MDXProvider from @mdx-js/react:** Not supported in RSC; pass components directly to MDXRemote
- **getStaticProps with serialize():** Use async Server Components with direct MDXRemote rendering
- **Prism.js:** Use Shiki via rehype-pretty-code (Prism v2 development inactive since 2022)

## Open Questions

1. **Should we add custom MDX components (callouts, warnings, etc.)?**
   - What we know: MDXRemote accepts components prop for custom mappings
   - What's unclear: Whether content repo uses custom components beyond standard markdown
   - Recommendation: Start with standard components; add custom ones if content requires them

2. **Do we need line highlighting in code blocks?**
   - What we know: rehype-pretty-code supports line highlighting with `{1-3}` syntax
   - What's unclear: Whether content uses this feature
   - Recommendation: Enable by default (zero config needed); document syntax if users want it

3. **Should we implement copy-to-clipboard for code blocks?**
   - What we know: Would require client component wrapper around code blocks
   - What's unclear: Whether this feature is needed in Phase 4 or can be deferred
   - Recommendation: Defer to Phase 6 (Polish) as it's enhancement, not core requirement

4. **Do we need a table of contents for long articles?**
   - What we know: Could extract headings from MDX content; rehype plugins exist for this
   - What's unclear: Whether articles are long enough to need TOC navigation
   - Recommendation: Defer to Phase 6; assess article length after rendering works

## Sources

### Primary (HIGH confidence)
- [Next.js MDX Guide](https://nextjs.org/docs/app/guides/mdx) - Official Next.js 16.1.6 documentation for MDX in App Router (last updated 2026-02-11)
- [Next.js Version 16 Upgrade Guide](https://nextjs.org/blog/next-16) - Official release announcement
- [Rehype Pretty Code Documentation](https://rehype-pretty.pages.dev/) - Official setup and configuration guide

### Secondary (MEDIUM confidence)
- [next-mdx-remote GitHub Repository](https://github.com/hashicorp/next-mdx-remote) - Official repository with RSC documentation
- [Tailwind CSS Typography Plugin](https://github.com/tailwindlabs/tailwindcss-typography) - Official plugin documentation
- [MDX Official Documentation](https://mdxjs.com/guides/syntax-highlighting/) - Syntax highlighting guide
- [Tailwind CSS Badges](https://flowbite.com/docs/components/badge/) - Badge component patterns
- [Building a Next.js Blog: Static MDX](https://ianmitchell.dev/blog/building-a-nextjs-blog-static-mdx) - Practical implementation guide

### Tertiary (LOW confidence - patterns from multiple sources)
- [Responsive Typography Best Practices](https://www.learnui.design/blog/mobile-desktop-website-font-size-guidelines.html) - UI design guidelines
- [Tailwind Max Width Guide](https://tailkits.com/blog/tailwind-max-width/) - Responsive layout patterns
- [MDX Frontmatter in Next.js](https://www.bayanbennett.com/posts/adding-metadata-using-markdown-frontmatter-in-nextjs/) - Metadata display patterns

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - Verified official docs for Next.js and Tailwind; next-mdx-remote has limited RSC documentation but multiple community sources confirm usage
- Architecture: HIGH - Official Next.js docs and rehype-pretty-code docs provide clear patterns
- Pitfalls: MEDIUM - Based on official docs (Turbopack, mdx-components.tsx) and common responsive design patterns

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days - stable ecosystem, but Next.js updates frequently)
