export interface RelayModel {
    modelKey: string;
    name: string;
    tagline: string;
    genres: string;
    description: string;
    status: 'lab' | 'ready';
    href?: string;
}

export type RelayModelStatus = 'lab' | 'ready';
