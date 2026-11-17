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
a supported Product update trigger, without another app or a timer. Optional
summary, serial-record URL, and related URLs remain Storefront-readable product
metafields, defined before use in Shopify Admin.

`lib/announcements/` contains product reads, deterministic eligibility and message
rendering, database state/leases, Discord delivery, and webhook routing. Music
category, single variant, positive stock, public purchase page, and ready tag
are required for an initial announcement. Ham radio products are excluded.
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

New Netlify Database migration stores item state and inventory mappings.
Production posting is gated by an enable flag, channel ID, and production deploy
context. Previews cannot send announcements. Database plan eligibility/cost must
be verified before deployment. Do not read secret values: the owner supplies them.

## Validation and remaining launch work

Automated tests cover eligibility, repeat deliveries, price drops/increases,
confirmed sales, withdrawals/restocking, uncertain creates, retries, concurrency,
expired database leases, durable pending data, webhook authentication, integration
failure isolation, and Discord request behavior. Production build validation is
complete under Node 22: `npm run build` passed with 328 tests in 61 files, Next.js compilation/type/lint checks, static generation, and sitemap generation. The local build exercised the existing Shopify-unreachable fallback; live Storefront/Discord end-to-end validation remains pending. No live posts have been sent.

See [the setup and recovery runbook](../engineering/discord-announcements.md).
Before launch, verify the Netlify database plan, public text-channel permissions,
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
