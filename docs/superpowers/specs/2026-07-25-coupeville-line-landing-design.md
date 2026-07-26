# Coupeville line landing + model pages — design

**Date:** 2026-07-25

## Problem

Coupeville is the line of instruments Rhy builds by hand, the sibling to the free,
self-print Relay Guitar platform. Today the only Coupeville presence on the site is a single
individual instrument record (CVL26001, at `/sn/CVL26001`); the line has no landing page and
no per-model pages. Visitors have nowhere to learn what the Coupeville line is, how it relates
to Relay, or what model variations exist. Eventually each Relay voicing becomes a Coupeville
model that can be purchased.

## Goals

- A `/coupeville` landing page that explains the line and its relationship to Relay.
- A model page per Coupeville variation, describing the variation itself.
- A `/products/coupeville` commerce home, wired now but empty, that routes buyers to a
  special-order flow while no units are listed.
- Discoverable navigation to all of the above.

## Non-goals

- Selling anything yet (no Shopify products, prices, or buy buttons for individual units).
- Serial/model-code additions for future variants (only Current has serials today; `CVL` is
  already mapped in `config/instrument-model-codes.ts`).
- Per-model wiring specs. Coupeville uses a different control scheme than Relay, so model
  pages describe the **voice** (which does not change between lines), not controls or wiring.
- Framing Coupeville as a *derivation* of Relay. The two lines are **siblings with shared
  parentage** — both express voices Rhy designed. Coupeville is never described as the "built
  version of" a Relay voicing. The brand narrative may speak to the shared voice lineage, but
  the shared voice description is **duplicated** into the Coupeville content (no runtime
  dependency on `relay-voicings.ts`), so each line stands on its own in code.

## Core design decision: models are state-free descriptions

A Coupeville model page is a **catalog description of the variation**, not a status board. It
carries no "planned / available / built" wording and no per-model availability signal. All
model pages are structurally uniform. Purchase availability lives entirely on
`/products/coupeville`: if a model isn't listed there, the visitor reaches out for a special
order. This keeps the model pages timeless and honest, and concentrates all "state" in one
place (the product listing).

## The model set

Six models — one per Relay voicing **except `hammer`** (a concept, not a released voice). The
slug column doubles as the model slug and identifies which Relay voice the copy is seeded from
(a design-time reference only; there is no runtime link between the lines):

| Coupeville model    | slug       |
| ------------------- | ---------- |
| Coupeville Current  | `current`  |
| Coupeville Lipstick | `lipstick` |
| Coupeville Reef     | `reef`     |
| Coupeville Velvet   | `velvet`   |
| Coupeville Arc      | `arc`      |
| Coupeville Torch    | `torch`    |

## Architecture

### 1. Registry — `config/coupeville-models.ts` (new)

Single source of truth for the model set. Self-contained — no reference to `relay-voicings.ts`:

```ts
interface CoupevilleModel {
    slug: string; // e.g. "current"
    name: string; // e.g. "Coupeville Current"
    tagline: string; // short voice descriptor for the card
    genres: string; // e.g. "Funk · Pop · Rock"
    description: string; // voice-focused summary of the variation
    href: string; // `/coupeville/${slug}`
}
```

- No `status` field (per the core decision).
- No `relayVoicingSlug` / runtime cross-reference. Genre and voice descriptions are
  **duplicated** into this registry — copy is owned by Coupeville, with no runtime coupling to
  `relay-voicings.ts`. Seed copy comes from the corresponding Relay voicing's *voice* facts,
  reworded to describe the sound only (not Relay's controls/wiring, which differ). The copy
  may acknowledge the shared, designed voice lineage but must not frame Coupeville as derived
  from Relay.
- A helper `getCoupevilleModel(slug)` and the exported `coupevilleModels` array.
- Types live in `types/coupeville.ts` (new) alongside the existing type modules.

### 2. Landing page — `/coupeville`

MDX-driven, mirroring the Relay platform landing (`content/relay/index.mdx` +
`app/relay/page.tsx`):

- `content/coupeville/index.mdx` — the copy.
- `app/coupeville/page.tsx` — loads and renders the MDX with the shared MDX components,
  wrapped in `DocPage` with a breadcrumb.
- A small `CoupevilleHero` component (mirrors the text-only `RelayHero`).

First-person singular voice throughout (per house style). Sections:

1. **Hero** — tagline: the instruments I build by hand.
2. **The Coupeville line** — what it is and the name's origin (adapted from the existing
   "The Coupeville line" copy in CVL26001.mdx).
