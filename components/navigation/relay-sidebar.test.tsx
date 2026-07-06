import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

const pathnameMock = vi.fn();
vi.mock('next/navigation', () => ({ usePathname: () => pathnameMock() }));

import { RelayLayoutSidebar } from './relay-sidebar';

describe('RelayLayoutSidebar', () => {
    it('shows all five build steps on the platform page', () => {
        pathnameMock.mockReturnValue('/relay');
        render(<RelayLayoutSidebar />);
        for (const step of ['Body', 'Voicing', 'Parts', 'Wiring', 'Assembly']) {
            expect(screen.getByRole('link', { name: new RegExp(`^${step}`) })).toBeInTheDocument();
        }
    });

    it('renders the same master nav on a voicing page (no separate voicing sidebar, no "All voicings")', () => {
        pathnameMock.mockReturnValue('/relay/voicings/lipstick');
        render(<RelayLayoutSidebar />);
        expect(screen.getByRole('link', { name: /^Parts/ })).toHaveAttribute('href', '/relay/parts');
        expect(screen.getByRole('link', { name: /^Wiring/ })).toHaveAttribute('href', '/relay/wiring');
        expect(screen.queryByText(/all voicings/i)).not.toBeInTheDocument();
    });

    it('expands the active step’s sub-items and collapses inactive ones', () => {
        pathnameMock.mockReturnValue('/relay/voicings/lipstick');
        render(<RelayLayoutSidebar />);
        // Voicing is active → its voicing sub-links show
        expect(screen.getByRole('link', { name: 'Relay Lipstick' })).toBeInTheDocument();
        // Body is inactive → its print/bond/finish sub-links are hidden
        expect(screen.queryByRole('link', { name: 'Print' })).not.toBeInTheDocument();
    });
});
