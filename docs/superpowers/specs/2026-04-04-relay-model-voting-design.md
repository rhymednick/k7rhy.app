# Relay Model Voting Feature — Design Spec

## Goal

Allow visitors to vote for their top 3 planned Relay guitar models using ranked-choice selection. Display weighted percentage totals on the model cards to help the site owner prioritize development order. Visitors can change their vote at any time.

## Scope

- Voting applies only to models with `status: 'planned'`
- Available models are shown in the grid but are non-interactive and excluded from all vote calculations
- One active vote per browser (stored in cookie); vote can be changed any number of times
- Vote totals are stored persistently server-side via Netlify Blobs
- The platform overview page (`/docs/relay`) is the only location for this feature

---

## Prerequisites

```bash
npm install @netlify/blobs
```

This is the first use of Netlify Blobs in the project.

---

## Model Registry

A new config file `config/relay-models.ts` is the single source of truth for all model data used by the voting feature. Both the vote grid component and the API validation derive model lists from this file.

```ts
export interface RelayModel {
    modelKey: string; // e.g. 'velvet' — used in API and Blobs. Named 'modelKey' not 'key' to avoid collision with React's reserved 'key' prop.
    name: string; // e.g. 'Relay Velvet'
    tagline: string;
    genres: string;
    description: string;
    status: 'available' | 'planned';
    href?: string; // only for available models
}

export const relayModels: RelayModel[] = [
    {
        modelKey: 'lipstick',
        name: 'Relay Lipstick',
        tagline: 'Expressive contrast · Signature identity',
        genres: 'Blues · Rock · Alternative · Indie',
        description: 'The reference model and first release. Dual humbuckers with a lipstick middle pickup. Built for articulate response, expressive dynamics, and a distinctive middle voice that gives the guitar real character.',
        status: 'available',
        href: '/docs/relay/lipstick',
    },
    {
        modelKey: 'velvet',
        name: 'Relay Velvet',
        tagline: 'Warm authority · Club presence',
        genres: 'Jazz · Blues · Soul · R&B',
        description: 'The warm, full-bodied model. A neck humbucker, Retrotron Nashville middle, and bridge humbucker combination aimed at players who want presence without harshness — authoritative and elegant across all positions.',
        status: 'planned',
    },
    {
        modelKey: 'arc',
        name: 'Relay Arc',
        tagline: 'Chime · Air · Spatial clarity',
        genres: 'Clean pop · Indie · Ambient · Country',
        description: 'The open, ringing model. Designed for shimmer, width, and dimensional clarity without thinning out. A humbucker neck, Dream 180 middle, and a clear-voiced bridge give it a wide, airy palette.',
        status: 'planned',
    },
    {
        modelKey: 'torch',
        name: 'Relay Torch',
        tagline: 'Vocal mids · Contemporary energy',
        genres: 'Rock · Pop · Alternative · Modern country',
        description: 'The most immediately compelling model for a broad audience. A P90-type middle pickup brings a rude, alive quality to the center voice. Strong tonal separation from Lipstick and Velvet makes it a natural second release candidate.',
        status: 'planned',
    },
    {
        modelKey: 'current',
        name: 'Relay Current',
        tagline: 'Punch · Cut · Immediacy',
        genres: 'Funk · Pop · Rock',
        description: 'Percussive, forward, and fast-responding. Designed to cut through a mix with strong upper-mid presence and a crisp attack — more aggressive than Velvet, less saturated than Torch. Development timeline uncertain.',
        status: 'planned',
    },
    {
        modelKey: 'hammer',
        name: 'Relay Hammer',
        tagline: 'High gain · Uncompromising',
        genres: 'Metal · Hard rock',
        description: 'Built specifically for high-gain players. Tight, saturated, and aggressive — the specialty model in the family, not the centerpiece. A deliberate outlier in the lineup.',
        status: 'planned',
    },
];

export const plannedModelKeys = relayModels.filter((m) => m.status === 'planned').map((m) => m.modelKey);
```

The `content/relay/index.mdx` MDX file is simplified to just `<RelayVoteGrid />` with no inline model props — the component imports from this config directly.

---

## Data Storage — Netlify Blobs

Store name: `relay-voting` Key: `relay-votes`

```json
{
    "velvet": { "points": 312 },
    "arc": { "points": 201 },
    "torch": { "points": 187 },
    "current": { "points": 95 },
    "hammer": { "points": 64 },
    "totalVoters": 108
}
```

**Weighted scoring:** 1st = 3 pts, 2nd = 2 pts, 3rd = 1 pt.

**Empty store:** When the key does not exist (no votes yet), `lib/relay-votes.ts` returns a zeroed-out object using `plannedModelKeys` from the model registry:

```ts
{ velvet: { points: 0 }, arc: { points: 0 }, ..., totalVoters: 0 }
```

**Vote changes:** When a user changes their vote, the API reads their previous rankings from the request body, subtracts the old weighted points, then adds the new weighted points. `totalVoters` is not incremented on a vote change. See POST spec below.

**Race condition:** Netlify Blobs has no atomic read-modify-write. Concurrent POST requests could lose a vote increment. This is an accepted limitation for this feature — vote counts are approximate guidance for a low-traffic site, not a precise election.

**Percentages** are calculated client-side. The client sums all planned model `points` values from the GET response to derive `totalPoints`, then computes `modelPoints / totalPoints * 100` for each card. `totalPoints` is not returned by the API — it is always derived client-side. Available models are never included.

---

## API

### `GET /api/relay-votes`

Returns current vote totals. No auth required.

**Response `200`:**

```json
{
    "votes": {
        "velvet": { "points": 312 },
        "arc": { "points": 201 },
        "torch": { "points": 187 },
        "current": { "points": 95 },
        "hammer": { "points": 64 }
    },
    "totalVoters": 108
}
```

