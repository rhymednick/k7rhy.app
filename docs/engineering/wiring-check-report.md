# Wiring page check (TypeSafe pilot)

Generated 2026-10-01 by `scripts/typesafe/check-wiring-pages.mjs` with model `jev-1.13.0`.

Each published wiring page is checked against the engineering document that holds its netlist, which [the wiring-diagram workflow](wiring-diagrams.md) makes the circuit source of truth. This report only proposes fixes; it edits no page, diagram, or netlist. A "supports" verdict is not a bench test, and it does not check the diagram image.

## Method

- Code splits each page into claims: one per sentence or table row. A sentence from a longer paragraph or list item carries that unit as context, so pronouns still resolve. For STR26001 and STR26002 the claims come from the data in `lib/instruments/wiring-reference.ts` that the `/sn/<serial>/wiring` pages render.
- Code compares every component value (capacitors, resistors, pot values and tapers) and every net label on the page with the netlist document. A value or label that the document lacks is a priority-1 flag. No model is involved.
- Code also compares the operating-state and switch-contact tables cell by cell with the matching netlist tables. A state cell is reduced to the pickups it selects and their modifiers (split, series, contour); a contact cell is reduced to its net labels. No model is involved.
- TypeSafe reads each claim against the full netlist document and answers one Choice: supports, contradicts, or says nothing. Claims are sent as parallel questions over one shared state, up to 40 per request.

## Summary

- Pages checked: 7. Claims: 395. Priority 1: 0. Priority 2: 41. Priority 3: 14. Supported: 340.
- Requests: 13. Input tokens: 125,054 (about $0.0053 at $0.042/Mtok). Latency per request: median 231 ms, max 533 ms.
- Tables compared in code: 12, covering 120 cells. Mismatches: 0.

| Page                                                      | Claims | Supports | Contradicts | Says nothing | Code flags |
| --------------------------------------------------------- | ------ | -------- | ----------- | ------------ | ---------- |
| [Relay Torch](../../content/relay/wiring/torch.mdx)       | 63     | 60       | 0           | 3            | 0          |
| [Relay Arc](../../content/relay/wiring/arc.mdx)           | 94     | 91       | 2           | 1            | 0          |
| [STR26001](../../lib/instruments/wiring-reference.ts)     | 33     | 32       | 1           | 0            | 0          |
| [STR26002](../../lib/instruments/wiring-reference.ts)     | 26     | 26       | 0           | 0            | 0          |
| [Relay Lipstick](../../content/relay/wiring/lipstick.mdx) | 70     | 59       | 0           | 11           | 0          |
| [Relay Velvet](../../content/relay/wiring/velvet.mdx)     | 51     | 44       | 0           | 7            | 0          |
| [Relay Reef](../../content/relay/wiring/reef.mdx)         | 58     | 54       | 0           | 4            | 0          |

## Thresholds

| Measure            | min  | p10  | p25  | median | p75  | max  |
| ------------------ | ---- | ---- | ---- | ------ | ---- | ---- |
| Verdict confidence | 0.05 | 0.58 | 0.91 | 0.99   | 1.00 | 1.00 |

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
| Relay Reef     | Operating states      | 6              | All match |
| Relay Reef     | Blade contacts        | 8              | All match |

## Priority 1: value or label mismatches and confident contradictions

A component value or net label on the page is missing from the netlist document, or TypeSafe reads the document as contradicting the claim at confidence 0.6 or above.

None.

## Priority 2: uncertain verdicts

TypeSafe's confidence is below 0.6. A person should read the claim against the netlist.

