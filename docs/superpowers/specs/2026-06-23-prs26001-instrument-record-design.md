# PRS26001 Instrument Record Design Specification

**Status:** Awaiting written-spec approval

## Purpose and Scope

Create the permanent serialized reference page and printable case card for the modified PRS guitar identified as `PRS26001`.

This work includes only:

- `/sn/PRS26001`
- `/sn/PRS26001/print`
- the instrument photograph and MDX record supporting those routes
- the minimal shared date-display enhancement needed to describe a modified instrument accurately
- a durable TODO for a separate future sale page

This work does not create a `/products/guitars/` page or any other sale listing.

## Editorial Boundary

The record documents the guitar, not the transaction or the owner's private attachment to it.

The page may explain that the guitar served as the K7RHY platform-reference instrument while other builds were developed and evaluated. That fact is part of the instrument's provenance and explains the intent behind its voicing.

The page and case card must not mention:

- asking price or market value
- availability, negotiation, or purchasing instructions
- the owner's personal attachment to the guitar
- the owner's replacement guitar
- a reason for selling
- the removed factory pickups or any claim that the changes are reversible

Discord remains on the case card as owner support, consistent with the serialized-record system. It is not presented as a sales contact.

## Identity

- **Serial:** `PRS26001`
- **Serial interpretation:** PRS, modified in 2026, first PRS entry
- **Record name:** `PRS SE Custom 24 Burled Ash`
- **Base instrument:** 2024-production PRS SE Custom 24 Burled Ash Limited Edition, Natural
- **Record date display:** `Modified 2026`
- **Origin:** `A 2024-production PRS SE Custom 24 Burled Ash Limited Edition, upgraded and individually voiced by K7RHY Resonance Lab in 2026.`
- **Theme:** `A warm, touch-sensitive Alnico II instrument that moves from full humbucker authority to partial-split snap and articulate parallel cleans without changing its familiar two-knob workflow.`
- **Condition note on web page only:** Excellent condition, with no visible marks found when this record was created
- **Canonical URL:** `https://k7rhy.app/sn/PRS26001`

The supplied `BurlPRS.png` photograph will be optimized and copied to `public/images/instruments/PRS26001/`. It will be the web hero image and will not appear on the case card.

## Base Platform Description

The web narrative will identify the guitar as a natural-finish Burled Ash Limited Edition SE Custom 24 and document these platform details:

- solidbody PRS SE Custom 24 construction
- burled/swamp-ash veneer over a maple top
- mahogany back
- Wide Thin maple neck
- rosewood fingerboard with bird inlays
- 24 frets
- 25-inch scale length
- PRS molded tremolo
- nickel hardware
- upgraded PRS locking tuners

The narrative will not claim a production quantity or include factory-pickup details, because neither is necessary to the permanent modified-instrument record.

## K7RHY Platform-Reference Story

The narrative will state that the guitar served as the K7RHY platform-reference instrument while other guitars were being designed, assembled, and evaluated. Its role was to provide a consistent baseline for feel, dynamic response, switching utility, and clean-to-edge-of-breakup voicing.

This will be written as instrument provenance, not personal memoir or sales copy.

## Installed Electronics

The two supplied PDFs are the authoritative as-built wiring source. The HTML guide is treated as an earlier planning document where it conflicts with the PDFs.

Installed configuration:

- Seymour Duncan APH-1b Alnico II Pro bridge humbucker
- Seymour Duncan APH-1n Alnico II Pro neck humbucker
- Oak Grigsby five-way blade selector
- 500 kΩ audio-taper master volume
- 500 kΩ audio-taper push-pull master tone
- 0.022 µF film tone capacitor
- approximately 1.8 kΩ partial-split resistor for each split path
- standard Seymour Duncan conductor convention: black hot, green and bare ground, red and white series link
- screw coil faces the bridge on both pickups

Low-level lug and conductor instructions will remain source documentation and will not be reproduced on the owner-facing page or case card.

