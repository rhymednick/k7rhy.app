---
name: author-instrument-record
description: Use when creating or updating K7RHY serial-numbered instrument MDX records, permanent owner pages, exact-instrument image sets, or printable case cards.
---

# Author an Instrument Record

Create one durable instrument record from the existing project schema. Treat serial allocation and discoverability as hard invariants; write the page for the person who owns the instrument. The record should be useful to a player now and to a repairer later.

## Start with current truth

1. Read `AGENTS.md`, `docs/architecture/site-organization.md`, and [references/instrument-record-contract.md](references/instrument-record-contract.md) completely.
2. Inspect `config/instrument-model-codes.ts`, `content-collections.ts`, `types/instrument.ts`, current records in `content/instruments/`, and the instrument components relevant to the proposed controls.
3. Determine whether this is a new record or an update. Preserve the existing serial on updates.

## Collect the record brief

Confirm the family, record name/submodel, completion date or year (or build start date for an unfinished draft), date label, origin, theme, exact-instrument images and alt text, related platform link, pickups, complete control map, instrument-centered narrative, print descriptions, and intended publish state. Ask for missing required facts one question at a time. Never invent technical values, dates, provenance, or image descriptions. An unfinished draft may use an owner-approved placeholder and defer the structured control map while the wiring is undecided. A completed record may not: the printable case card is built entirely from the structured map, so recording `completed` and writing `<InstrumentSpec>` are one step. Record unknowns in the engineering notes or omit them from owner-facing prose; never turn an approved final specification into a conspicuous build-plan disclaimer.

Keep owner identity history, private details, price, availability, transaction language, and authenticity claims outside the permanent record.

## Write for the owner

- Make each page stand alone. Use the instrument's name, materials, visible details, and distinctive voice to identify it. The page already displays its serial, so avoid repeating the serial in descriptions or prose. Do not number otherwise identical names or compare sibling records unless the distinction is part of this instrument's actual identity.
- State a concise, factual builder origin when supported. Do not emphasize that ordinary components were purchased, explain the supply chain, or use assembly language that makes the instrument sound provisional. Name direct manufacturer sourcing only when it is a meaningful, verified provenance detail, such as a new pickup set bought from its maker.
- Lead with what a player can hear and do: familiar controls, useful added voices, and how to reach them. Describe the benefit of distinctive switching in grounded, musician-friendly terms. A musical rationale may interpret the confirmed circuit, but do not invent the owner's intent, acoustic test results, installed parts, or measured performance.
- Keep pot tapers, capacitor and resistor values, switch poles, and wiring topology in a lower technical section or structured specification where a future repairer can find them. Preserve exact values and component relationships; do not let them dominate the introductory or functional description.
- Write a voice for every selector position and switch state. Derive it from the confirmed wiring and the pickup maker's published description; attribute the maker's tonal claims to the maker, and state only effects the circuit supports (for example, hum canceling needs a reverse-wound, reverse-polarity pairing).
- Keep copy short and specific. Prefer a clear description of the instrument over promotional claims or generic praise. Avoid repeating information already supplied by the page heading, metadata, control map, or adjacent paragraph.

## Allocate a new serial

Require a registered family code. `REX` means Relay Example; reserve `RLY` for real Relay prototypes that are sold; `CVL` sequences all Coupeville submodels together within a completion year.

For a new family, propose the code and meaning, then wait for explicit approval before editing the registry.

Run:

```bash
node .agents/skills/author-instrument-record/scripts/allocate-serial.mjs --root . --family CVL --completed 2026
```

Use the emitted serial exactly. If allocation reports a gap, stop. Create or restore the missing permanent record—even for a destroyed or unavailable instrument—before allocating another number. Never choose a later number manually.

## Author with tests first

1. Keep a new record at `publish: false` while drafting. An unfinished record may use `started: YYYY-MM-DD` with no `completed` value; add `completed` only after the build is actually complete.
2. Write a focused failing `content/instruments/<SERIAL>.test.ts` contract before the MDX record.
3. Put exact-instrument images in `public/images/instruments/<SERIAL>/`; require useful alt text and keep photographs off the case card.
4. Author `content/instruments/<SERIAL>.mdx` with the existing strict component vocabulary. A completed record must open with `<InstrumentSpec>` containing every pickup and every control: selector, pots, mini toggles (`Toggle` with two `ToggleState` children), and position controls. Validation fails the build when a completed record has none. Match selector and switched-control cardinality exactly. Use concise print descriptions when web prose is too long for one page.
5. Make the focused tests pass without weakening shared validation.

Before finishing, read the rendered page as its new owner: can they identify the guitar and understand its controls without knowing electronics terms? Then read the technical section as a repairer: are the exact selected values and switch behavior recoverable? Compare with maintained records for information hierarchy, but never copy their instrument-specific claims or assume older wording is exemplary.

## Preserve obscurity

Never add a serial record to navigation, catalogs, public indexes, or sitemaps. Both record and print routes must retain `noindex, nofollow`. QR codes must resolve to `https://k7rhy.app/sn/<SERIAL>`, not the print route. A future direct lookup may resolve a supplied serial but must not enumerate records.

## Verification gate

Run focused serial, content, component, metadata, sitemap, print, and QR tests; then run `npx vitest run` and `npm run build`. Review the record on desktop/mobile and light/dark. Open `/sn/<SERIAL>/print` and confirm the voice and control map shows every pickup, selector position, and switch state; an empty or partial card is a failed gate. Review one-page Letter and A4 output at 100%, check clipping and image exclusion, and scan the QR.

Do not set `publish: true` without explicit approval. Do not claim readiness while any automated, rendered, or QR check is incomplete; report the exact remaining gate.
