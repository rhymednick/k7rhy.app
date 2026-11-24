// Drawing primitives for the treble bleed diagrams. Every element carries data-* tags so verify-drawings.mjs can rebuild
// the connectivity from what is drawn: data-wire / data-net on wires, data-dot on junction dots, data-terminal on
// terminals, data-blade on switch levers, data-netlabel on net label boxes.
// Type is large and friendly (minimum 14 px in a 1200 px-wide canvas); the background is white.

export const NET_COLORS = {
    BUS: '#1f5fbf',
    OUT: '#c0392b',
    'TB-MID': '#8e44ad',
    'TB-SW': '#d35400',
    'TONE-CAP': '#16803c',
    REACT: '#b8860b',
    GND: '#444444',
    OPEN: '#888888',
};

const FONT = 'font-family="Inter, Helvetica, Arial, sans-serif"';
const INK = '#1a1a1a';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function svgDoc(width, height, title, body) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><rect width="${width}" height="${height}" fill="#ffffff"/>${body}</svg>`;
}

// halo puts a white outline behind the letters so a wire can pass under a label and the label stays readable.
export const text = (s, x, y, { size = 16, weight = 400, anchor = 'middle', fill = INK, halo = false } = {}) => `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" fill="${fill}" ${halo ? 'stroke="#ffffff" stroke-width="5" stroke-linejoin="round" paint-order="stroke" ' : ''}${FONT}>${esc(s)}</text>`;

// A wire on one net. Each vertex is a place where this wire may join another; a dot marks a deliberate junction.
export function wire(net, points, opts = {}) {
    const color = opts.color ?? NET_COLORS[net] ?? INK;
    const line = `<polyline data-wire="1" data-net="${esc(net)}" points="${points.map(([x, y]) => `${x},${y}`).join(' ')}" fill="none" stroke="${color}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`;
    const dots = (opts.dot ?? []).map(([x, y]) => `<circle data-dot="1" cx="${x}" cy="${y}" r="6" fill="${color}"/>`).join('');
    return line + dots;
}

export function terminal(id, x, y) {
    return `<circle data-terminal="${esc(id)}" cx="${x}" cy="${y}" r="7" fill="#ffffff" stroke="${INK}" stroke-width="3"/>`;
}

// Three-lug pot. Rear view: shaft away, lugs down, left / center / right = CW / wiper / CCW, so ends.left is the CW lug.
// Schematic view: track between the two ends, wiper arrow from above.
export function pot(id, x, y, opts) {
    const { left, wiper, right } = opts.ends;
    const short = (name) => name.split('.').pop();
    if (opts.view === 'rear') {
        const body = `<circle cx="${x}" cy="${y - 70}" r="64" fill="#e8ecf0" stroke="${INK}" stroke-width="3"/><circle cx="${x}" cy="${y - 70}" r="20" fill="#c9d1d9" stroke="${INK}" stroke-width="2"/>`;
        const lugs = [
            [left, x - 44, 'CW'],
            [wiper, x, 'Wiper'],
            [right, x + 44, 'CCW'],
        ]
            .map(([name, lx, label]) => `<rect x="${lx - 8}" y="${y - 8}" width="16" height="20" fill="#d4d4d4" stroke="${INK}" stroke-width="2"/>${terminal(name, lx, y)}${text(label, lx, y + 36, { size: 14, weight: 600, halo: true })}`)
            .join('');
        return `<g data-pot="${esc(id)}" data-view="rear">${body}${lugs}${text(id, x, y - 26, { size: 18, weight: 700 })}</g>`;
    }
    const track = `<polyline points="${x - 60},${y} ${x - 50},${y - 12} ${x - 30},${y + 12} ${x - 10},${y - 12} ${x + 10},${y + 12} ${x + 30},${y - 12} ${x + 50},${y + 12} ${x + 60},${y}" fill="none" stroke="${INK}" stroke-width="3"/>`;
    const arrow = `<line x1="${x}" y1="${y - 56}" x2="${x}" y2="${y - 16}" stroke="${INK}" stroke-width="3"/><polygon points="${x - 7},${y - 26} ${x + 7},${y - 26} ${x},${y - 12}" fill="${INK}"/>`;
    return `<g data-pot="${esc(id)}" data-view="schematic">${track}${arrow}${terminal(left, x - 60, y)}${terminal(right, x + 60, y)}${terminal(wiper, x, y - 56)}${text(short(left), x - 60, y + 30, { size: 16, weight: 600 })}${text(short(right), x + 60, y + 30, { size: 16, weight: 600 })}${text(id, x, y - 76, { size: 18, weight: 700 })}</g>`;
}

