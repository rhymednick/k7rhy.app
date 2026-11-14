// Draws the stripboard builder sheet (SVG + PNG) from layout.mjs, limits.mjs, and the RF model.
// Refuses to draw if check-layout.mjs fails, and re-verifies the drawing against the netlist afterwards.
//   node docs/engineering/dummy-load-stripboard/generate-sheet.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { runChecks } from './check-layout.mjs';
import { buildLayout, nets, stripSegments, terminals } from './layout.mjs';
import { DIODES, RESISTORS, RULES, limitsFor, peakInverseVolts } from './limits.mjs';
import { buildRfModel, NOMINAL, PESSIMISTIC, swr } from './rf-model.mjs';
import { verifySvg } from './verify-drawing.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const { checks, failures } = runChecks();
if (failures.length) {
    console.error(`Layout check failed (${failures.length} of ${checks}); not drawing.`);
    failures.slice(0, 10).forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
}
const REV = 'Rev 0.1 DRAFT • 2026-10-25 • modeled, not yet built';
const ink = '#25303b',
    muted = '#4c5b68',
    border = '#465c70',
    pale = '#eef7fb';
const C = { IN: '#b94a2e', GND: '#445464', M: '#246c58', DET: '#7b3fa0' };
const W = 2400;

const layout = buildLayout();
const netList = nets(layout);
const netName = (members) => (members.includes('J1.CENTER') ? 'IN' : members.includes('J1.SHELL') ? 'GND' : members.includes('D1.A') ? 'M' : members.includes('D1.K') ? 'DET' : '?');
const termNet = new Map();
for (const members of netList) for (const t of members) termNet.set(t, netName(members));
const holeNet = new Map(); // "c,r" -> net, via the terminals sitting on it
for (const [name, h] of terminals(layout)) if (termNet.has(name)) holeNet.set(`${h[0]},${h[1]}`, termNet.get(name));

// ---- sheet helpers ----
const entries = [];
const add = (s) => entries.push(s);
const esc = (v) => String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const rect = (x, y, w, h, fill = 'white', stroke = 'none', r = 0, sw = 2, extra = '') => add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`);
const line = (x1, y1, x2, y2, color = border, sw = 2, extra = '') => add(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" ${extra}/>`);
const circle = (x, y, r, fill, stroke = 'none', sw = 2, extra = '') => add(`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`);
const path = (d, color, sw = 3, fill = 'none', extra = '') => add(`<path d="${d}" fill="${fill}" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`);
const txt = (x, y, v, size = 24, color = ink, weight = 500, anchor = 'start', extra = '') => add(`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" ${extra}>${esc(v)}</text>`);
const txtH = (x, y, v, size = 24, color = ink, weight = 500, anchor = 'start') => txt(x, y, v, size, color, weight, anchor, 'stroke="white" stroke-width="7" paint-order="stroke" stroke-linejoin="round"');
const card = (x, y, w, h, heading, subtitle = '') => {
    rect(x, y, w, h, 'white', border, 6, 2);
    rect(x + 2, y + 2, w - 4, 54, pale, 'none', 4);
    txt(x + 22, y + 39, heading, 30, ink, 750);
    if (subtitle) txt(x + w - 20, y + 37, subtitle, 19, muted, 400, 'end');
};
const tag = (cx, cy, label, color, w = 84, h = 34, size = 20) => {
    rect(cx - w / 2, cy - h / 2, w, h, 'white', color, 4, 2.4);
    txt(cx, cy + size * 0.34, label, size, color, 700, 'middle');
};

// ================= panel 1: layout =================
const P = 58,
    X0 = 280,
    Y0 = 450;
const X = (c) => X0 + (c - 1) * P;
const Y = (r) => Y0 + (r - 1) * P;
const p1 = { x: 30, y: 130, w: W - 60, h: 1060 };
card(p1.x, p1.y, p1.w, p1.h, '1. BOARD LAYOUT', `component side up • strips run left–right underneath • hole = (column, strip) • ${layout.cols} columns × ${layout.rows} strips`);

