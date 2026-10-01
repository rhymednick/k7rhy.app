# Coupeville Reef reference design

- **Date:** 2026-10-01
- **Status:** approved by owner merge; matches the rewired prototype. Not yet a builder wiring diagram.
- **Source:** [Coupeville Reef layout inventory](../extraction/sources/2026-07-30-coupeville-reef-layout.md), candidates CRL-002 through CRL-009, CRL-011 through CRL-014, CRL-016 through CRL-020, and CRL-022 through CRL-024, promoted 2026-10-01. CRL-024 was promoted after the owner confirmed it on 2026-10-01. CRL-021 is cited but stays unpromoted until end-user testing

Coupeville Reef holds two voice families in one instrument: a lipstick subsystem and a humbucker, mixed by two independent branch volumes. This record is the circuit and parts direction. Player-facing descriptions belong on the [Coupeville Reef model page](../../../content/coupeville/models/reef.mdx) (CRL-001, CRL-003).

## Layout

- **Bridge:** humbucker. **Middle and neck:** lipsticks (CRL-002). The humbucker moved from the neck on 2026-10-01 because it was too unusual there. This matches the Relay Reef layout.
- **Lipstick selector:** three-way; neck lipstick, both lipsticks in parallel, or middle lipstick (CRL-004). The lever points toward the lipstick it selects (CRL-005).

## Circuit

- **Two branches** (CRL-006). Both lipsticks go through the three-way selector into one shared lipstick volume. The humbucker goes directly into its own volume. The two volume outputs join at the common output bus.
- **Reverse-independent volumes** (CRL-018). In each branch, the pickup or selector output goes to the pot wiper, one outer lug to the shared output bus, and the other outer lug to ground. Turning one branch fully down does not ground the common output.
- **One master tone** after the branches join, so it affects the whole output (CRL-007).
- **Continuous blend is the defining feature** (CRL-008). The two branch volumes, not extra switching, are Reef's custom behavior.
- **No extra switching** (CRL-009, CRL-011). No push-pull functions, lipstick series wiring, six-position full-system selector, lipstick bass contour, or variable out-of-phase blending. Push-pull pots may be fitted mechanically with their switch sections unused.

## Values

| Part             | Value                                             | Source                             |
| ---------------- | ------------------------------------------------- | ---------------------------------- |
| Lipstick volume  | B1M (1 MΩ linear)                                 | CRL-016, CRL-020, CRL-021, CRL-023 |
| Humbucker volume | B1M (1 MΩ linear), matched to the lipstick volume | CRL-021                            |
| Master tone      | A1M (1 MΩ audio)                                  | CRL-016; owner, 2026-10-01         |
| Tone capacitor   | 22 nF (`0.022 µF`, `223`), not 22 µF              | CRL-016, CRL-017                   |
| Treble bleed     | None on either branch                             | CRL-024; owner, 2026-10-01         |

- **Linear tapers.** Audio-taper (A1M) branch volumes gave an unusable, non-monotonic sweep in this topology: full at 10, a collapse near 9, partial recovery around 8–7, then near silence (CRL-019). Linear pots solved most of it (CRL-020).
- **Matched values (pending end-user testing).** Both branch volumes use the same value and taper. Mixed values change the common load seen by both pickup systems (CRL-021).
- **Why 1 MΩ.** Two equal always-connected volume tracks load the output roughly in parallel when full up: two 1 MΩ pots present about 500 kΩ, two 500 kΩ pots about 250 kΩ (CRL-022). Keep 1 MΩ to preserve the lipsticks' airy edge; the prototype's brightness is satisfactory (CRL-023).

## Prototype as built (2026-10-01)

- **Humbucker:** the available 7.6 kΩ GFS humbucker, exact model and magnet not identified, now in the bridge (CRL-012). Measured 4.29 H with Q 2.36 at 1 kHz, and 4.62 H with Q 0.37 at 100 Hz (CRL-013). It sounds full, mid-present, and sustaining rather than especially clear or airy (CRL-014).
- **Volumes:** matched B1M linear pots. They fixed the mixing behavior; lesser volume anomalies remain pending end-user testing (CRL-021).
- **Treble bleed:** none on either branch (owner confirmed, 2026-10-01; CRL-024).
- **Lipsticks:** roughly 6 kΩ DCR each (owner, 2026-10-01); models not named.

## Open

- **Lipstick models.** Not named; roughly 6 kΩ DCR.
- **Residual volume anomalies.** Pending end-user testing (CRL-021).

## Provenance

The owner accepted these candidates in the source conversation (2026-07-30) or in later build reports, decided the bridge-humbucker layout and its follow-ups on 2026-10-01, and approved this record by merging it.
