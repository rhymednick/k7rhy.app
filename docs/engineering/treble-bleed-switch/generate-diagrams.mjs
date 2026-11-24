// Generates the explainer schematics for the treble bleed pages (diagrams 5-7 and 9-12) as SVG and PNG into
// public/circuits/treble-bleed/. Every circuit drawing is checked with verifyDrawing against netlist.mjs (or, for the
// stock circuit and the volume-only explainers, against the permanent wiring written out below) before it is written.
//
//   node docs/engineering/treble-bleed-switch/generate-diagrams.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { runChecks } from './check-netlist.mjs';
import { NET_COLORS, capacitor, netLabel, pot, resistor, svgDoc, terminal, text, toggle3, wire } from './draw.mjs';
import { verifyDrawing } from './verify-drawings.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '../../../public/circuits/treble-bleed');

const WIDTH = 1200;
const BLEED_GLOW = '#ffb020';
const TONE_GLOW = '#2fb36d';
const CHANGE = '#e8590c';
const MUTED = '#4a5560';

const heading = (s) => text(s, 40, 54, { size: 32, weight: 700, anchor: 'start' });
const caption = (lines, y) => lines.map((s, i) => text(s, 40, y + i * 28, { size: 20, anchor: 'start' })).join('');
const glow = (pts, color = BLEED_GLOW, opacity = 0.5) => `<polyline points="${pts.map(([x, y]) => `${x},${y}`).join(' ')}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>`;
const badge = (n, x, y) => `<circle cx="${x}" cy="${y}" r="17" fill="${CHANGE}"/>${text(String(n), x, y + 7, { size: 20, weight: 700, fill: '#ffffff' })}`;
const groundSymbol = (x, y) => [0, 1, 2].map((i) => `<line x1="${x - 18 + i * 6}" y1="${y + i * 7}" x2="${x + 18 - i * 6}" y2="${y + i * 7}" stroke="${NET_COLORS.GND}" stroke-width="4" stroke-linecap="round"/>`).join('');

function pickup(x, y) {
    return `<rect x="${x}" y="${y}" width="170" height="80" rx="14" fill="#f6ecd6" stroke="#1a1a1a" stroke-width="3"/>${text('Pickup', x + 85, y + 48, { size: 22, weight: 700 })}`;
}

function doc(height, title, description, body) {
    return svgDoc(WIDTH, height, title, body).replace('</title>', `</title><desc>${description.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</desc>`);
}

// ---- Diagrams 5 and 6: the volume pot on its own, with and without a capacitor bleed ----

