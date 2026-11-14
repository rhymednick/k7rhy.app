# Reverb ↔ Shopify sync without polling

- **Date:** 2026-11-13
- **Status:**
  - Implemented and deployed (PR #144, 2026-11-13).
  - Validated: the Order creation webhook's signature check (Shopify test notification accepted 2026-11-13) and the page check against live Reverb listings from Netlify (once reads were signed).
  - Ending a listing (reason `not_sold`) and the Discord alert both ran during the 2026-11-13 test incident below. A real sale hasn't run yet.
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
4. **Price: Reverb leads, one direction only** (owner, 2026-11-13). The owner sets Reverb prices. The Shopify price is the Reverb price less 5%, rounded down to $5 (`lib/sync/price-rule.ts`). Nothing ever changes a Reverb price.
   - This supersedes an earlier version of this PR that pushed Shopify prices to Reverb from a "Product update" webhook. That code was removed before any webhook was created.
   - Applying the rule to Shopify automatically isn't built yet; it needs Shopify Admin API write access. Until then, the Shopify price is set by hand.
5. **Alerts:** posted to a private Discord channel by the site's existing bot.

## Why

- The owner asked for no polling (2026-11-13).
- Reverb's sale webhooks need an OAuth app:
  - personal tokens are refused;
  - Reverb offers no self-serve app registration;
  - its docs recommend polling for orders.
- Shopify's in-checkout validation with outside calls is limited to Enterprise (Plus) stores.
- Shopify no longer lets stores create Admin API tokens from the admin (since 2026-01-01), so this design avoids the Admin API. Shopify webhooks come from Settings → Notifications, and the Reverb ID is read through the existing Headless Storefront token.

## Incident: a Shopify test ended a live Reverb listing (2026-11-13)

The owner used "Send test" on the new Order creation webhook. Shopify's sample order used the real 5E3 amp product, so the handler ended the amp's live Reverb listing (101259462) with the no-fee "not sold" reason. This also confirmed the end-listing call and reason work.

Fix:
- The handler skips orders flagged `test`, carrying Shopify's sample name `#9999` or ID, or with an `@example.com` email, and posts 🧪 to Discord instead.
- Every order delivery logs a summary (no customer details) to the Netlify log.
- The runbook says never to use "Send test" on this webhook.

## Known gap

A buyer who goes straight to shop.k7rhy.app after a Reverb sale, without anyone opening the k7rhy.app product page, can still check out. The order webhook then flags the double sale immediately, so the owner can cancel before shipping.

This closes if Reverb grants OAuth access with the `orders/paid` webhook (ask integrations@reverb.com), or if Shopify Admin access is added so the site can zero Shopify stock itself.

## Unresolved

- **Reverb blocks unsigned reads from Netlify:** on the PR #144 preview, Reverb returned 403 to the page check's public read. The same request works from a home connection, so the block is likely on cloud-server addresses. The client now signs reads with `REVERB_API_TOKEN` when it is set. Re-test the page check after the token is in Netlify. If Reverb still returns 403, the page check can't run from Netlify, but the Shopify webhooks may still work, since they use signed calls.
- **STR26001's Shopify price:** it is $799. The rule gives $800 from its $845 Reverb price. Nothing changes it automatically; the owner decides whether to keep $799.
- **Automatic Reverb → Shopify price sync:** not built. It needs a Shopify Admin token (a Dev Dashboard app using client credentials) and a trigger. A product page opening is the natural no-polling trigger, since that check already reads the Reverb listing.
