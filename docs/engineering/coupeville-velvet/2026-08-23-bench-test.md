# Coupeville Velvet Bench Test — Engineering Log Handoff

## Ingestion and model identity

- Ingested into this repository on 2026-09-13 from `relay_velvet_bench_test_engineering_log_handoff.md` in the owner's iCloud `Guitar/Coupeville` folder.
- The source is dated 2026-08-23 and was titled “Relay Velvet Bench Test — Engineering Log Handoff.” The owner identified the Relay naming as a mistake when requesting ingestion. This record uses **Coupeville Velvet**; all engineering details below are retained from the source.
- This is an experimental bench reference. The procedures and “use” instructions below belong to the source engineering notes; ingestion does not establish completed tests, authorize implementation, or finalize a production specification.
- **Mechanical fit remains unresolved.** The owner is concerned that the selected controls may not fit the Relay body. No cavity measurements, control layout, or fit validation accompany the handoff. Before committing to a body layout, check the 3-way selector, separate 5-way Super Switch, outer-volume DPDT push-pull, Nashville blend pot, and RC components for mounting space, depth, terminal clearance, and wiring access. Coupeville fit is also not established by this electrical reference.
- The existing [Relay Velvet wiring](../../../content/relay/wiring/velvet.mdx) and [voicing description](../../../content/relay/voicings/velvet/index.mdx) describe an earlier architecture. They have not been replaced by this Coupeville experiment.

---

- **Date:** 2026-08-23
- **Status:** Bench build / experimental reference implementation
- **Model:** Coupeville Velvet
- **Purpose:** Test a revised control architecture that separates pickup selection from global voice shaping and avoids the weak tonal impact of the earlier 6-way Harmonic Shaper experiment.

## 1. Design Intent

Coupeville Velvet is intended to be a warm, complex, articulate guitar suitable for jazz-oriented solo playing while still offering more than one compelling voice.

This bench test explores a control architecture with:

- A conventional 3-way selector for the two outer pickups.
- A dedicated outer-pickup volume.
- A separate Nashville middle-pickup blend/volume control.
- A 5-way switch used only for fixed global voice shaping.
- No conventional continuous tone pot.
- A push-pull mode that allows the Nashville middle pickup to operate solo.

The design deliberately moves away from the previous 6-way Harmonic Shaper topology because that network produced very little audible tonal change in practice.

## 2. Pickup / Control Architecture

### Outer pickups

The neck and bridge pickups are selected conventionally:

- 3-way position 1: bridge
- 3-way position 2: bridge + neck
- 3-way position 3: neck

The selected outer-pickup signal feeds a conventional outer volume control. The details of the 3-way and outer-volume wiring are conventional and are not part of this experiment.

### Middle pickup

The middle pickup is the GFS Retrotron Nashville.

Its control is intentionally unconventional in normal mode:

- Pot currently used for bench test: **B500K linear**
- Nashville pickup hot -> Nashville pot **Input lug**
- Nashville pot **Output lug / wiper** -> combined output bus
- Nashville pot normally-grounded outer lug -> **left disconnected in normal mode**
- Nashville pickup ground -> common guitar ground
- Pot casing -> common ground/shield as usual

In normal mode, the B500K therefore functions as a **series rheostat / blend control**, not as a conventional voltage-divider volume control.

Approximate series resistance:

- Knob 10: ~0 ohms
- Knob 7.5: ~125K
- Knob 5: ~250K
- Knob 2.5: ~375K
- Knob 0: ~500K

Important: At 0 in normal mode, the Nashville is not electrically disconnected. It is only isolated by approximately 500K of series resistance.

A future B1M linear pot may provide a better “near-off” condition while preserving an even blend sweep, but the B500K is the preferred bench-test pot over an A1M because linear taper is more appropriate for this rheostat application.

## 3. Outer Volume Push-Pull: Nashville Solo Mode

The outer volume uses a DPDT push-pull switch.

The push-pull performs two simultaneous functions.

### Push-pull DOWN — Normal / Blend Mode

**Pole 1**
- Outer volume output/wiper is connected directly to the combined output bus.

**Pole 2**
- Nashville pot’s normally grounded outer lug is disconnected from ground.

Result:

