# Relay Components Shopping List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a canonical `/relay/components` shopping-list page that renders shared Relay components and model-specific electronics from writer-editable content data.

**Architecture:** Store component records as MDX files with structured frontmatter under `content/relay/components/items/`, and store model-to-component associations as JSON manifests under `content/relay/components/models/`. Add a server-side loader in `lib/relay-components.ts`, render the page with a small client component for the model selector and deep-link behavior, then link model pages into the canonical page.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict mode, MDX via `next-mdx-remote/rsc`, `gray-matter`, Vitest, Tailwind, existing shadcn/Radix UI primitives.

## Global Constraints

- Canonical shopping list route is `/relay/components`.
- Component categories are exactly `Body Construction`, `Guitar Hardware`, and `Electronics`.
- Model pages link to `/relay/components` with query state and hash fragments such as `/relay/components?model=lipstick#electronics`.
- Model pages do not render full or partial shopping lists.
- Build-stage instruction pages remain procedural and do not become purchasing pages.
- Ordinary component catalog edits must be possible in content files without editing TypeScript.
- Use existing Relay voicing slugs and labels from `config/relay-voicings.ts` and `config/relay-nav.ts`.
- Do not add cart, checkout, inventory, or price-scraping behavior.

---

## File Structure

- Create `types/relay-components.ts`: public TypeScript types for component categories, component records, model manifests, and resolved shopping-list data.
- Create `lib/relay-components.ts`: filesystem loader, validation, sorting, category grouping, and model-specific resolution.
- Create `lib/relay-components.test.ts`: Vitest coverage for loader behavior and model resolution.
- Create `content/relay/components/index.mdx`: page intro content rendered above the interactive list.
- Create `content/relay/components/items/*.mdx`: writer-editable component records migrated from the existing Relay body and Lipstick BOM pages.
- Create `content/relay/components/models/*.json`: writer-editable manifests listing model-specific component IDs.
- Create `components/relay/relay-components-shopping-list.tsx`: client component for the model selector, category rendering, source links, badges, and query/hash behavior.
- Create `app/relay/components/page.tsx`: App Router page for the canonical shopping-list route.
- Modify `config/relay-build-process.ts`: add a `Components` platform navigation item.
- Modify `components/relay/relay-voicing-overview.tsx`: add a concise parts-profile/action area linking to the canonical shopping list.
- Modify `lib/relay.test.ts`: route test support for `/relay/components`.
- Modify `content/relay/lipstick/bom.mdx`: replace the old duplicated BOM with a migration note and link to `/relay/components?model=lipstick`.

---

### Task 1: Relay Component Types And Loader

**Files:**
- Create: `types/relay-components.ts`
- Create: `lib/relay-components.ts`
- Create: `lib/relay-components.test.ts`

**Interfaces:**
- Produces: `RelayComponentCategory`, `RelayComponentScope`, `RelayComponentSpecificity`, `RelayComponentRecord`, `RelayModelComponentManifest`, `ResolvedRelayComponentList`
- Produces: `loadRelayComponentCatalog(): RelayComponentRecord[]`
- Produces: `loadRelayModelManifest(modelSlug: string): RelayModelComponentManifest`
- Produces: `resolveRelayComponentList(modelSlug?: string): ResolvedRelayComponentList`
- Produces: `groupRelayComponentsByCategory(components: RelayComponentRecord[]): Record<RelayComponentCategory, RelayComponentRecord[]>`
- Consumes: `gray-matter`, Node `fs`, Node `path`

- [ ] **Step 1: Write failing loader tests**

Create `lib/relay-components.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { groupRelayComponentsByCategory, loadRelayComponentCatalog, loadRelayModelManifest, resolveRelayComponentList } from '@/lib/relay-components';

describe('loadRelayComponentCatalog', () => {
    it('loads shared Relay component records from content files', () => {
        const catalog = loadRelayComponentCatalog();

        expect(catalog.map((item) => item.id)).toContain('guitar-neck');
        expect(catalog.find((item) => item.id === 'guitar-neck')).toMatchObject({
            title: 'Guitar Neck',
            category: 'Guitar Hardware',
            scope: 'common',
        });
    });

    it('sorts components by category order and item order', () => {
        const catalog = loadRelayComponentCatalog();
        const ids = catalog.map((item) => item.id);

        expect(ids.indexOf('pet-cf-filament')).toBeLessThan(ids.indexOf('guitar-neck'));
        expect(ids.indexOf('guitar-neck')).toBeLessThan(ids.indexOf('output-jack'));
    });
});

describe('loadRelayModelManifest', () => {
    it('loads model-specific component IDs for Lipstick', () => {
        const manifest = loadRelayModelManifest('lipstick');

        expect(manifest.model).toBe('lipstick');
        expect(manifest.components).toContain('push-push-pots');
        expect(manifest.components).toContain('gfs-lipstick-pickup');
    });
});

describe('resolveRelayComponentList', () => {
    it('includes common components without a selected model', () => {
        const list = resolveRelayComponentList();

        expect(list.selectedModel).toBeUndefined();
        expect(list.components.map((item) => item.id)).toContain('guitar-neck');
        expect(list.components.map((item) => item.id)).not.toContain('push-push-pots');
        expect(list.hasModelSpecificChoices).toBe(true);
    });

    it('includes selected model-specific components with common components', () => {
        const list = resolveRelayComponentList('lipstick');
        const ids = list.components.map((item) => item.id);

        expect(list.selectedModel).toBe('lipstick');
        expect(ids).toContain('guitar-neck');
        expect(ids).toContain('push-push-pots');
        expect(ids).toContain('gfs-bridge-pickup');
    });

    it('throws when a manifest references a missing component ID', () => {
        expect(() => resolveRelayComponentList('missing-component-test')).toThrow(/Unknown Relay component ID/);
    });
});

describe('groupRelayComponentsByCategory', () => {
    it('returns all categories in display order', () => {
        const grouped = groupRelayComponentsByCategory(resolveRelayComponentList('lipstick').components);

        expect(Object.keys(grouped)).toEqual(['Body Construction', 'Guitar Hardware', 'Electronics']);
    });
});
```

