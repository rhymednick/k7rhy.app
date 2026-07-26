# Coupeville line landing + model pages — design

**Date:** 2026-07-25

## Problem

Coupeville is the line of instruments Rhy builds by hand, the sibling to the free,
self-print Relay Guitar platform. Today the only Coupeville presence on the site is a single
individual instrument record (CPC26001, at `/sn/CPC26001`); the line has no landing page and
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
- Serial/model-code additions for future variants (only Current has serials today; `CPC` is
  already mapped in `config/instrument-model-codes.ts`).
- Per-model wiring specs for variations that aren't built. Model pages describe voice and
  intent, drawn from the authoritative Relay voicing documentation — they do not invent
  build details.

## Core design decision: models are state-free descriptions

A Coupeville model page is a **catalog description of the variation**, not a status board. It
carries no "planned / available / built" wording and no per-model availability signal. All
model pages are structurally uniform. Purchase availability lives entirely on
`/products/coupeville`: if a model isn't listed there, the visitor reaches out for a special
order. This keeps the model pages timeless and honest, and concentrates all "state" in one
place (the product listing).

## The model set

Six models — every Relay voicing **except `hammer`** (a concept, not a released voice):

| Coupeville model    | Relay voicing slug |
| ------------------- | ------------------ |
| Coupeville Current  | `current`          |
| Coupeville Lipstick | `lipstick`         |
| Coupeville Reef     | `reef`             |
| Coupeville Velvet   | `velvet`           |
| Coupeville Arc      | `arc`              |
| Coupeville Torch    | `torch`            |

## Architecture

### 1. Registry — `config/coupeville-models.ts` (new)

Single source of truth for the model set. Each entry:

```ts
interface CoupevilleModel {
    slug: string; // matches the Relay voicing slug
    name: string; // e.g. "Coupeville Current"
    relayVoicingSlug: string; // cross-links to config/relay-voicings.ts
    summary: string; // short, Coupeville-voiced description of the variation
    href: string; // `/coupeville/${slug}`
}
```

- No `status` field (per the core decision).
- Genre and voice-family facts are read from the linked Relay voicing (`relay-voicings.ts`)
  rather than duplicated, so the two lines never drift.
- A helper `getCoupevilleModel(slug)` and the exported `coupevilleModels` array.
- Types live in `types/coupeville.ts` (new) alongside the existing type modules.

### 2. Landing page — `/coupeville`

MDX-driven, mirroring the Relay platform landing (`content/relay/index.mdx` +
`app/relay/page.tsx`):

- `content/coupeville/index.mdx` — the copy.
- `app/coupeville/page.tsx` — loads and renders the MDX with the shared MDX components,
  wrapped in `DocPage` with a breadcrumb.
- A small `CoupevilleHero` component (mirrors the text-only `RelayHero`).

First-person singular voice throughout (per house style). Sections (prose, **no status
grid**):

1. **Hero** — tagline: the instruments I build by hand.
2. **The Coupeville line** — what it is and the name's origin (adapted from the existing
   "The Coupeville line" copy in CPC26001.mdx).
3. **Coupeville and Relay** — the two-lines explainer: Relay is the free, self-print DIY
   platform; Coupeville is the same family of voices, built by my hands. Two ways to get the
   guitar.
4. **The variations** — prose that names each of the six models, each linking to its
   `/coupeville/[slug]` page. Descriptive only; no availability language.
5. **Own a Coupeville** — how to get one: check `/products/coupeville`; if nothing is
   listed, reach out for a special order (`/contact`).
6. **Community** — Discord CTA (reuse an existing Discord CTA component).

### 3. Model pages — `/coupeville/[slug]`

- `app/coupeville/[slug]/page.tsx` with `generateStaticParams()` over `coupevilleModels`
  and `generateMetadata()` per model. Unknown slug → `notFound()`.
- Descriptive prose per model lives in `content/coupeville/models/[slug].mdx`, so copy stays
  editable in `content/` (repo idiom). Current gets richer copy adapted from CPC26001; the
  other five get honest, coherent copy built from the Relay voicing's documented character.
- Uniform structure for every model:
  - Title + one-line lead ("the hand-built Coupeville take on the Relay [X] voice").
  - Genre line and voice/character description (facts sourced from the linked Relay voicing).
  - "Based on the Relay [X] voicing" cross-link → `/relay/voicings/[slug]`.
  - "Own one" CTA → `/products/coupeville`.
  - Breadcrumb: Coupeville / [model name].
- No state, no per-model serial links, no availability badges — all six read the same way.

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
  excluded, every `relayVoicingSlug` resolves against `relay-voicings.ts`, and no `status`
  field exists on entries.
- Model route test — `generateStaticParams` yields the six slugs; a known slug renders and an
  unknown slug is handled.
- Landing render test — `/coupeville` renders its sections and links to each model.
- Products test — `getProductsByCategory(COUPEVILLE)` is empty and the category route renders
  the special-order CTA.
- Navigation test/assertion — `mainNav` includes the Coupeville entry.

## Verification

- `npx vitest run` — full suite green.
- `npm run build` — compiles and generates the sitemap (the new static routes included).

## Open/confirmed decisions

- **Models are state-free** — confirmed.
- **Lineup is prose, not a grid** — confirmed.
- **Model pages exist for all Relay models except hammer** — confirmed.
- **`/products/coupeville` shown on the `/products` index while empty** — proposed default.
- **Special-order CTA points to `/contact` + Discord** — proposed default.
