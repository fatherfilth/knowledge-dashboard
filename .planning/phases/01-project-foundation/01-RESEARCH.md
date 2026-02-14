# Phase 1: Project Foundation - Research

**Researched:** 2026-02-14
**Domain:** Next.js 15, Vercel deployment, development environment setup
**Confidence:** HIGH

## Summary

Phase 1 establishes the Next.js 15 development environment with a production-ready tech stack. The modern Next.js ecosystem provides a mature, well-documented foundation with excellent Vercel integration. The default setup via `create-next-app` handles TypeScript, Tailwind CSS, ESLint, and the App Router automatically, eliminating most configuration complexity. Vercel's GitHub integration provides zero-config deployments with automatic preview builds for pull requests.

The research confirms that Next.js 15 is stable, production-ready, and ships with React 19 support. The App Router with Server Components is the recommended architecture, defaulting to server-side rendering for optimal performance. Tailwind CSS v3 (with v4 available) provides the minimal, modern design foundation required for the Ryder.AI landing page.

**Primary recommendation:** Use `create-next-app@latest` with default recommendations (TypeScript, Tailwind, ESLint, App Router, Turbopack). Deploy to Vercel via GitHub integration for automatic deployments and preview builds.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Project structure:**
- ESLint + Prettier configured from day one with standard Next.js ESLint config

**Deployment config:**
- Vercel default URL (no custom domain for now)
- Preview deployments enabled for branches/PRs
- GITHUB_TOKEN environment variable placeholder set up in Vercel config now (ready for Phase 2)
- GitHub integration for auto-deploys on push and PR preview builds

**Starter content:**
- Styled landing page (not minimal title, not skeleton layout)
- Site name: **Ryder.AI**
- Minimal & modern vibe — lots of whitespace, sharp typography, no clutter (Linear/Raycast feel)

### Claude's Discretion

- Folder structure and component organization approach
- Import path convention
- Tagline copy for the landing page
- Typography and spacing choices within the minimal & modern direction
- Tailwind configuration defaults

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.5+ (latest stable) | React framework with App Router, SSR, static generation | Industry standard for React apps. Built-in routing, optimizations, Vercel integration. App Router is recommended path forward. |
| React | 19.x | UI library | Next.js 15 ships with React 19 stable support. Server Components are core architecture. |
| TypeScript | 5.1.0+ | Type safety | Built-in Next.js support. Auto-generates tsconfig.json. Standard for new projects in 2026. |
| Tailwind CSS | 3.x (v4 available) | Utility-first CSS framework | Official Next.js integration. Zero config needed with create-next-app. Perfect for minimal modern designs. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ESLint | latest | Code linting | Standard with Next.js. Use `eslint-config-next/core-web-vitals` for production. |
| Prettier | 3.x | Code formatting | Prevents conflicts with ESLint. Use with `eslint-config-prettier` and `prettier-plugin-tailwindcss`. |
| prettier-plugin-tailwindcss | latest | Auto-sort Tailwind classes | Official Tailwind plugin. Enforces consistent class order. |
| Turbopack | (built-in) | Development bundler | Default in Next.js 15+. Faster than Webpack, zero config. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind CSS | CSS Modules, Styled Components | Tailwind better for rapid prototyping, design systems, minimal builds. User decision locked. |
| Vercel | Netlify, Cloudflare Pages | Vercel offers best Next.js integration (same company), automatic optimization. User decision locked. |
| ESLint | Biome | Biome is faster but ESLint has broader ecosystem. User decision locked. |

**Installation:**
```bash
# Automated via create-next-app (recommended)
npx create-next-app@latest my-app --yes
cd my-app

# Manual supporting packages (if needed after init)
npm install -D prettier eslint-config-prettier prettier-plugin-tailwindcss
```

## Architecture Patterns

### Recommended Project Structure

Next.js 15 defaults to App Router with file-system routing. The standard structure with `src/` directory:

