"""Shared drawing and netlist-checking code for the small pedal layouts.

Used by the Bazz Fuss, Bosstone and Electra generators. Each generator
describes its parts, holes, and expected netlist; this module checks the
layout's connectivity against that netlist and only then writes the SVG and
PNG. The drawing style follows docs/engineering/fuzz-face.

Requires: pip install cairosvg   (schematics also need schemdraw matplotlib)
"""
from pathlib import Path
import math

FONT = 'Helvetica, Arial, sans-serif'


# ------------------------------------------------------------ helpers
class Canvas:
    def __init__(self):
        self.out = []

    def svg(self, s):
        self.out.append(s)

    def text(self, x, y, s, size=12, anchor='middle', color='#111', weight='normal', bg=False):
        if bg:
            w = len(s) * size * 0.6 + 6
            x0 = x - w / 2 if anchor == 'middle' else (x - 3 if anchor == 'start' else x - w + 3)
            self.svg(f'<rect x="{x0:.1f}" y="{y - size + 1:.1f}" width="{w:.1f}" height="{size + 4}" rx="3" fill="white" fill-opacity="0.9"/>')
        self.svg(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" text-anchor="{anchor}" fill="{color}" font-weight="{weight}" font-family="{FONT}">{s}</text>')

    def line(self, a, b, color='#777', w=2.0, dash=None):
        d = f' stroke-dasharray="{dash}"' if dash else ''
        self.svg(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="{color}" stroke-width="{w}" stroke-linecap="round"{d}/>')

    def poly(self, pts, color, w=3.2, dash=None):
        d = f' stroke-dasharray="{dash}"' if dash else ''
        self.svg('<polyline points="' + ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts) + f'" fill="none" stroke="{color}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"{d}/>')

    def lead_end(self, p):
        self.svg(f'<circle cx="{p[0]:.1f}" cy="{p[1]:.1f}" r="3.6" fill="#666"/>')

    def save(self, path, width, height):
        path = Path(path)
        body = '\n'.join(self.out)
        path.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width:.0f}" height="{height:.0f}" viewBox="0 0 {width:.0f} {height:.0f}">\n'
                        f'<rect width="100%" height="100%" fill="white"/>\n{body}\n</svg>\n')
        to_png(path)


def to_png(svg_path, width=2400):
    import cairosvg
    svg_path = Path(svg_path)
    cairosvg.svg2png(url=str(svg_path), write_to=str(svg_path.with_suffix('.png')), output_width=width, background_color='white')


DIGIT = ['#111', '#795548', '#d32f2f', '#ef6c00', '#f9a825', '#2e7d32', '#1565c0', '#6a1b9a', '#757575', '#eee']


