# Relay Current Coupeville Plan — Decision Inventory

## Source

- **Title:** Relay Current Coupeville Plan
- **Shared conversation:** <https://chatgpt.com/share/6a6c26b2-b370-83e8-a534-008ee973e6b2>
- **Reviewed:** 2026-07-30
- **Scope:** Evolution of Relay Current into Coupeville Current, Current model identity and controls, Harmonic Shaper networks and player-facing language, platform naming, production status, serial-record requirements, and case-card content.

## Extraction notes

- This inventory prioritizes decisions useful to future Coupeville Current model-page documentation while also cataloging platform-level decisions.
- The owner explicitly asked ChatGPT to remember the production design, position descriptions, platform-wide Harmonic Shaper philosophy, and final model name. Those requests are treated as confirmation at the point they occurred.
- The conversation predates or accompanies the implemented `CVL26001` record. Current repository content is noted for reconciliation but does not retroactively alter the source evidence.
- Network values are production-reference values in the source, with an explicit expectation of later listening-based revision.

## Coupeville Current identity

### RCCP-001 — Model name is Coupeville Current

**Statement:** The instrument is named Coupeville Current, not Relay Current or Coupeville Relay Current.

**Evidence:** Confirmed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** The owner proposed the corrected name and ChatGPT recorded it as a saved decision. The name is implemented in `content/coupeville/models/current.mdx` and `content/instruments/CVL26001.mdx`.

### RCCP-002 — Relay and Coupeville names have different roles

**Statement:** Relay names the modular 3D-printed builder platform, while Coupeville names the personally crafted instrument line that may express related voicing ideas in a refined, complete form.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

**Notes:** This platform distinction explains why a Current lineage can exist in both lines without naming the Coupeville instrument as a Relay derivative. It should be reconciled with the canonical site-organization policy before promotion.

### RCCP-003 — Current lineage crosses platforms without coupling implementations

**Statement:** Coupeville Current retains Relay Current's pickup voicing and tonal lineage while using a Coupeville-specific control architecture.

**Evidence:** Confirmed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** This distinction is implemented in the current instrument record and reflected in the code comment that keeps Coupeville and Relay registries decoupled despite shared lineage.

### RCCP-004 — First production instrument, not prototype

**Statement:** The documented instrument is the first production Coupeville Current and must not be described as a prototype.

**Evidence:** Corrected

**Proposed classification:** Serialized-instrument documentation

**Notes:** The source first proposed “Relay Current Prototype 001.” The owner explicitly rejected that status and directed that the instrument be treated as the first model off the production line. The implemented record describes `CVL26001` as the first production Coupeville Current.

### RCCP-005 — Use established serial-number rules

**Statement:** Generate the instrument serial from the repository's established production serial-number rules when the permanent record is created; do not improvise a prototype number.

**Evidence:** Confirmed

**Proposed classification:** Serialized-instrument documentation

**Notes:** The conversation intentionally did not choose the serial itself. The later repository authority assigns `CVL26001`. The model page currently refers to `CPC26001`, which conflicts with the instrument record and canonical `CVL` namespace and should be reviewed during future model-page work.

## Pickup and control architecture

### RCCP-006 — Preserve the established Current pickup set

**Statement:** Coupeville Current uses the exact pickup models already established for Relay Current: GFS Vintage 59 neck humbucker, GFS Retrotron Hot Nashville middle pickup, and GFS Professional Series Alnico V HOT bridge humbucker.

**Evidence:** Confirmed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** The owner corrected a handoff that treated the outer pickups as unspecified. The exact names are present in the Relay Current source and implemented `CVL26001` record.

### RCCP-007 — Humbuckers remain the primary selectable voices

**Statement:** A three-way selector chooses neck, neck plus bridge, or bridge; those humbucker selections remain the instrument's primary voices.

**Evidence:** Confirmed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** This keeps the foundation familiar and prevents the center pickup from becoming another destination on the selector.

### RCCP-008 — Hot Nashville is a shaper, not a selector voice

**Statement:** The middle GFS Hot Nashville is used only as a passive harmonic-shaping element and is not presented as an independent pickup voice.