```
knowledge-dashboard/
├── src/
│   ├── app/                 # App Router - file-system routing
│   │   ├── layout.tsx       # Root layout (required)
│   │   ├── page.tsx         # Home page (/)
│   │   └── globals.css      # Global styles, Tailwind imports
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Atomic UI elements (buttons, etc.)
│   │   └── ...              # Feature components
│   ├── lib/                 # Utility functions, helpers
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets (images, fonts)
├── .env.local               # Local environment variables
├── .gitignore               # Git ignore patterns
├── eslint.config.mjs        # ESLint configuration (flat config)
├── prettier.config.js       # Prettier configuration
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
├── next.config.ts           # Next.js configuration
└── package.json             # Dependencies and scripts
```

**Rationale:**
- `src/` directory separates application code from config files (cleaner root)
- `app/` contains routes via file-system (layout.tsx + page.tsx pattern)
- `components/` organized by atomic design (ui/ for primitives, feature components at root)
- Path aliases (`@/components`, `@/lib`) enabled by default for clean imports

### Pattern 1: Server Components by Default

**What:** All components in App Router are Server Components by default. They render on the server, send HTML to client, no JavaScript bundle.

**When to use:** Use Server Components unless you need:
- Browser APIs (window, localStorage)
- React hooks (useState, useEffect, useContext)
- Event handlers (onClick, onChange)

**Example:**
```typescript
// app/page.tsx - Server Component (default)
// Source: https://nextjs.org/docs/app/getting-started/server-and-client-components

export default function Page() {
  // Can fetch data, access databases, use secrets
  return (
    <main className="min-h-screen p-24">
      <h1>Ryder.AI</h1>
    </main>
  )
}
```

### Pattern 2: Client Components at the Leaves

**What:** Add `"use client"` directive to create Client Components. Push them to leaf nodes of component tree.

**When to use:** Only when component needs interactivity (buttons, forms) or browser APIs.

**Example:**
```typescript
// components/ui/button.tsx - Client Component
// Source: https://nextjs.org/docs/app/api-reference/directives/use-client

'use client'

export function Button({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>
}
```

### Pattern 3: Font Optimization with next/font

**What:** Use `next/font` to self-host fonts. Eliminates external requests, prevents layout shift.

**When to use:** Always, for any custom fonts. Google Fonts or local font files.

**Example:**
```typescript
// app/layout.tsx
// Source: https://nextjs.org/docs/app/getting-started/fonts

import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

### Pattern 4: Path Aliases for Clean Imports

**What:** Use `@/` prefix for absolute imports. Configured automatically by create-next-app.

**When to use:** All internal imports (components, lib, types).

**Example:**
```typescript
// tsconfig.json (auto-generated)
// Source: https://nextjs.org/docs/app/getting-started/installation

