"""Bazz Fuss (silicon Darlington) schematic, breadboard and stripboard.

Run from anywhere: python3 docs/engineering/bazz-fuss/generate.py
Requires: pip install schemdraw matplotlib cairosvg
Each layout is checked against the netlist below before it is drawn.
"""
from pathlib import Path
import sys

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent / 'pedal-diagrams'))
from pedaldraw import Stripboard, Breadboard, to_png  # noqa: E402

NAME = 'bazz-fuss'

# Core netlist. Pin names: R1.1/R1.2, C1.+/C1.-, D1.A/D1.K, QA.E/B/C, VOL.1/2/3.
CORE = {
    'BASE': {'C1.+', 'QA.B', 'D1.K'},
    'MID': {'QA.E', 'QB.B'},
    'COL': {'QA.C', 'QB.C', 'R1.2', 'D1.A', 'C2.1'},
    'VOL_IN': {'C2.2', 'VOL.3'},
}


# ------------------------------------------------------------ stripboard
def stripboard():
    expected = dict(CORE)
    expected.update({
        'INPUT': {'IN', 'C1.-', 'R2.1'},
        'VCC': {'R1.1', 'BAT.+', 'LED.+'},
        'GND': {'QB.E', 'R2.2', 'VOL.1', 'J1.sleeve', 'J2.sleeve', 'SW.L1'},
    })
    parts = [
        ('res', 'R1', '10k', {'1': (1, 2), '2': (2, 5)}, {'lab': (0, -0.75)}),
        ('diode', 'D1', '1N4148', {'A': (2, 1), 'K': (3, 3)}, {'lab': (2.4, -0.25)}),
        ('elec', 'C1', '10µ', {'+': (3, 4), '-': (4, 4)}, {'lab': (1.55, 0.1)}),
        ('res', 'R2', '1M', {'1': (4, 3), '2': (5, 1)}, {'lab': (0.3, 1.0)}),
        ('to92', 'QA', 'NPN', {'C': (2, 8), 'B': (3, 8), 'E': (4, 8)}, {'flat': 'right', 'lab': (-1.0, -1.75)}),
        ('to92', 'QB', 'NPN', {'C': (3, 11), 'B': (4, 11), 'E': (5, 11)}, {'flat': 'right', 'lab': (-1.0, -1.75)}),
        ('film', 'C2', '100n', {'1': (3, 13), '2': (6, 13)}, {'lab': (1.3, 0.0)}),
    ]
    cuts = [(3, 10), (4, 6)]
    links = [((2, 12), (3, 12))]
    pads = {'BAT.+': (1, 12), 'LED.+': (1, 14), 'IN': (4, 1),
            'J1.sleeve': (5, 4), 'SW.L1': (5, 7), 'VOL.1': (5, 12), 'J2.sleeve': (5, 14), 'VOL.3': (6, 11)}
    labels = {'BAT.+': 'BAT +', 'LED.+': 'LED +9 V', 'IN': 'IN (3PDT lug 2)', 'J1.sleeve': 'J1 sleeve',
              'SW.L1': '3PDT lug 1', 'VOL.1': 'VOL 1', 'J2.sleeve': 'J2 sleeve', 'VOL.3': 'VOL 3'}
    pos = {'BAT.+': 'above', 'LED.+': 'above', 'IN': 'sw', 'J1.sleeve': 'below', 'SW.L1': 'below',
           'VOL.1': 'below', 'J2.sleeve': 'below', 'VOL.3': 'below'}
    sb = Stripboard(14, 6, cuts, parts, links, pads, [], expected, labels)
    notes = [
        'Cut both tracks first (C10, D6) and check with a meter.',
        'QA and QB: flat face right. Facing the flat, legs read',
        '  E-B-C left to right (2N3904, 2N2222, BC337, PN2222).',
        '  C1815, S8050 and A1015 are E-C-B: rotate to suit.',
        'QA emitter drives QB base (strip D, 7–14): a Darlington.',
        'D1: band (cathode) to strip C, the base.',
        '  LED option: same two holes, long leg (anode) in B1.',
        'C1: + to strip C (base sits at about 1.2 V).',
        'Hole names: row letter + column, e.g. B12.',
        '',
        'Off-board: VOL lug 2 to 3PDT lug 3. Wire the 3PDT,',
        '  jacks, LED and battery as the Fuzz Face footswitch',
        '  diagram (docs/engineering/fuzz-face).',
        '',
        'Check: no signal, strip B (collector) to GND reads',
        '  about 1.2–1.6 V with D1, 2–2.6 V with an LED.',
    ]
    sb.draw(HERE / f'{NAME}-stripboard.svg', 'Bazz Fuss: stripboard layout',
            '14 × 6 holes (0.1 in pitch), strips horizontal. Silicon Darlington from two NPNs; matches the schematic; nets auto-checked.',
            notes, pos)


