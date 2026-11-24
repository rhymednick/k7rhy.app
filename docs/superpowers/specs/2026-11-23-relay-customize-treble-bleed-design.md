# Relay "Customize" section: treble bleed (design)

**Date:** 2026-11-23
**Status:** Approved by the owner 2026-11-23, with the changes folded in below.
**Builds on:** [Relay switchable treble bleed](../../engineering/relay-switchable-treble-bleed.md) (v1 of the circuit, 2026-11-22).
**Supersedes:** nothing. The switchable-bleed record's status line ("bench validation pending") is out of date and is corrected as part of this work (see Records and checks).

## Intent

Add a place on the Relay docs site for optional circuit customizations, and fill it first with treble bleed: how the different treble-bleed circuits work, and how to add a three-way Direct / Off / Reactive switch to a guitar.

The owner wants two things from it:

1. People who assemble and repair guitars, most of whom know how to put the parts together but not why the circuit behaves as it does, should come away with an intuitive model of what a treble bleed does and why volume roll-off sounds the way it does.
2. A builder can retrofit the switch on any guitar with a master volume and master tone, from the page alone.

## What is already decided (owner)

- **The circuit is v1 of the record above, and it is validated.** The owner said so on 2026-11-23 and wants nothing on the site treated as unvalidated, pending, experimental or "open". The owner has built it on Lipstick. No measurements were supplied, so the pages never quote measured numbers, and they present the circuit as a validated design. Component values are described as the validated starting values that every bleed is tuned from by ear.
- **It is a general-purpose three-way circuit, not a Lipstick feature.** One position is a normal tone circuit (Off), one is a normal treble bleed (Direct), one is a reactive bleed (Reactive). Lipstick is the worked example only.
- **The default stock wiring is Lipstick's.** The retrofit page starts from a guitar wired like Relay Lipstick: master volume and master tone, with the tone pot's hot end on the volume pot's input side (`BUS`). Other stock layouts are out of fit, and the page gives a short continuity test to tell which one a guitar has.
- **Bleed values follow the pot value, with alternatives.** The page gives a value table keyed to the volume pot (250k, 500k, 1M) plus alternatives for brighter or subtler bleed. 500k with 150 kΩ and 1 nF is the validated Lipstick pair.
- **The switch is the one the owner links, but any switch with a matching hole works.** The linked mini toggle needs a 6 mm hole, and the right hole depends on the switch bought, so the page tells readers to measure their own bushing. The hole is drilled (not printed), near the tone pot, wherever there is room.
- **It is an alternative tone wiring, never a standard build.** It is not the default on any guitar, because it needs a switch hole that no body has. The owner decides per guitar. Drilling that hole is part of the retrofit.
- **Labels are Direct / Off / Reactive** (from the record).
- **Placement: Relay for now.** The owner wants, eventually, a home for circuits that belong to no guitar platform. Relay is chosen only because nothing better exists yet.
- **Many diagrams.** The tone is very simple and approachable. The readers are people who put guitars together without knowing how they work, including repairers.
- **Voice:** the owner's voice profile, documentation register: warm, precise, teaching the why, first person singular where the author speaks ("I"), never "we".

## Goals

- An explainer that builds an intuitive model: what the volume pot does to the signal, why turning down makes the guitar dull, what a bleed capacitor (and resistor) does about it, why a fixed bleed can sound wrong at some settings, and how the reactive version follows the tone control.
- A retrofit guide that a careful beginner can follow: parts list, before/after circuit, lug identification by continuity, step-by-step wiring, bench checks that confirm the three modes behave as designed.
- Diagrams for every circuit discussed, checked against a written netlist.
- A structure that moves cleanly later: circuit pages carry no Relay-specific copy except one clearly separated Lipstick worked example.

## Non-goals

