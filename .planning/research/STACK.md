# Technology Stack

**Project:** Knowledge Dashboard
**Researched:** 2026-02-14
**Overall Confidence:** LOW (tool access restricted - requires verification with Context7/official docs)

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 15.x (verify latest) | React framework with SSG | Industry standard for static content sites, excellent Vercel integration, App Router provides better data fetching patterns |
| React | 19.x (bundled with Next.js) | UI library | Required by Next.js, stable and mature |
| TypeScript | 5.x | Type safety | Essential for maintainability, prevents runtime errors in data transformation |

**Confidence:** MEDIUM (based on training data - Next.js 15 was latest as of Jan 2025)
**Verification needed:** Check Next.js official docs for current stable version

### Markdown Processing
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| gray-matter | ^4.0.3 | Parse YAML frontmatter | Lightweight, battle-tested, zero dependencies, handles your frontmatter schema |
| next-mdx-remote | ^5.0.0 | Server-side MDX rendering | Officially recommended by Next.js team, supports App Router, allows React components in markdown |
| remark | ^15.0.0 | Markdown AST processor | Powers next-mdx-remote, extensible plugin ecosystem |
| remark-gfm | ^4.0.0 | GitHub Flavored Markdown | Essential for tables, task lists, strikethrough in technical docs |
| rehype-highlight | ^7.0.0 | Syntax highlighting | Zero-runtime highlighting, generates HTML with classes at build time |

**Confidence:** LOW (versions estimated - MUST verify with npm registry)
**Rationale:** This stack separates concerns cleanly:
- `gray-matter` extracts frontmatter → type-safe data
- `next-mdx-remote` renders markdown → interactive components
- Remark/rehype plugins → transformations at build time (no client bundle bloat)

**Alternative considered:** `contentlayer` - **Why not:** Project appears abandoned (last update mid-2023), Next.js 15 compatibility unclear, brings heavy dependencies for simple use case

### Content Fetching
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Octokit (REST API) | ^20.0.0 | GitHub API client | Official GitHub SDK, handles rate limits, types included, more reliable than raw fetch |
| @octokit/plugin-throttling | ^9.0.0 | Rate limit handling | Automatic backoff, prevents build failures from API limits |

**Confidence:** LOW (versions unverified)
**Rationale:** Direct GitHub API calls at build time vs git clone
- **Pro:** No git operations, simpler CI/CD, faster builds for selective updates
- **Con:** Rate limits (5000/hr authenticated, 60/hr unauthenticated)
- **Recommendation:** Use Octokit with auth token in env vars

**Alternative considered:** Simple `fetch()` - **Why not:** No rate limit handling, no retry logic, manual pagination

### Search
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Fuse.js | ^7.0.0 | Client-side fuzzy search | Current choice is appropriate - lightweight (~6KB gzipped), no backend needed, fuzzy matching essential for knowledge browsing |

**Confidence:** MEDIUM (Fuse.js is established, version needs verification)
**Alternatives considered:**
- **FlexSearch:** Faster but less fuzzy-friendly, better for exact matches
- **Pagefind:** Build-time index generation, excellent for large corpuses (100+ docs), overkill for 6 categories
- **Algolia/Typesense:** Backend services, unnecessary complexity for personal dashboard

**Recommendation:** Keep Fuse.js unless corpus exceeds 500+ documents

### Styling
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | ^4.0.0 | Utility-first CSS | Current choice is optimal - rapid UI iteration, excellent Next.js integration, v4 brings performance improvements |
| tailwindcss-typography | ^0.5.0 | Prose styling | Essential for markdown content rendering, handles headings/lists/blockquotes |
| @tailwindcss/forms | ^0.5.0 | Form styling | If search input or filters need consistent styling |

**Confidence:** LOW (Tailwind v4 released late 2024, verify current stable)
**Verification needed:** Check if Tailwind v4 is production-ready or stay on v3

### Build & Deployment
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vercel | N/A | Hosting platform | Zero-config Next.js deployment, automatic ISR, edge functions, generous free tier |
| pnpm | ^9.0.0 | Package manager | Faster than npm/yarn, disk-efficient, strict dependency resolution prevents phantom bugs |

**Confidence:** MEDIUM (Vercel is optimal for Next.js)

### Development Tools
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| ESLint | ^9.0.0 | Linting | Next.js includes config, catch errors early |
| Prettier | ^3.0.0 | Code formatting | Consistent formatting, integrates with ESLint |
| Husky | ^9.0.0 | Git hooks | Prevent committing broken code |
| lint-staged | ^15.0.0 | Run linters on staged files | Faster pre-commit checks |

