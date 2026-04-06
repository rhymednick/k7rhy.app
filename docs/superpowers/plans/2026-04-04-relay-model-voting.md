# Relay Model Voting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow visitors to rank up to 3 planned Relay guitar models, persist weighted vote totals in Netlify Blobs, and display percentage bars on each model card.

**Architecture:** A `config/relay-models.ts` file becomes the single source of truth for all model data. A `lib/relay-votes.ts` module handles Blobs read/write. A Next.js API route at `/api/relay-votes` handles GET (read totals) and POST (submit or change vote). A `'use client'` `RelayVoteGrid` component orchestrates the three UI states (idle → submitting → results), replacing the current inline MDX card block.

**Tech Stack:** Next.js 15 App Router, `@netlify/blobs`, Vitest, TypeScript strict, Tailwind CSS, `js-cookie` (or `document.cookie` directly)

---

## File Map

**Create:**
- `config/relay-models.ts` — model registry, single source of truth
- `lib/relay-votes.ts` — Netlify Blobs helpers + validation
- `app/api/relay-votes/route.ts` — GET and POST handlers
- `components/relay/relay-vote-grid.tsx` — client vote grid component
- `lib/relay-votes.test.ts` — unit tests for vote helpers

**Modify:**
- `components/doc/relay-model-grid.tsx` — add `rank?`, `percentage?`, `onSelect?` props to `RelayModelCard`
- `components/mdx-components.tsx` — register `RelayVoteGrid`
- `content/relay/index.mdx` — replace inline grid with `<RelayVoteGrid />`

---

## Task 1: Install dependency and create model registry

**Files:**
- Create: `config/relay-models.ts`

- [ ] **Step 1: Install `@netlify/blobs`**

```bash
npm install @netlify/blobs
```

Expected: package added to `package.json` and `node_modules`.

- [ ] **Step 2: Create `config/relay-models.ts`**

```ts
export interface RelayModel {
    modelKey: string;
    name: string;
    tagline: string;
    genres: string;
    description: string;
    status: 'available' | 'planned';
    href?: string;
}

export const relayModels: RelayModel[] = [
    {
        modelKey: 'lipstick',
        name: 'Relay Lipstick',
        tagline: 'Expressive contrast · Signature identity',
        genres: 'Blues · Rock · Alternative · Indie',
        description:
            'The reference model and first release. Dual humbuckers with a lipstick middle pickup. Built for articulate response, expressive dynamics, and a distinctive middle voice that gives the guitar real character.',
        status: 'available',
        href: '/docs/relay/lipstick',
    },
    {
        modelKey: 'velvet',
        name: 'Relay Velvet',
        tagline: 'Warm authority · Club presence',
        genres: 'Jazz · Blues · Soul · R&B',
        description:
            'The warm, full-bodied model. A neck humbucker, Retrotron Nashville middle, and bridge humbucker combination aimed at players who want presence without harshness — authoritative and elegant across all positions.',
        status: 'planned',
    },
    {
        modelKey: 'arc',
        name: 'Relay Arc',
        tagline: 'Chime · Air · Spatial clarity',
        genres: 'Clean pop · Indie · Ambient · Country',
        description:
            'The open, ringing model. Designed for shimmer, width, and dimensional clarity without thinning out. A humbucker neck, Dream 180 middle, and a clear-voiced bridge give it a wide, airy palette.',
        status: 'planned',
    },
    {
        modelKey: 'torch',
        name: 'Relay Torch',
        tagline: 'Vocal mids · Contemporary energy',
        genres: 'Rock · Pop · Alternative · Modern country',
        description:
            'The most immediately compelling model for a broad audience. A P90-type middle pickup brings a rude, alive quality to the center voice. Strong tonal separation from Lipstick and Velvet makes it a natural second release candidate.',
        status: 'planned',
    },
    {
        modelKey: 'current',
        name: 'Relay Current',
        tagline: 'Punch · Cut · Immediacy',
        genres: 'Funk · Pop · Rock',
        description:
            'Percussive, forward, and fast-responding. Designed to cut through a mix with strong upper-mid presence and a crisp attack — more aggressive than Velvet, less saturated than Torch. Development timeline uncertain.',
        status: 'planned',
    },
    {
        modelKey: 'hammer',
        name: 'Relay Hammer',
        tagline: 'High gain · Uncompromising',
        genres: 'Metal · Hard rock',
        description:
            'Built specifically for high-gain players. Tight, saturated, and aggressive — the specialty model in the family, not the centerpiece. A deliberate outlier in the lineup.',
        status: 'planned',
    },
];

export const plannedModelKeys = relayModels.filter((m) => m.status === 'planned').map((m) => m.modelKey);
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add config/relay-models.ts package.json package-lock.json
git commit -m "feat: add relay model registry and install @netlify/blobs"
```

