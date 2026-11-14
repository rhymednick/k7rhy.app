// Checks the stripboard layout (layout.mjs), the power limits (limits.mjs), and the RF engine against expectations
// typed here, not computed from the files under test.
//
//   node docs/engineering/dummy-load-stripboard/check-layout.mjs
import { fileURLToPath } from 'node:url';
import { buildLayout, nets, terminals } from './layout.mjs';
import { DIODES, RESISTORS, limitsFor, peakInverseVolts } from './limits.mjs';
import { Model, mutualParallel } from './rf-engine.mjs';
import { buildRfModel, NOMINAL, swr } from './rf-model.mjs';

export const EXPECTED_NETS = [
    ['C2.1', 'J1.CENTER', 'R1.1', 'R3.1', 'R5.1', 'R7.1'], // IN
    ['D1.A', 'R1.2', 'R2.2', 'R3.2', 'R4.2', 'R5.2', 'R6.2', 'R7.2', 'R8.2'], // M
    ['C1.2', 'C2.2', 'J1.SHELL', 'R2.1', 'R4.1', 'R6.1', 'R8.1', 'TP2.1'], // GND
    ['C1.1', 'D1.K', 'TP1.1'], // DET
];
const canon = (list) => list.map((n) => [...n].sort().join(' ')).sort();

