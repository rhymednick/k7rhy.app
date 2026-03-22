import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { DocSection } from './doc-section';

describe('DocSection', () => {
    it('renders h1 with border-b class for top-level section', () => {
        const { container } = render(<DocSection title="Operating Instructions" />);
        const heading = container.querySelector('h1');
        expect(heading).not.toBeNull();
        expect(heading).toHaveClass('border-b');
    });

    it('renders h2 for nested section', () => {
        const { container } = render(
            <DocSection title="Operating Instructions">
                <DocSection title="Precautions" />
            </DocSection>
        );
        const h2 = container.querySelector('h2');
        expect(h2).not.toBeNull();
        expect(h2?.textContent).toBe('Precautions');
    });

    it('renders h1 with text-2xl class', () => {
        const { container } = render(<DocSection title="Test" />);
        const heading = container.querySelector('h1');
        expect(heading).toHaveClass('text-2xl');
    });

    it('h2 does not have border-b class', () => {
        const { container } = render(
            <DocSection title="Parent">
                <DocSection title="Child" />
            </DocSection>
        );
        const h2 = container.querySelector('h2');
        expect(h2).not.toHaveClass('border-b');
    });
});
