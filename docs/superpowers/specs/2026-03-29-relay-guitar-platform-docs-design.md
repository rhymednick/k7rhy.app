# Relay Guitar Platform — Documentation System Design

**Date:** 2026-03-29 **Branch:** docs/relay-guitar-build **Status:** Approved

---

## Overview

A multi-page documentation system for the Relay Guitar Platform, starting with the Lipstick model. Designed as a self-contained mini docset within the existing k7rhy.app site, with purpose-built navigation for deep content hierarchies. Built to scale across future Relay models without structural changes.

The documentation philosophy emphasizes **constraints over step-by-step instructions**, **decision points over procedures**, and **builder autonomy** as the end goal.

---

## Decisions

| Decision          | Choice                                                     | Rationale                                                                            |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| URL placement     | `/docs/relay/[model]/…`                                    | Stays within site; breadcrumbs maintain orientation; MakerWorld can link deep        |
| Layout            | Sub-layout with focused sidebar                            | Site header stays; sidebar shows only Relay nav when inside `/docs/relay/`           |
| Nav definition    | Config-driven (`relay-nav.ts`)                             | Explicit control over ordering and titles; no filename prefix conventions            |
| Content authoring | MDX with global components                                 | Structured, component-first writing without import boilerplate                       |
| MDX pipeline      | `next-mdx-remote/rsc` + `gray-matter`                      | Content in `content/`, not `app/`; frontmatter → SEO metadata; no client bundle cost |
| SEO               | Frontmatter `title` + `description` → `generateMetadata()` | Per-page SEO with zero extra work per page                                           |

---

## Content Structure

MDX files live in `content/relay/` separated from routing:

```
content/relay/
  lipstick/
    index.mdx                     ← model overview / entry point (no nav item; loaded at model root)
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

`index.mdx` is loaded when visiting the model root (`/docs/relay/lipstick`). It does not appear as a nav item — the sidebar's platform label links to this page, but it is not listed under any section.

**MDX frontmatter** (two fields only):

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
  page.tsx              → /docs/relay          (platform landing — redirect while one model exists)
  layout.tsx            → relay sub-layout
  [model]/
    page.tsx            → /docs/relay/lipstick  (loads lipstick/index.mdx)
    [...slug]/
      page.tsx          → /docs/relay/lipstick/printing/parameters
```

One dynamic route handles all pages across all current and future models. Adding a new model requires: content files + nav config entry. No new route files.

**Platform landing** (`app/docs/relay/page.tsx`): Uses `redirect()` from `next/navigation` to send to `/docs/relay/lipstick` while only one model exists. Once multiple models exist, renders a model-picker index using `DocIndexCard`.

**Static params**: Both `[model]/page.tsx` and `[model]/[...slug]/page.tsx` must implement `generateStaticParams`. The nav config is the source of truth for enumerating all valid model+slug combinations:

```typescript
// [model]/[...slug]/page.tsx
export function generateStaticParams() {
    return Object.entries(relayNav).flatMap(([model, modelNav]) =>
        modelNav.sections.flatMap((section) =>
            section.items.map((item) => ({
                model,
                slug: item.slug.split('/'),
            }))
        )
    );
}

// [model]/page.tsx
export function generateStaticParams() {
    return Object.keys(relayNav).map((model) => ({ model }));
}
```

---

## Navigation System

**TypeScript types** (add to `types/relay-nav.ts`):

```typescript
export interface RelayNavItem {
    title: string;
    slug: string; // relative to model root, e.g. 'printing/parameters'
}

export interface RelayNavSection {
    title: string;
    items: RelayNavItem[];
}

export interface RelayModelNav {
    title: string;
    sections: RelayNavSection[];
}

export interface RelayNav {
    [model: string]: RelayModelNav;
}
```

**Config** (`config/relay-nav.ts`):

```typescript
import type { RelayNav } from '@/types/relay-nav';

export const relayNav: RelayNav = {
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
                items: [{ title: 'Body Assembly', slug: 'build/body' }],
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
};
```

**Sidebar component** (`components/navigation/relay-sidebar.tsx`):

A new `'use client'` component — client because active-link detection requires `usePathname()`. Renders:

- Platform label "Relay Guitar Platform" linking to `/docs/relay/lipstick`
- Model heading (future: dropdown when `Object.keys(relayNav).length > 1`)
- Section groups with indented page links; current page highlighted via `usePathname()` comparison
- "← All Documentation" link at bottom to `/docs`

Shares styling with `sidebar-nav.tsx` but is not a reuse of it — purpose-built for this nesting depth.

---

## Sub-Layout

**File:** `app/docs/relay/layout.tsx`

Next.js App Router nests layouts — the parent `/docs/layout.tsx` will still wrap this layout. The parent layout renders `DocsSidebarNav` (the global docs sidebar). To prevent two sidebars appearing side-by-side, **`/docs/layout.tsx` must be modified** to suppress `DocsSidebarNav` when the current path is under `/docs/relay/`. This is done with `usePathname()` in a client wrapper around the sidebar, or by restructuring the parent layout to accept the sidebar as a slot.

The relay sub-layout structure:

```
[Site header — existing, from root layout]
[Breadcrumbs — see derivation below]
──────────────────────────────────────────────────────────────
 RelaySidebar  │  {children} (MDX content)  │  PageNavigation
 (client)      │  (RSC)                     │  (client, existing)
```

**Breadcrumb derivation:**

