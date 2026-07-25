import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { HARMONIC_SHAPER_POSITION_DESCRIPTIONS } from '@/config/harmonic-shaper';
import { PrintHarmonicShaper, PrintPositionControlPosition } from './instrument-print-position-control';

const references = ['Direct connection', '47 kΩ series resistor', '100 kΩ series resistor', '100 kΩ + approximately 330 pF', '220 kΩ + approximately 680 pF', 'Middle pickup disconnected'];

describe('compact six-position instrument controls', () => {
    it('renders all Harmonic Shaper positions and installed references', () => {
        render(
            <PrintHarmonicShaper>
                {references.map((technicalReference) => (
                    <PrintPositionControlPosition key={technicalReference} technicalReference={technicalReference} />
                ))}
            </PrintHarmonicShaper>,
        );

        expect(screen.getByRole('heading', { name: 'Harmonic Shaper' })).toBeInTheDocument();
        expect(screen.getByText('6-position selector')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(6);
        expect(screen.getAllByLabelText(/position \d/i).map((item) => item.textContent)).toEqual(['1', '2', '3', '4', '5', '6']);
        expect(screen.getByText(HARMONIC_SHAPER_POSITION_DESCRIPTIONS[0])).toBeInTheDocument();
        expect(screen.getByText(HARMONIC_SHAPER_POSITION_DESCRIPTIONS[5])).toBeInTheDocument();
        expect(screen.getByText('Direct connection')).toBeInTheDocument();
        expect(screen.getByText('Middle pickup disconnected')).toBeInTheDocument();
    });

    it('requires exactly six Harmonic Shaper positions', () => {
        expect(() =>
            render(
                <PrintHarmonicShaper>
                    {references.slice(0, 5).map((technicalReference) => (
                        <PrintPositionControlPosition key={technicalReference} technicalReference={technicalReference} />
                    ))}
                </PrintHarmonicShaper>,
            ),
        ).toThrow('Harmonic Shaper requires exactly six positions but contains 5');
    });
});
