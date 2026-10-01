# TypeSafe skill enabled for project agents

- **Date:** 2026-10-01
- **Status:** approved; first pilot (ledger triage) implemented 2026-10-01
- **Supersedes:** none

## Decision

- The project's `.claude/settings.json` registers the `typesafe-ai/skills` marketplace and enables the `typesafe@typesafe-ai` plugin, so every Claude Code session in this repository gets the TypeSafe skill.
- Agents use the skill when work here needs a typed judgment over natural language: for example, sorting decision-extraction candidates or checking published wiring text against a netlist.
- Circuit logic stays in deterministic code. Netlists, operating states and contact tables are not delegated to a probabilistic model.

## Why

The owner has a TypeSafe account and wants its System One models (Jev) available while building the site and reviewing guitar wiring work. Typed, probability-scored answers suit review triage. They can't replace a circuit's source of truth.

## Configuration

- **API host:** `api.typesafe.ai` (`POST https://api.typesafe.ai/v1/systemone`, Bearer auth). Docs: https://docs.typesafe.ai.
- **Environment variable:** `TYPESAFE_API_KEY`.
- **Model:** `jev-latest`, which resolved to `jev-1.13.0` on 2026-10-01.
- Scripts stay local and manual, outside `npm run build` and Netlify.

## Pilot 1: decision-ledger triage

- **Chosen:** 2026-10-01, by the owner. Ledger triage runs first; the wiring-page netlist check is still open.
- **Script:** [`scripts/typesafe/triage-ledger.mjs`](../../scripts/typesafe/triage-ledger.mjs). Code parses the [ledger](../engineering/extraction/decision-ledger.md) and [source inventories](../engineering/extraction/sources/). One request per candidate asks for the evidence label (Choice), classification (Choice), explicit owner acceptance (Noul), and same-source conflict or supersession (Noul). The current labels are left out of state so the answers are independent.
- **Output:** [`docs/engineering/extraction/triage-report.md`](../engineering/extraction/triage-report.md). The report only proposes changes. It edits no ledger, inventory, or canonical document, and model confidence is not owner approval.

### Results of the first run (2026-10-01)

- 220 candidates. TypeSafe matched the ledger's evidence label on 73 (33%) and its classification on 101 (46%). Label confidence had a median of 0.59; class confidence, 0.77.
- Thresholds read from that spread: a disagreement at confidence 0.8 or above (about the p75 of label confidence) is priority 1; confidence below 0.4 (about the p25) is uncertain; a Noul at 0.5 or above reads as yes. Result: 83 priority-1, 105 priority-2, 11 priority-3, and 21 unflagged candidates.
- The most useful findings were model-free: 28 ledger labels differ from their source inventories, 7 ledger classes ("Engineering recommendation", "Build observation") are outside the README vocabulary, and a blank line breaks the ledger table before RTC-001.
- 122 of 149 Confirmed candidates have notes that do not cite the owner's acceptance (Noul below 0.5). The low label agreement mostly reflects that gap: the inventories assert Confirmed without quoting the evidence.
- Three possible unrecorded same-source conflicts: CVPC-020, VDH-012, and ERP-004.

### Cost and latency

- 220 requests, 495,763 input tokens (about 1,400–3,100 per request): about $0.02 at the listed $0.042 per million input tokens. Output tokens are free.
- With 4 parallel requests the full run took about 9 seconds. Per request: median 148 ms, p90 185 ms, max 313 ms. No rate-limit errors.

### Second run (2026-10-01)

After the [extraction ledger conventions](2026-10-01-extraction-ledger-conventions.md) were adopted, the script reads the labels, classes, and definitions from the README. The ledger now controls where it differs from an inventory, so those 34 differences are counted but no longer flagged.

- Priority 1: 51. Priority 2: 132. Priority 3: 12. Unflagged: 25.
- Label agreement 74/220; class agreement 103/220. The class definitions barely changed agreement. The largest class disagreement is Reference design versus Design decision (24 rows).
- Confidence spread matched the first run, so the thresholds stand. Cost: 552,303 input tokens, about $0.02. Median latency 142 ms.

### Third run (2026-10-01)

After "Design decision" was merged into Reference design and Validation plan, the rerun gave priority 1: 50, priority 2: 132, priority 3: 5, unflagged: 33. Label agreement 73/220; class agreement 100/220. Cost about $0.02 (558,903 input tokens); median latency 149 ms.

## Pilot 2: wiring pages against their netlists

