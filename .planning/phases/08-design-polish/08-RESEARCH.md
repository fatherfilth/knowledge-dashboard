# Phase 8: Design Polish - Research

**Researched:** 2026-02-15
**Domain:** Tailwind CSS 4 theming, Next.js font optimization, responsive design, dark mode implementation
**Confidence:** HIGH

## Summary

Phase 8 transforms the existing knowledge dashboard into a polished dark-mode-first design based on two HTML reference prototypes: variant-4-spatial (structure/layout) and variant-2-color (styling/colors). This is a visual transformation phase, not a feature addition phase. The technical domain centers on Tailwind CSS 4's new CSS-based theming system, custom font loading from Fontshare, responsive design patterns, and accessibility best practices.

The key technical shift is migrating from Tailwind v3/v4 default configuration to a comprehensive custom theme using the `@theme` directive with CSS custom properties. This enables category-specific color coding, glass morphism effects with backdrop blur, and a cohesive dark color palette. The design requires replacing Inter (Google Fonts) with Cabinet Grotesk and Satoshi (Fontshare) fonts.

Critical implementation areas include: (1) Tailwind CSS 4 theme configuration with custom colors, fonts, and breakpoints, (2) External font loading optimization for Fontshare fonts, (3) Glass morphism effects with backdrop-filter, (4) Sticky sidebar implementation for article pages with table of contents, (5) Responsive breakpoint strategy using rem units, and (6) Accessibility considerations including prefers-reduced-motion support.

**Primary recommendation:** Use Tailwind CSS 4's `@theme` directive for all design tokens, implement Fontshare fonts via external CSS link with proper preconnect optimization, create glass morphism effects with Tailwind's built-in backdrop utilities, and ensure all animations respect prefers-reduced-motion for accessibility.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Color palette (from variant-2-color)
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

#### Status badge colors (from variant-2-color)
- Stable: teal `#00E5CC` with `rgba(0, 229, 204, 0.12)` background
- Complete: green `#22C55E` with `rgba(34, 197, 94, 0.12)` background
- In-progress: amber `#FFB347` with `rgba(255, 179, 71, 0.12)` background
- Badge shape: pill (border-radius: 100px) with colored dot indicator

#### Typography (from variant-2-color)
- Display font: Cabinet Grotesk (weight 700-800) from Fontshare — replaces Inter for headings
- Body font: Satoshi (weight 400-500-700) from Fontshare — replaces Inter for body text
- Font loading: `https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,700,800&f[]=satoshi@400,500,700&display=swap`
- Heading letter-spacing: `-0.02em` to `-0.03em` (tight tracking)
- Body font-size: `1.0625rem`, line-height: `1.7`

#### Navigation (from variant-4-spatial structure, variant-2-color styling)
- Sticky floating navbar with backdrop blur (`blur(16px)`)
- Glass background: `rgba(11, 17, 32, 0.85)`
- Brand mark: gradient square (teal → purple) with icon inside
- Brand text: Cabinet Grotesk 800 weight
- Nav links: pill-shaped hover state with glass background
- Nav links hidden on mobile (< 48rem)
- Article pages: back link as pill-shaped button with teal accent

#### Homepage hero (variant-4-spatial structure, variant-2-color styling)
- Centered layout with eyebrow badge ("Knowledge Dashboard" pill)
- Title uses gradient text (teal → purple → amber)
- Stats row below tagline: Articles count, Categories count, Topics count
- Background mesh: fixed position multi-color radial gradients (teal, purple, amber)

#### Homepage category grid (variant-4-spatial structure, variant-2-color styling)
- 3-column grid (not bento with spanning)
- Glass cards with subtle border, backdrop blur
- Each card has: colored icon box, category name, article count
- Hover: border lightens, translateY(-2px), shadow deepens
- Top-edge accent bar on hover (category color)
- Category icon in rounded container with category-specific color

#### Homepage article list (variant-2-color styling)
- List layout (not card grid) — horizontal rows, not bento
- Each row: 4px colored accent bar | title + meta + tags | status badge
- Grid: `4px 1fr auto`
- Category label colored per-category
- Tags as pills with subtle border (border-radius: 100px)
- On mobile: collapses to 2-column (bar + content), right section wraps below

#### Article page layout (from variant-4-spatial)
- Two-column grid: 260px sidebar + fluid content
- Sidebar: sticky (top: 5rem), contains status badge, author, created date, updated date, tags, table of contents
- Article content: max-width 75ch
- Article header: category link, title (Cabinet Grotesk 800, clamp 1.75rem-2.5rem), accent bar
- At 48rem: sidebar collapses to 2-column metadata grid above content
- At 30rem: sidebar grid goes single-column

