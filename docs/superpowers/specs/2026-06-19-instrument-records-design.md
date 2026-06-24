# Serialized Instrument Records — Design Specification

**Status:** Approved on 2026-06-19

## Purpose

K7RHY will publish a permanent record for each custom-built or modified/resold guitar. An owner can reach the record by typing the instrument serial number or scanning a QR code supplied with the guitar.

The experience must do more than expose technical data. It should make the owner feel pride in a singular, cared-for instrument while remaining recognizably part of the existing K7RHY site. The printable case card serves primarily as a quick guide to the guitar's voices and how to access them. Its maker identity, serial number, component record, and permanent URL also provide quiet provenance that can follow the guitar through resale.

## Serial Numbers and URLs

Serial numbers use eight uppercase characters in the format `MMMYYNNN`:

- `MMM`: a three-letter model, manufacturer, or platform code
- `YY`: two-digit completion year
- `NNN`: three-digit sequence number

Example: `RLY26001`.

The site will expose a simple editable code-to-description map. It has no categories or embedded taxonomy.

```ts
{
    RLY: 'Relay',
    FND: 'Fender',
    TEL: 'Telecaster-style',
}
```

The sole public route namespace is `/sn/`:

- Canonical web record: `/sn/RLY26001`
- Printable case card: `/sn/RLY26001/print`

Lowercase serial URLs redirect to their uppercase canonical equivalent. Unknown records return the standard 404 page. Records are public and may be crawled and indexed, but they are not automatically listed in a public registry or site navigation.

## Content Architecture

Each instrument is a validated MDX document named for its serial number:

```text
content/instruments/RLY26001.mdx
```

The serial is derived from the filename and is not duplicated in frontmatter. A dedicated Content Collections schema validates instrument documents during the build. Both the web route and print route render the same validated record, preventing the two presentations from drifting apart.

The frontmatter is limited to document-level identity and display metadata:

```yaml
---
publish: false
name: 'Relay Lipstick'
completed: '2026-06-19'
origin: 'Designed, built, and voiced by K7RHY Resonance Lab.'
theme: 'An articulate, touch-sensitive instrument with a familiar core and one carefully shaped alternate identity.'
images:
    - src: '/images/instruments/RLY26001/front.jpg'
      alt: 'Relay Lipstick RLY26001, full front view'
related:
    label: 'Explore the Relay Guitar family'
    href: '/relay'
---
```

The exact instrument photograph is required for the web record but does not appear on the printable case card. Additional photographs can appear in the ordinary MDX body.

`publish: false` records return 404 in production. This permits authoring, validation, and local QR checking before publication.

## Strict Instrument MDX Components

Technical configuration is authored with compound MDX components rather than nested YAML. This makes the document readable and provides a single structured source for both web and print layouts.

```mdx
<InstrumentSpec>
    <PickupConfiguration>
        <Pickup position="bridge" type="humbucker" brand="GFS" model="VEH">
            <PickupDetail label="Magnet">Alnico V</PickupDetail>
            <PickupDetail label="Resistance">11.2 kΩ</PickupDetail>
        </Pickup>

        <Pickup position="middle" type="lipstick" brand="GFS" model="Pro-Tube" />

        <Pickup position="neck" type="humbucker" brand="GFS" model="Professional Alnico II" />
    </PickupConfiguration>

    <ControlLayout>
        <Selector label="Pickup selector" positions={3}>
            <SelectorPosition voice="Bridge">Authority and attack</SelectorPosition>
            <SelectorPosition voice="Bridge + Neck">Width and balance</SelectorPosition>
            <SelectorPosition voice="Neck">Warmth and detail</SelectorPosition>
        </Selector>

        <Pot label="Master volume" mechanism="push-pull">
            <PotPosition position="down" voice="Core voice">Controls overall output.</PotPosition>
            <PotPosition position="up" voice="Lipstick Voice">Adds the middle lipstick and reshapes the bridge response.</PotPosition>
        </Pot>

        <Pot label="Master tone" mechanism="push-push">
            <PotPosition position="down" voice="Open contour">Standard treble rolloff.</PotPosition>
            <PotPosition position="up" voice="Focused contour">Tightens and focuses the response.</PotPosition>
        </Pot>
    </ControlLayout>
</InstrumentSpec>
```

The component contract is strict:

- `InstrumentSpec` requires exactly one `PickupConfiguration` and one `ControlLayout`.
- Every pickup requires `position`, `type`, `brand`, and `model`.
- `PickupDetail` entries are optional and hold useful electrical details such as magnet, resistance, or wiring.
- A selector declares whether it has three or five positions.
- `SelectorPosition` children are written in physical/display order. Their visible numbers are inferred from sequence and never authored manually.
- The number of `SelectorPosition` children must match the selector's declared position count.
- A `push-pull` or `push-push` pot requires exactly one `down` and one `up` state.
- A standard pot requires one `normal` state.
- Invalid or incomplete structures fail the build with an error that names the affected serial number and missing or invalid child. Components do not silently omit incomplete content.