function volumeDrawing(withCap) {
    const parts = [];
    const nets = { BUS: ['VOL.IN'], OUT: ['VOL.W', 'JACK.TIP'], GND: ['VOL.GND', 'JACK.SLV'] };
    const terminals = ['VOL.IN', 'VOL.W', 'VOL.GND', 'JACK.TIP', 'JACK.SLV'];
    if (withCap) {
        nets.BUS.push('CAP.1');
        nets.OUT.push('CAP.2');
        terminals.push('CAP.1', 'CAP.2');
    }
    const bus = withCap
        ? [
              wire('BUS', [
                  [230, 170],
                  [440, 170],
                  [440, 540],
                  [450, 540],
              ]),
              wire(
                  'BUS',
                  [
                      [440, 410],
                      [516, 410],
                      [516, 330],
                  ],
                  { dot: [[440, 410]] }
              ),
          ].join('')
        : wire('BUS', [
              [230, 170],
              [440, 170],
              [440, 410],
              [516, 410],
              [516, 330],
          ]);
    parts.push(bus);
    parts.push(
        wire('OUT', [
            [560, 330],
            [560, 470],
            [980, 470],
        ])
    );
    if (withCap)
        parts.push(
            wire('OUT', [
                [550, 540],
                [560, 540],
                [560, 470],
            ])
        );
    parts.push(
        wire('GND', [
            [604, 330],
            [604, 420],
            [980, 420],
        ])
    );
    parts.push(
        wire('GND', [
            [145, 210],
            [145, 600],
            [1030, 600],
            [1030, 420],
            [980, 420],
        ])
    );
    parts.push(pickup(60, 130));
    parts.push(pot('Volume', 560, 330, { view: 'rear', ends: { left: 'VOL.IN', wiper: 'VOL.W', right: 'VOL.GND' } }));
    if (withCap) parts.push(capacitor('CAP', 500, 540, { ends: ['CAP.1', 'CAP.2'], label: 'Capacitor' }));
    parts.push(terminal('JACK.SLV', 980, 420), terminal('JACK.TIP', 980, 470));
    parts.push(text('Sleeve (ground)', 1052, 426, { anchor: 'start', size: 18, weight: 600 }), text('Tip (to the amp)', 1052, 476, { anchor: 'start', size: 18, weight: 600 }), text('Output jack', 980, 392, { size: 18, weight: 600 }));
    parts.push(netLabel('BUS', 340, 170), netLabel('OUT', 800, 470), netLabel('GND', 800, 420));
    const title = withCap ? 'The volume pot with a capacitor bleed' : 'The volume pot with no bleed';
    const lines = withCap ? ["A capacitor from the pot's input to its wiper gives the highs a way around the track.", 'Turn the knob down and the highs still get through. Blue is the signal in, red is the signal out, gray is ground.'] : ["The signal comes in at one end of the pot. The wiper takes the part I've asked for and sends it to the jack.", 'The other end goes to ground. Blue is the signal in, red is the signal out, gray is ground.'];
    const description = withCap ? 'A pickup feeds the input lug of a rear-view volume pot. The wiper goes to the output jack tip and the far lug goes to ground. A capacitor is connected from the pot input to the wiper, bypassing the pot track.' : 'A pickup feeds the input lug of a rear-view volume pot. The wiper goes to the output jack tip and the far lug goes to ground. There is no bleed.';
    const body = parts.join('');
    return { name: withCap ? '06-capacitor-bleed' : '05-stock-volume', svg: doc(720, title, description, heading(title) + body + caption(lines, 650)), checks: [{ svg: svgDoc(WIDTH, 720, title, body), opts: { terminals, nets } }] };
}

// ---- Diagram 7: three bleed variants side by side ----

