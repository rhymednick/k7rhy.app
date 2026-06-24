import { describe, expect, it } from 'vitest';
import type { InstrumentRecord } from '@/types/instrument';
import { isInstrumentPublished } from './visibility';

const record = { publish: false } as InstrumentRecord;

describe('isInstrumentPublished', () => {
    it('hides an unpublished record in production', () => {
        expect(isInstrumentPublished(record, 'production')).toBe(false);
    });

    it('shows an unpublished record during development', () => {
        expect(isInstrumentPublished(record, 'development')).toBe(true);
    });

    it('shows a published record in production', () => {
        expect(isInstrumentPublished({ ...record, publish: true }, 'production')).toBe(true);
    });
});