{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// Usage in components
import { Button } from '@/components/ui/button'  // Good
import { Button } from '../../../components/ui/button'  // Avoid
```

### Pattern 5: Minimal Modern Design with Tailwind

**What:** Use Tailwind utility classes for minimal design. Focus on whitespace, typography hierarchy, subtle borders.

**When to use:** All styling. Matches Linear/Raycast aesthetic per user requirements.

**Example:**
```typescript
// Landing page with minimal modern design
// Inspired by: Linear, Raycast design systems

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-4xl px-8 py-16 space-y-8">
        <h1 className="text-6xl font-bold tracking-tight text-gray-900">
          Ryder.AI
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
          Modern knowledge curation powered by AI
        </p>
      </div>
    </main>
  )
}
```

### Anti-Patterns to Avoid

- **Don't use `"use client"` at top level:** Mark only components that need interactivity, not entire page
- **Don't use `<img>` tags:** Use `next/image` for automatic optimization
- **Don't import Server Components into Client Components:** Breaks the server/client boundary
- **Don't use Pages Router for new projects:** App Router is the recommended architecture
- **Don't manually configure Webpack:** Turbopack is default, faster, zero config
- **Don't commit .env files:** Use .env.local for secrets, add .env* to .gitignore

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image optimization | Custom lazy loading, format conversion | `next/image` | Handles responsive images, lazy loading, WebP conversion, size optimization automatically |
| Font loading | Manual font @import, link tags | `next/font` | Self-hosts fonts, prevents layout shift, optimizes loading |
| Routing | Custom React Router setup | App Router (file-system) | Built-in, automatic code splitting, prefetching, nested layouts |
| Code formatting | Manual style guide enforcement | Prettier + ESLint | Automated formatting, prevents team conflicts |
| Class sorting | Manual Tailwind organization | prettier-plugin-tailwindcss | Official plugin, consistent order, zero config |
| Environment variables | Custom config management | .env.local + NEXT_PUBLIC_ prefix | Built-in Next.js support, type-safe, deployment-ready |
| Static asset serving | Custom CDN setup | /public directory | Automatic optimization, Vercel CDN integration |

**Key insight:** Next.js ecosystem is mature. Most problems have official solutions that handle edge cases better than custom code. Use framework conventions.

## Common Pitfalls

### Pitfall 1: Hydration Errors from Server/Client Mismatch

**What goes wrong:** Server renders different HTML than client expects. Common causes: Date.now(), random values, browser-only APIs in Server Components.

**Why it happens:** Server and client render at different times. Random/time-based values differ. Browser APIs (window, localStorage) don't exist on server.

**How to avoid:**
- Use `"use client"` for components using browser APIs
- Avoid Date.now(), Math.random() in Server Components
- Use suppressHydrationWarning for time-sensitive content
- Next.js 15 improved error messages show exact source

**Warning signs:**
- Console error: "Hydration failed"
- Flash of different content on page load
- React devtools warning about mismatched attributes

### Pitfall 2: Overusing `"use client"`

**What goes wrong:** Marking entire pages as Client Components loses Server Component benefits (faster load, smaller bundle, server data fetching).

**Why it happens:** Developers default to Pages Router patterns or don't understand Server/Client boundary.

**How to avoid:**
- Start with Server Components (default)
- Add `"use client"` only to interactive leaves
- Composition: Server Component → Client Component → Server Component (as children)
- Check bundle size: should be minimal for static pages

**Warning signs:**
- Large JavaScript bundles for static content
- Slow initial page loads
- Can't use database queries directly in component

### Pitfall 3: ESLint/Prettier Conflicts

**What goes wrong:** ESLint formatting rules conflict with Prettier. Files get reformatted repeatedly.

**Why it happens:** Both tools have formatting rules. ESLint fixes code quality AND format. Prettier only fixes format.

**How to avoid:**
- Install `eslint-config-prettier` to disable ESLint formatting rules
- Use Prettier for formatting, ESLint for code quality
- Add Prettier plugin to ESLint config
- Configure editor to format on save

**Warning signs:**
- Git diffs show whitespace changes
- Code changes after running eslint --fix
- Team members have different formatting

### Pitfall 4: Environment Variable Exposure

**What goes wrong:** Secrets leak to client bundle. NEXT_PUBLIC_ prefix exposes variables to browser.

**Why it happens:** Misunderstanding prefix behavior. All NEXT_PUBLIC_ vars are bundled into client JavaScript.

**How to avoid:**
- Never use NEXT_PUBLIC_ for secrets (API keys, tokens)
- Server-only secrets: no prefix, access in Server Components only
- Client-safe values: NEXT_PUBLIC_ prefix (e.g., public analytics IDs)
- Use .env.local for local secrets, Vercel dashboard for production

**Warning signs:**
- API keys visible in browser devtools
- .env file committed to git
- Console warnings about exposed variables

### Pitfall 5: Incorrect .gitignore Setup

**What goes wrong:** Build artifacts, node_modules, secrets committed to git. Large repo size, security risks.

**Why it happens:** Missing or incomplete .gitignore. Custom build outputs not listed.

**How to avoid:**
- Use Next.js official .gitignore template (auto-generated by create-next-app)
- Always include: .next/, node_modules/, .env*.local, out/, build/
- Add next-env.d.ts (auto-generated TypeScript file)
- Never commit .env files with secrets

**Warning signs:**
- .next/ directory in git
- .env files in commits
- Large git repository size
- Merge conflicts in build files

### Pitfall 6: Vercel Environment Variable Scope Confusion

**What goes wrong:** Variables set for wrong environment (production/preview/development). Build-time variables not available.

**Why it happens:** Vercel has three environment scopes. Build-time variables must be set before deployment.

**How to avoid:**
- Set GITHUB_TOKEN for all environments (production, preview, development)
- Preview environment uses environment variables from preview scope
- Production environment only uses production scope variables
- Variables are frozen at build time for static pages

**Warning signs:**
- Different behavior between local and deployed
- Environment variables undefined in preview
- Build succeeds locally, fails on Vercel

## Code Examples

Verified patterns from official sources:

### Initialize New Next.js 15 Project

```bash
# Source: https://nextjs.org/docs/app/getting-started/installation