function variantsDrawing() {
    const palette = { BUS: NET_COLORS.BUS, OUT: NET_COLORS.OUT, GND: NET_COLORS.GND, MID: NET_COLORS['TB-MID'] };
    const frames = [];
    const bodies = [];
    const nets = {};
    const terminals = [];
    const notes = [
        ['Capacitor only', ['Highs skip past the pot at every', 'volume, so the sound stays bright', 'as I turn down.']],
        ['Capacitor with a parallel resistor', ['The resistor lets some of the lows', 'through too, so the sound stays', 'fuller as I turn down.']],
        ['Capacitor with a series resistor', ['The resistor trims how much of the', 'highs skip past. Lipstick uses', 'this kind.']],
    ];
    const H = 530;
    notes.forEach(([label, lines], i) => {
        const n = i + 1;
        const px = 20 + 392 * i;
        const py = 100;
        const X = (x) => px + x;
        const Y = (y) => py + y;
        const bus = `BUS${n}`;
        const out = `OUT${n}`;
        const gnd = `GND${n}`;
        const mid = `MID${n}`;
        const rowEnd = i === 1 ? 480 : 430;
        const p = (name) => `P${n}.${name}`;
        frames.push(`<rect x="${px}" y="${py}" width="376" height="${H}" rx="14" fill="#ffffff" stroke="#c9d3de" stroke-width="2"/>`);
        frames.push(text(label, px + 188, py + 34, { size: 20, weight: 700 }));
        frames.push(
            caption(lines, py + H + 34)
                .replace(/x="40"/g, `x="${px + 6}"`)
                .replace(/font-size="20"/g, 'font-size="18"')
        );
        frames.push(text('From pickup', X(50), Y(70), { size: 16, weight: 600 }), text('To jack', X(320), Y(70), { size: 16, weight: 600 }));
        const w = (net, color, pts, dot) =>
            wire(
                net,
                pts.map(([x, y]) => [X(x), Y(y)]),
                { color, dot: dot?.map(([x, y]) => [X(x), Y(y)]) }
            );
        const parts = [];
        const potEnds = { left: p('IN'), wiper: p('W'), right: p('GND') };
        nets[bus] = [p('IN')];
        nets[out] = [p('W')];
        nets[gnd] = [p('GND')];
        terminals.push(p('IN'), p('W'), p('GND'));
        parts.push(
            w(gnd, palette.GND, [
                [234, 230],
                [234, 290],
            ]),
            groundSymbol(X(234), Y(296))
        );
        parts.push(
            w(
                bus,
                palette.BUS,
                [
                    [146, 230],
                    [146, 290],
                    [50, 290],
                ],
                [[50, 290]]
            )
        );
        parts.push(
            w(
                out,
                palette.OUT,
                [
                    [190, 230],
                    [190, 350],
                    [320, 350],
                ],
                [[320, 350]]
            )
        );
        const cap = (y, cx) => capacitor(p('C'), X(cx), Y(y), { ends: [p('C.1'), p('C.2')], label: 'Capacitor' });
        const res = (y, cx) => resistor(p('R'), X(cx), Y(y), { ends: [p('R.1'), p('R.2')], label: 'Resistor' });
        if (n === 1) {
            nets[bus].push(p('C.1'));
            nets[out].push(p('C.2'));
            terminals.push(p('C.1'), p('C.2'));
            parts.push(
                w(bus, palette.BUS, [
                    [50, 86],
                    [50, 430],
                    [135, 430],
                ]),
                w(out, palette.OUT, [
                    [320, 86],
                    [320, 430],
                    [235, 430],
                ])
            );
            parts.push(cap(430, 185));
        } else if (n === 2) {
            nets[bus].push(p('C.1'), p('R.1'));
            nets[out].push(p('C.2'), p('R.2'));
            terminals.push(p('C.1'), p('C.2'), p('R.1'), p('R.2'));
            parts.push(
                w(bus, palette.BUS, [
                    [50, 86],
                    [50, 480],
                    [135, 480],
                ]),
                w(
                    bus,
                    palette.BUS,
                    [
                        [50, 410],
                        [135, 410],
                    ],
                    [[50, 410]]
                )
            );
            parts.push(
                w(out, palette.OUT, [
                    [320, 86],
                    [320, 480],
                    [235, 480],
                ]),
                w(
                    out,
                    palette.OUT,
                    [
                        [320, 410],
                        [235, 410],
                    ],
                    [[320, 410]]
                )
            );
            parts.push(cap(410, 185), res(480, 185));
        } else {
            nets[bus].push(p('C.1'));
            nets[mid] = [p('C.2'), p('R.1')];
            nets[out].push(p('R.2'));
            terminals.push(p('C.1'), p('C.2'), p('R.1'), p('R.2'));
            parts.push(
                w(bus, palette.BUS, [
                    [50, 86],
                    [50, 430],
                    [65, 430],
                ]),
                w(mid, palette.MID, [
                    [165, 430],
                    [215, 430],
                ]),
                w(out, palette.OUT, [
                    [320, 86],
                    [320, 430],
                    [315, 430],
                ])
            );
            parts.push(cap(430, 115), res(430, 265));
        }
        parts.push(pot('Volume', X(190), Y(230), { view: 'rear', ends: potEnds }));
        bodies.push(parts.join(''));
    });
    const body = bodies.join('');
    const title = 'Three common treble bleeds';
    const total = 100 + H + 130;
    const description = 'Three small volume-pot schematics side by side. Each has a capacitor from the pot input to its wiper. The first is the capacitor alone, the second adds a resistor in parallel with the capacitor, and the third adds a resistor in series with it.';
    return { name: '07-bleed-variants', svg: doc(total, title, description, heading(title) + frames.join('') + body), checks: [{ svg: svgDoc(WIDTH, total, title, body), opts: { terminals, nets } }] };
}

