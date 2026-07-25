# CPC26001 Coupeville Current Instrument Record Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish `/sn/CPC26001` and its one-page printable case card as the canonical customer record for the first production Coupeville Current.

**Architecture:** Reuse the validated instrument MDX collection and shared `/sn/[serial]` routes. Add a generic strict six-position control to the web and print component families, then compose it with shared Harmonic Shaper copy through a thin semantic preset so player language is reusable while `CPC26001` retains its installed network values. Keep amplifier, string, and listening guidance in ordinary MDX so the existing print route omits it.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict mode, MDX, Content Collections, Tailwind CSS, Vitest, Testing Library.

## Global Constraints

- Use serial `CPC26001`: `CPC` = Coupeville Current, `26` = 2026, `001` = first Coupeville Current record.
- Publish the record with `completed: '2026'`, displayed by the existing date system as `Completed 2026`.
- This is a production instrument record, not prototype or development documentation.
- Use the exact Current pickups: GFS Vintage 59 Humbucker neck, GFS Retrotron Hot Nashville middle, and GFS Professional Series Alnico V HOT Humbucker bridge.
- Preserve the exact six player-facing Harmonic Shaper descriptions from the approved specification.
- Treat the six passive networks as installed values; do not publish revision or provisional-value disclaimers.
- Keep amplifier guidance, 9–42 string recommendation, 10–46 maximum, and listening notes off the printable case card.
- Use a clearly non-photographic placeholder asset and alt text until the exact instrument photograph is available.
- Preserve the existing `/sn/[serial]` routes, K7RHY case-card shell, QR destination, and Letter/A4 one-page print geometry.
- Follow repository formatting: four spaces, single quotes, trailing commas, and no unrelated changes.

---

## File Structure

- Create `config/harmonic-shaper.ts`: canonical purpose and six stable player descriptions only; no build-specific networks.
- Create `components/instrument/instrument-position-control.tsx`: generic strict web renderer plus Harmonic Shaper semantic preset.
- Create `components/instrument/instrument-position-control.test.tsx`: web validation, numbering, generic independence, and preset-copy tests.
- Create `components/instrument/instrument-print-position-control.tsx`: compact print equivalents using the same shared copy.
- Create `components/instrument/instrument-print-position-control.test.tsx`: compact six-position and technical-reference tests.
- Modify `components/instrument/instrument-spec.tsx`: permit generic position controls in `ControlLayout` without changing existing selector/pot behavior.
- Modify `components/instrument/instrument-print-spec.tsx`: permit print position controls in the compact control layout.
- Modify `components/instrument/instrument-mdx-components.tsx`: register generic and Harmonic Shaper web/print tags.
- Modify `components/instrument/instrument-mdx-components.test.ts`: verify separate print mappings for the new tags.
- Modify `config/instrument-model-codes.ts`: register `CPC`.
- Modify `lib/instruments/serial.test.ts`: prove `CPC26001` parsing.
- Create `public/images/instruments/CPC26001/placeholder.svg`: deliberately non-photographic placeholder.
- Create `content/instruments/CPC26001.mdx`: published canonical record and web-only owner notes.
- Create `content/instruments/CPC26001.test.ts`: content, publication, exact copy, boundaries, and placeholder assertions.
- Modify `app/sn/instrument-records.css`: compact six-position print styling only if rendered verification shows the existing utilities need reinforcement.
- Modify `app/sn/instrument-records.test.ts`: retain and, if CSS changes, extend the one-page visibility/geometry regression.

---

### Task 1: Register the Coupeville Current serial identity

**Files:**
- Modify: `config/instrument-model-codes.ts`
- Modify: `lib/instruments/serial.test.ts`

**Interfaces:**
- Consumes: `parseInstrumentSerial(input: string): InstrumentSerial`
- Produces: `INSTRUMENT_MODEL_CODES.CPC === 'Coupeville Current'` and valid parsing for `CPC26001`

- [ ] **Step 1: Write the failing serial test**

Add this test to `lib/instruments/serial.test.ts`:

```ts
it('parses the first Coupeville Current production serial', () => {
    expect(parseInstrumentSerial('CPC26001')).toEqual({
        serial: 'CPC26001',
        modelCode: 'CPC',
        modelDescription: 'Coupeville Current',
        year: 2026,
        index: 1,
    });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npx vitest run lib/instruments/serial.test.ts`

