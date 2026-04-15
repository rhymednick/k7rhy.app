# Relay Guitar Platform Documentation System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-page MDX documentation system for the Relay Guitar Platform under `/docs/relay/`, with a config-driven sidebar, breadcrumbs, and per-page SEO metadata.

**Architecture:** MDX files in `content/relay/[model]/` are loaded server-side via `gray-matter` + `next-mdx-remote/rsc`. A `config/relay-nav.ts` config drives the sidebar and `generateStaticParams`. A relay-specific sub-layout at `app/docs/relay/layout.tsx` provides its own sidebar and page navigation; the parent `/docs/layout.tsx` is modified to suppress its own sidebar and page nav when inside `/docs/relay/`.

**Tech Stack:** Next.js 15 App Router, `next-mdx-remote` (already installed), `gray-matter` (already installed), Vitest + jsdom for tests.

---

## File Map

| File                                                       | Action | Purpose                                                                                     |
| ---------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| `types/relay-nav.ts`                                       | Create | TypeScript interfaces for nav config                                                        |
| `config/relay-nav.ts`                                      | Create | Typed nav configuration for all models                                                      |
| `lib/relay.ts`                                             | Create | MDX file loader + breadcrumb builder                                                        |
| `lib/relay.test.ts`                                        | Create | Tests for loader path logic + breadcrumb builder                                            |
| `components/navigation/relay-sidebar.tsx`                  | Create | `'use client'` sidebar for relay section                                                    |
| `components/navigation/docs-layout-wrappers.tsx`           | Create | `'use client'` conditional wrappers to suppress parent sidebar/pagenav under `/docs/relay/` |
| `app/docs/layout.tsx`                                      | Modify | Use conditional wrappers to avoid double sidebar                                            |
| `app/docs/relay/layout.tsx`                                | Create | Relay sub-layout: RelaySidebar + content + PageNavigation                                   |
| `app/docs/relay/page.tsx`                                  | Create | Platform landing — redirects to `/docs/relay/lipstick`                                      |
| `app/docs/relay/[model]/page.tsx`                          | Create | Model root page (loads `index.mdx`)                                                         |
| `app/docs/relay/[model]/[...slug]/page.tsx`                | Create | Dynamic page renderer + `generateMetadata` + `generateStaticParams`                         |
| `config/navigation.ts`                                     | Modify | Add Relay Guitar link to `docNav`                                                           |
| `content/relay/lipstick/index.mdx`                         | Create | Model overview stub                                                                         |
| `content/relay/lipstick/planning/bom.mdx`                  | Create | Stub                                                                                        |
| `content/relay/lipstick/planning/compatibility.mdx`        | Create | Stub                                                                                        |
| `content/relay/lipstick/printing/overview.mdx`             | Create | Stub                                                                                        |
| `content/relay/lipstick/printing/parameters.mdx`           | Create | Stub                                                                                        |
| `content/relay/lipstick/printing/customization.mdx`        | Create | Stub                                                                                        |
| `content/relay/lipstick/build/body.mdx`                    | Create | Stub                                                                                        |
| `content/relay/lipstick/electronics/overview.mdx`          | Create | Stub                                                                                        |
| `content/relay/lipstick/electronics/wiring.mdx`            | Create | Stub                                                                                        |
| `content/relay/lipstick/electronics/design-boundaries.mdx` | Create | Stub                                                                                        |
| `content/relay/lipstick/assembly/overview.mdx`             | Create | Stub                                                                                        |
| `content/relay/lipstick/assembly/sequences.mdx`            | Create | Stub                                                                                        |
| `content/relay/lipstick/assembly/checkpoints.mdx`          | Create | Stub                                                                                        |
| `content/relay/lipstick/setup/playable.mdx`                | Create | Stub                                                                                        |
| `content/relay/lipstick/setup/optimization.mdx`            | Create | Stub                                                                                        |
| `content/relay/lipstick/setup/professional.mdx`            | Create | Stub                                                                                        |

---

## Task 1: Types and Nav Config

