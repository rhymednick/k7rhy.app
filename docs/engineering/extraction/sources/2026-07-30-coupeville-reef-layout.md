# Coupeville Reef Layout — Decision Inventory

## Source

- **Title:** Coupeville Reef Layout
- **Shared conversation:** <https://chatgpt.com/share/6a6c27ba-6a04-83e8-9579-03eda9cf88cb>
- **Reviewed:** 2026-07-30
- **Scope:** Coupeville Reef pickup placement, two-branch control architecture, pickup measurements, pot and tone values, simplicity decisions, and troubleshooting of reverse-wired independent volume controls.

## Extraction notes

- This inventory prioritizes decisions useful to future Coupeville Reef model-page documentation while also preserving reusable electrical observations.
- The conversation begins with design exploration and continues into an assembled-guitar troubleshooting session. Proposed design intent, measured facts, and unverified diagnoses are kept distinct.
- The final production pot taper is unresolved because the conversation ends before the proposed B1M, reversed A1M, or C1M experiments are reported.
- The existing Coupeville Reef model page currently describes only the high-level contrast between voice families; most of the model architecture in this source is not yet represented there.

## Coupeville Reef identity and layout

### CRL-001 — Lipsticks define Reef

**Statement:** In Reef, the two lipsticks form the defining instrument voice while the humbucker supplies an alternate, fuller workhorse voice.

**Evidence:** Proposed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** This distinguishes Reef from Relay Lipstick and from a conventional humbucker guitar with decorative alternate pickups. The owner continued the design on this premise but did not explicitly restate it as a final definition.

### CRL-002 — Coupeville Reef uses an HLL layout

**Statement:** Place a low-output humbucker at the neck, with lipstick pickups in the middle and bridge positions.

**Evidence:** Confirmed

**Proposed classification:** Design decision

**Notes:** The owner proceeded by selecting and measuring a neck humbucker after discussing this layout. The neck humbucker provides body and sustain without displacing the lipsticks from Reef's bright, spatial identity.

### CRL-003 — Voice-family roles

**Statement:** The bridge lipstick is the sharpest and most percussive voice, the middle lipstick is fuller and less pointed, both lipsticks in parallel form the broad glassy voice, and the neck humbucker provides the thick, sustaining melodic counterweight.

**Evidence:** Proposed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** These descriptions are predictions based on placement and pickup type. They need post-build listening confirmation before becoming definitive model copy.

### CRL-004 — Simple lipstick selector

**Statement:** Use a three-way selector for bridge lipstick, both lipsticks in parallel, and middle lipstick.

**Evidence:** Confirmed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** The owner explicitly constrained the design to the available three-way switch. Lipstick series operation and full-system six-way routing were abandoned.

### CRL-005 — Selector orientation follows pickup direction

**Statement:** Orient the physical three-way lever so it points toward the emphasized lipstick pickup, without a clever reversal.

**Evidence:** Proposed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** This is an ergonomic recommendation rather than an explicitly accepted build decision.

## Two-branch control architecture

### CRL-006 — Separate lipstick and humbucker branches

**Statement:** Route both lipsticks through the three-way selector into one shared lipstick volume; route the neck humbucker directly into its own volume; join the two volume outputs at the common output bus.

**Evidence:** Confirmed

**Proposed classification:** Reference design

**Notes:** The owner supplied this topology from prior successful experiments and constrained the design around it. The selector configures the lipstick subsystem before its shared volume.

### CRL-007 — Global master tone

**Statement:** Connect one master tone after the two volume branches join so it affects the complete output.

**Evidence:** Confirmed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** The tone circuit belongs on the common output rather than on either branch's wiper.

### CRL-008 — Continuous branch interaction is the custom feature

**Statement:** The two independent volume branches provide continuous interaction between the selected lipstick subsystem and the neck humbucker; that interaction is more central to Coupeville Reef than additional binary switching features.

**Evidence:** Confirmed

**Proposed classification:** Design decision

**Notes:** The owner leaned toward simplicity, and the final simple recommendation retained the two volumes as the defining custom behavior.

### CRL-009 — Initial build remains simple

**Statement:** Build the three-way selector, lipstick volume, humbucker volume, and master tone without additional push-pull functions unless testing reveals a specific missing voice.

