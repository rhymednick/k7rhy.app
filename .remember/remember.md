# Handoff

Updated 2026-10-25. Brief working state only; durable decisions live in the linked records.

## Current state

- **RLY26002 (Torch – Production Prototype): serial reserved, unpublished.** Owner-reported as tester-validated and unchanged; GFS pickups per spec. Only the [engineering record](../docs/engineering/rly26002/README.md) exists. Note the allocator does not see engineering-record reservations (RLY26001 is held by the Harmonic Triad). Next: owner confirms wiring and supplies photos, then author the record.

- **RLY26001 (prototype Relay-body guitar, "Harmonic Triad"): on hold for a wiring repair.** Serial reserved 2026-11-15; built 2026-03-19; some selector positions do not work. Only the [engineering record](../docs/engineering/rly26001/README.md) exists; no instrument record yet. Next: owner repairs and supplies lug-by-lug wiring, then author the record.

- **DIY alternatives principle, first application: dummy-load stripboard.** The owner decided (2026-10-25) that K7RHY publishes free build-it-yourself alternatives with stripboard layouts alongside its kits ([decision record](../docs/decisions/2026-10-25-diy-alternative-builds.md)). The 20W dummy load stripboard is **designed and modeled, not built or measured**; the owner delegated the diode (BAT46) and the power limits (10 W continuous, 20 W bursts with 3 W resistors, recommended pending a thermal test). See [the reference](../docs/engineering/dummy-load-stripboard/reference.md) and its builder sheet. Next: decide where DIY alternatives live on the site (in discussion), get the kit's resistor wattage and diode part number, build one board, then NanoVNA and thermal tests before publishing any numbers.
- **STR26001 Tomatillo revision:** the owner approved a cream pickguard, Fender tremolo bridge, complete Fender Custom Shop Tomatillo pickup set, and the name Tomatillo S-Type. The record and Rev 2.0 wiring reference are updated in the local change; the replacement pickup installation and lead mapping are not yet owner-reported. See [the dated STR26001 revision](../docs/engineering/strat-cunife/README.md) and [Rev 2.0 netlist](../docs/engineering/strat-cunife/STR26001-wiring-reference.md). Next: merge and verify production deploy, then record physical lead/phase findings when available.
- **TypeSafe pilots: done.** Ledger triage and the wiring-page check both run; see [the TypeSafe decision record](../docs/decisions/2026-10-01-typesafe-skill.md). No open questions.
- **Wiring pages:** every published wiring page has a netlist document and passes `scripts/typesafe/check-wiring-pages.mjs` (0 priority-1 items, 0 table mismatches). The check is required before a wiring page is published or changed ([workflow](../docs/engineering/wiring-diagrams.md)).
- **Extraction ledger:** conventions settled in [the ledger conventions record](../docs/decisions/2026-10-01-extraction-ledger-conventions.md). 47 candidates are promoted; the rest are indexed in the ledger.

## Next actions

1. **Relay Reef and Reef Plus** are documented (PR #130, both `lab`). Validate on the first builds: Reef Plus uses stock 500k/500k audio concentric pots (owner, 2026-10-02), so check for the CRL-019 volume-sweep problem, and concentric fit in the Relay body is unverified. The two Reef Plus tones interact when a branch volume is up; the owner accepted that on 2026-10-03. See [Relay Reef variants](../docs/decisions/2026-10-01-relay-reef-variants.md).
2. Coupeville Reef: [reference design](../docs/engineering/coupeville-reef/reference-design.md) drafted 2026-10-01. Open: lipstick models (roughly 6 kΩ DCR), residual volume anomalies (CRL-021), and model-page copy (CRL-001, CRL-003). An unpublished Rev 1.0 [wiring diagram](../docs/engineering/coupeville-reef/wiring-diagram.md) exists; publishing it would need a page decision.
3. Remaining ledger open questions are bench tests for Velvet (VDH-033, VDH-034, VAC-017 to VAC-020, VPTC-018).
4. Owner decisions on the four "Not yet applied" items in the [guitar documentation standard](../docs/engineering/guitar-documentation-standard.md) (ZGDC-010, ZGDC-012, ZGDC-013, ZGDC-018).

Done 2026-10-01: Relay Velvet Rev 1.0 diagram and page; guitar documentation standard and Coupeville Velvet reference design promoted from the ledger.

## Session setup

- **TypeSafe skill.** `.claude/settings.json` enables `typesafe@typesafe-ai`, but cloud sessions do not always install it. If the `typesafe:typesafe-ai` skill is missing from the session's skill list, run:

    ```sh
    claude plugin marketplace add typesafe-ai/skills
    claude plugin install typesafe@typesafe-ai
    ```

    The skill loads in the **next** session. The scripts in `scripts/typesafe/` do not need the plugin, only `TYPESAFE_API_KEY`, which the cloud environment sets (with network access to `api.typesafe.ai`, verified 2026-10-08); without the key, `check-wiring-pages.mjs --dry-run` still runs the exact checks.

- **Dependencies.** `node_modules` is not installed by default in cloud sessions; run `npm ci` before `npm run build` or the tests.

## Discord listing integration (2026-11-16)

Implemented locally on top of the refreshed Shopify webhook/Reverb sync. Uses a `discord-ready` product tag (no metafield-value webhook exists), optional description/record/related URL fields, Netlify Database delivery state and leases, initial posts, price-drop notices, and Sold/Unavailable edits. No polling. The dummy load and zero-stock items are excluded from initial posts. See [the decision record](../docs/decisions/2026-11-16-discord-listing-announcements.md) and [setup/backfill/recovery runbook](../docs/engineering/discord-announcements.md). Production enable/channel, database plan, Storefront inventory scope, fields, and extra paid-order/inventory subscriptions need setup before the one-time backfill. No public messages have been sent. The owner supplies secrets; agents do not retrieve their values.

Validation: 328 tests across 61 files and production build pass under Node 22. Runtime settings move to Node 22 because `@netlify/database` requires >=22.12. Public posting remains disabled; live Storefront/Discord and historical backfill are pending setup.

Owner-approved restriction (2026-11-16): `custom.discord_description` is required approved copy. Missing/blank copy blocks initial announcements and backfill; the product-description fallback is removed, and overlong copy is rejected rather than truncated. See the same decision record/runbook.

Build correction (2026-11-16): Netlify preview failed before application build because `createSiteDatabase` returned 403, "database feature not available for this account". Removed automatic Netlify Database provisioning and its SDK; storage now uses standard `pg` with owner-supplied `DISCORD_ANNOUNCEMENTS_DATABASE_URL`. Schema lives under `db/discord-announcements/migrations/` and is applied only through the explicit dry-run-first migration command. Node 20 is retained. No database or account upgrade has been provisioned; live announcement activation still needs a supported database.

Build-correction validation: 333 tests/62 files and the production build pass under Node 20 in CI/preview mode; migration dry run requires no connection. Replacement Netlify preview is the remaining deployment check.
