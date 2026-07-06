import React from 'react';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage } from '@/components/doc/doc-page';
import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
import { loadRelayPlatformSectionPage, buildRelayVoicingBreadcrumbs, type RelayPageFrontmatter } from '@/lib/relay';
import { relayVoicings } from '@/config/relay-voicings';

type Props = { params: Promise<{ voicing: string; page: string }> };

export function generateStaticParams() {
    return relayVoicings.flatMap((voicing) => voicing.docs.filter((doc) => !doc.href).map((doc) => ({ voicing: voicing.slug, page: doc.slug })));
}

export async function generateMetadata({ params }: Props) {
    const { voicing, page } = await params;
    try {
        const { frontmatter } = loadRelayPlatformSectionPage([voicing, page]);
        return {
            title: `${frontmatter.title} | Relay Guitar | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}

export default async function RelayVoicingSubPage({ params }: Props) {
    const { voicing, page } = await params;
    let content: string;
    let frontmatter: RelayPageFrontmatter;
    try {
        ({ content, frontmatter } = loadRelayPlatformSectionPage([voicing, page]));
    } catch {
        notFound();
    }
    const breadcrumbs = buildRelayVoicingBreadcrumbs(voicing, [page], relayVoicings);
    return (
        <DocPage title={frontmatter!.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
            <MDXRemote source={content!} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </DocPage>
    );
}