// board
rect(X(1) - 0.85 * P, Y(1) - 0.85 * P, (layout.cols - 1) * P + 1.7 * P, (layout.rows - 1) * P + 1.7 * P, '#faf6ea', '#9a8f74', 14, 3);
// strips (copper, seen through the board)
for (const s of stripSegments(layout)) {
    let net = null;
    for (let c = s.from; c <= s.to; c++) if (holeNet.has(`${c},${s.row}`)) net = holeNet.get(`${c},${s.row}`);
    const fill = net ? C[net] : '#c9d1d7';
    const left = X(s.from) - (s.from === 1 ? 0.55 : 0.38) * P,
        right = X(s.to) + (s.to === layout.cols ? 0.55 : 0.38) * P;
    rect(left, Y(s.row) - 0.34 * P, right - left, 0.68 * P, fill, 'none', 6, 0, `fill-opacity="${net ? 0.2 : 0.45}" data-strip="${s.row},${s.from},${s.to}"`);
}
// holes
for (let r = 1; r <= layout.rows; r++) for (let c = 1; c <= layout.cols; c++) circle(X(c), Y(r), 6.5, 'white', '#8a97a3', 1.6, `data-gridhole="${c},${r}"`);
// column numbers
for (let c = 1; c <= layout.cols; c++) txt(X(c), Y(1) - 0.98 * P, c, 17, muted, 500, 'middle');
// strip numbers and net tags on the left
const rowLabel = { [layout.rowA]: 'IN', [layout.rowG]: 'GND', [layout.rowM1]: 'M', [layout.rowM2]: 'M', [layout.rowGd]: 'GND' };
for (let r = 1; r <= layout.rows; r++) {
    txt(X(1) - 1.0 * P, Y(r) + 6, r, 19, muted, 600, 'end');
    if (rowLabel[r]) tag(X(1) - 2.15 * P, Y(r), rowLabel[r], C[rowLabel[r]], 76);
}
// brace for the unused strips
const bx = X(1) - 1.6 * P;
path(`M${bx + 12},${Y(3) - 14} L${bx},${Y(3) - 14} L${bx},${Y(8) + 14} L${bx + 12},${Y(8) + 14}`, muted, 2.5);
txt(bx - 12, Y(5) + 4, 'strips 3–8:', 19, muted, 600, 'end');
txt(bx - 12, Y(5) + 28, 'leave bare', 19, muted, 600, 'end');

