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

    it('renders status badges that match the PR #3 ship state', () => {
        render(<RelayProcessOverview />);

        // Body and Voicings are Live; Assembly is Planned. No In progress at this ship.
        expect(screen.getAllByText('Live')).toHaveLength(2);
        expect(screen.getByText('Planned')).toBeInTheDocument();
        expect(screen.queryByText('In progress')).not.toBeInTheDocument();
    });

    it('links every stage to its in-site /relay/ page', () => {
        render(<RelayProcessOverview />);
        const bodyLink = screen.getByRole('link', { name: /body/i });
        const voicingsLink = screen.getByRole('link', { name: /voicings/i });
        const assemblyLink = screen.getByRole('link', { name: /assembly/i });

        expect(bodyLink).toHaveAttribute('href', '/relay/body');
        expect(voicingsLink).toHaveAttribute('href', '/relay/voicings');
        expect(assemblyLink).toHaveAttribute('href', '/relay/assembly');

        // None of the stage links open in a new tab — the placeholder pages host the Discord CTA.
        expect(bodyLink).not.toHaveAttribute('target');
        expect(assemblyLink).not.toHaveAttribute('target');
    });

    it('uses Live CTA copy on Body and Voicings, Planned CTA on Assembly', () => {
        render(<RelayProcessOverview />);
        expect(screen.getByText(/open body guide/i)).toBeInTheDocument();
        expect(screen.getByText(/open voicings guide/i)).toBeInTheDocument();
        expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
    });
});
