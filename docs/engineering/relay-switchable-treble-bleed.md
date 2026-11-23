# Relay switchable treble bleed

**Date:** 2026-11-22  
**Status:** Approved design direction. Hardware implementation and bench validation pending.  
**Supersedes:** Fixed treble-bleed choices as the design direction for Relay models with a master volume. The linked reference circuits document the current revisions.

## Decision

Standardize a three-position **Direct / Off / Reactive** mini-toggle on Relay models with a master volume and master tone. Prototype it on Lipstick first. Direct connects the bleed across the volume input and output. Off opens the bleed branch. Reactive takes its signal from the spare end of the tone pot so the bleed weakens as tone is rolled back. Use functional labels across models.

## Lipstick prototype

- Use an SPDT on–off–on switch and share the existing 150 kΩ resistor and 1 nF capacitor in series. Connect one end of the series network to the volume wiper (lug 2, `OUT`) and the other to the switch common. Connect Direct to the volume input (lug 3, `BUS`) and Reactive to tone lug 3. Lug numbers here follow the prototype convention. Identify the physical lugs by continuity.
- Move `BUS` to the tone wiper (lug 2). Wire tone lug 1 through the stock 22 nF capacitor to ground. At tone 10, the wiper must reach the Reactive throw's lug. This swaps the feed and capacitor connections from the [published Lipstick circuit](relay-lipstick-reference.md) while preserving the tone branch's resistance sweep in Direct and Off.
- Keep the existing volume push-push functions. Use Direct as the reference setting. Direct and Reactive should coincide at tone 10. All three switch positions should coincide at volume 10.

## Model application

| Model | Reference setting and implementation |
| --- | --- |
| [Lipstick](relay-lipstick-reference.md) | **Direct.** Share the stock series network with Reactive. |
| [Arc](relay-arc-reference.md) | **Direct.** Retain the stock parallel RC in that position. Give Reactive a separate network if using series RC. Audition with Arc Mode on and off. |
| [Torch](relay-torch-reference.md) and [Velvet](relay-velvet-reference.md) | **Off.** This preserves the current no-bleed response. Audition Direct and Reactive values in each harness before specifying parts. |
| [Reef](relay-reef-reference.md) and [Reef Plus](relay-reef-plus-reference.md) | Excluded from this decision. Reef lacks a tone pot. Both models sum two independent volumes at a shared output. A bleed across either branch volume can load the other branch at high frequencies when the first branch is at zero. |

## Rationale and bench validation

The Lipstick simulation used all pickups in parallel, with the bridge partially split and the neck at full humbucker. At tone 5 and volume 5, the reactive branch reduced the 4 kHz lift associated with the direct bleed. At tone 8 and volume 8, it increased the simulated 4 kHz loss. Both comparisons were relative to 200 Hz and used volume 10 at the same tone setting as the baseline. The model used estimated pickup impedance, pot taper, and cable loading. These are predictions to test on the guitar.

On Lipstick, level-match and compare the three settings at 5/5 and 8/8, then sweep both controls with the actual cable and amp. Start with the selector centered and lipstick engaged, then check the other pickup settings. Verify the full-volume and full-tone equivalences and listen for switching noise. Confirm switch mounting and clearance before making the feature standard on production hardware. Arc’s reactive values and both bleed modes on Torch and Velvet remain open until auditioned.
