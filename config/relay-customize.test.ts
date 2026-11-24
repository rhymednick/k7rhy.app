import { describe, expect, it } from 'vitest';
import { relayCustomize } from './relay-customize';

describe('relayCustomize', () => {
    it('links the landing page and both pages under /guitars/relay/customize', () => {
        expect(relayCustomize.title).toBe('Customize');
        expect(relayCustomize.href).toBe('/guitars/relay/customize');
        expect(relayCustomize.pages.map((p) => p.slug)).toEqual(['how-treble-bleeds-work', 'direct-off-reactive-switch']);
    });

    it('gives every page an href that matches its slug', () => {
        for (const page of relayCustomize.pages) {
            expect(page.href).toBe(`/guitars/relay/customize/${page.slug}`);
        }
    });
});
