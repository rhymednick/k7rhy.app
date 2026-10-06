// Terminal-level model of the Coupeville Red Lipstick Special harness.
// Single source of truth for check-netlist.mjs and generate-wiring-diagrams.mjs.
// The model mirrors reference.md §4–§6: permanent wires plus state-dependent switch contacts.

export const modules = ['N', 'M', 'B'];
export const moduleNames = { N: 'Neck', M: 'Middle', B: 'Bridge' };
export const phaseModules = ['N', 'M'];

// Permanent wires. Each entry joins the listed terminals into one net.
// Terminal naming: E-x.* enable switch, P-x.* phase switch, PU-x.* pickup lead, VOL/TONE/C22/JACK controls.
export const wires = {
    GND: ['E-N.C', 'VOL.CCW', 'C22.GND', 'JACK.SLV', 'PU-N.CASE', 'PU-M.CASE', 'PU-B.CASE'],
    'N-OUT': ['E-N.OFF', 'P-N.1C', 'E-M.C'],
    'N-Y': ['E-N.ON', 'P-N.2C'],
    'N-H': ['PU-N.H', 'P-N.1N', 'P-N.2R'],
    'N-R': ['PU-N.R', 'P-N.1R', 'P-N.2N'],
    'M-OUT': ['E-M.OFF', 'P-M.1C', 'E-B.C'],
    'M-Y': ['E-M.ON', 'P-M.2C'],
    'M-H': ['PU-M.H', 'P-M.1N', 'P-M.2R'],
    'M-R': ['PU-M.R', 'P-M.1R', 'P-M.2N'],
    BUS: ['E-B.OFF', 'PU-B.H', 'VOL.CW', 'TONE.CCW'],
    'B-R': ['E-B.ON', 'PU-B.R'],
    OUT: ['VOL.WIPER', 'JACK.TIP'],
    'TONE-W': ['TONE.WIPER', 'C22.HOT'],
};

// Net name (key of `wires`) that a terminal is permanently wired to.
export function netOf(terminal) {
    const hit = Object.entries(wires).find(([, terminals]) => terminals.includes(terminal));
    if (!hit) throw new Error(`terminal ${terminal} is not on any net`);
    return hit[0];
}

// A state is { N: 0|1, M: 0|1, B: 0|1, phase: { N: 'N'|'R', M: 'N'|'R' } } (enable 1 = ON; phase N = NORMAL, R = REVERSE).
export function allStates() {
    const states = [];
    for (const n of [0, 1]) for (const m of [0, 1]) for (const b of [0, 1]) for (const pn of ['N', 'R']) for (const pm of ['N', 'R']) states.push({ N: n, M: m, B: b, phase: { N: pn, M: pm } });
    return states;
}

export const stateKey = (s) => `${s.N}${s.M}${s.B} ${s.phase.N}${s.phase.M}`;

// Union-find over terminals for one switch state. Returns find(terminal) -> net representative.
export function connectivity(state) {
    const parent = new Map();
    const find = (a) => {
        if (!parent.has(a)) parent.set(a, a);
        while (parent.get(a) !== a) {
            parent.set(a, parent.get(parent.get(a)));
            a = parent.get(a);
        }
        return a;
    };
    const union = (a, b) => parent.set(find(a), find(b));
    for (const terminals of Object.values(wires)) terminals.slice(1).forEach((t) => union(terminals[0], t));
    for (const m of modules) {
        union(`E-${m}.C`, state[m] ? `E-${m}.ON` : `E-${m}.OFF`);
        if (phaseModules.includes(m)) {
            const reverse = state.phase[m] === 'R';
            union(`P-${m}.1C`, reverse ? `P-${m}.1R` : `P-${m}.1N`);
            union(`P-${m}.2C`, reverse ? `P-${m}.2R` : `P-${m}.2N`);
        }
    }
    return find;
}

