import { describe, expect, it } from 'vitest';
// @ts-expect-error plain ES module without type declarations
import { runChecks } from './check-netlist.mjs';

describe('switchable treble bleed netlist', () => {
    it('passes every netlist check', () => {
        const { checks, failures } = runChecks() as { checks: number; failures: string[] };
        expect(failures).toEqual([]);
        expect(checks).toBeGreaterThan(20);
    });
});
