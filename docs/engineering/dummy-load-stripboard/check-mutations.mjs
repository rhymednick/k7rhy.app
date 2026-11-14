// Proves the checks can fail: breaks the layout and the drawn sheet in specific ways and confirms each break is caught.
// Run after generate-sheet.mjs has written stripboard-sheet.svg.
//
//   node docs/engineering/dummy-load-stripboard/check-mutations.mjs
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runChecks } from './check-layout.mjs';
import { buildLayout } from './layout.mjs';
import { verifySvg } from './verify-drawing.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const svgPath = process.argv[2] ?? join(here, 'stripboard-sheet.svg');
const svg = readFileSync(svgPath, 'utf8');
const results = [];
const expectCaught = (label, caught) => results.push({ label, caught });

// --- layout breaks the netlist/physical checks must catch ---
const mutate = (fn) => {
    const l = buildLayout();
    fn(l);
    return l;
};
const part = (l, ref) => l.parts.find((p) => p.ref === ref);
expectCaught('all four straps removed (strips 9 and 10 no longer tied)', runChecks(mutate((l) => (l.parts = l.parts.filter((p) => !/^W[1-4]$/.test(p.ref))))).failures.length > 0);
expectCaught('the strip cut forgotten (detector node shorted to M)', runChecks(mutate((l) => (l.cuts = []))).failures.length > 0);
expectCaught('R4 top lead moved to the RF strip', runChecks(mutate((l) => (part(l, 'R4').a[1] = l.rowA))).failures.length > 0);
expectCaught('D1 anode moved to the ground strip', runChecks(mutate((l) => (part(l, 'D1').anode = [25, l.rowGd]))).failures.length > 0);
expectCaught('C1 and D1 cathode put in the same hole', runChecks(mutate((l) => (part(l, 'C1').a = [29, l.rowM2]))).failures.length > 0);
expectCaught('two resistors only two holes apart', runChecks(mutate((l) => ((part(l, 'R2').a[0] = 4), (part(l, 'R2').b[0] = 4)))).failures.length > 0);
expectCaught('D1 changed to a 30 V part name in the BOM', runChecks(mutate((l) => (part(l, 'D1').value = 'BAT43'))).failures.length > 0);

// --- drawing breaks the SVG verifier must catch ---
const dir = mkdtempSync(join(tmpdir(), 'stripboard-mutations-'));
const drawn = (label, text) => {
    const file = join(dir, `${results.length}.svg`);
    writeFileSync(file, text);
    expectCaught(label, text !== svg && verifySvg(file).failures.length > 0);
};
drawn(
    'R3 top dot drawn on the wrong strip',
    svg.replace(/<circle cx="([\d.]+)" cy="([\d.]+)"([^>]*data-term="R3\.1")/, (m, x, y, rest) => `<circle cx="${x}" cy="${+y + 58}"${rest}`)
);
drawn('strap W3 not drawn', svg.replace(/<line data-link="W3"[^>]*\/>/, ''));
drawn('all four bare straps not drawn', svg.replace(/<line data-link="W\d"[^>]*stroke="#c8962a"[^>]*\/>/g, ''));
drawn('cut not drawn (strip 10 as one piece)', svg.replace('data-strip="10,1,26"', 'data-strip="10,1,32"').replace(/<rect [^>]*data-strip="10,27,32"[^>]*\/>/, ''));
rmSync(dir, { recursive: true, force: true });

// Known non-detection, by design: dropping ONE of four straps leaves the netlist unchanged (they are redundant for DC;
// they exist to keep the RF path between strips 9 and 10 short), so no netlist check can see it.
let bad = 0;
for (const r of results) {
    console.log(`${r.caught ? 'caught  ' : 'MISSED  '} ${r.label}`);
    if (!r.caught) bad += 1;
}
if (bad) {
    console.error(`${bad} deliberate break(s) went undetected`);
    process.exit(1);
}
console.log(`all ${results.length} deliberate breaks were caught`);
