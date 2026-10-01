# Wiring page check (TypeSafe pilot)

Generated 2026-10-01 by `scripts/typesafe/check-wiring-pages.mjs` with model `jev-1.13.0`.

Each published wiring page is checked against the engineering document that holds its netlist, which [the wiring-diagram workflow](wiring-diagrams.md) makes the circuit source of truth. This report only proposes fixes; it edits no page, diagram, or netlist. A "supports" verdict is not a bench test, and it does not check the diagram image.

## Method

- Code splits each page into claims: one per sentence or table row. A sentence from a longer paragraph or list item carries that unit as context, so pronouns still resolve. For STR26001 and STR26002 the claims come from the data in `lib/instruments/wiring-reference.ts` that the `/sn/<serial>/wiring` pages render.
- Code compares every component value (capacitors, resistors, pot values and tapers) and every net label on the page with the netlist document. A value or label that the document lacks is a priority-1 flag. No model is involved.
- Code also compares the operating-state and switch-contact tables cell by cell with the matching netlist tables. A state cell is reduced to the pickups it selects and their modifiers (split, series, contour); a contact cell is reduced to its net labels. No model is involved.
- TypeSafe reads each claim against the full netlist document and answers one Choice: supports, contradicts, or says nothing. Claims are sent as parallel questions over one shared state, up to 40 per request.

## Summary

- Pages checked: 6. Claims: 353. Priority 1: 0. Priority 2: 44. Priority 3: 11. Supported: 298.
- Requests: 11. Input tokens: 105,927 (about $0.0044 at $0.042/Mtok). Latency per request: median 187 ms, max 444 ms.
- Tables compared in code: 10, covering 106 cells. Mismatches: 0.

| Page                                                      | Claims | Supports | Contradicts | Says nothing | Code flags |
| --------------------------------------------------------- | ------ | -------- | ----------- | ------------ | ---------- |
| [Relay Torch](../../content/relay/wiring/torch.mdx)       | 63     | 60       | 1           | 2            | 0          |
| [Relay Arc](../../content/relay/wiring/arc.mdx)           | 94     | 91       | 2           | 1            | 0          |
| [STR26001](../../lib/instruments/wiring-reference.ts)     | 33     | 33       | 0           | 0            | 0          |
| [STR26002](../../lib/instruments/wiring-reference.ts)     | 26     | 26       | 0           | 0            | 0          |
| [Relay Lipstick](../../content/relay/wiring/lipstick.mdx) | 70     | 59       | 0           | 11           | 0          |
| [Relay Velvet](../../content/relay/wiring/velvet.mdx)     | 67     | 57       | 0           | 10           | 0          |

## Thresholds

| Measure            | min  | p10  | p25  | median | p75  | max  |
| ------------------ | ---- | ---- | ---- | ------ | ---- | ---- |
| Verdict confidence | 0.09 | 0.47 | 0.91 | 0.99   | 1.00 | 1.00 |

Confidence is bimodal: three quarters of verdicts are at 0.9 or above, and the rest trail down toward 0.05. A verdict below 0.6 goes to human review (priority 2), including a low-confidence "contradicts". A "contradicts" at 0.6 or above is priority 1. In the 2026-10-01 runs, no "contradicts" verdict that survived review was a real wiring error; the one that reached 0.83 came from ambiguous netlist wording, which was then clarified.

## Table comparison (code)

| Page           | Table                 | Cells compared | Result    |
| -------------- | --------------------- | -------------- | --------- |
| Relay Torch    | Operating states      | 10             | All match |
| Relay Arc      | Operating states      | 10             | All match |
| Relay Arc      | Super-switch contacts | 24             | All match |
| Relay Arc      | Push-pull contacts    | 6              | All match |
| STR26001       | Operating states      | 10             | All match |
| STR26001       | Five-way contacts     | 20             | All match |
| STR26002       | Operating states      | 10             | All match |
| STR26002       | Five-way contacts     | 5              | All match |
| Relay Lipstick | Operating states      | 6              | All match |
| Relay Velvet   | Operating states      | 5              | All match |

## Priority 1: value or label mismatches and confident contradictions

A component value or net label on the page is missing from the netlist document, or TypeSafe reads the document as contradicting the claim at confidence 0.6 or above.

None.

## Priority 2: uncertain verdicts

TypeSafe's confidence is below 0.6. A person should read the claim against the netlist.