- [ ] **Step 2: Add fixture manifest used by the missing-ID test**

Create `content/relay/components/models/missing-component-test.json`:

```json
{
    "model": "missing-component-test",
    "components": ["does-not-exist"]
}
```

- [ ] **Step 3: Run tests to verify failure**

Run: `npx vitest run lib/relay-components.test.ts`

Expected: FAIL because `@/lib/relay-components` does not exist.

- [ ] **Step 4: Add public types**

Create `types/relay-components.ts`:

```ts
export const relayComponentCategories = ['Body Construction', 'Guitar Hardware', 'Electronics'] as const;

export type RelayComponentCategory = (typeof relayComponentCategories)[number];
export type RelayComponentScope = 'common' | 'model';
export type RelayComponentSpecificity = 'specific' | 'flexible';

export interface RelayComponentSource {
    label: string;
    href: string;
}

export interface RelayComponentRecord {
    id: string;
    title: string;
    category: RelayComponentCategory;
    order: number;
    quantity: string;
    scope: RelayComponentScope;
    specificity: RelayComponentSpecificity;
    source: RelayComponentSource;
    priceKey: string;
    fallbackPrice: string;
    substitution?: string;
    content: string;
}

export interface RelayModelComponentManifest {
    model: string;
    components: string[];
}

export interface ResolvedRelayComponentList {
    selectedModel?: string;
    components: RelayComponentRecord[];
    allModelSpecificComponents: RelayComponentRecord[];
    hasModelSpecificChoices: boolean;
}
```

- [ ] **Step 5: Add loader implementation**

Create `lib/relay-components.ts`:

```ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { relayComponentCategories, type RelayComponentCategory, type RelayComponentRecord, type RelayModelComponentManifest, type ResolvedRelayComponentList } from '@/types/relay-components';

const COMPONENT_ITEMS_DIR = path.join(process.cwd(), 'content', 'relay', 'components', 'items');
const COMPONENT_MODELS_DIR = path.join(process.cwd(), 'content', 'relay', 'components', 'models');

function assertCategory(value: unknown, filePath: string): RelayComponentCategory {
    if (typeof value === 'string' && relayComponentCategories.includes(value as RelayComponentCategory)) {
        return value as RelayComponentCategory;
    }

    throw new Error(`Invalid Relay component category in ${filePath}: ${String(value)}`);
}

function readComponentFile(filePath: string): RelayComponentRecord {
    const source = fs.readFileSync(filePath, 'utf8');
    const { content, data } = matter(source);

    const requiredFields = ['id', 'title', 'category', 'order', 'quantity', 'scope', 'specificity', 'source', 'priceKey', 'fallbackPrice'];
    for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
            throw new Error(`Relay component ${filePath} is missing ${field}`);
        }
    }

    if (data.scope !== 'common' && data.scope !== 'model') {
        throw new Error(`Relay component ${filePath} has invalid scope: ${data.scope}`);
    }

    if (data.specificity !== 'specific' && data.specificity !== 'flexible') {
        throw new Error(`Relay component ${filePath} has invalid specificity: ${data.specificity}`);
    }

    if (!data.source || typeof data.source.label !== 'string' || typeof data.source.href !== 'string') {
        throw new Error(`Relay component ${filePath} must define source.label and source.href`);
    }

    return {
        id: String(data.id),
        title: String(data.title),
        category: assertCategory(data.category, filePath),
        order: Number(data.order),
        quantity: String(data.quantity),
        scope: data.scope,
        specificity: data.specificity,
        source: {
            label: data.source.label,
            href: data.source.href,
        },
        priceKey: String(data.priceKey),
        fallbackPrice: String(data.fallbackPrice),
        substitution: data.substitution ? String(data.substitution) : undefined,
        content: content.trim(),
    };
}

function sortComponents(a: RelayComponentRecord, b: RelayComponentRecord): number {
    const categoryDelta = relayComponentCategories.indexOf(a.category) - relayComponentCategories.indexOf(b.category);
    if (categoryDelta !== 0) return categoryDelta;
    return a.order - b.order || a.title.localeCompare(b.title);
}

export function loadRelayComponentCatalog(): RelayComponentRecord[] {
    const files = fs
        .readdirSync(COMPONENT_ITEMS_DIR)
        .filter((file) => file.endsWith('.mdx'))
        .map((file) => path.join(COMPONENT_ITEMS_DIR, file));

    const records = files.map(readComponentFile).sort(sortComponents);
    const ids = new Set<string>();

    for (const record of records) {
        if (ids.has(record.id)) {
            throw new Error(`Duplicate Relay component ID: ${record.id}`);
        }
        ids.add(record.id);
    }

    return records;
}

export function loadRelayModelManifest(modelSlug: string): RelayModelComponentManifest {
    const filePath = path.join(COMPONENT_MODELS_DIR, `${modelSlug}.json`);
    const source = fs.readFileSync(filePath, 'utf8');
    const manifest = JSON.parse(source) as RelayModelComponentManifest;

    if (manifest.model !== modelSlug) {
        throw new Error(`Relay component manifest ${filePath} has model ${manifest.model}, expected ${modelSlug}`);
    }

    if (!Array.isArray(manifest.components)) {
        throw new Error(`Relay component manifest ${filePath} must include a components array`);
    }

    return manifest;
}

export function resolveRelayComponentList(modelSlug?: string): ResolvedRelayComponentList {
    const catalog = loadRelayComponentCatalog();
    const byId = new Map(catalog.map((component) => [component.id, component]));
    const commonComponents = catalog.filter((component) => component.scope === 'common');
    const allModelSpecificComponents = catalog.filter((component) => component.scope === 'model');

    if (!modelSlug) {
        return {
            components: commonComponents,
            allModelSpecificComponents,
            hasModelSpecificChoices: allModelSpecificComponents.length > 0,
        };
    }

    const manifest = loadRelayModelManifest(modelSlug);
    const modelComponents = manifest.components.map((id) => {
        const component = byId.get(id);
        if (!component) {
            throw new Error(`Unknown Relay component ID "${id}" in ${modelSlug} manifest`);
        }
        return component;
    });

    return {
        selectedModel: modelSlug,
        components: [...commonComponents, ...modelComponents].sort(sortComponents),
        allModelSpecificComponents,
        hasModelSpecificChoices: allModelSpecificComponents.length > 0,
    };
}

export function groupRelayComponentsByCategory(components: RelayComponentRecord[]): Record<RelayComponentCategory, RelayComponentRecord[]> {
    return relayComponentCategories.reduce(
        (groups, category) => {
            groups[category] = components.filter((component) => component.category === category);
            return groups;
        },
        {} as Record<RelayComponentCategory, RelayComponentRecord[]>
    );
}
```

