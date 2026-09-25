import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('STR26002 owner record', () => {
    it('presents a standalone instrument and its controls', () => {
        const source = readFileSync(join(process.cwd(), 'content/instruments/STR26002.mdx'), 'utf8');
        expect(source).toContain('publish: true');
        expect(source).toContain("name: 'CuNiFe S-Type'");
        expect(source).toContain("completed: '2026-09-24'");
        expect(source).toContain("dateLabel: 'Built'");
        expect(source).not.toMatch(/^started:/m);
        expect(source).toContain("origin: 'Built by Rhy Mednick in Coupeville, Washington.'");
        expect(source).toContain("src: '/images/instruments/STR26002/coming-soon.svg'");
        expect(source).toContain("alt: 'CuNiFe S-Type photographs coming soon'");
        expect(source).toContain('Fender CuNiFe Stratocaster pickups');
        expect(source).toContain('Guyker locking tuners');
        expect(source).not.toMatch(/\bnew Fender/i);
        expect(source).toContain('directly from Fender');
        expect(source).toContain('poplar body');
        expect(source).toContain('maple neck');
        expect(source).toContain('black pickguard');
        expect(source).toContain('A250K audio-taper master volume');
        expect(source).toContain('A500K audio-taper master tone');
        expect(source).toContain('0.022 µF capacitor');
        expect(source).toContain('1,200 pF capacitor');
        expect(source).toContain('150 kΩ resistor');
        expect(source).toContain('20 kΩ resistor');
        expect(source).toContain('standard five-way');
        expect(source).toContain('SPST on-off');
        expect(source.match(/in every pickup setting/g)).toHaveLength(1);
        const body = source.split('---')[2];
        const [playerCopy, technicalCopy] = body.split('## Electronics');
        expect(playerCopy).not.toMatch(/A250K|A500K|0\.022|1,200 pF|150 kΩ|20 kΩ/);
        expect(technicalCopy).toContain('1,200 pF capacitor');
        expect(body).toContain('[Open the wiring reference](/sn/STR26002/wiring)');
        expect(body.replace(/\]\([^)]+\)/g, ']')).not.toMatch(/STR26002|CuNiFe S-Type 2|second of two|purchased parts/i);
        expect(source).toContain('<InstrumentSpec>');
        expect(source.match(/<Pickup position=/g)).toHaveLength(3);
        expect(source).toContain('brand="Fender" model="CuNiFe Stratocaster"');
        expect(source).toContain('<Selector label="Pickup selector" positions={5}>');
        expect(source).toContain('<Toggle label="Neck-add switch" type="SPST mini toggle">');
        expect(source).not.toMatch(/in.progress|planned|pending|under review|unfinished/i);
    });

    it('shows a coming-soon placeholder until photographs are added', () => {
        const path = join(process.cwd(), 'public/images/instruments/STR26002/coming-soon.svg');
        expect(existsSync(path)).toBe(true);
        const svg = readFileSync(path, 'utf8');
        expect(svg).toMatch(/photos coming soon/i);
        expect(svg).not.toContain('STR26002');
        expect(existsSync(join(process.cwd(), 'public/images/instruments/STR26002/placeholder.svg'))).toBe(false);
    });
});
