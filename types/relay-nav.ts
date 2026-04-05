export interface RelayNavItem {
    title: string;
    slug: string;
}

export interface RelayNavSection {
    title: string;
    slug?: string;
    items?: RelayNavItem[];
}

export interface RelayModelNav {
    title: string;
    status: 'available' | 'planned';
    sections: RelayNavSection[];
}

export interface RelayNav {
    [model: string]: RelayModelNav;
}

/** Platform-level nav — sections shared across all models. */
export interface RelayPlatformNav {
    sections: RelayNavSection[];
}
