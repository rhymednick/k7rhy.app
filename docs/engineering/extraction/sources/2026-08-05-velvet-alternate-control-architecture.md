# Coupeville Velvet Alternate Control Architecture — Decision Inventory

## Source

- **Title:** Engineering Log Entry: Coupeville Velvet Alternate Control Architecture
- **Provided:** 2026-08-05
- **Status:** Approved for bench evaluation; not approved for production or platform canonization
- **Scope:** Alternate pickup selection, independent pickup-layer controls, five-position passive voice selection, bench-test configuration, risks, and acceptance criteria.

## Extraction notes

- This source authorizes an experiment, not a replacement for the current Velvet reference direction.
- The earlier Prototype 1 and its rejected production features remain historical facts. This proposal deliberately revisits related ideas in a different, serviceable bench architecture.
- Exact passive topology, component values, pot wiring, and the final role of the Nashville remain subject to electrical and listening tests.
- Coupeville-facing model documentation must not advertise this architecture unless it is validated and explicitly canonized.

## Experiment scope and control model

### VAC-001 — Alternate architecture is bench-only

**Statement:** Evaluate the alternate Velvet control architecture on a bench harness without replacing the current production or reference specification.

**Evidence:** Confirmed

**Proposed classification:** Design decision

### VAC-002 — Four player-facing functions

**Statement:** Separate outer-pickup selection, neck blending, Nashville blending, and repeatable passive voice shaping into four distinct player-facing functions, followed by global level control.

**Evidence:** Confirmed

**Proposed classification:** Design decision

### VAC-003 — Three-way outer-pickup selector

**Statement:** Use a traditional three-way toggle for bridge, bridge plus neck, and neck selection among the outer humbuckers.

**Evidence:** Confirmed

**Proposed classification:** Reference design

### VAC-004 — Fixed bridge foundation

**Statement:** Keep the bridge pickup at full output before the master volume whenever it is selected, using neck level to blend against that fixed foundation.

**Evidence:** Proposed

**Proposed classification:** Reference design

**Notes:** This is a defining experiment variable, not an accepted Velvet behavior.

### VAC-005 — Independent neck volume

**Statement:** Give the neck pickup its own volume: inactive in bridge-only mode, a blend control in bridge-plus-neck mode, and the neck's pre-master level in neck mode.

**Evidence:** Confirmed

**Proposed classification:** Reference design

### VAC-006 — Independently available Nashville

**Statement:** Give the middle Nashville pickup its own volume and make it available alongside every outer-selector state.

**Evidence:** Confirmed

**Proposed classification:** Reference design

### VAC-007 — Intentional middle-only control state

**Statement:** Permit Nashville-only operation with the outer selector at neck, neck volume at zero, and middle volume raised.

**Evidence:** Proposed

**Proposed classification:** Reference design

**Notes:** Testing must establish whether this non-obvious state is musically useful and understandable.

### VAC-008 — Five-way blade selects voice, not pickups

**Statement:** Use a five-way blade to choose five repeatable passive loading or shaping networks rather than pickup combinations.

**Evidence:** Confirmed

**Proposed classification:** Reference design

### VAC-009 — Five intended voice positions

**Statement:** Target a progression of roundest and softest; warm and composed; balanced; open with softened edges; and direct or nearly direct.

**Evidence:** Proposed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** Each position must change resonant character and attack rather than act as another progressively darker tone setting.

### VAC-010 — Global post-mix master volume

**Statement:** Place one master volume after pickup mixing and voice shaping so it changes total output without disturbing the internal blend.

**Evidence:** Confirmed

**Proposed classification:** Reference design

### VAC-011 — Player-facing mental model

**Statement:** Present the controls as: three-way for outer pickups, neck volume for neck amount, middle volume for Nashville amount, five-way for voice, and master volume for loudness.

**Evidence:** Confirmed

**Proposed classification:** Platform, model, or voicing documentation

## Voice network and signal topology

### VAC-012 — Final passive signal order is unresolved

**Statement:** Determine the electrical order of the middle pickup, outer selector, voice network, and mixing buses through bench testing rather than relying on the conceptual block diagram.

**Evidence:** Unresolved

**Proposed classification:** Unresolved question

### VAC-013 — Outer-bus-only shaping is the preferred first test

**Statement:** Begin with the voice selector affecting the outer humbucker bus while the Nashville joins afterward and remains unshaped.

**Evidence:** Proposed

**Proposed classification:** Reference design

