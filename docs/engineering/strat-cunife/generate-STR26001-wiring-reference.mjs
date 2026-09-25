import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Circuit source: STR26001-wiring-reference.md. As-built record; switches
// show contacts by function rather than by physical lug position.
const here = dirname(fileURLToPath(import.meta.url));
const W = 2400;
const H = 1810;
const C = {
    ink: '#25303b',
    muted: '#4c5b68',
    border: '#465c70',
    pale: '#eef7fb',
    bridge: '#b94a2e',
    middle: '#ad731b',
    neck: '#2373a2',
    bus: '#246c58',
    route: '#7950a4',
    out: '#187b80',
    ground: '#445464',
    white: '#ffffff',
};
const e = [];
const add = (s) => e.push(s);
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const rect = (x, y, w, h, fill = C.white, stroke = 'none', r = 0, sw = 2) => add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`);
const line = (x1, y1, x2, y2, color = C.border, sw = 2) => add(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`);
const circle = (x, y, r, fill, stroke = 'none', sw = 2) => add(`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`);
const txt = (x, y, s, size = 22, color = C.ink, weight = 500, anchor = 'start') => add(`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${esc(s)}</text>`);
function card(x, y, w, h, title, subtitle = '') {
    rect(x, y, w, h, C.white, C.border, 6, 2);
    rect(x + 2, y + 2, w - 4, 55, C.pale, 'none', 4);
    txt(x + 22, y + 40, title, 30, C.ink, 750);
    if (subtitle) txt(x + w - 20, y + 37, subtitle, 18, C.muted, 450, 'end');
}
function pill(x, y, label, color, w = 94, h = 43, size = 22) {
    rect(x, y, w, h, C.white, color, 5, 2.5);
    txt(x + w / 2, y + h / 2 + size * 0.34, label, size, color, 700, 'middle');
}
function contact(x, y, label, color, w = 98) {
    circle(x, y + 21, 8, color);
    line(x + 8, y + 21, x + 36, y + 21, color, 3);
    if (label === 'OPEN') txt(x + 47, y + 29, 'OPEN', 21, C.ground, 700);
    else pill(x + 42, y, label, color, w, 42, label.length >= 5 ? 18 : 22);
}
function ground(x, y) {
    line(x, y, x, y + 21, C.ground, 3);
    line(x - 18, y + 21, x + 18, y + 21, C.ground, 3);
    line(x - 12, y + 29, x + 12, y + 29, C.ground, 3);
    line(x - 6, y + 37, x + 6, y + 37, C.ground, 3);
}
function pickup(x, y, kind, hot, coilReturn, color, note) {
    txt(x, y + 20, kind, 24, C.ink, 750);
    rect(x, y + 44, 210, 91, '#e3e9eb', '#303b43', 27, 3);
    rect(x + 12, y + 56, 186, 67, '#f8faf9', '#8c9ca5', 21, 1.5);
    for (let i = 0; i < 6; i++) circle(x + 28 + 31 * i, y + 89, 9, '#cbd4d8', '#788994', 1.4);
    line(x + 210, y + 69, x + 241, y + 69, color, 4);
    pill(x + 241, y + 48, hot, color, 94, 43, 21);
    line(x + 210, y + 116, x + 241, y + 116, coilReturn === 'M_C' ? C.route : C.ground, 4);
    pill(x + 241, y + 95, coilReturn, coilReturn === 'M_C' ? C.route : C.ground, 94, 43, 21);
    txt(x, y + 174, note, 18, C.muted, 650);
}
function pot(x, y, label, lugs) {
    circle(x, y, 70, '#fbfdfe', C.ink, 2.5);
    txt(x, y - 2, label, 27, C.ink, 750, 'middle');
    txt(x, y + 27, 'REAR VIEW', 17, C.muted, 700, 'middle');
    [-52, 0, 52].forEach((offset, i) => {
        const lugX = x + offset;
        rect(lugX - 13, y + 70, 26, 61, '#d3b082', '#735c3f', 3, 1.5);
        line(lugX, y + 131, lugX, y + 143, lugs[i][1], 3);
        txt(lugX, y + 164, lugs[i][0], 17, lugs[i][1], 750, 'middle');
    });
}

