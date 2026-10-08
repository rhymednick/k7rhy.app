# Jev Ledger-Tagging Pilot — Design

- **Date:** 2026-10-01 (revised 2026-10-06 against the current ledger; API facts verified 2026-10-08)
- **Status:** Superseded (2026-10-08). This design was written without knowing that ledger triage was already implemented: [`scripts/typesafe/triage-ledger.mjs`](../../../scripts/typesafe/triage-ledger.mjs) has tagged every candidate since 2026-10-01. See [the TypeSafe decision record](../../decisions/2026-10-01-typesafe-skill.md) for the current workflow and results, and the [`ingest-engineering-log` skill](../../../.claude/skills/ingest-engineering-log/SKILL.md) for checking new candidates. The verified API facts below remain accurate; the two ideas the script lacks are listed under **Carried forward**.
- **Scope:** Use TypeSafe Jev as a second reader on the decision-extraction ledger. Jev suggests tags; the owner decides. Jev output never edits the ledger or a source inventory.

## Carried forward

Two ideas in this design are not in the triage script. Neither is approved.

- **Topic and scope tags** (the `topic` and `scope` fields below). They would group candidates by product and separate cross-product conventions from model-specific facts.
- **Pinning `jev-1.13.0`.** The script calls `jev-latest`, so its thresholds could drift when the alias moves.

## Why this fits

The ledger already carries human-assigned labels for 220 candidates. Jev is a classifier that returns a declared option plus a calibrated probability, not generated text. That makes it suited to one job here: re-read each candidate, propose the same labels independently, and surface disagreements and low-confidence cases for review.

The README now says the ledger controls: when review changes a label, the ledger records the current value and the source inventory keeps its extracted value as history. So the answer key for this pilot is the **ledger**, not the inventory. Rows where review changed a label (for example CRL-024 and CVPC-021) are the hardest cases, and the trial should include them.

## Jev facts

