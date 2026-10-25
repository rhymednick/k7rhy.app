// Minimal PEEC-style lumped RF engine: straight, axis-aligned conductor segments with partial self and mutual
// inductance (Grover), series resistance, shunt/series capacitors, and a one-port input-impedance solve by nodal
// analysis. Units: mm, nH, pF, Hz, ohm. Verified against closed forms in check-layout.mjs.
//
// What it models: loop and partial inductance of the conductors, mutual coupling between parallel conductors
// (including cancellation between opposite currents), lumped capacitors. What it does not model: radiation,
// skin-effect resistance, dielectric loss, distributed capacitance to nearby objects, the BNC's internal structure.
const MU0_4PI = 1e-7; // H/m
const MM = 1e-3;

// Mutual partial inductance of two parallel thin filaments, closed form (Neumann/Grover). a = [a1, a2] and b = [b1, b2]
// are the intervals (mm) the two filaments occupy along their common axis; d is the centre-line separation (mm).
// With a = b and d = the conductor's geometric mean distance this is the self partial inductance. Returns nH.
function F(z, d) {
    return z * Math.asinh(z / d) - Math.sqrt(z * z + d * d);
}
export function mutualParallel(a, b, d) {
    const [a1, a2] = a;
    const [b1, b2] = b;
    const m = F(a2 - b1, d) - F(a2 - b2, d) - F(a1 - b1, d) + F(a1 - b2, d);
    return MU0_4PI * m * MM * 1e9; // mm -> m, H -> nH
}