- [ ] **Step 6: Run tests again**

Run: `npx vitest run lib/relay-components.test.ts`

Expected: FAIL because component content files do not exist yet.

- [ ] **Step 7: Commit**

```bash
git add types/relay-components.ts lib/relay-components.ts lib/relay-components.test.ts content/relay/components/models/missing-component-test.json
git commit -m "Add Relay component catalog loader"
```

---

### Task 2: Component Content Catalog And Model Manifests

**Files:**
- Create: `content/relay/components/index.mdx`
- Create: `content/relay/components/items/pet-cf-filament.mdx`
- Create: `content/relay/components/items/gflex-650.mdx`
- Create: `content/relay/components/items/guitar-neck.mdx`
- Create: `content/relay/components/items/hardtail-bridge.mdx`
- Create: `content/relay/components/items/neck-ferrules.mdx`
- Create: `content/relay/components/items/string-ferrule-plate.mdx`
- Create: `content/relay/components/items/locking-tuners.mdx`
- Create: `content/relay/components/items/strap-buttons.mdx`
- Create: `content/relay/components/items/guitar-strings.mdx`
- Create: `content/relay/components/items/backplate-screws.mdx`
- Create: `content/relay/components/items/truss-rod-cover-screws.mdx`
- Create: `content/relay/components/items/knobs.mdx`
- Create: `content/relay/components/items/gfs-neck-pickup.mdx`
- Create: `content/relay/components/items/gfs-lipstick-pickup.mdx`
- Create: `content/relay/components/items/gfs-bridge-pickup.mdx`
- Create: `content/relay/components/items/push-push-pots.mdx`
- Create: `content/relay/components/items/selector-switch.mdx`
- Create: `content/relay/components/items/tone-capacitor.mdx`
- Create: `content/relay/components/items/treble-bleed.mdx`
- Create: `content/relay/components/items/output-jack.mdx`
- Create: `content/relay/components/items/hookup-wire.mdx`
- Create: `content/relay/components/items/copper-foil-tape.mdx`
- Create: `content/relay/components/models/lipstick.json`
- Create: `content/relay/components/models/arc.json`
- Create: `content/relay/components/models/current.json`
- Create: `content/relay/components/models/hammer.json`
- Create: `content/relay/components/models/reef.json`
- Create: `content/relay/components/models/torch.json`
- Create: `content/relay/components/models/velvet.json`

**Interfaces:**
- Consumes: `loadRelayComponentCatalog()` from Task 1
- Produces: writer-editable component records used by the page and tests

- [ ] **Step 1: Add the components page intro MDX**

Create `content/relay/components/index.mdx`:

```mdx
---
title: 'Components'
description: 'The canonical Relay shopping list, grouped by body construction, guitar hardware, and electronics.'
---

This is the source-of-truth shopping list for Relay builds. Choose a model to include the electronics that change by voicing. Shared body and guitar hardware stay the same across the platform.

Use this page before ordering parts. The assembly guides tell you when and how to install each part; this page tells you what to buy.
```

- [ ] **Step 2: Add body construction component files**

Create `content/relay/components/items/pet-cf-filament.mdx`:

