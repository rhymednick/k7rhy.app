"""Stripboard (Veroboard) layout for the 2N3904 Fuzz Face.

Strips run horizontally. Track cuts are made on a hole (spot-face cutter or
drill bit), which removes that hole and splits the strip. The script derives
the nets from strips, cuts, links, and off-board wires, checks them against
the schematic netlist, and only then writes fuzz-face-stripboard.svg with a
component-side view and a mirrored copper-side view for cutting.
"""
from pathlib import Path
import math

HERE = Path(__file__).parent
P = 34                      # hole pitch (px)
NCOL, NROW = 20, 8

# ---------------------------------------------------------------- placement
# Locations are (row, col), 1-based. Rows are strips.
CUTS = [(1, 5), (1, 16), (3, 16), (4, 10), (5, 16), (6, 16)]

# kind, ref, value, {pin: (row, col)}, extra
PARTS = [
    ('res', 'R2', '22k', {'1': (1, 3), '2': (1, 7)}, {}),          # along strip, over cut 1/5
    ('res', 'R5', '1k', {'1': (1, 14), '2': (1, 18)}, {}),         # along strip, over cut 1/16
    ('res', 'R3', '10k', {'1': (1, 2), '2': (5, 2)}, {}),
    ('res', 'R1', '1M', {'1': (2, 1), '2': (8, 1)}, {}),
    ('film', 'C1', '470n', {'1': (2, 4), '2': (4, 4)}, {}),
    ('ceramic', 'C5', '47p opt.', {'1': (4, 3), '2': (5, 3)}, {'optional': True}),
    ('ceramic', 'C4', '100n opt.', {'1': (1, 9), '2': (3, 9)}, {'optional': True}),
    ('to92', 'Q1', '2N3904', {'E': (3, 6), 'B': (4, 6), 'C': (5, 6)}, {'flat': 'left'}),
    ('to92', 'Q2', '2N3904', {'C': (4, 13), 'B': (5, 13), 'E': (6, 13)}, {'flat': 'right'}),
    ('res', 'R4', '100k', {'1': (4, 7), '2': (6, 10)}, {}),
    ('trim', 'VR1', '50k', {'B': (4, 17), 'W': (5, 17), 'A': (6, 17)}, {}),
    ('res', 'R6', '2.2k', {'1': (6, 19), '2': (1, 19)}, {}),
    ('film', 'C3', '10n', {'1': (1, 20), '2': (3, 20)}, {}),
    ('elec', 'C2', '22µ', {'+': (7, 12), '-': (8, 12)}, {}),
]
LINKS = [((4, 18), (5, 18)), ((3, 15), (8, 15))]

# Off-board wire pads: pin -> hole
PADS = {
    'SW.L2': (2, 11), 'J1.sleeve': (3, 8), 'SW.L1': (8, 16), 'R7.1': (1, 12),
    'BAT.+': (1, 10),
    'FUZZ.1': (8, 13), 'FUZZ.2': (7, 14), 'FUZZ.3': (6, 11),
    'VOL.1': (8, 19), 'VOL.3': (3, 18),
    'J2.sleeve': (8, 18),
}
# Off-board wiring (footswitch, jacks, LED). 3PDT lugs L1-L9, lug-side view:
# top row L1-L3 = ON throws, middle L4-L6 = commons, bottom L7-L9 = BYPASS throws.
OFF_WIRES = [
    ('J1.tip', 'SW.L5'), ('J2.tip', 'SW.L6'), ('VOL.2', 'SW.L3'),
    ('SW.L8', 'SW.L9'), ('LED.K', 'SW.L4'), ('R7.2', 'LED.A'),
    ('BAT.-', 'J1.ring'),   # stereo input jack switches the battery
]
PLUG_IN = [('J1.ring', 'J1.sleeve')]   # a mono plug shorts ring to sleeve
SWITCH_STATES = {
    'ON': [('SW.L4', 'SW.L1'), ('SW.L5', 'SW.L2'), ('SW.L6', 'SW.L3')],
    'BYPASS': [('SW.L5', 'SW.L8'), ('SW.L6', 'SW.L9')],   # L7 unused
}

