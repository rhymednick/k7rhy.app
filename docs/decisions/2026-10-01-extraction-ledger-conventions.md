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
- The rerun suggests many rows may belong in a different class, mainly Reference design versus Design decision (24 rows). Review that pair before promoting Velvet and Reef reference designs.
