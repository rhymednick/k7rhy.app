# Shopify-driven shop on k7rhy.app

- **Date:** 2026-11-13
- **Status:** Implemented (validated in a local dev server against live Shopify data; not yet deployed)
- **Supersedes:** the static product catalog in `config/products/` (product configs with hard-coded price, description, and purchase link) and the 3D-printed `Guitar` product type it used. Earlier plans that build on that catalog (`docs/superpowers/plans/2026-07-26-site-information-architecture.md`, `docs/superpowers/plans/2026-07-25-coupeville-line-landing.md`) are historical for the shop sections.

## Decision

`/shop` on k7rhy.app is generated from Shopify. The owner edits a product once, in Shopify, and the site follows.

- **Source of truth:** Shopify owns price, availability, photos, and descriptions. The site stores none of them.
- **How it reads Shopify:** `lib/shop/catalog.ts` queries the public Storefront API at `k7rhy.myshopify.com`. Product listings are public, so no token is required.
- **Freshness:** pages refresh at most 5 minutes after a change in Shopify.
- **Categories:** each product's Shopify product category places it on the site.
  - Guitars: any category under Guitars.
  - Amplifiers: Guitar Amplifiers or Musical Instrument Amplifiers.
  - Ham Radio Kits: tagged `Ham radio` or `Amateur radio`.
  - Products the site can't place are left out.
- **Hiding a product:** tag it `hide-from-k7rhy-app` to keep it off the site while still selling it on Shopify.
- **What is listed:**
  - Listing pages show only items that are for sale.
  - A sold item's page stays reachable for old links. It says it has sold and is marked `noindex`.
- **Checkout:** stays on Shopify. Product pages link to the product at `shop.k7rhy.app`.
- **Serial records:** links to `/sn/...` in a Shopify description are unlinked before display, so catalog pages never link serial records (see `docs/architecture/site-organization.md`). The QR mention in descriptions is plain text and stays.
- **Coupeville:** remains special-order with no Shopify listings. `/shop/coupeville` keeps its call-to-action.
- **Old URL:** `/shop/ham-radio-kits/dummy-load-20w-bnc` redirects permanently to the Shopify handle, `/shop/ham-radio-kits/20w-dummy-load-kit`.
- **If Shopify is unreachable:** pages show a link to `shop.k7rhy.app` instead of an empty shelf. The build does not fail.

## Why

The owner asked for prices and descriptions to show whatever is on Shopify, so they never have to edit two places (2026-11-13). The static catalog had already drifted:

- The dummy load linked to an old `myshopify` domain.
- The Guitars category described 3D-printed guitars.
- One-off guitars and the amp had no path from the site at all.

## Unresolved

- The Netlify environment may still define `NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_ACCESS_TOKEN` and `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`. Nothing reads them now.
- The old `lib/shopify.ts` printed the token to the build log. It has been removed. Rotating that token is optional, since it was a public Storefront token.
- Instant page refresh on sale (a Shopify webhook calling `revalidateTag('shopify')`) is not built. The 5-minute refresh is the current behavior. The Reverb ↔ Shopify sync is in `docs/decisions/2026-11-13-reverb-shopify-sync.md`.
