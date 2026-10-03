"""Bosstone (silicon NPN + PNP) schematic, breadboard and stripboard.

Run from anywhere: python3 docs/engineering/bosstone/generate.py
Requires: pip install schemdraw matplotlib cairosvg
Each layout is checked against the netlist below before it is drawn.
"""
from pathlib import Path
import sys

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent / 'pedal-diagrams'))
from pedaldraw import Stripboard, Breadboard, to_png  # noqa: E402

NAME = 'bosstone'

CORE = {
    'ATT_W': {'ATTACK.2', 'C1.1'},
    'Q1_BASE': {'C1.2', 'R1.1', 'R3.2', 'C3.2', 'Q1.B'},
    'FB': {'R2.2', 'R3.1', 'C2.1'},
    'Q1_COL': {'Q1.C', 'R4.2', 'R2.1', 'C3.1', 'Q2.B'},
    'Q2_EMIT': {'Q2.E', 'R5.2', 'C4.1'},
    'CLIP': {'C4.2', 'D1.A', 'D2.K', 'D3.A', 'D4.K', 'VOL.3'},
    'SI_RET': {'D1.K', 'D2.A', 'SW2.1'},
    'LED_RET': {'D3.K', 'D4.A', 'SW2.3'},
}
GND_CORE = {'Q1.E', 'Q2.C', 'R1.2', 'C2.2', 'ATTACK.1', 'VOL.1', 'SW2.2', 'J1.sleeve', 'J2.sleeve'}


def stripboard():
    expected = dict(CORE)
    expected.update({
        'VCC': {'R4.1', 'R5.1', 'BAT.+', 'LED.+'},
        'GND': GND_CORE | {'SW.L1'},
    })
    parts = [
        ('film', 'C2', '22n', {'1': (2, 1), '2': (5, 1)}, {'lab': (0.95, 0.2)}),
        ('res', 'R3', '560k', {'1': (2, 3), '2': (4, 5)}, {'lab': (-0.9, -0.75)}),
        ('res', 'R2', '560k', {'1': (3, 8), '2': (2, 5)}, {'lab': (0, -0.75)}),
        ('film', 'C1', '22n', {'1': (6, 2), '2': (4, 2)}, {'lab': (0.15, 1.65)}),
        ('to92', 'Q1', '2N2222', {'C': (3, 7), 'B': (4, 7), 'E': (5, 7)}, {'flat': 'right', 'lab': (-1.6, 1.3)}),
        ('ceramic', 'C3', '47p', {'1': (3, 9), '2': (4, 9)}, {'lab': (-0.9, 0.95)}),
        ('res', 'R1', '150k', {'1': (4, 10), '2': (5, 13)}, {'lab': (-0.4, 0.95)}),
        ('res', 'R4', '18k', {'1': (1, 11), '2': (3, 11)}, {'lab': (-1.0, -1.0)}),
        ('to92', 'Q2', '2N3906', {'E': (2, 14), 'B': (3, 14), 'C': (4, 14)}, {'flat': 'left', 'lab': (-1.7, -0.6)}),
        ('res', 'R5', '18k', {'1': (1, 15), '2': (2, 18)}, {'lab': (-0.3, -0.85)}),
        ('film', 'C4', '22n', {'1': (2, 17), '2': (6, 17)}, {'lab': (-1.35, 0.9)}),
        ('diode', 'D1', '1N4148', {'A': (6, 5), 'K': (7, 7)}, {'lab': (0, 1.25)}),
        ('diode', 'D2', '1N4148', {'A': (7, 8), 'K': (6, 10)}, {'lab': (0, -1.0)}),
        ('led', 'D3', 'LED', {'A': (6, 13), 'K': (7, 13)}, {'lab': (-0.7, 1.3)}),
        ('led', 'D4', 'LED', {'A': (7, 15), 'K': (6, 15)}, {'lab': (1.6, 0.2)}),
    ]
    cuts = [(2, 9), (4, 12), (6, 4), (7, 11)]
    links = [((4, 16), (5, 16)), ((5, 3), (8, 3))]
    pads = {'BAT.+': (1, 13), 'LED.+': (1, 18), 'ATTACK.2': (6, 1), 'SW2.1': (7, 1),
            'VOL.3': (6, 18), 'SW2.3': (7, 18),
            'J1.sleeve': (8, 2), 'ATTACK.1': (8, 5), 'SW2.2': (8, 8), 'SW.L1': (8, 11), 'VOL.1': (8, 14), 'J2.sleeve': (8, 17)}
    labels = {'BAT.+': 'BAT +', 'LED.+': 'LED +9 V', 'ATTACK.2': 'ATTACK 2', 'SW2.1': 'CLIP SW 1', 'VOL.3': 'VOL 3',
              'SW2.3': 'CLIP SW 3', 'J1.sleeve': 'J1 sleeve', 'ATTACK.1': 'ATTACK 1', 'SW2.2': 'CLIP SW 2',
              'SW.L1': '3PDT lug 1', 'VOL.1': 'VOL 1', 'J2.sleeve': 'J2 sleeve'}
    pos = {'BAT.+': 'above', 'LED.+': 'above', 'ATTACK.2': 'w', 'SW2.1': 'w', 'VOL.3': 'e', 'SW2.3': 'e'}
    pos.update({k: 'below' for k in ('J1.sleeve', 'ATTACK.1', 'SW2.2', 'SW.L1', 'VOL.1', 'J2.sleeve')})
    sb = Stripboard(18, 8, cuts, parts, links, pads, [], expected, labels)
    notes = [
        'Cut all four tracks first (B9, D12, F4, G11).',
        'Links: D16–E16, and E3–H3 (insulated; crosses F, G).',
        'Q1 (NPN) flat face right, Q2 (PNP) flat face left.',
        '  Facing the flat, 2N2222/2N3906 legs read E-B-C.',
        '  C1815/A1015/S8050/S8550 are E-C-B: rotate to suit.',
        'Q2 is a PNP emitter follower: collector to GND',
        '  (strip D, 13–18), emitter to R5 and C4.',
        'C1 stands across strip E (F2 to D2).',
        'D1/D2 (1N4148) and D3/D4 (LEDs) are opposed',
        '  pairs; use two LEDs of one colour.',
        'CLIP switch (on-off-on): lug 1 = 1N4148, centre =',
        '  none, lug 3 = LEDs.',
        '',
        'Off-board: 3PDT lug 2 to ATTACK lug 3; VOL lug 2',
        '  to 3PDT lug 3. Wire the 3PDT, jacks, LED and',
        '  battery as the Fuzz Face footswitch diagram.',
        '',
        'Check (no signal, to GND): strip C (Q1 collector)',
        '  ≈ 5.5–6.5 V; strip B right (Q2 emitter) ≈ 0.6 V',
        '  higher; strip D left (Q1 base) ≈ 0.6 V.',
    ]
    sb.draw(HERE / f'{NAME}-stripboard.svg', 'Bosstone: stripboard layout',
            '18 × 8 holes (0.1 in pitch), strips horizontal. NPN gain stage + PNP follower; matches the schematic; nets auto-checked.',
            notes, pos)


