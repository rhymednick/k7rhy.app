import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { HarmonicShaper, PositionControlPosition } from './instrument-position-control';
import { ControlLayout, InstrumentSpec, Pickup, PickupConfiguration, Pot, PotPosition, Selector, SelectorPosition } from './instrument-spec';

const pickups = (
    <PickupConfiguration>
        <Pickup position="bridge" type="humbucker" brand="GFS" model="VEH" />
    </PickupConfiguration>
);

describe('instrument MDX components', () => {
    it('numbers selector children from their sequence', () => {
        render(
            <Selector label="Pickup selector" positions={3}>
                <SelectorPosition voice="Bridge">Attack</SelectorPosition>
                <SelectorPosition voice="Both">Balance</SelectorPosition>
                <SelectorPosition voice="Neck">Warmth</SelectorPosition>
            </Selector>
        );

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('rejects a selector whose child count does not match', () => {
        expect(() =>
            render(
                <Selector label="Pickup selector" positions={3}>
                    <SelectorPosition voice="Bridge">Attack</SelectorPosition>
                    <SelectorPosition voice="Neck">Warmth</SelectorPosition>
                </Selector>
            )
        ).toThrow('Pickup selector declares 3 positions but contains 2');
    });

    it('rejects switched pots without down and up states', () => {
        expect(() =>
            render(
                <Pot label="Volume" mechanism="push-pull">
                    <PotPosition position="down" voice="Core">
                        Output
                    </PotPosition>
                </Pot>
            )
        ).toThrow('Volume push-pull requires exactly one down and one up position');
    });

    it('rejects a standard pot without one normal state', () => {
        expect(() =>
            render(
                <Pot label="Volume" mechanism="standard">
                    <PotPosition position="down" voice="Core">
                        Output
                    </PotPosition>
                </Pot>
            )
        ).toThrow('Volume standard requires exactly one normal position');
    });

    it('rejects a spec missing a control layout', () => {
        expect(() => render(<InstrumentSpec>{pickups}</InstrumentSpec>)).toThrow('InstrumentSpec requires exactly one PickupConfiguration and one ControlLayout');
    });

    it('renders valid pickup, selector, and push-push content', () => {
        render(
            <InstrumentSpec>
                {pickups}
                <ControlLayout>
                    <Selector label="Selector" positions={3}>
                        <SelectorPosition voice="Bridge">Attack</SelectorPosition>
                        <SelectorPosition voice="Both">Balance</SelectorPosition>
                        <SelectorPosition voice="Neck">Warmth</SelectorPosition>
                    </Selector>
                    <Pot label="Tone" mechanism="push-push">
                        <PotPosition position="down" voice="Open">
                            Standard rolloff
                        </PotPosition>
                        <PotPosition position="up" voice="Focused">
                            Tighter response
                        </PotPosition>
                    </Pot>
                </ControlLayout>
            </InstrumentSpec>
        );

        expect(screen.getByText('GFS VEH')).toBeInTheDocument();
        expect(screen.getByText('Focused')).toBeInTheDocument();
    });

    it('accepts a six-position Harmonic Shaper in the control layout', () => {
        render(
            <ControlLayout>
                <HarmonicShaper>
                    {Array.from({ length: 6 }, (_, index) => (
                        <PositionControlPosition key={index} technicalReference={`Network ${index + 1}`} />
                    ))}
                </HarmonicShaper>
            </ControlLayout>
        );

        expect(screen.getByRole('heading', { name: 'Harmonic Shaper' })).toBeInTheDocument();
    });

    it('keeps installed pot details on the web when a compact print description is supplied', () => {
        render(
            <Pot label="Master volume" mechanism="standard">
                <PotPosition position="normal" voice="Master output" printDescription="Controls overall instrument output.">
                    A500K Audio with a 680 pF capacitor
                </PotPosition>
            </Pot>
        );

        expect(screen.getByText('A500K Audio with a 680 pF capacitor')).toBeInTheDocument();
        expect(screen.queryByText('Controls overall instrument output.')).not.toBeInTheDocument();
    });
});
