import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { PrintCaseCardControls } from './print-case-card-controls';

describe('PrintCaseCardControls', () => {
    it('invokes print on mount and provides a working fallback button', () => {
        const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
        render(<PrintCaseCardControls />);

        expect(print).toHaveBeenCalledOnce();
        fireEvent.click(screen.getByRole('button', { name: 'Print case card' }));
        expect(print).toHaveBeenCalledTimes(2);
    });
});
