import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AnnouncementFeed } from './announcement-feed';

describe('AnnouncementFeed', () => {
    it('renders announcement identity, time, text, and safe links', () => {
        render(
            <AnnouncementFeed
                result={{
                    status: 'available',
                    messages: [
                        {
                            id: '1',
                            content: 'New build: https://k7rhy.app/guitars',
                            author: { username: 'k7rhy', global_name: 'Rhy' },
                            timestamp: '2026-07-26T12:00:00.000Z',
                        },
                    ],
                }}
            />
        );

        expect(screen.getByText('Rhy')).toBeInTheDocument();
        expect(screen.getByText(/New build:/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'https://k7rhy.app/guitars' })).toHaveAttribute('target', '_blank');
        expect(screen.getByRole('link', { name: 'https://k7rhy.app/guitars' })).toHaveAttribute('rel', 'noopener noreferrer');
        expect(screen.getByText(/Jul/).closest('time')).toHaveAttribute('datetime', '2026-07-26T12:00:00.000Z');
    });

    it('renders a quiet unavailable state', () => {
        render(<AnnouncementFeed result={{ status: 'unavailable', messages: [] }} />);
        expect(screen.getByText('Announcements are temporarily unavailable.')).toBeInTheDocument();
    });

    it('renders an empty available state', () => {
        render(<AnnouncementFeed result={{ status: 'available', messages: [] }} />);
        expect(screen.getByText('No announcements yet.')).toBeInTheDocument();
    });
});
