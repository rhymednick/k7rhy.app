# Coupeville Passive Audio Laboratory Bench Plan — Decision Inventory

## Source

- **Title:** Coupeville Passive Audio Laboratory — Bench Build Plan
- **Platform ID:** `CPAL-01`
- **Revision:** 1.0, 2026-08-05
- **Disposition:** Released for build
- **Reference loadout:** `VELVET-ERP-V1`
- **Scope:** Reusable passive-audio fixture, physical layout, component interfaces, test points, assembly, continuity checks, and validation matrix.

## Extraction notes

- `CPAL-01` is non-instrument-specific even though its first documented loadout is Velvet.
- Fixture construction choices may become reusable laboratory standards; the installed V1 values remain experiment-specific.
- The HTML is a build plan, not evidence that the laboratory has already been constructed or validated.

### CPAL-001 — Reusable non-instrument-specific laboratory

**Statement:** Build `CPAL-01` as a reusable fixture for passive pickup, pot, switch, RC-network, placement, and treble-bleed experiments without rebuilding its core.

**Evidence:** Confirmed

**Proposed classification:** Reference design

### CPAL-002 — Socket, label, and measure

**Statement:** Use “socket, label, measure” as the fixture's build principle.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

### CPAL-003 — Adjustable three-pickup rail

**Statement:** Mount three pickups on slotted rails with adjustable height and usable string spacing.

**Evidence:** Confirmed

**Proposed classification:** Reference design

### CPAL-004 — Serviceable physical layout

**Statement:** Use an approximately 24 × 12 inch rigid board with left-to-right signal flow, operator-facing sockets and test points, and clearance around control terminals.

**Evidence:** Proposed

**Proposed classification:** Reference design

### CPAL-005 — Keyed and solderless pickup interfaces

**Statement:** Connect pickups through documented keyed connectors and labeled screw terminals rather than soldering them permanently into the fixture.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

### CPAL-006 — Socket all tuning components

**Statement:** Socket every voice-network resistor/capacitor pair and the master treble bleed.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

### CPAL-007 — Expose named signal nodes

**Statement:** Provide TP0 ground plus eight labeled test points spanning individual pickups, outer bus, mixed bus, voice bus, master input, and final output.

**Evidence:** Confirmed

**Proposed classification:** Reference design

### CPAL-008 — Swappable control modules

**Statement:** Build blend and master pots as short plug-in modules so values, tapers, and wiring can be changed one variable at a time.

**Evidence:** Confirmed

**Proposed classification:** Reference design

### CPAL-009 — Exclusive network-placement jumper

**Statement:** Provide mutually exclusive GLOBAL and OUTER voice-network placements, with GLOBAL as the V1 baseline and OUTER as comparison only.

**Evidence:** Confirmed

**Proposed classification:** Reference design

### CPAL-010 — Short and controlled high-impedance paths

**Statement:** Keep high-impedance paths short, separated from mains wiring, mechanically strain-relieved, and identifiable at the common ground bus.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

### CPAL-011 — Defined assembly sequence

**Statement:** Build the fixture in ten stages: mechanical layout, hardware, ground, pickup interfaces, selection/blends, voice card, master/output, passive checks, measured components/loadout, and baseline validation.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

### CPAL-012 — Mandatory passive prechecks

**Statement:** Before pickup testing, verify isolation, ground continuity, switch mapping, one-branch selection, open bypass, exclusive placement states, pot direction and minimum, bleed topology, terminal clearance, and connector documentation.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

### CPAL-013 — Controlled measurement conditions

**Statement:** Keep stimulus and cable capacitance unchanged within comparisons, measure installed components, and return to baseline after each single-variable substitution.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

### CPAL-014 — Twelve-test validation matrix

**Statement:** Use tests V01–V12 to validate selection, blend sweeps, middle-only operation, five voices, placement, master and bleed variants, pot swaps, playing stability, and comparison with current Velvet.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

### CPAL-015 — Signed and revisioned test record

**Statement:** Record loadout revision, test IDs, observations, initials, build and continuity dates, review, and final branch disposition.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

## Dependencies

1. CPAL-001 through CPAL-015 implement VAC-022 and VAC-024 as a reusable laboratory rather than a one-off Velvet harness.
2. CPAL-009 operationalizes VAC-014 and ERP-006.
3. CPAL-014 operationalizes ERP-010, ERP-012, and ERP-013.
4. CPAL-013 supports VDH-026 through VDH-031's broader measurement-and-audition practice.
5. Release for build does not imply that `CPAL-01` has been constructed or that `VELVET-ERP-V1` has passed validation.
