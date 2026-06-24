# PRS26001 Instrument Record Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the permanent `/sn/PRS26001` reference page and its one-page printable case card, using the supplied guitar photograph and the authoritative Seymour Duncan wiring documents.

**Architecture:** Extend the shared instrument date model to support an honest year-only value and custom label, then author PRS26001 as a validated MDX record rendered by the existing web and print routes. Keep the permanent record entirely separate from sales concerns; record the sale page only as deferred work in `.remember/remember.md`.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict mode, Content Collections, MDX, Tailwind CSS, Vitest, Next Image.

## Global Constraints

- Create only `/sn/PRS26001` and `/sn/PRS26001/print`; do not create a `/products/guitars/` page.
- Display `Modified 2026` with no invented month or day.
- Do not mention price, availability, negotiation, purchasing, personal attachment, a replacement guitar, reason for selling, removed pickups, reversibility, or condition.
- Explain that PRS26001 served as the K7RHY platform-reference instrument while other guitars were developed and evaluated.
- Explicitly identify blues, funk, soul, folk, jazz, yacht rock, and expressive clean-to-edge-of-breakup playing as strengths without implying those are limitations.
- Use the two PDFs as the authoritative as-built wiring source where the HTML guide conflicts.
- Use Seymour Duncan APH-1b and APH-1n Alnico II Pro pickups, approximately 1.8 kΩ partial-split resistors, Oak Grigsby five-way switching, a 500 kΩ master volume, a 500 kΩ push-pull master tone, a 0.022 µF film capacitor, and PRS locking tuners.
- Keep the supplied photograph on the web page and off the case card.
- Preserve the standard site header/footer, canonical QR destination, centralized Discord support, and the corrected Letter/A4 print-safe composition at 100% browser scale.
- Add a durable TODO for a separate future sale page; do not implement that page in this plan.

---

### Task 1: Support year-only modified-date metadata

**Files:**
- Create: `lib/instruments/date.ts`
- Create: `lib/instruments/date.test.ts`
- Modify: `types/instrument.ts`
- Modify: `content-collections.ts`
- Modify: `lib/instruments/validation.test.ts`
- Modify: `components/instrument/instrument-record-page.tsx`
- Modify: `components/instrument/instrument-record-page.test.tsx`
- Modify: `components/instrument/instrument-case-card.tsx`
- Modify: `components/instrument/instrument-case-card.test.tsx`

**Interfaces:**
- Produces: `formatInstrumentDate(value: string): string` and `instrumentDateLabel(dateLabel?: string): string`.
- Produces: `InstrumentFrontmatter.dateLabel?: string` while retaining `completed: string`.
- Consumes: `completed` values matching either `YYYY` or `YYYY-MM-DD`.
- Preserves: existing records default to `Completed` and retain full-date display.

- [ ] **Step 1: Write failing date-format and year-only validation tests**

Create `lib/instruments/date.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatInstrumentDate, instrumentDateLabel } from './date';

describe('instrument date presentation', () => {
    it('renders year-only records without inventing a month or day', () => {
        expect(formatInstrumentDate('2026')).toBe('2026');
    });

    it('preserves the existing long-date presentation', () => {
        expect(formatInstrumentDate('2026-06-19')).toBe('June 19, 2026');
    });

    it('defaults to Completed and accepts a custom record label', () => {
        expect(instrumentDateLabel()).toBe('Completed');
        expect(instrumentDateLabel('Modified')).toBe('Modified');
    });
});
```

Add these cases to `lib/instruments/validation.test.ts`:

```ts
it('accepts a year-only completion value matching the serial year', () => {
    expect(validateInstrumentDocument('PRS26001', { ...valid, completed: '2026' })).toMatchObject({ serial: 'PRS26001', year: 2026 });
});

it('rejects a year-only completion value that differs from the serial year', () => {
    expect(() => validateInstrumentDocument('PRS26001', { ...valid, completed: '2025' })).toThrow('PRS26001 year does not match completion date 2025');
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
npx vitest run lib/instruments/date.test.ts lib/instruments/validation.test.ts
```

