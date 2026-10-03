# Relay Reef variants

- **Date:** 2026-10-01
- **Status:** approved by owner 2026-10-01; Reef Plus pots chosen 2026-10-02. Both trims: proposed circuits documented, not built.
- **Supersedes:** the earlier Relay Reef registry entry (5-way selector, concentric volume and tone), which predated the Coupeville Reef prototype results.

## Decision

The Relay gets a Reef model adapted from the [Coupeville Reef reference design](../engineering/coupeville-reef/reference-design.md), in two trims that share the pickups and selector and differ only in controls:

- **Relay Reef.** Two knobs: lipstick volume and humbucker volume, both B1M linear, wired reverse-independent. No tone. Netlist: [Relay Reef reference circuit](../engineering/relay-reef-reference.md).
- **Relay Reef Plus.** Two stock 500k/500k audio-taper concentric pots: volume and tone for each side. Each tone is wired to its own side, before that side's volume. With that side's volume up, its tone also acts on the whole output; the owner accepted this interaction on 2026-10-03 rather than add isolation resistors or use a master tone. Netlist: [Relay Reef Plus reference circuit](../engineering/relay-reef-plus-reference.md).

Both trims:

- **Pickups.** GFS Vintage ’59 humbucker in the bridge, always on its own volume. GFS Pro Tube lipsticks, around 6 kΩ, in the neck and middle.
- **Selector.** A 3-way blade with the same three states as the Coupeville selector: neck lipstick, both lipsticks, or middle lipstick. The blade points toward the lipstick it selects.

## Why

- The Relay body has room for two knobs and a blade. The Coupeville three-knob layout does not fit.
- The owner wanted the Vintage ’59 over the Classic II, which may be too tame for enough contrast with the lipsticks.
- The owner chose the names "Reef" and "Reef Plus".
- For Reef Plus, the owner chose stock 500k/500k audio concentric pots (2026-10-02) over a 1M/1M linear concentric or a custom 1M linear/audio part. The stock part is easy to buy; the cost is a likely uneven volume sweep (CRL-019) and a darker sound than Relay Reef.

## Consequences

- The Relay Reef registry entry changes from a 5-way selector with concentric controls to a 3-way blade, and the voicing page, parts list, and wiring page document the two-volume trim.
- Relay Reef has no tone control. It is expected to be slightly brighter than Coupeville Reef with its tone fully up.
- Relay Reef Plus has its own registry entry, voicing page, parts list, netlist, diagram, and wiring page.
- If the first Reef Plus build shows the CRL-019 sweep, revisit the pot choice.

## References

- [Coupeville Reef reference design](../engineering/coupeville-reef/reference-design.md)
- [Relay Reef reference circuit](../engineering/relay-reef-reference.md)
- [Relay Reef wiring page](../../content/relay/wiring/reef.mdx)
- [Relay Reef Plus reference circuit](../engineering/relay-reef-plus-reference.md)
- [Relay Reef Plus wiring page](../../content/relay/wiring/reef-plus.mdx)

## Open questions

- **Reef Plus volume sweep.** Audio-taper branch volumes gave a non-monotonic sweep on the Coupeville prototype (CRL-019). Validate on the first Reef Plus build.
- **Reef Plus knob convention.** Volume on the upper knob and tone on the lower knob is suggested, not decided.
- **Relay build.** Neither trim has been built as a Relay; both stay `lab` until one is.
