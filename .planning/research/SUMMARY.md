# Project Research Summary

**Project:** Knowledge Dashboard
**Domain:** Next.js Markdown-based Documentation Browser / Personal Knowledge Management
**Researched:** 2026-02-14
**Confidence:** MEDIUM

## Executive Summary

This project is a personal knowledge dashboard that fetches markdown documentation from an external GitHub repository (fatherfilth/AI-Documentation-Library) and renders it as a browsable, searchable website. Experts build this type of product as a **statically-generated documentation site** using Next.js with App Router, parsing markdown at build time, and implementing client-side search for enhanced discovery. The pattern is well-established (similar to Docusaurus, VitePress, Nextra) but adapted for external content sources.

The recommended approach treats markdown files as a data source: fetch via GitHub API at build time, parse frontmatter with gray-matter, compile MDX with next-mdx-remote, generate static pages, and provide client-side fuzzy search using Fuse.js. This **Content-as-Data pattern** separates data fetching (server), static generation (build), and interactivity (client), maximizing performance while keeping the stack simple for single-user consumption.

The primary risk is GitHub API rate limiting causing build failures. This must be addressed in Phase 1 by implementing authenticated requests (GITHUB_TOKEN), using Git Trees API instead of individual file fetches, and adding build-time caching. Secondary risks include MDX memory issues during builds (batch processing required) and frontmatter schema inconsistencies (Zod validation essential). These are preventable with proper architecture from the start.

## Key Findings

### Recommended Stack

Next.js 15 with App Router provides the foundation, leveraging async Server Components for build-time data fetching and static generation. The markdown processing chain uses gray-matter for frontmatter extraction, next-mdx-remote for server-side MDX compilation, and remark/rehype plugins for transformations. Fuse.js handles client-side fuzzy search, while Tailwind CSS provides rapid UI development. Deployment to Vercel offers zero-config integration with ISR support for content freshness.

**Core technologies:**
- Next.js 15 (App Router): React framework with SSG — industry standard for static sites, excellent build-time data fetching
- TypeScript 5.x: Type safety — essential for frontmatter validation and preventing runtime errors
- gray-matter: YAML frontmatter parser — lightweight, battle-tested, handles structured metadata
- next-mdx-remote: Server-side MDX rendering — officially recommended by Next.js, supports RSC
- Fuse.js: Client-side fuzzy search — optimal balance of features/size for <500 documents
- Tailwind CSS 4.x: Utility-first CSS — rapid iteration, excellent for dashboard UIs
- Octokit REST API: GitHub client — handles authentication, rate limits, retries

**Critical version note:** All versions require verification (research based on Jan 2025 training data). STACK.md flags HIGH priority verification for Next.js, Tailwind, and next-mdx-remote before implementation.

### Expected Features

Personal knowledge dashboards require different feature priorities than multi-user documentation sites. Single-user consumption eliminates auth, collaboration, and permissions complexity, allowing focus on content discovery and reference workflows.

**Must have (table stakes):**
- Content display with markdown rendering and syntax highlighting
- Category-based navigation (6 categories: models, tools, skills, repos, agents, projects)
- Search functionality (fuzzy matching across titles, tags, content)
- Status indicators (in-progress/complete/stable badges for trust)
- Responsive design (mobile browsing essential for reference material)
- Direct links (shareable URLs per article)
- List/card view for browsing multiple articles

**Should have (differentiators):**
- Tag-based discovery (cross-category relationships)
- Dark mode (standard for technical content)
- Table of contents (auto-generated from markdown headings)
- Smart search with fuzzy matching (Fuse.js enables this)
- Quick stats dashboard (aggregate metadata counts)
- Related articles (tag overlap algorithm)

**Defer (v2+):**
- Git history view (high complexity, GitHub API intensive)
- Backlinks (requires link parsing infrastructure)
- Reading progress tracking (nice-to-have for single user)
- Keyboard shortcuts (polish, not core)
- Export/share features (browser print works initially)

**Anti-features (explicitly avoid):**
- Multi-user authentication (single user = unnecessary)
- WYSIWYG editor (content edited in GitHub, not browser)
- Database (markdown files ARE the database)
- Real-time collaboration (not needed)
- Comments/discussion (single user context)

### Architecture Approach