```mdx
---
id: 'pet-cf-filament'
title: 'PET-CF Filament'
category: 'Body Construction'
order: 10
quantity: '2 one-kilogram spools'
scope: 'common'
specificity: 'specific'
source:
    label: 'Amazon'
    href: 'https://amzn.to/4uIaVRl'
priceKey: 'pet-cf-filament'
fallbackPrice: '$66.00'
substitution: 'PET-GF is a valid alternative to PET-CF and may be less expensive. Do not use PLA or standard PETG; they can fail under string tension over time.'
---

Two kilograms of filament are required for a complete body. PET-CF is preferred for ease of use, dimensional stability, and material strength.
```

Create `content/relay/components/items/gflex-650.mdx`:

```mdx
---
id: 'gflex-650'
title: 'G/Flex 650 Epoxy'
category: 'Body Construction'
order: 20
quantity: '1 kit'
scope: 'common'
specificity: 'specific'
source:
    label: 'Amazon'
    href: 'https://amzn.to/41jYduJ'
priceKey: 'gflex-650'
fallbackPrice: '$32.00'
---

A flexible marine-grade epoxy that handles vibration and stress without cracking. One kit has enough epoxy for multiple Relay bodies.
```

- [ ] **Step 3: Add common guitar hardware component files**

Create the listed Guitar Hardware MDX records using these exact frontmatter values:

```mdx
---
id: 'guitar-neck'
title: 'Guitar Neck'
category: 'Guitar Hardware'
order: 10
quantity: '1'
scope: 'common'
specificity: 'flexible'
source:
    label: 'Amazon'
    href: 'https://amzn.to/41ko1a1'
priceKey: 'guitar-neck'
fallbackPrice: '$60.00'
substitution: 'Use a compatible 24.75-inch bolt-on neck that matches the Relay pocket and scale geometry.'
---

Necks with identical listed specs can vary meaningfully. Budget time for fitting and check compatibility before ordering.
```

```mdx
---
id: 'hardtail-bridge'
title: 'Fixed Hardtail Bridge'
category: 'Guitar Hardware'
order: 20
quantity: '1'
scope: 'common'
specificity: 'specific'
source:
    label: 'Amazon'
    href: 'https://amzn.to/4smY8ST'
priceKey: 'hardtail-bridge'
fallbackPrice: '$15.00'
---

The Relay body is designed around a fixed string-through hardtail bridge. Tremolo bridges are not compatible with the current body.
```

```mdx
---
id: 'neck-ferrules'
title: 'Neck Mounting Ferrules'
category: 'Guitar Hardware'
order: 30
quantity: '1 set'
scope: 'common'
specificity: 'specific'
source:
    label: 'Amazon'
    href: 'https://amzn.to/4rOYP6x'
priceKey: 'neck-ferrules'
fallbackPrice: '$10.00'
---

These press into the back of the body and receive the neck bolts. Install them after confirming neck alignment because they are permanent.
```

```mdx
---
id: 'string-ferrule-plate'
title: 'String Ferrule Plate'
category: 'Guitar Hardware'
order: 40
quantity: '1'
scope: 'common'
specificity: 'flexible'
source:
    label: 'Amazon'
    href: 'https://amzn.to/4d2Rblc'
priceKey: 'string-ferrule-plate'
fallbackPrice: '$10.00'
substitution: 'Individual string ferrules work. The plate is simpler and cleaner for a first build; individual ferrules are cheaper but require careful alignment.'
---

The string ferrules anchor the strings through the back of the body.
```

```mdx
---
id: 'locking-tuners'
title: 'Locking Tuners'
category: 'Guitar Hardware'
order: 50
quantity: '1 six-in-line set'
scope: 'common'
specificity: 'flexible'
source:
    label: 'Amazon'
    href: 'https://amzn.to/40HSQW2'
priceKey: 'locking-tuners'
fallbackPrice: '$35.00'
substitution: 'Standard non-locking tuners work if they match the headstock hole diameter.'
---

Locking tuners make restringing faster and improve tuning stability while the setup is being dialed in.
```

```mdx
---
id: 'strap-buttons'
title: 'Strap Buttons'
category: 'Guitar Hardware'
order: 60
quantity: '1 pair'
scope: 'common'
specificity: 'flexible'
source:
    label: 'Amazon'
    href: 'https://amzn.to/4uH46j0'
priceKey: 'strap-buttons'
fallbackPrice: '$11.00'
substitution: 'Any standard strap button fits. Strap locks are fine if their mounting screws work with the body.'
---

Relay uses standard strap button mounting locations.
```

```mdx
---
id: 'guitar-strings'
title: 'Guitar Strings, 9-42'
category: 'Guitar Hardware'
order: 70
quantity: '3 packs'
scope: 'common'
specificity: 'flexible'
source:
    label: 'Amazon'
    href: 'https://amzn.to/4bZbI9a'
priceKey: 'guitar-strings'
fallbackPrice: '$20.00'
substitution: 'Any 9-42 light gauge strings work. Start with 9s before experimenting with heavier gauges.'
---

Three packs are recommended because setup work can sacrifice a string or two.
```

```mdx
---
id: 'backplate-screws'
title: 'Backplate Screws'
category: 'Guitar Hardware'
order: 80
quantity: '1 set'
scope: 'common'
specificity: 'flexible'
source:
    label: 'Local hardware or guitar parts supplier'
    href: 'https://www.stewmac.com/'
priceKey: 'backplate-screws'
fallbackPrice: '$5.00'
substitution: 'Use screws that match the printed pilot holes and backplate thickness.'
---

These secure the rear cavity cover after electronics installation.
```

