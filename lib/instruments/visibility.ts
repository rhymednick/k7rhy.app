import type { InstrumentRecord } from '@/types/instrument';

export function isInstrumentPublished(record: InstrumentRecord, environment = process.env.NODE_ENV): boolean {
    return environment !== 'production' || record.publish;
}
