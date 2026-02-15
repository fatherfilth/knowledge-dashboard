# External Integrations

**Analysis Date:** 2026-02-15

## APIs & External Services

**GitHub Repository:**
- GitHub REST API - Fetches markdown articles and metadata from external GitHub repository
  - SDK/Client: `octokit` 5.0.5
  - Auth: `GITHUB_TOKEN` environment variable
  - Repository: `fatherfilth/AI-Documentation-Library`
  - Base path: `docs/` folder in repository
  - Endpoints used:
    - `GET /repos/{owner}/{repo}/contents/{path}` - List directory contents
    - `GET /repos/{owner}/{repo}/contents/{path}` - Fetch file content (base64 encoded)
  - Rate limits:
    - Unauthenticated: 60 requests/hour
    - Authenticated: 5000 requests/hour
  - Implementation: `src/lib/github.ts` (Octokit singleton)

## Data Storage

**Primary Data Source:**
- GitHub Repository (`fatherfilth/AI-Documentation-Library`)
  - Content format: Markdown with YAML frontmatter
  - Structure: Six category folders (models, tools, skills, repos, agents, projects)
  - Each article: `*.md` file with metadata in frontmatter

**Caching:**
- None configured
- Content fetched on-demand via GitHub API
- Next.js built-in caching: HTML pages cached during static generation (`generateStaticParams`)

**File Storage:**
- No local file upload capability
- Content read-only from remote GitHub repository
- Static assets: Not detailed; likely Tailwind-generated CSS

## Content Processing

**Markdown Parsing & Rendering:**
- Parser: `remark-parse` 11.0.0
- Processors: `unified` ecosystem (remark → rehype → HTML)
- Output: Server-side rendered HTML with syntax highlighting via `shiki` 3.22.0
- Features:
  - GitHub Flavored Markdown (via `remark-gfm`)
  - Auto-generated heading IDs (via `rehype-slug`)
  - Code block syntax highlighting (via `rehype-pretty-code`)
  - Prose styling: `@tailwindcss/typography`

**Frontmatter Extraction & Validation:**
- Tool: `gray-matter` 4.0.3 (YAML extraction)
- Validation: `zod` 4.3.6 (runtime schema validation)
- Schema location: `src/lib/schemas/article.ts`
- Required fields: title, status, category, slug, created, updated, author
- Optional fields: tags (array)
- Status enum: "in-progress", "stable", "complete" (matches GitHub repo values)

## Authentication & Identity

**Auth Provider:**
- Custom GitHub Token Authentication
  - Implementation: `src/lib/github.ts`
  - Mechanism: GitHub Personal Access Token (PAT) passed via environment variable
  - Scope: Not specified in code; minimum required is `public_repo` or `repo` access
  - No user authentication or identity system (read-only public content)
  - Token holder controls API quota for the entire application

## Monitoring & Observability

**Error Tracking:**
- None configured
- Errors logged to console via `console.warn()` and `console.error()`
- API verification endpoint available at `GET /api/verify`

**Logs:**
- Console-based logging (Node.js stdout)
- Key log points:
  - GitHub authentication status on startup (`src/lib/github.ts` line 15-18)
  - Validation failures during article fetch (`src/lib/content.ts`)
  - API error details in verify endpoint response

**Debugging:**
- GitHub file path included in Article type for debugging (`src/types/content.ts`)
- Verify endpoint (`/api/verify`) returns detailed stats on:
  - Authentication status
  - Article counts per category
  - Validation failures
  - Status enum violations
  - Excluded path violations

## CI/CD & Deployment

**Hosting:**
- Target: Vercel (implicit from Next.js 16.1.6 zero-config setup)
- Alternatives: Any Node.js host (Heroku, Fly.io, self-hosted)

**CI Pipeline:**
- None configured in repository
- Standard Next.js build commands:
  - `npm run build` - Next.js static generation + server compile
  - `npm run start` - Production server start
  - `npm run dev` - Development server with hot reload

**Environment Configuration:**
- Build-time: `GITHUB_TOKEN` can be injected during build for static generation
- Runtime: `GITHUB_TOKEN` accessible to server components and API routes

## Environment Configuration

**Required Environment Variables:**

| Variable | Purpose | Example | Required? |
|----------|---------|---------|-----------|
| `GITHUB_TOKEN` | GitHub API authentication | `ghp_...` | Production-recommended |

**Optional Variables:**
- None detected

**Configuration Files:**
- `.env.local` - Development/local environment (committed: likely, contains tokens in dev)
- `.env.production` - Would be needed for Vercel/production deployment (not found)

**Secrets Location:**
- Vercel Environment Variables (if deployed to Vercel)
- `.env.local` file (development only; should be .gitignored)
- GitHub Secrets (for CI/CD if added)

## Webhooks & Callbacks

**Incoming:**
- None configured
- Application is pull-based (polls GitHub API on demand)

**Outgoing:**
- None configured
- No external notifications or callbacks triggered

## Search & Discovery

**Client-Side Search:**
- Tool: `fuse.js` 7.1.0
- Type: Fuzzy search with weighted scoring
- Fields searched:
  - title (weight 2.0)
  - tags (weight 1.5)
  - content (weight 1.0)
- Threshold: 0.3 (fairly permissive fuzzy matching)
- Min match length: 2 characters
- Dynamic import in browser: `src/components/search/SearchResults.tsx`

**Data Flow:**
1. Browser fetches all articles via server component
2. User enters search query in `<SearchBar />`
3. `SearchResults` component dynamically loads `fuse.js` and performs client-side search
4. Results rendered without server round-trip

## Content Metadata & Related Articles

**Tag System:**
- Tags stored in article frontmatter as array
- Related articles computed by tag overlap: `src/lib/tags.ts`
- Used to suggest related content on article pages

**Table of Contents:**
- Auto-generated from markdown headings: `src/lib/toc.ts`
- Uses unified/remark pipeline to extract heading structure
- Rendered in article sidebar

## Data Flow Summary

```
GitHub Repository (AI-Documentation-Library)
    ↓ (Octokit REST API calls)
src/lib/github.ts (Octokit singleton)
    ↓ (cached instances)
src/lib/content.ts (fetch & parse functions)
    ↓ (gray-matter + zod validation)
src/types/content.ts (Article objects)
    ↓ (server components & API routes)
React components (ArticleCard, ArticleMetadata, etc.)
    ↓ (markdown → remark → rehype → HTML)
Browser (styled with Tailwind CSS)
```

---

*Integration audit: 2026-02-15*