## Voice Map

Selector positions are displayed in physical order from bridge to neck and numbered automatically.

### Push-Pull Down: Core Mode

1. **Bridge — Full Punch:** Bridge humbucker internally in series; firm low end, rounded Alnico II attack, and full output for rhythm or lead work.
2. **Inside Coils — Money Funk:** Bridge and neck inside coils with partial splits; bright, percussive, and intentionally resistant to the thinness of a hard split.
3. **Both Humbuckers — Wide Blend:** Both pickups, each internally in series and combined in the normal parallel pickup relationship; broad, creamy, and balanced.
4. **Neck Partial Split — Touch Voice:** Neck pickup partial split; open, responsive, and single-coil-like without abandoning body.
5. **Neck — Warm Voice:** Neck humbucker internally in series; warm, articulate, and expressive.

### Push-Pull Up: Refined/Clean Mode

The tone control continues to provide conventional treble rolloff. Pulling it changes the internal wiring of the full-humbucker voices:

- Positions 1, 3, and 5 convert the active humbuckers from internal series wiring to internal parallel wiring, reducing output while increasing clarity and retaining hum cancellation.
- Positions 2 and 4 remain unchanged.

The case card will describe the push-pull transformation compactly instead of duplicating a ten-cell matrix. The web narrative may explain the musical effect in more detail.

## Structured MDX Record

The MDX record will contain:

- one `PickupConfiguration` with bridge and neck APH-1 pickups
- useful pickup details for magnet and installed wiring role
- one five-position `Selector`
- one standard master-volume `Pot` with a `normal` state
- one push-pull master-tone `Pot` with `down` and `up` states
- ordinary MDX sections for the platform, K7RHY reference role, installed work, condition when documented, and voice-use guidance

The selector and pot descriptions must remain concise enough to fit the corrected Letter/A4 print-safe case-card layout at 100% browser scale.

## Year-Only Modified-Date Support

The current instrument schema requires a complete ISO date and all presentations label it `Completed`. That is inappropriate here because the exact customization date is not relevant and must not be invented.

The shared record model will therefore support:

- `completed` as either `YYYY` or `YYYY-MM-DD`
- an optional `dateLabel` string that defaults to `Completed`

`PRS26001` will use:

```yaml
completed: '2026'
dateLabel: 'Modified'
```

The visible result will be `Modified 2026` on both the web page and case card. Existing full-date records remain unchanged. The year validator must continue requiring the frontmatter year to match the serial-number year.

## Printable Case Card

The card will retain the existing K7RHY masthead, serial, QR code, canonical URL, Discord support link, and print-safe 95% internal composition.

Its content priority is:

1. identity and `Modified 2026`
2. short theme statement
3. five automatically numbered core selector voices
4. standard volume behavior
5. push-pull tone down/up behavior
6. compact APH-1 pickup configuration
7. origin
8. permanent URL, Discord, and QR code

It will not include the photograph, condition, price, sale language, personal history, or removed components.

## Deferred Sale Page TODO

Add a durable TODO to `.remember/remember.md`:

> Create a separate sale page for PRS26001. That future page may include the owner's personal connection, reason for selling, asking price, transaction details, included accessories, and sale-specific photography. None of those concerns belong in the permanent serial record or case card.

## Verification

Automated verification will cover:

- year-only `completed` validation
- default and custom date labels
- serial-year mismatch rejection for year-only records
- unchanged full-date formatting for existing records
- `Modified 2026` on web and case-card presentations
- valid five-way selector and standard/push-pull pot structures
- PRS26001 static route generation
- canonical QR destination
- print-safe geometry regression

Rendered verification will cover:

- desktop and mobile web layouts
- standard site header and footer
- optimized photograph rendering
- all five selector positions and both push-pull states
- one-page Letter and A4 print output at 100% browser scale
- QR and footer clearance
- absence of sales language and personal-owner narrative
