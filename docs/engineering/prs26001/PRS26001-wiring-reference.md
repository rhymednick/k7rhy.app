# PRS26001 wiring reference source

Rev 2.0 · 2026-11-13 · electrical map for the PRS SE Custom 24 Burled Ash.

**Status:** validated by in-circuit measurement. On 2026-11-13 the owner opened the control cavity, photographed it, and measured DC resistance at the output jack in every position with the tone pushed down and pulled up. The switching below reproduces all five readings within 5%. Which coil each partial split keeps was not traced.

**Supersedes:** Rev 1.0 (same day), which was derived from the planning PDFs' voice map: inside coils in position 2, both full humbuckers in position 3, and a push-pull that switched the humbuckers to parallel. The measurements contradict all three. The two planning PDFs (`PRS_SE_Custom_24_5way_PushPull_Wiring.pdf` and `..._Lug_by_Lug_Wiring.pdf`, owner's Desktop) are superseded as wiring sources.

This file, [`netlist.mjs`](netlist.mjs), and [`check-netlist.mjs`](check-netlist.mjs) are the circuit source for `PRS26001-wiring-rev-2.0.svg` and `.png`. Run `node docs/engineering/prs26001/check-netlist.mjs` after any change; it checks every position's coil roles and DC resistance against the readings, and that the push-pull touches only the tone capacitor.

## Evidence

| Source                          | Finding                                                                                                                                                                                                                                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cavity photos (IMG_2891–2894)   | Two-wafer five-way blade with lugs on both sides (four-pole super switch). Push-pull DPDT carries only the tone capacitor and a jumper; no pickup wiring reaches it. A small orange capacitor across the volume lugs, marked about "181" (180 pF), with no resistor. Copper-foil cavity shielding. |
| Owner's ear                     | Pulling the tone knob removes the tone capacitor.                                                                                                                                                                                                                                                  |
| Jack resistance, volume full up | 1: 7.0 kΩ · 2: 4.8 kΩ · 3: 2.52 kΩ · 4: 5.3 kΩ · 5: 7.95 kΩ. Identical with the tone up or down, so the push-pull changes no pickup connection.                                                                                                                                                    |

Position 3 equals positions 2 and 4 in parallel (4.8 ∥ 5.3 = 2.52 kΩ), so it is both partial splits together, not both full humbuckers (7.0 ∥ 7.95 ≈ 3.7 kΩ). Positions 2 and 4 each equal one full coil plus the other coil bridged by about 1.8 kΩ.

## Netlist

| Net    | Connected terminals                                                                                                                                                                     |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `B_H`  | Bridge black lead; super-switch A1, A2, A3                                                                                                                                              |
| `N_H`  | Neck black lead; super-switch B3, B4, B5                                                                                                                                                |
| `B_L`  | Bridge white and red leads joined (series link); super-switch C common                                                                                                                  |
| `N_L`  | Neck white and red leads joined (series link); super-switch D common                                                                                                                    |
| `B_SP` | Super-switch C2, C3; 1.8 kΩ bridge split resistor to `GND`                                                                                                                              |
| `N_SP` | Super-switch D3, D4; 1.8 kΩ neck split resistor to `GND`                                                                                                                                |
| `BUS`  | Super-switch A and B commons; 500 kΩ volume CW lug; 180 pF treble-bleed capacitor; 500 kΩ tone CCW lug                                                                                  |
| `OUT`  | Volume wiper; treble-bleed capacitor; output-jack tip                                                                                                                                   |
| `TC_J` | Tone wiper; 0.022 µF film capacitor                                                                                                                                                     |
| `TC_R` | Tone capacitor return; push-pull P common                                                                                                                                               |
| `GND`  | Bridge and neck green and bare leads; both 1.8 kΩ split resistors; push-pull P down throw; volume CCW lug; pot cases, switch frame, cavity shielding, bridge/string ground, jack sleeve |

The tone CW lug, push-pull P up throw, and push-pull pole Q are unused. Super-switch contacts marked open stay unconnected.

### Four-pole five-way super switch

Common closes to only its selected position's throw. Pole names and position numbers are functional, not physical lug positions.

| Pole/common | P1    | P2     | P3     | P4     | P5    |
| ----------- | ----- | ------ | ------ | ------ | ----- |
| A / `BUS`   | `B_H` | `B_H`  | `B_H`  | open   | open  |
| B / `BUS`   | open  | open   | `N_H`  | `N_H`  | `N_H` |
| C / `B_L`   | open  | `B_SP` | `B_SP` | open   | open  |
| D / `N_L`   | open  | open   | `N_SP` | `N_SP` | open  |

### Push-pull DPDT on the master tone

| Pole/common | Down throw | Up throw |
| ----------- | ---------- | -------- |
| P / `TC_R`  | `GND`      | open     |
| Q           | unused     | unused   |

## Operating states

| Position | Tone pushed down                        | Tone pulled up                                         |
| -------- | --------------------------------------- | ------------------------------------------------------ |
| 1        | Bridge humbucker                        | Bridge humbucker, tone bypassed                        |
| 2        | Bridge partial split                    | Bridge partial split, tone bypassed                    |
| 3        | Bridge and neck partial splits together | Bridge and neck partial splits together, tone bypassed |
| 4        | Neck partial split                      | Neck partial split, tone bypassed                      |
| 5        | Neck humbucker                          | Neck humbucker, tone bypassed                          |

### Measured resistance

Tip to sleeve at the output jack, volume full up; identical with the tone pushed down or pulled up.

| Position | DC resistance at jack |
| -------- | --------------------- |
| 1        | 7.0 kΩ                |
| 2        | 4.8 kΩ                |
| 3        | 2.52 kΩ               |
| 4        | 5.3 kΩ                |
| 5        | 7.95 kΩ               |

"Partial split" means one coil of that pickup is bridged by 1.8 kΩ, not removed, so a little of it remains. With the tone pulled up, the tone capacitor is disconnected: the tone knob has no effect and the guitar is at full brightness. Pushing it down restores the tone control at whatever setting the knob was left, so the knob works as a preset.

## Open questions

- **Which coil each split keeps.** The map assumes the conventional split (series link to ground through the resistor), which keeps each pickup's slug coil. Resistance cannot distinguish slug from screw. If both splits keep the slug coil, position 3 is two same-polarity coils and is not fully hum-canceling. Tapping each coil's pole pieces in positions 2–4 would settle it.
- **Bridge vs neck readings.** Retailers list the APH-1b at about 7.85 kΩ and the APH-1n at about 7.5–7.6 kΩ. Position 5 reads 7.95 kΩ and position 1 reads 7.0 kΩ. Individual pickups vary, but tapping the pickups in positions 1 and 5 would confirm the selector order.
- **Treble-bleed value.** The marking reads about "181" (180 pF); the middle digit is unclear, so the value is 100–190 pF.

Pot views are rear views (shaft away, lugs down): left is the clockwise end, center the wiper, right the counterclockwise end.
