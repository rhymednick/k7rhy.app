# Serialized Instrument Records Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish validated, serial-numbered instrument pages and one-page printable case cards from strict MDX documents.

**Architecture:** A new Content Collections collection validates document-level instrument metadata and derives the serial from each filename. Strict compound React components validate and render pickup/control structures from MDX; the canonical web route and print route render that same MDX source in site-aligned presentations. QR codes, Discord support, model descriptions, and canonical URLs are derived centrally so records cannot drift.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict mode, MDX via `next-mdx-remote/rsc`, Content Collections + Zod, Tailwind CSS, CSS print media, Vitest + Testing Library, `qrcode.react`.

## Global Constraints

- Canonical serial format is exactly `MMMYYNNN`: three uppercase letters, two decimal year digits, and three decimal index digits.
- Public routes are only `/sn/[serial]` and `/sn/[serial]/print`; lowercase serials redirect to uppercase.
- Instrument documents live at `content/instruments/<SERIAL>.mdx`; serial is derived from the filename and never duplicated in frontmatter.
- Records are public and indexable but are not added to a registry or navigation listing.
- `publish: false` records return 404 in production.
- No owner names, transfer history, database, web editor, service-management system, or generated PDF pipeline.
- Web records retain the standard site header, navigation, dark mode, and footer.
- Web pages require a photograph of the exact instrument; print cards contain no instrument photograph.
- Case cards target one portrait US Letter page and scale safely to one portrait A4 page.
- The case-card masthead uses `public/images/k7rhy_logo.png` and the full text `K7RHY Resonance Lab`.
- Case cards prioritize voices and control access; provenance is communicated through maker, serial, year, components, and permanent URL without an authenticity claim.
- Selector numbering is inferred from child order; authors never enter selector position numbers.
- Push-pull and push-push pots explicitly author `down` and `up`; standard pots author `normal`.
- Discord always comes from `config/site.ts`; QR codes always encode `https://k7rhy.app/sn/<SERIAL>`.
- Follow repository formatting: 4-space indentation, single quotes, trailing commas where supported, and no manual print-width wrapping.

---

## File Structure

- `config/instrument-model-codes.ts` — editable code-to-description table only.
- `types/instrument.ts` — frontmatter, generated record, serial, image, and related-link contracts.
- `lib/instruments/serial.ts` — parse, normalize, validate, and construct canonical serial URLs.
- `lib/instruments/validation.ts` — pure document validation used safely by the collection transform.
- `lib/instruments/records.ts` — look up generated instrument records without entering the collection-config dependency graph.
- `content-collections.ts` — add the `instruments` collection and expose derived serial/model data.
- `content/instruments/RLY26001.mdx` — complete unpublished example/template record.
- `content/instruments/README.md` — concise authoring and publication checklist.
- `components/instrument/instrument-spec.tsx` — strict compound MDX components and runtime child validation.
- `components/instrument/instrument-mdx-components.tsx` — instrument MDX component registration.
- `components/instrument/instrument-record-page.tsx` — web presentation around rendered MDX.
- `components/instrument/instrument-case-card.tsx` — printable identity/card presentation and QR code.
- `components/instrument/print-case-card-controls.tsx` — client-only print invocation and fallback button.
- `app/sn/[serial]/page.tsx` — canonical public record route and metadata.
- `app/sn/[serial]/print/page.tsx` — dedicated card route.
- `app/sn/instrument-records.css` — screen and print layout, `@page`, Letter/A4 safeguards, and monochrome rules.
- Focused colocated `*.test.ts(x)` files — pure validation and rendering tests.

---

### Task 1: Serial Numbers and Editable Model-Code Registry

**Files:**
- Create: `config/instrument-model-codes.ts`
- Create: `types/instrument.ts`
- Create: `lib/instruments/serial.ts`
- Test: `lib/instruments/serial.test.ts`

**Interfaces:**
- Produces: `INSTRUMENT_MODEL_CODES: Record<string, string>`
- Produces: `parseInstrumentSerial(input: string): InstrumentSerial`
- Produces: `normalizeInstrumentSerial(input: string): string`
- Produces: `instrumentPath(serial: string): string`
- Produces: `instrumentUrl(serial: string): string`

- [ ] **Step 1: Write failing serial tests**

```ts
import { describe, expect, it } from 'vitest';
import { instrumentPath, instrumentUrl, normalizeInstrumentSerial, parseInstrumentSerial } from './serial';

describe('instrument serials', () => {
    it('parses a known MMMYYNNN serial', () => {
        expect(parseInstrumentSerial('RLY26001')).toEqual({
            serial: 'RLY26001',
            modelCode: 'RLY',
            modelDescription: 'Relay',
            year: 2026,
            index: 1,
        });
    });

    it('normalizes lowercase input before routing', () => {
        expect(normalizeInstrumentSerial('rly26001')).toBe('RLY26001');
    });

    it.each(['RLY-26001', 'RLY2601', 'R1Y26001', 'RLY26ABC'])('rejects malformed serial %s', (serial) => {
        expect(() => parseInstrumentSerial(serial)).toThrow(`Invalid instrument serial: ${serial}`);
    });

    it('rejects an unknown model code', () => {
        expect(() => parseInstrumentSerial('ZZZ26001')).toThrow('Unknown instrument model code: ZZZ');
    });

    it('builds canonical paths and production URLs', () => {
        expect(instrumentPath('rly26001')).toBe('/sn/RLY26001');
        expect(instrumentUrl('RLY26001')).toBe('https://k7rhy.app/sn/RLY26001');
    });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npx vitest run lib/instruments/serial.test.ts`

Expected: FAIL because `./serial` does not exist.

- [ ] **Step 3: Add the editable registry and shared types**

```ts
// config/instrument-model-codes.ts
export const INSTRUMENT_MODEL_CODES: Readonly<Record<string, string>> = {
    RLY: 'Relay',
    FND: 'Fender',
    GIB: 'Gibson',
    PRS: 'PRS',
    TEL: 'Telecaster-style',
    STR: 'Stratocaster-style',
    LES: 'Les Paul-style',
};
```

