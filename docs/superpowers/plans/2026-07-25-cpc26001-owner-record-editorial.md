# CPC26001 Owner Record Editorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite CPC26001 as an owner-centered permanent instrument record whose provenance, musical guidance, and technical reference make the guitar meaningful and useful to its owner.

**Architecture:** Keep the existing serial-record route, MDX component system, and case-card renderer unchanged. Update the shared harmonic-shaper language in `config/harmonic-shaper.ts` so web and print cannot drift, then replace the CPC26001 frontmatter and narrative with the approved owner-facing copy. Tests will lock the shared control descriptions, provenance, quiet inline lineage link, installed specification, owner guidance, and removal of promotional or builder-process language.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, MDX, Vitest, Testing Library, Tailwind print styles

## Global Constraints

- Every customer-facing sentence must help the owner understand, use, maintain, or tell the story of CPC26001.
- Do not add marketing calls to action, development disclaimers, future-revision language, workshop-location qualifications, or builder-process content.
- Keep exact component values and circuit topology on the full web record; do not expose them on the printable case card.
- Keep the pickup layout on one case-card row.
- Describe the six-position rotary switch as the control and the middle Filtertron as the pickup used for harmonic shaping.
- Retain the clearly non-photographic placeholder until the completed instrument is photographed, but do not add a customer-facing disclaimer about future replacement.
- Preserve serial `CPC26001`, year-only completion `2026`, publication status, exact pickup models, three-way selector order, and installed electrical values.
- Remove the standalone Relay related-content CTA; keep one quiet inline link to `/relay/voicings/current` in the lineage narrative.

---

### Task 1: Replace the Shared Harmonic-Shaper Language

**Files:**

- Modify: `config/harmonic-shaper.ts`
- Test: `components/instrument/instrument-position-control.test.tsx`
- Test: `components/instrument/instrument-print-position-control.test.tsx`

**Interfaces:**

- Consumes: `HarmonicShaper` and `PrintHarmonicShaper`, which inject shared purpose and position descriptions into the web and print renderers.
- Produces: `HARMONIC_SHAPER_PURPOSE: string` and `HARMONIC_SHAPER_POSITION_DESCRIPTIONS: readonly [string, string, string, string, string, string]` with the approved owner-facing language.

- [ ] **Step 1: Strengthen the web-renderer copy test**

In `components/instrument/instrument-position-control.test.tsx`, keep the existing structure and add exact expectations inside `uses shared Harmonic Shaper language while preserving installed references`:

```tsx
expect(HARMONIC_SHAPER_PURPOSE).toBe('The six-position rotary switch controls how strongly the middle Filtertron interacts with the selected humbucker voice. Position 6 provides the direct voice; positions 5 through 1 introduce progressively stronger harmonic shaping.');
expect(HARMONIC_SHAPER_POSITION_DESCRIPTIONS).toEqual(['The middle Filtertron has its strongest effect on the selected humbucker voice.', "Strong interaction, with more of the selected humbucker's original character.", 'The center of the range, balancing the selected humbucker with the harmonic shaper.', 'Light interaction that brings the selected humbucker further forward.', 'The closest shaped setting to the selected humbucker alone.', 'The middle Filtertron is disconnected; the selected humbucker voice passes unchanged.']);
```

- [ ] **Step 2: Run the focused tests and verify the old copy fails**

Run:

```bash
npx vitest run components/instrument/instrument-position-control.test.tsx components/instrument/instrument-print-position-control.test.tsx
```

Expected: FAIL because `config/harmonic-shaper.ts` still exports the earlier abstract descriptions.

- [ ] **Step 3: Replace the shared purpose and six preset descriptions**

Set `config/harmonic-shaper.ts` to:

```ts
export const HARMONIC_SHAPER_PURPOSE = 'The six-position rotary switch controls how strongly the middle Filtertron interacts with the selected humbucker voice. Position 6 provides the direct voice; positions 5 through 1 introduce progressively stronger harmonic shaping.';

export const HARMONIC_SHAPER_POSITION_DESCRIPTIONS = ['The middle Filtertron has its strongest effect on the selected humbucker voice.', "Strong interaction, with more of the selected humbucker's original character.", 'The center of the range, balancing the selected humbucker with the harmonic shaper.', 'Light interaction that brings the selected humbucker further forward.', 'The closest shaped setting to the selected humbucker alone.', 'The middle Filtertron is disconnected; the selected humbucker voice passes unchanged.'] as const;
```

- [ ] **Step 4: Run the focused component tests**

Run:

```bash
npx vitest run components/instrument/instrument-position-control.test.tsx components/instrument/instrument-print-position-control.test.tsx
```

Expected: both files PASS. The web renderer still shows the installed technical references, and the print renderer still omits them.

- [ ] **Step 5: Commit the shared language change**

```bash
git add config/harmonic-shaper.ts components/instrument/instrument-position-control.test.tsx components/instrument/instrument-print-position-control.test.tsx
git commit -m "content: clarify harmonic shaper guidance"
```

---

### Task 2: Rewrite the CPC26001 Permanent Owner Record

**Files:**

- Modify: `content/instruments/CPC26001.mdx`
- Test: `content/instruments/CPC26001.test.ts`

**Interfaces:**

- Consumes: the existing instrument MDX schema and the `HarmonicShaper` component backed by the shared constants from Task 1.
- Produces: published CPC26001 frontmatter, owner-facing selector copy, provenance and lineage narrative, musical exploration guidance, as-built technical reference, and setup guidance.

- [ ] **Step 1: Write failing assertions for the owner record**

Replace the second test in `content/instruments/CPC26001.test.ts` with an owner-value test that asserts the approved content and rejects the retired structure:

```ts
it('centers the permanent record on its owner, provenance, and musical use', () => {
    const source = readFileSync(recordPath, 'utf8');
    const lowerSource = source.toLowerCase();

    for (const required of ["origin: 'The first production Coupeville Current, personally crafted by Rhy Mednick in 2026.'", "theme: 'Familiar humbucker voices shaped through a middle Filtertron, with six engineered presets ranging from pronounced interaction to the direct voice of the selected pickups.'", '## The Coupeville line', 'each instrument carries that community’s spirit along with Rhy’s personal workmanship', '## The Current lineage', '[Relay Current](/relay/voicings/current)', '## What it is voiced to do', '## Exploring the harmonic shaper', '## Installed voice system', '## Playing and setup', '9–42', '10–46']) {
        expect(source).toContain(required);
    }

    for (const forbidden of ['related:', '## Design intent', '## Passive interaction', '## Installed electrical reference', '## Builder Notes', 'prototype', 'provisional', 'future revision', 'values may change', 'subject to change', 'particular workshop']) {
        expect(lowerSource).not.toContain(forbidden.toLowerCase());
    }
    expect(source).not.toContain(HARMONIC_SHAPER_PURPOSE);
    for (const description of HARMONIC_SHAPER_POSITION_DESCRIPTIONS) expect(source).not.toContain(description);
});
```

In the installed-specification test, add the exact selector descriptions:

```ts
'<SelectorPosition voice="Neck">A rounder, more open foundation.</SelectorPosition>',
'<SelectorPosition voice="Neck + Bridge">The broadest primary voice, combining bridge focus with the neck pickup’s rounder response.</SelectorPosition>',
'<SelectorPosition voice="Bridge">The firmest attack and strongest rhythmic focus.</SelectorPosition>',
```

- [ ] **Step 2: Run the record test and verify the old narrative fails**

Run:

```bash
npx vitest run content/instruments/CPC26001.test.ts
```

Expected: FAIL because the record still contains the Relay CTA and old headings and does not contain the approved provenance or musical guidance.

- [ ] **Step 3: Replace the frontmatter identity and remove the related CTA**

In `content/instruments/CPC26001.mdx`:

- keep `publish`, `name`, `completed`, images, and placeholder alt text unchanged
- replace `origin` with `The first production Coupeville Current, personally crafted by Rhy Mednick in 2026.`
- replace `theme` with `Familiar humbucker voices shaped through a middle Filtertron, with six engineered presets ranging from pronounced interaction to the direct voice of the selected pickups.`
- delete the complete `related` block

- [ ] **Step 4: Replace the selector and standard-control descriptions**

Use these exact owner-facing descriptions in the existing structured control map:

```mdx
<SelectorPosition voice="Neck">A rounder, more open foundation.</SelectorPosition>
<SelectorPosition voice="Neck + Bridge">The broadest primary voice, combining bridge focus with the neck pickup’s rounder response.</SelectorPosition>
<SelectorPosition voice="Bridge">The firmest attack and strongest rhythmic focus.</SelectorPosition>
```

Retain `Master output` with `Controls overall instrument output.` for print and retain `Treble rolloff` with `Provides conventional treble rolloff.` for print. Preserve the complete A500K, treble-bleed, and tone-capacitor details in the web descriptions.

- [ ] **Step 5: Replace the full narrative with the approved owner record**

After `</InstrumentSpec>`, use these sections in order:

```mdx
## The Coupeville line

Coupeville is the name Rhy Mednick gives to the instruments he personally crafts. The line takes its name from the small town community that inspired it, and each instrument carries that community’s spirit along with Rhy’s personal workmanship.

CPC26001 is the first production Coupeville Current—the instrument that establishes the model and begins its recorded lineage.

## The Current lineage

Coupeville Current evolves the pickup philosophy first explored in [Relay Current](/relay/voicings/current): the bridge and neck humbuckers remain the guitar’s primary voices, while a middle Filtertron changes how those voices respond. CPC26001 gives that relationship a new control system—a six-position rotary switch with repeatable harmonic-shaping presets instead of the original design’s switched contours.

The result remains familiar at its foundation. The three-way selector chooses neck, both humbuckers, or bridge; the rotary switch determines how strongly the middle Filtertron interacts with that selection.

## What it is voiced to do

Coupeville Current is built around clear attack, controlled low end, and a focused place in the mix. Rather than multiplying pickup combinations, it develops three dependable humbucker voices through different degrees of interaction with the middle Filtertron.

The bridge provides the firmest attack and strongest rhythmic focus. The neck offers a rounder, more open foundation. Together they create the broadest of the three primary voices. Each remains recognizable as the harmonic shaper changes its emphasis and response.

## Exploring the harmonic shaper

Position 6 is the direct reference: the middle Filtertron is disconnected, and the selected humbucker voice passes unchanged. From there, positions 5 through 1 introduce progressively stronger interaction. This makes it easy to begin with a familiar pickup sound, then add only as much focus, texture, and harmonic complexity as the part needs.

The control is designed for comparison rather than guesswork. Choose a pickup voice, begin at position 6, and move through the presets while keeping the three-way selector unchanged.

## Installed voice system

The primary voices come from a GFS Vintage 59 neck humbucker and a GFS Professional Series Alnico V HOT bridge humbucker. A GFS Retrotron Hot Nashville occupies the middle position, but it is dedicated to harmonic shaping rather than pickup selection.

The three-way selector keeps the guitar’s foundation straightforward. Master volume and tone apply across the instrument, while the six-position rotary switch controls the middle Filtertron’s interaction with the selected voice.

The master volume uses an A500K audio-taper control with a parallel 680 pF and 150 kΩ treble-bleed network. The master tone uses an A500K audio-taper control and a 22 nF capacitor. The six rotary-switch networks documented in the control map are the installed values for CPC26001.

## Playing and setup

CPC26001 is set up for 9–42 strings. A 10–46 set is the heaviest recommended alternative without revisiting the instrument’s setup.

To hear the harmonic shaper’s range most clearly, begin with a clean or lightly driven amplifier setting that preserves pick attack. Select one of the three humbucker voices, start with the rotary switch at position 6, and work toward position 1. Once the relationship between the presets is familiar, they can be used just as readily with heavier gain or effects.
```