**Confidence:** LOW (versions unverified)

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 15 | Astro | Less dynamic capabilities, smaller ecosystem for React components |
| Framework | Next.js 15 | Remix | Less mature SSG story, optimized for dynamic apps |
| MDX processor | next-mdx-remote | @next/mdx | Requires MDX files in /pages or /app, can't fetch from external repo |
| Frontmatter parser | gray-matter | front-matter | Less maintained, fewer features |
| Search | Fuse.js | Pagefind | Overkill for small corpus, requires separate build step |
| Styling | Tailwind | CSS Modules | Slower iteration, more files to manage |
| GitHub client | Octokit | raw fetch | No rate limiting, no retries, manual error handling |
| Package manager | pnpm | npm | Slower, larger disk usage, looser dependency resolution |

## Installation

```bash
# Core dependencies
pnpm add next@latest react@latest react-dom@latest

# Markdown processing
pnpm add gray-matter next-mdx-remote remark remark-gfm rehype-highlight

# GitHub API
pnpm add @octokit/rest @octokit/plugin-throttling

# Search
pnpm add fuse.js

# Styling
pnpm add tailwindcss@latest postcss autoprefixer
pnpm add @tailwindcss/typography @tailwindcss/forms

# TypeScript (dev)
pnpm add -D typescript @types/node @types/react @types/react-dom

# Dev tools
pnpm add -D eslint prettier husky lint-staged
```

## Stack Architecture Decisions

### App Router vs Pages Router
**Recommendation:** App Router (Next.js 13+)
- Better data fetching patterns (async Server Components)
- Streaming and Suspense support
- Route groups for organization
- Server Components reduce client bundle

### Static Generation Strategy
**Recommendation:** `generateStaticParams` + ISR fallback
```typescript
export async function generateStaticParams() {
  // Fetch all docs at build time
  const docs = await fetchDocsFromGitHub()
  return docs.map(doc => ({ category: doc.category, slug: doc.slug }))
}

export const revalidate = 3600 // ISR: revalidate every hour
```

**Why:** Balance between build time and freshness
- Build all known pages upfront
- ISR handles updates without full rebuild
- 1-hour revalidate keeps content current

### Data Flow Architecture
```
GitHub API (build time)
  → Octokit fetch with throttling
  → gray-matter parse frontmatter
  → TypeScript validation (zod?)
  → next-mdx-remote compile
  → Static props to page
  → Fuse.js index generation (client)
```

## Environment Variables Required

```bash
# .env.local
GITHUB_TOKEN=ghp_xxx          # Personal access token (read:repo)
GITHUB_OWNER=fatherfilth
GITHUB_REPO=AI-Documentation-Library
GITHUB_BRANCH=main
```

## Version Verification Needed

**CRITICAL:** All version numbers in this document are based on training data (Jan 2025 cutoff) and MUST be verified:

| Package | Verification Method | Priority |
|---------|-------------------|----------|
| next | Check https://nextjs.org/docs | HIGH |
| tailwindcss | Check https://tailwindcss.com | HIGH |
| next-mdx-remote | Check npm registry | HIGH |
| @octokit/rest | Check https://github.com/octokit/rest.js | MEDIUM |
| fuse.js | Check https://www.fusejs.io | MEDIUM |
| gray-matter | Check npm registry | LOW |

## Known Limitations

1. **GitHub API Rate Limits**
   - Unauthenticated: 60 requests/hour
   - Authenticated: 5,000 requests/hour
   - **Mitigation:** Use GITHUB_TOKEN, implement caching layer

2. **Build Time Scaling**
   - Each doc = 1 API call + MDX compilation
   - 100 docs = ~30-60 seconds build time
   - **Mitigation:** Incremental Static Regeneration (ISR)

3. **Client-Side Search Performance**
   - Fuse.js performance degrades >1000 documents
   - Index size grows linearly
   - **Mitigation:** Lazy-load search index, consider Pagefind if scaling

## Sources

**Unable to verify with authoritative sources due to tool restrictions.**

This stack is based on:
- Training data (January 2025 cutoff)
- General Next.js ecosystem knowledge
- Standard patterns for markdown-based static sites

**REQUIRED ACTIONS:**
1. Verify Next.js current version and App Router stability
2. Verify all package versions with npm registry
3. Check Tailwind CSS v4 production readiness
4. Validate next-mdx-remote compatibility with Next.js 15
5. Confirm Octokit API hasn't changed significantly

**Confidence level: LOW** - This stack requires verification before implementation.
