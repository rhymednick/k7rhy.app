import type { RelayCustomize } from '@/types/relay-nav';

/** The Relay Customize section: optional changes to a finished or in-progress guitar. Drives the sidebar group. */
export const relayCustomize: RelayCustomize = {
    title: 'Customize',
    href: '/guitars/relay/customize',
    pages: [
        {
            slug: 'how-treble-bleeds-work',
            title: 'How treble bleeds work',
            summary: 'What a treble bleed does to the highs as you turn the volume down, and the ways to build one.',
            href: '/guitars/relay/customize/how-treble-bleeds-work',
        },
        {
            slug: 'direct-off-reactive-switch',
            title: 'Direct / Off / Reactive switch',
            summary: 'An alternative tone wiring with a three-way switch for the tone circuit.',
            href: '/guitars/relay/customize/direct-off-reactive-switch',
        },
    ],
};
