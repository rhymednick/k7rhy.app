# Coupeville Red Lipstick Special — wiring assembly guide

**Status:** Draft Rev 0.2 · 2026-10-05. **Not ready to solder from.** The physical toggle lug maps and the body layout are unresolved, and the pickup lead roles are owner-reported but untested. Every table that needs one of them is a blank form, marked **FILL**.

**Scope:** This file says **how to build and check** the circuit. What the circuit _is_ (nets, switch behavior, truth table, decisions) is in the [wiring specification](./reference.md); if the two disagree, the specification wins and this file is wrong. Net names (`GND`, `N-OUT`, `BUS`, …) and terminal names (`E-N`, `P-M1`, …) are the specification's.

Evidence labels: **[Owner]** owner decision; **[Derived]** follows from the netlist and was simulated; **[Proposed]** an engineering default or procedure not yet exercised; **[Unknown]** not established.

## 1. Harness layout

### Control arrangement **[Owner, handoff §15]**

The three pickup enables sit in the same left-to-right order as the pickups. The two phase switches sit apart from them so their different role is obvious. This is a **functional arrangement, not a to-scale cavity drawing**: mounting dimensions, control spacing, and the positions of the pots and jack are being worked out by the owner (specification item U6). The harness drawing requested by the handoff, a top view of the control cavity, waits on that.

```text
    NECK          MIDDLE         BRIDGE
   ON / OFF       ON / OFF       ON / OFF
     E-N            E-M            E-B


   N PHASE         M PHASE
 NORMAL / REVERSE  NORMAL / REVERSE
     P-N              P-M
```

Label the phase switches by the pickup they reverse (`N PHASE`, `M PHASE`). Do **not** label either simply IN / OUT, because phase is relational.

**Lever convention [Owner default, 2026-10-05]:** UP = ON (enable switches) or NORMAL (phase switches); DOWN = OFF or REVERSE. Decide which physical direction is "up" when the layout is set, and confirm each lever's electrical state with the meter before relying on the labels. The mechanical position of every lever is verified by the checks in §4.

The two drawing sheets, [wiring-reference.png](./wiring-reference.png) and [wiring-schematic.png](./wiring-schematic.png), show the same circuit and use the net labels in the wire list below. Neither shows physical lug numbers or a cavity layout.

### How the harness is organized

Build it as three **modules** plus a small **output group**, then join them in the order of the chain.

| Group         | Contains                            | Leaves the group as         |
| ------------- | ----------------------------------- | --------------------------- |
| Neck module   | `E-N`, `P-N`, neck pickup leads     | `GND` (in), `N-OUT` (out)   |
| Middle module | `E-M`, `P-M`, middle pickup leads   | `N-OUT` (in), `M-OUT` (out) |
| Bridge module | `E-B`, bridge pickup leads          | `M-OUT` (in), `BUS` (out)   |
| Output group  | Volume, tone, 22 nF capacitor, jack | `BUS` (in), tip/sleeve      |

**Label every wire** at both ends with its net name. Do not rely on wire color to communicate electrical function **[Owner]**.

### Wire list

The same list is the build table and the netlist's connection map. Every row's "Net" is a specification net.

**Neck module (`x` = N, chain input is `GND`)**

| From                 | To                       | Net     |
| -------------------- | ------------------------ | ------- |
| `E-N` common         | Ground bus               | `GND`   |
| `E-N` OFF throw      | `P-N1` common            | `N-OUT` |
| `E-N` ON throw       | `P-N2` common            | `N-Y`   |
| `P-N1` NORMAL throw  | `P-N2` REVERSE throw     | `N-H`   |
| `P-N1` REVERSE throw | `P-N2` NORMAL throw      | `N-R`   |
| Neck hot lead        | the `N-H` junction above | `N-H`   |
| Neck return lead     | the `N-R` junction above | `N-R`   |

The two cross-over junctions are the polarity reversal: the hot lead lands on the NORMAL throw of pole 1 and the REVERSE throw of pole 2; the return lead lands on the opposite two.

