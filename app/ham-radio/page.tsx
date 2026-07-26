import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DocIndexCard, DocIndexItemType } from '@/components/doc/doc-index-card';
import { PageHero } from '@/components/shared/page-hero';
import { Radio } from 'lucide-react';

export default function HamRadioPage() {
    return (
        <main className="flex min-h-screen flex-col gap-10 px-4 pb-24 pt-8 md:px-12 lg:px-20">
            <PageHero
                badge="Ham Radio"
                title="Build, measure, and understand radio gear."
                description="Kits, experiments, and practical references for the amateur-radio bench."
                actions={
                    <Button asChild>
                        <Link href="/shop/ham-radio-kits">Shop ham radio kits</Link>
                    </Button>
                }
            />
            <DocIndexCard
                title="Ham Radio Documentation"
                description="Assembly guides and technical references for K7RHY radio projects."
                icon={Radio}
                items={[
                    { title: '20W Dummy Load', href: '/docs/dl20w_bnc', description: 'Assemble and use the 20W Dummy Load Kit.', type: DocIndexItemType.Internal },
                    { title: 'Measuring Power', href: '/docs/power_measurement', description: 'Measure RF power with a multimeter and dummy load.', type: DocIndexItemType.Internal },
                ]}
            />
        </main>
    );
}
