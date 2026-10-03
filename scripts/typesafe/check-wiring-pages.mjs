#!/usr/bin/env node
// Check published guitar wiring pages against their engineering netlists with TypeSafe.
//
// Manual, local tool. Not part of `npm run build` or Netlify.
//
//   TYPESAFE_API_KEY=... node scripts/typesafe/check-wiring-pages.mjs
//   node scripts/typesafe/check-wiring-pages.mjs --from-cache   # rebuild the report without API calls
//
// Options:
//   --from-cache       Reuse cached answers instead of calling the API.
//   --cache <path>     Raw answer cache (default: node_modules/.cache/typesafe/check-wiring-pages.json).
//   --out <path>       Report path (default: docs/engineering/wiring-check-report.md).
//   --dry-run          Print the extracted claims and code flags; make no API calls.
//
// The netlist is the circuit source of truth (docs/engineering/wiring-diagrams.md). Code splits each
// page into claims and compares component values and net labels exactly. TypeSafe reads each claim
// against the netlist document and says whether the netlist supports it, contradicts it, or does
// not address it. The report proposes fixes only; it edits no page, diagram, or netlist.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonical, compareTables, controlPositionTable, findTable, markdownTables } from './wiring-tables.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const API_URL = 'https://api.typesafe.ai/v1/systemone';
const MODEL = 'jev-latest';
const PRICE_PER_MTOK_USD = 0.042; // jev-1.13 input price from https://docs.typesafe.ai/models (output tokens are free)
const QUESTIONS_PER_REQUEST = 40;

// Thresholds chosen from the observed spread of the 2026-10-01 runs; the report prints that spread.
const REVIEW_CONFIDENCE = 0.6; // A verdict below this goes to human review.

