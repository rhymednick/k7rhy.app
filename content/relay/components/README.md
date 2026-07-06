# Relay Components Shopping List Author Guide

The Relay components shopping list is content-driven. Edit the files in this folder when the parts list changes; the page at `/relay/parts` reads these files at build time.

## Folder Layout

- `index.mdx` controls the introductory copy at the top of the shopping list page.
- `items/*.mdx` contains the reusable component records. Each physical part or purchase line gets one file.
- `models/*.json` controls which model-specific items appear when a builder selects a Relay voicing.

Do not edit `models/missing-component-test.json` for content changes. It intentionally references a missing item so the test suite can verify error handling.

## Editing An Existing Item

Open the matching file in `items/`, then edit the frontmatter or body copy.

Example:

```mdx
---
id: 'hardtail-bridge'
title: 'Fixed Hardtail Bridge'
category: 'Guitar Hardware'
order: 20
quantity: '1'
scope: 'common'
specificity: 'specific'
source:
    label: 'Amazon'
    href: 'https://amzn.to/4smY8ST'
priceKey: 'hardtail-bridge'
fallbackPrice: '$15.00'
substitution: 'Any string-through hardtail bridge with matching spacing works.'
---

The Relay body is designed around a fixed string-through hardtail bridge.
```

The paragraph after the frontmatter is the item description shown in the shopping list.

## Adding A New Item

1. Create a new file in `items/`, such as `items/output-jack.mdx`.
2. Give it a unique `id`. Use lowercase kebab-case.
3. Fill in the required frontmatter fields.
4. Add a short body paragraph explaining why this part is listed.
5. If `scope` is `model`, add the item `id` to each model JSON file that should include it.

## Frontmatter Fields

Required fields:

- `id`: Stable content ID, such as `output-jack`. Model JSON files refer to this exact value.
- `title`: Display name shown in the shopping list.
- `category`: Must be one of `Body Construction`, `Guitar Hardware`, or `Electronics`.
- `order`: Sort order within the category. Lower numbers appear first.
- `quantity`: Display quantity, such as `1`, `2`, `1 set`, or `1 network`.
- `scope`: Use `common` for parts shown for every Relay build. Use `model` for parts only shown when a voicing is selected.
- `specificity`: Use `specific` when the listed part is important to the reference build. Use `flexible` when common substitutes are expected.
- `source.label`: Vendor label shown on the page.
- `source.href`: Purchase or reference URL.
- `priceKey`: Stable key used for cached pricing. Usually match the `id`.
- `fallbackPrice`: Price shown when no cached price is available.

Optional field:

- `substitution`: Short alternative guidance. This appears as an `Alternative:` note under the item.

## Categories

Use these exact category names:

- `Body Construction`: printing, filament, adhesive, finishing, or body-build materials.
- `Guitar Hardware`: neck, tuning machines, strap buttons, bridge, ferrules, strings, screws, knobs, and similar mechanical parts.
- `Electronics`: pickups, pots, switches, capacitors, resistors, output jack, wire, shielding, and other circuit parts.

## Common Versus Model-Specific

Use `scope: 'common'` when every Relay model needs the item. Common items appear even when no voicing is selected.

Use `scope: 'model'` when the item depends on the selected voicing. Model-specific items do not appear by themselves; they must be listed in one or more files under `models/`.

## Model Files

Each JSON file in `models/` maps a voicing slug to the model-specific item IDs that should be added to the shared list.

Example:

```json
{
    "model": "lipstick",
    "components": ["gfs-neck-pickup", "gfs-lipstick-pickup", "gfs-bridge-pickup", "push-push-pots", "selector-switch", "tone-capacitor", "treble-bleed"]
}
```

Rules:

- The `model` value must match the filename. `lipstick.json` must contain `"model": "lipstick"`.
- Every ID in `components` must exist as an `id` in `items/*.mdx`.
- The display order still comes from each item's `category` and `order`, not from the JSON array order.

## Validation

Run this after editing the shopping-list content:

```bash
npx vitest run lib/relay-components.test.ts
```

Run the full build before publishing a larger content update:

```bash
npm run build
```
