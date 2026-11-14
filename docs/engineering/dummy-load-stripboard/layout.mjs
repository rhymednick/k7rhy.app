// Stripboard layout of the K7RHY 20W dummy load (DIY alternative) as data, plus the connectivity derived from it.
// Holes are (column, strip), both 1-based; strips run along the columns; pitch 2.54 mm. Component side up; the
// strips are underneath. The drawing, the netlist check, and the RF model are all derived from this file.

export const PITCH = 2.54;

// A = RF input strip, G = ground strip (adjacent to A on purpose), M = midpoint of the divider (two bridged strips).
// ORDER lists the eight resistors left to right: A = top lead on the RF strip, G = top lead on the ground strip. Odd
// resistors hang from the RF strip and even ones from the ground strip, so neighbours carry opposite currents. A mirror-
// symmetric order (AGAGGAGA) was modeled and buys nothing: same inductance, no better power balance (reference.md §4).
export const ORDER = 'AGAGAGAG';

// `order` is overridable so rf-report.mjs can compare other arrangements; the published design uses ORDER.
export function buildLayout({ span = 8, order = ORDER } = {}) {
    const rowA = 1;
    const rowG = 2;
    const rowM1 = 1 + span;
    const rowM2 = 2 + span;
    const rowGd = rowM2 + 1;
    const parts = [];
    [...order].forEach((kind, i) => {
        const col = 2 + 3 * i;
        const top = kind === 'A' ? rowA : rowG;
        const bottom = kind === 'A' ? rowM1 : rowM2;
        parts.push({ ref: `R${i + 1}`, kind: 'resistor', value: '100 Ω', a: [col, top], b: [col, bottom], side: kind });
    });
    // bare straps tie the two M strips together, one beside each pair of resistors
    [4, 10, 16, 22].forEach((col, i) => parts.push({ ref: `W${i + 1}`, kind: 'link', a: [col, rowM1], b: [col, rowM2] }));
    parts.push({ ref: 'J1', kind: 'feed', center: [12, rowA], shell: [12, rowG] });
    parts.push({ ref: 'C2', kind: 'capacitor', value: '3.3 pF', a: [13, rowA], b: [13, rowG], role: 'compensation' });
    parts.push({ ref: 'D1', kind: 'diode', value: 'BAT46', anode: [25, rowM2], cathode: [29, rowM2] });
    parts.push({ ref: 'C1', kind: 'capacitor', value: '10 nF', a: [30, rowM2], b: [30, rowGd], role: 'detector' });
    parts.push({ ref: 'W5', kind: 'link', a: [32, rowG], b: [32, rowGd], insulated: true });
    parts.push({ ref: 'TP1', kind: 'testpoint', at: [31, rowM2] });
    parts.push({ ref: 'TP2', kind: 'testpoint', at: [31, rowGd] });
    // one cut: strip M2 stops after hole 26; holes 27-32 on that strip become the detector node
    const cuts = [{ row: rowM2, after: 26 }];
    return { cols: 32, rows: rowGd, span, rowA, rowG, rowM1, rowM2, rowGd, cuts, parts };
}

export const terminals = (layout) => {
    const out = [];
    for (const p of layout.parts) {
        if (p.kind === 'resistor' || p.kind === 'link' || p.kind === 'capacitor') out.push([`${p.ref}.1`, p.a], [`${p.ref}.2`, p.b]);
        else if (p.kind === 'diode') out.push([`${p.ref}.A`, p.anode], [`${p.ref}.K`, p.cathode]);
        else if (p.kind === 'feed') out.push([`${p.ref}.CENTER`, p.center], [`${p.ref}.SHELL`, p.shell]);
        else if (p.kind === 'testpoint') out.push([`${p.ref}.1`, p.at]);
    }
    return out;
};

const key = ([c, r]) => `${c},${r}`;

// Nets derived from the layout: strip segments (split at cuts) plus bridging links.
export function nets(layout) {
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
    for (let r = 1; r <= layout.rows; r++) for (let c = 1; c < layout.cols; c++) if (!layout.cuts.some((x) => x.row === r && x.after === c)) union(key([c, r]), key([c + 1, r]));
    for (const p of layout.parts) if (p.kind === 'link') union(key(p.a), key(p.b));
    const byRoot = new Map();
    for (const [name, hole] of terminals(layout)) {
        const root = find(key(hole));
        if (!byRoot.has(root)) byRoot.set(root, []);
        byRoot.get(root).push(name);
    }
    // links are wires, not circuit terminals
    return [...byRoot.values()].map((t) => t.filter((n) => !/^W\d/.test(n)).sort()).filter((t) => t.length);
}

// Strip pieces for drawing: per row, [from, to] column ranges split at cuts.
export function stripSegments(layout) {
    const segs = [];
    for (let r = 1; r <= layout.rows; r++) {
        let start = 1;
        for (let c = 1; c <= layout.cols; c++) {
            const cutHere = layout.cuts.some((x) => x.row === r && x.after === c);
            if (c === layout.cols || cutHere) {
                segs.push({ row: r, from: start, to: c });
                start = c + 1;
            }
        }
    }
    return segs;
}
