# Instrument Record Authoring Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Create a repository-local skill that allocates the next contiguous serial and safely authors or updates unlisted instrument MDX records and printable case cards.

**Architecture:** Keep editorial orchestration in a concise `SKILL.md`, detailed project contracts in one on-demand reference, and fragile sequence allocation in a dependency-free Node script. The script reads the repository registry and instrument filenames without modifying them; existing application validation and routes remain the source of truth for rendering.

**Tech Stack:** Agent Skills, Markdown, Node.js 20 ESM, Next.js 15, Content Collections, MDX, Vitest.

## Global Constraints

- Create the skill at `.agents/skills/author-instrument-record/`.
- Determine the serial from family and completion year; never ask the user to select `NNN`.
- Require exactly contiguous family/year sequences beginning at `001`; never skip around a missing record.
- Request explicit approval before adding a family code.
- Preserve `REX` as Relay Example, `RLY` for real sold Relay prototypes, and `CVL` for all Coupeville submodels within a completion year.
- Preserve `noindex, nofollow`, sitemap exclusion, and absence from navigation, catalogs, and public indexes.
- Keep exact-instrument photos on the web record and off the case card.
- Keep sales, price, availability, private ownership history, and authenticity claims outside permanent records.
- Keep manual instructions in `content/instruments/README.md` while making the skill the recommended path.

---

### Task 1: Deterministic Serial Allocator

**Files:**

- Create: `.agents/skills/author-instrument-record/scripts/allocate-serial.mjs`
- Create: `.agents/skills/author-instrument-record/scripts/allocate-serial.test.mjs`

**Interfaces:**

- Consumes: `--root <repository> --family <MMM> --completed <YYYY|YYYY-MM-DD>`.
- Produces: one canonical `MMMYYNNN` serial on stdout and a nonzero exit with a specific message on invalid input or sequence state.

- [x] **Step 1: Write executable failing scenarios**

Create isolated temporary repositories containing a minimal `config/instrument-model-codes.ts` and `content/instruments/` directory. Assert allocation of `CVL26001` for an empty 2026 sequence and `CVL26003` after `CVL26001` and `CVL26002`. Assert rejection of unknown families, malformed dates, and a sequence containing `001` and `003` without `002`.

- [x] **Step 2: Run the scenarios and verify RED**

Run: `node --test .agents/skills/author-instrument-record/scripts/allocate-serial.test.mjs`

Expected: FAIL because `allocate-serial.mjs` does not exist.

- [x] **Step 3: Implement the read-only allocator**

Parse named arguments, resolve the repository root, read family keys from `config/instrument-model-codes.ts`, validate the completion value, scan uppercase `.mdx` filenames, parse matching family/year indices, sort them, require each value to equal its one-based position, and print the next serial padded to three digits. Reject allocation beyond `999`.

- [x] **Step 4: Run the scenarios and verify GREEN**

Run: `node --test .agents/skills/author-instrument-record/scripts/allocate-serial.test.mjs`

Expected: all allocator scenarios pass.

### Task 2: Skill Package

**Files:**

- Create: `.agents/skills/author-instrument-record/SKILL.md`
- Create: `.agents/skills/author-instrument-record/references/instrument-record-contract.md`
- Create: `.agents/skills/author-instrument-record/agents/openai.yaml`

**Interfaces:**

- Consumes: user-provided instrument facts, current repository schema/components/policy, and the allocator output.
- Produces: one draft or updated MDX record, exact-image directory, focused content test, and verified case card without discoverability changes.

- [x] **Step 1: Initialize the skill package**

Run the official `init_skill.py` with `--resources scripts,references` and UI fields for `Instrument Record Author`, a 25–64 character description, and a default prompt explicitly invoking `$author-instrument-record`. Preserve the Task 1 scenario file when initializing.

- [x] **Step 2: Write the on-demand contract reference**

Document canonical source paths, family semantics, strict component cardinality, content exclusions, image rules, discoverability invariants, publish behavior, and exact automated/rendered verification gates. Point agents to live implementation files instead of duplicating full component APIs.

- [x] **Step 3: Write the concise skill workflow**

Use imperative instructions. Require inspection before edits, one-at-a-time questions for missing required facts, explicit approval for registry additions, allocator use, draft-first authoring, focused tests, and completion only after every verification gate. State that sequence gaps must be represented by records rather than bypassed.

- [x] **Step 4: Validate package structure**

Run: `python3 /Users/rhy/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/author-instrument-record`

Expected: `Skill is valid!`

### Task 3: Authoring Guidance and Verification

**Files:**

- Modify: `content/instruments/README.md`
- Modify: `docs/todos/instrument-record-skill.md`

**Interfaces:**

- Produces: skill-first guidance plus a complete transparent manual fallback.

- [x] **Step 1: Update author guidance**

Recommend `$author-instrument-record` first. Retain manual steps for selecting the next contiguous serial, obtaining family-code approval, creating exact images and MDX, adding a focused test, checking metadata/sitemap/navigation invariants, reviewing web and print output, scanning QR, and publishing explicitly.

- [x] **Step 2: Mark the tracked future task complete**

Replace the future-task framing with a concise completion note linking the skill and durable design.

- [x] **Step 3: Run formatter and focused checks**

Run the allocator tests, skill validator, relevant instrument/discoverability Vitest files, and `git diff --check`.

- [x] **Step 4: Run full verification**

Run `npx vitest run` and `npm run build`. Confirm generated sitemaps contain no `/sn/` URLs and the build emits `CVL26001`, `PRS26001`, and `RLY26001` record/print routes.

- [x] **Step 5: Commit**

Stage the skill package, authoring guidance, completed task note, and implementation plan. Commit with `feat: add instrument record authoring skill`.
