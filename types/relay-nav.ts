import type { RelayVoicingStatus } from '@/types/relay-voicing';

export interface RelayNavItem {
    title: string;
    slug: string;
}

export interface RelayNavSection {
    title: string;
    slug?: string;
    items?: RelayNavItem[];
}

export interface RelayVoicingNav {
    title: string;
    status: RelayVoicingStatus;
    sections: RelayNavSection[];
}

export interface RelayNav {
    [voicingSlug: string]: RelayVoicingNav;
}

/** Platform-level nav — sections shared across all voicings. */
export interface RelayPlatformNav {
    sections: RelayNavSection[];
}

/** Build process status: drives the badge + whether the link goes to a page or Discord. */
export type RelayStageStatus = 'live' | 'in-progress' | 'planned';

/** A child link under a build stage in the sidebar (e.g. "Parts", a voicing slug). */
export interface RelayStageItem {
    title: string;
    href: string;
    /** When true, the link is a Discord channel rather than an in-site route. */
    isDiscord?: boolean;
}

/** One stage of the build process: Body / Voicings / Assembly. */
export interface RelayBuildStage {
    slug: 'body' | 'voicings' | 'assembly';
    title: string;
    number: 1 | 2 | 3;
    status: RelayStageStatus;
    summary: string;
    /** Where the card and the sidebar entry link to. Page route for Live stages, Discord URL for non-Live. */
    href: string;
    /** True when `href` points to Discord; false/undefined for in-site routes. */
    isDiscord?: boolean;
    /** Sub-items under this stage in the sidebar nav. Empty for stages with no sub-pages yet. */
    items?: RelayStageItem[];
}

export interface RelayBuildProcess {
    stages: RelayBuildStage[];
}
