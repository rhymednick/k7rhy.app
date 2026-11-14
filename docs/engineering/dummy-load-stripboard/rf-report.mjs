// Prints every RF-model table quoted in reference.md §8, so the document's numbers can be regenerated and checked.
// These are predictions from a lumped model (see rf-engine.mjs for what it leaves out), not measurements.
//
//   node docs/engineering/dummy-load-stripboard/rf-report.mjs
import { buildLayout } from './layout.mjs';
import { buildRfModel, crossing, NOMINAL, PESSIMISTIC, sweep, swr } from './rf-model.mjs';

const BANDS = [
    ['160 m', 1.9],
    ['80 m', 3.6],
    ['40 m', 7.1],
    ['30 m', 10.1],
    ['20 m', 14.2],
    ['17 m', 18.1],
    ['15 m', 21.2],
    ['12 m', 24.9],
    ['10 m', 28.5],
    ['6 m', 52],
    ['2 m', 146],
    ['70 cm', 435],
];
const fmt = (v, d = 2) => v.toFixed(d);
const mhz = (hz) => (hz === undefined ? '>700' : String(Math.round(hz / 1e6)));
const swrAt = (model, f, cache) => swr(model.zin(f * 1e6, cache));
const thresholds = (model) => {
    const pts = sweep(model);
    return [1.1, 1.25, 1.5, 2].map((t) => mhz(crossing(pts, t))).join(' / ');
};

const base = buildLayout();
const withoutDetector = (layout) => ({ ...layout, parts: layout.parts.filter((p) => !['D1', 'C1', 'C2', 'W5', 'TP1', 'TP2'].includes(p.ref)), cuts: [] });

// ---- §A: how the eight resistors are arranged (bare divider: no C2, no detector) ----
function stackLayout(span = 8) {
    const rowA = 1,
        rowM = 1 + span,
        rowG = 1 + 2 * span;
    const parts = [];
    for (let k = 0; k < 4; k++) {
        parts.push({ ref: `R${k + 1}`, kind: 'resistor', a: [2 + 3 * k, rowA], b: [2 + 3 * k, rowM] });
        parts.push({ ref: `R${k + 5}`, kind: 'resistor', a: [3 + 3 * k, rowM], b: [3 + 3 * k, rowG] });
    }
    parts.push({ ref: 'J1', kind: 'feed', center: [6, rowA], shell: [6, rowG], mode: 'return-along-board', returnCol: 0 });
    return { cols: 14, rows: rowG, cuts: [], parts };
}
console.log('A. Resistor arrangement, bare divider (no C2, no detector), nominal parameters');
console.log('   arrangement                                    series L at 30 MHz   SWR 10 m   SWR 6 m   SWR 2 m');
for (const [label, layout] of [
    ['this design: A G A G A G A G (alternating)', withoutDetector(base)],
    ['alternating, mirrored: A G A G G A G A', withoutDetector(buildLayout({ order: 'AGAGGAGA' }))],
    ['banks grouped: A A A A G G G G', withoutDetector(buildLayout({ order: 'AAAAGGGG' }))],
    ['in-line stack, long ground return', stackLayout()],
]) {
    const m = buildRfModel(layout, NOMINAL);
    const c = {};
    const z30 = m.zin(30e6, c);
    console.log(`   ${label.padEnd(50)} ${fmt((z30[1] / (2 * Math.PI * 30e6)) * 1e9, 1).padStart(8)} nH   ${fmt(swrAt(m, 29, c)).padStart(7)}   ${fmt(swrAt(m, 52, c)).padStart(7)}   ${fmt(swrAt(m, 146, c)).padStart(7)}`);
}

