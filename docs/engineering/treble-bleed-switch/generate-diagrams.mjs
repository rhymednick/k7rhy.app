// Generates the explainer drawings for the treble bleed pages (diagrams 1-14) as SVG and PNG into
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
    const lines = withCap ? ["A capacitor from the pot's input to its wiper gives the highs a way around the track.", 'Turn the knob down and the highs still get through. Blue is the signal rail from the pickups (labelled BUS), red is the output (OUT), gray is ground (GND).'] : ["The signal comes in at one end of the pot. The wiper takes the part I've asked for and sends it to the jack.", 'The other end goes to ground. Blue is the signal rail from the pickups (labelled BUS), red is the output (OUT), gray is ground (GND).'];
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

// Where a wire has to cross another, it hops over it with a small bump so it cannot be read as a join. The bump is part of
// the same polyline, so the verifier still sees one wire; a crossing without a dot is never a connection.
function hopped(pts, hops) {
    const out = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
        const [ax, ay] = pts[i];
        const [bx, by] = pts[i + 1];
        const s = Math.sign(bx - ax);
        const here = ay === by ? hops.filter(([hx, hy]) => hy === ay && (hx - ax) * (hx - bx) < 0).sort((p, q) => s * (p[0] - q[0])) : [];
        for (const [hx, hy] of here) out.push([hx - s * 10, hy], [hx - s * 5, hy - 7], [hx, hy - 10], [hx + s * 5, hy - 7], [hx + s * 10, hy]);
        out.push([bx, by]);
    }
    return out;
}

const distToSegment = ([px, py], [x1, y1], [x2, y2]) => {
    const len2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / len2));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
};

// Collected while drawing: glow vertices that do not sit on a drawn wire or a terminal.
const geometryProblems = [];

// Every glow vertex must lie on a drawn wire (geo: lists of wire vertices) or at a terminal, in the same coordinates.
function checkGlow(label, pieces, geo, terminalPoints) {
    for (const piece of pieces) {
        for (const v of piece) {
            const onWire = geo.some((pts) => pts.some((p, i) => i > 0 && distToSegment(v, pts[i - 1], p) <= 0.6));
            const atTerminal = terminalPoints.some(([x, y]) => Math.hypot(x - v[0], y - v[1]) <= 0.6);
            if (!onWire && !atTerminal) geometryProblems.push(`${label}: glow vertex ${v} is not on a drawn wire or terminal`);
        }
    }
}

// Glow pieces (lists of vertices in local coordinates). Every vertex must lie on a drawn wire or a terminal; circuit() checks it.
const GLOW_TAP = [
    [290, 290],
    [324, 290],
];
const BLEED_GLOW_PIECES = {
    DIRECT: [
        GLOW_TAP,
        [
            [344, 290],
            [610, 290],
            [610, 190],
            [550, 100],
            [490, 100],
            [490, 0],
        ],
    ],
    // Ends on the tone wiper, which is on BUS.
    REACTIVE: [
        GLOW_TAP,
        [
            [344, 290],
            [610, 290],
            [610, 190],
            [670, 100],
            [730, 100],
            [730, 230],
            [790, 230],
        ],
        [
            [810, 230],
            [856, 230],
            [856, 180],
            [900, 180],
        ],
    ],
};
const TONE_GLOW_PIECES = [
    [
        [800, 0],
        [800, 280],
        [900, 280],
        [900, 180],
        [944, 180],
        [944, 340],
        [944, 350],
    ],
];
const CHANGE_GLOW_PIECES = {
    new: [
        [
            [800, 0],
            [800, 280],
            [900, 280],
            [900, 180],
        ],
        [
            [944, 180],
            [944, 340],
        ],
        [
            [856, 180],
            [856, 230],
            [810, 230],
        ],
        [
            [790, 230],
            [730, 230],
            [730, 100],
            [670, 100],
        ],
        [
            [610, 290],
            [610, 190],
        ],
        [
            [490, 0],
            [490, 100],
            [550, 100],
        ],
    ],
    stock: [
        [
            [1010, 0],
            [1010, 230],
            [944, 230],
            [944, 180],
        ],
        [
            [900, 180],
            [900, 340],
        ],
        [
            [610, 290],
            [610, 0],
        ],
    ],
};

