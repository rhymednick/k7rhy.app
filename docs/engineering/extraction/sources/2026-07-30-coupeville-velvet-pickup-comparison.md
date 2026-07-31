# Coupeville Velvet Pickup Comparison — Decision Inventory

## Source

- **Title:** Pickup Comparison for Velvet
- **Shared conversation:** <https://chatgpt.com/share/6a6c263d-0b70-83e8-8834-26667cd74dfd>
- **Reviewed:** 2026-07-30
- **Scope:** Coupeville Velvet pickup selection, control architecture, Harmonic Shaper behavior and implementation, partial splits, physical control hierarchy, and build-ready component values.

## Extraction notes

- This inventory records durable candidates; it does not make them policy.
- The owner explicitly asked ChatGPT to save the selected Coupeville Velvet architecture and later the Harmonic Shaper specification. Those requests confirm the decisions as they stood at those points in the conversation.
- Later bench-planning questions exposed electrical and physical problems in parts of the saved design. Corrected entries preserve both the intended behavior and the buildable passive behavior that replaced it.
- Exact component values remain starting values until the completed instrument is measured and heard.

## Model identity and control architecture

### CVPC-001 — Velvet and Current differ through player experience

**Statement:** Velvet and Current may use overlapping pickup hardware while remaining distinct through the control behavior and musical experience they encourage.

**Evidence:** Proposed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** The conversation framed Velvet as preserving discrete Nashville-centered voices and Current as encouraging continuous humbucker shaping. The combined Coupeville design borrows from both, but the owner did not explicitly approve this wording as a formal model distinction.

### CVPC-002 — Pickup set for this Coupeville Velvet

**Statement:** The planned pickup set is a 7.23 kΩ Guitar Madness Alnico V ’59 neck humbucker, a 9.5 kΩ Nashville Vintage Retrotron center pickup, and an 8.45 kΩ Guitar Madness Alnico V ’59 bridge humbucker.

**Evidence:** Confirmed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** The owner supplied these measurements and asked to save the resulting Velvet reference design. The resistance readings identify the specific build candidates; they are not cross-product specifications.

### CVPC-003 — Do not use reverse-independent volumes

**Statement:** This Coupeville Velvet uses selection plus master controls rather than reverse-wired independent pickup volumes.

**Evidence:** Confirmed

**Proposed classification:** Design decision

**Notes:** The architecture was selected to avoid the severe passive interaction observed on Reef and to keep each control's job understandable. This does not retroactively change Reef.

### CVPC-004 — Nashville-centered five-way selection

**Statement:** The five-way blade positions are bridge; bridge plus Nashville; Nashville; Nashville plus neck; neck.

**Evidence:** Confirmed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** The owner asked to save this architecture. The arrangement makes the Nashville the literal center and omits a neck-plus-bridge position.

### CVPC-005 — Master performance controls

**Statement:** The main control area contains the five-way pickup selector, master volume, master tone, and the global partial-split control.

**Evidence:** Confirmed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** These are the familiar, performance-oriented controls. The partial split may share a pot through a push-pull or push-push mechanism.

### CVPC-006 — Global partial split for outer humbuckers

**Statement:** One global switch partially splits both outer PAF-style humbuckers when selected, while the Nashville remains a full humbucker in every position.

**Evidence:** Confirmed

**Proposed classification:** Design decision

**Notes:** The owner asked to save this choice. Independent splits and a Nashville split were rejected to preserve a coherent interface and the Nashville's core Velvet identity.

### CVPC-007 — Initial fixed split resistors

**Statement:** The initial build uses a fixed 2.2 kΩ partial-split resistor for each outer humbucker, with a possible later bridge experiment at 3.3 kΩ if the bridge becomes too thin or loses too much output.

**Evidence:** Proposed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** The final actionable recommendation returned to 2.2 kΩ on both pickups after abandoning position-dependent split resistors. The exact values were not followed by explicit owner approval and require listening validation.

