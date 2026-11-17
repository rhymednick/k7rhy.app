# 5E326001 — 5E3 tweed-style tube combo

Status: publication approved by the owner on November 16, 2026; `publish: true` is prepared in PR #156, awaiting production deployment. This is an existing issued
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

- Page 1 of the owner-supplied verification sheet now establishes the installed tube types/count and 120 VAC / 60 Hz mains rating. Transformer maker/model, internal component values, fuse characteristic, and fuse voltage rating remain unestablished.
- The supplied first page has been transcribed with grounding/isolation results. The operating-measurement/shop-release page is still absent; do not invent those values or a release result.
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
`/workspace/scratch/5E326001-preview/` for this execution session. All 349 tests in 64 files and the production build pass under Node 20. Shopify requests were unavailable in this execution network during the build. The six allocator scenarios also pass. Structured results are in [validation.json](validation.json).

## Owner-supplied front photograph (2026-11-16)

The owner attached a front photograph in this chat. It visibly shows the tweed
cabinet covering, dark grille cloth, and four visible front screws. The photo
appears sideways and needs orientation checking before final use. No internal
components, rear-panel ratings, serial label, or measurement values are visible.
The image alt text now uses only these visible front-view details.

The chat attachment is available to visual inspection but no file ID, local
path, or download bytes were exposed to this cloud session. The record therefore
still references the original Shopify CDN image; no local photo asset has been
created, and the attachment has not been byte-matched to that remote source.
An original JPEG supplied as a downloadable file/ZIP, or made available in the
local project, would allow saving and orientation verification. Do not use a
generative reconstruction as a substitute for the actual product photograph.

## Owner-supplied verification sheet (2026-11-16)

Page 1 of K7RHY-BVR-5E3-R1 is now available for visual reading. The
[transcription](build-verification-page-1.md) records the clearly legible installed
devices, nominal mains/fuse information, and builder-recorded grounding/isolation
checks. The permanent record now includes those facts in a lower technical
section with explicit attribution, without presenting them as new measurements.

Manufacturer handwriting for the output and rectifier tubes is not promoted to
a maker claim. Page 2 operating measurements and release information are still
unavailable. The inline photograph itself remains unavailable as a local file.

## Owner-supplied chassis-interior photograph (2026-11-16)

The owner supplied a view into the open chassis. It shows a hand-wired component
board with raised terminal posts, axial resistors and capacitors, point-to-point
connections to the panel controls and tube sockets, and a twisted red wire pair
routed along the socket side. The cabinet covering and part of the speaker are
also visible. This is useful construction-reference evidence for future service.

Do not infer a complete netlist, operating voltages, component tolerances,
transformer specifications, or a safety/release result from the photograph. Some
component markings are visible, but no position-specific value inventory has
been verified; the existing electrical-rating and measurement claims continue
to rely on the verification sheet. The photograph's capture date is unknown.

As with the front photograph, the inline image is visually available but has no
exposed original file ID or local path. No image asset or gallery entry has been
created from it. The source photograph should be retained with the instrument's
service documentation when its original file becomes available.


## Original files saved and release authorization (2026-11-16)

This section supersedes earlier missing-image and unpublished-draft notes above.
The owner supplied Archive.zip containing four original JPEGs and instructed us
to finish the records and send the announcements. Upright, metadata-stripped
copies are saved under `public/images/instruments/5E326001/`: front, controls,
chassis interior, and verification page 1. All four orientations were reviewed
visually. [photo-manifest.json](photo-manifest.json) records source names,
processing, and checksums. The record now uses local photographs and links the
original verification sheet, so it no longer depends on the remote Shopify image.

The owner's instruction authorizes publishing this record with the established
facts. Verification page 2 remains absent; no missing operating measurements or
shop-release result is asserted. Publication and Discord delivery must still be
verified after deployment; photo preservation itself is complete.