| Page           | Section                        | Claim                                                                                                                                                               | Verdict (p, conf.)       | Flags                                |
| -------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------ |
| Relay Lipstick | Bench checks                   | Turn the knobs from stop to stop: clockwise should increase volume and brighten tone.                                                                               | says nothing (37%, 0.05) | uncertain: says nothing (conf. 0.05) |
| Relay Torch    | Parts and lead identification  | Neck: GFS Professional Series Alnico II humbucker, wired full series in every position.                                                                             | supports (46%, 0.19)     | uncertain: supports (conf. 0.19)     |
| Relay Torch    | Parts and lead identification  | Bridge: GFS VEH humbucker, wired full series in every position.                                                                                                     | says nothing (46%, 0.20) | uncertain: says nothing (conf. 0.20) |
| STR26002       | Parts                          | Standard five-way blade and latching SPST on-off micro switch.                                                                                                      | supports (48%, 0.22)     | uncertain: supports (conf. 0.22)     |
| STR26001       | Parts                          | Four-pole five-way super switch and latching DPDT on-on micro switch.                                                                                               | supports (48%, 0.23)     | uncertain: supports (conf. 0.23)     |
| Relay Reef     | Parts and lead identification  | Audio-taper pots give an uneven sweep with a sudden drop near the top in this circuit.                                                                              | says nothing (49%, 0.23) | uncertain: says nothing (conf. 0.23) |
| Relay Arc      | Bench checks                   | Audition the treble bleed as volume rolls down before final installation.                                                                                           | supports (52%, 0.27)     | uncertain: supports (conf. 0.27)     |
| Relay Torch    | Bench checks                   | Listen to all pickup combinations for unexpected cancellation and verify that rolling down volume cleans up without a treble-bleed network.                         | supports (52%, 0.28)     | uncertain: supports (conf. 0.28)     |
| Relay Arc      | What each switch position does | Selected pickups combine in parallel.                                                                                                                               | contradicts (52%, 0.28)  | uncertain: contradicts (conf. 0.28)  |
| Relay Lipstick | Build sequence                 | Identify each pickup's hot, return, shield, and series junction from its supplied lead guide and a meter.                                                           | supports (52%, 0.28)     | uncertain: supports (conf. 0.28)     |
| STR26001       | Selector contacts              | In each blade position, each pole common closes to one numbered throw.                                                                                              | contradicts (53%, 0.29)  | uncertain: contradicts (conf. 0.29)  |
| Relay Reef     | Parts and lead identification  | Use the supplied guide for each pickup's actual lead version and confirm with a meter; wire colors are not interchangeable across pickup models.                    | supports (53%, 0.29)     | uncertain: supports (conf. 0.29)     |
| Relay Lipstick | Bench checks                   | Meter the push-push in both states against the contact map above.                                                                                                   | supports (55%, 0.32)     | uncertain: supports (conf. 0.32)     |
| Relay Lipstick | Parts and lead identification  | These are starting values to audition with the actual cable and amplifier.                                                                                          | supports (56%, 0.33)     | uncertain: supports (conf. 0.33)     |
| Relay Lipstick | Bench checks                   | With power disconnected, meter the selector: common `C` connects to bridge, both bridge and neck, then neck in the three positions.                                 | supports (56%, 0.33)     | uncertain: supports (conf. 0.33)     |
| Relay Torch    | Bench checks                   | With the volume full up, confirm no near-zero-ohm short from jack tip to sleeve.                                                                                    | supports (56%, 0.34)     | uncertain: supports (conf. 0.34)     |
| Relay Velvet   | Bench checks                   | At volume zero, the tip should reach ground.                                                                                                                        | supports (56%, 0.34)     | uncertain: supports (conf. 0.34)     |
| Relay Velvet   | (introduction)                 | The diagram's colored paths show circuit roles, not guaranteed GFS lead colors.                                                                                     | supports (58%, 0.37)     | uncertain: supports (conf. 0.37)     |
| Relay Torch    | Bench checks                   | At volume zero, the tip should reach ground.                                                                                                                        | supports (58%, 0.38)     | uncertain: supports (conf. 0.38)     |
| Relay Lipstick | Bench checks                   | The jack tip must not have a near-zero-ohm short to sleeve with the volume up.                                                                                      | says nothing (60%, 0.39) | uncertain: says nothing (conf. 0.39) |
| Relay Lipstick | Bench checks                   | Tap-test the pickups through a low-volume amplifier in all six states.                                                                                              | says nothing (61%, 0.40) | uncertain: says nothing (conf. 0.40) |
| Relay Velvet   | (introduction)                 | Identify the contacts on the parts in hand with a continuity meter.                                                                                                 | supports (61%, 0.41)     | uncertain: supports (conf. 0.41)     |
| Relay Arc      | (introduction)                 | Pulling the A500k tone control engages Arc Mode: the Liverpool takes a 680 pF series path, while the selected Dream 180 or Vintage ’59 can receive a partial split. | contradicts (62%, 0.42)  | uncertain: contradicts (conf. 0.42)  |
| Relay Lipstick | Bench checks                   | Confirm continuity among all intended ground points.                                                                                                                | says nothing (61%, 0.42) | uncertain: says nothing (conf. 0.42) |
| Relay Torch    | What each switch position does | This passive contour removes some low-frequency energy relative to the highs; it does not add gain.                                                                 | says nothing (63%, 0.44) | uncertain: says nothing (conf. 0.44) |
| Relay Lipstick | Build sequence                 | GFS lead versions differ; the wire colors in an older diagram may not match the pickups in hand.                                                                    | says nothing (62%, 0.44) | uncertain: says nothing (conf. 0.44) |
| Relay Arc      | Build sequence                 | Verify selection before adding Arc Mode.                                                                                                                            | supports (64%, 0.46)     | uncertain: supports (conf. 0.46)     |
| Relay Velvet   | Bench checks                   | Tap-test each pickup at low amplifier volume.                                                                                                                       | says nothing (66%, 0.50) | uncertain: says nothing (conf. 0.50) |
| Relay Reef     | Build outline                  | Insulate the humbucker series junction and the unused blade throws.                                                                                                 | supports (66%, 0.50)     | uncertain: supports (conf. 0.50)     |
| Relay Arc      | What each switch position does | It is not the 22 nF tone capacitor or the 1 nF treble-bleed capacitor.                                                                                              | supports (68%, 0.52)     | uncertain: supports (conf. 0.52)     |
| Relay Arc      | Build sequence                 | Wire the selector audio poles A and B to produce the five full-pickup selections.                                                                                   | supports (68%, 0.52)     | uncertain: supports (conf. 0.52)     |
| Relay Arc      | Bench checks                   | Confirm every designated ground reaches jack sleeve and that jack tip does not have a near-zero-ohm short to sleeve with volume up.                                 | supports (68%, 0.53)     | uncertain: supports (conf. 0.53)     |
| Relay Lipstick | Bench checks                   | At maximum volume, the jack's DC reading should be near the selected pickup resistance in parallel with the 500 kΩ volume pot.                                      | says nothing (68%, 0.53) | uncertain: says nothing (conf. 0.53) |
| Relay Reef     | Bench checks                   | Tap-test each pickup at low amplifier volume.                                                                                                                       | says nothing (68%, 0.53) | uncertain: says nothing (conf. 0.53) |
| Relay Lipstick | What each switch position does | The volume knob controls output level, and the tone knob rolls off high frequencies when turned counterclockwise.                                                   | supports (69%, 0.54)     | uncertain: supports (conf. 0.54)     |
| Relay Arc      | Bench checks                   | Capacitors block steady DC after a meter settles; use measured parts rather than fixed pickup-resistance targets.                                                   | says nothing (70%, 0.55) | uncertain: says nothing (conf. 0.55) |
| Relay Torch    | Parts and lead identification  | Middle: GFS Mean 90 P90-type pickup, with hot, return, and shield or case ground as supplied.                                                                       | supports (71%, 0.56)     | uncertain: supports (conf. 0.56)     |
| Relay Velvet   | (introduction)                 | The five-way blade is shown as a functional contact map, not the physical lug layout of a particular switch.                                                        | supports (71%, 0.56)     | uncertain: supports (conf. 0.56)     |
| Relay Reef     | (introduction)                 | The diagram's colored paths show circuit roles, not guaranteed GFS lead colors.                                                                                     | supports (71%, 0.57)     | uncertain: supports (conf. 0.57)     |
| Relay Arc      | Parts and lead identification  | Insulate a supplied single split lead; with a four-conductor version, join and insulate the specified series pair.                                                  | supports (72%, 0.58)     | uncertain: supports (conf. 0.58)     |
| Relay Lipstick | Bench checks                   | At volume zero, the grounded volume track should bring the jack tip to ground.                                                                                      | supports (73%, 0.59)     | uncertain: supports (conf. 0.59)     |

