import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('STR26001 owner record', () => {
    it('presents a standalone instrument and its controls', () => {
        const source = readFileSync(join(process.cwd(), 'content/instruments/STR26001.mdx'), 'utf8');
        expect(source).toContain('publish: false');
        expect(source).toContain("name: 'CuNiFe S-Type'");
        expect(source).toContain("completed: '2026-09-24'");
        expect(source).toContain("dateLabel: 'Built'");
        expect(source).not.toMatch(/^started:/m);
        expect(source).toContain("origin: 'Built by Rhy Mednick in Coupeville, Washington.'");
        expect(source).toContain("src: '/images/instruments/STR26001/placeholder.svg'");
        expect(source).toContain('Fender CuNiFe Stratocaster pickups');
        expect(source).toContain('Guyker locking tuners');
        expect(source).not.toMatch(/\bnew Fender/i);
        expect(source).toContain('directly from Fender');
        expect(source).toContain('poplar body');
        expect(source).toContain('maple neck');
        expect(source).toContain('bamboo pickguard');
        expect(source).toContain('A250K audio-taper master volume');
        expect(source).toContain('A500K audio-taper master tone');
        expect(source).toContain('0.022 µF capacitor');
        expect(source).toContain('1,200 pF capacitor');
        expect(source).toContain('150 kΩ resistor');
        expect(source).toContain('20 kΩ resistor');
        expect(source).toContain('four-pole five-way super switch');
        expect(source).toContain('DPDT on-on');
        expect(source.match(/in every pickup setting/g)).toHaveLength(1);
        expect(source).not.toContain('in either mode');
        const body = source.split('---')[2];
        const [playerCopy, technicalCopy] = body.split('## Electronics');
        expect(playerCopy).not.toMatch(/A250K|A500K|0\.022|1,200 pF|150 kΩ|20 kΩ/);
        expect(technicalCopy).toContain('1,200 pF capacitor');
        expect(body).toContain('[Open the wiring reference](/sn/STR26001/wiring)');
        expect(body.replace(/\]\([^)]+\)/g, ']')).not.toMatch(/STR26001|CuNiFe S-Type 1|first of two|purchased parts|bamboo-like/i);
        expect(source).toContain('<InstrumentSpec>');
        expect(source.match(/<Pickup position=/g)).toHaveLength(3);
        expect(source).toContain('brand="Fender" model="CuNiFe Stratocaster"');
        expect(source).toContain('<Selector label="Pickup selector" positions={5}>');
        expect(source).toContain('<Toggle label="Series switch" type="DPDT mini toggle">');
        expect(source).toContain('hum-canceling');
        expect(source).not.toMatch(/in.progress|planned|pending|under review|unfinished/i);
    });

    it('marks its image as an illustration', () => {
        const path = join(process.cwd(), 'public/images/instruments/STR26001/placeholder.svg');
        expect(existsSync(path)).toBe(true);
        expect(readFileSync(path, 'utf8')).toContain('Specification illustration');
    });
});
