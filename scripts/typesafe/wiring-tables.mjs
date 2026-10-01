// Exact, model-free comparison of wiring tables: operating states and switch contacts.
// Used by check-wiring-pages.mjs. Each table is reduced to canonical rows, then compared cell by cell.

const stripMd = (s) =>
    s
        .replace(/\*\*/g, '')
        .replace(/`/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();

// Every Markdown table in a document, with the heading it sits under.
export function markdownTables(text) {
    const tables = [];
    let section = '';
    let current = null;
    for (const line of text.split('\n')) {
        const t = line.trim();
        const h = t.match(/^#{1,4} (.+)/);
        if (h) section = stripMd(h[1]);
        if (!t.startsWith('|')) {
            current = null;
            continue;
        }
        const cells = t
            .replace(/^\||\|$/g, '')
            .split('|')
            .map((c) => c.trim());
        if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
        if (!current) {
            current = { section, headers: cells, rows: [] };
            tables.push(current);
        } else current.rows.push(cells);
    }
    return tables;
}

// The operating states written as <ControlPosition> components (Relay Velvet page).
export function controlPositionTable(text) {
    const rows = [...text.matchAll(/<ControlPosition label="([^"]+)" name="[^"]*">\s*([\s\S]*?)\s*<\/ControlPosition>/g)].map((m) => [m[1], m[2]]);
    return { section: 'Control Layout', headers: ['Position', 'Selected pickups'], rows };
}

export function findTable(tables, pattern, where) {
    const t = tables.find((x) => pattern.test(x.headers.join(' | ')));
    if (!t) throw new Error(`No table matching ${pattern} in ${where}`);
    return t;
}

// Net labels in a cell, plus "open" for an explicitly unconnected throw.
export function cellLabels(cell) {
    const s = stripMd(cell);
    const out = new Set([...s.matchAll(/\b[A-Z][A-Z0-9]*(?:[-_][A-Z0-9]+)*\b/g)].map((m) => m[0]));
    if (/\bopen\b|isolated|no new connection/i.test(s) && out.size === 0) out.add('open');
    return [...out].sort().join(' ');
}

// A row key: the pole letter ("A — audio", "A / BUS"), a position number, or the first word.
export function rowKey(cell) {
    const s = stripMd(cell);
    const letter = s.match(/^([A-Z])(?:\s|$|\s*[—/-])/);
    if (letter) return letter[1];
    const num = s.match(/^(\d+)/);
    if (num) return num[1];
    const labels = cellLabels(s);
    if (labels && labels !== 'open') return labels;
    return s.split(/\s/)[0].toLowerCase();
}

// Reduce an operating-state cell to the pickups it selects and their modifiers.
export function stateCell(cell, { pickups, mods = [] }) {
    const s = stripMd(cell);
    const cellMods = mods.filter((m) => m.scope === 'cell' && m.re.test(s)).map((m) => m.name);
    const parts = s.split(/\s*(?:\+|∥|—|, and |,| and )\s*/).filter(Boolean);
    const selected = [];
    for (const part of parts) {
        const pickup = Object.keys(pickups).find((p) => pickups[p].test(part));
        if (!pickup) continue;
        const partMods = mods.filter((m) => m.scope === 'part' && m.re.test(part)).map((m) => m.name);
        selected.push(partMods.length ? `${pickup}[${partMods.sort().join(',')}]` : pickup);
    }
    return [...new Set(selected)].sort().join(' + ') + (cellMods.length ? ` {${cellMods.sort().join(',')}}` : '');
}

// Canonical rows: key → array of canonical cells (columns after the key column).
export function canonical(table, kind, options = {}) {
    const rows = new Map();
    const norm = kind === 'states' ? (c) => stateCell(c, options) : cellLabels;
    if (options.transposeColumn != null) {
        // Rows are positions and one column holds a pole's contacts: rebuild that pole as one row.
        const col = options.transposeColumn;
        rows.set(
            rowKey(table.headers[col]),
            table.rows.map((r) => norm(r[col]))
        );
        return rows;
    }
    for (const r of table.rows) rows.set(rowKey(r[0]), r.slice(1).map(norm));
    return rows;
}

export function compareTables(name, pageRows, sourceRows) {
    const issues = [];
    for (const [key, cells] of sourceRows) {
        if (!pageRows.has(key)) issues.push(`${name}: row ${key} is in the netlist but not on the page`);
    }
    let compared = 0;
    for (const [key, cells] of pageRows) {
        const ref = sourceRows.get(key);
        if (!ref) {
            issues.push(`${name}: row ${key} is on the page but not in the netlist`);
            continue;
        }
        if (cells.length !== ref.length) issues.push(`${name}: row ${key} has ${cells.length} columns on the page and ${ref.length} in the netlist`);
        for (let i = 0; i < Math.min(cells.length, ref.length); i++) {
            compared++;
            if (cells[i] !== ref[i]) issues.push(`${name}: row ${key}, column ${i + 1}: page "${cells[i] || '(nothing recognized)'}" vs netlist "${ref[i] || '(nothing recognized)'}"`);
        }
    }
    return { name, compared, issues };
}
