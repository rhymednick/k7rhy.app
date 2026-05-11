import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { CardGrid, CardGridItem } from './card-grid';

describe('CardGrid', () => {
    it('renders children in a responsive three-column grid by default', () => {
        const { container } = render(
            <CardGrid>
                <CardGridItem title="Print">Print the body parts.</CardGridItem>
            </CardGrid>
        );

        const grid = container.firstChild as HTMLElement;
        expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-3');
        expect(screen.getByRole('heading', { name: 'Print' })).toBeInTheDocument();
    });

    it('supports a two-column layout', () => {
        const { container } = render(
            <CardGrid columns={2}>
                <CardGridItem title="One">First card.</CardGridItem>
                <CardGridItem title="Two">Second card.</CardGridItem>
            </CardGrid>
        );

        const grid = container.firstChild as HTMLElement;
        expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2');
        expect(grid).not.toHaveClass('md:grid-cols-3');
    });
});

describe('CardGridItem', () => {
    it('renders as a link when href is provided', () => {
        render(
            <CardGridItem eyebrow="Step 1" title="Print" href="/relay/body/print" cta="Open print guide">
                Download the print files.
            </CardGridItem>
        );

        const link = screen.getByRole('link', { name: /step 1/i });
        expect(link).toHaveAttribute('href', '/relay/body/print');
        expect(screen.getByRole('heading', { name: 'Print' })).toBeInTheDocument();
        expect(screen.getByText('Download the print files.')).toBeInTheDocument();
        expect(screen.getByText('Open print guide')).toBeInTheDocument();
    });

    it('renders static content when href is omitted', () => {
        render(
            <CardGridItem title="What it is">
                A 3D-printed electric guitar you build at home.
            </CardGridItem>
        );

        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'What it is' })).toBeInTheDocument();
        expect(screen.getByText('A 3D-printed electric guitar you build at home.')).toBeInTheDocument();
    });

    it('omits optional eyebrow and cta when they are not provided', () => {
        render(<CardGridItem title="Plain">Plain card body.</CardGridItem>);

        expect(screen.queryByText(/step/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/guide/i)).not.toBeInTheDocument();
        expect(screen.getByText('Plain card body.')).toBeInTheDocument();
    });
});
