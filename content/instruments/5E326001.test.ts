import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const source = readFileSync('content/instruments/5E326001.mdx', 'utf8');
describe('5E326001 amplifier record', () => {
    it('records the existing serial, verified completion, speaker and operating controls', () => {
        expect(source).toContain('publish: false');
        expect(source).toContain("kind: 'amplifier'");
        expect(source).toContain("completed: '2026-08-15'");
        expect(source).toContain('<AmplifierSpec>');
        for (const label of ['Normal 1', 'Normal 2', 'Bright 1', 'Bright 2', 'Normal Volume', 'Bright Volume', 'Tone', 'Standby', 'Power']) expect(source).toContain(`label="${label}"`);
        for (const value of ['approximately 12 watts', 'Electro-Harmonix', '75 watts', '8 ohms', '2A', 'speaker disconnected']) expect(source).toContain(value);
    });
    it('preserves exact-listing photo provenance and permanent-record boundaries', () => {
        expect(source).toContain('https://cdn.shopify.com/s/files/1/0663/5293/9165/files/D590ADBF-D3A6-4054-87F5-1A9C9DFC5F98.jpg');
        expect(source).toContain('Build Verification Record');
        expect(source).not.toMatch(/\$\d|for sale|checkout|shipping|return policy|asking price/i);
        expect(source).not.toMatch(/6V6|12AX7|5Y3|UL.certified|ETL.certified|B\+\s*[:=]/i);
        expect(source).not.toContain('<Pickup');
    });
});