Expected: FAIL because `lib/instruments/date.ts` does not exist. After creating only an empty export if needed to reach schema behavior, the year-only content schema remains unsupported until the implementation step.

- [ ] **Step 3: Implement the shared date model**

Create `lib/instruments/date.ts`:

```ts
const YEAR_ONLY = /^\d{4}$/;

export function formatInstrumentDate(value: string): string {
    if (YEAR_ONLY.test(value)) return value;

    return new Date(`${value}T00:00:00Z`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    });
}

export function instrumentDateLabel(dateLabel?: string): string {
    const label = dateLabel?.trim();
    return label && label.length > 0 ? label : 'Completed';
}
```

Add the optional field to `InstrumentFrontmatter` in `types/instrument.ts`:

```ts
dateLabel?: string;
```

Change the instrument schema fields in `content-collections.ts` to:

```ts
completed: z.union([z.string().regex(/^\d{4}$/, 'Expected YYYY or YYYY-MM-DD.'), z.string().date('Invalid completion date.')]),
dateLabel: z.string().min(1).optional(),
```

No validation change is required in `validateInstrumentDocument`: its existing `data.completed.slice(0, 4)` year comparison works for both supported forms.

- [ ] **Step 4: Write failing component tests for `Modified 2026`**

Add this test to `components/instrument/instrument-record-page.test.tsx`:

```tsx
it('uses a custom date label with a year-only value', () => {
    render(
        <InstrumentRecordPage record={{ ...record, completed: '2026', dateLabel: 'Modified' }}>
            <div>Structured specification</div>
        </InstrumentRecordPage>,
    );

    expect(screen.getByText('Modified')).toBeInTheDocument();
    expect(screen.getAllByText('2026').length).toBeGreaterThan(0);
    expect(screen.queryByText('January 1, 2026')).not.toBeInTheDocument();
});
```

Add this test to `components/instrument/instrument-case-card.test.tsx`:

```tsx
it('prints a custom year-only record label', () => {
    const { container } = render(
        <InstrumentCaseCard record={{ ...record, completed: '2026', dateLabel: 'Modified' }}>
            <div>Control map</div>
        </InstrumentCaseCard>,
    );

    expect(container).toHaveTextContent('MODIFIED 2026');
    expect(container).not.toHaveTextContent('COMPLETED 2026');
});
```

- [ ] **Step 5: Run the component tests and verify RED**

Run:

```bash
npx vitest run components/instrument/instrument-record-page.test.tsx components/instrument/instrument-case-card.test.tsx
```

Expected: FAIL because the components still hard-code `Completed` and the web formatter treats `2026` as a complete date.

- [ ] **Step 6: Use the shared date functions in web and print components**

In `components/instrument/instrument-record-page.tsx`, import:

```ts
import { formatInstrumentDate, instrumentDateLabel } from '@/lib/instruments/date';
```

Remove the private `formatCompletedDate` function. Inside `InstrumentRecordPage`, define:

```ts
const dateLabel = instrumentDateLabel(record.dateLabel);
```

Use these exact presentations:

```tsx
<p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
    {record.modelDescription} · {dateLabel.toLowerCase()} {record.year}
</p>
```

```tsx
<dt className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">{dateLabel}</dt>
<dd className="mt-1 text-slate-800 dark:text-slate-200">{formatInstrumentDate(record.completed)}</dd>
```

In `components/instrument/instrument-case-card.tsx`, import `instrumentDateLabel`, define the same `dateLabel`, and replace the identity line with:

```tsx
<div className="font-mono text-[8.5pt] font-semibold tracking-[0.14em] text-sky-700">
    {record.serial} · {dateLabel.toUpperCase()} {record.year}
</div>
```

- [ ] **Step 7: Run the focused suite and verify GREEN**

Run:

```bash
npx vitest run lib/instruments/date.test.ts lib/instruments/validation.test.ts components/instrument/instrument-record-page.test.tsx components/instrument/instrument-case-card.test.tsx
```

Expected: all tests pass.

- [ ] **Step 8: Commit the date enhancement**