// ---- The full volume and tone circuit, used by diagrams 9 to 12 ----
// Local coordinates have the signal rail at y = 0; oy moves the whole circuit down the page. kind 'stock' draws
// Lipstick as it is now (no switch, tone CCW on BUS, tone wiper to the 22 nF capacitor); kind 'new' draws the retrofit.

const ALL_TERMINALS = ['SEL.C', 'VOL.IN', 'VOL.W', 'VOL.GND', 'TONE.CW', 'TONE.W', 'TONE.CCW', 'C22.HOT', 'C22.GND', 'RB.1', 'RB.2', 'CB.1', 'CB.2', 'SW.C', 'SW.DIRECT', 'SW.OFF', 'SW.REACTIVE', 'JACK.TIP', 'JACK.SLV'];
const STOCK_TERMINALS = ALL_TERMINALS.filter((t) => !t.startsWith('SW.'));
const STOCK_NETS = {
    BUS: ['SEL.C', 'VOL.IN', 'TONE.CCW', 'CB.2'],
    OUT: ['VOL.W', 'JACK.TIP', 'RB.1'],
    'TB-MID': ['RB.2', 'CB.1'],
    'TONE-CAP': ['TONE.W', 'C22.HOT'],
    GND: ['VOL.GND', 'C22.GND', 'JACK.SLV'],
    OPEN: ['TONE.CW'],
};

const BLEED_PATH = {
    DIRECT: [
        [290, 290],
        [610, 290],
        [610, 190],
        [550, 100],
        [490, 100],
        [490, 0],
    ],
    REACTIVE: [
        [290, 290],
        [610, 290],
        [610, 190],
        [670, 100],
        [730, 100],
        [730, 230],
        [856, 230],
        [856, 180],
        [900, 180],
        [900, 280],
        [800, 280],
        [800, 0],
    ],
};
const TONE_PATH = [
    [800, 0],
    [800, 280],
    [900, 280],
    [900, 180],
    [944, 180],
    [944, 340],
    [944, 350],
];

