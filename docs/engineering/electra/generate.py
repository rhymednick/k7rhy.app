"""Electra distortion (silicon) schematic, breadboard and stripboard.

Run from anywhere: python3 docs/engineering/electra/generate.py
Requires: pip install schemdraw matplotlib cairosvg
Each layout is checked against the netlist below before it is drawn.
"""
from pathlib import Path
import sys

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent / 'pedal-diagrams'))
from pedaldraw import Stripboard, Breadboard, to_png  # noqa: E402

NAME = 'electra'

CORE = {
    'DRIVE_W': {'DRIVE.2', 'C1.1'},
    'BASE': {'C1.2', 'Q1.B', 'R1.2'},
    'COL': {'Q1.C', 'R1.1', 'R3.2', 'C2.1'},
    'EMIT': {'Q1.E', 'R2.1'},
    'CLIP': {'C2.2', 'D1.A', 'D2.K', 'D3.A', 'D4.K', 'VOL.3'},
    'SI_RET': {'D1.K', 'D2.A', 'SW2.1'},
    'LED_RET': {'D3.K', 'D4.A', 'SW2.3'},
}


def stripboard():
    expected = dict(CORE)
    expected.update({
        'VCC': {'R3.1', 'BAT.+', 'LED.+'},
        'GND': {'R2.2', 'DRIVE.1', 'VOL.1', 'SW2.2', 'J1.sleeve', 'J2.sleeve', 'SW.L1'},
    })
    parts = [
        ('res', 'R3', '4.7k', {'1': (1, 2), '2': (2, 5)}, {'lab': (0, -0.75)}),
        ('film', 'C1', '100n', {'1': (3, 2), '2': (3, 5)}, {'lab': (0, 0.85)}),
        ('to92', 'Q1', '2N3904', {'C': (2, 7), 'B': (3, 7), 'E': (4, 7)}, {'flat': 'right', 'lab': (-1.6, 1.6)}),
        ('res', 'R1', '2.2M', {'1': (2, 9), '2': (3, 12)}, {'lab': (0, -0.75)}),
        ('res', 'R2', '470', {'1': (4, 10), '2': (7, 10)}, {'lab': (-1.1, -0.6)}),
        ('film', 'C2', '100n', {'1': (2, 15), '2': (5, 15)}, {'lab': (0.15, -2.0)}),
        ('diode', 'D1', '1N4148', {'A': (5, 2), 'K': (6, 4)}, {'lab': (-0.6, -0.8)}),
        ('diode', 'D2', '1N4148', {'A': (6, 5), 'K': (5, 7)}, {'lab': (0.7, 0.85)}),
        ('led', 'D3', 'LED', {'A': (5, 12), 'K': (6, 12)}, {'lab': (0, -1.25)}),
        ('led', 'D4', 'LED', {'A': (6, 14), 'K': (5, 14)}, {'lab': (0, -1.25)}),
    ]
    cuts = [(3, 3), (6, 8)]
    pads = {'BAT.+': (1, 14), 'LED.+': (1, 16), 'DRIVE.2': (3, 1), 'SW2.1': (6, 1),
            'VOL.3': (5, 16), 'SW2.3': (6, 16),
            'J1.sleeve': (7, 2), 'DRIVE.1': (7, 4), 'SW2.2': (7, 6), 'SW.L1': (7, 8), 'VOL.1': (7, 12), 'J2.sleeve': (7, 14)}
    labels = {'BAT.+': 'BAT +', 'LED.+': 'LED +9 V', 'DRIVE.2': 'DRIVE 2', 'SW2.1': 'CLIP SW 1', 'VOL.3': 'VOL 3',
              'SW2.3': 'CLIP SW 3', 'J1.sleeve': 'J1 sleeve', 'DRIVE.1': 'DRIVE 1', 'SW2.2': 'CLIP SW 2',
              'SW.L1': '3PDT lug 1', 'VOL.1': 'VOL 1', 'J2.sleeve': 'J2 sleeve'}
    pos = {'BAT.+': 'above', 'LED.+': 'above', 'DRIVE.2': 'w', 'SW2.1': 'w', 'VOL.3': 'e', 'SW2.3': 'e'}
    pos.update({k: 'below' for k in ('J1.sleeve', 'DRIVE.1', 'SW2.2', 'SW.L1', 'VOL.1', 'J2.sleeve')})
    sb = Stripboard(16, 7, cuts, parts, [], pads, [], expected, labels)
    notes = [
        'Cut both tracks first (C3, F8) and check with a meter.',
        'Q1: flat face right; facing the flat, legs read E-B-C',
        '  (2N3904, 2N2222, BC337). C1815 and S8050 are',
        '  E-C-B: rotate to suit.',
        'C1 lies along strip C over the cut at C3.',
        'D1/D2 (1N4148) and D3/D4 (LEDs) are each an opposed',
        '  pair: bands / short legs as drawn. Use two LEDs of',
        '  the same colour so both halves clip alike.',
        'CLIP switch (on-off-on): lug 1 = 1N4148, centre off =',
        '  no clipping, lug 3 = LEDs.',
        '',
        'Off-board: 3PDT lug 2 to DRIVE lug 3; VOL lug 2 to',
        '  3PDT lug 3. Wire the 3PDT, jacks, LED and battery',
        '  as the Fuzz Face footswitch diagram.',
        '',
        'Check: no signal, strip B (collector) to GND reads',
        '  about 5–7.5 V. Above 7.5 V, try 1.5M or 1M for R1.',
    ]
    sb.draw(HERE / f'{NAME}-stripboard.svg', 'Electra distortion: stripboard layout',
            '16 × 7 holes (0.1 in pitch), strips horizontal. Silicon diodes or LEDs selected by a toggle; matches the schematic; nets auto-checked.',
            notes, pos)