```bash
git add types/instrument.ts content-collections.ts lib/instruments/date.ts lib/instruments/date.test.ts lib/instruments/validation.test.ts components/instrument/instrument-record-page.tsx components/instrument/instrument-record-page.test.tsx components/instrument/instrument-case-card.tsx components/instrument/instrument-case-card.test.tsx
git commit -m "feat(instruments): support year-only record dates"
```

---

### Task 2: Create the PRS26001 photograph and validated MDX record

**Files:**
- Create: `public/images/instruments/PRS26001/front.jpg`
- Create: `content/instruments/PRS26001.mdx`
- Create: `content/instruments/PRS26001.test.ts`

**Interfaces:**
- Consumes: the existing strict compound components `InstrumentSpec`, `PickupConfiguration`, `Pickup`, `PickupDetail`, `ControlLayout`, `Selector`, `SelectorPosition`, `Pot`, and `PotPosition`.
- Consumes: `completed: '2026'` and `dateLabel: 'Modified'` support from Task 1.
- Produces: published static routes `/sn/PRS26001` and `/sn/PRS26001/print` with canonical QR URL `https://k7rhy.app/sn/PRS26001`.

- [ ] **Step 1: Write a failing permanent-record content contract test**

Create `content/instruments/PRS26001.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const path = join(process.cwd(), 'content/instruments/PRS26001.mdx');

describe('PRS26001 permanent record', () => {
    it('documents identity, installed hardware, voices, and intended musical work', () => {
        const source = readFileSync(path, 'utf8');

        expect(source).toContain("completed: '2026'");
        expect(source).toContain("dateLabel: 'Modified'");
        expect(source).toContain('Seymour Duncan');
        expect(source).toContain('APH-1b Alnico II Pro');
        expect(source).toContain('APH-1n Alnico II Pro');
        expect(source).toContain('PRS locking tuners');
        expect(source).toContain('<Selector label="Pickup selector" positions={5}>');
        expect(source).toContain('blues, funk, soul, folk, jazz, and yacht rock');
        expect(source).toContain('platform-reference instrument');
    });

    it('contains no sale, condition, or personal-owner narrative', () => {
        const source = readFileSync(path, 'utf8').toLowerCase();

        for (const forbidden of ['price', 'asking', 'for sale', 'buy now', 'excellent condition', 'visible marks', 'personal favorite', "paul's guitar", 'reversible']) {
            expect(source).not.toContain(forbidden);
        }
    });
});
```

- [ ] **Step 2: Run the record test and verify RED**

Run:

```bash
npx vitest run content/instruments/PRS26001.test.ts
```

Expected: FAIL with `ENOENT` because `PRS26001.mdx` does not exist.

- [ ] **Step 3: Optimize the supplied photograph**

Create the destination directory and convert the supplied 4284 × 5712 PNG to a color-managed JPEG no larger than 2400 pixels on its longest side:

```bash
mkdir -p public/images/instruments/PRS26001
sips -s format jpeg -s formatOptions 88 --resampleHeightWidthMax 2400 /Users/rhy/Desktop/BurlPRS.png --out public/images/instruments/PRS26001/front.jpg
sips -g pixelWidth -g pixelHeight -g fileSize public/images/instruments/PRS26001/front.jpg
```

Expected: a portrait JPEG with longest dimension 2400 pixels, readable dimensions, and substantially smaller size than the 29 MB source PNG.

- [ ] **Step 4: Author the complete MDX record**

Create `content/instruments/PRS26001.mdx` with this exact initial content:

