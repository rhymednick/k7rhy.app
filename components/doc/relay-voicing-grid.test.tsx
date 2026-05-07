import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { RelayVoicingCard } from './relay-voicing-grid';

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
