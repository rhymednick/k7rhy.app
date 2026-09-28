# 2N3904 Fuzz Face (prototype)

Status: **proposed** — netlist verified on paper 2026-09-28; not yet built or bench-tested. Unpublished; no site route or kit listing.

Owner-supplied netlist: NPN, negative ground, 9 V build from on-hand parts, intended as a possible future kit.

![Schematic](fuzz-face-2n3904.png)

## Parts

| Ref       | Value              | Notes                                                                                    |
| --------- | ------------------ | ---------------------------------------------------------------------------------------- |
| Q1, Q2    | 2N3904             | TO-92, E-B-C with flat face toward you, leads down. Verify against the part's datasheet. |
| RPD       | 1 MΩ               | Input pulldown (optional)                                                                |
| C1        | 470 nF film        | Tighter than the classic ~2.2 µF                                                         |
| R1A + R1B | 22 kΩ + 10 kΩ      | 32 kΩ total (classic: 33 kΩ)                                                             |
| R4        | 100 kΩ             | Feedback, Q2 emitter to Q1 base                                                          |
| FUZZ      | B1k                | Lug 3 to Q2_EMIT, lug 1 to GND, wiper to C2 +                                            |
| C2        | 22 µF electrolytic | + to fuzz wiper, − to GND                                                                |
| R2        | 470 Ω              | VCC to OUT_TAP                                                                           |
| R3        | 2.2 kΩ             | OUT_TAP to BIAS_TOP                                                                      |
| VR1       | 50 kΩ trimmer      | Rheostat; wiper tied to Q2_COL lug                                                       |
| C3        | 10 nF film         | OUT_TAP to VOL_IN                                                                        |
| VOLUME    | A500k              | Lug 3 to VOL_IN, lug 1 to GND, wiper to output                                           |
| C4        | 100 nF film        | Optional supply decoupling                                                               |
| C5        | 100 pF ceramic     | Optional; Q1 collector to Q1 base. Fit only if the build oscillates or picks up radio.   |

## Verification notes (paper check, not measured)

- Topology matches the classic Fuzz Face, polarities flipped correctly for NPN and negative ground.
- The full 1 kΩ fuzz pot stays in the DC emitter path, so the fuzz setting does not shift the bias.
- Estimated DC point: Q1 base ≈ 0.65 V, Q2 emitter ≈ 0.7 V, Q2 current ≈ 0.7 mA. That puts Q2_COL at 4.5 V with about 6.5–7 kΩ total collector resistance, so VR1 should land near 4 kΩ.
- Bias: with no signal, measure Q2_COL (not OUT_TAP) to GND and set about 4.5 V.

## Open items for a kit

- Add reverse-polarity protection, such as a series 1N5817, if the kit uses a DC jack.
- C5 (100 pF, Q1 collector to Q1 base) is drawn as optional. Record whether the prototype needs it.
- Record bench results (measured voltages, VR1 setting, sound notes) here after the build.

## Files

- `fuzz-face-2n3904.svg` / `.png`: schematic
- `generate_schematic.py`: schematic source (schemdraw)
