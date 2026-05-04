import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { RelayModelOverview } from './relay-model-overview';

describe('RelayModelOverview', () => {
    it('does not render a status badge or callout for ready models', () => {
        render(<RelayModelOverview modelKey="velvet">Body copy</RelayModelOverview>);

        expect(screen.queryByText('Ready')).not.toBeInTheDocument();
        expect(screen.queryByText('Ready model')).not.toBeInTheDocument();
        expect(screen.getByText('Body copy')).toBeInTheDocument();
    });

    it('renders a lab status callout before the overview text', () => {
        const { container } = render(<RelayModelOverview modelKey="arc">Body copy</RelayModelOverview>);

        expect(screen.getByText('Lab model')).toBeInTheDocument();
        const callout = container.querySelector('[data-relay-status-callout]');
        const overview = container.querySelector('[data-relay-overview-summary]');
        expect(callout && overview ? callout.compareDocumentPosition(overview) & Node.DOCUMENT_POSITION_FOLLOWING : 0).toBeTruthy();
    });
});
