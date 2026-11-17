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
rendering, database state/leases, Discord delivery, and webhook routing. Music
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

Standard Postgres stores item state and inventory mappings. Production posting
is gated by an enable flag, channel ID, and production deploy context. Previews
cannot send announcements. The owner supplies secrets.

### Build correction: Netlify Database unavailable (2026-11-16)

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
Before launch, configure a supported Postgres database and apply its migration, then verify public text-channel permissions,
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
