# CPC26001 String Load Warning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the CPC26001 owner record so it states that 9–42 is the designed string set and 10–46 is the plastic body's structural maximum rather than a setup-dependent recommendation.

**Architecture:** Change only the customer-facing `Playing and setup` paragraph and the two existing CPC26001 planning documents that still describe the limit as a preference. Preserve the case card, component data, layout, and all other owner-record copy. Validate human prose by editorial diff and rendered context; use existing tests and the production build to protect page behavior.

**Tech Stack:** MDX, Next.js 15, Vitest

## Global Constraints

- Use this customer-facing wording exactly: `CPC26001 is designed for 9–42 strings. The plastic body is engineered for a maximum string load equivalent to a 10–46 set. Do not use heavier strings.`
- Treat 10–46 as a structural load limit of the plastic body, not a setup preference or a limit that adjustment can raise.
- Do not add the string guidance to the printable case card.
- Do not alter any other CPC26001 wording, metadata, component value, control description, or layout.
- Work directly on `main`, as explicitly authorized by the user.

---

### Task 1: Correct the Structural String Limit

**Files:**

- Modify: `content/instruments/CPC26001.mdx`
- Modify: `docs/superpowers/specs/2026-07-25-cpc26001-coupeville-current-record-design.md`
- Modify: `docs/superpowers/plans/2026-07-25-cpc26001-coupeville-current-record.md`
- Modify: `docs/superpowers/plans/2026-07-25-cpc26001-owner-record-editorial.md`
- Verify: `content/instruments/CPC26001.test.ts`

**Interfaces:**

- Consumes: the approved structural-limit statement in `docs/superpowers/specs/2026-07-25-cpc26001-owner-record-editorial-design.md`.
- Produces: one unambiguous owner warning on `/sn/CPC26001` and consistent internal documentation for future edits.

- [ ] **Step 1: Replace the customer-facing string paragraph**

In `content/instruments/CPC26001.mdx`, replace:

```md
CPC26001 is set up for 9–42 strings. A 10–46 set is the heaviest recommended alternative without revisiting the instrument’s setup.
```

with:

```md
CPC26001 is designed for 9–42 strings. The plastic body is engineered for a maximum string load equivalent to a 10–46 set. Do not use heavier strings.
```

- [ ] **Step 2: Correct the remaining planning language**

In `docs/superpowers/specs/2026-07-25-cpc26001-coupeville-current-record-design.md`, replace `maximum recommended string weight: 10–46` with `structural maximum string weight: 10–46; the plastic body is not designed for heavier strings`.

In `docs/superpowers/plans/2026-07-25-cpc26001-coupeville-current-record.md`, replace the two remaining descriptions of 10–46 as a recommendation with language that identifies it as the plastic body's structural maximum.

In `docs/superpowers/plans/2026-07-25-cpc26001-owner-record-editorial.md`, replace the obsolete paragraph with the same exact customer-facing wording used in Step 1.

- [ ] **Step 3: Confirm obsolete implications are gone**

Run:

```bash
rg -n --glob '!2026-07-25-cpc26001-string-load-warning.md' "without revisiting|heaviest recommended alternative|maximum recommended string weight" content/instruments/CPC26001.mdx docs/superpowers/plans docs/superpowers/specs
```

Expected: no matches.

- [ ] **Step 4: Format and run focused verification**

Run:

```bash
npx prettier --write content/instruments/CPC26001.mdx docs/superpowers/specs/2026-07-25-cpc26001-coupeville-current-record-design.md docs/superpowers/plans/2026-07-25-cpc26001-coupeville-current-record.md docs/superpowers/plans/2026-07-25-cpc26001-owner-record-editorial.md docs/superpowers/plans/2026-07-25-cpc26001-string-load-warning.md
git diff --check
npx vitest run content/instruments/CPC26001.test.ts
```

Expected: formatting succeeds, `git diff --check` prints nothing, and the CPC26001 tests pass.

- [ ] **Step 5: Run the production build**

Run:

```bash
npm run build
```

Expected: build exits 0 and includes `/sn/CPC26001` and `/sn/CPC26001/print` in the generated route table.

- [ ] **Step 6: Review and commit directly to main**

Confirm the diff contains only the approved string-limit correction and aligned documentation, then run:

```bash
git add content/instruments/CPC26001.mdx docs/superpowers/specs/2026-07-25-cpc26001-coupeville-current-record-design.md docs/superpowers/plans/2026-07-25-cpc26001-coupeville-current-record.md docs/superpowers/plans/2026-07-25-cpc26001-owner-record-editorial.md docs/superpowers/plans/2026-07-25-cpc26001-string-load-warning.md
git commit -m "fix: clarify CPC26001 string load limit"
```
