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

    it('marks Body and Assembly stages as Discord links (target=_blank)', () => {
        render(<RelayLayoutSidebar />);
        // Accessible name is the concatenation of inline spans without whitespace: "1.BodyDiscord", "3.AssemblyDiscord"
        const bodyLink = screen.getByRole('link', { name: /^1\.Body/ });
        const assemblyLink = screen.getByRole('link', { name: /^3\.Assembly/ });
        expect(bodyLink).toHaveAttribute('target', '_blank');
        expect(assemblyLink).toHaveAttribute('target', '_blank');
        expect(bodyLink.getAttribute('href')).toMatch(/^https:\/\/discord\./);
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
