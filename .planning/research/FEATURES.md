# Feature Landscape

**Domain:** Markdown-based Knowledge Dashboard / Documentation Browser
**Researched:** 2026-02-14
**Confidence:** MEDIUM (based on established patterns in documentation sites and PKM systems, not verified with 2026 sources)

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Content Display** | Core purpose - show markdown as formatted content | Low | React Markdown or similar, syntax highlighting for code blocks |
| **Navigation Menu** | Users need to browse/discover content | Low | Category-based navigation matches repo structure |
| **Search** | Users expect to find content without browsing | Medium | Already planned (Fuse.js) - essential for >20 documents |
| **Responsive Design** | Users browse on different devices | Low | Next.js makes this straightforward |
| **Metadata Display** | Status, tags, dates inform if content is current | Low | Frontmatter already structured for this |
| **List/Card View** | Users need to see multiple items at once | Low | Standard pattern for content collections |
| **Category Filtering** | Users think in categories (models vs tools vs agents) | Low | Six categories already defined |
| **Status Indicators** | "Is this in-progress or stable?" critical for trust | Low | Visual badges (in-progress/complete/stable) |
| **Direct Links** | Share specific articles | Low | URL per article slug |
| **Fast Load Times** | Slow = abandoned, especially for reference material | Medium | Static generation helps; watch bundle size |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Tag-based Discovery** | Find related content across categories | Low | "Show me all 'transformer' tagged items" regardless of category |
| **Timeline/History View** | See knowledge evolution over time | Medium | Sort by created/updated, visualize activity |
| **Git-backed Versioning** | See how articles evolved, restore old versions | High | Leverage GitHub API for article history |
| **Smart Search** | Fuzzy matching, search in content not just titles | Medium | Fuse.js enables this; configure well |
| **Reading Progress** | Track what's been read | Medium | LocalStorage for single-user; shows unread items |
| **Related Articles** | Auto-suggest based on tags/category | Medium | Tag overlap algorithm |
| **Quick Stats Dashboard** | "12 models documented, 5 in-progress" | Low | Aggregate frontmatter metadata |
| **Export/Share** | Export article as PDF or share formatted | Medium | Print CSS or PDF generation |
| **Dark Mode** | Preference for reading technical content | Low | Standard Next.js pattern |
| **Table of Contents** | Navigate long articles | Low | Auto-generate from markdown headings |
| **Keyboard Shortcuts** | Power users navigate faster | Medium | j/k navigation, / for search, etc. |
| **Backlinks** | Wiki-style "what links here" | High | Requires parsing markdown for internal links |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Multi-user Auth** | Single user (Karl's brother) = unnecessary complexity | No auth; can add basic password later if needed |
| **Real-time Collaboration** | Content edited in GitHub, not in UI | Keep editing workflow in VS Code/GitHub |
| **Comments/Discussion** | Single user doesn't need discussion | Link to GitHub issues if feedback needed |
| **Complex Permissions** | No multi-user = no permissions needed | Skip entirely |
| **WYSIWYG Editor** | Markdown files edited in repo, not browser | View-only in browser; edit in GitHub |
| **Custom Layouts per Page** | Adds complexity; markdown is content, not layout | Consistent template for all articles |
| **Database** | Adds deployment complexity; files are the database | Parse markdown at build time (static) |
| **User Profiles** | Single user | Skip entirely |
| **Notifications** | No real-time updates needed | RSS feed if needed for updates |
| **Analytics** | Personal project = no metrics needed | Skip unless explicitly requested |

## Feature Dependencies

```
Search → Content Indexing (must index before searching)
Related Articles → Tag System (needs tags to compare)
Reading Progress → Direct Links (needs stable URLs)
Backlinks → Link Parsing (must detect internal links)
Git History → GitHub API Integration (requires API calls)
Table of Contents → Markdown Parsing (extract headings)
```

## MVP Recommendation

### Phase 1: Core Reading Experience
**Rationale:** Get content readable and browsable first.

1. **Content Display** - Can't use it without this
2. **Navigation Menu** - Need to find content
3. **List/Card View** - Browse available articles
4. **Status Indicators** - Know what's trustworthy
5. **Category Filtering** - Six categories = needs filtering
6. **Responsive Design** - Must work on all devices
7. **Direct Links** - Share articles

**Skip in MVP:**
- Search (can add once >20 articles)
- Most differentiators

### Phase 2: Enhanced Discovery
**Rationale:** Once content is viewable, improve findability.

1. **Search** - Fuse.js already planned
2. **Tag-based Discovery** - Frontmatter supports it
3. **Dark Mode** - Quick win, high value
4. **Table of Contents** - Helps with long articles
5. **Quick Stats** - Simple aggregation

### Defer to Post-MVP

| Feature | Defer Because |
|---------|---------------|
| **Git History** | High complexity, nice-to-have |
| **Backlinks** | Requires link parsing infrastructure |
| **Reading Progress** | Nice but not essential for single user |
| **Keyboard Shortcuts** | Polish, not core functionality |
| **Export/Share** | Can print from browser initially |

## Complexity Analysis

### Low Complexity (1-2 days)
- Content Display, Navigation, List View, Status Indicators, Category Filtering, Direct Links, Metadata Display, Dark Mode, Quick Stats, Table of Contents

### Medium Complexity (3-5 days)
- Search (integration + tuning), Tag Discovery, Related Articles, Reading Progress, Keyboard Shortcuts, Export

### High Complexity (1-2 weeks)
- Git History (GitHub API), Backlinks (link parsing + graph building)

## Personal Knowledge Dashboard Specifics

**Context:** Single user browsing curated AI research documentation.

**Implications:**
- **No social features** - Comments, sharing, collaboration all unnecessary
- **Trust over discovery** - Status badges more important than SEO
- **Reference over reading** - Quick lookup matters more than reading flow
- **Evolution matters** - AI moves fast; seeing what changed is valuable
- **Categories are semantic** - Models/Tools/Skills/Repos/Agents/Projects have different use patterns

**Pattern Matches:**
- **Similar to:** Docusaurus, VitePress, GitBook (documentation sites)
- **Different from:** Notion, Obsidian (editable in-app)
- **Hybrid:** Wiki (browsing) + Documentation (structured) + Bookmark Manager (curated)

## Feature Prioritization Rationale

### Why Table of Contents is a Differentiator
Standard docs sites have it, but for AI research articles with deep technical content, auto-generated TOC becomes essential for navigation. Borderline table stakes.

### Why Search Starts as Table Stakes
With six categories and growing content, manual browsing breaks down quickly. BUT can defer to Phase 2 if starting with <20 articles.

### Why Git History is a Differentiator
Most docs sites don't show content evolution. For fast-moving AI field, seeing "this article was last updated 3 months ago vs yesterday" is high value.

### Why No Database is Anti-Feature
GitHub repo is already the database. Adding Postgres/MongoDB adds deployment complexity with zero benefit for static content that changes via git commits.

## Sources

**Confidence: MEDIUM**

Based on established patterns from:
- Documentation site generators (Docusaurus, VitePress, GitBook, MkDocs)
- Personal knowledge management tools (Obsidian, Notion, Roam)
- Content management patterns (WordPress, Ghost)

**NOT verified with:**
- 2026 current sources (WebSearch unavailable)
- Official documentation (tool access restricted)
- Context7 for library specifics

**Recommendation:** Treat this as informed hypothesis. Validate feature priorities with:
1. User (Karl's brother) - what does he actually need?
2. Competitor analysis - visit 3-5 similar sites, note what they have
3. Next.js documentation ecosystem examples

**Low confidence areas:**
- Emerging 2026 patterns in knowledge dashboards
- Latest Next.js best practices for static content sites
- Current state of Fuse.js vs alternatives