// Each published page, the engineering document that holds its netlist, and the tables to compare
// exactly. A table spec names the page table and the netlist table by a header pattern; `kind` is
// "states" (operating states, compared by selected pickups and modifiers) or "contacts" (switch
// contacts, compared by net labels).
const ROLE = { bridge: /bridge/i, middle: /middle/i, neck: /neck/i };
const SPLIT = { name: 'split', re: /partial|split/i, scope: 'part' };
const PAIRS = [
    {
        name: 'Relay Torch',
        page: { kind: 'mdx', file: 'content/relay/wiring/torch.mdx' },
        source: 'docs/engineering/relay-torch-reference.md',
        tables: [{ name: 'Operating states', kind: 'states', page: /Edge down/, source: /Edge down/, options: { pickups: { bridge: /VEH|bridge/i, middle: /Mean 90|middle/i, neck: /Alnico II|neck/i }, mods: [{ name: 'edge', re: /\bEdge\b/, scope: 'cell' }] } }],
    },
    {
        name: 'Relay Arc',
        page: { kind: 'mdx', file: 'content/relay/wiring/arc.mdx' },
        source: 'docs/engineering/relay-arc-reference.md',
        tables: [
            { name: 'Operating states', kind: 'states', page: /Arc Mode down/, source: /Arc Mode down/, options: { pickups: { bridge: /Liverpool/, middle: /Dream/, neck: /Vintage/ }, mods: [SPLIT, { name: '680pF', re: /680/, scope: 'part' }] } },
            { name: 'Super-switch contacts', kind: 'contacts', page: /Position 1/, source: /Throw 1/ },
            { name: 'Push-pull contacts', kind: 'contacts', page: /Down throw/, source: /Down throw/ },
        ],
    },
    {
        name: 'STR26001',
        page: { kind: 'instrument', file: 'lib/instruments/wiring-reference.ts', serial: 'STR26001' },
        source: 'docs/engineering/strat-cunife/STR26001-wiring-reference.md',
        tables: [
            { name: 'Operating states', kind: 'states', page: 'positions', source: /Series mode/, options: { pickups: ROLE, mods: [{ name: 'series', re: /series|—/, scope: 'cell' }] } },
            { name: 'Five-way contacts', kind: 'contacts', page: 'contacts', source: /Pole\/common \| P1/ },
        ],
    },
    {
        name: 'STR26002',
        page: { kind: 'instrument', file: 'lib/instruments/wiring-reference.ts', serial: 'STR26002' },
        source: 'docs/engineering/strat-cunife/STR26002-wiring.md',
        tables: [
            { name: 'Operating states', kind: 'states', page: 'positions', source: /Neck-add on/, options: { pickups: ROLE } },
            { name: 'Five-way contacts', kind: 'contacts', page: 'contacts', source: /Pickup pole common/, options: { transposeColumn: 1 } },
        ],
    },
    {
        name: 'Relay Lipstick',
        page: { kind: 'mdx', file: 'content/relay/wiring/lipstick.mdx' },
        source: 'docs/engineering/relay-lipstick-reference.md',
        tables: [{ name: 'Operating states', kind: 'states', page: /Lipstick off/, source: /Lipstick off/, options: { pickups: { bridge: /bridge/i, middle: /lipstick/i, neck: /neck/i }, mods: [SPLIT] } }],
    },
    {
        name: 'Relay Velvet',
        page: { kind: 'mdx', file: 'content/relay/wiring/velvet.mdx' },
        source: 'docs/engineering/relay-velvet-reference.md',
        tables: [{ name: 'Operating states', kind: 'states', page: /Five-way blade/, source: /Selected pickups/, options: { pickups: { bridge: /bridge/i, middle: /Nashville|middle/i, neck: /neck/i } } }],
    },
    {
        name: 'Relay Reef',
        page: { kind: 'mdx', file: 'content/relay/wiring/reef.mdx' },
        source: 'docs/engineering/relay-reef-reference.md',
        tables: [
            { name: 'Operating states', kind: 'states', page: /Lipstick branch/, source: /Lipstick branch/, options: { pickups: { bridge: /humbucker/i, middle: /middle/i, neck: /neck/i } } },
            { name: 'Blade contacts', kind: 'contacts', page: /Throw 1/, source: /Throw 1/ },
        ],
    },
    {
        name: 'Relay Reef Plus',
        page: { kind: 'mdx', file: 'content/relay/wiring/reef-plus.mdx' },
        source: 'docs/engineering/relay-reef-plus-reference.md',
        tables: [
            { name: 'Operating states', kind: 'states', page: /Lipstick branch/, source: /Lipstick branch/, options: { pickups: { bridge: /humbucker/i, middle: /middle/i, neck: /neck/i } } },
            { name: 'Blade contacts', kind: 'contacts', page: /Throw 1/, source: /Throw 1/ },
        ],
    },
];

const RELATION = {
    supports: 'The netlist document states the claim or directly implies that it is true.',
    contradicts: 'The netlist document states something incompatible with the claim, such as a different value, connection, contact, operating state, or part.',
    says_nothing: 'The netlist document does not address what the claim asserts, either way. Assembly advice, test steps, and descriptions of sound that the document does not cover belong here.',
};

function parseArgs(argv) {
    const args = { dryRun: false, fromCache: false, cache: path.join(ROOT, 'node_modules/.cache/typesafe/check-wiring-pages.json'), out: path.join(ROOT, 'docs/engineering/wiring-check-report.md') };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--from-cache') args.fromCache = true;
        else if (a === '--dry-run') args.dryRun = true;
        else if (a === '--cache') args.cache = path.resolve(argv[++i]);
        else if (a === '--out') args.out = path.resolve(argv[++i]);
        else throw new Error(`Unknown option: ${a}`);
    }
    return args;
}

// ---------- claim extraction ----------

