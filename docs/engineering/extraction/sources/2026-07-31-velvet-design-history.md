# Coupeville Velvet / Relay Velvet Design History — Decision Inventory

## Source

- **Title:** Coupeville Velvet / Relay Velvet Design History
- **Provided:** 2026-07-31 as a working platform record derived from the ChatGPT conversation “Pickup Comparison for Velvet”
- **Design status:** Prototype evaluated; reference redesign not yet validated
- **Scope:** Velvet musical identity, Prototype 1 construction and listening results, rejected systems, pickup-selection method, and the provisional next-reference architecture.

## Extraction notes

- This inventory preserves the artifact's explicit status vocabulary without treating provisional recommendations as production facts.
- `DECIDED` maps to **Confirmed**, `OBSERVED` to **Observed**, accepted corrections or rejections to **Corrected**, and `PROVISIONAL` or `PENDING TEST` to **Proposed** or **Unresolved** as appropriate.
- Prototype facts belong to design history or a serialized prototype record. Stable musical principles may later be promoted to the Velvet model page.
- This source supersedes several earlier Velvet implementation choices in CVPC while preserving their historical and research value.

## Musical identity

### VDH-001 — Solo-jazz and light-accompaniment purpose

**Statement:** Design Velvet to carry a solo jazz set or light accompaniment through phrasing, dynamics, harmonic completeness, and a compelling clean voice.

**Evidence:** Confirmed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** The guitar must hold attention without shouting and remain complete before distortion is added.

### VDH-002 — Articulate warmth

**Statement:** Define Velvet as an articulate warm guitar: intimate, harmonically rich, dynamically responsive, smooth in the treble, controlled in the bass, and clear between notes and strings.

**Evidence:** Confirmed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** Warmth and sophistication are separate axes; warmth without harmonic structure becomes mud.

### VDH-003 — Clean interest is mandatory

**Statement:** Velvet must be musically interesting clean; breakup may enhance its personality but must not manufacture missing harmonic interest.

**Evidence:** Confirmed

**Proposed classification:** Platform, model, or voicing documentation

### VDH-004 — Three genuinely different functional voices

**Statement:** Provide at least a full buttery neck voice, an open complex middle or blended contrast voice, and an articulate bridge attention voice.

**Evidence:** Confirmed

**Proposed classification:** Platform, model, or voicing documentation

**Notes:** Contrast must exist before splits, shapers, distortion, or elaborate wiring are added.

### VDH-005 — Familiar player interface

**Statement:** Let the blade select musical voices and familiar master controls adjust the instrument globally; the player should not need to manage or understand the electronics continually.

**Evidence:** Confirmed

**Proposed classification:** Design decision

## Prototype 1 facts

### VDH-006 — Installed pickup set and five-way

**Statement:** Prototype 1 used GM Alnico V ’59 neck and bridge humbuckers around a GFS Nashville Vintage Retrotron, selected bridge; bridge plus middle; middle; middle plus neck; neck.

**Evidence:** Observed

**Proposed classification:** Serialized-instrument documentation

**Notes:** The set is rejected for the future reference design but remains an important measured baseline.

### VDH-007 — Installed first-generation controls

**Statement:** Prototype 1 used approximately 500 kΩ master loading, an approximately 18 nF hand-rolled tone capacitor, global 2.2 kΩ outer-humbucker partial splits, and a horn-mounted six-position Harmonic Shaper.

**Evidence:** Observed

**Proposed classification:** Serialized-instrument documentation

### VDH-008 — Installed Harmonic Shaper networks

**Statement:** The prototype shaper used five series-RC shunts approximating 147 kΩ + 1 nF, 220 kΩ + 690 pF, 330 kΩ + 470 pF, 470 kΩ + 320 pF, and 690 kΩ + 220 pF, followed by open bypass.

**Evidence:** Observed

**Proposed classification:** Serialized-instrument documentation

**Notes:** These are installed prototype values, not a validated Velvet reference specification.

### VDH-009 — Shared-node behavior correction

**Statement:** In mixed blade positions, a passive shunt at the master-volume input loads the combined pickup signal; Nashville solo was isolated only by opening the shaper return with a spare blade pole.

**Evidence:** Corrected

**Proposed classification:** Reference design

**Notes:** Shaping only one contributor after passive signals share a node requires actual isolation or another topology.

### VDH-010 — Dark baseline and ineffective tone sweep

