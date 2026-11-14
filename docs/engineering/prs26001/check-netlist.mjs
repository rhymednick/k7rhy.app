#!/usr/bin/env node
// Simulates every PRS26001 selector position from netlist.mjs. For each one it
// checks each coil's role against the voice map, computes the DC resistance at
// the jack and compares it with the owner's measurement, and checks that the
// push-pull lifts the tone capacitor without changing any pickup connection.
//   node docs/engineering/prs26001/check-netlist.mjs
import { coils, expected, measuredOhms, positions, pushPull, resistors, superSwitch } from './netlist.mjs';

const TOLERANCE = 0.05; // nominal coil halves and ±5% resistors

function merge(position, mode) {
    const parent = new Map();
    const find = (n) => {
        if (!parent.has(n)) parent.set(n, n);
        while (parent.get(n) !== n) n = parent.get(n);
        return n;
    };
    const join = (a, b) => {
        if (a === 'open' || b === 'open') return;
        const [ra, rb] = [find(a), find(b)];
        if (ra !== rb) parent.set(ra, rb);
    };
    for (const p of superSwitch) join(p.common, p.throws[position - 1]);
    for (const p of pushPull) join(p.common, p[mode]);
    return find;
}

// DC resistance between BUS and GND by nodal analysis (Gaussian elimination).
function resistance(elements, BUS, GND) {
    const nodes = [...new Set(elements.flatMap((e) => [e.a, e.b]))].filter((n) => n !== GND);
    const index = new Map(nodes.map((n, i) => [n, i]));
    const size = nodes.length;
    const G = Array.from({ length: size }, () => new Array(size + 1).fill(0));
    for (const e of elements) {
        const g = 1 / e.ohms;
        for (const [x, y] of [
            [e.a, e.b],
            [e.b, e.a],
        ]) {
            if (x === GND) continue;
            G[index.get(x)][index.get(x)] += g;
            if (y !== GND) G[index.get(x)][index.get(y)] -= g;
        }
    }
    G[index.get(BUS)][size] = 1; // inject 1 A at BUS
    for (let c = 0; c < size; c++) {
        let pivot = c;
        for (let r = c + 1; r < size; r++) if (Math.abs(G[r][c]) > Math.abs(G[pivot][c])) pivot = r;
        [G[c], G[pivot]] = [G[pivot], G[c]];
        if (Math.abs(G[c][c]) < 1e-15) continue; // floating node
        for (let r = 0; r < size; r++) {
            if (r === c) continue;
            const f = G[r][c] / G[c][c];
            for (let k = c; k <= size; k++) G[r][k] -= f * G[c][k];
        }
    }
    const i = index.get(BUS);
    return G[i][size] / G[i][i];
}

function solve(position, mode) {
    const find = merge(position, mode);
    const BUS = find('BUS');
    const GND = find('GND');
    if (BUS === GND) return { error: 'BUS shorted to GND' };
    const elements = [...coils, ...resistors].map((e) => ({ id: e.id, ohms: e.ohms, a: find(e.a), b: find(e.b) })).filter((e) => e.a !== e.b);

    // Prune dangling branches so only current-carrying elements remain.
    let live = elements;
    for (let changed = true; changed; ) {
        changed = false;
        const degree = new Map();
        for (const e of live) for (const n of [e.a, e.b]) degree.set(n, (degree.get(n) ?? 0) + 1);
        const keep = live.filter((e) => [e.a, e.b].every((n) => n === BUS || n === GND || degree.get(n) > 1));
        if (keep.length !== live.length) [live, changed] = [keep, true];
    }

    const roles = {};
    for (const c of coils) {
        const e = live.find((l) => l.id === c.id);
        if (!e) roles[c.id] = 'off';
        else if (live.some((l) => l.id.startsWith('R') && l.id !== 'VOL' && new Set([l.a, l.b, e.a, e.b]).size === 2)) roles[c.id] = 'shunted';
        else roles[c.id] = 'series';
    }
    const toneCapGrounded = find('TC_R') === GND;
    return { roles, ohms: resistance(live, BUS, GND), toneCapGrounded };
}

let failures = 0;
for (const position of positions) {
    const down = solve(position, 'down');
    const up = solve(position, 'up');
    const errs = [];
    for (const [mode, r] of [
        ['down', down],
        ['up', up],
    ]) {
        if (r.error) errs.push(`${mode}: ${r.error}`);
    }
    if (!errs.length) {
        for (const id of Object.keys(expected[position])) if (down.roles[id] !== expected[position][id]) errs.push(`${id}: got ${down.roles[id]}, expected ${expected[position][id]}`);
        if (JSON.stringify(down.roles) !== JSON.stringify(up.roles) || Math.abs(down.ohms - up.ohms) > 1) errs.push('push-pull changes the pickup circuit');
        if (!down.toneCapGrounded) errs.push('tone capacitor not connected with the knob pushed down');
        if (up.toneCapGrounded) errs.push('tone capacitor still connected with the knob pulled up');
        const measured = measuredOhms[position];
        if (Math.abs(down.ohms - measured) / measured > TOLERANCE) errs.push(`DC resistance ${Math.round(down.ohms)} Ω vs measured ${measured} Ω`);
    }
    if (errs.length) failures++;
    const roles = down.roles
        ? Object.entries(down.roles)
              .map(([k, v]) => `${k}=${v}`)
              .join(' ')
        : '';
    console.log(`${errs.length ? 'FAIL' : 'ok  '} position ${position}: ${roles}  ${down.ohms ? `${Math.round(down.ohms)} Ω (measured ${measuredOhms[position]} Ω)` : ''}${errs.length ? `\n     ${errs.join('\n     ')}` : ''}`);
}
console.log(failures ? `${failures} position(s) failed.` : 'All 5 positions match the voice map and the measured resistance; the push-pull only lifts the tone capacitor.');
process.exit(failures ? 1 : 0);
