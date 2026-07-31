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