```mdx
---
publish: true
name: 'PRS SE Custom 24 Burled Ash'
completed: '2026'
dateLabel: 'Modified'
origin: 'A 2024-production PRS SE Custom 24 Burled Ash Limited Edition, upgraded and individually voiced by K7RHY Resonance Lab in 2026.'
theme: 'Warm Alnico II authority, partial-split snap, and articulate parallel cleans—voiced for blues, funk, soul, folk, jazz, yacht rock, and expressive clean-to-edge-of-breakup playing.'
images:
    - src: '/images/instruments/PRS26001/front.jpg'
      alt: 'Natural-finish PRS SE Custom 24 Burled Ash reference guitar, full front view'
---

<InstrumentSpec>
    <PickupConfiguration>
        <Pickup position="bridge" type="humbucker" brand="Seymour Duncan" model="APH-1b Alnico II Pro">
            <PickupDetail label="Magnet">Alnico II</PickupDetail>
            <PickupDetail label="Core mode">Series</PickupDetail>
            <PickupDetail label="Clean mode">Parallel</PickupDetail>
        </Pickup>
        <Pickup position="neck" type="humbucker" brand="Seymour Duncan" model="APH-1n Alnico II Pro">
            <PickupDetail label="Magnet">Alnico II</PickupDetail>
            <PickupDetail label="Core mode">Series</PickupDetail>
            <PickupDetail label="Clean mode">Parallel</PickupDetail>
        </Pickup>
    </PickupConfiguration>

    <ControlLayout>
        <Selector label="Pickup selector" positions={5}>
            <SelectorPosition voice="Bridge — Full Punch">Bridge humbucker in series for firm lows, rounded attack, and full output.</SelectorPosition>
            <SelectorPosition voice="Inside Coils — Money Funk">Bridge and neck inside coils with partial splits for bright, percussive clarity without a thin hard-split response.</SelectorPosition>
            <SelectorPosition voice="Both Humbuckers — Wide Blend">Both pickups in their full core voices for a broad, creamy, balanced sound.</SelectorPosition>
            <SelectorPosition voice="Neck Partial Split — Touch Voice">Open, responsive, single-coil-like neck texture that retains body.</SelectorPosition>
            <SelectorPosition voice="Neck — Warm Voice">Neck humbucker in series for warm, articulate, expressive playing.</SelectorPosition>
        </Selector>
        <Pot label="Master volume" mechanism="standard">
            <PotPosition position="normal" voice="Master output">Controls overall instrument level across every selector and push-pull setting.</PotPosition>
        </Pot>
        <Pot label="Master tone" mechanism="push-pull">
            <PotPosition position="down" voice="Core mode">Conventional treble rolloff with full series humbuckers in positions 1, 3, and 5.</PotPosition>
            <PotPosition position="up" voice="Refined / clean mode">Keeps tone control active and changes positions 1, 3, and 5 to lower-output internal-parallel humbucker voices. Positions 2 and 4 are unchanged.</PotPosition>
        </Pot>
    </ControlLayout>
</InstrumentSpec>

## The platform

PRS26001 began as a natural-finish 2024-production PRS SE Custom 24 Burled Ash Limited Edition: a solidbody platform with a burled swamp-ash veneer over a maple top, mahogany back, Wide Thin maple neck, rosewood fingerboard, 24 frets, a 25-inch scale, bird inlays, a PRS molded tremolo, and nickel hardware. PRS locking tuners complete the installed hardware configuration.

## K7RHY platform reference

This guitar served as the K7RHY platform-reference instrument while other guitars were being designed, assembled, and evaluated. Its consistent feel and expanded switching made it a useful baseline for comparing dynamic response, pickup balance, control utility, and clean-to-edge-of-breakup voicing.

## What it is voiced to do

The Alnico II Pro set gives the guitar a warm, touch-sensitive center. The full-series positions provide enough authority for stronger rhythm work and sustained leads, while the partial-split and internal-parallel voices make it especially effective for blues, funk, soul, folk, jazz, and yacht rock. Its particular strength is expressive clean-to-edge-of-breakup playing, where changes in touch and guitar volume remain easy to hear.

Pulling the tone control engages the refined/clean mode. The full-humbucker selector positions become clearer, leaner, and lower in output while remaining hum-canceling. The two partial-split positions stay unchanged, so the five-way selector remains predictable in either mode.

## Installed voice system

The factory electronics were replaced by a Seymour Duncan APH-1b/APH-1n Alnico II Pro set, an Oak Grigsby five-way blade, 500 kΩ master volume and push-pull tone controls, a 0.022 µF film tone capacitor, and approximately 1.8 kΩ partial-split resistors. The system was voiced as a coherent ten-sound instrument rather than as a collection of unrelated switching options.
```

