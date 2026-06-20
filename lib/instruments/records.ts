import { allInstruments } from 'content-collections';
import type { InstrumentRecord } from '@/types/instrument';
import { normalizeInstrumentSerial } from './serial';

export function getInstrument(serial: string): InstrumentRecord | undefined {
    const normalized = normalizeInstrumentSerial(serial);
    return allInstruments.find((instrument) => instrument.serial === normalized) as InstrumentRecord | undefined;
}

export function getInstrumentStaticParams(): Array<{ serial: string }> {
    return allInstruments.map((instrument) => ({ serial: instrument.serial }));
}

export function isInstrumentPublished(record: InstrumentRecord): boolean {
    return process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production' || record.publish;
}
