# Wiring page check (TypeSafe pilot)

Generated 2026-10-01 by `scripts/typesafe/check-wiring-pages.mjs` with model `jev-1.13.0`.

Each published wiring page is checked against the engineering document that holds its netlist, which [the wiring-diagram workflow](wiring-diagrams.md) makes the circuit source of truth. This report only proposes fixes; it edits no page, diagram, or netlist. A "supports" verdict is not a bench test, and it does not check the diagram image.

## Method

- Code splits each page into claims: one per sentence or table row. A sentence from a longer paragraph or list item carries that unit as context, so pronouns still resolve. For STR26001 and STR26002 the claims come from the data in `lib/instruments/wiring-reference.ts` that the `/sn/<serial>/wiring` pages render.
- Code compares every component value (capacitors, resistors, pot values and tapers) and every net label on the page with the netlist document. A value or label that the document lacks is a priority-1 flag. No model is involved.
- Code also compares the operating-state and switch-contact tables cell by cell with the matching netlist tables. A state cell is reduced to the pickups it selects and their modifiers (split, series, contour); a contact cell is reduced to its net labels. No model is involved.
- TypeSafe reads each claim against the full netlist document and answers one Choice: supports, contradicts, or says nothing. Claims are sent as parallel questions over one shared state, up to 40 per request.

## Summary

- Pages checked: 6. Claims: 337. Priority 1: 0. Priority 2: 37. Priority 3: 11. Supported: 289.
- Requests: 11. Input tokens: 105,620 (about $0.0044 at $0.042/Mtok). Latency per request: median 184 ms, max 483 ms.
- Tables compared in code: 10, covering 106 cells. Mismatches: 0.

| Page                                                      | Claims | Supports | Contradicts | Says nothing | Code flags |
| --------------------------------------------------------- | ------ | -------- | ----------- | ------------ | ---------- |
| [Relay Torch](../../content/relay/wiring/torch.mdx)       | 63     | 60       | 0           | 3            | 0          |
| [Relay Arc](../../content/relay/wiring/arc.mdx)           | 94     | 92       | 1           | 1            | 0          |
| [STR26001](../../lib/instruments/wiring-reference.ts)     | 33     | 32       | 1           | 0            | 0          |
| [STR26002](../../lib/instruments/wiring-reference.ts)     | 26     | 26       | 0           | 0            | 0          |
| [Relay Lipstick](../../content/relay/wiring/lipstick.mdx) | 70     | 60       | 0           | 10           | 0          |
| [Relay Velvet](../../content/relay/wiring/velvet.mdx)     | 51     | 44       | 0           | 7            | 0          |

## Thresholds