The architecture follows the **Content-as-Data pattern** with clear separation between build-time processing (server) and runtime interactivity (client). GitHub API serves as external data source, fetched once at build time via authenticated requests. Content flows through gray-matter for frontmatter extraction, Zod for schema validation, and next-mdx-remote for MDX compilation, producing static props for page generation. Search indexing happens at build time, outputting a JSON file for client-side Fuse.js consumption.

**Major components:**
1. **Data Fetching Layer** (`lib/github.ts`, `lib/content.ts`) — Server-only, fetches from GitHub API, parses frontmatter, validates schema, aggregates content by category
2. **Routing Layer** (App Router pages) — Generates static params for all categories and slugs, passes parsed data as props to components
3. **Presentation Layer** (React components) — ArticleCard for listings, ArticleReader for full view, CategoryNav for navigation, MDXComponents for custom rendering
4. **Client Features** (search hooks, filtering) — Lazy-loaded search index, Fuse.js integration, interactive filtering without server round-trips

**Key patterns to follow:**
- **Server-first data fetching:** All content fetched at build time (no runtime GitHub API calls)
- **Separation of data & presentation:** Data layer in `lib/`, UI in `components/`, routing in `app/`
- **Client-server boundary for search:** Index generated at build, search executed client-side
- **Incremental Static Regeneration (ISR):** Optional 1-hour revalidation for content freshness without full rebuilds
- **MDX component customization:** Override default markdown rendering for branded styling and enhanced functionality

### Critical Pitfalls

Research identified 5 critical pitfalls that could cause rewrites if not addressed from the start:

1. **GitHub API Rate Limit Cascade Failure** — Build failures from hitting 60 req/hour (unauthenticated) or 5000 req/hour (authenticated) limits. Prevention: Use GITHUB_TOKEN, implement Git Trees API (1 request vs N files), add build-time caching, monitor `X-RateLimit-Remaining` headers, implement exponential backoff. **Must address in Phase 1.**

2. **MDX Serialization Memory Explosion** — Out-of-memory errors when serializing many large markdown files simultaneously. Prevention: Process files in batches (10-20 at a time), use streaming serialization, disable expensive rehype plugins in development, monitor build memory. **Must address in Phase 2.**

3. **YAML Frontmatter Type Inconsistency Hell** — Frontmatter parsing produces inconsistent types (tags as string vs array, unparseable dates). Prevention: Implement Zod schema validation immediately after gray-matter, normalize data (single tag → array), use TypeScript strict mode. **Must address in Phase 1.**

4. **Client-Side Search Index Bundle Bloat** — Search index grows to 500KB+ and ships to every page, slowing initial loads. Prevention: Lazy-load search index only when activated, index only title/tags/excerpt (not full content), use dynamic import for Fuse.js, compress JSON with gzip. **Must address in Phase 4.**

5. **Incremental Builds Break Content Relationships** — ISR updates individual pages but not related pages (tag pages, category counts). Prevention: Use on-demand ISR revalidation for dependent pages, build dependency graph, trigger full rebuild on content changes via webhook. **Must address in Phase 6 if using ISR.**

## Implications for Roadmap

Based on combined research, the project should follow a **foundation-first build order** that establishes data integrity before adding UI, then enhances with search and polish. This minimizes rework and allows early validation of the critical path (GitHub API → parsing → static generation).

### Suggested Phase Structure (6 Phases)

### Phase 1: Data Foundation & Validation
**Rationale:** Everything depends on reliable data fetching and parsing. Validate GitHub access and schema before building UI. Addresses critical pitfalls 1 & 3.

**Delivers:**
- GitHub API client with authentication and rate limit handling
- Content parser with gray-matter + Zod validation
- TypeScript types for frontmatter schema
- Test script confirming all categories/files accessible

**Addresses features:** None visible yet (infrastructure only)

**Avoids pitfalls:**
- Pitfall 1: Implements GITHUB_TOKEN, Git Trees API, caching from start
- Pitfall 3: Zod validation prevents type inconsistencies

**Research needs:** SKIP — patterns well-documented in Octokit and gray-matter docs

---

### Phase 2: Routing & Static Generation
**Rationale:** Proves Next.js can generate pages from external data source. Establishes build-time patterns before adding complexity. Addresses critical pitfall 2.

