# Knowledge Dashboard

## What This Is

A personal knowledge dashboard — a Next.js site where Karl's brother can browse a curated library of AI research articles. Content lives as markdown files with YAML frontmatter in a separate GitHub repo (fatherfilth/AI-Documentation-Library), organized into six categories: models, tools, skills, repos, agents, and projects. The site fetches content at build time via the GitHub API, renders it with MDX, and deploys on Vercel.

## Core Value

Your brother can quickly find and read any article in your AI documentation library — browsing by category, searching by keyword, or filtering by status and tags.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Category-based navigation — six category pages (models, tools, skills, repos, agents, projects) as the primary browsing experience
- [ ] Article cards in category listings — showing title, status badge, date, tags, and a preview
- [ ] Full article reader view — clean reading experience when clicking into an article, rendered from MDX
- [ ] Prominent status badges — color-coded badges (in-progress, complete, stable) on cards and article pages
- [ ] Client-side search via Fuse.js — search across all articles by title, content, and tags
- [ ] Tag display on cards and article pages
- [ ] Build-time content fetching — pull markdown from fatherfilth/AI-Documentation-Library via GitHub API using gray-matter and next-mdx-remote
- [ ] Responsive design with Tailwind CSS
- [ ] Vercel deployment

### Out of Scope

- Editing or writing articles from the dashboard — content is managed in the separate GitHub repo
- User authentication or accounts — this is a personal read-only site
- Comments or social features — not needed for a personal reference tool
- Real-time content updates — build-time fetching is sufficient; rebuild to pick up new content
- Tag filtering within categories — v2 consideration

## Context

- Content repo: `fatherfilth/AI-Documentation-Library`
- File structure: `docs/<category>/<slug>.md` (6 category folders: models, tools, skills, repos, agents, projects)
- Ignore: `docs/_templates/` (templates) and `docs/_index/` (master index) — not articles
- Frontmatter fields: title, status (in-progress/complete/stable), category, slug, created, updated, author, tags (array)
- Article content is a mix of summaries, detailed writeups with code examples, and curated link collections
- Audience is one person (Karl's brother) — no need for analytics, SEO optimization, or multi-user concerns
- The site should look polished but the visual direction is open — just make it look good

## Constraints

- **Tech stack**: Next.js, Tailwind CSS, Fuse.js, gray-matter, next-mdx-remote — already decided
- **Content source**: GitHub API (public repo) — no local content, fetched at build time
- **Hosting**: Vercel — deployment target is fixed
- **Content structure**: Frontmatter schema is fixed (title, status, category, slug, created, updated, author, tags)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Content in separate repo | Separation of concerns — content management independent of site code | — Pending |
| GitHub API at build time | Static generation for speed, no runtime API calls | — Pending |
| Fuse.js for search | Lightweight client-side search, no backend needed | — Pending |
| Category pages as primary nav | Matches how the content is organized in the source repo | — Pending |

---
*Last updated: 2026-02-14 after initialization*
