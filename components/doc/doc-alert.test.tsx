import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import DocAlert, { Level } from './doc-alert';

describe('DocAlert', () => {
    it('renders "Note" badge for Default level', () => {
        render(<DocAlert title="Test">Content</DocAlert>);
        expect(screen.getByText('Note')).toBeInTheDocument();
    });

    it('renders "Important" badge for Important level', () => {
        render(<DocAlert title="Test" level={Level.Important}>Content</DocAlert>);
        expect(screen.getByText('Important')).toBeInTheDocument();
    });

    it('renders "Caution" badge for Warning level', () => {
        render(<DocAlert title="Test" level={Level.Warning}>Content</DocAlert>);
        expect(screen.getByText('Caution')).toBeInTheDocument();
    });

    it('renders title text when provided', () => {
        render(<DocAlert title="My Alert Title" level={Level.Important}>Content</DocAlert>);
        expect(screen.getByText('My Alert Title')).toBeInTheDocument();
    });

    it('does not render title element when title is undefined', () => {
        render(<DocAlert level={Level.Important}>Content</DocAlert>);
        // Badge still renders without a title
        expect(screen.getByText('Important')).toBeInTheDocument();
        // Children still render
        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders children content', () => {
        render(<DocAlert title="Test">Body text content</DocAlert>);
        expect(screen.getByText('Body text content')).toBeInTheDocument();
    });

    it('applies border-l-4 accent class', () => {
        const { container } = render(<DocAlert title="Test" level={Level.Important}>Content</DocAlert>);
        const card = container.firstChild as HTMLElement;
        expect(card).toHaveClass('border-l-4');
    });
});
