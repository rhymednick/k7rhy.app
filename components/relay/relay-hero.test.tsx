import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { RelayHero } from './relay-hero';

describe('RelayHero', () => {
    it('renders the tagline', () => {
        render(<RelayHero tagline="A test tagline." />);
        expect(screen.getByText('A test tagline.')).toBeInTheDocument();
    });

    it('does not render its own h1 — the page title comes from DocPage', () => {
        render(<RelayHero tagline="A test tagline." />);
        expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    });

    it('renders the primary "Choose your voicing" CTA pointing to /relay/voicings', () => {
        render(<RelayHero tagline="y" />);
        const primary = screen.getByRole('link', { name: /choose your voicing/i });
        expect(primary).toHaveAttribute('href', '/relay/voicings');
    });

    it('renders the secondary "Download body files" CTA linking to the body stage page', () => {
        render(<RelayHero tagline="y" />);
        const secondary = screen.getByRole('link', { name: /download body files/i });
        expect(secondary).toHaveAttribute('href', '/relay/body');
        expect(secondary).not.toHaveAttribute('target');
    });

    it('renders the micro-copy under the buttons', () => {
        render(<RelayHero tagline="y" />);
        expect(screen.getByText(/pick first, order parts/i)).toBeInTheDocument();
    });
});
