# 20W Dummy Load — Stripboard Reference (DIY alternative)

**Status:** designed and modeled. **Not built, not measured, not published.** Rev 0.1, 2026-10-25. Unpublished engineering record: no site route, no public asset.

**Decisions behind this record (owner, 2026-10-25):**

1. K7RHY will offer a free build-it-yourself alternative for each kit, with a stripboard layout so the builder does not need K7RHY PCBs. Recorded in [`docs/decisions/2026-10-25-diy-alternative-builds.md`](../../decisions/2026-10-25-diy-alternative-builds.md).
2. The owner delegated the diode choice to the engineer: **BAT46** (§5).
3. The owner delegated the power limits to the engineer: **10 W continuous, 20 W bursts** with 3 W resistors (§7). These are recommendations pending a thermal test, not ratings.

The builder sheet is [`stripboard-sheet.png`](stripboard-sheet.png) ([SVG](stripboard-sheet.svg)). It is generated from `layout.mjs`; do not edit it by hand.

## Status of the claims

| Claim                                                                           | Status                                                                                 |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| The layout implements the intended circuit (nets, DC resistances, hole spacing) | **Checked** by `check-layout.mjs` (141 checks) and `verify-drawing.mjs` on the drawing |
| The checks can fail                                                             | **Checked** by `check-mutations.mjs` (11 deliberate breaks, all caught)                |
| The kit's circuit is the divider-plus-peak-detector described in §3             | **Inferred** from photos and the Measuring Power page; no schematic seen               |
| BAT46 is adequate for the detector                                              | **Reasoned** from datasheet ratings (§5); not tested                                   |
| Predicted SWR (§8)                                                              | **Modeled only.** No board built or measured                                           |
| Power limits (§7)                                                               | **Recommended**, not tested                                                            |
| Resistor wattage, body length, and diode of the kit                             | **Unknown** (§2)                                                                       |

## 1. Purpose

K7RHY sells a 20 W dummy load kit on a custom PCB. The owner wants a parts-from-anywhere alternative that works on 0.1 inch stripboard, accepting a narrower operating range than the PCB's ground plane allows. The goal is the best stripboard design that has a real chance of working, with the limits stated honestly.

Non-goals: matching the kit's published SWR table, a design for 2 m or 70 cm, an SMA version, and any change to the kit, the site, or Shopify.

## 2. What is known about the kit

| Fact                                                                                                                          | Source                                                                                            | Status                                                       |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Kit parts: 8 × 100 Ω resistors (R1–R8), one Schottky diode (D1), one ceramic capacitor (C1), one BNC (J1), two test pads      | Assembly guide inventory, [`app/docs/dl20w_bnc/page.tsx`](../../../app/docs/dl20w_bnc/page.tsx)   | Source fact                                                  |
| Resistance across the BNC should read 47.5–52.5 Ω; 49.3 Ω was measured on one unit                                            | Same guide; [`app/docs/power_measurement/page.tsx`](../../../app/docs/power_measurement/page.tsx) | Source fact                                                  |
| The test pad connects to the centre of the resistor network, where the impedance is half the connector's; P = (V + 0.3)² / 25 | Measuring Power page                                                                              | Source fact                                                  |
| C1 is marked "103" (10 nF); the resistors read brown-black-brown-gold (100 Ω ±5 %)                                            | My reading of `public/images/dl20w_bnc/KitComponents.jpg`                                         | Photo reading                                                |
| 20 W continuous, 100 W peak (momentary); SWR < 1.1 on HF, < 1.5 on 6 m, < 2.5 on 2 m, < 1.3 on 70 cm                          | [`components/product/ham-radio-kit-page.tsx`](../../../components/product/ham-radio-kit-page.tsx) | Owner's published claims, not rechecked                      |
| Per-band impedance table, 1.8–435 MHz                                                                                         | Measuring Power page                                                                              | Not used: it does not say whether the figures are \|Z\| or R |
| Diode part number                                                                                                             | Not recorded. The photo shows a blue glass DO-35 with an illegible marking                        | **Unknown**                                                  |
| Resistor wattage and body length                                                                                              | Not recorded. Two photo-scale estimates disagree (about 13 mm and about 15 mm)                    | **Unknown**                                                  |
| PCB bottom layer, schematic, Gerbers                                                                                          | Not in the repository                                                                             | **Unknown**                                                  |

