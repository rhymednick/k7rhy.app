// Cross-checks the harness model in netlist.mjs against the expected values written out in
// reference.md §4–§5 and assembly-guide.md §4. The expected values below are typed from those
// documents, not computed from the model, so a mismatch means the model or a document is wrong.
//
//   node docs/engineering/coupeville-red-lipstick-special/check-netlist.mjs
import { fileURLToPath } from 'node:url';
import { allStates, chain, connectivity, formatPath, moduleContinuity, modules, operatingStates, relativeClass, seriesResistance, specStateId, stateKey } from './netlist.mjs';

export function runChecks() {
    const failures = [];
    let checks = 0;
    const expect = (condition, message) => {
        checks += 1;
        if (!condition) failures.push(message);
    };

    // reference.md §5 truth table: chain from the ground end, '+' NORMAL, '-' REVERSE; singles carry no sign.
    // Columns are the (neck phase, middle phase) settings NN, RN, NR, RR.
    const truthTable = {
        '000': ['MUTE', 'MUTE', 'MUTE', 'MUTE'],
        '001': ['B', 'B', 'B', 'B'],
        '010': ['M', 'M', 'M', 'M'],
        100: ['N', 'N', 'N', 'N'],
        '011': ['M+ B+', 'M+ B+', 'M- B+', 'M- B+'],
        101: ['N+ B+', 'N- B+', 'N+ B+', 'N- B+'],
        110: ['N+ M+', 'N- M+', 'N+ M-', 'N- M-'],
        111: ['N+ M+ B+', 'N- M+ B+', 'N+ M- B+', 'N- M- B+'],
    };
    const columns = ['NN', 'RN', 'NR', 'RR'];
    const states = allStates();
    expect(states.length === 32, `expected 32 switch states, got ${states.length}`);

    // 1. Every state: exactly one GND->BUS path through exactly the enabled pickups, no pickup shorted, and the
    //    chain matches the §5 truth table. A lone pickup's sign is not part of the table.
    for (const state of states) {
        const label = stateKey(state);
        const active = modules.filter((m) => state[m]);
        const { paths, shorted, muted } = chain(state);
        expect(shorted.length === 0, `${label}: pickup shorted across itself (${shorted})`);
        expect(paths.length === 1, `${label}: expected one series path, found ${paths.length}`);
        const path = paths[0] ?? [];
        expect(path.map((p) => p.m).join('') === active.join(''), `${label}: path pickups ${path.map((p) => p.m).join('')} differ from enabled ${active.join('')}`);
        const selection = `${state.N}${state.M}${state.B}`;
        const expected = truthTable[selection][columns.indexOf(`${state.phase.N}${state.phase.M}`)];
        const actual = active.length === 0 ? 'MUTE' : active.length === 1 ? active[0] : formatPath(path);
        expect(actual === expected, `${label}: chain "${actual}" differs from truth table "${expected}"`);
        expect(muted === (active.length === 0), `${label}: GND and BUS joined = ${muted}, expected ${active.length === 0}`);
        // bridge is the fixed reference: with every phase lever NORMAL it must read '+'
        if (state.B) expect(path.find((p) => p.m === 'B')?.sign === '+', `${label}: bridge is not the fixed '+' reference`);
    }

    // 2. Distinct states: model classes and the S0-S13 identifiers must correspond one to one.
    const classBySpecId = new Map();
    const specIdByClass = new Map();
    for (const state of states) {
        const id = specStateId(state);
        const { paths } = chain(state);
        const cls = `${state.N}${state.M}${state.B}|${relativeClass(paths[0] ?? [])}`;
        if (classBySpecId.has(id)) expect(classBySpecId.get(id) === cls, `${id}: switch settings produce different relative-phase classes (${classBySpecId.get(id)} vs ${cls})`);
        else classBySpecId.set(id, cls);
        if (specIdByClass.has(cls)) expect(specIdByClass.get(cls) === id, `class ${cls} maps to both ${specIdByClass.get(cls)} and ${id}`);
        else specIdByClass.set(cls, id);
    }
    expect(classBySpecId.size === 14, `expected 14 distinct states including mute, found ${classBySpecId.size}`);
    expect(operatingStates().length === 14, 'operatingStates() should list 14 states');

    // 3. assembly-guide.md §4.1 module continuity (pickup leads disconnected). Expected sets from the guide.
    const expectedModule = {
        'N ON': ['IN-R', 'OUT-H'],
        'R ON': ['IN-H', 'OUT-R'],
        'N OFF': ['IN-OUT', 'IN-H', 'OUT-H'],
        'R OFF': ['IN-OUT', 'IN-R', 'OUT-R'],
    };
    const bridgeModule = { ON: ['IN-R', 'OUT-H'], OFF: ['IN-OUT', 'IN-H', 'OUT-H'] };
    const sorted = (list) => [...list].sort().join(',');
    for (const state of states) {
        for (const m of modules) {
            const enable = state[m] ? 'ON' : 'OFF';
            const want = m === 'B' ? bridgeModule[enable] : expectedModule[`${state.phase[m]} ${enable}`];
            // ON never shorts IN to OUT; OFF always joins them.
            const got = moduleContinuity(state, m);
            expect(sorted(got) === sorted(want), `${stateKey(state)} module ${m}: closed ${sorted(got)} differs from guide ${sorted(want)}`);
            expect(got.includes('IN-OUT') === !state[m], `${stateKey(state)} module ${m}: IN-OUT closed = ${got.includes('IN-OUT')} with enable ${enable}`);
        }
    }

    // 4. assembly-guide.md §4.2 chain continuity with no pickups connected: a probe pair is closed iff every module between is OFF.
    const probes = [
        ['GND', 'N-OUT', 'E-N.C', 'E-N.OFF'],
        ['N-OUT', 'M-OUT', 'E-M.C', 'E-M.OFF'],
        ['M-OUT', 'BUS', 'E-B.C', 'E-B.OFF'],
        ['GND', 'BUS', 'E-N.C', 'E-B.OFF'],
    ];
    const chainTable = {
        '000': ['closed', 'closed', 'closed', 'closed'],
        '001': ['closed', 'closed', 'open', 'open'],
        '010': ['closed', 'open', 'closed', 'open'],
        100: ['open', 'closed', 'closed', 'open'],
        '011': ['closed', 'open', 'open', 'open'],
        101: ['open', 'closed', 'open', 'open'],
        110: ['open', 'open', 'closed', 'open'],
        111: ['open', 'open', 'open', 'open'],
    };
    for (const state of states) {
        const find = connectivity(state);
        const row = chainTable[`${state.N}${state.M}${state.B}`];
        probes.forEach(([from, to, a, b], i) => {
            const closed = find(a) === find(b) ? 'closed' : 'open';
            expect(closed === row[i], `${stateKey(state)} probe ${from}-${to}: ${closed}, guide says ${row[i]}`);
        });
    }

    // 5. assembly-guide.md §4.3 dummy-load rehearsal: neck 1.0k, middle 2.2k, bridge 4.7k.
    const dummy = { N: 1000, M: 2200, B: 4700 };
    const sums = { '000': 0, '001': 4700, '010': 2200, 100: 1000, '011': 6900, 101: 5700, 110: 3200, 111: 7900 };
    for (const state of states) {
        const got = seriesResistance(state, dummy);
        const want = sums[`${state.N}${state.M}${state.B}`];
        expect(got === want, `${stateKey(state)}: dummy-load sum ${got}, guide says ${want}`);
    }

    // 6. Grounding: each pickup case lead is on GND in every state; the volume input is on GND only when every pickup is OFF;
    //    a phase switch's two poles never touch each other.
    for (const state of states) {
        const find = connectivity(state);
        for (const m of modules) expect(find(`PU-${m}.CASE`) === find('E-N.C'), `${stateKey(state)}: ${m} case lead is not on GND`);
        expect((find('E-B.OFF') === find('E-N.C')) === (!state.N && !state.M && !state.B), `${stateKey(state)}: BUS on GND mismatch`);
        for (const m of ['N', 'M']) {
            expect(find(`P-${m}.1C`) !== find(`P-${m}.2C`), `${stateKey(state)}: ${m} phase poles touch`);
            expect(find(`PU-${m}.H`) !== find(`PU-${m}.R`), `${stateKey(state)}: ${m} hot and return leads touch`);
        }
        expect(find('PU-B.H') !== find('PU-B.R'), `${stateKey(state)}: bridge hot and return leads touch`);
        expect(find('VOL.WIPER') !== find('VOL.CCW') && find('VOL.WIPER') !== find('VOL.CW'), `${stateKey(state)}: volume wiper joined to a pot end`);
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
    console.log(`OK: ${checks} checks passed across 32 switch states (14 distinct states including mute).`);
}
