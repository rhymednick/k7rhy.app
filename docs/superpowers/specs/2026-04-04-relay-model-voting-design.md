# Relay Model Voting Feature — Design Spec

## Goal

Allow visitors to vote for their top 3 planned Relay guitar models using ranked-choice selection. Display weighted percentage totals on the model cards to help the site owner prioritize development order.

## Scope

- Voting applies only to models with `status: 'planned'` in `relay-nav.ts`
- Available models are shown in the grid but are non-interactive and excluded from all vote calculations
- One vote per browser (enforced via cookie); no account or login required
- Vote totals are stored persistently server-side via Netlify Blobs
- The platform overview page (`/docs/relay`) is the only location for this feature

---

## Data Model

One Netlify Blobs entry, key: `relay-votes`, store: `relay-voting`.

```json
{
  "velvet":      { "points": 312 },
  "arc":         { "points": 201 },
  "torch":       { "points": 187 },
  "current":     { "points": 95  },
  "hammer":      { "points": 64  },
  "totalVoters": 108
}
```

**Weighted scoring:** 1st choice = 3 pts, 2nd = 2 pts, 3rd = 1 pt.

**Percentages** are calculated client-side as `modelPoints / totalPoints * 100` where `totalPoints` is the sum of all planned model points. Available models are never included.

---

## API

### `GET /api/relay-votes`

Returns current vote totals. No authentication required.

**Response:**
```json
{
  "votes": {
    "velvet":  { "points": 312 },
    "arc":     { "points": 201 },
    "torch":   { "points": 187 },
    "current": { "points": 95  },
    "hammer":  { "points": 64  }
  },
  "totalVoters": 108
}
```

### `POST /api/relay-votes`

Submits a ranked vote. Validates input, updates Netlify Blobs, sets cookie, returns updated totals.

**Request body:**
```json
{ "rankings": ["velvet", "torch", "arc"] }
```

**Validation:**
- `rankings` must be an array of 1–3 strings
- Each entry must be a known model key with `status: 'planned'`
- No duplicates
- If the `relay-model-vote` cookie is already set, return `409 Conflict`

**Response (success):** Same shape as `GET`, plus `Set-Cookie`.

**Response (already voted):** `409 Conflict`

**Response (invalid input):** `400 Bad Request`

---

## Cookie

Name: `relay-model-vote`
Value: JSON-encoded rankings array, e.g. `["velvet","torch","arc"]`
Max-age: 1 year
SameSite: Lax
Secure: true in production
HttpOnly: false (client needs to read it to display "Your #1/2/3" labels)

---

## Frontend

### Component: `RelayVoteGrid`

New client component (`'use client'`) that replaces the static `RelayModelGrid` on the platform overview page. Wraps the model card grid and owns all voting state.

**On mount:**
1. Read `relay-model-vote` cookie
2. If cookie exists: parse rankings, set state to `results` view, show "Your #N" labels
3. Fetch `GET /api/relay-votes` to populate percentage data (always, regardless of cookie)

**On submit:**
1. Call `POST /api/relay-votes` with current rankings
2. On success: transition to `results` view, cookie is set by the API response
3. On `409`: transition to `results` view (someone else submitted between mount and submit — treat as already voted)
4. On other error: show inline error message, leave user in voting state

### States

**`idle`** — no vote cast yet. Cards are interactive. Hint text guides the user through ranking 1, 2, 3. Submit button appears after first selection. Percentage bars are hidden.

**`submitting`** — submit button shows a spinner. Cards are non-interactive.

**`results`** — all cards show percentage bars. User's ranked picks show "Your #1/2/3" label and highlighted bar color. Available models remain dimmed with "Already built" note.

### `RelayModelCard` changes

Accepts two new optional props:
- `rank?: 1 | 2 | 3` — shows rank badge (voting state) or "Your #N" label (results state)
- `percentage?: number` — if provided, renders the percentage bar

Available cards (`status: 'available'`) ignore these props entirely.

---

## Files to create

- `app/api/relay-votes/route.ts` — GET and POST handlers
- `components/relay/relay-vote-grid.tsx` — client vote grid component
- `lib/relay-votes.ts` — Netlify Blobs read/write logic, validation helpers

## Files to modify

- `components/doc/relay-model-grid.tsx` — add `rank` and `percentage` props to `RelayModelCard`
- `content/relay/index.mdx` — replace `<RelayModelGrid>` with `<RelayVoteGrid>`
- `components/mdx-components.tsx` — register `RelayVoteGrid`

---

## Out of scope

- Changing your vote after submission
- Admin view of vote totals
- Resetting votes
- Showing total voter count on the page (data is stored but not displayed)
