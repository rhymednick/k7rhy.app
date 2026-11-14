# Listing runbook: Shopify hub, Reverb, and k7rhy.app

How to list an item for sale across channels. Follow this every time; don't re-derive it.

- **Status:** current as of 2026-11-13.
- **Related decisions:**
  - `docs/decisions/2026-11-13-shopify-driven-shop.md` (the site's shop reads Shopify).
  - `docs/decisions/2026-11-13-reverb-shopify-sync.md` (the Shopify → Reverb sync).

## Standing rules (owner decisions)

- **Shopify is the hub** (owner, 2026-11-13). Create and edit items in Shopify only. The website reads Shopify, and the site keeps Reverb in step through Shopify webhooks.
- **Every item listed on Reverb also goes on Shopify.** In practice that means creating it in Shopify with **List on Reverb** on, and letting the site create the Reverb listing.
- **Price:** set it in Shopify. Reverb gets the Shopify price + 5%, rounded up to the next $5 (`reverbPriceFor` in `lib/sync/price-rule.ts`). Prices only flow Shopify → Reverb. Never edit a Reverb price by hand; the next Shopify edit overwrites it.
- **Wording:**
  - Guitars on factory-made bodies and necks are **"Custom-Assembled"**, never "Hand-Built", and are **not** Handmade on Reverb (the sync's default for guitars).
  - Their listings include: "The body and neck are factory-made; I chose the parts, wired the electronics, and assembled it here in Coupeville."
  - Hand-wired amps keep "Hand-Built" and are Handmade on Reverb.
  - Copy is first person singular ("I", never "we").
- **Serial records:** catalog listings never link to `/sn/...` pages. Mentioning the QR code on the headstock is fine. The sync strips any `/sn/` link from the description it sends to Reverb.
- **Facebook Marketplace:**
  - Listings are local pickup only, from a personal profile, with a 10-photo limit.
  - There's no API, so it's always updated by hand.

## 1. Prepare photos

- Convert HEIC to JPEG with `sharp`, run from the project directory (`node -e "require('sharp')(...)"`). sharp isn't installed in the scratchpad.
- Rotate by EXIF, resize to 1600 px wide, mozjpeg quality about 84, strip EXIF.
- Clean up only lightly (small crop or brightness). Never make photos look AI-generated.
- If you change a photo's look, show the owner before using it.
- Keep a per-item folder in the scratchpad. Order the photos: front first, then details, then case/box photos.
- **Reverb uses Shopify's photos as they are when the listing is created.** Photo changes made later in Shopify don't sync; change them on Reverb by hand.

## 2. Shopify product (the hub)

1. **Create the product** with title, price, description (HTML), photos, vendor `K7RHY`, and quantity 1 for one-offs. Keep it in **Draft** until it's complete.
2. **Set the product category** carefully. It places the item on the website and, for Reverb, sets the Reverb category, box size, and Handmade flag:
   - Any category under **Guitars** (for example "Electric Guitars") → `/shop/guitars`. On Reverb: Electric Guitars / Solid Body, 44 × 17 × 6 in, 19 lb, not handmade.
   - **Guitar Amplifiers** → `/shop/amplifiers`. On Reverb: Guitar Combos, 21 × 21 × 11 in, 39.5 lb, handmade.
   - Tag `Ham radio` → `/shop/ham-radio-kits`. Not listed on Reverb automatically.
   - Anything else won't appear on the site, and the sync can't list it on Reverb. To keep a product off the site, tag it `hide-from-k7rhy-app`.
   - New kinds of item (pedals, other categories) need a new entry in `REVERB_CATEGORY_DEFAULTS` in `lib/sync/reverb-listing.ts` before they can go to Reverb.
3. **Shopify shipping:**
   - Choose a package that fits. Saved packages:
     - "Guitar shipping box 44 x 17 x 6 in" (0 lb).
     - "Amp shipping box 21 x 21 x 11 in" (0 lb).
   - Set the packed size and the full packed weight. Never leave the store-default envelope package.
   - Add the variant to the hidden collection **"[Shipping] Graham Guitar"**. That collection carries the calculated FedEx/UPS rates for large items. The "[Shipping] General profile" collection excludes it.
4. **Reverb fields** (Product metafields section, near the bottom of the product page):
   - **List on Reverb:** on to list it.
   - **Reverb model:** for example "CuNiFe S-Type". Blank uses the product title.
   - **Reverb finish:** for example "Gloss White". Optional.
   - **Reverb listing ID:** leave blank. The site finds listings it created by their Reverb SKU, `shopify-<product id>`. Fill it in only to link a listing that was made by hand on Reverb.
5. **Make it Active** (with the owner's OK) and save. Within seconds, the site creates the Reverb listing and posts to the sales-alert Discord channel:
   - 🆕 means live on Reverb with calculated shipping.
   - 📝 means Reverb rejected the calculated-shipping fields, so it's a draft. Open it on Reverb, set shipping (package size and weight from step 2), and publish. Later Shopify edits keep it in sync.
   - ⚠️ explains why it couldn't list (no category, no single price, no photos).
6. **Browser mechanics:**
   - The description editor is TinyMCE: `tinymce.get('product-description-rp').setContent(html); ed.fire('change'); ed.save()`.
   - The media file input is inside a shadow DOM. Upload through a light-DOM proxy `<input type=file>`, copy its files to the shadow input with a `DataTransfer`, and dispatch `change`.
   - This reliably uploads every photo **twice**. Remove the duplicates (media checkboxes → Remove) before saving.

## 3. Facebook Marketplace (by hand)

Edit flow:
- The textarea and inputs are set with the native value setter plus an `input` event.
- Then Next → Update.

Keep to 10 photos. If the case photos push the count over, drop the least informative detail shot.

## 4. Check the result

- **Website:** within 5 minutes, the item appears at `https://k7rhy.app/shop/<category>/<shopify-handle>` with the Shopify price.
- **Reverb:** the Discord message links the listing. Check the price is Shopify + 5% (rounded up to $5), and that the Handmade flag and photos are right.

## Changing or removing an item

All in Shopify; the site follows within seconds and posts to Discord.

| In Shopify | On Reverb |
|---|---|
| Edit the price, title, or description | Updated to match (price by the +5% rule) 🔄 |
| Set to Draft or Archived, set the quantity to 0, or switch **List on Reverb** off | Listing ended (no-fee "not sold") 🛑 |
| Make it Active again (with stock and **List on Reverb** not off) | Ended listing relisted 🔄 |
| Delete the product | Listing ended 🛑 |
| Change photos | **Not synced.** Change them on Reverb by hand. |

A product whose **List on Reverb** was never set keeps any existing Reverb listing in sync, but the site never creates one for it.

## When something sells

| Where it sold | What happens automatically | What the owner does by hand |
|---|---|---|
| Shopify | The order webhook ends the Reverb listing (no-fee "not sold" end) and posts ✅. If Reverb had already sold it, it posts ⚠️ **Double sale**: cancel and refund the Shopify order. | End the Facebook listing. |
| Reverb | The website shows "Sold" on that item's page the next time someone opens it, and posts 🔔 at most hourly. **Shopify isn't changed automatically.** | **Archive the product in Shopify** (that also stops the site from relisting it), and end the Facebook listing. |
| Facebook | Nothing. | Archive the product in Shopify. That ends the Reverb listing automatically. |

## One-time setup (environment and webhooks)

These live in the Netlify site environment. The owner creates and pastes all secrets; the agent never handles their values.

| Variable | What it is | Where it comes from |
|---|---|---|
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Lets the site read the Reverb fields. The older `NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_ACCESS_TOKEN` is accepted as a fallback, and that's what's in use. | Shopify admin → Sales channels → Headless → "K7 Rhy Headless" → Storefront API → public access token |
| `REVERB_API_TOKEN` | Lets the site create, update, end, and relist Reverb listings | Reverb → My Profile → API & Integrations → Generate New Token (listings read/write) |
| `SHOPIFY_WEBHOOK_SECRET` | Verifies webhooks really came from Shopify | Shopify admin → Settings → Notifications → Webhooks (the signing secret shown on that page) |
| `DISCORD_SALES_CHANNEL_ID` | Private Discord channel for sales alerts; the existing `DISCORD_BOT_TOKEN` posts there | Discord → right-click the channel → Copy Channel ID. The bot needs View Channel and Send Messages there. |

Shopify webhooks (Settings → Notifications → Webhooks → Create webhook, format JSON, URL `https://k7rhy.app/api/shopify/webhooks`, newest API version):
- **Order creation**
- **Product creation**
- **Product update**
- **Product deletion**

Products must be published to the **Headless** sales channel (as well as Online Store), or the site can't read their Reverb fields.

**Never click "Send test" on these webhooks.** Shopify builds its sample from real store products. On 2026-11-13 a test order ended the amp's live Reverb listing. The handlers now ignore Shopify's known sample markers:
- **Orders:** the `test` flag, the sample `#9999` name or ID, or an `@example.com` email. The site posts 🧪 to Discord instead.
- **Products:** the sample product ID and "Example T-Shirt".

A sample that matches none of those would still be treated as real.

Without a variable, its feature degrades safely:
- **No Storefront token:** no Reverb linking at all.
- **No Reverb token:** no Reverb changes; sale alerts ask for a manual Reverb end.
- **No Discord channel:** alerts go to the Netlify function log only.

## Code map

- `lib/shop/catalog.ts`: Shopify catalog for `/shop`.
- `lib/shop/storefront.ts`: Storefront API client.
- `lib/reverb/client.ts`: Reverb API (read, find by SKU, create, update, end, relist).
- `lib/sync/reverb-listing.ts`: builds a Reverb listing from a Shopify product. Category defaults live in `REVERB_CATEGORY_DEFAULTS`.
- `lib/sync/reverb-sync.ts`: sync rules. `lib/sync/price-rule.ts`: the Shopify → Reverb price rule.
- `app/api/shopify/webhooks/route.ts`: Shopify webhooks.
- `app/api/shop/availability/route.ts` and `components/shop/shop-buy-button.tsx`: the check when a product page opens.
