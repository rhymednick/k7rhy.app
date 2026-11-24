import fs from 'fs';
import path from 'path';
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

    it('has a content file for every page', () => {
        for (const page of relayCustomize.pages) {
            expect(fs.existsSync(path.join(process.cwd(), 'content', 'relay', 'customize', `${page.slug}.mdx`)), `${page.slug}.mdx should exist`).toBe(true);
        }
    });
});
