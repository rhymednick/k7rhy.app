# Relay Reef reference circuit

**Revision:** 1.0

**Status:** Proposed 2026-10-01. Adapted from the approved [Coupeville Reef reference design](coupeville-reef/reference-design.md) for the Relay body, which has room for two knobs and a blade. Not yet built or measured as a Relay; the voicing stays `lab`. The [Rev 1.0 wiring diagram](../../public/wiring-diagrams/relay-reef-rev-1.0.png) and the [Relay Reef wiring page](../../content/relay/wiring/reef.mdx) are drawn from this file. Decision record: [Relay Reef variants](../decisions/2026-10-01-relay-reef-variants.md).

This file is the netlist for the Relay Reef wiring page. It records the circuit as designed; it is not evidence that a harness was built or measured.

## Differences from Coupeville Reef

- **No tone control.** The Relay body has two knob positions; both go to the branch volumes (owner, 2026-10-01). [Relay Reef Plus](relay-reef-plus-reference.md) restores tone control with concentric pots. Without the master tone's 1 MΩ track on the output, Relay Reef loads the pickups slightly less than Coupeville Reef with its tone fully up, so expect it to be slightly brighter.
- **Selector.** A two-pole 3-way blade instead of the Coupeville three-way selector. Same three lipstick states and the same lever rule: the blade points toward the lipstick it selects.
- **Bridge humbucker.** GFS Vintage ’59 (KPH65, Alnico V), chosen over the Classic II for more contrast with the lipsticks (owner, 2026-10-01). The Coupeville prototype uses an unidentified 7.6 kΩ GFS humbucker.

Everything else follows Coupeville Reef: reverse-independent branch volumes (CRL-018), matched B1M linear tapers (CRL-019 through CRL-023), no treble bleed (CRL-024), and lipsticks around 6 kΩ.

## Parts

- Bridge: GFS Vintage ’59 humbucker in full series, with hot, return, shield, and series junction. Insulate the series junction; never ground it.
- Middle and neck: GFS Pro Tube lipsticks, around 6 kΩ each, with hot, return, and shield or case ground.
- Two-pole 3-way blade (vintage Fender style, eight lugs).
- Lipstick volume and humbucker volume: B1M (1 MΩ linear), matched. Matched values are pending end-user testing (CRL-021).
- Mono output jack. No tone pot, tone capacitor, master volume, or treble bleed.

## Operating states

The blade picks the lipstick branch's source. The humbucker branch is always available. The two volumes blend them continuously; either volume at zero removes only its own branch.

| 3-way blade | Lipstick branch                     | Humbucker branch                            |
| ----------- | ----------------------------------- | ------------------------------------------- |
| 1 — Neck    | Neck lipstick                       | Bridge humbucker, blended by its own volume |
| 2 — Both    | Neck + middle lipsticks in parallel | Bridge humbucker, blended by its own volume |
| 3 — Middle  | Middle lipstick                     | Bridge humbucker, blended by its own volume |

## Blade contacts

Each pole connects its common to exactly one throw per position: throw 1 in position 1, throw 2 in position 2, throw 3 in position 3. The names are a **generic functional map**, not manufacturer lug numbers; identify the actual contacts by continuity in all three positions.

| Pole       | Common         | Throw 1       | Throw 2       | Throw 3       |
| ---------- | -------------- | ------------- | ------------- | ------------- |
| A — neck   | `AC` = `L-SEL` | `A1` = `NL-H` | `A2` = `NL-H` | `A3` (unused) |
| B — middle | `BC` = `L-SEL` | `B1` (unused) | `B2` = `ML-H` | `B3` = `ML-H` |

Jumper `A1` to `A2`, `B2` to `B3`, and `AC` to `BC`. Each lipstick hot has its own pole, so the two hots never share a contact; they meet only at `L-SEL`, and only in position 2.

## Netlist

| Net     | Connected terminals                                                                                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NL-H`  | Neck lipstick hot; blade `A1`; blade `A2`                                                                                                                                      |
| `ML-H`  | Middle lipstick hot; blade `B2`; blade `B3`                                                                                                                                    |
| `L-SEL` | Blade `AC`; blade `BC`; lipstick volume wiper                                                                                                                                  |
| `HB-H`  | Bridge humbucker hot; humbucker volume wiper                                                                                                                                   |
| `BUS`   | Lipstick volume CW lug; humbucker volume CW lug; output jack tip                                                                                                               |
| `GND`   | Lipstick and humbucker returns and separate shields/cases; both volume CCW lugs; jack sleeve; and, as standard practice, pot cases, cavity shielding, and bridge/string ground |

Unconnected: blade `A3` and `B1`; humbucker series junction (insulated, never grounded; join two separate series ends first if the pickup supplies them).

## Controls

| Control          | Part                                              | Rear view, shaft away, lugs down: left / center / right |
| ---------------- | ------------------------------------------------- | ------------------------------------------------------- |
| Lipstick volume  | B1M (1 MΩ linear)                                 | `BUS` / `L-SEL` / `GND`                                 |
| Humbucker volume | B1M (1 MΩ linear), matched to the lipstick volume | `BUS` / `HB-H` / `GND`                                  |

Left/center/right are CW/wiper/CCW. Each volume takes its source on the **wiper** (reverse-independent wiring, CRL-018), so turning it down grounds only its own source, never `BUS`. With `BUS` on the CW lug, clockwise is louder. `BUS` goes straight to the jack tip.

## Bench expectations

Derived from the netlist, measured at the jack between tip and sleeve. Starting points, not pass/fail limits.

- Lipstick volume full up, humbucker volume at zero: roughly 6 kΩ in positions 1 and 3 (one lipstick) and roughly 3 kΩ in position 2 (two lipsticks in parallel).
- Humbucker volume full up, lipstick volume at zero: roughly the humbucker's own resistance.
- Both volumes at zero: roughly 500 kΩ, the two 1 MΩ tracks in parallel from `BUS` to `GND`. The tip does not reach ground; a short here means a source is on an outer lug instead of the wiper.

## Open

- **Not built as a Relay.** The circuit is unchanged from Coupeville Reef apart from the tone removal, blade, and bridge pickup, but no Relay Reef harness has been built or measured.
- **Residual volume anomalies.** Pending end-user testing (CRL-021).