```mdx
---
id: 'truss-rod-cover-screws'
title: 'Truss Rod Cover Screws'
category: 'Guitar Hardware'
order: 90
quantity: '1 set'
scope: 'common'
specificity: 'flexible'
source:
    label: 'Local hardware or guitar parts supplier'
    href: 'https://www.stewmac.com/'
priceKey: 'truss-rod-cover-screws'
fallbackPrice: '$5.00'
substitution: 'Use screws that match the truss rod cover and neck pilot holes.'
---

These secure the truss rod cover on the headstock.
```

```mdx
---
id: 'knobs'
title: 'Knobs'
category: 'Guitar Hardware'
order: 100
quantity: '1 set'
scope: 'common'
specificity: 'flexible'
source:
    label: 'Amazon'
    href: 'https://amzn.to/3PAKPzI'
priceKey: 'knobs'
fallbackPrice: '$10.00'
substitution: 'Any knob that fits the selected pot shaft works. Check split-shaft versus solid-shaft fit before buying.'
---

Knob fit depends on the pots selected for the model.
```

- [ ] **Step 4: Add electronics component files**

Create `content/relay/components/items/gfs-neck-pickup.mdx`:

```mdx
---
id: 'gfs-neck-pickup'
title: 'Neck Humbucker, GFS KPH115 Classic II Alnico 2'
category: 'Electronics'
order: 10
quantity: '1'
scope: 'model'
specificity: 'specific'
source:
    label: 'Guitar Fetish'
    href: 'https://www.guitarfetish.com/KP--GFS-Classic-II-Alnico-2-Vintage-wound-Humbuckers-Black-Kwikplug%E2%84%A2-Ready_p_21913.html'
priceKey: 'gfs-neck-pickup'
fallbackPrice: '$37.00'
---

Vintage-wound Alnico 2 humbucker for the neck position. It pairs with the lipstick without fighting it.
```

Create `content/relay/components/items/gfs-lipstick-pickup.mdx`:

```mdx
---
id: 'gfs-lipstick-pickup'
title: 'Middle Lipstick, GFS KPS41 Pro Tube'
category: 'Electronics'
order: 20
quantity: '1'
scope: 'model'
specificity: 'specific'
source:
    label: 'Guitar Fetish'
    href: 'https://www.guitarfetish.com/Pro-Tube-Lipstick-Pickups-Gloss-black--Kwikplug%E2%84%A2-Ready_p_21995.html'
priceKey: 'gfs-lipstick-pickup'
fallbackPrice: '$32.00'
---

The tonal-shaping layer in Relay Lipstick. The circuit is balanced around this pickup's output level and impedance characteristics.
```

Create `content/relay/components/items/gfs-bridge-pickup.mdx`:

```mdx
---
id: 'gfs-bridge-pickup'
title: 'Bridge Humbucker, GFS KPH65 Vintage 59 Alnico V'
category: 'Electronics'
order: 30
quantity: '1'
scope: 'model'
specificity: 'specific'
source:
    label: 'Guitar Fetish'
    href: 'https://www.guitarfetish.com/Vintage-59-Classic-Alnico-V-Humbucker-Black_p_21820.html'
priceKey: 'gfs-bridge-pickup'
fallbackPrice: '$37.00'
---

Moderate-output bridge humbucker for Relay Lipstick. High-output pickups overwhelm the lipstick layer.
```

Create `content/relay/components/items/push-push-pots.mdx`:

```mdx
---
id: 'push-push-pots'
title: 'Push-Push Pots'
category: 'Electronics'
order: 40
quantity: '2'
scope: 'model'
specificity: 'flexible'
source:
    label: 'Amazon'
    href: 'https://amzn.to/4bsb448'
priceKey: 'push-push-pots'
fallbackPrice: '$15.00'
substitution: 'Standard 500k pots work for volume and tone if coil splitting is omitted. The split function requires push-push or equivalent switched pots.'
---

These serve as both volume controls and coil splits, keeping the control layout clean without adding extra switches.
```

Create `content/relay/components/items/selector-switch.mdx`:

```mdx
---
id: 'selector-switch'
title: 'Selector Switch, 3-way'
category: 'Electronics'
order: 50
quantity: '1'
scope: 'model'
specificity: 'specific'
source:
    label: 'Amazon'
    href: 'https://amzn.to/40LRuJY'
priceKey: 'selector-switch'
fallbackPrice: '$8.00'
---

Relay Lipstick uses a 3-way pickup selector for neck, both, and bridge humbuckers. The lipstick is engaged separately through the control wiring.
```

Create `content/relay/components/items/tone-capacitor.mdx`:

```mdx
---
id: 'tone-capacitor'
title: 'Tone Capacitor'
category: 'Electronics'
order: 60
quantity: '1'
scope: 'model'
specificity: 'flexible'
source:
    label: 'Amazon'
    href: 'https://amzn.to/3NEJ18n'
priceKey: 'tone-capacitor'
fallbackPrice: '$10.00'
substitution: 'Cap value is a tonal preference. Smaller values cut higher frequencies; larger values cut lower.'
---

The listed value gives a warm but not muddy roll-off for the Relay Lipstick reference circuit.
```

