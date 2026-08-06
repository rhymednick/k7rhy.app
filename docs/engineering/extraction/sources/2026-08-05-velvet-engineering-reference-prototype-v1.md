# Velvet Engineering Reference Prototype V1 — Decision Inventory

## Source

- **Title:** Coupeville Velvet — Engineering Reference Prototype V1
- **Record ID:** `VELVET-ERP-V1`
- **Revision:** 1.0, 2026-08-05
- **Disposition:** Experimental test branch approved for bench evaluation
- **Scope:** Consolidated electrical baseline, global voice network, master-volume treble-bleed trials, validation questions, and branch disposition.

## Extraction notes

- This record refines the earlier VAC proposal but still does not replace the current Velvet production or reference architecture.
- Exact topology and values are an approved bench baseline, not validated musical conclusions.
- The source explicitly supersedes the outer-bus-only shaping preference and earlier, stronger RC candidates for this experimental branch.

### ERP-001 — Stable experimental identity

**Statement:** Identify the branch and all derived drawings, BOMs, test results, and decisions as `VELVET-ERP-V1`.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

### ERP-002 — Explicit promotion gate

**Statement:** No value or topology becomes production canon until the validation matrix is completed, reviewed, and followed by an explicit promotion decision.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

### ERP-003 — Preserve failed branch history

**Statement:** Retain the branch and its findings even if the experiment is abandoned.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

### ERP-004 — Consolidated reference signal architecture

**Statement:** Feed a fixed bridge and B1M-controlled neck through the outer selector, mix in a B1M-controlled Nashville, shape the complete mixed bus globally, then feed an A500K master volume and output.

**Evidence:** Confirmed

**Proposed classification:** Reference design

### ERP-005 — Reverse-independent blend topology

**Statement:** Wire the B1M neck and Nashville controls as reverse-independent volumes with pickup hot to wiper, output from the active outer lug, and the remaining outer lug grounded.

**Evidence:** Confirmed

**Proposed classification:** Reference design

**Notes:** Confirm the active outer lug before final soldering so clockwise rotation increases level.

### ERP-006 — Global shaping supersedes outer-only baseline

**Statement:** Connect the five-way voice network to the complete mixed pickup bus before master volume; retain outer-only placement only as a comparison.

**Evidence:** Corrected

**Proposed classification:** Reference design

### ERP-007 — Lighter V1 voice-network values

**Statement:** Use 180 kΩ + 820 pF, 270 kΩ + 560 pF, 390 kΩ + 390 pF, and 680 kΩ + 220 pF series-RC branches followed by open bypass.

**Evidence:** Corrected

**Proposed classification:** Reference design

**Notes:** These values supersede the earlier stronger candidate set for this branch because the network now includes the Nashville.

### ERP-008 — Working voice labels

**Statement:** Label the five experimental positions Roundest, Warm, Balanced, Open, and Direct for bench reference.

**Evidence:** Proposed

**Proposed classification:** Platform, model, or voicing documentation

### ERP-009 — Reference master and treble bleed

**Statement:** Use an A500K master with a socketed parallel 680 pF and 150 kΩ treble bleed as the reference implementation.

**Evidence:** Proposed

**Proposed classification:** Reference design

**Notes:** It is the expected winner, not a validated production value.

### ERP-010 — Required master-volume comparisons

**Statement:** Compare no bleed, 680 pF parallel 150 kΩ, and 560 pF parallel 150 kΩ; optionally test 680 pF alone to isolate the resistor's contribution.

**Evidence:** Confirmed

**Proposed classification:** Design decision

### ERP-011 — Retain Prototype 1 pickups for controlled testing

**Statement:** Use the existing GM ’59 neck and bridge and GFS Nashville middle set for `VELVET-ERP-V1`, while recording actual specimen resistance before testing.

**Evidence:** Confirmed

**Proposed classification:** Design decision

### ERP-012 — Required bench questions

**Statement:** Evaluate blend sweeps, bus interaction, voice distinction, global-network usefulness, Open-versus-Direct separation, master balance, treble-bleed behavior, middle-only usability, and player comprehension.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

### ERP-013 — Promotion requires comparison with current Velvet

**Statement:** Require documented evidence that the experiment serves Velvet's musical goal better than the current production control architecture before promotion.

**Evidence:** Confirmed

**Proposed classification:** Design decision

### ERP-014 — Four allowed branch dispositions

**Statement:** After validation, record exactly one disposition: promote to reference implementation, revise as V2, retain as experimental, or abandon with findings preserved.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

### ERP-015 — Build on the reusable laboratory harness

**Statement:** Build `VELVET-ERP-V1` first on the reusable development harness rather than committing it directly to an instrument body.

**Evidence:** Confirmed

**Proposed classification:** Design decision

## Corrections and dependencies

1. ERP-006 supersedes VAC-013 as the V1 baseline; outer-only shaping remains required comparison data under VAC-014.
2. ERP-007 supersedes VAC-015's stronger RC values for V1.
3. ERP-004 and ERP-005 refine VAC-004 through VAC-010 into a specific electrical baseline without resolving whether the controls will behave acceptably.
4. ERP-009 refines VAC-021: begin with no bleed for comparison, but test the socketed 680 pF parallel 150 kΩ network as the V1 reference candidate.
5. ERP-013 and ERP-014 preserve VAC-001 and VAC-025's bench-only boundary.

