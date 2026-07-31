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

## Project and governance candidates

### ZGDC-001 — Repository authority

**Statement:** The repository, rather than an AI's memory or conversation history, is the authoritative shared knowledge source.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

**Notes:** This is a cross-product authority rule. It depends on future canonical documents being discoverable by both humans and agents.

### ZGDC-002 — Decisions become artifacts

**Statement:** Durable decisions should become versioned artifacts rather than memories.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

**Notes:** This applies across the project. It establishes persistence but does not require every conversational remark to become an artifact.

### ZGDC-003 — Preserve engineering intent

**Statement:** The repository should preserve engineering intent—the reason behind a design—not only schematics, bills of materials, and procedures.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

**Notes:** This is cross-product and depends on design-intent sections and decision records carrying rationale close to the relevant work.

### ZGDC-004 — Start from established practice

**Statement:** Begin with industry-standard practice and require a strong justification for deviations.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

**Notes:** This is a cross-product decision heuristic, not a prohibition on experimentation.

### ZGDC-005 — Preserve musical personality

**Statement:** Preserve an instrument's musical personality over theoretical optimization.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

**Notes:** This applies to guitar design generally and depends on each design documenting its intended musical identity.

### ZGDC-006 — Player-intuitive controls

**Statement:** Favor controls that behave intuitively and as a player expects.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

**Notes:** This is cross-product. Product documentation should explain any intentional exception or unfamiliar interaction.

### ZGDC-007 — Measure and listen

**Statement:** Validate designs through both measurement and listening.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

**Notes:** This applies across guitar engineering. It depends on validation records preserving objective checks and listening notes preserving subjective outcomes without conflating the two.

### ZGDC-008 — Classify durable discoveries

**Statement:** New durable knowledge should be classified and proposed for an appropriate repository artifact instead of remaining tribal knowledge.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

**Notes:** This is cross-product. Classification is a review prompt, not a requirement to promote something from every conversation; discussion may remain discussion when it creates no durable knowledge.

## Documentation and drawing candidates

### ZGDC-009 — Intent before implementation

**Statement:** Every wiring package begins with design intent and musical goals before implementation detail.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** This is a candidate cross-product documentation requirement. The source described the wiring as an implementation of the instrument's musical idea.

### ZGDC-010 — Separate specification and assembly

**Statement:** A wiring specification describes what the design is; a separate assembly guide describes how to build it.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** This is cross-product. The separation allows physical parts or procedures to change without silently changing the electrical design.

### ZGDC-011 — Schematic purpose

**Statement:** Electrical schematics use conventional notation and optimize for understanding circuit operation rather than physical assembly.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** This is a cross-product drawing convention and complements, rather than replaces, a physical harness layout.

### ZGDC-012 — Harness-layout perspective

**Statement:** Harness layouts use a top view of the control cavity and show physical component placement, routing, and wire identifiers.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** This is a cross-product drawing convention. Product-specific cavity geometry remains in the relevant assembly documentation.

### ZGDC-013 — Canonical pot view

**Statement:** Individual pot diagrams use the canonical bottom view, looking directly at the solder lugs with the lugs facing the reader.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** The first generated pot view was reversed from what the owner saw at the bench. The owner clarified that the view must be from the underside of the mounted pot “with the lugs facing you,” and explicitly accepted the corrected wording. This correction is essential context for any future drawing standard.

### ZGDC-014 — Never mirror component drawings

**Statement:** Component drawings are never mirrored to match a particular installation.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** This is cross-product. A physical component may be rotated in an installation, but its canonical detail drawing retains one learned orientation.

### ZGDC-015 — Positional pot-lug language

**Statement:** Prefer positional pot-lug language tied to the explicit viewing convention when numeric lug conventions could be ambiguous.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** The owner accepted the clarified viewing phrase, and the conversation proposed left, center, and right as less ambiguous identifiers. The exact balance between positional labels and conventional numeric identifiers remains subject to the eventual drawing standard.

### ZGDC-016 — Name every wire

**Statement:** Name wires consistently so assembly and debugging can trace each connection.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** This is cross-product. The source offered names such as `N_HOT` and `BUS_GND` as examples, not an approved universal naming schema.

### ZGDC-017 — Bench-page presentation

**Statement:** Use one concept per figure or page, minimize crossed wires, provide white space and large labels, and make bench documents printable on US Letter without scaling.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** This is a cross-product presentation convention intended to produce readable service-manual-style bench documents.

### ZGDC-018 — Wiring-package contents

**Statement:** Wiring packages include overview, schematic, harness layout, component details, grounding, assembly sequence, validation, revision history, and design intent.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** This is a cross-product content baseline. The eventual standard should reconcile ordering and determine which sections may be omitted when they are genuinely inapplicable.

### ZGDC-019 — Validation and failure modes

**Statement:** Validation includes output-jack resistance ranges, continuity checks, tap tests, expected control behavior, and useful failure-mode guidance.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** This is cross-product in principle. Exact measurements and troubleshooting steps remain specific to a reference design or product.

### ZGDC-020 — Listening notes

**Statement:** Post-build listening notes record surprises, possible changes, strengths, useful settings or playing contexts, and compatible future modifications.

**Evidence:** Confirmed