// ---- parts ----
const bodyFrac = 0.62; // resistor body as a fraction of the lead span
for (const p of layout.parts.filter((q) => q.kind === 'resistor')) {
    const x = X(p.a[0]),
        y1 = Y(p.a[1]),
        y2 = Y(p.b[1]);
    const len = (y2 - y1) * bodyFrac,
        top = (y1 + y2) / 2 - len / 2,
        w = 0.95 * P;
    line(x, y1, x, y2, '#8b99a3', 4);
    rect(x - w / 2, top, w, len, '#b9472f', '#7d2c1b', 20, 2.5);
    [
        ['#6b3a1d', 0.1],
        ['#161616', 0.2],
        ['#6b3a1d', 0.3],
    ].forEach(([col, f]) => rect(x - w / 2 + 1, top + f * len, w - 2, 9, col));
    rect(x - w / 2 + 1, top + 0.44 * len, w - 2, 9, '#d4a437');
    txt(x, top + 0.72 * len, p.ref, 29, 'white', 800, 'middle');
    txt(x, top + 0.72 * len + 25, p.value, 19, 'white', 600, 'middle');
    for (const [pin, h] of [
        ['1', p.a],
        ['2', p.b],
    ]) {
        circle(X(h[0]), Y(h[1]), 9, C[termNet.get(`${p.ref}.${pin}`)], 'none', 0, `data-term="${p.ref}.${pin}" data-hole="${h}"`);
        circle(X(h[0]), Y(h[1]), 3.2, 'white');
    }
}
for (const p of layout.parts.filter((q) => q.kind === 'link')) {
    const x1 = X(p.a[0]),
        y1 = Y(p.a[1]),
        x2 = X(p.b[0]),
        y2 = Y(p.b[1]);
    if (p.insulated) {
        add(`<line data-link="${p.ref}" data-a="${p.a}" data-b="${p.b}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.GND}" stroke-width="9" stroke-linecap="round" stroke-dasharray="26 8"/>`);
        txt(x1 + 30, (y1 + y2) / 2 - 40, `${p.ref}`, 26, C.GND, 800);
        txt(x1 + 30, (y1 + y2) / 2 - 12, 'insulated', 19, C.GND, 600);
        txt(x1 + 30, (y1 + y2) / 2 + 12, 'wire, strip 2', 19, C.GND, 600);
        txt(x1 + 30, (y1 + y2) / 2 + 36, 'to strip 11', 19, C.GND, 600);
    } else {
        add(`<line data-link="${p.ref}" data-a="${p.a}" data-b="${p.b}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#c8962a" stroke-width="10" stroke-linecap="round"/>`);
        txtH(x1 + 16, (y1 + y2) / 2 + 7, p.ref, 20, '#7a5a10', 800);
    }
    for (const [pin, h] of [
        ['1', p.a],
        ['2', p.b],
    ])
        add(`<circle data-term="${p.ref}.${pin}" data-hole="${h}" cx="${X(h[0])}" cy="${Y(h[1])}" r="1" fill="none"/>`);
}
// diode
{
    const d = layout.parts.find((q) => q.kind === 'diode');
    const y = Y(d.anode[1]),
        xa = X(d.anode[0]),
        xk = X(d.cathode[0]);
    line(xa, y, xk, y, '#8b99a3', 4);
    const bw = 0.46 * (xk - xa),
        bx0 = (xa + xk) / 2 - bw / 2;
    rect(bx0, y - 15, bw, 30, '#3b82a0', '#1d4e66', 8, 2.5);
    rect(bx0 + bw - 14, y - 15, 10, 30, '#111');
    txtH(xa + 6, y - 24, d.ref, 23, ink, 800);
    txtH(xk - 4, y - 24, 'band', 17, muted, 600, 'middle');
    for (const [pin, h] of [
        ['A', d.anode],
        ['K', d.cathode],
    ]) {
        circle(X(h[0]), Y(h[1]), 9, C[termNet.get(`${d.ref}.${pin}`)], 'none', 0, `data-term="${d.ref}.${pin}" data-hole="${h}"`);
        circle(X(h[0]), Y(h[1]), 3.2, 'white');
    }
}
// capacitors
for (const p of layout.parts.filter((q) => q.kind === 'capacitor')) {
    const x = X(p.a[0]),
        y = (Y(p.a[1]) + Y(p.b[1])) / 2;
    line(x, Y(p.a[1]), x, Y(p.b[1]), '#8b99a3', 4);
    circle(x, y, 17, '#e2a53a', '#8a5f10', 2.5);
    const left = p.role === 'detector';
    txtH(left ? x - 26 : x + 26, y - 2, p.ref, 24, ink, 800, left ? 'end' : 'start');
    txtH(left ? x - 26 : x + 26, y + 22, p.value, 18, muted, 600, left ? 'end' : 'start');
    for (const [pin, h] of [
        ['1', p.a],
        ['2', p.b],
    ]) {
        circle(X(h[0]), Y(h[1]), 9, C[termNet.get(`${p.ref}.${pin}`)], 'none', 0, `data-term="${p.ref}.${pin}" data-hole="${h}"`);
        circle(X(h[0]), Y(h[1]), 3.2, 'white');
    }
}
// test points
for (const p of layout.parts.filter((q) => q.kind === 'testpoint')) {
    const x = X(p.at[0]),
        y = Y(p.at[1]);
    rect(x - 13, y - 13, 26, 26, 'white', C[termNet.get(`${p.ref}.1`)], 3, 3.5);
    circle(x, y, 3.5, ink, 'none', 0, `data-term="${p.ref}.1" data-hole="${p.at}"`);
    txtH(x, p.at[1] === layout.rowGd ? y + 42 : y - 22, p.ref, 21, C[termNet.get(`${p.ref}.1`)], 800, 'middle');
}
// BNC feed
{
    const f = layout.parts.find((q) => q.kind === 'feed');
    const xc = X(f.center[0]),
        yc = Y(f.center[1]),
        ys = Y(f.shell[1]);
    const bncY = 275;
    // connector body
    rect(xc - 118, bncY - 70, 236, 110, '#f3f6f8', border, 12, 3);
    circle(xc + 45, bncY - 15, 33, '#d5dde3', border, 3);
    circle(xc + 45, bncY - 15, 11, '#444');
    txt(xc - 100, bncY - 28, 'J1  BNC', 28, ink, 800);
    txt(xc - 100, bncY + 2, 'jack', 21, muted, 600);
    const lug = xc - 0.5 * P,
        pin = xc;
    // centre wire: straight down to strip 1
    add(`<polyline data-wire="J1.CENTER" points="${pin},${bncY + 40} ${pin},${yc}" fill="none" stroke="${C.IN}" stroke-width="6" stroke-linecap="round"/>`);
    // shell wire: down the gap between columns 11 and 12 to strip 2
    add(`<polyline data-wire="J1.SHELL" points="${lug},${bncY + 40} ${lug},${ys} ${xc},${ys}" fill="none" stroke="${C.GND}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`);
    txt(pin + 16, bncY + 66, 'centre pin → strip 1', 21, C.IN, 700);
    txt(lug - 12, bncY + 66, 'shell lug → strip 2', 21, C.GND, 700, 'end');
    for (const [name, h, col] of [
        ['J1.CENTER', f.center, C.IN],
        ['J1.SHELL', f.shell, C.GND],
    ]) {
        circle(X(h[0]), Y(h[1]), 9, col, 'none', 0, `data-term="${name}" data-hole="${h}"`);
        circle(X(h[0]), Y(h[1]), 3.2, 'white');
    }
    txt(xc + 150, bncY - 34, 'both wires ≤ 10 mm, side by side', 22, ink, 700);
    txt(xc + 150, bncY - 8, 'every extra mm costs bandwidth', 20, muted, 500);
}
// cut marker
{
    const cut = layout.cuts[0];
    const cx = (X(cut.after) + X(cut.after + 1)) / 2,
        cy = Y(cut.row);
    add(`<g data-cut="${cut.row},${cut.after}">`);
    line(cx, cy - 24, cx, cy + 24, '#d1242f', 5);
    add('</g>');
    const ty = Y(layout.rowGd) + 1.25 * P;
    line(cx, cy + 26, cx, ty - 20, '#d1242f', 2.5);
    tag(cx, ty, 'CUT', '#d1242f', 62, 32, 19);
    txt(cx - 46, ty + 7, `strip ${cut.row}, between holes ${cut.after} and ${cut.after + 1}`, 21, '#d1242f', 700, 'end');
}
// detector callout and net tags at the right
tag(X(layout.cols) + 1.95 * P, Y(layout.rowM2), 'DET', C.DET, 74);
// legend
{
    const ly = p1.y + p1.h - 36;
    let lx = p1.x + 30;
    [
        ['IN', 'RF input strip'],
        ['GND', 'ground'],
        ['M', 'divider midpoint'],
        ['DET', 'detector node'],
    ].forEach(([n, d]) => {
        tag(lx + 38, ly, n, C[n], 76);
        txt(lx + 90, ly + 7, d, 21, ink, 500);
        lx += 90 + d.length * 11.5 + 40;
    });
    txt(p1.x + p1.w - 30, ly + 7, 'Resistors lie flat on the board, leads straight down their holes, trimmed short. Adjacent resistors carry opposite currents.', 21, muted, 500, 'end');
}

