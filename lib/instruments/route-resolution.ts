import type { InstrumentRecord } from '@/types/instrument';
import { normalizeInstrumentSerial } from './serial';

export type InstrumentRecordLookup = (serial: string) => InstrumentRecord | undefined;

export type InstrumentRequestResolution =
    | { kind: 'redirect'; location: string }
    | { kind: 'not-found' }
    | { kind: 'record'; record: InstrumentRecord };

export function resolveInstrumentRequest(input: string, environment: string | undefined, lookup: InstrumentRecordLookup): InstrumentRequestResolution {
    const serial = normalizeInstrumentSerial(input);

    if (input !== serial) return { kind: 'redirect', location: `/sn/${serial}` };

    const record = lookup(serial);
    if (!record || (environment === 'production' && !record.publish)) return { kind: 'not-found' };

    return { kind: 'record', record };
}
