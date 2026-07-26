# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Canonical site organization

Before changing navigation, routes, publishing, commerce boundaries, or serialized instruments, read and follow `docs/architecture/site-organization.md`.

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

**Content pipeline:** `content-collections.ts` validates serialized instrument MDX records. Relay and documentation also use MDX without a blog publishing pipeline.

**UI layer:** Shadcn UI components in `components/ui/` (Radix primitives + Tailwind). RSC-enabled. Tailwind with class-based dark mode and HSL CSS variable theming. Fonts: Inter (sans), JetBrains Mono (mono).

**Shopify integration:** `lib/shopify.ts` creates a Storefront API client. Requires `NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_ACCESS_TOKEN` and `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` env vars.

**Custom documentation components:** DocSection (auto-formats heading levels by nesting depth), DocImage (click-to-expand), DocProcedure (renders structured procedure data), DocBreadcrumb, DocIndexCard, PageNavigation (auto-generates floating nav from page headings), PowerCalculator (voltage-to-power conversion flyout).

## Key Directories

- `app/` — pages and layouts (subject landing pages, community, docs, shop, and private serial records)
- `components/` — organized by domain: `community/`, `doc/`, `features/`, `navigation/`, `product/`, `shared/`, `ui/`
- `content/instruments/` — private serial-number instrument MDX records
- `content/relay/` — Relay guitar platform MDX content
- `content/docs/` — MDX documentation
- `config/` — site config (`site.ts`), navigation, product catalogs, doc section styling
- `lib/` — utilities (utils.ts, shopify.ts, toc.ts, version.ts, fonts.ts)
- `types/` — TypeScript type definitions (content, nav, product, shopify)

## Environment Variables

- `DISCORD_BOT_TOKEN` — server-only access for Community announcements and Relay pinned messages
- `NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_ACCESS_TOKEN` — Shopify Storefront API
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` — Shopify store domain
- Build-time auto-injected: `NEXT_PUBLIC_GIT_COMMIT_SHA`, `NEXT_PUBLIC_BUILD_TIMESTAMP`, `NEXT_PUBLIC_GIT_COMMIT_IS_PUBLIC`

## Code Style

- Prettier: 4-space tabs, single quotes, trailing commas (es5), no print width wrapping (printWidth: 999)
- ESLint: next/core-web-vitals + jsx-a11y + prettier
- Path alias: `@/*` maps to project root