- 3-way selects bridge / both / neck.
- Outer volume controls the outer-pickup branch and also serves functionally as the master mute for the combined system.
- Nashville B500K works as a series blend control.
- Nashville may be blended into any outer-pickup selection.
- Outer volume at 0 grounds the combined bus and silences the entire guitar.
- No outer isolation resistor is used.

### Push-pull UP — Nashville Solo Mode

**Pole 1**
- Disconnect outer volume output/wiper from the combined output bus.

**Pole 2**
- Connect Nashville pot’s previously unused outer lug to ground.

Result:

- Neck/bridge branch is completely disconnected.
- Nashville pot is converted into a conventional 500K volume control.
- Nashville can operate by itself.
- Nashville volume can reach true silence at 0.
- The B500K is linear, so the solo-volume taper will not feel like a normal audio-taper guitar volume. This is accepted for the prototype because the linear taper is more important in normal blend mode.

### Push-pull wiring summary

**Pole 1: Outer branch disconnect**
- Down: outer volume wiper -> combined bus = connected
- Up: outer volume wiper -> combined bus = open

**Pole 2: Nashville pot mode conversion**
- Down: Nashville third lug -> ground = open
- Up: Nashville third lug -> ground = connected

## 4. Combined Signal Bus

In normal mode:

- Outer volume output/wiper connects directly to combined bus.
- Nashville B500K output/wiper connects directly to combined bus.
- No mixing/isolation resistor is installed on the outer-volume output.

The outer-volume resistor previously considered for preserving Nashville output at outer-volume zero is intentionally omitted.

Reason:

- Nashville solo is now provided by the push-pull.
- The resistor would unnecessarily alter outer-pickup loading and output level.
- The simpler circuit gives a hard master mute at outer-volume zero in normal mode.

Potential behavior to evaluate: because Nashville joins at the outer-volume wiper, the outer volume may not attenuate the Nashville branch with exactly the same taper as it attenuates the outer pickups. Listen for blend-balance changes as outer volume is rolled down.

## 5. 5-Way Global Voice Network

The 5-way is not a pickup selector.

It is a dedicated **global fixed voice/tone selector** placed on the combined signal bus.

The selected network is connected from the signal bus to ground.

Each active voice position uses a resistor and capacitor **in series with each other**:

`signal bus -> resistor -> capacitor -> ground`

R and C order is electrically interchangeable.

The network is in parallel with the audio path; the guitar signal itself does not pass through the selected resistor/capacitor pair.

### Current bench values

| Position | Network to Ground | Intended Effect |
|---|---|---|
| 1 | Open circuit | Full / bypass |
| 2 | 470K + 2.2 nF, series | Very light smoothing |
| 3 | 220K + 4.7 nF, series | Noticeably warmer |
| 4 | 100K + 10 nF, series | Stronger upper-mid / treble reduction |
| 5 | 47K + 22 nF, series | Dark / jazz voice |

These values are deliberately stronger and more conventional than the earlier 6-way Harmonic Shaper values.

The test criterion is that the positions should produce **clearly audible voice differences**. If a position requires concentrated A/B listening to identify, it is too subtle for the intended control.

### Physical wiring concept

Use one pole of a switch that provides five discrete throws.

- Switch common -> combined signal bus
- Position 1 -> no connection
- Position 2 -> 470K -> 2.2 nF -> ground
- Position 3 -> 220K -> 4.7 nF -> ground
- Position 4 -> 100K -> 10 nF -> ground
- Position 5 -> 47K -> 22 nF -> ground

All capacitor ground ends may share a common ground bus.

## 6. Switch Requirement

A conventional Fender-style 5-way is not preferred because many are mechanically/electrically 3-throw switches that combine adjacent contacts in positions 2 and 4.

That behavior would activate multiple voice networks simultaneously.

Preferred switch for this test:

- **5-way Super Switch**, or
- Any true discrete 1P5T / 2P5T blade or rotary switch.

The Super Switch is preferred for the bench build because it guarantees five discrete selections and removes ambiguity.

## 7. Treble Bleed

**No treble bleed is installed initially.**

Reason: this experiment is intended to allow the guitar’s passive controls and voice network to interact naturally.

Treble bleed should only be reconsidered after listening tests if the volume controls become unacceptably dull when rolled back.

## 8. Why This Differs From the Earlier 6-Way Harmonic Shaper

Do not treat this network as a 5-position copy of the earlier 6-way Harmonic Shaper.

