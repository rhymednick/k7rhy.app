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

    it('writes the builder reference sheet as a 2400 px PNG and a source SVG with large type', async () => {
        const png = join(process.cwd(), 'public/wiring-diagrams/relay-treble-bleed-switch-rev-1.0.png');
        const svgPath = join(process.cwd(), 'docs/engineering/treble-bleed-switch/relay-treble-bleed-switch-rev-1.0.svg');
        expect(existsSync(png)).toBe(true);
        expect(existsSync(svgPath)).toBe(true);
        const { default: sharp } = await import('sharp');
        expect((await sharp(png).metadata()).width).toBe(2400);
        const svg = readFileSync(svgPath, 'utf8');
        expect(svg).toContain('<title>Direct / Off / Reactive treble bleed</title>');
        expect(svg).toContain('Rev 1.0 • 2026-11-23');
        expect(svg).toContain('data-net');
        for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) expect(svg).toMatch(new RegExp(`>${n}\\. [A-Z]`));
        for (const m of svg.matchAll(/font-size="([\d.]+)"/g)) expect(Number(m[1])).toBeGreaterThanOrEqual(14);
        for (const v of ['150 kΩ', '68 kΩ', '330 kΩ', '22 nF', '470–680 pF', '1.5–2.2 nF', '6 mm']) expect(svg).toContain(v);
    });

    it('puts the exact meter reminder on the switch contact map', () => {
        expect(readFileSync(join(outDir, '14-switch-contacts.svg'), 'utf8')).toContain('confirm with a meter');
    });
});