- Making the switch a standard build on any guitar, or changing any voicing's published build or wiring page. It is offered only as an alternative tone wiring.
- Reef and Reef Plus. The record excludes them, and the pages say so in plain words as a fit rule (two volumes summing at one output), not as a pending item.
- Per-model value tables. Values are keyed to the pot value, not the model.
- Other stock layouts (for example a tone control fed from the volume wiper, a tone circuit with extra parts, or a bleed that isn't a fixed series resistor and capacitor). The page marks them out of fit and does not draw variants.
- Measurements, frequency-response plots of real data, or recordings.
- Building the platform-neutral circuits section (route, navigation, landing page). This work only avoids making that move hard.
- Selling or listing parts.

## Anti-goals

- A wall of jargon or component math before the reader has a picture.
- Pages that read as Lipstick-only, or as an instruction to copy Lipstick values onto every guitar.
- Hedging language. Never "unvalidated", "pending", "experimental", "not yet tested" or "to be determined" anywhere on the pages.
- Diagrams that look right but are electrically wrong.
- Sketches of frequency response presented as data.

## Constraints

- Follow [wiring-diagrams.md](../../engineering/wiring-diagrams.md): netlist first, state-table, rear-view pot labeling, functional contact maps for switches, compare the exported image to the netlist, `check-wiring-pages.mjs` before publishing.
- Follow the "Diagram Work" rules in AGENTS.md. The visual standard for the builder wiring diagram is [relay-arc-rev-1.0.png](../../engineering/references/relay-arc-rev-1.0.png). The Red Lipstick Special generator (`docs/engineering/coupeville-red-lipstick-special/`) is the pattern for a generator that also verifies the drawing against the netlist.
- Site completeness: nothing is routed until it is complete. No placeholder "coming soon" pages beyond a landing page that honestly lists what exists.
- Source facts: the validation is owner-provided. The pages cite no measurements and no simulation figures, and describe what each mode does in terms a builder can hear and verify.
- Site layout: Relay sidebar is driven by `config/relay-build-process.ts` and `components/navigation/relay-sidebar.tsx`. Relay MDX content lives under `content/relay/` and renders through route files under `app/guitars/relay/`.

## Approaches

**A. One page.** Explainer, circuit and retrofit steps together. Fastest, but long, and the explainer can't be linked on its own.

**B. Two pages under a new Customize group. (Chosen by the owner.)** One page explains how treble bleeds work. One page is the retrofit guide. The explainer can be linked from Parts and voicing pages, and more mods can join the group.

**C. Put the circuits above Relay, at the guitars level.** Fits a platform-neutral circuit, but the owner asked for Relay's docs now, and the Coupeville line is intentionally kept separate from Relay. Not chosen. B is written so a later move toward C is a path change plus redirects.

## Design

### Navigation and routes

- New sidebar group **Customize**, below "Build process" in the Relay sidebar. It is not a build step and is not numbered.
- Routes (builder may adjust the final slugs, keeping them stable and descriptive):
  - `/guitars/relay/customize`: short landing page listing what exists. It says plainly that these are optional changes to a finished or in-progress guitar.
  - `/guitars/relay/customize/how-treble-bleeds-work`: the explainer.
  - `/guitars/relay/customize/direct-off-reactive-switch`: the retrofit guide.
- Content under `content/relay/customize/`. Sidebar entries come from a small config file in the style of `config/relay-build-process.ts`, with tests like the existing nav tests.
- Cross-links: the existing Parts treble-bleed item and the Torch and Velvet pages (which state "no treble bleed") point to the Customize pages. The Lipstick wiring page gets one sentence noting an alternative tone wiring that adds a switch. No change to any published circuit. The landing page describes the item as an **alternative tone wiring** that requires drilling one hole.

### Page 1: How treble bleeds work

Reading level: someone who has never drawn a schematic. Each idea gets a picture first, then words. A short glossary of the six terms used (pickup, pot, wiper, capacitor, resistor, ground) near the top, each as one friendly sentence.

Outline, with the diagrams each part needs:

1. **What the volume knob really does.** The signal goes from the pickup through the pot to the cable and amp; the pot is an adjustable divider. *Diagram 1:* signal chain. *Diagram 2:* the volume pot, three lugs and a wiper, drawn from the rear.
2. **Why turning down makes it dull.** At partial volume the pot's resistance and the cable's capacitance form a filter that removes highs. *Diagram 3:* the "pot + cable" picture. *Diagram 4:* a labeled **illustrative sketch** (not data) of brightness versus volume position.
3. **What a bleed does.** A capacitor lets highs skip past the pot's track; lows still get turned down. *Diagram 5:* the stock volume circuit. *Diagram 6:* the same circuit with a capacitor-only bleed.
4. **The usual variants.** Capacitor only, capacitor with a parallel resistor, capacitor with a series resistor. What each changes in plain words. *Diagram 7:* three small schematics side by side.
5. **Where fixed bleeds disappoint.** A fixed bleed doesn't care where the tone knob is, so rolling the tone back doesn't tame it. Explain that in plain words, with no figures.
6. **The reactive bleed.** Taking the bleed's signal from the tone pot's spare end, so rolling the tone back weakens the bleed. *Diagram 8:* the tone pot with its three lugs and what each does. *Diagram 9:* the reactive circuit, with the bleed path highlighted.
7. **The three modes together.** *Diagram 10:* one schematic with Direct, Off and Reactive each highlighted in a three-panel view; a three-row "what it does and when you'd want it" table.
8. **Where to go next.** Link to the retrofit guide.

### Page 2: Add a Direct / Off / Reactive switch

1. **What you get.** The three modes in one short table, plus the "full volume and full tone equivalences" in plain words.
2. **Is your guitar a fit?** It must be wired like Lipstick: a master volume and a master tone, with the tone pot's hot end on the volume pot's input side. Give a short continuity test to confirm it, with a diagram. Pots of 250k, 500k or 1M are all fine. The volume pot may have no bleed (the page adds one) or a fixed series resistor-and-capacitor bleed like Lipstick's (the page reuses its parts, moving the input end to the switch). Not a fit: a tone control fed from the volume wiper or carrying extra parts, a bleed of any other kind (capacitor alone, or a parallel resistor and capacitor), or two independent volumes summing at one output (this includes Reef and Reef Plus). Present these as fit rules.
3. **Parts and tools.** SPDT on–off–on mini toggle (link the owner's chosen switch, with a note that any switch with a matching hole works), a bleed resistor and capacitor chosen from the value table below, the existing 22 nF tone cap, hookup wire, soldering tools, meter, and drilling tools for the switch hole.
3a. **Choose your bleed values.** A table keyed to the volume pot:

    | Volume pot | Resistor | Capacitor | Status |
    | --- | --- | --- | --- |
    | 500k | 150 kΩ | 1 nF | The validated Lipstick pair |
    | 250k | 68 kΩ | 1 nF | Scaled from the 500k pair by the pot ratio, rounded to a standard value |
    | 1M | 330 kΩ | 1 nF | Scaled from the 500k pair by the pot ratio, rounded to a standard value |

    Alternatives: a smaller capacitor (470–680 pF) for a subtler bleed, a larger one (1.5–2.2 nF) for a brighter one, and one standard resistor step either way. The scaled values are the builder's proposal and need the owner's confirmation before the page is drafted (open question 2). After confirmation the page presents all three as validated starting values.
3b. **Make room for the switch.** The guitar needs a hole for the toggle, and no stock body has one. Cover choosing a spot (near the tone pot where there is room, reachable, clear of the pickguard, controls and cavity, with room behind for the body of the switch), measuring the switch's bushing (the linked switch needs a 6 mm hole; the right size depends on the switch bought), marking and drilling cleanly (tape, pilot hole, the right bit for the material), protecting the finish, and mounting. Wiring happens after the switch is fitted. The hole is drilled, not printed.
4. **Understand what changes.** *Diagram 11:* the stock volume/tone circuit (before). *Diagram 12:* the circuit after the retrofit. The honest summary: this is a rewire of the tone control as well as a new switch. The signal feed moves to the tone pot's wiper, the tone cap moves to lug 1, and lug 3 becomes the reactive feed.
5. **Identify your lugs.** How to find the tone pot's wiper and two ends by continuity; how to find the switch's common and throws. *Diagram 13:* rear-view pot labeling. *Diagram 14:* switch contact map (functional, with the instruction to confirm with a meter).
6. **Step-by-step wiring.** Short numbered steps, each tied to a labeled net in the diagram.
7. **The builder diagram.** One reference sheet in the Arc/Lipstick style (pale-blue numbered panels, colored boxed net labels, rear-view pots, contact map, operating states, ground and bench checks), full-size and download links, text below it as searchable text.
8. **Bench checks.** The equivalence checks from the record: Direct and Reactive match at tone 10; all three match at volume 10; the switch is quiet; the mounting clears the cavity. Then a listening routine: level-match, compare at 5/5 and 8/8, sweep both controls.
9. **Worked example: Relay Lipstick.** Where the lugs are on that harness, how the volume push-push is kept, and where the hole goes (near the tone pot, where there is room). This is the only Relay-specific section. Drawings only; there are no photos.
10. **Tuning by ear.** Explain why the best values depend on the pickups and cable, and how to try the alternatives. Phrase it as ordinary tuning, not as an open question.
11. **Troubleshooting.** Short, symptom-first.

### Diagrams

Two classes, both generated from a netlist so the drawing can be verified:

- **Explainer schematics (Diagrams 1–10, 11–12, 13–14).** Simple, friendly, large type, one idea each. The builder generates them with a script that reads a netlist and checks the rendered drawing against it, the Red Lipstick Special pattern. Published as SVG with a PNG fallback for download; the builder's call between SVG-only and SVG+PNG (my call, flagged).
- **One builder reference sheet (Diagram 15).** Matches the Relay Arc reference's visual standard and sits in page 2, section 7.

The illustrative response sketch (Diagram 4) is the only non-circuit drawing. It is labeled "illustration, not a measurement" on the image itself.

### Records and checks

- **Netlist document** for the general circuit: `docs/engineering/relay-switchable-treble-bleed-netlist.md` (the builder may choose the directory, following the Red Lipstick layout), with every net, the switch contact table and the three operating states. It uses generic terminal names (`VOL-IN`, `VOL-W`, `TONE-W`, `TONE-END-A`, `TONE-END-B`) and maps them to Lipstick's `BUS` / `OUT`.
- **Update the switchable-bleed record:** status becomes "Validated 2026-11-23 (owner-reported; no measurements recorded). Offered as an alternative tone wiring, not a standard build, because it needs a switch hole." Rewrite its "Model application" section to match: Lipstick is the validated reference, and no model adopts it as standard. Add a pointer to the netlist and the published pages, and keep its history.
- **Add the retrofit page and its netlist to `PAIRS`** in `scripts/typesafe/check-wiring-pages.mjs`. Run it. Resolve every priority-2 flag against the netlist before the owner sees any.
- Tests: sidebar entries, route loading for the three pages, no broken links.

## Decisions the builder may make (my calls, to be checked by the owner)

- Final URL slugs for the three pages.
- SVG vs SVG+PNG for explainer diagrams.
- Directory for the netlist and generator under `docs/engineering/`.
- Order of the diagrams within a page, as long as the picture comes before the explanation.

## Calls made after the builder check (mine; the owner can override)

- **Lug naming is by behavior.** The netlist, diagrams and continuity test name the tone pot's ends by what the wiper does: the end the wiper reaches at full tone (tone 10) is the **Reactive feed**; the other end goes to the tone capacitor. Physical CW/CCW from the rear view is shown on each diagram. The record's "lug 1 / lug 3" prototype numbering is not used on the pages.
- **"Validated" is stated flat on the pages**, per the owner. The record keeps its original simulation text as history, labeled as the design-time rationale, and its status line carries the validation and its date.
- **Out-of-fit guitars** are handled by the fit rules and the continuity test, not by extra circuit variants.
- **The switch link** uses the product's clean `amazon.com/dp/B0799JK458` address, without the session parameters in the address the owner pasted. If the owner uses an affiliate short link for it, the builder substitutes that. The listing is checked for the bushing size when the page is written.
- **Diagram reviews.** The two independent reviews required by the wiring workflow are done by reviewer subagents; I ask the owner before spawning them.

## Open questions for the owner

Resolved by the owner on 2026-11-23: no guitar adopts the switch as a standard build (it is an alternative tone wiring because it needs a hole); no photos exist, so the worked example uses drawings.

Resolved on 2026-11-23: the stock wiring is Lipstick's; the hole is drilled, 6 mm for the linked switch, near the tone pot where there is room; the switch is linked as the suggested part.

Also resolved on 2026-11-23: the scaled bleed values (68 kΩ with 1 nF for a 250k volume pot, 330 kΩ with 1 nF for a 1M pot) are confirmed by the owner. The owner has no Amazon affiliate link (removed from the program), so the switch links to the plain product address. The owner approved subagent-driven execution, including the two diagram reviewers.

No open questions remain.

## Delivery

Branch off `main`, one PR (not a draft). Phases in the plan: records and netlist; diagrams and generator; explainer page; retrofit page; sidebar and cross-links; checks, rendered review at desktop and phone widths, `npm run build`. The wiring workflow's requirement for two independent diagram reviews applies to the builder sheet.