The earlier Harmonic Shaper used relatively light RC loading intended to modify pickup resonance subtly. In practice, the tonal impact was too small.

This test intentionally uses stronger values that approach the behavior of fixed conventional tone settings.

The goal is not subtle resonance damping. The goal is five player-obvious global voices, including a true bypass/reference position.

## 9. Future Inductor / Varitone Option

A future alternative may use a Varitone-style RLC shunt network.

Proposed starting architecture:

`combined signal bus -> selected C -> 1.5 H -> 22K -> ground`

Potential capacitor values:

| Position | Capacitor | Approx. Ideal LC Resonance |
|---|---:|---:|
| 1 | Open / bypass | — |
| 2 | 1 nF | ~4.1 kHz |
| 3 | 2.2 nF | ~2.8 kHz |
| 4 | 4.7 nF | ~1.9 kHz |
| 5 | 10 nF | ~1.3 kHz |

Starting shared components:

- Inductor: **1.5 H**
- Damping resistor: **22K**
- Consider 10K for a stronger/deeper effect.
- Consider 47K for a gentler effect.

Only one inductor is required. The 5-way selects different capacitors feeding the shared inductor/resistor path.

This is a future experiment only; no suitable inductor is currently available for the present bench build.

## 10. Bench Validation Checklist

### Basic switching

- Verify 3-way selects bridge / both / neck correctly.
- Verify 5-way position 1 is electrically open/bypass.
- Verify positions 2–5 select only one RC branch at a time.
- Verify push-pull down connects outer branch.
- Verify push-pull up completely disconnects outer branch.
- Verify push-pull up grounds the Nashville pot third lug.

### Nashville control

In push-pull DOWN / blend mode:

- Confirm Nashville is strongest at 10.
- Check the blend sweep at 10 / 8 / 6 / 4 / 2 / 0.
- Listen for any Reef-style 10 -> 9 volume jump.
- Determine how audible Nashville remains at 0 with 500K series resistance.

In push-pull UP / solo mode:

- Confirm outer pickups are absent.
- Confirm Nashville pot behaves as a conventional volume.
- Confirm Nashville reaches silence at 0.
- Evaluate whether the B500K linear taper is acceptable in solo mode.

### Outer volume

In normal mode:

- Confirm outer volume at 0 silences the complete guitar.
- Listen for changes in Nashville-to-outer balance as outer volume is reduced.
- Specifically evaluate 10 -> 9 -> 8 because prior reverse-wired independent-volume experiments showed anomalous behavior in this region.

### Voice network

Evaluate all five positions with:

- Bridge only
- Bridge + neck
- Neck only
- Each outer selection with low Nashville blend
- Each outer selection with high Nashville blend
- Nashville solo

Record whether each position is:

- Clearly distinct
- Musically useful
- Redundant
- Too dark
- Too subtle
- Too volume-sensitive

## 11. Experimental Questions Still Open

1. Is B500K enough series resistance to make Nashville effectively absent at blend = 0?
2. Would B1M linear be a better final Nashville blend pot?
3. Is the linear taper acceptable when the Nashville pot becomes a conventional solo volume?
4. Does the outer volume behave acceptably as a functional master volume for the blended system?
5. Does Nashville become disproportionately strong as the outer volume is rolled down?
6. Are the four loaded 5-way voice positions sufficiently distinct?
7. Do any of the RC positions create excessive output loss?
8. Does the global voice network remain useful with Nashville solo?
9. Is an RLC / Varitone-style network worth testing after this RC version?

## 12. Current Reference Implementation

For the immediate build, use:

- Conventional 3-way outer pickup selector
- Conventional outer volume
- DPDT push-pull on outer volume:
  - Down = outer branch connected + Nashville third lug floating
  - Up = outer branch disconnected + Nashville third lug grounded
- Nashville B500K linear:
  - Input lug = Nashville hot
  - Output/wiper = combined bus
  - Third lug = floating in blend mode, grounded in Nashville Solo mode
- No outer mixing resistor
- No treble bleed
- 5-way Super Switch
- Global RC voice network:
  - P1 bypass
  - P2 470K + 2.2 nF
  - P3 220K + 4.7 nF
  - P4 100K + 10 nF
  - P5 47K + 22 nF
- RC pairs wired in series from combined signal bus to ground

This configuration is explicitly a **bench-test reference implementation**, not yet a finalized Coupeville Velvet production standard.
