import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Stub usePathname for the client component
vi.mock('next/navigation', () => ({
    usePathname: () => '/relay',
}));

import { RelayLayoutSidebar } from './relay-sidebar';

describe('RelayLayoutSidebar (platform mode)', () => {
    it('renders the Platform Overview link', () => {
        render(<RelayLayoutSidebar />);
        const link = screen.getByRole('link', { name: /platform overview/i });
        expect(link).toHaveAttribute('href', '/relay');
    });

    it('renders all three Build process stages: Body, Voicings, Assembly', () => {
        render(<RelayLayoutSidebar />);
        expect(screen.getByText('Body')).toBeInTheDocument();
        // "Voicings" appears as a heading too; assert at least one occurrence
        expect(screen.getAllByText('Voicings').length).toBeGreaterThan(0);
        expect(screen.getByText('Assembly')).toBeInTheDocument();
    });

    it('routes Body and Assembly stages to in-site pages, with status tag only on non-Live', () => {
        render(<RelayLayoutSidebar />);
        // Accessible name is the concatenation of the title span and status tag: "BodyIn progress", "AssemblyPlanned"
        const bodyLink = screen.getByRole('link', { name: /^Body/ });
        const assemblyLink = screen.getByRole('link', { name: /^Assembly/ });
        expect(bodyLink).toHaveAttribute('href', '/relay/body');
        expect(assemblyLink).toHaveAttribute('href', '/relay/assembly');
        expect(bodyLink).not.toHaveAttribute('target');
        expect(assemblyLink).not.toHaveAttribute('target');
        // Body is Live (no tag); Assembly is Planned (tag visible).
        expect(bodyLink.textContent).not.toMatch(/in progress|planned|live/i);
        expect(assemblyLink.textContent).toMatch(/Planned/i);
    });

    it('renders Print, Bonding, and Finishing sub-links under the Body stage', () => {
        render(<RelayLayoutSidebar />);
        const printLink = screen.getByRole('link', { name: /^Print$/ });
        const bondingLink = screen.getByRole('link', { name: /^Bonding$/ });
        const finishingLink = screen.getByRole('link', { name: /^Finishing$/ });
        expect(printLink).toHaveAttribute('href', '/relay/body/print');
        expect(bondingLink).toHaveAttribute('href', '/relay/body/bonding');
        expect(finishingLink).toHaveAttribute('href', '/relay/body/finishing');
    });

    it('lists the seven voicings in the sidebar', () => {
        render(<RelayLayoutSidebar />);
        // Voicings appear via RelayVoicingLineupNav with full titles ("Relay Lipstick" + status badge)
        for (const slug of ['lipstick', 'reef', 'velvet', 'arc', 'torch', 'current', 'hammer']) {
            const link = screen.getByRole('link', { name: new RegExp(`Relay ${slug}`, 'i') });
            expect(link).toHaveAttribute('href', `/relay/voicings/${slug}`);
        }
    });
});
