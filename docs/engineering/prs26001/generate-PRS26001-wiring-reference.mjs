import { copyFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { pushPull, superSwitch } from './netlist.mjs';

// Circuit source: netlist.mjs and PRS26001-wiring-reference.md. Switch tables are
// drawn from netlist.mjs, so the drawing cannot disagree with check-netlist.mjs.
// Contacts are shown by function rather than by physical lug position.
const here = dirname(fileURLToPath(import.meta.url));
const REV = '1.0';
const W = 2400;
const H = 1830;
const C = {
    ink: '#25303b',
    muted: '#4c5b68',
    border: '#465c70',
    pale: '#eef7fb',
    bridge: '#b94a2e',
    neck: '#2373a2',
    bus: '#246c58',
    route: '#7950a4',
    split: '#a8661a',
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
const netColor = (n) => (n.startsWith('B_') && n !== 'B_SP' ? C.bridge : n.startsWith('N_') && n !== 'N_SP' ? C.neck : n.endsWith('_SP') ? C.split : n === 'BUS' ? C.bus : n === 'GND' || n === 'open' ? C.ground : C.route);
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
function contact(x, y, label, w = 98) {
    const color = netColor(label);
    circle(x, y + 21, 8, color);
    line(x + 8, y + 21, x + 36, y + 21, color, 3);
    if (label === 'open') txt(x + 47, y + 29, 'OPEN', 21, C.ground, 700);
    else pill(x + 42, y, label, color, w, 42, label.length >= 4 ? 19 : 22);
}
function humbucker(x, y, title, insideRow, net, splitNote) {
    txt(x, y + 22, title, 25, C.ink, 750);
    const bx = x,
        by = y + 44;
    rect(bx, by, 330, 170, '#2b2b2b', '#111', 14, 3);
    const rows = [
        { label: 'SLUG • NORTH', yy: by + 50, screw: false },
        { label: 'SCREW • SOUTH', yy: by + 122, screw: true },
    ];
    rows.forEach((r, i) => {
        const inside = i === insideRow;
        rect(bx + 14, r.yy - 32, 302, 64, '#3a3a3a', inside ? '#f2c14e' : '#555', 30, inside ? 4 : 1.5);
        for (let k = 0; k < 6; k++) {
            const cx = bx + 45 + 48 * k;
            circle(cx, r.yy, 13, '#cfd6da', '#7c8a93', 1.5);
            if (r.screw) line(cx - 8, r.yy, cx + 8, r.yy, '#5b6770', 3);
        }
    });
    txt(bx + 340, by + 56, 'SLUG', 17, C.muted, 700);
    txt(bx + 340, by + 128, 'SCREW', 17, C.muted, 700);
    txt(bx + 165, by + 196, '↓ BRIDGE SIDE ↓', 17, C.muted, 700, 'middle');
    txt(bx, by + 228, `INSIDE COIL = ${insideRow === 0 ? 'SLUG' : 'SCREW'} (gold outline)`, 18, '#9a7414', 750);

    const leads = [
        ['BLACK', 'slug start', '#111111', 'BUS'],
        ['WHITE', 'slug finish', '#c9d0d4', net.w],
        ['RED', 'screw finish', '#c0392b', net.r],
        ['GREEN + BARE', 'screw start', '#2e8b57', 'GND'],
    ];
    leads.forEach(([color, role, swatch, n], i) => {
        const ly = by + 6 + i * 44;
        line(bx + 410, ly + 21, bx + 470, ly + 21, swatch, 6);
        txt(bx + 482, ly + 28, color, 20, C.ink, 750);
        txt(bx + 482 + (color.length > 6 ? 160 : 90), ly + 28, role, 18, C.muted, 550);
        line(bx + 762, ly + 21, bx + 785, ly + 21, netColor(n), 3);
        pill(bx + 785, ly, n, netColor(n), 98, 42, 21);
    });
    txt(bx + 410, by + 210, splitNote, 19, C.split, 750);
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

add(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title description"><title id="title">PRS26001 PRS SE Custom 24 Burled Ash wiring reference</title><desc id="description">Functional wiring reference for Seymour Duncan APH-1b and APH-1n humbuckers, a four-pole five-way super switch with partial-split resistors, a push-pull DPDT series or parallel switch on the master tone, master volume, ten operating states, and common ground.</desc><rect width="${W}" height="${H}" fill="white"/><g font-family="Arial, Helvetica, sans-serif">`);
txt(1200, 54, 'PRS26001 PRS SE Custom 24 Burled Ash • WIRING REFERENCE', 45, C.ink, 800, 'middle');
txt(1200, 94, 'MATCH IDENTICAL BOXED NET LABELS • SWITCH CONTACTS SHOWN BY FUNCTION', 24, C.ink, 700, 'middle');
txt(2370, 38, `Rev ${REV} • 2026-11-13`, 19, C.muted, 450, 'end');

// 1. Pickups.
card(25, 120, 2350, 340, '1. PICKUPS', 'Seymour Duncan Alnico II Pro • screw coils toward the bridge');
humbucker(60, 175, 'BRIDGE • APH-1b', 0, { w: 'B_W', r: 'B_R' }, 'Split keeps the slug coil: link → 1.8 kΩ → GND');
humbucker(1220, 175, 'NECK • APH-1n', 1, { w: 'N_W', r: 'N_R' }, 'Split keeps the screw coil: link → 1.8 kΩ → BUS');

// 2. Super switch, drawn from netlist.mjs.
card(25, 480, 1480, 620, '2. FOUR-POLE FIVE-WAY SUPER SWITCH', 'Common closes to one numbered throw per position');
const xs = [55, 211, 421, 631, 841, 1051, 1261, 1475];
const top = 560,
    headH = 64,
    rowH = 104;
rect(55, top, 1420, headH + 4 * rowH, C.white, C.border, 0, 1.5);
rect(55, top, 1420, headH, C.pale);
xs.slice(1, -1).forEach((x) => line(x, top, x, top + headH + 4 * rowH, C.border, 1.2));
for (let i = 1; i <= 4; i++) line(55, top + headH + i * rowH, 1475, top + headH + i * rowH, C.border, 1.2);
['POLE', '1', '2', '3', '4', '5', 'COMMON'].forEach((s, i) => txt((xs[i] + xs[i + 1]) / 2, top + 41, s, 24, C.ink, 750, 'middle'));
const roles = { A: 'BRIDGE WHITE', B: 'BRIDGE RED', C: 'NECK WHITE', D: 'NECK RED' };
superSwitch.forEach((p, i) => {
    const y = top + headH + i * rowH;
    txt(133, y + 48, p.pole, 30, C.ink, 750, 'middle');
    txt(133, y + 75, roles[p.pole], 15, C.muted, 700, 'middle');
    p.throws.forEach((t, j) => contact(xs[j + 1] + 15, y + 34, t, 88));
    contact(1280, y + 34, p.common, 99);
});
txt(55, 1076, 'X and Y carry the selected pickups’ white and red leads to the push-pull. B_SP and N_SP join a pickup’s white and red at its split resistor.', 18, C.ink, 650);

// 3. Push-pull DPDT, drawn from netlist.mjs.
card(1525, 480, 850, 620, '3. PUSH-PULL DPDT • MASTER TONE');
txt(1555, 560, 'DOWN = humbucker coils in series', 23, C.ink, 750);
txt(1555, 598, 'UP = humbucker coils in parallel', 23, C.ink, 750);
const ppX = [1555, 1960];
pushPull.forEach((p, i) => {
    const x = ppX[i];
    txt(x + 25, 662, `${p.pole} • COMMON ${p.common}`, 23, C.route, 750);
    rect(x, 681, i ? 385 : 380, 231, '#fbfdfe', C.border, 5, 1.5);
    ['DOWN', 'COMMON', 'UP'].forEach((s, k) => txt(x + 13, 729 + k * 77, s, 17, C.muted, 700));
    contact(x + 135, 696, p.down, 92);
    contact(x + 135, 773, p.common, 92);
    contact(x + 135, 850, p.up, 92);
});
txt(1555, 966, 'DOWN: X ↔ Y joins each selected white to its red', 21, C.ink, 700);
txt(1555, 1002, 'UP: X → GND, Y → BUS', 21, C.ink, 700);
txt(1555, 1040, 'Positions 2 and 4 do not use X or Y,', 19, C.muted, 600);
txt(1555, 1072, 'so the push-pull leaves them unchanged.', 19, C.muted, 600);

// 4. Volume.
card(25, 1120, 760, 400, '4. MASTER VOLUME • 500K');
txt(55, 1195, 'LEFT / CW → BUS', 22, C.bus, 750);
txt(55, 1230, 'CENTER / WIPER → OUT', 22, C.out, 750);
txt(55, 1265, 'RIGHT / CCW → GND', 22, C.ground, 750);
pot(630, 1251, '500K', [
    ['BUS', C.bus],
    ['OUT', C.out],
    ['GND', C.ground],
]);
txt(55, 1330, 'BUS also feeds the tone control', 20, C.ink, 650);
txt(55, 1362, 'in every position and mode.', 20, C.ink, 650);
txt(55, 1464, 'REAR VIEW • shaft away • lugs down • clockwise = louder', 18, C.muted, 650);

// 5. Tone and jack.
card(805, 1120, 770, 400, '5. MASTER TONE 500K & JACK');
txt(835, 1195, 'LEFT / CW → unused', 22, C.ground, 700);
txt(835, 1230, 'CENTER / WIPER → 0.022 µF → GND', 22, C.route, 750);
txt(835, 1265, 'RIGHT / CCW → BUS', 22, C.bus, 750);
pot(1410, 1251, '500K', [
    ['OPEN', C.ground],
    ['CAP', C.route],
    ['BUS', C.bus],
]);
txt(835, 1330, 'Push-pull switch: see panel 3.', 20, C.ink, 650);
txt(835, 1390, 'Jack TIP ← OUT', 22, C.out, 750);
txt(835, 1424, 'Jack SLEEVE ← GND', 22, C.ground, 750);
txt(835, 1464, 'REAR VIEW • shaft away • lugs down • clockwise = brighter', 18, C.muted, 650);

// 6. Ten operating states.
card(1595, 1120, 780, 400, '6. OPERATING STATES');
const tx = [1620, 1700, 2025, 2350];
const ty = 1183,
    th = 48,
    rh = 49;
rect(1620, ty, 730, th + 5 * rh, C.white, C.border, 0, 1.5);
rect(1620, ty, 730, th, C.pale);
tx.slice(1, -1).forEach((x) => line(x, ty, x, ty + th + 5 * rh, C.border, 1.2));
for (let i = 0; i < 5; i++) line(1620, ty + th + (i + 1) * rh, 2350, ty + th + (i + 1) * rh, C.border, 1.2);
txt(1660, ty + 33, 'POS', 19, C.ink, 750, 'middle');
txt(1862, ty + 33, 'TONE DOWN', 19, C.ink, 750, 'middle');
txt(2187, ty + 33, 'TONE UP', 19, C.ink, 750, 'middle');
const states = [
    ['1', 'Bridge HB • series', 'Bridge HB • parallel'],
    ['2', 'Inside coils • split', 'Inside coils • split'],
    ['3', 'Both HBs • series', 'Both HBs • parallel'],
    ['4', 'Neck screw • split', 'Neck screw • split'],
    ['5', 'Neck HB • series', 'Neck HB • parallel'],
];
states.forEach((r, i) => {
    const y = ty + th + 33 + i * rh;
    txt(1660, y, r[0], 20, C.ink, 700, 'middle');
    txt(1715, y, r[1], 20, C.ink, 550);
    txt(2040, y, r[2], 20, C.ink, 550);
});
txt(1623, 1500, 'Inside coils = bridge slug + neck screw • split = partial, 1.8 kΩ', 16, C.muted, 650);

// 7. Split resistors and common ground.
card(25, 1540, 2350, 265, '7. SPLIT RESISTORS & COMMON GROUND');
txt(55, 1625, 'B_SP → 1.8 kΩ → GND   (bridge: shunts the screw coil in position 2)', 22, C.split, 750);
txt(55, 1663, 'N_SP → 1.8 kΩ → BUS   (neck: shunts the slug coil in positions 2 and 4)', 22, C.split, 750);
txt(55, 1715, 'GND = both green and bare leads • DPDT P up throw • bridge split resistor • volume CCW lug • tone capacitor return.', 21, C.ink, 700);
txt(55, 1753, 'Bond pot cases, switch frame, bridge/string ground, and jack sleeve to GND. Both black leads stay on BUS.', 20, C.ink, 600);

add('</g></svg>');
const svg = e.join('\n') + '\n';
const base = join(here, `PRS26001-wiring-rev-${REV}`);
writeFileSync(`${base}.svg`, svg);
await sharp(Buffer.from(svg)).png().toFile(`${base}.png`);
copyFileSync(`${base}.png`, join(here, `../../../public/wiring-diagrams/PRS26001-wiring-rev-${REV}.png`));
console.log('Generated PRS26001 wiring reference SVG and PNG.');