The TypeSafe skill (`typesafe-ai/skills`, v0.5.7) confirms the three primitives and how to use them. The API facts below were verified on 2026-10-08 against the official [Quick start](https://docs.typesafe.ai/introduction/quickstart) and [Models](https://docs.typesafe.ai/models) pages, which the owner supplied because the build environment cannot reach `docs.typesafe.ai`.

- Endpoint: `POST https://api.typesafe.ai/v1/systemone` with `Authorization: Bearer $TYPESAFE_API_KEY`. The body has `model`, `state`, and `questions` (a map of named questions).
- `choice`: `criteria` is a map of option label to description. The answer has `choice`, `confidence`, and a `probabilities` entry for every option.
- `score`: `criteria` is an ordered list of levels. The answer has `score` (the level index), `confidence`, a `legend` mapping indexes to levels, and `probabilities`.
- `noul`: no `criteria`. The answer has only `noul`, a yes probability from 0 to 1; there is no `confidence`.
- `state` can be a string, a JSON object, or an array of text values. Text only.
- Model: Jev 1.13 (`jev-1.13.0`). The `jev-latest` and `jev-preview` aliases both point to it today but move when a release ships. **Pin `jev-1.13.0`** so pilot results and thresholds are tied to one model version. The response's `model` field reports the version that answered.
- Price: $0.042 per million input tokens; output is free.
- Limits: 100K tokens per second and 80 requests per second; over either returns `429`. The official SDKs retry with backoff. Context is 64k tokens per request, and 32k for `state` plus the longest question. TypeSafe says limits may change without notice.
- SDKs: JavaScript (`@typesafe-ai/sdk`) and Python (`typesafe-sdk`). The JavaScript SDK fits a Node script in `scripts/`.
- Unverified (secondary sources only): the maximum number of `choice` options (reported as 255) and of `score` levels (reported as 2 to 10). Neither limit affects this pilot's fields.
- Also reachable through Netlify AI Gateway, which this site already deploys on (secondary source).

Guidance from the skill that shapes this design:

- Send all questions about one candidate in **one request**. They run in parallel and cannot see each other's answers.
- Pass state as **named JSON fields**. Put the judgment in `instructions` and define each answer in `criteria`. Question IDs are not sent to the model, so each question must carry its full meaning.
- Every `choice` needs a **no-match option**, because the model can only pick what is offered.
- `choice` confidence measures how concentrated the answer distribution is, not whether the answer is correct. A `noul` near 0.5 means "could go either way", not "partly true".
- Thresholds must be set from results on this data, not copied from examples.
- This pilot matches the skill's "verify and escalate" pattern: check labels against evidence and send uncertain cases to a person.

## Input per candidate

One request per candidate, built from the **source inventory entry**: ID, title, statement, notes, any acceptance line, and the source's header (title, provided date, scope). The inventory's and ledger's evidence labels and classifications are **withheld** so Jev reads blind.

## Field schema

| Field              | Jev type | Options                                                                                                                                              | Compared against                                      |
| ------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `evidence`         | choice   | Confirmed, Corrected, Proposed, Observed, Unresolved, Cannot tell                                                                                    | Ledger evidence label                                 |
| `classification`   | choice   | The 11 README classes, plus None of these                                                                                                            | Ledger classification                                 |
| `topic`            | choice   | Velvet, Current, Reef, Torch, Arc, Coupeville platform, Relay platform, Bench lab (CPAL), Documentation and governance, Cross-product, None of these | No current field (new)                                |
| `scope`            | choice   | Cross-product convention, Model-specific, Single serialized instrument                                                                               | No current field (new; README asks to separate these) |
| `owner_accepted`   | noul     | "Does the text show the owner explicitly accepted this?"                                                                                             | Evidence = Confirmed                                  |
| `supersedes_other` | noul     | "Does this correct or replace an earlier statement?"                                                                                                 | Ledger consolidation notes                            |
| `is_decision`      | noul     | "Is this a decision, not a fact or observation?"                                                                                                     | Observed / Discussion only                            |

`owner_accepted` matters most. The README says not to infer owner approval from an assistant's confidence; this field checks that rule directly.

Ledger status, canonical destination, and promotion are **not** tagged. Those are owner decisions.

## How results feed review

1. A script (later, after approval) writes one sidecar file per run: `docs/engineering/extraction/jev-runs/<date>.md`, a table of ID, each Jev tag with probability, and the human label beside it.
2. Each row is sorted into one of three buckets:
    - **Disagrees:** Jev's top choice differs from the human label at probability ≥ 0.7.
    - **Unsure:** Jev's top probability is below 0.6.
    - **Agrees:** everything else. Not reviewed individually.
3. The owner reviews only Disagrees and Unsure rows during normal ledger review. Each outcome is one of: fix the ledger, or keep the ledger label. Inventories keep their extracted values as history.
4. Fixes go through the existing ledger editing rules. The run file records the outcome per row so a later run can measure drift.

Thresholds are starting guesses; set them from the trial.

## Trial set (24 candidates)

Chosen to cover every evidence label, most classes, each product, and rows whose label changed in review. Current ledger labels are the answer key.

| ID       | Ledger labels (2026-10-06)                           | Why included                                                      |
| -------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| ZGDC-001 | Confirmed, Project or governance principle           | Plain governance case                                             |
| ZGDC-013 | Confirmed, Engineering standard                      | Plain standard                                                    |
| ZGDC-028 | Corrected, Project or governance principle           | Correction of an earlier sequence                                 |
| ZGDC-031 | Proposed, Project or governance principle            | Proposed and not promoted                                         |
| CVPC-001 | Corrected, Serialized-instrument documentation       | One prototype's history                                           |
| CVPC-003 | Confirmed, Reference design                          | Velvet control choice                                             |
| CVPC-021 | Observed, Build observation                          | Inventory says Platform documentation                             |
| VDH-029  | Proposed, Engineering recommendation                 | Advised, not required                                             |
| VDH-033  | Unresolved, Unresolved question                      | Open question                                                     |
| VAC-017  | Unresolved, Unresolved question                      | Open bench question                                               |
| ERP-006  | Corrected, Reference design                          | Resolves an earlier item                                          |
| VPTC-001 | Corrected, Validation plan                           | Supersedes VAC-016                                                |
| VPTC-002 | Observed, Serialized-instrument documentation        | Measurement data                                                  |
| VPTC-005 | Confirmed, Engineering recommendation                | Screening target                                                  |
| CRL-002  | Confirmed, Reference design                          | Label changed after review                                        |
| CRL-010  | Corrected, Project or governance principle           | Cross-platform rule                                               |
| CRL-013  | Observed, Platform, model, or voicing documentation  | Measurement used on a model page                                  |
| CRL-024  | Confirmed, Reference design                          | Inventory says Proposed, Unresolved question; accepted 2026-10-01 |
| RCCP-001 | Confirmed, Platform, model, or voicing documentation | Naming decision                                                   |
| RCCP-012 | Confirmed, Serialized-instrument documentation       | Installed values for one serial                                   |
| CPAL-001 | Confirmed, Reference design                          | Bench fixture                                                     |
| RTC-001  | Confirmed, Reference design                          | Torch reference                                                   |
| RTC-007  | Observed, Discussion only                            | Context only                                                      |
| RTC-008  | Confirmed, Validation plan                           | Deferred research item                                            |

**Success bar (proposed):** at least 80% agreement with the ledger on `evidence` and `classification`. Look closely at CRL-024 and CVPC-021: they show whether Jev follows a later acceptance line or the original extracted framing. If the bar is met, run all 220. If not, review the misses before changing questions or options.

## Defaults (pending owner confirmation)

1. **Access:** use the owner's TypeSafe API key directly, stored in a local environment variable (`TYPESAFE_API_KEY`) and never committed. The Claude Code cloud environment currently blocks `api.typesafe.ai` and `docs.typesafe.ai`; the host must be allowed there, or the script run locally.
2. **Topics:** keep the list as written, including Arc. An unused option costs nothing.
3. **Script:** put it under `scripts/`, run it only on demand, and keep it out of the site build.