**Delivers:**
- App Router structure (homepage, category pages, article pages)
- `generateStaticParams()` for all routes
- Minimal page rendering (JSON/text output for validation)
- Successful `npm run build` for all content

**Addresses features:** Direct links (stable URLs established)

**Avoids pitfalls:**
- Pitfall 2: Implements batch processing for MDX serialization
- Validates build times and memory usage early

**Research needs:** SKIP — Next.js App Router patterns well-documented

---

### Phase 3: Article Reader & Content Display
**Rationale:** Core feature — users must be able to read articles. Validates MDX rendering and styling before adding discovery features.

**Delivers:**
- MDX Remote integration with custom components
- Article reader component with typography
- Code block syntax highlighting
- Image optimization for markdown images
- Status badge component

**Addresses features:**
- Content display (table stakes)
- Metadata display (table stakes)
- Status indicators (table stakes)

**Avoids pitfalls:**
- Pitfall 6: Establishes MDX component patterns early
- Pitfall 9: Implements image optimization from start

**Research needs:** SKIP — next-mdx-remote patterns well-established

---

### Phase 4: Navigation & Discovery (No Search Yet)
**Rationale:** Make content browsable before searchable. Validates category structure and listing UIs.

**Delivers:**
- Article card component for listings
- Category navigation component
- Homepage category grid
- Category filtering
- Tag display
- Responsive design implementation

**Addresses features:**
- Navigation menu (table stakes)
- List/card view (table stakes)
- Category filtering (table stakes)
- Responsive design (table stakes)
- Tag-based discovery foundation

**Avoids pitfalls:**
- Validates UX patterns before adding search complexity

**Research needs:** SKIP — standard component patterns

---

### Phase 5: Search & Enhanced Discovery
**Rationale:** Once content is browsable, add search as enhancement. Implements critical pitfall 4 mitigations.

**Delivers:**
- Build-time search index generation
- Client-side Fuse.js integration
- Search bar component (lazy-loaded)
- Search results display
- Tag-based cross-category discovery

**Addresses features:**
- Search (table stakes for >20 docs)
- Smart search with fuzzy matching (differentiator)
- Tag-based discovery (differentiator)

**Avoids pitfalls:**
- Pitfall 4: Lazy-loads index, indexes only searchable fields, measures bundle impact

**Research needs:** CONSIDER — Fuse.js configuration for optimal search results may need tuning research

---

### Phase 6: Polish & Optimization
**Rationale:** Make it better after core functionality works. Handles performance, SEO, and content update workflows.

**Delivers:**
- Dark mode
- Table of contents (auto-generated)
- Quick stats dashboard
- Related articles (tag overlap)
- Metadata & SEO (Open Graph, sitemap)
- ISR configuration (optional)
- Performance optimization (bundle analysis, Core Web Vitals)
- Content update webhook (GitHub Actions)

**Addresses features:**
- Dark mode (differentiator)
- Table of contents (differentiator)
- Quick stats (differentiator)
- Related articles (differentiator)

**Avoids pitfalls:**
- Pitfall 5: Implements ISR invalidation strategy if using ISR
- Pitfall 7: Optimizes syntax highlighting if needed
- Measures and addresses performance issues

**Research needs:** SKIP — standard optimization patterns

---

### Phase Ordering Rationale

**Why foundation-first:**
- Data integrity issues discovered late cause cascading rewrites
- GitHub API patterns must be correct before scaling content
- Frontmatter schema bugs multiply with every feature that depends on them

**Why reader before search:**
- Reading is core purpose; search is enhancement
- MDX rendering has more complexity than expected (custom components, styling)
- Can launch with browsing only if search is delayed

**Why navigation before search:**
- Validates information architecture (categories, tags)
- Establishes UI patterns that search will inherit
- Users can browse while search is built

