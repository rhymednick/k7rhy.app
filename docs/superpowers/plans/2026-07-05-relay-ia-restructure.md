# Relay IA Restructure & 4-Voicing Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse the Relay section's two competing information architectures into one coherent tree, retire the unvalidated AI-era exploration content (after mining it for ideas), and ship four released, end-to-end buildable voicings: Lipstick, Velvet, Arc, Torch.

**Architecture:** One voicing registry (`config/relay-voicings.ts`) drives every surface (cards, sidebar, statuses, routes). One URL tree per voicing (`/relay/voicings/<slug>[/wiring]`). One parts system (`/relay/components` + item MDX + per-voicing JSON manifests). Orphaned draft content is distilled into a non-routed ideas ledger, then deleted. Every routed page is real and intentional.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Vitest, MDX via next-mdx-remote, Netlify.

**Voice:** All new visitor-facing copy is K7RHY first-person singular ("I/me/my"). Check `/Users/rhy/.claude/memory/voice-profile.md` before writing copy.

**Branch/PR discipline:** One branch + PR per phase, stacked (`relay-ia-02-routes` branches off `relay-ia-01-registry`, etc.). PRs are never drafts. Note merge order in each PR body.

---

## Locked decisions

- **Released voicings:** lipstick, velvet, arc, torch (`status: 'ready'`). Reef + Current stay `'lab'`, Hammer stays `'concept'` — present and honest, not hidden.
- **Arc status conflict** resolves to `'ready'` (commit ea69b54 intent; `config/relay-voicings.ts:73` is stale).
- **`config/relay-nav.ts` is deleted.** Its data merges into `config/relay-voicings.ts`. `relayPlatformNav` + `buildRelayPlatformBreadcrumbs` are dead code — delete.
- **Old voicing URL tree** (`/relay/<voicing>/<page>` via `app/relay/[voicing]/[page]/`) is deleted; permanent redirects map old URLs into the new tree. New dynamic routes set `dynamicParams = false` so unrouted content can never leak again.
- **Parts:** the four `bom.mdx` files are deleted. Velvet/Torch/Arc electronics move into `content/relay/components/items/` + populated manifests. Sidebar "Parts" links go straight to `/relay/components?voicing=<slug>#electronics`. Query param renamed `model` → `voicing` (legacy `?model=` still accepted).
- **Sourcing-link gaps** (`[TODO]` amzn links, homepage-only GFS links): create items with honest spec text and the best real product URL findable; every unverified link gets flagged in the final report for Rhy to replace with affiliate links. Do NOT invent affiliate shortlinks.
- **Orphans to mine-then-delete:** `content/relay/electronics/` (3 files), `content/relay/setup/` (3 files), `content/relay/assembly/overview.mdx` + `checkpoints.mdx`, `content/relay/lipstick/compatibility.mdx`. Ideas ledger: `content/relay/IDEAS.md` (plain .md, never routed). Note: `compatibility.mdx` contains concrete-looking fit specs (24.75" scale, neck heel dims) — capture these in the ledger prominently; if Rhy confirms them later they belong on the components page.
- **`/relay` and `/relay/voicings` both keep the voicing grid**, but rendered from the registry (`<RelayVoicingGrid />` with no hand-written cards), so duplication is free. The two pages get differentiated intro copy.
- **Assembly** (`content/relay/assembly/index.mdx`) is rewritten as an intentional stage page: what assembly covers, links to each released voicing's wiring guide, Discord CTA. No fabricated physical build steps.

---

## Phase 1 — Single voicing registry (branch `relay-ia-01-registry`)

### Task 1.1: Extend the registry type

**Files:**
- Modify: `types/relay-voicing.ts`
- Modify: `types/relay-nav.ts` (remove `RelayNav`, `RelayVoicingNav`, `RelayPlatformNav`, `RelayNavSection`, `RelayNavItem`; keep `RelayStageStatus`, `RelayStageItem`, `RelayBuildStage`, `RelayBuildProcess`)

Add to `RelayVoicing` in `types/relay-voicing.ts`:

```ts
export interface RelayVoicingDocPage {
    title: string;   // e.g. 'Wiring Guide'
    slug: string;    // e.g. 'wiring' → /relay/voicings/<voicing>/wiring
}

export interface RelayVoicing {
    // ...existing fields...
    /** Sub-pages under /relay/voicings/<slug>/. Empty for lab/concept voicings. */
    docs: RelayVoicingDocPage[];
}
```

- [ ] Write failing test in `config/relay-voicings.test.ts`: every voicing has `docs` array; ready voicings include a `wiring` doc page; statuses are `ready` for lipstick/velvet/arc/torch, `lab` for reef/current, `concept` for hammer.
- [ ] Run `npx vitest run config/relay-voicings.test.ts` — expect FAIL.
- [ ] Update `config/relay-voicings.ts`: fix arc to `'ready'`, add `docs: [{ title: 'Wiring Guide', slug: 'wiring' }]` to the four ready voicings, `docs: []` to the rest.
- [ ] Run test — expect PASS (docs assertions; wiring-page-existence assertion lands in Phase 2).
- [ ] Commit.

### Task 1.2: Point all consumers at the registry, delete relay-nav.ts

**Files:**
- Delete: `config/relay-nav.ts`
- Modify: `components/navigation/relay-sidebar.tsx` (VoicingSidebar + RelayLayoutSidebar read `relayVoicings`; drop legacy `nextSegment in relayNav` branch — Phase 2 removes that URL space)
- Modify: `components/relay/relay-voicing-lineup-nav.tsx` (iterate `relayVoicings`, sort by status then name)
- Modify: `lib/relay.ts` (`buildRelayVoicingBreadcrumbs(voicing, slug, voicings: RelayVoicing[])`; delete `buildRelayPlatformBreadcrumbs`)
- Modify: `app/relay/voicings/[slug]/page.tsx`, `app/relay/[voicing]/[page]/page.tsx` (generateStaticParams from registry; the latter is deleted in Phase 2 but must compile until then)
- Tests: `components/navigation/relay-sidebar.test.tsx`, `lib/relay.test.ts`

- [ ] Update tests first to the new signatures/data source; run — expect FAIL.
- [ ] Implement; `grep -rn "relay-nav" --include='*.ts*'` must return nothing.
- [ ] `npx vitest run` — all green. Commit.

### Task 1.3: Config-driven voicing grid

**Files:**
- Modify: `components/doc/relay-voicing-grid.tsx` — `RelayVoicingGrid` with no children renders all voicings from `relayVoicings` (name, tagline, genres, description, `href` from registry). Keep `RelayVoicingCard` export working for explicit use.
- Modify: `content/relay/index.mdx`, `content/relay/voicings/index.mdx` — replace both hand-written card lists with `<RelayVoicingGrid />`.
- Test: `components/doc/relay-voicing-grid.test.tsx` — renders 7 cards from config; card copy comes from registry.

- [ ] Test first (FAIL), implement, PASS, commit.
- [ ] Differentiate intro copy: `/relay` keeps current overview framing; `voicings/index.mdx` intro becomes "pick the sound first" + note that Ready = fully documented build, Lab/Concept = follow along.
- [ ] `npx vitest run && npm run lint` green. Push, open PR (base `main`).

## Phase 2 — One URL tree (branch `relay-ia-02-routes`, off phase 1)

### Task 2.1: New nested voicing route

**Files:**
- Create: `app/relay/voicings/[slug]/[page]/page.tsx` — mirror of the old `[voicing]/[page]/page.tsx` but loads via `loadRelayVoicingPage(slug, [page])` (already resolves `content/relay/voicings/...`), breadcrumbs via `buildRelayVoicingBreadcrumbs`, `generateStaticParams` from registry `docs`, and `export const dynamicParams = false`.
- Modify: `app/relay/voicings/[slug]/page.tsx` — add `dynamicParams = false`.

### Task 2.2: Move wiring content, delete old tree

- [ ] `git mv content/relay/<v>/wiring.mdx content/relay/voicings/<v>/wiring.mdx` for lipstick, velvet, arc, torch.
- [ ] Delete `app/relay/[voicing]/` entirely.
- [ ] Sidebar `VoicingSidebar`: hrefs become `/relay/voicings/${voicing}/${doc.slug}`; sections header "Build docs".
- [ ] Registry test from 1.1: enable assertion that every `docs` entry's MDX file exists on disk.

### Task 2.3: Redirects

In `next.config.mjs` `redirects()` add (before existing entries):

```js
{ source: '/relay/:v(lipstick|velvet|arc|torch)/wiring', destination: '/relay/voicings/:v/wiring', permanent: true },
{ source: '/relay/:v(lipstick|velvet|arc|torch)/bom', destination: '/relay/components?voicing=:v', permanent: true },
{ source: '/relay/lipstick/compatibility', destination: '/relay/components', permanent: true },
{ source: '/relay/:v(lipstick|reef|velvet|arc|torch|current|hammer)', destination: '/relay/voicings/:v', permanent: true },
```

- [ ] Tests + lint green; `npm run build` succeeds; verify `/relay/voicings/arc/wiring` in build output and old paths absent. Commit, push, PR (base phase-1 branch).

## Phase 3 — One parts system (branch `relay-ia-03-parts`)

### Task 3.1: Author electronics items for velvet/torch/arc

**Files:** create under `content/relay/components/items/` (ids = old bom itemKeys so `data/price-cache.json` keys stay valid):
- Shared across 5-way voicings: `volume-pot-500k.mdx`, `tone-pot-500k-push-pull.mdx`, `selector-switch-5way.mdx` (sources: `[TODO]` in old boms → use real non-affiliate product URLs, flag for Rhy)
- Velvet: `velvet-neck-pickup.mdx`, `velvet-middle-pickup.mdx` (GFS Retrotron Nashville), `velvet-bridge-pickup.mdx`
- Torch: `torch-neck-pickup.mdx`, `torch-middle-pickup.mdx` (GFS Mean 90), `torch-bridge-pickup.mdx` (GFS VEH)
- Arc: `arc-neck-pickup.mdx` (GFS Vintage 59), `arc-middle-pickup.mdx` (GFS Dream 180), `arc-bridge-pickup.mdx` (GFS Retrotron Liverpool)

Item frontmatter template (category `'Electronics'`, scope `'model'`): copy structure from `content/relay/components/items/gfs-bridge-pickup.mdx`. Body copy: distill the voicing-specific guidance from the old bom files (that guidance matches `config/relay-voicings.ts` pickup maps — cross-check magnet/resistance against the registry before writing).

- [ ] Failing test in `lib/relay-components.test.ts`: `resolveRelayComponentList('velvet'|'torch'|'arc')` returns non-empty Electronics; every manifest id resolves.
- [ ] Populate `content/relay/components/models/{velvet,torch,arc}.json` with the new ids (+ `tone-capacitor`, `output-jack`, `hookup-wire`, `copper-foil-tape` shared items where the boms listed them).
- [ ] PASS, commit.

### Task 3.2: Param rename + empty-manifest handling

- [ ] `app/relay/components/page.tsx`: accept `voicing` (fall back to legacy `model`). `components/relay/relay-components-shopping-list.tsx`: router URLs use `?voicing=`, copy says "voicing" not "model".
- [ ] Shopping list: when a selected voicing's electronics list is empty (reef/current/hammer), render an honest note: electronics publish when the voicing leaves the lab, with Discord link.
- [ ] Update `components/relay/relay-voicing-overview.tsx` parts-profile link to `?voicing=`.

### Task 3.3: Delete bom pages

- [ ] Delete `content/relay/{lipstick,velvet,torch,arc}/bom.mdx`; registry `docs` for ready voicings gets a Parts entry — implement as `href`-style item pointing at `/relay/components?voicing=<slug>#electronics` (extend `RelayVoicingDocPage` with optional `href` overriding the slug route; sidebar renders it like any other item).
- [ ] Remove the Phase-2 bom redirect? No — keep; old URLs must land somewhere.
- [ ] `grep -rn "bom" app components config content --include='*.ts*' --include='*.mdx'` — no live references. Tests/lint/build green. Commit, push, PR.

## Phase 4 — Retire orphans, intentional completeness, release (branch `relay-ia-04-release`)

### Task 4.1: Mine and retire

- [ ] Read every orphan file fully; write `content/relay/IDEAS.md` with a header stating these are unvalidated AI-exploration ideas kept for reference (not site content, not canonical), grouped by topic (wiring/electronics concepts, setup ladder: playable→professional→optimization, assembly sequence/checkpoints, fit/compatibility specs).
- [ ] Delete: `content/relay/electronics/`, `content/relay/setup/`, `content/relay/assembly/{overview,checkpoints}.mdx`, `content/relay/lipstick/compatibility.mdx`, now-empty `content/relay/{lipstick,velvet,arc,torch}/` dirs.
- [ ] Remove tracked `.DS_Store` files; ensure `.gitignore` covers them.

### Task 4.2: Intentional Assembly page

- [ ] Rewrite `content/relay/assembly/index.mdx` (voice profile!): what assembly is, honest status ("guides in progress, here's what exists now"), per-voicing wiring guide links (from registry — consider a small `RelayWiringGuideList` component if MDX needs it), what to expect next, Discord CTA. Update `config/relay-build-process.ts` stage 3 summary if copy drifted.

### Task 4.3: Release sweep

- [ ] Statuses: 4× ready everywhere (single registry makes this one check).
- [ ] Link audit: `grep -rn "](/relay" content app components config --include='*.mdx' --include='*.ts*'` — every internal href resolves to a route or redirect.
- [ ] Voicing page completeness: each ready voicing index.mdx has all five sections + pickup choices; sidebar shows Wiring + Parts.
- [ ] `npx vitest run && npm run lint && npm run build` — all green. Sitemap includes new tree.
- [ ] Commit, push, PR. Final report to Rhy: link-verification list (GFS/pot/switch URLs to swap for affiliate links), IDEAS.md pointer, merge order.

---

## Self-review notes

- Phase ordering avoids double-churn: registry first so route/parts phases edit one config.
- Old `[voicing]/[page]` route must keep compiling through Phase 1 (it imports `relayNav`) — Task 1.2 updates its `generateStaticParams` to read the registry even though Phase 2 deletes it.
- `missing-component-test.json` is a test fixture — keep.
- Price cache keys preserved by reusing bom `itemKey`s as item ids.