// ================= panel 2: circuit =================
const aRes = layout.parts.filter((p) => p.kind === 'resistor' && termNet.get(`${p.ref}.1`) === 'IN').map((p) => p.ref);
const gRes = layout.parts.filter((p) => p.kind === 'resistor' && termNet.get(`${p.ref}.1`) === 'GND').map((p) => p.ref);
const p2 = { x: 30, y: 1220, w: 1180, h: 600 };
card(p2.x, p2.y, p2.w, p2.h, '2. CIRCUIT', 'two banks of 4 × 100 Ω in series = 50 Ω');
{
    const sy = p2.y + 190,
        xM = p2.x + 640,
        xG = p2.x + 1020;
    const wire = (pts, color, sw = 4) => path(`M${pts.map((q) => q.join(',')).join(' L')}`, color, sw);
    // BNC
    circle(p2.x + 90, sy, 36, '#d5dde3', border, 3);
    circle(p2.x + 90, sy, 11, '#444');
    txt(p2.x + 90, sy - 50, 'J1 BNC', 20, ink, 700, 'middle');
    wire(
        [
            [p2.x + 126, sy],
            [p2.x + 330, sy],
        ],
        C.IN
    );
    tag(p2.x + 290, sy - 32, 'IN', C.IN, 60, 30, 18);
    // bank A
    rect(p2.x + 330, sy - 46, 230, 92, 'white', C.IN, 6, 3);
    txt(p2.x + 445, sy - 8, aRes.join(' '), 24, C.IN, 800, 'middle');
    txt(p2.x + 445, sy + 22, '4 × 100 Ω ∥ = 25 Ω', 21, ink, 600, 'middle');
    wire(
        [
            [p2.x + 560, sy],
            [xM, sy],
        ],
        C.M
    );
    circle(xM, sy, 7, C.M);
    tag(xM, sy - 40, 'M', C.M, 56, 30, 18);
    wire(
        [
            [xM, sy],
            [p2.x + 700, sy],
        ],
        C.M
    );
    rect(p2.x + 700, sy - 46, 230, 92, 'white', C.GND, 6, 3);
    txt(p2.x + 815, sy - 8, gRes.join(' '), 24, C.GND, 800, 'middle');
    txt(p2.x + 815, sy + 22, '4 × 100 Ω ∥ = 25 Ω', 21, ink, 600, 'middle');
    wire(
        [
            [p2.x + 930, sy],
            [xG + 20, sy],
        ],
        C.GND
    );
    // ground rail
    const gy = sy + 215;
    wire(
        [
            [xG + 20, sy],
            [xG + 20, gy],
        ],
        C.GND
    );
    wire(
        [
            [p2.x + 90, gy],
            [xG + 20, gy],
        ],
        C.GND
    );
    wire(
        [
            [p2.x + 90, sy + 36],
            [p2.x + 90, gy],
        ],
        C.GND
    );
    wire(
        [
            [p2.x + 90, gy],
            [p2.x + 190, gy],
        ],
        C.GND
    );
    tag(p2.x + 140, gy + 34, 'GND', C.GND, 76, 30, 18);
    // C2 across the input
    wire(
        [
            [p2.x + 250, sy],
            [p2.x + 250, sy + 70],
        ],
        C.IN
    );
    circle(p2.x + 250, sy, 7, C.IN);
    line(p2.x + 222, sy + 70, p2.x + 278, sy + 70, ink, 4);
    line(p2.x + 222, sy + 90, p2.x + 278, sy + 90, ink, 4);
    wire(
        [
            [p2.x + 250, sy + 90],
            [p2.x + 250, gy],
        ],
        C.GND
    );
    circle(p2.x + 250, gy, 6, C.GND);
    txt(p2.x + 270 + 16, sy + 88, 'C2 3.3 pF', 20, ink, 700);
    txt(p2.x + 270 + 16, sy + 112, 'compensation', 17, muted, 500);
    // detector from M
    wire(
        [
            [xM, sy],
            [xM, sy + 52],
        ],
        C.M
    );
    path(`M${xM - 20},${sy + 52} L${xM + 20},${sy + 52} L${xM},${sy + 92} Z`, ink, 3, 'white');
    line(xM - 20, sy + 92, xM + 20, sy + 92, ink, 4);
    wire(
        [
            [xM, sy + 92],
            [xM, sy + 132],
        ],
        C.DET
    );
    circle(xM, sy + 132, 7, C.DET);
    txt(xM + 30, sy + 74, 'D1', 22, ink, 800);
    wire(
        [
            [xM, sy + 132],
            [xM + 130, sy + 132],
        ],
        C.DET
    );
    tag(xM + 130 + 40, sy + 132, 'TP1', C.DET, 66, 30, 18);
    wire(
        [
            [xM, sy + 132],
            [xM, sy + 150],
        ],
        C.DET
    );
    line(xM - 22, sy + 150, xM + 22, sy + 150, ink, 4);
    line(xM - 22, sy + 170, xM + 22, sy + 170, ink, 4);
    wire(
        [
            [xM, sy + 170],
            [xM, gy],
        ],
        C.GND
    );
    circle(xM, gy, 6, C.GND);
    txt(xM + 34, sy + 168, 'C1 10 nF', 21, ink, 700);
    wire(
        [
            [xM, gy],
            [xM + 130, gy],
        ],
        C.GND
    );
    tag(xM + 130 + 40, gy, 'TP2', C.GND, 66, 30, 18);
    txt(p2.x + 30, p2.y + p2.h - 30, `Power = (V + 0.3)² / 25 holds only if D1 drops ≈ 0.3 V at low current; the kit page's calculator assumes the kit's diode.`, 19, muted, 500);
    txt(p2.x + 30, p2.y + p2.h - 54, 'TP1/TP2 read the peak of the half-voltage tap, as on the PCB kit. C2 is optional but recommended (see §6).', 19, muted, 500);
}

