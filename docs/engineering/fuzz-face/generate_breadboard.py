"""Breadboard layout for the 2N3904 Fuzz Face.

Places every part on a 30-column half-size breadboard, derives the nets from
breadboard strip connectivity, checks them against the schematic netlist, and
only then writes fuzz-face-breadboard.svg.
"""
from pathlib import Path
import math

HERE = Path(__file__).parent
P = 24                      # hole pitch (px)
NCOL = 30
X0, Y0 = 70, 230            # board hole (col 0, rail T+) origin

# Row positions in pitch units, measured down from the top rail.
ROWY = {'T+': 0.0, 'T-': 1.0, 'a': 2.6, 'b': 3.6, 'c': 4.6, 'd': 5.6, 'e': 6.6,
        'f': 8.4, 'g': 9.4, 'h': 10.4, 'i': 11.4, 'j': 12.4, 'B-': 14.0, 'B+': 15.0}
TOP, BOT = set('abcde'), set('fghij')


def xy(loc):
    """loc: (col, row) on board, or ('off', x, y) absolute."""
    if loc[0] == 'off':
        return loc[1], loc[2]
    col, row = loc
    return X0 + col * P, Y0 + ROWY[row] * P


def node_of(loc):
    if loc[0] == 'off':
        return None
    col, row = loc
    if row in ('T+', 'T-', 'B+', 'B-'):
        return 'rail' + row
    return f'{col}{"T" if row in TOP else "B"}'


# ---------------------------------------------------------------- placement
# Off-board parts sit below / beside the board; pins are absolute coordinates.
BY = Y0 + 19.5 * P          # off-board pot row
OFF = {
    'J1.tip': ('off', 18, Y0 + 4.6 * P), 'J1.sleeve': ('off', 18, Y0 + 1.0 * P - 0),
    'BAT.+': ('off', X0 + 3 * P, Y0 - 3.2 * P), 'BAT.-': ('off', X0 + 5 * P, Y0 - 3.2 * P),
    'FUZZ.1': ('off', X0 + 5 * P, BY), 'FUZZ.2': ('off', X0 + 6 * P, BY), 'FUZZ.3': ('off', X0 + 7 * P, BY),
    'VOL.1': ('off', X0 + 18 * P, BY), 'VOL.2': ('off', X0 + 19 * P, BY), 'VOL.3': ('off', X0 + 20 * P, BY),
    'J2.tip': ('off', X0 + 25 * P, BY + 0.2 * P), 'J2.sleeve': ('off', X0 + 27 * P, BY + 0.2 * P),
}

# kind, ref, value, {pin: loc}
PARTS = [
    ('film', 'C1', '470n', {'1': (2, 'b'), '2': (6, 'b')}),
    ('res', 'RPD', '1M', {'1': (2, 'a'), '2': (2, 'T-')}),
    ('to92', 'Q1', '2N3904', {'E': (5, 'd'), 'B': (6, 'd'), 'C': (7, 'd')}),
    ('ceramic', 'C5', '100p opt.', {'1': (6, 'c'), '2': (7, 'c')}),
    ('res', 'R4', '100k', {'1': (6, 'e'), '2': (7, 'f')}),
    ('res', 'R1B', '10k', {'1': (7, 'b'), '2': (11, 'b')}),
    ('res', 'R1A', '22k', {'1': (11, 'a'), '2': (11, 'T+')}),
    ('ceramic', 'C4', '100n opt.', {'1': (14, 'T+'), '2': (14, 'T-')}),
    ('to92', 'Q2', '2N3904', {'E': (7, 'h'), 'B': (8, 'h'), 'C': (9, 'h')}),
    ('trim', 'VR1', '50k', {'B': (9, 'j'), 'W': (10, 'j'), 'A': (11, 'j')}),
    ('res', 'R3', '2.2k', {'1': (11, 'h'), '2': (15, 'h')}),
    ('res', 'R2', '470', {'1': (15, 'j'), '2': (15, 'B+')}),
    ('film', 'C3', '10n', {'1': (15, 'g'), '2': (19, 'g')}),
    ('elec', 'C2', '22µ', {'+': (4, 'h'), '-': (3, 'B-')}),
]