Expected: FAIL with `Unknown instrument model code: CPC`.

- [ ] **Step 3: Add the minimal model-code mapping**

Add the following entry to `INSTRUMENT_MODEL_CODES` in `config/instrument-model-codes.ts`:

```ts
CPC: 'Coupeville Current',
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npx vitest run lib/instruments/serial.test.ts`

Expected: all serial tests pass.

- [ ] **Step 5: Commit the serial identity**

```bash
git add config/instrument-model-codes.ts lib/instruments/serial.test.ts
git commit -m "feat: register Coupeville Current serials"
```

---

### Task 2: Add the reusable six-position control system

**Files:**
- Create: `config/harmonic-shaper.ts`
- Create: `components/instrument/instrument-position-control.tsx`
- Create: `components/instrument/instrument-position-control.test.tsx`
- Create: `components/instrument/instrument-print-position-control.tsx`
- Create: `components/instrument/instrument-print-position-control.test.tsx`
- Modify: `components/instrument/instrument-spec.tsx`
- Modify: `components/instrument/instrument-print-spec.tsx`
- Modify: `components/instrument/instrument-mdx-components.tsx`
- Modify: `components/instrument/instrument-mdx-components.test.ts`

**Interfaces:**
- Consumes: React compound-component conventions already used by `Selector`, `SelectorPosition`, `PrintSelector`, and `PrintSelectorPosition`
- Produces:
  - `HARMONIC_SHAPER_PURPOSE: string`
  - `HARMONIC_SHAPER_POSITION_DESCRIPTIONS: readonly [string, string, string, string, string, string]`
  - `PositionControl({ label, purpose, children })`
  - `PositionControlPosition({ description, technicalReference?, index? })`
  - `HarmonicShaper({ children })`, a semantic preset over `PositionControl`
  - print equivalents `PrintPositionControl`, `PrintPositionControlPosition`, and `PrintHarmonicShaper`
  - MDX tags `PositionControl`, `PositionControlPosition`, and `HarmonicShaper` mapped independently for web and print

- [ ] **Step 1: Write failing web tests for the generic contract**

Create `components/instrument/instrument-position-control.test.tsx` with tests that:

```tsx
render(
    <PositionControl label="Six-way contour" purpose="Chooses one of six passive contours.">
        {Array.from({ length: 6 }, (_, index) => (
            <PositionControlPosition key={index} description={`Contour ${index + 1}`} technicalReference={`${index + 1} kΩ`} />
        ))}
    </PositionControl>,
);

expect(screen.getByRole('heading', { name: 'Six-way contour' })).toBeInTheDocument();
expect(screen.getByText('Chooses one of six passive contours.')).toBeInTheDocument();
expect(screen.getByText('Contour 1')).toBeInTheDocument();
expect(screen.getByText('6 kΩ')).toBeInTheDocument();
expect(screen.getAllByRole('listitem')).toHaveLength(6);
```

Add a second test rendering five children and expecting:

```ts
'Six-way contour requires exactly six positions but contains 5'
```

Add a third test placing a `<div />` child and expecting:

```ts
'Six-way contour contains an unsupported child'
```

Add a fourth test rendering `PositionControlPosition` alone and expecting:

```ts
'PositionControlPosition must be rendered inside PositionControl'
```

- [ ] **Step 2: Write a failing test for the semantic Harmonic Shaper preset**

In the same test file, render:

```tsx
<HarmonicShaper>
    <PositionControlPosition description="ignored by preset" technicalReference="Direct connection" />
    <PositionControlPosition description="ignored by preset" technicalReference="47 kΩ series resistor" />
    <PositionControlPosition description="ignored by preset" technicalReference="100 kΩ series resistor" />
    <PositionControlPosition description="ignored by preset" technicalReference="100 kΩ + approximately 330 pF" />
    <PositionControlPosition description="ignored by preset" technicalReference="220 kΩ + approximately 680 pF" />
    <PositionControlPosition description="ignored by preset" technicalReference="Middle pickup disconnected" />
</HarmonicShaper>
```