**Proposed classification:** Listening note

**Notes:** This is a reusable product-documentation practice. Listening notes preserve subjective learning after construction and complement measured validation.

## Reusable-design and lifecycle candidates

### ZGDC-021 — Identify and revise reusable wiring designs

**Statement:** Reusable wiring designs receive canonical identities and explicit revisions.

**Evidence:** Confirmed

**Proposed classification:** Reference design

**Notes:** This is cross-product in intent. The conversation's example `RL-HAR-*` identifiers were illustrative and are not adopted as repository policy by this inventory.

### ZGDC-022 — Declare the design revision used

**Statement:** Product or instrument documentation identifies the exact reference-design revision used rather than duplicating the entire design.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** This is a cross-product anti-duplication rule. It depends on reference designs having stable identities, revisions, and accessible canonical records.

### ZGDC-023 — Separate knowledge classes

**Statement:** Standards contain stable cross-product rules; reusable solutions belong in reference designs; consequential rationale belongs in decision records; product discoveries belong in product documentation or listening notes.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

**Notes:** This is cross-product. Its terms must be reconciled with the repository's existing Coupeville model, Relay voicing, wiring, and serialized-instrument structures before promotion.

### ZGDC-024 — Separate rules from examples

**Statement:** Standards distinguish requirements, recommendations, and examples so an example is not mistaken for a rule.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** This is cross-product and protects future contributors from promoting an illustrative value or layout into a mandatory convention.

### ZGDC-025 — Decision-record contents

**Statement:** Significant decisions record status, context, decision, consequences, and references.

**Evidence:** Confirmed

**Proposed classification:** Engineering standard

**Notes:** This is a candidate cross-product requirement for consequential decision records. The exact metadata format remains a later design concern.

### ZGDC-026 — Knowledge lifecycle states

**Statement:** Candidate knowledge may move through Draft, Experimental, Validated, Approved, and Deprecated states.

**Evidence:** Confirmed

**Proposed classification:** Unresolved question

**Notes:** The owner accepted the lifecycle concept, but the source did not resolve which artifact types use every state, who approves transitions, or whether a single linear sequence fits standards, reference designs, decisions, and product documentation equally well.

### ZGDC-027 — Engineering knowledge cycle

**Statement:** Engineering learning follows an observe, experiment, measure, listen, decide, document, reuse, and teach cycle.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

**Notes:** This is a cross-product description of how knowledge matures. It is guidance rather than a required workflow for every small change.

## Repository workflow and structure candidates

### ZGDC-028 — Harvest before final architecture

**Statement:** Harvest conversations into persistent intermediate artifacts before designing or populating the final knowledge hierarchy.

**Evidence:** Corrected

**Proposed classification:** Project or governance principle

**Notes:** The conversation first recommended building governance and directory structure before harvesting prior decisions. After the owner identified the risk of forcing unknown knowledge into premature categories—and then identified that an unwritten inventory would be lost—the recommendation was corrected to persistent source inventories plus a decision ledger before final architecture.

### ZGDC-029 — Source inventories and consolidated ledger

**Statement:** Preserve one source inventory per conversation and maintain a consolidated decision ledger.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

**Notes:** This is a cross-product extraction practice. Individual inventories preserve provenance; the ledger supports deduplication, conflict detection, review, and promotion.

### ZGDC-030 — Small reviewable changes

**Statement:** Use small, reviewable changes for extraction, governance, standards, templates, and migration rather than one large refactor.

**Evidence:** Confirmed

**Proposed classification:** Project or governance principle

**Notes:** This applies across the knowledge-system effort. The proposed example sequence was illustrative; actual boundaries should follow independently reviewable artifacts.

### ZGDC-031 — Example top-level hierarchies

**Statement:** Create separate top-level engineering and products hierarchies matching the examples in the conversation.

**Evidence:** Proposed

**Proposed classification:** Unresolved question

**Notes:** Literal adoption was never confirmed. This repository already uses `docs/`, `content/coupeville/models/`, `content/relay/voicings/`, `content/relay/wiring/`, and `content/instruments/`, governed in part by `docs/architecture/site-organization.md`. Any final structure must complement those authorities rather than create a competing public product hierarchy.

### ZGDC-032 — Separate universal AI contribution file

**Statement:** Add a separate root `AI_CONTRIBUTING.md` as the universal agent entry point.

**Evidence:** Proposed

**Proposed classification:** Unresolved question

**Notes:** Literal adoption was never confirmed. The repository already has automatically discovered `AGENTS.md` and `CLAUDE.md`; a shared canonical engineering front door referenced by both may avoid a third duplicated instruction source.

## Product-specific observations

The source contains zebrawood-build facts and candidate wiring choices, including Mini ProBucker measurements, independent-volume behavior, treble-bleed values, partial-split proposals, finish advice, and weight decisions. These may be valuable to a future product record, reference design, or serialized-instrument record, but they are not extracted as cross-product standards in this phase.

## Explicit exclusions

- Generated images, diagrams, and sandbox download links that are not durable repository assets.
- Assistant predictions about how the guitar will sound or which settings the owner will prefer.
- Implementation examples not explicitly accepted as naming or directory policy.
- Private ChatGPT memory operations that cannot provide repository-wide agent instructions.