Create `content/relay/components/items/treble-bleed.mdx`:

```mdx
---
id: 'treble-bleed'
title: 'Treble Bleed'
category: 'Electronics'
order: 70
quantity: '1 network'
scope: 'model'
specificity: 'specific'
source:
    label: 'Amazon'
    href: 'https://amzn.to/4bUwS8x'
priceKey: 'treble-bleed'
fallbackPrice: '$15.00'
---

Preserves high-frequency response when rolling back volume. Without it, the guitar gets muddy as volume decreases.
```

Create `content/relay/components/items/output-jack.mdx`:

```mdx
---
id: 'output-jack'
title: 'Output Jack'
category: 'Electronics'
order: 80
quantity: '1'
scope: 'common'
specificity: 'flexible'
source:
    label: 'Amazon'
    href: 'https://amzn.to/4bGpEUv'
priceKey: 'output-jack'
fallbackPrice: '$5.00'
substitution: 'Any standard 1/4-inch mono output jack works if it fits the body cavity.'
---

The listed part is a Switchcraft-style jack that fits the Relay body cavity.
```

Create `content/relay/components/items/hookup-wire.mdx`:

```mdx
---
id: 'hookup-wire'
title: 'Hookup Wire'
category: 'Electronics'
order: 90
quantity: '1 spool or assortment'
scope: 'common'
specificity: 'flexible'
source:
    label: 'Amazon'
    href: 'https://amzn.to/4bDGenX'
priceKey: 'hookup-wire'
fallbackPrice: '$7.00'
substitution: 'Any 22-24 AWG stranded hookup wire works. Avoid solid core because it is harder to route and fatigues with vibration.'
---

Used for control-cavity wiring and ground connections.
```

Create `content/relay/components/items/copper-foil-tape.mdx`:

```mdx
---
id: 'copper-foil-tape'
title: 'Copper Foil Tape'
category: 'Electronics'
order: 100
quantity: '1 roll'
scope: 'common'
specificity: 'specific'
source:
    label: 'Amazon'
    href: 'https://amzn.to/4smieg1'
priceKey: 'copper-foil-tape'
fallbackPrice: '$9.00'
---

Used to shield the control cavity. Conductive adhesive is required so overlapping pieces maintain electrical continuity.
```

- [ ] **Step 5: Add model manifests**

Create `content/relay/components/models/lipstick.json`:

```json
{
    "model": "lipstick",
    "components": ["gfs-neck-pickup", "gfs-lipstick-pickup", "gfs-bridge-pickup", "push-push-pots", "selector-switch", "tone-capacitor", "treble-bleed"]
}
```

Create `content/relay/components/models/arc.json`:

```json
{
    "model": "arc",
    "components": []
}
```

Create `content/relay/components/models/current.json`:

```json
{
    "model": "current",
    "components": []
}
```

Create `content/relay/components/models/hammer.json`:

```json
{
    "model": "hammer",
    "components": []
}
```

Create `content/relay/components/models/reef.json`:

```json
{
    "model": "reef",
    "components": []
}
```

Create `content/relay/components/models/torch.json`:

```json
{
    "model": "torch",
    "components": []
}
```

Create `content/relay/components/models/velvet.json`:

```json
{
    "model": "velvet",
    "components": []
}
```

- [ ] **Step 6: Run catalog tests**

Run: `npx vitest run lib/relay-components.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add content/relay/components types/relay-components.ts lib/relay-components.ts lib/relay-components.test.ts
git commit -m "Add Relay component catalog content"
```

---

### Task 3: Shopping List Route And Interactive Renderer

**Files:**
- Create: `components/relay/relay-components-shopping-list.tsx`
- Create: `app/relay/components/page.tsx`
- Modify: `lib/relay.test.ts`

**Interfaces:**
- Consumes: `loadRelayPlatformSectionPage(['components', 'index'])`
- Consumes: `resolveRelayComponentList(modelSlug?: string)`
- Consumes: `groupRelayComponentsByCategory(components)`
- Produces: route `/relay/components`

- [ ] **Step 1: Extend Relay tests for components page loading**

Modify imports in `lib/relay.test.ts`:

```ts
import { resolveRelayVoicingFilePath, resolveRelayPlatformFilePath, buildRelayVoicingBreadcrumbs, buildRelayPlatformBreadcrumbs, loadRelayVoicingPage, loadRelayVoicingsGalleryPage, loadRelayPlatformSectionPage } from '@/lib/relay';
```

Add this test:

```ts
describe('loadRelayPlatformSectionPage', () => {
    it('loads the Relay components page frontmatter', () => {
        const { frontmatter } = loadRelayPlatformSectionPage(['components', 'index']);

        expect(frontmatter.title).toBe('Components');
        expect(frontmatter.description).toContain('shopping list');
    });
});
```

- [ ] **Step 2: Run route tests**

Run: `npx vitest run lib/relay.test.ts`

Expected: PASS because `loadRelayPlatformSectionPage` already supports nested platform pages.

- [ ] **Step 3: Add shopping list client component**

Create `components/relay/relay-components-shopping-list.tsx`:

```tsx
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { relayVoicings } from '@/config/relay-voicings';
import { getCachedPrice } from '@/lib/amazon-prices';
import { groupRelayComponentsByCategory } from '@/lib/relay-components';
import { cn } from '@/lib/utils';
import type { RelayComponentRecord } from '@/types/relay-components';

interface RelayComponentsShoppingListProps {
    components: RelayComponentRecord[];
    allModelSpecificComponents: RelayComponentRecord[];
    initialModel?: string;
}

function ComponentBadge({ children, tone }: { children: React.ReactNode; tone: 'amber' | 'green' | 'slate' }) {
    const tones = {
        amber: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
        green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        slate: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-400',
    };

    return <span className={cn('rounded border px-1.5 py-0.5 text-xs font-medium', tones[tone])}>{children}</span>;
}

function ComponentRow({ component }: { component: RelayComponentRecord }) {
    const price = getCachedPrice(component.priceKey, component.fallbackPrice);

    return (
        <div className="border-b py-4 last:border-b-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="m-0 text-base font-semibold">{component.title}</h3>
                        <ComponentBadge tone={component.specificity === 'specific' ? 'amber' : 'green'}>{component.specificity === 'specific' ? 'Specific' : 'Flexible'}</ComponentBadge>
                        {component.scope === 'model' && <ComponentBadge tone="slate">Model-specific</ComponentBadge>}
                    </div>
                    <p className="text-sm text-muted-foreground">Quantity: {component.quantity}</p>
                </div>
                <div className="text-sm text-muted-foreground sm:text-right">
                    <a href={component.source.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-foreground hover:underline">
                        {component.source.label}
                        <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <div>{price}</div>
                </div>
            </div>
            {component.content && <p className="mt-2 text-sm text-muted-foreground">{component.content}</p>}
            {component.substitution && (
                <div className="mt-3 rounded-md border-l-2 border-emerald-500/40 pl-3 text-sm text-muted-foreground">
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">Alternative: </span>
                    {component.substitution}
                </div>
            )}
        </div>
    );
}

export function RelayComponentsShoppingList({ components, allModelSpecificComponents, initialModel }: RelayComponentsShoppingListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedModel, setSelectedModel] = useState(initialModel ?? searchParams.get('model') ?? '');
    const grouped = useMemo(() => groupRelayComponentsByCategory(components), [components]);
    const selectedVoicing = relayVoicings.find((voicing) => voicing.slug === selectedModel);

    function handleModelChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const nextModel = event.target.value;
        setSelectedModel(nextModel);
        const hash = window.location.hash || '';
        router.replace(nextModel ? `/relay/components?model=${nextModel}${hash}` : `/relay/components${hash}`);
    }

    return (
        <div className="mt-8 space-y-8">
            <div className="rounded-lg border p-4">
                <label className="text-sm font-medium" htmlFor="relay-model-selector">
                    Model
                </label>
                <select id="relay-model-selector" value={selectedModel} onChange={handleModelChange} className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm sm:max-w-sm">
                    <option value="">Shared platform parts only</option>
                    {relayVoicings.map((voicing) => (
                        <option key={voicing.slug} value={voicing.slug}>
                            {voicing.name}
                        </option>
                    ))}
                </select>
                <p className="mt-2 text-sm text-muted-foreground">
                    {selectedVoicing ? `Showing shared Relay parts plus model-specific electronics for ${selectedVoicing.name}.` : 'Showing shared platform parts. Choose a model to include model-specific electronics.'}
                </p>
                {!selectedModel && allModelSpecificComponents.length > 0 && (
                    <p className="mt-2 text-sm text-muted-foreground">
                        Electronics vary by model. Start from a voicing page or select a model here before ordering circuit parts.
                    </p>
                )}
            </div>

            {Object.entries(grouped).map(([category, items]) => (
                <section key={category} id={category.toLowerCase().replaceAll(' ', '-')} className="scroll-m-24">
                    <h2 className="font-heading mt-12 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">{category}</h2>
                    {items.length > 0 ? (
                        <div className="mt-4 rounded-lg border px-4">
                            {items.map((component) => (
                                <ComponentRow key={component.id} component={component} />
                            ))}
                        </div>
                    ) : (
                        <p className="mt-3 text-sm text-muted-foreground">No items in this category for the current selection.</p>
                    )}
                </section>
            ))}

            <p className="text-sm text-muted-foreground">
                Fit-sensitive parts still need compatibility checks before purchase. Start with <Link href="/relay/lipstick/compatibility">What Will Fit</Link> when a dimension or substitution matters.
            </p>
        </div>
    );
}
```

- [ ] **Step 4: Add the route page**

Create `app/relay/components/page.tsx`:

```tsx
import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage } from '@/components/doc/doc-page';
import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
import { RelayComponentsShoppingList } from '@/components/relay/relay-components-shopping-list';
import { loadRelayPlatformSectionPage } from '@/lib/relay';
import { resolveRelayComponentList } from '@/lib/relay-components';

type Props = { searchParams: Promise<{ model?: string }> };

export async function generateMetadata() {
    try {
        const { frontmatter } = loadRelayPlatformSectionPage(['components', 'index']);
        return {
            title: `${frontmatter.title} | Relay Guitar | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}