// ================= panel 3: parts =================
const p3 = { x: 1230, y: 1220, w: 1140, h: 600 };
card(p3.x, p3.y, p3.w, p3.h, '3. PARTS', 'builder-sourced, no kit parts needed');
{
    const rows = [
        ['1', 'Stripboard, 0.1 in pitch, FR-4 preferred', `≥ ${layout.rows} strips × ${layout.cols} holes, strips along the long side`],
        ['8', 'R1–R8  100 Ω axial resistor, 5 % or better', 'flameproof metal-oxide, 3 W recommended; each takes ⅛ of the power (§7)'],
        ['1', 'D1  BAT46 Schottky diode', `100 V, DO-35. 1N5711 (70 V) also works; avoid 30 V parts (BAT43, BAT85)`],
        ['1', 'C1  10 nF ceramic', '≥ 50 V; the "103" disc in the kit'],
        ['1', 'C2  3.3 pF C0G/NP0 ceramic', '≥ 50 V; optional, recommended'],
        ['1', 'J1  BNC jack', 'panel or PCB type; solder lug + centre pin'],
        ['5', 'W1–W4 bare straps, W5 insulated wire', '0.6–1 mm; W5 about 30 mm long'],
        ['2', 'TP1, TP2 test pins or flying leads', 'for the multimeter'],
    ];
    let y = p3.y + 100;
    rows.forEach(([n, a, b]) => {
        txt(p3.x + 40, y, n, 25, ink, 800, 'middle');
        txt(p3.x + 80, y, a, 23, ink, 700);
        txt(p3.x + 80, y + 26, b, 19, muted, 500);
        y += 62;
    });
}

