# Relay Customize: Series of Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the two long Customize pages into an Understand series (3 parts) and a Build series (5 parts), each part its own page with series navigation.

**Architecture:** MDX parts live under `content/relay/customize/treble-bleed/<series>/<part>.mdx`. One dynamic route renders any part from `config/relay-customize.ts`, adding a "Part n of N" lead-in and a previous/next component. The sidebar group, landing page, cross-links, records, tests and wiring-check pairs follow the config.

**Tech Stack:** Next.js 15 App Router, MDX (`next-mdx-remote/rsc`), Vitest and Testing Library.

**Spec:** [docs/superpowers/specs/2026-11-23-relay-customize-treble-bleed-design.md](../specs/2026-11-23-relay-customize-treble-bleed-design.md), section "Update 2026-11-24" (binding for structure; all earlier decisions stand).

## Global Constraints

- Branch `claude/relay-customize-treble-bleed`. Prettier: 4-space tabs, single quotes, trailing commas es5, printWidth 999. Commit trailer `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Wording moves unchanged with its section. Only change: cross-section anchors become part links; "above/below" references reworded; each part's first lines say where it sits (the route renders the "Part n of N" lead-in; the MDX does not).
- Never in `content/relay/customize/`: unvalidated, pending (as a word), experimental, "not yet tested", "to be determined", TBD, "we/us/our". Every `<img` has alt of at least 20 characters; every referenced public asset exists.
- Slugs and mapping (series `understand`, `build`, topic `treble-bleed`):
  - understand: `why-turning-down-dulls`, `what-a-bleed-does`, `the-reactive-bleed`
  - build: `is-it-a-fit`, `parts-and-hole`, `what-changes-and-lugs`, `wire-it-and-check`, `reference-and-troubleshooting`
- Old URLs are retired (unmerged, no redirects).
- Do not run `npm run build` while a dev server runs; stop servers you start.

## Review Focus

- A section dropped or duplicated by the split: the concatenated parts of each series must contain every original H2 exactly once (Task 1 test).
- A broken in-page anchor or a stale `/guitars/relay/customize/how-treble-bleeds-work` or `/direct-off-reactive-switch` link anywhere in the repo (Tasks 1 and 3 tests).
- Previous/next at the ends of a series (no previous on part 1, no next on the last part) and across series (Task 2).
- Sidebar group showing the series only under `/guitars/relay/customize` and highlighting the current part (Task 2).
- Wiring-check pairs still match the netlist for each build part, with the contacts table on the part that holds it (Task 3).

---

### Task 1: Split the content

**Files:** Create `content/relay/customize/treble-bleed/understand/{why-turning-down-dulls,what-a-bleed-does,the-reactive-bleed}.mdx` and `content/relay/customize/treble-bleed/build/{is-it-a-fit,parts-and-hole,what-changes-and-lugs,wire-it-and-check,reference-and-troubleshooting}.mdx`; delete `content/relay/customize/how-treble-bleeds-work.mdx` and `direct-off-reactive-switch.mdx`; modify `content/relay/customize/customize-pages.test.ts`, `content/relay/customize/index.mdx`.

- [ ] **Step 1: Update `customize-pages.test.ts` (failing first).** Walk `content/relay/customize/` recursively (index plus nested parts); `requiredSlugs` becomes the 8 part paths plus `index`; each page loads through `loadRelayPlatformSectionPage(['customize', ...segments])`; keep the hedging, plural-first-person, asset-exists and alt tests per file; the diagram test asserts understand parts together reference diagrams 01 to 10 in order and build parts together reference 11 to 14 and the sheet (`relay-treble-bleed-switch-rev-1.0.png` and both page files); the value-table, `6 mm`, switch-link assertions run over the concatenated build parts; add a test that the concatenated parts of each series contain every H2 from the original pages exactly once (list the original H2 titles in the test: Understand: A few words first, What the volume knob really does, Why turning down makes it dull, What a bleed does, The usual variants, Where fixed bleeds disappoint, The reactive bleed, The three modes together, Where to go next; Build: What you get, Is your guitar a fit?, Parts and tools, Make room for the switch, Understand what changes, Identify your lugs, Step-by-step wiring, The reference sheet, Bench checks, Worked example: Relay Lipstick, Tuning by ear, Troubleshooting; the sub-heading "Choose your bleed values" and the three H3s under the reference sheet stay with their parent) and that no content file links to a retired URL. Run `npx vitest run content/relay/customize`; expected FAIL.
- [ ] **Step 2: Split.** Use the mapping in the spec update; each part has `title` and `description` frontmatter; part 1 of each series keeps the page's intro; replace anchors such as `#identify-your-lugs` with links to the owning part; reword "above/below/earlier" references that now cross pages; the last Understand part ends by linking `build/is-it-a-fit`; `index.mdx` links part 1 of each series. Delete the two old files.
- [ ] **Step 3: Run `npx vitest run content/relay/customize`.** Expected PASS (the cross-links test still fails until Task 3; leave it).
- [ ] **Step 4: Commit** `Split the Customize pages into two series of parts`.

### Task 2: Config, route, series navigation, sidebar

