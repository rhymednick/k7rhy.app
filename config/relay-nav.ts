import type { RelayNav, RelayPlatformNav } from '@/types/relay-nav';

// Phase 1: no build guide sections exist yet. Sections added per phase.
export const relayPlatformNav: RelayPlatformNav = {
    sections: [],
};

export const relayNav: RelayNav = {
    lipstick: {
        title: 'Relay Lipstick',
        status: 'ready',
        sections: [
            {
                title: 'Electronics',
                items: [
                    { title: 'Parts List', slug: 'bom' },
                    { title: 'Wiring Guide', slug: 'wiring' },
                ],
            },
        ],
    },
    reef: {
        title: 'Relay Reef',
        status: 'lab',
        sections: [],
    },
    velvet: {
        title: 'Relay Velvet',
        status: 'ready',
        sections: [
            {
                title: 'Electronics',
                items: [
                    { title: 'Parts List', slug: 'bom' },
                    { title: 'Wiring Guide', slug: 'wiring' },
                ],
            },
        ],
    },
    arc: {
        title: 'Relay Arc',
        status: 'lab',
        sections: [],
    },
    torch: {
        title: 'Relay Torch',
        status: 'ready',
        sections: [
            {
                title: 'Electronics',
                items: [
                    { title: 'Parts List', slug: 'bom' },
                    { title: 'Wiring Guide', slug: 'wiring' },
                ],
            },
        ],
    },
    current: {
        title: 'Relay Current',
        status: 'lab',
        sections: [],
    },
    hammer: {
        title: 'Relay Hammer',
        status: 'concept',
        sections: [],
    },
};
