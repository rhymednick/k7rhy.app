import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { InstrumentCaseCard } from './instrument-case-card';
import type { InstrumentRecord } from '@/types/instrument';

vi.mock('next/image', () => ({
    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement('img', props),
}));

vi.mock('qrcode.react', () => ({
    QRCodeSVG: ({ value }: { value: string }) => <svg aria-label="Instrument record QR code" data-value={value} />,
}));

const record: InstrumentRecord = {
    serial: 'RLY26001',
    modelCode: 'RLY',
    modelDescription: 'Relay',
    year: 2026,
    index: 1,
    publish: true,
    name: 'Relay Lipstick',
    completed: '2026-06-19',
    origin: 'Built by K7RHY Resonance Lab.',
    theme: 'Articulate and touch-sensitive.',
    images: [{ src: '/front.jpg', alt: 'Front' }],
    content: '',
};

describe('InstrumentCaseCard', () => {
    it('renders the site logo and full brand name', () => {
        render(
            <InstrumentCaseCard record={record}>
                <div>Control map</div>
            </InstrumentCaseCard>,
        );

        expect(screen.getByRole('img', { name: 'K7RHY Resonance Lab logo' })).toBeInTheDocument();
        expect(screen.getByText('K7RHY Resonance Lab')).toBeInTheDocument();
    });

    it('renders identity, controls, Discord, and canonical QR destination without the guitar photo', () => {
        const { container } = render(
            <InstrumentCaseCard record={record}>
                <div>Control map</div>
            </InstrumentCaseCard>,
        );

        expect(container).toHaveTextContent('RLY26001');
        expect(screen.getByText('Control map')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /discord/i })).toHaveAttribute('href', 'https://discord.gg/BuUxCG4W6w');
        expect(container.querySelector('[data-value="https://k7rhy.app/sn/RLY26001"]')).toBeInTheDocument();
        expect(container.querySelector('img[src="/front.jpg"]')).not.toBeInTheDocument();
    });
});