# Jumpers on the board: (from, to, color)
JUMPERS = [
    ((5, 'a'), (5, 'T-'), '#222'),        # Q1 emitter -> GND
    ((7, 'e'), (8, 'f'), '#e67e22'),      # Q1C -> Q2B
    ((9, 'i'), (10, 'i'), '#8e44ad'),     # Q2_COL -> VR1 wiper strip
    ((28, 'T+'), (28, 'B+'), '#c0392b'),  # rail link VCC
    ((29, 'T-'), (29, 'B-'), '#222'),     # rail link GND
]

# Off-board wires: (pin, board loc, color, route of intermediate points)
WIRES = [
    ('J1.tip', (2, 'c'), '#27ae60', []),
    ('J1.sleeve', (1, 'T-'), '#222', []),
    ('BAT.+', (3, 'T+'), '#c0392b', []),
    ('BAT.-', (4, 'T-'), '#222', []),
    ('FUZZ.1', (6, 'B-'), '#222', []),
    ('FUZZ.2', (4, 'j'), '#2980b9', [('off', X0 + 6 * P, Y0 + 17.2 * P), ('off', X0 + 4 * P, Y0 + 17.2 * P)]),
    ('FUZZ.3', (7, 'j'), '#e67e22', []),
    ('VOL.1', (18, 'B-'), '#222', []),
    ('VOL.3', (19, 'j'), '#16a085', [('off', X0 + 20 * P, Y0 + 17.2 * P), ('off', X0 + 19 * P, Y0 + 17.2 * P)]),
    ('J2.sleeve', (26, 'B-'), '#222', [('off', X0 + 27 * P, Y0 + 17.2 * P), ('off', X0 + 26 * P, Y0 + 17.2 * P)]),
]
# Off-board to off-board (no board hole)
OFF_WIRES = [('VOL.2', 'J2.tip', '#2980b9')]

# ------------------------------------------------------------ expected nets
EXPECTED = {
    'INPUT': {'J1.tip', 'RPD.1', 'C1.1'},
    'Q1_BASE': {'C1.2', 'Q1.B', 'R4.1', 'C5.1'},
    'Q1C_Q2B': {'Q1.C', 'Q2.B', 'R1B.1', 'C5.2'},
    'R1_MID': {'R1B.2', 'R1A.1'},
    'Q2_EMIT': {'Q2.E', 'R4.2', 'FUZZ.3'},
    'FUZZ_WIPER': {'FUZZ.2', 'C2.+'},
    'Q2_COL': {'Q2.C', 'VR1.B', 'VR1.W'},
    'BIAS_TOP': {'VR1.A', 'R3.1'},
    'OUT_TAP': {'R3.2', 'R2.1', 'C3.1'},
    'VOL_IN': {'C3.2', 'VOL.3'},
    'OUTPUT': {'VOL.2', 'J2.tip'},
    'GND': {'J1.sleeve', 'RPD.2', 'Q1.E', 'FUZZ.1', 'C2.-', 'VOL.1', 'J2.sleeve', 'BAT.-', 'C4.2'},
    'VCC': {'R1A.2', 'R2.2', 'BAT.+', 'C4.1'},
}


