import { describe, expect, it } from 'vitest';
import type { InstrumentFrontmatter } from '@/types/instrument';
import { validateInstrumentDocument } from './validation';

const valid: InstrumentFrontmatter = {
    publish: false,
    name: 'Relay Lipstick',
    completed: '2026-06-19',
    origin: 'Designed, built, and voiced by K7RHY Resonance Lab.',
    theme: 'Articulate and touch-sensitive.',
    images: [{ src: '/images/products/guitars/rainbow-tele/front.jpeg', alt: 'RLY26001 front view' }],
    related: { label: 'Explore Relay Guitar', href: '/relay' },
    content: '<InstrumentSpec />',
};

describe('validateInstrumentDocument', () => {
    it('derives serial data from the MDX path', () => {
        expect(validateInstrumentDocument('RLY26001', valid)).toMatchObject({ serial: 'RLY26001', modelDescription: 'Relay' });
    });

    it('requires at least one exact-instrument image', () => {
        expect(() => validateInstrumentDocument('RLY26001', { ...valid, images: [] })).toThrow('RLY26001 requires at least one instrument image');
    });

    it('requires a local absolute image path and useful alt text', () => {
        expect(() => validateInstrumentDocument('RLY26001', { ...valid, images: [{ src: 'front.jpg', alt: '' }] })).toThrow('RLY26001 has an invalid instrument image');
    });

    it('rejects an image path that does not exist under public', () => {
        expect(() => validateInstrumentDocument('RLY26001', { ...valid, images: [{ src: '/images/instruments/missing.jpg', alt: 'Missing image' }] })).toThrow('RLY26001 image does not exist: /images/instruments/missing.jpg');
    });

    it('requires the serial year to match the completion date', () => {
        expect(() => validateInstrumentDocument('RLY26001', { ...valid, completed: '2025-12-31' })).toThrow('RLY26001 year does not match completion date 2025-12-31');
    });

    it('accepts a year-only completion value matching the serial year', () => {
        expect(validateInstrumentDocument('PRS26001', { ...valid, completed: '2026' })).toMatchObject({ serial: 'PRS26001', year: 2026 });
    });

    it('rejects a year-only completion value that differs from the serial year', () => {
        expect(() => validateInstrumentDocument('PRS26001', { ...valid, completed: '2025' })).toThrow('PRS26001 year does not match completion date 2025');
    });
});
