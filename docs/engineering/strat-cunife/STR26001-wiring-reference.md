# STR26001 wiring reference source

Rev 2.0 · 2026-10-10 · selected electrical map for the Tomatillo S-Type with series mode. Rev 2.0 replaces the CuNiFe-specific pickup and isolated-shield details in Rev 1.1. The control topology and ten operating states are retained; physical lead identification and post-installation behavior have not yet been supplied by the owner.

This file is the circuit source for `STR26001-wiring-rev-2.0.svg` and `.png`. It records electrical roles; it does not assign manufacturer lead colors or physical switch lug numbers. Fender's [Custom Shop Tomatillo Stratocaster set specification](https://www.fender.com/products/custom-shop-tomatillo-stratocaster-pickup-set) confirms three Alnico 2 pickups with cloth-covered leads and a reverse-wound middle pickup. It does not establish the actual installed pickup lead identities.

## Netlist

| Net    | Connected terminals                                                                                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `B_H`  | Bridge coil hot; super-switch A1, B2, C2                                                                                                                                                   |
| `M_H`  | Middle coil hot; super-switch A2, A3, A4                                                                                                                                                   |
| `N_H`  | Neck coil hot; super-switch A5, B4, C4                                                                                                                                                     |
| `BUS`  | Super-switch A common; DPDT X normal throw; A250K volume CW lug; A500K tone CCW lug; treble-bleed input                                                                                    |
| `OR`   | Super-switch B common; DPDT X common                                                                                                                                                       |
| `J`    | Super-switch C common; DPDT Y series throw                                                                                                                                                 |
| `M_C`  | Middle coil return; super-switch D common; **not permanently grounded**                                                                                                                    |
| `MR`   | Super-switch D2 and D4; DPDT Y common                                                                                                                                                      |
| `OUT`  | A250K volume wiper; output-jack tip; treble-bleed output                                                                                                                                   |
| `TB_J` | 1,200 pF capacitor and 150 kΩ resistor in parallel from `BUS`; 20 kΩ resistor to `OUT`                                                                                                     |
| `TC_J` | A500K tone wiper; 22 nF capacitor to `GND`                                                                                                                                                 |
| `GND`  | Bridge and neck coil returns, D3, DPDT Y normal throw, A250K volume CCW lug, tone capacitor return, jack sleeve, pot cases, switch chassis, cavity shielding, Fender tremolo/string ground |

The A500K tone CW lug is unused. The DPDT X series throw is unused. Super-switch A/B/C/D contacts not assigned below remain open. This map does not assume any separate pickup shield lead. If the actual pickups have a separate shield, ground it without connecting the middle coil return `M_C` to ground.

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

## Hardware and status

The owner reports a cream pickguard and Fender tremolo bridge on STR26001. The complete Tomatillo set is the selected replacement for a broken CuNiFe middle pickup, but its installation and physical lead mapping have not been reported. Identify each coil hot and return on the supplied pickups; ensure `M_C` has no permanent ground path and check phase in both paired positions. Pot views are rear views (shaft away, lugs down): clockwise volume increases output and clockwise tone increases brightness.
