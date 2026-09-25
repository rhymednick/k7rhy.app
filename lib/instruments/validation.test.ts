import { describe, expect, it } from 'vitest';
import type { InstrumentFrontmatter } from '@/types/instrument';
import { validateInstrumentDocument } from './validation';

const valid: InstrumentFrontmatter = {
    publish: false,
    name: 'Relay Lipstick',
    completed: '2026-06-19',
    origin: 'Designed, built, and voiced by K7RHY Resonance Lab.',
    theme: 'Articulate and touch-sensitive.',
    images: [{ src: '/images/products/guitars/rainbow-tele/front.jpeg', alt: 'REX26001 front view' }],
    related: { label: 'Explore Relay Guitar', href: '/relay' },
    content: '<InstrumentSpec />',
};

describe('validateInstrumentDocument', () => {
    it('derives serial data from the MDX path', () => {
        expect(validateInstrumentDocument('REX26001', valid)).toMatchObject({ serial: 'REX26001', modelDescription: 'Relay Example' });
    });

    it('requires at least one exact-instrument image', () => {
        expect(() => validateInstrumentDocument('REX26001', { ...valid, images: [] })).toThrow('REX26001 requires at least one instrument image');
    });

    it('requires a local absolute image path and useful alt text', () => {
        expect(() => validateInstrumentDocument('REX26001', { ...valid, images: [{ src: 'front.jpg', alt: '' }] })).toThrow('REX26001 has an invalid instrument image');
    });

    it('rejects an image path that does not exist under public', () => {
        expect(() => validateInstrumentDocument('REX26001', { ...valid, images: [{ src: '/images/instruments/missing.jpg', alt: 'Missing image' }] })).toThrow('REX26001 image does not exist: /images/instruments/missing.jpg');
    });

    it('requires the serial year to match the completion date', () => {
        expect(() => validateInstrumentDocument('REX26001', { ...valid, completed: '2025-12-31' })).toThrow('REX26001 year does not match completion date 2025-12-31');
    });

    it('accepts a year-only completion value matching the serial year', () => {
        expect(validateInstrumentDocument('PRS26001', { ...valid, completed: '2026' })).toMatchObject({ serial: 'PRS26001', year: 2026 });
    });

    it('rejects a year-only completion value that differs from the serial year', () => {
        expect(() => validateInstrumentDocument('PRS26001', { ...valid, completed: '2025' })).toThrow('PRS26001 year does not match completion date 2025');
    });

    it('accepts an unpublished build with a start date and no completion claim', () => {
        expect(validateInstrumentDocument('STR26001', { ...valid, completed: undefined, started: '2026-09-24' })).toMatchObject({ serial: 'STR26001', year: 2026 });
    });

    it('rejects publication before completion', () => {
        expect(() => validateInstrumentDocument('STR26001', { ...valid, completed: undefined, started: '2026-09-24', publish: true })).toThrow('STR26001 cannot publish before completion');
    });

    it('rejects a start date that differs from the serial year', () => {
        expect(() => validateInstrumentDocument('STR26001', { ...valid, completed: undefined, started: '2027-01-01' })).toThrow('STR26001 year does not match start date 2027-01-01');
    });
});