| Page           | Section                        | Claim                                                                                                                                                               | Verdict (p, conf.)       | Flags                                |
| -------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------ |
| Relay Lipstick | Bench checks                   | Turn the knobs from stop to stop: clockwise should increase volume and brighten tone.                                                                               | says nothing (39%, 0.09) | uncertain: says nothing (conf. 0.09) |
| Relay Torch    | Parts and lead identification  | Bridge: GFS VEH humbucker, wired full series in every position.                                                                                                     | contradicts (44%, 0.17)  | uncertain: contradicts (conf. 0.17)  |
| STR26002       | Parts                          | Standard five-way blade and latching SPST on-off micro switch.                                                                                                      | supports (46%, 0.18)     | uncertain: supports (conf. 0.18)     |
| Relay Torch    | Parts and lead identification  | Neck: GFS Professional Series Alnico II humbucker, wired full series in every position.                                                                             | supports (47%, 0.21)     | uncertain: supports (conf. 0.21)     |
| Relay Velvet   | (introduction)                 | This is the bench-side reference for the Relay Velvet harness.                                                                                                      | supports (47%, 0.21)     | uncertain: supports (conf. 0.21)     |
| STR26001       | Parts                          | Four-pole five-way super switch and latching DPDT on-on micro switch.                                                                                               | supports (47%, 0.22)     | uncertain: supports (conf. 0.22)     |
| Relay Velvet   | Reference Labels               | `MP-G`: Middle Pickup (Retrotron Nashville) (black wire), Ground wire.                                                                                              | supports (49%, 0.23)     | uncertain: supports (conf. 0.23)     |
| Relay Arc      | What each switch position does | Selected pickups combine in parallel.                                                                                                                               | contradicts (51%, 0.25)  | uncertain: contradicts (conf. 0.25)  |
| Relay Velvet   | Reference Labels               | `BP-H`: Bridge Pickup (red wire), Hot output wire.                                                                                                                  | supports (52%, 0.27)     | uncertain: supports (conf. 0.27)     |
| STR26001       | Selector contacts              | In each blade position, each pole common closes to one numbered throw.                                                                                              | supports (51%, 0.28)     | uncertain: supports (conf. 0.28)     |
| Relay Velvet   | Reference Labels               | `NP-H`: Neck Pickup (red wire), Hot output wire.                                                                                                                    | says nothing (52%, 0.28) | uncertain: says nothing (conf. 0.28) |
| Relay Torch    | Bench checks                   | Listen to all pickup combinations for unexpected cancellation and verify that rolling down volume cleans up without a treble-bleed network.                         | supports (53%, 0.29)     | uncertain: supports (conf. 0.29)     |
| Relay Velvet   | Reference Labels               | `NP-G`: Neck Pickup (black wire), Ground wire.                                                                                                                      | supports (53%, 0.30)     | uncertain: supports (conf. 0.30)     |
| Relay Arc      | Bench checks                   | Audition the treble bleed as volume rolls down before final installation.                                                                                           | supports (54%, 0.31)     | uncertain: supports (conf. 0.31)     |
| Relay Torch    | Bench checks                   | At volume zero, the tip should reach ground.                                                                                                                        | supports (55%, 0.32)     | uncertain: supports (conf. 0.32)     |
| Relay Velvet   | Pickup Layout                  | Middle: `GFS Retrotron Nashville`, middle cavity, primary Velvet voice.                                                                                             | says nothing (56%, 0.34) | uncertain: says nothing (conf. 0.34) |
| Relay Velvet   | Reference Labels               | `MP-H`: Middle Pickup (Retrotron Nashville) (red wire), Hot output wire.                                                                                            | supports (56%, 0.34)     | uncertain: supports (conf. 0.34)     |
| Relay Velvet   | Sanity Checks                  | Tap test: Plug into an amp at low volume and tap each pickup with a metal screwdriver.                                                                              | says nothing (56%, 0.34) | uncertain: says nothing (conf. 0.34) |
| Relay Lipstick | Parts and lead identification  | These are starting values to audition with the actual cable and amplifier.                                                                                          | supports (56%, 0.35)     | uncertain: supports (conf. 0.35)     |
| Relay Velvet   | Reference Labels               | `BP-G`: Bridge Pickup (black wire), Ground wire.                                                                                                                    | supports (57%, 0.35)     | uncertain: supports (conf. 0.35)     |
| Relay Torch    | Bench checks                   | With the volume full up, confirm no near-zero-ohm short from jack tip to sleeve.                                                                                    | supports (57%, 0.36)     | uncertain: supports (conf. 0.36)     |
| Relay Lipstick | Bench checks                   | Meter the push-push in both states against the contact map above.                                                                                                   | supports (58%, 0.36)     | uncertain: supports (conf. 0.36)     |
| Relay Lipstick | Build sequence                 | Identify each pickup's hot, return, shield, and series junction from its supplied lead guide and a meter.                                                           | supports (58%, 0.37)     | uncertain: supports (conf. 0.37)     |
| Relay Arc      | What each switch position does | It is not the 22 nF tone capacitor or the 1 nF treble-bleed capacitor.                                                                                              | supports (59%, 0.38)     | uncertain: supports (conf. 0.38)     |
| Relay Lipstick | Bench checks                   | Tap-test the pickups through a low-volume amplifier in all six states.                                                                                              | says nothing (59%, 0.39) | uncertain: says nothing (conf. 0.39) |
| Relay Velvet   | Sanity Checks                  | Continuity: In each selector position, `SW-OUT` should connect only to the expected pickup lug or lugs.                                                             | supports (59%, 0.39)     | uncertain: supports (conf. 0.39)     |
| Relay Arc      | Build sequence                 | Verify selection before adding Arc Mode.                                                                                                                            | supports (60%, 0.41)     | uncertain: supports (conf. 0.41)     |
| Relay Lipstick | Bench checks                   | The jack tip must not have a near-zero-ohm short to sleeve with the volume up.                                                                                      | says nothing (61%, 0.41) | uncertain: says nothing (conf. 0.41) |
| Relay Lipstick | Bench checks                   | At maximum volume, the jack's DC reading should be near the selected pickup resistance in parallel with the 500 kΩ volume pot.                                      | says nothing (61%, 0.42) | uncertain: says nothing (conf. 0.42) |
| Relay Arc      | Build sequence                 | Wire the selector audio poles A and B to produce the five full-pickup selections.                                                                                   | supports (61%, 0.43)     | uncertain: supports (conf. 0.43)     |
| Relay Arc      | Build sequence                 | Wire Dream `D-J` to C throws 2–3 and Vintage `V-J` to D throws 4–5.                                                                                                 | supports (63%, 0.44)     | uncertain: supports (conf. 0.44)     |
| STR26001       | Connection map                 | TC_J: The A500K tone wiper runs through the 22 nF capacitor to GND. The tone pot CCW lug takes BUS; its CW lug is unused.                                           | supports (62%, 0.44)     | uncertain: supports (conf. 0.44)     |
| Relay Lipstick | Bench checks                   | With power disconnected, meter the selector: common `C` connects to bridge, both bridge and neck, then neck in the three positions.                                 | supports (64%, 0.46)     | uncertain: supports (conf. 0.46)     |
| Relay Lipstick | Build sequence                 | GFS lead versions differ; the wire colors in an older diagram may not match the pickups in hand.                                                                    | says nothing (64%, 0.47) | uncertain: says nothing (conf. 0.47) |
| Relay Lipstick | Bench checks                   | Confirm continuity among all intended ground points.                                                                                                                | says nothing (65%, 0.47) | uncertain: says nothing (conf. 0.47) |
| Relay Velvet   | Pickup Layout                  | Neck: `GFS Professional Series Alnico II Humbucker`, neck cavity, warmest voice.                                                                                    | says nothing (65%, 0.47) | uncertain: says nothing (conf. 0.47) |
| Relay Torch    | What each switch position does | This passive contour removes some low-frequency energy relative to the highs; it does not add gain.                                                                 | says nothing (67%, 0.50) | uncertain: says nothing (conf. 0.50) |
| Relay Lipstick | What each switch position does | The volume knob controls output level, and the tone knob rolls off high frequencies when turned counterclockwise.                                                   | supports (66%, 0.50)     | uncertain: supports (conf. 0.50)     |
| Relay Velvet   | Pickup Layout                  | Bridge: `GFS Professional Series Alnico II Humbucker`, bridge cavity, clearest rhythm voice.                                                                        | says nothing (67%, 0.50) | uncertain: says nothing (conf. 0.50) |
| Relay Arc      | (introduction)                 | Pulling the A500k tone control engages Arc Mode: the Liverpool takes a 680 pF series path, while the selected Dream 180 or Vintage ’59 can receive a partial split. | contradicts (67%, 0.51)  | uncertain: contradicts (conf. 0.51)  |
| Relay Arc      | Bench checks                   | Capacitors block steady DC after a meter settles; use measured parts rather than fixed pickup-resistance targets.                                                   | says nothing (68%, 0.52) | uncertain: says nothing (conf. 0.52) |
| Relay Arc      | Bench checks                   | Confirm every designated ground reaches jack sleeve and that jack tip does not have a near-zero-ohm short to sleeve with volume up.                                 | supports (69%, 0.54)     | uncertain: supports (conf. 0.54)     |
| STR26002       | Parts                          | A250K audio-taper master volume, A500K audio-taper master tone, 22 nF (0.022 µF) non-polarized tone capacitor, and mono output jack.                                | supports (72%, 0.57)     | uncertain: supports (conf. 0.57)     |
| Relay Arc      | Arc Mode push-pull contacts    | Down, `L` meets `L-H` directly and `SPLIT` floats.                                                                                                                  | supports (71%, 0.58)     | uncertain: supports (conf. 0.58)     |

