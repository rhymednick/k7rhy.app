# Discord product announcements

Status: owner authorized launch on November 16, 2026. Shopify definitions and all four descriptions/links are saved and verified. Production deployment, readiness triggers, and live delivery validation remain pending.

Shopify remains the source for the single-variant music listings. The existing
`/api/shopify/webhooks` receiver also drives public Discord announcements.
There is no timer, scheduled job, or recurring catalog scan.

## Owner workflow

1. Finish the product in Shopify, publish it to Online Store and Headless, and
   verify its stock and category. Only guitars and amplifiers are eligible.
2. Write and approve the required **Discord description** below. Populate any
   optional record/related links and verify every linked page.
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

## Product fields

Create merchant-owned product metafield definitions under **Settings → Custom
Data → Products**, with Storefront read access. This matches the existing Reverb
fields and lets the existing Headless token read them. Set values after creating
the definitions; the integration reads them on the next product event.

| Name | Namespace/key | Type | Meaning |
|---|---|---|---|
| Discord description | `custom.discord_description` | Multi-line text | Required approved announcement copy; no product-description fallback |
| Discord record URL | `custom.discord_record_url` | URL | Existing exact `https://k7rhy.app/sn/SERIAL` record; blank when no record exists |
| Discord related URLs | `custom.discord_related_urls` | List of URLs | Up to three related pages, such as wiring references |

A missing or blank Discord description excludes the item from announcements and
backfill, even if it is tagged ready. The approved text is not rewritten or
truncated: after Markdown escaping it must fit within 650 characters, otherwise
the delivery is blocked with an error asking for shorter approved copy.
Paragraph breaks are preserved.

Every post also links the Shopify purchase page and the k7rhy.app product page.
No serial number is guessed or turned into a URL automatically. Discord posts
and the Community feed may display the supplied serial links, as requested by
the owner; this does not change catalog navigation or serial indexing policy.
The dummy load is excluded by category even if accidentally tagged ready.

## Production setup

The owner supplies secrets; agents do not retrieve their values. Use the existing
Shopify signing secret, Storefront token, and Discord bot token.

- The versioned public defaults in `config/community.ts` enable product announcements in the existing Community announcement channel (`1432603806704603248`). `DISCORD_ANNOUNCEMENTS_CHANNEL_ID` optionally overrides that destination with a regular public text/announcement channel.
  The bot needs View Channel, Send Messages and Read Message History. This first
  version uses status text in the post, not forum tags. Forum channels require a
  different create-thread API and are not supported by this client.
- `DISCORD_ANNOUNCEMENTS_ENABLED` optionally overrides the owner-approved versioned setting. Set it to `false` in the Functions scope for an emergency stop. A production-context check still prevents preview/dev writes. Public defaults are source configuration because TOML build environment variables do not reach function runtimes; secrets remain in Netlify.
- `CONTEXT=production`: supplied by Netlify; previews never send public posts.
- Storefront token: enable `unauthenticated_read_product_inventory` to read
  `quantityAvailable`, in addition to the existing product/metafield access.
- Storage: one private **`announcements.json`** file in Netlify Blobs, using the
  existing `@netlify/blobs` package. The production store is named
  `discord-announcements-production`; non-production uses
  `discord-announcements-preview`. Production data survives site deploys.
  No database, connection string, schema migration, or additional service is
  required. Netlify supplies Blobs access to the server at runtime; builds do
  not access it. Netlify Dev uses isolated local storage.
- Browse or download the JSON file in Netlify's **Data & Storage → Blobs** UI.
  It is not a website asset and has no public download endpoint.

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

A short lease in the JSON file serializes its updates. The file records the complete next
action before contacting Discord. The receiver returns 503 if announcement work
fails, allowing Shopify delivery retries. Reverb still runs independently.
The file is read with strong consistency. Every write either creates it only if
absent or replaces exactly the revision that was read, using its ETag. A
conflicting writer gets a retryable error; it never overwrites newer state. An
expired worker cannot release a newer worker's lease. Invalid/unknown file
versions are rejected rather than replaced with an empty file. This is a small,
low-frequency file tracker, not a general transaction system. There is no claim
of exactly-once delivery across Shopify and Discord.

Discord edits can be repeated safely. A definite rejected create (such as 429)
can be retried. A timeout, a server error, or a process crash around a create is
ambiguous: it might have posted. The pending action remains blocked until the
operator inspects the channel. The nonce helps with short-term duplicate
suppression but is not relied on as permanent deduplication.

Failure details and pending actions persist in the JSON file; the webhook also
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

Run in a configured Netlify runtime with Storefront access (use Netlify Dev
for isolated local storage). Do not paste secret values into
commands or logs. A live apply additionally requires the production context and
enabled/channel variables above. All commands omit `--apply` by default.

```sh
# Export a readable JSON copy without changing state.
npm run --silent announcements -- export > announcements.json
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

Before the initial backfill, approve and set each Discord description, set the optional record/related fields and tag each
intended listing ready. Keep posting disabled until the dry run is reviewed;
then enable and run the one-time backfill. Products that have since sold are
excluded by a fresh read immediately before processing.


## November 16 launch preparation

Shopify definitions `844072157341`, `844072190109`, and `844072222877` were
created with Storefront read access. All twelve field values for the four
in-stock music products were saved and read back. The dummy load and two
zero-stock products were excluded. The owner authorized the previously drafted
copy and amp-record publication in the instruction to finish and send.

[Launch preview](discord-announcement-launch-preview.json) records dry-run
messages rendered by the actual normalizer/renderer using fresh Admin product
and inventory data. This validates content and lengths, not production
Storefront inventory scope or Discord delivery. Headless access-scope inspection
was denied to the connected Shopify app. Netlify environment writes returned
403 on both connected links; no secret values were requested or retrieved.

After PR #156 is deployed, add `discord-ready` to each eligible product, one at
a time, through Shopify. These product edits are the webhook triggers; do not
use Send test, post manually outside the state tracker, or add a timer. Check
server delivery/Discord results and the saved mapping before retrying an
ambiguous create. Additional Admin Notifications subscriptions for paid orders
and inventory events still require setup/verification in Shopify Admin; the
connector's app subscriptions cannot establish their state.

## First production trigger and runtime-context correction

PR #156 was merged with the owner's explicit permission and deployed as
`6afbf6f36e4c41e113fbac5f` (commit `fbe0f81`). Adding `discord-ready` to the amp
produced a signed Shopify webhook with HTTP 200 on November 17 at 06:47:42 UTC,
but no confirmed Discord message ID. Do not treat HTTP 200 alone as delivery.

Netlify's `CONTEXT` is a build variable. The production guard now uses
`K7RHY_DEPLOY_CONTEXT`, captured in Next's non-secret build configuration, with
`CONTEXT` as a fallback for the local management command. A preview's compiled
context takes precedence over runtime values, so it cannot be promoted to
production by a runtime override. Tests cover omitted runtime CONTEXT and preview
isolation. No-delivery diagnostics expose only readiness/availability flags and
public product/message IDs. No secrets are logged or retrieved.

The amp is tagged ready but still has no confirmed public message. After the
correction deploys, trigger a fresh product tag edit without clearing readiness;
then inspect confirmed message IDs before processing the remaining products.
