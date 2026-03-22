import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import DocAlert, { Level } from './doc-alert';

describe('DocAlert', () => {
    it('renders "Note" badge for Default level', () => {
        render(<DocAlert title="Test">Content</DocAlert>);
        expect(screen.getByText('Note')).toBeDefined();
    });

    it('renders "Important" badge for Important level', () => {
        render(<DocAlert title="Test" level={Level.Important}>Content</DocAlert>);
        expect(screen.getByText('Important')).toBeDefined();
    });

    it('renders "Caution" badge for Warning level', () => {
        render(<DocAlert title="Test" level={Level.Warning}>Content</DocAlert>);
        expect(screen.getByText('Caution')).toBeDefined();
    });

    it('renders title text when provided', () => {
        render(<DocAlert title="My Alert Title" level={Level.Important}>Content</DocAlert>);
        expect(screen.getByText('My Alert Title')).toBeDefined();
    });

    it('does not render title element when title is undefined', () => {
        const { container } = render(<DocAlert level={Level.Important}>Content</DocAlert>);
        expect(screen.getByText('Important')).toBeDefined();
        expect(container.querySelectorAll('span').length).toBe(1); // only badge span
    });

    it('renders children content', () => {
        render(<DocAlert title="Test">Body text content</DocAlert>);
        expect(screen.getByText('Body text content')).toBeDefined();
    });

    it('applies border-l-4 accent class', () => {
        const { container } = render(<DocAlert title="Test" level={Level.Important}>Content</DocAlert>);
        const card = container.firstChild as HTMLElement;
        expect(card).toHaveClass('border-l-4');
    });
});
