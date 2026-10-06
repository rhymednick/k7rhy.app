# Red Lipstick Special — Engineering Handoff (source record)

> **Ingestion note.** The text below the rule is the owner's engineering handoff, ingested verbatim on 2026-10-05 from the owner's chat message. It was titled "Coupeville Series/Phase Lipstick Experiment" and carried no model name. On 2026-10-05 the owner first called the model **Red Special**, then renamed it **Red Lipstick Special** the same day; this record uses the latter. The handoff itself says the design is inspired by the electrical architecture of Brian May's Red Special and is not a replica.
>
> The handoff is the source of the owner's decisions. The working specification is [reference.md](./reference.md) and the build procedure is [assembly-guide.md](./assembly-guide.md). If they ever disagree with this text, treat the disagreement as an error to resolve with the owner, not as a silent override.

---

# Engineering Handoff: Coupeville Series/Phase Lipstick Experiment

## Project Status

This document defines the current authoritative engineering decisions for a new experimental Coupeville guitar.

The design is inspired by the electrical architecture of Brian May's Red Special, but it is **not a Red Special replica** and should not be described as one.

The experiment is specifically intended to investigate:

> How do three bright single-coil lipstick pickups behave when arbitrary pickup combinations are connected in series rather than parallel, with independently selectable relative phase?

The guitar should remain recognizably part of the Coupeville family.

---

# 1. Design Intent

The purpose of this build is to explore pickup interaction as part of the instrument's voice.

Conventional three-single-coil guitars generally combine pickups in parallel. This design deliberately uses **series combination exclusively**.

Expected effects include:

- Higher output with multiple active pickups.
- Increasing total inductance as additional pickups are inserted into the signal chain.
- Stronger midrange and lower resonant behavior with multiple pickups.
- Distinctive partial cancellation when one pickup is electrically reversed relative to the others.
- Hollow, nasal, focused, or otherwise unusual mixed-phase voices.
- Significant tonal differences between one-, two-, and three-pickup operation.

These are engineering hypotheses to be validated by the completed instrument rather than claims to be presented as guaranteed tonal outcomes.

---

# 2. Pickup Set

Use the existing three-pickup GFS lipstick set.

The set contains:

- Neck lipstick pickup
- RWRP middle lipstick pickup
- Bridge lipstick pickup

Retain the manufacturer's intended physical assignments:

- Neck pickup → neck position
- RWRP middle pickup → middle position
- Bridge pickup → bridge position

Do not substitute expensive Tri-Sonics or boutique Brian May reproduction pickups for this initial experiment.

The lipstick pickups are deliberately being used as an affordable platform for evaluating the switching topology.

If the experiment proves musically valuable, a later version may investigate Tri-Sonic-style or purpose-designed pickups.

---

# 3. Pickup Manufacturer Data

Use the published GFS documentation for:

- Wire colors
- Start/finish conductor identification
- Magnetic polarity where published
- Electrical polarity where published
- Pickup specifications

Do not guess wire-color conventions.

Do not duplicate wire-color assumptions from generic pickup diagrams if GFS publishes the relevant information.

Before finalizing the assembly documentation, verify that the GFS documentation being referenced applies to this exact lipstick pickup set.

---

# 4. Fundamental Electrical Architecture

## 4.1 Series-only operation

All multi-pickup combinations shall connect the active pickups **in series**.

There is no conventional parallel pickup mode.

Do not add:

- Series/parallel switching
- Conventional Strat-style parallel combinations
- Automatic parallel fallback modes

The purpose of this guitar is specifically to explore a configurable series pickup network.

---

# 5. Pickup Selection

Each pickup has an independent ON/OFF control.

Controls:

- Neck ON/OFF
- Middle ON/OFF
- Bridge ON/OFF

These controls do **not** simply disconnect a pickup from the circuit.

Each pickup occupies a position in a continuous series chain.

When a pickup is:

### ON

The signal path passes through the pickup.

### OFF

The pickup is bypassed by directly connecting that module's input to its output.

In other words:

**OFF = short around the pickup**

rather than:

**OFF = open circuit**

This preserves electrical continuity through the series chain.

---

# 6. Series Chain

Use the following conceptual series order:

```text
GROUND / SIGNAL RETURN
        |
        v
   NECK MODULE
        |
        v
  MIDDLE MODULE
        |
        v
   BRIDGE MODULE
        |
        v
MASTER VOLUME INPUT
```

The physical order is chosen because it mirrors the pickup locations and makes the schematic and harness documentation easier to understand.

For ideal passive pickup elements, changing the order of pickups within the same series network should not materially alter the resulting transfer function.

Do not change the documented order without a specific engineering reason.

---

# 7. All-Off State

The three pickup bypass controls intentionally permit:

```text
Neck   OFF
Middle OFF
Bridge OFF
```

In this state, the entire pickup chain becomes a direct bypass path from the signal return to the master-volume input.

The volume input is therefore effectively grounded.

This produces a built-in **mute/kill state**.

This behavior is intentional.

Do not add additional circuitry to prohibit the all-off condition.

---

# 8. Relative Phase Controls

The bridge pickup serves as the fixed electrical phase reference.

Provide phase reversal for:

- Neck
- Middle

Do **not** provide a bridge phase switch.

Controls:

- Neck Phase: NORMAL / REVERSE
- Middle Phase: NORMAL / REVERSE

The terms NORMAL and REVERSE refer to the pickup's electrical connection, not an absolute sonic "in-phase/out-of-phase" condition.

A pickup is only acoustically out of phase relative to another active pickup.

---

# 9. Why There Are Only Two Phase Switches

With three pickups, reversing the polarity of all active pickups simultaneously produces the same relative phase relationships and therefore the same guitar tone, aside from absolute signal polarity.

The bridge can therefore serve as the fixed reference without eliminating any unique relative-phase configuration.

For all three pickups active, the complete unique set is:

| Neck    | Middle  | Bridge reference |
| ------- | ------- | ---------------- |
| Normal  | Normal  | + + +            |
| Reverse | Normal  | - + +            |
| Normal  | Reverse | + - +            |
| Reverse | Reverse | - - +            |

The final state:

```text
- - +
```

has the same relative relationships as:

```text
+ + -
```

after global polarity inversion.

A dedicated bridge phase switch would therefore create redundant states.

The two-phase-switch architecture preserves all electrically distinct relative-phase combinations.

---

# 10. Two-Pickup Phase Behavior

The architecture also provides complete phase control for every two-pickup combination.

## Bridge + Middle

Middle Phase determines their relative phase.

## Bridge + Neck

Neck Phase determines their relative phase.

## Neck + Middle

Their relative phase depends on the relationship between the Neck Phase and Middle Phase controls.

If both are switched together, their relative phase remains unchanged.

This is expected and correct.

---

# 11. RWRP Middle Pickup

The middle pickup is reverse-wound/reverse-polarity relative to the outer pickups.

The design should preserve that relationship.

With manufacturer-normal electrical polarity, the intended starting behavior is:

- Bridge + Middle in-phase series → hum-reducing/hum-cancelling to the degree permitted by pickup matching
- Neck + Middle in-phase series → hum-reducing/hum-cancelling to the degree permitted by pickup matching

Reversing the electrical phase of one pickup in an RWRP pair changes both the musical phase relationship and the noise-cancellation relationship.

Do not assume perfect hum cancellation.

Differences in:

- coil turns
- output
- geometry
- magnetic field
- physical position

may prevent complete cancellation.

Actual noise behavior must be validated after assembly.

---

# 12. Pickup Selection Truth Table

With both phase controls in NORMAL:

|   N |   M |   B | Result                         |
| --: | --: | --: | ------------------------------ |
|   0 |   0 |   0 | Mute                           |
|   0 |   0 |   1 | Bridge                         |
|   0 |   1 |   0 | Middle                         |
|   1 |   0 |   0 | Neck                           |
|   0 |   1 |   1 | Middle + Bridge, series        |
|   1 |   0 |   1 | Neck + Bridge, series          |
|   1 |   1 |   0 | Neck + Middle, series          |
|   1 |   1 |   1 | Neck + Middle + Bridge, series |