**Middle module (`x` = M, chain input is `N-OUT`)**

| From                 | To                       | Net     |
| -------------------- | ------------------------ | ------- |
| `E-M` common         | `E-N` OFF throw          | `N-OUT` |
| `E-M` OFF throw      | `P-M1` common            | `M-OUT` |
| `E-M` ON throw       | `P-M2` common            | `M-Y`   |
| `P-M1` NORMAL throw  | `P-M2` REVERSE throw     | `M-H`   |
| `P-M1` REVERSE throw | `P-M2` NORMAL throw      | `M-R`   |
| Middle hot lead      | the `M-H` junction above | `M-H`   |
| Middle return lead   | the `M-R` junction above | `M-R`   |

**Bridge module (chain input is `M-OUT`; no phase switch)**

| From            | To                          | Net     |
| --------------- | --------------------------- | ------- |
| `E-B` common    | `E-M` OFF throw             | `M-OUT` |
| `E-B` OFF throw | volume CW lug               | `BUS`   |
| Bridge hot lead | `E-B` OFF throw (same node) | `BUS`   |
| `E-B` ON throw  | Bridge return lead          | `B-R`   |

**Output group**

| From               | To                        | Net      |
| ------------------ | ------------------------- | -------- |
| Volume CW lug (1)  | `BUS`                     | `BUS`    |
| Volume wiper (2)   | Jack tip                  | `OUT`    |
| Volume CCW lug (3) | Ground bus                | `GND`    |
| Tone CCW lug (3)   | `BUS`                     | `BUS`    |
| Tone wiper (2)     | 22 nF capacitor, free end | `TONE-W` |
| 22 nF capacitor    | Ground bus                | `GND`    |
| Tone CW lug (1)    | **unused**                | —        |
| Jack sleeve        | Ground bus                | `GND`    |

### Pickup leads — identification **Owner-reported, untested**

Each pickup has a **three-wire** lead. The owner's report (2026-10-05, from memory, not metered, not from GFS documentation): **red = hot (coil start)**, **white = finish (coil return)**, **black = case ground**, and white and black may be reversed. Treat the table as a hypothesis to confirm by meter (§4.4), not as a wiring instruction. Wire colors identify nothing until the meter agrees, and they must not be the only thing a labeled wire relies on **[Owner]**.

| Pickup | Hot `H` (reported) | Return `R` (reported) | Case lead (reported) | Confirmed by meter? | Source document |
| ------ | ------------------ | --------------------- | -------------------- | ------------------- | --------------- |
| Neck   | red                | white                 | black                | **FILL**            | owner report    |
| Middle | red                | white                 | black                | **FILL**            | owner report    |
| Bridge | red                | white                 | black                | **FILL**            | owner report    |

Role in the circuit: `H` and `R` are the chain leads and land on the cross-over junctions; the **case lead goes to `GND`**, never into the chain.

## 2. Component details

### 2.1 Enable toggle — SPDT on-on (×3: `E-N`, `E-M`, `E-B`)

Electrical requirement: **SPDT on-on**. A DPDT on-on is allowed if it suits the build; leave the second pole unconnected **[Owner]**.

Functional contact map (nodes, not lugs):

| Lever      | `x-IN` ↔ | Result           |
| ---------- | --------- | ---------------- |
| UP (ON)    | `x-Y`     | Pickup in series |
| DOWN (OFF) | `x-OUT`   | Pickup bypassed  |

**Lug map — FILL after continuity test.** Do not assign lug numbers from a datasheet picture alone.

| Toggle | Viewing orientation | Lug (as numbered) | Role (common / UP throw / DOWN throw) | Lever UP contact | Lever DOWN contact |
| ------ | ------------------- | ----------------- | ------------------------------------- | ---------------- | ------------------ |
|        |                     |                   |                                       |                  |                    |

### 2.2 Phase toggle — DPDT on-on (×2: `P-N`, `P-M`)

Two independent poles; their commons are `x-OUT` (pole 1) and `x-Y` (pole 2). Never let the two poles touch.