- **Started:** 2026-10-01, at the owner's request after pilot 1.
- **Script:** [`scripts/typesafe/check-wiring-pages.mjs`](../../scripts/typesafe/check-wiring-pages.mjs). Code splits each published wiring page into claims (one per sentence or table row, with the paragraph as context) and compares every component value and net label with the netlist document exactly. TypeSafe answers one Choice per claim: the netlist document supports it, contradicts it, or says nothing. The netlist document is one shared state, and up to 40 claims go in one request as parallel questions.
- **Scope:** Relay Torch, Relay Arc, `STR26001`, and `STR26002`, each against its engineering netlist. Relay Lipstick and Relay Velvet have no separate netlist document, so they were not checked in the first run (see the follow-up below). Diagram images are not checked.
- **Output:** [`docs/engineering/wiring-check-report.md`](../engineering/wiring-check-report.md). It proposes fixes only.

### Results of the first run (2026-10-01)

- 216 claims: 183 supported, 9 priority 1, 22 priority 2 (uncertain), 2 priority 3 (not covered).
- No component value on any page disagrees with its netlist.
- All 9 priority-1 items are terminal labels that the page uses and the netlist document lacks: push-pull `A1`–`A3` and `B1`–`B3` on the Torch page, and `R-IN` on the Arc page. The pages describe the same connections as the netlists, so these are gaps in the netlist documents, not wiring errors.
- TypeSafe returned four "contradicts" verdicts, all below confidence 0.35. On review each was a false positive, so a low-confidence contradiction goes to human review rather than priority 1. An earlier pass flagged "Its series junction is not used" at 0.94 because sentence splitting lost the subject; adding the paragraph as context removed it.
- Confidence is bimodal (median 0.99, p25 0.86, p10 0.43). Review threshold: 0.6.
- Cost: 7 requests, 66,873 input tokens, about $0.003. Median latency 185 ms per 40-claim request.

### Follow-up (2026-10-01): netlist labels, two new netlists, exact table checks

The owner approved all three open questions from the first run.

- **Terminal labels.** The [Torch netlist](../engineering/relay-torch-reference.md) now names its push-pull terminals (`A1`–`A3`, `B1`–`B3`) and has operating-state and contact tables. The [Arc netlist](../engineering/relay-arc-reference.md) names `R-IN`. The circuits are unchanged.
- **New netlists.**
    - [Relay Lipstick](../engineering/relay-lipstick-reference.md): transcribed from the approved Rev 1.0 diagram, which agrees with the page on every connection. Owner confirmation pending.
    - [Relay Velvet](../engineering/relay-velvet-reference.md): a draft transcribed from the page, which is the only source. Checking the page against it is circular until an independent source exists.
- **Exact table checks.** [`scripts/typesafe/wiring-tables.mjs`](../../scripts/typesafe/wiring-tables.mjs) compares operating-state and switch-contact tables cell by cell in code. A state cell reduces to its selected pickups and modifiers (split, series, contour, series capacitor); a contact cell reduces to its net labels. A mutation test caught all four planted errors: a wrong split, a dropped capacitor, a wrong throw, and an opened contact.
- **Results:** 6 pages and 353 claims. Priority 1: 0. 10 tables, 106 cells, 0 mismatches. The one priority-1 item in the first pass was ambiguous wording in the new Lipstick netlist (`A1` "open" versus "off connects `A2–A1`"), now clarified. Cost: 11 requests, 105,411 input tokens, about $0.004.
- **Found while transcribing Velvet:** the Velvet page grounds the volume pot's back (`VOL-B`) but connects no volume lug to ground. An ordinary volume control needs its CCW lug grounded; if the page means a lug bent to the pot back, it should say so. The page also gives no tone-capacitor value or tone-pot taper.

### Owner decisions (2026-10-01)

- **Check required before publishing.** A wiring page must pass `check-wiring-pages.mjs` before it is published or changed: no priority-1 items, no table mismatches, and every priority-2 item reviewed. Recorded in the [wiring-diagram workflow](../engineering/wiring-diagrams.md).
- **Velvet volume ground.** The same volume lug (CCW) is grounded on every K7RHY guitar. It is a fixed convention, not a per-model decision, so it is recorded in the Velvet netlist without further validation.
- **Lipstick netlist.** No separate owner check is needed. It is the text form of the approved Rev 1.0 diagram, and the published page matches it.

- **Velvet tone values.** 22 nF tone capacitor and audio-taper tone pot, the same as the other Relay models. Added to the Velvet netlist and page.

## Open questions

None from these pilots.
