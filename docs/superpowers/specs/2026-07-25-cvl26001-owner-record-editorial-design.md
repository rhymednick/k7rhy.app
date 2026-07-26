# CVL26001 Owner Record Editorial Design

**Status:** Approved in conversation on 2026-07-25

## Purpose

Refocus the CVL26001 serial-number page as the permanent record of an individually crafted instrument. Its primary reader is the guitar's owner, especially when learning the instrument or sharing its story with someone else.

The page is not a product listing, a development log, or an advertisement. It may support future marketing because it presents the instrument well, but it must never address prospective buyers at the owner's expense.

Every sentence must help the owner do at least one of four things:

- understand what makes the instrument distinct
- use and explore the instrument
- maintain the instrument and its as-built specification
- tell the instrument's provenance and lineage

Remove content that exists only to explain the builder's process, promote another page, qualify a claim unnecessarily, document future development, or create a marketing funnel. Do not include anything the owner would not value in the canonical record.

## Editorial Voice

Write with the confidence and restraint of a maker documenting a finished instrument. The voice should be personal enough to establish provenance, precise enough to serve as a permanent reference, and musical enough to help the owner use the guitar.

Avoid:

- sales language and calls to action
- development disclaimers
- abstract claims that do not help the player
- clinical explanations where direct musical language will do
- telling the player what they must hear
- technical details in the printable case card

Use technical detail on the full record when it identifies the instrument's installed specification or helps with future maintenance.

## Identity and Provenance

Use this origin statement:

> The first production Coupeville Current, personally crafted by Rhy Mednick in 2026.

Use this theme statement:

> Familiar humbucker voices shaped through a middle Filtertron, with six engineered presets ranging from pronounced interaction to the direct voice of the selected pickups.

Open the narrative with a section titled `The Coupeville line`:

> Coupeville is the name Rhy Mednick gives to the instruments he personally crafts. The line takes its name from the small town community that inspired it, and each instrument carries that community's spirit along with Rhy's personal workmanship.
>
> CVL26001 is the first production Coupeville Current—the instrument that establishes the model and begins its recorded lineage.

Do not describe Coupeville as a current or permanent workshop location. Do not turn that constraint into a disclaimer.

## Design Lineage

Follow with a section titled `The Current lineage`:

> Coupeville Current evolves the pickup philosophy first explored in [Relay Current](/relay/voicings/current): the bridge and neck humbuckers remain the guitar's primary voices, while a middle Filtertron changes how those voices respond. CVL26001 gives that relationship a new control system—a six-position rotary switch with repeatable harmonic-shaping presets instead of the original design's switched contours.
>
> The result remains familiar at its foundation. The three-way selector chooses neck, both humbuckers, or bridge; the rotary switch determines how strongly the middle Filtertron interacts with that selection.

This inline link is the only Relay Current link. It exists as quiet supporting context for a curious owner. Remove the standalone related-content call to action from frontmatter.

## Musical Purpose

Use a section titled `What it is voiced to do`:

> Coupeville Current is built around clear attack, controlled low end, and a focused place in the mix. Rather than multiplying pickup combinations, it develops three dependable humbucker voices through different degrees of interaction with the middle Filtertron.
>
> The bridge provides the firmest attack and strongest rhythmic focus. The neck offers a rounder, more open foundation. Together they create the broadest of the three primary voices. Each remains recognizable as the harmonic shaper changes its emphasis and response.

Rewrite the three pickup-selector descriptions to match this explanation. They should identify each selection's musical role rather than merely restating which pickup is connected.

## Exploring the Harmonic Shaper

Use a section titled `Exploring the harmonic shaper`:

> Position 6 is the direct reference: the middle Filtertron is disconnected, and the selected humbucker voice passes unchanged. From there, positions 5 through 1 introduce progressively stronger interaction. This makes it easy to begin with a familiar pickup sound, then add only as much focus, texture, and harmonic complexity as the part needs.
>
> The control is designed for comparison rather than guesswork. Choose a pickup voice, begin at position 6, and move through the presets while keeping the three-way selector unchanged.

Replace the existing abstract preset descriptions with these owner-facing descriptions:

1. `The middle Filtertron has its strongest effect on the selected humbucker voice.`
2. `Strong interaction, with more of the selected humbucker's original character.`
3. `The center of the range, balancing the selected humbucker with the harmonic shaper.`
4. `Light interaction that brings the selected humbucker further forward.`
5. `The closest shaped setting to the selected humbucker alone.`
6. `The middle Filtertron is disconnected; the selected humbucker voice passes unchanged.`

These descriptions appear in both the web control map and printable case card. The installed passive-network values remain visible only on the full web record.

## Installed Voice System

Use a section titled `Installed voice system`:

> The primary voices come from a GFS Vintage 59 neck humbucker and a GFS Professional Series Alnico V HOT bridge humbucker. A GFS Retrotron Hot Nashville occupies the middle position, but it is dedicated to harmonic shaping rather than pickup selection.
>
> The three-way selector keeps the guitar's foundation straightforward. Master volume and tone apply across the instrument, while the six-position rotary switch controls the middle Filtertron's interaction with the selected voice.
>
> The master volume uses an A500K audio-taper control with a parallel 680 pF and 150 kΩ treble-bleed network. The master tone uses an A500K audio-taper control and a 22 nF capacitor. The six rotary-switch networks documented in the control map are the installed values for CVL26001.

This is the permanent as-built reference. Retain the exact pickup models, control values, tone capacitor, treble-bleed topology, and all six rotary-switch networks.

## Playing and Setup

Replace `Builder Notes` with `Playing and setup`:

> CVL26001 is designed for 9–42 strings. The plastic body is engineered for a maximum string load equivalent to a 10–46 set. Do not use heavier strings.
>
> To hear the harmonic shaper's range most clearly, begin with a clean or lightly driven amplifier setting that preserves pick attack. Select one of the three humbucker voices, start with the rotary switch at position 6, and work toward position 1. Once the relationship between the presets is familiar, they can be used just as readily with heavier gain or effects.

This section belongs on the full owner record only. Do not add strings or amplifier guidance to the case card.

The 10–46 maximum is a structural limit of the plastic body, not a setup preference. Never imply that adjustment or reconfiguration can make the instrument safe for a heavier string load.

## Printable Case Card

The case card remains a quick musical reference rather than a condensed copy of the web narrative. It includes:

- instrument identity, serial, completion year, and concise theme
- pickup layout on one row
- musical roles of the three pickup-selector positions
- musical functions of master volume and master tone
- concise harmonic-shaper purpose
- the six revised owner-facing preset descriptions
- existing permanent-record and owner-support treatment

It excludes component values, circuit topology, setup recommendations, amplifier guidance, lineage narrative, builder-process language, and promotional links.

## Implementation Scope

The editorial pass changes content and shared harmonic-shaper copy. It does not redesign the serial page, alter the control architecture, change serial metadata, or introduce new page components.

Update tests that intentionally lock canonical copy. Preserve all structural and validation coverage. Verify formatting, lint, the complete test suite, the production build, desktop and mobile presentation, and one-page Letter/A4 case-card output.

Because the physical guitar has not yet been built, retain the clearly non-photographic placeholder. The final record must be reviewed against the completed instrument and its photograph before sale; that internal requirement must not appear as customer-facing disclaimer text.