**Evidence:** Confirmed

**Proposed classification:** Design decision

**Notes:** This is central to Current's identity. The source rejected turning the model into a conventional HSH guitar with more pickup combinations.

### RCCP-009 — Master volume and tone specification

**Statement:** Use an A500K master volume, an A500K master tone, and a 22 nF tone capacitor.

**Evidence:** Confirmed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** These values were included in the saved architecture and final implementation handoff. They are implemented in `CVL26001`.

### RCCP-010 — Production treble bleed

**Statement:** Use a 680 pF capacitor and 150 kΩ resistor in parallel across the master-volume input and output.

**Evidence:** Confirmed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** The owner explicitly asked ChatGPT to choose the bleed values, and the final handoff made them part of the production specification rather than a placeholder. The network is intended to preserve clarity without turning the rolled-down volume sound into an exaggerated EQ shift.

### RCCP-011 — Six repeatable presets replace continuous blend

**Statement:** Replace the continuously variable middle-pickup blend with a six-position Harmonic Shaper that selects repeatable passive voicing networks.

**Evidence:** Confirmed

**Proposed classification:** Design decision

**Notes:** The owner explicitly preferred the voicing-network approach. Repeatability, documentation, comparison, and reuse were the main advantages.

### RCCP-012 — Current production-reference network

**Statement:** The six Harmonic Shaper positions use direct connection; 47 kΩ series resistance; 100 kΩ series resistance; 100 kΩ plus approximately 330 pF; 220 kΩ plus approximately 680 pF; and middle pickup disconnected.

**Evidence:** Confirmed

**Proposed classification:** Reference design

**Notes:** The owner asked to save these values, and the final handoff called them the current production reference implementation. The source does not fully specify the physical capacitor topology beyond the compact network notation; the implemented wiring documentation remains the stronger authority for construction detail.

### RCCP-013 — Reference values may evolve through listening

**Statement:** Preserve the six network values as a versioned reference implementation while allowing later revisions after listening tests.

**Evidence:** Confirmed

**Proposed classification:** Reference design

**Notes:** “Production reference” does not mean permanently immutable. A future change should be documented as a revision rather than silently overwriting the installed values of `CVL26001`.

## Harmonic Shaper player documentation

### RCCP-014 — Platform-wide documentation philosophy

**Statement:** The Harmonic Shaper documentation philosophy applies to every Relay or Coupeville model that uses a shaper, even when model-specific component values differ.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** The owner explicitly broadened the philosophy from Current to all shaper-equipped submodels. Consistent language should help owners understand the control across instruments.

### RCCP-015 — Number positions instead of naming them

**Statement:** Harmonic Shaper positions are numbered rather than given evocative names.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** The owner preferred the nameless version. Numbering avoids telling players what they are supposed to hear and allows personal associations to develop through use.

### RCCP-016 — Write from the player's perspective

**Statement:** Describe what each position does for the selected pickup voice in restrained player-facing language, not through component values, circuit-designer terminology, or marketing adjectives.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** The owner accepted both the philosophy and revised wording. Technical values belong in the specification or builder record, not the primary explanation.

### RCCP-017 — Refer to the selected pickup voice

**Statement:** Use “selected pickup voice” in shaper descriptions so the language remains correct for neck, bridge, or both pickups without implying that a shaper position changes selector state.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** This was an explicit owner edit to avoid descriptions that implied single- or dual-humbucker selection.

### RCCP-018 — Canonical Harmonic Shaper explanation

**Statement:** “The Harmonic Shaper modifies the character of the currently selected pickup voice. It does not select additional pickups or create separate voices. Instead, it offers six repeatable degrees of passive harmonic shaping, from maximum interaction to no interaction.”

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** The final handoff calls this wording canonical and reusable across future Relay and Coupeville models that use the feature.

### RCCP-019 — Canonical six position descriptions

**Statement:** Use the accepted numbered descriptions for maximum, strong, moderate, gentle, subtle, and bypassed harmonic shaping, all expressed relative to the selected pickup voice.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** The accepted wording is:

1. Maximum harmonic shaping. The most pronounced interaction with the selected pickup voice.
2. Strong harmonic shaping. Increases harmonic complexity while preserving the primary character.
3. Moderate harmonic shaping. A balanced blend of clarity and interaction.
4. Gentle harmonic shaping. Adds openness with a lighter touch.
5. Subtle harmonic shaping. A slight enhancement to articulation and dimensionality.
6. Harmonic shaper bypassed. The selected pickup voice passes unchanged.

The descriptions are platform-level presentation language; the electrical implementation remains model-specific.

### RCCP-020 — Player language precedes technical reference

**Statement:** Present player-facing descriptions prominently and place resistor and capacitor values in a secondary technical specification or builder record.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** This separation supports future owners without withholding the engineering record.

## Model and instrument-page documentation

### RCCP-021 — Instrument-record tone and purpose

**Statement:** The permanent page should read as a boutique instrument specification and authoritative technical record for a future owner, emphasizing design intent, engineering choices, tonal philosophy, and repeatability without exaggerated marketing language.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** The final handoff repeatedly preserved this style. It aligns with the broader decision that documentation should explain why before implementation details.

### RCCP-022 — Owner-oriented printable case card

**Statement:** The printable case card should concisely identify the instrument, production serial, completion and builder information, pickups, controls, three-way selector behavior, canonical shaper explanation, and six numbered positions; component values are secondary if space permits.

**Evidence:** Confirmed

**Proposed classification:** Serialized-instrument documentation

**Notes:** The card is for understanding and operating the instrument, not for replacing a wiring diagram or full builder record.

### RCCP-023 — Keep platform wording separate from instrument values

**Statement:** Implement reusable Harmonic Shaper wording separately from instrument-specific pickup, network, and installed-component values.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** This supports consistent player language across models without coupling their electrical designs.

### RCCP-024 — Preserve space for post-build learning

**Statement:** The instrument documentation should support later listening notes, preferred amplifier and string pairings, and circuit revisions.

**Evidence:** Proposed

**Proposed classification:** Listening note

**Notes:** This appeared in both handoff drafts, but the owner did not separately approve the exact builder-notes fields. The broader listening-note practice is independently confirmed in ZGDC-020.

## Current repository reconciliation

- `content/instruments/CVL26001.mdx` implements the exact pickup set, controls, treble bleed, shaper networks, model identity, and first-production status recorded here.
- `content/coupeville/models/current.mdx` describes the model's rhythm-first intent but does not yet explain the Harmonic Shaper or the Relay-to-Coupeville lineage in enough detail to stand alone as the model-level authority.
- `content/coupeville/models/current.mdx` currently names the first instrument as `CPC26001`, while the canonical instrument record and site-organization policy use `CVL26001`. This is a candidate future model-page correction, not a decision supplied by the conversation.
- `content/relay/voicings/current/index.mdx` preserves Relay Current's continuous or switched middle-layer implementation. That difference is compatible with shared lineage and distinct platform implementations.

## Corrections and superseded proposals

1. **Prototype identity:** Superseded by first-production Coupeville Current status.
2. **Relay Current or Coupeville Relay Current name:** Superseded by Coupeville Current.
3. **Continuous B500K/B1M middle blend:** Superseded for Coupeville Current by the six-position Harmonic Shaper.
4. **Unspecified outer pickups in the first handoff:** Corrected to the established Relay Current pickup set.
5. **Treble-bleed placeholder:** Corrected to the 680 pF and 150 kΩ parallel production network.
6. **Named shaper positions:** Rejected in favor of numbered positions and restrained descriptions.
7. **“Selected humbucker” wording:** Corrected to “selected pickup voice” so the descriptions also fit the both-humbuckers selector position.

## Explicit exclusions

- ChatGPT project-memory operations, which do not make decisions available to repository agents.
- The suggestion that Codex could access ChatGPT's saved project memory; repository artifacts are the shared authority.
- Any new serial prefix inferred from “Coupeville Current.” The later canonical repository policy defines `CVL` across Coupeville instruments.
- Evocative position names such as Focus, Presence, Contour, Air, Bloom, Reference, Bold, Sweet, Pure, Dense, or Saturated.
