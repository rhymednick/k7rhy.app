# Handoff

Updated 2026-10-01. Brief working state only; durable decisions live in the linked records.

## Current state

- **TypeSafe pilots: done.** Ledger triage and the wiring-page check both run; see [the TypeSafe decision record](../docs/decisions/2026-10-01-typesafe-skill.md). No open questions.
- **Wiring pages:** every published wiring page has a netlist document and passes `scripts/typesafe/check-wiring-pages.mjs` (0 priority-1 items, 0 table mismatches). The check is required before a wiring page is published or changed ([workflow](../docs/engineering/wiring-diagrams.md)).
- **Extraction ledger:** conventions settled in [the ledger conventions record](../docs/decisions/2026-10-01-extraction-ledger-conventions.md). About 100 candidates are "Ready to promote"; few are promoted yet.

## Next actions

1. Draw the Relay Velvet Rev 1.0 wiring diagram and bring its page in line with Torch, Arc, and Lipstick.
2. Promote ready ledger candidates, starting with the Velvet reference design and a guitar-documentation standard from the ZGDC conventions.
3. Owner decisions on the ledger's open questions (for example CRL-002, the Reef humbucker position).

## Session setup

- **TypeSafe skill.** `.claude/settings.json` enables `typesafe@typesafe-ai`, but cloud sessions do not always install it. If the `typesafe:typesafe-ai` skill is missing from the session's skill list, run:

    ```sh
    claude plugin marketplace add typesafe-ai/skills
    claude plugin install typesafe@typesafe-ai
    ```

    The skill loads in the **next** session. The scripts in `scripts/typesafe/` do not need the plugin, only `TYPESAFE_API_KEY`; without the key, `check-wiring-pages.mjs --dry-run` still runs the exact checks.

- **Dependencies.** `node_modules` is not installed by default in cloud sessions; run `npm ci` before `npm run build` or the tests.
