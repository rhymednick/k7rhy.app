import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { DownloadGroup, DownloadGroupFile } from './download-files';

describe('DownloadGroupFile', () => {
    it('uses the downloaded filename as its label when no label is provided', () => {
        render(<DownloadGroupFile href="/downloads/K7RHY Relay Flex Body.3mf" />);

        expect(screen.getByText('K7RHY Relay Flex Body.3mf')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Download K7RHY Relay Flex Body.3mf' })).toHaveAttribute('href', '/downloads/K7RHY Relay Flex Body.3mf');
    });

    it('uses a custom label when one is provided', () => {
        render(<DownloadGroupFile href="/downloads/K7RHY Relay Flex Body.3mf" label="Body" />);

        expect(screen.getByText('Body')).toBeInTheDocument();
        expect(screen.queryByText('K7RHY Relay Flex Body.3mf')).not.toBeInTheDocument();
    });
});

describe('DownloadGroup', () => {
    it('passes derived filename labels through to each file row', () => {
        render(
            <DownloadGroup
                title="Relay body print files"
                files={[
                    { href: '/downloads/K7RHY Relay Flex Body.3mf' },
                    { href: '/downloads/K7RHY Relay Flex Cap.3mf' },
                ]}
            />
        );

        expect(screen.getByText('K7RHY Relay Flex Body.3mf')).toBeInTheDocument();
        expect(screen.getByText('K7RHY Relay Flex Cap.3mf')).toBeInTheDocument();
    });
});
