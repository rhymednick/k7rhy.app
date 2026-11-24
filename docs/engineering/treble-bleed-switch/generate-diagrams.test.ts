import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error plain ES module without type declarations
import { generateAll } from './generate-diagrams.mjs';

const names = ['05-stock-volume', '06-capacitor-bleed', '07-bleed-variants', '09-reactive-bleed', '10-three-modes', '11-before', '12-after'];
const conceptNames = ['01-signal-chain', '02-volume-pot', '03-pot-and-cable', '04-brightness-sketch', '08-tone-pot', '13-pot-lugs', '14-switch-contacts'];
const outDir = join(process.cwd(), 'public/circuits/treble-bleed');

describe('treble bleed explainer schematics', () => {
    it('writes every drawing as SVG and PNG, with a title and net tags, and reports no problems', async () => {
        const result = (await generateAll()) as { written: string[]; problems: string[] };
        expect(result.problems).toEqual([]);
        for (const name of names) {
            expect(existsSync(join(outDir, `${name}.png`))).toBe(true);
            const svg = readFileSync(join(outDir, `${name}.svg`), 'utf8');
            expect(svg).toMatch(/<title>[^<]+<\/title>/);
            expect(svg).toContain('data-net');
        }
        for (const name of conceptNames) {
            expect(existsSync(join(outDir, `${name}.png`))).toBe(true);
            const svg = readFileSync(join(outDir, `${name}.svg`), 'utf8');
            expect(svg).toMatch(/<title>[^<]+<\/title>/);
        }
    }, 120000);

    it('draws the brightness sketch as an illustration with no numbers on it', () => {
        const svg = readFileSync(join(outDir, '04-brightness-sketch.svg'), 'utf8');
        expect(svg).toContain('Illustration, not a measurement');
        const labels = [...svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
        expect(labels.length).toBeGreaterThan(5);
        for (const label of labels) expect(label).not.toMatch(/\d/);
    });

    it('puts the exact meter reminder on the switch contact map', () => {
        expect(readFileSync(join(outDir, '14-switch-contacts.svg'), 'utf8')).toContain('confirm with a meter');
    });
});
