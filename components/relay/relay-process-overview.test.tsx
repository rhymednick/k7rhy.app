import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { RelayProcessOverview } from './relay-process-overview';

describe('RelayProcessOverview', () => {
    it('renders three numbered cards in stage order: Body, Voicings, Assembly', () => {
        render(<RelayProcessOverview />);

        expect(screen.getByRole('heading', { name: /body/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /voicings/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /assembly/i })).toBeInTheDocument();

        // Numbered "1.", "2.", "3." appear in document
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders the correct status badge for each stage', () => {
        render(<RelayProcessOverview />);

        expect(screen.getByText('Live')).toBeInTheDocument();
        expect(screen.getByText('In progress')).toBeInTheDocument();
        expect(screen.getByText('Planned')).toBeInTheDocument();
    });

    it('links Voicings to /relay/voicings (in-site route)', () => {
        render(<RelayProcessOverview />);
        const voicingsLink = screen.getByRole('link', { name: /voicings/i });
        expect(voicingsLink).toHaveAttribute('href', '/relay/voicings');
    });

    it('links Body and Assembly to Discord (external)', () => {
        render(<RelayProcessOverview />);
        const bodyLink = screen.getByRole('link', { name: /body/i });
        const assemblyLink = screen.getByRole('link', { name: /assembly/i });

        expect(bodyLink.getAttribute('href')).toMatch(/^https:\/\/discord\./);
        expect(assemblyLink.getAttribute('href')).toMatch(/^https:\/\/discord\./);
        expect(bodyLink).toHaveAttribute('target', '_blank');
        expect(assemblyLink).toHaveAttribute('target', '_blank');
    });
});