EXPECTED = {
    'INPUT': {'SW.L2', 'R1.1', 'C1.1'},
    'Q1_BASE': {'C1.2', 'Q1.B', 'R4.1', 'C5.1'},
    'Q1C_Q2B': {'Q1.C', 'Q2.B', 'R3.2', 'C5.2'},
    'R2_R3': {'R3.1', 'R2.1'},
    'Q2_EMIT': {'Q2.E', 'R4.2', 'FUZZ.3'},
    'FUZZ_WIPER': {'FUZZ.2', 'C2.+'},
    'Q2_COL': {'Q2.C', 'VR1.B', 'VR1.W'},
    'BIAS_TOP': {'VR1.A', 'R6.1'},
    'OUT_TAP': {'R6.2', 'R5.2', 'C3.1'},
    'VOL_IN': {'C3.2', 'VOL.3'},
    'OUTPUT': {'VOL.2', 'SW.L3'},
    'J1_TIP': {'J1.tip', 'SW.L5'},
    'J2_TIP': {'J2.tip', 'SW.L6'},
    'BYPASS': {'SW.L8', 'SW.L9'},
    'LED_K': {'LED.K', 'SW.L4'},
    'LED_A': {'LED.A', 'R7.2'},
    'GND': {'J1.sleeve', 'R1.2', 'Q1.E', 'FUZZ.1', 'C2.-', 'VOL.1', 'J2.sleeve', 'C4.2', 'SW.L1'},
    'BAT_NEG': {'BAT.-', 'J1.ring'},
    'VCC': {'R2.2', 'R5.1', 'BAT.+', 'C4.1', 'R7.1'},
}


def segment(loc):
    """Strip segment id for a hole, accounting for cuts."""
    r, c = loc
    cuts = sorted(cc for rr, cc in CUTS if rr == r)
    assert loc not in CUTS, f'{loc} is a cut hole'
    lo = max([x for x in cuts if x < c], default=0)
    return f'r{r}:{lo + 1}'


def seg_span(seg):
    r, lo = seg[1:].split(':')
    r, lo = int(r), int(lo)
    cuts = sorted(cc for rr, cc in CUTS if rr == r)
    hi = min([x for x in cuts if x >= lo], default=NCOL + 1) - 1
    return r, lo, hi


def verify(extra=(), return_find=False):
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
    holes = []
    for kind, ref, _, pm, _ in PARTS:
        for pin, loc in pm.items():
            holes.append((f'{ref}.{pin}', loc))
    for i, (a, b) in enumerate(LINKS):
        holes += [(f'link{i}a', a), (f'link{i}b', b)]
    holes += [(f'{k}', v) for k, v in PADS.items()]
    for name, loc in holes:
        r, c = loc
        assert 1 <= r <= NROW and 1 <= c <= NCOL, f'{name} off board {loc}'
        assert loc not in used, f'hole {loc} used by {used.get(loc)} and {name}'
        used[loc] = name
        union(name, segment(loc))
    for i, (a, b) in enumerate(LINKS):
        union(segment(a), segment(b))
    for a, b in list(OFF_WIRES) + list(extra):
        union(a, b)
    if return_find:
        return find

    # TO-92 orientation: E-B-C read left to right when facing the flat side.
    for kind, ref, _, pm, ex in PARTS:
        if kind == 'to92':
            rows = {p: pm[p][0] for p in 'EBC'}
            cols = {pm[p][1] for p in 'EBC'}
            assert len(cols) == 1, f'{ref} pins must share a column'
            down = rows['E'] < rows['B'] < rows['C']   # E at top
            up = rows['E'] > rows['B'] > rows['C']
            assert (ex['flat'] == 'left' and down) or (ex['flat'] == 'right' and up), f'{ref} flat-face/pin order mismatch'

    comp = {p for s in EXPECTED.values() for p in s}
    placed = {n for n, _ in holes if not n.startswith('link')} | {p for w in OFF_WIRES for p in w}
    assert placed == comp, f'pin mismatch: {placed ^ comp}'
    groups = {}
    for p in comp:
        groups.setdefault(find(p), set()).add(p)
    actual = sorted(sorted(g) for g in groups.values())
    expected = sorted(sorted(g) for g in EXPECTED.values())
    if actual != expected:
        raise SystemExit(f'NETLIST MISMATCH\nactual:   {actual}\nexpected: {expected}')

    seg_net = {}
    for net, members in EXPECTED.items():
        root = find(next(iter(members)))
        for loc in used:
            s = segment(loc)
            if find(s) == root:
                seg_net[s] = net
    return seg_net