add(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title description"><title id="title">STR26001 CuNiFe S-Type wiring reference</title><desc id="description">As-built wiring reference for three Fender CuNiFe single-coil pickups, a four-pole five-way super switch, DPDT parallel or series toggle, master volume and tone, treble bleed, ten operating states, and common ground.</desc><rect width="${W}" height="${H}" fill="white"/><g font-family="Arial, Helvetica, sans-serif">`);
txt(1200, 54, 'STR26001 CuNiFe S-Type • WIRING REFERENCE', 45, C.ink, 800, 'middle');
txt(1200, 94, 'AS BUILT • MATCH IDENTICAL BOXED NET LABELS • SWITCH CONTACTS SHOWN BY FUNCTION', 24, C.ink, 700, 'middle');
txt(2370, 38, 'Rev 1.1 • 2026-09-25', 19, C.muted, 450, 'end');

// 1. Pickups and isolated shield leads.
card(25, 120, 2350, 290, '1. PICKUPS', 'Fender CuNiFe Stratocaster SSS • labeled by electrical role');
pickup(65, 173, 'BRIDGE', 'B_H', 'B_C', C.bridge, 'B_C + shield lead → GND');
pickup(835, 173, 'MIDDLE', 'M_H', 'M_C', C.middle, 'M_C is switched; shield lead → GND');
pickup(1605, 173, 'NECK', 'N_H', 'N_C', C.neck, 'N_C + shield lead → GND');
txt(833, 389, 'MIDDLE SHIELD STAYS ON GND WHEN M_C IS SWITCHED', 19, C.route, 750);

// 2. Four independent selector poles. Every cell is an isolated throw.
card(25, 430, 1480, 650, '2. FOUR-POLE FIVE-WAY SUPER SWITCH', 'Common closes to one numbered throw per position');
const xs = [55, 211, 421, 631, 841, 1051, 1261, 1475];
const top = 510,
    headH = 64,
    rowH = 112;
rect(55, top, 1420, headH + 4 * rowH, C.white, C.border, 0, 1.5);
rect(55, top, 1420, headH, C.pale);
xs.slice(1, -1).forEach((x) => line(x, top, x, top + headH + 4 * rowH, C.border, 1.2));
for (let i = 1; i <= 4; i++) line(55, top + headH + i * rowH, 1475, top + headH + i * rowH, C.border, 1.2);
['POLE', '1', '2', '3', '4', '5', 'COMMON'].forEach((s, i) => txt((xs[i] + xs[i + 1]) / 2, 551, s, 24, C.ink, 750, 'middle'));
const rows = [
    {
        pole: 'A',
        role: 'SELECT',
        common: 'BUS',
        cc: C.bus,
        cells: [
            ['B_H', C.bridge],
            ['M_H', C.middle],
            ['M_H', C.middle],
            ['M_H', C.middle],
            ['N_H', C.neck],
        ],
    },
    {
        pole: 'B',
        role: 'OUTER',
        common: 'OR',
        cc: C.route,
        cells: [
            ['OPEN', C.ground],
            ['B_H', C.bridge],
            ['OPEN', C.ground],
            ['N_H', C.neck],
            ['OPEN', C.ground],
        ],
    },
    {
        pole: 'C',
        role: 'SERIES J',
        common: 'J',
        cc: C.route,
        cells: [
            ['OPEN', C.ground],
            ['B_H', C.bridge],
            ['OPEN', C.ground],
            ['N_H', C.neck],
            ['OPEN', C.ground],
        ],
    },
    {
        pole: 'D',
        role: 'M RETURN',
        common: 'M_C',
        cc: C.route,
        cells: [
            ['OPEN', C.ground],
            ['MR', C.route],
            ['GND', C.ground],
            ['MR', C.route],
            ['OPEN', C.ground],
        ],
    },
];
rows.forEach((r, i) => {
    const y = top + headH + i * rowH;
    txt(133, y + 48, r.pole, 30, C.ink, 750, 'middle');
    txt(133, y + 75, r.role, 16, C.muted, 700, 'middle');
    r.cells.forEach(([name, color], j) => contact(xs[j + 1] + 15, y + 34, name, color, 88));
    contact(1280, y + 34, r.common, r.cc, 99);
});
txt(55, 1051, 'Poles B and C carry the same selected outer hot but have separate commons; OR and J never join.', 18, C.ink, 650);

// 3. Independent DPDT poles and two connection rules.
card(1525, 430, 850, 650, '3. DPDT ON-ON • SERIES MODE');
txt(1555, 510, 'NORMAL = adjacent pairs parallel', 23, C.ink, 750);
txt(1555, 548, 'SERIES = adjacent pairs in series', 23, C.ink, 750);
txt(1580, 612, 'X • OUTER HOT', 23, C.bridge, 750);
txt(1985, 612, 'Y • MIDDLE RETURN', 23, C.route, 750);
rect(1555, 631, 380, 231, '#fbfdfe', C.border, 5, 1.5);
rect(1960, 631, 385, 231, '#fbfdfe', C.border, 5, 1.5);
['NORMAL', 'COMMON', 'SERIES'].forEach((s, i) => txt(1568, 679 + i * 77, s, 17, C.muted, 700));
['NORMAL', 'COMMON', 'SERIES'].forEach((s, i) => txt(1971, 679 + i * 77, s, 17, C.muted, 700));
contact(1690, 646, 'BUS', C.bus, 92);
contact(1690, 723, 'OR', C.route, 92);
contact(1690, 800, 'OPEN', C.ground);
contact(2091, 646, 'GND', C.ground, 92);
contact(2091, 723, 'MR', C.route, 92);
contact(2091, 800, 'J', C.route, 92);
txt(1555, 919, 'NORMAL: OR ↔ BUS; MR ↔ GND', 23, C.ink, 700);
txt(1555, 955, 'SERIES: OR open; MR ↔ J', 23, C.ink, 700);
txt(1555, 1014, 'In P2 / P4: BUS → M_H → M_C → B_H / N_H → GND', 20, C.route, 700);
txt(1555, 1050, 'P1, P3, P5 are unchanged in either mode.', 19, C.muted, 600);

// 4. Volume and treble bleed.
card(25, 1100, 760, 405, '4. MASTER VOLUME • A250K');
txt(55, 1175, 'LEFT / CW → BUS', 22, C.bus, 750);
txt(55, 1210, 'CENTER / WIPER → OUT', 22, C.out, 750);
txt(55, 1245, 'RIGHT / CCW → GND', 22, C.ground, 750);
pot(630, 1231, 'A250K', [
    ['BUS', C.bus],
    ['OUT', C.out],
    ['GND', C.ground],
]);
txt(55, 1302, 'TREBLE BLEED • across BUS and OUT', 20, C.ink, 750);
txt(55, 1341, 'BUS → (1,200 pF ∥ 150 kΩ) → TB_J', 20, C.route, 700);
txt(55, 1380, 'TB_J → 20 kΩ → OUT', 20, C.route, 700);
txt(55, 1449, 'REAR VIEW • shaft away • lugs down • clockwise = louder', 18, C.muted, 650);

// 5. Tone, cap and output jack.
card(805, 1100, 770, 405, '5. MASTER TONE & JACK');
txt(835, 1175, 'LEFT / CW → unused', 22, C.ground, 700);
txt(835, 1210, 'CENTER / WIPER → 22 nF → GND', 22, C.route, 750);
txt(835, 1245, 'RIGHT / CCW → BUS', 22, C.bus, 750);
pot(1410, 1231, 'A500K', [
    ['OPEN', C.ground],
    ['22 nF', C.route],
    ['BUS', C.bus],
]);
txt(835, 1317, 'BUS feeds tone in all positions', 20, C.ink, 650);
txt(835, 1349, 'and both modes.', 20, C.ink, 650);
txt(835, 1388, 'Jack TIP ← OUT', 22, C.out, 750);
txt(835, 1420, 'Jack SLEEVE ← GND', 22, C.ground, 750);
txt(835, 1449, 'REAR VIEW • shaft away • lugs down • clockwise = brighter', 18, C.muted, 650);

// 6. The required ten-state truth table.
card(1595, 1100, 780, 405, '6. OPERATING STATES');
const tx = [1620, 1700, 2027, 2350];
const ty = 1163,
    th = 48,
    rh = 49;
rect(1620, ty, 730, th + 5 * rh, C.white, C.border, 0, 1.5);
rect(1620, ty, 730, th, C.pale);
tx.slice(1, -1).forEach((x) => line(x, ty, x, ty + th + 5 * rh, C.border, 1.2));
for (let i = 0; i < 5; i++) line(1620, ty + th + (i + 1) * rh, 2350, ty + th + (i + 1) * rh, C.border, 1.2);
txt(1660, 1198, 'POS', 19, C.ink, 750, 'middle');
txt(1863, 1198, 'NORMAL', 19, C.ink, 750, 'middle');
txt(2189, 1198, 'SERIES', 19, C.ink, 750, 'middle');
const states = [
    ['1', 'Bridge', 'Bridge'],
    ['2', 'Bridge ∥ Middle', 'Middle — Bridge'],
    ['3', 'Middle', 'Middle'],
    ['4', 'Middle ∥ Neck', 'Middle — Neck'],
    ['5', 'Neck', 'Neck'],
];
states.forEach((r, i) => {
    const y = 1242 + i * rh;
    txt(1660, y, r[0], 20, C.ink, 700, 'middle');
    txt(1717, y, r[1], 20, C.ink, 550);
    txt(2042, y, r[2], 20, C.ink, 550);
});
txt(1623, 1481, '∥ = parallel     — = series', 17, C.muted, 650);

// 7. Common ground.
card(25, 1525, 2350, 260, '7. COMMON GROUND');
txt(55, 1609, 'GND = B_C + N_C + all three pickup shield leads • volume CCW lug • selector D3 • DPDT Y normal throw • tone cap return.', 22, C.ink, 700);
txt(55, 1650, 'Pot cases, conductive switch chassis, cavity shield, bridge/string ground, and jack sleeve are bonded to GND.', 21, C.ink, 600);
txt(55, 1701, 'Pickup leads follow the Fender CuNiFe pickup-set diagram. Wire colors and switch lug positions are not drawn.', 21, C.ink, 600);
txt(55, 1743, 'M_C reaches GND only through selector D3 or the DPDT normal throw; it has no other ground connection.', 21, C.route, 700);

add('</g></svg>');
const svg = e.join('\n') + '\n';
writeFileSync(join(here, 'STR26001-wiring-rev-1.1.svg'), svg);
await sharp(Buffer.from(svg)).png().toFile(join(here, 'STR26001-wiring-rev-1.1.png'));
console.log('Generated STR26001 wiring reference SVG and PNG.');
