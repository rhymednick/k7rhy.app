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
3. **Process overview.** Three numbered cards (Body / Voicings / Assembly), each with a brief description and two links — "[stage] guide →" and "Parts →". This is the structural addition the prior page lacked.
4. **Voicings teaser.** Compact grid of all 7 voicings with real Concept/Lab/Ready badges (today's homepage hardcodes them all to Lab — that's a bug we fix). Plus a "See all voicings →" tile linking to `/relay/voicings`.
5. **Discord CTA.** Carried over.

---

## 5. `/relay/body` page anatomy

Long-scroll guide page using the existing `PageNavigation` auto-TOC.

**Header strip:** breadcrumb · "Stage 1 of 3" badge · title · short blurb · three quick-fact chips (time, skill level, cost).

**Body (in order):**

- **Files & downloads callout.** First thing in the content. Accent-bordered, prominent. ZIP download + MakerWorld link + "Parts list →".
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
- The process overview cards reference `/relay/body`, `/relay/voicings`, `/relay/assembly`. Only `/relay/voicings` exists at this point. Body and Assembly cards are **disabled with a subtle "Coming next" tag** — no broken links, honors the no-stubs principle.

**Validation:** `/relay` shows the new layout; nav renders Body and Assembly as disabled items; clicking them does nothing or shows a tooltip.

### PR #3 — Build `/relay/body`

New routes + new content + downloads.

**Scope:**
- New route `app/relay/body/page.tsx` and content under `content/relay/body/`
- New parts route `app/relay/body/parts/page.tsx` and content
- Hook up the body files download (path TBD — see open questions)
- Activate the Body card on the `/relay` process overview (remove the disabled state)
- Mine and then delete legacy `content/relay/{printing, build}/` files

**Validation:** a builder can land on `/relay`, click "Choose your voicing" or "Download body files", reach a complete body-stage guide, and start printing.

---

## 11. Components

### New
- `RelayProcessOverview` — three numbered cards rendering on `/relay`
- `RelayVoicingPartsTable` — parts list with voicing selector (used on `/relay/voicings/parts` and inline on each voicing page)
- `RelayBodyPartsTable` — static parts list for `/relay/body/parts` (and same shape for `/relay/assembly/parts` later)
- `RelayDownloadCallout` — accent-bordered download block (used on `/relay/body` initially)

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

## 12. Open questions

These are **not blockers** for finalizing the spec. They get resolved during PR #3.

- **Where do the body files live?** Options: hosted in the repo, on MakerWorld, or in Netlify Blobs. Affects the download UX in the callout.
- **Wiring diagram approach for voicings.** The 2026-04-17 spec called for SVG schematics built during implementation. That decision still applies, but is out of scope until PR #4+ when wiring is authored on each voicing page.
- **Process overview "Coming next" treatment.** What does the disabled card look like — opacity, tag, hover behavior? Visual polish for PR #2.

---

## 13. Out of scope (deferred)

- Authoring wiring for each voicing
- Per-voicing parts list completion (only structure ships in PR #3+; the actual parts get filled in as voicings move toward Ready)
- Discord bot integration (Levels B/C from prior spec)
- Photos for any voicing's wiring
- Validation/Ready upgrades for any voicing beyond what's already in config

These come in subsequent PRs after PR #3 lands and the body stage is shipped.