**Files:** Modify `types/relay-nav.ts`, `config/relay-customize.ts`, `config/relay-customize.test.ts`, `components/navigation/relay-sidebar.tsx`, `components/navigation/relay-sidebar.test.tsx`. Create `components/relay/relay-series-nav.tsx` and `.test.tsx`, `app/guitars/relay/customize/treble-bleed/[series]/[part]/page.tsx`. Delete `app/guitars/relay/customize/how-treble-bleeds-work/` and `direct-off-reactive-switch/`.

**Interfaces:**
- `RelayCustomizePart { slug: string; title: string; summary: string; href: string }`; `RelayCustomizeSeries { slug: 'understand' | 'build'; title: string; summary: string; parts: RelayCustomizePart[] }`; `RelayCustomize { title: 'Customize'; href: '/guitars/relay/customize'; topic: { slug: 'treble-bleed'; title: 'Treble bleed' }; series: RelayCustomizeSeries[] }`.
- `getRelayCustomizePart(series: string, part: string): { series: RelayCustomizeSeries; part: RelayCustomizePart; index: number; total: number; prev?: { title: string; href: string }; next?: { title: string; href: string } } | undefined` in `config/relay-customize.ts`. At the ends of a series, `prev`/`next` are absent except: the last Understand part's `next` is Build part 1, and Build part 1's `prev` is the last Understand part (cross-series, titles prefixed with the series name).
- `RelaySeriesNav({ prev, next })` renders the previous/next links as one `nav` with `aria-label="Series navigation"`.

- [ ] **Step 1: Failing tests.** Config: hrefs equal `/guitars/relay/customize/treble-bleed/${series}/${slug}`, 3 and 5 parts, every part has its MDX file, prev/next at both ends and across the series boundary, unknown part returns undefined. Series nav: renders both links, omits missing ones. Sidebar: on `/guitars/relay` the Customize heading and landing link show and no part links; under `/guitars/relay/customize/treble-bleed/build/parts-and-hole` the two series headings and all 8 part links show with the current one `font-medium text-foreground`; the five build steps unchanged. Run; expected FAIL.
- [ ] **Step 2: Implement** types, config, `RelaySeriesNav`, the sidebar group (series title as a small subheading, parts as the existing sub-item style), and the dynamic route: `generateStaticParams` from the config, `generateMetadata` and the page loading `['customize','treble-bleed', series, part]`, breadcrumbs Guitars > Relay > Customize > series title > part title, a lead-in line "Understand · Part 1 of 3" (or "Build · ...") above the content, `RelaySeriesNav` below. Unknown series/part calls `notFound()`. Delete the two old route folders.
- [ ] **Step 3: Run `npx vitest run config components`.** Expected PASS.
- [ ] **Step 4: Commit** `Add series routes, navigation and sidebar for Customize`.

### Task 3: Links, records and checks

**Files:** Modify `content/relay/components/items/treble-bleed.mdx`, `content/relay/wiring/{lipstick,torch,velvet}.mdx`, `content/relay/customize/cross-links.test.ts`, `docs/engineering/relay-switchable-treble-bleed.md`, `docs/engineering/treble-bleed-switch/netlist.md` (any old URL), `scripts/typesafe/check-wiring-pages.mjs`; grep the repo for the two retired URLs and fix every hit (including the plan/spec history is fine to leave).

- [ ] **Step 1: Update `cross-links.test.ts` (failing first):** each of the four files links `/guitars/relay/customize/treble-bleed/understand/why-turning-down-dulls` once and `/guitars/relay/customize/treble-bleed/build/is-it-a-fit` once; the Torch and Velvet order assertions (link sentence after "without a treble bleed") stay; a repo-wide test that no `content/` or `docs/engineering/` file contains the retired URLs. Run; expected FAIL.
- [ ] **Step 2: Update** the four content files, the record's See-also line and any other hits; in `check-wiring-pages.mjs` replace the single retrofit pair with five pairs named `Treble bleed switch: part 1` to `part 5` (one per build part file, source `docs/engineering/treble-bleed-switch/netlist.md`), the `contacts` table entry only on `reference-and-troubleshooting`.
- [ ] **Step 3: Run `node scripts/typesafe/check-wiring-pages.mjs --dry-run`** (no API key available): 0 value or net-label flags in the five pairs, contacts table matches (6 of 6). Fix wording in the page or the netlist document for any flag. Run the full `npx vitest run`.
- [ ] **Step 4: Commit** `Point Customize links, records and checks at the series pages`.

### Task 4: Verify and preview

- [ ] **Step 1:** `npx prettier --check` on changed files, `npx tsc --noEmit` (only the pre-existing TS1501 allowed), `npm run lint`, `git diff --check`, `npm run build` with no dev server running (expected exit 0, all 8 part routes generated).
- [ ] **Step 2:** Start the dev server (`preview_start` dev), open the landing page, part 1 of each series, the last part of each, check desktop and phone widths, previous/next links, the sidebar highlighting, images loading and console errors; stop nothing the owner is still previewing without telling them.
- [ ] **Step 3:** Update the spec's status lines at PR time (not now).
