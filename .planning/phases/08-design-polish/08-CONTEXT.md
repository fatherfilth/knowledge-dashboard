# Phase 8: Design Polish - Context

**Gathered:** 2026-02-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Polish the site's visual design by applying a dark-mode-first theme with responsive layout across all devices. Derived from two HTML design explorations: variant-4-spatial (structure/behavior) and variant-2-color (color/styling). No new features — this transforms existing components to match the reference designs.

</domain>

<decisions>
## Implementation Decisions

### Color palette (from variant-2-color)
- Dark mode base: navy `#0B1120`
- Elevated surface: `#141B2D`
- Glass surface: `rgba(255, 255, 255, 0.05)`
- Accent teal: `#00E5CC` (primary accent, links, stable status)
- Accent amber: `#FFB347` (in-progress status)
- Accent purple: `#8B5CF6` (blockquotes, secondary accent)
- Text primary: `#E2E8F0`
- Text muted: `#94A3B8`
- Border subtle: `rgba(255, 255, 255, 0.08)`
- Border hover: `rgba(255, 255, 255, 0.16)`
- Code background: `#1A2235`
- Category-specific colors: models=`#8B5CF6`, tools=`#00E5CC`, skills=`#FFB347`, repos=`#F472B6`, agents=`#38BDF8`, projects=`#34D399`

### Status badge colors (from variant-2-color)
- Stable: teal `#00E5CC` with `rgba(0, 229, 204, 0.12)` background
- Complete: green `#22C55E` with `rgba(34, 197, 94, 0.12)` background
- In-progress: amber `#FFB347` with `rgba(255, 179, 71, 0.12)` background
- Badge shape: pill (border-radius: 100px) with colored dot indicator

### Typography (from variant-2-color)
- Display font: Cabinet Grotesk (weight 700-800) from Fontshare — replaces Inter for headings
- Body font: Satoshi (weight 400-700) from Fontshare — replaces Inter for body text
- Font loading: `https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,700,800&f[]=satoshi@400,500,700&display=swap`
- Heading letter-spacing: `-0.02em` to `-0.03em` (tight tracking)
- Body font-size: `1.0625rem`, line-height: `1.7`

### Navigation (from variant-4-spatial structure, variant-2-color styling)
- Sticky floating navbar with backdrop blur (`blur(16px)`)
- Glass background: `rgba(11, 17, 32, 0.85)`
- Brand mark: gradient square (teal → purple) with icon inside
- Brand text: Cabinet Grotesk 800 weight
- Nav links: pill-shaped hover state with glass background
- Nav links hidden on mobile (< 48rem)
- Article pages: back link as pill-shaped button with teal accent

### Homepage hero (variant-4-spatial structure, variant-2-color styling)
- Centered layout with eyebrow badge ("Knowledge Dashboard" pill)
- Title uses gradient text (teal → purple → amber)
- Stats row below tagline: Articles count, Categories count, Topics count
- Background mesh: fixed position multi-color radial gradients (teal, purple, amber)

### Homepage category grid (variant-4-spatial structure, variant-2-color styling)
- 3-column grid (not bento with spanning)
- Glass cards with subtle border, backdrop blur
- Each card has: colored icon box, category name, article count
- Hover: border lightens, translateY(-2px), shadow deepens
- Top-edge accent bar on hover (category color)
- Category icon in rounded container with category-specific color

### Homepage article list (variant-2-color styling)
- List layout (not card grid) — horizontal rows, not bento
- Each row: 4px colored accent bar | title + meta + tags | status badge
- Grid: `4px 1fr auto`
- Category label colored per-category
- Tags as pills with subtle border (border-radius: 100px)
- On mobile: collapses to 2-column (bar + content), right section wraps below

### Article page layout (from variant-4-spatial)
- Two-column grid: 260px sidebar + fluid content
- Sidebar: sticky (top: 5rem), contains status badge, author, created date, updated date, tags, table of contents
- Article content: max-width 75ch
- Article header: category link, title (Cabinet Grotesk 800, clamp 1.75rem-2.5rem), accent bar
- At 48rem: sidebar collapses to 2-column metadata grid above content
- At 30rem: sidebar grid goes single-column

### Article prose styling (from variant-2-color article)
- h2: Cabinet Grotesk 700, border-top separator, 3rem top margin
- h3: Cabinet Grotesk 700, 2rem top margin
- Links: teal colored, underlined
- List markers: teal colored
- Blockquotes: purple left border with purple-tinted background
- Inline code: teal text, `#1A2235` background, 1px subtle border, 4px radius
- Code blocks: `#1A2235` background with header bar showing language label
- Tables: subtle header row (`rgba(255,255,255,0.04)`), hover row highlight, wrapped in bordered container
- Abstract/callout: glass card with teal left border

### Related articles (variant-2-color article styling)
- 3-column grid of cards with colored top border (category color)
- Each card: category label, title, date
- Glass surface with subtle border

### Responsive breakpoints (consistent across both variants)
- Desktop: > 64rem — full layouts
- Tablet: 48rem–64rem — 2-col category grid, 2-col related grid
- Mobile: < 48rem — single-column categories, single-column related, nav links hidden, sidebar collapses
- Small mobile: < 30rem — single-column everything, reduced padding

### Effects and animation
- Background mesh: fixed radial gradients (teal, purple, amber) at low opacity
- Cards: backdrop-filter blur(12px), translateY(-2px) on hover
- Staggered fadeInUp animation (500ms ease, 60ms delay per item)
- Respects prefers-reduced-motion: all animations/transitions set to 0.01ms
- All transitions: 200ms ease

### Accessibility
- Skip navigation link (teal background, visible on focus)
- Focus-visible: 3px solid teal outline, 2px offset
- aria-labels on navigation, categories, decorative elements marked aria-hidden
- Semantic HTML: nav, main, article, section, footer, header

### Claude's Discretion
- How to integrate dark mode toggle (light mode palette not designed yet — may defer to simple dark-only)
- Bundle optimization strategy for fonts and CSS
- Whether to use CSS custom properties in Tailwind or extend the theme config
- Exact implementation of background mesh in Next.js (CSS vs component)

</decisions>

<specifics>
## Specific Ideas

- Design references are in `designs/variant-4-spatial/` (structure) and `designs/variant-2-color/` (colors/styling)
- The variant-2-color design is dark-mode-only — no light mode variant was explored
- Fonts are from Fontshare (free), not Google Fonts — this replaces the current Inter font
- Category color coding is a key design element — each category gets a unique accent color throughout the UI
- The article page has a sticky sidebar with TOC — this is new structure (current article page likely doesn't have this)
- Homepage articles use a list layout (rows), not the current card grid — this is a structural change from Phase 5's card approach
- Tags use pill shape (border-radius: 100px) in the new design vs the current rounded rectangle style

</specifics>

<deferred>
## Deferred Ideas

- Light mode / theme toggle — variant-2-color only explores dark mode; a proper light theme wasn't designed. The ROADMAP requires a toggle but may need a follow-up if light palette isn't viable from the variant-4 warm palette.
- Performance optimization (bundle size < 200KB) — success criteria item, may need its own plan if significant work

</deferred>

---

*Phase: 08-design-polish*
*Context gathered: 2026-02-15*
