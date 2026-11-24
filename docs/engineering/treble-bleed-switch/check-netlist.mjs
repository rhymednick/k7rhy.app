// Cross-checks the model in netlist.mjs against the expected values written out in netlist.md and
// ../relay-lipstick-reference.md. The expected values below are typed from those documents, not computed
// from the model, so a mismatch means the model or a document is wrong.
//
//   node docs/engineering/treble-bleed-switch/check-netlist.mjs
import { fileURLToPath } from 'node:url';
import { connectivity, netOf, reactiveFeedResistance, switchModes, toneSweepResistance, wires } from './netlist.mjs';

// netlist.md, Netlist table, plus the open switch throw.
const expectedNets = {
    BUS: ['SEL.C', 'VOL.IN', 'TONE.W', 'SW.DIRECT'],
    OUT: ['VOL.W', 'JACK.TIP', 'RB.1'],
    'TB-MID': ['RB.2', 'CB.1'],
    'TB-SW': ['CB.2', 'SW.C'],
    'TONE-CAP': ['TONE.CCW', 'C22.HOT'],
    REACT: ['TONE.CW', 'SW.REACTIVE'],
    GND: ['VOL.GND', 'C22.GND', 'JACK.SLV'],
    OPEN: ['SW.OFF'],
};

// netlist.md, Parts and Lug naming: all 19 terminals.
const terminals = ['VOL.IN', 'VOL.W', 'VOL.GND', 'TONE.W', 'TONE.CCW', 'TONE.CW', 'C22.HOT', 'C22.GND', 'RB.1', 'RB.2', 'CB.1', 'CB.2', 'SW.C', 'SW.DIRECT', 'SW.OFF', 'SW.REACTIVE', 'JACK.TIP', 'JACK.SLV', 'SEL.C'];