# ------------------------------------------------------------ verification
def verify():
    parent = {}

    def find(a):
        parent.setdefault(a, a)
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    def union(a, b):
        parent[find(a)] = find(b)

    used = {}
    pins = {}
    for kind, ref, _, pmap in PARTS:
        for pin, loc in pmap.items():
            pins[f'{ref}.{pin}'] = loc
    for (a, b, _) in JUMPERS:
        pins[f'jumper{a}'] = a
        pins[f'jumper{b}'] = b
    for name, loc, _, _ in WIRES:
        pins[f'wire:{name}'] = loc

    for name, loc in pins.items():
        if loc[0] != 'off':
            assert loc not in used, f'hole {loc} used by {used.get(loc)} and {name}'
            used[loc] = name

    for name, loc in pins.items():
        n = node_of(loc)
        union(name, n)
    for (a, b, _) in JUMPERS:
        union(node_of(a), node_of(b))
    for name, loc, _, _ in WIRES:
        union(name, node_of(loc))
    for a, b, _ in OFF_WIRES:
        union(a, b)

    comp_pins = {p for s in EXPECTED.values() for p in s}
    groups = {}
    for p in comp_pins:
        groups.setdefault(find(p), set()).add(p)
    actual = sorted(sorted(g) for g in groups.values())
    expected = sorted(sorted(g) for g in EXPECTED.values())
    placed = set(k for k in pins if not k.startswith(('jumper', 'wire:'))) | set(OFF)
    assert placed == comp_pins, f'pin mismatch: {placed ^ comp_pins}'
    if actual != expected:
        raise SystemExit(f'NETLIST MISMATCH\nactual:   {actual}\nexpected: {expected}')

    # strip -> net name for the legend
    strip_net = {}
    for net, members in EXPECTED.items():
        root = find(next(iter(members)))
        for loc in used:
            n = node_of(loc)
            if find(n) == root:
                strip_net[n] = net
    return strip_net


# ------------------------------------------------------------ drawing
out = []


def svg(s):
    out.append(s)


