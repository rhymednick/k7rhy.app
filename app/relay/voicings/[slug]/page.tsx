import React from 'react';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage } from '@/components/doc/doc-page';
import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
import { loadRelayVoicingPage, buildRelayVoicingBreadcrumbs, type RelayPageFrontmatter } from '@/lib/relay';
import { relayNav } from '@/config/relay-nav';
import { RelayVoicingOverview } from '@/components/relay/relay-voicing-overview';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
    return Object.keys(relayNav).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    try {
        const { frontmatter } = loadRelayVoicingPage(slug, []);
        return {
            title: `${frontmatter.title} | Relay Guitar | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}

export default async function RelayVoicingPage({ params }: Props) {
    const { slug } = await params;
    let content: string;
    let frontmatter: RelayPageFrontmatter;
    try {
        ({ content, frontmatter } = loadRelayVoicingPage(slug, []));
    } catch {
        notFound();
    }
    const breadcrumbs = buildRelayVoicingBreadcrumbs(slug, [], relayNav);
    return (
        <DocPage title={frontmatter!.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
            <RelayVoicingOverview voicingSlug={frontmatter!.voicing ?? slug}>
                <MDXRemote source={content!} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
            </RelayVoicingOverview>
        </DocPage>
    );
}
