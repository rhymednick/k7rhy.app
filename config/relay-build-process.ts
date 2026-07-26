import type { RelayBuildProcess } from '@/types/relay-nav';

/**
 * The Relay build process. Drives the master sidebar nav and the homepage
 * RelayProcessOverview. Body and Voicing carry sub-items (shown when active);
 * Parts and Wiring fork by voicing on their own pages.
 */
export const relayBuildProcess: RelayBuildProcess = {
    stages: [
        {
            slug: 'body',
            title: 'Body',
            number: 1,
            status: 'live',
            summary: 'Print, bond, cure, and finish the shared double-cut body. Same body for every voicing.',
            href: '/guitars/relay/body',
            items: [
                { title: 'Print', href: '/guitars/relay/body/print' },
                { title: 'Bonding', href: '/guitars/relay/body/bonding' },
                { title: 'Finishing', href: '/guitars/relay/body/finishing' },
            ],
        },
        {
            slug: 'voicings',
            title: 'Voicing',
            number: 2,
            status: 'live',
            summary: 'Choose how the guitar sounds. Each voicing wires the same body a different way.',
            href: '/guitars/relay/voicings',
            items: [
                { title: 'Lipstick', href: '/guitars/relay/voicings/lipstick' },
                { title: 'Reef', href: '/guitars/relay/voicings/reef' },
                { title: 'Velvet', href: '/guitars/relay/voicings/velvet' },
                { title: 'Arc', href: '/guitars/relay/voicings/arc' },
                { title: 'Torch', href: '/guitars/relay/voicings/torch' },
                { title: 'Current', href: '/guitars/relay/voicings/current' },
                { title: 'Hammer', href: '/guitars/relay/voicings/hammer' },
            ],
        },
        {
            slug: 'parts',
            title: 'Parts',
            number: 3,
            status: 'live',
            summary: 'Gather everything for your chosen voicing — shared hardware plus its electronics — in one list.',
            href: '/guitars/relay/parts',
        },
        {
            slug: 'wiring',
            title: 'Wiring',
            number: 4,
            status: 'live',
            summary: 'Build and bench-test the harness for your voicing before it goes in the body.',
            href: '/guitars/relay/wiring',
        },
        {
            slug: 'assembly',
            title: 'Assembly',
            number: 5,
            status: 'in-progress',
            summary: 'Mount the hardware, install the harness, string it, and set it up.',
            href: '/guitars/relay/assembly',
        },
    ],
};
