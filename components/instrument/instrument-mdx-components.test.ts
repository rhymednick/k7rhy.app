import { describe, expect, it } from 'vitest';
import { instrumentMdxComponents, instrumentPrintMdxComponents } from './instrument-mdx-components';

describe('instrument MDX component maps', () => {
    it('uses a dedicated component family for the printable case card', () => {
        expect(instrumentPrintMdxComponents.InstrumentSpec).not.toBe(instrumentMdxComponents.InstrumentSpec);
        expect(instrumentPrintMdxComponents.Pickup).not.toBe(instrumentMdxComponents.Pickup);
        expect(instrumentPrintMdxComponents.Selector).not.toBe(instrumentMdxComponents.Selector);
    });
});
