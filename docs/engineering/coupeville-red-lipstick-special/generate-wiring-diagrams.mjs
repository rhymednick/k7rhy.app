// Generates the two Red Lipstick Special drawing sheets (SVG + PNG) from the netlist model.
//   wiring-reference  — builder sheet in the Relay Arc / Coupeville Velvet panel style
//   wiring-schematic  — conventional series-chain schematic
// Refuses to draw if check-netlist.mjs fails. Run: node generate-wiring-diagrams.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { runChecks } from './check-netlist.mjs';
import { verifySchematic } from './verify-drawing.mjs';
import { netOf, operatingStates } from './netlist.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const { checks, failures } = runChecks();
if (failures.length) {
    console.error(`Netlist check failed (${failures.length} of ${checks}); not drawing.`);
    failures.slice(0, 10).forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
}

const REV = 'Rev 0.2 • 2026-10-05';
const ink = '#25303b';
const muted = '#4c5b68';
const border = '#465c70';
const pale = '#eef7fb';
const neck = '#2373a2';
const middle = '#ae731b';
const bridge = '#b94a2e';
const bus = '#246c58';
const output = '#187b80';
const ground = '#445464';
const nodeColor = { GND: ground, 'N-OUT': neck, 'N-Y': neck, 'N-H': neck, 'N-R': neck, 'M-OUT': middle, 'M-Y': middle, 'M-H': middle, 'M-R': middle, BUS: bus, 'B-R': bridge, OUT: output, 'TONE-W': output };
const colorOf = (net) => nodeColor[net] ?? ink;
const minus = (s) => s.replaceAll('-', '−');

