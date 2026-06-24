import { describe, expect, it } from 'vitest';
import { formatInstrumentDate, instrumentDateLabel } from './date';

describe('instrument date presentation', () => {
    it('renders year-only records without inventing a month or day', () => {
        expect(formatInstrumentDate('2026')).toBe('2026');
    });

    it('preserves the existing long-date presentation', () => {
        expect(formatInstrumentDate('2026-06-19')).toBe('June 19, 2026');
    });

    it('defaults to Completed and accepts a custom record label', () => {
        expect(instrumentDateLabel()).toBe('Completed');
        expect(instrumentDateLabel('Modified')).toBe('Modified');
    });
});
