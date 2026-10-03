import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Circuit source: ../relay-reef-plus-reference.md. Layout follows the approved Relay Arc, Relay Velvet, and
// Coupeville Reef references; the blade shows contacts by function, not physical lug position.
const here = dirname(fileURLToPath(import.meta.url));
const W = 2400;
const H = 1940;
const c = { lipstick: '#ae731b', lipstick2: '#2373a2', ink: '#25303b', muted: '#4c5b68', border: '#465c70', pale: '#eef7fb', bridge: '#b94a2e', middle: '#ae731b', neck: '#2373a2', bus: '#246c58', output: '#187b80', ground: '#445464', tone: '#7950a4', lsel: '#7950a4', ltw: '#8a5a12', htw: '#8f3a5c' };
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
function lipstick(x, name, model, hot, color) {
    txt(x, 194, `${name} • ${model}`, 24, c.ink, 700);
    rect(x, 222, 232, 74, '#e4e9ec', '#2d3940', 37, 3);
    rect(x + 22, 246, 188, 26, '#f6f8f9', '#8e9da4', 13, 1.5);
    line(x + 232, 240, x + 263, 240, color, 4);
    pill(x + 263, 218, hot, color, 100, 44, 22);
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

add(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title description"><title id="title">Relay Reef Plus Rev 1.0 wiring reference</title><desc id="description">Wiring reference with neck and middle lipsticks on a two-pole three-way blade, a GFS Vintage 59 bridge humbucker, two 500k audio concentric pots giving each branch a reverse-independent volume and its own tone, branches joined at BUS, operating states, and common ground.</desc><rect width="${W}" height="${H}" fill="white"/><g font-family="Arial, Helvetica, sans-serif">`);
txt(1200, 56, 'RELAY REEF PLUS • WIRING REFERENCE', 45, c.ink, 800, 'middle');
txt(1200, 96, 'MATCH IDENTICAL BOXED NET LABELS • FUNCTIONAL SWITCH CONTACTS MUST BE METERED', 24, c.ink, 700, 'middle');
txt(2370, 37, 'Rev 1.0 • 2026-10-02', 19, c.muted, 400, 'end');

card(25, 120, 2350, 284, '1. PICKUPS', 'Use supplied lead guides and a meter; labels show electrical roles, not wire colors');
lipstick(65, 'NECK', 'Lipstick, ~6 kΩ', 'NL-H', c.lipstick2);
lipstick(835, 'MIDDLE', 'Lipstick, ~6 kΩ', 'ML-H', c.lipstick);
pickup(1605, 'BRIDGE', 'GFS Vintage ’59', 'HB-H', c.bridge);

card(25, 424, 1170, 614, '2. LIPSTICK BLADE • 3-WAY, TWO POLES', 'Functional contact map • verify by continuity');
const sx = [55, 215, 445, 675, 905, 1164];
rect(55, 499, 1109, 314, '#fbfdfe', c.border, 0, 1.4);
rect(55, 499, 1109, 65, c.pale);
for (const x of sx.slice(1, -1)) line(x, 499, x, 813, c.border, 1.2);
for (const y of [564, 688]) line(55, y, 1164, y, c.border, 1.2);
['POLE', '1 • NECK', '2 • BOTH', '3 • MIDDLE', 'COMMON'].forEach((v, i) => txt((sx[i] + sx[i + 1]) / 2, 540, v, 23, c.ink, 750, 'middle'));
[
    ['A • NECK', 'NL-H', c.lipstick2, 594, [true, true, false]],
    ['B • MIDDLE', 'ML-H', c.lipstick, 718, [false, true, true]],
].forEach(([n, label, color, y, act]) => {
    txt(135, y + 44, n, 22, c.ink, 750, 'middle');
    act.forEach((a, i) => contact(sx[i + 1] + 40, y + 13, a ? label : 'OPEN', a ? color : c.ground, 100));
    contact(sx[4] + 30, y + 13, 'L-SEL', c.lsel, 100);
});
txt(55, 860, 'Rows are the two poles; columns are the three blade positions (throws 1, 2, 3).', 21, c.ink, 650);
txt(55, 896, 'Jumper A1–A2 (NL-H), B2–B3 (ML-H), and the two commons (L-SEL). A3 and B1 stay open.', 21, c.ink, 650);
txt(55, 932, 'The blade points toward the lipstick it selects. Position 2 joins both in parallel.', 21, c.ink, 650);
txt(55, 968, 'L-SEL goes to the lipstick volume wiper and tone. The humbucker does not pass through this switch.', 20, c.muted, 500);

card(1215, 424, 1160, 614, '3. TWO BRANCHES JOIN AT BUS', 'Tone per branch • reverse-independent volumes');
pill(1245, 520, 'L-SEL', c.lsel, 110);
line(1355, 542, 1420, 542, c.lsel, 3);
rect(1420, 505, 250, 74, '#fbfdfe', c.ink, 6, 2);
txt(1545, 538, 'LIPSTICK TONE + VOL', 17, c.ink, 750, 'middle');
txt(1545, 564, 'A500k/A500k concentric', 18, c.muted, 700, 'middle');
pill(1245, 650, 'HB-H', c.bridge, 110);
line(1355, 672, 1420, 672, c.bridge, 3);
rect(1420, 635, 250, 74, '#fbfdfe', c.ink, 6, 2);
txt(1545, 668, 'HUMBUCKER TONE + VOL', 17, c.ink, 750, 'middle');
txt(1545, 694, 'A500k/A500k concentric', 18, c.muted, 700, 'middle');
line(1670, 542, 1760, 542, c.bus, 3);
line(1670, 672, 1760, 672, c.bus, 3);
line(1760, 542, 1760, 672, c.bus, 3);
line(1760, 607, 1830, 607, c.bus, 3);
pill(1830, 585, 'BUS', c.bus, 100);
line(1930, 607, 1990, 607, c.bus, 3);
txt(2000, 614, 'Jack TIP', 21, c.ink, 700);
txt(1245, 790, 'Each source enters its volume on the WIPER.', 22, c.ink, 700);
txt(1245, 828, 'CW lug → BUS • CCW lug → GND • clockwise = louder.', 20, c.ink, 700);
txt(1245, 876, 'Turning one volume down grounds only its own source,', 21, c.ink, 650);
txt(1245, 910, 'never BUS, so the other branch keeps playing.', 21, c.ink, 650);
txt(1245, 950, 'Each tone taps its own source before the volume. With', 21, c.ink, 650);
txt(1245, 982, 'that volume up, the tone also darkens the whole output.', 21, c.ink, 650);
txt(1245, 1014, 'No master volume or tone. No treble bleed.', 21, c.ink, 650);

const concentricCard = (x, title, src, srcColor, tw, twColor, side) => {
    card(x, 1058, 1170, 434, title, 'Two stacked decks of one part');
    txt(x + 30, 1146, 'VOLUME • A500k • suggested upper knob', 21, c.ink, 800);
    [
        ['LEFT / CW → BUS', c.bus],
        [`CENTER / WIPER ← ${src}`, srcColor],
        ['RIGHT / CCW → GND', c.ground],
    ].forEach(([t, col], i) => txt(x + 30, 1178 + i * 31, t, 20, col, 750));
    txt(x + 30, 1284, 'TONE • A500k • suggested lower knob', 21, c.ink, 800);
    [
        ['LEFT / CW → OPEN', c.ground],
        [`CENTER / WIPER → ${tw} → 22 nF → GND`, twColor],
        [`RIGHT / CCW ← ${src}`, srcColor],
    ].forEach(([t, col], i) => txt(x + 30, 1316 + i * 31, t, 20, col, 750));
    pot(x + 760, 1195, 'VOL', side, [
        { label: 'BUS', color: c.bus },
        { label: src, color: srcColor },
        { label: 'GND', color: c.ground },
    ]);
    pot(x + 1010, 1195, 'TONE', side, [
        { label: 'OPEN', color: c.ground },
        { label: tw, color: twColor },
        { label: src, color: srcColor },
    ]);
    txt(x + 30, 1421, 'REAR VIEW • shaft away • lugs down • meter which deck each shaft turns', 18, c.muted, 700);
    txt(x + 30, 1455, 'Volume: clockwise = louder. Tone: clockwise = brighter.', 20, c.ink, 650);
};
concentricCard(25, '4. LIPSTICK CONCENTRIC • 500k/500k AUDIO', 'L-SEL', c.lsel, 'LT-W', c.ltw, 'LIPSTICK');
concentricCard(1205, '5. HUMBUCKER CONCENTRIC • 500k/500k AUDIO', 'HB-H', c.bridge, 'HT-W', c.htw, 'HUMBUCKER');

card(25, 1512, 1160, 400, '6. OPERATING STATES');
const tx = [50, 270, 690, 1160];
rect(50, 1587, 1110, 280, 'white', c.border, 0, 1.5);
rect(50, 1587, 1110, 54, c.pale);
for (const x of tx.slice(1, -1)) line(x, 1587, x, 1867, c.border, 1.2);
for (let i = 0; i < 2; i++) line(50, 1641 + 75 * (i + 1), 1160, 1641 + 75 * (i + 1), c.border, 1.1);
txt(160, 1622, 'BLADE', 19, c.ink, 750, 'middle');
txt(480, 1622, 'LIPSTICK BRANCH', 19, c.ink, 750, 'middle');
txt(925, 1622, 'HUMBUCKER BRANCH', 19, c.ink, 750, 'middle');
[
    ['1 • Neck', 'Neck lipstick'],
    ['2 • Both', 'Neck ∥ middle lipsticks'],
    ['3 • Middle', 'Middle lipstick'],
].forEach(([pos, l], i) => {
    const y = 1686 + i * 75;
    txt(160, y, pos, 21, c.ink, 700, 'middle');
    txt(290, y, l, 20, c.ink, 500);
    txt(710, y, 'Bridge humbucker, blended', 20, c.ink, 500);
});

card(1205, 1512, 1170, 400, '7. COMMON GROUND & CHECKS');
[
    ['GND = pickup returns + separate shields/cases, both volume CCW lugs,', 21, 700],
    ['both tone-cap returns, and the jack sleeve.', 21, 700],
    ['Standard practice: pot cases, switch chassis, cavity shielding, and', 20, 600],
    ['bridge/string ground join the same ground network.', 20, 600],
    ['Humbucker in full series: insulate a single split lead, or join and', 20, 600],
    ['insulate two separate series ends. Never ground the series junction.', 20, 600],
    ['Meter the blade in all three positions. With one volume at zero,', 20, 600],
    ['the other branch must still reach the jack.', 20, 600],
].forEach(([t, sz, w], i) => txt(1235, 1592 + i * 38 + Math.floor(i / 2) * 10, t, sz, c.ink, w));
add('</g></svg>');

const svg = out.join('\n') + '\n';
writeFileSync(join(here, 'relay-reef-plus-rev-1.0.svg'), svg);
await sharp(Buffer.from(svg)).png().toFile(join(here, '../../../public/wiring-diagrams/relay-reef-plus-rev-1.0.png'));
console.log('Generated Relay Reef Plus Rev 1.0 wiring reference SVG and PNG.');
