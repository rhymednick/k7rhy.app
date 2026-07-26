import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { HARMONIC_SHAPER_POSITION_DESCRIPTIONS, HARMONIC_SHAPER_PURPOSE } from '@/config/harmonic-shaper';
import { HarmonicShaper, PositionControl, PositionControlPosition } from './instrument-position-control';

const sixPositions = Array.from({ length: 6 }, (_, index) => <PositionControlPosition key={index} description={`Contour ${index + 1}`} technicalReference={`${index + 1} kΩ`} />);

describe('six-position instrument controls', () => {
    it('renders a generic label, purpose, numbered descriptions, and technical references', () => {
        render(
            <PositionControl label="Six-way contour" purpose="Chooses one of six passive contours.">
                {sixPositions}
            </PositionControl>
        );

        expect(screen.getByRole('heading', { name: 'Six-way contour' })).toBeInTheDocument();
        expect(screen.getByText('Chooses one of six passive contours.')).toBeInTheDocument();
        expect(screen.getByText('Contour 1')).toBeInTheDocument();
        expect(screen.getByText('6 kΩ')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(6);
        expect(screen.getAllByLabelText(/position \d/i).map((item) => item.textContent)).toEqual(['1', '2', '3', '4', '5', '6']);
    });

    it('requires exactly six positions', () => {
        expect(() =>
            render(
                <PositionControl label="Six-way contour" purpose="Chooses one of six passive contours.">
                    {sixPositions.slice(0, 5)}
                </PositionControl>
            )
        ).toThrow('Six-way contour requires exactly six positions but contains 5');
    });

    it('rejects unsupported children', () => {
        expect(() =>
            render(
                <PositionControl label="Six-way contour" purpose="Chooses one of six passive contours.">
                    <div />
                </PositionControl>
            )
        ).toThrow('Six-way contour contains an unsupported child');
    });

    it('requires positions to be rendered by a parent control', () => {
        expect(() => render(<PositionControlPosition description="Contour" />)).toThrow('PositionControlPosition must be rendered inside PositionControl');
    });

    it('uses shared Harmonic Shaper language while preserving installed references', () => {
        render(
            <HarmonicShaper>
                <PositionControlPosition technicalReference="Direct connection" />
                <PositionControlPosition technicalReference="47 kΩ series resistor" />
                <PositionControlPosition technicalReference="100 kΩ series resistor" />
                <PositionControlPosition technicalReference="100 kΩ + approximately 330 pF" />
                <PositionControlPosition technicalReference="220 kΩ + approximately 680 pF" />
                <PositionControlPosition technicalReference="Middle pickup disconnected" />
            </HarmonicShaper>
        );

        expect(screen.getByRole('heading', { name: 'Harmonic Shaper' })).toBeInTheDocument();
        expect(screen.getByText('6-position rotary switch')).toBeInTheDocument();
        expect(screen.getByText(HARMONIC_SHAPER_PURPOSE)).toBeInTheDocument();
        for (const description of HARMONIC_SHAPER_POSITION_DESCRIPTIONS) expect(screen.getByText(description)).toBeInTheDocument();
        expect(screen.getByText('Direct connection')).toBeInTheDocument();
        expect(screen.getByText('Middle pickup disconnected')).toBeInTheDocument();
    });
});
