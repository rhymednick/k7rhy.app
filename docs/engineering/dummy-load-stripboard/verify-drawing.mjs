// Rebuilds connectivity from the DRAWN geometry in the sheet SVG (strip rectangles, terminal dots, link wires, cut
// gap) and compares it with the expected netlist and with layout.mjs. Uses only data-* tags and coordinates.
//   node verify-drawing.mjs [path/to/sheet.svg]
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLayout, terminals } from './layout.mjs';
import { EXPECTED_NETS } from './check-layout.mjs';

const attrs = (tagText) => Object.fromEntries([...tagText.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
const here = dirname(fileURLToPath(import.meta.url));

export function verifySvg(svgPath) {
    const svg = readFileSync(svgPath, 'utf8');
    const tags = (re) => [...svg.matchAll(re)].map((m) => attrs(m[0]));
    const strips = tags(/<rect [^>]*data-strip="[^"]*"[^>]*>/g).map((a) => ({ id: a['data-strip'], x: +a.x, y: +a.y, w: +a.width, h: +a.height }));
    const holes = tags(/<circle [^>]*data-gridhole="[^"]*"[^>]*>/g).map((a) => ({ key: a['data-gridhole'], x: +a.cx, y: +a.cy }));
    const terms = tags(/<circle [^>]*data-term="[^"]*"[^>]*>/g).map((a) => ({ name: a['data-term'], x: +a.cx, y: +a.cy }));
    const links = tags(/<line [^>]*data-link="[^"]*"[^>]*>/g).map((a) => ({ name: a['data-link'], x1: +a.x1, y1: +a.y1, x2: +a.x2, y2: +a.y2 }));
    const failures = [];
    const stripAt = (x, y) => strips.find((s) => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h)?.id;
    const holeAt = (x, y) => holes.find((h) => Math.hypot(h.x - x, h.y - y) < 4)?.key;

    // union-find over strip segments, joined by links
    const parent = new Map();
    const find = (a) => {
        if (!parent.has(a)) parent.set(a, a);
        while (parent.get(a) !== a) {
            parent.set(a, parent.get(parent.get(a)));
            a = parent.get(a);
        }
        return a;
    };
    for (const l of links) {
        const a = stripAt(l.x1, l.y1),
            b = stripAt(l.x2, l.y2);
        if (!a || !b) failures.push(`link ${l.name} does not land on strips`);
        else parent.set(find(a), find(b));
    }
    const groups = new Map();
    for (const t of terms) {
        if (/^W\d/.test(t.name)) continue;
        const s = stripAt(t.x, t.y);
        if (!s) {
            failures.push(`terminal ${t.name} is not on any strip`);
            continue;
        }
        const root = find(s);
        if (!groups.has(root)) groups.set(root, []);
        groups.get(root).push(t.name);
    }
    const canon = (list) => list.map((n) => [...n].sort().join(' ')).sort();
    const drawn = canon([...groups.values()]);
    const expected = canon(EXPECTED_NETS);
    if (JSON.stringify(drawn) !== JSON.stringify(expected)) failures.push(`drawn connectivity differs from the expected netlist:\n    drawn    ${JSON.stringify(drawn)}\n    expected ${JSON.stringify(expected)}`);

    // every terminal must sit on the hole the layout says
    const layout = buildLayout();
    const want = new Map(terminals(layout).map(([n, h]) => [n, `${h[0]},${h[1]}`]));
    for (const t of terms) {
        if (!want.has(t.name)) continue;
        const got = holeAt(t.x, t.y);
        if (got !== want.get(t.name)) failures.push(`${t.name} drawn on hole ${got}, layout says ${want.get(t.name)}`);
    }
    for (const [n] of want) if (!terms.some((t) => t.name === n)) failures.push(`${n} is not drawn`);
    // every strap/wire in the layout must be drawn between the holes the layout says
    for (const p of layout.parts.filter((q) => q.kind === 'link')) {
        const l = links.find((x) => x.name === p.ref);
        if (!l) {
            failures.push(`${p.ref} is not drawn`);
            continue;
        }
        const a = holeAt(l.x1, l.y1),
            b = holeAt(l.x2, l.y2);
        if (a !== `${p.a[0]},${p.a[1]}` || b !== `${p.b[0]},${p.b[1]}`) failures.push(`${p.ref} is drawn from ${a} to ${b}, layout says ${p.a} to ${p.b}`);
    }
    // the cut: strip 10 must be drawn as two separate rectangles
    const row10 = strips.filter((s) => s.id.startsWith('10,'));
    if (row10.length !== 2) failures.push(`strip 10 is drawn as ${row10.length} piece(s), expected 2 (one cut)`);
    return { failures, terms: terms.length, strips: strips.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const path = process.argv[2] ?? join(here, 'stripboard-sheet.svg');
    const { failures, terms, strips } = verifySvg(path);
    if (failures.length) {
        console.error(`drawing check failed (${failures.length}):`);
        failures.forEach((f) => console.error('  - ' + f));
        process.exit(1);
    }
    console.log(`drawing matches the netlist (${terms} terminals, ${strips} strip pieces)`);
}
