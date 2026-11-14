// Recommended power limits for the stripboard build, derived from one rule so the sheet, the checks, and
// reference.md §7 cannot drift apart. The owner delegated these numbers to the engineer on 2026-10-25. They are a
// recommendation pending a thermal test (reference.md §7.3), not a measured rating.

export const RESISTORS = 8; // equal power sharing: each resistor dissipates 1/8 of the input power (reference.md §8.5)

export const RULES = {
    continuousFraction: 0.42, // continuous: each resistor at no more than 42 % of its nameplate watts
    burstFraction: 0.84, // short bursts: no more than 84 % of nameplate
    burstSeconds: 30, // longest single burst
    restSeconds: 120, // minimum rest after a burst
    hardCapWatts: 20, // never above 20 W: the detector's design limit and the kit's own continuous claim
    minimumNameplateWatts: 2, // 1 W resistors are not suitable
};

// Limits for a build using resistors with the given nameplate rating (watts each), rounded down to whole watts.
export function limitsFor(nameplateWatts) {
    return {
        continuous: Math.floor(RESISTORS * nameplateWatts * RULES.continuousFraction),
        burst: Math.min(RULES.hardCapWatts, Math.floor(RESISTORS * nameplateWatts * RULES.burstFraction)),
    };
}

// Peak reverse voltage across D1 at an input power into 50 ohm: the half-voltage tap swings +/-Vm while C1 holds
// about +Vm - Vf on the cathode, so the diode sees about 2*Vm - Vf = sqrt(2*P*50) - Vf.
export const peakInverseVolts = (watts, forwardDrop = 0.3) => Math.sqrt(2 * watts * 50) - forwardDrop;

// Datasheet reverse ratings (reference.md §5; sources linked there).
export const DIODES = { BAT46: { reverseVolts: 100, capacitancePf: 10 }, '1N5711': { reverseVolts: 70, capacitancePf: 2 } };