---

## Task 2: Create `lib/relay-votes.ts` with Blobs helpers

**Files:**
- Create: `lib/relay-votes.ts`
- Create: `lib/relay-votes.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// lib/relay-votes.test.ts
import { describe, it, expect } from 'vitest';
import { applyWeightedPoints, buildZeroedVotes, VOTE_WEIGHTS, isValidRankings } from '@/lib/relay-votes';

describe('VOTE_WEIGHTS', () => {
    it('assigns 3 pts for rank 0, 2 for rank 1, 1 for rank 2', () => {
        expect(VOTE_WEIGHTS[0]).toBe(3);
        expect(VOTE_WEIGHTS[1]).toBe(2);
        expect(VOTE_WEIGHTS[2]).toBe(1);
    });
});

describe('buildZeroedVotes', () => {
    it('returns zeroed points for each key', () => {
        const result = buildZeroedVotes(['velvet', 'arc']);
        expect(result).toEqual({ velvet: { points: 0 }, arc: { points: 0 }, totalVoters: 0 });
    });
});

describe('applyWeightedPoints', () => {
    it('adds weighted points for rankings', () => {
        const votes = buildZeroedVotes(['velvet', 'arc', 'torch']);
        const result = applyWeightedPoints(votes, ['velvet', 'torch'], 1);
        expect(result.velvet.points).toBe(3);
        expect(result.torch.points).toBe(2);
        expect(result.arc.points).toBe(0);
    });

    it('subtracts weighted points (clamps to 0)', () => {
        const votes = { velvet: { points: 2 }, arc: { points: 0 }, torch: { points: 1 }, current: { points: 0 }, hammer: { points: 0 }, totalVoters: 1 };
        const result = applyWeightedPoints(votes, ['velvet', 'arc'], -1);
        expect(result.velvet.points).toBe(0); // 2 - 3 clamped to 0
        expect(result.arc.points).toBe(0);    // 0 - 2 clamped to 0
    });

    it('handles rankings shorter than 3', () => {
        const votes = buildZeroedVotes(['velvet', 'arc', 'torch', 'current', 'hammer']);
        const result = applyWeightedPoints(votes, ['torch'], 1);
        expect(result.torch.points).toBe(3);
    });
});

describe('isValidRankings', () => {
    const validKeys = ['velvet', 'arc', 'torch', 'current', 'hammer'];

    it('returns true for 1-3 valid unique planned model keys', () => {
        expect(isValidRankings(['velvet'], validKeys)).toBe(true);
        expect(isValidRankings(['velvet', 'arc'], validKeys)).toBe(true);
        expect(isValidRankings(['velvet', 'arc', 'torch'], validKeys)).toBe(true);
    });

    it('returns false for empty array', () => {
        expect(isValidRankings([], validKeys)).toBe(false);
    });

    it('returns false for more than 3 items', () => {
        expect(isValidRankings(['velvet', 'arc', 'torch', 'current'], validKeys)).toBe(false);
    });

    it('returns false if any key is not in plannedModelKeys', () => {
        expect(isValidRankings(['lipstick'], validKeys)).toBe(false);
        expect(isValidRankings(['velvet', 'unknown'], validKeys)).toBe(false);
    });

    it('returns false for duplicates', () => {
        expect(isValidRankings(['velvet', 'velvet'], validKeys)).toBe(false);
    });

    it('returns false for non-array', () => {
        expect(isValidRankings('velvet', validKeys)).toBe(false);
        expect(isValidRankings(null, validKeys)).toBe(false);
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run lib/relay-votes.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `lib/relay-votes.ts`**

```ts
import { getStore } from '@netlify/blobs';
import { plannedModelKeys } from '@/config/relay-models';

