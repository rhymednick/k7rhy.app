# 2N3904 Fuzz Face kit: bill of materials

Status: **draft**, 2026-09-28; updated 2026-10-03 after the prototype build (see the README's Bench results). Values come from the owner's netlist and the stripboard and footswitch layouts in this folder. Part specifications marked _(assumed)_ are my suggestions, not tested choices.

Board locations use the stripboard hole names (row letter + column) from `fuzz-face-stripboard.png`.

## Board components

| Qty | Ref    | Value        | Type and specification                                                    | Board location         | Notes                                                                 |
| --- | ------ | ------------ | ------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------- |
| 2   | Q1, Q2 | 2N3904       | NPN transistor, TO-92                                                     | Q1: C6–E6, Q2: D13–F13 | Check the pinout of the stocked part.                                 |
| 1   | R1     | 1 MΩ         | Resistor, 1/4 W, metal or carbon film                                     | B1–H1                  | Input pulldown.                                                       |
| 1   | R2     | 22 kΩ        | Resistor, 1/4 W, metal or carbon film                                     | A3–A7                  | Lies along strip A over the A5 cut.                                   |
| 1   | R3     | 10 kΩ        | Resistor, 1/4 W, metal or carbon film                                     | A2–E2                  |                                                                       |
| 1   | R4     | 100 kΩ       | Resistor, 1/4 W **mini** (body ≤ 3.5 mm), metal or carbon film            | D7–F10                 | Mounted diagonally; the 9.2 mm span is too short for a standard body. |
| 1   | R5     | 470 Ω        | Resistor, 1/4 W, metal or carbon film                                     | A14–A18                | Lies along strip A over the A16 cut.                                  |
| 1   | R6     | 2.2 kΩ       | Resistor, 1/4 W, metal or carbon film                                     | A19–F19                |                                                                       |
| 1   | VR1    | 50 kΩ        | Trimmer, single-turn, inline pins at 0.1 in, e.g. 3362P-style _(assumed)_ | D17–F17                | The layout needs A-W-B pins in a straight line.                       |
| 1   | C1     | 470 nF       | Film capacitor, 5 mm pitch, ≥ 50 V _(assumed)_                            | B4–D4                  | Not polarized.                                                        |
| 1   | C2     | 22 µF        | Aluminum electrolytic, radial, ≥ 16 V, 2.5 mm pitch _(assumed)_           | + G12, − H12           | Polarized.                                                            |
| 1   | C3     | 10 nF        | Film capacitor, 5 mm pitch, ≥ 50 V _(assumed)_                            | A20–C20                | Not polarized.                                                        |
| 1   | C4     | 100 nF       | Ceramic (MLCC), 5 mm pitch _(assumed)_                                    | A9–C9                  | Optional supply decoupling. Include in kit.                           |
| 1   | C5     | 47 pF        | Ceramic, 2.5 mm pitch _(assumed)_                                         | D3–E3                  | Optional; leave out unless it squeals. 100 pF muffled the prototype.  |
| 1   | —      | 20 × 8 holes | Stripboard, 0.1 in pitch, cut from a larger board                         | —                      | Strips run along the 20-hole length.                                  |
| 1   | —      | ~10 cm       | Solid bare or insulated wire for the two links _(assumed)_                | D18–E18, C15–H15       | C15–H15 must be insulated.                                            |

## Off-board components

| Qty | Ref    | Value  | Type and specification                                            | Connects to                                      | Notes                                                 |
| --- | ------ | ------ | ----------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------- |
| 1   | FUZZ   | B1k    | 16 mm potentiometer, linear, solder lugs, 6 mm knurled shaft      | Lug 1 H13, lug 2 G14, lug 3 F11                  |                                                       |
| 1   | VOLUME | A500k  | 16 mm potentiometer, audio (log), solder lugs, 6 mm knurled shaft | Lug 1 H19, lug 2 SW lug 3, lug 3 C18             |                                                       |
| 1   | SW1    | 3PDT   | Latching footswitch, 9 solder lugs                                | See footswitch diagram                           | True bypass.                                          |
| 1   | LED    | 5 mm   | LED, color to taste, plus panel bezel _(assumed)_                 | Cathode to SW lug 4                              | Mounted through the case on leads.                    |
| 1   | R7     | 4.7 kΩ | Resistor, 1/4 W                                                   | LED anode to board A12                           | About 1.5 mA LED current at 9 V. Soldered at the LED. |
| 1   | J1     | 1/4 in | Stereo (TRS) jack, enclosed barrel (kit); open-frame also works   | Tip to SW lug 5, ring to battery −, sleeve to C8 | The ring switches the battery.                        |
| 1   | J2     | 1/4 in | Mono jack, enclosed barrel (kit); open-frame also works           | Tip to SW lug 6, sleeve to H18                   |                                                       |
| 1   | —      | 9 V    | Battery snap with leads                                           | + to A10, − to J1 ring                           |                                                       |
| 2   | —      | —      | Push-on knobs for 6 mm knurled shafts                             | FUZZ, VOLUME                                     |                                                       |

## Wire and hardware

| Qty    | Item                                                     | Notes                                                                          |
| ------ | -------------------------------------------------------- | ------------------------------------------------------------------------------ |
| ~1 m   | Stranded hookup wire, 24 AWG, several colors _(assumed)_ | Suggested colors: red +9 V, black ground, green input, blue output and wipers. |
| ~10 cm | Heat-shrink tubing, 2–3 mm                               | For R7 and the LED leads.                                                      |
| 2–4    | Board standoffs or insulating tape _(assumed)_           | Keep the copper side off the foil shield.                                      |

## Kit options

Spec review with the owner, 2026-09-28: R4 is a mini resistor; resistors may be metal or carbon film; pots are 16 mm with 6 mm knurled shafts; the kit ships enclosed barrel jacks, and open-frame jacks also work.

Decided by the owner on 2026-09-28:

- K7RHY sells the kit with the parts. The part specifications are published, so builders can source parts themselves instead.
- There are two kits: one includes a 3D-printed case, and the other has builders download the case files and print it themselves.
- VR1: the stocked trimmer has three pins in a row and fits the stripboard layout as drawn.
- C4 and C5 ship in every kit, because the guide discusses them. C5's value changed from 100 pF to 47 pF on 2026-10-03 after the prototype build (proposed; awaiting owner confirmation).

## Not in the kit (customer supplies)

| Item        | Notes                                                                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 9 V battery | Only power source for this design.                                                                                                                                                                                 |
| Enclosure   | Only in the kit without a case: the builder prints it from the downloadable case files. It holds the footswitch, two pots, two jacks, and the LED bezel.                                                           |
| Foil tape   | For shielding the inside of the case. Ground it with a short wire to row H; jacks with plastic bodies can't ground it through their nuts. Whether the kit's barrel jacks are plastic or metal is not yet recorded. |

## Open questions

- Choose exact part numbers for the kit. Specs still marked _(assumed)_ (capacitor ratings and spacing, trimmer style, LED bezel, wire) were reviewed 2026-09-28 with no changes; confirm them against the chosen parts.
- Case design: holes sized for enclosed barrel jacks, whose threads are short, so check the wall thickness at the jack holes against the stocked jacks. Also check the fit of 16 mm pots and a 3PDT switch.
- Case design and downloadable case files: not made yet. The guide needs the download link once they exist.
- C4 and C5 in every kit is the working plan ("probably"); confirm before launch.
