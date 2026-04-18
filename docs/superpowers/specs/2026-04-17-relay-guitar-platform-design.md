# Relay Guitar Platform — Site Design

**Date:** 2026-04-17
**Branch:** `docs/relay-guitar-platform`
**Status:** Approved, ready for implementation planning

---

## 1. Overview

The Relay Guitar Platform is a DIY 3D-printed electric guitar project hosted at k7rhy.app. The site serves two goals simultaneously:

1. **Introduce the platform** — explain what it is, who it's for, what it costs, and what building it actually involves (including the difficulty and expense, presented honestly without scaring people off).
2. **Guide builders end to end** — a linear build guide that takes someone from zero to a playable, gigged instrument.

The primary audience is guitar players, not engineers or makers. They know very little technical vocabulary. Language across the site should be plain, warm, and respectful of that — technical terms are acceptable only when wrapped in a hover-card tooltip (via the existing `DocTerm`/`Term` component).

---

## 2. Core Design Principles

- **No stubs.** Pages that aren't ready simply don't exist yet — no "coming soon" placeholder pages.
- **Phase 1 is complete on its own.** The platform introduction and model gallery are a finished, standalone experience. The build guide is a separate thing that appears when phase 2 ships.
- **One body, all models.** Every model uses the same 3D-printed body. Models differ only in pickups, wiring, and selector logic. Pickup ring adapters handle size differences.
- **Honest status, not alarming status.** Two-state model system (Lab / Ready) that tells builders exactly where things stand.

---

## 3. URL Structure

All Relay routes are top-level — no `/docs/` prefix. This sets the precedent for future product lines on k7rhy.app.

```
/relay                                  Platform intro + model gallery
/relay/[model]                          Model overview (all 7 models)

/relay/build                            Build guide hub (phase 2+)
/relay/build/print                      Printing the body
/relay/build/body                       Assembling the body
/relay/build/choose                     Choosing your model + buying parts
/relay/build/[model]/parts              Per-model parts list
/relay/build/[model]/wiring             Per-model wiring guide
/relay/build/assembly                   Final assembly (rejoined — all models)
/relay/build/test                       Pre-string electronics check
/relay/build/setup                      Guitar setup overview + luthier handoff
```

The path forks at `/relay/build/[model]/parts` and rejoins at `/relay/build/assembly`. The fork is explicit in the URL — a builder at `/relay/build/lipstick/wiring` knows exactly where they are.

No redirects needed — no production URLs exist yet in this route space.

---

## 4. Model Lineup — 7 Models

### Status System

Two states only. A model appears on the site as soon as its design is complete.

| Status | Meaning | Badge color |
|--------|---------|-------------|
| **Lab** | Design targeted (pickups, controls, selector logic chosen), not yet physically built and validated. Parts list and wiring may change after real-world testing. | Amber |
| **Ready** | Physically built, tested, validated. Parts list and wiring guide published. | Green |

A "Lab" model page includes this disclosure:
> *"This model's design is complete but hasn't been physically built and validated yet. Component choices and wiring details may change after testing. Join the Discord to follow development and share early builds."*

### The Models

| Model | Status | Genres | Notes |
|-------|--------|--------|-------|
| **Lipstick** | Ready | Blues · Rock · Indie · Alternative | Reference model. Fully documented. |
| **Reef** | Lab | Indie · Surf · Alt Country · Shoegaze | New 7th model — see section 5. |
| **Velvet** | Lab | Jazz · Blues · Soul | 5-way, warm/fat character |
| **Arc** | Lab | Indie · Ambient · Pop · Country | 5-way, airy/chime-forward |
| **Torch** | Lab | Rock · Pop · Alternative | 5-way, vocal mids, P90-type middle |
| **Current** | Lab | Funk · Pop · Rock | 3-way, punch and immediacy |
| **Hammer** | Lab | Metal · Hard Rock | 5-way, tight gain, high-output |

---

## 5. Relay Reef — New Model Spec

**Inspiration:** Danelectro 59 NOS+

### Hardware
- **Bridge:** Humbucker
- **Middle:** Lipstick
- **Neck:** Lipstick
- **Middle + Neck wiring:** Treated as a single network (not independent)
- **Selector:** 5-way blade switch
- **Volume:** Standard single pot
- **Tone:** Concentric stacked pot — one knob controls humbucker tone, the other controls the lipstick network tone independently

### Sound Character
The lipstick network — middle and neck pickups wired together — delivers the signature Danelectro character: glassy, articulate, piano-like, with an almost acoustic openness. The bridge humbucker provides everything the Danelectro never had: warmth, sustain, and enough output to push an amp into bloom.