**Statement:** Prototype 1 was consistently mid/bass-heavy, lacked baseline treble and separation, and became boomy as its tone control was rolled down.

**Evidence:** Observed

**Proposed classification:** Listening note

### VDH-011 — Pickup convergence

**Statement:** The three installed pickups sounded unusually alike, with differences dominated by physical position rather than distinct pickup personalities.

**Evidence:** Observed

**Proposed classification:** Listening note

### VDH-012 — Breakup supplied missing interest

**Statement:** Overdrive and distortion made Prototype 1 more interesting, indicating that breakup supplied harmonic interest absent from its clean signal.

**Evidence:** Observed

**Proposed classification:** Listening note

### VDH-013 — Basic checks did not reveal a simple fault

**Statement:** Repeated jack-resistance checks matched expectations, while pickup-height and output balancing improved clarity without creating distinct pickup identities.

**Evidence:** Observed

**Proposed classification:** Listening note

**Notes:** These checks reduce the likelihood of a simple DC wiring error but do not clear every frequency-dependent loading path.

### VDH-014 — Partial splits failed musically

**Statement:** The neck partial split was thinner and only slightly chimey, while the bridge split sounded hollow; neither created a valuable Velvet voice.

**Evidence:** Observed

**Proposed classification:** Listening note

### VDH-015 — Shaper effect was subtle and directionally wrong

**Statement:** The shaper was barely audible on a tube amplifier and somewhat clearer on a solid-state amplifier, but it only moved the guitar from deep to deeper while bypass was already too dark.

**Evidence:** Observed

**Proposed classification:** Listening note

### VDH-016 — Horn-mounted serviceability failure

**Statement:** Limited cavity space, component insulation, and impractical post-assembly retuning made the horn-mounted shaper difficult to build and service.

**Evidence:** Observed

**Proposed classification:** Design decision

### VDH-017 — String failure was a confounder, not a scale problem

**Statement:** Early high-E failures came from questionable ball ends; a reputable replacement set tuned normally and enabled meaningful listening tests.

**Evidence:** Corrected

**Proposed classification:** Serialized-instrument documentation

## Accepted rejections and platform lessons

### VDH-018 — Remove Harmonic Shaper from Velvet

**Statement:** Remove the six-position Harmonic Shaper from the Velvet reference architecture because it was subtle, difficult to service, and unable to repair a dark baseline voice.

**Evidence:** Confirmed

**Proposed classification:** Design decision

### VDH-019 — Remove partial splits from Velvet

**Statement:** Do not use partial splits in the Velvet reference architecture because the prototype results were thin or hollow rather than genuinely distinct voices.

**Evidence:** Confirmed

**Proposed classification:** Design decision

### VDH-020 — Reject passive blend architectures for Velvet

**Statement:** Do not use Reef-style reverse-independent volumes, LP-style interactive volumes, or passive mixer recipes for Velvet; retain selection plus master controls.

**Evidence:** Confirmed

**Proposed classification:** Design decision

### VDH-021 — Reject three electrically similar warm humbuckers

**Statement:** Do not build the Velvet reference set from three pickups that converge on broad, moderate-Q, PAF-adjacent behavior.

**Evidence:** Confirmed

**Proposed classification:** Design decision

### VDH-022 — Preserve shaper research outside Velvet

**Statement:** Preserve the Harmonic Shaper values, topology correction, and serviceability lessons as Current or passive-voicing research rather than discarding the failed Velvet feature.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

### VDH-023 — Musical benefit must justify service burden

**Statement:** A feature that is difficult to build and service requires an unmistakable musical benefit.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

### VDH-024 — Preserve failed prototypes as research

**Statement:** Preserve failed Coupeville prototypes as research even when their features are rejected from the production or reference direction.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

### VDH-025 — Differentiate models through player behavior

**Statement:** Differentiate Coupeville models by how they make the player play, not by feature count.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

## Pickup-selection method

### VDH-026 — Select by measurement, construction, and clean audition

**Statement:** Select Velvet pickups through comparative electrical measurement, physical construction, and clean audition rather than DCR, magnet, model name, or marketing category alone.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

### VDH-027 — Consistent pickup inventory fields

**Statement:** Record identity, construction, magnet when known, DCR, 1 kHz inductance and Q, optional 100 Hz readings, dimensions, mounting constraints, and clean listening notes under high and moderate loading.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

### VDH-028 — Use L and Q comparatively

