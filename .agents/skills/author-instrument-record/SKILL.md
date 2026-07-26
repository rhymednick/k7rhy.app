---
name: author-instrument-record
description: Use when creating or updating K7RHY serial-numbered instrument MDX records, permanent owner pages, exact-instrument image sets, or printable case cards.
---

# Author an Instrument Record

Create one durable instrument record from the existing project schema. Treat serial allocation and discoverability as hard invariants; use editorial judgment for the instrument’s story and player guidance.

## Start with current truth

1. Read `AGENTS.md`, `docs/architecture/site-organization.md`, and [references/instrument-record-contract.md](references/instrument-record-contract.md) completely.
2. Inspect `config/instrument-model-codes.ts`, `content-collections.ts`, `types/instrument.ts`, current records in `content/instruments/`, and the instrument components relevant to the proposed controls.
3. Determine whether this is a new record or an update. Preserve the existing serial on updates.

## Collect the record brief

Confirm the family, record name/submodel, completion date or year, date label, origin, theme, exact-instrument images and alt text, related platform link, pickups, complete control map, instrument-centered narrative, print descriptions, and intended publish state. Ask for missing required facts one question at a time. Never invent technical values, dates, provenance, or image descriptions.

Keep owner identity history, private details, price, availability, transaction language, and authenticity claims outside the permanent record.

## Allocate a new serial

Require a registered family code. `REX` means Relay Example; reserve `RLY` for real Relay prototypes that are sold; `CVL` sequences all Coupeville submodels together within a completion year.

For a new family, propose the code and meaning, then wait for explicit approval before editing the registry.

Run:

```bash
node .agents/skills/author-instrument-record/scripts/allocate-serial.mjs --root . --family CVL --completed 2026
```

Use the emitted serial exactly. If allocation reports a gap, stop. Create or restore the missing permanent record—even for a destroyed or unavailable instrument—before allocating another number. Never choose a later number manually.

## Author with tests first

1. Keep a new record at `publish: false` while drafting.
2. Write a focused failing `content/instruments/<SERIAL>.test.ts` contract before the MDX record.
3. Put exact-instrument images in `public/images/instruments/<SERIAL>/`; require useful alt text and keep photographs off the case card.
4. Author `content/instruments/<SERIAL>.mdx` with the existing strict component vocabulary. Match selector and switched-control cardinality exactly. Use concise print descriptions when web prose is too long for one page.
5. Make the focused tests pass without weakening shared validation.

## Preserve obscurity

Never add a serial record to navigation, catalogs, public indexes, or sitemaps. Both record and print routes must retain `noindex, nofollow`. QR codes must resolve to `https://k7rhy.app/sn/<SERIAL>`, not the print route. A future direct lookup may resolve a supplied serial but must not enumerate records.

## Verification gate

Run focused serial, content, component, metadata, sitemap, print, and QR tests; then run `npx vitest run` and `npm run build`. Review the record on desktop/mobile and light/dark. Review one-page Letter and A4 output at 100%, check clipping and image exclusion, and scan the QR.

Do not set `publish: true` without explicit approval. Do not claim readiness while any automated, rendered, or QR check is incomplete; report the exact remaining gate.
