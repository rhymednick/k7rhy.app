import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
const explainer = '/guitars/relay/customize/how-treble-bleeds-work';
const retrofit = '/guitars/relay/customize/direct-off-reactive-switch';
const phrase = 'alternative tone wiring that adds a switch';

describe('Relay customize cross-links', () => {
    it.each(['content/relay/components/items/treble-bleed.mdx', 'content/relay/wiring/lipstick.mdx', 'content/relay/wiring/torch.mdx', 'content/relay/wiring/velvet.mdx'])('%s links to the customize section', (path) => {
        expect(read(path)).toContain('/guitars/relay/customize/');
    });

    it('the Parts item links both pages', () => {
        const text = read('content/relay/components/items/treble-bleed.mdx');
        expect(text).toContain('/guitars/relay/customize/how-treble-bleeds-work');
        expect(text).toContain('/guitars/relay/customize/direct-off-reactive-switch');
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
});
