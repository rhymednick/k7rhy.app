# Pedal kit guides live under Guitars, unlisted until release

- **Date:** 2026-09-28
- **Status:** implemented
- **Supersedes:** none

## Decision

- Guitar effects pedal kit guides live at `/guitars/pedals/<kit>`, with the breadcrumb Guitars > Pedals > guide title. The first is the 2N3904 Fuzz Face guide at `/guitars/pedals/fuzz-face`, with its source in `content/pedals/fuzz-face.mdx`.
- A guide for an unreleased kit is unlisted. It sends `noindex, nofollow`, it's excluded from the sitemap, and nothing in the navigation links to it. Deploy previews still show it, so the owner can review it.
- The guide embeds the stripboard and footswitch diagrams, copied from `docs/engineering/fuzz-face/` to `public/images/fuzz_face/guide/`.
- 2026-10-03: the owner asked for build guides for the Bazz Fuss, Electra and Bosstone prototypes. They follow the same pattern and stay unlisted: `/guitars/pedals/{bazz-fuss,electra,bosstone}`, sources in `content/pedals/`, diagrams copied from `docs/engineering/<circuit>/` to `public/images/{bazz_fuss,electra,bosstone}/guide/`. They reuse the Fuzz Face footswitch diagram. The designs are simulated only; the Bosstone topology still needs checking against a reference schematic.

- 2026-10-03 (supersedes "nothing in the navigation links to it"): the owner asked for a way to navigate to and read the pedal guides. `/guitars` now has a Pedals card, and `/guitars/pedals` is an index page; both list every guide from `config/pedal-guides.ts`. The guide pages and the index stay `noindex, nofollow` and out of the sitemap, and keep their development alerts, because none of the kits is released.

## Why

The site policy organizes documents by subject (Ham Radio, Guitars). The shared `/docs/[slug]` template gives every document a Ham Radio breadcrumb, which is wrong for a pedal. The kit hasn't been bench-tested or released, so the page should be reviewable without being public.

## Open questions

- When a kit is released: remove its sitemap exclusion and `robots` metadata, and remove its development alert.
- Replace the estimated voltages with measured values, and add build photos.