**Files:**

- Create: `types/relay-nav.ts`
- Create: `config/relay-nav.ts`

- [ ] **Step 1: Create `types/relay-nav.ts`**

```typescript
// types/relay-nav.ts
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

- [ ] **Step 2: Create `config/relay-nav.ts`**

```typescript
// config/relay-nav.ts
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

- [ ] **Step 3: Verify TypeScript accepts the config**

```bash
npx tsc --noEmit
```

Expected: no errors related to relay-nav types.

- [ ] **Step 4: Commit**

```bash
git add types/relay-nav.ts config/relay-nav.ts
git commit -m "feat: add relay nav types and config"
```

---

## Task 2: MDX Loader and Breadcrumb Builder

**Files:**

- Create: `lib/relay.ts`
- Create: `lib/relay.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// lib/relay.test.ts
import { describe, it, expect } from 'vitest';
import { buildRelayBreadcrumbs, resolveRelayFilePath } from './relay';
import { relayNav } from '@/config/relay-nav';

describe('resolveRelayFilePath', () => {
    it('resolves a normal slug to a file path', () => {
        const result = resolveRelayFilePath('lipstick', ['printing', 'parameters']);
        expect(result).toMatch(/content\/relay\/lipstick\/printing\/parameters\.mdx$/);
    });

    it('resolves empty slug to index.mdx', () => {
        const result = resolveRelayFilePath('lipstick', []);
        expect(result).toMatch(/content\/relay\/lipstick\/index\.mdx$/);
    });
});

describe('buildRelayBreadcrumbs', () => {
    it('builds breadcrumbs for a known page', () => {
        const crumbs = buildRelayBreadcrumbs('lipstick', ['printing', 'parameters'], relayNav);
        expect(crumbs).toEqual([{ label: 'Docs', href: '/docs' }, { label: 'Relay Guitar', href: '/docs/relay' }, { label: 'Lipstick', href: '/docs/relay/lipstick' }, { label: 'Printing' }, { label: 'Parameters' }]);
    });

    it('builds breadcrumbs for the model root (empty slug)', () => {
        const crumbs = buildRelayBreadcrumbs('lipstick', [], relayNav);
        expect(crumbs).toEqual([{ label: 'Docs', href: '/docs' }, { label: 'Relay Guitar', href: '/docs/relay' }, { label: 'Lipstick' }]);
    });

    it('falls back to slug segment when page not found in nav', () => {
        const crumbs = buildRelayBreadcrumbs('lipstick', ['unknown', 'page'], relayNav);
        const last = crumbs[crumbs.length - 1];
        expect(last.label).toBe('page');
        expect(last.href).toBeUndefined();
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run lib/relay.test.ts
```

Expected: FAIL — `resolveRelayFilePath` and `buildRelayBreadcrumbs` not defined.

- [ ] **Step 3: Create `lib/relay.ts`**

```typescript
// lib/relay.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { RelayNav } from '@/types/relay-nav';

export interface RelayPageFrontmatter {
    title: string;
    description: string;
}

export interface RelayBreadcrumb {
    label: string;
    href?: string;
}

/** Resolves the absolute path to an MDX file given a model and slug segments. */
export function resolveRelayFilePath(model: string, slug: string[]): string {
    const segments = slug.length > 0 ? slug : ['index'];
    return path.join(process.cwd(), 'content', 'relay', model, ...segments) + '.mdx';
}

/** Loads an MDX file and returns its raw content string and typed frontmatter. */
export function loadRelayPage(model: string, slug: string[]): { content: string; frontmatter: RelayPageFrontmatter } {
    const filePath = resolveRelayFilePath(model, slug);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Relay page not found: ${filePath}`);
    }
    const source = fs.readFileSync(filePath, 'utf-8');
    const { content, data } = matter(source);
    return { content, frontmatter: data as RelayPageFrontmatter };
}

