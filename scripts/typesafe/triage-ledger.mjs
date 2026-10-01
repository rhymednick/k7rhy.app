#!/usr/bin/env node
// Triage the decision-extraction ledger with TypeSafe (System One / Jev).
//
// Manual, local tool. Not part of `npm run build` or Netlify.
//
//   TYPESAFE_API_KEY=... node scripts/typesafe/triage-ledger.mjs
//   node scripts/typesafe/triage-ledger.mjs --from-cache   # rebuild the report without API calls
//
// Options:
//   --from-cache         Reuse cached answers instead of calling the API.
//   --cache <path>       Raw answer cache (default: node_modules/.cache/typesafe/triage-ledger.json).
//   --out <path>         Report path (default: docs/engineering/extraction/triage-report.md).
//   --only <ID,...>      Evaluate only these candidate IDs (report still lists them alone).
//   --concurrency <n>    Parallel requests (default: 4).
//
// Parsing, comparison, and flagging are deterministic code. TypeSafe answers only the
// natural-language judgments. Its answers are proposals for the owner; they never approve,
// promote, or edit a ledger entry (see docs/engineering/extraction/README.md).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const EXTRACTION_DIR = path.join(ROOT, 'docs/engineering/extraction');
const LEDGER_PATH = path.join(EXTRACTION_DIR, 'decision-ledger.md');
const SOURCES_DIR = path.join(EXTRACTION_DIR, 'sources');

const API_URL = 'https://api.typesafe.ai/v1/systemone';
const MODEL = 'jev-latest';
const PRICE_PER_MTOK_USD = 0.042; // jev-1.13 input price from https://docs.typesafe.ai/models (output tokens are free)

// Thresholds chosen from the observed spread of the 2026-10-01 run (jev-1.13.0, 220 candidates);
// the report's "Thresholds" section prints the spread they were read from.
const HIGH_CONFIDENCE = 0.8; // A disagreement at or above this is a priority-1 flag (about the p75 of label confidence)
const LOW_CONFIDENCE = 0.4; // Choice confidence below this is flagged as uncertain (about the p25 of label confidence)
const NOUL_YES = 0.5; // Noul value at or above this reads as "yes"

const EVIDENCE_LABELS = {
    Confirmed: 'Explicitly accepted by the owner.',
    Corrected: 'An earlier proposal was superseded later in the source.',
    Proposed: 'Suggested but not explicitly accepted.',
    Observed: 'Factual or contextual material that is not itself a decision.',
    Unresolved: 'Requires owner review or supporting evidence.',
};

const CLASSIFICATIONS = ['Project or governance principle', 'Engineering standard', 'Reference design', 'Design decision', 'Platform, model, or voicing documentation', 'Serialized-instrument documentation', 'Listening note', 'Unresolved question', 'Discussion only'];

// ---------- argument parsing ----------

function parseArgs(argv) {
    const args = { fromCache: false, cache: path.join(ROOT, 'node_modules/.cache/typesafe/triage-ledger.json'), out: path.join(EXTRACTION_DIR, 'triage-report.md'), only: null, concurrency: 4 };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--from-cache') args.fromCache = true;
        else if (a === '--cache') args.cache = path.resolve(argv[++i]);
        else if (a === '--out') args.out = path.resolve(argv[++i]);
        else if (a === '--only') args.only = new Set(argv[++i].split(','));
        else if (a === '--concurrency') args.concurrency = Number(argv[++i]);
        else throw new Error(`Unknown option: ${a}`);
    }
    return args;
}

// ---------- ledger parsing ----------

function splitRow(line) {
    return line
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((c) => c.trim());
}

function parseLedger(text) {
    const rows = [];
    const tableBreaks = [];
    let previous = '';
    for (const line of text.split('\n')) {
        const m = line.match(/^\|\s*\[([A-Z]+-\d+)\]\(([^)]+)\)/);
        if (m && rows.length && !previous.startsWith('|')) tableBreaks.push(m[1]);
        previous = line;
        if (!m) continue;
        const cells = splitRow(line);
        if (cells.length !== 6) throw new Error(`Unexpected ledger row shape for ${m[1]}: ${cells.length} cells`);
        rows.push({ id: m[1], link: m[2], summary: cells[1], evidence: cells[2], classification: cells[3], status: cells[4], destination: cells[5] });
    }
    return { rows, tableBreaks };
}

