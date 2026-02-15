# Technology Stack

**Analysis Date:** 2026-02-15

## Languages

**Primary:**
- TypeScript 5.x - Core application code and configuration, strict mode enabled
- JSX/TSX - React component definitions

**Secondary:**
- JavaScript - Build and configuration files (ESLint, Prettier configs)

## Runtime

**Environment:**
- Node.js (unspecified minor version, targets ES2017 and esnext in compilation)

**Package Manager:**
- npm - Installed dependencies and scripts
- Lockfile: `package-lock.json` (present, committed to git)

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with App Router, server components, static generation
- React 19.2.3 - Component library and hooks
- React DOM 19.2.3 - DOM rendering for React

**Markdown Processing:**
- unified 11.0.5 - Text processing ecosystem
- remark-parse 11.0.0 - Markdown parser
- remark-gfm 4.0.1 - GitHub Flavored Markdown support
- remark-rehype 11.1.2 - Remark to Rehype bridge
- rehype-slug 6.0.0 - Add `id` attributes to headings
- rehype-pretty-code 0.14.1 - Syntax highlighting for code blocks
- rehype-stringify 10.0.1 - Serialize Rehype AST to HTML
- gray-matter 4.0.3 - YAML frontmatter extraction from markdown

**Syntax Highlighting:**
- shiki 3.22.0 - Syntax highlighting engine used by rehype-pretty-code

**Search & Filtering:**
- fuse.js 7.1.0 - Client-side fuzzy search with weighted keys
- use-debounce 10.1.0 - Debounce hook for search input

**Styling:**
- Tailwind CSS 4.x - Utility-first CSS framework
- @tailwindcss/typography 0.5.19 - Prose styling for markdown content
- @tailwindcss/postcss 4 - Tailwind CSS PostCSS plugin
- PostCSS 4.x - CSS processing via postcss.config.mjs

**Data Validation:**
- zod 4.3.6 - Runtime schema validation for article frontmatter

## Key Dependencies

**Critical:**
- octokit 5.0.5 - GitHub REST API client, fetches content from remote repository
- next 16.1.6 - Framework foundation; enables dynamic imports, SSG, API routes

**Infrastructure:**
- @types/node 20.x - Node.js type definitions
- @types/react 19.x - React type definitions
- @types/react-dom 19.x - React DOM type definitions

## Build & Dev Tools

**Build:**
- @swc/core 1.15.11 - Rust-based JavaScript transpiler for faster builds
- SWC is integrated via Next.js for production optimization

**Development:**
- tsx 4.21.0 - TypeScript execution in Node.js, used for scripts/verify-content.ts
- ts-node 10.9.2 - TypeScript execution runtime (development)

**Linting & Formatting:**
- ESLint 9.x - JavaScript/TypeScript linting
- eslint-config-next 16.1.6 - Next.js ESLint configuration
- eslint-config-prettier 10.1.8 - Disables ESLint rules that conflict with Prettier
- Prettier 3.8.1 - Code formatter
- prettier-plugin-tailwindcss 0.7.2 - Tailwind CSS class sorting in Prettier

## Configuration

**Environment:**
- `.env.local` file present - Contains `GITHUB_TOKEN` (required for GitHub API authentication)
- Token-based authentication: `process.env.GITHUB_TOKEN` passed to Octokit constructor
- Falls back to unauthenticated mode (60 req/hr limit) if token not set
- Authenticated mode provides 5000 req/hr limit

**Build Configuration:**
- `tsconfig.json` - TypeScript compiler options (ES2017 target, strict mode, jsx: react-jsx)
- `next.config.ts - Next.js configuration (currently minimal/empty)
- `postcss.config.mjs - PostCSS configuration for Tailwind CSS
- `eslint.config.mjs` - ESLint flat config combining Next.js, TypeScript, and Prettier rules
- `prettier.config.js` - Prettier configuration

**Compiler Settings:**
- Target: ES2017 (ECMAScript 2017)
- Module resolution: bundler (optimized for bundlers like webpack/esbuild)
- Path aliases: `@/*` maps to `./src/*`
- Strict TypeScript enabled: `strict: true`
- JSX: react-jsx (React 17+ transform)

## Platform Requirements

**Development:**
- Node.js with npm
- TypeScript 5.x knowledge for development
- GitHub account with repository access for fetching content via GitHub API

**Production:**
- Node.js runtime (same as development)
- Deployment target: Vercel (implicit from Next.js 16.1.6 setup), or any Node.js host
- Environment variable: `GITHUB_TOKEN` required for production-grade rate limits

## Dependency Security Notes

**No lock vulnerabilities detected** in core dependencies at time of analysis.

**Notable patterns:**
- Octokit is client-side authenticated via environment variable
- Zod performs runtime validation of article content before use
- Gray-matter safely parses YAML; no evaluation of untrusted input

---

*Stack analysis: 2026-02-15*
