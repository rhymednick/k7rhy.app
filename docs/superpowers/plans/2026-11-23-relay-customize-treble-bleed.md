# Relay Customize: Switchable Treble Bleed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Customize group to the Relay docs with two pages (how treble bleeds work; add a Direct / Off / Reactive switch), backed by a verified netlist and 15 generated diagrams.

**Architecture:** A netlist model (`netlist.mjs`) is the single source of truth. A checker proves the three switch modes against it, a generator draws every circuit diagram from it, and a verifier rebuilds connectivity from the drawn SVG. Pages are MDX under `content/relay/customize/`, rendered by three route files that mirror the existing Relay body pages, and listed in a new sidebar group driven by `config/relay-customize.ts`.

**Tech Stack:** Next.js 15 App Router, MDX via `next-mdx-remote/rsc`, Vitest and Testing Library, Node `.mjs` scripts, `sharp` for PNG export.

**Spec:** [docs/superpowers/specs/2026-11-23-relay-customize-treble-bleed-design.md](../specs/2026-11-23-relay-customize-treble-bleed-design.md). Executors read it first; it carries the voice, outline and scope decisions this plan does not repeat. Circuit source: [relay-switchable-treble-bleed.md](../../engineering/relay-switchable-treble-bleed.md).

## Global Constraints

