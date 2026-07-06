import { describe, expect, it } from 'vitest';
import { groupRelayComponentsByCategory, listVoicingsWithParts, loadRelayComponentCatalog, loadRelayModelManifest, resolveRelayComponentList } from '@/lib/relay-components';

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

    it('resolves a complete electronics list for every released voicing', () => {
        for (const voicing of ['lipstick', 'velvet', 'torch', 'arc']) {
            const list = resolveRelayComponentList(voicing);
            const electronics = list.components.filter((item) => item.category === 'Electronics' && item.scope === 'model');

            expect(electronics.length, `${voicing} should list model electronics`).toBeGreaterThanOrEqual(5);
            const titles = electronics.map((item) => item.title.toLowerCase()).join(' | ');
            expect(titles, `${voicing} should include pickups`).toMatch(/pickup|humbucker|p90|filtertron|retrotron|lipstick/);
        }
    });

    it('gives the 5-way voicings their pots and selector', () => {
        for (const voicing of ['velvet', 'torch', 'arc']) {
            const ids = resolveRelayComponentList(voicing).components.map((item) => item.id);

            expect(ids, `${voicing} volume pot`).toContain('volume-pot-500k');
            expect(ids, `${voicing} tone pot`).toContain('tone-pot-500k-push-pull');
            expect(ids, `${voicing} selector`).toContain('selector-switch-5way');
            expect(ids, `${voicing} tone capacitor`).toContain('tone-capacitor');
        }
    });
});

describe('groupRelayComponentsByCategory', () => {
    it('returns all categories in display order', () => {
        const grouped = groupRelayComponentsByCategory(resolveRelayComponentList('lipstick').components);

        expect(Object.keys(grouped)).toEqual(['Body Construction', 'Guitar Hardware', 'Electronics']);
    });
});

describe('listVoicingsWithParts', () => {
    it('returns only voicings with a non-empty manifest, in registry order, Lipstick first', () => {
        expect(listVoicingsWithParts()).toEqual(['lipstick', 'velvet', 'arc', 'torch']);
    });
});
