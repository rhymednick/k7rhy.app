# STR26001 wiring reference source

Rev 1.1 · 2026-09-25 · as-built electrical map for the CuNiFe S-Type with series mode. Rev 1.1 replaces the Rev 1.0 build-and-check wording (2026-09-24) with an as-built record, reorders the treble-bleed description to match `STR26002`, and puts the serial in the diagram title.

This file is the circuit source for `STR26001-wiring-rev-1.1.svg` and `.png`. It records electrical roles; it does not assign manufacturer lead colors or physical switch lug numbers.

## Netlist

| Net    | Connected terminals                                                                                                                                                                                                        |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `B_H`  | Bridge coil hot; super-switch A1, B2, C2                                                                                                                                                                                   |
| `M_H`  | Middle coil hot; super-switch A2, A3, A4                                                                                                                                                                                   |
| `N_H`  | Neck coil hot; super-switch A5, B4, C4                                                                                                                                                                                     |
| `BUS`  | Super-switch A common; DPDT X normal throw; A250K volume CW lug; A500K tone CCW lug; treble-bleed input                                                                                                                    |
| `OR`   | Super-switch B common; DPDT X common                                                                                                                                                                                       |
| `J`    | Super-switch C common; DPDT Y series throw                                                                                                                                                                                 |
| `M_C`  | Middle coil return; super-switch D common; **not permanently grounded**                                                                                                                                                    |
| `MR`   | Super-switch D2 and D4; DPDT Y common                                                                                                                                                                                      |
| `OUT`  | A250K volume wiper; output-jack tip; treble-bleed output                                                                                                                                                                   |
| `TB_J` | 1,200 pF capacitor and 150 kΩ resistor in parallel from `BUS`; 20 kΩ resistor to `OUT`                                                                                                                                     |
| `TC_J` | A500K tone wiper; 22 nF capacitor to `GND`                                                                                                                                                                                 |
| `GND`  | Bridge and neck coil returns, all three isolated pickup shield leads, D3, DPDT Y normal throw, A250K volume CCW lug, tone capacitor return, jack sleeve, pot cases, switch chassis, cavity shielding, bridge/string ground |

The A500K tone CW lug is unused. The DPDT X series throw is unused. Super-switch A/B/C/D contacts not assigned below remain open. Each pickup's isolated shield lead goes to `GND`; the middle shield is not joined to `M_C`.

### Four-pole five-way selector

Common closes to only its selected position's throw. Pole names and position numbers are functional, not physical lug positions.

| Pole/common | P1    | P2    | P3    | P4    | P5    |
| ----------- | ----- | ----- | ----- | ----- | ----- |
| A / `BUS`   | `B_H` | `M_H` | `M_H` | `M_H` | `N_H` |
| B / `OR`    | open  | `B_H` | open  | `N_H` | open  |
| C / `J`     | open  | `B_H` | open  | `N_H` | open  |
| D / `M_C`   | open  | `MR`  | `GND` | `MR`  | open  |

### DPDT on-on mode switch

| Pole/common | Normal / parallel throw | Series throw |
| ----------- | ----------------------- | ------------ |
| X / `OR`    | `BUS`                   | open         |
| Y / `MR`    | `GND`                   | `J`          |

The two DPDT poles are independent. `OR` and `J` are independent; do not bridge them. The series state leaves `OR` open, and the normal state leaves `J` unused.

## Operating states

`∥` denotes parallel; `—` denotes a series pickup pair. Positions are numbered bridge to neck.

| Position | Normal          | Series mode     |
| -------- | --------------- | --------------- |
| 1        | Bridge          | Bridge          |
| 2        | Bridge ∥ Middle | Middle — Bridge |
| 3        | Middle          | Middle          |
| 4        | Middle ∥ Neck   | Middle — Neck   |
| 5        | Neck            | Neck            |

The middle pickup is the upper coil in both series combinations: `BUS → M_H → M_C → B_H/N_H → GND`. This preserves the selected bridge or neck coil's ground return. The master tone is fed from `BUS`, never a series junction. The treble bleed bridges only volume input `BUS` and volume wiper `OUT`.

## As built

Pickup leads follow the Fender CuNiFe pickup-set diagram; wire colors are not drawn. All three pickups have isolated shield leads, which the owner tested; the middle shield stays on `GND` when `M_C` is switched. The owner reports the guitar built and wired to this reference (2026-09-25). Pot views are rear views (shaft away, lugs down): clockwise volume increases output and clockwise tone increases brightness.
