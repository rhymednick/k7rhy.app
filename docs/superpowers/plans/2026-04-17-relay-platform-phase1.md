# Relay Guitar Platform — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Phase 1 — the `/relay` platform intro page and all 7 `/relay/[model]` model overview pages — replacing the old `/docs/relay/` route tree and removing the voting system.

**Architecture:** New top-level `app/relay/` route tree (no `/docs/` prefix). Types and config updated to `lab | ready` status model. Voting system removed entirely. Three new components: Discord CTA, Lab Disclosure, SVG Wiring Diagram prototype. Content MDX files rewritten for phase 1 scope (model overview pages; no build guide yet).

**Tech Stack:** Next.js 15 App Router, TypeScript strict, MDX via `next-mdx-remote`, Tailwind + Shadcn UI, Vitest for tests.

---

## File Map

### Create
| File | Purpose |
|------|---------|
| `app/relay/layout.tsx` | Relay section layout (sidebar + page nav) |
| `app/relay/page.tsx` | Platform overview page (`/relay`) |
| `app/relay/[model]/page.tsx` | Model overview pages (`/relay/lipstick` etc.) |
| `components/relay/relay-discord-cta.tsx` | Reusable Discord join CTA block |
| `components/relay/relay-lab-disclosure.tsx` | Lab status disclosure callout |
| `components/relay/relay-wiring-diagram.tsx` | SVG wiring diagram prototype (Lipstick) |
| `content/relay/reef/index.mdx` | Relay Reef model content |
| `__tests__/config/relay-models.test.ts` | Config validation tests |
| `__tests__/lib/relay.test.ts` | Path resolution and breadcrumb tests |

### Modify
| File | Change |
|------|--------|
| `types/relay-model.ts` | `status: 'lab' \| 'ready'` |
| `types/relay-nav.ts` | `status: 'lab' \| 'ready'` |
| `config/relay-models.ts` | Add Reef; all statuses → `lab`; hrefs → `/relay/`; remove `plannedModelKeys` |
| `config/relay-nav.ts` | Add Reef; update statuses and hrefs; phase 1 platform nav (no build sections) |
| `lib/relay.ts` | Breadcrumb hrefs: `/docs/relay` → `/relay` |
| `components/relay/relay-model-status-badge.tsx` | Lab (amber) / Ready (green) |
| `components/relay/relay-model-lineup-nav.tsx` | Hrefs `/docs/relay/` → `/relay/`; update `PLATFORM_ROUTE_SEGMENTS` |
| `components/doc/relay-model-grid.tsx` | Remove voting props (`rank`, `percentage`, `onSelect`) |
| `components/navigation/relay-sidebar.tsx` | New href constants; phase 1 platform sidebar (overview + models only) |
| `components/mdx-components.tsx` | Remove `RelayVoteGrid`; add `RelayDiscordCta`, `RelayLabDisclosure`, `RelayWiringDiagram` |
| `content/relay/index.mdx` | Full rewrite for phase 1 platform page |
| `content/relay/lipstick/index.mdx` | Update for new structure (Lab status, new component references) |

### Delete
| File | Reason |
|------|--------|
| `app/docs/relay/` (entire dir) | Replaced by `app/relay/` |
| `components/relay/relay-vote-grid.tsx` | Voting removed |
| `app/api/relay-votes/route.ts` | Voting removed |

---

## Task 1: Update Type Definitions

**Files:**
- Modify: `types/relay-model.ts`
- Modify: `types/relay-nav.ts`
- Create: `__tests__/config/relay-models.test.ts`

- [ ] **Step 1: Update `types/relay-model.ts`**

```typescript
export interface RelayModel {
    modelKey: string;
    name: string;
    tagline: string;
    genres: string;
    description: string;
    status: 'lab' | 'ready';
    href?: string;
}
```

- [ ] **Step 2: Update `types/relay-nav.ts`**

```typescript
export interface RelayNavItem {
    title: string;
    slug: string;
}

export interface RelayNavSection {
    title: string;
    slug?: string;
    items?: RelayNavItem[];
}

export interface RelayModelNav {
    title: string;
    status: 'lab' | 'ready';
    sections: RelayNavSection[];
}

export interface RelayNav {
    [model: string]: RelayModelNav;
}

export interface RelayPlatformNav {
    sections: RelayNavSection[];
}
```

- [ ] **Step 3: Write failing config validation tests**

Create `__tests__/config/relay-models.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { relayModels } from '@/config/relay-models';

describe('relayModels config', () => {
    it('contains exactly 7 models', () => {
        expect(relayModels).toHaveLength(7);
    });

    it('includes all expected model keys', () => {
        const keys = relayModels.map((m) => m.modelKey);
        expect(keys).toContain('lipstick');
        expect(keys).toContain('reef');
        expect(keys).toContain('velvet');
        expect(keys).toContain('arc');
        expect(keys).toContain('torch');
        expect(keys).toContain('current');
        expect(keys).toContain('hammer');
    });

    it('every model has required string fields', () => {
        for (const model of relayModels) {
            expect(typeof model.modelKey).toBe('string');
            expect(model.modelKey.length).toBeGreaterThan(0);
            expect(typeof model.name).toBe('string');
            expect(typeof model.tagline).toBe('string');
            expect(typeof model.genres).toBe('string');
            expect(typeof model.description).toBe('string');
        }
    });

    it('every model status is lab or ready', () => {
        for (const model of relayModels) {
            expect(['lab', 'ready']).toContain(model.status);
        }
    });

    it('every model href points to /relay/ not /docs/relay/', () => {
        for (const model of relayModels) {
            if (model.href) {
                expect(model.href).toMatch(/^\/relay\//);
                expect(model.href).not.toContain('/docs/');
            }
        }
    });
});
```

- [ ] **Step 4: Run tests — confirm they fail**

```bash
npx vitest run __tests__/config/relay-models.test.ts
```

Expected: FAIL — `relayModels` still has 6 models, old status values, old hrefs.

- [ ] **Step 5: Commit types**

```bash
git add types/relay-model.ts types/relay-nav.ts __tests__/config/relay-models.test.ts
git commit -m "feat: update relay types to lab/ready status system, add config tests"
```

---

## Task 2: Update Model Config

**Files:**
- Modify: `config/relay-models.ts`

- [ ] **Step 1: Rewrite `config/relay-models.ts`**