// ---------- source inventory parsing ----------

function field(block, name) {
    const re = new RegExp(`\\*\\*${name}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*[A-Za-z ,/]+:\\*\\*|$)`);
    const m = block.match(re);
    return m ? m[1].trim() : '';
}

function parseSource(file) {
    const text = fs.readFileSync(file, 'utf8');
    const title = (text.match(/^# (.+)$/m) || [])[1] || path.basename(file);
    const notesMatch = text.match(/## Extraction notes\n([\s\S]*?)(?=\n## )/);
    const extractionNotes = notesMatch
        ? notesMatch[1]
              .split('\n')
              .filter((l) => l.startsWith('- '))
              .map((l) => l.slice(2).trim())
        : [];
    const candidates = [];
    let section = '';
    for (const chunk of text.split(/\n(?=#{2,3} )/)) {
        const h2 = chunk.match(/^## (.+)/);
        if (h2) {
            section = h2[1].trim();
            continue;
        }
        const h3 = chunk.match(/^### ([A-Z]+-\d+) — (.+)/);
        if (!h3) continue;
        candidates.push({
            id: h3[1],
            title: h3[2].trim(),
            section,
            statement: field(chunk, 'Statement'),
            evidence: field(chunk, 'Evidence'),
            classification: field(chunk, 'Proposed classification'),
            notes: field(chunk, 'Notes'),
        });
    }
    return { file: path.basename(file), title, extractionNotes, candidates };
}

// ---------- request construction ----------

function buildRequest(candidate, source) {
    // The ledger's and inventory's current labels are deliberately left out of state so the
    // answers are independent judgments, not echoes of the existing labels.
    const others = source.candidates.filter((c) => c.id !== candidate.id).map((c) => ({ id: c.id, statement: c.statement }));
    const state = {
        source_title: source.title,
        source_extraction_notes: source.extractionNotes,
        candidate: {
            id: candidate.id,
            title: candidate.title,
            section: candidate.section,
            statement: candidate.statement,
            evidence_notes: candidate.notes || '(none recorded)',
        },
        other_candidates_from_same_source: others,
    };
    const questions = {
        evidence_label: {
            type: 'choice',
            instructions: 'Which evidence label best fits `candidate`, judged only from `candidate.evidence_notes`, `candidate.statement`, and `source_extraction_notes`?',
            criteria: EVIDENCE_LABELS,
        },
        classification: {
            type: 'choice',
            instructions: 'Which knowledge class best describes `candidate.statement`?',
            criteria: Object.fromEntries(CLASSIFICATIONS.map((c) => [c, null])),
        },
        owner_acceptance: {
            type: 'noul',
            instructions: 'Do `candidate.evidence_notes` or `source_extraction_notes` show that the owner explicitly accepted `candidate.statement`?',
            criteria: {
                true: 'The notes report an explicit owner acceptance, such as the owner agreeing, approving, choosing, confirming, or adopting it.',
                false: 'The notes show only a suggestion, a prediction, an observation, an open question, or acceptance implied by continuing the work.',
            },
        },
        conflict_or_superseded: {
            type: 'noul',
            instructions: 'Does `candidate.statement` conflict with, or is it superseded by, any statement in `other_candidates_from_same_source`?',
            criteria: {
                true: 'Another candidate from the same source contradicts it, corrects it, or replaces it.',
                false: 'No other candidate from the same source contradicts, corrects, or replaces it.',
            },
        },
    };
    return { state, model: MODEL, questions };
}

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

async function mapLimit(items, limit, fn) {
    const results = new Array(items.length);
    let next = 0;
    async function worker() {
        while (next < items.length) {
            const i = next++;
            results[i] = await fn(items[i], i);
        }
    }
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
    return results;
}

// ---------- flagging ----------

const SUPERSESSION_RE = /supersed|rejected|replaced/i;

// Priority 1: deterministic data issues, confident disagreements, and unrecorded conflicts.
// Priority 2: other disagreements with the ledger.
// Priority 3: a Confirmed label whose notes do not cite acceptance, or an uncertain answer.
function assess(row, inv, answer) {
    const a = answer.response.answers;
    const flags = [];
    const add = (priority, text) => flags.push({ priority, text });
    const ev = a.evidence_label;
    const cl = a.classification;
    const accept = a.owner_acceptance.noul;
    const conflict = a.conflict_or_superseded.noul;

    // Model-free checks: the ledger should use the README vocabulary and agree with its inventory.
    if (inv.evidence !== row.evidence) add(1, `inventory says ${inv.evidence}, ledger says ${row.evidence}`);
    if (inv.classification !== row.classification) add(1, `inventory class "${inv.classification}" differs from ledger`);
    if (!CLASSIFICATIONS.includes(row.classification)) add(1, `ledger class "${row.classification}" is not in the README vocabulary`);

    if (ev.choice !== row.evidence) add(ev.confidence >= HIGH_CONFIDENCE ? 1 : 2, `label: TypeSafe ${ev.choice} (conf. ${ev.confidence.toFixed(2)})`);
    if (CLASSIFICATIONS.includes(row.classification) && cl.choice !== row.classification) add(cl.confidence >= HIGH_CONFIDENCE ? 1 : 2, `class: TypeSafe ${cl.choice} (conf. ${cl.confidence.toFixed(2)})`);
    const recordedSupersession = row.evidence === 'Corrected' || SUPERSESSION_RE.test(row.destination) || SUPERSESSION_RE.test(inv.notes);
    if (conflict >= NOUL_YES && !recordedSupersession) add(1, `possible same-source conflict not recorded (${conflict.toFixed(2)})`);
    if (row.evidence === 'Proposed' && accept >= NOUL_YES) add(2, `Proposed, but notes read as explicit acceptance (${accept.toFixed(2)})`);
    if (row.evidence === 'Confirmed' && accept < NOUL_YES) add(3, `Confirmed, but notes do not cite explicit acceptance (${accept.toFixed(2)})`);
    if (ev.confidence < LOW_CONFIDENCE) add(3, `uncertain label (conf. ${ev.confidence.toFixed(2)})`);
    if (cl.confidence < LOW_CONFIDENCE) add(3, `uncertain class (conf. ${cl.confidence.toFixed(2)})`);

    flags.sort((x, y) => x.priority - y.priority);
    return { flags, priority: flags.length ? flags[0].priority : 4, minConfidence: Math.min(ev.confidence, cl.confidence) };
}

// ---------- report ----------

const pct = (x) => `${Math.round(x * 100)}%`;
function quantiles(values) {
    const s = [...values].sort((x, y) => x - y);
    const q = (p) => s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))];
    return { min: s[0], p10: q(0.1), p25: q(0.25), median: q(0.5), p75: q(0.75), max: s[s.length - 1] };
}
const fmtQ = (q) => ['min', 'p10', 'p25', 'median', 'p75', 'max'].map((k) => q[k].toFixed(2)).join(' | ');
const esc = (s) => String(s).replace(/\|/g, '\\|');

function renderReport({ items, meta }) {
    const topFlags = (i) => i.flags.filter((f) => f.priority === i.priority).length;
    const order = (x, y) => topFlags(y) - topFlags(x) || y.flags.length - x.flags.length || x.minConfidence - y.minConfidence;
    const tier = (p) => items.filter((i) => i.priority === p).sort(order);
    const evConf = quantiles(items.map((i) => i.answer.evidence_label.confidence));
    const clConf = quantiles(items.map((i) => i.answer.classification.confidence));
    const acc = quantiles(items.map((i) => i.answer.owner_acceptance.noul));
    const con = quantiles(items.map((i) => i.answer.conflict_or_superseded.noul));
    const agreeEv = items.filter((i) => i.answer.evidence_label.choice === i.row.evidence).length;
    const agreeCl = items.filter((i) => i.answer.classification.choice === i.row.classification).length;

    const lines = [];
    lines.push('# Decision ledger triage report (TypeSafe pilot)');
    lines.push('');
    lines.push(`Generated ${meta.date} by \`scripts/typesafe/triage-ledger.mjs\` with model \`${meta.model}\`.`);
    lines.push('');
    lines.push('This report only proposes changes. It does not edit the ledger, the source inventories, or any canonical document. Model probability and confidence are not owner approval: under the [README editing rules](README.md#editing-rules), only the owner confirms, corrects, or promotes a candidate.');
    lines.push('');
    lines.push('## Method');
    lines.push('');
    lines.push('- Code parses every candidate row in [decision-ledger.md](decision-ledger.md) and its entry in [sources/](sources/).');
    lines.push("- One TypeSafe request per candidate. State: the source title and extraction notes, the candidate's statement, section, and inventory notes, and the IDs and statements of the other candidates from the same source. The ledger's and inventory's current labels are left out of state, so the answers are independent.");
    lines.push('- Questions: evidence label (Choice over the README labels and definitions), classification (Choice over the README vocabulary), explicit owner acceptance (Noul), and same-source conflict or supersession (Noul).');
    lines.push('- Code compares the answers with the ledger and raises flags. It also flags, without the model, ledger classes outside the README vocabulary and disagreements between the ledger and its source inventory.');
    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push(`- Candidates evaluated: ${items.length}. Priority 1: ${tier(1).length}. Priority 2: ${tier(2).length}. Priority 3: ${tier(3).length}. Unflagged: ${tier(4).length}.`);
    lines.push(`- Evidence label agrees with the ledger: ${agreeEv}/${items.length}. Classification agrees: ${agreeCl}/${items.length}.`);
    lines.push(`- Requests: ${meta.requests}. Input tokens: ${meta.inputTokens.toLocaleString('en-US')} (about $${((meta.inputTokens / 1e6) * PRICE_PER_MTOK_USD).toFixed(4)} at $${PRICE_PER_MTOK_USD}/Mtok). Latency per request: median ${meta.latency.median} ms, p90 ${meta.latency.p90} ms, max ${meta.latency.max} ms.`);
    lines.push('');
    lines.push('## Thresholds');
    lines.push('');
    lines.push('Observed spread across all candidates:');
    lines.push('');
    lines.push('| Measure | min | p10 | p25 | median | p75 | max |');
    lines.push('|---|---|---|---|---|---|---|');
    lines.push(`| Evidence-label confidence | ${fmtQ(evConf)} |`);
    lines.push(`| Classification confidence | ${fmtQ(clConf)} |`);
    lines.push(`| Owner-acceptance Noul | ${fmtQ(acc)} |`);
    lines.push(`| Conflict Noul | ${fmtQ(con)} |`);
    lines.push('');
    lines.push(meta.thresholdNote);
    lines.push('');
    const header = ['| Candidate | Ledger label | TypeSafe label (p, conf.) | Ledger class | TypeSafe class (p, conf.) | Accept | Conflict | Flags |', '|---|---|---|---|---|---|---|---|'];
    const row = (i) => {
        const ev = i.answer.evidence_label;
        const cl = i.answer.classification;
        return `| [${i.row.id}](${i.row.link}) | ${i.row.evidence} | ${ev.choice} (${pct(ev.probabilities[ev.choice])}, ${ev.confidence.toFixed(2)}) | ${esc(i.row.classification)} | ${esc(cl.choice)} (${pct(cl.probabilities[cl.choice])}, ${cl.confidence.toFixed(2)}) | ${i.answer.owner_acceptance.noul.toFixed(2)} | ${i.answer.conflict_or_superseded.noul.toFixed(2)} | ${esc(i.flags.map((f) => f.text).join('; ') || '—')} |`;
    };
    const tiers = [
        [1, 'Priority 1: data issues, confident disagreements, unrecorded conflicts', 'Ledger rows that disagree with their source inventory or the README vocabulary, TypeSafe disagreements at confidence ' + HIGH_CONFIDENCE + ' or above, and likely same-source conflicts the ledger does not record.'],
        [2, 'Priority 2: other disagreements', 'TypeSafe disagrees with the ledger at confidence below ' + HIGH_CONFIDENCE + ', or a Proposed candidate whose notes read as explicit acceptance.'],
        [3, 'Priority 3: acceptance not cited, or uncertain answers', "TypeSafe agrees with the ledger's label and class, but a Confirmed candidate's notes do not cite the owner's acceptance, or an answer's confidence is below " + LOW_CONFIDENCE + '.'],
        [4, 'Unflagged', 'TypeSafe agrees with the ledger, the notes support the label, and both answers are at or above the low-confidence threshold.'],
    ];
    lines.push('"Accept" is the probability that the cited notes show explicit owner acceptance. "Conflict" is the probability of a same-source conflict or supersession. Within each tier, rows are sorted by the number of flags at that tier, then by total flags, then by lowest Choice confidence.');
    lines.push('');
    for (const [p, title, desc] of tiers) {
        lines.push(`## ${title}`);
        lines.push('');
        lines.push(desc);
        lines.push('');
        if (tier(p).length) lines.push(...header, ...tier(p).map(row));
        else lines.push('None.');
        lines.push('');
    }
    lines.push('## Limits');
    lines.push('');
    for (const l of meta.limits) lines.push(`- ${l}`);
    lines.push('');
    return lines.join('\n');
}

// ---------- main ----------

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const { rows: ledger, tableBreaks } = parseLedger(fs.readFileSync(LEDGER_PATH, 'utf8'));
    const sources = fs
        .readdirSync(SOURCES_DIR)
        .filter((f) => f.endsWith('.md'))
        .map((f) => parseSource(path.join(SOURCES_DIR, f)));
    const byId = new Map();
    for (const s of sources) for (const c of s.candidates) byId.set(c.id, { candidate: c, source: s });

    const rows = ledger.filter((r) => !args.only || args.only.has(r.id));
    const missing = rows.filter((r) => !byId.has(r.id)).map((r) => r.id);
    if (missing.length) throw new Error(`Ledger rows without a source inventory entry: ${missing.join(', ')}`);
    const unlisted = [...byId.keys()].filter((id) => !ledger.some((r) => r.id === id));

    let cache = {};
    if (fs.existsSync(args.cache)) cache = JSON.parse(fs.readFileSync(args.cache, 'utf8'));
    if (!args.fromCache && !process.env.TYPESAFE_API_KEY) throw new Error('TYPESAFE_API_KEY is not set.');

    let done = 0;
    const answers = await mapLimit(rows, args.concurrency, async (r) => {
        const { candidate, source } = byId.get(r.id);
        if (args.fromCache) {
            if (!cache[r.id]) throw new Error(`No cached answer for ${r.id}`);
            return cache[r.id];
        }
        const result = await callTypeSafe(buildRequest(candidate, source));
        cache[r.id] = result;
        if (++done % 20 === 0 || done === rows.length) process.stderr.write(`${done}/${rows.length}\n`);
        return result;
    });
    if (!args.fromCache) {
        fs.mkdirSync(path.dirname(args.cache), { recursive: true });
        fs.writeFileSync(args.cache, JSON.stringify(cache, null, 2));
    }

    const items = rows.map((r, i) => {
        return { row: r, answer: answers[i].response.answers, ...assess(r, byId.get(r.id).candidate, answers[i]) };
    });

    const latencies = answers.map((a) => Math.round(a.ms)).sort((x, y) => x - y);
    const at = (p) => latencies[Math.min(latencies.length - 1, Math.floor(p * (latencies.length - 1)))];
    const meta = {
        date: new Date().toISOString().slice(0, 10),
        model: answers[0]?.response.model || MODEL,
        requests: answers.length,
        inputTokens: answers.reduce((n, a) => n + (a.response.usage?.input_tokens || 0), 0),
        latency: { median: at(0.5), p90: at(0.9), max: latencies[latencies.length - 1] },
        thresholdNote: `A disagreement at Choice confidence ${HIGH_CONFIDENCE} or above is priority 1; this is about the 75th percentile of label confidence. Confidence below ${LOW_CONFIDENCE} (about the 25th percentile of label confidence and the 10th of class confidence) is flagged as uncertain. A Noul at or above ${NOUL_YES} reads as yes; most Noul values sit far below it (medians 0.08 for acceptance and 0.13 for conflict).`,
        limits: ["TypeSafe judged the inventories' extracted statements and notes, not the original conversations. If an inventory note misstates the source, the answer inherits that error.", 'The conflict question sees only candidates from the same source. Cross-source supersession (for example, VPTC-001 superseding VAC-016) is out of its view.', 'The README defines the evidence labels but not the classification vocabulary, so the classification Choice uses the bare class names.', ...tableBreaks.map((id) => `The ledger's candidate table is broken by a blank line before ${id}, so Markdown renders that row and those after it as plain text. The script parsed them anyway.`), ...(unlisted.length ? [`Inventory candidates missing from the ledger (not evaluated): ${unlisted.join(', ')}.`] : [])],
    };

    fs.writeFileSync(args.out, renderReport({ items, meta }));
    process.stderr.write(`Wrote ${path.relative(ROOT, args.out)}: ${items.length} candidates, ${items.filter((i) => i.priority === 1).length} at priority 1.\n`);
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
