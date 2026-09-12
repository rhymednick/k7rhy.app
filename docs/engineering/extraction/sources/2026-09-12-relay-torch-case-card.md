# Relay Torch Case Card and Tone-Wiring Note — Decision Inventory

## Source

- **Artifacts:** Owner-supplied `relay_torch_case_card_v1.html` (labeled “v1 bench card”) and the owner's accompanying modern-wiring recommendation.
- **Reviewed:** 2026-09-12
- **Scope:** Relay Torch pickup roles, five-way selection, master controls, Edge Contour, and the conflicting master-volume values.

## Extraction notes

- On 2026-09-12, the owner explicitly adopted the case card as the **current Relay Torch reference standard** and put the shunted 1 MΩ idea into future investigation. This resolves the volume-value conflict for the current reference.
- The case card says “Starting Specs”; it does not document an assembled or measured Torch guitar. Adoption as a reference standard does not establish installed-build facts or listening results.
- The accompanying text recommends modern wiring and repeats the no-bleed and 22 nF tone choices. Its closing 1 MΩ volume suggestion defines no shunt and is not part of the current reference.

## Candidates

### RTC-001 — Five-way pickup map

**Statement:** Use a five-way blade for bridge, bridge plus middle, middle, neck plus middle, and neck. The middle is a P90-type primary voice between a hotter bridge humbucker and a fuller neck humbucker.

**Evidence:** Confirmed

**Proposed classification:** Reference design

**Notes:** The case card matches the public selector map, but identifies pickup roles rather than exact purchasable variants or measurements.

### RTC-002 — Modern master-tone connection

**Statement:** Feed a standard master tone from the volume input node, after any engaged contour network, rather than from the volume wiper. Use an A500K tone pot and a 22 nF (`0.022 µF`, `223`) capacitor to ground, without a no-load modification.

**Evidence:** Confirmed

**Proposed classification:** Reference design

**Notes:** The accompanying recommendation explicitly prefers modern wiring over 1950s-style output-side tone wiring. The case card independently gives an A500K tone and 22 nF cap. The physical pot lug assignment still needs to be checked against the chosen component and viewing orientation.

### RTC-003 — No master-volume treble bleed

**Statement:** Leave the master volume without a treble-bleed network so rolling down volume can also soften the high end.

**Evidence:** Confirmed

**Proposed classification:** Design decision

**Notes:** Both supplied sources say no treble bleed; the owner adopted the card as the current reference on 2026-09-12. No measured build was supplied.

### RTC-004 — Edge Contour network

**Statement:** In the pulled/up state, insert a 2.2 nF (`0.0022 µF`, `222`) capacitor in parallel with a 150 kΩ resistor **as one two-terminal network in series** between selector output and volume input. In the down state, bypass the network for a direct selector-to-volume path.

**Evidence:** Confirmed

**Proposed classification:** Reference design

**Notes:** The case card states both the network and intended switching behavior. It is a passive high-pass/low-frequency attenuation contour, not an active treble boost. A real DPDT contact map and continuity check are needed before this becomes a physical wiring diagram.

### RTC-005 — Global contour and distinct control jobs

**Statement:** Place the Edge Contour after the five-way selector so it affects every pickup position; reserve volume for level and natural amp cleanup, standard tone for darkening, and Edge Contour for deliberate sharpening.

**Evidence:** Confirmed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** This is the stated control intent in both sources; the sonic outcome still needs bench listening with the selected pickups and load.

### RTC-006 — A500K current master volume

**Statement:** Use the case card's A500K audio-taper master volume for the current Relay Torch reference.

**Evidence:** Confirmed

**Proposed classification:** Reference design

**Notes:** The owner resolved the conflict on 2026-09-12: the case card is current, and 1 MΩ is for future investigation only.

### RTC-007 — Source is not a build observation

**Statement:** The supplied card provides a v1 bench design and starting values, not evidence that a Torch test build was assembled or validated.

**Evidence:** Observed

**Proposed classification:** Discussion only

**Notes:** Do not cite the card as installed-component or listening-test evidence without a separate build record.

### RTC-008 — Shunted 1 MΩ is future research

**Statement:** Consider a shunted 1 MΩ master volume only in a future Torch experiment, outside the current reference standard.

**Evidence:** Confirmed

**Proposed classification:** Design decision

**Notes:** The owner deferred this on 2026-09-12. The shunt value and connection were never specified; they are not blanks in the current A500K reference.