def breadboard():
    expected = dict(CORE)
    expected.update({
        'INPUT': {'J1.tip', 'DRIVE.3'},
        'VCC': {'R3.1', 'BAT.+'},
        'GND': {'R2.2', 'DRIVE.1', 'VOL.1', 'SW2.2', 'J1.sleeve', 'J2.sleeve', 'BAT.-'},
        'OUTPUT': {'VOL.2', 'J2.tip'},
    })
    parts = [
        ('film', 'C1', '100n', {'1': (3, 'g'), '2': (7, 'g')}, {'lab': (-0.6, 0.95)}),
        ('to92', 'Q1', '2N3904', {'E': (6, 'f'), 'B': (7, 'f'), 'C': (8, 'f')}, {'flat': 'down', 'lab': (-2.6, -1.0)}),
        ('res', 'R1', '2.2M', {'1': (11, 'h'), '2': (7, 'h')}, {'lab': (0, 0.85)}),
        ('res', 'R2', '470', {'1': (6, 'i'), '2': (6, 'B-')}, {'lab': (-1.5, 0)}),
        ('res', 'R3', '4.7k', {'1': (11, 'B+'), '2': (11, 'j')}, {'lab': (1.6, 0.3)}),
        ('film', 'C2', '100n', {'1': (11, 'i'), '2': (15, 'i')}, {'lab': (0, 0.95)}),
        ('diode', 'D1', '1N4148', {'A': (15, 'g'), 'K': (18, 'g')}, {'lab': (0, -0.75)}),
        ('diode', 'D2', '1N4148', {'A': (18, 'h'), 'K': (15, 'h')}, {'lab': (2.5, 0.3)}),
        ('led', 'D3', 'LED', {'A': (15, 'b'), 'K': (18, 'b')}, {'lab': (0, -1.0)}),
        ('led', 'D4', 'LED', {'A': (18, 'd'), 'K': (15, 'd')}, {'lab': (2.5, 0.3)}),
    ]
    jumpers = [
        ((8, 'g'), (11, 'g'), '#e67e22'),     # collector -> R1 / R3 / C2 column
        ((15, 'f'), (15, 'e'), '#16a085'),    # CLIP to the LED pair
        ((18, 'e'), (20, 'f'), '#8e44ad'),    # LED return -> switch column
        ((29, 'T-'), (29, 'B-'), '#222'),
        ((30, 'T+'), (30, 'B+'), '#c0392b'),
    ]
    offboard = [
        {'type': 'pot', 'ref': 'DRIVE', 'label': 'DRIVE', 'value': 'B100k', 'x': 3},
        {'type': 'pot', 'ref': 'VOL', 'label': 'VOLUME', 'value': 'A100k', 'x': 14},
        {'type': 'spdt', 'ref': 'SW2', 'label': 'CLIP', 'value': 'SPDT on-off-on', 'x': 19},
        {'type': 'jack', 'ref': 'J2', 'x': 24},
    ]
    wires = [
        ('J1.sleeve', (1, 'T-'), '#222'),
        ('BAT.+', (3, 'T+'), '#c0392b'),
        ('BAT.-', (5, 'T-'), '#222'),
        ('DRIVE.1', (2, 'B-'), '#222'),
        ('DRIVE.2', (3, 'j'), '#27ae60'),
        ('VOL.1', (13, 'B-'), '#222'),
        ('VOL.3', (15, 'j'), '#16a085'),
        ('SW2.1', (18, 'j'), '#d35400'),
        ('SW2.2', (19, 'B-'), '#222'),
        ('SW2.3', (20, 'j'), '#8e44ad'),
        ('J2.sleeve', (26, 'B-'), '#222'),
    ]
    off_wires = [('J1.tip', 'DRIVE.3', '#27ae60'), ('VOL.2', 'J2.tip', '#2980b9')]
    bb = Breadboard(parts, jumpers, offboard, wires, off_wires, expected)
    notes = [
        'Q1: flat face toward row j, legs E-B-C left to',
        '  right. C1815 and S8050 are E-C-B: rotate.',
        'Orange jumper 8g–11g: collector to R1, R3, C2.',
        'R3 runs from 11j over the GND rail to +9 V.',
        'D1/D2: opposed 1N4148 pair, columns 15–18 bottom.',
        'D3/D4: opposed LED pair (same colour), top half;',
        '  long leg (anode) of D3 in 15b, of D4 in 18d.',
        'CLIP switch: lug 1 side = 1N4148, centre = none,',
        '  lug 3 side = LEDs.',
        'Pots and switch drawn from the rear, lugs up.',
        '',
        'Check: no signal, column 11 bottom (collector) to',
        '  GND reads about 5–7.5 V.',
    ]
    colours = [('#c0392b', '+9 V'), ('#222', 'ground'), ('#27ae60', 'input / drive'),
               ('#e67e22', 'collector jumper'), ('#16a085', 'clip node'), ('#d35400', '1N4148 return'),
               ('#8e44ad', 'LED return'), ('#2980b9', 'output')]
    bb.draw(HERE / f'{NAME}-breadboard.svg', 'Electra distortion: breadboard layout',
            'Silicon NPN, negative ground, 9 V. Half-size breadboard, top view. Matches the electra schematic.',
            notes, colours)