```typescript
import type { RelayModel } from '@/types/relay-model';

export const relayModels: RelayModel[] = [
    {
        modelKey: 'lipstick',
        name: 'Relay Lipstick',
        tagline: 'Signature · Articulate · Lipstick layer',
        genres: 'Blues · Rock · Alternative · Indie',
        description:
            'The reference model and first release: expressive dual humbuckers with a middle lipstick as a curated alternate voice — familiar core behavior plus a second identity of the same instrument, not a novelty.',
        status: 'lab',
        href: '/relay/lipstick',
    },
    {
        modelKey: 'reef',
        name: 'Relay Reef',
        tagline: 'Danelectro soul · Humbucker punch · Lipstick shimmer',
        genres: 'Indie · Surf · Alt Country · Shoegaze · Studio',
        description:
            'Bridge humbucker for warmth and sustain; middle and neck lipsticks wired as a single network for glassy, piano-like articulation. Two distinct voices, one concentric tone pot to shape each independently.',
        status: 'lab',
        href: '/relay/reef',
    },
    {
        modelKey: 'velvet',
        name: 'Relay Velvet',
        tagline: 'Warm authority · Club presence',
        genres: 'Jazz · Blues · Soul · R&B',
        description:
            'The warm, fat, classy club model — a distinct center of gravity. The middle pickup is a true core voice (5-way family), poised and present so the band can orbit the guitar.',
        status: 'lab',
        href: '/relay/velvet',
    },
    {
        modelKey: 'arc',
        name: 'Relay Arc',
        tagline: 'Chime · Air · Spatial clarity',
        genres: 'Clean pop · Indie · Ambient · Country',
        description:
            'The airy, spatial, chime-forward model: width, shimmer, and clarity without thinning out — open, ringing, and alive rather than club-warm or mid-forward.',
        status: 'lab',
        href: '/relay/arc',
    },
    {
        modelKey: 'torch',
        name: 'Relay Torch',
        tagline: 'Vocal mids · Hooky · Contemporary',
        genres: 'Rock · Pop · Alternative · Modern country',
        description:
            'The rude, vocal-mid, modern-radio voice: attitude and edge with a P90-type middle as a core position (5-way family) — emotionally direct and hooky without becoming a metal guitar.',
        status: 'lab',
        href: '/relay/torch',
    },
    {
        modelKey: 'current',
        name: 'Relay Current',
        tagline: 'Punch · Cut · Fast attack',
        genres: 'Funk · Pop · Rock',
        description:
            "Punchy, cutting, and immediate: strong projection and edge definition (3-way family with the middle as a fast alternate layer). The line's sharpest non-metal tool — less warm than Velvet, less spacious than Arc, less throaty than Torch.",
        status: 'lab',
        href: '/relay/current',
    },
    {
        modelKey: 'hammer',
        name: 'Relay Hammer',
        tagline: 'High gain · Tight · Uncompromising',
        genres: 'Metal · Hard rock',
        description:
            'The dedicated heavy model: high-gain authority, tight aggressive attack, and rail-style passive pickups — the specialty brute of the line, direct and forceful rather than elegant.',
        status: 'lab',
        href: '/relay/hammer',
    },
];
```

- [ ] **Step 2: Run tests — confirm they pass**

```bash
npx vitest run __tests__/config/relay-models.test.ts
```

Expected: PASS (7 models, valid statuses, correct hrefs).

- [ ] **Step 3: Commit**

```bash
git add config/relay-models.ts
git commit -m "feat: add Reef model, set all statuses to lab, update hrefs to /relay/"
```

---

## Task 3: Update Navigation Config

**Files:**
- Modify: `config/relay-nav.ts`

- [ ] **Step 1: Rewrite `config/relay-nav.ts`**