function circuit({ oy, kind, mode = null, glowMode = null, changes = false, badges = false, rest = false, label = kind }) {
    const P = (pts) => pts.map(([x, y]) => [x, y + oy]);
    const Y = (y) => y + oy;
    const stock = kind === 'stock';
    const capX = stock ? 900 : 944;
    const under = [];
    const wires = [];
    const parts = [];
    const marks = [];
    const geo = [];
    const w = (net, pts, opts = {}) => {
        geo.push(pts);
        wires.push(wire(net, P(pts), { ...opts, dot: opts.dot ? P(opts.dot) : undefined }));
    };

    // Signal rail (BUS) and its branches.
    if (stock) {
        w(
            'BUS',
            [
                [70, 0],
                [1010, 0],
                [1010, 230],
                [944, 230],
                [944, 180],
            ],
            {
                dot: [
                    [190, 0],
                    [610, 0],
                ],
            }
        );
        w('BUS', [
            [610, 290],
            [610, 0],
        ]);
    } else {
        w(
            'BUS',
            [
                [70, 0],
                [800, 0],
            ],
            {
                dot: [
                    [190, 0],
                    [490, 0],
                ],
            }
        );
        w('BUS', [
            [800, 0],
            [800, 280],
            [900, 280],
            [900, 180],
        ]);
        w('BUS', [
            [490, 0],
            [490, 100],
            [550, 100],
        ]);
        w(
            'REACT',
            hopped(
                [
                    [856, 180],
                    [856, 230],
                    [730, 230],
                    [730, 100],
                    [670, 100],
                ],
                [[800, 230]]
            )
        );
        w('TB-SW', [
            [610, 290],
            [610, 190],
        ]);
    }
    w('BUS', [
        [190, 0],
        [190, 260],
        [246, 260],
        [246, 180],
    ]);

    // Volume output, bleed chain, tone capacitor, ground. The bleed chain hops over the volume pot's ground wire.
    w(
        'OUT',
        [
            [290, 180],
            [290, 400],
            [1100, 400],
        ],
        { dot: [[290, 290]] }
    );
    w(
        'OUT',
        hopped(
            [
                [290, 290],
                [380, 290],
            ],
            [[334, 290]]
        )
    );
    w('TB-MID', [
        [480, 290],
        [510, 290],
    ]);
    w('TONE-CAP', [
        [capX, 180],
        [capX, 240],
    ]);
    w(
        'GND',
        [
            [334, 180],
            [334, 350],
            [1100, 350],
        ],
        { dot: [[capX, 350]] }
    );
    w('GND', [
        [capX, 340],
        [capX, 350],
    ]);

    parts.push(resistor('RB', 430, Y(290), { ends: ['RB.1', 'RB.2'], label: '150 kΩ' }));
    parts.push(capacitor('CB', 560, Y(290), { ends: ['CB.1', 'CB.2'], label: '1 nF' }));
    parts.push(capacitor('C22', capX, Y(290), { orient: 'v', ends: ['C22.HOT', 'C22.GND'], label: '22 nF' }));
    parts.push(pot('Volume', 290, Y(180), { view: 'rear', ends: { left: 'VOL.IN', wiper: 'VOL.W', right: 'VOL.GND' } }));
    parts.push(pot('Tone', 900, Y(180), { view: 'rear', ends: { left: 'TONE.CW', wiper: 'TONE.W', right: 'TONE.CCW' } }));
    if (!stock) parts.push(toggle3('SW', 610, Y(100), mode, { rest }));
    parts.push(terminal('SEL.C', 70, Y(0)), terminal('JACK.SLV', 1100, Y(350)), terminal('JACK.TIP', 1100, Y(400)));
    parts.push(text('Pickup selector', 30, Y(-26), { anchor: 'start', size: 18, weight: 600 }), text('Output jack', 1100, Y(318), { size: 18, weight: 600 }));
    parts.push(text('Sleeve', 1116, Y(356), { anchor: 'start', size: 16, weight: 600 }), text('Tip', 1116, Y(406), { anchor: 'start', size: 16, weight: 600 }));
    if (stock) parts.push(text('not used', 856, Y(252), { size: 16, weight: 600, fill: MUTED }));

    // Net labels.
    marks.push(netLabel('BUS', 330, Y(0)), netLabel('OUT', 1000, Y(400)), netLabel('GND', 1000, Y(350)));
    if (!stock) marks.push(netLabel('REACT', 730, Y(160)));

    // Highlights. Each piece is checked against the drawn wires and terminals.
    const terminalPoints = [
        [246, 180],
        [290, 180],
        [334, 180],
        [856, 180],
        [900, 180],
        [944, 180],
        [550, 100],
        [610, 100],
        [670, 100],
        [610, 190],
        [380, 290],
        [480, 290],
        [510, 290],
        [610, 290],
        [capX, 240],
        [capX, 340],
    ];
    const pieces = [];
    if (glowMode === 'bleed') pieces.push([BLEED_GLOW_PIECES[mode], BLEED_GLOW, 0.5]);
    if (glowMode === 'tone') pieces.push([TONE_GLOW_PIECES, TONE_GLOW, 0.5]);
    if (changes) pieces.push([CHANGE_GLOW_PIECES[stock ? 'stock' : 'new'], CHANGE, 0.35]);
    for (const [list, color, opacity] of pieces) {
        checkGlow(label, list, geo, terminalPoints);
        for (const piece of list) under.push(glow(P(piece), color, opacity));
    }
    if ((changes || badges) && !stock) marks.push(badge(1, 800, Y(140)), badge(2, 990, Y(210)), badge(3, 730, Y(118)), badge(4, 610, Y(240)), badge(5, 490, Y(55)));
    if (changes && stock) marks.push(badge(1, 1010, Y(115)), badge(2, 850, Y(300)), badge(3, 800, Y(215)), badge(4, 610, Y(120)));
    const body = under.join('') + wires.join('') + parts.join('') + marks.join('');
    return { body, terminals: stock ? STOCK_TERMINALS : ALL_TERMINALS };
}

function verifyCircuit(c, title, height, opts) {
    return { svg: svgDoc(WIDTH, height, title, c.body), opts: { terminals: c.terminals, ...opts } };
}

const TONE_NOTE = ['Tone pot from the back: the CW end is the Reactive feed (the wiper reaches it at full tone),', 'the wiper rides on the signal rail (BUS), and the CCW end goes through the 22 nF capacitor', 'to ground (the wiper reaches it at tone 0).'];

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
    const lines = ['Orange marks every wire that moves or is new:', '1. The signal feed moves to the tone wiper.', '2. The 22 nF capacitor moves to the old hot end (CCW).', "3. A new wire runs from the unused CW end to the switch's Reactive lug.", "4. The bleed's input end moves to the switch common.", "5. A new wire runs from the signal rail to the switch's Direct lug."];
    const description = 'The Lipstick volume and tone circuit after the retrofit, drawn at the same scale and positions as the before drawing. The tone wiper is on BUS, the 22 nF capacitor is on the tone CCW end, the tone CW end runs to the switch Reactive lug, and the bleed capacitor connects to the switch common. The five changed or new wires are highlighted and numbered.';
    const doRevisit = circuit({ oy: 110, kind: 'new', mode: 'DIRECT', changes: true });
    return {
        name: '12-after',
        svg: doc(800, title, description, heading(title) + c.body + caption(lines, 590)),
        checks: [verifyCircuit(c, title, 700, { expectedMode: 'REACTIVE' }), verifyCircuit(doRevisit, title, 700, { expectedMode: 'DIRECT' })],
    };
}

// ---- Diagrams 1 to 4, 8, 13 and 14: concept and reference drawings ----

const frame = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#ffffff" stroke="#c9d3de" stroke-width="2"/>`;
function arrow(x1, y1, x2, y2, color = '#1a1a1a', width = 4) {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const head = [
        [x2, y2],
        [x2 - 16 * Math.cos(a - 0.45), y2 - 16 * Math.sin(a - 0.45)],
        [x2 - 16 * Math.cos(a + 0.45), y2 - 16 * Math.sin(a + 0.45)],
    ];
    const tip = [x2 - 10 * Math.cos(a), y2 - 10 * Math.sin(a)];
    return `<line x1="${x1}" y1="${y1}" x2="${tip[0]}" y2="${tip[1]}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/><polygon points="${head.map((p) => p.join(',')).join(' ')}" fill="${color}"/>`;
}
const lines = (list, x, y, opts = {}) => list.map((s, i) => text(s, x, y + i * (opts.gap ?? 26), { size: 20, ...opts })).join('');