The 5-way switch moves through the full spectrum, from pure humbucker to pure lipstick shimmer, with blended positions in between. The concentric tone pot keeps the two voices independent — roll back the humbucker's high end without touching the lipstick clarity, or vice versa.

**Where it shines:** Clean and semi-clean tones through a tweed or EL84 amp. Surf reverb with the lipstick network. Indie rock rhythm with the bridge humbucker. Pedal platform — lipstick pickups are transparent enough to let effects breathe. Well-suited for recording where tonal contrast between two distinct voices is valuable in a single take.

**Who it's for:** Players who love the Danelectro sound but want more range. Indie, surf, alt-country, and shoegaze players. Studio guitarists who want one versatile instrument.

---

## 6. Build Guide Structure

### Shared Phases (all models)

| Step | URL | Content |
|------|-----|---------|
| 1 | `/relay/build/print` | Print settings, file downloads, orientation, supports, material, failure prevention |
| 2 | `/relay/build/body` | Bonding sequence, alignment, clamping, curing, post-bond cleanup |
| 3 | `/relay/build/choose` | Model comparison, decision guide, links to per-model parts lists |
| — | *Fork* | Path diverges per model |
| 4 | `/relay/build/assembly` | Neck attachment and alignment, bridge installation, pickup ring installation |
| 5 | `/relay/build/test` | Electronics check before stringing: pickup output, control function, switch positions |
| 6 | `/relay/build/setup` | Overview of guitar setup (neck relief, action, intonation, pickup height). Luthier handoff explained. |

### Per-Model Phases (fork)

| Step | URL | Content |
|------|-----|---------|
| 3a | `/relay/build/[model]/parts` | Full parts list with sourcing links. Specific vs flexible items labeled. Discord thread: component swaps. |
| 3b | `/relay/build/[model]/wiring` | Shared soldering/wiring fundamentals (first-time only), then per-model step-by-step connection guide with a clear wiring diagram. Photos added after physical validation. |

### Electronics Documentation Approach

- **Shared fundamentals:** How to solder, how to read a wiring diagram, tools needed. Lives once on the site, linked from all model wiring pages.
- **Per-model wiring guide:** Step-by-step connection sequence + one clear marked diagram per model. No photos until the model is physically built and validated (Lab models get diagram only; Ready models get diagram + photos).

---

## 7. Phase Plan

### Phase 1 — Platform Introduction (ships first)
**What ships:**
- `/relay` — Platform intro page with model gallery, cost/effort overview, Discord CTA
- `/relay/[model]` — All 7 model overview pages (Lab or Ready status, sound character, pickup configuration, disclosure for Lab models)

**What doesn't exist yet:** The build guide. No link to it, no stub. It simply hasn't launched.

**Discord CTA:** "Join the community — ask questions and follow development as the guides are written." Links to Discord server.

### Phase 2 — Printing + Body Assembly
**What ships:**
- `/relay/build/print`
- `/relay/build/body`

**Nav change:** "Build Guide" section appears in the sidebar with these two pages. `/relay/build/choose` and everything after shows as coming eventually (no stubs — just the nav stops here).

### Phase 3 — Lipstick Model Complete
**What ships:**
- `/relay/build/choose` (with Lipstick highlighted as Ready)
- `/relay/build/lipstick/parts`
- `/relay/build/lipstick/wiring`
- Shared wiring fundamentals page (linked from Lipstick wiring, reused by future models)

**Lipstick status:** Upgrades to Ready if not already.

### Phase 4 — Rejoined Phases
**What ships:**
- `/relay/build/assembly`
- `/relay/build/test`
- `/relay/build/setup`

These are model-agnostic and can ship any time after phase 2. Likely ship with or just after phase 3.

### Phase 5+ — Additional Models
Each additional model ships when:
- Parts list is finalized
- Wiring guide + diagram is written

Lab → Ready status upgrade happens at this point. Physical validation must precede Ready status.

---

## 8. Platform Page Design

### `/relay` Content Sections

1. **Hero:** Name + one-sentence platform description
2. **What it is / What it costs / What you get:** Three honest cards. Upfront about difficulty and expense. Not designed to scare — designed to help people make an informed decision.
3. **Model gallery:** All 7 model cards with Lab/Ready badge, one-line genre description, link to model page. Ordered: Ready models first, then Lab alphabetically.
4. **Discord CTA:** Full-width section. Framed around community and development — not about incomplete documentation.

### Model Overview Page — `/relay/[model]`

1. **Status badge** (Lab or Ready) + disclosure if Lab
2. **Sound character:** 2–3 paragraph writeup — who it's for, where it shines, how it sounds
3. **Configuration summary:** Pickups (bridge/middle/neck), selector type, control layout
4. **Recommended pickups:** Using existing `RelayRecommendedPickups` component
5. **Discord CTA:** Links to the model's Discord channel