const clean = (s) =>
    s
        .replace(/\*\*/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();

function sentences(text) {
    return clean(text)
        .split(/(?<=[.!?])\s+(?=[A-Z`(])/)
        .map((s) => s.trim())
        .filter((s) => s.length > 3);
}

const cells = (line) =>
    line
        .trim()
        .replace(/^\||\|$/g, '')
        .split('|')
        .map((c) => clean(c));

// Turn the documentation components that carry circuit facts into plain list items.
function jsxToText(text) {
    const attr = (tag, name) => (tag.match(new RegExp(`${name}="([^"]*)"`)) || [])[1] || '';
    return text
        .replace(/<ControlPosition label="([^"]+)" name="([^"]+)">\s*([\s\S]*?)\s*<\/ControlPosition>/g, (m, l, n, body) => `- Position ${l} (${n}): ${body.replace(/\s+/g, ' ')}`)
        .replace(/<ComponentLabel [^>]*\/>/g, (t) => `- \`${attr(t, 'id')}\`: ${attr(t, 'component')}${attr(t, 'wire') ? ` (${attr(t, 'wire')} wire)` : ''}, ${attr(t, 'description')}.`)
        .replace(/<WireConnection [^>]*\/>/g, (t) => `- \`${attr(t, 'from')}\` to \`${attr(t, 'to')}\`: ${attr(t, 'notes')}.`)
        .replace(/<ProcStep text="([^"]*)">\s*([\s\S]*?)\s*<\/ProcStep>/g, (m, title, body) => `- ${title}: ${body.replace(/\s+/g, ' ')}`);
}

function mdxClaims(text) {
    const body = jsxToText(text)
        .replace(/^---\n[\s\S]*?\n---\n/, '')
        .replace(/<figure[\s\S]*?<\/figure>/g, '')
        .split('\n')
        .filter((l) => !l.trim().startsWith('<'));
    const claims = [];
    let section = '(introduction)';
    // A multi-sentence paragraph or list item becomes one claim per sentence; each keeps the whole
    // unit as context so pronouns such as "its" still resolve.
    const addUnit = (unit) => {
        const all = sentences(unit);
        for (const s of all) claims.push({ section, text: s, context: all.length > 1 ? clean(unit) : '' });
    };
    let para = [];
    let table = null;
    const flushPara = () => {
        if (para.length) addUnit(para.join(' '));
        para = [];
    };
    for (const line of body) {
        const t = line.trim();
        if (t.startsWith('|')) {
            flushPara();
            const row = cells(t);
            if (!table) table = { header: row };
            else if (!row.every((c) => /^:?-+:?$/.test(c))) claims.push({ section, text: row.map((c, i) => `${table.header[i]}: ${c}`).join('; '), context: '' });
            continue;
        }
        table = null;
        const h = t.match(/^#{2,4} (.+)/);
        if (h) {
            flushPara();
            section = clean(h[1]);
        } else if (/^([-*]|\d+\.) /.test(t)) {
            flushPara();
            addUnit(t.replace(/^([-*]|\d+\.) /, ''));
        } else if (!t) flushPara();
        else para.push(t);
    }
    flushPara();
    return claims;
}

async function instrumentData(file, serial) {
    const { instrumentWiringReferences } = await import(path.join(ROOT, file));
    const r = instrumentWiringReferences[serial];
    if (!r) throw new Error(`No wiring reference for ${serial} in ${file}`);
    return r;
}

async function instrumentClaims(file, serial) {
    const r = await instrumentData(file, serial);
    const claims = [];
    const add = (section, text, context = '') => claims.push({ section, text: clean(text), context });
    const addUnit = (section, unit) => {
        const all = sentences(unit);
        for (const s of all) add(section, s, all.length > 1 ? clean(unit) : '');
    };
    add('Title', `${r.title}.`);
    addUnit('Summary', r.summary);
    for (const [n, a, b] of r.positions) add('Operating states', `Position ${n}: ${r.modeLabels[0]}: ${a}; ${r.modeLabels[1]}: ${b}`);
    addUnit('Selector contacts', r.switchIntro);
    for (const [pole, ...throws] of r.contacts) add('Selector contacts', `Pole/common ${pole}: ${throws.map((t, i) => `P${i + 1} ${t}`).join(', ')}`);
    addUnit('Mode switch', r.modeSwitch);
    for (const p of r.parts) addUnit('Parts', p);
    for (const [net, text] of r.nets) add('Connection map', `${net}: ${text}`);
    return claims;
}

// ---------- deterministic checks ----------

const UNIT = { p: 1e-12, n: 1e-9, u: 1e-6, µ: 1e-6, k: 1e3, K: 1e3, M: 1e6, '': 1 };

// Component values as canonical strings, e.g. "2.2e-9 F", "150000 Ω", "A500000 pot".
function values(text) {
    const out = new Set();
    for (const m of text.matchAll(/(\d[\d,]*(?:\.\d+)?)\s?(p|n|u|µ)F\b/g)) out.add(`${+(parseFloat(m[1].replace(/,/g, '')) * UNIT[m[2]]).toPrecision(3)} F`);
    for (const m of text.matchAll(/(\d[\d,]*(?:\.\d+)?)\s?(k|M)?Ω/g)) out.add(`${+(parseFloat(m[1].replace(/,/g, '')) * UNIT[m[2] || '']).toPrecision(3)} Ω`);
    for (const m of text.matchAll(/\b([AB])(\d+)\s?(k|K|M)\b/g)) {
        out.add(`${m[1]}${+m[2] * UNIT[m[3]]} pot`);
        out.add(`${+(+m[2] * UNIT[m[3]]).toPrecision(3)} Ω`); // a pot's track resistance
    }
    return out;
}

const NET_RE = /`([A-Z][A-Z0-9]*(?:[-_][A-Z0-9]+)*)`/g;
function netLabels(text) {
    return new Set([...text.matchAll(NET_RE)].map((m) => m[1]));
}

// Net labels in instrument data appear bare, not in backticks.
function bareNetLabels(text, known) {
    return new Set([...text.matchAll(/\b([A-Z][A-Z0-9]*(?:[-_][A-Z0-9]+)+|[A-Z]{2,})\b/g)].map((m) => m[1]).filter((t) => known.has(t) || /[-_]/.test(t)));
}

// ---------- TypeSafe ----------

async function callTypeSafe(body, attempt = 0) {
    const started = performance.now();
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.TYPESAFE_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const ms = performance.now() - started;
    if ((res.status === 429 || res.status === 529 || res.status >= 500) && attempt < 5) {
        const retryAfter = Number(res.headers.get('retry-after')) || 0;
        await new Promise((r) => setTimeout(r, Math.max(retryAfter * 1000, 1000 * 2 ** attempt)));
        return callTypeSafe(body, attempt + 1);
    }
    if (!res.ok) throw new Error(`TypeSafe HTTP ${res.status}: ${(await res.text()).slice(0, 500)}`);
    return { response: await res.json(), ms };
}

// One request per batch of claims: the netlist document is the state, and each claim is its own Choice.
function buildRequest(pair, sourceText, batch) {
    const questions = {};
    for (const c of batch) {
        questions[c.id] = {
            type: 'choice',
            instructions: {
                claim: c.text,
                ...(c.context ? { claim_context: c.context } : {}),
                claim_section: c.section,
                question: `How does the netlist document in the state relate to \`claim\`, which appears on the published ${pair.name} wiring page?${c.context ? ' Use `claim_context` only to resolve what `claim` refers to.' : ''}`,
            },
            criteria: RELATION,
        };
    }
    return { state: { netlist_document: sourceText }, model: MODEL, questions };
}

// ---------- report ----------

const esc = (s) => String(s).replace(/\|/g, '\\|');
function quantiles(values) {
    const s = [...values].sort((x, y) => x - y);
    const q = (p) => s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))];
    return ['min', 'p10', 'p25', 'median', 'p75', 'max'].map((k, i) => q([0, 0.1, 0.25, 0.5, 0.75, 1][i]).toFixed(2)).join(' | ');
}

