# Serialized instrument authoring

Use `$author-instrument-record` as the primary method for creating or updating a permanent instrument record and printable case card. The skill determines the next serial, collects missing facts, preserves the unlisted-record policy, and runs the required checks.

## Manual procedure

1. Read `docs/architecture/site-organization.md`, the instrument schema in `content-collections.ts`, and the live component contracts under `components/instrument/`.
2. Choose the registered family code and an honest completion value in `YYYY` or `YYYY-MM-DD` form. Request explicit approval before adding a code to `config/instrument-model-codes.ts`.
3. Determine the serial with `node .agents/skills/author-instrument-record/scripts/allocate-serial.mjs --root . --family <MMM> --completed <YYYY|YYYY-MM-DD>`. Use the emitted `MMMYYNNN` exactly. If it reports a gap, create or restore the missing permanent record before continuing; never skip a number.
4. Copy the closest current record to `content/instruments/<SERIAL>.mdx`. Keep `publish: false` while replacing every identity field, image, pickup, selector, control state, narrative section, and print-specific description.
5. Put exact-instrument photographs under `public/images/instruments/<SERIAL>/` and give every image useful alt text. Keep photographs off the printable card.
6. Create `content/instruments/<SERIAL>.test.ts` before completing the MDX. Test the published identity, required installed facts, image paths, control structure, and record-specific prohibited claims.
7. Confirm selectors contain exactly their declared number of positions. Standard pots require one `normal` state; push-pull and push-push pots require one `down` and one `up` state. Follow live component contracts for additional controls.
8. Confirm both serial routes retain `noindex, nofollow`, `next-sitemap.config.js` excludes `/sn/*`, and no navigation, catalog, subject page, or public index links the record. Confirm the QR data is `https://k7rhy.app/sn/<SERIAL>`.
9. Run focused serial, content, component, metadata, sitemap, print, and QR tests; then run `npx vitest run` and `npm run build`.
10. Preview `/sn/<SERIAL>` in light/dark and desktop/mobile layouts. Preview `/sn/<SERIAL>/print` on Letter and A4 at 100%, confirm one page with no clipping or photograph, and scan the QR code.
11. Set `publish: true` only after explicit approval, then repeat the full test, build, rendered, print, and QR checks before deployment.

`REX` means Relay Example. Reserve `RLY` for real Relay prototypes that are sold. `CVL` sequences every Coupeville instrument completed in the same year regardless of submodel. If an issued instrument is destroyed or unavailable, retain a permanent record for its serial so the sequence remains complete.
