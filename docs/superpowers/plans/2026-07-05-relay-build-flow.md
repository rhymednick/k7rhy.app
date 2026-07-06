# Relay Build Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Relay section into one continuous build process with a persistent master nav where Parts and Wiring are voicing-forking steps reached through a shared tab control.

**Architecture:** A single accordion sidebar (5 steps) replaces the swapping voicing sidebar. Parts (`/relay/parts`, renamed from `/relay/components`) and a new Wiring step (`/relay/wiring`) each resolve the active voicing server-side from `?voicing=` (defaulting to the first buildable voicing, Lipstick) and render one voicing's content beneath a shared server-rendered tab bar of `<Link>`s. Empty voicings never appear as tabs.

**Tech Stack:** Next.js 15 App Router (RSC), TypeScript strict, Vitest + Testing Library, MDX via next-mdx-remote/rsc, Tailwind.

**Spec:** `docs/superpowers/specs/2026-07-05-relay-build-flow-design.md`

## Global Constraints

- Visitor-facing copy is **K7RHY first-person singular** ("I/me/my", never "we/us/our"). Check `/Users/rhy/.claude/memory/voice-profile.md` before writing copy.
- Prettier: 4-space tabs, single quotes, trailing commas es5, `printWidth: 999` (no wrap). ESLint: next/core-web-vitals + jsx-a11y + prettier.
- Path alias `@/*` → project root. Node 20, React 19, strict TS.
- Tabs are `<Link>`s with `scroll={false}`; the **page** (server) resolves the active voicing and renders its content — never ship more than one voicing's content to the client.
- "Buildable" is derived from content, not `status`: Parts = voicings with a non-empty manifest; Wiring = voicings with a wiring MDX file. Both currently resolve to `[lipstick, velvet, arc, torch]` in registry order (Lipstick first = default).
- Branch: `relay-build-flow` (already created, spec committed). Run `npx vitest run` and `npm run lint` before each commit; `npm run build` at the final task.
- Never create PRs as drafts (owner merges directly).

---

## File Structure

**New:**
- `components/relay/relay-voicing-tabs.tsx` — shared server tab bar (Links, active state).
- `app/relay/parts/page.tsx` — Parts step (renamed from `app/relay/components/`).
- `app/relay/wiring/page.tsx` — Wiring step.
- `content/relay/parts/index.mdx` — Parts intro (moved from `content/relay/components/index.mdx`).
- `content/relay/wiring/index.mdx` — Wiring intro.
- `content/relay/wiring/{lipstick,velvet,arc,torch}.mdx` — moved from `content/relay/voicings/<slug>/wiring.mdx`.
- Tests: `components/relay/relay-voicing-tabs.test.tsx`.

**Modified:**
- `lib/relay-components.ts` — add `listVoicingsWithParts()`.
- `lib/relay.ts` — add `listVoicingsWithWiring()`, `loadRelayWiringPage()`; simplify `buildRelayVoicingBreadcrumbs`.
- `components/relay/relay-components-shopping-list.tsx` — drop the selector, become a server component that renders the grouped list.
- `components/relay/relay-voicing-overview.tsx` — "Next in your build" (Parts + Wiring).
- `components/navigation/relay-sidebar.tsx` — single accordion master nav; delete `VoicingSidebar` + "All voicings".
- `config/relay-build-process.ts`, `types/relay-nav.ts` — 5 stages.
- `config/relay-voicings.ts`, `types/relay-voicing.ts` — remove `docs` / `RelayVoicingDocPage`.
- `content/relay/assembly/index.mdx` — rewrite (wiring is step 4).
- `next.config.mjs` — redirects.
- Tests: `__tests__/config/relay-build-process.test.ts`, `__tests__/config/relay-voicings.test.ts`, `components/navigation/relay-sidebar.test.tsx`, `lib/relay.test.ts`, `lib/relay-components.test.ts`.

**Deleted:**
- `app/relay/components/` (dir), `app/relay/voicings/[slug]/[page]/` (dir).

---

## Task 1: Shared voicing tab control + buildable-voicing helpers

**Files:**
- Modify: `lib/relay-components.ts`
- Create: `components/relay/relay-voicing-tabs.tsx`
- Test: `lib/relay-components.test.ts`, `components/relay/relay-voicing-tabs.test.tsx`

**Interfaces:**
- Produces: `listVoicingsWithParts(): string[]` (slugs in registry order with ≥1 manifest component).
- Produces: `RelayVoicingTabs({ voicings, activeSlug, basePath }): JSX` where `voicings: { slug: string; name: string }[]`, `activeSlug: string`, `basePath: string`.

- [ ] **Step 1: Write the failing helper test** in `lib/relay-components.test.ts` (append inside the file):

```ts
describe('listVoicingsWithParts', () => {
    it('returns only voicings with a non-empty manifest, in registry order, Lipstick first', () => {
        expect(listVoicingsWithParts()).toEqual(['lipstick', 'velvet', 'arc', 'torch']);
    });
});
```

Add `listVoicingsWithParts` to the import at the top of that file:

```ts
import { groupRelayComponentsByCategory, listVoicingsWithParts, loadRelayComponentCatalog, loadRelayModelManifest, resolveRelayComponentList } from '@/lib/relay-components';
```

- [ ] **Step 2: Run it, expect fail**

Run: `npx vitest run lib/relay-components.test.ts`
Expected: FAIL — `listVoicingsWithParts is not a function`.

- [ ] **Step 3: Implement the helper** — append to `lib/relay-components.ts`, and add the import at the top:

```ts
import { relayVoicings } from '@/config/relay-voicings';
```