# Recommended: Use defaults (TypeScript, Tailwind, ESLint, App Router, Turbopack)
npx create-next-app@latest knowledge-dashboard --yes
cd knowledge-dashboard

# Starts dev server on http://localhost:3000
npm run dev
```

### ESLint Configuration (Flat Config)

```javascript
// eslint.config.mjs
// Source: https://nextjs.org/docs/app/api-reference/config/eslint

import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
```

### Prettier Configuration with Tailwind

```javascript
// prettier.config.js
// Source: https://github.com/tailwindlabs/prettier-plugin-tailwindcss

module.exports = {
  plugins: ['prettier-plugin-tailwindcss'],
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  printWidth: 80,
  arrowParens: 'avoid',
}
```

### Root Layout with Font Optimization

```typescript
// src/app/layout.tsx
// Source: https://nextjs.org/docs/app/getting-started/fonts

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Ryder.AI',
  description: 'Modern knowledge curation powered by AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
```

### Minimal Modern Landing Page

```typescript
// src/app/page.tsx
// Inspired by: Linear (linear.app), Raycast (raycast.com)

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-5xl w-full px-8 py-24 space-y-12">
        {/* Hero section */}
        <div className="space-y-6">
          <h1 className="text-7xl font-bold tracking-tight text-gray-900">
            Ryder.AI
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl leading-relaxed">
            Modern knowledge curation powered by AI.
            Discover, organize, and explore documentation with intelligence.
          </p>
        </div>

        {/* Subtle visual separator */}
        <div className="h-px bg-gray-200 max-w-xl" />

        {/* Secondary content */}
        <div className="text-sm text-gray-500">
          <p>Built with Next.js, deployed on Vercel</p>
        </div>
      </div>
    </main>
  )
}
```

### Tailwind Configuration

```typescript
// tailwind.config.ts
// Source: https://tailwindcss.com/docs/guides/nextjs

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

### Global Styles (Tailwind Imports)

```css
/* src/app/globals.css */
/* Source: https://tailwindcss.com/docs/guides/nextjs */

@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Standard .gitignore

```gitignore
# Source: https://github.com/github/gitignore/blob/main/Nextjs.gitignore

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

### Vercel Deployment (via GitHub Integration)

