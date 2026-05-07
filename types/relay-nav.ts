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
