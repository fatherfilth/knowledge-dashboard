# Knowledge Dashboard

## What This Is

A personal knowledge dashboard — a Next.js 16 site where Karl's brother can browse a curated library of AI research articles. Content lives as markdown files with YAML frontmatter in a separate GitHub repo (fatherfilth/AI-Documentation-Library), organized into six categories: models, tools, skills, repos, agents, and projects. The site fetches content at build time via the GitHub API, renders it through a unified/remark/rehype pipeline, and deploys on Vercel. Features include category browsing, fuzzy search, tag-based discovery, and a polished dark theme with glass morphism design.

## Core Value

Your brother can quickly find and read any article in your AI documentation library — browsing by category, searching by keyword, or filtering by status and tags.

## Requirements

### Validated

- ✓ Category-based navigation — six category pages as primary browsing — v1.0
- ✓ Article cards in category listings — title, status badge, date, tags, preview — v1.0
- ✓ Full article reader view — clean reading with two-column layout and sticky sidebar — v1.0
- ✓ Prominent status badges — color-coded pill badges (in-progress, complete, stable) — v1.0
- ✓ Client-side search via Fuse.js — fuzzy search across title, content, and tags — v1.0
- ✓ Tag display and tag-based discovery — clickable tags, /tags/[tag] pages, related articles — v1.0
- ✓ Build-time content fetching — GitHub API with gray-matter and unified pipeline — v1.0
- ✓ Responsive design with Tailwind CSS — mobile (320px+), tablet, desktop — v1.0
- ✓ Dark mode theme — navy background, teal/purple/amber accents, glass morphism — v1.0
- ✓ Vercel deployment — auto-deploy on push to main — v1.0

### Active

(None — next milestone requirements defined via `/gsd:new-milestone`)

### Out of Scope

- Editing or writing articles from the dashboard — content managed in separate GitHub repo
- User authentication or accounts — personal read-only site
- Comments or social features — not needed for personal reference tool
- Real-time content updates — build-time fetching sufficient; rebuild to pick up new content
- Light mode toggle — dark-only for v1.0; light mode deferred
- Database — markdown files are the database
- Analytics — personal project, no metrics needed

## Context

- **Content repo:** `fatherfilth/AI-Documentation-Library`
- **File structure:** `docs/<category>/<slug>.md` (6 categories: models, tools, skills, repos, agents, projects)
- **Ignore:** `docs/_templates/` and `docs/_index/` — not articles
- **Frontmatter fields:** title, status, category, slug, created, updated, author, tags
- **Current state:** v1.0 shipped — 1,750 LOC TypeScript/CSS, 8 phases, 12 plans
- **Tech stack:** Next.js 16.1.6, React 19, Tailwind CSS 4, Fuse.js, Octokit, unified/remark/rehype, rehype-pretty-code, Vercel
- **Fonts:** Cabinet Grotesk (display) + Satoshi (body) from Fontshare
- **Audience:** One person (Karl's brother) — no multi-user concerns

## Constraints

- **Tech stack**: Next.js, Tailwind CSS, Fuse.js, gray-matter, unified + remark + rehype — established
- **Content source**: GitHub API (public repo) — fetched at build time
- **Hosting**: Vercel — deployment target is fixed
- **Content structure**: Frontmatter schema is fixed (title, status, category, slug, created, updated, author, tags)
- **Theme**: Dark-only (no light mode toggle in v1.0)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Content in separate repo | Separation of concerns — content management independent of site code | ✓ Good |
| GitHub API at build time | Static generation for speed, no runtime API calls | ✓ Good |
| Fuse.js for search | Lightweight client-side search, no backend needed | ✓ Good |
| Category pages as primary nav | Matches how content is organized in source repo | ✓ Good |
| Next.js 16 with App Router | Latest stable, Turbopack for fast builds | ✓ Good |
| Tailwind CSS 4 with @theme | CSS-native config, 5x faster than JS config | ✓ Good |
| unified + remark + rehype pipeline | Replaced next-mdx-remote to avoid MDX interpreting <>{} as JSX | ✓ Good |
| rehype-pretty-code with github-dark-dimmed | Syntax highlighting for code blocks | ✓ Good |
| Cabinet Grotesk + Satoshi from Fontshare | Display + body typography, CDN loaded | ✓ Good |
| Dark-only theme (no light toggle) | Reference design only defines dark palette | ✓ Good — revisit if users request light mode |
| Dynamic import for Fuse.js | Lazy loading avoids main bundle bloat | ✓ Good |
| URL params as search state | Shareable search URLs, no component state | ✓ Good |
| Set intersection for tag overlap | O(1) lookup for related articles | ✓ Good |
| TOC extraction via unist-util-visit | Uses existing unified ecosystem, smaller than remark-extract-toc | ✓ Good |

---
*Last updated: 2026-02-15 after v1.0 milestone*
