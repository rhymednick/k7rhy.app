# Coupeville Line Landing + Model Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Coupeville line landing page, six state-free model pages, and a wired-but-empty `/products/coupeville` commerce home, presented as a sibling line to Relay.

**Architecture:** A self-contained registry (`config/coupeville-models.ts`) drives a MDX landing page (`/coupeville`) with a model grid, six MDX-backed model pages (`/coupeville/[slug]`), and a new empty product category. Mirrors the existing Relay MDX-loader + registry + DocPage patterns. No runtime coupling between Coupeville and Relay code.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, MDX via `next-mdx-remote/rsc` + `gray-matter`, Tailwind, Vitest + Testing Library.

## Global Constraints

- Voice: first-person singular in narrative copy ("I build…", never "we/us/our").
- Models are **state-free**: no "planned/available/built" wording, no availability badges, no per-model serial links.
- **Siblings, not derivation**: Coupeville is never described as the "built version of" a Relay voicing. Brand narrative may acknowledge the shared, designed voice lineage. The landing may link to `/relay` at the line level; model pages contain **no** links back to Relay pages.
- Voice copy is **duplicated** into Coupeville content — no runtime import from `config/relay-voicings.ts` in any Coupeville module.
- Model set = every Relay voicing **except `hammer`**: `current, lipstick, reef, velvet, arc, torch`.
- Prettier: 4-space tabs, single quotes, trailing commas (es5), `printWidth: 999`.
- Path alias `@/*` maps to project root.
- Run the full suite with `npx vitest run`; a single file with `npx vitest run <path>`.

---

## File Structure

- `types/coupeville.ts` (new) — `CoupevilleModel` interface.
- `config/coupeville-models.ts` (new) — registry array + `getCoupevilleModel`.
- `config/coupeville-models.test.ts` (new) — registry tests.
- `components/coupeville/coupeville-hero.tsx` (new) — text hero.
- `components/coupeville/coupeville-model-grid.tsx` (new) — `CoupevilleModelGrid` + `CoupevilleModelCard`.
- `components/coupeville/coupeville-model-grid.test.tsx` (new) — grid tests.
- `components/coupeville/coupeville-special-order-cta.tsx` (new) — reused special-order CTA.
- `lib/coupeville.ts` (new) — MDX loaders.
- `lib/coupeville.test.ts` (new) — loader tests.
- `content/coupeville/index.mdx` (new) — landing copy.
- `content/coupeville/models/{current,lipstick,reef,velvet,arc,torch}.mdx` (new) — model copy.
- `app/coupeville/page.tsx` (new) — landing route.
- `app/coupeville/[slug]/page.tsx` (new) — model route.
- `components/mdx-components.tsx` (modify) — register `CoupevilleHero`, `CoupevilleModelGrid`.
- `config/navigation.ts` (modify) — add Coupeville main-nav entry.
- `types/product.ts` (modify) — add `COUPEVILLE` category.
- `config/products/index.ts` (modify) — register empty Coupeville category.
- `app/products/[category]/page.tsx` (modify) — Coupeville `categoryInfo` + special-order empty state.
- `app/products/page.tsx` (modify) — Coupeville section on the index.

---

## Task 1: Coupeville model registry

**Files:**
- Create: `types/coupeville.ts`
- Create: `config/coupeville-models.ts`
- Test: `config/coupeville-models.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `interface CoupevilleModel { slug: string; name: string; tagline: string; genres: string; description: string; href: string }`
  - `const coupevilleModels: CoupevilleModel[]`
  - `function getCoupevilleModel(slug: string): CoupevilleModel | undefined`

- [ ] **Step 1: Write the failing test**

```ts
// config/coupeville-models.test.ts
import { describe, expect, it } from 'vitest';
import { coupevilleModels, getCoupevilleModel } from './coupeville-models';

