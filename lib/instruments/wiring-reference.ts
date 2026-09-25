export interface InstrumentWiringReference {
    serial: string;
    title: string;
    summary: string;
    revision: string;
    revised: string;
    diagram: string;
    diagramWidth: number;
    diagramHeight: number;
    diagramAlt: string;
    modeLabels: [string, string];
    positions: Array<[number, string, string]>;
    switchIntro: string;
    contacts: Array<[string, string, string, string, string, string]>;
    modeSwitch: string;
    parts: string[];
    nets: Array<[string, string]>;
}

const trebleBleed = 'Treble bleed: a 1,200 pF capacitor in parallel with a 150 kΩ resistor, from the volume input, then a 20 kΩ resistor to the volume wiper.';
const controls = 'A250K audio-taper master volume, A500K audio-taper master tone, 22 nF (0.022 µF) non-polarized tone capacitor, and mono output jack.';

export const instrumentWiringReferences: Record<string, InstrumentWiringReference> = {
    STR26001: {
        serial: 'STR26001',
        title: 'Series switching',
        summary: 'The five-way selector keeps the familiar S-type choices. The small switch changes the bridge-and-middle and middle-and-neck combinations from parallel to series; the single-pickup positions are unchanged.',
        revision: '1.1',
        revised: '2026-09-25',
        diagram: '/wiring-diagrams/STR26001-wiring-rev-1.1.png',
        diagramWidth: 2400,
        diagramHeight: 1810,
        diagramAlt: 'STR26001 CuNiFe S-Type wiring reference showing Fender CuNiFe pickups, four-pole five-way super-switch contacts, a DPDT series switch, rear-view volume and tone controls, ten operating states, and common ground.',
        modeLabels: ['Normal', 'Series'],
        positions: [
            [1, 'Bridge', 'Bridge'],
            [2, 'Bridge and middle in parallel', 'Middle and bridge in series'],
            [3, 'Middle', 'Middle'],
            [4, 'Middle and neck in parallel', 'Middle and neck in series'],
            [5, 'Neck', 'Neck'],
        ],
        switchIntro: 'Contacts are shown by function. In each blade position, each pole common closes to one numbered throw.',
        contacts: [
            ['A / BUS', 'B_H', 'M_H', 'M_H', 'M_H', 'N_H'],
            ['B / OR', 'open', 'B_H', 'open', 'N_H', 'open'],
            ['C / J', 'open', 'B_H', 'open', 'N_H', 'open'],
            ['D / M_C', 'open', 'MR', 'GND', 'MR', 'open'],
        ],
        modeSwitch: 'The DPDT has two independent poles. In normal mode, pole X joins OR to BUS and pole Y joins MR to GND. In series mode, X leaves OR open and Y joins MR to J, so the middle coil return feeds the selected outer pickup. OR and J are never joined. Each pickup has its own shield lead to GND, so the middle pickup stays shielded when M_C is switched.',
        parts: ['Fender CuNiFe Stratocaster bridge, middle, and neck pickups, each with an isolated shield lead.', 'Four-pole five-way super switch and latching DPDT on-on micro switch.', controls, trebleBleed],
        nets: [
            ['B_H', 'Bridge hot to super-switch A1, B2, and C2.'],
            ['M_H', 'Middle hot to super-switch A2, A3, and A4.'],
            ['N_H', 'Neck hot to super-switch A5, B4, and C4.'],
            ['BUS', 'Super-switch A common, DPDT X normal throw, volume input, master-tone feed, and treble-bleed input.'],
            ['OR / J', 'Separate B and C pole commons. OR goes to DPDT X common; J goes to DPDT Y series throw.'],
            ['M_C / MR', 'Middle coil return M_C goes to pole D common. D2 and D4 join MR at DPDT Y common; D3 goes directly to GND.'],
            ['TB_J', 'The 1,200 pF capacitor and 150 kΩ resistor run in parallel from BUS to TB_J. The 20 kΩ resistor runs from TB_J to OUT.'],
            ['TC_J', 'The A500K tone wiper runs through the 22 nF capacitor to GND. The tone pot CCW lug takes BUS; its CW lug is unused.'],
            ['OUT', 'Volume wiper, treble-bleed output, and output-jack tip.'],
            ['GND', 'Bridge and neck coil returns; all three pickup shield leads; DPDT Y normal throw; volume track ground; tone-cap return; pot and switch cases, cavity shield, bridge/string ground, and jack sleeve.'],
        ],
    },
    STR26002: {
        serial: 'STR26002',
        title: 'Neck-add switching',
        summary: 'The five-way selector keeps the familiar S-type choices. The small switch adds the neck pickup in parallel, providing bridge-and-neck and all-three-pickup combinations.',
        revision: '1.1',
        revised: '2026-09-25',
        diagram: '/wiring-diagrams/STR26002-wiring-rev-1.1.png',
        diagramWidth: 2400,
        diagramHeight: 1830,
        diagramAlt: 'STR26002 CuNiFe S-Type wiring reference showing Fender CuNiFe pickups, standard five-way contacts, an SPST neck-add switch, rear-view volume and tone controls, ten operating states, and common ground.',
        modeLabels: ['Neck-add off', 'Neck-add on'],
        positions: [
            [1, 'Bridge', 'Bridge and neck in parallel'],
            [2, 'Bridge and middle in parallel', 'Bridge, middle, and neck in parallel'],
            [3, 'Middle', 'Middle and neck in parallel'],
            [4, 'Middle and neck in parallel', 'Middle and neck in parallel'],
            [5, 'Neck', 'Neck'],
        ],
        switchIntro: 'One pole of the standard five-way selects the pickups; the second pole is unused. Adjacent throws overlap in positions 2 and 4.',
        contacts: [['Pickup pole / BUS', 'B-H', 'B-H + M-H', 'M-H', 'M-H + N-H', 'N-H']],
        modeSwitch: 'The SPST connects neck hot N-H directly to BUS when on and leaves that path open when off. It adds no new pickup in positions 4 and 5 because the blade already selects the neck. All three coil returns stay grounded in every state.',
        parts: ['Fender CuNiFe Stratocaster bridge, middle, and neck pickups, each with an isolated shield lead.', 'Standard five-way blade and latching SPST on-off micro switch.', controls, trebleBleed],
        nets: [
            ['B-H', 'Bridge hot to the blade bridge throw.'],
            ['M-H', 'Middle hot to the blade middle throw.'],
            ['N-H', 'Neck hot to the blade neck throw and the SPST neck-add terminal.'],
            ['BUS', 'Blade common, SPST common, volume input, master-tone feed, and treble-bleed input.'],
            ['TB-J', 'The 1,200 pF capacitor and 150 kΩ resistor run in parallel from BUS to TB-J. The 20 kΩ resistor runs from TB-J to OUT.'],
            ['T-W', 'The A500K tone wiper runs through the 22 nF capacitor to GND. The tone pot CCW lug takes BUS; its CW lug is unused.'],
            ['OUT', 'Volume wiper, treble-bleed output, and output-jack tip.'],
            ['GND', 'All three coil returns and shield leads; volume track ground; tone-cap return; pot and switch cases, cavity shield, bridge/string ground, and jack sleeve.'],
        ],
    },
};

export function getInstrumentWiringReference(serial: string): InstrumentWiringReference | undefined {
    return Object.hasOwn(instrumentWiringReferences, serial) ? instrumentWiringReferences[serial] : undefined;
}
