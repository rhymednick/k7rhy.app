// Rebuilds connectivity from the *drawn geometry* of a treble bleed diagram and compares it with netlist.mjs.
// draw.mjs tags wires, junction dots, terminals, switch levers and net labels with data-* attributes; this file uses
// only those tags, so it checks what is drawn, not the code that drew it.
//
// Rules: wire vertices that share a coordinate are joined; a wire end lying on another wire joins only where a
// junction dot sits; crossings without a dot are not connections; a terminal joins the nearest wire vertex within
// 9 px; a lever joins the two terminals at its ends. The permanent wiring is always checked; the lever state is
// checked against the netlist when expectedMode is given.
import { connectivity, netOf, wires as netlistWires } from './netlist.mjs';

const attrs = (s) => Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
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

export function verifyDrawing(svg, opts) {
    const problems = [];
    const tags = [...svg.matchAll(/<(polyline|circle|line|text|g)\b([^>]*?)\/?>/g)].map((m) => ({ tag: m[1], a: attrs(m[2]) }));
    const nets = new Set(Object.keys(netlistWires));

    const wires = tags
        .filter((e) => e.tag === 'polyline' && e.a['data-wire'])
        .map((e) => ({
            net: e.a['data-net'],
            points: e.a.points
                .trim()
                .split(/\s+/)
                .map((p) => p.split(',').map(Number)),
        }));
    const dots = tags.filter((e) => e.a['data-dot']).map((e) => [Number(e.a.cx), Number(e.a.cy)]);
    const terminals = tags.filter((e) => e.a['data-terminal']).map((e, i) => ({ name: e.a['data-terminal'], id: `${e.a['data-terminal']}#${i}`, x: Number(e.a.cx), y: Number(e.a.cy) }));
    const blades = tags
        .filter((e) => e.tag === 'line' && e.a['data-blade'])
        .map((e) => [
            [Number(e.a.x1), Number(e.a.y1)],
            [Number(e.a.x2), Number(e.a.y2)],
        ]);
    const labels = tags.filter((e) => e.a['data-netlabel']).map((e) => e.a['data-netlabel']);

    // Type size: nothing under 14 px.
    for (const e of tags.filter((t) => t.tag === 'text')) {
        const size = Number(e.a['font-size']);
        if (!(size >= 14)) problems.push(`text with font-size ${e.a['font-size'] ?? 'unset'} is under 14 px`);
    }

    // Net names must exist in the netlist.
    for (const w of wires) if (!nets.has(w.net)) problems.push(`wire carries unknown net ${w.net}`);
    for (const l of labels) if (!nets.has(l)) problems.push(`net label ${l} is not a net in the netlist`);

    // Terminal inventory: exactly the expected terminals, each once.
    const drawn = terminals.map((t) => t.name);
    for (const n of opts.terminals) if (!drawn.includes(n)) problems.push(`terminal ${n} is expected but not drawn`);
    for (const n of new Set(drawn)) if (!opts.terminals.includes(n)) problems.push(`terminal ${n} is drawn but not expected`);
    for (const n of new Set(drawn.filter((d, i) => drawn.indexOf(d) !== i))) problems.push(`terminal ${n} is drawn more than once`);

    const segments = [];
    wires.forEach((w, wi) => {
        for (let i = 0; i < w.points.length - 1; i++) segments.push({ wi, a: w.points[i], b: w.points[i + 1] });
    });
    const vertices = wires.flatMap((w) => w.points);
    const nearestTerminal = ([x, y]) => {
        let best = null;
        for (const t of terminals) {
            const d = Math.hypot(t.x - x, t.y - y);
            if (d <= 12 && (!best || d < best.d)) best = { d, t };
        }
        return best?.t;
    };
    const build = (withBlades) => {
        const uf = makeUnionFind();
        wires.forEach((w, wi) => w.points.forEach(([x, y]) => uf.union(`W${wi}`, key(x, y))));
        for (const [x, y] of dots) for (const seg of segments) if (distanceToSegment(x, y, seg.a, seg.b) <= 0.6) uf.union(`W${seg.wi}`, key(x, y));
        for (const t of terminals) {
            let best = null;
            for (const [vx, vy] of vertices) {
                const d = Math.hypot(vx - t.x, vy - t.y);
                if (d <= 9 && (!best || d < best.d)) best = { d, vx, vy };
            }
            if (best) uf.union(t.id, key(best.vx, best.vy));
        }
        if (withBlades) {
            blades.forEach(([p, q], i) => {
                const a = nearestTerminal(p);
                const b = nearestTerminal(q);
                if (!a || !b) problems.push(`lever ${i} at ${p} to ${q} does not end on two terminals`);
                else uf.union(a.id, b.id);
            });
        }
        return uf;
    };
    const stat = build(false);
    const shown = build(true);

    // A wire tagged with a net may only touch terminals that the netlist puts on that net.
    wires.forEach((w, wi) => {
        for (const t of terminals) {
            if (stat.find(t.id) !== stat.find(`W${wi}`)) continue;
            let perm;
            try {
                perm = netOf(t.name);
            } catch {
                continue;
            }
            if (perm !== w.net) problems.push(`wire tagged ${w.net} touches ${t.name}, which is on net ${perm}`);
        }
    });

    // Drawn connectivity versus the netlist, for every pair of drawn terminals that the netlist knows.
    const known = terminals.filter((t) => Object.values(netlistWires).some((list) => list.includes(t.name)));
    const lever = opts.expectedMode ? connectivity(opts.expectedMode, 5, 5) : null;
    for (let i = 0; i < known.length; i++) {
        for (let j = i + 1; j < known.length; j++) {
            const a = known[i];
            const b = known[j];
            const wantStatic = netOf(a.name) === netOf(b.name);
            const drawnStatic = stat.find(a.id) === stat.find(b.id);
            if (drawnStatic !== wantStatic) problems.push(`${drawnStatic ? 'drawn wired together' : 'drawn not wired together'} but the permanent wiring says ${wantStatic ? `together (${netOf(a.name)})` : `apart (${netOf(a.name)} vs ${netOf(b.name)})`}: ${a.name} and ${b.name}`);
            if (lever) {
                const wantShown = lever.get(a.name) === lever.get(b.name);
                const drawnShown = shown.find(a.id) === shown.find(b.id);
                if (drawnShown !== wantShown) problems.push(`${drawnShown ? 'drawn connected' : 'drawn separate'} but the netlist in ${opts.expectedMode} says ${wantShown ? `connected (${lever.get(a.name)})` : 'separate'}: ${a.name} and ${b.name}`);
            }
        }
    }
    return { ok: problems.length === 0, problems };
}
