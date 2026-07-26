// components/coupeville/coupeville-model-grid.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { CoupevilleModelGrid } from './coupeville-model-grid';
import { coupevilleModels } from '@/config/coupeville-models';

describe('CoupevilleModelGrid', () => {
    it('renders a linked card for every model in the registry', () => {
        render(<CoupevilleModelGrid />);
        for (const model of coupevilleModels) {
            const link = screen.getByRole('link', { name: new RegExp(model.name, 'i') });
            expect(link).toHaveAttribute('href', `/coupeville/${model.slug}`);
        }
    });

    it('pulls card copy from the registry', () => {
        render(<CoupevilleModelGrid />);
        for (const model of coupevilleModels) {
            expect(screen.getByText(model.description)).toBeInTheDocument();
            expect(screen.getByText(model.genres)).toBeInTheDocument();
        }
    });

    it('renders no status badges (models are state-free)', () => {
        render(<CoupevilleModelGrid />);
        expect(screen.queryByText(/^(Ready|Lab|Concept|Planned|Available)$/)).not.toBeInTheDocument();
    });
});