function circuit({ oy, kind, mode = null, glowMode = null, changes = false }) {
    const P = (pts) => pts.map(([x, y]) => [x, y + oy]);
    const Y = (y) => y + oy;
    const stock = kind === 'stock';
    const under = [];
    const wires = [];
    const parts = [];
    const marks = [];

    // Signal rail (BUS) and its branches.
    if (stock) {
        wires.push(
            wire(
                'BUS',
                P([
                    [70, 0],
                    [1010, 0],
                    [1010, 230],
                    [944, 230],
                    [944, 180],
                ]),
                {
                    dot: P([
                        [190, 0],
                        [610, 0],
                    ]),
                }
            )
        );
        wires.push(
            wire(
                'BUS',
                P([
                    [610, 290],
                    [610, 0],
                ])
            )
        );
    } else {
        wires.push(
            wire(
                'BUS',
                P([
                    [70, 0],
                    [800, 0],
                    [800, 280],
                    [900, 280],
                    [900, 180],
                ]),
                {
                    dot: P([
                        [190, 0],
                        [490, 0],
                    ]),
                }
            )
        );
        wires.push(
            wire(
                'BUS',
                P([
                    [490, 0],
                    [490, 100],
                    [550, 100],
                ])
            )
        );
        wires.push(
            wire(
                'REACT',
                P([
                    [856, 180],
                    [856, 230],
                    [730, 230],
                    [730, 100],
                    [670, 100],
                ])
            )
        );
        wires.push(
            wire(
                'TB-SW',
                P([
                    [610, 290],
                    [610, 190],
                ])
            )
        );
    }
    wires.push(
        wire(
            'BUS',
            P([
                [190, 0],
                [190, 260],
                [246, 260],
                [246, 180],
            ])
        )
    );

    // Volume output, bleed chain, tone capacitor, ground.
    wires.push(
        wire(
            'OUT',
            P([
                [290, 180],
                [290, 400],
                [1100, 400],
            ]),
            { dot: P([[290, 290]]) }
        )
    );
    wires.push(
        wire(
            'OUT',
            P([
                [290, 290],
                [380, 290],
            ])
        )
    );
    wires.push(
        wire(
            'TB-MID',
            P([
                [480, 290],
                [510, 290],
            ])
        )
    );
    const capX = stock ? 900 : 944;
    wires.push(
        wire(
            'TONE-CAP',
            P([
                [capX, 180],
                [capX, 240],
            ])
        )
    );
    wires.push(
        wire(
            'GND',
            P([
                [334, 180],
                [334, 350],
                [1100, 350],
            ]),
            { dot: P([[capX, 350]]) }
        )
    );
    wires.push(
        wire(
            'GND',
            P([
                [capX, 340],
                [capX, 350],
            ])
        )
    );

    parts.push(resistor('RB', 430, Y(290), { ends: ['RB.1', 'RB.2'], label: '150 kΩ' }));
    parts.push(capacitor('CB', 560, Y(290), { ends: ['CB.1', 'CB.2'], label: '1 nF' }));
    parts.push(capacitor('C22', capX, Y(290), { orient: 'v', ends: ['C22.HOT', 'C22.GND'], label: '22 nF' }));
    parts.push(pot('Volume', 290, Y(180), { view: 'rear', ends: { left: 'VOL.IN', wiper: 'VOL.W', right: 'VOL.GND' } }));
    parts.push(pot('Tone', 900, Y(180), { view: 'rear', ends: { left: 'TONE.CW', wiper: 'TONE.W', right: 'TONE.CCW' } }));
    if (!stock) parts.push(toggle3('SW', 610, Y(100), mode));
    parts.push(terminal('SEL.C', 70, Y(0)), terminal('JACK.SLV', 1100, Y(350)), terminal('JACK.TIP', 1100, Y(400)));
    parts.push(text('Pickup selector', 30, Y(-26), { anchor: 'start', size: 18, weight: 600 }), text('Output jack', 1100, Y(318), { size: 18, weight: 600 }));
    parts.push(text('Sleeve', 1116, Y(356), { anchor: 'start', size: 16, weight: 600 }), text('Tip', 1116, Y(406), { anchor: 'start', size: 16, weight: 600 }));
    if (stock) parts.push(text('not used', 856, Y(252), { size: 16, weight: 600, fill: MUTED }));

    // Net labels.
    marks.push(netLabel('BUS', 330, Y(0)), netLabel('OUT', 1000, Y(400)), netLabel('GND', 1000, Y(350)));
    if (!stock) marks.push(netLabel('REACT', 730, Y(160)));

    // Highlights.
    if (glowMode === 'bleed') under.push(glow(P(BLEED_PATH[mode])));
    if (glowMode === 'tone') under.push(glow(P(TONE_PATH), TONE_GLOW));
    if (changes && !stock) {
        under.push(
            glow(
                P([
                    [800, 0],
                    [800, 280],
                    [900, 280],
                    [900, 180],
                ]),
                CHANGE,
                0.35
            ),
            glow(
                P([
                    [944, 180],
                    [944, 340],
                ]),
                CHANGE,
                0.35
            ),
            glow(
                P([
                    [856, 180],
                    [856, 230],
                    [730, 230],
                    [730, 100],
                    [670, 100],
                ]),
                CHANGE,
                0.35
            ),
            glow(
                P([
                    [610, 290],
                    [610, 190],
                ]),
                CHANGE,
                0.35
            )
        );
        marks.push(badge(1, 800, Y(140)), badge(2, 990, Y(210)), badge(3, 730, Y(118)), badge(4, 610, Y(240)));
    }
    if (changes && stock) {
        under.push(
            glow(
                P([
                    [1010, 0],
                    [1010, 230],
                    [944, 230],
                    [944, 180],
                ]),
                CHANGE,
                0.35
            ),
            glow(
                P([
                    [900, 180],
                    [900, 340],
                ]),
                CHANGE,
                0.35
            ),
            glow(
                P([
                    [610, 290],
                    [610, 0],
                ]),
                CHANGE,
                0.35
            )
        );
        marks.push(badge(1, 1010, Y(115)), badge(2, 850, Y(300)), badge(3, 800, Y(215)), badge(4, 610, Y(120)));
    }
    const body = under.join('') + wires.join('') + parts.join('') + marks.join('');
    return { body, terminals: stock ? STOCK_TERMINALS : ALL_TERMINALS };
}