// Diagram 1: the signal chain.
function signalChainDrawing() {
    const title = 'The signal chain';
    const stages = [
        ['Pickup', '#f6ecd6', ['Turns string motion', 'into a tiny electrical', 'signal.']],
        ['Volume pot', '#e8ecf0', ['Lets through as much', 'of that signal as', 'I ask for.']],
        ['Cable', '#e3f0e6', ['Carries the signal', 'to the amp.']],
        ['Amp', '#f6e3e0', ['Makes it loud', 'enough to hear.']],
    ];
    const parts = stages.map(([name, fill, job], i) => {
        const x = 40 + i * 296;
        const box = `<rect x="${x}" y="140" width="230" height="110" rx="16" fill="${fill}" stroke="#1a1a1a" stroke-width="3"/>${text(name, x + 115, 205, { size: 28, weight: 700 })}`;
        const link = i < 3 ? arrow(x + 238, 195, x + 288, 195, NET_COLORS.BUS) : '';
        return box + link + lines(job, x + 115, 292);
    });
    const caption1 = ['The signal runs one way: from the pickup, through the volume pot, along the cable and into the amp.', 'Everything on the next pages happens in two places: the volume pot and the cable.'];
    const description = 'Four labelled boxes joined by arrows: Pickup, Volume pot, Cable, Amp. Under each box is one line about its job.';
    return { name: '01-signal-chain', svg: doc(480, title, description, heading(title) + parts.join('') + caption(caption1, 410)), checks: [] };
}

// Diagram 2: the volume pot, from the back and as a track with a wiper.
function volumePotDrawing() {
    const title = 'What the volume pot is';
    const rear = pot('Volume', 300, 330, { view: 'rear', ends: { left: 'VOL.IN', wiper: 'VOL.W', right: 'VOL.GND' } });
    const rows = [
        ['CW (left): the input end,', 'where the signal comes in'],
        ['Wiper (center): the output,', 'which goes to the amp'],
        ['CCW (right): the ground end,', 'which goes to ground'],
    ];
    const key = rows.map(([a, b], i) => text(a, 300, 410 + i * 54, { size: 20, weight: 700 }) + text(b, 300, 436 + i * 54, { size: 20 })).join('');
    const zig = [];
    for (let i = 0; i <= 12; i++) zig.push(`${700 + i * 30},${330 + (i === 0 || i === 12 ? 0 : i % 2 ? -14 : 14)}`);
    const track = `<polyline points="${zig.join(' ')}" fill="none" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>` + [700, 1060].map((x) => `<circle cx="${x}" cy="330" r="7" fill="#ffffff" stroke="#1a1a1a" stroke-width="3"/>`).join('');
    const wiper = arrow(880, 250, 880, 314) + text('Wiper', 880, 200, { size: 22, weight: 700 }) + text('to the amp', 880, 228, { size: 20 });
    const ends = text('Input end', 650, 392, { size: 20, weight: 700, anchor: 'start' }) + text('signal from the pickups', 650, 418, { size: 20, anchor: 'start' }) + text('Ground end', 1130, 392, { size: 20, weight: 700, anchor: 'end' }) + text('to ground', 1130, 418, { size: 20, anchor: 'end' });
    const trackLabel = text('The track', 880, 470, { size: 22, weight: 700 }) + lines(['A strip of resistive material.', 'The wiper slides along it as I turn the knob.'], 880, 498);
    const body = frame(40, 90, 520, 490) + text('The pot from the back', 300, 124, { size: 22, weight: 700 }) + rear + key + frame(620, 90, 540, 490) + text('The same pot as a picture', 890, 124, { size: 22, weight: 700 }) + track + wiper + ends + trackLabel;
    const cap = ['A volume pot is a track with a sliding contact on it, the wiper. The signal comes in at one end and the other end goes to ground.', 'The wiper hands the amp the share I have chosen: toward the input end is louder, toward the ground end is quieter.'];
    const description = 'Left, a volume pot seen from the back with three lugs labelled CW, Wiper and CCW. Right, the same pot as a resistive track with a wiper arrow, the input end on the left and the ground end on the right.';
    return {
        name: '02-volume-pot',
        svg: doc(700, title, description, heading(title) + body + caption(cap, 630)),
        checks: [{ svg: svgDoc(WIDTH, 700, title, rear), opts: { terminals: ['VOL.IN', 'VOL.W', 'VOL.GND'] } }],
    };
}

// Diagram 3: pot resistance and cable capacitance as a filter.
function potAndCableDrawing() {
    const title = 'Why turning down dulls the sound';
    const y = 300;
    const parts = [];
    parts.push(
        wire('BUS', [
            [210, y],
            [350, y],
        ]),
        wire(
            'BUS',
            [
                [450, y],
                [960, y],
            ],
            { dot: [[680, y]] }
        ),
        wire('BUS', [
            [680, y],
            [680, 350],
        ]),
        wire('GND', [
            [680, 450],
            [680, 480],
        ])
    );
    parts.push(pickup(40, y - 40), resistor('RES', 400, y, { label: 'Volume pot' }), capacitor('CAB', 680, 400, { orient: 'v', label: 'Cable' }), groundSymbol(680, 486));
    parts.push(`<rect x="960" y="${y - 40}" width="190" height="80" rx="16" fill="#f6e3e0" stroke="#1a1a1a" stroke-width="3"/>${text('Amp', 1055, y + 10, { size: 26, weight: 700 })}`);
    parts.push(text('Resistance', 400, 150, { size: 22, weight: 700 }), lines(['The part of the track the', 'signal has to push through.', 'Turning down from full adds more.'], 400, 176, { gap: 24, size: 18 }));
    parts.push(arrow(800, 360, 800, 440, CHANGE), text('Highs drain away here', 830, 396, { size: 20, anchor: 'start', weight: 700, fill: CHANGE }), text('The cable acts like a tiny', 830, 424, { size: 18, anchor: 'start' }), text('capacitor to ground.', 830, 448, { size: 18, anchor: 'start' }));
    parts.push(arrow(740, 250, 930, 250, '#16803c'), text('Lows carry on to the amp', 835, 230, { size: 20, weight: 700, fill: '#16803c' }));
    const cap = ['Together the pot and the cable act as a filter: lows get through, highs drain away to ground.', 'As I turn down from full, more resistance sits ahead of the cable, and more of the highs drain away.', 'Here the pot is drawn as the resistance the signal passes through before it reaches the cable.'];
    const description = 'A pickup feeds a resistor labelled Volume pot. After the resistor the signal wire continues to an amp, and a capacitor labelled Cable connects from that wire to ground. Highs drain away through the capacitor and lows carry on to the amp.';
    return { name: '03-pot-and-cable', svg: doc(690, title, description, heading(title) + parts.join('') + caption(cap, 580)), checks: [] };
}

