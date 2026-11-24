import { describe, expect, it } from 'vitest';
import { runChecks } from './check-netlist.mjs';

describe('switchable treble bleed netlist', () => {
    it('passes every netlist check', () => {
        const { checks, failures } = runChecks() as { checks: number; failures: string[] };
        expect(failures).toEqual([]);
        expect(checks).toBeGreaterThan(20);
    });
});