- [ ] **Step 5: Run the content contract and strict-component tests**

Run:

```bash
npx vitest run content/instruments/PRS26001.test.ts components/instrument/instrument-spec.test.tsx
```

Expected: all tests pass.

- [ ] **Step 6: Commit the photograph and record**

```bash
git add public/images/instruments/PRS26001/front.jpg content/instruments/PRS26001.mdx content/instruments/PRS26001.test.ts
git commit -m "content(instruments): add PRS26001 reference record"
```

---

### Task 3: Record the deferred sale page and verify the complete experience

**Files:**
- Modify: `.remember/remember.md`
- Modify: `docs/superpowers/plans/2026-06-23-prs26001-instrument-record.md`

**Interfaces:**
- Consumes: the published PRS26001 record and shared routes from Tasks 1–2.
- Produces: durable deferred-sale-page context without adding a sale route or sales content.

- [ ] **Step 1: Update the durable handoff**

Replace `.remember/remember.md` with:

```md
# Handoff

## State

The serialized instrument system is implemented on `codex/instrument-records`. `RLY26001` is the demonstration record, and `PRS26001` is the first real modified-instrument reference record. PRS26001 uses year-only `Modified 2026` metadata, its supplied optimized photograph, a five-way voice map, and a print-safe case card.

## Next

1. Create a separate sale page for PRS26001 when requested.
2. Keep the sale page independent from `/sn/PRS26001` and its case card.
3. The future sale page may include personal connection, reason for selling, asking price, transaction details, included accessories, and sale-specific photography.

## Context

The permanent serial record contains instrument provenance, platform-reference history, installed components, musical-use guidance, controls, canonical QR, and Discord support. It deliberately excludes price, availability, condition, personal-owner narrative, and other transaction-specific information.
```

- [ ] **Step 2: Run the full automated verification**

Run:

```bash
npx vitest run
npm run build
```

Expected:

- 31 test files pass, including the new date and PRS26001 content contracts.
- Content Collections accepts `completed: '2026'`.
- Static generation lists `/sn/PRS26001` and `/sn/PRS26001/print`.
- Sitemap generation completes.

- [ ] **Step 3: Start the local preview and inspect the web record**

Run:

```bash
npm run dev
```

Open `/sn/PRS26001` with the in-app browser and verify:

- standard site header and footer are present
- hero image is sharp, correctly oriented, and free of unexpected cropping
- title, serial, origin, `Modified 2026`, and theme are correct
- all five selector positions are automatically numbered in bridge-to-neck order
- standard volume and both push-pull tone states render
- APH-1 pickup details and PRS locking tuners appear
- musical-use guidance names all approved genres
- no forbidden sale, condition, or personal-owner language appears
- desktop light/dark and 390 × 844 mobile layouts have no horizontal overflow
- browser console has no new errors

- [ ] **Step 4: Inspect the printable card**

Open `/sn/PRS26001/print` and verify:

- `PRS26001 · MODIFIED 2026` is visible
- site logo and `K7RHY Resonance Lab` masthead render
- five selector voices, standard volume, and both tone states are legible
- APH-1b and APH-1n brand/model details render
- origin, Discord, canonical URL, and QR remain inside the card
- the card fits one Letter and one A4 page at 100% browser scale
- QR encodes `https://k7rhy.app/sn/PRS26001`
- there is no guitar photograph, price, condition, or sales language

- [ ] **Step 5: Mark this plan complete and commit the handoff**

Change all remaining plan checkboxes to `[x]`, then run:

```bash
git add .remember/remember.md docs/superpowers/plans/2026-06-23-prs26001-instrument-record.md
git commit -m "docs: complete PRS26001 record checklist"
```

- [ ] **Step 6: Push the existing review branch**

```bash
git push
```

Expected: `origin/codex/instrument-records` advances to the final PRS26001 checklist commit, preserving the worktree for review changes.
