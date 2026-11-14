# Shopify as the hub: Shopify → Reverb sync without polling

- **Date:** 2026-11-13
- **Status:**
  - **Order and page-check sync** (PR #144, #146): implemented, deployed, and validated.
    - The Order creation webhook's signature check passed with a Shopify test notification on 2026-11-13.
    - The page check works against live Reverb listings from Netlify, with signed reads.
    - Ending a listing (reason `not_sold`) and the Discord alert both ran during the test incident below.
    - A real sale hasn't run yet.
  - **Product hub sync** (create, update, end, relist): implemented in the PR after #146. Not yet deployed, and the Product webhooks aren't added yet.
    - Unverified: whether Reverb accepts the calculated-shipping fields on create (there's a draft fallback), and whether `PUT {publish: true}` relists an ended listing.
- **Builds on:** `docs/decisions/2026-11-13-shopify-driven-shop.md`.

## Decision

**Shopify is the hub** (owner, 2026-11-13). The owner creates and edits items in Shopify, and Shopify webhooks to k7rhy.app keep Reverb in step. Nothing polls.

1. **Opt-in:** a product goes to Reverb only when its **List on Reverb** field (`custom.list_on_reverb`) is on.
   - Switching it explicitly off ends the listing.
   - A never-set value keeps an existing listing in sync but never creates one. This protects the three listings made by hand before the hub.
2. **Create:** on Product creation or Product update, an Active, in-stock, opted-in product with no Reverb listing gets one. It goes **live right away** (owner choice), with calculated shipping.
   - The calculated-shipping fields aren't documented by Reverb; the request mirrors the shape Reverb shows on existing listings.
   - If Reverb rejects them, the listing is created as a draft and Discord asks the owner to set shipping and publish (owner choice).
   - **Field mapping:**

     | Reverb field | Source |
     |---|---|
     | Title, description (HTML, `/sn/` links stripped), photos | Shopify |
     | Price | Shopify + 5%, rounded up to $5 |
     | Make | **Reverb make** field, or K7RHY Resonance Lab |
     | Model | **Reverb model** field, or the product title |
     | Finish | **Reverb finish** field |
     | Year | **Reverb year** field, or the current year (my own builds only) |
     | Condition | **Reverb condition** field, or Brand New (my own builds only) |
     | Category, Handmade flag | the Shopify category (guitars: Solid Body, not handmade; amps: Guitar Combos, handmade). Gear whose make isn't K7RHY is never handmade. |
     | Box size and weight | **Reverb package size** and **Reverb package weight** fields, or the category's box (guitars 44×17×6 in, 19 lb; amps 21×21×11 in, 39.5 lb) |
     | Offers | on |
3. **Link:** the site sets each listing's Reverb SKU to `shopify-<product id>` and finds listings by SKU through the Reverb API.
   - This also works when the product is Draft or Archived, which Shopify hides from the Storefront API.
   - Listings made by hand are found through the **Reverb listing ID** field (`custom.reverb_listing_id`), and get the SKU written onto them.
4. **Update:** on Product update, the Reverb price, title, and description follow Shopify.
   - Photos aren't re-synced after creation, to avoid duplicates.
   - **Price flows Shopify → Reverb only.** This supersedes the earlier "Reverb leads" rule set the same day.
5. **End and relist:**
   - Draft, Archived, quantity 0, **List on Reverb** off, or a deleted product ends the listing (no-fee "not sold").
   - Back to Active with stock relists an ended listing.
   - A listing that sold on Reverb is never touched.
6. **Shopify sale:** the Order creation webhook ends the Reverb listing, or posts a double-sale alert if Reverb already sold it.
7. **Reverb sale:** when someone opens the product page on k7rhy.app, the page checks Reverb.
   - If it sold, the page shows "Sold" and reminds the owner, at most hourly, to archive the product in Shopify.
   - The check fails open after 4 s.
8. **Alerts:** posted to a private Discord channel by the site's existing bot.

## Resold gear and drafts (2026-11-13, implemented, not yet deployed)

The first resold item, a used 2024 PRS SE Custom 24 (Shopify product 15437296697501, Reverb listing 104136246), was created as Make "K7RHY Resonance Lab", Year 2026, Brand New. The owner fixed it by hand in Reverb. So:

- **Per-product make, year, condition, and box.** Five optional product fields (`custom.reverb_make`, `reverb_year`, `reverb_condition`, `reverb_package_size`, `reverb_package_weight`) override the defaults. Blank keeps the defaults for my own builds. Condition names map to the UUIDs from Reverb's `GET /api/listing_conditions` (fetched 2026-11-13).
- **Brand New is only for my own builds.** When the make isn't K7RHY Resonance Lab, the sync refuses to create the listing unless the product has a Reverb condition other than Brand New and a Reverb year, because the defaults (Brand New, this year) are wrong for resold gear. Such gear is never marked handmade.
- **Calculated shipping on create:** the PRS create was refused with `missing rate information on shipping`. Reverb's create-listing docs (reverb-api.com/docs/create-listings) only show `shipping.rates[]` entries with a fixed `rate: {amount, currency}`, and document no `carrier_calculated` field or package fields. The sync's rate entry has `carrier_calculated: true` and no amount, so that entry causes the refusal, not the default box size or weight. The live attempt and the draft fallback stay as they are, and the 📝 alert now gives the box to enter in Reverb's editor. I didn't send a placeholder amount, which could publish a listing with that fixed shipping price.
- **Drafts are never published by an update.** Before, any Shopify edit on a product whose listing was a draft sent `PUT {publish: true}`. For a draft made because shipping was refused, that publish fails the same way, and the thrown error also stopped the price, title, and description edits. Now edits sync first, a draft stays a draft, and 🔄 says it's still a draft that the owner publishes in Reverb's editor. Ended listings still relist. If Reverb refuses the relist, the edits still sync and ⚠️ asks for a relist by hand.
- **Not covered:** a change to make, year, condition, or box in Shopify after the listing exists isn't sent to Reverb (only price, title, and description are). Change those in Reverb's editor too.

## Why

- The owner wants one place to manage inventory, and no polling (2026-11-13). LitCommerce was rejected on price for the owner's volume.
- Reverb's sale webhooks need an OAuth app:
  - personal tokens are refused;
  - Reverb offers no self-serve app registration;
  - its docs recommend polling for orders.

  So a Reverb sale can't flow back to Shopify automatically.
- Shopify's in-checkout validation with outside calls is limited to Enterprise (Plus) stores.
- Shopify no longer lets stores create Admin API tokens from the admin (since 2026-01-01), so this design avoids the Admin API:
  - Webhooks come from Settings → Notifications.
  - Product fields are read through the existing Headless Storefront token.
  - That's why a Reverb sale can't zero Shopify stock, and why the site can't write the listing ID back to Shopify. The SKU link replaces it.
- Reverb shipping profiles support only flat or free rates, and the owner uses calculated shipping.

## Incident: a Shopify test ended a live Reverb listing (2026-11-13)

The owner used "Send test" on the new Order creation webhook. Shopify's sample order used the real 5E3 amp product, so the handler ended the amp's live Reverb listing (101259462) with the no-fee "not sold" reason. It was relisted on the same listing (views and watchers kept) a few minutes later.

Fix (PR #146, extended to product webhooks):
- The handlers skip Shopify's sample markers and post 🧪 for skipped test orders. The markers are:
  - the `test` flag;
  - `#9999` and the sample order ID;
  - `@example.com` emails;
  - the sample product ID and "Example T-Shirt".
- Every order delivery logs a summary with no customer details.
- The runbook says never to use "Send test" on these webhooks.

## Known gap

A Reverb sale doesn't reach Shopify automatically. A buyer who goes straight to shop.k7rhy.app after a Reverb sale, without anyone opening the k7rhy.app product page, can still check out. The order webhook then flags the double sale immediately, so the owner can cancel before shipping.

This closes if Reverb grants OAuth access with the `orders/paid` webhook (ask integrations@reverb.com), or if Shopify Admin access is added so the site can archive or zero the Shopify product itself.

## Unresolved

- Whether Reverb's API can create a listing with calculated shipping at all. If Reverb documents it (or support explains the field), the live create path can be fixed; until then creates land as 📝 drafts.

- Whether Reverb accepts the calculated-shipping fields on create. The first real create will tell, by 🆕 or 📝.
- Whether `PUT /api/listings/{id}` with `{publish: true}` relists an ended listing. If not, Discord says so and the owner relists by hand.
- **STR26001:** its Reverb price moves from $845 to $840 at its next Shopify edit, under the +5% rule.
- **Existing listings:** their Reverb titles and descriptions will be overwritten with Shopify's at their next Shopify edit.