| Lever          | `P-x1` common `x-OUT` ↔ | `P-x2` common `x-Y` ↔ |
| -------------- | ------------------------ | ---------------------- |
| UP (NORMAL)    | `x-H`                    | `x-R`                  |
| DOWN (REVERSE) | `x-R`                    | `x-H`                  |

**Lug map — FILL after continuity test.** Record the viewing orientation, the numbering you use, which lugs are the two commons, and which throw closes in each lever position.

| Toggle | Viewing orientation | Pole | Common lug | UP throw lug | DOWN throw lug |
| ------ | ------------------- | ---- | ---------- | ------------ | -------------- |
|        |                     | 1    |            |              |                |
|        |                     | 2    |            |              |                |

### 2.3 Identifying toggle lugs by continuity **[Proposed procedure]**

1. Mount nothing yet. Set the meter to continuity or low ohms. Hold the toggle in a fixed orientation and number the lugs yourself; write the numbering and orientation on the form.
2. **SPDT:** with the lever UP, test every pair of lugs and record which pair is continuous; repeat with the lever DOWN. The **common** is the lug that is continuous with a different lug in each position.
3. **DPDT:** expect two groups of three lugs. Repeat step 2 in each group. Confirm that **no lug of one pole is continuous with any lug of the other pole** in either lever position, so a build cannot bridge the two poles.
4. Confirm the lever's physical direction for UP and mark the toggle so the label and the contact agree.
5. If any switch is not on-on, or shows a center-off position, set it aside; the specification requires on-on parts.

### 2.4 Master volume — A500K audio

Bottom view, **looking directly at the solder lugs with the shaft pointing away; the lug row is at the bottom of the view**. Lugs are numbered 1, 2, 3 from the viewer's left. Never mirror this drawing.

```text
        ┌───────────────────┐
        │   A500K  VOLUME   │
        └──┬──────┬──────┬──┘
           1      2      3
          CW    WIPER   CCW
          BUS    OUT    GND
```

Check by meter that clockwise rotation lowers lug 1–to–wiper resistance and raises lug 3–to–wiper resistance, so clockwise increases volume.

### 2.5 Master tone — A500K audio with 22 nF

Same bottom view and numbering as the volume pot.

```text
        ┌───────────────────┐
        │    A500K  TONE    │
        └──┬──────┬──────┬──┘
           1      2      3
          CW    WIPER   CCW
         unused  TONE-W  BUS
                   │
                 22 nF
                   │
                  GND
```

The tone feed is `BUS`, the volume **input**, not the volume wiper **[Owner]**. Clockwise should brighten.

### 2.6 Jack — mono

Tip is `OUT`; sleeve is `GND`. Confirm which jack lug is the tip by continuity with a plug inserted before wiring.

## 3. Assembly sequence