function verifyCircuit(c, title, height, opts) {
    return { svg: svgDoc(WIDTH, height, title, c.body), opts: { terminals: c.terminals, ...opts } };
}

const TONE_NOTE = ['Tone pot from the back: the CW end is the Reactive feed (the wiper reaches it at full tone), the wiper rides on BUS,', 'and the CCW end goes through the 22 nF capacitor to ground (the wiper reaches it at tone 0).'];

// ---- Diagram 9 ----
function reactiveDrawing() {
    const title = 'The reactive bleed';
    const c = circuit({ oy: 110, kind: 'new', mode: 'REACTIVE', glowMode: 'bleed' });
    const lines = ["The bleed takes its signal from the tone pot's spare end. At full tone it acts like an ordinary bleed;", 'as I roll the tone back, the signal reaching the bleed fades with it. The glow marks the bleed path.', ...TONE_NOTE];
    const description = 'The full volume and tone circuit with the switch set to Reactive. The bleed runs from the volume output through a resistor and capacitor to the switch common, then through the Reactive throw to the tone pot CW end. The tone wiper is on the signal rail BUS. The bleed path is highlighted.';
    return { name: '09-reactive-bleed', svg: doc(740, title, description, heading(title) + c.body + caption(lines, 600)), checks: [verifyCircuit(c, title, 740, { expectedMode: 'REACTIVE' })] };
}

// ---- Diagram 10 ----
function threeModesDrawing() {
    const modes = [
        ['DIRECT', 'Direct', 'The bleed goes straight to the signal, like a regular treble bleed.', 'bleed'],
        ['OFF', 'Off', 'The bleed is disconnected, and the tone knob works like any tone knob.', 'tone'],
        ['REACTIVE', 'Reactive', 'The bleed is fed through the tone pot, so rolling the tone back eases the bleed off.', 'bleed'],
    ];
    const stride = 590;
    const checks = [];
    const panels = modes.map(([mode, name, line, glowMode], i) => {
        const py = 70 + stride * i;
        const c = circuit({ oy: py + 90, kind: 'new', mode, glowMode });
        checks.push(verifyCircuit(c, `${name} mode`, py + stride, { expectedMode: mode }));
        const rule = i > 0 ? `<line x1="40" y1="${py - 22}" x2="1160" y2="${py - 22}" stroke="#c9d3de" stroke-width="2"/>` : '';
        const note = mode === 'OFF' ? 'The glow shows the tone path, which works the same in every mode.' : 'The glow marks the bleed path.';
        return rule + text(name, 40, py + 34, { size: 30, weight: 700, anchor: 'start' }) + c.body + caption([line, note], py + 535);
    });
    const title = 'The three modes';
    const total = 70 + stride * 3 - 20;
    const description = 'The same circuit drawn three times with the switch in Direct, Off and Reactive. In Direct the bleed joins the signal rail BUS directly. In Off the bleed branch is open and the tone path is highlighted. In Reactive the bleed joins the tone pot CW end.';
    return { name: '10-three-modes', svg: doc(total, title, description, panels.join('')), checks };
}

