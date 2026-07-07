import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { RelayVoicingOverview, getRelayVoicingCommunityMessage } from './relay-voicing-overview';

vi.mock('@/components/discord-community-callout', () => ({
    DiscordCommunityCallout: ({ message, threadId }: { message?: string; threadId?: string }) => (
        <div data-testid="discord-community-callout" data-thread-id={threadId}>
            {message}
        </div>
    ),
}));

describe('getRelayVoicingCommunityMessage', () => {
    it('prompts ready voicings about parts and wiring', () => {
        expect(getRelayVoicingCommunityMessage({ name: 'Relay Lipstick', status: 'ready' } as never)).toMatch(/Building Lipstick\?/);
        expect(getRelayVoicingCommunityMessage({ name: 'Relay Lipstick', status: 'ready' } as never)).toMatch(/parts choices/i);
    });

    it('prompts lab voicings to share early builds', () => {
        expect(getRelayVoicingCommunityMessage({ name: 'Relay Reef', status: 'lab' } as never)).toMatch(/Following Reef\?/);
    });

    it('prompts concept voicings to follow development', () => {
        expect(getRelayVoicingCommunityMessage({ name: 'Relay Hammer', status: 'concept' } as never)).toMatch(/Interested in Hammer\?/);
    });
});

describe('RelayVoicingOverview', () => {
    it('does not render a status badge or callout for ready voicings', async () => {
        render(await RelayVoicingOverview({ voicingSlug: 'velvet', children: 'Body copy' }));

        expect(screen.queryByText('Ready')).not.toBeInTheDocument();
        expect(screen.queryByText('Ready voicing')).not.toBeInTheDocument();
        expect(screen.getByText('Body copy')).toBeInTheDocument();
    });

    it('renders a lab status callout before the overview text', async () => {
        const { container } = render(await RelayVoicingOverview({ voicingSlug: 'reef', children: 'Body copy' }));

        expect(screen.getByText('Lab voicing')).toBeInTheDocument();
        const callout = container.querySelector('[data-relay-status-callout]');
        const overview = container.querySelector('[data-relay-overview-summary]');
        expect(callout && overview ? callout.compareDocumentPosition(overview) & Node.DOCUMENT_POSITION_FOLLOWING : 0).toBeTruthy();
    });

    it('offers both Parts and Wiring as next-step links', async () => {
        render(await RelayVoicingOverview({ voicingSlug: 'lipstick', children: 'Body copy' }));
        expect(screen.getByRole('link', { name: /parts/i })).toHaveAttribute('href', '/relay/parts?voicing=lipstick#electronics');
        expect(screen.getByRole('link', { name: /wiring/i })).toHaveAttribute('href', '/relay/wiring?voicing=lipstick');
    });

    it('renders the community callout after next build steps', async () => {
        const { container } = render(await RelayVoicingOverview({ voicingSlug: 'lipstick', children: 'Body copy' }));

        const nextSteps = container.querySelector('[data-relay-next-steps]');
        const community = container.querySelector('[data-relay-community-callout]');
        expect(nextSteps && community ? nextSteps.compareDocumentPosition(community) & Node.DOCUMENT_POSITION_FOLLOWING : 0).toBeTruthy();
        expect(screen.getByTestId('discord-community-callout')).toHaveTextContent(/Building Lipstick\?/);
        expect(screen.getByTestId('discord-community-callout')).toHaveAttribute('data-thread-id', '1523931871531110440');
    });

    it('uses the voicing forum channel for voicings without a dedicated thread', async () => {
        render(await RelayVoicingOverview({ voicingSlug: 'reef', children: 'Body copy' }));
        expect(screen.getByTestId('discord-community-callout')).toHaveAttribute('data-thread-id', '1523931332428828723');
    });
});
