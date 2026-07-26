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
- Completion: honest `YYYY` or `YYYY-MM-DD`; its year must match `YY`.
- Images: at least one exact-instrument image under `/images/instruments/<SERIAL>/` with useful alt text. A clearly marked placeholder is acceptable only when explicitly approved.
- Drafting: new records remain `publish: false` until explicit publication approval.
- Narrative: explain identity, provenance, installed work, musical character, use, and care when known. Exclude private owner history, price, availability, transaction details, and authenticity claims.

## Structured MDX invariants

- `InstrumentSpec` contains exactly one `PickupConfiguration` and one `ControlLayout`.
- Every pickup supplies the props required by the live `Pickup` implementation.
- A selector has exactly the declared number of positions; display numbers derive from child order.
- A standard pot has one `normal` state.
- A push-pull or push-push pot has exactly one `down` and one `up` state.
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
7. Letter/A4 one-page print review at 100% with no clipping or photograph.
8. Physical or reliable decoded QR check of the canonical production URL.

Publication remains a separate explicit decision after all checks pass.
