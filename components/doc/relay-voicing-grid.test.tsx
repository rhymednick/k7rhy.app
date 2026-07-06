import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { RelayVoicingCard, RelayVoicingGrid } from './relay-voicing-grid';
import { relayVoicings } from '@/config/relay-voicings';

describe('RelayVoicingGrid (config-driven)', () => {
    it('renders a card for every voicing in the registry when no children are given', () => {
        render(<RelayVoicingGrid />);

        for (const voicing of relayVoicings) {
            const link = screen.getByRole('link', { name: new RegExp(voicing.name, 'i') });
            expect(link).toHaveAttribute('href', `/relay/voicings/${voicing.slug}`);
        }
    });

    it('pulls card copy from the registry', () => {
        render(<RelayVoicingGrid />);

        for (const voicing of relayVoicings) {
            expect(screen.getByText(voicing.description)).toBeInTheDocument();
            expect(screen.getByText(voicing.tagline)).toBeInTheDocument();
        }
    });

    it('lists ready voicings before lab and concept voicings', () => {
        render(<RelayVoicingGrid />);

        const names = screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent);
        expect(names?.slice(0, 4).sort()).toEqual(['Relay Arc', 'Relay Lipstick', 'Relay Torch', 'Relay Velvet']);
        expect(names?.[names.length - 1]).toBe('Relay Hammer');
    });

    it('still renders explicit children when provided', () => {
        render(
            <RelayVoicingGrid>
                <div data-testid="custom-card">Custom</div>
            </RelayVoicingGrid>,
        );

        expect(screen.getByTestId('custom-card')).toBeInTheDocument();
        expect(screen.queryByText('Relay Hammer')).not.toBeInTheDocument();
    });
});

describe('RelayVoicingCard', () => {
    it('renders the Ready badge for a voicing whose config status is ready', () => {
        render(
            <RelayVoicingCard
                slug="lipstick"
                name="Relay Lipstick"
                tagline="Humbuckers · Lipstick shaper"
                genres="Blues · Rock"
                description="Reference voicing"
                href="/relay/voicings/lipstick"
            />,
        );

        expect(screen.getByText('Ready')).toBeInTheDocument();
    });

    it('renders the Lab badge for a voicing whose config status is lab', () => {
        render(
            <RelayVoicingCard
                slug="reef"
                name="Relay Reef"
                tagline="Humbucker · Dual-lipstick"
                genres="Indie · Surf"
                description="Reef voicing"
                href="/relay/voicings/reef"
            />,
        );

        expect(screen.getByText('Lab')).toBeInTheDocument();
    });

    it('renders the Concept badge for a voicing whose config status is concept', () => {
        render(
            <RelayVoicingCard
                slug="hammer"
                name="Relay Hammer"
                tagline="High gain · Rails"
                genres="Metal"
                description="Hammer voicing"
                href="/relay/voicings/hammer"
            />,
        );

        expect(screen.getByText('Concept')).toBeInTheDocument();
    });
});
