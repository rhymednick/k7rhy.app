import { describe, expect, it } from 'vitest';
import { HarmonicShaper, PositionControl, PositionControlPosition } from './instrument-position-control';
import { PrintHarmonicShaper, PrintPositionControl, PrintPositionControlPosition } from './instrument-print-position-control';
import { instrumentMdxComponents, instrumentPrintMdxComponents } from './instrument-mdx-components';

describe('instrument MDX component maps', () => {
    it('uses a dedicated component family for the printable case card', () => {
        expect(instrumentPrintMdxComponents.InstrumentSpec).not.toBe(instrumentMdxComponents.InstrumentSpec);
        expect(instrumentPrintMdxComponents.Pickup).not.toBe(instrumentMdxComponents.Pickup);
        expect(instrumentPrintMdxComponents.Selector).not.toBe(instrumentMdxComponents.Selector);
        expect(instrumentMdxComponents.PositionControl).toBe(PositionControl);
        expect(instrumentMdxComponents.PositionControlPosition).toBe(PositionControlPosition);
        expect(instrumentMdxComponents.HarmonicShaper).toBe(HarmonicShaper);
        expect(instrumentPrintMdxComponents.PositionControl).toBe(PrintPositionControl);
        expect(instrumentPrintMdxComponents.PositionControlPosition).toBe(PrintPositionControlPosition);
        expect(instrumentPrintMdxComponents.HarmonicShaper).toBe(PrintHarmonicShaper);
        expect(instrumentPrintMdxComponents.HarmonicShaper).not.toBe(instrumentMdxComponents.HarmonicShaper);
    });
});