export const VOTE_WEIGHTS = [3, 2, 1] as const;

// Exported so it can be unit tested without Blobs. The route passes plannedModelKeys at call time.
export function isValidRankings(rankings: unknown, validKeys: string[]): rankings is string[] {
    if (!Array.isArray(rankings)) return false;
    if (rankings.length < 1 || rankings.length > 3) return false;
    if (rankings.some((r) => typeof r !== 'string' || !validKeys.includes(r))) return false;
    if (new Set(rankings).size !== rankings.length) return false;
    return true;
}

const STORE_NAME = 'relay-voting';
const BLOB_KEY = 'relay-votes';

export interface ModelVote {
    points: number;
}

export interface VoteStore {
    [modelKey: string]: ModelVote;
    totalVoters: number;
}

export function buildZeroedVotes(keys: string[]): VoteStore {
    const votes: VoteStore = { totalVoters: 0 };
    for (const key of keys) {
        votes[key] = { points: 0 };
    }
    return votes;
}

export function applyWeightedPoints(votes: VoteStore, rankings: string[], multiplier: 1 | -1): VoteStore {
    const result = structuredClone(votes) as VoteStore;
    rankings.forEach((modelKey, i) => {
        const weight = VOTE_WEIGHTS[i] ?? 0;
        const current = (result[modelKey] as ModelVote | undefined)?.points ?? 0;
        const next = current + weight * multiplier;
        result[modelKey] = { points: Math.max(0, next) };
    });
    return result;
}

export async function readVotes(): Promise<VoteStore> {
    const store = getStore(STORE_NAME);
    const raw = await store.get(BLOB_KEY, { type: 'json' }).catch(() => null);
    if (!raw) return buildZeroedVotes(plannedModelKeys);
    return raw as VoteStore;
}

export async function writeVotes(votes: VoteStore): Promise<void> {
    const store = getStore(STORE_NAME);
    await store.set(BLOB_KEY, JSON.stringify(votes));
}

