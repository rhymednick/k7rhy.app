---
name: ingest-engineering-log
description: Use when the owner supplies an engineering log, bench notes, a design conversation, or another source to ingest into the decision-extraction inventories and ledger.
---

# Ingest an Engineering Log

Turn one owner-supplied source into a source inventory and ledger rows, then use TypeSafe (Jev) as a blind second reader before the owner reviews. Claude writes; Jev checks; the owner decides.

## Start with current truth

1. Read `docs/engineering/extraction/README.md` completely. Its evidence labels, classification vocabulary, required fields, and editing rules control this work.
2. Read `docs/engineering/extraction/decision-ledger.md` and the existing inventories in `docs/engineering/extraction/sources/` for the same model or platform. Note candidates the new source may correct or replace.
3. Read [the TypeSafe decision record](../../../docs/decisions/2026-10-01-typesafe-skill.md) for what the triage script checks and how its thresholds were set.

## 1. Preserve the source

- When the source is itself an engineering record (a bench log or a handoff), keep it under `docs/engineering/<model>/` with an ingestion header: where it came from, its date, any naming correction the owner gave, and what ingestion does not establish. Follow `docs/engineering/coupeville-velvet/2026-08-23-bench-test.md`.
- A conversation or chat export is not copied. Its inventory cites it.

## 2. Write the source inventory

Create `docs/engineering/extraction/sources/<source-date>-<slug>.md` with a `## Source` header, `## Extraction notes`, and `## Candidates`. Give each candidate a new source prefix and an `### <ID> — <title>` heading with **Statement**, **Evidence**, **Proposed classification**, and **Notes** fields. The triage script parses these headings and fields, so keep the format exact.

- Use the source's terminology. Separate cross-product conventions from product-specific facts.
- Label **Confirmed** only when the source shows the owner's acceptance, and add an **Acceptance** line that quotes or cites it. An assistant's confidence is not acceptance.
- Record corrections and conflicts with earlier candidates, including those from other sources, instead of choosing one silently.
- Jev does not write or summarize the inventory. Extraction is Claude's job.

## 3. Add ledger rows

Add the source to the ledger's **Sources** list and one row per candidate, with ledger status **Awaiting review**. Keep the table unbroken: a blank line inside it splits the table.

## 4. Run the TypeSafe check on the new candidates

```sh
node scripts/typesafe/triage-ledger.mjs --only <ID,ID,...> --out node_modules/.cache/typesafe/ingest-<prefix>.md
```

- Requires `TYPESAFE_API_KEY` and network access to `api.typesafe.ai`. If either is missing, say so to the owner, skip this step, and note in the inventory's extraction notes that the TypeSafe check has not run.
- Use `--out` so the committed full-ledger `triage-report.md` is not overwritten with a partial report.
- Jev reads each candidate blind (the ledger's labels are withheld) and answers the evidence label, classification, explicit owner acceptance, and same-source conflict.

## 5. Act on the flags

- **Priority 1** (a confident disagreement, a class outside the README vocabulary, or an unrecorded conflict): re-read the source. Fix your own extraction error; otherwise list it for the owner.
- **Confirmed with acceptance below 0.5:** quote the owner's acceptance in an **Acceptance** line, or relabel the candidate **Proposed**.
- **Priority 2 and uncertain answers:** list them for the owner with Jev's answer and confidence beside your label.
- Never change a label only because Jev disagrees. Model confidence is not owner approval, and Jev output never edits the ledger by itself.

## 6. Hand off to the owner

Report the new source, the candidate count, and only the rows that need the owner's call. Promotion follows the README's promotion rule and stays the owner's decision. Update `.remember/remember.md` if the ingestion changes the next actions.
