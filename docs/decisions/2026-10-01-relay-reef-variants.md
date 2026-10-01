# Relay Reef variants

- **Date:** 2026-10-01
- **Status:** approved by owner 2026-10-01. Relay Reef: proposed circuit documented, not built. Relay Reef Plus: approved in principle; pot sourcing open.
- **Supersedes:** the earlier Relay Reef registry entry (5-way selector, concentric volume and tone), which predated the Coupeville Reef prototype results.

## Decision

The Relay gets a Reef model adapted from the [Coupeville Reef reference design](../engineering/coupeville-reef/reference-design.md), in two trims that share the pickups and selector and differ only in controls:

- **Relay Reef.** Two knobs: lipstick volume and humbucker volume, both B1M linear, wired reverse-independent. No tone. Netlist: [Relay Reef reference circuit](../engineering/relay-reef-reference.md).
- **Relay Reef Plus.** Two concentric pots: volume and tone for each side. Each tone acts only on its own side, before that side's volume.

Both trims:

- **Pickups.** GFS Vintage ’59 humbucker in the bridge, always on its own volume. GFS Pro Tube lipsticks, around 6 kΩ, in the neck and middle.
- **Selector.** A 3-way blade with the same three states as the Coupeville selector: neck lipstick, both lipsticks, or middle lipstick. The blade points toward the lipstick it selects.

## Why

- The Relay body has room for two knobs and a blade. The Coupeville three-knob layout does not fit.
- The owner wanted the Vintage ’59 over the Classic II, which may be too tame for enough contrast with the lipsticks.
- The owner chose the names "Reef" and "Reef Plus".

## Consequences

- The Relay Reef registry entry changes from a 5-way selector with concentric controls to a 3-way blade, and the voicing page, parts list, and wiring page document the two-volume trim.
- Relay Reef has no tone control. It is expected to be slightly brighter than Coupeville Reef with its tone fully up.
- Relay Reef Plus needs its own registry entry, voicing page, parts list, netlist, diagram, and wiring page once its pots are chosen.

## References

- [Coupeville Reef reference design](../engineering/coupeville-reef/reference-design.md)
- [Relay Reef reference circuit](../engineering/relay-reef-reference.md)
- [Relay Reef wiring page](../../content/relay/wiring/reef.mdx)

## Open questions

- **Reef Plus pots.** Stock concentric pots come as 250k/500k or 500k/500k audio taper. Reef's volumes must be 1 MΩ linear (CRL-019 through CRL-023), and its tones are audio taper. A 1 MΩ linear volume with a 1 MΩ audio tone on one concentric shaft is not a stock part.
- **Relay build.** Neither trim has been built as a Relay; both stay `lab` until one is.
