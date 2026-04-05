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
