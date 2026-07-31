# Guitar Engineering Knowledge Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the durable guitar-documentation decisions from the reviewed ChatGPT conversation as traceable, reviewable extraction artifacts without promoting them into repository policy.

**Architecture:** Add a deliberately limited staging area under `docs/engineering/extraction/`. One source inventory preserves provenance and records each candidate decision with an evidence label; one decision ledger provides the cross-source consolidation view; a short README defines how the staging area is used. No standards, reference designs, templates, published content, or agent instructions change in this phase.

**Tech Stack:** Markdown, Git, ripgrep, repository documentation conventions

## Global Constraints

- The repository is the eventual source of truth, but extracted candidates are not policy until reviewed and promoted.
- Create only `docs/engineering/extraction/README.md`, `docs/engineering/extraction/decision-ledger.md`, and `docs/engineering/extraction/sources/2026-07-30-zebrawood-guitar-documentation-conversation.md`.
- Do not create engineering standards, reference designs, decision records, templates, or other governance documents.
- Do not modify `AGENTS.md`, `CLAUDE.md`, `docs/architecture/site-organization.md`, published `content/`, routes, navigation, or serialized-instrument behavior.
- Preserve the existing distinctions among Coupeville models, Relay voicings, wiring documents, and serialized instruments; do not normalize those terms during extraction.
- Use only these evidence labels: `Confirmed`, `Corrected`, `Proposed`, `Observed`, and `Unresolved`.
- Every ledger entry must link to a source-inventory decision ID; every source-inventory decision must have a proposed classification or explicitly say `Discussion only`.
- Product-specific component values and construction advice must not be represented as cross-product standards.
- Leave genuinely ambiguous matters unresolved instead of inventing policy.
- The source conversation is `https://chatgpt.com/share/6a6c1c84-dd40-83e8-9c10-42f2d7d2ffe6`, titled “Zebrawood Guitar Finish Tips,” reviewed on 2026-07-30.

---

## File Structure

- `docs/engineering/extraction/README.md`: Defines the temporary extraction layer, evidence labels, entry requirements, promotion rule, and scope boundaries.
- `docs/engineering/extraction/sources/2026-07-30-zebrawood-guitar-documentation-conversation.md`: Preserves source metadata and the complete decision inventory for the reviewed conversation.
- `docs/engineering/extraction/decision-ledger.md`: Provides a compact, cross-source list of candidate knowledge, classifications, statuses, conflicts, and open questions.

### Task 1: Define the extraction staging area

**Files:**
- Create: `docs/engineering/extraction/README.md`

**Interfaces:**
- Consumes: The authority, extraction, and classification rules in `docs/superpowers/specs/2026-07-30-guitar-engineering-knowledge-design.md`.
- Produces: The canonical format and evidence vocabulary used by the source inventory and decision ledger in Tasks 2 and 3.

- [ ] **Step 1: Create the extraction README**

Create `docs/engineering/extraction/README.md` with these exact sections and requirements:

```markdown
# Engineering Knowledge Extraction

This directory contains persistent intermediate artifacts harvested from source conversations. Its contents preserve candidate knowledge and provenance; they are not engineering policy.

## Scope

- `sources/` contains one inventory per reviewed source.
- `decision-ledger.md` consolidates candidates across sources.
- Canonical standards, reference designs, decision records, and product documentation live outside this directory after review and promotion.

## Evidence labels

- **Confirmed:** Explicitly accepted by the owner.
- **Corrected:** An earlier proposal was superseded later in the source.
- **Proposed:** Suggested but not explicitly accepted.
- **Observed:** Factual or contextual material that is not itself a decision.
- **Unresolved:** Requires owner review or supporting evidence.

## Required source entry fields

Every candidate decision records:

- a stable source-local ID;
- a concise statement;
- its evidence label;
- source evidence or conversational context;
- a proposed classification;
- conflicts, corrections, or dependencies when applicable.

## Classification vocabulary

- Project or governance principle
- Engineering standard
- Reference design
- Design decision
- Platform, model, or voicing documentation
- Serialized-instrument documentation
- Listening note
- Unresolved question
- Discussion only

## Promotion rule

Extraction is not adoption. A candidate becomes authoritative only through an explicitly reviewed change to its canonical destination. Promotion must preserve a link back to the source inventory.

## Editing rules

- Preserve the source's terminology during extraction.
- Separate cross-product conventions from product-specific facts.
- Record contradictions and corrections instead of silently choosing one.
- Do not infer owner approval from an assistant's confidence.
- Do not delete source inventories merely because their contents have been promoted.
```

