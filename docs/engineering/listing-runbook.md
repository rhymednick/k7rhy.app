# Listing runbook: Reverb, Shopify, and k7rhy.app

How to list an item for sale and link it across channels. Follow this every time; don't re-derive it.

- **Status:** current as of 2026-11-13.
- **Related decisions:**
  - `docs/decisions/2026-11-13-shopify-driven-shop.md` (the site's shop reads Shopify).
  - `docs/decisions/2026-11-13-reverb-shopify-sync.md` (the Reverb ↔ Shopify sync).

## Standing rules (owner decisions)

- **Every item listed on Reverb also goes on Shopify.** Assume this unless the owner says otherwise (2026-11-13).
- **The website reads Shopify.** It shows Shopify's photos, description, stock, and price; never hard-code any of them on the site.
- **Reverb leads on price** (owner, 2026-11-13). Set the Reverb price first. The Shopify price is the Reverb price less 5%, rounded down to the next $5 (`shopifyPriceFor` in `lib/sync/price-rule.ts`), because Shopify carries no marketplace fee. Prices only ever flow Reverb → Shopify; nothing changes a Reverb price automatically. Until a Reverb → Shopify price sync exists, set the Shopify price by hand when the Reverb price changes.
- **Wording:**
  - Guitars on factory-made bodies and necks are **"Custom-Assembled"**, never "Hand-Built", and are **not** marked Handmade on Reverb.
  - Their listings include: "The body and neck are factory-made; I chose the parts, wired the electronics, and assembled it here in Coupeville."
  - Hand-wired amps keep "Hand-Built".
  - Copy is first person singular ("I", never "we").
- **Serial records:** catalog listings never link to `/sn/...` pages. Mentioning the QR code on the headstock is fine.
- **Facebook Marketplace:**
  - Listings are local pickup only, from a personal profile, with a 10-photo limit.
  - There's no API, so it's always updated by hand.

## 1. Prepare photos

- Convert HEIC to JPEG with `sharp`, run from the project directory (`node -e "require('sharp')(...)"`). sharp isn't installed in the scratchpad.
- Rotate by EXIF, resize to 1600 px wide, mozjpeg quality about 84, strip EXIF.
- Clean up only lightly (small crop or brightness). Never make photos look AI-generated.
- If you change a photo's look, show the owner before using it.
- Keep a per-item folder in the scratchpad. Order the photos: front first, then details, then case/box photos.

## 2. Reverb listing

1. Create the listing in the Reverb UI.
   - **Title:** "Custom-Assembled …" for guitars on factory bodies.
   - **Handmade:** No for those guitars.
2. **Shipping:** let Reverb calculate it. Enter the package size and weight, using the heavier figure when unsure. Ship to the contiguous US only.
   - Guitar in hardshell case: 44 × 17 × 6 in, 19 lb.
   - Amp: 21 × 21 × 11 in, 39.5 lb.
3. **Editing the description in the browser:** the editor is Lexical.
   - To replace a paragraph, select its node contents, then dispatch a synthetic `ClipboardEvent('paste')` with plain text.
   - Setting `innerText` does not stick.
4. Note the listing number from the URL: `reverb.com/item/<number>-…`.

## 3. Shopify product

1. **Create the product** with title, price, description (HTML), photos, product type, vendor `K7RHY`, and quantity 1 for one-offs.
2. **Set the product category** carefully. The website uses it to place the item:
   - Any category under **Guitars** (for example "Electric Guitars") → `/shop/guitars`.
   - **Guitar Amplifiers** → `/shop/amplifiers`.
   - Tag `Ham radio` → `/shop/ham-radio-kits`.
   - Anything else won't appear on the site. To keep a product off the site, tag it `hide-from-k7rhy-app`.
3. **Shipping:**
   - Choose a package that fits. Saved packages:
     - "Guitar shipping box 44 x 17 x 6 in" (0 lb).
     - "Amp shipping box 21 x 21 x 11 in" (0 lb).
   - Set the packed size and the full packed weight. Never leave the store-default envelope package.
   - Add the variant to the hidden collection **"[Shipping] Graham Guitar"**. That collection carries the calculated FedEx/UPS rates for large items. The "[Shipping] General profile" collection excludes it.
4. **Reverb listing ID:** fill in the product's **Reverb listing ID** custom field (`custom.reverb_listing_id`) with the Reverb number from step 2.4. Leave it blank if the item isn't on Reverb.
5. **Browser mechanics:**
   - The description editor is TinyMCE: `tinymce.get('product-description-rp').setContent(html); ed.fire('change'); ed.save()`.
   - The media file input is inside a shadow DOM. Upload through a light-DOM proxy `<input type=file>`, copy its files to the shadow input with a `DataTransfer`, and dispatch `change`.
   - This reliably uploads every photo **twice**. Remove the duplicates (media checkboxes → Remove) before saving.
6. Set the status to **Active** only with the owner's OK.
7. **Pricing:** Shopify price = `shopifyPriceFor(Reverb price)`. If the owner gives a different Shopify price, use theirs.

## 4. Facebook Marketplace (by hand)

Edit flow:
- The textarea and inputs are set with the native value setter plus an `input` event.
- Then Next → Update.

Keep to 10 photos. If the case photos push the count over, drop the least informative detail shot.

## 5. Check the link

- **Website:** within 5 minutes, the item appears at `https://k7rhy.app/shop/<category>/<shopify-handle>` with the Shopify price.

## When something sells

| Where it sold | What happens automatically | What the owner does by hand |
|---|---|---|
| Shopify | Shopify's order webhook ends the Reverb listing (no-fee "not sold" end) and posts ✅ to Discord. If the Reverb listing had already sold, it posts ⚠️ **Double sale**: cancel and refund the Shopify order. | End the Facebook listing. |
| Reverb | The website shows "Sold" on that item's page the next time someone opens it, and posts 🔔 to Discord at most hourly. **Shopify is not changed automatically.** | Set the Shopify quantity to 0 (or archive the product), and end the Facebook listing. |
| Facebook | Nothing. | Set Shopify quantity to 0 and end the Reverb listing (Edit → End Listing → "not sold"; never "Reverb found me a buyer", which charges a fee). |

## One-time setup (environment and webhooks)

These live in the Netlify site environment. The owner creates and pastes all secrets; the agent never handles their values.

| Variable | What it is | Where it comes from |
|---|---|---|
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Lets the site read the Reverb listing ID field. The older `NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_ACCESS_TOKEN` is accepted as a fallback. | Shopify admin → Sales channels → Headless → "K7 Rhy Headless" → Storefront API → public access token |
| `REVERB_API_TOKEN` | Lets the site end Reverb listings and change Reverb prices | Reverb → My Profile → API & Integrations → Generate New Token (all scopes for listings) |
| `SHOPIFY_WEBHOOK_SECRET` | Verifies webhooks really came from Shopify | Shopify admin → Settings → Notifications → Webhooks (the signing secret shown on that page) |
| `DISCORD_SALES_CHANNEL_ID` | Private Discord channel for sales alerts; the existing `DISCORD_BOT_TOKEN` posts there | Discord → right-click the channel → Copy Channel ID. The bot needs View Channel and Send Messages there. |

Shopify webhooks (Settings → Notifications → Webhooks → Create webhook, format JSON, URL `https://k7rhy.app/api/shopify/webhooks`):
- **Order creation** only. Don't add a Product update webhook; prices never flow from Shopify to Reverb.

Without a variable, its feature degrades safely:
- **No Storefront token:** no Reverb linking at all.
- **No Reverb token:** sale alerts still post, asking for a manual Reverb end.
- **No Discord channel:** alerts go to the Netlify function log only.

## Code map

- `lib/shop/catalog.ts`: Shopify catalog for `/shop`.
- `lib/shop/storefront.ts`: Storefront API client (token optional).
- `lib/reverb/client.ts`: Reverb API (read listing, end listing).
- `lib/sync/reverb-sync.ts`: sync rules. `lib/sync/price-rule.ts`: the Reverb → Shopify price rule.
- `app/api/shopify/webhooks/route.ts`: Shopify webhooks.
- `app/api/shop/availability/route.ts` and `components/shop/shop-buy-button.tsx`: the check when a product page opens.
