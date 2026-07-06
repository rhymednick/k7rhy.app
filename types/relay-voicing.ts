export interface RelayVoicing {
    slug: string;
    name: string;
    tagline: string;
    genres: string;
    description: string;
    status: RelayVoicingStatus;
    interaction: RelayVoicingInteraction;
    pickupMap: RelayVoicingPickupMap;
    href?: string;
}

export type RelayVoicingStatus = 'lab' | 'ready' | 'concept';

export type RelayPickupType = 'humbucker' | 'lipstick' | 'p90' | 'rail' | 'filtertron';
export type RelayPickupRole = 'core' | 'primary' | 'shaper' | 'augment' | 'subsystem' | 'concept';

export interface RelayPickupSlot {
    type: RelayPickupType;
    magnet?: string;
    resistance?: string;
    role?: RelayPickupRole;
}

export interface RelayVoicingPickupMap {
    bridge: RelayPickupSlot;
    middle: RelayPickupSlot;
    neck: RelayPickupSlot;
    selector: '3-way' | '5-way' | 'super-switch';
    volume?: 'standard' | 'push-push' | 'push-pull' | 'concentric';
    tone?: 'standard' | 'push-pull' | 'push-push' | 'concentric';
}

export interface RelayVoicingInteraction {
    category: 'Primary voice' | 'Augment layer' | 'Subsystem' | 'Shaper' | 'Concept';
    summary: string;
}