function classify(claim) {
    const a = claim.answer;
    const flags = [...claim.codeFlags.map((f) => ({ priority: 1, text: f }))];
    if (a.choice === 'contradicts' && a.confidence >= REVIEW_CONFIDENCE) flags.push({ priority: 1, text: `netlist contradicts (conf. ${a.confidence.toFixed(2)})` });
    else if (a.confidence < REVIEW_CONFIDENCE) flags.push({ priority: 2, text: `uncertain: ${a.choice.replace('_', ' ')} (conf. ${a.confidence.toFixed(2)})` });
    else if (a.choice === 'says_nothing') flags.push({ priority: 3, text: 'not in the netlist document' });
    flags.sort((x, y) => x.priority - y.priority);
    return { ...claim, flags, priority: flags.length ? flags[0].priority : 4 };
}

function renderReport(results, meta) {
    const all = results.flatMap((r) => r.claims);
    const conf = all.map((c) => c.answer.confidence);
    const count = (p) => all.filter((c) => c.priority === p).length;
    const lines = [];
    lines.push('# Wiring page check (TypeSafe pilot)');
    lines.push('');
    lines.push(`Generated ${meta.date} by \`scripts/typesafe/check-wiring-pages.mjs\` with model \`${meta.model}\`.`);
    lines.push('');
    lines.push('Each published wiring page is checked against the engineering document that holds its netlist, which [the wiring-diagram workflow](wiring-diagrams.md) makes the circuit source of truth. This report only proposes fixes; it edits no page, diagram, or netlist. A "supports" verdict is not a bench test, and it does not check the diagram image.');
    lines.push('');
    lines.push('## Method');
    lines.push('');
    lines.push('- Code splits each page into claims: one per sentence or table row. A sentence from a longer paragraph or list item carries that unit as context, so pronouns still resolve. For STR26001 and STR26002 the claims come from the data in `lib/instruments/wiring-reference.ts` that the `/sn/<serial>/wiring` pages render.');
    lines.push('- Code compares every component value (capacitors, resistors, pot values and tapers) and every net label on the page with the netlist document. A value or label that the document lacks is a priority-1 flag. No model is involved.');
    lines.push('- Code also compares the operating-state and switch-contact tables cell by cell with the matching netlist tables. A state cell is reduced to the pickups it selects and their modifiers (split, series, contour); a contact cell is reduced to its net labels. No model is involved.');
    lines.push('- TypeSafe reads each claim against the full netlist document and answers one Choice: supports, contradicts, or says nothing. Claims are sent as parallel questions over one shared state, up to ' + QUESTIONS_PER_REQUEST + ' per request.');
    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push(`- Pages checked: ${results.length}. Claims: ${all.length}. Priority 1: ${count(1)}. Priority 2: ${count(2)}. Priority 3: ${count(3)}. Supported: ${count(4)}.`);
    lines.push(`- Requests: ${meta.requests}. Input tokens: ${meta.inputTokens.toLocaleString('en-US')} (about $${((meta.inputTokens / 1e6) * PRICE_PER_MTOK_USD).toFixed(4)} at $${PRICE_PER_MTOK_USD}/Mtok). Latency per request: median ${meta.latency.median} ms, max ${meta.latency.max} ms.`);
    const tables = results.flatMap((r) => r.tables.map((t) => ({ ...t, page: r.pair.name })));
    const tableIssues = tables.flatMap((t) => t.issues.map((i) => `${t.page} — ${i}`));
    lines.push(`- Tables compared in code: ${tables.length}, covering ${tables.reduce((n, t) => n + t.compared, 0)} cells. Mismatches: ${tableIssues.length}.`);
    lines.push('');
    lines.push('| Page | Claims | Supports | Contradicts | Says nothing | Code flags |');
    lines.push('|---|---|---|---|---|---|');
    for (const r of results) {
        const n = (v) => r.claims.filter((c) => c.answer.choice === v).length;
        lines.push(`| [${r.pair.name}](${path.relative(path.dirname(meta.out), path.join(ROOT, r.pair.page.file))}) | ${r.claims.length} | ${n('supports')} | ${n('contradicts')} | ${n('says_nothing')} | ${r.claims.filter((c) => c.codeFlags.length).length} |`);
    }
    lines.push('');
    lines.push('## Thresholds');
    lines.push('');
    lines.push('| Measure | min | p10 | p25 | median | p75 | max |');
    lines.push('|---|---|---|---|---|---|---|');
    lines.push(`| Verdict confidence | ${quantiles(conf)} |`);
    lines.push('');
    lines.push(meta.thresholdNote);
    lines.push('');
    lines.push('## Table comparison (code)');
    lines.push('');
    lines.push('| Page | Table | Cells compared | Result |');
    lines.push('|---|---|---|---|');
    for (const t of tables) lines.push(`| ${t.page} | ${t.name} | ${t.compared} | ${t.issues.length ? `${t.issues.length} mismatch${t.issues.length > 1 ? 'es' : ''}` : 'All match'} |`);
    lines.push('');
    if (tableIssues.length) {
        lines.push('Mismatches:');
        lines.push('');
        for (const i of tableIssues) lines.push(`- ${i}`);
        lines.push('');
    }
    const tiers = [
        [1, 'Priority 1: value or label mismatches and confident contradictions', `A component value or net label on the page is missing from the netlist document, or TypeSafe reads the document as contradicting the claim at confidence ${REVIEW_CONFIDENCE} or above.`],
        [2, 'Priority 2: uncertain verdicts', `TypeSafe's confidence is below ${REVIEW_CONFIDENCE}. A person should read the claim against the netlist.`],
        [3, 'Priority 3: not covered by the netlist document', 'Confident "says nothing" verdicts. Most are assembly or test advice the netlist does not need to cover; any that state a circuit fact are gaps in the netlist document.'],
    ];
    for (const [p, title, desc] of tiers) {
        lines.push(`## ${title}`);
        lines.push('');
        lines.push(desc);
        lines.push('');
        const rows = all.filter((c) => c.priority === p).sort((x, y) => x.answer.confidence - y.answer.confidence);
        if (!rows.length) {
            lines.push('None.');
            lines.push('');
            continue;
        }
        lines.push('| Page | Section | Claim | Verdict (p, conf.) | Flags |');
        lines.push('|---|---|---|---|---|');
        for (const c of rows) lines.push(`| ${c.page} | ${esc(c.section)} | ${esc(c.text)} | ${c.answer.choice.replace('_', ' ')} (${Math.round(c.answer.probabilities[c.answer.choice] * 100)}%, ${c.answer.confidence.toFixed(2)}) | ${esc(c.flags.map((f) => f.text).join('; '))} |`);
        lines.push('');
    }
    lines.push('## Limits');
    lines.push('');
    lines.push('- The diagram images are not checked. TypeSafe reads text only, and the Torch and Arc diagrams have no text source in the repository.');
    lines.push('- TypeSafe judges claims one at a time and the table comparison checks one table at a time. Neither traces a full circuit path, so a page can be wrong in a way that no single claim or cell reveals.');
    lines.push('- The Relay Lipstick netlist is a text form of its approved diagram. The Relay Velvet netlist came from its earlier page plus owner decisions, and its diagram is generated from the netlist.');
    lines.push('- "Supports" means the netlist document agrees with the page text. It is not evidence that a physical harness was built or measured.');
    lines.push('');
    return lines.join('\n');
}

