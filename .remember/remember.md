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

Current owner decision: use one small JSON file, not a database (100 announcements would already be a lot). State is `announcements.json` in the existing Netlify Blobs service, with separate production/preview stores and conditional writes. Postgres, migrations, and connection settings are removed. Webhooks drive individual opted-in music listing posts, price drops, and Sold/Unavailable edits; nothing polls. A `discord-ready` product tag and explicitly approved `custom.discord_description` are required. Missing copy blocks publication; no Shopify-description fallback or silent truncation. The dummy load and zero-stock items are excluded from initial posts. See [the decision record](../docs/decisions/2026-11-16-discord-listing-announcements.md) and [setup/backfill/recovery runbook](../docs/engineering/discord-announcements.md). No public messages have been sent. Remaining launch work is channel/Blobs access, product fields, inventory scope, subscriptions, and the reviewed one-time backfill. The owner supplies secrets; agents do not retrieve their values.

JSON storage validation: 336 tests/61 files and the production build pass under Node 20 in CI/preview mode. No public posts have been sent.

PR #155 is merged (main afa8845). The owner approved factual newsfeed wording and the Tomatillo STR26001 description; exact approved copy is in [the copy record](../docs/engineering/discord-announcement-copy.md). Other descriptions still need approval. Reconcile the renderer's full Shopify title/URL-line format with the concise approved example before backfill. No public posts have been sent.

Remaining drafts and live Shopify metadata are collected in `docs/engineering/discord-announcement-copy.md` and its companion JSON packet (checked 2026-11-17 05:26 UTC / November 16 local). CuNiFe, PRS, and 5E3 descriptions are drafts; Tomatillo remains approved. All four have one unit and an Online Store URL, but the Discord metafield values and ready tags are unset. Public HTTP checks were blocked by the execution proxy. The owner expects an amp SN record; its link remains unresolved, and the current parser rejects the numeric 5E3 prefix. Do not claim the record itself does not exist or create a guessed SN URL.

Owner correction (2026-11-16): serial prefixes are three characters, not three letters. Parser, registry for the already-issued 5E3 prefix, allocator, and QR script now support numeric prefix characters. No amp record has been created or serial allocated. See the three-character prefix decision.

Prefix correction validation: 338 tests/62 files and the production build pass under Node 20; six allocator scenarios pass separately. The amp source/page remains unresolved despite the format correction.

Amp record: no existing source was found, so an unpublished `content/instruments/5E326001.mdx` draft now uses verified listing facts and the existing serial. The shared web/print amplifier map covers inputs, controls, essentials and safe use without guitar pickups. Exact-store Shopify photo URL is retained because the environment blocks downloading it. No tube/transformer/test-value assumptions were added. Source and pending checks: `docs/engineering/5e326001/README.md`.

Amp validation: 347 tests/64 files and production build pass; six allocator tests pass. Browser layout checks cover mobile/desktop and light/dark; Letter/A4 cards are one page and their QR decodes correctly. Photo appearance and actual measurement sheets remain unverified. Record stays unpublished pending review; preview PDFs are under `/workspace/scratch/5E326001-preview/`.

Owner attached an inline front photo of the amp: tweed covering, dark grille, four visible front screws; appears sideways. Visually reviewed and alt text updated. The attachment has no downloadable file ID/path in this cloud session, so it was not saved as a local asset; original Shopify URL remains. Original file/ZIP or local-environment access is needed for pixel-level orientation and asset replacement.

Owner supplied page 1 of K7RHY-BVR-5E3-R1 (5E326001, Aug 15 2026). Readable tube types, 120VAC/60Hz rating, 2A installed fuse, and recorded grounding/isolation values are transcribed under `docs/engineering/5e326001/build-verification-page-1.md` and attributed in the MDX record. Test mains116VAC, lead resistance0.05ohm, chassis0.003VAC/0VDC. Page2 operating measurements/release still missing; no maker claims from ambiguous tube annotations.

5E326001: owner supplied an interior-chassis photo; visible hand-wired board and wiring recorded in docs/engineering/5e326001/README.md. No netlist, position-specific component inventory, or electrical/release result inferred. Original image bytes and verification page 2 remain pending.


Launch closeout (owner authorized 2026-11-16): Archive.zip originals received; four upright local amp images saved, including control panel and inspection page 1. Amp `publish:true` prepared. All 3 Discord field definitions and 12 field values saved to Shopify/read back; four music items still stock 1. Dry-run messages saved in docs/engineering/discord-announcement-launch-preview.json. config/community.ts shares the existing public channel with the feed and enables production announcements (env false disables; previews remain blocked). Netlify env writes 403; no secrets retrieved. Pending: owner merge/deploy PR156 under AGENTS owner-merges rule, trigger each readiness tag, verify actual delivery, and verify extra Notifications paid/inventory subscriptions. Do not report messages sent without delivery evidence. Verification page 2 remains absent but does not block preserving established facts.

Owner explicitly approved merge-and-send. PR156 merged fbe0f81, production deploy6afbf6f36e4c41e113fbac5f ready. Amp discord-ready added; first webhook06:47:42Z returned200 with no delivery log. Runtime production guard depended on Netlify build-only CONTEXT; correction on codex/discord-runtime-context captures nonsecret K7RHY_DEPLOY_CONTEXT in next.config, preserves preview isolation, adds no-op diagnostics. Must redeploy correction and trigger fresh tag edit before claiming messages sent. Other3 remain untagged. Current permission covers finishing the necessary deployment fix and delivery; do not ask the same merge permission again.


CLOSEOUT: owner confirmed ALL FOUR Discord posts visible (amp, Tomatillo, CuNiFe, PRS). PR156 record/photo work and PR157 runtime-context fix are merged; production deploy6afbf99bf4b422ff9d1133e6 / be66f08 ready. Bot permissions corrected by owner; final readiness triggers200. Known IDs: amp1572145012316176504, Tomatillo1572145658704564274; last2 IDs not exposed in logs, owner confirmation is evidence. Four discord-ready tags remain; temporary backfill tags removed. Dummy load/zero-stock excluded. Receipts and current status in docs/engineering/discord-announcement-launch-receipt.json and discord-announcements.md. No further owner action needed for tonight's requested records/posts. Remaining follow-up: verify extra Admin Notifications paid/inventory subscriptions and preserve inspection sheet page2 when supplied; do not invent results or repost initial announcements.
