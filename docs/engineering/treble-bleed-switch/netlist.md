# Switchable treble bleed netlist (Direct / Off / Reactive)

**Revision:** 1.0

**Status:** Validated 2026-11-23 (owner-reported; no measurements recorded). The circuit is stated in [Relay switchable treble bleed](../relay-switchable-treble-bleed.md); this file is its netlist and the single source for `netlist.mjs` and `check-netlist.mjs` in this folder. Expected values in the checker are typed from this file, not computed from the model.

The circuit is general: any guitar with a master volume and a master tone can use it. Lipstick is the worked example. This file uses generic terminal names and maps them to the [Relay Lipstick reference circuit](../relay-lipstick-reference.md) nets `BUS` and `OUT`.

## Parts

- Volume pot (`VOL`). Tone pot (`TONE`). Both are the same taper family as the host guitar's stock controls.
- Tone capacitor `C22`, 22 nF, from the tone pot's `CCW` end to ground.
- Bleed resistor `RB` and bleed capacitor `CB`, in series. `RB.1` is on `OUT`. `RB.2` and `CB.1` are joined as `TB-MID`. `CB.2` goes to the switch common `SW.C`.
- Three-position on-off-on mini-toggle (SPDT). Labels, in this order: **Direct**, **Off**, **Reactive**.
- Selector common `SEL.C`; output jack `JACK.TIP` and `JACK.SLV`.

### Values by volume pot

| Volume pot | `RB`   | `CB` | `C22` |
| ---------- | ------ | ---- | ----- |
| 500k       | 150 kΩ | 1 nF | 22 nF |
| 250k       | 68 kΩ  | 1 nF | 22 nF |
| 1M         | 330 kΩ | 1 nF | 22 nF |

## Lug naming

Pot ends are named by behavior, not by printed lug number, because manufacturers number lugs differently. Identify the lugs by continuity.

- **Volume.** `VOL.IN` is the end the wiper reaches at volume 10. `VOL.GND` is the end it reaches at volume 0. `VOL.W` is the wiper.
- **Tone.** `TONE.CW` is the end the wiper reaches at tone 10; it is the Reactive feed. `TONE.CCW` is the end the wiper reaches at tone 0; it goes through the 22 nF capacitor to ground. `TONE.W` is the wiper.

Rear view, shaft pointing away, lugs down: physical left, center and right are `CW`, wiper and `CCW`.

- Volume: `VOL.IN` / `VOL.W` / `VOL.GND`. On Lipstick this is `BUS` / `OUT` / `GND`.
- Tone: `TONE.CW` to the switch Reactive throw / `TONE.W` to `BUS` / `TONE.CCW` to the 22 nF capacitor.

## Operating states

The switch common `SW.C` is the far end of the bleed. The near end, `RB.1`, is always on `OUT`.

| Mode     | Where the bleed goes                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Direct   | `OUT` to `RB` to `CB` to `SW.C` to `SW.DIRECT` on `BUS`. A conventional treble bleed across the volume pot.                     |
| Off      | `SW.C` lands on `SW.OFF`, which connects to nothing. The bleed branch is open. The tone circuit works as a normal tone control. |
| Reactive | `OUT` to `RB` to `CB` to `SW.C` to `SW.REACTIVE` on `TONE.CW`. The bleed is fed from the tone pot's spare end.                  |

In every mode the tone wiper `TONE.W` is on `BUS`, and the tone sweep is the track resistance from `TONE.W` to `TONE.CCW` in series with `C22` to ground, which is unchanged by the switch. At tone 10 the wiper reaches `TONE.CW`, so Reactive then joins `BUS` directly (0 Ω) and matches Direct. At tone 0 the wiper is at `TONE.CCW`, so the Reactive branch is fed through the full track. At volume 10 `VOL.W` reaches `VOL.IN`, so `OUT` is `BUS` and all three modes coincide.

## Switch contacts

| Mode     | Contact                 | Net     |
| -------- | ----------------------- | ------- |
| Direct   | `SW.C` to `SW.DIRECT`   | `BUS`   |
| Off      | `SW.C` to `SW.OFF`      | (open)  |
| Reactive | `SW.C` to `SW.REACTIVE` | `REACT` |

## Netlist

| Net        | Connected terminals                      |
| ---------- | ---------------------------------------- |
| `BUS`      | `SEL.C`, `VOL.IN`, `TONE.W`, `SW.DIRECT` |
| `OUT`      | `VOL.W`, `JACK.TIP`, `RB.1`              |
| `TB-MID`   | `RB.2`, `CB.1`                           |
| `TB-SW`    | `CB.2`, `SW.C`                           |
| `TONE-CAP` | `TONE.CCW`, `C22.HOT`                    |
| `REACT`    | `TONE.CW`, `SW.REACTIVE`                 |
| `GND`      | `VOL.GND`, `C22.GND`, `JACK.SLV`         |

`SW.OFF` connects to nothing. The model records it as the one-terminal net `OPEN` so that every terminal sits on exactly one net.

## Equivalences

- Tone 10 with Direct: `TONE.W` is `TONE.CW`, so Reactive and Direct are the same circuit.
- Volume 10 in any mode: `OUT` is `BUS`, so the three modes are the same circuit.
- Off with the tone pot: wiper to `TONE.CCW` is `track x tone / 10`, the same sweep as the unmodified Lipstick tone control (see [Relay Lipstick reference circuit](../relay-lipstick-reference.md)).

## Mapping to Lipstick

| Generic    | Lipstick                                          |
| ---------- | ------------------------------------------------- |
| `BUS`      | `BUS` (selector common, volume input, tone wiper) |
| `OUT`      | `OUT` (volume wiper, jack tip)                    |
| `TONE-CAP` | Former `T-W` net, now on the tone `CCW` end       |
| `GND`      | `GND`                                             |

Lipstick's stock tone pot has `BUS` on its `CCW` lug and the 22 nF capacitor on the wiper. This circuit swaps them: the wiper goes to `BUS`, the `CCW` end goes through the capacitor, and the `CW` end, unused on stock, becomes the Reactive feed.

## Notes

- `TB-MID`, `TB-SW`, `TONE-CAP` and `REACT` are labels added here for the netlist.
- The push-push switch functions on Lipstick are unchanged and are not modeled here.
- Some switches have the common on a different lug; identify the common, and the two throws, by continuity in all three positions.
- Switch hole: a common mini toggle needs a 6 mm hole (owner-provided, 2026-11-23). The hole is sized for the switch actually bought, so measure it first.
