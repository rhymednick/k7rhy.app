export const relayComponentCategories = ['Body Construction', 'Guitar Hardware', 'Electronics'] as const;

export type RelayComponentCategory = (typeof relayComponentCategories)[number];
export type RelayComponentScope = 'common' | 'model';
export type RelayComponentSpecificity = 'specific' | 'flexible';

export interface RelayComponentSource {
    label: string;
    href: string;
}

export interface RelayComponentRecord {
    id: string;
    title: string;
    category: RelayComponentCategory;
    order: number;
    quantity: string;
    scope: RelayComponentScope;
    specificity: RelayComponentSpecificity;
    source: RelayComponentSource;
    priceKey: string;
    fallbackPrice: string;
    substitution?: string;
    content: string;
}

export interface RelayModelComponentManifest {
    model: string;
    components: string[];
}

export interface ResolvedRelayComponentList {
    selectedModel?: string;
    components: RelayComponentRecord[];
    allModelSpecificComponents: RelayComponentRecord[];
    hasModelSpecificChoices: boolean;
}
