import React from 'react';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage } from '@/components/doc/doc-page';
import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
import { loadRelayPlatformSectionPage, buildRelayPlatformBreadcrumbs } from '@/lib/relay';
import { relayPlatformNav } from '@/config/relay-nav';

export async function renderPlatformSectionPage(slug: string[]) {
    let content: string;
    let frontmatter: { title: string; description: string };
    try {
        ({ content, frontmatter } = loadRelayPlatformSectionPage(slug));
    } catch {
        notFound();
    }
    const breadcrumbs = buildRelayPlatformBreadcrumbs(slug, relayPlatformNav);
    return (
        <DocPage title={frontmatter!.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
            <MDXRemote source={content!} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </DocPage>
    );
}

export function generatePlatformSectionMetadata(slug: string[]) {
    try {
        const { frontmatter } = loadRelayPlatformSectionPage(slug);
        return {
            title: `${frontmatter.title} | Relay Guitar Platform | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}
