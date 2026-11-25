import type { RelayCustomize, RelayCustomizePart, RelayCustomizeSeries } from '@/types/relay-nav';

const topicHref = '/guitars/relay/customize/treble-bleed';

function part(series: RelayCustomizeSeries['slug'], slug: string, title: string, summary: string): RelayCustomizePart {
    return { slug, title, summary, href: `${topicHref}/${series}/${slug}` };
}

/** The Relay Customize section: optional changes to a finished or in-progress guitar. Drives the sidebar group, the landing page links and the series routes. */
export const relayCustomize: RelayCustomize = {
    title: 'Customize',
    href: '/guitars/relay/customize',
    topic: { slug: 'treble-bleed', title: 'Treble bleed' },
    series: [
        {
            slug: 'understand',
            title: 'Understand',
            summary: 'What a treble bleed does to the highs as you turn the volume down, in three short parts.',
            parts: [part('understand', 'why-turning-down-dulls', 'Why turning down makes it dull', 'What the volume knob does to the signal, and why turning it down makes a guitar dull as well as quiet.'), part('understand', 'what-a-bleed-does', 'What a bleed does', 'How a treble bleed keeps the highs from fading, the usual ways to build one, and where a fixed bleed falls short.'), part('understand', 'the-reactive-bleed', 'The reactive bleed', 'How a reactive bleed follows the tone knob, and how Direct, Off and Reactive compare.')],
        },
        {
            slug: 'build',
            title: 'Build',
            summary: 'An alternative tone wiring with a three-way Direct / Off / Reactive switch, in five short parts.',
            parts: [part('build', 'is-it-a-fit', 'Is your guitar a fit?', 'What the switch does, and how to tell whether your guitar is wired the way it needs.'), part('build', 'parts-and-hole', 'Parts, values and the hole', 'The parts you need, the bleed values for your volume pot, and how to make room for the switch.'), part('build', 'what-changes-and-lugs', 'What changes and finding your lugs', 'What the retrofit changes in the circuit, and how to find each lug with a meter.'), part('build', 'wire-it-and-check', 'Wire it and check it', 'The numbered wiring steps and the bench checks that prove the three modes work.'), part('build', 'reference-and-troubleshooting', 'Reference sheet and troubleshooting', 'The one-page reference sheet, the tables, a Lipstick worked example, tuning by ear, and troubleshooting.')],
        },
    ],
};

export interface RelayCustomizePartLocation {
    series: RelayCustomizeSeries;
    part: RelayCustomizePart;
    /** Zero-based position of the part within its series. */
    index: number;
    total: number;
    prev?: { title: string; href: string };
    next?: { title: string; href: string };
}

/** Finds a part by series and part slug, with its neighbours. A neighbour in the other series is titled "Series: Part". */
export function getRelayCustomizePart(seriesSlug: string, partSlug: string): RelayCustomizePartLocation | undefined {
    const flat = relayCustomize.series.flatMap((series) => series.parts.map((p) => ({ series, part: p })));
    const at = flat.findIndex((entry) => entry.series.slug === seriesSlug && entry.part.slug === partSlug);
    if (at === -1) return undefined;
    const here = flat[at];
    const neighbour = (entry: (typeof flat)[number] | undefined) => (entry ? { title: entry.series === here.series ? entry.part.title : `${entry.series.title}: ${entry.part.title}`, href: entry.part.href } : undefined);
    return {
        series: here.series,
        part: here.part,
        index: here.series.parts.indexOf(here.part),
        total: here.series.parts.length,
        prev: neighbour(flat[at - 1]),
        next: neighbour(flat[at + 1]),
    };
}
