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
            title: 'Body Construction',
            items: [{ title: 'Building the Body', slug: 'build/body' }],
        },
        {
            title: 'Assembly',
            items: [
                { title: 'Guitar Assembly', slug: 'assembly/overview' },
                { title: 'Checkpoints', slug: 'assembly/checkpoints' },
            ],
        },
        {
            title: 'Setup',
            items: [
                { title: 'Getting Playable', slug: 'setup/playable' },
                { title: 'Optimization', slug: 'setup/optimization' },
                { title: 'Professional Setup', slug: 'setup/professional' },
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
            {
                title: 'Electronics',
                items: [
                    { title: 'Overview', slug: 'electronics/overview' },
                    { title: 'Wiring', slug: 'electronics/wiring' },
                    { title: 'Design Boundaries', slug: 'electronics/design-boundaries' },
                ],
            },
        ],
    },
};
