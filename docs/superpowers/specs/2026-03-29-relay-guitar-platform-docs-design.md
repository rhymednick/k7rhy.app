# Relay Guitar Platform — Documentation System Design

**Date:** 2026-03-29
**Branch:** docs/relay-guitar-build
**Status:** Approved

---

## Overview

A multi-page documentation system for the Relay Guitar Platform, starting with the Lipstick model. Designed as a self-contained mini docset within the existing k7rhy.app site, with purpose-built navigation for deep content hierarchies. Built to scale across future Relay models without structural changes.

The documentation philosophy (inherited from the ChatGPT-originated outline) emphasizes **constraints over step-by-step instructions**, **decision points over procedures**, and **builder autonomy** as the end goal.

---

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| URL placement | `/docs/relay/[model]/…` | Stays within site; breadcrumbs maintain orientation; MakerWorld can link deep |
| Layout | Sub-layout with focused sidebar | Site header stays; sidebar shows only Relay nav when inside `/docs/relay/` |
| Nav definition | Config-driven (`relay-nav.ts`) | Explicit control over ordering and titles; no filename prefix conventions |
| Content authoring | MDX with global components | Structured, component-first writing without import boilerplate |
| MDX pipeline | `next-mdx-remote/rsc` + `gray-matter` | Content in `content/`, not `app/`; frontmatter → SEO metadata; no client bundle cost |
| SEO | Frontmatter `title` + `description` → `generateMetadata()` | Per-page SEO with zero extra work per page |

---

## Content Structure

MDX files live in `content/relay/` separated from routing:

```
content/relay/
  lipstick/
    index.mdx                     ← model overview / entry point
    planning/
      bom.mdx
      compatibility.mdx
    printing/
      overview.mdx
      parameters.mdx
      customization.mdx
    build/
      body.mdx
    electronics/
      overview.mdx
      wiring.mdx
      design-boundaries.mdx
    assembly/
      overview.mdx
      sequences.mdx
      checkpoints.mdx
    setup/
      playable.mdx
      optimization.mdx
      professional.mdx
```

**MDX frontmatter** (minimal, no redundant fields):
```yaml
---
title: 'Print Parameters'
description: 'Layer height, walls, infill, and orientation settings for Relay Lipstick parts.'
---
```

---

## Routing

```
app/docs/relay/
  page.tsx              → /docs/relay          (platform landing — model picker or redirect)
  layout.tsx            → relay sub-layout
  [model]/
    page.tsx            → /docs/relay/lipstick  (loads lipstick/index.mdx)
    [...slug]/
      page.tsx          → /docs/relay/lipstick/printing/parameters
```

One dynamic route handles all pages across all current and future models. Adding a new model requires: content files + nav config entry. No new route files.

**Platform landing behavior:** While only one model exists, `/docs/relay` redirects to `/docs/relay/lipstick`. Once multiple models exist, it renders a model-picker index using `DocIndexCard`.

---

## Navigation System

**Config** (`config/relay-nav.ts`):

```typescript
export const relayNav = {
  lipstick: {
    title: 'Lipstick',
    sections: [
      {
        title: 'Planning',
        items: [
          { title: 'Bill of Materials', slug: 'planning/bom' },
          { title: 'Compatibility', slug: 'planning/compatibility' },
        ],
      },
      {
        title: 'Printing',
        items: [
          { title: 'Overview', slug: 'printing/overview' },
          { title: 'Parameters', slug: 'printing/parameters' },
          { title: 'Customization', slug: 'printing/customization' },
        ],
      },
      {
        title: 'Build',
        items: [
          { title: 'Body Assembly', slug: 'build/body' },
        ],
      },
      {
        title: 'Electronics',
        items: [
          { title: 'Overview', slug: 'electronics/overview' },
          { title: 'Wiring', slug: 'electronics/wiring' },
          { title: 'Design Boundaries', slug: 'electronics/design-boundaries' },
        ],
      },
      {
        title: 'Assembly',
        items: [
          { title: 'Overview', slug: 'assembly/overview' },
          { title: 'Build Sequences', slug: 'assembly/sequences' },
          { title: 'Checkpoints', slug: 'assembly/checkpoints' },
        ],
      },
      {
        title: 'Setup',
        items: [
          { title: 'Getting Playable', slug: 'setup/playable' },
          { title: 'Optimization', slug: 'setup/optimization' },
          { title: 'Professional Setup', slug: 'setup/professional' },
        ],
      },
    ],
  },
}
```

