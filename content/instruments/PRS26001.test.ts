import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const path = join(process.cwd(), 'content/instruments/PRS26001.mdx');

describe('PRS26001 permanent record', () => {
    it('documents identity, installed hardware, voices, and intended musical work', () => {
        const source = readFileSync(path, 'utf8');

        expect(source).toContain("completed: '2026'");
        expect(source).toContain("dateLabel: 'Modified'");
        expect(source).toContain('Seymour Duncan');
        expect(source).toContain('APH-1b Alnico II Pro');
        expect(source).toContain('APH-1n Alnico II Pro');
        expect(source).toContain('PRS locking tuners');
        expect(source).toContain('As part of the K7RHY rework, the original tuners were replaced with PRS locking tuners.');
        expect(source).toContain('<Selector label="Pickup selector" positions={5}>');
        expect(source).toContain('blues, funk, soul, folk, jazz, and yacht rock');
        expect(source).toContain('platform-reference instrument');
    });

    it('records the measured switching and links the wiring reference', () => {
        const source = readFileSync(path, 'utf8');

        expect(source).toContain('four-pole five-way super switch');
        expect(source).toContain('1.8 kΩ');
        expect(source).toContain('180 pF treble-bleed');
        expect(source).toContain('voice="Tone bypass"');
        expect(source).not.toMatch(/parallel|inside coil|eight voices/i);
        expect(source).toContain('(/sn/PRS26001/wiring)');
    });

    it('contains no sale, condition, or personal-owner narrative', () => {
        const source = readFileSync(path, 'utf8').toLowerCase();

        for (const forbidden of ['price', 'asking', 'for sale', 'buy now', 'excellent condition', 'visible marks', 'personal favorite', "paul's guitar", 'reversible']) {
            expect(source).not.toContain(forbidden);
        }
    });
});
