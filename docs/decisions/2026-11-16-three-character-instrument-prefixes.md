# Three-character instrument serial prefixes

Date: 2026-11-16 (owner's timezone).
Status: implemented; validation recorded below.

The owner clarified: the prefix should have been **three characters**, not
**three letters**. The existing amp serial `5E326001` uses the prefix `5E3`.
This supersedes the letter-only interpretation in the instrument-record specs,
parser, allocator, and QR-label script.

Keep the eight-character `MMMYYNNN` format. Allow uppercase ASCII letters and
digits in the three-character registered prefix; keep the two-digit year and
three-digit sequence. User input still normalizes to uppercase. Unknown codes,
malformed serials, and allocation gaps remain errors. Add the already-issued
`5E3` code to the registry as "5E3-style tube amplifier" so the known serial
can parse. This repairs support for the owner's existing prefix rather than
allocating a new serial or inventing an amplifier identity.

The allocator reads both quoted and unquoted registry keys and counts numeric-
prefix filenames when checking continuity. The QR generator accepts the same
prefix character set and still requires an existing record file.

No record or public asset is created by this correction. The amp record's source
and live URL still need locating. In particular, do not allocate another 5E3
serial while the already-issued 5E326001 record is absent from this checkout.
Record layout, visibility, sitemap exclusions, and publication approval rules
remain unchanged.

Focused tests cover parsing/canonical URLs for 5E326001, rejection of unknown
numeric prefixes, numeric-prefix allocation and gap detection, and QR-label
production in a temporary fixture. No natural-language judgment is introduced;
these are deterministic format/lookup checks.

Validation: all 338 Vitest tests in 62 files and the production build pass under
Node 20. All six standalone allocator scenarios pass, including numeric-prefix
continuity/gap cases. QR testing used a temporary fixture only; no instrument
record, label asset, or serial allocation was published.