The phase switches then modify the relative polarity of Neck and Middle without changing pickup selection.

---

# 13. Switch Hardware

## Pickup Enable Controls

Electrical requirement:

**SPDT ON-ON**

Each switch selects between:

1. Pickup inserted into series path
2. Direct bypass around pickup

DPDT ON-ON switches may be used instead if required for:

- consistent appearance
- consistent actuator feel
- parts standardization
- mechanical availability

The second pole does not need to be used unless a justified implementation purpose is identified.

Do not add functionality merely because an unused pole is available.

## Phase Controls

Electrical requirement:

**DPDT ON-ON**

Use conventional polarity-reversal cross wiring.

Each phase switch must provide:

### NORMAL

```text
Pickup conductor A → module terminal A
Pickup conductor B → module terminal B
```

### REVERSE

```text
Pickup conductor A → module terminal B
Pickup conductor B → module terminal A
```

Do not assign switch lug numbers until the actual physical toggle has been continuity-tested or its datasheet confirms the internal switching arrangement.

The schematic should define electrical nodes first.

The assembly drawing may subsequently map those nodes to physical lugs.

---

# 14. Control Layout

Player-facing controls:

### Mini toggles

- Neck ON/OFF
- Middle ON/OFF
- Bridge ON/OFF
- Neck Phase NORMAL/REVERSE
- Middle Phase NORMAL/REVERSE

### Pots

- Master Volume
- Master Tone

No rotary switch.

No pickup-specific volume controls.

No pickup-specific tone controls.

No bridge phase control.

No series/parallel control.

---

# 15. Suggested Physical Toggle Arrangement

Preferred conceptual arrangement:

```text
NECK        MIDDLE        BRIDGE
 ON/OFF      ON/OFF        ON/OFF


N PHASE      M PHASE
```

The three pickup controls should visually correspond to the physical order of the pickups.

The two phase controls should be visually separated enough that their different role is obvious.

Do not label either phase switch simply:

```text
IN / OUT
```

because phase is relational.

Preferred labeling should identify the pickup being reversed.

Examples:

```text
N PHASE
M PHASE
```

with switch states such as:

```text
NORMAL / REVERSE
```

or equivalent concise terminology.

---

# 16. Master Volume

Use:

**A500K audio-taper potentiometer**

Connect the series pickup-chain output to the volume-pot input.

Connect the wiper to the output jack tip.

Connect the grounded end of the potentiometer to signal ground.

Use the project's canonical potentiometer drawing convention:

**Bottom View, looking directly at the solder lugs with the lugs facing the viewer.**

Do not mirror pot drawings between projects.

Clearly number and identify all lugs.

---

# 17. Master Tone

Use:

**A500K audio-taper potentiometer**

Tone capacitor:

**22 nF / 0.022 µF**

Connect the master tone network to the **master-volume input node**, not the master-volume wiper.

This means the tone network sees the pickup-chain output before volume attenuation.

Document one canonical tone-pot wiring implementation.

Do not show multiple electrically equivalent variants unless needed in an explanatory appendix.

---

# 18. Treble Bleed

Do **not** install a treble-bleed network in the initial build.

This is deliberate.

The initial instrument should expose the natural interaction between:

- series pickup network
- cable/load capacitance
- 500K controls
- volume-pot position

without introducing another compensating network.

A treble bleed may be evaluated later if listening tests identify a specific need.

---

# 19. Why 500K Controls

Use 500K rather than 250K controls because multiple active pickups in series increase the total inductance presented to the guitar circuit.

The series configurations are therefore already expected to move the system toward:

- lower resonance
- stronger mids
- greater loading sensitivity

Using 500K controls provides less resistive damping than 250K controls and should help preserve usable upper-frequency response, particularly with all three pickups active.

This is an intentional starting value.

It may be revised after measurements and listening tests.

---

# 20. Conceptual Electrical Schematic

The authoritative signal architecture is:

```text
SIGNAL GROUND
     |
     v
+----------------+
|  NECK MODULE   |
|                |
| Phase reversal |
| + insert/      |
|   bypass       |
+----------------+
     |
     v
+----------------+
| MIDDLE MODULE  |
|                |
| Phase reversal |
| + insert/      |
|   bypass       |
+----------------+
     |
     v
+----------------+
| BRIDGE MODULE  |
|                |
| Insert/bypass  |
+----------------+
     |
     v
MASTER VOLUME INPUT
     |
     +------ MASTER TONE ------ GROUND
     |
MASTER VOLUME WIPER
     |
OUTPUT JACK TIP

OUTPUT JACK SLEEVE ---------- SIGNAL GROUND
```

---

# 21. Module Definitions

## Neck module

Inputs:

- Module In
- Neck pickup conductors

Outputs:

- Module Out

Functions:

1. Neck phase DPDT determines pickup conductor orientation.
2. Neck enable switch either:
    - inserts the phase-selected pickup into the signal path, or
    - directly bypasses the pickup.

## Middle module

Same architecture as Neck.

The pickup itself is the RWRP member of the pickup set.

## Bridge module

Functions:

1. Bridge enable switch either:
    - inserts bridge pickup into signal path, or
    - directly bypasses bridge pickup.

No phase switch.

Bridge establishes the fixed reference polarity.

---

# 22. Grounding

Use normal passive-guitar grounding practice.

Create a common signal-ground system for:

- pickup-chain return
- pot cases as required
- tone capacitor return
- output-jack sleeve
- shielding
- bridge/string ground if applicable

Avoid accidental alternate signal paths around the pickup modules.

The series pickup network must not be defeated by grounding one end of each pickup independently as would be common in conventional parallel guitar wiring.

This is particularly important.

**Pickup conductors participating in the configurable series chain must remain isolated from chassis/signal ground except where the designed network intentionally connects them.**

---

# 23. Shielding

Shield the control cavity and pickup cavities using the established Coupeville shielding practice where practical.

Shielding must connect to signal ground.

Do not allow shielding to contact pickup terminals, phase-switch terminals, or intermediate series-chain nodes.

Because this circuit intentionally leaves some pickup conductors above ground potential within the series chain, accidental contact between those conductors and shielding can silently defeat portions of the circuit.

---

# 24. Assembly Validation Before Pickups

Before connecting the pickups, validate the switching harness using continuity measurements.

For every pickup module verify:

### ON

Module input to module output is not directly shorted.

The path should instead run through the pickup terminals.

### OFF

Module input and module output have near-zero resistance between them.

Verify the complete three-module chain in all eight pickup-selection states.

Specifically confirm:

```text
N=0 M=0 B=0
```

produces a direct path from signal ground to the master-volume input.

---

# 25. Pickup Validation

After installation verify:

- Neck DCR
- Middle DCR
- Bridge DCR
- advertised RWRP relationship
- relative acoustic phase
- hum behavior

Use a consistent polarity/phase verification procedure and document it.

Do not infer electrical phase solely from wire colors.

Wire colors determine intended connection according to GFS documentation, but completed-system behavior should still be tested.

---

# 26. Resistance Sanity Checks

With the guitar disconnected from an amplifier and the master volume fully up, resistance measurements at the output jack should approximately reflect the active pickup combination, subject to the parallel loading of the 500K volume/tone network.

Expected qualitative behavior:

### Single pickup

Approximately that pickup's DCR, modified somewhat by control loading.

### Two pickups in series

Approximately:

```text
Rpickup1 + Rpickup2
```

again modified by control loading.

### Three pickups in series

Approximately:

```text
Rneck + Rmiddle + Rbridge
```

modified by control loading.

### All pickups OFF

Approximately a near-short at the pickup-chain source and therefore effectively muted at the output.

Do not publish exact expected resistance values until the actual pickup DCRs are known.

---

# 27. Listening-Test Matrix

Evaluate at minimum:

## Single pickups

- Neck
- Middle
- Bridge

## Two pickups, normal phase