```ts
/** Voicing slugs (registry order) that have at least one model-specific component defined. */
export function listVoicingsWithParts(): string[] {
    return relayVoicings
        .map((voicing) => voicing.slug)
        .filter((slug) => {
            try {
                return loadRelayModelManifest(slug).components.length > 0;
            } catch {
                return false;
            }
        });
}
```

- [ ] **Step 4: Run it, expect pass**

Run: `npx vitest run lib/relay-components.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the failing tab-bar test** — create `components/relay/relay-voicing-tabs.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { RelayVoicingTabs } from './relay-voicing-tabs';

const voicings = [
    { slug: 'lipstick', name: 'Relay Lipstick' },
    { slug: 'velvet', name: 'Relay Velvet' },
];

describe('RelayVoicingTabs', () => {
    it('renders a link per voicing pointing at basePath with the voicing param', () => {
        render(<RelayVoicingTabs voicings={voicings} activeSlug="lipstick" basePath="/relay/parts" />);
        expect(screen.getByRole('link', { name: 'Relay Lipstick' })).toHaveAttribute('href', '/relay/parts?voicing=lipstick');
        expect(screen.getByRole('link', { name: 'Relay Velvet' })).toHaveAttribute('href', '/relay/parts?voicing=velvet');
    });

    it('marks the active voicing with aria-current', () => {
        render(<RelayVoicingTabs voicings={voicings} activeSlug="velvet" basePath="/relay/wiring" />);
        expect(screen.getByRole('link', { name: 'Relay Velvet' })).toHaveAttribute('aria-current', 'page');
        expect(screen.getByRole('link', { name: 'Relay Lipstick' })).not.toHaveAttribute('aria-current');
    });
});
```

- [ ] **Step 6: Run it, expect fail**

Run: `npx vitest run components/relay/relay-voicing-tabs.test.tsx`
Expected: FAIL — cannot find module `./relay-voicing-tabs`.

- [ ] **Step 7: Implement the tab bar** — create `components/relay/relay-voicing-tabs.tsx` (server component, no `'use client'`):

```tsx
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface RelayVoicingTab {
    slug: string;
    name: string;
}

/** A horizontal tab bar of voicing links. The page resolves the active voicing server-side and renders that voicing's content below this bar; each tab is a `?voicing=` link that swaps the content via RSC navigation without scrolling. */
export function RelayVoicingTabs({ voicings, activeSlug, basePath }: { voicings: RelayVoicingTab[]; activeSlug: string; basePath: string }) {
    return (
        <div role="tablist" className="mb-6 flex flex-wrap gap-1 border-b">
            {voicings.map((voicing) => {
                const isActive = voicing.slug === activeSlug;
                return (
                    <Link
                        key={voicing.slug}
                        href={`${basePath}?voicing=${voicing.slug}`}
                        scroll={false}
                        role="tab"
                        aria-current={isActive ? 'page' : undefined}
                        aria-selected={isActive}
                        className={cn(
                            '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                            isActive ? 'border-sky-500 text-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                        )}
                    >
                        {voicing.name}
                    </Link>
                );
            })}
        </div>
    );
}
```

- [ ] **Step 8: Run it, expect pass**

Run: `npx vitest run components/relay/relay-voicing-tabs.test.tsx lib/relay-components.test.ts`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add lib/relay-components.ts lib/relay-components.test.ts components/relay/relay-voicing-tabs.tsx components/relay/relay-voicing-tabs.test.tsx
git commit -m "feat: shared voicing tab bar + buildable-parts helper"
```

---

## Task 2: Parts step (rename components → parts, tabs, complete list per tab)

**Files:**
- Create: `app/relay/parts/page.tsx`
- Move: `content/relay/components/index.mdx` → `content/relay/parts/index.mdx`
- Modify: `components/relay/relay-components-shopping-list.tsx`
- Modify: `next.config.mjs`
- Delete: `app/relay/components/` (dir)

**Interfaces:**
- Consumes: `listVoicingsWithParts()`, `RelayVoicingTabs`, `resolveRelayComponentList(slug)`, `relayVoicings`.
- Produces: route `/relay/parts` with `?voicing=` fork; `RelayComponentsShoppingList({ components })` (server, selector removed).

- [ ] **Step 1: Move the intro content**

```bash
mkdir -p content/relay/parts
git mv content/relay/components/index.mdx content/relay/parts/index.mdx
```

- [ ] **Step 2: Rewrite the intro copy** — replace the body of `content/relay/parts/index.mdx` (keep frontmatter `title`/`description`, update to reflect tabs + buy-at-once; first-person):

```mdx
---
title: 'Parts'
description: 'The complete Relay parts list. Pick your voicing and order everything for that build in one pass.'
---

Pick your voicing below and you'll get the complete parts list for that build — the shared body and hardware plus the electronics that voicing needs — so you can order everything in one pass. I only list voicings I've fully speced; the ones still in the lab aren't here yet.

Items marked **Specific** mean that exact part. **Flexible** items list a real alternative and the tradeoff.
```

- [ ] **Step 3: Write the failing test** for the shopping list becoming a plain server list — replace the contents of any existing selector test. Create/replace `components/relay/relay-components-shopping-list.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { RelayComponentsShoppingList } from './relay-components-shopping-list';
import { resolveRelayComponentList } from '@/lib/relay-components';

describe('RelayComponentsShoppingList', () => {
    it('renders a complete grouped list for a voicing (body + hardware + electronics)', () => {
        const { components } = resolveRelayComponentList('lipstick');
        render(<RelayComponentsShoppingList components={components} />);
        expect(screen.getByRole('heading', { name: 'Body Construction' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Guitar Hardware' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Electronics' })).toBeInTheDocument();
    });
});
```