- [ ] **Step 2: Verify required boundaries and vocabulary**

Run:

```bash
rg -n "not engineering policy|Confirmed|Corrected|Proposed|Observed|Unresolved|Extraction is not adoption|Preserve the source's terminology" docs/engineering/extraction/README.md
```

Expected: every phrase appears once in the relevant section, and all five evidence labels are defined.

- [ ] **Step 3: Check Markdown and whitespace**

Run:

```bash
git diff --check
```

Expected: no output and exit status 0.

- [ ] **Step 4: Commit the staging-area contract**

```bash
git add docs/engineering/extraction/README.md
git commit -m "docs: define engineering knowledge extraction"
```

### Task 2: Inventory the reviewed conversation

**Files:**
- Create: `docs/engineering/extraction/sources/2026-07-30-zebrawood-guitar-documentation-conversation.md`

**Interfaces:**
- Consumes: Evidence labels and classifications from `docs/engineering/extraction/README.md`; the reviewed shared conversation; boundaries from the approved design spec.
- Produces: Source-local candidate IDs `ZGDC-001` through `ZGDC-032`, referenced by the decision ledger in Task 3.

- [ ] **Step 1: Add source metadata and extraction notes**

Begin the source inventory with:

```markdown
# Zebrawood Guitar Documentation Conversation — Decision Inventory

## Source

- **Title:** Zebrawood Guitar Finish Tips
- **Shared conversation:** <https://chatgpt.com/share/6a6c1c84-dd40-83e8-9c10-42f2d7d2ffe6>
- **Reviewed:** 2026-07-30
- **Scope:** Guitar wiring-documentation conventions, engineering-knowledge governance, reusable harness documentation, and transfer of durable decisions from AI conversations into the repository.

## Extraction notes

- This inventory records durable candidates; it does not make them policy.
- Repeated owner replies of “Agreed” confirm the immediately preceding proposal unless a later correction supersedes it.
- The conversation also contains product-specific zebrawood construction and wiring decisions. Those are excluded from cross-product candidates and summarized separately as product-specific observations.
- ChatGPT first claimed that arbitrary agents could inherit saved memory, then corrected that claim. The corrected conclusion is that repository artifacts—not AI memory—must carry shared knowledge.
```

- [ ] **Step 2: Add confirmed project and governance candidates**

Add entries `ZGDC-001` through `ZGDC-008`. Each entry must use subheadings `Statement`, `Evidence`, `Proposed classification`, and `Notes`.

| ID | Statement | Evidence | Proposed classification |
|---|---|---|---|
| ZGDC-001 | The repository, rather than an AI's memory or conversation history, is the authoritative shared knowledge source. | Confirmed | Project or governance principle |
| ZGDC-002 | Durable decisions should become versioned artifacts rather than memories. | Confirmed | Project or governance principle |
| ZGDC-003 | The repository should preserve engineering intent—the reason behind a design—not only schematics, bills of materials, and procedures. | Confirmed | Project or governance principle |
| ZGDC-004 | Begin with industry-standard practice and require a strong justification for deviations. | Confirmed | Project or governance principle |
| ZGDC-005 | Preserve an instrument's musical personality over theoretical optimization. | Confirmed | Project or governance principle |
| ZGDC-006 | Favor controls that behave intuitively and as a player expects. | Confirmed | Project or governance principle |
| ZGDC-007 | Validate designs through both measurement and listening. | Confirmed | Project or governance principle |
| ZGDC-008 | New durable knowledge should be classified and proposed for an appropriate repository artifact instead of remaining tribal knowledge. | Confirmed | Project or governance principle |

For every `Notes` subsection, explain whether the candidate is cross-product and identify any dependency. `ZGDC-008` must note that not every conversation requires promotion.

- [ ] **Step 3: Add confirmed documentation and drawing candidates**

Add entries `ZGDC-009` through `ZGDC-020` using the same four subheadings.

