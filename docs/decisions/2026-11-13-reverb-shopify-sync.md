# Reverb ↔ Shopify sync without polling

- **Date:** 2026-11-13
- **Status:**
  - Implemented in code.
  - Not yet validated in production: needs the environment variables and Shopify webhooks in `docs/engineering/listing-runbook.md`.
  - The Reverb end-listing reason value (`not_sold`) is unverified until the first real end.
- **Builds on:** `docs/decisions/2026-11-13-shopify-driven-shop.md`.

## Decision

Keep Reverb and Shopify consistent for one-off items using only event-driven checks. The owner chose this fallback over polling.

1. **Link:** each Shopify product listed on Reverb stores the Reverb listing number in the product custom field `custom.reverb_listing_id`. It's a single line of text, digits only, with Storefront access on. Shopify stays the single place to edit; the site keeps no separate mapping.
2. **Shopify sale:** the Shopify "Order creation" webhook triggers the site to:
   - end the Reverb listing with the no-fee "not sold" reason;
   - or, if Reverb already sold it, post a double-sale alert so the owner cancels the Shopify order.
3. **Reverb sale:** when someone opens the item's page on k7rhy.app, the page asks Reverb whether it has sold.
   - If it has, the page shows "Sold" instead of the buy button.
   - It also posts an alert (at most hourly) asking the owner to zero the item in Shopify.
   - The check fails open after 4 seconds so a Reverb outage never blocks a sale.
4. **Price:** the Shopify "Product update" webhook sets the Reverb price to Shopify × 1.05, rounded up to the next $5. This applies only to single-price products whose Reverb listing is live. Price never flows from Reverb to Shopify.
5. **Alerts:** posted to a private Discord channel by the site's existing bot.

## Why

- The owner asked for no polling (2026-11-13).
- Reverb's sale webhooks need an OAuth app:
  - personal tokens are refused;
  - Reverb offers no self-serve app registration;
  - its docs recommend polling for orders.
- Shopify's in-checkout validation with outside calls is limited to Enterprise (Plus) stores.
- Shopify no longer lets stores create Admin API tokens from the admin (since 2026-01-01), so this design avoids the Admin API. Shopify webhooks come from Settings → Notifications, and the Reverb ID is read through the existing Headless Storefront token.

## Known gap

A buyer who goes straight to shop.k7rhy.app after a Reverb sale, without anyone opening the k7rhy.app product page, can still check out. The order webhook then flags the double sale immediately, so the owner can cancel before shipping.

This closes if Reverb grants OAuth access with the `orders/paid` webhook (ask integrations@reverb.com), or if Shopify Admin access is added so the site can zero Shopify stock itself.

## Unresolved

- **End reason:** confirm Reverb accepts `{"reason": "not_sold"}` on `PUT /api/my/listings/{id}/state/end`. If the first real end fails, the alert says to end it by hand.
- **STR26001's Reverb price:** it is $845. The rule gives $840, so the first product update will move it to $840 unless the rule changes.
