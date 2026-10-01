# Wiring page check (TypeSafe pilot)

Generated 2026-10-01 by `scripts/typesafe/check-wiring-pages.mjs` with model `jev-1.13.0`.

Each published wiring page is checked against the engineering document that holds its netlist, which [the wiring-diagram workflow](wiring-diagrams.md) makes the circuit source of truth. This report only proposes fixes; it edits no page, diagram, or netlist. A "supports" verdict is not a bench test, and it does not check the diagram image.

## Method

- Code splits each page into claims: one per sentence or table row. A sentence from a longer paragraph or list item carries that unit as context, so pronouns still resolve. For STR26001 and STR26002 the claims come from the data in `lib/instruments/wiring-reference.ts` that the `/sn/<serial>/wiring` pages render.
- Code compares every component value (capacitors, resistors, pot values and tapers) and every net label on the page with the netlist document. A value or label that the document lacks is a priority-1 flag. No model is involved.
- TypeSafe reads each claim against the full netlist document and answers one Choice: supports, contradicts, or says nothing. Claims are sent as parallel questions over one shared state, up to 40 per request.

## Summary

- Pages checked: 4. Claims: 216. Priority 1: 9. Priority 2: 22. Priority 3: 2. Supported: 183.
- Requests: 7. Input tokens: 66,873 (about $0.0028 at $0.042/Mtok). Latency per request: median 185 ms, max 436 ms.
- Not checked: Relay Lipstick (`content/relay/wiring/lipstick.mdx`): no separate netlist document; the page itself is the only circuit record; Relay Velvet (`content/relay/wiring/velvet.mdx`): no netlist document for the Relay Velvet base harness (the Coupeville Velvet bench diagram is a different circuit).

| Page                                                  | Claims | Supports | Contradicts | Says nothing | Code flags |
| ----------------------------------------------------- | ------ | -------- | ----------- | ------------ | ---------- |
| [Relay Torch](../../content/relay/wiring/torch.mdx)   | 63     | 54       | 2           | 7            | 8          |
| [Relay Arc](../../content/relay/wiring/arc.mdx)       | 94     | 92       | 1           | 1            | 1          |
| [STR26001](../../lib/instruments/wiring-reference.ts) | 33     | 32       | 1           | 0            | 0          |
| [STR26002](../../lib/instruments/wiring-reference.ts) | 26     | 26       | 0           | 0            | 0          |

## Thresholds

| Measure            | min  | p10  | p25  | median | p75  | max  |
| ------------------ | ---- | ---- | ---- | ------ | ---- | ---- |
| Verdict confidence | 0.13 | 0.43 | 0.86 | 0.99   | 1.00 | 1.00 |

Confidence is bimodal: three quarters of verdicts are at 0.86 or above, and the rest trail down to 0.13. A verdict below 0.6 goes to human review (priority 2), including a low-confidence "contradicts". A "contradicts" at 0.6 or above is priority 1. In the 2026-10-01 run, every "contradicts" verdict was below 0.35, and on review each was a false positive.

## Priority 1: value or label mismatches and confident contradictions

A component value or net label on the page is missing from the netlist document, or TypeSafe reads the document as contradicting the claim at confidence 0.6 or above.

