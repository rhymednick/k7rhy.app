# 2N3904 Fuzz Face (prototype)

Status: **proposed** — netlist verified on paper 2026-09-28; not yet built or bench-tested. Unpublished; no site route or kit listing.

Owner-supplied netlist: NPN, negative ground, 9 V build from on-hand parts, intended as a possible future kit.

![Schematic](fuzz-face-2n3904.png)

## Parts

| Ref       | Value                    | Notes                                                                                    |
| --------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| Q1, Q2    | 2N3904                   | TO-92, E-B-C with flat face toward you, leads down. Verify against the part's datasheet. |
| RPD       | 1 MΩ                     | Input pulldown (optional)                                                                |
| C1        | 470 nF film              | Tighter than the classic ~2.2 µF                                                         |
| R1A + R1B | 22 kΩ + 10 kΩ            | 32 kΩ total (classic: 33 kΩ)                                                             |
| R4        | 100 kΩ                   | Feedback, Q2 emitter to Q1 base                                                          |
| FUZZ      | B1k                      | Lug 3 to Q2_EMIT, lug 1 to GND, wiper to C2 +                                            |
| C2        | 22 µF electrolytic       | + to fuzz wiper, − to GND                                                                |
| R2        | 470 Ω                    | VCC to OUT_TAP                                                                           |
| R3        | 2.2 kΩ                   | OUT_TAP to BIAS_TOP                                                                      |
| VR1       | 50 kΩ trimmer            | Rheostat; wiper tied to Q2_COL lug                                                       |
| C3        | 10 nF film               | OUT_TAP to VOL_IN                                                                        |
| VOLUME    | A500k                    | Lug 3 to VOL_IN, lug 1 to GND, wiper to output                                           |
| C4        | 100 nF film              | Optional supply decoupling                                                               |
| C5        | 100 pF ceramic           | Optional; Q1 collector to Q1 base. Fit only if the build oscillates or picks up radio.   |
| SW1       | 3PDT latching footswitch | True bypass; pole 1 switches the LED                                                     |
| LED       | 5 mm LED + bezel         | On leads through the case; lit when the effect is on                                     |
| R5        | 4.7 kΩ                   | LED current limit, about 1.5 mA from 9 V (off-board, at the LED)                         |
| J1        | Stereo (TRS) 1/4 in jack | Input; ring switches battery − so unplugging saves the battery                           |
| J2        | Mono 1/4 in jack         | Output                                                                                   |
| BAT       | 9 V battery + clip       | Only power source; + to board A10, − to J1 ring                                          |

## Verification notes (paper check, not measured)

- Topology matches the classic Fuzz Face, polarities flipped correctly for NPN and negative ground.
- The full 1 kΩ fuzz pot stays in the DC emitter path, so the fuzz setting does not shift the bias.
- Estimated DC point: Q1 base ≈ 0.65 V, Q2 emitter ≈ 0.7 V, Q2 current ≈ 0.7 mA. That puts Q2_COL at 4.5 V with about 6.5–7 kΩ total collector resistance, so VR1 should land near 4 kΩ.
- Bias: with no signal, measure Q2_COL (not OUT_TAP) to GND and set about 4.5 V.

## Open items for a kit

- Board: stripboard, chosen 2026-09-28 over a custom PCB, a 3D-printed component matrix (melt risk), and free-wired assembly (vibration and short risk against foil shielding).
- The stripboard layout assumes an inline-pin trimmer for VR1. Confirm the stocked part's footprint.

- Add reverse-polarity protection, such as a series 1N5817, if the kit uses a DC jack.
- C5 (100 pF, Q1 collector to Q1 base) is drawn as optional. Record whether the prototype needs it.
- Record bench results (measured voltages, VR1 setting, sound notes) here after the build.

## Files

- `bom.md`: kit bill of materials (draft)
- `build-guide.mdx`: kit assembly guide (draft), in the same MDX format as `content/docs/dl20w_sma.mdx`

- `fuzz-face-2n3904.svg` / `.png`: schematic
- `generate_schematic.py`: schematic source (schemdraw)
- `fuzz-face-breadboard.svg` / `.png`: half-size breadboard layout
- `generate_breadboard.py`: breadboard source; checks the layout's strip connectivity against the schematic netlist before drawing
- `fuzz-face-stripboard.svg` / `.png`: 20 × 8 stripboard layout (component side and copper side with track cuts); the chosen board for the kit
- `fuzz-face-footswitch.svg` / `.png`: 3PDT true-bypass footswitch, jacks, LED, and battery wiring
- `generate_footswitch.py`: footswitch source; checks both switch positions and the battery switching against the stripboard netlist before drawing
- `generate_stripboard.py`: stripboard source; checks strips, cuts, links, and transistor orientation against the netlist before drawing
