import React from 'react';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage } from '@/components/doc/doc-page';
import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
import { loadRelayVoicingPage, buildRelayVoicingBreadcrumbs, type RelayPageFrontmatter } from '@/lib/relay';
import { relayVoicings } from '@/config/relay-voicings';

type Props = { params: Promise<{ slug: string; page: string }> };

// Only registry-declared doc pages are routable; unlisted content never leaks.
export const dynamicParams = false;

export function generateStaticParams() {
    return relayVoicings.flatMap((voicing) => voicing.docs.filter((doc) => !doc.href).map((doc) => ({ slug: voicing.slug, page: doc.slug })));
}

export async function generateMetadata({ params }: Props) {
    const { slug, page } = await params;
    try {
        const { frontmatter } = loadRelayVoicingPage(slug, [page]);
        return {
            title: `${frontmatter.title} | Relay Guitar | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}

export default async function RelayVoicingDocPage({ params }: Props) {
    const { slug, page } = await params;
    let content: string;
    let frontmatter: RelayPageFrontmatter;
    try {
        ({ content, frontmatter } = loadRelayVoicingPage(slug, [page]));
    } catch {
        notFound();
    }
    const breadcrumbs = buildRelayVoicingBreadcrumbs(slug, [page], relayVoicings);
    return (
        <DocPage title={frontmatter!.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
            <MDXRemote source={content!} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </DocPage>
    );
}
