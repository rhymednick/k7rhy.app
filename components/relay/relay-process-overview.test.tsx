import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { RelayProcessOverview } from './relay-process-overview';

describe('RelayProcessOverview', () => {
    it('renders five numbered cards in stage order: Body, Voicing, Parts, Wiring, Assembly', () => {
        render(<RelayProcessOverview />);

        expect(screen.getByRole('heading', { name: /^body$/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /^voicing$/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /^parts$/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /^wiring$/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /^assembly$/i })).toBeInTheDocument();

        // Numbered "1"..."5" appear in document
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders status badges that match the current ship state', () => {
        render(<RelayProcessOverview />);

        // Body, Voicing, Parts, and Wiring are Live; Assembly is In progress.
        expect(screen.getAllByText('Live')).toHaveLength(4);
        expect(screen.getByText('In progress')).toBeInTheDocument();
        expect(screen.queryByText('Planned')).not.toBeInTheDocument();
    });

    it('links every stage to its in-site /relay/ page', () => {
        render(<RelayProcessOverview />);
        const bodyLink = screen.getByRole('link', { name: /^1\s*body/i });
        const voicingLink = screen.getByRole('link', { name: /^2\s*voicing/i });
        const partsLink = screen.getByRole('link', { name: /^3\s*parts/i });
        const wiringLink = screen.getByRole('link', { name: /^4\s*wiring/i });
        const assemblyLink = screen.getByRole('link', { name: /^5\s*assembly/i });

        expect(bodyLink).toHaveAttribute('href', '/relay/body');
        expect(voicingLink).toHaveAttribute('href', '/relay/voicings');
        expect(partsLink).toHaveAttribute('href', '/relay/parts');
        expect(wiringLink).toHaveAttribute('href', '/relay/wiring');
        expect(assemblyLink).toHaveAttribute('href', '/relay/assembly');

        // None of the stage links open in a new tab — the placeholder pages host the Discord CTA.
        expect(bodyLink).not.toHaveAttribute('target');
        expect(assemblyLink).not.toHaveAttribute('target');
    });

    it('uses Live CTA copy on Body/Voicing/Parts/Wiring, in-progress CTA on Assembly', () => {
        render(<RelayProcessOverview />);
        expect(screen.getByText(/open body guide/i)).toBeInTheDocument();
        expect(screen.getByText(/open voicing guide/i)).toBeInTheDocument();
        expect(screen.getByText(/open parts guide/i)).toBeInTheDocument();
        expect(screen.getByText(/open wiring guide/i)).toBeInTheDocument();
        expect(screen.getByText(/follow progress/i)).toBeInTheDocument();
    });

    it('spans the odd fifth card (Assembly) across the full row so the grid has no dangling gap', () => {
        render(<RelayProcessOverview />);
        const assemblyLink = screen.getByRole('link', { name: /^5\s*assembly/i });

        expect(assemblyLink).toHaveClass('md:col-span-2');
        const bodyLink = screen.getByRole('link', { name: /^1\s*body/i });
        expect(bodyLink).not.toHaveClass('md:col-span-2');
    });
});
