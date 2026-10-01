# Coupeville Velvet reference design

- **Date:** 2026-10-01
- **Status:** approved direction by owner merge; no circuit revision yet
- **Source:** [Coupeville Velvet / Relay Velvet design history](../extraction/sources/2026-07-31-velvet-design-history.md) (VDH-004, VDH-005, VDH-018 through VDH-021) and [Coupeville Velvet pickup comparison](../extraction/sources/2026-07-30-coupeville-velvet-pickup-comparison.md) (CVPC-003), promoted 2026-10-01

This is the current direction for the Coupeville Velvet reference architecture, learned from Prototype 1. It does not yet specify a circuit or a pickup set. It does not cover **Relay Velvet**, whose base harness is in [`relay-velvet-reference.md`](../relay-velvet-reference.md).

## Architecture

- **Voices before features.** Provide at least three genuinely different functional voices: a full, buttery neck voice; an open, complex middle or blended contrast voice; and an articulate bridge attention voice. Contrast must exist before splits, shapers, distortion, or elaborate wiring are added (VDH-004).
- **Familiar interface.** The blade selects musical voices and familiar master controls adjust the whole instrument. The player should not need to manage or understand the electronics continually (VDH-005).
- **Selection plus master controls.** Use pickup selection with master controls, not reverse-wired independent pickup volumes (CVPC-003), LP-style interactive volumes, or passive mixer recipes (VDH-020). This avoids the severe passive interaction seen on Reef and keeps each control's job clear.
- **No Harmonic Shaper.** The six-position Harmonic Shaper is not part of Velvet. On Prototype 1 it was subtle, hard to service, and could not repair a dark baseline voice (VDH-018). Shaper research continues outside Velvet (VDH-022).
- **No partial splits.** Prototype 1's partial splits sounded thin or hollow rather than genuinely distinct (VDH-019).
- **No convergent pickup set.** Do not build the reference set from three pickups that converge on broad, moderate-Q, PAF-adjacent behavior (VDH-021).

## Open

- **Pickup set.** No set is named. Each role must pass common measurement and clean-audition criteria as a system first (VPTC-018).
- **Bench experiment.** The [`VELVET-ERP-V1` bench test](2026-08-23-bench-test.md) tries a separate outer volume, a Nashville blend, and a five-way global voice network. Its blend controls differ from "selection plus master controls" above. It is a bench experiment only and cannot change this direction unless it passes all eight acceptance criteria and the owner decides to adopt it (VAC-001, VAC-025, ERP-013).

## Provenance

The owner accepted these candidates in the source conversations (2026-07-30 and 2026-07-31) and approved promoting them to this record on 2026-10-01 by merging it.