**Sidebar component** (`components/navigation/relay-sidebar.tsx`):

A new component purpose-built for this nesting depth. Shares styling with the existing `sidebar-nav.tsx` but is not a reuse of it. Renders:
- Platform label: "Relay Guitar Platform"
- Model heading (future: model selector dropdown when >1 model exists)
- Section groups with indented page links; current page highlighted
- "← All Documentation" link at bottom to `/docs`

---

## Sub-Layout

**File:** `app/docs/relay/layout.tsx`

Replaces the generic `/docs/layout.tsx` for all routes under `/docs/relay/`. Structure:

```
[Site header — existing]
[Breadcrumbs: Docs > Relay Guitar > Lipstick > Section > Page]
──────────────────────────────────────────────────────────────
 RelaySidebar  │  {children} (MDX content)  │  PageNavigation
               │                            │  (existing, reused)
```

Breadcrumbs are derived from URL segments + nav config titles. No frontmatter field needed for breadcrumbs.

---

## MDX Pipeline

**Loader** (`lib/relay.ts`):

```typescript
export async function loadRelayPage(model: string, slug: string[]) {
  const filePath = path.join(process.cwd(), 'content/relay', model, ...slug) + '.mdx'
  // falls back to index.mdx for model root
  const source = await fs.readFile(filePath, 'utf8')
  const { content, data: frontmatter } = matter(source)
  const mdxSource = await compileMDX({ source: content, options: { parseFrontmatter: false } })
  return { content: mdxSource, frontmatter }
}
```

**Rendering:** `next-mdx-remote/rsc` — React Server Components, no client bundle cost.

---

## Global Components

**File:** `mdx-components.tsx` (Next.js convention, project root)

All existing doc components registered globally. MDX authors never need to import them:

```typescript
export function useMDXComponents(components) {
  return {
    DocSection,
    DocAlert,
    DocImage,
    DocProcedure,
    DocProcedureStep,
    DocProcedureSubstepGroup,
    DocBreadcrumb,
    DocIndexCard,
    ...components,
  }
}
```

Relay-specific components (e.g. compatibility checker, model-specific callouts) are imported per-file as needed.

---

## SEO

Each page generates metadata from frontmatter:

```typescript
export async function generateMetadata({ params }) {
  const { frontmatter } = await loadRelayPage(params.model, params.slug ?? [])
  return {
    title: `${frontmatter.title} | Relay Guitar | K7RHY`,
    description: frontmatter.description,
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
    },
  }
}
```

---

## Future Expansion

- New models: add `content/relay/[model]/` + entry in `relayNav`. No routing changes.
- Model selector: `RelaySidebar` renders a dropdown when `Object.keys(relayNav).length > 1`.
- Platform landing: `/docs/relay/page.tsx` switches from redirect to model-picker index automatically.

---

## Files to Create / Modify

| File | Action |
|------|--------|
| `content/relay/lipstick/**/*.mdx` | Create — all page content |
| `app/docs/relay/layout.tsx` | Create — relay sub-layout |
| `app/docs/relay/page.tsx` | Create — platform landing / redirect |
| `app/docs/relay/[model]/page.tsx` | Create — model root (loads index.mdx) |
| `app/docs/relay/[model]/[...slug]/page.tsx` | Create — dynamic page renderer |
| `config/relay-nav.ts` | Create — nav configuration |
| `components/navigation/relay-sidebar.tsx` | Create — relay-specific sidebar |
| `lib/relay.ts` | Create — MDX loader |
| `mdx-components.tsx` | Create — global MDX component registry |
| `config/navigation.ts` | Modify — add Relay Guitar link to docNav |
