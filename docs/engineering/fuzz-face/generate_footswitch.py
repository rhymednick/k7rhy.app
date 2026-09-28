"""3PDT true-bypass footswitch wiring for the 2N3904 Fuzz Face stripboard.

Uses the stripboard model's nets and switch states. Before drawing, it checks
both switch positions: ON routes J1 -> board INPUT and board OUTPUT -> J2 with
the LED grounded; BYPASS joins J1 to J2 and leaves the board and LED out.
"""
from pathlib import Path
import generate_stripboard as sb

HERE = Path(__file__).parent


def check_states():
    sb.verify()
    on = sb.verify(sb.SWITCH_STATES['ON'], return_find=True)
    by = sb.verify(sb.SWITCH_STATES['BYPASS'], return_find=True)
    same = lambda f, a, b: f(a) == f(b)
    assert same(on, 'J1.tip', 'C1.1'), 'ON: J1 tip must reach board INPUT'
    assert same(on, 'J2.tip', 'VOL.2'), 'ON: J2 tip must get board OUTPUT'
    assert same(on, 'LED.K', 'Q1.E'), 'ON: LED cathode must be grounded'
    assert not same(on, 'J1.tip', 'J2.tip'), 'ON: jacks must not be joined'
    assert same(by, 'J1.tip', 'J2.tip'), 'BYPASS: J1 tip must reach J2 tip'
    assert not same(by, 'J1.tip', 'C1.1'), 'BYPASS: board input must be disconnected'
    assert not same(by, 'J2.tip', 'VOL.2'), 'BYPASS: board output must be disconnected'
    assert not same(by, 'LED.K', 'Q1.E'), 'BYPASS: LED must be off'
    unplugged = sb.verify(return_find=True)
    plugged = sb.verify(sb.PLUG_IN, return_find=True)
    assert not same(unplugged, 'BAT.-', 'Q1.E'), 'no plug: battery must be disconnected'
    assert same(plugged, 'BAT.-', 'Q1.E'), 'plug in: battery - must reach GND'


out = []


def svg(s):
    out.append(s)