# ------------------------------------------------------------ breadboard
def breadboard():
    expected = dict(CORE)
    expected.update({
        'INPUT': {'J1.tip', 'C1.-', 'R2.1'},
        'VCC': {'R1.1', 'BAT.+'},
        'GND': {'QB.E', 'R2.2', 'VOL.1', 'J1.sleeve', 'J2.sleeve', 'BAT.-'},
        'OUTPUT': {'VOL.2', 'J2.tip'},
    })
    parts = [
        ('res', 'R2', '1M', {'1': (2, 'a'), '2': (2, 'T-')}, {'lab': (1.5, 0.3)}),
        ('elec', 'C1', '10µ', {'-': (2, 'd'), '+': (7, 'd')}, {'lab': (0, -1.0)}),
        ('to92', 'QA', 'NPN', {'E': (6, 'e'), 'B': (7, 'e'), 'C': (8, 'e')}, {'flat': 'down', 'lab': (2.9, 0.0)}),
        ('diode', 'D1', '1N4148', {'K': (7, 'b'), 'A': (11, 'b')}, {'lab': (0, -0.8)}),
        ('res', 'R1', '10k', {'1': (11, 'T+'), '2': (11, 'a')}, {'lab': (1.7, 0.1)}),
        ('to92', 'QB', 'NPN', {'E': (5, 'g'), 'B': (6, 'g'), 'C': (7, 'g')}, {'flat': 'down', 'lab': (2.9, 0.0)}),
        ('film', 'C2', '100n', {'1': (11, 'e'), '2': (14, 'f')}, {'lab': (1.9, -0.2)}),
    ]
    jumpers = [
        ((8, 'c'), (11, 'c'), '#e67e22'),   # QA collector -> R1 / D1 / C2 column
        ((6, 'd'), (6, 'f'), '#8e44ad'),    # QA emitter -> QB base
        ((8, 'd'), (7, 'f'), '#e67e22'),    # collectors joined
        ((5, 'j'), (5, 'B-'), '#222'),      # QB emitter -> GND
        ((29, 'T-'), (29, 'B-'), '#222'),   # GND rails linked
        ((30, 'T+'), (30, 'B+'), '#c0392b'),  # VCC rails linked
    ]
    offboard = [
        {'type': 'pot', 'ref': 'VOL', 'label': 'VOLUME', 'value': 'A100k', 'x': 13},
        {'type': 'jack', 'ref': 'J2', 'x': 18},
    ]
    wires = [
        ('J1.tip', (2, 'c'), '#27ae60'),
        ('J1.sleeve', (1, 'T-'), '#222'),
        ('BAT.+', (3, 'T+'), '#c0392b'),
        ('BAT.-', (5, 'T-'), '#222'),
        ('VOL.1', (12, 'B-'), '#222'),
        ('VOL.3', (14, 'j'), '#16a085'),
        ('J2.sleeve', (20, 'B-'), '#222'),
    ]
    off_wires = [('VOL.2', 'J2.tip', '#2980b9')]
    bb = Breadboard(parts, jumpers, offboard, wires, off_wires, expected)
    notes = [
        'QA (top) and QB (bottom): flat face toward row j,',
        '  legs E-B-C left to right. C1815, S8050 and A1015',
        '  are E-C-B: check the datasheet and rotate.',
        'Purple jumper 6d–6f: QA emitter to QB base.',
        'Orange jumpers 8c–11c and 8d–7f join the collectors.',
        'D1: band (cathode) to column 7 top, the base.',
        '  LED option: swap D1 for an LED, long leg (anode)',
        '  in 11b, short leg in 7b.',
        'C1: + toward the base (column 7).',
        'Pots drawn from the rear, lugs up.',
        '',
        'Check: no signal, column 11 top (collector) to GND',
        '  reads about 1.2–1.6 V; 2–2.6 V with an LED.',
    ]
    colours = [('#c0392b', '+9 V'), ('#222', 'ground'), ('#27ae60', 'input'), ('#e67e22', 'collector jumpers'),
               ('#8e44ad', 'QA emitter → QB base'), ('#16a085', 'C2 → VOL 3'), ('#2980b9', 'output')]
    bb.draw(HERE / f'{NAME}-breadboard.svg', 'Bazz Fuss: breadboard layout',
            'Silicon Darlington (two NPNs), negative ground, 9 V. Half-size breadboard, top view. Matches the bazz-fuss schematic.',
            notes, colours)


