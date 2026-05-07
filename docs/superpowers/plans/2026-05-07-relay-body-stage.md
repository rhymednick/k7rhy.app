# Relay `/relay/body` Body-Stage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/relay/body` long-form body-stage guide and its `/relay/body/parts` parts list, ship a new `RelayDownloadCallout` component pointing at the existing repo-hosted body files, and flip the `body` stage in `config/relay-build-process.ts` from `'in-progress'` → `'live'` so the homepage card and sidebar surface the page as a live destination. PR 3 of 3 from `docs/superpowers/specs/2026-05-07-relay-platform-revision-design.md`.

**Architecture:** The body page is a long-scroll guide built around the existing MDX pipeline (`content/relay/body/index.mdx` → `app/relay/body/page.tsx`, both already in place from PR 2). PR 3 replaces the in-progress placeholder content with the full Section 5 structure (download callout → overview → print settings → printing → bonding → clamping & cure → finishing → what's next), introduces a new `RelayDownloadCallout` component for the prominent files block, and adds the `/relay/body/parts` parts page. Specific technical values (exact print settings, time estimates, step sequences) ship as clearly-marked author-fillable callouts so the page is functional and link-checkable from this PR while leaving the technical fill-in for review-time editing. Flipping the `body` stage status from `'in-progress'` → `'live'` in `config/relay-build-process.ts` updates both the homepage `RelayProcessOverview` card and the sidebar `BuildStageRow` simultaneously.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, React 19, Vitest, React Testing Library, Tailwind, MDX via `next-mdx-remote/rsc`, K7RHY voice (first-person singular — "I/me/my", never "we/us/our").

---

## Pre-flight

The branch `docs/relay-body` will be created off `main` (which has PR #1 and PR #2's restructure merged in). All 99 tests pass on main as of commit `2413f40`. The branch starts clean.

**Resolved scope decisions:**

- **Content scope.** Per spec Section 5 the body page is a long-form guide with eight ordered sections. The author (Rhy) will fill in physical-build specifics interactively after the page structure ships. So this plan writes:
  - **Real first-person prose** for everything that doesn't depend on physical-build specifics: download callout, overview ("what you'll do, what success looks like"), section intros, "What's next" pivot, and the body-builds Discord callout.
  - **Author-fillable `<DocAlert variant="info">` blocks** that flag what each technical section needs. Every block uses the literal string `[AUTHOR FILL-IN]` as a sentinel so a future grep can find them. The blocks are styled identically to other docs callouts and don't break the page.
  - The `/relay/body/parts` page lists the **shared body-stage consumables** (filament, epoxy, sandpaper, finish materials) and reuses the `BomItem` / `BomSection` components already in the codebase. Hardware/electronics/voicing-specific parts stay on voicing pages — this list is just what's needed to print + bond + finish a body.
- **Download callout component.** The new `RelayDownloadCallout` is a thin wrapper around `DownloadGroup` (already exists, already does multi-file ZIP via `/api/download-zip`). It adds the accent border + "Files & downloads" framing the spec calls for, plus a `sources` prop shape that supports the future MakerWorld-exclusive case the spec section 12 flagged (`sources: [{ kind: 'repo', files: [...] }, { kind: 'makerworld', href: '...' }]`). At launch, the only source is `'repo'` and we render the existing `DownloadGroup`. When non-repo sources are added later it's a config change.
- **Body files.** The existing `/public/downloads/K7RHY Santana - {Body,Cap,Accessories}.3mf` files are the body files. The `Santana` filename is a holdover; renaming the public files is out of scope for PR 3 — we surface them under `Relay Body — Print files` framing, label-only.
- **`body` stage flip.** The flip from `'in-progress'` → `'live'` happens in this PR, after the page content lands but before the PR is opened. The homepage hero `RelayHero` already routes its "Download body files" CTA to `/relay/body` via the build-process config; flipping status will not change the CTA target — it stays the in-site page. The Discord-link branch in `RelayHero` only triggered when the stage was Discord-targeted; with status Live + an in-site `href`, the CTA renders as an internal link without `target="_blank"`.
- **Discord channel callout on `/relay/body`.** Reuses the existing `RelayDiscordCta` component (already accepts a `message` prop). Spec asks for "#body-builds" framing. We pass `message="Building? Share progress in Discord — I'm collecting feedback as the body process gets validated by more printers."` since the per-channel deeplink is still pending Discord-side configuration (per memory).
- **Legacy file deletion.** Spec Section 10 says "delete legacy `content/relay/{printing, build}/` files in this PR or a follow-up cleanup". This plan deletes them in this PR — it's the cleanest atomic transition. Files removed: `content/relay/printing/{overview,parameters,customization,build-expectations,choose-model,bom}.mdx` and `content/relay/build/body.mdx`. The other legacy directories (`content/relay/{setup,electronics,lipstick}`) stay untouched; spec Section 9 lists them but they're not in PR 3's scope.

Commands referenced throughout:

- Run all tests: `npx vitest run`
- Run a single test file: `npx vitest run path/to/file.test.ts`
- Lint: `npm run lint`
- Build (runs tests first): `npm run build`
- Dev server: `npm run dev` (used in Task 12 for manual smoke test)

The full test suite must pass at the end of every commit. Aim for one logical commit per task.

---

### Task 1: Verify baseline and create the branch

**Files:** none modified.

- [ ] **Step 1: Confirm working tree is clean and on main**

  Run: `git status && git branch --show-current`

  Expected: `nothing to commit, working tree clean`, `main`.

- [ ] **Step 2: Pull latest from origin**

  Run: `git pull --ff-only origin main`

  Expected: `Already up to date.` or a clean fast-forward.

- [ ] **Step 3: Confirm baseline tests pass**

  Run: `npx vitest run`

  Expected: all tests pass (was 99/99 at commit `2413f40`). If any fail, stop and investigate before starting.

- [ ] **Step 4: Confirm baseline lint is clean**

  Run: `npm run lint`

  Expected: no warnings or errors.

- [ ] **Step 5: Create the feature branch**

  Run: `git checkout -b docs/relay-body`

  Expected: `Switched to a new branch 'docs/relay-body'`.

---

### Task 2: Add `RelayDownloadCallout` types and tests (TDD)

**Files:**

- Create: `components/relay/relay-download-callout.tsx`
- Create: `components/relay/relay-download-callout.test.tsx`

This is the new component the spec calls out. It renders an accent-bordered downloads block at the top of the body page. It accepts a `sources` array shaped to support the future MakerWorld-exclusive case (a single `'makerworld'` source replacing the `'repo'` one) without rewriting consumers — that's the explicit forward-compat goal in spec Section 12.

The component is a thin presentational wrapper. For the `'repo'` source kind it renders the existing `DownloadGroup`. For non-repo sources (added later) it renders a single accented external link card. We unit-test both paths now so the future config change can't silently regress.

- [ ] **Step 1: Write the failing test**

  Create `components/relay/relay-download-callout.test.tsx`:

  ```tsx
  import React from 'react';
  import { render, screen } from '@testing-library/react';
  import { describe, expect, it } from 'vitest';
  import '@testing-library/jest-dom/vitest';
  import { RelayDownloadCallout } from './relay-download-callout';

  describe('RelayDownloadCallout', () => {
      it('renders the heading and description', () => {
          render(
              <RelayDownloadCallout
                  title="Relay Body — Print files"
                  description="Three 3MF files. Print all three to build one body."
                  sources={[
                      {
                          kind: 'repo',
                          name: 'relay-body-files',
                          files: [
                              { href: '/downloads/K7RHY Santana - Body.3mf', label: 'Body' },
                              { href: '/downloads/K7RHY Santana - Cap.3mf', label: 'Cap' },
                          ],
                      },
                  ]}
              />,
          );
          expect(screen.getByText('Relay Body — Print files')).toBeInTheDocument();
          expect(screen.getByText(/three 3mf files/i)).toBeInTheDocument();
      });

      it('renders an accent-bordered container (testable via data attribute)', () => {
          const { container } = render(
              <RelayDownloadCallout
                  title="x"
                  description="y"
                  sources={[{ kind: 'repo', name: 'n', files: [{ href: '/downloads/K7RHY Santana - Body.3mf', label: 'Body' }] }]}
              />,
          );
          const root = container.querySelector('[data-relay-download-callout]');
          expect(root).not.toBeNull();
      });

      it('renders each file as a download link for the repo source', () => {
          render(
              <RelayDownloadCallout
                  title="x"
                  description="y"
                  sources={[
                      {
                          kind: 'repo',
                          name: 'n',
                          files: [
                              { href: '/downloads/K7RHY Santana - Body.3mf', label: 'Body' },
                              { href: '/downloads/K7RHY Santana - Cap.3mf', label: 'Cap' },
                          ],
                      },
                  ]}
              />,
          );
          // DownloadGroupFile renders a link with title "Download <label>"
          expect(screen.getByTitle('Download Body')).toBeInTheDocument();
          expect(screen.getByTitle('Download Cap')).toBeInTheDocument();
      });

      it('renders an external link card for a non-repo source', () => {
          render(
              <RelayDownloadCallout
                  title="x"
                  description="y"
                  sources={[
                      { kind: 'makerworld', label: 'MakerWorld', href: 'https://makerworld.example/relay-body' },
                  ]}
              />,
          );
          const link = screen.getByRole('link', { name: /makerworld/i });
          expect(link).toHaveAttribute('href', 'https://makerworld.example/relay-body');
          expect(link).toHaveAttribute('target', '_blank');
      });
  });
  ```

- [ ] **Step 2: Run the test and verify it fails**

  Run: `npx vitest run components/relay/relay-download-callout.test.tsx`

  Expected: FAIL — `Cannot find module './relay-download-callout'`.

- [ ] **Step 3: Implement the component**

  Create `components/relay/relay-download-callout.tsx`:

  ```tsx
  import React from 'react';
  import Link from 'next/link';
  import { ExternalLink } from 'lucide-react';
  import { cn } from '@/lib/utils';
  import { DownloadGroup } from '@/components/doc/download-files';

  interface RelayDownloadFile {
      href: string;
      label: string;
  }

  interface RepoSource {
      kind: 'repo';
      name: string;
      files: RelayDownloadFile[];
  }

  interface ExternalSource {
      kind: 'makerworld' | 'thingiverse' | 'printables' | 'other';
      label: string;
      href: string;
      description?: string;
  }

  type RelayDownloadSource = RepoSource | ExternalSource;

  interface RelayDownloadCalloutProps {
      title: string;
      description: string;
      sources: RelayDownloadSource[];
  }

  export function RelayDownloadCallout({ title, description, sources }: RelayDownloadCalloutProps) {
      return (
          <div
              data-relay-download-callout
              className={cn('my-6 rounded-xl border-2 border-sky-500/40 bg-sky-500/5 p-5', 'shadow-[0_2px_10px_rgba(14,165,233,0.08)]')}
          >
              <div className="mb-3">
                  <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
              <div className="space-y-3">
                  {sources.map((source, index) => (
                      <RelayDownloadSourceRender key={index} source={source} />
                  ))}
              </div>
          </div>
      );
  }

  function RelayDownloadSourceRender({ source }: { source: RelayDownloadSource }) {
      if (source.kind === 'repo') {
          return (
              <DownloadGroup
                  title="Hosted in this repo"
                  description="Direct download — no third-party account needed."
                  name={source.name}
                  files={source.files}
              />
          );
      }
      return (
          <Link
              href={source.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                  'flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 transition-colors',
                  'hover:border-sky-500 hover:bg-sky-500/5',
              )}
          >
              <div className="min-w-0">
                  <p className="text-sm font-semibold">{source.label}</p>
                  {source.description && <p className="mt-0.5 text-xs text-muted-foreground">{source.description}</p>}
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
      );
  }
  ```

- [ ] **Step 4: Run the test and verify it passes**

  Run: `npx vitest run components/relay/relay-download-callout.test.tsx`

  Expected: PASS — all four test cases.

- [ ] **Step 5: Commit**

  ```bash
  git add components/relay/relay-download-callout.tsx components/relay/relay-download-callout.test.tsx
  git commit -m "feat(relay): add RelayDownloadCallout component"
  ```

---

### Task 3: Register `RelayDownloadCallout` in MDX components

**Files:**

- Modify: `components/mdx-components.tsx`

The new component must be exposed to MDX so the body page can use it.

- [ ] **Step 1: Add the import**

  In `components/mdx-components.tsx`, after the line:

  ```typescript
  import { RelayProcessOverview } from '@/components/relay/relay-process-overview';
  ```

  Add:

  ```typescript
  import { RelayDownloadCallout } from '@/components/relay/relay-download-callout';
  ```

- [ ] **Step 2: Register the component in the `components` object**

  In the same file, find the line:

  ```typescript
      RelayProcessOverview,
  ```

  And add immediately after it:

  ```typescript
      RelayDownloadCallout,
  ```

- [ ] **Step 3: Confirm typecheck and lint pass**

  Run: `npx tsc --noEmit && npm run lint`

  Expected: no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add components/mdx-components.tsx
  git commit -m "feat(relay): register RelayDownloadCallout in MDX components"
  ```

---

### Task 4: Build the `/relay/body` long-form page content

**Files:**

- Modify: `content/relay/body/index.mdx`

This replaces the placeholder content with the full Section 5 structure. Section ordering matters — `PageNavigation` (auto-TOC) walks `h2`/`h3` in document order to build the floating nav. All copy is K7RHY voice (first-person singular). Every author-fillable block uses the literal string `[AUTHOR FILL-IN]` as a sentinel.

- [ ] **Step 1: Replace `content/relay/body/index.mdx` with the full guide**

  Replace the file contents with:

  ```mdx
  ---
  title: 'Body'
  description: 'Print, bond, cure, and finish the shared Relay Guitar body. Stage 1 of 3 — every voicing starts here.'
  ---

  Stage 1 of 3 of the Relay Guitar build. The body is the same regardless of which voicing you eventually wire up, so this is the part of the build you can start before deciding on a voicing. The recommended flow is the other way around — pick a voicing first so parts can ship while the body prints — but if you already know you want to build a Relay, nothing here gates on that choice.

  <RelayDownloadCallout
      title="Relay Body — Print files"
      description="Three 3MF files. Print all three to make one complete body. Same parts for every voicing."
      sources={[
          {
              kind: 'repo',
              name: 'relay-body-print-files',
              files: [
                  { href: '/downloads/K7RHY Santana - Body.3mf', label: 'Body' },
                  { href: '/downloads/K7RHY Santana - Cap.3mf', label: 'Cap' },
                  { href: '/downloads/K7RHY Santana - Accessories.3mf', label: 'Accessories' },
              ],
          },
      ]}
  />

  Parts list for filament, adhesive, and finishing supplies → [Body parts list](/relay/body/parts).

  ## Overview

  By the end of this stage, I'll have a printed, bonded, cured, sanded body ready for the voicing-specific work in stage 2. Concretely, that means:

  - Three printed parts (Body, Cap, Accessories) in a structurally appropriate filament.
  - Two halves bonded into one body with adhesive that can survive sustained string tension.
  - A 24-hour cure window that lets the bond reach full strength before any hardware goes near the body.
  - A surface that's been cleaned of bond squish-out, sanded flat, and either sealed or left bare PETG depending on the look I want.

  Success looks like a body that sits flat on a bench, has clean joint lines with no gaps, and rings when I tap it — meaning the bond is solid and there are no internal voids from incomplete curing.

  ## Print settings

  These are the settings I run on my own printer. They're a starting point if you're on the same printer/material; if you're on something different, treat the table as a baseline and tune from there.

  <DocAlert variant="info" title="[AUTHOR FILL-IN] — Print settings table">
      Replace this block with the pill-grid of layer height, walls, top/bottom layers, infill pattern + density, print speed, nozzle/bed temp, cooling. Note material (PET-CF / PET-GF / PETG) and any first-layer or brim guidance. Per spec section 5: "Grid of pill values."
  </DocAlert>

  ### Material

  <DocAlert variant="info" title="[AUTHOR FILL-IN] — Material decision">
      Replace this block with the recommended filament(s), why (dimensional stability under string tension, layer adhesion under stress), and the explicit don't-use list (PLA, standard PETG for the neck pocket area). Reuse the technical reasoning from the legacy `content/relay/printing/overview.mdx` only as a structural reference — verify each claim before publishing.
  </DocAlert>

  ### Orientation and supports

  <DocAlert variant="info" title="[AUTHOR FILL-IN] — Orientation, supports, bed adhesion">
      Replace this block with: per-part orientation (which face down for each of Body / Cap / Accessories), support placement, support removal notes, bed adhesion (textured PEI behavior, brim guidance), and any first-layer flatness considerations that matter for the bonding step.
  </DocAlert>

  ## Printing the parts

  ### Print order

  <DocAlert variant="info" title="[AUTHOR FILL-IN] — Print order and time estimates">
      Replace this block with the recommended order to start the three prints (which to print first if I'm going to assemble while the others print, total time per part, total stage time).
  </DocAlert>

  ### Common failure modes

  These are the things I watch for during and after the print. Catching them early saves a re-print.

  <DocAlert variant="info" title="[AUTHOR FILL-IN] — Failure modes">
      Replace this block with the specific things to watch for: warping (where, why), layer delamination (where it shows up first), elephant foot (and how it affects bond surfaces), under-extrusion in walls, support scarring on surfaces that need to bond. For each, what to do — re-print, or salvageable with sanding.
  </DocAlert>

  ### Inspecting before bonding

  Once each part has cooled and stabilized, I check it before reaching for adhesive. The bonding step is permanent; it's much cheaper to discover a problem with the print here than to find out after curing.

  <DocAlert variant="info" title="[AUTHOR FILL-IN] — Pre-bond inspection checklist">
      Replace this block with the checklist: flatness of mating surfaces, dimensional spot-checks (any specific calipers on neck-pocket dimensions or the bridge mount?), visible voids/cracks, layer adhesion test (can you flex the wall and see splitting?). Include "if X, sand to recover; if Y, re-print" calls for each.
  </DocAlert>

  ## Bonding the body

  This is the irreversible step. Once the adhesive cures, the body is one piece — a misalignment here means re-printing, not re-doing.

  ### Adhesive

  <DocAlert variant="info" title="[AUTHOR FILL-IN] — Adhesive choice and reasoning">
      Replace this block with the specific adhesive I use (legacy spec mentions G/Flex 650 — verify before committing). Why this one specifically (slight flex when cured, handles vibration, doesn't go brittle). What not to use (rigid epoxy). Working time, full cure time. Mixing notes if any.
  </DocAlert>

  ### Surface prep

  <DocAlert variant="info" title="[AUTHOR FILL-IN] — Surface prep">
      Replace this block with the surface-prep procedure: light sanding of mating surfaces with what grit, dry-fit before any adhesive is mixed, cleaning step (alcohol wipe?), masking surfaces I want to keep clean.
  </DocAlert>

  ### Alignment and joining sequence

  <DocAlert variant="info" title="[AUTHOR FILL-IN] — Alignment & joining sequence">
      Replace this block with the order of operations: which mating surfaces get adhesive, in what order, which alignment features I use to register the parts, the working time I have before adhesive starts to set. Include the two critical alignments (neck pocket angle, bridge mount position) — how to check each.
  </DocAlert>

  ## Clamping and cure

  <DocAlert variant="info" title="[AUTHOR FILL-IN] — Clamp pattern + 24h cure">
      Replace this block with: the specific clamp pattern (where each clamp goes, how much pressure), what improvised clamps work if you don't have purpose-made ones, total clamp-on time, total full-cure time before I can take pressure off (spec calls 24h). Include a note about temperature and humidity if either matters for cure.
  </DocAlert>

  ## Finishing

  Three finishing steps, in order. Step 3 is optional — bare PETG-CF/GF is a perfectly valid final finish, and skipping seal/paint is what I'd recommend for a first build.

  ### 1. Squish-out cleanup

  <DocAlert variant="info" title="[AUTHOR FILL-IN] — Squish-out cleanup">
      Replace this block with: when to clean up (during cure when adhesive is still soft? after full cure with a chisel?), tools, what surfaces matter most for follow-on hardware fit.
  </DocAlert>

  ### 2. Sand the body

  <DocAlert variant="info" title="[AUTHOR FILL-IN] — Sanding">
      Replace this block with: grit progression (coarse → fine, what grits), areas that get more attention (joint lines, edges), areas to leave alone (cavities, mounting holes), how to know I'm done. Include sanding block / power-sanding guidance.
  </DocAlert>

  ### 3. Optional: paint or seal

  Bare PET-CF / PET-GF looks intentionally industrial and stands up fine to playing wear — many builds end here. If I want a different look, this is where it happens.

  <DocAlert variant="info" title="[AUTHOR FILL-IN] — Optional finish">
      Replace this block with: paint workflow (primer? specific paint chemistries that bond to filled PET?), seal workflow (clear coat? oil?), how either affects feel against the body, and any "definitely don't" calls (e.g. solvents that attack the substrate).
  </DocAlert>

  ## What's next

  At this point the body is one fully-cured piece, sanded and either sealed or bare. From here, the build picks up at the voicing I chose:

  - **Pick a voicing** if I haven't already → [Voicings](/relay/voicings)
  - **Order voicing-specific parts** if I haven't already (each voicing has its own pickup, switching, and control set; lead times vary)
  - **Move to stage 3** once I have parts in hand → [Assembly](/relay/assembly)

  The body itself is ready to receive hardware as soon as the cure window is up — there's no separate "wait" step beyond what's already happened.

  <RelayDiscordCta
      message="Building the body? Share progress, post failure modes, and ask questions — I'm collecting feedback as more printers run through this stage."
  />
  ```

- [ ] **Step 2: Confirm the page builds and renders**

  Run: `npm run build`

  Expected: build succeeds (this also runs the test suite). MDX errors point at the line; fix and re-run.

- [ ] **Step 3: Commit**

  ```bash
  git add content/relay/body/index.mdx
  git commit -m "feat(relay): write /relay/body long-form guide content"
  ```

---

### Task 5: Add the `/relay/body/parts` route handler

**Files:**

- Create: `app/relay/body/parts/page.tsx`
- Create: `lib/relay.ts` modification — extend the existing `loadRelayPlatformSectionPage` flow if needed (it already accepts arbitrary slug arrays, so no change is expected)

The parts page is a static MDX page rendered through the platform section loader that PR 2 introduced. The route handler mirrors `/relay/body/page.tsx` but loads from the `body/parts` segment.

- [ ] **Step 1: Confirm `loadRelayPlatformSectionPage` already supports the new path**

  Run: `grep -n loadRelayPlatformSectionPage /Users/rhy/Projects/k7rhy_app/lib/relay.ts`

  Expected output includes a line defining the function and a line where it joins `path.join(process.cwd(), 'content', 'relay', ...slug)`. No code change is required — the function already accepts arbitrary slug segments.

- [ ] **Step 2: Create the route handler**

  Create `app/relay/body/parts/page.tsx`:

  ```tsx
  import React from 'react';
  import { MDXRemote } from 'next-mdx-remote/rsc';
  import remarkGfm from 'remark-gfm';
  import components from '@/components/mdx-components';
  import { DocPage } from '@/components/doc/doc-page';
  import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
  import { loadRelayPlatformSectionPage } from '@/lib/relay';

  export async function generateMetadata() {
      try {
          const { frontmatter } = loadRelayPlatformSectionPage(['body', 'parts']);
          return {
              title: `${frontmatter.title} | K7RHY`,
              description: frontmatter.description,
              openGraph: { title: frontmatter.title, description: frontmatter.description },
          };
      } catch {
          return {};
      }
  }

  export default async function RelayBodyPartsPage() {
      const { content, frontmatter } = loadRelayPlatformSectionPage(['body', 'parts']);
      const breadcrumbs = [
          { label: 'Relay Guitar', href: '/relay' },
          { label: 'Body', href: '/relay/body' },
          { label: 'Parts' },
      ];
      return (
          <DocPage title={frontmatter.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
              <MDXRemote source={content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
          </DocPage>
      );
  }
  ```

- [ ] **Step 3: Confirm typecheck and lint pass**

  Run: `npx tsc --noEmit && npm run lint`

  Expected: no errors. Build will fail until Task 6 creates the MDX file, but typecheck + lint pass on the route alone.

- [ ] **Step 4: Commit**

  ```bash
  git add app/relay/body/parts/page.tsx
  git commit -m "feat(relay): add /relay/body/parts route handler"
  ```

---

### Task 6: Write the `/relay/body/parts` MDX content

**Files:**

- Create: `content/relay/body/parts.mdx`

The body parts page lists the consumables for the body stage: filament, adhesive, sandpaper grit progression, optional finish materials. Hardware (bridge, tuners, neck plate, jack) lives on voicing pages and assembly — not here. The page reuses `BomSection` / `BomItem` (already in the MDX components, already used elsewhere in the site).

The `BomItem` component requires an `itemKey` (for Amazon price caching) and a `fallback` price string. For author-fill items where the specific link isn't yet decided, we use a `[AUTHOR FILL-IN]` placeholder source URL and a fallback like `'$—'`. The page is functional from launch; specific items get their real links and price caches in follow-up edits.

- [ ] **Step 1: Create the MDX file**

  Create `content/relay/body/parts.mdx`:

  ```mdx
  ---
  title: 'Body parts'
  description: 'Filament, adhesive, sanding, and finishing supplies needed for the Relay Guitar body stage. Same parts for every voicing.'
  ---

  Everything I need to print, bond, and finish a Relay body. This list is voicing-independent — every Relay starts with the same body, so the consumables here are shared regardless of which voicing I'm building toward.

  Voicing-specific parts (pickups, switches, pots, jacks, bridge, tuners) live on each voicing page and on the [voicings parts list](/relay/voicings) (coming soon).

  ## Filament

  <BomSection>
      <BomItem
          title="PET-CF or PET-GF (2 spools)"
          href="https://example.com/[AUTHOR FILL-IN]"
          source="[AUTHOR FILL-IN]"
          itemKey="relay-body-filament-petcf"
          fallback="$—"
          specific
      >
          Two spools cover one full body in PET-CF or PET-GF. Standard PETG is **not** a substitute for the structural parts.
      </BomItem>
  </BomSection>

  <DocAlert variant="info" title="[AUTHOR FILL-IN] — Filament item details">
      Replace the BomItem above with the specific filament I use (brand, color choice, whether 2 spools is exact or a buffer), and either remove `[AUTHOR FILL-IN]` once the affiliate link and itemKey are in place, or replace `specific` with a `substitution="..."` if there's a verified flexible substitute.
  </DocAlert>

  ## Adhesive

  <BomSection>
      <BomItem
          title="Structural epoxy"
          href="https://example.com/[AUTHOR FILL-IN]"
          source="[AUTHOR FILL-IN]"
          itemKey="relay-body-adhesive"
          fallback="$—"
          specific
      >
          One unit covers a single body bond with margin. Pick something that stays slightly flexible when cured; rigid epoxy goes brittle under sustained string tension.
      </BomItem>
  </BomSection>

  <DocAlert variant="info" title="[AUTHOR FILL-IN] — Adhesive item details">
      Replace this BomItem with the specific adhesive (legacy notes mention G/Flex 650 — verify and link). Add the price cache key once it's set up.
  </DocAlert>

  ## Sanding

  <BomSection>
      <BomItem
          title="Sandpaper assortment"
          href="https://example.com/[AUTHOR FILL-IN]"
          source="[AUTHOR FILL-IN]"
          itemKey="relay-body-sandpaper"
          fallback="$—"
      >
          Multi-grit pack covering coarse-through-fine. Specific grits used in the body finishing steps are documented on the [body guide](/relay/body#sand-the-body).
      </BomItem>
      <BomItem
          title="Sanding block"
          href="https://example.com/[AUTHOR FILL-IN]"
          source="[AUTHOR FILL-IN]"
          itemKey="relay-body-sanding-block"
          fallback="$—"
          substitution="Any flat-bottomed block — I just want a stiff backing so I'm not following surface waviness with my fingers."
      >
          Keeps sanding flat across joint lines.
      </BomItem>
  </BomSection>

  <DocAlert variant="info" title="[AUTHOR FILL-IN] — Sanding items">
      Replace these BomItems with the specific brand/grits I use, and verify the substitution copy. The body guide's "Sand the body" section needs to reference the same grits I list here.
  </DocAlert>

  ## Optional: finish

  Skip this section if going with bare PET-CF / PET-GF as the final finish. Both materials look intentionally industrial and hold up fine to playing wear.

  <BomSection>
      <BomItem
          title="Sealer / topcoat (optional)"
          href="https://example.com/[AUTHOR FILL-IN]"
          source="[AUTHOR FILL-IN]"
          itemKey="relay-body-sealer"
          fallback="$—"
          substitution="Any clear or pigmented finish that bonds to filled PET. Test on a printed scrap before committing to the body."
      >
          Only needed if painting or sealing the body. The body guide's [optional finish](/relay/body#3-optional-paint-or-seal) section walks through the trade-offs.
      </BomItem>
  </BomSection>

  <DocAlert variant="info" title="[AUTHOR FILL-IN] — Finish items">
      Replace this BomItem with the specific finish products I'd recommend, or expand to multiple BomItems if there's a primer/paint/clearcoat workflow. Substitution copy is intentionally permissive — verify it matches what I'd actually say.
  </DocAlert>

  <RelayDiscordCta
      message="Have a substitution that worked for you? Share it on Discord — I'll add verified alternates back into this list."
  />
  ```

- [ ] **Step 2: Confirm the page builds**

  Run: `npm run build`

  Expected: build succeeds. Both the body guide and the parts page now render. The build log should show `/relay/body` and `/relay/body/parts` in the prerendered routes.

- [ ] **Step 3: Commit**

  ```bash
  git add content/relay/body/parts.mdx
  git commit -m "feat(relay): write /relay/body/parts list"
  ```

---

### Task 7: Add `Parts` sub-item to the Body stage in the build process config

**Files:**

- Modify: `config/relay-build-process.ts`
- Modify: `__tests__/config/relay-build-process.test.ts` (extend existing test)

The Body stage now has a sub-page (`Parts`) just like Voicings has its seven voicing slugs. We add the `items` array to the body stage so the sidebar surfaces "Parts" as a child link under Body. (The status flip from `'in-progress'` → `'live'` happens in Task 8 — keeping these as separate commits makes the diff easier to review.)

- [ ] **Step 1: Extend the existing config test**

  Open `__tests__/config/relay-build-process.test.ts` and add the following `it` block inside the existing `describe('relayBuildProcess config', ...)`:

  ```typescript
      it('exposes Parts as a sub-item under the Body stage', () => {
          const body = relayBuildProcess.stages.find((s) => s.slug === 'body');
          expect(body).toBeDefined();
          const itemTitles = body!.items?.map((i) => i.title) ?? [];
          expect(itemTitles).toEqual(['Parts']);
          expect(body!.items?.[0].href).toBe('/relay/body/parts');
      });
  ```

- [ ] **Step 2: Run the test and verify it fails**

  Run: `npx vitest run __tests__/config/relay-build-process.test.ts`

  Expected: FAIL — the new assertion fails because `body.items` is currently undefined.

- [ ] **Step 3: Add the `items` array to the body stage**

  In `config/relay-build-process.ts`, find the body stage block:

  ```typescript
          {
              slug: 'body',
              title: 'Body',
              number: 1,
              status: 'in-progress',
              summary: 'Print, bond, cure, and finish the shared double-cut body. Same body for every voicing.',
              href: '/relay/body',
          },
  ```

  Replace it with:

  ```typescript
          {
              slug: 'body',
              title: 'Body',
              number: 1,
              status: 'in-progress',
              summary: 'Print, bond, cure, and finish the shared double-cut body. Same body for every voicing.',
              href: '/relay/body',
              items: [{ title: 'Parts', href: '/relay/body/parts' }],
          },
  ```

- [ ] **Step 4: Run the test and verify it passes**

  Run: `npx vitest run __tests__/config/relay-build-process.test.ts`

  Expected: PASS — all existing tests plus the new one.

- [ ] **Step 5: Commit**

  ```bash
  git add config/relay-build-process.ts __tests__/config/relay-build-process.test.ts
  git commit -m "feat(relay): add Parts sub-item under Body stage"
  ```

---

### Task 8: Flip the Body stage status from `'in-progress'` → `'live'`

**Files:**

- Modify: `config/relay-build-process.ts`
- Modify: `__tests__/config/relay-build-process.test.ts`
- Modify: `components/relay/relay-process-overview.test.tsx`

This is the moment the body card on `/relay` flips from amber "In progress" to emerald "Live", and the sidebar Body row drops its "In progress" tag. No component code changes — the existing `RelayProcessOverview` and `BuildStageRow` already handle Live status.

The existing config test asserts the exact status of each stage. Update it to reflect PR 3's ship state. The existing process-overview component test asserts "In progress" copy on the Body card; update that too.

- [ ] **Step 1: Update the config test's status assertion**

  In `__tests__/config/relay-build-process.test.ts`, find:

  ```typescript
      it('marks Voicings as live, Body as in-progress, Assembly as planned at PR #2 ship time', () => {
          const byslug = Object.fromEntries(relayBuildProcess.stages.map((s) => [s.slug, s.status]));
          expect(byslug).toEqual({
              body: 'in-progress',
              voicings: 'live',
              assembly: 'planned',
          });
      });
  ```

  Replace with:

  ```typescript
      it('marks Body and Voicings as live, Assembly as planned at PR #3 ship time', () => {
          const byslug = Object.fromEntries(relayBuildProcess.stages.map((s) => [s.slug, s.status]));
          expect(byslug).toEqual({
              body: 'live',
              voicings: 'live',
              assembly: 'planned',
          });
      });
  ```

- [ ] **Step 2: Update the process-overview test's CTA copy assertions**

  In `components/relay/relay-process-overview.test.tsx`, find the existing `it('uses non-Discord CTA copy on non-Live cards', ...)` block:

  ```typescript
      it('uses non-Discord CTA copy on non-Live cards', () => {
          render(<RelayProcessOverview />);
          expect(screen.getByText(/follow progress/i)).toBeInTheDocument();
          expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
          expect(screen.getByText(/open voicings guide/i)).toBeInTheDocument();
      });
  ```

  Replace with:

  ```typescript
      it('uses Live CTA copy on Body and Voicings, Planned CTA on Assembly', () => {
          render(<RelayProcessOverview />);
          expect(screen.getByText(/open body guide/i)).toBeInTheDocument();
          expect(screen.getByText(/open voicings guide/i)).toBeInTheDocument();
          expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
      });

      it('renders two Live badges and one Planned badge at PR #3 ship time', () => {
          render(<RelayProcessOverview />);
          expect(screen.getAllByText('Live')).toHaveLength(2);
          expect(screen.getByText('Planned')).toBeInTheDocument();
          expect(screen.queryByText('In progress')).not.toBeInTheDocument();
      });
  ```

  And in the same file, find the existing `it('renders the correct status badge for each stage', ...)` block. Update it to:

  ```typescript
      it('renders status badges that match the current ship state', () => {
          render(<RelayProcessOverview />);
          // PR #3 ship: Body = Live, Voicings = Live, Assembly = Planned
          expect(screen.getAllByText('Live').length).toBeGreaterThanOrEqual(1);
          expect(screen.getByText('Planned')).toBeInTheDocument();
      });
  ```

- [ ] **Step 3: Run the (now-failing) tests**

  Run: `npx vitest run __tests__/config/relay-build-process.test.ts components/relay/relay-process-overview.test.tsx`

  Expected: FAIL — config test fails on the `body: 'live'` assertion; process-overview test fails on the "open body guide" CTA assertion. Both fail because the config still says `'in-progress'`.

- [ ] **Step 4: Flip the status in the config**

  In `config/relay-build-process.ts`, find:

  ```typescript
              status: 'in-progress',
              summary: 'Print, bond, cure, and finish the shared double-cut body. Same body for every voicing.',
              href: '/relay/body',
              items: [{ title: 'Parts', href: '/relay/body/parts' }],
  ```

  Replace `status: 'in-progress'` with `status: 'live'`:

  ```typescript
              status: 'live',
              summary: 'Print, bond, cure, and finish the shared double-cut body. Same body for every voicing.',
              href: '/relay/body',
              items: [{ title: 'Parts', href: '/relay/body/parts' }],
  ```

- [ ] **Step 5: Run the tests and verify they pass**

  Run: `npx vitest run __tests__/config/relay-build-process.test.ts components/relay/relay-process-overview.test.tsx`

  Expected: PASS — all assertions.

- [ ] **Step 6: Commit**

  ```bash
  git add config/relay-build-process.ts __tests__/config/relay-build-process.test.ts components/relay/relay-process-overview.test.tsx
  git commit -m "feat(relay): flip Body stage to Live for PR 3 ship"
  ```

---

### Task 9: Update sidebar test for the new Body status and Parts sub-item

**Files:**

- Modify: `components/navigation/relay-sidebar.test.tsx`

The sidebar test from PR 2 asserts that Body's row has `target="_blank"` because at the time it linked to Discord. With the status flip in Task 8, Body is Live and links to `/relay/body` as an internal route. Update the assertions; the component code itself doesn't change — `BuildStageRow` already routes Live stages to in-site URLs without `target="_blank"`.

- [ ] **Step 1: Update the failing sidebar test assertions**

  In `components/navigation/relay-sidebar.test.tsx`, find the existing `it('marks Body and Assembly stages as Discord links (target=_blank)', ...)` block. Replace it with two more specific tests:

  ```tsx
      it('routes the Body stage to its in-site page (Live)', () => {
          render(<RelayLayoutSidebar />);
          const bodyLink = screen.getByRole('link', { name: /1\. Body/ });
          expect(bodyLink).toHaveAttribute('href', '/relay/body');
          expect(bodyLink).not.toHaveAttribute('target');
      });

      it('marks Assembly stage as a Discord link (target=_blank)', () => {
          render(<RelayLayoutSidebar />);
          const assemblyLink = screen.getByRole('link', { name: /3\. Assembly/ });
          expect(assemblyLink).toHaveAttribute('target', '_blank');
          expect(assemblyLink.getAttribute('href')).toMatch(/^https:\/\/discord\./);
      });
  ```

- [ ] **Step 2: Run the test and verify it passes**

  Run: `npx vitest run components/navigation/relay-sidebar.test.tsx`

  Expected: PASS — the existing tests plus both new assertions pass. The Body row now opens in-tab.

- [ ] **Step 3: Commit**

  ```bash
  git add components/navigation/relay-sidebar.test.tsx
  git commit -m "test(relay): update sidebar test for Body=Live status"
  ```

---

### Task 10: Delete legacy printing/build content

**Files:**

- Delete: `content/relay/printing/overview.mdx`
- Delete: `content/relay/printing/parameters.mdx`
- Delete: `content/relay/printing/customization.mdx`
- Delete: `content/relay/printing/build-expectations.mdx`
- Delete: `content/relay/printing/choose-model.mdx`
- Delete: `content/relay/printing/bom.mdx`
- Delete: `content/relay/build/body.mdx`
- Delete: `content/relay/printing/` (now-empty directory)
- Delete: `content/relay/build/` (now-empty directory)

Per spec Section 9 the legacy `content/relay/{printing,build}/` files were stub material to mine for structure only. The structure has been mined into `content/relay/body/{index,parts}.mdx`. The legacy files are now dead — they aren't routed (no `app/relay/printing/*` or `app/relay/build/*` routes exist), no other content links to them by absolute path, and leaving them on disk creates a search-time confusion risk where someone (human or LLM) could load them as authoritative.

The other legacy directories spec Section 9 lists (`content/relay/{setup,electronics,lipstick}/`) stay untouched — they're scope for a future cleanup PR that pairs with the `/relay/assembly` and per-voicing parts list builds.

- [ ] **Step 1: Verify nothing in the codebase links to the legacy paths**

  Run:

  ```bash
  grep -RIn "relay/printing/" /Users/rhy/Projects/k7rhy_app/app /Users/rhy/Projects/k7rhy_app/components /Users/rhy/Projects/k7rhy_app/content /Users/rhy/Projects/k7rhy_app/config /Users/rhy/Projects/k7rhy_app/lib 2>&1
  grep -RIn "relay/build/body" /Users/rhy/Projects/k7rhy_app/app /Users/rhy/Projects/k7rhy_app/components /Users/rhy/Projects/k7rhy_app/content /Users/rhy/Projects/k7rhy_app/config /Users/rhy/Projects/k7rhy_app/lib 2>&1
  ```

  Expected: zero matches outside of the files about to be deleted. If a match shows up in current content (e.g. a voicing index that still links to `/relay/printing/bom`), pause and update that file in this commit before deletion.

- [ ] **Step 2: Delete the files**

  Run:

  ```bash
  git rm content/relay/printing/overview.mdx content/relay/printing/parameters.mdx content/relay/printing/customization.mdx content/relay/printing/build-expectations.mdx content/relay/printing/choose-model.mdx content/relay/printing/bom.mdx content/relay/build/body.mdx
  rmdir content/relay/printing content/relay/build
  ```

  Expected: files staged for deletion; both directories removed (rmdir succeeds because they should be empty after the `git rm`).

- [ ] **Step 3: Run the full test suite to confirm nothing depends on the removed paths**

  Run: `npx vitest run`

  Expected: all tests pass.

- [ ] **Step 4: Run the build to confirm prerendering still works**

  Run: `npm run build`

  Expected: build succeeds; the build log shows `/relay`, `/relay/body`, `/relay/body/parts`, `/relay/voicings`, and `/relay/voicings/[slug]` as prerendered routes. No 404s in the sitemap-generation step.

- [ ] **Step 5: Commit**

  ```bash
  git add -A content/relay/printing content/relay/build
  git commit -m "chore(relay): remove legacy printing/build stub content"
  ```

---

### Task 11: Final validation

**Files:** none modified.

- [ ] **Step 1: TypeScript check**

  Run: `npx tsc --noEmit`

  Expected: no errors.

- [ ] **Step 2: Lint**

  Run: `npm run lint`

  Expected: no errors.

- [ ] **Step 3: Full test suite**

  Run: `npx vitest run`

  Expected: all tests pass. New tests added in this PR:
  - `components/relay/relay-download-callout.test.tsx` (4 cases)
  - Extended assertions in `__tests__/config/relay-build-process.test.ts` (status flip + body items)
  - Extended assertions in `components/relay/relay-process-overview.test.tsx` (Live CTA copy + badge counts)
  - Updated assertions in `components/navigation/relay-sidebar.test.tsx` (Body in-site link, Assembly Discord)

- [ ] **Step 4: Production build**

  Run: `npm run build`

  Expected: build succeeds; build log includes `/relay`, `/relay/body`, `/relay/body/parts`, `/relay/voicings`, `/relay/voicings/[slug]`, `/relay/assembly` as prerendered routes. No MDX errors.

- [ ] **Step 5: Sentinel scan for `[AUTHOR FILL-IN]`**

  Run:

  ```bash
  grep -RIn "\[AUTHOR FILL-IN\]" /Users/rhy/Projects/k7rhy_app/content/relay/body /Users/rhy/Projects/k7rhy_app/components/relay /Users/rhy/Projects/k7rhy_app/config 2>&1
  ```

  Expected: matches **only** in `content/relay/body/index.mdx` and `content/relay/body/parts.mdx`. If the sentinel appears anywhere else, that's a leak — fix before push.

---

### Task 12: Manual smoke test in dev

**Files:** none modified.

- [ ] **Step 1: Start the dev server**

  Run (in a separate terminal): `npm run dev`

  Expected: server up at `http://localhost:3000`.

- [ ] **Step 2: Smoke-test `/relay`**

  Visit: `http://localhost:3000/relay`

  Verify:
  - Hero CTAs render. The "↓ Download body files" CTA points to `/relay/body` (an internal link, no external-tab indicator).
  - Build process cards: **Body = Live**, **Voicings = Live**, **Assembly = Planned**. Body card CTA reads "Open body guide →".
  - Voicings teaser grid renders with all seven voicings. Discord CTA at the bottom.

- [ ] **Step 3: Smoke-test `/relay/body`**

  Visit: `http://localhost:3000/relay/body`

  Verify:
  - Page title "Body" with breadcrumb `Relay Guitar / Body`.
  - The accent-bordered `RelayDownloadCallout` is the first content block, with three downloadable files (Body, Cap, Accessories) and a "Download all" link that hits `/api/download-zip?...`.
  - All eight Section 5 headings render in order: Overview, Print settings, Printing the parts, Bonding the body, Clamping and cure, Finishing, What's next.
  - Author-fillable `DocAlert` blocks render visibly inside their parent sections. Each one is recognizable as a placeholder (the `[AUTHOR FILL-IN]` sentinel is present in the title).
  - The "What's next" links to `/relay/voicings`, `/relay/voicings`, and `/relay/assembly` — all resolve to live pages without 404.
  - The bottom Discord CTA renders.
  - The sidebar shows the Build process tree with **Body = Live (no tag)** as the active row, **Parts** indented under Body. Voicings = Live, Assembly = Planned (Discord tag).

- [ ] **Step 4: Smoke-test `/relay/body/parts`**

  Visit: `http://localhost:3000/relay/body/parts`

  Verify:
  - Page title "Body parts" with breadcrumb `Relay Guitar / Body / Parts`.
  - All four BomSections render (Filament, Adhesive, Sanding, Optional finish).
  - Author-fill `DocAlert` blocks render visibly under each section.
  - The intra-page link from the body guide (`#sand-the-body`) and the back-link to `/relay/voicings` both resolve.
  - Sidebar shows Body active with "Parts" highlighted as the current page.

- [ ] **Step 5: Smoke-test the homepage CTA flow**

  From `/relay`, click "↓ Download body files" → should navigate to `/relay/body` in-tab (not Discord).

  From `/relay/body`, click each download file individually → each downloads the corresponding `.3mf` from `/public/downloads/`. Click "Download all" → triggers the ZIP route.

- [ ] **Step 6: Stop the dev server**

  Stop the dev server in the other terminal.

---

### Task 13: Push the branch and open the pull request

**Files:** none modified.

- [ ] **Step 1: Push the branch**

  Run: `git push -u origin docs/relay-body`

  Expected: success.

- [ ] **Step 2: Enable Branch Deploys for the new branch in Netlify**

  Per the GitHub PR head ref bug (project memory `project_github_pr_head_ref_bug.md`), Netlify Deploy Previews can't fetch `refs/pull/N/head` while the PR is open. The repo-committed `netlify.toml` is configured for branch deploys, but the user must manually allowlist the new branch in the Netlify dashboard before the build will trigger.

  Tell the user (in the next response):

  > The branch `docs/relay-body` is pushed. To get a preview deploy for interactive content authoring, please enable Branch Deploys for `docs/relay-body` in the Netlify dashboard. Once enabled, push commits will trigger preview builds on `https://docs-relay-body--<site>.netlify.app/`.

- [ ] **Step 3: Open the pull request**

  Run:

  ```bash
  gh pr create --title "feat(relay): build /relay/body stage and flip Body to Live (PR 3 of 3)" --body "$(cat <<'EOF'
  ## Summary

  - Builds the long-form \`/relay/body\` body-stage guide per spec Section 5: download callout → overview → print settings → printing → bonding → clamping & cure → finishing → what's next.
  - New \`RelayDownloadCallout\` component renders the accent-bordered Files & Downloads block. Sources are pluggable (\`'repo'\` | \`'makerworld'\` | other) so a future MakerWorld-exclusive arrangement is a config change, not a component rewrite.
  - New \`/relay/body/parts\` page lists the body-stage consumables (filament, adhesive, sanding, optional finish). Voicing-specific parts stay on voicing pages.
  - Flips the Body stage from In progress → Live in \`config/relay-build-process.ts\` — homepage card, sidebar, and CTA targets all update from one config edit.
  - Drops the legacy \`content/relay/{printing, build}/\` stub content per spec Section 9 (mined for structure only; canonical content now lives under \`/relay/body\`).

  Specific physical-build values (exact print settings, cure times, step sequences) ship as clearly-marked \`[AUTHOR FILL-IN]\` callouts inside each section. The page is functional and link-checkable from this PR; technical fill-in happens interactively via the Netlify branch deploy.

  This is PR 3 of 3 from \`docs/superpowers/specs/2026-05-07-relay-platform-revision-design.md\`.

  ## Test plan

  - [ ] Branch deploy succeeds (Netlify Branch Deploys must be enabled for this branch — see project memory \`project_github_pr_head_ref_bug.md\`).
  - [ ] Visit \`/relay\` — Body card now shows Live with CTA "Open body guide →".
  - [ ] Visit \`/relay/body\` — all eight sections render in spec order; download callout is first; Discord CTA at the bottom.
  - [ ] Click each download file individually — each \`.3mf\` downloads. Click "Download all" — ZIP route triggers.
  - [ ] Visit \`/relay/body/parts\` — all four BomSections render.
  - [ ] Sidebar on \`/relay/body\` shows Body=Live (no tag), Parts as a child link, Voicings=Live, Assembly=Planned (Discord tag).
  - [ ] Visit any \`/relay/voicings/<slug>\` — voicing-level sidebar still renders unchanged.
  - [ ] Sentinel scan — \`[AUTHOR FILL-IN]\` appears only in \`content/relay/body/{index,parts}.mdx\`.

  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  EOF
  )"
  ```

  Expected: a URL to the new PR.

- [ ] **Step 4: Report the PR URL to the user**

  Print the PR URL. Remind the user to enable Netlify Branch Deploys for `docs/relay-body` before the preview build will trigger.

---

## Self-Review Checklist

After completing all tasks, verify:

- [ ] **Spec coverage:** Every PR #3 scope item from `2026-05-07-relay-platform-revision-design.md` Section 10 (PR #3) is covered:
  - New route `app/relay/body/page.tsx` and content under `content/relay/body/` → already in place from PR 2; content rewritten in Task 4. ✓
  - New parts route `app/relay/body/parts/page.tsx` and content → Tasks 5 + 6. ✓
  - `RelayDownloadCallout` component supporting a configurable list of sources → Tasks 2 + 3. ✓
  - Flip the Body card on `/relay` from In progress → Live → Tasks 7 (add Parts sub-item) + 8 (status flip). ✓
  - Discord channel callout on `/relay/body` → "Building? Share progress…" message in Task 4 footer via `RelayDiscordCta`. ✓
  - Mine + delete legacy `content/relay/{printing, build}/` files → mining captured in Task 4 author-fill prompts that reference the legacy files; deletion in Task 10. ✓
- [ ] **Validation:** Spec Section 10's PR 3 validation goal — "a builder can land on `/relay`, click 'Choose your voicing' or 'Download body files', reach a complete body-stage guide, and start printing" — covered by Task 12 manual smoke test (steps 2, 3, 5).
- [ ] **No placeholders in the plan:** every code block contains actual code; every command has expected output; the only `[AUTHOR FILL-IN]` sentinels appear inside real MDX content (not plan instructions), and they're explicit author-fillable blocks the user has signed off on.
- [ ] **Type consistency:** `RelayDownloadSource` is the discriminated union `RepoSource | ExternalSource` everywhere it's referenced; `kind: 'repo'` always pairs with `name` + `files`; non-repo `kind` always pairs with `label` + `href`. The component test exercises both branches.
- [ ] **Voice consistency:** Every line of new copy in `content/relay/body/index.mdx` and `content/relay/body/parts.mdx` is first-person singular ("I/me/my"). No "we/us/our". Verify via `grep -RInE "\b(we|us|our)\b" content/relay/body/`.
- [ ] **Status flip atomicity:** Tasks 7 and 8 split the config change into two commits. Task 7 adds the Parts sub-item with status still `'in-progress'`. Task 8 does the status flip. This means a reviewer can read either commit independently, and a `git revert` of Task 8 alone correctly returns the page to "Live but missing the new content" — which is recoverable. Combining them into one commit would couple two distinct decisions.
- [ ] **Legacy deletion safety:** Task 10 step 1 grep is conservative — it scans the whole app/components/content/config/lib tree. If anything outside `content/relay/{printing,build}/` references those paths, the task pauses to fix the reference before deletion.
