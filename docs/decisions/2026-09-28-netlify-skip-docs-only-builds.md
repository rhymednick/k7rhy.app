# Skip Netlify builds for docs-only changes

- **Date:** 2026-09-28
- **Status:** implemented (not yet validated on Netlify)
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

## Open questions

- If the site ever renders files from `docs/`, remove or narrow this rule.
- Confirm on Netlify that a docs-only push shows as "Canceled: no content change" instead of a build.