Assert that the rendered heading is `Harmonic Shaper`, the purpose equals `HARMONIC_SHAPER_PURPOSE`, all six rendered descriptions equal `HARMONIC_SHAPER_POSITION_DESCRIPTIONS`, and no `ignored by preset` text is present. This proves canonical player language is supplied by shared code while technical references remain instrument-specific.

- [ ] **Step 3: Run the web tests and verify RED**

Run: `npx vitest run components/instrument/instrument-position-control.test.tsx`

Expected: FAIL because the module and components do not exist.

- [ ] **Step 4: Create the shared Harmonic Shaper definition**

Create `config/harmonic-shaper.ts`:

```ts
export const HARMONIC_SHAPER_PURPOSE = 'The Harmonic Shaper modifies the character of the currently selected pickup voice. It does not select additional pickups or create separate voices. Instead, it offers six repeatable degrees of passive harmonic shaping, from maximum interaction to no interaction.';

export const HARMONIC_SHAPER_POSITION_DESCRIPTIONS = [
    'Maximum harmonic shaping. The most pronounced interaction with the selected pickup voice.',
    'Strong harmonic shaping. Increases harmonic complexity while preserving the primary character.',
    'Moderate harmonic shaping. A balanced blend of clarity and interaction.',
    'Gentle harmonic shaping. Adds openness with a lighter touch.',
    'Subtle harmonic shaping. A slight enhancement to articulation and dimensionality.',
    'Harmonic shaper bypassed. The selected pickup voice passes unchanged.',
] as const;
```

- [ ] **Step 5: Implement the minimal generic web control and preset**

Create `components/instrument/instrument-position-control.tsx`. Follow the strict child filtering and automatic numbering pattern in `instrument-spec.tsx`.

Use these public props:

```ts
export interface PositionControlPositionProps {
    description: string;
    technicalReference?: string;
    index?: number;
}

export function PositionControl({ label, purpose, children }: { label: string; purpose: string; children: React.ReactNode })
export function PositionControlPosition({ description, technicalReference, index }: PositionControlPositionProps)
export function HarmonicShaper({ children }: { children: React.ReactNode })
```

`PositionControl` must require non-empty `label` and `purpose`, accept only `PositionControlPosition` children, require exactly six, clone them with indices 1–6, and label itself `6-position selector`. `HarmonicShaper` must validate exactly six `PositionControlPosition` children, replace each authored `description` with the matching shared description, preserve each `technicalReference`, and return a `PositionControl` configured with label `Harmonic Shaper` and `HARMONIC_SHAPER_PURPOSE`.

Render technical references in a visually secondary `<p>` only when supplied. Use a two-column grid on medium screens so six readable descriptions do not create an excessively wide six-column layout.

- [ ] **Step 6: Permit the new control inside the web control layout**

Modify `ControlLayout` in `components/instrument/instrument-spec.tsx` to accept `PositionControl` and `HarmonicShaper` alongside `Selector` and `Pot`. Import the two components from `./instrument-position-control`. Update the empty-layout error to:

```ts
'ControlLayout requires at least one supported control'
```

Do not change existing selector or pot rendering/validation.

- [ ] **Step 7: Run the web component tests and verify GREEN**

Run: `npx vitest run components/instrument/instrument-position-control.test.tsx components/instrument/instrument-spec.test.tsx`

Expected: both test files pass.

- [ ] **Step 8: Write failing compact-print tests**

Create `components/instrument/instrument-print-position-control.test.tsx`. Render `PrintHarmonicShaper` with six `PrintPositionControlPosition` children containing the six installed network references. Assert:

- heading `Harmonic Shaper`
- text `6-position selector`
- exactly six list items numbered 1–6
- the exact first and sixth canonical player descriptions
- `Direct connection` and `Middle pickup disconnected`

Add a five-child case expecting:

```ts
'Harmonic Shaper requires exactly six positions but contains 5'
```

- [ ] **Step 9: Run the compact-print tests and verify RED**

Run: `npx vitest run components/instrument/instrument-print-position-control.test.tsx`

Expected: FAIL because the print module does not exist.

- [ ] **Step 10: Implement compact print controls from the shared definition**

Create `components/instrument/instrument-print-position-control.tsx` with the same strict API prefixed by `Print`:

```ts
export interface PrintPositionControlPositionProps {
    description: string;
    technicalReference?: string;
    index?: number;
}

export function PrintPositionControl(...)
export function PrintPositionControlPosition(...)
export function PrintHarmonicShaper(...)
```