**Why polish last:**
- Dark mode, stats, related articles are nice-to-have
- Performance issues only emerge under load
- ISR only needed if manual rebuilds become annoying

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 5 (Search):** Fuse.js configuration is nuanced — threshold, keys, tokenization affect quality. May need `/gsd:research-phase` to optimize search relevance for technical documentation.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Data Foundation):** Octokit + gray-matter + Zod are well-documented, established patterns
- **Phase 2 (Routing):** Next.js App Router SSG patterns are official, thoroughly documented
- **Phase 3 (Article Reader):** next-mdx-remote + custom components follow standard docs site patterns
- **Phase 4 (Navigation):** Standard React component patterns, no special considerations
- **Phase 6 (Polish):** Performance optimization uses standard Next.js tooling

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | LOW | Versions unverified (based on Jan 2025 training data). Next.js 15, Tailwind 4, all package versions need npm registry verification. Stack choices are sound, but version compatibility unknown. |
| Features | MEDIUM | Feature categorization based on established documentation site patterns. Single-user context well-understood. MVP phasing aligns with table stakes → differentiators → polish. Could benefit from user (Karl's brother) validation. |
| Architecture | HIGH | Content-as-Data pattern is well-established. Next.js App Router + MDX remote + client-side search is proven at scale (Vercel docs, Next.js docs use similar). Component boundaries and data flow validated against official patterns. |
| Pitfalls | MEDIUM | Critical pitfalls 1-5 are documented in Next.js ecosystem (GitHub issues, community discussions, Vercel guides). Severity and prevention strategies based on established failure modes. Unable to verify current state in 2026. |

**Overall confidence: MEDIUM**

### Gaps to Address

**Version verification gap (HIGH priority):**
- All package versions in STACK.md require verification before Phase 1
- Check Next.js 15 stability and App Router changes
- Verify Tailwind CSS v4 production readiness vs v3
- Confirm next-mdx-remote compatibility with Next.js 15
- Validate Fuse.js current version and API

**User needs validation gap (MEDIUM priority):**
- Feature prioritization assumes standard knowledge dashboard patterns
- Karl's brother's actual workflow may differ from assumptions
- Should validate MVP scope before Phase 3 (after data layer proven)

**Content structure validation gap (MEDIUM priority):**
- Research assumes frontmatter schema from description
- Actual GitHub repo may have different or inconsistent schema
- Phase 1 should audit real content and adjust validation accordingly

**Search optimization gap (LOW priority):**
- Fuse.js configuration for technical documentation needs tuning
- Defer to Phase 5, may need research-phase for optimal settings

**Scaling unknowns (LOW priority):**
- Current content size unknown (affects build time, search index size)
- If >200 articles, may need ISR from Phase 2
- If >500 articles, may need server-side search instead of Fuse.js

### Handling Gaps During Planning

1. **Before Phase 1:** Run version verification script (check npm registry for latest stable versions, update STACK.md)
2. **During Phase 1:** Audit actual GitHub repo content structure, validate frontmatter schema against real data
3. **After Phase 2:** Review with user (Karl's brother) to validate MVP scope and feature priorities
4. **During Phase 5:** Consider `/gsd:research-phase` for Fuse.js optimization if initial search results are poor
5. **Ongoing:** Monitor build times and bundle sizes, adjust architecture (ISR, batch processing) if scaling issues emerge

## Sources

### Primary (HIGH confidence)
- Next.js official documentation (architecture patterns, App Router, SSG)
- next-mdx-remote GitHub repository (official MDX remote rendering)
- gray-matter GitHub repository (frontmatter parsing)
- Fuse.js official documentation (client-side search)
- Vercel deployment guides (Next.js hosting)

### Secondary (MEDIUM confidence)
- Next.js GitHub issues (common pitfalls, rate limiting, build performance)
- Documentation site ecosystems (Docusaurus, VitePress patterns)
- Personal knowledge management tools (Obsidian, Notion patterns for features)

### Tertiary (LOW confidence)
- Training data on package versions (January 2025 cutoff, needs verification)
- Inferred complexity estimates (1-2 days low, 3-5 days medium, 1-2 weeks high)
- Build time scaling estimates (needs validation with actual content size)

**Note:** Research conducted without access to WebSearch, Context7, or live documentation due to tool restrictions. Recommendations based on training data and established patterns. Version verification critical before implementation.

---

**Research completed: 2026-02-14**

**Ready for roadmap: Yes**

**Next steps:**
1. Verify package versions (npm registry, official docs)
2. Audit actual GitHub repo content structure
3. Create roadmap from phase suggestions above
4. Define detailed requirements for Phase 1
