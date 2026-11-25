import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { getRelayCustomizePart, relayCustomize } from './relay-customize';

const base = '/guitars/relay/customize/treble-bleed';

describe('relayCustomize', () => {
    it('links the landing page and holds the Treble bleed topic', () => {
        expect(relayCustomize.title).toBe('Customize');
        expect(relayCustomize.href).toBe('/guitars/relay/customize');
        expect(relayCustomize.topic).toEqual({ slug: 'treble-bleed', title: 'Treble bleed' });
    });

    it('has an Understand series of three parts and a Build series of five', () => {
        expect(relayCustomize.series.map((s) => [s.slug, s.parts.length])).toEqual([
            ['understand', 3],
            ['build', 5],
        ]);
        expect(relayCustomize.series.find((s) => s.slug === 'understand')!.parts.map((p) => p.slug)).toEqual(['why-turning-down-dulls', 'what-a-bleed-does', 'the-reactive-bleed']);
        expect(relayCustomize.series.find((s) => s.slug === 'build')!.parts.map((p) => p.slug)).toEqual(['is-it-a-fit', 'parts-and-hole', 'what-changes-and-lugs', 'wire-it-and-check', 'reference-and-troubleshooting']);
    });

    it('gives every part an href that matches its series and slug', () => {
        for (const series of relayCustomize.series) {
            for (const part of series.parts) {
                expect(part.href).toBe(`${base}/${series.slug}/${part.slug}`);
            }
        }
    });

    it('has a content file for every part', () => {
        for (const series of relayCustomize.series) {
            for (const part of series.parts) {
                expect(fs.existsSync(path.join(process.cwd(), 'content', 'relay', 'customize', 'treble-bleed', series.slug, `${part.slug}.mdx`)), `${series.slug}/${part.slug}.mdx should exist`).toBe(true);
            }
        }
    });
});

describe('getRelayCustomizePart', () => {
    it('returns the part with its place in the series', () => {
        const found = getRelayCustomizePart('build', 'parts-and-hole');
        expect(found).toBeDefined();
        expect(found!.series.slug).toBe('build');
        expect(found!.part.title).toBe('Parts, values and the hole');
        expect(found!.index).toBe(1);
        expect(found!.total).toBe(5);
        expect(found!.prev).toEqual({ title: 'Is your guitar a fit?', href: `${base}/build/is-it-a-fit` });
        expect(found!.next).toEqual({ title: 'What changes and finding your lugs', href: `${base}/build/what-changes-and-lugs` });
    });

    it('has no previous link on the first Understand part', () => {
        const found = getRelayCustomizePart('understand', 'why-turning-down-dulls')!;
        expect(found.prev).toBeUndefined();
        expect(found.next).toEqual({ title: 'What a bleed does', href: `${base}/understand/what-a-bleed-does` });
    });

    it('leads from the last Understand part into the first Build part, and back', () => {
        const last = getRelayCustomizePart('understand', 'the-reactive-bleed')!;
        expect(last.next).toEqual({ title: 'Build: Is your guitar a fit?', href: `${base}/build/is-it-a-fit` });
        const first = getRelayCustomizePart('build', 'is-it-a-fit')!;
        expect(first.prev).toEqual({ title: 'Understand: The reactive bleed', href: `${base}/understand/the-reactive-bleed` });
    });

    it('has no next link on the last Build part', () => {
        const found = getRelayCustomizePart('build', 'reference-and-troubleshooting')!;
        expect(found.next).toBeUndefined();
        expect(found.index).toBe(4);
    });

    it('returns undefined for an unknown series or part', () => {
        expect(getRelayCustomizePart('nope', 'is-it-a-fit')).toBeUndefined();
        expect(getRelayCustomizePart('build', 'nope')).toBeUndefined();
    });
});
