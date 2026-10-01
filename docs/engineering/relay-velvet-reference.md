# Relay Velvet base harness reference circuit

**Status:** Draft, transcribed 2026-10-01 from the published [Relay Velvet wiring page](../../content/relay/wiring/velvet.mdx). No diagram or other independent source exists, so this file adds no evidence beyond the page. It gives future page edits a netlist to be checked against. Owner confirmation is pending, and the unknowns below must be resolved before it can be called a reference.

This is the Relay Velvet **base harness** only. It is unrelated to the Coupeville Velvet bench prototype in [`coupeville-velvet/`](coupeville-velvet/wiring-diagram.md).

## Parts

- Bridge: GFS Professional Series Alnico II humbucker.
- Middle: GFS Retrotron Nashville.
- Neck: GFS Professional Series Alnico II humbucker.
- Five-way blade selector.
- Volume: 500k audio taper.
- Tone: 500k push-pull pot used as a standard tone control. The push-pull switch lugs are left open, reserved for a future Velvet focus contour.
- Tone capacitor: **value not specified** on the page.
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

Labels follow the page.

| Net      | Connected terminals                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `BP-H`   | Bridge pickup hot; selector bridge input `SW-BP`                                                                                            |
| `MP-H`   | Middle pickup hot; selector middle input `SW-MP`                                                                                            |
| `NP-H`   | Neck pickup hot; selector neck input `SW-NP`                                                                                                |
| `SW-OUT` | Selector common; volume input `VOL-IN`; tone input `TON-IN`                                                                                 |
| `VOL-W`  | Volume wiper; jack tip `J-TIP`                                                                                                              |
| `TON-W`  | Tone wiper; tone capacitor hot leg `CAP-H`                                                                                                  |
| `GND`    | Pickup grounds `BP-G`, `MP-G`, `NP-G`; volume and tone pot backs `VOL-B`, `TON-B`; capacitor return `CAP-G`; jack sleeve `J-SLV`; shielding |

Unused: push-pull lugs `TON-A1`, `TON-A2`, `TON-A3`, `TON-B1`, `TON-B2`, and `TON-B3`.

The tone feed is tapped from the volume input, not the wiper.

## Unknowns

- Tone-capacitor value.
- Tone-pot taper.
- Which volume outer lug is grounded. The page grounds the pot back (`VOL-B`) but does not connect a volume lug to ground, which an ordinary volume control needs. Confirm before treating this netlist as complete.
- Pickup lead colors. The page lists red hot and black ground for all three pickups; the actual lead versions are unverified.
