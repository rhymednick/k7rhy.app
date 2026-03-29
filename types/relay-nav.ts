export interface RelayNavItem {
    title: string;
    slug: string; // relative to model root, e.g. 'printing/parameters'
}

export interface RelayNavSection {
    title: string;
    items: RelayNavItem[];
}

export interface RelayModelNav {
    title: string;
    sections: RelayNavSection[];
}

export interface RelayNav {
    [model: string]: RelayModelNav;
}
