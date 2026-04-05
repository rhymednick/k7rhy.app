import type { RelayNav, RelayPlatformNav } from '@/types/relay-nav';

export const relayPlatformNav: RelayPlatformNav = {
    sections: [
        {
            title: 'Getting started',
            items: [
                { title: 'Choosing a model', slug: 'printing/choose-model' },
                { title: 'What building takes', slug: 'printing/build-expectations' },
            ],
        },
        {
            title: 'Printing',
            items: [
                { title: 'Overview', slug: 'printing/overview' },
                { title: 'Parameters', slug: 'printing/parameters' },
                { title: 'Customization', slug: 'printing/customization' },
                { title: 'Body Parts List', slug: 'printing/bom' },
            ],
        },
        {
            title: 'Assembling the Body',
            items: [{ title: 'Overview', slug: 'build/body' }],
        },
        {
            title: 'Hardware Installation',
            items: [
                { title: 'Overview', slug: 'assembly/overview' },
                { title: 'Checkpoints', slug: 'assembly/checkpoints' },
            ],
        },
        {
            title: 'Wiring & Electronics',
            items: [
                { title: 'Overview', slug: 'electronics/overview' },
                { title: 'Wiring', slug: 'electronics/wiring' },
                { title: 'Design Boundaries', slug: 'electronics/design-boundaries' },
            ],
        },
        {
            title: 'Making It Playable',
            items: [
                { title: 'Getting Playable', slug: 'setup/playable' },
                { title: 'Fine-Tuning', slug: 'setup/optimization' },
                { title: 'When to Call a Luthier', slug: 'setup/professional' },
            ],
        },
    ],
};

export const relayNav: RelayNav = {
    lipstick: {
        title: 'Relay Lipstick',
        status: 'available',
        sections: [
            {
                title: 'Relay Lipstick',
                items: [
                    { title: 'Instrument Parts List', slug: 'bom' },
                    { title: 'Compatibility', slug: 'compatibility' },
                ],
            },
        ],
    },
    velvet: {
        title: 'Relay Velvet',
        status: 'planned',
        sections: [{ title: 'Relay Velvet', items: [] }],
    },
    arc: {
        title: 'Relay Arc',
        status: 'planned',
        sections: [{ title: 'Relay Arc', items: [] }],
    },
    torch: {
        title: 'Relay Torch',
        status: 'planned',
        sections: [{ title: 'Relay Torch', items: [] }],
    },
    current: {
        title: 'Relay Current',
        status: 'planned',
        sections: [{ title: 'Relay Current', items: [] }],
    },
    hammer: {
        title: 'Relay Hammer',
        status: 'planned',
        sections: [{ title: 'Relay Hammer', items: [] }],
    },
};
