import { describe, expect, it } from 'vitest';
import { sortRelayVoicings } from './relay-voicing-lineup-nav';

describe('sortRelayVoicings', () => {
    it('sorts by status priority, then name alphabetically', () => {
        const voicings = [
            { slug: 'current', name: 'Relay Current', status: 'lab' as const },
            { slug: 'hammer', name: 'Relay Hammer', status: 'concept' as const },
            { slug: 'torch', name: 'Relay Torch', status: 'ready' as const },
            { slug: 'arc', name: 'Relay Arc', status: 'lab' as const },
            { slug: 'lipstick', name: 'Relay Lipstick', status: 'ready' as const },
        ];

        expect(sortRelayVoicings(voicings).map((v) => v.slug)).toEqual(['lipstick', 'torch', 'arc', 'current', 'hammer']);
    });
});