Use compact print typography consistent with `instrument-print-spec.tsx`. Render six items as a two-column grid, retain complete player descriptions, and render technical references below them in smaller secondary text. `PrintHarmonicShaper` must source the same canonical purpose and descriptions from `config/harmonic-shaper.ts`.

- [ ] **Step 11: Permit the new control inside the print control layout**

Modify `PrintControlLayout` in `components/instrument/instrument-print-spec.tsx` to accept `PrintPositionControl` and `PrintHarmonicShaper` alongside `PrintSelector` and `PrintPot`. Preserve existing selector/pot behavior.

- [ ] **Step 12: Register all new MDX component mappings test-first**

First extend `components/instrument/instrument-mdx-components.test.ts` with assertions that:

```ts
expect(instrumentMdxComponents.PositionControl).toBe(PositionControl);
expect(instrumentMdxComponents.PositionControlPosition).toBe(PositionControlPosition);
expect(instrumentMdxComponents.HarmonicShaper).toBe(HarmonicShaper);
expect(instrumentPrintMdxComponents.PositionControl).toBe(PrintPositionControl);
expect(instrumentPrintMdxComponents.PositionControlPosition).toBe(PrintPositionControlPosition);
expect(instrumentPrintMdxComponents.HarmonicShaper).toBe(PrintHarmonicShaper);
expect(instrumentPrintMdxComponents.HarmonicShaper).not.toBe(instrumentMdxComponents.HarmonicShaper);
```

Run `npx vitest run components/instrument/instrument-mdx-components.test.ts` and verify it fails for missing mappings. Then add those mappings and imports to `components/instrument/instrument-mdx-components.tsx`.

- [ ] **Step 13: Run all component tests and verify GREEN**

Run: `npx vitest run components/instrument/instrument-position-control.test.tsx components/instrument/instrument-print-position-control.test.tsx components/instrument/instrument-spec.test.tsx components/instrument/instrument-print-spec.test.tsx components/instrument/instrument-mdx-components.test.ts`

Expected: all listed tests pass without warnings.

- [ ] **Step 14: Commit the reusable control system**

```bash
git add config/harmonic-shaper.ts components/instrument/instrument-position-control.tsx components/instrument/instrument-position-control.test.tsx components/instrument/instrument-print-position-control.tsx components/instrument/instrument-print-position-control.test.tsx components/instrument/instrument-spec.tsx components/instrument/instrument-print-spec.tsx components/instrument/instrument-mdx-components.tsx components/instrument/instrument-mdx-components.test.ts
git commit -m "feat: add reusable six-position instrument controls"
```

---

### Task 3: Publish the CPC26001 customer record

**Files:**
- Create: `public/images/instruments/CPC26001/placeholder.svg`
- Create: `content/instruments/CPC26001.mdx`
- Create: `content/instruments/CPC26001.test.ts`

**Interfaces:**
- Consumes: `HarmonicShaper` and `PositionControlPosition` MDX tags; existing instrument frontmatter and route generation
- Produces: published records at `/sn/CPC26001` and `/sn/CPC26001/print`

- [ ] **Step 1: Write the failing record-content tests**

Create `content/instruments/CPC26001.test.ts`. Read `content/instruments/CPC26001.mdx` and assert it contains:

```ts
"publish: true"
"name: 'Coupeville Current'"
"completed: '2026'"
"src: '/images/instruments/CPC26001/placeholder.svg'"
'GFS Vintage 59 Humbucker'
'GFS Retrotron Hot Nashville'
'GFS Professional Series Alnico V HOT Humbucker'
'<Selector label="Pickup selector" positions={3}>'
'voice="Neck"'
'voice="Neck + Bridge"'
'voice="Bridge"'
'A500K Audio'
'22 nF'
'680 pF'
'150 kΩ'
'wired in parallel across the master-volume input and output'
'<HarmonicShaper>'
'Direct connection'
'47 kΩ series resistor'
'100 kΩ series resistor'
'approximately 330 pF capacitor'
'220 kΩ series resistor'
'approximately 680 pF capacitor'
'Middle pickup disconnected'
'9–42'
'10–46'
'## Builder Notes'
```