// ---- Diagrams 11 and 12 ----
function beforeDrawing() {
    const title = "Before: Lipstick's volume and tone as they are now";
    const c = circuit({ oy: 110, kind: 'stock', changes: true });
    const lines = ["The signal reaches the tone pot at its CCW end, the wiper goes to the 22 nF capacitor, and the CW end isn't used.", 'The bleed runs from the signal rail to the output. Orange marks what the retrofit changes.'];
    const description = 'The stock Lipstick volume and tone circuit. The signal rail BUS feeds the volume pot input and the tone pot CCW end. The tone wiper goes to a 22 nF capacitor to ground. The tone CW end is unused. A fixed series capacitor and resistor bleed runs from BUS to the volume output. The wires that change in the retrofit are highlighted.';
    return { name: '11-before', svg: doc(700, title, description, heading(title) + c.body + caption(lines, 600)), checks: [verifyCircuit(c, title, 700, { nets: STOCK_NETS })] };
}

function afterDrawing() {
    const title = 'After: the same circuit with the switch';
    const c = circuit({ oy: 110, kind: 'new', mode: 'REACTIVE', changes: true });
    const lines = ['Four wires change, marked in orange:', '1. the signal feed moves to the tone wiper.   2. the 22 nF capacitor moves to the old hot end (CCW).', "3. a new wire runs from the unused CW end to the switch's Reactive lug.   4. the bleed's input end moves to the switch common."];
    const description = 'The Lipstick volume and tone circuit after the retrofit, drawn at the same scale and positions as the before drawing. The tone wiper is on BUS, the 22 nF capacitor is on the tone CCW end, the tone CW end runs to the switch Reactive lug, and the bleed capacitor connects to the switch common. The four changed wires are highlighted and numbered.';
    const doRevisit = circuit({ oy: 110, kind: 'new', mode: 'DIRECT', changes: true });
    return {
        name: '12-after',
        svg: doc(700, title, description, heading(title) + c.body + caption(lines, 590)),
        checks: [verifyCircuit(c, title, 700, { expectedMode: 'REACTIVE' }), verifyCircuit(doRevisit, title, 700, { expectedMode: 'DIRECT' })],
    };
}

export async function generateAll() {
    const written = [];
    const problems = [];
    const drawings = [volumeDrawing(false), volumeDrawing(true), variantsDrawing(), reactiveDrawing(), threeModesDrawing(), beforeDrawing(), afterDrawing()];
    mkdirSync(outDir, { recursive: true });
    for (const d of drawings) {
        for (const check of d.checks) {
            const result = verifyDrawing(check.svg, check.opts);
            for (const p of result.problems) problems.push(`${d.name}: ${p}`);
        }
        if (/unvalidated|pending|experimental|not yet tested|to be determined|TBD|\bwe\b|\bour\b/i.test(d.svg.replace(/<[^>]+>/g, ' '))) problems.push(`${d.name}: caption wording breaks the style rules`);
        const svgPath = join(outDir, `${d.name}.svg`);
        const pngPath = join(outDir, `${d.name}.png`);
        writeFileSync(svgPath, d.svg);
        await sharp(Buffer.from(d.svg), { density: 144 }).png().toFile(pngPath);
        written.push(svgPath, pngPath);
    }
    return { written, problems };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const { checks, failures } = runChecks();
    const { written, problems } = await generateAll();
    if (failures.length) console.error(`Netlist check failed (${failures.length} of ${checks}):\n  - ${failures.join('\n  - ')}`);
    if (problems.length) console.error(`Drawing problems (${problems.length}):\n  - ${problems.join('\n  - ')}`);
    if (failures.length || problems.length) process.exit(1);
    console.log(`Wrote ${written.length} files to ${outDir}; ${checks} netlist checks passed.`);
}
