# CPC26001 Coupeville Current Instrument Record Design

**Status:** Approved in conversation on 2026-07-25

## Purpose

Publish the canonical serial-number record and printable case card for the first production Coupeville Current. The record is written for the customer who buys the guitar: it documents what they bought, explains the instrument's design intent, identifies the installed components and control behavior, and provides practical ownership guidance.

This instrument is a production build, not a prototype. The page must read as a boutique builder's specification: restrained, precise, and focused on musical purpose before electronics. It must not contain development disclaimers, marketing exaggeration, or language telling the owner what they are supposed to hear.

## Identity and Publication

- **Serial:** `CPC26001`
- **Serial interpretation:** `CPC` for Coupeville Current, `26` for completion year 2026, and `001` for the first Coupeville Current record
- **Record name:** `Coupeville Current`
- **Completion display:** `Completed 2026`
- **Publication:** `publish: true`
- **Canonical record:** `/sn/CPC26001`
- **Printable case card:** `/sn/CPC26001/print`

Add `CPC: 'Coupeville Current'` to the established model-code map. The record uses year-only completion metadata through the existing `completed: '2026'` support.

The finished instrument has not yet been photographed. Add a deliberately non-photographic, clearly labeled Coupeville Current placeholder asset so the published record does not imply that another guitar is this instrument. Its alt text must identify it as a placeholder. Replace this asset with an exact-instrument photograph before the guitar is sold; the temporary asset does not change the canonical purpose of the record.

## Design Philosophy

The page leads with the musical purpose: passive harmonic shaping applied to familiar bridge and neck humbucker selections. The middle pickup is not an independent selector voice. It modifies the character of whichever humbucker selection is active, offering repeatable degrees of interaction without adding more pickup destinations.

Use this canonical platform-level explanation:

> The Harmonic Shaper modifies the character of the currently selected pickup voice. It does not select additional pickups or create separate voices. Instead, it offers six repeatable degrees of passive harmonic shaping, from maximum interaction to no interaction.

Keep that reusable explanation and the six stable player descriptions in shared code rather than duplicating them in the instrument record. Keep the installed passive network values in the `CPC26001` record because they describe this specific build.

## Installed Pickup Configuration

Use the exact pickup models already established by the Relay Current specification:

- **Neck:** GFS Vintage 59 Humbucker
- **Middle:** GFS Retrotron Hot Nashville, identified as the Harmonic Shaper pickup
- **Bridge:** GFS Professional Series Alnico V HOT Humbucker

Do not substitute another pickup set. Present the bridge and neck humbuckers as the primary selected voices and the middle pickup as the shaping element.

## Installed Controls and Electronics

Document the as-sold production specification:

- Three-way pickup selector, displayed in the requested order:
  1. Neck
  2. Neck + Bridge
  3. Bridge
- Master Volume: A500K audio taper
- Master Tone: A500K audio taper
- Tone capacitor: 22 nF
- Treble bleed: 680 pF capacitor and 150 kΩ resistor wired in parallel across the master-volume input and output
- Six-position selector labeled `Harmonic Shaper`

The treble bleed is part of the installed production specification, not an optional note.

## Generic Six-Position Control Architecture

Extend the strict instrument MDX component system with a generic six-position control rather than a Harmonic-Shaper-specific control type. The component accepts:

- a customer-facing label
- a purpose statement
- exactly six ordered positions
- a player-facing description for each position
- an optional technical reference for each position

The underlying renderer and validation are reusable for another six-position function. `Harmonic Shaper` is the configured label and role for `CPC26001`, not the type of the switch.

The three-way pickup selector continues to use the existing selector component. The web and print presentations explicitly distinguish the controls:

- `Pickup selector · 3-way`
- `Harmonic Shaper · 6-position selector`

The generic component must reject missing, extra, or unsupported children. It must render positions in authored order and infer their visible numbers, following the established selector convention.

## Harmonic Shaper Positions

Do not give the positions names. Use these numbered player descriptions exactly:

1. `Maximum harmonic shaping. The most pronounced interaction with the selected pickup voice.`
2. `Strong harmonic shaping. Increases harmonic complexity while preserving the primary character.`
3. `Moderate harmonic shaping. A balanced blend of clarity and interaction.`
4. `Gentle harmonic shaping. Adds openness with a lighter touch.`
5. `Subtle harmonic shaping. A slight enhancement to articulation and dimensionality.`
6. `Harmonic shaper bypassed. The selected pickup voice passes unchanged.`

Record these installed technical references separately from the player descriptions:

1. Direct connection
2. 47 kΩ series resistor
3. 100 kΩ series resistor
4. 100 kΩ series resistor + approximately 330 pF capacitor
5. 220 kΩ series resistor + approximately 680 pF capacitor
6. Middle pickup disconnected

The serial page presents these as the installed values for this build. It contains no future-revision or provisional-value disclaimer.

## Web Record

Reuse the existing `/sn/[serial]` route, validated instrument collection, record hero, structured specification styling, related-link treatment, and standard site layout.

The narrative order is:

1. Musical purpose and design philosophy
2. How the selected humbucker voice and middle shaping pickup interact
3. Installed controls and electrical details
4. Owner-facing Builder Notes

The Builder Notes section appears on the web record only. It includes:

- recommended strings: 9–42
- maximum recommended string weight: 10–46
- concise amplifier-pairing guidance based on useful setup characteristics rather than prescribed tone claims
- a bounded place for final listening notes when the physical build is completed

The page must not expose blank workshop forms, future-circuit-revision language, or development history to the customer.

## Printable Case Card

Reuse the dedicated `/sn/[serial]/print` route, existing K7RHY masthead, QR code, canonical URL, identity block, compact print renderer, and Letter/A4 one-page geometry.

The case card is a quick reference. Its content priority is:

1. Coupeville Current identity, `CPC26001`, and `Completed 2026`
2. Concise Harmonic Shaper purpose
3. Pickup layout
4. Three-way pickup-selector behavior
5. Master volume, master tone, tone capacitor, and treble-bleed summary
6. Six numbered Harmonic Shaper positions with the exact player-facing descriptions
7. Compact technical network values only if they fit without displacing or shrinking the player-facing reference
8. Existing origin, permanent URL, support link, and QR treatment

Do not include amplifier pairings, string recommendations, listening notes, future revisions, workshop notes, or a photograph on the case card. Add a builder/signature area only if it is consistent with the existing case-card structure and fits without weakening the quick-reference hierarchy.

## Failure Behavior

- `CPC26001` must pass the existing serial parser and year validation.
- The generic six-position component fails rendering unless it contains exactly six valid ordered position children.
- Unsupported children fail with an error that identifies the affected component.
- The web and print renderers consume the same structured control data so their position ordering and descriptions cannot drift.
- The required placeholder image must exist at build time and must not be presented as an exact instrument photograph.

## Test-First Implementation and Verification

Implement production behavior only after observing focused tests fail for the missing behavior. Automated coverage will include:

- `CPC` model-code parsing and `CPC26001` serial interpretation
- generic six-position control rendering and automatic numbering
- exact six-child validation and unsupported-child rejection
- independence of the generic control label and purpose from Harmonic Shaper terminology
- dedicated compact print rendering for all six positions
- registration in both web and print MDX component maps
- `CPC26001` record discovery and published static parameters
- the canonical player descriptions, pickup models, control values, string guidance, and absence of revision-disclaimer language
- existing print geometry regression coverage

Final verification runs formatting, linting, focused tests, the complete test suite, and `npm run build`. Rendered review checks the web page at desktop and mobile widths and confirms the case card remains one page on Letter and A4 with the quick-reference content readable.

## Scope Boundaries

This work does not:

- create a new serial-number routing system
- create a public instrument registry
- redesign existing instrument records or case cards
- update the Relay Current platform page to the new production circuit
- claim that the placeholder depicts the finished guitar
- publish amplifier/string/listening guidance on the printable case card
- introduce prototype or provisional-production language