def breadboard():
    expected = dict(CORE)
    expected.update({
        'INPUT': {'J1.tip', 'ATTACK.3'},
        'VCC': {'R4.1', 'R5.1', 'BAT.+'},
        'GND': GND_CORE | {'BAT.-'},
        'OUTPUT': {'VOL.2', 'J2.tip'},
    })
    parts = [
        ('film', 'C1', '22n', {'1': (3, 'g'), '2': (8, 'g')}, {'lab': (0, -0.9)}),
        ('to92', 'Q1', '2N2222', {'E': (7, 'f'), 'B': (8, 'f'), 'C': (9, 'f')}, {'flat': 'down', 'lab': (-2.6, -1.0)}),
        ('ceramic', 'C3', '47p', {'1': (9, 'h'), '2': (8, 'h')}, {'lab': (-1.5, 0.15)}),
        ('res', 'R3', '560k', {'1': (14, 'i'), '2': (8, 'i')}, {'lab': (0.6, 0.85)}),
        ('res', 'R1', '150k', {'1': (8, 'j'), '2': (8, 'B-')}, {'lab': (-1.9, 0.3)}),
        ('res', 'R4', '18k', {'1': (9, 'B+'), '2': (9, 'j')}, {'lab': (1.5, 0.5)}),
        ('res', 'R2', '560k', {'1': (11, 'h'), '2': (14, 'h')}, {'lab': (0, -0.75)}),
        ('film', 'C2', '22n', {'1': (14, 'j'), '2': (14, 'B-')}, {'lab': (1.6, 0.3)}),
        ('to92', 'Q2', '2N3906', {'E': (10, 'c'), 'B': (11, 'c'), 'C': (12, 'c')}, {'flat': 'down', 'lab': (-2.8, -0.9)}),
        ('res', 'R5', '18k', {'1': (10, 'T+'), '2': (10, 'a')}, {'lab': (-1.5, -0.4)}),
        ('film', 'C4', '22n', {'1': (10, 'd'), '2': (15, 'd')}, {'lab': (1.2, 0.95)}),
        ('led', 'D3', 'LED', {'A': (15, 'a'), 'K': (18, 'a')}, {'lab': (2.6, 0.2)}),
        ('led', 'D4', 'LED', {'A': (18, 'c'), 'K': (15, 'c')}, {'lab': (2.6, 0.2)}),
        ('diode', 'D1', '1N4148', {'A': (15, 'g'), 'K': (18, 'g')}, {'lab': (3.0, 0.2)}),
        ('diode', 'D2', '1N4148', {'A': (18, 'h'), 'K': (15, 'h')}, {'lab': (3.0, 0.2)}),
    ]
    jumpers = [
        ((7, 'j'), (7, 'B-'), '#222'),        # Q1 emitter -> GND
        ((9, 'g'), (11, 'g'), '#e67e22'),     # Q1 collector -> column 11
        ((11, 'f'), (11, 'e'), '#e67e22'),    # ... -> Q2 base (top half)
        ((12, 'a'), (12, 'T-'), '#222'),      # Q2 collector -> GND
        ((15, 'e'), (15, 'f'), '#16a085'),    # CLIP top -> bottom
        ((18, 'e'), (20, 'f'), '#8e44ad'),    # LED return -> switch column
        ((29, 'T-'), (29, 'B-'), '#222'),
        ((30, 'T+'), (30, 'B+'), '#c0392b'),
    ]
    offboard = [
        {'type': 'pot', 'ref': 'ATTACK', 'label': 'ATTACK', 'value': 'B100k', 'x': 3},
        {'type': 'pot', 'ref': 'VOL', 'label': 'VOLUME', 'value': 'A100k', 'x': 14},
        {'type': 'spdt', 'ref': 'SW2', 'label': 'CLIP', 'value': 'SPDT on-off-on', 'x': 19},
        {'type': 'jack', 'ref': 'J2', 'x': 24},
    ]
    wires = [
        ('J1.sleeve', (1, 'T-'), '#222'),
        ('BAT.+', (3, 'T+'), '#c0392b'),
        ('BAT.-', (5, 'T-'), '#222'),
        ('ATTACK.1', (2, 'B-'), '#222'),
        ('ATTACK.2', (3, 'j'), '#27ae60'),
        ('VOL.1', (13, 'B-'), '#222'),
        ('VOL.3', (15, 'j'), '#16a085'),
        ('SW2.1', (18, 'j'), '#d35400'),
        ('SW2.2', (19, 'B-'), '#222'),
        ('SW2.3', (20, 'j'), '#8e44ad'),
        ('J2.sleeve', (26, 'B-'), '#222'),
    ]
    off_wires = [('J1.tip', 'ATTACK.3', '#27ae60'), ('VOL.2', 'J2.tip', '#2980b9')]
    bb = Breadboard(parts, jumpers, offboard, wires, off_wires, expected)
    notes = [
        'Q1 (2N2222, bottom) and Q2 (2N3906, top): flat',
        '  face toward row j, legs E-B-C left to right.',
        '  C1815/A1015/S8050/S8550 are E-C-B: rotate.',
        'Orange jumpers 9g–11g and 11f–11e carry the Q1',
        '  collector to Q2 base.',
        'Q2 collector to GND by the black jumper 12a.',
        'R3 (8i–14i) passes over 9i–13i; keep them empty.',
        'R1, R4 and C2 stand from row j to the rails;',
        '  R4 crosses the GND rail to +9 V.',
        'D1/D2: opposed 1N4148s; D3/D4: opposed LEDs of',
        '  one colour (long legs in 15a and 18c).',
        'CLIP switch: lug 1 side = 1N4148, centre = none,',
        '  lug 3 side = LEDs.',
        '',
        'Check (no signal): column 9 bottom (Q1 collector)',
        '  ≈ 5.5–6.5 V; column 10 top (Q2 emitter) ≈ 0.6 V',
        '  higher.',
    ]
    colours = [('#c0392b', '+9 V'), ('#222', 'ground'), ('#27ae60', 'input / attack'),
               ('#e67e22', 'Q1 collector → Q2 base'), ('#16a085', 'clip node'), ('#d35400', '1N4148 return'),
               ('#8e44ad', 'LED return'), ('#2980b9', 'output')]
    bb.draw(HERE / f'{NAME}-breadboard.svg', 'Bosstone: breadboard layout',
            'Silicon NPN gain stage + PNP follower, negative ground, 9 V. Half-size breadboard, top view. Matches the bosstone schematic.',
            notes, colours)