// Resistance between two terminals, by nodal analysis over the nets. A net that touches no resistor carries no DC.
export function dcResistance(layout, from, to) {
    const groups = nets(layout);
    const idOf = (t) => groups.findIndex((g) => g.includes(t));
    const n = groups.length;
    const G = Array.from({ length: n }, () => new Array(n).fill(0));
    const resistors = layout.parts.filter((q) => q.kind === 'resistor');
    for (const p of resistors) {
        const a = idOf(`${p.ref}.1`);
        const b = idOf(`${p.ref}.2`);
        const g = 1 / 100;
        G[a][a] += g;
        G[b][b] += g;
        G[a][b] -= g;
        G[b][a] -= g;
    }
    const s = idOf(from);
    const t = idOf(to);
    const live = new Set(resistors.flatMap((q) => [idOf(`${q.ref}.1`), idOf(`${q.ref}.2`)]));
    if (!live.has(s) || !live.has(t)) return Infinity;
    // ground t, inject 1 A at s, solve the reduced system
    const keep = [...live].filter((i) => i !== t);
    const A = keep.map((i) => keep.map((j) => G[i][j]).concat(i === s ? 1 : 0));
    const m = keep.length;
    for (let c = 0; c < m; c++) {
        let p = c;
        for (let r = c + 1; r < m; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
        [A[c], A[p]] = [A[p], A[c]];
        for (let r = c + 1; r < m; r++) {
            const f = A[r][c] / A[c][c];
            for (let k = c; k <= m; k++) A[r][k] -= f * A[c][k];
        }
    }
    const x = new Array(m).fill(0);
    for (let r = m - 1; r >= 0; r--) {
        let v = A[r][m];
        for (let k = r + 1; k < m; k++) v -= A[r][k] * x[k];
        x[r] = v / A[r][r];
    }
    return x[keep.indexOf(s)];
}

// `layout` defaults to the published design; check-mutations.mjs passes deliberately broken ones.
export function runChecks(layout = buildLayout()) {
    const failures = [];
    let checks = 0;
    const expect = (cond, msg) => {
        checks += 1;
        if (!cond) failures.push(msg);
    };
    const near = (a, b, tol) => Math.abs(a - b) <= tol;

    // 1. nets
    expect(JSON.stringify(canon(nets(layout))) === JSON.stringify(canon(EXPECTED_NETS)), `nets differ from the expected netlist:\n    got ${JSON.stringify(canon(nets(layout)))}`);

    // 2. divider topology: odd resistors between IN and M, even resistors between GND and M, neighbours alternate
    const side = (ref) =>
        nets(layout)
            .find((g) => g.includes(`${ref}.1`))
            .includes('J1.CENTER')
            ? 'IN'
            : 'GND';
    const sides = layout.parts
        .filter((p) => p.kind === 'resistor')
        .map((p) => side(p.ref))
        .join(' ');
    expect(sides === 'IN GND IN GND IN GND IN GND', `resistor order along the board is "${sides}", expected IN GND IN GND IN GND IN GND`);

    // 3. bill of materials: values typed here
    const value = (ref) => layout.parts.find((p) => p.ref === ref)?.value;
    expect(layout.parts.filter((p) => p.kind === 'resistor').every((p) => p.value === '100 Ω') && RESISTORS === 8, 'resistors are not eight 100 ohm parts');
    expect(value('C1') === '10 nF' && value('C2') === '3.3 pF' && value('D1') === 'BAT46', `capacitor or diode value changed: C1 ${value('C1')}, C2 ${value('C2')}, D1 ${value('D1')}`);

    // 4. DC resistances quoted on the sheet
    expect(near(dcResistance(layout, 'J1.CENTER', 'J1.SHELL'), 50, 1e-9), 'IN to GND is not 50 ohm');
    expect(near(dcResistance(layout, 'J1.CENTER', 'D1.A'), 25, 1e-9), 'IN to M is not 25 ohm');
    expect(near(dcResistance(layout, 'D1.A', 'J1.SHELL'), 25, 1e-9), 'M to GND is not 25 ohm');
    expect(dcResistance(layout, 'TP1.1', 'TP2.1') === Infinity, 'detector node TP1 has a DC path to ground');

    // 5. physical rules
    const holes = new Map();
    for (const [name, [c, r]] of terminals(layout)) {
        expect(c >= 1 && c <= layout.cols && r >= 1 && r <= layout.rows, `${name} is off the board at (${c},${r})`);
        const k = `${c},${r}`;
        expect(!holes.has(k), `${name} and ${holes.get(k)} share hole (${c},${r})`);
        holes.set(k, name);
    }
    const res = layout.parts.filter((p) => p.kind === 'resistor');
    expect(res.length === 8, `expected 8 resistors, found ${res.length}`);
    for (const p of res) expect(Math.abs(p.b[1] - p.a[1]) === layout.span && p.a[0] === p.b[0], `${p.ref} does not span ${layout.span} strips in one column`);
    for (let i = 0; i < res.length; i++)
        for (let j = i + 1; j < res.length; j++) {
            const dc = Math.abs(res[i].a[0] - res[j].a[0]);
            expect(dc >= 3, `${res[i].ref} and ${res[j].ref} are only ${dc} holes apart (bodies would touch)`);
        }
    expect(layout.cuts.length === 1 && layout.cuts[0].row === layout.rowM2 && layout.cuts[0].after === 26, 'expected exactly one cut, on strip 10 after hole 26');
    const d = layout.parts.find((p) => p.kind === 'diode');
    expect(d.anode[1] === d.cathode[1] && Math.abs(d.cathode[0] - d.anode[0]) >= 4, 'D1 span is under 4 holes');
    const ends = res.flatMap((p) => [p.a[1], p.b[1]]);
    expect(
        ends.every((r) => [layout.rowA, layout.rowG, layout.rowM1, layout.rowM2].includes(r)),
        'a resistor lead lands on an unexpected strip'
    );
    for (let r = 3; r < layout.rowM1; r++) expect(![...holes.keys()].some((k) => Number(k.split(',')[1]) === r), `strip ${r} is supposed to stay bare but carries a part`);

    // 6. diode and power limits (numbers typed here from reference.md §5 and §7)
    expect(near(peakInverseVolts(20), 44.4, 0.1), `peak inverse voltage at 20 W is ${peakInverseVolts(20).toFixed(1)} V, expected 44.4`);
    expect(DIODES.BAT46.reverseVolts / peakInverseVolts(20) >= 2, 'BAT46 reverse-voltage margin at 20 W is under 2x');
    expect(DIODES['1N5711'].reverseVolts / peakInverseVolts(20) >= 1.5, '1N5711 reverse-voltage margin at 20 W is under 1.5x');
    expect(30 / peakInverseVolts(20) < 1, 'a 30 V part (BAT43, BAT85) should be too weak for 20 W, but the margin says otherwise');
    const l3 = limitsFor(3);
    const l2 = limitsFor(2);
    expect(l3.continuous === 10 && l3.burst === 20, `3 W resistors: limits ${l3.continuous} W / ${l3.burst} W, expected 10 W / 20 W`);
    expect(l2.continuous === 6 && l2.burst === 13, `2 W resistors: limits ${l2.continuous} W / ${l2.burst} W, expected 6 W / 13 W`);
    for (const [w, l] of [
        [3, l3],
        [2, l2],
    ]) {
        expect(l.continuous / RESISTORS <= 0.42 * w + 1e-9, `${w} W resistors would run over 42 % of nameplate at ${l.continuous} W continuous`);
        expect(l.burst / RESISTORS <= 0.84 * w + 1e-9 && l.burst <= 20, `${w} W resistors would run over 84 % of nameplate at ${l.burst} W burst`);
    }

    // 7. RF engine against closed forms
    const L20 = mutualParallel([0, 20], [0, 20], 0.7788 * 0.4);
    expect(near(L20, 2e-7 * 20e-3 * (Math.log((2 * 20) / 0.4) - 0.75) * 1e9, 0.1), `self inductance ${L20.toFixed(3)} nH differs from Grover's formula`);
    const single = new Model();
    single.seg('s', [0, 0, 0], [0, 0, 20], 0.31, 'IN', 'REF', { R: 50 });
    single.port = 'IN';
    const Ls = mutualParallel([0, 20], [0, 20], 0.31);
    const zs = single.zin(30e6);
    expect(near(zs[0], 50, 1e-6) && near(zs[1], 2 * Math.PI * 30e6 * Ls * 1e-9, 1e-6), 'series R + L solve is wrong');
    const u = new Model();
    u.seg('a', [0, 0, 0], [0, 20, 0], 0.31, 'IN', 'J', { R: 100 });
    u.seg('b', [7.62, 20, 0], [7.62, 0, 0], 0.31, 'J2', 'REF', { R: 100 });
    u.branch('j', 'J', 'J2', {});
    u.port = 'IN';
    const Mu = mutualParallel([0, 20], [0, 20], 7.62);
    const zu = u.zin(100e6);
    expect(near(zu[0], 200, 1e-6) && near(zu[1], 2 * Math.PI * 100e6 * (2 * Ls - 2 * Mu) * 1e-9, 1e-5), 'opposite-current pair does not cancel as theory says');

    // 8. layout model sanity: 50 ohm at low frequency, small reactance at HF
    try {
        const m = buildRfModel(layout, NOMINAL);
        const z1 = m.zin(1e6);
        expect(near(z1[0], 50, 0.01), `model input resistance at 1 MHz is ${z1[0].toFixed(3)}, expected 50`);
        expect(swr(m.zin(30e6)) < 1.1, 'nominal model SWR at 30 MHz is not below 1.1');
    } catch (error) {
        expect(false, `the RF model could not be built or solved from this layout: ${error.message}`);
    }
    return { checks, failures };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const { checks, failures } = runChecks();
    if (failures.length) {
        console.error(`${failures.length} of ${checks} checks failed:`);
        failures.forEach((f) => console.error('  - ' + f));
        process.exit(1);
    }
    console.log(`all ${checks} checks passed`);
}
