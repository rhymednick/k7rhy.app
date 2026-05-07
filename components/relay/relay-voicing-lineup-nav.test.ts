import { describe, expect, it } from 'vitest';
import { sortRelayVoicingNavEntries } from './relay-voicing-lineup-nav';
import type { RelayVoicingNav } from '@/types/relay-nav';

describe('sortRelayVoicingNavEntries', () => {
    it('sorts by status priority, then title alphabetically', () => {
        const entries: Array<[string, RelayVoicingNav]> = [
            ['current', { title: 'Relay Current', status: 'lab', sections: [] }],
            ['hammer', { title: 'Relay Hammer', status: 'concept', sections: [] }],
            ['torch', { title: 'Relay Torch', status: 'ready', sections: [] }],
            ['arc', { title: 'Relay Arc', status: 'lab', sections: [] }],
            ['lipstick', { title: 'Relay Lipstick', status: 'ready', sections: [] }],
        ];

        expect(sortRelayVoicingNavEntries(entries).map(([slug]) => slug)).toEqual(['lipstick', 'torch', 'arc', 'current', 'hammer']);
    });
});