export default async function RelayComponentsPage({ searchParams }: Props) {
    const { model } = await searchParams;
    const { content, frontmatter } = loadRelayPlatformSectionPage(['components', 'index']);
    const resolvedList = resolveRelayComponentList(model);
    const breadcrumbs = [{ label: 'Relay Guitar', href: '/relay' }, { label: 'Components' }];

    return (
        <DocPage title={frontmatter.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
            <MDXRemote source={content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
            <RelayComponentsShoppingList components={resolvedList.components} allModelSpecificComponents={resolvedList.allModelSpecificComponents} initialModel={resolvedList.selectedModel} />
        </DocPage>
    );
}
```

- [ ] **Step 5: Run focused tests**

Run: `npx vitest run lib/relay.test.ts lib/relay-components.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/relay/components/page.tsx components/relay/relay-components-shopping-list.tsx lib/relay.test.ts
git commit -m "Add Relay components shopping list page"
```

---

### Task 4: Navigation And Model Page Links

**Files:**
- Modify: `config/relay-build-process.ts`
- Modify: `components/relay/relay-voicing-overview.tsx`
- Modify: `content/relay/lipstick/bom.mdx`

**Interfaces:**
- Consumes: `/relay/components?model=<slug>#electronics`
- Produces: platform nav link and voicing-page call to action

- [ ] **Step 1: Update build-process nav**

Modify `config/relay-build-process.ts` so the Body stage includes a Components item before Print:

```ts
items: [
    { title: 'Components', href: '/relay/components' },
    { title: 'Print', href: '/relay/body/print' },
    { title: 'Bonding', href: '/relay/body/bonding' },
    { title: 'Finishing', href: '/relay/body/finishing' },
],
```

- [ ] **Step 2: Add a model shopping-list action to voicing overview**

Open `components/relay/relay-voicing-overview.tsx` and add a small action block near the end of the overview wrapper, after the MDX content. Build the URL from the current `voicingSlug` prop.

Add imports:

```ts
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
```

Add this JSX inside the rendered wrapper:

```tsx
<div className="mt-8 rounded-lg border p-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h2 className="text-base font-semibold">Parts profile</h2>
            <p className="mt-1 text-sm text-muted-foreground">This model uses the shared Relay body and hardware set. The component list page adds model-specific electronics when this voicing is selected.</p>
        </div>
        <Link href={`/relay/components?model=${voicingSlug}#electronics`} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-muted">
            <ShoppingBag className="h-4 w-4" />
            View shopping list
        </Link>
    </div>
</div>
```

- [ ] **Step 3: Replace old Lipstick BOM with canonical redirect copy**

Modify `content/relay/lipstick/bom.mdx` to this content:

```mdx
---
title: 'Supply List'
description: 'The Relay Lipstick supply list now lives in the shared Relay components page.'
---

The Relay shopping list now lives on the shared [Components](/relay/components?model=lipstick) page so common body hardware and model-specific electronics stay in one source of truth.

Use [Relay Lipstick components](/relay/components?model=lipstick#electronics) before ordering parts.
```

- [ ] **Step 4: Run focused tests**

Run: `npx vitest run lib/relay.test.ts lib/relay-components.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add config/relay-build-process.ts components/relay/relay-voicing-overview.tsx content/relay/lipstick/bom.mdx
git commit -m "Link Relay voicings to shared components"
```

---

### Task 5: Verification And Build

**Files:**
- Modify only files needed to fix test/build issues discovered in this task.

**Interfaces:**
- Consumes: all previous tasks
- Produces: verified implementation ready for review

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`

Expected: PASS.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: PASS with Vitest, Next build, and sitemap generation.

- [ ] **Step 3: Run whitespace check**

Run: `git diff --check`

Expected: no output.

- [ ] **Step 4: Manually inspect key URLs in dev**

Run: `npm run dev`

Open:

- `http://localhost:3000/relay/components`
- `http://localhost:3000/relay/components?model=lipstick#electronics`
- `http://localhost:3000/relay/voicings/lipstick`

Expected:

- `/relay/components` shows shared Body Construction and Guitar Hardware, shared Electronics, and model-selection guidance.
- `/relay/components?model=lipstick#electronics` has Relay Lipstick selected and shows Lipstick electronics.
- `/relay/voicings/lipstick` links to `/relay/components?model=lipstick#electronics`.

- [ ] **Step 5: Commit verification fixes if needed**

If verification required code changes, stage the exact files shown by `git status --short`:

```bash
git status --short
git add path/to/changed-file.ts path/to/changed-file.tsx
git commit -m "Fix Relay components verification issues"
```

If no changes were required, do not create an empty commit.

---

## Self-Review

Spec coverage:

- Canonical `/relay/components` route: Task 3.
- Three required categories: Tasks 1 and 2.
- Writer-editable component source of truth: Tasks 1 and 2.
- Model selector and deep links: Task 3.
- Model pages link instead of duplicating shopping lists: Task 4.
- Build pages remain procedural: Task 4 only changes the old BOM and voicing action; no assembly pages become shopping lists.
- Existing Lipstick BOM migration: Task 4.
- Tests for loader, model resolution, category order, and missing IDs: Task 1.
- Route/breadcrumb test support: Task 3.

Placeholder scan:

- The implementation plan contains no deferred implementation markers.
- Planned-model manifests intentionally use empty component arrays because only Relay Lipstick has released electronics data; the UI still represents that as no model-specific parts available for the current selection.

Type consistency:

- `RelayComponentRecord`, `RelayModelComponentManifest`, and `ResolvedRelayComponentList` are defined in Task 1 and used consistently in later tasks.
- Category names match the design exactly.
