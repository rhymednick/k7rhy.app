import type { RelayNav, RelayPlatformNav } from '@/types/relay-nav';

export const relayPlatformNav: RelayPlatformNav = {
    sections: [
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
};
