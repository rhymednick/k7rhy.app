# Discord product announcements

Status: implemented locally; production setup and live validation pending.

Shopify remains the source for the single-variant music listings. The existing
`/api/shopify/webhooks` receiver also drives public Discord announcements.
There is no timer, scheduled job, or recurring catalog scan.

## Owner workflow

1. Finish the product in Shopify, publish it to Online Store and Headless, and
   verify its stock and category. Only guitars and amplifiers are eligible.
2. Optionally populate the announcement fields below. Verify every linked page.
3. Add the product tag **`discord-ready`** and save. This product edit triggers
   the existing Product update webhook. Draft/unpublished/out-of-stock items
   cannot receive an initial announcement. A missing inventory permission or
   unknown quantity never establishes availability.
4. Later selling-price changes update the original post. Each decrease posts a
   separate old-price → new-price notice linking to it. Increases update the
   original without a separate notice. Currency changes establish a new baseline.
5. A paid Shopify order marks the original Sold. An unpaid order or inventory
   removal marks it Unavailable. Removing the readiness tag also withdraws it.
   Restocking an unavailable item restores the same post without a new release.

Readiness uses a tag deliberately: the verified Shopify webhook topic enum has
no `metafields/update` event. A metafield alone is not a reliable trigger. After
changing only an optional announcement field, also save a product tag edit or
run the replay command. Do not use a metafield-definition update event: that
changes a field's schema, not the product's value.

The existing Reverb check on a product-page visit also marks a known Reverb sale
Sold in Discord. It still does not change Shopify stock. For Facebook/offline
sales, archive the Shopify item as before, then use the explicit `sold` command.
Archival alone cannot prove a sale. Returns/cancellations deliberately require
checking that the physical item is actually back before running `restore` and
then `replay`; a delayed product event never silently reverses Sold.

## Optional product fields

Create merchant-owned product metafield definitions under **Settings → Custom
Data → Products**, with Storefront read access. This matches the existing Reverb
fields and lets the existing Headless token read them. Set values after creating
the definitions; the integration reads them on the next product event.

| Name | Namespace/key | Type | Meaning |
|---|---|---|---|
| Discord description | `custom.discord_description` | Multi-line text | Short owner-written introduction; otherwise the product's plain-text description is shortened |
| Discord record URL | `custom.discord_record_url` | URL | Existing exact `https://k7rhy.app/sn/SERIAL` record; blank when no record exists |
| Discord related URLs | `custom.discord_related_urls` | List of URLs | Up to three related pages, such as wiring references |

Every post also links the Shopify purchase page and the k7rhy.app product page.
No serial number is guessed or turned into a URL automatically. Discord posts
and the Community feed may display the supplied serial links, as requested by
the owner; this does not change catalog navigation or serial indexing policy.
The dummy load is excluded by category even if accidentally tagged ready.

## Production setup

The owner supplies secrets; agents do not retrieve their values. Use the existing
Shopify signing secret, Storefront token, and Discord bot token.

- `DISCORD_ANNOUNCEMENTS_CHANNEL_ID`: a regular public text/announcement channel.
  The bot needs View Channel, Send Messages and Read Message History. This first
  version uses status text in the post, not forum tags. Forum channels require a
  different create-thread API and are not supported by this client.
- `DISCORD_ANNOUNCEMENTS_ENABLED=true`: enable only after setup and dry-run review.
- `CONTEXT=production`: supplied by Netlify; previews never send public posts.
- Storefront token: enable `unauthenticated_read_product_inventory` to read
  `quantityAvailable`, in addition to the existing product/metafield access.
- Runtime: Netlify Database requires Node 22.12 or newer. This change aligns
  `.nvmrc`, the package engine, and Netlify build settings on Node 22.
- Netlify Database: this change installs `@netlify/database` and adds an additive
  migration under `netlify/database/migrations/`. Verify the site's credit-plan
  eligibility and database cost before deploying. Deployment provisions/applies
  the migration; do not apply hosted DDL manually. This feature needs durable
  database state even though it runs only on events.

Keep the existing Shopify Admin Notifications subscriptions. Add the following
JSON subscriptions to the same receiver URL:

| Topic | Purpose |
|---|---|
| Order payment (`orders/paid`) | Confirm a sale after an initially unpaid order |
| Inventory level update (`inventory_levels/update`) | Manual stock changes |
| Inventory level disconnect (`inventory_levels/disconnect`) | Removed inventory location |

Existing Product creation/update/deletion and Order creation subscriptions remain.
Never click Shopify's **Send test**, which uses real product IDs. Use automated
fixtures locally and a deliberately created non-sale test product for live
validation. Do not point production Shopify subscriptions at a public preview.

## Delivery and recovery

A database lease serializes each product. Its state records the complete next
action before contacting Discord. The receiver returns 503 if announcement work
fails, allowing Shopify delivery retries. Reverb still runs independently.
There is no claim of exactly-once delivery across two external systems.

Discord edits can be repeated safely. A definite rejected create (such as 429)
can be retried. A timeout, a server error, or a process crash around a create is
ambiguous: it might have posted. The pending action remains blocked until the
operator inspects the channel. The nonce helps with short-term duplicate
suppression but is not relied on as permanent deduplication.

Failure details and pending actions persist in the database; the webhook also
logs a safe error. Shopify retries are finite: inspect failed deliveries and
replay explicitly after correcting configuration. No cron silently retries them.
If a public post was deleted, do not automatically replace it; inspect and
resolve the saved mapping first. Changing the destination channel likewise
requires an explicit migration of existing mappings.

Inventory notifications contain inventory IDs rather than product IDs. REST
product deliveries save that mapping. Before the first such delivery after a
backfill, an unmatched inventory event refreshes only tracked products once;
it never starts a recurring scan.

## Commands

Run with the configured Netlify database and Storefront environment (for local
validation, use Netlify Dev's isolated database). Do not paste secret values into
commands or logs. A live apply additionally requires the production context and
enabled/channel variables above. All commands omit `--apply` by default.

```sh
# Review currently ready, published, in-stock music listings; no Discord writes.
npm run announcements -- backfill
# Once reviewed, create missing posts through the normal duplicate protection.
npm run announcements -- backfill --apply
npm run announcements -- inspect --product 15437135675549
npm run announcements -- replay --product 15437135675549 --apply
# Explicitly mark an offline sale after verifying it.
npm run announcements -- sold --product 15437135675549 --apply
# After a genuine cancellation/return and restock, clear Sold, then replay.
npm run announcements -- restore --product 15437135675549 --apply
```

After an uncertain create, inspect the saved action and the channel. If the
message exists, give its ID; if positively confirmed absent, use `not-sent`.
Resolving records the outcome; replay resumes remaining actions.

```sh
npm run announcements -- resolve --product 15437135675549 --message MESSAGE_ID --apply
npm run announcements -- resolve --product 15437135675549 --message not-sent --apply
npm run announcements -- replay --product 15437135675549 --apply
```

Before the initial backfill, set the optional record/related fields and tag each
intended listing ready. Keep posting disabled until the dry run is reviewed;
then enable and run the one-time backfill. Products that have since sold are
excluded by a fresh read immediately before processing.
