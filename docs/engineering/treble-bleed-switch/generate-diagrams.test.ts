import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error plain ES module without type declarations
import { generateAll, textExtentProblems } from './generate-diagrams.mjs';

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

    it('writes the builder reference sheet, its two print pages, and checks panels 3 and 6', async () => {
        const result = (await generateAll()) as { written: string[]; problems: string[]; checked: string[] };
        expect(result.problems).toEqual([]);
        const sheet = 'relay-treble-bleed-switch-rev-1.0';
        for (const label of ['panel 3 OFF', 'panel 6 DIRECT', 'panel 6 OFF', 'panel 6 REACTIVE']) expect(result.checked).toContain(`${sheet}: ${label}`);
        const base = join(process.cwd(), 'public/wiring-diagrams', sheet);
        const svgPath = join(process.cwd(), 'docs/engineering/treble-bleed-switch', `${sheet}.svg`);
        for (const file of [`${base}.png`, `${base}-page-a.png`, `${base}-page-b.png`, svgPath]) expect(result.written).toContain(file);
        const { default: sharp } = await import('sharp');
        expect((await sharp(`${base}.png`).metadata()).width).toBe(2400);
        for (const page of ['a', 'b']) {
            const { width, height } = await sharp(`${base}-page-${page}.png`).metadata();
            expect(width).toBe(2400);
            expect(height! / width!).toBeGreaterThan(1.2);
            expect(height! / width!).toBeLessThan(1.6);
        }
        const svg = readFileSync(svgPath, 'utf8');
        expect(svg).toContain('<title>Direct / Off / Reactive treble bleed</title>');
        expect(svg).toContain('Rev 1.0 • 2026-11-23');
        expect(svg).toContain('data-net');
        for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) expect(svg).toMatch(new RegExp(`>${n}\\. [A-Z]`));
        for (const m of svg.matchAll(/font-size="([\d.]+)"/g)) expect(Number(m[1])).toBeGreaterThanOrEqual(14);
        const labels = [...svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
        const row = (pot: string) => labels.slice(labels.indexOf(pot), labels.indexOf(pot) + 4);
        expect(row('500k')).toEqual(['500k', '150 kΩ', '1 nF', '22 nF']);
        expect(row('250k')).toEqual(['250k', '68 kΩ', '1 nF', '22 nF']);
        expect(row('1M')).toEqual(['1M', '330 kΩ', '1 nF', '22 nF']);
        for (const v of ['470–680 pF', '1.5–2.2 nF']) expect(svg).toContain(v);
        expect(labels.join(' ')).toContain('a common mini toggle needs 6 mm; measure yours first');
        expect(svg).not.toContain('switch I link');
    }, 120000);

    it('puts the exact meter reminder on the switch contact map', () => {
        expect(readFileSync(join(outDir, '14-switch-contacts.svg'), 'utf8')).toContain('confirm with a meter');
    });
});

describe('text extent check', () => {
    const svg = (body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 300" width="1200" height="300">${body}</svg>`;
    const line = (anchor: string, x: number, s: string) => `<text x="${x}" y="40" font-size="20" font-weight="400" text-anchor="${anchor}">${s}</text>`;

    it('flags a caption that runs past the right edge and one that starts left of the canvas', () => {
        const long = 'A caption that is much too long to fit in the width of this canvas and so it would be cut off at the edge. '.repeat(2);
        expect(textExtentProblems('t', svg(line('start', 40, long))).join('\n')).toMatch(/right edge/);
        expect(textExtentProblems('t', svg(line('middle', 10, 'Centered label that sticks out to the left'))).join('\n')).toMatch(/left edge/);
    });

    it('flags text that crosses the right edge of the panel frame that holds it', () => {
        const frame = '<rect x="20" y="10" width="200" height="200" rx="14" fill="#fff" stroke="#ccc"/>';
        expect(textExtentProblems('t', svg(frame + line('start', 30, 'This line is wider than its panel'))).join('\n')).toMatch(/panel/);
        expect(textExtentProblems('t', svg(frame + line('start', 30, 'Fits fine'))).join('\n')).toBe('');
    });
});