#### Article prose styling (from variant-2-color article)
- h2: Cabinet Grotesk 700, border-top separator, 3rem top margin
- h3: Cabinet Grotesk 700, 2rem top margin
- Links: teal colored, underlined
- List markers: teal colored
- Blockquotes: purple left border with purple-tinted background
- Inline code: teal text, `#1A2235` background, 1px subtle border, 4px radius
- Code blocks: `#1A2235` background with header bar showing language label
- Tables: subtle header row (`rgba(255,255,255,0.04)`), hover row highlight, wrapped in bordered container
- Abstract/callout: glass card with teal left border

#### Related articles (variant-2-color article styling)
- 3-column grid of cards with colored top border (category color)
- Each card: category label, title, date
- Glass surface with subtle border

#### Responsive breakpoints (consistent across both variants)
- Desktop: > 64rem — full layouts
- Tablet: 48rem–64rem — 2-col category grid, 2-col related grid
- Mobile: < 48rem — single-column categories, single-column related, nav links hidden, sidebar collapses
- Small mobile: < 30rem — single-column everything, reduced padding

#### Effects and animation
- Background mesh: fixed radial gradients (teal, purple, amber) at low opacity
- Cards: backdrop-filter blur(12px), translateY(-2px) on hover
- Staggered fadeInUp animation (500ms ease, 60ms delay per item)
- Respects prefers-reduced-motion: all animations/transitions set to 0.01ms
- All transitions: 200ms ease

#### Accessibility
- Skip navigation link (teal background, visible on focus)
- Focus-visible: 3px solid teal outline, 2px offset
- aria-labels on navigation, categories, decorative elements marked aria-hidden
- Semantic HTML: nav, main, article, section, footer, header

### Claude's Discretion

- How to integrate dark mode toggle (light mode palette not designed yet — may defer to simple dark-only)
- Bundle optimization strategy for fonts and CSS
- Whether to use CSS custom properties in Tailwind or extend the theme config
- Exact implementation of background mesh in Next.js (CSS vs component)

### Deferred Ideas (OUT OF SCOPE)

- Light mode / theme toggle — variant-2-color only explores dark mode; a proper light theme wasn't designed. The ROADMAP requires a toggle but may need a follow-up if light palette isn't viable from the variant-4 warm palette.
- Performance optimization (bundle size < 200KB) — success criteria item, may need its own plan if significant work

