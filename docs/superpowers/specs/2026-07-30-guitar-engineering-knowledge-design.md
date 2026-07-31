# Guitar Engineering Knowledge System

## Purpose

Create a durable, tool-independent knowledge system for documenting K7RHY guitar models and their supporting engineering work. The repository—not an AI conversation or an agent's memory—will be the authoritative source.

The first implementation phase is knowledge extraction. It will preserve decisions from prior conversations as reviewable intermediate artifacts before those decisions are promoted into standards, reference designs, decision records, or published model documentation.

## Existing Context

The repository already separates several kinds of guitar content:

- `content/coupeville/models/` describes Coupeville models.
- `content/relay/voicings/` describes Relay voicings.
- `content/relay/wiring/` contains Relay wiring documentation.
- `content/instruments/` contains permanent, unlisted serial-number records.
- `docs/architecture/site-organization.md` governs public information architecture, commerce boundaries, and serialized instruments.
- `AGENTS.md` and `CLAUDE.md` provide tool-specific repository instructions.

The knowledge system must complement these structures rather than replace them with a competing product hierarchy.

## Design Principles

1. The repository is the source of truth.
2. Preserve engineering intent, not only finished artifacts.
3. Extract knowledge before designing its final classification and location.
4. Separate durable rules from examples and product-specific values.
5. Reference reusable knowledge instead of duplicating it.
6. Keep published site content separate from internal engineering governance.
7. Prefer small, reviewable changes over a large documentation migration.
8. Do not invent policy when evidence is incomplete; record an open question instead.

## Proposed Structure

```text
docs/
├── architecture/
│   └── site-organization.md
└── engineering/
    ├── README.md
    ├── guitar-documentation-standard.md
    ├── knowledge-index.md
    ├── decisions/
    ├── reference-designs/
    ├── templates/
    └── extraction/
        ├── decision-ledger.md
        └── sources/
```

This is the target shape, not the scope of the first implementation. Directories should be added only when they have reviewed content to contain.

### Automatically discovered instructions

`AGENTS.md` and `CLAUDE.md` remain the entry points for their respective agents. Once the canonical engineering documents exist, both files will point to the same shared instructions rather than duplicate those instructions in tool-specific prose.

Do not add a third root-level AI contribution guide unless a later need cannot be met by this arrangement.

### Engineering front door

`docs/engineering/README.md` will define:

- the purpose and scope of the engineering knowledge system;
- the authority order between standards, decisions, reference designs, and product records;
- the classification workflow for new knowledge;
- how exceptions are documented;
- terminology shared by agents and human contributors.

### Knowledge index

`docs/engineering/knowledge-index.md` will map each engineering topic to its authoritative source. It is a navigation aid, not another copy of the underlying documentation.

### Engineering standards

Standards contain stable, cross-product requirements and recommendations. Product-specific electrical values, example harnesses, and historical rationale do not belong in a standard.

The initial guitar documentation standard is expected to include the decisions confirmed in the reviewed conversation:

- design intent precedes implementation;
- wiring specifications are separate from assembly guides;
- diagrams use explicit, consistent viewing conventions;
- pot details use a canonical bottom view, looking directly at the solder lugs with the lugs facing the reader;
- component drawings are never mirrored for a particular installation;
- harness layouts use a top view of the control cavity;
- electrical schematics use conventional electronic notation;
- figures favor one concept per page, clear wire names, readable labels, white space, and printable service-manual presentation;
- wiring packages cover design intent, overview, specification, schematic, harness layout, component details, grounding, assembly, validation, revision history, and listening notes.

### Reference designs

Reference designs describe reusable, revisioned engineering solutions such as a validated wiring harness. A product or serialized instrument may identify the exact reference-design revision it uses without copying the full design.

### Decision records

Decision records preserve consequential rationale: context, decision, consequences, status, and references. They explain why a choice was made without turning that choice into a universal rule.

### Published content

Public model, voicing, wiring, and instrument content remains in the existing `content/` hierarchy. Its terminology and routes must continue to follow `docs/architecture/site-organization.md`.

## Knowledge Classification

When durable knowledge is discovered, classify it as one of:

