import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
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

    it.each(['content/relay/wiring/lipstick.mdx', 'content/relay/wiring/torch.mdx', 'content/relay/wiring/velvet.mdx'])('%s names the alternative tone wiring', (path) => {
        expect(read(path)).toContain(phrase);
    });

    it.each(['content/relay/wiring/torch.mdx', 'content/relay/wiring/velvet.mdx'])('%s links both pages near the no-bleed statement', (path) => {
        const text = read(path);
        expect(text).toContain('/guitars/relay/customize/how-treble-bleeds-work');
        expect(text).toContain('/guitars/relay/customize/direct-off-reactive-switch');
    });
});