```typescript
function buildRelayBreadcrumbs(
    model: string,
    slug: string[], // e.g. ['printing', 'parameters']
    nav: RelayNav
): Array<{ label: string; href?: string }> {
    const modelNav = nav[model];
    const pageSlug = slug.join('/');

    // Find matching nav item to get page title
    let pageTitle: string | undefined;
    let sectionTitle: string | undefined;
    for (const section of modelNav?.sections ?? []) {
        const item = section.items.find((i) => i.slug === pageSlug);
        if (item) {
            pageTitle = item.title;
            sectionTitle = section.title;
            break;
        }
    }

    return [
        { label: 'Docs', href: '/docs' },
        { label: 'Relay Guitar', href: '/docs/relay' },
        { label: modelNav?.title ?? model, href: `/docs/relay/${model}` },
        ...(sectionTitle ? [{ label: sectionTitle }] : []), // non-linked
        { label: pageTitle ?? slug[slug.length - 1] }, // current page, no href
    ];
}
```

For the model root (`slug = []`), breadcrumbs are: Docs > Relay Guitar > Lipstick (current, no href).

---

## MDX Pipeline

**Loader** (`lib/relay.ts`):

Returns raw MDX string (after frontmatter is stripped) + typed frontmatter. The page component owns the `<MDXRemote>` render call.

```typescript
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export interface RelayPageFrontmatter {
    title: string;
    description: string;
}

export async function loadRelayPage(
    model: string,
    slug: string[] // empty array = model root
): Promise<{ content: string; frontmatter: RelayPageFrontmatter }> {
    const segments = slug.length > 0 ? slug : ['index'];
    const filePath = path.join(process.cwd(), 'content/relay', model, ...segments) + '.mdx';
    const source = await fs.readFile(filePath, 'utf8');
    const { content, data } = matter(source);
    return {
        content,
        frontmatter: data as RelayPageFrontmatter,
    };
}
```

**Page component** (`app/docs/relay/[model]/[...slug]/page.tsx`):

```typescript
import { MDXRemote } from 'next-mdx-remote/rsc'
import components from '@/components/mdx-components'  // default export, matches existing pattern
import { loadRelayPage } from '@/lib/relay'

// Next.js 15: params is a Promise — must be awaited
export default async function RelayPage({ params }: { params: Promise<{ model: string; slug?: string[] }> }) {
  const { model, slug } = await params
  const { content } = await loadRelayPage(model, slug ?? [])
  return <MDXRemote source={content} components={components} />
}

export async function generateMetadata({ params }: { params: Promise<{ model: string; slug?: string[] }> }) {
  const { model, slug } = await params
  const { frontmatter } = await loadRelayPage(model, slug ?? [])
  return {
    title: `${frontmatter.title} | Relay Guitar | K7RHY`,
    description: frontmatter.description,
    openGraph: { title: frontmatter.title, description: frontmatter.description },
  }
}
```

**Note:** `next-mdx-remote` is already installed in this project. No new dependency needed.

---

## Global Components

The existing `components/mdx-components.tsx` already exports an `mdxComponents` object used by `app/docs/[slug]/page.tsx`. The relay pages reuse this same export, passing it directly to `<MDXRemote components={mdxComponents} />`.

Extend `components/mdx-components.tsx` to include all doc components that relay authors should have available without imports:

```typescript
// components/mdx-components.tsx (extend existing)
export const mdxComponents = {
    // already registered for blog/docs:
    // ... existing entries ...

    // add for relay:
    DocSection,
    DocAlert,
    DocImage,
    DocProcedure,
    DocProcedureStep,
    DocProcedureSubstepGroup,
    DocIndexCard,
};
```

`MyBreadcrumbs` (from `doc-page.tsx`) is not registered globally — breadcrumbs in the relay system are rendered by the sub-layout, not inline in MDX content.

Relay-specific components (e.g. compatibility checker, model-specific callouts) are imported per-file in the MDX as needed.

---

## Files to Create / Modify

| File                                        | Action                                                                             |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| `content/relay/lipstick/**/*.mdx`           | Create — all page content                                                          |
| `app/docs/relay/page.tsx`                   | Create — platform landing (`redirect()` to lipstick)                               |
| `app/docs/relay/layout.tsx`                 | Create — relay sub-layout with `RelaySidebar` + `PageNavigation`                   |
| `app/docs/relay/[model]/page.tsx`           | Create — model root (loads index.mdx, `generateStaticParams`)                      |
| `app/docs/relay/[model]/[...slug]/page.tsx` | Create — dynamic page renderer + `generateMetadata` + `generateStaticParams`       |
| `config/relay-nav.ts`                       | Create — typed nav configuration                                                   |
| `types/relay-nav.ts`                        | Create — `RelayNav`, `RelayModelNav`, `RelayNavSection`, `RelayNavItem` interfaces |
| `components/navigation/relay-sidebar.tsx`   | Create — `'use client'` relay-specific sidebar                                     |
| `lib/relay.ts`                              | Create — MDX file loader (`loadRelayPage`)                                         |
| `components/mdx-components.tsx`             | Modify — extend with relay doc components                                          |
| `app/docs/layout.tsx`                       | Modify — suppress `DocsSidebarNav` when path is under `/docs/relay/`               |
| `config/navigation.ts`                      | Modify — add Relay Guitar link to `docNav`                                         |

---

## Future Expansion

- New models: add `content/relay/[model]/` + entry in `relayNav`. No routing or layout changes.
- Model selector: `RelaySidebar` renders a dropdown when `Object.keys(relayNav).length > 1`.
- Platform landing: `/docs/relay/page.tsx` switches from `redirect()` to model-picker index when multiple models exist.
