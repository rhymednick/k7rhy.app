# Relay Components Shopping List Design

## Purpose

Relay needs one trustworthy place for builders to answer "what do I buy?" across all models. The current documentation mixes shared hardware, model-specific electronics, compatibility notes, and build-stage instructions. That makes the instruction flow harder to follow and risks duplicating component data across pages.

This design adds a platform-level components shopping-list system that keeps one source of truth for parts while letting model pages and build instructions link into the right filtered view.

## Information Architecture

Add a canonical platform page at `/relay/components`.

The page is organized into three top-level categories:

- **Body Construction**: filament, epoxy, finishing supplies, and other body-build materials.
- **Guitar Hardware**: neck, tuning machines, strap buttons, bridge, string ferrules, strings, backplate screws, truss rod cover screws, knobs, neck ferrules, and other non-electronic hardware.
- **Electronics**: output jack, hookup wire, shielding materials, pickups, pots, switches, capacitors, resistors, treble bleed networks, and other circuit components.

Model pages do not render their own partial shopping lists. Instead, they link to `/relay/components` with URL state that pre-selects the model and jumps to the relevant section, for example `/relay/components?model=lipstick#electronics`.

Build-stage instruction pages remain procedural. They should tell builders what to do with parts at the right moment, not become purchasing pages.

## Authoring Model

Component data should be editable by a technical writer without requiring TypeScript changes for ordinary catalog updates.

Use structured content files under `content/relay/components/` as the component source of truth. Each component record should include:

- stable ID
- title
- category
- quantity or quantity note
- source name and URL
- price-cache key and fallback price
- common/model-specific scope
- specificity/flexibility status
- substitution guidance
- short explanatory MDX body

Model manifests should reference component IDs instead of repeating component data. A model manifest defines which model-specific electronics and optional variations apply to that model. Shared platform parts are included automatically.

This keeps "output jack", "locking tuners", or "3-way selector" as single records, while allowing multiple models and pages to reuse them.

## Shopping List Behavior

The `/relay/components` page renders all categories from the shared catalog.

The model selector filters or annotates model-specific items:

- Shared items are always visible.
- Model-specific items appear when their model is selected.
- If no model is selected, the page should make model-specific sections visible enough to show that the choice matters, but should avoid presenting a misleading complete cart.
- Deep links can select a model and scroll to a category section.

The selector should use existing Relay voicing data where possible so labels, slugs, and status stay consistent with the rest of the site.

## Model Page Integration

Each Relay voicing page can include a short generated parts profile, not a shopping list. The profile answers what differs for this model at a glance:

- shared body and hardware set
- pickup family
- control/switching differences
- notable caps, resistors, or omitted components

The primary action links to the canonical shopping page with the model pre-selected.

Example link text: "View Relay Lipstick shopping list".

## Navigation

Add `Components` to the Relay platform navigation near the top of the build process, before model-specific assembly work. The page is a planning and sourcing surface, not a fourth build stage.

The current build-process mental model remains:

- Body answers "how do I make the printed structure?"
- Voicings answer "what am I building?"
- Components answers "what do I buy?"
- Assembly answers "what do I do with the parts?"

## Compatibility And Migration

The existing `content/relay/lipstick/bom.mdx` should be treated as migration input, not the long-term source of truth.

Existing prose from the Lipstick BOM can be moved into component records where it describes a reusable part. Lipstick-only electronics notes should move into Lipstick model associations or model-specific component records.

Compatibility guidance remains separate from the shopping list when it is about fit, dimensions, or substitution boundaries. The shopping list can link to compatibility pages where a part requires careful measurement.

## Testing

Implementation should include focused tests for:

- catalog loading and validation
- model-specific item resolution
- deep-link model selection behavior
- category rendering order
- missing component IDs in model manifests

Existing Relay route and breadcrumb tests should be updated for the new `/relay/components` route and nav entry.

## Non-Goals

This design does not require a cart system, price scraping, checkout flow, or a full inventory database.

This design does not require duplicating full shopping lists on model pages.

This design does not change the Relay body, electronics design, or model lineup.