## Priority 3: not covered by the netlist document

Confident "says nothing" verdicts. Most are assembly or test advice the netlist does not need to cover; any that state a circuit fact are gaps in the netlist document.

| Page           | Section        | Claim                                                                                                                                                                | Verdict (p, conf.)        | Flags                       |
| -------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | --------------------------- |
| Relay Lipstick | Bench checks   | Pickup and pot tolerances change the exact result, so use the measured parts rather than fixed resistance targets.                                                   | says nothing (74%, 0.61)  | not in the netlist document |
| Relay Torch    | Bench checks   | DC resistance varies with pickup and pot tolerances; measure the isolated pickups rather than using fixed advertised resistances as pass/fail limits.                | says nothing (84%, 0.76)  | not in the netlist document |
| Relay Lipstick | Build sequence | Verify these paths before adding the lipstick branch.                                                                                                                | says nothing (86%, 0.80)  | not in the netlist document |
| Relay Lipstick | Build sequence | Check the complete harness on the bench in all six operating states before installing it in the guitar.                                                              | says nothing (93%, 0.88)  | not in the netlist document |
| Relay Velvet   | Control Layout | This is the main Velvet destination.                                                                                                                                 | says nothing (93%, 0.89)  | not in the netlist document |
| Relay Lipstick | Bench checks   | The capacitors block steady DC after the meter settles.                                                                                                              | says nothing (93%, 0.90)  | not in the netlist document |
| Relay Velvet   | Build Outline  | Shield the cavity first: Velvet is meant to stay exposed and clean, so start with shielding before you mount anything.                                               | says nothing (95%, 0.92)  | not in the netlist document |
| Relay Velvet   | Sanity Checks  | Resistance: With volume full up, measure between `J-TIP` and `J-SLV`.                                                                                                | says nothing (95%, 0.93)  | not in the netlist document |
| Relay Lipstick | Bench checks   | Check relative pickup phase in combined positions and audition the treble bleed as volume rolls down before final installation.                                      | says nothing (100%, 0.99) | not in the netlist document |
| Relay Velvet   | Sanity Checks  | Expect roughly 8.6 kOhm in position 1, 8.0 kOhm in position 3, and 7.6 kOhm in position 5, with positions 2 and 4 reading lower because the pickups are in parallel. | says nothing (99%, 0.99)  | not in the netlist document |
| Relay Velvet   | Build Outline  | Install only after the harness passes a meter check and tap test: The cavity is the wrong place to discover a bad selector joint.                                    | says nothing (100%, 1.00) | not in the netlist document |

## Limits

- The diagram images are not checked. TypeSafe reads text only, and the Torch and Arc diagrams have no text source in the repository.
- TypeSafe judges claims one at a time and the table comparison checks one table at a time. Neither traces a full circuit path, so a page can be wrong in a way that no single claim or cell reveals.
- The Relay Lipstick netlist is a text form of its approved diagram. The Relay Velvet netlist was transcribed from its page, so the Velvet check is circular until that netlist has an independent source.
- "Supports" means the netlist document agrees with the page text. It is not evidence that a physical harness was built or measured.