function makeSheet(width, height, title, description) {
    const entries = [];
    const add = (value) => entries.push(value);
    const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    const api = {
        add,
        rect: (x, y, w, h, fill = 'white', stroke = 'none', radius = 0, sw = 2, extra = '') => add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`),
        line: (x1, y1, x2, y2, color = border, sw = 2, extra = '') => add(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" ${extra}/>`),
        poly: (points, color, sw = 3.5, extra = '') => add(`<polyline data-wire="1" points="${points.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`),
        dot: (x, y, color) => add(`<circle data-dot="1" cx="${x}" cy="${y}" r="6" fill="${color}"/>`),
        term: (name, x, y) => add(`<circle data-term="${name}" cx="${x}" cy="${y}" r="0.5" fill="none"/>`),
        blade: (x1, y1, x2, y2, color = ink, sw = 4) => add(`<line data-blade="1" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`),
        // A hop: two wire pieces joined by an arch that passes over a crossing wire at xCross.
        hop: (xStart, xCross, xEnd, y, color, half = 9) => {
            add(`<polyline data-wire="1" points="${xStart},${y} ${xCross - half},${y}" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>`);
            add(`<polyline data-wire="1" points="${xCross + half},${y} ${xEnd},${y}" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>`);
            add(`<path data-bridge="${xCross - half},${y} ${xCross + half},${y}" d="M${xCross - half},${y} A${half},${half} 0 0 1 ${xCross + half},${y}" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>`);
        },
        path: (d, color, sw = 3.5, fill = 'none', extra = '') => add(`<path d="${d}" fill="${fill}" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`),
        circle: (x, y, radius, fill, stroke = 'none', sw = 2) => add(`<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`),
        txt: (x, y, value, size = 23, color = ink, weight = 500, anchor = 'start') => add(`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${esc(value)}</text>`),
    };
    const { rect, line, circle, txt } = api;
    api.card = (x, y, w, h, heading, subtitle = '') => {
        rect(x, y, w, h, 'white', border, 6, 2);
        rect(x + 2, y + 2, w - 4, 54, pale, 'none', 4);
        txt(x + 22, y + 39, heading, 30, ink, 750);
        if (subtitle) txt(x + w - 20, y + 37, subtitle, 18, muted, 400, 'end');
    };
    api.pill = (x, y, label, color, w = 104, h = 45, size = 23) => {
        rect(x, y, w, h, 'white', color, 5, 2.5);
        txt(x + w / 2, y + h / 2 + size * 0.34, label, size, color, 700, 'middle');
    };
    // Net label centred on a point (sits on a wire, white fill hides the wire behind it).
    api.netLabel = (cx, cy, label, color, w = 84, h = 34, size = 19) => {
        rect(cx - w / 2, cy - h / 2, w, h, 'white', color, 4, 2.2, `data-netlabel="${label}" data-cx="${cx}" data-cy="${cy}"`);
        txt(cx, cy + size * 0.34, label, size, color, 700, 'middle');
    };
    api.contact = (x, y, label, color, w = 105) => {
        circle(x, y + 22, 8, color);
        line(x + 8, y + 22, x + 37, y + 22, color, 3);
        if (label === 'OPEN') txt(x + 48, y + 30, 'OPEN', 22, ground, 700);
        else api.pill(x + 43, y, label, color, w, 44, label.length > 7 ? 18 : 23);
    };
    api.groundMark = (x, y, color = ground) => {
        api.term('GNDSYM', x, y);
        line(x, y, x, y + 24, color, 3);
        line(x - 19, y + 24, x + 19, y + 24, color, 3);
        line(x - 13, y + 32, x + 13, y + 32, color, 3);
        line(x - 7, y + 40, x + 7, y + 40, color, 3);
    };
    api.svg = () =>
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
<title id="title">${esc(title)}</title>
<desc id="description">${esc(description)}</desc>
<defs>
<linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7f9"/><stop offset="0.35" stop-color="#c3ced5"/><stop offset="0.62" stop-color="#8b99a3"/><stop offset="1" stop-color="#d9e1e6"/></linearGradient>
</defs>
<rect width="${width}" height="${height}" fill="white"/><g font-family="Arial, Helvetica, sans-serif">
${entries.join('\n')}
</g></svg>
`;
    return api;
}

// ---------------------------------------------------------------------------------------------
// Sheet 1: builder reference
// ---------------------------------------------------------------------------------------------
function builderSheet() {
    const s = makeSheet(2400, 2330, 'Coupeville Red Lipstick Special wiring reference', 'Builder reference in the numbered-panel style of the Relay Arc wiring diagram. It shows the three lipstick pickups with hot, return, and case leads; the series chain from ground through neck, middle, and bridge to the volume input; functional contact maps for the three SPDT enable switches and two DPDT phase switches; the fourteen operating states; rear-view A500K volume and tone pots; the output jack; and the common ground.');
    const { rect, line, circle, txt, card, pill, netLabel, contact, groundMark, add } = s;

    txt(1200, 56, 'COUPEVILLE RED LIPSTICK SPECIAL • WIRING REFERENCE', 45, ink, 800, 'middle');
    txt(1200, 96, 'SERIES CHAIN • MATCH IDENTICAL BOXED NET LABELS • FUNCTIONAL SWITCH CONTACTS MUST BE METERED', 24, ink, 700, 'middle');
    txt(2370, 37, REV, 20, muted, 400, 'end');

    const lipstick = (x, y, w = 250, h = 64) => {
        rect(x + 22, y + h - 4, w - 44, 14, '#303b43', '#17212a', 4, 2);
        rect(x, y, w, h, 'url(#chrome)', '#6c7a84', h / 2, 2.5);
        line(x + h / 2, y + h * 0.27, x + w - h / 2, y + h * 0.27, 'white', 4, 'opacity="0.85"');
        line(x + h / 2, y + h * 0.76, x + w - h / 2, y + h * 0.76, '#6f7e88', 2.5, 'opacity="0.55"');
        circle(x + h / 2, y + h / 2, h / 2 - 9, 'none', '#7d8b95', 1.5);
    };

    // 1. Pickups ---------------------------------------------------------------------------------
    card(25, 120, 2350, 300, '1. PICKUPS', 'Electrical lead roles, not manufacturer wire colors');
    const pickup = (x, name, color, hot, ret, hotNote, retNote, note) => {
        const y = 169;
        txt(x, y + 24, name, 24, ink, 700);
        lipstick(x, y + 40);
        line(x + 250, y + 54, x + 290, y + 54, color, 4);
        pill(x + 290, y + 32, hot, color, 112, 44, 22);
        txt(x + 414, y + 61, hotNote, 18, muted, 650);
        line(x + 250, y + 98, x + 290, y + 98, color, 4);
        pill(x + 290, y + 76, ret, color, 112, 44, 22);
        txt(x + 414, y + 105, retNote, 18, muted, 650);
        line(x + 100, y + 114, x + 100, y + 128, ground, 3);
        groundMark(x + 100, y + 128);
        txt(x + 128, y + 150, 'CASE LEAD → GND', 18, ground, 700);
        txt(x, y + 192, note, 18, muted, 600);
        txt(x, y + 216, 'NORMAL: hot lead toward volume, return lead toward ground.', 17, muted, 500);
    };
    pickup(65, 'NECK • GFS LIPSTICK', neck, 'N-H', 'N-R', 'HOT', 'RETURN', 'Vendor-stated 4.9K • measure DCR');
    pickup(835, 'MIDDLE • GFS LIPSTICK RWRP', middle, 'M-H', 'M-R', 'HOT', 'RETURN', 'Reverse wound / reverse polarity • vendor-stated 6K');
    pickup(1605, 'BRIDGE • GFS LIPSTICK', bridge, 'BUS', 'B-R', 'HOT (lands on BUS)', 'RETURN', 'Vendor-stated 8K • measure DCR');

    // 2. Series chain ----------------------------------------------------------------------------
    card(25, 440, 2350, 260, '2. SERIES CHAIN', 'ON = pickup between IN and OUT • OFF = IN joined to OUT');
    const cy = 584;
    const arrow = (x1, x2, color) => {
        line(x1, cy, x2, cy, color, 4);
        add(`<polygon points="${x2},${cy} ${x2 - 14},${cy - 8} ${x2 - 14},${cy + 8}" fill="${color}"/>`);
    };
    const chainModule = (x, title, sub, on, off, color) => {
        rect(x, cy - 72, 450, 144, '#f8fbfd', color, 8, 2.5);
        txt(x + 225, cy - 38, title, 25, color, 800, 'middle');
        txt(x + 225, cy - 10, sub, 18, muted, 650, 'middle');
        txt(x + 225, cy + 24, on, 20, ink, 650, 'middle');
        txt(x + 225, cy + 52, off, 20, ink, 650, 'middle');
    };
    pill(55, cy - 22, 'GND', ground, 100, 44);
    arrow(155, 185, ground);
    chainModule(190, 'NECK MODULE', 'E-N SPDT • P-N DPDT', 'ON:  GND → pickup → N-OUT', 'OFF: GND = N-OUT', neck);
    arrow(640, 670, neck);
    pill(670, cy - 22, 'N-OUT', neck, 124, 44);
    arrow(794, 824, neck);
    chainModule(830, 'MIDDLE MODULE', 'E-M SPDT • P-M DPDT', 'ON:  N-OUT → pickup → M-OUT', 'OFF: N-OUT = M-OUT', middle);
    arrow(1280, 1310, middle);
    pill(1310, cy - 22, 'M-OUT', middle, 124, 44);
    arrow(1434, 1464, middle);
    chainModule(1470, 'BRIDGE MODULE', 'E-B SPDT • no phase switch', 'ON:  M-OUT → pickup → BUS', 'OFF: M-OUT = BUS', bridge);
    arrow(1920, 1950, bridge);
    pill(1950, cy - 22, 'BUS', bus, 104, 44);
    txt(2080, cy - 6, 'VOLUME INPUT', 21, bus, 750);
    txt(2080, cy + 22, '+ TONE FEED', 21, bus, 750);
    txt(55, 682, 'All three OFF joins GND to BUS: built-in mute. No pickup coil lead is wired to GND except through the neck enable switch.', 20, ink, 650);

    // 3. Enable switches -------------------------------------------------------------------------
    card(25, 720, 1150, 320, '3. ENABLE • SPDT ON-ON ×3', 'Functional contact map');
    const tx = 55;
    const colsE = [tx, tx + 150, tx + 370, tx + 700, tx + 1090];
    const headRow = (cols, y, labels) => {
        rect(cols[0], y, cols[cols.length - 1] - cols[0], 42, pale, border, 0, 1.4);
        labels.forEach((l, i) => txt((cols[i] + cols[i + 1]) / 2, y + 29, l, 19, ink, 750, 'middle'));
    };
    headRow(colsE, 790, ['SWITCH', 'COMMON', 'UP • ON  →  pickup in series', 'DOWN • OFF  →  bypass']);
    [
        ['E-N', 'N', neck],
        ['E-M', 'M', middle],
        ['E-B', 'B', bridge],
    ].forEach(([name, m, color], i) => {
        const y = 832 + i * 50;
        rect(colsE[0], y, colsE[4] - colsE[0], 50, i % 2 ? 'white' : '#f8fbfd', border, 0, 1);
        txt((colsE[0] + colsE[1]) / 2, y + 33, name, 22, color, 800, 'middle');
        contact(colsE[1] + 20, y + 3, netOf(`E-${m}.C`), colorOf(netOf(`E-${m}.C`)), 96);
        contact(colsE[2] + 20, y + 3, netOf(`E-${m}.ON`), colorOf(netOf(`E-${m}.ON`)), 96);
        contact(colsE[3] + 20, y + 3, netOf(`E-${m}.OFF`), colorOf(netOf(`E-${m}.OFF`)), 96);
    });
    txt(55, 1004, 'UP: COMMON ↔ ON throw. DOWN: COMMON ↔ OFF throw. A DPDT may be used; leave its second pole unconnected.', 18, ink, 650);
    txt(55, 1028, 'Functional contacts, not lug numbers: identify the real toggle lugs by continuity (assembly guide §2).', 18, muted, 500);

    // 4. Phase switches --------------------------------------------------------------------------
    card(25, 1060, 1150, 380, '4. PHASE • DPDT ON-ON ×2', 'Functional contact map • neck and middle only');
    const colsP = [tx, tx + 190, tx + 410, tx + 750, tx + 1090];
    headRow(colsP, 1130, ['POLE', 'COMMON', 'UP • NORMAL', 'DOWN • REVERSE']);
    [
        ['P-N', 'N', neck],
        ['P-M', 'M', middle],
    ].forEach(([name, m, color], mi) => {
        [1, 2].forEach((pole, pi) => {
            const y = 1172 + (mi * 2 + pi) * 50;
            rect(colsP[0], y, colsP[4] - colsP[0], 50, (mi * 2 + pi) % 2 ? 'white' : '#f8fbfd', border, 0, 1);
            txt((colsP[0] + colsP[1]) / 2, y + 33, `${name}${pole}`, 22, color, 800, 'middle');
            const c = netOf(`P-${m}.${pole}C`);
            const n = netOf(`P-${m}.${pole}N`);
            const r = netOf(`P-${m}.${pole}R`);
            contact(colsP[1] + 40, y + 3, c, colorOf(c), 96);
            contact(colsP[2] + 60, y + 3, n, colorOf(n), 96);
            contact(colsP[3] + 60, y + 3, r, colorOf(r), 96);
        });
    });
    txt(55, 1402, 'Cross-wired: hot lead → NORMAL throw of pole 1 and REVERSE throw of pole 2; return lead → the other two throws.', 18, ink, 650);
    txt(55, 1426, 'The two poles never touch. Bridge has no phase switch: it is the fixed reference.', 18, muted, 500);

    // 5. Operating states ------------------------------------------------------------------------
    card(1195, 720, 1180, 720, '5. OPERATING STATES', 'Chain listed ground end first • + NORMAL, − REVERSE');
    const colsS = [1215, 1295, 1495, 1900, 2355];
    headRow(colsS, 790, ['ID', '', 'PHASE LEVERS', 'CHAIN, GND → BUS']);
    [
        ['N', neck],
        ['M', middle],
        ['B', bridge],
    ].forEach(([m, color], k) => txt(colsS[1] + 38 + k * 62, 819, m, 19, color, 800, 'middle'));
    const phaseText = { S0: 'any', S1: 'any', S2: 'any', S3: 'any', S4: 'M NORMAL', S5: 'M REVERSE', S6: 'N NORMAL', S7: 'N REVERSE', S8: 'N and M the same', S9: 'N and M different', S10: 'N NORMAL • M NORMAL', S11: 'N REVERSE • M NORMAL', S12: 'N NORMAL • M REVERSE', S13: 'N REVERSE • M REVERSE' };
    const rows = operatingStates().sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));
    rows.forEach((row, i) => {
        const y = 832 + i * 38;
        rect(colsS[0], y, colsS[4] - colsS[0], 38, i % 2 ? 'white' : '#f8fbfd', border, 0, 1);
        txt((colsS[0] + colsS[1]) / 2, y + 26, row.id, 20, ink, 750, 'middle');
        [
            ['N', neck],
            ['M', middle],
            ['B', bridge],
        ].forEach(([m, color], k) => {
            const cx = colsS[1] + 38 + k * 62;
            circle(cx, y + 19, 10, row[m] ? color : 'white', color, 2.5);
        });
        txt(colsS[2] + 14, y + 26, phaseText[row.id], 18, ink, 550);
        const single = { S1: 'BRIDGE', S2: 'MIDDLE', S3: 'NECK' }[row.id];
        const chainText = row.id === 'S0' ? 'MUTE • BUS = GND' : (single ?? minus(row.chain).replaceAll(' ', ' → '));
        txt(colsS[3] + 14, y + 26, chainText, 18, row.id === 'S0' ? ground : ink, 700);
    });
    txt(1215, 1402, 'Filled dot = enable switch ON (lever UP). Phase levers of a disabled pickup have no effect.', 18, ink, 650);
    txt(1215, 1426, 'Relative phase is electrical: confirm acoustic in-phase / out-of-phase for each pair on the bench.', 18, muted, 500);

    // 6-8 Controls -------------------------------------------------------------------------------
    const pot = (x, y, heading, lugs) => {
        circle(x, y, 82, '#fbfdfe', ink, 2.5);
        txt(x, y - 8, heading, 26, ink, 750, 'middle');
        txt(x, y + 24, 'BOTTOM VIEW', 17, muted, 700, 'middle');
        [x - 78, x, x + 78].forEach((lugX, i) => {
            rect(lugX - 14, y + 82, 28, 72, '#d3b082', '#735c3f', 3, 1.5);
            txt(lugX, y + 128, String(i + 1), 22, ink, 800, 'middle');
            line(lugX, y + 154, lugX, y + 172, lugs[i].color, 3);
            txt(lugX, y + 194, lugs[i].name, 17, lugs[i].color, 700, 'middle');
        });
    };
    card(25, 1460, 770, 420, '6. MASTER VOLUME • A500K AUDIO');
    txt(55, 1536, 'LUG 1 • LEFT / CW → BUS', 22, bus, 750);
    txt(55, 1574, 'LUG 2 • CENTER / WIPER → OUT', 22, output, 750);
    txt(55, 1612, 'LUG 3 • RIGHT / CCW → GND', 22, ground, 750);
    txt(55, 1672, 'Fed by the series chain output (BUS).', 20, ink, 650);
    txt(55, 1708, 'Clockwise = louder.', 20, ink, 650);
    pot(620, 1612, 'VOL', [
        { name: 'BUS', color: bus },
        { name: 'OUT', color: output },
        { name: 'GND', color: ground },
    ]);
    txt(55, 1832, 'BOTTOM VIEW • solder lugs face the viewer • shaft away', 18, muted, 700);
    txt(55, 1858, 'Never mirror this drawing between projects.', 18, muted, 500);

    card(815, 1460, 770, 420, '7. MASTER TONE • A500K AUDIO + 22 nF');
    txt(845, 1536, 'LUG 1 • LEFT / CW → unused', 22, ground, 750);
    txt(845, 1574, 'LUG 2 • CENTER / WIPER → TONE-W', 22, output, 750);
    txt(845, 1612, 'LUG 3 • RIGHT / CCW → BUS', 22, bus, 750);
    txt(845, 1672, 'TONE-W → 22 nF → GND.', 20, ink, 650);
    txt(845, 1700, 'Fed from BUS (volume input),', 20, ink, 650);
    txt(845, 1728, 'not the volume wiper.', 20, ink, 650);
    txt(845, 1756, 'Clockwise = brighter.', 20, ink, 650);
    pot(1410, 1612, 'TONE', [
        { name: 'unused', color: ground },
        { name: 'TONE-W', color: output },
        { name: 'BUS', color: bus },
    ]);
    txt(845, 1832, 'BOTTOM VIEW • solder lugs face the viewer • shaft away', 18, muted, 700);
    txt(845, 1858, 'Capacitor: 22 nF (0.022 µF), non-polarized.', 18, muted, 500);

    card(1605, 1460, 770, 420, '8. OUTPUT JACK • MONO');
    txt(1635, 1536, 'TIP ← OUT (volume wiper)', 23, output, 750);
    txt(1635, 1576, 'SLEEVE ← GND', 23, ground, 750);
    txt(1635, 1636, 'A500K volume and tone only.', 20, ink, 650);
    txt(1635, 1668, 'No treble bleed • no loading resistors.', 20, ink, 650);
    txt(1635, 1700, 'No pickup volume or tone controls.', 20, ink, 650);
    circle(2150, 1690, 62, '#fbfdfe', ink, 2.5);
    txt(2150, 1686, 'JACK', 24, ink, 750, 'middle');
    txt(2150, 1714, 'MONO', 17, muted, 700, 'middle');
    [
        ['TIP', 2108, output],
        ['SLEEVE', 2192, ground],
    ].forEach(([name, lx, color]) => {
        rect(lx - 12, 1752, 24, 56, '#d3b082', '#735c3f', 3, 1.5);
        line(lx, 1808, lx, 1822, color, 3);
    });
    txt(2108, 1846, 'TIP', 17, output, 700, 'middle');
    txt(2192, 1846, 'SLEEVE', 17, ground, 700, 'middle');

    // 9. Ground and checks -----------------------------------------------------------------------
    card(25, 1900, 2350, 400, '9. COMMON GROUND & BENCH CHECKS');
    txt(55, 1985, 'GND = neck enable common (chain start) • each pickup CASE lead • volume CCW lug • 22 nF return • jack sleeve • pot cases • conductive switch chassis • cavity shielding • bridge/string ground.', 22, ink, 700);
    txt(55, 2025, 'NO coil lead goes to GND except through E-N. Keep N-OUT, N-Y, N-H, N-R, M-OUT, M-Y, M-H, M-R, B-R and every toggle terminal clear of shielding and ground.', 22, ink, 700);
    txt(55, 2085, 'Meter each loose pickup first: the RETURN lead reads the coil resistance to the HOT lead; the CASE lead reads open to hot and continuity to the case. Never wire the case lead into the chain.', 21, ink, 600);
    txt(55, 2125, 'With pickups disconnected, meter every enable and phase lever state; in all eight enable states, GND–N-OUT, N-OUT–M-OUT, M-OUT–BUS close only through OFF modules, and N=M=B=OFF joins GND to BUS.', 21, ink, 600);
    txt(55, 2165, 'After wiring pickups: DC resistance at the jack = sum of the active pickups (about 0 Ω all OFF). Tap-test all 13 sounding states; confirm each pair’s phase and hum on the bench.', 21, ink, 600);
    txt(55, 2225, 'EXPERIMENTAL BENCH DESIGN • lead colors, toggle lugs, and body fit are unverified • identify GFS leads by meter and the supplied documentation, not by color alone.', 20, muted, 650);
    txt(55, 2262, `Netlist check: ${checks} checks across 32 switch states passed when this sheet was generated.`, 18, muted, 500);
    return s;
}

// ---------------------------------------------------------------------------------------------
// Sheet 2: series-chain schematic. Wires, junction dots, terminals, and switch blades carry data-*
// tags so verify-drawing.mjs can rebuild the connectivity from the drawn geometry.
// ---------------------------------------------------------------------------------------------
function schematicSheet() {
    const s = makeSheet(2400, 1480, 'Coupeville Red Lipstick Special series schematic', 'Conventional schematic of the series pickup chain. Ground enters the neck module; each module has a single-pole enable switch that either inserts the pickup or joins the module input to its output; neck and middle have a cross-wired DPDT phase switch; the bridge module has none. The bridge output is the bus feeding the volume pot, the tone pot with its 22 nF capacitor, and the output jack.');
    const { rect, line, poly, path, circle, txt, card, netLabel, groundMark, add, dot, term, blade, hop } = s;

    txt(1200, 56, 'COUPEVILLE RED LIPSTICK SPECIAL • SERIES SCHEMATIC', 45, ink, 800, 'middle');
    txt(1200, 96, 'SHOWN WITH EVERY LEVER UP: ALL PICKUPS ON • BOTH PHASE SWITCHES NORMAL', 24, ink, 700, 'middle');
    txt(2370, 37, REV, 20, muted, 400, 'end');

    card(25, 120, 2350, 640, '1. SERIES CHAIN • GND → NECK → MIDDLE → BRIDGE → BUS', 'Dot = connection • crossing without a dot is not connected');

    const oy = 190;
    const X = { in: 40, c: 110, k: 230, o: 360, y: 420, pc: 470, t: 530, hb: 600, rb: 650, coil: 715 };
    const swContact = (name, x, y, color) => {
        term(name, x, y);
        circle(x, y, 7, 'white', color, 3);
    };
    const swPivot = (name, x, y) => {
        term(name, x, y);
        circle(x, y, 6, ink);
    };
    const coil = (x, y, color) => path(`M${x},${y}` + ' a10,10 0 0 1 0,20'.repeat(4), color, 3.5);

    // One module cell. m: 'N' | 'M' (enable + phase switch) or 'B' (enable switch only).
    function cell(ox, m) {
        const P = (x, y) => [ox + x, oy + y];
        const w = (points, color, sw = 3.5) =>
            poly(
                points.map(([x, y]) => P(x, y)),
                color,
                sw
            );
        const label = (x, y, text, size = 18, color = ink, weight = 700, anchor = 'start') => txt(ox + x, oy + y, text, size, color, weight, anchor);
        const name = { N: 'NECK', M: 'MIDDLE', B: 'BRIDGE' }[m];
        const col = { N: neck, M: middle, B: bridge }[m];
        const inNet = netOf(`E-${m}.C`);
        const outNet = netOf(`E-${m}.OFF`);
        const yNet = netOf(`E-${m}.ON`);
        const inColor = colorOf(inNet);
        const outColor = colorOf(outNet);
        const yX = m === 'B' ? 640 : X.y; // x of the Y trunk

        // Enable switch E-x (SPDT), lever UP: common joined to the ON contact.
        rect(ox + 92, oy + 22, 172, 142, 'none', '#9aa7b2', 8, 1.6, 'stroke-dasharray="7 6"');
        label(94, 16, `E-${m} • SPDT ON-ON`, 17, ink, 750);
        w(
            [
                [X.in, 90],
                [X.c, 90],
            ],
            inColor
        );
        if (m === 'N') {
            w(
                [
                    [X.in, 90],
                    [X.in, 96],
                ],
                ground
            );
            groundMark(...P(X.in, 96));
        }
        dot(...P(X.in, 90), inColor);
        swPivot(`E-${m}.C`, ...P(X.c, 90));
        swContact(`E-${m}.ON`, ...P(X.k, 50), col);
        swContact(`E-${m}.OFF`, ...P(X.k, 130), outColor);
        blade(...P(X.c, 90), ...P(X.k - 8, 54));
        label(X.k + 40, 40, 'ON • UP', 17, muted, 700);
        label(X.k + 34, 121, 'OFF • DOWN', 16, muted, 700);
        // ON throw -> Y trunk (the pickup's low side)
        w([[X.k + 7, 50], [yX, 50], [yX, m === 'B' ? 310 : 230], ...(m === 'B' ? [] : [[X.pc, 230]])], colorOf(yNet));
        // OFF throw -> OUT trunk, which carries the chain on to the next module
        w(
            [
                [X.k + 7, 130],
                [X.o, 130],
                [X.o, 540],
            ],
            outColor
        );
        netLabel(...P(X.o, 270), outNet, outColor, outNet.length > 4 ? 104 : 84);
        netLabel(...P(yX, m === 'B' ? 170 : 110), yNet, colorOf(yNet), 76);

        if (m !== 'B') {
            // Phase switch P-x (DPDT): pole 2 common = x-Y, pole 1 common = x-OUT. Drawn NORMAL (lever UP).
            rect(ox + X.pc - 24, oy + 168, 120, 290, 'none', '#9aa7b2', 8, 1.6, 'stroke-dasharray="7 6"');
            label(X.pc - 24, 156, `P-${m} • DPDT ON-ON`, 17, ink, 750);
            w(
                [
                    [X.o, 400],
                    [X.pc, 400],
                ],
                outColor
            );
            dot(...P(X.o, 400), outColor);
            swPivot(`P-${m}.2C`, ...P(X.pc, 230));
            swPivot(`P-${m}.1C`, ...P(X.pc, 400));
            swContact(`P-${m}.2N`, ...P(X.t, 200), col);
            swContact(`P-${m}.2R`, ...P(X.t, 260), col);
            swContact(`P-${m}.1N`, ...P(X.t, 370), col);
            swContact(`P-${m}.1R`, ...P(X.t, 430), col);
            blade(...P(X.pc, 230), ...P(X.t - 8, 203));
            blade(...P(X.pc, 400), ...P(X.t - 8, 373));
            line(ox + X.pc + 27, oy + 216, ox + X.pc + 27, oy + 386, ground, 2.2, 'stroke-dasharray="6 5"');
            label(X.t + 6, 192, 'NORM', 15, muted, 700);
            label(X.t + 6, 252, 'REV', 15, muted, 700);
            label(X.t + 6, 362, 'NORM', 15, muted, 700);
            label(X.t + 6, 422, 'REV', 15, muted, 700);
            // Pole 2 NORMAL and pole 1 REVERSE join the return bus; pole 2 REVERSE and pole 1 NORMAL join the hot bus.
            w(
                [
                    [X.t + 7, 200],
                    [X.rb, 200],
                    [X.rb, 430],
                    [X.coil, 430],
                    [X.coil, 395],
                ],
                col
            );
            w(
                [
                    [X.t + 7, 430],
                    [X.rb, 430],
                ],
                col
            );
            w(
                [
                    [X.t + 7, 260],
                    [X.hb, 260],
                    [X.hb, 370],
                    [X.t + 7, 370],
                ],
                col
            );
            // hot exit, arching over the return bus
            const [hx, hy] = P(X.hb, 315);
            hop(hx, ox + X.rb, ox + X.coil, hy, col);
            dot(hx, hy, col);
            dot(...P(X.rb, 430), col);
            netLabel(...P(X.hb, 290), netOf(`PU-${m}.H`), col, 72);
            netLabel(...P(X.rb, 250), netOf(`PU-${m}.R`), col, 64);
            // pickup
            rect(ox + X.coil - 38, oy + 296, 78, 128, 'none', '#7d8b95', 8, 1.8, 'stroke-dasharray="7 6"');
            coil(...P(X.coil, 315), col);
            term(`PU-${m}.H`, ...P(X.coil, 315));
            term(`PU-${m}.R`, ...P(X.coil, 395));
            label(X.coil - 32, 462, `${name} PICKUP`, 18, col, 800);
            if (m === 'M') label(X.coil - 32, 484, 'RWRP', 16, muted, 700);
            label(X.coil - 30, 303, 'H', 16, col, 800, 'middle');
            label(X.coil - 30, 410, 'R', 16, col, 800, 'middle');
            term(`PU-${m}.CASE`, ...P(X.coil + 40, 360));
            w(
                [
                    [X.coil + 40, 360],
                    [X.coil + 66, 360],
                ],
                ground,
                3
            );
            groundMark(...P(X.coil + 66, 360));
            label(X.coil + 66, 418, 'CASE', 15, ground, 700, 'middle');
        } else {
            // Bridge pickup sits between the BUS trunk and the Y trunk; it has no phase switch.
            rect(ox + 462, oy + 212, 78, 118, 'none', '#7d8b95', 8, 1.8, 'stroke-dasharray="7 6"');
            coil(...P(500, 230), col);
            term('PU-B.H', ...P(500, 230));
            term('PU-B.R', ...P(500, 310));
            w(
                [
                    [X.o, 230],
                    [500, 230],
                ],
                outColor
            );
            dot(...P(X.o, 230), outColor);
            w(
                [
                    [500, 310],
                    [yX, 310],
                ],
                col
            );
            label(500, 196, 'BRIDGE PICKUP', 18, col, 800, 'middle');
            label(474, 244, 'H', 16, col, 800, 'middle');
            label(474, 304, 'R', 16, col, 800, 'middle');
            term('PU-B.CASE', ...P(500, 330));
            w(
                [
                    [500, 330],
                    [500, 350],
                ],
                ground,
                3
            );
            groundMark(...P(500, 350));
            label(540, 372, 'CASE', 15, ground, 700, 'middle');
        }
    }

    cell(30, 'N');
    cell(30 + 800, 'M');
    cell(30 + 1600, 'B');
    // Chain hand-offs: the OUT trunk exits along y=540, then rises to the next module's IN rail.
    [30, 830].forEach((ox, i) => {
        const c = colorOf(i === 0 ? 'N-OUT' : 'M-OUT');
        poly(
            [
                [ox + X.o, oy + 540],
                [ox + 800 + X.in, oy + 540],
                [ox + 800 + X.in, oy + 90],
            ],
            c
        );
    });
    // BUS leaves the bridge cell downward to the output stage.
    const busX = 30 + 1600 + X.o;
    poly(
        [
            [busX, oy + 540],
            [busX, 900],
        ],
        bus
    );

    // 2. Output stage ------------------------------------------------------------------------------
    card(1265, 780, 1110, 640, '2. OUTPUT STAGE', 'A500K volume • A500K tone • 22 nF • mono jack');
    const railY = 900;
    const tx2 = 1450; // tone pot
    const vx = 1790; // volume pot
    const capX = 1660;
    poly(
        [
            [busX, railY],
            [tx2, railY],
        ],
        bus
    );
    netLabel(busX, 868, 'BUS', bus, 84);
    const varRes = (x, top, bottom) => rect(x - 15, top, 30, bottom - top, 'white', ink, 3, 3);
    const wiperHead = (x, y, color) => add(`<polygon points="${x},${y} ${x + 16},${y - 8} ${x + 16},${y + 8}" fill="${color}"/>`);
    // Volume: CW lug (1) on BUS, CCW lug (3) on GND, wiper (2) is OUT.
    dot(vx, railY, bus);
    poly(
        [
            [vx, railY],
            [vx, 930],
        ],
        bus
    );
    varRes(vx, 930, 1090);
    term('VOL.CW', vx, 930);
    term('VOL.CCW', vx, 1090);
    term('VOL.WIPER', vx + 16, 1010);
    poly(
        [
            [vx, 1090],
            [vx, 1130],
        ],
        ground
    );
    groundMark(vx, 1130);
    wiperHead(vx + 16, 1010, output);
    poly(
        [
            [vx + 16, 1010],
            [2150, 1010],
        ],
        output
    );
    netLabel(2025, 1010, 'OUT', output, 84);
    txt(vx - 26, 925, '1 • CW', 17, bus, 700, 'end');
    txt(vx - 26, 1118, '3 • CCW', 17, ground, 700, 'end');
    txt(vx + 26, 1000, '2 • WIPER', 17, output, 700);
    txt(vx, 1210, 'VOLUME • A500K AUDIO', 20, ink, 800, 'middle');
    txt(vx, 1236, 'lug numbers as in bottom view', 16, muted, 600, 'middle');
    // Tone: CCW lug (3) on BUS, wiper (2) through 22 nF to GND, CW lug (1) unused.
    dot(tx2, railY, bus);
    poly(
        [
            [tx2, railY],
            [tx2, 930],
        ],
        bus
    );
    varRes(tx2, 930, 1090);
    term('TONE.CCW', tx2, 930);
    term('TONE.CW', tx2, 1090);
    term('TONE.WIPER', tx2 + 16, 1010);
    poly(
        [
            [tx2, 1090],
            [tx2, 1110],
        ],
        ground
    );
    add(`<g stroke="${ground}" stroke-width="3.5" stroke-linecap="round"><line x1="${tx2 - 10}" y1="1110" x2="${tx2 + 10}" y2="1130"/><line x1="${tx2 + 10}" y1="1110" x2="${tx2 - 10}" y2="1130"/></g>`);
    txt(tx2 + 26, 1124, '1 • CW unused', 17, ground, 700);
    txt(tx2 - 26, 925, '3 • CCW', 17, bus, 700, 'end');
    txt(tx2 + 26, 1000, '2 • WIPER', 17, output, 700);
    wiperHead(tx2 + 16, 1010, output);
    poly(
        [
            [tx2 + 16, 1010],
            [capX, 1010],
            [capX, 1058],
        ],
        output
    );
    netLabel(tx2 + 155, 1010, 'TONE-W', output, 92, 32, 17);
    line(capX - 20, 1058, capX + 20, 1058, ink, 4);
    line(capX - 20, 1078, capX + 20, 1078, ink, 4);
    term('C22.HOT', capX, 1058);
    term('C22.GND', capX, 1078);
    poly(
        [
            [capX, 1078],
            [capX, 1130],
        ],
        ground
    );
    groundMark(capX, 1130);
    txt(capX + 38, 1074, '22 nF', 20, ink, 800);
    txt(tx2, 1210, 'TONE • A500K AUDIO', 20, ink, 800, 'middle');
    txt(tx2, 1236, 'fed from BUS, not the wiper', 16, muted, 600, 'middle');
    // Jack
    rect(2150, 960, 190, 150, '#fbfdfe', ink, 8, 2.5);
    txt(2245, 990, 'OUTPUT JACK', 18, ink, 800, 'middle');
    circle(2150, 1010, 7, 'white', output, 3);
    circle(2150, 1085, 7, 'white', ground, 3);
    term('JACK.TIP', 2150, 1010);
    term('JACK.SLV', 2150, 1085);
    txt(2170, 1016, 'TIP', 17, output, 700);
    txt(2170, 1091, 'SLEEVE', 17, ground, 700);
    poly(
        [
            [2150, 1085],
            [2100, 1085],
            [2100, 1135],
        ],
        ground
    );
    groundMark(2100, 1135);
    txt(1295, 1330, 'No treble bleed • no loading resistors • no per-pickup controls.', 18, muted, 600);

    // Legend ------------------------------------------------------------------------------------------
    card(25, 780, 1220, 640, 'SHOWN STATE & CONVENTIONS');
    const L = (y, text, size = 20, weight = 650, color = ink) => txt(55, y, text, size, color, weight);
    L(878, 'Shown state S10: every lever UP — all pickups ON, both phase switches NORMAL.', 22, 750);
    L(912, 'Chain GND → N+ → M+ → B+ → BUS. The same circuit is checked in all 32 lever states (14 distinct, incl. mute).');
    L(966, 'LEVER UP = ON (E-x) / NORMAL (P-x)  •  LEVER DOWN = OFF / REVERSE', 20, 750);
    L(1000, 'ON: IN → pickup → OUT. OFF: IN joined to OUT through the enable switch; the pickup keeps one lead unconnected.');
    L(1034, 'NORMAL: hot lead toward volume (x-OUT), return lead toward ground (x-Y). REVERSE swaps them.');
    L(1088, 'All OFF: BUS joins GND — mute. Bridge is the fixed phase reference; it has no phase switch.', 20, 750);
    L(1142, 'Dot = junction  •  crossing without a dot = not connected  •  arch = wire passes over', 19, 650);
    L(1176, 'Dashed link between blades = the two ganged poles of one DPDT toggle.');
    L(1210, 'Dashed box around a coil = the pickup case. The case lead is separate from the coil and goes to GND.');
    L(1264, 'Switch contacts are functional, not lug numbers: identify each toggle’s lugs by continuity before wiring.', 19, 650, muted);
    L(1298, 'Net labels (N-Y, N-OUT, N-H, N-R, M-…, BUS, B-R, OUT, TONE-W) match reference.md §6 and the builder sheet.', 19, 650, muted);
    L(1346, 'Pickup lead identification (hot / return / case) comes from the supplied lead guide and a meter, not wire color alone.', 19, 650, muted);
    L(1388, `Netlist check: ${checks} checks across 32 switch states passed when this sheet was generated.`, 18, 500, muted);
    return s;
}

async function emit(sheet, base) {
    const svg = sheet.svg();
    writeFileSync(join(here, `${base}.svg`), svg);
    await sharp(Buffer.from(svg))
        .png()
        .toFile(join(here, `${base}.png`));
}

await emit(builderSheet(), 'wiring-reference');
const schematic = schematicSheet();
const drawingFailures = verifySchematic(schematic.svg());
if (drawingFailures.length) {
    console.error(`Schematic drawing does not match the netlist (${drawingFailures.length} problems):`);
    drawingFailures.slice(0, 20).forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
}
await emit(schematic, 'wiring-schematic');
console.log(`Netlist check OK (${checks} checks); schematic geometry matches the netlist. Generated wiring-reference and wiring-schematic (SVG + PNG).`);