// ---- §B: predicted SWR by band for the published layout ----
console.log('\nB. Predicted SWR, published layout (with C2 and detector)');
const scenarios = [
    ['nominal', buildRfModel(base, NOMINAL)],
    ['pessimistic', buildRfModel(base, PESSIMISTIC)],
    ['nominal, C2 left off', buildRfModel(base, { ...NOMINAL, C_C2: 0.0001 })],
];
console.log('   ' + 'scenario'.padEnd(22) + BANDS.map(([n]) => n.padStart(7)).join(''));
for (const [label, m] of scenarios) {
    const c = {};
    console.log('   ' + label.padEnd(22) + BANDS.map(([, f]) => fmt(swrAt(m, f, c)).padStart(7)).join(''));
}
console.log('   first frequency (MHz) where SWR exceeds 1.1 / 1.25 / 1.5 / 2.0:');
for (const [label, m] of scenarios) console.log('   ' + label.padEnd(22) + thresholds(m));

// ---- §C: one-at-a-time sensitivity around nominal ----
console.log('\nC. Sensitivity, published layout, one parameter changed at a time');
console.log('   ' + 'change'.padEnd(28) + 'SWR 10 m   SWR 6 m   first >1.25 / >1.5 (MHz)');
const sens = [
    ['nominal', base, {}],
    ['BNC wires 6 mm', base, { feedLen: 6 }],
    ['BNC wires 15 mm', base, { feedLen: 15 }],
    ['BNC wires 25 mm', base, { feedLen: 25 }],
    ['+20 nH inside each resistor', base, { resLx: 20 }],
    ['+40 nH inside each resistor', base, { resLx: 40 }],
    ['+80 nH inside each resistor', base, { resLx: 80 }],
    ['no resistor body capacitance', base, { Cbody: 0 }],
    ['diode capacitance 1 pF', base, { Cj: 1 }],
    ['diode capacitance 10 pF', base, { Cj: 10 }],
    ['lead span 7 holes', buildLayout({ span: 7 }), {}],
    ['lead span 9 holes', buildLayout({ span: 9 }), {}],
];
for (const [label, layout, opt] of sens) {
    const m = buildRfModel(layout, { ...NOMINAL, ...opt });
    const c = {};
    const pts = sweep(m);
    console.log('   ' + label.padEnd(28) + `${fmt(swrAt(m, 29, c)).padStart(8)}   ${fmt(swrAt(m, 52, c)).padStart(7)}   ${mhz(crossing(pts, 1.25)).padStart(5)} / ${mhz(crossing(pts, 1.5)).padStart(4)}`);
}

// ---- §D: choice of compensation capacitor C2 ----
console.log('\nD. Compensation capacitor C2 (pF), nominal and pessimistic: SWR at 10 m, 6 m, and first frequency above 1.25 (MHz)');
for (const [label, opt] of [
    ['nominal', NOMINAL],
    ['pessimistic', PESSIMISTIC],
]) {
    console.log('   ' + label);
    for (const pf of [0.0001, 2.2, 3.3, 4.7, 6.8, 10]) {
        const m = buildRfModel(base, { ...opt, C_C2: pf });
        const c = {};
        console.log(`     C2 = ${pf < 1 ? 'none' : pf.toFixed(1).padStart(4) + ' pF'}   10 m ${fmt(swrAt(m, 29, c))}   6 m ${fmt(swrAt(m, 52, c))}   >1.25 at ${mhz(crossing(sweep(m), 1.25))} MHz`);
    }
}

// ---- §E: do the eight resistors share the power evenly at RF? ----
console.log('\nE. Power in each resistor relative to the mean (1.000 = perfectly even), nominal');
for (const [label, layout] of [
    ['this design (alternating)', base],
    ['mirrored (rejected)', buildLayout({ order: 'AGAGGAGA' })],
]) {
    const mm = buildRfModel(layout, NOMINAL);
    console.log('   ' + label);
    for (const f of [1, 30, 52, 146]) {
        const { cur } = mm.zin(f * 1e6, {}, true);
        const amps = Object.entries(cur)
            .filter(([k]) => /^R\d+\.body$/.test(k))
            .map(([, v]) => v);
        const mean = amps.reduce((a, b) => a + b) / amps.length;
        const rel = amps.map((a) => (a / mean) ** 2);
        console.log(`     ${String(f).padStart(4)} MHz   min ${fmt(Math.min(...rel), 3)}   max ${fmt(Math.max(...rel), 3)}`);
    }
}
