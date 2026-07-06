import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { RelayComponentsShoppingList } from './relay-components-shopping-list';
import { resolveRelayComponentList } from '@/lib/relay-components';

describe('RelayComponentsShoppingList', () => {
    it('renders a complete grouped list for a voicing (body + hardware + electronics)', () => {
        const { components } = resolveRelayComponentList('lipstick');
        render(<RelayComponentsShoppingList components={components} />);
        expect(screen.getByRole('heading', { name: 'Body Construction' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Guitar Hardware' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Electronics' })).toBeInTheDocument();
    });

    it('renders voicingTabs immediately before the Electronics section, after Guitar Hardware', () => {
        const { components } = resolveRelayComponentList('lipstick');
        render(<RelayComponentsShoppingList components={components} voicingTabs={<div data-testid="tabs-marker">TABS</div>} />);
        const marker = screen.getByTestId('tabs-marker');
        const hardwareHeading = screen.getByRole('heading', { name: 'Guitar Hardware' });
        const electronicsHeading = screen.getByRole('heading', { name: 'Electronics' });
        expect(hardwareHeading.compareDocumentPosition(marker) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(marker.compareDocumentPosition(electronicsHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
});