def text(x, y, s, size=14, anchor='middle', color='#111', weight='normal', bg=False):
    if bg:
        w = len(s) * size * 0.58 + 8
        x0 = x - w / 2 if anchor == 'middle' else (x - 4 if anchor == 'start' else x - w + 4)
        svg(f'<rect x="{x0:.0f}" y="{y - size:.0f}" width="{w:.0f}" height="{size + 6}" rx="3" fill="white" fill-opacity="0.92"/>')
    svg(f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="{anchor}" fill="{color}" font-weight="{weight}" font-family="Helvetica, Arial, sans-serif">{s}</text>')


def wire(pts, color, w=4, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ''
    svg('<polyline points="' + ' '.join(f'{x},{y}' for x, y in pts) + f'" fill="none" stroke="{color}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"{d}/>')


def box(x, y, w, h, title, sub='', fill='#f4efe2', stroke='#a8956a'):
    svg(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>')
    text(x + w / 2, y + 24, title, 15, weight='bold')
    if sub:
        text(x + w / 2, y + 44, sub, 12, color='#555')


def dot(x, y, r=6, color='#333'):
    svg(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{color}"/>')


# Switch geometry (lug-side view)
CX = [600, 720, 840]          # pole 1, 2, 3
RY = [340, 450, 560]          # ON row, commons, BYPASS row
LUG = {f'L{r * 3 + c + 1}': (CX[c], RY[r]) for r in range(3) for c in range(3)}

RED, BLK, GRN, BLU, ORG, PUR, YEL = '#c0392b', '#222', '#27ae60', '#2471a3', '#e67e22', '#8e44ad', '#b7950b'


def main():
    check_states()
    W, H = 1640, 980
    svg(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">')
    svg('<rect width="100%" height="100%" fill="white"/>')
    text(40, 42, '2N3904 Fuzz Face — footswitch, jacks, LED, and battery wiring', 24, anchor='start', weight='bold')
    text(40, 68, 'Switch drawn from the lug (back) side. Board hole names match the stripboard layout. Both switch positions auto-checked.', 14, anchor='start', color='#555')

    # --- top targets: straight above each ON-row lug
    box(530, 110, 140, 64, 'Board H16', 'GND')
    box(650, 190, 140, 64, 'Board B11', 'INPUT')
    box(770, 110, 140, 64, 'VOLUME lug 2', 'effect output')
    # --- switch body
    svg(f'<rect x="530" y="280" width="380" height="340" rx="18" fill="#dcdcdc" stroke="#8a8a8a" stroke-width="2"/>')
    text(720, 648, '3PDT footswitch — lug side', 15, weight='bold')
    text(518, RY[0] + 5, 'ON row', 13, anchor='end', color='#555', weight='bold')
    text(518, RY[1] + 5, 'commons', 13, anchor='end', color='#555', weight='bold')
    text(518, RY[2] + 5, 'BYPASS row', 13, anchor='end', color='#555', weight='bold')
    for i, lab in enumerate(['pole 1', 'pole 2', 'pole 3']):
        text(CX[i], 612, lab, 12, color='#555')

    # --- wires (drawn before lugs so lugs sit on top)
    # ON row straight up
    wire([LUG['L1'], (600, 174)], BLK)
    wire([LUG['L2'], (720, 254)], GRN)
    wire([LUG['L3'], (840, 174)], BLU)
    # J1 tip -> L5 via channel between rows
    J1 = (150, 395)
    wire([J1, (720, 395), LUG['L5']], GRN)
    # J2 tip <- L6
    J2 = (1150, 450)
    wire([LUG['L6'], J2], BLU)
    # bypass jumper L8-L9
    wire([LUG['L8'], LUG['L9']], PUR, 5)
    # LED cathode -> L4
    wire([LUG['L4'], (600, 505), (380, 505), (380, 700), (470, 700), (470, 776)], ORG)

    # lugs
    for name, (x, y) in LUG.items():
        common = name in ('L4', 'L5', 'L6')
        svg(f'<rect x="{x - 16}" y="{y - 11}" width="32" height="22" rx="4" fill="{"#f5d76e" if common else "#e8e8e8"}" stroke="#6d6d6d" stroke-width="1.5"/>')
        text(x, y + 5, name[1], 13, weight='bold')
    # unused L7
    x, y = LUG['L7']
    svg(f'<line x1="{x - 22}" y1="{y - 22}" x2="{x + 22}" y2="{y + 22}" stroke="#999" stroke-width="2"/>')
    text(x, y + 34, 'unused', 11, color='#777')
    text(780, RY[2] + 34, 'bypass jumper 8–9', 12, color=PUR, weight='bold')

    # --- J1 input jack (stereo / TRS: ring switches the battery)
    svg('<rect x="40" y="340" width="110" height="160" rx="10" fill="#555"/>')
    text(95, 318, 'J1 INPUT', 15, weight='bold')
    text(95, 334, 'stereo (TRS) jack', 11, color='#555')
    dot(150, 395, 7, '#f5d76e'); text(162, 385, 'tip', 12, anchor='start', color=GRN, weight='bold')
    dot(75, 500, 7, '#bbb'); text(66, 522, 'ring', 12, anchor='end', color=RED, weight='bold')
    dot(120, 500, 7, '#bbb'); text(130, 522, 'sleeve', 12, anchor='start', color='#333')
    wire([(120, 500), (120, 540), (170, 540), (170, 580)], BLK)
    box(100, 580, 140, 58, 'Board C8', 'GND (sleeve)')
    # battery: - to ring, + to board A10
    wire([(75, 500), (75, 760)], BLK, dash='8 5')
    svg('<rect x="40" y="760" width="170" height="64" rx="8" fill="#333"/>')
    text(125, 800, '9 V battery', 14, color='white', weight='bold')
    text(62, 752, '−', 18, color=BLK, weight='bold')
    wire([(210, 792), (260, 792)], RED)
    box(260, 764, 140, 58, 'Board A10', 'BAT +')
    text(40, 860, 'Battery − goes to the jack ring only.', 12, anchor='start', color='#555')
    text(40, 878, 'A plugged-in mono cable links ring to sleeve,', 12, anchor='start', color='#555')
    text(40, 896, 'which switches the pedal on. Unplug the input', 12, anchor='start', color='#555')
    text(40, 914, 'cable to save the battery.', 12, anchor='start', color='#555')

    # --- J2 output jack
    svg(f'<rect x="1150" y="400" width="110" height="130" rx="10" fill="#555"/>')
    text(1205, 390, 'J2 OUTPUT', 15, weight='bold')
    dot(1150, 450, 7, '#f5d76e'); text(1138, 440, 'tip', 12, anchor='end', color=BLU, weight='bold')
    dot(1150, 500, 7, '#bbb')
    wire([(1150, 500), (1080, 500), (1080, 580)], BLK)
    box(1010, 580, 140, 58, 'Board H18', 'GND (sleeve)')
    text(1138, 495, 'sleeve', 12, anchor='end', color='#333')

    # --- LED + resistor
    # LED body at (430, 800), cathode on top (towards L4), anode below
    svg('<circle cx="470" cy="810" r="24" fill="#ff5252" stroke="#b71c1c" stroke-width="2"/>')
    svg('<line x1="446" y1="788" x2="494" y2="788" stroke="#b71c1c" stroke-width="3"/>')
    text(508, 792, 'LED cathode (−): short leg, flat edge', 13, anchor='start', color=ORG, weight='bold')
    text(508, 840, 'LED anode (+): long leg', 13, anchor='start', color=RED, weight='bold')
    wire([(470, 834), (470, 880), (560, 880)], RED)
    svg('<rect x="560" y="868" width="90" height="24" rx="10" fill="#e8d3a8" stroke="#a1887f"/>')
    for i, c in enumerate(['#f9a825', '#6a1b9a', '#d32f2f']):
        svg(f'<rect x="{578 + i * 16}" y="868" width="8" height="24" fill="{c}"/>')
    text(605, 915, 'R5 4.7k', 13, weight='bold')
    wire([(650, 880), (760, 880)], RED)
    box(760, 850, 150, 58, 'Board A12', '+9 V')
    text(470, 948, 'LED on leads, mounted through the case (5 mm LED + bezel)', 13, weight='bold')

    # --- right panel: what each position does + how to find ON row
    px = 1300 - 0
    px = 1290
    py = 110
    text(px, py, 'What the switch does', 17, anchor='start', weight='bold'); py += 30
    rows = [
        ('Effect ON', ['J1 tip → board INPUT (B11)', 'VOLUME lug 2 → J2 tip', 'LED cathode → GND: LED lit']),
        ('BYPASS', ['J1 tip → jumper 8–9 → J2 tip', 'Board input and output open', 'LED off']),
    ]
    for title, lines in rows:
        text(px, py, title, 15, anchor='start', weight='bold', color='#1b5e20' if 'ON' in title else '#4a148c'); py += 22
        for ln in lines:
            text(px + 12, py, ln, 13, anchor='start'); py += 20
        py += 10
    py += 10
    text(px, py, 'Which row is ON?', 17, anchor='start', weight='bold'); py += 26
    steps = [
        'It doesn\u2019t matter. Each click swaps the',
        'commons (middle row) between the top and',
        'bottom rows, so one click is effect ON and',
        'the next is BYPASS. The LED shows which.',
        '',
        'What matters: wire exactly the lugs shown.',
        'Check first with a meter on continuity:',
        'each middle lug beeps to one outer lug',
        'in its own column, never to another column.',
        '',
        'The 1M pulldown (RPD) on the board',
        'keeps INPUT from floating in bypass,',
        'which prevents switching pops.',
        '',
        'Ground the foil shield through the jack',
        'sleeves; keep switch lugs off the foil.',
    ]
    for st in steps:
        text(px, py, st, 13, anchor='start'); py += 19

    svg('</svg>')
    (HERE / 'fuzz-face-footswitch.svg').write_text('\n'.join(out))
    print('footswitch check passed (ON and BYPASS)')


if __name__ == '__main__':
    main()