def schematic():
    import schemdraw
    import schemdraw.elements as elm
    schemdraw.use('matplotlib')
    S = 8
    path = HERE / f'{NAME}-schematic.svg'
    with schemdraw.Drawing(file=str(path), show=False) as d:
        d.config(fontsize=11)
        d += elm.Dot(open=True).at((-1.5, 6)).label('IN\n(3PDT)', 'left')
        d += elm.Line().at((-1.5, 6)).to((-0.7, 6))
        AT = elm.Potentiometer().at((-0.7, 6)).to((-0.7, 2.5))
        d += AT
        d += elm.Ground().at((-0.7, 2.5))
        d += elm.Label().at((-1.3, 4.25)).label('ATTACK\nB100k', halign='right')
        d += elm.Line().at(AT.tap).to((0.7, AT.tap.y))
        d += elm.Line().at((0.7, AT.tap.y)).to((0.7, 6))
        d += elm.Capacitor().at((0.7, 6)).to((3.0, 6)).label('C1\n22n')
        d += elm.Line().at((3.0, 6)).to((5.2, 6))
        d += elm.Dot().at((3.4, 6)); d += elm.Dot().at((4.5, 6))
        d += elm.Label().at((4.4, 5.55)).label('Q1_BASE', fontsize=S, halign='right')
        d += elm.Resistor().at((4.5, 6)).to((4.5, 2.5))
        d += elm.Label().at((4.0, 4.25)).label('R1\n150k', halign='right')
        d += elm.Ground().at((4.5, 2.5))
        Q1 = elm.BjtNpn(circle=True).theta(0).at((5.2, 6)).anchor('base')
        d += Q1
        d += elm.Label().at((Q1.collector.x + 0.4, 5.6)).label('Q1\n2N2222', halign='left')
        d += elm.Ground().at(Q1.emitter)
        cx = Q1.collector.x
        top = 12.5
        d += elm.Line().at(Q1.collector).to((cx, top))
        d += elm.Dot().at((cx, top))
        d += elm.Label().at((cx + 0.2, top - 0.4)).label('Q1_COL', fontsize=S, halign='left')
        d += elm.Resistor().at((cx, top)).to((cx, top + 3))
        d += elm.Label().at((cx - 0.5, top + 1.5)).label('R4\n18k', halign='right')
        d += elm.Vdd().at((cx, top + 3)).label('+9 V')
        # C3 collector -> base
        d += elm.Dot().at((cx, 8.0))
        d += elm.Line().at((cx, 8.0)).to((5.8, 8.0))
        d += elm.Capacitor().at((5.8, 8.0)).to((4.5, 8.0))
        d += elm.Label().at((5.15, 8.65)).label('C3 47p', fontsize=10)
        d += elm.Line().at((4.5, 8.0)).to((4.5, 6))
        # R2 (collector -> FB) and R3 (FB -> base); C2 grounds FB
        d += elm.Line().at((cx, top)).to((3.4, top))
        d += elm.Resistor().at((3.4, top)).to((3.4, 9.5))
        d += elm.Label().at((2.9, 11.0)).label('R2\n560k', halign='right')
        d += elm.Dot().at((3.4, 9.5))
        d += elm.Label().at((3.6, 9.75)).label('FB', fontsize=S, halign='left')
        d += elm.Resistor().at((3.4, 9.5)).to((3.4, 6.5))
        d += elm.Line().at((3.4, 6.5)).to((3.4, 6))
        d += elm.Label().at((3.72, 8.0)).label('R3\n560k', halign='left', fontsize=9)
        d += elm.Line().at((3.4, 9.5)).to((1.8, 9.5))
        d += elm.Capacitor().at((1.8, 9.5)).to((1.8, 7.6))
        d += elm.Label().at((1.3, 8.55)).label('C2\n22n', halign='right')
        d += elm.Ground().at((1.8, 7.6))
        # Q2 PNP emitter follower, base on Q1 collector
        bx = cx + 1.6
        d += elm.Line().at((cx, top)).to((bx, top))
        Q2 = elm.BjtPnp(circle=True).theta(0).at((bx, top)).anchor('base')
        d += Q2
        d += elm.Label().at((Q2.emitter.x + 0.5, top - 0.6)).label('Q2\n2N3906', halign='left')
        ex = Q2.emitter.x
        # schemdraw PNP: emitter on top. Emitter -> R5 -> +9 V ; collector -> GND
        d += elm.Ground().at(Q2.collector)
        d += elm.Line().at(Q2.emitter).to((ex, top + 1.4))
        d += elm.Dot().at((ex, top + 1.4))
        d += elm.Resistor().at((ex, top + 1.4)).to((ex, top + 4.4))
        d += elm.Label().at((ex + 0.5, top + 2.9)).label('R5\n18k', halign='left')
        d += elm.Vdd().at((ex, top + 4.4)).label('+9 V')
        d += elm.Label().at((ex - 0.2, top + 1.75)).label('Q2_EMIT', fontsize=S, halign='right')
        kx = ex + 3.0
        d += elm.Capacitor().at((ex, top + 1.4)).to((kx, top + 1.4)).label('C4\n22n')
        d += elm.Dot().at((kx, top + 1.4))
        cy = top + 1.4
        d += elm.Label().at((kx - 0.2, cy - 0.4)).label('CLIP', fontsize=S, halign='right')
        for x0, kind, name in ((kx, 'si', 'D1 / D2\n1N4148'), (kx + 2.2, 'led', 'D3 / D4\nLEDs')):
            d += elm.Line().at((kx, cy)).to((x0 + 1.5, cy))
            Dl = elm.LED if kind == 'led' else elm.Diode
            d += elm.Line().at((x0 + 0.5, cy)).to((x0 + 0.5, cy - 0.5))
            d += elm.Line().at((x0 + 1.5, cy)).to((x0 + 1.5, cy - 0.5))
            d += Dl().at((x0 + 0.5, cy - 0.5)).to((x0 + 0.5, cy - 2.5))
            d += Dl().at((x0 + 1.5, cy - 2.5)).to((x0 + 1.5, cy - 0.5))
            d += elm.Line().at((x0 + 0.5, cy - 2.5)).to((x0 + 1.5, cy - 2.5))
            d += elm.Dot().at((x0 + 0.5, cy)); d += elm.Dot().at((x0 + 1.0, cy - 2.5))
            d += elm.Label().at((x0 + 1.0, cy + 1.0)).label(name, fontsize=10)
        sy = cy - 4.5
        d += elm.Line().at((kx + 1.0, cy - 2.5)).to((kx + 1.0, sy))
        d += elm.Line().at((kx + 3.2, cy - 2.5)).to((kx + 3.2, sy))
        d += elm.Line().at((kx + 1.0, sy)).to((kx + 1.6, sy))
        d += elm.Line().at((kx + 3.2, sy)).to((kx + 2.6, sy))
        d += elm.Dot(open=True).at((kx + 1.6, sy))
        d += elm.Dot(open=True).at((kx + 2.6, sy))
        d += elm.Dot(open=True).at((kx + 2.1, sy - 1.0))
        d += elm.Line().at((kx + 2.1, sy - 1.0)).to((kx + 1.7, sy - 0.1))
        d += elm.Line().at((kx + 2.1, sy - 1.0)).to((kx + 2.1, sy - 1.7))
        d += elm.Ground().at((kx + 2.1, sy - 1.7))
        d += elm.Label().at((kx + 2.1, sy + 0.6)).label('1   off   3', fontsize=S)
        d += elm.Label().at((kx + 2.8, sy - 1.1)).label('SW2 CLIP\non-off-on', halign='left', fontsize=10)
        vx = kx + 5.6
        d += elm.Line().at((kx + 3.2, cy)).to((vx, cy))
        d += elm.Label().at((vx + 0.2, cy + 0.3)).label('VOL_IN (3)', fontsize=S, halign='left')
        VOL = elm.Potentiometer().at((vx, cy)).to((vx, cy - 3.5))
        d += VOL
        d += elm.Label().at((vx + 0.3, cy - 2.9)).label('VOLUME\nA100k', halign='left')
        d += elm.Ground().at((vx, cy - 3.5))
        d += elm.Line().at(VOL.tap).to((vx + 2.2, VOL.tap.y))
        d += elm.Dot(open=True).at((vx + 2.2, VOL.tap.y)).label('OUT (2)\n(3PDT)', 'right')
        d += elm.Label().at((-0.5, 0.9)).label(
            'Bosstone, silicon: Q1 NPN (2N2222; BC337, 2N3904, S8050-D also work), Q2 PNP (2N3906; BC327, S8550, A1015 also work).\n'
            'Q1 is biased by R2 + R3 from its collector; C2 grounds their junction so the feedback sets DC bias without cutting gain.\n'
            'Q2 is a PNP emitter follower DC-coupled to Q1 collector. Reconstructed from published clone BOMs (see README). All grounds common.',
            halign='left', fontsize=9)
    to_png(path, 2000)
    print(path.name, 'written')


if __name__ == '__main__':
    stripboard()
    breadboard()
    schematic()
