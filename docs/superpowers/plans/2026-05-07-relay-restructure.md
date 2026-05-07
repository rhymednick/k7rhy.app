# Relay `/relay` Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the `/relay` homepage to the five-section layout from the design doc, add a status-aware **Build process overview** (Body / Voicings / Assembly), create the thin `/relay/voicings` gallery page, and update the sidebar to render the Build process tree. PR 2 of 3 from `docs/superpowers/specs/2026-05-07-relay-platform-revision-design.md`.

**Architecture:** A single `relayBuildProcess` config object describes the three stages with their status (Live / In progress / Planned), target URL (page route or Discord channel), and optional sub-items. Both the homepage `RelayProcessOverview` component **and** the sidebar consume that config — so flipping Body from In progress → Live in PR #3 will be a one-line config edit. The Voicings card stays Live in this PR; Body and Assembly are non-Live and link to a shared Discord invite (channel-specific deeplinks come later, when Discord-side configuration is done).

**Tech Stack:** Next.js 15 App Router, TypeScript strict, React 19, Vitest, React Testing Library, Tailwind, MDX via `next-mdx-remote/rsc`.

---

## Pre-flight

The branch `docs/relay-restructure` is already created off `main` (which has PR #1's rename merged in). All tests pass on main as of commit `1414bbb`. The branch starts clean.

**Resolved scope decisions:**
- `/relay/voicings` (gallery list page) is created in this PR. The spec says "no new content pages" for PR #2 but the validation step requires the Voicings card to go to `/relay/voicings`. Treating "no new content pages" as "no new long-form Body/Assembly guides" — a thin gallery list is in scope.
- Discord URL: reuse the existing server invite (`https://discord.gg/BuUxCG4W6w`) for all non-Live stages. The config supports a per-stage `channelHref` override so channel deeplinks can be swapped in later via config without touching components.
- Hero CTAs and "what it is / costs / gets" cards are written as MDX prose with a small `RelayHero` and `RelayCosts` component for consistent styling. Both stay simple — no React Server Component complexity.
- `RelayProcessOverview` and `RelayProcessCard` are co-located in one file. They're tightly coupled (the Overview only ever renders three Cards) and splitting them just creates two test files for the same surface area.

Commands referenced throughout:
- Run all tests: `npx vitest run`
- Run a single test file: `npx vitest run path/to/file.test.ts`
- Lint: `npm run lint`
- Build (runs tests first): `npm run build`

The full test suite must pass at the end of every commit. Aim for one logical commit per task (8 commits total before the PR commit).

---

### Task 1: Verify baseline

**Files:** none modified.

- [ ] **Step 1: Confirm working tree and branch**

  Run: `git status && git branch --show-current`

  Expected: `nothing to commit, working tree clean`, `docs/relay-restructure`.

- [ ] **Step 2: Confirm tests pass on main's state**

  Run: `npx vitest run`

  Expected: all tests pass. If any fail, stop and investigate before starting.

- [ ] **Step 3: Confirm lint is clean**

  Run: `npm run lint`

  Expected: no warnings or errors.

---

### Task 2: Add Build process types

**Files:**
- Modify: `types/relay-nav.ts`

The existing file declares `RelayPlatformNav` (with empty sections today). We extend the type system with a `RelayBuildStage` shape that carries status, target URL, and an explicit `linkType` so consumers (homepage card vs sidebar) can render Discord-vs-page differently without inferring from the URL.

- [ ] **Step 1: Append the new types to `types/relay-nav.ts`**

  Replace the file content with:

  ```typescript
  import type { RelayVoicingStatus } from '@/types/relay-voicing';

  export interface RelayNavItem {
      title: string;
      slug: string;
  }

  export interface RelayNavSection {
      title: string;
      slug?: string;
      items?: RelayNavItem[];
  }

  export interface RelayVoicingNav {
      title: string;
      status: RelayVoicingStatus;
      sections: RelayNavSection[];
  }

  export interface RelayNav {
      [voicingSlug: string]: RelayVoicingNav;
  }

  /** Platform-level nav — sections shared across all voicings. */
  export interface RelayPlatformNav {
      sections: RelayNavSection[];
  }

  /** Build process status: drives the badge + whether the link goes to a page or Discord. */
  export type RelayStageStatus = 'live' | 'in-progress' | 'planned';

  /** A child link under a build stage in the sidebar (e.g. "Parts", a voicing slug). */
  export interface RelayStageItem {
      title: string;
      href: string;
      /** When true, the link is a Discord channel rather than an in-site route. */
      isDiscord?: boolean;
  }

  /** One stage of the build process: Body / Voicings / Assembly. */
  export interface RelayBuildStage {
      slug: 'body' | 'voicings' | 'assembly';
      title: string;
      number: 1 | 2 | 3;
      status: RelayStageStatus;
      summary: string;
      /** Where the card and the sidebar entry link to. Page route for Live stages, Discord URL for non-Live. */
      href: string;
      /** True when `href` points to Discord; false/undefined for in-site routes. */
      isDiscord?: boolean;
      /** Sub-items under this stage in the sidebar nav. Empty for stages with no sub-pages yet. */
      items?: RelayStageItem[];
  }

  export interface RelayBuildProcess {
      stages: RelayBuildStage[];
  }
  ```

- [ ] **Step 2: TypeScript check**

  Run: `npx tsc --noEmit`

  Expected: no errors. The types are additive — nothing depends on them yet.

- [ ] **Step 3: Commit**

  ```bash
  git add types/relay-nav.ts
  git commit -m "feat(relay): add RelayBuildProcess types for /relay restructure"
  ```

---

### Task 3: Add `relayBuildProcess` config (TDD)

**Files:**
- Create: `config/relay-build-process.ts`
- Create: `__tests__/config/relay-build-process.test.ts`

The config is the single source of truth for stage status and links. Both the homepage component and the sidebar import from it.

- [ ] **Step 1: Write the failing test**

  Create `__tests__/config/relay-build-process.test.ts`:

  ```typescript
  import { describe, it, expect } from 'vitest';
  import { relayBuildProcess } from '@/config/relay-build-process';

  describe('relayBuildProcess config', () => {
      it('contains exactly three stages: body, voicings, assembly', () => {
          expect(relayBuildProcess.stages).toHaveLength(3);
          const slugs = relayBuildProcess.stages.map((s) => s.slug);
          expect(slugs).toEqual(['body', 'voicings', 'assembly']);
      });

      it('numbers stages 1, 2, 3 in order', () => {
          const numbers = relayBuildProcess.stages.map((s) => s.number);
          expect(numbers).toEqual([1, 2, 3]);
      });

      it('marks Voicings as live, Body as in-progress, Assembly as planned at PR #2 ship time', () => {
          const byslug = Object.fromEntries(relayBuildProcess.stages.map((s) => [s.slug, s.status]));
          expect(byslug).toEqual({
              body: 'in-progress',
              voicings: 'live',
              assembly: 'planned',
          });
      });

      it('routes Live stages to in-site routes and non-Live stages to Discord', () => {
          for (const stage of relayBuildProcess.stages) {
              if (stage.status === 'live') {
                  expect(stage.isDiscord ?? false).toBe(false);
                  expect(stage.href).toMatch(/^\/relay\//);
              } else {
                  expect(stage.isDiscord).toBe(true);
                  expect(stage.href).toMatch(/^https:\/\/discord\./);
              }
          }
      });

      it('exposes the seven voicing slugs as items under the Voicings stage', () => {
          const voicings = relayBuildProcess.stages.find((s) => s.slug === 'voicings');
          expect(voicings).toBeDefined();
          const itemTitles = voicings!.items?.map((i) => i.title) ?? [];
          expect(itemTitles).toEqual(['Lipstick', 'Reef', 'Velvet', 'Arc', 'Torch', 'Current', 'Hammer']);
      });

      it('every stage has a non-empty summary', () => {
          for (const stage of relayBuildProcess.stages) {
              expect(stage.summary.length).toBeGreaterThan(10);
          }
      });
  });
  ```

- [ ] **Step 2: Run the test and verify it fails**

  Run: `npx vitest run __tests__/config/relay-build-process.test.ts`

  Expected: FAIL — `Cannot find module '@/config/relay-build-process'`.

- [ ] **Step 3: Write the config**

  Create `config/relay-build-process.ts`:

  ```typescript
  import type { RelayBuildProcess } from '@/types/relay-nav';

  /**
   * Build process stages used by both the homepage RelayProcessOverview and the sidebar nav.
   * Flipping a stage's status here updates both surfaces. Discord links use the server
   * invite for now; channel-specific deeplinks can be swapped in via this file when
   * Discord-side configuration is done.
   */
  const DISCORD_INVITE = 'https://discord.gg/BuUxCG4W6w';

  export const relayBuildProcess: RelayBuildProcess = {
      stages: [
          {
              slug: 'body',
              title: 'Body',
              number: 1,
              status: 'in-progress',
              summary: 'Print, bond, cure, and finish the shared double-cut body. Same body for every voicing.',
              href: DISCORD_INVITE,
              isDiscord: true,
          },
          {
              slug: 'voicings',
              title: 'Voicings',
              number: 2,
              status: 'live',
              summary: 'Choose how the guitar sounds. Seven voicings with their own pickup map, controls, and parts list.',
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
              slug: 'assembly',
              title: 'Assembly',
              number: 3,
              status: 'planned',
              summary: 'Final assembly and setup. Hardware install, wiring, intonation, action.',
              href: DISCORD_INVITE,
              isDiscord: true,
          },
      ],
  };
  ```

- [ ] **Step 4: Run the test and verify it passes**

  Run: `npx vitest run __tests__/config/relay-build-process.test.ts`

  Expected: PASS — all six test cases.

- [ ] **Step 5: Commit**

  ```bash
  git add config/relay-build-process.ts __tests__/config/relay-build-process.test.ts
  git commit -m "feat(relay): add relayBuildProcess config for /relay restructure"
  ```

---

### Task 4: Build `RelayProcessOverview` component (TDD)

**Files:**
- Create: `components/relay/relay-process-overview.tsx`
- Create: `components/relay/relay-process-overview.test.tsx`

This component renders the three status-aware cards on the homepage. Card style mirrors `RelayVoicingCard`: rounded border, hover-lift on linked cards. Status badges follow the same color language as `RelayVoicingStatusBadge`: emerald=Live, amber=In progress, slate=Planned.

- [ ] **Step 1: Write the failing test**

  Create `components/relay/relay-process-overview.test.tsx`:

  ```tsx
  import React from 'react';
  import { render, screen } from '@testing-library/react';
  import { describe, expect, it } from 'vitest';
  import '@testing-library/jest-dom/vitest';
  import { RelayProcessOverview } from './relay-process-overview';

  describe('RelayProcessOverview', () => {
      it('renders three numbered cards in stage order: Body, Voicings, Assembly', () => {
          render(<RelayProcessOverview />);

          expect(screen.getByRole('heading', { name: /body/i })).toBeInTheDocument();
          expect(screen.getByRole('heading', { name: /voicings/i })).toBeInTheDocument();
          expect(screen.getByRole('heading', { name: /assembly/i })).toBeInTheDocument();

          // Numbered "1.", "2.", "3." appear in document
          expect(screen.getByText('1')).toBeInTheDocument();
          expect(screen.getByText('2')).toBeInTheDocument();
          expect(screen.getByText('3')).toBeInTheDocument();
      });

      it('renders the correct status badge for each stage', () => {
          render(<RelayProcessOverview />);

          expect(screen.getByText('Live')).toBeInTheDocument();
          expect(screen.getByText('In progress')).toBeInTheDocument();
          expect(screen.getByText('Planned')).toBeInTheDocument();
      });

      it('links Voicings to /relay/voicings (in-site route)', () => {
          render(<RelayProcessOverview />);
          const voicingsLink = screen.getByRole('link', { name: /voicings/i });
          expect(voicingsLink).toHaveAttribute('href', '/relay/voicings');
      });

      it('links Body and Assembly to Discord (external)', () => {
          render(<RelayProcessOverview />);
          const bodyLink = screen.getByRole('link', { name: /body/i });
          const assemblyLink = screen.getByRole('link', { name: /assembly/i });

          expect(bodyLink.getAttribute('href')).toMatch(/^https:\/\/discord\./);
          expect(assemblyLink.getAttribute('href')).toMatch(/^https:\/\/discord\./);
          expect(bodyLink).toHaveAttribute('target', '_blank');
          expect(assemblyLink).toHaveAttribute('target', '_blank');
      });
  });
  ```

- [ ] **Step 2: Run the test and verify it fails**

  Run: `npx vitest run components/relay/relay-process-overview.test.tsx`

  Expected: FAIL — `Cannot find module './relay-process-overview'`.

- [ ] **Step 3: Implement the component**

  Create `components/relay/relay-process-overview.tsx`:

  ```tsx
  import React from 'react';
  import Link from 'next/link';
  import { cn } from '@/lib/utils';
  import { relayBuildProcess } from '@/config/relay-build-process';
  import type { RelayBuildStage, RelayStageStatus } from '@/types/relay-nav';

  function StageStatusBadge({ status }: { status: RelayStageStatus }) {
      if (status === 'live') {
          return <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">Live</span>;
      }
      if (status === 'in-progress') {
          return <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">In progress</span>;
      }
      return <span className="shrink-0 rounded-full border border-slate-500/30 bg-slate-500/10 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">Planned</span>;
  }

  function RelayProcessCard({ stage }: { stage: RelayBuildStage }) {
      const linkProps = stage.isDiscord
          ? { target: '_blank', rel: 'noopener noreferrer' as const }
          : {};

      const ctaLabel = stage.status === 'live'
          ? `Open ${stage.title.toLowerCase()} guide →`
          : stage.status === 'in-progress'
              ? 'Follow on Discord →'
              : 'Discuss on Discord →';

      return (
          <Link
              href={stage.href}
              {...linkProps}
              className="group block h-full"
          >
              <div className={cn(
                  'flex h-full flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all',
                  'group-hover:border-sky-500 group-hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]',
              )}>
                  <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted text-sm font-semibold text-muted-foreground">{stage.number}</span>
                          <h3 className="font-semibold text-foreground transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400">{stage.title}</h3>
                      </div>
                      <StageStatusBadge status={stage.status} />
                  </div>
                  <p className="flex-1 text-sm text-muted-foreground">{stage.summary}</p>
                  <p className="text-xs font-medium text-sky-600 dark:text-sky-400">{ctaLabel}</p>
              </div>
          </Link>
      );
  }

  export function RelayProcessOverview() {
      return (
          <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {relayBuildProcess.stages.map((stage) => (
                  <RelayProcessCard key={stage.slug} stage={stage} />
              ))}
          </div>
      );
  }
  ```

- [ ] **Step 4: Run the test and verify it passes**

  Run: `npx vitest run components/relay/relay-process-overview.test.tsx`

  Expected: PASS — all four test cases.

- [ ] **Step 5: Commit**

  ```bash
  git add components/relay/relay-process-overview.tsx components/relay/relay-process-overview.test.tsx
  git commit -m "feat(relay): add RelayProcessOverview component"
  ```

---

### Task 5: Build `RelayHero` and `RelayCosts` components

**Files:**
- Create: `components/relay/relay-hero.tsx`
- Create: `components/relay/relay-hero.test.tsx`
- Create: `components/relay/relay-costs.tsx`

These are presentational components used in the homepage MDX. `RelayHero` renders the title + tagline + CTA pair. `RelayCosts` renders the three "what it is / costs / gets" cards. Both keep the MDX clean — the alternative is hand-styled markdown which bloats `index.mdx`.

`RelayCosts` is intentionally untested at the component level; its only job is rendering static markup from props, which the MDX integration already exercises. `RelayHero` is tested because the CTA logic and external/internal link distinction is a place where regressions could land silently.

- [ ] **Step 1: Write the `RelayHero` failing test**

  Create `components/relay/relay-hero.test.tsx`:

  ```tsx
  import React from 'react';
  import { render, screen } from '@testing-library/react';
  import { describe, expect, it } from 'vitest';
  import '@testing-library/jest-dom/vitest';
  import { RelayHero } from './relay-hero';

  describe('RelayHero', () => {
      it('renders the title and tagline', () => {
          render(<RelayHero title="Test Title" tagline="A test tagline." />);
          expect(screen.getByRole('heading', { level: 1, name: 'Test Title' })).toBeInTheDocument();
          expect(screen.getByText('A test tagline.')).toBeInTheDocument();
      });

      it('renders the primary "Choose your voicing" CTA pointing to /relay/voicings', () => {
          render(<RelayHero title="x" tagline="y" />);
          const primary = screen.getByRole('link', { name: /choose your voicing/i });
          expect(primary).toHaveAttribute('href', '/relay/voicings');
      });

      it('renders the secondary "Download body files" CTA linking to the body Discord stage when body is non-Live', () => {
          render(<RelayHero title="x" tagline="y" />);
          const secondary = screen.getByRole('link', { name: /download body files/i });
          // At PR #2 ship time, body stage is in-progress (Discord). The CTA defers to that target.
          expect(secondary.getAttribute('href')).toMatch(/^https:\/\/discord\./);
      });

      it('renders the micro-copy under the buttons', () => {
          render(<RelayHero title="x" tagline="y" />);
          expect(screen.getByText(/pick first, order parts/i)).toBeInTheDocument();
      });
  });
  ```

- [ ] **Step 2: Run the test and verify it fails**

  Run: `npx vitest run components/relay/relay-hero.test.tsx`

  Expected: FAIL — `Cannot find module './relay-hero'`.

- [ ] **Step 3: Implement `RelayHero`**

  Create `components/relay/relay-hero.tsx`:

  ```tsx
  import React from 'react';
  import Link from 'next/link';
  import { cn } from '@/lib/utils';
  import { relayBuildProcess } from '@/config/relay-build-process';

  interface RelayHeroProps {
      title: string;
      tagline: string;
  }

  export function RelayHero({ title, tagline }: RelayHeroProps) {
      const bodyStage = relayBuildProcess.stages.find((s) => s.slug === 'body');
      const bodyHref = bodyStage?.href ?? '/relay';
      const bodyIsExternal = bodyStage?.isDiscord ?? false;

      return (
          <div className="my-8">
              <h1 className="font-heading scroll-m-20 text-4xl font-bold tracking-tight">{title}</h1>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{tagline}</p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                      href="/relay/voicings"
                      className={cn(
                          'inline-flex items-center justify-center rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors',
                          'hover:bg-sky-700',
                      )}
                  >
                      Choose your voicing →
                  </Link>
                  <Link
                      href={bodyHref}
                      {...(bodyIsExternal ? { target: '_blank', rel: 'noopener noreferrer' as const } : {})}
                      className={cn(
                          'inline-flex items-center justify-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors',
                          'hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400',
                      )}
                  >
                      ↓ Download body files
                  </Link>
              </div>

              <p className="mt-3 text-xs italic text-muted-foreground">
                  Pick first, order parts, then start printing — they'll ship while the body prints.
              </p>
          </div>
      );
  }
  ```

- [ ] **Step 4: Run the test and verify it passes**

  Run: `npx vitest run components/relay/relay-hero.test.tsx`

  Expected: PASS — all four test cases.

- [ ] **Step 5: Implement `RelayCosts`**

  Create `components/relay/relay-costs.tsx`:

  ```tsx
  import React from 'react';

  interface CostItem {
      title: string;
      body: string;
  }

  interface RelayCostsProps {
      items: CostItem[];
  }

  export function RelayCosts({ items }: RelayCostsProps) {
      return (
          <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {items.map((item) => (
                  <div key={item.title} className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
                  </div>
              ))}
          </div>
      );
  }
  ```

- [ ] **Step 6: Confirm both files compile**

  Run: `npx tsc --noEmit`

  Expected: no errors.

- [ ] **Step 7: Commit**

  ```bash
  git add components/relay/relay-hero.tsx components/relay/relay-hero.test.tsx components/relay/relay-costs.tsx
  git commit -m "feat(relay): add RelayHero and RelayCosts homepage components"
  ```

---

### Task 6: Register new components in `mdx-components.tsx`

**Files:**
- Modify: `components/mdx-components.tsx`

The new components must be exposed to MDX so they can be referenced from `content/relay/index.mdx`.

- [ ] **Step 1: Add imports near the existing `Relay*` imports**

  In `components/mdx-components.tsx`, after the line:

  ```typescript
  import { RelayVoicingSection } from '@/components/relay/relay-voicing-overview';
  ```

  Add three new import lines:

  ```typescript
  import { RelayHero } from '@/components/relay/relay-hero';
  import { RelayCosts } from '@/components/relay/relay-costs';
  import { RelayProcessOverview } from '@/components/relay/relay-process-overview';
  ```

- [ ] **Step 2: Register the components in the `components` object**

  In the same file, find the `RelayVoicingSection,` line in the `components` object (near the bottom) and add three lines after it:

  ```typescript
      RelayVoicingSection,
      RelayHero,
      RelayCosts,
      RelayProcessOverview,
  ```

- [ ] **Step 3: Confirm compilation**

  Run: `npx tsc --noEmit && npm run lint`

  Expected: no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add components/mdx-components.tsx
  git commit -m "feat(relay): register new homepage components in MDX"
  ```

---

### Task 7: Restructure `content/relay/index.mdx` to the five-section shape

**Files:**
- Modify: `content/relay/index.mdx`

This replaces the homepage content with the spec's five sections: hero · costs · process · voicings teaser · Discord CTA.

- [ ] **Step 1: Replace the file content**

  Replace `content/relay/index.mdx` with:

  ```mdx
  ---
  title: 'Relay Guitar Platform'
  description: 'A 3D-printed electric guitar platform. One shared body, seven distinct instruments. Build the guitar that fits how you play.'
  ---

  <RelayHero
      title="Relay Guitar Platform"
      tagline="A 3D-printed electric guitar platform. One shared body, seven distinct instruments. Build the guitar that fits how you play."
  />

  ## What it is, what it costs, what you get

  <RelayCosts
      items={[
          { title: 'What it is', body: 'A 3D-printed electric guitar you build at home. One shared body, seven voicings — pick the sound first, then build the guitar around it.' },
          { title: 'What it costs', body: '$200–$400 in parts depending on the voicing, plus filament. Body prints on a conventional FDM printer; no specialty hardware required.' },
          { title: 'What you get', body: 'A playable, giggable instrument you understand completely — because you built it. Same scale length and hardware as a Les Paul.' },
      ]}
  />

  ## How a Relay build comes together

  <RelayProcessOverview />

  ## Voicings

  Seven voicings to choose from. Each is a different way to wire the same body — different pickup combinations, different selector logic, different sound.

  <RelayVoicingGrid>
      <RelayVoicingCard slug="lipstick" name="Relay Lipstick" tagline="Humbuckers · Lipstick shaper" genres="Blues · Rock · Alternative · Indie" description="Bridge and neck humbuckers provide the main voices. The middle lipstick reshapes them with contour, texture, and air." href="/relay/voicings/lipstick" />
      <RelayVoicingCard slug="reef" name="Relay Reef" tagline="Humbucker · Dual-lipstick subsystem" genres="Indie · Surf · Alt Country · Shoegaze" description="Two separate voice families: a bridge humbucker and an independently controlled dual-lipstick subsystem." href="/relay/voicings/reef" />
      <RelayVoicingCard slug="velvet" name="Relay Velvet" tagline="Jazz-club center · Controlled warmth" genres="Jazz · Blues · Soul · R&B" description="A middle-primary model for players who put the guitar at the center of a small room: rounded attack, controlled mids, and enough presence to carry the act clean." href="/relay/voicings/velvet" />
      <RelayVoicingCard slug="arc" name="Relay Arc" tagline="Open · Spatial · Separated" genres="Clean pop · Indie · Ambient · Country" description="A middle-primary model focused on clarity and separation, especially under delay, reverb, and other effects." href="/relay/voicings/arc" />
      <RelayVoicingCard slug="torch" name="Relay Torch" tagline="Punch · Vocal mids · Presence" genres="Rock · Pop · Alternative · Modern country" description="A P90-type middle pickup acts as a primary voice for stronger mids, punch, and front-of-mix presence." href="/relay/voicings/torch" />
      <RelayVoicingCard slug="current" name="Relay Current" tagline="Fast attack · Upper-mid focus" genres="Funk · Pop · Rock" description="A rhythm-first humbucker model with a middle augment layer that tightens lows and sharpens attack without acting like a boost." href="/relay/voicings/current" />
      <RelayVoicingCard slug="hammer" name="Relay Hammer" tagline="High gain · Rails · Concept" genres="Metal · Hard rock" description="A high-gain concept using rail pickups, aimed at tight low end, saturation, and controlled aggression." href="/relay/voicings/hammer" />
  </RelayVoicingGrid>

  [See all voicings →](/relay/voicings)

  ## Community

  <RelayDiscordCta message="Ask questions, share builds, and follow development as the guides are written." />
  ```

- [ ] **Step 2: Verify the page renders by running the dev server briefly**

  Run: `npm run build`

  Expected: build succeeds (this also runs vitest). If MDX is malformed, the build will fail with a clear error pointing at the line.

- [ ] **Step 3: Commit**

  ```bash
  git add content/relay/index.mdx
  git commit -m "feat(relay): restructure homepage to five-section layout"
  ```

---

### Task 8: Create `/relay/voicings` thin gallery page

**Files:**
- Create: `app/relay/voicings/page.tsx`
- Create: `content/relay/voicings/index.mdx`

`/relay/voicings/[slug]` already exists. This task adds the parent route as a small list page so the Voicings card and the "See all voicings →" link have somewhere to land. The page reuses the existing `RelayVoicingGrid` and `RelayVoicingCard` components.

- [ ] **Step 1: Add a `loadRelayVoicingsGalleryPage` helper to `lib/relay.ts`**

  Open `lib/relay.ts` and add the following function below `loadRelayPlatformPage`:

  ```typescript
  /** Loads the voicings gallery index page (content/relay/voicings/index.mdx). */
  export function loadRelayVoicingsGalleryPage(): { content: string; frontmatter: RelayPageFrontmatter } {
      return loadMdxFile(path.join(process.cwd(), 'content', 'relay', 'voicings', 'index.mdx'));
  }
  ```

- [ ] **Step 2: Create the route handler**

  Create `app/relay/voicings/page.tsx`:

  ```tsx
  import React from 'react';
  import { MDXRemote } from 'next-mdx-remote/rsc';
  import remarkGfm from 'remark-gfm';
  import components from '@/components/mdx-components';
  import { DocPage } from '@/components/doc/doc-page';
  import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
  import { loadRelayVoicingsGalleryPage } from '@/lib/relay';

  export async function generateMetadata() {
      try {
          const { frontmatter } = loadRelayVoicingsGalleryPage();
          return {
              title: `${frontmatter.title} | K7RHY`,
              description: frontmatter.description,
              openGraph: { title: frontmatter.title, description: frontmatter.description },
          };
      } catch {
          return {};
      }
  }

  export default async function RelayVoicingsGalleryPage() {
      const { content, frontmatter } = loadRelayVoicingsGalleryPage();
      const breadcrumbs = [{ label: 'Relay Guitar', href: '/relay' }, { label: 'Voicings' }];
      return (
          <DocPage title={frontmatter.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
              <MDXRemote source={content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
          </DocPage>
      );
  }
  ```

- [ ] **Step 3: Create the gallery MDX**

  Create `content/relay/voicings/index.mdx`:

  ```mdx
  ---
  title: 'Voicings'
  description: 'Seven voicings for the Relay Guitar platform. Each is a different way to wire the same body.'
  ---

  Pick the sound first, then build the guitar around it. Each voicing uses the same body and scale length but a different combination of pickups, switching, and controls.

  <RelayVoicingGrid>
      <RelayVoicingCard slug="lipstick" name="Relay Lipstick" tagline="Humbuckers · Lipstick shaper" genres="Blues · Rock · Alternative · Indie" description="Bridge and neck humbuckers provide the main voices. The middle lipstick reshapes them with contour, texture, and air." href="/relay/voicings/lipstick" />
      <RelayVoicingCard slug="reef" name="Relay Reef" tagline="Humbucker · Dual-lipstick subsystem" genres="Indie · Surf · Alt Country · Shoegaze" description="Two separate voice families: a bridge humbucker and an independently controlled dual-lipstick subsystem." href="/relay/voicings/reef" />
      <RelayVoicingCard slug="velvet" name="Relay Velvet" tagline="Jazz-club center · Controlled warmth" genres="Jazz · Blues · Soul · R&B" description="A middle-primary model for players who put the guitar at the center of a small room: rounded attack, controlled mids, and enough presence to carry the act clean." href="/relay/voicings/velvet" />
      <RelayVoicingCard slug="arc" name="Relay Arc" tagline="Open · Spatial · Separated" genres="Clean pop · Indie · Ambient · Country" description="A middle-primary model focused on clarity and separation, especially under delay, reverb, and other effects." href="/relay/voicings/arc" />
      <RelayVoicingCard slug="torch" name="Relay Torch" tagline="Punch · Vocal mids · Presence" genres="Rock · Pop · Alternative · Modern country" description="A P90-type middle pickup acts as a primary voice for stronger mids, punch, and front-of-mix presence." href="/relay/voicings/torch" />
      <RelayVoicingCard slug="current" name="Relay Current" tagline="Fast attack · Upper-mid focus" genres="Funk · Pop · Rock" description="A rhythm-first humbucker model with a middle augment layer that tightens lows and sharpens attack without acting like a boost." href="/relay/voicings/current" />
      <RelayVoicingCard slug="hammer" name="Relay Hammer" tagline="High gain · Rails · Concept" genres="Metal · Hard rock" description="A high-gain concept using rail pickups, aimed at tight low end, saturation, and controlled aggression." href="/relay/voicings/hammer" />
  </RelayVoicingGrid>

  ## Community

  <RelayDiscordCta message="Ask questions, share builds, and follow development as the voicings evolve." />
  ```

- [ ] **Step 4: Add a test for the new loader**

  Open `lib/relay.test.ts` and append the following describe block:

  ```typescript
  describe('loadRelayVoicingsGalleryPage', () => {
      it('loads the voicings gallery frontmatter', () => {
          const { frontmatter } = loadRelayVoicingsGalleryPage();
          expect(frontmatter.title).toBe('Voicings');
      });
  });
  ```

  And update the imports at the top of the test file to include `loadRelayVoicingsGalleryPage`:

  Find:
  ```typescript
  import { resolveRelayVoicingFilePath, resolveRelayPlatformFilePath, buildRelayVoicingBreadcrumbs, buildRelayPlatformBreadcrumbs, loadRelayVoicingPage } from '@/lib/relay';
  ```

  Replace with:
  ```typescript
  import { resolveRelayVoicingFilePath, resolveRelayPlatformFilePath, buildRelayVoicingBreadcrumbs, buildRelayPlatformBreadcrumbs, loadRelayVoicingPage, loadRelayVoicingsGalleryPage } from '@/lib/relay';
  ```

- [ ] **Step 5: Run the test**

  Run: `npx vitest run lib/relay.test.ts`

  Expected: PASS — all tests including the new gallery loader test.

- [ ] **Step 6: Run the full build to verify the new route works**

  Run: `npm run build`

  Expected: build succeeds; the build log will show `/relay/voicings` as a prerendered route.

- [ ] **Step 7: Commit**

  ```bash
  git add app/relay/voicings/page.tsx content/relay/voicings/index.mdx lib/relay.ts lib/relay.test.ts
  git commit -m "feat(relay): add /relay/voicings gallery page"
  ```

---

### Task 9: Update sidebar to render Build process tree

**Files:**
- Modify: `components/navigation/relay-sidebar.tsx`
- Create: `components/navigation/relay-sidebar.test.tsx`

The platform sidebar currently shows only "Platform Overview" + "Voicings" with the lineup. It now also renders the three Build process stages with status indicators. Non-Live stages link to Discord with a small "Discord" tag; Live stages link to their in-site page.

The Voicings stage continues to show the lineup nav (`RelayVoicingLineupNav`) — this preserves existing behavior. Body and Assembly have no sub-items at PR #2 ship time, so they render as single rows.

- [ ] **Step 1: Write the failing test**

  Create `components/navigation/relay-sidebar.test.tsx`:

  ```tsx
  import React from 'react';
  import { render, screen } from '@testing-library/react';
  import { describe, expect, it, vi } from 'vitest';
  import '@testing-library/jest-dom/vitest';

  // Stub usePathname for the client component
  vi.mock('next/navigation', () => ({
      usePathname: () => '/relay',
  }));

  import { RelayLayoutSidebar } from './relay-sidebar';

  describe('RelayLayoutSidebar (platform mode)', () => {
      it('renders the Platform Overview link', () => {
          render(<RelayLayoutSidebar />);
          const link = screen.getByRole('link', { name: /platform overview/i });
          expect(link).toHaveAttribute('href', '/relay');
      });

      it('renders all three Build process stages: Body, Voicings, Assembly', () => {
          render(<RelayLayoutSidebar />);
          expect(screen.getByText('Body')).toBeInTheDocument();
          // "Voicings" appears as a heading too; assert at least one occurrence
          expect(screen.getAllByText('Voicings').length).toBeGreaterThan(0);
          expect(screen.getByText('Assembly')).toBeInTheDocument();
      });

      it('marks Body and Assembly stages as Discord links (target=_blank)', () => {
          render(<RelayLayoutSidebar />);
          // Accessible name is the concatenation of the row's spans: "1. Body Discord", "3. Assembly Discord"
          const bodyLink = screen.getByRole('link', { name: /1\. Body/ });
          const assemblyLink = screen.getByRole('link', { name: /3\. Assembly/ });
          expect(bodyLink).toHaveAttribute('target', '_blank');
          expect(assemblyLink).toHaveAttribute('target', '_blank');
          expect(bodyLink.getAttribute('href')).toMatch(/^https:\/\/discord\./);
      });

      it('lists the seven voicing slugs as sub-items under the Voicings stage', () => {
          render(<RelayLayoutSidebar />);
          for (const name of ['Lipstick', 'Reef', 'Velvet', 'Arc', 'Torch', 'Current', 'Hammer']) {
              expect(screen.getByRole('link', { name })).toBeInTheDocument();
          }
      });
  });
  ```

- [ ] **Step 2: Run the test and verify it fails**

  Run: `npx vitest run components/navigation/relay-sidebar.test.tsx`

  Expected: FAIL — assertions about Build process stages (Body / Assembly) won't be in the rendered output yet.

- [ ] **Step 3: Update the platform sidebar component**

  Replace the body of `components/navigation/relay-sidebar.tsx` (keep the file's `'use client'` directive intact) with:

  ```tsx
  'use client';

  import React from 'react';
  import Link from 'next/link';
  import { usePathname } from 'next/navigation';
  import { cn } from '@/lib/utils';
  import { relayNav } from '@/config/relay-nav';
  import { relayBuildProcess } from '@/config/relay-build-process';
  import type { RelayBreadcrumb } from '@/lib/relay';
  import type { RelayBuildStage, RelayStageStatus } from '@/types/relay-nav';
  import { MyBreadcrumbs } from '@/components/doc/doc-page';
  import { RelayVoicingLineupNav } from '@/components/relay/relay-voicing-lineup-nav';

  const PLATFORM_HREF = '/relay';
  const PLATFORM_LABEL = 'Relay Guitar';

  function StageStatusTag({ status }: { status: RelayStageStatus }) {
      if (status === 'live') return null; // No tag for Live; the link itself is the affordance.
      const label = status === 'in-progress' ? 'Discord' : 'Discord';
      const tone = status === 'in-progress'
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
          : 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-400';
      return <span className={cn('ml-2 shrink-0 rounded-full border px-1.5 py-0 text-[10px] font-medium uppercase tracking-wide', tone)}>{label}</span>;
  }

  function BuildStageRow({ stage, pathname }: { stage: RelayBuildStage; pathname: string }) {
      const linkProps = stage.isDiscord
          ? { target: '_blank' as const, rel: 'noopener noreferrer' as const }
          : {};
      const isActive = !stage.isDiscord && pathname === stage.href;

      return (
          <li>
              <Link
                  href={stage.href}
                  {...linkProps}
                  className={cn(
                      'flex w-full items-center rounded-md border border-transparent px-2 py-1 text-sm hover:underline',
                      isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
                  )}
              >
                  <span className="mr-2 inline-block w-4 shrink-0 text-xs text-muted-foreground/70">{stage.number}.</span>
                  <span className="flex-1">{stage.title}</span>
                  <StageStatusTag status={stage.status} />
              </Link>
          </li>
      );
  }

  function PlatformSidebar() {
      const pathname = usePathname() ?? '';

      return (
          <nav aria-label="Relay Guitar navigation" className="w-full">
              <div className="pb-4">
                  <Link
                      href={PLATFORM_HREF}
                      className={cn(
                          'flex w-full items-center rounded-md border border-transparent px-2 py-1 text-sm hover:underline',
                          pathname === PLATFORM_HREF ? 'font-medium text-foreground' : 'text-muted-foreground',
                      )}
                  >
                      Platform Overview
                  </Link>
              </div>

              <div className="pb-4">
                  <h4 className="mb-1 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Build process</h4>
                  <ul className="grid grid-flow-row auto-rows-max">
                      {relayBuildProcess.stages.map((stage) => (
                          <BuildStageRow key={stage.slug} stage={stage} pathname={pathname} />
                      ))}
                  </ul>
              </div>

              <div className="border-t pt-4">
                  <h4 className="mb-1 px-2 py-1 text-sm font-semibold">Voicings</h4>
                  <RelayVoicingLineupNav />
              </div>
          </nav>
      );
  }

  // ─── Voicing-level sidebar ────────────────────────────────────────────────────

  function VoicingSidebar({ voicing }: { voicing: string }) {
      const pathname = usePathname();
      const voicingNav = relayNav[voicing];

      if (!voicingNav) return null;

      const voicingRootHref = `/relay/voicings/${voicing}`;
      const isVoicingRootActive = pathname === voicingRootHref;

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
                          href={voicingRootHref}
                          className={cn(
                              'flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline',
                              isVoicingRootActive ? 'font-medium text-foreground' : 'text-muted-foreground',
                          )}
                      >
                          {voicingNav.title}
                      </Link>
                  </div>
              </div>

              <div className="border-t pt-4">
                  <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">All voicings</h4>
                  <RelayVoicingLineupNav />
              </div>
          </nav>
      );
  }

  // ─── Auto-switching sidebar ───────────────────────────────────────────────────

  export function RelayLayoutSidebar() {
      const pathname = usePathname() ?? '';
      const segments = pathname.split('/').filter(Boolean);
      const relayIndex = segments.indexOf('relay');
      const nextSegment = relayIndex >= 0 ? (segments[relayIndex + 1] ?? '') : '';
      const voicingSlug = nextSegment === 'voicings' ? (segments[relayIndex + 2] ?? '') : '';

      // Voicing-level sidebar only on /relay/voicings/<slug> (a specific voicing — not the gallery).
      // Everything else (including /relay/voicings, /relay/body, /relay/assembly) uses the platform sidebar.
      if (!voicingSlug) {
          return <PlatformSidebar />;
      }

      return <VoicingSidebar voicing={voicingSlug} />;
  }

  // ─── Breadcrumb bar ───────────────────────────────────────────────────────────

  export function RelayBreadcrumbBar({ items }: { items: RelayBreadcrumb[] }) {
      return <MyBreadcrumbs items={items} />;
  }
  ```

- [ ] **Step 4: Run the sidebar test and verify it passes**

  Run: `npx vitest run components/navigation/relay-sidebar.test.tsx`

  Expected: PASS — all four test cases.

- [ ] **Step 5: Commit**

  ```bash
  git add components/navigation/relay-sidebar.tsx components/navigation/relay-sidebar.test.tsx
  git commit -m "feat(relay): render Build process tree in platform sidebar"
  ```

---

### Task 10: Final validation

**Files:** none modified.

- [ ] **Step 1: TypeScript check**

  Run: `npx tsc --noEmit`

  Expected: no errors.

- [ ] **Step 2: Lint**

  Run: `npm run lint`

  Expected: no errors.

- [ ] **Step 3: Full test suite**

  Run: `npx vitest run`

  Expected: all tests pass. Watch specifically for:
  - `__tests__/config/relay-build-process.test.ts` — config invariants
  - `components/relay/relay-process-overview.test.tsx` — the three cards
  - `components/relay/relay-hero.test.tsx` — hero CTAs
  - `components/navigation/relay-sidebar.test.tsx` — sidebar Build process tree
  - `lib/relay.test.ts` — including the new `loadRelayVoicingsGalleryPage` test
  - All previously passing tests still pass.

- [ ] **Step 4: Production build**

  Run: `npm run build`

  Expected: build succeeds; build log includes `/relay`, `/relay/voicings`, and `/relay/voicings/[slug]` as prerendered routes.

- [ ] **Step 5: Manual smoke test in dev**

  Run: `npm run dev` (in a separate terminal if executing inline) and visit:
  - `http://localhost:3000/relay` — verify hero, costs cards, Build process cards, voicings teaser, Discord CTA all render in order
  - Confirm Body and Assembly cards open Discord (target=_blank); Voicings card goes to `/relay/voicings`
  - `http://localhost:3000/relay/voicings` — verify gallery page renders with all seven voicing cards
  - Sidebar on both pages shows the Build process tree with Body/Assembly tagged "Discord"
  - Click any voicing → /relay/voicings/<slug> still works; voicing-level sidebar renders as before

  Stop the dev server when done.

---

### Task 11: Push the branch and open the pull request

**Files:** none modified.

- [ ] **Step 1: Push the branch**

  Run: `git push -u origin docs/relay-restructure`

  Expected: success.

- [ ] **Step 2: Open the pull request**

  Run:
  ```bash
  gh pr create --title "feat(relay): restructure /relay homepage and add Build process overview (PR 2 of 3)" --body "$(cat <<'EOF'
  ## Summary

  - Restructures \`/relay\` to the five-section layout from the design doc: hero with CTA pair → costs cards → Build process overview → voicings teaser → Discord CTA
  - New \`RelayProcessOverview\` component renders three status-aware cards (Body / Voicings / Assembly). Status, link target, and Discord-vs-page routing all driven by a single \`relayBuildProcess\` config object
  - New \`/relay/voicings\` gallery page so the Voicings card and "See all voicings →" link resolve to a real route
  - Sidebar nav now renders the Build process tree on all platform-level routes; non-Live stages tagged "Discord"
  - New \`RelayHero\` and \`RelayCosts\` components keep the homepage MDX clean

  This is PR 2 of 3 from \`docs/superpowers/specs/2026-05-07-relay-platform-revision-design.md\`. PR #3 will build \`/relay/body\` and flip the Body stage from In progress → Live by editing one config field.

  ## Test plan

  - [ ] CI/branch deploy succeeds
  - [ ] Visit \`/relay\` — verify the five sections render in order
  - [ ] Verify the Build process cards show: Body (In progress), Voicings (Live), Assembly (Planned)
  - [ ] Click Body card → opens Discord in a new tab
  - [ ] Click Voicings card → goes to \`/relay/voicings\`
  - [ ] Click Assembly card → opens Discord in a new tab
  - [ ] Visit \`/relay/voicings\` — verify gallery renders all seven voicings with correct status badges
  - [ ] Sidebar on \`/relay\` and \`/relay/voicings\` shows the Build process tree with Body/Assembly tagged "Discord"
  - [ ] Visit any \`/relay/voicings/<slug>\` — voicing-level sidebar still renders unchanged

  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  EOF
  )"
  ```

  Expected: a URL to the new PR.

- [ ] **Step 3: Report the PR URL**

  Print the PR URL to the user.

---

## Self-Review Checklist

After completing all tasks, verify:

- [ ] **Spec coverage:** Every PR #2 scope item from `2026-05-07-relay-platform-revision-design.md` Section 10 is covered:
  - Five-section homepage (Tasks 5, 7) ✓
  - `RelayProcessOverview` component (Task 4) ✓
  - `config/relay-nav.ts` Build process tree → done via separate `relay-build-process.ts` config (Task 3) ✓ (deviation from spec wording but consistent with the codebase's split-config pattern)
  - Status-aware cards: Voicings=Live, Body=In progress, Assembly=Planned (Task 3 config) ✓
  - Sidebar Body/Assembly entries surface Discord status (Task 9) ✓
  - Validation: `/relay/voicings` exists and is reachable from the Voicings card (Task 8) ✓
- [ ] **No placeholders:** every code block contains actual code; every command has expected output.
- [ ] **Type consistency:** `RelayStageStatus` is the union `'live' | 'in-progress' | 'planned'` everywhere; `RelayBuildStage.slug` is the union `'body' | 'voicings' | 'assembly'` everywhere; `relayBuildProcess.stages` is the only consumer-facing export from `config/relay-build-process.ts`.
- [ ] **Validation:** Task 10 confirms typecheck + lint + tests + build all pass before push.
