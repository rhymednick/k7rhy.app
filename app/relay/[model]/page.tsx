import React from 'react';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage } from '@/components/doc/doc-page';
import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
import { loadRelayPage, buildRelayBreadcrumbs, type RelayPageFrontmatter } from '@/lib/relay';
import { relayNav } from '@/config/relay-nav';
import { RelayModelOverview } from '@/components/relay/relay-model-overview';

type Props = { params: Promise<{ model: string }> };

export function generateStaticParams() {
    return Object.keys(relayNav).map((model) => ({ model }));
}

export async function generateMetadata({ params }: Props) {
    const { model } = await params;
    try {
        const { frontmatter } = loadRelayPage(model, []);
        return {
            title: `${frontmatter.title} | Relay Guitar | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}

export default async function RelayModelPage({ params }: Props) {
    const { model } = await params;
    let content: string;
    let frontmatter: RelayPageFrontmatter;
    try {
        ({ content, frontmatter } = loadRelayPage(model, []));
    } catch {
        notFound();
    }
    const breadcrumbs = buildRelayBreadcrumbs(model, [], relayNav);
    return (
        <DocPage title={frontmatter!.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
            <RelayModelOverview modelKey={frontmatter!.model ?? model}>
                <MDXRemote source={content!} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
            </RelayModelOverview>
        </DocPage>
    );
}