- [ ] **Step 4: Run it, expect fail**

Run: `npx vitest run components/relay/relay-components-shopping-list.test.tsx`
Expected: FAIL — component still requires removed props / renders selector.

- [ ] **Step 5: Simplify the shopping list to a server component** — rewrite `components/relay/relay-components-shopping-list.tsx` removing `'use client'`, `useState`, `useRouter`, the selector block, and the empty-voicing branch. Keep `ComponentBadge`, `ComponentRow`, `groupComponentsByCategory`. New export:

```tsx
import type * as React from 'react';
import { ExternalLink } from 'lucide-react';
import { getCachedPrice } from '@/lib/amazon-prices';
import { cn } from '@/lib/utils';
import { relayComponentCategories, type RelayComponentCategory, type RelayComponentRecord } from '@/types/relay-components';

function groupComponentsByCategory(components: RelayComponentRecord[]): Record<RelayComponentCategory, RelayComponentRecord[]> {
    return relayComponentCategories.reduce(
        (groups, category) => {
            groups[category] = components.filter((component) => component.category === category);
            return groups;
        },
        {} as Record<RelayComponentCategory, RelayComponentRecord[]>
    );
}

function ComponentBadge({ children, tone }: { children: React.ReactNode; tone: 'amber' | 'green' }) {
    const tones = {
        amber: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
        green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    };
    return <span className={cn('rounded border px-1.5 py-0.5 text-xs font-medium', tones[tone])}>{children}</span>;
}

function ComponentRow({ component }: { component: RelayComponentRecord }) {
    const price = getCachedPrice(component.priceKey, component.fallbackPrice);
    return (
        <div className="border-b py-4 last:border-b-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="m-0 text-base font-semibold">{component.title}</h3>
                        <ComponentBadge tone={component.specificity === 'specific' ? 'amber' : 'green'}>{component.specificity === 'specific' ? 'Specific' : 'Flexible'}</ComponentBadge>
                    </div>
                    <p className="text-sm text-muted-foreground">Quantity: {component.quantity}</p>
                </div>
                <div className="text-sm text-muted-foreground sm:text-right">
                    <a href={component.source.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-foreground hover:underline">
                        {component.source.label}
                        <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <div>{price}</div>
                </div>
            </div>
            {component.content && <p className="mt-2 text-sm text-muted-foreground">{component.content}</p>}
            {component.substitution && (
                <div className="mt-3 rounded-md border-l-2 border-emerald-500/40 pl-3 text-sm text-muted-foreground">
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">Alternative: </span>
                    {component.substitution}
                </div>
            )}
        </div>
    );
}

export function RelayComponentsShoppingList({ components }: { components: RelayComponentRecord[] }) {
    const grouped = groupComponentsByCategory(components);
    return (
        <div className="mt-8 space-y-8">
            {Object.entries(grouped).map(([category, items]) => (
                <section key={category} id={category.toLowerCase().replaceAll(' ', '-')} className="scroll-m-24">
                    <h2 className="font-heading mt-12 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">{category}</h2>
                    {items.length > 0 ? (
                        <div className="mt-4 rounded-lg border px-4">
                            {items.map((component) => (
                                <ComponentRow key={component.id} component={component} />
                            ))}
                        </div>
                    ) : (
                        <p className="mt-3 text-sm text-muted-foreground">No items in this category for this voicing.</p>
                    )}
                </section>
            ))}
            <p className="text-sm text-muted-foreground">
                Fit-sensitive parts still need compatibility checks before purchase — the item notes above call out the constraints that matter. When a dimension or substitution is in doubt, ask in{' '}
                <a href="https://discord.gg/BuUxCG4W6w" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:underline">
                    Discord
                </a>{' '}
                before ordering.
            </p>
        </div>
    );
}
```

- [ ] **Step 6: Create the Parts route** — create `app/relay/parts/page.tsx`:

```tsx
import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage } from '@/components/doc/doc-page';
import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
import { RelayComponentsShoppingList } from '@/components/relay/relay-components-shopping-list';
import { RelayVoicingTabs } from '@/components/relay/relay-voicing-tabs';
import { loadRelayPlatformSectionPage } from '@/lib/relay';
import { listVoicingsWithParts, resolveRelayComponentList } from '@/lib/relay-components';
import { relayVoicings } from '@/config/relay-voicings';

type Props = { searchParams: Promise<{ voicing?: string; model?: string }> };

export async function generateMetadata() {
    try {
        const { frontmatter } = loadRelayPlatformSectionPage(['parts', 'index']);
        return {
            title: `${frontmatter.title} | Relay Guitar | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}

