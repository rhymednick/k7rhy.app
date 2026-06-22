import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { BlogPostNav } from './blog-post-nav';

vi.mock('next/link', () => ({
    default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
        <a href={href} className={className}>
            {children}
        </a>
    ),
}));

const prev = { slug: 'older-post', title: 'Older Post Title', date: '2026-03-01' };
const next = { slug: 'newer-post', title: 'Newer Post Title', date: '2026-03-15' };

describe('BlogPostNav', () => {
    it('renders nothing when both prev and next are null', () => {
        const { container } = render(<BlogPostNav prev={null} next={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders only the prev link when next is null', () => {
        render(<BlogPostNav prev={prev} next={null} />);
        expect(screen.getByText('← Previous')).toBeInTheDocument();
        expect(screen.getByText('Older Post Title')).toBeInTheDocument();
        expect(screen.queryByText('Next →')).not.toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/blog/older-post');
    });

    it('renders only the next link when prev is null', () => {
        render(<BlogPostNav prev={null} next={next} />);
        expect(screen.getByText('Next →')).toBeInTheDocument();
        expect(screen.getByText('Newer Post Title')).toBeInTheDocument();
        expect(screen.queryByText('← Previous')).not.toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/blog/newer-post');
    });

    it('renders both links when both are provided', () => {
        render(<BlogPostNav prev={prev} next={next} />);
        expect(screen.getByText('← Previous')).toBeInTheDocument();
        expect(screen.getByText('Next →')).toBeInTheDocument();
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(2);
        expect(links[0]).toHaveAttribute('href', '/blog/older-post');
        expect(links[1]).toHaveAttribute('href', '/blog/newer-post');
    });

    it('displays the post date in each cell', () => {
        render(<BlogPostNav prev={prev} next={next} />);
        expect(screen.getByText('Saturday, February 28, 2026')).toBeInTheDocument();
        expect(screen.getByText('Saturday, March 14, 2026')).toBeInTheDocument();
    });
});
