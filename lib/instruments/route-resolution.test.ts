import { describe, expect, it } from 'vitest';
import type { InstrumentRecord } from '@/types/instrument';
import { resolveInstrumentRequest } from './route-resolution';

const unpublished = { serial: 'RLY26001', publish: false } as InstrumentRecord;
const lookup = (serial: string) => (serial === 'RLY26001' ? unpublished : undefined);

describe('resolveInstrumentRequest', () => {
    it('redirects lowercase serials', () => {
        expect(resolveInstrumentRequest('rly26001', 'development', lookup)).toEqual({ kind: 'redirect', location: '/sn/RLY26001' });
    });

    it('returns not-found for an unknown serial', () => {
        expect(resolveInstrumentRequest('RLY26999', 'development', lookup)).toEqual({ kind: 'not-found' });
    });

    it('returns not-found for an unpublished production record', () => {
        expect(resolveInstrumentRequest('RLY26001', 'production', lookup)).toEqual({ kind: 'not-found' });
    });

    it('returns the record outside production', () => {
        expect(resolveInstrumentRequest('RLY26001', 'development', lookup)).toEqual({ kind: 'record', record: unpublished });
    });
});