1. **Prepare.** Fill the toggle lug maps (§2). Gather the five mini toggles, two A500K audio pots, the 22 nF capacitor, and the jack. Obtain the GFS lead identification (specification item U1). Do not connect pickups yet.
2. **Shield.** Shield the control cavity and pickup cavities using the established Coupeville practice and bond the shielding to `GND`. Keep every shielded surface clear of the chain nets (`N-OUT`, `N-Y`, `N-H`, `N-R`, `M-OUT`, `M-Y`, `M-H`, `M-R`, `B-R`) and of every toggle terminal **[Owner]**. Insulate exposed lugs where a shield could touch them.
3. **Build the controls without pickups.** Mount the controls. Wire the ground bus, the three enable switches, the two phase switches, and the output group from the [wire list](#wire-list). Leave the six pickup-lead junctions unconnected.
4. **Pre-pickup validation (§4.1–§4.3).** Do not proceed until every row passes.
5. **Pickups on the bench (§4.4–§4.6).** Measure resistance, case isolation, and polarity of each loose pickup, record them, and label the leads.
6. **Connect pickups.** Land each pickup's hot and return leads on its cross-over junctions, per the filled lead table. Keep the leads and the junctions off the shielding. Install the pickups.
7. **Post-install validation (§4.7).**
8. **Acoustic validation and listening (§4.8 and the specification's listening matrix).**

## 4. Validation

**Reading "open" once the pots are wired.** Any path from `BUS` to `GND` through the volume pot's track reads about 500 kΩ whatever the knob position (the tone capacitor blocks DC). Treat a reading of roughly 500 kΩ or more as **open** in the continuity tables below, or run them before the volume pot is connected.

### Netlist check

The specification's netlist is modeled at terminal level in `netlist.mjs` and exercised in all 32 lever states (3 enables × 2 phase switches) by `check-netlist.mjs`. In every state the model has exactly one series path from `GND` to `BUS` through the enabled pickups, no pickup is shorted across itself, each pickup's case lead stays on `GND`, and the polarity of each path matches the specification's truth table (typed into the checker independently of the model). It also checks module behavior against §4.1, chain continuity against §4.2, and the dummy-load sums against §4.3, and finds the 14 distinct states. Deliberately broken copies of the netlist fail the checker. `verify-drawing.mjs` separately rebuilds the schematic's connections from its drawn geometry and compares them with the model.

```text
node docs/engineering/coupeville-red-lipstick-special/check-netlist.mjs
node docs/engineering/coupeville-red-lipstick-special/verify-drawing.mjs
```

Neither script measures a real harness; they confirm that the documents, model, and drawings agree with each other. Everything physical is still checked on the bench below.

### 4.1 Module continuity, pickups disconnected

For each module, with the pickup leads **not** connected, measure between the four points `IN`, `OUT`, `H` (the lug that will take the hot lead), and `R` (the lug for the return lead). Closed means about 0 Ω (wire and switch only); open means no continuity.

| Phase lever | Enable lever | Expected closed                 | Expected open (everything else) |
| ----------- | ------------ | ------------------------------- | ------------------------------- |
| NORMAL      | ON           | `IN`–`R`; `OUT`–`H`             | `IN`–`OUT`; `IN`–`H`; `OUT`–`R` |
| REVERSE     | ON           | `IN`–`H`; `OUT`–`R`             | `IN`–`OUT`; `IN`–`R`; `OUT`–`H` |
| NORMAL      | OFF          | `IN`–`OUT`; `IN`–`H`; `OUT`–`H` | `R` open to all                 |
| REVERSE     | OFF          | `IN`–`OUT`; `IN`–`R`; `OUT`–`R` | `H` open to all                 |

Pass criteria for every module, from the handoff: with the enable **ON**, `IN` and `OUT` are **not** shorted (the only route between them is through the pickup); with it **OFF**, `IN` and `OUT` read near zero. For the **bridge** module, `OUT`–`H` is always closed, and the phase rows do not apply: ON closes `IN`–`R`; OFF closes `IN`–`OUT` and leaves `R` open.

| Module | Phase lever | Enable lever | Result | Pass |
| ------ | ----------- | ------------ | ------ | ---- |
| _FILL_ |             |              |        |      |

Also confirm in both lever positions that no phase-switch pole touches the other pole.

### 4.2 Chain continuity, pickups disconnected

Probe the four chain nodes. With **no pickups connected**, a node pair is closed only if every module between them is OFF.

|   N |   M |   B | `GND`–`N-OUT` | `N-OUT`–`M-OUT` | `M-OUT`–`BUS` | `GND`–`BUS` |
| --: | --: | --: | ------------- | --------------- | ------------- | ----------- |
|   0 |   0 |   0 | closed        | closed          | closed        | **closed**  |
|   0 |   0 |   1 | closed        | closed          | open          | open        |
|   0 |   1 |   0 | closed        | open            | closed        | open        |
|   1 |   0 |   0 | open          | closed          | closed        | open        |
|   0 |   1 |   1 | closed        | open            | open          | open        |
|   1 |   0 |   1 | open          | closed          | open          | open        |
|   1 |   1 |   0 | open          | open            | closed        | open        |
|   1 |   1 |   1 | open          | open            | open          | open        |

The handoff's required confirmation is the first row: `N=0 M=0 B=0` gives a direct path from signal ground to the volume input. If the volume pot is already connected to `BUS`, an "open" `GND`–`BUS` reads about 500 kΩ through the pot rather than no continuity; measure before the pots are connected, or treat ~500 kΩ as open.

| N M B  | `GND`–`N-OUT` | `N-OUT`–`M-OUT` | `M-OUT`–`BUS` | `GND`–`BUS` | Pass |
| ------ | ------------- | --------------- | ------------- | ----------- | ---- |
| _FILL_ |               |                 |               |             |      |

### 4.3 Optional dummy-load rehearsal **[Proposed]**

To exercise the chain wiring before touching the real pickups, put a resistor in each pickup's place (hot lug to return lug): **1.0 kΩ** for neck, **2.2 kΩ** for middle, **4.7 kΩ** for bridge. These values are arbitrary; they only make each combination's sum unique. Measure `GND`–`BUS` with the volume and tone **not** connected.

| N M B | Expected `GND`–`BUS` |
| ----- | -------------------- |
| 0 0 0 | ≈ 0 Ω                |
| 0 0 1 | 4.7 kΩ               |
| 0 1 0 | 2.2 kΩ               |
| 1 0 0 | 1.0 kΩ               |
| 0 1 1 | 6.9 kΩ               |
| 1 0 1 | 5.7 kΩ               |
| 1 1 0 | 3.2 kΩ               |
| 1 1 1 | 7.9 kΩ               |

Phase switches do not change a resistor's reading, so this test confirms the chain and enable wiring only. Phase is covered by §4.1 here and by the polarity procedure in §4.6.

### 4.4 Loose-pickup records and lead identification **FILL**

Do this for each pickup **before anything is soldered**. It settles the owner's untested report (red hot, white return, black case) and is the guard against the white/black mix-up.

**Procedure [Proposed]:** use a multimeter on resistance, with the pickup out of the guitar.

1. Measure **red ↔ white** and **red ↔ black**. The coil's resistance appears between red and the **return** lead, which should be in the kΩ range near the vendor figure (about 4.9K neck, 6K middle, 8K bridge, vendor-stated and unmeasured). The other lead reads open to red.
2. Measure each of **white** and **black** to the metal **cover**. The **case** lead should read about 0 Ω to the cover; the return lead should read **open** to the cover.
3. If white reads the coil resistance and black reads the cover: the report is right. If it is the other way around, the colors are swapped: **relabel**, and wire the lead that reads the coil resistance as the return.
4. If the lead that reads the coil resistance **also** reads continuity to the cover, or red reads continuity to the cover, the cover is tied to a coil end. Stop: that pickup cannot go into the series chain as supplied (specification §7).
5. Tag each wire with its **role** (`HOT`, `RETURN`, `CASE`) so the roles, not the colors, carry through the build.

| Pickup | Measured DC resistance (hot ↔ return) | Hot ↔ case lead | Return ↔ cover | Case lead ↔ cover | Colors as reported? | Notes |
| ------ | -------------------------------------- | ---------------- | --------------- | ------------------ | ------------------- | ----- |
| Neck   |                                        |                  |                 |                    |                     |       |
| Middle |                                        |                  |                 |                    |                     |       |
| Bridge |                                        |                  |                 |                    |                     |       |

Expected: hot ↔ case lead open; return ↔ cover open; case lead ↔ cover near 0 Ω. Anything else is recorded and resolved before wiring **[Owner, handoff §22–23]**.

The **advertised RWRP relationship** of the middle pickup is checked in §4.6, not by resistance.

### 4.5 Do not infer polarity from wire color

Wire colors give the _intended_ connection only if they come from GFS's own documentation for this set; here they are only the owner's untested report until §4.4 confirms them. Completed-system behavior must still be tested **[Owner]**.

### 4.6 Polarity and phase verification procedure **[Proposed]**

The handoff requires a consistent, documented procedure. This one has not been exercised on these pickups. Use the same procedure every time and record the result.

**A. Quick bench check of each loose pickup (not authoritative).** Use a meter on a low DC millivolt range, or better an oscilloscope or audio interface, across the pickup's two leads with the lead GFS names as start on the positive probe. Bring one fixed steel tool toward the same spot on the pickup and withdraw it, the same way each time. Note the sign of the first deflection. Pickups whose string-signal polarity matches should show the same sign. If the RWRP design works as advertised, the middle should also show the **same** sign as the outer pickups in this test, because its reversed winding and reversed magnet each flip the sign. A consistent result across the three suggests the lead identification is plausible; it proves nothing. A different result means the lead identification, the RWRP relationship, or the test itself needs scrutiny.

**B. System check with the finished circuit.** For each two-pickup pair, play the same open strings with the same attack in the "Normal" state and the "Reversed" state (specification states S4/S5, S6/S7, S8/S9), recording through an audio interface into an audio editor. The in-phase state is the one with the **higher level and fuller low end**; the out-of-phase state is thinner and quieter. Record which switch setting produced the in-phase result and whether it matches the specification's NORMAL.

**C. Hum.** In one fixed spot and orientation near a source of mains hum, record the hum level of each single pickup and each series state. Compare the RWRP-middle pairs (S4, S8) against the outer-only pair (S6) and the single pickups. Record the measured values; do not assume cancellation **[Owner]**.

| Check  | State(s) | Result | Matches specification? |
| ------ | -------- | ------ | ---------------------- |
| _FILL_ |          |        |                        |

### 4.7 Resistance at the jack after installation

With the guitar disconnected from any amplifier and **volume fully up**, measure tip to sleeve. The reading should approximately reflect the active pickups' measured resistances added together, reduced a little by the 500K volume pot. The tone capacitor blocks DC, so the tone pot does not affect it. Publish no target numbers until the pickups' resistances are measured **[Owner]**.

| N M B | Expected                                            | Measured | Pass |
| ----- | --------------------------------------------------- | -------- | ---- |
| 0 0 0 | ≈ 0 Ω at any volume setting (volume input grounded) |          |      |
| 0 0 1 | ≈ R(bridge) loaded by 500 kΩ                        |          |      |
| 0 1 0 | ≈ R(middle) loaded by 500 kΩ                        |          |      |
| 1 0 0 | ≈ R(neck) loaded by 500 kΩ                          |          |      |
| 0 1 1 | ≈ R(middle) + R(bridge), loaded                     |          |      |
| 1 0 1 | ≈ R(neck) + R(bridge), loaded                       |          |      |
| 1 1 0 | ≈ R(neck) + R(middle), loaded                       |          |      |
| 1 1 1 | ≈ R(neck) + R(middle) + R(bridge), loaded           |          |      |

### 4.8 Functional tap test

Through a low-volume amplifier, tap each pickup in turn. With all three enables OFF there must be silence. With one enable ON, only that pickup responds. Turn each knob stop to stop: clockwise volume must increase level and clockwise tone must brighten. Then walk the 13 sounding states and note any state that is silent, noisy, or sounds like only one pickup. A state that drops pickups indicates a chain-node short to shielding or ground, or a floating lead, and returns you to §4.1–§4.2.

## 5. Mounting and fit

The owner is determining mounting dimensions and control layout (specification item U6). Five mini toggles, two pots, a jack, and the harness must fit the cavity with terminal clearance and wiring access. The 22 nF capacitor and all junctions must stay clear of the shielding. Record the final layout here when it exists, and draw the top-view harness diagram from it.

| Item                      | Decision |
| ------------------------- | -------- |
| Body / cavity             |          |
| Toggle mounting hole size |          |
| Control positions         |          |
| Cavity depth clearance    |          |

## 6. Revision history

| Rev | Date       | Change                                                                                                                                                            |
| --- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1 | 2026-10-05 | First draft: functional harness, wire list, validation procedures, blank forms.                                                                                   |
| 0.2 | 2026-10-05 | Added the owner-reported three-wire lead table, the lead-identification procedure (§4.4), and the checker and verifier scripts; linked the issued drawing sheets. |
