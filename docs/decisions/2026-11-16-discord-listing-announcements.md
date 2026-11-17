# Discord listing announcements

Date: 2026-11-16 (owner's timezone).

Status: implemented locally; automated validation recorded below. Production
activation, subscription setup, and the requested historical posts are pending.

## Owner decisions

- Shopify webhooks trigger announcements and updates. Nothing polls. This
  supersedes the assistant's proposed fifteen-minute scheduled check.
- Each listing has an explicit ready step. Announce music items individually,
  including a one-time backfill of currently published, available items.
- Exclude the dummy load and existing zero-inventory items from the backfill.
- Current music listings are one-of-a-kind items with a single variant.
- Include a description, purchase page, existing serial record, and related pages.
- **Approved description required** (owner, 2026-11-16): use the explicitly
  approved `custom.discord_description` text. Missing/blank copy prevents
  announcement and backfill. Never generate copy or fall back to the Shopify
  description. Overlong copy must be shortened and approved; never silently
  truncate it. This supersedes the initial optional-summary fallback.
- Announce price drops and mark the original post sold when the item sells.
- Individual serial-record links may appear in these announcements and the
  site's Community feed; catalog serial-indexing restrictions remain in force.

## Implementation

Extend `app/api/shopify/webhooks/route.ts`, which already handles Reverb sync.
The first search was against stale code at `a07b54e`; refreshing to `3f1b6c8`
revealed this receiver and the existing private Discord sales-alert client.
An empty subscription result from the connected Shopify app did not inventory
Shopify Admin Notifications subscriptions. Reuse the Admin-configured receiver,
its signature verification, test filters, Storefront token, and Discord bot.

Readiness is the **`discord-ready` product tag**, replacing the proposed boolean
metafield. Shopify's verified `WebhookSubscriptionTopic` enum has definition
change events but no metafield-value change topic. A product tag edit supplies
a supported Product update trigger, without another app or a timer. The required
approved summary and optional serial-record/related URLs remain Storefront-readable product
metafields, defined before use in Shopify Admin.

`lib/announcements/` contains product reads, deterministic eligibility and message
rendering, JSON file state/leases, Discord delivery, and webhook routing. Music
category, single variant, positive stock, public purchase page, and ready tag
and an approved Discord description are required for an initial announcement. Ham radio products are excluded.
Read current state on each product event so delayed updates do not replay old
prices or old product status. Paid orders establish Sold; withdrawals and unpaid
reservations establish Unavailable. Known sales stay sold until explicit operator
restoration following a return/cancellation. Existing Reverb page checks also
update the announcement when they find a sale. Offline sales can be explicitly
marked through the management command.

Persist each next action before a Discord call. Product leases prevent competing
workers; price baselines and message IDs prevent repeated completed notices.
Definite rejections and repeatable edits can retry through webhook delivery.
Ambiguous creates remain pending until the operator identifies the resulting
message or positively confirms no message was sent. Discord's short-lived nonce
suppression is supplementary; there is no exactly-once claim across systems.

Announcement failures return 503 without preventing Reverb sync. The existing
Reverb error behavior is unchanged. Shopify retries are finite; a management
command supports inspection, resolution, replay, explicit sold/restore actions,
and dry-run-first backfill. No scheduled replay or reconciliation is installed.
The small inventory-ID map comes from REST product deliveries. An unmatched
inventory event refreshes tracked products once to cover backfilled products
whose first REST delivery has not happened yet.

A single private JSON file in Netlify Blobs stores item state and inventory mappings. Production posting
is gated by an enable flag, channel ID, and production deploy context. Previews
cannot send announcements. The owner supplies secrets.

### Historical build correction: Netlify Database unavailable (2026-11-16; superseded storage choice)

Preview deploy [6afbddd18212162085c07f34](https://app.netlify.com/projects/k7rhy/deploys/6afbddd18212162085c07f34)
failed before `npm run build`, while Netlify tried to provision a database:
`createSiteDatabase` returned HTTP 403, **database feature not available for this account**.
The owner supplied the detailed build log. This supersedes the Netlify Database
SDK/automatic-provisioning design, which was not verified against this account.

Remove `@netlify/database` and its automatic migration directory. Use the standard
`pg` client with an explicitly supplied `DISCORD_ANNOUNCEMENTS_DATABASE_URL`.
Connections are lazy; disabled announcements and builds need no database. Apply
the same additive schema explicitly through `npm run announcements:migrate -- --apply`
after selecting a supported Postgres service. The migration command is dry-run by
default and records its checksum to prevent accidental reapplication. Retain the
existing site Node 20 runtime; the removed SDK was the only reason to require 22.
No external database has been provisioned, no secrets have been retrieved, and no
account plan has been changed. Production posting/backfill remain pending setup.

## Validation and remaining launch work

Automated tests cover eligibility, repeat deliveries, price drops/increases,
confirmed sales, withdrawals/restocking, uncertain creates, retries, concurrency,
expired database leases, durable pending data, webhook authentication, integration
failure isolation, and Discord request behavior. Production build validation is
complete under Node 22: `npm run build` passed with 328 tests in 61 files, Next.js compilation/type/lint checks, static generation, and sitemap generation. The local build exercised the existing Shopify-unreachable fallback; live Storefront/Discord end-to-end validation remains pending. No live posts have been sent.

See [the setup and recovery runbook](../engineering/discord-announcements.md).
Before launch, verify Netlify Blobs runtime access and public text-channel permissions,
Storefront inventory scope, optional product-field definitions/values, and
additional paid-order/inventory subscriptions. Dry-run the ready listings, then
perform the requested one-time backfill. Live end-to-end delivery is not yet
validated. Forum tags are not implemented: this version edits status text in a
regular announcement channel.

Related records: [listing runbook](../engineering/listing-runbook.md),
[Shopify/Reverb sync](2026-11-13-reverb-shopify-sync.md), and
[Shopify-driven shop](2026-11-13-shopify-driven-shop.md).

No natural-language classification step is introduced. Readiness, prices, and
stock transitions use explicit fields and deterministic code; no Jev opportunity
is proposed for these exact comparisons.

Follow-up validation: announcement tests verify missing/blank descriptions block publication, approved paragraph text is retained, and overlong copy fails instead of being truncated.

Build-correction validation: all 333 tests in 62 files and the production build pass under Node 20 with `CI=true` and `CONTEXT=deploy-preview`. The schema dry run also succeeds without a database connection. Netlify preview confirmation is pending.

## Current storage decision: one JSON file (owner, 2026-11-16)

The owner rejected the database requirement: even 100 announcements would be a
large volume for this site, so JSON or YAML is sufficient. This supersedes both
the original Netlify Database design and the subsequent standard-Postgres design.

Use a single private `announcements.json` object in the existing Netlify Blobs
service. Its versioned contents include product states, inventory mappings, and a
short file-wide lease. Strong reads plus ETag-conditional creation/replacement
prevent a stale writer from overwriting newer data; conflicts return a retryable
error. Pending Discord creates still survive crashes and require inspection when
uncertain. Production and preview use different store names. No file is served as
a public asset. A read-only export command produces a normal JSON backup.

The Postgres client, test database, connection variable, schema migration, and
migration command are removed. The existing Netlify Blobs SDK provides runtime
access; site builds make no storage calls. No separate service needs provisioning.
This is the owner's explicitly chosen file-based design for a tiny, infrequently
updated tracker, not a claim that Blobs is a general-purpose transactional database.

JSON-file validation: all 336 tests in 61 files and the production build pass under Node 20 in CI/preview context. File tests cover conditional first creation, concurrent writers, expired leases, pending recovery, invalid files, read-only export, and production/preview isolation. Live Blobs/Discord posting is still pending activation.

## Approved announcement style and first description (2026-11-16)

After merging PR #155, the owner approved a factual newsfeed format rather than
first-person or personal promotional copy. Use a concise product/serial headline,
two factual description sentences, current price, and related links. The Tomatillo
S-Type description was explicitly approved; other descriptions remain unapproved.
Exact copy and the presentation follow-up are in
[the announcement copy record](../engineering/discord-announcement-copy.md).

Editorial preparation: the copy record now includes drafts for the remaining CuNiFe S-Type, PRS SE Custom 24, and 5E3 amplifier, plus a structured Shopify metadata snapshot. Only Tomatillo copy is approved. The owner raised an existing amp SN record; current main contains no matching source and the current serial parser rejects the 5E3 prefix. Its page link is unresolved, not evidence that the record/paperwork does not exist. Live HTTP validation was blocked by the execution proxy; no Shopify values or Discord posts were changed during preparation.

Amp record follow-up: the owner authorized creating a record from available sources. `content/instruments/5E326001.mdx` now exists as an unpublished amplifier record, using the existing serial and verified Shopify facts. Its planned canonical URL remains out of live announcement fields until review/publication. Sources, unknowns, photo-access limitations, and validation are in [the amplifier engineering record](../engineering/5e326001/README.md).

## Launch authorization and public defaults (2026-11-16)

Owner instruction: finish saving the records and send the Discord announcements.
This authorizes the four prepared descriptions and publication of the completed
amp record with established facts; it does not establish the absent page-2
measurements. All twelve product field values and their three Storefront-readable
definitions have now been saved and read back in Shopify.

Public production defaults now live in `config/community.ts`, shared with the
Community feed: enabled, channel `1432603806704603248`. The runtime's production
context guard is retained; optional Netlify Functions environment variables can
override the channel or disable posting. This replaces the requirement to create
two additional runtime variables before launch. Netlify's connector denied those
writes with 403, and TOML build variables do not reach Functions at runtime.
Existing bot and Storefront secrets remain managed on Netlify and were not read.

Status: prepared in PR #156; dry-run rendering and local checks pass. Production
publication, per-product readiness triggers, Discord delivery evidence, and the
extra paid-order/inventory subscriptions are still pending. Do not confuse the
saved editorial preview with the runtime `announcements.json` delivery state.


## Launch completed (2026-11-16 local)

All four available music listings are announced, and the owner confirmed all
four posts in Discord. The amp record and four upright source images are saved
and deployed. PR #157 fixes the build/runtime context distinction while keeping
preview writes blocked. Discord channel permissions were corrected by the owner.
See `docs/engineering/discord-announcement-launch-receipt.json` for delivery
evidence and remaining subscription-verification work. No live price drop or
sale was manufactured as a test, and no absent page-2 measurements are claimed.

## Compact messages without preview cards (2026-11-16)

Owner decision: link previews made each product announcement look like a flood
of separate attachments/posts. The owner removed Embed Links permission and
manually suppressed the existing previews. Keep clickable URLs, but suppress
Discord preview embeds for all listing creates/edits and price-drop notices.
The delivery client now sets message flag 4 explicitly. This supersedes relying
on default Discord unfurling or bot permissions to determine presentation.
Status: implemented and tested in a PR, awaiting merge/deployment. The four
existing messages remain as the owner cleaned them.

## Descriptive inline links (2026-11-16)

Owner requested clickable words in descriptions rather than extra raw URL lines,
then explicitly authorized changing the algorithm and updating existing bot posts.
The renderer now links existing approved phrases to the provided related pages
where the relationship is known. Other supplied links appear as named words in
a short sentence within the description. Purchase/details and price-drop targets
also use named links. This supersedes the initial raw-URL presentation.
The approved source description remains unchanged; formatting is deterministic,
not generated copy. Community rendering recognizes these same named links.
Status: implemented and tested; production deployment and in-place refresh follow.
