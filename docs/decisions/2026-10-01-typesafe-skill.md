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

## Open questions

- Should the inventories quote the owner's acceptance for each Confirmed candidate, so that the evidence is checkable?
- Should the README define each classification, so that the Choice question has criteria rather than bare names?
- Which pilot comes next: the check that wiring pages match their netlists, or a second ledger pass after the inventories are reconciled?
