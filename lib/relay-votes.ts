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
    [modelKey: string]: ModelVote | number;
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
        const entry = result[modelKey];
        const current = typeof entry === 'object' && entry !== null ? entry.points : 0;
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
        const entry = votes[key];
        result[key] = typeof entry === 'object' && entry !== null ? (entry as ModelVote) : { points: 0 };
    }
    return result;
}
