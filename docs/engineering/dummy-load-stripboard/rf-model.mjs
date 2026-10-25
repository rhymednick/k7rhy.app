// Builds the lumped RF model of a stripboard dummy-load layout (layout.mjs) and sweeps its input impedance.
import { Model, swr } from './rf-engine.mjs';
import { PITCH } from './layout.mjs';
export { swr };

// Modeling assumptions (reference.md §8). Lengths in mm, inductance in nH, capacitance in pF. Every value is an
// engineering estimate, not a measurement of a built board.
export const NOMINAL = {
    resGmd: 1.8, // effective radius of body plus leads for partial inductance (about a 4.5 mm body, 0.8 mm leads)
    resLx: 0, // extra series inductance inside each resistor (spiral-trimmed film parts); unknown, 0 = plain body
    Cbody: 0.3, // end-to-end capacitance of each resistor body
    zBody: 4.1, // height of the resistor axis above the copper side: 1.6 mm board + body radius
    stubGmd: 0.31, // 0.8 mm round lead
    stripGmd: 0.41, // 1.8 mm wide, 35 um copper strip
    boardT: 1.6,
    feedLen: 10, // length of each wire from the BNC to the board
    feedGmd: 0.31,
    Cj: 4, // BAT46: 10 pF at 0 V falling with reverse bias; 4 pF is a mid estimate at the detector's operating point
    zDiode: 3.35,
    esl: 5, // lead inductance of each ceramic capacitor
};
// An invented bad case (not a bound): lossy-inductive resistors, long BNC wires, no body capacitance, small Cj.
export const PESSIMISTIC = { ...NOMINAL, resLx: 40, feedLen: 20, Cbody: 0, Cj: 1 };

export function buildRfModel(layout, opt = {}) {
    const o = { ...NOMINAL, ...opt };
    const m = new Model();
    const xy = ([c, r]) => [c * PITCH, r * PITCH];
    const hole = ([c, r]) => `h${c},${r}`;
    const used = new Map();
    const use = (h) => h && used.set(`${h[0]},${h[1]}`, h);
    for (const p of layout.parts) [p.a, p.b, p.anode, p.cathode, p.center, p.shell].forEach(use);
    // strips: chain the used holes of each strip segment
    for (let r = 1; r <= layout.rows; r++) {
        const holes = [...used.values()].filter((h) => h[1] === r).sort((a, b) => a[0] - b[0]);
        for (let i = 1; i < holes.length; i++) {
            const prev = holes[i - 1];
            const h = holes[i];
            if (layout.cuts.some((x) => x.row === r && x.after >= prev[0] && x.after < h[0])) continue;
            const [x1, y1] = xy(prev);
            const [x2, y2] = xy(h);
            m.seg(`strip${r}:${prev[0]}-${h[0]}`, [x1, y1, 0], [x2, y2, 0], o.stripGmd, hole(prev), hole(h));
        }
    }
    const stub = (name, h, z) => {
        const [x, y] = xy(h);
        m.seg(name, [x, y, 0], [x, y, z], o.stubGmd, hole(h), `t:${name}`);
        return `t:${name}`;
    };
    for (const p of layout.parts) {
        if (p.kind === 'resistor') {
            const t1 = stub(`${p.ref}.1`, p.a, o.zBody);
            const t2 = stub(`${p.ref}.2`, p.b, o.zBody);
            const [x1, y1] = xy(p.a);
            const [x2, y2] = xy(p.b);
            m.seg(`${p.ref}.body`, [x1, y1, o.zBody], [x2, y2, o.zBody], o.resGmd, t1, t2, { R: 100, Lx: o.resLx });
            if (o.Cbody) m.shunt(t1, t2, o.Cbody);
        } else if (p.kind === 'link') {
            const zl = o.boardT + 0.8;
            const t1 = stub(`${p.ref}.1`, p.a, zl);
            const t2 = stub(`${p.ref}.2`, p.b, zl);
            const [x1, y1] = xy(p.a);
            const [x2, y2] = xy(p.b);
            m.seg(`${p.ref}.wire`, [x1, y1, zl], [x2, y2, zl], o.stubGmd, t1, t2);
        } else if (p.kind === 'diode') {
            // reverse-biased junction: lead, then the junction capacitance, then lead (the body is not a conductor)
            const t1 = stub(`${p.ref}.A`, p.anode, o.zDiode);
            const t2 = stub(`${p.ref}.K`, p.cathode, o.zDiode);
            const [x1, y1] = xy(p.anode);
            const [x2, y2] = xy(p.cathode);
            const xm = (x1 + x2) / 2;
            const ym = (y1 + y2) / 2;
            m.seg(`${p.ref}.lead1`, [x1, y1, o.zDiode], [xm - 0.5, ym, o.zDiode], o.stubGmd, t1, `${p.ref}.j1`);
            m.branch(`${p.ref}.Cj`, `${p.ref}.j1`, `${p.ref}.j2`, { C: o.Cj });
            m.seg(`${p.ref}.lead2`, [xm + 0.5, ym, o.zDiode], [x2, y2, o.zDiode], o.stubGmd, `${p.ref}.j2`, t2);
        } else if (p.kind === 'capacitor') {
            const pf = p.role === 'detector' ? 10000 : 3.3;
            const t1 = stub(`${p.ref}.1`, p.a, o.boardT + 3);
            const t2 = stub(`${p.ref}.2`, p.b, o.boardT + 3);
            m.branch(`${p.ref}.body`, t1, t2, { L: o.esl, C: opt[`C_${p.ref}`] ?? pf });
        } else if (p.kind === 'feed') {
            const [xc, yc] = xy(p.center);
            const [xs, ys] = xy(p.shell);
            m.seg('feed.center', [xc, yc, 0], [xc, yc, o.feedLen], o.feedGmd, hole(p.center), 'IN');
            if (p.mode === 'return-along-board') {
                // comparison layouts only: the shell wire has to run back along the board to reach the connector
                const [x0] = xy([p.returnCol, 0]);
                m.seg('feed.shell.up', [xs, ys, 0], [xs, ys, 3], o.feedGmd, hole(p.shell), 's1');
                m.seg('feed.shell.x', [xs, ys, 3], [x0, ys, 3], o.feedGmd, 's1', 's2');
                m.seg('feed.shell.y', [x0, ys, 3], [x0, yc, 3], o.feedGmd, 's2', 's3');
                m.seg('feed.shell.x2', [x0, yc, 3], [xc + PITCH, yc, 3], o.feedGmd, 's3', 's4');
                m.seg('feed.shell.top', [xc + PITCH, yc, 3], [xc + PITCH, yc, o.feedLen], o.feedGmd, 's4', 'REF');
            } else {
                m.seg('feed.shell', [xs, ys, 0], [xs, ys, o.feedLen], o.feedGmd, hole(p.shell), 'REF');
            }
        }
    }
    m.port = 'IN';
    return m;
}

export function sweep(model, f1 = 1e6, f2 = 700e6, n = 500) {
    const cache = {};
    return Array.from({ length: n }, (_, i) => {
        const f = f1 * Math.pow(f2 / f1, i / (n - 1));
        return { f, z: model.zin(f, cache) };
    });
}
// First swept frequency (Hz) at which the SWR exceeds a threshold, or undefined if it never does.
export const crossing = (pts, threshold) => pts.find((p) => swr(p.z) > threshold)?.f;
