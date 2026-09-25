import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { InstrumentRecordPage } from './instrument-record-page';
import type { InstrumentRecord } from '@/types/instrument';

vi.mock('next/image', () => ({
    default: ({ fill: _fill, priority: _priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => React.createElement('img', props),
}));

const record: InstrumentRecord = {
    serial: 'REX26001',
    modelCode: 'RLY',
    modelDescription: 'Relay',
    year: 2026,
    index: 1,
    publish: true,
    name: 'Relay Lipstick',
    completed: '2026-06-19',
    origin: 'Designed, built, and voiced by K7RHY Resonance Lab.',
    theme: 'Articulate and touch-sensitive.',
    images: [{ src: '/images/instruments/REX26001/front.jpg', alt: 'REX26001 front view' }],
    related: { label: 'Explore the Relay Guitar family', href: '/guitars/relay' },
    content: '',
};

describe('InstrumentRecordPage', () => {
    it('leads with identity, photograph, theme, and print action', () => {
        render(
            <InstrumentRecordPage record={record}>
                <div>Structured specification</div>
            </InstrumentRecordPage>
        );

        expect(screen.getByRole('heading', { level: 1, name: 'Relay Lipstick' })).toBeInTheDocument();
        expect(screen.getAllByText('REX26001')).toHaveLength(2);
        expect(screen.getByText('Articulate and touch-sensitive.')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'REX26001 front view' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /print case card/i })).toHaveAttribute('href', '/sn/REX26001/print');
        expect(screen.getByText('Structured specification')).toBeInTheDocument();
    });

    it('renders the optional discovery link without replacing site navigation', () => {
        render(
            <InstrumentRecordPage record={record}>
                <div>Structured specification</div>
            </InstrumentRecordPage>
        );

        expect(screen.getByRole('link', { name: 'Explore the Relay Guitar family' })).toHaveAttribute('href', '/guitars/relay');
    });

    it('uses a custom date label with a year-only value', () => {
        render(
            <InstrumentRecordPage record={{ ...record, completed: '2026', dateLabel: 'Modified' }}>
                <div>Structured specification</div>
            </InstrumentRecordPage>
        );

        expect(screen.getByText('Modified')).toBeInTheDocument();
        expect(screen.getAllByText('2026').length).toBeGreaterThan(0);
        expect(screen.queryByText('January 1, 2026')).not.toBeInTheDocument();
    });

    it('labels an unfinished draft honestly and omits the case card action', () => {
        render(
            <InstrumentRecordPage record={{ ...record, publish: false, completed: undefined, started: '2026-09-24' }}>
                <div>Wiring under review</div>
            </InstrumentRecordPage>
        );

        expect(screen.getByText('Build started')).toBeInTheDocument();
        expect(screen.getByText('Wiring under review')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /print case card/i })).not.toBeInTheDocument();
    });

    it('uses a custom record date label for an unpublished specification', () => {
        render(
            <InstrumentRecordPage record={{ ...record, publish: false, completed: undefined, started: '2026-09-24', dateLabel: 'Record date' }}>
                <div>Final build specification</div>
            </InstrumentRecordPage>
        );

        expect(screen.getByText('Record date')).toBeInTheDocument();
        expect(screen.getByText('September 24, 2026')).toBeInTheDocument();
        expect(screen.queryByText('Build started')).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /print case card/i })).not.toBeInTheDocument();
    });
});