// ================= panel 4: build order =================
const p4 = { x: 30, y: 1850, w: 1180, h: 560 };
card(p4.x, p4.y, p4.w, p4.h, '4. BUILD ORDER');
{
    const steps = [
        [`Cut strip ${layout.cuts[0].row} between holes ${layout.cuts[0].after} and ${layout.cuts[0].after + 1}.`, 'Check with a meter: no continuity across the cut.'],
        ['Solder the four bare straps W1–W4 between strips 9 and 10.', 'Columns 4, 10, 16, 22.'],
        ['Solder R1–R8 flat on the board, leads straight down their holes.', 'Odd-numbered tops on strip 1, even on strip 2, as drawn; trim leads short.'],
        ['Solder C2 (col 13) and the two BNC wires (col 12).', 'Each wire ≤ 10 mm; run them side by side.'],
        ['Meter the divider before fitting the detector.', 'See §5. Fix any fault now.'],
        ['Fit D1 (band toward col 29), C1, W5, TP1, TP2.', 'W5 is insulated; keep it clear of the resistors.'],
        ['Repeat the checks in §5, then test at low power.', 'Start at 5 W; check heat after 30 s; stay inside §7.'],
    ];
    let y = p4.y + 100;
    steps.forEach(([a, b], i) => {
        circle(p4.x + 42, y - 8, 17, 'white', border, 2.5);
        txt(p4.x + 42, y, i + 1, 22, ink, 800, 'middle');
        txt(p4.x + 78, y, a, 23, ink, 700);
        txt(p4.x + 78, y + 26, b, 19, muted, 500);
        y += 63;
    });
}