// Diagram 4: a sketch of brightness against volume position. The only non-circuit drawing: no numbers, no data.
function brightnessSketchDrawing() {
    const title = 'How a bleed changes the sound as I turn down';
    const curves = [
        {
            name: 'No bleed',
            color: '#4a5560',
            p: [
                [160, 500],
                [520, 495],
                [780, 420],
                [960, 170],
            ],
            t: 0.42,
            dy: 34,
        },
        {
            name: 'Reactive bleed',
            color: '#16803c',
            p: [
                [160, 415],
                [470, 395],
                [760, 320],
                [960, 170],
            ],
            t: 0.45,
            dy: 46,
        },
        {
            name: 'Fixed bleed',
            color: CHANGE,
            p: [
                [160, 330],
                [420, 300],
                [740, 230],
                [960, 170],
            ],
            t: 0.42,
            dy: -18,
        },
    ];
    const at = ([[x0, y0], [x1, y1], [x2, y2], [x3, y3]], t) => {
        const u = 1 - t;
        return [u ** 3 * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t ** 3 * x3, u ** 3 * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t ** 3 * y3];
    };
    const paths = curves
        .map(({ name, color, p, t, dy }) => {
            const [x, y] = at(p, t);
            return `<path d="M${p[0].join(',')} C${p[1].join(',')} ${p[2].join(',')} ${p[3].join(',')}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"/>${text(name, x, y + dy, { size: 22, weight: 700, fill: color, halo: true })}`;
        })
        .join('');
    const axes = arrow(160, 520, 990, 520, '#1a1a1a', 3) + arrow(160, 520, 160, 130, '#1a1a1a', 3);
    const labels = text('Turned down', 160, 556, { size: 20, anchor: 'start' }) + text('Volume knob position', 575, 556, { size: 20, weight: 700 }) + text('Full up', 990, 556, { size: 20, anchor: 'end' }) + text('Brighter', 146, 150, { size: 20, anchor: 'end' }) + text('Duller', 146, 524, { size: 20, anchor: 'end' }) + `<text x="52" y="337" font-size="20" font-weight="700" text-anchor="middle" transform="rotate(-90 52 337)" font-family="Inter, Helvetica, Arial, sans-serif" fill="#1a1a1a">Brightness</text>`;
    const note = text('Illustration, not a measurement', 40, 92, { size: 24, weight: 700, anchor: 'start', fill: CHANGE });
    const cap = ['Without a bleed, the highs fade fast as I turn the volume down.', 'A fixed bleed keeps more of them, but it behaves the same wherever the tone knob is.', 'A reactive bleed keeps the highs too, and then follows the tone knob: roll the tone back and the bleed eases off.', 'The shapes only show the idea.'];
    const description = 'A hand-drawn style sketch with no numbers. The horizontal axis is volume knob position from turned down to full up and the vertical axis is brightness from duller to brighter. Three curves, no bleed, reactive bleed and fixed bleed, all meet at full volume. The no bleed curve is lowest at low volume, the fixed bleed curve is highest and the reactive bleed curve sits between. The drawing is labelled Illustration, not a measurement.';
    return { name: '04-brightness-sketch', svg: doc(730, title, description, heading(title) + note + axes + paths + labels + caption(cap, 610)), checks: [] };
}

// Diagram 8: the tone pot's three lugs and what each does in the new circuit.
function tonePotDrawing() {
    const title = "The tone pot's three lugs";
    const parts = [];
    parts.push(
        wire('REACT', [
            [556, 260],
            [556, 380],
            [240, 380],
        ]),
        wire('BUS', [
            [600, 260],
            [600, 520],
        ]),
        wire('TONE-CAP', [
            [644, 260],
            [644, 320],
            [850, 320],
            [850, 350],
        ]),
        wire('GND', [
            [850, 450],
            [850, 490],
        ])
    );
    parts.push(pot('Tone', 600, 260, { view: 'rear', ends: { left: 'TONE.CW', wiper: 'TONE.W', right: 'TONE.CCW' } }));
    parts.push(terminal('SW.REACTIVE', 240, 380), terminal('SEL.C', 600, 520));
    parts.push(capacitor('C22', 850, 400, { orient: 'v', ends: ['C22.HOT', 'C22.GND'], label: '22 nF' }), groundSymbol(850, 496));
    parts.push(netLabel('REACT', 330, 380), netLabel('BUS', 600, 440));
    parts.push(text('CW end: the Reactive feed', 520, 290, { size: 20, weight: 700, anchor: 'end', halo: true }), lines(['The wiper reaches it at full tone.', "It goes to the switch's Reactive lug."], 520, 318, { anchor: 'end', size: 18, halo: true, gap: 24 }));
    parts.push(text("Switch's Reactive lug", 240, 420, { size: 20, weight: 700 }), text('(leads on to the bleed)', 240, 446, { size: 18 }));
    parts.push(text('Wiper: rides on the main', 570, 480, { size: 20, weight: 700, anchor: 'end' }), text('signal wire from the pickups.', 570, 506, { size: 20, anchor: 'end' }));
    parts.push(text('From the pickups', 600, 556, { size: 20, weight: 700 }));
    parts.push(text('CCW end: goes through the', 890, 250, { size: 20, weight: 700, anchor: 'start' }), lines(['22 nF capacitor to ground.', 'The wiper reaches it at tone 0.'], 890, 276, { anchor: 'start', size: 18, gap: 24 }));
    const cap = ['Seen from the back, with the shaft pointing away. The wiper rides on the main signal wire from the pickups.', 'The CCW end goes through the capacitor to ground.', 'The CW end goes to the Reactive lug of the switch, and from there to the bleed.', 'The colored tags name the wires: BUS is the main signal wire from the pickups, and REACT is the wire to the Reactive lug.'];
    const description = 'A tone pot seen from the back. The wiper lug goes to the pickup selector on the main signal wire. The CCW lug goes through a 22 nF capacitor to ground. The CW lug goes to the Reactive lug of the switch.';
    const terminals = ['TONE.CW', 'TONE.W', 'TONE.CCW', 'SW.REACTIVE', 'SEL.C', 'C22.HOT', 'C22.GND'];
    const body = parts.join('');
    return { name: '08-tone-pot', svg: doc(730, title, description, heading(title) + body + caption(cap, 610)), checks: [{ svg: svgDoc(WIDTH, 700, title, body), opts: { terminals } }] };
}

