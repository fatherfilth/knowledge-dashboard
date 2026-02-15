---
phase: 08-design-polish
plan: 03
subsystem: ui
tags: [tailwind, markdown, remark, rehype, unified, toc, responsive-design]

# Dependency graph
requires:
  - phase: 08-01
    provides: "Design system foundation with Tailwind CSS 4 theme, Cabinet Grotesk/Satoshi fonts, glass navbar, and pill-shaped status badges"
provides:
  - "Two-column article layout with 260px sticky sidebar and fluid content area"
  - "TOC extraction utility using unified + remark AST traversal"
  - "ArticleSidebar component with status badge, metadata, tags, and TOC"
  - "Enhanced dark mode prose styling with teal links, purple blockquotes, styled code"
  - "Redesigned RelatedArticles grid with colored top borders"
affects: [article-reader, design-system]

# Tech tracking
tech-stack:
  added: [rehype-slug, unist-util-visit]
  patterns:
    - "TOC extraction via remark AST traversal with visit() instead of library dependency"
    - "Responsive sidebar pattern: sticky on desktop, grid on tablet, single-column on mobile"
    - "Heading ID generation matching rehype-slug output for anchor navigation"
    - "Category-colored accents (top borders, links) for visual categorization"

key-files:
  created:
    - src/lib/toc.ts
    - src/components/ui/ArticleSidebar.tsx
  modified:
    - src/app/[category]/[slug]/page.tsx
    - src/components/ui/RelatedArticles.tsx

key-decisions:
  - "Hand-rolled TOC extraction with unist-util-visit instead of remark-extract-toc - uses existing unified ecosystem dependency"
  - "rehype-slug inserted before rehype-pretty-code in pipeline - ensures heading IDs are generated before syntax highlighting"
  - "Sidebar uses lg:sticky lg:top-24 lg:h-fit - prevents stretching to full grid height while maintaining sticky positioning"
  - "prose-code:before:content-[''] prose-code:after:content-[''] - removes Tailwind typography backtick decorators from inline code"
  - "RelatedArticles self-renders cards instead of using ArticleCard - compact variant with colored top border"

patterns-established:
  - "TOC extraction synchronous with .parse() not .process() - only need AST, not full pipeline output"
  - "Responsive sidebar wrapper: grid grid-cols-1 gap-6 xs:grid-cols-2 lg:block - transforms layout at different breakpoints"
  - "max-w-[75ch] on prose content - optimal reading line length independent of viewport width"
  - "Colored top border accent pattern - horizontal bar with category color for visual hierarchy"

# Metrics
duration: 8min
completed: 2026-02-15
---

# Phase 08 Plan 03: Article Reader Layout Summary

**Two-column article layout with sticky sidebar (TOC, metadata, tags), dark mode prose styling with teal links and purple blockquotes, and category-colored related articles grid**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-15T05:33:24Z
- **Completed:** 2026-02-15T05:41:33Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created TOC extraction utility that traverses remark AST to extract h2/h3 headings with slugs
- Built ArticleSidebar component with sticky positioning, status badge, metadata, tags, and table of contents
- Redesigned article page with two-column layout (260px sidebar + fluid content area) that collapses responsively
- Enhanced prose styling for dark mode with teal links, purple blockquotes, and styled inline code
- Redesigned RelatedArticles as 3-column grid with colored top borders and compact card design
- Integrated rehype-slug for heading IDs that match TOC anchor links

## Task Commits

Each task was committed atomically:

1. **Task 1: TOC extraction utility and ArticleSidebar component** - `293d884` (feat)
   - Created `src/lib/toc.ts` with extractToc function using unified + unist-util-visit
   - Created `src/components/ui/ArticleSidebar.tsx` with sticky sidebar layout
   - Installed unist-util-visit for AST traversal

2. **Task 2: Article page two-column layout and RelatedArticles redesign** - `50e1c99` (feat)
   - Updated `src/app/[category]/[slug]/page.tsx` with two-column grid layout
   - Added rehype-slug to markdown pipeline before rehype-pretty-code
   - Redesigned `src/components/ui/RelatedArticles.tsx` with colored top borders
   - Installed rehype-slug for heading IDs

## Files Created/Modified

**Created:**
- `src/lib/toc.ts` - TOC extraction from markdown using remark AST traversal, exports extractToc function and TocHeading type
- `src/components/ui/ArticleSidebar.tsx` - Sticky sidebar component with status badge, author, dates, tags, and table of contents

**Modified:**
- `src/app/[category]/[slug]/page.tsx` - Two-column layout with ArticleSidebar, enhanced prose styling, pill-shaped back button, category-colored header
- `src/components/ui/RelatedArticles.tsx` - Self-rendered compact cards with colored top borders instead of ArticleCard component
- `package.json` / `package-lock.json` - Added rehype-slug and unist-util-visit dependencies

## Decisions Made

1. **Hand-rolled TOC extraction with unist-util-visit** - Used existing unified ecosystem dependency instead of installing remark-extract-toc, keeps bundle smaller
2. **rehype-slug before rehype-pretty-code in pipeline** - Ensures heading IDs are generated before syntax highlighting runs
3. **Sidebar h-fit positioning** - Prevents sidebar from stretching to full grid height while maintaining sticky behavior
4. **Removed backtick decorators from inline code** - prose-code:before/after:content-[''] removes Tailwind typography default backticks
5. **RelatedArticles self-renders cards** - Custom compact design with colored top border instead of reusing ArticleCard component

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - build succeeded with TypeScript compilation passing. GitHub API rate limits during page data collection are expected in local dev without GITHUB_TOKEN (documented in STATE.md).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Article reader layout is complete with full responsive behavior. Ready for:
- Homepage hero section (Plan 08-04)
- Final design polish verification
- Production deployment testing

The two-column layout with sticky sidebar provides excellent navigation for long-form content. TOC extraction is robust and heading anchors work correctly. The design system integration is complete with category colors, typography, and glass morphism effects applied consistently.

## Self-Check: PASSED

All files verified to exist:
- ✓ src/lib/toc.ts
- ✓ src/components/ui/ArticleSidebar.tsx
- ✓ src/app/[category]/[slug]/page.tsx
- ✓ src/components/ui/RelatedArticles.tsx

All commits verified in git log:
- ✓ 293d884 (Task 1: TOC extraction and ArticleSidebar)
- ✓ 50e1c99 (Task 2: Article page layout and RelatedArticles)

---
*Phase: 08-design-polish*
*Completed: 2026-02-15*