- project or governance principle;
- engineering standard;
- reference design;
- design decision;
- platform, model, or voicing documentation;
- serialized-instrument documentation;
- listening note;
- unresolved question;
- discussion only, requiring no repository artifact.

Classification is a proposal during extraction. Promotion into a canonical document requires review.

## Extraction Artifacts

The first implementation phase creates only the extraction area and the inventory for the reviewed ChatGPT conversation.

Each source inventory should include:

- source title, date, and stable link when available;
- scope and provenance;
- individually identifiable candidate decisions;
- the evidence level for each decision;
- proposed classification;
- conflicts, corrections, duplicates, and open questions;
- product-specific facts kept separate from cross-product conventions.

Use these evidence labels:

- **Confirmed:** explicitly accepted by the owner.
- **Corrected:** an earlier proposal was superseded later in the conversation.
- **Proposed:** suggested by an assistant but not explicitly accepted.
- **Observed:** factual or contextual material that may inform documentation but is not a decision.
- **Unresolved:** requires owner review or supporting evidence.

The decision ledger summarizes the source inventories and tracks consolidation. It must link back to the source inventory so provenance is not lost.

Extraction files are persistent intermediate artifacts. Their eventual retention or archival will be decided after migration; they should not be deleted merely because Git history contains an earlier copy.

## Authority Order

Agents should consult documents in this order when the task concerns guitar engineering documentation:

1. `AGENTS.md` or `CLAUDE.md`
2. `docs/architecture/site-organization.md` when its stated scope applies
3. `docs/engineering/README.md`
4. `docs/engineering/knowledge-index.md`
5. applicable engineering standards
6. applicable reference designs and decision records
7. platform, model, voicing, wiring, or serialized-instrument content

A lower-level artifact may depart from a standard only when the exception and its rationale are explicit.

## Migration Sequence

1. Create the extraction directory, a decision ledger, and an inventory for the reviewed conversation.
2. Review existing Coupeville, Relay, wiring, and serialized-instrument content against that inventory.
3. Harvest additional conversations one at a time.
4. Consolidate duplicates, corrections, conflicts, and terminology questions.
5. Approve the final engineering-document architecture based on the harvested knowledge.
6. Add the engineering front door and knowledge index.
7. Promote stable rules into the guitar documentation standard.
8. Add decision records, reference designs, and templates only as needed.
9. Update `AGENTS.md` and `CLAUDE.md` once their canonical targets exist.
10. Migrate or cross-reference existing product-facing documentation incrementally.

## Risks and Mitigations

### Premature structure

Creating a complete hierarchy before extraction may force knowledge into unsuitable categories. Mitigation: implement only the extraction layer first.

### Duplicate authority

Repeating shared policy in `AGENTS.md`, `CLAUDE.md`, standards, and published content would create drift. Mitigation: keep tool-specific entry points short and link to canonical shared documents.

### Terminology conflicts

The conversation used “model,” “product,” “platform,” and “reference harness” loosely, while the repository distinguishes Coupeville models, Relay voicings, and serialized instruments. Mitigation: preserve current terms during extraction and resolve them before migration.

### Treating examples as requirements

Example component values and example directory names could be mistaken for standards. Mitigation: label examples and keep product-specific values out of standards.

### Documentation churn

Requiring an artifact after every conversation could create low-value files. Mitigation: promote only durable knowledge; discussion may remain discussion.

## Validation

The extraction phase is successful when:

- every durable decision in the reviewed conversation has a traceable inventory entry;
- confirmations, corrections, proposals, and unresolved questions are distinguishable;
- no published content or route has been reorganized;
- no candidate decision has silently become policy;
- another agent can understand what was decided without reopening the original conversation.

The completed knowledge system is successful when an agent can locate the authoritative guidance for a new guitar model, create documentation using the agreed conventions, reuse validated designs, and preserve new rationale without relying on private AI memory.

## Initial Implementation Boundary

The next implementation plan must cover only:

- `docs/engineering/extraction/decision-ledger.md`;
- one source inventory for the reviewed ChatGPT conversation; and
- only the minimum directory documentation needed to explain that staging area.

It must not yet create standards, reference designs, templates, governance documents, or changes to `AGENTS.md` and `CLAUDE.md`.