| ID | Statement | Evidence | Proposed classification |
|---|---|---|---|
| ZGDC-009 | Every wiring package begins with design intent and musical goals before implementation detail. | Confirmed | Engineering standard |
| ZGDC-010 | A wiring specification describes what the design is; a separate assembly guide describes how to build it. | Confirmed | Engineering standard |
| ZGDC-011 | Electrical schematics use conventional notation and optimize for understanding circuit operation rather than physical assembly. | Confirmed | Engineering standard |
| ZGDC-012 | Harness layouts use a top view of the control cavity and show physical component placement, routing, and wire identifiers. | Confirmed | Engineering standard |
| ZGDC-013 | Individual pot diagrams use the canonical bottom view, looking directly at the solder lugs with the lugs facing the reader. | Confirmed | Engineering standard |
| ZGDC-014 | Component drawings are never mirrored to match a particular installation. | Confirmed | Engineering standard |
| ZGDC-015 | Prefer positional pot-lug language tied to the explicit viewing convention when numeric lug conventions could be ambiguous. | Confirmed | Engineering standard |
| ZGDC-016 | Name wires consistently so assembly and debugging can trace each connection. | Confirmed | Engineering standard |
| ZGDC-017 | Use one concept per figure or page, minimize crossed wires, provide white space and large labels, and make bench documents printable on US Letter without scaling. | Confirmed | Engineering standard |
| ZGDC-018 | Wiring packages include overview, schematic, harness layout, component details, grounding, assembly sequence, validation, revision history, and design intent. | Confirmed | Engineering standard |
| ZGDC-019 | Validation includes output-jack resistance ranges, continuity checks, tap tests, expected control behavior, and useful failure-mode guidance. | Confirmed | Engineering standard |
| ZGDC-020 | Post-build listening notes record surprises, possible changes, strengths, useful settings or playing contexts, and compatible future modifications. | Confirmed | Listening note |

`ZGDC-013` must cite the correction sequence in which the first generated view was reversed, the owner clarified “with the lugs facing you,” and the final wording was accepted. `ZGDC-015` must state that the exact balance between positional and numeric identifiers remains subject to the eventual drawing standard.

- [ ] **Step 4: Add reusable-design and lifecycle candidates**

Add entries `ZGDC-021` through `ZGDC-027` using the same four subheadings.

| ID | Statement | Evidence | Proposed classification |
|---|---|---|---|
| ZGDC-021 | Reusable wiring designs receive canonical identities and explicit revisions. | Confirmed | Reference design |
| ZGDC-022 | Product or instrument documentation identifies the exact reference-design revision used rather than duplicating the entire design. | Confirmed | Engineering standard |
| ZGDC-023 | Standards contain stable cross-product rules; reusable solutions belong in reference designs; consequential rationale belongs in decision records; product discoveries belong in product documentation or listening notes. | Confirmed | Project or governance principle |
| ZGDC-024 | Standards distinguish requirements, recommendations, and examples so an example is not mistaken for a rule. | Confirmed | Engineering standard |
| ZGDC-025 | Significant decisions record status, context, decision, consequences, and references. | Confirmed | Engineering standard |
| ZGDC-026 | Candidate knowledge may move through Draft, Experimental, Validated, Approved, and Deprecated states. | Confirmed | Unresolved question |
| ZGDC-027 | Engineering learning follows an observe, experiment, measure, listen, decide, document, reuse, and teach cycle. | Confirmed | Project or governance principle |

`ZGDC-021` must not adopt the conversation's example `RL-HAR-*` identifiers as policy. `ZGDC-026` must explain that the lifecycle concept was accepted but the exact applicability and transition rules remain unresolved.

- [ ] **Step 5: Record corrected, proposed, and unresolved repository-structure candidates**

Add entries `ZGDC-028` through `ZGDC-032` using the same four subheadings.

| ID | Statement | Evidence | Proposed classification |
|---|---|---|---|
| ZGDC-028 | Harvest conversations into persistent intermediate artifacts before designing or populating the final knowledge hierarchy. | Corrected | Project or governance principle |
| ZGDC-029 | Preserve one source inventory per conversation and maintain a consolidated decision ledger. | Confirmed | Project or governance principle |
| ZGDC-030 | Use small, reviewable changes for extraction, governance, standards, templates, and migration rather than one large refactor. | Confirmed | Project or governance principle |
| ZGDC-031 | Create separate top-level engineering and products hierarchies matching the examples in the conversation. | Proposed | Unresolved question |
| ZGDC-032 | Add a separate root `AI_CONTRIBUTING.md` as the universal agent entry point. | Proposed | Unresolved question |

`ZGDC-028` must preserve the correction: the conversation first recommended building repository governance before harvesting, then reversed that advice after the owner identified the risk of losing decisions. `ZGDC-031` and `ZGDC-032` must note the current repository structures that make literal adoption inappropriate without further review.

