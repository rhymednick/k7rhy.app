# Extraction ledger conventions

- **Date:** 2026-10-01
- **Status:** approved; implemented in [`docs/engineering/extraction/README.md`](../engineering/extraction/README.md)
- **Supersedes:** the README's undefined classification list

## Decision

1. **The ledger controls.** An inventory keeps each candidate's label and class as extracted. When review or a later source changes either, the ledger records the current value.
2. **Two more official classes.** "Engineering recommendation" and "Build observation" join the vocabulary. Every class now has a one-line definition.
3. **Confirmed needs cited acceptance.** The notes for a Confirmed candidate quote or cite the owner's acceptance. This applies to new entries and to existing entries when they are reviewed for promotion; there is no bulk backfill.
4. **Ledger table repaired.** A blank line before RTC-001 split the candidate table; it was removed.

## Why

- The [first TypeSafe triage](2026-10-01-typesafe-skill.md) found 34 candidates where the ledger and inventory differ. In every case the ledger is newer: the inventories were never updated after the review commits `99410c9` (2026-07-30), `376043e` (2026-07-31), `69f6bc1` and `253d24e` (2026-08-05). Rule 1 records what was already practice.
- The owner chose "Engineering recommendation" (CRL-015) and "Build observation" (CVPC-021) in review commit `99410c9`. The ledger notes CRL-015 as "an approved measurement recommendation, not a publication requirement", and ZGDC-024 requires separating requirements from recommendations. Relabeling them would erase a distinction the owner drew on purpose.
- For 122 of 149 Confirmed candidates, the notes do not show the owner's acceptance, so the label can't be checked against its evidence.

## Open questions

- The class definitions are a first draft written from current usage. Adjust any that misstate your intent.
- TypeSafe places 12 Engineering standard rows (such as ERP-012 and CPAL-014) in Validation plan. Review them when those candidates are promoted.

## Revision: Design decision merged (2026-10-01)

- **Status:** approved by the owner; implemented in the README and ledger.
- **Decision:** "Design decision" is retired. A Reference design is the default design for a model, platform, or experiment, including the choices that shape it. A new class, **Validation plan**, covers how a design is tested, compared, or selected before adoption.
- **Why:** In the notes, most "Design decision" rows described the design itself, the same as Reference design. The rest described tests, promotion gates, and pickup screening.
- **Relabeled in the ledger (41 rows):**
    - Reference design (25): CVPC-003, CVPC-005–CVPC-008, CVPC-014, CVPC-017, CVPC-019, VDH-005, VDH-018–VDH-021, VAC-002, RCCP-008, RCCP-011, CRL-002, CRL-005, CRL-008, CRL-009, CRL-011, CRL-020, CRL-021, CRL-023, RTC-003.
    - Validation plan (15): VAC-001, VAC-014, VAC-016, VAC-021, VAC-025, ERP-010, ERP-011, ERP-013, ERP-015, VPTC-001, VPTC-003, VPTC-006, VPTC-008, VPTC-010, RTC-008.
    - Build observation (1): VDH-016.
- **Result:** A third triage run removed the Reference design versus Design decision disagreement. Overall class agreement held at 100/220: TypeSafe now most often moves Reference design rows to Engineering recommendation (21) and Engineering standard rows to Validation plan (12).
