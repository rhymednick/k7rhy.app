# Relay Velvet base harness reference circuit

**Revision:** 1.0

**Date:** 2026-10-01

**Status:** Source for the published [Relay Velvet wiring page](../../content/relay/wiring/velvet.mdx) and its [Rev 1.0 diagram](../../public/wiring-diagrams/relay-velvet-rev-1.0.png), which [`relay-velvet/generate-wiring-diagram.mjs`](relay-velvet/generate-wiring-diagram.mjs) generates. The circuit comes from the earlier published page (the only prior record) plus the owner's 2026-10-01 decisions below. It is not evidence that a harness was built or measured.

This is the Relay Velvet **base harness** only. It is unrelated to the Coupeville Velvet bench prototype in [`coupeville-velvet/`](coupeville-velvet/wiring-diagram.md).

## Parts

- Bridge: GFS Professional Series Alnico II humbucker, full series.
- Middle: GFS Retrotron Nashville.
- Neck: GFS Professional Series Alnico II humbucker, full series.
- Standard five-way blade selector.
- Volume: A500k (audio taper). No treble bleed.
- Tone: A500k (audio-taper) push-pull pot used as a standard tone control. The push-pull switch lugs are left open, reserved for a future Velvet focus contour.
- Tone capacitor: 22 nF (`0.022 µF`, `223`).
- Mono output jack.

## Operating states

| Five-way blade | Selected pickups            |
| -------------- | --------------------------- |
| 1              | Bridge                      |
| 2              | Bridge + middle in parallel |
| 3              | Middle                      |
| 4              | Neck + middle in parallel   |
| 5              | Neck                        |

## Netlist

| Net   | Connected terminals                                                                                                                                                     |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `B-H` | Bridge pickup hot; five-way throw 1                                                                                                                                     |
| `M-H` | Middle pickup hot; five-way throw 2                                                                                                                                     |
| `N-H` | Neck pickup hot; five-way throw 3                                                                                                                                       |
| `BUS` | Five-way common; volume CW/input lug; tone CCW lug                                                                                                                      |
| `OUT` | Volume wiper; output jack tip                                                                                                                                           |
| `T-W` | Tone wiper; 22 nF capacitor (other end to `GND`)                                                                                                                        |
| `GND` | Pickup returns and separate shields/cases; volume CCW lug; tone-cap return; pot cases; conductive selector chassis; cavity shielding; bridge/string ground; jack sleeve |

A standard five-way bridges adjacent throws in positions 2 and 4; its second pole is unused.

Unconnected: tone CW lug; push-pull lugs `A1`, `A2`, `A3`, `B1`, `B2`, and `B3`; unused humbucker series-junction leads (insulated; a pickup that supplies two separate series ends has them joined, then insulated).

For rear-view pots with shafts away and lugs down, physical left/center/right are CW/wiper/CCW. Volume: `BUS` / `OUT` / `GND`. Tone: unused / 22 nF to `GND` / `BUS`. The tone feed is the volume input, not the wiper. Clockwise volume increases level; clockwise tone brightens.

## Expected bench readings

From the earlier published page: with volume full up, jack tip to sleeve reads roughly 8.6 kΩ in position 1, 8.0 kΩ in position 3, and 7.6 kΩ in position 5; positions 2 and 4 read lower because the pickups are in parallel. These are rough guides that depend on the actual pickups and pot, not pass/fail limits.

## Unknowns

- Pickup lead colors and versions. Identify them from each pickup's supplied guide and a meter.

## Decisions

- 2026-10-01, owner: 22 nF tone capacitor and audio-taper tone pot, the same as the other Relay models.
- 2026-10-01, owner: the volume CCW lug is grounded, a fixed convention on every K7RHY guitar.
- 2026-10-01, owner: draw a Rev 1.0 diagram and bring the page in line with the Torch, Arc, and Lipstick pages. The page's labels changed from component IDs (`BP-H`, `SW-OUT`, `VOL-IN`, and so on) to net labels (`B-H`, `BUS`, `OUT`, and so on).
