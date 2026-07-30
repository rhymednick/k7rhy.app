import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DocIndexCard, DocIndexItemType } from '@/components/doc/doc-index-card';
import { PageHero } from '@/components/shared/page-hero';
import { Guitar } from 'lucide-react';

export default function GuitarsPage() {
    return (
        <main className="flex min-h-screen flex-col gap-10 px-4 pb-24 pt-8 md:px-12 lg:px-20">
            <PageHero
                badge="Guitars"
                title="Instruments, platforms, and experiments in tone."
                description="Explore current and future K7RHY guitar platforms, build documentation, and available instruments."
                actions={
                    <Button asChild>
                        <Link href="/shop/guitars">Shop guitars</Link>
                    </Button>
                }
            />
            <DocIndexCard
                title="Guitar Platforms"
                description="Each platform gathers its own design story, voicings, parts, wiring, and build guidance."
                icon={Guitar}
                items={[
                    { title: 'Relay', href: '/guitars/relay', description: 'A modular 3D-printed guitar platform with distinct voicings and an open build process.', type: DocIndexItemType.Internal },
                    { title: 'Coupeville', href: '/guitars/coupeville', description: 'Hand-built instruments organized around distinct voices and playing styles.', type: DocIndexItemType.Internal },
                ]}
            />
        </main>
    );
}