Phase 1 platform nav has no sections (the build guide doesn't exist yet). Model nav entries for all 7 models with no sub-sections (no parts/wiring pages yet).

```typescript
import type { RelayNav, RelayPlatformNav } from '@/types/relay-nav';

// Phase 1: no build guide sections exist yet. Sections added per phase.
export const relayPlatformNav: RelayPlatformNav = {
    sections: [],
};

export const relayNav: RelayNav = {
    lipstick: {
        title: 'Relay Lipstick',
        status: 'lab',
        sections: [],
    },
    reef: {
        title: 'Relay Reef',
        status: 'lab',
        sections: [],
    },
    velvet: {
        title: 'Relay Velvet',
        status: 'lab',
        sections: [],
    },
    arc: {
        title: 'Relay Arc',
        status: 'lab',
        sections: [],
    },
    torch: {
        title: 'Relay Torch',
        status: 'lab',
        sections: [],
    },
    current: {
        title: 'Relay Current',
        status: 'lab',
        sections: [],
    },
    hammer: {
        title: 'Relay Hammer',
        status: 'lab',
        sections: [],
    },
};
```

- [ ] **Step 2: Commit**

```bash
git add config/relay-nav.ts
git commit -m "feat: update relay nav config for phase 1, add Reef, remove build sections"
```

---

## Task 4: Write Nav Config Tests and Update lib/relay.ts

**Files:**
- Create: `__tests__/lib/relay.test.ts`
- Modify: `lib/relay.ts`

- [ ] **Step 1: Write failing tests for lib/relay.ts**

Create `__tests__/lib/relay.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import path from 'path';
import { resolveRelayFilePath, resolveRelayPlatformFilePath, buildRelayBreadcrumbs, buildRelayPlatformBreadcrumbs } from '@/lib/relay';
import { relayNav, relayPlatformNav } from '@/config/relay-nav';

describe('resolveRelayFilePath', () => {
    it('resolves model index path when slug is empty', () => {
        const result = resolveRelayFilePath('lipstick', []);
        expect(result).toContain(path.join('content', 'relay', 'lipstick', 'index.mdx'));
    });

    it('resolves model sub-page path', () => {
        const result = resolveRelayFilePath('lipstick', ['bom']);
        expect(result).toContain(path.join('content', 'relay', 'lipstick', 'bom.mdx'));
    });
});

describe('resolveRelayPlatformFilePath', () => {
    it('resolves platform section path', () => {
        const result = resolveRelayPlatformFilePath(['build', 'print']);
        expect(result).toContain(path.join('content', 'relay', 'build', 'print.mdx'));
    });
});

describe('buildRelayBreadcrumbs', () => {
    it('builds breadcrumbs for model root page', () => {
        const crumbs = buildRelayBreadcrumbs('lipstick', [], relayNav);
        expect(crumbs[0]).toEqual({ label: 'Relay Guitar', href: '/relay' });
        expect(crumbs[1].label).toBe('Relay Lipstick');
        expect(crumbs[1].href).toBeUndefined();
    });

    it('first breadcrumb links to /relay not /docs/relay', () => {
        const crumbs = buildRelayBreadcrumbs('lipstick', [], relayNav);
        expect(crumbs[0].href).toBe('/relay');
        expect(crumbs[0].href).not.toContain('/docs/');
    });
});

describe('buildRelayPlatformBreadcrumbs', () => {
    it('first breadcrumb links to /relay not /docs/relay', () => {
        const crumbs = buildRelayPlatformBreadcrumbs(['build', 'print'], relayPlatformNav);
        const relayLink = crumbs.find((c) => c.href?.includes('relay'));
        expect(relayLink?.href).toBe('/relay');
        expect(relayLink?.href).not.toContain('/docs/');
    });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx vitest run __tests__/lib/relay.test.ts
```

Expected: FAIL — breadcrumbs still reference `/docs/relay`.

- [ ] **Step 3: Update breadcrumb hrefs in `lib/relay.ts`**

Change only the two breadcrumb builder functions. The file path resolution functions are unchanged.

In `buildRelayPlatformBreadcrumbs`, replace:
```typescript
        { label: 'Docs', href: '/docs' },
        { label: 'Relay Guitar Platform', href: '/docs/relay' },
```
with:
```typescript
        { label: 'Relay Guitar', href: '/relay' },
```

In `buildRelayBreadcrumbs`, replace:
```typescript
    if (slug.length === 0) {
        return [
            { label: 'Docs', href: '/docs' },
            { label: 'Relay Guitar Platform', href: '/docs/relay' },
            { label: nav[model]?.title ?? model },
        ];
    }
    // ...
    return [
        { label: 'Docs', href: '/docs' },
        { label: 'Relay Guitar Platform', href: '/docs/relay' },
        { label: modelNav?.title ?? model, href: `/docs/relay/${model}` },
        ...(sectionTitle && sectionTitle !== modelNav?.title ? [{ label: sectionTitle }] : []),
        { label: pageTitle ?? slug[slug.length - 1] },
    ];
```
with:
```typescript
    if (slug.length === 0) {
        return [
            { label: 'Relay Guitar', href: '/relay' },
            { label: nav[model]?.title ?? model },
        ];
    }
    // ...
    return [
        { label: 'Relay Guitar', href: '/relay' },
        { label: modelNav?.title ?? model, href: `/relay/${model}` },
        ...(sectionTitle && sectionTitle !== modelNav?.title ? [{ label: sectionTitle }] : []),
        { label: pageTitle ?? slug[slug.length - 1] },
    ];
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npx vitest run __tests__/lib/relay.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/relay.ts __tests__/lib/relay.test.ts
git commit -m "feat: update relay breadcrumb hrefs to /relay/, add lib tests"
```

---

## Task 5: Update Status Badge Component

**Files:**
- Modify: `components/relay/relay-model-status-badge.tsx`

- [ ] **Step 1: Rewrite the badge component**

```typescript
import React from 'react';
import { cn } from '@/lib/utils';

export type RelayModelStatus = 'lab' | 'ready';

export function RelayModelStatusBadge({ status, className }: { status: RelayModelStatus; className?: string }) {
    if (status === 'ready') {
        return (
            <span
                className={cn(
                    'shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400',
                    className,
                )}
            >
                Ready
            </span>
        );
    }
    return (
        <span
            className={cn(
                'shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400',
                className,
            )}
        >
            Lab
        </span>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/relay/relay-model-status-badge.tsx
git commit -m "feat: update status badge to Lab (amber) / Ready (green)"
```

---

## Task 6: Update Model Lineup Nav

**Files:**
- Modify: `components/relay/relay-model-lineup-nav.tsx`

- [ ] **Step 1: Update hrefs and platform route segments**

```typescript
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { relayNav } from '@/config/relay-nav';
import { RelayModelStatusBadge } from '@/components/relay/relay-model-status-badge';

// Segments under /relay/ that are platform routes, not model keys.
// Expand this list as build guide phases ship (e.g. 'build').
const PLATFORM_ROUTE_SEGMENTS = new Set(['build']);

function activeModelKeyFromPath(pathname: string): string | undefined {
    const parts = pathname.split('/').filter(Boolean);
    const relayIdx = parts.indexOf('relay');
    const next = relayIdx >= 0 ? parts[relayIdx + 1] : undefined;
    if (!next || PLATFORM_ROUTE_SEGMENTS.has(next)) return undefined;
    return relayNav[next] ? next : undefined;
}

export function RelayModelLineupNav() {
    const pathname = usePathname() ?? '';
    const activeKey = activeModelKeyFromPath(pathname);
    const entries = Object.entries(relayNav);

    return (
        <div className="grid grid-flow-row auto-rows-max text-sm">
            {entries.map(([key, model]) => {
                const href = `/relay/${key}`;
                const isActive = activeKey === key;
                return (
                    <Link
                        key={key}
                        href={href}
                        className={cn(
                            'flex w-full items-center justify-between gap-2 rounded-md border border-transparent px-2 py-1 hover:underline',
                            isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
                        )}
                    >
                        <span className="min-w-0">{model.title}</span>
                        <RelayModelStatusBadge status={model.status} />
                    </Link>
                );
            })}
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/relay/relay-model-lineup-nav.tsx
git commit -m "feat: update lineup nav hrefs to /relay/, simplify platform segments"
```

---

## Task 7: Simplify Model Card — Remove Voting Props

**Files:**
- Modify: `components/doc/relay-model-grid.tsx`

- [ ] **Step 1: Remove voting props from `RelayModelCard`**

Remove `rank`, `percentage`, and `onSelect` props and all their associated styles and rendering logic. Cards are now either linked (with `href`) or static (neither link nor button).

```typescript
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { RelayModelStatusBadge, type RelayModelStatus } from '@/components/relay/relay-model-status-badge';

interface RelayModelCardProps {
    name: string;
    tagline: string;
    genres: string;
    description: string;
    status: RelayModelStatus;
    href?: string;
}

export function RelayModelCard({ name, tagline, genres, description, status, href }: RelayModelCardProps) {
    const inner = (
        <div
            className={cn(
                'flex h-full flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all',
                href && 'group-hover:border-sky-500 group-hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]',
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <h3
                    className={cn(
                        'font-semibold text-foreground',
                        href && 'transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400',
                    )}
                >
                    {name}
                </h3>
                <RelayModelStatusBadge status={status} />
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{tagline}</p>
            <p className="flex-1 text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground/70">{genres}</p>
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="group block">
                {inner}
            </Link>
        );
    }

    return <div>{inner}</div>;
}

export function RelayModelGrid({ children }: { children: React.ReactNode }) {
    return <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/doc/relay-model-grid.tsx
git commit -m "refactor: remove voting props from RelayModelCard"
```

---

## Task 8: Remove Voting System

**Files:**
- Delete: `components/relay/relay-vote-grid.tsx`
- Delete: `app/api/relay-votes/route.ts`

- [ ] **Step 1: Delete voting component**

```bash
git rm components/relay/relay-vote-grid.tsx
```

- [ ] **Step 2: Delete voting API route**

Check which path the route is at, then delete it:

```bash
# Check location first
ls app/api/relay-votes/ 2>/dev/null || ls pages/api/relay-votes* 2>/dev/null

# Delete whichever exists:
git rm -r app/api/relay-votes/
# or:
git rm pages/api/relay-votes.ts
```

- [ ] **Step 3: Commit**

```bash
git commit -m "refactor: remove voting system (RelayVoteGrid, relay-votes API)"
```

---

## Task 9: Add Discord CTA Component

**Files:**
- Create: `components/relay/relay-discord-cta.tsx`

- [ ] **Step 1: Create the component**

```typescript
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RelayDiscordCtaProps {
    channelHref?: string;
    message?: string;
    className?: string;
}

export function RelayDiscordCta({
    channelHref = 'https://discord.gg/YOUR_INVITE', // replace with real invite during content phase
    message = 'Ask questions, share your build, and follow development as the guides are written.',
    className,
}: RelayDiscordCtaProps) {
    return (
        <div
            className={cn(
                'my-6 flex flex-col gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5 sm:flex-row sm:items-center sm:justify-between',
                className,
            )}
        >
            <div>
                <p className="font-semibold text-foreground">Join the community</p>
                <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            </div>
            <Link
                href={channelHref}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
                Open Discord →
            </Link>
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/relay/relay-discord-cta.tsx
git commit -m "feat: add RelayDiscordCta component"
```

---

## Task 10: Add Lab Disclosure Component

**Files:**
- Create: `components/relay/relay-lab-disclosure.tsx`

- [ ] **Step 1: Create the component**

```typescript
import React from 'react';

export function RelayLabDisclosure() {
    return (
        <div className="my-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-800 dark:text-amber-300">
            <p className="font-semibold">Lab model</p>
            <p className="mt-1 text-amber-700 dark:text-amber-400">
                This model&apos;s design is complete but hasn&apos;t been physically built and validated yet. Component choices and wiring
                details may change after testing. Join the Discord to follow development and share early builds.
            </p>
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/relay/relay-lab-disclosure.tsx
git commit -m "feat: add RelayLabDisclosure component"
```

---

## Task 11: SVG Wiring Diagram Prototype

**Files:**
- Create: `components/relay/relay-wiring-diagram.tsx`

This is a prototype for validation. The goal is a clean topographic SVG showing pickup positions, controls, and color-coded wiring. Full diagrams for each model are authored once the approach is approved. This task ships a Lipstick prototype and a "diagram in progress" placeholder for all others.

- [ ] **Step 1: Create the component**

```typescript
import React from 'react';

export type PickupType = 'humbucker' | 'lipstick' | 'p90' | 'single';
export type SelectorType = '3-way' | '5-way';

interface WiringDiagramProps {
    /** Set to true for Lab models where the final diagram isn't ready */
    placeholder?: boolean;
    modelName?: string;
}

function PlaceholderDiagram({ modelName }: { modelName?: string }) {
    return (
        <div className="my-6 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 py-10 text-sm text-muted-foreground">
            <span className="font-medium">Wiring diagram</span>
            <span>{modelName ? `${modelName} diagram in progress` : 'Diagram in progress'}</span>
            <span className="text-xs">Published when design is validated</span>
        </div>
    );
}

/** Lipstick prototype: 3-way selector, bridge+neck humbuckers, middle lipstick via blend */
function LipstickDiagram() {
    return (
        <div className="my-6 overflow-x-auto">
            <svg
                viewBox="0 0 520 300"
                className="mx-auto w-full max-w-[520px]"
                aria-label="Relay Lipstick wiring diagram"
                role="img"
            >
                {/* Background */}
                <rect width="520" height="300" rx="12" fill="currentColor" className="text-muted/20" />

                {/* ── Pickup symbols ── */}
                {/* Bridge humbucker */}
                <g transform="translate(60, 40)">
                    <rect x="0" y="0" width="80" height="30" rx="4" fill="none" stroke="currentColor" className="text-border" strokeWidth="1.5" />
                    <rect x="4" y="4" width="34" height="22" rx="2" fill="currentColor" className="text-muted-foreground/20" />
                    <rect x="42" y="4" width="34" height="22" rx="2" fill="currentColor" className="text-muted-foreground/20" />
                    <text x="40" y="-8" textAnchor="middle" className="text-[10px] fill-muted-foreground font-mono">BRIDGE</text>
                </g>

                {/* Middle lipstick */}
                <g transform="translate(220, 40)">
                    <rect x="0" y="0" width="80" height="18" rx="9" fill="none" stroke="currentColor" className="text-border" strokeWidth="1.5" />
                    <text x="40" y="-8" textAnchor="middle" className="text-[10px] fill-muted-foreground font-mono">MIDDLE</text>
                </g>

                {/* Neck humbucker */}
                <g transform="translate(380, 40)">
                    <rect x="0" y="0" width="80" height="30" rx="4" fill="none" stroke="currentColor" className="text-border" strokeWidth="1.5" />
                    <rect x="4" y="4" width="34" height="22" rx="2" fill="currentColor" className="text-muted-foreground/20" />
                    <rect x="42" y="4" width="34" height="22" rx="2" fill="currentColor" className="text-muted-foreground/20" />
                    <text x="40" y="-8" textAnchor="middle" className="text-[10px] fill-muted-foreground font-mono">NECK</text>
                </g>

                {/* ── 3-way switch ── */}
                <g transform="translate(200, 130)">
                    <rect x="0" y="0" width="120" height="28" rx="4" fill="none" stroke="currentColor" className="text-border" strokeWidth="1.5" />
                    {[0, 1, 2].map((i) => (
                        <circle key={i} cx={20 + i * 40} cy={14} r={6} fill="none" stroke="currentColor" className="text-muted-foreground/50" strokeWidth="1.5" />
                    ))}
                    <text x="60" y="46" textAnchor="middle" className="text-[10px] fill-muted-foreground font-mono">3-WAY SELECTOR</text>
                </g>

                {/* ── Controls row ── */}
                {/* Volume pot */}
                <g transform="translate(120, 200)">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" className="text-border" strokeWidth="1.5" />
                    <circle cx="20" cy="20" r="8" fill="currentColor" className="text-muted-foreground/30" />
                    <text x="20" y="48" textAnchor="middle" className="text-[10px] fill-muted-foreground font-mono">VOL</text>
                </g>

                {/* Tone pot (humbucker) */}
                <g transform="translate(220, 200)">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" className="text-border" strokeWidth="1.5" />
                    <circle cx="20" cy="20" r="8" fill="currentColor" className="text-muted-foreground/30" />
                    <text x="20" y="48" textAnchor="middle" className="text-[10px] fill-muted-foreground font-mono">TONE HB</text>
                </g>

                {/* Tone pot (lipstick blend) */}
                <g transform="translate(320, 200)">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" className="text-border" strokeWidth="1.5" />
                    <circle cx="20" cy="20" r="8" fill="currentColor" className="text-muted-foreground/30" />
                    <text x="20" y="48" textAnchor="middle" className="text-[10px] fill-muted-foreground font-mono">BLEND</text>
                </g>

                {/* ── Output jack ── */}
                <g transform="translate(430, 200)">
                    <rect x="0" y="0" width="36" height="36" rx="18" fill="none" stroke="currentColor" className="text-border" strokeWidth="1.5" />
                    <circle cx="18" cy="18" r="6" fill="currentColor" className="text-muted-foreground/40" />
                    <text x="18" y="54" textAnchor="middle" className="text-[10px] fill-muted-foreground font-mono">OUTPUT</text>
                </g>

                {/* ── Wiring connections (hot signals) ── */}
                {/* Bridge → switch pos 1 */}
                <line x1="100" y1="70" x2="210" y2="137" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
                {/* Neck → switch pos 3 */}
                <line x1="420" y1="70" x2="310" y2="137" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
                {/* Middle → blend pot */}
                <line x1="260" y1="58" x2="340" y2="200" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
                {/* Switch → volume */}
                <line x1="230" y1="158" x2="140" y2="200" stroke="#ef4444" strokeWidth="1.5" opacity="0.7" />
                {/* Volume → output */}
                <line x1="160" y1="218" x2="430" y2="218" stroke="#ef4444" strokeWidth="1.5" opacity="0.7" />

                {/* ── Legend ── */}
                <g transform="translate(20, 270)">
                    <line x1="0" y1="6" x2="20" y2="6" stroke="#ef4444" strokeWidth="1.5" />
                    <text x="26" y="10" className="text-[9px] fill-muted-foreground">Hot</text>
                    <line x1="60" y1="6" x2="80" y2="6" stroke="#f59e0b" strokeWidth="1.5" />
                    <text x="86" y="10" className="text-[9px] fill-muted-foreground">Lipstick blend</text>
                </g>

                <text x="260" y="290" textAnchor="middle" className="text-[9px] fill-muted-foreground/50">
                    Provisional — subject to change after physical validation
                </text>
            </svg>
        </div>
    );
}

export function RelayWiringDiagram({ placeholder = false, modelName }: WiringDiagramProps) {
    if (placeholder) return <PlaceholderDiagram modelName={modelName} />;
    return <LipstickDiagram />;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/relay/relay-wiring-diagram.tsx
git commit -m "feat: add RelayWiringDiagram SVG prototype (Lipstick layout)"
```

---

## Task 12: Update Sidebar Navigation

**Files:**
- Modify: `components/navigation/relay-sidebar.tsx`

Phase 1 sidebar is simpler: no platform guide sections, no "Choosing a model" link. PlatformSidebar shows only the overview link + model lineup. ModelSidebar shows back-link + model name only (no sub-sections).

- [ ] **Step 1: Rewrite the sidebar**

```typescript
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { relayNav } from '@/config/relay-nav';
import type { RelayBreadcrumb } from '@/lib/relay';
import { MyBreadcrumbs } from '@/components/doc/doc-page';
import { RelayModelLineupNav } from '@/components/relay/relay-model-lineup-nav';

const PLATFORM_HREF = '/relay';
const PLATFORM_LABEL = 'Relay Guitar';

// ─── Platform-level sidebar ───────────────────────────────────────────────────

function PlatformSidebar() {
    const pathname = usePathname();

    return (
        <nav aria-label="Relay Guitar navigation" className="w-full">
            <div className="pb-4">
                <div className="grid grid-flow-row auto-rows-max text-sm">
                    <Link
                        href={PLATFORM_HREF}
                        className={cn(
                            'flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline',
                            pathname === PLATFORM_HREF ? 'font-medium text-foreground' : 'text-muted-foreground',
                        )}
                    >
                        Platform Overview
                    </Link>
                </div>
            </div>

            <div className="pb-4">
                <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">Models</h4>
                <RelayModelLineupNav />
            </div>
        </nav>
    );
}

// ─── Model-level sidebar ──────────────────────────────────────────────────────

function ModelSidebar({ model }: { model: string }) {
    const pathname = usePathname();
    const modelNav = relayNav[model];

    if (!modelNav) return null;

    const modelRootHref = `/relay/${model}`;
    const isModelRootActive = pathname === modelRootHref;

    return (
        <nav aria-label="Relay Guitar navigation" className="w-full">
            <div className="pb-3">
                <Link
                    href={PLATFORM_HREF}
                    className="block px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
                >
                    ← {PLATFORM_LABEL}
                </Link>
            </div>

            <div className="pb-4">
                <div className="grid grid-flow-row auto-rows-max text-sm">
                    <Link
                        href={modelRootHref}
                        className={cn(
                            'flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline',
                            isModelRootActive ? 'font-medium text-foreground' : 'text-muted-foreground',
                        )}
                    >
                        {modelNav.title}
                    </Link>
                </div>
            </div>

            <div className="border-t pt-4">
                <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">All models</h4>
                <RelayModelLineupNav />
            </div>
        </nav>
    );
}

// ─── Auto-switching sidebar ───────────────────────────────────────────────────

// Segments under /relay/ that are platform routes, not model keys.
const PLATFORM_SECTIONS = new Set(['build']);

export function RelayLayoutSidebar() {
    const pathname = usePathname() ?? '';
    const segments = pathname.split('/').filter(Boolean);
    const relayIndex = segments.indexOf('relay');
    const nextSegment = relayIndex >= 0 ? (segments[relayIndex + 1] ?? '') : '';

    if (!nextSegment || PLATFORM_SECTIONS.has(nextSegment)) {
        return <PlatformSidebar />;
    }

    return <ModelSidebar model={nextSegment} />;
}

// ─── Breadcrumb bar ───────────────────────────────────────────────────────────

export function RelayBreadcrumbBar({ items }: { items: RelayBreadcrumb[] }) {
    return <MyBreadcrumbs items={items} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/navigation/relay-sidebar.tsx
git commit -m "feat: update relay sidebar for phase 1 structure and /relay/ hrefs"
```

---

## Task 13: Create app/relay Routes

**Files:**
- Create: `app/relay/layout.tsx`
- Create: `app/relay/page.tsx`
- Create: `app/relay/[model]/page.tsx`

- [ ] **Step 1: Create `app/relay/layout.tsx`**

```typescript
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PageNavigation } from '@/components/page-navigation';
import { RelayLayoutSidebar } from '@/components/navigation/relay-sidebar';

export default function RelayLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex w-full flex-col lg:flex-row lg:items-start">
            <aside className="w-full lg:sticky lg:top-14 lg:-ml-2 lg:w-auto lg:min-w-[220px] lg:max-w-[280px]">
                <ScrollArea className="h-full py-6 pr-6 lg:py-8">
                    <RelayLayoutSidebar />
                </ScrollArea>
            </aside>
            <div className="flex flex-col lg:flex-1 lg:flex-row lg:gap-10">
                <div className="flex-1">{children}</div>
                <aside className="lg:ml-1 lg:w-64">
                    <PageNavigation />
                </aside>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Create `app/relay/page.tsx`**

```typescript
import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage } from '@/components/doc/doc-page';
import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
import { loadRelayPlatformPage } from '@/lib/relay';