**Notes:** The intent is to retain the Nashville as a stable contrasting voice while shaping the outer pickups.

### VAC-014 — Compare global shaping

**Statement:** Compare outer-bus-only shaping with a second configuration in which the voice selector affects the complete mixed signal.

**Evidence:** Confirmed

**Proposed classification:** Design decision

### VAC-015 — Initial five-position RC networks

**Statement:** Begin with series-RC shunts of 150 kΩ + 1 nF, 220 kΩ + 680 pF, 330 kΩ + 470 pF, 470 kΩ + 330 pF, and open bypass.

**Evidence:** Proposed

**Proposed classification:** Reference design

**Notes:** Rebalance the set if removing the former nearly-direct network creates an excessive jump between Positions 4 and 5.

### VAC-016 — Current Prototype 1 pickup set is retained for the test

**Statement:** Use the GM Alnico V ’59 neck and bridge humbuckers and GFS Nashville Vintage Retrotron middle pickup for this bench evaluation.

**Evidence:** Confirmed

**Proposed classification:** Design decision

**Notes:** Retention for this controlled experiment does not canonize the trio as the future Velvet pickup set.

## Bench questions

### VAC-017 — Fixed bridge usefulness remains unresolved

**Statement:** Test whether a permanently full bridge provides a useful foundation or prevents balanced dual-humbucker sounds and desirable player control.

**Evidence:** Unresolved

**Proposed classification:** Unresolved question

### VAC-018 — Passive volume interaction remains unresolved

**Statement:** Test loading, dead zones, cross-control attenuation, treble loss, wiring direction, and linear-versus-audio taper for the neck and Nashville volume controls.

**Evidence:** Unresolved

**Proposed classification:** Unresolved question

### VAC-019 — Middle-only usefulness remains unresolved

**Statement:** Test whether the Nashville-only control state is electrically practical, musically useful, and intuitive enough to retain.

**Evidence:** Unresolved

**Proposed classification:** Unresolved question

### VAC-020 — Master-volume blend preservation remains unresolved

**Statement:** Verify that the master volume changes overall level without materially changing the selected pickup balance.

**Evidence:** Unresolved

**Proposed classification:** Unresolved question

### VAC-021 — Treble bleed is deferred

**Statement:** Use no treble bleed during the first validation pass and evaluate one only after the core control architecture works.

**Evidence:** Confirmed

**Proposed classification:** Design decision

## Bench implementation and acceptance

### VAC-022 — Use a serviceable bench harness

**Statement:** Build the experiment as an accessible harness with replaceable voice components, measurement points, swappable pot values and tapers, and selectable outer-only or global shaper placement.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

### VAC-023 — Initial pot comparison set

**Statement:** Compare B500K and A500K for neck volume, B500K and B1M for Nashville volume, and begin with A500K master volume.

**Evidence:** Proposed

**Proposed classification:** Reference design

### VAC-024 — Validate interaction before tonal refinement

**Statement:** Prioritize usable control sweeps and interaction behavior before final voice-network tuning.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

### VAC-025 — Eight acceptance criteria govern canonization

**Statement:** Canonize the architecture only if it provides useful neck blending, predictable Nashville blending, blend-preserving master volume, five distinct character voices, useful middle-only operation, brief-explanation intelligibility, and a better fit for Velvet's musical goal than the current architecture.

**Evidence:** Confirmed

**Proposed classification:** Design decision

## Conflicts and dependencies

1. VAC-001 and VAC-025 preserve VDH-018 through VDH-021 as the current reference direction until this experiment passes all acceptance criteria.
2. VAC-004 through VAC-007 reopen passive pickup layering for controlled evaluation; they do not yet supersede VDH-020's rejection of passive blending for production Velvet.
3. VAC-008 and VAC-015 revisit the Harmonic Shaper through a shallower, serviceable five-way blade; they do not yet supersede VDH-018's rejection of the horn-mounted six-position system.
4. VAC-016 deliberately reuses Prototype 1's rejected reference pickup set to isolate control-architecture behavior. It does not contradict VDH-021 or approve the pickup trio for a future reference instrument.
5. VAC-012 through VAC-020 require physical validation before any wiring diagram or player-facing Coupeville documentation is promoted.

## Explicit exclusions

- Do not overwrite the current Velvet reference architecture.
- Do not publish the alternate controls as a Coupeville product promise.
- Do not describe the conceptual block diagram as a verified schematic.
- Do not assume passive volume independence or outer-bus-only shaping without bench evidence.
- Do not add a treble bleed until the core interaction is validated.