## Priority 3: not covered by the netlist document

Confident "says nothing" verdicts. Most are assembly or test advice the netlist does not need to cover; any that state a circuit fact are gaps in the netlist document.

| Page           | Section                        | Claim                                                                                                                                                 | Verdict (p, conf.)        | Flags                       |
| -------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | --------------------------- |
| Relay Velvet   | What each switch position does | Position 3 is the main Velvet destination.                                                                                                            | says nothing (75%, 0.62)  | not in the netlist document |
| Relay Lipstick | Bench checks                   | Pickup and pot tolerances change the exact result, so use the measured parts rather than fixed resistance targets.                                    | says nothing (76%, 0.64)  | not in the netlist document |
| Relay Lipstick | Build sequence                 | Verify these paths before adding the lipstick branch.                                                                                                 | says nothing (84%, 0.76)  | not in the netlist document |
| Relay Velvet   | (introduction)                 | Position 3, the Nashville alone, is the main Velvet voice.                                                                                            | says nothing (84%, 0.76)  | not in the netlist document |
| Relay Reef     | Build outline                  | Shield the cavity first.                                                                                                                              | says nothing (89%, 0.83)  | not in the netlist document |
| Relay Torch    | Bench checks                   | DC resistance varies with pickup and pot tolerances; measure the isolated pickups rather than using fixed advertised resistances as pass/fail limits. | says nothing (90%, 0.85)  | not in the netlist document |
| Relay Reef     | Build outline                  | Install the harness only after it passes the meter check and tap test.                                                                                | says nothing (91%, 0.86)  | not in the netlist document |
| Relay Lipstick | Build sequence                 | Check the complete harness on the bench in all six operating states before installing it in the guitar.                                               | says nothing (95%, 0.92)  | not in the netlist document |
| Relay Lipstick | Bench checks                   | The capacitors block steady DC after the meter settles.                                                                                               | says nothing (94%, 0.92)  | not in the netlist document |
| Relay Velvet   | Build outline                  | Velvet is meant to stay exposed and clean, so start with shielding before you mount anything.                                                         | says nothing (95%, 0.92)  | not in the netlist document |
| Relay Velvet   | Build outline                  | Shield the cavity first.                                                                                                                              | says nothing (96%, 0.94)  | not in the netlist document |
| Relay Lipstick | Bench checks                   | Check relative pickup phase in combined positions and audition the treble bleed as volume rolls down before final installation.                       | says nothing (99%, 0.99)  | not in the netlist document |
| Relay Velvet   | Build outline                  | Install the harness only after it passes the meter check and tap test.                                                                                | says nothing (99%, 0.99)  | not in the netlist document |
| Relay Velvet   | Build outline                  | The cavity is the wrong place to discover a bad selector joint.                                                                                       | says nothing (100%, 1.00) | not in the netlist document |

## Limits

- The diagram images are not checked. TypeSafe reads text only, and the Torch and Arc diagrams have no text source in the repository.
- TypeSafe judges claims one at a time and the table comparison checks one table at a time. Neither traces a full circuit path, so a page can be wrong in a way that no single claim or cell reveals.
- The Relay Lipstick netlist is a text form of its approved diagram. The Relay Velvet netlist came from its earlier page plus owner decisions, and its diagram is generated from the netlist.
- "Supports" means the netlist document agrees with the page text. It is not evidence that a physical harness was built or measured.