```bash
# Source: https://vercel.com/docs/git/vercel-for-github

# 1. Push code to GitHub
git add .
git commit -m "Initial Next.js setup"
git push origin main

# 2. Connect repository to Vercel (via dashboard)
# - Import project from GitHub
# - Vercel auto-detects Next.js
# - Configure environment variables:
#   - GITHUB_TOKEN (placeholder for Phase 2)
#   - Set for: Production, Preview, Development

# 3. Automatic deployments
# - Push to main → production deployment
# - Open PR → preview deployment with unique URL
# - Every commit → new deployment
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router (`pages/` directory) | App Router (`app/` directory) | Next.js 13+ (stable in 15) | Server Components default, nested layouts, streaming, better performance |
| Webpack bundler | Turbopack bundler | Next.js 15 (default) | 5x faster builds, zero config, better DX |
| next lint command | ESLint CLI directly | Next.js 16 (deprecated in 15.5) | More flexible, standard tooling, codemod available |
| Manual font loading | next/font module | Next.js 13+ | Self-hosted fonts, no layout shift, privacy |
| getServerSideProps | Server Components + async/await | Next.js 13+ (App Router) | Simpler data fetching, better composition |
| .eslintrc.json config | eslint.config.mjs (flat config) | ESLint 9+ | Flatter structure, better JavaScript control |
| React 18 | React 19 | Next.js 15 (stable support) | Server Actions stable, improved hydration errors, better streaming |

**Deprecated/outdated:**
- `output: "standalone"` for Vercel deployments: Not needed, Vercel auto-detects framework
- `next/head` in App Router: Use `metadata` export in layout/page instead
- `_document.js` for fonts: Use `next/font` in layout.tsx
- `next lint` command: Use `eslint` CLI with eslint.config.mjs

## Open Questions

1. **Folder structure convention for components**
   - What we know: User has discretion. Common patterns: atomic design (ui/, features/), by-route, flat structure
   - What's unclear: No single "blessed" structure for Next.js 15. Team preference varies
   - Recommendation: Use atomic design (components/ui/ for primitives, components/ for features). Matches shadcn/ui conventions, scales well

2. **Import path style consistency**
   - What we know: User has discretion. Default is `@/*` pointing to `src/*`
   - What's unclear: Whether to use `@/components`, `@/lib` or more granular aliases
   - Recommendation: Stick with single `@/*` alias for simplicity. Avoid over-aliasing

3. **Tagline and copy for landing page**
   - What we know: User has discretion. Site name is "Ryder.AI", minimal modern aesthetic
   - What's unclear: Specific messaging, target audience emphasis
   - Recommendation: Focus on "knowledge curation" and "AI-powered" themes. Iterate after deployment

## Sources

### Primary (HIGH confidence)

- [Next.js Installation Docs](https://nextjs.org/docs/app/getting-started/installation) - Official installation guide, verified Feb 11, 2026
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) - App Router architecture
- [Next.js ESLint Plugin](https://nextjs.org/docs/app/api-reference/config/eslint) - Official ESLint configuration
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) - next/font usage
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github) - Deployment setup
- [Tailwind CSS Next.js Guide](https://tailwindcss.com/docs/guides/nextjs) - Official integration
- [GitHub Next.js .gitignore Template](https://github.com/github/gitignore/blob/main/Nextjs.gitignore) - Standard patterns
- [Prettier Tailwind Plugin](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) - Official class sorting

### Secondary (MEDIUM confidence)

- [Next.js 15 Release Notes](https://nextjs.org/blog/next-15) - Feature overview, React 19 support
- [Next.js 15.5 Release Notes](https://nextjs.org/blog/next-15-5) - Latest stable updates
- [Next.js Project Structure Guide](https://www.wisp.blog/blog/the-ultimate-guide-to-organizing-your-nextjs-15-project-structure) - Community best practices
- [Tailwind Best Practices 2026](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns) - Design systems
- [Minimalist Landing Page Trends 2026](https://www.involve.me/blog/minimalist-landing-page-examples) - Design inspiration

### Tertiary (LOW confidence)

- Various blog posts on Next.js 15 patterns - Community experiences, not official guidance
- Design inspiration from Linear/Raycast - Visual reference only, not technical specs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Next.js docs, stable releases, widely adopted
- Architecture: HIGH - Official patterns, App Router is stable and recommended
- Pitfalls: MEDIUM-HIGH - Mix of official docs (hydration) and community experience (ESLint conflicts)
- Design patterns: MEDIUM - User requirements specific, Tailwind conventions established

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (30 days - stable framework, slow-moving changes)

**Key technologies researched:**
- Next.js 15.5 (latest stable in 15.x line)
- React 19 (stable support in Next.js 15)
- TypeScript 5.1.0+
- Tailwind CSS 3.x
- ESLint 9+ (flat config)
- Prettier 3.x
- Vercel deployment platform