**Statement:** Use 1 kHz inductance and Q as comparative evidence rather than complete predictions of installed response.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** Pots, cable capacitance, amplifier input, position, aperture, height, and winding resistance remain relevant.

### VDH-029 — Provisional electrical screening bands

**Statement:** Use the documented role-specific inductance and comparative-Q bands only to prioritize Velvet candidates for audition, not as final pickup specifications.

**Evidence:** Proposed

**Proposed classification:** Engineering recommendation

### VDH-030 — Minimal-load audition sequence

**Statement:** Audition finalists direct to jack, then under 1 MΩ and approximately 500 kΩ reference loads before adding the final control network.

**Evidence:** Proposed

**Proposed classification:** Engineering recommendation

### VDH-031 — Velvet pickup pass criteria

**Statement:** Require finalists to retain clean interest and separation under both loads, remain distinct at matched volume, balance through ordinary height adjustment, and avoid depending on breakup for differentiation.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

## Pending diagnosis and next reference

### VDH-032 — Known outer-pickup measurements

**Statement:** Preserve the GM neck measurement of 3.59 H / Q 2.23 and bridge measurement of 5.09 H / Q 2.46 at 1 kHz as Prototype 1 baselines.

**Evidence:** Observed

**Proposed classification:** Serialized-instrument documentation

### VDH-033 — Nashville remains unresolved

**Statement:** Do not describe the Nashville as inherently muddy until its out-of-circuit inductance and Q and simplified-circuit clean voice are tested.

**Evidence:** Unresolved

**Proposed classification:** Unresolved question

### VDH-034 — Prototype isolation sequence remains pending

**Statement:** If diagnosis continues, bypass the shaper, disconnect the tone branch, physically disconnect the shaper if needed, and test each pickup direct to jack.

**Evidence:** Unresolved

**Proposed classification:** Unresolved question

### VDH-035 — Individual replacement pickups are only candidates

**Statement:** Keep the PRS Dragon II Bass, PRS \\m/ Bass, Nashville, lipstick, gold foil, Filter’Tron-type, P-90, mini-humbucker, Firebird-style, blade, and rail suggestions provisional until measured and auditioned.

**Evidence:** Proposed

**Proposed classification:** Platform, model, or voicing documentation

### VDH-036 — Provisional next-reference pickup architecture

**Statement:** Seek a moderate-inductance harmonically rich neck, a meaningfully different lower-inductance or narrower-aperture middle, and an articulate bridge with firmer attack; retain the conventional five-way.

**Evidence:** Proposed

**Proposed classification:** Reference design

### VDH-037 — Provisional next-reference controls

**Statement:** Evaluate a 1 MΩ audio master volume with 680 pF + 150 kΩ parallel treble bleed, a 500 kΩ no-load master tone, and the approximately 18 nF capacitor only after leakage testing.

**Evidence:** Proposed

**Proposed classification:** Reference design

### VDH-038 — Optional global loading switch

**Statement:** Consider a switchable 1 MΩ shunt for approximately 1 MΩ open and 500 kΩ loaded modes only if both settings are obvious and musically useful with the selected trio.

**Evidence:** Proposed

**Proposed classification:** Reference design

## Corrections and dependencies

1. VDH-018 supersedes CVPC-008 and the Velvet-specific application of CVPC-010 through CVPC-013; the shaper specification remains historical prototype data and reusable research.
2. VDH-019 supersedes CVPC-005 through CVPC-007 for the Velvet reference direction. VDH-007 records that Prototype 1 actually used two 2.2 kΩ splits; the later 2.2 kΩ/3.3 kΩ plan was not built and no longer controls the reference design.
3. VDH-008 confirms the component substitutions recorded by CVPC-020 were built and heard.
4. VDH-009 corroborates CVPC-014 through CVPC-016.
5. VDH-020 reinforces CVPC-003; it does not change Reef's separate experimental architecture.
6. VDH-026 through VDH-031 extend CRL-015 from a measurement recommendation into a repeatable pickup-selection protocol.
7. VDH-033 and VDH-034 prevent the prototype diagnosis from overstating whether pickup construction or the complete passive network caused every observed problem.

## Explicit exclusions

- No individual replacement pickup is approved for the next Velvet reference design.
- The provisional electrical bands are screening aids, not universal pickup-quality thresholds.
- The provisional master controls and loading switch are not production-approved.
- Predictions from model names, magnet labels, or construction categories are not promoted as listening facts.
