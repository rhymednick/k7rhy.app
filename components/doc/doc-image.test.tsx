import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { DocImage } from './doc-image';

// DocImage is an async RSC — call it as a function and render the result
describe('DocImage', () => {
    it('renders thumbnail with rounded corners and indigo border', async () => {
        const jsx = await DocImage({ title: 'Test image', src: '/test.jpg', alt: 'Test', triggerImageSize: 120, popupImageSize: 1000 });
        const { container } = render(jsx);
        const triggerWrapper = container.querySelector('.rounded-lg');
        expect(triggerWrapper).not.toBeNull();
        expect(triggerWrapper).toHaveClass('border');
    });

    it('renders zoom icon overlay element', async () => {
        const jsx = await DocImage({ title: 'Test image', src: '/test.jpg', alt: 'Test', triggerImageSize: 120, popupImageSize: 1000 });
        const { container } = render(jsx);
        // The overlay div exists (hidden by default via opacity-0)
        const overlay = container.querySelector('.opacity-0');
        expect(overlay).not.toBeNull();
    });
});