/** Builds breadcrumb trail from URL model + slug segments using the nav config for titles. */
export function buildRelayBreadcrumbs(model: string, slug: string[], nav: RelayNav): RelayBreadcrumb[] {
    // Model root: no slug
    if (slug.length === 0) {
        return [{ label: 'Docs', href: '/docs' }, { label: 'Relay Guitar', href: '/docs/relay' }, { label: nav[model]?.title ?? model }];
    }

    const modelNav = nav[model];
    const pageSlug = slug.join('/');

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

    return [{ label: 'Docs', href: '/docs' }, { label: 'Relay Guitar', href: '/docs/relay' }, { label: modelNav?.title ?? model, href: `/docs/relay/${model}` }, ...(sectionTitle ? [{ label: sectionTitle }] : []), { label: pageTitle ?? slug[slug.length - 1] }];
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run lib/relay.test.ts
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/relay.ts lib/relay.test.ts
git commit -m "feat: add relay MDX loader and breadcrumb builder with tests"
```

---

## Task 3: Relay Sidebar Component

**Files:**

- Create: `components/navigation/relay-sidebar.tsx`

- [ ] **Step 1: Create `components/navigation/relay-sidebar.tsx`**

```typescript
// components/navigation/relay-sidebar.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { relayNav } from '@/config/relay-nav'

export function RelaySidebar({ model }: { model: string }) {
    const pathname = usePathname()
    const modelNav = relayNav[model]

    if (!modelNav) return null

    return (
        <div className="w-full">
            {/* Platform label — links to model root */}
            <div className="pb-4">
                <Link
                    href={`/docs/relay/${model}`}
                    className="mb-1 block rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
                >
                    Relay · {modelNav.title}
                </Link>
            </div>

            {/* Sections */}
            {modelNav.sections.map((section, i) => (
                <div key={i} className="pb-4">
                    <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">
                        {section.title}
                    </h4>
                    <div className="grid grid-flow-row auto-rows-max text-sm">
                        {section.items.map((item, j) => {
                            const href = `/docs/relay/${model}/${item.slug}`
                            const isActive = pathname === href
                            return (
                                <Link
                                    key={j}
                                    href={href}
                                    className={cn(
                                        'group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline',
                                        isActive
                                            ? 'font-medium text-foreground'
                                            : 'text-muted-foreground'
                                    )}
                                >
                                    {item.title}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            ))}

            {/* Back link */}
            <div className="border-t pt-4">
                <Link
                    href="/docs"
                    className="flex w-full items-center rounded-md px-2 py-1 text-sm text-muted-foreground hover:underline"
                >
                    ← All Documentation
                </Link>
            </div>
        </div>
    )
}
```

- [ ] **Step 2: Add `RelayLayoutSidebar` and `RelayBreadcrumbBar` to `components/navigation/relay-sidebar.tsx`**

These are needed by the sub-layout (Task 5) and page components (Task 6/7). Add them to the same file, after `RelaySidebar`:

```typescript
// Append to components/navigation/relay-sidebar.tsx

/** Used in the relay sub-layout — derives the model from pathname automatically. */
export function RelayLayoutSidebar() {
    const pathname = usePathname()
    // e.g. /docs/relay/lipstick/printing/parameters → model = 'lipstick'
    const segments = pathname.split('/').filter(Boolean)
    const relayIndex = segments.indexOf('relay')
    const model = relayIndex >= 0 ? segments[relayIndex + 1] ?? 'lipstick' : 'lipstick'
    return <RelaySidebar model={model} />
}
```

Also add this import at the top of the file and the `RelayBreadcrumbBar` export at the bottom. `RelayBreadcrumb` is structurally identical to `BreadcrumbItem` from `doc-page.tsx` (`{ label: string; href?: string }`) — they're assignable without casting:

```typescript
// Add import at top of relay-sidebar.tsx:
import type { RelayBreadcrumb } from '@/lib/relay'
import { MyBreadcrumbs } from '@/components/doc/doc-page'

// Add export at bottom of relay-sidebar.tsx:
/** Renders a breadcrumb bar using RelayBreadcrumb items from lib/relay. */
export function RelayBreadcrumbBar({ items }: { items: RelayBreadcrumb[] }) {
    return <MyBreadcrumbs items={items} />
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/navigation/relay-sidebar.tsx
git commit -m "feat: add RelaySidebar, RelayLayoutSidebar, and RelayBreadcrumbBar"
```

---

## Task 4: Modify Parent Docs Layout

The parent `/docs/layout.tsx` renders its sidebar and `PageNavigation` for ALL routes under `/docs/`, including `/docs/relay/`. The relay sub-layout provides its own. We need to suppress the parent's elements when inside `/docs/relay/`.

**Files:**

- Create: `components/navigation/docs-layout-wrappers.tsx`
- Modify: `app/docs/layout.tsx`

- [ ] **Step 1: Create `components/navigation/docs-layout-wrappers.tsx`**

```typescript
// components/navigation/docs-layout-wrappers.tsx
'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { DocsSidebarNav } from '@/components/navigation/sidebar-nav'
import { PageNavigation } from '@/components/page-navigation'
import { navConfig } from '@/config/navigation'

/** Renders the docs sidebar, hidden when inside /docs/relay/ */
export function DocsConditionalSidebar() {
    const pathname = usePathname()
    if (pathname.startsWith('/docs/relay')) return null
    return <DocsSidebarNav config={navConfig.docNav} />
}

/** Renders PageNavigation, hidden when inside /docs/relay/ (relay layout provides its own) */
export function DocsConditionalPageNav() {
    const pathname = usePathname()
    if (pathname.startsWith('/docs/relay')) return null
    return <PageNavigation />
}
```

- [ ] **Step 2: Update `app/docs/layout.tsx`**

Replace the existing file contents:

```typescript
// app/docs/layout.tsx
import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DocsConditionalSidebar, DocsConditionalPageNav } from '@/components/navigation/docs-layout-wrappers'

interface DocsLayoutProps {
    children: React.ReactNode
}

export default function DocsLayout({ children }: DocsLayoutProps) {
    return (
        <div className="border-b">
            <div className="container flex flex-col lg:flex-row lg:items-start">
                {/* Sidebar — suppressed under /docs/relay/ */}
                <aside className="w-full lg:w-auto lg:sticky lg:top-14 lg:-ml-2 lg:min-w-[250px] lg:max-w-[325px]">
                    <ScrollArea className="h-full py-6 pr-6 lg:py-8">
                        <DocsConditionalSidebar />
                    </ScrollArea>
                </aside>

                {/* Main content and navigation */}
                <main className="flex flex-col lg:flex-row lg:flex-1 lg:gap-10">
                    <div className="flex-1">{children}</div>
                    {/* PageNavigation — suppressed under /docs/relay/ (relay layout provides its own) */}
                    <aside className="lg:w-64 lg:ml-1">
                        <DocsConditionalPageNav />
                    </aside>
                </main>
            </div>
        </div>
    )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Start dev server and verify existing /docs pages still show their sidebar**

```bash
npm run dev
```

Navigate to `http://localhost:3000/docs` and `http://localhost:3000/docs/dl20w_bnc`. Confirm the sidebar and page navigation still appear normally.

- [ ] **Step 5: Commit**

```bash
git add components/navigation/docs-layout-wrappers.tsx app/docs/layout.tsx
git commit -m "feat: suppress docs sidebar and page nav under /docs/relay/"
```

---

## Task 5: Relay Sub-Layout

**Files:**

- Create: `app/docs/relay/layout.tsx`

- [ ] **Step 1: Create `app/docs/relay/layout.tsx`**

This layout renders within the parent docs layout's `{children}` slot. It provides relay-specific sidebar (via `RelayLayoutSidebar` defined in Task 3), content, and page navigation. `RelayLayoutSidebar` derives the model from `usePathname()` — no params needed here.

**Note on heading IDs:** `DocPage` uses a `useEffect` to assign heading IDs for page navigation. `PageNavigation` does the same. Both run client-side on relay pages, but the operations are idempotent — no visual or functional issue results.

```typescript
// app/docs/relay/layout.tsx
import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PageNavigation } from '@/components/page-navigation'
import { RelayLayoutSidebar } from '@/components/navigation/relay-sidebar'

interface RelayLayoutProps {
    children: React.ReactNode
}

export default function RelayLayout({ children }: RelayLayoutProps) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-start w-full">
            <aside className="w-full lg:w-auto lg:sticky lg:top-14 lg:-ml-2 lg:min-w-[220px] lg:max-w-[280px]">
                <ScrollArea className="h-full py-6 pr-6 lg:py-8">
                    <RelayLayoutSidebar />
                </ScrollArea>
            </aside>
            <div className="flex flex-col lg:flex-row lg:flex-1 lg:gap-10">
                <div className="flex-1">{children}</div>
                <aside className="lg:w-64 lg:ml-1">
                    <PageNavigation />
                </aside>
            </div>
        </div>
    )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/docs/relay/layout.tsx components/navigation/relay-sidebar.tsx
git commit -m "feat: add relay sub-layout and RelayLayoutSidebar"
```

---

## Task 6: Platform Landing and Model Root Page

**Files:**

- Create: `app/docs/relay/page.tsx`
- Create: `app/docs/relay/[model]/page.tsx`

- [ ] **Step 1: Create `app/docs/relay/page.tsx`**

```typescript
// app/docs/relay/page.tsx
import { redirect } from 'next/navigation';

export default function RelayPlatformPage() {
    // While only one model exists, redirect to it directly.
    // When multiple models exist, replace with a model-picker index.
    redirect('/docs/relay/lipstick');
}
```

- [ ] **Step 2: Create `app/docs/relay/[model]/page.tsx`**

```typescript
// app/docs/relay/[model]/page.tsx
import React from 'react'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import components from '@/components/mdx-components'
import { DocPage } from '@/components/doc/doc-page'
import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar'
import { loadRelayPage, buildRelayBreadcrumbs } from '@/lib/relay'
import { relayNav } from '@/config/relay-nav'

type Props = { params: Promise<{ model: string }> }

export function generateStaticParams() {
    return Object.keys(relayNav).map((model) => ({ model }))
}

export async function generateMetadata({ params }: Props) {
    const { model } = await params
    try {
        const { frontmatter } = loadRelayPage(model, [])
        return {
            title: `${frontmatter.title} | Relay Guitar | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        }
    } catch {
        return {}
    }
}

export default async function RelayModelPage({ params }: Props) {
    const { model } = await params
    let content: string
    let frontmatter: { title: string; description: string }
    try {
        ;({ content, frontmatter } = loadRelayPage(model, []))
    } catch {
        notFound()
    }
    const breadcrumbs = buildRelayBreadcrumbs(model, [], relayNav)
    return (
        <DocPage title={frontmatter.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
            <MDXRemote source={content} components={components} />
        </DocPage>
    )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add app/docs/relay/page.tsx "app/docs/relay/[model]/page.tsx"
git commit -m "feat: add relay platform landing and model root page"
```

---

## Task 7: Dynamic Page Renderer

**Files:**

- Create: `app/docs/relay/[model]/[...slug]/page.tsx`

- [ ] **Step 1: Create `app/docs/relay/[model]/[...slug]/page.tsx`**

```typescript
// app/docs/relay/[model]/[...slug]/page.tsx
import React from 'react'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import components from '@/components/mdx-components'
import { DocPage } from '@/components/doc/doc-page'
import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar'
import { loadRelayPage, buildRelayBreadcrumbs } from '@/lib/relay'
import { relayNav } from '@/config/relay-nav'

type Props = { params: Promise<{ model: string; slug: string[] }> }

export function generateStaticParams() {
    return Object.entries(relayNav).flatMap(([model, modelNav]) =>
        modelNav.sections.flatMap((section) =>
            section.items.map((item) => ({
                model,
                slug: item.slug.split('/'),
            }))
        )
    )
}

export async function generateMetadata({ params }: Props) {
    const { model, slug } = await params
    try {
        const { frontmatter } = loadRelayPage(model, slug)
        return {
            title: `${frontmatter.title} | Relay Guitar | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        }
    } catch {
        return {}
    }
}

export default async function RelayPage({ params }: Props) {
    const { model, slug } = await params
    let content: string
    let frontmatter: { title: string; description: string }
    try {
        ;({ content, frontmatter } = loadRelayPage(model, slug))
    } catch {
        notFound()
    }
    const breadcrumbs = buildRelayBreadcrumbs(model, slug, relayNav)
    return (
        <DocPage title={frontmatter.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
            <MDXRemote source={content} components={components} />
        </DocPage>
    )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/docs/relay/[model]/[...slug]/page.tsx"
git commit -m "feat: add relay dynamic page renderer with generateStaticParams and generateMetadata"
```

---

## Task 8: Update Site Navigation Config

**Files:**

- Modify: `config/navigation.ts`

- [ ] **Step 1: Add Relay Guitar to `docNav` in `config/navigation.ts`**

In `config/navigation.ts`, add a new section before the existing `Assembly Guides` group:

```typescript
// config/navigation.ts — add to docNav array:
{
    title: 'Relay Guitar Platform',
    items: [
        {
            title: 'Relay Lipstick',
            href: '/docs/relay/lipstick',
            items: [],
        },
    ],
},
```

The full updated `docNav` in `navConfig`:

```typescript
docNav: [
    {
        title: 'Relay Guitar Platform',
        items: [
            {
                title: 'Relay Lipstick',
                href: '/docs/relay/lipstick',
                items: [],
            },
        ],
    },
    {
        title: 'Assembly Guides',
        items: [
            {
                title: '20W Dummy Load',
                href: '/docs/dl20w_bnc',
                items: [],
            },
        ],
    },
    {
        title: 'Tech Guides',
        items: [
            {
                title: 'Measuring Power',
                href: '/docs/power_measurement',
                items: [],
            },
        ],
    },
],
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add config/navigation.ts
git commit -m "feat: add Relay Guitar Platform to site navigation"
```

---

## Task 9: Scaffold Content Stubs

Create all MDX content files with frontmatter. These are stubs — fill in actual content after the structure is working.

**Files:** All files under `content/relay/lipstick/`

- [ ] **Step 1: Create `content/relay/lipstick/index.mdx`**

```mdx
---
title: 'Relay Lipstick — Build Overview'
description: 'Introduction to the Relay Lipstick guitar build: what it is, who it is for, and what to expect.'
---

{/* TODO: Add overview content */}
```

- [ ] **Step 2: Create planning stubs**

`content/relay/lipstick/planning/bom.mdx`:

```mdx
---
title: 'Bill of Materials'
description: 'Component categories, required vs optional parts, cost ranges, and substitution philosophy for the Relay Lipstick build.'
---

{/* TODO: Add BOM content */}
```

`content/relay/lipstick/planning/compatibility.mdx`:

```mdx
---
title: 'Compatibility'
description: 'Neck, bridge, pickup, and electronics constraints for the Relay Lipstick. Understand what will and will not fit before you buy.'
---

{/* TODO: Add compatibility content */}
```

- [ ] **Step 3: Create printing stubs**

`content/relay/lipstick/printing/overview.mdx`:

```mdx
---
title: 'Printing Overview'
description: 'Material requirements and expectations for printing Relay Lipstick parts.'
---

{/* TODO: Add printing overview content */}
```

`content/relay/lipstick/printing/parameters.mdx`:

```mdx
---
title: 'Print Parameters'
description: 'Layer height, walls, infill, orientation, and support settings for Relay Lipstick parts.'
---

{/* TODO: Add print parameters content */}
```

`content/relay/lipstick/printing/customization.mdx`:

```mdx
---
title: 'Print Customization'
description: 'Safe cosmetic modifications, structural risk areas, and what not to change.'
---

{/* TODO: Add customization content */}
```

- [ ] **Step 4: Create build stub**

`content/relay/lipstick/build/body.mdx`:

```mdx
---
title: 'Body Assembly'
description: 'Adhesives, fasteners, alignment strategy, tolerances, and structural validation for assembling printed Relay Lipstick parts.'
---

{/* TODO: Add body assembly content */}
```

- [ ] **Step 5: Create electronics stubs**

`content/relay/lipstick/electronics/overview.mdx`:

```mdx
---
title: 'Electronics Overview'
description: 'Recommended baseline circuit design for the Relay Lipstick and the rationale behind it.'
---

{/* TODO: Add electronics overview content */}
```

`content/relay/lipstick/electronics/wiring.mdx`:

```mdx
---
title: 'Wiring'
description: 'Wiring diagram and step-by-step instructions for the Relay Lipstick electronics.'
---

{/* TODO: Add wiring content */}
```

`content/relay/lipstick/electronics/design-boundaries.mdx`:

```mdx
---
title: 'Design Boundaries'
description: 'What can change in the electronics design, what must not change, and why the constraints exist.'
---

{/* TODO: Add design boundaries content */}
```

- [ ] **Step 6: Create assembly stubs**

`content/relay/lipstick/assembly/overview.mdx`:

```mdx
---
title: 'Assembly Overview'
description: 'Critical dependencies and order-sensitive operations for final Relay Lipstick assembly.'
---

{/* TODO: Add assembly overview content */}
```

`content/relay/lipstick/assembly/sequences.mdx`:

```mdx
---
title: 'Build Sequences'
description: 'Three valid build paths (electronics-first, hardware-first, hybrid) with pros, cons, and when to choose each.'
---

{/* TODO: Add build sequences content */}
```

`content/relay/lipstick/assembly/checkpoints.mdx`:

```mdx
---
title: 'Checkpoints'
description: 'Neck alignment, bridge placement, and wiring continuity checks to prevent cascading errors.'
---

{/* TODO: Add checkpoints content */}
```

- [ ] **Step 7: Create setup stubs**

`content/relay/lipstick/setup/playable.mdx`:

```mdx
---
title: 'Getting Playable'
description: 'Stringing, basic action, rough intonation, and pickup height baseline for the Relay Lipstick.'
---

{/* TODO: Add getting playable content */}
```

`content/relay/lipstick/setup/optimization.mdx`:

```mdx
---
title: 'Optimization'
description: 'Fine adjustments and common issues for the Relay Lipstick setup.'
---

{/* TODO: Add optimization content */}
```

`content/relay/lipstick/setup/professional.mdx`:

```mdx
---
title: 'Professional Setup'
description: 'When to seek a luthier and what they will improve on the Relay Lipstick.'
---

{/* TODO: Add professional setup content */}
```

- [ ] **Step 8: Run build to verify all pages are found and rendered**

```bash
npm run build
```

Expected: build succeeds. All relay routes appear in the route output. No 404s for relay pages.

- [ ] **Step 9: Commit**

```bash
git add content/relay/
git commit -m "feat: scaffold Relay Lipstick content stubs"
```

---

## Task 10: End-to-End Smoke Test

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 2: Start dev server and manually verify each route**

```bash
npm run dev
```

Check each of the following manually:

| URL                                        | Expected                                                                                        |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `/docs`                                    | Docs index with "Relay Guitar Platform" in sidebar; clicking shows relay section                |
| `/docs/relay`                              | Redirects to `/docs/relay/lipstick`                                                             |
| `/docs/relay/lipstick`                     | Loads `index.mdx`; relay sidebar visible; global docs sidebar hidden                            |
| `/docs/relay/lipstick/planning/bom`        | Loads `bom.mdx`; breadcrumbs show Docs > Relay Guitar > Lipstick > Planning > Bill of Materials |
| `/docs/relay/lipstick/printing/parameters` | Correct title, sidebar highlights Parameters                                                    |
| `/docs/dl20w_bnc`                          | Global docs sidebar still visible (regression check)                                            |

- [ ] **Step 3: Push branch**

```bash
git push
```
