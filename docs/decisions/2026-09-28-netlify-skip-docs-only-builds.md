# Skip Netlify builds for docs-only changes

- **Date:** 2026-09-28
- **Status:** validated 2026-09-28
- **Supersedes:** none

## Decision

`netlify.toml` sets `[build] ignore` so Netlify skips a build when every file changed since the last build is under `docs/`. The site does not read `docs/`, so these builds produce an identical site and only spend build credits.

## Why

The owner has limited Netlify build credits. Engineering notes, such as `docs/engineering/fuzz-face/`, change often and are not displayed on the site.

## Behavior

- Skips when `git diff` between `CACHED_COMMIT_REF` and `COMMIT_REF` shows changes only under `docs/`.
- Builds on a branch's first deploy, where the two refs are equal.
- Builds if git cannot compare the refs, for example when a commit is missing from a shallow clone.
- Builds for any change outside `docs/`, including `netlify.toml` itself.

Tested locally against real commits on `claude/upbeat-cannon-d5oy3r`.

## Validation

- Commit `43b3602` (docs only) on the PR for this change: Netlify deploy preview canceled, no build.
- Commit `47cb274` (docs only) still built. It was pushed while the previous build (`e4b3edb`, which changed `netlify.toml`) was finishing, so Netlify most likely compared against an older cached build, and that difference included `netlify.toml`. Expect the same when a docs-only push closely follows a non-docs one.
- Netlify gives a pull request's first deploy preview the production cache, so a new PR's first build compares against the last production build.

## Open questions

- If the site ever renders files from `docs/`, remove or narrow this rule.