def schematic():
    import schemdraw
    import schemdraw.elements as elm
    schemdraw.use('matplotlib')
    S = 8
    path = HERE / f'{NAME}-schematic.svg'
    with schemdraw.Drawing(file=str(path), show=False) as d:
        d.config(fontsize=11)
        d += elm.Dot(open=True).at((0, 6)).label('IN\n(3PDT)', 'left')
        d += elm.Line().at((0, 6)).to((0.8, 6))
        DR = elm.Potentiometer().at((0.8, 6)).to((0.8, 2.5))
        d += DR
        d += elm.Ground().at((0.8, 2.5))
        d += elm.Label().at((0.2, 4.25)).label('DRIVE\nB100k', halign='right')
        d += elm.Line().at(DR.tap).to((2.2, DR.tap.y))
        d += elm.Line().at((2.2, DR.tap.y)).to((2.2, 6))
        d += elm.Capacitor().at((2.2, 6)).to((4.5, 6)).label('C1\n100n')
        d += elm.Dot().at((4.5, 6))
        d += elm.Label().at((4.5, 5.55)).label('BASE', fontsize=S, halign='right')
        d += elm.Line().at((4.5, 6)).to((5, 6))
        Q1 = elm.BjtNpn(circle=True).at((5, 6)).anchor('base')
        d += Q1
        d += elm.Label().at((Q1.collector.x + 0.4, 5.6)).label('Q1\n2N3904', halign='left')
        d += elm.Resistor().at(Q1.emitter).to((Q1.emitter.x, 2.5))
        d += elm.Label().at((Q1.emitter.x + 0.5, 3.6)).label('R2\n470', halign='left')
        d += elm.Ground().at((Q1.emitter.x, 2.5))
        cx = Q1.collector.x
        d += elm.Line().at(Q1.collector).to((cx, 8.5))
        d += elm.Dot().at((cx, 8.5))
        d += elm.Label().at((cx + 0.2, 8.1)).label('COL', fontsize=S, halign='left')
        d += elm.Resistor().at((cx, 8.5)).to((cx, 11.5))
        d += elm.Label().at((cx + 0.5, 10)).label('R3\n4.7k', halign='left')
        d += elm.Vdd().at((cx, 11.5)).label('+9 V')
        d += elm.Line().at((cx, 8.5)).to((4.5, 8.5))
        d += elm.Resistor().at((4.5, 8.5)).to((4.5, 6))
        d += elm.Label().at((4.0, 7.25)).label('R1\n2.2M', halign='right')
        kx = cx + 3.2
        d += elm.Line().at((cx, 8.5)).to((cx + 0.6, 8.5))
        d += elm.Capacitor().at((cx + 0.6, 8.5)).to((kx, 8.5)).label('C2\n100n')
        d += elm.Dot().at((kx, 8.5))
        d += elm.Label().at((kx - 0.2, 8.9)).label('CLIP', fontsize=S, halign='right')
        # diode pairs to the switch
        for x0, kind, name in ((kx, 'si', 'D1 / D2\n1N4148'), (kx + 2.2, 'led', 'D3 / D4\nLEDs')):
            d += elm.Line().at((kx, 8.5)).to((x0 + 1.0, 8.5))
            Dl = elm.LED if kind == 'led' else elm.Diode
            d += elm.Line().at((x0 + 0.5, 8.5)).to((x0 + 0.5, 8.0))
            d += elm.Line().at((x0 + 1.5, 8.5)).to((x0 + 1.5, 8.0))
            d += Dl().at((x0 + 0.5, 8.0)).to((x0 + 0.5, 6.0))
            d += Dl().at((x0 + 1.5, 6.0)).to((x0 + 1.5, 8.0))
            d += elm.Line().at((x0 + 0.5, 6.0)).to((x0 + 1.5, 6.0))
            d += elm.Dot().at((x0 + 0.5, 8.5)); d += elm.Dot().at((x0 + 1.0, 6.0))
            d += elm.Label().at((x0 + 1.0, 9.6)).label(name, fontsize=10)
        d += elm.Line().at((kx + 1.0, 6.0)).to((kx + 1.0, 4.0))
        d += elm.Line().at((kx + 3.2, 6.0)).to((kx + 3.2, 4.0))
        d += elm.Line().at((kx + 1.0, 4.0)).to((kx + 1.6, 4.0))
        d += elm.Line().at((kx + 3.2, 4.0)).to((kx + 2.6, 4.0))
        d += elm.Dot(open=True).at((kx + 1.6, 4.0))
        d += elm.Dot(open=True).at((kx + 2.6, 4.0))
        d += elm.Dot(open=True).at((kx + 2.1, 3.0))
        d += elm.Line().at((kx + 2.1, 3.0)).to((kx + 1.7, 3.9))
        d += elm.Line().at((kx + 2.1, 3.0)).to((kx + 2.1, 2.3))
        d += elm.Ground().at((kx + 2.1, 2.3))
        d += elm.Label().at((kx + 2.1, 4.6)).label('1   off   3', fontsize=S)
        d += elm.Label().at((kx + 2.8, 2.9)).label('SW2 CLIP\non-off-on', halign='left', fontsize=10)
        vx = kx + 5.6
        d += elm.Line().at((kx + 3.2, 8.5)).to((vx, 8.5))
        d += elm.Label().at((vx + 0.2, 8.8)).label('VOL_IN (3)', fontsize=S, halign='left')
        VOL = elm.Potentiometer().at((vx, 8.5)).to((vx, 5.0))
        d += VOL
        d += elm.Label().at((vx + 0.3, 5.6)).label('VOLUME\nA100k', halign='left')
        d += elm.Ground().at((vx, 5.0))
        d += elm.Line().at(VOL.tap).to((vx + 2.2, VOL.tap.y))
        d += elm.Dot(open=True).at((vx + 2.2, VOL.tap.y)).label('OUT (2)\n(3PDT)', 'right')
        d += elm.Label().at((-0.5, 0.9)).label(
            'Electra distortion, silicon: Q1 any small NPN (2N3904 original; 2N2222, BC337, C1815-GR, S8050-D also work).\n'
            'R1 feeds the base from the collector, so Q1 sets its own bias (collector ≈ 5–7.5 V). The original used germanium diodes;\n'
            'here SW2 picks 1N4148s (hard, lower output) or matched LEDs (louder, more open). All grounds common.',
            halign='left', fontsize=9)
    to_png(path, 2000)
    print(path.name, 'written')


if __name__ == '__main__':
    stripboard()
    breadboard()
    schematic()
