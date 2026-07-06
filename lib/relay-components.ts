import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { relayComponentCategories, type RelayComponentCategory, type RelayComponentRecord, type RelayModelComponentManifest, type ResolvedRelayComponentList } from '@/types/relay-components';
import { relayVoicings } from '@/config/relay-voicings';

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

/** Voicing slugs (registry order) that have at least one model-specific component defined. */
export function listVoicingsWithParts(): string[] {
    return relayVoicings
        .map((voicing) => voicing.slug)
        .filter((slug) => {
            try {
                return loadRelayModelManifest(slug).components.length > 0;
            } catch {
                return false;
            }
        });
}
