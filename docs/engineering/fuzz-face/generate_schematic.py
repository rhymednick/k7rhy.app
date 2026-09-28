# Generates fuzz-face-2n3904.svg. Requires: pip install schemdraw matplotlib
# PNG: python3 -c "import cairosvg; cairosvg.svg2png(url='fuzz-face-2n3904.svg', write_to='fuzz-face-2n3904.png', output_width=2000, background_color='white')"
import schemdraw
import schemdraw.elements as elm
schemdraw.use('matplotlib')

V = 18.0          # VCC rail
S = 8             # node label font
with schemdraw.Drawing(file=str(__import__('pathlib').Path(__file__).with_name('fuzz-face-2n3904.svg')), show=False) as d:
    d.config(fontsize=11)

    # ---- Input ----
    d += elm.Dot(open=True).at((0, 6)).label('J1 IN\n(tip)', 'left')
    d += elm.Line().at((0, 6)).to((1.5, 6))
    d += elm.Dot().at((1.5, 6))
    d += elm.Resistor().at((1.5, 6)).to((1.5, 3))
    d += elm.Ground().at((1.5, 3))
    d += elm.Capacitor().at((1.5, 6)).to((4, 6)).label('C1\n470n film')
    d += elm.Dot().at((4, 6))
    d += elm.Label().at((4, 5.6)).label('Q1_BASE', fontsize=S, halign='right')
    d += elm.Line().at((4, 6)).to((5, 6))

    # ---- Q1 ----
    Q1 = elm.BjtNpn(circle=True).at((5, 6)).anchor('base')
    d += Q1
    d += elm.Label().at((Q1.collector.x + 0.5, 6.2)).label('Q1\n2N3904', halign='left')
    d += elm.Ground().at(Q1.emitter)
    q1x = Q1.collector.x
    d += elm.Line().at(Q1.collector).to((q1x, 9))
    d += elm.Dot().at((q1x, 9))
    d += elm.Resistor().at((q1x, 9)).to((q1x, 12))
    d += elm.Dot().at((q1x, 12))
    d += elm.Label().at((q1x + 0.2, 12)).label('R1_MID', fontsize=S, halign='left')
    d += elm.Resistor().at((q1x, 12)).to((q1x, V))

    # ---- Q1C_Q2B (direct coupling) ----
    q2b = (9.0, 9)
    d += elm.Line().at((q1x, 9)).to(q2b)
    d += elm.Label().at(((q1x + 9) / 2, 9.35)).label('Q1C_Q2B (direct)', fontsize=S)

    # ---- Q2 ----
    Q2 = elm.BjtNpn(circle=True).at(q2b).anchor('base')
    d += Q2
    d += elm.Label().at((Q2.collector.x + 0.5, 8.6)).label('Q2\n2N3904', halign='left')
    ex = Q2.emitter.x
    d += elm.Line().at(Q2.emitter).to((ex, 6))
    d += elm.Dot().at((ex, 6))
    d += elm.Label().at((ex + 0.2, 6.3)).label('Q2_EMIT', fontsize=S, halign='left')

    # Fuzz pot: lug 3 = Q2_EMIT (top), lug 1 = GND (bottom), wiper -> C2+
    FZ = elm.Potentiometer().at((ex, 6)).to((ex, 3))
    d += FZ
    d += elm.Label().at((ex - 0.6, 4.5)).label('FUZZ\nB1k', halign='right')
    d += elm.Label().at((ex - 0.25, 5.75)).label('(3)', fontsize=8, halign='right')
    d += elm.Label().at((ex - 0.25, 3.25)).label('(1)', fontsize=8, halign='right')
    d += elm.Ground().at((ex, 3))
    wx = ex + 2.2
    d += elm.Line().at(FZ.tap).to((wx, FZ.tap.y))
    d += elm.Dot().at((wx, FZ.tap.y))
    d += elm.Label().at((wx + 0.2, FZ.tap.y + 0.35)).label('FUZZ_WIPER (2)', fontsize=S, halign='left')
    d += elm.Capacitor(polar=True).at((wx, FZ.tap.y)).to((wx, 1.8))
    d += elm.Ground().at((wx, 1.8))

    # ---- Feedback R4: Q2_EMIT -> Q1_BASE ----
    fx = ex - 2.3
    d += elm.Line().at((ex, 6)).to((fx, 6))
    d += elm.Line().at((fx, 6)).to((fx, 1.2))
    d += elm.Resistor().at((fx, 1.2)).to((4, 1.2)).label('R4  100k  (feedback)', 'bottom')
    d += elm.Line().at((4, 1.2)).to((4, 6))

    # ---- Q2 collector network ----
    cx = Q2.collector.x
    d += elm.Line().at(Q2.collector).to((cx, 10.5))
    d += elm.Dot().at((cx, 10.5))
    d += elm.Label().at((cx + 0.2, 10.05)).label('Q2_COL', fontsize=S, halign='left')
    d += elm.Label().at((cx + 0.2, 9.6)).label('set ≈ 4.5 V DC', fontsize=S, halign='left', color='#c0392b')
    VR1 = elm.Potentiometer().at((cx, 13.5)).to((cx, 10.5))   # drawn top-down so tap is on right
    d += VR1
    d += elm.Label().at((cx - 0.6, 12)).label('VR1\n50k trim\n(rheostat)', halign='right')
    # wiper tied to Q2_COL lug
    tx = cx + 1.3
    d += elm.Line().at(VR1.tap).to((tx, VR1.tap.y))
    d += elm.Line().at((tx, VR1.tap.y)).to((tx, 10.5))
    d += elm.Line().at((tx, 10.5)).to((cx, 10.5))
    d += elm.Dot().at((cx, 13.5))
    d += elm.Label().at((cx + 0.2, 13.75)).label('BIAS_TOP', fontsize=S, halign='left')
    d += elm.Resistor().at((cx, 13.5)).to((cx, 16))
    d += elm.Dot().at((cx, 16))
    d += elm.Resistor().at((cx, 16)).to((cx, V))

    # ---- Output from OUT_TAP ----
    vx = cx + 4
    d += elm.Capacitor().at((cx, 16)).to((vx, 16)).label('C3\n10n film')
    d += elm.Label().at((cx + 0.2, 15.55)).label('OUT_TAP', fontsize=S, halign='left')
    d += elm.Dot().at((vx, 16))
    d += elm.Label().at((vx + 0.2, 16.3)).label('VOL_IN (3)', fontsize=S, halign='left')
    VOL = elm.Potentiometer().at((vx, 16)).to((vx, 12.5))
    d += VOL
    d += elm.Label().at((vx - 0.6, 14.25)).label('VOLUME\nA500k', halign='right')
    d += elm.Label().at((vx + 0.2, 12.7)).label('(1)', fontsize=S, halign='left')
    d += elm.Ground().at((vx, 12.5))
    ox = vx + 2.5
    d += elm.Line().at(VOL.tap).to((ox, VOL.tap.y))
    d += elm.Label().at((vx + 1.6, VOL.tap.y + 0.3)).label('OUTPUT (2)', fontsize=S)
    d += elm.Dot(open=True).at((ox, VOL.tap.y)).label('J2 OUT\n(tip)', 'right')

    # ---- VCC rail + decoupling ----
    d += elm.Line().at((-0.5, V)).to((cx, V))
    d += elm.Dot().at((q1x, V))
    d += elm.Vdd().at((-0.5, V)).label('+9 V (VCC)')
    d += elm.Dot().at((1.5, V))
    d += elm.Capacitor().at((1.5, V)).to((1.5, 15.5))
    d += elm.Ground().at((1.5, 15.5))


    L = lambda xy, t, **k: d.add(elm.Label().at(xy).label(t, halign=k.pop('h','right'), **k))
    L((1.0, 4.5), 'RPD\n1M')
    L((q1x - 0.6, 10.5), 'R1B\n10k')
    L((q1x - 0.6, 15.0), 'R1A\n22k')
    L((wx + 0.6, 2.9), 'C2 22µ\nelectrolytic', h='left')
    L((cx - 0.6, 14.75), 'R3\n2.2k')
    L((cx - 0.6, 17.0), 'R2\n470')
    L((2.0, 16.75), 'C4 100n\n(optional)', h='left')
    d += elm.Label().at((-1, -0.8)).label(
        '2N3904 Fuzz Face — NPN, negative ground, 9 V.  All grounds common (battery −, J1/J2 sleeves).\n'
        'Pot lugs shown in ( ).  VR1 wiper tied to its Q2_COL lug.  Bias: measure Q2_COL to GND, no signal.',
        halign='left', fontsize=9)