```ts
// types/instrument.ts
export interface InstrumentSerial {
    serial: string;
    modelCode: string;
    modelDescription: string;
    year: number;
    index: number;
}

export interface InstrumentImage {
    src: string;
    alt: string;
}

export interface InstrumentRelatedLink {
    label: string;
    href: string;
}

export interface InstrumentFrontmatter {
    publish: boolean;
    name: string;
    completed: string;
    origin: string;
    theme: string;
    images: InstrumentImage[];
    related?: InstrumentRelatedLink;
    content: string;
}

export interface InstrumentRecord extends InstrumentFrontmatter, InstrumentSerial {}
```

- [ ] **Step 4: Implement serial parsing and URL construction**

```ts
// lib/instruments/serial.ts
import { INSTRUMENT_MODEL_CODES } from '@/config/instrument-model-codes';
import type { InstrumentSerial } from '@/types/instrument';

const SERIAL_PATTERN = /^([A-Z]{3})(\d{2})(\d{3})$/;

export function normalizeInstrumentSerial(input: string): string {
    return input.trim().toUpperCase();
}

export function parseInstrumentSerial(input: string): InstrumentSerial {
    const serial = normalizeInstrumentSerial(input);
    const match = SERIAL_PATTERN.exec(serial);

    if (!match) {
        throw new Error(`Invalid instrument serial: ${input}`);
    }

    const [, modelCode, yearPart, indexPart] = match;
    const modelDescription = INSTRUMENT_MODEL_CODES[modelCode];

    if (!modelDescription) {
        throw new Error(`Unknown instrument model code: ${modelCode}`);
    }

    return {
        serial,
        modelCode,
        modelDescription,
        year: 2000 + Number(yearPart),
        index: Number(indexPart),
    };
}

export function instrumentPath(serial: string): string {
    return `/sn/${parseInstrumentSerial(serial).serial}`;
}

export function instrumentUrl(serial: string): string {
    return `https://k7rhy.app${instrumentPath(serial)}`;
}
```

- [ ] **Step 5: Run focused tests**

Run: `npx vitest run lib/instruments/serial.test.ts`

Expected: PASS, 8 tests.

- [ ] **Step 6: Commit the serial foundation**

```bash
git add config/instrument-model-codes.ts types/instrument.ts lib/instruments/serial.ts lib/instruments/serial.test.ts
git commit -m "feat(instruments): add serial number model"
```

---

### Task 2: Validated Instrument Content Collection

**Files:**
- Create: `lib/instruments/validation.ts`
- Test: `lib/instruments/validation.test.ts`
- Create: `lib/instruments/records.ts`
- Modify: `content-collections.ts`
- Create: `content/instruments/RLY26001.mdx`
- Create: `content/instruments/README.md`

**Interfaces:**
- Consumes: `parseInstrumentSerial()` and `InstrumentFrontmatter` from Task 1.
- Produces: `validateInstrumentDocument(path: string, data: InstrumentFrontmatter): InstrumentRecord` from a pure module with no generated-content import.
- Produces: generated `allInstruments` and `Instrument` type from `content-collections`.
- Produces: `getInstrument(serial: string)` and `getInstrumentStaticParams()`.

- [ ] **Step 1: Write failing document-validation tests**

```ts
import { describe, expect, it } from 'vitest';
import type { InstrumentFrontmatter } from '@/types/instrument';
import { validateInstrumentDocument } from './validation';

const valid: InstrumentFrontmatter = {
    publish: false,
    name: 'Relay Lipstick',
    completed: '2026-06-19',
    origin: 'Designed, built, and voiced by K7RHY Resonance Lab.',
    theme: 'Articulate and touch-sensitive.',
    images: [{ src: '/images/products/guitars/rainbow-tele/front.jpeg', alt: 'RLY26001 front view' }],
    related: { label: 'Explore Relay Guitar', href: '/relay' },
    content: '<InstrumentSpec />',
};

