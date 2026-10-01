import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Circuit source: ../relay-velvet-reference.md. Layout follows the approved STR26002 and Relay Arc
// references; switches show contacts by function rather than by physical lug position.
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../../..');
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
// Open humbucker (two black bobbins) or covered Filtertron-style pickup (chrome cover, two screw rows).
function pickup(x, name, model, hot, color, covered = false) {
    txt(x, 194, `${name} • ${model}`, 24, c.ink, 700);
    if (covered) {
        rect(x, 211, 232, 96, '#e4e9ec', '#2d3940', 14, 3);
        for (const y of [238, 280]) for (let i = 0; i < 6; i++) circle(x + 30 + i * 34, y, 8, '#b7c2c8', '#4c5b63', 1.5);
    } else {
        rect(x, 211, 232, 96, '#2d3940', '#1f282e', 10, 3);
        for (const y of [221, 263]) {
            rect(x + 8, y, 216, 34, '#3b4850', '#1f282e', 14, 1.5);
            for (let i = 0; i < 6; i++) circle(x + 30 + i * 34, y + 17, 8, '#e8ecee', '#1f282e', 1.5);
        }
    }
    line(x + 232, 240, x + 263, 240, color, 4);
    pill(x + 263, 218, hot, color, 92, 44, 22);
    ground(x + 116, 307);
    txt(x, 380, 'RETURN + SHIELD/CASE → GND', 18, c.muted, 650);
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

add(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title description"><title id="title">Relay Velvet wiring reference</title><desc id="description">Base-harness wiring reference with Alnico II bridge and neck humbuckers, a Retrotron Nashville middle pickup, a standard five-way contact map, an unused tone push-pull, rear-view A500K volume and tone pots, five operating states, and common ground.</desc><rect width="${W}" height="${H}" fill="white"/><g font-family="Arial, Helvetica, sans-serif">`);
txt(1200, 56, 'RELAY VELVET • WIRING REFERENCE', 45, c.ink, 800, 'middle');
txt(1200, 96, 'BASE HARNESS • MATCH IDENTICAL BOXED NET LABELS • FUNCTIONAL SWITCH CONTACTS MUST BE METERED', 24, c.ink, 700, 'middle');
txt(2370, 37, 'Rev 1.0 • 2026-10-01', 19, c.muted, 400, 'end');

card(25, 120, 2350, 284, '1. PICKUPS', 'Use supplied lead guides and a meter; labels show electrical roles, not wire colors');
pickup(65, 'BRIDGE', 'GFS Pro Series Alnico II', 'B-H', c.bridge);
pickup(835, 'MIDDLE', 'GFS Retrotron Nashville', 'M-H', c.middle, true);
pickup(1605, 'NECK', 'GFS Pro Series Alnico II', 'N-H', c.neck);

card(25, 424, 1170, 614, '2. STANDARD FIVE-WAY PICKUP POLE', 'Functional contact map • verify by continuity');
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
txt(55, 977, 'Rows are the blade throws; columns are the five positions. Adjacent throws overlap in positions 2 and 4.', 21, c.ink, 650);
txt(55, 1009, 'One pole supplies BUS. The second pole of the standard five-way is unused.', 20, c.muted, 500);

card(1215, 424, 1160, 614, '3. TONE PUSH-PULL • NOT USED', 'Functional contact map • verify by continuity');
txt(1245, 507, 'The tone pot works as a standard tone control.', 24, c.ink, 700);
txt(1245, 548, 'Its push-pull switch is reserved for a future focus contour.', 24, c.ink, 700);
rect(1245, 587, 1098, 250, '#fbfdfe', c.border, 5, 1.5);
txt(1273, 627, 'POLE A', 21, c.ink, 750);
txt(1810, 627, 'POLE B', 21, c.ink, 750);
['A1', 'A2', 'A3'].forEach((l, i) => {
    contact(1290, 650 + i * 58, l, c.ground, 70);
    txt(1430, 680 + i * 58, 'OPEN', 22, c.ground, 700);
});
['B1', 'B2', 'B3'].forEach((l, i) => {
    contact(1827, 650 + i * 58, l, c.ground, 70);
    txt(1967, 680 + i * 58, 'OPEN', 22, c.ground, 700);
});
txt(1245, 889, 'Leave all six switch lugs unconnected and insulated.', 22, c.ink, 700);
txt(1245, 928, 'The switch position has no effect on the sound.', 21, c.ink, 650);

card(25, 1058, 760, 434, '4. MASTER VOLUME • A500K AUDIO');
txt(55, 1130, 'LEFT / CW → BUS', 23, c.bus, 750);
txt(55, 1171, 'CENTER / WIPER → OUT', 23, c.output, 750);
txt(55, 1212, 'RIGHT / CCW → GND', 23, c.ground, 750);
txt(55, 1280, 'No treble bleed in this revision.', 20, c.ink, 750);
pot(630, 1195, 'A500K', 'VOLUME', [
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
txt(835, 1280, 'Tone cap: 22 nF (0.022 µF, 223).', 21, c.ink, 700);
txt(835, 1314, 'Fed from BUS, the volume input.', 19, c.ink, 650);
pot(1420, 1195, 'A500K', 'TONE', [
    { label: 'OPEN', color: c.ground },
    { label: 'T-W', color: c.tone },
    { label: 'BUS', color: c.bus },
]);
txt(835, 1421, 'REAR VIEW • shaft away • lugs down', 18, c.muted, 700);
txt(835, 1455, 'Clockwise = brighter. Jack SLEEVE ← GND.', 20, c.ink, 650);

card(1595, 1058, 780, 434, '6. OPERATING STATES');
const tx = [1620, 1720, 2350];
rect(1620, 1133, 730, 318, 'white', c.border, 0, 1.5);
rect(1620, 1133, 730, 54, c.pale);
line(tx[1], 1133, tx[1], 1451, c.border, 1.2);
for (let i = 0; i < 4; i++) line(1620, 1187 + 53 * (i + 1), 2350, 1187 + 53 * (i + 1), c.border, 1.1);
txt(1670, 1168, 'POS', 20, c.ink, 750, 'middle');
txt(2035, 1168, 'SELECTED PICKUPS', 19, c.ink, 750, 'middle');
[
    ['1', 'Bridge humbucker'],
    ['2', 'Bridge ∥ Nashville'],
    ['3', 'Nashville (main Velvet voice)'],
    ['4', 'Neck ∥ Nashville'],
    ['5', 'Neck humbucker'],
].forEach(([pos, sel], i) => {
    const y = 1223 + i * 53;
    txt(1670, y, pos, 21, c.ink, 700, 'middle');
    txt(1740, y, sel, 20, c.ink, 500);
});

card(25, 1512, 2350, 288, '7. COMMON GROUND & BENCH CHECKS');
txt(55, 1592, 'GND = pickup returns + separate shields/cases • volume CCW lug • 22 nF tone return • output jack sleeve.', 22, c.ink, 700);
txt(55, 1631, 'Both pot cases, conductive switch chassis, cavity shielding, and bridge/string ground are bonded to the same ground network.', 21, c.ink, 600);
txt(55, 1685, 'Humbuckers stay in full series: insulate a single split lead, or join and insulate two separate series ends per the pickup guide.', 21, c.ink, 600);
txt(55, 1724, 'Meter the five selector positions, confirm BUS reaches only the selected pickups, then tap-test all five positions.', 21, c.ink, 600);
txt(55, 1763, 'The Nashville must sound alone in position 3 and blend only in positions 2 and 4.', 21, c.ink, 600);
add('</g></svg>');

const svg = out.join('\n') + '\n';
writeFileSync(join(here, 'relay-velvet-rev-1.0.svg'), svg);
await sharp(Buffer.from(svg)).png().toFile(join(root, 'public/wiring-diagrams/relay-velvet-rev-1.0.png'));
console.log('Generated Relay Velvet wiring reference SVG and PNG.');
