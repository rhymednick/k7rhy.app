import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
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
                        <PrintPotPosition position="down" voice="Core">Series mode</PrintPotPosition>
                        <PrintPotPosition position="up" voice="Clean">Parallel mode</PrintPotPosition>
                    </PrintPot>
                </PrintControlLayout>
            </PrintInstrumentSpec>,
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
});
