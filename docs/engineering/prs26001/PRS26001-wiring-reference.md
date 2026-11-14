# PRS26001 wiring reference source

Rev 1.0 · 2026-11-13 · electrical map for the PRS SE Custom 24 Burled Ash.

**Status:** derived, not traced. The owner directed on 2026-11-13 that this circuit be worked out from the installed parts and the eight-sound voice map in [`content/instruments/PRS26001.mdx`](../../../content/instruments/PRS26001.mdx). The guitar was packed for sale and its harness was not opened or measured for this revision.

**Supersedes:** the two planning PDFs the 2026-06-23 record spec named as the as-built source (`PRS_SE_Custom_24_5way_PushPull_Wiring.pdf` and `PRS_SE_Custom_24_5way_PushPull_Lug_by_Lug_Wiring.pdf`, owner's Desktop, not in the repository). Their lug-by-lug sheet does not describe a buildable circuit: it gives a standard blade five numbered signal lugs, ties both pickup hots to one throw, and asks one DPDT to switch two humbuckers between series and parallel through a single joined red/white junction. Their voice map is kept; their lug instructions are not.

This file, [`netlist.mjs`](netlist.mjs), and [`check-netlist.mjs`](check-netlist.mjs) are the circuit source for `PRS26001-wiring-rev-1.0.svg` and `.png`. Run `node docs/engineering/prs26001/check-netlist.mjs` after any change; it simulates all ten states.

## Why the circuit takes this form

- **Selector.** Position 2 needs a bridge split that positions 1 and 3 do not have. On a standard two-pole blade, position 2 is the union of the throws used in positions 1 and 3, so that is impossible. The Oak Grigsby five-way blade is therefore the four-pole super switch.
- **Push-pull.** Changing one humbucker from series to parallel changes two connections, so two humbuckers need four. A DPDT has two poles. The super switch routes the selected pickups' white leads to bus `X` and red leads to bus `Y`; the push-pull changes only those two buses: `X`↔`Y` down, `X`→`GND` and `Y`→`BUS` up. Positions 2 and 4 do not use `X` or `Y`, so the push-pull cannot change them.
- **Inside coils.** Seymour Duncan's slug coil is north (black/white) and its screw coil is south (green/red) ([Seymour Duncan](https://www.seymourduncan.com/blog/latest-updates/guitar-wiring-explored-humbucker-internals)). With both screw coils toward the bridge, the inside coils are the bridge slug and the neck screw. The bridge split shunts its link to `GND`, leaving the slug coil; the neck split shunts its link to `BUS`, leaving the screw coil. That pair is one north and one south coil in the same phase, so position 2 is hum-canceling.
- **Hots.** Both black leads stay on `BUS`. A pickup is off when the super switch leaves its white and red leads open, which breaks the path through both coils.

## Netlist

| Net    | Connected terminals                                                                                                                                                                    |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BUS`  | Bridge and neck black (slug-coil start) leads; DPDT Q up throw; 1.8 kΩ neck split resistor; 500 kΩ volume CW lug; 500 kΩ tone CCW lug                                                  |
| `B_W`  | Bridge white (slug-coil finish); super-switch A common                                                                                                                                 |
| `B_R`  | Bridge red (screw-coil finish); super-switch B common                                                                                                                                  |
| `N_W`  | Neck white (slug-coil finish); super-switch C common                                                                                                                                   |
| `N_R`  | Neck red (screw-coil finish); super-switch D common                                                                                                                                    |
| `X`    | Super-switch A1, A3, C3, C5; DPDT P common                                                                                                                                             |
| `Y`    | Super-switch B1, B3, D3, D5; DPDT P down throw; DPDT Q common                                                                                                                          |
| `B_SP` | Super-switch A2, B2; 1.8 kΩ bridge split resistor to `GND`                                                                                                                             |
| `N_SP` | Super-switch C2, C4, D2, D4; 1.8 kΩ neck split resistor to `BUS`                                                                                                                       |
| `OUT`  | 500 kΩ volume wiper; output-jack tip                                                                                                                                                   |
| `TC_J` | 500 kΩ tone wiper; 0.022 µF film capacitor to `GND`                                                                                                                                    |
| `GND`  | Bridge and neck green and bare leads; DPDT P up throw; 1.8 kΩ bridge split resistor; volume CCW lug; tone capacitor return; pot cases, switch frame, bridge/string ground, jack sleeve |

The tone CW lug and DPDT Q down throw are unused. Super-switch contacts marked open stay unconnected.

### Four-pole five-way super switch

Common closes to only its selected position's throw. Pole names and position numbers are functional, not physical lug positions.

| Pole/common | P1   | P2     | P3  | P4     | P5   |
| ----------- | ---- | ------ | --- | ------ | ---- |
| A / `B_W`   | `X`  | `B_SP` | `X` | open   | open |
| B / `B_R`   | `Y`  | `B_SP` | `Y` | open   | open |
| C / `N_W`   | open | `N_SP` | `X` | `N_SP` | `X`  |
| D / `N_R`   | open | `N_SP` | `Y` | `N_SP` | `Y`  |

### Push-pull DPDT on the master tone

| Pole/common | Down throw | Up throw |
| ----------- | ---------- | -------- |
| P / `X`     | `Y`        | `GND`    |
| Q / `Y`     | open       | `BUS`    |

## Operating states

| Position | Tone pushed down                                         | Tone pulled up                                           |
| -------- | -------------------------------------------------------- | -------------------------------------------------------- |
| 1        | Bridge humbucker, coils in series                        | Bridge humbucker, coils in parallel                      |
| 2        | Bridge slug coil and neck screw coil, each partial split | Bridge slug coil and neck screw coil, each partial split |
| 3        | Both humbuckers, coils in series                         | Both humbuckers, coils in parallel                       |
| 4        | Neck screw coil, partial split                           | Neck screw coil, partial split                           |
| 5        | Neck humbucker, coils in series                          | Neck humbucker, coils in parallel                        |

"Partial split" means the other coil of that pickup is bridged by 1.8 kΩ, not removed, so a little of it remains. In position 3 with the tone down, both pickups' series junctions share bus `X`/`Y`: the two slug coils sit in parallel above the two screw coils in parallel. This is electrically close to two series humbuckers in parallel and is the cost of using one DPDT.

## Open questions

- The guitar's actual harness has not been compared with this map. If it is ever opened, check the selector part number (four-pole), the push-pull pole use, and the split-resistor ends against the tables above.
- The planning PDF lists the pots as 500 kΩ audio taper; the record states only 500 kΩ, so this map does too.

Pot views are rear views (shaft away, lugs down): left is the clockwise end, center the wiper, right the counterclockwise end.
