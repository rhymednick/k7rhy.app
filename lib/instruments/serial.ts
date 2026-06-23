import { INSTRUMENT_MODEL_CODES } from '@/config/instrument-model-codes';
import type { InstrumentSerial } from '@/types/instrument';

const SERIAL_PATTERN = /^([A-Z]{3})(\d{2})(\d{3})$/;

export function normalizeInstrumentSerial(input: string): string {
    return input.trim().toUpperCase();
}

export function parseInstrumentSerial(input: string): InstrumentSerial {
    const serial = normalizeInstrumentSerial(input);
    const match = SERIAL_PATTERN.exec(serial);

    if (!match) {
        throw new Error(`Invalid instrument serial: ${input}`);
    }

    const [, modelCode, yearPart, indexPart] = match;
    const modelDescription = INSTRUMENT_MODEL_CODES[modelCode];

    if (!modelDescription) {
        throw new Error(`Unknown instrument model code: ${modelCode}`);
    }

    return {
        serial,
        modelCode,
        modelDescription,
        year: 2000 + Number(yearPart),
        index: Number(indexPart),
    };
}

export function instrumentPath(serial: string): string {
    return `/sn/${parseInstrumentSerial(serial).serial}`;
}

export function instrumentUrl(serial: string): string {
    return `https://k7rhy.app${instrumentPath(serial)}`;
}
