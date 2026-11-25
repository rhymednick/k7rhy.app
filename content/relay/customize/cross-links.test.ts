import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
const explainer = '/guitars/relay/customize/treble-bleed/understand/why-turning-down-dulls';
const retrofit = '/guitars/relay/customize/treble-bleed/build/is-it-a-fit';
// Built from pieces so this file does not match itself. The two pages these addressed were split into series before merge.
const retiredTokens = [['customize/', 'how-treble-bleeds-work'].join(''), ['customize/', 'direct-off-reactive-switch'].join('')];
const phrase = 'alternative tone wiring that adds a switch';

describe('Relay customize cross-links', () => {
    it.each(['content/relay/components/items/treble-bleed.mdx', 'content/relay/wiring/lipstick.mdx', 'content/relay/wiring/torch.mdx', 'content/relay/wiring/velvet.mdx'])('%s links to the customize section', (path) => {
        expect(read(path)).toContain('/guitars/relay/customize/');
    });

    it('the Parts item links the first part of each series', () => {
        const text = read('content/relay/components/items/treble-bleed.mdx');
        expect(text).toContain(explainer);
        expect(text).toContain(retrofit);
    });

    it('the Parts item and Lipstick say plainly what each link is for', () => {
        const item = read('content/relay/components/items/treble-bleed.mdx');
        expect(item).not.toMatch(/explained in \[how treble bleeds work\]/i);
        expect(item).toContain('for an optional switch that changes how the bleed behaves');
        const lipstick = read('content/relay/wiring/lipstick.mdx');
        expect(lipstick).not.toContain('covers the bleed side');
        expect(lipstick.split(phrase).length - 1).toBe(1);
    });

    // Each file may link the explainer and the retrofit guide in one sentence, so assert each link appears exactly once.
    it.each(['content/relay/components/items/treble-bleed.mdx', 'content/relay/wiring/lipstick.mdx', 'content/relay/wiring/torch.mdx', 'content/relay/wiring/velvet.mdx'])('%s links the retrofit guide exactly once', (path) => {
        expect(read(path).split(retrofit).length - 1).toBe(1);
    });

    it.each(['content/relay/wiring/lipstick.mdx', 'content/relay/wiring/torch.mdx', 'content/relay/wiring/velvet.mdx'])('%s names the alternative tone wiring', (path) => {
        expect(read(path)).toContain(phrase);
    });

    it.each(['content/relay/wiring/torch.mdx', 'content/relay/wiring/velvet.mdx'])('%s links both pages after the no-bleed clause', (path) => {
        const text = read(path);
        const bleed = text.indexOf('without a treble bleed');
        expect(bleed).toBeGreaterThan(-1);
        expect(text.split(explainer).length - 1).toBe(1);
        expect(text.indexOf(phrase)).toBeGreaterThan(bleed);
        expect(text.indexOf(explainer)).toBeGreaterThan(bleed);
        expect(text.indexOf(retrofit)).toBeGreaterThan(bleed);
    });

    it('no content, engineering doc or script still links a retired two-page URL', () => {
        const files: string[] = [];
        const walk = (dir: string) => {
            for (const entry of readdirSync(join(process.cwd(), dir), { withFileTypes: true })) {
                const rel = join(dir, entry.name);
                if (entry.isDirectory()) walk(rel);
                else if (/\.(md|mdx|ts|tsx|mjs|json)$/.test(entry.name)) files.push(rel);
            }
        };
        for (const dir of ['content', 'docs/engineering', 'scripts/typesafe', 'config', 'components', 'app']) walk(dir);
        const hits = files.filter((file) => retiredTokens.some((token) => read(file).includes(token)));
        expect(hits).toEqual([]);
    });
});
