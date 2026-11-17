# 5E326001 — 5E3 tweed-style tube combo

Status: record created as an unpublished draft. This is an existing issued
serial, not a new allocation. The owner authorized creation from available
information on November 16, 2026.

## Source evidence

Live Shopify product `gid://shopify/Product/9035797790877`, retrieved through the
connected account on November 16, 2026. The exact listing description and photo
references are preserved in [shopify-source.json](shopify-source.json).

The source explicitly identifies:

- Serial 5E326001, manufactured August 15, 2026; individually built by K7RHY.
- A combo based on the late-1950s Fender 5E3 circuit, approximately 12 watts.
- Electro-Harmonix 12-inch speaker, rated 75 watts and 8 ohms.
- Normal 1/2 and Bright 1/2 inputs, with higher/lower sensitivity per channel.
- Normal Volume, Bright Volume, shared Tone, Standby, and Power controls.
- Interactive Volume controls, including when the other channel is unused.
- Speaker cable soldered at the speaker and plugged into the output jack.
- 2A fuse and attached mains cord; safe-use instructions in the listing.
- Supplied Build Verification Record, as-shipped operating measurements,
  grounding/isolation test results, and operating/safety guides.

These are owner-authored listing facts, not a new physical inspection. The
record does not claim independent safety certification or reproduce unseen
measurement values.

## Permanent record

Source: [5E326001.mdx](../../../content/instruments/5E326001.mdx).
Intended canonical URL: `https://k7rhy.app/sn/5E326001`.
Print card: `/sn/5E326001/print`.

The draft has `kind: amplifier`, an amplifier-specific structured map, the
verified completion date, and a reference to the exact listing's primary photo.
It contains no price, availability, checkout, shipping/returns policy, or private
owner narrative. It stays unlisted and noindex; no catalog/index link is added.

The source image could not be downloaded: this execution environment's network
proxy returned 403 for the Shopify CDN URL. That is not evidence of missing
Shopify permissions or a missing image. The URL is retained rather than replacing
it with an invented photograph. Image alt text identifies the listing's subject
without guessing visual details. Remote image validation is limited to this
store's HTTPS Shopify CDN path, already supported by Next's image configuration.

## Unknowns and remaining checks

- No tube types/count, transformer models, internal component values, or mains
  voltage are established by the accessible source. Omit them until verified.
- The listing says the measurement/test documents exist, but the actual sheets
  have not been read. Do not invent operating voltages or test results.
- The Standby control's circuit topology, exact panel markings/orientation, and
  switching sequence are not established. The owner record refers to the supplied
  Quick Start guide instead of inventing a startup procedure.
- Photo appearance and the paper documentation need review from accessible
  originals before publication. The owner can attach them directly to this chat.
- Keep `publish: false` during review; publication approval is separate.

## Validation

The actual MDX renders through both the web and print component families in
focused tests, preserving all four inputs and five controls. Layout checks in a
headless Chromium browser at 1440 px and 390 px, in light/dark, show no horizontal
overflow or runtime page errors. The original remote photo request was blocked
for layout checks, so those checks do not validate the photo's appearance.

Letter and A4 PDFs are each one page. All controls are present, the control card
has no instrument photo, and its rendered QR code decodes to
`https://k7rhy.app/sn/5E326001`. Preview artifacts are under
`/workspace/scratch/5E326001-preview/` for this execution session. All 347 tests in 64 files and the production build pass under Node 20 in CI/preview mode. The six allocator scenarios also pass. Structured results are in [validation.json](validation.json).