export async function generateMetadata() {
    try {
        const { frontmatter } = loadRelayPlatformPage();
        return {
            title: `${frontmatter.title} | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}

export default async function RelayPlatformPage() {
    const { content, frontmatter } = loadRelayPlatformPage();
    const breadcrumbs = [{ label: 'Relay Guitar' }];
    return (
        <DocPage title={frontmatter.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
            <MDXRemote source={content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </DocPage>
    );
}
```

- [ ] **Step 3: Create `app/relay/[model]/page.tsx`**

```typescript
import React from 'react';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage } from '@/components/doc/doc-page';
import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
import { loadRelayPage, buildRelayBreadcrumbs } from '@/lib/relay';
import { relayNav } from '@/config/relay-nav';

type Props = { params: Promise<{ model: string }> };

export function generateStaticParams() {
    return Object.keys(relayNav).map((model) => ({ model }));
}

export async function generateMetadata({ params }: Props) {
    const { model } = await params;
    try {
        const { frontmatter } = loadRelayPage(model, []);
        return {
            title: `${frontmatter.title} | Relay Guitar | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}

export default async function RelayModelPage({ params }: Props) {
    const { model } = await params;
    let content: string;
    let frontmatter: { title: string; description: string };
    try {
        ({ content, frontmatter } = loadRelayPage(model, []));
    } catch {
        notFound();
    }
    const breadcrumbs = buildRelayBreadcrumbs(model, [], relayNav);
    return (
        <DocPage title={frontmatter!.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
            <MDXRemote source={content!} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </DocPage>
    );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/relay/
git commit -m "feat: add app/relay routes (platform page and model pages)"
```

---

## Task 14: Update MDX Component Registry

**Files:**
- Modify: `components/mdx-components.tsx`

- [ ] **Step 1: Remove `RelayVoteGrid`, add new components**

Find the relevant lines in `components/mdx-components.tsx`.

Remove:
```typescript
import { RelayVoteGrid } from '@/components/relay/relay-vote-grid';
```

Add:
```typescript
import { RelayDiscordCta } from '@/components/relay/relay-discord-cta';
import { RelayLabDisclosure } from '@/components/relay/relay-lab-disclosure';
import { RelayWiringDiagram } from '@/components/relay/relay-wiring-diagram';
```

In the `components` export object, remove:
```typescript
RelayVoteGrid,
```

Add:
```typescript
RelayDiscordCta,
RelayLabDisclosure,
RelayWiringDiagram,
```

- [ ] **Step 2: Verify no other files reference `RelayVoteGrid`**

```bash
grep -r "RelayVoteGrid" --include="*.tsx" --include="*.mdx" --include="*.ts" .
```

Expected: no results (we already deleted the component and removed from registry).

- [ ] **Step 3: Commit**

```bash
git add components/mdx-components.tsx
git commit -m "feat: register RelayDiscordCta, RelayLabDisclosure, RelayWiringDiagram; remove RelayVoteGrid"
```

---

## Task 15: Delete Old app/docs/relay Routes

**Files:**
- Delete: `app/docs/relay/` (entire directory)

- [ ] **Step 1: Check for any remaining references to /docs/relay/ routes**

```bash
grep -r "docs/relay" --include="*.tsx" --include="*.ts" --include="*.mdx" . | grep -v ".git" | grep -v "node_modules"
```

Fix any references found before deleting.

- [ ] **Step 2: Delete the directory**

```bash
git rm -r app/docs/relay/
```

- [ ] **Step 3: Commit**

```bash
git commit -m "refactor: remove app/docs/relay/ route tree (replaced by app/relay/)"
```

---

## Task 16: Rewrite Platform Page Content

**Files:**
- Modify: `content/relay/index.mdx`

- [ ] **Step 1: Rewrite `content/relay/index.mdx`**

```mdx
---
title: 'Relay Guitar Platform'
description: 'A 3D-printed electric guitar platform. One shared body, seven distinct instruments. Build the guitar that fits how you play.'
---

Relay is an electric guitar you print at home on a conventional FDM 3D printer. Every model shares the same double-cut body — three pickup cavities, the same scale length, the same hardware mounting points. What makes each model different is what you put inside it: pickup selection, wiring, and selector strategy.

Building a Relay guitar is a real project. You will spend time on the printer, time bonding and finishing the body, time sourcing parts, and time with a soldering iron. The result is a playable, giggable instrument that you understand completely — because you built it. Plan on a few weekends and $200–$400 in parts depending on the model you choose.

## The platform

### One body, seven voices

All models use the same printed body. Pickup ring adapters bridge the gap between the body's humbucker-sized cavities and smaller pickup formats like lipstick or P90. You choose one body design to print, then wire it for whichever model you're building.

### 24.75" scale length

Scale length is the distance from the nut to the bridge saddles — it determines how long the vibrating portion of each string is. Relay uses 24.75 inches, the same as a standard Les Paul. Shorter than a Strat's 25.5 inches: slightly lower string tension, slightly warmer tone, and easier bends. It also means neck availability is excellent — 24.75" necks are common, well-priced, and come in a wide range of profiles and fretboard materials.

### Three pickups

Every model has three pickup cavities. The middle position earns its place differently in each model: on some models it is a curated layer you blend in for texture; on others it is a full core voice you reach directly. The selector strategy follows that role — models where the middle is an auxiliary layer use a 3-way switch, models where the middle is a primary voice use a 5-way blade.

You don't have to install a middle pickup. The model files include optional cavity covers if you prefer a two-pickup layout.

## Models

<RelayModelGrid>
    <RelayModelCard
        name="Relay Lipstick"
        tagline="Signature · Articulate · Lipstick layer"
        genres="Blues · Rock · Alternative · Indie"
        description="The reference model: expressive dual humbuckers with a middle lipstick as a curated alternate voice. A second identity of the same instrument, not a novelty."
        status="lab"
        href="/relay/lipstick"
    />
    <RelayModelCard
        name="Relay Reef"
        tagline="Danelectro soul · Humbucker punch · Lipstick shimmer"
        genres="Indie · Surf · Alt Country · Shoegaze"
        description="Bridge humbucker for warmth and sustain; middle and neck lipsticks as a single network for glassy, piano-like articulation. Two distinct voices, one concentric tone pot."
        status="lab"
        href="/relay/reef"
    />
    <RelayModelCard
        name="Relay Velvet"
        tagline="Warm authority · Club presence"
        genres="Jazz · Blues · Soul · R&B"
        description="The warm, fat, classy club model. The middle pickup is a true core voice — poised and present so the band can orbit the guitar."
        status="lab"
        href="/relay/velvet"
    />
    <RelayModelCard
        name="Relay Arc"
        tagline="Chime · Air · Spatial clarity"
        genres="Clean pop · Indie · Ambient · Country"
        description="Airy, spatial, and chime-forward: width, shimmer, and clarity without thinning out — open and ringing rather than club-warm or mid-forward."
        status="lab"
        href="/relay/arc"
    />
    <RelayModelCard
        name="Relay Torch"
        tagline="Vocal mids · Hooky · Contemporary"
        genres="Rock · Pop · Alternative · Modern country"
        description="Rude, vocal-mid energy with a P90-type middle as a core position — emotionally direct and hooky without becoming a metal guitar."
        status="lab"
        href="/relay/torch"
    />
    <RelayModelCard
        name="Relay Current"
        tagline="Punch · Cut · Fast attack"
        genres="Funk · Pop · Rock"
        description="Punchy, cutting, and immediate — the line's sharpest non-metal tool. Strong projection and edge definition with the middle as a fast alternate layer."
        status="lab"
        href="/relay/current"
    />
    <RelayModelCard
        name="Relay Hammer"
        tagline="High gain · Tight · Uncompromising"
        genres="Metal · Hard rock"
        description="The dedicated heavy model: high-gain authority, tight aggressive attack, rail-style passive pickups. Direct and forceful rather than elegant."
        status="lab"
        href="/relay/hammer"
    />
</RelayModelGrid>

## Community

The build guides are being written as each model is validated. The Discord server is where questions get answered, builds get shared, and new documentation takes shape based on what people actually find confusing.

<RelayDiscordCta message="Ask questions, share builds, and follow development as the guides are written." />
```

- [ ] **Step 2: Verify the MDX file is well-formed**

```bash
npx vitest run
```

Expected: all tests pass (content file doesn't affect unit tests, but ensures the build won't break on missing exports).

- [ ] **Step 3: Commit**

```bash
git add content/relay/index.mdx
git commit -m "feat: rewrite relay platform page content for phase 1"
```

---

## Task 17: Create Relay Reef Content

**Files:**
- Create: `content/relay/reef/index.mdx`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p content/relay/reef
```

Create `content/relay/reef/index.mdx`:

```mdx
---
title: 'Relay Reef'
description: 'Bridge humbucker with a lipstick middle and neck treated as a single network — two distinct voices with independent tone control.'
---

<RelayLabDisclosure />

## Voice and character

Reef is built around contrast. The **bridge humbucker** provides warmth, sustain, and enough output to push an amp into bloom. The **lipstick network** — middle and neck pickups wired together as one — delivers the glassy, piano-like articulation that defines the Danelectro 59 sound. These are not similar pickups balancing each other. They are two genuinely different voices sharing one body.

The **5-way blade switch** gives you the full range: pure humbucker, blended positions where the two characters layer, and pure lipstick shimmer at the other end. The **concentric stacked tone pot** keeps the voices independent — shape the humbucker's high-end without affecting the lipstick clarity, or roll off the lipstick network while keeping the humbucker bright.

## Who builds this

Makers who want the Danelectro character — glassy, articulate, almost acoustic — but also need a bridge pickup with real weight. Players drawn to indie textures, surf reverb, alt-country, and shoegaze. Anyone who thinks of pedals as part of the instrument: lipstick pickups are transparent enough to let effects breathe without coloring them.

## Where it shines

Clean to semi-clean through a tweed or EL84 amp. Surf reverb and tremolo with the lipstick network. Indie rhythm and lead work with the bridge humbucker. In a studio context, the contrast between the two voices gives you genuine tonal variety in a single session without changing guitars.

## Configuration

| | |
|---|---|
| **Bridge** | Humbucker |
| **Middle** | Lipstick |
| **Neck** | Lipstick — wired as network with middle |
| **Selector** | 5-way blade |
| **Volume** | Single pot |
| **Tone** | Concentric stacked — humbucker tone (top) / lipstick network tone (bottom) |

<RelayWiringDiagram placeholder modelName="Relay Reef" />

## Target pickups

*This model is in Lab status — component choices may be refined after physical testing.*

<RelayRecommendedPickups
    bridge="Bridge humbucker — target specs TBD after testing"
    middle="Lipstick — target specs TBD after testing"
    neck="Lipstick — target specs TBD after testing"
/>

<RelayDiscordCta
    message="Following the Reef build? Join the Discord to ask questions, share early builds, and help validate the design."
/>
```

- [ ] **Step 2: Commit**

```bash
git add content/relay/reef/
git commit -m "feat: add Relay Reef model content"
```

---

## Task 18: Update Lipstick Model Content

**Files:**
- Modify: `content/relay/lipstick/index.mdx`

The Lipstick page needs to use the new components (`RelayLabDisclosure`, `RelayWiringDiagram`, `RelayDiscordCta`) and update links from `/docs/relay/` to `/relay/`.

- [ ] **Step 1: Update `content/relay/lipstick/index.mdx`**

```mdx
---
title: 'Relay Lipstick'
description: 'The reference Relay model — expressive dual humbuckers, middle lipstick as a curated alternate voice, and a player-first control story.'
---

<RelayLabDisclosure />

## Voice and character

Relay Lipstick is the **signature model** in the family: the one with the clearest "Relay" identity. **Neck and bridge humbuckers** are the familiar backbone — riffs, chords, and weight. The **middle lipstick** is not a standalone destination you park on. It is a **musically curated alternate layer** you bring in when you want a second character: more air, more detail, a shifted spectral balance on top of the humbuckers — polish and personality without turning the guitar into a gimmick.

The behavior should feel like a **normal guitar first**. The lipstick path should read as a **second identity of the same instrument**, not a special effect.

## Who builds this

Makers who want **strong clean articulation**, **expressive pick response**, a bridge that can still get a little angry, and **touch sensitivity** more than sheer output or maximum tonal coverage. If your target is **blues, rock, alternative, and indie**, Lipstick is aimed at you.

## Configuration

| | |
|---|---|
| **Bridge** | Humbucker |
| **Middle** | Lipstick |
| **Neck** | Humbucker |
| **Selector** | 3-way (bridge / bridge+neck / neck) |
| **Volume** | Single pot |
| **Tone** | Single pot (humbucker voice) + middle blend control |

<RelayWiringDiagram />

<RelayRecommendedPickups
    neck="GFS Professional Series Alnico II Humbucker (neck, 7.6K DC resistance)"
    middle="GFS Pro-Tube Lipstick (middle, 6.0K DC resistance)"
    bridge="GFS VEH humbucker (bridge, 11.2K DC resistance)"
/>

<RelayDiscordCta
    message="Building a Lipstick? Share your progress and ask questions in the Discord."
/>
```

- [ ] **Step 2: Commit**

```bash
git add content/relay/lipstick/index.mdx
git commit -m "feat: update Lipstick content for phase 1 structure"
```

---

## Task 19: Update Remaining Model Content Files

**Files:**
- Modify: `content/relay/velvet/index.mdx`
- Modify: `content/relay/arc/index.mdx`
- Modify: `content/relay/torch/index.mdx`
- Modify: `content/relay/current/index.mdx`
- Modify: `content/relay/hammer/index.mdx`

Each of these files needs consistent structure: title/description frontmatter, `RelayLabDisclosure`, sound character, configuration table, `RelayWiringDiagram placeholder`, `RelayDiscordCta`. Read each file first to see what content already exists and preserve what's accurate.

- [ ] **Step 1: Update each model file**

For each model (`velvet`, `arc`, `torch`, `current`, `hammer`), read the existing file, then update it to match this template pattern (adapt the content to the model's actual character):

```mdx
---
title: 'Relay [Name]'
description: '[One sentence description]'
---

<RelayLabDisclosure />

## Voice and character

[Existing description text, adapted for new structure]

## Who builds this

[Target maker/player description]

## Configuration

| | |
|---|---|
| **Bridge** | [pickup type] |
| **Middle** | [pickup type] |
| **Neck** | [pickup type] |
| **Selector** | [3-way or 5-way] |
| **Volume** | Single pot |
| **Tone** | [control description] |

<RelayWiringDiagram placeholder modelName="Relay [Name]" />

<RelayDiscordCta
    message="Interested in the [Name]? Join the Discord to follow development."
/>
```

- [ ] **Step 2: Commit after all five are updated**

```bash
git add content/relay/velvet/ content/relay/arc/ content/relay/torch/ content/relay/current/ content/relay/hammer/
git commit -m "feat: update remaining model pages for phase 1 structure"
```

---

## Task 20: Verify Full Build

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 2: Check for broken imports**

```bash
npx tsc --noEmit
```

Fix any TypeScript errors before proceeding.

- [ ] **Step 3: Run the dev server and manually verify routes**

```bash
npm run dev
```

Check in browser:
- `http://localhost:3000/relay` — platform page loads, model gallery shows all 7 cards with Lab badges
- `http://localhost:3000/relay/lipstick` — Lipstick page loads with Lab disclosure, wiring diagram SVG, Discord CTA
- `http://localhost:3000/relay/reef` — Reef page loads with Lab disclosure, placeholder diagram, Discord CTA
- `http://localhost:3000/relay/velvet` — Lab page loads correctly
- Sidebar shows "Platform Overview" + all 7 models on platform routes
- Sidebar shows model name + "← Relay Guitar" back link on model routes
- No broken links to `/docs/relay/`

- [ ] **Step 4: Run full build**

```bash
npm run build
```

Expected: build passes with no errors. Fix any static generation errors before considering this done.

- [ ] **Step 5: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: resolve build issues from phase 1 integration"
```

---

## Self-Review Checklist

- [x] **Spec §3 URL Structure** — all new routes in `app/relay/`, no `/docs/` prefix ✓
- [x] **Spec §4 Model Lineup** — 7 models in config, Reef added, all `lab` status ✓
- [x] **Spec §5 Relay Reef** — content file created with hardware spec and sound character ✓
- [x] **Spec §8 Platform Page** — `content/relay/index.mdx` rewritten with all 4 sections ✓
- [x] **Spec §9 Navigation** — sidebar updated for phase 1 structure ✓
- [x] **Spec §11 Remove voting** — `RelayVoteGrid`, API route, `plannedModelKeys` all removed ✓
- [x] **Spec §11 Keep components** — `RelayRecommendedPickups`, `BomSection`, `DecisionNote`, etc. untouched ✓
- [x] **Spec §11 New components** — `RelayDiscordCta`, `RelayLabDisclosure`, `RelayWiringDiagram` created ✓
- [x] **Spec §12 Player vocabulary** — `RelayLabDisclosure` and `RelayDiscordCta` use plain language ✓
- [x] **Phase 1 completeness** — no build guide routes or stubs in this plan ✓
- [x] **Type consistency** — `'lab' | 'ready'` used consistently across types, config, badge, nav ✓
