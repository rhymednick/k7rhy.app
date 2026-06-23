import { describe, expect, it } from 'vitest';
import { instrumentPath, instrumentUrl, normalizeInstrumentSerial, parseInstrumentSerial } from './serial';

describe('instrument serials', () => {
    it('parses a known MMMYYNNN serial', () => {
        expect(parseInstrumentSerial('RLY26001')).toEqual({
            serial: 'RLY26001',
            modelCode: 'RLY',
            modelDescription: 'Relay',
            year: 2026,
            index: 1,
        });
    });

    it('normalizes lowercase input before routing', () => {
        expect(normalizeInstrumentSerial('rly26001')).toBe('RLY26001');
    });

    it.each(['RLY-26001', 'RLY2601', 'R1Y26001', 'RLY26ABC'])('rejects malformed serial %s', (serial) => {
        expect(() => parseInstrumentSerial(serial)).toThrow(`Invalid instrument serial: ${serial}`);
    });

    it('rejects an unknown model code', () => {
        expect(() => parseInstrumentSerial('ZZZ26001')).toThrow('Unknown instrument model code: ZZZ');
    });

    it('builds canonical paths and production URLs', () => {
        expect(instrumentPath('rly26001')).toBe('/sn/RLY26001');
        expect(instrumentUrl('RLY26001')).toBe('https://k7rhy.app/sn/RLY26001');
    });
});