**Inferred topology.** Three independent facts fit only one circuit: eight identical 100 Ω parts read about 50 Ω; the test pad sits at a tap with half the connector's impedance; and the power formula divides by 25 Ω with a factor that equals a half-voltage peak detector. That is two banks of four 100 Ω resistors in parallel (25 Ω each) in series, a diode from the midpoint into a capacitor, and the test pads across the capacitor. Whether the kit ties the four midpoints together or runs four independent pairs is electrically identical. This is my inference. Confirm it against the PCB schematic before publishing.

## 3. Circuit

| Net | Members                                       | Role                                            |
| --- | --------------------------------------------- | ----------------------------------------------- |
| IN  | J1 centre, C2, R1 R3 R5 R7 (top ends)         | RF input                                        |
| M   | R1–R8 (bottom ends), D1 anode                 | midpoint of the divider, half the input voltage |
| GND | J1 shell, C2, R2 R4 R6 R8 (top ends), C1, TP2 | ground                                          |
| DET | D1 cathode, C1, TP1                           | detector output, read by the multimeter         |

DC resistances (checked): IN to GND 50 Ω, IN to M 25 Ω, M to GND 25 Ω, TP1 to TP2 open.

**Detector.** With input power P into 50 Ω, the peak input voltage is √(2·P·50). M carries half of it. D1 and C1 hold the peak minus the diode drop: V = Vm − Vf. Then P = (2(V + Vf))² / 100 = (V + Vf)² / 25, which is the formula on the Measuring Power page. It holds for any diode if Vf is right. **Vf is the one constant that is not portable:** the page uses 0.3 V for the kit's diode. A rough estimate for a peak detector driving a 10 MΩ meter (conduction angle from tan θ − θ = π·Rs/RL) puts the steady-state diode pulse near 0.4 mA, where a Schottky drops about 0.3 V, so 0.3 V is plausible for BAT46 or 1N5711. That is an estimate, not a measurement; calibrate each build (§9).

**C2** (3.3 pF, C0G) sits across the input at the BNC. The layout's series inductance (about 15 nH bare) makes the load look slightly inductive as frequency rises. A small shunt capacitor cancels that. Modeled effect: §8.4. It is optional and cheap.

## 4. Layout

Grid: 32 columns × 11 strips, 2.54 mm pitch, component side up, strips running along the columns beneath. One strip cut. See the sheet for the drawing.

| Strip | Net                                 | Notes                                                 |
| ----- | ----------------------------------- | ----------------------------------------------------- |
| 1     | IN                                  | RF strip                                              |
| 2     | GND                                 | beside strip 1 on purpose                             |
| 3–8   | none                                | bare; the resistor bodies lie over them               |
| 9, 10 | M                                   | two strips tied together by bare straps W1–W4         |
| 10    | M for holes 1–26; **DET** for 27–32 | cut between holes 26 and 27                           |
| 11    | GND                                 | detector return, tied to strip 2 by insulated wire W5 |

| Part           | Holes (column, strip)                                   |
| -------------- | ------------------------------------------------------- |
| R1, R3, R5, R7 | columns 2, 8, 14, 20, strip 1 to strip 9                |
| R2, R4, R6, R8 | columns 5, 11, 17, 23, strip 2 to strip 10              |
| W1–W4          | columns 4, 10, 16, 22, strip 9 to strip 10              |
| J1             | centre pin (12, 1), shell (12, 2)                       |
| C2             | (13, 1) and (13, 2)                                     |
| D1             | anode (25, 10), cathode (29, 10); band toward column 29 |
| C1             | (30, 10) and (30, 11)                                   |
| W5             | (32, 2) to (32, 11), insulated, about 30 mm             |
| TP1, TP2       | (31, 10) and (31, 11)                                   |

**Why this arrangement** (all from the model, §8; bare divider at 30 MHz):

