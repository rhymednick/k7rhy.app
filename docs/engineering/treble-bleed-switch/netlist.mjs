// Terminal-level model of the switchable treble bleed (Direct / Off / Reactive).
// Single source of truth for check-netlist.mjs and the later drawing verifier, diagram generator and pages.
// The model mirrors netlist.md: permanent wires plus the switch and pot wiper contacts.

export const switchModes = ['DIRECT', 'OFF', 'REACTIVE'];

// Permanent wires. Each entry joins the listed terminals into one net.
export const wires = {
    BUS: ['SEL.C', 'VOL.IN', 'TONE.W', 'SW.DIRECT'],
    OUT: ['VOL.W', 'JACK.TIP', 'RB.1'],
    'TB-MID': ['RB.2', 'CB.1'],
    'TB-SW': ['CB.2', 'SW.C'],
    'TONE-CAP': ['TONE.CCW', 'C22.HOT'],
    REACT: ['TONE.CW', 'SW.REACTIVE'],
    GND: ['VOL.GND', 'C22.GND', 'JACK.SLV'],
    OPEN: ['SW.OFF'],
};

// Net name (key of `wires`) that a terminal is permanently wired to.
export function netOf(terminal) {
    const hit = Object.entries(wires).find(([, terminals]) => terminals.includes(terminal));
    if (!hit) throw new Error(`terminal ${terminal} is not on any net`);
    return hit[0];
}

const throwOf = { DIRECT: 'SW.DIRECT', OFF: 'SW.OFF', REACTIVE: 'SW.REACTIVE' };

// Terminal -> net id for one setting. tone and volume run 0-10. A wiper joins the end it has reached at 10
// (tone: CW, volume: IN) or at 0 (tone: CCW, volume: GND); anywhere between it touches only its track.
// A net id is the sorted, '+'-joined list of permanent net names merged into that net.
export function connectivity(mode, tone, volume) {
    if (!throwOf[mode]) throw new Error(`unknown switch mode ${mode}`);
    const terminals = Object.values(wires).flat();
    const parent = new Map(terminals.map((t) => [t, t]));
    const find = (a) => {
        while (parent.get(a) !== a) {
            parent.set(a, parent.get(parent.get(a)));
            a = parent.get(a);
        }
        return a;
    };
    const union = (a, b) => parent.set(find(a), find(b));
    for (const list of Object.values(wires)) list.slice(1).forEach((t) => union(list[0], t));
    union('SW.C', throwOf[mode]);
    if (tone === 10) union('TONE.W', 'TONE.CW');
    if (tone === 0) union('TONE.W', 'TONE.CCW');
    if (volume === 10) union('VOL.W', 'VOL.IN');
    if (volume === 0) union('VOL.W', 'VOL.GND');
    const names = new Map();
    for (const t of terminals) {
        const root = find(t);
        if (!names.has(root)) names.set(root, new Set());
        names.get(root).add(netOf(t));
    }
    return new Map(terminals.map((t) => [t, [...names.get(find(t))].sort().join('+')]));
}

// Resistance from the tone wiper to TONE.CCW, which carries the 22 nF capacitor. Linear taper; the switch does not change it.
export function toneSweepResistance(mode, tone, trackOhms) {
    if (!throwOf[mode]) throw new Error(`unknown switch mode ${mode}`);
    return (trackOhms * tone) / 10;
}

// Resistance from the tone wiper to TONE.CW, the Reactive feed: zero at tone 10, the full track at tone 0.
export function reactiveFeedResistance(tone, trackOhms) {
    return (trackOhms * (10 - tone)) / 10;
}
