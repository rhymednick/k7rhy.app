# TypeSafe skill enabled for project agents

- **Date:** 2026-10-01
- **Status:** approved
- **Supersedes:** none

## Decision

- The project's `.claude/settings.json` registers the `typesafe-ai/skills` marketplace and enables the `typesafe@typesafe-ai` plugin, so every Claude Code session in this repository gets the TypeSafe skill.
- Agents use the skill when work here needs a typed judgment over natural language: for example, sorting decision-extraction candidates or checking published wiring text against a netlist.
- Circuit logic stays in deterministic code. Netlists, operating states and contact tables are not delegated to a probabilistic model.

## Why

The owner has a TypeSafe account and wants its System One models (Jev) available while building the site and reviewing guitar wiring work. Typed, probability-scored answers suit review triage. They can't replace a circuit's source of truth.

## Open questions

- Which pilot comes first: ledger triage or the check that wiring pages match their netlists.
- The API key's environment variable name, and the API host to allow in the cloud environment's network policy. Confirm both from https://docs.typesafe.ai once that host is reachable.
- Scripts stay local and manual (outside `npm run build` and Netlify) unless the owner decides otherwise.
