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


});
