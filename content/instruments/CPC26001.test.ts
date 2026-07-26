import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const recordPath = join(process.cwd(), 'content/instruments/CPC26001.mdx');
const placeholderPath = join(process.cwd(), 'public/images/instruments/CPC26001/placeholder.svg');

describe('CPC26001 permanent customer record', () => {
    it('documents the published identity and installed production specification', () => {
        const source = readFileSync(recordPath, 'utf8');

        for (const required of ['publish: true', "name: 'Coupeville Current'", "completed: '2026'", "src: '/images/instruments/CPC26001/placeholder.svg'", 'position="neck" type="humbucker" brand="GFS" model="Vintage 59 Humbucker"', 'position="middle" type="filtertron" brand="GFS" model="Retrotron Hot Nashville"', 'position="bridge" type="humbucker" brand="GFS" model="Professional Series Alnico V HOT Humbucker"', '<Selector label="Pickup selector" positions={3}>', 'voice="Neck"', 'voice="Neck + Bridge"', 'voice="Bridge"', 'A500K Audio', '22 nF', '680 pF', '150 kΩ', 'wired in parallel across the master-volume input and output', '<HarmonicShaper>', 'Direct connection', '47 kΩ series resistor', '100 kΩ series resistor', 'approximately 330 pF capacitor', '220 kΩ series resistor', 'approximately 680 pF capacitor', 'Middle pickup disconnected']) {
            expect(source).toContain(required);
        }
    });

    it('uses a clearly labeled non-photographic placeholder', () => {
        expect(existsSync(placeholderPath)).toBe(true);
        const placeholder = readFileSync(placeholderPath, 'utf8');
        expect(placeholder).toContain('Coupeville Current');
        expect(placeholder).toContain('Image placeholder');
        expect(placeholder).toContain('Exact instrument photography will replace this image.');
    });
});
