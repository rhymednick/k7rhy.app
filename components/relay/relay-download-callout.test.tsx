import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { RelayDownloadCallout } from './relay-download-callout';

describe('RelayDownloadCallout', () => {
    it('renders the heading and description', () => {
        render(
            <RelayDownloadCallout
                title="Relay Body — Print files"
                description="Three 3MF files. Print all three to build one body."
                sources={[
                    {
                        kind: 'repo',
                        name: 'relay-body-files',
                        files: [
                            { href: '/downloads/K7RHY Santana - Body.3mf', label: 'Body' },
                            { href: '/downloads/K7RHY Santana - Cap.3mf', label: 'Cap' },
                        ],
                    },
                ]}
            />,
        );
        expect(screen.getByText('Relay Body — Print files')).toBeInTheDocument();
        expect(screen.getByText(/three 3mf files/i)).toBeInTheDocument();
    });

    it('renders an accent-bordered container (testable via data attribute)', () => {
        const { container } = render(
            <RelayDownloadCallout
                title="x"
                description="y"
                sources={[{ kind: 'repo', name: 'n', files: [{ href: '/downloads/K7RHY Santana - Body.3mf', label: 'Body' }] }]}
            />,
        );
        const root = container.querySelector('[data-relay-download-callout]');
        expect(root).not.toBeNull();
    });

    it('renders each file as a download link for the repo source', () => {
        render(
            <RelayDownloadCallout
                title="x"
                description="y"
                sources={[
                    {
                        kind: 'repo',
                        name: 'n',
                        files: [
                            { href: '/downloads/K7RHY Santana - Body.3mf', label: 'Body' },
                            { href: '/downloads/K7RHY Santana - Cap.3mf', label: 'Cap' },
                        ],
                    },
                ]}
            />,
        );
        expect(screen.getByTitle('Download Body')).toBeInTheDocument();
        expect(screen.getByTitle('Download Cap')).toBeInTheDocument();
    });

    it('renders an external link card for a non-repo source', () => {
        render(
            <RelayDownloadCallout
                title="x"
                description="y"
                sources={[
                    { kind: 'makerworld', label: 'MakerWorld', href: 'https://makerworld.example/relay-body' },
                ]}
            />,
        );
        const link = screen.getByRole('link', { name: /makerworld/i });
        expect(link).toHaveAttribute('href', 'https://makerworld.example/relay-body');
        expect(link).toHaveAttribute('target', '_blank');
    });
});
