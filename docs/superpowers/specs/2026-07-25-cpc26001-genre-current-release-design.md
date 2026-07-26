# CPC26001 genre summary + Relay Current release — design

**Date:** 2026-07-25

## Problem

Two related content gaps around the Current voicing:

1. The Coupeville Current serial-number record (CPC26001) doesn't state what the model
   is voiced to do musically. The Relay Current voicing page communicates its genre focus
   (funk / pop / rock), but the CPC26001 hero summary does not.
2. Relay Current is still marked as a `lab` voicing (design defined but not physically
   built/validated). It has since been built and released, so it should read as an active,
   released model — not a lab experiment.

## Changes

### 1. Genre in the Coupeville hero summary

The CPC26001 hero summary renders from the `theme` frontmatter field
(`components/instrument/instrument-record-page.tsx`). Genre is woven into that prose
sentence — the record type has no structured `genres` field, and the summary is descriptive
prose rather than the badge-style genre dots used in the Relay voicing grid.

- **File:** `content/instruments/CPC26001.mdx`
- Genre text matches the Relay Current voicing it evolves from: funk, pop, and rock.
- Appended clause: `…—voiced for funk, pop, and rock.`

### 2. Relay Current marked released

Voicing status is single-sourced in `config/relay-voicings.ts`. Flipping `current` from
`lab` to `ready` is a data-only change that automatically:

- swaps the badge from "Lab" to "Ready" (`relay-voicing-status-badge.tsx`),
- removes the amber "Lab voicing" caution callout (`relay-voicing-overview.tsx`),
- reorders it ahead of `concept` voicings (`sortRelayVoicings`),
- switches the Discord community CTA to the released-voicing message.

No Current MDX or component edits are needed — all lab-experiment framing is status-driven.

### 3. Current Discord thread

Current now has a dedicated Discord forum thread (`1530796354341834903`), added to
`relayDiscordVoicingThreads` in `config/relay-discord.ts` so the released voicing links to
its own thread instead of the parent forum channel.

## Tests updated

- `__tests__/config/relay-voicings.test.ts` — expected `current` status `lab` → `ready`.
- `components/doc/relay-voicing-grid.test.tsx` — ordering assertion now covers 5 ready
  voicings (adds Relay Current).
- `config/relay-discord.test.ts` — `current` moved from forum-channel fallback to a mapped
  thread assertion.

## Verification

- `npx vitest run` — 182 tests pass.
- `npm run build` — compiles and generates sitemap.
