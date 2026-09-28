# Pedal kit guides live under Guitars, unlisted until release

- **Date:** 2026-09-28
- **Status:** implemented
- **Supersedes:** none

## Decision

- Guitar effects pedal kit guides live at `/guitars/pedals/<kit>`, with the breadcrumb Guitars > Pedals > guide title. The first is the 2N3904 Fuzz Face guide at `/guitars/pedals/fuzz-face`, with its source in `content/pedals/fuzz-face.mdx`.
- A guide for an unreleased kit is unlisted. It sends `noindex, nofollow`, it's excluded from the sitemap, and nothing in the navigation links to it. Deploy previews still show it, so the owner can review it.
- The guide embeds the stripboard and footswitch diagrams, copied from `docs/engineering/fuzz-face/` to `public/images/fuzz_face/guide/`.

## Why

The site policy organizes documents by subject (Ham Radio, Guitars). The shared `/docs/[slug]` template gives every document a Ham Radio breadcrumb, which is wrong for a pedal. The kit hasn't been bench-tested or released, so the page should be reviewable without being public.

## Open questions

- When the kit is released: add a Pedals index or a link from `/guitars`, remove the sitemap exclusion and `robots` metadata, and remove the "Kit in development" alert.
- Replace the estimated voltages with measured values, and add build photos.
