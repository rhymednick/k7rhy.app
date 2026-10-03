import React from 'react';
import type { Metadata } from 'next';
import { Zap } from 'lucide-react';
import { DocIndexCard } from '@/components/doc/doc-index-card';
import { DocPage, MyBreadcrumbs } from '@/components/doc/doc-page';
import { pedalGuides } from '@/config/pedal-guides';

// Linked from /guitars, but kept out of search results until the kits are released.
export const metadata: Metadata = {
    title: 'Pedals | K7RHY',
    robots: { index: false, follow: false },
};

export default function PedalsPage() {
    const breadcrumbItems = [{ href: '/guitars', label: 'Guitars' }, { label: 'Pedals' }];

    return (
        <DocPage title="Pedals" subTitle="Build guides for guitar effects pedals on stripboard." breadcrumbs={<MyBreadcrumbs items={breadcrumbItems} />}>
            <DocIndexCard title="Build Guides" description="Each guide covers parts, board layout, wiring, voltage checks, and troubleshooting." icon={Zap} items={pedalGuides} />
        </DocPage>
    );
}
