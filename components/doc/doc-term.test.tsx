import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Radix HoverCard relies on pointer events and portals — mock to render synchronously
vi.mock('@/components/ui/hover-card', () => ({
    HoverCard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    HoverCardTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => <>{children}</>,
    HoverCardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="hover-content">{children}</div>,
}));

import { DocTerm } from '@/components/doc/doc-term';

describe('DocTerm', () => {
    it('renders explicit children as the trigger label', () => {
        render(<DocTerm id="gfs">GFS pickups</DocTerm>);
        expect(screen.getByText('GFS pickups')).toBeInTheDocument();
    });

    it('uses the glossary label when no children are provided', () => {
        render(<DocTerm id="gfs" />);
        expect(screen.getByText('GFS')).toBeInTheDocument();
    });

    it('renders the glossary definition in the hover content', () => {
        render(<DocTerm id="gfs" />);
        const content = screen.getByTestId('hover-content');
        expect(content.textContent).toContain('GFS pickups');
    });

    it('renders the trigger span with cursor-help class', () => {
        const { container } = render(<DocTerm id="gfs">GFS</DocTerm>);
        expect(container.querySelector('span.cursor-help')).not.toBeNull();
    });

    it('renders the trigger span with dotted border classes', () => {
        const { container } = render(<DocTerm id="gfs">GFS</DocTerm>);
        const span = container.querySelector('span');
        expect(span).toHaveClass('border-dotted', 'border-b');
    });

    it('renders plain text for an unknown id — no crash', () => {
        render(<DocTerm id="unknown-term">mystery word</DocTerm>);
        expect(screen.getByText('mystery word')).toBeInTheDocument();
        expect(screen.queryByTestId('hover-content')).not.toBeInTheDocument();
    });

    it('falls back to the id string when id is unknown and no children provided', () => {
        render(<DocTerm id="unknown-term" />);
        expect(screen.getByText('unknown-term')).toBeInTheDocument();
    });

    it('does not render hover content for unknown id', () => {
        render(<DocTerm id="nope">text</DocTerm>);
        expect(screen.queryByTestId('hover-content')).not.toBeInTheDocument();
    });
});