| Page        | Section                     | Claim                                                                                                                                                                                       | Verdict (p, conf.)       | Flags                                                                                                                                              |
| ----------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Relay Torch | Connection map              | Node: Edge output branch; Connect these points: Join the other ends of the 2.2 nF capacitor and 150 kΩ resistor and wire that joint continuously to push-pull `A3`.                         | contradicts (42%, 0.13)  | net label A3 not in netlist document; uncertain: contradicts (conf. 0.13)                                                                          |
| Relay Torch | Build outline               | Wire `SEL` to `A1` and to one end of both Edge components.                                                                                                                                  | supports (43%, 0.15)     | net label A1 not in netlist document; uncertain: supports (conf. 0.15)                                                                             |
| Relay Torch | Build outline               | Join their other ends at `A3`; wire `A2` to `BUS`.                                                                                                                                          | supports (45%, 0.17)     | net label A3 not in netlist document; net label A2 not in netlist document; uncertain: supports (conf. 0.17)                                       |
| Relay Torch | Connection map              | Node: `SEL`; Connect these points: Five-way common output ↔ push-pull `A1` ↔ one end of both Edge components.                                                                               | supports (61%, 0.41)     | net label A1 not in netlist document; uncertain: supports (conf. 0.41)                                                                             |
| Relay Arc   | Arc Mode push-pull contacts | Pole: F — partial split; Common: `SPLIT`; Down throw: open; Up throw: `R-IN`, one end of 3.3 kΩ; the other end goes to `GND`                                                                | supports (62%, 0.43)     | net label R-IN not in netlist document; uncertain: supports (conf. 0.43)                                                                           |
| Relay Torch | Connection map              | The `A1`/`A2`/`A3` push-pull labels describe a generic terminal map; check the actual switch with a continuity meter before soldering.                                                      | supports (71%, 0.56)     | net label A1 not in netlist document; net label A2 not in netlist document; net label A3 not in netlist document; uncertain: supports (conf. 0.56) |
| Relay Torch | Connection map              | Node: `BUS`; Connect these points: Push-pull common `A2` ↔ A500k volume input ↔ A500k tone input. Down joins `A2–A1` for a direct path; pulled up joins `A2–A3` to insert the Edge network. | supports (70%, 0.56)     | net label A2 not in netlist document; uncertain: supports (conf. 0.56)                                                                             |
| Relay Torch | Connection map              | Node: Unused pole; Connect these points: Leave push-pull `B1`, `B2`, and `B3` open and insulated.                                                                                           | says nothing (84%, 0.77) | net label B1 not in netlist document; net label B2 not in netlist document; net label B3 not in netlist document; not in the netlist document      |
| Relay Torch | Connection map              | Push-pull contacts: The generic map uses `A2` as the common.                                                                                                                                | says nothing (86%, 0.79) | net label A2 not in netlist document; not in the netlist document                                                                                  |

## Priority 2: uncertain verdicts

TypeSafe's confidence is below 0.6. A person should read the claim against the netlist.

