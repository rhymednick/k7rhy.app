# Site Information Architecture Design

**Date:** 2026-07-26
**Status:** Approved

## Objective

Reorganize K7RHY Resonance Lab around its two subject domains—ham radio and guitars—while giving shopping and community activity clear destinations. Retire the unused Lab Notes blog and its server/build overhead without removing MDX support used elsewhere. Preserve a low-cost, scalable path toward a Shopify-hosted storefront.

## Organizational principles

1. Visitors choose a subject domain before they choose a content type. Ham-radio and guitar documentation must not be mixed in a generic documentation navigation tree.
2. Navigation hierarchy and URL hierarchy do not have to match. Documents remain at concise `/docs/...` URLs while their discovery and breadcrumbs place them in the relevant subject section.
3. K7RHY.app explains projects, presents products, and hosts durable reference material. Shopify owns commerce facts and transactions: price, availability, inventory, orders, payment, and checkout.
4. Discord is the home for announcements and ad-hoc discussion. The website provides a read-only view of recent announcements and a durable explanation of the community.
5. Serial-number URLs are permanent but unlisted identifiers. They remain at `/sn/...`, do not move with navigation changes, and must not be exposed through navigation, indexes, or search-engine discovery.
6. Instrument serial prefixes identify product families, not submodels. The record name identifies the submodel.

These principles must be recorded in a canonical vendor-neutral architecture document and linked from root agent instruction files so future agents do not have to reconstruct them.

## Visitor-facing information architecture

The main navigation has four destinations:

| Label | Route | Responsibility |
| --- | --- | --- |
| Ham Radio | `/ham-radio` | Radio projects, radio products, and relevant documentation |
| Guitars | `/guitars` | Relay, guitar projects, and guitar shopping |
| Shop | `/shop` | All currently available items grouped by Ham Radio and Guitars |
| Community | `/community` | Discord introduction, recent announcements, and join link |

### Ham Radio

`/ham-radio` is a curated landing page. It presents radio work and links to the existing dummy-load and power-measurement documents. Those documents keep their current `/docs/...` URLs. Generic Documentation is removed from the main navigation.

### Guitars

`/guitars` is a curated landing page for the Relay platform, guitar projects, and guitar-related shopping. It must not list or link serialized instrument records. Relay routes move beneath `/guitars/relay/...` so the visible and routable organization agree.

### Shop

`/shop` replaces Products as the shopping destination. In this phase it remains a small, curated catalog rendered by this Next.js application. The existing category presentation can be reused after blog coupling and the sold Rainbow Telecaster are removed.

The design deliberately leaves room for `shop.k7rhy.app` to become a Shopify-hosted storefront later. Main-site navigation will not need to change when that happens. Until a later commerce phase, the site may retain local editorial product descriptions, but new architecture must not assume local configuration will remain authoritative for price, availability, inventory, orders, payment, or checkout.

### Community

`/community` explains the purpose of the K7RHY Discord server, links visitors to the server, and shows a bounded list of recent messages from Discord announcement channel `1432603806704603248`.

The announcement reader runs on the server with `DISCORD_BOT_TOKEN`, never exposes that token to browser code, and uses Next.js caching with a five-minute revalidation interval. The first version renders message text, author, timestamp, and safe links. Discord reactions, embeds, and other rich client behavior are out of scope.

When the token is missing, Discord rejects the request, the bot cannot access the channel, or the network request fails, the Community introduction and join link still render. The feed shows a quiet unavailable state rather than failing the page.

## Route migration policy

| Existing route | New behavior |
| --- | --- |
| `/relay/...` | Permanent redirect to the equivalent `/guitars/relay/...` route |
| `/products` | Permanent redirect to `/shop` |
| `/products/<category>` | Permanent redirect to `/shop/<category>` |
| `/products/<category>/<slug>` | Permanent redirect to `/shop/<category>/<slug>` |
| `/blog` | Permanent redirect to `/community` |
| `/blog/<slug>` | 404; retired posts are not equivalent to the Community page |
| `/docs/...` | Unchanged |
| `/sn/...` | Unchanged, unlisted, excluded from sitemaps, and marked against search-engine indexing |

Redirects must preserve meaningful path segments. Navigation links and internal content links must use canonical new routes rather than relying on redirects.

## Serialized-record privacy and discovery

Serialized instrument records are deliberately available by exact URL but are not a public catalog. A visitor reaches a record by entering a known serial URL or scanning the QR code printed on its case card.

- Do not link serial records from the Guitars landing page, navigation, product listings, or any public serial index.
- Exclude `/sn/...` routes from generated sitemaps.
- Emit `noindex, nofollow` metadata for record and print routes so search engines are instructed not to crawl or index them.
- Do not create a discoverable list of valid serials in page content or public application endpoints.
- The current dynamic route may still generate known records at build time as an implementation detail; build output must not be presented as a visitor-facing index.

