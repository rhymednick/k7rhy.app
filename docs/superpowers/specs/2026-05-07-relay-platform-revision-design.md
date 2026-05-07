# Relay Guitar Platform — Revision Design

**Date:** 2026-05-07 **Branch:** `docs/relay-guitar-platform` (continuing) **Status:** Draft pending user review

Supersedes the unstarted phases of `2026-04-17-relay-guitar-platform-design.md`. Phase 1 (platform intro + voicing overview pages) shipped under the prior spec and remains in place; this revision changes how the rest of the build is structured and what gets shipped next.

---

## 1. Why this revision

The driving change is shipping value sooner: a builder should be able to print and construct a body **as soon as PR #3 lands**, instead of waiting through five phases of the prior plan. Three secondary shifts came out of the same conversation:

1. **Terminology.** "Model" misfires for a print-forward audience that reads it as "printable file." We rename **Model → Voicing** throughout. "Voicing" reinforces the music identity and aligns with the existing "voice profile" content sections.
2. **Information architecture.** The platform page should lead **intro → process overview → voicings**, not jump straight into a voicings grid.
3. **Build path.** Print and body construction collapse into a single combined stage. Wiring moves onto the voicing pages themselves rather than living in a separate `/relay/build/[model]/wiring` route. Final assembly + setup becomes its own stage.

---

## 2. Three-stage process

```
Stage 1 — Body         Print and construct the body blank, then sand and seal.
Stage 2 — Voicings     Pick a voicing, source parts, wire it up.
Stage 3 — Assembly     Neck, bridge, electronics install, stringing, setup.
```

Each stage has its own parts list page. The voicings parts list is special because it has a **selector that swaps in per-voicing components**. The body and assembly parts lists are static.

**Recommended flow:** builders pick a voicing first so parts can ship in parallel with body printing.

---

## 3. URL structure

```
/relay                          Platform intro
/relay/body                     Stage 1 overview (print + bond + cure + finishing)
/relay/body/parts               Stage 1 parts list
/relay/voicings                 Voicings gallery
/relay/voicings/parts           Voicings parts list with selector
/relay/voicings/[slug]          Individual voicing — character + controls + parts + wiring
/relay/assembly                 Stage 3 overview (final assembly + setup)
/relay/assembly/parts           Stage 3 parts list
```

No redirects from the old `/relay/[model]` URLs — nothing in production points at them yet.

**Sidebar nav** (visible on all `/relay/*` routes):

```
Relay Guitar
  Platform overview         → /relay
  ── Build process ──
  1. Body                   → /relay/body
     Parts                  → /relay/body/parts
  2. Voicings               → /relay/voicings
     Parts                  → /relay/voicings/parts
     Lipstick               → /relay/voicings/lipstick
     Reef                   → /relay/voicings/reef
     Velvet                 → /relay/voicings/velvet
     Arc                    → /relay/voicings/arc
     Torch                  → /relay/voicings/torch
     Current                → /relay/voicings/current
     Hammer                 → /relay/voicings/hammer
  3. Assembly               → /relay/assembly
     Parts                  → /relay/assembly/parts
```

---

## 4. `/relay` page anatomy

Five sections, top to bottom:

1. **Hero.** Title + one-sentence platform description + CTA pair: primary **"Choose your voicing →"**, secondary **"↓ Download body files"**. Micro-copy under the buttons explains the order: *"Pick first, order parts, then start printing — they'll ship while the body prints."*
2. **What it is / costs / gets.** Three honest cards. Carried over from prior spec.
3. **Process overview.** Three **status-aware cards** (Body / Voicings / Assembly), mirroring the Concept/Lab/Ready pattern used for voicings. Each card carries one of three statuses:
   - **Live** — the page exists. Card links to "[stage] guide →" and "Parts →".
   - **In progress** — being actively worked on. Card links to a Discord channel where the work is being discussed; a small "preview" link surfaces if any partial content exists.
   - **Planned** — not yet started. Card links to a Discord channel for the stage so visitors can ask questions and follow updates.

   This treatment makes "not yet shipped" cards do real work — they become entry points for the community rather than dead ends. It also aligns the process scaffolding with the voicing status system already on the site.