</user_constraints>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | 4.x (already installed) | Utility-first CSS framework with @theme directive | Industry standard for utility-based styling, v4 brings CSS-native configuration and 5x faster builds |
| Next.js | 16.1.6 (current) | React framework with font optimization | Already in use, provides next/font for optimization and App Router for layouts |
| @tailwindcss/typography | 0.5.19 (current) | Prose styling for markdown content | Already installed, standard for styling markdown/MDX content with Tailwind |
| rehype-pretty-code | 0.14.1 (current) | Code block syntax highlighting | Already in use, powered by Shiki with customizable themes |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| remark-extract-toc | ^1.1.0 | Extract table of contents from markdown AST | For sidebar TOC generation from article headings |
| next-themes | ^0.4.4 | Dark mode toggle with localStorage | IF implementing dark/light toggle (marked as Claude's discretion) |
| rehype-slug | ^6.0.0 | Add IDs to headings | For TOC anchor links in article sidebar |
| rehype-autolink-headings | ^8.0.0 | Add self-linking anchors to headings | For clickable heading anchors in articles |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| External Fontshare CSS link | next/font/local with downloaded fonts | External link is simpler but adds DNS lookup; self-hosting via next/font eliminates external requests but requires downloading and managing font files |
| @theme directive | JavaScript tailwind.config.js | @theme is CSS-native and faster in v4, but JavaScript config offers more programmatic control (not needed here) |
| CSS custom properties in globals.css | Tailwind theme extension only | Custom properties allow runtime theming but add complexity; Tailwind theme is sufficient for static dark mode |
| remark-toc | Manual TOC generation | remark-toc auto-generates TOC in markdown, but we need sidebar extraction, making remark-extract-toc more suitable |

**Installation:**

```bash
# For table of contents extraction (if implementing sidebar TOC)
npm install remark-extract-toc rehype-slug rehype-autolink-headings

# For dark mode toggle (if implementing theme switcher)
npm install next-themes
```

**Note:** The core stack (Tailwind CSS 4, Next.js 16.1.6, @tailwindcss/typography, rehype-pretty-code) is already installed. Supporting libraries are optional based on implementation decisions.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── globals.css           # @import "tailwindcss", @theme directive, custom CSS
│   ├── layout.tsx             # Font loading, navbar, skip nav, background mesh
│   ├── page.tsx               # Homepage: hero, category grid, article list
│   ├── [category]/
│   │   └── [slug]/
│   │       └── page.tsx       # Article page: two-column layout with sidebar
├── components/
│   ├── ui/
│   │   ├── StatusBadge.tsx    # Pill-shaped status indicators
│   │   ├── ArticleCard.tsx    # Glass cards for categories/articles
│   │   └── ArticleSidebar.tsx # Sticky sidebar with TOC (NEW)
│   └── search/
│       └── SearchBar.tsx      # Existing search component
├── lib/
│   ├── content.ts             # Article/category fetching (existing)
│   └── toc.ts                 # TOC extraction utilities (NEW)
└── styles/                    # (if needed for complex background mesh)
```

### Pattern 1: Tailwind CSS 4 Theme Configuration

**What:** Define all design tokens using the `@theme` directive in globals.css, creating both utility classes and CSS variables.

**When to use:** For all color palettes, typography scales, custom breakpoints, and design system tokens that need corresponding utility classes.

**Example:**

```css
/* src/app/globals.css */
@import 'tailwindcss';

@theme {
  /* Base colors */
  --color-navy: #0B1120;
  --color-elevated: #141B2D;
  --color-glass: rgba(255, 255, 255, 0.05);

  /* Accent colors */
  --color-teal: #00E5CC;
  --color-amber: #FFB347;
  --color-purple: #8B5CF6;

  /* Category colors */
  --color-models: #8B5CF6;
  --color-tools: #00E5CC;
  --color-skills: #FFB347;
  --color-repos: #F472B6;
  --color-agents: #38BDF8;
  --color-projects: #34D399;

  /* Typography */
  --font-display: 'Cabinet Grotesk', system-ui, sans-serif;
  --font-body: 'Satoshi', system-ui, sans-serif;

  /* Custom breakpoints (rem-based) */
  --breakpoint-xs: 30rem;
  --breakpoint-md: 48rem;
  --breakpoint-lg: 64rem;

  /* Border radius */
  --radius-pill: 100px;
  --radius-card: 1rem;

  /* Animations */
  --animate-fade-up: fade-up 500ms ease;

  @keyframes fade-up {
    0% {
      opacity: 0;
      transform: translateY(1rem);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

/* Font loading via inline theme for CSS variable reference */
@theme inline {
  --font-sans: var(--font-satoshi);
  --font-heading: var(--font-cabinet);
}

@plugin "@tailwindcss/typography";
```

**Source:** [Tailwind CSS Theme Documentation](https://tailwindcss.com/docs/theme)

**Why this pattern:** Theme variables automatically generate utility classes (e.g., `bg-navy`, `text-teal`, `font-display`) while also exposing CSS variables for runtime access. The `inline` variant ensures utility classes use resolved values for better performance.

### Pattern 2: External Font Loading with Optimization

**What:** Load Fontshare fonts via external CSS link in the document `<head>` with preconnect for performance.

**When to use:** When fonts are not available through next/font (like Fontshare) and external CDN is acceptable.

**Example:**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ryder.AI',
  description: 'Curated AI documentation and resources for focused learning',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://api.fontshare.com" />

        {/* Load Fontshare fonts */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,700,800&f[]=satoshi@400,500,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-navy font-body text-primary antialiased">
        <a href="#main-content" className="skip-nav">
          Skip to content
        </a>
        {/* Background mesh */}
        <div className="bg-mesh" aria-hidden="true" />
        <div className="page-wrapper">
          {children}
        </div>
      </body>
    </html>
  );
}
```

**Source:** [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts), [Font Preconnect Best Practices](https://nextjs.org/docs/messages/google-font-preconnect)

**Why this pattern:** Next.js `next/font` doesn't support Fontshare fonts. External CSS link with preconnect is the recommended approach for non-Google fonts. The preconnect hint initiates an early connection to improve load times.

**Alternative approach (self-hosting):** Download fonts and use `next/font/local` for complete self-hosting (eliminates external requests but adds build complexity).

### Pattern 3: Glass Morphism with Backdrop Blur

**What:** Create frosted glass effects using backdrop-filter with blur and semi-transparent backgrounds.

**When to use:** For navbar, cards, modals, and any elevated UI elements that should show context beneath them.

**Example:**

```tsx
// Navigation with glass effect
<nav className="sticky top-0 z-50 px-6 py-3">
  <div className="mx-auto max-w-7xl rounded-card border border-white/[0.08] bg-navy/85 px-6 py-3 backdrop-blur-xl">
    {/* Nav content */}
  </div>
</nav>

// Category card with glass effect
<div className="group rounded-card border border-white/[0.08] bg-glass p-6 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-white/[0.16] hover:shadow-lg">
  {/* Card content */}
</div>
```

**Source:** [Tailwind Backdrop Filter](https://tailwindcss.com/docs/backdrop-filter), [Glass Morphism with Tailwind](https://www.epicweb.dev/tips/creating-glassmorphism-effects-with-tailwind-css)

**Why this pattern:** Tailwind provides built-in backdrop utilities (`backdrop-blur-{size}`). Combining with semi-transparent backgrounds (`bg-navy/85`) and subtle borders creates the glass effect. No custom CSS or plugins needed.

### Pattern 4: Sticky Sidebar with Overflow Fix

**What:** Create a sticky sidebar for article pages that scrolls with the viewport while avoiding the overflow:hidden breaking sticky positioning.

**When to use:** For article pages with table of contents, metadata, or supplementary navigation.

**Example:**

```tsx
// Article page layout
<div className="mx-auto max-w-7xl px-6 py-12">
  <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
    {/* Sticky sidebar */}
    <aside className="lg:sticky lg:top-20 lg:h-fit">
      <div className="space-y-6">
        <StatusBadge status={article.status} />
        {/* Metadata */}
        <TableOfContents headings={toc} />
      </div>
    </aside>

    {/* Article content */}
    <article className="min-w-0 max-w-prose">
      {/* Content */}
    </article>
  </div>
</div>
```

**Critical CSS consideration:**

```css
/* Ensure no ancestor has overflow: hidden — use overflow: clip instead */
.container {
  overflow-x: clip; /* Not overflow: hidden! */
}
```

**Source:** [CSS Position Sticky with Overflow](https://www.terluinwebdesign.nl/en/blog/position-sticky-not-working-try-overflow-clip-not-overflow-hidden/), [Dealing with Overflow and Sticky](https://css-tricks.com/dealing-with-overflow-and-position-sticky/)

**Why this pattern:** `overflow: hidden` on any ancestor creates a new scroll container, breaking sticky positioning. `overflow: clip` hides overflow without creating a scroll container, allowing sticky elements to work correctly. Using `lg:sticky` ensures mobile stacks naturally.

### Pattern 5: Responsive Breakpoints with rem Units

**What:** Define custom breakpoints in rem units and use Tailwind's mobile-first approach.

**When to use:** For all responsive design, especially when user font size preferences matter for accessibility.

**Example:**

```css
/* In @theme directive */
@theme {
  --breakpoint-xs: 30rem;   /* ~480px at default font size */
  --breakpoint-md: 48rem;   /* ~768px */
  --breakpoint-lg: 64rem;   /* ~1024px */
}
```

```tsx
// Usage in components (mobile-first)
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
</div>

// Nav links hidden on mobile
<div className="hidden md:flex gap-2">
  {/* Only visible at md breakpoint and above */}
</div>
```

**Source:** [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design), [Breakpoints Discussion](https://github.com/tailwindlabs/tailwindcss/discussions/8378)

**Why this pattern:** rem-based breakpoints respect user font size preferences (accessibility). Tailwind v4 uses rem by default. Mobile-first means unprefixed utilities apply to all sizes, prefixed apply at breakpoint and above.

### Pattern 6: Fluid Typography with clamp()

**What:** Use CSS clamp() function for responsive font sizes that scale smoothly between min and max values.

**When to use:** For hero headings, display text, and any typography that should scale with viewport without abrupt breakpoint changes.

**Example:**

```css
/* In @theme directive */
@theme {
  --font-size-display: clamp(1.75rem, calc(1.25rem + 2.5vw), 2.5rem);
  --font-size-h1: clamp(1.5rem, calc(1rem + 2vw), 2.25rem);
  --font-size-h2: clamp(1.25rem, calc(0.875rem + 1.5vw), 1.875rem);
}
```

```tsx
// Usage
<h1 className="font-display text-display font-bold leading-tight tracking-tight">
  Ryder.AI
</h1>
```

**Source:** [Fluid Typography with Tailwind](https://tryhoverify.com/blog/fluid-typography-tricks-scaling-text-seamlessly-across-devices-with-tailwind-and-css-clamp/), [Clamp Generator Tool](https://clampgenerator.com/tools/font-size-typescale/)

**Why this pattern:** clamp(min, preferred, max) creates truly fluid typography without media queries. The preferred value uses viewport units (vw) to scale between minimum and maximum. Supported by 91.4% of browsers (2026).

### Pattern 7: Accessibility with prefers-reduced-motion

**What:** Respect user motion preferences by disabling or reducing animations when prefers-reduced-motion is enabled.

**When to use:** For all animations, transitions, and motion effects throughout the site.

**Example:**

```css
/* In globals.css after @theme */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```tsx
// Or use Tailwind motion-safe/motion-reduce variants
<div className="motion-safe:animate-fade-up motion-reduce:opacity-100">
  {/* Animates only if motion is safe */}
</div>
```

**Source:** [prefers-reduced-motion on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), [Tailwind Motion Variants](https://www.epicweb.dev/tips/motion-safe-and-motion-reduce-modifiers)

**Why this pattern:** Vestibular disorders affect 70M+ people. Animations can trigger discomfort. Setting animations to near-zero duration (0.01ms) respects user preferences while maintaining layout. Tailwind's motion-safe/motion-reduce variants provide utility-level control.

### Pattern 8: Table of Contents Extraction

**What:** Extract heading structure from markdown to generate a table of contents for article sidebar.

**When to use:** For article pages with sticky sidebar navigation.

**Example:**

```typescript
// lib/toc.ts
import { remark } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';

export interface TocHeading {
  depth: number;
  text: string;
  slug: string;
}

export async function extractToc(markdown: string): Promise<TocHeading[]> {
  const headings: TocHeading[] = [];

  await remark()
    .use(remarkParse)
    .use(() => (tree) => {
      visit(tree, 'heading', (node) => {
        if (node.depth >= 2 && node.depth <= 3) {
          const text = node.children
            .filter((child) => child.type === 'text')
            .map((child) => child.value)
            .join('');

          const slug = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

          headings.push({ depth: node.depth, text, slug });
        }
      });
    })
    .process(markdown);

  return headings;
}
```

**Source:** [remark-extract-toc](https://github.com/inokawa/remark-extract-toc), [Create Interactive TOC with Remark](https://claritydev.net/blog/nextjs-blog-remark-interactive-table-of-contents)

**Why this pattern:** Using the unified/remark pipeline to extract headings ensures consistency with markdown processing. The extracted TOC can then be rendered in the sidebar with anchor links.

### Anti-Patterns to Avoid

- **Building class names dynamically:** Don't use `className={"bg-" + color}` as Tailwind can't detect these at build time. Use safelist in config or full class names with conditional logic.
- **Using pixel values for breakpoints:** Don't mix `px` and `rem` in breakpoint definitions — stick to rem for consistency and accessibility.
- **Applying overflow:hidden to sticky ancestors:** This breaks sticky positioning. Always use `overflow: clip` instead.
- **Loading fonts without preconnect:** External font CDNs should always have `<link rel="preconnect">` for performance.
- **Ignoring prefers-reduced-motion:** Animations without reduced-motion support fail accessibility standards.
- **Nesting @theme inside selectors:** @theme variables must be top-level, not nested inside classes or media queries.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode toggle with flash prevention | Custom script with localStorage sync | next-themes library | Handles SSR flash prevention, localStorage sync, system preference detection, and React Context automatically |
| Syntax highlighting themes | Custom Shiki/Prism theme JSON | rehype-pretty-code with built-in themes | Already installed, has 100+ themes, supports dark/light mode switching |
| Table of contents generation | Manual heading parsing | remark-extract-toc or rehype-toc | Handles edge cases (special chars, duplicates, depth limits), integrates with unified pipeline |
| Responsive typography scaling | Manual breakpoint font sizes | CSS clamp() with viewport units | Truly fluid scaling without media queries, better UX, less code |
| Glass morphism effects | Custom backdrop filter CSS classes | Tailwind built-in backdrop utilities | backdrop-blur-{size}, bg-{color}/opacity already handle browser prefixes and fallbacks |
| Skip navigation link | Custom focus logic | Standard HTML with CSS focus-visible | Screen reader tested, keyboard navigation standard, simple CSS |

**Key insight:** These problems have subtle edge cases. Dark mode toggle has SSR flash issues. Syntax highlighting has browser compatibility concerns. TOC generation has slug collision risks. Custom solutions take weeks to get right; libraries solve these in minutes.

## Common Pitfalls

### Pitfall 1: SSR Flash with External Fonts

**What goes wrong:** When loading external fonts in Next.js App Router, there's a flash of unstyled text (FOUT) or invisible text (FOIT) on initial page load.

**Why it happens:** Fonts load asynchronously, and the browser shows fallback fonts until custom fonts are ready. Without proper font-display strategy, text may be invisible.

**How to avoid:**
- Use `display=swap` in the Fontshare URL (already included in the user's font URL)
- Add font-family fallbacks in Tailwind theme (e.g., `'Cabinet Grotesk', system-ui, sans-serif`)
- Consider font-display: optional for non-critical text

**Warning signs:** Text "pops" or changes appearance after page load; layout shifts as fonts load.

**Source:** [Vercel Font Optimization](https://vercel.com/blog/nextjs-next-font)

### Pitfall 2: Sticky Sidebar Broken by Overflow

**What goes wrong:** Article sidebar with `position: sticky` doesn't stick when scrolling — it scrolls away with the page.

**Why it happens:** Any ancestor element with `overflow: hidden` or `overflow: auto` creates a new scroll container, breaking sticky positioning. The sticky element sticks to that container, not the viewport.

**How to avoid:**
- Audit all ancestor elements for overflow properties
- Replace `overflow: hidden` with `overflow: clip` where possible
- If overflow scrolling is needed, ensure sticky element is not a descendant

**Warning signs:** Sidebar scrolls off screen; sticky doesn't "stick" at expected scroll positions.

**Source:** [Position Sticky Not Working](https://www.terluinwebdesign.nl/en/blog/position-sticky-not-working-try-overflow-clip-not-overflow-hidden/)

### Pitfall 3: Tailwind v4 @layer components vs @utility

**What goes wrong:** Custom CSS classes defined in `@layer components` get purged in production even though they're used in JSX.

**Why it happens:** Tailwind v4 changed how `@layer components` works. It's now for component-level styles that don't get purged, but to register purgeable custom utilities, you need `@utility`.

**How to avoid:**
- Use `@utility` for custom utility classes that should be purged
- Use `@layer components` for component styles that should always be included
- Prefer `@theme` for design tokens that generate utilities

**Warning signs:** Classes work in dev but disappear in production build; "class not found" in production.

**Source:** [Tailwind v4 @utility Discussion](https://github.com/tailwindlabs/tailwindcss/discussions/17526)

### Pitfall 4: Animation Without Reduced Motion Support

**What goes wrong:** Animations cause nausea, dizziness, or discomfort for users with vestibular disorders.

**Why it happens:** Developers add animations without considering `prefers-reduced-motion` media query, which users with motion sensitivity enable in their OS settings.

**How to avoid:**
- Add global CSS rule to disable/minimize animations when `prefers-reduced-motion: reduce`
- Use Tailwind's `motion-safe:` and `motion-reduce:` variants for selective animation
- Set animation-duration to 0.01ms (not 0s) to preserve layout while removing motion

**Warning signs:** Accessibility audit flags animations; users report discomfort; WCAG 2.1 Animation from Interactions failure.

**Source:** [prefers-reduced-motion MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

### Pitfall 5: Mixing rem and px in Breakpoints

**What goes wrong:** Responsive utilities apply in unexpected order; breakpoints don't respect user font size preferences.

**Why it happens:** Tailwind sorts breakpoints numerically. Mixing `px` (absolute) and `rem` (relative) units causes incorrect sorting. Example: `640px` might be smaller than `48rem` at default font size but larger when user increases text size.

**How to avoid:**
- Always use rem for custom breakpoints in Tailwind v4
- Convert px values: divide by 16 (e.g., 768px = 48rem)
- Test with browser zoom and font size changes

**Warning signs:** Layout breaks at certain zoom levels; breakpoints trigger out of order.

**Source:** [Tailwind Breakpoints Discussion](https://github.com/tailwindlabs/tailwindcss/discussions/8378)

### Pitfall 6: rehype-pretty-code Dark Mode Mismatch

**What goes wrong:** Code blocks have light theme when site is in dark mode, or vice versa.

**Why it happens:** rehype-pretty-code theme is set at build time, not runtime. If using a dark theme but implementing a light mode toggle, code blocks won't switch.

**How to avoid:**
- For dark-only sites: use a single dark theme (e.g., `github-dark-dimmed`)
- For toggleable themes: configure rehype-pretty-code with both light and dark themes, use CSS to hide/show appropriate version
- Alternative: use `keepBackground: false` and apply background via CSS variables

**Warning signs:** Code blocks don't match site theme; syntax highlighting has wrong color scheme.

**Source:** [Rehype Pretty Code Docs](https://rehype-pretty.pages.dev/)

### Pitfall 7: Category Color Mapping Without Safelist

**What goes wrong:** Dynamic category colors (e.g., `bg-${categoryColor}`) don't appear in production build.

**Why it happens:** Tailwind can't detect dynamically constructed class names. If category colors come from content/config, those classes get purged unless safelisted.

**How to avoid:**
- Define category color mapping in component: `const categoryColors = { models: 'bg-purple', tools: 'bg-teal', ... }`
- Use full class names with conditional logic: `className={category === 'models' ? 'bg-purple' : 'bg-teal'}`
- Or safelist in globals.css: `@safelist { bg-purple bg-teal bg-amber bg-pink bg-cyan bg-green }`

**Warning signs:** Colors missing in production; Tailwind only generates gray/default colors.

**Source:** [Tailwind Content Configuration](https://tailwindcss.com/docs/content-configuration)

## Code Examples

Verified patterns from official sources:

### Background Mesh Component

```css
/* src/app/globals.css - Fixed position gradient mesh */
.bg-mesh {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 60% 50% at 10% 20%, rgba(0, 229, 204, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 85% 15%, rgba(139, 92, 246, 0.05) 0%, transparent 55%),
    radial-gradient(ellipse 40% 50% at 50% 80%, rgba(255, 179, 71, 0.04) 0%, transparent 50%);
}
```

**Source:** Variant-2-color reference design (lines 71-80)

### Status Badge with Pill Shape

```tsx
// components/ui/StatusBadge.tsx
interface StatusBadgeProps {
  status: 'stable' | 'in-progress' | 'complete';
}

const statusConfig = {
  stable: {
    color: 'bg-teal/10 text-teal border-teal/20',
    dotColor: 'bg-teal',
    label: 'Stable',
  },
  'in-progress': {
    color: 'bg-amber/10 text-amber border-amber/20',
    dotColor: 'bg-amber',
    label: 'In Progress',
  },
  complete: {
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    dotColor: 'bg-green-500',
    label: 'Complete',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-[100px] border px-3 py-1 text-xs font-medium ${config.color}`}>
      <div className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </div>
  );
}
```

**Source:** Variant-2-color status badge pattern

### Glass Card with Hover Effect

```tsx
// components/ui/CategoryCard.tsx
interface CategoryCardProps {
  name: string;
  count: number;
  color: string;
  href: string;
}

export function CategoryCard({ name, count, color, href }: CategoryCardProps) {
  return (
    <a
      href={href}
      className="group relative overflow-hidden rounded-card border border-white/[0.08] bg-glass p-6 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.16] hover:shadow-lg"
    >
      {/* Top accent bar on hover */}
      <div
        className="absolute inset-x-0 top-0 h-1 scale-x-0 transition-transform duration-200 group-hover:scale-x-100"
        style={{ backgroundColor: color }}
      />

      {/* Icon */}
      <div
        className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}20` }}
      >
        {/* Icon SVG */}
      </div>

      {/* Content */}
      <h3 className="mb-1 font-display text-lg font-bold leading-tight tracking-tight text-primary">
        {name}
      </h3>
      <p className="text-sm text-muted">
        {count} {count === 1 ? 'article' : 'articles'}
      </p>
    </a>
  );
}
```

**Source:** Variant-2-color category card pattern

### Sticky Article Sidebar

```tsx
// app/[category]/[slug]/page.tsx
export default async function ArticlePage({ params }) {
  const { category, slug } = await params;
  const article = await fetchArticle(category, slug);
  const toc = await extractToc(article.content);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Back link */}
      <Link
        href={`/${category}`}
        className="mb-8 inline-flex items-center gap-2 rounded-[100px] border border-white/[0.08] bg-glass px-4 py-2 text-sm font-medium text-teal backdrop-blur-sm transition-colors hover:border-teal/50 hover:bg-teal/10"
      >
        ← Back to {category}
      </Link>

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Sticky sidebar */}
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="space-y-6">
            <StatusBadge status={article.status} />

            {/* Metadata */}
            <div className="space-y-2 text-sm">
              <p className="text-muted">Author: {article.author}</p>
              <p className="text-muted">Created: {article.created}</p>
              <p className="text-muted">Updated: {article.updated}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${tag}`}
                  className="rounded-[100px] border border-white/[0.08] bg-glass px-3 py-1 text-xs text-muted transition-colors hover:border-white/[0.16] hover:text-primary"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* Table of contents */}
            <nav className="space-y-1">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
                On this page
              </h4>
              {toc.map((heading) => (
                <a
                  key={heading.slug}
                  href={`#${heading.slug}`}
                  className={`block py-1 text-sm transition-colors hover:text-teal ${
                    heading.depth === 3 ? 'pl-4 text-muted' : 'font-medium text-primary'
                  }`}
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Article content */}
        <article className="min-w-0 max-w-prose">
          {/* Content */}
        </article>
      </div>
    </div>
  );
}
```

**Source:** Variant-4-spatial article layout pattern

### Responsive Article List

```tsx
// app/page.tsx - Article list rows
<div className="space-y-3">
  {articles.map((article) => (
    <Link
      key={article.slug}
      href={`/${article.category}/${article.slug}`}
      className="group grid grid-cols-[4px_1fr] gap-4 rounded-lg border border-white/[0.08] bg-glass p-4 backdrop-blur-sm transition-all hover:border-white/[0.16] hover:shadow-md md:grid-cols-[4px_1fr_auto]"
    >
      {/* Colored accent bar */}
      <div
        className="rounded-full"
        style={{ backgroundColor: categoryColors[article.category] }}
      />

      {/* Content */}
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className="font-semibold"
            style={{ color: categoryColors[article.category] }}
          >
            {article.category}
          </span>
          <span className="text-muted">·</span>
          <time className="text-muted">{article.created}</time>
        </div>

        <h3 className="font-display text-lg font-bold leading-tight tracking-tight text-primary group-hover:text-teal">
          {article.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-[100px] border border-white/[0.08] bg-elevated px-2 py-0.5 text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Status badge (wraps on mobile, stays right on desktop) */}
      <div className="md:self-start">
        <StatusBadge status={article.status} />
      </div>
    </Link>
  ))}
</div>
```

**Source:** Variant-2-color article list pattern

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JavaScript tailwind.config.js | CSS-based @theme directive | Tailwind v4.0 (2024) | 5x faster builds, CSS-native theme sharing, better DX |
| PurgeCSS for unused styles | Built-in JIT compilation | Tailwind v3.0 (2021) | Automatic purging, no config needed, faster builds |
| next/font/google only | next/font supports local + CDN | Next.js 13+ (2022) | Self-hosting for privacy, external CDN for convenience |
| Media queries for dark mode | CSS variables + class toggle | Modern standard (2020+) | Runtime theming, no FOUC with proper script |
| Fixed px breakpoints | rem-based responsive units | Accessibility standard (ongoing) | Respects user font preferences, better UX |
| @layer components for utilities | @utility directive | Tailwind v4.0 (2024) | Proper purging, clearer intent, less confusion |

**Deprecated/outdated:**
- **purge configuration:** Replaced by `content` in v3, now automatic in v4
- **@apply in components:** Discouraged in favor of utility classes or @utility
- **Dark mode via separate CSS files:** Replaced by CSS variables + class toggle
- **next/head for fonts:** Use Next.js metadata API in App Router instead

## Open Questions

1. **Dark mode toggle implementation vs dark-only approach**
   - What we know: Variant-2-color has dark palette only; variant-4-spatial has warm light palette
   - What's unclear: Whether to implement full toggle or defer light mode to future phase
   - Recommendation: Start with dark-only (simpler), add toggle later if needed. Success criteria says "toggle between light and dark mode" but light palette isn't designed. Document this gap.

2. **Background mesh implementation: CSS vs Component**
   - What we know: Mesh is fixed-position radial gradients with low opacity
   - What's unclear: Whether to use global CSS class or React component with inline styles
   - Recommendation: Use global CSS class (`.bg-mesh`) applied once in layout. No need for component overhead. Simpler and more performant.

3. **Font loading strategy: External CDN vs self-hosted**
   - What we know: Fontshare fonts not available through next/font, external link specified in user constraints
   - What's unclear: Whether self-hosting is worth the effort for performance gains
   - Recommendation: Start with external CDN as specified (simpler). Can migrate to self-hosted later if performance metrics show significant improvement opportunity.

4. **Table of contents implementation depth**
   - What we know: Sidebar should have TOC based on variant-4-spatial
   - What's unclear: Whether to extract all headings (h2-h6) or limit to h2-h3; whether to add scroll spy active state
   - Recommendation: Extract h2-h3 only (most common pattern). Skip scroll spy for now (adds complexity, not in reference design).

5. **Bundle size optimization strategy**
   - What we know: Success criteria requires <200KB initial JS
   - What's unclear: Whether current bundle meets this or optimization needed
   - Recommendation: Measure first, optimize second. Run `next build` and check bundle size. If over budget, dynamic import for SearchBar (already implemented) and analyze with @next/bundle-analyzer.

## Sources

### Primary (HIGH confidence)

- [Tailwind CSS v4 Theme Documentation](https://tailwindcss.com/docs/theme) - @theme directive syntax and configuration
- [Tailwind CSS Backdrop Filter](https://tailwindcss.com/docs/backdrop-filter) - Glass morphism utilities
- [Next.js Font Optimization Docs](https://nextjs.org/docs/app/getting-started/fonts) - Font loading strategies
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design) - Breakpoint system
- [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) - Accessibility standard
- [Rehype Pretty Code Docs](https://rehype-pretty.pages.dev/) - Code highlighting configuration

### Secondary (MEDIUM confidence)

- [Tailwind v4 Multi-Theme Strategy](https://simonswiss.com/posts/tailwind-v4-multi-theme) - WebSearch verified with official source
- [Build Multi-Theme with Tailwind v4](https://medium.com/render-beyond/build-a-flawless-multi-theme-ui-using-new-tailwind-css-v4-react-dca2b3c95510) - Implementation patterns
- [CSS Position Sticky Fix](https://www.terluinwebdesign.nl/en/blog/position-sticky-not-working-try-overflow-clip-not-overflow-hidden/) - overflow:clip solution
- [Fluid Typography with clamp()](https://tryhoverify.com/blog/fluid-typography-tricks-scaling-text-seamlessly-across-devices-with-tailwind-and-css-clamp/) - Responsive text patterns
- [Next.js Bundle Optimization](https://www.syncfusion.com/blogs/post/optimize-next-js-app-bundle) - Performance strategies
- [remark-extract-toc](https://github.com/inokawa/remark-extract-toc) - TOC generation library

### Tertiary (LOW confidence - needs validation)

- [Next.js Dark Mode with localStorage](https://medium.com/@kjinengineer/dont-use-localstorage-for-dark-mode-in-next-js-here-s-a-better-way-f6d4c98c3c07) - Implementation approach (community article)
- [Tailwind Animation Delay in v4](https://blurp.dev/blog/tailwind-animation-delay-property) - Custom @utility pattern (blog post)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Core libraries already installed, Tailwind v4 and Next.js 16 are current and stable
- Architecture: HIGH - Patterns verified from official docs and reference designs
- Pitfalls: MEDIUM-HIGH - Most from official sources, some from community experience

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days — stable domain)

**Dependencies:**
- Current stack: Next.js 16.1.6, Tailwind CSS 4, @tailwindcss/typography 0.5.19, rehype-pretty-code 0.14.1
- Reference designs: designs/variant-4-spatial/ and designs/variant-2-color/

**Next steps for planner:**
1. Create component transformation plan (Layout, Homepage, Article page, UI components)
2. Define Tailwind theme configuration strategy (@theme vs CSS variables)
3. Outline responsive breakpoint implementation
4. Plan accessibility verification (skip nav, focus states, reduced motion)
5. Consider bundle size measurement and optimization if needed
