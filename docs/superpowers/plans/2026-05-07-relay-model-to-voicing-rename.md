# Relay Model → Voicing Rename Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename "Model" → "Voicing" across the entire Relay platform — types, config, components, content, routes, and tests — and fix the homepage status-badge hardcode bug. This is PR #1 of three sequential PRs from the `2026-05-07-relay-platform-revision-design.md` spec.

**Architecture:** Pure refactor + one targeted bug fix. No new pages, no new behavior. Type field `modelKey` becomes `slug`; type names `RelayModel*` become `RelayVoicing*`; URLs move from `/relay/[model]` to `/relay/voicings/[slug]`; content moves from `content/relay/<slug>/index.mdx` to `content/relay/voicings/<slug>/index.mdx`. The bug fix has `RelayVoicingCard` read status from config rather than accepting it as a prop.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, React 19, Vitest, Tailwind, MDX via `next-mdx-remote/rsc`, gray-matter for frontmatter.

---

## Pre-flight

The codebase has 7 voicing slugs (lipstick, reef, velvet, arc, torch, current, hammer). Their statuses per `config/relay-models.ts`:
- `ready`: lipstick, velvet, torch
- `lab`: reef, arc, current
- `concept`: hammer

The current `content/relay/index.mdx` hardcodes `status="lab"` on every `<RelayModelCard>` — **this is the bug fixed in Task 10**.

The branch `docs/relay-platform-revision` is already pushed. Continue work on it; one rename commit, one bug-fix commit, then push.

The full test suite must pass at the end of Task 9 and again after Task 10. Intermediate commits inside the rename are not required — keep all rename changes in a single commit produced at Task 9.

Commands referenced throughout:
- Run all tests: `npx vitest run`
- Run a single test file: `npx vitest run path/to/file.test.ts`
- Lint: `npm run lint`
- Build (runs tests first): `npm run build`

---

### Task 1: Verify baseline and create rename branch checkpoint

**Files:** none modified.

- [ ] **Step 1: Confirm working tree is clean and on the right branch**

  Run: `git status && git branch --show-current`

  Expected: `On branch docs/relay-platform-revision`, `nothing to commit, working tree clean`. If not, stop and report.

- [ ] **Step 2: Run the full test suite to establish a green baseline**

  Run: `npx vitest run`

  Expected: all tests pass. If any fail, stop and fix before starting the rename.

- [ ] **Step 3: Run the linter to establish baseline**

  Run: `npm run lint`

  Expected: no errors.

---

### Task 2: Rename type definitions

**Files:**
- Rename: `types/relay-model.ts` → `types/relay-voicing.ts`
- Modify: `types/relay-nav.ts`

This task renames the type backbone. Everything else depends on it. After this task, consumer files still reference the old type names — they'll be updated in subsequent tasks. **The build will be broken between Task 2 and Task 9.** That's expected; do not commit until Task 9.

- [ ] **Step 1: Move and rewrite `types/relay-model.ts`**

  Create `types/relay-voicing.ts` with the new content below, then delete `types/relay-model.ts`.

  ```typescript
  // types/relay-voicing.ts
  export interface RelayVoicing {
      slug: string;
      name: string;
      tagline: string;
      genres: string;
      description: string;
      status: RelayVoicingStatus;
      interaction: RelayVoicingInteraction;
      pickupMap: RelayVoicingPickupMap;
      href?: string;
  }

  export type RelayVoicingStatus = 'lab' | 'ready' | 'concept';

  export type RelayPickupType = 'humbucker' | 'lipstick' | 'p90' | 'rail' | 'filtertron';
  export type RelayPickupRole = 'core' | 'primary' | 'shaper' | 'augment' | 'subsystem' | 'concept';

  export interface RelayPickupSlot {
      type: RelayPickupType;
      magnet?: string;
      resistance?: string;
      role?: RelayPickupRole;
  }

  export interface RelayVoicingPickupMap {
      bridge: RelayPickupSlot;
      middle: RelayPickupSlot;
      neck: RelayPickupSlot;
      selector: '3-way' | '5-way' | 'super-switch';
      volume?: 'standard' | 'push-push' | 'push-pull' | 'concentric';
      tone?: 'standard' | 'push-pull' | 'push-push' | 'concentric';
  }

  export interface RelayVoicingInteraction {
      category: 'Primary voice' | 'Augment layer' | 'Subsystem' | 'Shaper' | 'Concept';
      summary: string;
  }
  ```

  Then run: `rm types/relay-model.ts`

