import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { RelayVoicingTabs } from './relay-voicing-tabs';

const voicings = [
	{ slug: 'lipstick', name: 'Relay Lipstick' },
	{ slug: 'velvet', name: 'Relay Velvet' },
];

describe('RelayVoicingTabs', () => {
	it('renders a link per voicing pointing at basePath with the voicing param', () => {
		render(<RelayVoicingTabs voicings={voicings} activeSlug="lipstick" basePath="/relay/parts" />);
		expect(screen.getByRole('tab', { name: 'Relay Lipstick' })).toHaveAttribute('href', '/relay/parts?voicing=lipstick');
		expect(screen.getByRole('tab', { name: 'Relay Velvet' })).toHaveAttribute('href', '/relay/parts?voicing=velvet');
	});

	it('marks the active voicing with aria-current', () => {
		render(<RelayVoicingTabs voicings={voicings} activeSlug="velvet" basePath="/relay/wiring" />);
		expect(screen.getByRole('tab', { name: 'Relay Velvet' })).toHaveAttribute('aria-current', 'page');
		expect(screen.getByRole('tab', { name: 'Relay Lipstick' })).not.toHaveAttribute('aria-current');
	});
});
