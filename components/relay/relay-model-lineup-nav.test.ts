import { describe, expect, it } from 'vitest';
import { sortRelayModelNavEntries } from './relay-model-lineup-nav';
import type { RelayModelNav } from '@/types/relay-nav';

describe('sortRelayModelNavEntries', () => {
    it('sorts by status priority, then title alphabetically', () => {
        const entries: Array<[string, RelayModelNav]> = [
            ['current', { title: 'Relay Current', status: 'lab', sections: [] }],
            ['hammer', { title: 'Relay Hammer', status: 'concept', sections: [] }],
            ['torch', { title: 'Relay Torch', status: 'ready', sections: [] }],
            ['arc', { title: 'Relay Arc', status: 'lab', sections: [] }],
            ['lipstick', { title: 'Relay Lipstick', status: 'ready', sections: [] }],
        ];

        expect(sortRelayModelNavEntries(entries).map(([key]) => key)).toEqual(['lipstick', 'torch', 'arc', 'current', 'hammer']);
    });
});
