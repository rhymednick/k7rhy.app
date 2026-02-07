import React from 'react';

import { DocPage } from '@/components/doc/doc-page';
import { DocIndexCard, DocIndexItemType, DocIndexCardProps } from '@/components/doc/doc-index-card';
import { Wrench, BookOpen } from 'lucide-react';

const DocTitle = 'Documentation';

const docAssemblyGuideProps: DocIndexCardProps = {
    title: 'Assembly Guides',
    description: 'Collection of assembly guides for the K7RHY ham radio kits.',
    icon: Wrench,
    items: [
        {
            title: '20W Dummy Load',
            href: '/docs/dl20w_bnc',
            description: 'How to assemble the 20W Dummy Load Kit.',
            type: DocIndexItemType.Internal,
        },
    ],
};
const docTechGuideProps: DocIndexCardProps = {
    title: 'Technical Guides',
    description: 'Background technical information related to the operation of the K7RHY ham radio kits.',
    icon: BookOpen,
    items: [
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
            <DocIndexCard {...docAssemblyGuideProps} />
            <DocIndexCard {...docTechGuideProps} />
        </DocPage>
    );
}
