#!/usr/bin/env node
// Simulates every PRS26001 selector position and push-pull state from netlist.mjs
// and checks each coil's role, phase, and the absence of shorts.
//   node docs/engineering/prs26001/check-netlist.mjs
import { coils, expected, modes, positions, pushPull, resistors, superSwitch } from './netlist.mjs';

function solve(position, mode) {
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

    const elements = [...coils.map((c) => ({ id: c.id, a: find(c.plus), b: find(c.minus), plus: find(c.plus), minus: find(c.minus) })), ...resistors.map((r) => ({ id: r.id, a: find(r.a), b: find(r.b) }))];
    const BUS = find('BUS');
    const GND = find('GND');
    if (BUS === GND) return { error: 'BUS shorted to GND' };

    // Prune dangling elements: an element is live only if both ends reach a node
    // that is BUS, GND, or shared with another live element.
    let live = elements.filter((e) => e.a !== e.b);
    for (let changed = true; changed; ) {
        changed = false;
        const degree = new Map();
        for (const e of live) for (const n of [e.a, e.b]) degree.set(n, (degree.get(n) ?? 0) + 1);
        const keep = live.filter((e) => [e.a, e.b].every((n) => n === BUS || n === GND || degree.get(n) > 1));
        if (keep.length !== live.length) {
            live = keep;
            changed = true;
        }
    }

    const roles = {};
    const problems = [];
    for (const c of coils) {
        const e = live.find((l) => l.id === c.id);
        const all = elements.find((l) => l.id === c.id);
        if (!e) {
            roles[c.id] = 'off';
            continue;
        }
        if (all.plus === GND || all.minus === BUS) problems.push(`${c.id} out of phase`);
        const shunt = live.find((l) => l.id.startsWith('R') && new Set([l.a, l.b, e.a, e.b]).size === 2);
        if (shunt) roles[c.id] = 'shunted';
        else if ((e.a === BUS && e.b === GND) || (e.a === GND && e.b === BUS)) roles[c.id] = 'parallel';
        else roles[c.id] = 'series';
    }
    return { roles, problems };
}

let failures = 0;
for (const position of positions) {
    for (const mode of modes) {
        const key = `${position}-${mode}`;
        const result = solve(position, mode);
        const want = expected[key];
        const errs = result.error
            ? [result.error]
            : [
                  ...result.problems,
                  ...Object.keys(want)
                      .filter((id) => result.roles[id] !== want[id])
                      .map((id) => `${id}: got ${result.roles[id]}, expected ${want[id]}`),
              ];
        if (errs.length) failures++;
        console.log(
            `${errs.length ? 'FAIL' : 'ok  '} position ${position}, tone ${mode}: ${
                result.roles
                    ? Object.entries(result.roles)
                          .map(([k, v]) => `${k}=${v}`)
                          .join(' ')
                    : ''
            }${errs.length ? `\n     ${errs.join('\n     ')}` : ''}`
        );
    }
}
console.log(failures ? `${failures} state(s) failed.` : 'All 10 operating states match the voice map.');
process.exit(failures ? 1 : 0);
