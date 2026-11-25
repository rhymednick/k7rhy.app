import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { RelaySeriesNav } from './relay-series-nav';

describe('RelaySeriesNav', () => {
    it('renders previous and next links inside one labelled nav', () => {
        render(<RelaySeriesNav prev={{ title: 'Is your guitar a fit?', href: '/a' }} next={{ title: 'Wire it and check it', href: '/b' }} />);
        const nav = screen.getByRole('navigation', { name: 'Series navigation' });
        expect(nav).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Is your guitar a fit\?/ })).toHaveAttribute('href', '/a');
        expect(screen.getByRole('link', { name: /Wire it and check it/ })).toHaveAttribute('href', '/b');
    });

    it('omits a missing previous link', () => {
        render(<RelaySeriesNav next={{ title: 'Next one', href: '/b' }} />);
        expect(screen.queryByText(/Previous/)).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Next one/ })).toBeInTheDocument();
    });

    it('omits a missing next link', () => {
        render(<RelaySeriesNav prev={{ title: 'Prior one', href: '/a' }} />);
        expect(screen.queryByText(/Next/)).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Prior one/ })).toBeInTheDocument();
    });

    it('renders nothing when there is neither a previous nor a next link', () => {
        const { container } = render(<RelaySeriesNav />);
        expect(container).toBeEmptyDOMElement();
    });
});
