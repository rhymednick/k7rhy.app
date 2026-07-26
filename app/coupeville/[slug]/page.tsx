import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage, MyBreadcrumbs } from '@/components/doc/doc-page';
import { coupevilleModels, getCoupevilleModel } from '@/config/coupeville-models';
import { loadCoupevilleModelPage, type CoupevillePageFrontmatter } from '@/lib/coupeville';

type Props = { params: Promise<{ slug: string }> };

// Only registry models are routable.
export const dynamicParams = false;

export function generateStaticParams() {
    return coupevilleModels.map((model) => ({ slug: model.slug }));
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    try {
        const { frontmatter } = loadCoupevilleModelPage(slug);
        return {
            title: `${frontmatter.title} | Coupeville | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}

export default async function CoupevilleModelPage({ params }: Props) {
    const { slug } = await params;
    const model = getCoupevilleModel(slug);
    if (!model) notFound();

    let content: string;
    let frontmatter: CoupevillePageFrontmatter;
    try {
        ({ content, frontmatter } = loadCoupevilleModelPage(slug));
    } catch {
        notFound();
    }

    const breadcrumbs = [{ label: 'Coupeville', href: '/coupeville' }, { label: model!.name }];
    return (
        <DocPage title={frontmatter!.title} breadcrumbs={<MyBreadcrumbs items={breadcrumbs} />}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{model!.tagline}</p>
            <p className="mt-1 text-sm text-muted-foreground/70">{model!.genres}</p>
            <div className="mt-6">
                <MDXRemote source={content!} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
            </div>
            <aside className="mt-8 rounded-xl border border-sky-200 bg-sky-50/60 p-5 dark:border-sky-900/70 dark:bg-sky-950/20">
                <p className="font-semibold text-foreground">Own a Coupeville {model!.name.replace('Coupeville ', '')}</p>
                <p className="mt-1 text-sm text-muted-foreground">Instruments are listed as they&apos;re ready — and I build to order.</p>
                <Link href="/products/coupeville" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sky-700 underline-offset-4 hover:underline dark:text-sky-300">
                    See Coupeville instruments
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
            </aside>
        </DocPage>
    );
}
