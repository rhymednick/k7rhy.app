import { describe, expect, it } from 'vitest';
import { instrumentPath, instrumentUrl, normalizeInstrumentSerial, parseInstrumentSerial } from './serial';

describe('instrument serials', () => {
    it('parses a Relay example serial without consuming the production Relay namespace', () => {
        expect(parseInstrumentSerial('REX26001')).toEqual({
            serial: 'REX26001',
            modelCode: 'REX',
            modelDescription: 'Relay Example',
            year: 2026,
            index: 1,
        });
    });

    it('parses the first year-scoped Coupeville family serial', () => {
        expect(parseInstrumentSerial('CVL26001')).toEqual({
            serial: 'CVL26001',
            modelCode: 'CVL',
            modelDescription: 'Coupeville',
            year: 2026,
            index: 1,
        });
    });

    it('normalizes lowercase input before routing', () => {
        expect(normalizeInstrumentSerial('rex26001')).toBe('REX26001');
    });

    it.each(['RLY-26001', 'RLY2601', 'R1Y26001', 'RLY26ABC'])('rejects malformed serial %s', (serial) => {
        expect(() => parseInstrumentSerial(serial)).toThrow(`Invalid instrument serial: ${serial}`);
    });

    it('rejects an unknown model code', () => {
        expect(() => parseInstrumentSerial('ZZZ26001')).toThrow('Unknown instrument model code: ZZZ');
        expect(() => parseInstrumentSerial('CPC26001')).toThrow('Unknown instrument model code: CPC');
    });

    it('reserves the Relay production namespace', () => {
        expect(parseInstrumentSerial('RLY26001').modelDescription).toBe('Relay');
    });

    it('builds canonical paths and production URLs', () => {
        expect(instrumentPath('rex26001')).toBe('/sn/REX26001');
        expect(instrumentUrl('REX26001')).toBe('https://k7rhy.app/sn/REX26001');
    });
});
