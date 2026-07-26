# Future task: serialized instrument authoring skill

Build a narrow agent skill that accepts: serial, record name/submodel, completion date or year, origin, theme, exact-instrument images, related platform link, pickup configuration, control map, owner narrative, and case-card notes.

The skill must validate the `MMMYYNNN` format, registered family code, completion-year match, family/year sequence, exact image existence and alt text, MDX control cardinality, unlisted metadata, print layout, and QR destination.

It should create or update the instrument MDX record, exact-instrument image directory, focused content test, model-code registration when explicitly approved, and printable case-card output. It must never add the record to navigation, a sitemap, or a public index.

Verification must run focused serial/content/render tests, the full Vitest suite, a production build, desktop/mobile record review, Letter/A4 one-page print review, and QR scanning.