// ================= panel 5: bench checks =================
const p5 = { x: 1230, y: 1850, w: 1140, h: 560 };
card(p5.x, p5.y, p5.w, p5.h, '5. BENCH CHECKS', 'multimeter, power off');
{
    const rows = [
        ['Strip 1 to strip 2  (IN to GND)', '47.5 – 52.5 Ω', 'with 5 % resistors'],
        ['Strip 1 to strip 9  (IN to M)', '23.8 – 26.3 Ω', 'four resistors in parallel'],
        ['Strip 9 to strip 2  (M to GND)', '23.8 – 26.3 Ω', 'four resistors in parallel'],
        ['Strip 9 to strip 10', '< 1 Ω', 'straps made'],
        ['Cut on strip 10, before D1 is fitted', 'no continuity', 'hole 26 to hole 27'],
        ['TP1 to TP2, no RF', 'open  (> 1 MΩ)', 'diode and C1 block DC'],
        ['Diode test, red on strip 9, black on TP1', '0.15 – 0.45 V', 'Schottky forward drop'],
    ];
    let y = p5.y + 100;
    rows.forEach(([a, b, c]) => {
        txt(p5.x + 30, y, a, 22, ink, 700);
        txt(p5.x + 30, y + 25, c, 18, muted, 500);
        txt(p5.x + p5.w - 30, y + 8, b, 25, C.M, 800, 'end');
        y += 62;
    });
}

// ================= panel 6: RF performance =================
const p6 = { x: 30, y: 2440, w: W - 60, h: 410 };
card(p6.x, p6.y, p6.w, p6.h, '6. EXPECTED RF PERFORMANCE — MODELED, NOT MEASURED', 'lumped model of this exact layout; trust it below about 60 MHz');
{
    const bands = [
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
    ];
    const mNom = buildRfModel(layout, NOMINAL),
        mPes = buildRfModel(layout, PESSIMISTIC),
        mNoC = buildRfModel(layout, { ...NOMINAL, C_C2: 0.0001 });
    const sw = (m, f) => swr(m.zin(f * 1e6)).toFixed(2);
    const x0 = p6.x + 40,
        colW = 150,
        y0 = p6.y + 110;
    txt(x0, y0, 'band', 22, muted, 700);
    txt(x0, y0 + 46, 'SWR, nominal', 22, ink, 700);
    txt(x0, y0 + 92, 'SWR, pessimistic', 22, ink, 700);
    txt(x0, y0 + 138, 'SWR, nominal, no C2', 22, muted, 600);
    bands.forEach(([n, f], i) => {
        const x = x0 + 270 + i * colW;
        txt(x, y0, n, 22, muted, 700, 'middle');
        txt(x, y0 + 46, sw(mNom, f), 26, C.M, 800, 'middle');
        txt(x, y0 + 92, sw(mPes, f), 26, '#b9472f', 800, 'middle');
        txt(x, y0 + 138, sw(mNoC, f), 24, muted, 600, 'middle');
    });
    [
        ['2 m', 0],
        ['70 cm', 1],
    ].forEach(([n, i]) => {
        const x = x0 + 270 + (bands.length + i) * colW;
        txt(x, y0, n, 22, muted, 700, 'middle');
        txt(x, y0 + 46, 'not claimed', 20, muted, 600, 'middle');
        txt(x, y0 + 92, 'not claimed', 20, muted, 600, 'middle');
    });
    const notes = ['Nominal: ordinary leaded resistors, BNC wires 10 mm. Pessimistic: +40 nH inside each resistor and 20 mm BNC wires — an invented bad case, not a bound.', '2 m and 70 cm are not claimed: above ~100 MHz this model leaves out too much. Measure before trusting the board there.', 'Everything here is a prediction until a NanoVNA sweep of a built board confirms it.'];
    notes.forEach((n, i) => txt(x0, y0 + 190 + i * 30, n, 20, i === 2 ? ink : muted, i === 2 ? 700 : 500));
}