| Arrangement                                           | Series inductance | SWR 10 m | SWR 6 m |
| ----------------------------------------------------- | ----------------- | -------- | ------- |
| **This design:** neighbours alternate A G A G A G A G | **15.1 nH**       | 1.06     | 1.10    |
| Mirrored alternation A G A G G A G A                  | 15.4 nH           | 1.06     | 1.11    |
| Banks grouped A A A A G G G G                         | 40.6 nH           | 1.16     | 1.30    |
| In-line stack, long ground return                     | 65.9 nH           | 1.27     | 1.53    |

- **Alternating neighbours** carry opposite currents, so their magnetic fields cancel. That is worth a factor of 2.7 over grouping the two banks.
- **Strips 1 and 2 adjacent** make the feed a close pair of opposite currents too.
- **The mirror order was tried and rejected:** the same inductance and no better power balance (§8.5). It is also harder to explain.
- **No ground plane.** The whole RF path is a few centimetres, under one ninetieth of a wavelength at 52 MHz, so a lumped model is a fair approximation there and treats the board as inductances and capacitances, not as a transmission line. In that model the missing plane is not what limits the board; the two BNC wires and the resistors' own inductance are. A ground plane matters more as frequency rises, which is why nothing above about 100 MHz is claimed.
- **The BNC wires are the most sensitive dimension** (§8.3): 6 mm → 25 mm moves 10 m from SWR 1.00 to 1.06 and 6 m from 1.01 to 1.12.

**Lead span.** The sheet draws every resistor spanning 8 holes (20.3 mm) with a 12.5 mm body, which suits bodies up to about 17 mm. The kit's real body length is unknown (§2). The model shows spans of 7 and 9 holes change nothing (§8.3). The strip numbers in the sheet and the checker are written for span 8; another span needs `generate-sheet.mjs` updated.

## 5. Parts

| Qty | Part                                 | Specification and reason                                                                                           |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| 1   | Stripboard, 0.1 in pitch             | At least 11 strips × 32 holes; **FR-4** rather than paper-phenolic, which chars sooner. Strips along the long side |
| 8   | R1–R8, 100 Ω axial, 5 % or better    | Flameproof metal-oxide, **3 W recommended** (§7). Each carries one eighth of the power                             |
| 1   | D1, **BAT46**                        | Small-signal Schottky, 100 V, DO-35 (§5.1)                                                                         |
| 1   | C1, 10 nF ceramic                    | 50 V or more; the "103" part in the kit. Holds about 22 V at 20 W, so a 25 V part is too tight                     |
| 1   | C2, 3.3 pF C0G/NP0 ceramic           | 50 V or more; optional, recommended                                                                                |
| 1   | J1, BNC jack                         | Panel or PCB type with a solder lug and centre pin. Choose one whose terminals allow wires of 10 mm or less        |
| 5   | W1–W4 bare straps; W5 insulated wire | 0.6–1 mm; W5 about 30 mm                                                                                           |
| 2   | TP1, TP2                             | Test pins or flying leads                                                                                          |

### 5.1 Diode choice

**Requirements, from the circuit.** At 20 W the diode's peak inverse voltage is √(100·P) − Vf = **44.4 V** (checked in `limits.mjs`). It needs a rating well above that, low capacitance (it hangs on the midpoint), a DO-35 body that fits a 4-hole span, and the pulse current of the first RF cycles when C1 charges.

| Part         | Reverse voltage | Margin at 20 W | Capacitance               | Forward current / surge              | Verdict                                                                    |
| ------------ | --------------- | -------------- | ------------------------- | ------------------------------------ | -------------------------------------------------------------------------- |
| **BAT46**    | 100 V           | 2.3×           | 10 pF at 0 V, 6 pF at 1 V | 150 mA / 750 mA for 10 ms (see note) | **Chosen.** Most voltage margin and the sturdiest against switch-on pulses |
| 1N5711       | 70 V            | 1.6×           | about 2 pF                | 15 mA / no surge rating found        | Acceptable alternate; lower capacitance, thinner margins                   |
| BAT43, BAT85 | 30 V            | 0.7×           | —                         | —                                    | **Not suitable.** Fails above about 9 W                                    |

