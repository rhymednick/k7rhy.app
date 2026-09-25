export interface InstrumentWiringReference {
    serial: 'STR26001' | 'STR26002';
    title: string;
    summary: string;
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
    buildSteps: string[];
    checks: string[];
}

export const instrumentWiringReferences: Record<'STR26001' | 'STR26002', InstrumentWiringReference> = {
    STR26001: {
        serial: 'STR26001',
        title: 'Series switching',
        summary: 'The five-way selector retains familiar S-type choices. The small switch changes the bridge-and-middle and middle-and-neck combinations from parallel to series; the single-pickup positions stay unchanged.',
        diagram: '/wiring-diagrams/STR26001-wiring-rev-1.0.png',
        diagramWidth: 2400,
        diagramHeight: 1810,
        diagramAlt: 'STR26001 wiring reference showing Fender CuNiFe pickups, four-pole five-way super-switch contacts, a DPDT series switch, rear-view volume and tone controls, ten operating states, and common ground.',
        modeLabels: ['Normal', 'Series'],
        positions: [
            [1, 'Bridge', 'Bridge'],
            [2, 'Bridge and middle in parallel', 'Middle and bridge in series'],
            [3, 'Middle', 'Middle'],
            [4, 'Middle and neck in parallel', 'Middle and neck in series'],
            [5, 'Neck', 'Neck'],
        ],
        switchIntro: 'The following labels describe electrical contacts, not the physical lug order of an unidentified super switch. Each pole common closes to one numbered throw in each blade position.',
        contacts: [
            ['A / BUS', 'B_H', 'M_H', 'M_H', 'M_H', 'N_H'],
            ['B / OR', 'open', 'B_H', 'open', 'N_H', 'open'],
            ['C / J', 'open', 'B_H', 'open', 'N_H', 'open'],
            ['D / M_C', 'open', 'MR', 'GND', 'MR', 'open'],
        ],
        modeSwitch: 'The DPDT has two independent poles. In normal mode, pole X joins OR to BUS and pole Y joins MR to GND. In series mode, X leaves OR open and Y joins MR to J. Never bridge OR and J. The middle pickup cover must remain grounded separately when its coil return M_C is lifted.',
        parts: ['Fender CuNiFe Stratocaster bridge, middle, and neck pickups; identify hot, coil return, and any separate cover or case lead from the supplied Fender guide and a meter.', 'Four-pole five-way super switch and latching DPDT on-on micro switch.', 'A250K audio-taper master volume, A500K audio-taper master tone, 22 nF (0.022 µF) non-polarized tone capacitor, and mono output jack.', 'Treble bleed: 1,200 pF capacitor in parallel with a 150 kΩ resistor; that pair in series with a 20 kΩ resistor across the volume input and wiper.'],
        nets: [
            ['B_H', 'Bridge hot to super-switch A1, B2, and C2.'],
            ['M_H', 'Middle hot to super-switch A2, A3, and A4.'],
            ['N_H', 'Neck hot to super-switch A5, B4, and C4.'],
            ['BUS', 'Super-switch A common, DPDT X normal throw, volume input, master-tone feed, and treble-bleed input.'],
            ['OR / J', 'Separate B and C pole commons. OR goes to DPDT X common; J goes to DPDT Y series throw. Do not join them.'],
            ['M_C / MR', 'Middle coil return M_C goes to pole D common. D2 and D4 join MR at DPDT Y common; D3 goes directly to GND.'],
            ['TB_J', 'The 20 kΩ treble-bleed resistor runs from BUS to TB_J. The 1,200 pF capacitor and 150 kΩ resistor run in parallel from TB_J to OUT.'],
            ['TC_J', 'The A500K tone wiper runs through the 22 nF capacitor to GND. The tone pot CCW lug takes BUS; its CW lug is unused.'],
            ['OUT', 'Volume wiper, treble-bleed output, and output-jack tip.'],
            ['GND', 'Bridge and neck coil returns; separately grounded middle cover; DPDT Y normal throw; volume track ground; tone-cap return; pot and switch cases, cavity shield, bridge/string ground, and jack sleeve.'],
        ],
        buildSteps: ['Identify the three pickup leads and any separate shields or covers. Confirm the middle cover can stay grounded while M_C is switched.', 'Map all four super-switch poles and the two DPDT throws by continuity. Wire the functional contact table without joining OR and J.', 'Connect the A250K volume, A500K tone and 22 nF capacitor, three-part treble bleed, common ground, and mono output jack.', 'Meter the ten states and perform the pickup tap and control checks below before installing the harness.'],
        checks: ['Identify actual pickup leads and confirm that the middle cover remains grounded independently of the switchable middle coil return.', 'Map all four blade poles and both DPDT throws with a continuity meter before soldering. Confirm pickup phase in positions 2 and 4.', 'Meter and tap-test all ten states. Confirm clockwise volume increases level, clockwise tone increases brightness, and jack tip and sleeve are not reversed.'],
    },
    STR26002: {
        serial: 'STR26002',
        title: 'Neck-add switching',
        summary: 'The five-way selector retains familiar S-type choices. The small switch adds the neck pickup in parallel, providing bridge-and-neck and all-three-pickup combinations.',
        diagram: '/wiring-diagrams/STR26002-wiring-rev-1.0.png',
        diagramWidth: 2400,
        diagramHeight: 1830,
        diagramAlt: 'STR26002 wiring reference showing Fender CuNiFe pickups, standard five-way functional contacts, an SPST neck-add switch, rear-view volume and tone controls, ten operating states, and common ground.',
        modeLabels: ['Neck-add off', 'Neck-add on'],
        positions: [
            [1, 'Bridge', 'Bridge and neck in parallel'],
            [2, 'Bridge and middle in parallel', 'Bridge, middle, and neck in parallel'],
            [3, 'Middle', 'Middle and neck in parallel'],
            [4, 'Middle and neck in parallel', 'Middle and neck in parallel'],
            [5, 'Neck', 'Neck'],
        ],
        switchIntro: 'The following table describes the functional pickup pole of a standard five-way blade. Adjacent throws overlap in positions 2 and 4; the other blade pole is unused. Identify the physical common and throws on the switch in hand.',
        contacts: [['Pickup pole / BUS', 'B-H', 'B-H + M-H', 'M-H', 'M-H + N-H', 'N-H']],
        modeSwitch: 'The SPST connects neck hot N-H directly to BUS when on and leaves that extra path open when off. It adds no new pickup in positions 4 and 5 because the blade already selects the neck. All three coil returns stay grounded in every state.',
        parts: ['Fender CuNiFe Stratocaster bridge, middle, and neck pickups; identify hot, return, and any separate cover or case lead from the supplied Fender guide and a meter.', 'Standard five-way blade and latching SPST on-off micro switch.', 'A250K audio-taper master volume, A500K audio-taper master tone, 22 nF (0.022 µF) non-polarized tone capacitor, and mono output jack.', 'Treble bleed: 1,200 pF capacitor in parallel with a 150 kΩ resistor; that pair in series with a 20 kΩ resistor across the volume input and wiper.'],
        nets: [
            ['B-H', 'Bridge hot to the blade bridge throw.'],
            ['M-H', 'Middle hot to the blade middle throw.'],
            ['N-H', 'Neck hot to the blade neck throw and the SPST neck-add terminal.'],
            ['BUS', 'Blade common, SPST common, volume input, master-tone feed, and treble-bleed input.'],
            ['TB-J', 'The 1,200 pF capacitor and 150 kΩ resistor run in parallel from BUS to TB-J. The 20 kΩ resistor runs from TB-J to OUT.'],
            ['T-W', 'The A500K tone wiper runs through the 22 nF capacitor to GND. The tone pot CCW lug takes BUS; its CW lug is unused.'],
            ['OUT', 'Volume wiper, treble-bleed output, and output-jack tip.'],
            ['GND', 'All three coil returns and separate covers/cases; volume track ground; tone-cap return; pot and switch cases, cavity shield, bridge/string ground, and jack sleeve.'],
        ],
        buildSteps: ['Identify the three pickup leads and any separate shields or covers. Confirm the five-way blade common and overlapping positions with a meter.', 'Wire the blade for its normal five positions. Add the SPST between neck hot and BUS without joining the pickup hots ahead of the blade.', 'Connect the A250K volume, A500K tone and 22 nF capacitor, three-part treble bleed, common ground, and mono output jack.', 'Meter the ten states and perform the pickup tap and control checks below before installing the harness.'],
        checks: ['Identify actual pickup leads and confirm the blade common and adjacent-throw overlap with a continuity meter.', 'Confirm that the SPST joins only neck hot to BUS when on, and check pickup phase in combined positions.', 'Meter and tap-test all ten states. Positions 4 and 5 should remain the same with neck-add on. Confirm clockwise controls, jack polarity, and common ground.'],
    },
};

export function getInstrumentWiringReference(serial: string): InstrumentWiringReference | undefined {
    return instrumentWiringReferences[serial as keyof typeof instrumentWiringReferences];
}
