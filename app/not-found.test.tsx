import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { navConfig } from '@/config/navigation';
import NotFound, { metadata } from './not-found';

describe('site not-found page', () => {
    it('states the error and offers a way back', () => {
        render(<NotFound />);

        expect(screen.getByText('404')).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/');
        for (const item of navConfig.mainNav) {
            expect(screen.getByRole('link', { name: item.title })).toHaveAttribute('href', item.href);
        }
    });

    it('is titled and kept out of search indexes', () => {
        expect(metadata.title).toBe('Page not found | K7RHY');
        expect(metadata.robots).toEqual({ index: false, follow: false });
    });
});