export class Model {
    constructor() {
        this.segs = []; // coupled segments: {name, axisIdx, a:[x,y,z], b:[x,y,z], gmd, R, Lx (extra series nH), n1, n2, dir}
        this.branches = []; // uncoupled series branches: {name, n1, n2, R, L (nH), C (pF, in series) | null}
        this.shunts = []; // capacitors between nodes: {n1, n2, C (pF)}
        this.port = null; // node that receives the 1 A test current; node 'REF' is the reference
    }
    seg(name, a, b, gmd, n1, n2, { R = 0, Lx = 0 } = {}) {
        const diff = [0, 1, 2].map((i) => b[i] - a[i]);
        const axisIdx = diff.findIndex((v) => Math.abs(v) > 1e-9);
        if (diff.filter((v) => Math.abs(v) > 1e-9).length !== 1) throw new Error(`segment ${name} is not axis aligned`);
        this.segs.push({ name, axisIdx, a, b, gmd, R, Lx, n1, n2, dir: Math.sign(diff[axisIdx]) });
    }
    branch(name, n1, n2, { R = 0, L = 0, C = null } = {}) {
        this.branches.push({ name, n1, n2, R, L, C });
    }
    shunt(n1, n2, C) {
        this.shunts.push({ n1, n2, C });
    }
    // partial inductance matrix (nH) of the coupled segments
    inductance() {
        const n = this.segs.length;
        const L = Array.from({ length: n }, () => new Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            const si = this.segs[i];
            const lo = Math.min(si.a[si.axisIdx], si.b[si.axisIdx]);
            const hi = Math.max(si.a[si.axisIdx], si.b[si.axisIdx]);
            L[i][i] = mutualParallel([lo, hi], [lo, hi], si.gmd) + si.Lx;
            for (let j = i + 1; j < n; j++) {
                const sj = this.segs[j];
                if (sj.axisIdx !== si.axisIdx) continue; // perpendicular conductors do not couple
                const k = si.axisIdx;
                const lat = [0, 1, 2].filter((q) => q !== k);
                const dist = Math.hypot(si.a[lat[0]] - sj.a[lat[0]], si.a[lat[1]] - sj.a[lat[1]]);
                const d = Math.max(dist, (si.gmd + sj.gmd) / 2);
                const jlo = Math.min(sj.a[k], sj.b[k]);
                const jhi = Math.max(sj.a[k], sj.b[k]);
                L[i][j] = L[j][i] = mutualParallel([lo, hi], [jlo, jhi], d) * si.dir * sj.dir;
            }
        }
        return L;
    }
    nodeIndex() {
        const names = new Set();
        const add = (n) => n !== 'REF' && names.add(n);
        this.segs.forEach((s) => (add(s.n1), add(s.n2)));
        this.branches.forEach((s) => (add(s.n1), add(s.n2)));
        this.shunts.forEach((s) => (add(s.n1), add(s.n2)));
        add(this.port);
        return [...names];
    }
    // Input impedance at the port node relative to REF at frequency f (Hz): [re, im]. With wantCurrents, also the
    // magnitude of the current in every coupled segment for a 1 A drive: {z, cur}. Pass the same `cache` object across
    // a sweep so the inductance matrix is built once.
    zin(f, cache = {}, wantCurrents = false) {
        const w = 2 * Math.PI * f;
        const nodes = (cache.nodes ??= this.nodeIndex());
        const idx = new Map(nodes.map((n, i) => [n, i]));
        const Lm = (cache.L ??= this.inductance());
        const ns = this.segs.length;
        const nb = ns + this.branches.length;
        const N = nb + nodes.length;
        // unknowns: branch currents then node voltages. Complex system solved as a real 2N x 2N block matrix.
        const re = Array.from({ length: N }, () => new Float64Array(N));
        const im = Array.from({ length: N }, () => new Float64Array(N));
        const incidence = (node, sign, col) => {
            if (node === 'REF') return;
            re[idx.get(node) + nb][col] += sign; // KCL rows: A i
            re[col][idx.get(node) + nb] -= sign; // branch rows: -A^T v
        };
        for (let i = 0; i < ns; i++) {
            const s = this.segs[i];
            re[i][i] += s.R;
            for (let j = 0; j < ns; j++) im[i][j] += w * Lm[i][j] * 1e-9;
            incidence(s.n1, +1, i);
            incidence(s.n2, -1, i);
        }
        this.branches.forEach((b, k) => {
            const i = ns + k;
            re[i][i] += b.R;
            im[i][i] += w * b.L * 1e-9 - (b.C ? 1 / (w * b.C * 1e-12) : 0);
            incidence(b.n1, +1, i);
            incidence(b.n2, -1, i);
        });
        for (const sh of this.shunts) {
            const y = w * sh.C * 1e-12;
            const p = sh.n1 === 'REF' ? -1 : idx.get(sh.n1) + nb;
            const q = sh.n2 === 'REF' ? -1 : idx.get(sh.n2) + nb;
            if (p >= 0) im[p][p] += y;
            if (q >= 0) im[q][q] += y;
            if (p >= 0 && q >= 0) ((im[p][q] -= y), (im[q][p] -= y));
        }
        const T = 2 * N;
        const M = Array.from({ length: T }, () => new Float64Array(T + 1));
        for (let i = 0; i < N; i++)
            for (let j = 0; j < N; j++) {
                M[i][j] = re[i][j];
                M[i][j + N] = -im[i][j];
                M[i + N][j] = im[i][j];
                M[i + N][j + N] = re[i][j];
            }
        M[nb + idx.get(this.port)][T] = 1; // 1 A injected at the port
        for (let c = 0; c < T; c++) {
            let p = c;
            for (let r = c + 1; r < T; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
            if (Math.abs(M[p][c]) < 1e-300) throw new Error('singular matrix (floating node?)');
            [M[c], M[p]] = [M[p], M[c]];
            for (let r = c + 1; r < T; r++) {
                const factor = M[r][c] / M[c][c];
                if (factor === 0) continue;
                for (let k = c; k <= T; k++) M[r][k] -= factor * M[c][k];
            }
        }
        const x = new Float64Array(T);
        for (let r = T - 1; r >= 0; r--) {
            let s = M[r][T];
            for (let k = r + 1; k < T; k++) s -= M[r][k] * x[k];
            x[r] = s / M[r][r];
        }
        const k = nb + idx.get(this.port);
        if (wantCurrents) {
            const cur = {};
            this.segs.forEach((sg, i) => (cur[sg.name] = Math.hypot(x[i], x[i + N])));
            return { z: [x[k], x[k + N]], cur };
        }
        return [x[k], x[k + N]];
    }
}

// Standing-wave ratio of impedance [re, im] against z0.
export function swr([zr, zi], z0 = 50) {
    const g = Math.hypot(zr - z0, zi) / Math.hypot(zr + z0, zi);
    return (1 + g) / (1 - g);
}
