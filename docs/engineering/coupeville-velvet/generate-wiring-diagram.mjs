import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const width = 2400;
const height = 1830;
const ink = '#25303b';
const muted = '#4c5b68';
const border = '#465c70';
const pale = '#eef7fb';
const bridge = '#b94a2e';
const middle = '#ae731b';
const neck = '#2373a2';
const bus = '#246c58';
const output = '#187b80';
const ground = '#445464';
const voice = '#7950a4';
const entries = [];
const add = (value) => entries.push(value);
const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const rect = (x, y, w, h, fill = 'white', stroke = 'none', radius = 0, sw = 2) => add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`);
const line = (x1, y1, x2, y2, color = border, sw = 2) => add(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`);
const circle = (x, y, radius, fill, stroke = 'none', sw = 2) => add(`<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`);
const txt = (x, y, value, size = 23, color = ink, weight = 500, anchor = 'start') => add(`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${esc(value)}</text>`);

function card(x, y, w, h, title, subtitle = '') {
    rect(x, y, w, h, 'white', border, 6, 2);
    rect(x + 2, y + 2, w - 4, 54, pale, 'none', 4);
    txt(x + 22, y + 39, title, 30, ink, 750);
    if (subtitle) txt(x + w - 20, y + 37, subtitle, 18, muted, 400, 'end');
}

function pill(x, y, label, color, w = 104, h = 45, size = 23) {
    rect(x, y, w, h, 'white', color, 5, 2.5);
    txt(x + w / 2, y + h / 2 + size * 0.34, label, size, color, 700, 'middle');
}

function contact(x, y, label, color, w = 105) {
    circle(x, y + 22, 8, color);
    line(x + 8, y + 22, x + 37, y + 22, color, 3);
    if (label === 'OPEN') txt(x + 48, y + 30, 'OPEN', 22, ground, 700);
    else pill(x + 43, y, label, color, w, 44, label.length > 7 ? 18 : 23);
}

function groundMark(x, y) {
    line(x, y, x, y + 24, ground, 3);
    line(x - 19, y + 24, x + 19, y + 24, ground, 3);
    line(x - 13, y + 32, x + 13, y + 32, ground, 3);
    line(x - 7, y + 40, x + 7, y + 40, ground, 3);
}

function pickup(x, y, name, hot, color, label) {
    txt(x, y + 24, name, 24, ink, 700);
    rect(x, y + 45, 202, 112, '#303b43', '#17212a', 14, 3);
    rect(x + 9, y + 54, 184, 43, '#46525b', '#1c252d', 8, 2);
    rect(x + 9, y + 105, 184, 43, '#46525b', '#1c252d', 8, 2);
    for (let i = 0; i < 6; i++) {
        circle(x + 25 + 30 * i, y + 75, 8, '#e7edf0', '#9ba8ae', 1.5);
        circle(x + 25 + 30 * i, y + 126, 8, '#e7edf0', '#9ba8ae', 1.5);
    }
    line(x + 202, y + 77, x + 236, y + 77, color, 4);
    pill(x + 236, y + 54, hot, color, 108, 46, 23);
    groundMark(x + 155, y + 157);
    txt(x, y + 213, label, 18, muted, 650);
}

function pot(x, y, title, lugs) {
    circle(x, y, 82, '#fbfdfe', ink, 2.5);
    txt(x, y - 3, title, 28, ink, 750, 'middle');
    txt(x, y + 30, 'REAR VIEW', 18, muted, 700, 'middle');
    const xs = [x - 60, x, x + 60];
    xs.forEach((lugX, i) => {
        rect(lugX - 14, y + 82, 28, 72, '#d3b082', '#735c3f', 3, 1.5);
        line(lugX, y + 154, lugX, y + 172, lugs[i].color, 3);
        txt(lugX, y + 194, lugs[i].name, 18, lugs[i].color, 700, 'middle');
    });
}