Ordinary MDX content follows the structured specification. It may describe the instrument's story, design intent, work performed on a modified guitar, full construction notes, and additional photographs. If an unusual later modification occurs, it can be recorded under a plain dated heading; there is no service-history schema or maintenance workflow.

Ownership names and ownership history are out of scope. The record belongs to the instrument, which avoids privacy issues and supports uncomplicated resale.

## Web Record Experience

The instrument page is a variation on the existing site theme, not a separate visual identity.

- Preserve the standard K7RHY site header, main navigation, mobile navigation, dark-mode behavior, and footer.
- Use the site's Inter and JetBrains Mono fonts, slate surfaces, borders, radii, shadows, and restrained sky/emerald accent language.
- Place the exact instrument photograph, name, serial, completion date, origin, and theme in a proud identity-led hero.
- Present the print action near the instrument identity.
- Prioritize the structured voice and control map in the main content.
- Follow with pickup configuration and any supplied technical details.
- Render the narrative MDX body below the structured specification.
- Show an optional contextual related link before the standard footer. This supports product and Relay-platform discovery without making the ownership page feel like an advertisement.
- Use the centralized Discord invitation from `config/site.ts` for owner questions.

The record should feel archival and premium, but the differentiation comes from hierarchy and provenance rather than a new palette or type system.

## Printable Case Card

The `Print case card` action opens the dedicated print route and invokes the browser print dialog. A generated PDF pipeline is deliberately out of scope because it would introduce a second renderer and additional debugging burden.

The primary paper target is portrait US Letter (8.5 × 11 inches). The layout must also scale safely to portrait A4 without spilling onto a second page.

The card contains, in order of emphasis:

1. A masthead containing the actual site logo from `public/images/k7rhy_logo.png` alongside the full brand name, `K7RHY Resonance Lab`
2. Instrument name, serial number, and completion year
3. Short theme/character statement
4. Voice summary
5. A large structured control map containing every automatically numbered selector position and both states of every switched pot
6. Compact pickup configuration with brand and model details plus optional technical details when meaningful
7. Brief origin information
8. Permanent web URL, centralized Discord support, and a QR code for the canonical production URL

The card contains no instrument photograph. Most of its area is devoted to reminding a player which voices exist and exactly how to reach them. Maker identity, the serial, completion date, exact components, and permanent web record establish provenance without labeling the card a certificate or making an explicit proof-of-authenticity claim.

Print presentation uses the existing Inter and JetBrains Mono typography and K7RHY slate/sky visual language. It may be more editorial than the web page, but must remain visibly related to the site. Print CSS removes navigation and controls, suppresses web-only narrative content, preserves essential background graphics when enabled, and provides a high-contrast monochrome-safe result.

## QR Codes and Centralized Links

QR codes are generated from the canonical production URL:

```text
https://k7rhy.app/sn/RLY26001
```

No QR image is authored or stored per instrument. The web and print presentations derive it from the same serial record. Discord uses the single URL already defined in `config/site.ts`; changing that value updates every instrument record and card.

## Failure Behavior

- Invalid serial filenames fail content validation.
- Unknown three-letter codes fail content validation.
- Missing required frontmatter fails content validation.
- Missing images fail the build.
- Invalid compound MDX structures fail rendering during the build with instrument-specific messages.
- Unknown routes return the standard 404 page.
- Unpublished records return 404 in production.
- The print route cannot exist independently of the web record.

## Verification

Automated tests will cover:

- Serial parsing and model-code translation
- Frontmatter and filename validation
- Strict compound-component child requirements
- Automatic selector numbering for three-way and five-way selectors
- Standard, push-pull, and push-push pot-state validation and rendering
- Published, unpublished, lowercase, and unknown route behavior
- Consistent instrument information between web and print presentations
- Canonical QR destination
- Print-specific visibility rules

Rendered verification will cover:

- Standard header/footer discovery paths and the contextual related link
- Responsive web layout and keyboard access
- Existing light and dark themes
- US Letter and A4 one-page print output
- Monochrome legibility
- Site logo and full brand name in the case-card masthead
- No clipped control descriptions or accidental second page

## Continuity and Scope Control

The design spec is the durable source of truth. A separate implementation plan will use checkboxes, exact file paths, test commands, and commit checkpoints. A short `.remember/remember.md` handoff will record the current state and next action when work pauses.

Out of scope for the first version:

- Public instrument registry or browse page
- Owner names or transfer history
- Authentication or private access codes
- Database or web-based record editor
- Generated PDF downloads
- Service-management or maintenance-history system
- Separate visual brand for instrument records
