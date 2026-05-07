import type { RelayBuildProcess } from '@/types/relay-nav';

/**
 * Build process stages used by both the homepage RelayProcessOverview and the sidebar nav.
 * Flipping a stage's status here updates both surfaces. Discord links use the server
 * invite for now; channel-specific deeplinks can be swapped in via this file when
 * Discord-side configuration is done.
 */
const DISCORD_INVITE = 'https://discord.gg/BuUxCG4W6w';

export const relayBuildProcess: RelayBuildProcess = {
    stages: [
        {
            slug: 'body',
            title: 'Body',
            number: 1,
            status: 'in-progress',
            summary: 'Print, bond, cure, and finish the shared double-cut body. Same body for every voicing.',
            href: DISCORD_INVITE,
            isDiscord: true,
        },
        {
            slug: 'voicings',
            title: 'Voicings',
            number: 2,
            status: 'live',
            summary: 'Choose how the guitar sounds. Seven voicings with their own pickup map, controls, and parts list.',
            href: '/relay/voicings',
            items: [
                { title: 'Lipstick', href: '/relay/voicings/lipstick' },
                { title: 'Reef', href: '/relay/voicings/reef' },
                { title: 'Velvet', href: '/relay/voicings/velvet' },
                { title: 'Arc', href: '/relay/voicings/arc' },
                { title: 'Torch', href: '/relay/voicings/torch' },
                { title: 'Current', href: '/relay/voicings/current' },
                { title: 'Hammer', href: '/relay/voicings/hammer' },
            ],
        },
        {
            slug: 'assembly',
            title: 'Assembly',
            number: 3,
            status: 'planned',
            summary: 'Final assembly and setup. Hardware install, wiring, intonation, action.',
            href: DISCORD_INVITE,
            isDiscord: true,
        },
    ],
};
