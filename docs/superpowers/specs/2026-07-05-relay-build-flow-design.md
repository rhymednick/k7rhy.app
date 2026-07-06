# Relay Build Flow — Design Spec

**Date:** 2026-07-05
**Status:** Approved design → ready for implementation plan
**Related:** builds on the 2026-07-05 Relay IA restructure (PRs #77/#81/#79/#80)

## Problem

The Relay section reads as one "build process" (Body → Voicing → Assembly) in the platform sidebar, but entering a voicing (`/relay/voicings/<slug>`) swaps the sidebar to a voicing-specific one and drops the builder out of that process. Concrete symptoms:

1. **Wiring is hard to find.** A voicing's wiring guide is only reachable from the voicing sidebar's "Build docs" list and from the Assembly page. The voicing page *body* has a prominent "View shopping list" button but no equivalent for wiring, so the eye goes to parts and misses wiring.
2. **"All voicings" is purposeless.** On a voicing detail page the sidebar re-lists all 7 voicings under "All voicings" — redundant with the platform sidebar and the voicings gallery, and it reads as noise.
3. **Parts selection is cumbersome and out of sequence.** The parts page uses a 7-button grid that does a full client navigation per click; the voicing choice only affects the Electronics section far down the page, and it asks you to pick a voicing you already chose upstream.
4. **Empty voicings appear as selectable parts options.** Reef/Current/Hammer (no parts defined) show as buttons, then render a "not published yet" note.

## Model (approved)

One continuous build process with a **master navigation** that is always visible across all of `/relay` and shows where you are. Wiring becomes a first-class **step** in that process that forks by the voicing you're building — the same pattern Parts already uses for electronics. Voicing pages are the "choose your sound" step, not self-contained destinations.

### Build spine

```
Overview
1 · Body       Print · Bonding · Finishing
2 · Voicing    choose your sound (7 voicing discovery pages)
3 · Parts      gather components — forks by voicing (tabs)
4 · Wiring     build & test the harness — forks by voicing (tabs)   [promoted to its own step]
5 · Assembly   install hardware, string, set up
```

## Decisions

- **Routes:** rename the components page to **`/relay/parts`**; add new **`/relay/wiring`**. 301 redirect `/relay/components` → `/relay/parts`.
- **Default fork tab:** **Lipstick** (reference build) when no `?voicing=` param. Deep-link `?voicing=<slug>` preselects that tab.
- **Each Parts tab shows the COMPLETE orderable list** (Body Construction + Guitar Hardware + that voicing's Electronics) so a builder can buy everything in one pass. Not a shared-parts-only default.
- **Master nav is an accordion:** only the active step expands to show sub-items; others collapse. Applies to Body (print/bond/finish) and Voicing (the voicing list).
- **Fork mechanism:** per-step tabs, stateless across steps, synced to `?voicing=` (shallow, SSR re-render). No cross-step "remembered voicing."
- **Buildable-only forks:** Parts tabs = voicings with a non-empty parts manifest; Wiring tabs = voicings with a wiring content file. Both currently resolve to Lipstick/Velvet/Arc/Torch, derived independently from content (not from `status`).
- **Voicing gallery still shows all 7** (discovery is not gated).

## Components & changes

### 1. Master build nav (`components/navigation/relay-sidebar.tsx`)
- Delete `VoicingSidebar` and the `RelayVoicingLineupNav` usage inside it ("All voicings" gone).
- `RelayLayoutSidebar` always renders the single master nav (rename `PlatformSidebar` → the build nav) for every `/relay/*` path.
- Accordion behavior: a step's sub-items render only when that step is the active one (path match). Body → print/bond/finish; Voicing → the voicing list; Parts/Wiring/Assembly have no sub-items (their fork lives on the page).
- `RelayVoicingLineupNav` stays only as the Voicing step's expanded sub-items (or is inlined). Its standalone "All voicings"/"Voicings" headings are removed.

### 2. Build-process config (`config/relay-build-process.ts`, `types/relay-nav.ts`)
- Stages become: Body, Voicing, Parts, Wiring, Assembly (5). `slug` union and `number` type widen accordingly.
- Parts promoted out of being a Body sub-item; Body's `items` = print/bond/finish only.
- Voicing step carries the voicing list as its sub-items (rendered by the accordion).
- Assembly summary rewritten (wiring removed).

### 3. Voicing pages (`components/relay/relay-voicing-overview.tsx`, `content/relay/voicings/<slug>/index.mdx`)
- Master nav stays visible (handled by #1).
- Replace the single "Parts profile / View shopping list" card with a **"Next in your build"** block offering two actions: **Parts** (`/relay/parts?voicing=<slug>#electronics`) and **Wiring** (`/relay/wiring?voicing=<slug>`).
- Voicing content files are unchanged except any internal links.

### 4. Parts step (`app/relay/parts/`, `components/relay/relay-components-shopping-list.tsx`)
- New route `/relay/parts` (moved from `/relay/components`).
- Replace the button grid with a **tab control** over buildable voicings; default Lipstick; sync `?voicing=`.
- Each tab renders the complete list via existing `resolveRelayComponentList(voicing)` (already returns common + voicing electronics).
- Remove the empty-voicing "not published" branch (empty voicings no longer appear as tabs). If a deep link targets a non-buildable voicing, fall back to the default tab.

### 5. Wiring step (`app/relay/wiring/`, `content/relay/wiring/<slug>.mdx`)
- New route `/relay/wiring` with the same voicing tab control (shared component with Parts).
- Move `content/relay/voicings/<slug>/wiring.mdx` → `content/relay/wiring/<slug>.mdx`.
- Render the selected voicing's wiring MDX; default Lipstick; sync `?voicing=`.
- 301 `/relay/voicings/<slug>/wiring` → `/relay/wiring?voicing=<slug>`.

### 6. Shared voicing tab control (`components/relay/relay-voicing-tabs.tsx`, new)
- **Client component renders the tab bar only** — a tab per buildable voicing, marks the active one, updates `?voicing=` via `router.replace` (scroll preserved). It does NOT hold the content.
- **The page (server component) resolves the active voicing from the param, applies the default (Lipstick) when absent or non-buildable, and renders that one voicing's content beneath the tab bar.** Switching tabs changes the param → RSC re-render swaps the content. Only one voicing's content is ever sent to the client. This mirrors the existing parts-page split (client selector + server-resolved content).
- Props: `voicings` (buildable list) and `activeSlug`. Used by both `/relay/parts` and `/relay/wiring`.

### 7. Registry & routing cleanup (`config/relay-voicings.ts`, `lib/relay.ts`, `app/relay/voicings/[slug]/[page]/`)
- Remove the `docs` array from `RelayVoicing` (the voicing sidebar that consumed it is gone). Keep `RelayVoicingDocPage` only if still referenced; otherwise delete.
- Delete the `app/relay/voicings/[slug]/[page]/` route (per-voicing wiring/parts sub-pages) — wiring moves to the step; parts already redirects.
- Simplify `buildRelayVoicingBreadcrumbs` (no doc sub-page titles needed).

### 8. Redirects (`next.config.mjs`)
- `/relay/components` → `/relay/parts` (301).
- `/relay/voicings/:v/wiring` → `/relay/wiring?voicing=:v` (301).
- Keep prior legacy redirects; update the `bom` redirect target to `/relay/parts`.

### 9. Assembly page (`content/relay/assembly/index.mdx`)
- Rewrite: wiring is now step 4; Assembly covers hardware install → stringing → setup and hands off from the (built + tested) harness. Voice profile applies.

## Testing

- `config/relay-build-process.test.ts` / `__tests__/config/...`: 5 stages, order, Parts/Wiring present, Assembly no longer owns wiring.
- Sidebar tests: master nav renders on both platform and voicing paths; "All voicings" absent; accordion expands active step only.
- Parts: tabs list only buildable voicings; default Lipstick; each tab yields a complete list (has Body Construction + Electronics); non-buildable deep link falls back.
- Wiring: route resolves per voicing; buildable-only tabs; default Lipstick; content loads.
- Redirects verified in build output; old wiring/components URLs resolve.
- Registry: `relay-components.test.ts` unaffected (resolution logic unchanged).

## Out of scope

- No change to voicing discovery content, pickup maps, or the parts catalog data model.
- No cross-step "remembered voicing" state.
- No new voicings promoted to buildable.
