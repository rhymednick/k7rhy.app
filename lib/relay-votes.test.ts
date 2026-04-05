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