// ---------- main ----------

async function main() {
    const args = parseArgs(process.argv.slice(2));
    let cache = {};
    if (fs.existsSync(args.cache)) cache = JSON.parse(fs.readFileSync(args.cache, 'utf8'));
    if (!args.dryRun && !args.fromCache && !process.env.TYPESAFE_API_KEY) throw new Error('TYPESAFE_API_KEY is not set.');

    const results = [];
    const calls = [];
    for (const pair of PAIRS) {
        const sourceText = fs.readFileSync(path.join(ROOT, pair.source), 'utf8');
        const pageText = pair.page.kind === 'mdx' ? fs.readFileSync(path.join(ROOT, pair.page.file), 'utf8') : null;
        const claims = (pair.page.kind === 'mdx' ? mdxClaims(pageText) : await instrumentClaims(pair.page.file, pair.page.serial)).map((c, i) => ({ ...c, id: `c${String(i + 1).padStart(3, '0')}`, page: pair.name }));

        const sourceValues = values(sourceText);
        const sourceNets = netLabels(sourceText);
        for (const c of claims) {
            c.codeFlags = [];
            for (const v of values(c.text)) if (!sourceValues.has(v)) c.codeFlags.push(`value ${v} not in netlist document`);
            const nets = pair.page.kind === 'mdx' ? netLabels(c.text) : bareNetLabels(c.text, sourceNets);
            for (const n of nets) if (!sourceNets.has(n) && !sourceText.includes(n)) c.codeFlags.push(`net label ${n} not in netlist document`);
        }

        const tableResults = [];
        for (const spec of pair.tables) {
            let pageTable;
            if (spec.page === 'positions' || spec.page === 'contacts') {
                const r = await instrumentData(pair.page.file, pair.page.serial);
                pageTable = spec.page === 'positions' ? { headers: ['Position', ...r.modeLabels], rows: r.positions.map(([n, a, b]) => [String(n), a, b]) } : { headers: ['Pole', 'P1', 'P2', 'P3', 'P4', 'P5'], rows: r.contacts };
            } else if (spec.page === 'controlPositions') pageTable = controlPositionTable(pageText);
            else pageTable = findTable(markdownTables(pageText), spec.page, pair.page.file);
            const sourceTable = findTable(markdownTables(sourceText), spec.source, pair.source);
            tableResults.push(compareTables(spec.name, canonical(pageTable, spec.kind, { ...spec.options, transposeColumn: undefined }), canonical(sourceTable, spec.kind, spec.options || {})));
        }

        if (args.dryRun) {
            for (const t of tableResults) console.log(`${pair.name} table ${t.name}: ${t.compared} cells compared; ${t.issues.length ? t.issues.join(' | ') : 'all match'}`);
            for (const c of claims) console.log(`${pair.name} ${c.id} [${c.section}] ${c.text}${c.codeFlags.length ? `  <<${c.codeFlags.join('; ')}>>` : ''}`);
            continue;
        }
        for (let i = 0; i < claims.length; i += QUESTIONS_PER_REQUEST) {
            const batch = claims.slice(i, i + QUESTIONS_PER_REQUEST);
            const key = `${pair.name}#${i / QUESTIONS_PER_REQUEST}`;
            let result;
            if (args.fromCache) {
                result = cache[key];
                if (!result) throw new Error(`No cached answer for ${key}`);
            } else {
                result = await callTypeSafe(buildRequest(pair, sourceText, batch));
                cache[key] = result;
                process.stderr.write(`${key}: ${batch.length} claims, ${Math.round(result.ms)} ms\n`);
            }
            calls.push(result);
            for (const c of batch) c.answer = result.response.answers[c.id];
        }
        results.push({ pair, claims: claims.map(classify), tables: tableResults });
    }
    if (args.dryRun) return;
    if (!args.fromCache) {
        fs.mkdirSync(path.dirname(args.cache), { recursive: true });
        fs.writeFileSync(args.cache, JSON.stringify(cache, null, 2));
    }

    const latencies = calls.map((c) => Math.round(c.ms)).sort((x, y) => x - y);
    const meta = {
        out: args.out,
        date: new Date().toISOString().slice(0, 10),
        model: calls[0]?.response.model || MODEL,
        requests: calls.length,
        inputTokens: calls.reduce((n, c) => n + (c.response.usage?.input_tokens || 0), 0),
        latency: { median: latencies[Math.floor((latencies.length - 1) / 2)], max: latencies[latencies.length - 1] },
        thresholdNote: `Confidence is bimodal: three quarters of verdicts are at 0.9 or above, and the rest trail down toward 0.05. A verdict below ${REVIEW_CONFIDENCE} goes to human review (priority 2), including a low-confidence "contradicts". A "contradicts" at ${REVIEW_CONFIDENCE} or above is priority 1. In the 2026-10-01 runs, no "contradicts" verdict that survived review was a real wiring error; the one that reached 0.83 came from ambiguous netlist wording, which was then clarified.`,
    };
    fs.writeFileSync(args.out, renderReport(results, meta));
    const all = results.flatMap((r) => r.claims);
    const mismatches = results.reduce((n, r) => n + r.tables.reduce((m, t) => m + t.issues.length, 0), 0);
    process.stderr.write(`Wrote ${path.relative(ROOT, args.out)}: ${all.length} claims, ${all.filter((c) => c.priority === 1).length} at priority 1, ${mismatches} table mismatches.\n`);
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