Assert the lowercased source does not contain `prototype`, `provisional`, `future revision`, `values may change`, or `subject to change`. Assert the source does not repeat the canonical Harmonic Shaper purpose or six player descriptions; those must come from shared code.

Add a filesystem assertion that `public/images/instruments/CPC26001/placeholder.svg` exists and contains the visible phrases `Coupeville Current` and `Image placeholder`.

- [ ] **Step 2: Run the record test and verify RED**

Run: `npx vitest run content/instruments/CPC26001.test.ts`

Expected: FAIL because the record and placeholder do not exist.

- [ ] **Step 3: Create the deliberate placeholder asset**

Create `public/images/instruments/CPC26001/placeholder.svg` as a 1600×1200 neutral slate/sky vector composition. It must visibly include:

```text
K7RHY Resonance Lab
Coupeville Current
CPC26001
Image placeholder
Exact instrument photography will replace this image.
```

Use geometric lines or a restrained pickup/control schematic motif, not a rendered guitar silhouette or stock photograph. Include an SVG `<title>` and `<desc>` identifying it as a placeholder.

- [ ] **Step 4: Author the published MDX record**

Create `content/instruments/CPC26001.mdx` with this frontmatter shape:

```yaml
---
publish: true
name: 'Coupeville Current'
completed: '2026'
origin: 'Designed and built by K7RHY Resonance Lab as the first production Coupeville Current.'
theme: 'A two-humbucker instrument whose six-position passive Harmonic Shaper introduces repeatable degrees of interaction without replacing the familiar pickup selections.'
images:
    - src: '/images/instruments/CPC26001/placeholder.svg'
      alt: 'Placeholder artwork for Coupeville Current CPC26001; exact instrument photography is pending'
related:
    label: 'Explore the Relay Current design reference'
    href: '/relay/voicings/current'
---
```

Inside `<InstrumentSpec>`, author three pickups in neck/middle/bridge order using the exact model strings. Put `Harmonic Shaper pickup; not an independent selector voice` in a middle-pickup detail.

Inside `<ControlLayout>`:

- author the three selector positions in Neck / Neck + Bridge / Bridge order with concise functional descriptions
- author standard Master Volume and Master Tone pots, each with one `normal` position
- include `A500K Audio` in each pot description
- include the 22 nF tone capacitor in the tone description
- include the complete parallel 680 pF/150 kΩ treble-bleed wiring statement in the volume description
- add `<HarmonicShaper>` with exactly six `<PositionControlPosition description="Installed network" technicalReference="..." />` children; the authored placeholder description is intentionally replaced by the shared semantic preset

After `</InstrumentSpec>`, write restrained sections titled `## Design intent`, `## Passive interaction`, `## Installed electrical reference`, and `## Builder Notes`. Explain musical purpose before electronics and avoid prescribing what the player must hear.

Under Builder Notes, include:

- `Strings`: 9–42 recommended; 10–46 maximum recommended weight
- `Amplifier pairing`: recommend beginning with an amplifier that preserves pick attack and has enough clean headroom to compare shaping positions, then adjust gain/EQ to the player's context; do not name a commercial amplifier model
- `Listening notes`: state that the final as-delivered setup notes belong here once the physical instrument is evaluated; do not mention circuit revisions or uncertain component values

- [ ] **Step 5: Run the content test and verify GREEN**

Run: `npx vitest run content/instruments/CPC26001.test.ts`

Expected: the content-boundary test passes.

- [ ] **Step 6: Verify collection validation and route discovery**

Run: `npx vitest run lib/instruments components/instrument content/instruments/CPC26001.test.ts`

Expected: the Content Collections transform resolves the existing records plus `CPC26001`, the placeholder passes existence validation, and all instrument tests pass.

- [ ] **Step 7: Commit the customer record**

```bash
git add public/images/instruments/CPC26001/placeholder.svg content/instruments/CPC26001.mdx content/instruments/CPC26001.test.ts
git commit -m "content: publish Coupeville Current record"
```

---

### Task 4: Verify the printable case card and complete production validation

**Files:**
- Modify if required by rendered evidence: `app/sn/instrument-records.css`
- Modify if CSS changes: `app/sn/instrument-records.test.ts`
- Modify if compact markup needs adjustment: `components/instrument/instrument-print-position-control.tsx`
- Modify if compact markup changes: `components/instrument/instrument-print-position-control.test.tsx`

