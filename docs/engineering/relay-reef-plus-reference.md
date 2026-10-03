# Relay Reef Plus reference circuit

**Revision:** 1.0

**Status:** Proposed 2026-10-02. Relay Reef with a tone on each branch, on two stock 500k/500k audio concentric pots (owner, 2026-10-02). Not built or measured. The voicing stays `lab`. The [Rev 1.0 wiring diagram](../../public/wiring-diagrams/relay-reef-plus-rev-1.0.png) and the [Relay Reef Plus wiring page](../../content/relay/wiring/reef-plus.mdx) are drawn from this file. Decision record: [Relay Reef variants](../decisions/2026-10-01-relay-reef-variants.md).

This file is the netlist for the Relay Reef Plus wiring page. It records the circuit as designed; it is not evidence that a harness was built or measured.

## Differences from Relay Reef

- **Tone per branch.** Each branch has its own tone, wired to that branch's source before its volume. The tones are not isolated: a volume at full up puts its branch source directly on `BUS`, so that branch's tone then loads the whole output. A tone acts mainly on its own branch only as that branch's volume comes down. The owner accepted this interaction on 2026-10-03 rather than add isolation resistors or use a master tone.
- **Pots.** Two 500k/500k audio-taper concentric pots replace the two B1M linear volumes. Each pot carries one branch's volume and tone. This departs from the Coupeville Reef findings: audio-taper branch volumes gave a non-monotonic sweep (CRL-019), linear tapers fixed most of it (CRL-020), and 1 MΩ keeps the lipsticks' airy edge (CRL-022, CRL-023). The owner chose the stock part on 2026-10-02; Reef Plus tests whether it is usable.
- **Loading.** With both volumes full up, the two 500k volume tracks load the output at about 250 kΩ, against about 500 kΩ for Relay Reef. Expect a darker sound.

Everything else follows [Relay Reef](relay-reef-reference.md): the same pickups, the same two-pole blade and contact map, reverse-independent branch volumes (CRL-018), and no treble bleed (CRL-024).

## Parts

- Bridge: GFS Vintage ’59 humbucker in full series, with hot, return, shield, and series junction. Insulate the series junction; never ground it.
- Middle and neck: GFS Pro Tube lipsticks, around 6 kΩ each, with hot, return, and shield or case ground.
- Two-pole 3-way blade (vintage Fender style, eight lugs).
- Lipstick concentric pot and humbucker concentric pot: each 500k/500k audio taper (CTS stacked, Allparts EP-4586-000). Suggested: volume on the upper shaft, tone on the lower shaft. Shaft sizes are from the Allparts listing; fit in the Relay control holes and cavity is not yet verified.
- Two 22 nF tone capacitors (`0.022 µF`, `223`), one per branch.
- Mono output jack. No master volume, master tone, or treble bleed.

## Operating states

The blade picks the lipstick branch's source. The humbucker branch is always available. The two volumes blend the branches continuously, and each tone shapes its own branch, or the whole output when its branch volume is up.

| 3-way blade | Lipstick branch                     | Humbucker branch                            |
| ----------- | ----------------------------------- | ------------------------------------------- |
| 1 — Neck    | Neck lipstick                       | Bridge humbucker, blended by its own volume |
| 2 — Both    | Neck + middle lipsticks in parallel | Bridge humbucker, blended by its own volume |
| 3 — Middle  | Middle lipstick                     | Bridge humbucker, blended by its own volume |

## Blade contacts

Identical to Relay Reef. The names are a **generic functional map**, not manufacturer lug numbers; identify the actual contacts by continuity in all three positions.

| Pole       | Common         | Throw 1       | Throw 2       | Throw 3       |
| ---------- | -------------- | ------------- | ------------- | ------------- |
| A — neck   | `AC` = `L-SEL` | `A1` = `NL-H` | `A2` = `NL-H` | `A3` (unused) |
| B — middle | `BC` = `L-SEL` | `B1` (unused) | `B2` = `ML-H` | `B3` = `ML-H` |

Jumper `A1` to `A2`, `B2` to `B3`, and `AC` to `BC`.

## Netlist

| Net     | Connected terminals                                                                                                                                                                                   |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NL-H`  | Neck lipstick hot; blade `A1`; blade `A2`                                                                                                                                                             |
| `ML-H`  | Middle lipstick hot; blade `B2`; blade `B3`                                                                                                                                                           |
| `L-SEL` | Blade `AC`; blade `BC`; lipstick volume wiper; lipstick tone CCW lug                                                                                                                                  |
| `LT-W`  | Lipstick tone wiper; one 22 nF capacitor (other end to `GND`)                                                                                                                                         |
| `HB-H`  | Bridge humbucker hot; humbucker volume wiper; humbucker tone CCW lug                                                                                                                                  |
| `HT-W`  | Humbucker tone wiper; one 22 nF capacitor (other end to `GND`)                                                                                                                                        |
| `BUS`   | Lipstick volume CW lug; humbucker volume CW lug; output jack tip                                                                                                                                      |
| `GND`   | Lipstick and humbucker returns and separate shields/cases; both volume CCW lugs; both tone-cap returns; jack sleeve; and, as standard practice, pot cases, cavity shielding, and bridge/string ground |

Unconnected: blade `A3` and `B1`; both tone CW lugs; humbucker series junction (insulated, never grounded; join two separate series ends first if the pickup supplies them).

## Controls

Each concentric pot has two decks. Identify which deck each shaft turns with a meter before wiring.

| Control                                 | Part            | Rear view, shaft away, lugs down: left / center / right |
| --------------------------------------- | --------------- | ------------------------------------------------------- |
| Lipstick volume (suggested upper knob)  | 500k audio deck | `BUS` / `L-SEL` / `GND`                                 |
| Lipstick tone (suggested lower knob)    | 500k audio deck | unused / `LT-W` / `L-SEL`                               |
| Humbucker volume (suggested upper knob) | 500k audio deck | `BUS` / `HB-H` / `GND`                                  |
| Humbucker tone (suggested lower knob)   | 500k audio deck | unused / `HT-W` / `HB-H`                                |

Left/center/right are CW/wiper/CCW. Each volume takes its source on the **wiper** (reverse-independent wiring, CRL-018), so turning it down grounds only its own source, never `BUS`. With `BUS` on the CW lug, clockwise is louder. Each tone takes its branch source on the CCW lug, so clockwise is brighter. `BUS` goes straight to the jack tip.

## Bench expectations

Derived from the netlist, measured at the jack between tip and sleeve. The tone capacitors block DC, so the tone settings do not change these readings. Starting points, not pass/fail limits.

- Lipstick volume full up, humbucker volume at zero: roughly 6 kΩ in positions 1 and 3 and roughly 3 kΩ in position 2.
- Humbucker volume full up, lipstick volume at zero: roughly the humbucker's own resistance.
- Both volumes at zero: roughly 250 kΩ, the two 500 kΩ volume tracks in parallel from `BUS` to `GND`. The tip does not reach ground; a short here means a source is on an outer lug instead of the wiper.

## Open

- **Not built.** No Relay Reef Plus harness has been built or measured.
- **Audio-taper volume sweep.** Expected to show the CRL-019 behavior to some degree. Validate on the first build.
- **Knob convention.** Volume on the upper knob is a suggestion, not an owner decision.
- **Fit.** The concentric pots have not been test-fitted in a Relay body.