4. **Voicings teaser.** Compact grid of all 7 voicings with real Concept/Lab/Ready badges (today's homepage hardcodes them all to Lab — that's a bug we fix). Plus a "See all voicings →" tile linking to `/relay/voicings`.
5. **Discord CTA.** Carried over.

---

## 5. `/relay/body` page anatomy

Long-scroll guide page using the existing `PageNavigation` auto-TOC.

**Header strip:** breadcrumb · "Stage 1 of 3" badge · title · short blurb · three quick-fact chips (time, skill level, cost).

**Body (in order):**

- **Files & downloads callout.** First thing in the content. Accent-bordered, prominent. Repo-hosted ZIP download + "Parts list →" link. Component supports adding MakerWorld and other sources later via config.
- **Overview** — what you'll do, what success looks like.
- **Print settings** — material, layer height, walls, infill, supports, orientation. Grid of pill values.
- **Printing the parts** — print order, common failure modes, what to inspect before bonding.
- **Bonding the body** — adhesive choice, surface prep, alignment, joining sequence.
- **Clamping & cure** — clamp pattern + 24h cure timing.
- **Finishing** — three numbered sub-blocks: (1) squish-out cleanup, (2) sand the body, (3) optional paint or seal. The "optional" tag on step 3 keeps it explicit that bare PETG is a valid finish.
- **What's next** — pivots toward voicings.

This same shape templates `/relay/assembly` later.

---

## 6. Voicing pages

Voicing pages (`/relay/voicings/[slug]`) become the consolidated reference for each voicing. Each contains:

- Sound character (carried over from current pages)
- Control scheme (carried over)
- Pickup map (carried over)
- **Inline parts list** (per voicing, with a selector at top to jump to other voicings' parts)
- **Wiring diagram** (Concept = exploratory, may be omitted; Lab = targeted-but-unvalidated; Ready = validated)
- Discord CTA (carried over)

The dedicated `/relay/voicings/parts` page is a separate route that also has the selector — duplicates the inline parts content but is the easier-to-print, easier-to-share version.

This is a meaningful policy change from the prior spec, which kept wiring out of overview pages. The corresponding memory has been updated.

---

## 7. Status system

**No change.** Three tiers (Concept / Lab / Ready) with per-page callouts already implemented in `RelayModelOverview`. The implementation gets renamed (`RelayVoicingOverview`) but keeps the same callout copy.

**One bug to fix as part of PR #1:** `content/relay/index.mdx` hardcodes `status="lab"` on every card. The card component should read status from the voicings config.

---

## 8. Audience and voice

**Same K7RHY voice, broader audience.** The prior voice (per `/Users/rhy/.claude/memory/voice-profile.md`) carries forward unchanged. The shift is making sure non-guitarists — printer-forward makers — can follow the build pages without prior guitar knowledge.

**How that shows up in copy:**
- Continue using `<Term>` / `<DocTerm>` for guitar/luthier vocabulary (truss rod, neck relief, action, intonation, pickup height, etc.).
- Body and Assembly pages frame instructions in printer/maker terms first; guitar terms get tooltips.
- Voicings continue to lead with character/feel because that's the actual decision a builder is making.

---

## 9. Legacy unrouted content

Material from the 2026-03-29 docs spec remains on disk but is **not authoritative**:

```
content/relay/printing/{overview, parameters, customization, build-expectations, choose-model, bom}.mdx
content/relay/assembly/{overview, checkpoints}.mdx
content/relay/setup/{playable, optimization, professional}.mdx
content/relay/electronics/{overview, wiring, design-boundaries}.mdx
content/relay/build/body.mdx
content/relay/lipstick/{_content-brief.md, bom.mdx, compatibility.mdx}
```

This content was largely AI-generated stub material from earlier planning. **It will be mined for structural ideas only** — what sub-sections existed, how content was grouped — but its specific copy, parameter values, procedure steps, and technical claims are not to be lifted into new pages without explicit user verification.

When `/relay/body`, `/relay/voicings/parts`, and `/relay/assembly` are built, the corresponding legacy files get deleted in those PRs (or in immediate follow-ups once the new pages are reviewed).

`content/relay/[slug]/index.mdx` for each voicing is current and stays.

---

## 10. Build sequence — three sequential PRs

Each PR is small enough to review in one sitting and triggers a CI/CD staging deploy.

### PR #1 — Rename Model → Voicing

Pure refactor. No new behavior. No new pages.

**Scope:**
- Rename types: `RelayModel` → `RelayVoicing`, `RelayModelStatus` → `RelayVoicingStatus`, etc.
- Rename files: `types/relay-model.ts` → `types/relay-voicing.ts`; `config/relay-models.ts` → `config/relay-voicings.ts`
- Rename components: `relay-model-overview.tsx` → `relay-voicing-overview.tsx`; `relay-model-status-badge.tsx` → `relay-voicing-status-badge.tsx`; `RelayModelCard` → `RelayVoicingCard`; `RelayModelGrid` → `RelayVoicingGrid`; `RelayModelSection` → `RelayVoicingSection`; `RelayModelPickupChoices` → `RelayVoicingPickupChoices`
- Update `lib/relay.ts` path resolution
- Move `app/relay/[model]/` → `app/relay/voicings/[slug]/`
- Update `mdx-components.tsx` registrations
- Update `content/relay/index.mdx` copy and component names
- Update each voicing's `content/relay/[slug]/index.mdx` for component renames
- Fix the homepage status-badge hardcode by reading status from config in `RelayVoicingCard`

**Validation:** all 7 voicing pages still render at the new URLs; homepage gallery shows correct Concept/Lab/Ready badges.

### PR #2 — Restructure `/relay`

Layout + nav. No new content pages.

**Scope:**
- Update `content/relay/index.mdx` to the five-section shape: hero with CTA pair → costs cards → process overview → voicings teaser → Discord CTA
- New component: `RelayProcessOverview` rendering the three numbered cards
- Update `config/relay-nav.ts` to include the Build process tree
- The process overview cards use the status-aware pattern from Section 4. At PR #2 ship time:
  - **Voicings** — Live (page exists)
  - **Body** — In progress (links to a Discord channel; small preview link if any draft is up)
  - **Assembly** — Planned (links to a Discord channel for the stage)
- Sidebar nav renders Body and Assembly entries with a "Discord" suffix or icon to make their status visible.

**Validation:** `/relay` shows the new layout; the three cards render with correct statuses; Body and Assembly cards open Discord; clicking the Voicings card goes to `/relay/voicings`.

### PR #3 — Build `/relay/body`

New routes + new content + downloads.

**Scope:**
- New route `app/relay/body/page.tsx` and content under `content/relay/body/`
- New parts route `app/relay/body/parts/page.tsx` and content
- Hook up the body files download — repo-hosted ZIP for now, with the `RelayDownloadCallout` component supporting a configurable list of sources (repo, MakerWorld, etc.) so a future "MakerWorld exclusive" mode can suppress all other sources via config
- Flip the Body card on `/relay` from In progress → Live; the Voicings card stays Live; Assembly stays Planned
- Add a contextual Discord channel callout on `/relay/body` ("Building? Share progress in #body-builds")
- Mine legacy `content/relay/{printing, build}/` files for **structural ideas only** (per the legacy-content policy in Section 9), then delete them in this PR or a follow-up cleanup

**Validation:** a builder can land on `/relay`, click "Choose your voicing" or "Download body files", reach a complete body-stage guide, and start printing.

---

## 11. Components

### New
- `RelayProcessOverview` — renders the three status-aware cards on `/relay`. Card status (Live / In progress / Planned) and target URL (page route or Discord channel) come from a config block, so flipping a card from "Planned" to "Live" later is a config change.
- `RelayProcessCard` — the individual card. Renders pill, title, description, and contextual link (page or Discord).
- `RelayVoicingPartsTable` — parts list with voicing selector (used on `/relay/voicings/parts` and inline on each voicing page)
- `RelayPartsTable` — static parts list for `/relay/body/parts` and `/relay/assembly/parts`. Same visual shape as the voicing parts table minus the selector.
- `RelayDownloadCallout` — accent-bordered download block. Takes a list of download sources (label + URL + optional icon). When the list is reduced to a single source (e.g., MakerWorld exclusive future state), the component renders accordingly without other UI changes.

### Renamed from prior spec
- `RelayVoicingOverview` (was `RelayModelOverview`)
- `RelayVoicingStatusBadge` (was `RelayModelStatusBadge`)
- `RelayVoicingCard` / `RelayVoicingGrid` (was `RelayModelCard` / `RelayModelGrid`)
- `RelayVoicingSection` / `RelayVoicingPickupChoices`

### Carried forward unchanged
- `RelayPickupMap`
- `RelayDiscordCta`
- `Term` / `DocTerm`
- `BomSection`, `BomItem`, `DecisionNote`, `DownloadGroup`, `DownloadGroupFile`
- `PageNavigation`, `DocSection`, `DocImage`, `DocProcedure`, `DocBreadcrumb`

---

## 12. Resolved questions

These were open in the first draft. All resolved before PR work begins.

- **Body file hosting.** Hosted **in the repo** for the initial launch. MakerWorld and possibly other locations get added later. If a future MakerWorld-exclusive arrangement applies, all other download sources are removed. The `RelayDownloadCallout` component is built to accept a configurable list of sources from the start so this is a config change, not a component rewrite.
- **Wiring diagram approach.** Hand-drawn raster images are on the table — every SVG-based prototype tried so far has looked unsatisfying. Voicing wiring is out of scope for this revision (deferred to a later PR), but when authored, diagrams will go through `DocImage` (with click-to-expand) by default. SVG is no longer the assumed approach.
- **Process overview card treatment.** Resolved as **Option C — status-aware cards** (Live / In progress / Planned). See Section 4 for the visual treatment and Section 13 for how the statuses interact with Discord.

---

## 13. Discord strategy

Discord moves from "deferred" to integrated across the active PR sequence, because the site updates are being **published as they ship** — and the goal is to get people joining, talking, and asking questions starting now rather than after everything is built.

**Per-PR Discord touchpoints:**

- **PR #1 (rename)** — No Discord changes. Pure refactor.
- **PR #2 (restructure)** — The two non-Live status-aware cards on `/relay` link to Discord channels (`#voicings` for In progress, `#assembly` for Planned). Sidebar entries for those stages also surface their Discord status. The existing `RelayDiscordCta` placement on `/relay` carries over but may be repositioned for prominence.
- **PR #3 (body stage)** — `/relay/body` adds a contextual Discord channel callout in the "What's next" footer ("Building? Share progress in #body-builds"). The body parts list adds a Discord link near the parts table for sourcing questions.

**Discord channels referenced (Discord-side configuration is out of scope for this spec):**
- `#general` — community-wide
- `#body-builds` — body printing and construction
- `#voicings` — voicing development progress
- `#assembly` — final assembly and setup
- Per-voicing channels (already specified in 2026-04-17 spec)

**Still deferred:**
- Bot integration (Level B from prior spec) — surfacing pinned Discord answers on the site via ISR
- Forum-channel-per-thread integration (Level C from prior spec)
- Discord OAuth on the site

These come in their own PR after the active sequence ships.

## 14. Out of scope (deferred)

- Authoring wiring for each voicing
- Per-voicing parts list completion (only structure ships in PR #3+; actual parts fill in as voicings move toward Ready)
- Discord bot integration (Levels B/C from prior spec — see Section 13)
- Photos for any voicing's wiring
- Validation/Ready upgrades for any voicing beyond what's already in config

These come in subsequent PRs after PR #3 lands and the body stage is shipped.
