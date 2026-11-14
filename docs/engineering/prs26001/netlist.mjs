// PRS26001 circuit source of truth. PRS26001-wiring-reference.md describes this
// netlist in prose and tables; check-netlist.mjs simulates every operating state
// from it; generate-PRS26001-wiring-reference.mjs draws its switch tables from it.

// Seymour Duncan four-conductor convention. The slug coil is north (black start,
// white finish); the screw coil is south (green start, red finish). Both pickups
// are mounted with the screw coil toward the bridge, so the inside coils are the
// bridge slug coil and the neck screw coil.
// `plus` is the end that faces BUS when the coil is in phase.
export const coils = [
    { id: 'BN', name: 'Bridge slug coil (north)', plus: 'BUS', minus: 'B_W' },
    { id: 'BS', name: 'Bridge screw coil (south)', plus: 'B_R', minus: 'GND' },
    { id: 'NN', name: 'Neck slug coil (north)', plus: 'BUS', minus: 'N_W' },
    { id: 'NS', name: 'Neck screw coil (south)', plus: 'N_R', minus: 'GND' },
];

export const resistors = [
    { id: 'RB', value: '1.8 kΩ', a: 'B_SP', b: 'GND', role: 'Bridge partial split: shunts the bridge screw coil' },
    { id: 'RN', value: '1.8 kΩ', a: 'N_SP', b: 'BUS', role: 'Neck partial split: shunts the neck slug coil' },
];

export const positions = [1, 2, 3, 4, 5];
export const modes = ['down', 'up'];

// Four-pole five-way super switch. Each common closes to one throw per position.
export const superSwitch = [
    { pole: 'A', common: 'B_W', throws: ['X', 'B_SP', 'X', 'open', 'open'] },
    { pole: 'B', common: 'B_R', throws: ['Y', 'B_SP', 'Y', 'open', 'open'] },
    { pole: 'C', common: 'N_W', throws: ['open', 'N_SP', 'X', 'N_SP', 'X'] },
    { pole: 'D', common: 'N_R', throws: ['open', 'N_SP', 'Y', 'N_SP', 'Y'] },
];

// DPDT on the master-tone push-pull pot.
export const pushPull = [
    { pole: 'P', common: 'X', down: 'Y', up: 'GND' },
    { pole: 'Q', common: 'Y', down: 'open', up: 'BUS' },
];

export const nets = [
    ['BUS', 'Bridge and neck black (slug-coil start) leads; DPDT Q up throw; 1.8 kΩ neck split resistor; volume CW lug; tone CCW lug'],
    ['B_W', 'Bridge white (slug-coil finish); super-switch A common'],
    ['B_R', 'Bridge red (screw-coil finish); super-switch B common'],
    ['N_W', 'Neck white (slug-coil finish); super-switch C common'],
    ['N_R', 'Neck red (screw-coil finish); super-switch D common'],
    ['X', 'Super-switch A1, A3, C3, C5; DPDT P common'],
    ['Y', 'Super-switch B1, B3, D3, D5; DPDT P down throw; DPDT Q common'],
    ['B_SP', 'Super-switch A2, B2; 1.8 kΩ bridge split resistor to GND'],
    ['N_SP', 'Super-switch C2, C4, D2, D4; 1.8 kΩ neck split resistor to BUS'],
    ['OUT', 'Volume wiper; output-jack tip'],
    ['TC_J', 'Tone wiper; 0.022 µF film capacitor to GND'],
    ['GND', 'Bridge and neck green and bare leads; DPDT P up throw; 1.8 kΩ bridge split resistor; volume CCW lug; tone capacitor return; pot cases, switch frame, bridge/string ground, jack sleeve'],
];

// Expected state of every coil, written by hand from the voice map in
// content/instruments/PRS26001.mdx. check-netlist.mjs derives the same from
// the switch tables and fails on any difference.
// series: the coil carries signal in series with its partner.
// parallel: the coil spans BUS to GND directly.
// shunted: the coil is bridged by its 1.8 kΩ split resistor.
// off: the coil carries no signal.
export const expected = {
    '1-down': { BN: 'series', BS: 'series', NN: 'off', NS: 'off' },
    '1-up': { BN: 'parallel', BS: 'parallel', NN: 'off', NS: 'off' },
    '2-down': { BN: 'series', BS: 'shunted', NN: 'shunted', NS: 'series' },
    '2-up': { BN: 'series', BS: 'shunted', NN: 'shunted', NS: 'series' },
    '3-down': { BN: 'series', BS: 'series', NN: 'series', NS: 'series' },
    '3-up': { BN: 'parallel', BS: 'parallel', NN: 'parallel', NS: 'parallel' },
    '4-down': { BN: 'off', BS: 'off', NN: 'shunted', NS: 'series' },
    '4-up': { BN: 'off', BS: 'off', NN: 'shunted', NS: 'series' },
    '5-down': { BN: 'off', BS: 'off', NN: 'series', NS: 'series' },
    '5-up': { BN: 'off', BS: 'off', NN: 'parallel', NS: 'parallel' },
};

// Owner-facing table, shared with the wiring page and the drawing.
export const operatingStates = [
    [1, 'Bridge humbucker, coils in series', 'Bridge humbucker, coils in parallel'],
    [2, 'Bridge slug coil and neck screw coil, each partial split', 'Bridge slug coil and neck screw coil, each partial split'],
    [3, 'Both humbuckers, coils in series', 'Both humbuckers, coils in parallel'],
    [4, 'Neck screw coil, partial split', 'Neck screw coil, partial split'],
    [5, 'Neck humbucker, coils in series', 'Neck humbucker, coils in parallel'],
];
