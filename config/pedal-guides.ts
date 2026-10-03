import { DocIndexItem, DocIndexItemType } from '@/components/doc/doc-index-card';

// Pedal build guides linked from /guitars and /guitars/pedals.
// The guide pages themselves stay noindex and out of the sitemap until the owner releases them.
export const pedalGuides: DocIndexItem[] = [
    { title: 'Fuzz Face', href: '/guitars/pedals/fuzz-face', description: 'Two-transistor 2N3904 fuzz with a bias trimmer. Prototype built and working.', type: DocIndexItemType.Internal },
    { title: 'Bazz Fuss', href: '/guitars/pedals/bazz-fuss', description: 'One-knob fuzz from a silicon Darlington pair, with 1N4148 or LED clipping. Prototype design, not built yet.', type: DocIndexItemType.Internal },
    { title: 'Electra Distortion', href: '/guitars/pedals/electra', description: 'One-transistor distortion with a toggle for 1N4148, LED, or no clipping. Prototype design, not built yet.', type: DocIndexItemType.Internal },
    { title: 'Bosstone', href: '/guitars/pedals/bosstone', description: 'High-gain NPN fuzz with a PNP output buffer and switchable clipping. Prototype design, not built yet.', type: DocIndexItemType.Internal },
];