// Two-terminal parts. ends defaults to [`${id}.1`, `${id}.2`]; orient is 'h' (default) or 'v'.
function twoTerminal(kind, id, x, y, opts) {
    const [a, b] = opts.ends ?? [`${id}.1`, `${id}.2`];
    const vertical = opts.orient === 'v';
    const p = (d) => (vertical ? [x, y + d] : [x + d, y]);
    const [ax, ay] = p(-50);
    const [bx, by] = p(50);
    let shape;
    if (kind === 'resistor') {
        const zig = [-50, -30, -24, -12, 0, 12, 24, 30, 50].map((d, i) => {
            const off = i === 0 || i === 8 || i === 1 || i === 7 ? 0 : i % 2 ? -10 : 10;
            return vertical ? `${x + off},${y + d}` : `${x + d},${y + off}`;
        });
        shape = `<polyline points="${zig.join(' ')}" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    } else {
        const plate = (d) => (vertical ? `<line x1="${x - 18}" y1="${y + d}" x2="${x + 18}" y2="${y + d}" stroke="${INK}" stroke-width="4"/>` : `<line x1="${x + d}" y1="${y - 18}" x2="${x + d}" y2="${y + 18}" stroke="${INK}" stroke-width="4"/>`);
        const lead = (d0, d1) => {
            const [x0, y0] = p(d0);
            const [x1, y1] = p(d1);
            return `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${INK}" stroke-width="3"/>`;
        };
        shape = lead(-50, -7) + lead(7, 50) + plate(-7) + plate(7);
    }
    const [lx, ly] = vertical ? [x + 26, y + 5] : [x, y - 26];
    const label = opts.label ? text(opts.label, lx, ly, { size: 16, weight: 600, anchor: vertical ? 'start' : 'middle', halo: true }) : '';
    return `<g data-part="${esc(id)}">${shape}${terminal(a, ax, ay)}${terminal(b, bx, by)}${label}</g>`;
}

export const resistor = (id, x, y, opts = {}) => twoTerminal('resistor', id, x, y, opts);
export const capacitor = (id, x, y, opts = {}) => twoTerminal('capacitor', id, x, y, opts);

// Three-position toggle with its common at the bottom. Throws left to right: Direct, Off, Reactive.
// mode null draws the lugs only; otherwise a lever (data-blade) joins the common to that throw.
export function toggle3(id, x, y, mode, opts = {}) {
    const throws = { DIRECT: [x - 60, y, 'Direct'], OFF: [x, y, 'Off'], REACTIVE: [x + 60, y, 'Reactive'] };
    const common = [x, y + 90];
    // opts.rest draws the Off point as a dashed hollow rest marker, not a lug: a real on-off-on switch has no lug there.
    // It keeps its terminal tag so the verifier can still check the lever.
    const lug = ([m, [tx, ty, label]]) => {
        if (opts.rest && m === 'OFF') return `<circle data-terminal="${id}.${m}" cx="${tx}" cy="${ty}" r="9" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="4 3"/>${text('Rest position,', tx, ty - 74, { size: 16, weight: 600, fill: '#4a5560', halo: true })}${text('no lug', tx, ty - 54, { size: 16, weight: 600, fill: '#4a5560', halo: true })}`;
        return `${terminal(`${id}.${m}`, tx, ty)}${text(label, tx, ty - 20, { size: 16, weight: 600, halo: true })}`;
    };
    const lugs = Object.entries(throws).map(lug).join('');
    const blade = mode ? `<line data-blade="1" x1="${common[0]}" y1="${common[1]}" x2="${throws[mode][0]}" y2="${throws[mode][1]}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>` : '';
    return `<g data-switch="${esc(id)}">${blade}${lugs}${terminal(`${id}.C`, common[0], common[1])}${text('Common', common[0] + 16, common[1] + 6, { size: 16, weight: 600, anchor: 'start', halo: true })}</g>`;
}

// Colored boxed net name.
export function netLabel(net, x, y) {
    const color = NET_COLORS[net] ?? INK;
    const w = Math.max(56, net.length * 11 + 20);
    return `<g data-netlabel="${esc(net)}"><rect x="${x - w / 2}" y="${y - 16}" width="${w}" height="32" rx="6" fill="#ffffff" stroke="${color}" stroke-width="3"/>${text(net, x, y + 6, { size: 16, weight: 700, fill: color })}</g>`;
}