// Series path from GND to BUS through pickup coils. A pickup is an edge between its R and H lead nets;
// '+' means traversed return -> hot (hot toward the volume side), '-' the opposite.
export function chain(state) {
    const find = connectivity(state);
    const gnd = find('E-N.C');
    const bus = find('E-B.OFF');
    const edges = modules.map((m) => ({ m, h: find(`PU-${m}.H`), r: find(`PU-${m}.R`) }));
    const paths = [];
    const walk = (node, used, path) => {
        if (node === bus) {
            paths.push(path);
            return;
        }
        for (const e of edges) {
            if (used.has(e.m) || e.h === e.r) continue;
            const next = new Set([...used, e.m]);
            if (e.r === node) walk(e.h, next, [...path, { m: e.m, sign: '+' }]);
            else if (e.h === node) walk(e.r, next, [...path, { m: e.m, sign: '-' }]);
        }
    };
    walk(gnd, new Set(), []);
    return {
        paths,
        shorted: edges.filter((e) => e.h === e.r).map((e) => e.m),
        muted: gnd === bus,
    };
}

export const formatPath = (path) => path.map((p) => `${p.m}${p.sign}`).join(' ');

// Relative-phase class: invert all signs so the bridge (else the first pickup) is '+', then sort.
export function relativeClass(path) {
    if (path.length === 0) return '';
    const reference = path.find((p) => p.m === 'B') ?? path[0];
    const flip = reference.sign === '-';
    return path
        .map((p) => `${p.m}${flip ? (p.sign === '+' ? '-' : '+') : p.sign}`)
        .sort()
        .join(' ');
}

// Series resistance from GND to BUS for the given per-pickup resistances (ohms); 0 when muted.
export function seriesResistance(state, resistance) {
    const { paths } = chain(state);
    if (paths.length !== 1) return NaN;
    return paths[0].reduce((sum, p) => sum + resistance[p.m], 0);
}

// Module IN/OUT chain nodes (terminals that sit on them).
export const moduleNodes = {
    N: { in: 'E-N.C', out: 'E-N.OFF' },
    M: { in: 'E-M.C', out: 'E-M.OFF' },
    B: { in: 'E-B.C', out: 'E-B.OFF' },
};

// Closed pairs among IN, OUT, H, R for a module in a state, with the pickup leads treated as bare terminals.
export function moduleContinuity(state, m) {
    const find = connectivity(state);
    const points = { IN: find(moduleNodes[m].in), OUT: find(moduleNodes[m].out), H: find(`PU-${m}.H`), R: find(`PU-${m}.R`) };
    const names = Object.keys(points);
    const closed = [];
    for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) if (points[names[i]] === points[names[j]]) closed.push(`${names[i]}-${names[j]}`);
    return closed;
}

// Relative-phase state identifiers used in reference.md §5 and the diagram sheets.
export function specStateId(state) {
    const { N, M, B, phase } = state;
    const on = `${N}${M}${B}`;
    const n = phase.N === 'N';
    const m = phase.M === 'N';
    switch (on) {
        case '000':
            return 'S0';
        case '001':
            return 'S1';
        case '010':
            return 'S2';
        case '100':
            return 'S3';
        case '011':
            return m ? 'S4' : 'S5';
        case '101':
            return n ? 'S6' : 'S7';
        case '110':
            return n === m ? 'S8' : 'S9';
        default:
            return n ? (m ? 'S10' : 'S12') : m ? 'S11' : 'S13';
    }
}

// One row per distinct state, with the switch settings that produce it. Derived from the model.
export function operatingStates() {
    const rows = new Map();
    for (const state of allStates()) {
        const id = specStateId(state);
        const { paths } = chain(state);
        const path = paths[0] ?? [];
        if (!rows.has(id)) rows.set(id, { id, N: state.N, M: state.M, B: state.B, cls: relativeClass(path), chain: path.length ? formatPath(path) : 'MUTE', settings: [] });
        rows.get(id).settings.push(`${state.phase.N}${state.phase.M}`);
    }
    return [...rows.values()].map((row) => ({ ...row, settings: [...new Set(row.settings)] }));
}
