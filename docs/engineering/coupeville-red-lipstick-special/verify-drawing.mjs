// Rebuilds connectivity from the *drawn geometry* of wiring-schematic.svg and compares it with the netlist.
// The generator tags wires, junction dots, terminals, and switch blades with data-* attributes; this file
// uses only those tags, so it checks what is actually drawn, not the code that drew it.
//
//   node docs/engineering/coupeville-red-lipstick-special/verify-drawing.mjs
//
// Rules: wire vertices that share a coordinate are joined; a wire end lying on another wire joins only where a
// junction dot sits; crossings without a dot are not connections; an arch (data-bridge) joins its two ends;
// a terminal joins the nearest wire vertex within 9 px; a blade joins the two terminals at its ends.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectivity, netOf, wires as netlistWires } from './netlist.mjs';

const attrs = (text) => Object.fromEntries([...text.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
const num = (v) => Number(v);
const key = (x, y) => `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`;

function distanceToSegment(px, py, [x1, y1], [x2, y2]) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function makeUnionFind() {
    const parent = new Map();
    const find = (a) => {
        if (!parent.has(a)) parent.set(a, a);
        while (parent.get(a) !== a) {
            parent.set(a, parent.get(parent.get(a)));
            a = parent.get(a);
        }
        return a;
    };
    return { find, union: (a, b) => parent.set(find(a), find(b)) };
}

const staticNet = (terminal) => {
    try {
        return netOf(terminal);
    } catch {
        return terminal; // not on any permanent net (e.g. the unused tone CW lug)
    }
};

export function verifySchematic(svg) {
    const failures = [];
    const elements = [...svg.matchAll(/<(polyline|path|circle|line|rect)\b([^>]*?)\/?>/g)].map((m) => ({ tag: m[1], a: attrs(m[2]) }));

    const wires = elements
        .filter((e) => e.tag === 'polyline' && e.a['data-wire'])
        .map((e) =>
            e.a.points
                .trim()
                .split(/\s+/)
                .map((p) => p.split(',').map(num))
        );
    const bridges = elements
        .filter((e) => e.a['data-bridge'])
        .map((e) =>
            e.a['data-bridge']
                .trim()
                .split(/\s+/)
                .map((p) => p.split(',').map(num))
        );
    const dots = elements.filter((e) => e.a['data-dot']).map((e) => [num(e.a.cx), num(e.a.cy)]);
    const terminals = elements.filter((e) => e.a['data-term']).map((e, i) => ({ name: e.a['data-term'], id: `${e.a['data-term']}#${i}`, x: num(e.a.cx), y: num(e.a.cy) }));
    const blades = elements
        .filter((e) => e.tag === 'line' && e.a['data-blade'])
        .map((e) => [
            [num(e.a.x1), num(e.a.y1)],
            [num(e.a.x2), num(e.a.y2)],
        ]);
    const labels = elements.filter((e) => e.a['data-netlabel']).map((e) => ({ name: e.a['data-netlabel'], x: num(e.a['data-cx']), y: num(e.a['data-cy']) }));

    // Union-find over drawn conductors: wires, dots, arches, terminals. Optionally add the blades (the shown lever state).
    const segments = [];
    wires.forEach((points, wi) => {
        for (let i = 0; i < points.length - 1; i++) segments.push({ wi, a: points[i], b: points[i + 1] });
    });
    const vertices = wires.flatMap((points) => points);
    const real = terminals.filter((t) => t.name !== 'GNDSYM');
    const nearestTerminal = ([x, y]) => {
        let best = null;
        for (const t of real) {
            const d = Math.hypot(t.x - x, t.y - y);
            if (d <= 12 && (!best || d < best.d)) best = { d, t };
        }
        return best?.t;
    };
    const build = (withBlades) => {
        const uf = makeUnionFind();
        wires.forEach((points, wi) => points.forEach(([x, y]) => uf.union(`W${wi}`, key(x, y))));
        bridges.forEach(([[x1, y1], [x2, y2]]) => uf.union(key(x1, y1), key(x2, y2)));
        dots.forEach(([x, y]) => {
            for (const seg of segments) if (distanceToSegment(x, y, seg.a, seg.b) <= 0.6) uf.union(`W${seg.wi}`, key(x, y));
        });
        for (const t of terminals) {
            let best = null;
            for (const [vx, vy] of vertices) {
                const d = Math.hypot(vx - t.x, vy - t.y);
                if (d <= 9 && (!best || d < best.d)) best = { d, vx, vy };
            }
            if (best) uf.union(t.id, key(best.vx, best.vy));
            else if (withBlades === false && t.name !== 'GNDSYM') failures.push(`terminal ${t.name} at ${t.x},${t.y} touches no wire`);
        }
        terminals.filter((t) => t.name === 'GNDSYM').forEach((t) => uf.union(t.id, 'GND*'));
        if (withBlades) {
            blades.forEach(([p, q], i) => {
                const a = nearestTerminal(p);
                const b = nearestTerminal(q);
                if (!a || !b) failures.push(`blade ${i} at ${p} → ${q} does not end on two terminals`);
                else uf.union(a.id, b.id);
            });
        }
        return uf;
    };
    const stat = build(false);
    const shown = build(true);

    // 3. Terminal inventory: exactly the netlist's terminals (plus the unused tone CW lug) are drawn.
    const expectedNames = new Set(Object.values(netlistWires).flat().concat(['TONE.CW']));
    const drawnNames = new Set(real.map((t) => t.name));
    for (const n of expectedNames) if (!drawnNames.has(n)) failures.push(`terminal ${n} is in the netlist but not drawn`);
    for (const n of drawnNames) if (!expectedNames.has(n)) failures.push(`terminal ${n} is drawn but not in the netlist`);
    const dup = real.map((t) => t.name).filter((n, i, all) => all.indexOf(n) !== i);
    if (dup.length) failures.push(`terminals drawn more than once: ${[...new Set(dup)].join(', ')}`);

    // 4. Drawn connectivity must equal the netlist for the shown state (every lever UP, S10) and for the permanent wiring.
    const shownState = { N: 1, M: 1, B: 1, phase: { N: 'N', M: 'N' } };
    const find = connectivity(shownState);
    const gndRep = find('JACK.SLV');
    const entries = terminals.map((t) => ({ ...t, shown: t.name === 'GNDSYM' ? gndRep : find(t.name), perm: t.name === 'GNDSYM' ? 'GND' : staticNet(t.name) }));
    for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
            const a = entries[i];
            const b = entries[j];
            if (a.name === 'GNDSYM' && b.name === 'GNDSYM') continue;
            const drawnShown = shown.find(a.id) === shown.find(b.id);
            const wantShown = a.shown === b.shown;
            if (drawnShown !== wantShown) failures.push(`${drawnShown ? 'drawn connected' : 'drawn separate'} but netlist (lever UP) says ${wantShown ? 'connected' : 'separate'}: ${a.name} ↔ ${b.name}`);
            const drawnStatic = stat.find(a.id) === stat.find(b.id);
            const wantStatic = a.perm === b.perm;
            if (drawnStatic !== wantStatic) failures.push(`${drawnStatic ? 'drawn wired together' : 'drawn not wired together'} but permanent netlist says ${wantStatic ? 'together' : 'apart'}: ${a.name} ↔ ${b.name}`);
        }
    }

    // 5. Every net label sits on a wire whose permanent net carries that name.
    for (const label of labels) {
        const hit = segments.filter((seg) => distanceToSegment(label.x, label.y, seg.a, seg.b) <= 2);
        if (!hit.length) {
            failures.push(`net label ${label.name} at ${label.x},${label.y} is not on a wire`);
            continue;
        }
        const roots = new Set(hit.map((seg) => stat.find(`W${seg.wi}`)));
        const names = new Set();
        for (const t of entries) if (roots.has(stat.find(t.id))) names.add(t.perm);
        if (names.size !== 1 || !names.has(label.name)) failures.push(`net label ${label.name} at ${label.x},${label.y} sits on a wire carrying ${[...names].join(', ') || 'no terminals'}`);
    }
    return failures;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const here = dirname(fileURLToPath(import.meta.url));
    const failures = verifySchematic(readFileSync(join(here, 'wiring-schematic.svg'), 'utf8'));
    if (failures.length) {
        console.error(`FAILED: schematic geometry differs from the netlist (${failures.length} problems):`);
        failures.slice(0, 40).forEach((f) => console.error(`  - ${f}`));
        process.exit(1);
    }
    console.log('OK: schematic geometry matches the netlist (lever-UP state and permanent wiring).');
}
