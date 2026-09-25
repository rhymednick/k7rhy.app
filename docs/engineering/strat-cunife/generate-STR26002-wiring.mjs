import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Circuit source: STR26002-wiring.md. As-built record; switches show contacts
// by function rather than by physical lug position.
const here = dirname(fileURLToPath(import.meta.url));
const W = 2400;
const H = 1830;
const c = { ink: '#25303b', muted: '#4c5b68', border: '#465c70', pale: '#eef7fb', bridge: '#b94a2e', middle: '#ae731b', neck: '#2373a2', bus: '#246c58', output: '#187b80', ground: '#445464', tone: '#7950a4' };
const out = [];
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const add = (s) => out.push(s);
const rect = (x, y, w, h, fill = 'white', stroke = 'none', r = 0, sw = 2) => add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`);
const line = (x1, y1, x2, y2, color = c.border, sw = 2) => add(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`);
const circle = (x, y, r, fill, stroke = 'none', sw = 2) => add(`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`);
const txt = (x, y, s, size = 23, color = c.ink, weight = 500, anchor = 'start') => add(`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${esc(s)}</text>`);
function card(x, y, w, h, title, subtitle = '') {
    rect(x, y, w, h, 'white', c.border, 6, 2);
    rect(x + 2, y + 2, w - 4, 54, c.pale, 'none', 4);
    txt(x + 22, y + 39, title, 30, c.ink, 750);
    if (subtitle) txt(x + w - 20, y + 37, subtitle, 18, c.muted, 400, 'end');
}
function pill(x, y, label, color, w = 110, h = 44, size = 22) {
    rect(x, y, w, h, 'white', color, 5, 2.5);
    txt(x + w / 2, y + h / 2 + size * 0.34, label, size, color, 700, 'middle');
}
function contact(x, y, label, color, w = 100) {
    circle(x, y + 22, 8, color);
    line(x + 8, y + 22, x + 35, y + 22, color, 3);
    if (label === 'OPEN') txt(x + 48, y + 30, 'OPEN', 22, c.ground, 700);
    else pill(x + 42, y, label, color, w, 44, label.length > 7 ? 18 : 22);
}
function ground(x, y) {
    line(x, y, x, y + 23, c.ground, 3);
    line(x - 18, y + 23, x + 18, y + 23, c.ground, 3);
    line(x - 12, y + 31, x + 12, y + 31, c.ground, 3);
    line(x - 6, y + 39, x + 6, y + 39, c.ground, 3);
}
function pickup(x, name, hot, color) {
    txt(x, 194, name, 24, c.ink, 700);
    rect(x, 213, 222, 91, '#f1f3f2', '#2d3940', 40, 3);
    for (let i = 0; i < 6; i++) circle(x + 24 + i * 35, 258, 9, '#8e9da4', '#4c5b63', 1.5);
    line(x + 222, 248, x + 253, 248, color, 4);
    pill(x + 253, 226, hot, color, 92, 44, 22);
    ground(x + 153, 303);
    txt(x, 380, 'COIL RETURN + SHIELD LEAD → GND', 18, c.muted, 650);
}
function pot(x, y, main, sub, lugs) {
    circle(x, y, 82, '#fbfdfe', c.ink, 2.5);
    txt(x, y - 2, main, 27, c.ink, 750, 'middle');
    txt(x, y + 30, sub, 18, c.muted, 700, 'middle');
    [x - 60, x, x + 60].forEach((lx, i) => {
        rect(lx - 14, y + 82, 28, 72, '#d3b082', '#735c3f', 3, 1.5);
        line(lx, y + 154, lx, y + 172, lugs[i].color, 3);
        txt(lx, y + 194, lugs[i].label, 19, lugs[i].color, 700, 'middle');
    });
}