**Evidence:** Confirmed

**Proposed classification:** Design decision

**Notes:** Bass contour and phase reversal were rejected as premature feature accumulation. Push-pull pots may be installed mechanically while leaving their switch sections unused.

### CRL-010 — Partial split is the only initial expansion candidate

**Statement:** If the neck humbucker proves to split well and a leaner humbucker branch is musically useful, a partial split is the only push-pull function with a strong initial case.

**Evidence:** Proposed

**Proposed classification:** Design decision

**Notes:** The later pickup measurements made the assistant less eager to split automatically. No split resistor or installed split was confirmed in this source.

### CRL-011 — Superseded complex-switch proposals

**Statement:** Do not make the initial Coupeville Reef depend on lipstick series wiring, a six-position full-system selector, lipstick bass contour, or variable out-of-phase blending.

**Evidence:** Corrected

**Proposed classification:** Design decision

**Notes:** These ideas were explored and then superseded by the owner's preference for a simple, coherent instrument. They may remain experiments for another design but are not part of the selected Reef baseline.

## Pickup selection and measurements

### CRL-012 — Selected neck-humbucker candidate

**Statement:** Use the available 7.6 kΩ GFS neck humbucker as the initial warm counterweight to the lipstick subsystem.

**Evidence:** Confirmed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** The exact GFS model and magnet were not identified in the conversation. The pickup was accepted for testing after measurement rather than from DCR alone.

### CRL-013 — Recorded neck-humbucker measurements

**Statement:** The candidate neck humbucker measures 4.29 H with Q 2.36 at 1 kHz and 4.62 H with Q 0.37 at 100 Hz, alongside approximately 7.6 kΩ DCR.

**Evidence:** Observed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** These owner-supplied readings characterize a normal-to-warm PAF-like pickup with healthy 1 kHz Q. They belong in a builder or installed-instrument record if the pickup remains in the completed guitar.

### CRL-014 — Neck-humbucker role after measurement

**Statement:** Treat the measured neck humbucker as a full, mid-present, sustaining counterweight rather than an ultra-clear or airy humbucker.

**Evidence:** Proposed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** This is an engineering interpretation of the measurements and needs listening validation in the assembled instrument.

### CRL-015 — Pickup measurement practice

**Statement:** For pickup comparisons, record DCR, inductance, and Q at 1 kHz and 100 Hz; use the 1 kHz inductance as the primary comparison and compare the gap between pickup families rather than evaluating a pickup in isolation.

**Evidence:** Proposed

**Proposed classification:** Engineering standard

**Notes:** This is a reusable measurement recommendation, not yet an approved project-wide measurement standard.

## Pot, tone, and loading decisions

### CRL-016 — Initial control values

**Statement:** Start with two 1 MΩ volume controls, a 1 MΩ master tone, and a 22 nF tone capacitor to preserve lipstick chime while accommodating the neck humbucker.

**Evidence:** Confirmed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** The owner built or tested the guitar with 1 MΩ volume controls and explicitly confirmed the tone-cap discussion. The final production taper remains unresolved.

### CRL-017 — Tone capacitor is 22 nF, not 22 µF

**Statement:** The master tone capacitor is 22 nF, equivalently 0.022 µF or code `223`; 22 µF is not a passive guitar tone value for this design.

**Evidence:** Corrected

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** This corrects a unit typo in the owner's question. A 47 nF starting value was rejected as likely to darken the neck humbucker too quickly.

### CRL-018 — Reverse-independent volume connection

**Statement:** For each branch, connect pickup or selector output to the pot wiper, one outer lug to the shared output bus, and the other outer lug to ground so turning one branch fully down does not directly ground the common output.

**Evidence:** Confirmed

**Proposed classification:** Reference design

**Notes:** The owner confirmed both pots were wired this way. This topology preserves independent endpoint behavior but does not remove passive loading or taper interaction.

### CRL-019 — A1M sweep failure is an observed build result

**Statement:** With A1M audio-taper pots in the reverse-independent topology, both controls exhibited an unusable non-monotonic sweep: full output at 10, collapse near 9, partial recovery around 8–7, and near silence through much of the remaining rotation.