---

## 9. Navigation Design

### Sidebar — Platform context (`/relay`, `/relay/[model]`)

```
Relay Guitar
  Platform overview
  ── Models ──
  Lipstick  [READY]
  Reef
  Velvet
  Arc
  Torch
  Current
  Hammer
```

### Sidebar — Build guide context (`/relay/build/...`)

```
Relay Guitar
  ← Platform overview
  ── Build Guide ──
  1. Printing the body
  2. Assembling the body
  3. Choose your model
  ── [Model Name] ──
    Parts list
    Wiring
  ── Continuing ──
  4. Final assembly
  5. Check before strings
  6. Setup & playability
```

The sidebar auto-switches based on current URL. The model section in the build sidebar only appears when the user is on a model-specific route.

---

## 10. Discord Server Structure

### Recommended Architecture

**Information** (read-only channels)
- `#welcome` — Platform overview, rules, how to use the server
- `#announcements` — k7rhy posts updates, guide launches, model status changes
- `#changelog` — Doc updates and model spec changes

**Community** (open channels)
- `#general` — Anything goes
- `#builds` — Share progress photos, finished builds
- `#parts-and-sourcing` — Component swaps, alternatives, sourcing tips
- `#music` — Share what you're playing

**Build Guide** (Forum channels — one thread per guide page, linked from site)
- `#printing`
- `#body-assembly`
- `#choose-your-model`
- `#final-assembly`
- `#setup-and-playability`

**Models** (Forum channels — one per model, linked from model wiring + parts pages)
- `#lipstick`
- `#reef`
- `#velvet`
- `#arc`
- `#torch`
- `#current`
- `#hammer`

### Integration Roadmap

**Phase 1 (Level A):** Direct links from the site to the relevant Discord channel or thread. No API. Implemented as static links in the Discord CTA component and on model pages.

**Phase 2+ (Level B):** A Discord bot reads pinned messages from relevant channels and surfaces them on the site via a "From the community" callout. Built with Discord Bot API + Next.js ISR (Incremental Static Regeneration) on a short revalidation interval.

**Phase 3+ (Level C):** Discord Forum channels per guide page. Bot creates/manages threads. Site widget shows thread summary (question count, top answer). Optional: Discord OAuth so logged-in users can post to threads without leaving the site.

### Thread Versioning Strategy

When guide instructions change structurally:
1. Pin a note in the old Discord thread: *"⚠️ Guide updated [date]. This thread is archived — see [new thread link] for current Q&A."*
2. Create a new thread for the updated guide. Update the site's thread mapping (stored in Netlify Blobs or a JSON config in the repo).
3. Old thread remains searchable but is clearly marked as pre-update.

---

## 11. Existing Code — What to Keep and What to Remove

### Remove
- `RelayVoteGrid` component and all voting UI
- `/api/relay-votes` route
- `relay-model-vote` cookie logic
- `plannedModelKeys` export from `config/relay-models.ts`
- Voting state from `RelayModelCard`

### Keep and Adapt
- `RelayRecommendedPickups` — keep as-is
- `RelayModelLineupNav` — keep, remove voting references
- `RelayModelCard` / `RelayModelGrid` — remove voting UI, keep card layout
- `RelayLayoutSidebar` — adapt to new nav structure
- `BomSection`, `BomItem` — used for parts lists
- `DecisionNote` — keep, useful throughout build guide
- `DownloadGroup`, `DownloadGroupFile` — keep for print file downloads
- `DocTerm` / `Term` + glossary — keep and expand as content is written
- `lib/relay.ts` path resolution — adapt to new URL structure (remove `/docs/` prefix)
- Breadcrumb helpers — adapt to new routes

### New
- `RelayModelStatusBadge` updated Lab/Ready states
- Discord CTA component (reusable, configurable per channel)
- Wiring fundamentals shared page
- `RelayLabDisclosure` component — the standard Lab model callout

---

## 12. Content Authoring Notes

- **Player vocabulary first.** Avoid luthier and electronics jargon in running text. Use `<Term id="..." />` for any term that needs explanation — it renders as plain text for readers who know it and a hover card for those who don't.
- **Expand the glossary** as content is written. Likely candidates: truss rod, neck relief, action, intonation, pickup height, humbucker, lipstick pickup, wiring harness, ground, hot wire, selector switch.
- **Lab model pages are real pages**, not placeholders. Sound character writeup, configuration summary, and Discord CTA are enough for a complete Lab page.
- **Photos follow physical builds.** Wiring guides for Lab models ship with diagrams only. Photos are added when the model is physically built and validated, at which point status upgrades to Ready.
