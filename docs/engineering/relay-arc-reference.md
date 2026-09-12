# Relay Arc reference circuit

**Status:** Owner-approved builder reference, published as Revision 1.0.

**Date:** 2026-09-12
**Source:** [Owner-supplied Arc lug-map reconciliation](extraction/sources/2026-09-12-relay-arc-lug-map.md) and the owner's subsequent pickup-order, tone-pot, and position-4 decisions.

## Parts and behavior

- Bridge: GFS Retrotron Liverpool. Middle: GFS Dream 180. Neck: GFS Vintage '59.
- Four-pole, five-position super switch. Position 1 bridge; 2 bridge and middle in parallel; 3 middle; 4 middle and neck in parallel; 5 neck.
- Arc Mode is the master tone push-pull. Down: all selected pickups full and Liverpool direct. Up: Liverpool through a 680 pF **series** capacitor in positions 1–2; Dream 180 partially split through 3.3 kΩ to ground in positions 2–3; Vintage '59 partially split through the same 3.3 kΩ to ground in positions 4–5. Dream 180 stays full in position 4.
- A500k master volume with a 1 nF capacitor and 150 kΩ resistor **in parallel** from volume input to wiper. A500k master tone, modern input-side feed, 22 nF capacitor. Mono output jack.

| Position | Arc Mode down                          | Arc Mode up                                                        |
| -------- | -------------------------------------- | ------------------------------------------------------------------ |
| 1        | Liverpool full/direct                  | Liverpool full through 680 pF series cap                           |
| 2        | Liverpool full/direct + Dream 180 full | Liverpool full through 680 pF series cap + Dream 180 partial split |
| 3        | Dream 180 full                         | Dream 180 partial split                                            |
| 4        | Dream 180 full + Vintage '59 full      | Dream 180 full + Vintage '59 partial split                         |
| 5        | Vintage '59 full                       | Vintage '59 partial split                                          |

## Functional contact map

This is a **functional map**, not a manufacturer's physical lug numbering. `C` is each super-switch pole's common. A contact closes from `C` to exactly the numbered throw matching the blade position. Confirm the actual switch by continuity before wiring.

| Pole              | Common  | Throw 1 | Throw 2 | Throw 3 | Throw 4 | Throw 5 |
| ----------------- | ------- | ------- | ------- | ------- | ------- | ------- |
| A — audio         | `BUS`   | `L`     | `L`     | `D-H`   | `D-H`   | open    |
| B — audio         | `BUS`   | open    | `D-H`   | open    | `V-H`   | `V-H`   |
| C — Dream split   | `SPLIT` | open    | `D-J`   | `D-J`   | open    | open    |
| D — Vintage split | `SPLIT` | open    | open    | open    | `V-J`   | `V-J`   |

Do not join multiple pickup hots to a single throw: the two audio commons are joined at `BUS`, and each selected throw connects only its named pickup. The split commons are joined at `SPLIT`. No position joins `D-J` to `V-J`.

The tone push-pull DPDT has two independent poles. Its physical terminals must be identified by meter; the names below are functional:

| Pole               | Common  | Down throw   | Up throw                              |
| ------------------ | ------- | ------------ | ------------------------------------- |
| E — Liverpool path | `L`     | `L-H` direct | `L-C` (far side of 680 pF series cap) |
| F — partial split  | `SPLIT` | open         | one end of 3.3 kΩ; other end `GND`    |

The near side of the 680 pF capacitor is `L-H`. The source specified one shared 3.3 kΩ resistor; it sees either Dream or Vintage junction, never both.

## Netlist and physical controls

| Net     | Joined terminals                                                                                                                                                                                       |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `L-H`   | Liverpool hot; push-pull E down throw; near side of 680 pF series capacitor                                                                                                                            |
| `L-C`   | Far side of 680 pF capacitor; push-pull E up throw                                                                                                                                                     |
| `L`     | Push-pull E common; super-switch A throws 1 and 2                                                                                                                                                      |
| `D-H`   | Dream hot; super-switch A throws 3 and 4, B throw 2                                                                                                                                                    |
| `V-H`   | Vintage hot; super-switch B throws 4 and 5                                                                                                                                                             |
| `D-J`   | Dream series junction; super-switch C throws 2 and 3                                                                                                                                                   |
| `V-J`   | Vintage series junction; super-switch D throws 4 and 5                                                                                                                                                 |
| `SPLIT` | Super-switch C and D commons; push-pull F common                                                                                                                                                       |
| `BUS`   | Super-switch A and B commons; volume CW/input lug; tone CCW/feed lug; input sides of 1 nF and 150 kΩ treble-bleed components                                                                           |
| `OUT`   | Volume wiper; jack tip; output sides of 1 nF and 150 kΩ treble-bleed components                                                                                                                        |
| `GND`   | Pickup coil returns and separate shields/cases; 3.3 kΩ resistor return; volume CCW lug; 22 nF tone-cap return; pot cases; selector chassis if conductive; cavity and bridge/string ground; jack sleeve |

For **rear-view** pots with shaft away and lugs down, physical left/center/right are CW/wiper/CCW. Volume: `BUS` / `OUT` / `GND`. Tone: open / 22 nF capacitor to `GND` / `BUS`. Tone feed is the volume **input** (`BUS`), not the wiper. Check clockwise volume raises level and clockwise tone brightens.

Identify hot, return, series junction, and separate shield/case from the lead guide supplied with each actual pickup, then meter them. A single supplied junction lead goes to the named split throws; a four-conductor version needs the specified two series ends joined to form that junction. Do not apply a generic GFS color chart to every variant. Verify pickup phase in the combined positions at the bench.

## Verification boundary

Meter all switch contacts and both push-pull states before soldering. With Arc Mode down, neither series junction may reach ground through 3.3 kΩ, and neither may join the other. With Arc Mode up, exactly the selected junction listed above reaches the resistor; position 4 must leave `D-J` isolated. Confirm the Liverpool capacitor lies in series only when up, the bleed components bridge `BUS` to `OUT` in parallel, and jack sleeve is common ground. Tap-test all ten states. A completed physical harness has not yet been measured against this candidate.