add(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
<title id="title">Coupeville Velvet wiring reference</title>
<desc id="description">Bench reference in the same numbered-panel visual language as the Relay Arc wiring diagram. It maps pickup leads, three-way selector contacts, the two push-pull poles, four RC voice shunts, rear-view pots, operating states, and common ground.</desc>
<rect width="${width}" height="${height}" fill="white"/><g font-family="Arial, Helvetica, sans-serif">`);
txt(1200, 56, 'COUPEVILLE VELVET • WIRING REFERENCE', 45, ink, 800, 'middle');
txt(1200, 96, 'MATCH IDENTICAL BOXED NET LABELS • FUNCTIONAL SWITCH CONTACTS MUST BE METERED', 24, ink, 700, 'middle');
txt(2370, 37, 'Bench Rev 0.2 • 2026-09-13', 20, muted, 400, 'end');

// 1. Pickups
card(25, 120, 2350, 284, '1. PICKUPS', 'Electrical lead roles, not manufacturer wire colors');
pickup(65, 169, 'BRIDGE • OUTER PICKUP', 'B-H', bridge, 'RETURN + SHIELD/CASE → GND');
pickup(835, 169, 'MIDDLE • GFS RETROTRON NASHVILLE', 'M-H', middle, 'RETURN + SHIELD/CASE → GND');
pickup(1605, 169, 'NECK • OUTER PICKUP', 'N-H', neck, 'RETURN + SHIELD/CASE → GND');

// 2. Conventional three-way: two audio poles join at SEL.
card(25, 424, 760, 450, '2. THREE-WAY • OUTER PICKUPS');
const sx = [55, 169, 287, 405, 523, 755];
const sy = [499, 557, 668, 779];
rect(55, 499, 700, 280, '#fbfdfe', border, 0, 1.5);
rect(55, 499, 700, 58, pale);
for (const v of sx.slice(1, -1)) line(v, 499, v, 779, border, 1.2);
for (const v of sy.slice(1, -1)) line(55, v, 755, v, border, 1.2);
['POLE', '1', '2', '3', 'COMMON'].forEach((v, i) => txt((sx[i] + sx[i + 1]) / 2, 536, v, 21, ink, 750, 'middle'));
txt(112, 609, 'A', 29, ink, 750, 'middle');
txt(112, 635, 'BRIDGE', 16, muted, 700, 'middle');
txt(112, 719, 'B', 29, ink, 750, 'middle');
txt(112, 745, 'NECK', 16, muted, 700, 'middle');
contact(177, 584, 'B-H', bridge, 60); contact(295, 584, 'B-H', bridge, 60); contact(413, 584, 'OPEN', ground);
contact(177, 695, 'OPEN', ground); contact(295, 695, 'N-H', neck, 60); contact(413, 695, 'N-H', neck, 60);
contact(552, 584, 'SEL', bus, 83); contact(552, 695, 'SEL', bus, 83);
txt(56, 810, 'Join both commons at SEL; position 2 combines bridge and neck in parallel.', 20, ink, 650);
txt(56, 841, 'This is a functional contact map; identify actual selector lugs by continuity.', 18, muted, 500);

// 3. Outer-volume push-pull: independent poles with opposite active throws.
card(805, 424, 770, 450, '3. MODE • OUTER VOLUME PUSH-PULL');
txt(830, 506, 'DOWN = outer pickups + Nashville blend', 23, ink, 700);
txt(830, 542, 'UP = Nashville solo; outer branch disconnected', 23, ink, 700);
txt(845, 590, 'A • OUTER PATH', 22, bridge, 750);
txt(1208, 590, 'B • NASHVILLE LOW', 22, middle, 750);
rect(835, 609, 327, 177, '#fbfdfe', border, 5, 1.5);
rect(1197, 609, 350, 177, '#fbfdfe', border, 5, 1.5);
['UP', 'COM', 'DOWN'].forEach((v, i) => txt(844, 650 + i * 55, v, 18, muted, 700));
['UP', 'COM', 'DOWN'].forEach((v, i) => txt(1207, 650 + i * 55, v, 18, muted, 700));
contact(914, 619, 'OPEN', ground); contact(914, 674, 'O-W', bridge, 82); contact(914, 729, 'BUS', bus, 82);
contact(1275, 619, 'GND', ground, 84); contact(1275, 674, 'M-LOW', middle, 97); contact(1275, 729, 'OPEN', ground);
txt(835, 822, 'DOWN: O-W ↔ BUS; M-LOW floats.', 20, ink, 700);
txt(835, 852, 'UP: O-W open; M-LOW ↔ GND.', 20, ink, 700);

// 4. Five discrete shunt voices, one R/C pair selected at a time.
card(1595, 424, 780, 450, '4. FIVE-WAY • GLOBAL VOICE');
txt(1623, 499, 'SWITCH COMMON → BUS', 21, bus, 750);
const voices = [
    ['1', 'OPEN', 'Full / bypass'],
    ['2', '470 kΩ → 2.2 nF', 'Very light smoothing'],
    ['3', '220 kΩ → 4.7 nF', 'Warmer'],
    ['4', '100 kΩ → 10 nF', 'Stronger reduction'],
    ['5', '47 kΩ → 22 nF', 'Dark / jazz'],
];
voices.forEach(([position, network, effect], i) => {
    const y = 522 + i * 59;
    rect(1620, y, 727, 57, i % 2 ? 'white' : '#f8fbfd', '#b9c5cf', 0, 1);
    txt(1653, y + 38, position, 24, ink, 750, 'middle');
    circle(1697, y + 28, 7, position === '1' ? ground : voice);
    line(1704, y + 28, 1732, y + 28, position === '1' ? ground : voice, 3);
    pill(1733, y + 8, network, position === '1' ? ground : voice, 326, 41, 20);
    txt(2080, y + 37, effect, 19, muted, 600);
});
txt(1623, 834, 'Series R + C to GND; use true discrete throws.', 18, ink, 650);
txt(1623, 859, 'Audio continues directly from BUS to jack TIP.', 18, muted, 500);

// 5. Outer volume. No source pot value/taper is assumed.
card(25, 895, 760, 530, '5. OUTER VOLUME • STANDARD');
txt(55, 971, 'LEFT / CW → SEL', 24, bus, 750);
txt(55, 1012, 'CENTER / WIPER → O-W', 24, output, 750);
txt(55, 1053, 'RIGHT / CCW → GND', 24, ground, 750);
txt(55, 1111, 'O-W feeds push-pull pole A common.', 21, ink, 650);
txt(55, 1150, 'DOWN, knob 0 grounds BUS: master mute.', 20, ink, 650);
txt(55, 1187, 'UP, outer branch is disconnected.', 20, ink, 650);
pot(620, 1052, 'VOL', [{ name: 'SEL', color: bus }, { name: 'O-W', color: output }, { name: 'GND', color: ground }]);
txt(55, 1349, 'REAR VIEW • shaft away • lugs down', 19, muted, 700);
txt(55, 1386, 'Source does not specify this pot’s value or taper.', 19, muted, 500);

// 6. Nashville B500K rheostat in blend mode, divider in solo mode.
card(805, 895, 770, 530, '6. NASHVILLE BLEND • B500K LINEAR');
txt(835, 971, 'LEFT / CW → M-H', 24, middle, 750);
txt(835, 1012, 'CENTER / WIPER → BUS', 24, bus, 750);
txt(835, 1053, 'RIGHT / CCW → M-LOW', 24, voice, 750);
txt(835, 1111, 'M-LOW feeds push-pull pole B common.', 21, ink, 650);
txt(835, 1150, 'DOWN: third lug floats; series blend.', 20, ink, 650);
txt(835, 1187, 'At 0, ≈500 kΩ remains; not a hard off.', 20, ink, 650);
txt(835, 1224, 'UP: third lug grounded; solo volume.', 20, ink, 650);
txt(835, 1261, 'At 0, middle reaches silence.', 20, ink, 650);
pot(1410, 1052, 'B500K', [{ name: 'M-H', color: middle }, { name: 'BUS', color: bus }, { name: 'M-LOW', color: voice }]);
txt(835, 1386, 'REAR VIEW • shaft away • lugs down', 19, muted, 700);

// 7. Operating states and output. The voice selector applies in every row.
card(1595, 895, 780, 530, '7. OPERATING STATES & JACK');
const ox = [1620, 1700, 2050, 2350];
const oy = [971, 1025, 1099, 1173, 1247];
rect(1620, 971, 730, 276, 'white', border, 0, 1.4);
rect(1620, 971, 730, 54, pale);
ox.slice(1, -1).forEach((x) => line(x, 971, x, 1247, border, 1));
oy.slice(1, -1).forEach((y) => line(1620, y, 2350, y, border, 1));
txt(1660, 1007, '3-WAY', 18, ink, 750, 'middle');
txt(1875, 1007, 'DOWN · BLEND', 18, ink, 750, 'middle');
txt(2200, 1007, 'UP · SOLO', 18, ink, 750, 'middle');
const operating = [
    ['1', 'Bridge + Nashville blend', 'Nashville only'],
    ['2', 'Bridge + neck + blend', 'Nashville only'],
    ['3', 'Neck + Nashville blend', 'Nashville only'],
];
operating.forEach((row, i) => {
    const y = 1070 + i * 74;
    txt(1660, y, row[0], 22, ink, 700, 'middle');
    txt(1718, y, row[1], 19, ink, 500);
    txt(2070, y, row[2], 19, ink, 500);
});
txt(1624, 1290, 'Jack TIP ← BUS', 22, output, 750);
txt(1905, 1290, 'Jack SLEEVE ← GND', 22, ground, 750);
txt(1624, 1330, 'All five voice positions remain global in both modes.', 19, ink, 650);
txt(1624, 1370, 'No outer mixing resistor · no treble bleed · no tone pot.', 18, muted, 500);

// 8. Ground and checks, matching Arc's bottom full-width panel.
card(25, 1445, 2350, 355, '8. COMMON GROUND & BENCH CHECKS');
txt(55, 1530, 'GND = pickup returns + separate shields/cases • outer-volume CCW lug • push-pull B UP throw • RC returns • jack sleeve.', 23, ink, 700);
txt(55, 1570, 'Also bond pot cases, conductive switch chassis, cavity shielding, and bridge/string ground to the same ground network.', 22, ink, 600);
txt(55, 1630, 'Meter the 3-way in all positions; confirm both push-pull poles in DOWN and UP; verify 5-way P1 is open and P2–P5 select one RC branch.', 21, ink, 600);
txt(55, 1670, 'Check middle pot ends: knob 10 ≈0 Ω from M-H to BUS; knob 0 ≈500 kΩ in DOWN, silence in UP. Tap-test every pickup and voice.', 21, ink, 600);
txt(55, 1730, 'BENCH PROTOTYPE • pickup lead colors and physical switch lugs require the actual part guides and a meter • control/body fit unverified.', 20, muted, 650);

add('</g></svg>');
const svg = entries.join('\n') + '\n';
writeFileSync(join(here, 'wiring-diagram.svg'), svg);
await sharp(Buffer.from(svg)).png().toFile(join(here, 'wiring-diagram.png'));
console.log('Generated Coupeville Velvet builder reference SVG and PNG.');