| Page        | Section                        | Claim                                                                                                                                                               | Verdict (p, conf.)       | Flags                                |
| ----------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------ |
| STR26001    | Parts                          | Four-pole five-way super switch and latching DPDT on-on micro switch.                                                                                               | supports (43%, 0.15)     | uncertain: supports (conf. 0.15)     |
| Relay Torch | Build outline                  | Leave the `B` pole open and insulate all unused pickup series-junction leads.                                                                                       | supports (45%, 0.17)     | uncertain: supports (conf. 0.17)     |
| STR26002    | Parts                          | Standard five-way blade and latching SPST on-off micro switch.                                                                                                      | supports (46%, 0.20)     | uncertain: supports (conf. 0.20)     |
| Relay Torch | Bench checks                   | Listen to all pickup combinations for unexpected cancellation and verify that rolling down volume cleans up without a treble-bleed network.                         | supports (48%, 0.22)     | uncertain: supports (conf. 0.22)     |
| Relay Torch | Parts and lead identification  | Bridge: GFS VEH humbucker, wired full series in every position.                                                                                                     | says nothing (48%, 0.23) | uncertain: says nothing (conf. 0.23) |
| Relay Torch | Parts and lead identification  | Neck: GFS Professional Series Alnico II humbucker, wired full series in every position.                                                                             | supports (51%, 0.26)     | uncertain: supports (conf. 0.26)     |
| Relay Torch | What each switch position does | It affects every blade position.                                                                                                                                    | contradicts (52%, 0.28)  | uncertain: contradicts (conf. 0.28)  |
| Relay Arc   | What each switch position does | Selected pickups combine in parallel.                                                                                                                               | supports (52%, 0.28)     | uncertain: supports (conf. 0.28)     |
| Relay Torch | Connection map                 | Down connects `A2–A1`; pulled up connects `A2–A3`.                                                                                                                  | says nothing (54%, 0.31) | uncertain: says nothing (conf. 0.31) |
| Relay Arc   | Build sequence                 | Wire the selector audio poles A and B to produce the five full-pickup selections.                                                                                   | supports (54%, 0.31)     | uncertain: supports (conf. 0.31)     |
| Relay Arc   | Bench checks                   | Audition the treble bleed as volume rolls down before final installation.                                                                                           | supports (54%, 0.31)     | uncertain: supports (conf. 0.31)     |
| STR26001    | Selector contacts              | In each blade position, each pole common closes to one numbered throw.                                                                                              | contradicts (53%, 0.31)  | uncertain: contradicts (conf. 0.31)  |
| Relay Arc   | (introduction)                 | Pulling the A500k tone control engages Arc Mode: the Liverpool takes a 680 pF series path, while the selected Dream 180 or Vintage ’59 can receive a partial split. | contradicts (55%, 0.34)  | uncertain: contradicts (conf. 0.34)  |
| Relay Arc   | What each switch position does | It is not the 22 nF tone capacitor or the 1 nF treble-bleed capacitor.                                                                                              | supports (56%, 0.35)     | uncertain: supports (conf. 0.35)     |
| Relay Torch | Bench checks                   | With the volume full up, confirm no near-zero-ohm short from jack tip to sleeve.                                                                                    | supports (59%, 0.38)     | uncertain: supports (conf. 0.38)     |
| Relay Torch | What each switch position does | This passive contour removes some low-frequency energy relative to the highs; it does not add gain.                                                                 | says nothing (59%, 0.39) | uncertain: says nothing (conf. 0.39) |
| Relay Arc   | Build sequence                 | Verify selection before adding Arc Mode.                                                                                                                            | supports (61%, 0.41)     | uncertain: supports (conf. 0.41)     |
| Relay Torch | Bench checks                   | At volume zero, the tip should reach ground.                                                                                                                        | supports (63%, 0.44)     | uncertain: supports (conf. 0.44)     |
| Relay Torch | What each switch position does | Those two components form one network that is switched in series with the selected pickup signal.                                                                   | supports (64%, 0.47)     | uncertain: supports (conf. 0.47)     |
| Relay Arc   | Bench checks                   | Capacitors block steady DC after a meter settles; use measured parts rather than fixed pickup-resistance targets.                                                   | says nothing (68%, 0.52) | uncertain: says nothing (conf. 0.52) |
| STR26001    | Parts                          | A250K audio-taper master volume, A500K audio-taper master tone, 22 nF (0.022 µF) non-polarized tone capacitor, and mono output jack.                                | supports (69%, 0.53)     | uncertain: supports (conf. 0.53)     |
| STR26001    | Connection map                 | TC_J: The A500K tone wiper runs through the 22 nF capacitor to GND. The tone pot CCW lug takes BUS; its CW lug is unused.                                           | supports (69%, 0.53)     | uncertain: supports (conf. 0.53)     |

## Priority 3: not covered by the netlist document

Confident "says nothing" verdicts. Most are assembly or test advice the netlist does not need to cover; any that state a circuit fact are gaps in the netlist document.

| Page        | Section        | Claim                                                                                                                                                 | Verdict (p, conf.)       | Flags                       |
| ----------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | --------------------------- |
| Relay Torch | Connection map | The `B` pole is unused.                                                                                                                               | says nothing (79%, 0.68) | not in the netlist document |
| Relay Torch | Bench checks   | DC resistance varies with pickup and pot tolerances; measure the isolated pickups rather than using fixed advertised resistances as pass/fail limits. | says nothing (88%, 0.82) | not in the netlist document |

## Limits

- The diagram images are not checked. TypeSafe reads text only, and the Torch and Arc diagrams have no text source in the repository.
- TypeSafe judges claims one at a time. It does not trace a full circuit path, so a page can be wrong in a way that no single claim reveals. Exact tables (selector contacts, operating states) are better compared field by field in code; that is the next step if this pilot proves useful.
- "Supports" means the netlist document agrees with the page text. It is not evidence that a physical harness was built or measured.