// Diagram 13: finding a pot's wiper and ends with a meter.
function potLugsDrawing() {
    const title = "Finding a pot's wiper and ends";
    const rear = pot('Tone', 280, 270, { view: 'rear', ends: { left: 'TONE.CW', wiper: 'TONE.W', right: 'TONE.CCW' } });
    const key = [
        ['CW end', 'The wiper reaches it at full tone.', 'It feeds the bleed (the Reactive feed).'],
        ['Wiper', 'Always the middle lug,', 'seen from the back.'],
        ['CCW end', 'The wiper reaches it at tone 0.', 'It goes to the 22 nF capacitor.'],
    ]
        .map(([a, b, c], i) => text(a, 70, 380 + i * 76, { size: 22, weight: 700, anchor: 'start' }) + text(b, 70, 406 + i * 76, { size: 18, anchor: 'start' }) + text(c, 70, 428 + i * 76, { size: 18, anchor: 'start' }))
        .join('');
    const steps = [
        ['Find the wiper', ['Read with the pot not wired in (out of the circuit).', 'Set the meter to ohms, knob near the middle, and read', 'each pair of lugs. The highest pair is the two ends;', 'the lug left over is the wiper.']],
        ['Find the CW end', ['Turn the knob fully clockwise (tone 10, seen from the front).', 'Read the wiper to each end. The end that reads close to', 'zero is the CW end, which will feed the bleed.']],
        ['Check the other end', ['The wiper to the other end now reads the full value.', 'That is the CCW end, the one that goes to the capacitor.', 'Turn the knob fully back and the two readings swap.']],
    ];
    const stepBody = steps.map(([head, ls], i) => frame(560, 100 + i * 190, 600, 170) + badge(i + 1, 596, 136 + i * 190) + text(head, 626, 144 + i * 190, { size: 24, weight: 700, anchor: 'start' }) + lines(ls, 590, 176 + i * 190, { anchor: 'start', gap: 26 })).join('');
    const cap = ['Makers number pot lugs differently, so I name them by what they do and find them with a meter.', 'Seen from the back with the shaft pointing away and the lugs down, left, center and right are CW, wiper and CCW.', 'The same test works for the volume pot: its CW end is the input and its CCW end goes to ground.'];
    const description = 'A tone pot seen from the back with its three lugs labelled CW, Wiper and CCW, a key saying what each lug does, and three numbered meter steps: find the wiper, find the CW end, check the other end.';
    return {
        name: '13-pot-lugs',
        svg: doc(790, title, description, heading(title) + frame(40, 100, 480, 520) + rear + key + stepBody + caption(cap, 695)),
        checks: [{ svg: svgDoc(WIDTH, 790, title, rear), opts: { terminals: ['TONE.CW', 'TONE.W', 'TONE.CCW'] } }],
    };
}

// Diagram 14: the toggle's contact map.
function switchContactsDrawing() {
    const title = "The switch's three positions";
    const modes = [
        ['DIRECT', 'Direct', ['Common is joined to the Direct lug.', 'The bleed goes straight to the', 'main signal wire.']],
        ['OFF', 'Off', ['The lever rests in the middle,', 'on no lug.', 'The bleed is disconnected.']],
        ['REACTIVE', 'Reactive', ['Common is joined to the Reactive lug.', "The bleed is fed from the tone pot's", 'CW end.']],
    ];
    const checks = [];
    const panels = modes.map(([mode, name, ls], i) => {
        const px = 20 + 392 * i;
        const py = 100;
        const sw = toggle3('SW', px + 188, py + 170, mode, { rest: true });
        checks.push({ svg: svgDoc(WIDTH, 680, `${name} position`, sw), opts: { terminals: ['SW.C', 'SW.DIRECT', 'SW.OFF', 'SW.REACTIVE'], expectedMode: mode } });
        return frame(px, py, 376, 390) + text(name, px + 188, py + 38, { size: 26, weight: 700 }) + sw + lines(ls, px + 188, py + 310, { size: 20, gap: 28 });
    });
    const capLines = ['This is the idea, not a lug layout. Switches put the common on different lugs, so confirm with a meter:', 'set it to continuity, flip to each position and note which lugs beep. The common is the lug that beeps', 'with one end lug in one position and with the other end lug in the other. In the middle nothing beeps.'];
    const cap = text('The switch has three lugs: Common and two ends. The middle is a rest position, not a lug.', 40, 540, { size: 22, weight: 700, anchor: 'start' }) + caption(capLines, 576);
    const description = 'Three small switch drawings: Direct, Off and Reactive. Each shows the lever from the common to the throw it touches. In Off the lever touches no lug.';
    return { name: '14-switch-contacts', svg: doc(680, title, description, heading(title) + panels.join('') + cap), checks };
}

// ---- Diagram 15: the builder reference sheet ----
// Drawn on the same 1200-unit-wide canvas (WIDTH), like the explainers, so every primitive keeps its 14 px minimum type, and rendered
// at twice the size (2400 px wide) to match the Relay Arc reference. Panels 3 and 6 are checked with verifyDrawing.

const PANEL_BORDER = '#465c70';
const PANEL_BAND = '#e6f0f8';
const repoRoot = join(here, '../../..');

const wrap = (s, n) => {
    const out = [];
    let cur = '';
    for (const word of s.split(' ')) {
        if (cur && `${cur} ${word}`.length > n) {
            out.push(cur);
            cur = word;
        } else cur = cur ? `${cur} ${word}` : word;
    }
    if (cur) out.push(cur);
    return out;
};
const para = (list, x, y, opts = {}) => list.map((s, i) => text(s, x, y + i * (opts.gap ?? 21), { size: 15, anchor: 'start', ...opts })).join('');

function card(x, y, w, h, heading, sub = '') {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#ffffff" stroke="${PANEL_BORDER}" stroke-width="2"/><rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="34" rx="6" fill="${PANEL_BAND}"/>${text(heading, x + 16, y + 26, { size: 19, weight: 800, anchor: 'start' })}${sub ? text(sub, x + w - 14, y + 25, { size: 14, weight: 600, anchor: 'end', fill: MUTED }) : ''}`;
}

// Panel 6: the switch end of the bleed in one mode, from OUT through the resistor and capacitor to the switch.
function modeMini(mode, ox, oy) {
    const X = (x) => ox + x;
    const Y = (y) => oy + y;
    const P = (pts) => pts.map(([x, y]) => [X(x), Y(y)]);
    const geo = [];
    const wires = [];
    const w = (net, pts) => {
        geo.push(P(pts));
        wires.push(wire(net, P(pts)));
    };
    w('BUS', [
        [130, 130],
        [55, 130],
    ]);
    w('REACT', [
        [250, 130],
        [330, 130],
    ]);
    w('TB-SW', [
        [190, 220],
        [190, 240],
    ]);
    w('TB-MID', [
        [190, 340],
        [190, 360],
    ]);
    w('OUT', [
        [190, 460],
        [190, 510],
    ]);
    const parts = [toggle3('SW', X(190), Y(130), mode, { rest: true }), capacitor('CB', X(190), Y(290), { orient: 'v', ends: ['CB.2', 'CB.1'], label: 'Bleed capacitor' }), resistor('RB', X(190), Y(410), { orient: 'v', ends: ['RB.2', 'RB.1'], label: 'Bleed resistor' })];
    const marks = [netLabel('BUS', X(55), Y(130)), netLabel('REACT', X(330), Y(130)), netLabel('OUT', X(190), Y(510)), text('main signal', X(55), Y(170), { size: 14, weight: 600, fill: MUTED }), text('tone CW end', X(330), Y(170), { size: 14, weight: 600, fill: MUTED }), text('from the volume wiper', X(226), Y(515), { size: 14, weight: 600, fill: MUTED, anchor: 'start' })];
    const terminalPoints = P([
        [130, 130],
        [190, 130],
        [250, 130],
        [190, 220],
        [190, 240],
        [190, 340],
        [190, 360],
        [190, 460],
    ]);
    const end = { DIRECT: [130, 130, 83], REACTIVE: [250, 130, 292] }[mode];
    let under = '';
    if (end) {
        const piece = P([
            [190, 494],
            [190, 220],
            [end[0], end[1]],
            [end[2], 130],
        ]);
        checkGlow(`sheet ${mode} mode`, [piece], geo, terminalPoints);
        under = glow(piece);
    }
    const body = under + wires.join('') + parts.join('') + marks.join('');
    return { body, terminals: ['RB.1', 'RB.2', 'CB.1', 'CB.2', 'SW.C', 'SW.DIRECT', 'SW.OFF', 'SW.REACTIVE'] };
}

