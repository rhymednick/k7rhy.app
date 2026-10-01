# Handoff

Updated 2026-10-01. Brief working state only; durable decisions live in the linked records.

## Current state

- **TypeSafe pilots: done.** Ledger triage and the wiring-page check both run; see [the TypeSafe decision record](../docs/decisions/2026-10-01-typesafe-skill.md). No open questions.
- **Wiring pages:** every published wiring page has a netlist document and passes `scripts/typesafe/check-wiring-pages.mjs` (0 priority-1 items, 0 table mismatches). The check is required before a wiring page is published or changed ([workflow](../docs/engineering/wiring-diagrams.md)).
- **Extraction ledger:** conventions settled in [the ledger conventions record](../docs/decisions/2026-10-01-extraction-ledger-conventions.md). 47 candidates are promoted; the rest are indexed in the ledger.

## Next actions

1. Coupeville Reef: [reference design](../docs/engineering/coupeville-reef/reference-design.md) drafted 2026-10-01. Open: lipstick models (roughly 6 kΩ DCR), residual volume anomalies (CRL-021), and model-page copy (CRL-001, CRL-003). A builder wiring diagram would follow the [wiring workflow](../docs/engineering/wiring-diagrams.md).
2. Remaining ledger open questions are bench tests for Velvet (VDH-033, VDH-034, VAC-017 to VAC-020, VPTC-018).
3. Owner decisions on the four "Not yet applied" items in the [guitar documentation standard](../docs/engineering/guitar-documentation-standard.md) (ZGDC-010, ZGDC-012, ZGDC-013, ZGDC-018).

Done 2026-10-01: Relay Velvet Rev 1.0 diagram and page; guitar documentation standard and Coupeville Velvet reference design promoted from the ledger.

## Session setup

- **TypeSafe skill.** `.claude/settings.json` enables `typesafe@typesafe-ai`, but cloud sessions do not always install it. If the `typesafe:typesafe-ai` skill is missing from the session's skill list, run:

    ```sh
    claude plugin marketplace add typesafe-ai/skills
    claude plugin install typesafe@typesafe-ai
    ```

    The skill loads in the **next** session. The scripts in `scripts/typesafe/` do not need the plugin, only `TYPESAFE_API_KEY`; without the key, `check-wiring-pages.mjs --dry-run` still runs the exact checks.

- **Dependencies.** `node_modules` is not installed by default in cloud sessions; run `npm ci` before `npm run build` or the tests.
