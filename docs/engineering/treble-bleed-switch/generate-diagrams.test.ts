import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error plain ES module without type declarations
import { generateAll } from './generate-diagrams.mjs';

const names = ['05-stock-volume', '06-capacitor-bleed', '07-bleed-variants', '09-reactive-bleed', '10-three-modes', '11-before', '12-after'];
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
    }, 120000);
});
