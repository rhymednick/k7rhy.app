# Relay switchable treble bleed

**Date:** 2026-11-22  
**Status:** Validated 2026-11-23 (owner-reported; no measurements recorded). Offered as an alternative tone wiring, not a standard build, because it needs a switch hole.  
**Supersedes:** The 2026-11-22 direction to standardize the switch across Relay models with a master volume. The linked reference circuits document the current revisions.

**See also:** [netlist, switch contacts and checks](treble-bleed-switch/netlist.md); published pages [how treble bleeds work](https://k7rhy.app/guitars/relay/customize/how-treble-bleeds-work) and [the Direct / Off / Reactive switch retrofit](https://k7rhy.app/guitars/relay/customize/direct-off-reactive-switch).

## Decision

Offer a three-position **Direct / Off / Reactive** mini-toggle on Relay models with a master volume and master tone, as an alternative tone wiring. Lipstick is the validated reference. Direct connects the bleed across the volume input and output. Off opens the bleed branch. Reactive takes its signal from the spare end of the tone pot so the bleed weakens as tone is rolled back. Use functional labels across models.

## Lipstick reference

- Use an SPDT on–off–on switch and share the existing 150 kΩ resistor and 1 nF capacitor in series. Connect one end of the series network to the volume wiper (lug 2, `OUT`) and the other to the switch common. Connect Direct to the volume input (`BUS`) and Reactive to `TONE.CW`. Pot ends are named by behavior in the [netlist](treble-bleed-switch/netlist.md): the tone end the wiper reaches at tone 10 (`TONE.CW`) is the Reactive feed, and the end it reaches at tone 0 (`TONE.CCW`) goes through the capacitor to ground. Identify the physical lugs by continuity.
- Move `BUS` to the tone wiper. Wire `TONE.CCW` through the stock 22 nF capacitor to ground. At tone 10, the wiper reaches `TONE.CW`, the Reactive feed. This swaps the feed and capacitor connections from the [published Lipstick circuit](relay-lipstick-reference.md) while preserving the tone branch's resistance sweep in Direct and Off.
- Keep the existing volume push-push functions. Use Direct as the reference setting. Direct and Reactive should coincide at tone 10. All three switch positions should coincide at volume 10.

## Model application

Lipstick is the validated reference. No model adopts the switch as standard, because it needs a switch hole.

| Model                                                                         | Application                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Lipstick](relay-lipstick-reference.md)                                       | **Direct** is the reference setting. Share the stock series network with Reactive. Values by volume pot: 500k = 150 kΩ + 1 nF; 250k = 68 kΩ + 1 nF; 1M = 330 kΩ + 1 nF; tone cap 22 nF.                             |
| [Arc](relay-arc-reference.md)                                                 | Not specified. The stock parallel RC could stay in Direct, with a separate network for Reactive.                                                                                                                    |
| [Torch](relay-torch-reference.md) and [Velvet](relay-velvet-reference.md)     | Not specified. Off preserves the current no-bleed response.                                                                                                                                                         |
| [Reef](relay-reef-reference.md) and [Reef Plus](relay-reef-plus-reference.md) | Excluded. Reef lacks a tone pot. Both models sum two independent volumes at a shared output, so a bleed across either branch volume can load the other branch at high frequencies when the first branch is at zero. |

## Design-time rationale (history)

The text below is the original design-time reasoning. The circuit has since been validated; it is kept for context.

The Lipstick simulation used all pickups in parallel, with the bridge partially split and the neck at full humbucker. At tone 5 and volume 5, the reactive branch reduced the 4 kHz lift associated with the direct bleed. At tone 8 and volume 8, it increased the simulated 4 kHz loss. Both comparisons were relative to 200 Hz and used volume 10 at the same tone setting as the baseline. The model used estimated pickup impedance, pot taper, and cable loading. These are predictions to test on the guitar.

On Lipstick, level-match and compare the three settings at 5/5 and 8/8, then sweep both controls with the actual cable and amp. Start with the selector centered and lipstick engaged, then check the other pickup settings. Verify the full-volume and full-tone equivalences and listen for switching noise. Confirm switch mounting and clearance before making the feature standard on production hardware. Arc’s reactive values and both bleed modes on Torch and Velvet remain open until auditioned.
