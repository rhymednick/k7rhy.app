import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const components = join(here, '../../../public/wiring-diagrams/components');

// Inline the repository's established physical component drawings. Keeping the
// SVG self-contained makes this bench document viewable outside the website.
function component(name, x, y, width, height) {
    const source = readFileSync(join(components, `${name}.svg`), 'utf8');
    const viewBox = source.match(/viewBox="([^"]+)"/)?.[1];
    if (!viewBox) throw new Error(`Missing viewBox: ${name}`);
    const inner = source.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    return `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${viewBox}">${inner}</svg>`;
}

const parts = [];
const add = (svg) => parts.push(svg);
const path = (d, kind = 'hot') => add(`<path class="${kind}" d="${d}"/>`);
const dot = (x, y, kind = 'hot') => add(`<circle class="${kind}-dot" cx="${x}" cy="${y}" r="5"/>`);
const text = (x, y, label, kind = 'small', extra = '') => add(`<text class="${kind}" x="${x}" y="${y}" ${extra}>${label}</text>`);

add(`<svg xmlns="http://www.w3.org/2000/svg" width="2200" height="1550" viewBox="0 0 2200 1550" role="img" aria-labelledby="title desc">
<title id="title">Coupeville Velvet bench wiring diagram</title>
<desc id="desc">Physical-style reference using the repository's guitar component drawings. Outer neck and bridge pickups feed a three-way blade and push-pull volume. Nashville middle pickup feeds a B500K blend pot. The push-pull switches between blend and Nashville solo. A discrete five-way voice switch selects one of four resistor-capacitor shunts to ground.</desc>
<style>
  text { font-family: Arial, sans-serif; fill: #2f3438; }
  .title { font-size: 39px; font-weight: 700; }
  .section { font-size: 24px; font-weight: 700; }
  .label { font-size: 19px; font-weight: 700; }
  .small { font-size: 17px; }
  .note { font-size: 16px; fill: #59636b; }
  .hot { fill: none; stroke: #b83228; stroke-width: 4; stroke-linejoin: round; stroke-linecap: round; }
  .ground { fill: none; stroke: #2a7a38; stroke-width: 4; stroke-linejoin: round; stroke-linecap: round; }
  .hot-dot { fill: #b83228; } .ground-dot { fill: #2a7a38; }
  .rule { stroke: #c5cbd0; stroke-width: 2; }
  .callout { fill: #f4f6f7; stroke: #b8c0c6; stroke-width: 1.5; }
</style>
<rect width="2200" height="1550" fill="white"/>
<text id="heading" class="title" x="65" y="61">Coupeville Velvet · bench wiring</text>
<text class="note" x="67" y="91">Electrical layout using the K7RHY wiring component library · 2026-08-23 experiment · physical lug orientation must be checked</text>
<line class="rule" x1="65" y1="115" x2="2135" y2="115"/>
<text class="section" x="66" y="153">Pickups, controls, and output</text>`);

// Pickup artwork comes from the library. Its manufacturer-specific colored
// tails are masked; our two generic functional leads are then shown at each
// pickup so no unverified humbucker color code is implied.
add(component('humbucker', 80, 180, 220, 130));
add(component('filtertron', 80, 395, 200, 90));
add(component('humbucker', 80, 600, 220, 130));
add(`<rect x="259" y="181" width="43" height="128" fill="white"/><rect x="238" y="396" width="44" height="88" fill="white"/><rect x="259" y="601" width="43" height="128" fill="white"/>`);
text(82, 175, 'NECK · outer humbucker', 'label');
text(82, 391, 'MIDDLE · Retrotron Nashville', 'label');
text(82, 595, 'BRIDGE · outer humbucker', 'label');
path('M259 217 H430 V270 H634 V325');
path('M238 425 H400 V740 H850 V770 H957 V745');
path('M259 637 H450 V550 H634 V515');
path('M259 266 H350 V790 M238 454 H365 V790 M259 685 H380 V790', 'ground');
for (const [x, y] of [[259,217],[238,425],[259,637]]) dot(x,y);
for (const [x, y] of [[259,266],[238,454],[259,685]]) dot(x,y,'ground');

// The blade artwork has two visible C/IN pairs. In this functional example the
// commons are joined; actual 3-way switch lug orientation is meter-verified.
add(component('3way-blade', 480, 320, 220, 200));
text(642, 306, 'N IN', 'small');
text(642, 503, 'B IN', 'small');
text(456, 310, 'C', 'small');
path('M546 325 H465 V540 H780 V555 H968 V445 M546 515 H465');
dot(634,325); dot(634,515); dot(546,325); dot(546,515);
// The bridge lead crosses the joined-selector output with no junction.
add('<path d="M634 530 V550" stroke="white" stroke-width="11" fill="none"/><path class="hot" d="M634 530 V550"/>');
// The middle lead passes over the bridge lead on its way to its own pot.
add('<path d="M400 627 V647" stroke="white" stroke-width="11" fill="none"/><path class="hot" d="M400 627 V647"/>');
text(482, 582, '3-way: 1 bridge · 2 both · 3 neck', 'note');

