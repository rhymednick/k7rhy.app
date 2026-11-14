import { copyFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { measuredOhms, operatingStates, pushPull, superSwitch } from './netlist.mjs';

// Circuit source: netlist.mjs and PRS26001-wiring-reference.md. Switch tables,
// operating states, and measured resistance are drawn from netlist.mjs, so the
// drawing cannot disagree with check-netlist.mjs.
// Contacts are shown by function rather than by physical lug position.
const here = dirname(fileURLToPath(import.meta.url));
const REV = '2.0';
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
const netColor = (n) => (n.endsWith('_SP') ? C.split : n.startsWith('B_') ? C.bridge : n.startsWith('N_') ? C.neck : n === 'BUS' ? C.bus : n === 'GND' || n === 'open' ? C.ground : C.route);
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
function humbucker(x, y, title, hot, link, splitNote) {
    txt(x, y + 22, title, 25, C.ink, 750);
    const bx = x,
        by = y + 44;
    rect(bx, by, 330, 170, '#2b2b2b', '#111', 14, 3);
    [
        { yy: by + 50, screw: false },
        { yy: by + 122, screw: true },
    ].forEach((r) => {
        rect(bx + 14, r.yy - 32, 302, 64, '#3a3a3a', '#555', 30, 1.5);
        for (let k = 0; k < 6; k++) {
            const cx = bx + 45 + 48 * k;
            circle(cx, r.yy, 13, '#cfd6da', '#7c8a93', 1.5);
            if (r.screw) line(cx - 8, r.yy, cx + 8, r.yy, '#5b6770', 3);
        }
    });
    txt(bx + 340, by + 56, 'SLUG', 17, C.muted, 700);
    txt(bx + 340, by + 128, 'SCREW', 17, C.muted, 700);
    txt(bx + 165, by + 196, '↓ BRIDGE SIDE ↓', 17, C.muted, 700, 'middle');

    const leads = [
        ['BLACK', 'slug start', '#111111', hot],
        ['WHITE', 'slug finish', '#c9d0d4', link],
        ['RED', 'screw finish', '#c0392b', link],
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
    line(bx + 902, by + 71, bx + 902, by + 115, netColor(link), 3);
    txt(bx + 912, by + 99, 'joined', 16, netColor(link), 700);
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

add(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title description"><title id="title">PRS26001 PRS SE Custom 24 Burled Ash wiring reference</title><desc id="description">Wiring reference for Seymour Duncan APH-1b and APH-1n humbuckers, a four-pole five-way super switch with 1.8 kΩ partial-split resistors, a push-pull tone bypass, master volume with a 180 pF treble bleed, five operating states with measured resistance, and common ground.</desc><rect width="${W}" height="${H}" fill="white"/><g font-family="Arial, Helvetica, sans-serif">`);
txt(1200, 54, 'PRS26001 PRS SE Custom 24 Burled Ash • WIRING REFERENCE', 45, C.ink, 800, 'middle');
txt(1200, 94, 'MATCH IDENTICAL BOXED NET LABELS • SWITCH CONTACTS SHOWN BY FUNCTION', 24, C.ink, 700, 'middle');
txt(2370, 38, `Rev ${REV} • 2026-11-13`, 19, C.muted, 450, 'end');

// 1. Pickups.
card(25, 120, 2350, 340, '1. PICKUPS', 'Seymour Duncan Alnico II Pro • screw coils toward the bridge');
humbucker(60, 175, 'BRIDGE • APH-1b', 'B_H', 'B_L', 'Partial split: B_L → 1.8 kΩ → GND (positions 2, 3)');
humbucker(1220, 175, 'NECK • APH-1n', 'N_H', 'N_L', 'Partial split: N_L → 1.8 kΩ → GND (positions 3, 4)');

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
const roles = { A: 'BRIDGE HOT', B: 'NECK HOT', C: 'BRIDGE SPLIT', D: 'NECK SPLIT' };
superSwitch.forEach((p, i) => {
    const y = top + headH + i * rowH;
    txt(133, y + 48, p.pole, 30, C.ink, 750, 'middle');
    txt(133, y + 75, roles[p.pole], 15, C.muted, 700, 'middle');
    p.throws.forEach((t, j) => contact(xs[j + 1] + 15, y + 34, t, 88));
    contact(1280, y + 34, p.common, 99);
});
txt(55, 1076, 'A and B select the pickup hots. C and D join a pickup’s series link to its split resistor; when open, the pickup stays a full humbucker.', 18, C.ink, 650);

// 3. Push-pull DPDT: tone bypass, drawn from netlist.mjs.
card(1525, 480, 850, 620, '3. PUSH-PULL DPDT • TONE BYPASS');
txt(1555, 560, 'DOWN = tone control active', 23, C.ink, 750);
txt(1555, 598, 'UP = tone capacitor lifted (full brightness)', 23, C.ink, 750);
const p = pushPull[0];
txt(1580, 662, `P • COMMON ${p.common}`, 23, C.route, 750);
rect(1555, 681, 380, 231, '#fbfdfe', C.border, 5, 1.5);
['DOWN', 'COMMON', 'UP'].forEach((s, k) => txt(1568, 729 + k * 77, s, 17, C.muted, 700));
contact(1690, 696, p.down, 92);
contact(1690, 773, p.common, 92);
contact(1690, 850, p.up, 92);
txt(1985, 662, 'Q • UNUSED', 23, C.muted, 750);
rect(1960, 681, 385, 231, '#fbfdfe', C.border, 5, 1.5);
txt(2152, 803, 'No connections', 20, C.muted, 650, 'middle');
txt(1555, 966, 'The push-pull changes no pickup connection.', 21, C.ink, 700);
txt(1555, 1004, 'Pulled up, the tone knob has no effect; pushing it', 19, C.muted, 600);
txt(1555, 1032, 'down restores the tone at the knob’s last setting.', 19, C.muted, 600);

// 4. Volume and treble bleed.
card(25, 1120, 760, 400, '4. MASTER VOLUME • 500K');
txt(55, 1195, 'LEFT / CW → BUS', 22, C.bus, 750);
txt(55, 1230, 'CENTER / WIPER → OUT', 22, C.out, 750);
txt(55, 1265, 'RIGHT / CCW → GND', 22, C.ground, 750);
pot(630, 1251, '500K', [
    ['BUS', C.bus],
    ['OUT', C.out],
    ['GND', C.ground],
]);
txt(55, 1330, 'TREBLE BLEED • across BUS and OUT', 20, C.ink, 750);
txt(55, 1364, 'BUS → 180 pF → OUT (no resistor)', 20, C.route, 700);
txt(55, 1464, 'REAR VIEW • shaft away • lugs down • clockwise = louder', 18, C.muted, 650);

// 5. Tone and jack.
card(805, 1120, 770, 400, '5. MASTER TONE 500K & JACK');
txt(835, 1195, 'LEFT / CW → unused', 22, C.ground, 700);
txt(835, 1230, 'CENTER / WIPER → 0.022 µF → TC_R', 22, C.route, 750);
txt(835, 1265, 'RIGHT / CCW → BUS', 22, C.bus, 750);
pot(1410, 1251, '500K', [
    ['OPEN', C.ground],
    ['CAP', C.route],
    ['BUS', C.bus],
]);
txt(835, 1330, 'TC_R → push-pull P (panel 3)', 20, C.ink, 650);
txt(835, 1390, 'Jack TIP ← OUT', 22, C.out, 750);
txt(835, 1424, 'Jack SLEEVE ← GND', 22, C.ground, 750);
txt(835, 1464, 'REAR VIEW • shaft away • lugs down • clockwise = brighter', 18, C.muted, 650);

// 6. Operating states with measured resistance.
card(1595, 1120, 780, 400, '6. OPERATING STATES');
const tx = [1620, 1690, 2190, 2350];
const ty = 1183,
    th = 48,
    rh = 49;
rect(1620, ty, 730, th + 5 * rh, C.white, C.border, 0, 1.5);
rect(1620, ty, 730, th, C.pale);
tx.slice(1, -1).forEach((x) => line(x, ty, x, ty + th + 5 * rh, C.border, 1.2));
for (let i = 0; i < 5; i++) line(1620, ty + th + (i + 1) * rh, 2350, ty + th + (i + 1) * rh, C.border, 1.2);
txt(1655, ty + 33, 'POS', 19, C.ink, 750, 'middle');
txt(1940, ty + 33, 'PICKUPS', 19, C.ink, 750, 'middle');
txt(2270, ty + 33, 'MEASURED', 19, C.ink, 750, 'middle');
const short = { 3: 'Both partial splits' };
operatingStates.forEach(([n, voice], i) => {
    const y = ty + th + 33 + i * rh;
    txt(1655, y, String(n), 20, C.ink, 700, 'middle');
    txt(1705, y, short[n] ?? voice, 20, C.ink, 550);
    txt(2270, y, `${(measuredOhms[n] / 1000).toFixed(measuredOhms[n] % 100 ? 2 : 1)} kΩ`, 20, C.ink, 550, 'middle');
});
txt(1623, 1500, 'Measured at the jack, volume full up • same with tone up or down', 16, C.muted, 650);

// 7. Split resistors and common ground.
card(25, 1540, 2350, 265, '7. SPLIT RESISTORS & COMMON GROUND');
txt(55, 1625, 'B_SP → 1.8 kΩ → GND   (bridge partial split, positions 2 and 3)', 22, C.split, 750);
txt(55, 1663, 'N_SP → 1.8 kΩ → GND   (neck partial split, positions 3 and 4)', 22, C.split, 750);
txt(55, 1715, 'GND = both green and bare leads • both split resistors • push-pull P down throw • volume CCW lug.', 21, C.ink, 700);
txt(55, 1753, 'Bond pot cases, switch frame, copper cavity shielding, bridge/string ground, and jack sleeve to GND.', 20, C.ink, 600);

add('</g></svg>');
const svg = e.join('\n') + '\n';
const base = join(here, `PRS26001-wiring-rev-${REV}`);
writeFileSync(`${base}.svg`, svg);
await sharp(Buffer.from(svg)).png().toFile(`${base}.png`);
copyFileSync(`${base}.png`, join(here, `../../../public/wiring-diagrams/PRS26001-wiring-rev-${REV}.png`));
console.log('Generated PRS26001 wiring reference SVG and PNG.');