export function extractPlannedVotes(votes: VoteStore): Record<string, ModelVote> {
    const result: Record<string, ModelVote> = {};
    for (const key of plannedModelKeys) {
        result[key] = votes[key] as ModelVote ?? { points: 0 };
    }
    return result;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run lib/relay-votes.test.ts
```

Expected: PASS — all tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/relay-votes.ts lib/relay-votes.test.ts
git commit -m "feat: add relay-votes Blobs helpers with weighted point logic"
```

---

## Task 3: Create API route `app/api/relay-votes/route.ts`

**Files:**
- Create: `app/api/relay-votes/route.ts`

The API has no unit tests (Netlify Blobs requires a live environment); manual testing happens during Task 6.

- [ ] **Step 1: Create the route file**

```ts
// app/api/relay-votes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { plannedModelKeys } from '@/config/relay-models';
import { readVotes, writeVotes, applyWeightedPoints, extractPlannedVotes, isValidRankings } from '@/lib/relay-votes';

const COOKIE_NAME = 'relay-model-vote';
const COOKIE_MAX_AGE = 31_536_000; // 1 year

export async function GET() {
    try {
        const votes = await readVotes();
        // extractPlannedVotes filters to only planned model keys before returning to client
        return NextResponse.json({
            votes: extractPlannedVotes(votes),
            totalVoters: votes.totalVoters,
        });
    } catch {
        return NextResponse.json({ error: 'Failed to read votes' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { rankings, previousRankings } = body as { rankings: unknown; previousRankings?: unknown };

    if (!isValidRankings(rankings, plannedModelKeys)) {
        return NextResponse.json({ error: 'Invalid rankings' }, { status: 400 });
    }

    // Validate previousRankings before checking cookie, so a malformed previousRankings
    // never reaches the write path (which would incorrectly increment totalVoters).
    if (previousRankings !== undefined && !isValidRankings(previousRankings, plannedModelKeys)) {
        return NextResponse.json({ error: 'Invalid previousRankings' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const existingCookie = cookieStore.get(COOKIE_NAME)?.value;

    if (!previousRankings && existingCookie) {
        return NextResponse.json({ error: 'Cookie present but no previousRankings supplied' }, { status: 409 });
    }

    try {
        let votes = await readVotes();

        if (isValidRankings(previousRankings, plannedModelKeys)) {
            // Vote change: subtract old points, do not increment totalVoters
            votes = applyWeightedPoints(votes, previousRankings, -1);
        } else {
            // New vote
            votes.totalVoters = (votes.totalVoters ?? 0) + 1;
        }

        votes = applyWeightedPoints(votes, rankings, 1);
        await writeVotes(votes);

        const isProduction = process.env.NODE_ENV === 'production';
        const cookieValue = JSON.stringify(rankings);

        const response = NextResponse.json({
            votes: extractPlannedVotes(votes),
            totalVoters: votes.totalVoters,
        });

        response.cookies.set(COOKIE_NAME, cookieValue, {
            maxAge: COOKIE_MAX_AGE,
            sameSite: 'lax',
            secure: isProduction,
            httpOnly: false,
            path: '/',
        });

        return response;
    } catch {
        return NextResponse.json({ error: 'Failed to write votes' }, { status: 500 });
    }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/relay-votes/route.ts
git commit -m "feat: add relay-votes API route (GET + POST with vote change support)"
```

---

## Task 4: Add `rank`, `percentage`, `onSelect` props to `RelayModelCard`

**Files:**
- Modify: `components/doc/relay-model-grid.tsx`

The existing `RelayModelCard` renders either a `<Link>` or `<div>`. We add `onSelect` (makes it a `<button>`), `rank` (badge), and `percentage` (bar).

- [ ] **Step 1: Update `components/doc/relay-model-grid.tsx`**

Replace the file with:

```tsx
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type ModelStatus = 'available' | 'planned';

interface RelayModelCardProps {
    name: string;
    tagline: string;
    genres: string;
    description: string;
    status: ModelStatus;
    href?: string;
    rank?: 1 | 2 | 3;
    percentage?: number;
    onSelect?: () => void;
}

function StatusBadge({ status }: { status: ModelStatus }) {
    if (status === 'available') {
        return (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Available
            </span>
        );
    }
    return (
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Planned
        </span>
    );
}

const RANK_BADGE_STYLES: Record<1 | 2 | 3, string> = {
    1: 'bg-indigo-500 text-white',
    2: 'bg-slate-600 text-slate-200',
    3: 'bg-slate-700 text-slate-400',
};

const RANK_BORDER_STYLES: Record<1 | 2 | 3, string> = {
    1: 'border-indigo-500 shadow-[0_0_0_1px_theme(colors.indigo.500)]',
    2: 'border-slate-600',
    3: 'border-slate-700',
};

const RANK_BAR_STYLES: Record<1 | 2 | 3, string> = {
    1: 'bg-indigo-500',
    2: 'bg-slate-600',
    3: 'bg-slate-700',
};

const RANK_PCT_LABEL_STYLES: Record<1 | 2 | 3, string> = {
    1: 'text-indigo-400',
    2: 'text-slate-500',
    3: 'text-slate-600',
};

export function RelayModelCard({ name, tagline, genres, description, status, href, rank, percentage, onSelect }: RelayModelCardProps) {
    const inner = (
        <div
            className={cn(
                'flex h-full flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all',
                href && 'group-hover:border-sky-500 group-hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]',
                onSelect && 'cursor-pointer hover:border-slate-600',
                rank && RANK_BORDER_STYLES[rank],
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <h3
                    className={cn(
                        'font-semibold text-foreground',
                        href && 'transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400',
                    )}
                >
                    {name}
                </h3>
                <div className="flex shrink-0 items-center gap-2">
                    {rank && (
                        <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold', RANK_BADGE_STYLES[rank])}>
                            {rank}
                        </span>
                    )}
                    <StatusBadge status={status} />
                </div>
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{tagline}</p>
            <p className="flex-1 text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground/70">{genres}</p>
            {percentage !== undefined && (
                <div className="mt-1">
                    <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                        <div
                            className={cn('h-full rounded-full transition-all duration-500', rank ? RANK_BAR_STYLES[rank] : 'bg-slate-600')}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <p className={cn('mt-1 text-xs font-semibold', rank ? RANK_PCT_LABEL_STYLES[rank] : 'text-muted-foreground')}>
                        {rank ? `Your #${rank} · ` : ''}{Math.round(percentage)}%
                    </p>
                </div>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="group block">
                {inner}
            </Link>
        );
    }

    if (onSelect) {
        return (
            <button type="button" onClick={onSelect} className="block w-full text-left">
                {inner}
            </button>
        );
    }

    return <div>{inner}</div>;
}