- [ ] **Step 2: Update `types/relay-nav.ts`**

  Replace the entire file with:

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
  ```

- [ ] **Step 3: Verify the rename is internally consistent (no commits yet)**

  Run: `npx tsc --noEmit 2>&1 | head -40`

  Expected: many errors referencing `RelayModel`, `RelayModelStatus`, `RelayModelNav`, `modelKey`, etc. across consumers — those will be fixed in subsequent tasks. **No errors should reference the new files (`relay-voicing.ts`, `relay-nav.ts`) themselves.** If they do, fix before moving on.

---

### Task 3: Rename voicings config and its test

**Files:**
- Rename: `config/relay-models.ts` → `config/relay-voicings.ts`
- Rename: `__tests__/config/relay-models.test.ts` → `__tests__/config/relay-voicings.test.ts`
- Modify: `config/relay-nav.ts` (no rename — its name doesn't need to change; only its imported types changed in Task 2)

The data file changes name and exports `relayVoicings` instead of `relayModels`. Field `modelKey` becomes `slug`. URLs in the `href` field move from `/relay/<slug>` to `/relay/voicings/<slug>`.

- [ ] **Step 1: Move config file and update field names**

  Run: `git mv config/relay-models.ts config/relay-voicings.ts` (preserves history)

  Then open `config/relay-voicings.ts` and replace its full content. Below is the complete new file. Note four changes throughout:
  1. `import type { RelayModel }` → `import type { RelayVoicing }`
  2. `export const relayModels: RelayModel[]` → `export const relayVoicings: RelayVoicing[]`
  3. Each entry's `modelKey:` → `slug:`
  4. Each entry's `href: '/relay/<slug>'` → `href: '/relay/voicings/<slug>'`

  ```typescript
  import type { RelayVoicing } from '@/types/relay-voicing';

  export const relayVoicings: RelayVoicing[] = [
      {
          slug: 'lipstick',
          name: 'Relay Lipstick',
          tagline: 'Humbuckers · Lipstick shaper',
          genres: 'Blues · Rock · Alternative · Indie',
          description: 'The reference Relay model: bridge and neck humbuckers provide the main voices, while the middle lipstick reshapes them with contour, texture, and air.',
          status: 'ready',
          interaction: {
              category: 'Shaper',
              summary: 'The middle lipstick reshapes the selected humbucker voice instead of acting as a standalone pickup sound.',
          },
          pickupMap: {
              bridge: { type: 'humbucker', magnet: 'Alnico V', resistance: '11.2K' },
              middle: { type: 'lipstick', magnet: 'Alnico II', resistance: '6.0K', role: 'shaper' },
              neck: { type: 'humbucker', magnet: 'Alnico II', resistance: '7.6K' },
              selector: '3-way',
              volume: 'push-push',
              tone: 'push-pull',
          },
          href: '/relay/voicings/lipstick',
      },
      {
          slug: 'reef',
          name: 'Relay Reef',
          tagline: 'Humbucker · Dual-lipstick subsystem',
          genres: 'Indie · Surf · Alt Country · Shoegaze · Studio',
          description: 'Two voice families in one body: a bridge humbucker and an independently controlled dual-lipstick subsystem for high-contrast clean and driven sounds.',
          status: 'lab',
          interaction: {
              category: 'Subsystem',
              summary: 'The middle and neck lipsticks form an independently controlled subsystem alongside the bridge humbucker.',
          },
          pickupMap: {
              bridge: { type: 'humbucker' },
              middle: { type: 'lipstick', role: 'subsystem' },
              neck: { type: 'lipstick', role: 'subsystem' },
              selector: '5-way',
              volume: 'concentric',
              tone: 'concentric',
          },
          href: '/relay/voicings/reef',
      },
      {
          slug: 'velvet',
          name: 'Relay Velvet',
          tagline: 'Jazz-club center · Controlled warmth',
          genres: 'Jazz · Blues · Soul · R&B',
          description: 'A middle-primary model for players who put the guitar at the center of a small room: rounded attack, controlled mids, and enough presence to carry the act clean.',
          status: 'ready',
          interaction: {
              category: 'Primary voice',
              summary: 'The middle pickup is a main selector destination for exposed clean and low-gain performance.',
          },
          pickupMap: {
              bridge: { type: 'humbucker', magnet: 'Alnico II', resistance: '8.6K' },
              middle: { type: 'filtertron', magnet: 'Ceramic', resistance: '8.0K', role: 'primary' },
              neck: { type: 'humbucker', magnet: 'Alnico II', resistance: '7.6K' },
              selector: '5-way',
              volume: 'standard',
              tone: 'push-pull',
          },
          href: '/relay/voicings/velvet',
      },
      {
          slug: 'arc',
          name: 'Relay Arc',
          tagline: 'Open · Spatial · Separated',
          genres: 'Clean pop · Indie · Ambient · Country',
          description: 'A middle-primary model focused on clarity and separation: wide clean sounds that keep detail under reverb, delay, and other effects.',
          status: 'lab',
          interaction: {
              category: 'Primary voice',
              summary: 'The middle pickup is a main selector destination for open, spatial sounds with strong note separation.',
          },
          pickupMap: {
              bridge: { type: 'filtertron', magnet: 'Alnico V', resistance: '9.5K' },
              middle: { type: 'humbucker', magnet: 'Alnico V', resistance: '9.0K', role: 'primary' },
              neck: { type: 'humbucker', magnet: 'Alnico V', resistance: '8.0K' },
              selector: '5-way',
              volume: 'standard',
              tone: 'push-pull',
          },
          href: '/relay/voicings/arc',
      },
      {
          slug: 'torch',
          name: 'Relay Torch',
          tagline: 'Punch · Vocal mids · Presence',
          genres: 'Rock · Pop · Alternative · Modern country',
          description: 'A P90-type middle pickup acts as a primary voice, giving the guitar stronger mids, more punch, and a forward position in the mix.',
          status: 'ready',
          interaction: {
              category: 'Primary voice',
              summary: 'The P90-type middle pickup is a main selector destination for punch, vocal mids, and mix presence.',
          },
          pickupMap: {
              bridge: { type: 'humbucker', magnet: 'Alnico V', resistance: '11.2K' },
              middle: { type: 'p90', magnet: 'Alnico V', resistance: '8.7K', role: 'primary' },
              neck: { type: 'humbucker', magnet: 'Alnico II', resistance: '7.6K' },
              selector: '5-way',
              volume: 'standard',
              tone: 'push-pull',
          },
          href: '/relay/voicings/torch',
      },
      {
          slug: 'current',
          name: 'Relay Current',
          tagline: 'Fast attack · Upper-mid focus',
          genres: 'Funk · Pop · Rock',
          description: 'A rhythm-first humbucker model with a middle augment layer that tightens lows, sharpens attack, and improves mix placement without acting like a boost.',
          status: 'lab',
          interaction: {
              category: 'Augment layer',
              summary: 'The middle pickup is added after the humbucker selection to tighten lows and sharpen attack.',
          },
          pickupMap: {
              bridge: { type: 'humbucker', magnet: 'Alnico V', resistance: '9.4K' },
              middle: { type: 'filtertron', magnet: 'Ceramic', resistance: '~10K', role: 'augment' },
              neck: { type: 'humbucker', magnet: 'Alnico V', resistance: '8.0K' },
              selector: '3-way',
              volume: 'push-push',
              tone: 'push-pull',
          },
          href: '/relay/voicings/current',
      },
      {
          slug: 'hammer',
          name: 'Relay Hammer',
          tagline: 'High gain · Rails · Concept',
          genres: 'Metal · Hard rock',
          description: 'A high-gain concept using rail pickups, aimed at tight low end, saturation, and controlled aggression. Final switching behavior is still in development.',
          status: 'concept',
          interaction: {
              category: 'Concept',
              summary: 'The rail-pickup set points toward high-gain behavior, but the final switching interaction is not finalized.',
          },
          pickupMap: {
              bridge: { type: 'rail', magnet: 'Ceramic', resistance: '16.2K' },
              middle: { type: 'rail', magnet: 'Ceramic', resistance: '10.0K', role: 'concept' },
              neck: { type: 'rail', magnet: 'Ceramic', resistance: '10.4K' },
              selector: 'super-switch',
              volume: 'push-push',
              tone: 'push-pull',
          },
          href: '/relay/voicings/hammer',
      },
  ];
  ```

- [ ] **Step 2: Update `config/relay-nav.ts`**

  This file is `relay-nav.ts`, not `relay-models.ts` — the name does not change. Only the type import changed in Task 2 (`RelayNav`, `RelayPlatformNav` already had those names). Verify the file's existing imports still resolve:

  Run: `head -3 config/relay-nav.ts`

  Expected to see: `import type { RelayNav, RelayPlatformNav } from '@/types/relay-nav';`

  No changes needed to `config/relay-nav.ts`.

- [ ] **Step 3: Move the config test and update it**

  Run: `git mv __tests__/config/relay-models.test.ts __tests__/config/relay-voicings.test.ts`

  Then replace its content with:

  ```typescript
  import { describe, it, expect } from 'vitest';
  import { relayVoicings } from '@/config/relay-voicings';

  describe('relayVoicings config', () => {
      it('contains exactly 7 voicings', () => {
          expect(relayVoicings).toHaveLength(7);
      });

      it('includes all expected voicing slugs', () => {
          const slugs = relayVoicings.map((v) => v.slug);
          expect(slugs).toContain('lipstick');
          expect(slugs).toContain('reef');
          expect(slugs).toContain('velvet');
          expect(slugs).toContain('arc');
          expect(slugs).toContain('torch');
          expect(slugs).toContain('current');
          expect(slugs).toContain('hammer');
      });

      it('every voicing has required string fields', () => {
          for (const voicing of relayVoicings) {
              expect(typeof voicing.slug).toBe('string');
              expect(voicing.slug.length).toBeGreaterThan(0);
              expect(typeof voicing.name).toBe('string');
              expect(typeof voicing.tagline).toBe('string');
              expect(typeof voicing.genres).toBe('string');
              expect(typeof voicing.description).toBe('string');
          }
      });

      it('every voicing status is lab, ready, or concept', () => {
          for (const voicing of relayVoicings) {
              expect(['lab', 'ready', 'concept']).toContain(voicing.status);
          }
      });

      it('marks each voicing with the expected release status', () => {
          const statuses = Object.fromEntries(relayVoicings.map((v) => [v.slug, v.status]));

          expect(statuses).toEqual({
              lipstick: 'ready',
              reef: 'lab',
              velvet: 'ready',
              arc: 'lab',
              torch: 'ready',
              current: 'lab',
              hammer: 'concept',
          });
      });

      it('provides overview metadata for every voicing page', () => {
          for (const voicing of relayVoicings) {
              expect(voicing.interaction.category).toMatch(/primary voice|augment layer|subsystem|shaper|concept/i);
              expect(voicing.pickupMap.selector).toMatch(/3-way|5-way|super-switch/);
              expect(voicing.pickupMap.bridge.type).toBeTruthy();
              expect(voicing.pickupMap.middle.type).toBeTruthy();
              expect(voicing.pickupMap.neck.type).toBeTruthy();
          }
      });

      it('every voicing href points to /relay/voicings/ not /relay/ or /docs/', () => {
          for (const voicing of relayVoicings) {
              if (voicing.href) {
                  expect(voicing.href).toMatch(/^\/relay\/voicings\//);
                  expect(voicing.href).not.toContain('/docs/');
              }
          }
      });
  });
  ```

---

### Task 4: Rename and update `lib/relay.ts` and its test

**Files:**
- Modify: `lib/relay.ts`
- Modify: `lib/relay.test.ts`

The path resolution moves from `content/relay/<slug>/...` to `content/relay/voicings/<slug>/...`. Function parameter `model` becomes `voicing`. Frontmatter field `model` becomes `voicing`. Breadcrumb hrefs `/relay/<slug>` become `/relay/voicings/<slug>`.

- [ ] **Step 1: Replace `lib/relay.ts` content**

  ```typescript
  import fs from 'fs';
  import path from 'path';
  import matter from 'gray-matter';
  import type { RelayNav, RelayPlatformNav } from '@/types/relay-nav';

  export interface RelayPageFrontmatter {
      title: string;
      description: string;
      voicing?: string;
  }

  export interface RelayBreadcrumb {
      label: string;
      href?: string;
  }

  /** Resolves the absolute path to an MDX file given a voicing slug and optional sub-page slug segments. */
  export function resolveRelayVoicingFilePath(voicing: string, slug: string[]): string {
      const segments = slug.length > 0 ? slug : ['index'];
      return path.join(process.cwd(), 'content', 'relay', 'voicings', voicing, ...segments) + '.mdx';
  }

  /** Resolves the absolute path to a platform-level MDX file (e.g. body/overview). */
  export function resolveRelayPlatformFilePath(slug: string[]): string {
      return path.join(process.cwd(), 'content', 'relay', ...slug) + '.mdx';
  }

  function loadMdxFile(filePath: string): { content: string; frontmatter: RelayPageFrontmatter } {
      if (!fs.existsSync(filePath)) {
          throw new Error(`Relay page not found: ${filePath}`);
      }
      const source = fs.readFileSync(filePath, 'utf-8');
      const { content, data } = matter(source);
      if (!data.title || !data.description) {
          throw new Error(`Relay page at ${filePath} is missing required frontmatter fields (title, description)`);
      }
      return { content, frontmatter: data as RelayPageFrontmatter };
  }

  /** Loads a voicing MDX page. */
  export function loadRelayVoicingPage(voicing: string, slug: string[]): { content: string; frontmatter: RelayPageFrontmatter } {
      return loadMdxFile(resolveRelayVoicingFilePath(voicing, slug));
  }

  /** Loads the platform-level index page (content/relay/index.mdx). */
  export function loadRelayPlatformPage(): { content: string; frontmatter: RelayPageFrontmatter } {
      return loadMdxFile(path.join(process.cwd(), 'content', 'relay', 'index.mdx'));
  }

  /** Loads a platform-level section page (e.g. body/overview → content/relay/body/overview.mdx). */
  export function loadRelayPlatformSectionPage(slug: string[]): { content: string; frontmatter: RelayPageFrontmatter } {
      return loadMdxFile(resolveRelayPlatformFilePath(slug));
  }

  /** Builds breadcrumbs for a platform section page. */
  export function buildRelayPlatformBreadcrumbs(slug: string[], nav: RelayPlatformNav): RelayBreadcrumb[] {
      const pageSlug = slug.join('/');
      let pageTitle: string | undefined;
      let sectionTitle: string | undefined;

      for (const section of nav.sections) {
          const item = section.items?.find((i) => i.slug === pageSlug);
          if (item) {
              pageTitle = item.title;
              sectionTitle = section.title;
              break;
          }
      }

      return [{ label: 'Relay Guitar', href: '/relay' }, ...(sectionTitle ? [{ label: sectionTitle }] : []), { label: pageTitle ?? slug[slug.length - 1] }];
  }

  /** Builds breadcrumb trail for a voicing page. */
  export function buildRelayVoicingBreadcrumbs(voicing: string, slug: string[], nav: RelayNav): RelayBreadcrumb[] {
      if (slug.length === 0) {
          return [{ label: 'Relay Guitar', href: '/relay' }, { label: nav[voicing]?.title ?? voicing }];
      }

      const voicingNav = nav[voicing];
      const pageSlug = slug.join('/');

      let pageTitle: string | undefined;
      let sectionTitle: string | undefined;

      for (const section of voicingNav?.sections ?? []) {
          const item = section.items?.find((i) => i.slug === pageSlug);
          if (item) {
              pageTitle = item.title;
              sectionTitle = section.title;
              break;
          }
      }

      return [
          { label: 'Relay Guitar', href: '/relay' },
          { label: voicingNav?.title ?? voicing, href: `/relay/voicings/${voicing}` },
          ...(sectionTitle && sectionTitle !== voicingNav?.title ? [{ label: sectionTitle }] : []),
          { label: pageTitle ?? slug[slug.length - 1] },
      ];
  }
  ```

- [ ] **Step 2: Replace `lib/relay.test.ts` content**

  ```typescript
  import { describe, it, expect } from 'vitest';
  import path from 'path';
  import { resolveRelayVoicingFilePath, resolveRelayPlatformFilePath, buildRelayVoicingBreadcrumbs, buildRelayPlatformBreadcrumbs, loadRelayVoicingPage } from '@/lib/relay';
  import { relayNav, relayPlatformNav } from '@/config/relay-nav';

  describe('resolveRelayVoicingFilePath', () => {
      it('resolves voicing index path when slug is empty', () => {
          const result = resolveRelayVoicingFilePath('lipstick', []);
          expect(result).toContain(path.join('content', 'relay', 'voicings', 'lipstick', 'index.mdx'));
      });

      it('resolves voicing sub-page path', () => {
          const result = resolveRelayVoicingFilePath('lipstick', ['bom']);
          expect(result).toContain(path.join('content', 'relay', 'voicings', 'lipstick', 'bom.mdx'));
      });
  });

  describe('loadRelayVoicingPage', () => {
      it('loads voicing frontmatter with the voicing slug used by the overview component', () => {
          const { frontmatter } = loadRelayVoicingPage('velvet', []);

          expect(frontmatter.voicing).toBe('velvet');
      });
  });

  describe('resolveRelayPlatformFilePath', () => {
      it('resolves platform section path', () => {
          const result = resolveRelayPlatformFilePath(['body', 'overview']);
          expect(result).toContain(path.join('content', 'relay', 'body', 'overview.mdx'));
      });
  });

  describe('buildRelayVoicingBreadcrumbs', () => {
      it('builds breadcrumbs for voicing root page', () => {
          const crumbs = buildRelayVoicingBreadcrumbs('lipstick', [], relayNav);
          expect(crumbs).toEqual([{ label: 'Relay Guitar', href: '/relay' }, { label: 'Relay Lipstick' }]);
      });

      it('first breadcrumb links to /relay not /docs/relay', () => {
          const crumbs = buildRelayVoicingBreadcrumbs('lipstick', [], relayNav);
          expect(crumbs[0].href).toBe('/relay');
          expect(crumbs[0].href).not.toContain('/docs/');
      });
  });

  describe('buildRelayPlatformBreadcrumbs', () => {
      it('first breadcrumb links to /relay not /docs/relay', () => {
          const crumbs = buildRelayPlatformBreadcrumbs(['body', 'overview'], relayPlatformNav);
          const relayLink = crumbs.find((c) => c.href?.includes('relay'));
          expect(relayLink?.href).toBe('/relay');
          expect(relayLink?.href).not.toContain('/docs/');
      });
  });
  ```

  Note: `loadRelayVoicingPage('velvet', [])` will fail until Task 8 moves `content/relay/velvet/index.mdx` → `content/relay/voicings/velvet/index.mdx`. That's expected.

---

### Task 5: Rename and update relay components

**Files:**
- Rename: `components/relay/relay-model-status-badge.tsx` → `components/relay/relay-voicing-status-badge.tsx`
- Rename: `components/relay/relay-model-overview.tsx` → `components/relay/relay-voicing-overview.tsx`
- Rename: `components/relay/relay-model-overview.test.tsx` → `components/relay/relay-voicing-overview.test.tsx`
- Rename: `components/relay/relay-model-lineup-nav.tsx` → `components/relay/relay-voicing-lineup-nav.tsx`
- Rename: `components/relay/relay-model-lineup-nav.test.ts` → `components/relay/relay-voicing-lineup-nav.test.ts`
- Rename: `components/doc/relay-model-grid.tsx` → `components/doc/relay-voicing-grid.tsx`
- Modify: `components/relay/relay-pickup-map.tsx`
- Modify: `components/relay/relay-recommended-pickups.tsx`
- Modify: `components/navigation/relay-sidebar.tsx`

This is the bulk of the rename surface. Each file rename uses `git mv` to preserve history, then content is updated.

- [ ] **Step 1: Rename and rewrite `relay-voicing-status-badge.tsx`**

  Run: `git mv components/relay/relay-model-status-badge.tsx components/relay/relay-voicing-status-badge.tsx`

  Replace the file's content with:

  ```tsx
  import React from 'react';
  import { cn } from '@/lib/utils';
  import type { RelayVoicingStatus } from '@/types/relay-voicing';

  export type { RelayVoicingStatus };

  export function RelayVoicingStatusBadge({ status, className }: { status: RelayVoicingStatus; className?: string }) {
      if (status === 'ready') {
          return <span className={cn('shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400', className)}>Ready</span>;
      }
      if (status === 'concept') {
          return <span className={cn('shrink-0 rounded-full border border-slate-500/30 bg-slate-500/10 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400', className)}>Concept</span>;
      }
      return <span className={cn('shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400', className)}>Lab</span>;
  }
  ```

- [ ] **Step 2: Rename and rewrite `relay-voicing-overview.tsx`**

  Run: `git mv components/relay/relay-model-overview.tsx components/relay/relay-voicing-overview.tsx`

  Replace the file's content with:

  ```tsx
  import React from 'react';
  import { cn } from '@/lib/utils';
  import { relayVoicings } from '@/config/relay-voicings';
  import type { RelayVoicing, RelayVoicingStatus } from '@/types/relay-voicing';
  import { RelayPickupMap } from '@/components/relay/relay-pickup-map';

  const statusCopy: Partial<Record<RelayVoicingStatus, { title: string; body: string; className: string }>> = {
      lab: {
          title: 'Lab voicing',
          body: "This voicing's design is defined but has not been physically built and validated yet. Component choices and wiring details may change after testing.",
          className: 'border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-300',
      },
      concept: {
          title: 'Concept voicing',
          body: 'This voicing is still exploratory. The target behavior is documented, but switching, parts, and final interaction details are not finalized.',
          className: 'border-slate-500/30 bg-slate-500/5 text-slate-800 dark:text-slate-300',
      },
  };

  function getRelayVoicing(slug: string): RelayVoicing | undefined {
      return relayVoicings.find((voicing) => voicing.slug === slug);
  }

  export function RelayVoicingOverview({ voicingSlug, children }: { voicingSlug: string; children: React.ReactNode }) {
      const voicing = getRelayVoicing(voicingSlug);

      if (!voicing) {
          return <>{children}</>;
      }

      const status = statusCopy[voicing.status];

      return (
          <>
              <div className="my-6 space-y-5">
                  {status && (
                      <div data-relay-status-callout className={cn('rounded-xl border p-4 text-sm', status.className)}>
                          <p className="font-semibold">{status.title}</p>
                          <p className="mt-1 opacity-90">{status.body}</p>
                      </div>
                  )}

                  <div data-relay-overview-summary>
                      <div className="min-w-0 space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{voicing.tagline}</p>
                          <p className="max-w-3xl text-sm text-muted-foreground">{voicing.description}</p>
                      </div>
                  </div>

                  <RelayPickupMap {...voicing.pickupMap} />

                  <div className="rounded-xl border bg-card p-4 text-sm">
                      <p className="font-semibold">Pickup interaction: {voicing.interaction.category}</p>
                      <p className="mt-1 text-muted-foreground">{voicing.interaction.summary}</p>
                  </div>
              </div>

              {children}
          </>
      );
  }

  const sectionTitles: Record<string, string> = {
      'what-it-is': 'What it is',
      'pickup-interaction': 'Pickup interaction',
      controls: 'Controls',
      'how-it-behaves': 'How it behaves',
      'who-its-for': "Who it's for",
  };

  export function RelayVoicingSection({ name, title, children }: { name: string; title?: string; children: React.ReactNode }) {
      return (
          <section>
              <h2 className="font-heading mt-12 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">{title ?? sectionTitles[name] ?? name}</h2>
              {children}
          </section>
      );
  }
  ```

  Notes on the changes from the old file:
  - Component renamed: `RelayModelOverview` → `RelayVoicingOverview`
  - Prop renamed: `modelKey` → `voicingSlug`
  - Helper renamed: `getRelayModel(modelKey)` → `getRelayVoicing(slug)` and looks up by `voicing.slug`
  - Status copy text: "Lab model" → "Lab voicing", "Concept model" → "Concept voicing"; "This model's design" → "This voicing's design"; etc.
  - Section component renamed: `RelayModelSection` → `RelayVoicingSection`

- [ ] **Step 3: Rename and rewrite `relay-voicing-overview.test.tsx`**

  Run: `git mv components/relay/relay-model-overview.test.tsx components/relay/relay-voicing-overview.test.tsx`

  Replace the file's content with:

  ```tsx
  import React from 'react';
  import { render, screen } from '@testing-library/react';
  import { describe, expect, it } from 'vitest';
  import '@testing-library/jest-dom/vitest';
  import { RelayVoicingOverview } from './relay-voicing-overview';

  describe('RelayVoicingOverview', () => {
      it('does not render a status badge or callout for ready voicings', () => {
          render(<RelayVoicingOverview voicingSlug="velvet">Body copy</RelayVoicingOverview>);

          expect(screen.queryByText('Ready')).not.toBeInTheDocument();
          expect(screen.queryByText('Ready voicing')).not.toBeInTheDocument();
          expect(screen.getByText('Body copy')).toBeInTheDocument();
      });

      it('renders a lab status callout before the overview text', () => {
          const { container } = render(<RelayVoicingOverview voicingSlug="arc">Body copy</RelayVoicingOverview>);

          expect(screen.getByText('Lab voicing')).toBeInTheDocument();
          const callout = container.querySelector('[data-relay-status-callout]');
          const overview = container.querySelector('[data-relay-overview-summary]');
          expect(callout && overview ? callout.compareDocumentPosition(overview) & Node.DOCUMENT_POSITION_FOLLOWING : 0).toBeTruthy();
      });
  });
  ```

- [ ] **Step 4: Rename and rewrite `relay-voicing-lineup-nav.tsx`**

  Run: `git mv components/relay/relay-model-lineup-nav.tsx components/relay/relay-voicing-lineup-nav.tsx`

  Replace the file's content with:

  ```tsx
  'use client';

  import React from 'react';
  import Link from 'next/link';
  import { usePathname } from 'next/navigation';
  import { cn } from '@/lib/utils';
  import { relayNav } from '@/config/relay-nav';
  import { RelayVoicingStatusBadge } from '@/components/relay/relay-voicing-status-badge';
  import type { RelayVoicingStatus } from '@/types/relay-voicing';
  import type { RelayVoicingNav } from '@/types/relay-nav';

  /** Identify the active voicing slug from a path like /relay/voicings/lipstick. Returns undefined for /relay or platform routes. */
  function activeVoicingSlugFromPath(pathname: string): string | undefined {
      const parts = pathname.split('/').filter(Boolean);
      const relayIdx = parts.indexOf('relay');
      if (relayIdx < 0) return undefined;
      if (parts[relayIdx + 1] !== 'voicings') return undefined;
      const slug = parts[relayIdx + 2];
      return slug && relayNav[slug] ? slug : undefined;
  }

  const statusSortOrder: Record<RelayVoicingStatus, number> = {
      ready: 0,
      lab: 1,
      concept: 2,
  };

  export function sortRelayVoicingNavEntries(entries: Array<[string, RelayVoicingNav]>): Array<[string, RelayVoicingNav]> {
      return [...entries].sort(([, a], [, b]) => {
          const statusDelta = statusSortOrder[a.status] - statusSortOrder[b.status];
          if (statusDelta !== 0) return statusDelta;
          return a.title.localeCompare(b.title);
      });
  }

  export function RelayVoicingLineupNav() {
      const pathname = usePathname() ?? '';
      const activeSlug = activeVoicingSlugFromPath(pathname);
      const entries = sortRelayVoicingNavEntries(Object.entries(relayNav));

      return (
          <div className="grid grid-flow-row auto-rows-max text-sm">
              {entries.map(([slug, voicing]) => {
                  const href = `/relay/voicings/${slug}`;
                  const isActive = activeSlug === slug;
                  return (
                      <Link key={slug} href={href} className={cn('flex w-full items-center justify-between gap-2 rounded-md border border-transparent px-2 py-1 hover:underline', isActive ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                          <span className="min-w-0">{voicing.title}</span>
                          <RelayVoicingStatusBadge status={voicing.status} />
                      </Link>
                  );
              })}
          </div>
      );
  }
  ```

  Key changes from the old file:
  - Import path `@/components/relay/relay-voicing-status-badge` (file rename)
  - Type imports: `RelayVoicingStatus`, `RelayVoicingNav` (Task 2 renames)
  - Function `activeModelKeyFromPath` → `activeVoicingSlugFromPath`; the new path detection looks for `/relay/voicings/<slug>`, treating `/relay/<anything-else>` (including the future `/relay/body`, `/relay/assembly`) as platform routes that don't activate any voicing
  - The `PLATFORM_ROUTE_SEGMENTS` set is removed — no longer needed because the `voicings` segment uniquely identifies voicing routes
  - Function `sortRelayModelNavEntries` → `sortRelayVoicingNavEntries`
  - Component `RelayModelLineupNav` → `RelayVoicingLineupNav`
  - Hrefs `/relay/<slug>` → `/relay/voicings/<slug>`

- [ ] **Step 5: Rename and rewrite `relay-voicing-lineup-nav.test.ts`**

  Run: `git mv components/relay/relay-model-lineup-nav.test.ts components/relay/relay-voicing-lineup-nav.test.ts`

  Replace the file's content with:

  ```typescript
  import { describe, expect, it } from 'vitest';
  import { sortRelayVoicingNavEntries } from './relay-voicing-lineup-nav';
  import type { RelayVoicingNav } from '@/types/relay-nav';

  describe('sortRelayVoicingNavEntries', () => {
      it('sorts by status priority, then title alphabetically', () => {
          const entries: Array<[string, RelayVoicingNav]> = [
              ['current', { title: 'Relay Current', status: 'lab', sections: [] }],
              ['hammer', { title: 'Relay Hammer', status: 'concept', sections: [] }],
              ['torch', { title: 'Relay Torch', status: 'ready', sections: [] }],
              ['arc', { title: 'Relay Arc', status: 'lab', sections: [] }],
              ['lipstick', { title: 'Relay Lipstick', status: 'ready', sections: [] }],
          ];

          expect(sortRelayVoicingNavEntries(entries).map(([slug]) => slug)).toEqual(['lipstick', 'torch', 'arc', 'current', 'hammer']);
      });
  });
  ```

- [ ] **Step 6: Rename and rewrite `relay-voicing-grid.tsx`**

  Run: `git mv components/doc/relay-model-grid.tsx components/doc/relay-voicing-grid.tsx`

  Replace the file's content with the version below. **This step keeps the existing prop-based status — the bug fix that has the card read status from config is Task 10, done as a TDD cycle. For now we keep the public API identical.**

  ```tsx
  import React from 'react';
  import Link from 'next/link';
  import { cn } from '@/lib/utils';
  import { RelayVoicingStatusBadge, type RelayVoicingStatus } from '@/components/relay/relay-voicing-status-badge';

  interface RelayVoicingCardProps {
      name: string;
      tagline: string;
      genres: string;
      description: string;
      status: RelayVoicingStatus;
      href?: string;
  }

  export function RelayVoicingCard({ name, tagline, genres, description, status, href }: RelayVoicingCardProps) {
      const inner = (
          <div className={cn('flex h-full flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all', href && 'group-hover:border-sky-500 group-hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]')}>
              <div className="flex items-start justify-between gap-2">
                  <h3 className={cn('font-semibold text-foreground', href && 'transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400')}>{name}</h3>
                  <RelayVoicingStatusBadge status={status} />
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

  export function RelayVoicingGrid({ children }: { children: React.ReactNode }) {
      return <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
  }
  ```

- [ ] **Step 7: Update `relay-pickup-map.tsx`**

  No file rename. Only update the import line to reference the renamed type.

  Open `components/relay/relay-pickup-map.tsx` and change line 3 from:

  ```typescript
  import type { RelayModelPickupMap, RelayPickupRole, RelayPickupSlot, RelayPickupType } from '@/types/relay-model';
  ```

  to:

  ```typescript
  import type { RelayVoicingPickupMap, RelayPickupRole, RelayPickupSlot, RelayPickupType } from '@/types/relay-voicing';
  ```

  Then update line 5 from:

  ```typescript
  export type RelayPickupMapProps = RelayModelPickupMap;
  ```

  to:

  ```typescript
  export type RelayPickupMapProps = RelayVoicingPickupMap;
  ```

  No other changes in this file.

- [ ] **Step 8: Update `relay-recommended-pickups.tsx`**

  Open `components/relay/relay-recommended-pickups.tsx`. The file exports a canonical `RelayRecommendedPickups` and an alias `RelayModelPickupChoices`. Rename only the alias. Replace line 41:

  ```typescript
  export const RelayModelPickupChoices = RelayRecommendedPickups;
  ```

  with:

  ```typescript
  export const RelayVoicingPickupChoices = RelayRecommendedPickups;
  ```

- [ ] **Step 9: Update `relay-sidebar.tsx`**

  Replace `components/navigation/relay-sidebar.tsx` content with:

  ```tsx
  'use client';

  import React from 'react';
  import Link from 'next/link';
  import { usePathname } from 'next/navigation';
  import { cn } from '@/lib/utils';
  import { relayNav } from '@/config/relay-nav';
  import type { RelayBreadcrumb } from '@/lib/relay';
  import { MyBreadcrumbs } from '@/components/doc/doc-page';
  import { RelayVoicingLineupNav } from '@/components/relay/relay-voicing-lineup-nav';

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
                  <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">Voicings</h4>
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

      // Voicing-level sidebar only on /relay/voicings/<slug>; everything else uses the platform sidebar.
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

  Key changes:
  - `RelayModelLineupNav` import → `RelayVoicingLineupNav`
  - "Models" header → "Voicings"
  - "All models" header → "All voicings"
  - Function `ModelSidebar` → `VoicingSidebar`; param `model` → `voicing`; variable `modelNav` → `voicingNav`; variable `modelRootHref` → `voicingRootHref`; variable `isModelRootActive` → `isVoicingRootActive`
  - URL pattern `/relay/${model}` → `/relay/voicings/${voicing}`
  - The auto-switching logic: previously platform sidebar was used for `/relay` and any segment in the `PLATFORM_SECTIONS` set; voicing sidebar otherwise. Now: voicing sidebar is used **only** when path is `/relay/voicings/<slug>`; everything else (including `/relay/body`, `/relay/assembly` future routes) uses the platform sidebar.
  - The `PLATFORM_SECTIONS` set is removed — no longer needed.

---

### Task 6: Update `mdx-components.tsx` registrations

**Files:**
- Modify: `components/mdx-components.tsx`

The `mdx-components.tsx` file imports renamed components from the new file paths and re-registers them under the new names. The MDX content (Task 8) will use the new component names.

- [ ] **Step 1: Update imports and registrations in `mdx-components.tsx`**

  In `components/mdx-components.tsx`, replace four import lines:

  Find:
  ```typescript
  import { RelayModelGrid, RelayModelCard } from '@/components/doc/relay-model-grid';
  import { RelayModelPickupChoices, RelayRecommendedPickups } from '@/components/relay/relay-recommended-pickups';
  ```
  Replace with:
  ```typescript
  import { RelayVoicingGrid, RelayVoicingCard } from '@/components/doc/relay-voicing-grid';
  import { RelayVoicingPickupChoices, RelayRecommendedPickups } from '@/components/relay/relay-recommended-pickups';
  ```

  Find:
  ```typescript
  import { RelayModelSection } from '@/components/relay/relay-model-overview';
  ```
  Replace with:
  ```typescript
  import { RelayVoicingSection } from '@/components/relay/relay-voicing-overview';
  ```

  In the `components` registration object, replace:
  ```typescript
      RelayModelGrid,
      RelayModelCard,
  ```
  with:
  ```typescript
      RelayVoicingGrid,
      RelayVoicingCard,
  ```

  Replace:
  ```typescript
      RelayModelPickupChoices,
      RelayModelSection,
  ```
  with:
  ```typescript
      RelayVoicingPickupChoices,
      RelayVoicingSection,
  ```

  Leave the rest of the file unchanged (`RelayRecommendedPickups`, `RelayDiscordCta`, `RelayLabDisclosure`, `RelayWiringDiagram`, `RelayPickupMap`, etc., are all correct).

---

### Task 7: Move the voicing route folder

**Files:**
- Rename: `app/relay/[model]/page.tsx` → `app/relay/voicings/[slug]/page.tsx`

The route segment changes. Next.js dynamic param `model` becomes `slug`. Internals reference the renamed `lib/relay.ts` API.

- [ ] **Step 1: Create the new route directory and move the page file**

  Run (the directory name `[model]` contains glob metacharacters, so quote both paths):
  ```bash
  mkdir -p app/relay/voicings
  git mv 'app/relay/[model]' 'app/relay/voicings/[slug]'
  ```

- [ ] **Step 2: Replace `app/relay/voicings/[slug]/page.tsx` content**

  ```tsx
  import React from 'react';
  import { notFound } from 'next/navigation';
  import { MDXRemote } from 'next-mdx-remote/rsc';
  import remarkGfm from 'remark-gfm';
  import components from '@/components/mdx-components';
  import { DocPage } from '@/components/doc/doc-page';
  import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
  import { loadRelayVoicingPage, buildRelayVoicingBreadcrumbs, type RelayPageFrontmatter } from '@/lib/relay';
  import { relayNav } from '@/config/relay-nav';
  import { RelayVoicingOverview } from '@/components/relay/relay-voicing-overview';

  type Props = { params: Promise<{ slug: string }> };

  export function generateStaticParams() {
      return Object.keys(relayNav).map((slug) => ({ slug }));
  }

  export async function generateMetadata({ params }: Props) {
      const { slug } = await params;
      try {
          const { frontmatter } = loadRelayVoicingPage(slug, []);
          return {
              title: `${frontmatter.title} | Relay Guitar | K7RHY`,
              description: frontmatter.description,
              openGraph: { title: frontmatter.title, description: frontmatter.description },
          };
      } catch {
          return {};
      }
  }

  export default async function RelayVoicingPage({ params }: Props) {
      const { slug } = await params;
      let content: string;
      let frontmatter: RelayPageFrontmatter;
      try {
          ({ content, frontmatter } = loadRelayVoicingPage(slug, []));
      } catch {
          notFound();
      }
      const breadcrumbs = buildRelayVoicingBreadcrumbs(slug, [], relayNav);
      return (
          <DocPage title={frontmatter!.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
              <RelayVoicingOverview voicingSlug={frontmatter!.voicing ?? slug}>
                  <MDXRemote source={content!} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
              </RelayVoicingOverview>
          </DocPage>
      );
  }
  ```

  Key changes:
  - Import `loadRelayVoicingPage`, `buildRelayVoicingBreadcrumbs`, `RelayVoicingOverview` (renamed)
  - `params` type `{ model: string }` → `{ slug: string }`
  - `RelayModelOverview modelKey={...}` → `RelayVoicingOverview voicingSlug={...}`
  - Function name `RelayModelPage` → `RelayVoicingPage`
  - Frontmatter field `frontmatter.model` → `frontmatter.voicing`

---

### Task 8: Move and update voicing MDX content

**Files:**
- Rename: `content/relay/<slug>/index.mdx` → `content/relay/voicings/<slug>/index.mdx` for each of the 7 voicings (lipstick, reef, velvet, arc, torch, current, hammer)
- Modify: each moved `index.mdx` (frontmatter + component name updates)

Each voicing's `index.mdx` is the only file in its folder that's currently rendered. The other files (e.g., `content/relay/lipstick/bom.mdx`, `compatibility.mdx`, `_content-brief.md`) are unrouted legacy material — they stay in `content/relay/<slug>/` per the legacy-content policy in the spec (Section 9). Only `index.mdx` moves.

- [ ] **Step 1: Create the voicings content directory and move all 7 index files**

  Run:
  ```bash
  mkdir -p content/relay/voicings
  for slug in lipstick reef velvet arc torch current hammer; do
      mkdir -p content/relay/voicings/$slug
      git mv content/relay/$slug/index.mdx content/relay/voicings/$slug/index.mdx
  done
  ```

  After this, the 7 `index.mdx` files are at their new paths. The legacy files (`content/relay/lipstick/bom.mdx`, etc.) remain at their old paths — they are unrouted and out of scope for this PR.

- [ ] **Step 2: Update component names and frontmatter in each moved `index.mdx`**

  For each of the 7 files at `content/relay/voicings/<slug>/index.mdx`, apply these find-and-replace operations exactly. Each file uses `<RelayModelSection>` 5 times and `<RelayModelPickupChoices>` once (12 total occurrences = 5 opening + 5 closing + 1 opening + 1 closing per the earlier survey).

  Replace in body (apply to all 7 files):
  - `<RelayModelSection ` → `<RelayVoicingSection `
  - `</RelayModelSection>` → `</RelayVoicingSection>`
  - `<RelayModelPickupChoices ` → `<RelayVoicingPickupChoices `
  - `</RelayModelPickupChoices>` → `</RelayVoicingPickupChoices>`

  Replace in frontmatter (apply to all 7 files):
  - `model: 'lipstick'` → `voicing: 'lipstick'` (and the equivalent for each slug — `reef`, `velvet`, `arc`, `torch`, `current`, `hammer`)

  After replacement, sanity-check by running:
  ```bash
  grep -rn "RelayModelSection\|RelayModelPickupChoices\|^model:" content/relay/voicings/
  ```
  Expected: no output (zero matches). If anything is found, finish the replacements before continuing.

  Verify the new names are present:
  ```bash
  grep -c "RelayVoicingSection" content/relay/voicings/*/index.mdx
  ```
  Expected: each of the 7 lines reports 12 (5 opening + 5 closing + 2 from `RelayVoicingPickupChoices`... actually `RelayVoicingPickupChoices` is a separate string. Let me re-check: each file has `<RelayModelSection name="...">` ×5 and `</RelayModelSection>` ×5 = 10 occurrences of `RelayModelSection`. Plus 2 of `RelayModelPickupChoices`. So `grep -c "RelayVoicingSection"` should report `10` per file, and `grep -c "RelayVoicingPickupChoices"` should report `2` per file).

  Run both:
  ```bash
  grep -c "RelayVoicingSection" content/relay/voicings/*/index.mdx
  grep -c "RelayVoicingPickupChoices" content/relay/voicings/*/index.mdx
  ```
  Expected: 10 per file for the first, 2 per file for the second.

---

### Task 9: Update platform index page, run all checks, and commit

**Files:**
- Modify: `content/relay/index.mdx`

The platform index uses `<RelayModelGrid>` and `<RelayModelCard>` to render the voicings teaser. Update the component names and the URL paths in `href` attributes. **Do not yet remove `status="..."` props from each card** — that's the bug fix in Task 10. For now, keep them, but update each card's value to match the actual config status (lipstick=ready, reef=lab, velvet=ready, arc=lab, torch=ready, current=lab, hammer=concept). This makes the rename a pure refactor; the bug fix in Task 10 will remove the prop entirely.

- [ ] **Step 1: Replace `content/relay/index.mdx` content**

  Open the file and apply these changes:

  1. Heading text `## Models` → `## Voicings`. *(Also: this section's intro paragraph mentions "Models" only in the heading — body copy is fine.)*
  2. `<RelayModelGrid>` → `<RelayVoicingGrid>` (and closing tag)
  3. Each `<RelayModelCard ... />` → `<RelayVoicingCard ... />`
  4. Each card's `href="/relay/<slug>"` → `href="/relay/voicings/<slug>"`
  5. Each card's `status="lab"` → the actual value from config (lipstick=`ready`, reef=`lab`, velvet=`ready`, arc=`lab`, torch=`ready`, current=`lab`, hammer=`concept`)

  The full target content is (preserve everything else from the original file verbatim):

  ```mdx
  ---
  title: 'Relay Guitar Platform'
  description: 'A 3D-printed electric guitar platform. One shared body, seven distinct instruments. Build the guitar that fits how you play.'
  ---

  Relay is an electric guitar you print at home on a conventional FDM 3D printer. Every model shares the same double-cut body — three pickup cavities, 24.75" scale length, the same hardware mounting points. What makes each model different is what you put inside: pickup selection, wiring, and selector strategy.

  Building a Relay guitar is a real project. Plan on a few weekends and $200–$400 in parts depending on the model you choose. The result is a playable, giggable instrument you understand completely — because you built it.

  ## The platform

  - **One body.** Pickup ring adapters bridge the gap between the body's humbucker-sized cavities and smaller pickup formats like lipstick and P90. You print one body, wire it for whichever model you're building.
  - **24.75" scale.** Les Paul scale length — slightly lower tension than a Strat, slightly warmer tone, easier bends. Necks are common and well-priced.
  - **Three pickup cavities.** What changes between models is how those pickups interact. Optional cavity covers are included if you prefer a two-pickup layout.

  ## Selector logic

  Two rules cover all current models:

  - Use a **3-way selector** when the middle pickup is a shaper or augment layer added after the bridge/neck selection.
  - Use a **5-way blade** when the middle pickup is a primary voice or part of a switched subsystem.

  Model pages spell out switch positions and what the controls do.

  ## Voicings

  <RelayVoicingGrid>
      <RelayVoicingCard name="Relay Lipstick" tagline="Humbuckers · Lipstick shaper" genres="Blues · Rock · Alternative · Indie" description="Bridge and neck humbuckers provide the main voices. The middle lipstick reshapes them with contour, texture, and air." status="ready" href="/relay/voicings/lipstick" />
      <RelayVoicingCard name="Relay Reef" tagline="Humbucker · Dual-lipstick subsystem" genres="Indie · Surf · Alt Country · Shoegaze" description="Two separate voice families: a bridge humbucker and an independently controlled dual-lipstick subsystem." status="lab" href="/relay/voicings/reef" />
      <RelayVoicingCard name="Relay Velvet" tagline="Jazz-club center · Controlled warmth" genres="Jazz · Blues · Soul · R&B" description="A middle-primary model for players who put the guitar at the center of a small room: rounded attack, controlled mids, and enough presence to carry the act clean." status="ready" href="/relay/voicings/velvet" />
      <RelayVoicingCard name="Relay Arc" tagline="Open · Spatial · Separated" genres="Clean pop · Indie · Ambient · Country" description="A middle-primary model focused on clarity and separation, especially under delay, reverb, and other effects." status="lab" href="/relay/voicings/arc" />
      <RelayVoicingCard name="Relay Torch" tagline="Punch · Vocal mids · Presence" genres="Rock · Pop · Alternative · Modern country" description="A P90-type middle pickup acts as a primary voice for stronger mids, punch, and front-of-mix presence." status="ready" href="/relay/voicings/torch" />
      <RelayVoicingCard name="Relay Current" tagline="Fast attack · Upper-mid focus" genres="Funk · Pop · Rock" description="A rhythm-first humbucker model with a middle augment layer that tightens lows and sharpens attack without acting like a boost." status="lab" href="/relay/voicings/current" />
      <RelayVoicingCard name="Relay Hammer" tagline="High gain · Rails · Concept" genres="Metal · Hard rock" description="A high-gain concept using rail pickups, aimed at tight low end, saturation, and controlled aggression." status="concept" href="/relay/voicings/hammer" />
  </RelayVoicingGrid>

  ## Community

  The build guides are being written as each model is validated. The Discord server is where questions get answered, builds get shared, and new documentation takes shape based on what people actually find confusing.

  <RelayDiscordCta message="Ask questions, share builds, and follow development as the guides are written." />
  ```

  Note: body prose still uses the word "model" in places (e.g., "Every model shares the same double-cut body"). That's everyday English usage and out of scope for this rename — the spec is renaming the *type and structural noun*, not policing every usage of the word "model" in prose. Leave body copy alone unless it's a direct reference to a "Model" gallery section.

- [ ] **Step 2: Run TypeScript check**

  Run: `npx tsc --noEmit`

  Expected: no errors. If any remain, they will reference symbols that should have been renamed in earlier tasks — go back and fix.

- [ ] **Step 3: Run the linter**

  Run: `npm run lint`

  Expected: no errors.

- [ ] **Step 4: Run the full test suite**

  Run: `npx vitest run`

  Expected: all tests pass. Watch specifically for:
  - `__tests__/config/relay-voicings.test.ts` — voicings config invariants
  - `lib/relay.test.ts` — path resolution + breadcrumbs at new URL shape
  - `components/relay/relay-voicing-overview.test.tsx` — overview rendering
  - `components/relay/relay-voicing-lineup-nav.test.ts` — sort helper

- [ ] **Step 5: Run the production build**

  Run: `npm run build`

  Expected: build succeeds. The build also runs vitest, so this is a belt-and-suspenders check. If the build fails on a Next.js issue (route not found, dynamic param mismatch), it'll surface here.

- [ ] **Step 6: Commit the rename**

  ```bash
  git add -A
  git commit -m "$(cat <<'EOF'
  refactor: rename Model -> Voicing across relay platform

  Pure rename + URL move:
  - types/relay-model.ts -> types/relay-voicing.ts (RelayModel*->RelayVoicing*, modelKey->slug)
  - config/relay-models.ts -> config/relay-voicings.ts
  - components renamed: RelayModelStatusBadge, RelayModelOverview, RelayModelGrid,
    RelayModelCard, RelayModelLineupNav, RelayModelSection, RelayModelPickupChoices
  - URL: /relay/[model] -> /relay/voicings/[slug]
  - Content: content/relay/<slug>/index.mdx -> content/relay/voicings/<slug>/index.mdx
  - MDX frontmatter field: model -> voicing
  - Sidebar headers: "Models" -> "Voicings", "All models" -> "All voicings"

  Status hardcode in homepage gallery is updated to correct values per voicing
  but the prop is still required on RelayVoicingCard; the prop will be removed
  in a follow-up commit that has the card read status from config.
  EOF
  )"
  ```

---

### Task 10: Fix the homepage status-badge hardcode (TDD)

**Files:**
- Modify: `components/doc/relay-voicing-grid.tsx`
- Modify: `content/relay/index.mdx`
- Modify (new test): `components/doc/relay-voicing-grid.test.tsx` (create new file)

The homepage card currently requires every consumer to pass `status` explicitly. That's why the homepage was wrong — the MDX file was hardcoding `status="lab"` instead of looking up the real status. The fix: make `RelayVoicingCard` look up the status from the voicings config by slug, derived from the `href` (or pass an explicit `slug`). Then remove the `status` prop entirely from the homepage's `<RelayVoicingCard>` calls.

- [ ] **Step 1: Write the failing test**

  Create `components/doc/relay-voicing-grid.test.tsx`:

  ```tsx
  import React from 'react';
  import { render, screen } from '@testing-library/react';
  import { describe, expect, it } from 'vitest';
  import '@testing-library/jest-dom/vitest';
  import { RelayVoicingCard } from './relay-voicing-grid';

  describe('RelayVoicingCard', () => {
      it('renders the Ready badge for a voicing whose config status is ready', () => {
          render(
              <RelayVoicingCard
                  slug="lipstick"
                  name="Relay Lipstick"
                  tagline="Humbuckers · Lipstick shaper"
                  genres="Blues · Rock"
                  description="Reference voicing"
                  href="/relay/voicings/lipstick"
              />,
          );

          expect(screen.getByText('Ready')).toBeInTheDocument();
      });

      it('renders the Lab badge for a voicing whose config status is lab', () => {
          render(
              <RelayVoicingCard
                  slug="reef"
                  name="Relay Reef"
                  tagline="Humbucker · Dual-lipstick"
                  genres="Indie · Surf"
                  description="Reef voicing"
                  href="/relay/voicings/reef"
              />,
          );

          expect(screen.getByText('Lab')).toBeInTheDocument();
      });

      it('renders the Concept badge for a voicing whose config status is concept', () => {
          render(
              <RelayVoicingCard
                  slug="hammer"
                  name="Relay Hammer"
                  tagline="High gain · Rails"
                  genres="Metal"
                  description="Hammer voicing"
                  href="/relay/voicings/hammer"
              />,
          );

          expect(screen.getByText('Concept')).toBeInTheDocument();
      });
  });
  ```

- [ ] **Step 2: Run the test to verify it fails**

  Run: `npx vitest run components/doc/relay-voicing-grid.test.tsx`

  Expected: FAIL — the current `RelayVoicingCard` requires a `status` prop, so the new tests fail with TypeScript errors or a missing badge. The exact failure mode varies; the key is the test must fail before implementing the fix.

- [ ] **Step 3: Update `RelayVoicingCard` to read status from config**

  Replace `components/doc/relay-voicing-grid.tsx` with:

  ```tsx
  import React from 'react';
  import Link from 'next/link';
  import { cn } from '@/lib/utils';
  import { RelayVoicingStatusBadge } from '@/components/relay/relay-voicing-status-badge';
  import { relayVoicings } from '@/config/relay-voicings';

  interface RelayVoicingCardProps {
      slug: string;
      name: string;
      tagline: string;
      genres: string;
      description: string;
      href?: string;
  }

  export function RelayVoicingCard({ slug, name, tagline, genres, description, href }: RelayVoicingCardProps) {
      const voicing = relayVoicings.find((v) => v.slug === slug);
      const status = voicing?.status;

      const inner = (
          <div className={cn('flex h-full flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all', href && 'group-hover:border-sky-500 group-hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]')}>
              <div className="flex items-start justify-between gap-2">
                  <h3 className={cn('font-semibold text-foreground', href && 'transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400')}>{name}</h3>
                  {status && <RelayVoicingStatusBadge status={status} />}
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

  export function RelayVoicingGrid({ children }: { children: React.ReactNode }) {
      return <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
  }
  ```

  Key changes from Task 5 Step 6:
  - New required prop: `slug: string`
  - Removed prop: `status: RelayVoicingStatus`
  - Internal lookup via `relayVoicings.find((v) => v.slug === slug)`
  - Badge wrapped in `{status && ...}` — if a future card uses an unknown slug, it renders without a badge instead of crashing

- [ ] **Step 4: Run the new test to verify it passes**

  Run: `npx vitest run components/doc/relay-voicing-grid.test.tsx`

  Expected: PASS on all three test cases.

- [ ] **Step 5: Update the homepage MDX to use the new prop**

  In `content/relay/index.mdx`, each `<RelayVoicingCard>` call currently has `status="..."`. Remove that prop and add a `slug="..."` prop with the voicing slug. The seven calls become:

  ```mdx
  <RelayVoicingCard slug="lipstick" name="Relay Lipstick" tagline="Humbuckers · Lipstick shaper" genres="Blues · Rock · Alternative · Indie" description="Bridge and neck humbuckers provide the main voices. The middle lipstick reshapes them with contour, texture, and air." href="/relay/voicings/lipstick" />
  <RelayVoicingCard slug="reef" name="Relay Reef" tagline="Humbucker · Dual-lipstick subsystem" genres="Indie · Surf · Alt Country · Shoegaze" description="Two separate voice families: a bridge humbucker and an independently controlled dual-lipstick subsystem." href="/relay/voicings/reef" />
  <RelayVoicingCard slug="velvet" name="Relay Velvet" tagline="Jazz-club center · Controlled warmth" genres="Jazz · Blues · Soul · R&B" description="A middle-primary model for players who put the guitar at the center of a small room: rounded attack, controlled mids, and enough presence to carry the act clean." href="/relay/voicings/velvet" />
  <RelayVoicingCard slug="arc" name="Relay Arc" tagline="Open · Spatial · Separated" genres="Clean pop · Indie · Ambient · Country" description="A middle-primary model focused on clarity and separation, especially under delay, reverb, and other effects." href="/relay/voicings/arc" />
  <RelayVoicingCard slug="torch" name="Relay Torch" tagline="Punch · Vocal mids · Presence" genres="Rock · Pop · Alternative · Modern country" description="A P90-type middle pickup acts as a primary voice for stronger mids, punch, and front-of-mix presence." href="/relay/voicings/torch" />
  <RelayVoicingCard slug="current" name="Relay Current" tagline="Fast attack · Upper-mid focus" genres="Funk · Pop · Rock" description="A rhythm-first humbucker model with a middle augment layer that tightens lows and sharpens attack without acting like a boost." href="/relay/voicings/current" />
  <RelayVoicingCard slug="hammer" name="Relay Hammer" tagline="High gain · Rails · Concept" genres="Metal · Hard rock" description="A high-gain concept using rail pickups, aimed at tight low end, saturation, and controlled aggression." href="/relay/voicings/hammer" />
  ```

- [ ] **Step 6: Run all tests and lint to confirm nothing else broke**

  Run: `npx vitest run && npm run lint`

  Expected: all tests pass, no lint errors.

- [ ] **Step 7: Run the production build**

  Run: `npm run build`

  Expected: build succeeds.

- [ ] **Step 8: Commit the bug fix**

  ```bash
  git add components/doc/relay-voicing-grid.tsx components/doc/relay-voicing-grid.test.tsx content/relay/index.mdx
  git commit -m "$(cat <<'EOF'
  fix: read voicing status from config in homepage card

  RelayVoicingCard was accepting status as a prop, which let the homepage
  hardcode it incorrectly (every card was Lab regardless of actual status).
  The card now takes a voicing slug, looks up the voicing in
  relayVoicings, and renders the badge from config truth.
  EOF
  )"
  ```

---

### Task 11: Push the branch and open the pull request

**Files:** none modified.

The branch is `docs/relay-platform-revision`. Per project memory, push and open a PR after each phase completes to trigger the CI/CD staging build.

- [ ] **Step 1: Push the branch**

  Run: `git push`

  Expected: success — both new commits are uploaded.

- [ ] **Step 2: Open the pull request**

  Run:
  ```bash
  gh pr create --title "refactor: rename Model -> Voicing across relay platform (PR 1 of 3)" --body "$(cat <<'EOF'
  ## Summary

  - Renames `Model` -> `Voicing` across types, config, components, content, routes, and tests
  - URL move: `/relay/[model]` -> `/relay/voicings/[slug]`
  - Content move: `content/relay/<slug>/index.mdx` -> `content/relay/voicings/<slug>/index.mdx`
  - Bug fix: `RelayVoicingCard` reads status from config instead of accepting it as a prop, so the homepage gallery now shows correct Concept/Lab/Ready badges per voicing

  This is PR 1 of 3 from the `2026-05-07-relay-platform-revision-design.md` spec. Pure refactor + one targeted bug fix; no new pages or behavior.

  ## Test plan

  - [ ] CI staging build deploys successfully
  - [ ] Visit `/relay` — verify the seven voicing cards render with correct status badges (Lipstick/Velvet/Torch = Ready, Reef/Arc/Current = Lab, Hammer = Concept)
  - [ ] Visit `/relay/voicings/lipstick` — verify the page renders, sidebar shows "All voicings", breadcrumb is correct
  - [ ] Visit `/relay/voicings/reef` — verify Lab callout renders above the overview
  - [ ] Visit `/relay/voicings/hammer` — verify Concept callout renders
  - [ ] Verify links from the homepage gallery to voicing pages all resolve (no 404s)

  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  EOF
  )"
  ```

  Expected: a URL is printed pointing to the new PR.

- [ ] **Step 3: Report the PR URL back to the user**

  Print the PR URL from Step 2's output for easy access.

---

## Self-Review Checklist

After completing all tasks, verify:

- [ ] **Spec coverage:** Every item from `2026-05-07-relay-platform-revision-design.md` Section 10 PR #1 scope is covered:
  - Types renamed (Task 2) ✓
  - Files renamed (Tasks 2–5) ✓
  - Components renamed (Tasks 5–6) ✓
  - `lib/relay.ts` paths updated (Task 4) ✓
  - Route moved (Task 7) ✓
  - `mdx-components.tsx` updated (Task 6) ✓
  - `content/relay/index.mdx` and per-voicing MDX updated (Tasks 8, 9) ✓
  - Status hardcode fixed (Task 10) ✓
- [ ] **No placeholders:** all code blocks contain actual code; all commands include exact paths and expected outputs.
- [ ] **Type consistency:** every reference to `RelayVoicing`, `RelayVoicingStatus`, `slug`, `voicing`, `voicingSlug`, etc. matches across tasks. The card prop is `slug` (Task 10), the overview prop is `voicingSlug` (Task 5), the route param is `slug` (Task 7), and frontmatter is `voicing` (Tasks 4, 8). Mixed naming is intentional (each name is contextual: `slug` is a string identifier, `voicingSlug` clarifies role in a function signature with multiple slugs, `voicing` in frontmatter is the natural noun for that scope).
- [ ] **Validation:** end of Task 9 confirms typecheck + lint + tests + build pass after the rename. Task 10 step 6/7 confirms again after the bug fix.