- [ ] **Step 6: Run the CPC26001 and shared-control tests**

Run:

```bash
npx vitest run content/instruments/CPC26001.test.ts components/instrument/instrument-position-control.test.tsx components/instrument/instrument-print-position-control.test.tsx
```

Expected: all three files PASS. The record contains the installed values once, the web renderer supplies the shared preset copy, and the print renderer receives the same owner-facing descriptions without technical references.

- [ ] **Step 7: Commit the owner-record rewrite**

```bash
git add content/instruments/CPC26001.mdx content/instruments/CPC26001.test.ts
git commit -m "content: refocus CPC26001 on its owner"
```

---

### Task 3: Verify the Complete Owner Experience

**Files:**

- Verify: `content/instruments/CPC26001.mdx`
- Verify: `config/harmonic-shaper.ts`
- Verify: `/sn/CPC26001`
- Verify: `/sn/CPC26001/print`

**Interfaces:**

- Consumes: the complete serial-record content pipeline and print route.
- Produces: a verified desktop/mobile owner record and a one-page Letter/A4 musical quick-reference card.

- [ ] **Step 1: Format the changed files and check the diff**

Run:

```bash
npx prettier --write config/harmonic-shaper.ts content/instruments/CPC26001.mdx content/instruments/CPC26001.test.ts components/instrument/instrument-position-control.test.tsx components/instrument/instrument-print-position-control.test.tsx
git diff --check
```

Expected: Prettier completes and `git diff --check` produces no output.

- [ ] **Step 2: Run lint and the complete test suite**

Run:

```bash
npm run lint
npx vitest run
```

Expected: lint reports no errors or warnings from changed files; all test files pass.

- [ ] **Step 3: Run the production build**

Run:

```bash
npm run build
```

Expected: build exits 0 and the route table includes `/sn/CPC26001` and `/sn/CPC26001/print`. Existing notices about the inferred workspace root, missing optional AI-summary key, or unrelated test warnings do not invalidate a successful build.

- [ ] **Step 4: Review the web record at desktop and mobile widths**

Run `npm run dev`, open `http://localhost:3000/sn/CPC26001`, and verify:

- the hero identifies the first production Coupeville Current and Rhy Mednick without clipping
- the placeholder is unmistakably non-photographic
- the narrative reads in the approved order
- `Relay Current` is an inline link and there is no related-content CTA below the article
- the installed network values remain on the full record
- there is no horizontal overflow at approximately 1440 px and 390 px viewport widths

- [ ] **Step 5: Review Letter and A4 case-card proofs**

Open `http://localhost:3000/sn/CPC26001/print` and produce one Letter and one A4 proof using the established headless-Chrome/PDF workflow. Confirm:

- each proof is exactly one page
- the pickup configuration stays on one row
- all six revised preset descriptions are legible
- no resistor, capacitor, potentiometer, or rotary-network values appear
- the origin, permanent URL, QR code, and Discord owner-support link remain readable
- nothing overlaps, clips, or spills outside the printable page

- [ ] **Step 6: Commit only if verification required a correction**

If visual review reveals a copy or layout defect, write a focused failing test where practical, make the smallest correction, rerun the affected focused test plus Steps 1–5, and commit only those verified corrections:

```bash
git add config/harmonic-shaper.ts content/instruments/CPC26001.mdx content/instruments/CPC26001.test.ts components/instrument/instrument-position-control.test.tsx components/instrument/instrument-print-position-control.test.tsx
git commit -m "fix: polish CPC26001 owner record"
```

If no correction was needed, do not create an empty commit.

- [ ] **Step 7: Confirm the branch is clean and summarize evidence**

Run:

```bash
git status --short
git log --oneline -5
```

Expected: no uncommitted production changes. Report focused tests, total passing tests, build result, responsive review, Letter/A4 page counts, and any pre-existing non-blocking warnings.