def bands(value):
    """Colour bands (digit, digit, multiplier) for values like 470, 4.7k, 2.2M."""
    v = value.split()[0]
    mult = {'k': 1e3, 'M': 1e6}.get(v[-1], 1)
    ohms = float(v.rstrip('kM')) * mult
    exp = int(math.floor(math.log10(ohms))) - 1
    sig = round(ohms / 10 ** exp)
    if sig >= 100:
        sig //= 10; exp += 1
    return [DIGIT[sig // 10], DIGIT[sig % 10], DIGIT[exp]]


class UnionFind:
    def __init__(self):
        self.parent = {}

    def find(self, a):
        self.parent.setdefault(a, a)
        while self.parent[a] != a:
            self.parent[a] = self.parent[self.parent[a]]
            a = self.parent[a]
        return a

    def union(self, a, b):
        self.parent[self.find(a)] = self.find(b)


def compare(uf, expected, placed):
    comp = {p for s in expected.values() for p in s}
    assert placed == comp, f'pin mismatch (placed vs netlist): {sorted(placed ^ comp)}'
    groups = {}
    for p in comp:
        groups.setdefault(uf.find(p), set()).add(p)
    actual = sorted(sorted(g) for g in groups.values())
    want = sorted(sorted(g) for g in expected.values())
    if actual != want:
        extra = [g for g in actual if g not in want]
        missing = [g for g in want if g not in actual]
        raise SystemExit(f'NETLIST MISMATCH\nlayout has: {extra}\nnetlist wants: {missing}')


def check_to92(ref, pm):
    """TO-92 legs must sit in three neighbouring holes in a straight line with B in the middle."""
    e, b, c = pm['E'], pm['B'], pm['C']
    ok = (abs(e[0] - b[0]) + abs(e[1] - b[1]) == 1 and abs(c[0] - b[0]) + abs(c[1] - b[1]) == 1
          and (e[0] - b[0], e[1] - b[1]) == (b[0] - c[0], b[1] - c[1]))
    assert ok, f'{ref}: E-B-C must be in three adjacent holes in a line'


# ------------------------------------------------------------ part drawing
def draw_part(cv, P, pt, kind, ref, value, pm, ex):
    """Draw one part. pt(loc) -> (x, y). Returns nothing; labels itself."""
    pins = list(pm.values())
    lab = ex.get('lab')
    dashed = ex.get('optional', False)

    def axial(fill, stroke, blen, bw, bnds=None, band_k=None):
        pa, pb = pt(pins[0]), pt(pins[1])
        cv.line(pa, pb, '#8a8a8a', 2.4)
        cv.lead_end(pa); cv.lead_end(pb)
        mx, my = (pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2
        ang = math.degrees(math.atan2(pb[1] - pa[1], pb[0] - pa[0]))
        L = min(blen * P, math.dist(pa, pb) - 14)
        Wd = bw * P
        d = ' stroke-dasharray="4 3"' if dashed else ''
        cv.svg(f'<g transform="translate({mx:.1f},{my:.1f}) rotate({ang:.1f})">')
        cv.svg(f'<rect x="{-L / 2:.1f}" y="{-Wd / 2:.1f}" width="{L:.1f}" height="{Wd:.1f}" rx="{Wd / 2.6:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="1.4"{d}/>')
        for i, c in enumerate(bnds or []):
            cv.svg(f'<rect x="{-L / 2 + L * (0.2 + 0.17 * i):.1f}" y="{-Wd / 2:.1f}" width="{L * 0.09:.1f}" height="{Wd:.1f}" fill="{c}"/>')
        if band_k is not None:   # cathode band at pin index band_k
            bx = L / 2 - L * 0.22 if band_k == 1 else -L / 2 + L * 0.12
            cv.svg(f'<rect x="{bx:.1f}" y="{-Wd / 2:.1f}" width="{L * 0.1:.1f}" height="{Wd:.1f}" fill="#111"/>')
        cv.svg('</g>')
        return mx, my

    if kind == 'res':
        m = axial('#e8d3a8', '#a1887f', 2.3, 0.5, bands(value))
    elif kind == 'film':
        m = axial('#f4d03f', '#b7950b', 1.6, 0.7)
    elif kind == 'diode':
        pins = [pm['A'], pm['K']]
        m = axial('#f0b27a', '#a04000', 1.4, 0.42, band_k=1)
    elif kind == 'ceramic':
        pa, pb = pt(pins[0]), pt(pins[1])
        cv.line(pa, pb, '#8a8a8a', 2.2); cv.lead_end(pa); cv.lead_end(pb)
        m = ((pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2)
        d = ' stroke-dasharray="3 2"' if dashed else ''
        cv.svg(f'<ellipse cx="{m[0]:.1f}" cy="{m[1]:.1f}" rx="{0.34 * P:.1f}" ry="{0.34 * P:.1f}" fill="#e67e22" stroke="#a04000" stroke-width="1.4"{d}/>')
    elif kind in ('elec', 'led'):
        a, k = ('+', '-') if kind == 'elec' else ('A', 'K')
        pa, pb = pt(pm[a]), pt(pm[k])
        cv.line(pa, pb, '#8a8a8a', 2.2)
        m = ((pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2)
        ux, uy = (pb[0] - pa[0]), (pb[1] - pa[1])
        n = math.hypot(ux, uy); ux, uy = ux / n, uy / n
        if kind == 'elec':
            rr = 0.6 * P
            cv.svg(f'<circle cx="{m[0]:.1f}" cy="{m[1]:.1f}" r="{rr:.1f}" fill="#2e5c9a" stroke="#1b3a66" stroke-width="1.4"/>')
            # light stripe on the - side
            ang = math.degrees(math.atan2(uy, ux))
            cv.svg(f'<g transform="translate({m[0]:.1f},{m[1]:.1f}) rotate({ang:.1f})"><path d="M {rr * 0.45:.1f} {-rr * 0.89:.1f} A {rr:.1f} {rr:.1f} 0 0 1 {rr * 0.45:.1f} {rr * 0.89:.1f} Z" fill="#dfe6ee"/></g>')
            cv.text(m[0] - ux * rr * 0.45, m[1] - uy * rr * 0.45 + 5, '+', 15, color='white', weight='bold')
        else:
            rr = 0.55 * P
            col = ex.get('color', '#e74c3c')
            ang = math.degrees(math.atan2(uy, ux))
            # flat edge on the cathode side
            cv.svg(f'<g transform="translate({m[0]:.1f},{m[1]:.1f}) rotate({ang:.1f})">'
                   f'<path d="M {rr * 0.75:.1f} {-rr * 0.66:.1f} A {rr:.1f} {rr:.1f} 0 1 0 {rr * 0.75:.1f} {rr * 0.66:.1f} Z" fill="{col}" fill-opacity="0.85" stroke="#7b241c" stroke-width="1.4"/></g>')
        cv.lead_end(pa); cv.lead_end(pb)
    elif kind == 'to92':
        pe, pbb, pc = pt(pm['E']), pt(pm['B']), pt(pm['C'])
        flat = ex['flat']                      # direction the flat face points
        fx, fy = {'left': (-1, 0), 'right': (1, 0), 'up': (0, -1), 'down': (0, 1)}[flat]
        # Facing the flat side, legs read E-B-C left to right: E sits 90 degrees clockwise of the flat direction.
        de = ((pe[0] - pbb[0]) / P, (pe[1] - pbb[1]) / P)
        assert abs(de[0] - (-fy)) < 0.05 and abs(de[1] - fx) < 0.05, f'{ref}: flat face {flat} does not match its E-B-C pin order'
        ang = math.degrees(math.atan2(fy, fx))
        h = 1.3 * P
        cv.svg(f'<g transform="translate({pbb[0]:.1f},{pbb[1]:.1f}) rotate({ang:.1f})">'
               f'<path d="M {0.32 * P:.1f} {-h:.1f} L {0.32 * P:.1f} {h:.1f} A {0.85 * P:.1f} {h:.1f} 0 0 1 {0.32 * P:.1f} {-h:.1f} Z" fill="#2b2b2b"/></g>')
        for p, xy in (('E', pe), ('B', pbb), ('C', pc)):
            cv.svg(f'<circle cx="{xy[0]:.1f}" cy="{xy[1]:.1f}" r="3.6" fill="#bbb"/>')
            cv.text(xy[0] - fx * 0.4 * P, xy[1] - fy * 0.45 * P + 5, p, 13, color='#ffd54f', weight='bold')
        dx, dy = lab or (-fx * 1.6, -fy * 1.6 if fy else -1.6)
        cv.text(pbb[0] + dx * P, pbb[1] + dy * P + 5, f'{ref} {value}', 12, weight='bold', bg=True)
        return
    else:
        raise ValueError(kind)
    dx, dy = lab or (0, 0)
    cv.text(m[0] + dx * P, m[1] + dy * P + 5, f'{ref} {value}', 12, weight='bold', bg=True)


# ------------------------------------------------------------ stripboard
class Stripboard:
    """Strips run horizontally. Locations are (row, col), 1-based."""

    P = 34

    def __init__(self, ncol, nrow, cuts, parts, links, pads, off_wires, expected, pad_labels=None):
        self.ncol, self.nrow = ncol, nrow
        self.cuts, self.parts, self.links, self.pads = cuts, parts, links, pads
        self.off_wires, self.expected = off_wires, expected
        self.pad_labels = pad_labels or {}

    def segment(self, loc):
        r, c = loc
        assert loc not in self.cuts, f'{loc} is a cut hole'
        lo = max([x for rr, x in self.cuts if rr == r and x < c], default=0)
        return f'r{r}:{lo + 1}'

    def seg_span(self, seg):
        r, lo = map(int, seg[1:].split(':'))
        hi = min([x for rr, x in self.cuts if rr == r and x >= lo], default=self.ncol + 1) - 1
        return r, lo, hi

    def verify(self):
        uf = UnionFind()
        used = {}
        holes = [(f'{ref}.{pin}', loc) for _, ref, _, pm, _ in self.parts for pin, loc in pm.items()]
        for i, (a, b) in enumerate(self.links):
            holes += [(f'link{i}a', a), (f'link{i}b', b)]
        holes += list(self.pads.items())
        for name, loc in holes:
            r, c = loc
            assert 1 <= r <= self.nrow and 1 <= c <= self.ncol, f'{name} off board {loc}'
            assert loc not in used, f'hole {loc} used by {used.get(loc)} and {name}'
            used[loc] = name
            uf.union(name, self.segment(loc))
        for a, b in self.links:
            uf.union(self.segment(a), self.segment(b))
        for a, b in self.off_wires:
            uf.union(a, b)
        for kind, ref, _, pm, _ in self.parts:
            if kind == 'to92':
                check_to92(ref, pm)
                assert len({l[1] for l in pm.values()}) == 1, f'{ref}: stripboard TO-92 must stand in one column'
        placed = {n for n, _ in holes if not n.startswith('link')} | {p for w in self.off_wires for p in w}
        compare(uf, self.expected, placed)
        seg_net = {}
        for net, members in self.expected.items():
            root = uf.find(next(iter(members)))
            for loc in used:
                s = self.segment(loc)
                if uf.find(s) == root:
                    seg_net[s] = net
        return seg_net

    def board(self, cv, ox, oy, mirror=False, title=''):
        P, NCOL, NROW = self.P, self.ncol, self.nrow

        def hx(c):
            return ox + ((NCOL + 1 - c) if mirror else c) * P

        def hy(r):
            return oy + r * P

        W, H = (NCOL + 1) * P, (NROW + 1) * P
        cv.svg(f'<rect x="{ox + 0.35 * P:.1f}" y="{oy + 0.35 * P:.1f}" width="{W - 0.7 * P:.1f}" height="{H - 0.7 * P:.1f}" rx="6" fill="#d9c9a3" stroke="#a8956a" stroke-width="1.5"/>')
        cv.text(ox + 0.4 * P, oy + 0.1 * P, title, 14, anchor='start', weight='bold')
        for r in range(1, NROW + 1):
            cuts = sorted(c for rr, c in self.cuts if rr == r)
            bounds = [0] + cuts + [NCOL + 1]
            for lo, hi in zip(bounds, bounds[1:]):
                a, b = lo + 1, hi - 1
                if a > b:
                    continue
                x1, x2 = sorted((hx(a), hx(b)))
                cv.svg(f'<rect x="{x1 - 0.42 * P:.1f}" y="{hy(r) - 0.36 * P:.1f}" width="{x2 - x1 + 0.84 * P:.1f}" height="{0.72 * P:.1f}" rx="3" fill="#c8793a" fill-opacity="{0.95 if mirror else 0.35}"/>')
        for r in range(1, NROW + 1):
            for c in range(1, NCOL + 1):
                cv.svg(f'<circle cx="{hx(c):.1f}" cy="{hy(r):.1f}" r="3.6" fill="#fdfaf2" stroke="#8a6d3b" stroke-width="0.8"/>')
        for r, c in self.cuts:
            x, y = hx(c), hy(r)
            cv.svg(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{0.42 * P:.1f}" fill="#fdfaf2" stroke="#c0392b" stroke-width="2.2"/>')
            cv.line((x - 7, y - 7), (x + 7, y + 7), '#c0392b', 2.6)
            cv.line((x - 7, y + 7), (x + 7, y - 7), '#c0392b', 2.6)
        for r in range(1, NROW + 1):
            cv.text(ox + 0.05 * P, hy(r) + 4, chr(64 + r), 12, color='#6d5a33', weight='bold')
            cv.text(ox + (NCOL + 0.95) * P, hy(r) + 4, chr(64 + r), 12, color='#6d5a33', weight='bold')
        for c in range(1, NCOL + 1):
            cv.text(hx(c), oy + (NROW + 0.9) * P, str(c), 10, color='#6d5a33')
        return hx, hy

    def draw(self, path, title, subtitle, notes, pad_label_pos=None):
        seg_net = self.verify()
        P, NCOL, NROW = self.P, self.ncol, self.nrow
        cv = Canvas()
        OX, OY = 150, 120
        width = OX + (NCOL + 1) * P + 640
        OY2 = OY + (NROW + 1) * P + 110
        cv.text(OX, 38, title, 22, anchor='start', weight='bold')
        cv.text(OX, 62, subtitle, 13, anchor='start', color='#555')

        hx, hy = self.board(cv, OX, OY, title='Component side')
        pt = lambda loc: (hx(loc[1]), hy(loc[0]))
        for a, b in self.links:
            cv.line(pt(a), pt(b), '#1e8449', 4.2)
            cv.lead_end(pt(a)); cv.lead_end(pt(b))
        for kind, ref, value, pm, ex in self.parts:
            draw_part(cv, P, pt, kind, ref, value, pm, ex)
        pos = pad_label_pos or {}
        below = sorted((loc[1], n) for n, loc in self.pads.items() if pos.get(n) == 'below')
        level = {n: i % 3 for i, (_, n) in enumerate(below)}
        for name, loc in self.pads.items():
            x, y = pt(loc)
            cv.svg(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="7" fill="none" stroke="#2471a3" stroke-width="2.4"/>')
            cv.svg(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3" fill="#2471a3"/>')
            lab = self.pad_labels.get(name, name)
            where = pos.get(name, 'ne')
            if where == 'below':
                yb = OY + (NROW + 1) * P + 22 + 15 * level[name]
                cv.line((x, y + 7), (x, yb - 14), '#2471a3', 1, dash='2 2')
                cv.text(x, yb, lab, 11, color='#2471a3', weight='bold')
            elif where == 'above':
                ya = OY + 0.1 * P - 4 - (14 if loc[1] % 2 else 0)
                cv.line((x, y - 7), (x, ya + 4), '#2471a3', 1, dash='2 2')
                cv.text(x, ya, lab, 11, color='#2471a3', weight='bold', bg=True)
            elif where in ('w', 'e'):
                xe = OX + (-0.3 * P if where == 'w' else (NCOL + 1.3) * P)
                cv.line((x + (-7 if where == 'w' else 7), y), (xe, y), '#2471a3', 1, dash='2 2')
                cv.text(xe + (-4 if where == 'w' else 4), y + 4, lab, 11, anchor='end' if where == 'w' else 'start', color='#2471a3', weight='bold', bg=True)
            elif where == 'sw':
                cv.text(x - 9, y + 20, lab, 11, anchor='end', color='#2471a3', weight='bold', bg=True)
            elif where == 'nw':
                cv.text(x - 9, y - 9, lab, 11, anchor='end', color='#2471a3', weight='bold', bg=True)
            elif where == 'se':
                cv.text(x + 9, y + 20, lab, 11, anchor='start', color='#2471a3', weight='bold', bg=True)
            else:
                cv.text(x + 9, y - 9, lab, 11, anchor='start', color='#2471a3', weight='bold', bg=True)

        # side panel
        lx, ly = OX + (NCOL + 1) * P + 110, OY + 10
        cv.text(lx, ly, 'Strips (auto-checked against the netlist)', 15, anchor='start', weight='bold'); ly += 22
        for r in range(1, NROW + 1):
            segs = sorted((self.seg_span(s)[1], self.seg_span(s)[2], n) for s, n in seg_net.items() if self.seg_span(s)[0] == r)
            desc = '  |  '.join(f'{n} ({lo}–{hi})' for lo, hi, n in segs) or '(unused)'
            cv.text(lx, ly, f'{chr(64 + r)}:', 13, anchor='start', weight='bold')
            cv.text(lx + 24, ly, desc, 12, anchor='start'); ly += 20
        ly += 8
        cv.text(lx, ly, 'Track cuts (on the hole)', 15, anchor='start', weight='bold'); ly += 20
        cv.text(lx, ly, ', '.join(f'{chr(64 + r)}{c}' for r, c in self.cuts) or 'none', 13, anchor='start'); ly += 24
        if self.links:
            cv.text(lx, ly, 'Wire links', 15, anchor='start', weight='bold'); ly += 20
            cv.text(lx, ly, ',  '.join(f'{chr(64 + a[0])}{a[1]}–{chr(64 + b[0])}{b[1]}' for a, b in self.links), 13, anchor='start'); ly += 24
        cv.text(lx, ly, 'Parts', 15, anchor='start', weight='bold'); ly += 20
        for i, (_, ref, value, _, ex) in enumerate(self.parts):
            col = i % 2
            v = value + (' (optional)' if ex.get('optional') else '')
            cv.text(lx + col * 240, ly + (i // 2) * 18, ref, 12, anchor='start', weight='bold')
            cv.text(lx + col * 240 + 40, ly + (i // 2) * 18, v, 12, anchor='start')
        ly += ((len(self.parts) + 1) // 2) * 18 + 16

        hx2, hy2 = self.board(cv, OX, OY2, mirror=True, title='Copper side (flipped left–right): cut here')
        ly2 = max(OY2 + 10, ly)
        cv.text(lx, ly2, 'Build notes', 15, anchor='start', weight='bold'); ly2 += 22
        for s in notes:
            cv.text(lx, ly2, s, 13, anchor='start'); ly2 += 18
        height = max(OY2 + (NROW + 1) * P + 60, ly2 + 30)
        cv.save(path, width, height)
        print(f'{Path(path).name}: netlist check passed; {len(seg_net)} strip segments')


# ------------------------------------------------------------ breadboard
class Breadboard:
    """Half-size (30-column) breadboard. Locations are (col, row) with rows
    'T+', 'T-', 'a'..'e', 'f'..'j', 'B-', 'B+'. Off-board parts sit below."""

    P = 24
    NCOL = 30
    X0, Y0 = 90, 250
    ROWY = {'T+': 0.0, 'T-': 1.0, 'a': 2.6, 'b': 3.6, 'c': 4.6, 'd': 5.6, 'e': 6.6,
            'f': 8.4, 'g': 9.4, 'h': 10.4, 'i': 11.4, 'j': 12.4, 'B-': 14.0, 'B+': 15.0}

    def __init__(self, parts, jumpers, offboard, wires, off_wires, expected):
        self.parts, self.jumpers, self.offboard = parts, jumpers, offboard
        self.wires, self.off_wires, self.expected = wires, off_wires, expected
        self.BY = self.Y0 + 20.5 * self.P
        self.pins = {}       # off-board pin -> (x, y)
        P, X0, Y0 = self.P, self.X0, self.Y0
        self.pins['J1.tip'] = (28, Y0 + 4.6 * P)
        self.pins['J1.sleeve'] = (28, Y0 + 1.0 * P)
        self.pins['BAT.+'] = (X0 + 3 * P, Y0 - 3.4 * P)
        self.pins['BAT.-'] = (X0 + 5 * P, Y0 - 3.4 * P)
        for ob in offboard:
            x = X0 + ob['x'] * P
            if ob['type'] in ('pot', 'spdt'):
                for i in (1, 2, 3):
                    self.pins[f"{ob['ref']}.{i}"] = (x + (i - 2) * P, self.BY)
            elif ob['type'] == 'jack':
                self.pins[f"{ob['ref']}.tip"] = (x, self.BY + 0.2 * P)
                self.pins[f"{ob['ref']}.sleeve"] = (x + 2 * P, self.BY + 0.2 * P)

    def xy(self, loc):
        col, row = loc
        return self.X0 + col * self.P, self.Y0 + self.ROWY[row] * self.P

    @staticmethod
    def node(loc):
        col, row = loc
        if row in ('T+', 'T-', 'B+', 'B-'):
            return 'rail' + row
        return f'{col}{"T" if row in "abcde" else "B"}'

    def verify(self):
        uf = UnionFind()
        used = {}
        holes = [(f'{ref}.{pin}', loc) for _, ref, _, pm, _ in self.parts for pin, loc in pm.items()]
        holes += [(f'jumper{i}{s}', l) for i, (a, b, _) in enumerate(self.jumpers) for s, l in (('a', a), ('b', b))]
        holes += [(f'wire:{p}', l) for p, l, _ in self.wires]
        for name, loc in holes:
            assert 1 <= loc[0] <= self.NCOL and loc[1] in self.ROWY, f'{name} off board {loc}'
            assert loc not in used, f'hole {loc} used by {used.get(loc)} and {name}'
            used[loc] = name
            uf.union(name, self.node(loc))
        for a, b, _ in self.jumpers:
            uf.union(self.node(a), self.node(b))
        for p, l, _ in self.wires:
            assert p in self.pins, f'unknown off-board pin {p}'
            uf.union(p, self.node(l))
        for a, b, _ in self.off_wires:
            uf.union(a, b)
        for kind, ref, _, pm, _ in self.parts:
            if kind == 'to92':
                check_to92(ref, {p: (l[0], 0) for p, l in pm.items()})
                assert len({l[1] for l in pm.values()}) == 1, f'{ref}: breadboard TO-92 must sit along one row'
        placed = {n for n, _ in holes if not n.startswith(('jumper', 'wire:'))} | set(self.pins)
        compare(uf, self.expected, placed)
        strip_net = {}
        for net, members in self.expected.items():
            root = uf.find(next(iter(members)))
            for loc in used:
                n = self.node(loc)
                if uf.find(n) == root:
                    strip_net[n] = net
        return strip_net

    def draw_board(self, cv, strip_net):
        P, X0, Y0, NCOL, ROWY = self.P, self.X0, self.Y0, self.NCOL, self.ROWY
        W = (NCOL + 1) * P
        cv.svg(f'<rect x="{X0 - 0.2 * P:.1f}" y="{Y0 - 0.9 * P:.1f}" width="{W:.1f}" height="{16.8 * P:.1f}" rx="8" fill="#f7f5ef" stroke="#c9c4b5" stroke-width="1.5"/>')
        cv.svg(f'<rect x="{X0 - 0.2 * P:.1f}" y="{Y0 + 7.2 * P:.1f}" width="{W:.1f}" height="{0.6 * P:.1f}" fill="#e6e1d3"/>')
        for row, col in (('T+', '#c0392b'), ('T-', '#2c3e50'), ('B-', '#2c3e50'), ('B+', '#c0392b')):
            y = Y0 + ROWY[row] * P
            off = -0.5 if row in ('T+', 'B-') else 0.5
            cv.line((X0 + 0.5 * P, y + off * P), (X0 + (NCOL + 0.3) * P, y + off * P), col, 1.6)
            cv.text(X0 - 0.2 * P - 8, y + 4, '+' if '+' in row else '−', 13, anchor='end', color=col, weight='bold')
            cv.text(X0 + (NCOL + 1) * P + 2, y + 4, 'VCC +9 V' if '+' in row else 'GND', 10, anchor='start', color=col, weight='bold')
        for strip in strip_net:
            if strip.startswith('rail'):
                continue
            col, half = int(strip[:-1]), strip[-1]
            y1 = Y0 + (ROWY['a'] if half == 'T' else ROWY['f']) * P - 0.42 * P
            cv.svg(f'<rect x="{X0 + col * P - 0.42 * P:.1f}" y="{y1:.1f}" width="{0.84 * P:.1f}" height="{4.84 * P:.1f}" rx="4" fill="#fff3c4" stroke="#e0c46c" stroke-width="0.8"/>')
        for row, y in ROWY.items():
            for c in range(1, NCOL + 1):
                cv.svg(f'<rect x="{X0 + c * P - 3.5:.1f}" y="{Y0 + y * P - 3.5:.1f}" width="7" height="7" rx="1.2" fill="#5a574f" fill-opacity="0.55"/>')
        for row in 'abcdefghij':
            y = Y0 + ROWY[row] * P + 4
            cv.text(X0 + 0.2 * P, y, row, 10, color='#8a8578')
            cv.text(X0 + (NCOL + 0.75) * P, y, row, 10, color='#8a8578')
        for c in range(1, NCOL + 1):
            if c == 1 or c % 5 == 0:
                cv.text(X0 + c * P, Y0 + 1.95 * P, str(c), 9, color='#8a8578')

    def draw_offboard(self, cv):
        P, X0, Y0, BY = self.P, self.X0, self.Y0, self.BY
        jx = 28
        cv.svg(f'<rect x="{jx - 16}" y="{Y0 + 0.2 * P:.1f}" width="30" height="{5.2 * P:.1f}" rx="5" fill="#555"/>')
        cv.text(jx - 1, Y0 - 0.35 * P, 'J1 IN', 11, weight='bold')
        cv.text(jx - 1, Y0 + 5.95 * P, 'tip', 10, color='#27ae60', weight='bold')
        cv.text(jx + 22, Y0 + 1.0 * P + 14, 'sleeve', 9, anchor='start', bg=True)
        bx1 = X0 + 2.2 * P
        cv.svg(f'<rect x="{bx1:.1f}" y="{Y0 - 6.0 * P:.1f}" width="{3.6 * P:.1f}" height="{2.6 * P:.1f}" rx="5" fill="#333"/>')
        cv.text(bx1 + 1.8 * P, Y0 - 4.5 * P, '9 V supply', 12, color='white', weight='bold')
        cv.text(X0 + 3 * P, Y0 - 3.4 * P + 14, '+', 13, color='#e74c3c', weight='bold')
        cv.text(X0 + 5 * P, Y0 - 3.4 * P + 14, '−', 13, color='#ddd', weight='bold')
        for ob in self.offboard:
            x = X0 + ob['x'] * P
            if ob['type'] == 'pot':
                cv.svg(f'<circle cx="{x:.1f}" cy="{BY + 2.6 * P:.1f}" r="{2.5 * P:.1f}" fill="#9aa0a6" stroke="#5f6368" stroke-width="2"/>')
                cv.svg(f'<circle cx="{x:.1f}" cy="{BY + 2.6 * P:.1f}" r="{0.75 * P:.1f}" fill="#e8eaed" stroke="#5f6368"/>')
                for i in (1, 2, 3):
                    lx = x + (i - 2) * P
                    cv.svg(f'<rect x="{lx - 4:.1f}" y="{BY - 2:.1f}" width="8" height="{0.55 * P:.1f}" fill="#c9a227"/>')
                    cv.text(lx, BY + 1.05 * P, str(i), 10, weight='bold')
                cv.text(x, BY + 5.8 * P, f"{ob['label']} {ob['value']}", 12, weight='bold')
                cv.text(x, BY + 6.5 * P, 'rear view, lugs up', 10, color='#666')
            elif ob['type'] == 'spdt':
                cv.svg(f'<rect x="{x - 1.7 * P:.1f}" y="{BY + 0.5 * P:.1f}" width="{3.4 * P:.1f}" height="{2.4 * P:.1f}" rx="4" fill="#7f8c8d" stroke="#555"/>')
                cv.svg(f'<circle cx="{x:.1f}" cy="{BY + 1.7 * P:.1f}" r="{0.5 * P:.1f}" fill="#ddd" stroke="#555"/>')
                for i in (1, 2, 3):
                    lx = x + (i - 2) * P
                    cv.svg(f'<rect x="{lx - 4:.1f}" y="{BY - 2:.1f}" width="8" height="{0.55 * P:.1f}" fill="#c9a227"/>')
                    cv.text(lx, BY + 3.5 * P, str(i), 10, weight='bold')
                cv.text(x, BY + 4.4 * P, f"{ob['ref']} {ob['label']}", 12, weight='bold')
                cv.text(x, BY + 5.1 * P, ob['value'], 10, color='#666')
            elif ob['type'] == 'jack':
                cv.svg(f'<rect x="{x - 0.6 * P:.1f}" y="{BY + 0.5 * P:.1f}" width="{3.2 * P:.1f}" height="{1.6 * P:.1f}" rx="5" fill="#555"/>')
                cv.text(x + P, BY + 1.5 * P, f"{ob['ref']} OUT", 11, color='white', weight='bold')
                cv.text(x, BY + 2.8 * P, 'tip', 10, color='#2980b9', weight='bold')
                cv.text(x + 2 * P, BY + 2.8 * P, 'sleeve', 10)

    def draw_wires(self, cv):
        P, BY = self.P, self.BY
        for a, b, color in self.jumpers:
            cv.line(self.xy(a), self.xy(b), color, 3.4)
            cv.lead_end(self.xy(a)); cv.lead_end(self.xy(b))
        lane = 0
        for pin, loc, color in self.wires:
            px, py = self.pins[pin]
            hx, hy = self.xy(loc)
            if pin.startswith('J1'):
                pts = [(px, py), (hx, py)] if abs(py - hy) < 1 else [(px, py), (hx - 0.5 * P, py), (hx - 0.5 * P, hy), (hx, hy)]
            elif pin.startswith('BAT'):
                pts = [(px, py), (px, hy)] if abs(px - hx) < 1 else [(px, py), (px, py + 0.8 * P), (hx, py + 0.8 * P), (hx, hy)]
            elif abs(px - hx) < 1:
                pts = [(px, py), (hx, hy)]
            else:
                ly = BY - (1.2 + 0.45 * lane) * P
                lane += 1
                pts = [(px, py), (px, ly), (hx, ly), (hx, hy)]
            cv.poly(pts, color)
            cv.lead_end((hx, hy))
        for a, b, color in self.off_wires:
            pa, pb = self.pins[a], self.pins[b]
            ly = BY - (1.2 + 0.45 * lane) * P
            lane += 1
            cv.poly([pa, (pa[0], ly), (pb[0], ly), pb], color, dash='7 4')

    def draw(self, path, title, subtitle, notes, colours):
        strip_net = self.verify()
        P, X0, Y0, NCOL, BY = self.P, self.X0, self.Y0, self.NCOL, self.BY
        cv = Canvas()
        cv.text(X0 - 0.2 * P, 36, title, 20, anchor='start', weight='bold')
        cv.text(X0 - 0.2 * P, 58, subtitle, 12, anchor='start', color='#555')
        self.draw_board(cv, strip_net)
        self.draw_offboard(cv)
        self.draw_wires(cv)
        pt = self.xy
        for kind, ref, value, pm, ex in self.parts:
            draw_part(cv, P, pt, kind, ref, value, pm, ex)
        # legend
        lx, ly = X0 + (NCOL + 4.6) * P, Y0 - 5.6 * P
        cv.text(lx, ly, 'Strip map (auto-checked against the netlist)', 13, anchor='start', weight='bold')
        rows = {}
        for strip, net in strip_net.items():
            if not strip.startswith('rail'):
                rows.setdefault(net, []).append(strip)
        y = ly + 22
        for net in self.expected:
            strips = sorted(rows.get(net, []), key=lambda s: (int(s[:-1]), s[-1]))
            if not strips:
                continue
            desc = ', '.join(f'{s[:-1]} {"a–e" if s[-1] == "T" else "f–j"}' for s in strips)
            cv.text(lx, y, net, 12, anchor='start', weight='bold')
            cv.text(lx + 100, y, desc, 12, anchor='start'); y += 19
        cv.text(lx, y, 'GND / VCC', 12, anchor='start', weight='bold'); cv.text(lx + 100, y, 'rails (top and bottom linked)', 12, anchor='start'); y += 30
        cv.text(lx, y, 'Build notes', 13, anchor='start', weight='bold'); y += 20
        for n in notes:
            cv.text(lx, y, n, 12, anchor='start'); y += 17
        y += 12
        cv.text(lx, y, 'Wire colours', 13, anchor='start', weight='bold'); y += 20
        for col, lab in colours:
            cv.line((lx, y - 4), (lx + 26, y - 4), col, 3.4)
            cv.text(lx + 34, y, lab, 12, anchor='start'); y += 18
        width = lx + 400
        height = max(BY + 7.2 * P, y + 30)
        cv.svg(f'<rect x="{lx - 14:.1f}" y="{ly - 26:.1f}" width="390" height="{y - ly + 34:.1f}" rx="8" fill="none" stroke="#ddd"/>')
        cv.save(path, width, height)
        print(f'{Path(path).name}: netlist check passed; {len(strip_net)} nodes')
