import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { PrintHarmonicShaper, PrintPositionControlPosition } from './instrument-print-position-control';
import { PrintControlLayout, PrintInstrumentSpec, PrintPickup, PrintPickupConfiguration, PrintPickupDetail, PrintPot, PrintPotPosition, PrintSelector, PrintSelectorPosition } from './instrument-print-spec';

describe('compact instrument print components', () => {
    it('renders the full control map and compact pickup identities from the same MDX shape', () => {
        render(
            <PrintInstrumentSpec>
                <PrintPickupConfiguration>
                    <PrintPickup position="bridge" type="humbucker" brand="Seymour Duncan" model="APH-1b Alnico II Pro">
                        <PrintPickupDetail label="Magnet">Alnico II</PrintPickupDetail>
                    </PrintPickup>
                    <PrintPickup position="neck" type="humbucker" brand="Seymour Duncan" model="APH-1n Alnico II Pro">
                        <PrintPickupDetail label="Magnet">Alnico II</PrintPickupDetail>
                    </PrintPickup>
                </PrintPickupConfiguration>
                <PrintControlLayout>
                    <PrintSelector label="Pickup selector" positions={3}>
                        <PrintSelectorPosition voice="Bridge">Full output</PrintSelectorPosition>
                        <PrintSelectorPosition voice="Both">Balanced blend</PrintSelectorPosition>
                        <PrintSelectorPosition voice="Neck">Warm voice</PrintSelectorPosition>
                    </PrintSelector>
                    <PrintPot label="Tone" mechanism="push-pull">
                        <PrintPotPosition position="down" voice="Core">
                            Series mode
                        </PrintPotPosition>
                        <PrintPotPosition position="up" voice="Clean">
                            Parallel mode
                        </PrintPotPosition>
                    </PrintPot>
                </PrintControlLayout>
            </PrintInstrumentSpec>
        );

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('Series mode')).toBeInTheDocument();
        expect(screen.getByText('Parallel mode')).toBeInTheDocument();
        expect(screen.getByText('Seymour Duncan APH-1b Alnico II Pro')).toBeInTheDocument();
        expect(screen.getByText('Seymour Duncan APH-1n Alnico II Pro')).toBeInTheDocument();
        expect(screen.queryByText('Magnet')).not.toBeInTheDocument();
    });

    it('accepts the compact Harmonic Shaper in the control layout', () => {
        render(
            <PrintControlLayout>
                <PrintHarmonicShaper>
                    {Array.from({ length: 6 }, (_, index) => (
                        <PrintPositionControlPosition key={index} technicalReference={`Network ${index + 1}`} />
                    ))}
                </PrintHarmonicShaper>
            </PrintControlLayout>
        );

        expect(screen.getByRole('heading', { name: 'Harmonic Shaper' })).toBeInTheDocument();
    });

    it('groups standard volume and tone controls into one compact print row', () => {
        const { container } = render(
            <PrintControlLayout>
                <PrintPot label="Master volume" mechanism="standard">
                    <PrintPotPosition position="normal" voice="Master output" printDescription="Controls overall instrument output.">
                        A500K Audio with a 680 pF capacitor
                    </PrintPotPosition>
                </PrintPot>
                <PrintPot label="Master tone" mechanism="standard">
                    <PrintPotPosition position="normal" voice="Treble rolloff" printDescription="Provides conventional treble rolloff.">
                        A500K Audio with a 22 nF capacitor
                    </PrintPotPosition>
                </PrintPot>
            </PrintControlLayout>
        );

        const potGrid = container.querySelector('[data-print-pot-grid]');
        expect(potGrid).toBeInTheDocument();
        expect(potGrid).toHaveClass('grid-cols-2');
        expect(potGrid).toHaveTextContent('Master volume');
        expect(potGrid).toHaveTextContent('Master tone');
        expect(potGrid).toHaveTextContent('Controls overall instrument output.');
        expect(potGrid).toHaveTextContent('Provides conventional treble rolloff.');
        expect(potGrid).not.toHaveTextContent('A500K');
        expect(potGrid).not.toHaveTextContent('680 pF');
        expect(potGrid).not.toHaveTextContent('22 nF');
        expect(potGrid).not.toHaveTextContent('standard');
        expect(potGrid).not.toHaveTextContent('normal');
    });

    it('keeps a three-pickup configuration on one compact print row', () => {
        const { container } = render(
            <PrintPickupConfiguration>
                <PrintPickup position="neck" type="humbucker" brand="GFS" model="Vintage 59 Humbucker" />
                <PrintPickup position="middle" type="filtertron" brand="GFS" model="Retrotron Hot Nashville" />
                <PrintPickup position="bridge" type="humbucker" brand="GFS" model="Professional Series Alnico V HOT Humbucker" />
            </PrintPickupConfiguration>
        );

        expect(container.querySelector('[data-print-pickup-grid]')).toHaveClass('grid-cols-3');
        expect(screen.getByRole('heading', { name: 'Pickup configuration' })).toBeInTheDocument();
        expect(screen.queryByText('filtertron')).not.toBeInTheDocument();
    });
});