def line(a, b, color='#777', w=2.0, dash=None, cap='round'):
    d = f' stroke-dasharray="{dash}"' if dash else ''
    svg(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="{color}" stroke-width="{w}" stroke-linecap="{cap}"{d}/>')


def text(x, y, s, size=11, anchor='middle', color='#111', weight='normal', bg=False):
    if bg:
        wdt = len(s) * size * 0.58 + 6
        svg(f'<rect x="{x - (wdt / 2 if anchor == "middle" else (0 if anchor == "start" else wdt)) - 0:.1f}" y="{y - size + 1:.1f}" width="{wdt:.1f}" height="{size + 4}" rx="3" fill="white" fill-opacity="0.85"/>')
    svg(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" text-anchor="{anchor}" fill="{color}" font-weight="{weight}" font-family="Helvetica, Arial, sans-serif">{s}</text>')


def lead_end(p):
    svg(f'<circle cx="{p[0]:.1f}" cy="{p[1]:.1f}" r="3.2" fill="#555"/>')


def axial(a, b, fill, stroke, label, value, body_len=1.7, body_w=0.62, dashed=False, bands=None, label_side=1):
    pa, pb = xy(a), xy(b)
    line(pa, pb, '#8a8a8a', 2.2)
    lead_end(pa); lead_end(pb)
    mx, my = (pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2
    ang = math.degrees(math.atan2(pb[1] - pa[1], pb[0] - pa[0]))
    L = min(body_len * P, math.dist(pa, pb) - 10)
    W = body_w * P
    dash = ' stroke-dasharray="4 3"' if dashed else ''
    svg(f'<g transform="translate({mx:.1f},{my:.1f}) rotate({ang:.1f})">')
    svg(f'<rect x="{-L / 2:.1f}" y="{-W / 2:.1f}" width="{L:.1f}" height="{W:.1f}" rx="{W / 2.5:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="1.4"{dash}/>')
    if bands:
        for i, c in enumerate(bands):
            bx = -L / 2 + L * (0.22 + 0.16 * i)
            svg(f'<rect x="{bx:.1f}" y="{-W / 2:.1f}" width="{L * 0.08:.1f}" height="{W:.1f}" fill="{c}"/>')
    svg('</g>')
    return mx, my


BANDS = {'1M': ['#795548', '#111', '#2e7d32'], '100k': ['#795548', '#111', '#f9a825'],
         '10k': ['#795548', '#111', '#e65100'], '22k': ['#d32f2f', '#d32f2f', '#e65100'],
         '2.2k': ['#d32f2f', '#d32f2f', '#d32f2f'], '470': ['#f9a825', '#6a1b9a', '#795548']}

LABEL_POS = {  # (dx, dy) in pitch units from body centre for ref/value label
    'C1': (0, 0.95), 'RPD': (1.35, -0.1), 'R4': (-1.6, 0.0), 'R1B': (0, 0.95),
    'R1A': (1.35, 0.1), 'C4': (1.6, 0.1), 'R3': (0, 0.95), 'R2': (1.3, 0.35),
    'C3': (0, -0.75), 'C2': (-1.6, 0.1), 'C5': (3.9, 1.5),
}


def draw_parts():
    for kind, ref, value, pm in PARTS:
        ks = list(pm.values())
        if kind == 'res':
            m = axial(ks[0], ks[1], '#e8d3a8', '#a1887f', ref, value, bands=BANDS.get(value))
        elif kind == 'film':
            m = axial(ks[0], ks[1], '#f4d03f', '#b7950b', ref, value, body_len=1.9, body_w=0.8)
        elif kind == 'elec':
            pa, pb = xy(pm['+']), xy(pm['-'])
            m = axial(pm['+'], pm['-'], '#2e5c9a', '#1b3a66', ref, value, body_len=1.5, body_w=0.85)
            # minus stripe near the - lead
            t = 0.72
            sx, sy = pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t
            svg(f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="5" fill="#dfe6ee"/>')
            text(sx, sy + 3.5, '−', 10, color='#1b3a66', weight='bold')
            text(pa[0] + 9, pa[1] - 5, '+', 12, color='#c0392b', weight='bold')
        elif kind == 'ceramic':
            pa, pb = xy(ks[0]), xy(ks[1])
            dashed = 'opt' in value
            line(pa, pb, '#8a8a8a', 2.0)
            lead_end(pa); lead_end(pb)
            mx, my = (pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2
            if pa[1] == pb[1]:
                my -= 0.45 * P
                line(pa, (mx, my), '#8a8a8a', 2); line(pb, (mx, my), '#8a8a8a', 2)
            else:
                mx += 0.45 * P
                line(pa, (mx, my), '#8a8a8a', 2); line(pb, (mx, my), '#8a8a8a', 2)
            d = ' stroke-dasharray="3 2"' if dashed else ''
            svg(f'<ellipse cx="{mx:.1f}" cy="{my:.1f}" rx="{0.42 * P:.1f}" ry="{0.34 * P:.1f}" fill="#e67e22" stroke="#a04000" stroke-width="1.4"{d}/>')
            m = (mx, my)
        elif kind == 'to92':
            pe, pbase, pc = xy(pm['E']), xy(pm['B']), xy(pm['C'])
            cx, cy = pbase
            w = 1.7 * P
            # D-shape: flat face toward the bottom edge of the board (row j side)
            svg(f'<path d="M {cx - w:.1f} {cy + 0.32 * P:.1f} L {cx + w:.1f} {cy + 0.32 * P:.1f} '
                f'A {w:.1f} {0.98 * P:.1f} 0 0 0 {cx - w:.1f} {cy + 0.32 * P:.1f} Z" fill="#2b2b2b" stroke="#000" stroke-width="1"/>')
            for p_ in (pe, pbase, pc):
                svg(f'<circle cx="{p_[0]:.1f}" cy="{p_[1]:.1f}" r="3.2" fill="#bbb"/>')
            text(cx - w - 2, cy + 4, ref, 12, anchor='end', weight='bold', bg=True)
            for lab, p_ in (('E', pe), ('B', pbase), ('C', pc)):
                text(p_[0], p_[1] - 0.2 * P, lab, 10, color='#ffd54f', weight='bold')
            continue
        elif kind == 'trim':
            pw = xy(pm['W'])
            s = 1.5 * P
            svg(f'<rect x="{pw[0] - s:.1f}" y="{pw[1] - 0.55 * P:.1f}" width="{2 * s:.1f}" height="{1.1 * P:.1f}" rx="3" fill="#2f6fb3" stroke="#1b3a66"/>')
            svg(f'<circle cx="{pw[0]:.1f}" cy="{pw[1]:.1f}" r="{0.38 * P:.1f}" fill="#f5f5f5" stroke="#1b3a66"/>')
            line((pw[0] - 5, pw[1] + 5), (pw[0] + 5, pw[1] - 5), '#1b3a66', 2)
            for lab in ('A', 'W', 'B'):
                p_ = xy(pm[lab])
                svg(f'<circle cx="{p_[0]:.1f}" cy="{p_[1] + 0.35 * P:.1f}" r="2.5" fill="#ddd"/>')
                text(p_[0], p_[1] + 1.05 * P, lab, 10, color='#1b3a66', weight='bold', bg=True)
            text(pw[0] + s + 6, pw[1] + 4, 'VR1 50k', 11, anchor='start', weight='bold', bg=True)
            continue
        dx, dy = LABEL_POS.get(ref, (0, -0.8))
        text(m[0] + dx * P, m[1] + dy * P + 4, f'{ref} {value}', 11, weight='bold', bg=True)


def draw_board(strip_net):
    W = (NCOL + 1) * P
    svg(f'<rect x="{X0 - 0.2 * P:.1f}" y="{Y0 - 0.9 * P:.1f}" width="{W:.1f}" height="{16.8 * P:.1f}" rx="8" fill="#f7f5ef" stroke="#c9c4b5" stroke-width="1.5"/>')
    # centre channel
    svg(f'<rect x="{X0 - 0.2 * P:.1f}" y="{Y0 + 7.2 * P:.1f}" width="{W:.1f}" height="{0.6 * P:.1f}" fill="#e6e1d3"/>')
    # rail stripes
    for row, col in (('T+', '#c0392b'), ('T-', '#2c3e50'), ('B-', '#2c3e50'), ('B+', '#c0392b')):
        y = Y0 + ROWY[row] * P
        off = -0.5 if row in ('T+', 'B-') else 0.5
        line((X0 + 0.5 * P, y + off * P), (X0 + (NCOL + 0.3) * P, y + off * P), col, 1.6)
        sign = '+' if '+' in row else '−'
        text(X0 - 0.2 * P - 8, y + 4, sign, 13, anchor='end', color=col, weight='bold')
        text(X0 + (NCOL + 1) * P + 2, y + 4, 'VCC +9 V' if '+' in row else 'GND', 10, anchor='start', color=col, weight='bold')
    # highlight used strips
    for strip, net in strip_net.items():
        if strip.startswith('rail'):
            continue
        col = int(strip[:-1]); half = strip[-1]
        y1 = Y0 + (ROWY['a'] if half == 'T' else ROWY['f']) * P - 0.42 * P
        svg(f'<rect x="{X0 + col * P - 0.42 * P:.1f}" y="{y1:.1f}" width="{0.84 * P:.1f}" height="{4.84 * P:.1f}" rx="4" fill="#fff3c4" stroke="#e0c46c" stroke-width="0.8"/>')
    # holes
    for row, y in ROWY.items():
        for c in range(1, NCOL + 1):
            svg(f'<rect x="{X0 + c * P - 3.5:.1f}" y="{Y0 + y * P - 3.5:.1f}" width="7" height="7" rx="1.2" fill="#5a574f" fill-opacity="0.55"/>')
    # row / column labels
    for row in 'abcdefghij':
        y = Y0 + ROWY[row] * P + 4
        text(X0 + 0.2 * P, y, row, 10, color='#8a8578')
        text(X0 + (NCOL + 0.75) * P, y, row, 10, color='#8a8578')
    for c in range(1, NCOL + 1):
        if c == 1 or c % 5 == 0:
            text(X0 + c * P, Y0 + 1.95 * P, str(c), 9, color='#8a8578')


def draw_offboard():
    # J1 input jack
    jx = 18
    svg(f'<rect x="{jx - 16}" y="{Y0 + 0.2 * P:.1f}" width="30" height="{5.2 * P:.1f}" rx="5" fill="#555"/>')
    text(jx - 1, Y0 - 0.35 * P, 'J1 IN', 11, weight='bold')
    text(jx - 1, Y0 + 5.95 * P, 'tip', 9, color='#27ae60', weight='bold', bg=True)
    text(jx - 1, Y0 + 0.2 * P - 4 + 0.0, '', 9)
    text(jx + 26, Y0 + 1.5 * P, 'sleeve', 9, anchor='start', color='#222', bg=True)
    # battery
    bx1, bx2 = X0 + 2.2 * P, X0 + 5.8 * P
    by = Y0 - 5.2 * P
    svg(f'<rect x="{bx1:.1f}" y="{by:.1f}" width="{bx2 - bx1:.1f}" height="{1.6 * P:.1f}" rx="5" fill="#333"/>')
    text((bx1 + bx2) / 2, by + 1.05 * P, '9 V supply', 11, color='white', weight='bold')
    text(X0 + 3 * P, by + 2.3 * P, '+', 13, color='#c0392b', weight='bold')
    text(X0 + 5 * P, by + 2.3 * P, '−', 13, color='#ddd', weight='bold')
    # pots (rear view, lugs up toward board)
    for name, c0, title in (('FUZZ', 5, 'FUZZ B1k'), ('VOL', 18, 'VOLUME A500k')):
        cx = X0 + (c0 + 1) * P
        svg(f'<circle cx="{cx:.1f}" cy="{BY + 1.9 * P:.1f}" r="{1.55 * P:.1f}" fill="#9aa3ab" stroke="#5d6770" stroke-width="1.5"/>')
        svg(f'<circle cx="{cx:.1f}" cy="{BY + 1.9 * P:.1f}" r="{0.45 * P:.1f}" fill="#d9dde1" stroke="#5d6770"/>')
        for i in (1, 2, 3):
            lx = X0 + (c0 + i - 1) * P
            svg(f'<rect x="{lx - 4:.1f}" y="{BY - 2:.1f}" width="8" height="{0.55 * P:.1f}" fill="#c9a227"/>')
            text(lx, BY + 1.05 * P, str(i), 10, weight='bold')
        text(cx, BY + 4.1 * P, title, 11, weight='bold')
        text(cx, BY + 4.7 * P, 'rear view, lugs up', 9, color='#666')
    # J2 output jack
    jx0 = X0 + 24.4 * P
    svg(f'<rect x="{jx0:.1f}" y="{BY + 0.5 * P:.1f}" width="{3.2 * P:.1f}" height="{1.6 * P:.1f}" rx="5" fill="#555"/>')
    text(jx0 + 1.6 * P, BY + 1.5 * P, 'J2 OUT', 11, color='white', weight='bold')
    text(X0 + 25 * P, BY + 2.7 * P, 'tip', 9, color='#2980b9', weight='bold')
    text(X0 + 27 * P, BY + 2.7 * P, 'sleeve', 9)


def draw_wires():
    for a, b, color in JUMPERS:
        line(xy(a), xy(b), color, 3.4)
        lead_end(xy(a)); lead_end(xy(b))
    for pin, loc, color, route in WIRES:
        pts = [xy(OFF[pin])] + [xy(r) for r in route] + [xy(loc)]
        svg('<polyline points="' + ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts) + f'" fill="none" stroke="{color}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>')
        lead_end(xy(loc))
    for a, b, color in OFF_WIRES:
        pa, pb = xy(OFF[a]), xy(OFF[b])
        mid = (pa[0], BY - 1.2 * P)
        mid2 = (pb[0], BY - 1.2 * P)
        svg(f'<polyline points="{pa[0]:.1f},{pa[1]:.1f} {mid[0]:.1f},{mid[1]:.1f} {mid2[0]:.1f},{mid2[1]:.1f} {pb[0]:.1f},{pb[1]:.1f}" fill="none" stroke="{color}" stroke-width="3.2" stroke-linejoin="round" stroke-dasharray="7 4"/>')


def draw_legend(strip_net):
    lx = X0 + (NCOL + 4.6) * P
    ly = Y0 - 4.6 * P
    svg(f'<rect x="{lx - 14:.1f}" y="{ly - 26:.1f}" width="330" height="{30.2 * P:.1f}" rx="8" fill="#fafafa" stroke="#ddd"/>')
    text(lx, ly, 'Strip map (auto-checked against netlist)', 12, anchor='start', weight='bold')
    rows = {}
    for strip, net in strip_net.items():
        if strip.startswith('rail'):
            continue
        rows.setdefault(net, []).append(strip)
    y = ly + 22
    order = ['INPUT', 'Q1_BASE', 'Q1C_Q2B', 'R1_MID', 'Q2_EMIT', 'FUZZ_WIPER', 'Q2_COL', 'BIAS_TOP', 'OUT_TAP', 'VOL_IN']
    def key(s):
        return (int(s[:-1]), s[-1])
    for net in order:
        strips = sorted(rows.get(net, []), key=key)
        desc = ', '.join(f'{s[:-1]} {"a–e" if s[-1] == "T" else "f–j"}' for s in strips)
        text(lx, y, net, 11, anchor='start', weight='bold')
        text(lx + 92, y, desc, 11, anchor='start')
        y += 19
    text(lx, y, 'OUTPUT', 11, anchor='start', weight='bold'); text(lx + 92, y, 'off-board: VOL lug 2 → J2 tip', 11, anchor='start'); y += 19
    text(lx, y, 'GND / VCC', 11, anchor='start', weight='bold'); text(lx + 92, y, 'rails; link top ↔ bottom at 28, 29', 11, anchor='start'); y += 30

    text(lx, y, 'Build notes', 12, anchor='start', weight='bold'); y += 20
    notes = [
        'Q1 and Q2: flat face toward the bottom edge',
        '  (row j side), legs E–B–C left to right.',
        '  Check your parts’ datasheet pinout.',
        'C2: stripe (−) to the bottom GND rail.',
        'VR1: wiper (W) is jumpered to lug B / Q2_COL',
        '  via the purple jumper 9i–10i.',
        'C4 and C5 are optional (dashed outline).',
        'Pots are drawn from the rear, lugs up:',
        '  clockwise = more fuzz / more volume.',
        'Rails: some boards split rails at mid-length;',
        '  bridge them if yours does.',
        '',
        'Bias: no signal, meter red on Q2 C (col 9,',
        '  f–j), black on GND. Set VR1 for ≈ 4.5 V.',
        '  Do not measure OUT_TAP (col 15, f–j).',
    ]
    for n in notes:
        text(lx, y, n, 11, anchor='start'); y += 17
    y += 10
    text(lx, y, 'Wire colours', 12, anchor='start', weight='bold'); y += 20
    for col, lab in (('#c0392b', '+9 V'), ('#222', 'ground'), ('#e67e22', 'Q1C→Q2B jumper, Q2_EMIT→FUZZ 3'),
                     ('#27ae60', 'input signal'), ('#2980b9', 'pot wipers / output'), ('#16a085', 'VOL_IN → VOL 3')):
        line((lx, y - 4), (lx + 26, y - 4), col, 3.4)
        text(lx + 34, y, lab, 11, anchor='start'); y += 18


def main():
    strip_net = verify()
    width = X0 + (NCOL + 4.6) * P + 340
    height = BY + 5.6 * P
    svg(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width:.0f}" height="{height:.0f}" viewBox="0 0 {width:.0f} {height:.0f}">')
    svg(f'<rect width="100%" height="100%" fill="white"/>')
    text(X0 - 0.2 * P, 32, '2N3904 Fuzz Face — breadboard layout', 18, anchor='start', weight='bold')
    text(X0 - 0.2 * P, 52, 'NPN, negative ground, 9 V. Half-size (30-column) breadboard, top view. Matches fuzz-face-2n3904 schematic.', 11, anchor='start', color='#555')
    draw_board(strip_net)
    draw_offboard()
    draw_wires()
    draw_parts()
    draw_legend(strip_net)
    svg('</svg>')
    (HERE / 'fuzz-face-breadboard.svg').write_text('\n'.join(out))
    print('netlist check passed;', len(strip_net), 'nodes mapped')


if __name__ == '__main__':
    main()
