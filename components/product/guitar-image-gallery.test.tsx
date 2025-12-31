import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { GuitarImageGallery } from './guitar-image-gallery';

// Mock ResizeObserver
class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}
global.ResizeObserver = ResizeObserver;

// Mock Carousel components since they rely on Embla which might need more setup
vi.mock('@/components/ui/carousel', () => ({
    Carousel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CarouselContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CarouselItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CarouselNext: () => <button>Next</button>,
    CarouselPrevious: () => <button>Previous</button>,
}));

describe('GuitarImageGallery', () => {
    const mockImages = ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'];

    it('renders images', () => {
        render(<GuitarImageGallery images={mockImages} alt="Test Guitar" />);

        const images = screen.getAllByRole('img');
        // Expect 2 images in the carousel
        expect(images).toHaveLength(2);
        // Next.js Image component modifies the src, so we check if it contains the encoded URL
        const expectedUrl = encodeURIComponent('https://example.com/image1.jpg');
        expect(images[0].getAttribute('src')).toContain(expectedUrl);
    });

    it('opens dialog on image click', () => {
        render(<GuitarImageGallery images={mockImages} alt="Test Guitar" />);

        // Find the clickable container for the first image
        // We added role="button" to it in a previous step
        const imageButtons = screen.getAllByRole('button');
        // Filter out the carousel nav buttons
        const galleryImage = imageButtons.find((btn) => !['Next', 'Previous'].includes(btn.textContent || ''));

        if (galleryImage) {
            fireEvent.click(galleryImage);
            // Dialog should be open.
            // Radix Dialog renders into a portal, but testing-library should find it.
            // We look for the dialog content or title.
            // Since our mock images are strings, the alt text is generated.
            expect(screen.getByText('Test Guitar - Image 1')).toBeDefined();
        }
    });
});