- [ ] **Step 6: Add product-specific observations and explicit exclusions**

Add a `## Product-specific observations` section stating that the source contains zebrawood-build facts and candidate wiring choices—including Mini ProBucker measurements, independent volumes, treble-bleed values, partial-split proposals, finish advice, and weight decisions—but these are not extracted as cross-product standards in this phase.

Add a `## Explicit exclusions` section listing:

- generated images, diagrams, and sandbox download links that are not durable repository assets;
- assistant predictions about how the guitar will sound or which settings the owner will prefer;
- implementation examples not explicitly accepted as naming or directory policy;
- private ChatGPT memory operations that cannot provide repository-wide agent instructions.

- [ ] **Step 7: Verify inventory completeness and labels**

Run:

```bash
for id in {001..032}; do rg -q "ZGDC-${id}" docs/engineering/extraction/sources/2026-07-30-zebrawood-guitar-documentation-conversation.md || exit 1; done
```

Expected: exit status 0.

Run:

```bash
rg -c '^### ZGDC-' docs/engineering/extraction/sources/2026-07-30-zebrawood-guitar-documentation-conversation.md
```

Expected: `32`.

Run:

```bash
rg -n '^\*\*Evidence:\*\* (Confirmed|Corrected|Proposed|Observed|Unresolved)$' docs/engineering/extraction/sources/2026-07-30-zebrawood-guitar-documentation-conversation.md
```

Expected: 32 matching lines, one for each candidate.

- [ ] **Step 8: Check Markdown and commit the source inventory**

Run:

```bash
git diff --check
```

Expected: no output and exit status 0.

```bash
git add docs/engineering/extraction/sources/2026-07-30-zebrawood-guitar-documentation-conversation.md
git commit -m "docs: inventory guitar documentation decisions"
```

### Task 3: Create the consolidated decision ledger

**Files:**
- Create: `docs/engineering/extraction/decision-ledger.md`

**Interfaces:**
- Consumes: Candidate IDs `ZGDC-001` through `ZGDC-032` and their evidence/classification fields from Task 2.
- Produces: The review and consolidation index future source inventories and promotion work will update.

- [ ] **Step 1: Create the ledger overview and status vocabulary**

Begin the ledger with:

```markdown
# Engineering Decision Ledger

This ledger consolidates candidate knowledge from reviewed sources. It is an extraction index, not an engineering standard. Canonical documents become authoritative only after explicit review and promotion.

## Ledger status

- **Awaiting review:** Extracted but not yet accepted for promotion.
- **Needs resolution:** A correction, conflict, classification, or terminology question requires owner input.
- **Ready to promote:** Reviewed and assigned to a canonical destination.
- **Promoted:** Incorporated into a canonical artifact with a recorded destination.
- **Not promoted:** Reviewed and intentionally retained only as source context.

## Sources

- [ZGDC — Zebrawood Guitar Documentation Conversation](sources/2026-07-30-zebrawood-guitar-documentation-conversation.md)
```

- [ ] **Step 2: Add the candidate table**

Add `## Candidates` with a table containing exactly these columns:

```markdown
| Candidate | Summary | Evidence | Proposed classification | Ledger status | Canonical destination |
|---|---|---|---|---|---|
```

Add one row for every candidate `ZGDC-001` through `ZGDC-032`. Link each candidate ID to its anchor in the source inventory. Use the source statement in shortened form without changing its meaning.

Set ledger statuses as follows:

- `Needs resolution`: `ZGDC-015`, `ZGDC-026`, `ZGDC-031`, and `ZGDC-032`.
- `Awaiting review`: all other candidates.
- `Canonical destination`: `—` for every row in this phase.

- [ ] **Step 3: Add consolidation and open-question sections**

Add these sections after the table:

```markdown
## Consolidation notes

- ZGDC-001, ZGDC-002, and ZGDC-003 overlap but are not duplicates: they separately establish authority, artifact persistence, and preservation of rationale.
- ZGDC-009 through ZGDC-020 are likely to inform one guitar-documentation standard, but no standard exists yet.
- ZGDC-021 and ZGDC-022 distinguish reusable design identity from a product's declaration of the revision it uses.
- ZGDC-023 defines classification boundaries and should be reconciled with the repository's existing content terminology before promotion.
- ZGDC-028 supersedes the earlier sequence that designed governance before harvesting conversations.

## Open questions

1. Should eventual documents use ES/RD/DD identifiers, descriptive filenames, or both?
2. Should positional pot-lug names supplement or replace numeric lug identifiers?
3. Which lifecycle states apply to standards, reference designs, decisions, and product documentation, and what transitions require owner approval?
4. How should “model,” “voicing,” “platform,” “product,” and “serialized instrument” be defined without disrupting existing site terminology?
5. Should the existing `AGENTS.md` and `CLAUDE.md` point to a shared engineering front door, avoiding a separate `AI_CONTRIBUTING.md`?
6. Which zebrawood wiring decisions belong in a future product record, reference design, or serialized-instrument record?

## Promotion log

No candidates have been promoted.
```

- [ ] **Step 4: Verify ledger coverage and unresolved statuses**

Run:

```bash
for id in {001..032}; do rg -q "ZGDC-${id}" docs/engineering/extraction/decision-ledger.md || exit 1; done
```

Expected: exit status 0.

Run:

```bash
rg -c '^\| \[ZGDC-' docs/engineering/extraction/decision-ledger.md
```

Expected: `32`.

Run:

```bash
rg '^\| \[ZGDC-(015|026|031|032)\].*\| Needs resolution \| — \|$' docs/engineering/extraction/decision-ledger.md
```

Expected: four matching rows.

- [ ] **Step 5: Verify phase boundaries**

Run:

```bash
git status --short
```

Expected: only the three files named in Global Constraints are new or modified during implementation.

Run:

```bash
find docs/engineering -type f | sort
```

Expected:

```text
docs/engineering/extraction/README.md
docs/engineering/extraction/decision-ledger.md
docs/engineering/extraction/sources/2026-07-30-zebrawood-guitar-documentation-conversation.md
```

- [ ] **Step 6: Check Markdown and commit the ledger**

Run:

```bash
git diff --check
```

Expected: no output and exit status 0.

```bash
git add docs/engineering/extraction/decision-ledger.md
git commit -m "docs: add engineering decision ledger"
```

### Task 4: Final extraction audit

**Files:**
- Verify: `docs/engineering/extraction/README.md`
- Verify: `docs/engineering/extraction/decision-ledger.md`
- Verify: `docs/engineering/extraction/sources/2026-07-30-zebrawood-guitar-documentation-conversation.md`

**Interfaces:**
- Consumes: All artifacts from Tasks 1 through 3.
- Produces: A verified extraction phase ready for owner review, not automatic promotion.

- [ ] **Step 1: Verify no placeholders or deferred implementation language**

Run:

```bash
rg -n 'T[B]D|T[O]DO|PLACEH[O]LDER|fill i[n]|implement late[r]|similar to Tas[k]' docs/engineering/extraction
```

Expected: no output and exit status 1 because no prohibited placeholders exist.

- [ ] **Step 2: Verify source-to-ledger traceability**

Run:

```bash
for id in {001..032}; do rg -q "^### ZGDC-${id}" docs/engineering/extraction/sources/2026-07-30-zebrawood-guitar-documentation-conversation.md && rg -q "\[ZGDC-${id}\]" docs/engineering/extraction/decision-ledger.md || exit 1; done
```

Expected: exit status 0.

- [ ] **Step 3: Verify prohibited repository areas are unchanged by this phase**

Run:

```bash
git diff HEAD~3 --name-only
```

Expected: exactly the three extraction files. If the execution started with unrelated user changes or a different commit count, compare against the implementation starting commit instead and confirm that this plan changed only the three permitted paths.

- [ ] **Step 4: Review the rendered content manually**

Read all three files in order:

1. `docs/engineering/extraction/README.md`
2. `docs/engineering/extraction/sources/2026-07-30-zebrawood-guitar-documentation-conversation.md`
3. `docs/engineering/extraction/decision-ledger.md`

Confirm:

- the README never describes extracted candidates as policy;
- all 32 source entries are understandable without opening the original chat;
- corrected advice is visibly marked rather than silently replaced;
- product-specific details are not generalized into standards;
- the ledger's four `Needs resolution` entries and six open questions are explicit;
- no canonical destination is assigned prematurely.

- [ ] **Step 5: Record the verified state**

Run:

```bash
git status --short
git log -3 --oneline
```

Expected: a clean working tree and three focused extraction commits, one for each artifact boundary.

Do not promote any candidate or create any additional file until the owner reviews the extraction artifacts.