Capacitance does not matter below about 60 MHz; the model shows only a mild effect (§8.3). Switch-on: C1 charges through about 12.5 Ω plus the diode's own resistance, so the first few RF cycles pass currents of the order of an ampere for nanoseconds (my estimate). BAT46's 10 ms surge rating is far larger than the energy involved. Confirm by keying the build a few hundred times and checking the detector reading does not drift (§9).

Sources: Vishay BAT46 datasheet, [document 85662](https://www.vishay.com/docs/85662/bat46.pdf) (100 V, 150 mA, DO-35, 450 mV at 10 mA, 10 pF at 0 V and 6 pF at 1 V, 1 MHz); the 750 mA / 10 ms surge figure and 250 mV at 0.1 mA come from a secondary listing ([Electronics Notes](https://www.electronics-notes.com/articles/component-data/diodes-schottky/BAT46.php)). 1N5711: [STMicroelectronics listing](https://www.radiolocman.com/datasheet/data.html?di=101915) (70 V, 15 mA, about 2 pF). **I could not open the manufacturer PDFs during writing; check the exact part you buy against its datasheet.**

## 6. Build and bench checks

The sheet is authoritative. Summary of the bench numbers it states: IN to GND 47.5–52.5 Ω with 5 % resistors (49.5–50.5 Ω with 1 %); IN to M and M to GND each 23.8–26.3 Ω; strips 9 and 10 under 1 Ω apart; no continuity across the cut before D1 is fitted; TP1 to TP2 open; a diode test with the meter's red lead on strip 9 and black on TP1 reads about 0.15–0.45 V. **Meter the divider before fitting the detector.**

## 7. Power limits (recommended)

### 7.1 The rule

Each resistor takes one eighth of the input power (checked: within ±1.6 % to 52 MHz, §8.5). Limits follow the resistors' nameplate watts:

| Rule              | Value                                                          |
| ----------------- | -------------------------------------------------------------- |
| Continuous        | each resistor at no more than **42 %** of its nameplate        |
| Bursts            | no more than **84 %**, for up to **30 s**, then rest **2 min** |
| Hard cap          | **20 W**, whatever the resistors                               |
| Minimum nameplate | 2 W; 1 W parts are not suitable                                |

| Resistors fitted | Continuous | Bursts                        |
| ---------------- | ---------- | ----------------------------- |
| 8 × 3 W          | **10 W**   | **20 W**, 30 s on, 2 min rest |
| 8 × 2 W          | **6 W**    | **13 W**, 30 s on, 2 min rest |

These come from `limits.mjs`, rounded down, and are checked there. FT8 and other full-duty digital modes count as continuous.

### 7.2 Why these numbers

The fractions are my engineering judgment, not a datasheet rule. Flameproof metal-oxide resistors run very hot at nameplate in free air at 70 °C; flush on a board and enclosed they run hotter. Staying near 40 % keeps the surface well below FR-4's glass transition and the solder joints comfortable; the burst figure allows tune-up and short transmissions. The hard cap is the detector's limit: at 20 W the diode sees 44 V, and above it the Measuring Power page already warns about the diode.

**Against the kit's published figures:** the kit page claims 20 W continuous and 100 W peak. At 20 W each resistor dissipates 2.5 W: 83 % of a 3 W part, 125 % of a 2 W part. I do not know the kit's resistor rating. If they are 3 W, the kit's continuous claim equals this build's burst limit. This is a question to settle, not a finding (§10).

### 7.3 Thermal test before publishing these numbers (proposed)

Build one board with the intended resistors. In still air, unenclosed, drive it at the continuous limit for 15 minutes, then at the burst limit for 30 s. Record each resistor's body temperature (thermocouple or IR thermometer) and the board surface beside it. Proposed acceptance, for the owner to set: body at most 120 °C and board at most 80 °C at the continuous limit; body at most 150 °C at the end of a burst; no discoloration or smell; resistance back within 2 % afterward. Repeat enclosed if a box is part of the instructions.

## 8. RF model

### 8.1 Method

`rf-engine.mjs` is a lumped, partial-inductance model. Every conductor (strip piece, lead, strap, resistor body, BNC wire) is a straight segment with self inductance and mutual coupling to every parallel segment (Grover's closed form). Resistors carry 100 Ω and a small body capacitance; the diode is a junction capacitance between its leads; ceramic capacitors carry lead inductance. A modified-nodal solve gives the input impedance at the BNC for each frequency. The engine is checked against closed forms (self inductance, series R+L, an opposite-current pair) in `check-layout.mjs`.

**Not modeled:** radiation, skin-effect loss, distributed capacitance to nearby objects or a table, the BNC's internal structure, and anything inside a resistor beyond a body capacitance and an optional extra inductance. Components are treated as ideal apart from those.

### 8.2 Assumptions

| Parameter                             | Nominal | Pessimistic (invented, not a bound) |
| ------------------------------------- | ------- | ----------------------------------- |
| Extra inductance inside each resistor | 0       | 40 nH                               |
| Each BNC wire                         | 10 mm   | 20 mm                               |
| Resistor body capacitance             | 0.3 pF  | 0                                   |
| Diode junction capacitance            | 4 pF    | 1 pF                                |

The resistors' internal inductance is the biggest unknown: spiral-trimmed film parts can add tens of nanohenries and the kit's resistor type is not recorded. Everything is reproducible with `node rf-report.mjs`.

### 8.3 Predicted SWR by band (modeled)

| Scenario             | 160 m | 80 m | 40 m | 30 m | 20 m | 17 m | 15 m | 12 m | 10 m | 6 m  | 2 m  | 70 cm |
| -------------------- | ----- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ----- |
| Nominal              | 1.00  | 1.00 | 1.00 | 1.01 | 1.01 | 1.01 | 1.01 | 1.01 | 1.02 | 1.03 | 1.07 | 1.19  |
| Pessimistic          | 1.01  | 1.02 | 1.03 | 1.05 | 1.07 | 1.09 | 1.10 | 1.12 | 1.14 | 1.26 | 1.85 | 2.59  |
| Nominal, C2 left off | 1.00  | 1.01 | 1.01 | 1.02 | 1.02 | 1.03 | 1.03 | 1.04 | 1.05 | 1.09 | 1.25 | 2.27  |

First frequency where SWR exceeds 1.1 / 1.25 / 1.5 / 2.0: nominal 198 / 255 / 290 / 673 MHz; pessimistic 21 / 50 / 93 / 170 MHz.

**How far to trust this.** The model is built from first-principles geometry with no fitting to a built board. I would trust the HF and 6 m rows to about the pessimistic column, and nothing above roughly 100 MHz; 2 m and 70 cm are **not claimed**. The pessimistic case reaches 1.10–1.14 on 15 m to 10 m, so a published "SWR below 1.1 on all HF bands" (the kit's claim) would need a measurement first.

Sensitivity (one change at a time from nominal):

| Change                       | SWR 10 m    | SWR 6 m     | First above 1.25 / 1.5 (MHz) |
| ---------------------------- | ----------- | ----------- | ---------------------------- |
| nominal                      | 1.02        | 1.03        | 255 / 290                    |
| BNC wires 6 mm               | 1.00        | 1.01        | 272 / 590                    |
| BNC wires 15 mm              | 1.03        | 1.06        | 218 / 265                    |
| BNC wires 25 mm              | 1.06        | 1.12        | 109 / 198                    |
| +20 nH inside each resistor  | 1.05        | 1.10        | 137 / 272                    |
| +40 nH inside each resistor  | 1.09        | 1.17        | 75 / 147                     |
| +80 nH inside each resistor  | 1.17        | 1.33        | 41 / 75                      |
| no resistor body capacitance | 1.02        | 1.04        | 251 / 283                    |
| diode capacitance 1 pF       | 1.02        | 1.04        | 622 / 647                    |
| diode capacitance 10 pF      | 1.00        | 1.01        | 149 / 170                    |
| lead span 7 / 9 holes        | 1.01 / 1.02 | 1.03 / 1.03 | 258 / 294 and 248 / 283      |

### 8.4 Choosing C2

| C2         | Nominal 10 m / 6 m | Pessimistic 10 m / 6 m |
| ---------- | ------------------ | ---------------------- |
| none       | 1.05 / 1.09        | 1.18 / 1.33            |
| 2.2 pF     | 1.03 / 1.05        | 1.15 / 1.29            |
| **3.3 pF** | **1.02 / 1.03**    | **1.14 / 1.26**        |
| 4.7 pF     | 1.00 / 1.01        | 1.13 / 1.23            |
| 6.8 pF     | 1.02 / 1.03        | 1.10 / 1.19            |
| 10 pF      | 1.05 / 1.09        | 1.07 / 1.13            |

It helps at every value up to 6.8 pF and over-corrects the low-inductance case beyond that. **3.3 pF** is the E12 value that stays safe if the real inductance is lower than modeled. With a NanoVNA, try 2.2–4.7 pF; this is tuning, not a requirement.

### 8.5 Power sharing

Power in each resistor relative to the mean, nominal: 1 MHz 1.000; 30 MHz 0.996–1.005; 52 MHz 0.988–1.016; 146 MHz 0.928–1.111. At HF and 6 m the eight resistors share evenly, so no resistor runs hotter than the others on account of the layout.

## 9. Validation plan

1. **DC checks** in the sheet (§5 of the sheet).
2. **NanoVNA S11 sweep** of the finished board, calibrated at the BNC connector, 1–150 MHz (optionally to 450). Record SWR at band centres and compare with §8.3. Repeat with C2 omitted and with the BNC wires at 10 mm and 20 mm to test the model's two largest sensitivities. If SWR at 29 MHz exceeds 1.1, suspect spiral-trimmed resistors (the +20–40 nH rows).
3. **Detector calibration.** Compare readings at 5, 10 and 20 W on 14 MHz against a known wattmeter or calibrated source; solve for Vf and compare with 0.3 V. If it differs, the DIY page needs its own constant.
4. **Keying test:** a few hundred key-downs at 10 W, then recheck the detector reading and diode forward drop (§5.1).
5. **Thermal test** (§7.3).
6. **Update this record:** change each status in the table at the top to "measured" or "revised", and replace the model's numbers with measured ones in anything published.

## 10. Open questions for the owner

1. **Kit parts:** the resistor part number, wattage and body length; the diode part number; and the PCB schematic to confirm §3's inferred topology.
2. **Kit rating:** the kit page claims 20 W continuous. Is that against 3 W resistors? (§7.2)
3. **The Measuring Power table:** are the per-band figures |Z| or the resistive part? It decides whether they say anything about reactance, and whether a DIY page can reuse them.
4. **Power limits:** accept §7 as recommended, or wait for the thermal test.
5. **BNC:** specify a particular connector for the DIY page, or leave the choice to the builder.
6. **Where it appears on the site, and under what name.** Under discussion; see the decision record.

## 11. Files

| File                            | Purpose                                                                   |
| ------------------------------- | ------------------------------------------------------------------------- |
| `layout.mjs`                    | The layout as data; the netlist is derived from it                        |
| `limits.mjs`                    | Power-limit rule, diode ratings, peak inverse voltage                     |
| `check-layout.mjs`              | 141 checks against expectations typed independently                       |
| `verify-drawing.mjs`            | Rebuilds connectivity from the drawn SVG and compares with the netlist    |
| `check-mutations.mjs`           | Breaks layout and drawing 11 ways; all must be caught                     |
| `rf-engine.mjs`, `rf-model.mjs` | The lumped RF model                                                       |
| `rf-report.mjs`                 | Prints every table in §4 and §8                                           |
| `generate-sheet.mjs`            | Draws the sheet; refuses to draw if the checks fail; verifies the drawing |
| `stripboard-sheet.svg` / `.png` | The builder sheet                                                         |

```bash
node docs/engineering/dummy-load-stripboard/check-layout.mjs
node docs/engineering/dummy-load-stripboard/generate-sheet.mjs
node docs/engineering/dummy-load-stripboard/check-mutations.mjs
node docs/engineering/dummy-load-stripboard/rf-report.mjs
```
