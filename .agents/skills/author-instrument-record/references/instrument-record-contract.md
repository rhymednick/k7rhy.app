# Instrument Record Contract

## Sources of truth

- Policy: `docs/architecture/site-organization.md`
- Family registry: `config/instrument-model-codes.ts`
- Schema and derived serial data: `content-collections.ts`, `types/instrument.ts`, `lib/instruments/validation.ts`
- Serial and URL behavior: `lib/instruments/serial.ts`, `lib/instruments/route-resolution.ts`
- Structured MDX: `components/instrument/instrument-spec.tsx`, `components/instrument/instrument-mdx-components.tsx`
- Web and print presentations: `components/instrument/instrument-record-page.tsx`, `components/instrument/instrument-case-card.tsx`, `components/instrument/instrument-print-spec.tsx`
- Routes and metadata: `app/sn/[serial]/page.tsx`, `app/sn/[serial]/print/page.tsx`
- Print geometry: `app/sn/instrument-records.css`
- Maintained examples: `content/instruments/*.mdx`

Read live source before authoring; do not copy an old plan’s component API.

## Record contract

- Filename: uppercase `MMMYYNNN.mdx`; frontmatter does not duplicate the serial.
- Completion: honest `YYYY` or `YYYY-MM-DD`; its year must match `YY`. An unpublished build in progress may instead use an honest `started: YYYY-MM-DD` matching `YY`, with no `completed` value. It cannot publish or expose a print card until completion is recorded. A completed record must contain an `InstrumentSpec`; `lib/instruments/validation.ts` rejects one without it, because the case card renders only the structured map.
- Images: at least one exact-instrument image under `/images/instruments/<SERIAL>/` with useful alt text. A clearly marked placeholder is acceptable only when explicitly approved.
- Drafting: new records remain `publish: false` until explicit publication approval. If wiring, parts, or voice are undecided, keep that status in the engineering record and omit uncertain owner-facing claims; defer the structured control map until the design is decided. An approved design is still distinct from an installed or physically verified circuit.
- Narrative: give the buyer a concise, standalone account of this instrument's identity, provenance, musical character, use, and care when known. Exclude private owner history, price, availability, transaction details, and authenticity claims. Do not repeat the displayed serial in prose, rank the instrument against sibling records, or use a numbered working name unless it is the actual model name.
- Provenance: use a short factual builder origin. Do not foreground ordinary purchased parts or supply-chain facts. Call out maker-direct sourcing when verified and meaningful to the owner, such as new pickups obtained from their manufacturer.
- Information hierarchy: explain controls and distinctive switching in player terms first; put pot types, component values, and circuit topology in a later technical section for service. Interpret the confirmed circuit's musical utility without inventing the owner's reasons for choosing it or promising untested sonic results. Keep exact values and relationships accessible to a future repairer.

## Structured MDX invariants

- `InstrumentSpec` contains exactly one `PickupConfiguration` and one `ControlLayout`.
- Every pickup supplies the props required by the live `Pickup` implementation.
- A selector has exactly the declared number of positions; display numbers derive from child order.
- A standard pot has one `normal` state.
- A push-pull or push-push pot has exactly one `down` and one `up` state.
- A mini toggle is a `Toggle` with a `type` (for example, `SPST mini toggle`) and exactly two `ToggleState` children with distinct `state` names. `printDescription` may shorten a state for the card.
- Additional controls such as `HarmonicShaper` must follow their live component’s cardinality and ordering rules.
- Print-specific descriptions may shorten presentation but must not change technical meaning.

## Discoverability invariants

- Canonical record: `/sn/<SERIAL>`.
- Printable card: `/sn/<SERIAL>/print`.
- Both routes emit `noindex, nofollow`.
- `next-sitemap.config.js` excludes `/sn/*`.
- Navigation, product catalogs, subject pages, and public indexes contain no serial links.
- QR data is exactly `https://k7rhy.app/sn/<SERIAL>`.
- A visitor-supplied direct lookup may be added later; enumeration remains prohibited.

## Verification checklist

1. Allocator scenarios and focused serial/content/component tests.
2. Metadata and sitemap exclusion tests.
3. Canonical QR and print-visibility tests.
4. `npx vitest run`.
5. `npm run build`.
6. Desktop/mobile and light/dark record review.
7. Letter/A4 one-page print review at 100% with no clipping or photograph, and a voice and control map that covers every pickup and control.
8. Physical or reliable decoded QR check of the canonical production URL.

Publication remains a separate explicit decision after all checks pass.
