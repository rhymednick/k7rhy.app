# Instrument Record Authoring Skill Design

**Status:** Approved on 2026-07-26

## Purpose and boundary

Create a repository-local skill at `.agents/skills/author-instrument-record/` that authors or updates one permanent serialized instrument record at a time. The skill owns the authoring workflow and editorial checks; a bundled deterministic script owns serial allocation. It reuses the existing MDX collection, strict components, record route, print route, QR renderer, and case-card CSS.

The skill may create or update `content/instruments/<SERIAL>.mdx`, `public/images/instruments/<SERIAL>/`, and `content/instruments/<SERIAL>.test.ts`. It may change `config/instrument-model-codes.ts` only after explicit user approval. It does not create routes, navigation, catalog entries, public registries, sitemap entries, or a PDF pipeline.

## Serial allocation

The user supplies or confirms the family and completion date or year; the skill determines the serial. A bundled Node script accepts a registered three-letter family and a `YYYY` or `YYYY-MM-DD` completion value. It scans instrument filenames, validates all matching serials, requires their `NNN` values to be exactly `001` through the current maximum without gaps, and emits the next number.

Allocation fails for malformed family codes, unregistered codes, malformed dates, years outside the supported serial range, duplicate numbers, or gaps. It never guesses around a gap. If an issued instrument was destroyed or is unavailable, its serial must still have a record before allocation can continue.

Canonical family rules include `REX` for Relay Example, `RLY` for real Relay prototypes that are sold, and `CVL` for all Coupeville instruments across submodels within a completion year. Other registered codes remain valid future reservations.

## Inputs and authoring flow

The skill collects any missing required information one question at a time: family, name/submodel, completion value and label, origin, theme, exact-instrument images and alt text, related platform link, pickups, controls, instrument-centered narrative, print descriptions, and publish state.

It inspects the current schema, component implementation, family registry, existing records, and canonical site policy before editing. It keeps new drafts unpublished until content and print review pass. For a new family, it explains the proposed code and meaning and waits for explicit approval before registry modification.

The skill preserves instrument provenance without owner identity history, private details, sales copy, price, availability, or authenticity claims. Transaction-specific content belongs elsewhere.

## Discoverability invariants

Record and print routes are unlisted permanent pages reachable only by exact URL or case-card QR. Both emit `noindex, nofollow`; all `/sn/...` paths remain absent from sitemaps, navigation, catalog pages, and public indexes. QR codes resolve only to `https://k7rhy.app/sn/<SERIAL>`. A future direct lookup may resolve a visitor-supplied serial but may not expose browsing or enumeration.

The skill checks these shared invariants but does not implement them per record. A violation blocks completion.

## Skill contents

- `SKILL.md`: concise workflow, hard gates, required inspections, authoring sequence, and verification gate.
- `scripts/allocate-serial.mjs`: deterministic, read-only allocation and contiguous-sequence validation.
- `scripts/allocate-serial.test.mjs`: isolated executable scenarios for empty, contiguous, gapped, duplicate, unknown-family, and invalid-input behavior.
- `references/instrument-record-contract.md`: project paths, MDX component cardinality, content boundaries, discoverability policy, and verification checklist.
- `agents/openai.yaml`: generated UI metadata.

No template asset is bundled because existing records are the maintained examples and the component contract can evolve.

## Authoring guidance

`content/instruments/README.md` recommends invoking `$author-instrument-record` as the primary method. It also retains complete manual instructions: determine the next contiguous serial, obtain approval for new family codes, create images and MDX, add a focused test, verify discoverability invariants, run automated checks, review web and print output, scan the QR, and publish explicitly.

## Verification

Automated verification covers allocator behavior, skill structure validation, serial parsing, content validation, MDX component cardinality, record metadata, sitemap exclusion, canonical QR output, full Vitest, and production build.

Rendered verification covers desktop/mobile and light/dark record presentation, one-page Letter/A4 print at 100% scale, unclipped content, exact-image presentation on the web only, and a scanned canonical QR destination.

The skill must report unresolved inputs or failed verification plainly and must not publish or claim readiness while any gate is incomplete.