- Neck + Middle series
- Middle + Bridge series
- Neck + Bridge series

## Two pickups, reversed relative phase

- Neck + Middle
- Middle + Bridge
- Neck + Bridge

## Three pickups

Evaluate all four unique relative-phase states:

```text
N+ M+ B+
N- M+ B+
N+ M- B+
N- M- B+
```

---

# 28. Listening Notes

For every useful combination, document:

- perceived output
- bass response
- low-mid response
- upper-mid character
- treble/chime
- attack
- sustain
- perceived compression
- touch sensitivity
- phase-cancellation character
- noise/hum
- usefulness clean
- usefulness at edge of breakup
- behavior when volume is reduced

Particular attention should be paid to whether:

- two-pickup series combinations are more useful than three-pickup series
- three-pickup series becomes excessively dark
- lipstick pickups retain enough high-frequency definition in series
- mixed-phase three-pickup states create useful sounds rather than merely thin novelty sounds
- the phase controls offer genuinely distinct musical options

---

# 29. Future Development Criteria

Do not replace the lipstick pickups merely because they are inexpensive.

Evaluate the topology first.

A future revision using Tri-Sonic-style pickups is justified only if the experiment demonstrates that:

1. the series/phase architecture is musically compelling, and
2. the lipstick pickup characteristics appear to limit the concept in an identifiable way.

Possible future development could include:

- Tri-Sonic-style pickups
- purpose-wound low-inductance pickups
- alternative series-friendly pickup winds
- tuning individual pickup inductance/output
- revised master-load values
- revised tone-capacitor value
- optional treble bleed

None of these are part of the initial build.

---

# 30. Explicit Non-Goals

Do not add:

- Rotary switching
- Conventional 5-way blade switching
- Parallel pickup combinations
- Series/parallel mode
- Bridge phase switch
- Coil splitting
- Individual pickup volume controls
- Individual pickup tone controls
- Active electronics
- Treble bleed
- Additional loading resistors
- Harmonic Shaper circuitry

This is intentionally a focused experiment.

---

# 31. Documentation Requirements

Follow the established guitar engineering documentation standard.

Create or update documentation with the following structure:

1. Design Intent
2. Overview
3. Pickup Specification
4. Switching Architecture
5. Switching Truth Table
6. Electrical Schematic
7. Harness Layout
8. Component Detail Pages
9. Grounding
10. Assembly Sequence
11. Validation
12. Listening Notes
13. Revision History

Maintain a strict distinction between:

### Wiring Specification

What the circuit is.

### Wiring Assembly Guide

How to physically build it.

---

# 32. Drawing Conventions

Use existing project conventions:

- Pot details: canonical bottom view with solder lugs facing viewer.
- Never mirror pot diagrams.
- Harness layout: top view of control cavity.
- Schematics: conventional electronic schematic notation.
- One major concept per diagram/page where practical.
- Generous whitespace.
- Clearly labeled wires and electrical nodes.
- Do not rely on wire color alone to communicate electrical function.

For mini-toggle assembly drawings, identify:

- physical viewing orientation
- lug numbering
- switch lever position
- resulting electrical state

before presenting solder instructions.

---

# 33. Authoritative Decisions

The following are considered decided unless explicitly revised later:

- Coupeville platform
- Three GFS lipstick pickups
- RWRP middle pickup retained in middle position
- Series-only multi-pickup topology
- Independent ON/OFF control for all three pickups
- Pickup OFF state implemented as bypass, not open circuit
- Bridge used as fixed phase reference
- Neck phase reversal
- Middle phase reversal
- No bridge phase switch
- All-off mute state retained
- Master A500K volume
- Master A500K tone
- 22 nF tone capacitor
- Tone network connected to volume input
- No treble bleed initially
- No rotary switch
- No parallel mode
- No additional pickup controls

The remaining implementation work consists of translating this architecture into:

- conventional schematic
- exact switch-lug wiring
- harness layout
- assembly documentation
- website/project documentation

Use the exact GFS pickup documentation for manufacturer-specific conductor colors and connection details rather than inventing them.
