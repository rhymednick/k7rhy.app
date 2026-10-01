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

For a **Confirmed** candidate, the notes quote or cite the owner's acceptance, such as the owner's reply or the date and place of the decision. Apply this to new entries and to existing entries when they are reviewed for promotion.

## Required source entry fields

Every candidate decision records:

- a stable source-local ID;
- a concise statement;
- its evidence label;
- source evidence or conversational context;
- a proposed classification;
- conflicts, corrections, or dependencies when applicable.

## Classification vocabulary

- **Project or governance principle:** How the project makes, records, and governs decisions across products.
- **Engineering standard:** A required practice for designing, building, measuring, or documenting, across products or a product family.
- **Engineering recommendation:** An advised practice that is not required, such as a screening band or measurement method, pending review in use.
- **Reference design:** A reusable circuit, layout, or fixture specification that products build from and declare by revision.
- **Design decision:** A choice about one model's or experiment's architecture, with its rationale.
- **Platform, model, or voicing documentation:** A player-facing description of a platform, model, or voice: its identity, controls, and intended sound.
- **Serialized-instrument documentation:** Facts about one built instrument or prototype: installed parts, measurements, and history.
- **Listening note:** A result heard while playing a built instrument or prototype.
- **Build observation:** A measured or observed behavior of a physical build that is not a listening result, recorded pending diagnosis.
- **Unresolved question:** An open question that needs owner review, testing, or evidence.
- **Discussion only:** Source context that will not become a canonical document.

## Ledger and inventory labels

A source inventory records each candidate's evidence label and classification as extracted. When review or a later source changes either one, the ledger records the current value, and the ledger controls. The inventory keeps its extracted value as history.

## Promotion rule

Extraction is not adoption. A candidate becomes authoritative only through an explicitly reviewed change to its canonical destination. Promotion must preserve a link back to the source inventory.

## Editing rules

- Preserve the source's terminology during extraction.
- Separate cross-product conventions from product-specific facts.
- Record contradictions and corrections instead of silently choosing one.
- Do not infer owner approval from an assistant's confidence.
- Do not delete source inventories merely because their contents have been promoted.
