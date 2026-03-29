import type { RelayNav } from '@/types/relay-nav';

export const relayNav: RelayNav = {
    lipstick: {
        title: 'Lipstick',
        sections: [
            {
                title: 'Planning',
                items: [
                    { title: 'Bill of Materials', slug: 'planning/bom' },
                    { title: 'Compatibility', slug: 'planning/compatibility' },
                ],
            },
            {
                title: 'Printing',
                items: [
                    { title: 'Overview', slug: 'printing/overview' },
                    { title: 'Parameters', slug: 'printing/parameters' },
                    { title: 'Customization', slug: 'printing/customization' },
                ],
            },
            {
                title: 'Build',
                items: [{ title: 'Body Assembly', slug: 'build/body' }],
            },
            {
                title: 'Electronics',
                items: [
                    { title: 'Overview', slug: 'electronics/overview' },
                    { title: 'Wiring', slug: 'electronics/wiring' },
                    { title: 'Design Boundaries', slug: 'electronics/design-boundaries' },
                ],
            },
            {
                title: 'Assembly',
                items: [
                    { title: 'Overview', slug: 'assembly/overview' },
                    { title: 'Build Sequences', slug: 'assembly/sequences' },
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
    },
};
