# Relay Lipstick reference circuit

**Revision:** 1.0

**Status:** Transcribed 2026-10-01 from the approved [Rev 1.0 wiring diagram](../../public/wiring-diagrams/relay-lipstick-rev-1.0.png) (2026-09-11), which [the wiring workflow](wiring-diagrams.md) names as the approved example. The published [Relay Lipstick wiring page](../../content/relay/wiring/lipstick.mdx) agrees with it on every connection, which the wiring check confirms. The diagram is the authority; this file is its text form.

This file is the netlist for the published Lipstick page. It records the circuit as drawn; it is not evidence that a harness was built or measured.

## Parts

- Bridge: GFS Vintage ’59 humbucker, with hot, coil return, shield, and accessible series junction.
- Middle: GFS Pro-Tube lipstick, with hot, return, and shield or case ground.
- Neck: GFS Professional Alnico II humbucker in full series. The GFS harness has one external split lead: insulate it and leave it unconnected. A four-conductor version needs its two series ends joined and the joint insulated.
- Three-way selector. A500k master volume with a DPDT push-push switch. A500k master tone with a 22 nF capacitor. Mono output jack.
- Bridge partial-split resistor: one quarter of the measured isolated full bridge resistance, ¼ W. About 2.2 kΩ is the nominal starting value for an 8.5–8.8 kΩ bridge.
- Treble bleed: 1 nF capacitor and 150 kΩ resistor **in series** from `BUS` to `OUT`. Starting values.

## Operating states

Selected pickups combine in parallel. The neck stays a full humbucker in every state.

| Three-way selector | Lipstick off            | Lipstick on (volume pushed)                   |
| ------------------ | ----------------------- | --------------------------------------------- |
| Bridge             | Full bridge             | Partially split bridge + lipstick             |
| Both               | Full bridge + full neck | Partially split bridge + full neck + lipstick |
| Neck               | Full neck               | Full neck + lipstick                          |

## Push-push contacts

The push-push is a DPDT with two independent poles. The names are a **generic functional map**, not manufacturer lug numbers; identify the actual contacts by continuity in both states.

| Pole             | Common          | Off throw                  | On throw                  |
| ---------------- | --------------- | -------------------------- | ------------------------- |
| A — lipstick     | `A2` = `L-HOT`  | `A1` (no other connection) | `A3` = `BUS`              |
| B — bridge split | `B2` = `B-LINK` | `B1` (no other connection) | `B3` = `R-SPLIT` to `GND` |

Off connects `A2–A1` and `B2–B1`; because `A1` and `B1` have no other connection, the lipstick and the split resistor are both disconnected. On connects `A2–A3` and `B2–B3`. The two poles never connect to each other.

## Netlist

| Net       | Connected terminals                                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `N`       | Neck hot; selector neck input                                                                                                                                                         |
| `B`       | Bridge hot; selector bridge input                                                                                                                                                     |
| `L-HOT`   | Lipstick hot; push-push `A2`                                                                                                                                                          |
| `B-LINK`  | Bridge series junction; push-push `B2`                                                                                                                                                |
| `BUS`     | Selector common `C`; volume CW/input lug; tone CCW lug; push-push `A3`; 1 nF treble-bleed capacitor                                                                                   |
| `TB-MID`  | Free ends of the 1 nF capacitor and 150 kΩ resistor, joined to each other only                                                                                                        |
| `OUT`     | Volume wiper; output jack tip; 150 kΩ treble-bleed resistor                                                                                                                           |
| `R-SPLIT` | Push-push `B3`; one end of the split resistor (other end to `GND`)                                                                                                                    |
| `T-W`     | Tone wiper; 22 nF capacitor (other end to `GND`)                                                                                                                                      |
| `GND`     | Pickup returns and separate shields/cases; volume CCW lug; tone-cap and split-resistor returns; both pot cases; selector chassis; bridge/string ground; cavity shielding; jack sleeve |

Unconnected: push-push `A1` and `B1` (off throws); tone CW lug; neck series junction (insulated, never grounded).

For rear-view pots with shafts away and lugs down, physical left/center/right are CW/wiper/CCW. Volume: `BUS` / `OUT` / `GND`. Tone: unused / 22 nF to `GND` / `BUS`.

## Notes on the transcription

- The diagram and page do not name the treble-bleed midpoint or the tone wiper; `TB-MID` and `T-W` are labels added here for the netlist.
- Some three-way toggles have two common lugs; join them as `C`.