| Measure            | min  | p10  | p25  | median | p75  | max  |
| ------------------ | ---- | ---- | ---- | ------ | ---- | ---- |
| Verdict confidence | 0.12 | 0.57 | 0.90 | 0.98   | 1.00 | 1.00 |

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
| Relay Lipstick | Bench checks                   | Turn the knobs from stop to stop: clockwise should increase volume and brighten tone.                                                                               | supports (41%, 0.12)     | uncertain: supports (conf. 0.12)     |
| STR26002       | Parts                          | Standard five-way blade and latching SPST on-off micro switch.                                                                                                      | supports (44%, 0.16)     | uncertain: supports (conf. 0.16)     |
| STR26001       | Parts                          | Four-pole five-way super switch and latching DPDT on-on micro switch.                                                                                               | supports (46%, 0.20)     | uncertain: supports (conf. 0.20)     |
| Relay Torch    | Parts and lead identification  | Neck: GFS Professional Series Alnico II humbucker, wired full series in every position.                                                                             | supports (50%, 0.24)     | uncertain: supports (conf. 0.24)     |
| Relay Torch    | Parts and lead identification  | Bridge: GFS VEH humbucker, wired full series in every position.                                                                                                     | says nothing (51%, 0.26) | uncertain: says nothing (conf. 0.26) |
| Relay Torch    | Bench checks                   | At volume zero, the tip should reach ground.                                                                                                                        | supports (50%, 0.26)     | uncertain: supports (conf. 0.26)     |
| Relay Lipstick | Bench checks                   | Meter the push-push in both states against the contact map above.                                                                                                   | supports (51%, 0.26)     | uncertain: supports (conf. 0.26)     |
| Relay Torch    | Bench checks                   | Listen to all pickup combinations for unexpected cancellation and verify that rolling down volume cleans up without a treble-bleed network.                         | supports (51%, 0.27)     | uncertain: supports (conf. 0.27)     |
| Relay Arc      | What each switch position does | Selected pickups combine in parallel.                                                                                                                               | supports (53%, 0.29)     | uncertain: supports (conf. 0.29)     |
| Relay Lipstick | Bench checks                   | The jack tip must not have a near-zero-ohm short to sleeve with the volume up.                                                                                      | says nothing (54%, 0.30) | uncertain: says nothing (conf. 0.30) |
| Relay Velvet   | Bench checks                   | At volume zero, the tip should reach ground.                                                                                                                        | supports (54%, 0.31)     | uncertain: supports (conf. 0.31)     |
| Relay Arc      | Build sequence                 | Verify selection before adding Arc Mode.                                                                                                                            | supports (55%, 0.32)     | uncertain: supports (conf. 0.32)     |
| Relay Lipstick | Build sequence                 | Identify each pickup's hot, return, shield, and series junction from its supplied lead guide and a meter.                                                           | supports (55%, 0.33)     | uncertain: supports (conf. 0.33)     |
| Relay Lipstick | Bench checks                   | Tap-test the pickups through a low-volume amplifier in all six states.                                                                                              | says nothing (55%, 0.33) | uncertain: says nothing (conf. 0.33) |
| Relay Velvet   | (introduction)                 | Identify the contacts on the parts in hand with a continuity meter.                                                                                                 | supports (55%, 0.33)     | uncertain: supports (conf. 0.33)     |
| Relay Arc      | Bench checks                   | Audition the treble bleed as volume rolls down before final installation.                                                                                           | supports (56%, 0.34)     | uncertain: supports (conf. 0.34)     |
| STR26001       | Selector contacts              | In each blade position, each pole common closes to one numbered throw.                                                                                              | contradicts (55%, 0.34)  | uncertain: contradicts (conf. 0.34)  |
| Relay Torch    | Bench checks                   | With the volume full up, confirm no near-zero-ohm short from jack tip to sleeve.                                                                                    | supports (57%, 0.36)     | uncertain: supports (conf. 0.36)     |
| Relay Velvet   | (introduction)                 | The diagram's colored paths show circuit roles, not guaranteed GFS lead colors.                                                                                     | supports (57%, 0.36)     | uncertain: supports (conf. 0.36)     |
| Relay Torch    | What each switch position does | This passive contour removes some low-frequency energy relative to the highs; it does not add gain.                                                                 | says nothing (59%, 0.39) | uncertain: says nothing (conf. 0.39) |
| Relay Lipstick | Build sequence                 | GFS lead versions differ; the wire colors in an older diagram may not match the pickups in hand.                                                                    | says nothing (59%, 0.40) | uncertain: says nothing (conf. 0.40) |
| Relay Lipstick | Parts and lead identification  | These are starting values to audition with the actual cable and amplifier.                                                                                          | supports (62%, 0.43)     | uncertain: supports (conf. 0.43)     |
| Relay Velvet   | Bench checks                   | Tap-test each pickup at low amplifier volume.                                                                                                                       | says nothing (62%, 0.43) | uncertain: says nothing (conf. 0.43) |
| Relay Lipstick | Bench checks                   | With power disconnected, meter the selector: common `C` connects to bridge, both bridge and neck, then neck in the three positions.                                 | supports (63%, 0.44)     | uncertain: supports (conf. 0.44)     |
| Relay Arc      | What each switch position does | It is not the 22 nF tone capacitor or the 1 nF treble-bleed capacitor.                                                                                              | supports (63%, 0.45)     | uncertain: supports (conf. 0.45)     |
| Relay Arc      | (introduction)                 | Pulling the A500k tone control engages Arc Mode: the Liverpool takes a 680 pF series path, while the selected Dream 180 or Vintage ’59 can receive a partial split. | contradicts (65%, 0.46)  | uncertain: contradicts (conf. 0.46)  |
| Relay Arc      | Build sequence                 | Wire F up through 3.3 kΩ to ground and leave F down open.                                                                                                           | supports (65%, 0.47)     | uncertain: supports (conf. 0.47)     |
| Relay Lipstick | Bench checks                   | Confirm continuity among all intended ground points.                                                                                                                | says nothing (65%, 0.47) | uncertain: says nothing (conf. 0.47) |
| Relay Arc      | Bench checks                   | Capacitors block steady DC after a meter settles; use measured parts rather than fixed pickup-resistance targets.                                                   | says nothing (65%, 0.48) | uncertain: says nothing (conf. 0.48) |
| Relay Arc      | Build sequence                 | Wire the selector audio poles A and B to produce the five full-pickup selections.                                                                                   | supports (66%, 0.49)     | uncertain: supports (conf. 0.49)     |
| Relay Lipstick | What each switch position does | The volume knob controls output level, and the tone knob rolls off high frequencies when turned counterclockwise.                                                   | supports (68%, 0.52)     | uncertain: supports (conf. 0.52)     |
| Relay Lipstick | Bench checks                   | At maximum volume, the jack's DC reading should be near the selected pickup resistance in parallel with the 500 kΩ volume pot.                                      | says nothing (69%, 0.53) | uncertain: says nothing (conf. 0.53) |
| Relay Velvet   | Build outline                  | Identify the pickup leads and the actual five-way contacts by continuity.                                                                                           | supports (69%, 0.53)     | uncertain: supports (conf. 0.53)     |
| Relay Torch    | Parts and lead identification  | Middle: GFS Mean 90 P90-type pickup, with hot, return, and shield or case ground as supplied.                                                                       | supports (71%, 0.57)     | uncertain: supports (conf. 0.57)     |
| Relay Arc      | Bench checks                   | At volume zero, jack tip should reach ground through the volume wiper.                                                                                              | supports (71%, 0.57)     | uncertain: supports (conf. 0.57)     |
| Relay Lipstick | Bench checks                   | Pickup and pot tolerances change the exact result, so use the measured parts rather than fixed resistance targets.                                                  | says nothing (72%, 0.57) | uncertain: says nothing (conf. 0.57) |
| Relay Arc      | Build sequence                 | Wire Dream `D-J` to C throws 2–3 and Vintage `V-J` to D throws 4–5.                                                                                                 | supports (72%, 0.58)     | uncertain: supports (conf. 0.58)     |