A future exact-serial lookup form may let a visitor type a serial they already possess. Designing or building that lookup is out of scope for this phase.

## Lab Notes retirement

Lab Notes and its blog publishing pipeline are retired. Remove:

- Blog content, including archived test fixtures.
- Blog routes, layouts, not-found UI, cards, filters, indexes, and post components.
- Blog-generated navigation and sitemap filtering.
- Product-related blog-post components and fields.
- Blog-specific schema, transforms, word counts, reading times, AI summary generation, summary cache handling, and associated tests.
- Dependencies used only by blog processing, including Google Generative AI and any HTTP client that has no remaining consumer after removal.

Keep Content Collections because serialized instruments use it. Keep MDX support for instruments, Relay, and documentation. Removing the blog must not remove or weaken general MDX rendering.

## Product change

The Rainbow Telecaster has been sold. Remove it from the catalog and remove its commercial product route. Preserve photographs that remain inputs to the fictional example instrument record; shared media is not deleted merely because a listing is retired.

## Instrument serial namespaces

The serial format remains `MMMYYNNN`, where `MMM` is a three-letter family code, `YY` is the completion year, and `NNN` is a year-scoped sequence within that family.

### Relay

- Rename the fictional proof-of-concept record from `RLY26001` to `REX26001`.
- `REX` means **Relay Example** and is reserved for fictional or sample records.
- `RLY` is reserved for real Relay prototypes and is assigned only when a prototype is sold.
- The unpublished former `RLY26001` URL receives no redirect.
- Tests, fixtures, and authoring instructions use `REX26001` when they require an example record.

### Coupeville

- Rename `CPC26001` to `CVL26001`.
- `CVL` means **Coupeville** and identifies the complete Coupeville family rather than Coupeville Current.
- The final index increments across all Coupeville instruments completed in a year, regardless of submodel. For example, `CVL26001` is the first serialized Coupeville instrument completed in 2026.
- The instrument record name carries the submodel name, such as Coupeville Current.
- The unpublished former `CPC26001` URL receives no redirect.

All record copy, image paths, tests, placeholders, case-card URLs, and QR destinations must use the new serials.

## Component and data boundaries

- Navigation configuration owns the four top-level destinations and must not import generated blog data.
- Ham Radio and Guitars landing pages own curated discovery content for their respective domains.
- Shop composes product-category components without knowledge of blog posts.
- Community composes a Discord announcement feed that is separate from Relay's pinned-thread community callouts. Shared low-level Discord request behavior may be factored cleanly, but the two features retain distinct public interfaces.
- Product configuration remains sufficient for the current curated catalog, while the durable architecture document describes Shopify as the future commerce authority.

## Durable project memory

Create `docs/architecture/site-organization.md` as the canonical, vendor-neutral record of the approved organizational principles, route policy, commerce boundary, publishing policy, and serial namespace rules. Add concise pointers from root `AGENTS.md` and `CLAUDE.md`; do not duplicate the full policy across vendor-specific instruction files.

Create a committed future-work note for a narrow agent skill that adds serial-indexed instrument records and printable case cards. The note must describe the skill's intended inputs, validations, generated/updated files, and verification steps. Building that skill is explicitly out of scope for this implementation.

## Testing and verification

Automated verification must cover:

- Main-navigation labels and canonical routes.
- Section landing-page destinations and domain-specific document discovery.
- Permanent redirect mappings for Relay, Products, and the blog index.
- Removal or 404 behavior for individual blog routes.
- Discord announcement success, missing-token, non-success-response, and request-failure behavior.
- Announcement rendering with safe text/links and bounded results.
- `REX` and `CVL` serial parsing and descriptions.
- Exact-URL route generation for `REX26001` and `CVL26001` without a public record index.
- `noindex, nofollow` metadata on serialized record and print routes.
- Exclusion of all `/sn/...` routes from sitemap output.
- Absence of the Rainbow Telecaster from the catalog.
- Absence of runtime/build imports of blog content and related-post UI.
- Sitemap generation without blog collection imports.

Run focused tests during implementation, then the full Vitest suite, lint, and a production build. Verify that Content Collections still generates the instrument collection, public canonical routes appear in sitemap output, and serialized routes do not.

## Out of scope

- Deploying a documentation microsite.
- Moving the store to `shop.k7rhy.app`.
- Changing the current Shopify plan or configuring Shopify DNS.
- Making Shopify the catalog data source in this phase.
- Building the instrument-record agent skill.
- Building a serial-number lookup form.
- Publishing any serial-number index or discoverable instrument-record list.
- Rendering Discord reactions, embeds, or an interactive Discord client.
