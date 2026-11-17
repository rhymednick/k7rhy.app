import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const source = readFileSync('content/instruments/5E326001.mdx', 'utf8');
describe('5E326001 amplifier record', () => {
    it('records the existing serial, verified completion, speaker and operating controls', () => {
        expect(source).toContain('publish: true');
        expect(source).toContain("kind: 'amplifier'");
        expect(source).toContain("completed: '2026-08-15'");
        expect(source).toContain('<AmplifierSpec>');
        for (const label of ['Normal 1', 'Normal 2', 'Bright 1', 'Bright 2', 'Normal Volume', 'Bright Volume', 'Tone', 'Standby', 'Power']) expect(source).toContain(`label="${label}"`);
        for (const value of ['approximately 12 watts', 'Electro-Harmonix', '75 watts', '8 ohms', '2A', 'speaker disconnected']) expect(source).toContain(value);
    });
    it('attributes the supplied inspection sheet and preserves its device and measurement values', () => {
        for (const value of ['K7RHY-BVR-5E3-R1', '12AX7 / ECC83S', '6V6GT pair', '5Y3GT', '120 VAC, 60 Hz', '116 VAC', '0.05 ohms', '0.003 VAC / 0 VDC', 'L open / N open']) expect(source).toContain(value);
        expect(source).toContain('not measurements taken for this web page');
        expect(source).not.toMatch(/T2A|F2A|250V|6V6S|Sovtek|Tung-Sol/);
    });
    it('preserves exact-listing photo provenance and permanent-record boundaries', () => {
        for (const name of ['front', 'controls', 'chassis-interior', 'build-verification-page-1']) expect(source).toContain(`/images/instruments/5E326001/${name}.jpg`);
        expect(source).toContain('Build Verification Record');
        expect(source).not.toMatch(/\$\d|for sale|checkout|shipping|return policy|asking price/i);
        expect(source).not.toMatch(/UL.certified|ETL.certified|B\+\s*[:=]/i);
        expect(source).not.toContain('<Pickup');
    });
});