## Player experience and brand philosophy

### CVPC-008 — Physical control hierarchy

**Statement:** Place the six-way Harmonic Shaper on the upper horn, apart from the familiar controls in the lower control area, so its physical location communicates that it is an instrument-level preset rather than a control to ride continuously.

**Evidence:** Confirmed

**Proposed classification:** Design decision

**Notes:** The owner proposed this layout and explicitly agreed with the resulting control-hierarchy rationale. Reach and clearance still require physical validation on the body.

### CVPC-009 — Conventional instrument first

**Statement:** Coupeville guitars should work beautifully as normal instruments first; unusual controls should reward curiosity rather than demand it.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

**Notes:** The owner described wanting a guitar that remains easy and good-sounding when the Harmonic Shaper is ignored, then explicitly endorsed the associated brand philosophy. The Harmonic Shaper's concise expression is “Set the character, then play the guitar normally.”

### CVPC-010 — Numbered presets with visible bypass

**Statement:** Label the Harmonic Shaper positions numerically, keep detailed voice descriptions in documentation, and identify Position 6 clearly as bypass.

**Evidence:** Proposed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** This supports the clean preset metaphor and avoids cluttering the instrument. The owner agreed with the broader control hierarchy but did not separately approve this labeling detail.

## Harmonic Shaper intent and behavior

### CVPC-011 — Harmonic Shaper purpose

**Statement:** The Harmonic Shaper is a repeatable pickup-load preset that changes attack, resonant emphasis, breadth, and perceived character while retaining more clarity than a conventional tone roll-off.

**Evidence:** Confirmed

**Proposed classification:** Reference design

**Notes:** The owner explicitly asked to save this specification. It should feel like a character selector rather than a second tone control.

### CVPC-012 — Six-position progression

**Statement:** The six positions progress from strongest shaping at Position 1 through increasingly subtle shaping at Position 5, followed immediately by open-circuit bypass at Position 6.

**Evidence:** Confirmed

**Proposed classification:** Reference design

**Notes:** The saved specification established strongest shaping at 1 and bypass at 6. The final exchange clarified the intended monotonic order: roundest/softest, warm/composed, balanced warmth, open/softened edges, nearly direct, bypass.

### CVPC-013 — Starting Harmonic Shaper networks

**Statement:** Positions 1–5 use selectable series RC branches of 150 kΩ plus 1 nF; 220 kΩ plus 680 pF; 330 kΩ plus 470 pF; 470 kΩ plus 330 pF; and 680 kΩ plus 220 pF, with Position 6 open.

**Evidence:** Confirmed

**Proposed classification:** Reference design

**Notes:** The owner explicitly asked to save these as the starting specification. They are tuning values, not validated final values. Increasing resistance and decreasing capacitance make the effect progressively weaker.

### CVPC-014 — Actual shared-node behavior

**Statement:** When the humbucker and Nashville switch outputs join at the master-volume input, a passive shunt connected to that node loads every active pickup on that node; it cannot affect only the humbucker contribution in blade Positions 2 and 4.

**Evidence:** Corrected

**Proposed classification:** Design decision

**Notes:** This corrects the earlier saved claim that the shaper could alter only the outer humbucker within a passive Nashville blend. Physical placement before the junction does not create electrical isolation once conductors share the same node.

### CVPC-015 — Buildable passive shaper connection

**Statement:** Connect the selected series RC branch as a shunt from the master-volume input node to ground, and route its ground return through a spare blade-switch pole that opens in Nashville-only Position 3.

**Evidence:** Corrected

**Proposed classification:** Reference design

**Notes:** This is the final buildable passive recommendation. The blade enables the shunt in Positions 1, 2, 4, and 5 and disconnects it in Position 3; rotary Position 6 remains open in every blade position. The order of the resistor and capacitor in each series branch is electrically interchangeable.

