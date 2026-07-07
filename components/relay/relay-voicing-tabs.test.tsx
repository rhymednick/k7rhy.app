import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { RelayVoicingTabs } from './relay-voicing-tabs';

const voicings = [
    { slug: 'lipstick', name: 'Relay Lipstick' },
    { slug: 'velvet', name: 'Relay Velvet' },
];

describe('RelayVoicingTabs', () => {
    it('frames the tabs with a voice-selection instruction and scroll cue', () => {
        render(<RelayVoicingTabs voicings={[{ slug: 'lipstick', name: 'Relay Lipstick', genres: 'Blues · Rock' }]} activeSlug="lipstick" basePath="/relay/parts" />);
        expect(screen.getByText('Select your voice')).toBeInTheDocument();
        expect(screen.getByText('Scroll')).toBeInTheDocument();
        expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', 'Select a Relay voice');
    });

    it('does not show the scroll cue for compact tabs without genre details', () => {
        render(<RelayVoicingTabs voicings={voicings} activeSlug="lipstick" basePath="/relay/wiring" />);
        expect(screen.getByText('Select your voice')).toBeInTheDocument();
        expect(screen.queryByText('Scroll')).not.toBeInTheDocument();
    });

    it('renders a link per voicing pointing at basePath with the voicing param', () => {
        render(<RelayVoicingTabs voicings={voicings} activeSlug="lipstick" basePath="/relay/parts" />);
        expect(screen.getByRole('tab', { name: 'Relay Lipstick' })).toHaveAttribute('href', '/relay/parts?voicing=lipstick');
        expect(screen.getByRole('tab', { name: 'Relay Velvet' })).toHaveAttribute('href', '/relay/parts?voicing=velvet');
        expect(screen.getByText('Lipstick')).toBeInTheDocument();
        expect(screen.getByText('Velvet')).toBeInTheDocument();
        expect(screen.queryByText('Relay Lipstick')).not.toBeInTheDocument();
    });

    it('marks the active voicing with aria-current', () => {
        render(<RelayVoicingTabs voicings={voicings} activeSlug="velvet" basePath="/relay/wiring" />);
        expect(screen.getByRole('tab', { name: 'Relay Velvet' })).toHaveAttribute('aria-current', 'page');
        expect(screen.getByRole('tab', { name: 'Relay Lipstick' })).not.toHaveAttribute('aria-current');
    });

    it('keeps the tab list on one horizontally scrollable row', () => {
        render(<RelayVoicingTabs voicings={voicings} activeSlug="lipstick" basePath="/relay/parts" />);
        const tablist = screen.getByRole('tablist');
        expect(tablist.className).toMatch(/overflow-x-auto/);
        expect(tablist.className).toMatch(/flex-nowrap/);
        expect(screen.getByRole('tab', { name: 'Relay Lipstick' }).className).toMatch(/bg-background/);
        expect(screen.getByRole('tab', { name: 'Relay Lipstick' }).className).toMatch(/rounded-t-md/);
        expect(screen.getByRole('tab', { name: 'Relay Velvet' }).className).toMatch(/shrink-0/);
        expect(screen.getByRole('tab', { name: 'Relay Velvet' }).className).toMatch(/border-border/);
    });

    it('renders the name in a bolder line above a smaller genres line when genres are provided', () => {
        render(<RelayVoicingTabs voicings={[{ slug: 'lipstick', name: 'Relay Lipstick', genres: 'Blues · Rock' }]} activeSlug="lipstick" basePath="/relay/parts" />);
        const tab = screen.getByRole('tab', { name: 'Relay Lipstick' });
        const name = within(tab).getByText('Lipstick');
        const genres = within(tab).getByText('Blues · Rock');
        expect(name.className).toMatch(/font-semibold/);
        expect(genres.className).toMatch(/text-xs/);
        expect(genres).toHaveAttribute('aria-hidden', 'true');
    });

    it('omits the genres line when a voicing has no genres', () => {
        render(<RelayVoicingTabs voicings={voicings} activeSlug="lipstick" basePath="/relay/parts" />);
        expect(screen.queryByText('Blues · Rock')).not.toBeInTheDocument();
    });
});