## Priority 3: not covered by the netlist document

Confident "says nothing" verdicts. Most are assembly or test advice the netlist does not need to cover; any that state a circuit fact are gaps in the netlist document.

| Page           | Section                        | Claim                                                                                                                                                 | Verdict (p, conf.)        | Flags                       |
| -------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | --------------------------- |
| Relay Velvet   | What each switch position does | Position 3 is the main Velvet destination.                                                                                                            | says nothing (75%, 0.63)  | not in the netlist document |
| Relay Lipstick | Build sequence                 | Verify these paths before adding the lipstick branch.                                                                                                 | says nothing (83%, 0.75)  | not in the netlist document |
| Relay Velvet   | (introduction)                 | Position 3, the Nashville alone, is the main Velvet voice.                                                                                            | says nothing (87%, 0.81)  | not in the netlist document |
| Relay Torch    | Bench checks                   | DC resistance varies with pickup and pot tolerances; measure the isolated pickups rather than using fixed advertised resistances as pass/fail limits. | says nothing (89%, 0.83)  | not in the netlist document |
| Relay Lipstick | Bench checks                   | The capacitors block steady DC after the meter settles.                                                                                               | says nothing (92%, 0.88)  | not in the netlist document |
| Relay Velvet   | Build outline                  | Velvet is meant to stay exposed and clean, so start with shielding before you mount anything.                                                         | says nothing (93%, 0.89)  | not in the netlist document |
| Relay Lipstick | Build sequence                 | Check the complete harness on the bench in all six operating states before installing it in the guitar.                                               | says nothing (95%, 0.91)  | not in the netlist document |
| Relay Velvet   | Build outline                  | Shield the cavity first.                                                                                                                              | says nothing (95%, 0.91)  | not in the netlist document |
| Relay Velvet   | Build outline                  | Install the harness only after it passes the meter check and tap test.                                                                                | says nothing (98%, 0.98)  | not in the netlist document |
| Relay Lipstick | Bench checks                   | Check relative pickup phase in combined positions and audition the treble bleed as volume rolls down before final installation.                       | says nothing (100%, 0.99) | not in the netlist document |
| Relay Velvet   | Build outline                  | The cavity is the wrong place to discover a bad selector joint.                                                                                       | says nothing (100%, 1.00) | not in the netlist document |

## Limits

- The diagram images are not checked. TypeSafe reads text only, and the Torch and Arc diagrams have no text source in the repository.
- TypeSafe judges claims one at a time and the table comparison checks one table at a time. Neither traces a full circuit path, so a page can be wrong in a way that no single claim or cell reveals.
- The Relay Lipstick netlist is a text form of its approved diagram. The Relay Velvet netlist came from its earlier page plus owner decisions, and its diagram is generated from the netlist.
- "Supports" means the netlist document agrees with the page text. It is not evidence that a physical harness was built or measured.