// ================= panel 7: power limits =================
const p7 = { x: 30, y: 2880, w: W - 60, h: 340 };
card(p7.x, p7.y, p7.w, p7.h, '7. POWER LIMITS — RECOMMENDED, NOT YET THERMALLY TESTED', 'the limit follows the resistors you fit');
{
    const x0 = p7.x + 40,
        y0 = p7.y + 110;
    const col = [0, 440, 700];
    ['resistors fitted', 'continuous', 'short bursts'].forEach((h, i) => txt(x0 + col[i], y0, h, 22, muted, 700));
    const rows = [
        [3, ' (recommended)'],
        [2, ''],
    ];
    rows.forEach(([w, note], i) => {
        const l = limitsFor(w);
        const y = y0 + 50 + i * 50;
        txt(x0 + col[0], y, `${RESISTORS} × ${w} W${note}`, 25, ink, 700);
        txt(x0 + col[1], y, `${l.continuous} W`, 28, C.M, 800);
        txt(x0 + col[2], y, `${l.burst} W for up to ${RULES.burstSeconds} s, then rest ${RULES.restSeconds / 60} min`, 24, C.M, 700);
    });
    txt(x0 + col[0], y0 + 150, '1 W resistors or smaller', 25, ink, 700);
    txt(x0 + col[1], y0 + 150, 'not suitable', 24, '#b9472f', 700);
    const notes = [`Each resistor takes ⅛ of the power: ${RULES.hardCapWatts} W is ${RULES.hardCapWatts / RESISTORS} W per resistor.`, 'FT8 and other full-duty digital modes count as continuous.', `Never above ${RULES.hardCapWatts} W: D1 sees about ${Math.round(peakInverseVolts(RULES.hardCapWatts))} V peak inverse there (BAT46 is rated ${DIODES.BAT46.reverseVolts} V).`, 'Ventilate any enclosure and keep the load clear of plastic.', 'These are a design recommendation (2026-10-25), not a measured rating.'];
    notes.forEach((n, i) => txt(p7.x + 1330, y0 + i * 42, n, 21, i === 4 ? ink : muted, i === 4 ? 700 : 500, 'start'));
}

// ================= title =================
txt(W / 2, 62, '20W DUMMY LOAD • STRIPBOARD BUILD REFERENCE', 52, ink, 800, 'middle');
txt(W / 2, 108, 'DIY ALTERNATIVE TO THE K7RHY PCB KIT • SAME 50 Ω DIVIDER, SAME POWER-MEASURING TEST PADS', 24, ink, 700, 'middle');
txt(W - 30, 108, REV, 20, muted, 500, 'end');

const H = 3260;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title description">
<title id="title">20W dummy load stripboard build reference</title>
<desc id="description">Stripboard layout, circuit, parts, build order, bench checks, and modeled RF performance for a DIY version of the K7RHY 20W dummy load.</desc>
<rect width="${W}" height="${H}" fill="white"/><g font-family="Arial, Helvetica, sans-serif">
${entries.join('\n')}
</g></svg>
`;
const out = process.argv[2] ?? join(here, 'stripboard-sheet');
writeFileSync(`${out}.svg`, svg);
const drawing = verifySvg(`${out}.svg`);
if (drawing.failures.length) {
    console.error(`Drawing check failed (${drawing.failures.length}):`);
    drawing.failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
}
await sharp(Buffer.from(svg)).png().toFile(`${out}.png`);
console.log(`wrote ${out}.svg and ${out}.png (${checks} layout checks, drawing matches the netlist)`);