export default async function RelayPartsPage({ searchParams }: Props) {
    const { voicing, model } = await searchParams;
    const buildable = listVoicingsWithParts();
    const requested = voicing ?? model ?? '';
    const active = buildable.includes(requested) ? requested : buildable[0];
    const tabs = buildable.map((slug) => ({ slug, name: relayVoicings.find((v) => v.slug === slug)!.name }));
    const { content, frontmatter } = loadRelayPlatformSectionPage(['parts', 'index']);
    const resolvedList = resolveRelayComponentList(active);
    const breadcrumbs = [{ label: 'Relay Guitar', href: '/relay' }, { label: 'Parts' }];

    return (
        <DocPage title={frontmatter.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
            <MDXRemote source={content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
            <RelayVoicingTabs voicings={tabs} activeSlug={active} basePath="/relay/parts" />
            <RelayComponentsShoppingList components={resolvedList.components} />
        </DocPage>
    );
}
```

- [ ] **Step 7: Delete the old components route**

```bash
git rm -r app/relay/components
```

- [ ] **Step 8: Add redirects** — in `next.config.mjs`, inside `redirects()` return array, add and update entries so all point at `/relay/parts`:

```js
{ source: '/relay/components', destination: '/relay/parts', permanent: true },
```

And change the two existing `bom` redirect destinations and the `compatibility` redirect from `/relay/components...` to `/relay/parts...`:

```js
{ source: '/relay/lipstick/compatibility', destination: '/relay/parts', permanent: true },
{ source: '/relay/:voicing(lipstick|velvet|arc|torch)/bom', destination: '/relay/parts?voicing=:voicing', permanent: true },
{ source: '/relay/voicings/:voicing(lipstick|velvet|arc|torch)/bom', destination: '/relay/parts?voicing=:voicing', permanent: true },
```

- [ ] **Step 9: Run tests + lint**

Run: `npx vitest run components/relay/relay-components-shopping-list.test.tsx && npm run lint`
Expected: PASS, no lint errors. (If an old `relay-components-shopping-list` test referencing the selector exists, it was replaced in Step 3.)

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: Parts step at /relay/parts with voicing tabs (complete list per voicing)"
```

---

## Task 3: Wiring step (new route, move content, delete legacy sub-page route)

**Files:**
- Move: `content/relay/voicings/{lipstick,velvet,arc,torch}/wiring.mdx` → `content/relay/wiring/{slug}.mdx`
- Create: `content/relay/wiring/index.mdx`, `app/relay/wiring/page.tsx`
- Modify: `lib/relay.ts`, `lib/relay.test.ts`, `next.config.mjs`
- Delete: `app/relay/voicings/[slug]/[page]/` (dir)

**Interfaces:**
- Produces: `listVoicingsWithWiring(): string[]`; `loadRelayWiringPage(slug: string): { content: string; frontmatter: RelayPageFrontmatter }`; route `/relay/wiring` with `?voicing=` fork.

- [ ] **Step 1: Move wiring content**

```bash
mkdir -p content/relay/wiring
for v in lipstick velvet arc torch; do git mv "content/relay/voicings/$v/wiring.mdx" "content/relay/wiring/$v.mdx"; done
```

- [ ] **Step 2: Create the wiring intro** — `content/relay/wiring/index.mdx` (first-person):

```mdx
---
title: 'Wiring'
description: 'Bench-side wiring references for each Relay voicing. Build and test the harness before it goes in the body.'
---

Pick the voicing you're building and you'll get its bench-side wiring reference — the selector map, connection points, and the published harness. Build and test the harness outside the body first; it's far easier to debug on the bench than in the cavity.
```

- [ ] **Step 3: Write failing lib tests** — append to `lib/relay.test.ts`:

```ts
describe('listVoicingsWithWiring', () => {
    it('returns voicings that have a wiring file, in registry order, Lipstick first', () => {
        expect(listVoicingsWithWiring()).toEqual(['lipstick', 'velvet', 'arc', 'torch']);
    });
});

describe('loadRelayWiringPage', () => {
    it('loads a voicing wiring page frontmatter', () => {
        const { frontmatter } = loadRelayWiringPage('arc');
        expect(frontmatter.title).toBeTruthy();
    });
});
```

Add both to the import in `lib/relay.test.ts`:

```ts
import { resolveRelayVoicingFilePath, resolveRelayPlatformFilePath, buildRelayVoicingBreadcrumbs, loadRelayVoicingPage, loadRelayVoicingsGalleryPage, loadRelayPlatformSectionPage, listVoicingsWithWiring, loadRelayWiringPage } from '@/lib/relay';
```

- [ ] **Step 4: Run it, expect fail**

Run: `npx vitest run lib/relay.test.ts`
Expected: FAIL — `listVoicingsWithWiring`/`loadRelayWiringPage` not exported.

- [ ] **Step 5: Implement the loaders** — in `lib/relay.ts`, add `import { relayVoicings } from '@/config/relay-voicings';` at the top, then add:

```ts
/** Loads a voicing's wiring page (content/relay/wiring/<slug>.mdx). */
export function loadRelayWiringPage(slug: string): { content: string; frontmatter: RelayPageFrontmatter } {
    return loadMdxFile(path.join(process.cwd(), 'content', 'relay', 'wiring', `${slug}.mdx`));
}

/** Voicing slugs (registry order) that have a wiring page on disk. */
export function listVoicingsWithWiring(): string[] {
    return relayVoicings.map((voicing) => voicing.slug).filter((slug) => fs.existsSync(path.join(process.cwd(), 'content', 'relay', 'wiring', `${slug}.mdx`)));
}
```

- [ ] **Step 6: Run it, expect pass**

Run: `npx vitest run lib/relay.test.ts`
Expected: PASS.

- [ ] **Step 7: Create the Wiring route** — `app/relay/wiring/page.tsx`:

```tsx
import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage } from '@/components/doc/doc-page';
import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
import { RelayVoicingTabs } from '@/components/relay/relay-voicing-tabs';
import { loadRelayPlatformSectionPage, loadRelayWiringPage, listVoicingsWithWiring } from '@/lib/relay';
import { relayVoicings } from '@/config/relay-voicings';

type Props = { searchParams: Promise<{ voicing?: string }> };

export async function generateMetadata() {
    try {
        const { frontmatter } = loadRelayPlatformSectionPage(['wiring', 'index']);
        return {
            title: `${frontmatter.title} | Relay Guitar | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}

export default async function RelayWiringPage({ searchParams }: Props) {
    const { voicing } = await searchParams;
    const buildable = listVoicingsWithWiring();
    const requested = voicing ?? '';
    const active = buildable.includes(requested) ? requested : buildable[0];
    const tabs = buildable.map((slug) => ({ slug, name: relayVoicings.find((v) => v.slug === slug)!.name }));
    const intro = loadRelayPlatformSectionPage(['wiring', 'index']);
    const wiring = loadRelayWiringPage(active);
    const breadcrumbs = [{ label: 'Relay Guitar', href: '/relay' }, { label: 'Wiring' }];

    return (
        <DocPage title={intro.frontmatter.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
            <MDXRemote source={intro.content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
            <RelayVoicingTabs voicings={tabs} activeSlug={active} basePath="/relay/wiring" />
            <MDXRemote source={wiring.content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </DocPage>
    );
}
```

- [ ] **Step 8: Delete the legacy sub-page route**

```bash
git rm -r 'app/relay/voicings/[slug]/[page]'
```

- [ ] **Step 9: Redirect old wiring URLs** — in `next.config.mjs`, replace the existing `/relay/:voicing(...)/wiring` redirect and add the `/relay/voicings/...` form so both point at the wiring step:

```js
{ source: '/relay/:voicing(lipstick|velvet|arc|torch)/wiring', destination: '/relay/wiring?voicing=:voicing', permanent: true },
{ source: '/relay/voicings/:voicing(lipstick|velvet|arc|torch)/wiring', destination: '/relay/wiring?voicing=:voicing', permanent: true },
```

- [ ] **Step 10: Run tests + lint**

Run: `npx vitest run lib/relay.test.ts && npm run lint`
Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: Wiring step at /relay/wiring with voicing tabs; retire per-voicing wiring pages"
```

---

## Task 4: "Next in your build" on voicing pages

**Files:**
- Modify: `components/relay/relay-voicing-overview.tsx`
- Test: `components/relay/relay-voicing-overview.test.tsx`

**Interfaces:**
- Consumes: `voicingSlug` (already a prop). Produces: parts + wiring CTAs in the overview.

- [ ] **Step 1: Write the failing test** — append to `components/relay/relay-voicing-overview.test.tsx`:

```tsx
it('offers both Parts and Wiring as next-step links', () => {
    render(<RelayVoicingOverview voicingSlug="lipstick">Body copy</RelayVoicingOverview>);
    expect(screen.getByRole('link', { name: /parts/i })).toHaveAttribute('href', '/relay/parts?voicing=lipstick#electronics');
    expect(screen.getByRole('link', { name: /wiring/i })).toHaveAttribute('href', '/relay/wiring?voicing=lipstick');
});
```

- [ ] **Step 2: Run it, expect fail**

Run: `npx vitest run components/relay/relay-voicing-overview.test.tsx`
Expected: FAIL — no wiring link / parts link href is `/relay/components...`.

- [ ] **Step 3: Replace the "Parts profile" card** — in `components/relay/relay-voicing-overview.tsx`, swap the ShoppingBag import for two icons and replace the single-card block (currently lines ~62–73) with a two-action "Next in your build" block:

Change the import:

```tsx
import { ShoppingBag, Cable } from 'lucide-react';
```

Replace the parts-profile `<div className="mt-8 rounded-lg border p-4">...</div>` block with:

```tsx
            <div className="mt-8 rounded-lg border p-4">
                <h2 className="text-base font-semibold">Next in your build</h2>
                <p className="mt-1 text-sm text-muted-foreground">This voicing shares the Relay body and hardware; its electronics and wiring are specific to the sound you just picked.</p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Link href={`/relay/parts?voicing=${voicingSlug}#electronics`} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2 text-center text-sm font-medium hover:bg-muted">
                        <ShoppingBag className="h-4 w-4" />
                        Parts list
                    </Link>
                    <Link href={`/relay/wiring?voicing=${voicingSlug}`} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2 text-center text-sm font-medium hover:bg-muted">
                        <Cable className="h-4 w-4" />
                        Wiring guide
                    </Link>
                </div>
            </div>
```

- [ ] **Step 4: Run it, expect pass**

Run: `npx vitest run components/relay/relay-voicing-overview.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/relay/relay-voicing-overview.tsx components/relay/relay-voicing-overview.test.tsx
git commit -m "feat: voicing pages surface Parts + Wiring as next build steps"
```

---

## Task 5: Master build nav (accordion, 5 steps) + retire voicing sidebar

**Files:**
- Modify: `types/relay-nav.ts`, `config/relay-build-process.ts`, `components/navigation/relay-sidebar.tsx`
- Test: `__tests__/config/relay-build-process.test.ts`, `components/navigation/relay-sidebar.test.tsx`

**Interfaces:**
- Consumes: `relayBuildProcess` (now 5 stages), `relayVoicings`.
- Produces: single `RelayLayoutSidebar` that renders the accordion master nav on every `/relay/*` path; no `VoicingSidebar`, no "All voicings".

- [ ] **Step 1: Widen the stage types** — in `types/relay-nav.ts`, change the `RelayBuildStage` `slug` and `number` fields:

```ts
    slug: 'body' | 'voicings' | 'parts' | 'wiring' | 'assembly';
    title: string;
    number: 1 | 2 | 3 | 4 | 5;
```

- [ ] **Step 2: Write the failing config test** — replace the body of `__tests__/config/relay-build-process.test.ts` with the 5-stage expectations:

```ts
import { describe, it, expect } from 'vitest';
import { relayBuildProcess } from '@/config/relay-build-process';

describe('relayBuildProcess config', () => {
    it('contains five stages in build order', () => {
        expect(relayBuildProcess.stages.map((s) => s.slug)).toEqual(['body', 'voicings', 'parts', 'wiring', 'assembly']);
    });

    it('numbers stages 1..5 in order', () => {
        expect(relayBuildProcess.stages.map((s) => s.number)).toEqual([1, 2, 3, 4, 5]);
    });

    it('points each stage at its in-site route', () => {
        const byslug = Object.fromEntries(relayBuildProcess.stages.map((s) => [s.slug, s.href]));
        expect(byslug).toEqual({
            body: '/relay/body',
            voicings: '/relay/voicings',
            parts: '/relay/parts',
            wiring: '/relay/wiring',
            assembly: '/relay/assembly',
        });
    });

    it('keeps Body sub-items as print/bond/finish only (Parts is now its own step)', () => {
        const body = relayBuildProcess.stages.find((s) => s.slug === 'body')!;
        expect(body.items?.map((i) => i.title)).toEqual(['Print', 'Bonding', 'Finishing']);
    });

    it('lists the seven voicings under the Voicing step', () => {
        const voicings = relayBuildProcess.stages.find((s) => s.slug === 'voicings')!;
        expect(voicings.items?.map((i) => i.title)).toEqual(['Lipstick', 'Reef', 'Velvet', 'Arc', 'Torch', 'Current', 'Hammer']);
    });

    it('every stage has a non-empty summary', () => {
        for (const stage of relayBuildProcess.stages) {
            expect(stage.summary.length).toBeGreaterThan(10);
        }
    });
});
```

- [ ] **Step 3: Run it, expect fail**

Run: `npx vitest run __tests__/config/relay-build-process.test.ts`
Expected: FAIL — 3 stages, wrong slugs.

- [ ] **Step 4: Rewrite the build-process config** — replace `config/relay-build-process.ts` stages:

```ts
import type { RelayBuildProcess } from '@/types/relay-nav';

/**
 * The Relay build process. Drives the master sidebar nav and the homepage
 * RelayProcessOverview. Body and Voicing carry sub-items (shown when active);
 * Parts and Wiring fork by voicing on their own pages.
 */
export const relayBuildProcess: RelayBuildProcess = {
    stages: [
        {
            slug: 'body',
            title: 'Body',
            number: 1,
            status: 'live',
            summary: 'Print, bond, cure, and finish the shared double-cut body. Same body for every voicing.',
            href: '/relay/body',
            items: [
                { title: 'Print', href: '/relay/body/print' },
                { title: 'Bonding', href: '/relay/body/bonding' },
                { title: 'Finishing', href: '/relay/body/finishing' },
            ],
        },
        {
            slug: 'voicings',
            title: 'Voicing',
            number: 2,
            status: 'live',
            summary: 'Choose how the guitar sounds. Each voicing wires the same body a different way.',
            href: '/relay/voicings',
            items: [
                { title: 'Lipstick', href: '/relay/voicings/lipstick' },
                { title: 'Reef', href: '/relay/voicings/reef' },
                { title: 'Velvet', href: '/relay/voicings/velvet' },
                { title: 'Arc', href: '/relay/voicings/arc' },
                { title: 'Torch', href: '/relay/voicings/torch' },
                { title: 'Current', href: '/relay/voicings/current' },
                { title: 'Hammer', href: '/relay/voicings/hammer' },
            ],
        },
        {
            slug: 'parts',
            title: 'Parts',
            number: 3,
            status: 'live',
            summary: 'Gather everything for your chosen voicing — shared hardware plus its electronics — in one list.',
            href: '/relay/parts',
        },
        {
            slug: 'wiring',
            title: 'Wiring',
            number: 4,
            status: 'live',
            summary: 'Build and bench-test the harness for your voicing before it goes in the body.',
            href: '/relay/wiring',
        },
        {
            slug: 'assembly',
            title: 'Assembly',
            number: 5,
            status: 'in-progress',
            summary: 'Mount the hardware, install the harness, string it, and set it up.',
            href: '/relay/assembly',
        },
    ],
};
```

- [ ] **Step 5: Run it, expect pass**

Run: `npx vitest run __tests__/config/relay-build-process.test.ts`
Expected: PASS.

- [ ] **Step 6: Write failing sidebar tests** — replace `components/navigation/relay-sidebar.test.tsx` with tests for the accordion master nav (present on both platform and voicing paths, no "All voicings", active step expands):

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

const pathnameMock = vi.fn();
vi.mock('next/navigation', () => ({ usePathname: () => pathnameMock() }));

import { RelayLayoutSidebar } from './relay-sidebar';

describe('RelayLayoutSidebar', () => {
    it('shows all five build steps on the platform page', () => {
        pathnameMock.mockReturnValue('/relay');
        render(<RelayLayoutSidebar />);
        for (const step of ['Body', 'Voicing', 'Parts', 'Wiring', 'Assembly']) {
            expect(screen.getByRole('link', { name: new RegExp(`^${step}`) })).toBeInTheDocument();
        }
    });

    it('renders the same master nav on a voicing page (no separate voicing sidebar, no "All voicings")', () => {
        pathnameMock.mockReturnValue('/relay/voicings/lipstick');
        render(<RelayLayoutSidebar />);
        expect(screen.getByRole('link', { name: /^Parts/ })).toHaveAttribute('href', '/relay/parts');
        expect(screen.getByRole('link', { name: /^Wiring/ })).toHaveAttribute('href', '/relay/wiring');
        expect(screen.queryByText(/all voicings/i)).not.toBeInTheDocument();
    });

    it('expands the active step’s sub-items and collapses inactive ones', () => {
        pathnameMock.mockReturnValue('/relay/voicings/lipstick');
        render(<RelayLayoutSidebar />);
        // Voicing is active → its voicing sub-links show
        expect(screen.getByRole('link', { name: 'Relay Lipstick' })).toBeInTheDocument();
        // Body is inactive → its print/bond/finish sub-links are hidden
        expect(screen.queryByRole('link', { name: 'Print' })).not.toBeInTheDocument();
    });
});
```

- [ ] **Step 7: Run it, expect fail**

Run: `npx vitest run components/navigation/relay-sidebar.test.tsx`
Expected: FAIL — old sidebar renders "All voicings" / separate voicing sidebar.

- [ ] **Step 8: Rewrite the sidebar** — replace `components/navigation/relay-sidebar.tsx` with a single accordion master nav. Delete `VoicingSidebar`, `PlatformSidebar`, and the `RelayVoicingLineupNav` import. A stage's sub-items render only when that stage is active (pathname starts with its href). Keep `StageStatusTag`, `RelayBreadcrumbBar`:

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { relayBuildProcess } from '@/config/relay-build-process';
import type { RelayBreadcrumb } from '@/lib/relay';
import type { RelayBuildStage, RelayStageStatus } from '@/types/relay-nav';
import { MyBreadcrumbs } from '@/components/doc/doc-page';

const PLATFORM_HREF = '/relay';

function StageStatusTag({ status }: { status: RelayStageStatus }) {
    if (status === 'live') return null;
    const tone = status === 'in-progress' ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-400';
    const label = status === 'in-progress' ? 'In progress' : 'Planned';
    return <span className={cn('ml-2 shrink-0 rounded-full border px-1.5 py-0 text-[10px] font-medium uppercase tracking-wide', tone)}>{label}</span>;
}

/** A build step is active when the path is the step href or nested under it. */
function isStageActive(stage: RelayBuildStage, pathname: string): boolean {
    return pathname === stage.href || pathname.startsWith(`${stage.href}/`);
}

function BuildStageRow({ stage, pathname }: { stage: RelayBuildStage; pathname: string }) {
    const active = isStageActive(stage, pathname);
    const showItems = active && stage.items && stage.items.length > 0;

    return (
        <li>
            <Link href={stage.href} className={cn('flex w-full items-center rounded-md border border-transparent px-2 py-1 text-sm font-medium hover:underline', active ? 'text-foreground' : 'text-foreground/70')}>
                <span className="flex-1">
                    <span className="mr-1.5 text-muted-foreground">{stage.number}</span>
                    {stage.title}
                </span>
                <StageStatusTag status={stage.status} />
            </Link>
            {showItems && (
                <ul className="ml-4 mt-0.5 grid grid-flow-row auto-rows-max border-l border-border/50">
                    {stage.items!.map((item) => {
                        const isItemActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link href={item.href} className={cn('flex w-full items-center rounded-md border border-transparent py-1 pl-3 pr-2 text-sm hover:underline', isItemActive ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                                    {item.title}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </li>
    );
}

export function RelayLayoutSidebar() {
    const pathname = usePathname() ?? '';

    return (
        <nav aria-label="Relay Guitar navigation" className="w-full">
            <div className="pb-4">
                <Link href={PLATFORM_HREF} className={cn('flex w-full items-center rounded-md border border-transparent px-2 py-1 text-sm hover:underline', pathname === PLATFORM_HREF ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                    Overview
                </Link>
            </div>

            <div>
                <h4 className="mb-1 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Build process</h4>
                <ul className="grid grid-flow-row auto-rows-max">
                    {relayBuildProcess.stages.map((stage) => (
                        <BuildStageRow key={stage.slug} stage={stage} pathname={pathname} />
                    ))}
                </ul>
            </div>
        </nav>
    );
}

export function RelayBreadcrumbBar({ items }: { items: RelayBreadcrumb[] }) {
    return <MyBreadcrumbs items={items} />;
}
```

- [ ] **Step 9: Delete the now-unused lineup nav** — it was only used by the retired "All voicings"/platform sections:

```bash
git rm components/relay/relay-voicing-lineup-nav.tsx components/relay/relay-voicing-lineup-nav.test.ts
```

Then verify nothing else imports it:

Run: `grep -rn "relay-voicing-lineup-nav" --include=*.ts --include=*.tsx . || echo "clean"`
Expected: `clean`.

- [ ] **Step 10: Run tests + lint**

Run: `npx vitest run components/navigation/relay-sidebar.test.tsx __tests__/config/relay-build-process.test.ts && npm run lint`
Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: single accordion build nav; retire voicing sidebar and All voicings"
```

---

## Task 6: Registry/type cleanup, Assembly rewrite, full-build sweep

**Files:**
- Modify: `types/relay-voicing.ts`, `config/relay-voicings.ts`, `lib/relay.ts`, `__tests__/config/relay-voicings.test.ts`, `content/relay/assembly/index.mdx`
- Test: full suite + build

**Interfaces:**
- Consumes: nothing new. Produces: `RelayVoicing` without `docs`; `buildRelayVoicingBreadcrumbs(voicing, slug, voicings)` unchanged signature but no doc-title lookup.

- [ ] **Step 1: Remove the docs assertions** — in `__tests__/config/relay-voicings.test.ts`, delete the three docs-related `it(...)` blocks: `'defines a docs list on every voicing'`, `'gives every ready voicing a wiring guide entry'`, and `'backs every slug-routed docs entry with an MDX file under content/relay/voicings/'`. Also remove the now-unused `fs`/`path` imports if only those tests used them.

- [ ] **Step 2: Run it, expect pass** (removing tests can't fail; confirms the file still parses)

Run: `npx vitest run __tests__/config/relay-voicings.test.ts`
Expected: PASS.

- [ ] **Step 3: Remove `docs` from the type** — in `types/relay-voicing.ts`, delete the `RelayVoicingDocPage` interface (lines 1–6) and the `docs` field + its comment from `RelayVoicing` (lines 18–19).

- [ ] **Step 4: Remove `docs` from every registry entry** — in `config/relay-voicings.ts`, delete the `docs: [...]` / `docs: []` property from all seven voicing objects.

- [ ] **Step 5: Simplify the breadcrumb builder** — in `lib/relay.ts`, `buildRelayVoicingBreadcrumbs` no longer needs doc-title lookup (the only multi-segment consumer was deleted in Task 3). Replace its body so a trailing segment falls back to its raw slug:

```ts
/** Builds breadcrumb trail for a voicing page. */
export function buildRelayVoicingBreadcrumbs(voicing: string, slug: string[], voicings: RelayVoicing[]): RelayBreadcrumb[] {
    const entry = voicings.find((v) => v.slug === voicing);
    const title = entry?.name ?? voicing;
    if (slug.length === 0) {
        return [{ label: 'Relay Guitar', href: '/relay' }, { label: title }];
    }
    return [
        { label: 'Relay Guitar', href: '/relay' },
        { label: title, href: `/relay/voicings/${voicing}` },
        { label: slug[slug.length - 1] },
    ];
}
```

- [ ] **Step 6: Typecheck for stray `docs` references**

Run: `npx tsc --noEmit 2>&1 | grep -v "es2018" || echo "clean"`
Expected: `clean` (the pre-existing es2018 regex warning in `app/sn/instrument-records.test.ts` is unrelated; anything mentioning `docs` is a real break to fix).

- [ ] **Step 7: Rewrite the Assembly page** — replace `content/relay/assembly/index.mdx` (first-person voice; wiring is now step 4, so Assembly hands off from the built harness):

```mdx
---
title: 'Assembly'
description: 'The final stage: mount the hardware, install the harness you built, string it, and set it up.'
---

By the time you reach assembly you've printed and finished the body, chosen your voicing, gathered the parts, and built and bench-tested the harness on the [Wiring](/relay/wiring) step. Assembly is where it all comes together into a playable guitar.

## What you can do today

The wiring guides are complete for every released voicing — build and prove the harness on the bench before it goes anywhere near the body. Everything downstream of that is in development.

## What's coming

The hardware, install, and setup documentation is being written from real builds — I only publish steps I've proven on my own instruments. Here's the shape of it:

- Mount the bridge, tuners, strap buttons, and output jack
- Install the tested harness and ground the shielding
- Attach and align the neck
- String, intonate, and set the action

Until those land, one rule serves you well: if a step feels irreversible and something looks off, stop and ask before you commit.

<RelayDiscordCta message="Building now and stuck between a tested harness and a playable guitar? Ask in Discord — I'd rather help you through it live than have you guess." />
```

- [ ] **Step 8: Full verification**

Run: `npx vitest run && npm run lint && npm run build`
Expected: all tests PASS, no lint errors, build succeeds. Confirm in build output: `/relay/parts` and `/relay/wiring` render; `/relay/components` and `app/relay/voicings/[slug]/[page]` are gone.

- [ ] **Step 9: Redirect + link audit**

Run: `grep -rn "/relay/components\|/relay/voicings/[a-z]*/wiring\|voicing.docs\|relay-voicing-lineup-nav\|All voicings" app components config content lib --include=*.ts --include=*.tsx --include=*.mdx || echo "clean"`
Expected: `clean` (no live references to the retired route, the moved wiring URLs, `docs`, the deleted nav, or the removed section).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "refactor: retire voicing docs array; rewrite Assembly as step 5 handoff"
```

---

## Self-Review

**Spec coverage:**
- §A master nav → Task 5. §B voicing pages + Next-in-build → Task 4 (nav visibility via Task 5). §C Parts tabs + complete list + buildable-only → Tasks 1–2. §D Wiring step + content move + redirect → Task 3. §E Assembly rewrite → Task 6. §F config/redirects/docs cleanup/[slug]/[page] removal → Tasks 2/3/5/6. §6 tab mechanism (server Links, one voicing's content) → Task 1 + Tasks 2–3. Decisions (routes, default Lipstick, accordion, buildable-by-content) all covered.
- Refinement vs spec §6: the tab bar is a **server** component of `<Link>`s (with `scroll={false}`) rather than a client component; the page still resolves the active voicing server-side and renders only that content — same UX, less client JS. Noted in Task 1.

**Placeholder scan:** none — every code step shows complete code; no TBD/TODO.

**Type consistency:** `RelayVoicingTabs` props `{ voicings: {slug,name}[], activeSlug, basePath }` consistent across Tasks 1/2/3. `listVoicingsWithParts`/`listVoicingsWithWiring` return `string[]` used identically. `RelayComponentsShoppingList({ components })` new signature applied in both the component (Task 2 Step 5) and the page (Task 2 Step 6). `RelayBuildStage.slug`/`number` widened (Task 5 Step 1) before the 5-stage config uses the new slugs.

**Ordering safety:** between tasks the app stays working via redirects (old `/relay/components` and `/relay/voicings/<slug>/wiring` links resolve once their redirects land in Tasks 2–3); the nav that references `/relay/parts` + `/relay/wiring` is updated last (Task 5), after both routes exist.