# ------------------------------------------------------------ schematic
def schematic():
    import schemdraw
    import schemdraw.elements as elm
    schemdraw.use('matplotlib')
    S = 8
    path = HERE / f'{NAME}-schematic.svg'
    with schemdraw.Drawing(file=str(path), show=False) as d:
        d.config(fontsize=11)
        d += elm.Dot(open=True).at((0, 4)).label('IN\n(3PDT)', 'left')
        d += elm.Line().at((0, 4)).to((1.5, 4))
        d += elm.Dot().at((1.5, 4))
        d += elm.Resistor().at((1.5, 4)).to((1.5, 1))
        d += elm.Label().at((1.0, 2.5)).label('R2\n1M', halign='right')
        d += elm.Ground().at((1.5, 1))
        d += elm.Capacitor(polar=True).at((1.5, 4)).to((4.5, 4)).label('C1  10µ', 'top').reverse()
        d += elm.Dot().at((4.5, 4))
        d += elm.Label().at((4.5, 3.55)).label('BASE', fontsize=S, halign='right')
        d += elm.Line().at((4.5, 4)).to((5, 4))
        QA = elm.BjtNpn(circle=True).at((5, 4)).anchor('base')
        d += QA
        d += elm.Label().at((QA.collector.x - 0.2, 4.95)).label('QA', halign='right')
        qbb = (QA.emitter.x, QA.emitter.y - 1.2)
        d += elm.Line().at(QA.emitter).to(qbb)
        d += elm.Label().at((qbb[0] - 0.2, qbb[1] + 0.35)).label('MID', fontsize=S, halign='right')
        d += elm.Line().at(qbb).to((qbb[0] + 0.3, qbb[1]))
        QB = elm.BjtNpn(circle=True).at((qbb[0] + 0.3, qbb[1])).anchor('base')
        d += QB
        d += elm.Label().at((QB.collector.x + 0.4, QB.collector.y - 0.6)).label('QB', halign='left')
        d += elm.Ground().at(QB.emitter)
        cx = QB.collector.x
        top = 7.6
        d += elm.Line().at(QB.collector).to((cx, top))
        d += elm.Line().at(QA.collector).to((QA.collector.x, top))
        d += elm.Line().at((QA.collector.x, top)).to((cx, top))
        d += elm.Dot().at((QA.collector.x, top))
        d += elm.Dot().at((cx, top))
        # D1: collector (anode) -> base (cathode), drawn above the transistors
        d += elm.Line().at((QA.collector.x, top)).to((QA.collector.x - 0.0, top))
        d += elm.Line().at((4.5, 4)).to((4.5, top))
        d += elm.Diode().at((QA.collector.x, top)).to((4.5, top)).label('D1 1N4148\n(or LED)', 'top')
        d += elm.Label().at((cx + 0.2, top - 0.4)).label('COL', fontsize=S, halign='left')
        d += elm.Resistor().at((cx, top)).to((cx, 11))
        d += elm.Label().at((cx + 0.6, 9.3)).label('R1\n10k', halign='left')
        d += elm.Vdd().at((cx, 11)).label('+9 V')
        ox = cx + 2.6
        d += elm.Line().at((cx, top)).to((cx + 0.5, top))
        d += elm.Capacitor().at((cx + 0.5, top)).to((ox, top)).label('C2\n100n film')
        d += elm.Dot().at((ox, top))
        d += elm.Label().at((ox + 0.2, top + 0.3)).label('VOL_IN (3)', fontsize=S, halign='left')
        VOL = elm.Potentiometer().at((ox, top)).to((ox, top - 3.5))
        d += VOL
        d += elm.Label().at((ox - 0.6, top - 1.75)).label('VOLUME\nA100k', halign='right')
        d += elm.Ground().at((ox, top - 3.5))
        d += elm.Line().at(VOL.tap).to((ox + 2, VOL.tap.y))
        d += elm.Dot(open=True).at((ox + 2, VOL.tap.y)).label('OUT (2)\n(3PDT)', 'right')
        d += elm.Label().at((-0.5, -0.6)).label(
            'Bazz Fuss, silicon Darlington: QA and QB are any matching NPN pair you have (2N3904, 2N2222, BC337, C1815-GR, S8050-D).\n'
            'D1 sets the bias (collector ≈ 1.4 V) and clips; an LED in its place gives more headroom (collector ≈ 2.4 V). All grounds common.',
            halign='left', fontsize=9)
    to_png(path, 2000)
    print(path.name, 'written')


if __name__ == '__main__':
    stripboard()
    breadboard()
    schematic()