export function runChecks() {
    const failures = [];
    let checks = 0;
    const expect = (condition, message) => {
        checks += 1;
        if (!condition) failures.push(message);
    };

    // 1. Switch labels and net membership.
    expect(switchModes.join(',') === 'DIRECT,OFF,REACTIVE', `switch modes are ${switchModes}`);
    expect(Object.keys(wires).sort().join(',') === Object.keys(expectedNets).sort().join(','), `net names differ: ${Object.keys(wires)}`);
    for (const [net, members] of Object.entries(expectedNets)) {
        expect([...(wires[net] ?? [])].sort().join(',') === [...members].sort().join(','), `net ${net}: terminals ${wires[net]} differ from netlist.md (${members})`);
    }

    // 2. Every terminal on exactly one net.
    for (const t of terminals) {
        const nets = Object.entries(wires).filter(([, list]) => list.includes(t));
        expect(nets.length === 1, `${t} is on ${nets.length} nets`);
    }
    const listed = Object.values(wires).flat();
    expect(listed.length === terminals.length && new Set(listed).size === terminals.length, `terminal count ${listed.length} differs from ${terminals.length}`);
    expect(netOf('SW.OFF') === 'OPEN', 'SW.OFF is not the open net');

    // 3. Bleed path per mode (netlist.md, Operating states), at tone 5 and volume 5 so no wiper reaches an end.
    const direct = connectivity('DIRECT', 5, 5);
    expect(direct.get('RB.1') === 'OUT', `Direct: RB.1 is on ${direct.get('RB.1')}, expected OUT`);
    expect(direct.get('RB.2') === direct.get('CB.1'), 'Direct: RB.2 and CB.1 not joined');
    expect(direct.get('CB.2') === direct.get('SW.C'), 'Direct: CB.2 not joined to SW.C');
    expect(direct.get('SW.C') === 'BUS+TB-SW', `Direct: SW.C is on ${direct.get('SW.C')}, expected BUS+TB-SW`);
    expect(direct.get('SW.C') === direct.get('SEL.C'), 'Direct: SW.C not on BUS');
    expect(direct.get('RB.1') !== direct.get('SW.C'), 'Direct: bleed ends joined at volume 5');

    const off = connectivity('OFF', 5, 5);
    expect(off.get('SW.C') === 'OPEN+TB-SW', `Off: SW.C is on ${off.get('SW.C')}, expected OPEN+TB-SW`);
    for (const t of ['SEL.C', 'TONE.CW', 'TONE.CCW', 'VOL.W', 'JACK.SLV']) expect(off.get('SW.C') !== off.get(t), `Off: SW.C reaches ${t}`);

    const reactive = connectivity('REACTIVE', 5, 5);
    expect(reactive.get('SW.C') === 'REACT+TB-SW', `Reactive: SW.C is on ${reactive.get('SW.C')}, expected REACT+TB-SW`);
    expect(reactive.get('SW.C') === reactive.get('TONE.CW'), 'Reactive: SW.C not on TONE.CW');
    expect(reactive.get('SW.C') !== reactive.get('SEL.C'), 'Reactive: SW.C reaches BUS at tone 5');

    // 4. Tone wiper on BUS in every mode; the capacitor sits on TONE.CCW only.
    for (const mode of switchModes) {
        const c = connectivity(mode, 5, 5);
        expect(c.get('TONE.W') === c.get('SEL.C'), `${mode}: TONE.W is on ${c.get('TONE.W')}, not BUS`);
        expect(c.get('TONE.CCW') === 'TONE-CAP', `${mode}: TONE.CCW is on ${c.get('TONE.CCW')}, expected TONE-CAP`);
        expect(c.get('C22.GND') === 'GND', `${mode}: C22.GND is on ${c.get('C22.GND')}, expected GND`);
    }

    // 5. Tone 10: Reactive joins TONE.CW to BUS with 0 ohms; Direct and Reactive coincide.
    const reactiveTone10 = connectivity('REACTIVE', 10, 5);
    expect(reactiveTone10.get('TONE.CW') === 'BUS+REACT+TB-SW', `Reactive tone 10: TONE.CW is on ${reactiveTone10.get('TONE.CW')}, expected BUS+REACT+TB-SW`);
    expect(reactiveTone10.get('SW.C') === reactiveTone10.get('SEL.C'), 'Reactive tone 10: SW.C not on BUS');
    expect(reactiveFeedResistance(10, 500000) === 0, `Reactive feed at tone 10 is ${reactiveFeedResistance(10, 500000)}, expected 0`);
    const directTone10 = connectivity('DIRECT', 10, 5);
    expect(directTone10.get('SW.C') === directTone10.get('SEL.C'), 'Direct tone 10: SW.C not on BUS');
    expect(directTone10.get('TONE.CW') === directTone10.get('SEL.C'), 'Direct tone 10: TONE.CW not on BUS');

    // 6. Tone 0: the wiper sits on TONE.CCW, the Reactive branch sees the full track.
    const reactiveTone0 = connectivity('REACTIVE', 0, 5);
    expect(reactiveTone0.get('TONE.CW') === 'REACT+TB-SW', `Reactive tone 0: TONE.CW is on ${reactiveTone0.get('TONE.CW')}, expected REACT+TB-SW`);
    expect(reactiveTone0.get('TONE.CW') !== reactiveTone0.get('SEL.C'), 'Reactive tone 0: TONE.CW reaches BUS');
    expect(reactiveTone0.get('TONE.W') === 'BUS+TONE-CAP', `Reactive tone 0: TONE.W is on ${reactiveTone0.get('TONE.W')}, expected BUS+TONE-CAP`);
    expect(reactiveFeedResistance(0, 500000) === 500000, `Reactive feed at tone 0 is ${reactiveFeedResistance(0, 500000)}, expected 500000`);

    // 7. Volume 10: VOL.W joins VOL.IN, so the bleed's near end is on BUS in all three modes.
    for (const mode of switchModes) {
        const c = connectivity(mode, 5, 10);
        expect(c.get('VOL.W') === c.get('VOL.IN'), `${mode} volume 10: VOL.W not joined to VOL.IN`);
        expect(c.get('RB.1') === c.get('SEL.C'), `${mode} volume 10: RB.1 is on ${c.get('RB.1')}, not BUS`);
        expect(c.get('JACK.TIP') === c.get('SEL.C'), `${mode} volume 10: jack tip not on BUS`);
    }
    const directV10 = connectivity('DIRECT', 5, 10);
    expect(directV10.get('SW.C') === directV10.get('RB.1'), 'Direct volume 10: bleed ends on different nets');
    const reactiveV10T10 = connectivity('REACTIVE', 10, 10);
    expect(reactiveV10T10.get('SW.C') === reactiveV10T10.get('RB.1'), 'Reactive volume 10, tone 10: bleed ends on different nets');
    const offV10 = connectivity('OFF', 5, 10);
    expect(offV10.get('SW.C') !== offV10.get('RB.1'), 'Off volume 10: bleed branch not open');

    // 8. Volume 0 grounds OUT through the wiper in every mode.
    for (const mode of switchModes) expect(connectivity(mode, 5, 0).get('JACK.TIP') === 'GND+OUT', `${mode} volume 0: jack tip is not on GND`);

    // 9. Tone sweep: relay-lipstick-reference.md has BUS on the tone CCW end and the 22 nF capacitor on the wiper,
    //    so BUS to cap runs 0 ohms at tone 0 to the full track at tone 10. Off reproduces it; the switch never changes it.
    expect(toneSweepResistance('OFF', 0, 500000) === 0, `Off tone 0 sweep is ${toneSweepResistance('OFF', 0, 500000)}, expected 0`);
    expect(toneSweepResistance('OFF', 10, 500000) === 500000, `Off tone 10 sweep is ${toneSweepResistance('OFF', 10, 500000)}, expected 500000`);
    const sweep = { 0: 0, 2: 100000, 5: 250000, 8: 400000, 10: 500000 };
    for (const mode of switchModes) {
        for (const [tone, ohms] of Object.entries(sweep)) expect(toneSweepResistance(mode, Number(tone), 500000) === ohms, `${mode} tone ${tone}: sweep ${toneSweepResistance(mode, Number(tone), 500000)}, expected ${ohms}`);
    }

    return { checks, failures };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const { checks, failures } = runChecks();
    if (failures.length) {
        console.error(`FAILED ${failures.length} of ${checks} checks:`);
        failures.slice(0, 40).forEach((f) => console.error(`  - ${f}`));
        process.exit(1);
    }
    console.log(`OK: ${checks} checks passed across 3 switch modes.`);
}
