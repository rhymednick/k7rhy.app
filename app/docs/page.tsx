import React from 'react';

import { DocPage } from '@/components/doc/doc-page';
import { DocIndexCard, DocIndexItemType, DocIndexCardProps } from '@/components/doc/doc-index-card';
import { Layers, Wrench } from 'lucide-react';

const DocTitle = 'Documentation';

const relayPlatformProps: DocIndexCardProps = {
    title: 'Relay Guitar Platform',
    description: 'Build documentation for the Relay family of 3D-printed electric guitars. Shared body construction, model-specific electronics.',
    icon: Layers,
    items: [
        {
            title: 'Platform Overview & Models',
            href: '/relay',
            description: 'What the Relay platform is, how the model lineup is organized, and what is planned.',
            type: DocIndexItemType.Internal,
        },
        {
            title: 'Choosing a model',
            href: '/docs/relay/printing/choose-model',
            description: 'Pick a direction in the lineup, then follow platform printing and build guides — with links to every model page.',
            type: DocIndexItemType.Internal,
        },
    ],
};

const electronicsProps: DocIndexCardProps = {
    title: 'Ham Radio & Electronics',
    description: 'Assembly guides and technical references for the K7RHY ham radio kits.',
    icon: Wrench,
    items: [
        {
            title: '20W Dummy Load',
            href: '/docs/dl20w_bnc',
            description: 'How to assemble the 20W Dummy Load Kit.',
            type: DocIndexItemType.Internal,
        },
        {
            title: 'Measuring Power',
            href: '/docs/power_measurement',
            description: 'How to measure RF power using a multimeter on dummy load kits.',
            type: DocIndexItemType.Internal,
        },
    ],
};

export default async function Page() {
    return (
        <DocPage title={DocTitle}>
            <DocIndexCard {...relayPlatformProps} />
            <DocIndexCard {...electronicsProps} />
        </DocPage>
    );
}