add(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title description"><title id="title">STR26002 CuNiFe S-Type wiring reference</title><desc id="description">As-built wiring reference with Fender CuNiFe Stratocaster pickup roles, standard five-way contact map, neck-add SPST, rear-view volume and tone pots, treble-bleed topology, ten operating states, and common ground.</desc><rect width="${W}" height="${H}" fill="white"/><g font-family="Arial, Helvetica, sans-serif">`);
txt(1200, 56, 'STR26002 CuNiFe S-Type • WIRING REFERENCE', 45, c.ink, 800, 'middle');
txt(1200, 96, 'AS BUILT • MATCH IDENTICAL BOXED NET LABELS • SWITCH CONTACTS SHOWN BY FUNCTION', 24, c.ink, 700, 'middle');
txt(2370, 37, 'Rev 1.1 • 2026-09-25', 19, c.muted, 400, 'end');

card(25, 120, 2350, 284, '1. FENDER CUNIFE STRATOCASTER PICKUPS', 'Labeled by electrical role');
pickup(65, 'BRIDGE', 'B-H', c.bridge);
pickup(835, 'MIDDLE', 'M-H', c.middle);
pickup(1605, 'NECK', 'N-H', c.neck);

card(25, 424, 1170, 614, '2. STANDARD FIVE-WAY PICKUP POLE', 'Adjacent throws overlap in positions 2 and 4');
const sx = [55, 190, 350, 510, 670, 830, 990, 1164];
rect(55, 499, 1109, 438, '#fbfdfe', c.border, 0, 1.4);
rect(55, 499, 1109, 65, c.pale);
for (const x of sx.slice(1, -1)) line(x, 499, x, 937, c.border, 1.2);
for (const y of [564, 688, 812]) line(55, y, 1164, y, c.border, 1.2);
['THROW', 'POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'COMMON'].forEach((v, i) => txt((sx[i] + sx[i + 1]) / 2, 540, v, 23, c.ink, 750, 'middle'));
[
    ['1', 'B-H', c.bridge, 594],
    ['2', 'M-H', c.middle, 718],
    ['3', 'N-H', c.neck, 842],
].forEach(([n, label, color, y]) => {
    txt(129, y + 44, n, 29, c.ink, 750, 'middle');
    for (let pos = 1; pos <= 5; pos++) {
        const active = (n === '1' && pos <= 2) || (n === '2' && pos >= 2 && pos <= 4) || (n === '3' && pos >= 4);
        contact(198 + (pos - 1) * 160, y + 13, active ? label : 'OPEN', active ? color : c.ground, 84);
    }
    contact(998, y + 13, 'BUS', c.bus, 89);
});
txt(55, 977, 'Rows are the blade throws; columns are the five selector positions.', 21, c.ink, 650);
txt(55, 1009, 'One pole supplies BUS. The second pole of the standard five-way is unused.', 20, c.muted, 500);

card(1215, 424, 1160, 614, '3. NECK-ADD • SPST ON/OFF');
txt(1245, 507, 'OFF: five-way selections remain conventional.', 24, c.ink, 700);
txt(1245, 548, 'ON: neck hot joins BUS in parallel.', 24, c.ink, 700);
rect(1245, 587, 1098, 250, '#fbfdfe', c.border, 5, 1.5);
txt(1273, 646, 'OFF', 23, c.ink, 750);
txt(1273, 765, 'ON', 23, c.ink, 750);
contact(1390, 606, 'N-H', c.neck, 98);
line(1580, 628, 1650, 628, c.ground, 3);
txt(1674, 636, 'OPEN → neck stays on blade throw 3 only', 21, c.muted, 600);
contact(1390, 725, 'N-H', c.neck, 98);
line(1578, 747, 1653, 747, c.neck, 3);
pill(1655, 724, 'BUS', c.bus, 108, 45, 23);
txt(1795, 754, 'CLOSED', 22, c.ink, 700);
txt(1245, 889, 'SPST common → BUS; other terminal → N-H.', 22, c.ink, 700);
txt(1245, 928, 'In positions 4 and 5, ON adds no new pickup.', 21, c.ink, 650);

card(25, 1058, 760, 434, '4. MASTER VOLUME • A250K AUDIO');
txt(55, 1130, 'LEFT / CW → BUS', 23, c.bus, 750);
txt(55, 1171, 'CENTER / WIPER → OUT', 23, c.output, 750);
txt(55, 1212, 'RIGHT / CCW → GND', 23, c.ground, 750);
txt(55, 1280, 'TREBLE BLEED • across BUS and OUT', 20, c.ink, 750);
txt(55, 1314, 'BUS → (1,200 pF ∥ 150 kΩ) → TB-J', 20, c.tone, 700);
txt(55, 1348, 'TB-J → 20 kΩ → OUT', 20, c.tone, 700);
pot(630, 1195, 'A250K', 'VOLUME', [
    { label: 'BUS', color: c.bus },
    { label: 'OUT', color: c.output },
    { label: 'GND', color: c.ground },
]);
txt(55, 1421, 'REAR VIEW • shaft away • lugs down', 18, c.muted, 700);
txt(55, 1455, 'Clockwise = louder. Jack TIP ← OUT.', 20, c.ink, 650);

card(805, 1058, 770, 434, '5. MASTER TONE • A500K AUDIO');
txt(835, 1130, 'LEFT / CW → OPEN', 23, c.ground, 750);
txt(835, 1171, 'CENTER / WIPER → T-W → 22 nF → GND', 21, c.tone, 750);
txt(835, 1212, 'RIGHT / CCW → BUS', 23, c.bus, 750);
txt(835, 1280, 'Tone cap: 0.022 µF, non-polarized.', 21, c.ink, 700);
txt(835, 1314, 'BUS feed works in every selector/switch state.', 19, c.ink, 650);
pot(1420, 1195, 'A500K', 'TONE', [
    { label: 'OPEN', color: c.ground },
    { label: 'T-W', color: c.tone },
    { label: 'BUS', color: c.bus },
]);
txt(835, 1421, 'REAR VIEW • shaft away • lugs down', 18, c.muted, 700);
txt(835, 1455, 'Clockwise = brighter. Jack SLEEVE ← GND.', 20, c.ink, 650);

card(1595, 1058, 780, 434, '6. OPERATING STATES');
const tx = [1620, 1710, 2030, 2350];
rect(1620, 1133, 730, 318, 'white', c.border, 0, 1.5);
rect(1620, 1133, 730, 54, c.pale);
for (const x of tx.slice(1, -1)) line(x, 1133, x, 1451, c.border, 1.2);
for (let i = 0; i < 4; i++) line(1620, 1187 + 53 * (i + 1), 2350, 1187 + 53 * (i + 1), c.border, 1.1);
txt(1665, 1168, 'POS', 20, c.ink, 750, 'middle');
txt(1870, 1168, 'NECK-ADD OFF', 19, c.ink, 750, 'middle');
txt(2190, 1168, 'NECK-ADD ON', 19, c.ink, 750, 'middle');
[
    ['1', 'Bridge', 'Bridge ∥ Neck'],
    ['2', 'Bridge ∥ Middle', 'Bridge ∥ Middle ∥ Neck'],
    ['3', 'Middle', 'Middle ∥ Neck'],
    ['4', 'Middle ∥ Neck', 'Middle ∥ Neck'],
    ['5', 'Neck', 'Neck'],
].forEach(([pos, off, on], i) => {
    const y = 1223 + i * 53;
    txt(1665, y, pos, 21, c.ink, 700, 'middle');
    txt(1724, y, off, 19, c.ink, 500);
    txt(2045, y, on, 18, c.ink, 500);
});

card(25, 1512, 2350, 288, '7. COMMON GROUND');
txt(55, 1592, 'GND = all coil returns + shield leads • volume CCW lug • 22 nF tone return • output jack sleeve.', 22, c.ink, 700);
txt(55, 1631, 'Both pot cases, conductive switch chassis, cavity shielding, and bridge/string ground are bonded to the same ground network.', 21, c.ink, 600);
txt(55, 1685, 'Pickup leads follow the Fender CuNiFe pickup-set diagram. Wire colors and switch lug positions are not drawn.', 21, c.ink, 600);
txt(55, 1724, 'Every coil return stays on GND in all ten states. Neck-add changes positions 1–3 only.', 21, c.ink, 600);
add('</g></svg>');

const svg = out.join('\n') + '\n';
writeFileSync(join(here, 'STR26002-wiring-rev-1.1.svg'), svg);
await sharp(Buffer.from(svg)).png().toFile(join(here, 'STR26002-wiring-rev-1.1.png'));
console.log('Generated STR26002 wiring reference SVG and PNG.');