**Interfaces:**
- Consumes: `/sn/CPC26001/print`, existing `.instrument-case-card` geometry, and compact position-control markup
- Produces: a readable one-page Letter/A4 quick-reference card

- [ ] **Step 1: Format only the changed implementation files**

Run:

```bash
npx prettier --write config/harmonic-shaper.ts config/instrument-model-codes.ts lib/instruments/serial.test.ts components/instrument/instrument-position-control.tsx components/instrument/instrument-position-control.test.tsx components/instrument/instrument-print-position-control.tsx components/instrument/instrument-print-position-control.test.tsx components/instrument/instrument-spec.tsx components/instrument/instrument-print-spec.tsx components/instrument/instrument-mdx-components.tsx components/instrument/instrument-mdx-components.test.ts content/instruments/CPC26001.mdx content/instruments/CPC26001.test.ts public/images/instruments/CPC26001/placeholder.svg
```

Expected: Prettier completes without errors and does not touch unrelated files.

- [ ] **Step 2: Run linting**

Run: `npm run lint`

Expected: exit 0 with no ESLint errors.

- [ ] **Step 3: Run the complete test suite**

Run: `npx vitest run`

Expected: all test files pass with zero failures.

- [ ] **Step 4: Run the production build/type validation**

Run: `npm run build`

Expected: Vitest passes, Content Collections validates `CPC26001`, Next.js compiles with no TypeScript errors, both dynamic instrument routes build, and sitemap generation exits 0.

- [ ] **Step 5: Start the development server for rendered review**

Run: `npm run dev`

Expected: server starts on an available local port. Record the actual port from the output.

- [ ] **Step 6: Review the web record**

Open `/sn/CPC26001` at the actual local port and verify:

- published route resolves without redirect or 404
- hero shows `CPC26001`, `Coupeville Current`, and `Completed 2026`
- placeholder is unmistakably labeled and not presented as a finished-instrument photo
- musical design intent precedes electrical details
- pickup selector and Harmonic Shaper are visually distinct controls
- all six positions are numbered and readable
- Builder Notes show 9–42 recommended and 10–46 maximum
- standard navigation, dark mode, desktop, and mobile layouts remain intact

- [ ] **Step 7: Review and print the case card**

Open `/sn/CPC26001/print` and verify:

- the case card contains identity, completion year, pickups, three-way selector, master controls, Harmonic Shaper purpose, and all six exact player descriptions
- Builder Notes, amplifier pairing, string recommendations, listening notes, and placeholder artwork are absent
- the QR destination is `https://k7rhy.app/sn/CPC26001`
- Letter portrait at 100% produces one page with no clipping
- A4 portrait at 100% produces one page with no clipping

- [ ] **Step 8: If and only if rendered print evidence fails, add a regression test before CSS/markup changes**

Add a focused assertion to `app/sn/instrument-records.test.ts` or `components/instrument/instrument-print-position-control.test.tsx` that reproduces the specific clipping/visibility issue. Run that focused test and observe the expected failure. Then make the smallest CSS or compact-markup adjustment, rerun the focused test, and repeat the Letter/A4 rendered review.

- [ ] **Step 9: Run final fresh verification after any rendered adjustment**

Run:

```bash
git diff --check
npm run lint
npx vitest run
npm run build
```

Expected: every command exits 0; tests report zero failures; build and sitemap generation complete.

- [ ] **Step 10: Commit final print adjustments, if any**

If Task 4 changed tracked files:

```bash
git add app/sn/instrument-records.css app/sn/instrument-records.test.ts components/instrument/instrument-print-position-control.tsx components/instrument/instrument-print-position-control.test.tsx
git commit -m "fix: keep Coupeville case card print safe"
```

If rendered verification required no adjustment, do not create an empty commit.

- [ ] **Step 11: Record final scope and evidence**

Run:

```bash
git status --short
git log --oneline --max-count=6
git diff HEAD~3..HEAD --stat
```

Report the files changed, serial `CPC26001`, assumptions (published before exact photography; year-only completion; non-photographic placeholder), fresh test/lint/build results, rendered Letter/A4 outcome, and any unresolved issue. The expected unresolved issue is replacement of the placeholder with exact-instrument photography before sale.
