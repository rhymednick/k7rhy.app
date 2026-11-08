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
        expect(source).toContain('Fender CuNiFe Stratocaster pickups');
        expect(source).toContain('Guyker locking tuners');
        expect(source).not.toMatch(/\bnew Fender/i);
        expect(source).toContain('directly from Fender');
        expect(source).toContain('poplar body');
        expect(source).toContain('maple neck');
        expect(source).toContain('black pickguard');
        expect(source).toContain('tremolo bridge');
        expect(source).toContain('It weighs 7 lb 2 oz (3.2 kg).');
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

    it('leads with the full-front photograph and ships every listed photograph', () => {
        const source = readFileSync(join(process.cwd(), 'content/instruments/STR26002.mdx'), 'utf8');
        const srcs = [...source.matchAll(/src: '([^']+)'/g)].map((m) => m[1]);
        expect(srcs[0]).toBe('/images/instruments/STR26002/front.jpg');
        expect(srcs.length).toBeGreaterThan(1);
        for (const src of srcs) {
            expect(src).toMatch(/^\/images\/instruments\/STR26002\/[a-z-]+\.jpg$/);
            expect(existsSync(join(process.cwd(), 'public', src))).toBe(true);
            const bytes = readFileSync(join(process.cwd(), 'public', src));
            expect(bytes.length).toBeLessThan(300_000);
            expect(bytes.includes(Buffer.from('Exif'))).toBe(false);
        }
        expect(source).not.toMatch(/coming-soon|photographs coming soon/i);
        expect(existsSync(join(process.cwd(), 'public/images/instruments/STR26002/coming-soon.svg'))).toBe(false);
    });
});