# ------------------------------------------------------------ drawing
out = []


def svg(s):
    out.append(s)


def text(x, y, s, size=12, anchor='middle', color='#111', weight='normal', bg=False):
    if bg:
        w = len(s) * size * 0.6 + 6
        x0 = x - w / 2 if anchor == 'middle' else (x - 3 if anchor == 'start' else x - w + 3)
        svg(f'<rect x="{x0:.1f}" y="{y - size + 1:.1f}" width="{w:.1f}" height="{size + 4}" rx="3" fill="white" fill-opacity="0.9"/>')
    svg(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" text-anchor="{anchor}" fill="{color}" font-weight="{weight}" font-family="Helvetica, Arial, sans-serif">{s}</text>')


def line(a, b, color='#777', w=2.0, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ''
    svg(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="{color}" stroke-width="{w}" stroke-linecap="round"{d}/>')


NET_COL = {'VCC': '#c0392b', 'GND': '#2c3e50'}


def board(ox, oy, seg_net, mirror=False, title=''):
    def hx(c):
        return ox + ((NCOL + 1 - c) if mirror else c) * P

    def hy(r):
        return oy + r * P

    W, H = (NCOL + 1) * P, (NROW + 1) * P
    svg(f'<rect x="{ox + 0.35 * P:.1f}" y="{oy + 0.35 * P:.1f}" width="{W - 0.7 * P:.1f}" height="{H - 0.7 * P:.1f}" rx="6" fill="#d9c9a3" stroke="#a8956a" stroke-width="1.5"/>')
    text(ox + 0.4 * P, oy + 0.1 * P, title, 14, anchor='start', weight='bold')
    # strips
    for r in range(1, NROW + 1):
        cuts = sorted(c for rr, c in CUTS if rr == r)
        bounds = [0] + cuts + [NCOL + 1]
        for lo, hi in zip(bounds, bounds[1:]):
            a, b = lo + 1, hi - 1
            if a > b:
                continue
            x1, x2 = sorted((hx(a), hx(b)))
            op = '0.95' if mirror else '0.35'
            svg(f'<rect x="{x1 - 0.42 * P:.1f}" y="{hy(r) - 0.36 * P:.1f}" width="{x2 - x1 + 0.84 * P:.1f}" height="{0.72 * P:.1f}" rx="3" fill="#c8793a" fill-opacity="{op}"/>')
        net_label = []
        for s, net in seg_net.items():
            rr, lo, hi = seg_span(s)
            if rr == r:
                net_label.append((lo, net))
        for lo, net in net_label:
            if mirror:
                continue
    # holes
    for r in range(1, NROW + 1):
        for c in range(1, NCOL + 1):
            svg(f'<circle cx="{hx(c):.1f}" cy="{hy(r):.1f}" r="3.6" fill="#fdfaf2" stroke="#8a6d3b" stroke-width="0.8"/>')
    # cuts
    for r, c in CUTS:
        x, y = hx(c), hy(r)
        svg(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{0.42 * P:.1f}" fill="#fdfaf2" stroke="#c0392b" stroke-width="2.2"/>')
        line((x - 7, y - 7), (x + 7, y + 7), '#c0392b', 2.6)
        line((x - 7, y + 7), (x + 7, y - 7), '#c0392b', 2.6)
    # row / column labels
    for r in range(1, NROW + 1):
        text(ox + 0.05 * P, hy(r) + 4, chr(64 + r), 12, color='#6d5a33', weight='bold')
        text(ox + (NCOL + 0.95) * P, hy(r) + 4, chr(64 + r), 12, color='#6d5a33', weight='bold')
    for c in range(1, NCOL + 1):
        text(hx(c), oy + (NROW + 0.9) * P, str(c), 10, color='#6d5a33')
    return hx, hy


def lead_end(p):
    svg(f'<circle cx="{p[0]:.1f}" cy="{p[1]:.1f}" r="4" fill="#666"/>')


BANDS = {'1M': ['#795548', '#111', '#2e7d32'], '100k': ['#795548', '#111', '#f9a825'],
         '10k': ['#795548', '#111', '#e65100'], '22k': ['#d32f2f', '#d32f2f', '#e65100'],
         '2.2k': ['#d32f2f', '#d32f2f', '#d32f2f'], '1k': ['#795548', '#111', '#d32f2f']}

LABEL = {  # label offset in pitch units from body centre (default: on the body)
    'C5': (-0.75, 0.0), 'C4': (0.8, 0.0), 'C2': (0, 0.05), 'R1': (0, 1.2),
}
LABEL_ANCHOR = {'R3': 'end', 'R1': 'start', 'C1': 'start', 'C4': 'start', 'C3': 'end', 'C2': 'end', 'R6': 'start', 'R4': 'start', 'C5': 'end'}


def axial(pa, pb, fill, stroke, blen, bw, bands=None, dashed=False):
    line(pa, pb, '#8a8a8a', 2.4)
    lead_end(pa); lead_end(pb)
    mx, my = (pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2
    ang = math.degrees(math.atan2(pb[1] - pa[1], pb[0] - pa[0]))
    L = min(blen * P, math.dist(pa, pb) - 12)
    Wd = bw * P
    d = ' stroke-dasharray="4 3"' if dashed else ''
    svg(f'<g transform="translate({mx:.1f},{my:.1f}) rotate({ang:.1f})">')
    svg(f'<rect x="{-L / 2:.1f}" y="{-Wd / 2:.1f}" width="{L:.1f}" height="{Wd:.1f}" rx="{Wd / 2.6:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="1.4"{d}/>')
    for i, c in enumerate(bands or []):
        svg(f'<rect x="{-L / 2 + L * (0.2 + 0.17 * i):.1f}" y="{-Wd / 2:.1f}" width="{L * 0.09:.1f}" height="{Wd:.1f}" fill="{c}"/>')
    svg('</g>')
    return mx, my


def components(hx, hy):
    def pt(loc):
        return hx(loc[1]), hy(loc[0])

    for a, b in LINKS:
        line(pt(a), pt(b), '#1e8449', 4.2)
        lead_end(pt(a)); lead_end(pt(b))
    for pin, loc in PADS.items():
        x, y = pt(loc)
        svg(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="7" fill="none" stroke="#2471a3" stroke-width="2.4"/>')
        svg(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3" fill="#2471a3"/>')
    for kind, ref, value, pm, ex in PARTS:
        pins = list(pm.values())
        if kind == 'res':
            m = axial(pt(pins[0]), pt(pins[1]), '#e8d3a8', '#a1887f', 2.4, 0.5, BANDS.get(value))
        elif kind == 'film':
            m = axial(pt(pins[0]), pt(pins[1]), '#f4d03f', '#b7950b', 1.6, 0.7)
        elif kind == 'ceramic':
            pa, pb = pt(pins[0]), pt(pins[1])
            line(pa, pb, '#8a8a8a', 2.2); lead_end(pa); lead_end(pb)
            m = ((pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2)
            svg(f'<ellipse cx="{m[0]:.1f}" cy="{m[1]:.1f}" rx="{0.3 * P:.1f}" ry="{0.42 * P:.1f}" fill="#e67e22" stroke="#a04000" stroke-width="1.4" stroke-dasharray="3 2"/>')
        elif kind == 'elec':
            pa, pb = pt(pm['+']), pt(pm['-'])
            lead_end(pa); lead_end(pb)
            m = ((pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2)
            rr = 0.62 * P
            svg(f'<circle cx="{m[0]:.1f}" cy="{m[1]:.1f}" r="{rr:.1f}" fill="#2e5c9a" stroke="#1b3a66" stroke-width="1.4"/>')
            # minus stripe on the - side (bottom)
            svg(f'<path d="M {m[0] - rr * 0.8:.1f} {m[1] + rr * 0.6:.1f} A {rr:.1f} {rr:.1f} 0 0 0 {m[0] + rr * 0.8:.1f} {m[1] + rr * 0.6:.1f} Z" fill="#dfe6ee"/>')
            lead_end(pa); lead_end(pb)
            text(m[0] + rr + 3, pa[1] + 5, '+', 15, anchor='start', color='#c0392b', weight='bold')
            text(m[0] + rr + 3, pb[1] + 6, '−', 15, anchor='start', color='#1b3a66', weight='bold')
        elif kind == 'to92':
            pb_ = pt(pm['B'])
            h = 1.3 * P
            flat_right = ex['flat'] == 'right'
            fx = pb_[0] + (0.3 * P if flat_right else -0.3 * P)
            sweep = 0 if flat_right else 1
            svg(f'<path d="M {fx:.1f} {pb_[1] - h:.1f} L {fx:.1f} {pb_[1] + h:.1f} A {0.8 * P:.1f} {h:.1f} 0 0 {sweep} {fx:.1f} {pb_[1] - h:.1f} Z" fill="#2b2b2b"/>')
            for p in 'EBC':
                x, y = pt(pm[p])
                svg(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3.6" fill="#bbb"/>')
                dx = -0.38 * P if flat_right else 0.38 * P
                text(x + dx, y + 5, p, 13, color='#ffd54f', weight='bold')
            text(fx + (-0.1 * P if flat_right else 0.1 * P), pb_[1] - h - 5, ref, 13, anchor='end' if flat_right else 'start', weight='bold', bg=True)
            continue
        elif kind == 'trim':
            pw = pt(pm['W'])
            svg(f'<rect x="{pw[0] - 0.55 * P:.1f}" y="{pw[1] - 1.45 * P:.1f}" width="{1.1 * P:.1f}" height="{2.9 * P:.1f}" rx="4" fill="#2f6fb3" stroke="#1b3a66"/>')
            svg(f'<circle cx="{pw[0]:.1f}" cy="{pw[1]:.1f}" r="{0.36 * P:.1f}" fill="#f5f5f5" stroke="#1b3a66"/>')
            line((pw[0] - 6, pw[1] + 6), (pw[0] + 6, pw[1] - 6), '#1b3a66', 2.4)
            for p in 'AWB':
                x, y = pt(pm[p])
                if p != 'W':
                    svg(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3.6" fill="#ddd"/>')
                text(x + 0.72 * P, y + 5, p, 11, color='#1b3a66', weight='bold')
            text(pw[0] - 0.55 * P, pw[1] - 1.45 * P - 6, 'VR1 50k', 13, anchor='start', weight='bold', bg=True)
            continue
        dx, dy = LABEL.get(ref, (0, 0))
        text(m[0] + dx * P, m[1] + dy * P + 5, ref, 12, weight='bold', bg=True)


PAD_LABEL = {
    'SW.L2': 'SW lug 2', 'SW.L1': 'SW lug 1', 'R7.1': 'LED +9 V', 'J1.sleeve': 'J1 sleeve', 'BAT.+': 'BAT +',
    'FUZZ.1': 'FUZZ 1', 'FUZZ.2': 'FUZZ 2', 'FUZZ.3': 'FUZZ 3', 'VOL.1': 'VOL 1', 'VOL.3': 'VOL 3', 'J2.sleeve': 'J2 sleeve',
}


def main():
    seg_net = verify()
    OX, OY = 40, 120
    width = OX + (NCOL + 1) * P + 470
    OY2 = OY + (NROW + 1) * P + 110
    height = OY2 + (NROW + 1) * P + 140
    svg(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">')
    svg('<rect width="100%" height="100%" fill="white"/>')
    text(OX, 38, '2N3904 Fuzz Face — stripboard layout', 22, anchor='start', weight='bold')
    text(OX, 62, f'{NCOL} × {NROW} holes (0.1 in pitch), strips horizontal. Matches the fuzz-face-2n3904 schematic; nets auto-checked.', 13, anchor='start', color='#555')

    hx, hy = board(OX, OY, seg_net, title='Component side')
    components(hx, hy)
    # off-board pad labels (component side) — placed outside the board edge where possible
    for pin, (r, c) in PADS.items():
        x, y = hx(c), hy(r)
        if r == 8:
            text(x, OY + (NROW + 1) * P + 22 + (14 if pin in ('FUZZ.1', 'VOL.1') else 0), PAD_LABEL[pin], 11, color='#2471a3', weight='bold')
            line((x, y + 7), (x, OY + (NROW + 1) * P + 8 + (14 if pin in ('FUZZ.1', 'VOL.1') else 0)), '#2471a3', 1, dash='2 2')
        else:
            text(x + 9, y - 9, PAD_LABEL[pin], 11, anchor='start', color='#2471a3', weight='bold', bg=True)

    # net legend beside the component view
    lx = OX + (NCOL + 1) * P + 30
    ly = OY + 10
    text(lx, ly, 'Strips', 15, anchor='start', weight='bold')
    ly += 22
    for r in range(1, NROW + 1):
        segs = sorted((seg_span(s)[1], seg_span(s)[2], n) for s, n in seg_net.items() if seg_span(s)[0] == r)
        desc = '  |  '.join(f'{n} ({lo}–{hi})' for lo, hi, n in segs)
        text(lx, ly, f'{chr(64 + r)}:', 13, anchor='start', weight='bold')
        text(lx + 24, ly, desc, 12, anchor='start')
        ly += 20
    ly += 8
    text(lx, ly, 'Track cuts (on the hole)', 15, anchor='start', weight='bold'); ly += 20
    text(lx, ly, ', '.join(f'{chr(64 + r)}{c}' for r, c in CUTS), 13, anchor='start'); ly += 20
    text(lx, ly, 'Links', 15, anchor='start', weight='bold'); ly += 20
    for a, b in LINKS:
        text(lx, ly, f'{chr(64 + a[0])}{a[1]} – {chr(64 + b[0])}{b[1]}' + ('  (insulated; crosses B–G)' if abs(a[0] - b[0]) > 1 else '  (Q2_COL to VR1 wiper)'), 12, anchor='start'); ly += 18

    ly += 10
    text(lx, ly, 'Parts', 15, anchor='start', weight='bold'); ly += 20
    # Sorted by type (R, C, Q, VR), then number, so the list reads R1, R2, ...
    order = {'R': 0, 'C': 1, 'Q': 2, 'VR': 3}
    bom = sorted(((ref, value.replace(' opt.', ' (optional)')) for _, ref, value, _, _ in PARTS),
                 key=lambda rv: (order[rv[0].rstrip('0123456789')], int(rv[0].lstrip('ACQRV'))))
    for i, (ref, value) in enumerate(bom):
        col = i % 2
        text(lx + col * 170, ly + (i // 2) * 18, f'{ref}', 12, anchor='start', weight='bold')
        text(lx + col * 170 + 40, ly + (i // 2) * 18, value, 12, anchor='start')

    # copper side
    hx2, hy2 = board(OX, OY2, seg_net, mirror=True, title='Copper side (flipped left–right) — cut here')
    lx2 = OX + (NCOL + 1) * P + 30
    ly2 = max(OY2 + 10, ly + ((len(PARTS) + 1) // 2) * 18 + 24)
    notes = [
        ('Build notes', True),
        ('Cut all 6 tracks first; check each with a meter.', False),
        ('Holes are named by row letter + column, e.g. D10.', False),
        ('Q1 flat face left, Q2 flat face right (the flat', False),
        ('  edge of each drawing). Legs', False),
        ('  read E-B-C when you face the flat side.', False),
        ('  Check your parts’ datasheet pinout.', False),
        ('R2 and R5 lie along their strip over a cut.', False),
        ('VR1 assumes an inline-pin trimmer (A-W-B in', False),
        ('  a row). Check yours; the W and B pins must', False),
        ('  both reach strip D/E via the D18–E18 link.', False),
        ('C2: stripe (−) toward row H (GND).', False),
        ('C4, C5 optional (dashed).', False),
        ('Blue rings = off-board wire pads.', False),
        ('Footswitch, jacks, LED, battery: see the', False),
        ('  footswitch diagram. Battery − goes to the', False),
        ('  input jack ring, not to the board.', False),
        ('', False),
        ('Bias: no signal, meter red on Q2 C (strip D,', False),
        ('  11–20), black on GND. Set VR1 for ≈ 4.5 V.', False),
    ]
    for s, bold in notes:
        text(lx2, ly2, s, 15 if bold else 13, anchor='start', weight='bold' if bold else 'normal'); ly2 += 20 if bold else 18

    svg('</svg>')
    (HERE / 'fuzz-face-stripboard.svg').write_text('\n'.join(out))
    print('netlist check passed;', len(seg_net), 'strip segments mapped')


if __name__ == '__main__':
    main()