interface RelayModelGridProps {
    children: React.ReactNode;
}

export function RelayModelGrid({ children }: RelayModelGridProps) {
    return <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/doc/relay-model-grid.tsx
git commit -m "feat: add rank, percentage, onSelect props to RelayModelCard"
```

---

## Task 5: Create `components/relay/relay-vote-grid.tsx`

**Files:**
- Create: `components/relay/relay-vote-grid.tsx`

This is the client component with three states: `idle`, `submitting`, `results`.

- [ ] **Step 1: Create `components/relay/relay-vote-grid.tsx`**

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { relayModels } from '@/config/relay-models';
import { RelayModelCard } from '@/components/doc/relay-model-grid';

type VoteState = 'idle' | 'submitting' | 'results';

interface VoteTotals {
    [modelKey: string]: { points: number };
}

const COOKIE_NAME = 'relay-model-vote';

function readVoteCookie(): string[] | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.split('; ').find((row) => row.startsWith(`${COOKIE_NAME}=`));
    if (!match) return null;
    try {
        return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')));
    } catch {
        return null;
    }
}

function computePercentages(votes: VoteTotals): Record<string, number> {
    const plannedKeys = relayModels.filter((m) => m.status === 'planned').map((m) => m.modelKey);
    const totalPoints = plannedKeys.reduce((sum, key) => sum + (votes[key]?.points ?? 0), 0);
    const pcts: Record<string, number> = {};
    for (const key of plannedKeys) {
        pcts[key] = totalPoints > 0 ? ((votes[key]?.points ?? 0) / totalPoints) * 100 : 0;
    }
    return pcts;
}

function hintText(count: number): { prefix: string; highlight: string } {
    if (count === 0) return { prefix: 'Click a card to rank it ', highlight: '#1' };
    if (count === 1) return { prefix: 'Now pick your ', highlight: '#2 — or submit with just one' };
    if (count === 2) return { prefix: 'Pick one more for ', highlight: '#3 — or submit now' };
    return { prefix: 'All 3 ranked. Click a card to remove it, or ', highlight: 'submit' };
}

export function RelayVoteGrid() {
    const [voteState, setVoteState] = useState<VoteState>('idle');
    const [rankings, setRankings] = useState<string[]>([]);
    const [votes, setVotes] = useState<VoteTotals>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const cookieRankings = readVoteCookie();
        fetch('/api/relay-votes')
            .then((r) => r.json())
            .then((data) => {
                setVotes(data.votes ?? {});
                if (cookieRankings) {
                    setRankings(cookieRankings);
                    setVoteState('results');
                }
            })
            .catch(() => {
                // Non-fatal: show idle state without percentages
            });
    }, []);

    function toggleRank(modelKey: string) {
        setRankings((prev) => {
            const idx = prev.indexOf(modelKey);
            if (idx !== -1) {
                const next = [...prev];
                next.splice(idx, 1);
                return next;
            }
            if (prev.length >= 3) return prev;
            return [...prev, modelKey];
        });
    }

    async function submitVote() {
        setVoteState('submitting');
        setError(null);
        const previousRankings = readVoteCookie();
        const body: { rankings: string[]; previousRankings?: string[] } = { rankings };
        if (previousRankings) body.previousRankings = previousRankings;

        try {
            const res = await fetch('/api/relay-votes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error('non-200');
            const data = await res.json();
            setVotes(data.votes ?? {});
            setVoteState('results');
        } catch {
            setError("Something went wrong — your vote wasn't saved. Try again.");
            setVoteState('idle');
        }
    }

    function changeVote() {
        setVoteState('idle');
        // rankings already reflect cookie; user can adjust and resubmit
    }

    const percentages = computePercentages(votes);
    const hint = hintText(rankings.length);
    const isSubmitting = voteState === 'submitting';
    const isResults = voteState === 'results';

    return (
        <div className="my-6">
            <div className={isSubmitting ? 'pointer-events-none' : undefined}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {relayModels.map((model) => {
                        const rankIndex = rankings.indexOf(model.modelKey);
                        const rank = rankIndex !== -1 ? ((rankIndex + 1) as 1 | 2 | 3) : undefined;
                        const isPlanned = model.status === 'planned';

                        if (!isPlanned) {
                            return (
                                <div key={model.modelKey} className="opacity-40">
                                    <RelayModelCard
                                        name={model.name}
                                        tagline={model.tagline}
                                        genres={model.genres}
                                        description={model.description}
                                        status={model.status}
                                        href={model.href}
                                    />
                                    <p className="mt-1 text-xs italic text-muted-foreground/60">Already built — not part of the vote.</p>
                                </div>
                            );
                        }

                        return (
                            <RelayModelCard
                                key={model.modelKey}
                                name={model.name}
                                tagline={model.tagline}
                                genres={model.genres}
                                description={model.description}
                                status={model.status}
                                rank={rank}
                                percentage={isResults ? percentages[model.modelKey] : undefined}
                                onSelect={!isResults ? () => toggleRank(model.modelKey) : undefined}
                            />
                        );
                    })}
                </div>
            </div>

            {!isResults && (
                <div className="mt-4">
                    <p className="text-sm text-muted-foreground">
                        {hint.prefix}
                        <strong className="text-indigo-400">{hint.highlight}</strong>
                    </p>
                    {rankings.length > 0 && (
                        <button
                            type="button"
                            onClick={submitVote}
                            disabled={isSubmitting}
                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
                        >
                            {isSubmitting && (
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                            )}
                            Submit my rankings
                        </button>
                    )}
                    {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
                </div>
            )}

            {isResults && (
                <div className="mt-4">
                    <p className="text-xs text-muted-foreground">Weighted score: 3 pts for #1, 2 pts for #2, 1 pt for #3 — planned models only.</p>
                    <button
                        type="button"
                        onClick={changeVote}
                        className="mt-2 text-sm font-medium text-indigo-400 underline underline-offset-2 hover:text-indigo-300"
                    >
                        Change my vote
                    </button>
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/relay/relay-vote-grid.tsx
git commit -m "feat: add RelayVoteGrid client component (idle/submitting/results states)"
```

---

## Task 6: Wire up MDX and replace inline content

**Files:**
- Modify: `components/mdx-components.tsx`
- Modify: `content/relay/index.mdx`

- [ ] **Step 1: Register `RelayVoteGrid` in `components/mdx-components.tsx`**

Add import after the existing relay-model-grid import:

```ts
import { RelayVoteGrid } from '@/components/relay/relay-vote-grid';
```

Add to the `components` object, after the `RelayModelCard` entry:

```ts
RelayVoteGrid,
```

- [ ] **Step 2: Replace inline grid in `content/relay/index.mdx`**

Locate the `<RelayModelGrid>` opening tag and its matching `</RelayModelGrid>` closing tag (the entire block including all inline `<RelayModelCard>` children). Replace the entire block with:

```mdx
<RelayVoteGrid />
```

The surrounding prose and the "## The models" heading stay unchanged.

- [ ] **Step 3: Start dev server and verify the page renders**

```bash
npm run dev
```

Open `http://localhost:3000/docs/relay`. Verify:
- All 6 model cards render
- Lipstick card is dimmed and non-interactive
- Clicking planned cards assigns rank badges (1, 2, 3)
- Submit button appears after first selection
- Submitting transitions to results view with percentage bars
- "Change my vote" button is visible in results state

Note: Netlify Blobs does not work in local dev without `netlify dev`. Votes will fail with a 500 error on submit. The UI error handling ("Something went wrong...") should display. Full Blobs integration is only testable on a Netlify preview deploy.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/mdx-components.tsx content/relay/index.mdx
git commit -m "feat: wire RelayVoteGrid into MDX and replace inline model grid"
```

---

## Task 7: Run full test suite

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected: all tests pass, including the new `lib/relay-votes.test.ts`.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: build succeeds with no type errors.

- [ ] **Step 3: Commit if any fixes were needed**

If any issues were found and fixed in the above steps, commit those fixes now.
