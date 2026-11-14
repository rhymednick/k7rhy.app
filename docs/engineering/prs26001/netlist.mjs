// PRS26001 circuit source of truth (Rev 2.0, from in-circuit measurements).
// PRS26001-wiring-reference.md describes it; check-netlist.mjs simulates every
// selector position, compares DC resistance with the owner's readings, and
// checks the tone bypass; generate-PRS26001-wiring-reference.mjs draws its
// switch tables from it.

// Seymour Duncan four-conductor convention: black = slug-coil start (hot),
// white = slug-coil finish, red = screw-coil finish, green + bare = ground.
// White and red stay joined as each pickup's series link (B_L, N_L).
// Coil resistances are nominal halves of each humbucker's measured total.
export const coils = [
    { id: 'BN', name: 'Bridge slug coil', a: 'B_H', b: 'B_L', ohms: 3500 },
    { id: 'BS', name: 'Bridge screw coil', a: 'B_L', b: 'GND', ohms: 3500 },
    { id: 'NN', name: 'Neck slug coil', a: 'N_H', b: 'N_L', ohms: 3975 },
    { id: 'NS', name: 'Neck screw coil', a: 'N_L', b: 'GND', ohms: 3975 },
];

export const resistors = [
    { id: 'RB', value: '1.8 kΩ', ohms: 1800, a: 'B_SP', b: 'GND', role: 'Bridge partial split' },
    { id: 'RN', value: '1.8 kΩ', ohms: 1800, a: 'N_SP', b: 'GND', role: 'Neck partial split' },
    { id: 'VOL', value: '500 kΩ', ohms: 500000, a: 'BUS', b: 'GND', role: 'Volume track (full up: wiper at BUS end)' },
];

export const positions = [1, 2, 3, 4, 5];

// Four-pole five-way super switch. Each common closes to one throw per position.
export const superSwitch = [
    { pole: 'A', common: 'BUS', throws: ['B_H', 'B_H', 'B_H', 'open', 'open'] },
    { pole: 'B', common: 'BUS', throws: ['open', 'open', 'N_H', 'N_H', 'N_H'] },
    { pole: 'C', common: 'B_L', throws: ['open', 'B_SP', 'B_SP', 'open', 'open'] },
    { pole: 'D', common: 'N_L', throws: ['open', 'open', 'N_SP', 'N_SP', 'open'] },
];

// DPDT on the master-tone push-pull pot. Pole P lifts the tone capacitor
// when pulled up; pole Q is unused.
export const pushPull = [
    { pole: 'P', common: 'TC_R', down: 'GND', up: 'open' },
    { pole: 'Q', common: 'open', down: 'open', up: 'open' },
];

export const nets = [
    ['B_H', 'Bridge black lead; super-switch A1, A2, A3'],
    ['N_H', 'Neck black lead; super-switch B3, B4, B5'],
    ['B_L', 'Bridge white and red leads joined (series link); super-switch C common'],
    ['N_L', 'Neck white and red leads joined (series link); super-switch D common'],
    ['B_SP', 'Super-switch C2, C3; 1.8 kΩ bridge split resistor to GND'],
    ['N_SP', 'Super-switch D3, D4; 1.8 kΩ neck split resistor to GND'],
    ['BUS', 'Super-switch A and B commons; 500 kΩ volume CW lug; 180 pF treble-bleed capacitor; 500 kΩ tone CCW lug'],
    ['OUT', 'Volume wiper; treble-bleed capacitor; output-jack tip'],
    ['TC_J', 'Tone wiper; 0.022 µF film capacitor'],
    ['TC_R', 'Tone capacitor return; push-pull P common'],
    ['GND', 'Bridge and neck green and bare leads; both 1.8 kΩ split resistors; push-pull P down throw; volume CCW lug; pot cases, switch frame, cavity shielding, bridge/string ground, jack sleeve'],
];

// Owner's readings, 2026-11-13: tip to sleeve at the output jack, volume full
// up, identical with the tone pushed down or pulled up.
export const measuredOhms = { 1: 7000, 2: 4800, 3: 2520, 4: 5300, 5: 7950 };

// Expected coil roles, written by hand. series: full humbucker coil.
// shunted: bridged by its 1.8 kΩ split resistor. off: carries no signal.
export const expected = {
    1: { BN: 'series', BS: 'series', NN: 'off', NS: 'off' },
    2: { BN: 'series', BS: 'shunted', NN: 'off', NS: 'off' },
    3: { BN: 'series', BS: 'shunted', NN: 'series', NS: 'shunted' },
    4: { BN: 'off', BS: 'off', NN: 'series', NS: 'shunted' },
    5: { BN: 'off', BS: 'off', NN: 'series', NS: 'series' },
};

// Owner-facing table, shared with the wiring page and the drawing.
export const operatingStates = [
    [1, 'Bridge humbucker', 'Bridge humbucker, tone bypassed'],
    [2, 'Bridge partial split', 'Bridge partial split, tone bypassed'],
    [3, 'Bridge and neck partial splits together', 'Bridge and neck partial splits together, tone bypassed'],
    [4, 'Neck partial split', 'Neck partial split, tone bypassed'],
    [5, 'Neck humbucker', 'Neck humbucker, tone bypassed'],
];