**Evidence:** Observed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** Because both pots behaved similarly, taper geometry is a strong hypothesis. The source does not contain the replacement-pot or reversed-lug result needed to close the diagnosis.

### CRL-020 — Production volume taper remains unresolved

**Statement:** Test matched B1M linear pots and, if reversing the A1M outer lugs produces a broad usable sweep in the opposite direction, consider matched C1M reverse-audio pots before choosing the production taper.

**Evidence:** Unresolved

**Proposed classification:** Unresolved question

**Notes:** The assistant first recommended B1M, then refined that recommendation to include C1M after the owner proposed testing the other side of the logarithmic track. No test outcome is present.

### CRL-021 — Match both volume values and tapers

**Statement:** Use the same resistance value and taper for both branch volumes so their blend behavior remains as predictable and comparable as possible.

**Evidence:** Proposed

**Proposed classification:** Reference design

**Notes:** Mixed values do not load only their nominal pickup branch after the outputs join; the lower-value pot changes the common load seen by both pickup systems.

### CRL-022 — Parallel loading informs the 1 MΩ choice

**Statement:** Two equal always-connected volume-pot tracks act approximately as parallel loads at the shared output when full up, so two 1 MΩ controls present roughly 500 kΩ before additional tone and amplifier loading, while two 500 kΩ controls present roughly 250 kΩ.

**Evidence:** Confirmed

**Proposed classification:** Reference design

**Notes:** The owner explicitly checked this understanding. Once either wiper moves, the circuit is more complex than two fixed parallel resistors because pickup impedance and track division participate.

### CRL-023 — Preserve 1 MΩ unless brightness proves excessive

**Statement:** Resolve taper first while retaining 1 MΩ pot values; consider two 500 kΩ volumes only later as a deliberate global darkening change if the working blend remains too bright.

**Evidence:** Proposed

**Proposed classification:** Design decision

**Notes:** Two 500 kΩ branch volumes could remove the airy edge Reef is intended to preserve. The source contains no later listening result.

### CRL-024 — Treble bleeds remain undecided

**Statement:** Do not standardize a treble bleed on either Reef branch until the volume controls operate correctly and the assembled guitar reveals whether each branch benefits from preserved high-frequency response while being reduced.

**Evidence:** Proposed

**Proposed classification:** Unresolved question

**Notes:** The early discussion leaned toward a modest bleed on the lipstick branch and none on the neck humbucker, but the simple-build decision and later taper problem leave this unresolved.

## Current repository reconciliation

- `content/coupeville/models/reef.mdx` already captures the high-contrast two-voice-family identity but does not document the HLL placement, three-way lipstick subsystem, independent branch volumes, measured neck pickup, or unresolved volume-taper work.
- `content/relay/voicings/reef/index.mdx` uses a bridge humbucker and a different Relay-specific control system. That is not automatically a conflict: CRL-002 is a Coupeville-specific implementation decision.
- No permanent serialized-instrument record for this Coupeville Reef was found in the current repository. Exact installed parts and final taper should remain candidates until such a record exists.

## Corrections and superseded proposals

1. **Bridge humbucker default:** Superseded for this Coupeville layout by the neck-humbucker HLL arrangement.
2. **Six-way full-system selector:** Superseded because the proposed truth table and shared lipstick volume required awkward full-system routing.
3. **Four-way lipstick selector and series voice:** Superseded by the available three-way selector and parallel lipstick pair.
4. **Bass contour and phase-reversal push-pulls:** Superseded by the simple initial build.
5. **Automatic partial split:** Reduced to a future option only after the measured humbucker is heard in the completed instrument.
6. **Incorrect normal-volume diagnosis:** Corrected when the owner confirmed pickup-to-wiper reverse-independent wiring.
7. **Pot defect or phase as leading cause:** Deprioritized after both A1M controls showed the same repeatable sweep pattern.
8. **B1M as the settled fix:** Reopened when the reversed-log-track experiment suggested C1M might provide more useful resolution.

## Explicit exclusions

- Image-search results and generated learning widgets embedded in the source.
- Predictions about completed tones that have not been confirmed through listening.
- A final production volume taper, because the relevant experiment is absent.
- A partial-split resistor value, because no split was accepted for the initial build.