function referenceSheet() {
    const out = [];
    const checks = [];
    const add = (...s) => out.push(...s);
    const GAP = 12;
    const L = 10;
    const FULL = WIDTH - 2 * L;
    const HALF_L = 580;
    const HALF_R = FULL - HALF_L - GAP;
    const RX = L + HALF_L + GAP;

    // Header.
    add(text('DIRECT / OFF / REACTIVE TREBLE BLEED • WIRING REFERENCE', 600, 48, { size: 28, weight: 800 }));
    add(text('MATCH IDENTICAL BOXED WIRE LABELS • CONFIRM POT AND SWITCH LUGS WITH A METER', 600, 74, { size: 15, weight: 700 }));
    add(text('Rev 1.0 • 2026-11-23', 1188, 18, { size: 14, anchor: 'end', fill: MUTED }));

    // 1. What you're building.
    let y = 88;
    const h1 = 432;
    add(card(L, y, FULL, h1, "1. WHAT YOU'RE BUILDING", 'Shown on Relay Lipstick; fits any guitar with one master volume and one master tone wired this way'));
    add(text('THREE MODES ON ONE SWITCH', 30, y + 64, { size: 16, weight: 800, anchor: 'start' }));
    let cy = y + 90;
    for (const s of wrap('One three-position switch sets what the treble bleed does as I turn the volume down.', 44)) {
        add(text(s, 30, cy, { size: 15, anchor: 'start' }));
        cy += 21;
    }
    for (const [name, desc] of [
        ['Direct', 'An ordinary treble bleed: the highs stay as I turn down.'],
        ['Off', 'No bleed. The tone knob works as usual.'],
        ['Reactive', 'The bleed follows the tone knob: roll the tone back and the bleed eases off.'],
    ]) {
        cy += 12;
        add(text(name, 30, cy, { size: 16, weight: 800, anchor: 'start' }));
        cy += 21;
        for (const s of wrap(desc, 44)) {
            add(text(s, 30, cy, { size: 15, anchor: 'start' }));
            cy += 21;
        }
    }
    add(text('THE JOB', 400, y + 64, { size: 16, weight: 800, anchor: 'start' }));
    cy = y + 90;
    for (const step of ['1. Drill one 6 mm hole near the tone pot and mount the switch (6 mm suits the switch I link to; check yours).', '2. Rewire the tone pot: the signal moves to the wiper, and the 22 nF capacitor moves to the CCW end (panel 4).', "3. Move the bleed's input end to the switch's Common lug.", '4. Add two wires: BUS to Direct, and the tone CW end to Reactive.']) {
        wrap(step, 47).forEach((s, i) => {
            add(text(s, i ? 420 : 400, cy, { size: 15, anchor: 'start' }));
            cy += 21;
        });
        cy += 8;
    }
    add(text('PARTS', 400, cy + 6, { size: 16, weight: 800, anchor: 'start' }));
    add(para(wrap('An on–off–on mini toggle (SPDT), a bleed resistor and capacitor (panel 7), the existing 22 nF capacitor and hookup wire.', 47), 400, cy + 30));
    add(text('WIRE LABELS', 780, y + 64, { size: 16, weight: 800, anchor: 'start' }));
    const legend = [
        ['BUS', 'main signal from the pickups'],
        ['OUT', 'volume wiper to the jack tip'],
        ['GND', 'ground'],
        ['REACT', 'tone CW end to the Reactive lug'],
        ['TB-MID', 'between bleed resistor and capacitor'],
        ['TB-SW', "bleed capacitor to the switch's Common"],
        ['TONE-CAP', 'tone CCW end to the 22 nF capacitor'],
    ];
    legend.forEach(([net, desc], i) => {
        const ly = y + 96 + i * 38;
        const bw = Math.max(56, net.length * 11 + 20);
        add(netLabel(net, 888 - bw / 2, ly), text(desc, 902, ly + 5, { size: 14, anchor: 'start' }));
    });
    add(text("Each wire in the drawings has its label's color.", 780, y + 96 + 7 * 38 + 2, { size: 14, anchor: 'start', fill: MUTED, weight: 600 }));

    // 2. Stock circuit.
    y += h1 + GAP;
    const h2 = 600;
    add(card(L, y, FULL, h2, '2. STOCK CIRCUIT (BEFORE)', 'Values shown are for a 500k volume pot'));
    const stock = circuit({ oy: y + 100, kind: 'stock', label: 'sheet stock' });
    add(stock.body);
    checks.push({ svg: svgDoc(WIDTH, 4000, 'stock', stock.body), opts: { terminals: stock.terminals, nets: STOCK_NETS } });
    add(para(["As it comes: the signal (BUS) reaches the tone pot at its CCW end, the tone wiper goes to the 22 nF capacitor, and the CW end isn't used.", 'The bleed, a resistor and a capacitor in series, runs from BUS to OUT. If your volume pot has no bleed, add one (panel 7).'], 30, y + 540, { gap: 24 }));

    // 3. Finished circuit.
    y += h2 + GAP;
    const h3 = 650;
    add(card(L, y, FULL, h3, '3. FINISHED CIRCUIT', 'Switch drawn in the middle (Off) position'));
    const fin = circuit({ oy: y + 100, kind: 'new', mode: 'OFF', rest: true, badges: true, label: 'sheet finished' });
    add(fin.body);
    checks.push({ svg: svgDoc(WIDTH, 4000, 'finished', fin.body), opts: { terminals: fin.terminals, expectedMode: 'OFF' } });
    add(para(['The numbers mark the wires that move or are new:', '1. The signal feed moves to the tone wiper.', '2. The 22 nF capacitor moves to the CCW end.'], 30, y + 548, { gap: 24 }));
    add(para(['3. A new wire runs from the tone CW end to the Reactive lug.', "4. The bleed's input end moves to the switch's Common lug.", "5. A new wire runs from BUS to the switch's Direct lug."], 600, y + 548, { gap: 24 }));
    add(text('Everything else stays as it was.', 30, y + 628, { size: 15, anchor: 'start', weight: 600 }));

    // 4. Tone pot lugs and 5. switch contacts.
    y += h3 + GAP;
    const h4 = 470;
    add(card(L, y, HALF_L, h4, '4. TONE POT LUGS', 'Seen from the back'));
    const tx = L + 400;
    const ty = y + 200;
    const toneParts = [
        wire('REACT', [
            [tx - 44, ty],
            [tx - 44, ty + 80],
            [tx - 110, ty + 80],
        ]),
        wire('BUS', [
            [tx, ty],
            [tx, ty + 120],
        ]),
        wire('TONE-CAP', [
            [tx + 44, ty],
            [tx + 44, ty + 50],
            [tx + 100, ty + 50],
            [tx + 100, ty + 70],
        ]),
        wire('GND', [
            [tx + 100, ty + 170],
            [tx + 100, ty + 184],
        ]),
        pot('Tone', tx, ty, { view: 'rear', ends: { left: 'TONE.CW', wiper: 'TONE.W', right: 'TONE.CCW' } }),
        capacitor('C22', tx + 100, ty + 120, { orient: 'v', ends: ['C22.HOT', 'C22.GND'], label: '22 nF' }),
        groundSymbol(tx + 100, ty + 190),
        netLabel('REACT', tx - 110, ty + 80),
        netLabel('BUS', tx, ty + 120),
    ].join('');
    add(toneParts);
    checks.push({ svg: svgDoc(WIDTH, 4000, 'tone lugs', toneParts), opts: { terminals: ['TONE.CW', 'TONE.W', 'TONE.CCW', 'C22.HOT', 'C22.GND'] } });
    add(text('REAR VIEW • shaft away • lugs down', 30, y + 66, { size: 15, weight: 700, anchor: 'start', fill: MUTED }));
    add(text('LEFT / CW → REACT', 30, y + 102, { size: 17, weight: 800, anchor: 'start', fill: NET_COLORS.REACT }), para(["to the switch's Reactive lug", '(the wiper reaches it at tone 10)'], 30, y + 124));
    add(text('CENTER / WIPER → BUS', 30, y + 182, { size: 17, weight: 800, anchor: 'start', fill: NET_COLORS.BUS }), para(['the main signal wire'], 30, y + 204));
    add(text('RIGHT / CCW → 22 nF → GND', 30, y + 240, { size: 17, weight: 800, anchor: 'start', fill: NET_COLORS['TONE-CAP'] }), para(['(the wiper reaches it at tone 0)'], 30, y + 262));
    add(text('Clockwise at the knob = brighter', 30, y + 330, { size: 16, weight: 700, anchor: 'start' }));
    add(para(['Makers number lugs differently: find the wiper and the', "ends with a meter. The volume pot's wiring doesn't change."], 30, y + 426, { gap: 22 }));

    add(card(RX, y, HALF_R, h4, '5. SWITCH CONTACTS', 'Functional contact map'));
    const sx = RX + 130;
    const sw = toggle3('SW', sx, y + 150, null, { rest: true });
    add(sw);
    checks.push({ svg: svgDoc(WIDTH, 4000, 'switch', sw), opts: { terminals: ['SW.C', 'SW.DIRECT', 'SW.OFF', 'SW.REACTIVE'] } });
    const cols = [RX + 250, RX + 350, RX + 490, HALF_R + RX - 14];
    const top = y + 60;
    add(`<rect x="${cols[0]}" y="${top}" width="${cols[3] - cols[0]}" height="38" fill="${PANEL_BAND}"/>`);
    [
        ['LEVER', cols[0]],
        ['COMMON JOINS', cols[1]],
        ['WIRE', cols[2]],
    ].forEach(([h, x]) => add(text(h, x + 10, top + 25, { size: 14, weight: 800, anchor: 'start' })));
    [
        ['Direct', 'Direct lug', 'BUS'],
        ['Off', 'no lug', null],
        ['Reactive', 'Reactive lug', 'REACT'],
    ].forEach(([pos, joins, net], i) => {
        const ry = top + 38 + i * 46;
        add(text(pos, cols[0] + 10, ry + 29, { size: 16, weight: 700, anchor: 'start' }), text(joins, cols[1] + 10, ry + 29, { size: 15, anchor: 'start' }));
        add(net ? netLabel(net, (cols[2] + cols[3]) / 2, ry + 23) : text('open', (cols[2] + cols[3]) / 2, ry + 29, { size: 15, weight: 700, fill: MUTED }));
    });
    const tableBottom = top + 38 + 3 * 46;
    add(`<rect x="${cols[0]}" y="${top}" width="${cols[3] - cols[0]}" height="${tableBottom - top}" fill="none" stroke="${PANEL_BORDER}" stroke-width="1.5"/>`);
    for (const x of cols.slice(1, 3)) add(`<line x1="${x}" y1="${top}" x2="${x}" y2="${tableBottom}" stroke="${PANEL_BORDER}" stroke-width="1.5"/>`);
    for (let i = 0; i <= 2; i++) add(`<line x1="${cols[0]}" y1="${top + 38 + i * 46}" x2="${cols[3]}" y2="${top + 38 + i * 46}" stroke="${PANEL_BORDER}" stroke-width="1.5"/>`);
    add(para(wrap('An on–off–on mini toggle (SPDT) has three lugs: Common and two ends. The middle lever position touches no lug.', 70), RX + 20, y + 318, { gap: 22 }), para(wrap('This is the idea, not the lug layout. Switches put Common on different lugs, so confirm with a meter on continuity: Common beeps to the Direct lug in Direct, to the Reactive lug in Reactive, and to nothing in Off.', 70), RX + 20, y + 374, { gap: 22 }));

    // 6. The three modes.
    y += h4 + GAP;
    const h6 = 712;
    add(card(L, y, FULL, h6, '6. THREE MODES • OPERATING STATES', 'The switch end of the bleed; the glow marks the bleed path'));
    const modes = [
        ['DIRECT', 'Direct', 'The lever joins Common to the Direct lug, so the bleed meets the main signal wire (BUS). An ordinary treble bleed.'],
        ['OFF', 'Off', 'The lever rests on no lug, so the bleed is disconnected. The tone knob works as usual.'],
        ['REACTIVE', 'Reactive', "The lever joins Common to the Reactive lug, so the bleed is fed from the tone pot's CW end. Roll the tone back and the bleed eases off."],
    ];
    modes.forEach(([mode, name, desc], i) => {
        const ox = L + i * (FULL / 3);
        const oy = y + 40;
        if (i) add(`<line x1="${ox}" y1="${y + 50}" x2="${ox}" y2="${y + h6 - 60}" stroke="#c9d3de" stroke-width="2"/>`);
        const m = modeMini(mode, ox, oy);
        add(text(name, ox + 20, oy + 36, { size: 22, weight: 800, anchor: 'start' }), m.body);
        checks.push({ svg: svgDoc(WIDTH, 4000, `${name} mode`, m.body), opts: { terminals: m.terminals, expectedMode: mode } });
        add(para(wrap(desc, 46), ox + 20, oy + 565));
    });
    add(text('At tone 10, Reactive and Direct are the same circuit. At volume 10, all three modes are the same.', 30, y + h6 - 20, { size: 16, weight: 700, anchor: 'start' }));

    // 7. Values and 8. ground and bench checks.
    y += h6 + GAP;
    const h7 = 350;
    add(card(L, y, HALF_L, h7, '7. VALUES BY VOLUME POT'));
    const vc = [30, 150, 290, 430, 570];
    const vt = y + 50;
    add(`<rect x="${vc[0]}" y="${vt}" width="${vc[4] - vc[0]}" height="38" fill="${PANEL_BAND}"/>`);
    ['VOLUME POT', 'BLEED RESISTOR', 'BLEED CAPACITOR', 'TONE CAPACITOR'].forEach((h, i) => add(text(h, (vc[i] + vc[i + 1]) / 2, vt + 25, { size: 14, weight: 800 })));
    [
        ['500k', '150 kΩ', '1 nF', '22 nF'],
        ['250k', '68 kΩ', '1 nF', '22 nF'],
        ['1M', '330 kΩ', '1 nF', '22 nF'],
    ].forEach((row, r) => row.forEach((v, i) => add(text(v, (vc[i] + vc[i + 1]) / 2, vt + 38 + r * 40 + 27, { size: 17, weight: i === 0 ? 800 : 600 }))));
    const vBottom = vt + 38 + 3 * 40;
    add(`<rect x="${vc[0]}" y="${vt}" width="${vc[4] - vc[0]}" height="${vBottom - vt}" fill="none" stroke="${PANEL_BORDER}" stroke-width="1.5"/>`);
    for (const x of vc.slice(1, 4)) add(`<line x1="${x}" y1="${vt}" x2="${x}" y2="${vBottom}" stroke="${PANEL_BORDER}" stroke-width="1.5"/>`);
    for (let i = 0; i <= 2; i++) add(`<line x1="${vc[0]}" y1="${vt + 38 + i * 40}" x2="${vc[4]}" y2="${vt + 38 + i * 40}" stroke="${PANEL_BORDER}" stroke-width="1.5"/>`);
    add(text('The drawings show the 500k values (Lipstick).', 30, vBottom + 28, { size: 15, anchor: 'start' }));
    add(text('Tuning by ear', 30, vBottom + 60, { size: 16, weight: 800, anchor: 'start' }));
    add(para(['• Subtler: a smaller capacitor, 470–680 pF', '• Brighter: a larger capacitor, 1.5–2.2 nF', '• Resistor: one standard step either way'], 30, vBottom + 84, { gap: 22 }));

    add(card(RX, y, HALF_R, h7, '8. COMMON GROUND & BENCH CHECKS'));
    add(para(wrap("GND (ground) joins the volume pot's CCW lug, the 22 nF capacitor's free end and the jack sleeve. The rest of the guitar's ground stays as it is.", 74), RX + 20, y + 64, { gap: 22 }));
    add(text('BENCH CHECKS', RX + 20, y + 126, { size: 16, weight: 800, anchor: 'start' }));
    const bench = ['1. Tone at 10: Direct and Reactive sound the same.', '2. Volume at 10: all three modes sound the same.', '3. The switch is quiet when I change modes.', '4. The switch body clears the cavity, the pots and the wiring.', '5. Match the loudness, then compare the modes at volume 5, tone 5 and at volume 8, tone 8.', '6. Sweep both knobs in each mode.'];
    cy = y + 152;
    for (const b of bench) {
        wrap(b, 66).forEach((s, i) => {
            add(text(s, RX + (i ? 40 : 20), cy, { size: 15, anchor: 'start' }));
            cy += 22;
        });
    }

    const height = y + h7 + 10;
    const title = 'Direct / Off / Reactive treble bleed';
    const description = 'Builder wiring reference for the Direct / Off / Reactive treble bleed switch, revision 1.0, 2026-11-23, in eight numbered panels: what you are building, the stock volume and tone circuit, the finished circuit with the five changed wires numbered, the tone pot lugs from the rear, the switch contact map, the three modes, the bleed values by volume pot, and common ground with bench checks.';
    return {
        name: 'relay-treble-bleed-switch-rev-1.0',
        svg: doc(height, title, description, out.join('')),
        checks,
        svgPath: join(here, 'relay-treble-bleed-switch-rev-1.0.svg'),
        pngPath: join(repoRoot, 'public/wiring-diagrams/relay-treble-bleed-switch-rev-1.0.png'),
    };
}