describe('validateInstrumentDocument', () => {
    it('derives serial data from the MDX path', () => {
        expect(validateInstrumentDocument('RLY26001', valid)).toMatchObject({ serial: 'RLY26001', modelDescription: 'Relay' });
    });

    it('requires at least one exact-instrument image', () => {
        expect(() => validateInstrumentDocument('RLY26001', { ...valid, images: [] })).toThrow('RLY26001 requires at least one instrument image');
    });

    it('requires a local absolute image path and useful alt text', () => {
        expect(() => validateInstrumentDocument('RLY26001', { ...valid, images: [{ src: 'front.jpg', alt: '' }] })).toThrow('RLY26001 has an invalid instrument image');
    });

    it('rejects an image path that does not exist under public', () => {
        expect(() => validateInstrumentDocument('RLY26001', { ...valid, images: [{ src: '/images/instruments/missing.jpg', alt: 'Missing image' }] })).toThrow('RLY26001 image does not exist: /images/instruments/missing.jpg');
    });

    it('requires the serial year to match the completion date', () => {
        expect(() => validateInstrumentDocument('RLY26001', { ...valid, completed: '2025-12-31' })).toThrow('RLY26001 year does not match completion date 2025-12-31');
    });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npx vitest run lib/instruments/validation.test.ts`

Expected: FAIL because `validation.ts` does not exist.

- [ ] **Step 3: Implement pure document validation**

```ts
// lib/instruments/validation.ts
import { existsSync } from 'fs';
import { join } from 'path';
import type { InstrumentFrontmatter, InstrumentRecord } from '@/types/instrument';
import { parseInstrumentSerial } from './serial';

export function validateInstrumentDocument(path: string, data: InstrumentFrontmatter): InstrumentRecord {
    const serialData = parseInstrumentSerial(path);

    if (data.images.length === 0) {
        throw new Error(`${serialData.serial} requires at least one instrument image`);
    }

    const completedYear = Number(data.completed.slice(0, 4));
    if (completedYear !== serialData.year) {
        throw new Error(`${serialData.serial} year does not match completion date ${data.completed}`);
    }

    for (const image of data.images) {
        if (!image.src.startsWith('/') || image.alt.trim().length === 0) {
            throw new Error(`${serialData.serial} has an invalid instrument image`);
        }
        const absolutePath = join(process.cwd(), 'public', image.src.replace(/^\//, ''));
        if (!existsSync(absolutePath)) {
            throw new Error(`${serialData.serial} image does not exist: ${image.src}`);
        }
    }

    return { ...data, ...serialData };
}
```

- [ ] **Step 4: Add the instrument schema and transform to Content Collections**

Add these definitions after `blogSchema` in `content-collections.ts`:

```ts
const instrumentSchema = z.object({
    publish: z.boolean().optional().default(false),
    name: z.string().min(1),
    completed: z.string().date('Invalid completion date.'),
    origin: z.string().min(1),
    theme: z.string().min(1),
    images: z.array(
        z.object({
            src: z.string().min(1),
            alt: z.string().min(1),
        }),
    ),
    related: z
        .object({
            label: z.string().min(1),
            href: z.string().startsWith('/'),
        })
        .optional(),
    content: z.string(),
});
```

Add the import and collection:

```ts
import { validateInstrumentDocument } from './lib/instruments/validation';

const instruments = defineCollection({
    name: 'instruments',
    directory: 'content/instruments',
    include: '**/*.mdx',
    schema: instrumentSchema,
    transform: async (data) => validateInstrumentDocument(data._meta.path, data),
});
```

Change the final config to:

```ts
export default defineConfig({
    collections: [blog, instruments],
});
```

- [ ] **Step 5: Add generated-record lookup outside the collection dependency graph**

```ts
// lib/instruments/records.ts
import { allInstruments } from 'content-collections';
import type { InstrumentRecord } from '@/types/instrument';
import { normalizeInstrumentSerial } from './serial';

export function getInstrument(serial: string): InstrumentRecord | undefined {
    const normalized = normalizeInstrumentSerial(serial);
    return allInstruments.find((instrument) => instrument.serial === normalized) as InstrumentRecord | undefined;
}

export function getInstrumentStaticParams(): Array<{ serial: string }> {
    return allInstruments.map((instrument) => ({ serial: instrument.serial }));
}

export function isInstrumentPublished(record: InstrumentRecord): boolean {
    return process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production' || record.publish;
}
```

- [ ] **Step 6: Add a complete unpublished MDX fixture/template**

Create `content/instruments/RLY26001.mdx`:

```mdx
---
publish: false
name: 'Relay Lipstick'
completed: '2026-06-19'
origin: 'Designed, built, and voiced by K7RHY Resonance Lab.'
theme: 'An articulate, touch-sensitive instrument with a familiar core and one carefully shaped alternate identity.'
images:
    - src: '/images/products/guitars/rainbow-tele/front.jpeg'
      alt: 'Example instrument photograph used while developing the serialized record template'
related:
    label: 'Explore the Relay Guitar family'
    href: '/relay'
---

<InstrumentSpec>
    <PickupConfiguration>
        <Pickup position="bridge" type="humbucker" brand="GFS" model="VEH">
            <PickupDetail label="Magnet">Alnico V</PickupDetail>
        </Pickup>
        <Pickup position="middle" type="lipstick" brand="GFS" model="Pro-Tube" />
        <Pickup position="neck" type="humbucker" brand="GFS" model="Professional Alnico II" />
    </PickupConfiguration>

    <ControlLayout>
        <Selector label="Pickup selector" positions={3}>
            <SelectorPosition voice="Bridge">Authority and attack</SelectorPosition>
            <SelectorPosition voice="Bridge + Neck">Width and balance</SelectorPosition>
            <SelectorPosition voice="Neck">Warmth and detail</SelectorPosition>
        </Selector>
        <Pot label="Master volume" mechanism="push-pull">
            <PotPosition position="down" voice="Core voice">Controls overall output.</PotPosition>
            <PotPosition position="up" voice="Lipstick Voice">Adds the middle lipstick and reshapes the bridge response.</PotPosition>
        </Pot>
        <Pot label="Master tone" mechanism="push-push">
            <PotPosition position="down" voice="Open contour">Standard treble rolloff.</PotPosition>
            <PotPosition position="up" voice="Focused contour">Tightens and focuses the response.</PotPosition>
        </Pot>
    </ControlLayout>
</InstrumentSpec>

## This instrument

This unpublished example establishes the authoring shape for future serialized instruments. Replace the photograph and copy before using it as a real owner record.
```

- [ ] **Step 7: Add the authoring checklist**

```md
# Serialized instrument authoring

1. Add or edit the three-letter description in `config/instrument-model-codes.ts`.
2. Copy `RLY26001.mdx` to the new uppercase `MMMYYNNN.mdx` filename.
3. Keep `publish: false` while replacing every identity field, image, pickup, selector, and pot state.
4. Put exact-instrument photographs under `public/images/instruments/<SERIAL>/` and give each useful alt text.
5. Run `npx content-collections build` and `npx vitest run`.
6. Preview `/sn/<SERIAL>` in light, dark, desktop, and mobile layouts.
7. Preview `/sn/<SERIAL>/print` on Letter and A4 and scan its QR code.
8. Set `publish: true`, rerun `npm run build`, and deploy.

Selector children are numbered from their order. Three-way selectors require three children; five-way selectors require five. Standard pots require one `normal` position. Push-pull and push-push pots require one `down` and one `up` position.
```

- [ ] **Step 8: Generate content and run validation tests**

Run: `npx content-collections build && npx vitest run lib/instruments/validation.test.ts lib/instruments/serial.test.ts`

Expected: generated declarations include `Instrument` and `allInstruments`; all focused tests PASS.

- [ ] **Step 9: Commit the content pipeline**

```bash
git add content-collections.ts content/instruments/RLY26001.mdx content/instruments/README.md lib/instruments/validation.ts lib/instruments/validation.test.ts lib/instruments/records.ts
git commit -m "feat(instruments): add validated MDX records"
```

---

### Task 3: Strict Compound MDX Components

**Files:**
- Create: `components/instrument/instrument-spec.tsx`
- Test: `components/instrument/instrument-spec.test.tsx`
- Create: `components/instrument/instrument-mdx-components.tsx`
- Modify: `components/mdx-components.tsx`

**Interfaces:**
- Produces: `InstrumentSpec`, `PickupConfiguration`, `Pickup`, `PickupDetail`, `ControlLayout`, `Selector`, `SelectorPosition`, `Pot`, and `PotPosition`.
- Produces: `instrumentMdxComponents`, the mapping used by both routes.
- Contract: invalid children throw serial-independent structural messages; route/build output provides the affected MDX path.

- [ ] **Step 1: Write failing structural tests**

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { ControlLayout, InstrumentSpec, Pickup, PickupConfiguration, Pot, PotPosition, Selector, SelectorPosition } from './instrument-spec';

const pickups = (
    <PickupConfiguration>
        <Pickup position="bridge" type="humbucker" brand="GFS" model="VEH" />
    </PickupConfiguration>
);

describe('instrument MDX components', () => {
    it('numbers selector children from their sequence', () => {
        render(
            <Selector label="Pickup selector" positions={3}>
                <SelectorPosition voice="Bridge">Attack</SelectorPosition>
                <SelectorPosition voice="Both">Balance</SelectorPosition>
                <SelectorPosition voice="Neck">Warmth</SelectorPosition>
            </Selector>,
        );
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('rejects a selector whose child count does not match', () => {
        expect(() =>
            render(
                <Selector label="Pickup selector" positions={3}>
                    <SelectorPosition voice="Bridge">Attack</SelectorPosition>
                    <SelectorPosition voice="Neck">Warmth</SelectorPosition>
                </Selector>,
            ),
        ).toThrow('Pickup selector declares 3 positions but contains 2');
    });

    it('rejects switched pots without down and up states', () => {
        expect(() =>
            render(
                <Pot label="Volume" mechanism="push-pull">
                    <PotPosition position="down" voice="Core">Output</PotPosition>
                </Pot>,
            ),
        ).toThrow('Volume push-pull requires exactly one down and one up position');
    });

    it('rejects a spec missing a control layout', () => {
        expect(() => render(<InstrumentSpec>{pickups}</InstrumentSpec>)).toThrow('InstrumentSpec requires exactly one PickupConfiguration and one ControlLayout');
    });

    it('renders valid pickup, selector, and push-push content', () => {
        render(
            <InstrumentSpec>
                {pickups}
                <ControlLayout>
                    <Selector label="Selector" positions={3}>
                        <SelectorPosition voice="Bridge">Attack</SelectorPosition>
                        <SelectorPosition voice="Both">Balance</SelectorPosition>
                        <SelectorPosition voice="Neck">Warmth</SelectorPosition>
                    </Selector>
                    <Pot label="Tone" mechanism="push-push">
                        <PotPosition position="down" voice="Open">Standard rolloff</PotPosition>
                        <PotPosition position="up" voice="Focused">Tighter response</PotPosition>
                    </Pot>
                </ControlLayout>
            </InstrumentSpec>,
        );
        expect(screen.getByText('GFS VEH')).toBeInTheDocument();
        expect(screen.getByText('Focused')).toBeInTheDocument();
    });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npx vitest run components/instrument/instrument-spec.test.tsx`

Expected: FAIL because `instrument-spec.tsx` does not exist.

- [ ] **Step 3: Implement strict child collection and component contracts**

Implement `components/instrument/instrument-spec.tsx` with these exact public prop types:

```tsx
import React from 'react';

type SelectorCount = 3 | 5;
type PotMechanism = 'standard' | 'push-pull' | 'push-push';
type PotState = 'normal' | 'down' | 'up';

export interface SelectorPositionProps {
    voice: string;
    children: React.ReactNode;
    index?: number;
}

export interface PotPositionProps {
    position: PotState;
    voice: string;
    children: React.ReactNode;
}

function elementChildren<P>(children: React.ReactNode, type: React.ComponentType<P>, parent: string): React.ReactElement<P>[] {
    const result: React.ReactElement<P>[] = [];
    React.Children.forEach(children, (child) => {
        if (child === null || child === undefined || (typeof child === 'string' && child.trim() === '')) return;
        if (!React.isValidElement<P>(child) || child.type !== type) {
            throw new Error(`${parent} contains an unsupported child`);
        }
        result.push(child);
    });
    return result;
}
```

Use `elementChildren` in every compound parent. The implementation must enforce:

```tsx
// Selector
const items = elementChildren(children, SelectorPosition, label);
if (items.length !== positions) throw new Error(`${label} declares ${positions} positions but contains ${items.length}`);
return <ol>{items.map((item, index) => React.cloneElement(item, { index: index + 1 }))}</ol>;

// Pot
const items = elementChildren(children, PotPosition, label);
const states = items.map((item) => item.props.position);
const valid = mechanism === 'standard' ? states.length === 1 && states[0] === 'normal' : states.length === 2 && states.filter((state) => state === 'down').length === 1 && states.filter((state) => state === 'up').length === 1;
if (!valid) throw new Error(mechanism === 'standard' ? `${label} standard requires exactly one normal position` : `${label} ${mechanism} requires exactly one down and one up position`);

// InstrumentSpec
export function InstrumentSpec({ children }: { children: React.ReactNode }) {
    const pickups: React.ReactElement[] = [];
    const controls: React.ReactElement[] = [];

    React.Children.forEach(children, (child) => {
        if (child === null || child === undefined || (typeof child === 'string' && child.trim() === '')) return;
        if (!React.isValidElement(child)) throw new Error('InstrumentSpec contains an unsupported child');
        if (child.type === PickupConfiguration) pickups.push(child);
        else if (child.type === ControlLayout) controls.push(child);
        else throw new Error('InstrumentSpec contains an unsupported child');
    });

    if (pickups.length !== 1 || controls.length !== 1) {
        throw new Error('InstrumentSpec requires exactly one PickupConfiguration and one ControlLayout');
    }

    return (
        <section data-instrument-spec className="space-y-6">
            {controls[0]}
            {pickups[0]}
        </section>
    );
}
```

For `PickupConfiguration` and `ControlLayout`, call `elementChildren` with their single allowed child type and throw when their arrays are empty. `Pickup` concatenates `brand` and `model` in its heading and renders optional `PickupDetail` children in a `<dl>`. `SelectorPosition` renders its cloned `index` in a circular monospace marker plus `voice` and body copy. `PotPosition` renders its explicit state, voice, and body copy. Use semantic headings, ordered/unordered lists, and definition groups with `data-instrument-spec`, `data-control-layout`, and `data-pickup-configuration` attributes. Use Tailwind classes based on the approved slate/sky site language. Set `displayName` on every exported component for MDX/debug error clarity.

- [ ] **Step 4: Register components for instrument MDX**

```tsx
// components/instrument/instrument-mdx-components.tsx
import baseComponents from '@/components/mdx-components';
import { ControlLayout, InstrumentSpec, Pickup, PickupConfiguration, PickupDetail, Pot, PotPosition, Selector, SelectorPosition } from './instrument-spec';

export const instrumentMdxComponents = {
    ...baseComponents,
    InstrumentSpec,
    PickupConfiguration,
    Pickup,
    PickupDetail,
    ControlLayout,
    Selector,
    SelectorPosition,
    Pot,
    PotPosition,
};
```

Also add the same named imports and mappings to `components/mdx-components.tsx` so instrument snippets remain recognized anywhere the shared MDX renderer is used.

- [ ] **Step 5: Run focused component tests**

Run: `npx vitest run components/instrument/instrument-spec.test.tsx`

Expected: PASS, 5 tests.

- [ ] **Step 6: Commit the strict MDX component system**

```bash
git add components/instrument/instrument-spec.tsx components/instrument/instrument-spec.test.tsx components/instrument/instrument-mdx-components.tsx components/mdx-components.tsx
git commit -m "feat(instruments): add strict MDX control model"
```

---

### Task 4: Public Instrument Record Page

**Files:**
- Create: `components/instrument/instrument-record-page.tsx`
- Test: `components/instrument/instrument-record-page.test.tsx`
- Create: `app/sn/[serial]/page.tsx`

**Interfaces:**
- Consumes: `InstrumentRecord`, `getInstrument()`, `getInstrumentStaticParams()`, `isInstrumentPublished()`, and `instrumentMdxComponents`.
- Produces: the indexable canonical page at `/sn/[serial]`.
- Produces: metadata title `${name} · ${serial} | K7RHY` and canonical URL.

- [ ] **Step 1: Write failing presentation tests**

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { InstrumentRecordPage } from './instrument-record-page';
import type { InstrumentRecord } from '@/types/instrument';

vi.mock('next/image', () => ({ default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} /> }));

const record: InstrumentRecord = {
    serial: 'RLY26001', modelCode: 'RLY', modelDescription: 'Relay', year: 2026, index: 1,
    publish: true, name: 'Relay Lipstick', completed: '2026-06-19',
    origin: 'Designed, built, and voiced by K7RHY Resonance Lab.', theme: 'Articulate and touch-sensitive.',
    images: [{ src: '/images/instruments/RLY26001/front.jpg', alt: 'RLY26001 front view' }],
    related: { label: 'Explore the Relay Guitar family', href: '/relay' }, content: '',
};

describe('InstrumentRecordPage', () => {
    it('leads with identity, photograph, theme, and print action', () => {
        render(<InstrumentRecordPage record={record}><div>Structured specification</div></InstrumentRecordPage>);
        expect(screen.getByRole('heading', { level: 1, name: 'Relay Lipstick' })).toBeInTheDocument();
        expect(screen.getByText('RLY26001')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'RLY26001 front view' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /print case card/i })).toHaveAttribute('href', '/sn/RLY26001/print');
    });

    it('renders the optional discovery link without replacing site navigation', () => {
        render(<InstrumentRecordPage record={record}><div>Structured specification</div></InstrumentRecordPage>);
        expect(screen.getByRole('link', { name: 'Explore the Relay Guitar family' })).toHaveAttribute('href', '/relay');
    });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npx vitest run components/instrument/instrument-record-page.test.tsx`

Expected: FAIL because `InstrumentRecordPage` does not exist.

- [ ] **Step 3: Implement the site-aligned record presentation**

`InstrumentRecordPage` must:

```tsx
export interface InstrumentRecordPageProps {
    record: InstrumentRecord;
    children: React.ReactNode;
}

export function InstrumentRecordPage({ record, children }: InstrumentRecordPageProps) {
    const primaryImage = record.images[0];
    return (
        <main className="container mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-8 md:py-12">
            <section className="grid overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-sky-50 via-white to-emerald-50 shadow-lg dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-5 p-7 md:p-10">
                    <span className="inline-flex rounded-full border bg-background/80 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Individual instrument</span>
                    <div className="font-mono text-sm tracking-[0.14em] text-sky-700 dark:text-sky-300">{record.serial}</div>
                    <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{record.name}</h1>
                    <p className="max-w-2xl text-lg text-muted-foreground">{record.theme}</p>
                    <dl className="grid gap-4 border-t pt-5 text-sm sm:grid-cols-2">
                        <div><dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Origin</dt><dd className="mt-1">{record.origin}</dd></div>
                        <div><dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Completed</dt><dd className="mt-1">{record.completed}</dd></div>
                    </dl>
                    <Link href={`/sn/${record.serial}/print`} className="inline-flex rounded-lg border bg-background px-4 py-2 text-sm font-semibold shadow-sm">Print case card</Link>
                </div>
                <div className="relative min-h-80 bg-slate-100 dark:bg-slate-900">
                    <Image src={primaryImage.src} alt={primaryImage.alt} fill priority className="object-cover" sizes="(min-width: 1024px) 40vw, 100vw" />
                </div>
            </section>
            <article className="space-y-8">{children}</article>
            {record.related && (
                <aside className="flex flex-col gap-4 rounded-2xl border border-sky-200 bg-sky-50 p-6 dark:border-sky-900 dark:bg-sky-950/30 sm:flex-row sm:items-center sm:justify-between">
                    <div><h2 className="font-semibold">Continue exploring</h2><p className="text-sm text-muted-foreground">See how this instrument fits into the wider K7RHY work.</p></div>
                    <Link href={record.related.href} className="font-semibold text-sky-800 hover:underline dark:text-sky-300">{record.related.label}</Link>
                </aside>
            )}
        </main>
    );
}
```

Import `Image` from `next/image`, `Link` from `next/link`, React, and the `InstrumentRecord` type. Do not add a custom header or footer; `app/layout.tsx` already supplies the standard site frame.

- [ ] **Step 4: Implement the canonical route**

```tsx
// app/sn/[serial]/page.tsx
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { InstrumentRecordPage } from '@/components/instrument/instrument-record-page';
import { instrumentMdxComponents } from '@/components/instrument/instrument-mdx-components';
import { getInstrument, getInstrumentStaticParams, isInstrumentPublished } from '@/lib/instruments/records';
import { instrumentUrl, normalizeInstrumentSerial } from '@/lib/instruments/serial';

interface Props { params: Promise<{ serial: string }> }

export function generateStaticParams() {
    return getInstrumentStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { serial: input } = await params;
    const serial = normalizeInstrumentSerial(input);
    const record = getInstrument(serial);
    if (!record || !isInstrumentPublished(record)) return {};
    return { title: `${record.name} · ${serial} | K7RHY`, description: record.theme, alternates: { canonical: instrumentUrl(serial) } };
}

export default async function InstrumentPage({ params }: Props) {
    const { serial: input } = await params;
    const serial = normalizeInstrumentSerial(input);
    if (input !== serial) redirect(`/sn/${serial}`);
    const record = getInstrument(serial);
    if (!record || !isInstrumentPublished(record)) notFound();

    return (
        <InstrumentRecordPage record={record}>
            <MDXRemote source={record.content} components={instrumentMdxComponents} />
        </InstrumentRecordPage>
    );
}
```

- [ ] **Step 5: Run focused tests and a route build**

Run: `npx vitest run components/instrument/instrument-record-page.test.tsx && npx next build`

Expected: component tests PASS; build emits `/sn/[serial]` and the unpublished fixture does not produce a public production page.

- [ ] **Step 6: Commit the public record page**

```bash
git add components/instrument/instrument-record-page.tsx components/instrument/instrument-record-page.test.tsx app/sn/[serial]/page.tsx
git commit -m "feat(instruments): add serial record pages"
```

---

### Task 5: QR-Backed One-Page Case Card

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `components/instrument/instrument-case-card.tsx`
- Test: `components/instrument/instrument-case-card.test.tsx`
- Create: `components/instrument/print-case-card-controls.tsx`
- Test: `components/instrument/print-case-card-controls.test.tsx`
- Create: `app/sn/[serial]/print/page.tsx`
- Create: `app/sn/instrument-records.css`
- Create: `app/sn/layout.tsx`

**Interfaces:**
- Consumes: the same `InstrumentRecord` and MDX source as Task 4.
- Produces: `InstrumentCaseCard({ record, children })`.
- Produces: QR SVG value from `instrumentUrl(record.serial)`.
- Produces: browser print invocation with visible fallback button.

- [ ] **Step 1: Install the QR renderer**

Run: `npm install qrcode.react`

Expected: `qrcode.react` appears in dependencies and the lockfile updates.

- [ ] **Step 2: Write failing case-card tests**

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { InstrumentCaseCard } from './instrument-case-card';

vi.mock('qrcode.react', () => ({ QRCodeSVG: ({ value }: { value: string }) => <svg aria-label="Instrument record QR code" data-value={value} /> }));

const record = {
    serial: 'RLY26001', modelCode: 'RLY', modelDescription: 'Relay', year: 2026, index: 1,
    publish: true, name: 'Relay Lipstick', completed: '2026-06-19', origin: 'Built by K7RHY Resonance Lab.',
    theme: 'Articulate and touch-sensitive.', images: [{ src: '/front.jpg', alt: 'Front' }], content: '',
};

describe('InstrumentCaseCard', () => {
    it('renders the site logo and full brand name', () => {
        render(<InstrumentCaseCard record={record}><div>Control map</div></InstrumentCaseCard>);
        expect(screen.getByRole('img', { name: 'K7RHY Resonance Lab logo' })).toBeInTheDocument();
        expect(screen.getByText('K7RHY Resonance Lab')).toBeInTheDocument();
    });

    it('renders identity, controls, Discord, and canonical QR destination', () => {
        const { container } = render(<InstrumentCaseCard record={record}><div>Control map</div></InstrumentCaseCard>);
        expect(screen.getByText('RLY26001')).toBeInTheDocument();
        expect(screen.getByText('Control map')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /discord/i })).toHaveAttribute('href', 'https://discord.gg/BuUxCG4W6w');
        expect(container.querySelector('[data-value="https://k7rhy.app/sn/RLY26001"]')).toBeInTheDocument();
        expect(container.querySelector('img[src="/front.jpg"]')).not.toBeInTheDocument();
    });
});
```

- [ ] **Step 3: Write failing print-control test**

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { PrintCaseCardControls } from './print-case-card-controls';

describe('PrintCaseCardControls', () => {
    it('invokes print on mount and provides a fallback button', () => {
        const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
        render(<PrintCaseCardControls />);
        expect(print).toHaveBeenCalledOnce();
        expect(screen.getByRole('button', { name: 'Print case card' })).toBeInTheDocument();
    });
});
```

- [ ] **Step 4: Implement the case-card wrapper**

```tsx
// components/instrument/instrument-case-card.tsx
import React from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { siteConfig } from '@/config/site';
import { instrumentUrl } from '@/lib/instruments/serial';
import type { InstrumentRecord } from '@/types/instrument';

export function InstrumentCaseCard({ record, children }: { record: InstrumentRecord; children: React.ReactNode }) {
    const url = instrumentUrl(record.serial);
    return (
        <article className="instrument-case-card flex flex-col border border-slate-300 p-[0.32in] shadow-xl">
            <header className="flex items-center justify-between border-b border-slate-300 pb-4">
                <div className="flex items-center gap-3">
                    <Image src="/images/k7rhy_logo.png" alt="K7RHY Resonance Lab logo" width={42} height={42} />
                    <span className="text-lg font-bold">K7RHY Resonance Lab</span>
                </div>
                <span className="font-mono text-[9pt] uppercase tracking-[0.16em] text-slate-500">Voice &amp; control card</span>
            </header>
            <section className="py-5">
                <div className="font-mono text-[9pt] tracking-[0.14em] text-sky-700">{record.serial} · {record.year}</div>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">{record.name}</h1>
                <p className="mt-2 max-w-[6.4in] text-[10pt] leading-relaxed text-slate-600">{record.theme}</p>
            </section>
            <section className="min-h-0 flex-1">{children}</section>
            <section className="mt-4 grid grid-cols-[0.8in_1fr] gap-3 border-t border-slate-300 pt-3 text-[9pt]">
                <span className="font-mono uppercase tracking-wider text-slate-500">Origin</span>
                <span>{record.origin}</span>
            </section>
            <footer className="mt-4 flex items-end justify-between border-t border-slate-300 pt-4">
                <div className="space-y-1 font-mono text-[8.5pt] text-slate-600">
                    <div>{url}</div>
                    <a href={siteConfig.links.discord} className="underline underline-offset-2">Questions? Join the K7RHY Discord</a>
                </div>
                <QRCodeSVG value={url} size={96} level="M" marginSize={1} title={`Open the record for ${record.serial}`} />
            </footer>
        </article>
    );
}
```

Do not access or render `record.images` in this component.

- [ ] **Step 5: Implement automatic print with fallback**

```tsx
// components/instrument/print-case-card-controls.tsx
'use client';

import React, { useEffect } from 'react';

export function PrintCaseCardControls() {
    useEffect(() => {
        window.print();
    }, []);

    return (
        <div className="instrument-print-controls">
            <button type="button" onClick={() => window.print()} className="rounded-lg border bg-background px-4 py-2 text-sm font-semibold shadow-sm">
                Print case card
            </button>
        </div>
    );
}
```

- [ ] **Step 6: Add nested route styling and one-page print constraints**

```tsx
// app/sn/layout.tsx
import './instrument-records.css';
export default function InstrumentLayout({ children }: { children: React.ReactNode }) {
    return children;
}
```

`app/sn/instrument-records.css` must contain:

```css
@page {
    size: letter portrait;
    margin: 0.35in;
}

.instrument-case-card {
    width: min(100%, 7.8in);
    min-height: 10.3in;
    margin: 1.5rem auto;
    background: white;
    color: #0f172a;
}

@media print {
    html,
    body {
        background: white !important;
    }

    header,
    footer,
    .instrument-print-controls,
    [data-web-only] {
        display: none !important;
    }

    .instrument-case-card {
        width: 100%;
        min-height: 0;
        height: 10.3in;
        margin: 0;
        overflow: hidden;
        break-after: avoid;
        break-inside: avoid;
        box-shadow: none;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }

    .instrument-print-mdx > :not([data-instrument-spec]) {
        display: none !important;
    }
}

@media print and (max-height: 10in) {
    .instrument-case-card {
        transform: scale(0.94);
        transform-origin: top left;
        width: 106.3829787%;
    }
}
```

Keep text at or above 9pt in print. Use explicit grid row limits and line clamping for theme/origin only if the full supplied text would otherwise produce a second page; never clamp control instructions.

- [ ] **Step 7: Implement the print route**

Create `app/sn/[serial]/print/page.tsx` with the same imports and `Props` type as the public route plus `InstrumentCaseCard` and `PrintCaseCardControls`. Use `resolveInstrumentRequest` from Task 6 when Task 6 is complete; until then use the same normalization, redirect, lookup, and publication conditions from Task 4. The component body is:

```tsx
<>
    <PrintCaseCardControls />
    <InstrumentCaseCard record={record}>
        <div className="instrument-print-mdx">
            <MDXRemote source={record.content} components={instrumentMdxComponents} />
        </div>
    </InstrumentCaseCard>
</>
```

Export `generateStaticParams()` by returning `getInstrumentStaticParams()`. Implement `generateMetadata()` with title `Case card · ${record.name} · ${serial} | K7RHY` and `robots: { index: false, follow: false }` so the canonical instrument record, not the utility print route, appears in search.

- [ ] **Step 8: Run focused tests**

Run: `npx vitest run components/instrument/instrument-case-card.test.tsx components/instrument/print-case-card-controls.test.tsx components/instrument/instrument-spec.test.tsx`

Expected: all tests PASS.

- [ ] **Step 9: Commit the case-card route**

```bash
git add package.json package-lock.json components/instrument/instrument-case-card.tsx components/instrument/instrument-case-card.test.tsx components/instrument/print-case-card-controls.tsx components/instrument/print-case-card-controls.test.tsx app/sn/layout.tsx app/sn/instrument-records.css app/sn/[serial]/print/page.tsx
git commit -m "feat(instruments): add printable case cards"
```

---

### Task 6: Route Behavior, Accessibility, and Rendered Verification

**Files:**
- Test: `lib/instruments/route-resolution.test.ts`
- Create: `lib/instruments/route-resolution.ts`
- Modify only if verification finds defects: files introduced in Tasks 3–5
- Modify: `docs/superpowers/plans/2026-06-19-instrument-records.md` (check off completed steps during execution)
- Create or update at session stop: `.remember/remember.md`

**Interfaces:**
- Produces: `resolveInstrumentRequest(input: string, environment: string | undefined)` as a pure route-decision helper used by both pages.
- Verifies: web/print parity, one-page output, theme consistency, header/footer presence, discovery CTA, logo/brand masthead, QR destination, and error behavior.

- [ ] **Step 1: Write failing route-decision tests**

```ts
import { describe, expect, it, vi } from 'vitest';
import { resolveInstrumentRequest } from './route-resolution';

vi.mock('./records', () => ({
    getInstrument: (serial: string) => serial === 'RLY26001' ? { serial, publish: false } : undefined,
}));

describe('resolveInstrumentRequest', () => {
    it('redirects lowercase serials', () => {
        expect(resolveInstrumentRequest('rly26001', 'development')).toEqual({ kind: 'redirect', location: '/sn/RLY26001' });
    });

    it('returns not-found for an unknown serial', () => {
        expect(resolveInstrumentRequest('RLY26999', 'development')).toEqual({ kind: 'not-found' });
    });

    it('returns not-found for an unpublished production record', () => {
        expect(resolveInstrumentRequest('RLY26001', 'production')).toEqual({ kind: 'not-found' });
    });

    it('returns the record outside production', () => {
        expect(resolveInstrumentRequest('RLY26001', 'development')).toMatchObject({ kind: 'record', record: { serial: 'RLY26001' } });
    });
});
```

- [ ] **Step 2: Implement and adopt the route helper**

```ts
// lib/instruments/route-resolution.ts
import type { InstrumentRecord } from '@/types/instrument';
import { getInstrument } from './records';
import { normalizeInstrumentSerial } from './serial';

export type InstrumentRequestResolution =
    | { kind: 'redirect'; location: string }
    | { kind: 'not-found' }
    | { kind: 'record'; record: InstrumentRecord };

export function resolveInstrumentRequest(input: string, environment = process.env.NEXT_PUBLIC_ENVIRONMENT): InstrumentRequestResolution {
    const serial = normalizeInstrumentSerial(input);
    if (input !== serial) return { kind: 'redirect', location: `/sn/${serial}` };
    const record = getInstrument(serial);
    if (!record || (environment === 'production' && !record.publish)) return { kind: 'not-found' };
    return { kind: 'record', record };
}
```

Replace duplicated route decisions in both pages with this helper. The print page appends `/print` when redirecting a lowercase print URL.

- [ ] **Step 3: Run the full automated suite and production build**

Run: `npx vitest run && npm run build`

Expected: all tests PASS; Next build and sitemap generation complete successfully without `GOOGLE_GENERATIVE_AI_API_KEY` because existing blog summaries are present/cached or summary generation safely skips.

- [ ] **Step 4: Start the site and verify the web record**

Temporarily set the example record to `publish: true` only for local verification, then run: `npm run dev`

Verify at `http://localhost:3000/sn/RLY26001`:

- Standard K7RHY header, navigation, dark-mode toggle, and footer are present.
- Exact-instrument hero image, serial, theme, origin, and date are visible.
- Every selector position is automatically numbered in source order.
- Push-pull and push-push each show both explicit states.
- Related Relay CTA and Discord link are keyboard reachable.
- Mobile width has no horizontal overflow.
- Dark mode keeps all text, borders, and controls readable.

Restore `publish: false` after verification.

- [ ] **Step 5: Verify Letter, A4, and monochrome print output**

Open `http://localhost:3000/sn/RLY26001/print` and inspect print preview with:

- Destination: Save to PDF
- Paper: US Letter, portrait, scale 100%, margins default
- Paper: A4, portrait, scale 100%, margins default
- Background graphics both enabled and disabled
- Color and black-and-white output

For every case, verify exactly one page, no clipped control text, no instrument photograph, no site header/footer, and visible site logo plus `K7RHY Resonance Lab`. Scan the rendered QR code with a phone and confirm it resolves to `https://k7rhy.app/sn/RLY26001`.

- [ ] **Step 6: Commit verification-driven fixes and route coverage**

```bash
git add lib/instruments/route-resolution.ts lib/instruments/route-resolution.test.ts app/sn components/instrument content/instruments/RLY26001.mdx docs/superpowers/plans/2026-06-19-instrument-records.md
git commit -m "test(instruments): verify routes and print layout"
```

- [ ] **Step 7: Write the pause/resume handoff**

Create or update `.remember/remember.md` with fewer than 20 lines:

```md
# Handoff

## State
Serialized instrument records are implemented through Task 6 on the current branch. The approved spec is `docs/superpowers/specs/2026-06-19-instrument-records-design.md`; the tracked execution checklist is `docs/superpowers/plans/2026-06-19-instrument-records.md`.

## Next
1. Replace the unpublished `RLY26001` template photograph/copy with the first real instrument.
2. Run `npx vitest run && npm run build` after content edits.
3. Check Letter and A4 print preview before setting `publish: true`.

## Context
Case cards are voice/control guides with quiet provenance. Keep the site header/footer on web records; never add owner data or a PDF-generation pipeline.
```

---

## Completion Criteria

- A valid published `content/instruments/<SERIAL>.mdx` produces both canonical routes.
- Invalid filenames, unknown model codes, incomplete selectors, and incomplete pot states fail clearly.
- The web page feels like an elevated K7RHY page and preserves all standard discovery paths.
- The case card uses the actual site logo plus full brand name, emphasizes voices/controls, and prints on exactly one Letter or A4 page.
- QR and Discord links derive centrally and work.
- The full test suite and production build pass.
- The plan checklist and `.remember/remember.md` make the next session immediately actionable.