### `POST /api/relay-votes`

Handles both new votes and vote changes.

**Request body:**

```json
{
    "rankings": ["velvet", "torch", "arc"],
    "previousRankings": ["arc", "velvet", "torch"]
}
```

`previousRankings` is omitted on a first vote. When present, it must be a valid previously-submitted rankings array — the API uses it to subtract old points before applying the new vote.

**Validation:**

- `rankings` must be an array of 1–3 strings
- Each entry in `rankings` must exist in `plannedModelKeys`
- No duplicates in `rankings`
- If `previousRankings` is present: same shape validation; each entry must exist in `plannedModelKeys`; no duplicates
- If `previousRankings` is absent and the `relay-model-vote` cookie is already set: reject with `409 Conflict` (cookie present but client sent no previous rankings — likely a client bug or tampering attempt)

**On new vote (no `previousRankings`):**

1. Read current blob (or use zeroed defaults)
2. Add weighted points for `rankings`
3. Increment `totalVoters`
4. Write updated blob
5. Set `relay-model-vote` cookie to new rankings
6. Return `200` with updated totals

**On vote change (`previousRankings` present):**

1. Read current blob (or use zeroed defaults)
2. Subtract weighted points for `previousRankings` (clamp each model's points to 0 minimum)
3. Add weighted points for `rankings`
4. Do not change `totalVoters`
5. Write updated blob
6. Overwrite `relay-model-vote` cookie with new rankings
7. Return `200` with updated totals

**Responses:**

- `200` — vote accepted, returns updated totals + `Set-Cookie`
- `400` — invalid input
- `409` — cookie present but no `previousRankings` supplied
- `500` — Blobs read/write failure

---

## Cookie

Name: `relay-model-vote` Value: JSON-encoded rankings, e.g. `["velvet","torch","arc"]` Max-age: 31,536,000 (1 year) SameSite: Lax Secure: true in production HttpOnly: false — client reads the cookie to display "Your #1/2/3" labels and to populate rankings when changing vote

**Security note:** Because the cookie is not HttpOnly, a client-side script could manipulate it. This is an accepted tradeoff — the feature is low-stakes prioritization feedback, not a formal election. No IP-based or account-based deduplication is implemented.

---

## Frontend

### `config/relay-models.ts`

New file. Single source of truth for all model data. Described above.

### `components/relay/relay-vote-grid.tsx`

New `'use client'` component. Imports `relayModels` from `config/relay-models.ts` directly — no props needed from the MDX caller.

**On mount:**

1. Read `relay-model-vote` cookie (via `document.cookie`)
2. Fetch `GET /api/relay-votes` to get current percentages
3. If cookie exists: parse prior rankings, enter `results` state with those rankings highlighted
4. If no cookie: enter `idle` state

**State machine:**

- **`idle`** — cards are interactive. Clicking a planned card assigns the next available rank (1, 2, or 3). Clicking a ranked card deselects it and shifts remaining ranks down. Submit button appears after first selection. Hint text updates as ranks are filled. Percentage bars hidden. Available model cards are dimmed, non-interactive, show "Already built — not part of the vote."

- **`submitting`** — submit button shows spinner. A CSS `pointer-events: none` overlay on the grid prevents card interaction. No new `disabled` prop needed on `RelayModelCard`.

- **`results`** — all planned cards show a percentage bar. User's ranked picks show "Your #1/2/3" label and an accented bar color. A "Change my vote" button appears below the grid. Available model cards remain in their dimmed state.

**On submit:**

1. Transition to `submitting`
2. Read `relay-model-vote` cookie — if present, include it as `previousRankings` in the POST body
3. POST `{ rankings, previousRankings? }` to `/api/relay-votes`
4. On `200`: update vote totals state, transition to `results`
5. On other error: transition back to `idle`, show inline error: "Something went wrong — your vote wasn't saved. Try again."

**On "Change my vote":**

1. Transition back to `idle`
2. Pre-populate the current rankings from the cookie so the user's prior choices are already selected
3. The submit flow then sends both `rankings` and `previousRankings`

### `components/doc/relay-model-grid.tsx` — `RelayModelCard` changes

Two new optional props:

```ts
rank?: 1 | 2 | 3        // shows rank badge in idle, "Your #N" in results
percentage?: number      // if provided, renders the percentage bar
```

The `onClick` handler for voting is passed as an optional prop from `RelayVoteGrid`:

```ts
onSelect?: () => void
```

`RelayModelCard` renders a `<button>` wrapper (instead of `<div>`) when `onSelect` is provided, for accessibility. Available cards never receive `onSelect`.

### MDX update — `content/relay/index.mdx`

The inline `<RelayModelGrid>` block with hardcoded card props is replaced with:

```mdx
<RelayVoteGrid />
```

The model data now lives in `config/relay-models.ts`.

---

## Files to create

- `config/relay-models.ts` — model registry (replaces inline MDX card data)
- `app/api/relay-votes/route.ts` — GET and POST handlers
- `components/relay/relay-vote-grid.tsx` — client vote grid
- `lib/relay-votes.ts` — Netlify Blobs read/write and validation helpers

## Files to modify

- `components/doc/relay-model-grid.tsx` — add `rank`, `percentage`, `onSelect` props to `RelayModelCard`
- `content/relay/index.mdx` — replace inline grid with `<RelayVoteGrid />`
- `components/mdx-components.tsx` — register `RelayVoteGrid`; keep existing `RelayModelGrid` and `RelayModelCard` registrations as they may be used in other MDX files

---

## Out of scope

- Admin view of vote totals
- Resetting votes
- Displaying total voter count on the page (stored but not shown)
- IP-based or account-based vote deduplication
