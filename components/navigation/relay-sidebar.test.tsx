import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

const pathnameMock = vi.fn();
vi.mock('next/navigation', () => ({ usePathname: () => pathnameMock() }));

import { RelayLayoutSidebar } from './relay-sidebar';

describe('RelayLayoutSidebar', () => {
    it('shows all five build steps on the platform page', () => {
        pathnameMock.mockReturnValue('/guitars/relay');
        render(<RelayLayoutSidebar />);
        expect(screen.getByRole('link', { name: '← Guitars' })).toHaveAttribute('href', '/guitars');
        for (const step of ['Body', 'Voicing', 'Parts', 'Wiring', 'Assembly']) {
            expect(screen.getByRole('link', { name: new RegExp(`^${step}`) })).toBeInTheDocument();
        }
    });

    it('renders the same master nav on a voicing page (no separate voicing sidebar, no "All voicings")', () => {
        pathnameMock.mockReturnValue('/guitars/relay/voicings/lipstick');
        render(<RelayLayoutSidebar />);
        expect(screen.getByRole('link', { name: /^Parts/ })).toHaveAttribute('href', '/guitars/relay/parts');
        expect(screen.getByRole('link', { name: /^Wiring/ })).toHaveAttribute('href', '/guitars/relay/wiring');
        expect(screen.queryByText(/all voicings/i)).not.toBeInTheDocument();
    });

    it('expands the active step’s sub-items and collapses inactive ones', () => {
        pathnameMock.mockReturnValue('/guitars/relay/voicings/lipstick');
        render(<RelayLayoutSidebar />);
        // Voicing is active → its voicing sub-links show
        expect(screen.getByRole('link', { name: 'Relay Lipstick' })).toBeInTheDocument();
        // Body is inactive → its print/bond/finish sub-links are hidden
        expect(screen.queryByRole('link', { name: 'Print' })).not.toBeInTheDocument();
    });

    it('shows a Customize group with a landing link and keeps the five build steps', () => {
        pathnameMock.mockReturnValue('/guitars/relay');
        render(<RelayLayoutSidebar />);
        expect(screen.getByRole('heading', { name: 'Customize' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Customize' })).toHaveAttribute('href', '/guitars/relay/customize');
        for (const step of ['Body', 'Voicing', 'Parts', 'Wiring', 'Assembly']) {
            expect(screen.getByRole('link', { name: new RegExp(`^${step}`) })).toBeInTheDocument();
        }
        expect(screen.queryByRole('heading', { name: 'Understand' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Why turning down makes it dull' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Is your guitar a fit?' })).not.toBeInTheDocument();
    });

    it('shows both series with all eight parts under /guitars/relay/customize and marks the current part', () => {
        pathnameMock.mockReturnValue('/guitars/relay/customize/treble-bleed/build/parts-and-hole');
        render(<RelayLayoutSidebar />);
        expect(screen.getByRole('heading', { name: 'Understand' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Build' })).toBeInTheDocument();
        const titles = ['Why turning down makes it dull', 'What a bleed does', 'The reactive bleed', 'Is your guitar a fit?', 'Parts, values and the hole', 'What changes and finding your lugs', 'Wire it and check it', 'Reference sheet and troubleshooting'];
        for (const title of titles) {
            expect(screen.getByRole('link', { name: title })).toBeInTheDocument();
        }
        const current = screen.getByRole('link', { name: 'Parts, values and the hole' });
        expect(current).toHaveAttribute('href', '/guitars/relay/customize/treble-bleed/build/parts-and-hole');
        expect(current).toHaveClass('font-medium');
        expect(screen.getByRole('link', { name: 'Is your guitar a fit?' })).not.toHaveClass('font-medium');
    });

    it('keeps the series collapsed for a lookalike path', () => {
        pathnameMock.mockReturnValue('/guitars/relay/customized-x');
        render(<RelayLayoutSidebar />);
        expect(screen.queryByRole('heading', { name: 'Understand' })).not.toBeInTheDocument();
    });
});
