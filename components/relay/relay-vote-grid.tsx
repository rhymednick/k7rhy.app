'use client';

import React, { useEffect, useState } from 'react';
import { relayModels } from '@/config/relay-models';
import { RelayModelCard } from '@/components/doc/relay-model-grid';

type VoteState = 'browsing' | 'voting' | 'submitting' | 'results';

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
    const [voteState, setVoteState] = useState<VoteState>('browsing');
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
                // Non-fatal: stay in browsing state
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
            setVoteState('voting');
        }
    }

    function changeVote() {
        setVoteState('voting');
        // rankings already reflect cookie; user can adjust and resubmit
    }

    const percentages = computePercentages(votes);
    const hint = hintText(rankings.length);
    const isVoting = voteState === 'voting';
    const isSubmitting = voteState === 'submitting';
    const isResults = voteState === 'results';
    const showVoteUI = isVoting || isSubmitting || isResults;

    return (
        <div className="my-6">
            {!showVoteUI && (
                <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-card p-5">
                    <div>
                        <p className="text-sm font-medium text-foreground">Which model should I develop next?</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            These are all of the models I am planning to develop. If you have a preference, let me know — I use the results to help decide which to prioritize.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setVoteState('voting')}
                        className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                    >
                        Vote
                    </button>
                </div>
            )}

            {showVoteUI && !isResults && (
                <div className="mb-5">
                    <p className="text-sm font-medium text-foreground">Rank your top 3 planned models</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        These are models in development. Pick up to three, ranked by preference — I use the results to decide what to build next.
                    </p>
                </div>
            )}

            <div className={isSubmitting ? 'pointer-events-none' : undefined}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {relayModels.map((model) => {
                        const rankIndex = rankings.indexOf(model.modelKey);
                        const rank = rankIndex !== -1 ? ((rankIndex + 1) as 1 | 2 | 3) : undefined;
                        const isPlanned = model.status === 'planned';

                        return (
                            <RelayModelCard
                                key={model.modelKey}
                                name={model.name}
                                tagline={model.tagline}
                                genres={model.genres}
                                description={model.description}
                                status={model.status}
                                href={!showVoteUI ? model.href : undefined}
                                rank={showVoteUI ? rank : undefined}
                                percentage={isResults ? percentages[model.modelKey] : undefined}
                                onSelect={isVoting && isPlanned ? () => toggleRank(model.modelKey) : undefined}
                            />
                        );
                    })}
                </div>
            </div>

            {isVoting && (
                <div className="mt-4">
                    <p className="text-sm text-muted-foreground">
                        {hint.prefix}
                        <strong className="text-indigo-400">{hint.highlight}</strong>
                    </p>
                    {rankings.length > 0 && (
                        <div className="mt-3 flex items-center gap-4">
                            <button
                                type="button"
                                onClick={submitVote}
                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                            >
                                Submit my rankings
                            </button>
                            <button
                                type="button"
                                onClick={() => { setVoteState('browsing'); setRankings([]); }}
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                    {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
                </div>
            )}

            {isSubmitting && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving your vote…
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
