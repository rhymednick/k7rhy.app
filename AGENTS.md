# AGENTS.md

Shared guidance for coding agents working in this repository. Update this file for project-wide rules; `CLAUDE.md` imports it for Claude Code.

## Workflow Preferences

- **Pull requests:** Never create PRs as drafts. The owner merges all PRs directly.

## Decisions and Project Memory

- Before changing an area, read its current spec or engineering record and check the implementation. An older approved plan may have been revised or superseded; do not treat its status as current without checking.
- When the owner makes or changes a durable decision, record it in the relevant spec or engineering record. If no such document exists, create a short dated note under `docs/decisions/`. State the decision, why it was made, its date and status (proposed, approved, implemented, or validated), what it supersedes, and any unresolved questions. Link to source evidence where it matters.
- When implementation or validation changes a decision's status, update the same record and add a pointer from any superseded document. Keep historical context, but make the current choice easy to find. Do not leave a shipped design labeled as a draft or an untested design labeled as validated.
- Use `.remember/remember.md` for a brief handoff: current state, next action, and links to durable records. Do not use chat history or a memory summary as the only record of an approved decision.
- For decisions extracted from older conversations, follow `docs/engineering/extraction/README.md`: keep candidates and source evidence in the extraction ledger until they are reviewed and promoted to a canonical document.
- Separate source facts from plans and assumptions. For technical claims, use owner-provided evidence, verified product information, or the current implementation; label unknowns and experimental results explicitly. Earlier AI-generated copy and provisional plans are leads to verify, not evidence.

## Canonical site organization

Before changing navigation, routes, publishing, commerce boundaries, or serialized instruments, read and follow `docs/architecture/site-organization.md`.

## Guitar wiring diagrams

Before creating or publishing a builder-facing guitar wiring diagram, follow `docs/engineering/wiring-diagrams.md`.

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

## Diagram Work

Before creating or revising a diagram, inspect the repository's existing diagrams, component assets, and source notes for the established visual language. For guitar wiring, start with `public/wiring-diagrams/components/` and its metadata; use the physical component drawings and the existing light schematic style unless the user requests a different treatment. Check component art and labels against the actual circuit rather than assuming an asset's name proves its pinout.

Before presenting or committing a diagram, render it at full size and inspect legibility, wire crossings, terminal connections, and consistency with the source notes. Keep unpublished engineering diagrams under `docs/engineering/` and do not add site routes or public asset references unless requested. The Coupeville Velvet reference and its source generator are in `docs/engineering/coupeville-velvet/`.