// Push-pull pot drawing: P1 C/NC/NO = x952/977/1002; P2 C/NC/NO =
// x1018/1043/1068. NC is the DOWN throw in this drawing; NO is UP.
add(component('push-pull-pot', 930, 200, 160, 245));
text(1190, 321, 'OUTER VOLUME · push-pull DPDT', 'label');
text(904, 475, 'IN', 'small'); text(997, 475, 'WIPER', 'small'); text(1062, 475, 'LOW', 'small');
// Pot terminals in the source artwork: x968 / 1010 / 1052 at y440.
// Selector → input; grounded low; wiper → pole 1 common.
path('M1010 440 V510 H865 V170 H952 V205');
path('M1052 440 V790', 'ground');
path('M977 205 V165 H1570 V420');
text(922, 137, 'P1 C ← wiper · DOWN/NC → bus · UP/NO open', 'note');
dot(968,440); dot(1010,440); dot(1052,440,'ground');
dot(952,205); dot(977,205);

// Nashville blend/solo pot. At 10 the wiper meets IN; at 0 it meets THIRD.
add(component('pot', 930, 600, 130, 145));
text(1190, 610, 'NASHVILLE · B500K linear', 'label');
text(923, 767, 'IN', 'small'); text(979, 767, 'WIPER', 'small'); text(1044, 767, 'THIRD', 'small');
path('M995 745 V700 H1520 V420');
path('M1033 745 H1110 V195 H1018 V205');
path('M1068 205 H1170 V790', 'ground');
text(1178, 217, 'P2 C ← third lug', 'note');
text(1178, 243, 'DOWN/NC open · UP/NO ground', 'note');
dot(957,745); dot(995,745); dot(1033,745);
dot(1018,205); dot(1068,205,'ground');
// White underpass at the crossing of the Nashville wiper and third-lug wire.
add('<path d="M1110 690 V710" stroke="white" stroke-width="11" fill="none"/><path class="hot" d="M1110 690 V710"/>');

// Combined bus, jack, and the common return net.
path('M1570 295 H1940 V420 H1850');
dot(1570,420); dot(1520,420);
text(1330, 390, 'COMBINED SIGNAL BUS', 'label');
add(component('output-jack', 1720, 360, 130, 120));
text(1709, 340, 'MONO OUTPUT JACK', 'label');
path('M1775 480 V790', 'ground');
path('M80 790 H2040', 'ground');
dot(350,790,'ground'); dot(365,790,'ground'); dot(380,790,'ground');
dot(1052,790,'ground'); dot(1170,790,'ground'); dot(1775,790,'ground');
text(85, 817, 'GROUND / SHIELD RETURN: pickup grounds · pot casings · outer-volume LOW · P2 UP · jack sleeve', 'note');

add(`<line class="rule" x1="65" y1="865" x2="2135" y2="865"/>`);
text(66, 908, 'Five-way global voice selector · one discrete 1P5T pole of a 4P5T switch', 'section');
text(67, 936, 'This voice network is a shunt from the combined bus to ground; the audio path to the jack does not pass through an RC pair.', 'note');

// The library's "super-switch.svg" incorrectly calls a 12-lug drawing 4P5T.
// The 24-lug mega-switch drawing has the correct C/1/2/3/4/5 contacts; use
// its P4 right-hand pole as the illustrative five-way voice-switch pinout.
add(component('mega-switch', 300, 950, 512, 480));
text(320, 1470, '24-lug 4P5T example · only right-hand pole P4 wired', 'note');
// P4 common (x804,y1088) is fed from the combined signal bus.
path('M1570 420 V990 H850 V1088 H804');
// The voice-feed wire crosses the shared ground bus without joining it.
add('<path d="M1570 780 V800" stroke="white" stroke-width="11" fill="none"/><path class="hot" d="M1570 780 V800"/>');
dot(804,1088);
text(868, 1077, 'COMMON from bus', 'small');
text(837, 1127, 'P1 → no connection (bypass)', 'small');
path('M804 1128 H828'); dot(828,1128);

// P2–P5 right-hand throws, each through its own resistor and capacitor in
// series. Their far ends meet the green common-ground return.
const branches = [
    { position: 2, y: 1169, r: '470 kΩ', c: '2.2 nF' },
    { position: 3, y: 1211, r: '220 kΩ', c: '4.7 nF' },
    { position: 4, y: 1251, r: '100 kΩ', c: '10 nF' },
    { position: 5, y: 1292, r: '47 kΩ', c: '22 nF' },
];
for (const branch of branches) {
    const { position, y, r, c } = branch;
    path(`M804 ${y} H1040 M1115 ${y} H1220`);
    add(component('resistor', 1040, y - 15, 75, 30));
    add(component('capacitor', 1220, y - 17, 60, 34));
    path(`M1280 ${y} H1500`, 'ground');
    text(934, y - 7, `P${position}`, 'label');
    text(1131, y - 7, r, 'small');
    text(1300, y - 7, c, 'small');
    dot(804,y); dot(1500,y,'ground');
}
path('M1500 1169 V1350', 'ground');
add(component('ground', 1473, 1350, 55, 50));
text(1540, 1381, 'Common ground · RC ends joined', 'small');

add(`<line class="rule" x1="65" y1="1492" x2="2135" y2="1492"/>`);
text(67, 1521, 'BENCH REFERENCE · functional 3-way pads and switch orientation require continuity checks · no treble bleed or continuous tone pot · body fit unverified', 'note');
add('</svg>');

writeFileSync(join(here, 'wiring-diagram.svg'), parts.join('\n') + '\n');
console.log('Generated wiring-diagram.svg from the repository component artwork.');