### CVPC-016 — Honest effect matrix

**Statement:** The shaper affects bridge alone in Position 1, the combined bridge/Nashville voice in Position 2, nothing in Nashville-only Position 3, the combined Nashville/neck voice in Position 4, and neck alone in Position 5.

**Evidence:** Corrected

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** This replaces the intended but unrealizable passive claim that the Nashville contribution remains entirely unshaped in blend positions. Isolating only the humbucker contribution would require buffering, mixing resistors, separate networks, or another architecture.

### CVPC-017 — Keep split wiring local and fixed

**Statement:** Keep each pickup series link and its fixed partial-split resistor local to the push-pull in the main control cavity rather than routing high-impedance series-link wiring to the horn rotary.

**Evidence:** Corrected

**Proposed classification:** Design decision

**Notes:** This supersedes the proposed self-calibrating rotary scheme with position-dependent split resistors. The physical distance would add several feet of sensitive wiring and make the build harder to understand and service.

### CVPC-018 — Reserve unused rotary poles

**Statement:** Use only the rotary pole needed for the Harmonic Shaper in the initial build and leave the remaining poles unpopulated or accessible for later local refinements discovered through listening tests.

**Evidence:** Proposed

**Proposed classification:** Design decision

**Notes:** This reverses the assistant's earlier assertion that the four-pole switch was too valuable to leave unused. Any later use should manipulate signals already local to the shaper rather than add remote pickup connections merely to consume available poles.

### CVPC-019 — Preserve orthogonal control roles

**Statement:** Do not use the Harmonic Shaper rotary to add phase reversal, neck-plus-bridge series selection, or unrelated pickup-selection tricks; the blade chooses pickups and the rotary chooses character.

**Evidence:** Proposed

**Proposed classification:** Design decision

**Notes:** The conversation consistently favored refinement over feature count, but the owner did not explicitly save each rejected alternative as a final decision.

## Build-specific component observations

### CVPC-020 — Available-part substitutions

**Statement:** The initial shaper may approximate its targets from available parts as 147 kΩ plus 1 nF; 220 kΩ plus 690 pF; 330 kΩ plus 470 pF; 470 kΩ plus 320 pF; and 690 kΩ plus 220 pF.

**Evidence:** Proposed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** These combinations were derived from components visible to ChatGPT in the source conversation. They should be checked against the actual parts before assembly. Small differences from the nominal targets were treated as acceptable relative to likely component tolerance.

### CVPC-021 — Reef mixing behavior remains an observation

**Statement:** Reef exhibited a severe level change near the top of reverse-wired independent linear volume controls, suggesting passive source interaction or end-of-track behavior that should be measured before generalizing a cause.

**Evidence:** Observed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** The assistant first blamed audio taper, then corrected that explanation when the owner clarified that the pots were linear. Pot resistance and isolated-path measurements were proposed but no results appear in this source, so the exact cause remains unvalidated.

## Corrections and superseded proposals

1. **Audio-taper explanation:** Superseded when the owner clarified that Reef uses linear pots.
2. **Humbucker-only shaping in blends:** Superseded because the humbucker and Nashville outputs share one electrical node at the master-volume input.
3. **Position-dependent split resistors on the horn rotary:** Superseded because the required long series-link wiring is physically undesirable.
4. **Populate extra rotary poles because they are available:** Superseded by the simpler initial build with unused poles reserved.
5. **Explore a different passive topology before producing an actionable plan:** Rejected for this build after the owner requested a circuit that could be wired immediately and once.

## Explicit exclusions

- The generated downloadable HTML file, which was a temporary sandbox artifact and is not available as a durable repository source.
- Private ChatGPT memory operations, which do not make the saved decisions available to repository agents.
- Predictions about tone or preferred positions that were not validated on the completed instrument.
- The conversation's unseen component photographs as authoritative inventory evidence; actual component markings must be checked at the bench.