- Branch `claude/relay-customize-treble-bleed` (already created, design doc committed). One PR, not a draft. Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`; PR body ends with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- Prettier: 4-space tabs, single quotes, trailing commas (es5), printWidth 999. Path alias `@/*`.
- Voice: the owner's voice profile at `/Users/rhy/.claude/memory/voice-profile.md`, documentation register, first person singular where the author speaks, never "we". Plain words; define each term in one friendly sentence.
- The words `unvalidated`, `pending`, `experimental`, `not yet tested`, `to be determined`, `TBD` never appear in `content/relay/customize/`. The circuit is stated as validated, with no measurements or simulation figures.
- Switch labels are exactly **Direct**, **Off**, **Reactive**. The switch is an SPDT on–off–on mini toggle. Hole: 6 mm for the linked switch, drilled, near the tone pot where there is room.
- Values by volume pot: 500k = 150 kΩ + 1 nF (validated Lipstick pair); 250k = 68 kΩ + 1 nF; 1M = 330 kΩ + 1 nF (the last two await owner confirmation, Task 8 step 1). Alternatives: capacitor 470–680 pF for subtler, 1.5–2.2 nF for brighter, resistor one standard step either way. Tone cap 22 nF.
- Tone-pot ends are named by behavior: the end the wiper reaches at tone 10 is the **Reactive feed** (`TONE.CW`); the end it reaches at tone 0 goes through the 22 nF cap to ground (`TONE.CCW`). Rear-view physical labels follow wiring-diagrams.md (shaft away, lugs down: left/center/right = CW/wiper/CCW).
- Fit rule: wired like Lipstick, with the tone pot's hot end on the volume input (`BUS`); no bleed, or a fixed series R and C bleed (reused). Out of fit: tone fed from the volume wiper or with extra parts; any other bleed; summed volumes (Reef, Reef Plus).
- Switch link: `https://www.amazon.com/dp/B0799JK458`. Check the listing's bushing size when writing the page.
- Diagram assets: explainers in `public/circuits/treble-bleed/NN-slug.svg` plus `.png`; the builder sheet in `public/wiring-diagrams/relay-treble-bleed-switch-rev-1.0.png`. Every `<img>` has a descriptive `alt`.
- No spawning of subagents (including diagram reviewers) without asking the owner first.
- Before touching a wiring page run `scripts/typesafe/check-wiring-pages.mjs` (see Task 8).

## Review Focus

- **Equivalences:** Direct and Reactive give the same circuit at tone 10; all three modes give the same circuit at volume 10. Tested in the model (Task 1).
- **Off equals stock:** with the switch Off, the tone sweep (resistance wiper to cap end, 0 at tone 0 to full track at tone 10) equals the unmodified Lipstick tone circuit. Tested in the model (Task 1).
- **Drawing matches netlist:** a wire drawn crossing without a junction dot must not be a connection; a mis-tagged diagram must fail verification (Tasks 2, 3, 5).
- **Banned wording and broken assets:** no hedging words on the pages; every referenced image exists and has alt text (Tasks 7, 8).
- **Sidebar state:** Customize items show and highlight on `/guitars/relay/customize/*` routes, and the five build steps are unchanged elsewhere (Task 6).

---

## File Structure

| Path | Responsibility |
| --- | --- |
| `docs/engineering/treble-bleed-switch/netlist.md` | Text netlist, switch contact table, operating states. Source for `check-wiring-pages.mjs`. |
| `docs/engineering/treble-bleed-switch/netlist.mjs` | Terminal-level model; exports used by the checker, generator and verifier. |
| `docs/engineering/treble-bleed-switch/check-netlist.mjs` | Cross-checks the model against values typed from `netlist.md`. |
| `docs/engineering/treble-bleed-switch/netlist.test.ts` | Vitest wrapper so CI runs the checker. |
| `docs/engineering/treble-bleed-switch/draw.mjs` | Shared SVG primitives (pot, switch, resistor, capacitor, labels, wires carrying `data-*` tags). |
| `docs/engineering/treble-bleed-switch/generate-diagrams.mjs` | Draws diagrams 1–15, writes SVG and PNG, runs the verifier. |
| `docs/engineering/treble-bleed-switch/verify-drawings.mjs` | Rebuilds connectivity from drawn SVG and compares with the netlist. |
| `config/relay-customize.ts`, `types/relay-nav.ts` | Sidebar group data and types. |
| `components/navigation/relay-sidebar.tsx` | Renders the group. |
| `app/guitars/relay/customize/**/page.tsx` (3 files) | Routes. |
| `content/relay/customize/*.mdx` (3 files) | Page content. |

---

### Task 1: Netlist document, model and checks

**Files:**
- Create: `docs/engineering/treble-bleed-switch/netlist.md`, `netlist.mjs`, `check-netlist.mjs`, `netlist.test.ts`
- Modify: `docs/engineering/relay-switchable-treble-bleed.md`

**Interfaces:**
- Produces from `netlist.mjs`: `wires: Record<string, string[]>` (net name to terminals), `netOf(terminal: string): string`, `switchModes: ['DIRECT','OFF','REACTIVE']`, `connectivity(mode: string, tone: number, volume: number): Map<string, string>` (terminal to net id, tone and volume 0–10, wiper position modeled as the wiper joining the CW end at 10, the CCW end at 0, and only the track between otherwise), `toneSweepResistance(mode: string, tone: number, trackOhms: number): number`.
- Produces from `check-netlist.mjs`: `runChecks(): { checks: number; failures: string[] }`.

Terminals to model (use these names): `VOL.IN`, `VOL.W`, `VOL.GND`, `TONE.W`, `TONE.CCW`, `TONE.CW`, `C22.HOT`, `C22.GND`, `RB.1` (on `OUT`), `RB.2`, `CB.1` (joined to `RB.2` as `TB-MID`), `CB.2` (on `SW.C`), `SW.C`, `SW.DIRECT`, `SW.OFF`, `SW.REACTIVE`, `JACK.TIP`, `JACK.SLV`, `SEL.C`. Nets: `BUS` = `SEL.C`, `VOL.IN`, `TONE.W`, `SW.DIRECT`; `OUT` = `VOL.W`, `JACK.TIP`, `RB.1`; `TB-MID` = `RB.2`, `CB.1`; `TB-SW` = `CB.2`, `SW.C`; `TONE-CAP` = `TONE.CCW`, `C22.HOT`; `REACT` = `TONE.CW`, `SW.REACTIVE`; `GND` = `VOL.GND`, `C22.GND`, `JACK.SLV`. `SW.OFF` connects to nothing.

- [ ] **Step 1: Write the failing test.** `netlist.test.ts` imports `runChecks` from `./check-netlist.mjs` and asserts `failures` is `[]` and `checks > 20`.
- [ ] **Step 2: Run `npx vitest run docs/engineering/treble-bleed-switch/netlist.test.ts`.** Expected: FAIL, module not found.
- [ ] **Step 3: Write `netlist.md`** with sections Parts, Operating states (Direct, Off, Reactive: which path the bleed takes), Switch contacts (SW.C to throw per mode, as a table with columns mode / contact / net), Netlist (the nets above), Equivalences, and Notes. State the behavior-based lug naming and the rear-view mapping. Include the value table from Global Constraints. Map generic names to Lipstick (`BUS`, `OUT`).
- [ ] **Step 4: Implement `netlist.mjs`** exactly to the interface above (linear model: wiper to `TONE.CCW` is `trackOhms * tone/10` and wiper to `TONE.CW` is `trackOhms * (10 - tone)/10`; `toneSweepResistance` returns the wiper-to-`TONE.CCW` value in every mode, since the cap path is unchanged by the switch).
- [ ] **Step 5: Implement `check-netlist.mjs`.** Expected values are typed from `netlist.md`, not computed from the model. Checks: every terminal on exactly one net; per mode the bleed path (Direct: `OUT`→`RB`→`CB`→`SW.C`→`BUS`; Off: `SW.C` isolated; Reactive: `SW.C`→`TONE.CW`); at tone 10 Reactive joins `TONE.CW` to `BUS` with 0 Ω; at tone 0 the Reactive branch sees the full track; at volume 10 (`VOL.W` joins `VOL.IN`) the bleed shorts to the same net in all three modes; `toneSweepResistance('OFF', 0, 500000) === 0` and `('OFF', 10, 500000) === 500000`; the unmodified Lipstick tone sweep from `docs/engineering/relay-lipstick-reference.md` (wiper to cap, 0 to full track) is reproduced for Off.
- [ ] **Step 6: Run the test.** Expected: PASS.
- [ ] **Step 7: Update `relay-switchable-treble-bleed.md`.** Status line becomes "Validated 2026-11-23 (owner-reported; no measurements recorded). Offered as an alternative tone wiring, not a standard build, because it needs a switch hole." Rewrite "Model application" so Lipstick is the validated reference and no model adopts it as standard; keep the old simulation text under a "Design-time rationale (history)" heading; add pointers to `treble-bleed-switch/netlist.md` and to the two published page URLs.
- [ ] **Step 8: Commit** `Add switchable treble bleed netlist model and checks` (include the record update).

### Task 2: Drawing primitives and circuit verifier

**Files:**
- Create: `docs/engineering/treble-bleed-switch/draw.mjs`, `verify-drawings.mjs`, `verify-drawings.test.ts`

**Interfaces:**
- Consumes: `wires`, `netOf`, `connectivity` from Task 1.
- Produces from `draw.mjs`: `svgDoc(width: number, height: number, title: string, body: string): string`; `wire(net: string, points: [number, number][], opts?: { color?: string; dot?: [number, number][] }): string` (emits `data-net`, vertices, junction dots as `data-dot`); `terminal(id: string, x: number, y: number): string` (`data-terminal`); `pot(id: string, x: number, y: number, opts: { view: 'rear' | 'schematic'; ends: { left: string; wiper: string; right: string } }): string`; `resistor`, `capacitor`, `toggle3(id, x, y, mode: 'DIRECT'|'OFF'|'REACTIVE'|null)`, `netLabel(net, x, y)`; palette constants `NET_COLORS`.
- Produces from `verify-drawings.mjs`: `verifyDrawing(svg: string, opts: { expectedMode?: 'DIRECT'|'OFF'|'REACTIVE'; terminals: string[] }): { ok: boolean; problems: string[] }`.

Follow the rules in the header comment of `docs/engineering/coupeville-red-lipstick-special/verify-drawing.mjs` (shared coordinates join, wire ends join only at a junction dot, crossings without a dot do not join, terminal joins the nearest vertex within 9 px). Reuse its approach; copy only what is needed, adapting names to this netlist.

- [ ] **Step 1: Write failing tests** in `verify-drawings.test.ts` using hand-built mini SVG strings from `draw.mjs`: (a) a drawing whose `OUT` and `BUS` wires cross with no dot passes as two nets; (b) the same crossing with a dot fails when the netlist says they are separate; (c) a drawing omitting the `SW.REACTIVE`→`TONE.CW` wire fails with a problem naming `REACT`; (d) a toggle drawn in Direct joins `SW.C` to `BUS` and not to `REACT`.
- [ ] **Step 2: Run** `npx vitest run docs/engineering/treble-bleed-switch/verify-drawings.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement `draw.mjs` and `verify-drawings.mjs`** to the interfaces above. Large friendly type (min 14 px in a 1200 px-wide canvas), one idea per drawing, white background, pale-blue panel fills only on the builder sheet.
- [ ] **Step 4: Run the tests.** Expected: PASS.
- [ ] **Step 5: Commit** `Add treble bleed drawing primitives and verifier`.

### Task 3: Explainer schematics (diagrams 5–7, 9–12)

**Files:**
- Create: `docs/engineering/treble-bleed-switch/generate-diagrams.mjs`; outputs `public/circuits/treble-bleed/{05-stock-volume,06-capacitor-bleed,07-bleed-variants,09-reactive-bleed,10-three-modes,11-before,12-after}.{svg,png}`

**Interfaces:**
- Consumes: `draw.mjs` primitives; `verifyDrawing`; `runChecks`.
- Produces: `generateAll(): Promise<{ written: string[]; problems: string[] }>`; running the file with `node` calls it, exits non-zero if `problems` is non-empty or `runChecks().failures` is non-empty.

Content of each (all label rear-view CW/wiper/CCW on pots; all show hot signal in color, ground in dark gray):
- 05: pickup → volume pot (three lugs, wiper) → output; no bleed.
- 06: 05 plus a capacitor from the volume input to the wiper.
- 07: three small panels: capacitor only; capacitor with a parallel resistor; capacitor with a series resistor.
- 09: reactive bleed: the tone pot's wiper on `BUS`, the cap end to the 22 nF cap and ground, the `REACT` end to the bleed; bleed path highlighted.
- 10: three panels (Direct, Off, Reactive), each with its active path highlighted, plus a one-line caption each in the owner's voice.
- 11: stock Lipstick-style volume and tone before the retrofit (fixed series bleed from `BUS` to `OUT`; tone `CCW` on `BUS`, wiper to 22 nF).
- 12: the retrofit result: Lipstick-style circuit with the switch, 11 versus 12 drawn at the same scale; changed wires highlighted and listed in the caption (feed moved to the tone wiper, cap moved to the old hot end, new `REACT` wire, bleed's input end moved to `SW.C`).

- [ ] **Step 1: Write a failing test** `generate-diagrams.test.ts` asserting that after `generateAll()` every listed output exists, each SVG has a `<title>` and a `data-net` tag, and `problems` is `[]`.
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement the seven drawings** in `generate-diagrams.mjs`; circuit drawings 09, 10, 11, 12 go through `verifyDrawing` with the matching `expectedMode`, and 12 is verified against the Reactive and Direct nets; 05–07 are verified for the volume subcircuit only. PNGs through `sharp` at 2× scale.
- [ ] **Step 4: Run `node docs/engineering/treble-bleed-switch/generate-diagrams.mjs` and the test.** Expected: PASS, no problems printed.
- [ ] **Step 5: Look at every PNG at full size** (Read tool on each PNG) and compare with the netlist; fix and regenerate.
- [ ] **Step 6: Commit** `Generate treble bleed explainer schematics`.

### Task 4: Concept and reference drawings (diagrams 1–4, 8, 13, 14)

**Files:**
- Modify: `generate-diagrams.mjs`
- Output: `public/circuits/treble-bleed/{01-signal-chain,02-volume-pot,03-pot-and-cable,04-brightness-sketch,08-tone-pot,13-pot-lugs,14-switch-contacts}.{svg,png}`

- 01: pickup → volume → cable → amp, each a labeled box with a one-line job.
- 02: the volume pot's track and wiper, three lugs, rear view with CW/wiper/CCW.
- 03: the volume pot and cable capacitance drawn as the low-pass filter picture; plain labels, no equations.
- 04: a labeled **sketch** of brightness versus volume position, three curves (no bleed, fixed bleed, reactive); the image itself carries the text "Illustration, not a measurement". No numeric axis values.
- 08: the tone pot's three lugs and what each does in the new circuit (wiper to `BUS`, `CCW` to cap, `CW` to the bleed).
- 13: rear-view pot lug identification with the continuity test (which meter reading finds the wiper; which end is which).
- 14: the toggle's functional contact map for Direct, Off and Reactive, with the line "confirm with a meter".

- [ ] **Step 1: Extend `generate-diagrams.test.ts`** to expect these outputs and that 04's SVG contains the exact text `Illustration, not a measurement` and no digits in axis labels.
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement the seven drawings.** 13 and 14 go through `verifyDrawing` where they carry terminals.
- [ ] **Step 4: Run generator and test.** Expected: PASS.
- [ ] **Step 5: Look at every PNG at full size**; fix and regenerate.
- [ ] **Step 6: Commit** `Generate treble bleed concept drawings`.

### Task 5: Builder reference sheet (diagram 15)

**Files:**
- Modify: `generate-diagrams.mjs`
- Output: `public/wiring-diagrams/relay-treble-bleed-switch-rev-1.0.png` (and the SVG under `docs/engineering/treble-bleed-switch/`)

Match [relay-arc-rev-1.0.png](../../engineering/references/relay-arc-rev-1.0.png): high-resolution white sheet, pale-blue numbered panels, colored boxed net labels, rear-view pots, functional contact map, operating states, common-ground and bench-check panels. Title: "Direct / Off / Reactive treble bleed", revision 1.0, date 2026-11-23. Panels: 1 what you're building; 2 stock circuit; 3 finished circuit; 4 tone-pot lugs (rear view); 5 switch contacts; 6 three modes; 7 value table by pot; 8 bench checks. Verified with `verifyDrawing` for panels 3 and 6.

- [ ] **Step 1: Extend the test** to expect the sheet's files and a `problems` list of `[]`.
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement the sheet.** Render at full size and compare layout with the Arc reference image.
- [ ] **Step 4: Ask the owner for permission to spawn two reviewer subagents** (the wiring workflow requires two independent reviews: one tracing electrical connectivity and all three modes; one checking lug orientation, readability and whether a builder can follow it). On yes, give each the netlist and the exported PNG, ask for specific pass/fail findings, fix, regenerate and re-review the changed export. On no, ask the owner how to review.
- [ ] **Step 5: Commit** `Add treble bleed switch reference sheet`.

### Task 6: Sidebar group and routes

**Files:**
- Create: `config/relay-customize.ts`, `config/relay-customize.test.ts`, `app/guitars/relay/customize/page.tsx`, `app/guitars/relay/customize/how-treble-bleeds-work/page.tsx`, `app/guitars/relay/customize/direct-off-reactive-switch/page.tsx`, `content/relay/customize/index.mdx`
- Modify: `types/relay-nav.ts`, `components/navigation/relay-sidebar.tsx`, `components/navigation/relay-sidebar.test.tsx`

**Interfaces:**
- Produces: `RelayCustomizePage { slug: string; title: string; summary: string; href: string }`; `relayCustomize: { title: 'Customize'; href: '/guitars/relay/customize'; pages: RelayCustomizePage[] }` with pages `how-treble-bleeds-work` ("How treble bleeds work") and `direct-off-reactive-switch` ("Direct / Off / Reactive switch"), hrefs under `/guitars/relay/customize/`.

- [ ] **Step 1: Write failing tests.** In `config/relay-customize.test.ts`: every page's `href` equals `/guitars/relay/customize/${slug}` (the check that each page's MDX file exists is added in Task 8, once both files exist). In `relay-sidebar.test.tsx`: on `/guitars/relay` a heading "Customize" and a link "Customize" to `/guitars/relay/customize` render and the five build steps are unchanged; on `/guitars/relay/customize/how-treble-bleeds-work` the two page links show and that one has `font-medium`; elsewhere the page links are hidden.
- [ ] **Step 2: Run** `npx vitest run config/relay-customize.test.ts components/navigation/relay-sidebar.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement** the config, the types, and the sidebar group (a `<h4>` "Customize" matching "Build process" styling, with the landing link and, when the pathname is under `/guitars/relay/customize`, its page links, styled like the stage sub-items).
- [ ] **Step 4: Implement the three route files**, copying `app/guitars/relay/body/bonding/page.tsx` and adjusting `loadRelayPlatformSectionPage(['customize', ...])`, breadcrumbs (Guitars → Relay → Customize → page) and the loader argument. Write `content/relay/customize/index.mdx`: short, honest intro, saying these are optional changes to a finished or in-progress guitar, listing the one item as an **alternative tone wiring** that needs one drilled hole, and linking both pages. Frontmatter `title`, `description`.
- [ ] **Step 5: Run the tests.** Expected: PASS.
- [ ] **Step 6: Commit** `Add Relay Customize sidebar group and routes`.

### Task 7: Explainer page

**Files:**
- Create: `content/relay/customize/how-treble-bleeds-work.mdx`, `content/relay/customize/customize-pages.test.ts`

- [ ] **Step 1: Write failing tests** in `customize-pages.test.ts` (covers both pages; Task 8 reuses it): each `content/relay/customize/*.mdx` loads through `loadRelayPlatformSectionPage(['customize', slug])`; none matches `/unvalidated|pending|experimental|not yet tested|to be determined|\bTBD\b/i`; every `src="/circuits/..."` or `/wiring-diagrams/...` reference resolves to a file under `public/`; every `<img` has an `alt` of at least 20 characters; the explainer references diagrams 01 through 10.
- [ ] **Step 2: Run it.** Expected: FAIL (file missing).
- [ ] **Step 3: Write the page** following "Page 1" in the spec: the glossary of six terms, then eight sections in the spec's order, picture before words, using diagrams 01–10 from `public/circuits/treble-bleed/` in figure blocks like the Lipstick wiring page's (full-size and download links). Voice per Global Constraints. No figures, no simulation language. Section 5 explains that a fixed bleed ignores the tone knob, in plain words. Link to the retrofit guide at the end.
- [ ] **Step 4: Run the tests.** Expected: PASS for the explainer, retrofit expectations still failing.
- [ ] **Step 5: Render the page** with the dev server (`preview_start`), check desktop and phone widths, and stop the server when done. Fix layout issues.
- [ ] **Step 6: Commit** `Add how treble bleeds work page`.

### Task 8: Retrofit page and wiring check

**Files:**
- Create: `content/relay/customize/direct-off-reactive-switch.mdx`
- Modify: `scripts/typesafe/check-wiring-pages.mjs` (add to `PAIRS`)

- [ ] **Step 1: Ask the owner to confirm the scaled values** (250k: 68 kΩ + 1 nF; 1M: 330 kΩ + 1 nF) and whether the switch has an affiliate short link to use. Do not write the value table until the owner answers. Use the answers verbatim.
- [ ] **Step 2: Extend `customize-pages.test.ts`** to expect the retrofit page: it contains the three mode names `Direct`, `Off`, `Reactive`; the exact link `https://www.amazon.com/dp/B0799JK458` (or the owner's affiliate link); the text `6 mm`; the value table rows for 250k, 500k and 1M; and references diagrams 11–14 and the builder sheet.
- [ ] **Step 3: Run it.** Expected: FAIL.
- [ ] **Step 4: Write the page** following "Page 2" in the spec, sections 1–11 in order, with the value table as in Global Constraints, the fit rules and continuity test, the hole section (choose a spot near the tone pot where there is room, measure your own switch's bushing because the right hole depends on the switch bought, drill with tape and pilot hole, protect the finish, mount before wiring), numbered wiring steps tied to net labels from the netlist, bench checks from the spec, the Lipstick worked example (drawings only), tuning by ear, and troubleshooting. Net labels in the text use the netlist's names exactly. Confirm the switch bushing size on the Amazon listing; if the listing says otherwise than 6 mm, tell the owner before publishing.
- [ ] **Step 5: Add the pair to `PAIRS`** in `scripts/typesafe/check-wiring-pages.mjs` with `name: 'Treble bleed switch'`, `page: { kind: 'mdx', file: 'content/relay/customize/direct-off-reactive-switch.mdx' }`, `source: 'docs/engineering/treble-bleed-switch/netlist.md'`, and one `contacts` table entry matching the switch contact table in both (mirror the existing `contacts` entries in that file; match the headings you actually used).
- [ ] **Step 6: Run `TYPESAFE_API_KEY=… node scripts/typesafe/check-wiring-pages.mjs`** (use `--dry-run` if the key is absent and say so). Fix every priority-1 item and table mismatch. Resolve every priority-2 item against the netlist yourself; bring the owner only what you can't settle.
- [ ] **Step 7: Add to `config/relay-customize.test.ts`** the assertion that `content/relay/customize/${slug}.mdx` exists for every page in `relayCustomize.pages`. Run it and the page tests. Expected: PASS.
- [ ] **Step 8: Render and check** at desktop and phone widths; stop the server.
- [ ] **Step 9: Commit** `Add Direct / Off / Reactive switch retrofit page`.

### Task 9: Cross-links

**Files:**
- Modify: `content/relay/components/items/treble-bleed.mdx`, `content/relay/wiring/lipstick.mdx`, `content/relay/wiring/torch.mdx`, `content/relay/wiring/velvet.mdx`

- [ ] **Step 1: Write failing tests** added to `customize-pages.test.ts` (or a new `cross-links.test.ts`): each of the four files contains `/guitars/relay/customize/` once. Lipstick's link sentence names an "alternative tone wiring that adds a switch"; Torch and Velvet's names the same and does not say a bleed is missing without the link.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Add one sentence** to each file (Lipstick, Torch and Velvet wiring pages; the Parts treble-bleed item) linking to the explainer and the retrofit guide. No circuit text changes.
- [ ] **Step 4: Run the wiring check** (`--dry-run` is enough if the key is absent) and the tests. Expected: no new flags, tests PASS.
- [ ] **Step 5: Commit** `Link Relay pages to the treble bleed customization`.

### Task 10: Whole-branch verification and PR

- [ ] **Step 1:** `npx prettier --check` on changed files, `npm run lint`, `git diff --check`, `npx vitest run`, `npm run build`. Expected: all pass.
- [ ] **Step 2:** Check the rendered pages once more at desktop and phone widths, including the sidebar, full-size and download links, and the sheet.
- [ ] **Step 3: Ask the owner before opening the PR**, then open it (not a draft). After opening it, follow the PR tools: `get_status`, `bind_pr` if needed, and offer Auto-fix.