3. **Coupeville and Relay** — the sibling-lines explainer: both lines share a common
   parentage — voices I designed. Relay is the free, self-print DIY platform; Coupeville is
   the hand-built line. Two expressions of the same voices, not one derived from the other.
   This section may link to the Relay line as a sibling reference at the line level.
4. **The models** — a **grid** (`CoupevilleModelGrid`) with one card per model, driven by the
   registry: model name, genre line, and short voice descriptor. Each card links to its
   `/coupeville/[slug]` page. **No status badges** (state-free).
5. **Own a Coupeville** — how to get one: check `/products/coupeville`; if nothing is
   listed, reach out for a special order (`/contact`).
6. **Community** — Discord CTA (reuse an existing Discord CTA component).

The grid mirrors `RelayVoicingGrid`/`RelayVoicingCard` structurally, but with the status
badge removed — a `CoupevilleModelGrid` + `CoupevilleModelCard` pair.

### 3. Model pages — `/coupeville/[slug]`

- `app/coupeville/[slug]/page.tsx` with `generateStaticParams()` over `coupevilleModels`
  and `generateMetadata()` per model. Unknown slug → `notFound()`.
- Descriptive prose per model lives in `content/coupeville/models/[slug].mdx`, so copy stays
  editable in `content/` (repo idiom). Current gets richer copy adapted from CVL26001; the
  other five get honest, coherent copy describing the voice (duplicated/reworded from the
  matching Relay voicing's voice facts — sound only, not controls).
- Uniform structure for every model:
  - Title + one-line lead describing the voice.
  - Genre line and voice/character description (copy owned by Coupeville; may note the voice
    as one of the designed platform voices, but not framed as derived from Relay).
  - "Own one" CTA → `/products/coupeville`.
  - Breadcrumb: Coupeville / [model name].
- No state, no per-model serial links, no availability badges, and no per-model links back to
  Relay voicing pages — all six read the same way.

### 4. Products — `/products/coupeville` (wired, empty)

- Add `COUPEVILLE = 'coupeville'` to the `ProductCategory` enum (`types/product.ts`).
- Register an empty product list in `config/products/index.ts` (`productsByCategory` and
  `configsByCategory`).
- Add a `categoryInfo` entry in `app/products/[category]/page.tsx` (Guitar icon, line
  description). `generateStaticParams` already iterates the enum, so the route builds
  automatically.
- Replace the generic empty state, **for the Coupeville category**, with a made-to-order CTA:
  "These are built to order — reach out to commission one," linking to `/contact` and Discord.
  Other categories keep their existing empty state.
- Surface Coupeville on the main `/products` index (`app/products/page.tsx`) as a category
  section so it's discoverable; its empty section carries the same special-order CTA.

### 5. Navigation

- Add `{ title: 'Coupeville', href: '/coupeville' }` to `mainNav` in `config/navigation.ts`,
  after "Relay Guitar".

## Testing

- `config/coupeville-models.test.ts` — the six expected slugs are present, `hammer` is
  excluded, every entry has non-empty `genres`/`description`, and no `status` field exists.
- Model route test — `generateStaticParams` yields the six slugs; a known slug renders and an
  unknown slug is handled.
- Landing render test — `/coupeville` renders its sections and the model grid links to each
  model.
- Grid test — `CoupevilleModelGrid` renders one card per model and no status badges.
- Products test — `getProductsByCategory(COUPEVILLE)` is empty and the category route renders
  the special-order CTA.
- Navigation test/assertion — `mainNav` includes the Coupeville entry.

## Verification

- `npx vitest run` — full suite green.
- `npm run build` — compiles and generates the sitemap (the new static routes included).

## Open/confirmed decisions

- **Models are state-free** — confirmed.
- **Lineup is a grid** — confirmed (reconsidered from prose).
- **Siblings with shared parentage, not a derivation** — confirmed. Brand narrative may speak
  to the shared voice lineage; voice copy is duplicated (no runtime coupling). The landing
  explainer may link to the Relay line; model pages stay self-contained (no per-model links).
- **Model pages exist for all Relay models except hammer** — confirmed.
- **`/products/coupeville` shown on the `/products` index while empty** — proposed default.
- **Special-order CTA points to `/contact` + Discord** — proposed default.
