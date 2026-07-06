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
});
