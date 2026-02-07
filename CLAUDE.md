# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

K7RHY Resonance Lab (https://k7rhy.app) — a Next.js content-driven site for ham radio electronics kits and musical instruments. Deployed on Netlify.

## Commands

- `npm run dev` — start dev server on localhost:3000
- `npm run build` — run tests then build (vitest run && next build), followed by sitemap generation
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm test` — Vitest in watch mode
- `npx vitest run` — run all tests once
- `npx vitest run path/to/file.test.ts` — run a single test file
- `npm run test:integration` — integration tests only (skips if API keys missing)

## Architecture

**Framework:** Next.js 15 with App Router (TypeScript strict mode, React 19). Node 20 (.nvmrc).

**Routing:** Primarily App Router (`app/`). A legacy `pages/` directory still exists (contact page, some API routes) during migration.

**Content pipeline:** Blog posts are MDX files in `content/blog/`. The `content-collections.ts` config (using @content-collections/core) processes them at build time:
- Extracts word count and reading time
- Strips JSX from content for clean text
- Generates AI summaries via Google Generative AI (Gemma 3 27B) when no summary is provided in frontmatter
- Caches summaries keyed by filename + MD5 content hash in `.content-collections/cache/ai-summary.json`
- Clear cache with `CLEAR_AI_SUMMARY_CACHE=true`

**UI layer:** Shadcn UI components in `components/ui/` (Radix primitives + Tailwind). RSC-enabled. Tailwind with class-based dark mode and HSL CSS variable theming. Fonts: Inter (sans), JetBrains Mono (mono).

**Shopify integration:** `lib/shopify.ts` creates a Storefront API client. Requires `NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_ACCESS_TOKEN` and `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` env vars.

**Custom documentation components:** DocSection (auto-formats heading levels by nesting depth), DocImage (click-to-expand), DocProcedure (renders structured procedure data), DocBreadcrumb, DocIndexCard, PageNavigation (auto-generates floating nav from page headings), PowerCalculator (voltage-to-power conversion flyout).

## Key Directories

- `app/` — pages and layouts (blog, docs, products with dynamic `[slug]`/`[category]` routes)
- `components/` — organized by domain: `blog/`, `doc/`, `features/`, `navigation/`, `product/`, `shared/`, `ui/`
- `content/blog/` — MDX blog posts
- `content/docs/` — MDX documentation
- `config/` — site config (`site.ts`), navigation, product catalogs, doc section styling
- `lib/` — utilities (utils.ts, shopify.ts, toc.ts, version.ts, fonts.ts)
- `types/` — TypeScript type definitions (content, nav, product, shopify)

## Blog Post Frontmatter

```yaml
---
title: 'Post Title'
date: '2024-01-15'
summary: 'Optional. AI generates one if omitted.'
tags: ['radio', 'electronics']  # Optional. Used for filtering and product association.
publish: true                    # Must be true to appear on the site
---
```

## Environment Variables

- `GOOGLE_GENERATIVE_AI_API_KEY` — AI summary generation (required for builds that generate summaries)
- `NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_ACCESS_TOKEN` — Shopify Storefront API
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` — Shopify store domain
- Build-time auto-injected: `NEXT_PUBLIC_GIT_COMMIT_SHA`, `NEXT_PUBLIC_BUILD_TIMESTAMP`, `NEXT_PUBLIC_GIT_COMMIT_IS_PUBLIC`

## Code Style

- Prettier: 4-space tabs, single quotes, trailing commas (es5), no print width wrapping (printWidth: 999)
- ESLint: next/core-web-vitals + jsx-a11y + prettier
- Path alias: `@/*` maps to project root