describe('coupevilleModels registry', () => {
    it('contains exactly the six models (all Relay voices except hammer)', () => {
        expect(coupevilleModels.map((m) => m.slug).sort()).toEqual(['arc', 'current', 'lipstick', 'reef', 'torch', 'velvet']);
    });

    it('excludes the hammer concept', () => {
        expect(coupevilleModels.find((m) => m.slug === 'hammer')).toBeUndefined();
    });

    it('gives every model non-empty copy and a self-consistent href', () => {
        for (const model of coupevilleModels) {
            expect(model.name).toMatch(/^Coupeville /);
            expect(model.tagline.length).toBeGreaterThan(0);
            expect(model.genres.length).toBeGreaterThan(0);
            expect(model.description.length).toBeGreaterThan(0);
            expect(model.href).toBe(`/coupeville/${model.slug}`);
        }
    });

    it('carries no status/state field (models are state-free)', () => {
        for (const model of coupevilleModels) {
            expect('status' in model).toBe(false);
        }
    });

    it('resolves a model by slug', () => {
        expect(getCoupevilleModel('current')?.name).toBe('Coupeville Current');
        expect(getCoupevilleModel('nope')).toBeUndefined();
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run config/coupeville-models.test.ts`
Expected: FAIL — cannot resolve `./coupeville-models`.

- [ ] **Step 3: Create the type**

```ts
// types/coupeville.ts
export interface CoupevilleModel {
    slug: string;
    name: string;
    tagline: string;
    genres: string;
    description: string;
    href: string;
}
```

- [ ] **Step 4: Create the registry**

```ts
// config/coupeville-models.ts
import type { CoupevilleModel } from '@/types/coupeville';

// Self-contained: voice copy is duplicated here on purpose. Do NOT import from
// config/relay-voicings.ts — the Coupeville and Relay lines share a voice lineage
// but are kept decoupled in code.
export const coupevilleModels: CoupevilleModel[] = [
    {
        slug: 'current',
        name: 'Coupeville Current',
        tagline: 'Fast attack · Upper-mid focus',
        genres: 'Funk · Pop · Rock',
        description: 'A rhythm-first voice built around fast attack, controlled low end, and a focused place in the mix.',
        href: '/coupeville/current',
    },
    {
        slug: 'lipstick',
        name: 'Coupeville Lipstick',
        tagline: 'Humbucker core · Chime and air',
        genres: 'Blues · Rock · Alternative · Indie',
        description: 'A familiar humbucker foundation opened up with chime, air, and a more dimensional, percussive character.',
        href: '/coupeville/lipstick',
    },
    {
        slug: 'reef',
        name: 'Coupeville Reef',
        tagline: 'High-contrast clean and driven',
        genres: 'Indie · Surf · Alt Country · Shoegaze · Studio',
        description: 'Two voice families in one instrument: a focused humbucker voice alongside a bright, glassy voice for high-contrast clean and driven sounds.',
        href: '/coupeville/reef',
    },
    {
        slug: 'velvet',
        name: 'Coupeville Velvet',
        tagline: 'Warm center · Controlled mids',
        genres: 'Jazz · Blues · Soul · R&B',
        description: 'A warm, rounded voice with controlled mids and enough presence to carry a small room clean.',
        href: '/coupeville/velvet',
    },
    {
        slug: 'arc',
        name: 'Coupeville Arc',
        tagline: 'Open · Spatial · Separated',
        genres: 'Clean pop · Indie · Ambient · Country',
        description: 'A clear, spatial voice built for separation: wide clean sounds that keep their detail under reverb and delay.',
        href: '/coupeville/arc',
    },
    {
        slug: 'torch',
        name: 'Coupeville Torch',
        tagline: 'Punch · Vocal mids · Presence',
        genres: 'Rock · Pop · Alternative · Modern country',
        description: 'A punchy, mid-forward voice with strong presence that sits confidently at the front of a mix.',
        href: '/coupeville/torch',
    },
];

/** Resolves a Coupeville model by slug. */
export function getCoupevilleModel(slug: string): CoupevilleModel | undefined {
    return coupevilleModels.find((model) => model.slug === slug);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run config/coupeville-models.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add types/coupeville.ts config/coupeville-models.ts config/coupeville-models.test.ts
git commit -m "feat: add Coupeville model registry"
```

---

## Task 2: Landing components (hero + model grid) and MDX registration

**Files:**
- Create: `components/coupeville/coupeville-hero.tsx`
- Create: `components/coupeville/coupeville-model-grid.tsx`
- Test: `components/coupeville/coupeville-model-grid.test.tsx`
- Modify: `components/mdx-components.tsx`

**Interfaces:**
- Consumes: `coupevilleModels` from Task 1.
- Produces:
  - `function CoupevilleHero({ tagline }: { tagline: string })`
  - `function CoupevilleModelCard(props: { slug: string; name: string; tagline: string; genres: string; description: string; href?: string })`
  - `function CoupevilleModelGrid({ children }: { children?: React.ReactNode })`

- [ ] **Step 1: Write the failing test**

```tsx
// components/coupeville/coupeville-model-grid.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { CoupevilleModelGrid } from './coupeville-model-grid';
import { coupevilleModels } from '@/config/coupeville-models';

describe('CoupevilleModelGrid', () => {
    it('renders a linked card for every model in the registry', () => {
        render(<CoupevilleModelGrid />);
        for (const model of coupevilleModels) {
            const link = screen.getByRole('link', { name: new RegExp(model.name, 'i') });
            expect(link).toHaveAttribute('href', `/coupeville/${model.slug}`);
        }
    });

    it('pulls card copy from the registry', () => {
        render(<CoupevilleModelGrid />);
        for (const model of coupevilleModels) {
            expect(screen.getByText(model.description)).toBeInTheDocument();
            expect(screen.getByText(model.genres)).toBeInTheDocument();
        }
    });

    it('renders no status badges (models are state-free)', () => {
        render(<CoupevilleModelGrid />);
        expect(screen.queryByText(/^(Ready|Lab|Concept|Planned|Available)$/)).not.toBeInTheDocument();
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/coupeville/coupeville-model-grid.test.tsx`
Expected: FAIL — cannot resolve `./coupeville-model-grid`.

- [ ] **Step 3: Create the hero**

```tsx
// components/coupeville/coupeville-hero.tsx
import React from 'react';

export function CoupevilleHero({ tagline }: { tagline: string }) {
    return (
        <div className="my-8">
            <p className="max-w-2xl text-lg text-muted-foreground">{tagline}</p>
        </div>
    );
}
```

- [ ] **Step 4: Create the grid + card (no status badge)**

```tsx
// components/coupeville/coupeville-model-grid.tsx
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { coupevilleModels } from '@/config/coupeville-models';

interface CoupevilleModelCardProps {
    slug: string;
    name: string;
    tagline: string;
    genres: string;
    description: string;
    href?: string;
}

export function CoupevilleModelCard({ name, tagline, genres, description, href }: CoupevilleModelCardProps) {
    const inner = (
        <div className={cn('flex h-full flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all', href && 'group-hover:border-sky-500 group-hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]')}>
            <h3 className={cn('font-semibold text-foreground', href && 'transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400')}>{name}</h3>
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

export function CoupevilleModelGrid({ children }: { children?: React.ReactNode }) {
    const cards =
        children ??
        coupevilleModels.map((model) => <CoupevilleModelCard key={model.slug} slug={model.slug} name={model.name} tagline={model.tagline} genres={model.genres} description={model.description} href={model.href} />);

    return <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2">{cards}</div>;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run components/coupeville/coupeville-model-grid.test.tsx`
Expected: PASS.

- [ ] **Step 6: Register the components for MDX**

In `components/mdx-components.tsx`, add imports near the other Relay/doc imports (after line 48, `RelayHero`):

```tsx
import { CoupevilleHero } from '@/components/coupeville/coupeville-hero';
import { CoupevilleModelGrid, CoupevilleModelCard } from '@/components/coupeville/coupeville-model-grid';
```

Then add them to the `const components: MDXComponents = { ... }` map (near the `RelayHero,` / `RelayVoicingGrid,` entries):

```tsx
    CoupevilleHero,
    CoupevilleModelGrid,
    CoupevilleModelCard,
```

- [ ] **Step 7: Verify the app still type-checks / builds the components**

Run: `npx vitest run components/coupeville/coupeville-model-grid.test.tsx`
Expected: PASS (no regressions from the registration edit).

- [ ] **Step 8: Commit**

```bash
git add components/coupeville/coupeville-hero.tsx components/coupeville/coupeville-model-grid.tsx components/coupeville/coupeville-model-grid.test.tsx components/mdx-components.tsx
git commit -m "feat: add Coupeville hero and model grid components"
```

---

## Task 3: Coupeville MDX loader

**Files:**
- Create: `lib/coupeville.ts`
- Test: `lib/coupeville.test.ts`

**Interfaces:**
- Consumes: nothing (reads from `content/coupeville/`).
- Produces:
  - `interface CoupevillePageFrontmatter { title: string; description: string }`
  - `function loadCoupevilleLandingPage(): { content: string; frontmatter: CoupevillePageFrontmatter }`
  - `function loadCoupevilleModelPage(slug: string): { content: string; frontmatter: CoupevillePageFrontmatter }`

Note: this task's loader tests depend on the content files from Tasks 4–5. To keep this task self-contained and independently testable, the test creates a temporary fixture is **not** used; instead the loader is tested against a guaranteed-present file created in this task: `content/coupeville/index.mdx` is created here as a minimal stub and then expanded in Task 4. If executing strictly in order, Task 3 writes the stub landing file below.

- [ ] **Step 1: Write the minimal landing stub (so the loader has a real file to read)**

```mdx
---
title: 'Coupeville'
description: 'Instruments I build by hand.'
---

<CoupevilleHero tagline="Instruments I build by hand." />
```

Save as `content/coupeville/index.mdx`. (Task 4 replaces the body with full copy.)

- [ ] **Step 2: Write the failing test**

```ts
// lib/coupeville.test.ts
import { describe, expect, it } from 'vitest';
import { loadCoupevilleLandingPage, loadCoupevilleModelPage } from './coupeville';

describe('coupeville MDX loader', () => {
    it('loads the landing page frontmatter and content', () => {
        const { content, frontmatter } = loadCoupevilleLandingPage();
        expect(frontmatter.title).toBe('Coupeville');
        expect(frontmatter.description.length).toBeGreaterThan(0);
        expect(content).toContain('CoupevilleHero');
    });

    it('throws for a model page that does not exist', () => {
        expect(() => loadCoupevilleModelPage('does-not-exist')).toThrow();
    });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run lib/coupeville.test.ts`
Expected: FAIL — cannot resolve `./coupeville`.

- [ ] **Step 4: Implement the loader**

```ts
// lib/coupeville.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface CoupevillePageFrontmatter {
    title: string;
    description: string;
}

function loadMdxFile(filePath: string): { content: string; frontmatter: CoupevillePageFrontmatter } {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Coupeville page not found: ${filePath}`);
    }
    const source = fs.readFileSync(filePath, 'utf-8');
    const { content, data } = matter(source);
    if (!data.title || !data.description) {
        throw new Error(`Coupeville page at ${filePath} is missing required frontmatter fields (title, description)`);
    }
    return { content, frontmatter: data as CoupevillePageFrontmatter };
}

/** Loads the Coupeville landing page (content/coupeville/index.mdx). */
export function loadCoupevilleLandingPage(): { content: string; frontmatter: CoupevillePageFrontmatter } {
    return loadMdxFile(path.join(process.cwd(), 'content', 'coupeville', 'index.mdx'));
}

/** Loads a Coupeville model page (content/coupeville/models/<slug>.mdx). */
export function loadCoupevilleModelPage(slug: string): { content: string; frontmatter: CoupevillePageFrontmatter } {
    return loadMdxFile(path.join(process.cwd(), 'content', 'coupeville', 'models', `${slug}.mdx`));
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run lib/coupeville.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/coupeville.ts lib/coupeville.test.ts content/coupeville/index.mdx
git commit -m "feat: add Coupeville MDX loader"
```

---

## Task 4: Landing page route + content + nav entry

**Files:**
- Create: `app/coupeville/page.tsx`
- Modify: `content/coupeville/index.mdx` (replace stub body)
- Modify: `config/navigation.ts`
- Test: `config/navigation.test.ts` (create) and reuse `lib/coupeville.test.ts`

**Interfaces:**
- Consumes: `loadCoupevilleLandingPage` (Task 3), `CoupevilleHero` + `CoupevilleModelGrid` (Task 2), `MyBreadcrumbs` from `@/components/doc/doc-page`.
- Produces: the `/coupeville` route; `navConfig.mainNav` includes `{ title: 'Coupeville', href: '/coupeville' }`.

- [ ] **Step 1: Write the failing nav test**

```ts
// config/navigation.test.ts
import { describe, expect, it } from 'vitest';
import { navConfig } from './navigation';

describe('navConfig.mainNav', () => {
    it('includes a Coupeville entry pointing at /coupeville', () => {
        expect(navConfig.mainNav).toContainEqual({ title: 'Coupeville', href: '/coupeville' });
    });

    it('keeps Coupeville next to Relay Guitar', () => {
        const titles = navConfig.mainNav.map((item) => item.title);
        expect(titles.indexOf('Coupeville')).toBe(titles.indexOf('Relay Guitar') + 1);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run config/navigation.test.ts`
Expected: FAIL — no Coupeville entry.

- [ ] **Step 3: Add the nav entry**

In `config/navigation.ts`, in `mainNav`, insert immediately after the `Relay Guitar` object:

```ts
        {
            title: 'Coupeville',
            href: '/coupeville',
        },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run config/navigation.test.ts`
Expected: PASS.

- [ ] **Step 5: Replace the landing content**

Overwrite `content/coupeville/index.mdx` with:

```mdx
---
title: 'Coupeville'
description: 'The instruments I build by hand — a sibling to the free, self-print Relay Guitar platform.'
---

<CoupevilleHero tagline="Coupeville is the line of instruments I build by hand — the same voices I designed for the platform, made one at a time." />

## The Coupeville line

Coupeville is the name I give to the instruments I build myself. The line takes its name from the small-town community that inspired it, and each instrument carries that community's spirit along with my own workmanship. Where the platform's voices usually reach players as models to print and wire themselves, a Coupeville is the version I complete by hand and put in your hands finished.

## Coupeville and Relay

Coupeville and [Relay](/relay) are siblings. They share a parentage: the same family of voices I designed. Relay is the free, self-print platform — you download the models, print the body, and build the guitar yourself. Coupeville is the built line — I make the instrument for you. Two ways to arrive at the same voices, not one derived from the other. The control schemes differ between the lines, but the voice each model is built around does not.

## The models

Each model is a distinct voice in the line. Pick the one that fits how you play.

<CoupevilleModelGrid />

## Own a Coupeville

When an instrument is ready for a new owner, it's listed under [Coupeville instruments](/products/coupeville). If nothing is listed there right now, or you want a specific voice built for you, reach out and I'll build one to order.

## Community

<RelayDiscordCta message="Ask about the Coupeville line, follow builds in progress, and talk voices with other players." />
```

- [ ] **Step 6: Create the landing route**

```tsx
// app/coupeville/page.tsx
import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage, MyBreadcrumbs } from '@/components/doc/doc-page';
import { loadCoupevilleLandingPage } from '@/lib/coupeville';

export async function generateMetadata() {
    try {
        const { frontmatter } = loadCoupevilleLandingPage();
        return {
            title: `${frontmatter.title} | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}

export default async function CoupevillePage() {
    const { content, frontmatter } = loadCoupevilleLandingPage();
    const breadcrumbs = [{ label: 'Coupeville' }];
    return (
        <DocPage title={frontmatter.title} breadcrumbs={<MyBreadcrumbs items={breadcrumbs} />}>
            <MDXRemote source={content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </DocPage>
    );
}
```

- [ ] **Step 7: Verify content loads and build compiles the route**

Run: `npx vitest run lib/coupeville.test.ts config/navigation.test.ts`
Expected: PASS (loader still reads the expanded landing file; nav entry present).

- [ ] **Step 8: Commit**

```bash
git add app/coupeville/page.tsx content/coupeville/index.mdx config/navigation.ts config/navigation.test.ts
git commit -m "feat: add Coupeville landing page and nav entry"
```

---

## Task 5: Model pages route + content

**Files:**
- Create: `app/coupeville/[slug]/page.tsx`
- Create: `content/coupeville/models/current.mdx`
- Create: `content/coupeville/models/lipstick.mdx`
- Create: `content/coupeville/models/reef.mdx`
- Create: `content/coupeville/models/velvet.mdx`
- Create: `content/coupeville/models/arc.mdx`
- Create: `content/coupeville/models/torch.mdx`
- Test: extend `lib/coupeville.test.ts`

**Interfaces:**
- Consumes: `coupevilleModels`, `getCoupevilleModel` (Task 1); `loadCoupevilleModelPage` (Task 3); `DocPage`, `MyBreadcrumbs`; `components` map.
- Produces: the `/coupeville/[slug]` route with `export function generateStaticParams()` returning `{ slug }[]` for all six models and `export const dynamicParams = false`.

- [ ] **Step 1: Write the failing test (every model file loads with required frontmatter)**

Add to `lib/coupeville.test.ts`:

```ts
import { coupevilleModels } from '@/config/coupeville-models';

describe('coupeville model pages', () => {
    it('loads a page for every model in the registry', () => {
        for (const model of coupevilleModels) {
            const { frontmatter, content } = loadCoupevilleModelPage(model.slug);
            expect(frontmatter.title).toBe(model.name);
            expect(frontmatter.description.length).toBeGreaterThan(0);
            expect(content.trim().length).toBeGreaterThan(0);
        }
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/coupeville.test.ts`
Expected: FAIL — model MDX files do not exist yet.

- [ ] **Step 3: Create the six model content files**

`content/coupeville/models/current.mdx`:

```mdx
---
title: 'Coupeville Current'
description: 'A rhythm-first Coupeville voice: fast attack, controlled low end, and a focused place in the mix.'
---

Current is built around clear attack, controlled low end, and a focused place in the mix. Rather than chasing a big, wide sound, it develops a set of dependable humbucker voices and gives you fine control over how much focus and harmonic texture each part needs.

The bridge gives the firmest attack and the strongest rhythmic focus; the neck offers a rounder, more open foundation; together they form the broadest of the primary voices. It's a voice for funk, pop, and tight rhythm playing — parts where timing, attack, and mix position matter more than warmth or sustain.

This is the voice behind the first instrument I built in the line, CVL26001.
```

`content/coupeville/models/lipstick.mdx`:

```mdx
---
title: 'Coupeville Lipstick'
description: 'A familiar humbucker foundation opened up with chime, air, and a more dimensional character.'
---

Lipstick keeps a familiar humbucker foundation and opens it up. On top of two complementary humbucker voices sits a brighter layer that adds chime, air, and a more dimensional, percussive character — especially rewarding for clean arpeggios, layered rhythm parts, and touch-sensitive edge-of-breakup sounds.

It stays simple when a song wants simple, and becomes surprisingly expansive when a song asks for another color. It's a natural fit for blues, rock, alternative, and indie.
```

`content/coupeville/models/reef.mdx`:

```mdx
---
title: 'Coupeville Reef'
description: 'Two voice families in one instrument for high-contrast clean and driven sounds.'
---

Reef holds two voice families in one instrument: a focused, driven voice and a bright, glassy, dimensional voice. The contrast between them is the point — you can move from a tight, forward sound to a wide, shimmering clean without changing guitars.

That range makes it at home in indie, surf, alt-country, shoegaze, and studio work, where a single instrument often needs to cover very different textures in one session.
```

`content/coupeville/models/velvet.mdx`:

```mdx
---
title: 'Coupeville Velvet'
description: 'A warm, rounded voice with controlled mids and presence to carry a room clean.'
---

Velvet is a warm, rounded voice for players who put the guitar at the center of a small room. It has controlled mids, a smooth attack, and enough presence to carry an act clean, without the top-end edge that would fight a vocal.

It's built for jazz, blues, soul, and R&B — music where a clear, warm, expressive clean tone does most of the work.
```

`content/coupeville/models/arc.mdx`:

```mdx
---
title: 'Coupeville Arc'
description: 'A clear, spatial voice built for separation under reverb and delay.'
---

Arc is about clarity and separation. It produces wide, open clean sounds that keep their detail even under heavy reverb, delay, and modulation — notes stay distinct instead of blurring together as the effects build.

That makes it a strong choice for clean pop, indie, ambient, and country, where space and note separation carry the part.
```

`content/coupeville/models/torch.mdx`:

```mdx
---
title: 'Coupeville Torch'
description: 'A punchy, mid-forward voice with strong presence at the front of a mix.'
---

Torch is punchy and mid-forward. It has stronger mids, more attack, and a forward position in the mix, so the guitar sits confidently at the front of a band without needing to be loud.

It's voiced for rock, pop, alternative, and modern country — parts that need presence and punch to cut through.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/coupeville.test.ts`
Expected: PASS.

- [ ] **Step 5: Create the model route**

```tsx
// app/coupeville/[slug]/page.tsx
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage, MyBreadcrumbs } from '@/components/doc/doc-page';
import { coupevilleModels, getCoupevilleModel } from '@/config/coupeville-models';
import { loadCoupevilleModelPage, type CoupevillePageFrontmatter } from '@/lib/coupeville';

type Props = { params: Promise<{ slug: string }> };

// Only registry models are routable.
export const dynamicParams = false;

export function generateStaticParams() {
    return coupevilleModels.map((model) => ({ slug: model.slug }));
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    try {
        const { frontmatter } = loadCoupevilleModelPage(slug);
        return {
            title: `${frontmatter.title} | Coupeville | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}

export default async function CoupevilleModelPage({ params }: Props) {
    const { slug } = await params;
    const model = getCoupevilleModel(slug);
    if (!model) notFound();

    let content: string;
    let frontmatter: CoupevillePageFrontmatter;
    try {
        ({ content, frontmatter } = loadCoupevilleModelPage(slug));
    } catch {
        notFound();
    }

    const breadcrumbs = [{ label: 'Coupeville', href: '/coupeville' }, { label: model!.name }];
    return (
        <DocPage title={frontmatter!.title} breadcrumbs={<MyBreadcrumbs items={breadcrumbs} />}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{model!.tagline}</p>
            <p className="mt-1 text-sm text-muted-foreground/70">{model!.genres}</p>
            <div className="mt-6">
                <MDXRemote source={content!} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
            </div>
            <aside className="mt-8 rounded-xl border border-sky-200 bg-sky-50/60 p-5 dark:border-sky-900/70 dark:bg-sky-950/20">
                <p className="font-semibold text-foreground">Own a Coupeville {model!.name.replace('Coupeville ', '')}</p>
                <p className="mt-1 text-sm text-muted-foreground">Instruments are listed as they're ready — and I build to order.</p>
                <Link href="/products/coupeville" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sky-700 underline-offset-4 hover:underline dark:text-sky-300">
                    See Coupeville instruments
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
            </aside>
        </DocPage>
    );
}
```

- [ ] **Step 6: Commit**

```bash
git add app/coupeville/\[slug\]/page.tsx content/coupeville/models lib/coupeville.test.ts
git commit -m "feat: add Coupeville model pages"
```

---

## Task 6: Products category `/products/coupeville`

**Files:**
- Modify: `types/product.ts`
- Modify: `config/products/index.ts`
- Create: `components/coupeville/coupeville-special-order-cta.tsx`
- Modify: `app/products/[category]/page.tsx`
- Modify: `app/products/page.tsx`
- Test: `config/products/coupeville.test.ts` (create)

**Interfaces:**
- Consumes: `ProductCategory` enum, `getProductsByCategory`, `siteConfig.links.discord`.
- Produces: `ProductCategory.COUPEVILLE = 'coupeville'`; `getProductsByCategory(ProductCategory.COUPEVILLE)` returns `[]`; `function CoupevilleSpecialOrderCta({ className }: { className?: string })`.

- [ ] **Step 1: Write the failing test**

```ts
// config/products/coupeville.test.ts
import { describe, expect, it } from 'vitest';
import { ProductCategory } from '@/types/product';
import { getProductsByCategory, productsByCategory } from '@/config/products';

describe('Coupeville product category', () => {
    it('is a registered product category', () => {
        expect(ProductCategory.COUPEVILLE).toBe('coupeville');
        expect(Object.values(ProductCategory)).toContain('coupeville');
    });

    it('is wired but currently empty', () => {
        expect(getProductsByCategory(ProductCategory.COUPEVILLE)).toEqual([]);
        expect(productsByCategory[ProductCategory.COUPEVILLE]).toEqual([]);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run config/products/coupeville.test.ts`
Expected: FAIL — `ProductCategory.COUPEVILLE` is undefined.

- [ ] **Step 3: Add the enum value**

In `types/product.ts`, extend the enum:

```ts
export enum ProductCategory {
    GUITARS = 'guitars',
    HAM_RADIO_KITS = 'ham-radio-kits',
    COUPEVILLE = 'coupeville',
}
```

- [ ] **Step 4: Register the empty category**

In `config/products/index.ts`, add `COUPEVILLE` to both maps:

```ts
export const productsByCategory: Record<ProductCategory, Product[]> = {
    [ProductCategory.GUITARS]: guitars,
    [ProductCategory.HAM_RADIO_KITS]: hamRadioKits,
    [ProductCategory.COUPEVILLE]: [],
};
```

```ts
const configsByCategory: Record<ProductCategory, (Product | Guitar | ProductConfig)[]> = {
    [ProductCategory.GUITARS]: guitarConfigs,
    [ProductCategory.HAM_RADIO_KITS]: hamRadioKitConfigs,
    [ProductCategory.COUPEVILLE]: [],
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run config/products/coupeville.test.ts`
Expected: PASS.

- [ ] **Step 6: Create the special-order CTA component**

```tsx
// components/coupeville/coupeville-special-order-cta.tsx
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';

export function CoupevilleSpecialOrderCta({ className }: { className?: string }) {
    return (
        <div className={cn('rounded-xl border border-border bg-card p-8 text-center', className)}>
            <p className="text-lg font-semibold text-foreground">Built to order</p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">There aren't any Coupeville instruments listed right now. Each one is built by hand — reach out and I'll build the voice you want to order.</p>
            <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/contact" className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700">
                    Reach out about a build
                </Link>
                <Link href={siteConfig.links.discord} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
                    Ask in Discord
                </Link>
            </div>
        </div>
    );
}
```

- [ ] **Step 7: Add Coupeville to the category page (info + special-order empty state)**

In `app/products/[category]/page.tsx`:

Add the import near the top:

```tsx
import { CoupevilleSpecialOrderCta } from '@/components/coupeville/coupeville-special-order-cta';
```

Add a `categoryInfo` entry for `[ProductCategory.COUPEVILLE]` (place after the `HAM_RADIO_KITS` entry):

```tsx
    [ProductCategory.COUPEVILLE]: {
        title: 'Coupeville',
        icon: Guitar,
        description: 'Instruments I build by hand, one at a time',
        gradientFrom: 'from-emerald-100/50',
        gradientTo: 'to-sky-100/50',
        blurFrom: 'bg-emerald-400/20',
        blurTo: 'bg-sky-400/20',
        iconGradientFrom: 'from-emerald-500',
        iconGradientTo: 'to-sky-600',
        darkGradientFrom: 'dark:from-emerald-900/10',
        darkGradientTo: 'dark:to-sky-900/10',
        darkBlurFrom: 'dark:bg-emerald-500/10',
        darkBlurTo: 'dark:bg-sky-500/10',
    },
```

Replace the empty-state block so Coupeville shows the special-order CTA. Change:

```tsx
                ) : (
                    <div className="rounded-lg border border-border bg-card p-8 text-center">
                        <p className="text-muted-foreground">No products available in this category yet.</p>
                    </div>
                )}
```

to:

```tsx
                ) : categoryEnum === ProductCategory.COUPEVILLE ? (
                    <CoupevilleSpecialOrderCta />
                ) : (
                    <div className="rounded-lg border border-border bg-card p-8 text-center">
                        <p className="text-muted-foreground">No products available in this category yet.</p>
                    </div>
                )}
```

- [ ] **Step 8: Add a Coupeville section to the products index**

In `app/products/page.tsx`, add the import:

```tsx
import Link from 'next/link';
```

Render a discoverable Coupeville entry below the existing grid (inside the outer `div className="space-y-4"`, after the category grid `</div>`):

```tsx
                <div className="pt-4">
                    <div className="flex items-baseline gap-3 mb-3">
                        <Link href="/products/coupeville" className="hover:opacity-80 transition-opacity">
                            <h2 className={cn('scroll-m-20 text-xl pb-2 font-bold tracking-tight')}>Coupeville</h2>
                        </Link>
                    </div>
                    <p className="text-sm text-muted-foreground">Instruments I build by hand. <Link href="/products/coupeville" className="font-medium text-sky-700 underline-offset-4 hover:underline dark:text-sky-300">See the Coupeville line and how to order →</Link></p>
                </div>
```

(`cn` is already imported in this file.)

- [ ] **Step 9: Run the category tests and full suite**

Run: `npx vitest run config/products/coupeville.test.ts`
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add types/product.ts config/products/index.ts config/products/coupeville.test.ts components/coupeville/coupeville-special-order-cta.tsx app/products/\[category\]/page.tsx app/products/page.tsx
git commit -m "feat: wire empty Coupeville product category with special-order CTA"
```

---

## Task 7: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the whole test suite**

Run: `npx vitest run`
Expected: all tests PASS (including the new Coupeville suites).

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: compiles; `/coupeville`, `/coupeville/[slug]` (6 static params), and `/products/coupeville` appear as built routes; sitemap generation succeeds.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no new errors.

- [ ] **Step 4: Commit any formatting fixes (if lint/prettier changed files)**

```bash
git add -A
git commit -m "chore: lint/format Coupeville line"
```

---

## Self-Review

**Spec coverage:**
- Registry (`config/coupeville-models.ts`, self-contained, no status) → Task 1. ✓
- Landing `/coupeville`, MDX-driven, hero + sibling explainer + **grid** + own-one + community → Tasks 2, 4. ✓
- Model pages `/coupeville/[slug]` for the six models, uniform, state-free, no Relay cross-links, own-one CTA → Tasks 3, 5. ✓
- `/products/coupeville` wired-but-empty with special-order CTA + on the `/products` index → Task 6. ✓
- Main-nav entry → Task 4. ✓
- Sibling framing / duplicated voice copy / no runtime coupling → enforced in Task 1 comment + copy in Tasks 4–5. ✓
- Verification (vitest + build) → Task 7. ✓

**Placeholder scan:** No TBD/TODO; all code and copy are concrete.

**Type consistency:** `CoupevilleModel` fields (`slug/name/tagline/genres/description/href`) are used identically in Tasks 1, 2, 5. Loader returns `{ content, frontmatter: CoupevillePageFrontmatter }` in Tasks 3–5. `ProductCategory.COUPEVILLE` used consistently in Task 6. `MyBreadcrumbs`/`DocPage` imports match `components/doc/doc-page.tsx`.

**Notes:**
- The `RelayDiscordCta` component is reused on the Coupeville landing for the community section (already registered in `components/mdx-components.tsx`); it renders generic "Join the community" copy with a custom message, so no Relay-specific wording leaks.
