import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { RelayVoicingOverview } from './relay-voicing-overview';

describe('RelayVoicingOverview', () => {
    it('does not render a status badge or callout for ready voicings', () => {
        render(<RelayVoicingOverview voicingSlug="velvet">Body copy</RelayVoicingOverview>);

        expect(screen.queryByText('Ready')).not.toBeInTheDocument();
        expect(screen.queryByText('Ready voicing')).not.toBeInTheDocument();
        expect(screen.getByText('Body copy')).toBeInTheDocument();
    });

    it('renders a lab status callout before the overview text', () => {
        const { container } = render(<RelayVoicingOverview voicingSlug="arc">Body copy</RelayVoicingOverview>);

        expect(screen.getByText('Lab voicing')).toBeInTheDocument();
        const callout = container.querySelector('[data-relay-status-callout]');
        const overview = container.querySelector('[data-relay-overview-summary]');
        expect(callout && overview ? callout.compareDocumentPosition(overview) & Node.DOCUMENT_POSITION_FOLLOWING : 0).toBeTruthy();
    });
});