export async function generateAll() {
    const written = [];
    const problems = [];
    geometryProblems.length = 0;
    const drawings = [signalChainDrawing(), volumePotDrawing(), potAndCableDrawing(), brightnessSketchDrawing(), volumeDrawing(false), volumeDrawing(true), variantsDrawing(), tonePotDrawing(), reactiveDrawing(), threeModesDrawing(), beforeDrawing(), afterDrawing(), potLugsDrawing(), switchContactsDrawing(), referenceSheet()];
    mkdirSync(outDir, { recursive: true });
    for (const d of drawings) {
        for (const check of d.checks) {
            const result = verifyDrawing(check.svg, check.opts);
            for (const p of result.problems) problems.push(`${d.name}: ${p}`);
        }
        if (/unvalidated|pending|experimental|not yet tested|to be determined|TBD|\bwe\b|\bour\b/i.test(d.svg.replace(/<[^>]+>/g, ' '))) problems.push(`${d.name}: caption wording breaks the style rules`);
        const svgPath = d.svgPath ?? join(outDir, `${d.name}.svg`);
        const pngPath = d.pngPath ?? join(outDir, `${d.name}.png`);
        writeFileSync(svgPath, d.svg);
        await sharp(Buffer.from(d.svg), { density: 144 }).png().toFile(pngPath);
        written.push(svgPath, pngPath);
    }
    problems.push(...geometryProblems);
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
