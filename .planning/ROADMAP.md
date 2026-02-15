# Roadmap: Knowledge Dashboard

## Overview

This roadmap transforms a GitHub repository of markdown documentation into a browsable, searchable knowledge dashboard. The journey starts with data foundation (GitHub API integration and content parsing), establishes static site generation with Next.js, builds the reading and browsing experience, adds search and discovery features, and finishes with design polish. Each phase delivers observable user value while addressing critical pitfalls identified in research.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Project Foundation** - Next.js setup, deployment pipeline, and tech stack verification
- [x] **Phase 2: Data Infrastructure** - GitHub API integration with authentication and content parsing
- [x] **Phase 3: Routing & Static Generation** - App Router structure and build-time page generation
- [x] **Phase 4: Article Reader** - MDX rendering with syntax highlighting and status badges
- [x] **Phase 5: Category Navigation** - Homepage and category browsing with article cards
- [x] **Phase 6: Search Implementation** - Client-side fuzzy search with Fuse.js
- [ ] **Phase 7: Tag Discovery** - Tag-based browsing and related articles
- [ ] **Phase 8: Design Polish** - Dark mode, responsive design, and performance optimization

## Phase Details

### Phase 1: Project Foundation
**Goal**: Development environment is ready with verified tech stack and working deployment pipeline
**Depends on**: Nothing (first phase)
**Requirements**: DEPL-01, DEPL-02
**Success Criteria** (what must be TRUE):
  1. Next.js 15 project initializes and runs locally on http://localhost:3000
  2. Site builds successfully with `npm run build` and generates static output
  3. Site deploys to Vercel with automatic builds on git push
  4. All package versions are verified and compatible (Next.js, Tailwind, TypeScript)
**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md -- Initialize Next.js 15 project with tooling and styled Ryder.AI landing page
- [x] 01-02-PLAN.md -- Deploy to Vercel via GitHub integration and verify pipeline

### Phase 2: Data Infrastructure
**Goal**: Site reliably fetches and parses all content from GitHub repository with validated schema
**Depends on**: Phase 1
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05
**Success Criteria** (what must be TRUE):
  1. GitHub API client successfully fetches all markdown files from fatherfilth/AI-Documentation-Library
  2. Authenticated requests prevent rate limiting (uses GITHUB_TOKEN)
  3. All 6 category folders (models, tools, skills, repos, agents, projects) are accessible
  4. Frontmatter is parsed and validated against Zod schema for all articles
  5. Files in docs/_templates/ and docs/_index/ are excluded from content
**Plans:** 1 plan

Plans:
- [x] 02-01-PLAN.md -- GitHub API client, Zod schema, content pipeline, and end-to-end verification

### Phase 3: Routing & Static Generation
**Goal**: Next.js generates static pages for all categories and articles at build time
**Depends on**: Phase 2
**Requirements**: NAV-05
**Success Criteria** (what must be TRUE):
  1. Homepage route (/) exists and renders
  2. Category routes (/[category]) exist for all 6 categories
  3. Article routes (/[category]/[slug]) exist for all articles
  4. Build completes successfully with all routes generated statically
  5. All routes have unique, shareable URLs based on category and slug
**Plans:** 1 plan

Plans:
- [x] 03-01-PLAN.md -- App Router routes with generateStaticParams for categories and articles

### Phase 4: Article Reader
**Goal**: User can read any article with clean formatting, syntax highlighting, and metadata display
**Depends on**: Phase 3
**Requirements**: DISP-01, DISP-02, DISP-03, DISP-04
**Success Criteria** (what must be TRUE):
  1. User can read full article content rendered from MDX with readable typography
  2. Code blocks display with syntax highlighting for multiple languages
  3. Articles show color-coded status badges (in-progress = yellow, complete = green, stable = blue)
  4. Articles display frontmatter metadata (created date, updated date, author, tags)
  5. Article content flows properly on both mobile and desktop
**Plans:** 1 plan

Plans:
- [x] 04-01-PLAN.md -- MDX rendering with syntax highlighting, typography, status badges, and metadata display

### Phase 5: Category Navigation
**Goal**: User can browse all categories and discover articles through card-based listings
**Depends on**: Phase 4
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-06, DSGN-03
**Success Criteria** (what must be TRUE):
  1. Homepage displays a grid showing all 6 categories with article counts
  2. User can click a category to see all articles in that category
  3. Article cards show title, status badge, date, tags, and content preview
  4. User can click an article card to open the full reader view
  5. Category pages sort articles by updated date (most recent first)
**Plans:** 1 plan

Plans:
- [x] 05-01-PLAN.md -- ArticleCard component and category page upgrade to card grid with date sorting

### Phase 6: Search Implementation
**Goal**: User can search across all articles by keyword with fuzzy matching
**Depends on**: Phase 5
**Requirements**: SRCH-01, SRCH-02, SRCH-03
**Success Criteria** (what must be TRUE):
  1. Search bar is accessible from all pages
  2. User can type a keyword and see matching articles
  3. Search matches against article title, content, and tags
  4. Search results display as article cards
  5. Search uses fuzzy matching (tolerates typos and partial matches)
**Plans:** 1 plan

Plans:
- [x] 06-01-PLAN.md -- Fuse.js search with SearchBar in layout, SearchResults on /search page

### Phase 7: Tag Discovery
**Goal**: User can discover articles by tags and find related content
**Depends on**: Phase 6
**Requirements**: SRCH-04, SRCH-05
**Success Criteria** (what must be TRUE):
  1. User can click a tag to see all articles with that tag across categories
  2. Tag pages display article cards for all matching articles
  3. Article pages show related articles based on shared tags
  4. Related articles appear in a dedicated section on article pages
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

### Phase 8: Design Polish
**Goal**: Site has polished design with dark mode and responsive layout across all devices
**Depends on**: Phase 7
**Requirements**: DSGN-01, DSGN-02
**Success Criteria** (what must be TRUE):
  1. Site works on mobile phones (320px+), tablets, and desktop screens
  2. User can toggle between light and dark mode
  3. Dark mode preference persists across sessions
  4. All components are styled consistently with Tailwind CSS
  5. Site loads quickly with optimized bundle size (<200KB initial JS)
**Plans**: TBD

Plans:
- [ ] 08-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Foundation | 2/2 | Complete | 2026-02-14 |
| 2. Data Infrastructure | 1/1 | Complete | 2026-02-14 |
| 3. Routing & Static Generation | 1/1 | Complete | 2026-02-15 |
| 4. Article Reader | 1/1 | Complete | 2026-02-15 |
| 5. Category Navigation | 1/1 | Complete | 2026-02-15 |
| 6. Search Implementation | 1/1 | Complete | 2026-02-15 |
| 7. Tag Discovery | 0/0 | Not started | - |
| 8. Design Polish | 0/0 | Not started | - |
