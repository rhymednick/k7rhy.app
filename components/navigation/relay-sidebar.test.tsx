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
        expect(screen.queryByRole('link', { name: 'How treble bleeds work' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Direct / Off / Reactive switch' })).not.toBeInTheDocument();
    });

    it('shows the Customize pages under /guitars/relay/customize and marks the current one', () => {
        pathnameMock.mockReturnValue('/guitars/relay/customize/how-treble-bleeds-work');
        render(<RelayLayoutSidebar />);
        const current = screen.getByRole('link', { name: 'How treble bleeds work' });
        expect(current).toHaveAttribute('href', '/guitars/relay/customize/how-treble-bleeds-work');
        expect(current).toHaveClass('font-medium');
        const other = screen.getByRole('link', { name: 'Direct / Off / Reactive switch' });
        expect(other).toHaveAttribute('href', '/guitars/relay/customize/direct-off-reactive-switch');
        expect(other).not.toHaveClass('font-medium');
    });
});
