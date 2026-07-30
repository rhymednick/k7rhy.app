# Site Organization

This file is the canonical organizational policy for K7RHY.app. Agents must preserve these rules unless the user explicitly changes them.

## Public information architecture

- Organize the public site first by subject: Ham Radio and Guitars.
- Keep Shop and Community as cross-subject destinations.
- Guitars is platform-neutral. Relay and Coupeville are guitar platforms/lines under `/guitars/...`, not top-level subjects.
- Surface each document only from its relevant subject area while retaining concise `/docs/...` URLs.
- Do not present a mixed documentation index. `/docs` redirects to Ham Radio; individual ham documents keep `/docs/...` paths and breadcrumbs under Ham Radio.

## Publishing and commerce

- Discord announcements replace Lab Notes; do not recreate a local blog without an explicit new decision.
- K7RHY.app explains and presents. Shopify owns price, availability, inventory, orders, payment, and checkout.
- A future Shopify storefront may use `shop.k7rhy.app`; the current `/shop` route must remain a stable navigation concept.

## Serialized instruments

- Serial pages are unlisted permanent records reached by exact URL or case-card QR code.
- Never expose a serial index, link records from public navigation or catalog pages, or include `/sn/...` in sitemaps.
- Emit `noindex, nofollow` for both record and print routes.
- A future direct serial lookup may resolve a serial supplied by the visitor, but must not expose a browsable registry.
- `REX` means Relay Example. Reserve `RLY` for real Relay prototypes that are sold.
- `CVL` means Coupeville. Its final three digits sequence all Coupeville instruments within a completion year, regardless of submodel.
- Never skip a family/year sequence number. If an issued instrument is destroyed or otherwise unavailable, retain a permanent record for its serial.
